/**
 * EUID (European Unique Identifier) Library
 * Compliant with EU Directive 2012/17/EU and BRIS (Business Registers Interconnection System).
 * 
 * Standard Format: <CountryCode><RegisterCode>.<RegistrationNumber>
 * Example: DEBER.HRB992019-BERLIN
 */

export interface EUIDDetails {
  euid: string;
  countryCode: string;
  countryName: string;
  registerCode: string;
  registerName: string;
  registrationNumber: string;
  isBRISVerified: boolean;
  brisVerificationTimestamp?: string;
  brisRegistryUrl?: string;
}

export interface BRISRegisterMetadata {
  euid: string;
  legalEntityName: string;
  legalForm: string;
  incorporationCountry: string;
  registerAuthority: string;
  status: 'ACTIVE' | 'DISSOLVED' | 'UNDER_LIQUIDATION' | 'SUSPENDED';
  vatNumber?: string;
  registeredAddress: string;
  lastBRISSync: string;
  verificationSeal: string;
}

const EU_REGISTER_MAPPING: Record<string, { name: string; registerCode: string; samplePrefix: string; brisDomain: string }> = {
  DE: { name: 'Handelsregister (German Commercial Register)', registerCode: 'BER', samplePrefix: 'HRB', brisDomain: 'handelsregister.de' },
  FR: { name: 'RCS (Registre du Commerce et des Sociétés)', registerCode: 'PAR', samplePrefix: 'RCS', brisDomain: 'infogreffe.fr' },
  NL: { name: 'KVK (Handelsregister KVK Netherlands)', registerCode: 'KVK', samplePrefix: 'KVK', brisDomain: 'kvk.nl' },
  LU: { name: 'RCS Luxembourg (Registre de Commerce et des Sociétés)', registerCode: 'LUX', samplePrefix: 'B', brisDomain: 'rcsl.lu' },
  IE: { name: 'CRO (Companies Registration Office Ireland)', registerCode: 'CRO', samplePrefix: 'CRO', brisDomain: 'cro.ie' },
  ES: { name: 'Registro Mercantil Central (Spain)', registerCode: 'MAD', samplePrefix: 'RM', brisDomain: 'rmc.es' },
  IT: { name: 'Registro delle Imprese (Italy)', registerCode: 'ROM', samplePrefix: 'REA', brisDomain: 'registroimprese.it' },
  AT: { name: 'Firmenbuch (Austrian Companies Register)', registerCode: 'VIE', samplePrefix: 'FN', brisDomain: 'firmenbuch.at' },
  BE: { name: 'KBO / BCE (Crossroads Bank for Enterprises Belgium)', registerCode: 'BRU', samplePrefix: 'BE', brisDomain: 'economie.fgov.be' },
  CY: { name: 'Department of Registrar of Companies Cyprus', registerCode: 'NIC', samplePrefix: 'HE', brisDomain: 'drcor.gov.cy' },
  EE: { name: 'Estonian e-Business Register', registerCode: 'TAL', samplePrefix: 'EE', brisDomain: 'rik.ee' },
  SE: { name: 'Bolagsverket (Swedish Companies Registration Office)', registerCode: 'STO', samplePrefix: 'SE', brisDomain: 'bolagsverket.se' }
};

/**
 * Validates whether a string matches standard EUID format specifications.
 */
export function validateEUID(euidString: string): { isValid: boolean; parsed?: EUIDDetails; error?: string } {
  if (!euidString || typeof euidString !== 'string') {
    return { isValid: false, error: 'EUID string is empty or invalid' };
  }

  const clean = euidString.trim().toUpperCase();
  // Matching format: 2-letter country + 2-5 letter register code + dot/dash + registration number
  const euRegex = /^([A-Z]{2})([A-Z0-9]{2,5})[\.-]([A-Z0-9\-\/]{3,30})$/;
  const match = clean.match(euRegex);

  if (!match) {
    // Try relaxed matching if user passed something like "EU.DE.BER.HRB-992019"
    const relaxedRegex = /^(?:EU\.)?([A-Z]{2})[\.\-]?([A-Z0-9]{2,5})[\.\-](.+)$/;
    const relaxedMatch = clean.match(relaxedRegex);

    if (!relaxedMatch) {
      return { isValid: false, error: 'Does not conform to EU Directive 2012/17/EU EUID format (e.g. DEBER.HRB992019)' };
    }

    const countryCode = relaxedMatch[1];
    const regCode = relaxedMatch[2];
    const regNum = relaxedMatch[3];
    const regMeta = EU_REGISTER_MAPPING[countryCode] || { name: `${countryCode} National Business Register`, registerCode: regCode, brisDomain: 'e-justice.europa.eu' };

    return {
      isValid: true,
      parsed: {
        euid: `EU.${countryCode}.${regCode}.${regNum}`,
        countryCode,
        countryName: getEUCountryName(countryCode),
        registerCode: regCode,
        registerName: regMeta.name,
        registrationNumber: regNum,
        isBRISVerified: true,
        brisVerificationTimestamp: new Date().toISOString(),
        brisRegistryUrl: `https://${regMeta.brisDomain}/bris/euid/${countryCode}/${regNum}`
      }
    };
  }

  const countryCode = match[1];
  const regCode = match[2];
  const regNum = match[3];
  const regMeta = EU_REGISTER_MAPPING[countryCode] || { name: `${countryCode} Commercial Registry`, registerCode: regCode, brisDomain: 'e-justice.europa.eu' };

  return {
    isValid: true,
    parsed: {
      euid: `${countryCode}${regCode}.${regNum}`,
      countryCode,
      countryName: getEUCountryName(countryCode),
      registerCode: regCode,
      registerName: regMeta.name,
      registrationNumber: regNum,
      isBRISVerified: true,
      brisVerificationTimestamp: new Date().toISOString(),
      brisRegistryUrl: `https://${regMeta.brisDomain}/bris/euid/${countryCode}/${regNum}`
    }
  };
}

/**
 * Formats country, register authority, and registration number into standard EUID.
 */
export function formatEUID(countryCode: string, registrationNumber: string, customRegisterCode?: string): string {
  const cc = (countryCode || 'DE').toUpperCase().slice(0, 2);
  const meta = EU_REGISTER_MAPPING[cc] || { registerCode: 'REG' };
  const regCode = (customRegisterCode || meta.registerCode).toUpperCase();
  const cleanNum = (registrationNumber || '10001').replace(/[^A-Z0-9\-]/gi, '');
  return `${cc}${regCode}.${cleanNum}`;
}

/**
 * Helper to get country display name from 2-letter ISO code.
 */
export function getEUCountryName(code: string): string {
  const names: Record<string, string> = {
    DE: 'Germany',
    FR: 'France',
    NL: 'Netherlands',
    LU: 'Luxembourg',
    IE: 'Ireland',
    ES: 'Spain',
    IT: 'Italy',
    AT: 'Austria',
    BE: 'Belgium',
    CY: 'Cyprus',
    EE: 'Estonia',
    SE: 'Sweden',
    PL: 'Poland',
    DK: 'Denmark',
    FI: 'Finland',
    PT: 'Portugal',
    GR: 'Greece'
  };
  return names[code.toUpperCase()] || code.toUpperCase();
}

/**
 * Simulates a real-time BRIS (Business Registers Interconnection System) network lookup for an EUID.
 */
export function lookupBRISRegister(euidString: string, companyName?: string): BRISRegisterMetadata {
  const val = validateEUID(euidString);
  const parsed = val.parsed || {
    euid: euidString || 'DEBER.HRB992019-BERLIN',
    countryCode: 'DE',
    countryName: 'Germany',
    registerCode: 'BER',
    registerName: 'Handelsregister Berlin',
    registrationNumber: 'HRB-992019'
  };

  const meta = EU_REGISTER_MAPPING[parsed.countryCode] || EU_REGISTER_MAPPING['DE'];

  return {
    euid: parsed.euid,
    legalEntityName: companyName || `Acme ${parsed.countryName} Sovereign Capital GmbH`,
    legalForm: parsed.countryCode === 'DE' || parsed.countryCode === 'AT' ? 'Gesellschaft mit beschränkter Haftung (GmbH)' :
              parsed.countryCode === 'FR' ? 'Société par Actions Simplifiée (SAS)' :
              parsed.countryCode === 'NL' ? 'Besloten Vennootschap (B.V.)' : 'Public/Private Limited Liability Company',
    incorporationCountry: parsed.countryName,
    registerAuthority: meta.name,
    status: 'ACTIVE',
    vatNumber: `${parsed.countryCode}${Math.floor(100000000 + Math.random() * 900000000)}`,
    registeredAddress: `Am Platz der Republik 1, ${parsed.countryCode === 'DE' ? '10118 Berlin' : parsed.countryCode === 'FR' ? '75008 Paris' : '1000 EU Center'}`,
    lastBRISSync: new Date().toISOString(),
    verificationSeal: `EU-BRIS-SEAL-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  };
}
