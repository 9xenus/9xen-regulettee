import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  ArrowLeftRight, 
  ShieldAlert, 
  Globe, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Download, 
  Search, 
  Filter, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Building2, 
  Lock, 
  Zap, 
  ChevronDown, 
  Printer,
  Copy,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

export interface JurisdictionProfile {
  id: string;
  code: string;
  name: string;
  region: 'EU' | 'AMERICAS' | 'APAC' | 'MIDDLE_EAST' | 'AFRICA' | 'UK';
  regionDisplayName: string;
  flag: string;
  statuteTitle: string;
  shortCode: string;
  effectiveYear: number;
  regulatorName: string;
  enforcementVelocityScore: number; // 1-10
  auditRigorLevel: 'EXTREME' | 'HIGH' | 'MODERATE' | 'STRICT';
  
  // Financial Fines & Penalties
  maxStatutoryFineFormatted: string;
  maxTurnoverPercentage: string;
  baseCurrency: string;
  estimatedMaxFineEur: number;
  penaltyModelType: 'Turnover % or Fixed Cap' | 'Per Violation Statutory' | 'Fixed Statutory Cap' | 'Criminal Prosecution + Fine' | 'Turnover % or Fixed Cap + Daily';
  fineTiers: Array<{
    tier: string;
    description: string;
    penalty: string;
  }>;

  // Incident & SLA
  breachNotificationSla: string;
  breachRegulatorSlaHours: number; // in hours for numeric sorting
  affectedSubjectThreshold: string;

  // Compliance Mandates
  dataResidencyMandate: 'STRICT_LOCAL' | 'CONDITIONAL_TRANSFER' | 'ADEQUACY_BASED' | 'OPEN_WITH_NOTICE';
  dataResidencyDescription: string;
  mandatoryDpoRequirement: 'MANDATORY_ALWAYS' | 'RISK_BASED' | 'RECOMMENDED' | 'NOT_EXPLICIT';
  mandatoryDpiaRequirement: 'MANDATORY_HIGH_RISK' | 'ALWAYS' | 'RECOMMENDED';
  consentModel: 'EXPLICIT_OPT_IN' | 'OPT_OUT_SALE_SHARE' | 'CONSENT_FIDUCIARY' | 'LEGITIMATE_INTEREST_HYBRID';

  // Security & AI Requirements
  encryptionMandate: 'MANDATORY_REST_AND_TRANSIT' | 'RECOMMENDED_STATE_OF_ART' | 'RISK_BASED';
  aiAlgorithmicGuardrails: 'STRICT_HIGH_RISK_BAN' | 'TRANSPARENCY_REQUIRED' | 'IMPACT_ASSESSMENT_ONLY' | 'EMERGING_GUIDELINES';
  recordOfProcessing: 'MANDATORY_FULL' | 'MANDATORY_LARGE_ENTITIES' | 'VOLUNTARY';
}

export const JURISDICTION_PROFILES: JurisdictionProfile[] = [
  {
    id: 'EU_GDPR',
    code: 'EU',
    name: 'European Union (EU GDPR & EU AI Act)',
    region: 'EU',
    regionDisplayName: 'European Union',
    flag: '🇪🇺',
    statuteTitle: 'General Data Protection Regulation (EU 2016/679) & AI Act',
    shortCode: 'EU GDPR',
    effectiveYear: 2018,
    regulatorName: 'EDPB / National DPAs (e.g. CNIL, DSK, DPC)',
    enforcementVelocityScore: 9.8,
    auditRigorLevel: 'EXTREME',
    maxStatutoryFineFormatted: '€20,000,000 or 4% of Global Annual Turnover',
    maxTurnoverPercentage: '4.0%',
    baseCurrency: 'EUR',
    estimatedMaxFineEur: 20000000,
    penaltyModelType: 'Turnover % or Fixed Cap',
    fineTiers: [
      { tier: 'Tier 1 (Art 83.4)', description: 'Technical/organizational security failures, controller obligations', penalty: '€10,000,000 or 2% turnover' },
      { tier: 'Tier 2 (Art 83.5)', description: 'Breach of basic principles, data subject rights, unlawful international transfers', penalty: '€20,000,000 or 4% turnover' }
    ],
    breachNotificationSla: 'Within 72 Hours to Regulator; Without Undue Delay to Data Subjects',
    breachRegulatorSlaHours: 72,
    affectedSubjectThreshold: 'Any breach resulting in risk to rights and freedoms of natural persons',
    dataResidencyMandate: 'ADEQUACY_BASED',
    dataResidencyDescription: 'Transfers outside EEA restricted unless Adequacy Decision, Standard Contractual Clauses (SCCs), or BCRs are active.',
    mandatoryDpoRequirement: 'MANDATORY_ALWAYS',
    mandatoryDpiaRequirement: 'MANDATORY_HIGH_RISK',
    consentModel: 'EXPLICIT_OPT_IN',
    encryptionMandate: 'MANDATORY_REST_AND_TRANSIT',
    aiAlgorithmicGuardrails: 'STRICT_HIGH_RISK_BAN',
    recordOfProcessing: 'MANDATORY_FULL'
  },
  {
    id: 'USA_CCPA',
    code: 'USA_CA',
    name: 'United States (California CCPA / CPRA)',
    region: 'AMERICAS',
    regionDisplayName: 'United States (California)',
    flag: '🇺🇸',
    statuteTitle: 'California Consumer Privacy Act & CPRA (Cal. Civ. Code § 1798)',
    shortCode: 'CCPA / CPRA',
    effectiveYear: 2023,
    regulatorName: 'California Privacy Protection Agency (CPPA)',
    enforcementVelocityScore: 8.5,
    auditRigorLevel: 'HIGH',
    maxStatutoryFineFormatted: '$7,500 per intentional violation / $2,500 per unintentional violation',
    maxTurnoverPercentage: 'N/A (Statutory Per-Violation)',
    baseCurrency: 'USD',
    estimatedMaxFineEur: 7000000,
    penaltyModelType: 'Per Violation Statutory',
    fineTiers: [
      { tier: 'Unintentional Non-Compliance', description: 'Statutory civil penalty per affected record', penalty: '$2,500 per violation' },
      { tier: 'Intentional / Minor Data Breach', description: 'Willful violation or minor breach concerning SPI', penalty: '$7,500 per violation' }
    ],
    breachNotificationSla: 'Most Expedient Time Possible (Within 30-45 Days depending on state statute)',
    breachRegulatorSlaHours: 720,
    affectedSubjectThreshold: '500+ California residents requires AG/CPPA notification',
    dataResidencyMandate: 'OPEN_WITH_NOTICE',
    dataResidencyDescription: 'No strict local data residency required, but explicit opt-out links ("Do Not Sell/Share") mandatory.',
    mandatoryDpoRequirement: 'RECOMMENDED',
    mandatoryDpiaRequirement: 'MANDATORY_HIGH_RISK',
    consentModel: 'OPT_OUT_SALE_SHARE',
    encryptionMandate: 'RECOMMENDED_STATE_OF_ART',
    aiAlgorithmicGuardrails: 'TRANSPARENCY_REQUIRED',
    recordOfProcessing: 'MANDATORY_LARGE_ENTITIES'
  },
  {
    id: 'SA_PDPL',
    code: 'SA',
    name: 'Saudi Arabia (KSA PDPL 2023)',
    region: 'MIDDLE_EAST',
    regionDisplayName: 'Middle East (Saudi Arabia)',
    flag: '🇸🇦',
    statuteTitle: 'Saudi Personal Data Protection Law (PDPL Royal Decree No. M/19)',
    shortCode: 'Saudi PDPL',
    effectiveYear: 2023,
    regulatorName: 'Saudi Data & AI Authority (SDAIA / NDMO)',
    enforcementVelocityScore: 9.1,
    auditRigorLevel: 'EXTREME',
    maxStatutoryFineFormatted: '5,000,000 SAR (~€1,250,000) per offense; Doubles for repeat',
    maxTurnoverPercentage: 'N/A (Capped Statutory + Imprisonment)',
    baseCurrency: 'SAR',
    estimatedMaxFineEur: 1250000,
    penaltyModelType: 'Criminal Prosecution + Fine',
    fineTiers: [
      { tier: 'Standard Administrative Offense', description: 'Failure to register or comply with security standards', penalty: 'Up to 5,000,000 SAR' },
      { tier: 'Unlawful Sensitive Data Transfer', description: 'Disclosing sensitive data violating national sovereignty', penalty: 'Up to 3,000,000 SAR + 2 Years Jail' }
    ],
    breachNotificationSla: 'Within 72 Hours to SDAIA; Immediate to subjects if high risk',
    breachRegulatorSlaHours: 72,
    affectedSubjectThreshold: 'Breaches causing harm or involving sensitive financial/health data',
    dataResidencyMandate: 'STRICT_LOCAL',
    dataResidencyDescription: 'Strict local storage required. Cross-border transfers require SDAIA adequacy/approval or executive exception.',
    mandatoryDpoRequirement: 'MANDATORY_ALWAYS',
    mandatoryDpiaRequirement: 'MANDATORY_HIGH_RISK',
    consentModel: 'EXPLICIT_OPT_IN',
    encryptionMandate: 'MANDATORY_REST_AND_TRANSIT',
    aiAlgorithmicGuardrails: 'IMPACT_ASSESSMENT_ONLY',
    recordOfProcessing: 'MANDATORY_FULL'
  },
  {
    id: 'IN_DPDP',
    code: 'IN',
    name: 'India (Digital Personal Data Protection Act 2023)',
    region: 'APAC',
    regionDisplayName: 'Asia (India)',
    flag: '🇮🇳',
    statuteTitle: 'India Digital Personal Data Protection Act (DPDP Act 2023)',
    shortCode: 'India DPDP',
    effectiveYear: 2023,
    regulatorName: 'Data Protection Board of India (DPBI) / CERT-In',
    enforcementVelocityScore: 9.0,
    auditRigorLevel: 'HIGH',
    maxStatutoryFineFormatted: 'Up to ₹250 Crore (~€28,000,000) per breach instance',
    maxTurnoverPercentage: 'N/A (Fixed High Statutory Cap)',
    baseCurrency: 'INR',
    estimatedMaxFineEur: 28000000,
    penaltyModelType: 'Fixed Statutory Cap',
    fineTiers: [
      { tier: 'Failure to Observe Safeguards', description: 'Failure to prevent personal data breach', penalty: 'Up to ₹250 Crore' },
      { tier: 'Children Data Violations', description: 'Failure to obtain verifiable parental consent', penalty: 'Up to ₹200 Crore' }
    ],
    breachNotificationSla: 'CERT-In: Within 6 Hours; DPBI: Without Undue Delay',
    breachRegulatorSlaHours: 6,
    affectedSubjectThreshold: 'All security incidents affecting Indian digital infrastructure or users',
    dataResidencyMandate: 'CONDITIONAL_TRANSFER',
    dataResidencyDescription: 'Transfers permitted unless specifically restricted by Central Government blacklisted countries.',
    mandatoryDpoRequirement: 'RISK_BASED',
    mandatoryDpiaRequirement: 'MANDATORY_HIGH_RISK',
    consentModel: 'CONSENT_FIDUCIARY',
    encryptionMandate: 'MANDATORY_REST_AND_TRANSIT',
    aiAlgorithmicGuardrails: 'TRANSPARENCY_REQUIRED',
    recordOfProcessing: 'MANDATORY_LARGE_ENTITIES'
  },
  {
    id: 'BD_CSA',
    code: 'BD',
    name: 'Global Region (Cyber Security Act 2023 & CII Framework)',
    region: 'APAC',
    regionDisplayName: 'Asia (Global Region)',
    flag: '🇧🇩',
    statuteTitle: 'Global Region Cyber Security Act 2023 & Personal Data Protection Ordinance',
    shortCode: 'BD CSA 2023',
    effectiveYear: 2023,
    regulatorName: 'National Cyber Security Agency (NCSA) / Telecom Regulatory Authority',
    enforcementVelocityScore: 8.8,
    auditRigorLevel: 'HIGH',
    maxStatutoryFineFormatted: 'Up to USD 25,000,000 (~€210,000) + Up to 10 Years Imprisonment',
    maxTurnoverPercentage: 'N/A (Criminal Offense + Fine)',
    baseCurrency: 'USD',
    estimatedMaxFineEur: 210000,
    penaltyModelType: 'Criminal Prosecution + Fine',
    fineTiers: [
      { tier: 'Critical Information Infrastructure Breach', description: 'Unauthorized access or leak of CII systems', penalty: 'USD 25,000,000 + 10 Yrs Jail' },
      { tier: 'Unauthorized Digital Identity Misuse', description: 'Illegal extraction of identity or biometric records', penalty: 'USD 10,000,000 + 5 Yrs Jail' }
    ],
    breachNotificationSla: 'Within 24 Hours to NCSA & Telecom Regulatory Authority Incident Response Team',
    breachRegulatorSlaHours: 24,
    affectedSubjectThreshold: 'Breaches affecting banking, telecom, or government CII networks',
    dataResidencyMandate: 'STRICT_LOCAL',
    dataResidencyDescription: 'Critical Information Infrastructure (CII) data must reside in sovereign Global Region data centers.',
    mandatoryDpoRequirement: 'MANDATORY_ALWAYS',
    mandatoryDpiaRequirement: 'ALWAYS',
    consentModel: 'EXPLICIT_OPT_IN',
    encryptionMandate: 'MANDATORY_REST_AND_TRANSIT',
    aiAlgorithmicGuardrails: 'IMPACT_ASSESSMENT_ONLY',
    recordOfProcessing: 'MANDATORY_FULL'
  },
  {
    id: 'UK_GDPR',
    code: 'UK',
    name: 'United Kingdom (UK GDPR & DPA 2018)',
    region: 'UK',
    regionDisplayName: 'United Kingdom',
    flag: '🇬🇧',
    statuteTitle: 'UK General Data Protection Regulation & Data Protection Act 2018',
    shortCode: 'UK GDPR',
    effectiveYear: 2021,
    regulatorName: 'Information Commissioner\'s Office (ICO)',
    enforcementVelocityScore: 9.5,
    auditRigorLevel: 'EXTREME',
    maxStatutoryFineFormatted: '£17,500,000 or 4% of Global Annual Turnover',
    maxTurnoverPercentage: '4.0%',
    baseCurrency: 'GBP',
    estimatedMaxFineEur: 20500000,
    penaltyModelType: 'Turnover % or Fixed Cap',
    fineTiers: [
      { tier: 'Standard Maximum', description: 'Higher maximum penalty for core principles infringement', penalty: '£17,500,000 or 4% turnover' }
    ],
    breachNotificationSla: 'Within 72 Hours to ICO; Without Undue Delay to Subjects',
    breachRegulatorSlaHours: 72,
    affectedSubjectThreshold: 'Breach presenting risk to natural persons rights and freedoms',
    dataResidencyMandate: 'ADEQUACY_BASED',
    dataResidencyDescription: 'UK adequacy decisions or International Data Transfer Agreements (IDTA) required for overseas transfers.',
    mandatoryDpoRequirement: 'MANDATORY_ALWAYS',
    mandatoryDpiaRequirement: 'MANDATORY_HIGH_RISK',
    consentModel: 'EXPLICIT_OPT_IN',
    encryptionMandate: 'MANDATORY_REST_AND_TRANSIT',
    aiAlgorithmicGuardrails: 'TRANSPARENCY_REQUIRED',
    recordOfProcessing: 'MANDATORY_FULL'
  },
  {
    id: 'AU_PRIVACY',
    code: 'AU',
    name: 'Australia (Privacy Act 1988 & 2022 Amendment)',
    region: 'APAC',
    regionDisplayName: 'Australia & NZ',
    flag: '🇦🇺',
    statuteTitle: 'Australian Privacy Act 1988 & Privacy Legislation Amendment 2022',
    shortCode: 'AU Privacy Act',
    effectiveYear: 2022,
    regulatorName: 'Office of the Australian Information Commissioner (OAIC)',
    enforcementVelocityScore: 9.2,
    auditRigorLevel: 'HIGH',
    maxStatutoryFineFormatted: 'AU$50,000,000 or 30% of Adjusted Turnover',
    maxTurnoverPercentage: '30.0%',
    baseCurrency: 'AUD',
    estimatedMaxFineEur: 30000000,
    penaltyModelType: 'Turnover % or Fixed Cap',
    fineTiers: [
      { tier: 'Serious / Repeated Breach', description: 'Penalty for severe or systemic privacy failures', penalty: 'AU$50,000,000 or 30% turnover' }
    ],
    breachNotificationSla: 'As soon as practicable (Notifiable Data Breaches scheme)',
    breachRegulatorSlaHours: 72,
    affectedSubjectThreshold: 'Breaches likely to result in serious harm to individuals',
    dataResidencyMandate: 'CONDITIONAL_TRANSFER',
    dataResidencyDescription: 'APP 8 requires entities to take reasonable steps to ensure overseas recipient complies with APPs.',
    mandatoryDpoRequirement: 'RECOMMENDED',
    mandatoryDpiaRequirement: 'MANDATORY_HIGH_RISK',
    consentModel: 'EXPLICIT_OPT_IN',
    encryptionMandate: 'MANDATORY_REST_AND_TRANSIT',
    aiAlgorithmicGuardrails: 'EMERGING_GUIDELINES',
    recordOfProcessing: 'MANDATORY_LARGE_ENTITIES'
  },
  {
    id: 'SG_PDPA',
    code: 'SG',
    name: 'Singapore (PDPA 2012 / 2020 Amendment)',
    region: 'APAC',
    regionDisplayName: 'Asia Pacific (Singapore)',
    flag: '🇸🇬',
    statuteTitle: 'Singapore Personal Data Protection Act 2012 & 2020 Amendment',
    shortCode: 'SG PDPA',
    effectiveYear: 2022,
    regulatorName: 'Personal Data Protection Commission (PDPC)',
    enforcementVelocityScore: 9.0,
    auditRigorLevel: 'HIGH',
    maxStatutoryFineFormatted: 'S$1,000,000 or 10% of Annual Singapore Turnover',
    maxTurnoverPercentage: '10.0%',
    baseCurrency: 'SGD',
    estimatedMaxFineEur: 700000,
    penaltyModelType: 'Turnover % or Fixed Cap',
    fineTiers: [
      { tier: 'Financial Penalty Cap', description: 'Direct fine levied by PDPC for data security or breach failures', penalty: 'S$1,000,000 or 10% turnover' }
    ],
    breachNotificationSla: 'Within 3 Calendar Days (72 Hours) to PDPC',
    breachRegulatorSlaHours: 72,
    affectedSubjectThreshold: '500+ individuals or significant harm potential',
    dataResidencyMandate: 'CONDITIONAL_TRANSFER',
    dataResidencyDescription: 'Transfers allowed if recipient bound by legally enforceable obligations offering comparable standard.',
    mandatoryDpoRequirement: 'MANDATORY_ALWAYS',
    mandatoryDpiaRequirement: 'MANDATORY_HIGH_RISK',
    consentModel: 'EXPLICIT_OPT_IN',
    encryptionMandate: 'MANDATORY_REST_AND_TRANSIT',
    aiAlgorithmicGuardrails: 'TRANSPARENCY_REQUIRED',
    recordOfProcessing: 'MANDATORY_FULL'
  },
  {
    id: 'UAE_PDPL',
    code: 'UAE',
    name: 'United Arab Emirates (UAE PDPL Federal Law 45)',
    region: 'MIDDLE_EAST',
    regionDisplayName: 'Middle East (UAE)',
    flag: '🇦🇪',
    statuteTitle: 'UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection',
    shortCode: 'UAE PDPL',
    effectiveYear: 2022,
    regulatorName: 'UAE Data Office',
    enforcementVelocityScore: 8.7,
    auditRigorLevel: 'HIGH',
    maxStatutoryFineFormatted: 'Administrative fines as determined by UAE Cabinet Decision',
    maxTurnoverPercentage: 'Cabinet Discretion',
    baseCurrency: 'AED',
    estimatedMaxFineEur: 1000000,
    penaltyModelType: 'Fixed Statutory Cap',
    fineTiers: [
      { tier: 'Administrative Non-Compliance', description: 'Fine determined by UAE Data Office', penalty: 'Up to 500,000+ AED per incident' }
    ],
    breachNotificationSla: 'Immediately to UAE Data Office upon becoming aware',
    breachRegulatorSlaHours: 24,
    affectedSubjectThreshold: 'Any breach compromising confidentiality or subject privacy',
    dataResidencyMandate: 'CONDITIONAL_TRANSFER',
    dataResidencyDescription: 'Cross-border transfer permitted to countries with adequate protection or via approved contract controls.',
    mandatoryDpoRequirement: 'RISK_BASED',
    mandatoryDpiaRequirement: 'MANDATORY_HIGH_RISK',
    consentModel: 'EXPLICIT_OPT_IN',
    encryptionMandate: 'MANDATORY_REST_AND_TRANSIT',
    aiAlgorithmicGuardrails: 'EMERGING_GUIDELINES',
    recordOfProcessing: 'MANDATORY_FULL'
  },
  {
    id: 'ZA_POPIA',
    code: 'ZA',
    name: 'South Africa (POPIA Act 4 of 2013)',
    region: 'AFRICA',
    regionDisplayName: 'Africa (South Africa)',
    flag: '🇿🇦',
    statuteTitle: 'Protection of Personal Information Act (POPIA 2013)',
    shortCode: 'ZA POPIA',
    effectiveYear: 2021,
    regulatorName: 'Information Regulator South Africa',
    enforcementVelocityScore: 8.6,
    auditRigorLevel: 'HIGH',
    maxStatutoryFineFormatted: 'R10,000,000 (~€500,000) or 10 Years Imprisonment',
    maxTurnoverPercentage: 'N/A (Fixed Fine + Imprisonment)',
    baseCurrency: 'ZAR',
    estimatedMaxFineEur: 500000,
    penaltyModelType: 'Criminal Prosecution + Fine',
    fineTiers: [
      { tier: 'Administrative Civil Fine', description: 'Direct civil penalty levied by Information Regulator', penalty: 'R10,000,000' }
    ],
    breachNotificationSla: 'As soon as reasonably possible after discovery',
    breachRegulatorSlaHours: 48,
    affectedSubjectThreshold: 'Reasonable grounds to believe personal information has been accessed by unauthorized person',
    dataResidencyMandate: 'CONDITIONAL_TRANSFER',
    dataResidencyDescription: 'Transfers permitted if recipient is subject to law/agreement providing adequate protection level.',
    mandatoryDpoRequirement: 'MANDATORY_ALWAYS',
    mandatoryDpiaRequirement: 'MANDATORY_HIGH_RISK',
    consentModel: 'EXPLICIT_OPT_IN',
    encryptionMandate: 'MANDATORY_REST_AND_TRANSIT',
    aiAlgorithmicGuardrails: 'EMERGING_GUIDELINES',
    recordOfProcessing: 'MANDATORY_FULL'
  },
  {
    id: 'BR_LGPD',
    code: 'BR',
    name: 'Brazil (LGPD Lei Geral de Proteção de Dados)',
    region: 'AMERICAS',
    regionDisplayName: 'Latin America (Brazil)',
    flag: '🇧🇷',
    statuteTitle: 'Brazil Law 13.709/2018 (Lei Geral de Proteção de Dados)',
    shortCode: 'Brazil LGPD',
    effectiveYear: 2020,
    regulatorName: 'Autoridade Nacional de Proteção de Dados (ANPD)',
    enforcementVelocityScore: 8.9,
    auditRigorLevel: 'HIGH',
    maxStatutoryFineFormatted: '2% of Brazil Revenue up to R$50,000,000 (~€9,000,000) per violation',
    maxTurnoverPercentage: '2.0%',
    baseCurrency: 'BRL',
    estimatedMaxFineEur: 9000000,
    penaltyModelType: 'Turnover % or Fixed Cap + Daily',
    fineTiers: [
      { tier: 'Simple Fine Cap', description: 'Fine per violation capped at R$50M', penalty: '2% of revenue up to R$50,000,000' },
      { tier: 'Daily Compounding Fine', description: 'Daily sanction to compel compliance', penalty: 'Up to R$50M cumulative cap' }
    ],
    breachNotificationSla: 'Reasonable time frame (ANPD guidance defines 2 business days)',
    breachRegulatorSlaHours: 48,
    affectedSubjectThreshold: 'Incidents causing relevant risk or damage to data subjects',
    dataResidencyMandate: 'CONDITIONAL_TRANSFER',
    dataResidencyDescription: 'International transfers allowed to adequate countries or via Standard Clauses / Global BCRs.',
    mandatoryDpoRequirement: 'MANDATORY_ALWAYS',
    mandatoryDpiaRequirement: 'MANDATORY_HIGH_RISK',
    consentModel: 'EXPLICIT_OPT_IN',
    encryptionMandate: 'MANDATORY_REST_AND_TRANSIT',
    aiAlgorithmicGuardrails: 'TRANSPARENCY_REQUIRED',
    recordOfProcessing: 'MANDATORY_FULL'
  }
];

export const JurisdictionComparisonSplitView: React.FC = () => {
  const { showToast } = useNotification();

  // State for selected jurisdictions
  const [jurisdictionAId, setJurisdictionAId] = useState<string>('EU_GDPR');
  const [jurisdictionBId, setJurisdictionBId] = useState<string>('SA_PDPL');
  
  // Filtering & View Mode State
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'PENALTIES' | 'INCIDENT_SLA' | 'RESIDENCY' | 'COMPLIANCE_CONTROLS'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightDivergence, setHighlightDivergence] = useState<boolean>(true);
  const [regionFilter, setRegionFilter] = useState<string>('ALL');

  // Selected Profiles
  const profileA = useMemo(() => {
    return JURISDICTION_PROFILES.find(p => p.id === jurisdictionAId) || JURISDICTION_PROFILES[0];
  }, [jurisdictionAId]);

  const profileB = useMemo(() => {
    return JURISDICTION_PROFILES.find(p => p.id === jurisdictionBId) || JURISDICTION_PROFILES[2];
  }, [jurisdictionBId]);

  // Swap action
  const handleSwap = () => {
    const temp = jurisdictionAId;
    setJurisdictionAId(jurisdictionBId);
    setJurisdictionBId(temp);
    showToast('Swapped Jurisdiction A and Jurisdiction B', 'info');
  };

  // Filtered dropdown lists
  const availableProfiles = useMemo(() => {
    if (regionFilter === 'ALL') return JURISDICTION_PROFILES;
    return JURISDICTION_PROFILES.filter(p => p.region === regionFilter);
  }, [regionFilter]);

  // Export comparison handler
  const handleExportJSON = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      comparison: {
        jurisdictionA: profileA,
        jurisdictionB: profileB,
        divergenceHighlights: {
          fineDiffEur: Math.abs(profileA.estimatedMaxFineEur - profileB.estimatedMaxFineEur),
          slaDiffHours: Math.abs(profileA.breachRegulatorSlaHours - profileB.breachRegulatorSlaHours),
          residencyMismatch: profileA.dataResidencyMandate !== profileB.dataResidencyMandate,
          consentMismatch: profileA.consentModel !== profileB.consentModel
        }
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jurisdiction-comparison-${profileA.code}-vs-${profileB.code}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`Exported comparison report for ${profileA.shortCode} vs ${profileB.shortCode}`, 'success');
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Helper renderer for comparison cells
  const renderValueBadge = (valA: any, valB: any, label: string, formatter?: (val: any) => React.ReactNode) => {
    const isDifferent = valA !== valB;
    const highlight = highlightDivergence && isDifferent;

    return (
      <div className="grid grid-cols-2 divide-x divide-slate-800 text-sm">
        {/* Side A */}
        <div className={`p-4 transition-colors ${highlight ? 'bg-amber-500/5' : ''}`}>
          <div className="font-semibold text-slate-200">
            {formatter ? formatter(valA) : String(valA)}
          </div>
        </div>

        {/* Side B */}
        <div className={`p-4 transition-colors ${highlight ? 'bg-indigo-500/5' : ''}`}>
          <div className="font-semibold text-slate-200 flex items-center justify-between gap-2">
            <span>{formatter ? formatter(valB) : String(valB)}</span>
            {highlight && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full shrink-0">
                Divergent
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper for compliance mandate icons
  const formatMandateBadge = (status: string) => {
    switch (status) {
      case 'STRICT_LOCAL':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20"><Lock className="w-3.5 h-3.5" /> Strict Local Sovereignty</span>;
      case 'CONDITIONAL_TRANSFER':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Globe className="w-3.5 h-3.5" /> Conditional Transfer</span>;
      case 'ADEQUACY_BASED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Adequacy & SCCs</span>;
      case 'OPEN_WITH_NOTICE':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Zap className="w-3.5 h-3.5" /> Open with Notice</span>;
      case 'MANDATORY_ALWAYS':
      case 'MANDATORY_HIGH_RISK':
      case 'MANDATORY_FULL':
      case 'STRICT_HIGH_RISK_BAN':
      case 'MANDATORY_REST_AND_TRANSIT':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Mandatory</span>;
      case 'RISK_BASED':
      case 'RECOMMENDED':
      case 'TRANSPARENCY_REQUIRED':
      case 'IMPACT_ASSESSMENT_ONLY':
      case 'RECOMMENDED_STATE_OF_ART':
      case 'MANDATORY_LARGE_ENTITIES':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20"><Info className="w-3.5 h-3.5" /> Conditional / Risk-based</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20 print:p-0 print:bg-white text-slate-100">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-2xl print:border-none print:p-0 print:bg-transparent">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-indigo-500/20 border border-indigo-500/30 p-2 rounded-xl text-indigo-400">
                <Scale className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Regulatory & Penalty Split-View Engine
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight print:text-black">
              Jurisdiction Statutory Comparator
            </h1>
            <p className="text-slate-400 max-w-2xl mt-2 text-sm leading-relaxed print:text-slate-700">
              Side-by-side administrative audit comparing statutory fines, maximum financial penalties, 
              incident breach SLAs, sovereign residency restrictions, and mandatory controls across global legal frameworks.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <button
              onClick={() => setHighlightDivergence(!highlightDivergence)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                highlightDivergence 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-lg shadow-amber-500/5' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{highlightDivergence ? 'Highlighting Differences' : 'Highlight Divergence'}</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-all"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* DUAL JURISDICTION SELECTOR BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        
        {/* Jurisdiction A Selector */}
        <div className="lg:col-span-5 bg-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Jurisdiction A (Primary Target)
            </span>
            <span className="text-xl">{profileA.flag}</span>
          </div>
          
          <select
            value={jurisdictionAId}
            onChange={(e) => setJurisdictionAId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
          >
            {JURISDICTION_PROFILES.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === jurisdictionBId}>
                {p.flag} {p.name} ({p.shortCode})
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Regulator: <strong className="text-slate-200">{profileA.regulatorName}</strong></span>
            <span>Rigor Score: <strong className="text-indigo-400">{profileA.enforcementVelocityScore}/10</strong></span>
          </div>
        </div>

        {/* SWAP CONTROLLER */}
        <div className="lg:col-span-2 flex justify-center">
          <button
            onClick={handleSwap}
            title="Swap Jurisdiction A and B"
            className="bg-slate-800 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white p-3.5 rounded-2xl transition-all shadow-xl hover:rotate-180 duration-300"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
        </div>

        {/* Jurisdiction B Selector */}
        <div className="lg:col-span-5 bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Jurisdiction B (Comparator Target)
            </span>
            <span className="text-xl">{profileB.flag}</span>
          </div>

          <select
            value={jurisdictionBId}
            onChange={(e) => setJurisdictionBId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
          >
            {JURISDICTION_PROFILES.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === jurisdictionAId}>
                {p.flag} {p.name} ({p.shortCode})
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Regulator: <strong className="text-slate-200">{profileB.regulatorName}</strong></span>
            <span>Rigor Score: <strong className="text-amber-400">{profileB.enforcementVelocityScore}/10</strong></span>
          </div>
        </div>
      </div>

      {/* QUICK METRIC OVERVIEW HIGHLIGHT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Maximum Penalty Comparison Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statutory Max Penalty</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">EUR Estimated Basis</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-indigo-500/20">
              <span className="text-slate-400 block text-[10px] font-bold">{profileA.flag} {profileA.shortCode}</span>
              <span className="text-base font-black text-indigo-400 mt-1 block truncate" title={profileA.maxStatutoryFineFormatted}>
                {profileA.maxStatutoryFineFormatted}
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/20">
              <span className="text-slate-400 block text-[10px] font-bold">{profileB.flag} {profileB.shortCode}</span>
              <span className="text-base font-black text-amber-400 mt-1 block truncate" title={profileB.maxStatutoryFineFormatted}>
                {profileB.maxStatutoryFineFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Breach SLA Comparison Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Breach Regulator SLA</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">Hours to Report</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-indigo-500/20">
              <span className="text-slate-400 block text-[10px] font-bold">{profileA.flag} {profileA.shortCode}</span>
              <span className="text-base font-black text-white mt-1 block">
                {profileA.breachRegulatorSlaHours} Hours
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/20">
              <span className="text-slate-400 block text-[10px] font-bold">{profileB.flag} {profileB.shortCode}</span>
              <span className="text-base font-black text-white mt-1 block">
                {profileB.breachRegulatorSlaHours} Hours
              </span>
            </div>
          </div>
        </div>

        {/* Sovereign Residency Mandate Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Residency Mandate</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">Cross-Border</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-indigo-500/20">
              <span className="text-slate-400 block text-[10px] font-bold">{profileA.flag} {profileA.shortCode}</span>
              <div className="mt-1">{formatMandateBadge(profileA.dataResidencyMandate)}</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/20">
              <span className="text-slate-400 block text-[10px] font-bold">{profileB.flag} {profileB.shortCode}</span>
              <div className="mt-1">{formatMandateBadge(profileB.dataResidencyMandate)}</div>
            </div>
          </div>
        </div>

      </div>

      {/* FILTER & CATEGORY TOOLBAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'ALL', label: 'All Criteria' },
            { id: 'PENALTIES', label: 'Fines & Penalties' },
            { id: 'INCIDENT_SLA', label: 'Breach SLAs' },
            { id: 'RESIDENCY', label: 'Data Residency' },
            { id: 'COMPLIANCE_CONTROLS', label: 'Mandatory Controls' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Keyword Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search criteria (e.g. DPO, Fine, SLA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* DETAILED SIDE-BY-SIDE COMPARISON TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-slate-950 border-b border-slate-800 text-xs font-black uppercase tracking-wider text-slate-400">
          <div className="col-span-4 p-4 border-r border-slate-800 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Comparison Attribute</span>
          </div>

          <div className="col-span-4 p-4 border-r border-slate-800 bg-indigo-500/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{profileA.flag}</span>
              <span className="text-indigo-400 font-bold">{profileA.name}</span>
            </div>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              {profileA.shortCode}
            </span>
          </div>

          <div className="col-span-4 p-4 bg-amber-500/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{profileB.flag}</span>
              <span className="text-amber-400 font-bold">{profileB.name}</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              {profileB.shortCode}
            </span>
          </div>
        </div>

        {/* COMPARISON ROWS */}
        <div className="divide-y divide-slate-800/60 text-xs">

          {/* SECTION 1: STATUTORY FRAMEWORK */}
          {(activeCategory === 'ALL' || activeCategory === 'COMPLIANCE_CONTROLS') && (
            <>
              <div className="bg-slate-950/80 px-4 py-2.5 font-black uppercase tracking-widest text-[10px] text-indigo-400 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Statutory Authority & Framework Overview</span>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Official Statute Title</div>
                <div className="col-span-4 p-4 border-r border-slate-800 text-slate-200">{profileA.statuteTitle}</div>
                <div className="col-span-4 p-4 text-slate-200">{profileB.statuteTitle}</div>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Enforcement Authority / Regulator</div>
                <div className="col-span-4 p-4 border-r border-slate-800 text-slate-200 font-semibold">{profileA.regulatorName}</div>
                <div className="col-span-4 p-4 text-slate-200 font-semibold">{profileB.regulatorName}</div>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Audit Rigor & Enforcement Score</div>
                <div className="col-span-4 p-4 border-r border-slate-800 text-slate-200">
                  <span className="font-bold text-indigo-400">{profileA.enforcementVelocityScore}/10</span> - {profileA.auditRigorLevel}
                </div>
                <div className="col-span-4 p-4 text-slate-200">
                  <span className="font-bold text-amber-400">{profileB.enforcementVelocityScore}/10</span> - {profileB.auditRigorLevel}
                </div>
              </div>
            </>
          )}

          {/* SECTION 2: FINES & FINANCIAL PENALTIES */}
          {(activeCategory === 'ALL' || activeCategory === 'PENALTIES') && (
            <>
              <div className="bg-slate-950/80 px-4 py-2.5 font-black uppercase tracking-widest text-[10px] text-emerald-400 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Regulatory Fines & Financial Penalties</span>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Maximum Statutory Fine</div>
                <div className="col-span-4 p-4 border-r border-slate-800 font-extrabold text-emerald-400">{profileA.maxStatutoryFineFormatted}</div>
                <div className="col-span-4 p-4 font-extrabold text-emerald-400">{profileB.maxStatutoryFineFormatted}</div>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Penalty Calculation Basis</div>
                <div className="col-span-4 p-4 border-r border-slate-800 text-slate-200">{profileA.penaltyModelType}</div>
                <div className="col-span-4 p-4 text-slate-200">{profileB.penaltyModelType}</div>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Fine Tier Structure</div>
                <div className="col-span-4 p-4 border-r border-slate-800 text-slate-300 space-y-2">
                  {profileA.fineTiers.map((t, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <span className="font-bold text-indigo-400 block">{t.tier}</span>
                      <p className="text-[11px] text-slate-400">{t.description}</p>
                      <span className="font-mono text-emerald-400 font-bold block mt-1">{t.penalty}</span>
                    </div>
                  ))}
                </div>
                <div className="col-span-4 p-4 text-slate-300 space-y-2">
                  {profileB.fineTiers.map((t, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <span className="font-bold text-amber-400 block">{t.tier}</span>
                      <p className="text-[11px] text-slate-400">{t.description}</p>
                      <span className="font-mono text-emerald-400 font-bold block mt-1">{t.penalty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* SECTION 3: INCIDENT REPORTING & BREACH SLAS */}
          {(activeCategory === 'ALL' || activeCategory === 'INCIDENT_SLA') && (
            <>
              <div className="bg-slate-950/80 px-4 py-2.5 font-black uppercase tracking-widest text-[10px] text-sky-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Breach Incident Reporting & SLAs</span>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Regulator Notification SLA</div>
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-sky-400">{profileA.breachNotificationSla}</div>
                <div className="col-span-4 p-4 font-bold text-sky-400">{profileB.breachNotificationSla}</div>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Incident Threshold & Subject Scope</div>
                <div className="col-span-4 p-4 border-r border-slate-800 text-slate-300">{profileA.affectedSubjectThreshold}</div>
                <div className="col-span-4 p-4 text-slate-300">{profileB.affectedSubjectThreshold}</div>
              </div>
            </>
          )}

          {/* SECTION 4: DATA RESIDENCY & SOVEREIGNTY */}
          {(activeCategory === 'ALL' || activeCategory === 'RESIDENCY') && (
            <>
              <div className="bg-slate-950/80 px-4 py-2.5 font-black uppercase tracking-widest text-[10px] text-amber-400 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                <span>Sovereign Data Residency & Transfers</span>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Data Residency Mandate</div>
                <div className="col-span-4 p-4 border-r border-slate-800">{formatMandateBadge(profileA.dataResidencyMandate)}</div>
                <div className="col-span-4 p-4">{formatMandateBadge(profileB.dataResidencyMandate)}</div>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Transfer Restriction Scope</div>
                <div className="col-span-4 p-4 border-r border-slate-800 text-slate-300">{profileA.dataResidencyDescription}</div>
                <div className="col-span-4 p-4 text-slate-300">{profileB.dataResidencyDescription}</div>
              </div>
            </>
          )}

          {/* SECTION 5: MANDATORY TECHNICAL & COMPLIANCE CONTROLS */}
          {(activeCategory === 'ALL' || activeCategory === 'COMPLIANCE_CONTROLS') && (
            <>
              <div className="bg-slate-950/80 px-4 py-2.5 font-black uppercase tracking-widest text-[10px] text-indigo-400 flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Mandatory Technical & Compliance Controls</span>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Mandatory Data Protection Officer (DPO)</div>
                <div className="col-span-4 p-4 border-r border-slate-800">{formatMandateBadge(profileA.mandatoryDpoRequirement)}</div>
                <div className="col-span-4 p-4">{formatMandateBadge(profileB.mandatoryDpoRequirement)}</div>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Data Protection Impact Assessment (DPIA)</div>
                <div className="col-span-4 p-4 border-r border-slate-800">{formatMandateBadge(profileA.mandatoryDpiaRequirement)}</div>
                <div className="col-span-4 p-4">{formatMandateBadge(profileB.mandatoryDpiaRequirement)}</div>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Consent Framework Basis</div>
                <div className="col-span-4 p-4 border-r border-slate-800 font-semibold text-slate-200">{profileA.consentModel}</div>
                <div className="col-span-4 p-4 font-semibold text-slate-200">{profileB.consentModel}</div>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">Encryption at Rest & Transit</div>
                <div className="col-span-4 p-4 border-r border-slate-800">{formatMandateBadge(profileA.encryptionMandate)}</div>
                <div className="col-span-4 p-4">{formatMandateBadge(profileB.encryptionMandate)}</div>
              </div>

              <div className="grid grid-cols-12 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-4 p-4 border-r border-slate-800 font-bold text-slate-300">AI & Algorithmic Guardrails</div>
                <div className="col-span-4 p-4 border-r border-slate-800">{formatMandateBadge(profileA.aiAlgorithmicGuardrails)}</div>
                <div className="col-span-4 p-4">{formatMandateBadge(profileB.aiAlgorithmicGuardrails)}</div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* DIVERGENCE & ACTION PLAN SUMMARY BOX */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-500/20 p-2 rounded-xl border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Cross-Border Compliance Action Plan</h3>
            <p className="text-xs text-slate-400">Automated recommendations when operating across both {profileA.shortCode} and {profileB.shortCode} simultaneously.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="font-bold text-indigo-400 block mb-1">1. Strictest SLA Strategy</span>
            <p className="text-slate-300 leading-relaxed">
              Target breach response procedures to meet <strong className="text-white font-mono">{Math.min(profileA.breachRegulatorSlaHours, profileB.breachRegulatorSlaHours)} Hours</strong> to guarantee zero notification violations across both jurisdictions.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">2. Data Residency Architecture</span>
            <p className="text-slate-300 leading-relaxed">
              {profileA.dataResidencyMandate === 'STRICT_LOCAL' || profileB.dataResidencyMandate === 'STRICT_LOCAL' ? (
                <>Enforce <strong>sovereign local data residency</strong> in primary node region with zero raw PII replication to remote cloud nodes.</>
              ) : (
                <>Ensure Standard Contractual Clauses (SCCs) and zero-trust encryption are active for cross-border cloud syncs.</>
              )}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default JurisdictionComparisonSplitView;
