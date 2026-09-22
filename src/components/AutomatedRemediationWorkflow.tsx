import React, { useState, useEffect } from "react";
import { Wrench, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, Check } from "lucide-react";

export interface FlaggedViolation {
  id: string;
  target?: string;
  title?: string;
  act?: string;
  source?: string;
  targetConfigFile?: string;
  codeSnippet?: string;
  statuteCitation?: string;
  issue: string;
  severity?: string;
  status?: string;
  timestamp?: string;
  [key: string]: any;
}

export const AutomatedRemediationWorkflow: React.FC<any> = ({ className = "" }) => {
  const [patches, setPatches] = useState<FlaggedViolation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  const fetchPatches = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/remediation/patches');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPatches(data.patches || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch remediation patches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatches();
  }, []);

  const handleApplyPatch = async (id: string) => {
    try {
      setApplyingId(id);
      const res = await fetch('/api/v1/remediation/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAppliedMessage(data.message);
          fetchPatches();
          setTimeout(() => setAppliedMessage(null), 4000);
        }
      }
    } catch (err) {
      console.error('Failed to apply remediation hotfix:', err);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Automated Remediation Patch Workflow</h3>
          <p className="text-xs text-slate-400">Self-healing regulatory code patches &amp; automated hotfixes</p>
        </div>
      </div>

      {appliedMessage && (
        <div className="mb-3 bg-emerald-950/90 border border-emerald-700/60 px-3.5 py-2 rounded-xl text-xs text-emerald-200 flex items-center gap-2 font-mono">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{appliedMessage}</span>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-6 text-xs font-mono text-slate-500">
            Scanning enclave for available regulatory patches...
          </div>
        ) : (
          patches.map((p) => (
            <div key={p.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">{p.id}</span>
                  <span className="text-xs font-semibold text-cyan-300">{p.target}</span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">{p.issue}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.timestamp}</div>
              </div>

              <div>
                {p.status === "APPLIED" ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                  </span>
                ) : (
                  <button
                    onClick={() => handleApplyPatch(p.id)}
                    disabled={applyingId === p.id}
                    className="flex items-center gap-1 text-[11px] font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-3 py-1 rounded-lg transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
                  >
                    <span>{applyingId === p.id ? 'Applying...' : 'Apply Patch'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AutomatedRemediationWorkflow;
