import React, { useState } from 'react';
import { 
  Shield, 
  Activity, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Search, 
  FileCheck,
  ChevronRight,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { executeMarketplaceScan, MarketplaceAuditReport, remediateMarketplaceIssue } from '../../lib/marketplace-scanner-service';

interface MarketplaceScannerProps {
  tenantId: string;
}

export const MarketplaceScanner: React.FC<MarketplaceScannerProps> = ({ tenantId }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<MarketplaceAuditReport | null>(null);
  const [remediatingId, setRemediatingId] = useState<string | null>(null);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const data = await executeMarketplaceScan(tenantId);
      setReport(data);
    } catch (e) {
      console.error('Marketplace scan failed', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemediate = async (id: string) => {
    setRemediatingId(id);
    try {
      const success = await remediateMarketplaceIssue(id);
      if (success && report) {
        setReport({
          ...report,
          results: report.results.map(r => r.id === id ? { ...r, status: 'OPTIMAL' as const, description: 'Issue successfully remediated by autonomous policy engine.' } : r)
        });
      }
    } finally {
      setRemediatingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-3xs">
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Marketplace Integrity Scanner</h3>
            <p className="text-[11px] text-slate-500 font-medium">Verify enclave health, billing sync, and regulatory drift.</p>
          </div>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-lg transition-all disabled:opacity-50"
        >
          {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          <span>{isScanning ? 'Scanning Infrastructure...' : 'Initiate Active Scan'}</span>
        </button>
      </div>

      <div className="p-6">
        {!report && !isScanning && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center text-slate-300">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Scan Required</h4>
              <p className="text-xs text-slate-400 max-w-xs">Run an integrity scan to verify your compliance enclaves are operating at 100% capacity.</p>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="py-12 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-100 rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
              <Shield className="w-8 h-8 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Deep System Inspection</h4>
              <p className="text-[10px] text-slate-500 font-mono animate-pulse">Analyzing tenant: {tenantId} • Cross-referencing NIS2/DORA policies...</p>
            </div>
          </div>
        )}

        {report && !isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* KPI Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-3xs">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Integrity Score</span>
                <div className="text-2xl font-black text-indigo-600">{report.score}%</div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-3xs">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Active Risks</span>
                <div className={`text-2xl font-black ${report.criticalIssues > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {report.criticalIssues} Critical
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-3xs">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Audits</span>
                <div className="text-2xl font-black text-slate-900">{report.totalChecks}</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileCheck className="w-3.5 h-3.5" /> Scan Results Detail
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-slate-50/30">
                {report.results.map((item) => (
                  <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-white transition-colors">
                    <div className={`p-2 rounded-xl mt-0.5 ${
                      item.status === 'CRITICAL' ? 'bg-rose-100 text-rose-600' :
                      item.status === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {item.status === 'OPTIMAL' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-sm font-bold text-slate-800 truncate">{item.label}</h5>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                          item.status === 'CRITICAL' ? 'bg-rose-600 text-white' :
                          item.status === 'WARNING' ? 'bg-amber-500 text-white' :
                          'bg-emerald-500 text-white'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <LayoutGrid className="w-3 h-3" /> {item.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(item.lastChecked).toLocaleTimeString()}
                          </span>
                        </div>

                        {item.status !== 'OPTIMAL' && (
                          <button
                            onClick={() => handleRemediate(item.id)}
                            disabled={remediatingId === item.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-lg text-[10px] font-black transition-all disabled:opacity-50"
                          >
                            {remediatingId === item.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Zap className="w-3 h-3" />
                            )}
                            Remediate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-indigo-900">Compliance Report Ready</h5>
                  <p className="text-[10px] text-indigo-700/70">A formal audit report has been generated for this scan session.</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-white text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-all">
                Download PDF <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
