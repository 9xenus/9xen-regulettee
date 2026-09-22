import crypto from 'crypto';

export interface RegulatoryFrameworkV1 {
  id: string;
  name: string; // e.g. "EU AI Act"
  version: string;
  effectiveDate: Date;
  mandatoryRules: RegulatoryRule[];
}

export interface RegulatoryRule {
  ruleId: string;
  category: 'DOCUMENTATION' | 'TECHNICAL_SAFEGUARD' | 'HUMAN_OVERSIGHT';
  required: boolean;
  legalTextRef: string;
}

export interface TenantComplianceConfig {
  tenantId: string;
  frameworkConfigs: Record<string, any>;
  implementedSafeguards: string[];
}

export interface DriftAnalysisResult {
  tenantId: string;
  frameworkId: string;
  hasDrift: boolean;
  driftScore: number; // 0 = no drift, 100 = total non-compliance due to drift
  missingSafeguards: string[];
  actionableTaskCards: TaskCard[];
}

export interface TaskCard {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  regulatoryReference: string;
}

export class PolicyDriftEngine {
  /**
   * Evaluates the delta between a newly updated EU Regulation Framework 
   * and the current state of a tenant's compliance configuration.
   */
  public async evaluateRegulatoryDrift(
    frameworkDelta: RegulatoryFrameworkV1,
    tenantConfig: TenantComplianceConfig
  ): Promise<DriftAnalysisResult> {
    const missingSafeguards: string[] = [];
    const actionableTaskCards: TaskCard[] = [];
    let driftPenaltyAccumulator = 0;

    for (const rule of frameworkDelta.mandatoryRules) {
      const isImplemented = tenantConfig.implementedSafeguards.includes(rule.ruleId);
      
      if (rule.required && !isImplemented) {
        missingSafeguards.push(rule.ruleId);
        
        // Calculate dynamic drift penalty based on rule category
        let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
        if (rule.category === 'TECHNICAL_SAFEGUARD') {
          driftPenaltyAccumulator += 30;
          severity = 'CRITICAL';
        } else if (rule.category === 'HUMAN_OVERSIGHT') {
          driftPenaltyAccumulator += 20;
          severity = 'HIGH';
        } else {
          driftPenaltyAccumulator += 10;
        }

        // Generate the automated Task Card payload for the Client Dashboard
        actionableTaskCards.push({
          id: crypto.randomUUID(),
          title: `Implement ${rule.category} to meet new ${frameworkDelta.name} requirements`,
          description: `A recent legislative update requires strict adherence to rule ${rule.ruleId}. Immediate action is required to prevent compliance drift.`,
          severity,
          regulatoryReference: rule.legalTextRef
        });
      }
    }

    const driftScore = Math.min(100, Math.max(0, driftPenaltyAccumulator));

    return {
      tenantId: tenantConfig.tenantId,
      frameworkId: frameworkDelta.id,
      hasDrift: missingSafeguards.length > 0,
      driftScore,
      missingSafeguards,
      actionableTaskCards
    };
  }
}
