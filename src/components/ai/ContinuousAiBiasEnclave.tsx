import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle2, AlertTriangle, Download, RefreshCw, Activity, ShieldCheck, Cpu, Sliders } from 'lucide-react';

export const ContinuousAiBiasEnclave: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [biasData, setBiasData] = useState<any>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<string>('all');

  const runBiasAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/ai-act/bias-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: 'CREDIT_UNDERWRITING_AI_V4',
          modelName: 'High-Risk Automated Credit & Underwriting Model',
          evalDatasetSize: 100000,
          protectedAttributes: ['gender', 'age_bracket', 'nationality']
        })
      });
      const json = await res.json();
      if (json.success) {
        setBiasData(json.data);
      }
    } catch (e) {
      console.error('Failed to run bias audit:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runBiasAudit();
  }, []);

  const downloadAnnexIvReport = () => {
    if (!biasData) return;
    const blob = new Blob([JSON.stringify(biasData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EU-AI-ACT-ANNEX-IV-BIAS-AUDIT-${biasData.modelId}.json`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Scale className="w-3 h-3" /> EU AI Act Article 10 &amp; 15 Mandate
          </div>
          <h3 className="text-base font-bold text-slate-900">Continuous AI Bias, Parity &amp; Fairness Audit Enclave</h3>
          <p className="text-xs text-slate-500">
            Real-time quantitative analysis of demographic parity, equalized odds, and disparate impact ratios across high-risk decision workloads.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runBiasAudit}
            disabled={loading}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Evaluating Model...' : 'Trigger Live Enclave Audit'}
          </button>
          <button
            onClick={downloadAnnexIvReport}
            disabled={!biasData}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export Annex IV Dossier
          </button>
        </div>
      </div>

      {biasData && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-slate-500">Disparate Impact Ratio</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{biasData.metrics.disparateImpactRatio}</span>
                <span className="text-xs font-bold text-emerald-600">≥ 0.80 (Four-Fifths Rule)</span>
              </div>
              <div className="mt-2 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 inline-block">
                Status: {biasData.metrics.fourFifthsRuleConformity}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-slate-500">Demographic Parity Diff</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{biasData.metrics.demographicParityDifference}</span>
                <span className="text-xs font-bold text-indigo-600">≤ 0.05 Target</span>
              </div>
              <div className="mt-2 text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 inline-block">
                Conformity: {biasData.metrics.statisticalParityConformity}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-slate-500">Equalized Odds Disparity</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{biasData.metrics.equalizedOddsDisparity}</span>
                <span className="text-xs font-bold text-slate-500">&lt; 0.05 Delta</span>
              </div>
              <div className="mt-2 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 inline-block">
                Cert: {biasData.certificationStatus}
              </div>
            </div>
          </div>

          {/* Protected Attributes Evaluation Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Protected Class Fairness Metrics (Art. 10(2)(f))
              </h4>
              <span className="text-[11px] font-mono text-slate-500">Dataset: 100,000 Synthetic Production Queries</span>
            </div>
            <div className="divide-y divide-slate-100">
              {biasData.protectedAttributeResults.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{item.attribute}</span>
                    <span className="text-[11px] text-slate-500 block font-mono">Statistical Equal Probability Standard</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.parityScore * 100}%` }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-800 w-10 text-right">
                      {(item.parityScore * 100).toFixed(0)}%
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Annex IV Technical Mitigations & Signoff */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> EU AI Act Annex IV Technical Dossier Debiasing Record
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-indigo-900 font-mono pt-1">
              <div>• Inverse Probability Weighting: <span className="font-bold text-emerald-700">ACTIVE</span></div>
              <div>• Adversarial Debiasing Epochs: <span className="font-bold text-emerald-700">14 Epochs</span></div>
              <div>• Enclave Signoff Hash: <span className="font-bold text-slate-700 truncate block">{biasData.annexIvMitigationRecord.dpoSignoffHash.slice(0, 16)}...</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
