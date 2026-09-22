process.env.DUCKDB_IN_MEMORY = 'true';
import { PolicyEngineService } from './src/services/ai-policy-engine';
import db, { initDb } from './src/db/sqlite';
import { initEventDb } from './src/db/event-db';
import { initDuckDb } from './src/db/duckdb';
import * as crypto from 'crypto';

async function verifySystem() {
  console.log('--- STARTING REGULATORY SYSTEM VERIFICATION ---');
  
  try {
    // 1. Init DBs
    initDb();
    initEventDb();
    await initDuckDb();
    console.log('[OK] Databases Initialized');

    // 2. Test Detection (GDPR, Cyber, AI Act)
    console.log('\n--- PHASE 1: DETECTION VERIFICATION ---');
    const testModules = [
      { 
        name: 'storage-logic.ts', 
        content: "localStorage.setItem('email', userEmail);", 
        expectedViolation: 'GDPR Article 32'
      },
      { 
        name: 'query-builder.ts', 
        content: "db.prepare(`SELECT * FROM users WHERE id = ${id}`).get();", 
        expectedViolation: 'SQL Injection'
      },
      { 
        name: 'ai-dispatcher.ts', 
        content: "approveDirectPayout(payoutPayload);", 
        expectedViolation: 'EU AI Act Article 14'
      }
    ];

    for (const mod of testModules) {
      const violations = PolicyEngineService.scanCodeContent('test-tenant', mod.name, mod.content);
      const found = violations.some(v => v.articleMapping.includes(mod.expectedViolation));
      if (found) {
        console.log(`[PASS] Detected ${mod.expectedViolation} in ${mod.name}`);
      } else {
        console.error(`[FAIL] Could not detect ${mod.expectedViolation} in ${mod.name}`);
        process.exit(1);
      }
    }

    // 3. Test Auto-Fix
    console.log('\n--- PHASE 2: AUTO-FIX VERIFICATION ---');
    const sqlViolation = PolicyEngineService.scanCodeContent('test-tenant', 'db.ts', "db.prepare(`SELECT * FROM users WHERE id = ${id}`).get();")[0];
    const { patchedCode } = PolicyEngineService.applyAutoPatch(
      "db.prepare(`SELECT * FROM users WHERE id = ${id}`).get();",
      sqlViolation
    );

    if (patchedCode.includes('Parameterized Query') && patchedCode.includes('?')) {
      console.log('[PASS] Auto-Fix applied successfully for SQL Injection');
    } else {
      console.error('[FAIL] Auto-Fix failed for SQL Injection');
      process.exit(1);
    }

    // 4. Test Audit Logging
    console.log('\n--- PHASE 3: AUDIT LOGGING VERIFICATION ---');
    const scanId = 'VERIFY-SCAN-001';
    PolicyEngineService.writeAuditEvidence({
      tenantId: 'test-tenant',
      jobId: scanId,
      action: 'SCAN',
      filePath: 'test.ts',
      severity: 'INFO',
      articleMapping: 'VERIFICATION_RUN',
      patchApplied: false,
      verificationResult: 'PASSED',
      evidenceTrail: 'verification-run-evidence'
    });
    
    const auditEntry = db.prepare('SELECT * FROM audit_events WHERE scan_id = ?').get(scanId);
    if (auditEntry) {
      console.log('[PASS] Audit evidence recorded in SQLite');
    } else {
      console.error('[FAIL] Audit evidence not found in SQLite');
      process.exit(1);
    }

    console.log('\n--- SYSTEM VERIFIED: ALL REGULATORY ENGINES OPERATIONAL ---');
  } catch (err) {
    console.error('[CRITICAL] Verification failed with error:', err);
    process.exit(1);
  }
}

verifySystem();
