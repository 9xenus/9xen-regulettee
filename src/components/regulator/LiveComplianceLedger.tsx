import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Scale, Landmark, Radar, Banknote, ShieldCheck, Activity, Vault } from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

type EnforcementCase = { id: string; entity_name?: string; sector?: string; regulation?: string; violation_details?: string; status?: string; case_status?: string; fine_amount?: number; created_at?: string };
type Invoice = { id: string; enterprise_name?: string; violation_id?: string; amount_cents?: number; status?: string; created_at?: string };
type B2GRun = { id: string; company_name?: string; country?: string; scan_score?: number; violations_found?: number; calculated_penalty_eur?: number; invoice_id?: string; status?: string; created_at?: string };
type ScanRun = { id: string; target?: string; profile?: string; risk_score?: number; findings_count?: number; status?: string; completed_at?: string };

export const LiveComplianceLedger: React.FC = () => {
  const [cases, setCases] = useState<EnforcementCase[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [b2gRuns, setB2gRuns] = useState<B2GRun[]>([]);
  const [scans, setScans] = useState<ScanRun[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, i, b, s, v] = await Promise.all([
        fetchWithRetry('/api/v1/enforcement/cases/ALL'),
        fetchWithRetry('/api/v1/finance/regulator/ALL/invoices'),
        fetchWithRetry('/api/v1/b2g/pipeline/runs'),
        fetchWithRetry('/api/v1/national-scan/scans'),
        fetchWithRetry('/api/v1/regulator-vault/overview'),
      ]);
      const cd = await c.json().catch(() => ({} as any));
      const id = await i.json().catch(() => ({} as any));
      const bd = await b.json().catch(() => ({} as any));
      const sd = await s.json().catch(() => ({} as any));
      const vd = await v.json().catch(() => ({} as any));
      if (cd.success) setCases(cd.data || []);
      if (id.success) setInvoices(id.data || []);
      if (bd.success) setB2gRuns(bd.runs || []);
      if (sd.success) setScans(sd.scans || []);
      if (vd.success) setOverview(vd.overview || null);
      setLastSync(new Date().toLocaleTimeString());
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 45000);
    return () => clearInterval(interval);
  }, [load]);

  const kpis = [
    { label: 'Open Enforcement Cases', value: cases.filter(c => c.case_status === 'OPEN' || c.case_status === 'PENALTY_IMPOSED').length || '—', icon: Scale, tint: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300' },
    { label: 'B2G Pipeline Runs', value: b2gRuns.length || '—', icon: Landmark, tint: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300' },
    { label: 'National Scans', value: scans.length || '—', icon: Radar, tint: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-300' },
    { label: 'Penalty Invoices', value: invoices.length || '—', icon: Banknote, tint: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300' },
    { label: 'Vault Evidence Sealed', value: overview?.evidence?.sealed ?? '—', icon: Vault, tint: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300' },
  ];

  const statusBadge = (s?: string) => {
    const up = (s || '').toUpperCase();
    if (up === 'PAID' || up === 'COLLECTED' || up === 'CLOSED' || up === 'VERIFIED') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    if (up === 'OPEN' || up === 'PENDING' || up === 'PENALTY_IMPOSED' || up === 'DUE') return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    if (up === 'UNDER_APPEAL' || up === 'UNDER APPEAL') return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  };

  const LedgeTable = ({ title, icon, head, rows }: { title: string; icon: React.ReactNode; head: string[]; rows: React.ReactNode[][] }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">{icon}{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-50 dark:bg-slate-800/40">
              {head.map(h => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                {r.map((cell, ci) => <td key={ci} className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{cell}</td>)}
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={head.length} className="px-4 py-8 text-center text-slate-400 font-mono text-xs">No activity recorded in this stream yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Live Compliance Ledger
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Unified, tamper-evident view across enforcement cases, B2G pipelines, national scanning, penalties, and the secure evidence vault.</p>
        </div>
        <button onClick={load} className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh {lastSync && <span className="text-slate-400 font-mono">{lastSync}</span>}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
              <div className={`inline-flex p-2 rounded-lg ${k.tint} mb-2`}><Icon className="w-4 h-4" /></div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">{k.value}</div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">{k.label}</div>
            </div>
          );
        })}
      </div>

      {overview && (
        <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500">Regulatory Documents</div>
            <div className="text-lg font-bold">{overview.documents?.total ?? 0} <span className="text-xs text-slate-500">({overview.documents?.pendingReview ?? 0} pending)</span></div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500">Evidence Records</div>
            <div className="text-lg font-bold">{overview.evidence?.total ?? 0}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500">Verified</div>
            <div className="text-lg font-bold text-emerald-400">{overview.evidence?.verified ?? 0}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500">Chain Integrity</div>
            <div className={`text-lg font-bold ${overview.evidence?.integrity === 'INTACT' ? 'text-emerald-400' : overview.evidence?.integrity === 'PARTIAL' ? 'text-amber-400' : 'text-slate-400'}`}>
              {(String(overview.evidence?.integrity || 'EMPTY').replace(/_/g, ' '))}
            </div>
          </div>
        </div>
      )}

      <LedgeTable
        title="Enforcement Cases"
        icon={<Scale className="w-4 h-4 text-amber-600" />}
        head={['ID', 'Entity', 'Sector', 'Regulation', 'Fine (EUR)', 'Status']}
        rows={cases.slice(0, 10).map(c => [
          <span key="id" className="font-mono text-[11px] text-amber-600 font-bold">{c.id}</span>,
          c.entity_name || '—',
          c.sector || '—',
          <span key="reg" className="font-mono text-[11px]">{c.regulation || '—'}</span>,
          c.fine_amount != null ? `€${Number(c.fine_amount).toLocaleString()}` : '—',
          <span key="st" className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusBadge(c.case_status || c.status)}`}>{c.case_status || c.status || '—'}</span>,
        ])}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LedgeTable
          title="B2G Pipeline Runs"
          icon={<Landmark className="w-4 h-4 text-indigo-600" />}
          head={['Run', 'Company', 'Score', 'Violations', 'Penalty (EUR)', 'Status']}
          rows={b2gRuns.slice(0, 8).map(r => [
            <span key="id" className="font-mono text-[11px] text-indigo-600 font-bold">{r.id}</span>,
            r.company_name || '—',
            `${r.scan_score ?? '—'}/100`,
            r.violations_found ?? '—',
            <span key="amt" className="font-mono text-amber-700 dark:text-amber-300 font-bold">€{Number(r.calculated_penalty_eur || 0).toLocaleString()}</span>,
            <span key="st" className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusBadge(r.status)}`}>{r.status || '—'}</span>,
          ])}
        />
        <LedgeTable
          title="National Security Scans"
          icon={<Radar className="w-4 h-4 text-cyan-600" />}
          head={['Scan', 'Target', 'Profile', 'Risk', 'Findings', 'Status']}
          rows={scans.slice(0, 8).map(s => [
            <span key="id" className="font-mono text-[11px] text-cyan-600 font-bold">{s.id}</span>,
            s.target || '—',
            s.profile || '—',
            `${s.risk_score ?? '—'}/100`,
            s.findings_count ?? '—',
            <span key="st" className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold">{s.status || 'COMPLETE'}</span>,
          ])}
        />
      </div>

      <LedgeTable
        title="Penalty Invoices & Collection"
        icon={<Banknote className="w-4 h-4 text-emerald-600" />}
        head={['Invoice', 'Enterprise', 'Reference', 'Amount', 'Status']}
        rows={invoices.slice(0, 10).map(iv => [
          <span key="id" className="font-mono text-[11px] text-emerald-600 font-bold">{iv.id}</span>,
          iv.enterprise_name || '—',
          <span key="ref" className="font-mono text-[11px]">{iv.violation_id || '—'}</span>,
          <span key="amt" className="font-mono font-bold">€{((iv.amount_cents || 0) / 100).toLocaleString()}</span>,
          <span key="st" className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusBadge(iv.status)}`}>{(iv.status || 'PENDING').replace(/_/g, ' ')}</span>,
        ])}
      />

      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> All streams hash-linked and anchored on the Blockchain audit trail ledger · auto-refreshes every 45s
      </div>
    </div>
  );
};

export default LiveComplianceLedger;