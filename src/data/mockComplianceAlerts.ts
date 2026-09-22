import { ComplianceAlert, RoleConfig } from '../types/complianceAlerts';

export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  AUDITOR: {
    id: 'AUDITOR',
    name: 'Compliance Auditor',
    badgeLabel: 'Auditor',
    description: 'Internal & External Statutory Oversight, immudb Verification & SOC/ISO Assurances',
    statutoryFocus: 'immudb Hash Proofs • ISO 27001 • SOC 2 Type II • EBSI Block Ledgers',
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    defaultPath: 'audit-ledger'
  },
  SYSTEM_ADMIN: {
    id: 'SYSTEM_ADMIN',
    name: 'System / Platform Admin',
    badgeLabel: 'System Admin',
    description: 'Sovereign Boundary Protection, Hardware Security Modules (HSM), TLS & Zero-Trust Telemetry',
    statutoryFocus: 'NIS2 Art. 21 • HSM Key Rotation • BSI IT-Grundschutz • Zero-Trust Boundary',
    accentColor: 'purple',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-600 dark:text-purple-400',
    defaultPath: 'sudou'
  },
  COMPLIANCE_OFFICER: {
    id: 'COMPLIANCE_OFFICER',
    name: 'Compliance Officer (DPO)',
    badgeLabel: 'Compliance Officer',
    description: 'GDPR 72-hour Statutory Breach Windows, EU AI Act High-Risk Governance & DPIA / FRIA',
    statutoryFocus: 'GDPR Art. 33/34 • EU AI Act Title VIII • Article 30 ROPA • DSAR Fulfillment',
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    defaultPath: 'client-dashboard'
  },
  LAWYER: {
    id: 'LAWYER',
    name: 'Legal Counsel & Arbitration',
    badgeLabel: 'Lawyer / Legal',
    description: 'Supervisory Fine Calculation Defense, eIDAS Qualified Signatures & Statutory Discovery',
    statutoryFocus: 'EDPB Penalty Mitigation • GDPR Art. 83 • eIDAS QES • SCC Standard Contracts',
    accentColor: 'amber',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-600 dark:text-amber-400',
    defaultPath: 'lawyer-portal'
  }
};

export const INITIAL_COMPLIANCE_ALERTS: ComplianceAlert[] = [
  // ================= AUDITOR ALERTS =================
  {
    id: 'ALT-AUD-001',
    role: 'AUDITOR',
    severity: 'CRITICAL',
    framework: 'SOVEREIGNTY',
    statutoryReference: 'EBSI / immudb Zero-Knowledge Standard',
    title: 'immudb Ledger Hash Verification Discrepancy',
    description: 'Cryptographic block hash mismatch detected in cold storage replica partition #8914. Possible state desynchronization or unverified disk snapshot.',
    source: 'immudb Sovereign Ledger Sentinel',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    status: 'UNREAD',
    isPinned: true,
    actionRequired: true,
    remediationAction: {
      id: 'verify-ebsi-ledger',
      label: 'Verify EBSI Merkle Tree',
      description: 'Trigger autonomous cryptographic re-verification against the decentralized EBSI notarization ledger.',
      targetPath: 'audit-ledger',
      autoRemediable: true
    },
    auditHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    tenantName: 'Acme Sovereign Finance EU'
  },
  {
    id: 'ALT-AUD-002',
    role: 'AUDITOR',
    severity: 'HIGH',
    framework: 'GDPR',
    statutoryReference: 'GDPR Art. 30(1) & ISO 27701',
    title: 'Unsigned Article 30 ROPA Inventory Delta',
    description: '14 newly deployed microservice data pipelines were automatically registered in the sovereign mesh without formal DPO quarterly sign-off.',
    source: 'Automated Data Flow Scanner',
    timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    status: 'UNREAD',
    actionRequired: true,
    remediationAction: {
      id: 'inspect-ropa',
      label: 'Audit & Certify ROPA',
      description: 'Review discovered data flows and append cryptographic auditor signature.',
      targetPath: 'data-mapping'
    },
    auditHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    tenantName: 'MedTech Sovereign Health'
  },
  {
    id: 'ALT-AUD-003',
    role: 'AUDITOR',
    severity: 'HIGH',
    framework: 'EU_AI_ACT',
    statutoryReference: 'EU AI Act Title VIII & Art. 72',
    title: 'High-Risk AI Model Demographic Drift Audit',
    description: 'Financial Underwriting Model CS-v4.2 showed a 2.4% statistical demographic parity drift across EU member state applicant pools.',
    source: 'AI Model Fairness & Bias Telemetry',
    timestamp: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    status: 'ACKNOWLEDGED',
    actionRequired: true,
    remediationAction: {
      id: 'generate-ai-dpia',
      label: 'Inspect Bias Audit Dossier',
      description: 'Generate comprehensive Annex IV technical documentation and bias mitigation brief.',
      targetPath: 'ai-compliance-risk-engine'
    },
    auditHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    tenantName: 'Nordic Sovereign Banking'
  },
  {
    id: 'ALT-AUD-004',
    role: 'AUDITOR',
    severity: 'MEDIUM',
    framework: 'SOC2',
    statutoryReference: 'SOC 2 Trust Services Criteria CC6.1',
    title: 'SOC 2 Type II Quarterly Evidence Package Ready',
    description: 'Automated continuous monitoring has compiled 1,420 control artifacts into a verifiable zip package for external auditor inspection.',
    source: 'Continuous Evidence Harvester',
    timestamp: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    status: 'READ',
    actionRequired: false,
    remediationAction: {
      id: 'export-soc2-dossier',
      label: 'Download Signed Package',
      description: 'Export cryptographically signed evidence dossier.',
      targetPath: 'audit-ledger'
    },
    auditHash: '3b612c75a7b5c8b60d3fed3ab8e80a3c4f74bcc2163507a28214a3fb1a499d10',
    tenantName: 'Global Cloud Services EU'
  },

  // ================= SYSTEM ADMIN ALERTS =================
  {
    id: 'ALT-SYS-001',
    role: 'SYSTEM_ADMIN',
    severity: 'CRITICAL',
    framework: 'NIS2',
    statutoryReference: 'NIS2 Directive Art. 21(2)(h) & BSI IT-G',
    title: 'Hardware Security Module (HSM) Root Key Expiry in 7 Days',
    description: 'Hardware Security Module root key HSM-EU-ROOT-994 is scheduled for automated cryptographic rotation. Failure to rotate will violate sovereign boundary isolation.',
    source: 'HSM Cryptographic Key Vault #1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    deadlineHours: 168,
    deadlineIso: new Date(Date.now() + 168 * 3600 * 1000).toISOString(),
    status: 'UNREAD',
    isPinned: true,
    actionRequired: true,
    remediationAction: {
      id: 'rotate-hsm-key',
      label: 'Execute Automated Key Rotation',
      description: 'Deploy new AES-256-GCM / Dilithium Post-Quantum root key without downtime.',
      targetPath: 'sudou',
      autoRemediable: true
    },
    auditHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    tenantName: 'Core Sovereign Cluster (Frankfurt)'
  },
  {
    id: 'ALT-SYS-002',
    role: 'SYSTEM_ADMIN',
    severity: 'CRITICAL',
    framework: 'SOVEREIGNTY',
    statutoryReference: 'GDPR Chapter V & EU Cloud Code',
    title: 'Zero-Trust Boundary Egress Anomaly Blocked',
    description: 'Enclave Firewall intercepted and blocked 42 unencrypted telemetry packets routed to non-adequacy IP 198.51.100.24. Zero data leaked.',
    source: 'Sovereign Enclave Egress Sentinel',
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    status: 'UNREAD',
    actionRequired: true,
    remediationAction: {
      id: 'isolate-network-node',
      label: 'Reinforce Enclave Rule',
      description: 'Enforce strict TLS pinning and blackhole unauthorized egress vector.',
      targetPath: 'sovereign-residency',
      autoRemediable: true
    },
    auditHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    tenantName: 'Paris Data Node #04'
  },
  {
    id: 'ALT-SYS-003',
    role: 'SYSTEM_ADMIN',
    severity: 'HIGH',
    framework: 'DORA',
    statutoryReference: 'DORA Regulation (EU) 2022/2554 Art. 12',
    title: 'PostgreSQL Cross-Region Database Replication Lag',
    description: 'Replica node eu-west-3 (Paris) replication latency exceeded 520ms threshold during peak batch processing. Resync recommended.',
    source: 'Database Cluster Health Daemon',
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    status: 'UNREAD',
    actionRequired: true,
    remediationAction: {
      id: 'resync-db-nodes',
      label: 'Trigger Cluster Resynchronization',
      description: 'Rebalance WAL streaming pipelines across EU sovereign instances.',
      targetPath: 'sudou',
      autoRemediable: true
    },
    auditHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    tenantName: 'EU Production Shard #2'
  },
  {
    id: 'ALT-SYS-004',
    role: 'SYSTEM_ADMIN',
    severity: 'LOW',
    framework: 'ISO27001',
    statutoryReference: 'ISO/IEC 27001:2022 Control A.8.24',
    title: 'Post-Quantum TLS 1.3 Strict Mode Enforced',
    description: 'Kyber-768 hybrid key exchange successfully negotiated for 100% of internal microservice RPC calls.',
    source: 'Ingress Envoy Proxy',
    timestamp: new Date(Date.now() - 540 * 60 * 1000).toISOString(),
    status: 'READ',
    actionRequired: false,
    auditHash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    tenantName: 'All EU Enclaves'
  },

  // ================= COMPLIANCE OFFICER (DPO) ALERTS =================
  {
    id: 'ALT-DPO-001',
    role: 'COMPLIANCE_OFFICER',
    severity: 'CRITICAL',
    framework: 'GDPR',
    statutoryReference: 'GDPR Art. 33(1) - 72h Deadline',
    title: 'Article 33 Incident: 72-Hour Statutory Breach Window',
    description: 'Potential unauthorized employee account credential misuse detected in secondary customer portal. Statutory clock ticking: 38h 15m remaining to submit EDPB supervisory filing.',
    source: 'Incident Response & Breach Sentinel',
    timestamp: new Date(Date.now() - 2020 * 60 * 1000).toISOString(),
    deadlineHours: 72,
    deadlineIso: new Date(Date.now() + 38.25 * 3600 * 1000).toISOString(),
    status: 'UNREAD',
    isPinned: true,
    actionRequired: true,
    remediationAction: {
      id: 'file-art33-breach',
      label: 'Open Article 33 Filing Desk',
      description: 'Generate standardized supervisory report with eIDAS timestamp and dispatch to lead DPA.',
      targetPath: 'data-breach-notification'
    },
    auditHash: 'c2e28a58a9ca9908cf441e8c07d3b073045610ec1f2e19d268be9930f36f6d5e',
    tenantName: 'Enterprise FinTech SAS'
  },
  {
    id: 'ALT-DPO-002',
    role: 'COMPLIANCE_OFFICER',
    severity: 'HIGH',
    framework: 'GDPR',
    statutoryReference: 'GDPR Art. 17 (Right to Erasure)',
    title: 'Consent Revocation Batch Queued for Cryptographic Shredding',
    description: '1,240 European data subjects updated privacy preferences via DSAR portal. Automated zero-knowledge cryptographic erasure pending DPO approval.',
    source: 'DSAR & Consent Pipeline',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'UNREAD',
    actionRequired: true,
    remediationAction: {
      id: 'approve-erasure-batch',
      label: 'Authorize Cryptographic Shredding',
      description: 'Execute irreversible overwrite and append deletion certificate to ledger.',
      targetPath: 'dsar-portal',
      autoRemediable: true
    },
    auditHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    tenantName: 'E-Commerce Cloud EU'
  },
  {
    id: 'ALT-DPO-003',
    role: 'COMPLIANCE_OFFICER',
    severity: 'HIGH',
    framework: 'EU_AI_ACT',
    statutoryReference: 'EU AI Act Annex III & Art. 27',
    title: 'New High-Risk AI System Registration Required',
    description: 'Human Resources talent scoring algorithm AI-HR-PRO-2026 deployed in production. Mandatory Fundamental Rights Impact Assessment (FRIA) must be logged prior to deployment.',
    source: 'AI Model Registry & Governance',
    timestamp: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
    status: 'ACKNOWLEDGED',
    actionRequired: true,
    remediationAction: {
      id: 'initiate-fria',
      label: 'Launch FRIA Assessment Wizard',
      description: 'Complete statutory Article 27 questionnaire and generate EU AI Office registration.',
      targetPath: 'ai-model-governance'
    },
    auditHash: 'fcde2b2edba56bf408686e333d3a896445b0a1d6',
    tenantName: 'Enterprise HR Corp'
  },
  {
    id: 'ALT-DPO-004',
    role: 'COMPLIANCE_OFFICER',
    severity: 'MEDIUM',
    framework: 'GDPR',
    statutoryReference: 'GDPR Art. 12(3) - 30-Day Limit',
    title: 'Subject Access Request (DSAR #401) at Day 24',
    description: 'Data subject access request from German citizen expires in 6 calendar days. Telemetry extraction is 100% complete and awaiting DPO release sign-off.',
    source: 'DSAR Management Portal',
    timestamp: new Date(Date.now() - 410 * 60 * 1000).toISOString(),
    deadlineHours: 144,
    deadlineIso: new Date(Date.now() + 144 * 3600 * 1000).toISOString(),
    status: 'READ',
    actionRequired: true,
    remediationAction: {
      id: 'dispatch-dsar',
      label: 'Dispatch Encrypted DSAR Dossier',
      description: 'Transmit password-protected and signed DSAR package to subject.',
      targetPath: 'dsar-portal'
    },
    auditHash: '01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b',
    tenantName: 'Logistics Central Europe'
  },

  // ================= LAWYER / LEGAL COUNSEL ALERTS =================
  {
    id: 'ALT-LAW-001',
    role: 'LAWYER',
    severity: 'CRITICAL',
    framework: 'GDPR',
    statutoryReference: 'GDPR Art. 58(1) & Art. 83 Defense',
    title: 'Supervisory Authority Formal Inquiry Notice (CNIL / BfDI)',
    description: 'Formal regulatory inquiry received regarding third-party payment processing telemetry. Defense brief and evidence response required within 10 business days.',
    source: 'Regulatory Enforcement & Inquiries Gateway',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    deadlineHours: 240,
    deadlineIso: new Date(Date.now() + 240 * 3600 * 1000).toISOString(),
    status: 'UNREAD',
    isPinned: true,
    actionRequired: true,
    remediationAction: {
      id: 'draft-defense-brief',
      label: 'Draft Courtroom Defense Brief',
      description: 'Assemble statutory evidence package, calculate fine mitigation arguments, and draft response.',
      targetPath: 'lawyer-portal'
    },
    auditHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    tenantName: 'FinTech Sovereign AG'
  },
  {
    id: 'ALT-LAW-002',
    role: 'LAWYER',
    severity: 'CRITICAL',
    framework: 'SOVEREIGNTY',
    statutoryReference: 'EU Commercial Court Discovery Mandate',
    title: 'Pre-Litigation Discovery Hold Notice #LIT-2026-09',
    description: 'Litigation hold requested for dispute case #2026-EU-9012. Instant immutable data freeze required on tenant communication archives.',
    source: 'Legal Hold Management Engine',
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    status: 'UNREAD',
    actionRequired: true,
    remediationAction: {
      id: 'enforce-legal-hold',
      label: 'Enforce Immutable Legal Hold',
      description: 'Lock data deletion policies and apply immudb freeze marker.',
      targetPath: 'lawyer-portal',
      autoRemediable: true
    },
    auditHash: '7d793037a0760186574b0282f2f435e7',
    tenantName: 'Telecom Continental Europe'
  },
  {
    id: 'ALT-LAW-003',
    role: 'LAWYER',
    severity: 'HIGH',
    framework: 'GDPR',
    statutoryReference: 'Schrems II & EDPB Standard Contractual Clauses',
    title: 'Standard Contractual Clauses (SCC) 2026 Addendum Expiring',
    description: '4 transatlantic enterprise vendor contracts require updated Transfer Impact Assessments (TIA) and supplementary post-quantum encryption annexes.',
    source: 'Contract Lifecycle & SCC Engine',
    timestamp: new Date(Date.now() - 280 * 60 * 1000).toISOString(),
    status: 'READ',
    actionRequired: true,
    remediationAction: {
      id: 'update-scc-contracts',
      label: 'Launch TIA Contract Wizard',
      description: 'Generate standardized SCC addendum with sovereign clause guarantees.',
      targetPath: 'privacy-policy-generator'
    },
    auditHash: '127e6fbfe24a750e72930722ec88f13b1fb1f435b46da094359fe0b951487a61',
    tenantName: 'Global Cloud Systems'
  },
  {
    id: 'ALT-LAW-004',
    role: 'LAWYER',
    severity: 'MEDIUM',
    framework: 'EIDAS',
    statutoryReference: 'eIDAS Regulation (EU) No 910/2014 Art. 25',
    title: 'eIDAS Qualified Electronic Signature (QES) Certificate Renewal',
    description: 'Digital trust certificate used for court filing submissions will expire in 14 days. Hardware token re-certification required.',
    source: 'eIDAS Trust Anchor Integration',
    timestamp: new Date(Date.now() - 480 * 60 * 1000).toISOString(),
    status: 'READ',
    actionRequired: false,
    remediationAction: {
      id: 'renew-eidas',
      label: 'Renew Qualified Certificate',
      description: 'Submit re-certification payload to European Trust List provider.',
      targetPath: 'lawyer-portal'
    },
    auditHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    tenantName: 'Legal Counsel Chamber EU'
  }
];

export const SIMULATION_PRESETS: Omit<ComplianceAlert, 'id' | 'timestamp' | 'status' | 'auditHash'>[] = [
  {
    role: 'COMPLIANCE_OFFICER',
    severity: 'CRITICAL',
    framework: 'GDPR',
    statutoryReference: 'GDPR Art. 33(1)',
    title: '⚡ SIMULATED: Urgent 72h Article 33 Breach Event',
    description: 'Simulated ransomware exfiltration attempt flagged in Frankfurt secondary cluster. Immediate EDPB notification workflow triggered.',
    source: 'Breach Simulator Subsystem',
    deadlineHours: 72,
    actionRequired: true,
    remediationAction: {
      id: 'file-art33-breach',
      label: 'Open Article 33 Filing Desk',
      description: 'Generate emergency filing.',
      targetPath: 'data-breach-notification'
    },
    tenantName: 'Simulated Tenant Corp'
  },
  {
    role: 'SYSTEM_ADMIN',
    severity: 'CRITICAL',
    framework: 'NIS2',
    statutoryReference: 'NIS2 Art. 21(2)(h)',
    title: '⚡ SIMULATED: Zero-Trust HSM Key Compromise Alarm',
    description: 'Simulated unauthorized memory read detected near cryptographic boundary. Immediate HSM master key rotation recommended.',
    source: 'Zero-Trust Intrusion Sentinel',
    actionRequired: true,
    remediationAction: {
      id: 'rotate-hsm-key',
      label: 'Execute Emergency Key Rotation',
      description: 'Rotate keys across all sovereign enclaves.',
      targetPath: 'sudou',
      autoRemediable: true
    },
    tenantName: 'Primary Sovereign Mesh'
  },
  {
    role: 'AUDITOR',
    severity: 'CRITICAL',
    framework: 'SOVEREIGNTY',
    statutoryReference: 'EBSI / immudb Art. 32 Audit',
    title: '⚡ SIMULATED: immudb Tamper Verification Alarm',
    description: 'Simulated Merkle root divergence injected into test partition. Immediate blockchain ledger reconciliation required.',
    source: 'Audit Integrity Harness',
    actionRequired: true,
    remediationAction: {
      id: 'verify-ebsi-ledger',
      label: 'Verify EBSI Ledger Chain',
      description: 'Audit cryptographic block sequence.',
      targetPath: 'audit-ledger',
      autoRemediable: true
    },
    tenantName: 'Audit Test Entity'
  },
  {
    role: 'LAWYER',
    severity: 'CRITICAL',
    framework: 'GDPR',
    statutoryReference: 'GDPR Art. 83 & Title VIII Enforcement',
    title: '⚡ SIMULATED: Regulatory Fine Penalty Assessment Notice',
    description: 'Simulated EDPB preliminary fine notice received. Maximum statutory exposure calculated at €12,400,000. Defense brief required.',
    source: 'Enforcement Simulation Engine',
    deadlineHours: 120,
    actionRequired: true,
    remediationAction: {
      id: 'draft-defense-brief',
      label: 'Calculate Fine Mitigation & Brief',
      description: 'Generate defense mitigating factors.',
      targetPath: 'lawyer-portal'
    },
    tenantName: 'Regulated Client Corp'
  }
];
