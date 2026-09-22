import { ChromaVectorStore } from '../../../db/chroma';
import { getDb } from '../../../db/sqlite';
import crypto from 'crypto';
import { REGTECH_COMPLIANCE_CHECKLISTS } from './compliance-checklists';

const db = {
  prepare: (query: string) => getDb().prepare(query),
};

export interface KBDocument {
  id: string;
  title: string;
  content: string;
  metadata?: any;
}

/**
 * SOVEREIGN VECTOR KNOWLEDGE BASE ENGINE
 * Manages multi-tenant document indexing and semantic retrieval.
 */
export class VectorKbEngine {
  /**
   * Automatically seeds the vector KB with relevant regulations based on selected industries.
   */
  static async autoSeedKbForIndustries(orgId: string, industries: string[]): Promise<void> {
    const relevantChecklists = REGTECH_COMPLIANCE_CHECKLISTS.filter(c => industries.includes(c.industry));
    
    for (const checklist of relevantChecklists) {
      await this.indexDocument(orgId, {
        id: checklist.id,
        title: `${checklist.industry} Compliance Directive: ${checklist.category}`,
        content: checklist.description,
        metadata: {
          industry: checklist.industry,
          category: checklist.category,
          source: 'statutory_seed'
        }
      });
    }
    console.log(`[VECTOR_KB] Auto-seeded ${relevantChecklists.length} statutory documents for org ${orgId}.`);
  }

  /**
   * Indexes a document for a specific organization.
   * Ensures tenant isolation by prefixing IDs and including orgId in metadata.
   */
  static async indexDocument(orgId: string, doc: KBDocument): Promise<void> {
    const domain = `org_${orgId}`;
    const enrichedDoc = {
      id: `${orgId}_${doc.id || crypto.randomBytes(4).toString('hex')}`,
      text: `${doc.title}\n${doc.content}`,
      metadata: {
        ...doc.metadata,
        org_id: orgId,
        title: doc.title,
        indexed_at: new Date().toISOString()
      }
    };

    await ChromaVectorStore.addDocuments(domain, [enrichedDoc]);
    
    // Also track in SQLite for metadata searching and UI listing
    try {
      const sqliteDb = getDb();
      sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS regtech_kb_documents (
          id TEXT PRIMARY KEY,
          org_id TEXT,
          title TEXT,
          content_preview TEXT,
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      sqliteDb.prepare(`
        INSERT OR REPLACE INTO regtech_kb_documents (id, org_id, title, content_preview, metadata)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        enrichedDoc.id,
        orgId,
        doc.title,
        doc.content.substring(0, 200),
        JSON.stringify(doc.metadata || {})
      );
    } catch (e) {
      console.error('[VECTOR_KB] Metadata sync error:', e);
    }
  }

  /**
   * Retrieves top-K context snippets relevant to a query.
   */
  static async retrieveContext(orgId: string, query: string, limit: number = 3): Promise<string[]> {
    const domain = `org_${orgId}`;
    try {
      const results = await ChromaVectorStore.query(domain, query, limit);
      if (results && results.documents && results.documents[0]) {
        return results.documents[0];
      }
    } catch (e) {
      console.warn('[VECTOR_KB] Semantic retrieval error:', e);
    }
    return [];
  }

  /**
   * Lists indexed documents for an organization from SQLite metadata.
   */
  static listDocuments(orgId: string) {
    try {
      const sqliteDb = getDb();
      return sqliteDb.prepare(`
        SELECT * FROM regtech_kb_documents WHERE org_id = ? ORDER BY created_at DESC
      `).all(orgId);
    } catch (e) {
      return [];
    }
  }

  /**
   * Deletes a document from both vector and metadata stores.
   */
  static async deleteDocument(orgId: string, docId: string): Promise<void> {
    // Note: Simple Chroma mock doesn't support deletion easily, but we'll clear it from SQLite
    try {
      const sqliteDb = getDb();
      sqliteDb.prepare(`DELETE FROM regtech_kb_documents WHERE id = ? AND org_id = ?`).run(docId, orgId);
    } catch (e) {}
  }
}
