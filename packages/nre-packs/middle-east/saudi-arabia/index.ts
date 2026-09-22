import { CountryPackManifest } from '../../_template/pack.manifest';

export const SAUDI_ARABIA_PACK: CountryPackManifest = {
  countryCode: 'SA',
  countryName: 'Saudi Arabia',
  regionCode: 'middle_east',
  currencyCode: 'SAR',
  languages: ['ar', 'en'],
  primaryLanguage: 'ar',
  timezone: 'Asia/Riyadh',
  legalSystem: 'sharia_based',
  dataResidencyRequired: true,
  internationalSanctionsList: ['UN', 'OFAC', 'SAUDI_CTP_LIST'],
  scannerLegalGate: 'government_mou_required',
  govtMouRequired: true,
  packVersion: '1.1.0',
  status: 'active',
  fxSource: 'SAUDI_CENTRAL_BANK_SAMA',
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
    languagePriority: ['ar', 'en']
  },
  letterTemplateSet: [
    {
      templateId: 'SA_SDAIA_PENALTY_DECISION',
      title: 'قرار عقوبة إدارية ومخالفة نظام حماية البيانات الشخصية - المملكة العربية السعودية',
      headerSeal: 'EMBLEM_KINGDOM_OF_SAUDI_ARABIA_PALM_SWORDS',
      salutationEn: 'TO THE CHIEF EXECUTIVE OFFICER / AUTHORIZED REPRESENTATIVE,',
      salutationLocal: 'إلى سعادة الرئيس التنفيذي والممثل النظامي للمنشأة،',
      statutoryPreambleEn: 'Pursuant to Royal Decree No. M/19 (as amended by Royal Decree No. M/148) enacting the Personal Data Protection Law (PDPL), this administrative penalty is determined.',
      statutoryPreambleLocal: 'بناءً على المرسوم الملكي رقم م/19 وتعديلاته بالمرسوم الملكي م/148 بشأن نظام حماية البيانات الشخصية ولائحته التنفيذية، صدر هذا القرار.',
      enforcementNoticeBodyEn: 'Audited telemetry indicates unlawful disclosure or cross-border transmission of sensitive citizen records without sovereign authorization. You must deposit the fine into the Public Revenue Account within 30 days.',
      enforcementNoticeBodyLocal: 'بينت نتائج الرصد وجود إفشاء أو نقل غير نظامي لبيانات حساسة دون ترخيص سيادي مسبق. يلزم إيداع الغرامة في حساب الإيرادات العامة خلال 30 يوماً.',
      appealNoticeEn: 'A petition may be submitted before the Administrative Court (Board of Grievances) within 60 days.',
      appealNoticeLocal: 'يحق للمنشأة الاعتراض أمام المحكمة الإدارية (ديوان المظالم) خلال 60 يوماً من تاريخ التبليغ.',
      signatureAuthorityEn: 'PRESIDENT, SAUDI DATA & AI AUTHORITY (SDAIA - NDMO)',
      signatureAuthorityLocal: 'رئيس الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)'
    }
  ],
  regulators: [
    {
      code: 'SDAIA',
      name: 'Saudi Data & Artificial Intelligence Authority (NDMO)',
      nameLocal: 'الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)',
      sector: 'Data Privacy (PDPL) & AI Sovereignty',
      sectors: ['data_privacy', 'ai_governance', 'cloud_sovereignty'],
      enforcementPower: 'full',
      appealBody: 'Board of Grievances (Administrative Court)',
      contactEmail: 'compliance@sdaia.gov.sa',
      website: 'https://sdaia.gov.sa'
    },
    {
      code: 'SAMA',
      name: 'Saudi Central Bank',
      nameLocal: 'البنك المركزي السعودي',
      sector: 'Banking, Payment Systems & FinTech',
      sectors: ['banking', 'fintech', 'payments', 'aml'],
      enforcementPower: 'full',
      appealBody: 'Committee for Banking Disputes and Violations',
      contactEmail: 'info@sama.gov.sa',
      website: 'https://www.sama.gov.sa'
    },
    {
      code: 'CMA',
      name: 'Capital Market Authority',
      nameLocal: 'هيئة السوق المالية',
      sector: 'Securities, Asset Management & FinTech Labs',
      sectors: ['securities', 'crowdfunding', 'crypto_assets'],
      enforcementPower: 'full',
      appealBody: 'Committee for Resolution of Securities Disputes (CRSD)',
      contactEmail: 'info@cma.org.sa',
      website: 'https://cma.org.sa'
    },
    {
      code: 'CST',
      name: 'Communications, Space and Technology Commission',
      nameLocal: 'هيئة الاتصالات والفضاء والتقنية',
      sector: 'Telecom, Cloud Infrastructure & Domain Name Sovereignty',
      sectors: ['telecom', 'cloud', 'cybersecurity'],
      enforcementPower: 'full',
      appealBody: 'Administrative Court',
      contactEmail: 'info@cst.gov.sa',
      website: 'https://www.cst.gov.sa'
    }
  ],
  laws: [
    {
      code: 'PDPL_ROYAL_DECREE_M19',
      title: 'Personal Data Protection Law (PDPL - Royal Decree No. M/19 / Amended M/148)',
      titleLocal: 'نظام حماية البيانات الشخصية الصادر بالمرسوم الملكي رقم (م/19)',
      regulatorCode: 'SDAIA',
      language: 'ar',
      officialGazetteRef: 'Umm Al-Qura Gazette Issue 4902',
      effectiveFrom: '2023-09-14',
      status: 'active',
      version: 2,
      rules: [
        {
          section: 'Article 35',
          title: 'Unlawful Disclosure or Publication of Sensitive Personal Data',
          titleLocal: 'الإفشاء غير النظامي للبيانات الشخصية الحساسة أو نشرها',
          violationType: 'SENSITIVE_DATA_DISCLOSURE',
          penaltyType: 'range',
          minPenalty: 250000,
          maxPenalty: 5000000,
          currency: 'SAR',
          severityGrade: 'critical',
          repeatMultiplier: 2.0,
          paymentDeadlineDays: 30,
          appealWindowDays: 60,
          imprisonmentNote: 'Imprisonment up to 2 years for intentional violation with intent to cause harm',
          autoEnforceable: true
        },
        {
          section: 'Article 29',
          title: 'Transfer of Personal Data Outside the Kingdom Breaching Sovereignty Safeguards',
          titleLocal: 'نقل البيانات الشخصية خارج المملكة بالمخالفة لضوابط السيادة الوطنية',
          violationType: 'ILLEGAL_DATA_EXPORT',
          penaltyType: 'range',
          minPenalty: 500000,
          maxPenalty: 3000000,
          currency: 'SAR',
          severityGrade: 'critical',
          repeatMultiplier: 1.75,
          paymentDeadlineDays: 30,
          appealWindowDays: 30,
          autoEnforceable: true
        }
      ]
    }
  ]
};
