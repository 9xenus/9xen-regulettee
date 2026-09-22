import React, { useState } from "react";
import {
  ShieldAlert,
  Info,
  ShieldCheck,
  Globe,
  Users,
  FileCheck2,
  Building2,
  AlertTriangle,
  HeartPulse,
  Network,
  Plus,
  ArrowRight,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  Shield,
  Lock,
  Activity,
  Database,
  Key,
  Sparkles,
  Brain,
  RefreshCw,
  FileSignature,
  Fingerprint,
  Send,
  Inbox,
  AlertCircle,
  Trash2,
  Edit2,
  Server,
  Eye,
  Download,
  Scale,
  Settings,
  HelpCircle
} from "lucide-react";
import { motion } from "motion/react";
import { useNotification } from "../context/NotificationContext";
import { HelpMeUnderstandDrawer } from "../components/ui/HelpMeUnderstandDrawer";
import { MCPManager } from "../components/dashboard/MCPManager";
import { DataProcessingRiskCalculator } from "../components/DataProcessingRiskCalculator";
import { BadgeGenerator } from "../components/BadgeGenerator";
import { BadgeModal } from "../components/BadgeModal";
import { DataMappingManager } from "../components/dashboard/DataMappingManager";
import { DataMappingDashboard } from "../components/dashboard/DataMappingDashboard";
import { WhistleblowerPortal } from "../components/dashboard/WhistleblowerPortal";
import { DataSubjectRequestManager } from "../components/dashboard/DataSubjectRequestManager";
import { VendorRiskManager } from "../components/dashboard/VendorRiskManager";
import { PiaDpiaManager } from "../components/dashboard/PiaDpiaManager";
import { EsgSustainabilityManager } from "../components/dashboard/EsgSustainabilityManager";
import { DsarProgressTracker, getDsarSteps } from "../components/dashboard/DsarProgressTracker";
import { PrivacyBudgetAuditTab } from "../components/dashboard/PrivacyBudgetAuditTab";
import { AutonomousConsentOrchestrator } from "../components/trust/AutonomousConsentOrchestrator";
import { SanctionsPepScreeningEnclave } from "../components/trust/SanctionsPepScreeningEnclave";

interface TrustPrivacyDashboardProps {
  moduleId: string;
}

const DpiaModule = () => (
  <div className="space-y-5 sm:space-y-8">
    <div>
      <DataProcessingRiskCalculator />
    </div>

    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-t border-slate-100 pt-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Privacy Impact Assessments (DPIA)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Formal assessments conducted across organization departments.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          {
            title: "AI Recommender System Implementation",
            date: "June 25, 2026",
            status: "In Progress",
            score: "High Risk",
            owner: "Product Team",
          },
          {
            title: "Migration to New HR Platform",
            date: "May 10, 2026",
            status: "Completed",
            score: "Low Risk",
            owner: "HR Dept",
          },
          {
            title: "Customer Loyalty Program V2",
            date: "April 05, 2026",
            status: "Under Review",
            score: "Medium Risk",
            owner: "Marketing",
          },
          {
            title: "Biometric Access Control Rollout",
            date: "Mar 12, 2026",
            status: "Completed",
            score: "High Risk",
            owner: "Facilities",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.status === "Completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : item.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {item.status}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${item.score === "High Risk" ? "text-rose-600" : item.score === "Medium Risk" ? "text-amber-600" : "text-emerald-600"}`}
              >
                {item.score}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              {item.title}
            </h4>
            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Owner: {item.owner}</span>
              <span>{item.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const EsgModule = () => (
  <div className="space-y-4 sm:space-y-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900">
          ESG & Sustainability Metrics
        </h3>
        <p className="text-xs text-slate-500 mt-1">Carbon auditing standards and double materiality thresholds.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-emerald-500" /> Environmental Performance
        </h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">
                Scope 1 & 2 Emissions Target
              </span>
              <span className="text-slate-900">75% Complete</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-3/4"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Renewable Energy Usage</span>
              <span className="text-slate-900">42%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 w-[42%]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" /> Social & Governance
        </h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Board Diversity Target</span>
              <span className="text-slate-900">100% Complete</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-full"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Supply Chain ESG Audits</span>
              <span className="text-slate-900">68%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[68%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const TrustPrivacyDashboard: React.FC<TrustPrivacyDashboardProps & { activePath?: string }> = ({
  activePath,
  moduleId: _moduleId,
}) => {
  const moduleId = _moduleId || activePath || "data-mapping";
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState("overview");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  React.useEffect(() => {
    if (moduleId === "data-mapping") {
      setActiveTab("visual-flow");
    } else {
      setActiveTab("overview");
    }
  }, [moduleId]);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // 1. DATA MAPPING & INVENTORY STATE
  // ---------------------------------------------------------------------------
  const [dataActivities, setDataActivities] = useState([
    { name: "Employee Payroll Processing", basis: "Legal Obligation", data: "Financial, Identity, Contact", storage: "Workday (AWS EU-Central)", risk: "High" },
    { name: "Customer Marketing Newsletter", basis: "Consent", data: "Contact, Preferences", storage: "Mailchimp (US)", risk: "Low" },
    { name: "User Authentication & Login", basis: "Legitimate Interest", data: "Identity, Device, Credentials", storage: "Auth0 (EU)", risk: "Medium" },
    { name: "E-Commerce Checkout", basis: "Contract", data: "Financial, Contact, Location", storage: "Stripe, Own DB", risk: "High" },
    { name: "Website Analytics (Anonymized)", basis: "Consent", data: "Device, Behavioral", storage: "Google Analytics 4", risk: "Low" },
  ]);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: "", basis: "Consent", data: "", storage: "", risk: "Medium" });
  const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null);

  const [mappingScanState, setMappingScanState] = useState<"idle" | "scanning" | "done">("idle");
  const [selectedDataSource, setSelectedDataSource] = useState("Postgres Customers DB");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [discoveredPII, setDiscoveredPII] = useState<any[]>([]);

  // ---------------------------------------------------------------------------
  // 2. COOKIE CONSENT STATE
  // ---------------------------------------------------------------------------
  const [cookieScanState, setCookieScanState] = useState<"idle" | "scanning" | "done">("idle");
  const [selectedScanDomain, setSelectedScanDomain] = useState("www.acme-corp.com");
  const [cookieScanProgress, setCookieScanProgress] = useState(0);
  const [discoveredCookies, setDiscoveredCookies] = useState<any[]>([]);

  // ---------------------------------------------------------------------------
  // 3. DSAR STATE
  // ---------------------------------------------------------------------------
  const [dsarRequests, setDsarRequests] = useState([
    { id: "REQ-8472", name: "Jane Smith", type: "Right to Erasure", status: "In Progress", due: "3 days", urgent: true, email: "janesmith@domain.com", country: "France" },
    { id: "REQ-8473", name: "Michael Chang", type: "Data Access", status: "New", due: "14 days", urgent: false, email: "mchang@domain.com", country: "United Kingdom" },
    { id: "REQ-8474", name: "Sarah Connor", type: "Data Portability", status: "Review", due: "5 days", urgent: true, email: "sconnor@cyberdyne.net", country: "United States" },
    { id: "REQ-8475", name: "Ahmed Hassan", type: "Right to Rectification", status: "Waiting on User", due: "21 days", urgent: false, email: "ahassan@cairo-edu.eg", country: "Egypt" },
    { id: "REQ-8476", name: "Elena Rostova", type: "Data Access", status: "Processing", due: "11 days", urgent: false, email: "erostova@novosibirsk.ru", country: "Russia" },
    { id: "REQ-8477", name: "David Kim", type: "Right to Erasure", status: "New", due: "28 days", urgent: false, email: "dkim@seoul-tech.kr", country: "South Korea" },
  ]);
  const [selectedDsar, setSelectedDsar] = useState<any | null>(null);
  const [dsarActionProgress, setDsarActionProgress] = useState(0);
  const [dsarActionStep, setDsarActionStep] = useState("");
  const [dsarActionState, setDsarActionState] = useState<"idle" | "processing" | "completed">("idle");

  // DSAR CRUD & filter states
  const [showDsarModal, setShowDsarModal] = useState(false);
  const [editingDsarIndex, setEditingDsarIndex] = useState<number | null>(null);
  const [formDsarName, setFormDsarName] = useState("");
  const [formDsarType, setFormDsarType] = useState("Right to Erasure");
  const [formDsarStatus, setFormDsarStatus] = useState("New");
  const [formDsarEmail, setFormDsarEmail] = useState("");
  const [formDsarCountry, setFormDsarCountry] = useState("United States");
  const [formDsarUrgent, setFormDsarUrgent] = useState(false);

  const [dsarSearchText, setDsarSearchText] = useState("");
  const [dsarTypeFilter, setDsarTypeFilter] = useState("ALL");

  // ---------------------------------------------------------------------------
  // 4. PIA & DPIA STATE
  // ---------------------------------------------------------------------------
  const [dpiaMitigations, setDpiaMitigations] = useState([
    { id: "RM-1", title: "Unencrypted customer marketing lists", threat: "Data breach resulting in identity leak", control: "Enforce TLS 1.3 & AES-256 local field-level database encryption", score: "High", mitigated: false },
    { id: "RM-2", title: "Raw facial scan storage", threat: "Biometric correlation violating GDPR Article 9", control: "Convert biometric inputs directly to localized salted hashes; discard source templates", score: "Critical", mitigated: false },
    { id: "RM-3", title: "Behavioral tracker targeting without consent options", threat: "Regulatory fine for non-consensual profiling", control: "Deploy hard-block cookie wrapper requiring explicit category selection", score: "High", mitigated: false },
    { id: "RM-4", title: "Unrestricted vendor API token scopes", threat: "Privilege escalation by third-party processors", control: "Re-scope OAuth permissions to read-only endpoints & add IP restrictive firewalls", score: "Medium", mitigated: true },
  ]);

  // ---------------------------------------------------------------------------
  // 5. VENDOR RISK STATE
  // ---------------------------------------------------------------------------
  const [vendorList, setVendorList] = useState([
    { id: "vnd-1", name: "Amazon Web Services", category: "Cloud Infrastructure", risk: "Low", dpa: "Signed (Standard SCCs)", date: "Jan 12, 2026", details: "Primary datacenter host (Frankfurt, Dublin). SOC 2 Type II Certified, ISO 27001." },
    { id: "vnd-2", name: "Salesforce CRM", category: "Data Processor", risk: "Medium", dpa: "Signed", date: "Feb 05, 2026", details: "Customer relations records database. EU-US Data Privacy Framework verified." },
    { id: "vnd-3", name: "Acme Analytics Platform", category: "Marketing Tracker", risk: "High", dpa: "Pending Review", date: "Jun 18, 2026", details: "Uncapped telemetry engine. Sells anonymous profiles to brokers. Under assessment." },
    { id: "vnd-4", name: "Stripe Payments", category: "Payment Gateway", risk: "Medium", dpa: "Signed", date: "Mar 22, 2026", details: "PCI-DSS Level 1 Processor. Payment processing & transaction management. No card details stored on local servers." },
  ]);
  const [selectedVendorForAudit, setSelectedVendorForAudit] = useState<any | null>(null);
  const [vendorAuditState, setVendorAuditState] = useState<"idle" | "auditing" | "results">("idle");
  const [vendorAuditScore, setVendorAuditScore] = useState(100);
  const [questionAnswers, setQuestionAnswers] = useState({
    q1: "yes",
    q2: "yes",
    q3: "no",
    q4: "yes",
  });

  // ---------------------------------------------------------------------------
  // 6. WHISTLEBLOWER STATE
  // ---------------------------------------------------------------------------
  const [casesList, setCasesList] = useState([
    {
      id: "WB-2026-042",
      category: "Financial Impropriety",
      status: "Under Investigation",
      severity: "Critical",
      date: "June 25, 2026",
      desc: "Substantial deviation from established corporate expense guidelines noticed in regional sales procurement offices. Potential off-ledger accounts created.",
      chat: [
        { sender: "whistleblower", msg: "I noticed that transactions on the Hamburg account lack standard receipt verification.", time: "June 25, 2026 09:12 UTC" },
        { sender: "admin", msg: "Thank you for the report. Have you observed specific invoice IDs or personnel authorizing these?", time: "June 25, 2026 14:05 UTC" },
        { sender: "whistleblower", msg: "German invoices series Hamburg-EXP-9921 to Hamburg-EXP-9928 contain mismatched vendors.", time: "June 26, 2026 04:30 UTC" },
      ]
    },
    {
      id: "WB-2026-041",
      category: "Harassment / Discrimination",
      status: "New",
      severity: "High",
      date: "June 24, 2026",
      desc: "Systemic exclusion reported in quarterly reward cycles by Hamburg sales department directors.",
      chat: [
        { sender: "whistleblower", msg: "Promotions are being allocated based on personal friendships rather than target performance matrices.", time: "June 24, 2026 11:45 UTC" }
      ]
    },
    {
      id: "WB-2026-040",
      category: "Data Privacy Violation",
      status: "Closed - Action Taken",
      severity: "Medium",
      date: "June 15, 2026",
      desc: "Marketing lists containing user emails were shared externally over an unencrypted Slack workspace without legal bases.",
      chat: [
        { sender: "whistleblower", msg: "An export containing 5,000 subscriber emails was dropped into a public Slack channel yesterday.", time: "June 15, 2026 10:20 UTC" },
        { sender: "admin", msg: "We have isolated the files, cleaned the workspace history, and issued disciplinary compliance reviews to the marketing lead.", time: "June 16, 2026 11:00 UTC" }
      ]
    }
  ]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [newAdminMsgText, setNewAdminMsgText] = useState("");

  // ---------------------------------------------------------------------------
  // 7. ESG STATE
  // ---------------------------------------------------------------------------
  const [esgInitiatives, setEsgInitiatives] = useState([
    { name: "Server hosting migration to carbon-neutral datacenters", scope: "Scope 3", reduction: "4.8 tons", status: "Implemented", date: "April 2026" },
    { name: "Implemented office virtual-first operations schema", scope: "Scope 1", reduction: "1.2 tons", status: "Implemented", date: "May 2026" },
    { name: "Supply chain container consolidation target", scope: "Scope 3", reduction: "3.5 tons", status: "Planned", date: "August 2026" },
    { name: "Localized grid energy purchasing agreement (Norway solar PV)", scope: "Scope 2", reduction: "2.1 tons", status: "In Progress", date: "June 2026" },
  ]);
  const [newInitiative, setNewInitiative] = useState({ name: "", scope: "Scope 3", reduction: "1.5 tons", status: "Planned" });

  // ---------------------------------------------------------------------------
  // ACTIONS / TRIGGERS
  // ---------------------------------------------------------------------------
  const startMappingScan = () => {
    setMappingScanState("scanning");
    setScanProgress(5);
    setScanLogs(["[1] Connecting to target database: " + selectedDataSource + "..."]);

    const steps = [
      { p: 25, log: "[2] Extracting tables & structural relational catalogs..." },
      { p: 50, log: "[3] Running Jaro-Winkler string similarity checks on 1,420 columns..." },
      { p: 75, log: "[4] Querying local table card/content distributions to find unstructured emails/credentials..." },
      { p: 90, log: "[5] Classifying sensitive special categories under GDPR Article 9..." },
      { p: 100, log: "[6] Scan finished successfully. 5 critical PII attributes resolved." }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setScanProgress(step.p);
        setScanLogs(prev => [...prev, step.log]);
        if (step.p === 100) {
          setMappingScanState("done");
          setDiscoveredPII([
            { table: "users", column: "email", type: "PII (Contact Info)", reason: "100% email structure format detected", basis: "Consent", status: "Mapped" },
            { table: "users", column: "hashed_password", type: "Sensitive (Credentials)", reason: "Hash signature pattern matched", basis: "Contract", status: "Mapped" },
            { table: "profiles", column: "phone", type: "PII (Contact Info)", reason: "International phone pattern matched", basis: "Consent", status: "Mapped" },
            { table: "patient_records", column: "allergy_history", type: "Special Category (Health)", reason: "Medical description vectors parsed", basis: "Legal Obligation", status: "Review Required" },
            { table: "checkouts", column: "card_digits", type: "Sensitive (Financial)", reason: "Luhn algorithm confirmation matches", basis: "Contract", status: "Mapped" },
          ]);
        }
      }, (idx + 1) * 900);
    });
  };

  const startCookieScan = () => {
    setCookieScanState("scanning");
    setCookieScanProgress(10);
    setTimeout(() => {
      setCookieScanProgress(45);
      setTimeout(() => {
        setCookieScanProgress(80);
        setTimeout(() => {
          setCookieScanProgress(100);
          setCookieScanState("done");
          setDiscoveredCookies([
            { name: "_ga", domain: selectedScanDomain, category: "Performance & Analytics", persistence: "2 years", status: "Declared & Blockable" },
            { name: "_fbp", domain: selectedScanDomain, category: "Targeting & Advertising", persistence: "3 months", status: "Declared" },
            { name: "session_id", domain: selectedScanDomain, category: "Strictly Necessary", persistence: "Session", status: "Always Active" },
            { name: "untracked_tracker", domain: selectedScanDomain, category: "Uncategorized (Warning)", persistence: "Persistent", status: "Blocked - Missing Policy Entry" },
          ]);
        }, 800);
      }, 700);
    }, 600);
  };

  const processDsarRequest = (req: any) => {
    setDsarActionState("processing");
    setDsarActionProgress(10);
    setDsarActionStep("Step 1/4: Initializing verification sequence and locating core database index nodes...");

    const steps = [
      { p: 40, s: "Step 2/4: Extracting registered personal data packets across Auth0 & primary database..." },
      { p: 70, s: "Step 3/4: Creating secure immutable compliance crypt-archive ZIP on encrypted server..." },
      { p: 90, s: "Step 4/4: Triggering absolute data erasure on local indexes & drafting proof of compliance certificate..." },
      { p: 100, s: "Fulfillment completed. Signed proof dispatched to regulatory audit ledger." }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setDsarActionProgress(step.p);
        setDsarActionStep(step.s);
        if (step.p === 100) {
          setDsarActionState("completed");
          // Update request in state
          setDsarRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "Completed", urgent: false } : r));
        }
      }, (idx + 1) * 1100);
    });
  };

  const runVendorAudit = () => {
    setVendorAuditState("auditing");
    setTimeout(() => {
      let finalScore = 100;
      if (questionAnswers.q1 === "no") finalScore -= 25;
      if (questionAnswers.q2 === "no") finalScore -= 25;
      if (questionAnswers.q3 === "yes") finalScore -= 20; // q3: third party storage? yes lowers compliance unless mapped
      if (questionAnswers.q4 === "no") finalScore -= 30;

      setVendorAuditScore(finalScore);
      setVendorAuditState("results");
    }, 1500);
  };

  const handleSendAdminMessage = () => {
    if (!newAdminMsgText.trim() || !selectedCase) return;

    const newMsg = {
      sender: "admin",
      msg: newAdminMsgText,
      time: new Date().toLocaleString()
    };

    const updatedCases = casesList.map(c => {
      if (c.id === selectedCase.id) {
        return {
          ...c,
          status: "Under Investigation",
          chat: [...c.chat, newMsg]
        };
      }
      return c;
    });

    setCasesList(updatedCases);
    setSelectedCase((prev: any) => ({
      ...prev,
      status: "Under Investigation",
      chat: [...prev.chat, newMsg]
    }));
    setNewAdminMsgText("");
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.name.trim()) return;

    if (editingActivityIndex !== null) {
      setDataActivities(prev => prev.map((act, idx) => idx === editingActivityIndex ? newActivity : act));
      showToast("Data processing activity updated successfully.", "success");
    } else {
      setDataActivities([newActivity, ...dataActivities]);
      showToast("New data processing activity registered.", "success");
    }

    setNewActivity({ name: "", basis: "Consent", data: "", storage: "", risk: "Medium" });
    setEditingActivityIndex(null);
    setShowAddActivityModal(false);
  };

  const handleEditActivityOpen = (activity: any, index: number) => {
    setNewActivity(activity);
    setEditingActivityIndex(index);
    setShowAddActivityModal(true);
  };

  const handleDeleteActivity = (index: number) => {
    if (!window.confirm("Are you sure you want to remove this processing activity?")) return;
    setDataActivities(prev => prev.filter((_, idx) => idx !== index));
    showToast("Data processing activity removed.", "success");
  };

  const handleSaveDsar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDsarName.trim() || !formDsarEmail.trim()) return;

    const record = {
      id: editingDsarIndex !== null ? dsarRequests[editingDsarIndex].id : `REQ-${Math.floor(Math.random() * 9000) + 1000}`,
      name: formDsarName,
      type: formDsarType,
      status: formDsarStatus,
      due: editingDsarIndex !== null ? dsarRequests[editingDsarIndex].due : "30 days",
      urgent: formDsarUrgent,
      email: formDsarEmail,
      country: formDsarCountry
    };

    if (editingDsarIndex !== null) {
      setDsarRequests(prev => prev.map((item, idx) => idx === editingDsarIndex ? record : item));
      showToast("DSAR request details updated successfully.", "success");
    } else {
      setDsarRequests([record, ...dsarRequests]);
      showToast("New DSAR request registered inside active ledger.", "success");
    }

    setShowDsarModal(false);
    setEditingDsarIndex(null);
    setFormDsarName("");
    setFormDsarEmail("");
  };

  const handleOpenAddDsar = () => {
    setEditingDsarIndex(null);
    setFormDsarName("");
    setFormDsarType("Right to Erasure");
    setFormDsarStatus("New");
    setFormDsarEmail("");
    setFormDsarCountry("United States");
    setFormDsarUrgent(false);
    setShowDsarModal(true);
  };

  const handleOpenEditDsar = (req: any, idx: number) => {
    setEditingDsarIndex(idx);
    setFormDsarName(req.name);
    setFormDsarType(req.type);
    setFormDsarStatus(req.status);
    setFormDsarEmail(req.email);
    setFormDsarCountry(req.country || "United States");
    setFormDsarUrgent(!!req.urgent);
    setShowDsarModal(true);
  };

  const handleDeleteDsar = (idx: number) => {
    if (!window.confirm("Are you sure you want to cancel/delete this DSAR request?")) return;
    setDsarRequests(prev => prev.filter((_, i) => i !== idx));
    showToast("DSAR request removed.", "success");
    if (selectedDsar && selectedDsar.id === dsarRequests[idx].id) {
      setSelectedDsar(null);
    }
  };

  const handleAddInitiative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInitiative.name.trim()) return;
    setEsgInitiatives([
      {
        name: newInitiative.name,
        scope: newInitiative.scope,
        reduction: newInitiative.reduction,
        status: newInitiative.status,
        date: "Just Now"
      },
      ...esgInitiatives
    ]);
    setNewInitiative({ name: "", scope: "Scope 3", reduction: "1.5 tons", status: "Planned" });
  };

  // ---------------------------------------------------------------------------
  // KPI AND METADATA MAPPING INFO
  // ---------------------------------------------------------------------------
  const getModuleInfo = () => {
    switch (moduleId) {
      case "data-mapping":
        return {
          title: "Data Mapping & Inventory",
          icon: <Network className="w-6 h-6 text-indigo-500" />,
          desc: "Automatically discover and map personal data assets, classifications, and storage directories.",
          stats: [
            { label: "Total Assets", value: `${dataActivities.length * 680 + 20}`, trend: "+12%" },
            { label: "Data Elements Classified", value: "14,580+", trend: "+5%" },
            { label: "High Risk Systems", value: `${dataActivities.filter(x => x.risk === "High").length}`, trend: "-2" },
          ],
        };
      case "cookie-consent":
        return {
          title: "Cookie Consent & Preferences",
          icon: <Globe className="w-6 h-6 text-blue-500" />,
          desc: "Manage cookie banners, compliance consents, and active website tracking vectors.",
          stats: [
            { label: "Websites Scanned", value: "48", trend: "+3" },
            { label: "Blocked Trackers", value: "424", trend: "-15" },
            { label: "Avg Consent Rate", value: "78.4%", trend: "+2.1%" },
          ],
        };
      case "dsar-management":
        return {
          title: "Data Subject Requests (DSAR)",
          icon: <Users className="w-6 h-6 text-emerald-500" />,
          desc: "Automate the intake, identity verification, and erasure logs for user privacy requests.",
          stats: [
            { label: "Open Requests", value: `${dsarRequests.filter(r => r.status !== "Completed").length}`, trend: "-5" },
            { label: "Overdue Alerts", value: "0", trend: "0" },
            { label: "Avg SLA resolution time", value: "11 days", trend: "-3 days" },
          ],
        };
      case "dpia-assessments":
        return {
          title: "PIA & DPIA Assessments",
          icon: <FileCheck2 className="w-6 h-6 text-amber-500" />,
          desc: "Conduct Privacy Impact Assessments to treating processing risks.",
          stats: [
            { label: "Active Assessments", value: "8", trend: "+2" },
            { label: "Treatments Pending", value: `${dpiaMitigations.filter(m => !m.mitigated).length}`, trend: "-1" },
            { label: "High Risk Systems", value: "3", trend: "-1" },
          ],
        };
      case "vendor-risk":
        return {
          title: "Vendor Risk Management",
          icon: <Building2 className="w-6 h-6 text-rose-500" />,
          desc: "Assess third-party vendors, manage Standard Contractual Clauses (SCCs), and score risk.",
          stats: [
            { label: "Active Vendors", value: `${vendorList.length}`, trend: "+14" },
            { label: "High Risk Vendors", value: `${vendorList.filter(v => v.risk === "High").length}`, trend: "0" },
            { label: "DPAs Completed", value: `${vendorList.filter(v => v.dpa.includes("Signed")).length}`, trend: "+4" },
          ],
        };
      case "whistleblower":
        return {
          title: "Ethics & Whistleblower",
          icon: <AlertTriangle className="w-6 h-6 text-purple-500" />,
          desc: "Secure, anonymous communication portal for reporting ethical & data privacy infractions.",
          stats: [
            { label: "Active Cases", value: `${casesList.filter(c => c.status !== "Closed - Action Taken").length}`, trend: "+1" },
            { label: "Closed Cases", value: `${casesList.filter(c => c.status === "Closed - Action Taken").length}`, trend: "+2" },
            { label: "Avg Triage Response", value: "24h", trend: "-4h" },
          ],
        };
      case "esg-sustainability":
        return {
          title: "ESG & Sustainability",
          icon: <HeartPulse className="w-6 h-6 text-teal-500" />,
          desc: "Log carbon emissions, environmental impacts, and supply chain board compliance standards.",
          stats: [
            { label: "Emissions Target Reduction", value: "11.2t CO2", trend: "-4.2%" },
            { label: "Total Initiatives", value: `${esgInitiatives.length}`, trend: "+2" },
            { label: "Board ESG Score", value: "A-", trend: "Stable" },
          ],
        };
      default:
        return {
          title: "Trust & Privacy Management",
          icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
          desc: "Comprehensive trust, privacy, and governance modules.",
          stats: [
            { label: "Overall Health", value: "94/100", trend: "+1" },
            { label: "Active Policies", value: "24", trend: "0" },
            { label: "Pending Actions", value: "12", trend: "-3" },
          ],
        };
    }
  };

  const info = getModuleInfo();

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
              {info.icon}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {info.title}
            </h1>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            {info.desc}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDrawerOpen(true)} className="px-4 py-2 bg-white text-slate-700 text-sm font-bold rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer">
            <HelpCircle className="w-4 h-4" />
            Help Me Understand
          </button>
          <button onClick={() => showToast("Generating compliance audit report. This may take a few moments.", "success")} className="px-4 py-2 bg-white text-slate-700 text-sm font-bold rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer">
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
          <button 
            onClick={() => {
              if (moduleId === "data-mapping") setShowAddActivityModal(true);
              else showToast(`New ${info.title} entry wizard activated. Adjust details below.`, "info");
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {info.stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col"
          >
            <span className="text-sm font-semibold text-slate-500 mb-2 font-mono">
              {stat.label}
            </span>
            <div className="flex items-end justify-between mt-auto">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </span>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-md ${stat.trend.startsWith("+") && stat.trend !== "+0" ? "bg-emerald-100 text-emerald-700" : stat.trend.startsWith("-") ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}
              >
                {stat.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {/* Sub-Tabs */}
        <div className="flex items-center border-b border-slate-100 px-2 pt-2 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Overview & Records" },
            ...(moduleId === "data-mapping" ? [{ id: "visual-flow", label: "Visual Flow Chart" }] : []),
            { id: "activities", label: "Discovery & Tools" },
            { id: "settings", label: "Schedules & Controls" },
            { id: "badge", label: "Badge Generator" },
            { id: "budget-audit", label: "Budget Audit" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-bold capitalize whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-700 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ---------------------------------------------------------------------
            TAB: OVERVIEW
            --------------------------------------------------------------------- */}
        {activeTab === "budget-audit" && (
          <div className="animate-fade-in">
            <PrivacyBudgetAuditTab />
          </div>
        )}
        {activeTab === "badge" && (
          <div className="p-4 sm:p-5 lg:p-6">
            <BadgeGenerator />
            <button
              onClick={() => setIsBadgeModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold"
            >
              Open Badge Modal
            </button>
            <BadgeModal 
              isOpen={isBadgeModalOpen} 
              onClose={() => setIsBadgeModalOpen(false)} 
              companyName="Acme Corp" 
              status="GDPR Compliant"
            />
          </div>
        )}
        {activeTab === "visual-flow" && moduleId === "data-mapping" && (
          <div className="p-4 sm:p-5 lg:p-6 animate-fade-in">
            <DataMappingDashboard />
          </div>
        )}
        {activeTab === "overview" && (
          <div className="animate-fade-in h-full">
            {moduleId === "cookie-consent" ? (
              <MCPManager />
            ) : moduleId === "dsar-management" ? (
              <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Active DSAR Requests</h3>
                    <p className="text-xs text-slate-500 mt-1">Select a request record to execute identity verification and automated privacy purges across internal infrastructure.</p>
                  </div>
                  <button
                    onClick={handleOpenAddDsar}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add DSAR Request
                  </button>
                </div>

                {/* DSAR Filters */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input 
                      type="text"
                      placeholder="Search requests by name, email, ID..."
                      value={dsarSearchText}
                      onChange={(e) => setDsarSearchText(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
                    />
                  </div>

                  <div>
                    <select 
                      value={dsarTypeFilter}
                      onChange={(e) => setDsarTypeFilter(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none text-slate-700"
                    >
                      <option value="ALL">All Request Types</option>
                      <option value="Right to Erasure">Right to Erasure</option>
                      <option value="Data Access">Data Access</option>
                      <option value="Data Portability">Data Portability</option>
                      <option value="Right to Rectification">Right to Rectification</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Left Column: Requests List */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dsarRequests
                        .map((req, originalIndex) => ({ req, originalIndex }))
                        .filter(({ req }) => {
                          const matchSearch = req.name.toLowerCase().includes(dsarSearchText.toLowerCase()) ||
                                              req.email.toLowerCase().includes(dsarSearchText.toLowerCase()) ||
                                              req.id.toLowerCase().includes(dsarSearchText.toLowerCase());
                          const matchType = dsarTypeFilter === "ALL" || req.type === dsarTypeFilter;
                          return matchSearch && matchType;
                        })
                        .map(({ req, originalIndex }) => (
                          <div
                            key={req.id}
                            onClick={() => {
                              setSelectedDsar(req);
                              setDsarActionState("idle");
                              setDsarActionProgress(0);
                            }}
                            className={`border rounded-xl p-4 flex flex-col bg-white shadow-sm transition-all cursor-pointer relative group ${
                              selectedDsar?.id === req.id ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                                {req.id}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    req.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                                    req.status === "New" ? "bg-blue-100 text-blue-700" :
                                    "bg-indigo-100 text-indigo-700"
                                  }`}
                                >
                                  {req.status}
                                </span>
                              </div>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">{req.name}</h4>
                            <p className="text-xs font-semibold text-indigo-600 mb-4">{req.type}</p>
                            <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                              <span className="text-[10px] text-slate-400 font-semibold">{req.email}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditDsar(req, originalIndex);
                                  }}
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                                  title="Edit Request"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDsar(originalIndex);
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                                  title="Delete Request"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 ml-1">
                                  Fulfill <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      {dsarRequests.filter(req => {
                        const matchSearch = req.name.toLowerCase().includes(dsarSearchText.toLowerCase()) ||
                                            req.email.toLowerCase().includes(dsarSearchText.toLowerCase()) ||
                                            req.id.toLowerCase().includes(dsarSearchText.toLowerCase());
                        const matchType = dsarTypeFilter === "ALL" || req.type === dsarTypeFilter;
                        return matchSearch && matchType;
                      }).length === 0 && (
                        <div className="col-span-2 text-center py-8 text-slate-400 text-xs italic bg-white border border-dashed border-slate-200 rounded-xl">
                          No DSAR requests matched criteria.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Interactive Processing Panel */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                    {selectedDsar ? (
                      <div className="space-y-4">
                        <div className="border-b border-slate-200 pb-3">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 font-mono">Request File Panel</span>
                          <h4 className="font-bold text-slate-900 text-base">{selectedDsar.name}</h4>
                          <p className="text-xs text-slate-500">{selectedDsar.email}</p>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Jurisdiction:</span>
                            <span className="font-semibold text-slate-700">{selectedDsar.country}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Request Type:</span>
                            <span className="font-bold text-indigo-600">{selectedDsar.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">SLA Due:</span>
                            <span className="font-semibold text-rose-600">Within {selectedDsar.due}</span>
                          </div>
                        </div>

                        {dsarActionState === "idle" && (
                          <div className="space-y-3 pt-3 border-t border-slate-200">
                            <p className="text-xs text-slate-500">To comply with global regulatory guidelines, please verify identity of the data subject prior to data extraction or deletion actions.</p>
                            <button
                              onClick={() => processDsarRequest(selectedDsar)}
                              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                              Fulfill & Validate Compliance Request
                            </button>
                          </div>
                        )}

                        {dsarActionState === "processing" && (
                          <div className="space-y-4 pt-3 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Processing Lifecycle...</span>
                              <span className="text-[10px] text-slate-400 italic">Audit Log Active</span>
                            </div>
                            
                            <DsarProgressTracker 
                              steps={getDsarSteps(selectedDsar.type)}
                              currentStepIndex={Math.floor((dsarActionProgress / 100) * 6)}
                            />
                            
                            <p className="text-[11px] text-slate-600 mt-4 p-2 bg-indigo-50/50 rounded border border-indigo-100/50">
                              {dsarActionStep}
                            </p>
                          </div>
                        )}

                        {dsarActionState === "completed" && (
                          <div className="space-y-4 pt-3 border-t border-slate-200 text-center">
                            <div className="mx-auto w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                              <Check className="w-5 h-5 stroke-[3px]" />
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-900 text-xs">Request Successfully Fulfilled</h5>
                              <p className="text-[11px] text-slate-500 mt-1">GDPR erasure completed across internal databases. Regulatory evidence signed and logged in audit ledger.</p>
                            </div>
                            <div className="bg-slate-900 text-left p-3 rounded-lg border border-slate-800 font-mono text-[9px] text-emerald-400 break-all space-y-1">
                              <span className="text-slate-400 block font-bold">MUTABLE LEDGER BLOCK</span>
                              <span>TX_HASH: 0x8a92f...b3c419c8</span>
                              <span className="text-indigo-300 block">Status: VERIFIED_PURGE</span>
                            </div>
                            <button
                              onClick={() => setSelectedDsar(null)}
                              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded"
                            >
                              Close File
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400 space-y-2">
                        <Inbox className="w-8 h-8 text-slate-300" />
                        <p className="text-xs">Select any request on the left to initiate regulatory processing, identity clearance, and direct database compliance runs.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : moduleId === "data-mapping" ? (
              <DataMappingManager 
                activities={dataActivities} 
                onAdd={() => {
                  setEditingActivityIndex(null);
                  setNewActivity({ name: "", basis: "Consent", data: "", storage: "", risk: "Medium" });
                  setShowAddActivityModal(true);
                }} 
                onEdit={handleEditActivityOpen}
                onDelete={handleDeleteActivity}
              />
            ) : moduleId === "vendor-risk" ? (
              <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Third-Party Processor Assessments</h3>
                  <p className="text-xs text-slate-500 mt-1">Cross-reference vendors with compliance registers and review contractual Data Processing Agreements (DPA).</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                  {/* Left list */}
                  <div className="xl:col-span-2 space-y-3">
                    <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
                      <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-4 py-3">Vendor Name</th>
                            <th className="px-4 py-3">Service Category</th>
                            <th className="px-4 py-3">Contractual DPA</th>
                            <th className="px-4 py-3">Risk Assessment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {vendorList.map((row, i) => (
                            <tr
                              key={i}
                              onClick={() => setSelectedVendorForAudit(row)}
                              className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                                selectedVendorForAudit?.id === row.id ? "bg-slate-50 border-l-4 border-l-rose-500" : ""
                              }`}
                            >
                              <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                {row.name}
                              </td>
                              <td className="px-4 py-3 text-slate-600 text-xs">{row.category}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-indigo-600">{row.dpa}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  row.risk === "High" ? "bg-rose-100 text-rose-700" :
                                  row.risk === "Medium" ? "bg-amber-100 text-amber-700" :
                                  "bg-emerald-100 text-emerald-700"
                                }`}>
                                  {row.risk}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Vendor Details Sidebar */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                    {selectedVendorForAudit ? (
                      <div className="space-y-4">
                        <div className="border-b border-slate-200 pb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Vendor Profile</span>
                          <h4 className="font-bold text-slate-900 text-base">{selectedVendorForAudit.name}</h4>
                          <span className="text-xs text-slate-500">{selectedVendorForAudit.category}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{selectedVendorForAudit.details}</p>

                        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Last Assessment Run:</span>
                            <span className="font-semibold text-slate-700">{selectedVendorForAudit.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Contractual DPA:</span>
                            <span className="font-bold text-emerald-600">{selectedVendorForAudit.dpa}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200">
                          <button
                            onClick={() => {
                              setActiveTab("activities");
                              showToast(`Launching specialized Vendor Audit questionnaire for ${selectedVendorForAudit.name}`, "info");
                            }}
                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
                          >
                            <Brain className="w-3.5 h-3.5 text-rose-400" />
                            Perform AI Compliance Audit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400 space-y-2">
                        <Building2 className="w-8 h-8 text-slate-300" />
                        <p className="text-xs">Select any vendor record on the left to verify contractual status, audit trails, and data processing architectures.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : moduleId === "dpia-assessments" ? (
              <div className="space-y-4 sm:space-y-6">
                <PiaDpiaManager />
              </div>
            ) : moduleId === "whistleblower" ? (
              <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Secure Ethics & Whistleblower Reports</h3>
                  <p className="text-xs text-slate-500 mt-1">Secure, anonymous dialogue portal for investigations under the EU Whistleblower Directive.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Left cases list */}
                  <div className="space-y-3">
                    {casesList.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCase(c)}
                        className={`p-4 rounded-xl border bg-white shadow-sm transition-all cursor-pointer space-y-2 hover:border-slate-300 ${
                          selectedCase?.id === c.id ? "border-purple-500 ring-2 ring-purple-500/20" : "border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono text-slate-400 font-bold">{c.id}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                            c.severity === "Critical" ? "bg-rose-100 text-rose-800" :
                            c.severity === "High" ? "bg-amber-100 text-amber-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {c.severity}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs">{c.category}</h4>
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span>{c.date}</span>
                          <span className="font-semibold text-indigo-600">{c.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Chat Dialog */}
                  <div className="lg:col-span-2 border border-slate-200 bg-slate-50 rounded-2xl flex flex-col min-h-[400px] overflow-hidden">
                    {selectedCase ? (
                      <div className="flex-grow flex flex-col h-full">
                        {/* Header */}
                        <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-slate-400 font-bold">{selectedCase.id}</span>
                              <span className="text-xs font-extrabold text-slate-800">{selectedCase.category}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 max-w-md truncate">{selectedCase.desc}</p>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Anonymous Channel Active</span>
                        </div>

                        {/* Dialogue List */}
                        <div className="p-4 flex-grow space-y-3 overflow-y-auto max-h-[260px]">
                          {selectedCase.chat.map((msg: any, i: number) => (
                            <div key={i} className={`flex flex-col max-w-[80%] ${msg.sender === "admin" ? "ml-auto items-end" : "mr-auto items-start"}`}>
                              <span className="text-[8px] text-slate-400 font-semibold mb-1">{msg.sender === "admin" ? "Compliance Auditor" : "Anonymous Whistleblower"} • {msg.time}</span>
                              <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                                msg.sender === "admin" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                              }`}>
                                {msg.msg}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Input Box */}
                        <div className="p-3 bg-white border-t border-slate-200 mt-auto flex gap-2">
                          <input
                            type="text"
                            value={newAdminMsgText}
                            onChange={(e) => setNewAdminMsgText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendAdminMessage()}
                            placeholder="Type an anonymous secure reply..."
                            className="flex-grow px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                          />
                          <button
                            onClick={handleSendAdminMessage}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center text-center p-12 text-slate-400 space-y-2">
                        <Lock className="w-8 h-8 text-slate-300 animate-pulse" />
                        <p className="text-xs font-semibold">Decryption Key Authorized</p>
                        <p className="text-[11px] max-w-sm">Select any whistleblower file folder on the left. The system utilizes military-grade asymmetrical encryption to routing anonymous audit messages.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : moduleId === "dpia-assessments" ? (
              <div className="space-y-4 sm:space-y-6">
                <PiaDpiaManager />
              </div>
            ) : moduleId === "whistleblower" ? (
              <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                 <WhistleblowerPortal cases={casesList} onSelectCase={setSelectedCase} />
              </div>
            ) : moduleId === "esg-sustainability" ? (
              <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                <EsgSustainabilityManager />
              </div>
            ) : (
              <div className="p-5 sm:p-6 lg:p-8 text-center text-slate-400">
                <p>Module selected ({moduleId}) is fully active. Use the sub-tabs above to access actions and diagnostic utilities.</p>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------------
            TAB: ACTIVITIES (DISCOVERY & INTERACTIVE TOOLS)
            --------------------------------------------------------------------- */}
        {activeTab === "activities" && (
          <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 animate-fade-in">
            {moduleId === "data-mapping" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-indigo-950 text-indigo-100 p-5 rounded-2xl border border-indigo-900 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold font-mono text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Continuous PII Auto-Discovery Scanner
                    </h3>
                    <p className="text-xs text-indigo-200 max-w-xl">
                      Utilizes Jaro-Winkler schema pattern matching and LLM-assisted vector categorization to audit data architectures for undeclared customer records.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <select
                      value={selectedDataSource}
                      onChange={(e) => setSelectedDataSource(e.target.value)}
                      className="px-3 py-2 bg-indigo-900 border border-indigo-800 rounded-lg text-xs text-white focus:outline-none"
                    >
                      <option value="Postgres Customers DB">Postgres Customers DB</option>
                      <option value="S3 Billing Logs">S3 Billing Logs</option>
                      <option value="Salesforce API">Salesforce CRM API</option>
                      <option value="Redshift User Analytics">Amazon Redshift Analytics</option>
                    </select>
                    <button
                      onClick={startMappingScan}
                      disabled={mappingScanState === "scanning"}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {mappingScanState === "scanning" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                      {mappingScanState === "scanning" ? "Scanning..." : "Trigger Discovery Scan"}
                    </button>
                  </div>
                </div>

                {mappingScanState === "scanning" && (
                  <div className="border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 bg-slate-50 space-y-4 animate-pulse">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Analysing schema vectors...</span>
                      <span className="font-mono text-indigo-600 font-extrabold">{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-[10px] text-emerald-400 h-28 overflow-y-auto space-y-1">
                      {scanLogs.map((log, idx) => (
                        <div key={idx}>{log}</div>
                      ))}
                    </div>
                  </div>
                )}

                {mappingScanState === "done" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Scan Results: 5 Critical Assets Identified
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Completed just now</span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-x-auto">
                      <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px]">
                          <tr>
                            <th className="px-4 py-2.5">Source Schema/Table</th>
                            <th className="px-4 py-2.5">Detected Attribute</th>
                            <th className="px-4 py-2.5">Sensitive Category</th>
                            <th className="px-4 py-2.5">Heuristic Confidence</th>
                            <th className="px-4 py-2.5">Assigned legal basis</th>
                            <th className="px-4 py-2.5 text-right">Integrate Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {discoveredPII.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5 font-mono text-slate-600">{item.table}</td>
                              <td className="px-4 py-2.5 font-bold text-slate-800">{item.column}</td>
                              <td className="px-4 py-2.5 font-medium text-slate-700">{item.type}</td>
                              <td className="px-4 py-2.5 text-slate-500 font-mono">{item.reason}</td>
                              <td className="px-4 py-2.5">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border text-[10px] font-semibold">{item.basis}</span>
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  onClick={() => {
                                    setDataActivities(prev => [
                                      { name: `Discovered [${item.table}.${item.column}]`, basis: item.basis, data: item.type, storage: selectedDataSource, risk: item.type.includes("Special") ? "High" : "Medium" },
                                      ...prev
                                    ]);
                                    showToast(`Successfully mapped [${item.table}.${item.column}] into your persistent corporate assets inventory registry.`, "success");
                                  }}
                                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-[10px] rounded transition-colors"
                                >
                                  Register Asset
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {mappingScanState === "idle" && (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mx-auto border border-indigo-100">
                      <Network className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <p className="text-sm font-bold text-slate-800">Undeclared Data Discovery Hub</p>
                      <p className="text-xs text-slate-500 mt-1">Run active crawler algorithms to query database tables, S3 logs, and third-party SaaS endpoints to verify that your data map perfectly mirrors actual production storage environments.</p>
                    </div>
                    <button
                      onClick={startMappingScan}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm"
                    >
                      Trigger Initial Database Discovery Scan
                    </button>
                  </div>
                )}
              </div>
            )}

            {moduleId === "cookie-consent" && (
              <div className="space-y-4 sm:space-y-6">
                <AutonomousConsentOrchestrator />
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Automated Compliance Scanner (Consent Integrity)</h4>
                      <p className="text-xs text-slate-500">Scan website domains for undeclared trackers or non-compliant behavioral marketing scripts.</p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedScanDomain}
                        onChange={(e) => setSelectedScanDomain(e.target.value)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none"
                      >
                        <option value="www.acme-corp.com">www.acme-corp.com</option>
                        <option value="shop.acme-corp.com">shop.acme-corp.com</option>
                        <option value="blog.acme-corp.com">blog.acme-corp.com</option>
                      </select>
                      <button
                        onClick={startCookieScan}
                        disabled={cookieScanState === "scanning"}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        {cookieScanState === "scanning" ? "Crawling..." : "Crawl Domain"}
                      </button>
                    </div>
                  </div>

                  {cookieScanState === "scanning" && (
                    <div className="space-y-3 pt-3 border-t border-slate-100 text-center py-4 sm:py-6">
                      <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-600 font-semibold">Scanning DOM, local storage, and cookies on {selectedScanDomain}...</p>
                      <div className="w-1/2 bg-slate-200 h-1.5 rounded-full mx-auto overflow-hidden">
                        <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${cookieScanProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {cookieScanState === "done" && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 animate-fade-in">
                      <div className="flex items-center justify-between text-xs text-slate-700">
                        <span className="font-bold">Scan Finished for {selectedScanDomain}</span>
                        <span className="font-semibold text-rose-600">Warning: 1 Uncategorized script detected</span>
                      </div>

                      <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 font-bold">
                            <tr>
                              <th className="px-3 py-2">Tracker Name</th>
                              <th className="px-3 py-2">Assigned Category</th>
                              <th className="px-3 py-2">Persistence</th>
                              <th className="px-3 py-2">Shield Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {discoveredCookies.map((c, i) => (
                              <tr key={i}>
                                <td className="px-3 py-2 text-slate-800 font-bold">{c.name}</td>
                                <td className="px-3 py-2 text-indigo-600 font-sans font-semibold">{c.category}</td>
                                <td className="px-3 py-2 text-slate-500">{c.persistence}</td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-0.5 rounded font-sans text-[10px] font-bold ${
                                    c.status.includes("Warning") || c.status.includes("Blocked") ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700"
                                  }`}>
                                    {c.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {moduleId === "dsar-management" && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Regulatory Proof of Erasure Audit Ledger</h4>
                  <p className="text-xs text-slate-500">GDPR compliance audit trail proving data erasures (Art. 17) and subject access resolutions (Art. 15).</p>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
                  <table className="w-full text-left text-xs md:text-sm font-mono">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Block Hash</th>
                        <th className="px-4 py-3">Request ID</th>
                        <th className="px-4 py-3">Regulatory Action</th>
                        <th className="px-4 py-3">Timestamp (UTC)</th>
                        <th className="px-4 py-3 text-right">Verification Signature</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {[
                        { hash: "0x8fa92...e1c4", id: "REQ-8431", action: "Subject Deletion (Art.17)", time: "2026-06-25 10:12:05", sig: "verified_gdpr_purge" },
                        { hash: "0xd182b...44a9", id: "REQ-8430", action: "Access File Dispatch (Art.15)", time: "2026-06-24 14:35:12", sig: "verified_gdpr_access" },
                        { hash: "0x992c1...9fb5", id: "REQ-8422", action: "Subject Deletion (Art.17)", time: "2026-06-21 08:22:18", sig: "verified_gdpr_purge" },
                        { hash: "0xe8192...df42", id: "REQ-8420", action: "Correction Rectified (Art.16)", time: "2026-06-18 16:04:40", sig: "verified_gdpr_rectify" },
                      ].map((led, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-indigo-600 font-bold">{led.hash}</td>
                          <td className="px-4 py-3 text-slate-700 font-sans">{led.id}</td>
                          <td className="px-4 py-3 font-sans font-semibold text-slate-900">{led.action}</td>
                          <td className="px-4 py-3 text-slate-500">{led.time}</td>
                          <td className="px-4 py-3 text-right text-[10px] font-sans font-extrabold text-emerald-600 uppercase bg-emerald-50/50">
                            {led.sig}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {moduleId === "dpia-assessments" && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Interactive Risk Treatment Registry</h4>
                  <p className="text-xs text-slate-500">Apply operational compliance controls to mitigate high privacy impact processes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dpiaMitigations.map((mit) => (
                    <div key={mit.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono text-slate-400 font-bold">{mit.id}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                            mit.mitigated ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}>
                            {mit.mitigated ? "Mitigated" : "Action Required"}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{mit.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed"><strong>Threat Scenario:</strong> {mit.threat}</p>
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 font-mono">
                          <strong>Operational Control:</strong> {mit.control}
                        </p>
                      </div>

                      {!mit.mitigated ? (
                        <button
                          onClick={() => {
                            setDpiaMitigations(prev => prev.map(m => m.id === mit.id ? { ...m, mitigated: true } : m));
                            showToast(`Operational security control applied: [${mit.control}] now logged as an active mitigation treatment.`, "success");
                          }}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer mt-2 flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Apply Control & Mitigation
                        </button>
                      ) : (
                        <div className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 mt-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Compliance signed off on control mitigation
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {moduleId === "vendor-risk" && (
              <div className="space-y-4 sm:space-y-6">
                <SanctionsPepScreeningEnclave />
                <div className="bg-slate-900 text-slate-100 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-800">
                  <h4 className="text-sm font-bold font-mono text-indigo-300 flex items-center gap-1.5 mb-4">
                    <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
                    AI-Assisted Third Party Questionnaire Evaluation
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Form Controls */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Target Processor</label>
                        <select
                          className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:outline-none"
                          onChange={(e) => {
                            const vnd = vendorList.find(v => v.id === e.target.value);
                            setSelectedVendorForAudit(vnd);
                          }}
                        >
                          <option value="">Select Vendor to Evaluate...</option>
                          {vendorList.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">1. Does the vendor encrypt data at rest using AES-256?</label>
                          <select
                            value={questionAnswers.q1}
                            onChange={(e) => setQuestionAnswers(prev => ({ ...prev, q1: e.target.value }))}
                            className="bg-slate-800 border border-slate-700 text-white text-xs rounded p-1.5 w-32"
                          >
                            <option value="yes">Yes (Compliant)</option>
                            <option value="no">No (Violation)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">2. Is the hosting strictly confined inside the EU/EEA region?</label>
                          <select
                            value={questionAnswers.q2}
                            onChange={(e) => setQuestionAnswers(prev => ({ ...prev, q2: e.target.value }))}
                            className="bg-slate-800 border border-slate-700 text-white text-xs rounded p-1.5 w-32"
                          >
                            <option value="yes">Yes (Compliant)</option>
                            <option value="no">No (Warning)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">3. Does the vendor share data with external sub-processors?</label>
                          <select
                            value={questionAnswers.q3}
                            onChange={(e) => setQuestionAnswers(prev => ({ ...prev, q3: e.target.value }))}
                            className="bg-slate-800 border border-slate-700 text-white text-xs rounded p-1.5 w-32"
                          >
                            <option value="yes">Yes (Sub-processing active)</option>
                            <option value="no">No (Restricted)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">4. Is there an active contractual DPA signed containing Standard Contractual Clauses (SCCs)?</label>
                          <select
                            value={questionAnswers.q4}
                            onChange={(e) => setQuestionAnswers(prev => ({ ...prev, q4: e.target.value }))}
                            className="bg-slate-800 border border-slate-700 text-white text-xs rounded p-1.5 w-32"
                          >
                            <option value="yes">Yes (SCCs Active)</option>
                            <option value="no">No (Unenforceable)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={runVendorAudit}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Calculate Third-Party Alignment Score
                      </button>
                    </div>

                    {/* Results Box */}
                    <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
                      {vendorAuditState === "idle" && (
                        <div className="text-center py-12 text-slate-500 space-y-2">
                          <Scale className="w-8 h-8 mx-auto text-slate-600" />
                          <p className="text-xs">Select questions answers and click Calculate to run compliance heuristics assessment.</p>
                        </div>
                      )}

                      {vendorAuditState === "auditing" && (
                        <div className="text-center py-12 text-slate-400 space-y-2">
                          <RefreshCw className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
                          <p className="text-xs">Re-indexing scoring matrices...</p>
                        </div>
                      )}

                      {vendorAuditState === "results" && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="text-center">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Vendor Compliance Score</span>
                            <span className={`text-5xl font-black ${vendorAuditScore > 80 ? "text-emerald-400" : vendorAuditScore > 60 ? "text-amber-400" : "text-rose-400"}`}>
                              {vendorAuditScore}/100
                            </span>
                          </div>

                          <div className="text-xs space-y-2 text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${questionAnswers.q1 === "yes" ? "bg-emerald-500" : "bg-rose-500"}`} />
                              <span>Encryption Control: {questionAnswers.q1 === "yes" ? "PASSED (Safe)" : "FAILED (Critical risk discovered)"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${questionAnswers.q2 === "yes" ? "bg-emerald-500" : "bg-amber-500"}`} />
                              <span>Geographical Boundaries: {questionAnswers.q2 === "yes" ? "PASSED (confined to EU)" : "WARNING (Data transfers to non-EU endpoints)"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${questionAnswers.q4 === "yes" ? "bg-emerald-500" : "bg-rose-500"}`} />
                              <span>SCC Contractual enforceability: {questionAnswers.q4 === "yes" ? "PASSED (DPA compliant)" : "FAILED (No binding legal standard found)"}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-indigo-950/40 border border-indigo-900 rounded-lg text-[11px] leading-relaxed text-indigo-200">
                            <strong>Regulatory Verdict:</strong> {
                              vendorAuditScore === 100 ? "Vendor approved for standard processing activities. Low systemic privacy risk." :
                              vendorAuditScore > 70 ? "Vendor requires supplementary risk review. Ensure annual audit documents are updated." :
                              "CRITICAL FAILURE: Suspended processing activity recommended until contractual standard contractual clauses are executed."
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {moduleId === "whistleblower" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Anonymous Encryption Audit & Access Ledger</h4>
                    <p className="text-xs text-slate-500">Immutable decentralized access trail tracking who accessed which ethics dossier files under whistleblower protections.</p>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-x-auto font-mono text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 font-bold">
                        <tr>
                          <th className="px-3 py-2">Decryption Session ID</th>
                          <th className="px-3 py-2">Dossier Case File</th>
                          <th className="px-3 py-2">Authorization Level</th>
                          <th className="px-3 py-2">Access Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { sess: "DEC-881a7b", file: "WB-2026-042 (Germany Expense Impropriety)", auth: "Dual-Key Compliance Auditor", status: "Access Granted - PGP Decrypted" },
                          { sess: "DEC-99120c", file: "WB-2026-041 (Systemic Exclusion)", auth: "HR Director Key-A", status: "Authorization Denied - Insufficient signatures" },
                          { sess: "DEC-5511fb", file: "WB-2026-040 (Slack Marketing Leak)", auth: "DPO Key-Store Signature", status: "Access Granted - Isolated dossier" },
                        ].map((acc, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-indigo-600 font-bold">{acc.sess}</td>
                            <td className="px-3 py-2 text-slate-800 font-sans">{acc.file}</td>
                            <td className="px-3 py-2 text-slate-600 font-sans font-semibold">{acc.auth}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded font-sans font-bold text-[10px] ${
                                acc.status.includes("Denied") ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {acc.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {moduleId === "esg-sustainability" && (
              <div className="space-y-6 animate-fade-in">
                {/* Add new entry form */}
                <form onSubmit={handleAddInitiative} className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" /> Log New Environmental & Governance Compliance Initiative
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action Name</label>
                      <input
                        type="text"
                        value={newInitiative.name}
                        onChange={(e) => setNewInitiative(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="E.g. Transition office to local hydro power..."
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scope</label>
                      <select
                        value={newInitiative.scope}
                        onChange={(e) => setNewInitiative(prev => ({ ...prev, scope: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                      >
                        <option value="Scope 1">Scope 1 (Direct Emissions)</option>
                        <option value="Scope 2">Scope 2 (Indirect Grid)</option>
                        <option value="Scope 3">Scope 3 (Supply Chain & SaaS)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CO2 Reduction Offset</label>
                      <input
                        type="text"
                        value={newInitiative.reduction}
                        onChange={(e) => setNewInitiative(prev => ({ ...prev, reduction: e.target.value }))}
                        placeholder="E.g. 2.4 tons..."
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operational Status</label>
                      <select
                        value={newInitiative.status}
                        onChange={(e) => setNewInitiative(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                      >
                        <option value="Planned">Planned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Implemented">Implemented</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Log Carbon Initiative Offset
                    </button>
                  </div>
                </form>

                {/* Initiatives list */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
                  <table className="w-full text-left text-xs md:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Green Initiative Program</th>
                        <th className="px-4 py-3">Reporting Scope</th>
                        <th className="px-4 py-3">Offset Carbon Reduction</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Compliance Review Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {esgInitiatives.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                          <td className="px-4 py-3 font-mono text-slate-600">{item.scope}</td>
                          <td className="px-4 py-3 text-emerald-600 font-bold">{item.reduction}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              item.status === "Implemented" ? "bg-emerald-100 text-emerald-700" :
                              item.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                              "bg-slate-100 text-slate-700"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{item.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------------
            TAB: SETTINGS (SCHEDULES & CONTROLS)
            --------------------------------------------------------------------- */}
        {activeTab === "settings" && (
          <div className="p-4 sm:p-5 lg:p-6 max-w-3xl space-y-4 sm:space-y-6 animate-fade-in">
            {moduleId === "data-mapping" && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  Continuous Asset Scan Controls
                </h4>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Continuous Compliance Crawler Schedule</label>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option>Daily Crawler Run (Recommended)</option>
                      <option>Weekly Crawler Run</option>
                      <option>Monthly Crawler Run</option>
                      <option>Manual Trigger Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">PII Classification Match Threshold ({scanProgress || 80}%)</label>
                    <input type="range" min="50" max="100" defaultValue="80" className="w-full accent-indigo-600" />
                    <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Heuristic matching patterns below this threshold will be flagged as Review Required.</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Integration Connectors</label>
                    <div className="grid grid-cols-2 gap-2 pt-1 font-semibold text-slate-700">
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> PostgreSQL Instance DB</label>
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Amazon S3 Buckets</label>
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Snowflake Analytics Data warehouse</label>
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Salesforce OAuth Contacts API</label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                  <button onClick={() => showToast("Data mapping configurations updated successfully.", "success")} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                    Save Configuration
                  </button>
                </div>
              </div>
            )}

            {moduleId === "cookie-consent" && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  Consent Banner & Cookie Shield Controls
                </h4>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Geo-Location Policy Targeting</label>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option>Strict Opt-in for EU GDPR, Opt-out for global jurisdictions</option>
                      <option>Strict Opt-in globally (Highest privacy rating)</option>
                      <option>Region-aware adaptive banners</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cookie Auto-Block Shield</label>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option>Block all un-categorized third party cookies (GDPR Compliant)</option>
                      <option>Allow essential only, prompt for analytical scripts</option>
                      <option>Manual categorization only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Consent Validation Period</label>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option>365 Days (Prompt re-consent annually)</option>
                      <option>180 Days (Prompt re-consent semi-annually)</option>
                      <option>Unlimited</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                  <button onClick={() => showToast("Cookie & Consent configurations successfully updated.", "success")} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                    Save Configuration
                  </button>
                </div>
              </div>
            )}

            {moduleId === "dsar-management" && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  DSAR Portal Intake & Authentication Settings
                </h4>

                <div className="space-y-4 text-xs font-medium text-slate-700">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Identity Verification Strength</label>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option>Two-Factor Email validation OTP Code (Recommended)</option>
                      <option>Government Issued Photo ID document verification</option>
                      <option>Biometric video/selfie correlation check</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Resolution SLA Alerts (SLA threshold limit: 30 days under GDPR)</label>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option>Alert Compliance Auditor when 10 days remaining</option>
                      <option>Alert Compliance Auditor when 5 days remaining</option>
                      <option>Auto-assign priority critical levels dynamically</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Enabled Intake Form Categories</label>
                    <div className="grid grid-cols-2 gap-2 pt-1 font-semibold text-slate-700">
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Right to Erasure / Purge Data</label>
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Right of Access / Download Archive</label>
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Right of Rectification / Edit Info</label>
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Right to Object to Targeted profiling</label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                  <button onClick={() => showToast("DSAR Portal settings successfully updated.", "success")} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                    Save Configuration
                  </button>
                </div>
              </div>
            )}

            {moduleId === "dpia-assessments" && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  DPIA Risk Formulas & Signatory Triggers
                </h4>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Default Risk Evaluation Matrix</label>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option>Risk score = Severity (1-5) × Likelihood (1-5)</option>
                      <option>Weighted Severity model (Focus on Special Category Art 9)</option>
                      <option>Qualitative audit only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Automated DPIA Requirements Triggers</label>
                    <div className="space-y-2 pt-1">
                      <label className="flex items-start gap-2">
                        <input type="checkbox" defaultChecked className="mt-0.5" />
                        <span>Force DPIA review if system utilizes biometric data streams</span>
                      </label>
                      <label className="flex items-start gap-2">
                        <input type="checkbox" defaultChecked className="mt-0.5" />
                        <span>Force DPIA review if system uses AI/machine-learning algorithmic profiling</span>
                      </label>
                      <label className="flex items-start gap-2">
                        <input type="checkbox" defaultChecked className="mt-0.5" />
                        <span>Force DPIA review if data is hosted or transferred externally outside the EU/EEA region</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                  <button onClick={() => showToast("DPIA Risk configurations successfully updated.", "success")} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                    Save Configuration
                  </button>
                </div>
              </div>
            )}

            {moduleId === "vendor-risk" && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  Vendor Risk Scoring Metrics & Notifications
                </h4>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Minimum Safe Compliance Score</label>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option>80/100 (High Security Standard)</option>
                      <option>70/100 (Standard Commercial Alignment)</option>
                      <option>60/100 (Lenient Review Threshold)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Preferred DPA Template Clause Selection</label>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option>Consolidated standard EU Standard Contractual Clauses (SCCs)</option>
                      <option>UK International Data Transfer Agreement (IDTA)</option>
                      <option>Asymmetric custom non-disclosure & liability parameters</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assessment Renewal Intercom Schedule</label>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option>Annual re-assessment invitation dispatch (Automated)</option>
                      <option>Semi-annual re-assessment invitation dispatch</option>
                      <option>Continuous monitoring via external webhook integrations</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                  <button onClick={() => showToast("Vendor Risk metrics and alerts successfully saved.", "success")} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                    Save Configuration
                  </button>
                </div>
              </div>
            )}

            {moduleId === "whistleblower" && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  Ethics & Whistleblowing Routing Control Setup
                </h4>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">PGP Dossier Encryption Standard</label>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option>RSA-4096 Multi-Signature Keys (Compliance Vault)</option>
                      <option>ECC Curated Curve25519 asymmetrical encryption</option>
                      <option>Standard server AES-256 with compliance envelope hashing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Critical Dossier Escor-Trigger Routing Rules</label>
                    <div className="space-y-2 pt-1 font-semibold">
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Forward 'Financial Bribery' cases immediately to Board audit directors</label>
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Route 'Executive harassment' direct to legal partners counsel</label>
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Auto-triage whistleblower identity scrubbing before log save</label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                  <button onClick={() => showToast("Ethics & Whistleblowing routing rules updated.", "success")} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                    Save Configuration
                  </button>
                </div>
              </div>
            )}

            {moduleId === "esg-sustainability" && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  ESG Carbon Auditing Standards & Coefficients
                </h4>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Carbon Accounting Reporting Framework</label>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option>EU Corporate Sustainability Reporting Directive (CSRD)</option>
                      <option>Task Force on Climate-related Financial Disclosures (TCFD)</option>
                      <option>Global Reporting Initiative (GRI)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Grid Carbon Intensity Coefficient</label>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option>Local power provider certified averages (Real-time updates)</option>
                      <option>IEA default national averages for host country data servers</option>
                      <option>Strict zero emissions offset allocation certificate overrides</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------------
          MODAL: ADD NEW PROCESSING ACTIVITY
          --------------------------------------------------------------------- */}
      {showAddActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4 sm:p-5 lg:p-6 max-w-lg w-full space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingActivityIndex !== null ? 'Modify Processing Activity Record' : 'Add Processing Activity Record'}
              </h3>
              <button 
                onClick={() => setShowAddActivityModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1">
                <label className="text-slate-600 block">Activity / System Name</label>
                <input
                  type="text"
                  required
                  value={newActivity.name}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="E.g. Lead Generation Campaign, Support ticketing..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">GDPR Lawful Basis (Art. 6)</label>
                <select
                  value={newActivity.basis}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, basis: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                >
                  <option value="Consent">Consent (Art. 6(1)(a))</option>
                  <option value="Contract">Performance of Contract (Art. 6(1)(b))</option>
                  <option value="Legal Obligation">Legal Obligation (Art. 6(1)(c))</option>
                  <option value="Legitimate Interest">Legitimate Interest (Art. 6(1)(f))</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">Data Categories Included</label>
                <input
                  type="text"
                  required
                  value={newActivity.data}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, data: e.target.value }))}
                  placeholder="E.g. IP Address, Email, Credit card digits..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">Storage Destination / SaaS Provider</label>
                <input
                  type="text"
                  required
                  value={newActivity.storage}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, storage: e.target.value }))}
                  placeholder="E.g. AWS S3 (EU-West-1), HubSpot, local Redis..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">Baseline Risk Level</label>
                <select
                  value={newActivity.risk}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, risk: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                >
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* ---------------------------------------------------------------------
          MODAL: ADD / EDIT DSAR REQUEST
          --------------------------------------------------------------------- */}
      {showDsarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4 sm:p-5 lg:p-6 max-w-lg w-full space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingDsarIndex !== null ? 'Modify DSAR Request Details' : 'Register New DSAR Request'}
              </h3>
              <button 
                onClick={() => setShowDsarModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDsar} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1">
                <label className="text-slate-600 block">Subject / Name</label>
                <input
                  type="text"
                  required
                  value={formDsarName}
                  onChange={(e) => setFormDsarName(e.target.value)}
                  placeholder="E.g. Jane Doe"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">Email Address</label>
                <input
                  type="email"
                  required
                  value={formDsarEmail}
                  onChange={(e) => setFormDsarEmail(e.target.value)}
                  placeholder="E.g. jane.doe@domain.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">Request Type</label>
                <select
                  value={formDsarType}
                  onChange={(e) => setFormDsarType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                >
                  <option value="Right to Erasure">Right to Erasure (Art. 17 GDPR)</option>
                  <option value="Data Access">Data Access (Art. 15 GDPR)</option>
                  <option value="Data Portability">Data Portability (Art. 20 GDPR)</option>
                  <option value="Right to Rectification">Right to Rectification (Art. 16 GDPR)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">Status</label>
                <select
                  value={formDsarStatus}
                  onChange={(e) => setFormDsarStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Waiting on User">Waiting on User</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">Country of Origin / Jurisdiction</label>
                <input
                  type="text"
                  value={formDsarCountry}
                  onChange={(e) => setFormDsarCountry(e.target.value)}
                  placeholder="E.g. France, United States"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formDsarUrgent"
                  checked={formDsarUrgent}
                  onChange={(e) => setFormDsarUrgent(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="formDsarUrgent" className="text-slate-600 cursor-pointer">
                  Flag as Urgent / High Priority
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDsarModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  {editingDsarIndex !== null ? 'Update Request' : 'Register Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <HelpMeUnderstandDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title={`${info.title} Explained`}
        steps={[
           { title: "Why this module is necessary", description: "This module addresses critical regulatory requirements and operational risks associated with your industry's data processing activities." },
           { title: "Key features", description: "Provides automated discovery, real-time risk assessment, and integrated compliance reporting tools." },
           { title: "Getting started", description: "Begin by auditing your current data flows and configuring the specific thresholds relevant to your vertical." }
        ]}
      />
    </div>
  );
};

