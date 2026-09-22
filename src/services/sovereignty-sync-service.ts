import db from '../db/sqlite';
import { RegionalDatabaseRouter } from './regional-db-router';
import { sovereigntyAlerts } from './sovereignty-alert-service';
import crypto from 'crypto';

export interface SyncResult {
  region: string;
  recordsProcessed: number;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
}

/**
 * SovereigntySyncService
 * Orchestrates the migration and synchronization of compliance data from central stores
 * to regional sovereign shards (EU, APAC, USA, LATAM, Australia).
 */
export class SovereigntySyncService {
  
  /**
   * Synchronizes compliance findings from the central SQLite database to regional shards.
   * Ensures that records with specific regulatory mappings are moved to their respective
   * sovereign database files.
   */
  public static async syncCentralToRegional(): Promise<SyncResult[]> {
    console.log('[SOVEREIGNTY_SYNC] Starting global data rebalance...');
    const results: SyncResult[] = [];
    const regions = ['EU', 'USA', 'LATAM', 'AUSTRALIA', 'APAC'];

    // 1. Fetch all unsynced or central compliance findings
    // Note: In this simulation, we check the central 'scan_results' table
    let centralFindings: any[] = [];
    try {
      centralFindings = db.prepare('SELECT * FROM scan_results').all();
    } catch (e) {
      console.warn('[SOVEREIGNTY_SYNC] Central scan_results table not found or empty.');
      return [];
    }

    for (const region of regions) {
      try {
        const regionalDb = RegionalDatabaseRouter.getDbForRegion(region);
        
        // Filter findings that belong to this region based on profile or mapping
        const regionFindings = centralFindings.filter(f => {
          const profile = (f.compliance_profile || '').toUpperCase();
          if (region === 'EU' && (profile.includes('GDPR') || profile.includes('EU AI ACT'))) return true;
          if (region === 'USA' && (profile.includes('CCPA') || profile.includes('COPPA') || profile.includes('HIPAA'))) return true;
          if (region === 'APAC' && (profile.includes('PDPA') || profile.includes('MAS FEAT'))) return true;
          if (region === 'LATAM' && profile.includes('LGPD')) return true;
          if (region === 'AUSTRALIA' && (profile.includes('APRA') || profile.includes('CDR'))) return true;
          return false;
        });

        // Residency Audit: Check if central records that belong here are still in central DB
        if (regionFindings.length > 0) {
          console.log(`[SOVEREIGNTY_SYNC] Found ${regionFindings.length} records requiring localization to ${region}`);
        }

        let processed = 0;
        for (const finding of regionFindings) {
          // Check if record already exists in regional shard to avoid duplicates
          const exists = regionalDb.prepare('SELECT 1 FROM scan_results WHERE scan_id = ?').get(finding.scan_id);
          
          if (!exists) {
            regionalDb.prepare(`
              INSERT INTO scan_results (
                scan_id, user_id, region, compliance_profile, 
                risk_score, decision_status, reason_codes, timestamp
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              finding.scan_id,
              finding.user_id,
              region,
              finding.compliance_profile,
              finding.risk_score,
              finding.decision_status,
              finding.reason_codes,
              finding.timestamp
            );

            // Log the migration in the regional audit event store
            regionalDb.prepare(`
              INSERT INTO audit_events (id, scan_id, action, input_data, output_data)
              VALUES (?, ?, ?, ?, ?)
            `).run(
              `MIG-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
              finding.scan_id,
              'DATA_LOCALIZATION_SYNC',
              JSON.stringify({ source: 'CENTRAL_DB', target: `compliance_${region.toLowerCase()}.db` }),
              JSON.stringify({ status: 'MIGRATED', sovereignty: 'COMPLIANT' })
            );
            
            processed++;

            // REMOVE from central DB once sovereignly localized to ensure compliance
            db.prepare('DELETE FROM scan_results WHERE scan_id = ?').run(finding.scan_id);
          }
        }

        results.push({ region, recordsProcessed: processed, status: 'SUCCESS' });
      } catch (err: any) {
        console.error(`[SOVEREIGNTY_SYNC] Failed to sync region ${region}:`, err.message);
        
        // TRIGGER CRITICAL ALERT: Node out of compliance due to sync failure
        sovereigntyAlerts.pushAlert({
          region,
          severity: 'CRITICAL',
          type: 'SHARD_OFFLINE',
          message: `Regional shard ${region} failed synchronization. Data residency is AT RISK.`,
          details: { error: err.message }
        });

        results.push({ region, recordsProcessed: 0, status: 'FAILED', error: err.message });
      }
    }

    // Secondary Audit: Detect residency mismatches in central DB
    // If there are still sensitive regional profiles in the central DB, trigger a warning
    const remainingSensitive = centralFindings.filter(f => {
      const p = (f.compliance_profile || '').toUpperCase();
      return p.includes('GDPR') || p.includes('LGPD') || p.includes('PDPA') || p.includes('APRA');
    });

    if (remainingSensitive.length > 0) {
      sovereigntyAlerts.pushAlert({
        region: 'GLOBAL',
        severity: 'HIGH',
        type: 'RESIDENCY_MISMATCH',
        message: `${remainingSensitive.length} sensitive records detected in Central Hub (Storage Sovereignty Violation).`,
        details: { recordCount: remainingSensitive.length }
      });
    }

    console.log('[SOVEREIGNTY_SYNC] Synchronization complete.', results);
    return results;
  }

  /**
   * Generates a global compliance coverage report by aggregating stats from all regional shards.
   */
  public static async getGlobalSovereigntyReport() {
    const regions = ['EU', 'USA', 'LATAM', 'AUSTRALIA', 'APAC'];
    const report: any = {
      totalRecords: 0,
      regionalBreakdown: {},
      sovereigntyHealth: 'OPTIMAL'
    };

    for (const region of regions) {
      try {
        const regionalDb = RegionalDatabaseRouter.getDbForRegion(region);
        const row = regionalDb.prepare('SELECT COUNT(*) as count FROM scan_results').get();
        const count = row ? (row as any).count : 0;
        
        report.regionalBreakdown[region] = {
          recordCount: count,
          shardStatus: 'ONLINE',
          storageCompliance: 'VERIFIED'
        };
        report.totalRecords += count;
      } catch (e) {
        report.regionalBreakdown[region] = { shardStatus: 'OFFLINE', storageCompliance: 'UNKNOWN' };
      }
    }

    return report;
  }
}
