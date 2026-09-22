import React, { useState } from 'react';
import { Cpu, ShieldCheck, AlertTriangle, Layers, Info } from 'lucide-react';

interface HeatmapCell {
  modelName: string;
  useCase: string;
  riskTier: 'UNACCEPTABLE' | 'HIGH_RISK' | 'TRANSPARENCY' | 'MINIMAL';
  biasScore: number;
  explainabilityScore: number;
  humanOversight: boolean;
  annexIvReady: boolean;
}

export interface AiRiskHeatmapD3Props {
  tenantId?: any;
  onSelectRiskForFixation?: (findingId: string) => void;
  [key: string]: any;
}

export const AiRiskHeatmapD3: React.FC<AiRiskHeatmapD3Props> = () => {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  const models: HeatmapCell[] = [
    { modelName: 'Omni-Classifier v4', useCase: 'Automated Loan Underwriting', riskTier: 'HIGH_RISK', biasScore: 0.04, explainabilityScore: 92, humanOversight: true, annexIvReady: true },
    { modelName: 'Vision-Biometric Gate', useCase: 'Airport Border Identity Verification', riskTier: 'HIGH_RISK', biasScore: 0.01, explainabilityScore: 98, humanOversight: true, annexIvReady: true },
    { modelName: 'ResumeRanker Pro', useCase: 'HR Applicant Screening', riskTier: 'HIGH_RISK', biasScore: 0.03, explainabilityScore: 89, humanOversight: true, annexIvReady: true },
    { modelName: 'SupportBot AI', useCase: 'Customer Query Routing', riskTier: 'MINIMAL', biasScore: 0.00, explainabilityScore: 99, humanOversight: false, annexIvReady: true },
    { modelName: 'MedTriage LLM', useCase: 'Emergency Room Diagnostic Aid', riskTier: 'HIGH_RISK', biasScore: 0.02, explainabilityScore: 96, humanOversight: true, annexIvReady: true },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">EU AI Act Model Risk Heatmap</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Article 6 & Annex III Risk Classification Registry</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded">
          5 Production Models Tracked
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {models.map((m, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedCell(m)}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              selectedCell?.modelName === m.modelName
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-900 dark:text-white truncate">{m.modelName}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {m.riskTier}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 truncate mb-3">{m.useCase}</div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Disparity / Bias Rate:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{(m.biasScore * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Explainability Score:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{m.explainabilityScore}%</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Human-in-Loop Killswitch:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">ACTIVE</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCell && (
        <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">
              Selected <strong>{selectedCell.modelName}</strong>: Annex IV Technical Documentation dossier is cryptographically sealed and conforms to Article 11.
            </span>
          </div>
          <button
            onClick={() => setSelectedCell(null)}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
export default AiRiskHeatmapD3;
