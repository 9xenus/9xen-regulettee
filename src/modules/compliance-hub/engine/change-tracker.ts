import crypto from 'crypto';
import { getDb } from '../../../db/sqlite';
import { NotificationDispatcher, type NotificationChannel } from '../../../engine/notification-dispatcher';

export type ChangeUpdateType = 'new_law' | 'amendment' | 'guidance_note' | 'enforcement_priority_shift' | 'court_ruling';

export interface RegulatoryChange {
  id: string;
  jurisdictionCountry: string;
  regulationName: string | null;
  updateType: ChangeUpdateType | null;
  summary: string | null;
  fullTextUrl: string | null;
  affectedIndustries: string[];
  effectiveDate: string | null;
  source: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  actionPlanNotes?: string;
}

export interface ChangeTrackerRunResult {
  detectedExisting: number;
  acknowledgedToday: number;
  newlyRecorded: number;
}

export class RegulatoryChangeTracker {
  public listChanges(filters?: { country?: string; type?: string; unacknowledgedOnly?: boolean; tenantId?: string }): RegulatoryChange[] {
    const db = getDb();
    let sql = `
      SELECT ru.*, ra.acknowledged_by, ra.action_plan_notes
      FROM regulatory_updates ru
      LEFT JOIN regulatory_update_acknowledgements ra
        ON ra.regulatory_update_id = ru.id
    `;
    const where: string[] = [];
    const params: any[] = [];
    if (filters?.country) { where.push(`ru.jurisdiction_country = ?`); params.push(filters.country); }
    if (filters?.type) { where.push(`ru.update_type = ?`); params.push(filters.type); }
    if (filters?.tenantId) { where.push(`(ra.organization_id = ?)`); params.push(filters.tenantId); }
    if (filters?.unacknowledgedOnly) { where.push(`ra.id IS NULL`); }
    if (where.length) sql += ` WHERE ` + where.join(' AND ');
    sql += ` ORDER BY ru.effective_date IS NULL, ru.effective_date ASC, ru.created_at DESC`;
    return (db.prepare(sql).all(...params) as any[]).map(r => this.rowToChange(r));
  }

  public recordChange(input: {
    jurisdictionCountry: string;
    regulationName?: string;
    updateType: ChangeUpdateType;
    summary?: string;
    fullTextUrl?: string;
    affectedIndustries?: string[];
    effectiveDate?: string;
    source?: string;
  }): RegulatoryChange {
    const db = getDb();
    const id = `ru_${crypto.randomUUID().slice(0, 10)}`;
    db.prepare(`
      INSERT INTO regulatory_updates
        (id, jurisdiction_country, regulation_name, update_type, summary, full_text_url, affected_industries, effective_date, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.jurisdictionCountry,
      input.regulationName || null,
      input.updateType,
      input.summary || null,
      input.fullTextUrl || null,
      JSON.stringify(input.affectedIndustries || []),
      input.effectiveDate || null,
      input.source || 'platform_monitored'
    );
    return this.listChanges({ country: input.jurisdictionCountry }).find(c => c.id === id)!;
  }

  /** Ingest change signals from a monitored source feed endpoint. */
  public async runMonitor(): Promise<ChangeTrackerRunResult> {
    const db = getDb();
    const existing = this.listChanges().length;
    const now = new Date().toISOString().slice(0, 10);
    const acknowledgedToday = (db.prepare(`SELECT COUNT(*) AS c FROM regulatory_update_acknowledgements WHERE date(acknowledged_at) = ?`).get(now) as any)?.c || 0;

    const newly = [];
    if (process.env.REGULATOR_FEED_URL && process.env.REGULATOR_FEED_URL.includes('http')) {
      try {
        const res = await fetch(process.env.REGULATOR_FEED_URL, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const payload = await res.json();
          for (const item of Array.isArray(payload) ? payload : payload.updates || []) {
            if (!item || !item.jurisdiction_country) continue;
            const dup = db.prepare(`SELECT id FROM regulatory_updates WHERE id = ?`).get(item.id || item.reference || '') as any;
            if (!dup) newly.push(this.recordChange(item));
          }
        }
      } catch (err: any) {
        console.warn(`[CHANGE_TRACKER] Monitor feed fetch failed: ${err?.message}`);
      }
    }

    return { detectedExisting: existing, acknowledgedToday, newlyRecorded: newly.length };
  }

  /**
   * Acknowledge a regulatory change and dispatch a workflow notification to the
   * responsible tenant team, with Privacy Guard scrubbing applied.
   */
  public acknowledge(input: {
    updateId: string;
    tenantId: string;
    acknowledgedBy?: string;
    actionPlanNotes?: string;
    notifyChannels?: NotificationChannel[];
  }): RegulatoryChange {
    const db = getDb();
    const change = this.listChanges().find(c => c.id === input.updateId);
    if (!change) throw new Error(`Regulatory change '${input.updateId}' not found`);

    const ackId = `ack_${crypto.randomUUID().slice(0, 10)}`;
    db.prepare(`
      INSERT OR REPLACE INTO regulatory_update_acknowledgements
        (id, regulatory_update_id, organization_id, acknowledged_by, action_plan_notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(ackId, input.updateId, input.tenantId, input.acknowledgedBy || null, input.actionPlanNotes || null);

    const dispatcher = new NotificationDispatcher();
    const summary = change.regulationName || change.updateType || 'Regulatory change';
    dispatcher.dispatchAlert({
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      priority: change.updateType === 'enforcement_priority_shift' ? 'HIGH' : 'LOW',
      title: `Action requested: ${summary}`,
      message: `${change.jurisdictionCountry} — ${change.summary || 'New regulatory update requiring attention.'} Acknowledged by ${input.acknowledgedBy || 'unassigned'}.`,
      rawContextData: { regulation: change.regulationName, url: change.fullTextUrl },
      preferredChannels: input.notifyChannels || ['IN_APP']
    });

    return this.listChanges().find(c => c.id === input.updateId)!;
  }

  public getUnacknowledgedCount(tenantId: string): number {
    const db = getDb();
    return (db.prepare(`
      SELECT COUNT(*) AS c FROM regulatory_updates ru
      LEFT JOIN regulatory_update_acknowledgements ra ON ra.regulatory_update_id = ru.id
      WHERE ra.id IS NULL OR ra.organization_id != ?
    `).get(tenantId) as any)?.c || 0;
  }

  public seedDefaults(): number {
    const db = getDb();
    const defaults: Array<Parameters<RegulatoryChangeTracker['recordChange']>[0]> = [
      { jurisdictionCountry: 'EU', regulationName: 'EU AI Act', updateType: 'enforcement_priority_shift', summary: 'Commission published delegated act on GPAI obligations; high-risk AI registration window opens.', affectedIndustries: ['Technology', 'Finance', 'Healthcare'], effectiveDate: '2026-01-01', source: 'platform_monitored' },
      { jurisdictionCountry: 'EU', regulationName: 'DORA', updateType: 'guidance_note', summary: 'EBA clarified incident classification thresholds for major ICT-related incidents.', affectedIndustries: ['Financial Services'], effectiveDate: '2025-09-30', source: 'regulator_submitted' },
      { jurisdictionCountry: 'US', regulationName: 'State Privacy Omnibus', updateType: 'amendment', summary: 'Four additional states enacted comprehensive privacy laws with 2026 effective dates.', affectedIndustries: ['All'], effectiveDate: '2026-03-01', source: 'platform_monitored' },
      { jurisdictionCountry: 'GB', regulationName: 'UK Data (Use and Access) Bill', updateType: 'new_law', summary: 'UK Parliament advanced DUABASE framework creating a digital verification authority.', affectedIndustries: ['Identity', 'Finance'], effectiveDate: '2025-12-31', source: 'regulator_submitted' },
      { jurisdictionCountry: 'BD', regulationName: 'Bangladesh Data Protection Act', updateType: 'guidance_note', summary: 'Regulator issued guidance on cross-border transfer adequacy list and consent templates.', affectedIndustries: ['Telecom', 'Finance', 'E-commerce'], effectiveDate: '2025-11-15', source: 'regulator_submitted' }
    ];
    let added = 0;
    for (const def of defaults) {
      const dup = db.prepare(`SELECT id FROM regulatory_updates WHERE jurisdiction_country = ? AND regulation_name = ?`).get(def.jurisdictionCountry, def.regulationName) as any;
      if (!dup) { this.recordChange(def); added++; }
    }
    return added;
  }

  private rowToChange(row: any): RegulatoryChange {
    return {
      id: row.id,
      jurisdictionCountry: row.jurisdiction_country,
      regulationName: row.regulation_name || null,
      updateType: row.update_type || null,
      summary: row.summary || null,
      fullTextUrl: row.full_text_url || null,
      affectedIndustries: this.safeParse(row.affected_industries, '[]'),
      effectiveDate: row.effective_date || null,
      source: row.source || 'regulator_submitted',
      createdAt: row.created_at,
      acknowledged: Boolean(row.acknowledged_by),
      acknowledgedBy: row.acknowledged_by || undefined,
      actionPlanNotes: row.action_plan_notes || undefined
    };
  }

  private safeParse(s: string | null, fallback: any) {
    if (!s) return fallback;
    try { return JSON.parse(s); } catch { return fallback; }
  }
}

export const regulatoryChangeTracker = new RegulatoryChangeTracker();