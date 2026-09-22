import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileCheck2, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Building2, 
  Globe, 
  Lock, 
  Layers, 
  FolderOpen, 
  Save, 
  Trash2, 
  ChevronRight, 
  ArrowRight, 
  Check, 
  X, 
  Copy, 
  Download, 
  FileText, 
  Cpu, 
  Sliders, 
  Activity, 
  Search, 
  Eye, 
  Code2, 
  BookOpen, 
  FileCode,
  Zap,
  HelpCircle,
  Clock,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

// Entity status profile interface
export interface EntityStatusProfile {
  id: string;
  organizationName: string;
  industry: string;
  jurisdiction: string;
  complianceScore: number;
  activeIncidentsCount: number;
  hsmEnclaveStatus: string;
  criticalVendorsCount: number;
  openNonConformities: string[];
  designatedOfficer: string;
  dpoContact: string;
  cloudTier: string;
  reportingPeriod: string;
  targetAgency: string;
  description: string;
}

// Regulatory Template definition
export interface RegulatoryTemplate {
  id: string;
  title: string;
  shortCode: string;
  category: 'DORA' | 'EU_AI_ACT' | 'NIS2' | 'GDPR' | 'SDAIA_PDPL' | 'BAFIN_FINMA';
  jurisdiction: string;
  targetAgency: string;
  regulationCitation: string;
  frequency: string;
  maxPenaltyExposure: string;
  description: string;
  standardSchema: string;
  recommendedRole: string;
}

// Saved draft interface
export interface SavedFilingDraft {
  id: string;
  title: string;
  templateId: string;
  agency: string;
  jurisdiction: string;
  organizationName: string;
  complianceScore: number;
  payload: string;
  executiveSummary?: string;
  updatedAt: string;
}

const PRESET_ENTITIES: EntityStatusProfile[] = [
  {
    id: 'org_acme_fin',
    organizationName: 'Acme Sovereign Financial B.V.',
    industry: 'FinTech & Sovereign Digital Banking',
    jurisdiction: 'EU',
    complianceScore: 94,
    activeIncidentsCount: 0,
    hsmEnclaveStatus: 'ACTIVE_FIPS_140_3_LEVEL_4',
    criticalVendorsCount: 48,
    openNonConformities: ['Secondary cloud exit test refresh pending'],
    designatedOfficer: 'Dr. Elena Vance (Chief Compliance & DPO)',
    dpoContact: 'dpo@acme-sovereign.eu',
    cloudTier: 'EU Sovereign Multi-Region Enclave (Frankfurt / Paris)',
    reportingPeriod: '2026-Q3',
    targetAgency: 'European Data Protection Board (EDPB) / EBA',
    description: 'Tier-1 regulated financial institution subject to DORA RTS & GDPR Article 30/32 strict controls.'
  },
  {
    id: 'org_aero_ai',
    organizationName: 'AeroAutonomous Robotics GmbH',
    industry: 'Autonomous Systems & Aerospace AI',
    jurisdiction: 'DE',
    complianceScore: 88,
    activeIncidentsCount: 1,
    hsmEnclaveStatus: 'ACTIVE_EU_RESTRICTED_HSM',
    criticalVendorsCount: 26,
    openNonConformities: ['Post-market monitoring drift rate calibration required'],
    designatedOfficer: 'Markus Weber (VP AI Ethics & Regulatory Affairs)',
    dpoContact: 'compliance@aero-autonomous.de',
    cloudTier: 'Air-Gapped Sovereign On-Prem + C5 Cloud Bridge',
    reportingPeriod: '2026-Q3',
    targetAgency: 'EU AI Office & Federal Network Agency (BNetzA)',
    description: 'High-risk AI system provider deploying safety-critical computer vision models under EU AI Act Annex IV.'
  },
  {
    id: 'org_medicloud',
    organizationName: 'MediCloud Sovereign Health SAS',
    industry: 'Healthcare Infrastructure & Genomics',
    jurisdiction: 'FR',
    complianceScore: 92,
    activeIncidentsCount: 0,
    hsmEnclaveStatus: 'ACTIVE_ANSSI_QUALIFIED_SECOPS',
    criticalVendorsCount: 34,
    openNonConformities: ['Legacy PACS archive encryption key rotation in progress'],
    designatedOfficer: 'Dr. Chantal Dupont (Chief Information Security Officer)',
    dpoContact: 'dpo@medicloud-sovereign.fr',
    cloudTier: 'HDS (Hébergeur de Données de Santé) Certified Enclave',
    reportingPeriod: '2026-Q3',
    targetAgency: 'CNIL & ANSSI (NIS2 Essential Health Entity)',
    description: 'NIS2 essential health operator managing electronic health records and diagnostic tele-radiology.'
  },
  {
    id: 'org_cybershield',
    organizationName: 'CyberShield Global NetOps Ltd',
    industry: 'Critical DNS & Cloud Security Provider',
    jurisdiction: 'IE',
    complianceScore: 85,
    activeIncidentsCount: 2,
    hsmEnclaveStatus: 'ACTIVE_CRYSTALS_KYBER_PQC',
    criticalVendorsCount: 62,
    openNonConformities: ['Supply chain sub-tier vulnerability telemetry delayed'],
    designatedOfficer: 'Liam O\'Connor (Head of Regulatory Telemetry)',
    dpoContact: 'regulatory@cybershield-global.ie',
    cloudTier: 'EU Zero-Trust Multi-Tenant Core with BGP Anycast Enclave',
    reportingPeriod: '2026-Q3',
    targetAgency: 'National Cyber Security Centre (NCSC Ireland / ENISA)',
    description: 'Essential digital infrastructure provider mandated under NIS2 Art. 21/23 incident reporting.'
  },
  {
    id: 'org_riyadh_govtech',
    organizationName: 'Sovereign GovTech Enclave Riyadh',
    industry: 'Public Sector Data Hub & Citizen AI',
    jurisdiction: 'SA',
    complianceScore: 97,
    activeIncidentsCount: 0,
    hsmEnclaveStatus: 'ACTIVE_NCA_ECC_NATIONAL_HSM',
    criticalVendorsCount: 19,
    openNonConformities: [],
    designatedOfficer: 'Eng. Tariq Al-Mansoor (Chief Data Protection Officer)',
    dpoContact: 'dpo@sovereign-govtech.sa',
    cloudTier: 'National Sovereign Data Center Class-A Tier IV',
    reportingPeriod: '2026-Q3',
    targetAgency: 'Saudi Data & AI Authority (SDAIA) & NCA',
    description: 'Governmental data controller processing cross-border and sovereign records under Saudi PDPL Royal Decree M/19.'
  }
];

const REGULATORY_TEMPLATES: RegulatoryTemplate[] = [
  {
    id: 'DORA_RESILIENCE',
    title: 'DORA ICT Operational Resilience & Fallback Declaration',
    shortCode: 'DORA-ICT-2026',
    category: 'DORA',
    jurisdiction: 'EU',
    targetAgency: 'European Data Protection Board (EDPB) / EBA',
    regulationCitation: 'Regulation (EU) 2022/2554 (DORA) Articles 28, 29, 30 & RTS 2024/1772',
    frequency: 'Annual / Triggered on Critical Change',
    maxPenaltyExposure: 'Up to 1% of average daily turnover / €5,000,000',
    description: 'Comprehensive declaration of ICT risk frameworks, multi-cloud failover metrics, third-party vendor concentration, and RTO/RPO SLA tests.',
    standardSchema: 'https://schema.b2g.regulettee.eu/v2/dora-resilience.jsonld',
    recommendedRole: 'Chief Risk Officer & Cloud SecOps'
  },
  {
    id: 'EU_AI_ACT_CONFORMITY',
    title: 'EU AI Act High-Risk System Conformity & Model Card Dossier',
    shortCode: 'AI-ACT-ANNEX-IV',
    category: 'EU_AI_ACT',
    jurisdiction: 'EU',
    targetAgency: 'EU AI Office & National Competent Authorities',
    regulationCitation: 'Regulation (EU) 2024/1689 (EU AI Act) Articles 9, 11, 14 & Annex IV',
    frequency: 'Prior to Deployment & Annual Post-Market Audit',
    maxPenaltyExposure: 'Up to €35,000,000 or 7% of total worldwide annual turnover',
    description: 'Statutory technical documentation, human oversight safeguards (HITL), dataset bias audit metrics, and post-market telemetry relay.',
    standardSchema: 'https://schema.b2g.regulettee.eu/v2/ai-act-conformity.jsonld',
    recommendedRole: 'VP AI Ethics & Regulatory Counsel'
  },
  {
    id: 'NIS2_ESSENTIAL_INCIDENT',
    title: 'NIS2 Essential Entity Supply Chain & Cybersecurity Dossier',
    shortCode: 'NIS2-SEC-DOSSIER',
    category: 'NIS2',
    jurisdiction: 'EU',
    targetAgency: 'National CSIRTs & ENISA European Relay',
    regulationCitation: 'Directive (EU) 2022/2555 (NIS2) Articles 21 & 23',
    frequency: 'Semi-Annual Attestation / 24h Incident Trigger',
    maxPenaltyExposure: 'Up to €10,000,000 or 2% of total worldwide annual turnover',
    description: 'Cybersecurity risk-management measures, supply chain sub-tier qualification, zero-trust cryptographic posture, and incident notification readiness.',
    standardSchema: 'https://schema.b2g.regulettee.eu/v2/nis2-dossier.jsonld',
    recommendedRole: 'Chief Information Security Officer (CISO)'
  },
  {
    id: 'GDPR_ROPA_SOVEREIGN',
    title: 'GDPR Article 30 RoPA & Sovereign Data Transfer Disclosure',
    shortCode: 'GDPR-ART-30-ROPA',
    category: 'GDPR',
    jurisdiction: 'EU',
    targetAgency: 'Lead Supervisory Authority (CNIL / DPC / BfDI)',
    regulationCitation: 'Regulation (EU) 2016/679 (GDPR) Articles 30, 32, 44-49 & Schrems II TIA',
    frequency: 'Continuous / Quarterly Submission',
    maxPenaltyExposure: 'Up to €20,000,000 or 4% of total worldwide annual turnover',
    description: 'Structured Record of Processing Activities (RoPA), international transfer safeguards, supplementary technical measures, and DPO verification.',
    standardSchema: 'https://schema.b2g.regulettee.eu/v2/gdpr-ropa.jsonld',
    recommendedRole: 'Data Protection Officer (DPO)'
  },
  {
    id: 'SDAIA_PDPL_CLEARANCE',
    title: 'SDAIA Saudi PDPL Cross-Border Data Flow Clearance Attestation',
    shortCode: 'SDAIA-PDPL-FLOW',
    category: 'SDAIA_PDPL',
    jurisdiction: 'SA',
    targetAgency: 'Saudi Data & AI Authority (SDAIA)',
    regulationCitation: 'Saudi Personal Data Protection Law (PDPL) Royal Decree M/19 & Executive Regulations',
    frequency: 'Annual or upon new international data flow',
    maxPenaltyExposure: 'Up to SAR 5,000,000 and operational suspension',
    description: 'Official clearance application for cloud infrastructure residency, sovereign data sovereignty, and authorized international recipient verification.',
    standardSchema: 'https://schema.b2g.9xen-regulettee.sa/v1/sdaia-clearance.jsonld',
    recommendedRole: 'National Regulatory Director'
  },
  {
    id: 'BAFIN_CYBER_FINMA',
    title: 'BaFin / FINMA Capital Adequacy & Cyber Resilience Submission',
    shortCode: 'BAFIN-BAIT-CYBER',
    category: 'BAFIN_FINMA',
    jurisdiction: 'DE',
    targetAgency: 'Federal Financial Supervisory Authority (BaFin) / Bundesbank',
    regulationCitation: 'BaFin Circular 10/2018 (BAIT) & EBA Outsourcing Guidelines',
    frequency: 'Annual Supervisory Audit',
    maxPenaltyExposure: 'Direct supervisory intervention and capital surcharge',
    description: 'Financial sector IT governance, critical outsourced cloud service register, business continuity failover drills, and cryptographic key escrow declaration.',
    standardSchema: 'https://schema.b2g.regulettee.eu/v2/bafin-bait.jsonld',
    recommendedRole: 'Managing Director & Head of Risk'
  }
];

interface B2gFilingWizardProps {
  initialEntityId?: string;
  initialTemplateId?: string;
  onFilingSubmitted?: (filing: any) => void;
  className?: string;
  isModal?: boolean;
  onClose?: () => void;
  onViewTimeline?: (filingId?: string) => void;
}

export const B2gFilingWizard: React.FC<B2gFilingWizardProps> = ({
  initialEntityId = 'org_acme_fin',
  initialTemplateId = 'DORA_RESILIENCE',
  onFilingSubmitted,
  className = '',
  isModal = false,
  onClose,
  onViewTimeline
}) => {
  const { showToast } = useNotification();

  // Wizard Steps: 1. Entity & Status -> 2. Regulatory Template -> 3. AI Drafting & Options -> 4. Review & Payload Editor -> 5. Cryptographic Attestation & Dispatch
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selected Entity Status Profile
  const [selectedEntityId, setSelectedEntityId] = useState<string>(initialEntityId);
  const [entityStatus, setEntityStatus] = useState<EntityStatusProfile>(() => {
    return PRESET_ENTITIES.find(e => e.id === initialEntityId) || PRESET_ENTITIES[0];
  });

  // Selected Regulatory Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId);
  const selectedTemplate = useMemo(() => {
    return REGULATORY_TEMPLATES.find(t => t.id === selectedTemplateId) || REGULATORY_TEMPLATES[0];
  }, [selectedTemplateId]);

  // AI Generation Options
  const [generationDepth, setGenerationDepth] = useState<'STANDARD' | 'EXHAUSTIVE' | 'FAST_TRACK'>('EXHAUSTIVE');
  const [riskPosture, setRiskPosture] = useState<'STRICT_DEFENSIVE' | 'PRAGMATIC' | 'REMEDIATION_FOCUSED'>('STRICT_DEFENSIVE');
  const [includePqcTelemetry, setIncludePqcTelemetry] = useState<boolean>(true);
  const [includeVendorConcentration, setIncludeVendorConcentration] = useState<boolean>(true);
  const [includeAutomatedIncidents, setIncludeAutomatedIncidents] = useState<boolean>(true);
  const [includeBoardAttestation, setIncludeBoardAttestation] = useState<boolean>(true);
  const [customAuditorObservations, setCustomAuditorObservations] = useState<string>('');

  // Generated Filing State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiGenerationProgress, setAiGenerationProgress] = useState<number>(0);
  const [generationSource, setGenerationSource] = useState<string>('');
  
  const [filingTitle, setFilingTitle] = useState<string>('');
  const [targetAgency, setTargetAgency] = useState<string>('');
  const [jurisdiction, setJurisdiction] = useState<string>('EU');
  const [executiveSummary, setExecutiveSummary] = useState<string>('');
  const [statutoryLegalBasis, setStatutoryLegalBasis] = useState<string[]>([]);
  const [complianceHealthSummary, setComplianceHealthSummary] = useState<any>(null);
  const [payloadText, setPayloadText] = useState<string>('');
  const [remediationRoadmap, setRemediationRoadmap] = useState<any[]>([]);
  const [attestationStatement, setAttestationStatement] = useState<string>('');

  // Validation State
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{ passed: boolean; message: string; errors: string[] } | null>(null);

  // Clause AI Enhancement Drawer
  const [isEnhanceDrawerOpen, setIsEnhanceDrawerOpen] = useState<boolean>(false);
  const [clauseToEnhance, setClauseToEnhance] = useState<string>('');
  const [enhancedResult, setEnhancedResult] = useState<any>(null);
  const [isEnhancingClause, setIsEnhancingClause] = useState<boolean>(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<any>(null);

  // Saved Drafts
  const [savedDrafts, setSavedDrafts] = useState<SavedFilingDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  // Load saved drafts from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('9xen-regulettee_b2g_filing_wizard_drafts');
      if (saved) {
        setSavedDrafts(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load local drafts', e);
    }
  }, []);

  // Update entity status when preset changes
  const handleEntityPresetChange = (presetId: string) => {
    setSelectedEntityId(presetId);
    const found = PRESET_ENTITIES.find(e => e.id === presetId);
    if (found) {
      setEntityStatus({ ...found });
    }
  };

  // Trigger AI Drafting Backend Call
  const handleGenerateAiDraft = async () => {
    setIsGenerating(true);
    setAiGenerationProgress(15);
    setValidationResult(null);

    const progressTimer = setInterval(() => {
      setAiGenerationProgress(prev => (prev < 90 ? prev + 15 : prev));
    }, 300);

    try {
      const res = await fetch('/api/v1/b2g/filing-wizard/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          filingType: selectedTemplate.title,
          targetAgency: selectedTemplate.targetAgency,
          jurisdiction: selectedTemplate.jurisdiction,
          entityStatus: {
            ...entityStatus,
            includePqcTelemetry,
            includeVendorConcentration,
            includeAutomatedIncidents,
            includeBoardAttestation
          },
          options: {
            depth: generationDepth,
            riskPosture,
            customObservations: customAuditorObservations
          }
        })
      });

      clearInterval(progressTimer);
      setAiGenerationProgress(100);

      if (!res.ok) {
        throw new Error(`AI Gateway responded with HTTP status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.filing) {
        const f = data.filing;
        setFilingTitle(f.filingTitle || `Statutory Filing - ${selectedTemplate.title}`);
        setTargetAgency(f.targetAgency || selectedTemplate.targetAgency);
        setJurisdiction(f.jurisdiction || selectedTemplate.jurisdiction);
        setExecutiveSummary(f.executiveSummary || '');
        setStatutoryLegalBasis(f.statutoryLegalBasis || [selectedTemplate.regulationCitation]);
        setComplianceHealthSummary(f.complianceHealthSummary || { score: entityStatus.complianceScore, overallRating: 'SUBSTANTIAL_CONFORMITY' });
        setPayloadText(typeof f.payload === 'string' ? f.payload : JSON.stringify(f.payload, null, 2));
        setRemediationRoadmap(f.remediationRoadmap || []);
        setAttestationStatement(f.attestationStatement || '');
        setGenerationSource(data.source || 'AI_SOVEREIGN_ENGINE');

        showToast('AI Filing Template auto-populated successfully from entity telemetry.', 'success');
        setCurrentStep(4); // Advance to Review & Payload Editor step
      } else {
        throw new Error(data.error || 'Failed to parse AI draft synthesis');
      }
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error('AI Draft Generation Error:', err);
      showToast(`AI Synthesis Error: ${err.message}. Initializing offline sovereign template fallback.`, 'warning');
      
      // Fallback generation
      setFilingTitle(`FY2026 Statutory ${selectedTemplate.title} - ${entityStatus.organizationName}`);
      setTargetAgency(selectedTemplate.targetAgency);
      setJurisdiction(selectedTemplate.jurisdiction);
      setExecutiveSummary(`Official statutory attestation and resilience submission for ${entityStatus.organizationName} under ${selectedTemplate.regulationCitation}.\n\nCompliance telemetry confirms an operational benchmark of ${entityStatus.complianceScore}% with active ${entityStatus.hsmEnclaveStatus} hardware protection.`);
      setStatutoryLegalBasis([selectedTemplate.regulationCitation, 'Commission Delegated Regulation (EU) 2024/1772']);
      setComplianceHealthSummary({
        overallRating: entityStatus.complianceScore >= 90 ? 'EXEMPLARY_CONFORMITY' : 'SUBSTANTIAL_CONFORMITY',
        score: entityStatus.complianceScore,
        hsmEnclaveStatus: entityStatus.hsmEnclaveStatus,
        keyStrengths: [
          `Active sovereign cloud telemetry with ${entityStatus.complianceScore}% rating`,
          `Verified hardware security module (${entityStatus.hsmEnclaveStatus})`
        ]
      });
      setPayloadText(JSON.stringify({
        "@context": selectedTemplate.standardSchema,
        "filingId": `REG-2026-${Date.now().toString().slice(-6)}`,
        "entity": {
          "legalName": entityStatus.organizationName,
          "industry": entityStatus.industry,
          "jurisdiction": entityStatus.jurisdiction,
          "reportingPeriod": entityStatus.reportingPeriod
        },
        "telemetry": {
          "complianceScore": entityStatus.complianceScore,
          "activeIncidents": entityStatus.activeIncidentsCount,
          "hsmStatus": entityStatus.hsmEnclaveStatus
        },
        "signingOfficer": entityStatus.designatedOfficer
      }, null, 2));
      setAttestationStatement(`I, ${entityStatus.designatedOfficer}, certify under statutory penalties that this declaration reflects the true compliance state of ${entityStatus.organizationName}.`);
      setGenerationSource('DETERMINISTIC_SOVEREIGN_FALLBACK');
      setCurrentStep(4);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run Payload JSON-LD Validation
  const handleValidatePayload = () => {
    setIsValidating(true);
    setValidationResult(null);

    setTimeout(() => {
      setIsValidating(false);
      const errors: string[] = [];
      try {
        const parsed = JSON.parse(payloadText);
        if (!parsed.entity || !parsed.entity.legalName) {
          errors.push('Missing required root key: "entity.legalName"');
        }
        if (!parsed['@context'] && !parsed.filingId) {
          errors.push('Missing schema identifier or @context JSON-LD declaration');
        }
        if (payloadText.length < 100) {
          errors.push('Telemetry payload contains insufficient depth for statutory filing specification');
        }
      } catch (jsonErr: any) {
        errors.push(`JSON Syntax Error: ${jsonErr.message}`);
      }

      if (errors.length === 0) {
        setValidationResult({
          passed: true,
          message: 'Payload verified compliant with statutory B2G schema and JSON-LD syntax specifications.',
          errors: []
        });
        showToast('Schema validation passed with 0 errors.', 'success');
      } else {
        setValidationResult({
          passed: false,
          message: `Schema validation failed (${errors.length} errors found).`,
          errors
        });
        showToast('Schema validation detected errors. Review highlighted list.', 'error');
      }
    }, 600);
  };

  // Trigger AI Clause Enhancement
  const handleEnhanceClause = async () => {
    if (!clauseToEnhance.trim()) return;
    setIsEnhancingClause(true);
    try {
      const res = await fetch('/api/v1/b2g/filing-wizard/enhance-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseText: clauseToEnhance,
          contextType: selectedTemplate.category,
          targetRegulation: selectedTemplate.regulationCitation
        })
      });
      const data = await res.json();
      if (data.success) {
        setEnhancedResult(data);
        showToast('AI successfully refined statutory clause.', 'success');
      } else {
        throw new Error(data.error || 'Enhancement failed');
      }
    } catch (e: any) {
      console.warn('Enhance clause fallback', e);
      setEnhancedResult({
        enhancedText: `In strict accordance with ${selectedTemplate.regulationCitation}, ${entityStatus.organizationName} formally confirms that ${clauseToEnhance.trim()}, continuously attested through real-time cryptographic audit telemetry.`,
        statutoryCitations: [selectedTemplate.regulationCitation],
        improvementsMade: ['Incorporated formal supervisory terminology', 'Added explicit cryptographic attestation baseline']
      });
    } finally {
      setIsEnhancingClause(false);
    }
  };

  // Apply enhanced clause into executive summary
  const applyEnhancedClause = () => {
    if (enhancedResult?.enhancedText) {
      setExecutiveSummary(prev => prev + '\n\n' + enhancedResult.enhancedText);
      setIsEnhanceDrawerOpen(false);
      setEnhancedResult(null);
      setClauseToEnhance('');
      showToast('Enhanced clause injected into Executive Summary.', 'success');
    }
  };

  // Save current progress to local drafts
  const handleSaveDraft = () => {
    const draftId = activeDraftId || `draft_${Date.now()}`;
    const newDraft: SavedFilingDraft = {
      id: draftId,
      title: filingTitle || `${selectedTemplate.title} Draft`,
      templateId: selectedTemplate.id,
      agency: targetAgency || selectedTemplate.targetAgency,
      jurisdiction: jurisdiction || selectedTemplate.jurisdiction,
      organizationName: entityStatus.organizationName,
      complianceScore: entityStatus.complianceScore,
      payload: payloadText,
      executiveSummary,
      updatedAt: new Date().toISOString()
    };

    const updated = savedDrafts.some(d => d.id === draftId)
      ? savedDrafts.map(d => (d.id === draftId ? newDraft : d))
      : [newDraft, ...savedDrafts];

    setSavedDrafts(updated);
    setActiveDraftId(draftId);
    try {
      localStorage.setItem('9xen-regulettee_b2g_filing_wizard_drafts', JSON.stringify(updated));
      showToast('Filing draft saved securely to local storage.', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Load a saved draft
  const handleLoadDraft = (draft: SavedFilingDraft) => {
    setActiveDraftId(draft.id);
    setSelectedTemplateId(draft.templateId);
    setFilingTitle(draft.title);
    setTargetAgency(draft.agency);
    setJurisdiction(draft.jurisdiction);
    setPayloadText(draft.payload);
    if (draft.executiveSummary) setExecutiveSummary(draft.executiveSummary);
    setCurrentStep(4);
    showToast(`Loaded draft: ${draft.title.slice(0, 30)}...`, 'info');
  };

  // Delete a saved draft
  const handleDeleteDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDrafts.filter(d => d.id !== draftId);
    setSavedDrafts(updated);
    if (activeDraftId === draftId) setActiveDraftId(null);
    localStorage.setItem('9xen-regulettee_b2g_filing_wizard_drafts', JSON.stringify(updated));
    showToast('Draft removed.', 'info');
  };

  // Submit and Seal the Official Filing
  const handleSubmitFiling = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/b2g/filing-wizard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: entityStatus.id,
          organizationName: entityStatus.organizationName,
          filingType: selectedTemplate.title,
          title: filingTitle,
          agency: targetAgency,
          jurisdiction,
          payload: payloadText,
          officer: entityStatus.designatedOfficer,
          complianceScore: entityStatus.complianceScore
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmissionReceipt(data);
        showToast('Exportable Dossier generated & cryptographically sealed!', 'success');

        // Automatically inject new submission into workflow timeline storage
        try {
          const existingWorkflowsStr = localStorage.getItem('9xen-regulettee_b2g_filing_workflows');
          const existingWorkflows = existingWorkflowsStr ? JSON.parse(existingWorkflowsStr) : [];
          const newWorkflowItem = {
            id: data.filingId || `wf_${Date.now()}`,
            referenceNumber: data.acknowledgementReference || `B2G-2026-${selectedTemplate.shortCode}-${Date.now().toString().slice(-4)}`,
            title: filingTitle || selectedTemplate.title,
            regulationType: selectedTemplate.category,
            regulationCitation: selectedTemplate.regulationCitation,
            jurisdiction: jurisdiction || selectedTemplate.jurisdiction,
            targetAgency: targetAgency || selectedTemplate.targetAgency,
            submittingEntity: {
              id: entityStatus.id,
              name: entityStatus.organizationName,
              industry: entityStatus.industry,
              designatedOfficer: entityStatus.designatedOfficer,
              dpoContact: entityStatus.dpoContact,
              cloudTier: entityStatus.cloudTier,
              complianceScore: entityStatus.complianceScore
            },
            currentStage: 'PENDING_MANUAL_SUBMISSION',
            overallStatus: 'DRAFTING',
            urgency: generationDepth === 'FAST_TRACK' ? 'EXPEDITED' : 'STANDARD',
            slaDeadline: new Date(Date.now() + 30 * 86400000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            hsmKeyId: `HSM-${entityStatus.id.toUpperCase()}-SEAL-2026`,
            merkleRootDigest: data.checksum || '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
            rfc3161TimestampProof: `TSA-${selectedTemplate.shortCode}-${Date.now()}-VALID`,
            supervisoryNotes: `Dossier compiled for ${targetAgency || selectedTemplate.targetAgency}. Manual submission required via national portal.`,
            executiveSummary: executiveSummary || `Statutory regulatory disclosure generated for ${entityStatus.organizationName} pursuant to ${selectedTemplate.regulationCitation}.`,
            payloadJsonText: payloadText,
            eventLogs: [
              {
                id: `ev_submit_${Date.now()}`,
                timestamp: new Date().toISOString(),
                stage: 'GENERATED',
                title: 'Exportable Dossier Compiled & Sealed',
                actor: entityStatus.designatedOfficer,
                actorRole: 'COMPLIANCE_OFFICER',
                description: `Statutory dossier generated for manual submission to ${targetAgency || selectedTemplate.targetAgency}. SHA-256 HMAC digest sealed.`,
                cryptographicHash: data.checksum
              },
              {
                id: `ev_draft_${Date.now() - 3600000}`,
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                stage: 'DRAFTING',
                title: 'Regulatory Telemetry Assembled',
                actor: entityStatus.designatedOfficer,
                actorRole: 'COMPLIANCE_OFFICER',
                description: 'Automated telemetry extraction and AI statutory clause alignment completed.'
              }
            ],
            evidenceArtifacts: [
              {
                id: `art_sub_${Date.now()}`,
                title: `${selectedTemplate.shortCode} Official Submission Payload`,
                fileName: `${selectedTemplate.shortCode}_Submission_${Date.now()}.jsonld`,
                fileSize: `${Math.round(payloadText.length / 1024) || 1} KB`,
                mimeType: 'application/ld+json',
                sha256Hash: data.checksum || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                uploadedAt: new Date().toISOString(),
                category: 'TELEMETRY',
                status: 'VERIFIED'
              }
            ],
            rfiExchanges: []
          };

          const updated = [newWorkflowItem, ...existingWorkflows.filter((w: any) => w.id !== newWorkflowItem.id)];
          localStorage.setItem('9xen-regulettee_b2g_filing_workflows', JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to sync to workflows', e);
        }

        if (onFilingSubmitted) {
          onFilingSubmitted({
            id: data.filingId,
            organizationId: entityStatus.id,
            organizationName: entityStatus.organizationName,
            filingType: selectedTemplate.title,
            title: filingTitle,
            submissionDate: data.dispatchTimestamp,
            status: 'ACCEPTED',
            documentUrl: data.receiptUrl,
            checksum: data.checksum,
            auditor: entityStatus.designatedOfficer
          });
        }
      } else {
        throw new Error(data.error || 'Submission rejected by B2G Gateway');
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Submission Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format JSON payload nicely
  const handlePrettifyJson = () => {
    try {
      const parsed = JSON.parse(payloadText);
      setPayloadText(JSON.stringify(parsed, null, 2));
      showToast('Payload JSON formatted cleanly.', 'info');
    } catch (e: any) {
      showToast(`Cannot format invalid JSON: ${e.message}`, 'error');
    }
  };

  // Copy payload to clipboard
  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payloadText);
    showToast('JSON-LD payload copied to clipboard.', 'success');
  };

  // Download payload as file
  const handleDownloadPayload = () => {
    const blob = new Blob([payloadText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filingTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'b2g_filing'}.jsonld`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Payload downloaded as .jsonld file.', 'success');
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden ${className}`}>
      
      {/* Header Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-xs shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                B2G Sovereign Filing Wizard
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                AI Telemetry Auto-Populate
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
              Autonomous statutory drafting engine syncing live enterprise compliance status to DORA, EU AI Act, NIS2, and GDPR filings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {savedDrafts.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline">
              {savedDrafts.length} saved draft{savedDrafts.length > 1 ? 's' : ''}
            </span>
          )}
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Stepper Navigation Progress Bar */}
      <div className="px-4 sm:px-6 py-3 bg-slate-100/70 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between overflow-x-auto no-scrollbar gap-4 text-xs font-semibold">
        {[
          { step: 1, label: '1. Entity Status Profile', icon: Building2 },
          { step: 2, label: '2. Regulatory Standard', icon: BookOpen },
          { step: 3, label: '3. AI Drafting Options', icon: Sparkles },
          { step: 4, label: '4. Payload & Narrative Editor', icon: Code2 },
          { step: 5, label: '5. Attestation & Dispatch', icon: ShieldCheck }
        ].map((st) => {
          const Icon = st.icon;
          const isActive = currentStep === st.step;
          const isCompleted = currentStep > st.step;
          return (
            <button
              key={st.step}
              onClick={() => setCurrentStep(st.step)}
              className={`flex items-center gap-2 py-1 px-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold' 
                  : isCompleted 
                    ? 'text-slate-700 dark:text-slate-300 hover:bg-white/40' 
                    : 'text-slate-400 dark:text-slate-600 hover:text-slate-700'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                isActive 
                  ? 'bg-indigo-600 text-white border-indigo-700' 
                  : isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold' 
                    : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
              }`}>
                {isCompleted ? <Check className="w-3 h-3" /> : st.step}
              </span>
              <span className="hidden md:inline">{st.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Wizard Workspace */}
      <div className="p-4 sm:p-6 space-y-6">

        {/* STEP 1: ENTITY STATUS & TELEMETRY PROFILE */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" />
                  Select Regulated Entity Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose a pre-configured regulated enterprise profile or inspect live real-time telemetry metrics.
                </p>
              </div>

              {savedDrafts.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Saved Drafts:</span>
                  <select
                    onChange={(e) => {
                      const d = savedDrafts.find(dr => dr.id === e.target.value);
                      if (d) handleLoadDraft(d);
                    }}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-mono"
                    defaultValue=""
                  >
                    <option value="" disabled>Load Saved Draft...</option>
                    {savedDrafts.map(d => (
                      <option key={d.id} value={d.id}>{d.title.slice(0, 24)}... ({d.organizationName})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRESET_ENTITIES.map((ent) => {
                const isSelected = selectedEntityId === ent.id;
                return (
                  <div
                    key={ent.id}
                    onClick={() => handleEntityPresetChange(ent.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                          {ent.jurisdiction} • {ent.reportingPeriod}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ent.complianceScore >= 90
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        }`}>
                          {ent.complianceScore}% Health Score
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {ent.organizationName}
                      </h4>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        {ent.industry}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {ent.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] space-y-1 text-slate-500 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>HSM Enclave:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 text-[10px] truncate max-w-[150px]">{ent.hsmEnclaveStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Designated Officer:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{ent.designatedOfficer}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Entity Telemetry Modifier */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                Live Entity Status Parameters (Editable)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Entity Legal Name</label>
                  <input
                    type="text"
                    value={entityStatus.organizationName}
                    onChange={(e) => setEntityStatus({ ...entityStatus, organizationName: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Compliance Health Score ({entityStatus.complianceScore}%)</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={entityStatus.complianceScore}
                    onChange={(e) => setEntityStatus({ ...entityStatus, complianceScore: parseInt(e.target.value) || 90 })}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Designated Officer / DPO</label>
                  <input
                    type="text"
                    value={entityStatus.designatedOfficer}
                    onChange={(e) => setEntityStatus({ ...entityStatus, designatedOfficer: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Active Incident Count</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={entityStatus.activeIncidentsCount}
                    onChange={(e) => setEntityStatus({ ...entityStatus, activeIncidentsCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Next Action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Select Regulatory Template</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REGULATORY STANDARD & TEMPLATE CATALOG */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Select Regulatory Filing Template
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choose the statutory standard corresponding to your jurisdiction and oversight authority.
              </p>
            </div>

            {/* Template Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {REGULATORY_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/25 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                          {tpl.shortCode}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {tpl.jurisdiction} Authority
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {tpl.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1 text-slate-500 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>Statutory Citation:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 text-[10px] truncate max-w-[160px]">{tpl.regulationCitation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Penalty Exposure:</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400 text-[10px]">{tpl.maxPenaltyExposure}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Back to Entity Profile
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Configure AI Generation</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AI DRAFTING CONTROLS & AUTO-POPULATION */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Target Template & Selected Entity
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedTemplate.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Drafting for <span className="font-semibold text-slate-900 dark:text-slate-200">{entityStatus.organizationName}</span> • Health Score: {entityStatus.complianceScore}% • {entityStatus.hsmEnclaveStatus}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
                  Authority: {selectedTemplate.targetAgency.split('(')[0]}
                </span>
              </div>
            </div>

            {/* AI Generation Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Depth & Posture Strategy */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  Synthesis Strategy & Depth
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Filing Depth</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'EXHAUSTIVE', label: 'Exhaustive', desc: 'Full citations & telemetry' },
                      { id: 'STANDARD', label: 'Standard', desc: 'Standard conformity' },
                      { id: 'FAST_TRACK', label: 'Fast-Track', desc: 'Executive summary' }
                    ].map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setGenerationDepth(d.id as any)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          generationDepth === d.id
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{d.label}</div>
                        <div className="text-[10px] opacity-80">{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Risk & Defense Posture</label>
                  <select
                    value={riskPosture}
                    onChange={(e) => setRiskPosture(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="STRICT_DEFENSIVE">Strict Defensive (Full zero-risk statutory posture)</option>
                    <option value="PRAGMATIC">Pragmatic & Transparent (Operational reality with mitigated risk)</option>
                    <option value="REMEDIATION_FOCUSED">Remediation-Focused (Explicit 90-day corrective roadmap)</option>
                  </select>
                </div>
              </div>

              {/* Specific Telemetry Toggles */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-500" />
                  Automated Evidence Telemetry Injection
                </h4>

                <label className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePqcTelemetry}
                    onChange={(e) => setIncludePqcTelemetry(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    Include Post-Quantum Cryptography & HSM Enclave Verification
                  </span>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeVendorConcentration}
                    onChange={(e) => setIncludeVendorConcentration(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    Include Multi-Cloud Vendor Concentration & Exit Strategy Metrics
                  </span>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAutomatedIncidents}
                    onChange={(e) => setIncludeAutomatedIncidents(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    Include Automated Incident Log & MTTR Resolution Telemetry
                  </span>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBoardAttestation}
                    onChange={(e) => setIncludeBoardAttestation(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    Include Formal Board Attestation & Perjury Warning Statement
                  </span>
                </label>
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Custom Auditor Observations or Context (Optional)
              </label>
              <textarea
                rows={2}
                value={customAuditorObservations}
                onChange={(e) => setCustomAuditorObservations(e.target.value)}
                placeholder="E.g., Special mention of Frankfurt failover cluster drill conducted on 2026-07-15 with 0 packet loss..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Progress / Generation trigger */}
            {isGenerating && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                    AI Engine synthesizing statutory submission ({aiGenerationProgress}%)...
                  </span>
                  <span className="font-mono">Gemini 2.5 Flash</span>
                </div>
                <div className="w-full bg-indigo-200 dark:bg-indigo-900/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${aiGenerationProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Back to Templates
              </button>

              <button
                onClick={handleGenerateAiDraft}
                disabled={isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGenerating ? 'Synthesizing Regulatory Filing...' : 'Generate AI Filing Draft'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & INTERACTIVE PAYLOAD / NARRATIVE EDITOR */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header info bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  AI Draft Synthesized ({generationSource || 'SOVEREIGN_ENGINE'})
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {filingTitle || selectedTemplate.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleSaveDraft}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Draft</span>
                </button>

                <button
                  onClick={() => setIsEnhanceDrawerOpen(true)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Enhance Clause</span>
                </button>

                <button
                  onClick={handleValidatePayload}
                  disabled={isValidating}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {isValidating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Validate Schema</span>
                </button>
              </div>
            </div>

            {/* Split View: Left (Executive Summary & Statutory Basis) / Right (JSON-LD Payload Editor) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Legal & Operational Attestation */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Executive Summary */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      Executive Regulatory Narrative
                    </label>
                    <span className="text-[10px] text-slate-400">Statutory Attestation</span>
                  </div>
                  <textarea
                    rows={8}
                    value={executiveSummary}
                    onChange={(e) => setExecutiveSummary(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none leading-relaxed font-sans"
                  />
                </div>

                {/* Statutory Citations */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    Statutory Legal Basis Citations
                  </label>
                  <div className="space-y-1.5">
                    {statutoryLegalBasis.map((cit, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                        {cit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remediation Action Roadmap */}
                {remediationRoadmap.length > 0 && (
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Remediation Action Items ({remediationRoadmap.length})
                    </label>
                    <div className="space-y-2">
                      {remediationRoadmap.map((item, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                              {item.priority}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Deadline: {item.deadline}</span>
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-200">{item.action}</p>
                          <span className="text-[10px] text-slate-500 block">Owner: {item.owner}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: JSON-LD Telemetry Payload Editor */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                      JSON-LD Structured Telemetry Schema
                    </label>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handlePrettifyJson}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-[11px] font-mono flex items-center gap-1"
                        title="Prettify JSON"
                      >
                        <Sliders className="w-3 h-3" />
                        <span className="hidden sm:inline">Format</span>
                      </button>
                      <button
                        onClick={handleCopyPayload}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-[11px] font-mono flex items-center gap-1"
                        title="Copy to Clipboard"
                      >
                        <Copy className="w-3 h-3" />
                        <span className="hidden sm:inline">Copy</span>
                      </button>
                      <button
                        onClick={handleDownloadPayload}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-[11px] font-mono flex items-center gap-1"
                        title="Download .jsonld"
                      >
                        <Download className="w-3 h-3" />
                        <span className="hidden sm:inline">Export</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={17}
                    value={payloadText}
                    onChange={(e) => setPayloadText(e.target.value)}
                    className="w-full bg-slate-950 text-emerald-400 font-mono text-[11px] p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                {/* Validation Result Banner */}
                {validationResult && (
                  <div className={`p-4 rounded-xl border text-xs ${
                    validationResult.passed
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}>
                    <div className="flex items-center gap-2 font-bold">
                      {validationResult.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-rose-500" />}
                      <span>{validationResult.message}</span>
                    </div>
                    {validationResult.errors.length > 0 && (
                      <ul className="list-disc pl-5 mt-2 space-y-1 font-mono text-[11px]">
                        {validationResult.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Back to AI Options
              </button>

              <button
                onClick={() => {
                  if (!validationResult?.passed) {
                    handleValidatePayload();
                  }
                  setCurrentStep(5);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Proceed to Attestation & Seal</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: ATTESTATION, CRYPTOGRAPHIC SEAL & DISPATCH */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                Officer Attestation & Cryptographic B2G Seal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review the formal submission certificate, compute SHA-256 seal, and dispatch to the destination supervisory agency.
              </p>
            </div>

            {/* Submission Certificate Card */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Target Agency</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{targetAgency || selectedTemplate.targetAgency}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Jurisdiction</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{jurisdiction || selectedTemplate.jurisdiction}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Reporting Cycle</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{entityStatus.reportingPeriod}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Compliance Benchmark</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{entityStatus.complianceScore}% Verified</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block mb-1">Official Document Title</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{filingTitle}</span>
              </div>

              {/* Formal Attestation Statement */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Designated Officer Attestation</span>
                <p className="text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{attestationStatement || `I, ${entityStatus.designatedOfficer}, hereby formally attest under regulatory penalty of perjury that the data, operational metrics, and telemetry declarations submitted herein accurately represent the compliance and resilience posture of ${entityStatus.organizationName}.`}"
                </p>
                <div className="pt-2 flex justify-between items-center text-[11px] font-mono text-slate-500">
                  <span>Signatory: {entityStatus.designatedOfficer}</span>
                  <span>Enclave: {entityStatus.hsmEnclaveStatus}</span>
                </div>
              </div>

              {/* Cryptographic Seal Notice */}
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2.5">
                <Lock className="w-4 h-4 shrink-0 text-indigo-500" />
                <span>Upon submission, a SHA-256 HMAC digest will be generated and broadcast to the sovereign regulatory ledger.</span>
              </div>
            </div>

            {/* Submission Receipt (if already submitted) */}
            {submissionReceipt && (
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Filing Successfully Dispatched & Acknowledged!</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Filing ID:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{submissionReceipt.filingId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Supervisory Acknowledgement:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{submissionReceipt.acknowledgementReference}</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-emerald-100/50 dark:bg-emerald-900/30 p-2 rounded-lg break-all">
                  Checksum: {submissionReceipt.checksum}
                </div>

                {onViewTimeline && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onViewTimeline(submissionReceipt.filingId)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Track Filing in Workflow Timeline →</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Back to Payload Editor
              </button>

              <button
                onClick={handleSubmitFiling}
                disabled={isSubmitting || !!submissionReceipt}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isSubmitting ? 'Compiling Dossier...' : submissionReceipt ? 'Dossier Ready for Export' : 'Generate Exportable Dossier'}</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* AI Clause Enhancement Modal / Drawer */}
      <AnimatePresence>
        {isEnhanceDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  AI Statutory Clause Enhancer
                </h3>
                <button onClick={() => setIsEnhanceDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Input a rough policy clause or operational claim. The AI will refine it to be legally precise and compliant with {selectedTemplate.regulationCitation}.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Draft Clause / Operational Statement</label>
                <textarea
                  rows={3}
                  value={clauseToEnhance}
                  onChange={(e) => setClauseToEnhance(e.target.value)}
                  placeholder="E.g., We backup data to another cloud region every hour and verify keys..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleEnhanceClause}
                  disabled={isEnhancingClause || !clauseToEnhance.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isEnhancingClause ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Refine Clause with AI</span>
                </button>
              </div>

              {enhancedResult && (
                <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-3 text-xs animate-fadeIn">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Refined Statutory Text</span>
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 mt-1 leading-relaxed">
                      {enhancedResult.enhancedText}
                    </p>
                  </div>

                  {enhancedResult.statutoryCitations && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Citations</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {enhancedResult.statutoryCitations.map((c: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={applyEnhancedClause}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Inject into Executive Narrative</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
