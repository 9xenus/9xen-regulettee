import React from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  PieChart, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  BarChart4,
  RefreshCw,
  MoreVertical,
  Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const usageData = [
  { month: 'Mar', actual: 4200, projection: 4200 },
  { month: 'Apr', actual: 4800, projection: 4800 },
  { month: 'May', actual: 5100, projection: 5100 },
  { month: 'Jun', actual: 5900, projection: 5900 },
  { month: 'Jul', actual: 6400, projection: 6400 },
  { month: 'Aug', actual: null, projection: 7800 },
  { month: 'Sep', actual: null, projection: 9200 },
];

const allocationData = [
  { name: 'Legal', value: 4500, color: '#8b5cf6' },
  { name: 'Engineering', value: 3200, color: '#3b82f6' },
  { name: 'HR/Ops', value: 1800, color: '#10b981' },
  { name: 'Marketing', value: 1200, color: '#f59e0b' },
];

export const BillingAdvanced: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Forecasting Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Usage Forecasting</h2>
              <p className="text-gray-500 mt-1">AI-driven projection of platform consumption and costs.</p>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold border border-amber-100">
              <AlertCircle className="w-4 h-4" />
              <span>Budget Alert: 85% of Limit</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorActual)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="projection" 
                  stroke="#94a3b8" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorProj)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-10 pt-8 border-t border-gray-100 text-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current MRR</p>
              <p className="text-xl font-black text-gray-900 mt-1">€12,450.00</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Projected (Sep)</p>
              <p className="text-xl font-black text-blue-600 mt-1">€14,800.00</p>
              <p className="text-[10px] text-emerald-500 font-bold mt-0.5 flex items-center justify-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +18.8%
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Efficiency Score</p>
              <p className="text-xl font-black text-gray-900 mt-1">94.2%</p>
            </div>
          </div>
        </div>

        {/* Cost Allocation */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900">Cost Allocation</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1 space-y-6">
            {allocationData.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-700">{item.name}</span>
                  <span className="font-black text-gray-900">€{item.value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.value / 10700) * 100}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-3 bg-gray-50 text-gray-900 font-bold border border-gray-200 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" />
            Export Chargeback CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Budget Alerts
            </h3>
            <button className="text-xs font-bold text-blue-600 uppercase tracking-widest">+ New Alert</button>
          </div>
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">Total Usage (85%)</p>
                  <p className="text-xs text-amber-700">Threshold: €15,000.00 / month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-amber-900">€12,750.00</p>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-0.5">Estimated 10 days left</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 font-mono italic">AI Inference Limit (40%)</p>
                  <p className="text-xs text-gray-500">Threshold: 1,000,000 tokens</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-gray-900">402,120</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Healthy</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-8">
            <TrendingUp className="w-12 h-12 text-blue-500/20" />
          </div>
          <h3 className="text-lg font-bold mb-8">Optimization Suggestions</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Underutilized Entity Detected</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  9Xen Regulettee APAC is currently using only 12% of its allocated capacity. Consider consolidating seats to save <strong>€1,200/mo</strong>.
                </p>
                <button className="mt-3 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300">Run Consolidation Audit</button>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Bulk Reserve Opportunity</p>
                <p className="text-xs text-gray-400 mt-1">
                  Usage trends suggest you could save 22% by switching to a pre-paid data residency tier for the EU-Central-1 node.
                </p>
                <button className="mt-3 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300">View Reserve Tiers</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
