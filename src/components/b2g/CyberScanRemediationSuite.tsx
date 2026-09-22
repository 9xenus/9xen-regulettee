import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Radar, Wrench, Activity, RefreshCw, Play, RotateCcw, ListChecks,
  AlertTriangle, CheckCircle2, XCircle, Globe, Cpu, Zap, FileSearch, Bug, ShieldAlert,
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

const API = '/api/v1/cyber';

type Finding = {
  id: string;
  scan_id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  evidence: string;
  fix_action: string;
  fix_command: string;
  auto_fixable: number;
  auto_fix_status: string;
  auto_fixed_at: string | null;
  created_at: string;
};

type Scan = {
  id: string;
  target: string;
  scan_profile: string;
  status: string;
  raw_score: number;
  findings_count: number;
  auto_fixable_count: number;
  fixed_count: number;
  integrated_tools: string[];
  started_at: string;
};

export const CyberScanRemediationSuite: React.FC = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [remediation, setRemediation] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [notice, setNotice] = useState('');

  const [target, setTarget] = useState('gov-portal.sovcorp.eu');
  const [profile, setProfile] = useState('NIS2_CORE');
  const [activeTab, setActiveTab] = useState<'SCANNER' | 'FINDINGS' | 'REMEDIATION' | 'INTEGRATIONS'>('SCANNER');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, f, i, r] = await Promise.all(
        ['/scans', '/findings', '/integrations', '/remediation'].map(p =>
          fetchWithRetry(`${API}${p}`).then(res => res.json()).catch(() => null))
      );
      if (s?.success) setScans(s.scans || []);
      if (f?.success) setFindings(f.findings || []);
      if (i?.success) setIntegrations(i.integrations || []);
      if (r?.success) setRemediation(r.actions || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const runScan = async () => {
    if (!target.trim()) { setNotice('Target is required.'); return; }
    setStatus('Scanning with tool connectors…');
    setNotice('');
    try {
      const res = await fetchWithRetry(`${API}/scan`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, profile, targetType: 'domain' })
      });
      const d = await res.json();
      if (d.success) {
        setStatus(`Scan ${d.scan.id} completed · score ${d.scan.rawScore}/100 · ${d.scan.findingsFound} findings · tools: ${d.tools.map((t: any) => t.name).join(', ')}`);
        await fetchAll();
      } else { setStatus(d.error || 'Scan failed.'); }
    } catch (e: any) { setStatus(e.message || 'Scan failed.'); }
  };

  const autofix = async (id: string) => {
    try {
      const res = await fetchWithRetry(`${API}/findings/${id}/autofix`, { method: 'POST' });
      const d = await res.json();
      setStatus(d.message || d.error);
      await fetchAll();
    } catch (e: any) { setStatus(e.message || 'Autofix failed.'); }
  };

  const rollback = async (id: string) => {
    try {
      const res = await fetchWithRetry(`${API}/findings/${id}/rollback`, { method: 'POST' });
      const d = await res.json();
      setStatus(d.message || d.error);
      await fetchAll();
    } catch (e: any) { setStatus(e.message || 'Rollback failed.'); }
  };

  const sevColor = (s: string) => s === 'CRITICAL' ? 'bg-red-500' : s === 'HIGH' ? 'bg-orange-500' : s === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500';
  const sevBadge = (s: string) => (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-white ${s === 'CRITICAL' ? 'bg-red-600' : s === 'HIGH' ? 'bg-orange-600' : s === 'MEDIUM' ? 'bg-amber-600' : 'bg-emerald-600'}`}>{s}</span>
  );
  const statCard = (label: string, value: any, icon: any, cls: string) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
      {React.createElement(icon, { className: `w-5 h-5 ${cls}` })}
      <div>
        <div className="text-xl font-bold text-white leading-none">{value ?? '–'}</div>
        <div className="text-[10px] font-mono text-slate-400 uppercase mt-1 tracking-wide">{label}</div>
      </div>
    </div>
  );

  const open = findings.filter(f => f.auto_fix_status === 'PENDING').length;
  const fixed = findings.filter(f => f.auto_fix_status === 'FIXED').length;
  const critical = findings.filter(f => f.severity === 'CRITICAL').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">Cybersecurity Scan & Auto-Fix / Remediation Suite</h3>
            <p className="text-sm text-slate-400">Tool-integrated detection → automated remediation with rollback snapshots. NIS2 · DORA · GDPR DPIA · AI Act aligned.</p>
          </div>
        </div>
        <button onClick={fetchAll} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer" title="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCard('Scans Run', scans.length, Radar, 'text-cyan-400')}
        {statCard('Open Findings', open, AlertTriangle, 'text-amber-400')}
        {statCard('Auto-Fixed', fixed, CheckCircle2, 'text-emerald-400')}
        {statCard('Critical', critical, Bug, 'text-red-400')}
      </div>

      {/* Connectors strip */}
      <div className="flex flex-wrap gap-1.5">
        {integrations.map((t: any) => (
          <span key={t.id} className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border ${t.status === 'STABLE' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800' : 'bg-amber-950/40 text-amber-300 border-amber-800'}`}>
            <Cpu className="w-3 h-3 inline mr-1" />{t.name} <span className="opacity-60">· {t.category}</span>
          </span>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/70">
        {(['SCANNER', 'FINDINGS', 'REMEDIATION', 'INTEGRATIONS'] as const).map(tab => {
          const Icon = tab === 'SCANNER' ? Radar : tab === 'FINDINGS' ? FileSearch : tab === 'REMEDIATION' ? Wrench : ListChecks;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === tab ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}>
              <Icon className="w-3.5 h-3.5" />{tab === 'SCANNER' ? 'Scanner & Detect' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      {status && <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/30 border border-emerald-800 rounded-lg px-3 py-2">{status}</div>}
      {notice && <div className="text-[11px] font-mono text-amber-300 bg-amber-950/30 border border-amber-800 rounded-lg px-3 py-2">{notice}</div>}

      {/* TAB: SCANNER */}
      {activeTab === 'SCANNER' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/70">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Scan Target (domain / IP)</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input value={target} onChange={e => setTarget(e.target.value)} placeholder="e.g. gov-portal.sovcorp.eu"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="sm:w-56">
                <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Conformity Profile</label>
                <select value={profile} onChange={e => setProfile(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none">
                  <option value="NIS2_CORE">NIS2 Core (SecOps)</option>
                  <option value="DORA_ICT">DORA ICT Risk</option>
                  <option value="GDPR_DPIA">GDPR DPIA</option>
                  <option value="AI_ACT">EU AI Act</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={runScan} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors">
                  <Play className="w-4 h-4" /> Run Scan
                </button>
              </div>
            </div>
          </div>

          {/* Past scans table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2"><Radar className="w-4 h-4 text-cyan-400" /> Scan History</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="px-4 py-2.5">Scan ID</th><th className="px-4 py-2.5">Target</th><th className="px-4 py-2.5">Profile</th><th className="px-4 py-2.5">Score</th><th className="px-4 py-2.5">Findings</th><th className="px-4 py-2.5">Auto-Fixed</th><th className="px-4 py-2.5">Tools</th><th className="px-4 py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {scans.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 text-cyan-300 font-bold">{s.id}</td>
                      <td className="px-4 py-2.5 text-white">{s.target}</td>
                      <td className="px-4 py-2.5 text-slate-400">{s.scan_profile}</td>
                      <td className="px-4 py-2.5"><span className={`font-bold ${s.raw_score >= 60 ? 'text-red-400' : s.raw_score >= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{s.raw_score}/100</span></td>
                      <td className="px-4 py-2.5 text-slate-300">{s.findings_count}</td>
                      <td className="px-4 py-2.5 text-emerald-400">{s.fixed_count}</td>
                      <td className="px-4 py-2.5 text-slate-500 truncate max-w-[180px]">{(s.integrated_tools || []).join(', ')}</td>
                      <td className="px-4 py-2.5 text-slate-500">{s.started_at}</td>
                    </tr>
                  ))}
                  {scans.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-500">No scans yet — run a scan above.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FINDINGS */}
      {activeTab === 'FINDINGS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2"><FileSearch className="w-4 h-4 text-amber-400" /> Detection Findings Ledger</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="px-4 py-2.5">Severity</th><th className="px-4 py-2.5">Category</th><th className="px-4 py-2.5">Title</th><th className="px-4 py-2.5">Fix</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {findings.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-2.5">{sevBadge(f.severity)}</td>
                    <td className="px-4 py-2.5 text-cyan-300">{f.category}</td>
                    <td className="px-4 py-2.5 text-white max-w-[260px]">
                      <div className="truncate font-semibold">{f.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{f.fix_action}</div>
                    </td>
                    <td className="px-4 py-2.5 text-emerald-300 max-w-[140px] truncate">{f.fix_command || '—'}</td>
                    <td className="px-4 py-2.5">
                      {f.auto_fix_status === 'FIXED' ? <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[9px] font-bold">FIXED</span>
                        : f.auto_fix_status === 'ROLLED_BACK' ? <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[9px] font-bold">ROLLED BACK</span>
                        : <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[9px] font-bold">OPEN</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      {f.auto_fixable === 1 && f.auto_fix_status === 'PENDING' && (
                        <button onClick={() => autofix(f.id)} className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white rounded-lg cursor-pointer transition-colors flex items-center gap-1"><Wrench className="w-3 h-3" /> Auto-Fix</button>
                      )}
                      {f.auto_fix_status === 'FIXED' && (
                        <button onClick={() => rollback(f.id)} className="px-2.5 py-1.5 bg-slate-700 hover:bg-amber-600 text-[10px] font-bold text-white rounded-lg cursor-pointer transition-colors flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Rollback</button>
                      )}
                    </td>
                  </tr>
                ))}
                {findings.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No findings recorded.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: REMEDIATION */}
      {activeTab === 'REMEDIATION' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Auto-Fix / Remediation Action Log</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="px-4 py-2.5">Action ID</th><th className="px-4 py-2.5">Scan</th><th className="px-4 py-2.5">Finding</th><th className="px-4 py-2.5">Action</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Command</th><th className="px-4 py-2.5">Executed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {remediation.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-2.5 text-violet-300 font-bold">{r.id}</td>
                    <td className="px-4 py-2.5 text-slate-400">{r.scan_id}</td>
                    <td className="px-4 py-2.5 text-slate-300">{r.finding_id}</td>
                    <td className="px-4 py-2.5 text-white">{r.action}</td>
                    <td className="px-4 py-2.5">{r.status === 'APPLIED' ? <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[9px] font-bold">APPLIED</span> : <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[9px] font-bold">{r.status}</span>}</td>
                    <td className="px-4 py-2.5 text-slate-500 truncate max-w-[260px]">{r.command || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-500">{r.executed_at}</td>
                  </tr>
                ))}
                {remediation.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No remediation actions yet — apply an auto-fix in the Findings tab.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: INTEGRATIONS */}
      {activeTab === 'INTEGRATIONS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {integrations.map((t) => (
            <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.status === 'STABLE' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                    <Cpu className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{t.category}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${t.status === 'STABLE' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>{t.status}</span>
              </div>
              <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">{t.description}</p>
              <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500">License: {t.license}</span>
                {t.autoFixSupport
                  ? <span className="flex items-center gap-1 text-emerald-400"><Zap className="w-3 h-3" />Auto-Fix</span>
                  : <span className="flex items-center gap-1 text-slate-500"><ShieldAlert className="w-3 h-3" />Detect-only</span>}
              </div>
            </div>
          ))}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center text-slate-500 border-dashed">
            <Bug className="w-6 h-6 text-slate-600 mb-2" />
            <div className="text-xs">8 detection connectors registered</div>
            <div className="text-[10px] font-mono text-slate-600 mt-1">VULN · SAST · DAST · SUPPLY-CHAIN · SECRETS</div>
          </div>
        </div>
      )}
    </div>
  );
};