import React, { useState, useEffect } from 'react';
import { Globe, Users, ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, Send, Scale, Building2 } from 'lucide-react';

interface OssCase {
  id: string;
  case_number: string;
  lead_authority_id: string;
  lead_jurisdiction: string;
  concerned_authorities_json: string;
  article_basis: string;
  current_stage: 'LEAD_DESIGNATION' | 'MUTUAL_ASSISTANCE' | 'DRAFT_DECISION' | 'CONSENSUS_REACHED' | 'BINDING_DECISION';
  dispute_mechanism_triggered: number;
  final_binding_decision_text?: string;
  created_at: string;
  updated_at: string;
}

export const OssCrossBorderMechanism: React.FC = () => {
  const [leadJurisdiction, setLeadJurisdiction] = useState('DE');
  const [leadAuthorityId, setLeadAuthorityId] = useState('BfDI_GERMANY_FEDERAL');
  const [articleBasis, setArticleBasis] = useState('GDPR_ART_60');
  const [concernedStr, setConcernedStr] = useState('FR_CNIL, IE_DPC, ES_AEPD');
  const [isOpening, setIsOpening] = useState(false);
  const [cases, setCases] = useState<OssCase[]>([]);
  const [activeCase, setActiveCase] = useState<OssCase | null>(null);

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/v1/b2g/oss/cross-border-cases');
      const data = await res.json();
      if (data.success) {
        setCases(data.cases);
        if (data.cases.length > 0 && !activeCase) {
          setActiveCase(data.cases[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleOpenCase = async () => {
    setIsOpening(true);
    try {
      const concerned = concernedStr.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/v1/b2g/oss/cross-border-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_authority_id: leadAuthorityId,
          lead_jurisdiction: leadJurisdiction,
          concerned_authorities: concerned,
          article_basis: articleBasis
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveCase(data.ossCase);
        await fetchCases();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOpening(false);
    }
  };

  const handleAdvanceStage = async (nextStage: any, triggerDispute = false) => {
    if (!activeCase) return;
    try {
      const res = await fetch(`/api/v1/b2g/oss/cross-border-cases/${activeCase.id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          next_stage: nextStage,
          trigger_dispute: triggerDispute,
          binding_decision_text: nextStage === 'BINDING_DECISION' ? 'Cross-Border Lead Authority Binding Penalty Enforcement Issued.' : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveCase(prev => prev ? { ...prev, current_stage: nextStage, dispute_mechanism_triggered: triggerDispute ? 1 : prev.dispute_mechanism_triggered } : null);
        await fetchCases();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">One-Stop-Shop (OSS) Cross-Border Lead Authority Mechanism</h3>
            <p className="text-xs text-slate-400">Cooperation & Consistency Engine under GDPR Art. 60 & GCC Cross-Border Data Framework</p>
          </div>
        </div>
        <button
          onClick={fetchCases}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Cases</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Case Initiation Form */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-400" />
            Initiate OSS Cross-Border Case
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Legal Framework Basis</label>
              <select
                value={articleBasis}
                onChange={e => setArticleBasis(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="GDPR_ART_60">EU GDPR Article 60 (One-Stop-Shop Co-operation)</option>
                <option value="GCC_PROTOCOL_V2">GCC Cross-Border Regulatory Protocol V2</option>
                <option value="US_MULTISTATE_AG">US Multi-State AG Joint Investigation Protocol</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Lead Jurisdiction</label>
                <select
                  value={leadJurisdiction}
                  onChange={e => setLeadJurisdiction(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="DE">Germany (BfDI)</option>
                  <option value="FR">France (CNIL)</option>
                  <option value="IE">Ireland (DPC)</option>
                  <option value="SA">Saudi Arabia (SDAIA)</option>
                  <option value="UAE">UAE (CBUAE/TDRA)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Lead Authority ID</label>
                <input
                  type="text"
                  value={leadAuthorityId}
                  onChange={e => setLeadAuthorityId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Concerned Supervisory Authorities (CSAs)</label>
              <input
                type="text"
                value={concernedStr}
                onChange={e => setConcernedStr(e.target.value)}
                placeholder="Comma separated authority codes"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              onClick={handleOpenCase}
              disabled={isOpening}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 font-bold text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isOpening ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isOpening ? 'Designating Lead Authority...' : 'Open Cross-Border Case'}</span>
            </button>
          </div>
        </div>

        {/* Case Stage & Decision Matrix */}
        <div className="lg:col-span-7 space-y-4">
          {activeCase ? (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Case Number</span>
                  <span className="font-mono font-bold text-sm text-rose-400">{activeCase.case_number}</span>
                </div>
                <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold rounded-full">
                  {activeCase.article_basis}
                </span>
              </div>

              {/* Workflow Stepper */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Article 60 Co-operation Stage</span>
                <div className="grid grid-cols-5 gap-1.5 font-mono text-[10px] text-center">
                  <div className={`p-1.5 rounded ${activeCase.current_stage === 'LEAD_DESIGNATION' ? 'bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40' : 'bg-slate-950 text-slate-500'}`}>
                    1. Lead Desig.
                  </div>
                  <div className={`p-1.5 rounded ${activeCase.current_stage === 'MUTUAL_ASSISTANCE' ? 'bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40' : 'bg-slate-950 text-slate-500'}`}>
                    2. Assistance
                  </div>
                  <div className={`p-1.5 rounded ${activeCase.current_stage === 'DRAFT_DECISION' ? 'bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40' : 'bg-slate-950 text-slate-500'}`}>
                    3. Draft Dec.
                  </div>
                  <div className={`p-1.5 rounded ${activeCase.current_stage === 'CONSENSUS_REACHED' ? 'bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40' : 'bg-slate-950 text-slate-500'}`}>
                    4. Consensus
                  </div>
                  <div className={`p-1.5 rounded ${activeCase.current_stage === 'BINDING_DECISION' ? 'bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40' : 'bg-slate-950 text-slate-500'}`}>
                    5. Binding
                  </div>
                </div>
              </div>

              {/* Action Stage Triggers */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => handleAdvanceStage('MUTUAL_ASSISTANCE')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
                >
                  Request Mutual Assistance (Art. 61)
                </button>
                <button
                  onClick={() => handleAdvanceStage('DRAFT_DECISION')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
                >
                  Submit Draft Decision
                </button>
                <button
                  onClick={() => handleAdvanceStage('BINDING_DECISION')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  Publish Binding Decision
                </button>
              </div>

              {/* Concerned Authorities */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Concerned Supervisory Authorities (CSAs)</h5>
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const csas = typeof activeCase.concerned_authorities_json === 'string' ? JSON.parse(activeCase.concerned_authorities_json || '[]') : (activeCase.concerned_authorities_json || []);
                    return csas.map((csa: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-rose-300 font-mono text-xs rounded-md">
                        {csa}
                      </span>
                    ));
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Select or initiate a cross-border OSS case above.
            </div>
          )}

          {/* Cases List */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Cross-Border Docket ({cases.length})</h5>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cases.map(item => (
                <div
                  key={item.id}
                  onClick={() => setActiveCase(item)}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center justify-between ${
                    activeCase?.id === item.id ? 'bg-slate-800 border-rose-500/50 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-rose-400" />
                    <span>{item.case_number}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{item.current_stage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
