import { RegulatoryFrameworkV1, TenantComplianceConfig, PolicyDriftEngine } from '../../src/engine/policy-drift-engine';

/**
 * Regulatory Compliance Mocking & Regression Sandbox
 * A testing utility that simulates sudden EU regulatory updates to verify
 * if the internal Drift Engine accurately catches missing safeguards.
 */
export class RegulatorySandbox {
  private engine: PolicyDriftEngine;

  constructor() {
    this.engine = new PolicyDriftEngine();
  }

  public getTenantBaseline(): TenantComplianceConfig {
    return {
      tenantId: 'sandbox_tenant_01',
      frameworkConfigs: {},
      implementedSafeguards: [
        'data-encryption-rest',
        'auth-mfa',
        'log-retention-90d'
      ]
    };
  }

  public async triggerSimulatedDoraUpdate(): Promise<void> {
    console.log('[SANDBOX] Triggering mock regulatory update: Digital Operational Resilience Act (DORA) v2...');

    // Simulate an emergency update to DORA that requires new safeguards
    const updatedFramework: RegulatoryFrameworkV1 = {
      id: 'dora_v2',
      name: 'EU DORA Amendment 2026',
      version: '2.0',
      effectiveDate: new Date(),
      mandatoryRules: [
        { ruleId: 'data-encryption-rest', category: 'TECHNICAL_SAFEGUARD', required: true, legalTextRef: 'Art 9.2' }, // Already has
        { ruleId: 'multi-region-failover', category: 'TECHNICAL_SAFEGUARD', required: true, legalTextRef: 'Art 11.4' }, // Tenant is missing
        { ruleId: 'third-party-risk-audit', category: 'HUMAN_OVERSIGHT', required: true, legalTextRef: 'Art 28' }    // Tenant is missing
      ]
    };

    const tenantMode = this.getTenantBaseline();
    
    const result = await this.engine.evaluateRegulatoryDrift(updatedFramework, tenantMode);

    console.log('[SANDBOX] Evaluation Complete.');
    console.log(`- Drift Detected: ${result.hasDrift}`);
    console.log(`- Penalty Score: ${result.driftScore}`);
    
    if (result.hasDrift) {
      console.log(`- Actionable Gap Task Cards Generated: ${result.actionableTaskCards.length}`);
      result.actionableTaskCards.forEach(task => {
        console.log(`  --> [${task.severity}] ${task.title} (Ref: ${task.regulatoryReference})`);
      });
    }

    if (!result.hasDrift || result.actionableTaskCards.length !== 2) {
      throw new Error('[SANDBOX FATAL] The Drift Engine failed to catch the regression delta accurately!');
    }
  }
}
