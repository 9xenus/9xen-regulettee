import { CountryPackManifest } from '../../_template/pack.manifest';

export const BANGLADESH_PACK: CountryPackManifest = {
  countryCode: 'BD',
  countryName: 'Bangladesh',
  regionCode: 'asia',
  currencyCode: 'BDT',
  languages: ['bn', 'en'],
  primaryLanguage: 'bn',
  timezone: 'Asia/Dhaka',
  legalSystem: 'common_law',
  dataResidencyRequired: true,
  internationalSanctionsList: ['UN', 'OFAC', 'BFIU_PROSCRIBED_ENTITIES'],
  scannerLegalGate: 'government_mou_required',
  govtMouRequired: true,
  packVersion: '1.2.0',
  status: 'active',
  fxSource: 'BANGLADESH_BANK_OFFICIAL_RATE',
  scannerConfig: {
    robotsPolicy: 'strict',
    crawlDepth: 4,
    githubEnabled: true,
    cloudScan: 'mou_only',
    registrySource: 'official_api'
  },
  notificationChannels: {
    email: true,
    whatsapp: true,
    wechat: false,
    smsFallback: true,
    physicalLetter: true,
    languagePriority: ['bn', 'en']
  },
  registryIntegration: {
    tradeLicenseLookupUrl: 'https://dcc.gov.bd/trade-license/verify',
    taxIdLookupUrl: 'https://incometax.gov.bd/tin-check'
  },
  letterTemplateSet: [
    {
      templateId: 'BD_BTRC_PENALTY_NOTICE',
      title: 'বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (বিটিআরসি) সংবিধিবদ্ধ জরিমানা নোটিশ',
      headerSeal: 'SEAL_PEOPLES_REPUBLIC_OF_BANGLADESH',
      salutationEn: 'TO THE MANAGING DIRECTOR & COMPLIANCE OFFICER,',
      salutationLocal: 'মাননীয় ব্যবস্থাপনা পরিচালক / দায়িত্বপ্রাপ্ত কর্মকর্তা সমীপে,',
      statutoryPreambleEn: 'Under Section 65A and Section 73 of the Bangladesh Telecommunication Regulation Act, 2001 (as amended in 2010), this statutory notice of violation is hereby issued.',
      statutoryPreambleLocal: 'বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ আইন, ২০০১ (২০১০ সনের সংশোধিত) এর ধারা ৬৫(ক) ও ধারা ৭৩ অনুযায়ী এই আইনগত লঙ্ঘন ও দণ্ড নোটিশ জারি করা হইল।',
      enforcementNoticeBodyEn: 'Surveillance telemetry has identified unlicensed telecom routing / critical infrastructure cybersecurity non-compliance. Remit the assessed penalty to the Bangladesh Bank Treasury Chalan within 21 calendar days.',
      enforcementNoticeBodyLocal: 'স্বয়ংক্রিয় মনিটরিং ব্যবস্থায় অননুমোদিত টেলিযোগাযোগ নেটওয়ার্ক পরিচালনা বা সাইবার নিরাপত্তা বিধিভঙ্গের সত্যতা পাওয়া গিয়াছে। ২১ দিনের মধ্যে বাংলাদেশ ব্যাংক চালানের মাধ্যমে জরিমানা পরিশোধের নির্দেশ দেওয়া হইল।',
      appealNoticeEn: 'Any formal petition or dispute may be filed before the Telecom Appellate Tribunal within 14 days of receipt.',
      appealNoticeLocal: 'এই আদেশের বিরুদ্ধে সংক্ষুব্ধ পক্ষ নোটিশ প্রাপ্তির ১৪ দিনের মধ্যে টেলিযোগাযোগ আপিল ট্রাইব্যুনালে আবেদন করিতে পারিবেন।',
      signatureAuthorityEn: 'DIRECTOR GENERAL (LEGAL & LICENSING), BTRC',
      signatureAuthorityLocal: 'মহাপরিচালক (আইন ও লাইসেন্সিং বিভাগ), বিটিআরসি'
    }
  ],
  regulators: [
    {
      code: 'BTRC',
      name: 'Bangladesh Telecommunication Regulatory Commission',
      nameLocal: 'বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন',
      sector: 'Telecom & ISP',
      sectors: ['telecom', 'internet', 'spectrum'],
      enforcementPower: 'full',
      appealBody: 'Telecom Appellate Tribunal',
      contactEmail: 'dg_legal@btrc.gov.bd',
      website: 'http://www.btrc.gov.bd'
    },
    {
      code: 'BB_BFIU',
      name: 'Bangladesh Bank - Bangladesh Financial Intelligence Unit',
      nameLocal: 'বাংলাদেশ ফিন্যান্সিয়াল ইন্টেলিজেন্স ইউনিট (বিএফআইইউ)',
      sector: 'Banking, MFS & FinTech AML',
      sectors: ['finance', 'banking', 'mfs', 'aml'],
      enforcementPower: 'full',
      appealBody: 'High Court Division (Special Commercial Bench)',
      contactEmail: 'bfiu@bb.org.bd',
      website: 'https://www.bb.org.bd/bfiu'
    },
    {
      code: 'DNCRP',
      name: 'Directorate of National Consumers Right Protection',
      nameLocal: 'জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর',
      sector: 'Consumer Rights & E-commerce Fraud',
      sectors: ['consumer_rights', 'ecommerce', 'retail'],
      enforcementPower: 'full',
      appealBody: 'Ministry of Commerce Appellate Authority',
      contactEmail: 'dg@dncrp.gov.bd',
      website: 'https://dncrp.portal.gov.bd'
    },
    {
      code: 'NBR',
      name: 'National Board of Revenue',
      nameLocal: 'জাতীয় রাজস্ব বোর্ড',
      sector: 'Tax, VAT & Customs',
      sectors: ['taxation', 'vat', 'customs'],
      enforcementPower: 'full',
      appealBody: 'Taxes Appellate Tribunal',
      contactEmail: 'member_customs@nbr.gov.bd',
      website: 'https://nbr.gov.bd'
    }
  ],
  laws: [
    {
      code: 'BTR_ACT_2001',
      title: 'Bangladesh Telecommunication Regulation Act, 2001 (Amended 2010)',
      titleLocal: 'বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ আইন, ২০০১ (সংশোধিত ২০১০)',
      regulatorCode: 'BTRC',
      language: 'bn',
      officialGazetteRef: 'BG-Act XVIII of 2001',
      effectiveFrom: '2001-04-16',
      status: 'active',
      version: 2,
      rules: [
        {
          section: 'Section 65A',
          title: 'Unauthorized VoIP Transmission and Spectrum Encroachment',
          titleLocal: 'অননুমোদিত ভিওআইপি এবং অবৈধ স্পেকট্রাম ব্যবহার',
          violationType: 'UNAUTHORIZED_SPECTRUM_AND_VOIP',
          penaltyType: 'range',
          minPenalty: 500000,
          maxPenalty: 10000000,
          currency: 'BDT',
          severityGrade: 'critical',
          repeatMultiplier: 2.0,
          paymentDeadlineDays: 21,
          appealWindowDays: 14,
          imprisonmentNote: 'Rigorous imprisonment for a term up to 5 years or fine or both',
          autoEnforceable: true
        },
        {
          section: 'Section 73',
          title: 'Breach of General License and QoS Directives',
          titleLocal: 'লাইসেন্স শর্তাবলী ও সেবার মান লঙ্ঘন',
          violationType: 'LICENSE_MANDATE_BREACH',
          penaltyType: 'per_day',
          minPenalty: 100000,
          maxPenalty: 5000000,
          dailyAccrual: 50000,
          currency: 'BDT',
          severityGrade: 'major',
          repeatMultiplier: 1.5,
          paymentDeadlineDays: 30,
          appealWindowDays: 14,
          autoEnforceable: true
        }
      ]
    },
    {
      code: 'CSA_2023',
      title: 'Cyber Security Act, 2023',
      titleLocal: 'সাইবার নিরাপত্তা আইন, ২০২৩',
      regulatorCode: 'BTRC',
      language: 'bn',
      officialGazetteRef: 'Gazette Extra 2023, Act No. 27',
      effectiveFrom: '2023-09-18',
      status: 'active',
      version: 1,
      rules: [
        {
          section: 'Section 17',
          title: 'Illegal Penetration into Critical Information Infrastructure (CII)',
          titleLocal: 'গুরুত্বপূর্ণ তথ্য পরিকাঠামোতে বেআইনি প্রবেশ',
          violationType: 'CII_INTRUSION_BREACH',
          penaltyType: 'range',
          minPenalty: 2500000,
          maxPenalty: 10000000,
          currency: 'BDT',
          severityGrade: 'critical',
          repeatMultiplier: 2.0,
          paymentDeadlineDays: 15,
          appealWindowDays: 7,
          imprisonmentNote: 'Imprisonment up to 7 years with administrative fine',
          autoEnforceable: true
        },
        {
          section: 'Section 26',
          title: 'Unlawful Collection and Processing of Identity Information',
          titleLocal: 'অনুমতি ছাড়া পরিচিতি তথ্য সংগ্রহ ও ব্যবহার',
          violationType: 'DATA_PRIVACY_VIOLATION',
          penaltyType: 'range',
          minPenalty: 500000,
          maxPenalty: 3000000,
          currency: 'BDT',
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
