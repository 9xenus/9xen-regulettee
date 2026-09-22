import { getDb } from '../db/sqlite';
import { EnforcementStep, EnforcementCase } from '../types/compliance';
import { recordAuditProof } from './immudb';
import crypto from 'crypto';

/**
 * ENFORCEMENT STATE MACHINE SERVICE
 * Manages the 8-step recovery workflow for sovereign regulators.
 */

export class EnforcementStateMachine {
  private db = getDb();

  /**
   * Initialize a new enforcement case after a violation is detected.
   */
  async initializeCase(entityId: number, regulatorId: number): Promise<EnforcementCase> {
    const id = `case_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    this.db.prepare(`
      INSERT INTO enforcement_cases (id, entity_id, regulator_id, status)
      VALUES (?, ?, ?, ?)
    `).run(id, entityId, regulatorId, EnforcementStep.SCANNED);

    // Initial Audit Proof
    await recordAuditProof(id, EnforcementStep.SCANNED, {
      message: 'Case initialized after initial scanning discovery.',
      timestamp: new Date().toISOString()
    });

    return this.getCase(id);
  }

  /**
   * Transition a case to the next state in the 8-step pipeline.
   */
  async transition(caseId: string, nextStep: EnforcementStep, metadata: any): Promise<boolean> {
    const currentCase = this.getCase(caseId);
    if (!currentCase) throw new Error('Case not found');

    // Simple FSM validation can be added here if needed
    
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(metadata)).digest('hex');

    // 1. Update SQL State
    this.db.prepare(`
      UPDATE enforcement_cases 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(nextStep, caseId);

    // 2. Record Immutable Proof in ImmuDB
    const auditResult = await recordAuditProof(caseId, nextStep, metadata);

    // 3. Link the proof back to the main DB for fast lookup
    if (auditResult.success) {
      this.db.prepare(`
        INSERT INTO audit_proofs (id, case_id, step, payload_hash, immudb_tx_id)
        VALUES (?, ?, ?, ?, ?)
      `).run(auditResult.id, caseId, nextStep, payloadHash, auditResult.id); // Using the same ID for simplicity in this prototype
    }

    return true;
  }

  getCase(caseId: string): EnforcementCase {
    return this.db.prepare('SELECT * FROM enforcement_cases WHERE id = ?').get(caseId) as EnforcementCase;
  }

  async getCaseHistory(caseId: string) {
    return this.db.prepare(`
      SELECT * FROM audit_proofs 
      WHERE case_id = ? 
      ORDER BY created_at ASC
    `).all(caseId);
  }
}

export const enforcementService = new EnforcementStateMachine();
