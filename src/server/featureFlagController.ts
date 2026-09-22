import { getDb } from '../db/sqlite.js';

export const FeatureFlagController = {
  getFlags: (req: any, res: any) => {
    try {
      const db = getDb();
      const rows = db.prepare('SELECT * FROM platform_feature_flags').all();
      const flags = rows.map((r: any) => ({
        key: r.key,
        name: r.name,
        category: r.category,
        description: r.description,
        isEnabled: Boolean(r.is_enabled),
        circuitBreakerActive: Boolean(r.circuit_breaker_active),
        targetTenants: JSON.parse(r.target_tenants || '["ALL"]'),
        updatedAt: r.updated_at
      }));
      res.json({ success: true, flags });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
  
  updateFlag: (req: any, res: any) => {
    try {
      const { key } = req.params;
      const { isEnabled, circuitBreakerActive, targetTenants } = req.body;
      const db = getDb();
      
      const existing = db.prepare('SELECT * FROM platform_feature_flags WHERE key = ?').get(key) as any;
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Flag not found' });
      }
      
      db.prepare(`
        UPDATE platform_feature_flags 
        SET is_enabled = ?, circuit_breaker_active = ?, target_tenants = ?, updated_at = CURRENT_TIMESTAMP
        WHERE key = ?
      `).run(
        isEnabled ? 1 : 0, 
        circuitBreakerActive ? 1 : 0, 
        JSON.stringify(targetTenants || JSON.parse(existing.target_tenants)), 
        key
      );
      
      res.json({ success: true, message: 'Flag updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
  
  seedDefaults: () => {
    const db = getDb();
    const defaults = [
      {
        key: 'ai_guardrail_strict_block',
        name: 'AI Guardrail Strict Blocking',
        category: 'AI_SAFETY',
        description: 'When active, any prompt exceeding hallucination or PII thresholds is immediately blocked rather than fallback-sanitized.',
        isEnabled: 1,
        circuitBreakerActive: 0,
        targetTenants: '["ALL"]'
      },
      {
        key: 'sovereign_cross_border_block',
        name: 'Sovereign Cross-Border Transfer Lock',
        category: 'SOVEREIGN_ROUTING',
        description: 'Enforces strict regional data residency isolation, rejecting cross-region API payloads with 451 Unavailable for Legal Reasons.',
        isEnabled: 1,
        circuitBreakerActive: 0,
        targetTenants: '["ALL"]'
      },
      {
        key: 'quantum_pqc_hybrid_encryption',
        name: 'Quantum-Safe PQC Hybrid Encryption',
        category: 'CRYPTOGRAPHY',
        description: 'Enables CRYSTALS-Kyber post-quantum hybrid envelope encryption alongside standard AES-256-GCM for all Vault records.',
        isEnabled: 0,
        circuitBreakerActive: 0,
        targetTenants: '["tenant-enterprise-fintech-01"]'
      },
      {
        key: 'b2g_automated_statutory_relay',
        name: 'B2G Automated Statutory Filing Relay',
        category: 'B2G_COMPLIANCE',
        description: 'Directly transmits DORA incident reports and AI Act conformity dossiers to government regulatory endpoints.',
        isEnabled: 1,
        circuitBreakerActive: 0,
        targetTenants: '["ALL"]'
      },
      {
        key: 'eu_ai_act_monitoring',
        name: 'EU AI Act Conformity Monitoring',
        category: 'AI_SAFETY',
        description: 'Continuously monitors AI models and datasets for EU AI Act compliance.',
        isEnabled: 0,
        circuitBreakerActive: 0,
        targetTenants: '[]'
      },
      {
        key: 'nis2_compliance_module',
        name: 'NIS2 Cyber Resilience Module',
        category: 'SYSTEM',
        description: 'Enables NIS2 incident reporting workflows and supply chain audits.',
        isEnabled: 0,
        circuitBreakerActive: 0,
        targetTenants: '[]'
      },
      {
        key: 'emergency_circuit_breaker_all',
        name: 'Emergency System-Wide Circuit Breaker',
        category: 'SYSTEM',
        description: 'Master kill-switch halting all non-essential API ingestion and queuing incoming requests during high-severity threat events.',
        isEnabled: 0,
        circuitBreakerActive: 1,
        targetTenants: '["ALL"]'
      },
      {
        key: 'gdpr_compliance_engine',
        name: 'GDPR Compliance Engine',
        category: 'REGULATION',
        description: 'Enforces GDPR (Regulation EU 2016/679) subject rights, ROPA and sovereign data isolation rules.',
        isEnabled: 1,
        circuitBreakerActive: 0,
        targetTenants: '["ALL"]'
      },
      {
        key: 'ccpa_optout_control',
        name: 'CCPA / CPRA Opt-Out Control',
        category: 'REGULATION',
        description: 'Granular sale-of-data opt-out controls and verified no-sale enforcement for California privacy law.',
        isEnabled: 0,
        circuitBreakerActive: 0,
        targetTenants: '["ALL"]'
      },
      {
        key: 'dora_resiliency_sandbox',
        name: 'DORA Resiliency Sandbox',
        category: 'REGULATION',
        description: 'EU DORA (2022/2554) ICT resilience drills, multi-region fallback verification and incident reporting relay.',
        isEnabled: 1,
        circuitBreakerActive: 0,
        targetTenants: '["ALL"]'
      },
      {
        key: 'national_scan_engine',
        name: 'National Scanning Engine & B2G Clearinghouse',
        category: 'B2G_SCANNING',
        description: 'Gates the National Scanning Engine war-room and the Regulatory Billing Unification Center (shared sovereign-clearinghouse gate).',
        isEnabled: 1,
        circuitBreakerActive: 0,
        targetTenants: '["ALL"]'
      }
    ];
    
    const insert = db.prepare(`
      INSERT OR IGNORE INTO platform_feature_flags (key, name, category, description, is_enabled, circuit_breaker_active, target_tenants)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    defaults.forEach(d => {
      insert.run(d.key, d.name, d.category, d.description, d.isEnabled, d.circuitBreakerActive, d.targetTenants);
    });
  }
};
