import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Sliders, Cpu, Layers, Globe, Plus, Trash2, CheckCircle2, 
  AlertTriangle, Zap, Play, Save, RefreshCw, Terminal, Activity, Check, X, Shield, ShieldAlert 
} from 'lucide-react';
import { SaaSAddonRuleEngineBuilder, CustomAddonPayload } from '../components/admin/SaaSAddonRuleEngineBuilder';
import { EnterpriseSecurityCommandView } from '../components/admin/EnterpriseSecurityCommandView';
import { AdvancedFeatureFlagCommandCenter } from '../components/admin/AdvancedFeatureFlagCommandCenter';

export function AdminRuleEngine() {
  const [activeTab, setActiveTab] = useState<'rules' | 'builder' | 'analytics' | 'security' | 'flags'>('rules');
  const [savedRulesets, setSavedRulesets] = useState<CustomAddonPayload[]>([]);
  const [selectedRuleset, setSelectedRuleset] = useState<CustomAddonPayload | null>(null);

  useEffect(() => {
    fetchRulesets();
  }, []);

  const fetchRulesets = async () => {
    try {
      const response = await fetch('/api/v1/rulesets');
      const data = await response.json();
      if (data.rulesets && data.rulesets.length > 0) {
        setSavedRulesets(data.rulesets);
      } else {
        // Seed default rulesets if none exist in DB
        const defaultRulesets: CustomAddonPayload[] = [
          {
            name: 'Global DORA & AI Act Compliance Enforcement',
            slug: 'global-dora-ai-shield',
            category: 'Multi-Module',
            industryVertical: 'Banking & AI Infrastructure',
            price: '€1,499/mo',
            priceType: 'monthly',
            numericPriceEur: 1499,
            region: 'Global Multi-Region',
            description: 'Unified rule engine governing EU AI Act high-risk lineage and DORA ICT third-party concentration risk in real-time.',
            lawActName: 'EU AI Act & DORA Combined Framework',
            legalCitation: 'EUR-Lex Regulation 2024/1689 & 2022/2554',
            jurisdiction: 'European Union & Global',
            enforcingAuthority: 'EU AI Office & ESMA',
            statutoryDirectives: 'Continuous automated guardrails, immutable audit logging, and incident auto-classification.',
            maxStatutoryFine: 'Up to 7% global annual turnover',
            rules: [
              {
                id: 'r-global-01',
                code: 'RULE-GLOBAL-DRIFT-01',
                title: 'Real-Time LLM Hallucination Guardrail',
                severity: 'CRITICAL',
                category: 'AI Safety',
                triggerType: 'API_PROXY',
                conditionExpression: 'model_hallucination_index <= 0.01 AND pii_scrubbing_active == true',
                description: 'Intercepts prompt payloads and enforces zero-PII leakage and confidence thresholds.',
                enforcementAction: 'BLOCK_TRAFFIC'
              }
            ],
            criticalFeatures: {
              autoRemediation: true,
              realTimeTelemetry: true,
              zkpProofVault: true,
              b2gDirectFiling: true,
              immutableLedger: true,
              aiModelGuardrails: true
            }
          }
        ];
        // Save defaults to DB
        for (const rs of defaultRulesets) {
          await handleSaveRuleset(rs);
        }
      }
    } catch (e) {
      console.warn('Failed to load rulesets from API', e);
    }
  };

  const handleSaveRuleset = async (newRuleset: CustomAddonPayload) => {
    try {
      const response = await fetch('/api/v1/rulesets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRuleset)
      });
      if (response.ok) {
        await fetchRulesets();
        setActiveTab('rules');
      }
    } catch (e) {
      console.error('Failed to save ruleset', e);
    }
  };

  const handleDeleteRuleset = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/rulesets/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchRulesets();
      }
    } catch (e) {
      console.error('Failed to delete ruleset', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold uppercase tracking-wider">
              SaaS Admin Control
            </span>
            <span className="text-xs text-slate-400 font-mono">Dynamic Rule Engine & Policy Fabric</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Sliders className="w-8 h-8 text-indigo-400" />
            Universal Rule Engine & Compliance Matrix
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Maintain, simulate, and deploy dynamic business rules, guardrail triggers, and automated remediation policies across all platform features without code deployments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setSelectedRuleset(null); setActiveTab('builder'); }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Create New Ruleset
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'rules' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Active Rulesets ({savedRulesets.length})
        </button>
        <button
          onClick={() => { setSelectedRuleset(null); setActiveTab('builder'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'builder' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" /> Visual Rule Builder
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" /> Telemetry & Execution Logs
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'security' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Enterprise Security & HSM
        </button>
        <button
          onClick={() => setActiveTab('flags')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'flags' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" /> Feature Flags & Circuit Breakers
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'flags' && (
        <AdvancedFeatureFlagCommandCenter />
      )}
      {activeTab === 'security' && (
        <EnterpriseSecurityCommandView />
      )}
      {activeTab === 'builder' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <SaaSAddonRuleEngineBuilder 
            initialAddon={selectedRuleset}
            onSaveSuccess={handleSaveRuleset}
            onCancel={() => setActiveTab('rules')}
          />
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRulesets.map((ruleset, index) => (
            <div key={index} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-indigo-500/50 transition-all shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold uppercase">
                    {ruleset.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{ruleset.price}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{ruleset.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{ruleset.description}</p>
                
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="text-indigo-300 font-bold">Act: {ruleset.lawActName}</div>
                  <div className="text-slate-400">Rules configured: <strong className="text-white">{ruleset.rules.length}</strong></div>
                  <div className="text-slate-400">Jurisdiction: <strong className="text-white">{ruleset.jurisdiction}</strong></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => { setSelectedRuleset(ruleset); setActiveTab('builder'); }}
                  className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Edit / Simulate
                </button>
                <button
                  onClick={() => {
                    if (ruleset.id) handleDeleteRuleset(ruleset.id);
                  }}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Delete Ruleset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Dynamic Rule Engine Telemetry & Execution History</h3>
              <p className="text-xs text-slate-400">Real-time evaluation logs across all tenant endpoints and guardrail proxies.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-mono font-bold">
              🟢 Engine Active (0.8ms avg latency)
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <div>
                  <div className="text-white font-bold">[RULE EVALUATION] RULE-GLOBAL-DRIFT-01</div>
                  <div className="text-[10px] text-slate-400">Target: Prompt Payload • Condition: model_hallucination_index (0.004) &lt;= 0.01</div>
                </div>
              </div>
              <span className="text-emerald-400 font-bold px-2 py-0.5 bg-emerald-950/40 border border-emerald-800 rounded">PASSED / ALLOWED</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <div>
                  <div className="text-white font-bold">[AUTO-REMEDIATE] RULE-DORA-ICT-01</div>
                  <div className="text-[10px] text-slate-400">Target: ICT Concentration Probe • Action: Secondary Failover Activated</div>
                </div>
              </div>
              <span className="text-amber-400 font-bold px-2 py-0.5 bg-amber-950/40 border border-amber-800 rounded">REMEDIATED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
