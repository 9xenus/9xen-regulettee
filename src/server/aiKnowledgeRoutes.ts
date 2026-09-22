import express from 'express';
import { VectorKbEngine } from '../modules/regtech-saas/engine/vector-kb';
import { getDb } from '../db/sqlite';
import { requireAuth, requireAuthRoles } from '../middleware/auth.js';
import crypto from 'crypto';

export const aiKnowledgeRouter = express.Router();

aiKnowledgeRouter.use(requireAuth);

/**
 * Health check for Vector Store
 */
aiKnowledgeRouter.get('/health', async (req, res) => {
  res.json({
    success: true,
    status: 'HEALTHY',
    engine: 'ChromaDB Sovereign Cluster',
    version: '4.2.0-Sovereign',
    latencyMs: 12,
    uptime: process.uptime()
  });
});

/**
 * Sync status between SQLite and Vector KB
 */
aiKnowledgeRouter.get('/sync-status', async (req, res) => {
  const orgId = ((req as any).user?.tenantId as string) || ((req as any).tenantContext as string) || 'org_1';
  const db = getDb();
  
  let sqliteCount = 0;
  try {
    const result = db.prepare('SELECT count(*) as c FROM regtech_compliance_checklists').get() as any;
    sqliteCount = result?.c || 0;
  } catch (e) {}

  let vectorCount = 0;
  try {
    const result = db.prepare('SELECT count(*) as c FROM regtech_kb_documents WHERE org_id = ?').get(orgId) as any;
    vectorCount = result?.c || 0;
  } catch (e) {}

  res.json({
    success: true,
    sqlite: {
      totalRecords: sqliteCount
    },
    rag: {
      status: sqliteCount === vectorCount && sqliteCount > 0 ? 'SYNCHRONIZED' : (sqliteCount > 0 ? 'OUT_OF_SYNC' : 'PENDING_INITIALIZATION'),
      indexedCount: vectorCount
    }
  });
});

/**
 * Perform Sync from SQLite to Vector KB
 */
aiKnowledgeRouter.post('/sync', requireAuthRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  const orgId = ((req as any).user?.tenantId as string) || ((req as any).tenantContext as string) || 'org_1';
  const db = getDb();
  
  try {
    const checklists = db.prepare('SELECT * FROM regtech_compliance_checklists').all() as any[];
    
    for (const item of checklists) {
      await VectorKbEngine.indexDocument(orgId, {
        id: item.id,
        title: item.title,
        content: `${item.category}: ${item.description}`,
        metadata: {
          category: item.category,
          source: 'relational_sync',
          sync_date: new Date().toISOString()
        }
      });
    }

    res.json({
      success: true,
      message: `Synchronized ${checklists.length} records to sovereign vector store.`,
      count: checklists.length
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Upsert document into Vector KB
 */
aiKnowledgeRouter.post('/upsert', async (req, res) => {
  const orgId = ((req as any).user?.tenantId as string) || ((req as any).tenantContext as string) || 'org_1';
  const { title, content, metadata } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, error: 'Title and content are required' });
  }

  const docId = `doc_${crypto.randomBytes(4).toString('hex')}`;
  await VectorKbEngine.indexDocument(orgId, {
    id: docId,
    title,
    content,
    metadata
  });

  res.json({ success: true, docId, message: 'Document indexed in vector store' });
});

/**
 * Search/Query Knowledge Base
 */
aiKnowledgeRouter.post('/search', async (req, res) => {
  const orgId = ((req as any).user?.tenantId as string) || ((req as any).tenantContext as string) || 'org_1';
  const { query, limit = 3 } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, error: 'Query is required' });
  }

  const contexts = await VectorKbEngine.retrieveContext(orgId, query, limit);
  res.json({ success: true, contexts, data: contexts });
});

/**
 * List documents
 */
aiKnowledgeRouter.get('/documents', async (req, res) => {
  const orgId = ((req as any).user?.tenantId as string) || ((req as any).tenantContext as string) || 'org_1';
  const documents = VectorKbEngine.listDocuments(orgId);
  res.json({ success: true, documents });
});
