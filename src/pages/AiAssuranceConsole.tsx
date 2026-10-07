import React, { useCallback, useEffect, useState } from "react";
import { fetchWithRetry } from "../lib/api-client";
import { Activity, ScrollText, Gauge, FlaskConical, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

async function api<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetchWithRetry(url, body === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}
const eur = (n: number) => `€${Math.round(n).toLocaleString()}`;
const chip = (s: string) => /STABLE|PASS|TRUSTED|VERIFIED|ALLOWED|PROMOTED|APPROVED/.test(s) ? "bg-emerald-100 text-emerald-800 border-emerald-200"
  : /WARN|REVIEW|WATCH|FLAGGED|REDACTED|HOLD|AWAITING|RESTRICTED|MODIFIED|INSUFFICIENT/.test(s) ? "bg-amber-100 text-amber-800 border-amber-200"
  : /DRIFT|FAIL|UNTRUSTED|BLOCKED|ROLLED|TAMPERED/.test(s) ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-slate-100 text-slate-700 border-slate-200";
const Badge = ({ s }: { s: string }) => <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${chip(s)}`}>{s.replace(/_/g, " ")}</span>;
const Card: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">{title && <h3 className="font-bold text-slate-900 text-sm">{title}</h3>}{children}</div>;

// deterministic sample data so the demo is reproducible
function lcg(seed: number) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }
const gauss = (r: () => number, m: number, sd: number) => m + sd * Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
function sampleDrift(): { ref: string; cur: string } {
  const r = lcg(11); const col = (n: number, m: number, sd: number) => Array.from({ length: n }, () => gauss(r, m, sd).toFixed(2)).join(", ");
  return { ref: `confidence: ${col(300, 0.8, 0.1)}\nresponse_length: ${col(300, 420, 80)}`, cur: `confidence: ${col(300, 0.68, 0.14)}\nresponse_length: ${col(300, 425, 82)}` };
}
function sampleFair(): string {
  const r = lcg(5); const rows: string[] = [];
  for (const [g, rate, n] of [["group_A", 0.55, 220], ["group_B", 0.33, 220], ["group_C", 0.52, 220]] as const) for (let i = 0; i < n; i++) rows.push(`${g},${r() < rate ? 1 : 0}`);
  return rows.join("\n");
}
function parseFeatures(text: string): Record<string, (number | string)[]> {
  const out: Record<string, (number | string)[]> = {};
  for (const line of text.split(/\r?\n/)) {
    const i = line.indexOf(":"); if (i < 1) continue;
    const vals = line.slice(i + 1).split(",").map(v => v.trim()).filter(Boolean).map(v => (Number.isFinite(Number(v)) ? Number(v) : v));
    if (vals.length) out[line.slice(0, i).trim()] = vals;
  }
  return out;
}

interface DriftFeature { feature: string; status: string; reason: string; nRef: number; nCur: number }
interface Fair { verdict: string; reasons: string[]; limits: string; groups: { group: string; n: number; rate: number; ci95: [number, number]; included: boolean }[]; comparisons: { group: string; disparateImpact: number; diCi95: [number, number] }[] }
interface TraceItem { traceId: string; seq: number; status: string; riskScore: number; needsReview: boolean; reviewed: boolean; topFactor: string | null; createdAt: string }
interface Explanation { summary: string; factors: { rule: string; effect: string; reason: string }[]; humanOversight: string; yourRights: string; limits: string }
interface TrustRes { score: number | null; confidence: number; tier: string; trend: string; smoothed: number | null; recommendedPolicy: string; caveat: string; components: { name: string; weight: number; effectiveWeight: number; score: number | null; basis: string }[] }
interface FinRes { expectedAnnualLossEur: number; medianEur: number; p90Eur: number; p95Eur: number; p99Eur: number; probabilityOfAnyEvent: number; scenarios: number; perScenario: { title: string; severity: string; annualProbability: number; expectedLossEur: number; share: number }[]; mitigations: { category: string; expectedLossReductionEur: number }[]; warnings: string[]; disclaimer: string }
interface Rollout { id: string; name: string; status: string; stage: string; patch: Record<string, unknown>; counters: { control: { n: number; blocked: number; fp: number }; canary: { n: number; blocked: number; fp: number } }; lastEvaluation?: { action: string; reasons: string[] }; history: { at: string; event: string; detail: string }[] }
interface Adaptive { seeds: number; singleOperator: { tested: number; evaded: number; rate: number }; chained: { tested: number; evaded: number; rate: number }; byOperator: { operator: string; tested: number; evaded: number; rate: number }[]; evasions: { text: string; lineage: string[] }[]; note: string }

export const AiAssuranceConsole: React.FC<{ entityId: string }> = ({ entityId }) => {
  const [sub, setSub] = useState<"monitor" | "trace" | "trust" | "canary">("monitor");
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const [notice, setNotice] = useState<string | null>(null);
  const run = async (fn: () => Promise<void>) => { setBusy(true); setError(null); setNotice(null); try { await fn(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } };

  // monitor
  const [systemId, setSystemId] = useState("demo-model");
  const [ref, setRef] = useState(""); const [cur, setCur] = useState(""); const [drift, setDrift] = useState<{ overall: string; features: DriftFeature[]; limits: string } | null>(null);
  const [fairText, setFairText] = useState(""); const [fair, setFair] = useState<Fair | null>(null);
  // traces
  const [tsys, setTsys] = useState<{ systemId: string; traces: number; needReview: number; reviewed: number }[]>([]); const [tsel, setTsel] = useState(""); const [traces, setTraces] = useState<TraceItem[]>([]);
  const [expl, setExpl] = useState<{ id: string; e: Explanation } | null>(null); const [chain, setChain] = useState<{ valid: boolean; checked: number; reason: string | null } | null>(null);
  const [ptext, setPtext] = useState(""); const [pres, setPres] = useState<{ status?: string; detail?: string; manifestId?: string; html?: string } | null>(null);
  // trust / financial
  const [assets, setAssets] = useState<{ id: string; name: string; riskClass: string }[]>([]); const [assetId, setAssetId] = useState(""); const [trust, setTrust] = useState<TrustRes | null>(null);
  const [turnover, setTurnover] = useState("100000000"); const [records, setRecords] = useState("0"); const [fin, setFin] = useState<FinRes | null>(null);
  // canary / redteam
  const [cname, setCname] = useState("Flag ambiguous injection signals"); const [cpatch, setCpatch] = useState('{"promptInjectionAction":"FLAG"}'); const [rollouts, setRollouts] = useState<Rollout[]>([]);
  const [rounds, setRounds] = useState("3"); const [adaptive, setAdaptive] = useState<Adaptive | null>(null);

  const loadTraceSystems = useCallback(async () => { try { const d = await api<{ systems: typeof tsys }>("/api/v1/ai-assurance/traces/systems"); setTsys(d.systems); } catch (e) { setError((e as Error).message); } }, []);
  const loadRollouts = useCallback(async () => { try { const d = await api<{ rollouts: Rollout[] }>("/api/v1/ai-assurance/canary"); setRollouts(d.rollouts); } catch (e) { setError((e as Error).message); } }, []);
  useEffect(() => { if (sub === "trace") void loadTraceSystems(); if (sub === "canary") void loadRollouts();
    if (sub === "trust") void api<{ assets: typeof assets }>(`/api/v1/ai-assurance/assets-for-trust?entityId=${encodeURIComponent(entityId)}`).then(d => { setAssets(d.assets); if (d.assets[0] && !assetId) setAssetId(d.assets[0].id); }).catch(e => setError((e as Error).message)); }, [sub, entityId]);

  const loadSample = () => { const s = sampleDrift(); setRef(s.ref); setCur(s.cur); setFairText(sampleFair()); setNotice("Sample loaded: 'confidence' has drifted, 'response_length' has not; group_B is selected far less often."); };
  const checkDrift = () => run(async () => { const d = await api<{ overall: string; features: DriftFeature[]; limits: string }>("/api/v1/ai-assurance/monitor/drift", { entityId, systemId, reference: parseFeatures(ref), current: parseFeatures(cur) }); setDrift(d); });
  const saveBaseline = () => run(async () => { await api("/api/v1/ai-assurance/monitor/baseline", { entityId, systemId, features: parseFeatures(ref) }); setNotice("Baseline stored — later checks can omit the reference."); });
  const checkFair = () => run(async () => {
    const records = fairText.split(/\r?\n/).map(l => l.split(",").map(s => s.trim())).filter(p => p.length >= 2 && p[0]).map(p => ({ group: p[0], outcome: Number(p[1]) as 0 | 1, ...(p[2] !== undefined && p[2] !== "" ? { label: Number(p[2]) as 0 | 1 } : {}) }));
    const d = await api<{ report: Fair }>("/api/v1/ai-assurance/monitor/fairness", { entityId, systemId, records }); setFair(d.report);
  });

  const openSystem = (id: string) => run(async () => { setTsel(id); setExpl(null); setChain(null); const d = await api<{ traces: TraceItem[] }>(`/api/v1/ai-assurance/traces?systemId=${encodeURIComponent(id)}&limit=30`); setTraces(d.traces); });
  const openTrace = (id: string) => run(async () => { const d = await api<{ explanation: Explanation }>(`/api/v1/ai-assurance/traces/${id}/explanation`); setExpl({ id, e: d.explanation }); });
  const verifyChain = () => run(async () => { const d = await api<{ result: { valid: boolean; checked: number; reason: string | null } }>("/api/v1/ai-assurance/traces/verify", { systemId: tsel }); setChain(d.result); });
  const review = (decision: string) => run(async () => { if (!expl) return; await api(`/api/v1/ai-assurance/traces/${expl.id}/review`, { decision }); setNotice("Human review recorded."); await openTrace(expl.id); await openSystem(tsel); });
  const mark = () => run(async () => { const d = await api<{ manifestId: string; html: string; alreadyRegistered: boolean }>("/api/v1/ai-assurance/provenance/mark", { text: ptext, systemId }); setPres({ manifestId: d.manifestId, html: d.html, status: d.alreadyRegistered ? "ALREADY_REGISTERED" : "REGISTERED" }); });
  const verifyProv = () => run(async () => { const d = await api<{ result: { status: string; detail: string; manifestId: string | null } }>("/api/v1/ai-assurance/provenance/verify", { text: ptext }); setPres({ status: d.result.status, detail: d.result.detail, manifestId: d.result.manifestId ?? undefined }); });

  const computeTrust = () => run(async () => { setTrust(await api<TrustRes>("/api/v1/ai-assurance/trust/compute", { entityId, assetId })); });
  const computeFin = () => run(async () => { setFin(await api<FinRes>("/api/v1/ai-assurance/financial-risk", { entityId, profile: { annualTurnoverEur: Number(turnover) || 0, nis2Class: "NONE" }, assumptions: Number(records) > 0 ? { recordsAtRisk: Number(records) } : undefined })); });

  const startCanary = () => run(async () => { let patch: unknown; try { patch = JSON.parse(cpatch); } catch { throw new Error("Policy patch must be valid JSON"); } await api("/api/v1/ai-assurance/canary", { name: cname, patch }); setNotice("Canary started at 5% of traffic."); await loadRollouts(); });
  const canaryAct = (id: string, act: "tick" | "approve" | "rollback") => run(async () => { await api(`/api/v1/ai-assurance/canary/${id}/${act}`, act === "rollback" ? { reason: "manual rollback from console" } : {}); await loadRollouts(); });
  const runAdaptive = () => run(async () => { setAdaptive(await api<Adaptive>("/api/v1/ai-assurance/redteam/adaptive", { rounds: Number(rounds) || 3 })); });

  const SubTab = ({ id, label, Icon }: { id: typeof sub; label: string; Icon: React.ElementType }) => (
    <button onClick={() => setSub(id)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 ${sub === id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-300"}`}><Icon className="w-3.5 h-3.5" />{label}</button>
  );
  const inp = "border border-slate-300 rounded-lg px-3 py-2 text-sm"; const btn = "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg";

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <SubTab id="monitor" label="Drift & fairness" Icon={Activity} /><SubTab id="trace" label="Decision traces & provenance" Icon={ScrollText} />
        <SubTab id="trust" label="Trust score & financial risk" Icon={Gauge} /><SubTab id="canary" label="Canary & adaptive red-team" Icon={FlaskConical} />
      </div>
      {error && <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{error}</div>}
      {notice && <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />{notice}</div>}

      {sub === "monitor" && (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap gap-2 items-center">
              <label className="text-xs font-semibold text-slate-600">System ID <input value={systemId} onChange={e => setSystemId(e.target.value)} className={`${inp} ml-2 w-48`} /></label>
              <button onClick={loadSample} className="text-xs text-indigo-600 font-semibold hover:underline">Load sample data</button>
            </div>
            <p className="text-[11px] text-slate-500">Use the AI asset's ID as the System ID so its trust score picks these results up. Only aggregates are stored — never your raw records.</p>
          </Card>
          <Card title="Data / behaviour drift">
            <div className="grid sm:grid-cols-2 gap-2">
              <textarea value={ref} onChange={e => setRef(e.target.value)} rows={4} spellCheck={false} placeholder={"Reference window — one feature per line:\nconfidence: 0.81, 0.79, 0.84, …"} className="border border-slate-300 rounded-lg p-2 text-xs font-mono" />
              <textarea value={cur} onChange={e => setCur(e.target.value)} rows={4} spellCheck={false} placeholder="Current window (same features)" className="border border-slate-300 rounded-lg p-2 text-xs font-mono" />
            </div>
            <div className="flex gap-2"><button disabled={busy || !cur.trim()} onClick={checkDrift} className={btn}>{busy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Check drift"}</button><button disabled={busy || !ref.trim()} onClick={saveBaseline} className="px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300">Store reference as baseline</button></div>
            {drift && <div className="pt-2 space-y-1"><div className="text-sm font-bold">Overall: <Badge s={drift.overall} /></div>
              {drift.features.map(f => <div key={f.feature} className="text-xs flex gap-3 border-t border-slate-100 py-1"><span className="font-mono w-36 shrink-0">{f.feature}</span><Badge s={f.status} /><span className="text-slate-600">{f.reason} · n={f.nRef}/{f.nCur}</span></div>)}
              <p className="text-[11px] text-slate-500">{drift.limits}</p></div>}
          </Card>
          <Card title="Bias & fairness">
            <textarea value={fairText} onChange={e => setFairText(e.target.value)} rows={4} spellCheck={false} placeholder={"One decision per line:  group,outcome[,label]\ngroup_A,1\ngroup_B,0,1"} className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono" />
            <button disabled={busy || !fairText.trim()} onClick={checkFair} className={btn}>Check fairness</button>
            {fair && <div className="pt-2 space-y-1"><div className="text-sm font-bold">Verdict: <Badge s={fair.verdict} /></div>
              <table className="w-full text-xs"><thead><tr className="text-left text-slate-500"><th>Group</th><th>n</th><th>Selection rate (95% CI)</th><th>Ratio vs reference (95% CI)</th></tr></thead><tbody>
                {fair.groups.map(g => { const c = fair.comparisons.find(x => x.group === g.group); return <tr key={g.group} className="border-t border-slate-100"><td className="py-1 font-semibold">{g.group}{!g.included && " (too small)"}</td><td>{g.n}</td><td>{(g.rate * 100).toFixed(1)}% ({(g.ci95[0] * 100).toFixed(0)}–{(g.ci95[1] * 100).toFixed(0)})</td><td>{c ? `${(c.disparateImpact * 100).toFixed(0)}% (${(c.diCi95[0] * 100).toFixed(0)}–${c.diCi95[1] === Infinity ? "∞" : (c.diCi95[1] * 100).toFixed(0)})` : "reference"}</td></tr>; })}
              </tbody></table>
              <ul className="text-xs text-slate-700 list-disc pl-5">{fair.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul><p className="text-[11px] text-slate-500">{fair.limits}</p></div>}
          </Card>
        </div>
      )}

      {sub === "trace" && (
        <div className="space-y-4">
          <Card title="Decision traces">
            <p className="text-[11px] text-slate-500">Every request through <code>/api/v1/ai-runtime/chat</code> is recorded automatically in a tamper-evident hash chain (digests only — no raw prompts). Set <code>agentId</code> to an AI asset ID to link traces to that asset.</p>
            <div className="flex flex-wrap gap-2">{tsys.length === 0 && <span className="text-xs text-slate-500">No traces yet — send traffic through the gateway.</span>}
              {tsys.map(s => <button key={s.systemId} onClick={() => openSystem(s.systemId)} className={`px-3 py-1.5 text-xs rounded-lg border ${tsel === s.systemId ? "bg-indigo-50 border-indigo-300 text-indigo-800" : "border-slate-300"}`}>{s.systemId} · {s.traces} traces · {s.reviewed}/{s.needReview} reviewed</button>)}</div>
            {tsel && <div className="flex gap-2 items-center"><button disabled={busy} onClick={verifyChain} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white disabled:opacity-50">Verify chain</button>{chain && <span className={`text-xs ${chain.valid ? "text-emerald-700" : "text-rose-700"}`}>{chain.valid ? `✔ ${chain.checked} traces verified — no edits, deletions or reordering.` : `✖ ${chain.reason}`}</span>}</div>}
            <div className="max-h-56 overflow-auto">{traces.map(t => <button key={t.traceId} onClick={() => openTrace(t.traceId)} className="w-full text-left text-xs border-t border-slate-100 py-1 flex gap-3 hover:bg-slate-50"><span className="w-10 text-slate-500">#{t.seq}</span><Badge s={t.status} /><span className="font-mono">{t.traceId}</span><span className="text-slate-500">risk {t.riskScore}{t.topFactor ? ` · ${t.topFactor}` : ""}{t.needsReview ? (t.reviewed ? " · reviewed" : " · needs review") : ""}</span></button>)}</div>
            {expl && <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-1 text-xs"><div className="font-bold text-slate-900 text-sm">{expl.e.summary}</div>
              <ul className="list-disc pl-5">{expl.e.factors.map((f, i) => <li key={i}><b>{f.effect}</b> — {f.reason}</li>)}</ul>
              <p>{expl.e.humanOversight}</p><p className="text-slate-600">{expl.e.yourRights}</p><p className="text-[11px] text-amber-800">{expl.e.limits}</p>
              <div className="flex gap-2 pt-1">{["APPROVED", "REJECTED", "ESCALATED"].map(d => <button key={d} disabled={busy} onClick={() => review(d)} className="px-2 py-1 text-[11px] font-bold rounded border border-slate-300 bg-white">{d.toLowerCase()}</button>)}<span className="text-[11px] text-slate-500 self-center">record a human review</span></div></div>}
          </Card>
          <Card title="AI-generated content provenance">
            <textarea value={ptext} onChange={e => setPtext(e.target.value)} rows={4} placeholder="Paste AI-generated text to register, or any text to check…" className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
            <div className="flex gap-2"><button disabled={busy || ptext.trim().length < 20} onClick={mark} className={btn}>Register as AI-generated</button><button disabled={busy || !ptext.trim()} onClick={verifyProv} className="px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300">Check provenance</button></div>
            {pres?.status && <div className="text-xs space-y-1"><Badge s={pres.status} /> {pres.detail && <span className="text-slate-700">{pres.detail}</span>}{pres.manifestId && <div className="text-slate-500">Manifest {pres.manifestId}</div>}{pres.html && <pre className="bg-slate-50 border border-slate-200 rounded p-2 overflow-x-auto">{pres.html}</pre>}</div>}
            <p className="text-[11px] text-slate-500">Recognises exact copies and copies with up to ~10% of words changed. Heavier rewriting is not recognised, and “no record” never means human-written. No robust watermark is claimed.</p>
          </Card>
        </div>
      )}

      {sub === "trust" && (
        <div className="space-y-4">
          <Card title="Adaptive trust score">
            <div className="flex flex-wrap gap-2 items-center"><select value={assetId} onChange={e => setAssetId(e.target.value)} className={inp}>{assets.length === 0 && <option value="">No AI assets — run an estate scan first</option>}{assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
              <button disabled={busy || !assetId} onClick={computeTrust} className={btn}>Compute</button></div>
            {trust && <div className="space-y-2 pt-1"><div className="flex items-end gap-3"><div className="text-3xl font-extrabold text-slate-900">{trust.score ?? "—"}<span className="text-sm text-slate-400">/100</span></div><Badge s={trust.tier} /><span className="text-xs text-slate-500">confidence {Math.round(trust.confidence * 100)}% · trend {trust.trend.toLowerCase()}{trust.smoothed !== null ? ` · smoothed ${trust.smoothed}` : ""}</span></div>
              {trust.components.map(c => <div key={c.name} className="text-xs"><div className="flex justify-between"><span className="font-semibold capitalize">{c.name} <span className="text-slate-400 font-normal">(weight {Math.round(c.weight * 100)}%{c.effectiveWeight < c.weight && c.score !== null ? ", stale → reduced" : ""})</span></span><span>{c.score ?? "no data"}</span></div><div className="h-1.5 bg-slate-100 rounded"><div className="h-1.5 rounded bg-indigo-500" style={{ width: `${c.score ?? 0}%` }} /></div><div className="text-slate-500">{c.basis}</div></div>)}
              <p className="text-xs text-slate-700"><b>Recommended policy:</b> {trust.recommendedPolicy}</p><p className="text-[11px] text-amber-800">{trust.caveat}</p></div>}
          </Card>
          <Card title="Business-impact & financial risk (Monte-Carlo)">
            <div className="flex flex-wrap gap-2 items-end"><label className="text-xs font-semibold text-slate-600 flex flex-col gap-1">Annual turnover (EUR)<input value={turnover} onChange={e => setTurnover(e.target.value.replace(/\D/g, ""))} className={inp} /></label>
              <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1">Personal records at risk (0 = unknown)<input value={records} onChange={e => setRecords(e.target.value.replace(/\D/g, ""))} className={inp} /></label>
              <button disabled={busy} onClick={computeFin} className={btn}>Simulate</button></div>
            {fin && <div className="space-y-2 pt-1"><div className="grid grid-cols-2 sm:grid-cols-5 gap-2">{([["Expected annual loss", fin.expectedAnnualLossEur], ["Median year", fin.medianEur], ["90th pct", fin.p90Eur], ["95th pct", fin.p95Eur], ["99th pct", fin.p99Eur]] as const).map(([k, v]) => <div key={k} className="bg-slate-50 border border-slate-200 rounded-lg p-2"><div className="text-[10px] text-slate-500 font-semibold">{k}</div><div className="text-sm font-extrabold">{eur(v)}</div></div>)}</div>
              <div className="text-xs text-slate-600">{fin.scenarios} loss scenario(s) · chance of at least one event in a year: {(fin.probabilityOfAnyEvent * 100).toFixed(0)}%</div>
              {fin.perScenario.slice(0, 5).map((s, i) => <div key={i} className="text-xs flex justify-between border-t border-slate-100 py-1"><span>{s.title.slice(0, 70)} <Badge s={s.severity} /></span><span>{eur(s.expectedLossEur)} ({(s.share * 100).toFixed(0)}%)</span></div>)}
              <div className="text-xs"><b>Biggest expected-loss reduction if fixed:</b> {fin.mitigations.slice(0, 3).map(m => `${m.category.replace(/_/g, " ").toLowerCase()} −${eur(m.expectedLossReductionEur)}`).join(" · ")}</div>
              <ul className="text-[11px] text-amber-800 list-disc pl-5">{fin.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul><p className="text-[11px] text-slate-500">{fin.disclaimer}</p></div>}
          </Card>
        </div>
      )}

      {sub === "canary" && (
        <div className="space-y-4">
          <Card title="Canary remediation (runtime-gateway policy changes)">
            <p className="text-[11px] text-slate-500">Stage a policy change on 5% → 25% → 50% of real traffic. It auto-advances only when healthy, rolls back on regressions, and needs a human approval to reach 100%. False positives count only when a reviewer labels a blocked request.</p>
            <div className="grid sm:grid-cols-2 gap-2"><input value={cname} onChange={e => setCname(e.target.value)} className={inp} /><input value={cpatch} onChange={e => setCpatch(e.target.value)} spellCheck={false} className={`${inp} font-mono text-xs`} /></div>
            <button disabled={busy} onClick={startCanary} className={btn}>Start canary at 5%</button>
            {rollouts.map(r => <div key={r.id} className="border border-slate-200 rounded-xl p-3 text-xs space-y-1"><div className="flex flex-wrap items-center gap-2"><b>{r.name}</b><span className="font-mono text-slate-500">{r.id}</span><Badge s={r.stage} /><Badge s={r.status} /></div>
              <div className="text-slate-600">patch {JSON.stringify(r.patch)} · canary {r.counters.canary.n} req ({r.counters.canary.blocked} blocked, {r.counters.canary.fp} labelled FP) · control {r.counters.control.n} req ({r.counters.control.blocked} blocked)</div>
              {r.lastEvaluation && <div className="text-slate-700">Last evaluation: <b>{r.lastEvaluation.action}</b> — {r.lastEvaluation.reasons[0]}</div>}
              {r.history.slice(-3).map((h, i) => <div key={i} className="text-slate-500">{new Date(h.at).toLocaleTimeString()} · {h.event} · {h.detail.slice(0, 110)}</div>)}
              {r.status === "ACTIVE" && <div className="flex gap-2 pt-1"><button disabled={busy} onClick={() => canaryAct(r.id, "tick")} className="px-2 py-1 text-[11px] font-bold rounded border border-slate-300">Evaluate now</button>{r.stage === "AWAITING_FULL_APPROVAL" && <button disabled={busy} onClick={() => canaryAct(r.id, "approve")} className="px-2 py-1 text-[11px] font-bold rounded bg-emerald-600 text-white">Approve 100%</button>}<button disabled={busy} onClick={() => canaryAct(r.id, "rollback")} className="px-2 py-1 text-[11px] font-bold rounded border border-rose-300 text-rose-700">Roll back</button></div>}</div>)}
          </Card>
          <Card title="Adaptive red-team agent (guard only)">
            <p className="text-[11px] text-slate-500">Mutates attack seeds and keeps the variants that slip past the prompt-injection guard. It does not change the guard, and mutated variants are not verified to still carry the attacker's intent.</p>
            <div className="flex gap-2 items-end"><label className="text-xs font-semibold text-slate-600 flex flex-col gap-1">Rounds<input value={rounds} onChange={e => setRounds(e.target.value.replace(/\D/g, ""))} className={`${inp} w-20`} /></label><button disabled={busy} onClick={runAdaptive} className={btn}>{busy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Run"}</button></div>
            {adaptive && <div className="space-y-2 pt-1 text-xs"><div className="font-bold text-sm">Single-operator evasion {(adaptive.singleOperator.rate * 100).toFixed(1)}% <span className="font-normal text-slate-500">({adaptive.singleOperator.evaded}/{adaptive.singleOperator.tested})</span> · chained {(adaptive.chained.rate * 100).toFixed(1)}% <span className="font-normal text-slate-500">({adaptive.chained.evaded}/{adaptive.chained.tested}, inflated by chaining)</span></div>
              <table className="w-full"><thead><tr className="text-left text-slate-500"><th>Operator (single-step)</th><th>Evaded</th></tr></thead><tbody>{adaptive.byOperator.map(o => <tr key={o.operator} className="border-t border-slate-100"><td className="py-0.5 font-mono">{o.operator}</td><td>{(o.rate * 100).toFixed(0)}% ({o.evaded}/{o.tested})</td></tr>)}</tbody></table>
              <div className="font-semibold">Sample evading payloads (review before adding to a corpus):</div>{adaptive.evasions.slice(0, 5).map((e, i) => <pre key={i} className="bg-slate-50 border border-slate-200 rounded p-1.5 overflow-x-auto whitespace-pre-wrap">{e.text.slice(0, 200)} <span className="text-slate-400">[{e.lineage.join(" + ")}]</span></pre>)}
              <p className="text-[11px] text-amber-800">{adaptive.note}</p></div>}
          </Card>
        </div>
      )}
    </div>
  );
};

export default AiAssuranceConsole;
