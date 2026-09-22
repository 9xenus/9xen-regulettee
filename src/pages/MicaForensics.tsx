import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Activity, Search, Database, BarChart3, Clock, AlertTriangle, 
  FileText, CheckCircle2, Download, Eye, Send, X, Landmark, ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';

interface Transaction {
  id: string;
  timestamp: string;
  walletFrom: string;
  walletTo: string;
  asset: string;
  amount: number;
  status: 'Clean' | 'Suspicious' | 'Investigating';
  riskScore: number;
}

interface MicaSARReport {
  id: string;
  ncaReference: string;
  timestamp: string;
  suspectWallets: string[];
  totalVolumeEur: number;
  anomalyType: string;
  statutoryArticle: string;
  narrative: string;
  status: 'SUBMITTED_TO_NCA' | 'UNDER_SUPERVISORY_REVIEW' | 'ESCALATED';
  confidenceScore: number;
  xmlPayloadSnippet: string;
}

const mockTransactions: Transaction[] = [
  { id: 'TXN-001', timestamp: '2026-06-25 10:14:22', walletFrom: '0x1A2b...', walletTo: '0x9c3d...', asset: 'USDC', amount: 50000, status: 'Clean', riskScore: 12 },
  { id: 'TXN-002', timestamp: '2026-06-25 10:15:05', walletFrom: '0x4F5e...', walletTo: '0x1A2b...', asset: 'USDC', amount: 49950, status: 'Suspicious', riskScore: 94 }, // Wash trading pattern
  { id: 'TXN-003', timestamp: '2026-06-25 10:20:11', walletFrom: '0x7b8A...', walletTo: '0x21cF...', asset: 'ETH', amount: 15.5, status: 'Clean', riskScore: 8 },
  { id: 'TXN-004', timestamp: '2026-06-25 10:45:30', walletFrom: '0x9c3d...', walletTo: '0x4F5e...', asset: 'USDC', amount: 49900, status: 'Suspicious', riskScore: 96 },
];

export const MicaForensics: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'surveillance' | 'reports'>('surveillance');
  const [isScanning, setIsScanning] = useState(false);
  const [transactions] = useState(mockTransactions);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // SAR Reports & Modal States
  const [reports, setReports] = useState<MicaSARReport[]>([]);
  const [showSARModal, setShowSARModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MicaSARReport | null>(null);
  const [isSubmittingSAR, setIsSubmittingSAR] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SAR Form fields
  const [sarAuthority, setSarAuthority] = useState('BaFin (Germany - Lead NCA)');
  const [sarReason, setSarReason] = useState('Circular triangular wash trading loop detected across USDC liquidity pools without economic substance.');

  const fetchSARs = async () => {
    try {
      const res = await fetchWithRetry('/api/v1/fintech/mica-sar');
      const data = await res.json();
      if (data.success && Array.isArray(data.reports)) {
        setReports(data.reports);
      }
    } catch (e) {
      console.error('Failed to load SAR reports:', e);
    }
  };

  useEffect(() => {
    fetchSARs();
  }, []);

  const runForensicScan = async () => {
    setIsScanning(true);
    setAnalysisResult(null);
    try {
      const res = await fetchWithRetry('/api/v1/fintech/mica-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: mockTransactions })
      });
      const data = await res.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
      } else {
        showToast('Analysis failed: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error connecting to Forensic Engine', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateSAR = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSAR(true);
    try {
      const payload = {
        suspectWallets: ['0x4F5e...', '0x1A2b...', '0x9c3d...'],
        totalVolumeEur: 99850,
        anomalyType: 'Circular Wash-Trading Ring (MiCA Art. 86)',
        narrative: `${sarReason} Targeted Competent Authority: ${sarAuthority}.`
      };

      const res = await fetchWithRetry('/api/v1/fintech/mica-sar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReports(prev => [data.report, ...prev]);
        setShowSARModal(false);
        setActiveTab('reports');
        setToastMessage(`Suspicious Activity Report filed successfully! NCA Ref: ${data.report.ncaReference}`);
        setTimeout(() => setToastMessage(null), 6000);
      } else {
        showToast('Failed to submit SAR: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (e) {
      console.error('Error filing SAR:', e);
      showToast('Error filing SAR to NCA endpoint', 'error');
    } finally {
      setIsSubmittingSAR(false);
    }
  };

  const handleDownloadSAR = (report: MicaSARReport) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${report.ncaReference}-SAR.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 text-left">
      {toastMessage && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            MICA Crypto-Forensic Engine
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time market surveillance, wash-trading cycle detection, and on-chain compliance under MiCA Articles 86–92.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            id="tab-surveillance"
            onClick={() => setActiveTab('surveillance')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'surveillance' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            Market Surveillance
          </button>
          <button 
            id="tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <span>Compliance Reports</span>
            {reports.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeTab === 'reports' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'}`}>
                {reports.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'surveillance' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Analyzed Volume</span>
                <Database className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-800">€14.2M</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <Activity className="w-3 h-3" /> +12% last 24h
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wash Trading Flags</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-600">2</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">
                Detected by Isolation Forest AI (MiCA Art. 86)
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sanction Matches</span>
                <Search className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-slate-800">0</div>
              <div className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Clear against EUTL & OFAC
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Live Transaction Stream & Heuristic Abuse Classification
              </h3>
              <button 
                id="btn-run-scan"
                onClick={runForensicScan}
                disabled={isScanning}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
              >
                {isScanning ? (
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <BarChart3 className="w-3.5 h-3.5" />
                )}
                {isScanning ? 'Running AI Diagnostics...' : 'Run Market Abuse Scan'}
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3">Tx ID</th>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">From</th>
                    <th className="px-6 py-3">To</th>
                    <th className="px-6 py-3">Asset/Amount</th>
                    <th className="px-6 py-3">Risk Score</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs font-bold">{tx.id}</td>
                      <td className="px-6 py-3 text-xs text-slate-500">{tx.timestamp}</td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-600">{tx.walletFrom}</td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-600">{tx.walletTo}</td>
                      <td className="px-6 py-3 font-semibold">{tx.amount.toLocaleString()} {tx.asset}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${tx.riskScore > 80 ? 'bg-rose-500' : tx.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${tx.riskScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{tx.riskScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${
                          tx.status === 'Clean' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          tx.status === 'Suspicious' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {analysisResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-5 lg:p-6 bg-slate-900 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold uppercase tracking-wider">
                    <BarChart3 className="w-4 h-4" />
                    AI Forensic Analysis & Market Abuse Finding
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                    Regulation (EU) 2023/1114 Compliant
                  </span>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {analysisResult}
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button 
                    id="btn-generate-sar"
                    onClick={() => setShowSARModal(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Generate Suspicious Activity Report (SAR)
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Official MiCA Suspicious Activity Reports (SAR / STOR)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ESMA-compliant filing ledger under MiCA Article 92 and 6AMLD predicate offense tracking.
                </p>
              </div>
              <button
                id="btn-new-sar"
                onClick={() => setShowSARModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                File New SAR to NCA
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No SAR Reports Recorded Yet</p>
                <p className="text-xs text-slate-400 mt-1">Run an AI Market Abuse Scan or file a manual report to generate formal regulatory submissions.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-y border-slate-100">
                    <tr>
                      <th className="px-4 py-3">NCA Reference</th>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Anomaly Type</th>
                      <th className="px-4 py-3">Total Volume</th>
                      <th className="px-4 py-3">Statutory Basis</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600">
                          {rep.ncaReference}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(rep.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {rep.anomalyType}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          €{rep.totalVolumeEur.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-600">
                          {rep.statutoryArticle}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {rep.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`view-sar-${rep.id}`}
                              onClick={() => setSelectedReport(rep)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Regulatory Payload"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              id={`download-sar-${rep.id}`}
                              onClick={() => handleDownloadSAR(rep)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Download Report (JSON)"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SAR FILING MODAL */}
      <AnimatePresence>
        {showSARModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">File Suspicious Activity Report (SAR)</h3>
                    <p className="text-xs text-slate-500">Official submission to National Competent Authority under MiCA Article 92</p>
                  </div>
                </div>
                <button onClick={() => setShowSARModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGenerateSAR} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Designated National Competent Authority (NCA)
                  </label>
                  <select
                    value={sarAuthority}
                    onChange={(e) => setSarAuthority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="BaFin (Germany - Lead NCA)">🇩🇪 BaFin (Federal Financial Supervisory Authority, Germany)</option>
                    <option value="AMF (France - Lead NCA)">🇫🇷 AMF (Autorité des Marchés Financiers, France)</option>
                    <option value="CNMV (Spain - Lead NCA)">🇪🇸 CNMV (Comisión Nacional del Mercado de Valores, Spain)</option>
                    <option value="ESMA Super-Hub (EU-Wide)">🇪🇺 ESMA Common Reporting Hub (STOR Portal)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Suspect Wallets</span>
                    <span className="font-mono font-bold text-slate-800">3 Addresses Flagged</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Artificial Volume</span>
                    <span className="font-bold text-rose-600">€99,850 USDC</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Forensic Justification & Narrative
                  </label>
                  <textarea
                    rows={4}
                    value={sarReason}
                    onChange={(e) => setSarReason(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
                  <Landmark className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    Submitting this form securely transmits the goAML XML bundle to the designated Financial Intelligence Unit (FIU) and seals an immutable audit trail.
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSARModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-sar-form"
                    type="submit"
                    disabled={isSubmittingSAR}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isSubmittingSAR ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {isSubmittingSAR ? 'Transmitting to NCA...' : 'Sign & Submit to NCA'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SAR VIEW DETAILS MODAL */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-left"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">NCA Submission: {selectedReport.ncaReference}</h3>
                    <p className="text-xs text-slate-500">{selectedReport.anomalyType}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Status</span>
                    <span className="font-bold text-emerald-600">{selectedReport.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Filed Date</span>
                    <span className="font-bold text-slate-800">{new Date(selectedReport.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Volume</span>
                    <span className="font-bold text-slate-800">€{selectedReport.totalVolumeEur.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Confidence</span>
                    <span className="font-bold text-indigo-600">{selectedReport.confidenceScore}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Suspect Wallets</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.suspectWallets.map((w, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-xs rounded border border-slate-200">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Investigative Narrative</h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {selectedReport.narrative}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">goAML XML Payload Snippet</h4>
                  <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800">
                    {selectedReport.xmlPayloadSnippet}
                  </pre>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadSAR(selectedReport)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Complete File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
