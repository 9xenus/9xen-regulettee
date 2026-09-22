import React, { useState } from "react";
import { Download, FileSpreadsheet, FileCode, ShieldCheck, CheckCircle2, Calendar } from "lucide-react";
import { generatePdfExport } from "../utils/pdfGenerator";

export const AuditExport: React.FC<any> = ({ className = "" }) => {
  const [format, setFormat] = useState<"pdf" | "csv" | "json">("pdf");
  const [timeframe, setTimeframe] = useState("30d");
  const [exporting, setExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setDownloaded(false);

    setTimeout(() => {
      if (format === "pdf") {
        generatePdfExport(
          "Sovereign Audit Ledger Report",
          ["Parameter", "Metric Value"],
          [
            ["Organization", "Acme Corporation Europe"],
            ["Audit Period", `Trailing ${timeframe}`],
            ["Compliance Score", "98.4%"],
            ["Verifiable Hash", "sha256_8f93e18a912"]
          ],
          `audit_report_${timeframe}`
        );
      } else if (format === "json") {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
          organization: "Acme Corporation Europe",
          auditPeriod: timeframe,
          complianceScore: 98.4,
          timestamp: new Date().toISOString()
        }, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `audit_report_${timeframe}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      } else {
        const csvContent = "data:text/csv;charset=utf-8,ID,Category,Severity,Status\n1,GDPR,High,Resolved\n2,AI_Act,Medium,Active\n3,DORA,Critical,Compliant";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audit_report_${timeframe}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      setExporting(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 800);
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Sovereign Audit Export Engine</h3>
          <p className="text-xs text-slate-400">Generate cryptographic audit reports for regulatory submission</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-indigo-400" /> Export Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["pdf", "csv", "json"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase transition-all ${
                  format === f
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Timeframe Window
          </label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="7d">Trailing 7 Days</option>
            <option value="30d">Trailing 30 Days</option>
            <option value="90d">Trailing Q3 Quarter</option>
            <option value="365d">Full Fiscal Year (2026)</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-semibold transition-all shadow-lg shadow-emerald-600/20"
      >
        {downloaded ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-white" /> Report Generated & Downloaded!
          </>
        ) : (
          <>
            <Download className="w-4 h-4" /> Download Signed Audit Report ({format.toUpperCase()})
          </>
        )}
      </button>
    </div>
  );
};

export default AuditExport;
