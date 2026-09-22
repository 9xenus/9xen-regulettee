import { graphStore } from './graphStoreAdapter';
import { getDb } from '../db/sqlite';
import { v4 as uuidv4 } from 'uuid';

export interface ResolutionCandidate {
  entityId: string;
  name: string;
  tin?: string;
  phone?: string;
  domain?: string;
  address?: string;
}

export interface ResolutionResult {
  resolutionId: string;
  candidateA: string;
  candidateB: string;
  confidence: number;
  method: 'DETERMINISTIC_TIN' | 'FUZZY_NAME_PHONE' | 'EMBEDDING_MATCH' | 'LLM_ASSISTED';
  sharedIdentifiers: Array<{ type: string; value: string }>;
  decision: 'auto_merged' | 'pending' | 'rejected';
  rationale: string;
}

export class EntityResolutionService {
  private static instance: EntityResolutionService;
  private readonly AUTO_MERGE_THRESHOLD = 0.85;

  private constructor() {}

  public static getInstance(): EntityResolutionService {
    if (!EntityResolutionService.instance) {
      EntityResolutionService.instance = new EntityResolutionService();
    }
    return EntityResolutionService.instance;
  }

  /**
   * Run resolution comparison between two entities using deterministic + fuzzy heuristic rules
   */
  public async evaluatePair(
    a: ResolutionCandidate,
    b: ResolutionCandidate
  ): Promise<ResolutionResult> {
    const db = getDb();
    const resolutionId = `res_${uuidv4().substring(0, 8)}`;
    const sharedIdentifiers: Array<{ type: string; value: string }> = [];

    let score = 0.0;
    let method: 'DETERMINISTIC_TIN' | 'FUZZY_NAME_PHONE' | 'EMBEDDING_MATCH' | 'LLM_ASSISTED' = 'FUZZY_NAME_PHONE';
    let rationale = '';

    // 1. Exact TIN Match (Deterministic = 1.0)
    if (a.tin && b.tin && a.tin.trim().toLowerCase() === b.tin.trim().toLowerCase()) {
      score = 1.0;
      method = 'DETERMINISTIC_TIN';
      sharedIdentifiers.push({ type: 'TIN', value: a.tin });
      rationale = `Exact statutory TIN match (${a.tin})`;
    } 
    // 2. Exact Phone (Normalized to last 10 digits) + High Name Similarity
    else if (a.phone && b.phone && a.phone.replace(/[^0-9]/g, '').slice(-10) === b.phone.replace(/[^0-9]/g, '').slice(-10)) {
      const nameSim = this.calculateStringSimilarity(a.name, b.name);
      sharedIdentifiers.push({ type: 'PHONE', value: a.phone });
      
      if (nameSim >= 0.3) {
        score = 0.92;
        rationale = `Shared verified phone with name match (${a.name} vs ${b.name})`;
      } else {
        score = 0.78;
        rationale = `Shared phone number across differing business names (${a.name} vs ${b.name})`;
      }
    } 
    // 3. Domain or Root Brand Match
    else if (a.domain && b.domain && a.domain.toLowerCase() === b.domain.toLowerCase()) {
      score = 0.86;
      sharedIdentifiers.push({ type: 'DOMAIN', value: a.domain });
      rationale = `Identical operating domain infrastructure (${a.domain})`;
    } 
    // 4. Fuzzy Name + Address
    else {
      const nameSim = this.calculateStringSimilarity(a.name, b.name);
      if (nameSim > 0.80) {
        score = 0.75;
        method = 'FUZZY_NAME_PHONE';
        rationale = `High linguistic name similarity (${(nameSim * 100).toFixed(0)}%)`;
      } else {
        score = nameSim * 0.5;
        rationale = 'Low similarity across identifiers';
      }
    }

    const decision = score >= this.AUTO_MERGE_THRESHOLD ? 'auto_merged' : (score >= 0.60 ? 'pending' : 'rejected');

    // If auto_merged, create SAME_AS relationship in graph store
    if (decision === 'auto_merged') {
      const entityANodeId = `entity_${a.entityId}`;
      const entityBNodeId = `entity_${b.entityId}`;

      await graphStore.upsertRelationship({
        id: `rel_same_${entityANodeId}_${entityBNodeId}`,
        type: 'SAME_AS',
        fromNodeId: entityANodeId,
        toNodeId: entityBNodeId,
        properties: {
          source: 'resolution',
          confidence: score,
          method,
          synced_at: new Date().toISOString(),
        },
      });
    }

    // Persist to relational database table intel_entity_resolution
    try {
      db.prepare(`
        INSERT INTO intel_entity_resolution (
          id, tenant_id, country_id, candidate_a_id, candidate_b_id, candidate_a_name, candidate_b_name,
          blocking_key, deterministic_score, llm_similarity_score, composite_confidence, shared_identifiers, decision, decision_rationale
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        resolutionId,
        'default_tenant',
        'BD',
        a.entityId,
        b.entityId,
        a.name,
        b.name,
        sharedIdentifiers[0] ? `${sharedIdentifiers[0].type}:${sharedIdentifiers[0].value}` : 'NAME_FUZZY',
        score,
        0.8,
        score,
        JSON.stringify(sharedIdentifiers),
        decision === 'auto_merged' ? 'AUTO_MERGED' : (decision === 'pending' ? 'PENDING' : 'REJECTED'),
        rationale
      );
    } catch (e: any) {
      console.warn('[EntityResolutionService] Notice persisting resolution:', e.message);
    }

    return {
      resolutionId,
      candidateA: a.entityId,
      candidateB: b.entityId,
      confidence: score,
      method,
      sharedIdentifiers,
      decision,
      rationale,
    };
  }

  /**
   * Levenshtein-based similarity coefficient [0, 1]
   */
  private calculateStringSimilarity(s1: string, s2: string): number {
    const str1 = s1.trim().toLowerCase();
    const str2 = s2.trim().toLowerCase();
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;

    const costs = [];
    for (let i = 0; i <= str1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= str2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[str2.length] = lastValue;
    }

    return (longerLength - costs[str2.length]) / longerLength;
  }
}

export const entityResolutionService = EntityResolutionService.getInstance();
