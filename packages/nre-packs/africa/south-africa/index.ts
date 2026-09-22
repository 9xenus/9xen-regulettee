import { CountryPackManifest } from '../../_template/pack.manifest';

export const SOUTH_AFRICA_PACK: CountryPackManifest = {
  countryCode: 'ZA',
  countryName: 'South Africa',
  regionCode: 'africa',
  currencyCode: 'ZAR',
  languages: ['en', 'af', 'zu'],
  primaryLanguage: 'en',
  timezone: 'Africa/Johannesburg',
  legalSystem: 'mixed',
  dataResidencyRequired: false,
  internationalSanctionsList: ['UN', 'OFAC', 'FIC_TFS_LIST'],
  scannerLegalGate: 'standard',
  govtMouRequired: false,
  packVersion: '1.0.0',
  status: 'active',
  fxSource: 'SOUTH_AFRICAN_RESERVE_BANK',
  scannerConfig: {
    robotsPolicy: 'standard',
    crawlDepth: 4,
    githubEnabled: true,
    cloudScan: 'standard',
    registrySource: 'official_api'
  },
  notificationChannels: {
    email: true,
    whatsapp: true,
    wechat: false,
    smsFallback: true,
    physicalLetter: true,
    languagePriority: ['en']
  },
  letterTemplateSet: [
    {
      templateId: 'ZA_INFO_REG_POPIA_ORDER',
      title: 'Information Regulator (South Africa) - Administrative Fine Infringement Notice',
      headerSeal: 'COAT_OF_ARMS_REPUBLIC_OF_SOUTH_AFRICA',
      salutationEn: 'TO THE INFORMATION OFFICER / CHIEF EXECUTIVE OFFICER,',
      statutoryPreambleEn: 'Pursuant to Section 109 of the Protection of Personal Information Act No. 4 of 2013 (POPIA), this statutory infringement notice is served.',
      enforcementNoticeBodyEn: 'The Information Regulator has determined that a responsible party has breached fundamental conditions for lawful processing of personal information. You are directed to pay the administrative fine or submit a written election to be tried in court.',
      appealNoticeEn: 'You may apply to the High Court of South Africa to review the decision within 30 calendar days.',
      signatureAuthorityEn: 'CHAIRPERSON, INFORMATION REGULATOR (SOUTH AFRICA)'
    }
  ],
  regulators: [
    {
      code: 'INFO_REG',
      name: 'Information Regulator (South Africa)',
      nameLocal: 'Inyathelo Lolwazi (Information Regulator)',
      sector: 'Data Protection (POPIA) & PAIA Transparency',
      sectors: ['data_privacy', 'information_access', 'cyber_incident'],
      enforcementPower: 'full',
      appealBody: 'High Court of South Africa (Gauteng Division)',
      contactEmail: 'enquiries@inforegulator.org.za',
      website: 'https://inforegulator.org.za'
    },
    {
      code: 'FSCA',
      name: 'Financial Sector Conduct Authority',
      nameLocal: 'Financial Sector Conduct Authority',
      sector: 'Market Conduct & FinTech',
      sectors: ['fintech', 'crypto_assets', 'banking'],
      enforcementPower: 'full',
      appealBody: 'Financial Services Tribunal (FST)',
      contactEmail: 'info@fsca.co.za',
      website: 'https://www.fsca.co.za'
    },
    {
      code: 'FIC',
      name: 'Financial Intelligence Centre',
      nameLocal: 'Financial Intelligence Centre',
      sector: 'AML/CFT & FICA Compliance',
      sectors: ['aml', 'counter_terrorist_financing', 'forex'],
      enforcementPower: 'full',
      appealBody: 'FIC Appeal Board',
      contactEmail: 'compliance@fic.gov.za',
      website: 'https://www.fic.gov.za'
    }
  ],
  laws: [
    {
      code: 'POPIA_2013',
      title: 'Protection of Personal Information Act No. 4 of 2013 (POPIA)',
      regulatorCode: 'INFO_REG',
      language: 'en',
      officialGazetteRef: 'Government Gazette No. 37067 (Nov 26, 2013)',
      effectiveFrom: '2020-07-01',
      status: 'active',
      version: 1,
      rules: [
        {
          section: 'Section 107',
          title: 'Failure to Comply with Enforcement Notice or Obstruction of Information Regulator',
          violationType: 'POPIA_ENFORCEMENT_DEFAULT',
          penaltyType: 'range',
          minPenalty: 100000,
          maxPenalty: 10000000, // Up to ZAR 10 Million
          currency: 'ZAR',
          severityGrade: 'critical',
          repeatMultiplier: 2.0,
          paymentDeadlineDays: 30,
          appealWindowDays: 30,
          imprisonmentNote: 'Imprisonment for a period up to 10 years or fine or both',
          autoEnforceable: true
        }
      ]
    }
  ]
};
