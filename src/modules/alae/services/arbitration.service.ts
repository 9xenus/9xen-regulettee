import { getDb } from '../../../db/sqlite';

// Frontend-compatible types (AlaeArbitrationEngine.tsx)
interface FrontendConflict {
  issue: string;
  euLaw: string;
  nationalLaw: string;
  decision: string;
  risk: string;
}

interface FrontendPenalty {
  country: string;
  maxPenalty: string;
  strictness: string;
}

interface FrontendArbitrationResult {
  conflicts: FrontendConflict[];
  penalties: FrontendPenalty[];
  suggestedPolicy: string[];
}

const COUNTRY_NAMES: Record<string, string> = {
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  NL: 'Netherlands',
  IT: 'Italy',
  PL: 'Poland',
  SE: 'Sweden',
  AT: 'Austria',
  BE: 'Belgium',
  PT: 'Portugal',
  IE: 'Ireland',
};

const COUNTRY_DPA_NAMES: Record<string, string> = {
  DE: 'Germany (BfDI)',
  FR: 'France (CNIL)',
  ES: 'Spain (AEPD)',
  NL: 'Netherlands (Autoriteit Persoonsgegevens)',
  IT: 'Italy (Garante)',
  PL: 'Poland (UODO)',
};

const USE_CASE_ID_MAP: Record<string, string> = {
  'age': 'age_verification',
  'minor': 'age_verification',
  'consent': 'age_verification',
  'cookie': 'cookie_consent',
  'tracking': 'cookie_consent',
  'employee': 'employee_monitoring',
  'monitoring': 'employee_monitoring',
  'high-risk': 'high_risk_ai',
  'inference': 'high_risk_ai',
};

function resolveUseCaseId(text: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, id] of Object.entries(USE_CASE_ID_MAP)) {
    if (lower.includes(keyword)) return id;
  }
  return 'general';
}

export class ArbitrationService {
  async evaluate(request: { countryCode: string; useCaseId: string } | { country: string; useCase: string }): Promise<FrontendArbitrationResult> {
    const countryCode = ('countryCode' in request ? request.countryCode : request.country) || 'DE';
    const useCaseRaw = ('useCaseId' in request ? request.useCaseId : request.useCase) || 'general';
    const useCaseId = resolveUseCaseId(useCaseRaw);
    const countryName = COUNTRY_NAMES[countryCode] || countryCode;

    console.log(`[ALAE] Evaluating use case: ${useCaseId} (raw: ${useCaseRaw}) in ${countryCode}`);

    await new Promise(resolve => setTimeout(resolve, 800));

    const conflicts: FrontendConflict[] = [];
    const penalties: FrontendPenalty[] = [];
    const suggestedPolicy: string[] = [];

    // Country-specific conflicts (always present)
    if (countryCode === 'DE') {
      conflicts.push({
        issue: 'Data Retention & Employee Monitoring',
        euLaw: 'GDPR Proportionality',
        nationalLaw: 'Germany BDSG (Strict limitation)',
        decision: 'Enforce strict 90-day deletion and require works council approval for monitoring.',
        risk: 'Medium'
      });
      penalties.push({ country: COUNTRY_DPA_NAMES.DE || 'Germany (BfDI)', maxPenalty: '4% of global turnover', strictness: 'High' });
      suggestedPolicy.push('Updated Privacy Policy (DE locale) with BDSG specific disclosures.');
    } else if (countryCode === 'FR') {
      conflicts.push({
        issue: 'Data Retention & Employee Monitoring',
        euLaw: 'GDPR Proportionality',
        nationalLaw: 'France CNIL & Loi Informatique (Balanced retention)',
        decision: 'Enforce 120-day deletion with CNIL notification for large-scale monitoring.',
        risk: 'Medium'
      });
      penalties.push({ country: COUNTRY_DPA_NAMES.FR || 'France (CNIL)', maxPenalty: '5% of global turnover (local spec)', strictness: 'Critical' });
      suggestedPolicy.push('Auto-adjusted risk reserves for CNIL enforcement mechanisms.');
    } else {
      conflicts.push({
        issue: `Data Retention & Sovereign Regulation Variance`,
        euLaw: 'GDPR Proportionality (Art. 5(1)(e))',
        nationalLaw: `${countryName} Local DP Law Implementation Variations`,
        decision: `Apply ${countryName}-specific retention periods. Validate against national DPA guidance.`,
        risk: 'Medium'
      });
      penalties.push({
        country: COUNTRY_DPA_NAMES[countryCode] || `${countryName} Data Protection Authority`,
        maxPenalty: '€20M or 4% turnover',
        strictness: 'Medium'
      });
    }

    // Use-case-specific conflicts
    if (useCaseId === 'age_verification') {
      conflicts.push({
        issue: 'Age Verification Threshold',
        euLaw: 'GDPR Art. 8 (16 years default)',
        nationalLaw: `${countryName} Local DP Law Variations`,
        decision: 'Apply dynamic age threshold matching the strictest local requirement.',
        risk: 'High'
      });
      suggestedPolicy.push('Deploy dynamic age-gate UI component targeted by IP geolocation.');
    }

    if (useCaseId === 'cookie_consent') {
      conflicts.push({
        issue: 'Cookies & Symmetric Decline Opt-out',
        euLaw: 'ePrivacy Directive (Opt-in)',
        nationalLaw: countryCode === 'FR' ? 'CNIL Guidelines (Strict symmetric opt-out)' : `${countryName} Local ePrivacy Transposition`,
        decision: countryCode === 'FR'
          ? 'Implement equal-size "Reject All" button on first layer of cookie banner.'
          : 'Implement standard opt-in banner with detailed cookie settings.',
        risk: 'High'
      });
      suggestedPolicy.push('Adjust cookie banner config to show prominent Refuse option on first layer.');
    }

    if (useCaseId === 'employee_monitoring') {
      conflicts.push({
        issue: 'Employee Data & AI Performance Tracking',
        euLaw: 'GDPR Art 88 (Member State rules for employee data)',
        nationalLaw: countryCode === 'DE' ? 'Germany BDSG § 26 (Restricts profiling and covert monitoring)' : `${countryName} Employment Data Protection Directive`,
        decision: countryCode === 'DE'
          ? 'Halt AI-backed telemetry capturing developer metrics for German team members without explicit worker council signature.'
          : `Require explicit employee consent and works council consultation per ${countryName} employment law.`,
        risk: 'Critical'
      });
      suggestedPolicy.push(`Update ${countryName} employment handbook with explicit consent forms and data processing agreements.`);
    }

    if (useCaseId === 'high_risk_ai') {
      conflicts.push({
        issue: 'High-Risk AI System Registration & Conformity',
        euLaw: 'EU AI Act Art. 9 (Risk management system)',
        nationalLaw: `${countryName} National AI Competence Authority Requirements`,
        decision: 'Complete Annex III risk assessment. Register high-risk AI system with national supervisory authority before deployment.',
        risk: 'Critical'
      });
      suggestedPolicy.push('Register high-risk AI use case with national authority; maintain detailed technical documentation per Annex IV.');
    }

    if (useCaseId === 'general') {
      conflicts.push({
        issue: 'General Jurisdiction Ingestion',
        euLaw: 'GDPR Baseline compliance rules',
        nationalLaw: `Member State (${countryName}) localized interpretation`,
        decision: `No specific overrides detected. Comply with general EU GDPR obligations for ${countryName}.`,
        risk: 'Low'
      });
      suggestedPolicy.push(`Standardize ${countryName}-localized privacy policy templates.`);
    }

    if (suggestedPolicy.length === 0) {
      suggestedPolicy.push(`Deploy ${countryName}-specific compliance patches to production consent management platform.`);
    }

    return { conflicts, penalties, suggestedPolicy };
  }
}
