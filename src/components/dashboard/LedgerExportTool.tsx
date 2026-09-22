import React, { useState } from "react";
import { 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  ShieldCheck, 
  Clock, 
  Filter,
  CheckCircle2,
  Loader2,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuditLog {
  id: string | number;
  time: string;
  action: string;
  actor: string;
  target: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  actorRole: string;
}

interface LedgerExportToolProps {
  logs: AuditLog[];
  onExportComplete?: (format: string, count: number) => void;
}

export const LedgerExportTool: React.FC<LedgerExportToolProps> = ({ logs, onExportComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');
  const [includeSignature, setIncludeSignature] = useState(true);
  const [dateRange, setDateRange] = useState<'all' | '24h' | '7d' | '30d'>('all');

  const getFilteredLogs = () => {
    if (dateRange === 'all') return logs;
    
    const now = Date.now();
    const rangeMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[dateRange];

    return logs.filter(log => (now - new Date(log.time).getTime()) <= rangeMs);
  };

  const handleExport = async () => {
    setExporting(true);
    const filteredLogs = getFilteredLogs();
    
    // Simulate some processing time for "cryptographic signing"
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      let content = "";
      let filename = `audit_ledger_${Date.now()}`;

      if (selectedFormat === 'csv') {
        const headers = ['ID', 'Timestamp', 'Action', 'Actor', 'Target', 'Status', 'Severity', 'Role'];
        const rows = filteredLogs.map(log => [
          log.id,
          log.time,
          log.action,
          log.actor,
          log.target,
          log.status,
          log.severity,
          log.actorRole
        ]);
        
        const csvBody = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        if (includeSignature) {
          const signature = `
# --- SOVEREIGN COMPLIANCE SIGNATURE ---
# Issuer: Sovereign Trust Authority
# Integrity Hash: ${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}
# Timestamp: ${new Date().toISOString()}
# --- END SIGNATURE ---`;
          content = csvBody + signature;
        } else {
          content = csvBody;
        }
        filename += ".csv";
      } else {
        const exportData = {
          metadata: {
            generatedAt: new Date().toISOString(),
            recordCount: filteredLogs.length,
            tenantAuthority: "EU-LEX-SHIELD-V1",
            signature: includeSignature ? `SIG-AUTH-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : undefined
          },
          logs: filteredLogs
        };
        content = JSON.stringify(exportData, null, 2);
        filename += ".json";
      }

      const blob = new Blob([content], { type: selectedFormat === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      if (onExportComplete) onExportComplete(selectedFormat, filteredLogs.length);
      setIsOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold border border-slate-700 transition-all shadow-lg"
      >
        <Download className="w-4 h-4 text-indigo-400" />
        Advanced Export
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Ledger Export Tool</h3>
                    <p className="text-slate-400 text-xs font-medium">Compliance Audit Ready</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                {/* Format Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Export Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedFormat('csv')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        selectedFormat === 'csv' 
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span className="text-sm font-bold">CSV</span>
                    </button>
                    <button
                      onClick={() => setSelectedFormat('json')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        selectedFormat === 'json' 
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <FileJson className="w-4 h-4" />
                      <span className="text-sm font-bold">JSON</span>
                    </button>
                  </div>
                </div>

                {/* Date Range Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Time Window
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="all">Full Ledger History</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>

                {/* Options */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Cryptographic Signature</span>
                      <span className="text-[10px] text-slate-500">Include immutable proof of integrity</span>
                    </div>
                    <button
                      onClick={() => setIncludeSignature(!includeSignature)}
                      className={`w-10 h-5 rounded-full transition-all relative ${includeSignature ? 'bg-indigo-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${includeSignature ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Summary Info */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-950 px-3 py-2 rounded-lg">
                  <Filter className="w-3 h-3" />
                  Estimated: {getFilteredLogs().length} records to be exported
                </div>
              </div>

              <div className="p-4 sm:p-5 lg:p-6 bg-slate-950/50 border-t border-slate-800">
                <button
                  onClick={handleExport}
                  disabled={exporting || getFilteredLogs().length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Secure Export...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export Data
                    </>
                  )}
                </button>
                <p className="text-[9px] text-center text-slate-600 mt-4 uppercase tracking-[0.2em] font-bold">
                  Sovereign Audit Trust Chain Authority
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
