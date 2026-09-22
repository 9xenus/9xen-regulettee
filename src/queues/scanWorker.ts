import { SovereignScanJob, ScannerResult, ScannerType } from '../types/scanning';
import { PlaywrightScanner } from '../scanners/PlaywrightScanner';
import { TrivyScanner } from '../scanners/TrivyScanner';
import { geminiLegalMapper } from '../lib/geminiLegalMapper';
import { enforcementService } from '../lib/enforcementService';
import { EnforcementStep } from '../types/compliance';
import { cacheTier } from '../db/cache-tier';
import { runExclusiveJob } from '../tasks/jobCoordinator';

export const SOVEREIGN_SCAN_QUEUE = 'sovereign_scan_queue';

/**
 * In-Memory Mock Queue backed by the Redis-alternative cache layer
 * (Replaces BullMQ since Redis is not available in the sandbox)
 */
class InMemoryQueue {
  async add(jobName: string, data: SovereignScanJob) {
    // Deduplicate identical scans for the same entity within a 5-minute window
    const scannerFp = (data.requested_scanners || []).slice().sort().join(',');
    const dedupeKey = `scan:dedupe:${data.entity_id}:${scannerFp}`;
    const claimed = await cacheTier.setIfAbsent(dedupeKey, { ts: Date.now() }, 300);
    if (!claimed) {
      console.log(`[Queue] Skipped duplicate scan job for entity ${data.entity_id} (identical scan already queued within the last 5 minutes).`);
      return { id: `dedupe_${Date.now()}` };
    }

    console.log(`[Queue] Added job ${jobName} for entity ${data.entity_id}`);
    
    // Process asynchronously to simulate background worker
    setTimeout(() => {
      processJob({ id: `job_${Date.now()}`, data });
    }, 100);
    
    return { id: `job_${Date.now()}` };
  }
}

export const scanQueue = new InMemoryQueue();

// 3. Worker orchestrator logic
async function processJob(job: { id: string; data: SovereignScanJob }) {
  // Exclusive-leader lease: guarantee a scan runs once, even if duplicate jobs arrive.
  try {
    await runExclusiveJob(
      { jobKey: `job:scan:${job.data.entity_id}`, ttlMs: 10 * 60 * 1000, heartbeatIntervalMs: 30000, tag: `scan-${job.id}` },
      async () => {
      console.log(`[Worker] Picked up scan job ${job.id} for entity ${job.data.entity_id}`);
      
      const startTime = Date.now();
      const results: ScannerResult[] = [];
      const { requested_scanners } = job.data;
      
      console.log(`[Worker] Running scanners: ${requested_scanners.join(', ')}`);
      
      // Step 1: Execute Requested Scanners Concurrently
      const scanPromises = [];
      
      if (requested_scanners.includes(ScannerType.PLAYWRIGHT)) {
        scanPromises.push(new PlaywrightScanner().run(job.data));
      }
      if (requested_scanners.includes(ScannerType.TRIVY)) {
        scanPromises.push(new TrivyScanner().run(job.data));
      }
      
      // Await all parallel scans
      const completedScans = await Promise.all(scanPromises);
      results.push(...completedScans);

      // Step 2: Aggregate & Normalize Results
      const allViolations = results.flatMap(r => r.violations);
      console.log(`[Worker] Aggregated ${allViolations.length} raw signals from tools.`);
      
      if (allViolations.length > 0 && job.data.case_id) {
        // Step 3: Pass normalized results to Gemini API Legal Mapping Engine
        console.log('[Worker] Pushing raw signals to Gemini AI Rules Engine...');
        const legalDossier = await geminiLegalMapper(job.data.case_id, allViolations);

        // Step 4: Hook into FSM (EnforcementStateMachine) to trigger VIOLATION_DETECTED
        console.log('[Worker] Updating Enforcement FSM and ImmuDB Ledger...');
        
        await enforcementService.transition(
          job.data.case_id, 
          EnforcementStep.VIOLATION_DETECTED, 
          legalDossier
        );
      } else {
        console.log('[Worker] No violations found or case_id missing. Closing out scan.');
      }

      console.log(`[Worker] Job ${job.id} completed successfully in ${Date.now() - startTime}ms.`);
      });
  } catch (err) {
    console.error(`[Worker] Job ${job.id} failed:`, err);
  }
}

export function startScanWorker() {
  console.log('[Worker] Starting Sovereign AI Scanning Orchestrator (Redis-alternative In-Memory Mode)...');
  // In-memory processor is already listening via the mock Queue
}
