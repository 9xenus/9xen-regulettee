import { complianceModuleRegistry, type ComplianceSectorCategory } from './module-registry';
import { getDb } from '../../../db/sqlite';
import { requireAuth } from '../../../middleware/auth.js';
import { GovtSectorPack } from '../../../../packages/sectors/govt/index';
import { LegalSectorPack } from '../../../../packages/sectors/legal/index';
import { FinanceSectorPack } from '../../../../packages/sectors/finance/index';
import { Pack as HealthcarePack } from '../../../../packages/sectors/healthcare/index';
import { Pack as InsurancePack } from '../../../../packages/sectors/insurance/index';
import { Pack as EnergyPack } from '../../../../packages/sectors/energy/index';
import { Pack as TelecomPack } from '../../../../packages/sectors/telecom/index';
import { Pack as RetailPack } from '../../../../packages/sectors/retail/index';
import { Pack as EducationPack } from '../../../../packages/sectors/education/index';
import { Pack as TransportationPack } from '../../../../packages/sectors/transportation/index';
import { Pack as ManufacturingPack } from '../../../../packages/sectors/manufacturing/index';
import { Pack as PharmaPack } from '../../../../packages/sectors/pharma/index';
import { Pack as GamingPack } from '../../../../packages/sectors/gaming/index';
import { Pack as AgriculturePack } from '../../../../packages/sectors/agriculture/index';
import { Pack as RealEstatePack } from '../../../../packages/sectors/realestate/index';
import { Pack as AviationPack } from '../../../../packages/sectors/aviation/index';
import { Pack as HospitalityPack } from '../../../../packages/sectors/hospitality/index';
import { Pack as ExportPack } from '../../../../packages/sectors/export/index';
import { Pack as CyberPack } from '../../../../packages/sectors/cyber/index';
import { Pack as FoodPack } from '../../../../packages/sectors/food/index';
import { Pack as MediaPack } from '../../../../packages/sectors/media/index';
import { Pack as MiningPack } from '../../../../packages/sectors/mining/index';
import { Pack as AutomotivePack } from '../../../../packages/sectors/automotive/index';
import { Pack as LogisticsPack } from '../../../../packages/sectors/logistics/index';
import { Pack as MedicalDevicesPack } from '../../../../packages/sectors/medical-devices/index';

/**
 * Sector Pack Loader — registers reusable compliance sector packs
 * (finance, healthcare, govt, legal, insurance...) into the running server
 * and the Compliance Module Registry, so each vertical is modular,
 * activation-controlled, and visible in the compliance hub.
 */

type SectorPackLike = {
  id?: string;
  name: string;
  version?: string;
  description?: string;
  framework?: string;
  modules?: { id: string; name: string; type: string }[];
  schema?: {
    tables: Array<{
      name: string;
      columns: Array<{
        name: string;
        type: string;
        primary?: boolean;
        required?: boolean;
        unique?: boolean;
      }>;
    }>;
  };
  registerRoutes?: (app: any) => any;
  registerModels?: () => any[];
};

/** Maps a pack id to a primary compliance sector category for module registration. */
const SECTOR_PACK_CATEGORY: Record<string, ComplianceSectorCategory> = {
  'pack-govt': 'GOVERNMENT_B2G',
  'pack-finance': 'FINANCIAL_REGULATION',
  'pack-cyber': 'CYBERSECURITY',
  'pack-insurance': 'FINANCIAL_REGULATION',
  'pack-export': 'CROSS_BORDER',
  'pack-mining': 'ESG_SUSTAINABILITY',
  'pack-energy': 'ESG_SUSTAINABILITY',
  'pack-healthcare': 'DATA_PROTECTION',
  'pack-food': 'CONSUMER_PROTECTION',
  'pack-media': 'CONSUMER_PROTECTION',
  'pack-manufacturing': 'OPERATIONAL_RESILIENCE',
  'pack-pharma': 'CONSUMER_PROTECTION',
  'pack-agriculture': 'ESG_SUSTAINABILITY',
  'pack-automotive': 'OPERATIONAL_RESILIENCE',
  'pack-logistics': 'CROSS_BORDER',
  'pack-medical-devices': 'CONSUMER_PROTECTION',
};

function looksLikePack(c: any): boolean {
  return Boolean(c && (typeof c === 'object' || typeof c === 'function') && (c.registerRoutes || c.modules || (typeof c === 'object' && c.schema)));
}

function looksLikePackClass(c: any): boolean {
  return Boolean(c && typeof c === 'function' && c.prototype && (c.prototype.registerRoutes || c.prototype.modules || c.prototype.schema));
}

/**
 * Resolve a pack value regardless of whether it reached us as a raw pack
 * object, an ESM namespace ({ Pack, default, ... }), or a class that should
 * be instantiated. Returns a SectorPack-like object or null.
 */
function resolvePack(mod: any): SectorPackLike | null {
  if (!mod) return null;
  // 1. Raw pack object or class
  if (looksLikePack(mod) || looksLikePackClass(mod)) {
    return typeof mod === 'function' ? new mod() : mod;
  }
  // 2. Module namespace — check named exports then default
  const candidates: any[] = [];
  for (const key of ['Pack', 'SectorPack', 'default']) {
    if (mod[key] !== undefined) candidates.push(mod[key]);
  }
  const obj = candidates.find(c => looksLikePack(c) || looksLikePackClass(c)) || null;
  if (!obj) return null;
  return typeof obj === 'function' ? new obj() : obj;
}

export interface LoadedSectorPack {
  id: string;
  name: string;
  version: string;
  moduleCount: number;
  routeRegistered: boolean;
  modelCount: number;
  schemaTables: number;
  category: ComplianceSectorCategory;
  framework: string;
  endpoints: string[];
}

let loadedPacks: LoadedSectorPack[] = [];
let packEndpointsMap: Record<string, string[]> = {};

const SQLITE_TYPE_MAP: Record<string, string> = {
  uuid: 'TEXT',
  string: 'TEXT',
  text: 'TEXT',
  integer: 'INTEGER',
  decimal: 'REAL',
  float: 'REAL',
  jsonb: 'TEXT',
  json: 'TEXT',
  timestamp: 'TIMESTAMP',
  boolean: 'INTEGER',
  date: 'DATE',
};

function buildDdl(schemaDef?: SectorPackLike['schema']): string[] {
  if (!schemaDef || !Array.isArray(schemaDef.tables)) return [];
  const ddl: string[] = [];
  for (const table of schemaDef.tables) {
    const cols = (table.columns || []).map(col => {
      const type = SQLITE_TYPE_MAP[col.type?.toLowerCase()] || 'TEXT';
      const parts = [`"${col.name}" ${type}`];
      if (col.primary) parts.push('PRIMARY KEY');
      if (col.required) parts.push('NOT NULL');
      if (col.unique) parts.push('UNIQUE');
      return parts.join(' ');
    });
    ddl.push(`CREATE TABLE IF NOT EXISTS ${table.name} (${cols.join(', ')})`);
  }
  return ddl;
}

function registerSchema(packName: string, schemaDef?: SectorPackLike['schema']): number {
  const ddl = buildDdl(schemaDef);
  if (!ddl.length) return 0;
  try {
    const db = getDb();
    for (const sql of ddl) db.exec(sql);
    return ddl.length;
  } catch (err: any) {
    console.warn(`[SECTOR_LOADER] Schema registration failed for '${packName}': ${err?.message}`);
    return 0;
  }
}

function registerPackRoutes(pack: SectorPackLike, app: any): boolean {
  if (!pack.registerRoutes) return false;
  try {
    const router = pack.registerRoutes(app);
    // Router-based packs are mounted, auth-protected, under /api/v1/compliance-hub/sector/<id>
    // Express Router is a callable function; a returned value with get/post/use is the router.
    if (router && typeof router === 'function' && typeof router.get === 'function') {
      const id = pack.id || pack.name.toLowerCase().replace(/[^a-z0-9]/gi, '');
      app.use(`/api/v1/compliance-hub/sector/${id}`, requireAuth, router);
      packEndpointsMap[id] = discoverPackEndpoints(router);
    }
    return true;
  } catch (err: any) {
    console.warn(`[SECTOR_LOADER] Route registration failed for '${pack.name}': ${err?.message}`);
    return false;
  }
}

/** Returns the discovered endpoint routes for a pack id (falls back to healthcheck). */
export function listPackEndpoints(id: string): string[] {
  return packEndpointsMap[id] || ['GET /healthcheck'];
}

function registerPackModules(pack: SectorPackLike): number {
  const modules = pack.modules || [];
  const resolvedCategory = SECTOR_PACK_CATEGORY[pack.id || ''] || (pack.name.toLowerCase().includes('government') || pack.name.toLowerCase().includes('public')
    ? 'GOVERNMENT_B2G'
    : 'SECTOR_SPECIFIC');
  for (const m of modules) {
    if (!m?.id) continue;
    try {
      complianceModuleRegistry.registerModule({
        id: `sector_${m.id}`,
        name: m.name,
        slug: m.id.replace(/_/g, '-'),
        version: pack.version || '1.0.0',
        category: resolvedCategory,
        jurisdiction: 'GLOBAL',
        description: `[Sector Pack: ${pack.name}] ${pack.description || ''}`.trim(),
        configJson: { sector: m.type || 'unknown', sectorPack: pack.id || pack.name },
        entryPoint: null
      });
    } catch (err: any) {
      console.warn(`[SECTOR_LOADER] Module '${m.id}' registration failed: ${err?.message}`);
    }
  }
  return modules.length;
}

/** Introspects an Express Router to enumerate its registered paths (plus healthcheck). */
function discoverPackEndpoints(router: any): string[] {
  const endpoints: string[] = [];
  if (!router || typeof router.stack?.forEach !== 'function') return ['/healthcheck'];
  router.stack.forEach((layer: any) => {
    if (layer?.route) {
      const methods = Object.keys(layer.route.methods || {})
        .filter(m => layer.route.methods[m])
        .map(m => m.toUpperCase());
      const path = `/${String(layer.route.path).replace(/^\//, '')}`;
      endpoints.push(methods.length ? `${methods.join('|')} ${path}` : path);
    }
  });
  if (!endpoints.some(e => e.includes('/healthcheck'))) endpoints.push('GET /healthcheck');
  return endpoints;
}

/** Register all known sector packs against the Express app + DB. */
export function registerSectorPacks(app: any): LoadedSectorPack[] {
  const packModules: any[] = [
    GovtSectorPack, LegalSectorPack, FinanceSectorPack,
    HealthcarePack, InsurancePack, EnergyPack, TelecomPack, RetailPack,
    EducationPack, TransportationPack, ManufacturingPack, PharmaPack,
    GamingPack, AgriculturePack, RealEstatePack, AviationPack, HospitalityPack,
    ExportPack, CyberPack, FoodPack, MediaPack, MiningPack,
    AutomotivePack, LogisticsPack, MedicalDevicesPack,
  ];

  const packs: SectorPackLike[] = [];
  for (let i = 0; i < packModules.length; i++) {
    try {
      const resolved = resolvePack(packModules[i]);
      if (resolved) packs.push(resolved);
      else console.warn(`[SECTOR_LOADER] Pack index ${i} unresolved.`);
    } catch (err: any) {
      console.warn('[SECTOR_LOADER] Pack registration failed:', err?.message);
    }
  }

  loadedPacks = packs.map(pack => {
    const packName = pack.name || pack.id || 'unnamed-pack';
    console.log('[SECTOR_LOADER] registering', packName);
    const tables = registerSchema(packName, pack.schema);
    const routeRegistered = registerPackRoutes(pack, app);
    const moduleCount = registerPackModules(pack);
    const models = pack.registerModels ? (pack.registerModels() || []) : [];
    const packId = pack.id || `sector-${packName.toLowerCase().replace(/[^a-z0-9]/gi, '')}`;
    return {
      id: packId,
      name: packName,
      version: pack.version || '1.0.0',
      moduleCount,
      routeRegistered,
      modelCount: models.length,
      schemaTables: tables,
      category: SECTOR_PACK_CATEGORY[packId] || 'SECTOR_SPECIFIC',
      framework: pack.framework || pack.description || 'Cross-vertical compliance alignment',
      endpoints: listPackEndpoints(packId),
    };
  });

  return loadedPacks;
}

export function listLoadedSectorPacks(): LoadedSectorPack[] {
  return loadedPacks;
}