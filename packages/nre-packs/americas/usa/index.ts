import { CountryPackManifest } from '../../_template/pack.manifest';

export const USA_PACK: CountryPackManifest = {
  countryCode: 'US',
  countryName: 'United States of America',
  regionCode: 'americas',
  currencyCode: 'USD',
  languages: ['en', 'es'],
  primaryLanguage: 'en',
  timezone: 'America/New_York',
  legalSystem: 'common_law',
  dataResidencyRequired: false,
  internationalSanctionsList: ['OFAC_SDN', 'BIS_ENTITY_LIST', 'FINCEN_SPECIAL_MEASURES'],
  scannerLegalGate: 'standard',
  govtMouRequired: false,
  packVersion: '1.3.0',
  status: 'active',
  fxSource: 'FEDERAL_RESERVE_H10',
  scannerConfig: {
    robotsPolicy: 'standard',
    crawlDepth: 5,
    githubEnabled: true,
    cloudScan: 'standard',
    registrySource: 'official_api'
  },
  notificationChannels: {
    email: true,
    whatsapp: false,
    wechat: false,
    smsFallback: false,
    physicalLetter: true,
    languagePriority: ['en', 'es']
  },
  letterTemplateSet: [
    {
      templateId: 'US_FTC_CIVIL_INVESTIGATIVE_DEMAND',
      title: 'Federal Trade Commission - Civil Investigative Demand (CID) & Penalty Assessment',
      headerSeal: 'SEAL_FEDERAL_TRADE_COMMISSION_US',
      salutationEn: 'TO: CHIEF EXECUTIVE OFFICER AND GENERAL COUNSEL,',
      statutoryPreambleEn: 'Pursuant to Section 5 and Section 20 of the Federal Trade Commission Act, 15 U.S.C. § 45 & § 57b-1, you are hereby notified of assessed civil penalties for unfair or deceptive acts or practices.',
      enforcementNoticeBodyEn: 'Surveillance evidence demonstrates deceptive privacy policy statements and failure to maintain reasonable data security for consumer information. You are ordered to tender settlement or answer interrogatories within 30 days.',
      appealNoticeEn: 'You may petition the Commission to limit or quash this demand pursuant to 16 C.F.R. § 2.10.',
      signatureAuthorityEn: 'SECRETARY OF THE COMMISSION, FEDERAL TRADE COMMISSION (WASHINGTON, D.C.)'
    }
  ],
  regulators: [
    {
      code: 'SEC',
      name: 'Securities and Exchange Commission',
      nameLocal: 'U.S. Securities and Exchange Commission',
      sector: 'Securities, AI Disclosures & Public Company Cyber Reporting',
      sectors: ['securities', 'public_disclosure', 'cybersecurity_reporting'],
      enforcementPower: 'full',
      appealBody: 'U.S. Court of Appeals (D.C. Circuit)',
      contactEmail: 'enforcement@sec.gov',
      website: 'https://www.sec.gov'
    },
    {
      code: 'FTC',
      name: 'Federal Trade Commission',
      nameLocal: 'Federal Trade Commission',
      sector: 'Consumer Protection, Deceptive Privacy & AI Fairness',
      sectors: ['consumer_protection', 'data_privacy', 'ai_fairness'],
      enforcementPower: 'full',
      appealBody: 'Federal District Court',
      contactEmail: 'consumercomplaints@ftc.gov',
      website: 'https://www.ftc.gov'
    },
    {
      code: 'CFPB',
      name: 'Consumer Financial Protection Bureau',
      nameLocal: 'Consumer Financial Protection Bureau',
      sector: 'Consumer Finance & UDAAP Enforcement',
      sectors: ['fintech', 'lending', 'consumer_finance'],
      enforcementPower: 'full',
      appealBody: 'U.S. Court of Appeals',
      contactEmail: 'compliance@cfpb.gov',
      website: 'https://www.consumerfinance.gov'
    },
    {
      code: 'OFAC',
      name: 'Office of Foreign Assets Control (US Treasury)',
      nameLocal: 'Office of Foreign Assets Control',
      sector: 'Economic Sanctions & Specially Designated Nationals (SDN)',
      sectors: ['sanctions', 'aml', 'crypto_compliance'],
      enforcementPower: 'full',
      appealBody: 'U.S. District Court (District of Columbia)',
      contactEmail: 'ofac_feedback@treasury.gov',
      website: 'https://home.treasury.gov/policy-issues/office-of-foreign-assets-control-sanctions-programs-and-information'
    },
    {
      code: 'CPPA',
      name: 'California Privacy Protection Agency',
      nameLocal: 'California Privacy Protection Agency (CPPA)',
      sector: 'State Privacy (CCPA / CPRA & Automated Decisionmaking)',
      sectors: ['state_privacy', 'profiling', 'consumer_rights'],
      enforcementPower: 'full',
      appealBody: 'California Superior Court',
      contactEmail: 'enforcement@cppa.ca.gov',
      website: 'https://cppa.ca.gov'
    }
  ],
  laws: [
    {
      code: 'FTC_ACT_SEC5',
      title: 'Federal Trade Commission Act, 15 U.S.C. § 45 (Section 5)',
      regulatorCode: 'FTC',
      language: 'en',
      effectiveFrom: '1914-09-26',
      status: 'active',
      version: 3,
      rules: [
        {
          section: 'Section 5(a)',
          title: 'Unfair or Deceptive Acts or Practices (UDAP) & Privacy Safeguard Misrepresentation',
          violationType: 'DECEPTIVE_PRIVACY_PRACTICE',
          penaltyType: 'per_day',
          minPenalty: 50120, // Federal civil penalty statutory indexed rate
          maxPenalty: 5012000,
          dailyAccrual: 50120,
          currency: 'USD',
          severityGrade: 'critical',
          repeatMultiplier: 1.5,
          paymentDeadlineDays: 30,
          appealWindowDays: 60,
          autoEnforceable: true
        }
      ]
    },
    {
      code: 'CCPA_CPRA',
      title: 'California Consumer Privacy Act of 2018 (as amended by CPRA)',
      regulatorCode: 'CPPA',
      language: 'en',
      effectiveFrom: '2023-01-01',
      status: 'active',
      version: 2,
      rules: [
        {
          section: 'Cal. Civ. Code § 1798.199.90',
          title: 'Intentional Violation of Consumer Privacy & Opt-Out Mandates',
          violationType: 'CCPA_INTENTIONAL_BREACH',
          penaltyType: 'range',
          minPenalty: 2500,
          maxPenalty: 7500, // per violation count
          currency: 'USD',
          severityGrade: 'major',
          repeatMultiplier: 1.5,
          paymentDeadlineDays: 30,
          appealWindowDays: 30,
          autoEnforceable: true
        }
      ]
    },
    {
      code: 'HIPAA_HITECH',
      title: 'Health Insurance Portability and Accountability Act (HIPAA)',
      regulatorCode: 'FTC',
      language: 'en',
      effectiveFrom: '2009-02-17',
      status: 'active',
      version: 2,
      rules: [
        {
          section: '45 CFR Part 160 & 164',
          title: 'Willful Neglect in Securing Protected Health Information (PHI)',
          violationType: 'PHI_DATA_BREACH',
          penaltyType: 'range',
          minPenalty: 50000,
          maxPenalty: 2000000,
          currency: 'USD',
          severityGrade: 'critical',
          repeatMultiplier: 2.0,
          paymentDeadlineDays: 30,
          appealWindowDays: 30,
          autoEnforceable: true
        }
      ]
    }
  ]
};
