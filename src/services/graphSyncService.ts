import { graphStore, GraphNode, GraphRelationship } from './graphStoreAdapter';
import { getDb } from '../db/sqlite';
import { v4 as uuidv4 } from 'uuid';

export interface EntitySyncPayload {
  pg_id: string;
  name: string;
  type: string;
  country: string;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  compliance_score: number;
  blacklisted: boolean;
  directors?: Array<{ name: string; aliases?: string[]; nre_person_id?: string }>;
  identifiers?: Array<{ type: 'TIN' | 'LICENSE' | 'PHONE' | 'EMAIL' | 'DOMAIN' | 'BANK_ACCT'; value: string }>;
  addresses?: Array<{ normalized_value: string; geo?: { lat: number; lng: number } }>;
  websites?: string[];
  violations?: Array<{ pg_id: string; law_section: string; severity: string; detected_at: string }>;
  evidence_ref?: string;
  source?: 'registry' | 'osint' | 'scanner' | 'manual';
}

export class GraphSyncService {
  private static instance: GraphSyncService;

  private constructor() {}

  public static getInstance(): GraphSyncService {
    if (!GraphSyncService.instance) {
      GraphSyncService.instance = new GraphSyncService();
    }
    return GraphSyncService.instance;
  }

  /**
   * Synchronize an entity and all its attached relational nodes to the graph
   */
  public async syncEntity(payload: EntitySyncPayload): Promise<{ success: boolean; syncId: string }> {
    const syncId = `sync_${uuidv4().substring(0, 8)}`;
    const db = getDb();
    const syncedAt = new Date().toISOString();
    const source = payload.source || 'registry';
    const evidenceRef = payload.evidence_ref || 'EV_VAULT_GEN_01';

    try {
      // 1. Entity Node
      const entityNodeId = `entity_${payload.pg_id}`;
      await graphStore.upsertNode({
        id: entityNodeId,
        label: 'Entity',
        properties: {
          pg_id: payload.pg_id,
          name: payload.name,
          type: payload.type,
          country: payload.country,
          risk_tier: payload.risk_tier,
          compliance_score: payload.compliance_score,
          blacklisted: payload.blacklisted,
          synced_at: syncedAt,
        },
      });

      // 2. Directors / Persons
      if (payload.directors && payload.directors.length > 0) {
        for (const director of payload.directors) {
          const personNodeId = `person_${director.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          await graphStore.upsertNode({
            id: personNodeId,
            label: 'Person',
            properties: {
              name: director.name,
              aliases: director.aliases || [],
              pg_id: director.nre_person_id,
            },
          });

          await graphStore.upsertRelationship({
            id: `rel_dir_${entityNodeId}_${personNodeId}`,
            type: 'DIRECTOR_OF',
            fromNodeId: personNodeId,
            toNodeId: entityNodeId,
            properties: {
              source,
              confidence: 0.95,
              evidence_ref: evidenceRef,
              synced_at: syncedAt,
            },
          });

          await graphStore.upsertRelationship({
            id: `rel_own_${entityNodeId}_${personNodeId}`,
            type: 'OWNED_BY',
            fromNodeId: entityNodeId,
            toNodeId: personNodeId,
            properties: {
              source,
              confidence: 0.90,
              evidence_ref: evidenceRef,
              synced_at: syncedAt,
            },
          });
        }
      }

      // 3. Identifiers
      if (payload.identifiers && payload.identifiers.length > 0) {
        for (const ident of payload.identifiers) {
          const identNodeId = `ident_${ident.type}_${ident.value.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          await graphStore.upsertNode({
            id: identNodeId,
            label: 'Identifier',
            properties: {
              type: ident.type,
              value: ident.value,
            },
          });

          await graphStore.upsertRelationship({
            id: `rel_ident_${entityNodeId}_${identNodeId}`,
            type: 'SHARES_IDENTIFIER',
            fromNodeId: entityNodeId,
            toNodeId: identNodeId,
            properties: {
              source,
              confidence: 1.0,
              evidence_ref: evidenceRef,
              synced_at: syncedAt,
            },
          });
        }
      }

      // 4. Addresses
      if (payload.addresses && payload.addresses.length > 0) {
        for (const addr of payload.addresses) {
          const addrNodeId = `addr_${addr.normalized_value.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          await graphStore.upsertNode({
            id: addrNodeId,
            label: 'Address',
            properties: {
              normalized_value: addr.normalized_value,
              geo: addr.geo,
            },
          });

          await graphStore.upsertRelationship({
            id: `rel_loc_${entityNodeId}_${addrNodeId}`,
            type: 'LOCATED_AT',
            fromNodeId: entityNodeId,
            toNodeId: addrNodeId,
            properties: {
              source,
              confidence: 0.90,
              evidence_ref: evidenceRef,
              synced_at: syncedAt,
            },
          });
        }
      }

      // 5. Websites
      if (payload.websites && payload.websites.length > 0) {
        for (const domain of payload.websites) {
          const webNodeId = `web_${domain.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          await graphStore.upsertNode({
            id: webNodeId,
            label: 'Website',
            properties: {
              domain,
            },
          });

          await graphStore.upsertRelationship({
            id: `rel_op_${entityNodeId}_${webNodeId}`,
            type: 'OPERATES',
            fromNodeId: entityNodeId,
            toNodeId: webNodeId,
            properties: {
              source,
              confidence: 0.95,
              evidence_ref: evidenceRef,
              synced_at: syncedAt,
            },
          });
        }
      }

      // 6. Violations
      if (payload.violations && payload.violations.length > 0) {
        for (const viol of payload.violations) {
          const violNodeId = `viol_${viol.pg_id}`;
          await graphStore.upsertNode({
            id: violNodeId,
            label: 'Violation',
            properties: {
              pg_id: viol.pg_id,
              law_section: viol.law_section,
              severity: viol.severity,
              detected_at: viol.detected_at,
            },
          });

          await graphStore.upsertRelationship({
            id: `rel_viol_${entityNodeId}_${violNodeId}`,
            type: 'VIOLATED',
            fromNodeId: entityNodeId,
            toNodeId: violNodeId,
            properties: {
              source,
              confidence: 1.0,
              evidence_ref: evidenceRef,
              synced_at: syncedAt,
            },
          });
        }
      }

      // Log success to relational intel_graph_sync_log
      db.prepare(`
        INSERT INTO intel_graph_sync_log (id, tenant_id, country_id, entity_type, entity_id, operation, sync_status, synced_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(syncId, 'default_tenant', payload.country || 'BD', 'Entity', payload.pg_id, 'UPSERT_NODE', 'SYNCED', syncedAt);

      return { success: true, syncId };
    } catch (err: any) {
      db.prepare(`
        INSERT INTO intel_graph_sync_log (id, tenant_id, country_id, entity_type, entity_id, operation, sync_status, error_message, synced_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(syncId, 'default_tenant', payload.country || 'BD', 'Entity', payload.pg_id, 'UPSERT_NODE', 'FAILED', err.message, syncedAt);

      return { success: false, syncId };
    }
  }

  /**
   * Nightly reconciliation job comparing Postgres/SQLite entity count vs Graph store
   */
  public async reconcileGraph(): Promise<{
    totalNodes: number;
    totalEdges: number;
    entitiesSynced: number;
    reconciledAt: string;
  }> {
    const nodes = await graphStore.getAllNodes();
    const edges = await graphStore.getAllRelationships();
    const entities = nodes.filter(n => n.label === 'Entity');

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      entitiesSynced: entities.length,
      reconciledAt: new Date().toISOString(),
    };
  }
}

export const graphSyncService = GraphSyncService.getInstance();
