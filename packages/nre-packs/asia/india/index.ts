import { CountryPackManifest } from '../../_template/pack.manifest';

export const INDIA_PACK: CountryPackManifest = {
  countryCode: 'IN',
  countryName: 'India',
  regionCode: 'asia',
  currencyCode: 'INR',
  languages: ['en', 'hi'],
  primaryLanguage: 'en',
  timezone: 'Asia/Kolkata',
  legalSystem: 'common_law',
  dataResidencyRequired: true,
  internationalSanctionsList: ['UN', 'OFAC', 'MHA_UAPA_DESIGNATED'],
  scannerLegalGate: 'standard',
  govtMouRequired: false,
  packVersion: '1.2.0',
  status: 'active',
  fxSource: 'RESERVE_BANK_OF_INDIA_FBIL',
  scannerConfig: {
    robotsPolicy: 'standard',
    crawlDepth: 5,
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
    languagePriority: ['en', 'hi']
  },
  letterTemplateSet: [
    {
      templateId: 'IN_DPDPA_PENALTY_NOTICE',
      title: 'Data Protection Board of India - Statutory Penalty Determination and Notice',
      headerSeal: 'EMBLEM_OF_INDIA_LION_CAPITAL',
      salutationEn: 'TO THE MANAGING DIRECTOR & PRINCIPAL OFFICER,',
      salutationLocal: 'सेवा में: प्रबंध निदेशक एवं मुख्य अनुपालन अधिकारी,',
      statutoryPreambleEn: 'In exercise of the powers conferred by Section 28 and Section 33 of the Digital Personal Data Protection Act, 2023, the Data Protection Board hereby issues this notice of significant breach.',
      statutoryPreambleLocal: 'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 की धारा 28 एवं 33 के तहत प्रदत्त शक्तियों का प्रयोग करते हुए यह संविधिक नोटिस जारी किया जाता है।',
      enforcementNoticeBodyEn: 'The automated surveillance engine has found substantial failure to observe reasonable security safeguards under the Schedule to the Act. You are directed to deposit the prescribed penalty into the Consolidated Fund of India within 30 days.',
      enforcementNoticeBodyLocal: 'डिजिटल व्यक्तिगत डेटा संरक्षण के लिए उचित सुरक्षा उपाय करने में विफलता पाई गई है। निर्धारित जुर्माना राशि 30 दिनों के भीतर जमा करने का निर्देश दिया जाता है।',
      appealNoticeEn: 'An appeal against this determination lies before the Telecom Disputes Settlement and Appellate Tribunal (TDSAT) within 60 days.',
      appealNoticeLocal: 'इस निर्णय के विरुद्ध 60 दिनों के भीतर टीडीसैट (TDSAT) में अपील दायर की जा सकती है।',
      signatureAuthorityEn: 'SECRETARY, DATA PROTECTION BOARD OF INDIA',
      signatureAuthorityLocal: 'सचिव, भारत डेटा संरक्षण बोर्ड'
    }
  ],
  regulators: [
    {
      code: 'DPDPA_BOARD',
      name: 'Data Protection Board of India',
      nameLocal: 'भारतीय डेटा संरक्षण बोर्ड',
      sector: 'Data Privacy & Principal Rights',
      sectors: ['data_privacy', 'ai_governance', 'cloud'],
      enforcementPower: 'full',
      appealBody: 'Telecom Disputes Settlement and Appellate Tribunal (TDSAT)',
      contactEmail: 'adjudication@dpbi.gov.in',
      website: 'https://dpbi.gov.in'
    },
    {
      code: 'RBI',
      name: 'Reserve Bank of India',
      nameLocal: 'भारतीय रिज़र्व बैंक',
      sector: 'Banking, FinTech & Payment Localization',
      sectors: ['banking', 'payments', 'fintech', 'aml'],
      enforcementPower: 'full',
      appealBody: 'Appellate Tribunal for Forfeited Property / High Court',
      contactEmail: 'helpdpss@rbi.org.in',
      website: 'https://www.rbi.org.in'
    },
    {
      code: 'SEBI',
      name: 'Securities and Exchange Board of India',
      nameLocal: 'भारतीय प्रतिभूति और विनिमय बोर्ड',
      sector: 'Capital Markets & Algorithmic Trading',
      sectors: ['securities', 'stock_exchanges', 'fintech'],
      enforcementPower: 'full',
      appealBody: 'Securities Appellate Tribunal (SAT)',
      contactEmail: 'sebi@sebi.gov.in',
      website: 'https://www.sebi.gov.in'
    },
    {
      code: 'CERT_IN',
      name: 'Indian Computer Emergency Response Team',
      nameLocal: 'भारतीय कंप्यूटर आपातकालीन प्रतिक्रिया टीम',
      sector: 'Cybersecurity Incident Response & Mandatory 6-Hour Reporting',
      sectors: ['cybersecurity', 'incident_reporting', 'infrastructure'],
      enforcementPower: 'full',
      appealBody: 'Cyber Appellate Tribunal',
      contactEmail: 'incident@cert-in.org.in',
      website: 'https://www.cert-in.org.in'
    }
  ],
  laws: [
    {
      code: 'DPDP_ACT_2023',
      title: 'Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)',
      titleLocal: 'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023',
      regulatorCode: 'DPDPA_BOARD',
      language: 'en',
      officialGazetteRef: 'Gazette of India, Extraordinary, Part II, Section 1 (Aug 11, 2023)',
      effectiveFrom: '2023-08-11',
      status: 'active',
      version: 1,
      rules: [
        {
          section: 'Section 8(6) & Schedule',
          title: 'Breach in Observing Safety Measures to Prevent Personal Data Breach',
          violationType: 'SECURITY_SAFEGUARD_FAILURE',
          penaltyType: 'range',
          minPenalty: 50000000,
          maxPenalty: 2500000000, // Up to INR 250 Crore
          currency: 'INR',
          severityGrade: 'critical',
          repeatMultiplier: 2.0,
          paymentDeadlineDays: 30,
          appealWindowDays: 60,
          autoEnforceable: true
        },
        {
          section: 'Section 9(4)',
          title: 'Failure to Notify Data Protection Board and Impacted Data Principals of Breach',
          violationType: 'FAILURE_TO_NOTIFY_BREACH',
          penaltyType: 'range',
          minPenalty: 10000000,
          maxPenalty: 2000000000, // Up to INR 200 Crore
          currency: 'INR',
          severityGrade: 'critical',
          repeatMultiplier: 1.5,
          paymentDeadlineDays: 30,
          appealWindowDays: 60,
          autoEnforceable: true
        }
      ]
    },
    {
      code: 'IT_ACT_2000_CERT',
      title: 'Information Technology Act, 2000 & CERT-In Directives 2022',
      regulatorCode: 'CERT_IN',
      language: 'en',
      effectiveFrom: '2022-04-28',
      status: 'active',
      version: 2,
      rules: [
        {
          section: 'Section 70B(7)',
          title: 'Failure to Report Cyber Incidents to CERT-In within 6 Hours',
          violationType: 'CERT_IN_REPORTING_DEFAULT',
          penaltyType: 'range',
          minPenalty: 100000,
          maxPenalty: 1000000,
          currency: 'INR',
          severityGrade: 'major',
          repeatMultiplier: 1.5,
          paymentDeadlineDays: 15,
          appealWindowDays: 14,
          imprisonmentNote: 'Imprisonment for a term up to 1 year or fine up to 1 Lakh INR',
          autoEnforceable: true
        }
      ]
    }
  ]
};
