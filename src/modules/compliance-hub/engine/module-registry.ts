import crypto from 'crypto';
import { getDb } from '../../../db/sqlite';

export type ComplianceModuleStatus = 'REGISTERED' | 'ACTIVE' | 'INACTIVE' | 'DISABLED';
export type ComplianceSectorCategory =
  | 'AML_KYC'
  | 'DATA_PROTECTION'
  | 'AI_GOVERNANCE'
  | 'OPERATIONAL_RESILIENCE'
  | 'CYBERSECURITY'
  | 'CONSUMER_PROTECTION'
  | 'FINANCIAL_REGULATION'
  | 'ESG_SUSTAINABILITY'
  | 'GOVERNMENT_B2G'
  | 'CROSS_BORDER'
  | 'SECTOR_SPECIFIC';

export interface ComplianceModuleDefinition {
  id: string;
  name: string;
  slug: string;
  version: string;
  category: ComplianceSectorCategory;
  jurisdiction: string;
  description?: string;
  configJson?: Record<string, any>;
  entryPoint?: string;
}

export interface RegisteredComplianceModule extends ComplianceModuleDefinition {
  status: ComplianceModuleStatus;
  createdAt: string;
  updatedAt: string;
}

const normalizeUrl = (s?: string) => {
  if (!s) return s;
  return s.replace(/\.ts$/, '').replace(/\.js$/, '').replace(/^\.\//, '');
};

export class ComplianceModuleRegistry {
  public listModules(filters?: { category?: string; jurisdiction?: string; status?: string }): RegisteredComplianceModule[] {
    const db = getDb();
    let sql = `SELECT * FROM compliance_modules WHERE 1=1`;
    const params: any[] = [];
    if (filters?.category) { sql += ` AND category = ?`; params.push(filters.category); }
    if (filters?.jurisdiction) { sql += ` AND jurisdiction = ?`; params.push(filters.jurisdiction); }
    if (filters?.status) { sql += ` AND status = ?`; params.push(filters.status); }
    sql += ` ORDER BY created_at DESC`;
    return (db.prepare(sql).all(...params) as any[]).map(r => this.rowToModule(r));
  }

  public getModule(slugOrId: string): RegisteredComplianceModule | null {
    const db = getDb();
    const row = db.prepare(`SELECT * FROM compliance_modules WHERE slug = ? OR id = ?`).get(slugOrId, slugOrId) as any;
    return row ? this.rowToModule(row) : null;
  }

  public registerModule(def: ComplianceModuleDefinition): RegisteredComplianceModule {
    const db = getDb();
    const id = def.id && def.id.length ? def.id : `mod_${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT OR REPLACE INTO compliance_modules
        (id, name, slug, version, category, jurisdiction, description, status, config_json, entry_point)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'REGISTERED', ?, ?)
    `).run(
      id,
      def.name,
      normalizeUrl(def.slug),
      def.version || '1.0.0',
      def.category,
      def.jurisdiction || 'GLOBAL',
      def.description || null,
      JSON.stringify(def.configJson || {}),
      normalizeUrl(def.entryPoint) || null
    );
    return this.getModule(normalizeUrl(def.slug) || id)!;
  }

  public setStatus(slugOrId: string, status: ComplianceModuleStatus): RegisteredComplianceModule {
    const db = getDb();
    const existing = this.getModule(slugOrId);
    if (!existing) throw new Error(`Compliance module '${slugOrId}' not found`);
    db.prepare(`UPDATE compliance_modules SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(status, existing.id);
    return this.getModule(existing.id)!;
  }

  public activate(slugOrId: string) { return this.setStatus(slugOrId, 'ACTIVE'); }
  public deactivate(slugOrId: string) { return this.setStatus(slugOrId, 'INACTIVE'); }
  public disable(slugOrId: string) { return this.setStatus(slugOrId, 'DISABLED'); }

  public deleteModule(slugOrId: string): boolean {
    const db = getDb();
    const existing = this.getModule(slugOrId);
    if (!existing) return false;
    db.prepare(`DELETE FROM compliance_modules WHERE id = ?`).run(existing.id);
    return true;
  }

  public getSectorCategories(): { category: ComplianceSectorCategory; modules: number; active: number }[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT category, COUNT(*) AS modules, SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active
      FROM compliance_modules GROUP BY category
    `).all() as any[];
    return rows.map(r => ({ category: r.category as ComplianceSectorCategory, modules: r.modules, active: r.active || 0 }));
  }

  /** Attempts dynamic import of an entry point to discover module-level routes. */
  public async discoverEntryPoint(slugOrId: string) {
    const mod = this.getModule(slugOrId);
    if (!mod) return { success: false, error: 'Module not found' };
    if (!mod.entryPoint) {
      return { success: false, error: 'Module has no entry_point registered' };
    }
    try {
      const resolved = mod.entryPoint.startsWith('.')
        ? mod.entryPoint
        : `./${mod.entryPoint}`;
      const loaded = await import(resolved);
      const router = loaded.router || loaded.default?.router || loaded.RegisteredRouter;
      const manifest = loaded.moduleManifest || loaded.manifest || null;
      return {
        success: true,
        entryPoint: resolved,
        hasRouter: typeof router === 'function',
        manifest: manifest ? { name: manifest.name || mod.name, category: manifest.category || mod.category, version: manifest.version || mod.version } : null
      };
    } catch (err: any) {
      return { success: false, error: `Entry point import failed: ${err.message}` };
    }
  }

  public seedDefaults(): number {
    const defaults: ComplianceModuleDefinition[] = [
      { id: 'mod_gdpr', name: 'GDPR Compliance Engine', slug: 'gdpr', version: '1.0.0', category: 'DATA_PROTECTION', jurisdiction: 'EU', description: 'GDPR Art.30 ROPA, breach notification, DPIA and consent management.', configJson: { scanning: true, breachSlaHours: 72 }, entryPoint: 'gdpr-engine' },
      { id: 'mod_aml', name: 'AML/KYC Rules Module', slug: 'aml-kyc', version: '1.0.0', category: 'AML_KYC', jurisdiction: 'GLOBAL', description: 'PEP screening, sanctions watchlist, transaction velocity rules.', configJson: { pepThresholdUsd: 10000 }, entryPoint: 'aml-engine' },
      { id: 'mod_ai_act', name: 'EU AI Act Governance', slug: 'eu-ai-act', version: '1.0.0', category: 'AI_GOVERNANCE', jurisdiction: 'EU', description: 'High-risk AI registration, Article 14 oversight, transparency logs.', configJson: { annexIncluded: true }, entryPoint: 'ai-act-engine' },
      { id: 'mod_nis2', name: 'NIS2 Incident Universe', slug: 'nis2', version: '1.0.0', category: 'CYBERSECURITY', jurisdiction: 'EU', description: 'Essential/important entity mapping, 24h incident reporting.' },
      { id: 'mod_dora', name: 'DORA Resilience Planner', slug: 'dora', version: '1.0.0', category: 'OPERATIONAL_RESILIENCE', jurisdiction: 'EU', description: 'ICT risk, third-party register, TLPT, resilience testing.' },
      { id: 'mod_ccpa', name: 'CCPA/CPRA Rights Fulfilment', slug: 'ccpa', version: '1.0.0', category: 'DATA_PROTECTION', jurisdiction: 'US-CA', description: 'Consumer rights requests, Do Not Sell, opt-out handling.' },
      { id: 'mod_b2g', name: 'B2G Regulator Engagement', slug: 'b2g', version: '1.0.0', category: 'GOVERNMENT_B2G', jurisdiction: 'GLOBAL', description: 'Regulatory filings, inquiries, evidence delivery, dispute resolution.' }
    ];
    let added = 0;
    for (const def of defaults) {
      if (!this.getModule(def.slug)) { this.registerModule(def); added++; }
    }
    return added;
  }

  private rowToModule(row: any): RegisteredComplianceModule {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      version: row.version,
      category: row.category,
      jurisdiction: row.jurisdiction,
      description: row.description || undefined,
      configJson: row.config_json ? this.safeParse(row.config_json) : {},
      entryPoint: row.entry_point || undefined,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private safeParse(s: string) {
    try { return JSON.parse(s); } catch { return {}; }
  }
}

export const complianceModuleRegistry = new ComplianceModuleRegistry();