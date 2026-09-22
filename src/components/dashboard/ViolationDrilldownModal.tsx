import React, { useState } from 'react';
import { X, Sparkles, ShieldAlert, FileText, CheckCircle2, Download, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ViolationLog {
  id: string;
  time?: string;
  actor?: string;
  action?: string;
  target?: string;
  severity?: string;
  hash?: string;
  details?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  violation: ViolationLog | null;
}

export const ViolationDrilldownModal: React.FC<Props> = ({ isOpen, onClose, violation }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  if (!isOpen || !violation) return null;

  const handleRunAiAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        framework: violation.action?.includes('Data') ? 'GDPR Article 32 & 35 (Security of Processing / DPIA)' : 'DORA & NIS2 Incident Response Standards',
        riskLevel: violation.severity?.toUpperCase() || 'CRITICAL',
        summary: `AI Regulatory Narrative Engine has analyzed action '${violation.action}' performed by '${violation.actor || 'System Actor'}' targeting '${violation.target || 'Protected Asset'}'. This event triggers mandatory audit logging and potential regulatory notification protocols.`,
        citations: [
          'GDPR Art. 33: Notification of a personal data breach to the supervisory authority within 72 hours.',
          'NIS2 Directive (EU) 2022/2555: Essential entity incident reporting compliance.',
          'ISO/IEC 27001 Annex A.16: Information security incident management.'
        ],
        remediationSteps: [
          'Step 1: Immediately quarantine the source IP / IAM session token associated with actor ' + (violation.actor || 'unknown'),
          'Step 2: Generate Cryptographic Ledger Proof hash: ' + (violation.hash || '0xA718...'),
          'Step 3: Execute automated policy enforcement via CaaS Compliance Gateway to revoke unauthorized privileges.',
          'Step 4: Deposit sealed compliance report into the National Competent Authority (AP/EDPB) portal.'
        ]
      });
    }, 1200);
  };

  const handleExportNarrativePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text("AI Regulatory Narrative & Remediation Report", 14, 20);

      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text(`Violation ID: ${violation.id}`, 14, 30);
      doc.text(`Timestamp: ${violation.time || new Date().toISOString()}`, 14, 36);
      doc.text(`Actor: ${violation.actor || 'N/A'}`, 14, 42);
      doc.text(`Action: ${violation.action || 'N/A'}`, 14, 48);
      doc.text(`Target: ${violation.target || 'N/A'}`, 14, 54);

      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("Regulatory Impact & AI Analysis", 14, 70);

      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const summaryText = analysisResult?.summary || "No analysis generated yet.";
      const splitSummary = doc.splitTextToSize(summaryText, 180);
      doc.text(splitSummary, 14, 78);

      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("Context-Aware Remediation Steps", 14, 110);

      let yPos = 118;
      (analysisResult?.remediationSteps || [
        'Review actor privileges.',
        'Apply cryptographic verification.',
        'Log incident in immutable ledger.'
      ]).forEach((step: string, idx: number) => {
        const splitStep = doc.splitTextToSize(`${idx + 1}. ${step}`, 180);
        doc.text(splitStep, 14, yPos);
        yPos += splitStep.length * 6 + 4;
      });

      doc.save(`Violation_Remediation_${violation.id}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-700">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Violation Deep-Dive Drill-Down</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {violation.id} | Severity: {violation.severity || 'Normal'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 lg:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
          {/* Violation Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Timestamp (UTC)</span>
              <p className="text-sm font-mono text-slate-800 mt-0.5">{violation.time ? new Date(violation.time).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actor / User</span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{violation.actor || 'N/A'}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action Flag</span>
              <p className="text-sm font-bold text-indigo-700 mt-0.5">{violation.action || 'N/A'}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Resource</span>
              <p className="text-sm text-slate-800 truncate mt-0.5" title={violation.target || ''}>{violation.target || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cryptographic KMS Hash</span>
              <p className="text-xs font-mono text-slate-600 bg-white p-2 rounded border border-slate-200 mt-0.5 break-all">{violation.hash || '0x...'}</p>
            </div>
          </div>

          {/* AI Regulatory Narrative Generator Trigger Section */}
          {!analysisResult && !isAnalyzing && (
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-4 sm:p-5 lg:p-6 text-white text-center space-y-4 shadow-sm">
              <div className="inline-flex p-3 bg-indigo-800/60 rounded-xl border border-indigo-700/50 text-indigo-300">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold">Run AI Regulatory Narrative Analysis</h3>
                <p className="text-xs text-indigo-200 mt-1 max-w-md mx-auto">
                  Engage the RegulatoryNarrativeGenerator AI engine to parse compliance failure vectors, map EU/US regulatory frameworks, and auto-generate context-aware remediation steps.
                </p>
              </div>
              <button
                onClick={handleRunAiAnalysis}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Start Deep-Dive Analysis
              </button>
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <div className="py-12 text-center space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="text-sm font-medium text-slate-600">Synthesizing Regulatory Narrative & Remediation steps...</p>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
              <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md">
                    {analysisResult.framework}
                  </span>
                  <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Risk Score: {analysisResult.riskLevel}
                  </span>
                </div>
                <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Citations */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" /> Regulatory Citations & Mandates
                </h4>
                <ul className="space-y-2">
                  {analysisResult.citations.map((cite: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-indigo-600">[{idx + 1}]</span>
                      <span>{cite}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Remediation Steps */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Actionable Context-Aware Remediation Plan
                </h4>
                <div className="space-y-2.5">
                  {analysisResult.remediationSteps.map((step: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                      <div className="p-1 bg-emerald-100 text-emerald-700 rounded-full mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs text-slate-800 font-medium leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close
          </button>
          {analysisResult && (
            <button
              onClick={handleExportNarrativePDF}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export Remediation Report (PDF)
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
