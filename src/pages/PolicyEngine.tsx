import { fetchWithRetry } from '../lib/api-client';
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Globe, 
  Clock, 
  Database, 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  FileJson,
  ChevronRight,
  AlertCircle,
  Zap,
  PlayCircle,
  Fingerprint,
  MapPin,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Wand2,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PolicyGraphEditor } from '../components/PolicyGraphEditor';
import { VersionHistory } from '../components/VersionHistory';
import { useJurisdiction } from '../context/JurisdictionContext';
import { AdvancedComplianceEngine } from '../components/compliance/AdvancedComplianceEngine';

interface PolicyRule {
  id: string;
  attribute: string;
  operator: string;
  value: string;
}

interface Policy {
  id?: string;
  name: string;
  description: string;
  effect: 'ALLOW' | 'DENY';
  rules: PolicyRule[];
  rego_code?: string;
  updated_at?: string;
}

export interface PolicySnapshot extends Policy {
  policy_id: string;
  changeSummary: string;
  approvedBy: string;
  publishedAt: string;
}

export const PolicyEngine: React.FC = () => {
  const { jurisdiction } = useJurisdiction();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [policy, setPolicy] = useState<Policy>({
    id: 'new',
    name: "Standard Data Access Control",
    description: "Defines cross-border data transfer permissions for PII.",
    effect: 'ALLOW',
    rules: [
      { id: '1', attribute: 'user.role', operator: 'EQUALS', value: 'DataPrivacyOfficer' },
      { id: '2', attribute: 'request.location', operator: 'IN_LIST', value: 'EU, UK, US' }
    ]
  });

  const [history, setHistory] = useState<PolicySnapshot[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState<'builder' | 'compliance-engine'>('compliance-engine');
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'rego' | 'simulation' | 'graph'>('visual');
  
  React.useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithRetry("/api/v1/security/policies");
      const data = await res.json();
      if (data.success && data.policies.length > 0) {
        setPolicies(data.policies);
        setPolicy(data.policies[0]);
        fetchHistory(data.policies[0].id);
      }
    } catch (err) {
      console.error("Failed to load policies", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async (id: string) => {
    if (!id || id === 'new') return;
    try {
      const res = await fetchWithRetry(`/api/v1/security/policies/${id}/history`);
      const data = await res.json();
      if (data.success) {
        const h = data.history.map((item: any) => ({
          ...item,
          changeSummary: item.change_summary,
          approvedBy: item.approved_by,
          publishedAt: item.published_at
        }));
        setHistory(h);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const handlePolicySwitch = (id: string) => {
    if (id === 'new') {
      setPolicy({
        id: 'new',
        name: "New Policy",
        description: "",
        effect: 'ALLOW',
        rules: []
      });
      setHistory([]);
      return;
    }
    const found = policies.find(p => p.id === id);
    if (found) {
      setPolicy(found);
      fetchHistory(id);
    }
  };
  
  const [simulationInput, setSimulationInput] = useState<Record<string, string>>({
    'user.role': 'DataPrivacyOfficer',
    'request.location': 'EU',
    'user.clearance': 'L3',
    'resource.sensitivity': 'HIGH'
  });

  const [simulationResult, setSimulationResult] = useState<{ allowed: boolean; reasoning: string[] } | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [quickFixes, setQuickFixes] = useState<Record<number, string>>({});
  const [isGeneratingFix, setIsGeneratingFix] = useState<number | null>(null);

  React.useEffect(() => {
    detectConflicts(policy.rules);
    setQuickFixes({});
  }, [policy.rules]);

  React.useEffect(() => {
    setSimulationInput(prev => ({ ...prev, 'request.location': jurisdiction === 'GDPR' ? 'EU' : jurisdiction === 'CCPA' ? 'US-CA' : jurisdiction }));
  }, [jurisdiction]);

  const detectConflicts = (rules: PolicyRule[]) => {
    const newConflicts: string[] = [];
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        if (rules[i].attribute === rules[j].attribute && 
            rules[i].operator === rules[j].operator &&
            rules[i].value !== rules[j].value) {
          newConflicts.push(`Conflict: Rule ${i + 1} and ${j + 1} for ${rules[i].attribute} have conflicting values.`);
        }
      }
    }
    setConflicts(newConflicts);
  };

  const generateQuickFix = async (conflict: string, index: number) => {
    setIsGeneratingFix(index);
    try {
      // Simulate calling a custom LLM API
      await new Promise(r => setTimeout(r, 1200));
      setQuickFixes(prev => ({
        ...prev,
        [index]: `Custom LLM Remediation: Adjust the conflicting rules to use 'IN_LIST' with combined values to satisfy both constraints.`
      }));
    } finally {
      setIsGeneratingFix(null);
    }
  };

  const evaluatePolicy = () => {
    const reasoning: string[] = [];
    let allRulesPassed = true;

    policy.rules.forEach((rule, idx) => {
      const inputValue = simulationInput[rule.attribute] || '';
      let passed = false;

      if (rule.operator === 'EQUALS') passed = inputValue === rule.value;
      else if (rule.operator === 'NOT_EQUALS') passed = inputValue !== rule.value;
      else if (rule.operator === 'IN_LIST') {
        const list = rule.value.split(',').map(s => s.trim());
        passed = list.includes(inputValue);
      }
      else if (rule.operator === 'GREATER_THAN') passed = parseFloat(inputValue) > parseFloat(rule.value);
      else if (rule.operator === 'CONTAINS') passed = inputValue.includes(rule.value);

      if (passed) {
        reasoning.push(`Rule ${idx + 1} (${rule.attribute}): MATCHED [${inputValue}]`);
      } else {
        reasoning.push(`Rule ${idx + 1} (${rule.attribute}): FAILED [${inputValue} != ${rule.value}]`);
        allRulesPassed = false;
      }
    });

    setSimulationResult({
      allowed: policy.effect === 'ALLOW' ? allRulesPassed : !allRulesPassed,
      reasoning
    });
  };

  const generateRego = (p: Policy) => {
    const rulesCode = p.rules.map(rule => {
      let op = '==';
      let val = `"${rule.value}"`;
      
      if (rule.operator === 'NOT_EQUALS') op = '!=';
      if (rule.operator === 'GREATER_THAN') op = '>';
      if (rule.operator === 'IN_LIST') {
        const list = rule.value.split(',').map(s => `"${s.trim()}"`).join(', ');
        return `    data.utils.is_in([${list}], input.${rule.attribute})`;
      }
      if (rule.operator === 'CONTAINS') {
        return `    contains(input.${rule.attribute}, "${rule.value}")`;
      }
      
      return `    input.${rule.attribute} ${op} ${val}`;
    }).join('\n');

    return `package authz\n\n# ${p.name}\n# ${p.description}\n\ndefault allow = false\n\nallow {\n${rulesCode}\n}`;
  };

  const commitPolicy = async () => {
    try {
      const regoCode = generateRego(policy);
      const policyId = (policy.id === 'new' || !policy.id) ? 'pol-' + Math.random().toString(36).substring(2, 9) : policy.id;
      
      const res = await fetchWithRetry("/api/v1/security/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: policyId,
          name: policy.name,
          description: policy.description,
          effect: policy.effect,
          rules: policy.rules,
          regoCode,
          changeSummary: `Updated ${policy.rules.length} rules and set effect to ${policy.effect}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus(data.message);
        setTimeout(() => setSaveStatus(null), 3000);
        await fetchPolicies();
        if (policy.id === 'new' || !policy.id) {
          handlePolicySwitch(policyId);
        } else {
          fetchHistory(policyId);
        }
      }
    } catch (err) {
      console.error("Failed to commit policy", err);
    }
  };

  const revertTo = async (snapshot: PolicySnapshot) => {
    if (!policy.id || policy.id === 'new') return;
    try {
      const res = await fetchWithRetry(`/api/v1/security/policies/${policy.id}/revert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshotId: snapshot.id })
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus(data.message);
        setTimeout(() => setSaveStatus(null), 3000);
        await fetchPolicies();
        fetchHistory(policy.id);
      }
    } catch (err) {
      console.error("Failed to revert policy", err);
    }
  };

  const addRule = () => {
    const newRule: PolicyRule = {
      id: Math.random().toString(36).substr(2, 9),
      attribute: 'request.context',
      operator: 'EQUALS',
      value: ''
    };
    setPolicy({ ...policy, rules: [...policy.rules, newRule] });
  };

  const removeRule = (id: string) => {
    setPolicy({ ...policy, rules: policy.rules.filter(r => r.id !== id) });
  };

  const updateRule = (id: string, updates: Partial<PolicyRule>) => {
    setPolicy({
      ...policy,
      rules: policy.rules.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      {saveStatus && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {saveStatus}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Compliance & Policy Engine
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Automated multi-jurisdiction rule verification, autonomous RAG scanning, and Policy-as-Code governance.
          </p>
        </div>
        
        {viewMode === 'builder' && (
          <div className="flex items-center gap-3">
            <select 
              value={policy.id || 'new'} 
              onChange={(e) => handlePolicySwitch(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white outline-none focus:border-indigo-300"
            >
              <option value="new">+ Create New Policy</option>
              {policies.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`px-4 py-2 border rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${showHistory ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Clock className="w-3.5 h-3.5" />
              History
            </button>
            <button 
              onClick={commitPolicy}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200"
            >
              <Play className="w-3.5 h-3.5" />
              Deploy Policy
            </button>
          </div>
        )}
      </div>

      {/* Top View Selector Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs gap-1">
        <button
          onClick={() => setViewMode('compliance-engine')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            viewMode === 'compliance-engine'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Autonomous Compliance Engine & Evaluator
        </button>
        <button
          onClick={() => setViewMode('builder')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            viewMode === 'builder'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Zero-Trust Policy-as-Code Builder
        </button>
      </div>

      {viewMode === 'compliance-engine' ? (
        <AdvancedComplianceEngine />
      ) : isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-500">Loading Policies from SQLite...</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 sm:gap-8">
        <div className={`${showHistory ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-4 sm:space-y-6 transition-all duration-300`}>
          {/* Policy Meta */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Policy Name</label>
                <input 
                  type="text" 
                  value={policy.name}
                  onChange={(e) => setPolicy({...policy, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Effect</label>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button 
                    onClick={() => setPolicy({...policy, effect: 'ALLOW'})}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${policy.effect === 'ALLOW' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    ALLOW
                  </button>
                  <button 
                    onClick={() => setPolicy({...policy, effect: 'DENY'})}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${policy.effect === 'DENY' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    DENY
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Governance Description</label>
              <textarea 
                value={policy.description}
                onChange={(e) => setPolicy({...policy, description: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none h-20 resize-none"
              />
            </div>
          </div>

          {/* Rules Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Rule Logic Gates
                <span className="text-[10px] font-bold text-slate-400 uppercase">(Conditional Expressions)</span>
              </h3>
              <button 
                onClick={addRule}
                className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                Add Logical Gate
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {conflicts.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase">
                        <AlertCircle className="w-4 h-4" />
                        Policy Conflicts Detected
                      </div>
                    </div>
                    {conflicts.map((conflict, i) => (
                      <div key={i} className="space-y-2">
                        <p className="text-[11px] text-rose-600 font-mono">{conflict}</p>
                        
                        {quickFixes[i] ? (
                          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                            <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-bold mb-1">
                              <Sparkles className="w-3 h-3" />
                              AI Remediation Suggestion
                            </div>
                            <p className="text-[11px] text-indigo-600 font-medium leading-relaxed">
                              {quickFixes[i]}
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => generateQuickFix(conflict, i)}
                            disabled={isGeneratingFix === i}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg text-[10px] font-bold uppercase transition-all disabled:opacity-50"
                          >
                            {isGeneratingFix === i ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            {isGeneratingFix === i ? 'Analyzing...' : 'Generate Quick-Fix'}
                          </button>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
                {policy.rules.map((rule, idx) => (
                  <motion.div 
                    key={rule.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm relative group"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs font-black">
                      {idx + 1}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 flex-1">
                      <select 
                        value={rule.attribute}
                        onChange={(e) => updateRule(rule.id, { attribute: e.target.value })}
                        className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/10"
                      >
                        <option value="user.role">User Role</option>
                        <option value="user.clearance">Security Clearance</option>
                        <option value="request.location">Geographic Location</option>
                        <option value="request.context">Environment Context</option>
                        <option value="resource.sensitivity">Data Sensitivity</option>
                      </select>

                      <select 
                        value={rule.operator}
                        onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
                        className="bg-indigo-50/50 border border-indigo-100/50 px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 outline-none"
                      >
                        <option value="EQUALS">EQUALS</option>
                        <option value="NOT_EQUALS">NOT EQUALS</option>
                        <option value="IN_LIST">IS IN LIST</option>
                        <option value="GREATER_THAN">GREATER THAN</option>
                        <option value="CONTAINS">CONTAINS</option>
                      </select>

                      <input 
                        type="text"
                        value={rule.value}
                        placeholder="Expected value..."
                        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                        className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>

                    <button 
                      onClick={() => removeRule(rule.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Engine Status */}
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-20 h-20 text-indigo-400" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Engine</span>
              </div>
              <h3 className="text-xl font-bold mb-2 italic">Invincible Governance</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Rules are compiled into an optimized bytecode executed in a sandbox environment, ensuring millisecond-level compliance checks without infrastructure overhead.
              </p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-500 uppercase">Policy Complexity</span>
                  <span className="text-indigo-400">O(log n)</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[40%] h-full bg-indigo-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Preview Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setActiveTab('visual')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'visual' ? 'bg-white text-indigo-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
              >
                Attributes
              </button>
              <button 
                onClick={() => setActiveTab('json')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'json' ? 'bg-white text-indigo-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
              >
                JSON Export
              </button>
              <button 
                onClick={() => setActiveTab('rego')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'rego' ? 'bg-white text-indigo-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
              >
                Rego (OPA)
              </button>
              <button 
                onClick={() => setActiveTab('simulation')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'simulation' ? 'bg-white text-indigo-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
              >
                Simulation
              </button>
              <button 
                onClick={() => setActiveTab('graph')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'graph' ? 'bg-white text-indigo-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
              >
                Flow Editor
              </button>
            </div>
            
            <div className="p-4 bg-slate-50/50">
              {activeTab === 'visual' ? (
                <div className="space-y-3">
                  {[
                    { icon: UserCheck, label: 'Identities', count: 24, color: 'text-blue-500' },
                    { icon: Globe, label: 'Jurisdictions', count: 3, color: 'text-indigo-500' },
                    { icon: Clock, label: 'Time Windows', count: 1, color: 'text-amber-500' },
                    { icon: Database, label: 'Resources', count: 12, color: 'text-emerald-500' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                        <span className="text-[11px] font-bold text-slate-700">{stat.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{stat.count}</span>
                    </div>
                  ))}
                </div>
              ) : activeTab === 'json' ? (
                <pre className="text-[10px] font-mono text-slate-500 overflow-x-auto p-2 bg-slate-900 text-emerald-400 rounded-lg">
                  {JSON.stringify(policy, null, 2)}
                </pre>
              ) : activeTab === 'rego' ? (
                <div className="relative group">
                  <pre className="text-[10px] font-mono text-indigo-300 overflow-x-auto p-4 bg-slate-900 rounded-xl leading-relaxed">
                    {generateRego(policy)}
                  </pre>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-black bg-indigo-500 text-white px-1.5 py-0.5 rounded">AUTO-GENERATED</span>
                  </div>
                </div>
              ) : activeTab === 'graph' ? (
                <PolicyGraphEditor rules={policy.rules} />
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {Object.keys(simulationInput).map((attr) => (
                      <div key={attr} className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{attr}</label>
                        <input 
                          type="text" 
                          value={simulationInput[attr]}
                          onChange={(e) => setSimulationInput({ ...simulationInput, [attr]: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] focus:ring-2 focus:ring-indigo-500/10 outline-none"
                          placeholder={`Enter ${attr}...`}
                        />
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={evaluatePolicy}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Evaluate Request
                  </button>

                  <AnimatePresence>
                    {simulationResult && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-2xl border ${simulationResult.allowed ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {simulationResult.allowed ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
                            <span className={`text-xs font-black uppercase ${simulationResult.allowed ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {simulationResult.allowed ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Decision Engine</span>
                        </div>
                        <div className="space-y-1.5">
                          {simulationResult.reasoning.map((reason, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className={`w-1 h-1 rounded-full ${reason.includes('MATCHED') ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                              <span className="text-[9px] font-mono text-slate-600 truncate">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-indigo-700 leading-normal italic">
              Pro-Tip: Use <strong>IN_LIST</strong> for multi-regional compliance mandates like GDPR Article 44.
            </p>
          </div>
        </div>

        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-1 space-y-4 sm:space-y-6"
            >
              <VersionHistory history={history} onRevert={revertTo} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}
    </div>
  );
};
