import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Globe, 
  ShieldAlert, 
  Lock, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sliders, 
  Cpu, 
  Database, 
  Sparkles, 
  Zap, 
  Search, 
  Building2, 
  Scale, 
  Key, 
  RefreshCw, 
  Download, 
  Upload, 
  Eye, 
  ShieldCheck, 
  Terminal, 
  Gavel, 
  ArrowRight, 
  ChevronRight, 
  Plus, 
  Trash2, 
  FileCode, 
  Layers, 
  Check, 
  Copy, 
  Filter, 
  Settings2, 
  Save, 
  ExternalLink,
  Code2,
  FileCheck2,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

export interface RegulatoryTemplate {
  id: string;
  name: string;
  category: 'AI_GOVERNANCE' | 'CYBER_RESILIENCE' | 'DATA_PRIVACY' | 'FINANCIAL_INTEGRITY' | 'CRITICAL_INFRASTRUCTURE';
  format: 'JSON_LD' | 'EU_XML_SDMX' | 'CB_XBRLE' | 'PROTOBUF_SEALED';
  schemaVersion: string;
  jurisdictionCode: string; // e.g. 'DE', 'FR', 'SA', 'SG', 'US', 'GB', 'ALL'
  description: string;
  mandatoryFields: string[];
  statutoryArticles: string[];
  hashVerification: 'SHA256' | 'SHA512_HMAC' | 'ZK_SNARK_GROTH16' | 'PQC_DILITHIUM';
  minPassingScore: number;
  samplePayload: string;
  isDefault?: boolean;
}

export interface JurisdictionRule {
  countryCode: string;
  countryName: string;
  flag: string;
  region: 'EU' | 'GCC' | 'APAC' | 'AMER' | 'GLOBAL';
  regulatorAgency: string;
  sandboxEnclaveHost: string;
  isolationLevel: 'STRICT_AIR_GAP' | 'SYNTHETIC_ENCLAVE' | 'DIFF_PRIVACY_TUNNEL' | 'HYBRID_FEDERATED';
  maxTestingDurationDays: number;
  maxSyntheticRecords: number;
  diffPrivacyEpsilon: number;
  requiresDualRegulatorSignoff: boolean;
  autoAdjudicateWithAI: boolean;
  autoAdjudicationThreshold: number;
  allowedFilingTypes: string[];
  liveSyncWithGazette: boolean;
  statutoryFineCap: string;
  customPolicyNotes: string;
  activeTemplateIds: string[];
}

export interface SimulationResult {
  id: string;
  timestamp: string;
  countryCode: string;
  countryName: string;
  templateName: string;
  schemaValid: boolean;
  overallScore: number;
  status: 'ACCEPTED' | 'PROVISIONAL_PASS' | 'REJECTED';
  cryptographicProof: string;
  validationChecks: {
    name: string;
    passed: boolean;
    statutoryRef: string;
    details: string;
  }[];
  aiAdjudicationSummary: string;
}

const DEFAULT_TEMPLATES: RegulatoryTemplate[] = [
  {
    id: 'TMPL-EU-AI-52',
    name: 'EU AI Act Art. 52 High-Risk Model Dossier',
    category: 'AI_GOVERNANCE',
    format: 'JSON_LD',
    schemaVersion: 'v2026.3-eu-ai',
    jurisdictionCode: 'EU',
    description: 'Statutory transparency, human-in-the-loop oversight validation, and training dataset bias distribution ledger.',
    mandatoryFields: ['model_hash', 'training_corpus_provenance', 'bias_variance_metrics', 'synthetic_watermark_key', 'human_fallback_sop'],
    statutoryArticles: ['EU Regulation 2024/1689 Art. 52', 'EU AI Act Annex IV (Technical Documentation)', 'GDPR Art. 22'],
    hashVerification: 'ZK_SNARK_GROTH16',
    minPassingScore: 88,
    isDefault: true,
    samplePayload: JSON.stringify({
      "@context": "https://ec.europa.eu/ai-act/v1/context.jsonld",
      "filingType": "HIGH_RISK_AI_CONFORMITY",
      "modelIdentifier": "FinPredict-LLM-v4.2",
      "training_corpus_provenance": "sha256:8f4c2810a90b4d45d8b762514e8a7fbc2",
      "bias_variance_metrics": { "disparateImpactRatio": 0.96, "falsePositiveParity": 0.98 },
      "synthetic_watermark_key": "secp256k1-watermark-sig-0x99281a",
      "human_fallback_sop": "Dual-operator killswitch with 120s max latency"
    }, null, 2)
  },
  {
    id: 'TMPL-DORA-ICT',
    name: 'DORA Tier-1 ICT Resilience & Multi-Cloud Fallback',
    category: 'CYBER_RESILIENCE',
    format: 'EU_XML_SDMX',
    schemaVersion: 'v2026.1-dora-rts',
    jurisdictionCode: 'EU',
    description: 'European Banking Authority (EBA) / EIOPA / ESMA standard for critical ICT third-party risk and chaos engineering telemetry.',
    mandatoryFields: ['critical_function_id', 'rpo_minutes', 'rto_minutes', 'chaos_test_timestamp', 'failover_hash', 'concentration_risk_pct'],
    statutoryArticles: ['DORA Regulation (EU) 2022/2554 Art. 11', 'EBA RTS on ICT Risk Framework'],
    hashVerification: 'SHA512_HMAC',
    minPassingScore: 90,
    isDefault: true,
    samplePayload: `<?xml version="1.0" encoding="UTF-8"?>
<DORAFiling xmlns="urn:eu:eba:dora:v2026" schemaVersion="2026.1">
  <Header>
    <EntityId>LEI-5493001KJTIIGC8Y1R12</EntityId>
    <SubmissionType>ANNUAL_TIER1_ICT_TEST</SubmissionType>
  </Header>
  <ResilienceMetrics>
    <CriticalFunctionId>CORE_BANKING_SETTLEMENT</CriticalFunctionId>
    <RPOMinutes>2</RPOMinutes>
    <RTOMinutes>8</RTOMinutes>
    <ChaosTestTimestamp>2026-08-15T02:00:00Z</ChaosTestTimestamp>
    <FailoverHash>sha512:c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2</FailoverHash>
    <ConcentrationRiskPct>18.4</ConcentrationRiskPct>
  </ResilienceMetrics>
</DORAFiling>`
  },
  {
    id: 'TMPL-SA-PDPL-29',
    name: 'Saudi PDPL Art. 29 Cross-Border Egress Exemption Dossier',
    category: 'DATA_PRIVACY',
    format: 'JSON_LD',
    schemaVersion: 'v2026.1-sdaia-pdpl',
    jurisdictionCode: 'SA',
    description: 'SDAIA / SAMA regulatory sandbox filing for biometric and financial personal data processing outside KSA borders.',
    mandatoryFields: ['sdaia_registration_no', 'data_sovereignty_tier', 'encryption_standard', 'recipient_adequate_jurisdiction', 'citizen_consent_ledger_ref'],
    statutoryArticles: ['Saudi PDPL Royal Decree M/19 Art. 29', 'SDAIA Executive Regulations Schedule 2'],
    hashVerification: 'PQC_DILITHIUM',
    minPassingScore: 92,
    isDefault: true,
    samplePayload: JSON.stringify({
      "sdaia_registration_no": "KSA-SDAIA-2026-99014",
      "data_sovereignty_tier": "TIER_1_CRITICAL_AIR_GAPPED",
      "encryption_standard": "AES-256-GCM + Post-Quantum Dilithium-3",
      "recipient_adequate_jurisdiction": "DE (Germany Eurocloud Sovereign)",
      "citizen_consent_ledger_ref": "b2g_block_hash_0x88f72a49b910c2e"
    }, null, 2)
  },
  {
    id: 'TMPL-SG-MAS-TRM',
    name: 'Singapore MAS TRM & FEAT AI Fairness Assessment',
    category: 'FINANCIAL_INTEGRITY',
    format: 'CB_XBRLE',
    schemaVersion: 'v2026.4-mas-feat',
    jurisdictionCode: 'SG',
    description: 'Monetary Authority of Singapore (MAS) Fairness, Ethics, Accountability, and Transparency (FEAT) quantitative assessment.',
    mandatoryFields: ['mas_institution_code', 'model_purpose', 'fairness_disparity_index', 'explainability_technique', 'audit_signoff_partner'],
    statutoryArticles: ['MAS Technology Risk Management Guidelines 2026', 'MAS Veritas FEAT Framework'],
    hashVerification: 'SHA256',
    minPassingScore: 85,
    isDefault: true,
    samplePayload: JSON.stringify({
      "mas_institution_code": "MAS-FI-8821",
      "model_purpose": "Credit Underwriting & Real-Time AML Scoring",
      "fairness_disparity_index": 0.032,
      "explainability_technique": "SHAP + Integrated Gradients Enclave",
      "audit_signoff_partner": "KPMG Singapore Cyber & AI Assurance"
    }, null, 2)
  },
  {
    id: 'TMPL-US-SEC-8K',
    name: 'US SEC Cyber Incident Form 8-K / Item 1.06 Disclosure',
    category: 'CYBER_RESILIENCE',
    format: 'PROTOBUF_SEALED',
    schemaVersion: 'v2026.2-sec-edgar',
    jurisdictionCode: 'US',
    description: 'Mandatory 4-day material cybersecurity incident disclosure telemetry for publicly traded & FedRAMP SaaS entities.',
    mandatoryFields: ['cik_number', 'incident_discovery_timestamp', 'materiality_determination', 'exfiltrated_records_count', 'cisa_relay_ref'],
    statutoryArticles: ['SEC Release No. 33-11216', '17 CFR Part 229 Item 106(c)', 'CISA CIRCIA 2026'],
    hashVerification: 'SHA256',
    minPassingScore: 85,
    isDefault: true,
    samplePayload: JSON.stringify({
      "cik_number": "0001889920",
      "incident_discovery_timestamp": "2026-08-19T06:14:00Z",
      "materiality_determination": "MATERIAL_NON_SYSTEMIC_CONTAINED",
      "exfiltrated_records_count": 0,
      "cisa_relay_ref": "CISA-IR-2026-08819"
    }, null, 2)
  },
  {
    id: 'TMPL-NIS2-INCIDENT',
    name: 'EU NIS2 24-Hour Early Warning & Root Cause Brief',
    category: 'CRITICAL_INFRASTRUCTURE',
    format: 'EU_XML_SDMX',
    schemaVersion: 'v2026.2-nis2-csirt',
    jurisdictionCode: 'EU',
    description: 'European Cyber Crisis Liaison Organisation Network (EU-CyCLONe) statutory incident dispatcher.',
    mandatoryFields: ['csirt_national_point', 'threat_vector_mitre_id', 'impacted_essential_services', 'indicator_of_compromise_hash', 'remediation_eta_hours'],
    statutoryArticles: ['NIS2 Directive (EU) 2022/2555 Art. 23', 'ENISA Incident Reporting Guidelines'],
    hashVerification: 'ZK_SNARK_GROTH16',
    minPassingScore: 90,
    isDefault: true,
    samplePayload: `<?xml version="1.0" encoding="UTF-8"?>
<NIS2IncidentReport xmlns="urn:eu:enisa:nis2:v2026">
  <CSIRTNationalPoint>BSI-GERMANY-CERT-BUND</CSIRTNationalPoint>
  <ThreatVectorMitreId>T1190_EXPLOIT_PUBLIC_APP</ThreatVectorMitreId>
  <ImpactedEssentialServices>HEALTHCARE_CLOUD_TELEMETRY</ImpactedEssentialServices>
  <IndicatorOfCompromiseHash>sha256:9128f7a810bc947e52a9401f82c49910d</IndicatorOfCompromiseHash>
  <RemediationEtaHours>6</RemediationEtaHours>
</NIS2IncidentReport>`
  }
];

const DEFAULT_JURISDICTIONS: JurisdictionRule[] = [
  {
    countryCode: 'DE',
    countryName: 'Germany',
    flag: '🇩🇪',
    region: 'EU',
    regulatorAgency: 'BfDI & BaFin (Federal Financial Supervisory Authority)',
    sandboxEnclaveHost: 'de-fra-sandbox-enclave-01.regulettee.eu',
    isolationLevel: 'STRICT_AIR_GAP',
    maxTestingDurationDays: 180,
    maxSyntheticRecords: 1000000,
    diffPrivacyEpsilon: 0.1,
    requiresDualRegulatorSignoff: true,
    autoAdjudicateWithAI: true,
    autoAdjudicationThreshold: 88,
    allowedFilingTypes: ['HIGH_RISK_AI_CONFORMITY', 'DORA_TIER1_ICT', 'NIS2_INCIDENT', 'GDPR_TRANSFER_IMPACT'],
    liveSyncWithGazette: true,
    statutoryFineCap: '4.0% Global Turnover or €20M',
    customPolicyNotes: 'Strict synthetic data isolation required. Zero egress outside DE-FRA AWS Sovereign node permitted.',
    activeTemplateIds: ['TMPL-EU-AI-52', 'TMPL-DORA-ICT', 'TMPL-NIS2-INCIDENT']
  },
  {
    countryCode: 'FR',
    countryName: 'France',
    flag: '🇫🇷',
    region: 'EU',
    regulatorAgency: 'CNIL & ANSSI (National Cybersecurity Agency)',
    sandboxEnclaveHost: 'fr-par-secnum-sandbox-02.regulettee.eu',
    isolationLevel: 'SYNTHETIC_ENCLAVE',
    maxTestingDurationDays: 120,
    maxSyntheticRecords: 500000,
    diffPrivacyEpsilon: 0.2,
    requiresDualRegulatorSignoff: true,
    autoAdjudicateWithAI: true,
    autoAdjudicationThreshold: 85,
    allowedFilingTypes: ['HIGH_RISK_AI_CONFORMITY', 'NIS2_INCIDENT', 'HEALTH_DATA_SPACE'],
    liveSyncWithGazette: true,
    statutoryFineCap: '4.0% Global Turnover or €20M',
    customPolicyNotes: 'SecNumCloud qualification prerequisite for biometric model evaluation enclaves.',
    activeTemplateIds: ['TMPL-EU-AI-52', 'TMPL-NIS2-INCIDENT']
  },
  {
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    flag: '🇸🇦',
    region: 'GCC',
    regulatorAgency: 'SDAIA (Saudi Data & AI Authority) & SAMA',
    sandboxEnclaveHost: 'sa-ruh-national-cloud-sb.9xen-regulettee.gov.sa',
    isolationLevel: 'STRICT_AIR_GAP',
    maxTestingDurationDays: 90,
    maxSyntheticRecords: 2000000,
    diffPrivacyEpsilon: 0.05,
    requiresDualRegulatorSignoff: true,
    autoAdjudicateWithAI: true,
    autoAdjudicationThreshold: 90,
    allowedFilingTypes: ['PDPL_CROSS_BORDER_EXEMPTION', 'SAMA_FINANCIAL_AI_AUDIT', 'CRITICAL_INFRASTRUCTURE'],
    liveSyncWithGazette: true,
    statutoryFineCap: '5.0% Local Turnover or 5,000,000 SAR',
    customPolicyNotes: 'Mandatory Royal Decree M/19 Article 29 cryptographic escrow and local national ID masking.',
    activeTemplateIds: ['TMPL-SA-PDPL-29']
  },
  {
    countryCode: 'SG',
    countryName: 'Singapore',
    flag: '🇸🇬',
    region: 'APAC',
    regulatorAgency: 'MAS (Monetary Authority of Singapore) & PDPC',
    sandboxEnclaveHost: 'sg-sin-equinix-sb-01.9xen-regulettee.sg',
    isolationLevel: 'DIFF_PRIVACY_TUNNEL',
    maxTestingDurationDays: 150,
    maxSyntheticRecords: 1500000,
    diffPrivacyEpsilon: 0.25,
    requiresDualRegulatorSignoff: false,
    autoAdjudicateWithAI: true,
    autoAdjudicationThreshold: 85,
    allowedFilingTypes: ['MAS_FEAT_AI_AUDIT', 'PDPA_CROSS_BORDER_ADEQUACY', 'TRM_RESILIENCE'],
    liveSyncWithGazette: true,
    statutoryFineCap: '10.0% Singapore Turnover or S$1M',
    customPolicyNotes: 'Veritas FEAT fairness disparity metrics and explainability scorecards required.',
    activeTemplateIds: ['TMPL-SG-MAS-TRM']
  },
  {
    countryCode: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    region: 'AMER',
    regulatorAgency: 'SEC, FTC, CISA & NIST GovCloud',
    sandboxEnclaveHost: 'us-gov-east-fedramp-sb.9xen-regulettee.us',
    isolationLevel: 'HYBRID_FEDERATED',
    maxTestingDurationDays: 90,
    maxSyntheticRecords: 5000000,
    diffPrivacyEpsilon: 0.5,
    requiresDualRegulatorSignoff: false,
    autoAdjudicateWithAI: true,
    autoAdjudicationThreshold: 82,
    allowedFilingTypes: ['SEC_8K_CYBER_DISCLOSURE', 'NIST_CSF_EVALUATION', 'FEDRAMP_HIGH_CONTROL_AUDIT'],
    liveSyncWithGazette: true,
    statutoryFineCap: 'Civil Penalties up to $2.5M per violation',
    customPolicyNotes: 'Item 1.06 4-day materiality window simulator and CISA automated relay.',
    activeTemplateIds: ['TMPL-US-SEC-8K']
  },
  {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    region: 'EU',
    regulatorAgency: 'ICO (Information Commissioner) & FCA Regulatory Sandbox',
    sandboxEnclaveHost: 'uk-lon-fca-sandbox-01.9xen-regulettee.co.uk',
    isolationLevel: 'SYNTHETIC_ENCLAVE',
    maxTestingDurationDays: 180,
    maxSyntheticRecords: 800000,
    diffPrivacyEpsilon: 0.15,
    requiresDualRegulatorSignoff: false,
    autoAdjudicateWithAI: true,
    autoAdjudicationThreshold: 85,
    allowedFilingTypes: ['UK_GDPR_TRANSFER', 'FCA_FINTECH_SANDBOX', 'AI_SAFETY_INSTITUTE_CARD'],
    liveSyncWithGazette: true,
    statutoryFineCap: '4.0% Global Turnover or £17.5M',
    customPolicyNotes: 'UK AI Safety Institute dual-evaluation criteria and safe harbor indemnification window.',
    activeTemplateIds: ['TMPL-EU-AI-52']
  }
];

export const MultiRegionSandboxConfigPanel: React.FC = () => {
  const { showToast } = useNotification();

  // Primary Navigation Mode
  const [activeTab, setActiveTab] = useState<'JURISDICTIONS' | 'TEMPLATES' | 'SIMULATOR' | 'TELEMETRY'>('JURISDICTIONS');

  // Persistence States
  const [templates, setTemplates] = useState<RegulatoryTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('9xen-regulettee_b2g_sandbox_templates');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TEMPLATES;
  });

  const [jurisdictions, setJurisdictions] = useState<JurisdictionRule[]>(() => {
    try {
      const saved = localStorage.getItem('9xen-regulettee_b2g_sandbox_jurisdictions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_JURISDICTIONS;
  });

  // Selected Items for Details & Editing
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('DE');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [templateFilter, setTemplateFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isEditRuleModalOpen, setIsEditRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<JurisdictionRule | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RegulatoryTemplate | null>(null);

  // Simulator State
  const [simCountryCode, setSimCountryCode] = useState<string>('DE');
  const [simTemplateId, setSimTemplateId] = useState<string>('TMPL-EU-AI-52');
  const [simPayload, setSimPayload] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<SimulationResult[]>([]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('9xen-regulettee_b2g_sandbox_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('9xen-regulettee_b2g_sandbox_jurisdictions', JSON.stringify(jurisdictions));
  }, [jurisdictions]);

  // Sync simulator payload when template changes
  useEffect(() => {
    const tmpl = templates.find(t => t.id === simTemplateId);
    if (tmpl) {
      setSimPayload(tmpl.samplePayload);
    }
  }, [simTemplateId, templates]);

  // Active selected jurisdiction rule
  const currentJurisdiction = useMemo(() => {
    return jurisdictions.find(j => j.countryCode === selectedCountryCode) || jurisdictions[0];
  }, [jurisdictions, selectedCountryCode]);

  // Filtered jurisdictions
  const filteredJurisdictions = useMemo(() => {
    return jurisdictions.filter(j => {
      const matchRegion = regionFilter === 'ALL' || j.region === regionFilter;
      const matchSearch = j.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          j.countryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          j.regulatorAgency.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRegion && matchSearch;
    });
  }, [jurisdictions, regionFilter, searchQuery]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchCat = templateFilter === 'ALL' || t.category === templateFilter;
      const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.statutoryArticles.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [templates, templateFilter, searchQuery]);

  // Save modified jurisdiction rule
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    setJurisdictions(prev => prev.map(j => j.countryCode === editingRule.countryCode ? editingRule : j));
    setIsEditRuleModalOpen(false);
    showToast(`Updated sandbox filing rules & templates for ${editingRule.flag} ${editingRule.countryName}`, 'success');
  };

  // Save template (add new or update)
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !editingTemplate.name) {
      showToast('Please provide a valid template name and mandatory fields', 'error');
      return;
    }

    if (templates.some(t => t.id === editingTemplate.id)) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
      showToast(`Regulatory Template ${editingTemplate.name} updated successfully`, 'success');
    } else {
      setTemplates(prev => [editingTemplate, ...prev]);
      showToast(`Created new B2G Regulatory Template: ${editingTemplate.name}`, 'success');
    }
    setIsTemplateModalOpen(false);
  };

  // Delete template
  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    showToast('Regulatory template removed', 'info');
  };

  // Run Sandbox Simulation Dry-Run
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimResult(null);

    const targetJurisdiction = jurisdictions.find(j => j.countryCode === simCountryCode) || currentJurisdiction;
    const targetTemplate = templates.find(t => t.id === simTemplateId) || templates[0];

    setTimeout(() => {
      let isJson = false;
      let parsedObj: any = null;
      try {
        parsedObj = JSON.parse(simPayload);
        isJson = true;
      } catch {
        isJson = false;
      }

      // Check required fields
      const missingFields: string[] = [];
      targetTemplate.mandatoryFields.forEach(field => {
        if (isJson) {
          if (parsedObj[field] === undefined && !simPayload.includes(field)) {
            missingFields.push(field);
          }
        } else {
          if (!simPayload.includes(field)) {
            missingFields.push(field);
          }
        }
      });

      const schemaValid = missingFields.length === 0;
      const baseScore = schemaValid ? Math.floor(88 + Math.random() * 11) : Math.floor(45 + Math.random() * 25);
      const passedThreshold = baseScore >= targetJurisdiction.autoAdjudicationThreshold;

      const randomProof = `zk-groth16-seal-0x${Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      const checks = [
        {
          name: 'Schema Structure & Format Verification',
          passed: schemaValid,
          statutoryRef: targetTemplate.schemaVersion,
          details: schemaValid ? 'All mandatory fields and JSON-LD/XML nodes present.' : `Missing mandatory statutory fields: ${missingFields.join(', ')}`
        },
        {
          name: 'Jurisdiction Isolation & Differential Privacy Constraint',
          passed: true,
          statutoryRef: `${targetJurisdiction.countryName} Enclave (ε=${targetJurisdiction.diffPrivacyEpsilon})`,
          details: `Enclave isolation ${targetJurisdiction.isolationLevel} respected. Zero unauthorized cross-border egress detected.`
        },
        {
          name: 'Cryptographic Hash Integrity & Seal',
          passed: true,
          statutoryRef: targetTemplate.hashVerification,
          details: `Sealed using ${targetTemplate.hashVerification} proof container.`
        },
        {
          name: 'Auto-Adjudication Conformity Threshold',
          passed: passedThreshold,
          statutoryRef: `Min Score: ${targetJurisdiction.autoAdjudicationThreshold}%`,
          details: passedThreshold 
            ? `Achieved ${baseScore}% conformity score (Required: ${targetJurisdiction.autoAdjudicationThreshold}%).` 
            : `Fell below the ${targetJurisdiction.autoAdjudicationThreshold}% threshold (${baseScore}%). Manual regulator intervention required.`
        }
      ];

      const result: SimulationResult = {
        id: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toISOString(),
        countryCode: targetJurisdiction.countryCode,
        countryName: targetJurisdiction.countryName,
        templateName: targetTemplate.name,
        schemaValid,
        overallScore: baseScore,
        status: passedThreshold ? 'ACCEPTED' : (schemaValid ? 'PROVISIONAL_PASS' : 'REJECTED'),
        cryptographicProof: randomProof,
        validationChecks: checks,
        aiAdjudicationSummary: passedThreshold 
          ? `AI Autonomous Inspector verified full alignment with ${targetTemplate.statutoryArticles[0]} and ${targetJurisdiction.regulatorAgency} requirements.`
          : `Deficiencies detected during sandbox test dry-run. Remediation required before production B2G gateway ingress.`
      };

      setSimResult(result);
      setSimulationHistory(prev => [result, ...prev.slice(0, 15)]);
      setIsSimulating(false);

      if (passedThreshold) {
        showToast(`✅ Sandbox Dry-Run Passed! Conformity Score: ${baseScore}%`, 'success');
      } else {
        showToast(`⚠️ Sandbox Dry-Run Warning: Conformity score ${baseScore}% below threshold`, 'error');
      }
    }, 1400);
  };

  // Reset to Factory Default
  const handleResetDefaults = () => {
    if (window.confirm('Reset all country sandbox rules and regulatory templates to factory defaults?')) {
      setTemplates(DEFAULT_TEMPLATES);
      setJurisdictions(DEFAULT_JURISDICTIONS);
      showToast('Reset to default multi-region sandbox configuration', 'info');
    }
  };

  // Export Complete Sandbox Config JSON
  const handleExportConfig = () => {
    const payload = {
      version: '2026.3',
      exportedAt: new Date().toISOString(),
      jurisdictions,
      templates,
      telemetrySample: simulationHistory
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `B2G-MultiRegion-Sandbox-Config-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported Multi-Region Sandbox Configuration file', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-extrabold text-2xl shadow-inner shrink-0">
              <Box className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider">
                  B2G Multi-Region Sandbox Configuration Panel
                </span>
                <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Isolation Enclaves Ready
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Country-Specific Regulatory Templates & Jurisdiction Rules Engine
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Configure isolated synthetic filing environments per country jurisdiction. Enforce custom XML/JSON schema templates, differential privacy constraints, automated AI adjudication thresholds, and pre-clearance validation rules.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-stretch lg:self-auto justify-end flex-wrap gap-2">
            <button
              onClick={handleExportConfig}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Export complete configuration payload"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Config</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-3 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-rose-300 text-xs font-medium rounded-xl border border-slate-800 transition-all cursor-pointer"
              title="Reset configuration to factory defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Global Summary KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-indigo-500/20 text-xs font-mono">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-indigo-900/40">
            <span className="text-slate-400 text-[10px] uppercase block">Jurisdiction Profiles</span>
            <span className="text-white font-bold text-sm">{jurisdictions.length} Active Countries</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-indigo-900/40">
            <span className="text-slate-400 text-[10px] uppercase block">Regulatory Templates</span>
            <span className="text-indigo-300 font-bold text-sm">{templates.length} Schema Dossiers</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-indigo-900/40">
            <span className="text-slate-400 text-[10px] uppercase block">Max Synthetic Scale</span>
            <span className="text-emerald-400 font-bold text-sm">5,000,000 Records</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-indigo-900/40">
            <span className="text-slate-400 text-[10px] uppercase block">Autonomous Adjudication</span>
            <span className="text-amber-400 font-bold text-sm">Enabled (Gemini B2G)</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          onClick={() => setActiveTab('JURISDICTIONS')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'JURISDICTIONS'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Country Jurisdiction Rules ({jurisdictions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TEMPLATES')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'TEMPLATES'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Regulatory Templates & Schemas ({templates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SIMULATOR')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'SIMULATOR'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive Sandbox Simulator</span>
          {simulationHistory.length > 0 && (
            <span className="px-1.5 py-0.2 bg-indigo-900 text-indigo-200 text-[10px] rounded-full font-bold">
              {simulationHistory.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('TELEMETRY')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'TELEMETRY'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Dry-Run Telemetry & Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: COUNTRY JURISDICTION RULES */}
      {activeTab === 'JURISDICTIONS' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Region:</span>
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {['ALL', 'EU', 'GCC', 'APAC', 'AMER'].map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setRegionFilter(reg)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      regionFilter === reg
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search country name, code, or regulator agency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Jurisdictions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJurisdictions.map((item) => (
              <div
                key={item.countryCode}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{item.flag}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {item.countryName} ({item.countryCode})
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {item.region}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {item.regulatorAgency}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingRule(item);
                        setIsEditRuleModalOpen(true);
                      }}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 hover:text-indigo-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Edit Country Sandbox Rules"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Settings Breakdown Table */}
                  <div className="mt-4 space-y-2 text-xs font-mono bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Isolation Mode:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.isolationLevel}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Max Duration:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.maxTestingDurationDays} Days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Diff Privacy (ε):</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">ε = {item.diffPrivacyEpsilon}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">AI Adjudication:</span>
                      <span className={`font-bold ${item.autoAdjudicateWithAI ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {item.autoAdjudicateWithAI ? `Pass ≥ ${item.autoAdjudicationThreshold}%` : 'Manual Signoff'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Fine Exposure Cap:</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400 truncate max-w-[150px]">{item.statutoryFineCap}</span>
                    </div>
                  </div>

                  {/* Active Templates Attached */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">Assigned Regulatory Schemas:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.activeTemplateIds.map(tid => {
                        const tmpl = templates.find(t => t.id === tid);
                        return (
                          <span 
                            key={tid} 
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-[200px]"
                            title={tmpl?.name || tid}
                          >
                            {tmpl?.name || tid}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                    🌐 {item.sandboxEnclaveHost}
                  </span>
                  <button
                    onClick={() => {
                      setSimCountryCode(item.countryCode);
                      if (item.activeTemplateIds[0]) {
                        setSimTemplateId(item.activeTemplateIds[0]);
                      }
                      setActiveTab('SIMULATOR');
                    }}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Launch Dry-Run</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REGULATORY TEMPLATES & SCHEMAS */}
      {activeTab === 'TEMPLATES' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-500" />
                Statutory Regulatory Template Schemas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage B2G standardized electronic dossiers across EU AI Act, DORA, NIS2, and Saudi PDPL filing gateways.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingTemplate({
                    id: `TMPL-${Math.floor(1000 + Math.random() * 9000)}`,
                    name: '',
                    category: 'AI_GOVERNANCE',
                    format: 'JSON_LD',
                    schemaVersion: 'v2026.1',
                    jurisdictionCode: 'EU',
                    description: '',
                    mandatoryFields: ['entity_lei', 'timestamp', 'compliance_checksum'],
                    statutoryArticles: ['Statutory Article 1'],
                    hashVerification: 'SHA256',
                    minPassingScore: 85,
                    samplePayload: JSON.stringify({ "entity_lei": "LEI-00001", "compliance_checksum": "sha256:0000" }, null, 2)
                  });
                  setIsTemplateModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Template</span>
              </button>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          tmpl.category === 'AI_GOVERNANCE' ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                          tmpl.category === 'CYBER_RESILIENCE' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' :
                          tmpl.category === 'DATA_PRIVACY' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                          'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {tmpl.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-400">
                          {tmpl.format} • {tmpl.schemaVersion}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                        {tmpl.name}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingTemplate(tmpl);
                          setIsTemplateModalOpen(true);
                        }}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 rounded-lg text-xs transition-colors"
                        title="Edit Template"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                      {!tmpl.isDefault && (
                        <button
                          onClick={() => handleDeleteTemplate(tmpl.id)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-lg text-xs transition-colors"
                          title="Delete Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {tmpl.description}
                  </p>

                  {/* Mandatory Fields */}
                  <div className="mt-4 space-y-1.5 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500">Mandatory Telemetry Fields ({tmpl.mandatoryFields.length}):</span>
                    <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                      {tmpl.mandatoryFields.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Statutory Articles */}
                  <div className="mt-3 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500">Statutory Foundations:</span>
                    <ul className="mt-1 space-y-0.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      {tmpl.statutoryArticles.map((art, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>{art}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" />
                    {tmpl.hashVerification} Seal
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Min Conformity: {tmpl.minPassingScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE SANDBOX SIMULATOR */}
      {activeTab === 'SIMULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Simulator Input Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Multi-Region Filing Dry-Run Engine
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Target Country & Regulatory Enclave</label>
                <select
                  value={simCountryCode}
                  onChange={(e) => {
                    setSimCountryCode(e.target.value);
                    const j = jurisdictions.find(item => item.countryCode === e.target.value);
                    if (j && j.activeTemplateIds[0]) {
                      setSimTemplateId(j.activeTemplateIds[0]);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                >
                  {jurisdictions.map(j => (
                    <option key={j.countryCode} value={j.countryCode}>
                      {j.flag} {j.countryName} ({j.countryCode}) — {j.regulatorAgency}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Regulatory Schema Template</label>
                <select
                  value={simTemplateId}
                  onChange={(e) => setSimTemplateId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.format}] {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Simulated Payload (JSON / XML)</label>
                  <button
                    onClick={() => {
                      const t = templates.find(item => item.id === simTemplateId);
                      if (t) setSimPayload(t.samplePayload);
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Reset to Default Schema
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={simPayload}
                  onChange={(e) => setSimPayload(e.target.value)}
                  className="w-full bg-slate-900 text-indigo-300 font-mono text-[11px] rounded-xl p-3 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                  placeholder="Paste or write synthetic test payload..."
                />
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 text-amber-300 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'Executing Enclave Dry-Run...' : 'Run Sandbox Validation & AI Adjudication'}</span>
              </button>
            </div>
          </div>

          {/* Simulation Output & Results */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  Regulatory Conformity Report & AI Verdict
                </h3>
                {simResult && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                    simResult.status === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                    simResult.status === 'PROVISIONAL_PASS' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                    'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}>
                    {simResult.status} ({simResult.overallScore}%)
                  </span>
                )}
              </div>

              {simResult ? (
                <div className="mt-4 space-y-4">
                  {/* Top Score Banner */}
                  <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {simResult.countryName} Regulatory Enclave: {simResult.templateName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        Cryptographic Proof: <code className="text-indigo-600 dark:text-indigo-400">{simResult.cryptographicProof}</code>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Conformity Score</span>
                      <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                        {simResult.overallScore}%
                      </div>
                    </div>
                  </div>

                  {/* Itemized Checks */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Itemized Statutory Inspections</span>
                    {simResult.validationChecks.map((check, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start space-x-2.5">
                          {check.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{check.name}</div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{check.details}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-slate-400 shrink-0">
                          {check.statutoryRef}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* AI Summary Box */}
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs flex items-start space-x-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">AI Autonomous Adjudication Verdict:</span>
                      <p className="text-indigo-800 dark:text-indigo-300 mt-0.5 text-[11px] leading-relaxed">
                        {simResult.aiAdjudicationSummary}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <Box className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs">Configure your payload and click "Run Sandbox Validation & AI Adjudication" to simulate a live B2G filing dry-run.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TELEMETRY & AUDIT TRAIL */}
      {activeTab === 'TELEMETRY' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-500" />
                Sandbox Validation Telemetry Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Immutable record of pre-clearance simulation runs, test dossier validations, and auto-adjudication verdicts.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{simulationHistory.length} Test Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-2">Execution Ref</th>
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Jurisdiction</th>
                  <th className="pb-2">Schema Dossier</th>
                  <th className="pb-2">Conformity Score</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Proof Seal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-slate-700 dark:text-slate-300">
                {simulationHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-slate-100">{item.id}</td>
                    <td className="py-3 text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3">{item.countryName} ({item.countryCode})</td>
                    <td className="py-3 font-sans truncate max-w-[200px]">{item.templateName}</td>
                    <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">{item.overallScore}%</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        item.status === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-400 truncate max-w-[150px]">{item.cryptographicProof}</td>
                  </tr>
                ))}
                {simulationHistory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                      No simulations logged in this session yet. Launch a dry-run in the Simulator tab.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: EDIT JURISDICTION RULE */}
      <AnimatePresence>
        {isEditRuleModalOpen && editingRule && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-500" />
                  Configure Sandbox Rules: {editingRule.flag} {editingRule.countryName} ({editingRule.countryCode})
                </h3>
                <button onClick={() => setIsEditRuleModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
              </div>

              <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Sandbox Isolation Enclave Mode</label>
                  <select
                    value={editingRule.isolationLevel}
                    onChange={(e) => setEditingRule({ ...editingRule, isolationLevel: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-medium"
                  >
                    <option value="STRICT_AIR_GAP">STRICT_AIR_GAP (Zero External Network Egress)</option>
                    <option value="SYNTHETIC_ENCLAVE">SYNTHETIC_ENCLAVE (Synthetic Mock Datasets Only)</option>
                    <option value="DIFF_PRIVACY_TUNNEL">DIFF_PRIVACY_TUNNEL (Differential Privacy Masked)</option>
                    <option value="HYBRID_FEDERATED">HYBRID_FEDERATED (Federated Parameter Weights)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Max Duration (Days)</label>
                    <input
                      type="number"
                      value={editingRule.maxTestingDurationDays}
                      onChange={(e) => setEditingRule({ ...editingRule, maxTestingDurationDays: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Differential Privacy (ε)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={editingRule.diffPrivacyEpsilon}
                      onChange={(e) => setEditingRule({ ...editingRule, diffPrivacyEpsilon: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Max Synthetic Records</label>
                    <input
                      type="number"
                      value={editingRule.maxSyntheticRecords}
                      onChange={(e) => setEditingRule({ ...editingRule, maxSyntheticRecords: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Auto-Adjudication Pass Threshold (%)</label>
                    <input
                      type="number"
                      value={editingRule.autoAdjudicationThreshold}
                      onChange={(e) => setEditingRule({ ...editingRule, autoAdjudicationThreshold: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assigned Regulatory Templates</label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    {templates.map(t => {
                      const isChecked = editingRule.activeTemplateIds.includes(t.id);
                      return (
                        <label key={t.id} className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-200">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditingRule({ ...editingRule, activeTemplateIds: [...editingRule.activeTemplateIds, t.id] });
                              } else {
                                setEditingRule({ ...editingRule, activeTemplateIds: editingRule.activeTemplateIds.filter(id => id !== t.id) });
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-medium text-[11px]">{t.name} ({t.format})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.autoAdjudicateWithAI}
                      onChange={(e) => setEditingRule({ ...editingRule, autoAdjudicateWithAI: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Enable AI Autonomous Inspector</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.requiresDualRegulatorSignoff}
                      onChange={(e) => setEditingRule({ ...editingRule, requiresDualRegulatorSignoff: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Require Dual Regulator Sign-Off</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditRuleModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Save Jurisdiction Rules
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CREATE / EDIT TEMPLATE */}
      <AnimatePresence>
        {isTemplateModalOpen && editingTemplate && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-indigo-500" />
                  {editingTemplate.name ? 'Edit Regulatory Schema Template' : 'Create New B2G Filing Template'}
                </h3>
                <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
              </div>

              <form onSubmit={handleSaveTemplate} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EU AI Act Art. 52 High-Risk Model Dossier"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Category</label>
                    <select
                      value={editingTemplate.category}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-medium"
                    >
                      <option value="AI_GOVERNANCE">AI_GOVERNANCE</option>
                      <option value="CYBER_RESILIENCE">CYBER_RESILIENCE</option>
                      <option value="DATA_PRIVACY">DATA_PRIVACY</option>
                      <option value="FINANCIAL_INTEGRITY">FINANCIAL_INTEGRITY</option>
                      <option value="CRITICAL_INFRASTRUCTURE">CRITICAL_INFRASTRUCTURE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">File Format</label>
                    <select
                      value={editingTemplate.format}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, format: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-medium"
                    >
                      <option value="JSON_LD">JSON_LD</option>
                      <option value="EU_XML_SDMX">EU_XML_SDMX</option>
                      <option value="CB_XBRLE">CB_XBRLE</option>
                      <option value="PROTOBUF_SEALED">PROTOBUF_SEALED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Schema Version</label>
                    <input
                      type="text"
                      value={editingTemplate.schemaVersion}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, schemaVersion: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Cryptographic Seal</label>
                    <select
                      value={editingTemplate.hashVerification}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, hashVerification: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-medium"
                    >
                      <option value="SHA256">SHA256</option>
                      <option value="SHA512_HMAC">SHA512_HMAC</option>
                      <option value="ZK_SNARK_GROTH16">ZK_SNARK_GROTH16</option>
                      <option value="PQC_DILITHIUM">PQC_DILITHIUM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Mandatory Fields (Comma separated)</label>
                  <input
                    type="text"
                    value={editingTemplate.mandatoryFields.join(', ')}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, mandatoryFields: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Statutory Articles (Comma separated)</label>
                  <input
                    type="text"
                    value={editingTemplate.statutoryArticles.join(', ')}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, statutoryArticles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Sample Dossier Payload</label>
                  <textarea
                    rows={4}
                    value={editingTemplate.samplePayload}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, samplePayload: e.target.value })}
                    className="w-full bg-slate-900 text-indigo-300 font-mono text-[11px] rounded-xl p-2.5 border border-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Save Template
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
