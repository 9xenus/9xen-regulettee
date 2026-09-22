import React, { useState, useEffect } from 'react';
import { 
  Shield, Globe, Link as LinkIcon, AlertTriangle, 
  CheckCircle2, RefreshCw, Scale, BookOpen,
  Search, ChevronRight, Zap, Info, ExternalLink, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GlobalAct {
  region: string;
  law: string;
  directive_id: string;
  title: string;
  summary: string;
  source_url: string;
  policy_affected: string;
}

interface LawRule {
  id: string;
  law_id: string;
  section_code: string;
  section_text: string;
  severity_grade: string;
  law_name: string;
  country_name: string;
  global_ref?: string;
  penalty_type?: string;
  penalty_max?: number;
  penalty_currency?: string;
  violation_types?: string;
  imprisonment_note?: string;
}

export const RegulatoryLawManager: React.FC = () => {
  const [globalActs, setGlobalActs] = useState<GlobalAct[]>([]);
  const [lawRules, setLawRules] = useState<LawRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAct, setSelectedAct] = useState<GlobalAct | null>(null);
  const [mappingStatus, setMappingStatus] = useState<{ id: string; status: 'idle' | 'mapping' | 'success' | 'error' }>({ id: '', status: 'idle' });
  const [aiMappingState, setAiMappingState] = useState<{ ruleId: string; status: 'idle' | 'analyzing' | 'success'; suggestions: any[] }>({ ruleId: '', status: 'idle', suggestions: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [actsRes, rulesRes] = await Promise.all([
        fetch('/api/v1/nre/regulatory/acts'),
        fetch('/api/v1/nre/law-rules')
      ]);
      const actsData = await actsRes.json();
      const rulesData = await rulesRes.json();
      setGlobalActs(actsData);
      setLawRules(rulesData);
    } catch (err) {
      console.error('Failed to fetch mapping data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMapRule = async (ruleId: string, globalRef: string) => {
    setMappingStatus({ id: ruleId, status: 'mapping' });
    try {
      const res = await fetch('/api/v1/nre/law-rules/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, globalRef })
      });
      if (res.ok) {
        setMappingStatus({ id: ruleId, status: 'success' });
        setLawRules(prev => prev.map(r => r.id === ruleId ? { ...r, global_ref: globalRef } : r));
        setTimeout(() => setMappingStatus({ id: '', status: 'idle' }), 2000);
      } else {
        setMappingStatus({ id: ruleId, status: 'error' });
      }
    } catch (err) {
      setMappingStatus({ id: ruleId, status: 'error' });
    }
  };

  const handleAISuggestion = async (rule: LawRule) => {
    setAiMappingState({ ruleId: rule.id, status: 'analyzing', suggestions: [] });
    // In production, this calls /api/compliance/auto-map which uses the RAG orchestrator.
    // For this prototype, we simulate the LLM response to bypass rate limits.
    setTimeout(() => {
      setAiMappingState({
        ruleId: rule.id,
        status: 'success',
        suggestions: [
          {
            title: 'Implement Data Encryption at Rest (AES-256)',
            description: 'Ensure all storage volumes containing PII are encrypted to meet the data protection requirements outlined in this regulation.',
            severity: 'High'
          },
          {
            title: 'Establish Immutable Audit Logging',
            description: 'Maintain immutable logs of all access to sensitive data points for at least 12 months for compliance verifiability.',
            severity: 'Medium'
          }
        ]
      });
    }, 2500);
  };

  const filteredRules = lawRules.filter(r => 
    r.section_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.law_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.country_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-indigo-400" />
            Regulatory Mapping Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Link real-time global regulatory acts to internal NRE law rules for dynamic compliance enforcement.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search internal rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Acts Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 h-full">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              Available Global Acts
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {globalActs.map((act) => (
                <button
                  key={act.directive_id}
                  onClick={() => setSelectedAct(act)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all group ${
                    selectedAct?.directive_id === act.directive_id
                      ? 'bg-indigo-600/20 border-indigo-500/50 ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{act.region}</span>
                    <span className="text-[10px] font-mono text-slate-500">{act.law}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{act.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {act.summary}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rules Mapping Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 min-h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                Internal NRE Rules Mapping
              </h3>
              {selectedAct && (
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-950/40 border border-indigo-800/50 rounded-full">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-bold text-indigo-300">Target: {selectedAct.law}</span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRules.length === 0 ? (
                  <div className="text-center py-20 text-slate-600">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No internal rules found matching your search.</p>
                  </div>
                ) : (
                  filteredRules.map((rule) => (
                    <div key={rule.id} className="bg-slate-950/50 border border-slate-800/60 p-6 rounded-3xl hover:border-slate-700 transition-all">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-400 text-[10px] font-bold">{rule.country_name}</span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">{rule.law_name}</span>
                          </div>
                          <h4 className="text-md font-bold text-white mb-1">{rule.section_code}: {rule.section_text}</h4>
                          
                          <div className="flex flex-wrap gap-2 mt-3 mb-3">
                            {rule.severity_grade && (
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                                rule.severity_grade === 'critical' ? 'bg-rose-950/50 text-rose-400 border-rose-900/50' :
                                rule.severity_grade === 'major' ? 'bg-amber-950/50 text-amber-400 border-amber-900/50' :
                                'bg-slate-900 text-slate-400 border-slate-800'
                              }`}>
                                Severity: {rule.severity_grade}
                              </span>
                            )}
                            
                            {rule.penalty_max && rule.penalty_max > 0 ? (
                              <span className="px-2 py-0.5 rounded-lg bg-indigo-950/30 text-indigo-400 border border-indigo-900/30 text-[9px] font-bold uppercase tracking-wider">
                                Max Penalty: {rule.penalty_max.toLocaleString()} {rule.penalty_currency}
                              </span>
                            ) : null}

                            {rule.imprisonment_note && (
                              <span className="px-2 py-0.5 rounded-lg bg-purple-950/30 text-purple-400 border border-purple-900/30 text-[9px] font-bold uppercase tracking-wider">
                                🚨 Imprisonment Risk
                              </span>
                            )}

                            {rule.violation_types && (() => {
                              try {
                                const vTypes = JSON.parse(rule.violation_types);
                                return vTypes.map((vt: string) => (
                                  <span key={vt} className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[9px] font-bold uppercase tracking-wider">
                                    {vt.replace(/_/g, ' ')}
                                  </span>
                                ));
                              } catch(e) { return null; }
                            })()}
                          </div>

                          {rule.global_ref ? (
                            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-950/30 border border-emerald-900/30 rounded-xl">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-[10px] font-bold text-emerald-400">Mapped to {rule.global_ref}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-[10px] font-bold text-slate-500">Unmapped Rule</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <AnimatePresence mode="wait">
                            {selectedAct ? (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => handleMapRule(rule.id, selectedAct.law)}
                                disabled={mappingStatus.id === rule.id && mappingStatus.status === 'mapping'}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 ${
                                  rule.global_ref === selectedAct.law
                                    ? 'bg-slate-900 text-slate-500 cursor-default'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                                }`}
                              >
                                {mappingStatus.id === rule.id && mappingStatus.status === 'mapping' ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : rule.global_ref === selectedAct.law ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <LinkIcon className="w-3 h-3" />
                                )}
                                {rule.global_ref === selectedAct.law ? 'Currently Mapped' : 'Link to Act'}
                              </motion.button>
                            ) : (
                              <span className="text-[10px] text-slate-600 italic">Select act to map</span>
                            )}
                          </AnimatePresence>
                          <button 
                            onClick={() => handleAISuggestion(rule)}
                            disabled={aiMappingState.ruleId === rule.id && aiMappingState.status === 'analyzing'}
                            className="px-4 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 bg-slate-900 border border-slate-700 text-indigo-300 hover:bg-slate-800 hover:border-indigo-500/50 group"
                          >
                            {aiMappingState.ruleId === rule.id && aiMappingState.status === 'analyzing' ? (
                              <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                            ) : (
                              <Sparkles className="w-3 h-3 text-indigo-400 group-hover:text-indigo-300" />
                            )}
                            AI Mapping
                          </button>
                        </div>
                      </div>

                      {/* AI Suggestions Panel */}
                      <AnimatePresence>
                        {aiMappingState.ruleId === rule.id && aiMappingState.status === 'success' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-2xl">
                              <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                <h5 className="text-xs font-bold text-indigo-300">AI Suggested Internal Controls</h5>
                              </div>
                              <div className="space-y-3">
                                {aiMappingState.suggestions.map((s, idx) => (
                                  <div key={idx} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-start justify-between gap-4 group hover:border-indigo-500/30 transition-colors">
                                    <div>
                                      <h6 className="text-xs font-bold text-white flex items-center gap-2">
                                        {s.title}
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider ${
                                          s.severity === 'Critical' ? 'bg-rose-950/50 text-rose-400' :
                                          s.severity === 'High' ? 'bg-amber-950/50 text-amber-400' :
                                          'bg-blue-950/50 text-blue-400'
                                        }`}>
                                          {s.severity}
                                        </span>
                                      </h6>
                                      <p className="text-[10px] text-slate-400 mt-1">{s.description}</p>
                                    </div>
                                    <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      Add Control
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Compliance Intelligence Footer */}
      <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-[2rem] p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-300">NRE Dynamic Compliance Intelligence</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Mapped rules are automatically updated when the background sync service detects revisions in global acts. 
              The <strong className="text-indigo-400">Policy Sovereignty Engine</strong> will evaluate if local transpositions 
              meet the updated requirements and flag drifts in the Country Audit Logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
