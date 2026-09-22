import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Zap, ArrowRight, CheckCircle2, Loader2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlastRadiusPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changes: any;
}

export const BlastRadiusPreview: React.FC<BlastRadiusPreviewProps> = ({ isOpen, onClose, onConfirm, changes }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const simulate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/advanced-settings/simulate-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: 'default', changes })
      });
      const data = await res.json();
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger simulation on open
  React.useEffect(() => {
    if (isOpen) simulate();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-rose-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Blast-Radius Simulation</h3>
                  <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest">Predicting policy impacts before commitment</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <Zap className="w-10 h-10 text-indigo-200 animate-pulse" />
                    <Loader2 className="absolute inset-0 w-10 h-10 text-indigo-600 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">AI Engine Simulating Outcomes...</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest font-mono">Tracing downstream dependencies</p>
                  </div>
                </div>
              ) : report ? (
                <div className="space-y-8">
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">AI Executive Summary</h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{report.summary}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impacted Regulatory Areas</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {report.impacted_areas.map((area: any, idx: number) => (
                        <div key={idx} className="p-4 border border-slate-100 rounded-2xl flex items-start gap-4 hover:border-slate-200 transition-all">
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                            area.severity === 'CRITICAL' ? 'bg-rose-500 animate-ping' :
                            area.severity === 'HIGH' ? 'bg-rose-500' :
                            area.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-black text-slate-900">{area.area}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                area.severity === 'CRITICAL' || area.severity === 'HIGH' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                              }`}>{area.severity}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{area.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <AlertCircle className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-indigo-900 uppercase">AI Recommendation</h4>
                      <p className="text-[11px] text-indigo-700 font-medium mt-0.5">{report.recommendation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-bold uppercase">Simulation data unavailable</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
              >
                Abort Changes
              </button>
              <button
                onClick={onConfirm}
                className="px-8 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all shadow-xl shadow-rose-100 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Commit Sovereign State
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
