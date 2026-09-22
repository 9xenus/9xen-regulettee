export interface WorldCountryDefinition {
  countryCode: string;
  countryName: string;
  regionCode: 'asia' | 'middle_east' | 'africa' | 'americas' | 'europe';
  currencyCode: string;
  primaryLanguage: string;
  languages?: string[];
  legalSystem: 'common_law' | 'civil_law' | 'sharia_based' | 'mixed';
  scannerLegalGate?: 'standard' | 'strict' | 'government_mou_required' | 'restricted';
  dataResidencyRequired?: boolean;
  regulators: Array<{
    code: string;
    name: string;
    nameLocal?: string;
    sector: string;
    enforcementPower?: 'full' | 'advisory' | 'via_court';
  }>;
}

export const ALL_WORLD_COUNTRIES: WorldCountryDefinition[] = [
  // ================= ASIA & PACIFIC =================
  {
    countryCode: 'BD',
    countryName: 'Bangladesh',
    regionCode: 'asia',
    currencyCode: 'BDT',
    primaryLanguage: 'bn',
    languages: ['bn', 'en'],
    legalSystem: 'common_law',
    scannerLegalGate: 'government_mou_required',
    dataResidencyRequired: true,
    regulators: [
      { code: 'BTRC', name: 'Bangladesh Telecommunication Regulatory Commission', nameLocal: 'বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন', sector: 'telecom' },
      { code: 'BB', name: 'Bangladesh Bank / BFIU', nameLocal: 'বাংলাদেশ ব্যাংক', sector: 'finance' },
      { code: 'DNCRP', name: 'Directorate of National Consumers Right Protection', nameLocal: 'জাতীয় ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর', sector: 'consumer_protection' },
      { code: 'NBR', name: 'National Board of Revenue', nameLocal: 'জাতীয় রাজস্ব বোর্ড', sector: 'tax' }
    ]
  },
  {
    countryCode: 'IN',
    countryName: 'India',
    regionCode: 'asia',
    currencyCode: 'INR',
    primaryLanguage: 'hi',
    languages: ['hi', 'en'],
    legalSystem: 'common_law',
    scannerLegalGate: 'standard',
    dataResidencyRequired: true,
    regulators: [
      { code: 'DPBI', name: 'Data Protection Board of India', nameLocal: 'भारतीय डेटा संरक्षण बोर्ड', sector: 'data_privacy' },
      { code: 'RBI', name: 'Reserve Bank of India', nameLocal: 'भारतीय रिज़र्व बैंक', sector: 'finance' },
      { code: 'SEBI', name: 'Securities and Exchange Board of India', sector: 'securities' },
      { code: 'CERT-In', name: 'Indian Computer Emergency Response Team', sector: 'cybersecurity' }
    ]
  },
  {
    countryCode: 'PK',
    countryName: 'Pakistan',
    regionCode: 'asia',
    currencyCode: 'PKR',
    primaryLanguage: 'ur',
    languages: ['ur', 'en'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'SBP', name: 'State Bank of Pakistan', sector: 'finance' },
      { code: 'SECP', name: 'Securities and Exchange Commission of Pakistan', sector: 'securities' },
      { code: 'PTA', name: 'Pakistan Telecommunication Authority', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'SG',
    countryName: 'Singapore',
    regionCode: 'asia',
    currencyCode: 'SGD',
    primaryLanguage: 'en',
    languages: ['en', 'zh', 'ms', 'ta'],
    legalSystem: 'common_law',
    regulators: [
      { code: 'MAS', name: 'Monetary Authority of Singapore', sector: 'finance' },
      { code: 'PDPC', name: 'Personal Data Protection Commission', sector: 'data_privacy' },
      { code: 'IMDA', name: 'Infocomm Media Development Authority', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'MY',
    countryName: 'Malaysia',
    regionCode: 'asia',
    currencyCode: 'MYR',
    primaryLanguage: 'ms',
    languages: ['ms', 'en'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'BNM', name: 'Bank Negara Malaysia', sector: 'finance' },
      { code: 'SCM', name: 'Securities Commission Malaysia', sector: 'securities' },
      { code: 'PDP', name: 'Personal Data Protection Department', sector: 'data_privacy' }
    ]
  },
  {
    countryCode: 'ID',
    countryName: 'Indonesia',
    regionCode: 'asia',
    currencyCode: 'IDR',
    primaryLanguage: 'id',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'BI', name: 'Bank Indonesia', sector: 'finance' },
      { code: 'OJK', name: 'Financial Services Authority (Otoritas Jasa Keuangan)', sector: 'finance' },
      { code: 'KOMINFO', name: 'Ministry of Communication and Informatics', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'TH',
    countryName: 'Thailand',
    regionCode: 'asia',
    currencyCode: 'THB',
    primaryLanguage: 'th',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'BOT', name: 'Bank of Thailand', sector: 'finance' },
      { code: 'PDPC_TH', name: 'Personal Data Protection Committee', sector: 'data_privacy' },
      { code: 'SEC_TH', name: 'Securities and Exchange Commission Thailand', sector: 'securities' }
    ]
  },
  {
    countryCode: 'VN',
    countryName: 'Vietnam',
    regionCode: 'asia',
    currencyCode: 'VND',
    primaryLanguage: 'vi',
    legalSystem: 'civil_law',
    dataResidencyRequired: true,
    regulators: [
      { code: 'SBV', name: 'State Bank of Vietnam', sector: 'finance' },
      { code: 'MIC_VN', name: 'Ministry of Information and Communications', sector: 'cybersecurity' }
    ]
  },
  {
    countryCode: 'PH',
    countryName: 'Philippines',
    regionCode: 'asia',
    currencyCode: 'PHP',
    primaryLanguage: 'tl',
    languages: ['tl', 'en'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'BSP', name: 'Bangko Sentral ng Pilipinas', sector: 'finance' },
      { code: 'NPC_PH', name: 'National Privacy Commission', sector: 'data_privacy' },
      { code: 'SEC_PH', name: 'Securities and Exchange Commission', sector: 'securities' }
    ]
  },
  {
    countryCode: 'JP',
    countryName: 'Japan',
    regionCode: 'asia',
    currencyCode: 'JPY',
    primaryLanguage: 'ja',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'JFSA', name: 'Financial Services Agency', nameLocal: '金融庁', sector: 'finance' },
      { code: 'PPC_JP', name: 'Personal Information Protection Commission', nameLocal: '個人情報保護委員会', sector: 'data_privacy' },
      { code: 'MIC_JP', name: 'Ministry of Internal Affairs and Communications', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'KR',
    countryName: 'South Korea',
    regionCode: 'asia',
    currencyCode: 'KRW',
    primaryLanguage: 'ko',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'FSC_KR', name: 'Financial Services Commission', nameLocal: '금융위원회', sector: 'finance' },
      { code: 'PIPC_KR', name: 'Personal Information Protection Commission', nameLocal: '개인정보보호위원회', sector: 'data_privacy' }
    ]
  },
  {
    countryCode: 'CN',
    countryName: 'China',
    regionCode: 'asia',
    currencyCode: 'CNY',
    primaryLanguage: 'zh',
    legalSystem: 'civil_law',
    dataResidencyRequired: true,
    scannerLegalGate: 'restricted',
    regulators: [
      { code: 'CAC', name: 'Cyberspace Administration of China', nameLocal: '国家互联网信息办公室', sector: 'data_privacy' },
      { code: 'PBOC', name: 'People’s Bank of China', nameLocal: '中国人民银行', sector: 'finance' },
      { code: 'NFRA', name: 'National Financial Regulatory Administration', sector: 'finance' }
    ]
  },
  {
    countryCode: 'HK',
    countryName: 'Hong Kong',
    regionCode: 'asia',
    currencyCode: 'HKD',
    primaryLanguage: 'zh',
    languages: ['zh', 'en'],
    legalSystem: 'common_law',
    regulators: [
      { code: 'HKMA', name: 'Hong Kong Monetary Authority', sector: 'finance' },
      { code: 'SFC_HK', name: 'Securities and Futures Commission', sector: 'securities' },
      { code: 'PCPD_HK', name: 'Privacy Commissioner for Personal Data', sector: 'data_privacy' }
    ]
  },
  {
    countryCode: 'TW',
    countryName: 'Taiwan',
    regionCode: 'asia',
    currencyCode: 'TWD',
    primaryLanguage: 'zh',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'FSC_TW', name: 'Financial Supervisory Commission', sector: 'finance' },
      { code: 'NCC_TW', name: 'National Communications Commission', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'LK',
    countryName: 'Sri Lanka',
    regionCode: 'asia',
    currencyCode: 'LKR',
    primaryLanguage: 'si',
    languages: ['si', 'ta', 'en'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'CBSL', name: 'Central Bank of Sri Lanka', sector: 'finance' },
      { code: 'DPA_LK', name: 'Data Protection Authority of Sri Lanka', sector: 'data_privacy' }
    ]
  },
  {
    countryCode: 'NP',
    countryName: 'Nepal',
    regionCode: 'asia',
    currencyCode: 'NPR',
    primaryLanguage: 'ne',
    legalSystem: 'mixed',
    regulators: [
      { code: 'NRB', name: 'Nepal Rastra Bank', sector: 'finance' },
      { code: 'NTA', name: 'Nepal Telecommunications Authority', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'MM',
    countryName: 'Myanmar',
    regionCode: 'asia',
    currencyCode: 'MMK',
    primaryLanguage: 'my',
    legalSystem: 'mixed',
    regulators: [
      { code: 'CBM', name: 'Central Bank of Myanmar', sector: 'finance' },
      { code: 'PTD_MM', name: 'Posts and Telecommunications Department', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'KH',
    countryName: 'Cambodia',
    regionCode: 'asia',
    currencyCode: 'KHR',
    primaryLanguage: 'km',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'NBC', name: 'National Bank of Cambodia', sector: 'finance' },
      { code: 'TRC', name: 'Telecommunication Regulator of Cambodia', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'LA',
    countryName: 'Laos',
    regionCode: 'asia',
    currencyCode: 'LAK',
    primaryLanguage: 'lo',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'BOL', name: 'Bank of the Lao P.D.R.', sector: 'finance' }
    ]
  },
  {
    countryCode: 'BN',
    countryName: 'Brunei',
    regionCode: 'asia',
    currencyCode: 'BND',
    primaryLanguage: 'ms',
    legalSystem: 'mixed',
    regulators: [
      { code: 'BDCB', name: 'Brunei Darussalam Central Bank', sector: 'finance' },
      { code: 'AITI', name: 'Authority for Info-communications Technology Industry', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'MV',
    countryName: 'Maldives',
    regionCode: 'asia',
    currencyCode: 'MVR',
    primaryLanguage: 'dv',
    legalSystem: 'mixed',
    regulators: [
      { code: 'MMA', name: 'Maldives Monetary Authority', sector: 'finance' },
      { code: 'CAM', name: 'Communications Authority of Maldives', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'BT',
    countryName: 'Bhutan',
    regionCode: 'asia',
    currencyCode: 'BTN',
    primaryLanguage: 'dz',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'RMA', name: 'Royal Monetary Authority of Bhutan', sector: 'finance' }
    ]
  },
  {
    countryCode: 'KZ',
    countryName: 'Kazakhstan',
    regionCode: 'asia',
    currencyCode: 'KZT',
    primaryLanguage: 'kk',
    languages: ['kk', 'ru'],
    legalSystem: 'civil_law',
    regulators: [
      { code: 'NBK', name: 'National Bank of Kazakhstan', sector: 'finance' },
      { code: 'AFMR', name: 'Agency for Regulation and Development of the Financial Market', sector: 'finance' }
    ]
  },
  {
    countryCode: 'UZ',
    countryName: 'Uzbekistan',
    regionCode: 'asia',
    currencyCode: 'UZS',
    primaryLanguage: 'uz',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'CBU', name: 'Central Bank of the Republic of Uzbekistan', sector: 'finance' }
    ]
  },
  {
    countryCode: 'AU',
    countryName: 'Australia',
    regionCode: 'asia',
    currencyCode: 'AUD',
    primaryLanguage: 'en',
    legalSystem: 'common_law',
    regulators: [
      { code: 'OAIC', name: 'Office of the Australian Information Commissioner', sector: 'data_privacy' },
      { code: 'ASIC', name: 'Australian Securities and Investments Commission', sector: 'securities' },
      { code: 'APRA', name: 'Australian Prudential Regulation Authority', sector: 'finance' },
      { code: 'AUSTRAC', name: 'Australian Transaction Reports and Analysis Centre', sector: 'aml' }
    ]
  },
  {
    countryCode: 'NZ',
    countryName: 'New Zealand',
    regionCode: 'asia',
    currencyCode: 'NZD',
    primaryLanguage: 'en',
    legalSystem: 'common_law',
    regulators: [
      { code: 'OPC_NZ', name: 'Office of the Privacy Commissioner', sector: 'data_privacy' },
      { code: 'FMA_NZ', name: 'Financial Markets Authority', sector: 'finance' },
      { code: 'RBNZ', name: 'Reserve Bank of New Zealand', sector: 'finance' }
    ]
  },
  {
    countryCode: 'FJ',
    countryName: 'Fiji',
    regionCode: 'asia',
    currencyCode: 'FJD',
    primaryLanguage: 'en',
    legalSystem: 'common_law',
    regulators: [
      { code: 'RBF', name: 'Reserve Bank of Fiji', sector: 'finance' }
    ]
  },
  {
    countryCode: 'PG',
    countryName: 'Papua New Guinea',
    regionCode: 'asia',
    currencyCode: 'PGK',
    primaryLanguage: 'en',
    legalSystem: 'mixed',
    regulators: [
      { code: 'BPNG', name: 'Bank of Papua New Guinea', sector: 'finance' }
    ]
  },

  // ================= MIDDLE EAST & GCC =================
  {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    regionCode: 'middle_east',
    currencyCode: 'AED',
    primaryLanguage: 'ar',
    languages: ['ar', 'en'],
    legalSystem: 'civil_law',
    scannerLegalGate: 'government_mou_required',
    dataResidencyRequired: true,
    regulators: [
      { code: 'UAE_DPO', name: 'UAE Data Office', nameLocal: 'مكتب الإمارات للبيانات', sector: 'data_privacy' },
      { code: 'CBUAE', name: 'Central Bank of the UAE', nameLocal: 'مصرف الإمارات العربية المتحدة المركزي', sector: 'finance' },
      { code: 'TDRA', name: 'Telecommunications and Digital Government Regulatory Authority', sector: 'telecom' },
      { code: 'ADGM_FSRA', name: 'ADGM Financial Services Regulatory Authority', sector: 'finance' },
      { code: 'DFSA', name: 'Dubai Financial Services Authority', sector: 'finance' }
    ]
  },
  {
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    regionCode: 'middle_east',
    currencyCode: 'SAR',
    primaryLanguage: 'ar',
    languages: ['ar', 'en'],
    legalSystem: 'sharia_based',
    scannerLegalGate: 'government_mou_required',
    dataResidencyRequired: true,
    regulators: [
      { code: 'SDAIA', name: 'Saudi Data & AI Authority / NDMO', nameLocal: 'الهيئة السعودية للبيانات والذكاء الاصطناعي', sector: 'data_privacy' },
      { code: 'SAMA', name: 'Saudi Central Bank', nameLocal: 'البنك المركزي السعودي', sector: 'finance' },
      { code: 'CMA_SA', name: 'Capital Market Authority', sector: 'securities' },
      { code: 'CST_SA', name: 'Communications, Space & Technology Commission', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'QA',
    countryName: 'Qatar',
    regionCode: 'middle_east',
    currencyCode: 'QAR',
    primaryLanguage: 'ar',
    languages: ['ar', 'en'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'QCB', name: 'Qatar Central Bank', sector: 'finance' },
      { code: 'QFCRA', name: 'Qatar Financial Centre Regulatory Authority', sector: 'finance' },
      { code: 'NCSA_QA', name: 'National Cyber Security Agency', sector: 'cybersecurity' },
      { code: 'PDPCR_QA', name: 'Personal Data Privacy Protection Department', sector: 'data_privacy' }
    ]
  },
  {
    countryCode: 'BH',
    countryName: 'Bahrain',
    regionCode: 'middle_east',
    currencyCode: 'BHD',
    primaryLanguage: 'ar',
    languages: ['ar', 'en'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'CBB', name: 'Central Bank of Bahrain', sector: 'finance' },
      { code: 'PDPLA_BH', name: 'Personal Data Protection Authority', sector: 'data_privacy' },
      { code: 'TRA_BH', name: 'Telecommunications Regulatory Authority', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'KW',
    countryName: 'Kuwait',
    regionCode: 'middle_east',
    currencyCode: 'KWD',
    primaryLanguage: 'ar',
    languages: ['ar', 'en'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'CBK_KW', name: 'Central Bank of Kuwait', sector: 'finance' },
      { code: 'CMA_KW', name: 'Capital Markets Authority', sector: 'securities' },
      { code: 'CITRA', name: 'Communication and Information Technology Regulatory Authority', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'OM',
    countryName: 'Oman',
    regionCode: 'middle_east',
    currencyCode: 'OMR',
    primaryLanguage: 'ar',
    languages: ['ar', 'en'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'CBO', name: 'Central Bank of Oman', sector: 'finance' },
      { code: 'CMA_OM', name: 'Capital Market Authority', sector: 'securities' },
      { code: 'TRA_OM', name: 'Telecommunications Regulatory Authority', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'EG',
    countryName: 'Egypt',
    regionCode: 'middle_east',
    currencyCode: 'EGP',
    primaryLanguage: 'ar',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'CBE', name: 'Central Bank of Egypt', sector: 'finance' },
      { code: 'FRA_EG', name: 'Financial Regulatory Authority', sector: 'finance' },
      { code: 'PDPC_EG', name: 'Data Protection Center', sector: 'data_privacy' },
      { code: 'NTRA', name: 'National Telecommunications Regulatory Authority', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'JO',
    countryName: 'Jordan',
    regionCode: 'middle_east',
    currencyCode: 'JOD',
    primaryLanguage: 'ar',
    legalSystem: 'mixed',
    regulators: [
      { code: 'CBJ', name: 'Central Bank of Jordan', sector: 'finance' },
      { code: 'TRC_JO', name: 'Telecommunications Regulatory Commission', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'LB',
    countryName: 'Lebanon',
    regionCode: 'middle_east',
    currencyCode: 'LBP',
    primaryLanguage: 'ar',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'BDL', name: 'Banque du Liban', sector: 'finance' },
      { code: 'CMA_LB', name: 'Capital Markets Authority', sector: 'securities' }
    ]
  },
  {
    countryCode: 'TR',
    countryName: 'Turkey',
    regionCode: 'middle_east',
    currencyCode: 'TRY',
    primaryLanguage: 'tr',
    legalSystem: 'civil_law',
    dataResidencyRequired: true,
    regulators: [
      { code: 'KVKK', name: 'Personal Data Protection Authority', nameLocal: 'Kişisel Verileri Koruma Kurumu', sector: 'data_privacy' },
      { code: 'BDDK', name: 'Banking Regulation and Supervision Agency', sector: 'finance' },
      { code: 'SPK', name: 'Capital Markets Board of Turkey', sector: 'securities' }
    ]
  },
  {
    countryCode: 'IQ',
    countryName: 'Iraq',
    regionCode: 'middle_east',
    currencyCode: 'IQD',
    primaryLanguage: 'ar',
    legalSystem: 'mixed',
    regulators: [
      { code: 'CBI', name: 'Central Bank of Iraq', sector: 'finance' },
      { code: 'CMC_IQ', name: 'Communications and Media Commission', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'IL',
    countryName: 'Israel',
    regionCode: 'middle_east',
    currencyCode: 'ILS',
    primaryLanguage: 'he',
    languages: ['he', 'en'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'PPA_IL', name: 'Privacy Protection Authority', sector: 'data_privacy' },
      { code: 'BOI', name: 'Bank of Israel', sector: 'finance' },
      { code: 'ISA_IL', name: 'Israel Securities Authority', sector: 'securities' }
    ]
  },

  // ================= AFRICA =================
  {
    countryCode: 'NG',
    countryName: 'Nigeria',
    regionCode: 'africa',
    currencyCode: 'NGN',
    primaryLanguage: 'en',
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    regulators: [
      { code: 'NDPC', name: 'Nigeria Data Protection Commission', sector: 'data_privacy' },
      { code: 'CBN', name: 'Central Bank of Nigeria', sector: 'finance' },
      { code: 'NCC_NG', name: 'Nigerian Communications Commission', sector: 'telecom' },
      { code: 'FCCPC', name: 'Federal Competition and Consumer Protection Commission', sector: 'consumer_protection' }
    ]
  },
  {
    countryCode: 'KE',
    countryName: 'Kenya',
    regionCode: 'africa',
    currencyCode: 'KES',
    primaryLanguage: 'sw',
    languages: ['sw', 'en'],
    legalSystem: 'common_law',
    scannerLegalGate: 'standard',
    regulators: [
      { code: 'ODPC_KE', name: 'Office of the Data Protection Commissioner', sector: 'data_privacy' },
      { code: 'CBK', name: 'Central Bank of Kenya', sector: 'finance' },
      { code: 'CAK', name: 'Communications Authority of Kenya', sector: 'telecom' },
      { code: 'CMA_KE', name: 'Capital Markets Authority', sector: 'securities' }
    ]
  },
  {
    countryCode: 'ZA',
    countryName: 'South Africa',
    regionCode: 'africa',
    currencyCode: 'ZAR',
    primaryLanguage: 'en',
    languages: ['en', 'af', 'zu', 'xh'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    regulators: [
      { code: 'IRSA', name: 'Information Regulator South Africa', sector: 'data_privacy' },
      { code: 'SARB', name: 'South African Reserve Bank', sector: 'finance' },
      { code: 'FSCA', name: 'Financial Sector Conduct Authority', sector: 'finance' },
      { code: 'ICASA', name: 'Independent Communications Authority of South Africa', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'GH',
    countryName: 'Ghana',
    regionCode: 'africa',
    currencyCode: 'GHS',
    primaryLanguage: 'en',
    legalSystem: 'common_law',
    regulators: [
      { code: 'DPC_GH', name: 'Data Protection Commission Ghana', sector: 'data_privacy' },
      { code: 'BOG', name: 'Bank of Ghana', sector: 'finance' },
      { code: 'SEC_GH', name: 'Securities and Exchange Commission', sector: 'securities' },
      { code: 'NCA_GH', name: 'National Communications Authority', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'RW',
    countryName: 'Rwanda',
    regionCode: 'africa',
    currencyCode: 'RWF',
    primaryLanguage: 'en',
    languages: ['en', 'fr', 'rw'],
    legalSystem: 'civil_law',
    regulators: [
      { code: 'NCSA_RW', name: 'National Cyber Security Authority / DPP', sector: 'data_privacy' },
      { code: 'BNR', name: 'National Bank of Rwanda', sector: 'finance' },
      { code: 'RURA', name: 'Rwanda Utilities Regulatory Authority', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'TZ',
    countryName: 'Tanzania',
    regionCode: 'africa',
    currencyCode: 'TZS',
    primaryLanguage: 'sw',
    languages: ['sw', 'en'],
    legalSystem: 'common_law',
    regulators: [
      { code: 'PDPC_TZ', name: 'Personal Data Protection Commission', sector: 'data_privacy' },
      { code: 'BOT_TZ', name: 'Bank of Tanzania', sector: 'finance' },
      { code: 'TCRA', name: 'Tanzania Communications Regulatory Authority', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'UG',
    countryName: 'Uganda',
    regionCode: 'africa',
    currencyCode: 'UGX',
    primaryLanguage: 'en',
    legalSystem: 'common_law',
    regulators: [
      { code: 'PDPO_UG', name: 'Personal Data Protection Office', sector: 'data_privacy' },
      { code: 'BOU', name: 'Bank of Uganda', sector: 'finance' },
      { code: 'UCC', name: 'Uganda Communications Commission', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'ET',
    countryName: 'Ethiopia',
    regionCode: 'africa',
    currencyCode: 'ETB',
    primaryLanguage: 'am',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'NBE', name: 'National Bank of Ethiopia', sector: 'finance' },
      { code: 'ECA_ET', name: 'Ethiopian Communications Authority', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'MA',
    countryName: 'Morocco',
    regionCode: 'africa',
    currencyCode: 'MAD',
    primaryLanguage: 'ar',
    languages: ['ar', 'fr'],
    legalSystem: 'civil_law',
    regulators: [
      { code: 'CNDP_MA', name: 'Commission Nationale de contrôle de la protection des Données à caractère Personnel', sector: 'data_privacy' },
      { code: 'BKAM', name: 'Bank Al-Maghrib', sector: 'finance' },
      { code: 'ANRT', name: 'Agence Nationale de Réglementation des Télécommunications', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'TN',
    countryName: 'Tunisia',
    regionCode: 'africa',
    currencyCode: 'TND',
    primaryLanguage: 'ar',
    languages: ['ar', 'fr'],
    legalSystem: 'civil_law',
    regulators: [
      { code: 'INPDP', name: 'Instance Nationale de Protection des Données Personnelles', sector: 'data_privacy' },
      { code: 'BCT', name: 'Banque Centrale de Tunisie', sector: 'finance' }
    ]
  },
  {
    countryCode: 'SN',
    countryName: 'Senegal',
    regionCode: 'africa',
    currencyCode: 'XOF',
    primaryLanguage: 'fr',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'CDP_SN', name: 'Commission de Protection des Données Personnelles', sector: 'data_privacy' },
      { code: 'BCEAO_SN', name: 'Central Bank of West African States', sector: 'finance' }
    ]
  },
  {
    countryCode: 'CI',
    countryName: 'Côte d’Ivoire',
    regionCode: 'africa',
    currencyCode: 'XOF',
    primaryLanguage: 'fr',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'ARTCI', name: 'Autorité de Régulation des Télécommunications/TIC de Côte d’Ivoire', sector: 'data_privacy' },
      { code: 'BCEAO_CI', name: 'Central Bank of West African States', sector: 'finance' }
    ]
  },
  {
    countryCode: 'MU',
    countryName: 'Mauritius',
    regionCode: 'africa',
    currencyCode: 'MUR',
    primaryLanguage: 'en',
    languages: ['en', 'fr'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'DPO_MU', name: 'Data Protection Office Mauritius', sector: 'data_privacy' },
      { code: 'BOM', name: 'Bank of Mauritius', sector: 'finance' },
      { code: 'FSC_MU', name: 'Financial Services Commission Mauritius', sector: 'finance' }
    ]
  },
  {
    countryCode: 'BW',
    countryName: 'Botswana',
    regionCode: 'africa',
    currencyCode: 'BWP',
    primaryLanguage: 'en',
    legalSystem: 'mixed',
    regulators: [
      { code: 'IC_BW', name: 'Information Commissioner Botswana', sector: 'data_privacy' },
      { code: 'BOB', name: 'Bank of Botswana', sector: 'finance' }
    ]
  },
  {
    countryCode: 'ZM',
    countryName: 'Zambia',
    regionCode: 'africa',
    currencyCode: 'ZMW',
    primaryLanguage: 'en',
    legalSystem: 'common_law',
    regulators: [
      { code: 'DPC_ZM', name: 'Data Protection Commission Zambia', sector: 'data_privacy' },
      { code: 'BOZ', name: 'Bank of Zambia', sector: 'finance' }
    ]
  },
  {
    countryCode: 'ZW',
    countryName: 'Zimbabwe',
    regionCode: 'africa',
    currencyCode: 'USD',
    primaryLanguage: 'en',
    legalSystem: 'mixed',
    regulators: [
      { code: 'POTRAZ', name: 'Postal and Telecommunications Regulatory Authority', sector: 'telecom' },
      { code: 'RBZ', name: 'Reserve Bank of Zimbabwe', sector: 'finance' }
    ]
  },
  {
    countryCode: 'AO',
    countryName: 'Angola',
    regionCode: 'africa',
    currencyCode: 'AOA',
    primaryLanguage: 'pt',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'APD_AO', name: 'Agência de Protecção de Dados', sector: 'data_privacy' },
      { code: 'BNA', name: 'Banco Nacional de Angola', sector: 'finance' }
    ]
  },
  {
    countryCode: 'MZ',
    countryName: 'Mozambique',
    regionCode: 'africa',
    currencyCode: 'MZN',
    primaryLanguage: 'pt',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'BM_MZ', name: 'Banco de Moçambique', sector: 'finance' }
    ]
  },
  {
    countryCode: 'CM',
    countryName: 'Cameroon',
    regionCode: 'africa',
    currencyCode: 'XAF',
    primaryLanguage: 'fr',
    languages: ['fr', 'en'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'ANTIC_CM', name: 'National Agency for Information and Communication Technologies', sector: 'cybersecurity' },
      { code: 'BEAC_CM', name: 'Bank of Central African States', sector: 'finance' }
    ]
  },

  // ================= AMERICAS =================
  {
    countryCode: 'US',
    countryName: 'United States',
    regionCode: 'americas',
    currencyCode: 'USD',
    primaryLanguage: 'en',
    legalSystem: 'common_law',
    scannerLegalGate: 'standard',
    regulators: [
      { code: 'FTC', name: 'Federal Trade Commission', sector: 'consumer_protection' },
      { code: 'CFPB', name: 'Consumer Financial Protection Bureau', sector: 'finance' },
      { code: 'SEC_US', name: 'Securities and Exchange Commission', sector: 'securities' },
      { code: 'OCR_HIPAA', name: 'HHS Office for Civil Rights (HIPAA)', sector: 'healthcare' },
      { code: 'OCC', name: 'Office of the Comptroller of the Currency', sector: 'finance' },
      { code: 'CPPA', name: 'California Privacy Protection Agency', sector: 'data_privacy' }
    ]
  },
  {
    countryCode: 'CA',
    countryName: 'Canada',
    regionCode: 'americas',
    currencyCode: 'CAD',
    primaryLanguage: 'en',
    languages: ['en', 'fr'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'OPC_CA', name: 'Office of the Privacy Commissioner of Canada', sector: 'data_privacy' },
      { code: 'OSFI', name: 'Office of the Superintendent of Financial Institutions', sector: 'finance' },
      { code: 'FINTRAC', name: 'Financial Transactions and Reports Analysis Centre of Canada', sector: 'aml' },
      { code: 'CRTC', name: 'Canadian Radio-television and Telecommunications Commission', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'BR',
    countryName: 'Brazil',
    regionCode: 'americas',
    currencyCode: 'BRL',
    primaryLanguage: 'pt',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'ANPD', name: 'National Data Protection Authority', nameLocal: 'Autoridade Nacional de Proteção de Dados', sector: 'data_privacy' },
      { code: 'BACEN', name: 'Central Bank of Brazil', nameLocal: 'Banco Central do Brasil', sector: 'finance' },
      { code: 'CVM_BR', name: 'Securities and Exchange Commission of Brazil', sector: 'securities' }
    ]
  },
  {
    countryCode: 'MX',
    countryName: 'Mexico',
    regionCode: 'americas',
    currencyCode: 'MXN',
    primaryLanguage: 'es',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'INAI', name: 'National Institute of Transparency and Data Protection', sector: 'data_privacy' },
      { code: 'BANXICO', name: 'Bank of Mexico', sector: 'finance' },
      { code: 'CNBV', name: 'National Banking and Securities Commission', sector: 'finance' },
      { code: 'IFT', name: 'Federal Telecommunications Institute', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'AR',
    countryName: 'Argentina',
    regionCode: 'americas',
    currencyCode: 'ARS',
    primaryLanguage: 'es',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'AAIP', name: 'Agency of Access to Public Information', sector: 'data_privacy' },
      { code: 'BCRA', name: 'Central Bank of the Argentine Republic', sector: 'finance' },
      { code: 'CNV_AR', name: 'National Securities Commission', sector: 'securities' }
    ]
  },
  {
    countryCode: 'CO',
    countryName: 'Colombia',
    regionCode: 'americas',
    currencyCode: 'COP',
    primaryLanguage: 'es',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'SIC_CO', name: 'Superintendence of Industry and Commerce', sector: 'data_privacy' },
      { code: 'SFC_CO', name: 'Financial Superintendence of Colombia', sector: 'finance' }
    ]
  },
  {
    countryCode: 'CL',
    countryName: 'Chile',
    regionCode: 'americas',
    currencyCode: 'CLP',
    primaryLanguage: 'es',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'CMF_CL', name: 'Financial Market Commission', sector: 'finance' },
      { code: 'CPLT', name: 'Council for Transparency', sector: 'data_privacy' }
    ]
  },
  {
    countryCode: 'PE',
    countryName: 'Peru',
    regionCode: 'americas',
    currencyCode: 'PEN',
    primaryLanguage: 'es',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'ANPDP_PE', name: 'National Authority for Personal Data Protection', sector: 'data_privacy' },
      { code: 'SBS_PE', name: 'Superintendency of Banking, Insurance and AFP', sector: 'finance' }
    ]
  },
  {
    countryCode: 'PA',
    countryName: 'Panama',
    regionCode: 'americas',
    currencyCode: 'USD',
    primaryLanguage: 'es',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'ANTAI', name: 'National Authority for Transparency and Access to Information', sector: 'data_privacy' },
      { code: 'SBP_PA', name: 'Superintendency of Banks of Panama', sector: 'finance' }
    ]
  },
  {
    countryCode: 'CR',
    countryName: 'Costa Rica',
    regionCode: 'americas',
    currencyCode: 'CRC',
    primaryLanguage: 'es',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'PRODHAB', name: 'Agency for the Protection of Inhabitants Data', sector: 'data_privacy' },
      { code: 'BCCR', name: 'Central Bank of Costa Rica', sector: 'finance' }
    ]
  },
  {
    countryCode: 'UY',
    countryName: 'Uruguay',
    regionCode: 'americas',
    currencyCode: 'UYU',
    primaryLanguage: 'es',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'URCDP', name: 'Regulatory and Control Unit of Personal Data', sector: 'data_privacy' },
      { code: 'BCU', name: 'Central Bank of Uruguay', sector: 'finance' }
    ]
  },
  {
    countryCode: 'EC',
    countryName: 'Ecuador',
    regionCode: 'americas',
    currencyCode: 'USD',
    primaryLanguage: 'es',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'SPDP_EC', name: 'Superintendency of Personal Data Protection', sector: 'data_privacy' },
      { code: 'BCE_EC', name: 'Central Bank of Ecuador', sector: 'finance' }
    ]
  },
  {
    countryCode: 'DO',
    countryName: 'Dominican Republic',
    regionCode: 'americas',
    currencyCode: 'DOP',
    primaryLanguage: 'es',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'BCRD', name: 'Central Bank of the Dominican Republic', sector: 'finance' }
    ]
  },
  {
    countryCode: 'JM',
    countryName: 'Jamaica',
    regionCode: 'americas',
    currencyCode: 'JMD',
    primaryLanguage: 'en',
    legalSystem: 'common_law',
    regulators: [
      { code: 'OIC_JM', name: 'Office of the Information Commissioner', sector: 'data_privacy' },
      { code: 'BOJ', name: 'Bank of Jamaica', sector: 'finance' }
    ]
  },
  {
    countryCode: 'TT',
    countryName: 'Trinidad and Tobago',
    regionCode: 'americas',
    currencyCode: 'TTD',
    primaryLanguage: 'en',
    legalSystem: 'common_law',
    regulators: [
      { code: 'CBTT', name: 'Central Bank of Trinidad and Tobago', sector: 'finance' }
    ]
  },

  // ================= EUROPE =================
  {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    regionCode: 'europe',
    currencyCode: 'GBP',
    primaryLanguage: 'en',
    legalSystem: 'common_law',
    scannerLegalGate: 'standard',
    regulators: [
      { code: 'ICO', name: 'Information Commissioner’s Office', sector: 'data_privacy' },
      { code: 'FCA', name: 'Financial Conduct Authority', sector: 'finance' },
      { code: 'PRA', name: 'Prudential Regulation Authority', sector: 'finance' },
      { code: 'OFCOM', name: 'Office of Communications', sector: 'telecom' }
    ]
  },
  {
    countryCode: 'DE',
    countryName: 'Germany',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'de',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'BFDI', name: 'Federal Commissioner for Data Protection and Freedom of Information', nameLocal: 'BfDI', sector: 'data_privacy' },
      { code: 'BAFIN', name: 'Federal Financial Supervisory Authority', nameLocal: 'BaFin', sector: 'finance' },
      { code: 'BSI', name: 'Federal Office for Information Security', nameLocal: 'BSI', sector: 'cybersecurity' }
    ]
  },
  {
    countryCode: 'FR',
    countryName: 'France',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'fr',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'CNIL', name: 'National Commission on Informatics and Liberty', nameLocal: 'CNIL', sector: 'data_privacy' },
      { code: 'AMF_FR', name: 'Financial Markets Authority', sector: 'securities' },
      { code: 'ACPR', name: 'Prudential Supervision and Resolution Authority', sector: 'finance' },
      { code: 'ANSSI', name: 'National Cybersecurity Agency of France', sector: 'cybersecurity' }
    ]
  },
  {
    countryCode: 'IE',
    countryName: 'Ireland',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'en',
    languages: ['en', 'ga'],
    legalSystem: 'common_law',
    regulators: [
      { code: 'DPC_IE', name: 'Data Protection Commission Ireland', sector: 'data_privacy' },
      { code: 'CBI_IE', name: 'Central Bank of Ireland', sector: 'finance' }
    ]
  },
  {
    countryCode: 'NL',
    countryName: 'Netherlands',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'nl',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'AP_NL', name: 'Autoriteit Persoonsgegevens', sector: 'data_privacy' },
      { code: 'AFM_NL', name: 'Authority for the Financial Markets', sector: 'securities' },
      { code: 'DNB', name: 'De Nederlandsche Bank', sector: 'finance' }
    ]
  },
  {
    countryCode: 'CH',
    countryName: 'Switzerland',
    regionCode: 'europe',
    currencyCode: 'CHF',
    primaryLanguage: 'de',
    languages: ['de', 'fr', 'it', 'en'],
    legalSystem: 'civil_law',
    regulators: [
      { code: 'FDPIC', name: 'Federal Data Protection and Information Commissioner', sector: 'data_privacy' },
      { code: 'FINMA', name: 'Swiss Financial Market Supervisory Authority', sector: 'finance' },
      { code: 'SNB', name: 'Swiss National Bank', sector: 'finance' }
    ]
  },
  {
    countryCode: 'SE',
    countryName: 'Sweden',
    regionCode: 'europe',
    currencyCode: 'SEK',
    primaryLanguage: 'sv',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'IMY_SE', name: 'Integritetsskyddsmyndigheten', sector: 'data_privacy' },
      { code: 'FI_SE', name: 'Finansinspektionen', sector: 'finance' }
    ]
  },
  {
    countryCode: 'NO',
    countryName: 'Norway',
    regionCode: 'europe',
    currencyCode: 'NOK',
    primaryLanguage: 'no',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'DATATILSYNET_NO', name: 'Datatilsynet', sector: 'data_privacy' },
      { code: 'FINANSTILSYNET_NO', name: 'Financial Supervisory Authority of Norway', sector: 'finance' }
    ]
  },
  {
    countryCode: 'DK',
    countryName: 'Denmark',
    regionCode: 'europe',
    currencyCode: 'DKK',
    primaryLanguage: 'da',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'DATATILSYNET_DK', name: 'Datatilsynet', sector: 'data_privacy' },
      { code: 'DFSA_DK', name: 'Danish Financial Supervisory Authority', sector: 'finance' }
    ]
  },
  {
    countryCode: 'FI',
    countryName: 'Finland',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'fi',
    languages: ['fi', 'sv'],
    legalSystem: 'civil_law',
    regulators: [
      { code: 'TIETOSUOJA', name: 'Office of the Data Protection Ombudsman', sector: 'data_privacy' },
      { code: 'FIN_FSA', name: 'Financial Supervisory Authority', sector: 'finance' }
    ]
  },
  {
    countryCode: 'IT',
    countryName: 'Italy',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'it',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'GARANTE', name: 'Garante per la protezione dei dati personali', sector: 'data_privacy' },
      { code: 'BANK_OF_ITALY', name: 'Banca d’Italia', sector: 'finance' },
      { code: 'CONSOB', name: 'Commissione Nazionale per le Società e la Borsa', sector: 'securities' }
    ]
  },
  {
    countryCode: 'ES',
    countryName: 'Spain',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'es',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'AEPD', name: 'Agencia Española de Protección de Datos', sector: 'data_privacy' },
      { code: 'BANCO_DE_ESPANA', name: 'Banco de España', sector: 'finance' },
      { code: 'CNMV', name: 'Comisión Nacional del Mercado de Valores', sector: 'securities' }
    ]
  },
  {
    countryCode: 'BE',
    countryName: 'Belgium',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'nl',
    languages: ['nl', 'fr', 'de'],
    legalSystem: 'civil_law',
    regulators: [
      { code: 'APD_GBA', name: 'Data Protection Authority (APD-GBA)', sector: 'data_privacy' },
      { code: 'FSMA_BE', name: 'Financial Services and Markets Authority', sector: 'finance' },
      { code: 'NBB', name: 'National Bank of Belgium', sector: 'finance' }
    ]
  },
  {
    countryCode: 'AT',
    countryName: 'Austria',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'de',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'DSB_AT', name: 'Datenschutzbehörde', sector: 'data_privacy' },
      { code: 'FMA_AT', name: 'Financial Market Authority', sector: 'finance' }
    ]
  },
  {
    countryCode: 'PL',
    countryName: 'Poland',
    regionCode: 'europe',
    currencyCode: 'PLN',
    primaryLanguage: 'pl',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'UODO', name: 'Personal Data Protection Office', sector: 'data_privacy' },
      { code: 'KNF', name: 'Polish Financial Supervision Authority', sector: 'finance' }
    ]
  },
  {
    countryCode: 'PT',
    countryName: 'Portugal',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'pt',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'CNPD_PT', name: 'Comissão Nacional de Protecção de Dados', sector: 'data_privacy' },
      { code: 'BANCO_DE_PORTUGAL', name: 'Banco de Portugal', sector: 'finance' }
    ]
  },
  {
    countryCode: 'GR',
    countryName: 'Greece',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'el',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'HDPA', name: 'Hellenic Data Protection Authority', sector: 'data_privacy' },
      { code: 'BANK_OF_GREECE', name: 'Bank of Greece', sector: 'finance' }
    ]
  },
  {
    countryCode: 'CZ',
    countryName: 'Czech Republic',
    regionCode: 'europe',
    currencyCode: 'CZK',
    primaryLanguage: 'cs',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'UOOU', name: 'Office for Personal Data Protection', sector: 'data_privacy' },
      { code: 'CNB', name: 'Czech National Bank', sector: 'finance' }
    ]
  },
  {
    countryCode: 'RO',
    countryName: 'Romania',
    regionCode: 'europe',
    currencyCode: 'RON',
    primaryLanguage: 'ro',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'ANSPDCP', name: 'National Supervisory Authority for Personal Data Processing', sector: 'data_privacy' },
      { code: 'BNR_RO', name: 'National Bank of Romania', sector: 'finance' }
    ]
  },
  {
    countryCode: 'HU',
    countryName: 'Hungary',
    regionCode: 'europe',
    currencyCode: 'HUF',
    primaryLanguage: 'hu',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'NAIH', name: 'National Authority for Data Protection and Freedom of Information', sector: 'data_privacy' },
      { code: 'MNB', name: 'Magyar Nemzeti Bank', sector: 'finance' }
    ]
  },
  {
    countryCode: 'LU',
    countryName: 'Luxembourg',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'fr',
    languages: ['fr', 'de', 'lb', 'en'],
    legalSystem: 'civil_law',
    regulators: [
      { code: 'CNPD_LU', name: 'Commission Nationale pour la Protection des Données', sector: 'data_privacy' },
      { code: 'CSSF', name: 'Commission de Surveillance du Secteur Financier', sector: 'finance' }
    ]
  },
  {
    countryCode: 'EE',
    countryName: 'Estonia',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'et',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'AKI_EE', name: 'Data Protection Inspectorate', sector: 'data_privacy' },
      { code: 'FSA_EE', name: 'Finantsinspektsioon', sector: 'finance' }
    ]
  },
  {
    countryCode: 'LV',
    countryName: 'Latvia',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'lv',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'DVI_LV', name: 'Data State Inspectorate', sector: 'data_privacy' },
      { code: 'BANK_OF_LATVIA', name: 'Bank of Latvia', sector: 'finance' }
    ]
  },
  {
    countryCode: 'LT',
    countryName: 'Lithuania',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'lt',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'VDAI', name: 'State Data Protection Inspectorate', sector: 'data_privacy' },
      { code: 'BANK_OF_LITHUANIA', name: 'Bank of Lithuania', sector: 'finance' }
    ]
  },
  {
    countryCode: 'CY',
    countryName: 'Cyprus',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'el',
    languages: ['el', 'en'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'CPDP_CY', name: 'Commissioner for Personal Data Protection', sector: 'data_privacy' },
      { code: 'CBC', name: 'Central Bank of Cyprus', sector: 'finance' },
      { code: 'CYSEC', name: 'Cyprus Securities and Exchange Commission', sector: 'securities' }
    ]
  },
  {
    countryCode: 'MT',
    countryName: 'Malta',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'mt',
    languages: ['mt', 'en'],
    legalSystem: 'mixed',
    regulators: [
      { code: 'IDPC_MT', name: 'Information and Data Protection Commissioner', sector: 'data_privacy' },
      { code: 'MFSA', name: 'Malta Financial Services Authority', sector: 'finance' }
    ]
  },
  {
    countryCode: 'IS',
    countryName: 'Iceland',
    regionCode: 'europe',
    currencyCode: 'ISK',
    primaryLanguage: 'is',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'PERSONUVERND', name: 'Data Protection Authority', sector: 'data_privacy' },
      { code: 'CBI_IS', name: 'Central Bank of Iceland', sector: 'finance' }
    ]
  },
  {
    countryCode: 'HR',
    countryName: 'Croatia',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'hr',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'AZOP', name: 'Croatian Personal Data Protection Agency', sector: 'data_privacy' },
      { code: 'HNB', name: 'Croatian National Bank', sector: 'finance' }
    ]
  },
  {
    countryCode: 'BG',
    countryName: 'Bulgaria',
    regionCode: 'europe',
    currencyCode: 'BGN',
    primaryLanguage: 'bg',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'CPDP_BG', name: 'Commission for Personal Data Protection', sector: 'data_privacy' },
      { code: 'BNB', name: 'Bulgarian National Bank', sector: 'finance' }
    ]
  },
  {
    countryCode: 'SK',
    countryName: 'Slovakia',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'sk',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'UOOU_SK', name: 'Office for Personal Data Protection', sector: 'data_privacy' },
      { code: 'NBS', name: 'National Bank of Slovakia', sector: 'finance' }
    ]
  },
  {
    countryCode: 'SI',
    countryName: 'Slovenia',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'sl',
    legalSystem: 'civil_law',
    regulators: [
      { code: 'IP_RS', name: 'Information Commissioner of the Republic of Slovenia', sector: 'data_privacy' },
      { code: 'BANK_OF_SLOVENIA', name: 'Bank of Slovenia', sector: 'finance' }
    ]
  },
  {
    countryCode: 'AF',
    countryName: 'Afghanistan',
    regionCode: 'asia',
    currencyCode: 'AFN',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'AL',
    countryName: 'Albania',
    regionCode: 'europe',
    currencyCode: 'ALL',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'DZ',
    countryName: 'Algeria',
    regionCode: 'africa',
    currencyCode: 'DZD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'AD',
    countryName: 'Andorra',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'AG',
    countryName: 'Antigua and Barbuda',
    regionCode: 'americas',
    currencyCode: 'XCD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'AM',
    countryName: 'Armenia',
    regionCode: 'europe',
    currencyCode: 'AMD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'AZ',
    countryName: 'Azerbaijan',
    regionCode: 'asia',
    currencyCode: 'AZN',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'BS',
    countryName: 'Bahamas',
    regionCode: 'americas',
    currencyCode: 'BSD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'BB',
    countryName: 'Barbados',
    regionCode: 'americas',
    currencyCode: 'BBD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'BY',
    countryName: 'Belarus',
    regionCode: 'europe',
    currencyCode: 'BYN',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'BZ',
    countryName: 'Belize',
    regionCode: 'americas',
    currencyCode: 'BZD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'BJ',
    countryName: 'Benin',
    regionCode: 'africa',
    currencyCode: 'XOF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'BO',
    countryName: 'Bolivia',
    regionCode: 'americas',
    currencyCode: 'BOB',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'BA',
    countryName: 'Bosnia and Herzegovina',
    regionCode: 'europe',
    currencyCode: 'BAM',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'BF',
    countryName: 'Burkina Faso',
    regionCode: 'africa',
    currencyCode: 'XOF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'BI',
    countryName: 'Burundi',
    regionCode: 'africa',
    currencyCode: 'BIF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'CV',
    countryName: 'Cabo Verde',
    regionCode: 'africa',
    currencyCode: 'CVE',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'CF',
    countryName: 'Central African Republic',
    regionCode: 'africa',
    currencyCode: 'XAF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'TD',
    countryName: 'Chad',
    regionCode: 'africa',
    currencyCode: 'XAF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'KM',
    countryName: 'Comoros',
    regionCode: 'africa',
    currencyCode: 'KMF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'CG',
    countryName: 'Congo',
    regionCode: 'africa',
    currencyCode: 'XAF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'CD',
    countryName: 'Congo (DRC)',
    regionCode: 'africa',
    currencyCode: 'CDF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'CU',
    countryName: 'Cuba',
    regionCode: 'americas',
    currencyCode: 'CUP',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'DJ',
    countryName: 'Djibouti',
    regionCode: 'africa',
    currencyCode: 'DJF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'DM',
    countryName: 'Dominica',
    regionCode: 'americas',
    currencyCode: 'XCD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'SV',
    countryName: 'El Salvador',
    regionCode: 'americas',
    currencyCode: 'USD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'GQ',
    countryName: 'Equatorial Guinea',
    regionCode: 'africa',
    currencyCode: 'XAF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'ER',
    countryName: 'Eritrea',
    regionCode: 'africa',
    currencyCode: 'ERN',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'SZ',
    countryName: 'Eswatini',
    regionCode: 'africa',
    currencyCode: 'SZL',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'GA',
    countryName: 'Gabon',
    regionCode: 'africa',
    currencyCode: 'XAF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'GM',
    countryName: 'Gambia',
    regionCode: 'africa',
    currencyCode: 'GMD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'GE',
    countryName: 'Georgia',
    regionCode: 'europe',
    currencyCode: 'GEL',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'GD',
    countryName: 'Grenada',
    regionCode: 'americas',
    currencyCode: 'XCD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'GT',
    countryName: 'Guatemala',
    regionCode: 'americas',
    currencyCode: 'GTQ',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'GN',
    countryName: 'Guinea',
    regionCode: 'africa',
    currencyCode: 'GNF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'GW',
    countryName: 'Guinea-Bissau',
    regionCode: 'africa',
    currencyCode: 'XOF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'GY',
    countryName: 'Guyana',
    regionCode: 'americas',
    currencyCode: 'GYD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'HT',
    countryName: 'Haiti',
    regionCode: 'americas',
    currencyCode: 'HTG',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'HN',
    countryName: 'Honduras',
    regionCode: 'americas',
    currencyCode: 'HNL',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'IR',
    countryName: 'Iran',
    regionCode: 'middle_east',
    currencyCode: 'IRR',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'KI',
    countryName: 'Kiribati',
    regionCode: 'asia',
    currencyCode: 'AUD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'KP',
    countryName: 'North Korea',
    regionCode: 'asia',
    currencyCode: 'KPW',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'KG',
    countryName: 'Kyrgyzstan',
    regionCode: 'asia',
    currencyCode: 'KGS',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'LS',
    countryName: 'Lesotho',
    regionCode: 'africa',
    currencyCode: 'LSL',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'LR',
    countryName: 'Liberia',
    regionCode: 'africa',
    currencyCode: 'LRD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'LY',
    countryName: 'Libya',
    regionCode: 'africa',
    currencyCode: 'LYD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'LI',
    countryName: 'Liechtenstein',
    regionCode: 'europe',
    currencyCode: 'CHF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'MG',
    countryName: 'Madagascar',
    regionCode: 'africa',
    currencyCode: 'MGA',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'MW',
    countryName: 'Malawi',
    regionCode: 'africa',
    currencyCode: 'MWK',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'ML',
    countryName: 'Mali',
    regionCode: 'africa',
    currencyCode: 'XOF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'MH',
    countryName: 'Marshall Islands',
    regionCode: 'asia',
    currencyCode: 'USD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'MR',
    countryName: 'Mauritania',
    regionCode: 'africa',
    currencyCode: 'MRU',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'FM',
    countryName: 'Micronesia',
    regionCode: 'asia',
    currencyCode: 'USD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'MD',
    countryName: 'Moldova',
    regionCode: 'europe',
    currencyCode: 'MDL',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'MC',
    countryName: 'Monaco',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'MN',
    countryName: 'Mongolia',
    regionCode: 'asia',
    currencyCode: 'MNT',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'ME',
    countryName: 'Montenegro',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'NA',
    countryName: 'Namibia',
    regionCode: 'africa',
    currencyCode: 'NAD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'NR',
    countryName: 'Nauru',
    regionCode: 'asia',
    currencyCode: 'AUD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'NI',
    countryName: 'Nicaragua',
    regionCode: 'americas',
    currencyCode: 'NIO',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'NE',
    countryName: 'Niger',
    regionCode: 'africa',
    currencyCode: 'XOF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'MK',
    countryName: 'North Macedonia',
    regionCode: 'europe',
    currencyCode: 'MKD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'PW',
    countryName: 'Palau',
    regionCode: 'asia',
    currencyCode: 'USD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'PS',
    countryName: 'Palestine',
    regionCode: 'middle_east',
    currencyCode: 'ILS',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'PY',
    countryName: 'Paraguay',
    regionCode: 'americas',
    currencyCode: 'PYG',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'RU',
    countryName: 'Russia',
    regionCode: 'europe',
    currencyCode: 'RUB',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'KN',
    countryName: 'Saint Kitts and Nevis',
    regionCode: 'americas',
    currencyCode: 'XCD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'LC',
    countryName: 'Saint Lucia',
    regionCode: 'americas',
    currencyCode: 'XCD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'VC',
    countryName: 'Saint Vincent and the Grenadines',
    regionCode: 'americas',
    currencyCode: 'XCD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'WS',
    countryName: 'Samoa',
    regionCode: 'asia',
    currencyCode: 'WST',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'SM',
    countryName: 'San Marino',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'ST',
    countryName: 'Sao Tome and Principe',
    regionCode: 'africa',
    currencyCode: 'STN',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'RS',
    countryName: 'Serbia',
    regionCode: 'europe',
    currencyCode: 'RSD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'SC',
    countryName: 'Seychelles',
    regionCode: 'africa',
    currencyCode: 'SCR',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'SL',
    countryName: 'Sierra Leone',
    regionCode: 'africa',
    currencyCode: 'SLL',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'SB',
    countryName: 'Solomon Islands',
    regionCode: 'asia',
    currencyCode: 'SBD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'SO',
    countryName: 'Somalia',
    regionCode: 'africa',
    currencyCode: 'SOS',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'SS',
    countryName: 'South Sudan',
    regionCode: 'africa',
    currencyCode: 'SSP',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'SD',
    countryName: 'Sudan',
    regionCode: 'africa',
    currencyCode: 'SDG',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'SR',
    countryName: 'Suriname',
    regionCode: 'americas',
    currencyCode: 'SRD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'SY',
    countryName: 'Syria',
    regionCode: 'middle_east',
    currencyCode: 'SYP',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'TJ',
    countryName: 'Tajikistan',
    regionCode: 'asia',
    currencyCode: 'TJS',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'TL',
    countryName: 'Timor-Leste',
    regionCode: 'asia',
    currencyCode: 'USD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'TG',
    countryName: 'Togo',
    regionCode: 'africa',
    currencyCode: 'XOF',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'TO',
    countryName: 'Tonga',
    regionCode: 'asia',
    currencyCode: 'TOP',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'TM',
    countryName: 'Turkmenistan',
    regionCode: 'asia',
    currencyCode: 'TMT',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'TV',
    countryName: 'Tuvalu',
    regionCode: 'asia',
    currencyCode: 'AUD',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'UA',
    countryName: 'Ukraine',
    regionCode: 'europe',
    currencyCode: 'UAH',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'VU',
    countryName: 'Vanuatu',
    regionCode: 'asia',
    currencyCode: 'VUV',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'VA',
    countryName: 'Vatican City',
    regionCode: 'europe',
    currencyCode: 'EUR',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'VE',
    countryName: 'Venezuela',
    regionCode: 'americas',
    currencyCode: 'VES',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
  {
    countryCode: 'YE',
    countryName: 'Yemen',
    regionCode: 'middle_east',
    currencyCode: 'YER',
    primaryLanguage: 'en',
    languages: ['en'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },
];
