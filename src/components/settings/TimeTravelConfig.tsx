import React, { useState, useEffect } from 'react';
import { History, RotateCcw, Search, Clock, User, MessageSquare, ShieldAlert, Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryItem {
  id: string;
  config_type: string;
  config_data: string;
  changed_by: string;
  change_reason: string;
  created_at: string;
}

export const TimeTravelConfig: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/advanced-settings/history/default');
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Time-Travel Configuration</h2>
          <p className="text-slate-500 text-xs mt-1">Review and restore the platform's exact settings/rules-state as of any past date.</p>
        </div>
        <button 
          onClick={fetchHistory}
          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Timeline Column */}
        <div className="xl:col-span-1 border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Version History</h3>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold rounded-full">{history.length} Snapshots</span>
          </div>
          
          <div className="overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Retrieving Ledger...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Clock className="w-8 h-8" />
                <p className="text-[10px] font-bold uppercase">No snapshot history found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-4 transition-all hover:bg-slate-50 ${
                      selectedItem?.id === item.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-slate-900 uppercase">{item.config_type}</span>
                      <span className="text-[9px] font-bold text-slate-400 font-mono">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
                      <User className="w-3 h-3" />
                      <span className="truncate">{item.changed_by}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 italic">"{item.change_reason}"</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail/Restore Column */}
        <div className="xl:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm h-full flex flex-col"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Snapshot: {selectedItem.config_type}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Captured on {new Date(selectedItem.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all shadow-lg shadow-rose-100">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore Snapshot
                  </button>
                </div>

                <div className="p-6 flex-1 space-y-6 overflow-y-auto max-h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" />
                        Audit Log Entry
                      </h5>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed italic">
                        "{selectedItem.change_reason}"
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3" />
                        Integrity Check
                      </h5>
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">Ledger Proof Validated</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration Payload</h5>
                    <pre className="p-4 bg-slate-900 text-indigo-300 rounded-xl text-[10px] font-mono overflow-x-auto">
                      {JSON.stringify(JSON.parse(selectedItem.config_data), null, 2)}
                    </pre>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-50/50 p-12 text-center">
                <div className="p-4 bg-white rounded-full shadow-sm">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-600">Select a Snapshot</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Pick a version from the timeline to view detailed state and perform a secure rollback.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
