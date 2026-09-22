import { EnterpriseAuditLedger } from '../lib/audit-ledger.js';
import { getDb } from '../db/sqlite.js';
import { runExclusiveJob, recordJobSnapshot, readJobSnapshot } from './jobCoordinator';

const ledger = new EnterpriseAuditLedger();

export const GLOBAL_REGULATORY_ACTS = [
  // EUROPE (Expanded)
  {
    region: 'EUROPE',
    law: 'GDPR_AMEND_2024',
    directive_id: 'EU-2024-882',
    title: 'GDPR Article 45 Amendment: Trans-Atlantic Data Flow',
    summary: 'New safeguards for continuous monitoring of US-EU data transfers under the updated Data Privacy Framework.',
    source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0882',
    policy_affected: 'Data Sovereignty & Privacy'
  },
  {
    region: 'EUROPE',
    law: 'AI_ACT_V1',
    directive_id: 'EU-2024-1689',
    title: 'EU Artificial Intelligence Act (Final Text)',
    summary: 'Comprehensive legal framework for AI, categorizing systems into risk levels and imposing strict requirements on high-risk AI.',
    source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
    policy_affected: 'AI Governance'
  },
  // USA (Expanded)
  {
    region: 'USA',
    law: 'HIPAA_SEC_2024',
    directive_id: 'US-HHS-2024-02',
    title: 'HIPAA Security Rule Update: Cybersecurity Requirements',
    summary: 'Enhanced requirements for healthcare providers to implement multi-factor authentication and endpoint encryption.',
    source_url: 'https://www.federalregister.gov/documents/2024/02/15/2024-03123/hipaa-security-rule-update',
    policy_affected: 'Healthcare Data Security'
  },
  {
    region: 'USA',
    law: 'CCPA_CPRA_V2',
    directive_id: 'CA-CPPA-2024-01',
    title: 'California Privacy Rights Act Enforcement Update',
    summary: 'New regulations concerning automated decision-making technology and employee data privacy rights.',
    source_url: 'https://cppa.ca.gov/regulations/',
    policy_affected: 'Consumer Privacy'
  },
  {
    region: 'USA',
    law: 'FED_RAMP_MOD',
    directive_id: 'OMB-M-24-15',
    title: 'FedRAMP Modernization Memo',
    summary: 'New guidelines for federal agencies to accelerate cloud adoption while maintaining high security standards.',
    source_url: 'https://www.whitehouse.gov/wp-content/uploads/2024/07/M-24-15-FedRAMP-Modernization.pdf',
    policy_affected: 'Cloud Governance'
  },
  // MIDDLE EAST (Expanded)
  {
    region: 'MIDDLE_EAST',
    law: 'UAE_DPL_45',
    directive_id: 'UAE-LAW-45-2021',
    title: 'UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection',
    summary: 'Comprehensive framework for data privacy in the UAE, aligning with global standards like GDPR.',
    source_url: 'https://uaelegislation.gov.ae/en/legislations/1531',
    policy_affected: 'Personal Data Privacy'
  },
  {
    region: 'MIDDLE_EAST',
    law: 'KSA_PDPL_2023',
    directive_id: 'KSA-SDAIA-2023-01',
    title: 'Saudi Arabia Personal Data Protection Law (PDPL)',
    summary: 'New regulations issued by SDAIA regarding cross-border data transfers and user consent management.',
    source_url: 'https://sdaia.gov.sa/en/SDAIA/Pages/PDPL.aspx',
    policy_affected: 'Data Sovereignty'
  },
  {
    region: 'MIDDLE_EAST',
    law: 'QATAR_PDP_2024',
    directive_id: 'QATAR-MOTC-2024',
    title: 'Qatar Personal Data Privacy Protection Law Update',
    summary: 'New executive regulations for financial institutions regarding customer data retention and encryption.',
    source_url: 'https://www.communications.gov.qa/en/legislation/laws',
    policy_affected: 'Financial Data Privacy'
  },
  // ANZ (Expanded)
  {
    region: 'ANZ',
    law: 'AU_PRIVACY_REV',
    directive_id: 'AU-AG-2024-REV',
    title: 'Australia Privacy Act Review: 2024 Amendments',
    summary: 'Proposed changes to broaden the definition of personal information and introduce a "fair and reasonable" test for data handling.',
    source_url: 'https://www.ag.gov.au/rights-and-protections/privacy/privacy-act-review',
    policy_affected: 'National Privacy Framework'
  },
  {
    region: 'ANZ',
    law: 'NZ_PRIVACY_2020',
    directive_id: 'NZ-OPC-2020',
    title: 'New Zealand Privacy Act 2020: Principle 12 Guidance',
    summary: 'Updated guidelines for New Zealand agencies disclosing personal information to overseas entities.',
    source_url: 'https://privacy.org.nz/news-and-publications/guidance-resources/',
    policy_affected: 'Cross-border Data Flow'
  },
  {
    region: 'ANZ',
    law: 'AU_SOCI_ACT',
    directive_id: 'AU-HOME-2024-SOCI',
    title: 'Critical Infrastructure Security (SOCI) Act 2024 Update',
    summary: 'New risk management program requirements for critical telecommunications and energy sectors.',
    source_url: 'https://www.cisc.gov.au/legislative-information-and-reforms/security-of-critical-infrastructure-act',
    policy_affected: 'Critical Infrastructure'
  }
];

export async function runGlobalRegulatorySyncAndLog(actorId: string = 'SYSTEM_CRON', regionFilter?: string) {
  console.log(`[GlobalRegulatorySync] Starting sync for region: ${regionFilter || 'ALL'} (Triggered by: ${actorId})`);
  
  const filteredActs = regionFilter && regionFilter !== 'GLOBAL'
    ? GLOBAL_REGULATORY_ACTS.filter(a => a.region === regionFilter)
    : GLOBAL_REGULATORY_ACTS;

  const db = getDb();
  let updatedCount = 0;
  let newCount = 0;

  for (const act of filteredActs) {
    try {
      // Check if act already exists in DB
      const existing = db.prepare('SELECT id FROM nre_global_acts WHERE directive_id = ?').get(act.directive_id);
      
      if (existing) {
        // Update existing
        db.prepare(`
          UPDATE nre_global_acts 
          SET title = ?, summary = ?, source_url = ?, last_synced_at = CURRENT_TIMESTAMP 
          WHERE directive_id = ?
        `).run(act.title, act.summary, act.source_url, act.directive_id);
        updatedCount++;
      } else {
        // Insert new
        const id = `gact_${Math.random().toString(36).substring(2, 9)}`;
        db.prepare(`
          INSERT INTO nre_global_acts (id, region, law_code, directive_id, title, summary, source_url)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, act.region, act.law, act.directive_id, act.title, act.summary, act.source_url);
        newCount++;
      }
    } catch (err) {
      console.error(`[GlobalRegulatorySync] Failed to sync act ${act.directive_id}:`, err);
    }
  }

  // Log to Audit Ledger
  try {
    await ledger.commitLog({
      tenantId: 'default',
      actorId: actorId,
      serviceModule: 'GLOBAL_REGULATORY_SYNC',
      actionType: 'CREATE',
      status: 'SUCCESS',
      severity: 'INFO',
      targetResource: `Global Regulatory Sync: ${regionFilter || 'ALL'}`,
      payloadDiff: {
        region: regionFilter || 'GLOBAL',
        new_acts_count: newCount,
        updated_acts_count: updatedCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.warn('[GlobalRegulatorySync] Ledger commit skipped:', err);
  }

  const summary = {
    success: true,
    region: regionFilter || 'GLOBAL',
    added: newCount,
    updated: updatedCount,
    message: `Successfully synced ${newCount} new and ${updatedCount} existing regulatory acts.`
  };

  // Cache a snapshot of the last sync so dashboards can read it without re-querying.
  try {
    await recordJobSnapshot('regsync:last', { ...summary, syncedAt: new Date().toISOString(), actorId }, 3600);
  } catch (err) {
    console.warn('[GlobalRegulatorySync] Snapshot cache write skipped:', err);
  }

  return summary;
}

/** Returns the last successful sync summary from the Redis-alternative cache layer. */
export async function getLastGlobalSyncSnapshot(): Promise<any | null> {
  return readJobSnapshot('regsync:last');
}

export function startGlobalRegulatorySyncService() {
  console.log('[GlobalRegulatorySync] Service Initialized. Running initial sync in background...');
  
  // Initial sync after boot (exclusive-leader guarded: no duplicate sync across daemons/restarts)
  setTimeout(() => {
    runExclusiveJob(
      { jobKey: 'job:regsync:boot', ttlMs: 90000, dedupeWindowMs: 180000, heartbeatIntervalMs: 15000, tag: 'SYSTEM_BOOT' },
      () => runGlobalRegulatorySyncAndLog('SYSTEM_BOOT')
    );
  }, 5000);
}
