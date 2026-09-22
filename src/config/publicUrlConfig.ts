// Public-facing endpoint resolver.
// Every product hostname is registered here ONCE and derived from env vars.
// - Server runtime: process.env.<KEY>
// - Client runtime (Vite): import.meta.env.VITE_<KEY>
// - Fallback: the canonical dev/SaaS defaults on regulettee.eu
//
// This keeps generated snippets, callback URLs, agent/verification install
// instructions and SDK base URLs pointing at your own deployment instead of
// hardcoding a single domain across the codebase.

export interface PublicEndpoints {
  webBaseUrl: string;       // customer-facing web app
  apiBaseUrl: string;       // REST gateway
  wsBaseUrl: string;        // realtime socket gateway
  cdnBaseUrl: string;       // static assets / embed scripts
  agentBaseUrl: string;     // runtime/agent install endpoint
  verifyBaseUrl: string;    // seal/tamper-proof verification
  storageBaseUrl: string;   // object storage (exports, evidence)
  baseDomain: string;       // e.g. regulettee.eu (for region inference hosts)
}

const DEFAULT_WEB = 'https://app.regulettee.eu';
const DEFAULT_API = 'https://api.regulettee.eu';
const DEFAULT_CDN = 'https://cdn.regulettee.eu';
const DEFAULT_AGENT = 'https://agent.regulettee.eu';
const DEFAULT_VERIFY = 'https://verify.regulettee.eu';
const DEFAULT_STORAGE = 'https://storage.regulettee.eu';

function read(envKey: string, metaKey: string, fallback: string): string {
  try {
    if (typeof process !== 'undefined' && process.env) {
      const v = process.env[envKey];
      if (typeof v === 'string' && v.trim()) return v.trim().replace(/\/+$/, '');
    }
  } catch { /* browser runtime without process */ }
  try {
    const meta = (import.meta as any)?.env;
    const v = meta && meta[metaKey];
    if (typeof v === 'string' && v.trim()) return v.trim().replace(/\/+$/, '');
  } catch { /* node runtime without import.meta.env */ }
  return fallback;
}

function hostOf(url: string): string {
  try { return new URL(url).hostname; } catch { return url.replace(/^[a-z]+:\/\//, '').split('/')[0]; }
}

function baseDomainOf(host: string): string {
  const parts = host.split('.');
  return parts.length > 2 ? parts.slice(-3).join('.') : host;
}

let cached: PublicEndpoints | null = null;

export function getPublicEndpoints(): PublicEndpoints {
  if (cached) return cached;
  const apiBaseUrl = read('API_PUBLIC_URL', 'VITE_API_PUBLIC_URL', DEFAULT_API);
  const wsBaseUrl = read('WS_PUBLIC_URL', 'VITE_WS_PUBLIC_URL', '') ||
    apiBaseUrl.replace(/^https/i, 'wss') + '/v1/ws';
  const webBaseUrl = read('WEB_PUBLIC_URL', 'VITE_WEB_PUBLIC_URL', DEFAULT_WEB);
  cached = {
    webBaseUrl,
    apiBaseUrl,
    wsBaseUrl,
    cdnBaseUrl: read('CDN_PUBLIC_URL', 'VITE_CDN_PUBLIC_URL', DEFAULT_CDN),
    agentBaseUrl: read('AGENT_PUBLIC_URL', 'VITE_AGENT_PUBLIC_URL', DEFAULT_AGENT),
    verifyBaseUrl: read('VERIFY_PUBLIC_URL', 'VITE_VERIFY_PUBLIC_URL', DEFAULT_VERIFY),
    storageBaseUrl: read('STORAGE_PUBLIC_URL', 'VITE_STORAGE_PUBLIC_URL', DEFAULT_STORAGE),
    baseDomain: baseDomainOf(hostOf(apiBaseUrl)),
  };
  return cached;
}

// Sugar accessor so imports stay terse.
export const publicUrls = () => getPublicEndpoints();