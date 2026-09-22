import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';

interface Recommendation {
  id: string;
  category: 'EU_AI_ACT' | 'DORA' | 'GDPR';
  title: string;
  impact: 'HIGH' | 'MEDIUM';
  action: string;
  status: 'PENDING' | 'APPLIED';
}

export interface ComplianceAdvisorWidgetProps {
  tenantId?: any;
  onSuggestionsUpdate?: any;
  [key: string]: any;
}

export const ComplianceAdvisorWidget: React.FC<ComplianceAdvisorWidgetProps> = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: 'rec-1',
      category: 'EU_AI_ACT',
      title: 'Attach Annex IV Technical Documentation to Claude 3.5 Sonnet pipeline',
      impact: 'HIGH',
      action: 'Generate Dossier',
      status: 'PENDING'
    },
    {
      id: 'rec-2',
      category: 'DORA',
      title: 'Enable Multi-Region Active-Active failover heartbeat for AWS eu-central-1',
      impact: 'HIGH',
      action: 'Arm Failover',
      status: 'PENDING'
    },
    {
      id: 'rec-3',
      category: 'GDPR',
      title: 'Schedule quarterly biometric hash re-encryption with ML-KEM-768',
      impact: 'MEDIUM',
      action: 'Queue Rotation',
      status: 'PENDING'
    }
  ]);

  const handleApply = (id: string) => {
    setRecommendations(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'APPLIED' } : r))
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Autonomous AI Compliance Advisor</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time statutory drift mitigation recommendations</p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
          Gemini 2.5 Pro Active
        </span>
      </div>

      <div className="space-y-2.5">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {rec.category}
                </span>
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${rec.impact === 'HIGH' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'}`}>
                  {rec.impact} PRIORITY
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{rec.title}</p>
            </div>

            <button
              onClick={() => handleApply(rec.id)}
              disabled={rec.status === 'APPLIED'}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                rec.status === 'APPLIED'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              {rec.status === 'APPLIED' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Remediated
                </>
              ) : (
                <>
                  {rec.action}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ComplianceAdvisorWidget;
