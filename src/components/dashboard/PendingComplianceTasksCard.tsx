import React, { useState } from 'react';
import { AlertTriangle, ArrowUpRight, CheckCircle2, Wrench, Upload, PlayCircle, Loader2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface PendingComplianceTasksCardProps {
  onNavigate?: (path: string) => void;
  onUploadDocument?: () => void;
}

export const PendingComplianceTasksCard: React.FC<PendingComplianceTasksCardProps> = ({ onNavigate, onUploadDocument }) => {
  const { showToast } = useNotification();
  const [fixingTasks, setFixingTasks] = useState<Record<string, boolean>>({});

  const handleAutofix = (taskId: string) => {
    setFixingTasks(prev => ({ ...prev, [taskId]: true }));
    setTimeout(() => {
      setFixingTasks(prev => ({ ...prev, [taskId]: false }));
      showToast(`Auto-fix successful! Configuration deployed.`, 'success');
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>Actionable Compliance Tasks</span>
        </h2>
        {onNavigate && (
          <button 
            onClick={() => onNavigate('tasks')}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View Full Tasks Page &rarr;
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
        <div className="divide-y divide-slate-100">
          {/* Task 1: Auto-Fixable */}
          <div className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  CRITICAL
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                  <Wrench className="w-3 h-3" /> Auto-Fix Available
                </span>
                <h3 className="font-bold text-slate-900 w-full sm:w-auto mt-1 sm:mt-0">
                  Implement Multi-Region Failover Architecture
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-2 max-w-2xl leading-relaxed">
                A recent legislative update requires strict adherence to rule 'multi-region-failover'. Immediate action is required to prevent compliance drift.
              </p>
              <p className="text-xs font-mono text-slate-400">
                Ref: EU DORA Amendment 2026 Art 11.4
              </p>
            </div>
            <div className="flex flex-col gap-2 min-w-[150px]">
              <button 
                onClick={() => handleAutofix('t1')}
                disabled={fixingTasks['t1']}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              >
                {fixingTasks['t1'] ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deploying...</>
                ) : (
                  <><Wrench className="w-3.5 h-3.5" /> Trigger Auto-Fix</>
                )}
              </button>
              <button className="w-full text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                Manual Review <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Task 2: Manual Upload */}
          <div className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  HIGH
                </span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Manual Action
                </span>
                <h3 className="font-bold text-slate-900 w-full sm:w-auto mt-1 sm:mt-0">
                  Upload Updated Data Processing Agreement (DPA)
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-2 max-w-2xl leading-relaxed">
                Missing valid documentation for cross-border data transfer mechanisms. A signed DPA is required for vendor 'CloudScale EU'.
              </p>
              <p className="text-xs font-mono text-slate-400">
                Ref: GDPR Art. 28 Update
              </p>
            </div>
            <div className="flex flex-col gap-2 min-w-[150px]">
              <button onClick={onUploadDocument} className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5" /> Upload to Vault
              </button>
            </div>
          </div>

          {/* Task 3: Guided Workflow */}
          <div className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  HIGH
                </span>
                <span className="bg-purple-50 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded border border-purple-200 uppercase tracking-wider flex items-center gap-1">
                  <PlayCircle className="w-3 h-3" /> Guided Workflow
                </span>
                <h3 className="font-bold text-slate-900 w-full sm:w-auto mt-1 sm:mt-0">
                  Review AI Model Data Governance
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-2 max-w-2xl leading-relaxed">
                Upcoming AI Act compliance deadline requires an impact assessment for the customer service chatbot model 'Support-GPT'.
              </p>
              <p className="text-xs font-mono text-slate-400">
                Ref: EU AI Act Art. 10
              </p>
            </div>
            <div className="flex flex-col gap-2 min-w-[150px]">
              <button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                <PlayCircle className="w-3.5 h-3.5" /> Start Assessment
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

