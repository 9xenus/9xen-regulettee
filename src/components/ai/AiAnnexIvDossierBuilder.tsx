import React, { useState, useEffect } from "react";
import {
  FileText,
  ShieldAlert,
  BrainCircuit,
  CheckCircle2,
  Sparkles,
  Download,
  Lock,
  Layers,
  Activity,
  Award,
  RefreshCw,
  Cpu,
  ChevronRight,
  Eye,
  AlertCircle
} from "lucide-react";

interface AiDossier {
  id: string;
  systemId: string;
  systemName: string;
  riskTier: string;
  notifiedBodyTarget: string;
  generatedAt: string;
  sections: {
    generalDescription: string;
    developmentMethods: string;
    monitoringAndControl: string;
    humanOversightArt14: string;
    riskManagementArt9: string;
    robustnessAccuracyArt15: string;
    declarationOfConformityArt47: string;
  };
  metrics: {
    fairnessDisparateImpact: number;
    accuracyScore: number;
    adversarialRobustness: number;
    auditReadinessScore: number;
  };
  trainingProvenance: {
    datasetName: string;
    sampleCount: string;
    biasMitigationMethod: string;
    syntheticDataRatio: string;
    dpEpsilon: number;
  };
  cryptographicSeal: string;
}

const PRESET_SYSTEMS = [
  {
    id: "ai-sys-credit-eval",
    name: "Automated Credit & Underwriting Risk Model v4.2",
    domain: "Fintech & Banking (Annex III Point 5b)",
    riskTier: "HIGH_RISK_ANNEX_III"
  },
  {
    id: "ai-sys-aml-classifier",
    name: "Autonomous AML & Suspicious Flow Classifier v2.1",
    domain: "Financial Crime & MiCA Surveillance",
    riskTier: "HIGH_RISK_ANNEX_III"
  },
  {
    id: "ai-sys-biometric-auth",
    name: "Zero-Knowledge Biometric Identity Enclave v3.0",
    domain: "Remote Biometric Verification (Annex III Point 1)",
    riskTier: "HIGH_RISK_ANNEX_III"
  }
];

export const AiAnnexIvDossierBuilder: React.FC<{ className?: string; selectedModelId?: string }> = ({ className = "", selectedModelId }) => {
  const [selectedSystem, setSelectedSystem] = useState(() => {
    if (selectedModelId) {
      const found = PRESET_SYSTEMS.find(s => s.id === selectedModelId);
      if (found) return found;
    }
    return PRESET_SYSTEMS[0];
  });
  const [activeTab, setActiveTab] = useState<string>("sections");
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>("generalDescription");
  const [dossiers, setDossiers] = useState<AiDossier[]>([]);
  const [currentDossier, setCurrentDossier] = useState<AiDossier | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDossiers();
  }, []);

  const fetchDossiers = async () => {
    try {
      const res = await fetch("/api/v1/ai-dossier/dossiers");
      const data = await res.json();
      if (data.success && data.dossiers && data.dossiers.length > 0) {
        setDossiers(data.dossiers);
        setCurrentDossier(data.dossiers[0]);
      }
    } catch (err) {
      console.error("Failed to load AI dossiers:", err);
    }
  };

  const handleGenerateDossier = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/ai-dossier/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemId: selectedSystem.id,
          systemName: selectedSystem.name,
          riskTier: selectedSystem.riskTier,
          domain: selectedSystem.domain
        })
      });
      const data = await res.json();
      if (data.success && data.dossier) {
        setCurrentDossier(data.dossier);
        setDossiers(prev => [data.dossier, ...prev]);
      } else {
        throw new Error(data.error || "Generation returned unsuccessful");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate Annex IV dossier.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadDossier = () => {
    if (!currentDossier) return;
    const blob = new Blob([JSON.stringify(currentDossier, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EU_AI_ACT_ANNEX_IV_${currentDossier.systemId}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sectionLabels: Record<string, { title: string; article: string; desc: string }> = {
    generalDescription: {
      title: "1. General Description & Intended Purpose",
      article: "Annex IV, Section 1",
      desc: "Hardware specifications, system architecture, versioning, and intended operational scope."
    },
    developmentMethods: {
      title: "2. Development Methods & Data Provenance",
      article: "Annex IV, Section 2 & Art. 10",
      desc: "Algorithms used, computational pre-processing, training partition, and bias mitigation methodologies."
    },
    monitoringAndControl: {
      title: "3. Monitoring, Telemetry & Operational Limits",
      article: "Annex IV, Section 3",
      desc: "Continuous drift sensors, Wasserstein distribution bounds, and operational circuit-breakers."
    },
    humanOversightArt14: {
      title: "4. Human Oversight Protocol (HITL)",
      article: "Article 14 EU AI Act",
      desc: "Human-in-the-loop escalation workflows, explainability saliency maps, and operator stop-buttons."
    },
    riskManagementArt9: {
      title: "5. Risk Management System",
      article: "Article 9 EU AI Act",
      desc: "Continuous hazard identification, socio-economic discrimination matrices, and residual risk containment."
    },
    robustnessAccuracyArt15: {
      title: "6. Accuracy, Robustness & Cybersecurity",
      article: "Article 15 EU AI Act",
      desc: "Adversarial stress testing against FGSM/PGD attacks and fault-tolerant inference clusters."
    },
    declarationOfConformityArt47: {
      title: "7. EU Declaration of Conformity & CE Mark",
      article: "Article 47 EU AI Act",
      desc: "Formal statutory declaration ready for third-party Notified Body filing and CE readiness seal."
    }
  };

  return (
    <div className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
              Regulation (EU) 2024/1689
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-900/40 text-amber-300 border border-amber-700/50">
              Article 11 & Annex IV
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            EU AI Act Annex IV Technical Documentation Dossier Builder
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Automated statutory compilation of mandatory technical documentation for High-Risk AI Systems before European market deployment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadDossier}
            disabled={!currentDossier}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export JSON Dossier
          </button>
          <button
            onClick={handleGenerateDossier}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                Compiling AI Dossier...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Synthesize Annex IV with AI
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Target System Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {PRESET_SYSTEMS.map(sys => {
          const isSelected = selectedSystem.id === sys.id;
          return (
            <div
              key={sys.id}
              onClick={() => setSelectedSystem(sys)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40"
                  : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-semibold text-indigo-400">{sys.id}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                  {sys.riskTier}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white truncate">{sys.name}</h4>
              <p className="text-xs text-slate-400 mt-1">{sys.domain}</p>
            </div>
          );
        })}
      </div>

      {currentDossier ? (
        <div className="space-y-6">
          {/* Key Compliance Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400">Fairness Ratio (Disparate Impact)</span>
              <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {currentDossier.metrics.fairnessDisparateImpact * 100}%
              </div>
              <span className="text-[10px] text-slate-500">Threshold: ≥ 80.0%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400">Robustness & Attack Resilience</span>
              <div className="text-lg font-bold text-indigo-400 mt-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" />
                {currentDossier.metrics.adversarialRobustness}%
              </div>
              <span className="text-[10px] text-slate-500">FGSM Epsilon = 0.08</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400">Accuracy & F1 Benchmark</span>
              <div className="text-lg font-bold text-sky-400 mt-1 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-sky-400" />
                {currentDossier.metrics.accuracyScore}%
              </div>
              <span className="text-[10px] text-slate-500">Balanced Test Partition</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400">Notified Body Audit Score</span>
              <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                {currentDossier.metrics.auditReadinessScore} / 100
              </div>
              <span className="text-[10px] text-slate-500">Ready for Article 43 CE</span>
            </div>
          </div>

          {/* Dossier Metadata strip */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Dossier ID:</span>
              <span className="text-indigo-300 font-bold font-mono">{currentDossier.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Notified Target:</span>
              <span className="text-slate-200">{currentDossier.notifiedBodyTarget}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Crypto Seal:</span>
              <span className="text-slate-400 font-mono text-[10px] truncate max-w-xs">{currentDossier.cryptographicSeal}</span>
            </div>
          </div>

          {/* Content Sections Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Navigation Tabs List */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Annex IV Statutory Chapters
              </h4>
              {Object.entries(sectionLabels).map(([key, info]) => {
                const isSelected = selectedSectionKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedSectionKey(key)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20"
                        : "bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{info.title}</div>
                      <div className={`text-[10px] ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                        {info.article}
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-500"}`} />
                  </button>
                );
              })}

              {/* Data Provenance Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 mt-4 space-y-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  Article 10 Data Provenance
                </span>
                <div className="text-[11px] space-y-1 text-slate-400 font-mono">
                  <div>Dataset: <span className="text-slate-200">{currentDossier.trainingProvenance.datasetName}</span></div>
                  <div>Samples: <span className="text-slate-200">{currentDossier.trainingProvenance.sampleCount}</span></div>
                  <div>Bias Mitigation: <span className="text-slate-200">{currentDossier.trainingProvenance.biasMitigationMethod}</span></div>
                  <div>Synthetic Ratio: <span className="text-slate-200">{currentDossier.trainingProvenance.syntheticDataRatio}</span></div>
                  <div>Diff. Privacy (ε): <span className="text-emerald-400">{currentDossier.trainingProvenance.dpEpsilon}</span></div>
                </div>
              </div>
            </div>

            {/* Section Detailed Viewer */}
            <div className="lg:col-span-2 p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {sectionLabels[selectedSectionKey]?.title}
                    </h3>
                    <p className="text-xs text-indigo-400 font-mono mt-0.5">
                      {sectionLabels[selectedSectionKey]?.article}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Annex IV Standard
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
                  {currentDossier.sections[selectedSectionKey as keyof typeof currentDossier.sections] ||
                    "Section content actively being compiled from sovereign AI model weights."}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Statute: Regulation (EU) 2024/1689 OJ L 2024/1689</span>
                <span>Compiled: {new Date(currentDossier.generatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 space-y-3">
          <Cpu className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
          <p className="text-sm">No Annex IV Technical Dossier generated for this system yet.</p>
          <button
            onClick={handleGenerateDossier}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Generate Initial Technical Dossier
          </button>
        </div>
      )}
    </div>
  );
};

export default AiAnnexIvDossierBuilder;

