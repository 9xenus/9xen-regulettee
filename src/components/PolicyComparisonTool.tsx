import React, { useState } from 'react';
import { Sliders, ArrowLeftRight, CheckCircle2, ShieldCheck, Layers } from 'lucide-react';

export const PolicyComparisonTool: React.FC = () => {
  const [selectedLawA, setSelectedLawA] = useState('GDPR');
  const [selectedLawB, setSelectedLawB] = useState('EU_AI_ACT');

  const comparisons: Record<string, { scope: string; penalty: string; keyObligation: string }> = {
    GDPR: {
      scope: 'Personal Data Processing & EU Data Subject Rights',
      penalty: 'Up to €20M or 4% of Global Annual Turnover',
      keyObligation: 'Lawful basis, minimization, storage limitation, DPIA & DSAR 30-day SLA.'
    },
    EU_AI_ACT: {
      scope: 'High-Risk AI Systems, Foundation Models & General Purpose AI',
      penalty: 'Up to €35M or 7% of Global Annual Turnover',
      keyObligation: 'Annex IV technical dossier, risk management, human oversight, training lineage.'
    },
    DORA: {
      scope: 'Financial Entities & Critical ICT Third-Party Providers',
      penalty: 'Periodic penalty payments up to 1% of daily average worldwide turnover',
      keyObligation: 'ICT risk management framework, incident reporting, operational resilience testing.'
    },
    NIS2: {
      scope: 'Essential and Important Entities across Critical Infrastructure',
      penalty: 'Up to €10M or 2% of Global Annual Turnover',
      keyObligation: '24-hour CSIRT notification, cybersecurity risk measures, supply chain security.'
    }
  };

  const lawA = comparisons[selectedLawA];
  const lawB = comparisons[selectedLawB];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Statutory Regulation Diff & Comparison</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Harmonize cross-jurisdiction legal requirements</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedLawA}
            onChange={(e) => setSelectedLawA(e.target.value)}
            className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="GDPR">GDPR</option>
            <option value="EU_AI_ACT">EU AI Act</option>
            <option value="DORA">DORA</option>
            <option value="NIS2">NIS2</option>
          </select>
          <span className="text-xs text-slate-400 font-bold">vs</span>
          <select
            value={selectedLawB}
            onChange={(e) => setSelectedLawB(e.target.value)}
            className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="EU_AI_ACT">EU AI Act</option>
            <option value="GDPR">GDPR</option>
            <option value="DORA">DORA</option>
            <option value="NIS2">NIS2</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm border-b border-slate-200 dark:border-slate-700 pb-2">
            {selectedLawA}
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Scope:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">{lawA.scope}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Statutory Penalty Cap:</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">{lawA.penalty}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Core Technical Control:</span>
              <span className="text-slate-700 dark:text-slate-300">{lawA.keyObligation}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm border-b border-slate-200 dark:border-slate-700 pb-2">
            {selectedLawB}
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Scope:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">{lawB.scope}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Statutory Penalty Cap:</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">{lawB.penalty}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Core Technical Control:</span>
              <span className="text-slate-700 dark:text-slate-300">{lawB.keyObligation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PolicyComparisonTool;
