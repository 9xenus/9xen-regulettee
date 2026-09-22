import React, { useState, useEffect, useCallback } from 'react';
import {
  Landmark, RefreshCw, Radar, FileWarning, ScrollText, Loader2, Gavel,
  ShieldCheck, Activity, AlertTriangle,
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';
import { B2gEnforcementPipeline } from './B2gEnforcementPipeline';

const API = '/api/v1/national-scan';

type ScanRun = { id: string; target: string; profile: string; status: string; risk_score?: number; findings_count?: number; started_at?: string; completed_at?: string };
type Notice = { id: string; notice_number?: string; company_name?: string; amount_eur?: number; reason?: string; status?: string; created_at?: string };
type Warning = { id: string; company_name?: string; title?: string; details?: string; status?: string; created_at?: string };

export const B2gEnforcementCommand: React.FC = () => {
  const [scans, setScans] = useState<ScanRun[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [target, setTarget] = useState('gov-portal.sovcorp.eu');
  const [profile, setProfile] = useState('NIS2_CORE');
  const [status, setStatus] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, n, w] = await Promise.all([
        fetchWithRetry(`${API}/scans`),
        fetchWithRetry(`${API}/notices`),
        fetchWithRetry(`${API}/warnings`),
      ]);
      const sd = await s.json().catch(() => ({} as any));
      const nd = await n.json().catch(() => ({} as any));
      const wd = await w.json().catch(() => ({} as any));
      if (sd.success) setScans(sd.scans || []);
      if (nd.success) setNotices(nd.notices || []);
      if (wd.success) setWarnings(wd.warnings || []);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const runScan = async () => {
    setScanning(true);
    setStatus('Launching national scanning engine…');
    try {
      const res = await fetchWithRetry(`${API}/scan`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, profile, intensity: 'STANDARD' }),
      });
      const d = await res.json();
      if (d.success) { setStatus(`Scan ${d.run.id} complete — risk score ${d.run.riskScore}/100 · ${d.findings?.length ?? d.run.counts?.total ?? 0} findings.`); await fetchAll(); }
      else setStatus(d.error || 'Scan failed.');
    } catch (e: any) { setStatus(e.message || 'Scan failed.'); } finally { setScanning(false); }
  };

  const sevBadge = (s?: string) => {
    const up = (s || '').toUpperCase();
    if (up === 'CRITICAL') return 'bg-red-950 text-red-300 border-red-800';
    if (up === 'HIGH') return 'bg-orange-950 text-orange-300 border-orange-800';
    if (up === 'MEDIUM') return 'bg-amber-950 text-amber-300 border-amber-800';
    return 'bg-emerald-950 text-emerald-300 border-emerald-800';
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-slate-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">B2G & National Scanning Enforcement Command</h3>
              <p className="text-sm text-slate-400">Unified national scanning engine feeding the B2G enforcement pipeline — scan, detect, penalize, enforce.</p>
            </div>
          </div>
          <button onClick={fetchAll} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {status && <div className="text-[11px] font-mono text-indigo-300 bg-indigo-950/30 border border-indigo-800 rounded-lg px-3 py-2 mb-4">{status}</div>}

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/70 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block flex items-center gap-1"><Radar className="w-3 h-3" /> Scan Target</label>
            <input value={target} onChange={e => setTarget(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">National Profile</label>
            <select value={profile} onChange={e => setProfile(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none">
              {['NIS2_CORE', 'DORA_CYBER_WEB', 'GDPR_EPRIVACY', 'AI_ACT_DISCLOSURE'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={runScan} disabled={scanning} className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-slate-950 text-sm font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors">
              {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radar className="w-4 h-4" />} Run National Scan
            </button>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/70 mb-4">
            <div className="text-xs font-bold text-white flex items-center gap-2 mb-3"><FileWarning className="w-4 h-4 text-amber-400" /> Active Violation Warnings</div>
            <div className="space-y-1.5">
              {warnings.slice(0, 5).map(w => (
                <div key={w.id} className="flex items-center gap-2 text-[11px]">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="font-mono text-slate-300">{w.company_name || w.id}</span>
                  <span className="text-slate-500 flex-1 truncate">{w.title || w.details || w.status}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[9px] font-bold">{w.status || 'OPEN'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-400" /> National Scan Runs</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="px-4 py-2.5">Scan</th><th className="px-4 py-2.5">Target</th><th className="px-4 py-2.5">Profile</th><th className="px-4 py-2.5">Risk</th><th className="px-4 py-2.5">Findings</th><th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scans.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-2.5 text-indigo-300 font-bold">{s.id}</td>
                    <td className="px-4 py-2.5 text-white">{s.target}</td>
                    <td className="px-4 py-2.5 text-slate-400">{s.profile}</td>
                    <td className="px-4 py-2.5 text-amber-300 font-bold">{s.risk_score ?? '—'}/100</td>
                    <td className="px-4 py-2.5 text-slate-400">{s.findings_count ?? '—'}</td>
                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[9px] font-bold">{s.status || 'COMPLETE'}</span></td>
                  </tr>
                ))}
                {scans.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No national scans yet — run the first one above.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {notices.length > 0 && (
          <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2"><ScrollText className="w-4 h-4 text-amber-400" /> Penalty Notices Issued</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="px-4 py-2.5">Notice</th><th className="px-4 py-2.5">Company</th><th className="px-4 py-2.5">Reason</th><th className="px-4 py-2.5">Amount</th><th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {notices.slice(0, 8).map(n => (
                    <tr key={n.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 text-amber-300 font-bold">{n.notice_number || n.id}</td>
                      <td className="px-4 py-2.5 text-white">{n.company_name || '—'}</td>
                      <td className="px-4 py-2.5 text-slate-400 truncate max-w-[220px]">{n.reason || '—'}</td>
                      <td className="px-4 py-2.5 text-emerald-300 font-bold">€{Number(n.amount_eur || 0).toLocaleString()}</td>
                      <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${sevBadge(n.status)}`}>{n.status || 'PENDING'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <B2gEnforcementPipeline />
    </div>
  );
};

export default B2gEnforcementCommand;