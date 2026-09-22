import React, { useState } from 'react';
import { ShieldCheck, Layers, Cpu, Database, Check } from 'lucide-react';

interface TourModalProps {
  role: string;
}

export const TourModal: React.FC<TourModalProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(() => {
    return false; // Closed by default, can be toggled by user
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">9Xen Regulettee Platform Tour</h3>
            <p className="text-xs text-slate-400">Sovereign Compliance-as-a-Service Architecture</p>
          </div>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-750">
            <Layers className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Module 1 &amp; 2: Guardrails &amp; Query Caching</div>
              <div className="text-[11px] text-slate-400">Real-time statutory rule enforcement and semantic caching across SQLite &amp; DuckDB.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-750">
            <Cpu className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Module 3: Regional Sovereign Router</div>
              <div className="text-[11px] text-slate-400">Zero-trust jurisdiction routing ensuring EU GDPR and AI Act localization.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-750">
            <Database className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Module 4: Immutable Audit Ledger</div>
              <div className="text-[11px] text-slate-400">Cryptographically verifiable event hash-chains for regulatory readiness.</div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Acknowledge Sovereign Tour
          </button>
        </div>
      </div>
    </div>
  );
};
