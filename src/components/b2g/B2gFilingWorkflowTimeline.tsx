import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Globe,
  Send,
  Lock,
  ChevronRight,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  RefreshCw,
  Download,
  Eye,
  Award,
  Gavel,
  FileCode,
  Check,
  X,
  MessageSquare,
  Layers,
  Cpu,
  ExternalLink,
  Calendar,
  UserCheck,
  Hash,
  Scale,
  FileText,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  Info,
  ChevronDown,
  CornerDownRight,
  Shield,
  FileBadge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

// Workflow Stage Enum
export type WorkflowStageKey = 
  | 'DRAFTING'
  | 'INTERNAL_REVIEW'
  | 'DISPATCHED'
  | 'RAPPORTEUR_REVIEW'
  | 'BILATERAL_RFI'
  | 'GOVERNMENT_APPROVAL';

export type FilingOverallStatus = 
  | 'DRAFTING'
  | 'INTERNAL_REVIEW'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'SUPPLEMENTAL_REQUESTED'
  | 'APPROVED'
  | 'CONDITIONAL_APPROVAL'
  | 'REJECTED';

export interface WorkflowEventLog {
  id: string;
  timestamp: string;
  stage: WorkflowStageKey;
  title: string;
  actor: string;
  actorRole: 'COMPLIANCE_OFFICER' | 'LEGAL_COUNSEL' | 'GATEWAY_DAEMON' | 'REGULATORY_RAPPORTEUR' | 'SYSTEM';
  description: string;
  cryptographicHash?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface WorkflowEvidenceArtifact {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  sha256Hash: string;
  uploadedAt: string;
  category: 'TELEMETRY' | 'LEGAL_BRIEF' | 'AUDIT_PROOF' | 'CERTIFICATE' | 'RFI_RESPONSE';
  status: 'VERIFIED' | 'PENDING_VALIDATION';
}

export interface WorkflowRfiExchange {
  id: string;
  sentAt: string;
  agencyQuestion: string;
  requestedBy: string;
  statutoryDeadline: string;
  status: 'PENDING_RESPONSE' | 'SUBMITTED' | 'ACCEPTED';
  entityResponse?: string;
  respondedAt?: string;
  respondedBy?: string;
  attachedArtifacts?: string[];
}

export interface RegulatoryFilingWorkflow {
  id: string;
  referenceNumber: string;
  title: string;
  regulationType: 'DORA' | 'EU_AI_ACT' | 'NIS2' | 'GDPR' | 'SDAIA_PDPL' | 'BAFIN_FINMA' | 'ZATCA_CTC';
  regulationCitation: string;
  jurisdiction: string;
  targetAgency: string;
  submittingEntity: {
    id: string;
    name: string;
    industry: string;
    designatedOfficer: string;
    dpoContact: string;
    cloudTier: string;
    complianceScore: number;
  };
  currentStage: WorkflowStageKey;
  overallStatus: FilingOverallStatus;
  urgency: 'STANDARD' | 'EXPEDITED' | 'EMERGENCY_24H';
  slaDeadline: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Security & Proofs
  hsmKeyId: string;
  merkleRootDigest: string;
  rfc3161TimestampProof: string;
  gazetteGazetteRef?: string;
  certificateNumber?: string;
  
  // Executive summaries & payloads
  executiveSummary: string;
  payloadJsonText: string;
  
  // Interactive lists
  eventLogs: WorkflowEventLog[];
  evidenceArtifacts: WorkflowEvidenceArtifact[];
  rfiExchanges: WorkflowRfiExchange[];
  supervisoryNotes?: string;
}

// 6 Core Standard Milestone Definitions
export const WORKFLOW_STAGE_DEFINITIONS: {
  key: WorkflowStageKey;
  label: string;
  shortLabel: string;
  defaultDescription: string;
  icon: any;
  order: number;
}[] = [
  {
    key: 'DRAFTING',
    label: '1. Drafting & Evidence Assembly',
    shortLabel: 'Drafting',
    defaultDescription: 'Compilation of automated system telemetry, risk matrices, and cloud enclave evidence.',
    icon: FileText,
    order: 1
  },
  {
    key: 'INTERNAL_REVIEW',
    label: '2. Internal Legal & CISO Sign-Off',
    shortLabel: 'Dual Sign-Off',
    defaultDescription: 'Dual-party cryptographic validation, General Counsel verification, and HSM key attestation.',
    icon: UserCheck,
    order: 2
  },
  {
    key: 'DISPATCHED',
    label: '3. Gateway Transmission & RFC 3161 Seal',
    shortLabel: 'Dispatched',
    defaultDescription: 'Secure e-Delivery relay to sovereign regulator endpoint with cryptographic receipt issued.',
    icon: Send,
    order: 3
  },
  {
    key: 'RAPPORTEUR_REVIEW',
    label: '4. Supervisory Rapporteur Triaging',
    shortLabel: 'Agency Triage',
    defaultDescription: 'Government technical sandbox execution, synthetic compliance audits, and formal admissibility check.',
    icon: Gavel,
    order: 4
  },
  {
    key: 'BILATERAL_RFI',
    label: '5. Bilateral RFI & Clarifications',
    shortLabel: 'Clarifications',
    defaultDescription: 'Bilateral discovery channel for technical inquiries, supplemental evidence submissions, or hearing minutes.',
    icon: MessageSquare,
    order: 5
  },
  {
    key: 'GOVERNMENT_APPROVAL',
    label: '6. Government Determination & Clearance',
    shortLabel: 'Approved',
    defaultDescription: 'Formal statutory clearance attestation issued, official gazette notice sealed, and ledger recorded.',
    icon: Award,
    order: 6
  }
];

// Initial realistic default workflows spanning all statutory domains
const INITIAL_WORKFLOWS: RegulatoryFilingWorkflow[] = [
  {
    id: 'wf_dora_2026_01',
    referenceNumber: 'B2G-2026-DORA-8841',
    title: 'DORA Register of Information & Cloud Concentration Attestation',
    regulationType: 'DORA',
    regulationCitation: 'Regulation (EU) 2022/2554 (DORA) Articles 28 & 29',
    jurisdiction: 'EU / Germany',
    targetAgency: 'Federal Financial Supervisory Authority (BaFin) & EBA',
    submittingEntity: {
      id: 'org_acme_fin',
      name: 'Acme Sovereign Financial B.V.',
      industry: 'FinTech & Digital Banking',
      designatedOfficer: 'Dr. Elena Vance (Chief Compliance Officer)',
      dpoContact: 'dpo@acmesovereign.eu',
      cloudTier: 'EU-CENTRAL-1 Dedicated Sovereign Enclave',
      complianceScore: 96
    },
    currentStage: 'RAPPORTEUR_REVIEW',
    overallStatus: 'IN_REVIEW',
    urgency: 'STANDARD',
    slaDeadline: '2026-09-15T18:00:00Z',
    createdAt: '2026-08-10T09:30:00Z',
    updatedAt: '2026-08-20T14:15:00Z',
    hsmKeyId: 'HSM-EU-BAFIN-KMS-9921',
    merkleRootDigest: '0x9fa8e71b29d4c56e01a87c12f458e9903b12dc87e419b4e78a6321de6701fbc3',
    rfc3161TimestampProof: 'TSA-BAFIN-2026-08-14-11:00:02-UTC-VALID',
    supervisoryNotes: 'Rapporteur Dr. Wolfgang Meyer assigned. Synthetic failover resilience dry-run completed with 99.98% RTO conformity. Awaiting secondary risk assessment sign-off.',
    executiveSummary: 'Official submission of the statutory Register of Information regarding critical ICT third-party providers, disaster recovery RTO/RPO simulations, and cryptographic key governance across EU multi-cloud architectures.',
    payloadJsonText: JSON.stringify({
      "@context": "https://schema.b2g.regulettee.eu/v2/dora-register.jsonld",
      "filingReference": "B2G-2026-DORA-8841",
      "reportingPeriod": "2026-Q3",
      "criticalIctProviders": [
        { "name": "Sovereign Cloud Core Frankfurt", "lei": "529900T8BM49AURSDO55", "rtoMinutes": 8, "rpoSeconds": 0 },
        { "name": "Quantum-Resilient Vault Services", "lei": "5493006MHB84DD0ZWV18", "rtoMinutes": 2, "rpoSeconds": 0 }
      ],
      "exitStrategyTestedDate": "2026-07-28",
      "hsmAttestationLevel": "FIPS_140_3_LEVEL_4"
    }, null, 2),
    eventLogs: [
      {
        id: 'ev_01',
        timestamp: '2026-08-10T09:30:00Z',
        stage: 'DRAFTING',
        title: 'Filing Workflow Initiated',
        actor: 'Dr. Elena Vance',
        actorRole: 'COMPLIANCE_OFFICER',
        description: 'Auto-populated DORA telemetry registers and failover test results from internal SIEM and cloud monitors.'
      },
      {
        id: 'ev_02',
        timestamp: '2026-08-12T16:20:00Z',
        stage: 'INTERNAL_REVIEW',
        title: 'Dual-Party CISO & Legal Approval Executed',
        actor: 'Marcus Sterling (General Counsel)',
        actorRole: 'LEGAL_COUNSEL',
        description: 'Attestation statement confirmed. FIPS 140-3 cryptographic sign-off generated on hardware enclave.',
        cryptographicHash: '0x3a99e8f411b0c82de94f'
      },
      {
        id: 'ev_03',
        timestamp: '2026-08-14T11:00:00Z',
        stage: 'DISPATCHED',
        title: 'B2G AS4 Gateway Transmission Confirmed',
        actor: '9Xen Regulettee B2G Transmission Daemon',
        actorRole: 'GATEWAY_DAEMON',
        description: 'Payload encrypted via BaFin public key and transmitted to supervisory AS4 inbox. RFC 3161 receipt received.',
        cryptographicHash: '0x9fa8e71b29d4c56e01a8'
      },
      {
        id: 'ev_04',
        timestamp: '2026-08-18T10:15:00Z',
        stage: 'RAPPORTEUR_REVIEW',
        title: 'Supervisory Dossier Assigned to Lead Rapporteur',
        actor: 'Dr. Wolfgang Meyer (BaFin ICT Directorate)',
        actorRole: 'REGULATORY_RAPPORTEUR',
        description: 'Statutory completeness triage verified. ICT failover telemetry injected into automated supervisory testbench.'
      }
    ],
    evidenceArtifacts: [
      {
        id: 'art_01',
        title: 'DORA Article 28 Register of Information',
        fileName: 'DORA_Art28_Register_Acme_2026Q3.jsonld',
        fileSize: '480 KB',
        mimeType: 'application/ld+json',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        uploadedAt: '2026-08-10T10:00:00Z',
        category: 'TELEMETRY',
        status: 'VERIFIED'
      },
      {
        id: 'art_02',
        title: 'Multi-Cloud Failover Simulation Proof',
        fileName: 'Failover_Benchmark_Run_Frankfurt_Zurich.pdf',
        fileSize: '3.4 MB',
        mimeType: 'application/pdf',
        sha256Hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
        uploadedAt: '2026-08-11T14:30:00Z',
        category: 'AUDIT_PROOF',
        status: 'VERIFIED'
      }
    ],
    rfiExchanges: []
  },
  {
    id: 'wf_ai_act_2026_02',
    referenceNumber: 'B2G-2026-AIACT-1092',
    title: 'EU AI Act High-Risk Credit Scoring Model Conformity Dossier',
    regulationType: 'EU_AI_ACT',
    regulationCitation: 'Regulation (EU) 2024/1689 Articles 9, 11, 14 & Annex IV',
    jurisdiction: 'EU / France',
    targetAgency: 'EU AI Office & CNIL Directorate of Algorithmic Vigilance',
    submittingEntity: {
      id: 'org_stark_ai',
      name: 'Stark Intelligent Analytics SAS',
      industry: 'Algorithmic Underwriting & High-Risk AI',
      designatedOfficer: 'Chloe Dupont (Chief AI Ethics & Governance)',
      dpoContact: 'ai-ethics@stark-analytics.fr',
      cloudTier: 'Sovereign French Cloud C5 SecNumCloud Tier',
      complianceScore: 92
    },
    currentStage: 'BILATERAL_RFI',
    overallStatus: 'SUPPLEMENTAL_REQUESTED',
    urgency: 'EXPEDITED',
    slaDeadline: '2026-09-02T12:00:00Z',
    createdAt: '2026-08-01T11:00:00Z',
    updatedAt: '2026-08-22T08:45:00Z',
    hsmKeyId: 'HSM-FR-ANSSI-EID-4401',
    merkleRootDigest: '0x71dc9823ae01b98f244199cba00125ef6577881023dcae449910bfbcad013499',
    rfc3161TimestampProof: 'TSA-EU-AIOFFICE-2026-08-05-14:22:19-UTC-VALID',
    supervisoryNotes: 'Supervisory review highlighted statistical parity queries regarding minority cohort sample sizes in synthetic test vectors. Supplemental response requested.',
    executiveSummary: 'Annex IV Technical Documentation and Model Card for CreditScorer-V4 GPAI downstream model. Includes human-in-the-loop override audit logs and unlearning protocols.',
    payloadJsonText: JSON.stringify({
      "@context": "https://schema.b2g.regulettee.eu/v2/ai-act-annex-iv.jsonld",
      "systemName": "CreditScorer-V4-GPAI",
      "riskClassification": "HIGH_RISK_ANNEX_III_POINT_5B",
      "humanOversightMechanism": "MANDATORY_DUAL_OPERATOR_OVERRIDE",
      "demographicParityScore": 0.984,
      "equalOpportunityRatio": 0.991,
      "watermarkingCompliant": true,
      "euTdmOptOutHonored": true
    }, null, 2),
    eventLogs: [
      {
        id: 'ev_11',
        timestamp: '2026-08-01T11:00:00Z',
        stage: 'DRAFTING',
        title: 'Conformity Pack Compiled',
        actor: 'Chloe Dupont',
        actorRole: 'COMPLIANCE_OFFICER',
        description: 'Extracted automated dataset bias audit logs and explainability SHAP/LIME distributions.'
      },
      {
        id: 'ev_12',
        timestamp: '2026-08-04T09:00:00Z',
        stage: 'INTERNAL_REVIEW',
        title: 'AI Ethics Board & Counsel Approval',
        actor: 'Jean-Luc Moreau (Legal Director)',
        actorRole: 'LEGAL_COUNSEL',
        description: 'Annex IV conformity declaration authorized with SecNumCloud HSM cryptographic signature.'
      },
      {
        id: 'ev_13',
        timestamp: '2026-08-05T14:22:00Z',
        stage: 'DISPATCHED',
        title: 'Dispatched to EU AI Office & CNIL Gateway',
        actor: '9Xen Regulettee B2G Transmission Daemon',
        actorRole: 'GATEWAY_DAEMON',
        description: 'Encrypted transmission confirmed. Acknowledged with registry token `EU-AIO-2026-F-881`.'
      },
      {
        id: 'ev_14',
        timestamp: '2026-08-12T16:40:00Z',
        stage: 'RAPPORTEUR_REVIEW',
        title: 'Supervisory Technical Evaluation Initiated',
        actor: 'Claire Rousseau (CNIL Senior AI Auditor)',
        actorRole: 'REGULATORY_RAPPORTEUR',
        description: 'Model weights checksum and synthetic evaluation cohorts tested against benchmark dataset.'
      },
      {
        id: 'ev_15',
        timestamp: '2026-08-20T11:30:00Z',
        stage: 'BILATERAL_RFI',
        title: 'Statutory Request for Information (RFI) Issued',
        actor: 'Claire Rousseau (CNIL Senior AI Auditor)',
        actorRole: 'REGULATORY_RAPPORTEUR',
        description: 'Formal question regarding sample size adequacy for cross-border non-resident applicants.'
      }
    ],
    evidenceArtifacts: [
      {
        id: 'art_11',
        title: 'AI Act Annex IV Technical Documentation',
        fileName: 'AnnexIV_Technical_Documentation_CreditScorerV4.pdf',
        fileSize: '5.8 MB',
        mimeType: 'application/pdf',
        sha256Hash: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
        uploadedAt: '2026-08-01T15:00:00Z',
        category: 'LEGAL_BRIEF',
        status: 'VERIFIED'
      },
      {
        id: 'art_12',
        title: 'Algorithmic Fairness & Disparate Impact Audit',
        fileName: 'Fairness_Metrics_Demographic_Parity.csv',
        fileSize: '1.2 MB',
        mimeType: 'text/csv',
        sha256Hash: '9921ef45bc0123d456789a012bcdef345678901234567890abcdef1234567890',
        uploadedAt: '2026-08-02T10:15:00Z',
        category: 'AUDIT_PROOF',
        status: 'VERIFIED'
      }
    ],
    rfiExchanges: [
      {
        id: 'rfi_01',
        sentAt: '2026-08-20T11:30:00Z',
        agencyQuestion: 'Please provide supplementary validation data demonstrating disparate impact ratios when evaluating thin-file credit applicants from cross-border EU worker populations under Article 10(3).',
        requestedBy: 'Claire Rousseau, CNIL Directorate of Algorithmic Vigilance',
        statutoryDeadline: '2026-09-02T12:00:00Z',
        status: 'PENDING_RESPONSE'
      }
    ]
  },
  {
    id: 'wf_nis2_2026_03',
    referenceNumber: 'B2G-2026-NIS2-5503',
    title: 'NIS2 Article 23 Final Statutory Incident Resolution Report',
    regulationType: 'NIS2',
    regulationCitation: 'Directive (EU) 2022/2555 (NIS2) Articles 21 & 23',
    jurisdiction: 'EU / Ireland',
    targetAgency: 'National Cyber Security Centre (NCSC Ireland) & ENISA',
    submittingEntity: {
      id: 'org_cyber_ie',
      name: 'Sovereign Telecommunications Ireland Ltd',
      industry: 'Essential Digital Infrastructure & DNS Services',
      designatedOfficer: 'Liam O\'Connor (Head of Regulatory Telemetry)',
      dpoContact: 'security-operations@sovereigntelecom.ie',
      cloudTier: 'EU Zero-Trust Multi-Tenant Core with BGP Anycast Enclave',
      complianceScore: 98
    },
    currentStage: 'GOVERNMENT_APPROVAL',
    overallStatus: 'APPROVED',
    urgency: 'EMERGENCY_24H',
    slaDeadline: '2026-08-15T23:59:59Z',
    createdAt: '2026-07-20T08:00:00Z',
    updatedAt: '2026-08-14T17:00:00Z',
    completedAt: '2026-08-14T17:00:00Z',
    hsmKeyId: 'HSM-IE-NCSC-KMS-7712',
    merkleRootDigest: '0x12a9bc45de890123456789abcdef0123456789abcdef0123456789abcdef0123',
    rfc3161TimestampProof: 'TSA-IE-NCSC-2026-08-14-17:00:01-UTC-PERMANENT',
    gazetteGazetteRef: 'IE-STATUTORY-GAZETTE-2026-NIS2-NCSC-9812',
    certificateNumber: 'CERT-NIS2-NCSC-IE-2026-8831-CLEARANCE',
    supervisoryNotes: 'Formal clearance issued. Root cause isolated to sub-tier BGP route leak, resolved within 42 minutes with zero data exfiltration. Full compliance attestation recorded in public supervisory gazette.',
    executiveSummary: 'Final 1-Month Statutory Incident Report pursuant to NIS2 Article 23(4)(c). Comprehensive forensic telemetry, indicators of compromise (IoC), and long-term zero-trust architectural remediations.',
    payloadJsonText: JSON.stringify({
      "@context": "https://schema.b2g.regulettee.eu/v2/nis2-incident-final.jsonld",
      "incidentReference": "INC-2026-NIS2-0720",
      "category": "ESSENTIAL_ENTITY_DNS_BGP",
      "rootCause": "SUB_TIER_BGP_ROUTE_HIJACK_ATTEMPT",
      "mitigationTimeMinutes": 42,
      "crossBorderImpact": "MINIMAL_CONTAINED",
      "dataExfiltrationConfirmed": false,
      "hardwareEnclaveRemediated": true
    }, null, 2),
    eventLogs: [
      {
        id: 'ev_21',
        timestamp: '2026-07-20T08:00:00Z',
        stage: 'DRAFTING',
        title: 'Initial 24h Early Warning Dispatched',
        actor: 'Liam O\'Connor',
        actorRole: 'COMPLIANCE_OFFICER',
        description: 'Dispatched automated telemetry alert to NCSC Ireland within 14 minutes of detection.'
      },
      {
        id: 'ev_22',
        timestamp: '2026-07-23T10:00:00Z',
        stage: 'INTERNAL_REVIEW',
        title: '72h Comprehensive Incident Assessment Approved',
        actor: 'Fiona Kelly (CISO)',
        actorRole: 'COMPLIANCE_OFFICER',
        description: 'Forensic memory dump and netflow captures signed with cryptographic timestamp.'
      },
      {
        id: 'ev_23',
        timestamp: '2026-08-05T14:00:00Z',
        stage: 'DISPATCHED',
        title: 'Final 1-Month Statutory Dossier Sealed',
        actor: '9Xen Regulettee B2G Transmission Daemon',
        actorRole: 'GATEWAY_DAEMON',
        description: 'Full forensic package transmitted and confirmed by NCSC Ireland relay.'
      },
      {
        id: 'ev_24',
        timestamp: '2026-08-10T11:00:00Z',
        stage: 'RAPPORTEUR_REVIEW',
        title: 'NCSC Technical Assessment Completed',
        actor: 'Colm Murphy (Senior Incident Inspector, NCSC)',
        actorRole: 'REGULATORY_RAPPORTEUR',
        description: 'Mitigation efficacy benchmarked at 100%. No secondary vulnerabilities detected.'
      },
      {
        id: 'ev_25',
        timestamp: '2026-08-14T17:00:00Z',
        stage: 'GOVERNMENT_APPROVAL',
        title: 'Government Certificate of Clearance Issued',
        actor: 'NCSC Ireland Supervisory Directorate',
        actorRole: 'REGULATORY_RAPPORTEUR',
        description: 'Formal clearance certificate CERT-NIS2-NCSC-IE-2026-8831 issued and gazette recorded.',
        cryptographicHash: '0x12a9bc45de89012345'
      }
    ],
    evidenceArtifacts: [
      {
        id: 'art_21',
        title: 'NCSC Ireland Formal Clearance Attestation',
        fileName: 'NCSC_Clearance_Certificate_2026_8831.pdf',
        fileSize: '1.8 MB',
        mimeType: 'application/pdf',
        sha256Hash: '12a9bc45de890123456789abcdef0123456789abcdef0123456789abcdef0123',
        uploadedAt: '2026-08-14T17:00:00Z',
        category: 'CERTIFICATE',
        status: 'VERIFIED'
      }
    ],
    rfiExchanges: []
  },
  {
    id: 'wf_sdaia_2026_04',
    referenceNumber: 'B2G-2026-SDAIA-3319',
    title: 'SDAIA Saudi PDPL Cross-Border Data Flow Clearance Attestation',
    regulationType: 'SDAIA_PDPL',
    regulationCitation: 'Saudi PDPL Royal Decree M/19 & Executive Regulations',
    jurisdiction: 'Saudi Arabia / KSA',
    targetAgency: 'Saudi Data & AI Authority (SDAIA) & National Cyber Authority (NCA)',
    submittingEntity: {
      id: 'org_riyadh_govtech',
      name: 'Sovereign GovTech Enclave Riyadh',
      industry: 'Public Sector Data Hub & Sovereign AI',
      designatedOfficer: 'Eng. Tariq Al-Mansoor (Chief DPO)',
      dpoContact: 'dpo@sovereign-govtech.sa',
      cloudTier: 'National Sovereign Data Center Class-A Tier IV',
      complianceScore: 97
    },
    currentStage: 'INTERNAL_REVIEW',
    overallStatus: 'INTERNAL_REVIEW',
    urgency: 'STANDARD',
    slaDeadline: '2026-09-25T15:00:00Z',
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-08-21T09:30:00Z',
    hsmKeyId: 'HSM-SA-NCA-ECC-5521',
    merkleRootDigest: '0x33445566778899aabbccddeeff00112233445566778899aabbccddeeff001122',
    rfc3161TimestampProof: 'TSA-SA-SDAIA-PENDING',
    supervisoryNotes: 'Awaiting secondary CISO cryptographic key confirmation prior to national B2G gateway dispatch.',
    executiveSummary: 'Official attestation regarding national residency of sovereign citizen datasets, cross-border adequacy evaluation, and zero-egress hardware encryption enclaves in accordance with Saudi PDPL.',
    payloadJsonText: JSON.stringify({
      "@context": "https://schema.b2g.9xen-regulettee.sa/v1/sdaia-clearance.jsonld",
      "reportingPeriod": "2026-Q3",
      "sovereignDataCenter": "Riyadh-Central-IV",
      "crossBorderFlows": "ZERO_EGRESS_SOVEREIGN_ONLY",
      "ncaSecurityTier": "CLASS_A_HIGHEST",
      "chiefOfficer": "Eng. Tariq Al-Mansoor"
    }, null, 2),
    eventLogs: [
      {
        id: 'ev_31',
        timestamp: '2026-08-18T10:00:00Z',
        stage: 'DRAFTING',
        title: 'PDPL Clearance Dossier Assembled',
        actor: 'Eng. Tariq Al-Mansoor',
        actorRole: 'COMPLIANCE_OFFICER',
        description: 'Consolidated local server telemetry and zero-egress firewall rule proofs.'
      },
      {
        id: 'ev_32',
        timestamp: '2026-08-21T09:30:00Z',
        stage: 'INTERNAL_REVIEW',
        title: 'Submitted to General Counsel for Dual Sign-off',
        actor: 'Eng. Tariq Al-Mansoor',
        actorRole: 'COMPLIANCE_OFFICER',
        description: 'Queued for internal signature gate.'
      }
    ],
    evidenceArtifacts: [
      {
        id: 'art_31',
        title: 'SDAIA Sovereign Residency Attestation Report',
        fileName: 'SDAIA_PDPL_Residency_Attestation_2026.pdf',
        fileSize: '2.1 MB',
        mimeType: 'application/pdf',
        sha256Hash: '33445566778899aabbccddeeff00112233445566778899aabbccddeeff001122',
        uploadedAt: '2026-08-18T11:00:00Z',
        category: 'AUDIT_PROOF',
        status: 'VERIFIED'
      }
    ],
    rfiExchanges: []
  }
];

export interface B2gFilingWorkflowTimelineProps {
  onSelectWorkflow?: (workflow: RegulatoryFilingWorkflow) => void;
  onInitiateNewFiling?: () => void;
  className?: string;
  initialSelectedId?: string;
}

export const B2gFilingWorkflowTimeline: React.FC<B2gFilingWorkflowTimelineProps> = ({
  onSelectWorkflow,
  onInitiateNewFiling,
  className = '',
  initialSelectedId
}) => {
  const { showToast } = useNotification();

  // Workflows state
  const [workflows, setWorkflows] = useState<RegulatoryFilingWorkflow[]>(() => {
    try {
      const saved = localStorage.getItem('9xen-regulettee_b2g_filing_workflows');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved workflows', e);
    }
    return INITIAL_WORKFLOWS;
  });

  // Persist workflows
  useEffect(() => {
    try {
      localStorage.setItem('9xen-regulettee_b2g_filing_workflows', JSON.stringify(workflows));
    } catch (e) {
      console.error(e);
    }
  }, [workflows]);

  // Selection states
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(() => {
    if (initialSelectedId && workflows.some(w => w.id === initialSelectedId)) {
      return initialSelectedId;
    }
    return workflows[0]?.id || '';
  });

  const selectedWorkflow = useMemo(() => {
    return workflows.find(w => w.id === selectedWorkflowId) || workflows[0];
  }, [workflows, selectedWorkflowId]);

  // Selected stage inside the active timeline for deep-dive inspection
  const [activeInspectedStage, setActiveInspectedStage] = useState<WorkflowStageKey>('RAPPORTEUR_REVIEW');

  // Sync activeInspectedStage whenever selectedWorkflow changes
  useEffect(() => {
    if (selectedWorkflow) {
      setActiveInspectedStage(selectedWorkflow.currentStage);
    }
  }, [selectedWorkflow?.id]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [regulationFilter, setRegulationFilter] = useState<string>('ALL');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('ALL');

  // Modals & Panels
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isRfiReplyModalOpen, setIsRfiReplyModalOpen] = useState(false);
  const [selectedRfiForReply, setSelectedRfiForReply] = useState<WorkflowRfiExchange | null>(null);
  const [rfiReplyText, setRfiReplyText] = useState('');
  const [isSimulatingProgression, setIsSimulatingProgression] = useState(false);
  const [isMerkleModalOpen, setIsMerkleModalOpen] = useState(false);

  // Filtered workflows list
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(w => {
      const matchesSearch = 
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.targetAgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.submittingEntity.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || w.overallStatus === statusFilter;
      const matchesReg = regulationFilter === 'ALL' || w.regulationType === regulationFilter;
      const matchesJurisdiction = jurisdictionFilter === 'ALL' || w.jurisdiction.toLowerCase().includes(jurisdictionFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesReg && matchesJurisdiction;
    });
  }, [workflows, searchQuery, statusFilter, regulationFilter, jurisdictionFilter]);

  // Helper to get stage index
  const getStageIndex = (stageKey: WorkflowStageKey): number => {
    return WORKFLOW_STAGE_DEFINITIONS.findIndex(s => s.key === stageKey);
  };

  // Helper to determine stage status for a given workflow
  const getStageState = (workflow: RegulatoryFilingWorkflow, stageKey: WorkflowStageKey): 'COMPLETED' | 'ACTIVE' | 'PENDING' | 'ACTION_REQUIRED' => {
    const currentIdx = getStageIndex(workflow.currentStage);
    const targetIdx = getStageIndex(stageKey);

    if (workflow.overallStatus === 'SUPPLEMENTAL_REQUESTED' && stageKey === 'BILATERAL_RFI') {
      return 'ACTION_REQUIRED';
    }

    if (targetIdx < currentIdx) return 'COMPLETED';
    if (targetIdx === currentIdx) {
      if (workflow.overallStatus === 'APPROVED' && stageKey === 'GOVERNMENT_APPROVAL') {
        return 'COMPLETED';
      }
      return 'ACTIVE';
    }
    return 'PENDING';
  };

  // Interactive Stage Advance / Progression Simulation
  const handleAdvanceStage = (direction: 'NEXT' | 'PREV') => {
    if (!selectedWorkflow) return;
    setIsSimulatingProgression(true);

    setTimeout(() => {
      setIsSimulatingProgression(false);
      const currentIdx = getStageIndex(selectedWorkflow.currentStage);
      let nextIdx = direction === 'NEXT' ? currentIdx + 1 : currentIdx - 1;
      
      if (nextIdx < 0) nextIdx = 0;
      if (nextIdx >= WORKFLOW_STAGE_DEFINITIONS.length) nextIdx = WORKFLOW_STAGE_DEFINITIONS.length - 1;

      const nextStage = WORKFLOW_STAGE_DEFINITIONS[nextIdx].key;
      let nextOverallStatus: FilingOverallStatus = selectedWorkflow.overallStatus;
      
      if (nextStage === 'DRAFTING') nextOverallStatus = 'DRAFTING';
      else if (nextStage === 'INTERNAL_REVIEW') nextOverallStatus = 'INTERNAL_REVIEW';
      else if (nextStage === 'DISPATCHED') nextOverallStatus = 'SUBMITTED';
      else if (nextStage === 'RAPPORTEUR_REVIEW') nextOverallStatus = 'IN_REVIEW';
      else if (nextStage === 'BILATERAL_RFI') nextOverallStatus = 'SUPPLEMENTAL_REQUESTED';
      else if (nextStage === 'GOVERNMENT_APPROVAL') nextOverallStatus = 'APPROVED';

      const now = new Date().toISOString();
      const newEventLog: WorkflowEventLog = {
        id: `ev_adv_${Date.now()}`,
        timestamp: now,
        stage: nextStage,
        title: `Workflow Advanced to ${WORKFLOW_STAGE_DEFINITIONS[nextIdx].shortLabel}`,
        actor: 'Supervisory Workflow Engine (Simulated)',
        actorRole: 'SYSTEM',
        description: `Lifecycle transition successfully executed. Active stage updated to ${WORKFLOW_STAGE_DEFINITIONS[nextIdx].label}.`,
        cryptographicHash: `0x${Math.random().toString(16).substring(2, 18)}`
      };

      const updatedWorkflow: RegulatoryFilingWorkflow = {
        ...selectedWorkflow,
        currentStage: nextStage,
        overallStatus: nextOverallStatus,
        updatedAt: now,
        completedAt: nextStage === 'GOVERNMENT_APPROVAL' ? now : undefined,
        certificateNumber: nextStage === 'GOVERNMENT_APPROVAL' && !selectedWorkflow.certificateNumber
          ? `CERT-${selectedWorkflow.regulationType}-${Date.now().toString().slice(-6)}-CLEARANCE`
          : selectedWorkflow.certificateNumber,
        gazetteGazetteRef: nextStage === 'GOVERNMENT_APPROVAL' && !selectedWorkflow.gazetteGazetteRef
          ? `STATUTORY-GAZETTE-2026-${selectedWorkflow.regulationType}-${Date.now().toString().slice(-4)}`
          : selectedWorkflow.gazetteGazetteRef,
        eventLogs: [newEventLog, ...selectedWorkflow.eventLogs]
      };

      setWorkflows(prev => prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
      setActiveInspectedStage(nextStage);
      showToast(`Workflow advanced to "${WORKFLOW_STAGE_DEFINITIONS[nextIdx].label}"`, 'success');
    }, 600);
  };

  // Simulate an incoming agency RFI
  const handleSimulateAgencyRfi = () => {
    if (!selectedWorkflow) return;
    const now = new Date().toISOString();
    const deadline = new Date(Date.now() + 14 * 86400000).toISOString();

    const sampleRfiQuestions: Record<string, string> = {
      DORA: 'Supervisory review requests clarification regarding sub-tier third-party failover SLA guarantees for your secondary cloud enclave in the event of an EU-wide DNS degradation event.',
      EU_AI_ACT: 'The EU AI Office requests supplementary disparate impact test vectors and influence-function machine unlearning verification logs for the high-risk underwriting pipeline.',
      NIS2: 'National CSIRT requests supplementary PCAP netflow signatures and third-party vendor patch confirmation for the reported vulnerability vector.',
      SDAIA_PDPL: 'SDAIA requests supplementary cryptographic key custody attestation verifying zero-egress hardware isolation within the Kingdom of Saudi Arabia.'
    };

    const question = sampleRfiQuestions[selectedWorkflow.regulationType] || 
      'Supervisory authority requests supplemental technical documentation and attestation regarding operational compliance safeguards.';

    const newRfi: WorkflowRfiExchange = {
      id: `rfi_${Date.now()}`,
      sentAt: now,
      agencyQuestion: question,
      requestedBy: `Lead Rapporteur (${selectedWorkflow.targetAgency})`,
      statutoryDeadline: deadline,
      status: 'PENDING_RESPONSE'
    };

    const newEventLog: WorkflowEventLog = {
      id: `ev_rfi_${Date.now()}`,
      timestamp: now,
      stage: 'BILATERAL_RFI',
      title: 'Formal Request for Information (RFI) Issued by Agency',
      actor: selectedWorkflow.targetAgency,
      actorRole: 'REGULATORY_RAPPORTEUR',
      description: `RFI inquiry issued with statutory response deadline of ${new Date(deadline).toLocaleDateString()}.`
    };

    const updated: RegulatoryFilingWorkflow = {
      ...selectedWorkflow,
      currentStage: 'BILATERAL_RFI',
      overallStatus: 'SUPPLEMENTAL_REQUESTED',
      updatedAt: now,
      rfiExchanges: [newRfi, ...selectedWorkflow.rfiExchanges],
      eventLogs: [newEventLog, ...selectedWorkflow.eventLogs]
    };

    setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
    setActiveInspectedStage('BILATERAL_RFI');
    showToast('Supervisory RFI generated and injected into workflow timeline.', 'warning');
  };

  // Submit response to RFI
  const handleSubmitRfiResponse = () => {
    if (!selectedWorkflow || !selectedRfiForReply || !rfiReplyText.trim()) return;

    const now = new Date().toISOString();
    const updatedRfiList = selectedWorkflow.rfiExchanges.map(r => {
      if (r.id === selectedRfiForReply.id) {
        return {
          ...r,
          status: 'SUBMITTED' as const,
          entityResponse: rfiReplyText.trim(),
          respondedAt: now,
          respondedBy: selectedWorkflow.submittingEntity.designatedOfficer
        };
      }
      return r;
    });

    const newEventLog: WorkflowEventLog = {
      id: `ev_rfi_resp_${Date.now()}`,
      timestamp: now,
      stage: 'BILATERAL_RFI',
      title: 'Supplemental RFI Response & Proofs Dispatched',
      actor: selectedWorkflow.submittingEntity.designatedOfficer,
      actorRole: 'COMPLIANCE_OFFICER',
      description: `Supplemental evidence provided to ${selectedWorkflow.targetAgency}. Awaiting supervisory review.`
    };

    const updated: RegulatoryFilingWorkflow = {
      ...selectedWorkflow,
      overallStatus: 'IN_REVIEW',
      updatedAt: now,
      rfiExchanges: updatedRfiList,
      eventLogs: [newEventLog, ...selectedWorkflow.eventLogs]
    };

    setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
    setIsRfiReplyModalOpen(false);
    setSelectedRfiForReply(null);
    setRfiReplyText('');
    showToast('Supplemental RFI response submitted with cryptographic hash seal.', 'success');
  };

  // Fast-Track Toggle
  const handleToggleFastTrack = () => {
    if (!selectedWorkflow) return;
    const isCurrentlyExpedited = selectedWorkflow.urgency === 'EXPEDITED';
    const newUrgency = isCurrentlyExpedited ? 'STANDARD' : 'EXPEDITED';
    const now = new Date().toISOString();

    const newEventLog: WorkflowEventLog = {
      id: `ev_urg_${Date.now()}`,
      timestamp: now,
      stage: selectedWorkflow.currentStage,
      title: isCurrentlyExpedited ? 'Reverted to Standard Statutory Review' : 'Fast-Track Priority Review Invoked',
      actor: selectedWorkflow.submittingEntity.designatedOfficer,
      actorRole: 'COMPLIANCE_OFFICER',
      description: isCurrentlyExpedited
        ? 'Standard statutory SLA cadence restored.'
        : 'Statutory expedited review requested under urgent regulatory operational provisions.'
    };

    const updated: RegulatoryFilingWorkflow = {
      ...selectedWorkflow,
      urgency: newUrgency,
      updatedAt: now,
      eventLogs: [newEventLog, ...selectedWorkflow.eventLogs]
    };

    setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
    showToast(isCurrentlyExpedited ? 'Standard cadence restored.' : 'Statutory Fast-Track priority review activated!', 'info');
  };

  // Reset to default seed
  const handleResetWorkflows = () => {
    if (window.confirm('Reset all regulatory workflows to default statutory presets?')) {
      setWorkflows(INITIAL_WORKFLOWS);
      setSelectedWorkflowId(INITIAL_WORKFLOWS[0].id);
      localStorage.setItem('9xen-regulettee_b2g_filing_workflows', JSON.stringify(INITIAL_WORKFLOWS));
      showToast('Workflows reset to default state.', 'info');
    }
  };

  // Status Badge Rendering Helper
  const renderStatusBadge = (status: FilingOverallStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            GOVERNMENT APPROVED
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
            UNDER SUPERVISORY REVIEW
          </span>
        );
      case 'SUPPLEMENTAL_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            ACTION REQUIRED (RFI PENDING)
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Send className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            DISPATCHED TO GATEWAY
          </span>
        );
      case 'INTERNAL_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            INTERNAL CISO REVIEW
          </span>
        );
      case 'DRAFTING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            DRAFTING IN PROGRESS
          </span>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 lg:p-7 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-2xl">
              <Scale className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  B2G Regulatory Filing Workflow Timeline
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider border border-emerald-500/30">
                  Live Telemetry
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5 font-medium">
                End-to-end statutory lifecycle tracker: Monitor regulatory submissions from drafting, dual-key signing, gateway dispatch, and rapporteur triaging to final government clearance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
          <button
            onClick={handleResetWorkflows}
            title="Reset to default statutory cases"
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700/80 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Presets</span>
          </button>

          {onInitiateNewFiling && (
            <button
              onClick={onInitiateNewFiling}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Initiate New B2G Filing</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Filter/Filing List & Right Interactive Timeline Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Filing Selector & Filters (4 Cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference, entity, agency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFTING">Drafting</option>
                  <option value="INTERNAL_REVIEW">Internal Review</option>
                  <option value="SUBMITTED">Dispatched</option>
                  <option value="IN_REVIEW">Under Review</option>
                  <option value="SUPPLEMENTAL_REQUESTED">RFI Pending</option>
                  <option value="APPROVED">Approved</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Regulation</label>
                <select
                  value={regulationFilter}
                  onChange={(e) => setRegulationFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Regulations</option>
                  <option value="DORA">DORA</option>
                  <option value="EU_AI_ACT">EU AI Act</option>
                  <option value="NIS2">NIS2</option>
                  <option value="GDPR">GDPR</option>
                  <option value="SDAIA_PDPL">Saudi PDPL</option>
                </select>
              </div>
            </div>
          </div>

          {/* Workflow Cards List */}
          <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
            {filteredWorkflows.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">No statutory filings found matching filters.</p>
              </div>
            ) : (
              filteredWorkflows.map((workflow) => {
                const isSelected = workflow.id === selectedWorkflowId;
                const currentStageObj = WORKFLOW_STAGE_DEFINITIONS.find(s => s.key === workflow.currentStage);

                return (
                  <motion.div
                    key={workflow.id}
                    onClick={() => {
                      setSelectedWorkflowId(workflow.id);
                      if (onSelectWorkflow) onSelectWorkflow(workflow);
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-500/80 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[11px] font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {workflow.referenceNumber}
                      </span>
                      {renderStatusBadge(workflow.overallStatus)}
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mb-1">
                      {workflow.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{workflow.submittingEntity.name}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Stage: <strong className="text-slate-700 dark:text-slate-300">{currentStageObj?.shortLabel}</strong>
                      </span>
                      <span className="font-mono">{workflow.jurisdiction}</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Interactive Visual Timeline (8 Cols on lg) */}
        {selectedWorkflow ? (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Interactive Workflow Hero Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 lg:p-7 shadow-sm space-y-6">
              
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-mono font-black rounded-lg">
                      {selectedWorkflow.referenceNumber}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-200 dark:border-indigo-800">
                      {selectedWorkflow.regulationCitation}
                    </span>
                    {selectedWorkflow.urgency === 'EXPEDITED' && (
                      <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase rounded-lg animate-pulse flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Fast-Track SLA
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-2">
                    {selectedWorkflow.title}
                  </h2>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {selectedWorkflow.submittingEntity.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Globe className="w-3.5 h-3.5 text-emerald-500" />
                      Target Agency: <strong className="text-slate-700 dark:text-slate-200">{selectedWorkflow.targetAgency}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={handleToggleFastTrack}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedWorkflow.urgency === 'EXPEDITED'
                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-300'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{selectedWorkflow.urgency === 'EXPEDITED' ? 'Expedited Active' : 'Request Fast-Track'}</span>
                  </button>

                  <button
                    onClick={() => setIsDossierModalOpen(true)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Dossier</span>
                  </button>
                </div>
              </div>

              {/* Interactive Visual Timeline Progression Track */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    Statutory Lifecycle Milestones
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    SLA Window: {new Date(selectedWorkflow.slaDeadline).toLocaleDateString()}
                  </span>
                </div>

                {/* Horizontal Progress Track */}
                <div className="relative">
                  {/* Connecting background line */}
                  <div className="absolute top-5 left-6 right-6 h-1 bg-slate-100 dark:bg-slate-800 rounded-full z-0" />
                  
                  {/* Active progress filled line */}
                  <div 
                    className="absolute top-5 left-6 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500"
                    style={{
                      width: `${(getStageIndex(selectedWorkflow.currentStage) / (WORKFLOW_STAGE_DEFINITIONS.length - 1)) * 100}%`
                    }}
                  />

                  {/* Stage Nodes */}
                  <div className="relative z-10 grid grid-cols-6 gap-1">
                    {WORKFLOW_STAGE_DEFINITIONS.map((stage, idx) => {
                      const state = getStageState(selectedWorkflow, stage.key);
                      const isInspected = activeInspectedStage === stage.key;
                      const StageIcon = stage.icon;

                      return (
                        <div
                          key={stage.key}
                          onClick={() => setActiveInspectedStage(stage.key)}
                          className="flex flex-col items-center text-center cursor-pointer group"
                        >
                          {/* Node Icon Circle */}
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 relative ${
                              state === 'COMPLETED'
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                : state === 'ACTIVE'
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950/60 shadow-lg animate-pulse'
                                : state === 'ACTION_REQUIRED'
                                ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100 dark:ring-amber-950/60 shadow-lg animate-bounce'
                                : 'bg-white dark:bg-slate-900 text-slate-400 border-2 border-slate-200 dark:border-slate-700'
                            } ${isInspected ? 'ring-2 ring-emerald-400 scale-110' : 'hover:scale-105'}`}
                          >
                            {state === 'COMPLETED' ? (
                              <Check className="w-5 h-5 stroke-[3]" />
                            ) : state === 'ACTION_REQUIRED' ? (
                              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                            ) : (
                              <StageIcon className="w-4 h-4" />
                            )}
                          </div>

                          {/* Node Label */}
                          <span className={`text-[10px] font-bold mt-2 leading-tight transition-colors line-clamp-2 ${
                            isInspected 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : state === 'ACTIVE' || state === 'COMPLETED' 
                              ? 'text-slate-800 dark:text-slate-200' 
                              : 'text-slate-400'
                          }`}>
                            {stage.shortLabel}
                          </span>

                          <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                            Step {stage.order}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Simulation Progression Bar Controls */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                  <Play className="w-4 h-4 text-emerald-500" />
                  <span>Interactive Pipeline Simulation:</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleAdvanceStage('PREV')}
                    disabled={isSimulatingProgression || getStageIndex(selectedWorkflow.currentStage) === 0}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer"
                  >
                    ← Previous Step
                  </button>

                  <button
                    onClick={handleSimulateAgencyRfi}
                    disabled={isSimulatingProgression || selectedWorkflow.overallStatus === 'APPROVED'}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                    <span>Simulate Agency RFI</span>
                  </button>

                  <button
                    onClick={() => handleAdvanceStage('NEXT')}
                    disabled={isSimulatingProgression || getStageIndex(selectedWorkflow.currentStage) === WORKFLOW_STAGE_DEFINITIONS.length - 1}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                  >
                    {isSimulatingProgression ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                    <span>Advance Stage →</span>
                  </button>
                </div>
              </div>

              {/* Inspected Stage Deep Dive Detail Box */}
              {(() => {
                const inspectedStageObj = WORKFLOW_STAGE_DEFINITIONS.find(s => s.key === activeInspectedStage);
                const stageEvents = selectedWorkflow.eventLogs.filter(e => e.stage === activeInspectedStage);

                return (
                  <div className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-indigo-950/10 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                          {inspectedStageObj?.icon && React.createElement(inspectedStageObj.icon, { className: "w-4 h-4" })}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                            {inspectedStageObj?.label}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {inspectedStageObj?.defaultDescription}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                        {stageEvents.length} Recorded Events
                      </span>
                    </div>

                    {/* Stage Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">HSM Seal Reference</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 font-bold break-all text-[11px]">
                          {selectedWorkflow.hsmKeyId}
                        </span>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">RFC 3161 Timestamp Proof</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px] truncate block">
                          {selectedWorkflow.rfc3161TimestampProof}
                        </span>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Merkle Proof Seal</span>
                          <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate block max-w-[120px]">
                            {selectedWorkflow.merkleRootDigest}
                          </span>
                        </div>
                        <button
                          onClick={() => setIsMerkleModalOpen(true)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Verify Proof
                        </button>
                      </div>
                    </div>

                    {/* Stage Event Logs List */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Milestone Audit Events ({inspectedStageObj?.shortLabel})
                      </span>

                      {stageEvents.length === 0 ? (
                        <p className="text-xs italic text-slate-400 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                          Awaiting stage trigger. No events recorded for this milestone yet.
                        </p>
                      ) : (
                        stageEvents.map((evt) => (
                          <div
                            key={evt.id}
                            className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-slate-100">{evt.title}</span>
                                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                  {evt.actorRole}
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-xs">{evt.description}</p>
                              {evt.cryptographicHash && (
                                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  <span>Hash: {evt.cryptographicHash}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {new Date(evt.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Bilateral RFI Section (If Any Pending or Answered) */}
              {selectedWorkflow.rfiExchanges.length > 0 && (
                <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Statutory Bilateral Inquiries (RFI Exchanges)
                    </h3>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      {selectedWorkflow.rfiExchanges.filter(r => r.status === 'PENDING_RESPONSE').length} Pending Action
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedWorkflow.rfiExchanges.map((rfi) => (
                      <div
                        key={rfi.id}
                        className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/80 space-y-3 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Agency Inquiry From:</span>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100">{rfi.requestedBy}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rfi.status === 'SUBMITTED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                          }`}>
                            {rfi.status === 'SUBMITTED' ? 'RESPONSE SUBMITTED' : 'ACTION REQUIRED'}
                          </span>
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg italic border border-slate-100 dark:border-slate-800 leading-relaxed">
                          "{rfi.agencyQuestion}"
                        </p>

                        {rfi.entityResponse ? (
                          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                              Entity Attested Response ({rfi.respondedBy}):
                            </span>
                            <p className="text-slate-800 dark:text-slate-200">{rfi.entityResponse}</p>
                            <span className="text-[10px] font-mono text-slate-400 block pt-1">
                              Dispatched at: {rfi.respondedAt ? new Date(rfi.respondedAt).toLocaleString() : ''}
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setSelectedRfiForReply(rfi);
                                setIsRfiReplyModalOpen(true);
                              }}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit Clarifying Attestation & Evidence</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Artifacts & Government Certificate Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Uploaded Evidence Dossier */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-indigo-500" />
                      Statutory Evidence Attachments
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedWorkflow.evidenceArtifacts.length} Artifacts
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedWorkflow.evidenceArtifacts.map((art) => (
                      <div
                        key={art.id}
                        className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="truncate">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block text-[11px]">
                            {art.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block truncate">
                            {art.fileName} ({art.fileSize})
                          </span>
                        </div>
                        <button
                          onClick={() => showToast(`Exporting verified evidence artifact: ${art.fileName}`, 'info')}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title="Download verified copy"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formal Government Certificate / Gazette Card */}
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Official Government Certificate
                    </span>

                    {selectedWorkflow.overallStatus === 'APPROVED' ? (
                      <div className="mt-2 space-y-1.5 text-xs">
                        <p className="text-emerald-900 dark:text-emerald-200 font-bold">
                          Statutory Certificate Issued & Gazetted
                        </p>
                        <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 truncate">
                          Ref: {selectedWorkflow.certificateNumber}
                        </p>
                        <p className="font-mono text-[10px] text-slate-500 truncate">
                          Gazette: {selectedWorkflow.gazetteGazetteRef}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <p>Certificate will be issued automatically upon final supervisory rapporteur determination.</p>
                        <p className="text-[11px] font-mono">Current Stage: {WORKFLOW_STAGE_DEFINITIONS.find(s => s.key === selectedWorkflow.currentStage)?.label}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsCertificateModalOpen(true)}
                    disabled={selectedWorkflow.overallStatus !== 'APPROVED'}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 cursor-pointer"
                  >
                    <FileBadge className="w-4 h-4" />
                    <span>View Official Clearance Certificate</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
            <Scale className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Select a Regulatory Workflow</h3>
            <p className="text-xs mt-1">Choose a B2G statutory submission from the left panel to inspect the visual timeline and milestone progression.</p>
          </div>
        )}

      </div>

      {/* Dossier Inspection Modal */}
      <AnimatePresence>
        {isDossierModalOpen && selectedWorkflow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                      B2G Statutory Dossier Preview: {selectedWorkflow.referenceNumber}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">{selectedWorkflow.regulationCitation}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDossierModalOpen(false)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Executive Summary</span>
                  <p className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed font-serif text-sm">
                    {selectedWorkflow.executiveSummary}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">JSON-LD Telemetry Payload</span>
                  <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[300px]">
                    {selectedWorkflow.payloadJsonText}
                  </pre>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedWorkflow.payloadJsonText);
                    showToast('Payload copied to clipboard.', 'success');
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Copy JSON-LD
                </button>
                <button
                  onClick={() => setIsDossierModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Merkle Proof Verification Modal */}
      <AnimatePresence>
        {isMerkleModalOpen && selectedWorkflow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Zero-Knowledge Merkle Root Audit Seal
                </h3>
                <button onClick={() => setIsMerkleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Mathematical cryptographic verification of submission state immutability across the decentralized sovereign regulatory ledger.
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Root Merkle Digest:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 break-all text-[11px]">
                    {selectedWorkflow.merkleRootDigest}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">HSM Enclave Key ID:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    {selectedWorkflow.hsmKeyId}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">RFC 3161 Verification Status:</span>
                  <span className="font-bold text-emerald-600 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    CRYPTOGRAPHICALLY SEALED & VERIFIED (0 Tampering Detected)
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsMerkleModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RFI Reply Submission Modal */}
      <AnimatePresence>
        {isRfiReplyModalOpen && selectedRfiForReply && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  Bilateral Regulatory Clarification Response
                </h3>
                <button onClick={() => setIsRfiReplyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 italic">
                "{selectedRfiForReply.agencyQuestion}"
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Formal Attested Response Statement
                </label>
                <textarea
                  rows={4}
                  value={rfiReplyText}
                  onChange={(e) => setRfiReplyText(e.target.value)}
                  placeholder="Provide technical evidence, parameter validations, and statutory justifications..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsRfiReplyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRfiResponse}
                  disabled={!rfiReplyText.trim()}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Seal & Transmit Response</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Government Clearance Certificate Modal */}
      <AnimatePresence>
        {isCertificateModalOpen && selectedWorkflow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 border-slate-900 rounded-3xl w-full max-w-2xl p-8 shadow-2xl text-slate-900 relative space-y-6"
            >
              <button
                onClick={() => setIsCertificateModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Certificate Header */}
              <div className="text-center space-y-2 border-b-2 border-slate-900 pb-5">
                <div className="inline-flex p-3 bg-emerald-100 rounded-2xl mb-1">
                  <Award className="w-8 h-8 text-emerald-700" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-wider font-serif">
                  Statutory Certificate of Regulatory Clearance & Compliance
                </h2>
                <p className="text-xs font-mono text-slate-600">
                  Issued under the Authority of {selectedWorkflow.targetAgency}
                </p>
              </div>

              {/* Certificate Body */}
              <div className="space-y-4 text-xs leading-relaxed font-serif">
                <p className="text-center italic">
                  This official statutory instrument certifies that:
                </p>
                <div className="p-4 bg-slate-50 rounded-xl text-center font-sans space-y-1 border border-slate-200">
                  <h3 className="text-base font-black text-slate-900">{selectedWorkflow.submittingEntity.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Jurisdiction: {selectedWorkflow.jurisdiction} • Industry: {selectedWorkflow.submittingEntity.industry}
                  </p>
                </div>

                <p className="text-justify">
                  Has fully satisfied the statutory reporting, technical documentation, and cryptographic audit requirements established under <strong className="font-sans">{selectedWorkflow.regulationCitation}</strong>.
                </p>

                <div className="grid grid-cols-2 gap-3 font-sans text-[11px] pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block">Certificate Number:</span>
                    <strong className="font-mono text-slate-800">{selectedWorkflow.certificateNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Official Gazette Record:</span>
                    <strong className="font-mono text-slate-800">{selectedWorkflow.gazetteGazetteRef}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Designated Officer:</span>
                    <strong className="text-slate-800">{selectedWorkflow.submittingEntity.designatedOfficer}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Date of Clearance:</span>
                    <strong className="font-mono text-slate-800">
                      {selectedWorkflow.completedAt ? new Date(selectedWorkflow.completedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Certificate Footer */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-slate-900">
                <div className="text-[10px] font-mono text-slate-500">
                  <span>SHA-256 Ledger Hash: </span>
                  <span className="font-bold text-slate-800 truncate block max-w-[280px]">
                    {selectedWorkflow.merkleRootDigest}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      showToast('Certificate PDF exported successfully.', 'success');
                      setIsCertificateModalOpen(false);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Dossier</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
