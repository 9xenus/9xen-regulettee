/**
 * ERP / CRM LIVE CONNECTORS (read-only)
 *
 * Pulls CONFIGURATION METADATA from a customer's ERP/CRM — outbound endpoints, connected/OAuth apps, AI-model
 * inventory, AI-related settings — renders it as scannable documents, and hands them to the existing estate scanner
 * (findings, AI-asset discovery, evidence) and Shadow-IT detector. It never reads business records (customers, deals,
 * tickets, invoices).
 *
 * Safety properties (enforced here, not by convention):
 *   - GET only, against a FIXED list of queries per vendor — callers cannot choose paths (except the explicit `rest` connector).
 *   - The instance host is PINNED to the vendor's domains, so a bearer token cannot be sent to an attacker-chosen host.
 *   - https only, no URL credentials, default port only; redirects are NEVER followed (they would carry the token).
 *   - Pagination links must stay on the same origin.
 *   - Secret-looking fields are redacted and URL query strings are dropped before anything is rendered or stored.
 *   - The access token is used for the request only: not stored, not logged, not echoed in errors or results.
 *   - Every query reports OK / EMPTY / FAILED (with a short reason): a failed query is a coverage gap, never a silent "clean".
 *
 * VERIFICATION LIMIT: the request shapes follow each vendor's public API documentation and are exercised against
 * documented-shape fixtures. They have NOT been run against live vendor tenants; a vendor may rename an object or restrict
 * it by licence/permission, which will show up as a FAILED query in the coverage report.
 */
import type { EstateFile } from './ai-estate-scanner';
import type { ShadowObservation } from './shadow-it-detector';

export type ConnectorVendor = 'salesforce' | 'servicenow' | 'dynamics365' | 'rest';
type Kind = 'OUTBOUND_ENDPOINT' | 'CONNECTED_APP' | 'AI_MODEL' | 'SETTING' | 'GENERIC';

export interface QuerySpec {
  id: string; label: string; path: string; itemsKey: string; keep: string[]; kind: Kind;
  urlField?: string; nameField?: string;
}
export interface FetchResult { status: number; json?: unknown; error?: string }
export type FetchJson = (url: string, headers: Record<string, string>) => Promise<FetchResult>;

export class ConnectorInputError extends Error {}
const bad = (m: string) => new ConnectorInputError(m);

interface ConnectorProfile {
  vendor: ConnectorVendor; label: string; hostPattern: RegExp | null; hostHint: string; ownDomains: RegExp | null;
  tokenHelp: string; queries: QuerySpec[];
  nextUrl?: (json: any) => string | null;
}

const sfTooling = (soql: string) => `/services/data/v59.0/tooling/query?q=${encodeURIComponent(soql)}`;

export const PROFILES: Record<Exclude<ConnectorVendor, 'rest'>, ConnectorProfile> = {
  salesforce: {
    vendor: 'salesforce', label: 'Salesforce (Tooling API)', hostHint: '*.salesforce.com, *.force.com',
    hostPattern: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9-]+)*\.(salesforce\.com|force\.com|salesforce-setup\.com)$/,
    ownDomains: /(^|\.)(salesforce\.com|force\.com|salesforce-setup\.com|lightning\.force\.com)$/,
    tokenHelp: 'OAuth access token (Bearer) of an integration user with "View Setup and Configuration" and API access. Read-only SOQL on setup objects.',
    queries: [
      { id: 'remote-sites', label: 'Remote Site Settings (outbound endpoints)', path: sfTooling('SELECT SiteName, EndpointUrl, IsActive FROM RemoteProxy LIMIT 500'), itemsKey: 'records', keep: ['SiteName', 'EndpointUrl', 'IsActive'], kind: 'OUTBOUND_ENDPOINT', urlField: 'EndpointUrl', nameField: 'SiteName' },
      { id: 'named-credentials', label: 'Named Credentials (outbound endpoints)', path: sfTooling('SELECT DeveloperName, Endpoint FROM NamedCredential LIMIT 500'), itemsKey: 'records', keep: ['DeveloperName', 'Endpoint'], kind: 'OUTBOUND_ENDPOINT', urlField: 'Endpoint', nameField: 'DeveloperName' },
      { id: 'connected-apps', label: 'Connected Apps', path: sfTooling('SELECT Name FROM ConnectedApplication LIMIT 500'), itemsKey: 'records', keep: ['Name'], kind: 'CONNECTED_APP', nameField: 'Name' }
    ],
    nextUrl: j => (j && typeof j.nextRecordsUrl === 'string' ? j.nextRecordsUrl : null)
  },
  servicenow: {
    vendor: 'servicenow', label: 'ServiceNow (Table API)', hostHint: '*.service-now.com',
    hostPattern: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?\.(service-now\.com|servicenowservices\.com)$/,
    ownDomains: /(^|\.)(service-now\.com|servicenowservices\.com|servicenow\.com)$/,
    tokenHelp: 'OAuth access token (Bearer) of a user with read access to sys_rest_message, oauth_entity and sys_properties.',
    queries: [
      { id: 'rest-messages', label: 'Outbound REST Messages', path: '/api/now/table/sys_rest_message?sysparm_fields=name,rest_endpoint,authentication_type&sysparm_limit=500', itemsKey: 'result', keep: ['name', 'rest_endpoint', 'authentication_type'], kind: 'OUTBOUND_ENDPOINT', urlField: 'rest_endpoint', nameField: 'name' },
      { id: 'oauth-providers', label: 'OAuth Entities', path: '/api/now/table/oauth_entity?sysparm_fields=name,type&sysparm_limit=500', itemsKey: 'result', keep: ['name', 'type'], kind: 'CONNECTED_APP', nameField: 'name' },
      { id: 'ai-properties', label: 'AI-related system properties', path: '/api/now/table/sys_properties?sysparm_query=nameLIKEassist%5EORnameLIKEgenai%5EORnameLIKEgenerative&sysparm_fields=name,value&sysparm_limit=200', itemsKey: 'result', keep: ['name', 'value'], kind: 'SETTING' }
    ]
  },
  dynamics365: {
    vendor: 'dynamics365', label: 'Microsoft Dynamics 365 / Dataverse (Web API)', hostHint: '*.dynamics.com',
    hostPattern: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9-]+)*\.(dynamics\.com|microsoftdynamics\.us|microsoftdynamics\.de)$/,
    ownDomains: /(^|\.)(dynamics\.com|microsoft\.com|microsoftonline\.com|windows\.net|azure\.com|powerapps\.com|microsoftdynamics\.(us|de))$/,
    tokenHelp: 'Microsoft Entra access token (Bearer) for the Dataverse environment, for an application user with read access to connection references, connectors and AI Builder models.',
    queries: [
      { id: 'connection-references', label: 'Connection references (Power Platform connectors in use)', path: '/api/data/v9.2/connectionreferences?$select=connectionreferencelogicalname,connectorid&$top=500', itemsKey: 'value', keep: ['connectionreferencelogicalname', 'connectorid'], kind: 'CONNECTED_APP', nameField: 'connectionreferencelogicalname' },
      { id: 'custom-connectors', label: 'Custom connectors', path: '/api/data/v9.2/connectors?$select=name,connectorinternalid&$top=500', itemsKey: 'value', keep: ['name', 'connectorinternalid'], kind: 'CONNECTED_APP', nameField: 'name' },
      { id: 'ai-builder-models', label: 'AI Builder models', path: '/api/data/v9.2/msdyn_aimodels?$select=msdyn_name,statuscode&$top=500', itemsKey: 'value', keep: ['msdyn_name', 'statuscode'], kind: 'AI_MODEL', nameField: 'msdyn_name' }
    ],
    nextUrl: j => (j && typeof j['@odata.nextLink'] === 'string' ? j['@odata.nextLink'] : null)
  }
};

// ── input validation ─────────────────────────────────────────────────────────

export function validateInstanceUrl(vendor: ConnectorVendor, raw: unknown): URL {
  if (typeof raw !== 'string' || !raw.trim()) throw bad('instanceUrl is required');
  let u: URL;
  try { u = new URL(raw.trim()); } catch { throw bad('instanceUrl is not a valid URL'); }
  if (u.protocol !== 'https:') throw bad('instanceUrl must use https');
  if (u.username || u.password) throw bad('Credentials in the URL are not allowed');
  if (u.port && u.port !== '443') throw bad('Only the default https port is allowed');
  const host = u.hostname.toLowerCase();
  if (vendor !== 'rest') {
    const p = PROFILES[vendor];
    if (!p.hostPattern!.test(host)) throw bad(`instanceUrl host must be a ${p.label.split(' (')[0]} domain (${p.hostHint}) — the token is only ever sent to the vendor's own domain`);
  }
  return new URL(`https://${host}`);
}

// ── redaction / rendering ────────────────────────────────────────────────────

const SECRETY = /(secret|passw(or)?d|passwd|token|api[_-]?key|private[_-]?key|credential|authorization|bearer|client[_-]?secret|signature|cookie|session)/i;
const trunc = (s: string, n = 300) => (s.length > n ? s.slice(0, n) + '…' : s);

/** Keeps scheme+host+path only: query strings and fragments often carry keys/tokens. */
export function sanitizeUrl(v: unknown): string | undefined {
  if (typeof v !== 'string' || !v.trim()) return undefined;
  try { const u = new URL(v.trim()); u.username = ''; u.password = ''; return `${u.protocol}//${u.host}${u.pathname === '/' ? '' : u.pathname}`; }
  catch { return trunc(v.replace(/[?#].*$/, ''), 200); }
}

function redactValue(key: string, v: unknown): unknown {
  if (SECRETY.test(key)) return '[REDACTED]';
  if (typeof v === 'string') return trunc(/^https?:\/\//i.test(v) ? (sanitizeUrl(v) ?? v) : v);
  if (v && typeof v === 'object') return undefined;     // never dump nested objects
  return v;
}

function flatten(obj: unknown, prefix = '', depth = 0, out: Record<string, unknown> = {}): Record<string, unknown> {
  if (depth > 3 || out && Object.keys(out).length > 60) return out;
  if (Array.isArray(obj)) { obj.slice(0, 20).forEach((x, i) => flatten(x, `${prefix}[${i}]`, depth + 1, out)); return out; }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (k === 'attributes') continue;
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object') flatten(v, key, depth + 1, out); else out[key] = redactValue(k, v);
    }
    return out;
  }
  out[prefix || 'value'] = redactValue(prefix, obj);
  return out;
}

// ── run ──────────────────────────────────────────────────────────────────────

export interface QueryCoverage { id: string; label: string; status: 'OK' | 'EMPTY' | 'FAILED'; items: number; truncated?: boolean; error?: string }
export interface ConnectorResult {
  vendor: ConnectorVendor; instanceHost: string; files: EstateFile[]; observations: ShadowObservation[];
  coverage: QueryCoverage[]; itemsTotal: number; startedAt: string; verificationNote: string;
}
export interface RestEndpointSpec { path: string; itemsKey?: string; label?: string }
export interface ConnectorParams { vendor: ConnectorVendor; instanceUrl: string; accessToken: string; restEndpoints?: RestEndpointSpec[]; authHeader?: string }

const MAX_PAGES = 5; const MAX_ITEMS = 2000;
const NOTE = 'Request shapes follow the vendor\'s public API documentation and have not been run against live vendor tenants; a FAILED query below means that object was not read.';

function scrubError(msg: string, token: string): string {
  let m = String(msg || '').replace(/\s+/g, ' ');
  if (token) m = m.split(token).join('[token]');
  return trunc(m.replace(/Bearer\s+\S+/gi, 'Bearer [token]'), 140);
}

function hostOf(v: unknown): string | null { try { return new URL(String(v)).hostname.toLowerCase(); } catch { return null; } }

function validateRestPath(p: unknown): string {
  if (typeof p !== 'string' || !/^\/[\w\-./~%:@!$&'()*+,;=?]*$/.test(p) || p.includes('..') || p.startsWith('//')) throw bad('each rest endpoint path must be a relative path starting with "/" (no "..", no "//")');
  return p;
}

export async function runConnector(params: ConnectorParams, deps: { fetchJson: FetchJson }): Promise<ConnectorResult> {
  const { vendor } = params;
  if (!['salesforce', 'servicenow', 'dynamics365', 'rest'].includes(vendor)) throw bad('vendor must be salesforce, servicenow, dynamics365 or rest');
  if (typeof params.accessToken !== 'string' || params.accessToken.length < 8 || params.accessToken.length > 4096 || /[\r\n]/.test(params.accessToken)) throw bad('accessToken is required (8..4096 characters, no line breaks)');
  const origin = validateInstanceUrl(vendor, params.instanceUrl);
  const token = params.accessToken;

  let specs: QuerySpec[]; let profile: ConnectorProfile | null = null;
  if (vendor === 'rest') {
    const eps = params.restEndpoints;
    if (!Array.isArray(eps) || eps.length < 1 || eps.length > 10) throw bad('rest connector needs 1..10 restEndpoints [{path, itemsKey?}]');
    specs = eps.map((e, i) => ({ id: `rest-${i + 1}`, label: String(e.label || e.path).slice(0, 80), path: validateRestPath(e.path), itemsKey: typeof e.itemsKey === 'string' ? e.itemsKey : '', keep: [], kind: 'GENERIC' as Kind }));
  } else { profile = PROFILES[vendor]; specs = profile.queries; }

  const headerName = vendor === 'rest' && params.authHeader && /^[A-Za-z][\w-]{0,40}$/.test(params.authHeader) ? params.authHeader : 'Authorization';
  const headers: Record<string, string> = { Accept: 'application/json', [headerName]: headerName === 'Authorization' ? `Bearer ${token}` : token };
  const startedAt = new Date().toISOString();
  const files: EstateFile[] = []; const coverage: QueryCoverage[] = []; const obs = new Map<string, ShadowObservation>();
  let itemsTotal = 0;

  for (const q of specs) {
    let url: string | null = origin.origin + q.path; let pages = 0; const items: any[] = []; let failure: string | null = null; let truncated = false;
    while (url && pages < MAX_PAGES) {
      let r: FetchResult;
      try { r = await deps.fetchJson(url, headers); } catch (e) { failure = scrubError((e as Error).message, token); break; }
      if (r.status < 200 || r.status >= 300) { failure = `HTTP ${r.status}${r.error ? ' — ' + scrubError(r.error, token) : ''}`; break; }
      const j = r.json as any;
      const arr = q.itemsKey ? j?.[q.itemsKey] : (Array.isArray(j) ? j : undefined);
      if (!Array.isArray(arr)) { failure = 'unexpected response shape (no item list)'; break; }
      items.push(...arr); pages++;
      if (items.length >= MAX_ITEMS) { truncated = true; break; }
      const next = profile?.nextUrl?.(j) ?? null;
      if (next) {
        let nu: URL; try { nu = new URL(next, origin); } catch { break; }
        if (nu.origin !== origin.origin) { failure = failure ?? 'pagination link left the instance origin (ignored)'; break; }
        url = nu.toString(); if (pages >= MAX_PAGES) truncated = true;
      } else url = null;
    }
    if (failure && !items.length) { coverage.push({ id: q.id, label: q.label, status: 'FAILED', items: 0, error: failure }); continue; }
    const capped = items.slice(0, MAX_ITEMS);
    const rendered = capped.map(it => {
      if (q.kind === 'SETTING' && typeof it.name === 'string' && 'value' in it) return { [String(it.name).slice(0, 120)]: redactValue(it.name, it.value) };   // "setting.name": "value" — scannable as key = value
      if (vendor === 'rest' || !q.keep.length) return flatten(it);
      const o: Record<string, unknown> = {};
      for (const k of q.keep) if (k in it) o[k] = k === q.urlField ? sanitizeUrl(it[k]) : redactValue(k, it[k]);
      return o;
    });
    itemsTotal += capped.length;
    coverage.push({ id: q.id, label: q.label, status: capped.length ? 'OK' : 'EMPTY', items: capped.length, ...(truncated ? { truncated: true } : {}), ...(failure ? { error: `partial: ${failure}` } : {}) });
    if (!capped.length) continue;

    files.push({
      path: `${vendor === 'rest' ? 'erp-rest' : vendor}/${q.id}.json`,   // the path must look like ERP/CRM config for the estate scanner's ERP rules to apply
      content: JSON.stringify({ source: vendor === 'rest' ? 'rest-connector' : `${vendor}-api`, instance: origin.hostname, query: q.id, description: q.label, retrievedAt: startedAt, items: rendered }, null, 2)
    });

    // shadow-IT observations
    for (const raw of capped) {
      if (q.kind === 'OUTBOUND_ENDPOINT') {
        const h = hostOf(raw[q.urlField!]);
        if (h && !(profile?.ownDomains?.test(h)) && h !== origin.hostname && !obs.has(h)) obs.set(h, { source: 'ERP_CRM_CONNECTOR', identifier: h, users: 1 });
      } else if (q.kind === 'CONNECTED_APP' && q.nameField) {
        const n = typeof raw[q.nameField] === 'string' ? String(raw[q.nameField]).trim().slice(0, 120) : '';
        if (n && !obs.has(`app:${n.toLowerCase()}`)) obs.set(`app:${n.toLowerCase()}`, { source: 'OAUTH_GRANT', identifier: n, users: 1 });
      }
    }
  }
  return { vendor, instanceHost: origin.hostname, files, observations: Array.from(obs.values()), coverage, itemsTotal, startedAt, verificationNote: NOTE };
}

/** Catalogue shown to the UI / API consumers: exactly what each connector reads. */
export function describeConnectors() {
  return [
    ...Object.values(PROFILES).map(p => ({ vendor: p.vendor, label: p.label, host: `pinned to ${p.hostHint}`, tokenHelp: p.tokenHelp, readsOnly: p.queries.map(q => ({ id: q.id, label: q.label, request: `GET ${q.path.split('?')[0]}` })) })),
    { vendor: 'rest', label: 'Generic REST (SAP OData, NetSuite, Odoo, Workday, others)', host: 'any public https host (SSRF-guarded)', tokenHelp: 'Bearer token, or a custom header name + value. You list the GET paths to read (1..10); responses are flattened and secret-looking fields redacted.', readsOnly: [{ id: 'rest-N', label: 'The GET paths you list', request: 'GET <your paths>' }] }
  ];
}
