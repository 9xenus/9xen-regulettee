import crypto from 'crypto';
import { getDb } from '../../db/sqlite';
import { getPublicEndpoints } from '../../config/publicUrlConfig';

const __inferenceUrl = (region: string) => `https://${region}.inference.${getPublicEndpoints().baseDomain}/v1`;

export function seedRegTechSaasData() {
  try {
    const db = getDb();
    // 1. Seed Plans
    const planCount = db.prepare('SELECT count(*) as c FROM regtech_plans').get() as { c: number };
    if (planCount.c === 0) {
      const stmt = db.prepare(`
        INSERT INTO regtech_plans (id, name, entitlements, rate_limit_per_day, price_monthly)
        VALUES (?, ?, ?, ?, ?)
      `);
      db.transaction(() => {
        stmt.run(
          'plan_free',
          'free',
          JSON.stringify({
            module1: 'basic',
            module2: 'exact_cache_only',
            module3: false,
            module4: false,
            websocket: false
          }),
          100,
          0
        );
        stmt.run(
          'plan_pro',
          'pro',
          JSON.stringify({
            module1: 'full',
            module2: 'full_semantic',
            module3: false,
            module4: 'monthly_scheduled',
            websocket: true
          }),
          10000,
          199
        );
        stmt.run(
          'plan_enterprise',
          'enterprise',
          JSON.stringify({
            module1: 'full_custom',
            module2: 'full_unlimited',
            module3: true,
            module4: 'ondemand_and_scheduled',
            websocket: true
          }),
          1000000,
          999
        );
      })();
      console.log('[REGTECH_SEED] Seeded standard SaaS subscription plans.');
    }

    // 2. Seed Default Demo Organizations
    const orgCount = db.prepare('SELECT count(*) as c FROM regtech_organizations').get() as { c: number };
    if (orgCount.c === 0) {
      const defaultApiKey = 'lex_live_sec_9934810294821034';
      const hash = crypto.createHash('sha256').update(defaultApiKey).digest('hex');

      db.prepare(`
        INSERT INTO regtech_organizations (id, name, plan, api_key_hash, raw_api_key_prefix, industry_type, country_code)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'org_enterprise_default',
        'Acme Financial & Healthcare Global Corp',
        'enterprise',
        hash,
        'lex_live_sec_...',
        'FINTECH',
        'EU'
      );

      // Seed user
      db.prepare(`
        INSERT INTO regtech_users (id, org_id, email, role)
        VALUES (?, ?, ?, ?)
      `).run('user_root', 'org_enterprise_default', 'compliance.officer@acme.eu', 'owner');

      console.log('[REGTECH_SEED] Seeded default Enterprise Organization.');
    }

    // 2.1 Seed Default Integrations for Demo Org
    const integrationCount = db.prepare('SELECT count(*) as c FROM regtech_integrations').get() as { c: number };
    if (integrationCount.c === 0) {
      const intStmt = db.prepare(`
        INSERT INTO regtech_integrations (id, org_id, name, type, platform, status, settings, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      db.transaction(() => {
        intStmt.run(
          'int_sf_crm',
          'org_enterprise_default',
          'Frankfurt Core Salesforce CRM',
          'CRM',
          'Salesforce',
          'CONNECTED',
          JSON.stringify({ apiUrl: 'https://eu44.salesforce.com/services/data/v58.0', scope: 'Lead Tracking & Consent Audit' }),
          '2026-06-15T08:30:00Z'
        );
        intStmt.run(
          'int_sap_erp',
          'org_enterprise_default',
          'Heidelberg SAP S/4HANA ERP',
          'ERP',
          'SAP',
          'CONNECTED',
          JSON.stringify({ apiUrl: 'https://sap-gateway.acme.eu/api', scope: 'Financial Integrity & DORA' }),
          '2026-07-10T11:00:00Z'
        );
        intStmt.run(
          'int_aws_cloud',
          'org_enterprise_default',
          'AWS Sovereignty Enclave (eu-central-1)',
          'Cloud',
          'AWS',
          'CONNECTED',
          JSON.stringify({ apiUrl: 'https://sts.eu-central-1.amazonaws.com', scope: 'Data Residency & Encryption' }),
          '2026-08-01T16:40:00Z'
        );
      })();
      console.log('[REGTECH_SEED] Seeded default software integrations.');
    }

    // 3. Seed Regional Endpoints (Module 3)
    const epCount = db.prepare('SELECT count(*) as c FROM regtech_regional_endpoints').get() as { c: number };
    if (epCount.c === 0) {
      const epStmt = db.prepare(`
        INSERT INTO regtech_regional_endpoints (id, region, name, endpoint_type, endpoint_url, latency_ms, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      db.transaction(() => {
        epStmt.run('ep_eu', 'eu-central-1', 'Frankfurt EU GDPR Enclave', 'managed', __inferenceUrl('eu-central'), 14, 'active');
        epStmt.run('ep_bd', 'bd-local', 'Dhaka Sovereign Cloud Enclave', 'managed', __inferenceUrl('dhaka-edge'), 22, 'active');
        epStmt.run('ep_in', 'ap-south-1', 'Mumbai DPDP Sovereign Enclave', 'managed', __inferenceUrl('mumbai'), 28, 'active');
        epStmt.run('ep_us', 'us-east-1', 'N. Virginia General Cloud', 'managed', __inferenceUrl('us-east'), 45, 'active');
        epStmt.run('ep_sandbox', 'client-onprem-sandbox', 'Client On-Premises Isolated Node', 'client_sandbox', 'http://192.168.1.100:8080/v1', 6, 'active');
      })();
      console.log('[REGTECH_SEED] Seeded regional sovereign endpoints.');
    }

    // 4. Seed Standard Guardrail Rules (Module 1)
    const ruleCount = db.prepare('SELECT count(*) as c FROM regtech_guardrail_rules').get() as { c: number };
    if (ruleCount.c === 0) {
      const rStmt = db.prepare(`
        INSERT INTO regtech_guardrail_rules (id, org_id, name, rule_type, config, fallback_action, fallback_payload, confidence_min, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      db.transaction(() => {
        rStmt.run(
          'rule_pii_strip',
          'org_enterprise_default',
          'Automated PII & Personal Data Strip',
          'pii_filter',
          JSON.stringify({ piiCheck: true }),
          'safe_default',
          'Response sanitized under GDPR Article 32 data minimization.',
          0.85,
          1
        );
        rStmt.run(
          'rule_anti_hallucination',
          'org_enterprise_default',
          'Anti-Hallucination & Fact Consistency Verification',
          'fact_check',
          JSON.stringify({ citationRequired: true }),
          'retry',
          null,
          0.90,
          1
        );
        rStmt.run(
          'rule_banned_claims',
          'org_enterprise_default',
          'Misleading Financial & Medical Claims Blocklist',
          'regex',
          JSON.stringify({
            bannedPatterns: [
              'guaranteed 100% cure',
              'risk-free investment',
              'insider trading secret',
              'bypass legal compliance'
            ]
          }),
          'safe_default',
          'Regulatory Notice: Statements containing unqualified guarantees or regulatory bypasses are prohibited by EU AI Act Article 14.',
          0.85,
          1
        );
      })();
      console.log('[REGTECH_SEED] Seeded Module 1 Guardrail Rules.');
    }

    // 4.1 Seed Specialized Industry Compliance Checklist (Module 4)
    const checklistCount = db.prepare('SELECT count(*) as c FROM regtech_compliance_checklists').get() as { c: number };
    if (checklistCount.c === 0) {
      const cStmt = db.prepare(`
        INSERT INTO regtech_compliance_checklists (id, regulation, category, requirement, severity, active)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      db.transaction(() => {
        // AI Tech
        cStmt.run('chk_ai_1', 'EU_AI_ACT', 'model_behavior', 'Technical documentation on training data bias mitigation strategies.', 'HIGH', 1);
        cStmt.run('chk_ai_2', 'EU_AI_ACT', 'privacy', 'Human-in-the-loop oversight mechanism for high-risk AI systems.', 'CRITICAL', 1);
        
        // Healthcare
        cStmt.run('chk_health_1', 'HIPAA', 'data_security', 'End-to-end encryption for HL7/FHIR health data interchange.', 'CRITICAL', 1);
        cStmt.run('chk_health_2', 'GDPR_HEALTH', 'privacy', 'Explicit patient consent for secondary diagnostic data usage.', 'HIGH', 1);
        
        // Logistics
        cStmt.run('chk_log_1', 'PRIVACY_IOT', 'data_security', 'Geolocation truncation to 3 decimal places for driver privacy.', 'MEDIUM', 1);
        cStmt.run('chk_log_2', 'SUPPLY_CHAIN', 'legal_risk', 'Verification of tier-1 vendor data residency compliance.', 'HIGH', 1);
        
        // GovTech
        cStmt.run('chk_gov_1', 'SOVEREIGN_CLOUD', 'data_security', 'Sovereign enclave access restricted to authorized personnel only.', 'CRITICAL', 1);
        cStmt.run('chk_gov_2', 'G2B_PROTOCOL', 'legal_risk', 'Mandatory MFA for all national data portal administrative gateways.', 'HIGH', 1);
      })();
      console.log('[REGTECH_SEED] Seeded specialized industry compliance checklists.');
    }

    // 5. Seed Static FAQ Rules (Module 2)
    const staticCount = db.prepare('SELECT count(*) as c FROM regtech_static_rules').get() as { c: number };
    if (staticCount.c === 0) {
      const sStmt = db.prepare(`
        INSERT INTO regtech_static_rules (id, org_id, trigger_type, trigger_value, static_answer, active)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      db.transaction(() => {
        sStmt.run(
          'srule_gdpr_dpo',
          'org_enterprise_default',
          'keyword',
          'dpo contact, data protection officer email',
          'The appointed Data Protection Officer (DPO) for our enterprise is reachable at dpo@acme.eu under GDPR Article 37.',
          1
        );
        sStmt.run(
          'srule_data_retention',
          'org_enterprise_default',
          'keyword',
          'data retention period, how long do you keep data',
          'In accordance with our statutory record-keeping policy, transactional data is stored in sovereign cold-vault enclaves for 7 years.',
          1
        );
      })();
    }

    // 6. Seed Residency Policies (Module 3)
    const resPolCount = db.prepare('SELECT count(*) as c FROM regtech_residency_policies').get() as { c: number };
    if (resPolCount.c === 0) {
      const pStmt = db.prepare(`
        INSERT INTO regtech_residency_policies (id, org_id, data_category, allowed_region, enforcement, active)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      db.transaction(() => {
        pStmt.run('respol_financial', 'org_enterprise_default', 'financial', 'eu-central-1', 'strict', 1);
        pStmt.run('respol_gov', 'org_enterprise_default', 'government', 'eu-central-1', 'strict', 1);
        pStmt.run('respol_pii', 'org_enterprise_default', 'pii', 'eu-central-1', 'strict', 1);
        pStmt.run('respol_default', 'org_enterprise_default', 'default', 'eu-central-1', 'soft', 1);
      })();
    }

    // 7. Seed Initial Request Logs & Residency Audit Chain
    const logCount = db.prepare('SELECT count(*) as c FROM regtech_request_logs').get() as { c: number };
    if (logCount.c === 0) {
      const reqStmt = db.prepare(`
        INSERT INTO regtech_request_logs 
        (id, org_id, input_prompt, llm_output, verdict, flag_reasons, confidence_score, latency_ms, tokens_used, model_used, target_region, llm_call_avoided, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const resStmt = db.prepare(`
        INSERT INTO regtech_residency_audit_logs 
        (id, org_id, request_id, data_classification, target_region, compliance_basis, hash_chain, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      let prevHash = 'GENESIS_SOVEREIGN_ROOT_00000000000000000000';
      const now = Date.now();

      db.transaction(() => {
        for (let i = 0; i < 8; i++) {
          const reqId = `req_seed_${i + 1}`;
          const isAvoided = i % 3 !== 0;
          const verdict = i === 3 ? 'FLAGGED' : 'PASSED';
          const prompt = i === 0 ? 'Explain GDPR Article 32 security measures' : `Audit client transactions batch #${i + 100}`;
          const output = `Compliant output analysis for request #${i + 1}. All checks passed successfully.`;

          reqStmt.run(
            reqId,
            'org_enterprise_default',
            prompt,
            output,
            verdict,
            JSON.stringify(verdict === 'FLAGGED' ? [{ type: 'WARN', message: 'Minor prompt ambiguity' }] : []),
            0.96,
            isAvoided ? 24 : 410,
            isAvoided ? 0 : 340,
            'gpt-4o',
            'eu-central-1',
            isAvoided ? 1 : 0,
            new Date(now - (8 - i) * 3600 * 1000).toISOString()
          );

          const classification = {
            contains_pii: i % 2 === 0,
            contains_financial: true,
            contains_health: false,
            contains_government: false,
            sensitivity_level: 'CONFIDENTIAL',
            detected_entities: ['IBAN Identifier']
          };

          const hashChain = crypto.createHash('sha256').update(`${prevHash}|org_enterprise_default|${reqId}|eu-central-1`).digest('hex');
          prevHash = hashChain;

          resStmt.run(
            `reslog_seed_${i + 1}`,
            'org_enterprise_default',
            reqId,
            JSON.stringify(classification),
            'eu-central-1',
            'EU GDPR Chapter V Sovereign Enclave (Frankfurt)',
            hashChain,
            new Date(now - (8 - i) * 3600 * 1000).toISOString()
          );
        }
      })();
    }
  } catch (err) {
    console.error('[REGTECH_SEED_ERROR]', err);
  }
}
