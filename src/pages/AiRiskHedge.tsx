import React, { useState } from "react";
import { 
  Brain, ShieldCheck, FileWarning, LineChart, Cpu, DollarSign, 
  Activity, Scale, ShieldAlert, ArrowUpRight, CheckCircle2, 
  RefreshCw, TrendingUp, AlertTriangle, FileText, Download
} from "lucide-react";

export function AiRiskHedge() {
  const [globalTurnoverEur, setGlobalTurnoverEur] = useState<number>(500000000); // 500M
  const [hedgedCoverage, setHedgedCoverage] = useState<number>(85); // 85%
  const [selectedTier, setSelectedTier] = useState<'ANNEX_III' | 'PROHIBITED' | 'TRANSPARENCY'>('ANNEX_III');
  const [isSimulatingContract, setIsSimulatingContract] = useState(false);
  const [contractCreated, setContractCreated] = useState(false);

  // Statutory Calculations (EU AI Act Article 99)
  // Prohibited: up to €35M or 7% global turnover (whichever higher)
  // Annex III High Risk: up to €15M or 3% global turnover (whichever higher)
  // Transparency (Art 50): up to €7.5M or 1.5% global turnover
  const prohibitedMaxFine = Math.max(35000000, globalTurnoverEur * 0.07);
  const annex3MaxFine = Math.max(15000000, globalTurnoverEur * 0.03);
  const transparencyMaxFine = Math.max(7500000, globalTurnoverEur * 0.015);

  const selectedMaxFine = selectedTier === 'PROHIBITED' ? prohibitedMaxFine 
    : selectedTier === 'ANNEX_III' ? annex3MaxFine 
    : transparencyMaxFine;

  const hedgedAmount = selectedMaxFine * (hedgedCoverage / 100);
  const netResidualExposure = selectedMaxFine - hedgedAmount;
  const annualPremiumEur = selectedMaxFine * 0.008; // 0.8% of max exposure

  const handleCreateHedge = () => {
    setIsSimulatingContract(true);
    setTimeout(() => {
      setIsSimulatingContract(false);
      setContractCreated(true);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
              <LineChart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                AI Risk Hedge & Regulatory Liability Derivatives
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  EU AI Act Art. 99 Financial Sandbox
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Parametric smart contracts hedging statutory fine liabilities up to €35M / 7% global annual turnover.
              </p>
            </div>
          </div>

          <button 
            onClick={handleCreateHedge}
            disabled={isSimulatingContract}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
          >
            {isSimulatingContract ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Underwriting Derivative...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Underwrite Parametric SLA Hedge
              </>
            )}
          </button>
        </div>
      </div>

      {/* Financial Exposure KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Statutory Ceiling Exposure
          </span>
          <div className="text-2xl font-black text-rose-600 font-mono">
            €{(selectedMaxFine / 1000000).toFixed(1)}M
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Max penalty under Art. 99
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Hedged Indemnity Shield
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            €{(hedgedAmount / 1000000).toFixed(1)}M
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">
            {hedgedCoverage}% liability covered
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Net Residual Corporate Risk
          </span>
          <div className="text-2xl font-black text-slate-800 font-mono">
            €{(netResidualExposure / 1000000).toFixed(1)}M
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Uncovered self-insured retention
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Parametric Annual Premium
          </span>
          <div className="text-2xl font-black text-indigo-600 font-mono">
            €{(annualPremiumEur / 1000).toFixed(0)}k/yr
          </div>
          <span className="text-[11px] text-indigo-600 font-medium block mt-1">
            Tied to continuous DPIA compliance
          </span>
        </div>
      </div>

      {/* Main Interactive Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration & Exposure Engine */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              Corporate Turnover & AI System Risk Class Simulator
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Adjust your global enterprise revenues and target AI classification to calculate dynamic liability.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700">Global Annual Enterprise Turnover (€):</span>
                <span className="text-indigo-600 font-mono">€{(globalTurnoverEur / 1000000).toFixed(0)}M</span>
              </div>
              <input
                type="range"
                min={10000000}
                max={5000000000}
                step={10000000}
                value={globalTurnoverEur}
                onChange={(e) => setGlobalTurnoverEur(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700">Parametric Hedge Coverage Ratio (%):</span>
                <span className="text-emerald-600 font-mono">{hedgedCoverage}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={hedgedCoverage}
                onChange={(e) => setHedgedCoverage(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Target AI System Risk Classification:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTier('ANNEX_III')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedTier === 'ANNEX_III'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">High Risk (Annex III)</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">€15M or 3% Turnover</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTier('PROHIBITED')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedTier === 'PROHIBITED'
                      ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-rose-900 block">Prohibited (Art. 5)</span>
                  <span className="text-[11px] text-rose-700 block mt-0.5">€35M or 7% Turnover</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTier('TRANSPARENCY')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedTier === 'TRANSPARENCY'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-emerald-900 block">Transparency (Art. 50)</span>
                  <span className="text-[11px] text-emerald-700 block mt-0.5">€7.5M or 1.5% Turnover</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Active Smart Contracts & Parametric Indemnity */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Parametric SLA Hedge Smart Contract
            </h3>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Underwriting Syndicate:</span>
                <span className="font-semibold text-slate-900">9Xen Regulettee Sovereign Lloyd's Consortium</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Oracle Trigger:</span>
                <span className="font-mono text-indigo-600">EDPB / National DPA Fine Notice</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Continuous Audit Oracle:</span>
                <span className="font-semibold text-emerald-600">9Xen Regulettee Real-Time Ledger</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payout Settlement SLA:</span>
                <span className="font-mono text-slate-800">&lt; 48 Hours via SWIFT ISO 20022</span>
              </div>
            </div>

            {contractCreated && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Parametric Derivative Contract Active
                </span>
                <p className="text-[11px] text-emerald-700">
                  Contract Hash: <span className="font-mono">0x992a...c81f</span> • Policy Shield: €{(hedgedAmount / 1000000).toFixed(1)}M
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                const blob = new Blob([`AI LIABILITY DERIVATIVE CONTRACT\nMax Fine Exposure: €${selectedMaxFine}\nHedged Indemnity: €${hedgedAmount}\nPremium: €${annualPremiumEur}\nUnderwriter: 9Xen Regulettee Consortium`], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `AI_LIABILITY_HEDGE_POLICY_${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> Download Certified Policy Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AiRiskHedge;
