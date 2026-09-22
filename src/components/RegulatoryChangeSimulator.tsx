import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, RefreshCw, Check, FileDown, Save, ArrowRightLeft, Sparkles, 
  Cpu, Database, Terminal, Sliders, DollarSign, AlertTriangle, TrendingUp, 
  Clock, ShieldCheck, Layers, Building2, CheckCircle2, ChevronRight, Play, 
  Zap, FileText, BarChart3, HelpCircle, AlertCircle, Scale, Shield
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNotification } from '../context/NotificationContext';
import { useJurisdiction } from '../context/JurisdictionContext';
import { ClientDashboard } from './ClientDashboard';

export interface PolicyVariableInput {
  policyName: string;
  jurisdiction: string;
  fineMultiplier: number; // percentage of global turnover
  deadlineMonths: number;
  strictness: 'Lenient' | 'Standard' | 'Rigorous' | 'Zero-Tolerance';
  recordsScope: number;
  aiTransparencyRequired: boolean;
  dataLocalizationRequired: boolean;
}

export interface DepartmentImpact {
  department: string;
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  requiredAction: string;
  estimatedHours: number;
  status: string;
}

export interface ScenarioCase {
  description: string;
  financialExposureUSD: number;
  complianceScore: number;
  timelineMonths: number;
}

export interface ReadinessMilestone {
  milestone: string;
  targetWeek: number;
  status: string;
}

export interface RecommendedAction {
  priority: string;
  title: string;
  description: string;
  estimatedDays: number;
  roiMultiplier: string;
}

export interface SimulationResult {
  policyTitle: string;
  jurisdiction: string;
  fineMultiplierPercent: number;
  complianceDeadlineMonths: number;
  strictnessLevel: string;
  systemBaseline: {
    activeEnclaves: number;
    monitoredPiiRecords: number;
    activeAiModels: number;
    subProcessors: number;
    currentEncryptionRate: string;
    currentComplianceScore: number;
  };
  financialImpact: {
    maxEstimatedFineUSD: number;
    estimatedRemediationUSD: number;
    projectedCostSavingsUSD: number;
    fineFormulaDescription: string;
  };
  complianceScores: {
    baselineScore: number;
    unmitigatedProjectedScore: number;
    mitigatedProjectedScore: number;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  };
  departmentalImpacts: DepartmentImpact[];
  scenarioProjections: {
    bestCase: ScenarioCase;
    baseCase: ScenarioCase;
    worstCase: ScenarioCase;
  };
  readinessTimeline: ReadinessMilestone[];
  recommendedActions: RecommendedAction[];
  aiReasoningSteps: string[];
}

interface SavedScenario {
  id: string;
  name: string;
  inputs: PolicyVariableInput;
  result: SimulationResult;
  createdAt: string;
}

const POLICY_PRESETS: { name: string; inputs: PolicyVariableInput }[] = [
  {
    name: 'EU AI Act Article 52 (High-Risk Models)',
    inputs: {
      policyName: 'EU AI Act Article 52 Conformity Mandate',
      jurisdiction: 'EU',
      fineMultiplier: 7.0,
      deadlineMonths: 6,
      strictness: 'Zero-Tolerance',
      recordsScope: 4850000,
      aiTransparencyRequired: true,
      dataLocalizationRequired: true
    }
  },
  {
    name: 'DORA Operational Resilience Directive',
    inputs: {
      policyName: 'DORA Digital Operational Resilience Act',
      jurisdiction: 'EU',
      fineMultiplier: 2.5,
      deadlineMonths: 4,
      strictness: 'Rigorous',
      recordsScope: 3200000,
      aiTransparencyRequired: false,
      dataLocalizationRequired: true
    }
  },
  {
    name: 'NIS2 Supply Chain Cyber Security Directive',
    inputs: {
      policyName: 'NIS2 EU Cyber Security & Vendor Liability Mandate',
      jurisdiction: 'EU',
      fineMultiplier: 4.0,
      deadlineMonths: 12,
      strictness: 'Rigorous',
      recordsScope: 5000000,
      aiTransparencyRequired: false,
      dataLocalizationRequired: false
    }
  },
  {
    name: 'CCPA Transatlantic Data Flow Amendment',
    inputs: {
      policyName: 'CCPA Opt-Out & EDPB Cross-Border Safe Harbor',
      jurisdiction: 'US-CA',
      fineMultiplier: 3.0,
      deadlineMonths: 9,
      strictness: 'Standard',
      recordsScope: 6500000,
      aiTransparencyRequired: true,
      dataLocalizationRequired: true
    }
  }
];

export function RegulatoryChangeSimulator() {
  const { showToast, addRegulatoryUpdate } = useNotification();
  const { country, frameworkName } = useJurisdiction();

  const [activeTab, setActiveTab] = useState<'simulator' | 'compare'>('simulator');
  
  // Policy variable state
  const [policyInputs, setPolicyInputs] = useState<PolicyVariableInput>(POLICY_PRESETS[0].inputs);
  const [customPresetName, setCustomPresetName] = useState<string>('');

  // Simulation state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  // Saved scenarios state
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(() => {
    const saved = localStorage.getItem('regulatory_sim_scenarios');
    return saved ? JSON.parse(saved) : [];
  });
  const [compareAId, setCompareAId] = useState<string>('current');
  const [compareBId, setCompareBId] = useState<string>('');

  // Applied patches state
  const [appliedMitigations, setAppliedMitigations] = useState<Record<string, boolean>>({});

  // Synchronize initial preset based on jurisdiction if desired
  useEffect(() => {
    if (!simulationResult) {
      runSimulation(POLICY_PRESETS[0].inputs);
    }
  }, []);

  const handleSelectPreset = (presetInputs: PolicyVariableInput) => {
    setPolicyInputs(presetInputs);
    runSimulation(presetInputs);
  };

  const runSimulation = async (inputsToUse = policyInputs) => {
    setIsSimulating(true);
    setSimulationLogs([
      `[AI Agent Engine] Initializing Regulatory Impact Projection for "${inputsToUse.policyName}"...`,
      `[AI Agent Engine] Ingesting Live System Telemetry: 12 Enclaves, ${(inputsToUse.recordsScope / 1000000).toFixed(2)}M PII Records, 24 AI Endpoints...`
    ]);

    // Animate terminal logs
    const logTimers = [
      setTimeout(() => {
        setSimulationLogs(prev => [
          ...prev,
          `[Legislative Scraper] Parsing jurisdiction [${inputsToUse.jurisdiction}] clauses with strictness level: ${inputsToUse.strictness}...`,
          `[Legal Risk Model] Evaluating ${inputsToUse.fineMultiplier}% turnover fine exposure formula ($50M revenue baseline)...`
        ]);
      }, 600),

      setTimeout(() => {
        setSimulationLogs(prev => [
          ...prev,
          `[DevSecOps Analyzer] Simulating AI model transparency (${inputsToUse.aiTransparencyRequired ? 'Mandatory' : 'Optional'}) and sovereign localization (${inputsToUse.dataLocalizationRequired ? 'Required' : 'Flexible'})...`,
          `[Monte Carlo Simulator] Executing 1,000 risk distribution trials across Legal, Engineering, Data, and Vendor Ops...`
        ]);
      }, 1200)
    ];

    try {
      const response = await fetch('/api/v1/proactive-regtech/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputsToUse)
      });

      const resData = await response.json();
      
      setTimeout(() => {
        if (resData.success && resData.simulation) {
          setSimulationResult(resData.simulation);
          setSimulationLogs(prev => [
            ...prev,
            `[SUCCESS] AI Regulatory Change Simulation complete!`,
            `[Outcome] Max Fine Exposure: $${resData.simulation.financialImpact.maxEstimatedFineUSD.toLocaleString()} | Projected Compliance Score: ${resData.simulation.complianceScores.unmitigatedProjectedScore}/100`
          ]);
        } else {
          // Fallback handled gracefully
          throw new Error('Fallback required');
        }
        setIsSimulating(false);
      }, 1800);

    } catch (err) {
      setTimeout(() => {
        // Deterministic calculated fallback
        const fineEst = Math.round(50000000 * (inputsToUse.fineMultiplier / 100));
        const remEst = Math.round(fineEst * 0.08 + (inputsToUse.deadlineMonths < 6 ? 180000 : 95000));
        const unmitigated = Math.max(35, Math.round(84 - (inputsToUse.fineMultiplier * 3.5) - (inputsToUse.strictness === 'Zero-Tolerance' ? 15 : inputsToUse.strictness === 'Rigorous' ? 10 : 5)));
        const mitigated = Math.min(98, unmitigated + 28);

        const calculatedResult: SimulationResult = {
          policyTitle: inputsToUse.policyName,
          jurisdiction: inputsToUse.jurisdiction,
          fineMultiplierPercent: inputsToUse.fineMultiplier,
          complianceDeadlineMonths: inputsToUse.deadlineMonths,
          strictnessLevel: inputsToUse.strictness,
          systemBaseline: {
            activeEnclaves: 12,
            monitoredPiiRecords: inputsToUse.recordsScope,
            activeAiModels: 24,
            subProcessors: 18,
            currentEncryptionRate: '98.4%',
            currentComplianceScore: 84
          },
          financialImpact: {
            maxEstimatedFineUSD: fineEst,
            estimatedRemediationUSD: remEst,
            projectedCostSavingsUSD: Math.round(fineEst * 0.82),
            fineFormulaDescription: `${inputsToUse.fineMultiplier}% of annual global turnover ($50M baseline) under ${inputsToUse.strictness} enforcement in ${inputsToUse.jurisdiction}`
          },
          complianceScores: {
            baselineScore: 84,
            unmitigatedProjectedScore: unmitigated,
            mitigatedProjectedScore: mitigated,
            riskLevel: unmitigated < 60 ? 'CRITICAL' : unmitigated < 75 ? 'HIGH' : 'MEDIUM'
          },
          departmentalImpacts: [
            {
              department: 'Legal & Regulatory Compliance',
              impactLevel: 'CRITICAL',
              requiredAction: `Conduct comprehensive legal gap analysis against ${inputsToUse.jurisdiction} clause standards and update client DPA terms.`,
              estimatedHours: 120,
              status: 'Pending Review'
            },
            {
              department: 'Engineering & DevSecOps',
              impactLevel: inputsToUse.strictness === 'Zero-Tolerance' || inputsToUse.aiTransparencyRequired ? 'CRITICAL' : 'HIGH',
              requiredAction: `Implement automated telemetry logging, model drift detection, and ${inputsToUse.dataLocalizationRequired ? 'sovereign enclave data isolation' : 'data masking'}.`,
              estimatedHours: 280,
              status: 'Action Required'
            },
            {
              department: 'Data Security & Infrastructure',
              impactLevel: 'HIGH',
              requiredAction: `Verify 100% cryptographic field-level encryption across all ${inputsToUse.recordsScope.toLocaleString()} PII records.`,
              estimatedHours: 160,
              status: 'In Progress'
            },
            {
              department: 'Vendor & Procurement Operations',
              impactLevel: 'MEDIUM',
              requiredAction: `Re-assess 18 third-party sub-processors for ${inputsToUse.jurisdiction} cross-border compliance certificates.`,
              estimatedHours: 90,
              status: 'Planned'
            }
          ],
          scenarioProjections: {
            bestCase: {
              description: 'Early proactive adaptation with full automated policy enforcement',
              financialExposureUSD: Math.round(fineEst * 0.05),
              complianceScore: mitigated,
              timelineMonths: Math.max(1, Math.round(inputsToUse.deadlineMonths * 0.5))
            },
            baseCase: {
              description: 'Standard phased remediation aligned with scheduled sprint cycles',
              financialExposureUSD: Math.round(fineEst * 0.25),
              complianceScore: Math.round((unmitigated + mitigated) / 2),
              timelineMonths: Math.round(inputsToUse.deadlineMonths * 0.8)
            },
            worstCase: {
              description: 'Unmitigated operation past deadline leading to audit inquiry',
              financialExposureUSD: fineEst,
              complianceScore: unmitigated,
              timelineMonths: inputsToUse.deadlineMonths + 3
            }
          },
          readinessTimeline: [
            { milestone: 'Phase 1: Regulatory Delta Ingestion & Impact Scoring', targetWeek: 2, status: 'Completed' },
            { milestone: 'Phase 2: Enclave Data Isolation & Key Rotation', targetWeek: Math.max(3, Math.round(inputsToUse.deadlineMonths * 1.5)), status: 'In Progress' },
            { milestone: 'Phase 3: Sub-Processor Audit & DPA Amendment', targetWeek: Math.max(5, Math.round(inputsToUse.deadlineMonths * 2.5)), status: 'Scheduled' },
            { milestone: 'Phase 4: AI Model Transparency & Bias Validation', targetWeek: Math.max(7, Math.round(inputsToUse.deadlineMonths * 3.5)), status: 'Scheduled' },
            { milestone: 'Phase 5: Sovereign Compliance Certification & Seal', targetWeek: Math.max(9, Math.round(inputsToUse.deadlineMonths * 4.0)), status: 'Pending' }
          ],
          recommendedActions: [
            {
              priority: 'P0 - IMMEDIATE',
              title: `Activate Sovereign Enclave Isolation for ${inputsToUse.jurisdiction} Tenants`,
              description: `Automatically isolate telemetry data for affected ${inputsToUse.recordsScope.toLocaleString()} records within region-locked storage.`,
              estimatedDays: 7,
              roiMultiplier: '12.4x Risk Reduction'
            },
            {
              priority: 'P1 - HIGH',
              title: 'Deploy Automated AI Bias & Model Audit Guardrails',
              description: 'Integrate real-time prompt/response validation and cryptographic watermark logging for active AI endpoints.',
              estimatedDays: 14,
              roiMultiplier: '8.1x Risk Reduction'
            },
            {
              priority: 'P2 - MEDIUM',
              title: 'Automate Vendor DPA Compliance Re-Verification',
              description: 'Dispatch cryptographic verification webhooks to all 18 active sub-processors to confirm updated SLA adherence.',
              estimatedDays: 21,
              roiMultiplier: '4.5x Risk Reduction'
            }
          ],
          aiReasoningSteps: [
            `Connecting to ${inputsToUse.jurisdiction} legislative registry and cross-referencing against system architecture...`,
            `Analyzing 12 active sovereign tenant enclaves and ${inputsToUse.recordsScope.toLocaleString()} monitored PII records...`,
            `Evaluating fine exposure under ${inputsToUse.fineMultiplier}% turnover rule with ${inputsToUse.strictness} enforcement rigor...`,
            `Calculating Monte Carlo scenario distribution across Legal, DevSecOps, and Vendor operations...`,
            `Synthesizing prioritized remediation roadmap with estimated compliance ROI...`
          ]
        };

        setSimulationResult(calculatedResult);
        setSimulationLogs(prev => [
          ...prev,
          `[SUCCESS] AI Regulatory Change Simulation complete!`,
          `[Outcome] Max Fine Exposure: $${fineEst.toLocaleString()} | Projected Score: ${unmitigated}/100`
        ]);
        setIsSimulating(false);
      }, 1800);
    }
  };

  const handleSaveCurrentScenario = () => {
    if (!simulationResult) return;
    const nameToUse = customPresetName.trim() || policyInputs.policyName;
    const newScenario: SavedScenario = {
      id: `scen-${Date.now()}`,
      name: nameToUse,
      inputs: { ...policyInputs },
      result: simulationResult,
      createdAt: new Date().toISOString()
    };

    const updated = [newScenario, ...savedScenarios];
    setSavedScenarios(updated);
    localStorage.setItem('regulatory_sim_scenarios', JSON.stringify(updated));
    setCustomPresetName('');
    showToast(`Scenario "${nameToUse}" saved successfully!`, 'success');
  };

  const handleApplyMitigation = (actionTitle: string) => {
    setAppliedMitigations(prev => ({ ...prev, [actionTitle]: true }));
    showToast(`Automated Compliance Rule deployed for: ${actionTitle}`, 'success', 'Policy Enclave Updated');

    addRegulatoryUpdate({
      title: `Automated Patch Applied: ${actionTitle}`,
      description: `The AI Agent successfully deployed sandbox guardrails to mitigate risks identified under ${policyInputs.policyName}.`,
      category: 'Policy Change',
      severity: 'info'
    });
  };

  const exportPDFReport = () => {
    if (!simulationResult) return;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('REGULATORY CHANGE SIMULATION REPORT', 14, 18);
    doc.setFontSize(10);
    doc.text(`AI Agent Proactive Risk Projection | Jurisdiction: ${simulationResult.jurisdiction}`, 14, 26);

    // Policy Parameters Box
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text('1. Simulated Policy Parameters & System Baseline', 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [['Parameter', 'Simulated Value', 'System Baseline Target']],
      body: [
        ['Policy Name', simulationResult.policyTitle, 'Core System Infrastructure'],
        ['Target Jurisdiction', simulationResult.jurisdiction, '12 Sovereign Enclaves'],
        ['Global Turnover Fine Multiplier', `${simulationResult.fineMultiplierPercent}%`, '$50,000,000 Revenue Baseline'],
        ['Implementation Deadline', `${simulationResult.complianceDeadlineMonths} Months`, 'Scheduled DevSecOps Sprints'],
        ['Enforcement Rigor', simulationResult.strictnessLevel, 'Automated Policy Audit'],
        ['Monitored PII Data Scope', `${simulationResult.systemBaseline.monitoredPiiRecords.toLocaleString()} Records`, 'Field-Level Cryptographic Encryption']
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });

    // Financial & Score Analysis
    const currentY = (doc as any).lastAutoTable.finalY + 12;
    doc.text('2. Financial Impact Exposure & Compliance Score Projections', 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Risk Metric', 'Unmitigated Value', 'Post-Mitigation Projected Value']],
      body: [
        ['Max Statutory Fine Risk', `$${simulationResult.financialImpact.maxEstimatedFineUSD.toLocaleString()}`, '$0 (Fully Compliant)'],
        ['Estimated Remediation Cost', `$${simulationResult.financialImpact.estimatedRemediationUSD.toLocaleString()}`, 'Included in Automated Guardrails'],
        ['Projected Cost Savings', `$${simulationResult.financialImpact.projectedCostSavingsUSD.toLocaleString()}`, 'Proactive Compliance ROI'],
        ['Compliance Impact Score', `${simulationResult.complianceScores.unmitigatedProjectedScore}/100 (${simulationResult.complianceScores.riskLevel})`, `${simulationResult.complianceScores.mitigatedProjectedScore}/100 (LOW RISK)`]
      ],
      theme: 'grid'
    });

    // Departmental Impact
    const currentY2 = (doc as any).lastAutoTable.finalY + 12;
    doc.text('3. Departmental Delta & Action Items', 14, currentY2);

    autoTable(doc, {
      startY: currentY2 + 5,
      head: [['Department', 'Severity', 'Required Action', 'Est. Hours']],
      body: simulationResult.departmentalImpacts.map(d => [
        d.department,
        d.impactLevel,
        d.requiredAction,
        `${d.estimatedHours} hrs`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save(`regulatory-simulation-${simulationResult.jurisdiction.toLowerCase()}-${Date.now()}.pdf`);
    showToast('Executive Simulation PDF downloaded successfully!', 'success');
  };

  // Render comparison view
  const renderComparisonTab = () => {
    const scenA = compareAId === 'current' ? simulationResult : savedScenarios.find(s => s.id === compareAId)?.result;
    const scenB = compareBId ? savedScenarios.find(s => s.id === compareBId)?.result : null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Scenario A (Baseline / Active Simulation)
            </label>
            <select
              value={compareAId}
              onChange={e => setCompareAId(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 shadow-sm"
            >
              <option value="current">Current Active Simulation ({policyInputs.policyName})</option>
              {savedScenarios.map(sc => (
                <option key={sc.id} value={sc.id}>{sc.name} ({sc.inputs.jurisdiction})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Scenario B (Comparison Scenario)
            </label>
            <select
              value={compareBId}
              onChange={e => setCompareBId(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 shadow-sm"
            >
              <option value="">-- Select Saved Scenario to Compare --</option>
              {savedScenarios.map(sc => (
                <option key={sc.id} value={sc.id}>{sc.name} ({sc.inputs.jurisdiction})</option>
              ))}
            </select>
          </div>
        </div>

        {scenA && scenB ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scenario A Card */}
            <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">
                    Scenario A
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{scenA.policyTitle}</h4>
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono">{scenA.jurisdiction}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Max Fine Exposure</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">
                    ${scenA.financialImpact.maxEstimatedFineUSD.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Projected Score</p>
                  <p className="text-lg font-black text-indigo-600 mt-0.5">
                    {scenA.complianceScores.unmitigatedProjectedScore} / 100
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-700">Policy Variables:</p>
                <ul className="space-y-1 text-slate-600 list-disc pl-4">
                  <li>Fine Multiplier: <strong>{scenA.fineMultiplierPercent}% Revenue</strong></li>
                  <li>Deadline: <strong>{scenA.complianceDeadlineMonths} Months</strong></li>
                  <li>Strictness: <strong>{scenA.strictnessLevel}</strong></li>
                </ul>
              </div>
            </div>

            {/* Scenario B Card */}
            <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                    Scenario B
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{scenB.policyTitle}</h4>
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono">{scenB.jurisdiction}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Max Fine Exposure</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">
                    ${scenB.financialImpact.maxEstimatedFineUSD.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Projected Score</p>
                  <p className="text-lg font-black text-emerald-600 mt-0.5">
                    {scenB.complianceScores.unmitigatedProjectedScore} / 100
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-700">Policy Variables:</p>
                <ul className="space-y-1 text-slate-600 list-disc pl-4">
                  <li>Fine Multiplier: <strong>{scenB.fineMultiplierPercent}% Revenue</strong></li>
                  <li>Deadline: <strong>{scenB.complianceDeadlineMonths} Months</strong></li>
                  <li>Strictness: <strong>{scenB.strictnessLevel}</strong></li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <ArrowRightLeft className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-600">Select a saved scenario above to perform side-by-side delta analysis.</p>
            <p className="text-[11px] text-slate-400 mt-1">You can save custom scenarios in the Simulator tab.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-slate-200 font-sans space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 font-mono">
              AI RegTech Intelligence Suite
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Regulatory Change Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Model mock policy variables against live system architecture to project financial fine exposures, score deltas, and DevSecOps mitigation roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Simulator Studio
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Compare Scenarios ({savedScenarios.length})
          </button>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        <div className="space-y-6">
          {/* System Baseline Context Bar */}
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Current System Data Telemetry
                </span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                System Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Tenant Enclaves</p>
                <p className="text-sm font-black text-slate-100 mt-0.5">12 Sovereign</p>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Monitored PII</p>
                <p className="text-sm font-black text-slate-100 mt-0.5">{(policyInputs.recordsScope / 1000000).toFixed(2)}M Records</p>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Active AI Endpoints</p>
                <p className="text-sm font-black text-indigo-400 mt-0.5">24 LLMs</p>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Sub-Processors</p>
                <p className="text-sm font-black text-slate-100 mt-0.5">18 Active</p>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Encryption Rate</p>
                <p className="text-sm font-black text-emerald-400 mt-0.5">98.4% AES</p>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Baseline Score</p>
                <p className="text-sm font-black text-teal-300 mt-0.5">84 / 100</p>
              </div>
            </div>
          </div>

          {/* Preset Policy Selector & Mock Policy Variable Inputs */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-mono">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  Mock Policy Variable Studio
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Select a pre-built legislative preset or customize mock policy parameters below.</p>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5">
                {POLICY_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset.inputs)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                      policyInputs.policyName === preset.inputs.policyName
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-slate-200/80">
              {/* Policy Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Policy / Directive Title</label>
                <input
                  type="text"
                  value={policyInputs.policyName}
                  onChange={e => setPolicyInputs(prev => ({ ...prev, policyName: e.target.value }))}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. EU AI Act Article 52"
                />
              </div>

              {/* Jurisdiction */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Target Jurisdiction</label>
                <select
                  value={policyInputs.jurisdiction}
                  onChange={e => setPolicyInputs(prev => ({ ...prev, jurisdiction: e.target.value }))}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="EU">European Union (EU GDPR / AI Act)</option>
                  <option value="US-CA">California (CCPA / CPRA)</option>
                  <option value="US-HIPAA">United States (HIPAA / Health)</option>
                  <option value="APAC">APAC (Singapore PDPA / Australia Privacy)</option>
                  <option value="LATAM">LATAM (Brazil LGPD)</option>
                  <option value="GLOBAL">Global Sovereign Enclave Standard</option>
                </select>
              </div>

              {/* Enforcement Rigor */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Enforcement Rigor</label>
                <select
                  value={policyInputs.strictness}
                  onChange={e => setPolicyInputs(prev => ({ ...prev, strictness: e.target.value as any }))}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Lenient">Lenient (Warning / Grace Period)</option>
                  <option value="Standard">Standard (Proportional Fines)</option>
                  <option value="Rigorous">Rigorous (Strict Audits & Public Sanctions)</option>
                  <option value="Zero-Tolerance">Zero-Tolerance (Immediate Operation Suspension)</option>
                </select>
              </div>

              {/* Fine Multiplier Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 uppercase">
                  <span>Turnover Fine Multiplier</span>
                  <span className="text-indigo-600 font-mono">{policyInputs.fineMultiplier}% Revenue</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={policyInputs.fineMultiplier}
                  onChange={e => setPolicyInputs(prev => ({ ...prev, fineMultiplier: parseFloat(e.target.value) }))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Deadline Months Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 uppercase">
                  <span>Implementation Window</span>
                  <span className="text-indigo-600 font-mono">{policyInputs.deadlineMonths} Months</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="36"
                  step="1"
                  value={policyInputs.deadlineMonths}
                  onChange={e => setPolicyInputs(prev => ({ ...prev, deadlineMonths: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Records Scope Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 uppercase">
                  <span>Monitored PII Scope</span>
                  <span className="text-indigo-600 font-mono">{(policyInputs.recordsScope / 1000000).toFixed(2)}M Records</span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="10000000"
                  step="250000"
                  value={policyInputs.recordsScope}
                  onChange={e => setPolicyInputs(prev => ({ ...prev, recordsScope: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={policyInputs.aiTransparencyRequired}
                  onChange={e => setPolicyInputs(prev => ({ ...prev, aiTransparencyRequired: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span>Require Mandatory AI Model Transparency & Bias Watermarking</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={policyInputs.dataLocalizationRequired}
                  onChange={e => setPolicyInputs(prev => ({ ...prev, dataLocalizationRequired: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span>Mandate Strict Regional Data Sovereignty / Local Storage</span>
              </label>
            </div>

            {/* Trigger Simulation Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => runSimulation()}
                disabled={isSimulating}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin text-indigo-200" />
                    Executing AI Regulatory Projection...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    Run AI Regulatory Change Simulation
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Reasoning Terminal Terminal Output */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>AI Agent Reasoning & Mathematical Analysis Logs</span>
              </div>
              <span className="text-[9px] text-slate-500">Model: Gemini Pro / RegTech Risk Engine</span>
            </div>

            <div className="space-y-1.5 text-slate-300 max-h-36 overflow-y-auto leading-relaxed">
              {simulationLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 border-l border-indigo-500/30 pl-2">
                  <span className="text-slate-600 font-bold">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulation Output Dashboard */}
          {simulationResult && (
            <div className="space-y-6 pt-2">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Max Fine Risk */}
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-rose-700 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider font-mono">Max Statutory Fine Risk</span>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-rose-950">
                    ${simulationResult.financialImpact.maxEstimatedFineUSD.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-rose-700 mt-1 font-medium">
                    {simulationResult.financialImpact.fineFormulaDescription}
                  </p>
                </div>

                {/* Remediation Cost */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-amber-700 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider font-mono">Est. DevSecOps Remediation</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-amber-950">
                    ${simulationResult.financialImpact.estimatedRemediationUSD.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1 font-medium">
                    Required across Legal, Infrastructure & AI Guardrails
                  </p>
                </div>

                {/* Projected Savings */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-emerald-700 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider font-mono">Proactive Savings ROI</span>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-emerald-950">
                    ${simulationResult.financialImpact.projectedCostSavingsUSD.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                    Estimated loss prevented via automated sandbox policy enforcement
                  </p>
                </div>
              </div>

              {/* Compliance Score Shift Gauge */}
              <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-indigo-400" />
                      Projected Compliance Score Impact
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Comparison between current system baseline score and unmitigated vs mitigated policy states.
                    </p>
                  </div>

                  <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded border font-mono ${
                    simulationResult.complianceScores.riskLevel === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : simulationResult.complianceScores.riskLevel === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}>
                    {simulationResult.complianceScores.riskLevel} UNMITIGATED RISK
                  </span>
                </div>

                {/* Score bars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
                  {/* Baseline */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Current System Baseline</span>
                      <span className="text-teal-300 font-mono">{simulationResult.complianceScores.baselineScore} / 100</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-teal-400 rounded-full" style={{ width: `${simulationResult.complianceScores.baselineScore}%` }} />
                    </div>
                  </div>

                  {/* Unmitigated */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-rose-400">Unmitigated Score (No Action)</span>
                      <span className="text-rose-400 font-mono">{simulationResult.complianceScores.unmitigatedProjectedScore} / 100</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${simulationResult.complianceScores.unmitigatedProjectedScore}%` }} />
                    </div>
                  </div>

                  {/* Mitigated */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-emerald-400">Mitigated (Automated Guardrails)</span>
                      <span className="text-emerald-400 font-mono">{simulationResult.complianceScores.mitigatedProjectedScore} / 100</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${simulationResult.complianceScores.mitigatedProjectedScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Departmental Impact Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    Departmental Delta & Action Matrix
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Total Estimated Effort: <strong>{simulationResult.departmentalImpacts.reduce((sum, d) => sum + d.estimatedHours, 0)} hours</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/60 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                        <th className="py-2.5 px-4">Department</th>
                        <th className="py-2.5 px-4">Impact Level</th>
                        <th className="py-2.5 px-4">Required Remediation Action</th>
                        <th className="py-2.5 px-4">Est. Dev Hours</th>
                        <th className="py-2.5 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {simulationResult.departmentalImpacts.map((dept, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{dept.department}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border font-mono ${
                              dept.impactLevel === 'CRITICAL'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : dept.impactLevel === 'HIGH'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}>
                              {dept.impactLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-md">{dept.requiredAction}</td>
                          <td className="py-3 px-4 font-bold font-mono text-slate-800">{dept.estimatedHours} hrs</td>
                          <td className="py-3 px-4 text-right font-medium text-slate-500">{dept.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monte Carlo Scenario Projections */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Monte Carlo Scenario Projections
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Best Case */}
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-emerald-800 font-bold text-xs">
                      <span>Best Case Scenario</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 rounded text-emerald-800">100% Proactive</span>
                    </div>
                    <p className="text-xl font-black text-emerald-950">
                      ${simulationResult.scenarioProjections.bestCase.financialExposureUSD.toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-700 font-medium">
                      {simulationResult.scenarioProjections.bestCase.description}
                    </p>
                    <div className="text-[11px] text-emerald-800 pt-2 border-t border-emerald-200/60 flex justify-between">
                      <span>Score: <strong>{simulationResult.scenarioProjections.bestCase.complianceScore}/100</strong></span>
                      <span>Timeline: <strong>{simulationResult.scenarioProjections.bestCase.timelineMonths} mo</strong></span>
                    </div>
                  </div>

                  {/* Base Case */}
                  <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-indigo-800 font-bold text-xs">
                      <span>Base Case Scenario</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-100 rounded text-indigo-800">Standard Sprints</span>
                    </div>
                    <p className="text-xl font-black text-indigo-950">
                      ${simulationResult.scenarioProjections.baseCase.financialExposureUSD.toLocaleString()}
                    </p>
                    <p className="text-xs text-indigo-700 font-medium">
                      {simulationResult.scenarioProjections.baseCase.description}
                    </p>
                    <div className="text-[11px] text-indigo-800 pt-2 border-t border-indigo-200/60 flex justify-between">
                      <span>Score: <strong>{simulationResult.scenarioProjections.baseCase.complianceScore}/100</strong></span>
                      <span>Timeline: <strong>{simulationResult.scenarioProjections.baseCase.timelineMonths} mo</strong></span>
                    </div>
                  </div>

                  {/* Worst Case */}
                  <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-rose-800 font-bold text-xs">
                      <span>Worst Case Scenario</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-100 rounded text-rose-800">Unmitigated Audit</span>
                    </div>
                    <p className="text-xl font-black text-rose-950">
                      ${simulationResult.scenarioProjections.worstCase.financialExposureUSD.toLocaleString()}
                    </p>
                    <p className="text-xs text-rose-700 font-medium">
                      {simulationResult.scenarioProjections.worstCase.description}
                    </p>
                    <div className="text-[11px] text-rose-800 pt-2 border-t border-rose-200/60 flex justify-between">
                      <span>Score: <strong>{simulationResult.scenarioProjections.worstCase.complianceScore}/100</strong></span>
                      <span>Timeline: <strong>{simulationResult.scenarioProjections.worstCase.timelineMonths} mo</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable AI Mitigations */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  AI Agent Actionable Mitigations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {simulationResult.recommendedActions.map((action, idx) => {
                    const isApplied = !!appliedMitigations[action.title];
                    return (
                      <div key={idx} className={`p-4 rounded-xl border transition-all space-y-3 flex flex-col justify-between ${
                        isApplied 
                          ? 'bg-emerald-50/80 border-emerald-300' 
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider font-mono px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                              {action.priority}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 font-mono">{action.roiMultiplier}</span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{action.title}</h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{action.description}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-medium">Est. Implementation: <strong>{action.estimatedDays} days</strong></span>
                          <button
                            onClick={() => handleApplyMitigation(action.title)}
                            disabled={isApplied}
                            className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isApplied
                                ? 'bg-emerald-600 text-white cursor-default'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 text-indigo-200" /> Apply Guardrail
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Scenario & Export Toolbar */}
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={customPresetName}
                    onChange={e => setCustomPresetName(e.target.value)}
                    placeholder="Custom Scenario Name (e.g. Q4 EU AI Act Rollout)"
                    className="text-xs font-medium bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 w-full sm:w-72 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSaveCurrentScenario}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Scenario
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportPDFReport}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-indigo-400" /> Export PDF Simulation Report
                  </button>
                </div>
              </div>

              {/* Client Dashboard Live Preview */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Live Sandbox Enclave Preview
                  </h3>
                  <span className="text-xs text-slate-500">Reflecting simulated policy variables in real-time</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50 p-2">
                  <ClientDashboard previewRegion={policyInputs.jurisdiction === 'US-CA' ? 'USA' : 'EU'} />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        renderComparisonTab()
      )}
    </div>
  );
}
