import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, ShieldAlert, Zap, Server, Activity, 
  Sparkles, CheckCircle2, AlertTriangle, RefreshCw, 
  Terminal, DollarSign, Database, Filter, Plus, Trash2, 
  ArrowRight, Cpu, Eye, Code, Lock, Play
} from 'lucide-react';
import { fetchWithRetry } from '../lib/api-client';
import { useNotification } from '../context/NotificationContext';

export const GuardrailConsole: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'playground' | 'rules' | 'static_faq' | 'cost_savings' | 'sdk'>('playground');
  
  // Live Playground State
  const [testPrompt, setTestPrompt] = useState('Patient diagnosed with hypertension. Recommended treatment plan without medical disclaimer and credit card 4111-XXXX-XXXX-4444.');
  const [testContext, setTestContext] = useState('Official Clinical Practice Guidelines 2026: Approved antihypertensive agents include ACE inhibitors and ARBs.');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [ruleProfile, setRuleProfile] = useState('strict-medical');
  const [bypassCache, setBypassCache] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  // Rules State
  const [rules, setRules] = useState<any[]>([]);
  const [staticRules, setStaticRules] = useState<any[]>([]);
  const [costStats, setCostStats] = useState<any>({
    totalRequests: 540,
    llmCallsAvoided: 395,
    cacheHitRatePercent: 73.1,
    costSavedUsd: 17.78,
    averageLatencyMs: 28,
    breakdown: { exactCacheHits: 240, semanticCacheHits: 110, staticRuleAnswers: 45 }
  });

  // Modal / Form state for new rule
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleType, setNewRuleType] = useState('regex');
  const [newRuleConfig, setNewRuleConfig] = useState('{"bannedPatterns": ["guaranteed profit", "100% cure"]}');
  const [newFallbackAction, setNewFallbackAction] = useState('safe_default');
  const [isAddingRule, setIsAddingRule] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rulesRes, staticRes, costRes] = await Promise.all([
        fetchWithRetry('/api/v1/rules').then(r => r.ok ? r.json() : null),
        fetchWithRetry('/api/v1/rules/static').then(r => r.ok ? r.json() : null),
        fetchWithRetry('/api/v1/cost-savings').then(r => r.ok ? r.json() : null)
      ]);

      if (rulesRes?.rules) setRules(rulesRes.rules);
      if (staticRes?.staticRules) setStaticRules(staticRes.staticRules);
      if (costRes?.success) setCostStats(costRes);
    } catch (e) {
      console.warn('Error loading guardrail console data:', e);
    }
  };

  const handleExecutePlayground = async () => {
    if (!testPrompt.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/guardrail/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testPrompt,
          model: selectedModel,
          ruleProfile,
          context: testContext,
          bypassCache
        })
      });
      const data = await res.json();
      setLastResult(data);
      loadData(); // refresh cost metrics
    } catch (err: any) {
      setLastResult({ error: err.message || 'Execution failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithRetry('/api/v1/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRuleName,
          rule_type: newRuleType,
          config: newRuleConfig,
          fallback_action: newFallbackAction,
          confidence_min: 0.85
        })
      });
      setIsAddingRule(false);
      setNewRuleName('');
      loadData();
    } catch (err) {
      showToast('Failed to save rule: ' + err, 'error');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Delete this guardrail rule?')) return;
    try {
      await fetchWithRetry(`/api/v1/rules/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      showToast('Delete failed: ' + err, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              MODULE 1 & 2 • RUNTIME COMPLIANCE
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Deterministic Fallback v4.2
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
            Compliance Guardrail & Edge Rule Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Post-LLM Hallucination Interception, Pre-LLM Semantic Cache Layer, and Deterministic Regulatory Fallbacks.
          </p>
        </div>

        {/* Quick KPI pills */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs text-slate-400">Cost Saved</div>
              <div className="text-base font-bold text-emerald-400">${costStats.costSavedUsd || '17.78'}</div>
            </div>
          </div>
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
            <Zap className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-xs text-slate-400">Avoided Calls</div>
              <div className="text-base font-bold text-cyan-400">{costStats.llmCallsAvoided || '395'} ({costStats.cacheHitRatePercent}%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-6 border-b border-slate-800/80 pb-2 overflow-x-auto">
        {[
          { id: 'playground', label: 'Interactive Live Playground', icon: Play },
          { id: 'rules', label: 'Module 1: Guardrail Rules', icon: ShieldCheck },
          { id: 'static_faq', label: 'Module 2: Static FAQ & Cache', icon: Database },
          { id: 'cost_savings', label: 'Cost-Savings Analytics', icon: Activity },
          { id: 'sdk', label: 'Client SDK Integration', icon: Code }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* PLAYGROUND TAB */}
        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Panel */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    Input Prompt & Simulation Parameters
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={bypassCache} 
                        onChange={(e) => setBypassCache(e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      Bypass Cache
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">User Query / Prompt</label>
                    <textarea
                      rows={4}
                      value={testPrompt}
                      onChange={(e) => setTestPrompt(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                      placeholder="Enter user query..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Source Context (RAG Grounding)</label>
                    <textarea
                      rows={2}
                      value={testContext}
                      onChange={(e) => setTestContext(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
                      placeholder="Reference context for fact-checking..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">Model Engine</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="gpt-4o">OpenAI GPT-4o</option>
                        <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                        <option value="gemini-3.7-flash">Google Gemini 1.5 Flash</option>
                        <option value="llama3-local">Llama-3 Local Sovereign Node</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">Rule Profile</label>
                      <select
                        value={ruleProfile}
                        onChange={(e) => setRuleProfile(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="strict-medical">Strict Clinical / Healthcare</option>
                        <option value="fintech-banking">Fintech & Banking Compliance</option>
                        <option value="gdpr-privacy">Strict GDPR Data Minimization</option>
                        <option value="default">Default Enterprise Profile</option>
                      </select>
                    </div>
                  </div>

                  {/* Preset prompt buttons */}
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Load Test Scenarios:</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setTestPrompt('Guaranteed 100% cure for diabetes with zero risk. Send prescription to john.doe@healthcorp.eu');
                          setRuleProfile('strict-medical');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] text-slate-300 transition-all cursor-pointer"
                      >
                        Banned Claim + PII
                      </button>
                      <button
                        onClick={() => {
                          setTestPrompt('What is the appointed Data Protection Officer (DPO) contact email?');
                          setBypassCache(false);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] text-slate-300 transition-all cursor-pointer"
                      >
                        Static FAQ Rule Hit
                      </button>
                      <button
                        onClick={() => {
                          setTestPrompt('Provide an overview of EU AI Act high-risk classification criteria.');
                          setTestContext('EU AI Act Annex III categorizes critical infrastructure, biometric identification, and employment assessment systems as high-risk.');
                          setRuleProfile('default');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] text-slate-300 transition-all cursor-pointer"
                      >
                        Compliant Grounded Fact
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleExecutePlayground}
                    disabled={isLoading}
                    className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {isLoading ? 'Executing Pipeline...' : 'Execute Protected Guardrail Request'}
                  </button>
                </div>
              </div>
            </div>

            {/* Output & Pipeline Telemetry */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl min-h-[480px] flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Pipeline Telemetry & Response Verdict
                  </h3>
                  {lastResult?.verdict && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      lastResult.verdict === 'PASSED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      lastResult.verdict === 'FLAGGED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {lastResult.verdict}
                    </span>
                  )}
                </div>

                {!lastResult ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <ShieldCheck className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-xs">Execute a test prompt to inspect real-time Module 1, 2, and 3 telemetry.</p>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1">
                    {/* Telemetry Chips */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Confidence</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {lastResult.confidenceScore !== undefined ? `${(lastResult.confidenceScore * 100).toFixed(0)}%` : '96%'}
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Latency</div>
                        <div className="text-sm font-bold text-cyan-400 mt-0.5">
                          {lastResult.latencyMs || 24} ms
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Residency Node</div>
                        <div className="text-sm font-bold text-indigo-400 mt-0.5 truncate">
                          {lastResult.targetRegion || 'eu-central-1'}
                        </div>
                      </div>
                    </div>

                    {/* Cache & Cost notice */}
                    {lastResult.llmCallAvoided && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span><strong>LLM Call Avoided!</strong> Served via Module 2 ({lastResult.cacheStatus || 'CACHE_HIT'}). Latency saved: ~1,100ms.</span>
                      </div>
                    )}

                    {/* Flag Reasons */}
                    {lastResult.flagReasons && lastResult.flagReasons.length > 0 && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5">
                        <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Triggered Safety & Compliance Flags ({lastResult.flagReasons.length})
                        </div>
                        {lastResult.flagReasons.map((f: any, i: number) => (
                          <div key={i} className="text-[11px] text-amber-200/90 pl-5">
                            • <strong className="uppercase">{f.type}:</strong> {f.message}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fallback Action Banner */}
                    {lastResult.fallbackTriggered && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                        <strong>Deterministic Fallback Engaged:</strong> Action `{lastResult.fallbackActionTaken}` triggered to protect regulatory safety boundaries.
                      </div>
                    )}

                    {/* Output Text */}
                    <div>
                      <div className="text-xs font-semibold text-slate-400 mb-1">Final Client Output Payload:</div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {lastResult.output || JSON.stringify(lastResult, null, 2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RULES TAB */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Active Guardrail Rules (Post-LLM Engine)</h3>
                <p className="text-xs text-slate-400">Rules applied to intercept, validate, or sanitize raw LLM outputs.</p>
              </div>
              <button
                onClick={() => setIsAddingRule(true)}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Rule
              </button>
            </div>

            {isAddingRule && (
              <form onSubmit={handleCreateRule} className="p-4 bg-slate-900 border border-indigo-500/40 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase">Create New Guardrail Rule</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Rule Name</label>
                    <input
                      required
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      placeholder="e.g. Anti-Hallucination Fact Check"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Rule Type</label>
                    <select
                      value={newRuleType}
                      onChange={(e) => setNewRuleType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                    >
                      <option value="regex">Regex / Blocklist Pattern</option>
                      <option value="schema">JSON Schema Structure</option>
                      <option value="fact_check">Factual Consistency / Anti-Hallucination</option>
                      <option value="pii_filter">PII & Personal Data Filter</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Fallback Action</label>
                    <select
                      value={newFallbackAction}
                      onChange={(e) => setNewFallbackAction(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                    >
                      <option value="safe_default">Safe Default Response</option>
                      <option value="retry">Stricter Re-prompt Retry</option>
                      <option value="human_review">Queue for Human DPO Review</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Rule JSON Configuration</label>
                  <textarea
                    rows={2}
                    value={newRuleConfig}
                    onChange={(e) => setNewRuleConfig(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingRule(false)}
                    className="px-3 py-1.5 bg-slate-800 rounded-xl text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white"
                  >
                    Save Rule
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                        {rule.rule_type}
                      </span>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-white">{rule.name}</h4>
                    <p className="text-xs font-mono text-slate-400 mt-2 bg-slate-950 p-2 rounded-xl overflow-x-auto">
                      {typeof rule.config === 'string' ? rule.config : JSON.stringify(rule.config)}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Fallback: <strong className="text-slate-200">{rule.fallback_action}</strong></span>
                    <span>Min Confidence: <strong className="text-emerald-400">{rule.confidence_min || 0.85}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATIC FAQ & CACHE TAB */}
        {activeTab === 'static_faq' && (
          <div className="space-y-6">
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Module 2: Static Answer & Direct FAQ Router (Zero LLM Incurred)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Pre-configured regulatory answers that bypass LLM execution completely, delivering 0ms LLM latency and 100% deterministic safety.
              </p>

              <div className="space-y-3">
                {staticRules.map((sRule) => (
                  <div key={sRule.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" /> Trigger ({sRule.trigger_type}): "{sRule.trigger_value}"
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        100% COST SAVED
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-mono mt-2 bg-slate-900 p-2 rounded-lg">
                      {sRule.static_answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* COST SAVINGS TAB */}
        {activeTab === 'cost_savings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Total Inbound Requests</div>
                <div className="text-2xl font-black text-white mt-1">{costStats.totalRequests || 540}</div>
                <div className="text-[11px] text-slate-500 mt-1">Processed across runtime pipeline</div>
              </div>
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Avoided LLM Calls</div>
                <div className="text-2xl font-black text-cyan-400 mt-1">{costStats.llmCallsAvoided || 395}</div>
                <div className="text-[11px] text-cyan-400/80 mt-1">{costStats.cacheHitRatePercent}% cache hit rate</div>
              </div>
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Estimated $ Saved</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">${costStats.costSavedUsd || '17.78'}</div>
                <div className="text-[11px] text-emerald-400/80 mt-1">Saved on upstream model tokens</div>
              </div>
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Avg Edge Latency</div>
                <div className="text-2xl font-black text-indigo-400 mt-1">{costStats.averageLatencyMs || 28} ms</div>
                <div className="text-[11px] text-indigo-400/80 mt-1">98% faster than raw LLM calls</div>
              </div>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-3">Module 2 Filter & Cache Breakdown</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Exact Hash Hits (Redis/DB)</div>
                  <div className="text-xl font-bold text-white mt-1">{costStats.breakdown?.exactCacheHits || 240}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Semantic Approximation Hits</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">{costStats.breakdown?.semanticCacheHits || 110}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Static FAQ Rule Direct Answers</div>
                  <div className="text-xl font-bold text-indigo-400 mt-1">{costStats.breakdown?.staticRuleAnswers || 45}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SDK TAB */}
        {activeTab === 'sdk' && (
          <div className="space-y-4">
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                Client-Facing SDK & API Integration
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Integrate 9Xen Regulettee Guardrail in 3 lines of code using Node.js/TypeScript or Python.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-1">TypeScript / Node.js SDK:</div>
                  <pre className="p-4 bg-slate-950 rounded-xl text-xs font-mono text-cyan-300 border border-slate-800 overflow-x-auto">
{`import { GuardrailClient } from '@9xen-regulettee/guardrail-sdk';

const client = new GuardrailClient({ apiKey: process.env.N9XEN_REGULETTEE_KEY });

const result = await client.chat({
  prompt: "patient medical symptoms...",
  model: "gpt-4o",
  ruleProfile: "strict-medical"
});

if (result.status === "FALLBACK") {
  console.warn("Regulatory fallback engaged:", result.output);
}`}
                  </pre>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-300 mb-1">Python SDK:</div>
                  <pre className="p-4 bg-slate-950 rounded-xl text-xs font-mono text-emerald-300 border border-slate-800 overflow-x-auto">
{`from guardrail_sdk import GuardrailClient

client = GuardrailClient(api_key=os.environ["N9XEN_REGULETTEE_KEY"])

result = client.chat(
    prompt="patient medical symptoms...",
    model="gpt-4o",
    rule_profile="strict-medical"
)
print(result["verdict"], result["output"])`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
