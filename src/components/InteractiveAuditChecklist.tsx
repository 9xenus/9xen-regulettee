import React, { useState } from 'react';
import { CheckSquare, Square, ShieldCheck, CheckCircle2, ListChecks, ArrowRight } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  lawRef: string;
  completed: boolean;
}

export interface InteractiveAuditChecklistProps {
  onStatusChange?: (items: any[]) => void;
  [key: string]: any;
}

export const InteractiveAuditChecklist: React.FC<InteractiveAuditChecklistProps> = ({ onStatusChange }) => {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: 'c1', category: 'GDPR', title: 'Maintain complete Article 30 ROPA inventory with DPO signature', lawRef: 'Art. 30', completed: true },
    { id: 'c2', category: 'EU AI Act', title: 'Generate Annex IV Technical Documentation dossier for production LLM', lawRef: 'Annex IV', completed: true },
    { id: 'c3', category: 'DORA', title: 'Verify hot-standby multi-cloud replica RTO < 15 minutes', lawRef: 'Art. 16', completed: true },
    { id: 'c4', category: 'NIS2', title: 'Arm CSIRT automated 24-hour webhook dispatch pipeline', lawRef: 'Art. 23', completed: false },
    { id: 'c5', category: 'Schrems II', title: 'Conduct Transfer Impact Assessment (TIA) for US subprocessors', lawRef: 'Art. 46', completed: true },
  ]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const completedCount = items.filter(i => i.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Statutory Audit Pre-Flight Checklist</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Mandatory verification controls for regulatory inspection</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{completedCount}/{items.length} Complete</div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
            {progressPercent}%
          </span>
        </div>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
              item.completed
                ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/60'
                : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded border-2 border-slate-400 dark:border-slate-500 shrink-0" />
              )}
              <span className={`text-xs font-medium ${item.completed ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                {item.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {item.category} {item.lawRef}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default InteractiveAuditChecklist;
