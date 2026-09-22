import { CountryPackManifest } from '../../_template/pack.manifest';

export const NIGERIA_PACK: CountryPackManifest = {
  countryCode: 'NG',
  countryName: 'Nigeria',
  regionCode: 'africa',
  currencyCode: 'NGN',
  languages: ['en'],
  primaryLanguage: 'en',
  timezone: 'Africa/Lagos',
  legalSystem: 'mixed',
  dataResidencyRequired: false,
  internationalSanctionsList: ['UN', 'OFAC', 'NFIU_PEP_LIST'],
  scannerLegalGate: 'standard',
  govtMouRequired: false,
  packVersion: '1.1.0',
  status: 'active',
  fxSource: 'CENTRAL_BANK_OF_NIGERIA_NAFEX',
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
  registryIntegration: {
    cacLookupUrl: 'https://search.cac.gov.ng'
  },
  letterTemplateSet: [
    {
      templateId: 'NG_NDPC_PENALTY_DEMAND',
      title: 'Nigeria Data Protection Commission (NDPC) Statutory Administrative Penalty Order',
      headerSeal: 'FEDERAL_REPUBLIC_OF_NIGERIA_OFFICIAL_CREST',
      salutationEn: 'TO THE MANAGING DIRECTOR AND DATA PROTECTION OFFICER,',
      statutoryPreambleEn: 'Pursuant to Sections 48 and 49 of the Nigeria Data Protection Act (NDPA) 2023, this statutory enforcement demand is issued.',
      enforcementNoticeBodyEn: 'The Commission has established prima facie evidence of a major personal data breach or unauthorized cross-border processing without adequate safeguards. You are required to remit the administrative fine (fixed or 2% annual gross turnover) within 21 days.',
      appealNoticeEn: 'You are entitled to judicial review before the Federal High Court of Nigeria within 30 days of service.',
      signatureAuthorityEn: 'NATIONAL COMMISSIONER & CEO, NIGERIA DATA PROTECTION COMMISSION'
    }
  ],
  regulators: [
    {
      code: 'NDPC',
      name: 'Nigeria Data Protection Commission',
      nameLocal: 'Nigeria Data Protection Commission',
      sector: 'Data Privacy & Cloud Sovereignty',
      sectors: ['data_privacy', 'cybersecurity', 'cloud'],
      enforcementPower: 'full',
      appealBody: 'Federal High Court of Nigeria',
      contactEmail: 'enforcement@ndpc.gov.ng',
      website: 'https://ndpc.gov.ng'
    },
    {
      code: 'CBN',
      name: 'Central Bank of Nigeria',
      nameLocal: 'Central Bank of Nigeria',
      sector: 'Banking, FinTech & AML',
      sectors: ['banking', 'fintech', 'aml', 'forex'],
      enforcementPower: 'full',
      appealBody: 'Court of Appeal (Commercial Division)',
      contactEmail: 'fprd@cbn.gov.ng',
      website: 'https://www.cbn.gov.ng'
    },
    {
      code: 'NCC',
      name: 'Nigerian Communications Commission',
      nameLocal: 'Nigerian Communications Commission',
      sector: 'Telecommunications & Spectrum',
      sectors: ['telecom', 'isp', 'spectrum'],
      enforcementPower: 'full',
      appealBody: 'Federal High Court',
      contactEmail: 'ncc@ncc.gov.ng',
      website: 'https://www.ncc.gov.ng'
    },
    {
      code: 'FCCPC',
      name: 'Federal Competition and Consumer Protection Commission',
      nameLocal: 'Federal Competition and Consumer Protection Commission',
      sector: 'Consumer Rights & Anti-Predatory Digital Lending',
      sectors: ['consumer_protection', 'digital_lending', 'fintech'],
      enforcementPower: 'full',
      appealBody: 'Competition and Consumer Protection Tribunal (CCPT)',
      contactEmail: 'contact@fccpc.gov.ng',
      website: 'https://fccpc.gov.ng'
    }
  ],
  laws: [
    {
      code: 'NDPA_2023',
      title: 'Nigeria Data Protection Act, 2023',
      regulatorCode: 'NDPC',
      language: 'en',
      officialGazetteRef: 'Official Gazette No. 104, Vol. 110 (2023)',
      effectiveFrom: '2023-06-12',
      status: 'active',
      version: 1,
      rules: [
        {
          section: 'Section 48(1)(a)',
          title: 'Major Data Protection Breach by Data Controller of Major Importance',
          violationType: 'NDPA_MAJOR_BREACH',
          penaltyType: 'percent_revenue',
          minPenalty: 10000000,
          maxPenalty: 500000000,
          revenuePercent: 2.0,
          currency: 'NGN',
          severityGrade: 'critical',
          repeatMultiplier: 2.0,
          paymentDeadlineDays: 21,
          appealWindowDays: 30,
          autoEnforceable: true
        },
        {
          section: 'Section 41',
          title: 'Unlawful Cross-Border Transfer of Sensitive Personal Data without Adequacy Decision',
          violationType: 'CROSS_BORDER_TRANSFER_VIOLATION',
          penaltyType: 'range',
          minPenalty: 5000000,
          maxPenalty: 50000000,
          currency: 'NGN',
          severityGrade: 'major',
          repeatMultiplier: 1.5,
          paymentDeadlineDays: 30,
          appealWindowDays: 30,
          autoEnforceable: true
        }
      ]
    },
    {
      code: 'CBN_AML_CFT_2022',
      title: 'Central Bank of Nigeria (Anti-Money Laundering and Combating the Financing of Terrorism) Regulations',
      regulatorCode: 'CBN',
      language: 'en',
      effectiveFrom: '2022-04-01',
      status: 'active',
      version: 1,
      rules: [
        {
          section: 'Regulation 15',
          title: 'Failure to Conduct Enhanced Due Diligence (EDD) on High-Risk Digital Asset Transactions',
          violationType: 'AML_EDD_FAILURE',
          penaltyType: 'fixed',
          minPenalty: 25000000,
          maxPenalty: 100000000,
          currency: 'NGN',
          severityGrade: 'major',
          repeatMultiplier: 1.5,
          paymentDeadlineDays: 30,
          appealWindowDays: 14,
          autoEnforceable: true
        }
      ]
    }
  ]
};
