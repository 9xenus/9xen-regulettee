import crypto from 'crypto';
import { getDb } from '../../../db/sqlite';
import { complianceModuleRegistry } from './module-registry';
import { listLoadedSectorPacks, listPackEndpoints, type LoadedSectorPack } from './sector-pack-loader';
import { ComplianceManager } from '../../../services/compliance-manager';
import { notificationDispatcher } from '../../../engine/notification-dispatcher';
import { realtimeScoreEngine } from './realtime-score';

/**
 * Pack ↔ Framework / Tenant integration layer.
 * Maps loaded sector packs into the compliance_frameworks + tenant_activation
 * tables so that enabling a pack for a tenant automatically contributes to the
 * tenant's realtime compliance score and appears in scoring breakdown.
 */

/** Upsert a compliance_frameworks row for a loaded pack. Returns the framework id. */
export function syncPackFramework(pack: LoadedSectorPack): number {
  const db = getDb();
  const code = pack.id.toUpperCase();        // pack-logistics → PACK-LOGISTICS
  const version = pack.version || '1.0.0';
  const description = pack.framework || pack.name;

  const existing = db.prepare('SELECT id FROM compliance_frameworks WHERE code = ? AND version = ?').get(code, version) as any;
  if (existing) return existing.id;

  const stmt = db.prepare(`
    INSERT INTO compliance_frameworks (code, version, name, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);
  return stmt.run(code, version, pack.name, description).lastInsertRowid as number;
}

/** Enable a sector pack for a specific tenant (framework activation + modules + notification). */
export function enablePackForTenant(
  packId: string,
  tenantId: string,
  actorId?: string
): { success: boolean; frameworkId: number; activatedModules: number; snapshot?: any } {
  const pack = listLoadedSectorPacks().find(p => p.id === packId);
  if (!pack) throw new Error('Sector pack not found');

  const frameworkId = syncPackFramework(pack);
  const db = getDb();
  const existingActivation = db.prepare(
    `SELECT id FROM tenant_framework_activations WHERE tenant_id = ? AND framework_id = ? AND status = 'ACTIVE'`
  ).get(tenantId, frameworkId) as any;
  if (!existingActivation) {
    ComplianceManager.activateFramework(tenantId, String(frameworkId), { source: 'sector_pack', packId });
  }
  const activatedModules = complianceModuleRegistry.listModules()
    .filter((m: any) => m.configJson?.sectorPack === packId)
    .map((m: any) => complianceModuleRegistry.activate(m.slug || m.id))
    .length;

  // Evaluate score for this framework for the tenant
  let snapshot: any = undefined;
  try {
    const score = realtimeScoreEngine.evaluateTenant(tenantId);
    const fwScore = score.frameworks.find((f: any) => f.code === pack.id.toUpperCase() || f.framework === pack.name);
    snapshot = fwScore || { overallScore: score.overallScore, grade: score.grade, status: score.status };
  } catch { /* score may fail for fresh tenant — non-fatal */ }

  notificationDispatcher.dispatchAlert({
    id: crypto.randomUUID(),
    tenantId,
    priority: 'MEDIUM' as any,
    title: `Sector pack '${pack.name}' enabled`,
    message: `Pack '${pack.name}' activated for tenant ${tenantId}. Framework '${pack.name}' enrolled in scoring.`,
    rawContextData: { packId, tenantId, frameworkId, snapshot },
    preferredChannels: ['IN_APP']
  }).catch(() => {});

  return { success: true, frameworkId, activatedModules, snapshot };
}

/** Disable a sector pack for a specific tenant. */
export function disablePackForTenant(
  packId: string,
  tenantId: string,
  actorId?: string
): { success: boolean; deactivatedModules: number } {
  const pack = listLoadedSectorPacks().find(p => p.id === packId);
  if (!pack) throw new Error('Sector pack not found');

  const code = pack.id.toUpperCase();
  const version = pack.version || '1.0.0';
  const db = getDb();
  const fw = db.prepare('SELECT id FROM compliance_frameworks WHERE code = ? AND version = ?').get(code, version) as any;

  if (fw) {
    db.prepare(`
      UPDATE tenant_framework_activations SET status = 'INACTIVE'
      WHERE tenant_id = ? AND framework_id = ?
    `).run(tenantId, fw.id);
  }

  const deactivatedModules = complianceModuleRegistry.listModules()
    .filter((m: any) => m.configJson?.sectorPack === packId)
    .map((m: any) => complianceModuleRegistry.deactivate(m.slug || m.id))
    .length;

  notificationDispatcher.dispatchAlert({
    id: crypto.randomUUID(),
    tenantId,
    priority: 'MEDIUM' as any,
    title: `Sector pack '${pack.name}' disabled`,
    message: `Pack '${pack.name}' deactivated for tenant ${tenantId}.`,
    rawContextData: { packId, tenantId, deactivatedModules },
    preferredChannels: ['IN_APP']
  }).catch(() => {});

  return { success: true, deactivatedModules };
}

/** List all tenants that have a given sector pack enabled. */
export function listTenantsForPack(packId: string): { tenantId: string; frameworkId: number; status: string }[] {
  const pack = listLoadedSectorPacks().find(p => p.id === packId);
  if (!pack) return [];
  const code = pack.id.toUpperCase();
  const version = pack.version || '1.0.0';
  const db = getDb();
  const fw = db.prepare('SELECT id FROM compliance_frameworks WHERE code = ? AND version = ?').get(code, version) as any;
  if (!fw) return [];
  const rows = db.prepare(`
    SELECT tenant_id, framework_id, status FROM tenant_framework_activations
    WHERE framework_id = ? AND status = 'ACTIVE'
  `).all(fw.id) as any[];
  return rows.map(r => ({ tenantId: r.tenant_id, frameworkId: r.framework_id, status: r.status }));
}

/** Get the realtime score breakdown for a pack/framework across enabled tenants. */
export function getPackScoreBreakdown(packId: string, tenantId?: string): any[] {
  const pack = listLoadedSectorPacks().find(p => p.id === packId);
  if (!pack) return [];
  const code = pack.id.toUpperCase();
  const tenants = listTenantsForPack(packId).filter(t => !tenantId || t.tenantId === tenantId);
  const results: any[] = [];
  for (const tenant of tenants) {
    try {
      const score = realtimeScoreEngine.evaluateTenant(tenant.tenantId);
      const fwScore = score.frameworks.find((f: any) => f.code === code);
      if (fwScore) {
        results.push({ tenantId: tenant.tenantId, packId, frameworkCode: code, ...fwScore, evaluatedAt: score.evaluatedAt });
      }
    } catch { results.push({ tenantId: tenant.tenantId, packId, frameworkCode: code, error: 'Score evaluation failed' }); }
  }
  return results;
}