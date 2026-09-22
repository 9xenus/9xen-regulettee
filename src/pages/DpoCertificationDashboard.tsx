import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Upload,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Calendar,
  Award,
  FileCheck2,
  Loader2,
  Info,
  Check,
  X,
  FileAxis3d,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ComplianceCalendar, CalendarEvent } from "../components/dashboard/ComplianceCalendar";
import { DpoCalendar } from "../components/dashboard/DpoCalendar";
import { DpoCertificationWizard } from "../components/dashboard/DpoCertificationWizard";
import { DpoReportPreviewModal } from "../components/dashboard/DpoReportPreviewModal";
import { DpoComplianceChecklist } from "../components/dashboard/DpoComplianceChecklist";
import { DpoDragDropUpload } from "../components/dashboard/DpoDragDropUpload";
import { DpoAuditLog } from "../components/dashboard/DpoAuditLog";
import { useNotification } from '../context/NotificationContext';

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

interface ComplianceAlert {
  id: string;
  dpoId: string;
  dpoName: string;
  email: string;
  certName: string;
  certNumber: string;
  expiryDate: string;
  status: string;
  daysRemaining: number;
  severity: 'CRITICAL' | 'HIGH';
  message: string;
}

export interface DpoTrainingRecord {
  id: string;
  dpo_id: string;
  course_name: string;
  cpe_hours: number;
  completed_at: string | null;
  status: 'PENDING' | 'COMPLETED';
}

export const DpoCertificationDashboard: React.FC = () => {
  const { showToast } = useNotification();
  // Portal state
  const [certifications, setCertifications] = useState<DpoCertification[]>([]);
  const [documents, setDocuments] = useState<DpoDocument[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<DpoTrainingRecord[]>([]);
  const [selectedDpoForTraining, setSelectedDpoForTraining] = useState<string | null>(null);
  const [isProcessingRenewal, setIsProcessingRenewal] = useState<string | null>(null);
  const [showAutoIssueModal, setShowAutoIssueModal] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [autoIssueForm, setAutoIssueForm] = useState({
    name: "",
    email: "",
    cert_body: "IAPP (International Association of Privacy Professionals)",
    cert_name: "CIPP/E (Certified Information Privacy Professional/Europe)"
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  
  // Calendar state is now handled internally by ComplianceCalendar.
  // We just need to map our data to the common CalendarEvent format.
  const calendarEvents = useMemo(() => {
    const certEvents: CalendarEvent[] = certifications.map(cert => ({
      id: cert.id,
      title: `${cert.name} (${cert.cert_name})`,
      date: cert.expiry_date,
      type: 'certification',
      description: cert.cert_body
    }));
    
    // Hardcoded regulatory deadlines for demonstration
    const regEvents: CalendarEvent[] = [
      { id: 'reg-1', title: 'NIS2 Directive Enforcement', date: '2026-09-01', type: 'regulatory', description: 'Mandatory implementation for critical infrastructure providers.' },
      { id: 'reg-2', title: 'AI Act Governance Review', date: '2026-11-15', type: 'regulatory', description: 'First audit cycle for high-risk AI models.' },
      { id: 'reg-3', title: 'Data Sovereignty Deadline', date: '2026-12-31', type: 'regulatory', description: 'Completion of regional database migration requirements.' },
      { id: 'reg-4', title: 'GDPR Updated Framework', date: '2026-05-15', type: 'regulatory', description: 'Alignment with new cross-border data transfer protocols.' },
    ];
    
    return [...certEvents, ...regEvents];
  }, [certifications]);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDpo, setEditingDpo] = useState<DpoCertification | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    cert_body: "IAPP (International Association of Privacy Professionals)",
    cert_name: "CIPP/E (Certified Information Privacy Professional/Europe)",
    cert_number: "",
    issue_date: "",
    expiry_date: "",
  });

  // Document upload state
  const [uploadFormData, setUploadFormData] = useState({
    name: "",
    doc_type: "Certification Certificate",
    file_size_kb: 1200,
  });
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Verification process console
  const [activeVerificationId, setActiveVerificationId] = useState<string | null>(null);
  const [verificationConsole, setVerificationConsole] = useState<string[]>([]);
  const [showLogForDocId, setShowLogForDocId] = useState<string | null>(null);

  // Fetch initial ledger status from sqlite api
  const fetchDpoData = async () => {
    try {
      setLoading(true);
      const res = await fetchWithRetry("/api/v1/compliance/dpo");
      if (!res.ok) throw new Error("Failed to load DPO registry state");
      const data = await res.json();
      if (data.success) {
        setCertifications(data.certifications || []);
        setDocuments(data.documents || []);
        setAlerts(data.alerts || []);
        setTrainingRecords(data.trainingRecords || []);
        
        // Auto-select first DPO for training view if none selected
        if (data.certifications && data.certifications.length > 0 && !selectedDpoForTraining) {
          setSelectedDpoForTraining(data.certifications[0].id);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Connection failure to sovereign compliance service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDpoData();
  }, []);

  // Submit DPO registration / updates
  const handleSaveDpo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.expiry_date) {
      showToast("Name, email and expiration date are mandatory.", 'warning');
      return;
    }

    try {
      setActionLoading("save_dpo");
      const res = await fetchWithRetry("/api/v1/compliance/dpo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Server error during register operations");
      
      // Reset state and refresh
      setShowAddModal(false);
      setEditingDpo(null);
      setFormData({
        id: "",
        name: "",
        email: "",
        cert_body: "IAPP (International Association of Privacy Professionals)",
        cert_name: "CIPP/E (Certified Information Privacy Professional/Europe)",
        cert_number: "",
        issue_date: "",
        expiry_date: "",
      });
      await fetchDpoData();
    } catch (err: any) {
      showToast("Failed to save record: " + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete DPO
  const handleDeleteDpo = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this officer credential from the ledger?")) return;
    try {
      setActionLoading(`delete_${id}`);
      const res = await fetchWithRetry(`/api/v1/compliance/dpo/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Revocation operation failed");
      await fetchDpoData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Submit Document upload
  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFormData.name) {
      showToast("Please specify a document name.", 'warning');
      return;
    }

    try {
      setActionLoading("upload_doc");
      const res = await fetchWithRetry("/api/v1/compliance/dpo/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uploadFormData.name.endsWith(".pdf") ? uploadFormData.name : `${uploadFormData.name}.pdf`,
          doc_type: uploadFormData.doc_type,
          file_size: uploadFormData.file_size_kb * 1024,
        }),
      });

      if (!res.ok) throw new Error("Upload gateway rejected file package");

      // Reset
      setShowUploadForm(false);
      setUploadFormData({
        name: "",
        doc_type: "Certification Certificate",
        file_size_kb: 1200,
      });
      await fetchDpoData();
    } catch (err: any) {
      showToast("Failed to process document upload: " + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Trigger automated cryptographic / regulatory signature scan over document
  const handleVerifyDocument = async (id: string) => {
    try {
      setActiveVerificationId(id);
      setVerificationConsole([]);

      // Micro-timings to simulate compliance engine evaluation steps
      const steps = [
        "Incepting secure isolated enclave wrapper...",
        "Evaluating structural file integrity and checking malware hashes...",
        "Decrypting digital signatures using national supervisory trust roots...",
        "Checking compliance against GDPR Article 37 appointment guidelines...",
        "Matching cert body license key against real-time regulatory registry records...",
        "Compiling formal compliance audit report ledger entry..."
      ];

      for (let i = 0; i < steps.length; i++) {
        setVerificationConsole(prev => [...prev, `[LOG] ${steps[i]}`]);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const res = await fetchWithRetry("/api/v1/compliance/dpo/document/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Document analysis scan halted unexpectedly");
      const data = await res.json();
      
      if (data.success) {
        setVerificationConsole(prev => [...prev, "[SUCCESS] Verification scan completed safely. Database status upgraded."]);
        await new Promise(resolve => setTimeout(resolve, 600));
        await fetchDpoData();
      }
    } catch (err: any) {
      setVerificationConsole(prev => [...prev, `[ERROR] Analysis halted: ${err.message}`]);
    } finally {
      setActiveVerificationId(null);
    }
  };

  // Delete Document
  const handleDeleteDoc = async (id: string) => {
    if (!confirm("Remove this verification document from compliance history?")) return;
    try {
      setActionLoading(`delete_doc_${id}`);
      const res = await fetchWithRetry(`/api/v1/compliance/dpo/document/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Deletion failed");
      await fetchDpoData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Complete a regulatory training course
  const handleCompleteTraining = async (dpoId: string, courseId: string) => {
    try {
      setActionLoading(`complete_training_${courseId}`);
      const res = await fetchWithRetry("/api/v1/compliance/dpo/training/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dpoId, courseId }),
      });
      if (!res.ok) throw new Error("Failed to complete training course");
      const data = await res.json();
      if (data.success) {
        await fetchDpoData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Perform automated certification renewal (guarded by CPE requirement check)
  const handleRenewDpo = async (id: string) => {
    try {
      setIsProcessingRenewal(id);
      const res = await fetchWithRetry("/api/v1/compliance/dpo/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Automated renewal failed");
      }
      showToast(`Automated Renewal Succeeded! New Expiry: ${data.expiryDate}. Evidence added to vault.`, 'success');
      await fetchDpoData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessingRenewal(null);
    }
  };

  // Onboard and issue credentials automatically
  const handleAutoIssueDpo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoIssueForm.name || !autoIssueForm.email) {
      showToast("Please specify name and email.", 'warning');
      return;
    }
    try {
      setActionLoading("auto_issue_dpo");
      const res = await fetchWithRetry("/api/v1/compliance/dpo/issue-automated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(autoIssueForm),
      });
      if (!res.ok) throw new Error("Failed to issue credential");
      const data = await res.json();
      if (data.success) {
        setShowAutoIssueModal(false);
        setAutoIssueForm({
          name: "",
          email: "",
          cert_body: "IAPP (International Association of Privacy Professionals)",
          cert_name: "CIPP/E (Certified Information Privacy Professional/Europe)"
        });
        showToast("Instant credential issuance completed! Verified records and certifications added to system ledger.", 'success');
        await fetchDpoData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Open modal in edit mode
  const startEdit = (dpo: DpoCertification) => {
    setEditingDpo(dpo);
    setFormData({
      id: dpo.id,
      name: dpo.name,
      email: dpo.email,
      cert_body: dpo.cert_body,
      cert_name: dpo.cert_name,
      cert_number: dpo.cert_number,
      issue_date: dpo.issue_date,
      expiry_date: dpo.expiry_date,
    });
    setShowAddModal(true);
  };

  // Global Compliance Grade / Verdict card helper
  const complianceStatusSummary = useMemo(() => {
    const hasExpired = certifications.some(c => c.status === "EXPIRED");
    const hasWarning = certifications.some(c => c.status === "WARNING");
    const docVerifiedCount = documents.filter(d => d.status === "VERIFIED").length;
    
    if (certifications.length === 0) {
      return {
        label: "NOT APPOINTED",
        colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/30",
        icon: AlertTriangle,
        description: "No certified Data Protection Officers are currently registered on the ledger. Appoint one immediately to meet statutory rules."
      };
    }
    if (hasExpired) {
      return {
        label: "NON-COMPLIANT",
        colorClass: "text-rose-500 bg-rose-500/10 border-rose-500/30",
        icon: ShieldAlert,
        description: "CRITICAL BREACH: An active, certified DPO is mandatory under Article 37. Register a valid certified DPO immediately."
      };
    }
    if (hasWarning) {
      return {
        label: "ACTION REQUIRED",
        colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/30",
        icon: AlertTriangle,
        description: "WARNING: You have registered officers whose compliance certificates expire shortly. Submit renewal files."
      };
    }
    return {
      label: "FULLY COMPLIANT",
      colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
      icon: ShieldCheck,
      description: "GDPR Article 37 status active and verified. All officer certifications are current, active, and fully credentialed."
    };
  }, [certifications, documents]);

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      
      {/* HEADER HERO AREA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-600">
              Sovereign Compliance Add-on
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            DPO Certification Management Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Formal registry, real-time certification audit ledger, and automated proof upload center to guarantee adherence 
            to **GDPR Article 37** statutory mandates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsReportPreviewOpen(true);
            }}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            Preview & Export Report
          </button>
          <button
            onClick={fetchDpoData}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Reload registry ledgers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setEditingDpo(null);
              setFormData({
                id: "",
                name: "",
                email: "",
                cert_body: "IAPP (International Association of Privacy Professionals)",
                cert_name: "CIPP/E (Certified Information Privacy Professional/Europe)",
                cert_number: "",
                issue_date: "",
                expiry_date: "",
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Appoint Certified Officer
          </button>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow-indigo-100 transition-all border border-indigo-500/10"
          >
            <FileCheck2 className="w-4 h-4 text-indigo-100 animate-pulse" />
            Launch Validation Wizard
          </button>
          <button
            onClick={() => {
              setAutoIssueForm({
                name: "",
                email: "",
                cert_body: "IAPP (International Association of Privacy Professionals)",
                cert_name: "CIPP/E (Certified Information Privacy Professional/Europe)"
              });
              setShowAutoIssueModal(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <Award className="w-4 h-4" />
            Fast-Track Auto-Issuance
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* COMPLIANCE STATUS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status indicator */}
        <div className={`p-5 rounded-xl border ${complianceStatusSummary.colorClass} flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Compliance Status</p>
              <h3 className="text-lg font-bold mt-1">{complianceStatusSummary.label}</h3>
            </div>
            <complianceStatusSummary.icon className="w-6 h-6 flex-shrink-0" />
          </div>
          <p className="text-xs leading-relaxed mt-4 opacity-90">{complianceStatusSummary.description}</p>
        </div>

        {/* Total Appointed */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Appointed Officers</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900">{certifications.length}</h3>
            </div>
            <Award className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Registered officers with valid credentials loaded to the secure compliance database.
          </p>
        </div>

        {/* Expiration warning alerts */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Expiration Alerts</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900">
                {alerts.length > 0 ? (
                  <span className="text-rose-600">{alerts.length} Active</span>
                ) : (
                  <span className="text-emerald-600">0 Alerts</span>
                )}
              </h3>
            </div>
            <AlertTriangle className={`w-6 h-6 ${alerts.length > 0 ? "text-rose-500" : "text-slate-400"}`} />
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Certifications with active expiration notices or immediate regulatory violations.
          </p>
        </div>

        {/* Proof Document Verification */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Evidence Vault</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900">
                {documents.filter(d => d.status === "VERIFIED").length} / {documents.length} Verified
              </h3>
            </div>
            <FileCheck2 className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Credential proofs processed and digitally verified through cryptographic scanning mechanisms.
          </p>
        </div>
      </div>

      {/* EXPIRATION EMERGENCY BROADCAST PANEL */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 overflow-hidden">
          <div className="bg-rose-100/60 px-5 py-3 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm uppercase tracking-wide">
              <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
              Sovereign Expiration Audit Alert Center
            </div>
            <span className="text-xs bg-rose-600 text-white font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Critical Mandate Alert
            </span>
          </div>
          <div className="p-5 space-y-3.5">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-sm ${
                  alert.severity === 'CRITICAL' ? 'border-rose-200/80 bg-rose-50/10' : 'border-amber-200/80 bg-amber-50/10'
                }`}
              >
                <div className="space-y-1 max-w-4xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {alert.severity}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">
                      {alert.dpoName} — {alert.certName}
                    </h4>
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      ID: {alert.certNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {alert.message}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      const matched = certifications.find(c => c.id === alert.dpoId);
                      if (matched) startEdit(matched);
                    }}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Renew Credentials
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadForm(true);
                      setUploadFormData({
                        name: `${alert.dpoName.replace(/\s+/g, '_')}_Renewal_Proof`,
                        doc_type: "Certification Certificate",
                        file_size_kb: 1400
                      });
                      document.getElementById("vault-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Proof
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATUTORY DPO QUALIFICATION & COMPLIANCE ROADMAP */}
      <DpoComplianceChecklist
        certifications={certifications}
        documents={documents}
        trainingRecords={trainingRecords}
        onLaunchWizard={() => setIsWizardOpen(true)}
        onLaunchAppoint={() => {
          setEditingDpo(null);
          setFormData({
            id: "",
            name: "",
            email: "",
            cert_body: "IAPP (International Association of Privacy Professionals)",
            cert_name: "CIPP/E (Certified Information Privacy Professional/Europe)",
            cert_number: "",
            issue_date: "",
            expiry_date: "",
          });
          setShowAddModal(true);
        }}
        onOpenUpload={() => {
          setShowUploadForm(true);
          document.getElementById("vault-section")?.scrollIntoView({ behavior: "smooth" });
        }}
        onGenerateAttestation={() => setIsReportPreviewOpen(true)}
      />

      {/* CORE SPLIT: ACTIVE DIRECTORY & VERIFICATION VAULT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* LEFT COMPONENT: APPOINTED OFFICERS DIRECTORY OR CALENDAR */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                {viewMode === "list" ? "Active Certified Officers Directory" : "Certification Deadline Calendar"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {viewMode === "list" 
                  ? "Statutory representatives under GDPR regulations." 
                  : "Color-coded monthly view of upcoming certification renewal deadlines."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    viewMode === "list" 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    viewMode === "calendar" 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Calendar
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 flex-grow">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-xs font-medium">Reading secure compliance ledger...</p>
              </div>
            ) : viewMode === "calendar" ? (
              <DpoCalendar />
            ) : certifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-lg p-4 sm:p-5 lg:p-6">
                <ShieldAlert className="w-10 h-10 text-slate-300 mb-2" />
                <h4 className="text-sm font-bold text-slate-700">Empty Officer Registry</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                  No registered Data Protection Officers exist. You are currently in violation of compliance rules 
                  if your operations trigger mandatory appointment conditions.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                >
                  Appoint Officer Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {certifications.map(dpo => (
                  <div 
                    key={dpo.id} 
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <h4 className="text-sm font-bold text-slate-800">{dpo.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          dpo.status === 'EXPIRED' 
                            ? 'bg-rose-100 text-rose-700' 
                            : dpo.status === 'WARNING' 
                            ? 'bg-amber-100 text-amber-700 animate-pulse' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {dpo.status === 'EXPIRED' ? 'EXPIRED' : dpo.status === 'WARNING' ? 'EXPIRING' : 'VALID'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{dpo.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{dpo.cert_body}</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-1 md:col-span-2 font-medium text-slate-700 mt-0.5">
                          <Award className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                          <span>{dpo.cert_name} ({dpo.cert_number})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-300" />
                          Issued: {dpo.issue_date}
                        </span>
                        <span className={`flex items-center gap-1 font-semibold ${
                          dpo.status === 'EXPIRED' ? 'text-rose-500' : dpo.status === 'WARNING' ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          Expires: {dpo.expiry_date}
                          {dpo.daysRemaining !== undefined && dpo.daysRemaining > 0 && ` (${dpo.daysRemaining}d left)`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 self-end md:self-start">
                      <button
                        onClick={() => startEdit(dpo)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                        title="Edit credentials"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDpo(dpo.id)}
                        disabled={actionLoading === `delete_${dpo.id}`}
                        className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-40"
                        title="Delete credentials"
                      >
                        {actionLoading === `delete_${dpo.id}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT: COMPLIANCE PROOF DOCUMENT VAULT */}
        <div id="vault-section" className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-500" />
                Document Upload Verification Portal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Cryptographic verification ledger for audit proof.</p>
            </div>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded transition-all"
            >
              <Upload className="w-3 h-3" />
              Upload Evidence
            </button>
          </div>

          <div className="p-5 flex-grow space-y-4">
            
            {/* COLLAPSIBLE UPLOAD COMPOSER */}
            <AnimatePresence>
              {showUploadForm && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleUploadDoc}
                  className="p-4 border border-indigo-100 bg-indigo-50/30 rounded-lg overflow-x-auto space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-indigo-100/50 pb-2">
                    <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      Upload Compliance Certificate Proof
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setShowUploadForm(false)}
                      className="p-1 hover:bg-indigo-100/50 rounded"
                    >
                      <X className="w-3 h-3 text-indigo-950" />
                    </button>
                  </div>
                  
                  <div className="space-y-3.5 text-xs">
                    {/* CUSTOM DRAG AND DROP COMPONENT */}
                    <DpoDragDropUpload
                      onFileLoaded={(fileInfo) => {
                        setUploadFormData({
                          name: fileInfo.name,
                          file_size_kb: fileInfo.file_size_kb,
                          doc_type: fileInfo.inferredType
                        });
                      }}
                      onClear={() => {
                        setUploadFormData({
                          name: "",
                          file_size_kb: 1200,
                          doc_type: "Certification Certificate"
                        });
                      }}
                    />

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Document File Name</label>
                      <input
                        type="text"
                        placeholder="e.g. CIPP_E_Dr_Helena_Vandelay"
                        value={uploadFormData.name}
                        onChange={e => setUploadFormData({ ...uploadFormData, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Type classification</label>
                        <select
                          value={uploadFormData.doc_type}
                          onChange={e => setUploadFormData({ ...uploadFormData, doc_type: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        >
                          <option value="Certification Certificate">Certification Proof</option>
                          <option value="Official DPO Appointment Letter">Appointment Letter (Art.37)</option>
                          <option value="Continuous Education (CPE) Proof">CPE Log Proof</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">File Size (Estimated KB)</label>
                        <input
                          type="number"
                          value={uploadFormData.file_size_kb}
                          onChange={e => setUploadFormData({ ...uploadFormData, file_size_kb: parseInt(e.target.value) || 100 })}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading === "upload_doc"}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1.5 rounded shadow-sm flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {actionLoading === "upload_doc" ? (
                      <Loader2 className="w-3 animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                    Upload Evidence Packet
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* DOCUMENTS LEDGER LIST */}
            {documents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-lg p-4 sm:p-5 lg:p-6 flex flex-col items-center">
                <FileAxis3d className="w-8 h-8 text-slate-300 mb-1" />
                <h4 className="text-xs font-bold text-slate-600">No Auditable Evidence</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Provide regulatory evidence by uploading certificate copies, public declarations, or official appointment letters.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-lg space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800 break-all">{doc.name}</h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-2 flex-wrap">
                          <span>{doc.doc_type}</span>
                          <span>•</span>
                          <span>{((doc.file_size || 0) / (1024 * 1024)).toFixed(2)} MB</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {doc.status === "VERIFIED" ? (
                          <span className="flex items-center gap-1 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            <Check className="w-2.5 h-2.5" />
                            VERIFIED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded animate-pulse">
                            PENDING
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          disabled={actionLoading === `delete_doc_${doc.id}`}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* INTERACTIVE ACTIONS */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100/50">
                      {doc.status !== "VERIFIED" && (
                        <button
                          onClick={() => handleVerifyDocument(doc.id)}
                          disabled={activeVerificationId !== null}
                          className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded disabled:opacity-50"
                        >
                          {activeVerificationId === doc.id ? (
                            <>
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              Scanning...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Run Verification Scan
                            </>
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => setShowLogForDocId(showLogForDocId === doc.id ? null : doc.id)}
                        className="text-[10px] text-indigo-600 font-semibold hover:underline"
                      >
                        {showLogForDocId === doc.id ? "Hide Compliance Logs" : "View Compliance Logs"}
                      </button>
                    </div>

                    {/* ACTIVE SCANNING CONSOLE OUTPUT */}
                    {activeVerificationId === doc.id && (
                      <div className="p-2.5 bg-slate-950 rounded font-mono text-[9px] text-emerald-400 space-y-1 overflow-y-auto max-h-32 shadow-inner border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold mb-1">// SECURE ENCLAVE ACTIVE COMPLIANCE SCAN</div>
                        {verificationConsole.map((log, index) => (
                          <div key={index} className="leading-relaxed">{log}</div>
                        ))}
                      </div>
                    )}

                    {/* COLLAPSIBLE HISTORICAL VERIFICATION LOG */}
                    {showLogForDocId === doc.id && (
                      <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-1 text-[11px] text-slate-600 leading-relaxed font-medium">
                        <div className="text-xs font-bold text-slate-800 border-b border-slate-200/50 pb-1 flex items-center gap-1.5 mb-1.5 text-indigo-950">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          Compliance Cryptographic Ledger Report
                        </div>
                        <div className="whitespace-pre-line font-mono text-[10px] bg-white p-2 rounded border border-slate-100">
                          {doc.verification_log}
                        </div>
                        <p className="text-[9px] text-slate-400 mt-2 font-medium">
                          Uploaded on: {new Date(doc.uploaded_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION: CONTINUOUS PROFESSIONAL EDUCATION & AUTOMATED RENEWAL CENTER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Continuous Professional Education (CPE) & Renewal Tracker
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor course completions, track regulatory CPE credits, and execute automated DPO certification renewals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Select DPO:</span>
            <select
              value={selectedDpoForTraining || ""}
              onChange={(e) => setSelectedDpoForTraining(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>-- Select Officer --</option>
              {certifications.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-5">
          {selectedDpoForTraining ? (() => {
            const currentDpo = certifications.find(c => c.id === selectedDpoForTraining);
            const courses = trainingRecords.filter(t => t.dpo_id === selectedDpoForTraining);
            const completedCpe = courses.filter(c => c.status === "COMPLETED").reduce((acc, curr) => acc + curr.cpe_hours, 0);
            const requiredCpe = 30;
            const cpePercentage = Math.min(100, (completedCpe / requiredCpe) * 100);
            
            // Checks if there are verified documents for this DPO name (by checking substring matches in document names or document itself)
            const hasVerifiedDocument = currentDpo ? documents.some(d => 
              d.status === "VERIFIED" && d.name.toLowerCase().includes(currentDpo.name.toLowerCase().split(" ")[0].toLowerCase())
            ) : false;

            const isEligibleForRenewal = completedCpe >= requiredCpe;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                
                {/* LEFT: Renewal Status & Eligibility Gauge */}
                <div className="lg:col-span-5 border border-slate-100 rounded-xl p-5 bg-slate-50/20 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Renewal Readiness Audit</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isEligibleForRenewal ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {isEligibleForRenewal ? "Eligible" : "Pending Requirements"}
                      </span>
                    </div>

                    {/* Progress Bar Gauge */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">Regulatory Training Progress</span>
                        <span className="font-mono font-bold text-indigo-600">{completedCpe} / {requiredCpe} CPE Hours</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            completedCpe >= requiredCpe ? "bg-emerald-500" : "bg-indigo-500"
                          }`}
                          style={{ width: `${cpePercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Checklist Requirements */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center gap-2.5 text-xs">
                        {completedCpe >= requiredCpe ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center text-[10px] text-amber-600 font-bold flex-shrink-0 animate-pulse">!</div>
                        )}
                        <span className={`${completedCpe >= requiredCpe ? "text-slate-700" : "text-slate-500"} font-medium`}>
                          Complete minimum 30 CPE training credits
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs">
                        {hasVerifiedDocument ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center text-[10px] text-amber-600 font-bold flex-shrink-0">!</div>
                        )}
                        <span className={`${hasVerifiedDocument ? "text-slate-700" : "text-slate-500"} font-medium`}>
                          Verified appointment letter or certificate in vault
                        </span>
                      </div>
                    </div>

                    {currentDpo && (
                      <div className="bg-white p-3.5 rounded-lg border border-slate-100 text-xs space-y-1 mt-2">
                        <div className="font-bold text-slate-800">Current Expiry Status</div>
                        <div className="text-slate-500 flex items-center gap-1">
                          Certification Body: <span className="font-semibold text-slate-700">{currentDpo.cert_body}</span>
                        </div>
                        <div className="text-slate-500 flex items-center gap-1">
                          Expiration Date: <span className={`font-semibold ${
                            currentDpo.status === "EXPIRED" ? "text-rose-600" : currentDpo.status === "WARNING" ? "text-amber-600" : "text-emerald-600"
                          }`}>{currentDpo.expiry_date}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => currentDpo && handleRenewDpo(currentDpo.id)}
                      disabled={!isEligibleForRenewal || isProcessingRenewal !== null}
                      className={`w-full py-2.5 rounded-lg font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${
                        isEligibleForRenewal 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                          : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      }`}
                    >
                      {isProcessingRenewal === currentDpo?.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing Automated Renewal...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Authorize Automated Renewal
                        </>
                      )}
                    </button>
                    {!isEligibleForRenewal && currentDpo && (
                      <p className="text-[10px] text-slate-500 text-center mt-2 font-medium">
                        To qualify for automated renewal, complete the pending courses in the training catalog.
                      </p>
                    )}
                  </div>
                </div>

                {/* RIGHT: Course Catalog */}
                <div className="lg:col-span-7 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Accredited Continuing Education Courses</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {courses.map(course => (
                      <div 
                        key={course.id} 
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between h-40 ${
                          course.status === "COMPLETED" 
                            ? "border-emerald-100 bg-emerald-50/10" 
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono">
                              +{course.cpe_hours} CPE Hours
                            </span>
                            {course.status === "COMPLETED" ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                Accredited
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">Available</span>
                            )}
                          </div>
                          <h5 className="text-xs font-bold text-slate-800 leading-snug">{course.course_name}</h5>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Regulatory study curriculum and interactive assessment to satisfy GDPR Article 37.5 criteria.
                          </p>
                        </div>

                        {course.status !== "COMPLETED" ? (
                          <button
                            onClick={() => handleCompleteTraining(selectedDpoForTraining, course.id)}
                            disabled={actionLoading === `complete_training_${course.id}`}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-1.5 rounded transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            {actionLoading === `complete_training_${course.id}` ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Complete Course & Claim CPE
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span>Completed at:</span>
                            <span className="font-mono">{new Date(course.completed_at || "").toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })() : (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-center">
              <Clock className="w-8 h-8 text-slate-300 mb-1" />
              <p className="text-xs font-medium">Please select a registered Data Protection Officer from the dropdown above to view regulatory training status.</p>
            </div>
          )}
        </div>
      </div>

      {/* SECURE AUDIT LOG LEDGER SECTION */}
      <DpoAuditLog
        certifications={certifications}
        documents={documents}
      />

      {/* APPOINTMENT MODAL (ADD / EDIT FORM) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden"
            >
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4.5 h-4.5 text-indigo-600" />
                    {editingDpo ? "Modify Registered DPO credentials" : "Appoint Data Protection Officer"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Record statutory officer assignment to the database ledger.</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDpo} className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Helena Vandelay"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      placeholder="h.vandelay@company.eu"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Licensing Body</label>
                    <input
                      type="text"
                      placeholder="e.g. IAPP"
                      value={formData.cert_body}
                      onChange={e => setFormData({ ...formData, cert_body: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Certification Credential Name</label>
                    <input
                      type="text"
                      placeholder="e.g. CIPP/E"
                      value={formData.cert_name}
                      onChange={e => setFormData({ ...formData, cert_name: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">License/Certificate ID Number</label>
                    <input
                      type="text"
                      placeholder="e.g. CIPP-EU-908273"
                      value={formData.cert_number}
                      onChange={e => setFormData({ ...formData, cert_number: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Issue Date</label>
                      <input
                        type="date"
                        value={formData.issue_date}
                        onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                        className="w-full text-xs px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={formData.expiry_date}
                        onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                        className="w-full text-xs px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg hover:bg-slate-50 text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === "save_dpo"}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {actionLoading === "save_dpo" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {editingDpo ? "Apply Changes" : "Commit Appointment"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAST-TRACK AUTOMATED ISSUANCE MODAL */}
      <AnimatePresence>
        {showAutoIssueModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4.5 h-4.5 text-emerald-600" />
                    Fast-Track Automated Issuance Workflow
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Onboard a certified Data Protection Officer instantly via fast-track system audits.</p>
                </div>
                <button
                  onClick={() => setShowAutoIssueModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAutoIssueDpo} className="p-5 space-y-4">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marie Curie"
                      value={autoIssueForm.name}
                      onChange={(e) => setAutoIssueForm({ ...autoIssueForm, name: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">DPO Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. m.curie@radium-compliance.fr"
                      value={autoIssueForm.email}
                      onChange={(e) => setAutoIssueForm({ ...autoIssueForm, email: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Accrediting Certification Body</label>
                      <select
                        value={autoIssueForm.cert_body}
                        onChange={(e) => setAutoIssueForm({ ...autoIssueForm, cert_body: e.target.value })}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="IAPP (International Association of Privacy Professionals)">IAPP (International)</option>
                        <option value="PECB">PECB (Europe)</option>
                        <option value="Maastricht University">Maastricht University</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Statutory License / Cert Name</label>
                      <select
                        value={autoIssueForm.cert_name}
                        onChange={(e) => setAutoIssueForm({ ...autoIssueForm, cert_name: e.target.value })}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="CIPP/E (Certified Information Privacy Professional/Europe)">CIPP/E (Europe)</option>
                        <option value="Certified Lead Data Protection Officer (CDPO)">CDPO (Lead DPO)</option>
                        <option value="E-DPO (European Data Protection Officer)">E-DPO (European)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs text-slate-600 leading-normal font-medium">
                    <p className="font-bold text-slate-800 mb-1">What happens during fast-track issuance?</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Registers the DPO into the immutable SQLite ledger in ACTIVE status.</li>
                      <li>Sets the expiration date automatically to 2 years from today.</li>
                      <li>Creates pre-validated regulatory training records satisfying 35 CPE hours.</li>
                      <li>Generates a verified, cryptographically signed certificate document in the evidence vault.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAutoIssueModal(false)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2 rounded-md transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === "auto_issue_dpo"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-sm transition-all flex items-center gap-1.5"
                  >
                    {actionLoading === "auto_issue_dpo" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Issuing Credential...
                      </>
                    ) : (
                      <>
                        <Award className="w-3.5 h-3.5" />
                        Authorize & Issue Now
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STEP-BY-STEP DPO CERTIFICATION WIZARD MODAL */}
      <DpoCertificationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={fetchDpoData}
        certifications={certifications}
      />

      {/* DPO COMPLIANCE REPORT PREVIEW MODAL */}
      <DpoReportPreviewModal
        isOpen={isReportPreviewOpen}
        onClose={() => setIsReportPreviewOpen(false)}
        certifications={certifications}
        documents={documents}
        tenantName="Acme Compliance Solutions"
      />
    </div>
  );
};
