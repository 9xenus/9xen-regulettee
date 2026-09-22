import crypto from 'crypto';
import { getDb } from '../../../db/sqlite';

export type ReportFormat = 'JSON' | 'CSV' | 'PDF' | 'MARKDOWN';

export interface ReportTemplate {
  id: string;
  name: string;
  slug: string;
  format: ReportFormat;
  framework: string | null;
  description: string | null;
  sections: string[];
  config: Record<string, any>;
  createdAt: string;
}

export interface GeneratedReport {
  templateId: string;
  templateName: string;
  format: ReportFormat;
  fileName: string;
  generatedAt: string;
  content: string;
  contentBytes: number;
  integrityHash: string;
}

interface ReportDataSource {
  tenantId: string;
  frameworks?: { code: string; name: string }[];
  scores?: Record<string, number>;
  violations?: { severity: string; count: number }[];
  changes?: { id: string; country: string; name: string | null; type: string | null; effectiveDate: string | null }[];
  modules?: { slug: string; name: string; status: string }[];
}

export class ComplianceReportGenerator {
  public createTemplate(input: {
    name: string;
    slug: string;
    format: ReportFormat;
    framework?: string;
    description?: string;
    sections?: string[];
    config?: Record<string, any>;
    createdBy?: string;
  }): ReportTemplate {
    const db = getDb();
    const id = `tmpl_${crypto.randomUUID().slice(0, 10)}`;
    db.prepare(`
      INSERT INTO compliance_report_templates
        (id, name, slug, format, framework, description, sections_json, config_json, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.name,
      input.slug,
      input.format,
      input.framework || null,
      input.description || null,
      JSON.stringify(input.sections || []),
      JSON.stringify(input.config || {}),
      input.createdBy || null
    );
    return this.getTemplate(id)!;
  }

  public listTemplates(filters?: { format?: ReportFormat; framework?: string }): ReportTemplate[] {
    const db = getDb();
    let sql = `SELECT * FROM compliance_report_templates WHERE 1=1`;
    const params: any[] = [];
    if (filters?.format) { sql += ` AND format = ?`; params.push(filters.format); }
    if (filters?.framework) { sql += ` AND framework = ?`; params.push(filters.framework); }
    sql += ` ORDER BY created_at DESC`;
    return (db.prepare(sql).all(...params) as any[]).map(r => this.rowToTemplate(r));
  }

  public getTemplate(idOrSlug: string): ReportTemplate | null {
    const db = getDb();
    const row = db.prepare(`SELECT * FROM compliance_report_templates WHERE id = ? OR slug = ?`).get(idOrSlug, idOrSlug) as any;
    return row ? this.rowToTemplate(row) : null;
  }

  public deleteTemplate(idOrSlug: string): boolean {
    const db = getDb();
    const t = this.getTemplate(idOrSlug);
    if (!t) return false;
    db.prepare(`DELETE FROM compliance_report_templates WHERE id = ?`).run(t.id);
    return true;
  }

  public generate(templateId: string, dataSource: ReportDataSource): GeneratedReport {
    const db = getDb();
    const template = this.getTemplate(templateId);
    if (!template) throw new Error(`Report template '${templateId}' not found`);

    const t = template;
    const sectionData = this.renderSections(t.sections, dataSource);
    const generatedAt = new Date().toISOString();

    let content = '';
    switch (t.format) {
      case 'JSON': content = JSON.stringify(this.jsonPayload(t, sectionData, dataSource, generatedAt), null, 2); break;
      case 'CSV': content = this.toCsv(sectionData); break;
      case 'MARKDOWN': content = this.toMarkdown(t, sectionData, dataSource, generatedAt); break;
      case 'PDF': content = JSON.stringify({ pdfNote: 'Client-side PDF rendering via jspdf', payload: this.jsonPayload(t, sectionData, dataSource, generatedAt) }, null, 2); break;
    }

    const fileName = `${t.slug}-${generatedAt.replace(/[:.]/g, '-')}.${t.format.toLowerCase()}`;
    const integrityHash = crypto.createHash('sha256').update(`${fileName}_${generatedAt}_${content}`).digest('hex');

    return {
      templateId: t.id,
      templateName: t.name,
      format: t.format,
      fileName,
      generatedAt,
      content,
      contentBytes: Buffer.byteLength(content, 'utf8'),
      integrityHash
    };
  }

  public seedDefaults(): number {
    const defaults: Array<{ name: string; slug: string; format: ReportFormat; framework: string; description: string; sections: string[]; config: Record<string, any> }> = [
      { name: 'Executive Compliance Summary', slug: 'exec-summary', format: 'PDF', framework: 'ALL', description: 'Board-ready summary across activated frameworks.', sections: ['overview', 'scores', 'violations', 'recommendations'], config: { branded: true, confidentiality: 'INTERNAL' } },
      { name: 'GDPR Art.30 ROPA Export', slug: 'gdpr-ropa', format: 'CSV', framework: 'GDPR', description: 'Record of processing activities structured export.', sections: ['processing', 'categories', 'transfer_recipients'], config: { includeLegalBasis: true } },
      { name: 'AI Act Risk Inventory', slug: 'ai-act-inventory', format: 'JSON', framework: 'EU_AI_ACT', description: 'Machine-readable AI system inventory for Article 56 registration.', sections: ['systems', 'risk_classification', 'oversight'], config: { schemaVersion: '1.0' } },
      { name: 'Regulatory Change Digest', slug: 'change-digest', format: 'MARKDOWN', framework: 'ALL', description: 'Markdown summary of unacknowledged regulatory changes.', sections: ['changes', 'deadlines', 'actions'], config: { includeUrls: true } }
    ];
    let added = 0;
    for (const def of defaults) {
      if (!this.getTemplate(def.slug)) { this.createTemplate(def); added++; }
    }
    return added;
  }

  private renderSections(sections: string[], data: ReportDataSource): Record<string, any> {
    const out: Record<string, any> = {};
    for (const s of sections) {
      switch (s) {
        case 'overview':
          out.overview = { tenantId: data.tenantId, generatedFor: data.frameworks?.map(f => f.name).join(', ') || 'All frameworks', frameworkCount: data.frameworks?.length || 0, moduleCount: data.modules?.length || 0 };
          break;
        case 'scores':
          out.scores = data.scores || {};
          break;
        case 'violations':
          out.violations = data.violations || [];
          break;
        case 'changes':
          out.changes = data.changes || [];
          break;
        case 'modules':
          out.modules = data.modules || [];
          break;
        case 'recommendations':
          out.recommendations = this.buildRecommendations(data);
          break;
        case 'processing':
          out.processing = { note: 'Include ROPA processing rows here from processing_activity_records.' };
          break;
        default:
          out[s] = null;
      }
    }
    return out;
  }

  private buildRecommendations(data: ReportDataSource): string[] {
    const recs: string[] = [];
    for (const [code, score] of Object.entries(data.scores || {})) {
      if (score < 60) recs.push(`Immediate remediation required for ${code} (score ${score}).`);
      else if (score < 80) recs.push(`Schedule compliance review for ${code} (score ${score}).`);
    }
    for (const v of data.violations || []) {
      if (v.severity === 'CRITICAL' && v.count > 0) recs.push(`Resolve ${v.count} CRITICAL violation(s).`);
    }
    for (const c of data.changes || []) {
      if (c.effectiveDate) recs.push(`Track deadline ${c.effectiveDate} for ${c.country} ${c.name || 'regulation'}.`);
    }
    return recs.length ? recs : ['No urgent compliance actions detected.'];
  }

  private jsonPayload(t: ReportTemplate, sectionData: Record<string, any>, data: ReportDataSource, generatedAt: string) {
    return {
      generatedAt,
      template: { name: t.name, slug: t.slug, framework: t.framework, version: '1.0.0' },
      tenantId: data.tenantId,
      sections: sectionData,
      integrity: {
        digestAlgo: 'sha256',
        note: 'Verify authenticity via report integrityHash.'
      }
    };
  }

  private toCsv(sectionData: Record<string, any>): string {
    const lines: string[] = [];
    for (const [section, value] of Object.entries(sectionData)) {
      lines.push(`# ${section}`);
      if (Array.isArray(value)) {
        if (value.length && typeof value[0] === 'object') {
          const keys = Object.keys(value[0]);
          lines.push(keys.join(','));
          for (const row of value) {
            lines.push(keys.map(k => this.csvCell((row as any)[k])).join(','));
          }
        } else {
          value.forEach(v => lines.push(this.csvCell(v)));
        }
      } else if (typeof value === 'object' && value !== null) {
        for (const [k, v] of Object.entries(value)) lines.push(`${k},${this.csvCell(v)}`);
      }
    }
    return lines.join('\n');
  }

  private csvCell(v: any): string {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  }

  private toMarkdown(t: ReportTemplate, sectionData: Record<string, any>, data: ReportDataSource, generatedAt: string): string {
    const md: string[] = [];
    md.push(`# ${t.name}`);
    md.push(`\n> Generated ${generatedAt} for tenant \`${data.tenantId}\`.`);
    if (t.framework && t.framework !== 'ALL') md.push(`\n**Framework:** ${t.framework}`);
    for (const [section, value] of Object.entries(sectionData)) {
      md.push(`\n## ${section.charAt(0).toUpperCase() + section.slice(1)}`);
      md.push('```json');
      md.push(JSON.stringify(value, null, 2));
      md.push('```');
    }
    return md.join('\n');
  }

  private rowToTemplate(row: any): ReportTemplate {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      format: row.format as ReportFormat,
      framework: row.framework || null,
      description: row.description || null,
      sections: this.safeParse(row.sections_json, '[]'),
      config: this.safeParse(row.config_json, '{}'),
      createdAt: row.created_at
    };
  }

  private safeParse(s: string, fallback: any) {
    try { return JSON.parse(s); } catch { return fallback; }
  }
}

export const complianceReportGenerator = new ComplianceReportGenerator();