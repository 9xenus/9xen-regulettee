import { Engine } from 'json-rules-engine';

export class OpenPolicyEngine {
  private engine: Engine;

  constructor() {
    this.engine = new Engine();
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies() {
    // Basic AI Act / GDPR / DORA Policies
    
    // Policy 1: High Risk AI Systems must have Human Oversight
    const aiHumanOversightRule: any = {
      conditions: {
        all: [
          {
            fact: 'system_type',
            operator: 'equal',
            value: 'ai_system'
          },
          {
            fact: 'risk_level',
            operator: 'equal',
            value: 'high_risk'
          },
          {
            fact: 'human_oversight_enabled',
            operator: 'equal',
            value: false
          }
        ]
      },
      event: {
        type: 'violation',
        params: {
          message: 'High-risk AI system lacks mandatory human oversight.',
          remediation: 'Implement HITL (Human-in-the-loop) Approval Gate.',
          framework: 'EU_AI_ACT_ART_14'
        }
      }
    };

    // Policy 2: Financial transactions to sanctioned jurisdictions
    const sanctionJurisdictionRule: any = {
      conditions: {
        all: [
          {
            fact: 'transaction_amount',
            operator: 'greaterThan',
            value: 10000
          },
          {
            fact: 'destination_country',
            operator: 'in',
            value: ['CU', 'IR', 'KP', 'SY', 'RU'] // Example sanctioned/high-risk jurisdictions
          }
        ]
      },
      event: {
        type: 'violation',
        params: {
          message: 'High-value transaction directed to a high-risk or sanctioned jurisdiction.',
          remediation: 'Trigger enhanced due diligence and block transaction temporarily.',
          framework: 'AMLD6_SANCTIONS'
        }
      }
    };

    this.engine.addRule(aiHumanOversightRule);
    this.engine.addRule(sanctionJurisdictionRule);
  }

  public async evaluate(facts: Record<string, any>) {
    try {
      const { events } = await this.engine.run(facts);
      return {
        compliant: events.length === 0,
        violations: events.map(e => e.params)
      };
    } catch (error) {
      console.error('Error in OpenPolicyEngine:', error);
      throw error;
    }
  }

  public addCustomRule(rule: any) {
    this.engine.addRule(rule);
  }
}
