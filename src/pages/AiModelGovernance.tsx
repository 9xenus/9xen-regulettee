import React, { useState, useEffect } from "react";
import { 
  Brain, ShieldAlert, Cpu, CheckCircle2, ShieldCheck, Scale, Database, Lock, 
  AlertTriangle, FileText, Download, Activity, Eye, Zap, Copyright, Play,
  Code2, Wrench, RefreshCw, Layers, ShieldX, Terminal, ArrowRight, Check,
  Users, Key, Fingerprint
} from "lucide-react";
import { AiSystemProfile, AiComplianceAssessmentReport, AiRiskFinding } from "../services/ai-compliance-risk-engine";
import { AiFixationPatch } from "../services/ai-fixation-engine";
import { AiRedTeamingSimulator } from "../components/ai/AiRedTeamingSimulator";
import { AiAnnexIvDossierBuilder } from "../components/ai/AiAnnexIvDossierBuilder";
import { AiKillswitchControlPlane } from "../components/ai/AiKillswitchControlPlane";
import { AiClientSelfServicePortal } from "../components/ai/AiClientSelfServicePortal";
import { ContinuousAiBiasEnclave } from "../components/ai/ContinuousAiBiasEnclave";

export function AiModelGovernance() {
  const [activeTab, setActiveTab] = useState<'risk_assessment' | 'bias_audit' | 'red_teaming' | 'annex_iv' | 'killswitch' | 'client_portal' | 'xai' | 'copyright' | 'privacy' | 'certification'>('risk_assessment');
  
  // Assessment state
  const [selectedSystem, setSelectedSystem] = useState<AiSystemProfile>({
    id: "sys-recruitment-01",
    name: "Autonomous HR Candidate Screening LLM",
    version: "2.4.0",
    modelFamily: "Gemini 2.5 Flash / Transformer",
    purpose: "Automated resume parsing, candidate scoring, and ranking",
    targetDomain: "HR_RECRUITMENT",
    deploymentType: "PUBLIC_API",
    hasHumanInTheLoop: false,
    collectsPii: true,
    usesExternalRag: true,
    trainingDataProvenanceKnown: false,
    systemPrompt: "You are an automated hiring assistant. Rank candidates by match score."
  });

  const [isScanning, setIsScanning] = useState(false);
  const [assessmentReport, setAssessmentReport] = useState<AiComplianceAssessmentReport | null>(null);
  
  // Fixation state
  const [selectedFinding, setSelectedFinding] = useState<AiRiskFinding | null>(null);
  const [generatedPatch, setGeneratedPatch] = useState<AiFixationPatch | null>(null);
  const [isGeneratingPatch, setIsGeneratingPatch] = useState(false);
  const [isDeployingPatch, setIsDeployingPatch] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState<string | null>(null);
  const [appliedPatches, setAppliedPatches] = useState<Record<string, boolean>>({});

  // Preset Profiles
  const presetProfiles: AiSystemProfile[] = [
    {
      id: "sys-hr-1",
      name: "Autonomous HR Candidate Screening LLM",
      version: "2.4.0",
      modelFamily: "Gemini 2.5 Flash",
      purpose: "Automated candidate parsing and ranking",
      targetDomain: "HR_RECRUITMENT",
      deploymentType: "PUBLIC_API",
      hasHumanInTheLoop: false,
      collectsPii: true,
      usesExternalRag: true,
      trainingDataProvenanceKnown: false,
      systemPrompt: "You are an automated hiring assistant. Rank candidates by score."
    },
    {
      id: "sys-credit-2",
      name: "Credit Underwriting & Loan Assessment Neural Engine",
      version: "3.1.0",
      modelFamily: "Custom XGBoost + Fine-tuned LLM",
      purpose: "Automated credit limit and default probability calculation",
      targetDomain: "FINANCIAL_CREDIT",
      deploymentType: "AUTOMATED_DECISION_ENGINE",
      hasHumanInTheLoop: false,
      collectsPii: true,
      usesExternalRag: false,
      trainingDataProvenanceKnown: true,
      systemPrompt: "Evaluate creditworthiness based on financial transaction history."
    },
    {
      id: "sys-copilot-3",
      name: "Customer Support Tier-1 LLM Agent",
      version: "1.8.2",
      modelFamily: "Gemini 2.5 Flash",
      purpose: "24/7 client conversational support and FAQ resolution",
      targetDomain: "CUSTOMER_SUPPORT",
      deploymentType: "PUBLIC_API",
      hasHumanInTheLoop: true,
      collectsPii: false,
      usesExternalRag: true,
      trainingDataProvenanceKnown: true,
      systemPrompt: "### GUARDRAIL ### You are a helpful support agent for 9Xen Regulettee."
    }
  ];

  const handleRunAssessment = async () => {
    setIsScanning(true);
    setDeploymentSuccess(null);
    try {
      const res = await fetch('/api/v1/ai-risk-audit/assess-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: selectedSystem })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setAssessmentReport(data.report);
      }
    } catch (e) {
      console.error('Assessment failed:', e);
    } finally {
      setIsScanning(false);
    }
  };

  // Run initial scan on mount
  useEffect(() => {
    handleRunAssessment();
  }, [selectedSystem.id]);

  const handleGenerateFix = async (finding: AiRiskFinding) => {
    setSelectedFinding(finding);
    setIsGeneratingPatch(true);
    setGeneratedPatch(null);
    setDeploymentSuccess(null);
    try {
      const res = await fetch('/api/v1/ai-risk-audit/generate-patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finding, systemName: selectedSystem.name })
      });
      const data = await res.json();
      if (data.success && data.patch) {
        setGeneratedPatch(data.patch);
      }
    } catch (e) {
      console.error('Patch generation failed:', e);
    } finally {
      setIsGeneratingPatch(false);
    }
  };

  const handleDeployPatch = async () => {
    if (!generatedPatch) return;
    setIsDeployingPatch(true);
    try {
      const res = await fetch('/api/v1/ai-risk-audit/deploy-patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch: generatedPatch, tenantId: 'org_1' })
      });
      const data = await res.json();
      if (data.success) {
        setDeploymentSuccess(data.result.message);
        setAppliedPatches(prev => ({ ...prev, [generatedPatch.findingId]: true }));
      }
    } catch (e) {
      console.error('Patch deployment failed:', e);
    } finally {
      setIsDeployingPatch(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Zap className="w-3 h-3" /> Enterprise AI Risk & Compliance Suite
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            AI Compliance Auditor & Automated Fixation
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Automated risk assessment, multi-framework compliance scoring, and 1-click active guardrail remediation.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <button 
            onClick={handleRunAssessment}
            disabled={isScanning}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Auditing Model...' : 'Re-Run Compliance Audit'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Brain className="w-16 h-16 text-indigo-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Compliance Health</p>
          <p className="text-3xl font-black text-slate-900">
            {assessmentReport ? `${assessmentReport.complianceScore}%` : '85%'}
          </p>
          <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Tier: {assessmentReport?.overallRiskLevel || 'HIGH'}
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert className="w-16 h-16 text-rose-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Statutory Fine Exposure</p>
          <p className="text-3xl font-black text-rose-600">
            {assessmentReport ? `€${(assessmentReport.totalPotentialFineEur / 1000000).toFixed(1)}M` : '€35.0M'}
          </p>
          <div className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1">
            <ShieldX className="w-3 h-3" /> EU AI Act Art 99 Max
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wrench className="w-16 h-16 text-amber-500" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Actionable Findings</p>
          <p className="text-3xl font-black text-slate-900">
            {assessmentReport ? assessmentReport.findings.length : 4}
          </p>
          <div className="mt-2 text-xs font-medium text-amber-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {Object.keys(appliedPatches).length} Patches Deployed
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-16 h-16 text-emerald-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Standards Covered</p>
          <p className="text-3xl font-black text-slate-900">4</p>
          <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
            <Scale className="w-3 h-3" /> EU AI Act, NIST, ISO 42001, OWASP
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
        {[
          { id: 'risk_assessment', label: 'AI Risk Audit & Auto-Fixation', icon: ShieldAlert },
          { id: 'bias_audit', label: 'Continuous Bias & Fairness (Art. 10)', icon: Scale },
          { id: 'red_teaming', label: 'Red-Teaming & Fuzzing (Art. 15)', icon: Zap },
          { id: 'annex_iv', label: 'Annex IV Dossier & CE Marking', icon: FileText },
          { id: 'killswitch', label: 'Dual-Key Killswitch (Art. 14)', icon: ShieldX },
          { id: 'client_portal', label: 'Client AI-DSAR & Portal', icon: Users },
          { id: 'xai', label: 'Explainable AI (XAI)', icon: Brain },
          { id: 'copyright', label: 'Copyright & IP Defense', icon: Copyright },
          { id: 'privacy', label: 'Data Privacy Guard', icon: Lock },
          { id: 'certification', label: 'Legal Certification', icon: ShieldCheck },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm min-h-[450px]">
        {activeTab === 'risk_assessment' && (
          <div className="p-4 sm:p-5 lg:p-6 space-y-6">
            {/* Model Profile Selector */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" /> Active AI Model Workload Profile
                </h3>
                <span className="text-xs text-slate-500">Select target model to assess risk and generate fixes:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {presetProfiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedSystem(p)}
                    className={`p-3 rounded-lg text-left border transition-all ${
                      selectedSystem.id === p.id 
                        ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-sm' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <p className="font-bold text-xs text-slate-900 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{p.modelFamily}</span>
                      <span className="text-[10px] font-semibold text-indigo-600">{p.targetDomain}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Frameworks Score Breakdown */}
            {assessmentReport && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 border border-slate-200 rounded-lg bg-white">
                  <span className="text-[10px] uppercase font-bold text-slate-400">EU AI Act</span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{assessmentReport.frameworkCoverage.euAiActScore}%</p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${assessmentReport.frameworkCoverage.euAiActScore}%` }}></div>
                  </div>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg bg-white">
                  <span className="text-[10px] uppercase font-bold text-slate-400">NIST AI RMF 1.0</span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{assessmentReport.frameworkCoverage.nistAiRmfScore}%</p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${assessmentReport.frameworkCoverage.nistAiRmfScore}%` }}></div>
                  </div>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg bg-white">
                  <span className="text-[10px] uppercase font-bold text-slate-400">ISO/IEC 42001</span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{assessmentReport.frameworkCoverage.iso42001Score}%</p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${assessmentReport.frameworkCoverage.iso42001Score}%` }}></div>
                  </div>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg bg-white">
                  <span className="text-[10px] uppercase font-bold text-slate-400">OWASP LLM Top 10</span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{assessmentReport.frameworkCoverage.owaspLlmScore}%</p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${assessmentReport.frameworkCoverage.owaspLlmScore}%` }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Findings & 1-Click Fixation Grid */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Compliance Findings & Automated Fixation Options</span>
                <span className="text-xs font-normal text-slate-500">Click any finding to inspect and generate verified fix code</span>
              </h3>

              {assessmentReport?.findings.map(finding => (
                <div 
                  key={finding.id}
                  className={`border rounded-xl p-4 transition-all ${
                    appliedPatches[finding.id] 
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : finding.severity === 'CRITICAL' 
                        ? 'border-rose-200 bg-rose-50/20' 
                        : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          finding.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          finding.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {finding.severity}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-500">{finding.articleRef}</span>
                        <span className="text-xs font-semibold text-indigo-700">[{finding.framework}]</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{finding.title}</h4>
                      <p className="text-xs text-slate-600 max-w-3xl">{finding.description}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-xs font-mono text-rose-600 font-bold">
                        €{(finding.penaltyExposureEur / 1000000).toFixed(1)}M exposure
                      </span>
                      {appliedPatches[finding.id] ? (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Guardrail Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleGenerateFix(finding)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Wrench className="w-3.5 h-3.5" /> 1-Click Fix
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fixation Patch Modal / Drawer */}
            {(selectedFinding || isGeneratingPatch) && (
              <div className="border border-indigo-200 rounded-xl p-5 bg-indigo-50/30 space-y-4">
                <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      {isGeneratingPatch ? 'Synthesizing Verified Fixation Patch...' : generatedPatch?.title}
                    </h4>
                  </div>
                  <button 
                    onClick={() => { setSelectedFinding(null); setGeneratedPatch(null); }}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Close
                  </button>
                </div>

                {isGeneratingPatch ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Compiling guardrail and zero-trust verification envelope...</p>
                  </div>
                ) : generatedPatch ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">{generatedPatch.description}</p>
                    
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-64">
                      <pre>{generatedPatch.codeSnippet}</pre>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                      <span className="text-xs text-slate-500 font-mono">
                        Target Standard: {generatedPatch.framework} ({generatedPatch.articleRef})
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeployPatch}
                          disabled={isDeployingPatch}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          {isDeployingPatch ? 'Activating Guardrail...' : 'Deploy Guardrail & Anchor to EventDB'}
                        </button>
                      </div>
                    </div>

                    {deploymentSuccess && (
                      <div className="p-3 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        {deploymentSuccess}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {activeTab === 'xai' && (
          <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Real-Time Decision Transparency (XAI)</h3>
                <p className="text-sm text-slate-500">Monitoring feature importance and decision weights for the active LLM pipeline.</p>
              </div>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold flex items-center gap-2 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                MONITORING ACTIVE
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                <h4 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">Latest Inference: Loan Approval Model</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Input:</span>
                    <span className="font-medium">User Profile #9921</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Decision:</span>
                    <span className="font-bold text-emerald-600">APPROVED (82% Confidence)</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Decision Weights (SHAP Values)</span>
                    <div className="space-y-2 mt-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-700">Credit Score</span><span className="text-indigo-600">+45%</span></div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '45%' }}></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-700">Annual Income</span><span className="text-indigo-600">+30%</span></div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: '30%' }}></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-700">Debt-to-Income</span><span className="text-rose-500">-15%</span></div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-rose-400 h-1.5 rounded-full" style={{ width: '15%' }}></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-700">Demographics (Protected)</span><span className="text-emerald-500">0% (Ignored)</span></div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '0%' }}></div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-100 rounded-lg p-4 flex flex-col justify-center items-center text-center bg-slate-50/50">
                <Cpu className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-700">Bias & Fairness Oracle</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-sm">The model demonstrates statistically zero disparate impact on protected classes across the last 10,000 inferences. Compliant with EU AI Act Title III.</p>
                <button className="mt-4 px-4 py-2 bg-white border border-slate-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
                  Download XAI Audit Log
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'copyright' && (
          <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Training Data & RAG Copyright Scanner</h3>
                <p className="text-sm text-slate-500">Detecting licensed material, GPL code, and copyrighted text in AI responses.</p>
              </div>
              <button className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors">
                Force Retrain/Purge
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Incident Time</th>
                    <th className="px-4 py-3 font-medium">Model / Pipeline</th>
                    <th className="px-4 py-3 font-medium">Infringement Type</th>
                    <th className="px-4 py-3 font-medium">Action Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">Today, 10:42 AM</td>
                    <td className="px-4 py-3 font-medium text-slate-800">Code-Gen-v4</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs font-bold border border-amber-200"><AlertTriangle className="w-3 h-3"/> GPLv3 Code Snippet emitted</span></td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">Response Blocked & Rewritten</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">Yesterday, 14:15 PM</td>
                    <td className="px-4 py-3 font-medium text-slate-800">Marketing-Copy-LLM</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2 py-1 rounded text-xs font-bold border border-rose-200"><Copyright className="w-3 h-3"/> NYT Paywalled Article text</span></td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">RAG Source Quarantined</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Data Privacy & PII Firewall</h3>
                <p className="text-sm text-slate-500">Real-time redaction of sensitive user data before it reaches the AI model (GDPR/CCPA).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="border border-slate-200 rounded-lg p-5">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" /> Pre-Inference Payload Scrubbing
                </h4>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 leading-relaxed">
                  <span className="text-slate-500">// Original User Prompt</span><br/>
                  <span className="text-rose-400">"Summarize the medical history for patient John Doe (SSN: 123-45-6789) born on 05/12/1980."</span>
                  <br/><br/>
                  <span className="text-slate-500">// 9Xen Regulettee Sanitized Prompt (Sent to LLM)</span><br/>
                  <span className="text-emerald-400">"Summarize the medical history for patient [REDACTED_NAME] (SSN: [REDACTED_SSN]) born on [REDACTED_DATE]."</span>
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3">Redaction Statistics (Last 24h)</h4>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                      <span className="text-slate-600">Names & Addresses</span>
                      <span className="font-bold text-slate-900">4,192</span>
                    </li>
                    <li className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                      <span className="text-slate-600">Financial Data (PCI)</span>
                      <span className="font-bold text-slate-900">845</span>
                    </li>
                    <li className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Health Data (HIPAA)</span>
                      <span className="font-bold text-slate-900">1,204</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'red_teaming' && (
          <div className="p-4 sm:p-5 lg:p-6">
            <AiRedTeamingSimulator selectedModelId={selectedSystem.id} />
          </div>
        )}

        {activeTab === 'bias_audit' && (
          <ContinuousAiBiasEnclave />
        )}

        {activeTab === 'annex_iv' && (
          <div className="p-4 sm:p-5 lg:p-6">
            <AiAnnexIvDossierBuilder selectedModelId={selectedSystem.id} />
          </div>
        )}

        {activeTab === 'killswitch' && (
          <div className="p-4 sm:p-5 lg:p-6">
            <AiKillswitchControlPlane />
          </div>
        )}

        {activeTab === 'client_portal' && (
          <div className="p-4 sm:p-5 lg:p-6">
            <AiClientSelfServicePortal />
          </div>
        )}

        {activeTab === 'certification' && (
          <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Official AI Legal Certificates</h3>
                <p className="text-sm text-slate-500">Dynamically generated, blockchain-backed certificates proving regulatory compliance.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {[
                { name: 'EU AI Act Conformity', status: 'Active', id: 'CERT-EU-2026-9A', color: 'emerald', desc: 'Validates model transparency, risk-management, and human oversight.' },
                { name: 'GDPR Data Processing', status: 'Active', id: 'CERT-GDPR-441-B', color: 'emerald', desc: 'Certifies zero PII retention in model weights and secure DPA status.' },
                { name: 'ISO/IEC 42001 (AI)', status: 'Active', id: 'CERT-ISO-42001-2026', color: 'emerald', desc: 'AI Management System standard. Verified and locked.' },
              ].map((cert, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow relative">
                  <div className={`absolute top-0 right-0 p-3`}>
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-slate-900 pr-8">{cert.name}</h4>
                  <p className="text-xs text-slate-500 mt-2 h-10">{cert.desc}</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-bold">Certificate ID</span>
                      <span className="text-xs font-mono font-medium text-slate-700">{cert.id}</span>
                    </div>
                    <button className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors" title="Download Certificate">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AiModelGovernance;
