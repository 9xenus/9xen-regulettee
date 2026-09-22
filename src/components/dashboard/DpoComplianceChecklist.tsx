import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Award,
  FileText,
  Upload,
  Clock,
  ChevronRight,
  BookOpen,
  UserCheck,
  Scale,
  Globe,
  Building2,
  Check,
  HelpCircle,
  Briefcase,
  Play,
  RotateCcw,
  Loader2,
  FileCheck2,
  Download,
  Fingerprint
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNotification } from "../../context/NotificationContext";

interface DpoCertification {
  id: string;
  name: string;
  email: string;
  cert_body: string;
  cert_name: string;
  cert_number: string;
  issue_date: string;
  expiry_date: string;
  status: 'ACTIVE' | 'WARNING' | 'EXPIRED';
  daysRemaining?: number;
}

interface DpoDocument {
  id: string;
  name: string;
  doc_type: string;
  uploaded_at: string;
  status: 'VERIFIED' | 'PENDING_VERIFICATION';
  verification_log: string;
  file_size: number;
}

interface DpoTrainingRecord {
  id: string;
  dpo_id: string;
  course_name: string;
  cpe_hours: number;
  completed_at: string | null;
  status: 'PENDING' | 'COMPLETED';
}

interface DpoComplianceChecklistProps {
  certifications: DpoCertification[];
  documents: DpoDocument[];
  trainingRecords: DpoTrainingRecord[];
  onLaunchWizard: () => void;
  onLaunchAppoint: () => void;
  onOpenUpload: () => void;
  onGenerateAttestation?: () => void;
}

const LOCAL_STORAGE_KEY = "dpo_compliance_checklist_state";

export const DpoComplianceChecklist: React.FC<DpoComplianceChecklistProps> = ({
  certifications,
  documents,
  trainingRecords,
  onLaunchWizard,
  onLaunchAppoint,
  onOpenUpload,
  onGenerateAttestation
}) => {
  const { showToast } = useNotification();
  const [activeStep, setActiveStep] = useState<number>(1);

  // Assessment calculator state for Step 1
  const [qPublicAuth, setQPublicAuth] = useState<boolean>(false);
  const [qLargeScaleMonitoring, setQLargeScaleMonitoring] = useState<boolean>(false);
  const [qLargeScaleSensitive, setQLargeScaleSensitive] = useState<boolean>(false);

  // Interactive compilation states
  const [selectedDpoId, setSelectedDpoId] = useState<string>("");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileProgress, setCompileProgress] = useState<number>(0);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const [compileSuccess, setCompileSuccess] = useState<boolean>(false);

  // Manual checklist checkboxes
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({
    // Step 1
    step1_legal_documented: false,
    // Step 2
    step2_expert_audited: false,
    step2_integrity_verified: false,
    // Step 3
    step3_reports_highest: false,
    step3_no_conflict: false,
    step3_no_instructions: false,
    step3_resources_provided: false,
    // Step 4
    step4_published_policy: false,
    step4_registered_authority: false,
    // Step 5
    step5_dpia_consulted: false,
    step5_board_report: false
  });

  // Auto-populate compilers selections when data loads
  useEffect(() => {
    if (certifications.length > 0 && !selectedDpoId) {
      setSelectedDpoId(certifications[0].id);
    }
  }, [certifications, selectedDpoId]);

  useEffect(() => {
    if (documents.length > 0 && selectedDocIds.length === 0) {
      setSelectedDocIds(documents.map(d => d.id));
    }
  }, [documents, selectedDocIds]);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.manualChecks) setManualChecks(parsed.manualChecks);
        if (parsed.activeStep) setActiveStep(parsed.activeStep);
        if (parsed.assessment) {
          setQPublicAuth(parsed.assessment.qPublicAuth || false);
          setQLargeScaleMonitoring(parsed.assessment.qLargeScaleMonitoring || false);
          setQLargeScaleSensitive(parsed.assessment.qLargeScaleSensitive || false);
        }
      }
    } catch (e) {
      console.error("Failed to load saved checklist state", e);
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    const stateToSave = {
      manualChecks,
      activeStep,
      assessment: {
        qPublicAuth,
        qLargeScaleMonitoring,
        qLargeScaleSensitive
      }
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error("Failed to save checklist state", e);
    }
  }, [manualChecks, activeStep, qPublicAuth, qLargeScaleMonitoring, qLargeScaleSensitive]);

  // Handle manual checkbox change
  const handleToggleCheck = (key: string) => {
    setManualChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Reset entire checklist state
  const handleResetChecklist = () => {
    if (!confirm("Are you sure you want to reset all manual selections and assessment answers?")) return;
    setManualChecks({
      step1_legal_documented: false,
      step2_expert_audited: false,
      step2_integrity_verified: false,
      step3_reports_highest: false,
      step3_no_conflict: false,
      step3_no_instructions: false,
      step3_resources_provided: false,
      step4_published_policy: false,
      step4_registered_authority: false,
      step5_dpia_consulted: false,
      step5_board_report: false
    });
    setQPublicAuth(false);
    setQLargeScaleMonitoring(false);
    setQLargeScaleSensitive(false);
    setActiveStep(1);
  };

  // Dynamic state checks
  const isDpoRegistered = certifications.length > 0;
  const isDpoActive = certifications.some(c => c.status === "ACTIVE" || c.status === "WARNING");
  const hasVerifiedAppointmentLetter = documents.some(
    d => d.doc_type === "Official DPO Appointment Letter" && d.status === "VERIFIED"
  );
  
  // CPE hours check per DPO
  const hasCpeSatisfied = useMemo(() => {
    if (certifications.length === 0) return false;
    return certifications.some(dpo => {
      const courses = trainingRecords.filter(t => t.dpo_id === dpo.id);
      const completedCpe = courses
        .filter(c => c.status === "COMPLETED")
        .reduce((acc, curr) => acc + curr.cpe_hours, 0);
      return completedCpe >= 30;
    });
  }, [certifications, trainingRecords]);

  // Step 1: Appointment mandate calculation
  const isAppointmentMandatory = qPublicAuth || qLargeScaleMonitoring || qLargeScaleSensitive;

  // Compile detailed step status and item checks
  const steps = useMemo(() => {
    return [
      {
        id: 1,
        title: "Mandate Assessment",
        article: "Art. 37.1 GDPR",
        icon: Scale,
        description: "Determine and document if your organization is legally required to appoint a DPO under EU statutory triggers.",
        requirements: [
          {
            key: "step1_assessment_run",
            label: "Conduct structural scale assessment",
            isAuto: true,
            status: isAppointmentMandatory ? "MANDATORY" : "VOLUNTARY",
            hint: "Calculated dynamically based on structural scale questions below."
          },
          {
            key: "step1_legal_documented",
            label: "Formally document legal justification & sign off",
            isAuto: false,
            status: manualChecks.step1_legal_documented,
            hint: "Document the legal reasoning (whether appointing voluntarily or as a mandate) in your core compliance journal."
          }
        ]
      },
      {
        id: 2,
        title: "Qualified Appointment",
        article: "Art. 37.5 GDPR",
        icon: Award,
        description: "Appoint a designated officer based on their professional qualities, specialized legal expertise, and privacy track record.",
        requirements: [
          {
            key: "step2_dpo_registered",
            label: "Register designated DPO on secure ledger",
            isAuto: true,
            status: isDpoRegistered,
            hint: "Register at least one officer with valid certification details on the portal directory."
          },
          {
            key: "step2_dpo_credential_valid",
            label: "Verify active credential status",
            isAuto: true,
            status: isDpoActive,
            hint: "Ensure the appointed DPO maintains an active, non-expired professional certification (CIPP/E, CDPO, etc.)."
          },
          {
            key: "step2_expert_audited",
            label: "Audit professional qualities & expert knowledge",
            isAuto: false,
            status: manualChecks.step2_expert_audited,
            hint: "Conduct interviews, check professional references, and review case studies demonstrating practical GDPR experience."
          },
          {
            key: "step2_integrity_verified",
            label: "Formally audit educational & license records",
            isAuto: false,
            status: manualChecks.step2_integrity_verified,
            hint: "Perform standard HR and licensing board validations to verify the integrity of certifications."
          }
        ]
      },
      {
        id: 3,
        title: "Independence & Position",
        article: "Art. 38 GDPR",
        icon: Building2,
        description: "Secure the DPO's organizational position, ensuring direct reporting, absolute independence, and zero conflict of interest.",
        requirements: [
          {
            key: "step3_reports_highest",
            label: "DPO reports directly to highest management level",
            isAuto: false,
            status: manualChecks.step3_reports_highest,
            hint: "Formally structure reporting lines so the DPO presents privacy audits directly to the Board or Executive Committee."
          },
          {
            key: "step3_no_conflict",
            label: "Verify zero conflict of interest",
            isAuto: false,
            status: manualChecks.step3_no_conflict,
            hint: "DPO must not hold senior administrative posts that determine processing purposes (e.g. CEO, CTO, Head of Marketing, Head of HR)."
          },
          {
            key: "step3_no_instructions",
            label: "Ensure DPO is free from external instructions",
            isAuto: false,
            status: manualChecks.step3_no_instructions,
            hint: "Formally commit that the DPO shall not receive instructions regarding the performance of their statutory tasks."
          },
          {
            key: "step3_resources_provided",
            label: "Allocate necessary resources, tools, & system access",
            isAuto: false,
            status: manualChecks.step3_resources_provided,
            hint: "Ensure the DPO has sufficient budget, compliance tools, and access to all personal data processing environments."
          }
        ]
      },
      {
        id: 4,
        title: "Publicity & Registration",
        article: "Art. 37.7 GDPR",
        icon: Globe,
        description: "Formally publish DPO contact points publicly and register details with your national Supervisory Authority.",
        requirements: [
          {
            key: "step4_appointment_letter",
            label: "Upload & verify official board appointment letter",
            isAuto: true,
            status: hasVerifiedAppointmentLetter,
            hint: "Upload a signed executive board resolution or formal appointment letter to the secure Evidence Vault."
          },
          {
            key: "step4_published_policy",
            label: "Publish DPO contact points in privacy policy",
            isAuto: false,
            status: manualChecks.step4_published_policy,
            hint: "Ensure contact details (e.g., dpo@yourcompany.eu) are highly visible in your public-facing privacy policy and cookie footers."
          },
          {
            key: "step4_registered_authority",
            label: "Formally register DPO with supervisory authority",
            isAuto: false,
            status: manualChecks.step4_registered_authority,
            hint: "Register details with national authorities (e.g., CNIL in France, DPC in Ireland) using their official public portal."
          }
        ]
      },
      {
        id: 5,
        title: "Oversight & Education",
        article: "Art. 38.2 & 39 GDPR",
        icon: BookOpen,
        description: "Satisfy continuing education, consult on impact assessments, and maintain executive compliance oversight.",
        requirements: [
          {
            key: "step5_cpe_satisfied",
            label: "Maintain minimum 30 CPE training credits",
            isAuto: true,
            status: hasCpeSatisfied,
            hint: "Complete at least 30 hours of accredited professional training courses on the training catalog."
          },
          {
            key: "step5_dpia_consulted",
            label: "Establish mandatory DPO DPIA advisory loops",
            isAuto: false,
            status: manualChecks.step5_dpia_consulted,
            hint: "Ensure product and data teams systematically seek DPO guidance for all Data Protection Impact Assessments (Article 35)."
          },
          {
            key: "step5_board_report",
            label: "Compile and present annual compliance audit report",
            isAuto: false,
            status: manualChecks.step5_board_report,
            hint: "Present an annual report on the state of organizational privacy, active risks, and supervisory audits to executive management."
          }
        ]
      }
    ];
  }, [
    isAppointmentMandatory,
    manualChecks,
    isDpoRegistered,
    isDpoActive,
    hasVerifiedAppointmentLetter,
    hasCpeSatisfied
  ]);

  // Overall granular score calculation
  const overallProgress = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;

    steps.forEach(step => {
      step.requirements.forEach(req => {
        totalItems++;
        if (req.isAuto) {
          if (req.key === "step1_assessment_run") {
            // Assessment is always considered complete once answered/decided
            completedItems++;
          } else if (req.status) {
            completedItems++;
          }
        } else {
          if (req.status) {
            completedItems++;
          }
        }
      });
    });

    if (totalItems === 0) return 0;
    return Math.round((completedItems / totalItems) * 100);
  }, [steps]);

  // Calculate completion status of each step for sidebar badges
  const getStepCompletionStatus = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return "PENDING";

    let total = step.requirements.length;
    let completed = 0;

    step.requirements.forEach(req => {
      if (req.isAuto) {
        if (req.key === "step1_assessment_run" || req.status) {
          completed++;
        }
      } else {
        if (req.status) {
          completed++;
        }
      }
    });

    if (completed === total) return "MET";
    if (completed > 0) return "IN_PROGRESS";
    return "PENDING";
  };

  const activeStepData = useMemo(() => {
    return steps.find(s => s.id === activeStep) || steps[0];
  }, [steps, activeStep]);

  return (
    <div id="roadmap-section" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* SECTION HEADER & SCORE */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
            Sovereign EU DPO Qualification & Compliance Roadmap
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            A granular, statutory compliance framework verifying DPO qualifications, position independence, and credentials under GDPR.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Roadmap Readiness</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-sm font-extrabold font-mono ${
                overallProgress === 100 ? "text-emerald-600" : overallProgress >= 50 ? "text-indigo-600" : "text-amber-600"
              }`}>
                {overallProgress}% COMPLETE
              </span>
              <div className="w-24 bg-slate-100 border border-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    overallProgress === 100 ? "bg-emerald-500" : overallProgress >= 50 ? "bg-indigo-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleResetChecklist}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 bg-white"
            title="Reset checklist state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ROADMAP LAYOUT: SIDEBAR TABS & CONTENT DETAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* SIDEBAR NAVIGATION (STEP LIST) */}
        <div className="lg:col-span-4 border-r border-slate-100 bg-slate-50/20 p-3.5 space-y-1.5">
          {steps.map(s => {
            const status = getStepCompletionStatus(s.id);
            const StepIcon = s.icon;
            const isActive = activeStep === s.id;

            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border ${
                  isActive 
                    ? "bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-50" 
                    : "border-transparent hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-600" 
                    : "bg-slate-100 text-slate-500"
                }`}>
                  <StepIcon className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-0.5 flex-grow min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">{s.article}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase ${
                      status === "MET" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : status === "IN_PROGRESS" 
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100 animate-pulse" 
                        : "bg-slate-100 text-slate-500 border border-slate-200/50"
                    }`}>
                      {status === "MET" ? "MET" : status === "IN_PROGRESS" ? "IN PROGRESS" : "PENDING"}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 truncate">{s.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate leading-relaxed">{s.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* STEP DETAILS & INTERACTION PANE */}
        <div className="lg:col-span-8 p-4 sm:p-5 lg:p-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header info for active step */}
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wide">
                  Step {activeStepData.id} of 5 — GDPR Governance
                </span>
                <span className="font-mono text-xs font-bold text-indigo-600 flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                  <Scale className="w-3.5 h-3.5" />
                  {activeStepData.article}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-2 flex items-center gap-2">
                <activeStepData.icon className="w-5 h-5 text-indigo-600" />
                {activeStepData.title} Requirement
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {activeStepData.description}
              </p>
            </div>

            {/* INTERACTIVE COMPONENT FOR STEP 1: Assessment questionnaire */}
            {activeStep === 1 && (
              <div className="bg-slate-50/80 border border-slate-200/60 p-4.5 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                  <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    Interactive Appointment Threshold Assessment
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isAppointmentMandatory ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  }`}>
                    {isAppointmentMandatory ? "APPOINTMENT MANDATORY" : "VOLUNTARY / OPTIONAL"}
                  </span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                  <label className="flex items-start justify-between gap-4 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="space-y-0.5 max-w-lg">
                      <span className="font-bold text-slate-800">1. Are you a Public Authority or Body?</span>
                      <p className="text-[11px] text-slate-500">Excluding courts acting in their judicial capacity (GDPR Art. 37.1.a).</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={qPublicAuth}
                      onChange={() => setQPublicAuth(!qPublicAuth)}
                      className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 rounded border-slate-300 mt-1 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-4 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="space-y-0.5 max-w-lg">
                      <span className="font-bold text-slate-800">2. Are core activities regular and systematic monitoring on a large scale?</span>
                      <p className="text-[11px] text-slate-500">For example: behavioral tracking, geolocalisation routing, or user profiling (Art. 37.1.b).</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={qLargeScaleMonitoring}
                      onChange={() => setQLargeScaleMonitoring(!qLargeScaleMonitoring)}
                      className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 rounded border-slate-300 mt-1 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-4 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="space-y-0.5 max-w-lg">
                      <span className="font-bold text-slate-800">3. Are core activities large-scale processing of sensitive data?</span>
                      <p className="text-[11px] text-slate-500">Special categories: medical records, biometric data, genetic profiles, or criminal data (Art. 37.1.c).</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={qLargeScaleSensitive}
                      onChange={() => setQLargeScaleSensitive(!qLargeScaleSensitive)}
                      className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 rounded border-slate-300 mt-1 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* EXPLANATIONS AND CHECKBOXES LIST */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statutory Evidence Check</h4>
              <div className="space-y-2.5">
                {activeStepData.requirements.map(req => {
                  const isChecked = req.isAuto ? req.status : req.status;

                  return (
                    <div 
                      key={req.key} 
                      className={`p-3.5 rounded-xl border flex items-start gap-3.5 transition-all ${
                        isChecked 
                          ? "bg-emerald-50/20 border-emerald-100/70" 
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="pt-0.5 flex-shrink-0">
                        {req.isAuto ? (
                          isChecked ? (
                            <div className="p-1 rounded-full bg-emerald-100 text-emerald-700" title="Auto-verified from ledger data">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-bold bg-slate-50" title="System verification pending">
                              ...
                            </div>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleCheck(req.key)}
                            className={`w-5 h-5 rounded border transition-all flex items-center justify-center cursor-pointer ${
                              isChecked 
                                ? "bg-indigo-600 border-indigo-600 text-white" 
                                : "border-slate-300 hover:border-indigo-500 bg-white"
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </button>
                        )}
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-grow">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-bold leading-none ${isChecked ? "text-slate-800 line-through opacity-85" : "text-slate-800"}`}>
                            {req.label}
                          </span>
                          {req.isAuto && (
                            <span className={`text-[8px] font-extrabold font-mono uppercase px-1.5 py-0.5 rounded ${
                              isChecked ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                            }`}>
                              {isChecked ? "System Checked" : "System Evaluation"}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          {req.hint}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DYNAMIC ACTION TRIGGER AT FOOT OF STEP */}
          <div className="pt-5 border-t border-slate-100 mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs bg-slate-50/50 p-4 rounded-xl">
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Complete each gate to build audit-ready documentation.</span>
            </div>

            {activeStep === 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(2);
                    document.getElementById("roadmap-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                >
                  Configure Appointment
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {activeStep === 2 && (
              <div className="flex gap-2">
                {!isDpoRegistered ? (
                  <button
                    type="button"
                    onClick={onLaunchAppoint}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4" />
                    Appoint Officer Now
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStep(3);
                      document.getElementById("roadmap-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                  >
                    Assess Position Independence
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {activeStep === 3 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(4);
                    document.getElementById("roadmap-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                >
                  Verify Publicity Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {activeStep === 4 && (
              <div className="flex gap-2">
                {!hasVerifiedAppointmentLetter ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onOpenUpload}
                      className="px-3.5 py-1.5 border border-slate-200 hover:bg-white bg-white/70 text-slate-700 font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Letter
                    </button>
                    <button
                      type="button"
                      onClick={onLaunchWizard}
                      className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Run Verification Wizard
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStep(5);
                      document.getElementById("roadmap-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                  >
                    Education & Task Review
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {activeStep === 5 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("vault-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  Go to Evidence Vault
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DYNAMIC COMPILATION CONSOLE CARD */}
      <div className="border-t border-slate-200 bg-slate-50/40 p-4 sm:p-5 lg:p-6 flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-600" />
              Sovereign EU Attestation Document Generator & Compiler
            </h4>
            <p className="text-xs text-slate-500 max-w-2xl">
              Formally aggregate appointed officer registries, verified CIPP/E credentials, and supporting Evidence Vault files into an audit-ready **GDPR Article 37 Attestation Statement**.
            </p>
          </div>
          {onGenerateAttestation && (
            <button
              onClick={onGenerateAttestation}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Open Global Report Panel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* SELECTION CONFIGURATOR (LEFT 7 COLS) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
            <div className="space-y-3">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                1. Select Target Officer Registry
              </label>
              {certifications.length === 0 ? (
                <div className="p-3 border border-dashed border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-500 italic text-center">
                  No appointed officers registered on ledger.
                </div>
              ) : (
                <select
                  value={selectedDpoId}
                  onChange={(e) => {
                    setSelectedDpoId(e.target.value);
                    setCompileSuccess(false);
                  }}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {certifications.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.cert_name} ({c.cert_number})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                  2. Select Supporting Evidence Vault Files
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedDocIds.length === documents.length) {
                      setSelectedDocIds([]);
                    } else {
                      setSelectedDocIds(documents.map(d => d.id));
                    }
                    setCompileSuccess(false);
                  }}
                  className="text-[10px] text-indigo-600 font-extrabold hover:underline"
                >
                  {selectedDocIds.length === documents.length ? "Clear All" : "Select All"}
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="p-4 border border-dashed border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-500 text-center">
                  No files uploaded. Drop training certificates or appointment files in the uploader below first.
                </div>
              ) : (
                <div className="border border-slate-100 rounded-lg max-h-40 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {documents.map(doc => {
                    const isChecked = selectedDocIds.includes(doc.id);
                    return (
                      <label
                        key={doc.id}
                        className="flex items-start gap-3 p-2.5 hover:bg-slate-50/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setCompileSuccess(false);
                            if (isChecked) {
                              setSelectedDocIds(prev => prev.filter(id => id !== doc.id));
                            } else {
                              setSelectedDocIds(prev => [...prev, doc.id]);
                            }
                          }}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 border-slate-300"
                        />
                        <div className="min-w-0 flex-grow">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-extrabold text-slate-800 truncate block">
                              {doc.name}
                            </span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.25 rounded-full ${
                              doc.status === "VERIFIED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {doc.doc_type} • {((doc.file_size || 0) / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={isCompiling || certifications.length === 0}
                onClick={() => {
                  if (!selectedDpoId) {
                    showToast("Please select or register an officer first.", 'warning');
                    return;
                  }
                  setIsCompiling(true);
                  setCompileProgress(0);
                  setCompileLogs([]);
                  setCompileSuccess(false);

                  const messages = [
                    "Initializing official EU compliance attestation protocols (GDPR Article 37)...",
                    "Validating identity registries and accrediting licensing records...",
                    `Extracting verification keys of ${selectedDocIds.length} attached credentials from the vault...`,
                    "Generating immutable compliance ledger certificate wrapper...",
                    "Applying official corporate seal and validator digital signature hashes...",
                    "Sovereign attestation report fully compiled and ready to download!"
                  ];

                  let idx = 0;
                  const intv = setInterval(() => {
                    if (idx < messages.length) {
                      setCompileLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${messages[idx]}`]);
                      setCompileProgress(Math.round(((idx + 1) / messages.length) * 100));
                      idx++;
                    } else {
                      clearInterval(intv);
                      setCompileSuccess(true);
                      setIsCompiling(false);
                      if (onGenerateAttestation) {
                        setTimeout(() => onGenerateAttestation(), 1000);
                      }
                    }
                  }, 650);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:shadow-indigo-100 flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Compiling Official Attestation Report ({compileProgress}%)
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Compile & Export Official EU DPO Attestation Document
                  </>
                )}
              </button>
            </div>
          </div>

          {/* COMPILED CONSOLE LOGS & FEEDBACK (RIGHT 5 COLS) */}
          <div className="lg:col-span-5 bg-slate-900 rounded-xl p-4 flex flex-col justify-between text-[11px] font-mono text-slate-300 min-h-[220px] shadow-inner relative border border-slate-800">
            {/* Ambient indicator lights */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isCompiling ? "bg-amber-400 animate-ping" : compileSuccess ? "bg-emerald-400" : "bg-slate-500"}`} />
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Compiler Terminal</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[200px] pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              <div className="text-slate-500 border-b border-slate-800 pb-1.5 mb-1.5 flex items-center justify-between">
                <span>SYSTEM JOURNAL LOGS</span>
                <span>STATUS: {isCompiling ? "RUNNING" : compileSuccess ? "SECURED" : "IDLE"}</span>
              </div>

              {compileLogs.length === 0 ? (
                <div className="text-slate-500 italic py-4">
                  Awaiting compliance compilation trigger... <br />
                  Select DPO and documents then hit compile.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {compileLogs.map((log, i) => (
                    <div key={i} className={i === compileLogs.length - 1 ? "text-indigo-400 animate-pulse font-bold" : "text-slate-400"}>
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {compileSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-lg space-y-2 text-emerald-300 text-xs"
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Attestation Generated Successfully!</span>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-400">
                  Cryptographic ledger proof has been successfully compiled and added to your evidence vault.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onGenerateAttestation) onGenerateAttestation();
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-3 py-1 rounded text-[10px] transition-colors"
                  >
                    View Attestation PDF Preview
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

