import React, { useState, useEffect } from 'react';
import {
  Cpu, Database, Target, ShieldCheck, Crosshair, FileText, Copy, CheckCircle2, RotateCcw,
  RefreshCw, Play, Loader2, Activity, AlertTriangle, MapPin, ScanSearch, Layers, Boxes, GitBranch, Terminal, BadgeCheck, Flame, Bug, KeyRound, Lock, Wifi, Cloud, FileSearch, Binoculars, Settings2, Smartphone,
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

const API = '/api/v1/national-scan';

const CATEGORY_ICONS: Record<string, any> = {
  'Vulnerability & Template Engine': Crosshair,
  'Network & Port Discovery': Wifi,
  'Vulnerability Assessment': ScanSearch,
  'DAST / Web App': Bug,
  'Container & Image': Layers,
  'Container Vulnerability': Boxes,
  'SAST / Code': FileSearch,
  'Secrets & Credentials': KeyRound,
  'SCA / Open-Source': GitBranch,
  'Detection & Monitoring': Activity,
  'Runtime & Cloud Native': Cloud,
  'Network IDS': Wifi,
  'Mobile App': Smartphone,
  'Host Hardening': Lock,
  'Cloud & Kubernetes': Cloud,
  'Recon / Attack Surface': MapPin,
  'Recon / OSINT': Binoculars,
  'Threat Intel / Internet Scan': Target,
  'Web Server': Terminal,
  'Web / Injection': Bug,
  'Web / Content Discovery': FileSearch,
  'Password & Crypto Audit': Lock,
  'Exploit & Validation': Crosshair,
  'Network / Packet Analysis': Activity,
  'Malware / Binary Analysis': Bug,
  'Crypto & TLS': Lock,
  'CodeQL / Dependabot': GitBranch,
  'SIEM / Threat Intel': Activity,
  'Vulnerability Orchestration': Boxes,
  'Hardware / FPGA': Cpu,
  'Reverse Engineering': Terminal,
};

export const NationalIntelWarroom: React.FC = () => {
  const [tab, setTab] = useState<'LIBRARY' | 'SCAN' | 'REPORTS'>('SCAN');
  const [library, setLibrary] = useState<any[]>([]);
  const [signatures, setSignatures] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activeScan, setActiveScan] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [remediations, setRemediations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('');
  const [reportContent, setReportContent] = useState('');

  // form
  const [target, setTarget] = useState('regulettee-portal.acme-sov.eu');
  const [profile, setProfile] = useState('NIS2_CORE');
  const [intensity, setIntensity] = useState('DEEP');
  const [aiMode, setAiMode] = useState(true);

  const [filterCat, setFilterCat] = useState('ALL');

  const loadLibrary = async () => {
    try {
      const res = await fetchWithRetry(`${API}/library`);
      const d = await res.json();
      if (d.success) setLibrary(d.tools || []);
    } catch { /* ignore */ }
    try {
      const res = await fetchWithRetry(`${API}/library/signatures`);
      const d = await res.json();
      if (d.success) setSignatures(d.signatures || []);
    } catch { /* ignore */ }
  };

  const loadScans = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry(`${API}/scans`);
      const d = await res.json();
      if (d.success) setScans(d.scans || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => {
    loadLibrary(); loadScans();
    try { fetchWithRetry(`${API}/reports`).then(r => r.json()).then(d => d.success && setReports(d.reports || [])); } catch { /* ignore */ }
  }, []);

  const runScan = async () => {
    setScanning(true); setStatus('Orchestrating national scanning toolchain…'); setActiveScan(null); setFindings([]);
    try {
      const res = await fetchWithRetry(`${API}/scan`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, profile, intensity, ai: aiMode })
      });
      const d = await res.json();
      if (d.success) {
        setActiveScan(d.run); setFindings(d.findings || []);
        setStatus(`Scan complete — ${d.run.riskScore}/100 risk · ${d.findings.length} findings · ${d.toolManifest.length} tools orchestrated`);
        await loadScans();
      } else { setStatus(d.error || 'Scan failed.'); }
    } catch (e: any) { setStatus(e.message || 'Scan failed.'); } finally { setScanning(false); }
  };

  const loadScan = async (id: string) => {
    try {
      const res = await fetchWithRetry(`${API}/scans/${id}`);
      const d = await res.json();
      if (d.success) { setActiveScan(d.run); setFindings(d.findings || []); setRemediations(d.remediations || []); setStatus(''); }
    } catch (e) { /* ignore */ }
  };

  const remediate = async (fid: string) => {
    try {
      const res = await fetchWithRetry(`${API}/findings/${fid}/remediate`, { method: 'POST' });
      const d = await res.json();
      setStatus(d.message || d.error);
      if (d.success && activeScan) { await loadScan(activeScan.id); await loadScans(); }
    } catch (e: any) { setStatus(e.message || 'Remediation failed.'); }
  };

  const rollback = async (actionId: string) => {
    try {
      const res = await fetchWithRetry(`${API}/remediate/rollback/${actionId}`, { method: 'POST' });
      const d = await res.json();
      setStatus(d.message || d.error);
      if (activeScan) await loadScan(activeScan.id);
    } catch (e: any) { setStatus(e.message || 'Rollback failed.'); }
  };

  const genReport = async (scanId: string, format: string) => {
    try {
      const res = await fetchWithRetry(`${API}/reports/${scanId}/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ format }) });
      const d = await res.json();
      setStatus(d.success ? `Report generated (${format}) — hash ${d.report.hash.slice(0, 16)}…` : d.error);
      if (d.success) setReportContent(d.report.content);
      try { const r = await fetchWithRetry(`${API}/reports`).then(r2 => r2.json()); if (r.success) setReports(r.reports || []); } catch { /* ignore */ }
    } catch (e: any) { setStatus(e.message || 'Report generation failed.'); }
  };

  const sevBadge = (s: string) => (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-white ${s === 'CRITICAL' ? 'bg-red-600' : s === 'HIGH' ? 'bg-orange-600' : s === 'MEDIUM' ? 'bg-amber-600' : 'bg-emerald-600'}`}>{s}</span>
  );

  const cats = library.length ? ['ALL', ...Array.from(new Set(library.map(t => t.category)))] : ['ALL'];
  const filteredLib = filterCat === 'ALL' ? library : library.filter(t => t.category === filterCat);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20"><Cpu className="w-6 h-6" /></div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">National Scanning Engine — Defensive Intel War-Room</h3>
            <p className="text-sm text-slate-400">33-tool orchestration library · 25 signatures catalog · detection → remediation → rollback → sealed reports · coverage matrix</p>
          </div>
        </div>
        <button onClick={() => { loadLibrary(); loadScans(); }} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>

      {status && <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/30 border border-cyan-800 rounded-lg px-3 py-2">{status}</div>}

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/40 border border-slate-700/60 rounded-xl p-2">
        {[
          { id: 'LIBRARY', label: `Tool & Signature Library (${library.length})`, icon: Database },
          { id: 'SCAN', label: 'Orchestrate Scan', icon: Target },
          { id: 'REPORTS', label: `Intel Reports (${reports.length})`, icon: FileText },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${tab === t.id ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}>
              <Icon className="w-3.5 h-3.5" />{t.label}
            </button>
          );
        })}
      </div>

      {/* SCAN TAB */}
      {tab === 'SCAN' && (
        <div className="space-y-6">
          {/* Launch form */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Scan Target</label>
              <input value={target} onChange={e => setTarget(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Regulatory Profile</label>
              <select value={profile} onChange={e => setProfile(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none">
                {['NIS2_CORE', 'DORA_ICT', 'GDPR_DPIA', 'AI_ACT', 'HIPAA', 'PCI_DSS', 'ISO_27001'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Intensity</label>
              <select value={intensity} onChange={e => setIntensity(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none">
                {['LIGHT', 'STANDARD', 'DEEP'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">AI-Enriched Mode</label>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => setAiMode(!aiMode)} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${aiMode ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${aiMode ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className={`text-[10px] font-mono ${aiMode ? 'text-emerald-300' : 'text-slate-500'}`}>{aiMode ? 'ON' : 'OFF'}</span>
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={runScan} disabled={scanning} className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-sm font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors">
                {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Launch Scan
              </button>
            </div>
          </div>

          {/* Active scan summary */}
          {activeScan && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/70">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <div className="text-xs font-bold text-white flex items-center gap-2"><Target className="w-4 h-4 text-cyan-400" />{activeScan.target} <span className="text-slate-500">· {activeScan.profile} · {activeScan.id}</span></div>
                {activeScan.riskScore >= 60
                  ? <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 text-[10px] font-bold">HIGH RISK · {activeScan.riskScore}/100</span>
                  : activeScan.riskScore >= 35
                    ? <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] font-bold">ELEVATED · {activeScan.riskScore}/100</span>
                    : <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold">LOW RISK · {activeScan.riskScore}/100</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                <div className="bg-slate-900 rounded-lg p-2.5 text-center"><div className="text-[9px] font-mono uppercase text-slate-500">Findings</div><div className="text-lg font-bold text-white">{activeScan.findings_count}</div></div>
                <div className="bg-slate-900 rounded-lg p-2.5 text-center"><div className="text-[9px] font-mono uppercase text-slate-500">Critical</div><div className="text-lg font-bold text-red-400">{activeScan.critical_count}</div></div>
                <div className="bg-slate-900 rounded-lg p-2.5 text-center"><div className="text-[9px] font-mono uppercase text-slate-500">High</div><div className="text-lg font-bold text-orange-400">{activeScan.high_count}</div></div>
                <div className="bg-slate-900 rounded-lg p-2.5 text-center"><div className="text-[9px] font-mono uppercase text-slate-500">Medium</div><div className="text-lg font-bold text-amber-400">{activeScan.medium_count}</div></div>
                <div className="bg-slate-900 rounded-lg p-2.5 text-center"><div className="text-[9px] font-mono uppercase text-slate-500">Tools</div><div className="text-lg font-bold text-cyan-400">{activeScan.tool_count}</div></div>
                <div className="bg-slate-900 rounded-lg p-2.5 text-center"><div className="text-[9px] font-mono uppercase text-slate-500">Signatures</div><div className="text-lg font-bold text-violet-400">{activeScan.signature_count}</div></div>
              </div>

              {/* Coverage matrix */}
              {activeScan.coverage && activeScan.coverage.length > 0 && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {activeScan.coverage.map((c: any) => (
                    <div key={c.profile} className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">{c.profile}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.status === 'COMPLIANT' ? 'bg-emerald-950 text-emerald-300' : c.status === 'PARTIAL' ? 'bg-amber-950 text-amber-300' : 'bg-red-950 text-red-300'}`}>{c.status}</span>
                      </div>
                      <div className="mt-1.5 text-11px font-bold text-white">{c.coveragePct}% <span className="text-[9px] text-slate-500 font-normal">coverage · {c.regulation}</span></div>
                      <div className="h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden"><div className={`h-full rounded-full ${c.coveragePct >= 75 ? 'bg-emerald-500' : c.coveragePct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${c.coveragePct}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tool manifest */}
              {activeScan.toolManifest && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {activeScan.toolManifest.map((t: string) => {
                    const tool = library.find(l => l.id === t);
                    return <span key={t} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[9px] font-mono text-cyan-300">{tool?.name || t}</span>;
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {['MARKDOWN', 'JSON', 'CSV'].map(f => (
                  <button key={f} onClick={() => genReport(activeScan.id, f)} className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                    <FileText className="w-3 h-3" />Generate {f} Report
                  </button>
                ))}
              </div>
              {reportContent && (
                <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  <pre className="p-3 text-[10px] font-mono text-slate-300 whitespace-pre-wrap max-h-[280px] overflow-y-auto">{reportContent}</pre>
                </div>
              )}

              {/* Findings table */}
              {findings.length > 0 && (
                <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2"><Flame className="w-4 h-4 text-cyan-400" /> Detected Findings — Remediation & Rollback</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                          <th className="px-4 py-2.5">Finding</th><th className="px-4 py-2.5">CVE/CWE</th><th className="px-4 py-2.5">Severity</th><th className="px-4 py-2.5">CVSS</th><th className="px-4 py-2.5">Compliance</th><th className="px-4 py-2.5">Tool</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {findings.map(f => (
                          <tr key={f.id} className="hover:bg-slate-800/30 align-top">
                            <td className="px-4 py-2.5 max-w-[260px]">
                              <div className="text-cyan-300 font-bold">{f.title}</div>
                              <div className="text-[9px] text-slate-500 mt-0.5">{f.category}</div>
                            </td>
                            <td className="px-4 py-2.5 text-slate-300 text-[10px]">{f.cve || '—'}<div className="text-slate-500">{f.cwe}</div></td>
                            <td className="px-4 py-2.5">{sevBadge(f.severity)}</td>
                            <td className="px-4 py-2.5 text-slate-300 font-bold">{f.cvss}</td>
                            <td className="px-4 py-2.5 text-slate-400 text-[10px]">{f.compliance_ref}</td>
                            <td className="px-4 py-2.5 text-[10px] text-cyan-400">{library.find(t => t.id === f.tool_id)?.name || f.tool_id}</td>
                            <td className="px-4 py-2.5">{f.remediation_status === 'REMEDIATED' ? <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[9px] font-bold">REMEDIATED</span> : <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[9px] font-bold">OPEN</span>}</td>
                            <td className="px-4 py-2.5">
                              {f.remediation_status === 'OPEN' ? (
                                <button onClick={() => remediate(f.id)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-[9px] font-bold text-white rounded-lg cursor-pointer flex items-center gap-1 transition-colors"><CheckCircle2 className="w-3 h-3" />Auto-Remediate</button>
                              ) : <span className="text-emerald-400 text-[9px] flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Fixed</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Remediation history */}
              {remediations.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {remediations.map(r => (
                    <div key={r.id} className="flex items-center gap-2 text-[11px] bg-slate-900 rounded-lg px-3 py-2 border border-slate-800">
                      <span className={`w-2 h-2 rounded-full ${r.status === 'APPLIED' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span className="font-mono text-slate-300 flex-1 truncate">{r.title}</span>
                      <span className={`text-[10px] font-bold ${r.status === 'APPLIED' ? 'text-emerald-400' : 'text-red-400'}`}>{r.status}</span>
                      <span className="text-[9px] text-slate-500">{r.rollback_ref}</span>
                      {r.rollback_ref !== 'N/A' && r.status === 'APPLIED' && (
                        <button onClick={() => rollback(r.id)} className="px-2 py-0.5 bg-slate-700 hover:bg-red-600 text-[9px] font-bold text-white rounded-md cursor-pointer flex items-center gap-1 transition-colors"><RotateCcw className="w-3 h-3" />Rollback</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Scan history */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" /> Scan Run History</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="px-4 py-2.5">Run</th><th className="px-4 py-2.5">Target</th><th className="px-4 py-2.5">Profile</th><th className="px-4 py-2.5">Risk</th><th className="px-4 py-2.5">Findings</th><th className="px-4 py-2.5">Crit</th><th className="px-4 py-2.5">High</th><th className="px-4 py-2.5">Tools</th><th className="px-4 py-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {scans.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/30 cursor-pointer" onClick={() => { loadScan(s.id); setTab('SCAN'); }}>
                      <td className="px-4 py-2.5 text-cyan-300 font-bold">{s.id}</td>
                      <td className="px-4 py-2.5 text-white">{s.target}</td>
                      <td className="px-4 py-2.5 text-slate-400">{s.profile}</td>
                      <td className={`px-4 py-2.5 font-bold ${s.risk_score >= 60 ? 'text-red-400' : s.risk_score >= 35 ? 'text-amber-400' : 'text-emerald-400'}`}>{s.risk_score}/100</td>
                      <td className="px-4 py-2.5 text-slate-300">{s.findings_count}</td>
                      <td className="px-4 py-2.5 text-red-400">{s.critical_count}</td>
                      <td className="px-4 py-2.5 text-orange-400">{s.high_count}</td>
                      <td className="px-4 py-2.5 text-cyan-400">{s.tool_count}</td>
                      <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}><button onClick={() => { loadScan(s.id); setTab('SCAN'); }} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-[9px] font-bold text-white rounded-lg cursor-pointer transition-colors">Open</button></td>
                    </tr>
                  ))}
                  {scans.length === 0 && <tr><td colSpan={9} className="px-4 py-6 text-center text-slate-500">No scans yet — launch the engine above.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LIBRARY TAB */}
      {tab === 'LIBRARY' && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-1.5">
            {cats.map(c => (
              <button key={c} onClick={() => setFilterCat(c)} className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border cursor-pointer transition-colors ${filterCat === c ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}>{c === 'ALL' ? c : `${c} (${library.filter(t => t.category === c).length})`}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredLib.map(t => {
              const Icon = CATEGORY_ICONS[t.category] || Settings2;
              return (
                <div key={t.id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><Icon className="w-4 h-4" /></div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">{t.name}</div>
                      <div className="text-[9px] font-mono text-slate-500">{t.category}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-snug">{t.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.capabilities.map((c: string, i: number) => <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-cyan-300">{c}</span>)}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">Accuracy <strong className="text-emerald-400">{t.accuracy}%</strong> · Speed <strong className="text-cyan-400">{t.scanSpeed}</strong></span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] text-slate-300">{t.id}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Signature catalog */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400" /> Detection Signature Catalog ({signatures.length})</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="px-4 py-2.5">Sig</th><th className="px-4 py-2.5">Title</th><th className="px-4 py-2.5">Category</th><th className="px-4 py-2.5">CVE/CWE</th><th className="px-4 py-2.5">Severity</th><th className="px-4 py-2.5">CVSS</th><th className="px-4 py-2.5">Compliance Ref</th><th className="px-4 py-2.5">Tool</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {signatures.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 text-orange-300 font-bold">{s.id}</td>
                      <td className="px-4 py-2.5 text-white max-w-[260px]">{s.title}</td>
                      <td className="px-4 py-2.5 text-slate-400">{s.category}</td>
                      <td className="px-4 py-2.5 text-slate-300 text-[10px]">{s.cve || '—'}<div className="text-slate-500">{s.cwe}</div></td>
                      <td className="px-4 py-2.5">{sevBadge(s.severity)}</td>
                      <td className="px-4 py-2.5 text-slate-300 font-bold">{s.cvss}</td>
                      <td className="px-4 py-2.5 text-slate-400 text-[10px]">{s.complianceRef}</td>
                      <td className="px-4 py-2.5 text-cyan-400">{library.find(t => t.id === s.toolId)?.name || s.toolId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {tab === 'REPORTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2"><FileText className="w-4 h-4 text-cyan-400" /> Sealed Intel Reports</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="px-4 py-2.5">Report</th><th className="px-4 py-2.5">Scan</th><th className="px-4 py-2.5">Format</th><th className="px-4 py-2.5">SHA-256 Seal</th><th className="px-4 py-2.5">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-2.5 text-cyan-300 font-bold">{r.id}</td>
                    <td className="px-4 py-2.5 text-slate-300">{r.scan_id}</td>
                    <td className="px-4 py-2.5 text-slate-400">{r.format}</td>
                    <td className="px-4 py-2.5 text-emerald-400">{r.report_hash.slice(0, 24)}…</td>
                    <td className="px-4 py-2.5 text-slate-500">{r.created_at}</td>
                  </tr>
                ))}
                {reports.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No reports yet — run a scan and generate one.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};