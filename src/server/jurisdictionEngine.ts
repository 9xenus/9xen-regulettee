/**
 * SHARED CROSS-BORDER JURISDICTION ENGINE
 * ------------------------------------------------------------------
 * Single source of truth for regional + country compliance laws & acts.
 * Consumed by the regulator dashboard (national-scope enforcement),
 * the lawyer/consultant suite (law/act solution docketing) and the
 * client dashboards (auto-detected applicable acts + counsel solutions).
 */

// ---------------------------------------------------------------------------
// JURISDICTION KNOWLEDGE BASE — regional acts + country-specific laws & acts
// ---------------------------------------------------------------------------
export const REGION_ACTS: Record<string, { region: string; acts: string[] }> = {
  EU: { region: 'European Union', acts: ['GDPR', 'DSA', 'DMA', 'DORA', 'NIS2', 'EU_AI_ACT', 'CSRD', 'DGA', 'CLOUD_AND_DATA_ACT', 'ePRIVACY', 'PAYMENTS_2', 'WINDFALL_LEVY', 'CSDDD'] },
  UK: { region: 'United Kingdom', acts: ['UK_GDPR', 'DPA_2018', 'PECR', 'ONLINE_SAFETY_ACT', 'UK_AI_REG', 'NIS_SI_2018'] },
  US: { region: 'United States', acts: ['CCPA', 'CPRA', 'HIPAA', 'SOX', 'GLBA', 'NIST_CSF', 'CLOUD_ACT', 'FTC_ACT', 'CHILDREN_ONLINE_PRIVACY'] },
  BR: { region: 'Brazil / LATAM', acts: ['LGPD', 'BACEN_RES_2039', 'LG_BH_HACKING_PUNISHMENT'] },
  APAC: { region: 'Asia-Pacific', acts: ['PDPA_SG', 'PDPA_TH', 'DPDPA_IN', 'APPI_JP', 'PIPL_CN', 'NOTifiable_DATA_SG'] },
  MENA: { region: 'Middle East & North Africa', acts: ['UAE_PDPL', 'DIFC_DP Law', 'SA_PDPL', 'EG_PDP'] },
};

export const COUNTRY_ACTS: Record<string, { country: string; localLaw: string; acts: string[] }> = {
  DE: { country: 'Germany', localLaw: 'BDSG / TTDSG / TDDDG / KRITIS', acts: ['BDSG', 'TTDSG', 'TDDDG', 'KRITIS', 'BSI_GESTG', 'DGND'] },
  FR: { country: 'France', localLaw: 'CNIL / LCEN / ANSSI', acts: ['LCEN', 'CNIL_DELIB', 'RIAD', 'ANSSI_RGS'] },
  IE: { country: 'Ireland', localLaw: 'Data Protection Act 2018', acts: ['DPA_2018', 'SI_336_2011', 'IRISH_ECOMMERCE'] },
  NL: { country: 'Netherlands', localLaw: 'UAVG / Telecommunicatiewet', acts: ['UAVG', 'WIV', 'TELECOMWET', 'NEN_7510'] },
  ES: { country: 'Spain', localLaw: 'LOPDGDD / LSSI', acts: ['LOPDGDD', 'LSSI', 'ENS'] },
  IT: { country: 'Italy', localLaw: 'Codice Privacy / AGCOM', acts: ['CODICE_PRIVACY', 'AGCOM_REG', 'ACN_DELL'] },
  BE: { country: 'Belgium', localLaw: 'Wet van 30 July 2018', acts: ['BELGIAN_DPA', 'CBFA_CIRCULAR'] },
  AT: { country: 'Austria', localLaw: 'Datenschutzgesetz', acts: ['AT_DSG', 'TKG_2021'] },
  PT: { country: 'Portugal', localLaw: 'Lei 58/2019', acts: ['PT_LGPD_ADAPT', 'CIBER_SEGURANCA'] },
  PL: { country: 'Poland', localLaw: 'Ustawa o ochronie danych', acts: ['PL_DPA', 'TIDSE_USTAWA'] },
  SE: { country: 'Sweden', localLaw: 'Dataskyddslagen', acts: ['SE_DSL', 'PSL_ANNEX'] },
  CA: { country: 'Canada', localLaw: 'PIPEDA / Quebec Law 25', acts: ['PIPEDA', 'QUEBEC_25', 'SOX_CA'] },
  AU: { country: 'Australia', localLaw: 'Privacy Act 1988 / SOCI Act', acts: ['AU_PRIVACY', 'SOCI_ACT', 'AML_CTF_AU'] },
  SG: { country: 'Singapore', localLaw: 'PDPA 2012', acts: ['PDPA_SG', 'MAS_NOTICE_655', 'CSA_CCS'] },
  IN: { country: 'India', localLaw: 'DPDP Act 2023 / IT Act', acts: ['DPDP', 'IT_ACT_2000', 'RBI_Cyber'] },
  US: { country: 'United States', localLaw: 'CCPA / CPRA / HIPAA (federal + state)', acts: ['CCPA', 'CPRA', 'HIPAA', 'GLBA', 'SOX', 'NIST_CSF'] },
  BR: { country: 'Brazil', localLaw: 'LGPD', acts: ['LGPD', 'BACEN_2039'] },
  AE: { country: 'United Arab Emirates', localLaw: 'UAE Federal PDPL', acts: ['UAE_PDPL', 'DIFC_DP'] },
};

export const COUNTRY_BY_NAME: Record<string, string> = {
  germany: 'DE', france: 'FR', ireland: 'IE', netherlands: 'NL', spain: 'ES', italy: 'IT',
  belgium: 'BE', austria: 'AT', portugal: 'PT', poland: 'PL', sweden: 'SE', canada: 'CA',
  australia: 'AU', singapore: 'SG', india: 'IN', 'united states': 'US', brazil: 'BR',
  'united arab emirates': 'AE', 'all eu': 'EU', 'european union': 'EU', uk: 'GB', 'united kingdom': 'GB',
};

export const REGION_BY_NAME: Record<string, string> = {
  'european union': 'EU', eu: 'EU', europe: 'EU',
  'united kingdom': 'UK', uk: 'UK', gb: 'UK',
  'united states': 'US', usa: 'US',
  brazil: 'BR', 'latin america': 'BR',
  'asia-pacific': 'APAC', apac: 'APAC',
  'middle east': 'MENA', mena: 'MENA',
};

export const ENTITY_TYPES = ['NATIONAL_DPA', 'NATIONAL_CERT', 'CRITICAL_INFRA', 'FINANCIAL_NCA', 'TELECOM_NCA', 'HEALTH_NATIONAL', 'GOV_SOVEREIGN', 'CENTRAL_BANK'];
export const CLOUD_PROVIDERS = ['AWS', 'AZURE', 'GCP', 'ORACLE_CLOUD', 'IBM_CLOUD', 'HETZNER', 'OVH', 'ON_PREM'];

export const ALL_COUNTRIES = Object.values(COUNTRY_ACTS).map(c => c.country);
export const ALL_REGIONS = Object.values(REGION_ACTS).map(r => r.region);

export interface Jurisdiction {
  regulatorId: string;
  acronym: string;
  countryCode: string;
  countryName: string;
  region: string;
  localLaw: string;
  regionActs: string[];
  countryActs: string[];
  appliedActs: string[];
  scopeMode: 'NATIONAL_ONLY' | 'MULTI';
  detectedAt: string;
  source: string;
}

export function detectCountryCode(hint?: string, headerCountry?: string): string {
  const raw = String(headerCountry || hint || '').trim();
  if (!raw) return 'DE';
  if (raw.length === 2 && raw === raw.toUpperCase()) return raw;
  const name = raw.toLowerCase();
  return COUNTRY_BY_NAME[name] || REGION_BY_NAME[name] || 'DE';
}

export function regionFor(countryCode: string): string {
  if (countryCode === 'EU' || ['DE', 'FR', 'IE', 'NL', 'ES', 'IT', 'BE', 'AT', 'PT', 'PL', 'SE'].includes(countryCode)) return 'EU';
  if (['US', 'CA'].includes(countryCode)) return 'US';
  if (['BR'].includes(countryCode)) return 'BR';
  if (['SG', 'IN', 'AU', 'JP'].includes(countryCode)) return 'APAC';
  if (['AE', 'SA'].includes(countryCode)) return 'MENA';
  if (['GB'].includes(countryCode)) return 'UK';
  return 'EU';
}

export function buildJurisdiction(ownerId: string, acronym: string, countryCode: string, source = 'auto-detect'): Jurisdiction {
  const regionKey = regionFor(countryCode);
  const regionActs = REGION_ACTS[regionKey]?.acts || REGION_ACTS.EU.acts;
  const countryMeta = COUNTRY_ACTS[countryCode] || { country: countryCode, localLaw: 'GDPR (supranational default)', acts: [] };
  return {
    regulatorId: ownerId,
    acronym,
    countryCode,
    countryName: countryMeta.country,
    region: REGION_ACTS[regionKey]?.region || regionKey,
    localLaw: countryMeta.localLaw,
    regionActs: [...new Set(regionActs)],
    countryActs: [...new Set(countryMeta.acts)],
    appliedActs: [],
    scopeMode: 'NATIONAL_ONLY',
    detectedAt: new Date().toISOString(),
    source,
  };
}

// ---------------------------------------------------------------------------
// ACT EXPLANATION HANDBOOK — used by the solution engine to turn an act code
// into a client-ready compliance solution (obligations + implementation steps)
// ---------------------------------------------------------------------------
export const ACT_HANDBOOK: Record<string, { title: string; obligations: string[]; steps: string[] }> = {
  GDPR: { title: 'General Data Protection Regulation', obligations: ['Data minimization', 'Lawful processing basis', 'DSAR handling under Art.15-22', 'DPIA for high-risk processing'], steps: ['Map PII inventory and flows', 'Deploy consent + DSAR automation', 'Issue privacy notices per processing activity', 'Schedule biannual DPIA refresh'] },
  EU_AI_ACT: { title: 'EU AI Act', obligations: ['High-risk registration (Art.51)', 'Transparency obligations (Art.50)', 'Bias & robustness monitoring', 'Post-market surveillance'], steps: ['Classify models by risk tier', 'Generate model card with provenance watermark', 'Instrument logging for high-risk decisioning', 'Register high-risk systems with market authority'] },
  DSA: { title: 'Digital Services Act', obligations: ['Systemic risk assessment', 'Transparency reporting', 'Notice-and-action mechanics', 'VLOP compliance obligations'], steps: ['Publish transparency reports quarterly', 'Deploy notice-and-action intake', 'Audit recommender-system parameters', 'Stand up VLOP risk assessment file'] },
  DMA: { title: 'Digital Markets Act', obligations: ['Gatekeeper designation compliance', 'Fair-ranking & interoperability', 'No self-preferencing', 'Data access for business users'], steps: ['Asses gatekeeper thresholds', 'Open business-user data access endpoints', 'Audit ranking fairness', 'Stand up compliance function'] },
  DORA: { title: 'Digital Operational Resilience Act', obligations: ['ICT risk management', 'Incident reporting (IMT)', 'Digital operational resilience testing', 'Third-party ICT risk'], steps: ['Map critical ICT dependencies', 'Deploy ICT incident classification + 24h major-incident reporting', 'Run annual resilience testing', 'Audit third-party ICT contractual clauses'] },
  NIS2: { title: 'Network & Information Security Directive 2', obligations: ['Essential/important entity registration', 'Risk-management measures', 'Supply-chain security', 'Incident notification to CSIRT'], steps: ['Confirm entity classification', 'Deploy SOC + SIEM telemetry', 'Implement 24h early-warning notices', 'Sign sub-processor security addenda'] },
  CSRD: { title: 'Corporate Sustainability Reporting Directive', obligations: ['ESRS-aligned reporting', 'Double materiality assessment', 'External assurance'], steps: ['Run double-materiality assessment', 'Collect ESG datapoints per ESRS', 'Publish management-report annex', 'Engage independent assurance provider'] },
  CCPA: { title: 'California Consumer Privacy Act', obligations: ['Opt-out of sale/sharing', 'Right to delete', 'Privacy notice updates', 'Service-provider contracts'], steps: ['Serve opt-out toggle on every page', 'Instrument deletion request pipeline', 'Amend agreements with processor terms', 'Run annual CCPA data inventory'] },
  LGPD: { title: 'Brazilian LGPD', obligations: ['Legal basis documentation (Art.7)', 'DPO appointment', 'Data-subject requests', 'Incident notification to ANPD'], steps: ['Appoint DPO and publish register', 'Instrument rights-request workflows', 'Update legal-basis records', 'Build ANPD incident notification runbook'] },
  DPDP: { title: 'India DPDP Act 2023', obligations: ['Consent manager compliance', 'Fiduciary obligations', 'Breach reporting to DPB', 'Children data verifiable consent'], steps: ['Define consent-management flows', 'Document purpose limitation', 'Deploy breach reporting workflow', 'Add parental-consent verification'] },
  PIPEDA: { title: 'Canada PIPEDA / Quebec Law 25', obligations: ['Meaningful consent', 'Privacy-by-default', 'Cross-border transfer safeguards', 'Privacy program accountability'], steps: ['Refresh consent language', 'Conduct PIAs on new processing', 'Bind transfer agreements', 'Appoint privacy officer'] },
  UK_GDPR: { title: 'UK GDPR + Data Protection Act 2018', obligations: ['Substantive GDPR obligations in UK', 'ICO accountability', 'Transfer safeguards for US/global flows'], steps: ['Mirror UK processing register', 'Align with ICO SAFA expectations', 'Refresh SCCs for UK outgoing transfers', 'Maintain DPO liaison channel'] },
};

export function actMeta(code: string): { title: string; obligations: string[]; steps: string[] } {
  return ACT_HANDBOOK[code] || { title: code.replace(/_/g, ' '), obligations: ['Maintain compliant processing records', 'Respond to authority inquiries promptly', 'Keep audit evidence tree sealed'], steps: ['Retain evidence vault anchors', 'Review applicable code provisions quarterly', 'Engage counsel on enforcement posture'] };
}

export function resolveForCountry(country: string, industry?: string): Jurisdiction & { applicableActs: string[]; industryIntensity: Record<string, string> } {
  const j = buildJurisdiction('shared', 'XBX', detectCountryCode(country), 'platform-shared-engine');
  const industryMap: Record<string, string[]> = {
    fintech: ['DORA', 'PAYMENTS_2'], health: ['HIPAA', 'CSRD_SECTOR'], ai: ['EU_AI_ACT', 'DIGITAL_SERVICES'], telco: ['NIS2', 'ePRIVACY'], cloud: ['CLOUD_AND_DATA_ACT', 'NIS2'], ecommerce: ['DSA', 'ePRIVACY'], gaming: ['DSA', 'CHILDREN_ONLINE_PRIVACY'],
  };
  void industryMap;
  const applicableActs = [...new Set([...j.regionActs, ...j.countryActs])];
  const industryIntensity: Record<string, string> = {};
  (industryMap[String(industry || '').toLowerCase()] || []).forEach(code => { industryIntensity[code] = 'HEIGHTENED'; });
  return { ...j, applicableActs, industryIntensity };
}