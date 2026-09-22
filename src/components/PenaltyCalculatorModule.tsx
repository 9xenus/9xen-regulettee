import React, { useState } from 'react';
import { 
  Calculator, 
  Scale, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingDown, 
  CheckCircle2, 
  DollarSign, 
  Sparkles,
  Info,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const PenaltyCalculatorModule: React.FC = () => {
  const { showToast } = useNotification();
  const [turnover, setTurnover] = useState(85000000); // 85M EUR
  const [tier, setTier] = useState<'TIER_1' | 'TIER_2' | 'AI_HIGH_RISK'>('TIER_2');
  const [dataSubjectsAffected, setDataSubjectsAffected] = useState(25000);
  const [intentionality, setIntentionality] = useState<'NEGLIGENCE' | 'INTENTIONAL' | 'UNKNOWN'>('NEGLIGENCE');
  const [remediatedEarly, setRemediatedEarly] = useState(true);

  const fineBreakdown = React.useMemo(() => {
    let maxCap = tier === 'TIER_1' ? 10000000 : tier === 'TIER_2' ? 20000000 : 35000000;
    let pctCap = turnover * (tier === 'TIER_1' ? 0.02 : tier === 'TIER_2' ? 0.04 : 0.07);
    const statutoryCap = Math.max(maxCap, pctCap);

    let subjectFactor = Math.min(2.5, 0.5 + Math.log10(Math.max(100, dataSubjectsAffected)) * 0.3);
    let base = statutoryCap * 0.05 * subjectFactor;

    if (intentionality === 'INTENTIONAL') base *= 2.0;
    if (remediatedEarly) base *= 0.65; // 35% discount for prompt technical remediation

    return {
      statutoryCap,
      estimatedExposure: Math.min(statutoryCap, Math.round(base)),
      mitigationSavings: Math.round(base / 0.65 * 0.35)
    };
  }, [turnover, tier, dataSubjectsAffected, intentionality, remediatedEarly]);

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-950/80 border border-red-700/60 rounded-xl text-red-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Interactive Regulatory Penalty Exposure Calculator</h3>
            <p className="text-xs text-slate-400">Simulate EDPB Guidelines 04/2022 calculation matrix and mitigation paths.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono">
          EDPB 04/2022 v3.1 Engine
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Annual Global Revenue (€ EUR): €{turnover.toLocaleString()}
            </label>
            <input
              type="range"
              min="5000000"
              max="500000000"
              step="5000000"
              value={turnover}
              onChange={(e) => setTurnover(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Legal Infringement Classification
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'TIER_1', label: 'GDPR Tier 1', sub: '2% / €10M' },
                { id: 'TIER_2', label: 'GDPR Tier 2', sub: '4% / €20M' },
                { id: 'AI_HIGH_RISK', label: 'EU AI Act', sub: '7% / €35M' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTier(t.id as any)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    tier === t.id
                      ? 'bg-red-950/70 border-red-500 text-red-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{t.label}</div>
                  <div className="text-[10px] font-mono text-slate-400">{t.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Estimated Data Subjects Impacted: {dataSubjectsAffected.toLocaleString()}
            </label>
            <input
              type="range"
              min="500"
              max="500000"
              step="1000"
              value={dataSubjectsAffected}
              onChange={(e) => setDataSubjectsAffected(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mitigating &amp; Aggravating Criteria
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300">Prompt Technical Containment &amp; DPO Disclosure</span>
              <input
                type="checkbox"
                checked={remediatedEarly}
                onChange={(e) => setRemediatedEarly(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Penalty Exposure Forecast
            </div>

            <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60">
              <div className="text-xs text-red-300 font-medium">Estimated Enforcement Fine Exposure</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-1">
                €{fineBreakdown.estimatedExposure.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Statutory Ceiling: €{fineBreakdown.statutoryCap.toLocaleString()}
              </div>
            </div>

            {remediatedEarly && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-300 font-medium">Early Containment Mitigation Savings</span>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-400">
                  -€{fineBreakdown.mitigationSavings.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => showToast(`Generated Certified Mitigation Defense Memo. Saved penalty potential: €${fineBreakdown.mitigationSavings.toLocaleString()}`, 'success')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Export Legal Defense Assessment Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenaltyCalculatorModule;
