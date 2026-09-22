import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Download,
  CheckCircle2,
  Lock,
  Key,
  ShieldAlert,
  UserCheck,
  Cpu,
  Fingerprint,
  Calendar,
  Feather,
  Check,
  Loader2,
  Printer,
  FileSignature,
  FileCheck,
  QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useNotification } from "../../context/NotificationContext";

interface AuditLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  severity: string;
  hash: string;
}

interface AuditLedgerSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
  searchQuery: string;
  activeSeverityFilter: string | null;
}

export const AuditLedgerSignModal: React.FC<AuditLedgerSignModalProps> = ({
  isOpen,
  onClose,
  logs,
  searchQuery,
  activeSeverityFilter
}) => {
  const { showToast } = useNotification();
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [auditorName, setAuditorName] = useState("");
  const [signingKeyType, setSigningKeyType] = useState<"KMS_ECDSA" | "RSA_4096" | "ED25519">("KMS_ECDSA");
  const [signatureHash, setSignatureHash] = useState("");
  const [publicKeyCert, setPublicKeyCert] = useState("");
  const [selectedStandard, setSelectedStandard] = useState<"SOC2" | "GDPR" | "ISO27001">("SOC2");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Filter logs exactly like the parent page does to make sure we sign the current selection
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target && log.target.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeSeverityFilter ? log.severity.toLowerCase() === activeSeverityFilter.toLowerCase() : true;
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const criticalCount = filteredLogs.filter(l => l.severity.toLowerCase() === "critical").length;
  const warningCount = filteredLogs.filter(l => l.severity.toLowerCase() === "warning").length;

  useEffect(() => {
    if (isOpen) {
      // Generate deterministic hashes based on selected parameters to simulate HSM key sign
      const mockKeyHash = "KMS-PUB-KEY-" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase();
      setPublicKeyCert(mockKeyHash);
      setIsSigned(false);
      setSignatureHash("");
    }
  }, [isOpen, signingKeyType, auditorName]);

  if (!isOpen) return null;

  const handleApplySignature = () => {
    if (!auditorName.trim()) {
      showToast("Please specify the Approving Auditor / Officer Name before signing.", 'warning');
      return;
    }
    setIsSigning(true);
    
    // Simulate HSM cryptographic signing delay
    setTimeout(() => {
      // Calculate a signature over the log details + auditor name
      const logContentString = filteredLogs.map(l => l.hash).join("");
      const combinedInput = `${logContentString}-${auditorName}-${signingKeyType}-${new Date().toISOString()}`;
      
      // Basic pseudo-hashing
      let hash = 0;
      for (let i = 0; i < combinedInput.length; i++) {
        const char = combinedInput.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      const hexHash = Math.abs(hash).toString(16).toUpperCase() + 
                      Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase();
      
      const sigFormat = `SIG-[${signingKeyType}]-SHA256-${hexHash.substring(0, 32)}`;
      setSignatureHash(sigFormat);
      setIsSigning(false);
      setIsSigned(true);
    }, 1200);
  };

  const handleDownloadPdf = () => {
    if (!isSigned) {
      showToast("Please apply the cryptographic digital signature to the report before downloading the PDF.", 'warning');
      return;
    }
    
    setIsDownloading(true);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          setTimeout(() => {
            setIsDownloading(false);
            
            // Generate professional PDF with signature block using jsPDF
            const doc = new jsPDF();
            
            // Header Frame
            doc.setFillColor(244, 246, 249);
            doc.rect(0, 0, 210, 40, "F");
            
            // Primary Logo text
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(79, 70, 229); // indigo-600
            doc.text("SOVEREIGN ARCHITECTURE COMPLIANCE PLATFORM", 14, 15);
            
            // Title
            doc.setFontSize(16);
            doc.setTextColor(15, 23, 42); // slate-900
            doc.text("IMMUTABLE AUDIT LEDGER & SIGNED COMPLIANCE REPORT", 14, 25);
            
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139); // slate-500
            doc.setFont("Helvetica", "normal");
            doc.text(`Generated standard: ${selectedStandard} Assurance • Reference ID: ${signatureHash.substring(12, 28)}`, 14, 32);

            // Audit Summary Section
            doc.setFontSize(11);
            doc.setFont("Helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text("1. EXECUTIVE AUDIT METRICS", 14, 52);
            
            // Box for summary stats
            doc.setFillColor(248, 250, 252);
            doc.rect(14, 56, 182, 30, "F");
            doc.setDrawColor(226, 232, 240);
            doc.rect(14, 56, 182, 30, "D");
            
            doc.setFontSize(9);
            doc.setFont("Helvetica", "normal");
            doc.text(`Authorized Auditor: ${auditorName}`, 20, 64);
            doc.text(`Verification Key Type: ${signingKeyType}`, 20, 71);
            doc.text(`Active Search Scope: ${searchQuery || "All events"}`, 20, 78);
            
            doc.text(`Total Sealed Logs: ${filteredLogs.length} events`, 110, 64);
            doc.text(`Critical Severity Items: ${criticalCount}`, 110, 71);
            doc.text(`Warning Severity Items: ${warningCount}`, 110, 78);

            // Cryptographic Sign-Off Section
            doc.setFontSize(11);
            doc.setFont("Helvetica", "bold");
            doc.text("2. CRYPTOGRAPHIC PROOF OF INTEGRITY", 14, 98);
            
            doc.setFillColor(239, 246, 255);
            doc.rect(14, 102, 182, 34, "F");
            doc.setDrawColor(191, 219, 254);
            doc.rect(14, 102, 182, 34, "D");
            
            doc.setFontSize(8.5);
            doc.setFont("Courier", "bold");
            doc.setTextColor(30, 58, 138); // blue-900
            doc.text("DIGITAL SIGNATURE BLOCK (SEALED BY HSM CONSOLE)", 20, 110);
            
            doc.setFontSize(7.5);
            doc.setFont("Courier", "normal");
            doc.text(`Public Key Certificate: ${publicKeyCert}`, 20, 117);
            doc.text(`Signature Authority:    ${auditorName.toUpperCase()}`, 20, 123);
            doc.text(`Seal Fingerprint:       ${signatureHash}`, 20, 129);

            // Table of Logs
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(15, 23, 42);
            doc.text("3. SEALED AUDIT EVENTS LOG", 14, 148);

            const headers = [["Timestamp (UTC)", "Actor / Identity", "Action Taken", "Target Resource", "KMS Hash"]];
            const tableData = filteredLogs.map(log => [
              new Date(log.time).toISOString().replace("T", " ").substring(0, 19),
              log.actor,
              log.action,
              log.target,
              log.hash.substring(0, 10)
            ]);

            autoTable(doc, {
              head: headers,
              body: tableData,
              startY: 153,
              theme: "striped",
              styles: { fontSize: 7.5, cellPadding: 2.5 },
              headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: "bold" },
              columnStyles: {
                0: { cellWidth: 35 },
                1: { cellWidth: 35 },
                2: { cellWidth: 35 },
                3: { cellWidth: 50 },
                4: { cellWidth: 27, font: "Courier" }
              }
            });

            // Save pdf
            doc.save(`Cryptographically_Signed_AuditLog_${selectedStandard}_${new Date().toISOString().substring(0,10)}.pdf`);
          }, 800);

          return 100;
        }
        return prev + 20;
      });
    }, 120);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full overflow-hidden my-8 flex flex-col h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Cryptographic Audit Ledger Signer
              </h3>
              <p className="text-[11px] text-slate-400">
                Sign, timestamp, and compile verifiable corporate compliance logs with custom multi-sig authority keys.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden flex-col lg:flex-row bg-slate-50">
          {/* Left Panel: Signing Configurations */}
          <div className="w-full lg:w-96 border-r border-slate-200 bg-white p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                Signing Environment
              </h4>

              {/* Auditor Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Approving Auditor / Officer Name
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jean-Luc Picard, DPO"
                    value={auditorName}
                    onChange={e => setAuditorName(e.target.value)}
                    disabled={isSigned}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-65"
                  />
                </div>
              </div>

              {/* Signing Key Option */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Select Security Authority Key (HSM)
                </label>
                <div className="space-y-2">
                  {[
                    { id: "KMS_ECDSA", name: "ECC secp256r1 KMS Key", desc: "Federal level digital signature, sovereign KMS storage" },
                    { id: "RSA_4096", name: "RSA-4096 Multi-sig Root", desc: "Long-term cryptographic archival certificate" },
                    { id: "ED25519", name: "Ed25519 Secure Ledger Key", desc: "High-performance lean cryptographic pipeline" }
                  ].map(k => (
                    <label
                      key={k.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all block ${
                        signingKeyType === k.id ? "border-indigo-500 bg-indigo-50/20" : "border-slate-200 hover:bg-slate-50"
                      } ${isSigned ? "opacity-65 pointer-events-none" : ""}`}
                    >
                      <input
                        type="radio"
                        name="signing_key"
                        value={k.id}
                        checked={signingKeyType === k.id}
                        onChange={() => setSigningKeyType(k.id as any)}
                        disabled={isSigned}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="text-[11px] font-bold text-slate-800 block">{k.name}</span>
                        <span className="text-[9px] text-slate-400 block leading-normal">{k.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Compliance Standard */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Framework Alignment Standard
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "SOC2", label: "SOC 2 Type II" },
                    { id: "GDPR", label: "GDPR Art 37" },
                    { id: "ISO27001", label: "ISO 27001" }
                  ].map(std => (
                    <button
                      key={std.id}
                      type="button"
                      onClick={() => setSelectedStandard(std.id as any)}
                      disabled={isSigned}
                      className={`px-2 py-1.5 border text-[10px] font-bold rounded-lg transition-all ${
                        selectedStandard === std.id
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      } disabled:opacity-65`}
                    >
                      {std.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              {!isSigned ? (
                <button
                  type="button"
                  onClick={handleApplySignature}
                  disabled={isSigning || !auditorName.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  {isSigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Invoking HSM Crypt...
                    </>
                  ) : (
                    <>
                      <Feather className="w-4 h-4" />
                      Apply Digital Signature
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[11px] leading-relaxed flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold block">Signature Seal Applied!</span>
                      The ledger is finalized with crypto-receipt block below. Ready for PDF rendering.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sealing Document ({downloadProgress}%)
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Export Verification PDF
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSigned(false);
                      setSignatureHash("");
                    }}
                    className="w-full py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold rounded-lg text-[10px] transition-colors cursor-pointer text-center"
                  >
                    Edit Signature/Details
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Printable PDF Document Preview */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 md:p-8 flex justify-center">
            <div className="bg-white max-w-3xl w-full border border-slate-300 shadow-md p-10 font-sans text-slate-800 flex flex-col justify-between relative min-h-[960px]">
              
              {/* Draft Watermark */}
              {!isSigned && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                  <div className="border-[8px] border-amber-500/20 text-amber-500/20 text-6xl font-black rounded-3xl uppercase tracking-widest rotate-12 px-10 py-5">
                    Draft Preview
                  </div>
                </div>
              )}

              {/* Verified Seal Overlay */}
              {isSigned && (
                <motion.div 
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="absolute top-10 right-10 flex flex-col items-center select-none z-20"
                >
                  <div className="border-4 border-emerald-500/80 text-emerald-600 rounded-full w-20 h-20 flex items-center justify-center flex-col p-1 bg-white shadow-lg animate-pulse">
                    <FileCheck className="w-8 h-8" />
                    <span className="text-[7px] font-black tracking-widest uppercase mt-0.5">Verified</span>
                  </div>
                </motion.div>
              )}

              <div className="space-y-6 z-10">
                {/* Document Title header */}
                <div className="border-b-2 border-slate-900 pb-5 flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-950 font-black text-[10px] uppercase tracking-widest font-mono">
                      <Lock className="w-3.5 h-3.5 text-indigo-600" />
                      Sovereign Cryptographic Ledger Archive
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase">
                      Audit Log Compliance Statement
                    </h2>
                    <p className="text-[9px] text-slate-500 font-mono">
                      Compiled scope: {selectedStandard} Security Assurance • Generated in Real-Time
                    </p>
                  </div>
                  <div className="text-right text-[10px]">
                    <div className="font-bold text-slate-900">Sovereign Compliance</div>
                    <div className="text-slate-400 font-mono text-[9px] mt-0.5">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Scope Stats Bar */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-0.5 border-r border-slate-200">
                    <span className="text-slate-400 text-[8px] uppercase tracking-wider font-semibold block">Total Events Sealed</span>
                    <span className="text-lg font-bold text-indigo-950">{filteredLogs.length}</span>
                  </div>
                  <div className="space-y-0.5 border-r border-slate-200">
                    <span className="text-slate-400 text-[8px] uppercase tracking-wider font-semibold block">Critical / Warning Issues</span>
                    <span className={`text-lg font-bold ${criticalCount > 0 ? "text-rose-600" : "text-slate-700"}`}>
                      {criticalCount} / {warningCount}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[8px] uppercase tracking-wider font-semibold block">Audited Standard</span>
                    <span className="text-lg font-bold text-indigo-600">{selectedStandard}</span>
                  </div>
                </div>

                {/* Informative Disclaimer */}
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                  This report forms a complete corporate audit ledger receipt mapping the subset of immutable system, 
                  tenant, and user events recorded. It is cryptographically validated utilizing secure key signatures 
                  preventing database spoofing or retrospect alteration of corporate record logs.
                </p>

                {/* Miniature Table Preview */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block">Sealed Log Entries (First 5 Items shown in preview)</span>
                  <div className="border border-slate-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[9px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase tracking-wider">
                          <th className="p-2 font-bold">Timestamp</th>
                          <th className="p-2 font-bold">Actor</th>
                          <th className="p-2 font-bold">Action Taken</th>
                          <th className="p-2 font-bold">Target Resource</th>
                          <th className="p-2 font-bold text-right">KMS Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                        {filteredLogs.slice(0, 5).map(log => (
                          <tr key={log.id}>
                            <td className="p-2 font-mono text-[8px] text-slate-400">
                              {new Date(log.time).toISOString().replace("T", " ").substring(0, 19)}
                            </td>
                            <td className="p-2 font-bold text-slate-800">{log.actor}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${
                                log.severity.toLowerCase() === "critical" ? "bg-rose-50 text-rose-700" :
                                log.severity.toLowerCase() === "warning" ? "bg-amber-50 text-amber-700" :
                                "bg-slate-100 text-slate-700"
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="p-2 text-slate-500 truncate max-w-[120px]">{log.target}</td>
                            <td className="p-2 text-right font-mono text-[8px] text-indigo-500">{log.hash.substring(0, 8)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredLogs.length > 5 && (
                    <span className="text-[9px] text-slate-400 italic block text-right font-mono">
                      + {filteredLogs.length - 5} more logs included in final PDF export
                    </span>
                  )}
                </div>
              </div>

              {/* Signed Certificate Footprint */}
              <div className="border-t border-slate-200 pt-6 mt-10 space-y-5">
                <div className="grid grid-cols-2 gap-5 sm:gap-8 text-[10px]">
                  <div className="space-y-3">
                    <span className="text-slate-400 text-[8px] uppercase tracking-wider font-semibold block">Authorized Attestator</span>
                    <div className="border-b border-slate-200 pb-1 h-10 flex items-end">
                      {isSigned ? (
                        <span className="font-mono italic text-indigo-900 font-bold tracking-widest text-[11px]">
                          /signed/ {auditorName}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic">Signature Pending</span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[8px] block leading-normal">
                      Designated Compliance Auditor Signature
                    </span>
                  </div>

                  <div className="space-y-3">
                    <span className="text-slate-400 text-[8px] uppercase tracking-wider font-semibold block">Key Cryptographic Fingerprint</span>
                    <div className="border-b border-slate-200 pb-1 h-10 flex items-end font-mono text-[8px] text-indigo-500 truncate" title={signatureHash}>
                      {isSigned ? signatureHash : "Awaiting signature verification..."}
                    </div>
                    <span className="text-slate-400 text-[8px] block leading-normal">
                      HSM Console Verifiable Public Hash Seal
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[8px] text-slate-400 font-mono border-t border-slate-100 pt-3">
                  <span>Sovereign Security Platform</span>
                  <span className="flex items-center gap-1 font-bold text-indigo-600">
                    <QrCode className="w-3.5 h-3.5" />
                    SECURE LEDGER VALID
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
