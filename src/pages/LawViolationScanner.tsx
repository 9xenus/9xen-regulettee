import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { Search, AlertTriangle, ShieldAlert, CheckCircle2, Filter, Download, ArrowUpRight, Zap, History, ShieldCheck, FileText, Activity, Wand2, FileCode, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ViolationForensicReport } from '../components/ViolationForensicReport';
import { AutomatedRemediationWorkflow, FlaggedViolation } from '../components/AutomatedRemediationWorkflow';

export const LawViolationScanner = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'scanner' | 'ledger'>('scanner');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [expandedViolationId, setExpandedViolationId] = useState<string | null>(null);
  const [fixingViolationId, setFixingViolationId] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Forensic Report & Automated Remediation Modal States
  const [showForensicReport, setShowForensicReport] = useState(false);
  const [activeFixViolation, setActiveFixViolation] = useState<FlaggedViolation | null>(null);

  const handleTriggerFixWorkflow = (violation: any) => {
    setActiveFixViolation({
      id: violation.id,
      act: violation.act,
      issue: violation.issue,
      severity: violation.severity.toUpperCase(),
      source: violation.source,
      targetConfigFile: violation.source.includes('api') ? 'express-security.ts' : 'nginx.conf',
      codeSnippet: violation.codeSnippet,
      statuteCitation: violation.statuteCitation
    });
  };

  const handleQuickFix = async (id: string) => {
    setFixingViolationId(id);
    // Simulate AI fixing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setFixingViolationId(null);
    showToast(`AI Agent suggested a fix for ${id}.`, 'success');
  };

  const handleScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 2500);
  };

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetchWithRetry('/api/v1/regulatory/remediation-history');
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ledger') {
      fetchHistory();
    }
  }, [activeTab]);

  const violations = [
    {
      id: 'V-8821',
      severity: 'critical',
      act: 'GDPR Art. 32',
      issue: 'Unencrypted PII in Transit',
      source: 'api-gateway-us-east',
      status: 'auto-mitigated',
      time: '2 mins ago',
      codeSnippet: 'const data = encrypt(pii); // Should be encrypted, but it is plain',
      impactedFields: ['email', 'user_id'],
      statuteCitation: 'GDPR Article 32(1)(a)'
    },
    {
      id: 'V-8822',
      severity: 'high',
      act: 'DORA Ch. II',
      issue: 'ICT Third-Party Risk Outdated',
      source: 'vendor-sync-job',
      status: 'open',
      time: '1 hour ago',
      codeSnippet: '// No risk assessment performed',
      impactedFields: ['vendor_contract'],
      statuteCitation: 'DORA Chapter II Article 12'
    },
    {
      id: 'V-8823',
      severity: 'medium',
      act: 'AI Act Annex III',
      issue: 'High-Risk Model Bias Drift',
      source: 'credit-scoring-model-v2',
      status: 'investigating',
      time: '3 hours ago',
      codeSnippet: 'if (bias > threshold) { /* alert */ }',
      impactedFields: ['score', 'prediction'],
      statuteCitation: 'AI Act Annex III Article 15'
    }
  ];

  const filteredViolations = violations.filter(v => severityFilter === 'ALL' || v.severity.toUpperCase() === severityFilter);

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            Compliance Infrastructure
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time regulatory oversight and automated remediation ledger.
          </p>
        </div>
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl gap-1">
          <button 
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'scanner' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" /> Live Scanner
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'ledger' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" /> Remediation Ledger
          </button>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
                severityFilter === sev 
                  ? sev === 'ALL' ? 'bg-white text-slate-800 shadow-sm'
                  : sev === 'CRITICAL' ? 'bg-rose-600 text-white shadow-sm'
                  : sev === 'HIGH' ? 'bg-amber-500 text-white shadow-sm'
                  : sev === 'MEDIUM' ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'scanner' ? (
          <motion.div 
            key="scanner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="flex justify-between items-center bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Search className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-900">Project-Wide Forensic Scan</h4>
                  <p className="text-xs text-indigo-700">Scans codebase for GDPR, AI Act, and OWASP vulnerabilities.</p>
                </div>
              </div>
              <button 
                onClick={handleScan}
                disabled={isScanning}
                className="px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
              >
                {isScanning ? (
                  <><Zap className="w-4 h-4 animate-pulse text-amber-300" /> Scanning Modules...</>
                ) : (
                  <><Search className="w-4 h-4" /> Run Deep Scan</>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-rose-200 transition-colors group">
                 <div className="text-rose-600 mb-2 group-hover:scale-110 transition-transform"><ShieldAlert className="w-8 h-8" /></div>
                 <div className="text-3xl font-black text-slate-900">2<span className="text-base text-slate-500 font-medium ml-2">Critical</span></div>
                 <p className="text-xs text-slate-500 mt-1">Requires immediate manual intervention.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-amber-200 transition-colors group">
                 <div className="text-amber-500 mb-2 group-hover:scale-110 transition-transform"><AlertTriangle className="w-8 h-8" /></div>
                 <div className="text-3xl font-black text-slate-900">14<span className="text-base text-slate-500 font-medium ml-2">Warnings</span></div>
                 <p className="text-xs text-slate-500 mt-1">Approaching regulatory thresholds.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-emerald-200 transition-colors group">
                 <div className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform"><CheckCircle2 className="w-8 h-8" /></div>
                 <div className="text-3xl font-black text-slate-900">182<span className="text-base text-slate-500 font-medium ml-2">Auto-Mitigated</span></div>
                 <p className="text-xs text-slate-500 mt-1">Blocked automatically by the Policy Engine.</p>
              </div>
            </div>

            {scanComplete && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Recent Violations Detected
                  </h3>
                  <div className="flex gap-2">
                    <button className="text-slate-500 hover:text-slate-800 transition-colors p-1 bg-white border border-slate-200 rounded-md shadow-sm"><Filter className="w-4 h-4" /></button>
                    <button className="text-slate-500 hover:text-slate-800 transition-colors p-1 bg-white border border-slate-200 rounded-md shadow-sm"><Download className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 bg-slate-50/50 border-b border-slate-100 uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">ID / Time</th>
                        <th className="px-6 py-4">Regulatory Act</th>
                        <th className="px-6 py-4">Issue Description</th>
                        <th className="px-6 py-4">Source System</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredViolations.map((v) => (
                        <React.Fragment key={v.id}>
                          <tr 
                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => setExpandedViolationId(expandedViolationId === v.id ? null : v.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-bold text-slate-900">{v.id}</div>
                              <div className="text-xs text-slate-500">{v.time}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                              {v.act}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {v.severity === 'critical' && <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>}
                                {v.severity === 'high' && <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span>}
                                {v.severity === 'medium' && <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>}
                                <span className="text-slate-800 font-medium">{v.issue}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-500">
                              {v.source}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                                v.status === 'auto-mitigated' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                v.status === 'open' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}>
                                {v.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowForensicReport(true);
                                  }}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 flex items-center gap-1 transition-colors"
                                >
                                  <FileCode className="w-3.5 h-3.5 text-indigo-600" /> Forensic Report
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTriggerFixWorkflow(v);
                                  }}
                                  className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                                >
                                  <Wand2 className="w-3.5 h-3.5" /> Fix Violation
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedViolationId === v.id && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={6} className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                                  <div>
                                    <div className="font-bold text-slate-800 uppercase text-[10px] mb-1">Code Snippet</div>
                                    <pre className="bg-slate-900 text-indigo-300 p-3 rounded-lg overflow-x-auto font-mono">{v.codeSnippet}</pre>
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800 uppercase text-[10px] mb-1">Impacted Fields</div>
                                    <div className="flex flex-wrap gap-2">
                                      {v.impactedFields.map(f => <span key={f} className="bg-white border border-slate-200 px-2 py-1 rounded">{f}</span>)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800 uppercase text-[10px] mb-1">Statute Cited</div>
                                    <div className="text-indigo-600 font-bold">{v.statuteCitation}</div>
                                  </div>
                                  <div className="flex flex-col gap-2 justify-center">
                                    <button 
                                      onClick={() => handleTriggerFixWorkflow(v)}
                                      className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                      <Wand2 className="w-3.5 h-3.5" /> Fix via AI Config Patch
                                    </button>
                                    <button 
                                      onClick={() => setShowForensicReport(true)}
                                      className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                                    >
                                      <Calculator className="w-3.5 h-3.5 text-emerald-600" /> View Forensic Report & Penalty
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="ledger"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  Historical Remediation Ledger
                </h3>
                <button 
                  onClick={fetchHistory}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-100 px-3 py-1 rounded-lg shadow-sm"
                >
                  Refresh Feed
                </button>
              </div>
              
              <div className="p-4 sm:p-5 lg:p-6">
                {isLoadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500">Retrieving audit evidence trail...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="p-4 bg-slate-100 rounded-full">
                      <ShieldCheck className="w-12 h-12 text-slate-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900">No remediation events found</p>
                      <p className="text-sm text-slate-500">Auto-fixes will appear here as they are triggered by the scanner.</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-100 ml-3 space-y-5 sm:space-y-8 pb-4">
                    {history.map((event, idx) => (
                      <div key={event.id} className="relative pl-8 group">
                        {/* Timeline node */}
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-white bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)] group-hover:scale-125 transition-transform"></div>
                        
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-md transition-all">
                          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-white bg-slate-900 px-1.5 py-0.5 rounded tracking-tighter">AUDIT LOG</span>
                                <span className="text-xs font-mono text-slate-400">{event.id}</span>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-500 font-medium">{new Date(event.timestamp).toLocaleString()}</span>
                              </div>
                              <h4 className="text-base font-bold text-slate-900">{event.articleMapping}</h4>
                              <p className="text-xs font-mono text-slate-500">{event.filePath}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Before</div>
                                <div className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">
                                  {event.beforeStatus}
                                </div>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-slate-300 rotate-45" />
                              <div className="text-center">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">After</div>
                                <div className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                                  event.afterStatus === 'COMPLIANT' 
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                    : 'bg-amber-100 text-amber-700 border-amber-200'
                                }`}>
                                  {event.afterStatus}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                event.verificationResult === 'PASSED' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}></span>
                              <span className="text-xs font-bold text-slate-600">Verification: {event.verificationResult}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              event.severity === 'CRITICAL' ? 'bg-rose-600 text-white' :
                              event.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                              'bg-amber-400 text-white'
                            }`}>
                              {event.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forensic Report Modal */}
      {showForensicReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="w-full max-w-6xl">
            <ViolationForensicReport onClose={() => setShowForensicReport(false)} />
          </div>
        </div>
      )}

      {/* Automated Remediation Workflow Modal */}
      <AutomatedRemediationWorkflow
        isOpen={!!activeFixViolation}
        onClose={() => setActiveFixViolation(null)}
        violation={activeFixViolation}
        onPatchApplied={(vId, file) => {
          console.log(`Violation ${vId} patched for config ${file}`);
        }}
      />
    </div>
  );
};
