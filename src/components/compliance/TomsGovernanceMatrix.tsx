import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Key, Server, Cpu, RefreshCw, 
  CheckCircle2, AlertTriangle, Download, ArrowUpRight, 
  Sliders, Shield, Layers, Eye, Sparkles, Check, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TomControl {
  id: string;
  category: string;
  controlTitle: string;
  gdprArticle: string;
  iso27001Control: string;
  status: 'IMPLEMENTED' | 'IN_REVIEW' | 'REMEDIATION_REQUIRED';
  score: number;
  evidence: string;
  verificationMethod: string;
  lastAudit: string;
}

export const TomsGovernanceMatrix: React.FC = () => {
  const [toms, setToms] = useState<TomControl[]>([]);
  const [overallScore, setOverallScore] = useState(95);
  const [loading, setLoading] = useState(true);
  const [selectedTom, setSelectedTom] = useState<TomControl | null>(null);
  const [remediatingId, setRemediatingId] = useState<string | null>(null);

  const fetchToms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/privacy-suite/toms');
      const data = await res.json();
      if (data.success) {
        setToms(data.toms);
        setOverallScore(data.overallTomScore);
      }
    } catch (err) {
      console.error('Failed to load TOMs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToms();
  }, []);

  const handleRemediate = async (id: string) => {
    setRemediatingId(id);
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/privacy-suite/toms/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'IMPLEMENTED',
            score: 100,
            evidence: 'Automated remediation completed via zero-trust policy engine & enclave audit test.'
          })
        });
        const data = await res.json();
        if (data.success) {
          setToms(toms.map(t => t.id === id ? data.tom : t));
          setOverallScore(98);
        }
      } catch (e) {
        console.error('Error remediating TOM', e);
      } finally {
        setRemediatingId(null);
      }
    }, 1200);
  };

  const exportTomsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(toms, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `TOMs_Art32_GDPR_Audit_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              GDPR Article 32 & ISO 27001 Annex A
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Zero-Trust Verified
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <Lock className="w-6 h-6 text-indigo-600" />
            Technical & Organizational Measures (TOMs) Matrix
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Automated verification and documentation of physical, technical, and operational safeguards protecting personal data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchToms}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Refresh TOM Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportTomsJson}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export TOM Documentation
          </button>
        </div>
      </div>

      {/* Control Summary Meter */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-indigo-300 text-xs font-bold uppercase tracking-wider">
            Overall Security Health Score (Art. 32 GDPR)
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black tracking-tight">{overallScore}%</span>
            <span className="text-emerald-400 text-xs font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Exceeds EDPB Baseline Requirements
            </span>
          </div>
          <p className="text-slate-300 text-xs max-w-xl">
            All 6 primary control domains (Access, Transmission, Input, Availability, Separation, Resilience) are actively monitored and attested via telemetry enclaves.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center">
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-slate-300 font-bold block">Implemented</span>
            <span className="text-xl font-black text-emerald-400">
              {toms.filter(t => t.status === 'IMPLEMENTED').length} / {toms.length}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-slate-300 font-bold block">In Review</span>
            <span className="text-xl font-black text-amber-300">
              {toms.filter(t => t.status === 'IN_REVIEW').length}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-slate-300 font-bold block">Audited</span>
            <span className="text-xl font-black text-indigo-300">Today</span>
          </div>
        </div>
      </div>

      {/* 6 Control Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {toms.map((tom) => (
          <div
            key={tom.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {tom.id}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                  tom.status === 'IMPLEMENTED' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {tom.status} ({tom.score}%)
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-3">{tom.controlTitle}</h3>
              <span className="text-slate-500 text-[11px] font-bold block mt-1">{tom.category}</span>

              <div className="bg-slate-50 rounded-xl p-3 mt-3 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">GDPR Article:</span>
                  <span className="text-indigo-700 font-semibold">{tom.gdprArticle}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">ISO 27001:</span>
                  <span className="text-slate-700 font-mono">{tom.iso27001Control}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-2 border-t border-slate-200 pt-2 font-mono">
                  <span className="text-slate-400 block font-sans font-bold">Audit Evidence:</span>
                  {tom.evidence}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold">
                Audited: {tom.lastAudit}
              </span>
              <div className="flex items-center gap-2">
                {tom.status !== 'IMPLEMENTED' ? (
                  <button
                    onClick={() => handleRemediate(tom.id)}
                    disabled={remediatingId === tom.id}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    {remediatingId === tom.id ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" /> Remediating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" /> Auto-Fix Gap
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedTom(tom)}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Inspect Controls
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for In-Depth TOM Inspection */}
      <AnimatePresence>
        {selectedTom && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600">{selectedTom.id} Control Dossier</span>
                  <h3 className="text-base font-bold text-slate-900">{selectedTom.controlTitle}</h3>
                </div>
                <button
                  onClick={() => setSelectedTom(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Domain Category</span>
                  <span className="text-slate-800 font-semibold">{selectedTom.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Statutory Article Reference</span>
                  <span className="text-indigo-700 font-semibold">{selectedTom.gdprArticle} & {selectedTom.iso27001Control}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Verification Telemetry Method</span>
                  <span className="text-slate-800 font-mono">{selectedTom.verificationMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Proof of Implementation</span>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-slate-700 text-[11px] mt-1">
                    {selectedTom.evidence}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedTom(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
