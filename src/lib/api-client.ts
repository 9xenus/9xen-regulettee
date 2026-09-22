
import { apiMetricsStore } from '../store/api-metrics';

export function getClientMockFallback(url: string): any {
  if (url.includes('/api/v1/caas/addons')) {
    return {
      success: true,
      addons: [
        {
          id: 'gdpr-compliance',
          category: 'Data Protection & Privacy',
          name: 'GDPR Compliance Add-On',
          actId: 'GDPR',
          desc: 'Article 30 Record of Processing Activities, Article 32 Security Controls, Automated DSAR Processing, and Consent Management',
          price: '$799/mo',
          score: 96,
          colorClass: 'bg-emerald-50/70 border-emerald-200/50 text-emerald-700 hover:bg-emerald-100/50',
          icon: 'ShieldCheck',
          isActiveGlobally: true,
          subscriptionStatus: 'active',
          configSchema: []
        },
        {
          id: 'ai-act-auditor',
          category: 'Public Sector & Govtech',
          name: 'EU AI Act Risk Classification & Audit',
          actId: 'EU_AI_ACT',
          desc: 'High-risk system categorization, post-market monitoring enclaves, and transparency logging',
          price: '$1,299/mo',
          score: 94,
          colorClass: 'bg-indigo-50/70 border-indigo-200/50 text-indigo-700 hover:bg-indigo-100/50',
          icon: 'Brain',
          isActiveGlobally: true,
          subscriptionStatus: 'active',
          configSchema: []
        },
        {
          id: 'dora-resilience',
          category: 'Financial Services',
          name: 'DORA Digital Operational Resilience',
          actId: 'DORA',
          desc: 'ICT risk management frameworks, third-party provider concentration auditing, and incident reporting',
          price: '$999/mo',
          score: 98,
          colorClass: 'bg-sky-50/70 border-sky-200/50 text-sky-700 hover:bg-sky-100/50',
          icon: 'Server',
          isActiveGlobally: true,
          subscriptionStatus: 'active',
          configSchema: []
        }
      ]
    };
  }
  if (url.includes('/api/v1/admin/global-caas-oversight')) {
    return {
      success: true,
      stats: {
        total_tenants: '1,248',
        avg_readiness_score: 94.2,
        active_addons: 23,
        security_posture: 'OPTIMAL',
        total_scans: 18450
      },
      addonStats: [
        { status: 'ACTIVE', count: 18 },
        { status: 'TRIAL', count: 4 },
        { status: 'PENDING REVIEW', count: 1 },
        { status: 'DEPRECATED', count: 0 }
      ]
    };
  }
  if (url.includes('/api/v1/admin/global-b2g-oversight')) {
    return {
      success: true,
      inquiries: [
        { priority: 'urgent', count: 3 },
        { priority: 'standard', count: 5 }
      ],
      sandbox: [
        { count: 8 }
      ],
      filings: [
        { status: 'submitted', count: 14 },
        { status: 'approved', count: 42 }
      ]
    };
  }
  if (url.includes('/api/v1/admin/global-caas-operations')) {
    return {
      success: true,
      operations: [
        {
          id: 'op-101',
          tenant_id: 'org_1',
          tenant_name: 'Acme Europe SA',
          operation_type: 'KYC_RE_VERIFICATION',
          status: 'COMPLETED',
          result_summary: 'Passed with 0 anomalies across 12 AML watchlists',
          started_at: '2026-09-03 10:15:00',
          completed_at: '2026-09-03 10:15:04'
        },
        {
          id: 'op-102',
          tenant_id: 'org_1',
          tenant_name: 'Acme Europe SA',
          operation_type: 'AI_ACT_ANNEX_IV_SCAN',
          status: 'COMPLETED',
          result_summary: 'Technical documentation audit certified compliant',
          started_at: '2026-09-03 09:40:00',
          completed_at: '2026-09-03 09:40:12'
        },
        {
          id: 'op-103',
          tenant_id: 'org_2',
          tenant_name: 'Fintech Global Payments',
          operation_type: 'DORA_ICT_STRESS_TEST',
          status: 'IN_PROGRESS',
          result_summary: 'Simulating sovereign failover to Frankfurt data center',
          started_at: '2026-09-03 11:00:00',
          completed_at: null
        }
      ]
    };
  }
  if (url.includes('/api/v1/tenants/health')) {
    return {
      success: true,
      tenantId: 'org_1',
      tenantName: 'Acme Corporation Europe',
      status: 'ACTIVE',
      systemIntegrity: 'OPTIMAL',
      complianceReadinessScore: 98,
      breakdown: {
        gdprReadiness: 99,
        aiActReadiness: 96,
        nis2Readiness: 98,
        doraReadiness: 100,
        quantumProtection: 'ACTIVE (Kyber-1024)',
        encryptionStatus: 'AES-256-GCM (HSM Backed)',
        piiExposureLevel: 'Zero (0 Leaks)',
        activeAlerts: 0
      },
      activeModules: ['gdpr', 'ai_act', 'nis2', 'dora'],
      lastScanTimestamp: new Date().toISOString(),
      statusBadge: {
        text: '98% Ready',
        color: 'emerald'
      }
    };
  }
  if (url.includes('/api/v1/compliance/health')) {
    return {
      success: true,
      overallScore: 96,
      grade: 'A+',
      checksPassed: 42,
      checksTotal: 44,
      timestamp: new Date().toISOString()
    };
  }
  if (url.includes('/api/v1/compliance/regions-countries')) {
    return {
      success: true,
      regions: [
        {
          name: 'European Union (EU)',
          code: 'EU',
          countries: [
            { name: 'Germany', country_code: 'DE', is_active: true, local_law: 'BDSG / GDPR' },
            { name: 'France', country_code: 'FR', is_active: true, local_law: 'CNIL / GDPR' },
            { name: 'Netherlands', country_code: 'NL', is_active: true, local_law: 'AVG / GDPR' },
            { name: 'Ireland', country_code: 'IE', is_active: true, local_law: 'Data Protection Act / GDPR' },
            { name: 'Spain', country_code: 'ES', is_active: true, local_law: 'LOPDGDD / GDPR' },
            { name: 'Italy', country_code: 'IT', is_active: true, local_law: 'Codice Privacy / GDPR' }
          ]
        },
        {
          name: 'United States & Americas',
          code: 'US',
          countries: [
            { name: 'United States (Federal / CA)', country_code: 'US', is_active: true, local_law: 'CCPA / CPRA / HIPAA' },
            { name: 'Brazil', country_code: 'BR', is_active: true, local_law: 'LGPD' },
            { name: 'Canada', country_code: 'CA', is_active: true, local_law: 'PIPEDA' }
          ]
        },
        {
          name: 'Asia Pacific & Middle East',
          code: 'APAC',
          countries: [
            { name: 'Singapore', country_code: 'SG', is_active: true, local_law: 'PDPA Singapore' },
            { name: 'United Arab Emirates', country_code: 'AE', is_active: true, local_law: 'UAE Data Protection Law' },
            { name: 'Saudi Arabia', country_code: 'SA', is_active: true, local_law: 'PDPL Saudi Arabia' },
            { name: 'India', country_code: 'IN', is_active: true, local_law: 'DPDP Act 2023' },
            { name: 'Global Region', country_code: 'BD', is_active: true, local_law: 'Cyber Security Act / DNCRP' }
          ]
        },
        {
          name: 'United Kingdom & EFTA',
          code: 'UK',
          countries: [
            { name: 'United Kingdom', country_code: 'GB', is_active: true, local_law: 'UK GDPR / DPA 2018' },
            { name: 'Switzerland', country_code: 'CH', is_active: true, local_law: 'FADP / revDSG' }
          ]
        }
      ]
    };
  }
  if (url.includes('/api/v1/compliance/detected-laws')) {
    return {
      success: true,
      laws: [
        { code: 'EU_GDPR', name: 'General Data Protection Regulation (GDPR)', type: 'STATUTE', strictness: 'VERY_HIGH', description: 'Mandatory European Union data sovereignty & privacy law' },
        { code: 'EU_AI_ACT', name: 'EU Artificial Intelligence Act (2024)', type: 'AI_REGULATION', strictness: 'HIGH', description: 'High-risk automated profiling and safety certification' },
        { code: 'DORA_RESILIENCE', name: 'Digital Operational Resilience Act (DORA)', type: 'CYBERSECURITY', strictness: 'CRITICAL', description: 'Financial entity ICT third-party risk management' }
      ]
    };
  }
  if (url.includes('/api/v1/engine/regions')) {
    return [
      { code: 'EU', name: 'European Union', sovereign_node: 'node-fra-01', compliance_tier: 'TIER_1' },
      { code: 'US', name: 'United States', sovereign_node: 'node-iad-01', compliance_tier: 'TIER_1' },
      { code: 'SG', name: 'Singapore / APAC', sovereign_node: 'node-sin-01', compliance_tier: 'TIER_1' }
    ];
  }
  if (url.includes('/api/v1/engine/profiles')) {
    return [{ id: 'fintech-eu', name: 'EU Fintech Standard', risk_level: 'HIGH' }];
  }
  if (url.includes('/api/v1/engine/industries')) {
    return [{ code: 'FIN', name: 'Financial Services & Banking' }];
  }
  if (url.includes('/api/v1/regulatory/regional-shards')) {
    return {
      shards: [
        { id: 'shard-eu-central', region: 'EU', status: 'SYNCHRONIZED', latencyMs: 14 },
        { id: 'shard-us-east', region: 'US', status: 'SYNCHRONIZED', latencyMs: 28 }
      ]
    };
  }
  return { success: true, data: [], status: 'ok' };
}

const MAX_RETRIES = 5;
const INITIAL_BACKOFF = 1500; // ms

export async function fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
  let retries = 0;
  
  // Ensure x-tenant-context header is present for dev fallback
  const headers = new Headers(options.headers || {});
  if (!headers.has("x-tenant-context")) {
    headers.set("x-tenant-context", "dev-tenant");
  }
  // Attach the app's sovereign session token as a Bearer credential so the guarded
  // SaaS admin / enterprise endpoints authenticate (appliance tokens or signed JWTs).
  try {
    const storedSession = JSON.parse(localStorage.getItem("sovereign_sessions") || "null");
    const sessionToken = storedSession && storedSession.access_token;
    if (sessionToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${sessionToken}`);
    }
  } catch { /* non-fatal: proceed unauthenticated */ }
  options.headers = headers;
  
  while (retries <= MAX_RETRIES) {
    const start = performance.now();
    try {
      const response = await fetch(url, options);
      const latency = performance.now() - start;
      
      apiMetricsStore.addMetric({
        url,
        status: response.status,
        latency,
        timestamp: Date.now()
      });

      // Handle non-ok responses
      if (!response.ok) {
        // Retry on 429 (Rate Limit) or 5xx
        const shouldRetry = response.status === 429 || (response.status >= 500 && response.status <= 599);
        
        if (shouldRetry && retries < MAX_RETRIES) {
          const retryAfter = response.headers.get("Retry-After");
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : INITIAL_BACKOFF * Math.pow(2, retries);
          
          if (response.status === 429) {
            console.warn(`Rate limited (429). Retrying in ${delay}ms...`);
            window.dispatchEvent(new CustomEvent('9xen-regulettee-api-rate-limit', { 
              detail: { delay, retries, maxRetries: MAX_RETRIES, url } 
            }));
          }

          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
          continue;
        }

        // Final failure for retryable errors OR immediate failure for non-retryable (400, 401, 403, 404, etc.)
        if (response.status === 429) {
          window.dispatchEvent(new CustomEvent('9xen-regulettee-api-rate-limit-failed', { 
            detail: { status: response.status, url } 
          }));
        }

        // Parse error data - it might be a NormalizedError object from our proxy
        const errorData = await response.json().catch(() => ({}));
        const rawError = errorData.error || `Request failed with status ${response.status}`;
        
        // Extract message from NormalizedError if present
        const errorMessage = typeof rawError === 'object' ? (rawError.message || rawError.detail) : rawError;
        const error = new Error(errorMessage);
        
        // Attach metadata for the ErrorBoundary to parse
        (error as any).status = response.status;
        (error as any).normalized = typeof rawError === 'object' ? rawError : null;
        (error as any).url = url;
        
        throw error;
      }

      // Check if this is an API call that received HTML
      const contentType = response.headers.get('content-type');
      if (url.includes('/api/') && contentType && contentType.includes('text/html')) {
        throw new Error(`Sovereign API Service for ${url} is currently not yet available.`);
      }
      
      return response;
    } catch (error) {
      retries++;
      if (retries > MAX_RETRIES) {
        window.dispatchEvent(new CustomEvent('9xen-regulettee-api-error', { 
          detail: { error: error instanceof Error ? error.message : String(error), url } 
        }));
        throw error;
      }
      
      const backoff = INITIAL_BACKOFF * Math.pow(2, retries - 1);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
  
  throw new Error('Max retries exceeded');
}
