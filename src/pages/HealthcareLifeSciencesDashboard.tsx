import React, { useState } from 'react';
import { 
  HeartPulse, 
  ShieldCheck, 
  Lock, 
  Users, 
  Database, 
  Activity, 
  AlertTriangle, 
  FileText,
  Search,
  Globe,
  Dna,
  FlaskConical,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  Fingerprint,
  Layers,
  FileCheck2,
  Microscope,
  Stethoscope
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const CONSENT_DATA = [
  { month: 'Jan', active: 1200, withdrawn: 45 },
  { month: 'Feb', active: 1450, withdrawn: 32 },
  { month: 'Mar', active: 1800, withdrawn: 56 },
  { month: 'Apr', active: 2100, withdrawn: 41 },
  { month: 'May', active: 2400, withdrawn: 28 },
  { month: 'Jun', active: 2850, withdrawn: 39 },
];

const DATA_SHARING_STATS = [
  { name: 'Research Consents', value: 65, color: '#6366f1' },
  { name: 'Diagnostic Records', value: 20, color: '#ec4899' },
  { name: 'Genomic Data', value: 10, color: '#8b5cf6' },
  { name: 'Trial Metrics', value: 5, color: '#10b981' },
];

export default function HealthcareLifeSciencesDashboard() {
  const [activeTab, setActiveTab] = useState<'consent' | 'compliance' | 'trials'>('consent');
  const [isScanning, setIsScanning] = useState(false);

  const triggerAnonymizationScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-wider">
              Pack 4: Healthcare & Life Sciences
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              EHDS Compliant v3.1
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <HeartPulse className="w-8 h-8 text-rose-500" />
            Healthcare Data Space & Life Sciences Oversight
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Managing European Health Data Space (EHDS) compliance, patient consent lifecycle, and PHI anonymization for cross-border research.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={triggerAnonymizationScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
          >
            <Fingerprint className={`w-4 h-4 ${isScanning ? 'animate-pulse text-rose-500' : ''}`} />
            {isScanning ? 'Verifying PHI Masking...' : 'Verify PHI Anonymization'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200">
            <FileText className="w-4 h-4" />
            Statutory EHDS Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Patient Records', value: '1.2M', detail: 'Encrypted at rest', icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Data Consents', value: '842,501', detail: '94% Opt-in rate', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Anonymization Health', value: '100%', detail: 'Zero re-ID detected', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Audit Readiness', value: 'Tier 1', detail: 'Regulator Certified', icon: FileCheck2, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300" />
            </div>
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stat.value}</div>
            <div className="text-[10px] text-slate-500 mt-1">{stat.detail}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consent Lifecycle Analytics */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Dynamic Patient Consent Lifecycle
              </h3>
              <p className="text-xs text-slate-500">Tracking opt-ins/opt-outs for EHDS Secondary Data Use</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('consent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'consent' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Growth
              </button>
              <button 
                onClick={() => setActiveTab('compliance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'compliance' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Compliance
              </button>
              <button 
                onClick={() => setActiveTab('trials')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'trials' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Clinical Trials
              </button>
            </div>
          </div>

          <div className="flex-1 h-[300px]">
            {activeTab === 'consent' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CONSENT_DATA}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                  <Area type="monotone" dataKey="withdrawn" stroke="#f43f5e" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            )}
            {activeTab === 'compliance' && (
              <div className="h-full flex flex-col justify-center gap-4">
                <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">GDPR Art. 9 Processing & BD Compliance</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 px-2 py-1 bg-emerald-100 rounded-lg">VERIFIED</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">EHDS Data Access & Secondary Use Framework</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 px-2 py-1 bg-indigo-100 rounded-lg">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-800">PHI Anonymization Standard (k-anonymity ≥ 24)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-700 px-2 py-1 bg-amber-100 rounded-lg">MONITORING</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-slate-800">Cross-Border Transfer Compliance (EU-Unit 2.0)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-700 px-2 py-1 bg-rose-100 rounded-lg">REVIEW</span>
                </div>
              </div>
            )}
            {activeTab === 'trials' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DATA_SHARING_STATS} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={22}>
                    {DATA_SHARING_STATS.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Regulatory Queue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500" />
            EHDS Regulatory Queue
          </h3>
          <div className="space-y-4">
            {[
              { id: 'REQ-9102', title: 'Cancer Research Data Access', status: 'PENDING_APPROVAL', priority: 'HIGH', region: 'EU' },
              { id: 'REQ-9105', title: 'Genomic Strain Analysis (KSA)', status: 'APPROVED', priority: 'CRITICAL', region: 'KSA' },
              { id: 'REQ-9108', title: 'Rare Disease Patient Registry', status: 'DATA_MASKING', priority: 'MEDIUM', region: 'EU' },
              { id: 'REQ-9110', title: 'Vaccine Efficacy Telemetry', status: 'AUDIT_COMPLETE', priority: 'HIGH', region: 'GLOBAL' },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-indigo-600">{item.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider ${
                    item.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900">{item.title}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {item.region}
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 uppercase">{item.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-xs font-bold text-indigo-600 hover:bg-slate-50 border border-indigo-100 rounded-xl transition">
            View All Pending Inquiries
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PHI Anonymization Control */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-rose-400">
                <Lock className="w-5 h-5" />
                Sovereign PHI Anonymization Enclave
              </h3>
              <p className="text-xs text-slate-400">Differential privacy & k-anonymity for EHDS compliance</p>
            </div>
            <RefreshCw className={`w-5 h-5 text-slate-600 ${isScanning ? 'animate-spin text-rose-400' : ''}`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'K-Anonymity Score', value: 'k=24', status: 'HEALTHY', icon: ShieldCheck },
              { label: 'Differential Privacy', value: 'ε = 0.01', status: 'ACTIVE', icon: Layers },
              { label: 'Pseudo-ID Tokens', value: 'Active', status: 'ROTATED', icon: RefreshCw },
              { label: 'Re-ID Protection', value: '99.9%', status: 'SHIELDED', icon: Lock },
            ].map((card, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <card.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{card.label}</span>
                </div>
                <div className="text-xl font-black text-white">{card.value}</div>
                <div className="text-[9px] font-mono text-emerald-400 mt-1">Status: {card.status}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1">
            <div>&gt; Initializing Differential Privacy Noise Injection...</div>
            <div>&gt; Masking Patient Identifier: [PID-992-XXX] ... <span className="text-emerald-500">SUCCESS</span></div>
            <div>&gt; Verifying EHDS Article 34 Compliance... <span className="text-emerald-500">VERIFIED</span></div>
          </div>
        </div>

        {/* Clinical Trial Management */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
            Clinical Trial Audit & Traceability
          </h3>
          
          <div className="space-y-4">
            {[
              { name: 'Oncology Phase III (Cross-Border)', progress: 78, site: 'Berlin/Paris', auditor: 'EMA' },
              { name: 'mRNA Vaccine Stability Study', progress: 92, site: 'Riyadh', auditor: 'SDAIA' },
              { name: 'Rare Gene Therapy Trial', progress: 45, site: 'London', auditor: 'ICO' },
            ].map((trial, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{trial.name}</div>
                    <div className="text-[10px] text-slate-500">Lead: {trial.site} | Regulator: {trial.auditor}</div>
                  </div>
                  <span className="text-xs font-black text-indigo-600">{trial.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${trial.progress}%` }}
                    className="h-full bg-indigo-500" 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg text-white">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-800 uppercase">GCP Certified</div>
                <div className="text-xs text-emerald-600">Good Clinical Practice</div>
              </div>
            </div>
            <div className="flex-1 p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg text-white">
                <Microscope className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-indigo-800 uppercase">FDA Ready</div>
                <div className="text-xs text-indigo-600">21 CFR Part 11 Valid</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
