import React, { useState } from 'react';
import { 
  Calculator, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  DollarSign, 
  FileText 
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const GdprFineCalculator: React.FC = () => {
  const { showToast } = useNotification();
  const [turnover, setTurnover] = useState(60000000);
  const [tier, setTier] = useState<'TIER_1' | 'TIER_2'>('TIER_2');
  const [intentionality, setIntentionality] = useState<'NEGLIGENT' | 'INTENTIONAL'>('NEGLIGENT');
  const [priorInfringements, setPriorInfringements] = useState(false);

  const fine = React.useMemo(() => {
    const fixedCap = tier === 'TIER_1' ? 10000000 : 20000000;
    const turnoverCap = turnover * (tier === 'TIER_1' ? 0.02 : 0.04);
    const statutoryMax = Math.max(fixedCap, turnoverCap);

    let base = statutoryMax * 0.08;
    if (intentionality === 'INTENTIONAL') base *= 1.8;
    if (priorInfringements) base *= 1.4;

    return {
      statutoryMax,
      estimatedFine: Math.round(Math.min(statutoryMax, base))
    };
  }, [turnover, tier, intentionality, priorInfringements]);

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-950/80 border border-red-700/60 rounded-xl text-red-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">GDPR Article 83 Statutory Fine Calculator</h3>
            <p className="text-xs text-slate-400">Harmonized EDPB 04/2022 calculation methodology for supervisory authorities and defense counsel.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Annual Global Turnover (€): €{turnover.toLocaleString()}
            </label>
            <input
              type="range"
              min="1000000"
              max="200000000"
              step="1000000"
              value={turnover}
              onChange={(e) => setTurnover(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Infringement Provision Tier
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTier('TIER_1')}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  tier === 'TIER_1' ? 'bg-red-950/70 border-red-500 text-red-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold text-white">Tier 1 (Art. 83(4))</div>
                <div className="text-[10px] text-slate-400">Up to €10M or 2%</div>
              </button>
              <button
                type="button"
                onClick={() => setTier('TIER_2')}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  tier === 'TIER_2' ? 'bg-red-950/70 border-red-500 text-red-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold text-white">Tier 2 (Art. 83(5))</div>
                <div className="text-[10px] text-slate-400">Up to €20M or 4%</div>
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Recidivist Prior Infringements (+40%)</span>
              <input
                type="checkbox"
                checked={priorInfringements}
                onChange={(e) => setPriorInfringements(e.target.checked)}
                className="w-4 h-4 accent-red-500 rounded"
              />
            </label>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Statutory Fine Exposure
            </div>
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 mt-2">
              <div className="text-xs text-red-300">Estimated Fine Sanction</div>
              <div className="text-3xl font-extrabold text-white font-mono mt-1">
                €{fine.estimatedFine.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Maximum Statutory Cap: €{fine.statutoryMax.toLocaleString()}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => showToast('Exported GDPR Art. 83 Fine Breakdown Sheet', 'info')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Export Calculation Sheet
          </button>
        </div>
      </div>
    </div>
  );
};

export default GdprFineCalculator;
