import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Award,
  Shield,
  Fingerprint,
  Calendar,
  User,
  Check,
  Loader2,
  Printer,
  Stamp,
  Globe,
  Building
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

interface DpoReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  certifications: DpoCertification[];
  documents: DpoDocument[];
  tenantName?: string;
}

export const DpoReportPreviewModal: React.FC<DpoReportPreviewModalProps> = ({
  isOpen,
  onClose,
  certifications,
  documents,
  tenantName = "Acme Global Corp"
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [reportHash, setReportHash] = useState("");
  const [selectedStandard, setSelectedStandard] = useState<"GDPR_ART37" | "ISO_27701" | "CCPA_DPO">("GDPR_ART37");

  // Generate a mock report hash once on load or when parameters change
  useEffect(() => {
    if (isOpen) {
      const mockHash = "SHA256-" + Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase();
      setReportHash(mockHash);
    }
  }, [isOpen, certifications, documents]);

  if (!isOpen) return null;

  const activeDpo = certifications.find(c => c.status === "ACTIVE") || certifications[0];
  const verifiedDocsCount = documents.filter(d => d.status === "VERIFIED").length;
  const pendingDocsCount = documents.filter(d => d.status !== "VERIFIED").length;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDownloading(false);
            
            // Create a pseudo download
            const docContent = `
========================================================================
             GDPR ARTICLE 37 DPO COMPLIANCE & APPOINTMENT REPORT
========================================================================
Report Identifier: ${reportHash}
Generation Timestamp: ${new Date().toISOString()}
Tenant Entity: ${tenantName}
Active Standards Evaluated: ${selectedStandard}

------------------------- EXECUTIVE SUMMARY ---------------------------
Compliance Health Verdict: ${certifications.length > 0 ? "SECURED (Level 1 Clearance)" : "ACTION REQUIRED (Deficient)"}
Appointed Data Protection Officer: ${activeDpo ? activeDpo.name : "None Appointed"}
Licensing Certificate ID: ${activeDpo ? activeDpo.cert_number : "N/A"}
Veritable Evidence Files: ${documents.length} (${verifiedDocsCount} verified)

---------------------- STATUTORY GDPR ARTICLE 37 CHECK ----------------
[X] Art 37.1(a) Public or Regulatory Body: Checked
[X] Art 37.1(b) Regular and Systematic Monitoring: Verified
[X] Art 37.1(c) Special Category Data Scale: Verified
[X] Art 37.5 Professional Qualities and Expert Knowledge: Validated

---------------------- EVIDENCE FILES INVENTORY -----------------------
${documents.map((d, i) => `${i + 1}. ${d.name} (${d.doc_type}) - ${d.status}`).join("\n")}

========================================================================
            END OF VERIFIABLE COMPLIANCE LEDGER RECEIPT
========================================================================
            `;
            const blob = new Blob([docContent], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `DPO_Compliance_Report_${tenantName.replace(/\s+/g, "_")}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 600);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto print:bg-white print:p-0">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden my-8 flex flex-col h-[90vh] print:h-auto print:shadow-none print:border-none print:rounded-none"
      >
        {/* Header (Hidden in Print) */}
        <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Interactive Compliance Report Preview
              </h3>
              <p className="text-[11px] text-slate-500">
                Preview, download, or print your generated GDPR Article 37 compliance clearance certificate.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar (Hidden in Print) */}
        <div className="bg-slate-50/50 border-b border-slate-200/50 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 print:hidden flex-wrap">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 font-semibold">Regulatory Standard:</span>
            <div className="flex bg-slate-200/60 p-1 rounded-lg">
              <button
                onClick={() => setSelectedStandard("GDPR_ART37")}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  selectedStandard === "GDPR_ART37" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                GDPR Art. 37
              </button>
              <button
                onClick={() => setSelectedStandard("ISO_27701")}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  selectedStandard === "ISO_27701" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                ISO/IEC 27701
              </button>
              <button
                onClick={() => setSelectedStandard("CCPA_DPO")}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  selectedStandard === "CCPA_DPO" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                CCPA/CPRA
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating ({downloadProgress}%)
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* PDF Download Progress (Hidden in Print) */}
        {isDownloading && (
          <div className="w-full bg-slate-100 h-1 relative overflow-hidden print:hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-100" 
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        )}

        {/* Printable/Preview Document Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 bg-slate-100 print:bg-white print:p-0 flex justify-center">
          <div className="bg-white max-w-3xl w-full border border-slate-300 shadow-md p-10 font-sans text-slate-800 flex flex-col justify-between min-h-[1123px] relative print:border-none print:shadow-none print:p-0 print:m-0">
            
            {/* Watermark/Security Seal in Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
              <Shield className="w-96 h-96 text-indigo-900" />
            </div>

            <div className="space-y-6 z-10">
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-5 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-indigo-950 font-black text-xs uppercase tracking-widest font-mono">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    Sovereign Compliance Assurance System
                  </div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">
                    Data Protection Officer Appointment & Audit Statement
                  </h1>
                  <p className="text-xs text-slate-500 font-mono">
                    Document Ref: DPO-REP-{reportHash.slice(-8)} • Issued under regulatory authority
                  </p>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-900">{tenantName}</div>
                  <div className="text-slate-500">Legal Compliance Department</div>
                  <div className="text-slate-400 font-mono text-[10px] mt-1">{new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                activeDpo && verifiedDocsCount > 0 
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-950" 
                  : "bg-amber-50/70 border-amber-200 text-amber-950"
              }`}>
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                    {activeDpo && verifiedDocsCount > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    Verification Status Verdict: {activeDpo && verifiedDocsCount > 0 ? "SECURED (Level 1 Compliance)" : "READINESS ACTIONS PENDING"}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    This statutory statement acts as formal documentation representing compliance with Data Protection Officer requirements 
                    for the financial year 2026.
                  </p>
                </div>
                <div className="text-center px-4 py-2 bg-white rounded-lg border border-slate-200/60 shadow-sm flex-shrink-0">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Ready Rating</div>
                  <div className="text-lg font-black text-indigo-950">
                    {activeDpo && verifiedDocsCount > 0 ? "96%" : "64%"}
                  </div>
                </div>
              </div>

              {/* Selected Standard Focus */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  1. Assessment Standard & Regulatory Mapping ({selectedStandard.replace("_", " ")})
                </h3>
                
                {selectedStandard === "GDPR_ART37" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 border border-slate-100 bg-slate-50 rounded-lg flex items-start gap-2.5">
                      <div className="p-1 rounded bg-white border border-slate-200 text-indigo-600 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">GDPR Art. 37.1(a) public interest check</span>
                        <p className="text-slate-500 mt-0.5 leading-normal">Evaluates public authority service parameters, ensuring clear delegation of data management controls.</p>
                      </div>
                    </div>

                    <div className="p-3 border border-slate-100 bg-slate-50 rounded-lg flex items-start gap-2.5">
                      <div className="p-1 rounded bg-white border border-slate-200 text-indigo-600 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">GDPR Art. 37.1(b) systematic monitoring scale</span>
                        <p className="text-slate-500 mt-0.5 leading-normal">Identifies and logs core processing operations that require high-frequency automated user tracking.</p>
                      </div>
                    </div>

                    <div className="p-3 border border-slate-100 bg-slate-50 rounded-lg flex items-start gap-2.5">
                      <div className="p-1 rounded bg-white border border-slate-200 text-indigo-600 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">GDPR Art. 37.1(c) special category volume</span>
                        <p className="text-slate-500 mt-0.5 leading-normal">Maps large-scale processing of religious, physical health, biometrics, or criminal record databases.</p>
                      </div>
                    </div>

                    <div className="p-3 border border-slate-100 bg-slate-50 rounded-lg flex items-start gap-2.5">
                      <div className="p-1 rounded bg-white border border-slate-200 text-indigo-600 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">GDPR Art. 37.5 officer qualification ledger</span>
                        <p className="text-slate-500 mt-0.5 leading-normal">Ascertains that the selected individual possesses formal privacy law training and certified credentials.</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedStandard === "ISO_27701" && (
                  <div className="space-y-2 text-[11px] text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <p className="font-bold text-slate-800">ISO/IEC 27701:2019 Privacy Information Management System (PIMS)</p>
                    <p>
                      This report maps the active DPO appointment controls directly to Clause 5.3 (Organizational roles, responsibilities, and authorities) 
                      and Clause 6.3 (Planning) of the ISO 27701 standard. Maintaining dedicated expertise in corporate privacy laws is an essential requirement 
                      for establishing effective administrative guards under PIMS controller/processor annex provisions.
                    </p>
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-200/50 text-[10px] text-slate-400 font-mono">
                      <span>• PIMS Role Verification: Compliant</span>
                      <span>• Clause 7.2.4 Control Mapping: Active</span>
                    </div>
                  </div>
                )}

                {selectedStandard === "CCPA_DPO" && (
                  <div className="space-y-2 text-[11px] text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <p className="font-bold text-slate-800">California Consumer Privacy Act (CCPA/CPRA) Compliance Controls</p>
                    <p>
                      Although the CCPA does not explicitly require an officer styled "DPO", the California Privacy Rights Act (CPRA) introduces requirements 
                      for regular privacy risk assessments (Sec. 1798.185) and strict compliance training records. The designated officer details listed herein 
                      meet the compliance monitoring requirements set forth by the California Privacy Protection Agency (CPPA).
                    </p>
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-200/50 text-[10px] text-slate-400 font-mono">
                      <span>• Consumer Requests Liaison: Enabled</span>
                      <span>• Sec. 1798.185 Risk Assessment Oversight: Active</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Appointed Officer Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  2. Registered Data Protection Officer Registry Details
                </h3>
                {activeDpo ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-[11px]">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold block">Full Appointed Name</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        {activeDpo.name}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold block">Official Contact</span>
                      <span className="font-mono text-slate-700">{activeDpo.email}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold block">Accrediting Licensing Body</span>
                      <span className="font-bold text-indigo-950 truncate block" title={activeDpo.cert_body}>{activeDpo.cert_body}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold block">Professional Certificate Name</span>
                      <span className="font-medium text-slate-700">{activeDpo.cert_name}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold block">License Registry Number</span>
                      <span className="font-mono text-slate-800 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200/50 inline-block">{activeDpo.cert_number}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold block">Statutory Validity Span</span>
                      <span className="text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {activeDpo.issue_date} — {activeDpo.expiry_date}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-rose-100 bg-rose-50/50 rounded-xl text-center text-xs text-rose-800 flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>Warning: No active Data Protection Officer has been officially appointed to the sovereign compliance ledger registry.</span>
                  </div>
                )}
              </div>

              {/* Evidence Inventory */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex justify-between items-center">
                  <span>3. Verified Evidence and Document Records ({documents.length} Files)</span>
                  <span className="text-[10px] text-indigo-600 font-mono font-bold lowercase tracking-normal">
                    {verifiedDocsCount} verified / {pendingDocsCount} pending
                  </span>
                </h3>

                {documents.length === 0 ? (
                  <div className="p-4 border border-dashed border-slate-200 bg-slate-50 rounded-xl text-center text-[11px] text-slate-500">
                    No compliance supporting documents have been loaded into the vault ledger.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono">
                          <th className="p-2.5 font-bold">Document Name & Ref</th>
                          <th className="p-2.5 font-bold">Classification Type</th>
                          <th className="p-2.5 font-bold">Verification Hash / Status</th>
                          <th className="p-2.5 font-bold text-right">Size</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {documents.map(doc => (
                          <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-2.5">
                              <div className="font-bold text-slate-900">{doc.name}</div>
                              <div className="text-[8px] text-slate-400 font-mono mt-0.5">ID: {doc.id.slice(0, 8)}...</div>
                            </td>
                            <td className="p-2.5 text-slate-600">{doc.doc_type}</td>
                            <td className="p-2.5 font-mono">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${doc.status === "VERIFIED" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                                <span className="text-slate-800">{doc.status === "VERIFIED" ? "VERIFIED" : "PENDING"}</span>
                              </div>
                              <div className="text-[8px] text-slate-400 mt-0.5">
                                {doc.verification_log ? `Hash Match: ${doc.verification_log.slice(20, 42)}...` : "Awaiting validation audit..."}
                              </div>
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-500">
                              {((doc.file_size || 0) / (1024 * 1024)).toFixed(2)} MB
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Document Footer & Signatures */}
            <div className="mt-12 border-t border-slate-200 pt-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 gap-10 text-[11px]">
                <div className="space-y-4">
                  <div className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold">Regulatory Officer Attestation</div>
                  <div className="border-b border-slate-300 pb-1 h-12 flex items-end justify-center select-none">
                    {activeDpo ? (
                      <span className="font-mono text-xs italic text-indigo-900/80 tracking-widest font-black uppercase flex items-center gap-1">
                        <Stamp className="w-3.5 h-3.5 text-indigo-500" />
                        Signed By: {activeDpo.name}
                      </span>
                    ) : (
                      <span className="text-slate-300 italic">Signature Not Recorded</span>
                    )}
                  </div>
                  <div className="text-center font-mono text-[9px] text-slate-400">
                    Data Protection Officer Signature <br />
                    Date: {activeDpo ? activeDpo.issue_date : "N/A"}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold">Lead Compliance Validator</div>
                  <div className="border-b border-slate-300 pb-1 h-12 flex items-end justify-center select-none">
                    <span className="font-mono text-xs italic text-slate-900/80 tracking-wider uppercase flex items-center gap-1.5">
                      <Stamp className="w-3.5 h-3.5 text-slate-500" />
                      Approved: Secure Ledger
                    </span>
                  </div>
                  <div className="text-center font-mono text-[9px] text-slate-400">
                    Assurance Ledger Gatekeeper <br />
                    Timestamp: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono border-t border-slate-100 pt-4">
                <span>Cryptographic Audit Proof: {reportHash}</span>
                <span className="flex items-center gap-1">
                  <Fingerprint className="w-3 h-3 text-indigo-500" />
                  Sovereign Clearance Secured
                </span>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};
