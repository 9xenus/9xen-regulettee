/**
 * 9XEN_REGULETTEE GEOLOCATION & REGIONAL COOKIE LAW ROUTER
 * Dynamically resolves regional cookie and privacy consent requirements based on:
 * - Active Platform Jurisdiction (EU, SA, AE, US-CA, US-HIPAA, CA, ZA, NG, UK, APAC, GLOBAL)
 * - SaaS Admin Global Configuration & Overrides
 * - Client IP / Sovereign Node Detection
 * - Localized Language Context (English, Arabic, German, French, Spanish, Italian)
 */

export type RegionalJurisdiction = 
  | 'EU' 
  | 'UK' 
  | 'USA_CA' 
  | 'USA_HIPAA' 
  | 'USA_GEN' 
  | 'MENA_KSA' 
  | 'MENA_UAE' 
  | 'APAC_SG' 
  | 'APAC_IN' 
  | 'APAC_AU' 
  | 'CA_PIPEDA' 
  | 'AFRICA_ZA' 
  | 'AFRICA_NG' 
  | 'GLOBAL';

export type ConsentModel = 'OPT_IN' | 'OPT_OUT' | 'NOTICE_ONLY';

export interface RegionalConfig {
  jurisdiction: RegionalJurisdiction;
  countryCode: string;
  regionName: string;
  flag: string;
  lawName: string;
  regulatoryBody: string;
  consentModel: ConsentModel;
  bannerTemplate: string;
  requireRejectAll: boolean;
  enableCategoryToggles: boolean;
  autoBlockTrackers: boolean;
  requiredLinks: { label: string; url: string; key?: string }[];
  dataResidencyNode: string;
  reconsentDays: number;
  customNoticeEn?: string;
  customNoticeAr?: string;
}

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

export const DEFAULT_REGIONAL_CONFIGS: Record<RegionalJurisdiction, RegionalConfig> = {
  'EU': {
    jurisdiction: 'EU',
    countryCode: 'EU',
    regionName: 'European Union (EEA)',
    flag: '🇪🇺',
    lawName: 'GDPR (Art. 7) & ePrivacy Directive (2002/58/EC)',
    regulatoryBody: 'European Data Protection Board (EDPB)',
    consentModel: 'OPT_IN',
    bannerTemplate: 'GDPR_STRICT_EQUAL_PROMINENCE',
    requireRejectAll: true,
    enableCategoryToggles: true,
    autoBlockTrackers: true,
    requiredLinks: [
      { label: 'Cookie Policy', url: '#cookie-policy' },
      { label: 'DPO Contact', url: '#dpo-contact' },
      { label: 'DPIA Summary', url: '#dpia-summary' }
    ],
    dataResidencyNode: 'eu-central-1-frankfurt-sovereign',
    reconsentDays: 180
  },
  'MENA_KSA': {
    jurisdiction: 'MENA_KSA',
    countryCode: 'SA',
    regionName: 'Kingdom of Saudi Arabia (KSA)',
    flag: '🇸🇦',
    lawName: 'Personal Data Protection Law (PDPL) & Executive Regulations',
    regulatoryBody: 'Saudi Data & AI Authority (SDAIA)',
    consentModel: 'OPT_IN',
    bannerTemplate: 'PDPL_SDAIA_MANDATE',
    requireRejectAll: true,
    enableCategoryToggles: true,
    autoBlockTrackers: true,
    requiredLinks: [
      { label: 'سياسة الخصوصية (Privacy Policy)', url: '#privacy-policy' },
      { label: 'إشعار نقل البيانات (Cross-Border Transfer Notice)', url: '#data-transfer' },
      { label: 'تسجيل سدايا (SDAIA Registry)', url: '#sdaia-notice' }
    ],
    dataResidencyNode: 'me-south-1-riyadh-sovereign',
    reconsentDays: 180
  },
  'MENA_UAE': {
    jurisdiction: 'MENA_UAE',
    countryCode: 'AE',
    regionName: 'United Arab Emirates (UAE)',
    flag: '🇦🇪',
    lawName: 'Federal Decree-Law No. 45 of 2021 on Personal Data Protection',
    regulatoryBody: 'UAE Data Office & TDRA',
    consentModel: 'OPT_IN',
    bannerTemplate: 'UAE_DATA_LAW_DIRECTIVE',
    requireRejectAll: true,
    enableCategoryToggles: true,
    autoBlockTrackers: true,
    requiredLinks: [
      { label: 'UAE Privacy Framework', url: '#privacy-policy' },
      { label: 'UAE DPO Office', url: '#uae-dpo' }
    ],
    dataResidencyNode: 'me-central-1-dubai-sovereign',
    reconsentDays: 180
  },
  'USA_CA': {
    jurisdiction: 'USA_CA',
    countryCode: 'US-CA',
    regionName: 'United States (California)',
    flag: '🇺🇸',
    lawName: 'California Consumer Privacy Act (CCPA) / CPRA',
    regulatoryBody: 'California Privacy Protection Agency (CPPA)',
    consentModel: 'OPT_OUT',
    bannerTemplate: 'CCPA_DO_NOT_SELL',
    requireRejectAll: false,
    enableCategoryToggles: true,
    autoBlockTrackers: false,
    requiredLinks: [
      { label: 'Do Not Sell or Share My Personal Info', url: '#do-not-sell' },
      { label: 'Notice at Collection', url: '#notice-at-collection' },
      { label: 'California Privacy Rights', url: '#privacy-rights' }
    ],
    dataResidencyNode: 'us-west-1-california',
    reconsentDays: 365
  },
  'USA_HIPAA': {
    jurisdiction: 'USA_HIPAA',
    countryCode: 'US-HIPAA',
    regionName: 'United States (Healthcare / HIPAA)',
    flag: '🏥',
    lawName: 'HIPAA Security & Privacy Rules & HHS AI Mandates',
    regulatoryBody: 'HHS Office for Civil Rights (OCR)',
    consentModel: 'OPT_IN',
    bannerTemplate: 'HIPAA_PHI_SAFEGUARD',
    requireRejectAll: true,
    enableCategoryToggles: true,
    autoBlockTrackers: true,
    requiredLinks: [
      { label: 'HIPAA Privacy Safeguards', url: '#hipaa-notice' },
      { label: 'BAA Compliance Terms', url: '#baa-terms' }
    ],
    dataResidencyNode: 'us-east-1-healthcare-enclave',
    reconsentDays: 90
  },
  'USA_GEN': {
    jurisdiction: 'USA_GEN',
    countryCode: 'US',
    regionName: 'United States (Federal / Multi-State)',
    flag: '🇺🇸',
    lawName: 'Multi-State Privacy (VCDPA, CPA, CTDPA, UCPA)',
    regulatoryBody: 'State Attorneys General & FTC',
    consentModel: 'OPT_OUT',
    bannerTemplate: 'US_MULTI_STATE_OPT_OUT',
    requireRejectAll: false,
    enableCategoryToggles: true,
    autoBlockTrackers: false,
    requiredLinks: [
      { label: 'Privacy Notice', url: '#privacy-notice' },
      { label: 'Your Privacy Choices', url: '#privacy-choices' }
    ],
    dataResidencyNode: 'us-east-1-standard',
    reconsentDays: 365
  },
  'UK': {
    jurisdiction: 'UK',
    countryCode: 'GB',
    regionName: 'United Kingdom',
    flag: '🇬🇧',
    lawName: 'UK GDPR & Privacy and Electronic Communications Regulations (PECR)',
    regulatoryBody: 'Information Commissioner’s Office (ICO)',
    consentModel: 'OPT_IN',
    bannerTemplate: 'UK_ICO_STRICT_OPT_IN',
    requireRejectAll: true,
    enableCategoryToggles: true,
    autoBlockTrackers: true,
    requiredLinks: [
      { label: 'Cookie Policy', url: '#cookie-policy' },
      { label: 'ICO Rights Notice', url: '#ico-rights' }
    ],
    dataResidencyNode: 'eu-west-2-london-sovereign',
    reconsentDays: 180
  },
  'CA_PIPEDA': {
    jurisdiction: 'CA_PIPEDA',
    countryCode: 'CA',
    regionName: 'Canada',
    flag: '🇨🇦',
    lawName: 'PIPEDA & Artificial Intelligence and Data Act (AIDA)',
    regulatoryBody: 'Office of the Privacy Commissioner of Canada (OPC)',
    consentModel: 'OPT_IN',
    bannerTemplate: 'PIPEDA_EXPRESS_CONSENT',
    requireRejectAll: true,
    enableCategoryToggles: true,
    autoBlockTrackers: true,
    requiredLinks: [
      { label: 'PIPEDA Privacy Statement', url: '#pipeda-statement' },
      { label: 'OPC Compliance Rights', url: '#opc-rights' }
    ],
    dataResidencyNode: 'ca-central-1-montreal',
    reconsentDays: 180
  },
  'AFRICA_ZA': {
    jurisdiction: 'AFRICA_ZA',
    countryCode: 'ZA',
    regionName: 'South Africa',
    flag: '🇿🇦',
    lawName: 'Protection of Personal Information Act (POPIA)',
    regulatoryBody: 'Information Regulator South Africa',
    consentModel: 'OPT_IN',
    bannerTemplate: 'POPIA_DIRECT_CONSENT',
    requireRejectAll: true,
    enableCategoryToggles: true,
    autoBlockTrackers: true,
    requiredLinks: [
      { label: 'POPIA Compliance Notice', url: '#popia-notice' },
      { label: 'Information Officer Contact', url: '#info-officer' }
    ],
    dataResidencyNode: 'af-south-1-johannesburg',
    reconsentDays: 180
  },
  'AFRICA_NG': {
    jurisdiction: 'AFRICA_NG',
    countryCode: 'NG',
    regionName: 'Nigeria',
    flag: '🇳🇬',
    lawName: 'Nigeria Data Protection Act (NDPA) & NDPR',
    regulatoryBody: 'Nigeria Data Protection Commission (NDPC)',
    consentModel: 'OPT_IN',
    bannerTemplate: 'NDPR_CONSENT_MANDATE',
    requireRejectAll: true,
    enableCategoryToggles: true,
    autoBlockTrackers: true,
    requiredLinks: [
      { label: 'NDPA Privacy Notice', url: '#ndpa-notice' }
    ],
    dataResidencyNode: 'af-west-1-lagos',
    reconsentDays: 180
  },
  'APAC_IN': {
    jurisdiction: 'APAC_IN',
    countryCode: 'IN',
    regionName: 'India',
    flag: '🇮🇳',
    lawName: 'Digital Personal Data Protection Act 2023 (DPDP)',
    regulatoryBody: 'Data Protection Board of India (DPBI)',
    consentModel: 'OPT_IN',
    bannerTemplate: 'DPDP_INDIA_MANDATE',
    requireRejectAll: true,
    enableCategoryToggles: true,
    autoBlockTrackers: true,
    requiredLinks: [
      { label: 'Consent Notice (DPDP)', url: '#consent-notice' },
      { label: 'Grievance Officer Details', url: '#grievance-officer' }
    ],
    dataResidencyNode: 'ap-south-1-mumbai',
    reconsentDays: 180
  },
  'APAC_SG': {
    jurisdiction: 'APAC_SG',
    countryCode: 'SG',
    regionName: 'Singapore',
    flag: '🇸🇬',
    lawName: 'Personal Data Protection Act (PDPA)',
    regulatoryBody: 'Personal Data Protection Commission (PDPC)',
    consentModel: 'NOTICE_ONLY',
    bannerTemplate: 'PDPA_SG_TRANSPARENCY',
    requireRejectAll: false,
    enableCategoryToggles: true,
    autoBlockTrackers: false,
    requiredLinks: [
      { label: 'PDPA Privacy Statement', url: '#pdpa-statement' },
      { label: 'DPO Office', url: '#dpo-sg' }
    ],
    dataResidencyNode: 'ap-southeast-1-singapore',
    reconsentDays: 365
  },
  'APAC_AU': {
    jurisdiction: 'APAC_AU',
    countryCode: 'AU',
    regionName: 'Australia',
    flag: '🇦🇺',
    lawName: 'Privacy Act 1988 (Australian Privacy Principles - APPs)',
    regulatoryBody: 'OAIC (Office of the Australian Information Commissioner)',
    consentModel: 'NOTICE_ONLY',
    bannerTemplate: 'OAIC_APP_NOTICE',
    requireRejectAll: false,
    enableCategoryToggles: true,
    autoBlockTrackers: false,
    requiredLinks: [
      { label: 'Australian Privacy Policy', url: '#privacy-policy' },
      { label: 'OAIC Rights', url: '#oaic-rights' }
    ],
    dataResidencyNode: 'ap-southeast-2-sydney',
    reconsentDays: 365
  },
  'GLOBAL': {
    jurisdiction: 'GLOBAL',
    countryCode: 'GLOBAL',
    regionName: 'Global International Standard',
    flag: '🌐',
    lawName: 'Cross-Border Sovereign Privacy Baseline',
    regulatoryBody: '9Xen Regulettee Sovereign Governance Protocol',
    consentModel: 'OPT_OUT',
    bannerTemplate: 'GLOBAL_TRANSPARENT_BASELINE',
    requireRejectAll: false,
    enableCategoryToggles: true,
    autoBlockTrackers: false,
    requiredLinks: [
      { label: 'Global Privacy Policy', url: '#privacy-policy' },
      { label: 'Cookie Terms', url: '#cookie-terms' }
    ],
    dataResidencyNode: 'global-edge-mesh-node',
    reconsentDays: 365
  }
};

const STORAGE_KEY_REGIONAL_CONFIGS = '9xen-regulettee_regional_cookie_configs';
const STORAGE_KEY_COOKIE_BANNER_ENABLED = '9xen-regulettee_cookie_banner_enabled';

export class GeoLocationService {
  /**
   * Retrieves all regional cookie configurations with admin overrides.
   */
  public static getRegionalConfigs(): Record<RegionalJurisdiction, RegionalConfig> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REGIONAL_CONFIGS);
      if (saved) {
        return { ...DEFAULT_REGIONAL_CONFIGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse regional cookie configs from storage', e);
    }
    return DEFAULT_REGIONAL_CONFIGS;
  }

  /**
   * Saves updated regional configurations from the SaaS Admin panel.
   */
  public static saveRegionalConfigs(configs: Record<RegionalJurisdiction, RegionalConfig>): void {
    localStorage.setItem(STORAGE_KEY_REGIONAL_CONFIGS, JSON.stringify(configs));
    window.dispatchEvent(new CustomEvent('cookie_config_changed', { detail: configs }));
  }

  /**
   * Checks whether the global platform cookie banner is enabled by SaaS admin.
   */
  public static isCookieBannerEnabled(): boolean {
    const setting = localStorage.getItem(STORAGE_KEY_COOKIE_BANNER_ENABLED);
    return setting === null ? true : setting === 'true';
  }

  /**
   * Sets whether the global platform cookie banner is enabled.
   */
  public static setCookieBannerEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEY_COOKIE_BANNER_ENABLED, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('cookie_config_changed'));
  }

  /**
   * Maps a platform CountryCode to its corresponding RegionalJurisdiction.
   */
  public static countryCodeToJurisdiction(countryCode?: string): RegionalJurisdiction {
    const code = (countryCode || '').toUpperCase().trim();
    switch (code) {
      case 'SA':
      case 'KSA':
      case 'SAUDI':
        return 'MENA_KSA';
      case 'AE':
      case 'UAE':
      case 'DUBAI':
        return 'MENA_UAE';
      case 'US-CA':
      case 'CA-US':
        return 'USA_CA';
      case 'US-HIPAA':
      case 'HIPAA':
        return 'USA_HIPAA';
      case 'US':
      case 'USA':
        return 'USA_GEN';
      case 'CA':
      case 'CAN':
        return 'CA_PIPEDA';
      case 'ZA':
      case 'ZAF':
        return 'AFRICA_ZA';
      case 'NG':
      case 'NGA':
        return 'AFRICA_NG';
      case 'GB':
      case 'UK':
        return 'UK';
      case 'IN':
      case 'IND':
        return 'APAC_IN';
      case 'SG':
      case 'SGP':
        return 'APAC_SG';
      case 'AU':
      case 'AUS':
        return 'APAC_AU';
      case 'EU':
      case 'DE':
      case 'FR':
      case 'ES':
      case 'IT':
      case 'NL':
      case 'SE':
      case 'PL':
      case 'AT':
      case 'BE':
      case 'IE':
        return 'EU';
      default:
        return 'GLOBAL';
    }
  }

  /**
   * Detects regional configuration dynamically based on active platform country or IP.
   */
  public static detectRegion(countryCodeOrIp?: string): RegionalConfig {
    const configs = this.getRegionalConfigs();
    
    // Check if input is a known country code
    if (countryCodeOrIp && !countryCodeOrIp.includes('.')) {
      const j = this.countryCodeToJurisdiction(countryCodeOrIp);
      if (configs[j]) return configs[j];
    }

    // IP Simulation logic
    const ip = countryCodeOrIp || '';
    if (ip.startsWith('10.0.0') || ip.startsWith('192.168.10')) return configs['MENA_KSA'];
    if (ip.startsWith('10.1.0')) return configs['MENA_UAE'];
    if (ip.startsWith('172.16.1')) return configs['USA_CA'];
    if (ip.startsWith('172.16.9')) return configs['USA_HIPAA'];
    if (ip.startsWith('192.168.1')) return configs['EU'];
    if (ip.startsWith('192.168.2')) return configs['UK'];
    if (ip.startsWith('49.')) return configs['APAC_IN'];
    if (ip.startsWith('202.')) return configs['APAC_SG'];

    // Check stored active country code if available
    const storedCountry = localStorage.getItem('app_global_country');
    if (storedCountry) {
      const j = this.countryCodeToJurisdiction(storedCountry);
      if (configs[j]) return configs[j];
    }

    return configs['EU'];
  }

  /**
   * Retrieves localized legal banner notice text based on jurisdiction and platform UI language.
   */
  public static getBannerTranslation(jurisdiction: RegionalJurisdiction, language: string = 'en'): string {
    const lang = language.toLowerCase();
    const configs = this.getRegionalConfigs();
    const current = configs[jurisdiction] || configs['GLOBAL'];

    // Check if admin defined custom notice text
    if (lang === 'ar' && current.customNoticeAr) {
      return current.customNoticeAr;
    }
    if (lang !== 'ar' && current.customNoticeEn) {
      return current.customNoticeEn;
    }

    // Comprehensive multi-language regional dictionary
    const notices: Record<RegionalJurisdiction, Record<string, string>> = {
      'EU': {
        en: 'We deploy essential and analytical cookies in strict accordance with the EU General Data Protection Regulation (GDPR Art. 6 & 7) and ePrivacy Directive. Non-essential tracking scripts remain gated until explicit affirmative consent is granted.',
        de: 'Wir setzen Cookies und Tracking-Technologien in strikter Übereinstimmung mit der DSGVO (Art. 6 & 7) und der ePrivacy-Richtlinie ein. Nicht notwendige Cookies werden erst nach Ihrer ausdrücklichen Einwilligung aktiviert.',
        fr: 'Nous utilisons des cookies essentiels et d\'analyse en stricte conformité avec le RGPD (Art. 6 et 7) et la directive ePrivacy. Les traceurs non essentiels restent bloqués jusqu\'à votre consentement explicite.',
        es: 'Utilizamos cookies técnicas y analíticas en estricto cumplimiento del RGPD (Art. 6 y 7) y la Directiva ePrivacy. Las cookies no esenciales no se activan sin su consentimiento previo y explícito.',
        it: 'Utilizziamo cookie tecnici e analitici in stretta conformità con il GDPR (Art. 6 e 7) e la Direttiva ePrivacy. I cookie non essenziali rimangono bloccati fino al rilascio del tuo consenso esplicito.',
        ar: 'نحن نستخدم ملفات تعريف الارتباط الأساسية والتحليلية بالامتثال الصارم للائحة العامة لحماية البيانات في الاتحاد الأوروبي (GDPR المادة 6 و 7) وتوجيه الخصوصية الإلكترونية. تظل أدوات التتبع غير الضرورية محظورة حتى يتم منح الموافقة الصريحة.'
      },
      'MENA_KSA': {
        en: 'We deploy telemetry and cookies in strict compliance with the Saudi Personal Data Protection Law (PDPL) and SDAIA Executive Regulations. Non-essential tracking requires explicit prior consent and data resides within Saudi Sovereign Enclaves.',
        de: 'Wir verarbeiten Daten gemäß dem saudi-arabischen Datenschutzgesetz (PDPL) und den SDAIA-Vorschriften mit Datenhaltung in saudi-arabischen Enklaven.',
        fr: 'Nous traitons vos données en stricte conformité avec la loi saoudienne sur la protection des données personnelles (PDPL) et les règlements de la SDAIA.',
        es: 'Procesamos datos de conformidad con la Ley de Protección de Datos Personales de Arabia Saudita (PDPL) y las directrices de la SDAIA.',
        it: 'Elaboriamo i dati in conformità con la legge saudita sulla protezione dei dati personali (PDPL) e le normative SDAIA.',
        ar: 'نحن نستخدم ملفات تعريف الارتباط وتقنيات التتبع المتقدمة لمعالجة بياناتك وفقاً لأحكام نظام حماية البيانات الشخصية السعودي (PDPL) واللوائح التنفيذية الصادرة عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا). يتم تخزين ومعالجة البيانات بشكل سيادي داخل المملكة.'
      },
      'MENA_UAE': {
        en: 'In compliance with UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection, we require your consent to deploy non-essential analytics and tracking. You retain the full right to decline or customize preferences.',
        de: 'In Übereinstimmung mit dem VAE-Datenschutzgesetz Nr. 45 von 2021 benötigen wir Ihre Einwilligung zur Verwendung von Cookies.',
        fr: 'Conformément au décret-loi fédéral des Émirats arabes unis n° 45 de 2021 sur la protection des données personnelles, nous demandons votre accord préalable.',
        es: 'De conformidad con el Decreto-Ley Federal de los EAU Nº 45 de 2021 sobre Protección de Datos Personales, requerimos su consentimiento.',
        it: 'In conformità con il decreto-legge federale degli Emirati Arabi Uniti n. 45 del 2021, richiediamo il tuo consenso per i cookie non essenziali.',
        ar: 'وفقاً لأحكام المرسوم بقانون اتحادي رقم (45) لسنة 2021 في شأن حماية البيانات الشخصية بدولة الإمارات العربية المتحدة، يلزم الحصول على موافقتكم لتفعيل ملفات التحليل والتتبع غير الضرورية مع حقكم الكامل في الرفض.'
      },
      'USA_CA': {
        en: 'We use cookies and analytical identifiers to enhance your experience. Under the California Consumer Privacy Act (CCPA/CPRA), you have the absolute right to opt out of the sale or sharing of your personal information and limit the use of sensitive data.',
        de: 'Gemäß dem California Consumer Privacy Act (CCPA/CPRA) haben Sie das Recht, dem Verkauf oder der Weitergabe Ihrer personenbezogenen Daten zu widersprechen.',
        fr: 'En vertu de la loi californienne sur la protection des données (CCPA/CPRA), vous avez le droit de refuser la vente ou le partage de vos informations personnelles.',
        es: 'Bajo la Ley de Privacidad del Consumidor de California (CCPA/CPRA), usted tiene el derecho de optar por no vender ni compartir su información personal.',
        it: 'Ai sensi del California Consumer Privacy Act (CCPA/CPRA), hai il diritto di opporsi alla vendita o alla condivisione dei tuoi dati personali.',
        ar: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك الرقمية. بموجب قانون خصوصية المستهلك في كاليفورنيا (CCPA/CPRA)، يحق لك إلغاء الاشتراك في بيع أو مشاركة معلوماتك الشخصية وتقييد استخدام البيانات الحساسة.'
      },
      'USA_HIPAA': {
        en: 'Strict Protected Health Information (PHI) safeguards engaged. Web tracking pixels and unconsented telemetry are entirely disabled in compliance with HHS OCR and HIPAA Security Rules.',
        de: 'Strenge HIPAA-Datenschutzrichtlinien für Gesundheitsdaten aktiv. Nicht autorisierte Tracking-Pixel sind vollständig deaktiviert.',
        fr: 'Mesures de sécurité strictes HIPAA pour les données de santé activées. Tous les pixels tiers non autorisés sont désactivés.',
        es: 'Medidas de seguridad estrictas de HIPAA activadas. Los píxeles de seguimiento web están completamente desactivados.',
        it: 'Misure di protezione rigorose HIPAA attive. I pixel di tracciamento non autorizzati sono disabilitati.',
        ar: 'تم تفعيل إجراءات الحماية الصارمة للمعلومات الصحية المحمية (HIPAA). يتم حظر جميع وحدات التتبع والبكسلات غير المصرح بها بالكامل لحماية بياناتك الصحية.'
      },
      'USA_GEN': {
        en: 'We use cookies to ensure platform reliability, measure analytics, and support personalized capabilities. You can adjust your consent choices at any time.',
        de: 'Wir verwenden Cookies für Zuverlässigkeit und Analysen. Sie können Ihre Einstellungen jederzeit anpassen.',
        fr: 'Nous utilisons des cookies pour assurer le bon fonctionnement et mesurer la performance.',
        es: 'Utilizamos cookies para garantizar la fiabilidad del servicio y medir analíticas.',
        it: 'Utilizziamo cookie per garantire l\'affidabilità e misurare le prestazioni.',
        ar: 'نستخدم ملفات تعريف الارتباط لضمان استقرار المنظومة وقياس الأداء وتقديم تجربة مخصصة لك. يمكنك تعديل خيارات الخصوصية في أي وقت.'
      },
      'UK': {
        en: 'In accordance with UK GDPR and Privacy and Electronic Communications Regulations (PECR), we only deploy non-essential cookies with your express opt-in consent.',
        de: 'Gemäß UK-DSGVO und PECR setzen wir nicht-essenzielle Cookies nur mit Ihrer ausdrücklichen Einwilligung ein.',
        fr: 'Conformément au RGPD britannique et aux règlements PECR, nous ne déployons les cookies non essentiels qu\'avec votre accord explicite.',
        es: 'De conformidad con el RGPD del Reino Unido y las normas PECR, solo implementamos cookies no esenciales con su consentimiento expreso.',
        it: 'In conformità con il GDPR del Regno Unito e il PECR, utilizziamo cookie non essenziali solo con il tuo consenso espresso.',
        ar: 'وفقاً لأحكام اللائحة العامة لحماية البيانات في المملكة المتحدة (UK GDPR) وقواعد PECR، لا نقوم بتشغيل ملفات التتبع غير الأساسية إلا بعد موافقتك الصريحة.'
      },
      'CA_PIPEDA': {
        en: 'In compliance with PIPEDA and Canadian privacy standards, meaningful consent is required before collecting or sharing analytical and tracking tokens.',
        de: 'Gemäß PIPEDA ist eine ausdrückliche Einwilligung vor der Erfassung von Analyse-Cookies erforderlich.',
        fr: 'Conformément à la LPRPDE (PIPEDA), un consentement éclairé est requis avant toute collecte de données d\'analyse.',
        es: 'De conformidad con PIPEDA, se requiere un consentimiento informado antes de recopilar datos de análisis.',
        it: 'In conformità con il PIPEDA, è richiesto un consenso informato prima di raccogliere dati analitici.',
        ar: 'وفقاً لقانون حماية المعلومات الشخصية والوثائق الإلكترونية الكندي (PIPEDA)، يلزم الحصول على موافقة مستنيرة قبل جمع أو مشاركة أي بيانات تتبع تحليلية.'
      },
      'AFRICA_ZA': {
        en: 'In accordance with South Africa\'s Protection of Personal Information Act (POPIA), we process personal data lawfully and respect your right to manage tracking preferences.',
        de: 'Gemäß dem südafrikanischen Datenschutzgesetz (POPIA) respektieren wir Ihr Recht, Tracking-Präferenzen zu verwalten.',
        fr: 'Conformément à la loi sud-africaine POPIA, nous traitons vos données conformément à la réglementation.',
        es: 'De conformidad con la Ley POPIA de Sudáfrica, respetamos su derecho a gestionar sus preferencias de seguimiento.',
        it: 'In conformità con il POPIA sudafricano, rispettiamo il tuo diritto di gestire le preferenze di tracciamento.',
        ar: 'وفقاً لأحكام قانون حماية المعلومات الشخصية في جنوب إفريقيا (POPIA)، فإننا نعالج البيانات بشكل قانوني ونحترم حقك في إدارة تفضيلات التتبع.'
      },
      'AFRICA_NG': {
        en: 'Compliant with the Nigeria Data Protection Act (NDPA) and NDPR mandates. You have full control over non-essential analytical cookies.',
        de: 'Konform mit dem Nigeria Data Protection Act (NDPA). Sie haben die volle Kontrolle über Cookies.',
        fr: 'Conforme à la loi nigériane sur la protection des données (NDPA).',
        es: 'Cumpliendo con la Ley de Protección de Datos de Nigeria (NDPA).',
        it: 'Conforme al Nigeria Data Protection Act (NDPA).',
        ar: 'متوافق مع قانون حماية البيانات النيجيري (NDPA) واللوائح التنظيمية ذات الصلة. لديك التحكم الكامل في خيارات ملفات تعريف الارتباط.'
      },
      'APAC_IN': {
        en: 'In accordance with India’s Digital Personal Data Protection Act (DPDP Act 2023), we request your clear consent to process personal identifiers and analytical tokens.',
        de: 'Gemäß dem indischen DPDP-Gesetz 2023 bitten wir um Ihre ausdrückliche Zustimmung.',
        fr: 'Conformément à la loi indienne DPDP de 2023, nous sollicitons votre consentement clair.',
        es: 'De conformidad con la Ley DPDP de India de 2023, solicitamos su consentimiento explícito.',
        it: 'In conformità con la legge indiana DPDP del 2023, richiediamo il tuo consenso esplicito.',
        ar: 'وفقاً لقانون حماية البيانات الشخصية الرقمية في الهند (DPDP Act 2023)، نطلب موافقتك الواضحة لمعالجة المعرفات الرقمية وملفات التحليل.'
      },
      'APAC_SG': {
        en: 'In accordance with Singapore’s Personal Data Protection Act (PDPA), we notify you of our data collection practices and offer preference customization.',
        de: 'Gemäß dem Datenschutzgesetz von Singapur (PDPA) informieren wir Sie über unsere Datenerfassung.',
        fr: 'Conformément à la loi sur la protection des données de Singapour (PDPA), nous vous informons de nos pratiques.',
        es: 'De conformidad con la Ley PDPA de Singapur, le notificamos sobre nuestras prácticas de recopilación de datos.',
        it: 'In conformità con il PDPA di Singapore, ti informiamo sulle nostre pratiche di raccolta dati.',
        ar: 'وفقاً لقانون حماية البيانات الشخصية في سنغافورة (PDPA)، نخطركم بسياسات جمع البيانات ونوفر لكم إمكانية تخصيص الخيارات.'
      },
      'APAC_AU': {
        en: 'We respect the Australian Privacy Principles (APPs) under the Privacy Act 1988, ensuring transparent management of cookies and telemetry.',
        de: 'Wir respektieren die australischen Datenschutzgrundsätze (APPs) gemäß dem Privacy Act 1988.',
        fr: 'Nous respectons les principes de confidentialité australiens (APP) en vertu du Privacy Act 1988.',
        es: 'Respetamos los Principios de Privacidad de Australia (APP) según la Ley de Privacidad de 1988.',
        it: 'Rispettiamo i principi di privacy australiani (APP) ai sensi del Privacy Act 1988.',
        ar: 'نلتزم بمبادئ الخصوصية الأسترالية (APPs) بموجب قانون الخصوصية لعام 1988 لضمان إدارة شفافة لملفات تعريف الارتباط.'
      },
      'GLOBAL': {
        en: 'We value your privacy and process data transparently across all sovereign nodes. Customize your preferences or accept standard operational cookies.',
        de: 'Wir schätzen Ihre Privatsphäre und verarbeiten Daten transparent über alle souveränen Knoten.',
        fr: 'Nous respectons votre vie privée et traitons les données de manière transparente.',
        es: 'Valoramos su privacidad y procesamos datos de forma transparente en todos los nodos soberanos.',
        it: 'Rispettiamo la tua privacy e trattiamo i dati in modo trasparente su tutti i nodi sovrani.',
        ar: 'نحن نولي خصوصيتك أعلى درجات الأهمية ونعالج البيانات بشفافية عبر العقد السيادية. يمكنك تخصيص تفضيلاتك أو قبول ملفات التشغيل القياسية.'
      }
    };

    const regionalNotices = notices[jurisdiction] || notices['GLOBAL'];
    return regionalNotices[lang] || regionalNotices['en'] || notices['GLOBAL']['en'];
  }
}
