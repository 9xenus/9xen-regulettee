import React, { useState } from 'react';
import { 
  Globe, 
  Languages, 
  FileText, 
  Search, 
  Filter,
  ArrowRightLeft,
  ShieldCheck,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// --- MOCK DATA ---
const languageDistribution = [
  { lang: 'English', count: 520, color: '#f43f5e' },
  { lang: 'Arabic', count: 420, color: '#0ea5e9' },
  { lang: 'Spanish', count: 380, color: '#f59e0b' },
  { lang: 'French', count: 310, color: '#8b5cf6' },
  { lang: 'Russian', count: 250, color: '#ef4444' },
  { lang: 'Hindi', count: 210, color: '#10b981' },
  { lang: 'Portuguese', count: 195, color: '#fbbf24' },
  { lang: 'Bangla', count: 180, color: '#6366f1' },
  { lang: 'Italian', count: 165, color: '#22c55e' },
  { lang: 'Urdu', count: 140, color: '#14b8a6' },
  { lang: 'German', count: 120, color: '#f97316' },
  { lang: 'Czech', count: 95, color: '#f43f5e' },
  { lang: 'Chinese', count: 85, color: '#ef4444' },
  { lang: 'Japanese', count: 70, color: '#0ea5e9' },
  { lang: 'Latin', count: 45, color: '#94a3b8' },
];

const crossBorderFeed = [
  {
    id: 'DOC-88A',
    sourceLang: 'Russian (RU)',
    targetJurisdiction: 'EU (MiCA/Sanctions)',
    docType: 'Bill of Lading',
    riskScore: 94,
    status: 'BLOCKED',
    flag: 'Sanctioned Entity Detected (Dual-Use Goods)',
    preview: 'Грузовой манифест: Промышленные контроллеры серии X...',
    translatedPreview: 'Cargo Manifest: Industrial controllers Series X...'
  },
  {
    id: 'DOC-88F',
    sourceLang: 'Portuguese (PT)',
    targetJurisdiction: 'Brazil (LGPD)',
    docType: 'Privacy Policy Update',
    riskScore: 18,
    status: 'COMPLIANT',
    flag: 'Matches LGPD standard clauses',
    preview: 'Política de Privacidade: O tratamento de dados pessoais...',
    translatedPreview: 'Privacy Policy: The processing of personal data...'
  },
  {
    id: 'DOC-88G',
    sourceLang: 'Italian (IT)',
    targetJurisdiction: 'EU (Anti-Trust)',
    docType: 'Merger Agreement',
    riskScore: 45,
    status: 'REVIEW_REQUIRED',
    flag: 'Market Share Threshold Warning',
    preview: 'Accordo di fusione: Le parti concordano di unire...',
    translatedPreview: 'Merger Agreement: The parties agree to join...'
  },
  {
    id: 'DOC-88I',
    sourceLang: 'Czech (CZ)',
    targetJurisdiction: 'EU (Labour Law)',
    docType: 'Employment Contract',
    riskScore: 32,
    status: 'REVIEW_REQUIRED',
    flag: 'Non-standard severance clause',
    preview: 'Pracovní smlouva: Zaměstnavatel se zavazuje...',
    translatedPreview: 'Employment Contract: The employer undertakes...'
  },
  {
    id: 'DOC-88J',
    sourceLang: 'Chinese (ZH)',
    targetJurisdiction: 'Hong Kong (HKMA)',
    docType: 'Export License',
    riskScore: 78,
    status: 'BLOCKED',
    flag: 'Incomplete dual-use attestation',
    preview: '出口许可证：该货物属于受控类别...',
    translatedPreview: 'Export License: This cargo belongs to a controlled category...'
  },
  {
    id: 'DOC-88H',
    sourceLang: 'Latin (LA)',
    targetJurisdiction: 'Vatican City / Heritage',
    docType: 'Archival Manuscript Scan',
    riskScore: 5,
    status: 'COMPLIANT',
    flag: 'Verified historical provenance',
    preview: 'Codex Juris Canonici: In nomine Domini nostri...',
    translatedPreview: 'Code of Canon Law: In the name of our Lord...'
  },
  {
    id: 'DOC-88B',
    sourceLang: 'Arabic (AR)',
    targetJurisdiction: 'UK (FCA)',
    docType: 'Shareholder Agreement',
    riskScore: 22,
    status: 'COMPLIANT',
    flag: 'Standard provisions',
    preview: 'اتفاقية المساهمين: تنص هذه الاتفاقية على...',
    translatedPreview: 'Shareholder Agreement: This agreement stipulates...'
  },
  {
    id: 'DOC-88C',
    sourceLang: 'Hindi (HI)',
    targetJurisdiction: 'US (SEC)',
    docType: 'Financial Audit Report',
    riskScore: 68,
    status: 'REVIEW_REQUIRED',
    flag: 'GAAP Reconciliation Variance',
    preview: 'वित्तीय लेखापरीक्षा रिपोर्ट: वर्ष २०२५-२०२६ के लिए...',
    translatedPreview: 'Financial Audit Report: For the year 2025-2026...'
  },
  {
    id: 'DOC-88D',
    sourceLang: 'Spanish (ES)',
    targetJurisdiction: 'Global (ESG)',
    docType: 'Factory Audit (Mexico)',
    riskScore: 85,
    status: 'HIGH_RISK',
    flag: 'Labor Law Violation (Overtime Caps)',
    preview: 'Auditoría de fábrica: Los registros de horas extras indican...',
    translatedPreview: 'Factory Audit: Overtime records indicate...'
  },
  {
    id: 'DOC-88E',
    sourceLang: 'Czech (CS)',
    targetJurisdiction: 'EU (GDPR)',
    docType: 'Data Processing Addendum',
    riskScore: 12,
    status: 'COMPLIANT',
    flag: 'Matches Standard Contractual Clauses',
    preview: 'Dodatek o zpracování osobních údajů: Zpracovatel se zavazuje...',
    translatedPreview: 'Data Processing Addendum: The processor commits to...'
  }
];

export default function MultilingualNlpDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: string) => {
    if (status === 'COMPLIANT') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
    if (status === 'BLOCKED') return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800';
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Global Cross-Border NLP Gateway
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Real-time multi-lingual legal parsing, jurisdiction alignment, and native reasoning across 40+ languages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            <Languages className="w-4 h-4" />
            Configure Language Models
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Docs (MTD)</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">14,290</span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
            Processed natively
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Languages Detected</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">42</span>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
            Active in current pipeline
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Jurisdiction Conflicts</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Scale className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">315</span>
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
            Cross-border legal friction
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Flags (Sanctions)</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">18</span>
          <span className="text-sm font-medium text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
            Intercepted instantly
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Language Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Document Volume by Language</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Top languages processed natively without English bridging.</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languageDistribution} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis dataKey="lang" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} className="dark:text-gray-300" />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6', opacity: 0.1 }}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#f9fafb' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {languageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Processing Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-900/50">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Real-Time Cross-Border Analysis Feed</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Live semantic alignment mapping.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search stream..." 
                  className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 shadow-sm">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-0">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {crossBorderFeed.map((doc, idx) => (
                <li key={doc.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-gray-500">{doc.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(doc.status)}`}>
                        {doc.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{doc.docType}</span>
                    </div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Risk: {doc.riskScore}/100
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Source */}
                    <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-1">
                        Original <span className="text-indigo-500">{doc.sourceLang}</span>
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-300 font-serif leading-relaxed line-clamp-2" dir={doc.sourceLang.includes('Arabic') || doc.sourceLang.includes('Urdu') ? 'rtl' : 'ltr'}>
                        {doc.preview}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex items-center justify-center col-span-1">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-500">
                        <ArrowRightLeft className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Target Context */}
                    <div className="md:col-span-2 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                      <div className="text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-1">
                        Aligned to <span className="text-emerald-500">{doc.targetJurisdiction}</span>
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-300 font-serif leading-relaxed line-clamp-2">
                        {doc.translatedPreview}
                      </p>
                    </div>
                  </div>
                  
                  {doc.status !== 'COMPLIANT' && (
                    <div className="mt-3 text-sm flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      Anomaly detected: {doc.flag}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
