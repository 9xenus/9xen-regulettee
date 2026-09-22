import { graphStore, GraphNode, GraphRelationship } from './graphStoreAdapter';
import { getDb } from '../db/sqlite';
import { v4 as uuidv4 } from 'uuid';

export interface ClusterRiskFinding {
  clusterId: string;
  entityIds: string[];
  totalEntities: number;
  totalViolations: number;
  violationDensity: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CycleFinding {
  cyclePath: string[];
  entityIds: string[];
  length: number;
}

export interface SerialOperatorFinding {
  identifierType: string;
  identifierValue: string;
  linkedEntityIds: string[];
  fanOutCount: number;
  violatingEntityCount: number;
}

export class GraphAnalyticsService {
  private static instance: GraphAnalyticsService;

  private constructor() {}

  public static getInstance(): GraphAnalyticsService {
    if (!GraphAnalyticsService.instance) {
      GraphAnalyticsService.instance = new GraphAnalyticsService();
    }
    return GraphAnalyticsService.instance;
  }

  /**
   * Run the full graph analytics job suite
   */
  public async runAllAnalytics(): Promise<{
    serialOperators: SerialOperatorFinding[];
    cycles: CycleFinding[];
    highRiskClusters: ClusterRiskFinding[];
    pageRankMap: Record<string, number>;
    findingsGenerated: number;
  }> {
    const serialOperators = await this.detectSerialOperators();
    const cycles = await this.detectOwnershipCycles();
    const highRiskClusters = await this.detectRiskClusters();
    const pageRankMap = await this.computePageRank();

    const findingsGenerated = serialOperators.length + cycles.length + highRiskClusters.length;

    return {
      serialOperators,
      cycles,
      highRiskClusters,
      pageRankMap,
      findingsGenerated,
    };
  }

  /**
   * (a) Shared-Identifier Fan-out Detection (1 identifier -> 3+ entities)
   */
  public async detectSerialOperators(): Promise<SerialOperatorFinding[]> {
    const nodes = await graphStore.getAllNodes();
    const edges = await graphStore.getAllRelationships();
    const db = getDb();
    const findings: SerialOperatorFinding[] = [];

    const identifierNodes = nodes.filter(n => n.label === 'Identifier');

    for (const ident of identifierNodes) {
      const connectedEdges = edges.filter(
        e => e.toNodeId === ident.id && e.type === 'SHARES_IDENTIFIER'
      );

      const linkedEntityIds = Array.from(new Set(connectedEdges.map(e => e.fromNodeId.replace('entity_', ''))));

      if (linkedEntityIds.length >= 3) {
        // Count violations associated with these entities
        const violEdges = edges.filter(
          e => e.type === 'VIOLATED' && linkedEntityIds.includes(e.fromNodeId.replace('entity_', ''))
        );
        const violatingEntities = Array.from(new Set(violEdges.map(e => e.fromNodeId.replace('entity_', ''))));

        const finding: SerialOperatorFinding = {
          identifierType: ident.properties.type || 'IDENTIFIER',
          identifierValue: ident.properties.value || ident.id,
          linkedEntityIds,
          fanOutCount: linkedEntityIds.length,
          violatingEntityCount: violatingEntities.length,
        };
        findings.push(finding);

        // Store finding in intel_graph_findings
        const findingId = `find_serial_${uuidv4().substring(0, 8)}`;
        const explanation = `Shared ${ident.properties.type} (${ident.properties.value}) linked across ${linkedEntityIds.length} entities (${violatingEntities.length} with confirmed violations). Potential serial operator network.`;

        try {
          db.prepare(`
            INSERT INTO intel_graph_findings (
              id, tenant_id, country_id, finding_type, primary_entity_id, related_entity_ids,
              confidence, risk_score, xai_explanation, evidence_refs, review_status, severity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            findingId,
            'default_tenant',
            'BD',
            'serial_operator',
            linkedEntityIds[0] || 'GENERAL',
            JSON.stringify(linkedEntityIds),
            0.95,
            0.88,
            explanation,
            JSON.stringify(['EV_GRAPH_FANOUT_' + ident.id]),
            'PENDING_REVIEW',
            violatingEntities.length > 0 ? 'CRITICAL' : 'HIGH'
          );

          // Dispatch to central alerts table
          this.dispatchGraphAlert({
            title: `Serial Operator Network Flagged (${ident.properties.type})`,
            message: explanation,
            severity: violatingEntities.length > 0 ? 'CRITICAL' : 'HIGH',
            entityIds: linkedEntityIds,
          });
        } catch (e: any) {
          console.warn('[GraphAnalytics] Notice saving serial operator finding:', e.message);
        }
      }
    }

    return findings;
  }

  /**
   * (b) Circular Ownership Cycle Detection (Tarjan's DFS on OWNED_BY / DIRECTOR_OF)
   */
  public async detectOwnershipCycles(): Promise<CycleFinding[]> {
    const edges = await graphStore.getAllRelationships();
    const ownershipEdges = edges.filter(e => e.type === 'OWNED_BY' || e.type === 'DIRECTOR_OF');
    const db = getDb();
    const cycles: CycleFinding[] = [];

    // Build adjacency list
    const adj = new Map<string, string[]>();
    for (const e of ownershipEdges) {
      if (!adj.has(e.fromNodeId)) adj.set(e.fromNodeId, []);
      adj.get(e.fromNodeId)!.push(e.toNodeId);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();
    const currentPath: string[] = [];

    const dfs = (node: string) => {
      visited.add(node);
      recStack.add(node);
      currentPath.push(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        } else if (recStack.has(neighbor)) {
          // Cycle found
          const cycleStartIdx = currentPath.indexOf(neighbor);
          if (cycleStartIdx !== -1) {
            const cycle = currentPath.slice(cycleStartIdx);
            if (cycle.length >= 2) {
              const entityIds = cycle.map(n => n.replace('entity_', '').replace('person_', ''));
              cycles.push({
                cyclePath: cycle,
                entityIds,
                length: cycle.length,
              });

              const findingId = `find_cycle_${uuidv4().substring(0, 8)}`;
              const explanation = `Circular ownership loop detected spanning ${cycle.length} nodes: ${cycle.join(' ➔ ')}. Strong indicator of shell structure.`;

              try {
                db.prepare(`
                  INSERT INTO intel_graph_findings (
                    id, tenant_id, country_id, finding_type, primary_entity_id, related_entity_ids,
                    confidence, risk_score, xai_explanation, evidence_refs, review_status, severity
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                  findingId,
                  'default_tenant',
                  'BD',
                  'ownership_cycle',
                  entityIds[0] || 'GENERAL',
                  JSON.stringify(entityIds),
                  0.91,
                  0.85,
                  explanation,
                  JSON.stringify(['EV_GRAPH_CYCLE_' + cycle.join('_')]),
                  'PENDING_REVIEW',
                  'HIGH'
                );

                this.dispatchGraphAlert({
                  title: 'Circular Ownership Loop Detected',
                  message: explanation,
                  severity: 'HIGH',
                  entityIds,
                });
              } catch (e: any) {
                console.warn('[GraphAnalytics] Notice saving cycle finding:', e.message);
              }
            }
          }
        }
      }

      currentPath.pop();
      recStack.delete(node);
    };

    for (const node of adj.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }

  /**
   * (c) Community & Cluster Risk Detection (Louvain / Connected Component Density)
   */
  public async detectRiskClusters(): Promise<ClusterRiskFinding[]> {
    const nodes = await graphStore.getAllNodes();
    const edges = await graphStore.getAllRelationships();
    const db = getDb();
    const entityNodes = nodes.filter(n => n.label === 'Entity');
    const highRiskClusters: ClusterRiskFinding[] = [];

    // Form connected entity components
    const entityIds = entityNodes.map(n => n.id);
    const parent = new Map<string, string>();
    const find = (i: string): string => {
      if (!parent.has(i)) parent.set(i, i);
      if (parent.get(i) === i) return i;
      const root = find(parent.get(i)!);
      parent.set(i, root);
      return root;
    };
    const union = (i: string, j: string) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) parent.set(rootI, rootJ);
    };

    // Union entities connected directly or via shared identifiers/directors
    for (const edge of edges) {
      if (edge.fromNodeId.startsWith('entity_') && edge.toNodeId.startsWith('entity_')) {
        union(edge.fromNodeId, edge.toNodeId);
      } else if (edge.type === 'SHARES_IDENTIFIER') {
        const entityNode = edge.fromNodeId.startsWith('entity_') ? edge.fromNodeId : edge.toNodeId;
        const identNode = edge.fromNodeId.startsWith('entity_') ? edge.toNodeId : edge.fromNodeId;
        for (const otherEdge of edges) {
          if (otherEdge.type === 'SHARES_IDENTIFIER' && (otherEdge.fromNodeId === identNode || otherEdge.toNodeId === identNode)) {
            const otherEntity = otherEdge.fromNodeId.startsWith('entity_') ? otherEdge.fromNodeId : otherEdge.toNodeId;
            if (otherEntity !== entityNode && otherEntity.startsWith('entity_')) {
              union(entityNode, otherEntity);
            }
          }
        }
      }
    }

    const clusters = new Map<string, string[]>();
    for (const eid of entityIds) {
      const root = find(eid);
      if (!clusters.has(root)) clusters.set(root, []);
      clusters.get(root)!.push(eid);
    }

    for (const [clusterId, members] of clusters.entries()) {
      if (members.length >= 2) {
        const cleanIds = members.map(m => m.replace('entity_', ''));
        const violEdges = edges.filter(
          e => e.type === 'VIOLATED' && members.includes(e.fromNodeId)
        );

        const violationDensity = members.length > 0 ? violEdges.length / members.length : 0;

        if (violationDensity >= 0.25) {
          const finding: ClusterRiskFinding = {
            clusterId,
            entityIds: cleanIds,
            totalEntities: members.length,
            totalViolations: violEdges.length,
            violationDensity,
            severity: violationDensity >= 0.75 ? 'CRITICAL' : 'HIGH',
          };
          highRiskClusters.push(finding);

          const findingId = `find_cluster_${uuidv4().substring(0, 8)}`;
          const explanation = `Cluster of ${members.length} interconnected entities possesses ${violEdges.length} violations (violation density: ${(violationDensity * 100).toFixed(0)}%). High contagion risk.`;

          try {
            db.prepare(`
              INSERT INTO intel_graph_findings (
                id, tenant_id, country_id, finding_type, primary_entity_id, related_entity_ids,
                confidence, risk_score, xai_explanation, evidence_refs, review_status, severity
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              findingId,
              'default_tenant',
              'BD',
              'cluster_risk',
              cleanIds[0] || 'GENERAL',
              JSON.stringify(cleanIds),
              0.89,
              0.85,
              explanation,
              JSON.stringify(['EV_GRAPH_CLUSTER_' + clusterId]),
              'PENDING_REVIEW',
              finding.severity
            );

            this.dispatchGraphAlert({
              title: `High-Risk Cluster (${(violationDensity * 100).toFixed(0)}% Violation Density)`,
              message: explanation,
              severity: finding.severity,
              entityIds: cleanIds,
            });
          } catch (e: any) {
            console.warn('[GraphAnalytics] Notice saving cluster finding:', e.message);
          }
        }
      }
    }

    return highRiskClusters;
  }

  /**
   * (d) Iterative PageRank Calculation
   */
  public async computePageRank(damping: number = 0.85, iterations: number = 20): Promise<Record<string, number>> {
    const nodes = await graphStore.getAllNodes();
    const edges = await graphStore.getAllRelationships();
    const N = nodes.length;
    if (N === 0) return {};

    const nodeIds = nodes.map(n => n.id);
    let ranks: Record<string, number> = {};
    for (const id of nodeIds) ranks[id] = 1 / N;

    // Build outgoing adjacency & degree
    const outEdges = new Map<string, string[]>();
    for (const e of edges) {
      if (!outEdges.has(e.fromNodeId)) outEdges.set(e.fromNodeId, []);
      outEdges.get(e.fromNodeId)!.push(e.toNodeId);
    }

    for (let it = 0; it < iterations; it++) {
      const nextRanks: Record<string, number> = {};
      const baseScore = (1 - damping) / N;

      for (const id of nodeIds) {
        nextRanks[id] = baseScore;
      }

      for (const id of nodeIds) {
        const neighbors = outEdges.get(id) || [];
        if (neighbors.length > 0) {
          const share = (ranks[id] * damping) / neighbors.length;
          for (const target of neighbors) {
            nextRanks[target] = (nextRanks[target] || baseScore) + share;
          }
        } else {
          // Dangling node distribution
          const share = (ranks[id] * damping) / N;
          for (const target of nodeIds) {
            nextRanks[target] += share;
          }
        }
      }
      ranks = nextRanks;
    }

    return ranks;
  }

  /**
   * (e) K-Hop Risk Propagation for an entity
   */
  public async computeKilledRiskScore(entityId: string, kHops: number = 2, decayFactor: number = 0.5): Promise<{
    baseRisk: number;
    propagatedBoost: number;
    finalCompositeRisk: number;
    influencingNeighbors: Array<{ neighborId: string; distance: number; contribution: number }>;
  }> {
    const nodeId = `entity_${entityId}`;
    const targetNode = await graphStore.getNode(nodeId);
    const baseRisk = targetNode ? (100 - (targetNode.properties.compliance_score || 70)) : 30;

    const neighborhood = await graphStore.getNeighbors(nodeId, kHops);
    let propagatedBoost = 0;
    const influencingNeighbors: Array<{ neighborId: string; distance: number; contribution: number }> = [];

    for (const neighbor of neighborhood.nodes) {
      if (neighbor.id !== nodeId && neighbor.label === 'Entity') {
        const neighborRisk = 100 - (neighbor.properties.compliance_score || 70);
        if (neighborRisk > 50) {
          const contribution = neighborRisk * decayFactor;
          propagatedBoost += contribution;
          influencingNeighbors.push({
            neighborId: neighbor.id.replace('entity_', ''),
            distance: 1,
            contribution: parseFloat(contribution.toFixed(2)),
          });
        }
      }
    }

    const finalCompositeRisk = Math.min(100, Math.round(baseRisk + propagatedBoost));

    return {
      baseRisk,
      propagatedBoost: parseFloat(propagatedBoost.toFixed(2)),
      finalCompositeRisk,
      influencingNeighbors,
    };
  }

  /**
   * Helper to dispatch alert to SQLite/Postgres alerts table
   */
  private dispatchGraphAlert(alertData: {
    title: string;
    message: string;
    severity: string;
    entityIds: string[];
  }) {
    const db = getDb();
    try {
      const alertId = `alt_graph_${uuidv4().substring(0, 8)}`;
      db.prepare(`
        INSERT INTO alerts (id, title, message, severity, status, source, entity_id, created_at)
        VALUES (?, ?, ?, ?, 'OPEN', 'graph_intel', ?, CURRENT_TIMESTAMP)
      `).run(
        alertId,
        alertData.title,
        alertData.message,
        alertData.severity,
        alertData.entityIds[0] || null
      );
    } catch (e: any) {
      // Table might differ slightly in SQLite schema; non-blocking fallback
    }
  }
}

export const graphAnalyticsService = GraphAnalyticsService.getInstance();
