/**
 * SHADOW IT / SHADOW AI DETECTOR
 * Turns raw usage observations from a client's connected entity (egress/DNS logs, OAuth grants,
 * SSO app logs, expense lines, cloud-account inventories, code-scan hits) into a risk-scored
 * inventory of unsanctioned SaaS and AI services, with remediation proposals.
 *
 * Remediation is PROPOSED only. Proposals are routed to the existing human-approval (HITL) queue —
 * consistent with the runtime policy: read-only = automatic, data-changing = approval, financial = deny.
 */

export type ObservationSource = 'EGRESS_DNS' | 'OAUTH_GRANT' | 'SSO_APP_LOG' | 'EXPENSE' | 'CLOUD_ACCOUNT' | 'CODE_SCAN';
export type AssetCategory =
  | 'AI_LLM' | 'AI_CODING' | 'AI_NOTETAKER' | 'AI_MEDIA' | 'AI_AGENT_PLATFORM' | 'AI_WRITING'
  | 'FILE_SHARING' | 'MESSAGING' | 'AUTOMATION' | 'PRODUCTIVITY' | 'DEVOPS' | 'UNCATALOGUED_AI' | 'OTHER';
export type ShadowVerdict = 'SANCTIONED' | 'SHADOW_AI' | 'SHADOW_IT' | 'UNCATALOGUED_AI';
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type FixAction = 'BLOCK_AT_EGRESS' | 'REVOKE_OAUTH' | 'ROUTE_VIA_GATEWAY' | 'VENDOR_REVIEW_DPA' | 'ONBOARD_SANCTIONED' | 'MONITOR';

export interface ShadowObservation {
  source: ObservationSource;
  identifier: string;          // domain or app name
  users?: number;
  bytesOut?: number;
  scopes?: string[];           // OAuth scopes
  firstSeen?: string;
  lastSeen?: string;
}

interface CatalogEntry {
  match: RegExp;
  name: string;
  category: AssetCategory;
  baseRisk: number;
  residency: string;
  trainsOnData: 'YES' | 'NO' | 'OPT_OUT' | 'UNKNOWN';
}

export const SAAS_CATALOG: CatalogEntry[] = [
  { match: /(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com)$/, name: 'ChatGPT / OpenAI', category: 'AI_LLM', baseRisk: 55, residency: 'US', trainsOnData: 'OPT_OUT' },
  { match: /(^|\.)(claude\.ai|anthropic\.com)$/, name: 'Claude / Anthropic', category: 'AI_LLM', baseRisk: 45, residency: 'US', trainsOnData: 'OPT_OUT' },
  { match: /(^|\.)(gemini\.google\.com|bard\.google\.com|aistudio\.google\.com)$/, name: 'Google Gemini', category: 'AI_LLM', baseRisk: 45, residency: 'US/Global', trainsOnData: 'OPT_OUT' },
  { match: /(^|\.)(copilot\.microsoft\.com|bing\.com\/chat)$/, name: 'Microsoft Copilot (consumer)', category: 'AI_LLM', baseRisk: 45, residency: 'US/Global', trainsOnData: 'OPT_OUT' },
  { match: /(^|\.)perplexity\.ai$/, name: 'Perplexity', category: 'AI_LLM', baseRisk: 55, residency: 'US', trainsOnData: 'OPT_OUT' },
  { match: /(^|\.)(deepseek\.com|chat\.deepseek\.com)$/, name: 'DeepSeek', category: 'AI_LLM', baseRisk: 85, residency: 'CN', trainsOnData: 'YES' },
  { match: /(^|\.)(kimi\.ai|moonshot\.cn|qwen\.ai|tongyi\.aliyun\.com|doubao\.com|yiyan\.baidu\.com)$/, name: 'China-hosted LLM service', category: 'AI_LLM', baseRisk: 85, residency: 'CN', trainsOnData: 'YES' },
  { match: /(^|\.)(mistral\.ai|chat\.mistral\.ai)$/, name: 'Mistral (Le Chat)', category: 'AI_LLM', baseRisk: 35, residency: 'EU', trainsOnData: 'OPT_OUT' },
  { match: /(^|\.)(poe\.com|character\.ai|you\.com|grok\.com|x\.ai|pi\.ai)$/, name: 'Consumer AI chat service', category: 'AI_LLM', baseRisk: 65, residency: 'US', trainsOnData: 'YES' },
  { match: /(^|\.)(huggingface\.co|replicate\.com|together\.ai|groq\.com)$/, name: 'Model hosting / inference platform', category: 'AI_LLM', baseRisk: 50, residency: 'US/EU', trainsOnData: 'UNKNOWN' },
  { match: /(^|\.)(cursor\.com|cursor\.sh|codeium\.com|windsurf\.com|tabnine\.com|replit\.com|bolt\.new|lovable\.dev|v0\.dev)$/, name: 'AI coding assistant', category: 'AI_CODING', baseRisk: 60, residency: 'US', trainsOnData: 'UNKNOWN' },
  { match: /(^|\.)(otter\.ai|fireflies\.ai|fathom\.video|read\.ai|tldv\.io|krisp\.ai|granola\.ai|avoma\.com)$/, name: 'AI meeting notetaker', category: 'AI_NOTETAKER', baseRisk: 75, residency: 'US', trainsOnData: 'UNKNOWN' },
  { match: /(^|\.)(midjourney\.com|runwayml\.com|elevenlabs\.io|heygen\.com|synthesia\.io|leonardo\.ai|ideogram\.ai|suno\.com|pika\.art)$/, name: 'Generative media tool', category: 'AI_MEDIA', baseRisk: 50, residency: 'US', trainsOnData: 'UNKNOWN' },
  { match: /(^|\.)(jasper\.ai|copy\.ai|writesonic\.com|grammarly\.com|quillbot\.com|wordtune\.com)$/, name: 'AI writing assistant', category: 'AI_WRITING', baseRisk: 50, residency: 'US', trainsOnData: 'UNKNOWN' },
  { match: /(^|\.)(relevanceai\.com|lindy\.ai|manus\.im|dust\.tt|flowiseai\.com|crew\.ai|crewai\.com|agentgpt|autogpt|langflow\.org|n8n\.cloud)$/, name: 'AI agent platform', category: 'AI_AGENT_PLATFORM', baseRisk: 70, residency: 'Various', trainsOnData: 'UNKNOWN' },
  { match: /(^|\.)(wetransfer\.com|mega\.nz|mega\.io|pastebin\.com|anonfiles|file\.io|transfer\.sh|gofile\.io)$/, name: 'Consumer file/paste sharing', category: 'FILE_SHARING', baseRisk: 75, residency: 'Various', trainsOnData: 'UNKNOWN' },
  { match: /(^|\.)(dropbox\.com|box\.com|drive\.google\.com|mediafire\.com)$/, name: 'Cloud file storage', category: 'FILE_SHARING', baseRisk: 45, residency: 'US', trainsOnData: 'NO' },
  { match: /(^|\.)(web\.whatsapp\.com|telegram\.org|web\.telegram\.org|signal\.org|discord\.com)$/, name: 'Consumer messaging', category: 'MESSAGING', baseRisk: 50, residency: 'Various', trainsOnData: 'UNKNOWN' },
  { match: /(^|\.)(zapier\.com|make\.com|integromat\.com|ifttt\.com|pipedream\.com)$/, name: 'Automation / iPaaS', category: 'AUTOMATION', baseRisk: 55, residency: 'US', trainsOnData: 'NO' },
  { match: /(^|\.)(airtable\.com|notion\.so|trello\.com|monday\.com|asana\.com|clickup\.com|miro\.com|canva\.com)$/, name: 'Productivity SaaS', category: 'PRODUCTIVITY', baseRisk: 35, residency: 'US/EU', trainsOnData: 'OPT_OUT' },
  { match: /(^|\.)(github\.com|gitlab\.com|bitbucket\.org|vercel\.app|netlify\.app|heroku\.com|render\.com|fly\.dev|railway\.app)$/, name: 'Developer / hosting platform', category: 'DEVOPS', baseRisk: 30, residency: 'US', trainsOnData: 'NO' }
];

/** Heuristic for AI-looking services missing from the catalogue. */
const AI_HEURISTIC = /(^|[.-])(ai|llm|gpt|copilot|agent|chatbot|genai|assistant)([.-]|$)|\.ai$/i;

const BROAD_SCOPES = /(mail\.read|mail\.send|files\.readwrite\.all|drive(\.file)?$|contacts|calendars?|offline_access|full_access|admin|\.all$|gmail\.(readonly|modify)|sites\.read\.all|directory\.read\.all|user\.read\.all)/i;

export interface ShadowAsset {
  identifier: string;
  name: string;
  category: AssetCategory;
  verdict: ShadowVerdict;
  riskScore: number;
  severity: Severity;
  users: number;
  sources: ObservationSource[];
  trainsOnData: CatalogEntry['trainsOnData'];
  dataResidency: string;
  broadOauthScopes: string[];
  bytesOut: number;
  firstSeen: string | null;
  lastSeen: string | null;
  riskFactors: string[];
  recommendedFixes: { action: FixAction; description: string }[];
}

export interface ShadowAnalysis {
  analyzedAt: string;
  observations: number;
  assets: ShadowAsset[];
  counts: { total: number; shadowAi: number; shadowIt: number; uncatalogued: number; sanctioned: number; critical: number; high: number };
  summary: string;
}

const normalize = (id: string): string =>
  id.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[/?#].*$/, '').replace(/:\d+$/, '');

function severityOf(score: number): Severity {
  return score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
}

export class ShadowItDetector {
  public static analyze(observations: ShadowObservation[], sanctioned: string[] = []): ShadowAnalysis {
    const allow = sanctioned.map(normalize).filter(Boolean);
    interface Merged {
      identifier: string; sources: Set<ObservationSource>; scopes: Set<string>;
      users: number; bytesOut: number; firstSeen?: string; lastSeen?: string;
    }
    const merged = new Map<string, Merged>();

    for (const o of observations) {
      if (!o || typeof o.identifier !== 'string' || !o.identifier.trim()) continue;
      const key = normalize(o.identifier);
      if (!key || key.length > 253) continue;
      const cur: Merged = merged.get(key) || { identifier: key, sources: new Set<ObservationSource>(), scopes: new Set<string>(), users: 0, bytesOut: 0 };
      cur.sources.add(o.source);
      (o.scopes || []).forEach(s => cur.scopes.add(String(s)));
      cur.users = Math.max(cur.users, Number(o.users) || 0);
      cur.bytesOut += Number(o.bytesOut) || 0;
      if (o.firstSeen && (!cur.firstSeen || o.firstSeen < cur.firstSeen)) cur.firstSeen = o.firstSeen;
      if (o.lastSeen && (!cur.lastSeen || o.lastSeen > cur.lastSeen)) cur.lastSeen = o.lastSeen;
      merged.set(key, cur);
    }

    const assets: ShadowAsset[] = [];
    for (const [key, o] of merged) {
      const cat = SAAS_CATALOG.find(c => c.match.test(key));
      const isAi = cat ? cat.category.startsWith('AI_') : AI_HEURISTIC.test(key);
      const isSanctioned = allow.some(a => key === a || key.endsWith(`.${a}`) || a.endsWith(`.${key}`));

      const name = cat?.name || key;
      const category: AssetCategory = cat?.category || (isAi ? 'UNCATALOGUED_AI' : 'OTHER');
      const verdict: ShadowVerdict = isSanctioned ? 'SANCTIONED' : cat ? (isAi ? 'SHADOW_AI' : 'SHADOW_IT') : (isAi ? 'UNCATALOGUED_AI' : 'SHADOW_IT');

      const factors: string[] = [];
      let risk = cat?.baseRisk ?? (isAi ? 60 : 40);
      if (cat) factors.push(`Catalogued as ${cat.name} (base risk ${cat.baseRisk})`); else factors.push(isAi ? 'Looks like an AI service but is not in the catalogue' : 'Not in the SaaS catalogue');
      const trains = cat?.trainsOnData ?? 'UNKNOWN';
      if (trains === 'YES') { risk += 20; factors.push('Provider may train on submitted data'); }
      else if (trains === 'OPT_OUT' || trains === 'UNKNOWN') { risk += 5; factors.push(trains === 'OPT_OUT' ? 'Data training requires opt-out' : 'Data-training policy unknown'); }
      const residency = cat?.residency || 'Unknown';
      if (/CN/.test(residency)) { risk += 15; factors.push('Data residency in a non-adequate jurisdiction (CN)'); }
      else if (/^US/.test(residency)) { risk += 5; factors.push('US data residency — transfer mechanism required (GDPR Ch. V)'); }
      const broad = Array.from(o.scopes).filter(s => BROAD_SCOPES.test(s));
      if (broad.length) { risk += 15; factors.push(`Broad OAuth scopes granted: ${broad.slice(0, 4).join(', ')}`); }
      if (o.users >= 25) { risk += 10; factors.push(`Widespread use (${o.users} users)`); } else if (o.users >= 5) { risk += 5; factors.push(`${o.users} users`); }
      if (o.bytesOut > 100 * 1024 * 1024) { risk += 10; factors.push(`High outbound volume (${Math.round(o.bytesOut / 1048576)} MB)`); }
      if (isSanctioned) { risk = Math.round(risk * 0.3); factors.push('Sanctioned: risk reduced, monitored only'); }
      risk = Math.max(0, Math.min(100, Math.round(risk)));

      const fixes: ShadowAsset['recommendedFixes'] = [];
      if (!isSanctioned) {
        if (risk >= 60) fixes.push({ action: 'BLOCK_AT_EGRESS', description: `Block ${key} at proxy/DNS until a vendor review is complete.` });
        if (o.sources.has('OAUTH_GRANT')) fixes.push({ action: 'REVOKE_OAUTH', description: `Revoke OAuth grants to ${name} and require admin consent for re-authorisation.` });
        if (isAi) fixes.push({ action: 'ROUTE_VIA_GATEWAY', description: 'Provide an approved alternative via the AI runtime protection gateway (PII redaction, audit, kill switch).' });
        fixes.push({ action: 'VENDOR_REVIEW_DPA', description: `Run vendor risk review and obtain a DPA / SCCs for ${name} before any approval.` });
        if (risk < 60) fixes.push({ action: 'ONBOARD_SANCTIONED', description: `If the business need is valid, onboard ${name} to the approved-software register with an owner.` });
      } else {
        fixes.push({ action: 'MONITOR', description: 'Sanctioned — continue monitoring usage and scopes.' });
      }

      assets.push({
        identifier: key, name, category, verdict, riskScore: risk, severity: severityOf(risk),
        users: o.users, sources: Array.from(o.sources), trainsOnData: trains, dataResidency: residency,
        broadOauthScopes: broad, bytesOut: o.bytesOut, firstSeen: o.firstSeen || null, lastSeen: o.lastSeen || null,
        riskFactors: factors, recommendedFixes: fixes
      });
    }

    assets.sort((a, b) => b.riskScore - a.riskScore);
    const unsanctioned = assets.filter(a => a.verdict !== 'SANCTIONED');
    const counts = {
      total: assets.length,
      shadowAi: assets.filter(a => a.verdict === 'SHADOW_AI').length,
      shadowIt: assets.filter(a => a.verdict === 'SHADOW_IT').length,
      uncatalogued: assets.filter(a => a.verdict === 'UNCATALOGUED_AI').length,
      sanctioned: assets.filter(a => a.verdict === 'SANCTIONED').length,
      critical: unsanctioned.filter(a => a.severity === 'CRITICAL').length,
      high: unsanctioned.filter(a => a.severity === 'HIGH').length
    };
    return {
      analyzedAt: new Date().toISOString(),
      observations: observations.length,
      assets, counts,
      summary: `${assets.length} service(s) observed: ${counts.shadowAi} shadow AI, ${counts.uncatalogued} uncatalogued AI, ${counts.shadowIt} shadow IT, ${counts.sanctioned} sanctioned. ${counts.critical} critical / ${counts.high} high risk.`
    };
  }

  /** Parses pasted logs: JSON array of observations, or lines "domain[,users[,source]]". */
  public static parseObservations(raw: string): ShadowObservation[] {
    const text = (raw || '').trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed as ShadowObservation[];
    } catch { /* fall through to line format */ }
    const out: ShadowObservation[] = [];
    for (const line of text.split(/\r?\n/)) {
      const [id, users, source] = line.split(',').map(s => s.trim());
      if (!id || id.startsWith('#')) continue;
      out.push({ identifier: id, users: Number(users) || 1, source: (['EGRESS_DNS', 'OAUTH_GRANT', 'SSO_APP_LOG', 'EXPENSE', 'CLOUD_ACCOUNT', 'CODE_SCAN'].includes(source) ? source : 'EGRESS_DNS') as ObservationSource });
    }
    return out;
  }
}
