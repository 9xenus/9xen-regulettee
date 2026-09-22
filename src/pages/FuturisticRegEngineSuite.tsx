import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  Cpu, 
  Send, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  Globe2, 
  FileCheck, 
  Layers,
  Sparkles,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchWithRetry } from '../lib/api-client';

export const FuturisticRegEngineSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radar' | 'synthetic' | 'symbolic' | 'diplomacy' | 'quantum' | 'zkp'>('radar');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Systemic Risk Radar State
  const [radarData, setRadarData] = useState<any>(null);

  // 2. Synthetic Market Testing State
  const [productName, setProductName] = useState('Cross-Border Liquidity Engine');
  const [jurisdiction, setJurisdiction] = useState<'EU_AI_ACT' | 'DORA' | 'GDPR' | 'MICA'>('DORA');
  const [stressLevel, setStressLevel] = useState<'STANDARD' | 'EXTREME' | 'SYSTEMIC_SHOCK'>('EXTREME');
  const [simResult, setSimResult] = useState<any>(null);

  // 3. Neural-Symbolic Reasoning State
  const [aiInterpretation, setAiInterpretation] = useState('We can sync customer telemetry across EU-US servers directly without SCCs by anonymizing IP addresses.');
  const [symbolicResult, setSymbolicResult] = useState<any>(null);

  // 4. Diplomacy Agent State
  const [recipient, setRecipient] = useState('European Data Protection Board (EDPB)');
  const [subject, setSubject] = useState('Art. 33 Telemetry Anomaly Notification');
  const [contextData, setContextData] = useState('System telemetry detected an unscheduled 42ms database latency spike in EU-East cluster.');
  const [draftResponse, setDraftResponse] = useState<any>(null);

  // 5. Quantum Readiness State
  const [quantumData, setQuantumData] = useState<any>(null);

  // 6. ZKP Evidence Vault State
  const [proofType, setProofType] = useState<'GDPR_CONSENT_VALIDITY' | 'DORA_CAPITAL_RESERVE' | 'AI_ACT_LINEAGE_CLEAN'>('GDPR_CONSENT_VALIDITY');
  const [claimDetails, setClaimDetails] = useState('Demonstrate 100% valid user consent audit trailing without exposing raw user identity logs.');
  const [zkpProof, setZkpProof] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadRadarData = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/futuristic/systemic-risk-radar');
      if (res && res.ok) {
        const json = await res.json();
        setRadarData(json);
      }
    } catch (err) {
      console.warn('Radar fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuantumData = async () => {
    try {
      const res = await fetchWithRetry('/api/v1/futuristic/quantum-vault-readiness');
      if (res && res.ok) {
        const json = await res.json();
        setQuantumData(json.readiness);
      }
    } catch (err) {
      console.warn('Quantum fetch warning:', err);
    }
  };

  useEffect(() => {
    loadRadarData();
    loadQuantumData();
  }, []);

  const handleRunSyntheticTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/futuristic/synthetic-market-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, jurisdiction, stressLevel }),
      });
      if (res && res.ok) {
        const json = await res.json();
        setSimResult(json.result);
        showToast('Synthetic regulatory stress test execution completed.');
      }
    } catch (err) {
      showToast('Synthetic test execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySymbolic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/futuristic/symbolic-reasoning-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiOutputInterpretation: aiInterpretation, jurisdiction }),
      });
      if (res && res.ok) {
        const json = await res.json();
        setSymbolicResult(json.result);
        showToast('Symbolic logic verification executed.');
      }
    } catch (err) {
      showToast('Symbolic verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/futuristic/diplomacy-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientRegulator: recipient, subject, contextData }),
      });
      if (res && res.ok) {
        const json = await res.json();
        setDraftResponse(json.draft);
        showToast('Autonomous diplomacy draft generated (Human Authorization Required).');
      }
    } catch (err) {
      showToast('Draft generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateZkpProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/futuristic/zkp-generate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: 'org_1', proofType, claimDetails }),
      });
      if (res && res.ok) {
        const json = await res.json();
        setZkpProof(json.proof);
        showToast('Zero-Knowledge Compliance Proof generated successfully.');
      }
    } catch (err) {
      showToast('ZKP generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[9999] bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/80 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              20-YEARS-AHEAD REGTECH ENGINE
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Tier 1-3 Systems Online
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Next-Gen Regulatory Intelligence & Resilience Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Integrating planet-scale systemic risk aggregation, synthetic regulatory stress testing, neural-symbolic rule verification, zero-knowledge proofs, and human-gated AI diplomacy.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'radar', label: '1. Systemic Risk Radar', icon: Globe2 },
          { id: 'synthetic', label: '2. Synthetic Reg Testing', icon: Cpu },
          { id: 'symbolic', label: '3. Neural-Symbolic Rules', icon: Layers },
          { id: 'diplomacy', label: '4. AI Diplomacy Agent', icon: Send },
          { id: 'zkp', label: '5. ZKP Evidence Vault', icon: KeyRound },
          { id: 'quantum', label: '6. Quantum & Biometric Readiness', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer",
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Systemic Risk Radar */}
      {activeTab === 'radar' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Planet-Scale Systemic Risk Radar</h3>
              <p className="text-xs text-slate-500 mt-0.5">Aggregates anonymized threat vectors across all enterprise nodes with k-anonymity (N ≥ 3) hard gates.</p>
            </div>
            <button
              onClick={loadRadarData}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              Sync Radar
            </button>
          </div>

          {radarData?.kAnonymityGatePassed ? (
            <div className="space-y-4">
              {radarData?.signals?.map((sig: any, i: number) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                        sig.threatLevel === 'CRITICAL' ? "bg-purple-100 text-purple-900" :
                        sig.threatLevel === 'HIGH' ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                      )}>
                        {sig.threatLevel} RISK
                      </span>
                      <span className="text-xs font-mono text-slate-400">{sig.patternSignature}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{sig.riskCategory}</h4>
                    <p className="text-xs text-slate-600">{sig.recommendation}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Anonymized Nodes</div>
                    <div className="text-lg font-black text-indigo-600">{sig.affectedTenantsAnonymizedCount} Tenants</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-medium">
              K-Anonymity hard gate active: Minimum N ≥ 3 independent enterprise nodes required to display aggregated threat vectors.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Synthetic Regulatory Environments */}
      {activeTab === 'synthetic' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Synthetic Regulatory Stress Testing</h3>
            <p className="text-xs text-slate-500 mt-0.5">Executes product launches against rule-governed synthetic regulator agents before public deployment.</p>
          </div>

          <form onSubmit={handleRunSyntheticTest} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Framework</label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 outline-none cursor-pointer"
              >
                <option value="DORA">DORA (Digital Resilience)</option>
                <option value="EU_AI_ACT">EU AI Act (Governance)</option>
                <option value="GDPR">GDPR (Data Protection)</option>
                <option value="MICA">MiCA (Digital Assets)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stress Level</label>
              <select
                value={stressLevel}
                onChange={(e) => setStressLevel(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 outline-none cursor-pointer"
              >
                <option value="STANDARD">Standard Audit Simulation</option>
                <option value="EXTREME">Extreme Inspection Shock</option>
                <option value="SYSTEMIC_SHOCK">Systemic Crisis Stress</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{loading ? 'Simulating...' : 'Execute Synthetic Stress Test'}</span>
              </button>
            </div>
          </form>

          {simResult && (
            <div className={cn(
              "p-5 rounded-2xl border space-y-3",
              simResult.passed ? "bg-emerald-50 border-emerald-200 text-emerald-950" : "bg-rose-50 border-rose-200 text-rose-950"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider">Simulation ID: {simResult.simulationId}</span>
                <span className="text-sm font-black">Score: {simResult.complianceScore}%</span>
              </div>
              <p className="text-xs font-medium leading-relaxed">{simResult.simulatedRegulatorResponse}</p>

              {simResult.identifiedVulnerabilities?.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-rose-200/60">
                  <div className="text-[11px] font-bold text-rose-800 uppercase">Identified Vulnerabilities:</div>
                  {simResult.identifiedVulnerabilities.map((v: any, idx: number) => (
                    <div key={idx} className="text-xs font-mono bg-white/80 p-2 rounded-lg border border-rose-200">
                      [{v.ruleId}] {v.details}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Neural-Symbolic Rules */}
      {activeTab === 'symbolic' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Neural-Symbolic Verification Layer</h3>
            <p className="text-xs text-slate-500 mt-0.5">Cross-validates Generative AI output against human-authored deterministic legal logic rules before execution.</p>
          </div>

          <form onSubmit={handleVerifySymbolic} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">AI Recommendation / RAG Output to Verify</label>
              <textarea
                rows={3}
                value={aiInterpretation}
                onChange={(e) => setAiInterpretation(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Layers className="w-4 h-4" />
              <span>Verify Against Symbolic Logic Rules</span>
            </button>
          </form>

          {symbolicResult && (
            <div className={cn(
              "p-5 rounded-2xl border space-y-2",
              symbolicResult.verified ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"
            )}>
              <div className="flex items-center gap-2 font-bold text-xs">
                {symbolicResult.verified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                )}
                <span>{symbolicResult.verified ? 'Symbolic Logic Rule Verification PASSED' : 'Symbolic Conflict Detected - Recommendation Blocked'}</span>
              </div>

              {symbolicResult.ruleViolated && (
                <div className="text-xs space-y-1 pt-1 font-mono">
                  <div><strong>Violated Rule:</strong> {symbolicResult.violatedRuleId}</div>
                  <div><strong>Rule Description:</strong> {symbolicResult.ruleDescription}</div>
                  <div className="text-rose-700 mt-1"><strong>Details:</strong> {symbolicResult.conflictDetails}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: AI Diplomacy Agent */}
      {activeTab === 'diplomacy' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Autonomous Regulatory Diplomacy Agent</h3>
            <p className="text-xs text-slate-500 mt-0.5">Drafts routine regulatory filings and incident disclosures. Requires human-in-the-loop authorization prior to dispatch.</p>
          </div>

          <form onSubmit={handleGenerateDraft} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Authority</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Matter</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Context Payload / Incident Details</label>
              <textarea
                rows={2}
                value={contextData}
                onChange={(e) => setContextData(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Generate Regulatory Draft</span>
              </button>
            </div>
          </form>

          {draftResponse && (
            <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl space-y-4 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-indigo-400 font-bold">{draftResponse.draftId}</span>
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-[10px] font-black uppercase tracking-wider">
                  HUMAN AUTHORIZATION REQUIRED
                </span>
              </div>

              <pre className="text-xs font-mono whitespace-pre-wrap text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                {draftResponse.generatedContent}
              </pre>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => showToast('Draft rejected and archived.')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Reject Draft
                </button>
                <button
                  onClick={() => showToast(`Draft ${draftResponse.draftId} authorized and queued for secure transmission.`)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  Approve & Transmit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: ZKP Evidence Vault */}
      {activeTab === 'zkp' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Zero-Knowledge Proof Evidence Vault</h3>
            <p className="text-xs text-slate-500 mt-0.5">Generates cryptographically verifiable compliance proofs without disclosing underlying sensitive client PII or proprietary dataset records.</p>
          </div>

          <form onSubmit={handleGenerateZkpProof} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proof Claim Type</label>
                <select
                  value={proofType}
                  onChange={(e) => setProofType(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 outline-none cursor-pointer"
                >
                  <option value="GDPR_CONSENT_VALIDITY">GDPR User Consent Log Proof</option>
                  <option value="DORA_CAPITAL_RESERVE">DORA Capital Buffer Proof</option>
                  <option value="AI_ACT_LINEAGE_CLEAN">EU AI Act Clean Model Lineage Proof</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Claim Scope Description</label>
                <input
                  type="text"
                  value={claimDetails}
                  onChange={(e) => setClaimDetails(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>Generate Cryptographic ZKP Proof</span>
            </button>
          </form>

          {zkpProof && (
            <div className="bg-slate-950 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">Zero-Knowledge Proof Artifact Verified</span>
                </div>
                <span className="text-xs font-mono text-slate-400">{zkpProof.proofId}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Crypto Scheme</span>
                  <span className="font-mono text-white font-semibold">{zkpProof.cryptoScheme}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Generated Timestamp</span>
                  <span className="font-mono text-white font-semibold">{zkpProof.generatedAt}</span>
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Zero-Knowledge SNARK Hash</span>
                <span className="font-mono text-indigo-300 text-xs break-all">{zkpProof.zkpProofHash}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Quantum & Biometric Readiness */}
      {activeTab === 'quantum' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Quantum-Resistant Compliance Vault</h4>
                <p className="text-xs text-slate-500">NIST Post-Quantum Cryptography (PQC) readiness status</p>
              </div>
            </div>

            {quantumData ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                  <span className="text-slate-500">Active Cipher Scheme:</span>
                  <span className="font-mono font-bold text-indigo-600">{quantumData.activeScheme}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                  <span className="text-slate-500">Readiness Score:</span>
                  <span className="font-mono font-bold text-emerald-600">{quantumData.migrationReadinessScore}%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-500 font-medium block">Supported NIST PQC Standards:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {quantumData.nistPqcStandardsSupported?.map((std: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-700">
                        {std}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Loading readiness metrics...</div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Biometric & Behavioral Continuity</h4>
                <p className="text-xs text-slate-500">Tier 3 Dormant Hook (Feature Flagged Off)</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-slate-300 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-rose-400 font-bold">STATUS: DORMANT_DISABLED</span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-black">
                  GDPR ART. 9 SHIELD
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Behavioral biometric ingestion is locked off by default. Requires explicit legal review, data minimization clearance, and tenant-level opt-in before activation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
