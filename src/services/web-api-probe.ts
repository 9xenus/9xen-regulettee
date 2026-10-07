/**
 * WEB & API SECURITY CHECKS (passive + opt-in safe probes)
 *
 * analyzeHeaders: pure analysis of a response's headers (no extra requests).
 * PROBES: a FIXED list of well-known paths requested with plain GET, only when the caller attests ownership /
 *         authorisation of the target. Never sends payloads, credentials, or fuzzing input.
 */

export interface ProbeFinding {
  ruleId: string; title: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  framework: string; articleRef: string; category: string; penaltyEur: number; evidence: string; remediation: string; path: string;
}

const F = (ruleId: string, title: string, severity: ProbeFinding['severity'], category: string, articleRef: string, remediation: string, evidence: string, path: string, penaltyEur = 5_000_000): ProbeFinding =>
  ({ ruleId, title, severity, framework: 'GDPR', articleRef, category, penaltyEur, evidence, remediation, path });

const lower = (h: Record<string, string>) => Object.fromEntries(Object.entries(h).map(([k, v]) => [k.toLowerCase(), v]));

export function analyzeHeaders(url: URL, rawHeaders: Record<string, string>): ProbeFinding[] {
  const h = lower(rawHeaders); const out: ProbeFinding[] = []; const at = `${url.hostname}${url.pathname}`;
  const ART = 'GDPR Art. 32 / NIS2 Art. 21(2)(h) / DORA Art. 9';
  if (url.protocol === 'http:') out.push(F('WEB-H01', 'Served over plain HTTP', 'HIGH', 'TRANSPORT_SECURITY', ART, 'Serve everything over HTTPS and redirect HTTP→HTTPS.', `Scheme: ${url.protocol}`, at, 10_000_000));
  if (url.protocol === 'https:' && !h['strict-transport-security']) out.push(F('WEB-H02', 'HSTS header missing', 'MEDIUM', 'TRANSPORT_SECURITY', ART, 'Add Strict-Transport-Security with max-age ≥ 15552000 and includeSubDomains.', 'No Strict-Transport-Security header', at));
  const csp = h['content-security-policy'];
  if (!csp) out.push(F('WEB-H03', 'Content-Security-Policy missing', 'MEDIUM', 'INFRA_SECURITY', ART, "Define a CSP (start with report-only); restrict script-src and avoid 'unsafe-inline'.", 'No Content-Security-Policy header', at));
  else if (/script-src[^;]*('unsafe-inline'|\*)/i.test(csp)) out.push(F('WEB-H04', 'CSP allows unsafe script sources', 'LOW', 'INFRA_SECURITY', ART, "Remove 'unsafe-inline' and wildcard script sources; use nonces/hashes.", csp.slice(0, 160), at, 1_000_000));
  if (!h['x-frame-options'] && !/frame-ancestors/i.test(csp || '')) out.push(F('WEB-H05', 'No clickjacking protection', 'LOW', 'INFRA_SECURITY', ART, "Set CSP frame-ancestors 'self' (or X-Frame-Options: DENY/SAMEORIGIN).", 'Neither X-Frame-Options nor frame-ancestors present', at, 1_000_000));
  if ((h['x-content-type-options'] || '').toLowerCase() !== 'nosniff') out.push(F('WEB-H06', 'X-Content-Type-Options: nosniff missing', 'LOW', 'INFRA_SECURITY', ART, 'Add X-Content-Type-Options: nosniff.', 'Header absent or not "nosniff"', at, 500_000));
  if (!h['referrer-policy']) out.push(F('WEB-H07', 'Referrer-Policy missing', 'LOW', 'INFRA_SECURITY', 'GDPR Art. 5(1)(c), 25', 'Set Referrer-Policy: strict-origin-when-cross-origin (or stricter).', 'Header absent', at, 500_000));
  const acao = h['access-control-allow-origin']; const acac = (h['access-control-allow-credentials'] || '').toLowerCase();
  if (acao === '*' && acac === 'true') out.push(F('WEB-H08', 'CORS: wildcard origin with credentials', 'HIGH', 'INFRA_SECURITY', ART, 'Never combine * with credentials; reflect only an allow-list of origins.', 'Access-Control-Allow-Origin: * and Allow-Credentials: true', at, 10_000_000));
  else if (acao === 'null') out.push(F('WEB-H09', 'CORS allows the "null" origin', 'HIGH', 'INFRA_SECURITY', ART, 'Remove "null" from the CORS allow-list.', 'Access-Control-Allow-Origin: null', at, 10_000_000));
  const banner = [h['server'], h['x-powered-by']].filter(Boolean).join(' | ');
  if (/\d+\.\d+/.test(banner)) out.push(F('WEB-H10', 'Server version disclosed', 'LOW', 'INFRA_SECURITY', ART, 'Remove or genericise Server / X-Powered-By headers.', banner.slice(0, 120), at, 500_000));
  const cookies = (h['set-cookie'] || '').split(/,(?=\s*[^;,=\s]+=)/).filter(Boolean);
  for (const c of cookies.slice(0, 5)) {
    const name = c.split('=')[0].trim();
    const missing = [!/;\s*secure/i.test(c) && url.protocol === 'https:' ? 'Secure' : '', !/;\s*httponly/i.test(c) && /sess|auth|token|sid|jwt/i.test(name) ? 'HttpOnly' : '', !/;\s*samesite/i.test(c) ? 'SameSite' : ''].filter(Boolean);
    if (missing.length) out.push(F('WEB-H11', `Cookie "${name}" missing ${missing.join(', ')}`, /sess|auth|token|sid|jwt/i.test(name) ? 'MEDIUM' : 'LOW', 'INFRA_SECURITY', ART, 'Set Secure, HttpOnly (session cookies) and SameSite attributes.', `Set-Cookie: ${name}=…; missing ${missing.join(', ')}`, at, 2_000_000));
  }
  return out;
}

export interface Probe {
  path: string;
  test: (status: number, body: string, contentType: string) => ProbeFinding | null;
}

const isHtml = (ct: string, body: string) => /html/i.test(ct) || /^\s*<!doctype html|^\s*<html/i.test(body);
const AI_PATHS = /(chat\/completions|\/completions|\/generate|\/inference|\/predict|\/embeddings|\/invocations)/i;

export const PROBES: Probe[] = [
  { path: '/openapi.json', test: (s, b, ct) => {
    if (s !== 200 || isHtml(ct, b) || !/"(openapi|swagger)"\s*:/.test(b.slice(0, 2000))) return null;
    const ai = AI_PATHS.test(b);
    return F(ai ? 'WEB-P02' : 'WEB-P01', ai ? 'Public API spec documents AI inference endpoints' : 'Public API specification exposed', ai ? 'HIGH' : 'MEDIUM', 'INFRA_SECURITY', 'NIS2 Art. 21(2)(e) / OWASP LLM10',
      'Restrict API documentation to authenticated users / internal networks and confirm the documented endpoints require authentication.', `GET /openapi.json → 200 (${b.length} bytes)${ai ? ', includes AI inference paths' : ''}`, '/openapi.json', ai ? 10_000_000 : 3_000_000);
  } },
  { path: '/swagger.json', test: (s, b, ct) => (s === 200 && !isHtml(ct, b) && /"swagger"\s*:/.test(b.slice(0, 2000)))
    ? F('WEB-P01', 'Public API specification exposed', 'MEDIUM', 'INFRA_SECURITY', 'NIS2 Art. 21(2)(e)', 'Restrict API documentation to authenticated users.', 'GET /swagger.json → 200', '/swagger.json', 3_000_000) : null },
  { path: '/docs', test: (s, b) => (s === 200 && /swagger[\s-]?ui|redoc/i.test(b.slice(0, 6000)))
    ? F('WEB-P03', 'Interactive API docs publicly reachable', 'MEDIUM', 'INFRA_SECURITY', 'NIS2 Art. 21(2)(e)', 'Disable or protect /docs in production.', 'GET /docs → 200 (Swagger UI / ReDoc)', '/docs', 3_000_000) : null },
  { path: '/v1/models', test: (s, b, ct) => (s === 200 && !isHtml(ct, b) && /"object"\s*:\s*"list"/.test(b) && /"data"\s*:/.test(b))
    ? F('WEB-P04', 'OpenAI-compatible model API reachable without authentication', 'HIGH', 'INFRA_SECURITY', 'EU AI Act Art. 15 / OWASP LLM10', 'Require authentication (API keys/mTLS) on every inference route; put the service behind the runtime gateway.', 'GET /v1/models → 200 with model list, no credentials sent', '/v1/models', 15_000_000) : null },
  { path: '/api/tags', test: (s, b, ct) => (s === 200 && !isHtml(ct, b) && /"models"\s*:\s*\[/.test(b))
    ? F('WEB-P05', 'Self-hosted model server (Ollama-style) exposed without authentication', 'HIGH', 'INFRA_SECURITY', 'EU AI Act Art. 15 / OWASP LLM10', 'Bind to a private interface and front with an authenticating proxy.', 'GET /api/tags → 200 with model list', '/api/tags', 15_000_000) : null },
  { path: '/.env', test: (s, b, ct) => (s === 200 && !isHtml(ct, b) && /^\s*[A-Z][A-Z0-9_]{2,}\s*=\s*\S+/m.test(b))
    ? F('WEB-P06', 'Environment file publicly downloadable', 'CRITICAL', 'SECRETS_EXPOSURE', 'GDPR Art. 32 / OWASP LLM02', 'Remove from the web root immediately; rotate every value it contained.', 'GET /.env → 200 with KEY=VALUE content (values not recorded)', '/.env', 15_000_000) : null },
  { path: '/.git/HEAD', test: (s, b) => (s === 200 && /^ref:\s*refs\//.test(b))
    ? F('WEB-P07', 'Git repository metadata exposed', 'HIGH', 'SECRETS_EXPOSURE', 'GDPR Art. 32', 'Block access to .git; assume source and history are exposed and rotate secrets.', 'GET /.git/HEAD → 200', '/.git/HEAD', 10_000_000) : null },
  { path: '/metrics', test: (s, b) => (s === 200 && /^# HELP /m.test(b.slice(0, 4000)))
    ? F('WEB-P08', 'Prometheus metrics publicly reachable', 'MEDIUM', 'INFRA_SECURITY', 'NIS2 Art. 21(2)(e)', 'Restrict /metrics to the monitoring network.', 'GET /metrics → 200 (Prometheus format)', '/metrics', 3_000_000) : null },
  { path: '/actuator/env', test: (s, b, ct) => (s === 200 && !isHtml(ct, b) && /"propertySources"/.test(b))
    ? F('WEB-P09', 'Spring Actuator environment endpoint exposed', 'HIGH', 'SECRETS_EXPOSURE', 'GDPR Art. 32', 'Disable or secure actuator endpoints.', 'GET /actuator/env → 200', '/actuator/env', 10_000_000) : null }
];
