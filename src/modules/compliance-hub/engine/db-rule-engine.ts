import crypto from 'crypto';
import { Engine } from 'json-rules-engine';
import { getDb } from '../../../db/sqlite';

export interface DynamicRuleset {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  industryVertical: string | null;
  region: string | null;
  description: string | null;
  lawActName: string | null;
  legalCitation: string | null;
  jurisdiction: string | null;
  enforcingAuthority: string | null;
  maxStatutoryFine: string | null;
  criticalFeatures: Record<string, any>;
  rules: DynamicRule[];
}

export interface DynamicRule {
  id: string;
  rulesetId: string;
  ruleCode: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string | null;
  triggerType: string | null;
  conditionExpression: Record<string, any> | null;
  description: string | null;
  enforcementAction: string | null;
}

export interface RuleEvaluationFact {
  event?: string;
  check?: string;
  [k: string]: any;
}

export interface RuleEvaluationResult {
  compliant: boolean;
  matchedRules: {
    rulesetId: string;
    rulesetName?: string;
    rule: { code: string; title: string; severity: string; trigger: string | null };
    event: { type: string; params: any };
  }[];
  evaluatedAt: string;
}

const safeParse = (s: string | null | undefined, fallback: any = null) => {
  if (!s) return fallback;
  try { return JSON.parse(s); } catch { return fallback; }
};

export class DbDrivenRuleEngine {
  /** Create a ruleset with an accompanying initial rule set. */
  public createRuleset(input: {
    name: string;
    slug: string;
    category?: string;
    industryVertical?: string;
    region?: string;
    description?: string;
    lawActName?: string;
    legalCitation?: string;
    jurisdiction?: string;
    enforcingAuthority?: string;
    maxStatutoryFine?: string;
    criticalFeatures?: Record<string, any>;
    rules?: Array<Omit<DynamicRule, 'id' | 'rulesetId'>>;
  }): { ruleset: DynamicRuleset; addedRules: number } {
    const db = getDb();
    const rulesetId = `rs_${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO dynamic_rulesets
        (id, name, slug, category, industry_vertical, region, description, law_act_name, legal_citation, jurisdiction, enforcing_authority, max_statutory_fine, critical_features_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      rulesetId,
      input.name,
      input.slug,
      input.category || null,
      input.industryVertical || null,
      input.region || null,
      input.description || null,
      input.lawActName || null,
      input.legalCitation || null,
      input.jurisdiction || null,
      input.enforcingAuthority || null,
      input.maxStatutoryFine || null,
      JSON.stringify(input.criticalFeatures || {})
    );

    let added = 0;
    for (const r of input.rules || []) {
      this.addRule(rulesetId, r);
      added++;
    }
    return { ruleset: this.getRuleset(rulesetId)!, addedRules: added };
  }

  public addRule(rulesetId: string, input: Omit<DynamicRule, 'id' | 'rulesetId'>): DynamicRule {
    const db = getDb();
    const id = `rul_${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO dynamic_rules
        (id, ruleset_id, rule_code, title, severity, category, trigger_type, condition_expression, description, enforcement_action)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      rulesetId,
      input.ruleCode,
      input.title,
      input.severity,
      input.category || null,
      input.triggerType || null,
      input.conditionExpression ? JSON.stringify(input.conditionExpression) : null,
      input.description || null,
      input.enforcementAction || null
    );
    return {
      id,
      rulesetId,
      ruleCode: input.ruleCode,
      title: input.title,
      severity: input.severity,
      category: input.category || null,
      triggerType: input.triggerType || null,
      conditionExpression: input.conditionExpression || null,
      description: input.description || null,
      enforcementAction: input.enforcementAction || null
    };
  }

  public listRulesets(filters?: { jurisdiction?: string; category?: string; law?: string }): DynamicRuleset[] {
    const db = getDb();
    let sql = `SELECT * FROM dynamic_rulesets WHERE 1=1`;
    const params: any[] = [];
    if (filters?.jurisdiction) { sql += ` AND jurisdiction = ?`; params.push(filters.jurisdiction); }
    if (filters?.category) { sql += ` AND category = ?`; params.push(filters.category); }
    if (filters?.law) { sql += ` AND law_act_name = ?`; params.push(filters.law); }
    sql += ` ORDER BY created_at DESC`;
    const rows = db.prepare(sql).all(...params) as any[];
    return rows.map(r => this.rowToRuleset(r));
  }

  public getRuleset(idOrSlug: string): DynamicRuleset | null {
    const db = getDb();
    const row = db.prepare(`SELECT * FROM dynamic_rulesets WHERE id = ? OR slug = ?`).get(idOrSlug, idOrSlug) as any;
    return row ? this.rowToRuleset(row) : null;
  }

  public deleteRuleset(idOrSlug: string): boolean {
    const db = getDb();
    const rs = this.getRuleset(idOrSlug);
    if (!rs) return false;
    db.prepare(`DELETE FROM dynamic_rules WHERE ruleset_id = ?`).run(rs.id);
    db.prepare(`DELETE FROM dynamic_rulesets WHERE id = ?`).run(rs.id);
    return true;
  }

  public getRuleCount(): number {
    const db = getDb();
    const row = db.prepare(`SELECT COUNT(*) AS c FROM dynamic_rules`).get() as any;
    return row?.c || 0;
  }

  /**
   * Evaluate facts against every persisted rule. Rules whose stored
   * condition_expression is a valid json-rules-engine condition tree are
   * compiled and run; malformed conditions are skipped defensively.
   */
  public async evaluate(facts: RuleEvaluationFact, filter?: { rulesetId?: string }): Promise<RuleEvaluationResult> {
    const db = getDb();
    const rulesets = filter?.rulesetId
      ? [this.getRuleset(filter.rulesetId)].filter(Boolean) as DynamicRuleset[]
      : this.listRulesets();

    const matched: NonNullable<RuleEvaluationResult['matchedRules']> = [];
    for (const ruleset of rulesets) {
      for (const rule of ruleset.rules) {
        if (!rule.conditionExpression) continue;
        const condition = rule.conditionExpression;
        const isObjectCondition = typeof condition === 'object' && condition !== null;
        const isEmptyCondition = isObjectCondition && Object.keys(condition as object).length === 0;
        if (isEmptyCondition) continue;
        const engine = new Engine();
        const eventType = rule.ruleCode || rule.title.replace(/\s+/g, '_').toUpperCase();
        try {
          engine.addRule({
            conditions: condition as any,
            event: {
              type: eventType,
              params: {
                title: rule.title,
                severity: rule.severity,
                message: rule.description || `Rule triggered: ${rule.title}`,
                remediation: rule.enforcementAction || undefined,
                trigger: rule.triggerType || undefined,
                framework: ruleset.lawActName || ruleset.slug,
                legalCitation: ruleset.legalCitation || undefined,
                ruleset: ruleset.slug
              }
            }
          });
        } catch (err: any) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[DB_RULE_ENGINE] Skipped malformed rule ${rule.ruleCode} (${ruleset.slug}): ${err?.message}`);
          }
          continue;
        }
        try {
          const { events } = await engine.run(facts);
          for (const evt of events) {
            matched.push({
              rulesetId: ruleset.id,
              rulesetName: ruleset.name,
              rule: {
                code: rule.ruleCode,
                title: rule.title,
                severity: rule.severity,
                trigger: rule.triggerType
              },
              event: { type: evt.type, params: evt.params }
            });
          }
        } catch (err: any) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[DB_RULE_ENGINE] Skipped rule ${rule.ruleCode} (${ruleset.slug}): ${err?.message}`);
          }
        }
      }
    }

    return {
      compliant: matched.length === 0,
      matchedRules: matched,
      evaluatedAt: new Date().toISOString()
    };
  }

  public seedDefaults(): number {
    const defaults: Array<{ name: string; slug: string; category: string; jurisdiction: string; lawActName: string; legalCitation: string; maxStatutoryFine: string; rules: Array<Omit<DynamicRule, 'id' | 'rulesetId'>> }> = [
      {
        name: 'EU AI Act High-Risk Oversight',
        slug: 'eu-ai-act-oversight',
        category: 'AI_GOVERNANCE',
        jurisdiction: 'EU',
        lawActName: 'EU AI Act',
        legalCitation: 'Regulation (EU) 2024/1689, Articles 9 and 14',
        maxStatutoryFine: 'EUR 35,000,000 or 7% of global turnover',
        rules: [
          {
            ruleCode: 'AI_ACT_ART14_HITL', title: 'Human oversight mandatory for high-risk AI',
            severity: 'HIGH', category: 'AI_GOVERNANCE', triggerType: 'AUTO_EVALUATE',
            conditionExpression: {
              all: [
                { fact: 'systemType', operator: 'equal', value: 'ai_system' },
                { fact: 'riskLevel', operator: 'equal', value: 'high_risk' },
                { fact: 'humanOversight', operator: 'equal', value: false }
              ]
            },
            description: 'High-risk AI system operates without human-in-the-loop oversight.',
            enforcementAction: 'Suspend deployment until HITL approval gate implemented.'
          },
          {
            ruleCode: 'AI_ACT_ART10_DATA_QUALITY', title: 'Training data quality management',
            severity: 'MEDIUM', category: 'AI_GOVERNANCE', triggerType: 'AUTO_EVALUATE',
            conditionExpression: {
              all: [
                { fact: 'dataGovernanceLevel', operator: 'equal', value: 'undefined' }
              ]
            },
            description: 'No documented AI data governance quality measures found.',
            enforcementAction: 'Document data quality management procedures.'
          }
        ]
      },
      {
        name: 'GDPR Breach Notification SLA',
        slug: 'gdpr-breach-72h',
        category: 'DATA_PROTECTION',
        jurisdiction: 'EU',
        lawActName: 'GDPR',
        legalCitation: 'Article 33/34, Regulation (EU) 2016/679',
        maxStatutoryFine: 'EUR 20,000,000 or 4% of global turnover',
        rules: [
          {
            ruleCode: 'GDPR_ART33_72H', title: 'Breach notification within 72 hours',
            severity: 'CRITICAL', category: 'DATA_PROTECTION', triggerType: 'BREACH_EVENT',
            conditionExpression: {
              all: [
                { fact: 'isDataBreach', operator: 'equal', value: true },
                { fact: 'hoursSinceDiscovery', operator: 'greaterThan', value: 72 },
                { fact: 'regulatorNotified', operator: 'equal', value: false }
              ]
            },
            description: 'Data breach not reported to supervisory authority within 72 hours.',
            enforcementAction: 'Escalate to DPO and initiate immediate supervisory notification.'
          }
        ]
      },
      {
        name: 'AML Sanctions & PEP Screening',
        slug: 'aml-sanctions-pep',
        category: 'AML_KYC',
        jurisdiction: 'GLOBAL',
        lawActName: 'EU AMLD6 / FATF Recommendations',
        legalCitation: 'Directive (EU) 2018/843 + FATF R10-R20',
        maxStatutoryFine: 'Up to EUR 5,000,000 + AML licence withdrawal',
        rules: [
          {
            ruleCode: 'AML_PEP_HIGH_VALUE', title: 'PEP high-value transaction flag',
            severity: 'HIGH', category: 'AML_KYC', triggerType: 'TRANSACTION_EVENT',
            conditionExpression: {
              all: [
                { fact: 'isPep', operator: 'equal', value: true },
                { fact: 'amountUsd', operator: 'greaterThanInclusive', value: 10000 }
              ]
            },
            description: 'High-value transaction involving a politically exposed person.',
            enforcementAction: 'Trigger enhanced due diligence and temporary hold.'
          },
          {
            ruleCode: 'AML_SANCTIONED_JURISDICTION', title: 'Sanctioned jurisdiction exposure',
            severity: 'CRITICAL', category: 'AML_KYC', triggerType: 'TRANSACTION_EVENT',
            conditionExpression: {
              any: [
                { fact: 'senderCountry', operator: 'in', value: ['IR', 'KP', 'SY', 'RU', 'CU'] },
                { fact: 'beneficiaryCountry', operator: 'in', value: ['IR', 'KP', 'SY', 'RU', 'CU'] }
              ]
            },
            description: 'Transaction involves a sanctioned or high-risk jurisdiction.',
            enforcementAction: 'Hard-reject transaction and file SAR.'
          }
        ]
      },
      {
        name: 'DORA ICT Incident Reporting',
        slug: 'dora-ict-incidents',
        category: 'OPERATIONAL_RESILIENCE',
        jurisdiction: 'EU',
        lawActName: 'DORA',
        legalCitation: 'Regulation (EU) 2022/2554, Articles 17-19',
        maxStatutoryFine: 'Up to 2% of worldwide annual turnover',
        rules: [
          {
            ruleCode: 'DORA_INCIDENT_24H', title: 'Major ICT incident early warning',
            severity: 'HIGH', category: 'OPERATIONAL_RESILIENCE', triggerType: 'INCIDENT_EVENT',
            conditionExpression: {
              all: [
                { fact: 'incidentClass', operator: 'in', value: ['major', 'significant'] },
                { fact: 'hoursSinceDetection', operator: 'greaterThan', value: 24 },
                { fact: 'authorityNotified', operator: 'equal', value: false }
              ]
            },
            description: 'Major ICT-related incident not reported to competent authority within 24h.',
            enforcementAction: 'Immediate regulatory notification + incident response activation.'
          }
        ]
      }
    ];

    let total = 0;
    for (const def of defaults) {
      if (!this.getRuleset(def.slug)) {
        const { addedRules } = this.createRuleset({
          name: def.name, slug: def.slug, category: def.category, jurisdiction: def.jurisdiction,
          lawActName: def.lawActName, legalCitation: def.legalCitation, maxStatutoryFine: def.maxStatutoryFine,
          rules: def.rules
        });
        total += 1 + addedRules;
      }
    }
    return total;
  }

  private rowToRuleset(row: any): DynamicRuleset {
    const db = getDb();
    const rules = (db.prepare(`SELECT * FROM dynamic_rules WHERE ruleset_id = ? ORDER BY created_at ASC`).all(row.id) as any[]).map(r => ({
      id: r.id,
      rulesetId: r.ruleset_id,
      ruleCode: r.rule_code,
      title: r.title,
      severity: r.severity as DynamicRule['severity'],
      category: r.category || null,
      triggerType: r.trigger_type || null,
      conditionExpression: safeParse(r.condition_expression, null),
      description: r.description || null,
      enforcementAction: r.enforcement_action || null
    }));
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      category: row.category || null,
      industryVertical: row.industry_vertical || null,
      region: row.region || null,
      description: row.description || null,
      lawActName: row.law_act_name || null,
      legalCitation: row.legal_citation || null,
      jurisdiction: row.jurisdiction || null,
      enforcingAuthority: row.enforcing_authority || null,
      maxStatutoryFine: row.max_statutory_fine || null,
      criticalFeatures: safeParse(row.critical_features_json, {}),
      rules
    };
  }
}

export const dbDrivenRuleEngine = new DbDrivenRuleEngine();