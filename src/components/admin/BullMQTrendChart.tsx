import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { fetchWithRetry } from '../../lib/api-client';
import { RefreshCw, TrendingUp } from 'lucide-react';

export const BullMQTrendChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/admin/task-queue/trends');
      if (res.ok) {
        const json = await res.json();
        // Transform data to be chart friendly
        // Input: [{hour: '...', task_type: '...', completed: X, failed: Y}, ...]
        // Chart needs: {hour: '...', completed: TotalCompleted, failed: TotalFailed}
        const grouped: Record<string, { hour: string; completed: number; failed: number }> = {};
        json.trends.forEach((item: any) => {
          if (!grouped[item.hour]) {
            grouped[item.hour] = { hour: item.hour, completed: 0, failed: 0 };
          }
          grouped[item.hour].completed += item.completed;
          grouped[item.hour].failed += item.failed;
        });
        setData(Object.values(grouped).sort((a, b) => a.hour.localeCompare(b.hour)));
      }
    } catch (err) {
      console.error('Error fetching trend metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Systemic Bottleneck Diagnosis (24h Trend)
        </h4>
        <button
          onClick={fetchTrends}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="h-64 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500">Loading trend data...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split(' ')[1]} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend />
              <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="failed" name="Failed" stroke="#f43f5e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
