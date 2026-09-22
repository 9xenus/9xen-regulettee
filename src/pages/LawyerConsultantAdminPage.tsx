import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, FileText, Receipt, Activity, RefreshCw, Globe2, Briefcase, Scale, UserCheck, Radar } from 'lucide-react';
import { CorePlatformSystem } from '../components/admin/CorePlatformSystem';
import { LawyerPracticeSuite } from '../components/lawyer/LawyerPracticeSuite';
import { LawyerSolutionEngine } from '../components/lawyer/LawyerSolutionEngine';
import { CrossBorderJurisdictionPanel } from '../components/lawyer/CrossBorderJurisdictionPanel';
import { LawyerClientSignalsSuite } from '../components/lawyer/LawyerClientSignalsSuite';
import { fetchWithRetry } from '../lib/api-client';

interface Overview {
  professionals: number;
  verifiedPartners: number;
  pendingReview: number;
  consultations: number;
  confirmedConsultations: number;
  directives: number;
  activeDirectives: number;
  invoices: number;
  openInvoices: number;
  slaComplianceRate: number;
  generatedAt?: string;
}

type MainTab = 'overview' | 'practice' | 'jurisdiction' | 'solutions' | 'signals' | 'roster' | 'consultations';

const statusBadge = (s: string) => (
  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${s === 'VERIFIED_PARTNER' ? 'bg-emerald-100 text-emerald-700' : s === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{s.replace(/_/g, ' ')}</span>
);

export const LawyerConsultantAdminPage: React.FC<{}> = () => {
  const [activeTab, setActiveTab] = useState<MainTab>('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 4000); };

  const load = async () => {
    try {
      const res = await fetch('/api/v1/lawyer/overview');
      const data = await res.json();
      if (data.success) setOverview(data.overview);
    } catch { /* offline */ }
  };

  const loadRoster = async () => {
    try {
      const [cl, pl, ss] = await Promise.all([
        fetchWithRetry('/api/v1/lawyer/clients'),
        fetchWithRetry('/api/v1/lawyer/professionals'),
        fetchWithRetry('/api/v1/lawyer/consultations'),
      ]);
      const cd = await cl.json(); const pd = await pl.json(); const sd = await ss.json();
      if (pd.success) setProfessionals(pd.professionals || []);
      if (sd.success) setSessions(sd.sessions || []);
      if (cd.success) setClients(cd.clients || []);
    } catch { /* offline */ }
  };

  useEffect(() => { load(); loadRoster(); }, []);

  const setPartnerStatus = async (id: string, status: string) => {
    try {
      const res = await fetchWithRetry(`/api/v1/lawyer/professionals/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      const d = await res.json();
      if (d.success) { notify(`Professional ${status.replace(/_/g, ' ')}.`); loadRoster(); }
    } catch { notify('Status update failed.'); }
  };

  const setSessionStatus = async (id: string, status: string) => {
    try {
      const res = await fetchWithRetry(`/api/v1/lawyer/consultations/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      const d = await res.json();
      if (d.success) { notify(`Consultation ${status}.`); loadRoster(); }
    } catch { notify('Consultation update failed.'); }
  };

  const cards = overview ? [
    { label: 'Partners & Counsels', value: overview.professionals, sub: `${overview.verifiedPartners} verified · ${overview.pendingReview} pending`, icon: Users, color: 'text-indigo-600' },
    { label: 'Consultation Rooms', value: overview.consultations, sub: `${overview.confirmedConsultations} confirmed`, icon: MessageSquare, color: 'text-emerald-600' },
    { label: 'Legal Directives', value: overview.directives, sub: `${overview.activeDirectives} active`, icon: FileText, color: 'text-amber-600' },
    { label: 'Billable Invoices', value: overview.invoices, sub: `${overview.openInvoices} open`, icon: Receipt, color: 'text-sky-600' },
    { label: 'SLA Compliance', value: `${overview.slaComplianceRate}%`, sub: 'partner SLA rate', icon: Activity, color: 'text-fuchsia-600' },
  ] : [];

  const tabs: { id: MainTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview 📊', icon: Activity },
    { id: 'practice', label: 'Practice Suite 🗂️', icon: Briefcase },
    { id: 'jurisdiction', label: 'Cross-Border Jurisdiction 🌐', icon: Globe2 },
    { id: 'solutions', label: 'Law/Act Solution Engine ⚖️', icon: Scale },
    { id: 'signals', label: 'Client Signals & Regulators 📡', icon: Radar },
    { id: 'roster', label: 'Lawyers Hub 👥', icon: UserCheck },
    { id: 'consultations', label: 'Consultation Rooms 💬', icon: MessageSquare },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Lawyer / Consultant Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Client management, service catalog, invoice desk, cross-border jurisdiction auto-detection and law/act solution auto-integration — full-stack API-backed.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { load(); loadRoster(); }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {toast && (
        <div className={`p-3 rounded-xl text-xs font-mono border flex items-center gap-2 bg-slate-900 dark:bg-slate-800 border-slate-800 text-emerald-300`}>
          <Activity className="w-4 h-4 shrink-0" /> {toast}
        </div>
      )}

      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-1 flex-wrap sticky top-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur py-2 -mx-1 px-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {cards.map(c => (
              <div key={c.label} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <c.icon className={`w-4 h-4 ${c.color}`} />
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{c.value}</div>
                <div className="text-[11px] font-semibold text-slate-500">{c.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{c.sub}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><GlobalIcon /> Practice Suite Quick Start</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Manage your client portfolios, provision compliance services to clients, issue per-client invoices, and generate law/act solutions that auto-integrate compliance tasks directly into your clients' dashboards.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={() => setActiveTab('practice')} className="px-3 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700">Open Practice Suite</button>
                <button onClick={() => setActiveTab('jurisdiction')} className="px-3 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50">Open Jurisdiction Hub</button>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><Globe2 className="w-4 h-4 text-indigo-500" /> Cross-Border Compliance Act Engine</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every dashboard (client, regulator, lawyer) shares one jurisdiction engine. Operating location is auto-detected and the applicable regional + country compliance laws & acts are auto-implemented.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {['GDPR', 'EU_AI_ACT', 'DORA', 'NIS2', 'DSA', 'CSRD', 'CCPA', 'LGPD'].map(a => (
                  <span key={a} className="text-[9px] font-mono font-black px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          </div>
          <CorePlatformSystem />
        </motion.div>
      )}

      {activeTab === 'practice' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <LawyerPracticeSuite />
        </motion.div>
      )}

      {activeTab === 'jurisdiction' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <CrossBorderJurisdictionPanel ownerType="lawyer-suite" ownerId="LAW-100" title="Cross-Border Jurisdiction Hub — Law/Act Implementation" showSolutions={false} />
          <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-2">Auto-Integration Targets</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Resolving a client's jurisdiction here writes the applicable act stack to the shared engine. When you generate a solution in the <button onClick={() => setActiveTab('solutions')} className="text-indigo-600 font-semibold underline">Law/Act Solution Engine</button>, the same acts drive remediation tasks that auto-appear in the client dashboard along with issued directives and billable invoices.
            </p>
          </div>
        </motion.div>
      )}

      {activeTab === 'solutions' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <LawyerSolutionEngine clients={clients} />
        </motion.div>
      )}

      {activeTab === 'signals' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <LawyerClientSignalsSuite onOpenSolution={(clientId, name) => { setActiveTab('solutions'); }} />
        </motion.div>
      )}

      {activeTab === 'roster' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4"><UserCheck className="w-5 h-5 text-indigo-600" /> Lawyers Hub — Partner Roster & Credentials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {professionals.map(p => (
              <div key={p.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">{p.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{p.barLicense} · {p.licensingAuthority}</div>
                  </div>
                  {statusBadge(p.status)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">{p.firm} · {p.specialization}</div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><Globe2 className="w-3 h-3" /> {p.jurisdiction} · {p.yearsOfPractice} yrs practice</div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setPartnerStatus(p.id, 'VERIFIED_PARTNER')} className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg">Verify</button>
                  <button onClick={() => setPartnerStatus(p.id, 'PENDING_REVIEW')} className="px-2.5 py-1 bg-white border border-amber-200 text-amber-600 text-[10px] font-bold rounded-lg">Hold Review</button>
                </div>
              </div>
            ))}
          </div>
          {professionals.length === 0 && <div className="p-6 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200">No professionals in roster.</div>}
        </motion.div>
      )}

      {activeTab === 'consultations' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1"><MessageSquare className="w-5 h-5 text-emerald-600" /> Consultation Rooms — Client Requests</h3>
          <p className="text-[11px] text-slate-400 mb-4">Consultation requests dispatched from client dashboards appear here with the requesting nation, context and SLA so you can confirm or decline.</p>
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800 dark:text-white">{s.topic || 'Consultation request'}</div>
                  <div className="text-[10px] text-slate-400">{s.clientName || s.tenantName || 'Client'} · {s.attorneyName} · {s.country || 'Cross-border'} · {s.roomRef}</div>
                  {s.message && <div className="text-[10px] text-slate-500 mt-1 italic line-clamp-1">“{String(s.message).slice(0, 120)}{String(s.message).length > 120 ? '…' : ''}”</div>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${s.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : s.status === 'DECLINED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{s.status}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date(s.scheduledAt || Date.now()).toLocaleString()}</span>
                  {s.status === 'PENDING' && (
                    <>
                      <button onClick={() => setSessionStatus(s.id, 'CONFIRMED')} className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg">Confirm</button>
                      <button onClick={() => setSessionStatus(s.id, 'DECLINED')} className="px-2.5 py-1 bg-white border border-rose-200 text-rose-600 text-[10px] font-bold rounded-lg">Decline</button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {sessions.length === 0 && <div className="p-6 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">No consultation requests yet.</div>}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const GlobalIcon = () => <Globe2 className="w-4 h-4 text-indigo-500" />;

export default LawyerConsultantAdminPage;