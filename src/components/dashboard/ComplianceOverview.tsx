import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowUpRight, CheckCircle2, AlertTriangle, RefreshCw, Activity, Layers, Lock, Cpu, Globe } from 'lucide-react';

interface ComplianceFrameworkScore {
  act: string;
  name: string;
  score: number;
  status: 'OPTIMAL' | 'ATTENTION' | 'CRITICAL';
  articlesCompliant: number;
  totalArticles: number;
  lastAudited: string;
  icon: any;
}

export interface ComplianceOverviewProps {
  tenantId?: any;
  [key: string]: any;
}

export const ComplianceOverview: React.FC<ComplianceOverviewProps> = () => {
  const [scores, setScores] = useState<ComplianceFrameworkScore[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveScores = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/v1/compliance/score');
      if (res.ok) {
        const data = await res.json();
        setOverallScore(Math.round(data.overallScore));
        setScores(data.frameworks.map((f: any) => ({
          ...f,
          icon: f.act === 'GDPR' ? Lock : f.act === 'EU_AI_ACT' ? Cpu : f.act === 'DORA' ? Layers : Globe
        })));
      }
    } catch (e) {
      console.error('Failed to fetch compliance scores', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveScores();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200/50 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Multi-Regulation Compliance Posture
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Continuous cryptographic statutory verification</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Composite Index</div>
            <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{overallScore}%</div>
          </div>
          <button
            onClick={fetchLiveScores}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {scores.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.act} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.act}</span>
                  <span className="text-[10px] font-mono text-slate-400">{s.lastAudited}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={s.name}>
                  {s.name}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[11px] text-slate-500">{s.articlesCompliant}/{s.totalArticles} Articles</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{s.score}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ComplianceOverview;
