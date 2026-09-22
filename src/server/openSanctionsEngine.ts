import Ajv from 'ajv';

interface SanctionCheckPayload {
  entityName: string;
  country: string;
  entityType: 'INDIVIDUAL' | 'COMPANY' | 'VESSEL';
  registrationNumber?: string;
}

export class OpenSanctionsEngine {
  private ajv: Ajv;
  private schema: any;
  private mockSanctionList: any[];

  constructor() {
    this.ajv = new Ajv();
    
    this.schema = {
      type: 'object',
      properties: {
        entityName: { type: 'string', minLength: 2 },
        country: { type: 'string', minLength: 2, maxLength: 3 },
        entityType: { type: 'string', enum: ['INDIVIDUAL', 'COMPANY', 'VESSEL'] },
        registrationNumber: { type: 'string', nullable: true }
      },
      required: ['entityName', 'country', 'entityType'],
      additionalProperties: false
    };

    // Preloaded Mock Sanctions (Representing OFAC/EU CFSP data)
    this.mockSanctionList = [
      { name: 'Oligarch Holdings Ltd', country: 'RU', type: 'COMPANY', sanctionId: 'EU_CFSP_9011' },
      { name: 'North Sea Trading', country: 'KP', type: 'VESSEL', sanctionId: 'UN_SC_1718' },
      { name: 'John Doe Syndicate', country: 'SY', type: 'INDIVIDUAL', sanctionId: 'OFAC_SDN_5502' }
    ];
  }

  public checkEntity(payload: any) {
    const validate = this.ajv.compile(this.schema);
    const valid = validate(payload);

    if (!valid) {
      return {
        success: false,
        error: 'Invalid payload schema for Sanctions check.',
        details: validate.errors
      };
    }

    const { entityName, country, entityType } = payload as SanctionCheckPayload;
    
    // Simple fuzzy match simulation
    const match = this.mockSanctionList.find(s => 
      (s.name.toLowerCase().includes(entityName.toLowerCase()) || entityName.toLowerCase().includes(s.name.toLowerCase())) ||
      (s.country === country && s.type === entityType && ['RU', 'KP', 'SY'].includes(country))
    );

    if (match) {
      return {
        success: true,
        isSanctioned: true,
        matchDetails: {
          matchedName: match.name,
          listSource: match.sanctionId,
          riskLevel: 'CRITICAL',
          remediation: 'Freeze assets immediately and report to local FIU (Financial Intelligence Unit).'
        }
      };
    }

    return {
      success: true,
      isSanctioned: false,
      matchDetails: null
    };
  }
}
