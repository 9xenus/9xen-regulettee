import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const GapAnalysisTool: React.FC<{ tenantId?: string }> = ({ tenantId = 'tenant_default' }) => {
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/compliance/gap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      const data = await response.json();
      if (data.success) {
        setGaps(data.gaps);
      }
    } catch (err) {
      console.error('Gap analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          Cross-Border Adequacy Gap Analysis
        </h3>
        <button 
          onClick={runAnalysis}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Run Analysis
        </button>
      </div>

      {gaps.length > 0 ? (
        <div className="space-y-3">
          {gaps.map((gap, i) => (
            <div key={i} className="p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-800">{gap.gap}</p>
                <p className="text-xs text-rose-600 mt-1">Destination: {gap.destinationRegion} | Action: {gap.action}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <p className="text-sm text-slate-600">No compliance gaps detected in recent data transfer logs.</p>
        </div>
      )}
    </div>
  );
};
