import React from 'react';
import { PlusCircle, MinusCircle, GitCompare } from 'lucide-react';

export interface DiffViewerProps {
  diffData: {
    added: string[];
    removed: string[];
  };
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diffData }) => {
  return (
    <div className="mt-3 p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 text-xs font-mono space-y-3">
      <div className="flex items-center space-x-2 text-slate-400 font-sans font-semibold border-b border-slate-800 pb-2">
        <GitCompare className="w-4 h-4 text-indigo-400" />
        <span>Legal Text Line-by-Line Diff</span>
      </div>

      {diffData.added && diffData.added.length > 0 && (
        <div className="space-y-1">
          <div className="text-[11px] font-sans font-bold text-emerald-400 flex items-center gap-1">
            <PlusCircle className="w-3.5 h-3.5" /> Added Provisions ({diffData.added.length})
          </div>
          {diffData.added.map((item, idx) => (
            <div key={idx} className="p-2 bg-emerald-950/40 border-l-2 border-emerald-500 text-emerald-200 rounded-r">
              + {item}
            </div>
          ))}
        </div>
      )}

      {diffData.removed && diffData.removed.length > 0 && (
        <div className="space-y-1">
          <div className="text-[11px] font-sans font-bold text-rose-400 flex items-center gap-1">
            <MinusCircle className="w-3.5 h-3.5" /> Removed / Repealed Provisions ({diffData.removed.length})
          </div>
          {diffData.removed.map((item, idx) => (
            <div key={idx} className="p-2 bg-rose-950/40 border-l-2 border-rose-500 text-rose-200 line-through rounded-r">
              - {item}
            </div>
          ))}
        </div>
      )}

      {(!diffData.added?.length && !diffData.removed?.length) && (
        <div className="text-slate-500 italic text-center py-2">
          No line changes detected between policy versions.
        </div>
      )}
    </div>
  );
};

export default DiffViewer;
