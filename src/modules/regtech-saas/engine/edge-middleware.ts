import crypto from 'crypto';
import { getDb } from '../../../db/sqlite';
const db = {
  prepare: (query: string) => getDb().prepare(query),
  transaction: (fn: any) => getDb().transaction(fn),
  exec: (sql: string) => getDb().exec(sql)
};

export interface PreProcessResult {
  action: 'CACHE_HIT' | 'SEMANTIC_HIT' | 'RULE_ANSWERED' | 'REJECTED' | 'FORWARD_TO_LLM';
  cachedOutput?: string;
  rejectionReason?: string;
  staticRuleId?: string;
  cacheKey?: string;
  hitCount?: number;
  tokensSavedEstimate: number;
  latencySavedMs: number;
  sanitizedPrompt?: string;
}

export interface StaticRule {
  id: string;
  org_id: string;
  trigger_type: 'exact_phrase' | 'regex' | 'intent_match' | 'keyword';
  trigger_value: string;
  static_answer: string;
  active: number;
}

export interface PreValidationRule {
  id: string;
  org_id: string;
  rule_type: 'schema' | 'blocklist_regex' | 'pii_scrub' | 'max_length';
  config: string;
  rejection_message: string;
  active: number;
}

/**
 * Tokenizes text into word n-grams for semantic similarity computation
 */
function extractTokenSet(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
  return new Set(words);
}

/**
 * Jaccard / Cosine approximation for fast, serverless semantic similarity
 */
function computeSemanticSimilarity(textA: string, textB: string): number {
  const setA = extractTokenSet(textA);
  const setB = extractTokenSet(textB);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * MODULE 2: Edge Middleware / Rule Engine (Pre-LLM)
 * Filters, caches, short-circuits, and pre-validates incoming requests to save >60-90% of LLM costs.
 */
export async function preProcessRequest(
  orgId: string,
  prompt: string,
  options: {
    bypassCache?: boolean;
    ttlMinutes?: number;
  } = {}
): Promise<PreProcessResult> {
  const normalizedPrompt = prompt.trim();
  let sanitizedPrompt = normalizedPrompt;
  const promptHash = crypto.createHash('sha256').update(normalizedPrompt).digest('hex');

  // 1. Run Pre-Validation Rules FIRST (Blocklist, Spam, Size, PII Scrub)
  try {
    const preRules = db.prepare(`
      SELECT * FROM regtech_prevalidation_rules 
      WHERE org_id = ? AND active = 1
    `).all(orgId) as PreValidationRule[];

    for (const rule of preRules) {
      let config: any = {};
      try {
        config = JSON.parse(rule.config);
      } catch {
        config = {};
      }

      // Max input length check
      if (rule.rule_type === 'max_length' && config.maxLength) {
        if (normalizedPrompt.length > config.maxLength) {
          return {
            action: 'REJECTED',
            rejectionReason: rule.rejection_message || `Prompt exceeds max allowed limit of ${config.maxLength} characters.`,
            tokensSavedEstimate: 0,
            latencySavedMs: 0
          };
        }
      }

      // Blocklist Regex check
      if (rule.rule_type === 'blocklist_regex' && config.pattern) {
        const regex = new RegExp(config.pattern, 'i');
        if (regex.test(normalizedPrompt)) {
          return {
            action: 'REJECTED',
            rejectionReason: rule.rejection_message || 'Blocked by organizational security pre-validation policy.',
            tokensSavedEstimate: 0,
            latencySavedMs: 0
          };
        }
      }

      // PII Scrubbing prior to transmission
      if (rule.rule_type === 'pii_scrub') {
        sanitizedPrompt = sanitizedPrompt
          .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
          .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
          .replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '[REDACTED_CARD]');
      }
    }
  } catch (err) {
    console.warn('[EDGE_ENGINE] Prevalidation check notice:', err);
  }

  // 2. Static Answer Router (FAQ / Instant Deterministic Rules)
  try {
    const staticRules = db.prepare(`
      SELECT * FROM regtech_static_rules 
      WHERE org_id = ? AND active = 1
    `).all(orgId) as StaticRule[];

    for (const sRule of staticRules) {
      let isMatch = false;
      if (sRule.trigger_type === 'exact_phrase') {
        isMatch = normalizedPrompt.toLowerCase() === sRule.trigger_value.toLowerCase();
      } else if (sRule.trigger_type === 'regex') {
        try {
          isMatch = new RegExp(sRule.trigger_value, 'i').test(normalizedPrompt);
        } catch {
          isMatch = false;
        }
      } else if (sRule.trigger_type === 'keyword') {
        const keywords = sRule.trigger_value.toLowerCase().split(',').map(k => k.trim());
        isMatch = keywords.some(k => normalizedPrompt.toLowerCase().includes(k));
      }

      if (isMatch) {
        return {
          action: 'RULE_ANSWERED',
          cachedOutput: sRule.static_answer,
          staticRuleId: sRule.id,
          tokensSavedEstimate: Math.max(150, Math.floor(normalizedPrompt.length / 4) + 120),
          latencySavedMs: 950,
          sanitizedPrompt
        };
      }
    }
  } catch (err) {
    console.warn('[EDGE_ENGINE] Static rule evaluation notice:', err);
  }

  // 3. Exact-Match Cache Lookup (Redis/DB)
  if (!options.bypassCache) {
    try {
      const exactCache = db.prepare(`
        SELECT * FROM regtech_cache_entries 
        WHERE org_id = ? AND prompt_hash = ? AND ttl_expires_at > CURRENT_TIMESTAMP
      `).get(orgId, promptHash) as any;

      if (exactCache) {
        db.prepare(`
          UPDATE regtech_cache_entries 
          SET hit_count = hit_count + 1 
          WHERE id = ?
        `).run(exactCache.id);

        return {
          action: 'CACHE_HIT',
          cachedOutput: exactCache.response_text,
          cacheKey: promptHash,
          hitCount: exactCache.hit_count + 1,
          tokensSavedEstimate: Math.max(250, Math.floor(exactCache.response_text.length / 4)),
          latencySavedMs: 1100,
          sanitizedPrompt
        };
      }
    } catch (err) {
      console.warn('[EDGE_ENGINE] Exact cache lookup notice:', err);
    }

    // 4. Semantic Similarity Cache Lookup (Nearest neighbor match > 0.90)
    try {
      const recentCaches = db.prepare(`
        SELECT id, prompt_text, response_text, hit_count 
        FROM regtech_cache_entries 
        WHERE org_id = ? AND ttl_expires_at > CURRENT_TIMESTAMP
        ORDER BY created_at DESC LIMIT 50
      `).all(orgId) as any[];

      for (const cacheItem of recentCaches) {
        const similarity = computeSemanticSimilarity(normalizedPrompt, cacheItem.prompt_text);
        if (similarity >= 0.88) {
          db.prepare(`
            UPDATE regtech_cache_entries 
            SET hit_count = hit_count + 1 
            WHERE id = ?
          `).run(cacheItem.id);

          return {
            action: 'SEMANTIC_HIT',
            cachedOutput: cacheItem.response_text,
            cacheKey: cacheItem.id,
            hitCount: cacheItem.hit_count + 1,
            tokensSavedEstimate: Math.max(200, Math.floor(cacheItem.response_text.length / 4)),
            latencySavedMs: 980,
            sanitizedPrompt
          };
        }
      }
    } catch (err) {
      console.warn('[EDGE_ENGINE] Semantic cache lookup notice:', err);
    }
  }

  // 5. If all cache/rules miss, forward request to LLM
  return {
    action: 'FORWARD_TO_LLM',
    tokensSavedEstimate: 0,
    latencySavedMs: 0,
    sanitizedPrompt
  };
}

/**
 * Stores verified compliant LLM response in cache
 */
export function storeInCache(
  orgId: string,
  prompt: string,
  responseText: string,
  ttlMinutes: number = 720 // 12 hours default
) {
  try {
    const promptHash = crypto.createHash('sha256').update(prompt.trim()).digest('hex');
    const cacheId = `cache_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

    db.prepare(`
      INSERT OR REPLACE INTO regtech_cache_entries 
      (id, org_id, prompt_hash, prompt_text, response_text, hit_count, ttl_expires_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(cacheId, orgId, promptHash, prompt, responseText, expiresAt);
  } catch (err) {
    console.error('[EDGE_ENGINE] Error saving response to cache:', err);
  }
}
