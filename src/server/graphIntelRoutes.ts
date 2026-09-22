import { Router, Request, Response } from 'express';
import { graphStore } from '../services/graphStoreAdapter';
import { graphSyncService } from '../services/graphSyncService';
import { graphAnalyticsService } from '../services/graphAnalyticsService';
import { entityResolutionService } from '../services/entityResolutionService';
import { getDb } from '../db/sqlite';
import { requireAuth, requireAuthRoles } from '../middleware/auth.js';

export const graphIntelRouter = Router();

graphIntelRouter.use(requireAuth);

/**
 * GET /api/v1/intel/graph/overview
 * Overview metrics for Graph Intelligence Dashboard
 */
graphIntelRouter.get('/overview', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const nodes = await graphStore.getAllNodes();
    const edges = await graphStore.getAllRelationships();

    const entities = nodes.filter(n => n.label === 'Entity');
    const persons = nodes.filter(n => n.label === 'Person');
    const identifiers = nodes.filter(n => n.label === 'Identifier');
    const violations = nodes.filter(n => n.label === 'Violation');

    const findings = db.prepare('SELECT * FROM intel_graph_findings ORDER BY created_at DESC LIMIT 50').all() as any[];
    const serialOps = findings.filter(f => f.finding_type === 'serial_operator');
    const shellLoops = findings.filter(f => f.finding_type === 'circular_ownership');
    const riskClusters = findings.filter(f => f.finding_type === 'cluster_risk');

    res.json({
      success: true,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        entityCount: entities.length,
        personCount: persons.length,
        identifierCount: identifiers.length,
        violationCount: violations.length,
        totalFindings: findings.length,
        serialOperatorsCount: serialOps.length,
        shellLoopsCount: shellLoops.length,
        riskClustersCount: riskClusters.length,
      },
      recentFindings: findings.slice(0, 10),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/intel/graph/query
 * Curated Graph Query Gateway
 */
graphIntelRouter.post('/query', async (req: Request, res: Response) => {
  try {
    const { action, entityId, depth, e1, e2, clusterId, countryId, findingId, status, reviewNotes, reviewer } = req.body;
    const db = getDb();

    switch (action) {
      case 'entity-network': {
        const targetId = entityId.startsWith('entity_') ? entityId : `entity_${entityId}`;
        const searchDepth = Math.min(depth || 2, 3);
        const neighborhood = await graphStore.getNeighbors(targetId, searchDepth);
        return res.json({
          success: true,
          action: 'entity-network',
          targetId,
          depth: searchDepth,
          nodes: neighborhood.nodes,
          edges: neighborhood.edges,
        });
      }

      case 'shortest-path': {
        if (!e1 || !e2) {
          return res.status(400).json({ success: false, error: 'e1 and e2 parameters are required' });
        }
        const startId = e1.startsWith('entity_') ? e1 : `entity_${e1}`;
        const endId = e2.startsWith('entity_') ? e2 : `entity_${e2}`;

        // BFS for shortest path
        const queue: Array<{ current: string; path: string[]; edges: any[] }> = [
          { current: startId, path: [startId], edges: [] }
        ];
        const visited = new Set<string>([startId]);
        let foundPath: { path: string[]; edges: any[] } | null = null;

        const allEdges = await graphStore.getAllRelationships();

        while (queue.length > 0) {
          const { current, path, edges } = queue.shift()!;
          if (current === endId) {
            foundPath = { path, edges };
            break;
          }

          const connected = allEdges.filter(e => e.fromNodeId === current || e.toNodeId === current);
          for (const edge of connected) {
            const nextNode = edge.fromNodeId === current ? edge.toNodeId : edge.fromNodeId;
            if (!visited.has(nextNode)) {
              visited.add(nextNode);
              queue.push({
                current: nextNode,
                path: [...path, nextNode],
                edges: [...edges, edge],
              });
            }
          }
        }

        const pathNodes: any[] = [];
        if (foundPath) {
          for (const nid of foundPath.path) {
            const node = await graphStore.getNode(nid);
            if (node) pathNodes.push(node);
          }
        }

        return res.json({
          success: true,
          action: 'shortest-path',
          e1: startId,
          e2: endId,
          pathLength: foundPath ? foundPath.path.length - 1 : -1,
          nodes: pathNodes,
          edges: foundPath ? foundPath.edges : [],
        });
      }

      case 'serial-operators': {
        const serialOps = await graphAnalyticsService.detectSerialOperators();
        return res.json({
          success: true,
          action: 'serial-operators',
          count: serialOps.length,
          data: serialOps,
        });
      }

      case 'shell-candidates': {
        const cycles = await graphAnalyticsService.detectOwnershipCycles();
        return res.json({
          success: true,
          action: 'shell-candidates',
          count: cycles.length,
          data: cycles,
        });
      }

      case 'clusters': {
        const clusters = await graphAnalyticsService.detectRiskClusters();
        return res.json({
          success: true,
          action: 'clusters',
          count: clusters.length,
          data: clusters,
        });
      }

      case 'risk-propagation': {
        if (!entityId) {
          return res.status(400).json({ success: false, error: 'entityId is required for risk-propagation' });
        }
        const cleanId = entityId.replace('entity_', '');
        const riskData = await graphAnalyticsService.computeKilledRiskScore(cleanId, depth || 2);
        return res.json({
          success: true,
          action: 'risk-propagation',
          entityId: cleanId,
          risk: riskData,
        });
      }

      case 'findings': {
        let query = 'SELECT * FROM intel_graph_findings';
        const params: any[] = [];
        const whereClauses: string[] = [];

        if (status) {
          whereClauses.push('status = ?');
          params.push(status);
        }
        if (countryId) {
          whereClauses.push('country_id = ?');
          params.push(countryId);
        }

        if (whereClauses.length > 0) {
          query += ' WHERE ' + whereClauses.join(' AND ');
        }
        query += ' ORDER BY created_at DESC LIMIT 100';

        const rows = db.prepare(query).all(...params) as any[];
        return res.json({
          success: true,
          action: 'findings',
          count: rows.length,
          findings: rows,
        });
      }

      case 'review-finding': {
        if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
          return res.status(403).json({ success: false, error: 'Admin privileges required to review findings' });
        }
        if (!findingId || !status) {
          return res.status(400).json({ success: false, error: 'findingId and status are required' });
        }

        db.prepare(`
          UPDATE intel_graph_findings
          SET status = ?, reviewed_by = ?, review_notes = ?, reviewed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(status, reviewer || 'authority_inspector', reviewNotes || '', findingId);

        return res.json({
          success: true,
          action: 'review-finding',
          findingId,
          status,
          reviewedAt: new Date().toISOString(),
        });
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}. Allowed actions: entity-network, shortest-path, serial-operators, shell-candidates, clusters, risk-propagation, findings, review-finding`,
        });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/intel/graph/seed-demo
 * Seed a comprehensive multi-entity network with serial operators, cycles, and shared identifiers
 */
graphIntelRouter.post('/seed-demo', requireAuthRoles(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, error: 'Demo seeding is disabled in production.' });
    }
    await graphStore.clearGraph();

    // 1. Serial Operator Phone Network
    const serialPhone = '+8801711223344';
    const serialTin = 'TIN-BD-9008123';

    await graphSyncService.syncEntity({
      pg_id: 'ent_bkash_agent_01',
      name: 'Chowdhury Telecom & Paypoint Ltd',
      type: 'Fintech Agent',
      country: 'BD',
      risk_tier: 'HIGH',
      compliance_score: 42,
      blacklisted: false,
      directors: [{ name: 'Kabir Chowdhury', aliases: ['K. Chowdhury'] }],
      identifiers: [
        { type: 'PHONE', value: serialPhone },
        { type: 'TIN', value: serialTin }
      ],
      websites: ['chowdhurytelecom.bd'],
      violations: [
        { pg_id: 'viol_c_01', law_section: 'BTRC Act Section 57', severity: 'HIGH', detected_at: '2026-07-12' }
      ],
      evidence_ref: 'EV_VAULT_CHOWDHURY_01'
    });

    await graphSyncService.syncEntity({
      pg_id: 'ent_bkash_agent_02',
      name: 'Skyline Express Logistics Ltd',
      type: 'Courier / E-Commerce',
      country: 'BD',
      risk_tier: 'CRITICAL',
      compliance_score: 28,
      blacklisted: true,
      directors: [{ name: 'Kabir Chowdhury' }],
      identifiers: [
        { type: 'PHONE', value: serialPhone },
        { type: 'TIN', value: serialTin }
      ],
      websites: ['skylineexpress.bd'],
      violations: [
        { pg_id: 'viol_c_02', law_section: 'Consumer Rights Protection Sec 24', severity: 'CRITICAL', detected_at: '2026-08-01' }
      ],
      evidence_ref: 'EV_VAULT_SKYLINE_02'
    });

    await graphSyncService.syncEntity({
      pg_id: 'ent_bkash_agent_03',
      name: 'Nirapad Agro Mart Ltd',
      type: 'E-commerce Merchant',
      country: 'BD',
      risk_tier: 'MEDIUM',
      compliance_score: 55,
      blacklisted: false,
      directors: [{ name: 'Shakil Ahmed' }],
      identifiers: [
        { type: 'PHONE', value: serialPhone }
      ],
      websites: ['nirapadmart.com']
    });

    // 2. Shell Corporation Ownership Loop: Alpha -> Beta -> Gamma -> Alpha
    await graphSyncService.syncEntity({
      pg_id: 'ent_shell_alpha',
      name: 'Alpha Global Holdings Ltd',
      type: 'Holding Co',
      country: 'BD',
      risk_tier: 'HIGH',
      compliance_score: 48,
      blacklisted: false
    });

    await graphSyncService.syncEntity({
      pg_id: 'ent_shell_beta',
      name: 'Beta Trade Solutions Ltd',
      type: 'Trading Co',
      country: 'BD',
      risk_tier: 'HIGH',
      compliance_score: 45,
      blacklisted: false
    });

    await graphSyncService.syncEntity({
      pg_id: 'ent_shell_gamma',
      name: 'Gamma Offshore Capital Ltd',
      type: 'Asset Management',
      country: 'BD',
      risk_tier: 'CRITICAL',
      compliance_score: 30,
      blacklisted: false
    });

    await graphStore.upsertRelationship({
      id: 'rel_own_alpha_beta',
      type: 'OWNED_BY',
      fromNodeId: 'entity_ent_shell_alpha',
      toNodeId: 'entity_ent_shell_beta',
      properties: { source: 'registry', confidence: 1.0, synced_at: new Date().toISOString() }
    });

    await graphStore.upsertRelationship({
      id: 'rel_own_beta_gamma',
      type: 'OWNED_BY',
      fromNodeId: 'entity_ent_shell_beta',
      toNodeId: 'entity_ent_shell_gamma',
      properties: { source: 'registry', confidence: 1.0, synced_at: new Date().toISOString() }
    });

    await graphStore.upsertRelationship({
      id: 'rel_own_gamma_alpha',
      type: 'OWNED_BY',
      fromNodeId: 'entity_ent_shell_gamma',
      toNodeId: 'entity_ent_shell_alpha',
      properties: { source: 'registry', confidence: 1.0, synced_at: new Date().toISOString() }
    });

    // Run analytics suite to populate findings
    const analyticsResults = await graphAnalyticsService.runAllAnalytics();

    res.json({
      success: true,
      message: 'Demo graph network seeded and analytics computed',
      analyticsResults,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
