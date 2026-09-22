import { ChromaClient } from "chromadb";

/**
 * ChromaDB Service
 * Handles vector embeddings and similarity search for regulatory documents.
 */
class VectorDBService {
  private client: ChromaClient | null = null;
  private collectionName = "regulatory_docs";

  constructor() {
    // Secure configuration with fallback
    const fetchOptions: any = {};
    if (process.env.CHROMA_AUTH_TOKEN) {
      fetchOptions.headers = {
        'Authorization': `Bearer ${process.env.CHROMA_AUTH_TOKEN}`
      };
    }

    this.client = new ChromaClient({
      path: process.env.CHROMA_URL || "http://localhost:8000",
      fetchOptions
    });
  }

  /**
   * Health check for ChromaDB connection
   */
  async checkHealth(): Promise<{ status: string; version?: string; error?: string }> {
    try {
      if (!this.client) throw new Error("ChromaClient not initialized");
      const version = await this.client.version();
      return { status: "CONNECTED", version };
    } catch (error: any) {
      return { status: "DISCONNECTED", error: error.message };
    }
  }

  /**
   * Functionalize: Add documents to a collection
   */
  async upsertDocuments(docs: { id: string; text: string; metadata: any }[]) {
    // Audit Logging
    console.log(`[AUDIT] ChromaDB Upsert: ${docs.length} documents`);
    try {
      const collection = await this.client!.getOrCreateCollection({
        name: this.collectionName
      });

      // In a real app, we'd generate embeddings here using Gemini or similar
      // For this functionalization demo, we'll use a mock embedding placeholder
      // or rely on Chroma's default if configured.
      
      await collection.add({
        ids: docs.map(d => d.id),
        metadatas: docs.map(d => d.metadata),
        documents: docs.map(d => d.text),
      });

      return { success: true, count: docs.length };
    } catch (error: any) {
      console.error("ChromaDB Error:", error);
      throw new Error(`Failed to upsert documents: ${error.message}`, { cause: error });
    }
  }

  /**
   * Functionalize: Search for similar documents
   */
  async search(queryText: string, nResults: number = 5) {
    // Audit Logging
    console.log(`[AUDIT] ChromaDB Search: ${queryText}`);
    try {
      const collection = await this.client!.getCollection({
        name: this.collectionName
      });

      const results = await collection.query({
        queryTexts: [queryText],
        nResults
      });

      return results;
    } catch (error: any) {
      console.error("ChromaDB Search Error:", error);
      throw new Error(`Search failed: ${error.message}`, { cause: error });
    }
  }

  /**
   * Functionalize: Count documents inside the collection
   */
  async countDocuments(): Promise<number> {
    try {
      const collection = await this.client!.getCollection({
        name: this.collectionName
      });
      const count = await collection.count();
      return count;
    } catch (error: any) {
      // Return 0 or fallback if collection doesn't exist yet
      return 0;
    }
  }
}

export const vectorDb = new VectorDBService();
