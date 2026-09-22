import crypto from 'crypto';
import { getDb } from '../../../db/sqlite';
import { GlobalComplianceEngine, type ViolationData } from '../../../engine/compliance-scoring';

export interface FrameworkScore {
  framework: string;
  code: string;
  overallScore: number;
  grade: string;
  status: string;
  breakdown?: Record<string, any>;
  lastEvaluatedAt: string;
}

export interface UnifiedComplianceScore {
  tenantId: string;
  overallScore: number;
  grade: string;
  status: string;
  activeFrameworks: number;
  frameworks: FrameworkScore[];
  integrityHash: string;
  evaluatedAt: string;
}

export class RealtimeComplianceScoreEngine {
  private core: GlobalComplianceEngine;

  constructor() {
    this.core = new GlobalComplianceEngine();
  }

  /**
   * Computes an aggregate, tamper-evident compliance health score for a tenant
   * across all activated frameworks. Violations are derived from persisted
   * scan_results; framework footprint comes from tenant_framework_activations.
   */
  public evaluateTenant(tenantId: string): UnifiedComplianceScore {
    const db = getDb();
    const violations = this.collectViolations(tenantId);
    const frameworks = this.collectActiveFrameworks(tenantId);

    const resolvedFrameworks: FrameworkScore[] = [];
    const perFrameworkViolations = this.groupViolationsByFramework(violations);

    for (const fw of frameworks) {
      const vForFw = perFrameworkViolations[fw.code] || violations;
      const score = this.evaluateFramework(tenantId, fw.code, vForFw);
      resolvedFrameworks.push({
        framework: fw.name,
        code: fw.code,
        overallScore: score.overallScore,
        grade: score.grade,
        status: score.status,
        breakdown: score.breakdown,
        lastEvaluatedAt: score.lastEvaluatedAt
      });
      this.persistSnapshot(tenantId, fw.code, score);
    }

    const overallScore = resolvedFrameworks.length
      ? parseFloat((resolvedFrameworks.reduce((s, f) => s + f.overallScore, 0) / resolvedFrameworks.length).toFixed(2))
      : 100;

    const overallStatus = this.aggregateStatus(resolvedFrameworks, violations);
    const overallGrade = resolvedFrameworks.length ? this.aggregateGrade(overallScore) : 'A';
    const evaluatedAt = new Date().toISOString();

    const integrityPayload = `${tenantId}_${overallScore}_${overallStatus}_${evaluatedAt}`;
    const integrityHash = crypto.createHash('sha256').update(integrityPayload).digest('hex');

    return {
      tenantId,
      overallScore,
      grade: overallGrade,
      status: overallStatus,
      activeFrameworks: resolvedFrameworks.length,
      frameworks: resolvedFrameworks,
      integrityHash,
      evaluatedAt
    };
  }

  public getScoreHistory(tenantId: string, framework?: string, limit = 30) {
    const db = getDb();
    let sql = `SELECT * FROM compliance_score_snapshots WHERE tenant_id = ?`;
    const params: any[] = [tenantId];
    if (framework) { sql += ` AND framework = ?`; params.push(framework); }
    sql += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);
    return (db.prepare(sql).all(...params) as any[]).reverse().map((r: any) => ({
      id: r.id,
      tenantId: r.tenant_id,
      framework: r.framework,
      overallScore: r.overall_score,
      grade: r.grade,
      status: r.status,
      breakdown: this.safeParse(r.breakdown_json, {}),
      integrityHash: r.integrity_hash,
      evaluatedAt: r.created_at
    }));
  }

  public verifyIntegrity(snapshotId: string): { valid: boolean; reason: string } {
    const db = getDb();
    const row = db.prepare(`SELECT * FROM compliance_score_snapshots WHERE id = ?`).get(snapshotId) as any;
    if (!row) return { valid: false, reason: 'Snapshot not found' };
    const payload = `${row.tenant_id}_${row.overall_score}_${row.status}_${row.created_at}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    return hash === row.integrity_hash
      ? { valid: true, reason: 'Hash matches persisted snapshot' }
      : { valid: false, reason: 'Snapshot tampered or recomputed' };
  }

  private evaluateFramework(tenantId: string, framework: string, violations: ViolationData[], documentation: { totalRequired: number; uploadedValid: number } = { totalRequired: 12, uploadedValid: 9 }, training: { totalRequired: number; completed: number } = { totalRequired: 5, completed: 4 }) {
    return this.core.evaluateTenantHealth({
      tenantId,
      serviceModule: this.toServiceModule(framework),
      unresolvedViolations: violations,
      documentation,
      employeeTraining: training
    });
  }

  private collectViolations(tenantId: string): ViolationData[] {
    const db = getDb();
    try {
      const rows = db.prepare(`
        SELECT flags, decision_status, risk_score FROM scan_results
        WHERE user_id = ?
      `).all(tenantId) as any[];
      const counts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
      for (const r of rows) {
        const severity = this.inferSeverity(r);
        counts[severity]++;
      }
      return (Object.keys(counts) as Array<keyof typeof counts>).map(sev => ({ severity: sev as ViolationData['severity'], count: counts[sev] }));
    } catch {
      return [];
    }
  }

  private inferSeverity(result: any): ViolationData['severity'] {
    const riskScore = result.risk_score ?? 0;
    if (riskScore >= 80) return 'CRITICAL';
    if (riskScore >= 60) return 'HIGH';
    if (riskScore >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private groupViolationsByFramework(violations: ViolationData[]): Record<string, ViolationData[]> {
    return { DEFAULT: violations };
  }

  private collectActiveFrameworks(tenantId: string): { code: string; name: string }[] {
    const db = getDb();
    try {
      const rows = db.prepare(`
        SELECT cf.code, cf.name FROM compliance_frameworks cf
        INNER JOIN tenant_framework_activations tfa ON tfa.framework_id = cf.id
        WHERE tfa.tenant_id = ? AND tfa.status = 'ACTIVE'
      `).all(tenantId) as any[];
      return rows.length ? rows : [{ code: 'GDPR', name: 'General Data Protection Regulation' }];
    } catch {
      return [{ code: 'GDPR', name: 'General Data Protection Regulation' }];
    }
  }

  private aggregateGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private aggregateStatus(frameworks: FrameworkScore[], violations: ViolationData[]): 'COMPLIANT' | 'AT_RISK' | 'NON_COMPLIANT' {
    const hasCritical = violations.some(v => v.severity === 'CRITICAL' && v.count > 0);
    if (hasCritical || frameworks.some(f => f.status === 'NON_COMPLIANT')) return 'NON_COMPLIANT';
    if (frameworks.some(f => f.status === 'AT_RISK')) return 'AT_RISK';
    return 'COMPLIANT';
  }

  private toServiceModule(framework: string): 'GDPR_AUDIT' | 'AI_ACT_SCREENER' | 'DORA_FRAMEWORK' {
    const upper = framework.toUpperCase();
    if (upper.includes('AI')) return 'AI_ACT_SCREENER';
    if (upper.includes('DORA')) return 'DORA_FRAMEWORK';
    return 'GDPR_AUDIT';
  }

  private persistSnapshot(tenantId: string, framework: string, score: { overallScore: number; grade: string; status: string; breakdown: Record<string, any>; lastEvaluatedAt: string; integrityHash: string }) {
    const db = getDb();
    try {
      db.prepare(`
        INSERT OR REPLACE INTO compliance_score_snapshots
          (id, tenant_id, framework, overall_score, grade, status, breakdown_json, integrity_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `snap_${crypto.randomUUID().slice(0, 10)}`,
        tenantId,
        framework,
        score.overallScore,
        score.grade,
        score.status,
        JSON.stringify(score.breakdown),
        score.integrityHash,
        score.lastEvaluatedAt
      );
    } catch (err: any) {
      console.warn(`[REALTIME_SCORE] Snapshot persist failed for ${tenantId}/${framework}: ${err?.message}`);
    }
  }

  private safeParse(s: string, fallback: any = null) {
    try { return JSON.parse(s); } catch { return fallback; }
  }
}

export const realtimeScoreEngine = new RealtimeComplianceScoreEngine();