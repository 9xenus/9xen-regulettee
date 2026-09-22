import { RegulatorDefinition } from './pack.manifest';

export const TEMPLATE_REGULATORS: RegulatorDefinition[] = [
  {
    code: 'SAMPLE_REGULATOR',
    name: 'National Telecommunications and Data Commission',
    nameLocal: 'الهيئة الوطنية / জাতীয় কমিশন',
    sector: 'Telecom & Data Privacy',
    sectors: ['telecom', 'finance', 'data_privacy'],
    enforcementPower: 'full',
    appealBody: 'High Court / Telecom Appellate Tribunal',
    contactEmail: 'enforcement@regulator.gov.example',
    website: 'https://regulator.gov.example',
    portalConfig: {
      onlineDisputeUrl: 'https://disputes.regulator.gov.example',
      whistleblowerEndpoint: 'https://whistleblower.regulator.gov.example/api/v1',
      apiKeyRequired: true
    }
  }
];
