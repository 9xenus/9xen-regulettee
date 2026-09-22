import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { Landmark, TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface PenaltyRecord {
  id: string;
  companyName: string;
  sector: string;
  policyBreach: string;
  amountIssued: number;
  amountCollected: number;
  month: string;
  year: number;
  status: string;
  dateIssued: string;
}

interface RegulatorBillingD3ChartsProps {
  penalties: PenaltyRecord[];
  commissionRate: number;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4'];

export const RegulatorBillingD3Charts: React.FC<RegulatorBillingD3ChartsProps> = ({ penalties, commissionRate }) => {
  // Aggregate monthly stats
  const monthlyData = penalties.reduce((acc: any[], p) => {
    const existing = acc.find(item => item.month === p.month);
    const platformShare = Math.round(p.amountCollected * (commissionRate / 100));
    const treasuryShare = p.amountCollected - platformShare;

    if (existing) {
      existing.totalIssued += p.amountIssued;
      existing.totalCollected += p.amountCollected;
      existing.platformShare += platformShare;
      existing.treasuryShare += treasuryShare;
    } else {
      acc.push({
        month: p.month,
        totalIssued: p.amountIssued,
        totalCollected: p.amountCollected,
        platformShare,
        treasuryShare
      });
    }
    return acc;
  }, []);

  // Aggregate sector stats
  const sectorDataMap: Record<string, number> = {};
  penalties.forEach(p => {
    sectorDataMap[p.sector] = (sectorDataMap[p.sector] || 0) + p.amountCollected;
  });

  const sectorData = Object.keys(sectorDataMap).map(sector => ({
    name: sector,
    value: sectorDataMap[sector]
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
      {/* Chart 1: Monthly Settlement & Commission Split */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Penalty Fine Treasury Collection & Split</h4>
              <p className="text-[11px] text-slate-500">B2G Fine Settlements vs. SaaS Platform Commission ({commissionRate}%)</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(value: any) => [`€${Number(value).toLocaleString()}`, '']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="treasuryShare" name="Regulator Treasury Share" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="platformShare" name="9XEN SaaS Commission" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Sector Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Collected Fines by Sector</h4>
            <p className="text-[11px] text-slate-500">Industry Distribution</p>
          </div>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`€${Number(value).toLocaleString()}`, 'Amount']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RegulatorBillingD3Charts;
