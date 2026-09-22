import { initDb, getDb } from '../src/db/sqlite';
import { v4 as uuidv4 } from 'uuid';

export async function runPhase2EnfMigrationTests() {
  console.log('=== Running Phase 2 (Deliverable 6/38) Enforcement Migrations Test Suite ===');
  let failures = 0;

  try {
    initDb();
    const db = getDb();

    // 1. Verify table existence
    const tables = ['enf_cases', 'enf_actions', 'enf_evidence_vault', 'enf_sla_deadlines', 'enf_dispatches'];
    for (const tbl of tables) {
      const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tbl);
      if (!row) {
        console.error(`❌ FAIL: Table ${tbl} does not exist in schema`);
        failures++;
      } else {
        console.log(`✅ Table ${tbl} successfully created.`);
      }
    }

    // 2. Test enf_cases insertion
    const caseId = `case_${uuidv4().substring(0, 8)}`;
    const caseNum = `ENF-BD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    db.prepare(`
      INSERT INTO enf_cases (id, case_number, entity_id, law_id, country_id, stage, severity, title, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      caseId,
      caseNum,
      'ent_test_01',
      'LAW_BTRC_SEC_57',
      'BD',
      'intake',
      'HIGH',
      'Unlicensed Financial Gateway Operation',
      'Automated intake from Graph Intelligence serial operator detection'
    );

    const insertedCase = db.prepare('SELECT * FROM enf_cases WHERE id = ?').get(caseId) as any;
    if (!insertedCase || insertedCase.case_number !== caseNum || insertedCase.stage !== 'intake') {
      console.error('❌ FAIL: Inserted case record does not match expected values', insertedCase);
      failures++;
    } else {
      console.log(`✅ Inserted and retrieved enforcement case: ${insertedCase.case_number} (${insertedCase.stage}).`);
    }

    // 3. Test enf_actions insertion (Dual Approval workflow)
    const actionId = `act_${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO enf_actions (
        id, case_id, action_type, parameters_json, status, approved_by_1, approved_by_2
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      actionId,
      caseId,
      'show_cause_notice',
      JSON.stringify({ statutory_deadline_days: 7, remedy_terms: 'Submit valid BTRC ISP gateway certificate' }),
      'approved',
      'officer_mustafa',
      'director_hassan'
    );

    const insertedAction = db.prepare('SELECT * FROM enf_actions WHERE id = ?').get(actionId) as any;
    if (!insertedAction || insertedAction.approved_by_2 !== 'director_hassan') {
      console.error('❌ FAIL: Inserted action record does not match expected values', insertedAction);
      failures++;
    } else {
      console.log(`✅ Inserted enforcement action: ${insertedAction.action_type} with dual approval (${insertedAction.approved_by_1}, ${insertedAction.approved_by_2}).`);
    }

    // 4. Test enf_evidence_vault insertion (RFC 3161 SHA-256 vault)
    const vaultId = `vlt_${uuidv4().substring(0, 8)}`;
    const sha256Hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    db.prepare(`
      INSERT INTO enf_evidence_vault (
        id, case_id, file_hash_sha256, mime_type, s3_key, timestamp_utc, rfc3161_token, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      vaultId,
      caseId,
      sha256Hash,
      'application/pdf',
      `evidence/2026/bd/${caseId}/packet_01.pdf`,
      new Date().toISOString(),
      'RFC3161_TOKEN_SIGNATURE_HEX_DEMO',
      JSON.stringify({ source: 'packet_capture', notary: 'GovPKI' })
    );

    const insertedVault = db.prepare('SELECT * FROM enf_evidence_vault WHERE id = ?').get(vaultId) as any;
    if (!insertedVault || insertedVault.file_hash_sha256 !== sha256Hash) {
      console.error('❌ FAIL: Evidence vault record does not match expected hash', insertedVault);
      failures++;
    } else {
      console.log(`✅ Evidence vault record verified with SHA-256 hash: ${insertedVault.file_hash_sha256.substring(0, 16)}...`);
    }

    // 5. Test enf_sla_deadlines insertion (SLA hierarchy)
    const slaId = `sla_${uuidv4().substring(0, 8)}`;
    const dueDate = new Date(Date.now() + 7 * 86400000).toISOString();
    db.prepare(`
      INSERT INTO enf_sla_deadlines (
        id, case_id, action_id, deadline_type, due_at, escalation_level, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      slaId,
      caseId,
      actionId,
      'show_cause_response',
      dueDate,
      0,
      'active'
    );

    const insertedSla = db.prepare('SELECT * FROM enf_sla_deadlines WHERE id = ?').get(slaId) as any;
    if (!insertedSla || insertedSla.deadline_type !== 'show_cause_response') {
      console.error('❌ FAIL: SLA deadline record does not match', insertedSla);
      failures++;
    } else {
      console.log(`✅ SLA deadline record verified for ${insertedSla.deadline_type} due at ${insertedSla.due_at}.`);
    }

    // 6. Test enf_dispatches insertion
    const dispatchId = `disp_${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO enf_dispatches (
        id, action_id, channel, recipient, payload_json, status, delivery_proof_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      dispatchId,
      actionId,
      'email',
      'compliance@quickpay.bd',
      JSON.stringify({ notice_id: actionId, url: 'https://regtech.gov.bd/notice/' + actionId }),
      'delivered',
      'HASH_PROOF_TLS_SMTP_250_OK'
    );

    const insertedDisp = db.prepare('SELECT * FROM enf_dispatches WHERE id = ?').get(dispatchId) as any;
    if (!insertedDisp || insertedDisp.status !== 'delivered') {
      console.error('❌ FAIL: Dispatch record does not match', insertedDisp);
      failures++;
    } else {
      console.log(`✅ Dispatch record verified on channel '${insertedDisp.channel}' with delivery proof.`);
    }

    // 7. Verify index existence
    const indexes = [
      'idx_enf_cases_entity',
      'idx_enf_cases_stage',
      'idx_enf_actions_case',
      'idx_enf_evidence_hash',
      'idx_enf_sla_due',
      'idx_enf_dispatches_action'
    ];
    for (const idx of indexes) {
      const row = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name=?").get(idx);
      if (!row) {
        console.error(`❌ FAIL: Index ${idx} does not exist`);
        failures++;
      } else {
        console.log(`✅ Index ${idx} verified.`);
      }
    }

  } catch (err: any) {
    console.error(`❌ FAIL: Exception during enforcement migration test: ${err.message}`);
    failures++;
  }

  if (failures === 0) {
    console.log('\n🎉 ALL PHASE 2 (DELIVERABLE 6/38) ENFORCEMENT MIGRATION TESTS PASSED (0 failures).\n');
  } else {
    console.error(`\n❌ PHASE 2 ENFORCEMENT MIGRATION TESTS FAILED with ${failures} error(s).\n`);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('test-phase2-enf-migrations.ts')) {
  runPhase2EnfMigrationTests();
}
