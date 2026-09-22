import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Scale,
  BrainCircuit,
  Sliders,
  Database,
  FileCode,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Terminal,
  RefreshCw,
  Search,
  ExternalLink,
  Info,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

import { MultiRegionPolicyEngine } from './MultiRegionPolicyEngine';

interface Framework {
  id: string;
  code: string;
  name: string;
  jurisdiction: string;
  description: string;
  riskCategories: string[];
  primaryArticles: Array<{
    article: string;
    title: string;
    summary: string;
    mandatoryControls: string[];
  }>;
}

interface ClassificationResult {
  modelName: string;
  riskTier: 'UNACCEPTABLE_RISK' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK';
  riskScore: number;
  articleReference: string;
  legalJustification: string;
  mandatorySafeguards: string[];
  crossRegulatoryImpacts: Array<{
    framework: string;
    clause: string;
    impactDescription: string;
  }>;
  requiredActions: string[];
}

interface RegisteredAiModel {
  id: string;
  modelName: string;
  modelVersion: string;
  purposeDescription: string;
  deploymentDomain: string;
  riskTier: string;
  articleReference: string;
  complianceScore: number;
  status: string;
  createdAt: string;
}

interface RegulatoryPolicyEngineProps {
  activeRole?: string;
}

export const RegulatoryPolicyEngine: React.FC<RegulatoryPolicyEngineProps> = ({ activeRole }) => {
  const { user } = useAuth();
  const resolvedRole = (activeRole || user?.user_metadata?.role || user?.user_metadata?.accountType || 'CLIENT').toUpperCase();
  const isAdmin = resolvedRole === 'ADMIN' || resolvedRole === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'matrix' | 'multi_region_rag' | 'risk_wizard' | 'rule_simulator' | 'cloud_db'>('matrix');

  // Sync tab state safety fallback
  useEffect(() => {
    if (activeTab === 'cloud_db' && !isAdmin) {
      setActiveTab('matrix');
    }
  }, [activeTab, isAdmin]);

  // Framework State
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [frameworkSearch, setFrameworkSearch] = useState('');
  const [loadingFrameworks, setLoadingFrameworks] = useState(false);

  // AI Risk Wizard State
  const [modelName, setModelName] = useState('CreditEval-LLM-v2');
  const [purposeDescription, setPurposeDescription] = useState('Automated credit risk assessment and loan limit approval system for retail banking customers.');
  const [deploymentDomain, setDeploymentDomain] = useState<'FINANCE' | 'HEALTHCARE' | 'HR_RECRUITMENT' | 'BIOMETRICS' | 'CRITICAL_INFRASTRUCTURE' | 'CUSTOMER_SERVICE' | 'GENERAL_UTILITY'>('FINANCE');
  const [usesBiometrics, setUsesBiometrics] = useState(false);
  const [usesSocialScoring, setUsesSocialScoring] = useState(false);
  const [autonomousDecisionMaking, setAutonomousDecisionMaking] = useState(true);
  const [targetsVulnerableGroups, setTargetsVulnerableGroups] = useState(false);
  const [generatesSyntheticMedia, setGeneratesSyntheticMedia] = useState(false);

  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [evaluatingRisk, setEvaluatingRisk] = useState(false);
  const [registeredModels, setRegisteredModels] = useState<RegisteredAiModel[]>([]);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Rule Engine Simulator State
  const [simulatorCode, setSimulatorCode] = useState(`// Automated Credit Scoring Endpoint
function calculateCreditRisk(applicant) {
  // EU AI Act Annex III(5)(b) High-Risk Credit System
  const score = model.predict(applicant.financialData);
  if (applicant.socialScoring) {
    // Article 5 Violation: Prohibited Social Credit Score
    score -= applicant.socialScoring * 10;
  }
  return score;
}`);
  const [selectedScanLaws, setSelectedScanLaws] = useState<string[]>(['EU_AI_ACT', 'GDPR', 'NIS2', 'DORA']);
  const [simulatedViolations, setSimulatedViolations] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // DB Configuration State
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Fetch Frameworks on Mount
  useEffect(() => {
    fetchFrameworks();
    fetchAiModels();
    fetchDbStatus();
  }, []);

  const fetchFrameworks = async () => {
    setLoadingFrameworks(true);
    try {
      const res = await fetch('/api/v1/policy-engine/frameworks');
      const data = await res.json();
      if (data.success && data.frameworks) {
        setFrameworks(data.frameworks);
        if (data.frameworks.length > 0) {
          setSelectedFramework(data.frameworks[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load frameworks:', err);
    } finally {
      setLoadingFrameworks(false);
    }
  };

  const fetchAiModels = async () => {
    try {
      const res = await fetch('/api/v1/policy-engine/ai-models');
      const data = await res.json();
      if (data.success && data.models) {
        setRegisteredModels(data.models);
      }
    } catch (err) {
      console.error('Failed to load registered models:', err);
    }
  };

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/v1/policy-engine/cloud-db-status');
      const data = await res.json();
      if (data.success) {
        setDbStatus(data.dbConfig);
      }
    } catch (err) {
      console.error('Failed to load DB status:', err);
    }
  };

  const handleCategorizeRisk = async () => {
    setEvaluatingRisk(true);
    setRegisterSuccess(false);
    try {
      const res = await fetch('/api/v1/policy-engine/categorize-ai-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName,
          purposeDescription,
          deploymentDomain,
          usesBiometrics,
          usesSocialScoring,
          autonomousDecisionMaking,
          targetsVulnerableGroups,
          generatesSyntheticMedia
        })
      });
      const data = await res.json();
      if (data.success) {
        setClassification(data.classification);
      }
    } catch (err) {
      console.error('Error categorizing risk:', err);
    } finally {
      setEvaluatingRisk(false);
    }
  };

  const handleRegisterAiModel = async () => {
    if (!classification) return;
    try {
      const res = await fetch('/api/v1/policy-engine/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName,
          purposeDescription,
          deploymentDomain,
          usesBiometrics,
          usesSocialScoring,
          autonomousDecisionMaking,
          targetsVulnerableGroups,
          generatesSyntheticMedia
        })
      });
      const data = await res.json();
      if (data.success) {
        setRegisterSuccess(true);
        fetchAiModels();
      }
    } catch (err) {
      console.error('Error registering AI model:', err);
    }
  };

  const handleRunSimulatorScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const violations = [];
      if (simulatorCode.includes('socialScoring') || simulatorCode.includes('social_scoring')) {
        violations.push({
          id: 'VIOL-ART5-01',
          rule: 'Prohibited Practice: Social Scoring',
          article: 'EU AI Act Article 5(1)(c)',
          severity: 'CRITICAL',
          issue: 'System attempts to manipulate credit or risk scores using prohibited social credit parameters.',
          fix: '// Fix: Deprecate social credit calculation logic immediately.',
          autoFixable: false
        });
      }
      if (simulatorCode.includes('calculateCreditRisk') && !simulatorCode.includes('mitigateBias')) {
        violations.push({
          id: 'VIOL-ANNEX3-02',
          rule: 'High-Risk AI System Missing Bias Safeguards',
          article: 'EU AI Act Annex III(5)(b)',
          severity: 'HIGH',
          issue: 'High-risk credit scoring function lacks active demographic parity / algorithmic bias monitoring.',
          fix: 'const biasCheck = performDemographicParityCheck(applicant);',
          autoFixable: true
        });
      }
      if (!simulatorCode.includes('optOut') && selectedScanLaws.includes('GDPR')) {
        violations.push({
          id: 'VIOL-GDPR-22',
          rule: 'Automated Individual Decision-Making Consent Deficit',
          article: 'GDPR Article 22',
          severity: 'HIGH',
          issue: 'Solely automated processing outcome lacks explicit human override or opt-out mechanism.',
          fix: 'if (applicant.requestsHumanReview) return routeToHumanAuditor(applicant);',
          autoFixable: true
        });
      }

      setSimulatedViolations(violations);
      setIsScanning(false);
    }, 600);
  };

  const handleDownloadCloudSql = () => {
    window.open('/api/v1/policy-engine/export-cloud-sql', '_blank');
  };

  const filteredFrameworks = frameworks.filter(fw =>
    fw.name.toLowerCase().includes(frameworkSearch.toLowerCase()) ||
    fw.code.toLowerCase().includes(frameworkSearch.toLowerCase()) ||
    fw.description.toLowerCase().includes(frameworkSearch.toLowerCase())
  );

  const getRiskBadgeColor = (tier: string) => {
    switch (tier) {
      case 'UNACCEPTABLE_RISK':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH_RISK':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LIMITED_RISK':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'MINIMAL_RISK':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Regulatory Mapping & Policy Engine
                </h1>
                <p className="text-xs text-slate-500">
                  Legal Framework, AI Risk Categorization, and Rule Engine Configuration
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Cross-map global regulations (EU AI Act, GDPR, NIS2, DORA, ePrivacy, SOC2) and automatically classify AI systems into risk tiers with full cloud database portability.
            </p>
          </div>

          {isAdmin && (
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button
                onClick={handleDownloadCloudSql}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Cloud SQL Schema (.sql)</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mt-6 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'matrix'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Multi-Regulation Mapping</span>
          </button>

          <button
            onClick={() => setActiveTab('multi_region_rag')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'multi_region_rag'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>2. Multi-Region Policy Sync & RAG Store</span>
          </button>

          <button
            onClick={() => setActiveTab('risk_wizard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'risk_wizard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>2. AI Risk Categorization</span>
          </button>

          <button
            onClick={() => setActiveTab('rule_simulator')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'rule_simulator'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>3. Rule Engine Simulator</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('cloud_db')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'cloud_db'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>4. Cloud DB & API Status</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        {/* TAB MULTI REGION RAG */}
        {activeTab === 'multi_region_rag' && (
          <MultiRegionPolicyEngine activeRole={resolvedRole} />
        )}

        {/* TAB 1: MULTI-REGULATION MAPPING MATRIX */}
        {activeTab === 'matrix' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Framework List Sidebar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  <span>Integrated Frameworks</span>
                </h3>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded-md font-mono text-slate-600">
                  {frameworks.length} Laws
                </span>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search EU AI Act, GDPR, DORA..."
                  value={frameworkSearch}
                  onChange={(e) => setFrameworkSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredFrameworks.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setSelectedFramework(fw)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all border ${
                      selectedFramework?.id === fw.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono">{fw.code}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          selectedFramework?.id === fw.id
                            ? 'bg-slate-800 text-slate-200'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {fw.jurisdiction}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 font-semibold truncate ${selectedFramework?.id === fw.id ? 'text-slate-100' : 'text-slate-900'}`}>
                      {fw.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Framework Article Inspector */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              {selectedFramework ? (
                <div>
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-mono font-bold">
                          {selectedFramework.code}
                        </span>
                        <h2 className="text-lg font-bold text-slate-900">{selectedFramework.name}</h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{selectedFramework.description}</p>
                    </div>
                    <span className="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                      Jurisdiction: {selectedFramework.jurisdiction}
                    </span>
                  </div>

                  {/* Primary Articles Matrix */}
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Primary Articles & Mandatory Controls
                  </h4>

                  <div className="space-y-4">
                    {selectedFramework.primaryArticles.map((art, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold font-mono text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                            {art.article}: {art.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-3">{art.summary}</p>

                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Mandatory System Controls:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {art.mandatoryControls.map((ctrl, cIdx) => (
                              <span key={cIdx} className="text-[11px] font-medium bg-white text-slate-800 px-2.5 py-1 rounded-md border border-slate-200 flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>{ctrl}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Select a framework from the sidebar to inspect article mappings.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AI RISK CATEGORIZATION WIZARD */}
        {activeTab === 'risk_wizard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Input Specs */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <BrainCircuit className="w-4 h-4 text-slate-700" />
                <span>AI System Parameter Configurator</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">AI Model Name</label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purpose & Use Case Description</label>
                  <textarea
                    rows={2}
                    value={purposeDescription}
                    onChange={(e) => setPurposeDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deployment Domain (EU AI Act Annex III)</label>
                  <select
                    value={deploymentDomain}
                    onChange={(e: any) => setDeploymentDomain(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  >
                    <option value="FINANCE">Finance & Banking (Credit Scoring / Risk Triage)</option>
                    <option value="HEALTHCARE">Healthcare & Triage Emergency</option>
                    <option value="HR_RECRUITMENT">HR, Recruiting & Worker Evaluation</option>
                    <option value="BIOMETRICS">Biometrics & Facial Identification</option>
                    <option value="CRITICAL_INFRASTRUCTURE">Critical Infrastructure Management</option>
                    <option value="CUSTOMER_SERVICE">Customer Service Chatbot / Support</option>
                    <option value="GENERAL_UTILITY">General Utility / Internal Analytics</option>
                  </select>
                </div>

                {/* Toggles */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
                    Model Risk Factors
                  </span>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/80">
                    <div>
                      <span className="font-semibold text-slate-800 block">Social Scoring Logic</span>
                      <span className="text-[11px] text-slate-500">Evaluates personal/social traits over time</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={usesSocialScoring}
                      onChange={(e) => setUsesSocialScoring(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/80">
                    <div>
                      <span className="font-semibold text-slate-800 block">Biometric Capture</span>
                      <span className="text-[11px] text-slate-500">Real-time or post-event facial / fingerprint analysis</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={usesBiometrics}
                      onChange={(e) => setUsesBiometrics(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/80">
                    <div>
                      <span className="font-semibold text-slate-800 block">Autonomous Decision Making</span>
                      <span className="text-[11px] text-slate-500">Legal/financial outcome without human sign-off</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autonomousDecisionMaking}
                      onChange={(e) => setAutonomousDecisionMaking(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/80">
                    <div>
                      <span className="font-semibold text-slate-800 block">Synthetic Media Generation</span>
                      <span className="text-[11px] text-slate-500">Generates deepfake audio, video, or synthetic text</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={generatesSyntheticMedia}
                      onChange={(e) => setGeneratesSyntheticMedia(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                    />
                  </label>
                </div>

                <button
                  onClick={handleCategorizeRisk}
                  disabled={evaluatingRisk}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs mt-4"
                >
                  {evaluatingRisk ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Categorize AI Risk Tier</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Categorization Result & Register */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <Scale className="w-4 h-4 text-slate-700" />
                <span>EU AI Act Risk Evaluation Result</span>
              </h3>

              {classification ? (
                <div className="space-y-4">
                  {/* Risk Tier Card */}
                  <div className={`p-4 rounded-xl border ${getRiskBadgeColor(classification.riskTier)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                          Assessed Risk Category
                        </span>
                        <h4 className="text-lg font-black">{classification.riskTier.replace('_', ' ')}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold">{classification.riskScore}</span>
                        <span className="text-[10px] block opacity-80">Compliance Score</span>
                      </div>
                    </div>
                    <p className="text-xs font-mono font-medium mt-2 pt-2 border-t border-current/20">
                      Ref: {classification.articleReference}
                    </p>
                  </div>

                  {/* Justification */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900 block mb-1">Legal Justification:</span>
                    <p className="text-slate-600">{classification.legalJustification}</p>
                  </div>

                  {/* Mandatory Safeguards */}
                  <div>
                    <span className="text-xs font-bold text-slate-900 block mb-2">Mandatory Compliance Safeguards:</span>
                    <ul className="space-y-1.5 text-xs">
                      {classification.mandatorySafeguards.map((sg, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-slate-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{sg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cross-Regulatory Impact */}
                  {classification.crossRegulatoryImpacts.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-slate-900 block mb-2">Cross-Regulatory Impacts:</span>
                      <div className="space-y-2">
                        {classification.crossRegulatoryImpacts.map((cri, idx) => (
                          <div key={idx} className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
                            <span className="font-bold text-amber-900">[{cri.framework} {cri.clause}]</span>{' '}
                            <span className="text-amber-800">{cri.impactDescription}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center space-x-3">
                    <button
                      onClick={handleRegisterAiModel}
                      className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Register AI Model in DB</span>
                    </button>
                  </div>

                  {registerSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>AI Model successfully registered in the database!</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Configure model parameters on the left and click "Categorize AI Risk Tier".
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RULE ENGINE SIMULATOR */}
        {activeTab === 'rule_simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Code / Policy Input */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-slate-700" />
                  <span>Rule Engine Code & Payload Input</span>
                </h3>
                <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 font-mono">
                  AST / Rego Policy Scanner
                </span>
              </div>

              {/* Active Laws Selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-2">Active Regulations to Enforce:</label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['EU_AI_ACT', 'GDPR', 'NIS2', 'DORA', 'EPRIVACY', 'SOC2'].map((law) => {
                    const isSelected = selectedScanLaws.includes(law);
                    return (
                      <button
                        key={law}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedScanLaws(selectedScanLaws.filter((l) => l !== law));
                          } else {
                            setSelectedScanLaws([...selectedScanLaws, law]);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg font-mono font-bold text-[11px] transition-all border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {law}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Area Code Editor */}
              <div className="relative mb-4">
                <textarea
                  rows={10}
                  value={simulatorCode}
                  onChange={(e) => setSimulatorCode(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700 leading-relaxed"
                />
              </div>

              <button
                onClick={handleRunSimulatorScan}
                disabled={isScanning}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                {isScanning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Run Policy Engine Evaluation</span>
                  </>
                )}
              </button>
            </div>

            {/* Scan Output Violations */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <AlertTriangle className="w-4 h-4 text-slate-700" />
                <span>Detected Violations & Patch Suggestions</span>
              </h3>

              {simulatedViolations.length > 0 ? (
                <div className="space-y-4">
                  {simulatedViolations.map((v, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900">{v.rule}</span>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            v.severity === 'CRITICAL'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {v.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{v.issue}</p>

                      <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto">
                        <span className="text-slate-400 block text-[10px] uppercase mb-1">Fix Suggestion:</span>
                        <code>{v.fix}</code>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {isScanning ? 'Evaluating rules...' : 'Click "Run Policy Engine Evaluation" to test the code payload.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CLOUD DB & API STATUS */}
        {activeTab === 'cloud_db' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Database Architecture Panel */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Database className="w-4 h-4 text-slate-700" />
                  <span>Database Abstraction Layer</span>
                </h3>
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-bold">
                  Cloud Ready
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700">Active DB Provider:</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {dbStatus?.provider || 'SQLite (Local)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700">Cloud Region:</span>
                    <span className="font-mono text-slate-600">{dbStatus?.region || 'EU-CENTRAL-1'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Cloud SQL Driver Switch:</span>
                    <span className="text-emerald-600 font-bold">Enabled via DB_PROVIDER env</span>
                  </div>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed">
                  The Regulatory Policy Engine uses an abstracted database adapter (<code className="bg-slate-100 px-1 py-0.5 rounded">src/db/db-adapter.ts</code>).
                  By setting <code className="bg-slate-100 px-1 py-0.5 rounded">DB_PROVIDER=postgres_cloudsql</code> and providing <code className="bg-slate-100 px-1 py-0.5 rounded">DATABASE_URL</code>, the system seamlessly transitions from local SQLite to Google Cloud SQL (PostgreSQL) or Firestore.
                </p>

                <button
                  onClick={handleDownloadCloudSql}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Export PostgreSQL Cloud SQL Schema (.sql)</span>
                </button>
              </div>
            </div>

            {/* REST API Endpoints Specs */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <Terminal className="w-4 h-4 text-slate-700" />
                <span>Exposed Policy Engine REST APIs</span>
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-bold rounded">GET</span>
                    <span className="text-emerald-400 font-bold">/api/v1/policy-engine/frameworks</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">Returns regulatory frameworks matrix and primary articles.</p>
                </div>

                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded">POST</span>
                    <span className="text-blue-400 font-bold">/api/v1/policy-engine/categorize-ai-risk</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">Automated AI Risk Categorization under EU AI Act & GDPR.</p>
                </div>

                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded">POST</span>
                    <span className="text-purple-400 font-bold">/api/v1/policy-engine/ai-models</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">Registers AI model into DB with safeguards and risk tier.</p>
                </div>

                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded">GET</span>
                    <span className="text-amber-400 font-bold">/api/v1/policy-engine/export-cloud-sql</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">Downloads complete Cloud SQL migration script.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegulatoryPolicyEngine;
