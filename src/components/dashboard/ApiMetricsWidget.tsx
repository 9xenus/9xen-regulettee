
import React, { useEffect, useState } from 'react';
import { apiMetricsStore } from '../../store/api-metrics';
import { Activity } from 'lucide-react';

export const ApiMetricsWidget = () => {
  const [metrics, setMetrics] = useState(apiMetricsStore.getMetrics());

  useEffect(() => {
    return apiMetricsStore.subscribe(setMetrics);
  }, []);

  const avgLatency = metrics.length 
    ? (metrics.reduce((acc, m) => acc + m.latency, 0) / metrics.length).toFixed(0) 
    : 0;
  
  const successRate = metrics.length
    ? ((metrics.filter(m => m.status >= 200 && m.status < 300).length / metrics.length) * 100).toFixed(0)
    : 100;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center">
        <Activity className="w-5 h-5 text-indigo-500 mr-2" />
        API Stability Metrics
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 font-bold uppercase">Avg Latency</div>
          <div className="text-xl font-black text-slate-900">{avgLatency}ms</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 font-bold uppercase">Success Rate</div>
          <div className="text-xl font-black text-indigo-600">{successRate}%</div>
        </div>
      </div>
    </div>
  );
};
