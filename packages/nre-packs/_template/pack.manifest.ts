export interface LawRuleDefinition {
  section: string;
  title: string;
  titleLocal?: string;
  violationType: string;
  penaltyType: 'fixed' | 'range' | 'per_day' | 'percent_revenue' | 'fixed_plus_imprisonment';
  minPenalty: number;
  maxPenalty: number;
  currency: string;
  dailyAccrual?: number;
  revenuePercent?: number;
  severityGrade: 'minor' | 'moderate' | 'major' | 'critical';
  repeatMultiplier: number;
  repeatOffenseRule?: {
    multiplier: number;
    windowMonths: number;
    lookupScope: 'country' | 'regional' | 'global';
  };
  paymentDeadlineDays: number;
  appealWindowDays: number;
  imprisonmentNote?: string;
  autoEnforceable: boolean;
}

export interface LawDefinition {
  code: string;
  title: string;
  titleLocal?: string;
  regulatorCode?: string;
  language?: string;
  officialGazetteRef?: string;
  effectiveFrom?: string;
  status: 'draft' | 'active' | 'amended' | 'repealed';
  version: number;
  supersedes?: string;
  rules: LawRuleDefinition[];
}

export interface RegulatorDefinition {
  code: string;
  name: string;
  nameLocal?: string;
  sector: string;
  sectors: string[];
  enforcementPower: 'full' | 'advisory' | 'via_court';
  appealBody?: string;
  contactEmail?: string;
  website?: string;
  portalConfig?: {
    onlineDisputeUrl?: string;
    whistleblowerEndpoint?: string;
    apiKeyRequired?: boolean;
  };
}

export interface NotificationChannelsConfig {
  email: boolean;
  whatsapp: boolean;
  wechat?: boolean;
  smsFallback: boolean;
  physicalLetter: boolean;
  languagePriority: string[];
}

export interface ScannerPolicyConfig {
  robotsPolicy: 'strict' | 'standard' | 'relaxed';
  crawlDepth: number;
  githubEnabled: boolean;
  cloudScan: 'mou_only' | 'standard' | 'unrestricted';
  registrySource: 'official_api' | 'manual' | 'hybrid';
}

export interface LetterTemplateDefinition {
  templateId: string;
  title: string;
  headerSeal: string;
  salutationEn: string;
  salutationLocal?: string;
  statutoryPreambleEn: string;
  statutoryPreambleLocal?: string;
  enforcementNoticeBodyEn: string;
  enforcementNoticeBodyLocal?: string;
  appealNoticeEn: string;
  appealNoticeLocal?: string;
  signatureAuthorityEn: string;
  signatureAuthorityLocal?: string;
}

export interface CountryPackManifest {
  countryCode: string; // ISO 3166-1 alpha-2
  countryName: string;
  regionCode: 'asia' | 'middle_east' | 'africa' | 'americas' | 'europe';
  currencyCode: string;
  languages: string[];
  primaryLanguage: string;
  timezone: string;
  legalSystem: 'common_law' | 'civil_law' | 'sharia_based' | 'mixed';
  dataResidencyRequired: boolean;
  internationalSanctionsList: string[];
  scannerLegalGate: 'standard' | 'strict' | 'government_mou_required' | 'restricted';
  govtMouRequired: boolean;
  packVersion: string;
  status: 'draft' | 'pilot' | 'active' | 'suspended';
  fxSource: string;
  scannerConfig: ScannerPolicyConfig;
  notificationChannels: NotificationChannelsConfig;
  letterTemplateSet: LetterTemplateDefinition[];
  regulators: RegulatorDefinition[];
  laws: LawDefinition[];
  registryIntegration?: {
    tradeLicenseLookupUrl?: string;
    taxIdLookupUrl?: string;
    cacLookupUrl?: string;
  };
}
