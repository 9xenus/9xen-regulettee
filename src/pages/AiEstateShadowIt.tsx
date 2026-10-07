import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWithRetry } from "../lib/api-client";
import { ShieldAlert, Radar, GitBranch, Globe, FileCode2, Ghost, Loader2, CheckCircle2, AlertTriangle, Send, Boxes, Activity } from "lucide-react";
import { AiPostureConsole } from "./AiPostureConsole";
import { AiAssuranceConsole } from "./AiAssuranceConsole";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface Finding {
  id: string; ruleId: string; title: string; kind: string; path: string; line: number; severity: Severity;
  framework: string; articleRef: string; evidence: string; remediation: string; fixSnippet?: string; penaltyExposureEur: number;
}
interface ConnectorInfo {
  vendor: string; instanceHost: string; itemsRead: number; verificationNote: string; credentialHandling: string; dataScope: string;
  coverage: { id: string; label: string; status: "OK" | "EMPTY" | "FAILED"; items: number; truncated?: boolean; error?: string }[];
}
const ERP_HINT: Record<string, { url: string; token: string }> = {
  salesforce: { url: "https://yourcompany.my.salesforce.com", token: "OAuth access token of an integration user (View Setup & Configuration)" },
  servicenow: { url: "https://yourinstance.service-now.com", token: "OAuth access token with read access to sys_rest_message, oauth_entity, sys_properties" },
  dynamics365: { url: "https://yourorg.crm4.dynamics.com", token: "Microsoft Entra access token for the Dataverse environment" },
  rest: { url: "https://erp.example.com", token: "Bearer token (SAP OData, NetSuite, Odoo, Workday …)" }
};
interface ScanResult {
  scanId: string; filesScanned: number; filesSkipped: number; findings: Finding[]; riskScore: number; complianceRating: string;
  counts: Record<Severity, number>; totalPenaltyExposureEur: number; summary: string;
  aiProvidersDetected: { provider: string; domain: string; sanctioned: boolean; files: string[] }[];
}
interface ShadowAsset {
  id: string; identifier: string; name: string; category: string; verdict: string; risk_score: number; severity: Severity;
  users: number; sources: string[]; trains_on_data: string; data_residency: string; risk_factors: string[];
  recommended_fixes: { action: string; description: string }[]; status: string; fix_proposal_id: string | null;
}
interface ShadowSummary { unsanctioned: number; shadowAi: number; shadowIt: number; critical: number; high: number; open: number; fixProposed: number; remediated: number; accepted: number; averageRisk: number }
interface EntityOption { id: string; name: string }

const SEV_STYLE: Record<Severity, string> = {
  CRITICAL: "bg-rose-100 text-rose-800 border-rose-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-200",
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
};

const SAMPLE_LOG = `# domain,users,source
chatgpt.com,42,EGRESS_DNS
chat.deepseek.com,7,EGRESS_DNS
otter.ai,18,OAUTH_GRANT
fireflies.ai,9,SSO_APP_LOG
cursor.com,23,EGRESS_DNS
wetransfer.com,11,EGRESS_DNS
zapier.com,6,OAUTH_GRANT
some-new-assistant.ai,3,EGRESS_DNS`;

function loadEntities(): EntityOption[] {
  const base: EntityOption[] = [{ id: "primary", name: "Primary organisation" }];
  try {
    const raw = localStorage.getItem("9xen-regulettee_sub_entities");
    if (!raw) return base;
    const parsed = JSON.parse(raw) as { id: string; name: string }[];
    return base.concat(parsed.filter(e => e && e.id && e.name).map(e => ({ id: e.id, name: e.name })));
  } catch { return base; }
}

async function api<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetchWithRetry(url, body === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

export const AiEstateShadowIt: React.FC = () => {
  const entities = useMemo(loadEntities, []);
  const [entityId, setEntityId] = useState(entities[0].id);
  const [tab, setTab] = useState<"shadow" | "estate" | "posture" | "assurance">("shadow");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Shadow IT
  const [rawLog, setRawLog] = useState("");
  const [assets, setAssets] = useState<ShadowAsset[]>([]);
  const [summary, setSummary] = useState<ShadowSummary | null>(null);
  const [busy, setBusy] = useState(false);

  // Estate scan
  const [source, setSource] = useState<"github" | "gitlab" | "website" | "files" | "erp">("github");
  const [erpVendor, setErpVendor] = useState<"salesforce" | "servicenow" | "dynamics365" | "rest">("salesforce");
  const [restPaths, setRestPaths] = useState("");
  const [restItemsKey, setRestItemsKey] = useState("value");
  const [connector, setConnector] = useState<ConnectorInfo | null>(null);
  const [target, setTarget] = useState("");
  const [token, setToken] = useState("");
  const [pasted, setPasted] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [coverage, setCoverage] = useState<{ totalFiles: number; scannable: number; scanned: number; oversizeSkipped: number; notReachedDueToCap: number; oversizeExamples: string[] } | null>(null);
  const [proposed, setProposed] = useState<Record<string, string>>({});

  const loadAssets = useCallback(async () => {
    try {
      const d = await api<{ assets: ShadowAsset[]; summary: ShadowSummary }>(`/api/v1/ai-estate/shadow-it/assets?entityId=${encodeURIComponent(entityId)}`);
      setAssets(d.assets); setSummary(d.summary);
    } catch (e) { setError((e as Error).message); }
  }, [entityId]);

  useEffect(() => { setResult(null); setError(null); setNotice(null); void loadAssets(); }, [loadAssets]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setError(null); setNotice(null);
    try { await fn(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  const analyze = () => run(async () => {
    const d = await api<{ analysis: { summary: string } }>("/api/v1/ai-estate/shadow-it/analyze", { entityId, rawLog });
    setNotice(d.analysis.summary); await loadAssets();
  });

  const proposeAsset = (a: ShadowAsset) => run(async () => {
    const d = await api<{ proposalId: string }>(`/api/v1/ai-estate/shadow-it/assets/${a.id}/fix`, {});
    setNotice(`Remediation for ${a.name} sent to the approval queue (${d.proposalId}).`); await loadAssets();
  });

  const decide = (a: ShadowAsset, status: "SANCTIONED" | "ACCEPTED") => run(async () => {
    await api(`/api/v1/ai-estate/shadow-it/assets/${a.id}/status`, { status });
    await loadAssets();
  });

  const scan = () => run(async () => {
    let d: { result: ScanResult; coverage?: NonNullable<typeof coverage> };
    if (source === "github") d = await api("/api/v1/ai-estate/scan/github", { entityId, repo: target.trim(), token: token || undefined });
    else if (source === "gitlab") d = await api("/api/v1/ai-estate/scan/gitlab", { entityId, project: target.trim(), token: token || undefined });
    else if (source === "website") d = await api("/api/v1/ai-estate/scan/website", { entityId, url: target.trim() });
    else if (source === "erp") {
      const e = await api<{ result: ScanResult; connector: ConnectorInfo; shadowIt?: { assets: unknown[] } | null }>("/api/v1/ai-estate/erp/scan", {
        entityId, vendor: erpVendor, instanceUrl: target.trim(), accessToken: token,
        restEndpoints: erpVendor === "rest" ? restPaths.split(/\r?\n/).map(x => x.trim()).filter(Boolean).map(path => ({ path, itemsKey: restItemsKey.trim() || undefined })) : undefined
      });
      setConnector(e.connector); setResult(e.result); setCoverage(null); setProposed({}); setToken("");
      if (e.shadowIt?.assets?.length) setNotice(`${e.shadowIt.assets.length} outbound endpoint(s) / connected app(s) were added to Shadow IT for this entity.`);
      await loadAssets();
      return;
    }
    else d = await api("/api/v1/ai-estate/scan", { entityId, files: [{ path: target.trim() || "pasted.txt", content: pasted }] });
    setConnector(null); setResult(d.result); setCoverage(d.coverage ?? null); setProposed({}); setToken("");
  });

  const proposeFinding = (f: Finding) => run(async () => {
    const d = await api<{ proposalId: string }>(`/api/v1/ai-estate/findings/${f.id}/fix`, {});
    setProposed(p => ({ ...p, [f.id]: d.proposalId }));
  });

  const entityName = entities.find(e => e.id === entityId)?.name || entityId;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Radar className="w-3 h-3" /> AI Violation Scanning & Shadow IT
          </div>
          <h1 className="text-2xl font-bold text-slate-900">AI Estate Scanner & Shadow IT Detection</h1>
          <p className="text-slate-500 mt-1 text-sm">Find AI-regulation and AI-security violations in repos, pipelines, infrastructure, websites, agents and ERP/CRM — and surface unsanctioned SaaS and AI use. Fixes go to the human-approval queue; nothing is changed automatically.</p>
        </div>
        <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1">
          Connected entity
          <select value={entityId} onChange={e => setEntityId(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
            {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </label>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {([["shadow", "Shadow IT & Shadow AI", Ghost], ["estate", "Estate violation scan", ShieldAlert], ["posture", "AI assets, posture & testing", Boxes], ["assurance", "Monitoring & assurance", Activity]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 border-b-2 -mb-px ${tab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {error && <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{error}</div>}
      {notice && <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />{notice}</div>}

      {tab === "shadow" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Usage evidence for {entityName}</h2>
              <button onClick={() => setRawLog(SAMPLE_LOG)} className="text-xs text-indigo-600 font-semibold hover:underline">Load sample</button>
            </div>
            <textarea value={rawLog} onChange={e => setRawLog(e.target.value)} rows={6} spellCheck={false}
              placeholder={'Paste egress/DNS, SSO or OAuth data — one "domain,users,SOURCE" per line, or a JSON array of observations.'}
              className="w-full border border-slate-300 rounded-lg p-3 text-xs font-mono" />
            <p className="text-[11px] text-slate-500">Sources: EGRESS_DNS, OAUTH_GRANT, SSO_APP_LOG, EXPENSE, CLOUD_ACCOUNT, CODE_SCAN. Services already in your Integrations registry are treated as sanctioned.</p>
            <button onClick={analyze} disabled={busy || !rawLog.trim()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg flex items-center gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radar className="w-4 h-4" />} Analyse
            </button>
          </div>

          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {([["Unsanctioned", summary.unsanctioned], ["Shadow AI", summary.shadowAi], ["Shadow IT", summary.shadowIt], ["Critical / High", `${summary.critical} / ${summary.high}`], ["Awaiting approval", summary.fixProposed]] as const).map(([k, v]) => (
                <div key={k} className="bg-white border border-slate-200 rounded-xl p-3"><div className="text-[11px] text-slate-500 font-semibold">{k}</div><div className="text-xl font-extrabold text-slate-900">{v}</div></div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {assets.length === 0 && <div className="text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center">No services recorded for this entity yet. Paste usage evidence above and run an analysis.</div>}
            {assets.map(a => (
              <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{a.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${SEV_STYLE[a.severity]}`}>{a.severity} · {a.risk_score}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">{a.verdict.replace("_", " ")}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{a.status.replace("_", " ")}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{a.identifier} · {a.users} user(s) · {a.sources.join(", ")} · residency {a.data_residency} · trains on data: {a.trains_on_data}</div>
                  </div>
                  {a.verdict !== "SANCTIONED" && (
                    <div className="flex gap-2 flex-wrap">
                      <button disabled={busy || a.status === "FIX_PROPOSED"} onClick={() => proposeAsset(a)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white disabled:opacity-50 flex items-center gap-1"><Send className="w-3 h-3" />{a.status === "FIX_PROPOSED" ? "Awaiting approval" : "Propose fix"}</button>
                      <button disabled={busy} onClick={() => decide(a, "SANCTIONED")} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700">Sanction</button>
                      <button disabled={busy} onClick={() => decide(a, "ACCEPTED")} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700">Accept risk</button>
                    </div>
                  )}
                </div>
                <ul className="mt-2 text-xs text-slate-600 list-disc pl-5 space-y-0.5">{a.risk_factors.map((r, i) => <li key={i}>{r}</li>)}</ul>
                <div className="mt-2 text-xs text-slate-500"><b>Recommended:</b> {a.recommended_fixes.map(f => f.action.replace(/_/g, " ").toLowerCase()).join(" → ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "posture" && <AiPostureConsole entityId={entityId} />}
      {tab === "assurance" && <AiAssuranceConsole entityId={entityId} />}

      {tab === "estate" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex gap-2 flex-wrap">
              {([["github", "GitHub", GitBranch], ["gitlab", "GitLab", GitBranch], ["website", "Website", Globe], ["files", "Paste file", FileCode2], ["erp", "ERP / CRM", Boxes]] as const).map(([id, label, Icon]) => (
                <button key={id} onClick={() => setSource(id)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 ${source === id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-300"}`}><Icon className="w-3.5 h-3.5" />{label}</button>
              ))}
            </div>
            <input value={target} onChange={e => setTarget(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder={source === "erp" ? ERP_HINT[erpVendor].url : source === "github" ? "owner/repository" : source === "gitlab" ? "group/project or numeric id" : source === "website" ? "https://www.example.com" : "file name, e.g. .github/workflows/ci.yml or main.tf"} />
            {(source === "github" || source === "gitlab") && (
              <div>
                <input type="password" autoComplete="off" value={token} onChange={e => setToken(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Access token (private repos only, optional)" />
                <p className="text-[11px] text-slate-500 mt-1">Used for this request only and never stored. Use a read-only, short-lived token.</p>
              </div>
            )}
            {source === "erp" && (
              <div className="space-y-2">
                <div className="flex gap-2 flex-wrap items-center">
                  <select value={erpVendor} onChange={e => setErpVendor(e.target.value as typeof erpVendor)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="salesforce">Salesforce</option><option value="servicenow">ServiceNow</option><option value="dynamics365">Microsoft Dynamics 365</option><option value="rest">Generic REST (SAP, NetSuite, Odoo…)</option>
                  </select>
                  <span className="text-[11px] text-slate-500">Read-only. Configuration metadata only — no customer or business records.</span>
                </div>
                <input type="password" autoComplete="off" value={token} onChange={e => setToken(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder={ERP_HINT[erpVendor].token} />
                {erpVendor === "rest" && (
                  <div className="space-y-2">
                    <textarea value={restPaths} onChange={e => setRestPaths(e.target.value)} rows={3} spellCheck={false} className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono" placeholder={"GET paths to read, one per line (max 10):\n/odata/v4/Settings\n/odata/v4/Integrations"} />
                    <input value={restItemsKey} onChange={e => setRestItemsKey(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-xs w-56" placeholder='Items key in the JSON (e.g. "value")' />
                  </div>
                )}
                <p className="text-[11px] text-slate-500">The token is sent only to the vendor's own domain, used for this request only, and never stored or logged. Use a read-only, short-lived token.</p>
              </div>
            )}
            {source === "files" && <textarea value={pasted} onChange={e => setPasted(e.target.value)} rows={8} spellCheck={false} className="w-full border border-slate-300 rounded-lg p-3 text-xs font-mono" placeholder="Paste a pipeline, Terraform, agent/MCP config, ERP/CRM config or source file…" />}
            <button onClick={scan} disabled={busy || (source !== "files" && !target.trim()) || (source === "files" && !pasted.trim()) || (source === "erp" && (token.length < 8 || (erpVendor === "rest" && !restPaths.trim())))} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg flex items-center gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />} Scan
            </button>
          </div>

          {result && (
            <div className="space-y-3">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-3xl font-extrabold text-slate-900">{result.riskScore}<span className="text-sm text-slate-400">/100</span></div>
                  <div className="text-sm text-slate-600">{result.summary}</div>
                </div>
                <div className="text-xs text-slate-500 mt-1">Rating {result.complianceRating.replace("_", " ")} · indicative penalty exposure €{result.totalPenaltyExposureEur.toLocaleString()} (static analysis; not legal advice)</div>
                {coverage && (
                  <div className={`text-xs mt-2 rounded-lg p-2 border ${coverage.scanned < coverage.scannable ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                    <b>Coverage:</b> scanned {coverage.scanned} of {coverage.scannable} scannable files ({coverage.totalFiles} in repo).
                    {coverage.notReachedDueToCap > 0 && ` ${coverage.notReachedDueToCap} not reached (per-scan cap — AI-related paths are scanned first).`}
                    {coverage.oversizeSkipped > 0 && ` ${coverage.oversizeSkipped} over the size limit and skipped${coverage.oversizeExamples.length ? `: ${coverage.oversizeExamples.join(", ")}` : ""}.`}
                    {coverage.scanned < coverage.scannable && " Findings are therefore a lower bound."}
                  </div>
                )}
                {connector && (
                  <div className="text-xs mt-2 rounded-lg p-2 border bg-slate-50 border-slate-200 text-slate-700 space-y-1">
                    <div><b>Connector:</b> {connector.vendor} · {connector.instanceHost} · {connector.itemsRead} configuration item(s) read</div>
                    {connector.coverage.map(c => (
                      <div key={c.id} className={c.status === "FAILED" ? "text-amber-800" : ""}>
                        {c.status === "OK" ? "✔" : c.status === "EMPTY" ? "○" : "⚠"} {c.label}: {c.status === "FAILED" ? `not read — ${c.error}` : `${c.items} item(s)${c.truncated ? " (truncated)" : ""}${c.error ? ` — ${c.error}` : ""}`}
                      </div>
                    ))}
                    {connector.coverage.some(c => c.status === "FAILED") && <div className="text-amber-800">Objects that could not be read are NOT covered: findings are a lower bound.</div>}
                    <div className="text-slate-500">{connector.verificationNote}</div>
                  </div>
                )}
                {result.aiProvidersDetected.length > 0 && <div className="text-xs text-slate-600 mt-2"><b>AI providers referenced:</b> {result.aiProvidersDetected.map(p => `${p.provider}${p.sanctioned ? "" : " (unsanctioned)"}`).join(", ")}</div>}
              </div>
              {result.findings.length === 0 && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-4">No violations matched the current rule set.</div>}
              {result.findings.map(f => (
                <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${SEV_STYLE[f.severity]}`}>{f.severity}</span>{" "}
                      <span className="font-bold text-slate-900 text-sm">{f.title}</span>
                      <div className="text-xs text-slate-500 mt-1">{f.ruleId} · {f.articleRef} · {f.path}:{f.line}</div>
                    </div>
                    <button disabled={busy || !!proposed[f.id]} onClick={() => proposeFinding(f)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white disabled:opacity-50 flex items-center gap-1"><Send className="w-3 h-3" />{proposed[f.id] ? "Queued" : "Propose fix"}</button>
                  </div>
                  <pre className="mt-2 bg-slate-50 border border-slate-200 rounded p-2 text-[11px] overflow-x-auto whitespace-pre-wrap">{f.evidence}</pre>
                  <p className="text-xs text-slate-700 mt-2"><b>Fix:</b> {f.remediation}</p>
                  {f.fixSnippet && <pre className="mt-2 bg-emerald-50 border border-emerald-200 rounded p-2 text-[11px] overflow-x-auto whitespace-pre-wrap">{f.fixSnippet}</pre>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiEstateShadowIt;
