import React, { useEffect, useState } from 'react';
import { Cpu, RefreshCw, Save, Terminal, CheckCircle2, AlertTriangle, Server, Bot, Loader2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface ProviderMeta {
  label: string;
  defaultBaseUrl: string;
  defaultModel: string;
  needsKey: boolean;
  localOnly?: boolean;
  protocol?: string;
}

interface SavedConfig {
  model: string;
  baseUrl: string;
  enabled: boolean;
  updatedAt?: string;
}

const FLEET = ['OPENROUTER', 'OPENAI', 'ANTHROPIC', 'DEEPSEEK', 'MISTRAL', 'GROQ', 'XAI', 'OLLAMA'] as const;

const providerIcon = (p: string) => p === 'OLLAMA' ? Server : p === 'OPENROUTER' ? Bot : Cpu;

export const LLMProviderFleetManager: React.FC = () => {
  const { showToast } = useNotification();
  const [registry, setRegistry] = useState<Record<string, ProviderMeta>>({});
  const [saved, setSaved] = useState<Record<string, SavedConfig>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [specs, setSpecs] = useState<Record<string, SavedConfig>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/v1/llm-gateway/providers')
      .then(r => r.json())
      .then(data => {
        if (data?.success) {
          setRegistry(data.registry || {});
          setSaved(data.providers || {});
          const sd: Record<string, SavedConfig> = {};
          Object.keys(data.providers || {}).forEach((k) => { sd[k] = data.providers[k]; });
          setSpecs(sd);
        }
      })
      .catch(() => {});
  }, []);

  const metaOf = (p: string): ProviderMeta => registry[p] || { label: p, defaultBaseUrl: '', defaultModel: '', needsKey: true };
  const current = (p: string): SavedConfig => specs[p] || { model: (saved[p]?.model || metaOf(p).defaultModel || 'openrouter/auto'), baseUrl: saved[p]?.baseUrl || metaOf(p).defaultBaseUrl, enabled: saved[p]?.enabled ?? false };

  const patch = (p: string, partial: Partial<SavedConfig>) => {
    setTouched(t => ({ ...t, [p]: true }));
    setSpecs(s => ({ ...s, [p]: { ...current(p), ...partial } }));
  };

  const testProvider = async (p: string) => {
    setTesting(p);
    try {
      const res = await fetch('/api/v1/llm-gateway/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: p, apiKey: apiKeys[p] || '', model: current(p).model, baseUrl: current(p).baseUrl }),
      });
      const data = await res.json();
      if (data?.success) {
        setConnected(c => ({ ...c, [p]: true }));
        showToast(`${data.message} · Latency ${data.latencyMs}ms${p === 'OLLAMA' && data.installedModels ? ` · ${data.installedModels.length} models` : ''}`, 'success');
      } else {
        setConnected(c => ({ ...c, [p]: false }));
        showToast(data?.message || `${p} test failed.`, 'error');
      }
    } catch (e: any) {
      showToast(`Probe error: ${e?.message}`, 'error');
    } finally {
      setTesting(null);
    }
  };

  const saveProvider = async (p: string) => {
    setSaving(p);
    try {
      const res = await fetch('/api/v1/llm-gateway/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: p, apiKey: apiKeys[p] || '', model: current(p).model, baseUrl: current(p).baseUrl, enabled: current(p).enabled, updatedBy: 'saas-super-admin' }),
      });
      const data = await res.json();
      if (data?.success) {
        setTouched(t => ({ ...t, [p]: false }));
        setSaved(s => ({ ...s, [p]: { model: current(p).model, baseUrl: current(p).baseUrl, enabled: current(p).enabled } }));
        showToast(`${data.message} · Key ${data.keyMasked}`, 'success');
      } else showToast(data?.error || `Failed to save ${p}.`, 'error');
    } catch (e: any) {
      showToast(`Save failed: ${e?.message}`, 'error');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">LLM Provider Fleet & Local Ollama Enclave</h3>
            <p className="text-[11px] text-slate-500">Register any OpenAI-protocol provider (OpenRouter, OpenAI, DeepSeek, Mistral, Groq, xAI) plus Anthropic and local Ollama. Test live connections and persist to the LLM gateway.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[10px] font-bold">{FLEET.length} providers</span>
      </div>

      <div className="space-y-2.5">
        {FLEET.map((p) => {
          const meta = metaOf(p);
          const cfg = current(p);
          const Icon = providerIcon(p);
          const isLocal = p === 'OLLAMA';
          return (
            <div key={p} className={`rounded-2xl border p-3.5 transition-colors ${isLocal ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50/60 hover:border-indigo-200'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isLocal ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-indigo-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-900">{meta.label || p}</span>
                  {isLocal && <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest">Local</span>}
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${cfg.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>{cfg.enabled ? 'Enabled' : 'Disabled'}</span>
                  {connected[p] === true && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {connected[p] === false && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                </div>
                <span className="text-[9px] font-mono text-slate-400">{p} · {meta.protocol || 'openai'}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Base URL</label>
                  <input
                    type="text"
                    value={cfg.baseUrl}
                    onChange={(e) => patch(p, { baseUrl: e.target.value })}
                    placeholder={meta.defaultBaseUrl || 'https://api.example.com/v1'}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Model</label>
                  <input
                    type="text"
                    value={cfg.model}
                    onChange={(e) => patch(p, { model: e.target.value })}
                    placeholder={meta.defaultModel}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">{isLocal ? 'Local Runtime' : 'API Key'}</label>
                  {isLocal ? (
                    <div className="flex items-center h-[34px] px-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-[10px] font-bold text-emerald-800">
                      no key — localhost:11434
                    </div>
                  ) : (
                    <input
                      type="password"
                      value={apiKeys[p] || ''}
                      onChange={(e) => setApiKeys(k => ({ ...k, [p]: e.target.value }))}
                      placeholder={meta.needsKey ? 'sk-…' : '(optional)'}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  )}
                </div>
                <div className="flex items-end gap-1.5">
                  <input
                    type="checkbox"
                    id={`fleet-enabled-${p}`}
                    checked={cfg.enabled}
                    onChange={(e) => patch(p, { enabled: e.target.checked })}
                    className="w-4 h-4 mb-2 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor={`fleet-enabled-${p}`} className="text-[10px] font-bold text-slate-600 mb-[9px] cursor-pointer">Enabled</label>
                  <button
                    onClick={() => testProvider(p)}
                    disabled={testing !== null}
                    className="px-2.5 py-1.5 mb-1 rounded-lg font-bold transition flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] cursor-pointer disabled:opacity-50"
                  >
                    {testing === p ? <Loader2 className="w-3 h-3 animate-spin" /> : <Terminal className="w-3 h-3" />}
                    Test
                  </button>
                  <button
                    onClick={() => saveProvider(p)}
                    disabled={saving !== null}
                    className="px-2.5 py-1.5 mb-1 rounded-lg font-bold transition flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] cursor-pointer disabled:opacity-50"
                  >
                    {saving === p ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                  </button>
                </div>
              </div>

              {isLocal && (
                <p className="mt-2 text-[10px] text-emerald-700 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Run <code className="font-mono font-bold">ollama serve</code> &amp; <code className="font-mono font-bold">ollama pull llama3.1:8b</code> on this node, then hit Test. Sovereign, air-gap-friendly inference — no cloud key required.
                </p>
              )}
              {touched[p] && (
                <p className="mt-1.5 text-[10px] text-amber-600 font-bold">Unsaved changes — click Save to persist to gateway.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default LLMProviderFleetManager;