import { CountryPackManifest } from '../../_template/pack.manifest';

export const UAE_PACK: CountryPackManifest = {
  countryCode: 'AE',
  countryName: 'United Arab Emirates',
  regionCode: 'middle_east',
  currencyCode: 'AED',
  languages: ['ar', 'en'],
  primaryLanguage: 'ar',
  timezone: 'Asia/Dubai',
  legalSystem: 'mixed',
  dataResidencyRequired: true,
  internationalSanctionsList: ['UN', 'OFAC', 'NAMLCFTC_LOCAL_LIST'],
  scannerLegalGate: 'government_mou_required',
  govtMouRequired: true,
  packVersion: '1.2.0',
  status: 'active',
  fxSource: 'CENTRAL_BANK_OF_UAE',
  scannerConfig: {
    robotsPolicy: 'strict',
    crawlDepth: 5,
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
      templateId: 'UAE_DPO_ENFORCEMENT_NOTICE',
      title: 'إشعار رسمي بمخالفة قانون حماية البيانات الشخصية - دولة الإمارات العربية المتحدة',
      headerSeal: 'SEAL_UNITED_ARAB_EMIRATES_FEDERAL',
      salutationEn: 'TO THE CHIEF EXECUTIVE OFFICER / DATA PROTECTION OFFICER,',
      salutationLocal: 'إلى السيد الرئيس التنفيذي ومسؤول حماية البيانات،',
      statutoryPreambleEn: 'Pursuant to Federal Decree-Law No. 45 of 2021 regarding Personal Data Protection, notice of audited non-compliance is hereby served.',
      statutoryPreambleLocal: 'استناداً إلى أحكام المرسوم بقانون اتحادي رقم 45 لسنة 2021 في شأن حماية البيانات الشخصية، يتم إخطاركم بوجود مخالفات قانونية مثبتة.',
      enforcementNoticeBodyEn: 'The autonomous compliance engine has detected unauthorized cross-border transfers or inadequate technical safeguards. You are required to remit the fine or submit representations within 30 days.',
      enforcementNoticeBodyLocal: 'أظهرت عمليات الرصد وجود نقل غير مصرح به للبيانات أو قصور في التدابير الأمنية. يتعين عليكم تسوية الغرامة المقررة أو تقديم التماس رسمي خلال 30 يوماً.',
      appealNoticeEn: 'Appeals may be lodged before the UAE Data Office Grievances Committee within 30 days.',
      appealNoticeLocal: 'يجوز التظلم من هذا القرار أمام لجنة التظلمات بمكتب البيانات الإماراتي خلال 30 يوماً من تاريخ الإخطار.',
      signatureAuthorityEn: 'EXECUTIVE DIRECTOR, UAE DATA OFFICE',
      signatureAuthorityLocal: 'المدير التنفيذي - مكتب البيانات الإماراتي'
    }
  ],
  regulators: [
    {
      code: 'UAE_DPO',
      name: 'UAE Data Office',
      nameLocal: 'مكتب الإمارات للبيانات',
      sector: 'Data Privacy & AI Sovereignty',
      sectors: ['data_privacy', 'ai_governance', 'cloud'],
      enforcementPower: 'full',
      appealBody: 'Federal Supreme Court (Administrative Circuit)',
      contactEmail: 'enforcement@dataoffice.gov.ae',
      website: 'https://uaedataoffice.gov.ae'
    },
    {
      code: 'CBUAE',
      name: 'Central Bank of the United Arab Emirates',
      nameLocal: 'مصرف الإمارات العربية المتحدة المركزي',
      sector: 'Banking & Financial Crime (AML/CFT)',
      sectors: ['banking', 'fintech', 'aml'],
      enforcementPower: 'full',
      appealBody: 'Financial Grievances and Appeals Committee',
      contactEmail: 'compliance@cbuae.gov.ae',
      website: 'https://www.centralbank.ae'
    },
    {
      code: 'TDRA',
      name: 'Telecommunications and Digital Government Regulatory Authority',
      nameLocal: 'هيئة تنظيم الاتصالات والحكومة الرقمية',
      sector: 'Telecom & Digital Services',
      sectors: ['telecom', 'domain_names', 'cloud_providers'],
      enforcementPower: 'full',
      appealBody: 'TDRA Legal Board',
      contactEmail: 'legal@tdra.gov.ae',
      website: 'https://tdra.gov.ae'
    },
    {
      code: 'DFSA',
      name: 'Dubai Financial Services Authority (DIFC)',
      nameLocal: 'سلطة دبي للخدمات المالية',
      sector: 'DIFC Common Law Financial Free Zone',
      sectors: ['securities', 'wealth_management', 'fintech'],
      enforcementPower: 'full',
      appealBody: 'Financial Markets Tribunal (FMT)',
      contactEmail: 'enquiries@dfsa.ae',
      website: 'https://www.dfsa.ae'
    }
  ],
  laws: [
    {
      code: 'FDPL_DECREE_45_2021',
      title: 'Federal Decree-Law No. 45 of 2021 on Personal Data Protection',
      titleLocal: 'مرسوم بقانون اتحادي رقم 45 لسنة 2021 بشأن حماية البيانات الشخصية',
      regulatorCode: 'UAE_DPO',
      language: 'ar',
      officialGazetteRef: 'Official Gazette Issue 712, Oct 2021',
      effectiveFrom: '2022-01-02',
      status: 'active',
      version: 1,
      rules: [
        {
          section: 'Article 13',
          title: 'Cross-Border Transfer of Personal Data without Adequate Protection or Sovereign Consent',
          titleLocal: 'نقل البيانات الشخصية خارج الدولة دون توافر مستوى حماية مناسب',
          violationType: 'CROSS_BORDER_RESTRICTED_DATA_TRANSFER',
          penaltyType: 'range',
          minPenalty: 100000,
          maxPenalty: 5000000,
          currency: 'AED',
          severityGrade: 'critical',
          repeatMultiplier: 2.0,
          paymentDeadlineDays: 30,
          appealWindowDays: 30,
          autoEnforceable: true
        },
        {
          section: 'Article 9',
          title: 'Failure to Implement Technical and Organizational Security Safeguards',
          titleLocal: 'الإخلال بالضوابط والتدابير الفنية والأمنية لحماية البيانات',
          violationType: 'DATA_SECURITY_BREACH',
          penaltyType: 'range',
          minPenalty: 50000,
          maxPenalty: 1000000,
          currency: 'AED',
          severityGrade: 'major',
          repeatMultiplier: 1.5,
          paymentDeadlineDays: 30,
          appealWindowDays: 15,
          autoEnforceable: true
        }
      ]
    }
  ]
};
