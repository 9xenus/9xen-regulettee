import { getDb } from '../db/sqlite';
import { logEvent } from '../db/event-db';
import { ChromaVectorStore } from '../db/chroma';
import { queryAnalytics as duckQuery } from '../db/duckdb';
import { v4 as uuidv4 } from 'uuid';

/**
 * LEXDB: UNIFIED DATABASE ORCHESTRATOR
 * This service routes application data to specialized engines based on functional requirements.
 */
export class LexDB {
  /**
   * Performs a core state update in SQLite.
   */
  public static async mutateRelational(query: string, params: any[] = []) {
    const db = getDb();
    const stmt = db.prepare(query);
    return stmt.run(...params);
  }

  /**
   * Queries the core relational state.
   */
  public static queryRelational(query: string, params: any[] = []) {
    const db = getDb();
    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Records an immutable event in the audit ledger.
   */
  public static async recordAuditEvent(event: {
    tenant_id: string;
    actor_id: string;
    module: string;
    action: string;
    status: 'SUCCESS' | 'FAILURE';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    target?: string;
    payload?: any;
  }) {
    return logEvent({
      id: `EVT-${uuidv4().substring(0, 8).toUpperCase()}`,
      tenantId: event.tenant_id,
      actorId: event.actor_id,
      serviceModule: event.module,
      actionType: event.action,
      status: event.status,
      severity: event.severity,
      targetResource: event.target,
      payloadDiff: event.payload,
      cryptoHash: 'N/A' // Managed by logEvent internal hashing
    });
  }

  /**
   * Indexes semantic data for RAG and similarity search.
   */
  public static async indexVector(domain: string, text: string, metadata: any = {}) {
    const id = `vec-${uuidv4().substring(0, 8)}`;
    return ChromaVectorStore.addDocuments(domain, [{ id, text, metadata }]);
  }

  /**
   * Performs semantic similarity search across the compliance knowledge base.
   */
  public static async queryVector(domain: string, queryText: string, nResults: number = 5) {
    return ChromaVectorStore.query(domain, queryText, nResults);
  }

  /**
   * Performs an analytical aggregation using DuckDB.
   */
  public static async queryAnalytics(query: string) {
    return duckQuery(query);
  }

  /**
   * COORDINATED MUTATION
   * Updates state, logs the audit trail, and indexes the event semantically.
   */
  public static async synchronizedWrite(params: {
    sql: string;
    sqlParams: any[];
    audit: Parameters<typeof LexDB.recordAuditEvent>[0];
    vector?: { domain: string; text: string; metadata?: any };
  }) {
    // 1. Relational Update
    const result = await this.mutateRelational(params.sql, params.sqlParams);
    
    // 2. Immutable Log
    await this.recordAuditEvent(params.audit);
    
    // 3. Vector Index (Optional)
    if (params.vector) {
      try {
        await this.indexVector(params.vector.domain, params.vector.text, params.vector.metadata);
      } catch (vecErr) {
        console.warn('[LEXDB] Vector index warning (non-blocking):', vecErr);
      }
    }
    
    return result;
  }
}
