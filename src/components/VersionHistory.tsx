import React from 'react';
import { motion } from 'motion/react';
import { Clock, User, CheckCircle2, ChevronRight, FileCode2 } from 'lucide-react';
import { PolicySnapshot } from '../pages/PolicyEngine';

interface VersionHistoryProps {
  history: PolicySnapshot[];
  onRevert: (snapshot: PolicySnapshot) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ history, onRevert }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          Version History & Diff
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.map((snapshot, index) => {
          const prev = history[index + 1];
          const hasChanges = prev && JSON.stringify(prev.rules) !== JSON.stringify(snapshot.rules);

          return (
            <motion.div 
              key={snapshot.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative pl-6 pb-6 border-l border-slate-100 last:border-0 last:pb-0"
            >
              <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white ring-2 ring-indigo-50" />
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-colors group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(snapshot.publishedAt).toLocaleString()}
                  </span>
                  <button 
                    onClick={() => onRevert(snapshot)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase rounded transition-all"
                  >
                    Revert
                  </button>
                </div>
                
                <div className="text-xs font-bold text-slate-800 mb-2">{snapshot.name}</div>
                
                <div className="flex items-center gap-4 text-[10px] text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {snapshot.approvedBy}
                  </span>
                </div>

                {hasChanges && (
                  <div className="mt-3 bg-white p-2 rounded-lg border border-slate-100 text-[10px] font-mono text-slate-600">
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <FileCode2 className="w-3 h-3" /> Diff Summary
                    </div>
                    {snapshot.rules.length > prev.rules.length ? (
                      <span className="text-emerald-600">+ {snapshot.rules.length - prev.rules.length} rule(s) added</span>
                    ) : (
                      <span className="text-rose-600">- {prev.rules.length - snapshot.rules.length} rule(s) removed</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
