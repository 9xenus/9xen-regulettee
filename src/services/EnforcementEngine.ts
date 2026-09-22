import { 
  EnforcementLevelTemplate, 
  JurisdictionProfile, 
  JurisdictionLevelSetting, 
  ExecutionEvent, 
  ExecutionMode,
} from '../types';
import { prisma } from '../lib/prisma';
import { complianceVectorOrchestrator } from './compliance-vectorization-orchestrator';

export interface EnforcementContext {
  tenantId: string;
  countryCode: string;
  regulationCode: string;
  caseRef?: string;
  violationData: any;
}

export interface EnforcementResult {
  levelKey: string;
  actionTaken: string;
  status: 'executed' | 'pending_approval' | 'skipped' | 'blocked';
  reason?: string;
}

export class EnforcementEngine {
  private static instance: EnforcementEngine;

  private constructor() {}

  public static getInstance(): EnforcementEngine {
    if (!EnforcementEngine.instance) {
      EnforcementEngine.instance = new EnforcementEngine();
    }
    return EnforcementEngine.instance;
  }

  /**
   * Evaluates and executes the enforcement cascade for a given context.
   */
  public async processViolation(context: EnforcementContext): Promise<EnforcementResult[]> {
    console.log(`[EnforcementEngine] Processing violation for ${context.tenantId} in ${context.countryCode}`);
    
    // 1. Fetch published jurisdiction profile
    const profile = await this.getPublishedProfile(context.countryCode, context.regulationCode);
    if (!profile) {
      console.warn(`[EnforcementEngine] No published profile found for ${context.countryCode} / ${context.regulationCode}`);
      return [];
    }

    // 2. Fetch enabled level settings for this profile
    const settings = await this.getLevelSettings(profile.id);
    
    const results: EnforcementResult[] = [];

    for (const setting of settings) {
      if (!setting.enabled || setting.emergencyStop) {
        results.push({
          levelKey: setting.template?.key || setting.levelTemplateId,
          actionTaken: 'None',
          status: setting.emergencyStop ? 'blocked' : 'skipped',
          reason: setting.emergencyStop ? 'Emergency stop active' : 'Level disabled'
        });
        continue;
      }

      // 3. Evaluate trigger conditions
      const shouldTrigger = this.evaluateConditions(setting.triggerConditions, context.violationData);
      if (!shouldTrigger) {
        continue;
      }

      // 4. Handle execution mode
      const result = await this.executeLevel(setting, context);
      results.push(result);

      // If a level is blocked or pending manual approval, we might want to halt the cascade
      if (result.status === 'blocked' || result.status === 'pending_approval') {
        break;
      }
    }

    return results;
  }

  private async executeLevel(setting: any, context: EnforcementContext): Promise<EnforcementResult> {
    const mode = setting.executionMode;
    const levelKey = setting.template?.key || setting.levelTemplateId;

    if (mode === 'AUTO') {
      return this.performAutoExecution(setting, context);
    } else if (mode === 'MANUAL') {
      return this.requestManualApproval(setting, context);
    } else {
      // Conditional logic
      const triggerConfig = setting.triggerConditions as any;
      const riskThreshold = triggerConfig?.riskThreshold || 0;
      const currentRisk = context.violationData.riskScore || 0;

      if (currentRisk >= riskThreshold) {
        return this.performAutoExecution(setting, context);
      } else {
        return this.requestManualApproval(setting, context);
      }
    }
  }

  private async performAutoExecution(setting: any, context: EnforcementContext): Promise<EnforcementResult> {
    const levelKey = setting.template?.key || setting.levelTemplateId;
    console.log(`[EnforcementEngine] AUTO-EXECUTING Level ${levelKey} for case ${context.caseRef}`);
    
    await this.logExecutionEvent(setting, context, 'executed');

    return {
      levelKey,
      actionTaken: `Automated ${levelKey} activation`,
      status: 'executed'
    };
  }

  private async requestManualApproval(setting: any, context: EnforcementContext): Promise<EnforcementResult> {
    const levelKey = setting.template?.key || setting.levelTemplateId;
    console.log(`[EnforcementEngine] REQUESTING MANUAL APPROVAL for Level ${levelKey}`);
    
    await this.logExecutionEvent(setting, context, 'pending_approval');
    
    return {
      levelKey,
      actionTaken: 'Approval Request Created',
      status: 'pending_approval'
    };
  }

  private evaluateConditions(conditions: any, data: any): boolean {
    if (!conditions) return true;
    
    const { riskThreshold, violationTypes } = conditions;
    
    if (riskThreshold && data.riskScore < riskThreshold) return false;
    if (violationTypes && violationTypes.length > 0 && !violationTypes.includes(data.type)) return false;
    
    return true;
  }

  private async getPublishedProfile(country: string, regulation: string): Promise<any | null> {
    if (!prisma) {
      throw new Error('Prisma client is not initialized. DATABASE_URL must be set and @prisma/client installed.');
    }
    return prisma.jurisdictionProfile.findFirst({
      where: {
        countryCode: country,
        regulationCode: regulation,
        status: 'PUBLISHED'
      },
      orderBy: { version: 'desc' }
    });
  }

  private async getLevelSettings(profileId: string): Promise<any[]> {
    if (!prisma) {
      throw new Error('Prisma client is not initialized. DATABASE_URL must be set and @prisma/client installed.');
    }
    return prisma.jurisdictionLevelSetting.findMany({
      where: { profileId },
      include: { template: true },
      orderBy: { template: { key: 'asc' } }
    });
  }

  private async logExecutionEvent(setting: any, context: EnforcementContext, status: string) {
    const levelKey = setting.template?.key || setting.levelTemplateId;
    try {
      if (prisma && (prisma as any).executionEvent) {
        await (prisma as any).executionEvent.create({
          data: {
            profileId: setting.profileId,
            levelKey: levelKey,
            mode: setting.executionMode,
            status: status,
            caseRef: context.caseRef,
            payload: {
              violationData: context.violationData,
              tenantId: context.tenantId
            } as any
          }
        });
      }
    } catch (error) {
      console.error('[EnforcementEngine] Failed to log execution event to Prisma:', error);
    }

    // Orchestrate real-time vectorization & graph ingestion for Chroma/Kuzu AI analysis
    try {
      await complianceVectorOrchestrator.enqueueEnforcementEvent({
        tenantId: context.tenantId,
        countryCode: context.countryCode,
        regulationCode: context.regulationCode,
        caseRef: context.caseRef,
        levelKey: levelKey,
        actionTaken: `Automated enforcement level '${levelKey}' executed in ${setting.executionMode} mode`,
        status: status,
        riskScore: context.violationData?.riskScore ?? 65,
        violationData: context.violationData,
      });
    } catch (vectorErr) {
      console.warn('[EnforcementEngine] Vectorization orchestration warning:', vectorErr);
    }
  }
}
