import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Database, 
  Key, 
  RefreshCw, 
  Activity, 
  ShieldCheck, 
  Lock, 
  BarChart3, 
  Server, 
  Globe, 
  ChevronRight, 
  Plus, 
  MoreVertical,
  ExternalLink,
  Code2,
  Trash2,
  AlertTriangle,
  BrainCircuit,
  Zap,
  TrendingUp,
  History,
  ShieldAlert,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { fetchWithRetry } from '../lib/api-client';
import { useNotification } from '../context/NotificationContext';

interface LLMProvider {
  id: string;
  name: string;
  key: string;
  status: 'ACTIVE' | 'RATE_LIMITED' | 'INACTIVE';
  latency: number;
  costPer1k: number;
  models: string[];
}

interface LLMUsage {
  timestamp: string;
  tokens: number;
  cost: number;
  latency: number;
}

export const LLMProviderConfig: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'PROVIDERS' | 'USAGE' | 'SETTINGS' | 'SECURITY'>('PROVIDERS');
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProviders([
        { id: '1', name: 'Gemini Flash', key: 'google_gemini_flash', status: 'ACTIVE', latency: 450, costPer1k: 0.0001, models: ['gemini-2.0-flash', 'gemini-3.7-flash'] },
        { id: '4', name: 'OpenRouter Universal Gateway', key: 'openrouter_byok', status: 'ACTIVE', latency: 380, costPer1k: 0.002, models: ['openrouter/auto', 'meta-llama/llama-3.3-70b-instruct', 'deepseek/deepseek-chat', 'qwen/qwen-2.5-72b-instruct:free'] },
        { id: '5', name: 'Ollama Local Enclave', key: 'ollama_local', status: 'ACTIVE', latency: 210, costPer1k: 0, models: ['llama3.1:8b', 'llama3.3:70b', 'qwen2.5:7b', 'gemma2:27b'] },
        { id: '6', name: 'Mistral AI', key: 'mistral_ai', status: 'ACTIVE', latency: 640, costPer1k: 0.001, models: ['mistral-small-latest', 'mistral-large-latest'] },
        { id: '7', name: 'Groq LPU', key: 'groq_lpu', status: 'ACTIVE', latency: 290, costPer1k: 0.0007, models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'] },
        { id: '8', name: 'xAI Grok', key: 'xai_grok', status: 'ACTIVE', latency: 890, costPer1k: 0.003, models: ['grok-2-latest'] },
        { id: '2', name: 'OpenAI GPT-4o', key: 'openai_gpt4o', status: 'ACTIVE', latency: 820, costPer1k: 0.005, models: ['gpt-4o', 'gpt-4o-mini'] },
        { id: '3', name: 'Anthropic Claude', key: 'anthropic_claude', status: 'RATE_LIMITED', latency: 1200, costPer1k: 0.003, models: ['claude-3-5-sonnet', 'claude-3-haiku'] },
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const usageData = [
    { time: '00:00', tokens: 1200, cost: 0.12 },
    { time: '04:00', tokens: 800, cost: 0.08 },
    { time: '08:00', tokens: 4500, cost: 0.45 },
    { time: '12:00', tokens: 8200, cost: 0.82 },
    { time: '16:00', tokens: 6100, cost: 0.61 },
    { time: '20:00', tokens: 3400, cost: 0.34 },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-indigo-600 p-4 rounded-2xl shadow-xl shadow-indigo-100 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">LLM Provider Orchestration</h1>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase tracking-widest border border-indigo-100">Enterprise AGI</span>
            </div>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">Manage inference endpoints, token budgets, and sovereign model containment across multiple providers.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 sm:px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black transition-all hover:bg-slate-800 shadow-md shadow-slate-100 flex items-center justify-center gap-2">
            <Key className="w-4 h-4" />
            Rotate API Keys
          </button>
          <button className="flex-1 md:flex-none px-4 sm:px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black transition-all hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add Provider
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
        {(['PROVIDERS', 'USAGE', 'SETTINGS', 'SECURITY'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {activeTab === 'PROVIDERS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Stats Summary */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { label: 'Active Endpoints', value: '12', icon: Server, color: 'text-emerald-500', trend: 'Stable' },
              { label: 'Token Burn (24h)', value: '1.4M', icon: Zap, color: 'text-amber-500', trend: '+5.2%' },
              { label: 'Budget Ceiling', value: '$25,000', icon: TrendingUp, color: 'text-indigo-500', trend: '8% Spent' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all cursor-default">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                  <p className={`text-[10px] font-black mt-1 uppercase ${stat.trend.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'}`}>{stat.trend}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-slate-50 group-hover:scale-110 transition-transform ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>

          {/* Providers List */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-500" />
                  Active Model Registry
                </h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Filter models..." className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {providers.map((provider) => (
                  <motion.div 
                    key={provider.id}
                    layoutId={provider.id}
                    className="p-5 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-slate-50/50 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm group-hover:bg-indigo-50 transition-colors">
                          <Cpu className={`w-6 h-6 ${provider.status === 'ACTIVE' ? 'text-indigo-600' : 'text-amber-500'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{provider.name}</h4>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                              provider.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {provider.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {provider.key}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Latency</p>
                          <p className="text-xs font-bold text-slate-700 font-mono">{provider.latency}ms</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Cost/1k</p>
                          <p className="text-xs font-bold text-slate-700 font-mono">${provider.costPer1k}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                      {provider.models.map(m => (
                        <span key={m} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 group-hover:bg-white transition-colors">
                          {m}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-4 sm:p-5 lg:p-6 flex items-start gap-4 shadow-sm">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-indigo-900">Sovereign Fallback Engine Active</h4>
                <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                  Automatic failover is configured. If any primary LLM endpoint latency exceeds <strong>2000ms</strong> or returns <strong>5xx</strong> errors, 
                  traffic will be routed to your self-hosted sovereign model cluster in the Frankfurt enclave.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button className="text-[11px] font-bold text-indigo-900 hover:underline flex items-center gap-1.5 uppercase tracking-wider">
                    Configure Failover Rules <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Chart & Control */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Real-time Inference Load</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={usageData}>
                    <defs>
                      <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="tokens" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Monthly Total</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">$2,410.82</p>
                </div>
                <div className="h-10 w-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin-slow flex items-center justify-center">
                  <span className="text-[10px] font-black text-indigo-600">82%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 lg:p-6 text-white shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">Security Policies</h3>
              <div className="space-y-4">
                {[
                  { label: 'Prompt PII Anonymization', status: true },
                  { label: 'Differential Privacy Layer', status: true },
                  { label: 'Model Watermarking', status: false },
                  { label: 'Bias Guard V4.1', status: true },
                ].map((policy, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-medium">{policy.label}</span>
                    <button className={`w-8 h-4 rounded-full transition-all relative ${policy.status ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                      <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${policy.status ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[11px] font-black transition-all uppercase tracking-widest">
                Review Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: USAGE */}
      {activeTab === 'USAGE' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Token Consumption & Spend Analytics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Per-provider token burn, cost projection, and latency trend over 24h.</p>
              </div>
              <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                Total 24h: 24,200 Tokens
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                    />
                    <Bar dataKey="tokens" radius={[8, 8, 0, 0]} barSize={28}>
                      {usageData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.cost > 0.4 ? '#f59e0b' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Gemini Flash', tokens: '12,400', cost: '$1.24', share: 51, color: 'bg-indigo-500' },
                  { name: 'OpenAI GPT-4o', tokens: '8,200', cost: '$41.00', share: 34, color: 'bg-emerald-500' },
                  { name: 'Anthropic Claude', tokens: '3,600', cost: '$10.80', share: 15, color: 'bg-amber-500' },
                ].map((p, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">{p.name}</span>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900">{p.tokens}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2">${p.cost}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-white border border-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${p.color}`} style={{ width: `${p.share}%` }} />
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Monthly Run-Rate</p>
                    <p className="text-lg font-black text-emerald-400 mt-0.5">$2,410.82</p>
                  </div>
                  <p className={`text-[10px] font-black ${usageData[3].cost > 0.4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    Budget 8% Consumed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                Inference & Routing Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Default model routing, generation parameters, and failover behavior.</p>
            </div>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black transition-all hover:bg-slate-800 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Reload Effective Config
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl border border-slate-200 space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model Routing</span>
              <label className="block">
                <span className="text-xs font-bold text-slate-700">Default Primary Model</span>
                <select className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none">
                  <option>gemini-2.0-flash (Recommended)</option>
                  <option>openrouter/auto (OpenRouter BYOK)</option>
                  <option>meta-llama/llama-3.3-70b-instruct (OpenRouter)</option>
                  <option>llama3.1:8b (Ollama Local)</option>
                  <option>llama-3.3-70b-versatile (Groq LPU)</option>
                  <option>mistral-small-latest (Mistral)</option>
                  <option>grok-2-latest (xAI)</option>
                  <option>gpt-4o</option>
                  <option>claude-3-5-sonnet</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-700">Sovereign Fallback Model</span>
                <select className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none">
                  <option>self-hosted gemma-2-27b (Frankfurt Enclave)</option>
                  <option>self-hosted llama-3.1-70b</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-700">Fallback Trigger Latency (ms)</span>
                <input type="number" defaultValue={2000} className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none" />
              </label>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generation Parameters</span>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-bold text-slate-700">Temperature</span>
                  <input type="number" defaultValue={0.4} step="0.1" className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-700">Max Output Tokens</span>
                  <input type="number" defaultValue={8192} className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none" />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-bold text-slate-700">Context Window Budget</span>
                <input type="number" defaultValue={128000} className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none" />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-700">Retry Budget per Request</span>
                <input type="number" defaultValue={3} className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none" />
              </label>
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-800">
            <strong>Sovereign failover is active.</strong> Traffic exceeding 2000ms latency or returning 5xx will auto-route to the Frankfurt self-hosted 
            cluster with <strong>SYSTEM_PROMPT_V2</strong> policy pinning.
          </div>
        </div>
      )}

      {/* TAB: SECURITY */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 lg:p-6 text-white shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> API Key & Sovereign Containment
                </h3>
                <p className="text-xs text-slate-400 mt-1">Rotation policies, key scope, and inference request attestation.</p>
              </div>
              <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                HSM Enclave Keyring
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'openrouter_byok', scope: 'Production · Read/Write', lastRotated: '0d ago', status: 'ROTATED' },
                { name: 'ollama_local', scope: 'Local Enclave · No Key', lastRotated: '0d ago', status: 'ROTATED' },
                { name: 'mistral_ai', scope: 'Production · Read/Write', lastRotated: '3d ago', status: 'ROTATED' },
                { name: 'groq_lpu', scope: 'Checkout · Read Only', lastRotated: '12d ago', status: 'ROTATED' },
                { name: 'xai_grok', scope: 'Staging · Read Only', lastRotated: '7d ago', status: 'ROTATION DUE' },
                { name: 'google_gemini_flash', scope: 'Production · Read/Write', lastRotated: '9d ago', status: 'ROTATED' },
                { name: 'openai_gpt4o', scope: 'Production · Read/Write', lastRotated: '62d ago', status: 'ROTATION DUE' },
                { name: 'anthropic_claude', scope: 'Staging · Read Only', lastRotated: '5d ago', status: 'ROTATED' },
                { name: 'sovereign_frankfurt', scope: 'Enclave · Sys Admin', lastRotated: '1d ago', status: 'ROTATED' },
              ].map((k, idx) => (
                <div key={idx} className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-indigo-400" /> {k.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                      k.status === 'ROTATED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {k.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">Scope: {k.scope} · Rotated {k.lastRotated}</div>
                  <div className="flex gap-2 pt-1">
                    <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3" /> Rotate Now
                    </button>
                    <button className="px-3 py-1.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                      <Trash2 className="w-3 h-3" /> Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Inference Security Policies
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Prompt PII Anonymization', status: true, detail: 'Strip names, emails, IPs before inference' },
                { label: 'Differential Privacy Layer', status: true, detail: 'épsilon 0.01 noise injection on telemetry' },
                { label: 'Model Watermarking', status: false, detail: 'Cryptographic output provenance hashes' },
                { label: 'Bias Guard V4.1', status: true, detail: 'Pre-deployment fairness scoring pipeline' },
                { label: 'Request Attestation (mTLS)', status: true, detail: 'Enclave-signed inference requests only' },
              ].map((policy, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    {policy.status
                      ? <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    <div>
                      <p className="text-xs font-bold text-slate-800">{policy.label}</p>
                      <p className="text-[11px] text-slate-500">{policy.detail}</p>
                    </div>
                  </div>
                  <button className={`w-10 h-5 rounded-full transition-all relative ${policy.status ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all ${policy.status ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
              <History className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-xs font-bold text-slate-700">Key rotation audit trail</p>
                <p className="text-[11px] text-slate-500 font-mono">AUD-2026-LLM-4412 · All rotation events HSM-attested · 90-day retention</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
