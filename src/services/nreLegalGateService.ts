import { getDb } from '../db/sqlite';

export interface ScanAuthorizationCheck {
  allowed: boolean;
  gateType: 'standard' | 'mou_required' | 'restricted';
  reason: string;
  countryCode: string;
}

export interface JurisdictionResolution {
  primaryCountryCode: string;
  secondaryJurisdictions: string[];
  recommendedRegulatorCode: string;
  rationale: string;
  isCrossBorder: boolean;
}

export class NreLegalGateService {
  /**
   * HARD-BLOCKS any scan request that does not meet the country pack's statutory legal gate.
   */
  public static verifyScanLegalBasis(
    countryCode: string,
    targetUrl: string,
    legalBasisRef?: string
  ): ScanAuthorizationCheck {
    const db = getDb();
    const code = countryCode.toUpperCase();

    let gateType: 'standard' | 'mou_required' | 'restricted' = 'standard';

    if (db && typeof db.prepare === 'function') {
      try {
        const country = db.prepare('SELECT scanner_legal_gate, name FROM nre_countries WHERE code = ?').get(code) as any;
        if (country?.scanner_legal_gate) {
          gateType = country.scanner_legal_gate;
        }
      } catch (err) {
        console.warn('[LEGAL_GATE] DB lookup failed, defaulting to restricted:', err);
        gateType = 'restricted';
      }
    }

    if (gateType === 'standard') {
      return {
        allowed: true,
        gateType: 'standard',
        reason: 'Country configured for robots.txt-compliant public transparency scans.',
        countryCode: code
      };
    }

    if (gateType === 'mou_required') {
      if (!legalBasisRef || legalBasisRef.trim().length < 5) {
        return {
          allowed: false,
          gateType: 'mou_required',
          reason: `HARD-BLOCK: Target country (${code}) requires a valid statutory Memorandum of Understanding (MoU) or regulatory authorization reference. None provided.`,
          countryCode: code
        };
      }
      return {
        allowed: true,
        gateType: 'mou_required',
        reason: `Authorization approved under statutory legal basis reference: ${legalBasisRef}`,
        countryCode: code
      };
    }

    if (gateType === 'restricted') {
      if (!legalBasisRef || !legalBasisRef.startsWith('GOV-AUTH-')) {
        return {
          allowed: false,
          gateType: 'restricted',
          reason: `HARD-BLOCK: Sovereign Restricted Enclave (${code}). Scanning permitted only with signed governmental sovereign warrant starting with GOV-AUTH-*.`,
          countryCode: code
        };
      }
      return {
        allowed: true,
        gateType: 'restricted',
        reason: `Sovereign restricted clearance verified: ${legalBasisRef}`,
        countryCode: code
      };
    }

    return {
      allowed: false,
      gateType: 'restricted',
      reason: 'Unknown legal gate classification. Failsafe blocking scan.',
      countryCode: code
    };
  }

  /**
   * Resolves cross-border jurisdiction based on domain TLD, target market, and server location.
   */
  public static resolveJurisdiction(
    domain: string,
    targetMarketSignals: string[] = []
  ): JurisdictionResolution {
    const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
    const tld = cleanDomain.split('.').pop() || '';

    // Country TLD matching
    const tldMap: Record<string, { country: string; reg: string }> = {
      bd: { country: 'BD', reg: 'BTRC' },
      in: { country: 'IN', reg: 'DPDPA_BOARD' },
      ae: { country: 'AE', reg: 'UAE_DPO' },
      sa: { country: 'SA', reg: 'SDAIA' },
      ng: { country: 'NG', reg: 'NDPC' },
      ke: { country: 'KE', reg: 'ODPC' },
      za: { country: 'ZA', reg: 'INFO_REG' },
      us: { country: 'US', reg: 'FTC' },
      sg: { country: 'SG', reg: 'PDPC' }
    };

    if (tldMap[tld]) {
      return {
        primaryCountryCode: tldMap[tld].country,
        secondaryJurisdictions: targetMarketSignals.filter(c => c !== tldMap[tld].country),
        recommendedRegulatorCode: tldMap[tld].reg,
        rationale: `Direct top-level domain (.${tld}) statutory jurisdiction match.`,
        isCrossBorder: targetMarketSignals.length > 1
      };
    }

    // Default or multi-region resolution
    const primary = targetMarketSignals[0] || 'US';
    return {
      primaryCountryCode: primary,
      secondaryJurisdictions: targetMarketSignals.slice(1),
      recommendedRegulatorCode: primary === 'BD' ? 'BTRC' : primary === 'IN' ? 'DPDPA_BOARD' : 'FTC',
      rationale: `Generic domain (.${tld}) resolved via target market activity & consumer base.`,
      isCrossBorder: targetMarketSignals.length > 1
    };
  }
}
