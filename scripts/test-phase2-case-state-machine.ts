import { initDb, getDb } from '../src/db/sqlite';
import { caseStateMachine } from '../src/services/caseStateMachineService';
import { v4 as uuidv4 } from 'uuid';

export async function runPhase2CaseStateMachineTests() {
  console.log('=== Running Phase 2 (Deliverable 7/38) Case State Machine Test Suite ===');
  let failures = 0;

  try {
    initDb();
    const db = getDb();

    // 1. Create a new case
    const newCase = await caseStateMachine.createCase({
      entityId: 'ent_bkash_merchant_99',
      lawId: 'LAW_BTRC_SEC_57',
      countryId: 'BD',
      severity: 'HIGH',
      title: 'Suspicious Cross-Border Remittance Gateways',
      summary: 'Automated graph intelligence flagged serial unregistered SIM cards.',
      assignedOfficerId: 'officer_tanvir',
    });

    if (!newCase || newCase.stage !== 'intake' || !newCase.case_number.startsWith('ENF-BD-')) {
      console.error('❌ FAIL: Failed to create case or case number format is invalid', newCase);
      failures++;
    } else {
      console.log(`✅ Case created: ${newCase.case_number} (${newCase.stage}, severity: ${newCase.severity}).`);
    }

    // 2. Test illegal transition (intake -> hearing directly)
    const directHearing = await caseStateMachine.transitionStage(
      newCase.id,
      'hearing',
      'officer_tanvir'
    );

    if (directHearing.success) {
      console.error('❌ FAIL: Guard failed to prevent illegal jump from intake directly to hearing.');
      failures++;
    } else {
      console.log(`✅ Guard verified: Illegal direct jump blocked (${directHearing.error}).`);
    }

    // 3. Test legal transition (intake -> evidence_review)
    const toReview = await caseStateMachine.transitionStage(
      newCase.id,
      'evidence_review',
      'officer_tanvir'
    );

    if (!toReview.success || toReview.newStage !== 'evidence_review') {
      console.error('❌ FAIL: Legal transition intake -> evidence_review failed', toReview);
      failures++;
    } else {
      console.log(`✅ Transitioned case to 'evidence_review'.`);
    }

    // 4. Test guard: evidence_review -> hearing without evidence
    const hearingWithoutEvidence = await caseStateMachine.transitionStage(
      newCase.id,
      'hearing',
      'officer_tanvir'
    );

    if (hearingWithoutEvidence.success) {
      console.error('❌ FAIL: Guard failed to block hearing transition without evidence vault items.');
      failures++;
    } else {
      console.log(`✅ Guard verified: Blocked hearing transition with 0 evidence items (${hearingWithoutEvidence.error}).`);
    }

    // 5. Seed an evidence item into vault and test transition again
    const evidenceId = `vlt_${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO enf_evidence_vault (
        id, case_id, file_hash_sha256, mime_type, s3_key, timestamp_utc, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      evidenceId,
      newCase.id,
      'f2d9c1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
      'application/pdf',
      `evidence/cases/${newCase.id}/forensic_packet.pdf`,
      new Date().toISOString(),
      JSON.stringify({ source: 'packet_capture', notary: 'GovPKI' })
    );

    const hearingWithEvidence = await caseStateMachine.transitionStage(
      newCase.id,
      'hearing',
      'officer_tanvir'
    );

    if (!hearingWithEvidence.success || hearingWithEvidence.newStage !== 'hearing') {
      console.error('❌ FAIL: Transition to hearing failed even with evidence item in vault', hearingWithEvidence);
      failures++;
    } else {
      console.log(`✅ Transition to 'hearing' succeeded after adding verified evidence item.`);
    }

    // 6. Test guard: hearing -> order_issued without approved action
    const orderWithoutApprovedAction = await caseStateMachine.transitionStage(
      newCase.id,
      'order_issued',
      'officer_tanvir'
    );

    if (orderWithoutApprovedAction.success) {
      console.error('❌ FAIL: Guard failed to block order_issued transition without approved actions.');
      failures++;
    } else {
      console.log(`✅ Guard verified: Blocked order_issued without approved actions (${orderWithoutApprovedAction.error}).`);
    }

    // 7. Propose a High-Impact Action (fine / suspension)
    const fineAction = await caseStateMachine.proposeAction({
      caseId: newCase.id,
      actionType: 'fine',
      parameters: { amount_bdt: 5000000, statutory_section: 'Sec 57(2)' },
      proposedBy: 'officer_tanvir',
    });

    if (!fineAction || fineAction.status !== 'pending_approval') {
      console.error('❌ FAIL: Proposed action not created in pending_approval status', fineAction);
      failures++;
    } else {
      console.log(`✅ High-impact action proposed: ${fineAction.action_type} (Status: ${fineAction.status}).`);
    }

    // 8. Approver 1 signs
    const app1 = await caseStateMachine.approveAction(fineAction.id, 'officer_tanvir');
    if (!app1.success || app1.status !== 'pending_approval' || app1.approvalsCount !== 1) {
      console.error('❌ FAIL: First approval did not record properly', app1);
      failures++;
    } else {
      console.log(`✅ First approval recorded for ${fineAction.id}. Awaiting 2nd independent signatory.`);
    }

    // 9. Self-Approval Violation Check (Approver 1 attempts to sign as Approver 2)
    const selfApp2 = await caseStateMachine.approveAction(fineAction.id, 'officer_tanvir');
    if (selfApp2.success) {
      console.error('❌ FAIL: Dual-Signatory security guard allowed self-approval!');
      failures++;
    } else {
      console.log(`✅ Dual-Signatory guard verified: Self-approval attempt rejected (${selfApp2.message}).`);
    }

    // 10. Approver 2 (Distinct Director) signs
    const app2 = await caseStateMachine.approveAction(fineAction.id, 'director_hassan');
    if (!app2.success || app2.status !== 'approved' || app2.approvalsCount !== 2) {
      console.error('❌ FAIL: Second distinct approval failed to transition action to approved', app2);
      failures++;
    } else {
      console.log(`✅ Dual approval completed! Action ${fineAction.id} signed by ${app2.approvedBy1} and ${app2.approvedBy2}. Status: ${app2.status}.`);
    }

    // 11. Test Standard Action Single-Signatory Approval (warning_letter)
    const warnAction = await caseStateMachine.proposeAction({
      caseId: newCase.id,
      actionType: 'warning_letter',
      parameters: { remedy_period_days: 7 },
      proposedBy: 'officer_tanvir',
    });

    const warnApp = await caseStateMachine.approveAction(warnAction.id, 'officer_tanvir');
    if (!warnApp.success || warnApp.status !== 'approved' || warnApp.approvalsCount !== 1) {
      console.error('❌ FAIL: Standard action did not approve with single signatory', warnApp);
      failures++;
    } else {
      console.log(`✅ Standard action (${warnAction.action_type}) approved with single signatory.`);
    }

    // 12. Move to order_issued now that approved actions exist
    const toOrder = await caseStateMachine.transitionStage(
      newCase.id,
      'order_issued',
      'director_hassan'
    );

    if (!toOrder.success || toOrder.newStage !== 'order_issued') {
      console.error('❌ FAIL: Transition to order_issued failed after action approval', toOrder);
      failures++;
    } else {
      console.log(`✅ Transition to 'order_issued' succeeded with approved actions.`);
    }

    // 13. Progress through Appeal -> Enforcement -> Closed
    const toAppeal = await caseStateMachine.transitionStage(newCase.id, 'appeal', 'tribunal_registrar');
    const toEnforce = await caseStateMachine.transitionStage(newCase.id, 'enforcement', 'director_hassan');
    const toClose = await caseStateMachine.transitionStage(newCase.id, 'closed', 'director_hassan', 'Fine paid and gateway deregistered.');

    if (!toAppeal.success || !toEnforce.success || !toClose.success) {
      console.error('❌ FAIL: Lifecycle progression failed in late stages', { toAppeal, toEnforce, toClose });
      failures++;
    } else {
      console.log(`✅ Case successfully progressed through appeal -> enforcement -> closed.`);
    }

    // 14. Verify full dossier retrieval
    const dossier = await caseStateMachine.getCaseDossier(newCase.id);
    if (!dossier.caseRecord || dossier.actions.length < 2 || dossier.evidence.length < 1 || dossier.deadlines.length < 1) {
      console.error('❌ FAIL: Case dossier is incomplete', dossier);
      failures++;
    } else {
      console.log(`✅ Complete Case Dossier retrieved: ${dossier.actions.length} actions, ${dossier.evidence.length} evidence items, ${dossier.deadlines.length} SLA records.`);
    }

  } catch (err: any) {
    console.error(`❌ FAIL: Exception during Case State Machine test: ${err.message}`);
    failures++;
  }

  if (failures === 0) {
    console.log('\n🎉 ALL PHASE 2 (DELIVERABLE 7/38) CASE STATE MACHINE & DUAL-SIGNATORY TESTS PASSED (0 failures).\n');
  } else {
    console.error(`\n❌ PHASE 2 CASE STATE MACHINE TESTS FAILED with ${failures} error(s).\n`);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('test-phase2-case-state-machine.ts')) {
  runPhase2CaseStateMachineTests();
}
