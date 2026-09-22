/**
 * EU Policy Compliance SaaS
 * Module: Global EU Compliance Scoring Algorithm
 * 
 * Purpose: A real-time data engine calculating absolute and weighted 
 * compliance health scores per tenant and service.
 */

export interface ComplianceInputData {
  tenantId: string;
  serviceId: string; // e.g., 'GDPR_AUDIT', 'AI_ACT_SCREENER'
  unresolvedTasks: RemediationTask[];
  mandatoryDocs: DocumentRequirement[];
  employeeTrainingCompletedPct: number; // 0 to 100
  recentBreaches: number; // Count of recent PII leaks or breaches
}

export interface RemediationTask {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  daysOpen: number;
}

export interface DocumentRequirement {
  id: string;
  status: 'VALID' | 'EXPIRED' | 'MISSING' | 'PENDING_REVIEW';
  criticalityWeight: number; // 1.0 to 3.0
}

export interface ScorePayload {
  tenantId: string;
  serviceId: string;
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    taskPenalty: number;
    docPenalty: number;
    trainingPenalty: number;
    breachPenalty: number;
  };
  timestamp: string;
}

/**
 * Calculates the deterministic weighted compliance health score.
 * 
 * Base score starts at 100.
 * Penalties are subtracted based on active risk vectors.
 * 
 * @param input Compliance config states and unresolved tasks
 * @returns ScorePayload mapping perfectly to UI gauges and charts
 */
export function calculateComplianceScore(input: ComplianceInputData): ScorePayload {
  let score = 100.0;
  
  // 1. Unresolved Task Penalties
  let taskPenalty = 0;
  const SEVERITY_WEIGHTS = {
    'CRITICAL': 10.0,
    'HIGH': 5.0,
    'MEDIUM': 2.0,
    'LOW': 0.5
  };

  input.unresolvedTasks.forEach(task => {
    // Penalty increases by 10% for every 7 days a task remains open
    const timeMultiplier = 1 + Math.floor(task.daysOpen / 7) * 0.1;
    taskPenalty += (SEVERITY_WEIGHTS[task.severity] * timeMultiplier);
  });

  // Cap task penalty to avoid negative explosion, max 40 points
  taskPenalty = Math.min(taskPenalty, 40);
  score -= taskPenalty;

  // 2. Mandatory Documentation Penalties
  let docPenalty = 0;
  input.mandatoryDocs.forEach(doc => {
    if (doc.status === 'MISSING') {
      docPenalty += 5 * doc.criticalityWeight;
    } else if (doc.status === 'EXPIRED') {
      docPenalty += 3 * doc.criticalityWeight;
    } else if (doc.status === 'PENDING_REVIEW') {
      docPenalty += 1 * doc.criticalityWeight;
    }
  });

  // Cap doc penalty at 30 points
  docPenalty = Math.min(docPenalty, 30);
  score -= docPenalty;

  // 3. Employee Training Penalty
  // If training is below 100%, penalize up to 10 points
  let trainingPenalty = (100 - input.employeeTrainingCompletedPct) * 0.1;
  // Cap at 10 points
  trainingPenalty = Math.min(trainingPenalty, 10);
  score -= trainingPenalty;

  // 4. Critical Breach Penalty
  // Each breach acts as an immediate massive penalty
  const breachPenalty = Math.min(input.recentBreaches * 25, 50);
  score -= breachPenalty;

  // Ensure score doesn't drop below 0
  score = Math.max(score, 0);
  
  // Round to 1 decimal place
  const finalScore = Math.round(score * 10) / 10;

  // Assign Grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (finalScore >= 90) grade = 'A';
  else if (finalScore >= 80) grade = 'B';
  else if (finalScore >= 70) grade = 'C';
  else if (finalScore >= 60) grade = 'D';

  return {
    tenantId: input.tenantId,
    serviceId: input.serviceId,
    overallScore: finalScore,
    grade,
    breakdown: {
      taskPenalty: Math.round(taskPenalty * 10) / 10,
      docPenalty: Math.round(docPenalty * 10) / 10,
      trainingPenalty: Math.round(trainingPenalty * 10) / 10,
      breachPenalty
    },
    timestamp: new Date().toISOString()
  };
}

// ----------------------------------------------------------------------------
// API ROUTE STUB (Express/Node.js)
// ----------------------------------------------------------------------------
import express from 'express';

export const scoringRouter = express.Router();

scoringRouter.get('/api/v1/compliance/score/:tenantId/:serviceId', async (req, res) => {
  try {
    const { tenantId, serviceId } = req.params;
    
    // In production, these values would be queried from the Prisma database
    // e.g. const tasks = await prisma.remediationTask.findMany(...)
    
    const mockInput: ComplianceInputData = {
      tenantId,
      serviceId,
      unresolvedTasks: [
        { id: 'T-001', severity: 'HIGH', daysOpen: 14 }
      ],
      mandatoryDocs: [
        { id: 'DPIA-01', status: 'EXPIRED', criticalityWeight: 2.0 } // 6 penalty
      ],
      employeeTrainingCompletedPct: 85, // 1.5 penalty
      recentBreaches: 0 // 0 penalty
    };

    // 100 - (5 * 1.2 = 6) - 6 - 1.5 - 0 = 86.5
    // Grade: B

    const scoreResult = calculateComplianceScore(mockInput);
    
    res.json({
      status: 'success',
      data: scoreResult
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate compliance score', code: 'SCORING_ERROR' });
  }
});
