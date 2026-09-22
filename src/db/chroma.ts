import fs from 'fs';
import path from 'path';
import { dbReconnectionManager } from './databaseReconnectionManager';

let ChromaClientModule: any = null;
try {
  ChromaClientModule = require('chromadb').ChromaClient;
} catch (e) {
  // ChromaDB native package optional; local embedded fallback will be used
}

type Collection = any;
type ChromaClient = any;

interface FallbackDoc {
  id: string;
  text: string;
  metadata?: any;
}

/**
 * CHROMA VECTOR STORE (Self-Hosted Persistent Client with Graceful Local Fallback)
 * This service manages semantic embeddings for regulatory documents and incidents.
 */
export class ChromaVectorStore {
  private static client: ChromaClient | null = null;
  private static collections = new Map<string, Collection>();
  private static fallbackStore = new Map<string, FallbackDoc[]>();
  private static isServerAvailable: boolean | null = null;

  private static getFallbackStorageDir(): string {
    const dir = path.join(process.cwd(), '.chroma_db_fallback');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  private static async getClient(): Promise<ChromaClient | null> {
    if (this.isServerAvailable === false || !ChromaClientModule) {
      this.isServerAvailable = false;
      return null;
    }

    if (!this.client) {
      try {
        const fetchOptions: any = {};
        if (process.env.CHROMA_AUTH_TOKEN) {
          fetchOptions.headers = {
            'Authorization': `Bearer ${process.env.CHROMA_AUTH_TOKEN}`
          };
        }

        const clientInstance = new ChromaClientModule({
          path: process.env.CHROMA_SERVER_URL || process.env.CHROMA_URL || "http://localhost:8000",
          fetchOptions
        });
        
        // Quick health ping check with automated reconnection manager
        const version = await dbReconnectionManager.executeWithRetry<string | null>(
          'chroma_vector',
          async () => {
            const v = await clientInstance.version();
            if (!v) throw new Error('Chroma version check returned empty response');
            return v;
          },
          { maxRetries: 2, baseDelayMs: 300, fallbackValue: null }
        );

        if (version) {
          this.client = clientInstance;
          this.isServerAvailable = true;
          console.log(`[CHROMA] Connected to ChromaDB server v${version}`);
        } else {
          this.isServerAvailable = false;
          console.log('[CHROMA] ChromaDB server not responding; activating local embedded fallback store.');
          return null;
        }
      } catch (err: any) {
        this.isServerAvailable = false;
        console.log(`[CHROMA] ChromaDB connection unavailable (${err.message || 'offline'}); using local embedded fallback store.`);
        return null;
      }
    }
    return this.client;
  }

  /**
   * Retrieves or creates a collection for a specific regulatory domain.
   */
  public static async getCollection(domain: string = 'global_compliance'): Promise<Collection | null> {
    const client = await this.getClient();
    if (!client) return null;
    
    if (this.collections.has(domain)) {
      return this.collections.get(domain)!;
    }

    try {
      const collection = await client.getOrCreateCollection({
        name: domain,
        metadata: { "description": `Vector store for ${domain} compliance data` }
      });
      this.collections.set(domain, collection);
      return collection;
    } catch (error) {
      console.warn(`[CHROMA] ChromaDB collection initialization fallback for ${domain}:`, error);
      this.isServerAvailable = false;
      return null;
    }
  }

  /**
   * Adds regulatory evidence or document snippets to the vector store.
   */
  public static async addDocuments(domain: string, docs: { id: string, text: string, metadata?: any }[]): Promise<void> {
    try {
      const collection = await this.getCollection(domain);
      if (collection) {
        await collection.add({
          ids: docs.map(d => d.id),
          metadatas: docs.map(d => d.metadata || {}),
          documents: docs.map(d => d.text)
        });
        console.log(`[CHROMA] Indexed ${docs.length} documents in ${domain} via Chroma server`);
        return;
      }
    } catch (e) {
      console.warn(`[CHROMA] Server upsert failed, routing to local fallback:`, e);
      this.isServerAvailable = false;
    }

    // Local embedded fallback storage
    const current = this.fallbackStore.get(domain) || [];
    const docMap = new Map<string, FallbackDoc>(current.map(d => [d.id, d]));
    docs.forEach(d => docMap.set(d.id, d));
    const updated = Array.from(docMap.values());
    this.fallbackStore.set(domain, updated);

    try {
      const filePath = path.join(this.getFallbackStorageDir(), `${domain}.json`);
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
      console.log(`[CHROMA] [LOCAL_FALLBACK] Indexed ${docs.length} documents in ${domain}`);
    } catch (fsErr) {
      console.warn(`[CHROMA] Fallback disk sync warning:`, fsErr);
    }
  }

  /**
   * Performs semantic / similarity search across the compliance knowledge base.
   */
  public static async query(domain: string, queryText: string, nResults: number = 5): Promise<any> {
    try {
      const collection = await this.getCollection(domain);
      if (collection) {
        const results = await collection.query({
          queryTexts: [queryText],
          nResults
        });
        return results;
      }
    } catch (e) {
      console.warn(`[CHROMA] Server query failed, routing to local similarity fallback:`, e);
      this.isServerAvailable = false;
    }

    // Fallback keyword & token similarity search
    let docs = this.fallbackStore.get(domain);
    if (!docs) {
      try {
        const filePath = path.join(this.getFallbackStorageDir(), `${domain}.json`);
        if (fs.existsSync(filePath)) {
          docs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          this.fallbackStore.set(domain, docs || []);
        }
      } catch (err) {
        docs = [];
      }
    }

    const searchDocs = docs || [];
    const queryTokens = queryText.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    const scored = searchDocs.map(doc => {
      const docLower = (doc.text || '').toLowerCase();
      let score = 0;
      for (const token of queryTokens) {
        if (docLower.includes(token)) score += 1;
      }
      return { doc, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, nResults).map(s => s.doc);

    return {
      ids: [top.map(t => t.id)],
      documents: [top.map(t => t.text)],
      metadatas: [top.map(t => t.metadata || {})],
      distances: [top.map(() => 0.1)]
    };
  }
}

