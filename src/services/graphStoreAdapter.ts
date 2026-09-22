/**
 * Graph Store Adapter (Neo4j with embedded in-memory graph fallback)
 * Provides standardized interface for node/edge operations and Cypher execution.
 */

export interface GraphNode {
  id: string;
  label: 'Entity' | 'Person' | 'Identifier' | 'Address' | 'Violation' | 'Website';
  properties: Record<string, any>;
}

export interface GraphRelationship {
  id: string;
  type: 'OWNED_BY' | 'DIRECTOR_OF' | 'SHARES_IDENTIFIER' | 'LOCATED_AT' | 'OPERATES' | 'VIOLATED' | 'SAME_AS';
  fromNodeId: string;
  toNodeId: string;
  properties: {
    source: 'registry' | 'osint' | 'scanner' | 'manual' | 'resolution';
    confidence: number;
    evidence_ref?: string;
    synced_at: string;
    [key: string]: any;
  };
}

export class GraphStoreAdapter {
  private static instance: GraphStoreAdapter;
  private nodes: Map<string, GraphNode> = new Map();
  private relationships: Map<string, GraphRelationship> = new Map();
  private isNeo4jConnected: boolean = false;

  private constructor() {
    // Initialized in-memory graph storage
  }

  public static getInstance(): GraphStoreAdapter {
    if (!GraphStoreAdapter.instance) {
      GraphStoreAdapter.instance = new GraphStoreAdapter();
    }
    return GraphStoreAdapter.instance;
  }

  public async upsertNode(node: GraphNode): Promise<void> {
    this.nodes.set(node.id, node);
  }

  public async getNode(id: string): Promise<GraphNode | undefined> {
    return this.nodes.get(id);
  }

  public async deleteNode(id: string): Promise<void> {
    this.nodes.delete(id);
    // Cascade delete related relationships
    for (const [relId, rel] of this.relationships.entries()) {
      if (rel.fromNodeId === id || rel.toNodeId === id) {
        this.relationships.delete(relId);
      }
    }
  }

  public async upsertRelationship(rel: GraphRelationship): Promise<void> {
    this.relationships.set(rel.id, rel);
  }

  public async getNeighbors(nodeId: string, depth: number = 1): Promise<{ nodes: GraphNode[]; edges: GraphRelationship[] }> {
    const visitedNodes = new Set<string>([nodeId]);
    const collectedEdges = new Set<GraphRelationship>();

    let currentLevel = new Set<string>([nodeId]);

    for (let d = 0; d < depth; d++) {
      const nextLevel = new Set<string>();
      for (const currentId of currentLevel) {
        for (const rel of this.relationships.values()) {
          if (rel.fromNodeId === currentId) {
            collectedEdges.add(rel);
            if (!visitedNodes.has(rel.toNodeId)) {
              visitedNodes.add(rel.toNodeId);
              nextLevel.add(rel.toNodeId);
            }
          } else if (rel.toNodeId === currentId) {
            collectedEdges.add(rel);
            if (!visitedNodes.has(rel.fromNodeId)) {
              visitedNodes.add(rel.fromNodeId);
              nextLevel.add(rel.fromNodeId);
            }
          }
        }
      }
      currentLevel = nextLevel;
    }

    const resultNodes: GraphNode[] = [];
    for (const id of visitedNodes) {
      const node = this.nodes.get(id);
      if (node) resultNodes.push(node);
    }

    return {
      nodes: resultNodes,
      edges: Array.from(collectedEdges),
    };
  }

  public async getAllNodes(): Promise<GraphNode[]> {
    return Array.from(this.nodes.values());
  }

  public async getAllRelationships(): Promise<GraphRelationship[]> {
    return Array.from(this.relationships.values());
  }

  public async getRelationship(id: string): Promise<GraphRelationship | undefined> {
    return this.relationships.get(id);
  }

  public async clearGraph(): Promise<void> {
    this.nodes.clear();
    this.relationships.clear();
  }
}

export const graphStore = GraphStoreAdapter.getInstance();
