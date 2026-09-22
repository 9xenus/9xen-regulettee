import { CountryPackManifest } from './_template/pack.manifest';
import { BANGLADESH_PACK } from './asia/bangladesh';
import { UAE_PACK } from './middle-east/uae';
import { NIGERIA_PACK } from './africa/nigeria';
import { INDIA_PACK } from './asia/india';
import { SAUDI_ARABIA_PACK } from './middle-east/saudi-arabia';
import { KENYA_PACK } from './africa/kenya';
import { SOUTH_AFRICA_PACK } from './africa/south-africa';
import { USA_PACK } from './americas/usa';

export * from './_template/pack.manifest';
export * from './worldCountriesData';

export interface PhaseDefinition {
  phase: number;
  label: string;
  focusCountries: string[];
  description: string;
  marketThesis: string;
}

export const NRE_EXPANSION_PHASES: PhaseDefinition[] = [
  {
    phase: 1,
    label: 'Phase 1 🇧🇩 BD Live + Global Framework',
    focusCountries: ['BD'],
    description: 'Pilot foundation in Bangladesh with BTRC, BB/BFIU, DNCRP, NBR and the universal multi-region NRE database schema.',
    marketThesis: 'ভিত্তি মজবুত — Complete working sovereign pilot.'
  },
  {
    phase: 2,
    label: 'Phase 2 🇦🇪 UAE + 🇳🇬 Nigeria',
    focusCountries: ['AE', 'NG'],
    description: 'High-enforcement demand regions with massive cross-border capital flows, supporting English and Arabic bilingual workflows.',
    marketThesis: 'টাকা আছে, enforcement demand আছে, English/Arabic.'
  },
  {
    phase: 3,
    label: 'Phase 3 🇮🇳 India + 🇰🇪 Kenya + 🇸🇦 Saudi Arabia',
    focusCountries: ['IN', 'KE', 'SA'],
    description: 'Massive volume multipliers across South Asia, East Africa, and the GCC (DPDP 2023, DPA 2019, PDPL Royal Decree M/19).',
    marketThesis: 'বিশাল market, India = multiplier.'
  },
  {
    phase: 4,
    label: 'Phase 4 🇺🇸 USA + 🇿🇦 South Africa',
    focusCountries: ['US', 'ZA'],
    description: 'Complex multi-agency federal/state legal landscape and sovereign African financial hubs (SEC/FTC/OFAC, POPIA/FSCA).',
    marketThesis: 'সবচেয়ে কঠিন legal landscape, তবে সবচেয়ে বড় brand value.'
  },
  {
    phase: 5,
    label: 'Phase 5 🌐 Global Skeletons & Dynamic Data Entry',
    focusCountries: ['SG', 'PK', 'QA', 'BH', 'EG', 'GH', 'RW', 'TZ', 'CA', 'BR', 'MX', 'ID', 'MY', 'TH', 'VN', 'PH', 'JP', 'KR', 'GB', 'DE', 'FR'],
    description: 'Universal skeleton definitions ready for non-engineer legal operations to populate laws and section penalties via the Country Pack Admin UI.',
    marketThesis: 'বাকি সব (skeleton → data entry) — Country Pack Admin UI দিয়ে non-engineer-ই ভরবে।'
  }
];

export const REGISTERED_COUNTRY_PACKS: Record<string, CountryPackManifest> = {
  BD: BANGLADESH_PACK,
  AE: UAE_PACK,
  NG: NIGERIA_PACK,
  IN: INDIA_PACK,
  SA: SAUDI_ARABIA_PACK,
  KE: KENYA_PACK,
  ZA: SOUTH_AFRICA_PACK,
  US: USA_PACK
};

export const GLOBAL_SKELETON_PACKS: Array<{
  countryCode: string;
  countryName: string;
  regionCode: 'asia' | 'middle_east' | 'africa' | 'americas' | 'europe';
  currencyCode: string;
  primaryLanguage: string;
  legalSystem: 'common_law' | 'civil_law' | 'sharia_based' | 'mixed';
  regulators: string[];
}> = [
  { countryCode: 'SG', countryName: 'Singapore', regionCode: 'asia', currencyCode: 'SGD', primaryLanguage: 'en', legalSystem: 'common_law', regulators: ['MAS', 'PDPC', 'ACRA'] },
  { countryCode: 'PK', countryName: 'Pakistan', regionCode: 'asia', currencyCode: 'PKR', primaryLanguage: 'ur', legalSystem: 'mixed', regulators: ['SBP', 'SECP', 'PTA', 'FBR'] },
  { countryCode: 'QA', countryName: 'Qatar', regionCode: 'middle_east', currencyCode: 'QAR', primaryLanguage: 'ar', legalSystem: 'mixed', regulators: ['QCB', 'QFCRA', 'NCSA'] },
  { countryCode: 'BH', countryName: 'Bahrain', regionCode: 'middle_east', currencyCode: 'BHD', primaryLanguage: 'ar', legalSystem: 'mixed', regulators: ['CBB', 'PDPLA'] },
  { countryCode: 'EG', countryName: 'Egypt', regionCode: 'middle_east', currencyCode: 'EGP', primaryLanguage: 'ar', legalSystem: 'civil_law', regulators: ['CBE', 'FRA', 'PDPL'] },
  { countryCode: 'GH', countryName: 'Ghana', regionCode: 'africa', currencyCode: 'GHS', primaryLanguage: 'en', legalSystem: 'common_law', regulators: ['BoG', 'SEC', 'DPC'] },
  { countryCode: 'RW', countryName: 'Rwanda', regionCode: 'africa', currencyCode: 'RWF', primaryLanguage: 'en', legalSystem: 'civil_law', regulators: ['BNR', 'NCSA'] },
  { countryCode: 'TZ', countryName: 'Tanzania', regionCode: 'africa', currencyCode: 'TZS', primaryLanguage: 'sw', legalSystem: 'common_law', regulators: ['BOT', 'TCRA', 'PDPC'] },
  { countryCode: 'CA', countryName: 'Canada', regionCode: 'americas', currencyCode: 'CAD', primaryLanguage: 'en', legalSystem: 'common_law', regulators: ['FINTRAC', 'OSC', 'OPC'] },
  { countryCode: 'BR', countryName: 'Brazil', regionCode: 'americas', currencyCode: 'BRL', primaryLanguage: 'pt', legalSystem: 'civil_law', regulators: ['BACEN', 'CVM', 'ANPD'] },
  { countryCode: 'MX', countryName: 'Mexico', regionCode: 'americas', currencyCode: 'MXN', primaryLanguage: 'es', legalSystem: 'civil_law', regulators: ['Banxico', 'CNBV', 'INAI'] },
  { countryCode: 'ID', countryName: 'Indonesia', regionCode: 'asia', currencyCode: 'IDR', primaryLanguage: 'id', legalSystem: 'civil_law', regulators: ['OJK', 'Kominfo', 'BPOM'] },
  { countryCode: 'MY', countryName: 'Malaysia', regionCode: 'asia', currencyCode: 'MYR', primaryLanguage: 'ms', legalSystem: 'common_law', regulators: ['BNM', 'SC', 'MCMC'] },
  { countryCode: 'TH', countryName: 'Thailand', regionCode: 'asia', currencyCode: 'THB', primaryLanguage: 'th', legalSystem: 'civil_law', regulators: ['BOT', 'SEC', 'PDPC'] },
  { countryCode: 'VN', countryName: 'Vietnam', regionCode: 'asia', currencyCode: 'VND', primaryLanguage: 'vi', legalSystem: 'civil_law', regulators: ['SBV', 'MIC'] },
  { countryCode: 'PH', countryName: 'Philippines', regionCode: 'asia', currencyCode: 'PHP', primaryLanguage: 'en', legalSystem: 'mixed', regulators: ['BSP', 'SEC', 'NPC'] },
  { countryCode: 'JP', countryName: 'Japan', regionCode: 'asia', currencyCode: 'JPY', primaryLanguage: 'ja', legalSystem: 'civil_law', regulators: ['FSA', 'PPC'] },
  { countryCode: 'KR', countryName: 'South Korea', regionCode: 'asia', currencyCode: 'KRW', primaryLanguage: 'ko', legalSystem: 'civil_law', regulators: ['FSC', 'PIPC'] },
  { countryCode: 'GB', countryName: 'United Kingdom', regionCode: 'europe', currencyCode: 'GBP', primaryLanguage: 'en', legalSystem: 'common_law', regulators: ['FCA', 'ICO', 'PRA'] },
  { countryCode: 'DE', countryName: 'Germany', regionCode: 'europe', currencyCode: 'EUR', primaryLanguage: 'de', legalSystem: 'civil_law', regulators: ['BaFin', 'BfDI', 'BSI'] },
  { countryCode: 'FR', countryName: 'France', regionCode: 'europe', currencyCode: 'EUR', primaryLanguage: 'fr', legalSystem: 'civil_law', regulators: ['AMF', 'CNIL', 'ACPR'] }
];

export function getCountryPack(countryCode: string): CountryPackManifest | null {
  const code = countryCode.toUpperCase();
  if (REGISTERED_COUNTRY_PACKS[code]) {
    return REGISTERED_COUNTRY_PACKS[code];
  }
  return null;
}

export function getAllCountryPacks(): CountryPackManifest[] {
  return Object.values(REGISTERED_COUNTRY_PACKS);
}
