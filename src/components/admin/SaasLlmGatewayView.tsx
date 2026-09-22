import React, { useEffect, useState } from 'react';
import { BrainCircuit, Send, RefreshCw, Route, Cpu, Server, Bot, Loader2, Zap } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { fetchWithRetry } from '../../lib/api-client';
import { LLMProviderFleetManager } from './LLMProviderFleetManager';

export const SaasLlmGatewayView: React.FC = () => {
  const { showToast } = useNotification();
  const [status, setStatus] = useState<Record<string, any>>({});
  const [registry, setRegistry] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('As a compliance advisor, list the top 3 NIS2 cybersecurity obligations for a financial entity in 40 words.');
  const [routeProvider, setRouteProvider] = useState('AUTO');
  const [reply, setReply] = useState<{ routed?: string; model?: string; text?: string; latencyMs?: number; message?: string } | null>(null);
  const [chatting, setChatting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchWithRetry('/api/v1/llm-gateway/providers');
      const d = await r.json();
      if (d?.success) { setStatus(d.providers || {}); setRegistry(d.registry || {}); }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!prompt.trim()) return;
    setChatting(true);
    setReply(null);
    try {
      const r = await fetchWithRetry('/api/v1/llm-gateway/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: routeProvider, messages: [{ role: 'user', content: prompt }], maxTokens: 400 }),
      });
      const d = await r.json();
      if (d?.success) setReply({ routed: d.routed, model: d.model, text: d.text, latencyMs: d.latencyMs });
      else setReply({ message: d.message || 'Routing failed.' });
    } catch (e: any) {
      setReply({ message: `Error: ${e?.message}` });
    } finally { setChatting(false); }
  };

  const activeCount = Object.values(status).filter((s: any) => s?.enabled).length;

  return (
    <div className="space-y-4">
      {/* Header + status chips */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-950/60 border border-indigo-800 rounded-xl text-indigo-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">LLM Provider Gateway — Inference Routing
                <span className="text-[9px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded uppercase">enterprise agi</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">OpenRouter BYOK, OpenAI, Anthropic, DeepSeek, Mistral, Groq, xAI, local Ollama and Gemini — register, test live, and route inference with automatic failover.</p>
            </div>
          </div>
          <button onClick={load} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-400" /> {activeCount}/{Object.keys(registry).length} providers enabled
          </span>
          {Object.keys(registry).map(p => (
            <span key={p} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono border flex items-center gap-1.5 ${
              status[p]?.enabled ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}>
              {p === 'OLLAMA' ? <Server className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
              {p}
              <span className={`w-1.5 h-1.5 rounded-full ${status[p]?.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            </span>
          ))}
        </div>
      </div>

      {/* Chat router console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-2"><Route className="w-4 h-4 text-cyan-400" /> Live Inference Router Console</h4>
          <span className="text-[10px] font-mono text-slate-500">Priority: saved provider → OpenRouter → enabled fleet → Gemini</span>
        </div>

        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
            placeholder="Compliance / cybersecurity question for the routed inference provider..."
          />
          <select
            value={routeProvider}
            onChange={(e) => setRouteProvider(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none cursor-pointer"
          >
            <option value="AUTO">AUTO (failover)</option>
            <option value="OPENROUTER">OPENROUTER</option>
            <option value="OLLAMA">OLLAMA</option>
            <option value="OPENAI">OPENAI</option>
            <option value="ANTHROPIC">ANTHROPIC</option>
            <option value="MISTRAL">MISTRAL</option>
            <option value="GROQ">GROQ</option>
            <option value="XAI">XAI</option>
            <option value="DEEPSEEK">DEEPSEEK</option>
            <option value="GEMINI">GEMINI</option>
          </select>
          <button onClick={send} disabled={chatting || !prompt.trim()} className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
            {chatting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Route
          </button>
        </div>

        {reply && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs">
            {reply.routed ? (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[9px] font-black font-mono uppercase">routed → {reply.routed}</span>
                  <span className="text-[10px] font-mono text-slate-400">model: {reply.model}</span>
                  <span className="text-[10px] font-mono text-emerald-400">latency {reply.latencyMs}ms</span>
                </div>
                <div className="text-slate-200 whitespace-pre-wrap">{reply.text}</div>
              </>
            ) : (
              <div className="text-rose-300">{reply.message}</div>
            )}
          </div>
        )}
      </div>

      {/* Provider fleet manager */}
      <LLMProviderFleetManager />
    </div>
  );
};
export default SaasLlmGatewayView;