import crypto from 'crypto';
import db from '../db/sqlite';

export interface CacheEntry {
  cacheKey: string;
  queryNormalized: string;
  queryType: 'QUERY' | 'LEGAL_DOCUMENT' | 'POLICY' | 'CONFORMITY_ASSESSMENT';
  category: 'GDPR' | 'EU_AI_ACT' | 'SOC2' | 'DORA' | 'AMLD6' | 'ESG' | 'HIPAA' | 'NIS2' | 'GENERAL';
  parametersHash: string;
  responseData: any;
  tokensSaved: number;
  hitCount: number;
  latencySavedMs: number;
  lastAccessedAt: string;
  createdAt: string;
  expiresAt?: string;
}

export interface CacheStats {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRatePercent: number;
  totalTokensSaved: number;
  totalLatencySavedMs: number;
  totalLatencySavedSeconds: number;
  estimatedCostSavedEur: number;
  cachedEntriesCount: number;
  topCachedQueries: {
    cacheKey: string;
    queryNormalized: string;
    category: string;
    queryType: string;
    hitCount: number;
    tokensSaved: number;
    latencySavedMs: number;
  }[];
}

export class ComplianceQueryCacheService {
  private static memoryCache: Map<string, CacheEntry> = new Map();
  private static cacheHitsCount = 0;
  private static cacheMissesCount = 0;
  private static totalTokensSavedCount = 0;
  private static totalLatencySavedCountMs = 0;
  private static isInitialized = false;

  /**
   * Initializes SQLite cache tables and rehydrates memory cache with top entries.
   */
  public static init() {
    if (this.isInitialized) return;
    try {
      // Rehydrate memory cache from SQLite
      const rows = db.prepare(`
        SELECT * FROM compliance_query_cache 
        ORDER BY hit_count DESC 
        LIMIT 200
      `).all() as any[];

      for (const row of rows) {
        let parsedData = row.response_data;
        try {
          parsedData = JSON.parse(row.response_data);
        } catch (e) {
          // Keep string as is if not JSON
        }

        const entry: CacheEntry = {
          cacheKey: row.cache_key,
          queryNormalized: row.query_normalized,
          queryType: row.query_type,
          category: row.category,
          parametersHash: row.parameters_hash,
          responseData: parsedData,
          tokensSaved: row.tokens_saved || 0,
          hitCount: row.hit_count || 1,
          latencySavedMs: row.latency_saved_ms || 1500,
          lastAccessedAt: row.last_accessed_at,
          createdAt: row.created_at,
          expiresAt: row.expires_at
        };

        this.memoryCache.set(row.cache_key, entry);
        this.totalTokensSavedCount += (entry.tokensSaved * entry.hitCount);
        this.totalLatencySavedCountMs += (entry.latencySavedMs * entry.hitCount);
        this.cacheHitsCount += Math.max(0, entry.hitCount - 1);
      }

      // Check if cache needs pre-warming
      if (this.memoryCache.size === 0) {
        this.prewarmStandardTemplates();
      }

      this.isInitialized = true;
      console.log(`[COMPLIANCE_CACHE] Initialized intelligent caching layer with ${this.memoryCache.size} active entries.`);
    } catch (err) {
      console.error('[COMPLIANCE_CACHE] Error initializing cache layer:', err);
    }
  }

  /**
   * Normalizes query string by cleaning whitespace, lowercasing, and stripping punctuation.
   */
  public static normalizeQuery(query: string): string {
    if (!query) return '';
    return query
      .toLowerCase()
      .replace(/[^\w\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Returns a canonical key if query matches standard known legal request patterns,
   * otherwise generates a deterministic SHA-256 hash.
   */
  public static deriveCacheKey(query: string, queryType: string, category: string): { cacheKey: string; normalized: string; hash: string } {
    const normalized = this.normalizeQuery(query);

    // Canonical pattern mapping for frequent compliance requests
    let canonicalTag = '';
    
    if (/dpa|data processing (addendum|agreement)|gdpr article 28/i.test(query)) {
      canonicalTag = 'CANONICAL:GDPR_ARTICLE_28_DPA';
    } else if (/(eu ai act|ai act|annex iv|high risk ai|conformity (declaration|assessment))/i.test(query)) {
      canonicalTag = 'CANONICAL:EU_AI_ACT_ANNEX_IV_CONFORMITY';
    } else if (/(soc 2|soc2|trust services|type ii|incident response plan)/i.test(query)) {
      canonicalTag = 'CANONICAL:SOC2_TYPE_II_INCIDENT_POLICY';
    } else if (/(dora|digital operational resilience|ict risk|resilience framework)/i.test(query)) {
      canonicalTag = 'CANONICAL:DORA_ICT_RISK_FRAMEWORK';
    } else if (/(amld6|pep screening|beneficial ownership|kyc verification)/i.test(query)) {
      canonicalTag = 'CANONICAL:AMLD6_BENEFICIAL_OWNERSHIP_TEMPLATE';
    } else if (/(iso 27001|isms|information security policy)/i.test(query)) {
      canonicalTag = 'CANONICAL:ISO27001_ISMS_POLICY';
    } else if (/(esg|supplier code of conduct|carbon reporting)/i.test(query)) {
      canonicalTag = 'CANONICAL:ESG_SUPPLIER_CODE_CONDUCT';
    } else if (/(hipaa|patient data|phi processing|business associate)/i.test(query)) {
      canonicalTag = 'CANONICAL:HIPAA_BUSINESS_ASSOCIATE_AGREEMENT';
    } else if (/(nis2|nis 2|essential entity|cybersecurity risk management)/i.test(query)) {
      canonicalTag = 'CANONICAL:NIS2_CYBER_RISK_PROTOCOL';
    }

    const rawSignature = `${category.toUpperCase()}:${queryType.toUpperCase()}:${canonicalTag || normalized}`;
    const hash = crypto.createHash('sha256').update(rawSignature).digest('hex').substring(0, 24);
    const cacheKey = canonicalTag ? `cache:${canonicalTag}` : `cache:${hash}`;

    return { cacheKey, normalized, hash };
  }

  /**
   * Retrieves an entry from cache.
   */
  public static get(query: string, queryType: 'QUERY' | 'LEGAL_DOCUMENT' | 'POLICY' | 'CONFORMITY_ASSESSMENT', category: 'GDPR' | 'EU_AI_ACT' | 'SOC2' | 'DORA' | 'AMLD6' | 'ESG' | 'HIPAA' | 'NIS2' | 'GENERAL' = 'GENERAL', bypassCache = false): { found: boolean; entry?: CacheEntry; latencySavedMs?: number } | null {
    this.init();

    if (bypassCache) {
      this.cacheMissesCount++;
      return { found: false };
    }

    const { cacheKey } = this.deriveCacheKey(query, queryType, category);

    // 1. Check Memory Cache
    let entry = this.memoryCache.get(cacheKey);

    // 2. Fallback to SQLite check if not in memory
    if (!entry) {
      try {
        const row = db.prepare(`SELECT * FROM compliance_query_cache WHERE cache_key = ?`).get(cacheKey) as any;
        if (row) {
          let parsedData = row.response_data;
          try {
            parsedData = JSON.parse(row.response_data);
          } catch (e) {
            // raw string
          }

          entry = {
            cacheKey: row.cache_key,
            queryNormalized: row.query_normalized,
            queryType: row.query_type,
            category: row.category,
            parametersHash: row.parameters_hash,
            responseData: parsedData,
            tokensSaved: row.tokens_saved || 0,
            hitCount: row.hit_count || 1,
            latencySavedMs: row.latency_saved_ms || 1500,
            lastAccessedAt: new Date().toISOString(),
            createdAt: row.created_at,
            expiresAt: row.expires_at
          };
          this.memoryCache.set(cacheKey, entry);
        }
      } catch (err) {
        console.error('[COMPLIANCE_CACHE] Error fetching from SQLite:', err);
      }
    }

    if (entry) {
      // Hit! Update metrics and access time
      entry.hitCount += 1;
      entry.lastAccessedAt = new Date().toISOString();
      
      this.cacheHitsCount++;
      this.totalTokensSavedCount += entry.tokensSaved;
      this.totalLatencySavedCountMs += entry.latencySavedMs;

      // Update in memory & async update in SQLite
      this.memoryCache.set(cacheKey, entry);
      try {
        db.prepare(`
          UPDATE compliance_query_cache 
          SET hit_count = hit_count + 1, last_accessed_at = CURRENT_TIMESTAMP 
          WHERE cache_key = ?
        `).run(cacheKey);
      } catch (e) {
        // silent fail
      }

      return {
        found: true,
        entry,
        latencySavedMs: entry.latencySavedMs
      };
    }

    this.cacheMissesCount++;
    return { found: false };
  }

  /**
   * Stores a generated compliance response / legal document in cache.
   */
  public static set(
    query: string,
    queryType: 'QUERY' | 'LEGAL_DOCUMENT' | 'POLICY' | 'CONFORMITY_ASSESSMENT',
    responseData: any,
    category: 'GDPR' | 'EU_AI_ACT' | 'SOC2' | 'DORA' | 'AMLD6' | 'ESG' | 'HIPAA' | 'NIS2' | 'GENERAL' = 'GENERAL',
    tokensSaved = 0,
    latencySavedMs = 1800,
    ttlSeconds = 604800 // 7 days default
  ): CacheEntry {
    this.init();

    const { cacheKey, normalized, hash } = this.deriveCacheKey(query, queryType, category);

    // Calculate approximate tokens if not provided
    if (!tokensSaved && responseData) {
      const textLen = typeof responseData === 'string' ? responseData.length : JSON.stringify(responseData).length;
      tokensSaved = Math.max(150, Math.round(textLen / 3.8));
    }

    const now = new Date().toISOString();
    const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000).toISOString() : undefined;

    const entry: CacheEntry = {
      cacheKey,
      queryNormalized: normalized,
      queryType,
      category,
      parametersHash: hash,
      responseData,
      tokensSaved,
      hitCount: 1,
      latencySavedMs,
      lastAccessedAt: now,
      createdAt: now,
      expiresAt
    };

    // Store in Memory Cache
    this.memoryCache.set(cacheKey, entry);

    // Persist to SQLite
    try {
      const serializedData = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
      db.prepare(`
        INSERT INTO compliance_query_cache (
          cache_key, query_normalized, query_type, category, parameters_hash, 
          response_data, tokens_saved, hit_count, latency_saved_ms, last_accessed_at, created_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
        ON CONFLICT(cache_key) DO UPDATE SET
          response_data = excluded.response_data,
          hit_count = hit_count + 1,
          tokens_saved = excluded.tokens_saved,
          latency_saved_ms = excluded.latency_saved_ms,
          last_accessed_at = CURRENT_TIMESTAMP
      `).run(
        cacheKey,
        normalized,
        queryType,
        category,
        hash,
        serializedData,
        tokensSaved,
        latencySavedMs,
        expiresAt || null
      );
    } catch (err) {
      console.error('[COMPLIANCE_CACHE] Error persisting cache entry to SQLite:', err);
    }

    return entry;
  }

  /**
   * Pre-warms the cache with standard high-frequency legal document templates and compliance queries.
   */
  public static prewarmStandardTemplates() {
    console.log('[COMPLIANCE_CACHE] Pre-warming cache with standard legal templates and compliance query responses...');

    const templates = [
      {
        query: "GDPR Article 28 Data Processing Addendum (DPA) Template",
        type: "LEGAL_DOCUMENT" as const,
        category: "GDPR" as const,
        tokensSaved: 1450,
        latencySavedMs: 2200,
        response: {
          title: "Sovereign GDPR Article 28 Data Processing Addendum (DPA)",
          framework: "GDPR (EU 2016/679)",
          effectiveDate: "2026-08-05",
          sections: [
            {
              heading: "1. Scope & Data Processing Directives",
              content: "The Data Processor shall process Personal Data strictly on documented instructions from the Data Controller in accordance with GDPR Article 28(3)(a). All data processed remains within designated sovereign EU cloud enclaves (eu-central-1)."
            },
            {
              heading: "2. Confidentiality & Security Measures",
              content: "The Processor guarantees NIST CSWP 29 & Post-Quantum Cryptographic encryption (FIPS 203/204 ML-KEM) for data at rest and in transit. Personnel authorized to process data are bound by statutory confidentiality duties."
            },
            {
              heading: "3. Sub-processor Verification & Audit Rights",
              content: "No sub-processors outside the EU/EEA boundary shall be engaged without prior explicit authorization. The Controller retains complete real-time audit rights via 9Xen Regulettee immutable ledger verification."
            },
            {
              heading: "4. Data Subject Rights & Incident Notification",
              content: "The Processor shall notify the Controller of any Personal Data Breach within 24 hours of detection and assist in fulfilling Articles 15-22 Data Subject requests."
            }
          ],
          metadata: {
            jurisdiction: "EU / EEA",
            isSovereignEnclaveEnforced: true,
            complianceScore: 100
          }
        }
      },
      {
        query: "EU AI Act High-Risk System Annex IV Conformity Declaration",
        type: "CONFORMITY_ASSESSMENT" as const,
        category: "EU_AI_ACT" as const,
        tokensSaved: 1820,
        latencySavedMs: 2500,
        response: {
          title: "EU AI Act Annex IV Technical Documentation & Conformity Declaration",
          framework: "EU AI Act (Regulation 2024/1689)",
          systemRiskClassification: "HIGH_RISK_ANNEX_III",
          declarationDate: "2026-08-05",
          sections: [
            {
              heading: "1. AI System Description & Intended Purpose",
              content: "Automated regulatory risk profiling and continuous policy enforcement engine designed for enterprise financial institutions."
            },
            {
              heading: "2. Algorithmic Transparency & Human Oversight",
              content: "Model weights and decision outputs incorporate real-time SHAP explainability. Human-in-the-loop (HITL) overrides are mandatorily enforced for any automated penalty or block decision exceeding €50,000 value."
            },
            {
              heading: "3. Data Governance & Bias Mitigation",
              content: "Training data validation sets are continuously audited against synthetic EU demographics to prevent algorithmic discrimination under Article 10 rules."
            },
            {
              heading: "4. Cyber Resilience & Continuous Risk Management",
              content: "Continuous post-market monitoring ledger logs all inference prompts and responses with SHA-256 cryptographic anchors."
            }
          ],
          certificationStatus: "PASSED_CONFORMITY_AUDIT"
        }
      },
      {
        query: "SOC 2 Type II Information Security & Incident Response Policy",
        type: "POLICY" as const,
        category: "SOC2" as const,
        tokensSaved: 1280,
        latencySavedMs: 1900,
        response: {
          title: "SOC 2 Type II Trust Services Criteria Security & Incident Response Procedure",
          framework: "AICPA TSC CC6.1, CC6.6 & CC7.2",
          effectiveDate: "2026-08-05",
          sections: [
            {
              heading: "1. Access Control & Key Management",
              content: "Role-Based Access Control (RBAC) with compulsory FIDO2 Hardware WebAuthn MFA. Production API keys are stored in encrypted vaults with automated 90-day rotation."
            },
            {
              heading: "2. Incident Identification & Containment Procedure",
              content: "Automated SIEM triggers containment workflows upon 3 consecutive authorization failures. Zero-Trust isolation shuts down affected network pods within 45 seconds."
            },
            {
              heading: "3. Audit Logging & Continuous Evidence",
              content: "System audit logs are written synchronously to an append-only SQLite/Kùzu cryptographic ledger, ensuring non-repudiation during annual SOC 2 Type II audits."
            }
          ]
        }
      },
      {
        query: "DORA Digital Operational Resilience ICT Risk Management Summary",
        type: "POLICY" as const,
        category: "DORA" as const,
        tokensSaved: 1350,
        latencySavedMs: 2100,
        response: {
          title: "DORA (EU 2022/2554) ICT Risk Framework & Vendor Management Standard",
          framework: "EU Digital Operational Resilience Act",
          sections: [
            {
              heading: "1. ICT Risk Management Strategy",
              content: "Maintains a real-time register of critical ICT third-party service providers with continuous threat intelligence polling and quarterly failover simulations."
            },
            {
              heading: "2. Major ICT Incident Reporting Timeline",
              content: "Initial notification to national competent authorities (NCAs) within 4 hours of classification, intermediate report within 72 hours, and final post-incident root cause analysis within 1 month."
            }
          ]
        }
      },
      {
        query: "AMLD6 Beneficial Ownership & PEP KYC Verification Checklist",
        type: "QUERY" as const,
        category: "AMLD6" as const,
        tokensSaved: 1100,
        latencySavedMs: 1600,
        response: {
          title: "AMLD6 6th Anti-Money Laundering Directive KYB/PEP Verification Standard",
          framework: "EU AMLD6 (Directive 2018/1673)",
          checklist: [
            "Verify ultimate beneficial owners (UBO) holding > 15% equity or voting rights via national business registers.",
            "Screen all executive officers against real-time EU, OFAC, UN, and Interpol PEP sanction lists.",
            "Enforce AI-driven transaction monitoring on fiat transfers exceeding €10,000 threshold.",
            "Store all KYC audit records in immutable sovereign encrypted storage for a minimum of 5 years."
          ]
        }
      },
      {
        query: "ESG Supplier Code of Conduct & Carbon Intensity Declaration",
        type: "POLICY" as const,
        category: "ESG" as const,
        tokensSaved: 1200,
        latencySavedMs: 1750,
        response: {
          title: "Sovereign ESG Supplier Code of Conduct & Scope 1-3 Decarbonization Policy",
          framework: "EU Corporate Sustainability Due Diligence Directive (CSDDD)",
          sections: [
            {
              heading: "1. Environmental Standards & Scope 1-3 Accounting",
              content: "Suppliers must calculate and disclose annual greenhouse gas (GHG) emissions using GHG Protocol guidelines, targeting a 45% carbon reduction by 2030."
            },
            {
              heading: "2. Fair Labor & Human Rights Safeguards",
              content: "Strict prohibition of child labor, forced labor, or unsafe working environments with mandatory annual unannounced third-party audits."
            }
          ]
        }
      }
    ];

    for (const item of templates) {
      this.set(item.query, item.type, item.response, item.category, item.tokensSaved, item.latencySavedMs, 2592000);
    }
  }

  /**
   * Returns live cache statistics and metrics.
   */
  public static getStats(): CacheStats {
    this.init();

    const totalQueries = this.cacheHitsCount + this.cacheMissesCount;
    const hitRatePercent = totalQueries > 0 ? Math.round((this.cacheHitsCount / totalQueries) * 1000) / 10 : 100;
    
    // Estimated cost savings (€0.000002 per token based on average GenAI rates)
    const estimatedCostSavedEur = Math.round((this.totalTokensSavedCount * 0.000002) * 100) / 100;

    const topCachedQueries = Array.from(this.memoryCache.values())
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, 10)
      .map(entry => ({
        cacheKey: entry.cacheKey,
        queryNormalized: entry.queryNormalized,
        category: entry.category,
        queryType: entry.queryType,
        hitCount: entry.hitCount,
        tokensSaved: entry.tokensSaved,
        latencySavedMs: entry.latencySavedMs
      }));

    return {
      totalQueries,
      cacheHits: this.cacheHitsCount,
      cacheMisses: this.cacheMissesCount,
      hitRatePercent,
      totalTokensSaved: this.totalTokensSavedCount,
      totalLatencySavedMs: this.totalLatencySavedCountMs,
      totalLatencySavedSeconds: Math.round((this.totalLatencySavedCountMs / 1000) * 10) / 10,
      estimatedCostSavedEur,
      cachedEntriesCount: this.memoryCache.size,
      topCachedQueries
    };
  }

  /**
   * Purges cache entries or specific keys.
   */
  public static purge(category?: string, cacheKey?: string) {
    this.init();

    if (cacheKey) {
      this.memoryCache.delete(cacheKey);
      try {
        db.prepare(`DELETE FROM compliance_query_cache WHERE cache_key = ?`).run(cacheKey);
      } catch (e) {}
      return { success: true, message: `Purged cache key: ${cacheKey}` };
    }

    if (category) {
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.category === category) {
          this.memoryCache.delete(key);
        }
      }
      try {
        db.prepare(`DELETE FROM compliance_query_cache WHERE category = ?`).run(category);
      } catch (e) {}
      return { success: true, message: `Purged cache category: ${category}` };
    }

    // Purge all
    this.memoryCache.clear();
    try {
      db.prepare(`DELETE FROM compliance_query_cache`).run();
    } catch (e) {}

    // Re-warm with standard templates
    this.prewarmStandardTemplates();

    return { success: true, message: 'Entire compliance query cache purged and re-warmed.' };
  }
}
