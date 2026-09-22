import React, { useState } from 'react';
import { CreditCard, Save, RefreshCw, Server, FileText, Code2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const ExtraBillingConfig: React.FC = () => {
  const { showToast } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  const [rates, setRates] = useState({
    payPerScan: 150, // default $150
    apiLicenseMonthly: 500, // default $500
    reportGenerationFee: 25 // default $25
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Billing rates configured successfully!', 'success');
    }, 800);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Extra Billing Rates Configuration
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Set the global pricing for consumption-based scans, API licensing, and report generation.
            </p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Configuration</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Pay-Per-Scan</h3>
                <p className="text-[11px] text-slate-500">Per deep financial/DB scan</p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">$</span>
              <input 
                type="number"
                value={rates.payPerScan}
                onChange={(e) => setRates({ ...rates, payPerScan: Number(e.target.value) })}
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">API Licensing</h3>
                <p className="text-[11px] text-slate-500">Monthly base fee per partner</p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">$</span>
              <input 
                type="number"
                value={rates.apiLicenseMonthly}
                onChange={(e) => setRates({ ...rates, apiLicenseMonthly: Number(e.target.value) })}
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Audit Reports</h3>
                <p className="text-[11px] text-slate-500">Fee per official PDF export</p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">$</span>
              <input 
                type="number"
                value={rates.reportGenerationFee}
                onChange={(e) => setRates({ ...rates, reportGenerationFee: Number(e.target.value) })}
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
