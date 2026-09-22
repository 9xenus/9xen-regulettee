/**
 * Centralized API Client for FastAPI & Sovereign Backend Services
 * Handles Base Headers, JWT Token Injection, Retry Logic, and Compliance Error Normalization.
 */

import { apiMetricsStore } from '../store/api-metrics';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  retries?: number;
  complianceModule?: 'GDPR' | 'EU_AI_ACT' | 'DORA' | 'NIS2' | 'MICA' | 'HIPAA' | 'AML_KYC' | 'GENERAL';
}

export interface FastAPIErrorDetail {
  loc?: (string | number)[];
  msg: string;
  type?: string;
  ctx?: Record<string, any>;
}

export class ApiError extends Error {
  public status: number;
  public detail: string | FastAPIErrorDetail[] | any;
  public module?: string;
  public url: string;
  public timestamp: string;

  constructor(status: number, message: string, detail?: any, url: string = '', module?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.url = url;
    this.module = module || 'GENERAL';
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace for V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Returns a user-friendly error message formatted for compliance toasts or logs
   */
  public getFormattedMessage(): string {
    if (Array.isArray(this.detail)) {
      // Handle FastAPI Pydantic validation error arrays
      const fieldErrors = this.detail
        .map((err: FastAPIErrorDetail) => `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`)
        .join('; ');
      return `[${this.module}] Validation Error (${this.status}): ${fieldErrors}`;
    }
    if (typeof this.detail === 'string') {
      return `[${this.module}] (${this.status}): ${this.detail}`;
    }
    return `[${this.module}] (${this.status}): ${this.message}`;
  }
}

// Token keys in localStorage
const TOKEN_KEYS = ['access_token', 'jwt_token', 'auth_token', 'supabase.auth.token'];
const TENANT_KEY = 'x-tenant-context';

/**
 * Retrieves the current JWT access token from localStorage or memory
 */
export function getAuthToken(): string | null {
  for (const key of TOKEN_KEYS) {
    try {
      const val = localStorage.getItem(key);
      if (val) {
        // If stored as JSON string (e.g. Supabase session object)
        if (val.startsWith('{')) {
          const parsed = JSON.parse(val);
          return parsed.access_token || parsed.token || parsed.currentSession?.access_token || null;
        }
        return val;
      }
    } catch (e) {
      // Ignore storage errors
    }
  }
  return null;
}

/**
 * Persists a new JWT access token to localStorage
 */
export function setAuthToken(token: string): void {
  try {
    localStorage.setItem('access_token', token);
  } catch (e) {
    console.error('Failed to set auth token in localStorage:', e);
  }
}

/**
 * Clears stored authentication tokens
 */
export function removeAuthToken(): void {
  for (const key of TOKEN_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
}

/**
 * Centralized API Client class
 */
export class ApiClient {
  private baseUrl: string;
  private defaultTenantContext: string;

  constructor() {
    // Read base URL from Vite env if present, or fallback to current origin / relative path
    const envBase = typeof import.meta !== 'undefined' && (import.meta as any).env
      ? (import.meta as any).env.VITE_FASTAPI_BASE_URL || (import.meta as any).env.VITE_API_BASE_URL
      : undefined;

    this.baseUrl = envBase || '';
    this.defaultTenantContext = 'dev-tenant';
  }

  /**
   * Sets custom base URL dynamically
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  /**
   * Constructs request headers including JWT auth & tenant context
   */
  private getHeaders(options: RequestOptions): Headers {
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    if (!headers.has(TENANT_KEY)) {
      const storedTenant = localStorage.getItem(TENANT_KEY) || this.defaultTenantContext;
      headers.set(TENANT_KEY, storedTenant);
    }

    if (!options.skipAuth && !headers.has('Authorization')) {
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  /**
   * Builds final URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    let fullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    if (params) {
      const urlObj = new URL(fullUrl, window.location.origin);
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          urlObj.searchParams.append(key, String(val));
        }
      });
      fullUrl = urlObj.pathname + urlObj.search;
    }

    return fullUrl;
  }

  /**
   * Core request execution method with retry, metrics tracking & compliance error handling
   */
  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, retries = 3, complianceModule = 'GENERAL', ...fetchInit } = options;
    const url = this.buildUrl(endpoint, params);
    const headers = this.getHeaders(options);

    let attempt = 0;
    const maxAttempt = Math.max(1, retries);
    const initialDelay = 1000;

    while (attempt < maxAttempt) {
      const startTime = performance.now();
      try {
        const response = await fetch(url, {
          ...fetchInit,
          headers
        });

        const latency = performance.now() - startTime;

        // Record metrics to store
        apiMetricsStore.addMetric({
          url,
          status: response.status,
          latency,
          timestamp: Date.now()
        });

        if (!response.ok) {
          let errorPayload: any = null;
          try {
            errorPayload = await response.json();
          } catch (e) {
            errorPayload = await response.text();
          }

          const rawDetail = typeof errorPayload === 'object' && errorPayload !== null
            ? errorPayload.detail || errorPayload.error || errorPayload.message
            : errorPayload;

          const errorMessage = typeof rawDetail === 'string'
            ? rawDetail
            : (errorPayload?.message || `HTTP ${response.status} Request Failed`);

          const apiError = new ApiError(
            response.status,
            errorMessage,
            rawDetail,
            url,
            complianceModule
          );

          // Handle 401 Unauthorized - Dispatch auth error event
          if (response.status === 401) {
            window.dispatchEvent(new CustomEvent('9xen-regulettee-auth-expired', {
              detail: { status: 401, url, module: complianceModule }
            }));
          }

          // Retry on 429 Rate Limit or 5xx Server Errors
          const isRetryable = response.status === 429 || (response.status >= 500 && response.status <= 599);
          if (isRetryable && attempt < maxAttempt - 1) {
            attempt++;
            const backoff = initialDelay * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, backoff));
            continue;
          }

          // Dispatch global compliance API error event
          window.dispatchEvent(new CustomEvent('9xen-regulettee-api-error', {
            detail: {
              status: response.status,
              message: apiError.getFormattedMessage(),
              url,
              module: complianceModule,
              error: apiError
            }
          }));

          throw apiError;
        }

        // Parse JSON response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json() as T;
        }

        return (await response.text()) as unknown as T;
      } catch (err: any) {
        if (err instanceof ApiError) {
          throw err;
        }

        attempt++;
        if (attempt >= maxAttempt) {
          const connectionError = new ApiError(
            0,
            err?.message || 'Network connection failed or service unreachable',
            err,
            url,
            complianceModule
          );

          window.dispatchEvent(new CustomEvent('9xen-regulettee-api-error', {
            detail: {
              status: 0,
              message: connectionError.getFormattedMessage(),
              url,
              module: complianceModule,
              error: connectionError
            }
          }));

          throw connectionError;
        }

        const backoff = initialDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }

    throw new ApiError(0, 'Maximum retry limit reached', null, url, complianceModule);
  }

  // HTTP Helper Methods

  public async get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  public async put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  public async patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  public async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Dedicated Compliance API Modules

  public compliance = {
    getHealth: () =>
      this.get('/api/v1/compliance/health', { complianceModule: 'GENERAL' }),

    getTenantHealth: (tenantId: string = 'org_1') =>
      this.get(`/api/v1/tenants/health?tenantId=${encodeURIComponent(tenantId)}`, { complianceModule: 'GENERAL' }),

    evaluateRisk: (payload: any) =>
      this.post('/api/v1/compliance/risk-evaluation', payload, { complianceModule: 'GENERAL' }),

    getAuditTrail: (limit: number = 50) =>
      this.get(`/api/v1/compliance/audit-trail?limit=${limit}`, { complianceModule: 'GENERAL' })
  };

  public policy = {
    getActs: (region: string = 'ALL', country: string = 'ALL', search: string = '') =>
      this.get('/api/v1/multi-region-policy/acts', {
        params: { region, country, search },
        complianceModule: 'GDPR'
      }),

    getActsByCountry: (region: string = 'ALL', search: string = '') =>
      this.get('/api/v1/multi-region-policy/acts/by-country', {
        params: { region, search },
        complianceModule: 'GDPR'
      }),

    ragSearch: (query: string, region: string = 'ALL') =>
      this.get('/api/v1/multi-region-policy/rag-search', {
        params: { query, region },
        complianceModule: 'EU_AI_ACT'
      }),

    scanAndMatch: (payload: any) =>
      this.post('/api/v1/multi-region-policy/scan-and-match', payload, { complianceModule: 'DORA' }),

    syncSource: (sourceUrl: string, actId?: string, customTitle?: string) =>
      this.post('/api/v1/multi-region-policy/sync-source', { sourceUrl, actId, customTitle }, { complianceModule: 'GDPR' })
  };

  public engine = {
    getStatus: () =>
      this.get('/api/v1/engine/status', { complianceModule: 'GENERAL' }),

    getRegions: () =>
      this.get('/api/v1/engine/regions', { complianceModule: 'GENERAL' }),

    getProfiles: () =>
      this.get('/api/v1/engine/profiles', { complianceModule: 'GENERAL' }),

    getIndustries: () =>
      this.get('/api/v1/engine/industries', { complianceModule: 'GENERAL' })
  };
}

// Singleton export
export const apiClient = new ApiClient();
export default apiClient;
