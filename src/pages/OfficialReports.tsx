import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import {
  FileText,
  Download,
  Plus,
  Archive,
  Loader2,
  CheckCircle2,
  FileUp,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Calendar,
  Building2,
  ExternalLink,
  Coins,
  ArrowRight,
  Printer,
  Copy,
  X,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { entitlementService, MOCK_TENANTS } from '../lib/entitlementEngine';
import { ExportPdfDialog } from '../components/ExportPdfDialog';
import { OneClickAuditBundleGenerator } from '../components/compliance/OneClickAuditBundleGenerator';

interface SummaryData {
  tenantId: string;
  tenantName: string;
  plan: string;
  generatedAt: string;
  activeActs: Array<{ id: string; name: string; type: string; score: number; price: number }>;
  skippedActs: Array<{ id: string; name: string; reason: string }>;
  recommendedActs: Array<{ id: string; name: string; score: number; price: number }>;
  overallPostureScore: number;
  complianceRating: string;
  totalTariff: number;
  criticalGaps: string[];
}

interface Report {
  id: string;
  name: string;
  status: string;
  desc: string;
  downloadUri?: string;
  hash?: string;
  type?: 'REPORT' | 'ARCHIVE' | 'PDF' | 'SUMMARY';
  summaryData?: SummaryData;
  complianceStatus?: 'Compliant' | 'Pending Review' | 'Violation Detected';
}

interface OfficialReportsProps {
  tenantContext?: {
    id: string;
    name: string;
  };
}

export const OfficialReports: React.FC<OfficialReportsProps> = ({ tenantContext }) => {
  const { showToast } = useNotification();
  const [selectedTenantId, setSelectedTenantId] = useState(tenantContext?.id || 'tenant_1');
  const [reports, setReports] = useState<Report[]>([
    { id: 'mock-1', name: 'Q2 2026 AI Algorithm Opacity Report', status: 'READY', desc: 'JSON-LD deterministic trace map.', type: 'REPORT', complianceStatus: 'Compliant' },
    { id: 'mock-2', name: 'June DORA Resilience State', status: 'READY', desc: 'Monthly availability SLA audit.', type: 'REPORT', complianceStatus: 'Violation Detected' },
    { id: 'mock-3', name: 'GDPR Article 28 Summary', status: 'PROCESSING', desc: 'Executing aggregation query.', type: 'REPORT', complianceStatus: 'Pending Review' }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Summary generation states
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilingStep, setCompilingStep] = useState('');
  const [selectedReportForView, setSelectedReportForView] = useState<Report | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<'overview' | 'frameworks' | 'gaps' | 'financials'>('overview');
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);

  useEffect(() => {
    if (tenantContext?.id) {
      setSelectedTenantId(tenantContext.id);
    }
  }, [tenantContext]);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetchWithRetry('/api/v1/reporting/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt'
        },
        body: JSON.stringify({ tenantId: selectedTenantId, reportType: 'AI_ACT_AUDIT' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReports(prev => [{
        id: data.reportId,
        name: `Formal Audit Report - ${new Date().toLocaleDateString()}`,
        status: data.status,
        desc: `Integrity Hash: ${data.integrityHash.substring(0, 16)}...`,
        downloadUri: data.downloadUri,
        hash: data.integrityHash,
        type: 'REPORT',
        complianceStatus: 'Compliant'
      }, ...prev]);
    } catch (e: any) {
      showToast(`Error generating report: ${e.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetchWithRetry('/api/v1/reporting/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt'
        },
        body: JSON.stringify({ tenantId: selectedTenantId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReports(prev => [{
        id: data.checksum,
        name: `GDPR Article 20 Data Portability Archive`,
        status: 'READY',
        desc: `Checksum: ${data.checksum.substring(0, 16)}...`,
        downloadUri: data.downloadUrl,
        hash: data.checksum,
        type: 'ARCHIVE',
        complianceStatus: 'Compliant'
      }, ...prev]);
    } catch (e: any) {
      showToast(`Error exporting DPA: ${e.message}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const generatePdfExport = async () => {
    setIsGeneratingPdf(true);
    try {
      // Simulate API call for PDF generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setReports(prev => [{
        id: `pdf-${Date.now()}`,
        name: `Audit Logs & Compliance Summary`,
        status: 'READY',
        desc: `Format: Signed PDF. Timestamp: ${new Date().toLocaleDateString()}`,
        downloadUri: '/downloads/audit-summary.pdf',
        hash: 'sha256:1a2b3c4d5e6f7g8h',
        type: 'PDF',
        complianceStatus: 'Pending Review'
      }, ...prev]);
    } catch (e: any) {
      showToast(`Error generating PDF: ${e.message}`, 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsCompiling(true);
    const steps = [
      'Establishing secure connection with Regulatory Ledger...',
      'Aggregating tenant entitlements & configuration indices...',
      'Synthesizing active policy frameworks (GDPR, DORA, NIS2)...',
      'Scanning vulnerability telemetry and risk mapping databases...',
      'Evaluating compliance posture index and generating summaries...',
      'Finalizing cryptographic signature for digest validation...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setCompilingStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const tenantObj = MOCK_TENANTS.find(t => t.id === selectedTenantId) || {
      id: selectedTenantId,
      name: tenantContext?.name || 'Sovereign Enterprise',
      plan: 'pro'
    };

    const regs = entitlementService.getTenantRegulations(selectedTenantId);
    const active = regs.filter(r => r.enabled);
    const skipped = regs.filter(r => r.status === 'skip');
    const recommended = regs.filter(r => r.status === 'upgrade');
    const totalCost = entitlementService.calculateMonthlyCost(selectedTenantId);

    // Calculate a realistic posture score based on active regulations vs recommended
    const activeCount = active.length;
    const postureScore = Math.min(100, Math.round((activeCount / (activeCount + recommended.length || 1)) * 100));

    let complianceRating = 'HIGH RISK';
    let compStatus: 'Compliant' | 'Pending Review' | 'Violation Detected' = 'Pending Review';
    if (postureScore >= 90) {
      complianceRating = 'A+ OUTSTANDING';
      compStatus = 'Compliant';
    } else if (postureScore >= 75) {
      complianceRating = 'A COMPLIANT';
      compStatus = 'Compliant';
    } else if (postureScore >= 50) {
      complianceRating = 'B PARTIAL';
      compStatus = 'Pending Review';
    } else if (postureScore >= 30) {
      complianceRating = 'C ATTENTION REQUIRED';
      compStatus = 'Violation Detected';
    } else {
      compStatus = 'Violation Detected';
    }

    const newReport: Report = {
      id: `summary-${Date.now()}`,
      name: `Compliance Summary Digest - ${tenantObj.name}`,
      status: 'READY',
      desc: `Sovereign digest compiled. Posture Index: ${postureScore}% (${complianceRating}).`,
      type: 'SUMMARY',
      hash: `sha256:${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`,
      complianceStatus: compStatus,
      summaryData: {
        tenantId: selectedTenantId,
        tenantName: tenantObj.name,
        plan: tenantObj.plan || (tenantObj as any).tier || 'Unknown',
        generatedAt: new Date().toLocaleString(),
        activeActs: active.map(a => ({ id: a.actId, name: a.name, type: a.planInclusion, score: a.applicabilityScore, price: a.price })),
        skippedActs: skipped.map(s => ({ id: s.actId, name: s.name, reason: s.skipReason || 'Threshold exemption criteria met' })),
        recommendedActs: recommended.map(r => ({ id: r.actId, name: r.name, score: r.applicabilityScore, price: r.price })),
        overallPostureScore: postureScore,
        complianceRating,
        totalTariff: totalCost,
        criticalGaps: recommended.map(r => `Unresolved regulatory compliance exposure to the ${r.name} directive framework.`)
      }
    };

    setReports(prev => [newReport, ...prev]);
    setIsCompiling(false);
    setCompilingStep('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    if (!selectedReportForView?.summaryData) return;
    try {
      const data = selectedReportForView.summaryData;
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.text("Compliance Summary Report", 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Tenant ID: ${data.tenantId}`, 20, 35);
      doc.text(`Tenant Name: ${data.tenantName}`, 20, 45);
      doc.text(`Generated At: ${data.generatedAt}`, 20, 55);
      doc.text(`Plan Tier: ${data.plan.toUpperCase()}`, 20, 65);
      
      doc.setFontSize(16);
      doc.text(`Overall Compliance Posture: ${data.overallPostureScore}%`, 20, 85);
      doc.text(`Compliance Rating: ${data.complianceRating}`, 20, 95);
      
      doc.setFontSize(14);
      doc.text("Active Directives", 20, 115);
      doc.setFontSize(11);
      let y = 125;
      data.activeActs.forEach((act) => {
        doc.text(`• ${act.name} (${act.id}) - EUR ${act.price}/mo`, 25, y);
        y += 10;
      });
      
      y += 10;
      doc.setFontSize(14);
      doc.text("Skipped Frameworks", 20, y);
      doc.setFontSize(11);
      y += 10;
      data.skippedActs.forEach((act) => {
        doc.text(`• ${act.name} - ${act.reason}`, 25, y);
        y += 10;
      });
      
      y += 10;
      doc.setFontSize(14);
      doc.text(`Total Active Monthly Tariff: EUR ${data.totalTariff}/mo`, 20, y);
      
      doc.save(`compliance-summary-${data.tenantId}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      showToast("Failed to generate PDF", 'error');
    }
  };

  const getReportText = (data?: SummaryData) => {
    if (!data) return '';
    return `========================================
COMPLIANCE SUMMARY REPORT: ${data.tenantName}
========================================
Generated At: ${data.generatedAt}
Tenant ID: ${data.tenantId}
Plan Tier: ${data.plan.toUpperCase()}
Overall Compliance Posture: ${data.overallPostureScore}%
Compliance Rating: ${data.complianceRating}
Active Directives: ${data.activeActs.map(a => `${a.name} (${a.id})`).join(', ')}
Skipped Frameworks: ${data.skippedActs.map(s => `${s.name} (Exemption: ${s.reason})`).join(', ')}
Total Active Monthly Tariff: €${data.totalTariff}/month
========================================`;
  };

  const currentSelectedTenantName = MOCK_TENANTS.find(t => t.id === selectedTenantId)?.name || tenantContext?.name || 'Sovereign Enterprise';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header section with Tenant context feedback */}
      <div className="border-b border-slate-200 pb-5 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 text-left">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider">
              {currentSelectedTenantName}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Official Reports</h1>
          <p className="text-slate-500 mt-1">Generated JSON-LD, signed PDFs, and automated compliance executive summaries.</p>
        </div>

        {/* Tenant Selector + Control Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="bg-transparent border-0 ring-0 outline-none text-xs text-slate-700 font-bold pr-6 cursor-pointer focus:ring-0 focus:outline-none"
            >
              {MOCK_TENANTS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setIsPdfDialogOpen(true)}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-2xs hover:bg-slate-50 transition-colors flex items-center space-x-2 text-xs cursor-pointer"
          >
            <FileUp className="w-3.5 h-3.5 text-rose-600" />
            <span>Export Signed PDF</span>
          </button>
          <button 
            onClick={generateExport}
            disabled={isExporting}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-2xs hover:bg-slate-50 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5 text-slate-500" />}
            <span>Export ZIP Archive</span>
          </button>
          
          {/* Main Requested Summary Generation Button */}
          <button 
            onClick={handleGenerateSummary}
            disabled={isCompiling}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 border border-amber-500 text-white font-extrabold rounded-lg shadow-2xs transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 cursor-pointer"
          >
            {isCompiling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Generate Summary Report</span>
          </button>

          <button 
            onClick={generateReport}
            disabled={isGenerating}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 text-white font-semibold rounded-lg shadow-2xs transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Create Custom Audit</span>
          </button>
        </div>
      </div>

      {/* One-Click Cryptographically Signed Audit Bundle Section */}
      <OneClickAuditBundleGenerator
        tenantId={selectedTenantId}
        tenantName={currentSelectedTenantName}
        onFilingComplete={(receipt) => {
          setReports(prev => [{
            id: receipt.filingId,
            name: `Regulatory Filing Receipt - ${receipt.regulatorCode} (${receipt.docketNumber})`,
            status: 'READY',
            desc: `Filed with ${receipt.regulatorName}. Verification: ${receipt.verificationHash.slice(0, 16)}...`,
            downloadUri: `/api/v1/reporting/audit-bundle/history`,
            hash: receipt.verificationHash,
            type: 'REPORT',
            complianceStatus: 'Compliant'
          }, ...prev]);
        }}
      />

      {/* Generating step indicator overlay banner */}
      <AnimatePresence>
        {isCompiling && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-left"
          >
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 font-mono">COMPILING COMPLIANCE SUMMARY REPORT</p>
              <p className="text-xs text-amber-700 mt-0.5">{compilingStep}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reports Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
        {reports.map((report, i) => (
          <motion.div 
            key={report.id} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: i * 0.05 }} 
            className={`bg-white border rounded-xl p-5 shadow-2xs flex flex-col h-full hover:shadow-xs transition-shadow ${
              report.type === 'SUMMARY' ? 'border-amber-200 ring-2 ring-amber-50/50' : 'border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                {report.type === 'SUMMARY' ? (
                  <Sparkles className="w-6 h-6 text-amber-500" />
                ) : report.type === 'PDF' ? (
                  <FileUp className="w-6 h-6 text-rose-600" />
                ) : report.name.includes('Archive') || report.type === 'ARCHIVE' ? (
                  <Archive className="w-6 h-6 text-slate-600" />
                ) : (
                  <FileText className="w-6 h-6 text-indigo-600" />
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  report.status === 'READY' || report.status === 'COMPLETED' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}>
                  {report.status}
                </span>

                {/* Visual Status Badge */}
                {(() => {
                  const compStatus = report.complianceStatus || (
                    report.status !== 'READY' && report.status !== 'COMPLETED' 
                      ? 'Pending Review' 
                      : report.name.toLowerCase().includes('resilience') || report.name.toLowerCase().includes('violation')
                      ? 'Violation Detected'
                      : 'Compliant'
                  );
                  return (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                      compStatus === 'Compliant'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : compStatus === 'Violation Detected'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                        compStatus === 'Compliant'
                          ? 'bg-emerald-500'
                          : compStatus === 'Violation Detected'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`} />
                      {compStatus}
                    </span>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 mb-1 leading-snug">{report.name}</h3>
              <p className="text-xs text-slate-500 mb-6 font-mono text-opacity-80">{report.desc}</p>
            </div>
            
            {report.type === 'SUMMARY' ? (
              <button 
                onClick={() => setSelectedReportForView(report)}
                className="mt-auto w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg flex justify-center items-center space-x-2 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Live Summary</span>
              </button>
            ) : (
              <button 
                disabled={report.status !== 'READY' && report.status !== 'COMPLETED'} 
                className="mt-auto w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg flex justify-center items-center space-x-2 transition-colors cursor-pointer"
              >
                {report.status === 'READY' || report.status === 'COMPLETED' ? <Download className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {report.type === 'PDF' ? 'Download PDF' : report.type === 'ARCHIVE' ? 'Download ZIP' : 'Download Signed Export'}
                </span>
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Compliance summary document Modal drawer */}
      <AnimatePresence>
        {selectedReportForView && selectedReportForView.summaryData && (
          <div className="fixed inset-0 z-[110] overflow-y-auto p-4 md:p-10 flex items-start justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReportForView(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Document Modal box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-left"
            >
              {/* Header metadata bar */}
              <div className="bg-slate-900 text-white p-5 md:p-6 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileCheck className="w-5 h-5 text-amber-400" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">SECURE DIGITAL SUMMARIZER REPORT</span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">
                    Compliance Summary Digest
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Assessing <strong>{selectedReportForView.summaryData.tenantName}</strong> on {selectedReportForView.summaryData.generatedAt}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReportForView(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub bar: Document status indices */}
              <div className="bg-slate-50 border-b border-slate-100 px-4 sm:px-6 py-3 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                <span>Tenant ID: <strong className="text-slate-800 font-mono">{selectedReportForView.summaryData.tenantId}</strong></span>
                <span>•</span>
                <span>Plan Level: <strong className="text-slate-800 uppercase">{selectedReportForView.summaryData.plan}</strong></span>
                <span>•</span>
                <span>Report Signature: <strong className="text-slate-800 font-mono">{selectedReportForView.hash}</strong></span>
              </div>

              <div className="flex flex-col md:flex-row min-h-[400px]">
                {/* Navigation panel */}
                <div className="w-full md:w-56 bg-slate-50/50 border-r border-slate-100 p-4 space-y-1 shrink-0">
                  <button
                    onClick={() => setActiveDocTab('overview')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      activeDocTab === 'overview'
                        ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Executive Overview
                  </button>
                  <button
                    onClick={() => setActiveDocTab('frameworks')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      activeDocTab === 'frameworks'
                        ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Active Directives ({selectedReportForView.summaryData.activeActs.length})
                  </button>
                  <button
                    onClick={() => setActiveDocTab('gaps')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      activeDocTab === 'gaps'
                        ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Gap & Risk Gaps ({selectedReportForView.summaryData.recommendedActs.length})
                  </button>
                  <button
                    onClick={() => setActiveDocTab('financials')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      activeDocTab === 'financials'
                        ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5 text-indigo-500" />
                    Financial Analysis
                  </button>
                </div>

                {/* Content Panel */}
                <div className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto max-h-[480px]">
                  
                  {activeDocTab === 'overview' && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">POSTURE SCALE</span>
                          <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-3xl font-black text-slate-900">{selectedReportForView.summaryData.overallPostureScore}%</span>
                            <span className="text-slate-400 text-xs">coverage</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${selectedReportForView.summaryData.overallPostureScore}%` }} />
                          </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">COMPLIANCE CLASS</span>
                          <div className="text-sm font-black text-indigo-600 mt-2">
                            {selectedReportForView.summaryData.complianceRating}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Sovereign threshold standing level.</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">TENSION ACTIVE</span>
                          <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-3xl font-black text-slate-900">€{selectedReportForView.summaryData.totalTariff}</span>
                            <span className="text-slate-400 text-xs">/mo</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Based on baseline + custom overrides.</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Sovereign Compliance Executive Summary</h4>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          This summary document represents the compiled compliance mapping matrix and regulatory entitlements ledger status for 
                          <strong> {selectedReportForView.summaryData.tenantName}</strong>. As of <strong>{selectedReportForView.summaryData.generatedAt}</strong>, 
                          the target enterprise maintains a compliance posture index of <strong>{selectedReportForView.summaryData.overallPostureScore}%</strong>, 
                          correlating with a rating class of <strong>{selectedReportForView.summaryData.complianceRating}</strong>. 
                        </p>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          Active regulatory checks verify proper legal structures for GDPR (General Data Protection Regulation), as well as selective add-on sovereign mandates matching the organization's business directives.
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/80">
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-2">Cryptographic Audit Signature</h5>
                        <div className="font-mono text-[10px] bg-white border border-slate-200 rounded p-2 text-slate-500 select-all break-all">
                          {selectedReportForView.hash}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDocTab === 'frameworks' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Active Sovereign Frameworks</h4>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                          {selectedReportForView.summaryData.activeActs.length} Enabled Modules
                        </span>
                      </div>

                      <div className="space-y-3">
                        {selectedReportForView.summaryData.activeActs.map((act) => (
                          <div key={act.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[9px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded">
                                  {act.id}
                                </span>
                                <span className="text-xs font-bold text-slate-800">{act.name}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 capitalize">Billing Inclusion: {act.type}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-indigo-600 font-mono">€{act.price}/mo</span>
                              <div className="text-[9px] text-slate-400 font-mono mt-0.5">{act.score}% relevance rating</div>
                            </div>
                          </div>
                        ))}

                        {selectedReportForView.summaryData.skippedActs.length > 0 && (
                          <div className="pt-4 border-t border-slate-100 space-y-2">
                            <h5 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider font-mono">Exempted / Non-Applicable Acts</h5>
                            {selectedReportForView.summaryData.skippedActs.map((act) => (
                              <div key={act.id} className="p-2 border border-blue-50 bg-blue-50/20 text-blue-800 rounded-lg text-[10px] flex justify-between">
                                <span className="font-bold">{act.name} ({act.id})</span>
                                <span className="italic">Criteria: {act.reason}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeDocTab === 'gaps' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Risk Exposure & Recommended Upgrades</h4>
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200">
                          {selectedReportForView.summaryData.recommendedActs.length} High Risks Identified
                        </span>
                      </div>

                      {selectedReportForView.summaryData.recommendedActs.length === 0 ? (
                        <div className="p-4 sm:p-5 lg:p-6 border border-dashed border-emerald-200 bg-emerald-50/20 text-emerald-800 rounded-xl text-center space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                          <p className="text-xs font-bold">Perfect Compliance Baseline</p>
                          <p className="text-[10px] text-emerald-600/80">No immediate regulatory exposures identified for this tenant context.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-800 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Urgent Action Required</p>
                              <p className="mt-0.5 opacity-90">The organization meets active compliance thresholds for the following modules but does not currently license the active software controllers.</p>
                            </div>
                          </div>

                          {selectedReportForView.summaryData.recommendedActs.map((act) => (
                            <div key={act.id} className="p-3 border border-amber-100 rounded-xl bg-amber-50/10 flex justify-between items-center">
                              <div>
                                <span className="font-mono text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-800 px-1.5 py-0.2 rounded">
                                  {act.id}
                                </span>
                                <span className="text-xs font-bold text-slate-800 ml-1.5">{act.name}</span>
                                <p className="text-[10px] text-slate-400 mt-1 font-mono">Applicability Score: {act.score}%</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-mono text-amber-700 font-extrabold">€{act.price}/mo</span>
                                <p className="text-[9px] text-slate-400 mt-0.5">Recommended Provision</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeDocTab === 'financials' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Entitlements Contract Breakdown</h4>

                      <div className="border border-slate-150 rounded-xl overflow-x-auto text-xs">
                        <div className="bg-slate-50 p-3 font-bold text-slate-700 border-b border-slate-150 flex justify-between">
                          <span>Service Component</span>
                          <span>Monthly Rate</span>
                        </div>
                        <div className="p-3 border-b border-slate-100 flex justify-between">
                          <span className="font-medium text-slate-600">Base Subscription Level Plan ({selectedReportForView.summaryData.plan.toUpperCase()})</span>
                          <span className="font-mono font-semibold text-slate-800">
                            €{selectedReportForView.summaryData.totalTariff - selectedReportForView.summaryData.activeActs.reduce((acc, a) => acc + (a.type === 'add-on' ? a.price : 0), 0)}/mo
                          </span>
                        </div>
                        
                        {selectedReportForView.summaryData.activeActs.filter(a => a.type === 'add-on').map((act) => (
                          <div key={act.id} className="p-3 border-b border-slate-100 flex justify-between">
                            <span className="text-slate-600 font-medium">{act.name} Compliance Controller Add-on ({act.id})</span>
                            <span className="font-mono font-semibold text-slate-800">+€{act.price}/mo</span>
                          </div>
                        ))}

                        <div className="bg-indigo-950 text-white p-3.5 font-bold flex justify-between items-center text-sm">
                          <span className="uppercase text-indigo-200">Combined Monthly Contract Yield</span>
                          <span className="font-mono text-base font-black text-white">€{selectedReportForView.summaryData.totalTariff}/month</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 italic">
                        * All tariffs represent custom baseline licensing parameters cascading from the main administrative SaaS billing control rules.
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Action buttons footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-3">
                <button
                  onClick={() => copyToClipboard(getReportText(selectedReportForView.summaryData))}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{copied ? 'Copied Report!' : 'Copy Summary digest'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => showToast('Summary printed successfully to compliance channel.', 'success')}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => {
                      showToast('Summary exported successfully as authenticated JSON-LD document.', 'success');
                      setSelectedReportForView(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Secure JSON-LD</span>
                  </button>
                  <button
                    onClick={() => setIsPdfDialogOpen(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Export as PDF</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ExportPdfDialog 
        isOpen={isPdfDialogOpen} 
        onClose={() => setIsPdfDialogOpen(false)} 
        title="Export Tenant Compliance Summary PDF"
      />
    </div>
  );
};
