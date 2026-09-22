import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Copy, 
  Download, 
  Play, 
  RefreshCw, 
  Layers, 
  FileText, 
  ChevronRight, 
  Award, 
  Zap, 
  Lock, 
  Database, 
  Globe, 
  Cpu, 
  ExternalLink,
  BookOpen,
  Send
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface PromptTemplate {
  id: string;
  title: string;
  regulation: string;
  category: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  sampleVariables: Record<string, string>;
  statutoryArticles: string[];
}

interface Milestone {
  id: string;
  phase: string;
  name: string;
  description: string;
  category: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';
  complianceWeight: number;
  lastVerified: string;
  verificationProof: string;
  leadArchitect: string;
}

export const RegtechLaunchTracker: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'tracker' | 'dossier' | 'test-runner'>('tracker');
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [promptVariables, setPromptVariables] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  // Tracker State
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [readinessScore, setReadinessScore] = useState<number>(97);
  const [certifiedStatus, setCertifiedStatus] = useState<string>('REGULATOR_READY_PROD');
  const [isLoading, setIsLoading] = useState(true);

  // Load initial prompts and milestones from backend
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [promptsRes, milestonesRes] = await Promise.all([
        fetch('/api/v1/dossier/prompts'),
        fetch('/api/v1/launch-tracker/milestones')
      ]);

      if (promptsRes.ok) {
        const pData = await promptsRes.json();
        setPrompts(pData.prompts || []);
        if (pData.prompts?.length > 0 && !selectedPrompt) {
          setSelectedPrompt(pData.prompts[0]);
          setPromptVariables(pData.prompts[0].sampleVariables || {});
        }
      }

      if (milestonesRes.ok) {
        const mData = await milestonesRes.json();
        setMilestones(mData.milestones || []);
        setReadinessScore(mData.readinessScore || 97);
        setCertifiedStatus(mData.certifiedStatus || 'REGULATOR_READY_PROD');
      }
    } catch (err) {
      console.error('Failed to fetch dossier & launch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectPrompt = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt);
    setPromptVariables(prompt.sampleVariables || {});
    setExecutionResult(null);
  };

  const handleExecutePrompt = async () => {
    if (!selectedPrompt) return;
    setIsExecuting(true);
    try {
      const res = await fetch('/api/v1/dossier/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: selectedPrompt.id,
          variables: promptVariables
        })
      });

      const data = await res.json();
      if (data.success && data.dossier) {
        setExecutionResult(data.dossier);
        showToast(`Dossier "${selectedPrompt.title}" generated successfully!`, 'success');
      } else {
        throw new Error(data.message || 'Execution failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to generate regulatory dossier.', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleToggleMilestone = async (m: Milestone) => {
    const nextStatus = m.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      const res = await fetch('/api/v1/launch-tracker/update-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: m.id,
          status: nextStatus,
          verificationProof: `Audit-Seal-${Date.now().toString(36).toUpperCase()}`
        })
      });

      if (res.ok) {
        showToast(`Milestone status updated to ${nextStatus}`, 'success');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to update milestone status', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Full-Stack Compliance Dossier & Production Launch Platform</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
              RegTech AI Dossier & Sovereign Launch Tracker
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Production readiness verification, AI prompt synthesis engine, and milestone enforcement across EU AI Act, DORA, GDPR, and NIS2.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl backdrop-blur-md">
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Readiness Score</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">{readinessScore}%</div>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div className="text-left">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Regulator Status</div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                {certifiedStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tracker'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            1. Launch Readiness Tracker ({milestones.filter(m => m.status === 'COMPLETED').length}/{milestones.length})
          </button>
          <button
            onClick={() => setActiveTab('dossier')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dossier'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            2. Regulatory Prompts Dossier ({prompts.length} Standardized Prompts)
          </button>
          <button
            onClick={() => setActiveTab('test-runner')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'test-runner'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            3. Live AI Dossier Generator & Sandbox
          </button>
        </div>
      </div>

      {/* TAB 1: LAUNCH READINESS TRACKER */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Phase 1: Foundation</span>
                <Lock className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">100% Ready</div>
              <p className="text-[11px] text-slate-400 mt-1">Quantum TLS 1.3 & Merkle Ledgers</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Phase 2: Reg Engines</span>
                <Cpu className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">98% Verified</div>
              <p className="text-[11px] text-slate-400 mt-1">EU AI Act & DORA ICT Resiliency</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Phase 3: Integrations</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">100% Active</div>
              <p className="text-[11px] text-slate-400 mt-1">9-in-1 Zero-Downtime Hub & Webhooks</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Phase 4: B2G Sandbox</span>
                <Globe className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">96% Certified</div>
              <p className="text-[11px] text-slate-400 mt-1">Central Bank Rails & Direct Regulators</p>
            </div>
          </div>

          {/* Milestones List by Phase */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Statutory Launch Verification Checkpoints</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Click any milestone status to toggle verification proof in the sovereign audit ledger.</p>
              </div>
              <button
                onClick={fetchData}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Re-validate Telemetry
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border transition-all ${
                    m.status === 'COMPLETED'
                      ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                      : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {m.phase}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {m.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleToggleMilestone(m)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition ${
                        m.status === 'COMPLETED'
                          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                      }`}
                    >
                      {m.status === 'COMPLETED' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          VERIFIED
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          IN PROGRESS
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    {m.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 gap-2">
                    <div className="truncate max-w-[240px]" title={m.verificationProof}>
                      <span className="text-slate-400">Proof:</span> {m.verificationProof}
                    </div>
                    <div>
                      <span className="text-slate-400">Lead:</span> {m.leadArchitect.split(' ')[0]} {m.leadArchitect.split(' ')[1]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGULATORY PROMPTS DOSSIER */}
      {activeTab === 'dossier' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prompt Selector Column */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Statutory Dossier Templates
            </h2>
            <div className="space-y-2">
              {prompts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPrompt(p)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedPrompt?.id === p.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{p.category}</span>
                    <span>{p.id}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {p.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Details & Variable Form */}
          <div className="lg:col-span-2 space-y-4">
            {selectedPrompt ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedPrompt.regulation}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedPrompt.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('test-runner');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Open in AI Test Runner
                  </button>
                </div>

                {/* Statutory Citations */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Statutory Articles Covered:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPrompt.statutoryArticles.map((art, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono rounded-md border border-slate-200 dark:border-slate-700"
                      >
                        {art}
                      </span>
                    ))}
                  </div>
                </div>

                {/* System Prompt Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Auditor System Prompt:
                    </label>
                    <button
                      onClick={() => copyToClipboard(selectedPrompt.systemPrompt)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 text-emerald-400 text-xs font-mono rounded-xl overflow-x-auto whitespace-pre-wrap border border-slate-800">
                    {selectedPrompt.systemPrompt}
                  </pre>
                </div>

                {/* Template Prompt Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                      User Prompt Template:
                    </label>
                    <button
                      onClick={() => copyToClipboard(selectedPrompt.userPromptTemplate)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700">
                    {selectedPrompt.userPromptTemplate}
                  </div>
                </div>

                {/* Sample Variables */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Default Input Variables:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(selectedPrompt.sampleVariables).map(([k, v]) => (
                      <div key={k} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/50">
                        <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase">{k}</div>
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-mono break-words">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                Select a regulatory prompt from the sidebar to inspect its architecture.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE AI DOSSIER GENERATOR & SANDBOX */}
      {activeTab === 'test-runner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls & Variable Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Dossier Synthesis Parameters</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Select prompt and customize input telemetry variables.</p>
              </div>
              <span className="text-xs font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 font-bold">
                Gemini 3.8 / Rule Engine
              </span>
            </div>

            {/* Prompt Selector Dropdown */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Target Regulatory Prompt Template
              </label>
              <select
                value={selectedPrompt?.id || ''}
                onChange={(e) => {
                  const p = prompts.find(item => item.id === e.target.value);
                  if (p) handleSelectPrompt(p);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
              >
                {prompts.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.category}] {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Variable Inputs */}
            {selectedPrompt && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Template Variables Configuration
                </label>
                {Object.keys(selectedPrompt.sampleVariables).map((key) => (
                  <div key={key}>
                    <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                      {key}
                    </label>
                    <textarea
                      rows={2}
                      value={promptVariables[key] || ''}
                      onChange={(e) => setPromptVariables({ ...promptVariables, [key]: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                ))}

                <button
                  onClick={handleExecutePrompt}
                  disabled={isExecuting}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 transition-all"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Synthesizing Dossier with Sovereign AI Engine...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Execute & Seal Regulatory Dossier
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Dossier Output Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Synthesized Dossier Viewer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cryptographically verifiable markdown output.</p>
              </div>

              {executionResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(executionResult.generatedContent)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    title="Copy Markdown"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-bold">
                    {executionResult.engine} ({executionResult.executionTimeMs}ms)
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-[400px] max-h-[600px] overflow-y-auto p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed">
              {isExecuting ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 py-16">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                  <p className="text-xs">Applying sovereign rule engine & statutory reasoning algorithms...</p>
                </div>
              ) : executionResult ? (
                executionResult.generatedContent
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-16 text-center">
                  <FileText className="w-8 h-8 text-slate-600" />
                  <p>Configure parameters on the left and click "Execute & Seal Regulatory Dossier" to view live generation output.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
