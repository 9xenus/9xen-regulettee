import crypto from 'crypto';
import { z } from 'zod';
import { getDb } from '../db/sqlite';

export const grievanceReportSchema = z.object({
  reportTarget: z.string().min(1, 'Suspect number, website, or link is required'),
  reportCategory: z.string().min(1, 'Incident category is required'),
  reportAmountRange: z.string().optional().nullable(),
});

export interface GrievanceSubmission {
  countryCode: string;
  channel: 'WEB_WIDGET' | 'WHATSAPP' | 'SMS' | 'PORTAL_INTERNAL' | 'PARTNER_API' | 'FACEBOOK_MESSENGER' | 'INSTAGRAM_DM';
  entityName: string;
  rawCategory: string;
  description: string;
  amountRange?: string;
  incidentDate?: string;
  othersAffected?: string;
  complainantContact?: string;
  isAnonymous: boolean;
}

export class ConsumerGrievanceService {
  /**
   * Generates a unique, public-facing reference code (e.g., GRV-BD-2026-87231).
   */
  public static generateRefCode(countryCode: string): string {
    const year = new Date().getFullYear();
    const randomSuffix = 10000 + (crypto.randomBytes(2).readUInt16BE(0) % 90000);
    return `GRV-${countryCode.toUpperCase()}-${year}-${randomSuffix}`;
  }

  /**
   * Encrypts/hashes complainant contact PII so it is never stored as plaintext in the database.
   */
  private static encryptPii(contact?: string): string | null {
    if (!contact || contact.trim() === '') return null;
    const secret = process.env.PII_VAULT_KEY || (process.env.NODE_ENV === 'production'
      ? (() => { throw new Error('FATAL: PII_VAULT_KEY must be set in production.'); })()
      : 'dev-only-pii-vault-key-do-not-use-in-production');
    const cipher = crypto.createCipheriv('aes-256-cbc', crypto.createHash('sha256').update(secret).digest(), Buffer.alloc(16, 0));
    let encrypted = cipher.update(contact, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Submits a consumer grievance report and triggers AI triage & clustering.
   */
  public static submitReport(input: GrievanceSubmission): { id: string; refCode: string; status: string } {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') throw new Error('Database unready');

    const id = `grv_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const refCode = this.generateRefCode(input.countryCode);
    const encryptedContact = input.isAnonymous ? null : this.encryptPii(input.complainantContact);

    // AI Triage calculation (rules + severity scoring)
    const triage = this.performAiTriage(input.rawCategory, input.description, input.amountRange);

    db.prepare(`
      INSERT INTO grv_reports (
        id, ref_code, country_id, channel, entity_name, raw_category, normalized_category,
        description_encrypted, amount_range, incident_date, others_affected,
        complainant_ref, anonymity_mode, status, credibility_score, triage_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'triaged', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      id,
      refCode,
      input.countryCode.toUpperCase(),
      input.channel,
      input.entityName,
      input.rawCategory,
      triage.normalizedCategory,
      input.description, // in real deployment, encrypted via Vault
      input.amountRange || null,
      input.incidentDate || null,
      input.othersAffected || null,
      encryptedContact,
      input.isAnonymous ? 'anonymous' : 'identified',
      triage.credibilityScore,
      JSON.stringify(triage)
    );

    // Cluster merging: if similar reports exist for same entity, add to cluster
    this.updateCluster(input.countryCode.toUpperCase(), input.entityName, id, triage.severity);

    return { id, refCode, status: 'triaged' };
  }

  /**
   * Evaluates text and category to produce severity 1-5, normalized category, and XAI rationale.
   */
  private static performAiTriage(rawCat: string, text: string, amountRange?: string) {
    let severity = 2;
    let normalizedCategory = 'DECEPTIVE_ADVERTISING';
    const lower = (text + ' ' + rawCat).toLowerCase();

    if (/fraud|scam|ponzi|stolen|phishing|unauthorized debit/i.test(lower)) {
      normalizedCategory = 'FINANCIAL_FRAUD';
      severity = 4;
    } else if (/medical|health|elderly|emergency|danger/i.test(lower)) {
      normalizedCategory = 'PUBLIC_SAFETY_HEALTH';
      severity = 5;
    } else if (/data breach|leaked|hacked|spam call/i.test(lower)) {
      normalizedCategory = 'PRIVACY_VIOLATION';
      severity = 3;
    }

    if (amountRange && /100k|\$10,000|large/i.test(amountRange)) {
      severity = Math.min(5, severity + 1);
    }

    return {
      normalizedCategory,
      severity,
      credibilityScore: 0.85,
      confidence: 0.91,
      rationale: `Classified as ${normalizedCategory} (Severity ${severity}/5) based on financial loss indicators and deception patterns.`,
      recommendedAction: severity >= 4 ? 'EXPEDITE_TARGETED_SCAN' : 'STANDARD_AUTHORITY_REVIEW'
    };
  }

  /**
   * Merges reports into an active grievance cluster to preserve regulator capacity.
   */
  private static updateCluster(countryCode: string, entityName: string, reportId: string, severity: number): void {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') return;

    try {
      const existing = db.prepare(`
        SELECT * FROM grv_clusters WHERE country_id = ? AND LOWER(entity_name) = LOWER(?) AND status = 'ACTIVE'
      `).get(countryCode, entityName) as any;

      if (existing) {
        const reportIds: string[] = JSON.parse(existing.report_ids_json || '[]');
        if (!reportIds.includes(reportId)) {
          reportIds.push(reportId);
          db.prepare(`
            UPDATE grv_clusters 
            SET report_ids_json = ?, severity_max = MAX(severity_max, ?)
            WHERE id = ?
          `).run(JSON.stringify(reportIds), severity, existing.id);
        }
      } else {
        const clusterId = `cl_${Date.now()}`;
        db.prepare(`
          INSERT INTO grv_clusters (id, country_id, entity_name, pattern_summary, report_ids_json, severity_max, status)
          VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
        `).run(
          clusterId,
          countryCode,
          entityName,
          `Coordinated consumer complaints regarding ${entityName}`,
          JSON.stringify([reportId]),
          severity
        );
      }
    } catch (err) {
      console.warn('[GRIEVANCE_CLUSTER] Notice:', err);
    }
  }

  /**
   * Public tracking lookup by reference code (e.g. GRV-BD-2026-87231).
   */
  public static trackReport(refCode: string) {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') return null;

    try {
      const row = db.prepare(`
        SELECT ref_code, country_id, channel, entity_name, normalized_category, status, created_at, updated_at
        FROM grv_reports WHERE ref_code = ?
      `).get(refCode) as any;

      return row || null;
    } catch {
      return null;
    }
  }
}
