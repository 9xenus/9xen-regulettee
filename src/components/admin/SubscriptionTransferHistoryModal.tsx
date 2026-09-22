import React, { useState, useEffect } from 'react';
import { History, X, ArrowRight, Layers, Calendar, User, Loader2, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { fetchWithRetry } from '../../lib/api-client';

interface TransferRecord {
  id: string;
  from_tenant_id: string;
  to_tenant_id: string;
  tier: string;
  reason: string;
  transferred_by: string;
  created_at: string;
}

export const SubscriptionTransferHistoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { showToast } = useNotification();
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/tenants/subscription-transfers');
      const data = await res.json();
      if (data.success) {
        setTransfers(data.transfers || []);
      }
    } catch (e) {
      console.error('Failed to load transfer history:', e);
      showToast('Could not load transfer history.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-800 rounded-2xl">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">SaaS Subscription Transfer Audit Ledger</h2>
              <p className="text-xs text-slate-500">Immutable record of all tenant license reassignment operations</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 lg:p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
              <p className="text-xs font-mono text-slate-500">Retrieving audit ledger...</p>
            </div>
          ) : transfers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
              <Layers className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-bold text-slate-700">No subscription transfers recorded yet.</p>
              <p className="text-[11px] text-slate-400">Transfer history will automatically log here when plans are reassigned.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transfers.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                        {item.tier}
                      </span>
                      <span className="text-xs font-mono text-slate-400">({item.id})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Calendar className="w-3 h-3" />
                      <span>{item.created_at}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    <div className="p-2 bg-white rounded-xl border border-slate-200 font-mono text-slate-800">
                      From: <span className="text-rose-600">{item.from_tenant_id}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className="p-2 bg-white rounded-xl border border-slate-200 font-mono text-slate-800">
                      To: <span className="text-emerald-600">{item.to_tenant_id}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                    <strong>Reason / Authorization:</strong> {item.reason}
                    <div className="text-[10px] text-slate-400 mt-0.5">Authorized by: {item.transferred_by}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
