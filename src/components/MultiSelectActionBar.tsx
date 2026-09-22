import React from 'react';
import { Trash2, FileEdit, X } from 'lucide-react';

interface MultiSelectActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onStatusUpdate?: (status: string) => void;
  onClear: () => void;
  statusOptions?: { value: string; label: string }[];
  additionalActions?: React.ReactNode;
}

export const MultiSelectActionBar: React.FC<MultiSelectActionBarProps> = ({
  selectedCount,
  onDelete,
  onStatusUpdate,
  onClear,
  statusOptions = [],
  additionalActions
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-xl rounded-full px-4 py-2 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-10 fade-in">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
        <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md">{selectedCount}</span>
        selected
      </div>
      <div className="h-3 w-px bg-slate-200" />
      
      {onStatusUpdate && statusOptions.length > 0 && (
        <div className="flex items-center gap-1.5">
          <FileEdit className="w-3.5 h-3.5 text-slate-400" />
          <select
            onChange={(e) => onStatusUpdate(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Update Status...</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      )}

      {additionalActions}

      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>

      <button
        onClick={onClear}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
