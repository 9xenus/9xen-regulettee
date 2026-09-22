export interface AuditTrailEvent {
  id: string;
  timestamp: string; // ISO 8601
  category: "SYSTEM_CHANGE" | "ENFORCEMENT_ACTION" | "SECURITY_KEY" | "POLICY_UPDATE" | "PRIVACY_DSAR";
  action: string;
  actor: {
    id: string;
    name: string;
    role: "SYSTEM_KERNEL" | "SECURITY_ADMIN" | "AUTO_GUARDRAIL" | "DPO_OFFICER" | "REGULATOR_NODE" | "HSM_ENCLAVE" | "LAWYER_COUNSEL" | "AUDITOR" | string;
    ipAddress?: string;
  };
  target: {
    type: "TENANT" | "RULE" | "KEY" | "GATEWAY" | "MODEL" | "USER_RECORD";
    id: string;
    name: string;
  };
  status: "ENFORCED" | "APPLIED" | "BLOCKED" | "VERIFIED" | "PENDING_ATTESTATION";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  description: string;
  cryptographicProof: {
    algorithm: "KYBER-1024" | "SHA-256-HMAC" | "ED25519-ATTESTED";
    hash: string;
    ledgerSequence: number;
    enclaveAttestationId: string;
  };
  metadata?: Record<string, any>;
  diff?: {
    before?: string | Record<string, any>;
    after?: string | Record<string, any>;
  };
}

export const INITIAL_AUDIT_TRAIL_EVENTS: AuditTrailEvent[] = [
  {
    id: "evt-9x-88915",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
    category: "POLICY_UPDATE",
    action: "LEGAL_TERMS_COMPLIANCE_SIGN_OFF",
    actor: {
      id: "usr-lawyer-09",
      name: "Adv. Sarah Sterling (Lead Counsel)",
      role: "LAWYER_COUNSEL",
      ipAddress: "192.168.1.102"
    },
    target: {
      type: "RULE",
      id: "policy-data-processing-agmt-2026",
      name: "Data Processing Agreement (DPA v4.2)"
    },
    status: "ENFORCED",
    severity: "HIGH",
    description: "Legal review completed for cross-border SCC clauses. Approved regulatory alignment under EU AI Act & NIS2 Directives.",
    cryptographicProof: {
      algorithm: "ED25519-ATTESTED",
      hash: "7f8a9b0c1d2e3f4a5b6c7d8e9f0123456789abcdef0123456789abcdef012345",
      ledgerSequence: 184515,
      enclaveAttestationId: "attest-fra-nitro-9924"
    },
    metadata: {
      legalJurisdiction: "EU / DE",
      sccClauseVersion: "2021/914",
      attestingLawyerLicense: "DE-BAR-88391"
    }
  },
  {
    id: "evt-9x-88914",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    category: "ENFORCEMENT_ACTION",
    action: "AUDITOR_SAMPLING_INSPECTION_EXECUTED",
    actor: {
      id: "usr-auditor-77",
      name: "Henri Dupont (KPMG Lead ISO Auditor)",
      role: "AUDITOR",
      ipAddress: "10.200.12.8"
    },
    target: {
      type: "TENANT",
      id: "tenant-fintech-eu",
      name: "Fintech Tenant Sandbox (SOC2 Type II Scope)"
    },
    status: "VERIFIED",
    severity: "INFO",
    description: "Independent audit sampling initiated for SOC2 Type II & NIS2 Article 21 compliance. Zero non-conformities found in HSM key chain.",
    cryptographicProof: {
      algorithm: "SHA-256-HMAC",
      hash: "9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c",
      ledgerSequence: 184514,
      enclaveAttestationId: "attest-fra-nitro-9923"
    },
    metadata: {
      auditFramework: "SOC2_TYPE_2 / ISO27001:2022",
      samplesInspected: 1420,
      complianceScore: "100%"
    }
  },
  {
    id: "evt-9x-88913",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
    category: "SYSTEM_CHANGE",
    action: "SYSTEM_ADMIN_ZERO_TRUST_ACL_PROVISIONED",
    actor: {
      id: "usr-admin-01",
      name: "Alexander Mercer (Chief Admin)",
      role: "SECURITY_ADMIN",
      ipAddress: "10.0.1.5"
    },
    target: {
      type: "GATEWAY",
      id: "gateway-core-api",
      name: "Production Gateway Ingress Route"
    },
    status: "APPLIED",
    severity: "HIGH",
    description: "Enforced strict Zero-Trust Mutual TLS (mTLS) requirement across all administrative endpoints.",
    cryptographicProof: {
      algorithm: "KYBER-1024",
      hash: "3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef012",
      ledgerSequence: 184513,
      enclaveAttestationId: "attest-fra-nitro-9922"
    }
  },
  {
    id: "evt-9x-88912",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    category: "ENFORCEMENT_ACTION",
    action: "PROHIBITED_AI_INFERENCE_BLOCKED",
    actor: {
      id: "guardrail-enclave-01",
      name: "Sovereign AI Act Guardrail",
      role: "AUTO_GUARDRAIL",
      ipAddress: "10.128.4.19"
    },
    target: {
      type: "MODEL",
      id: "llm-tenant-org1",
      name: "Customer Sentiment Model (Gemini Gateway)"
    },
    status: "ENFORCED",
    severity: "CRITICAL",
    description: "Automated block applied under EU AI Act Article 5(1)(c). Emotion recognition payload detected in workplace monitoring prompt.",
    cryptographicProof: {
      algorithm: "SHA-256-HMAC",
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      ledgerSequence: 184512,
      enclaveAttestationId: "attest-fra-nitro-9921"
    },
    metadata: {
      ruleCode: "AI-ACT-ART-5",
      decisionLatencyMs: 8.4,
      tenantId: "org_1",
      mitigation: "Payload neutralized, tenant compliance officer notified via sovereign webhook."
    },
    diff: {
      before: "Incoming payload containing worker biometric tracking flags",
      after: "HTTP 403 Regulatory Quarantine [Rule AI-ACT-ART-5]"
    }
  },
  {
    id: "evt-9x-88911",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    category: "SECURITY_KEY",
    action: "POST_QUANTUM_KMS_KEY_ROTATION",
    actor: {
      id: "hsm-root-fra01",
      name: "Hardware Security Module (Frankfurt Enclave)",
      role: "HSM_ENCLAVE",
      ipAddress: "127.0.0.1"
    },
    target: {
      type: "KEY",
      id: "kms-kyber-v4-99",
      name: "Primary Tenant Data Encryption Key #99"
    },
    status: "VERIFIED",
    severity: "INFO",
    description: "Automated 30-day scheduled rotation executed. New Kyber-1024 lattice keypair generated inside FIPS 140-3 Level 4 HSM.",
    cryptographicProof: {
      algorithm: "KYBER-1024",
      hash: "8f4b2a76c0de1234a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6",
      ledgerSequence: 184511,
      enclaveAttestationId: "attest-fra-nitro-9920"
    },
    metadata: {
      keyAlgorithm: "ML-KEM-1024 (Kyber)",
      previousKeyId: "kms-kyber-v4-98",
      reEncryptionBacklog: "0 records pending"
    }
  },
  {
    id: "evt-9x-88910",
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(), // 42 mins ago
    category: "POLICY_UPDATE",
    action: "DORA_ICT_CONCENTRATION_RULE_UPDATED",
    actor: {
      id: "usr-sec-officer-01",
      name: "Marcella Vance (Lead Compliance Officer)",
      role: "DPO_OFFICER",
      ipAddress: "192.168.10.45"
    },
    target: {
      type: "RULE",
      id: "rule-dora-third-party-04",
      name: "ICT Critical Third-Party Multi-Region Failover Rule"
    },
    status: "APPLIED",
    severity: "HIGH",
    description: "Adjusted max allowed single-cloud vendor concentration threshold from 45% to 35% across EU banking workloads.",
    cryptographicProof: {
      algorithm: "ED25519-ATTESTED",
      hash: "4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123",
      ledgerSequence: 184510,
      enclaveAttestationId: "attest-fra-nitro-9919"
    },
    diff: {
      before: { maxConcentrationRatio: 0.45, requiredFailoverRegions: ["eu-central-1"] },
      after: { maxConcentrationRatio: 0.35, requiredFailoverRegions: ["eu-central-1", "eu-west-1"] }
    }
  },
  {
    id: "evt-9x-88909",
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(), // ~1.5 hrs ago
    category: "PRIVACY_DSAR",
    action: "GDPR_ARTICLE_17_CRYPTO_SHRED",
    actor: {
      id: "dsar-orchestrator-eu",
      name: "Automated DSAR & Erasure Engine",
      role: "DPO_OFFICER",
      ipAddress: "10.128.8.4"
    },
    target: {
      type: "USER_RECORD",
      id: "sub-eu-849204",
      name: "Data Subject ID #849204 (Consent Revoked)"
    },
    status: "ENFORCED",
    severity: "MEDIUM",
    description: "Zero-knowledge cryptographic shredding verified. Subject encryption key deleted from HSM; ciphertext permanently unrecoverable across 14 shards.",
    cryptographicProof: {
      algorithm: "SHA-256-HMAC",
      hash: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      ledgerSequence: 184509,
      enclaveAttestationId: "attest-fra-nitro-9918"
    },
    metadata: {
      shardsPruned: 14,
      verificationProof: "ZK-SNARK-SHRED-PROOF-v2",
      statutoryCompliance: "GDPR Art 17(1)(b)"
    }
  },
  {
    id: "evt-9x-88908",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hrs ago
    category: "SYSTEM_CHANGE",
    action: "MULTI_TENANT_RLS_RE_ATTESTATION",
    actor: {
      id: "kernel-db-guard",
      name: "Sovereign Database Kernel",
      role: "SYSTEM_KERNEL",
      ipAddress: "127.0.0.1"
    },
    target: {
      type: "TENANT",
      id: "tenant-cluster-all",
      name: "All Active Enterprise Tenant Partitions (1,248 Tenants)"
    },
    status: "VERIFIED",
    severity: "INFO",
    description: "Continuous integrity scan completed. Row-level security (RLS) policies and tenant schema boundary isolation validated across 100% of data shards.",
    cryptographicProof: {
      algorithm: "SHA-256-HMAC",
      hash: "9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      ledgerSequence: 184508,
      enclaveAttestationId: "attest-fra-nitro-9917"
    }
  },
  {
    id: "evt-9x-88907",
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(), // ~5.3 hrs ago
    category: "ENFORCEMENT_ACTION",
    action: "CROSS_BORDER_EGRESS_QUARANTINE",
    actor: {
      id: "gateway-sovereign-node",
      name: "Sovereign Data Gateway (node-fra-01)",
      role: "AUTO_GUARDRAIL",
      ipAddress: "10.0.0.1"
    },
    target: {
      type: "GATEWAY",
      id: "stream-telemetry-us",
      name: "Unencrypted Analytics Pipe -> US-East-1"
    },
    status: "BLOCKED",
    severity: "CRITICAL",
    description: "Attempted outbound transfer of EU citizen IP addresses halted. Enforced GDPR Chapter V and Schrems II sovereign residency requirements.",
    cryptographicProof: {
      algorithm: "SHA-256-HMAC",
      hash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
      ledgerSequence: 184507,
      enclaveAttestationId: "attest-fra-nitro-9916"
    },
    metadata: {
      blockedBytes: 4194304,
      sourceEndpoint: "https://api.internal/analytics/raw",
      destinationCountry: "US",
      violationCode: "RESIDENCY-SOVEREIGNTY-STRICT"
    }
  },
  {
    id: "evt-9x-88906",
    timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10 hrs ago
    category: "SYSTEM_CHANGE",
    action: "NIS2_EARLY_WARNING_DISPATCH",
    actor: {
      id: "csirt-connector-01",
      name: "B2G CSIRT Automated Bridge",
      role: "REGULATOR_NODE",
      ipAddress: "194.105.14.2"
    },
    target: {
      type: "GATEWAY",
      id: "b2g-eu-csirt-pipe",
      name: "EU Cybersecurity Agency (ENISA CSIRT Node)"
    },
    status: "ENFORCED",
    severity: "HIGH",
    description: "Statutory 24-hour early warning notification sent following high-volume DDoS mitigation on peripheral DNS cluster.",
    cryptographicProof: {
      algorithm: "ED25519-ATTESTED",
      hash: "f0e1d2c3b4a5968778695a4b3c2d1e0f0e1d2c3b4a5968778695a4b3c2d1e0f",
      ledgerSequence: 184506,
      enclaveAttestationId: "attest-fra-nitro-9915"
    }
  }
];

export async function getAuditTrailEvents(options?: {
  category?: string;
  severity?: string;
  role?: string;
  search?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
}): Promise<any[]> {
  if (typeof window !== 'undefined') {
    // Client-side: call API
    const params = new URLSearchParams();
    if (options?.category) params.set('category', options.category);
    if (options?.severity) params.set('severity', options.severity);
    if (options?.search) params.set('search', options.search);
    if (options?.sortOrder) params.set('sortOrder', options.sortOrder);
    if (options?.limit) params.set('limit', options.limit.toString());
    
    const res = await fetch(`/api/v1/audit/trail?${params.toString()}`);
    const data = await res.json();
    return data.success ? data.events : [];
  }

  // Server-side: direct DB query
  const { queryPg } = await import('../db/postgres');
  let query = 'SELECT * FROM admin_audit_log WHERE 1=1';
  const params: any[] = [];
  let paramCount = 1;

  if (options?.category) {
    query += ` AND resource_type = $${paramCount++}`;
    params.push(options.category);
  }
  
  if (options?.severity) {
    query += ` AND severity = $${paramCount++}`;
    params.push(options.severity);
  }

  query += ` ORDER BY created_at ${options?.sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
  if (options?.limit) {
    query += ` LIMIT $${paramCount++}`;
    params.push(options.limit);
  }

  return await queryPg(query, params);
}

export async function logAuditTrailEvent(event: any): Promise<void> {
  if (typeof window !== 'undefined') {
    // Client-side: call API
    await fetch('/api/v1/audit/trail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    return;
  }

  // Server-side: direct DB query
  const { queryPg } = await import('../db/postgres');
  await queryPg(
    `INSERT INTO admin_audit_log (admin_user_id, action, resource_type, resource_id, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      event.actor?.id || 'system',
      event.action,
      event.category,
      event.target?.id || 'none',
      JSON.stringify(event.metadata || {})
    ]
  );
}

export const auditTrailService = {
  addEvent: logAuditTrailEvent,
  getEvents: getAuditTrailEvents,
};
