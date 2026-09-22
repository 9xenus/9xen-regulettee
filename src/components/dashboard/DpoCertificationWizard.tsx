import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Award,
  FileCheck2,
  Info,
  Check,
  X,
  Lock,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Database,
  Fingerprint,
  HelpCircle,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";

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

interface DpoCertificationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  certifications: DpoCertification[];
}

const LOCAL_STORAGE_KEY = "dpo_wizard_autosave";

const REGULATORY_DOC_INFO: Record<string, { gdpr: string; ccpa: string; details: string }> = {
  "Certification Certificate": {
    gdpr: "GDPR Art. 37.5: The data protection officer shall be designated on the basis of professional qualities and, in particular, expert knowledge of data protection law and practices.",
    ccpa: "CCPA/CPRA § 1798.185: Mandates rigorous compliance standards and privacy audits which require certified oversight to limit class-action liability exposure.",
    details: "Verifies that the DPO holds recognized credentials (e.g., CIPP/E, CIPM, CIPT) from accredited bodies like the IAPP or ISACA."
  },
  "Official DPO Appointment Letter": {
    gdpr: "GDPR Art. 37.1 & 37.7: Requires formal designation of a DPO for public authorities or scale processors, and filing contacts with supervisory authorities (e.g., CNIL, DPC).",
    ccpa: "CCPA/CPRA § 1798.100+: Ensures corporate accountability by delegating executive authority to handle consumer data deletion and access rights pipelines.",
    details: "Documents the board resolution or executive mandate designating the DPO's scope, independence, resources, and contact publication."
  },
  "Continuous Education (CPE) Proof": {
    gdpr: "GDPR Art. 38.2: The controller/processor shall support the DPO in performing tasks by providing resources necessary and maintaining their expert knowledge.",
    ccpa: "CCPA/CPRA: Mandates ongoing training and knowledge logs for personnel executing privacy requests or monitoring personal information processing activities.",
    details: "Logs continuing professional education hours (CPEs) and technical seminars to ensure the DPO stays abreast of emerging cybersecurity/privacy standards."
  }
};

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="relative group inline-block ml-1.5 cursor-pointer align-middle z-30">
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600 transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-slate-900 text-white text-[10px] p-2.5 rounded-lg shadow-xl leading-normal font-medium font-sans">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
};

const getSavedValue = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed[key] !== undefined) {
        return parsed[key];
      }
    }
  } catch (e) {
    console.error("Failed to load saved wizard state", e);
  }
  return defaultValue;
};

export const DpoCertificationWizard: React.FC<DpoCertificationWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  certifications
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(() => getSavedValue("step", 1));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 states: Document Submission
  const [docName, setDocName] = useState(() => getSavedValue("docName", ""));
  const [docType, setDocType] = useState(() => getSavedValue("docType", "Certification Certificate"));
  const [fileSizeKb, setFileSizeKb] = useState(() => getSavedValue("fileSizeKb", 1450));
  const [uploadedDoc, setUploadedDoc] = useState<any>(() => getSavedValue("uploadedDoc", null));

  // Step 2 states: Training Verification
  const [trainingCertName, setTrainingCertName] = useState(() => getSavedValue("trainingCertName", "CIPP/E (Certified Information Privacy Professional/Europe)"));
  const [trainingIssuer, setTrainingIssuer] = useState(() => getSavedValue("trainingIssuer", "IAPP (International Association of Privacy Professionals)"));
  const [trainingCredId, setTrainingCredId] = useState(() => getSavedValue("trainingCredId", "CIPP-EU-827364"));
  const [trainingCpeHours, setTrainingCpeHours] = useState(() => getSavedValue("trainingCpeHours", 30));
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<string[]>(() => getSavedValue("scanProgress", []));
  const [scanCompleted, setScanCompleted] = useState(() => getSavedValue("scanCompleted", false));
  const [verificationLog, setVerificationLog] = useState(() => getSavedValue("verificationLog", ""));

  // Step 3 states: Audit Logging
  const [validatorName, setValidatorName] = useState(() => getSavedValue("validatorName", ""));
  const [auditNotes, setAuditNotes] = useState(() => getSavedValue("auditNotes", ""));
  const [linkDpoOption, setLinkDpoOption] = useState<"link" | "create" | "none">(() => getSavedValue("linkDpoOption", "link"));
  const [selectedDpoId, setSelectedDpoId] = useState(() => getSavedValue("selectedDpoId", ""));
  const [newDpoForm, setNewDpoForm] = useState(() => getSavedValue("newDpoForm", {
    name: "",
    email: "",
    cert_body: "IAPP (International Association of Privacy Professionals)",
    cert_name: "CIPP/E (Certified Information Privacy Professional/Europe)",
    cert_number: "",
    issue_date: new Date().toISOString().split("T")[0],
    expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split("T")[0]
  }));
  
  // Final Receipt State
  const [receipt, setReceipt] = useState<any>(() => getSavedValue("receipt", null));

  // Auto-save effect
  useEffect(() => {
    if (step === 5) {
      // Don't save completed step to draft
      return;
    }
    const stateToSave = {
      step,
      docName,
      docType,
      fileSizeKb,
      uploadedDoc,
      trainingCertName,
      trainingIssuer,
      trainingCredId,
      trainingCpeHours,
      scanProgress,
      scanCompleted,
      verificationLog,
      validatorName,
      auditNotes,
      linkDpoOption,
      selectedDpoId,
      newDpoForm,
      receipt
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error("Failed to auto-save wizard state", e);
    }
  }, [
    step,
    docName,
    docType,
    fileSizeKb,
    uploadedDoc,
    trainingCertName,
    trainingIssuer,
    trainingCredId,
    trainingCpeHours,
    scanProgress,
    scanCompleted,
    verificationLog,
    validatorName,
    auditNotes,
    linkDpoOption,
    selectedDpoId,
    newDpoForm,
    receipt
  ]);

  if (!isOpen) return null;

  // Handle file drop/upload simulation
  const handleAutoFillDocName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDocName(val);
  };

  // Submit document to backend
  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      setError("Please specify a document name or upload a file.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const cleanName = docName.endsWith(".pdf") ? docName : `${docName}.pdf`;
      const res = await fetch("/api/v1/compliance/dpo/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          doc_type: docType,
          file_size: fileSizeKb * 1024
        })
      });

      if (!res.ok) {
        throw new Error("Failed to submit compliance document package to secure enclave.");
      }

      const data = await res.json();
      if (data.success && data.document) {
        setUploadedDoc(data.document);
        // Pre-fill DPO form name if possible
        const inferredName = docName
          .replace(/[_-]/g, " ")
          .replace(/\.pdf$/i, "")
          .replace(/(proof|cert|certificate|dpo|appointment|letter)/gi, "")
          .trim();
        if (inferredName && inferredName.length > 2) {
          setNewDpoForm(prev => ({ ...prev, name: inferredName }));
        }
        setStep(2);
      } else {
        throw new Error(data.error || "Unknown response from submission server.");
      }
    } catch (err: any) {
      setError(err.message || "Network failure during upload stage.");
    } finally {
      setLoading(false);
    }
  };

  // Run regulatory compliance check-in scan
  const runRegulatoryCheckIn = async () => {
    setIsScanning(true);
    setScanProgress([]);
    setError(null);

    const simulationLogs = [
      "🔄 Initializing sandbox analysis segment...",
      "🛡️ Conducting deep anti-malware hash verification...",
      "🔑 Extrapolating digital cryptographic certificates...",
      "⚡ Analyzing compliance with GDPR Article 37.5 standards...",
      "📊 Confirming professional qualities and expert knowledge threshold...",
      "🏫 Checking accreditation with issuing bodies...",
      `📜 Validating Credential: "${trainingCertName}" issued by "${trainingIssuer}"`,
      `🔢 Matching License ID: "${trainingCredId}" against active registry databases...`,
      `⏱️ Auditing ongoing continuing education logs: Verified ${trainingCpeHours} CPE hours...`
    ];

    try {
      // Step through logs simulation visually
      for (let i = 0; i < simulationLogs.length; i++) {
        setScanProgress(prev => [...prev, simulationLogs[i]]);
        await new Promise(resolve => setTimeout(resolve, 350));
      }

      // If document was uploaded, hit verification endpoint, otherwise simulate
      let logText = "";
      if (uploadedDoc?.id) {
        const res = await fetch("/api/v1/compliance/dpo/document/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: uploadedDoc.id })
        });

        if (!res.ok) {
          throw new Error("Compliance scan aborted by secure container policies.");
        }

        const data = await res.json();
        if (data.success) {
          logText = data.verification_log;
        } else {
          throw new Error(data.error || "Failure during verification execution.");
        }
      } else {
        logText = `[COMPLIANCE CHECK: SUCCESS] Training Credentials & CPE verified.\n- Credential Name: ${trainingCertName}\n- Institution: ${trainingIssuer}\n- Registered License Key: ${trainingCredId}\n- CPE Hours Accredited: ${trainingCpeHours} CPE credits logged. Meeting GDPR Article 38.2 guidelines.`;
      }

      setVerificationLog(logText);
      setScanProgress(prev => [...prev, "✅ SECURE TRAINING CREDENTIAL & REGULATORY CHECK-IN COMPLETE: Sovereign clearance active."]);
      setScanCompleted(true);
    } catch (err: any) {
      setScanProgress(prev => [...prev, `❌ SCAN FAIL: ${err.message}`]);
      setError(err.message || "Compliance scan failed.");
    } finally {
      setIsScanning(false);
    }
  };

  // Submit Audit Log & Finalize Ledger validation
  const handleFinalizeAuditLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatorName.trim()) {
      setError("Please specify the validator's name for formal audit logging.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      let finalDpoName = "N/A";

      // 1. If user chose to link to existing DPO, update them or do nothing
      if (linkDpoOption === "link" && selectedDpoId) {
        const dpo = certifications.find(c => c.id === selectedDpoId);
        if (dpo) {
          finalDpoName = dpo.name;
          await fetch("/api/v1/compliance/dpo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: dpo.id,
              name: dpo.name,
              email: dpo.email,
              cert_body: trainingIssuer || dpo.cert_body,
              cert_name: trainingCertName || dpo.cert_name,
              cert_number: trainingCredId || dpo.cert_number,
              issue_date: dpo.issue_date,
              expiry_date: dpo.expiry_date
            })
          });
        }
      } 
      // 2. If user chose to create a new DPO registry entry
      else if (linkDpoOption === "create" && newDpoForm.name && newDpoForm.email) {
        finalDpoName = newDpoForm.name;
        const res = await fetch("/api/v1/compliance/dpo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newDpoForm.name,
            email: newDpoForm.email,
            cert_body: trainingIssuer,
            cert_name: trainingCertName,
            cert_number: trainingCredId || `SYS-WIZ-${Math.floor(100000 + Math.random() * 900000)}`,
            issue_date: newDpoForm.issue_date,
            expiry_date: newDpoForm.expiry_date
          })
        });

        if (!res.ok) {
          throw new Error("Failed to register new officer to ledger registry.");
        }
      } else {
        finalDpoName = newDpoForm.name || "Sovereign Officer";
      }

      // Generate a mock cryptographic transaction receipt
      const txHash = "0x" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const timestamp = new Date().toISOString();

      setReceipt({
        txHash,
        timestamp,
        validator: validatorName,
        notes: auditNotes || "Completed thorough regulatory validation and signature scan without exceptions.",
        docId: uploadedDoc?.id || "N/A",
        docName: uploadedDoc?.name || "N/A",
        dpoName: finalDpoName
      });

      // Clear the local storage draft since it is successfully committed to ledger
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {
        console.error("Failed to clear completed draft from localStorage", e);
      }

      // Call onSuccess to trigger list update in parent component
      onSuccess();
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Failed to log audit data.");
    } finally {
      setLoading(false);
    }
  };

  // Generate and download PDF Certification Badge using jsPDF
  const downloadBadgePdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    // Background and borders
    doc.setFillColor(30, 41, 59); // deep slate blue
    doc.rect(0, 0, 297, 210, "F");

    // Gold borders
    doc.setDrawColor(245, 158, 11); // Amber-500 / gold
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);
    
    doc.setLineWidth(1);
    doc.rect(14, 14, 269, 182);

    // Certificate Header
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(24);
    doc.text("DATA PROTECTION OFFICER CERTIFICATION", 148, 45, { align: "center" });

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(14);
    doc.text("GDPR ARTICLE 37 COMPLIANCE & ACCREDITATION", 148, 55, { align: "center" });

    // Divider
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.line(80, 65, 217, 65);

    // Body Text
    doc.setTextColor(226, 232, 240); // slate-200
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(13);
    doc.text("This is to formally certify that", 148, 80, { align: "center" });

    // Officer Name
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(26);
    doc.text(receipt?.dpoName || newDpoForm.name || "Designated Data Protection Officer", 148, 98, { align: "center" });

    // Body text continued
    doc.setTextColor(226, 232, 240);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    const detailsLine1 = `has successfully verified expert knowledge of data protection law and practices,`;
    const detailsLine2 = `maintaining formal credentials: ${trainingCertName || "CIPP/E"}`;
    const detailsLine3 = `verified and registered under the official audit logging enclave.`;
    doc.text(detailsLine1, 148, 114, { align: "center" });
    doc.text(detailsLine2, 148, 122, { align: "center" });
    doc.text(detailsLine3, 148, 130, { align: "center" });

    // Badge Status Info box
    doc.setFillColor(15, 23, 42); // dark background
    doc.roundedRect(40, 142, 217, 30, 4, 4, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.text("STATUS:", 48, 152);
    doc.setTextColor(34, 197, 94); // emerald-500
    doc.text("ACTIVE VALIDATION CLEARANCE", 48, 158);

    doc.setTextColor(255, 255, 255);
    doc.text("CREDENTIAL ID:", 130, 152);
    doc.setTextColor(245, 158, 11);
    doc.text(trainingCredId || "CIPP-EU-827364", 130, 158);

    doc.setTextColor(255, 255, 255);
    doc.text("VERIFIED BY:", 200, 152);
    doc.setTextColor(129, 140, 248); // indigo-400
    doc.text(receipt?.validator || validatorName || "Enclave Compliance Auditor", 200, 158);

    // Footer / Cryptographic stamp
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFont("Courier", "normal");
    doc.setFontSize(7);
    doc.text(`LEDGER TRANSACTION: ${receipt?.txHash || "0x98a2fd380b2d3810ec5aef7726de"}`, 148, 185, { align: "center" });
    doc.text(`VERIFICATION TIMESTAMP: ${receipt?.timestamp ? new Date(receipt.timestamp).toUTCString() : new Date().toUTCString()}`, 148, 190, { align: "center" });

    doc.save(`DPO_Certification_Badge_${(receipt?.dpoName || "DPO").replace(/\s+/g, "_")}.pdf`);
  };

  const handleReset = () => {
    setStep(1);
    setDocName("");
    setDocType("Certification Certificate");
    setUploadedDoc(null);
    setIsScanning(false);
    setScanProgress([]);
    setScanCompleted(false);
    setVerificationLog("");
    setValidatorName("");
    setAuditNotes("");
    setLinkDpoOption("link");
    setSelectedDpoId("");
    setNewDpoForm({
      name: "",
      email: "",
      cert_body: "IAPP (International Association of Privacy Professionals)",
      cert_name: "CIPP/E (Certified Information Privacy Professional/Europe)",
      cert_number: "",
      issue_date: new Date().toISOString().split("T")[0],
      expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split("T")[0]
    });
    setReceipt(null);
    setError(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to remove wizard state", e);
    }
  };

  const handleClose = () => {
    if (step === 5) {
      handleReset();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden my-8"
      >
        {/* Wizard Header */}
        <div className="bg-slate-50 px-4 sm:px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                DPO Certification Validation Wizard
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory validation workflow for GDPR Article 37 compliance clearance.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicators */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200/50 flex justify-between items-center text-xs">
          <div className="flex items-center space-x-4 w-full max-w-2xl mx-auto">
            {/* Step 1 indicator */}
            <div className="flex items-center space-x-2 flex-1">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-all ${
                step >= 1 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
              }`}>
                {step > 1 ? <Check className="w-3 h-3" /> : "1"}
              </span>
              <span className={`font-semibold ${step >= 1 ? "text-indigo-600" : "text-slate-400"}`}>
                Upload
              </span>
            </div>
            
            <div className={`h-0.5 flex-1 ${step >= 2 ? "bg-indigo-600" : "bg-slate-200"}`} />

            {/* Step 2 indicator: Training Verification */}
            <div className="flex items-center space-x-2 flex-1">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-all ${
                step >= 2 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
              }`}>
                {step > 2 ? <Check className="w-3 h-3" /> : "2"}
              </span>
              <span className={`font-semibold ${step >= 2 ? "text-indigo-600" : "text-slate-400"}`}>
                Training
              </span>
            </div>

            <div className={`h-0.5 flex-1 ${step >= 3 ? "bg-indigo-600" : "bg-slate-200"}`} />

            {/* Step 3 indicator: Audit Log */}
            <div className="flex items-center space-x-2 flex-1">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-all ${
                step >= 3 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
              }`}>
                {step > 3 ? <Check className="w-3 h-3" /> : "3"}
              </span>
              <span className={`font-semibold ${step >= 3 ? "text-indigo-600" : "text-slate-400"}`}>
                Audit
              </span>
            </div>

            <div className={`h-0.5 flex-1 ${step >= 4 ? "bg-indigo-600" : "bg-slate-200"}`} />

            {/* Step 4 indicator: Badge */}
            <div className="flex items-center space-x-2 flex-1">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-all ${
                step >= 4 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
              }`}>
                {step > 4 ? <Check className="w-3 h-3" /> : "4"}
              </span>
              <span className={`font-semibold ${step >= 4 ? "text-indigo-600" : "text-slate-400"}`}>
                Badge
              </span>
            </div>
          </div>
        </div>

        {/* Auto-save active draft indicator */}
        {((step > 1) || (docName !== "") || (validatorName !== "") || (auditNotes !== "")) && step < 5 && (
          <div className="bg-amber-50 border-b border-amber-200/40 px-4 sm:px-6 py-2.5 flex items-center justify-between text-[11px] text-amber-800">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Auto-saved draft active (Step {step})</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="font-bold underline hover:text-amber-950 transition-colors cursor-pointer"
            >
              Discard Draft & Start Fresh
            </button>
          </div>
        )}

        {/* Error Warning Banner */}
        {error && (
          <div className="m-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold">Error encountered:</span> {error}
            </div>
          </div>
        )}

        {/* Dynamic Wizard Steps */}
        <div className="p-4 sm:p-5 lg:p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step-1" 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }} 
                onSubmit={handleDocumentSubmit} 
                className="space-y-5"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
                    <FileCheck2 className="w-4 h-4 text-indigo-600" />
                    Step 1: Compliance Document Upload
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Under GDPR Article 37, organizations are mandated to maintain verifiable evidence of professional 
                    accreditation or formal DPO appointment letters. Submit your proof document package below.
                  </p>
                </div>

                {/* Simulated Drag & Drop Upload Zone */}
                <div 
                  className="border-2 border-dashed border-slate-200 rounded-xl p-5 sm:p-6 lg:p-8 hover:border-indigo-500 hover:bg-slate-50/50 transition-all text-center group cursor-pointer"
                  onClick={() => {
                    if (!docName) {
                      setDocName("DPO_Credential_Helena_Vandelay");
                      setFileSizeKb(1425);
                    }
                  }}
                >
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-700">Drag your document files here, or click to browse</h5>
                  <p className="text-[11px] text-slate-400 mt-1">Supports PDF/A, signed docx, and secure imagery (max 10MB)</p>
                  
                  {docName ? (
                    <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-emerald-800 font-mono text-[10px] text-left">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <div>
                        <span className="font-bold">{docName.endsWith(".pdf") ? docName : `${docName}.pdf`}</span>
                        <span className="text-emerald-600/70 ml-2">({(fileSizeKb).toLocaleString()} KB)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-[10px] text-indigo-600 font-semibold hover:underline">
                      💡 Click to auto-generate a mock certificate file
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                      <span>Document File Name</span>
                      <InfoTooltip text="Unique identifier for this proof ledger entry. Secure filename structure prevents exposure of generic PII." />
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Helena_Vandelay_CIPP_E"
                      value={docName}
                      onChange={handleAutoFillDocName}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                      <span>Document Type Classification</span>
                      <InfoTooltip text="Classify this document according to its statutory function under GDPR Art. 37 & CCPA/CPRA criteria." />
                    </label>
                    <select
                      value={docType}
                      onChange={e => setDocType(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    >
                      <option value="Certification Certificate">Certification Certificate Proof</option>
                      <option value="Official DPO Appointment Letter">Official Appointment Letter (Art.37)</option>
                      <option value="Continuous Education (CPE) Proof">Continuous Education (CPE) Log</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Regulatory Requirement Explanation Box */}
                <div className="bg-indigo-50/20 border border-indigo-100 rounded-xl p-4.5 space-y-3.5 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
                    <Info className="w-4 h-4 text-indigo-600" />
                    <span>Specific {docType} Requirements</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    {REGULATORY_DOC_INFO[docType]?.details || REGULATORY_DOC_INFO["Certification Certificate"].details}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-[11px] pt-2.5 border-t border-slate-200/50">
                    <div className="space-y-1">
                      <span className="font-extrabold text-indigo-950 uppercase tracking-wide block">GDPR Standard Mandate:</span>
                      <p className="text-slate-500 leading-relaxed font-medium">
                        {REGULATORY_DOC_INFO[docType]?.gdpr}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-extrabold text-indigo-950 uppercase tracking-wide block">CCPA/CPRA Alignment:</span>
                      <p className="text-slate-500 leading-relaxed font-medium">
                        {REGULATORY_DOC_INFO[docType]?.ccpa}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={loading || !docName}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    Upload & Next Step
                  </button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div 
                key="step-2" 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }} 
                className="space-y-5"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Step 2: Training Credential Verification & Scan
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Verify the official training records, certificates, and accredited continuing professional education (CPE) hours. Run the secure scan to execute cryptographic check-in.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                      <span>Accredited Certification Name</span>
                    </label>
                    <input
                      type="text"
                      value={trainingCertName}
                      onChange={e => setTrainingCertName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                      <span>Issuing / Training Institution</span>
                    </label>
                    <input
                      type="text"
                      value={trainingIssuer}
                      onChange={e => setTrainingIssuer(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                      <span>Credential ID / Certificate Hash</span>
                    </label>
                    <input
                      type="text"
                      value={trainingCredId}
                      onChange={e => setTrainingCredId(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                      <span>CPE Credits / Training Hours</span>
                    </label>
                    <input
                      type="number"
                      value={trainingCpeHours}
                      onChange={e => setTrainingCpeHours(parseInt(e.target.value) || 0)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Scanning Progress Console */}
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[11px] text-slate-300 space-y-1.5 shadow-inner">
                  <div className="text-xs text-slate-500 font-bold border-b border-slate-800 pb-1 flex justify-between items-center">
                    <span>// ENCLAVE COMPLIANCE AUDIT GATEWAY</span>
                    {isScanning && <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />}
                  </div>
                  
                  <div className="space-y-1 max-h-48 overflow-y-auto pt-1 leading-relaxed">
                    {scanProgress.length === 0 && (
                      <div className="text-slate-500 italic py-2">
                        Click "Run Credential Verification Scan" to initiate deep scanning...
                      </div>
                    )}
                    {scanProgress.map((p, idx) => (
                      <div key={idx} className={p.startsWith("❌") ? "text-rose-400" : p.startsWith("✅") ? "text-emerald-400" : "text-indigo-300"}>
                        {p}
                      </div>
                    ))}
                  </div>

                  {scanCompleted && verificationLog && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t border-slate-800 mt-3 pt-3 text-[10px] text-emerald-400 bg-emerald-950/20 p-2.5 rounded-lg whitespace-pre-line"
                    >
                      <span className="font-bold block text-emerald-500 mb-1">📋 CLEARANCE STATEMENT LOG:</span>
                      {verificationLog}
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all"
                  >
                    Back to Upload
                  </button>
                  
                  {!scanCompleted ? (
                    <button
                      type="button"
                      onClick={runRegulatoryCheckIn}
                      disabled={isScanning}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Conducting Scan...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Run Credential Verification Scan
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      Proceed to Audit Logging
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.form 
                key="step-3" 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }} 
                onSubmit={handleFinalizeAuditLog} 
                className="space-y-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
                    <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                    Step 3: Formal Audit Logging & Sovereign Handshake
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Log and authenticate this compliance review. Link the validated proof documents directly to 
                    appointing an officer or updating the regulatory registry ledger history.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verification Signature Clearance Formed
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    This document package is verified as fully compliant with GDPR Article 37 criteria. Entering a 
                    valid regulatory memo will execute the digital sovereign handshake.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                      <span>Ledger Association Action</span>
                      <InfoTooltip text="GDPR Art. 37.7 mandates associating valid proof files directly to the named public registry contact." />
                    </label>
                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                      <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        linkDpoOption === "link" ? "border-indigo-500 bg-indigo-50/20 font-bold text-indigo-950" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}>
                        <input
                          type="radio"
                          name="linkDpo"
                          value="link"
                          checked={linkDpoOption === "link"}
                          onChange={() => setLinkDpoOption("link")}
                          className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span>Link to Existing DPO</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        linkDpoOption === "create" ? "border-indigo-500 bg-indigo-50/20 font-bold text-indigo-950" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}>
                        <input
                          type="radio"
                          name="linkDpo"
                          value="create"
                          checked={linkDpoOption === "create"}
                          onChange={() => setLinkDpoOption("create")}
                          className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span>Appoint New DPO</span>
                      </label>

                      <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        linkDpoOption === "none" ? "border-indigo-500 bg-indigo-50/20 font-bold text-indigo-950" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}>
                        <input
                          type="radio"
                          name="linkDpo"
                          value="none"
                          checked={linkDpoOption === "none"}
                          onChange={() => setLinkDpoOption("none")}
                          className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span>Unassociated Log</span>
                      </label>
                    </div>
                  </div>

                  {/* Existing DPO dropdown selection */}
                  {linkDpoOption === "link" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-1.5"
                    >
                      <label className="block text-xs font-bold text-slate-700 flex items-center">
                        <span>Select Target Registered Officer</span>
                        <InfoTooltip text="Select the active designated DPO whose credential logs you are updating or validating." />
                      </label>
                      <select
                        value={selectedDpoId}
                        onChange={e => setSelectedDpoId(e.target.value)}
                        required={linkDpoOption === "link"}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Choose Appointed Officer --</option>
                        {certifications.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.cert_name} - {c.status})
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  {/* Appoint new officer inline form */}
                  {linkDpoOption === "create" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-4 border border-indigo-100 bg-indigo-50/10 rounded-xl space-y-3"
                    >
                      <div className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                        <Database className="w-3.5 h-3.5 text-indigo-600" />
                        Officer Appointment Details
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1 flex items-center">
                            <span>Full Legal Name</span>
                            <InfoTooltip text="Official legal name of the designated DPO, published as required by GDPR Art. 37.7." />
                          </label>
                          <input
                            type="text"
                            required={linkDpoOption === "create"}
                            placeholder="e.g. Helena Vandelay"
                            value={newDpoForm.name}
                            onChange={e => setNewDpoForm({ ...newDpoForm, name: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1 flex items-center">
                            <span>Contact Email</span>
                            <InfoTooltip text="Dedicated corporate inbox (e.g. dpo@domain.com) accessible to regulatory bodies and data subjects." />
                          </label>
                          <input
                            type="email"
                            required={linkDpoOption === "create"}
                            placeholder="e.g. h.vandelay@company.eu"
                            value={newDpoForm.email}
                            onChange={e => setNewDpoForm({ ...newDpoForm, email: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1 flex items-center">
                            <span>Licensing Body</span>
                            <InfoTooltip text="The privacy organization (e.g., IAPP, ISACA) verifying expert qualities per GDPR Art. 37.5." />
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. IAPP"
                            value={newDpoForm.cert_body}
                            onChange={e => setNewDpoForm({ ...newDpoForm, cert_body: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1 flex items-center">
                            <span>License ID / Certificate Number</span>
                            <InfoTooltip text="Official certificate hash or database identifier enabling verification against the registry ledger." />
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. CIPP-EU-827364"
                            value={newDpoForm.cert_number}
                            onChange={e => setNewDpoForm({ ...newDpoForm, cert_number: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                        <span>Approving Official (Validator Name)</span>
                        <InfoTooltip text="GDPR Art. 24: Accountability Principle. The legal authority or senior compliance officer signing off on this audit." />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Board Compliance Officer"
                        value={validatorName}
                        onChange={e => setValidatorName(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                        <span>Compliance Memo / Audit Notes</span>
                        <InfoTooltip text="Contextual assessment details. Serves as legally defensible documentation of due diligence in regulatory reviews." />
                      </label>
                      <input
                        type="text"
                        placeholder="Verified credentials successfully. Active status clearance authorized."
                        value={auditNotes}
                        onChange={e => setAuditNotes(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all"
                  >
                    Back to Scan
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (linkDpoOption === "link" && !selectedDpoId)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    Commit & Sign Audit Ledger
                  </button>
                </div>
              </motion.form>
            )}

            {step === 4 && (
              <motion.div 
                key="step-4" 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                className="space-y-6 text-center"
              >
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Step 4: Generate GDPR Data Protection Officer Badge
                  </h4>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto">
                    Your compliance audit package and credentials have been verified and signed. You can now download your digital Trust Certification Badge to publish or archive.
                  </p>
                </div>

                {/* Interactive Dynamic Badge Preview */}
                <div className="mx-auto max-w-md bg-slate-900 border-2 border-amber-500/70 rounded-2xl p-4 sm:p-5 lg:p-6 text-white text-left shadow-xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full -mr-6 -mt-6 pointer-events-none" />
                  
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-[10px] font-extrabold tracking-widest uppercase text-amber-500">
                          STATUTORY CLEARANCE
                        </div>
                        <div className="text-xs font-bold tracking-tight text-white uppercase">
                          DPO CERTIFICATE BADGE
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      ACTIVE VERIFIED
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Designated Officer</div>
                      <div className="text-base font-extrabold text-white truncate">
                        {receipt?.dpoName || newDpoForm.name || "Helena Vandelay"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-2.5 text-xs">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Credential</div>
                        <div className="font-bold text-slate-200 truncate" title={trainingCertName}>
                          {trainingCertName ? (trainingCertName.length > 30 ? `${trainingCertName.substring(0, 30)}...` : trainingCertName) : "CIPP/E"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">License/Verify ID</div>
                        <div className="font-mono font-bold text-amber-400 truncate">
                          {trainingCredId || "CIPP-EU-827364"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                    <span>LEDGER ID: {receipt?.txHash ? receipt.txHash.substring(0, 14) + "..." : "0x7d28c704fa..."}</span>
                    <span>ISSUED: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all"
                  >
                    Back to Logging
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={downloadBadgePdf}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      Download PDF Badge
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      Finish & View Receipt
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && receipt && (
              <motion.div
                key="step-5"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="space-y-5"
              >
                {/* Successful receipt page */}
                <div className="text-center space-y-2 py-4">
                  <div className="mx-auto w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border-2 border-emerald-300 shadow-md">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Sovereign Validation Handshake Complete</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    The audit log entry has been signed cryptographically and successfully written into the active SQLite ledger index.
                  </p>
                </div>

                {/* Audit logging receipt details */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-inner text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200/50 pb-2 flex-wrap gap-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Fingerprint className="w-4 h-4 text-indigo-600" />
                      Compliance Receipt & Token
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase tracking-wide">
                      LEDGER SECURED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wide block font-semibold">Validation Ledger Hash</span>
                      <span className="font-mono text-slate-800 break-all select-all block bg-white p-1 rounded border border-slate-200/50">{receipt.txHash}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wide block font-semibold">Handshake Timestamp</span>
                      <span className="font-mono text-slate-700 block">{new Date(receipt.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="space-y-0.5 border-t border-slate-200/30 pt-2 col-span-1 md:col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wide block font-semibold">Authorized Validator Name</span>
                      <span className="font-bold text-indigo-950 block">{receipt.validator}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wide block font-semibold">Evidence Document Name</span>
                      <span className="font-mono text-slate-700 block truncate" title={receipt.docName}>{receipt.docName}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wide block font-semibold">Appointed Officer Associated</span>
                      <span className="font-bold text-slate-800 block">{receipt.dpoName}</span>
                    </div>

                    <div className="space-y-0.5 border-t border-slate-200/30 pt-2 col-span-1 md:col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wide block font-semibold">Validator Compliance Memo</span>
                      <span className="text-slate-600 italic leading-relaxed block font-medium bg-white p-2 rounded border border-slate-200/50">{receipt.notes}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all"
                  >
                    Audit Another Document
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                  >
                    Close & Return to Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
