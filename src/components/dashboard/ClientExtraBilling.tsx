import React, { useState } from 'react';
import { Server, Code2, FileText, ShoppingCart, Loader2, CheckCircle2 } from 'lucide-react';

interface ClientExtraBillingProps {
  onPurchaseSuccess?: (item: { id: string; name: string }) => void;
}

export const ClientExtraBilling: React.FC<ClientExtraBillingProps> = ({ onPurchaseSuccess }) => {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [lastPurchased, setLastPurchased] = useState<string | null>(null);

  const handlePurchase = (id: string, name: string) => {
    setPurchasing(id);
    setTimeout(() => {
      setPurchasing(null);
      setLastPurchased(name);
      if (onPurchaseSuccess) {
        onPurchaseSuccess({ id, name });
      }
      setTimeout(() => setLastPurchased(null), 3500);
    }, 1200);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Extra Compliance & Consumption Services</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">On-demand metered add-ons provisioned instantly</p>
        </div>
        {lastPurchased && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Purchased {lastPurchased}!</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Deep Scan */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Pay-Per-Scan</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Deep compliance scan for large financial reports or massive databases. Run on-demand.
            </p>
            <div className="text-lg font-black text-slate-900 dark:text-white mb-4">€150.00 <span className="text-[10px] font-medium text-slate-400">/ scan</span></div>
          </div>
          <button 
            onClick={() => handlePurchase('scan', 'Pay-Per-Scan')}
            disabled={purchasing === 'scan'}
            className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {purchasing === 'scan' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            <span>Purchase Scan</span>
          </button>
        </div>

        {/* API License */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">API Licensing</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Integrate RegTech Engine into your software platforms. Commercial license base rate.
            </p>
            <div className="text-lg font-black text-slate-900 dark:text-white mb-4">€500.00 <span className="text-[10px] font-medium text-slate-400">/ mo</span></div>
          </div>
          <button 
            onClick={() => handlePurchase('api', 'API Licensing')}
            disabled={purchasing === 'api'}
            className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {purchasing === 'api' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            <span>Subscribe API</span>
          </button>
        </div>

        {/* Legal Reports */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Audit Report Export</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Auto-generate official compliance and audit reports with digital signatures.
            </p>
            <div className="text-lg font-black text-slate-900 dark:text-white mb-4">€25.00 <span className="text-[10px] font-medium text-slate-400">/ report</span></div>
          </div>
          <button 
            onClick={() => handlePurchase('report', 'Audit Report Export')}
            disabled={purchasing === 'report'}
            className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {purchasing === 'report' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            <span>Generate Report</span>
          </button>
        </div>

      </div>
    </div>
  );
};
