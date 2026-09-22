import React, { useState } from 'react';
import { 
  Cpu, 
  BarChart3, 
  Activity, 
  Settings2, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Brain,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Eye,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const mockData = [
  { time: '00:00', accuracy: 92, confidence: 88, calls: 45 },
  { time: '04:00', accuracy: 94, confidence: 89, calls: 32 },
  { time: '08:00', accuracy: 91, confidence: 87, calls: 120 },
  { time: '12:00', accuracy: 95, confidence: 91, calls: 240 },
  { time: '16:00', accuracy: 93, confidence: 90, calls: 180 },
  { time: '20:00', accuracy: 96, confidence: 92, calls: 95 },
  { time: '23:59', accuracy: 94, confidence: 89, calls: 60 },
];

export const AIGovernance: React.FC = () => {
  const [governanceMode, setGovernanceMode] = useState<'strict' | 'balanced' | 'autonomous'>('balanced');

  return (
    <div className="space-y-8">
      {/* Top Header & Global Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-purple-50 rounded-2xl text-purple-600">
              <Brain className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">AI Feature Governance Panel</h2>
              <p className="text-gray-500 mt-1 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />
                Global AI systems operating within compliance thresholds.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Inference</p>
              <p className="text-2xl font-black text-gray-900">482.1k</p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Avg. Accuracy</p>
              <p className="text-2xl font-black text-emerald-600">94.2%</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-8 text-white flex flex-col justify-between shadow-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Governance Mode</p>
          <div className="mt-4 space-y-4">
            {['Strict', 'Balanced', 'Autonomous'].map((mode) => (
              <button
                key={mode}
                onClick={() => setGovernanceMode(mode.toLowerCase() as any)}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-between",
                  governanceMode === mode.toLowerCase() 
                    ? "bg-white text-gray-900 shadow-lg" 
                    : "text-gray-400 hover:bg-gray-800"
                )}
              >
                {mode}
                {governanceMode === mode.toLowerCase() && <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content: Features & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feature Control List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Active AI Modules</h3>
              <button className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">Auditor Logs</button>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { id: 'risk-pred', name: 'Predictive Risk Scoring', accuracy: 96.4, status: 'Active', load: 'High' },
                { id: 'clause-ext', name: 'Regulatory Clause Extraction', accuracy: 92.1, status: 'Active', load: 'Medium' },
                { id: 'anomaly', name: 'Financial Anomaly Detection', accuracy: 98.8, status: 'Enforcement Mode', load: 'Low' },
                { id: 'chatbot', name: 'Compliance Helpdesk Bot', accuracy: 89.5, status: 'Degraded', load: 'High' },
              ].map((feature) => (
                <div key={feature.id} className="p-6 hover:bg-gray-50/50 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition-all">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{feature.name}</h4>
                        <div className="flex items-center mt-1 space-x-3 text-xs font-medium">
                          <span className={cn(
                            "px-2 py-0.5 rounded",
                            feature.status === 'Degraded' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                            {feature.status}
                          </span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500">{feature.load} Traffic</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-12">
                      <div className="text-right min-w-[100px]">
                        <p className="text-lg font-black text-gray-900">{feature.accuracy}%</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Accuracy</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Settings className="w-5 h-5" />
                        </button>
                        <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Real-time Inference Metrics
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                    dy={10}
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 5', 'dataMax + 5']} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorAcc)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Confidence Controls & Alerts */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/20 blur-3xl rounded-full" />
            <h3 className="text-lg font-bold mb-6">Autonomy Thresholds</h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Confidence Threshold</p>
                  <span className="text-xl font-black text-purple-400">85%</span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_12px_rgba(139,92,246,0.5)]" />
                </div>
                <p className="text-[10px] text-gray-500 mt-2 font-medium">Predictions below this score trigger mandatory human review.</p>
              </div>

              <div className="pt-6 border-t border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Human-in-the-loop (HITL)</span>
                  <div className="w-10 h-5 bg-purple-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Audit Persistence</span>
                  <div className="w-10 h-5 bg-purple-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              Governance Alerts
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Activity className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-900 underline decoration-red-200 underline-offset-4">Confidence Drift Detected</p>
                    <p className="text-xs text-red-700 mt-1 leading-relaxed">
                      "Regulatory Clause Extraction" dropped to 81% confidence after recent Swiss Data Law update.
                    </p>
                    <button className="mt-3 text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800">Recalibrate Model</button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">New EU AI Act Requirement</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Annex III compliance requires bias audit for "Predictive Risk Scoring" by next Tuesday.
                    </p>
                    <button className="mt-3 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-800">Run Bias Audit</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
