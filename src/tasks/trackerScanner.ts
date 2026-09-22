import db, { getDb } from '../db/sqlite';
import { scrapeAndAnalyzeCompliance } from '../ai/index.js';
import { runExclusiveJob } from './jobCoordinator';

export const startTrackerScanner = () => {
  // Run every minute
  setInterval(async () => {
    try {
      // Exclusive lease: only one tracker daemon performs scheduled audits at a time.
      await runExclusiveJob(
        { jobKey: 'job:tracker:scan', ttlMs: 120000, heartbeatIntervalMs: 30000, tag: 'scheduled-audit-sweep' },
        async () => {
          const activeDb = getDb() || db;
          if (!activeDb || typeof activeDb.prepare !== 'function') return;

          console.log('[TRACKER_SCANNER] Checking for scheduled audits...');
          const schedules = activeDb.prepare('SELECT * FROM recurring_schedules WHERE status = ?').all('ACTIVE');
          
          const now = new Date();
          const currentDay = now.getDay();
          const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

          for (const schedule of schedules as any[]) {
            if (schedule.day_of_month === currentDay && schedule.time === currentTime) {
              console.log(`[TRACKER_SCANNER] Starting scheduled scan for ${schedule.url}...`);
              const url = schedule.url;
              
              // Perform scan (mocked)
              const result = {
                url,
                timestamp: new Date().toISOString(),
                summary: `Automated scheduled audit complete for ${url}.`,
                piiFound: [],
                trackersFound: [
                  { name: 'Generic Tracker', type: 'Marketing', domain: 'example.com', description: 'Detected script' }
                ],
                riskScore: 30
              };
              
              const trackers = result.trackersFound || [];
              const riskScore = result.riskScore || 0;
              
              const scanId = `scan-${Date.now()}`;
              activeDb.prepare(`
                INSERT INTO scan_results (scan_id, risk_score, decision_status, flags)
                VALUES (?, ?, ?, ?)
              `).run(scanId, riskScore, riskScore > 75 ? 'REJECTED' : 'APPROVED', JSON.stringify(trackers));
              
              activeDb.prepare(`
                INSERT INTO recurring_runs (id, schedule_id, url, run_date, compliance_score, risk_score, trackers_found, status, resolved_issues_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).run(
                `run-${Date.now()}`,
                schedule.id,
                url,
                new Date().toISOString(),
                100 - riskScore,
                riskScore,
                trackers.length,
                'COMPLETED',
                0
              );
              
              db.prepare(`UPDATE recurring_schedules SET last_run_date = ? WHERE id = ?`).run(new Date().toISOString(), schedule.id);
            }
          }
        }
      );
    } catch (e) {
      console.error('[TRACKER_SCANNER] Error during automated scan:', e);
    }
  }, 60 * 1000); 
};
