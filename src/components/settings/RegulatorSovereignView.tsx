import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gavel, 
  Eye, 
  Clock, 
  FileSearch, 
  ShieldCheck, 
  AlertCircle, 
  ArrowUpRight, 
  Download,
  Info,
  Calendar,
  Lock,
  Flag,
  Globe,
  Database,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { DORAResilienceModule } from './DORAResilienceModule';

interface RegulatoryFramework {
  id: string;
  name: string;
  authority: string;
  status: 'COMPLIANT' | 'NEEDS_REVIEW' | 'BREACH_REPORTED' | 'NOT_APPLICABLE';
  lastReview: string;
  evidenceCount: number;
  cadence: string;
}

export const RegulatorSovereignView: React.FC = () => {
  const [activeFramework, setActiveFramework] = useState<string | null>(null);

  const frameworks: RegulatoryFramework[] = [
    { id: 'gdpr', name: 'GDPR (Data Privacy)', authority: 'Supervisory Authority', status: 'COMPLIANT', lastReview: '2026-08-15', evidenceCount: 142, cadence: 'Annual' },
    { id: 'dora', name: 'DORA (Digital Resilience)', authority: 'National Competent Authority', status: 'NEEDS_REVIEW', lastReview: '2026-07-01', evidenceCount: 88, cadence: 'Continuous' },
    { id: 'ai-act', name: 'EU AI Act (High-Risk)', authority: 'AI Office / Notify Body', status: 'COMPLIANT', lastReview: '2026-08-20', evidenceCount: 56, cadence: 'Quarterly' },
    { id: 'mica', name: 'MiCA (Crypto Assets)', authority: 'ESMA / National Bank', status: 'NOT_APPLICABLE', lastReview: 'N/A', evidenceCount: 0, cadence: 'Event-driven' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Regulator Status Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active Supervisory Session</span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gavel className="w-5 h-5 text-blue-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">EU Competent Authority Access</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Sovereign Compliance Monitor</h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl italic">
              Strictly read-only monitoring interface. Access is scoped to mandated EU frameworks and time-boxed until 2026-08-21 23:59 UTC.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authored By</div>
              <div className="text-sm font-black text-blue-400 uppercase">regulator_readonly</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Framework Selection */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Flag className="w-3.5 h-3.5 text-blue-600" /> Mandated Frameworks
          </h3>
          <div className="space-y-2">
            {frameworks.map((fw) => (
              <button
                key={fw.id}
                onClick={() => setActiveFramework(fw.id)}
                className={cn(
                  "w-full p-4 rounded-2xl border text-left transition-all group relative overflow-hidden",
                  activeFramework === fw.id 
                    ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-500/20" 
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={cn(
                    "text-sm font-black tracking-tight transition-colors",
                    activeFramework === fw.id ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600"
                  )}>
                    {fw.name}
                  </h4>
                  <span className={cn(
                    "text-[9px] font-black uppercase px-1.5 py-0.5 rounded",
                    fw.status === 'COMPLIANT' ? "bg-emerald-50 text-emerald-700" :
                    fw.status === 'NEEDS_REVIEW' ? "bg-amber-50 text-amber-700" :
                    fw.status === 'BREACH_REPORTED' ? "bg-rose-50 text-rose-700" : "bg-slate-200 text-slate-500"
                  )}>
                    {fw.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Authority: {fw.authority}</div>
                <div className="flex items-center gap-3 mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Database className="w-3 h-3" /> {fw.evidenceCount} Evidences</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fw.cadence}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Supervision Detail Panel */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeFramework ? (
              <motion.div
                key={activeFramework}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">EU Framework Evidence Vault</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {frameworks.find(f => f.id === activeFramework)?.name}
                      </h3>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-black transition-all uppercase tracking-widest shadow-sm">
                      <Download className="w-3.5 h-3.5" /> Full Audit Export (.zip)
                    </button>
                  </div>

                  {activeFramework === 'dora' ? (
                    <DORAResilienceModule />
                  ) : (
                    <>
                      {/* Framework Specific Metadata */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporting Cadence</span>
                          </div>
                          <div className="text-sm font-bold text-slate-900">Next Official Submission Due:</div>
                          <div className="text-lg font-black text-blue-600 mt-1">2026-09-30 <span className="text-[10px] font-medium text-slate-400">(40 days left)</span></div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Breach Notification Timeline</span>
                          </div>
                          <div className="text-sm font-bold text-slate-900">Required Response Time:</div>
                          <div className="text-lg font-black text-rose-600 mt-1">72 Hours <span className="text-[10px] font-medium text-slate-400">(Article 33 Compliant)</span></div>
                        </div>
                      </div>

                      {/* Evidence Ledger */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Immutable Evidence Ledger</h4>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                          <div className="divide-y divide-slate-100">
                            {[
                              { title: 'Data Processing Agreement (DPA) v2.4', type: 'Legal Document', date: '2026-08-10', signed: true },
                              { title: 'Impact Assessment: High-Risk AI Module', type: 'Technical Audit', date: '2026-08-18', signed: true },
                              { title: 'Purge Logs: Non-Compliant Personal Data', type: 'System Logs', date: '2026-08-19', signed: true },
                            ].map((doc, i) => (
                              <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-white transition-all group">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                    <FileSearch className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-900">{doc.title}</div>
                                    <div className="text-[10px] text-slate-500 font-medium">{doc.type} • Verified {doc.date}</div>
                                  </div>
                                </div>
                                <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest transition-all opacity-0 group-hover:opacity-100">
                                  <Eye className="w-3.5 h-3.5" /> Inspect
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Scoped Information Notice */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <strong className="block mb-1">Regulator Scoping Notice</strong>
                    You are viewing a cryptographically signed view of the client's compliance posture. All data is retrieved in real-time from the immutable ledger. You cannot modify controls, but you can raise an official "Supervisory Query" which will be logged in the client's audit trail.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-slate-100">
                  <FileSearch className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Select a Framework to Inspect</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-medium">
                  Select one of the mandated EU frameworks from the sidebar to begin your supervisory review of client evidence and status.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
