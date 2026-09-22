import React, { useState, useMemo, useCallback } from "react";
import {
  Umbrella,
  ShieldCheck,
  DollarSign,
  Activity,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  X,
  Shield,
  Plus,
  UploadCloud,
  RefreshCw,
  Download,
  Info,
  ChevronRight,
  HelpCircle,
  FileCheck,
  ShieldAlert,
  Award,
  Lock,
  Settings,
  Terminal,
  Percent
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNotification } from "../context/NotificationContext";

// Interfaces
interface SecurityControl {
  id: string;
  name: string;
  description: string;
  discount: number; // e.g. 0.05 for 5%
  status: "ACTIVE" | "INACTIVE" | "PENALTY" | "PENDING";
  actionLabel: string;
}

interface Claim {
  id: string;
  type: string;
  incidentDate: string;
  amount: number;
  status: "Under Review" | "Investigating" | "Approved" | "Paid" | "Needs Documentation" | "Rejected";
  description: string;
  attachedFile?: string;
  attachedFileSize?: string;
  timelineLogs: string[];
}

export function CyberInsurancePlatform() {
  const { showToast } = useNotification();

  // --- Theme State & Context ---
  // Default to a professional, high-contrast, beautiful slate light-theme style inside the platform dashboard.

  // --- Policy Base & State ---
  const basePremium = 120000; // $120,000 annual base
  const totalCoverageLimit = 50000000; // $50,000,000 total coverage limit

  // --- 1. Dynamic Underwriting Telemetry State ---
  const [controls, setControls] = useState<SecurityControl[]>([
    {
      id: "mfa",
      name: "Global Multi-Factor Authentication",
      description: "Enforced MFA across 100% of identity providers and endpoints.",
      discount: 0.05, // 5% discount
      status: "ACTIVE",
      actionLabel: "Enforced"
    },
    {
      id: "vpn_patches",
      name: "Edge VPN & Gateway Patching",
      description: "Resolving known CVEs on public-facing firewalls and network devices.",
      discount: 0.03, // 3% discount
      status: "PENALTY", // VPN unpatched by default
      actionLabel: "Patch Now"
    },
    {
      id: "ztna",
      name: "Zero Trust Network Access (ZTNA)",
      description: "Micro-segmenting application boundaries to prevent lateral movement.",
      discount: 0.025, // 2.5% discount
      status: "INACTIVE",
      actionLabel: "Activate ZTNA"
    },
    {
      id: "edr",
      name: "Endpoint Detection & Response (EDR)",
      description: "24/7 endpoint telemetry streaming to centralized SIEM controller.",
      discount: 0.04, // 4% discount
      status: "ACTIVE",
      actionLabel: "Active"
    },
    {
      id: "phishing_drills",
      name: "Continuous Phishing Simulations",
      description: "Monthly randomized training and credential-harvesting simulations.",
      discount: 0.015, // 1.5% discount
      status: "INACTIVE",
      actionLabel: "Start Simulations"
    },
    {
      id: "attestation",
      name: "Annual Security Risk Attestation",
      description: "Formal underwriting attestation verified by risk officer.",
      discount: 0.04, // 4% discount
      status: "INACTIVE",
      actionLabel: "Start Assessment"
    }
  ]);

  // --- 2. Claims State ---
  const [claims, setClaims] = useState<Claim[]>([
    {
      id: "CLM-8821",
      type: "Business Interruption",
      incidentDate: "2026-06-12",
      amount: 5000000,
      status: "Under Review",
      description: "System downtime due to a DDoS attack on primary DNS sub-processor.",
      attachedFile: "dns_telemetry_payload.json",
      attachedFileSize: "2.4 MB",
      timelineLogs: [
        "Claim initiated by policyholder (2026-06-12 14:22:01)",
        "Automated compliance parser matches DNS sub-processor status: Down",
        "Awaiting claim specialist review and forensic telemetry verification."
      ]
    },
    {
      id: "CLM-4412",
      type: "Ransomware & Extortion",
      incidentDate: "2026-04-15",
      amount: 1200000,
      status: "Paid",
      description: "LockBit payload on isolated legacy staging server. No production system breach.",
      attachedFile: "forensic_ioc_audit.pdf",
      attachedFileSize: "12.1 MB",
      timelineLogs: [
        "Claim filed (2026-04-15 08:30:00)",
        "Underwriter confirms MFA active on staging credentials during attack",
        "Loss mitigation report approved by lead forensic analyst",
        "Payout approved and disbursed in full ($1,200,000) (2026-04-20 16:45:00)"
      ]
    }
  ]);

  // --- 3. Interaction Modals & Forms ---
  const [isFilingClaim, setIsFilingClaim] = useState(false);
  const [isAttesting, setIsAttesting] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [isScanningVulnerabilities, setIsScanningVulnerabilities] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [scanThreatsFound, setScanThreatsFound] = useState<number>(0);

  // Claim Form Fields
  const [newClaimType, setNewClaimType] = useState("Data Breach Liability");
  const [newClaimAmount, setNewClaimAmount] = useState("2500000");
  const [newClaimDate, setNewClaimDate] = useState("2026-07-10");
  const [newClaimDesc, setNewClaimDesc] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);

  // Attestation Form Fields (Questions)
  const [attestAnswers, setAttestAnswers] = useState({
    q1: false,
    q2: false,
    q3: false,
    q4: false
  });
  const [attestStep, setAttestStep] = useState(1);

  // --- Dynamic Calculations ---
  const activePaidLosses = useMemo(() => {
    return claims
      .filter((c) => c.status === "Paid")
      .reduce((sum, c) => sum + c.amount, 0);
  }, [claims]);

  const remainingCoveragePool = useMemo(() => {
    return Math.max(0, totalCoverageLimit - activePaidLosses);
  }, [totalCoverageLimit, activePaidLosses]);

  const activeClaimsCount = useMemo(() => {
    return claims.filter((c) => c.status !== "Paid" && c.status !== "Rejected").length;
  }, [claims]);

  const premiumDiscountPercentage = useMemo(() => {
    let totalDiscount = 0;
    controls.forEach((ctrl) => {
      if (ctrl.status === "ACTIVE") {
        totalDiscount += ctrl.discount;
      } else if (ctrl.status === "PENALTY") {
        // Penalty counts as negative discount
        totalDiscount -= 0.025; // 2.5% penalty surcharge
      }
    });
    return Math.max(0, totalDiscount);
  }, [controls]);

  const annualPremium = useMemo(() => {
    const discountedRate = 1 - premiumDiscountPercentage;
    return Math.round(basePremium * discountedRate);
  }, [basePremium, premiumDiscountPercentage]);

  const premiumSavings = useMemo(() => {
    return basePremium - annualPremium;
  }, [basePremium, annualPremium]);

  // --- 4. Interactive Telemetry Control Actions ---
  const handleToggleControl = (id: string) => {
    setControls((prev) =>
      prev.map((ctrl) => {
        if (ctrl.id === id) {
          if (ctrl.status === "ACTIVE") {
            showToast(`Disabled ${ctrl.name}. Underwriting discount revoked.`, "warning");
            return { ...ctrl, status: "INACTIVE" };
          } else {
            showToast(`Enabled ${ctrl.name}. Live telemetry discount applied!`, "success");
            return { ...ctrl, status: "ACTIVE" };
          }
        }
        return ctrl;
      })
    );
  };

  const handlePatchGateways = () => {
    showToast("Starting live security patching protocol...", "info");
    setControls((prev) =>
      prev.map((ctrl) => {
        if (ctrl.id === "vpn_patches") {
          return { ...ctrl, status: "PENDING" };
        }
        return ctrl;
      })
    );

    setTimeout(() => {
      setControls((prev) =>
        prev.map((ctrl) => {
          if (ctrl.id === "vpn_patches") {
            showToast("VPN Gateways successfully patched! 2.5% penalty risk eliminated.", "success");
            return { ...ctrl, status: "ACTIVE" };
          }
          return ctrl;
        })
      );
    }, 1500);
  };

  // --- 5. Interactive Vulnerability/Telemetry Risk Scan ---
  const handleTriggerRiskScan = () => {
    setIsScanningVulnerabilities(true);
    setScanProgress(0);
    setScanThreatsFound(0);
    setScanLogs(["Initializing cloud underwriter vulnerability scan...", "Querying edge router DNS configurations..."]);

    const steps = [
      { progress: 20, log: "Analyzing TLS cert validity and cipher handshake speeds...", threats: 0 },
      { progress: 45, log: "Warning: Missing security patches on 3 VPN endpoints.", threats: 3 },
      { progress: 70, log: "Probing IAM privileges: Root access audits conform with standard baseline.", threats: 3 },
      { progress: 90, log: "Scrutinizing SQL Injection surfaces across 14 database nodes...", threats: 3 },
      { progress: 100, log: "Scan complete. Risk report successfully registered with Lloyd's ledger.", threats: 3 }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setScanProgress(step.progress);
        setScanThreatsFound(step.threats);
        setScanLogs((prev) => [...prev, step.log]);

        if (step.progress === 100) {
          showToast("Compliance and Threat Scan completed! Threat findings parsed.", "warning");
        }
      }, (index + 1) * 800);
    });
  };

  // --- 6. Attestation Questionnaire Wizard ---
  const handleAttestNext = () => {
    if (attestStep < 4) {
      setAttestStep((p) => p + 1);
    } else {
      // Completed questionnaire
      setControls((prev) =>
        prev.map((ctrl) => {
          if (ctrl.id === "attestation") {
            return { ...ctrl, status: "ACTIVE" };
          }
          return ctrl;
        })
      );
      showToast("Security Attestation Verified! Elite risk status awarded.", "success");
      setIsAttesting(false);
      setAttestStep(1);
    }
  };

  // --- 7. Interactive Claim Filing with Drag & Drop ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setAttachedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });
      showToast(`Log file loaded: ${file.name}`, "info");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });
      showToast(`Evidence loaded: ${file.name}`, "info");
    }
  };

  const handleFormClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimDesc) {
      showToast("Please provide incident details.", "error");
      return;
    }

    const claimId = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newClaim: Claim = {
      id: claimId,
      type: newClaimType,
      incidentDate: newClaimDate,
      amount: parseFloat(newClaimAmount) || 100000,
      status: "Under Review",
      description: newClaimDesc,
      attachedFile: attachedFile ? attachedFile.name : "siem_network_dumps.log",
      attachedFileSize: attachedFile ? attachedFile.size : "4.8 MB",
      timelineLogs: [
        `Claim filed by system operator (2026-07-11 11:15:33)`,
        `SIEM forensic data verified: ${attachedFile ? attachedFile.name : "siem_network_dumps.log"} (${attachedFile ? attachedFile.size : "4.8 MB"})`,
        `Risk scoring: Normal baseline matching standard ${newClaimType} protocols.`,
        `Awaiting claim specialist review and underwriter validation.`
      ]
    };

    setClaims((prev) => [newClaim, ...prev]);
    showToast(`Claim ${claimId} successfully queued on sovereign ledger!`, "success");
    setIsFilingClaim(false);
    setNewClaimDesc("");
    setAttachedFile(null);
  };

  // --- 8. Claim Review Simulator ---
  const handleSimulateClaimReview = (claimId: string) => {
    showToast(`Initializing forensic review of ${claimId}...`, "info");
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            status: "Investigating",
            timelineLogs: [
              ...c.timelineLogs,
              `Forensic simulation review triggered (2026-07-11 11:20:00)`,
              `Querying Active Security Telemetry Profile (MFA Enforced, EDR Active)...`
            ]
          };
        }
        return c;
      })
    );

    // Timeline steps
    setTimeout(() => {
      setClaims((prev) =>
        prev.map((c) => {
          if (c.id === claimId) {
            return {
              ...c,
              status: "Investigating",
              timelineLogs: [
                ...c.timelineLogs,
                `Verifying firewall VPN gateway logs and user token authentications...`,
                `Compliance Status Check: MFA was verified active on all compromised portals.`
              ]
            };
          }
          return c;
        })
      );
    }, 1500);

    setTimeout(() => {
      setClaims((prev) =>
        prev.map((c) => {
          if (c.id === claimId) {
            showToast(`Claim ${claimId} fully approved and payout issued!`, "success");
            return {
              ...c,
              status: "Paid",
              timelineLogs: [
                ...c.timelineLogs,
                `Underwriting validation confirmed: Client met all telemetry covenants during event.`,
                `Claims Adjuster Liam Vance approved payment.`,
                `Disbursement of $${c.amount.toLocaleString()} posted to bank vault ledger. Status: Closed.`
              ]
            };
          }
          return c;
        })
      );
    }, 3200);
  };

  // --- 9. Dynamic jsPDF Certificate of Cyber Insurance Export ---
  const handleExportCOIPDF = () => {
    showToast("Compiling official Certificate of Insurance...", "info");
    import("jspdf").then((jspdf) => {
      import("jspdf-autotable").then(({ default: autoTable }) => {
        const doc = new jspdf.jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });

        // Background decorative shapes
        doc.setFillColor(248, 250, 252); // slate 50
        doc.rect(0, 0, 210, 297, "F");

        // Certificate border
        doc.setDrawColor(79, 70, 229); // indigo 600
        doc.setLineWidth(1.5);
        doc.rect(5, 5, 200, 287);

        doc.setDrawColor(15, 23, 42); // slate 900
        doc.setLineWidth(0.3);
        doc.rect(8, 8, 194, 281);

        // Header Title
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42); // slate 900
        doc.text("SOVEREIGN SECURE", 105, 25, { align: "center" });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(79, 70, 229); // indigo 600
        doc.text("DENSE TELEMETRY UNDERWRITING CERTIFICATE", 105, 31, { align: "center" });

        // Divider
        doc.setDrawColor(226, 232, 240); // slate 200
        doc.setLineWidth(0.5);
        doc.line(20, 36, 190, 36);

        // Document Identity
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text("CERTIFICATE OF CYBER LIABILITY INSURANCE", 105, 48, { align: "center" });

        doc.setFont("Helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139); // slate 500
        doc.text("Issued subject to verified live security posture and telemetry audit telemetry feed.", 105, 54, { align: "center" });

        // Policy Information Table
        const infoRows = [
          ["Policyholder Entity", "Nonaxen Corp Enterprise Group"],
          ["Policy Serial Number", "CYB-2026-X99-SOV"],
          ["Aggregate Coverage Limit", `$${totalCoverageLimit.toLocaleString()} USD`],
          ["Net Available Coverage Pool", `$${remainingCoveragePool.toLocaleString()} USD`],
          ["Disbursed Losses to Date", `$${activePaidLosses.toLocaleString()} USD`],
          ["Effective Dates", "July 11, 2026 to July 11, 2027"],
          ["Assigned Lead Underwriter", "Lloyd's Sovereign Tech Syndicate 442"]
        ];

        autoTable(doc, {
          startY: 62,
          head: [["Policy Covenant Attribute", "Certified Registered Data"]],
          body: infoRows,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3.5 },
          headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: "bold" },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 60 },
            1: { cellWidth: 110 }
          }
        });

        const activeTableY = (doc as any).lastAutoTable.finalY + 10;

        // Security Posture Audit Table
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text("UNDERWRITING TELEMETRY AUDIT STATUS", 20, activeTableY);

        const securityRows = controls.map((ctrl) => [
          ctrl.name,
          ctrl.status === "ACTIVE" ? "VERIFIED COMPLIANT" : ctrl.status === "PENALTY" ? "NON-COMPLIANT (PENALTY)" : "INACTIVE",
          `${(ctrl.discount * 100).toFixed(1)}%`
        ]);

        autoTable(doc, {
          startY: activeTableY + 4,
          head: [["Security Telemetry Control", "Verified Audit State", "Premium Impact"]],
          body: securityRows,
          theme: "striped",
          styles: { fontSize: 8.5, cellPadding: 3 },
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 85 },
            1: { cellWidth: 55 },
            2: { cellWidth: 30, halign: "right" }
          }
        });

        const secondTableY = (doc as any).lastAutoTable.finalY + 10;

        // Premium Calculations
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text("PREMIUM SUMMARY STATEMENT", 20, secondTableY);

        const premiumData = [
          ["Standard Base Enterprise Rate", `$${basePremium.toLocaleString()} USD`],
          ["Aggregate Telemetry Posture Discount", `${(premiumDiscountPercentage * 100).toFixed(1)}%`],
          ["Annual Premium Savings Saved", `$${premiumSavings.toLocaleString()} USD`],
          ["Net Annualized Certified Premium", `$${annualPremium.toLocaleString()} USD`]
        ];

        autoTable(doc, {
          startY: secondTableY + 4,
          body: premiumData,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 110 },
            1: { halign: "right", cellWidth: 60 }
          }
        });

        const signY = 250;

        // Signature area
        doc.setDrawColor(203, 213, 225); // slate 300
        doc.line(20, signY, 80, signY);
        doc.line(130, signY, 190, signY);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("Authorized Platform Carrier Seal", 50, signY + 4, { align: "center" });
        doc.text("Nonaxen Risk Officer Attestation", 160, signY + 4, { align: "center" });

        doc.setFont("Helvetica", "bold");
        doc.text("[ VERIFIED ONLINE COI ]", 50, signY + 9, { align: "center" });
        doc.text("[ DIGITAL MUTUAL ATTEST ]", 160, signY + 9, { align: "center" });

        // Add QR/Compliance Code
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(7);
        doc.text("This certificate remains valid only while active telemetry channels flow back securely to Sovereign underwriter APIs.", 105, 275, { align: "center" });

        doc.save(`Cyber_Insurance_COI_CYB-2026.pdf`);
        showToast("Certificate of Insurance successfully exported and downloaded!", "success");
      });
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6" id="cyber-insurance-root-container">
      {/* --- Top Banner & Main Actions --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2" id="platform-title-heading">
            <Umbrella className="w-8 h-8 text-indigo-600 animate-pulse" />
            Cyber Liability Insurance & Underwriting
          </h1>
          <p className="text-slate-500 mt-1">
            Autonomous dynamic policy coverage, real-time telemetry-based premium calculation, and instant verified claims arbitration.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          <button
            onClick={handleTriggerRiskScan}
            className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            id="scan-vulnerabilities-trigger-btn"
          >
            <RefreshCw className={`w-4 h-4 ${isScanningVulnerabilities ? "animate-spin" : ""}`} />
            Scan Risk Telemetry
          </button>
          <button
            onClick={() => setIsAttesting(true)}
            className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            id="open-attestation-trigger-btn"
          >
            <Award className="w-4 h-4 text-amber-500" />
            Attest Posture
          </button>
          <button
            onClick={handleExportCOIPDF}
            className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            id="export-coi-pdf-btn"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            Export COI PDF
          </button>
          <button
            onClick={() => setIsFilingClaim(true)}
            className="flex-1 sm:flex-none px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-indigo-200"
            id="file-new-claim-trigger-btn"
          >
            <Plus className="w-4.5 h-4.5" />
            File New Claim
          </button>
        </div>
      </div>

      {/* --- Live Vulnerability Scan Banner (Conditional) --- */}
      <AnimatePresence>
        {isScanningVulnerabilities && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-lg space-y-3"
            id="underwriting-scan-widget"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                <Terminal className="w-4 h-4 animate-pulse" />
                Live Cloud Underwriter Telemetry Scan
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Progress: {scanProgress}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
            <div className="bg-black/40 p-3 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-300 h-24 overflow-y-auto space-y-1 scrollbar-thin">
              {scanLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-indigo-400/80">❯</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
            {scanProgress === 100 && (
              <div className="flex justify-between items-center pt-1 text-xs">
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Telemetry verified 3 VPN gateways require patching. Action item generated.
                </span>
                <button
                  onClick={() => setIsScanningVulnerabilities(false)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors"
                >
                  Dismiss Terminal
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Dashboard Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6" id="dashboard-statistics-cards-grid">
        {/* Coverage Limits */}
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-xl p-4 sm:p-5 lg:p-6 shadow-md border border-indigo-900/40 text-white relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <Shield className="w-8 h-8 text-indigo-400" />
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Policy
            </span>
          </div>
          <h3 className="text-indigo-200 text-sm font-medium">Total Policy Limit Pool</h3>
          <p className="text-3xl font-extrabold mt-1 tracking-tight">
            ${remainingCoveragePool.toLocaleString()}
          </p>
          <p className="text-xs text-indigo-300/80 mt-1">
            Out of ${totalCoverageLimit.toLocaleString()} aggregate limit
          </p>
          <div className="mt-5 pt-4 border-t border-indigo-800/40 flex justify-between text-xs text-indigo-200/70">
            <span>Policy: CYB-2026-X99</span>
            <span>Renews: Jul 2027</span>
          </div>
        </div>

        {/* Dynamic Premium Calculation */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col justify-between relative group">
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-700">Dynamic Annual Premium</h3>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-bold">
                Live Rate
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">
                ${annualPremium.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 line-through">
                ${basePremium.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" />
              Saving ${(basePremium - annualPremium).toLocaleString()} yr ({(premiumDiscountPercentage * 100).toFixed(1)}% posture reduction)
            </p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Security Posture Underwriting Level</span>
              <span className="font-bold text-slate-700">
                {Math.round(premiumDiscountPercentage * 500)} / 100
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, premiumDiscountPercentage * 500)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Claim Ledger Portfolio */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col justify-between group">
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-700">Active Claims Queue</h3>
              </div>
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                Underwriting Sync
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              {activeClaimsCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Active forensic audits pending payouts
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Paid Out Losses</span>
            <span className="font-bold text-slate-900">${activePaidLosses.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* --- Two-Column Core Layout: Posture Telemetry & Claims Management --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column: Underwriting Telemetry Panel */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-indigo-600 animate-spin-slow" />
                Underwriting Telemetry Controls
              </h3>
              <p className="text-xs text-slate-500">Enable controls to directly discount your premium rate in real-time.</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
              Telemetry Live
            </span>
          </div>

          <div className="p-4 sm:p-5 lg:p-6 space-y-4 flex-1">
            {controls.map((ctrl) => {
              const isActive = ctrl.status === "ACTIVE";
              const isPenalty = ctrl.status === "PENALTY";
              const isPending = ctrl.status === "PENDING";

              return (
                <div
                  key={ctrl.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? "bg-emerald-50/40 border-emerald-100"
                      : isPenalty
                      ? "bg-rose-50/40 border-rose-100"
                      : isPending
                      ? "bg-amber-50/40 border-amber-100"
                      : "bg-slate-50/40 border-slate-100"
                  } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
                >
                  <div className="flex gap-2.5 items-start">
                    <div className="mt-1">
                      {isActive ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      ) : isPenalty ? (
                        <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 animate-bounce" />
                      ) : isPending ? (
                        <RefreshCw className="w-5 h-5 text-amber-500 animate-spin flex-shrink-0" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-800">{ctrl.name}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : isPenalty
                              ? "bg-rose-100 text-rose-800 animate-pulse"
                              : isPending
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {isActive
                            ? `-${(ctrl.discount * 100).toFixed(1)}% rate`
                            : isPenalty
                            ? "+2.5% surcharge risk"
                            : isPending
                            ? "Patching..."
                            : `+${(ctrl.discount * 100).toFixed(1)}% potential discount`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{ctrl.description}</p>
                    </div>
                  </div>

                  <div className="self-end sm:self-auto flex items-center gap-2">
                    {isPenalty ? (
                      <button
                        onClick={handlePatchGateways}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold whitespace-nowrap transition-colors"
                      >
                        Patch VPN Gateways
                      </button>
                    ) : ctrl.id === "attestation" && !isActive ? (
                      <button
                        onClick={() => setIsAttesting(true)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold whitespace-nowrap transition-colors"
                      >
                        Launch Quiz
                      </button>
                    ) : (
                      <button
                        disabled={isPending}
                        onClick={() => handleToggleControl(ctrl.id)}
                        className={`px-3 py-1.5 border rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                          isActive
                            ? "bg-white border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                            : "bg-slate-800 border-slate-700 hover:bg-slate-900 text-slate-50"
                        }`}
                      >
                        {isActive ? "Revoke Enforcement" : ctrl.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Premium calculations adapt dynamically upon network telemetry status change logs.</span>
          </div>
        </div>

        {/* Right Column: Claims Portfolio Hub */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <FileCheck className="w-4.5 h-4.5 text-indigo-600" />
                Claims & Indemnity Portfolio
              </h3>
              <p className="text-xs text-slate-500">Audit current claim investigations or trigger full forensic adjuster reviews.</p>
            </div>
            <button
              onClick={() => setIsFilingClaim(true)}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded text-xs font-bold transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              File Claim
            </button>
          </div>

          <div className="p-4 sm:p-5 lg:p-6 space-y-5 flex-1 overflow-y-auto max-h-[460px]">
            {claims.map((claim) => {
              const isUnderReview = claim.status === "Under Review";
              const isInvestigating = claim.status === "Investigating";
              const isPaid = claim.status === "Paid";

              return (
                <div
                  key={claim.id}
                  className="border border-slate-200 rounded-xl overflow-x-auto hover:border-slate-300 transition-all bg-white"
                >
                  {/* Claim Card Header */}
                  <div className="p-4 bg-slate-50 border-b border-slate-150 flex flex-wrap justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                          {claim.id}
                        </span>
                        <span className="font-bold text-sm text-slate-800">{claim.type}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Incident Filed Date: {claim.incidentDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-800"
                            : isInvestigating
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800 animate-pulse"
                        }`}
                      >
                        {claim.status}
                      </span>
                      <button
                        onClick={() =>
                          setSelectedClaimId(selectedClaimId === claim.id ? null : claim.id)
                        }
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <ChevronRight
                          className={`w-4 h-4 transform transition-transform ${
                            selectedClaimId === claim.id ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Claim Card Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {claim.description}
                    </p>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <div>
                        <span className="text-slate-400">Claim Value: </span>
                        <span className="font-bold text-slate-800">${claim.amount.toLocaleString()}</span>
                      </div>
                      {claim.attachedFile && (
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                          <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-semibold max-w-[120px] truncate">{claim.attachedFile}</span>
                          <span className="text-slate-400">({claim.attachedFileSize})</span>
                        </div>
                      )}
                    </div>

                    {/* Claims Adjuster Review Simulation Interface */}
                    {isUnderReview && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleSimulateClaimReview(claim.id)}
                          className="w-full py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Terminal className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                          Simulate Forensic Underwriting Review
                        </button>
                      </div>
                    )}

                    {/* Investigating Loader */}
                    {isInvestigating && (
                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-3">
                        <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                        <span className="text-xs font-bold text-indigo-900 animate-pulse">
                          Adjuster is validating telemetry logs on sovereign blockchain ledger...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expandable Forensic Timeline / Verification logs */}
                  {selectedClaimId === claim.id && (
                    <div className="bg-slate-900 text-slate-300 p-4 font-mono text-[11px] border-t border-slate-800 space-y-1.5">
                      <div className="text-indigo-400 font-bold border-b border-slate-800 pb-1 flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5" />
                        CLAIM DISPATCH & AUDIT TRAIL RECORD
                      </div>
                      {claim.timelineLogs.map((log, lIdx) => (
                        <div key={lIdx} className="flex gap-2">
                          <span className="text-emerald-500">✔</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Compliant with standard multi-factor and GDPR liability indemnity agreements.</span>
          </div>
        </div>
      </div>

      {/* --- Sublimits & Threat Ticker Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Coverage Sub-limits Tracker */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden md:col-span-2">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Coverage Category Allocations</h3>
          </div>
          <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  Ransomware & Extortion Liability
                  <span title="Covers payload recovery & system cleanup">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </span>
                <span className="text-slate-900 font-bold">$10M / $10M Pool</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  Business Interruption Losses
                  <span title="Incurred downtime & operational recovery">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </span>
                <span className="text-slate-900 font-bold">$15M / $20M Pool</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: "75%" }}></div>
              </div>
              <p className="text-xs text-rose-500 font-medium mt-1">
                -$5,000,000 currently allocated/disbursed to Active Claim CLM-8821
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  Regulatory Fines & GDPR Penalties
                  <span title="Legal protection and administrative fines coverage">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </span>
                <span className="text-slate-900 font-bold">$5M / $5M Pool</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Threat Intelligence Feed */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              Sovereign Threat Intelligence
            </h3>
          </div>
          <div className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[240px]">
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
              <div className="flex items-center justify-between text-xs font-bold text-rose-900 mb-1">
                <span>Active Campaign: LockBit 4.0</span>
                <span className="bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded">CRITICAL</span>
              </div>
              <p className="text-[11px] text-rose-700">
                Targeting unpatched VPN routers in financial and tech hubs. Ensure Edge VPN Gateways are patched.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1">
                <span>Apache Webserver Zero-Day</span>
                <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">HIGH</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Remote Code Execution vulnerable packages detected globally. Automated underwriter scan is scanning endpoints.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: File Cyber Liability Claim --- */}
      <AnimatePresence>
        {isFilingClaim && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-slate-200"
            >
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-base">
                  <Umbrella className="w-5 h-5 text-indigo-600" />
                  File Cyber Liability Claim
                </h3>
                <button
                  onClick={() => setIsFilingClaim(false)}
                  className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormClaimSubmit} className="p-4 sm:p-5 lg:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Incident Category
                    </label>
                    <select
                      value={newClaimType}
                      onChange={(e) => setNewClaimType(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option>Data Breach Liability</option>
                      <option>Ransomware & Extortion</option>
                      <option>Business Interruption</option>
                      <option>Regulatory Fines (GDPR)</option>
                      <option>System Failure Interruption</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Estimated Loss ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={newClaimAmount}
                      onChange={(e) => setNewClaimAmount(e.target.value)}
                      placeholder="e.g., 2000000"
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Date of Incident
                  </label>
                  <input
                    type="date"
                    required
                    value={newClaimDate}
                    onChange={(e) => setNewClaimDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Incident Description & Indicators (IoCs)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newClaimDesc}
                    onChange={(e) => setNewClaimDesc(e.target.value)}
                    placeholder="Describe the ransomware variant, payload signature, impacted assets, and IP logs."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                {/* Log File Evidence Drag and Drop */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Telemetry / SIEM Forensic Evidence File
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 sm:p-5 lg:p-6 text-center transition-all cursor-pointer ${
                      dragActive
                        ? "border-indigo-600 bg-indigo-50/50"
                        : "border-slate-300 hover:border-indigo-500 hover:bg-slate-50/50"
                    }`}
                  >
                    <input
                      type="file"
                      id="evidence-file-input"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="evidence-file-input" className="cursor-pointer">
                      <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      {attachedFile ? (
                        <div>
                          <span className="text-xs font-bold text-indigo-600 block">
                            {attachedFile.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {attachedFile.size} - Ready to upload
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs font-bold text-slate-600 block">
                            Drag and drop network logs here
                          </span>
                          <span className="text-[11px] text-slate-400">
                            or click to browse local files (SIEM exports, PCAPs, dumps)
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFilingClaim(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
                  >
                    Submit System Claim
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: Security Attestation Questionnaire --- */}
      <AnimatePresence>
        {isAttesting && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl border border-slate-200"
            >
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-base">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Sovereign Underwriting Attestation
                </h3>
                <button
                  onClick={() => setIsAttesting(false)}
                  className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 lg:p-6 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>RISK ASSESSMENT INTERACTION</span>
                  <span>STEP {attestStep} OF 4</span>
                </div>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(attestStep / 4) * 100}%` }}
                  ></div>
                </div>

                <AnimatePresence mode="wait">
                  {attestStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <h4 className="font-extrabold text-slate-800 text-sm">
                        Q1: Are offline/immutable backups maintained for all directories containing personal data parameters?
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Continuous air-gapped backups prevent ransomware lateral lockouts from disrupting recovery time objectives (RTOs).
                      </p>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setAttestAnswers((a) => ({ ...a, q1: true }));
                            handleAttestNext();
                          }}
                          className={`flex-1 py-3 text-center rounded-xl border font-semibold text-sm transition-all ${
                            attestAnswers.q1
                              ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Yes, Fully Enforced
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAttestAnswers((a) => ({ ...a, q1: false }));
                            handleAttestNext();
                          }}
                          className="flex-1 py-3 text-center bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50"
                        >
                          No/In Progress
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {attestStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <h4 className="font-extrabold text-slate-800 text-sm">
                        Q2: Is there a formal, documented Incident Response Plan (IRP) tested in simulation within the last year?
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        A tested containment response mitigates data breach liability fine assessments by up to 40% under GDPR compliance guidelines.
                      </p>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setAttestAnswers((a) => ({ ...a, q2: true }));
                            handleAttestNext();
                          }}
                          className={`flex-1 py-3 text-center rounded-xl border font-semibold text-sm transition-all ${
                            attestAnswers.q2
                              ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Yes, Formally Tested
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAttestAnswers((a) => ({ ...a, q2: false }));
                            handleAttestNext();
                          }}
                          className="flex-1 py-3 text-center bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50"
                        >
                          No, Informal Only
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {attestStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <h4 className="font-extrabold text-slate-800 text-sm">
                        Q3: Are Domain Administrator credentials restricted from standard email and web-browsing activities?
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Isolating directory service tokens minimizes credential-harvesting exploit exposure surfaces on corporate network endpoints.
                      </p>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setAttestAnswers((a) => ({ ...a, q3: true }));
                            handleAttestNext();
                          }}
                          className={`flex-1 py-3 text-center rounded-xl border font-semibold text-sm transition-all ${
                            attestAnswers.q3
                              ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Yes, Restricted
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAttestAnswers((a) => ({ ...a, q3: false }));
                            handleAttestNext();
                          }}
                          className="flex-1 py-3 text-center bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50"
                        >
                          No/Shared Accounts
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {attestStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <h4 className="font-extrabold text-slate-800 text-sm">
                        Q4: Are public cloud infrastructures monitored hourly for configuration drift and bucket leakage?
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Automatic verification rules protect private databases and customer identifiers from accidental public exposure.
                      </p>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setAttestAnswers((a) => ({ ...a, q4: true }));
                            handleAttestNext();
                          }}
                          className={`flex-1 py-3 text-center rounded-xl border font-semibold text-sm transition-all ${
                            attestAnswers.q4
                              ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Yes, Cloud Monitored
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAttestAnswers((a) => ({ ...a, q4: false }));
                            handleAttestNext();
                          }}
                          className="flex-1 py-3 text-center bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50"
                        >
                          No, Manual Checks
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
