import { getDb } from '../db/sqlite';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

export interface ScoreBreakdown {
  tenantId: string;
  rawScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  metrics: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    resolvedCount: number;
    overdueCount: number;
    averageCureTimeDays: number;
  };
  lastUpdated: Date;
}

export class ComplianceRatingService {
  private static instance: ComplianceRatingService;

  private constructor() {}

  public static getInstance(): ComplianceRatingService {
    if (!ComplianceRatingService.instance) {
      ComplianceRatingService.instance = new ComplianceRatingService();
    }
    return ComplianceRatingService.instance;
  }

  /**
   * Calculates the letter grade for a numeric compliance score.
   */
  public calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' {
    const rounded = Math.round(score);
    if (rounded >= 90) return 'A';
    if (rounded >= 80) return 'B';
    if (rounded >= 70) return 'C';
    if (rounded >= 60) return 'D';
    if (rounded >= 50) return 'E';
    return 'F';
  }

  /**
   * Recalculates the dynamic A-F compliance rating for a given Tenant based on active violations and cure times.
   * Works smoothly on both local SQLite and Prisma/Postgres instances.
   */
  public async computeTenantRating(tenantId: string): Promise<ScoreBreakdown> {
    console.log(`[ComplianceRatingService] Recalculating rating for tenant: ${tenantId}`);

    let violations: any[] = [];
    
    // Attempt using Prisma if configured, otherwise fallback to SQLite
    if (prisma) {
      try {
        violations = await (prisma as any).violation.findMany({
          where: {
            asset: {
              company: {
                tenantId: tenantId
              }
            }
          },
          include: {
            enforcement: true,
            invoices: true
          }
        });
      } catch (prismaError) {
        console.warn('[ComplianceRatingService] Prisma query failed, resorting to SQLite:', prismaError);
        violations = this.fetchViolationsFromSqlite(tenantId);
      }
    } else {
      violations = this.fetchViolationsFromSqlite(tenantId);
    }

    // 1. Scoring Logic Core Rules
    let score = 100.0;
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let resolvedCount = 0;
    let overdueCount = 0;

    const cureTimes: number[] = [];
    const now = new Date();

    for (const v of violations) {
      const severity = (v.severity || 'LOW').toUpperCase();
      const isResolved = v.status === 'RESOLVED' || v.status === 'PAID' || v.invoiceStatus === 'PAID';
      
      // Get the step in the 8-step pipeline (1 to 8)
      const currentStep = v.enforcement_state || v.enforcementState || (v.enforcement ? v.enforcement.currentStep : 1);
      
      // Deduct score based on open severity counts
      if (!isResolved) {
        // Base Severity Weight Deductions
        if (severity === 'CRITICAL') {
          score -= 15;
          criticalCount++;
        } else if (severity === 'HIGH') {
          score -= 8;
          highCount++;
        } else if (severity === 'MED' || severity === 'MEDIUM') {
          score -= 4;
          mediumCount++;
        } else {
          score -= 1;
          lowCount++;
        }

        // 8-Step Enforcement Pipeline Progression Weight Penalties:
        // As a violation escalates up the pipeline steps, the penalization increases.
        if (currentStep >= 4) {
          if (currentStep === 4) score -= 2;   // STEP_4_NOTICE_ISSUED
          else if (currentStep === 5) score -= 4;  // STEP_5_APPEAL_WINDOW
          else if (currentStep === 6) score -= 7;  // STEP_6_PAYMENT_DEMAND
          else if (currentStep === 7) score -= 12; // STEP_7_SOFT_ENFORCEMENT
          else if (currentStep === 8) score -= 20; // STEP_8_HARD_ENFORCEMENT
        }

        // Days-Overdue calculation relative to pipeline grace period expiration
        const gracePeriodEnd = v.grace_period_expires_at || (v.enforcement ? v.enforcement.gracePeriodExpiresAt : null);
        if (gracePeriodEnd) {
          const expirationDate = new Date(gracePeriodEnd);
          if (now > expirationDate) {
            const overdueDays = Math.ceil((now.getTime() - expirationDate.getTime()) / (1000 * 60 * 60 * 24));
            if (overdueDays > 0) {
              // Proportional penalty: -1 point per day overdue up to 15 points
              const proportionalPenalty = Math.min(15, overdueDays * 1.0);
              score -= proportionalPenalty;
              overdueCount++;
            }
          }
        } else {
          // Fallback overdue check (e.g. older than 30 days and unresolved)
          const detectedAt = new Date(v.detected_at || v.createdAt || now);
          const ageInDays = (now.getTime() - detectedAt.getTime()) / (1000 * 60 * 60 * 24);
          if (ageInDays > 30) {
            score -= 5; // Fixed -5 penalty
            overdueCount++;
          }
        }
      } else {
        resolvedCount++;
        
        // Calculate cure time
        const detectedAt = new Date(v.detected_at || v.createdAt);
        const resolvedAt = new Date(v.paid_at || v.updatedAt || now);
        const cureTimeDays = (resolvedAt.getTime() - detectedAt.getTime()) / (1000 * 60 * 60 * 24);
        cureTimes.push(cureTimeDays);

        // Remediation Bonus: cured inside grace period (15 days)
        if (cureTimeDays <= 15) {
          score += 2; // +2 bonus for fast remediation of each issue
        }
      }
    }

    // Cap the score boundary between 0.00 and 100.00
    score = Math.max(0, Math.min(100, score));
    const grade = this.calculateGrade(score);

    const averageCureTimeDays = cureTimes.length > 0 
      ? Math.round((cureTimes.reduce((a, b) => a + b, 0) / cureTimes.length) * 10) / 10 
      : 0;

    const breakdown: ScoreBreakdown = {
      tenantId,
      rawScore: parseFloat(score.toFixed(2)),
      grade,
      metrics: {
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        resolvedCount,
        overdueCount,
        averageCureTimeDays
      },
      lastUpdated: new Date()
    };

    // 2. Persist the updated rating to the database
    await this.saveRatingToDb(breakdown);

    return breakdown;
  }

  /**
   * Fetches violations from the local SQLite database for the matching Tenant.
   */
  private fetchViolationsFromSqlite(tenantId: string): any[] {
    const db = getDb();
    try {
      // Find all companies belonging to this tenant context
      const companies = db.prepare('SELECT id FROM companies_extended WHERE id IN (SELECT id FROM companies WHERE name LIKE ?)')
        .all(`%${tenantId}%`) as { id: number }[];

      if (companies.length === 0) {
        // Fallback to searching all active violations
        return db.prepare('SELECT * FROM violations_extended').all();
      }

      const companyIds = companies.map(c => c.id).join(',');
      return db.prepare(`SELECT * FROM violations_extended WHERE company_id IN (${companyIds})`).all();
    } catch (err) {
      console.error('[ComplianceRatingService] SQLite fetch violations error:', err);
      // Fail-safe fallback to raw list
      try {
        return db.prepare('SELECT * FROM violations_extended LIMIT 100').all();
      } catch {
        return [];
      }
    }
  }

  /**
   * Persists the computed score back to both Postgres (via Prisma) and SQLite.
   */
  private async saveRatingToDb(rating: ScoreBreakdown): Promise<void> {
    const intScore = Math.round(rating.rawScore);
    // 1. Save to SQLite
    const db = getDb();
    try {
      // Ensure rating row exists
      const existing = db.prepare('SELECT id FROM compliance_ratings WHERE tenant_id = ?').get(rating.tenantId);
      if (existing) {
        db.prepare('UPDATE compliance_ratings SET current_score = ?, current_grade = ?, last_updated = CURRENT_TIMESTAMP WHERE tenant_id = ?')
          .run(intScore, rating.grade, rating.tenantId);
      } else {
        const generatedId = crypto.randomUUID();
        db.prepare('INSERT INTO compliance_ratings (id, tenant_id, current_score, current_grade) VALUES (?, ?, ?, ?)')
          .run(generatedId, rating.tenantId, intScore, rating.grade);
      }
      console.log(`[ComplianceRatingService] SQLite saved rating: Grade ${rating.grade} (${intScore}) for tenant ${rating.tenantId}`);
    } catch (err) {
      console.error('[ComplianceRatingService] SQLite save failed:', err);
    }

    // 2. Save to Prisma if available
    if (prisma) {
      try {
        await (prisma as any).complianceRating.upsert({
          where: { tenantId: rating.tenantId },
          update: {
            currentScore: intScore,
            currentGrade: rating.grade,
            lastUpdated: new Date()
          },
          create: {
            tenantId: rating.tenantId,
            currentScore: intScore,
            currentGrade: rating.grade
          }
        });
        console.log('[ComplianceRatingService] Prisma successfully synchronized rating upsert.');
      } catch (prismaError) {
        console.warn('[ComplianceRatingService] Prisma upsert rating skipped or failed:', prismaError);
      }
    }
  }
}
