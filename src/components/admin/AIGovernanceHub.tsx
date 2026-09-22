import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BrainCircuit, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Database, 
  Zap, 
  FileText,
  Lock,
  Eye,
  History,
  Scale
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const hallucinationData = [
  { time: '00:00', rate: 0.12 },
  { time: '04:00', rate: 0.15 },
  { time: '08:00', rate: 0.08 },
  { time: '12:00', rate: 0.22 },
  { time: '16:00', rate: 0.18 },
  { time: '20:00', rate: 0.10 },
  { time: '23:59', rate: 0.05 },
];

const safetyScoreData = [
  { time: 'Mon', score: 98 },
  { time: 'Tue', score: 99 },
  { time: 'Wed', score: 97 },
  { time: 'Thu', score: 99 },
  { time: 'Fri', score: 98 },
  { time: 'Sat', score: 100 },
  { time: 'Sun', score: 99 },
];

export const AIGovernanceHub: React.FC = () => {
  const [activeModel, setActiveModel] = useState('Gemini 1.5 Pro');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Selection & Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-500" />
              Active LLM Fleet
            </h3>
            <div className="space-y-3">
              {['Gemini 1.5 Pro', 'GPT-4o Proxy', 'Claude 3.5 Sonnet', 'Ollama (Local)'].map((model) => (
                <button
                  key={model}
                  onClick={() => setActiveModel(model)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    activeModel === model 
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/10' 
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${model === 'Ollama (Local)' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                    <span className="text-sm font-bold text-slate-700">{model}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Production</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Governance Guardrails</h3>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-sm font-medium">PII Scrubbing</span>
                <span className="text-xs font-bold text-emerald-400 uppercase">Active</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-sm font-medium">Fairness Audit</span>
                <span className="text-xs font-bold text-emerald-400 uppercase">Verified</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-sm font-medium">Explainability</span>
                <span className="text-xs font-bold text-indigo-400 uppercase">SHAP Logs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Hallucination Rate
                </h3>
                <span className="text-2xl font-black text-rose-600">0.08%</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hallucinationData}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 0.5]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                      itemStyle={{ color: '#e11d48', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="rate" stroke="#e11d48" fillOpacity={1} fill="url(#colorRate)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Compliance Safety Score
                </h3>
                <span className="text-2xl font-black text-emerald-600">99.4</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={safetyScoreData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[90, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Model Audit Trail</h3>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-slate-200 rounded-md transition-colors"><Filter className="w-3.5 h-3.5 text-slate-400" /></button>
                <button className="p-1.5 hover:bg-slate-200 rounded-md transition-colors"><Download className="w-3.5 h-3.5 text-slate-400" /></button>
              </div>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase border-b border-slate-100">
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Request Context</th>
                    <th className="px-6 py-3">Decision</th>
                    <th className="px-6 py-3">Safety Status</th>
                    <th className="px-6 py-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { time: '2 mins ago', context: 'EU AI Act Compliance Mapping', decision: 'Permitted', safety: 'CLEAN', score: 0.99 },
                    { time: '14 mins ago', context: 'Sanctions Data Extraction', decision: 'Permitted', safety: 'CLEAN', score: 0.98 },
                    { time: '22 mins ago', context: 'Cross-border PII Transfer', decision: 'Blocked', safety: 'RED_FLAG', score: 0.42 },
                    { time: '1 hr ago', context: 'Automated Penalty Calculation', decision: 'Permitted', safety: 'CLEAN', score: 0.99 },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-400">{row.time}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{row.context}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${row.decision === 'Permitted' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {row.decision}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${row.safety === 'CLEAN' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="font-bold text-slate-600">{row.safety}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-800 font-bold">SHA-256 Logs</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
