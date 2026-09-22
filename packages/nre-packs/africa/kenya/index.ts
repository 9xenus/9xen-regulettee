import { CountryPackManifest } from '../../_template/pack.manifest';

export const KENYA_PACK: CountryPackManifest = {
  countryCode: 'KE',
  countryName: 'Kenya',
  regionCode: 'africa',
  currencyCode: 'KES',
  languages: ['en', 'sw'],
  primaryLanguage: 'en',
  timezone: 'Africa/Nairobi',
  legalSystem: 'common_law',
  dataResidencyRequired: false,
  internationalSanctionsList: ['UN', 'OFAC', 'FRC_SANCTIONS_LIST'],
  scannerLegalGate: 'standard',
  govtMouRequired: false,
  packVersion: '1.0.0',
  status: 'active',
  fxSource: 'CENTRAL_BANK_OF_KENYA',
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
    languagePriority: ['en', 'sw']
  },
  letterTemplateSet: [
    {
      templateId: 'KE_ODPC_PENALTY_NOTICE',
      title: 'Office of the Data Protection Commissioner (ODPC) Statutory Penalty Notice',
      headerSeal: 'COURT_OF_ARMS_REPUBLIC_OF_KENYA',
      salutationEn: 'TO THE MANAGING DIRECTOR AND DATA PROTECTION OFFICER,',
      salutationLocal: 'KWA MKURUGENZI MTENDAJI NA AFISA WA ULINZI WA DATA,',
      statutoryPreambleEn: 'In accordance with Section 63 of the Data Protection Act No. 24 of 2019, this penalty notice is formally served.',
      statutoryPreambleLocal: 'Kwa mujibu wa Kifungu cha 63 cha Sheria ya Ulinzi wa Data ya 2019, notisi hii ya adhabu inatolewa rasmi.',
      enforcementNoticeBodyEn: 'Surveillance logs indicate failure to observe data subject rights or unnotified data breach. Remit the statutory penalty to the National Treasury within 30 days.',
      enforcementNoticeBodyLocal: 'Uchunguzi umebaini ukiukaji wa haki za wamiliki wa data au uvunjifu wa usalama. Lipa faini husika kwa Hazina Kuu ya Kitaifa ndani ya siku 30.',
      appealNoticeEn: 'You have the right to appeal to the High Court of Kenya within thirty (30) days of receipt of this notice.',
      appealNoticeLocal: 'Una haki ya kukata rufaa katika Mahakama Kuu ya Kenya ndani ya siku thelathini (30).',
      signatureAuthorityEn: 'DATA PROTECTION COMMISSIONER, REPUBLIC OF KENYA',
      signatureAuthorityLocal: 'KAMISHNA WA ULINZI WA DATA, JAMHURI YA KENYA'
    }
  ],
  regulators: [
    {
      code: 'ODPC',
      name: 'Office of the Data Protection Commissioner',
      nameLocal: 'Ofisi ya Kamishna wa Ulinzi wa Data',
      sector: 'Data Privacy & Digital Rights',
      sectors: ['data_privacy', 'fintech', 'ai'],
      enforcementPower: 'full',
      appealBody: 'High Court of Kenya (Commercial & Tax Division)',
      contactEmail: 'info@odpc.go.ke',
      website: 'https://www.odpc.go.ke'
    },
    {
      code: 'CBK',
      name: 'Central Bank of Kenya',
      nameLocal: 'Benki Kuu ya Kenya',
      sector: 'Banking & Mobile Money (M-Pesa / PSPs)',
      sectors: ['banking', 'mobile_money', 'aml', 'forex'],
      enforcementPower: 'full',
      appealBody: 'High Court of Kenya',
      contactEmail: 'comms@centralbank.go.ke',
      website: 'https://www.centralbank.go.ke'
    },
    {
      code: 'CA',
      name: 'Communications Authority of Kenya',
      nameLocal: 'Mamlaka ya Mawasiliano ya Kenya',
      sector: 'Telecom & Electronic Transactions',
      sectors: ['telecom', 'broadcasting', 'cybersecurity'],
      enforcementPower: 'full',
      appealBody: 'Communications and Multimedia Appeals Tribunal (CAMAT)',
      contactEmail: 'info@ca.go.ke',
      website: 'https://www.ca.go.ke'
    }
  ],
  laws: [
    {
      code: 'DPA_2019',
      title: 'Data Protection Act, 2019 (Act No. 24 of 2019)',
      regulatorCode: 'ODPC',
      language: 'en',
      officialGazetteRef: 'Kenya Gazette Supplement No. 181',
      effectiveFrom: '2019-11-25',
      status: 'active',
      version: 1,
      rules: [
        {
          section: 'Section 63',
          title: 'Failure to Comply with Penalty Notice or Statutory Enforcement Order',
          violationType: 'STATUTORY_CONTEMPT',
          penaltyType: 'range',
          minPenalty: 500000,
          maxPenalty: 5000000,
          currency: 'KES',
          severityGrade: 'major',
          repeatMultiplier: 1.5,
          paymentDeadlineDays: 30,
          appealWindowDays: 30,
          autoEnforceable: true
        }
      ]
    }
  ]
};
