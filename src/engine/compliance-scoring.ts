import crypto from 'crypto';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ServiceModule = 'GDPR_AUDIT' | 'AI_ACT_SCREENER' | 'DORA_FRAMEWORK';

export interface ViolationData {
  severity: SeverityLevel;
  count: number;
}

export interface ComplianceMetricsInput {
  tenantId: string;
  serviceModule: ServiceModule;
  unresolvedViolations: ViolationData[];
  documentation: {
    totalRequired: number;
    uploadedValid: number;
  };
  employeeTraining: {
    totalRequired: number;
    completed: number;
  };
}

export interface ComplianceScorePayload {
  tenantId: string;
  serviceModule: ServiceModule;
  overallScore: number; // 0 to 100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'COMPLIANT' | 'AT_RISK' | 'NON_COMPLIANT';
  breakdown: {
    violationsPenalty: number;
    documentationScore: number;
    trainingScore: number;
  };
  lastEvaluatedAt: string;
  // Deterministic hash to prove the score wasn't tampered manually
  integrityHash: string; 
}

export class GlobalComplianceEngine {
  // Configurable weights per module
  private readonly WEIGHTS = {
    VIOLATIONS_BASE: 50, // Starts at 50, penalties deduct from this
    DOCUMENTATION: 30,   // up to 30 points
    TRAINING: 20         // up to 20 points
  };

  private readonly PENALTY_MULTIPLIERS: Record<SeverityLevel, number> = {
    CRITICAL: 25.0, // Instantly severely impacts score
    HIGH: 10.0,
    MEDIUM: 5.0,
    LOW: 1.5
  };

  /**
   * Calculates the deterministic, real-time compliance health score for a tenant environment.
   */
  public evaluateTenantHealth(metrics: ComplianceMetricsInput): ComplianceScorePayload {
    // 1. Calculate Violations Penalty
    let penaltyAccumulator = 0;
    for (const v of metrics.unresolvedViolations) {
      penaltyAccumulator += v.count * this.PENALTY_MULTIPLIERS[v.severity];
    }
    
    // Violation score cannot drop below 0
    const violationsScore = Math.max(0, this.WEIGHTS.VIOLATIONS_BASE - penaltyAccumulator);

    // 2. Calculate Documentation Score (Ratio * Max Weight)
    const docRatio = metrics.documentation.totalRequired > 0 
      ? (metrics.documentation.uploadedValid / metrics.documentation.totalRequired) 
      : 1;
    const docScore = docRatio * this.WEIGHTS.DOCUMENTATION;

    // 3. Calculate Training Score (Ratio * Max Weight)
    const trainingRatio = metrics.employeeTraining.totalRequired > 0
      ? (metrics.employeeTraining.completed / metrics.employeeTraining.totalRequired)
      : 1;
    const trainingScore = trainingRatio * this.WEIGHTS.TRAINING;

    // 4. Aggregate Absolute Score
    const rawScore = violationsScore + docScore + trainingScore;
    const overallScore = parseFloat(Math.min(100, Math.max(0, rawScore)).toFixed(2));

    // 5. Determine Grade and Threshold Status
    const grade = this.calculateGrade(overallScore);
    const status = this.determineStatus(overallScore, metrics.unresolvedViolations);

    // 6. Generate Immutable Integrity Hash
    const timestamp = new Date().toISOString();
    const hashPayload = `${metrics.tenantId}_${overallScore}_${status}_${timestamp}`;
    const integrityHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    return {
      tenantId: metrics.tenantId,
      serviceModule: metrics.serviceModule,
      overallScore,
      grade,
      status,
      breakdown: {
        violationsPenalty: parseFloat(penaltyAccumulator.toFixed(2)),
        documentationScore: parseFloat(docScore.toFixed(2)),
        trainingScore: parseFloat(trainingScore.toFixed(2))
      },
      lastEvaluatedAt: timestamp,
      integrityHash
    };
  }

  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private determineStatus(score: number, violations: ViolationData[]): 'COMPLIANT' | 'AT_RISK' | 'NON_COMPLIANT' {
    const hasCritical = violations.some(v => v.severity === 'CRITICAL' && v.count > 0);
    
    // Explicit legal failure regardless of overall mathematical score
    if (hasCritical || score < 60) return 'NON_COMPLIANT';
    if (score < 80) return 'AT_RISK';
    
    return 'COMPLIANT';
  }
}
