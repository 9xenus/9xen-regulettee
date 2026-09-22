import React from "react";
import { FileText, Download, X } from "lucide-react";
import { generatePdfExport } from "../utils/pdfGenerator";

export const ClientDashboardPdfDialog: React.FC<any> = ({ isOpen, onClose, className = "" }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    generatePdfExport(
      "Acme Europe Sovereign Dashboard Executive Report",
      ["Parameter", "Status / Value"],
      [
        ["Organization", "Acme Corporation Europe SA"],
        ["Compliance Score", "98.4%"],
        ["GDPR Article 30 Audit", "VERIFIED"],
        ["EU AI Act Enclave", "COMPLIANT (Annex IV)"],
        ["DORA Resilience", "TIER-1 ACTIVE"]
      ],
      "acme_sovereign_dashboard_report"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 p-6 shadow-2xl ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <FileText className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Generate Executive PDF</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Generate an executive-ready, cryptographically signed PDF dashboard report for regulators and board members.
        </p>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
        >
          <Download className="w-4 h-4" /> Download PDF Report
        </button>
      </div>
    </div>
  );
};

export default ClientDashboardPdfDialog;
