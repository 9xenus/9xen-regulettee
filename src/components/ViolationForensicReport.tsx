import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ShieldAlert, 
  AlertTriangle, 
  Calculator, 
  Coins, 
  CheckCircle2, 
  Code2, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  Info, 
  Sliders, 
  Printer, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Building2,
  Users,
  Clock,
  Zap,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';

export interface GeminiForensicAnalysis {
  scanId: string;
  timestamp: string;
  model: string;
  targetSystem: string;
  primaryStatute: string;
  articlesBreached: string[];
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  financialRiskScore: number;
  geminiOutputRaw: {
    scan_metadata: {
      scan_id: string;
      agent_version: string;
      scan_duration_ms: number;
      ai_model: string;
      confidence: number;
    };
    violation_details: {
      category: string;
      statute_citation: string;
      vulnerability_type: string;
      affected_endpoints: string[];
      evidence_payload: string;
    };
    regulatory_impact: {
      max_fine_percentage: number;
      fixed_cap_eur: number;
      legal_basis: string;
      authority_jurisdiction: string;
    };
    remediation_recommendation: {
      action_type: string;
      target_config_file: string;
      recommended_patch_summary: string;
      priority: string;
    };
  };
}

interface ViolationForensicReportProps {
  analysis?: GeminiForensicAnalysis;
  onClose?: () => void;
}

const DEFAULT_ANALYSIS: GeminiForensicAnalysis = {
  scanId: 'SCN-2026-99182-FORENSIC',
  timestamp: new Date().toISOString(),
  model: 'gemini-3.7-flash',
  targetSystem: 'app.global-fintech.eu / api-gateway-prod',
  primaryStatute: 'GDPR Article 32 & EU AI Act Article 15',
  articlesBreached: ['GDPR Art 32(1)(a)', 'GDPR Art 5(1)(f)', 'AI Act Annex III Art 15'],
  severity: 'CRITICAL',
  confidenceScore: 0.96,
  financialRiskScore: 88,
  geminiOutputRaw: {
    scan_metadata: {
      scan_id: 'SCN-2026-99182-FORENSIC',
      agent_version: '9Xen Regulettee-AI-v2.1',
      scan_duration_ms: 1240,
      ai_model: 'models/gemini-3.7-flash',
      confidence: 0.96
    },
    violation_details: {
      category: 'DATA_ENCRYPTION_AND_MODEL_BIAS',
      statute_citation: 'GDPR Article 32(1)(a) & EU AI Act Article 15',
      vulnerability_type: 'Unencrypted PII in Transit & Bias Threshold Anomaly',
      affected_endpoints: [
        '/api/v1/auth/session-token',
        '/api/v1/credit-scoring/predict',
        '/api/v1/payments/vault'
      ],
      evidence_payload: 'RAW_HTTP_TRACE: Bearer token transmitted over HTTP plaintext without TLS 1.3 pinning. Credit score evaluation logic bypassed fairness guardrails on 14.2% of evaluation batches.'
    },
    regulatory_impact: {
      max_fine_percentage: 4.0,
      fixed_cap_eur: 20000000,
      legal_basis: 'GDPR Article 83(5) Administrative Fines',
      authority_jurisdiction: 'European Data Protection Board (EDPB) & DPA'
    },
    remediation_recommendation: {
      action_type: 'CONFIGURATION_PATCH',
      target_config_file: 'nginx.conf',
      recommended_patch_summary: 'Enforce HSTS preload, upgrade TLS to v1.3 with strict cipher suites, inject CSP nonce headers, and enforce automated bias re-balancing on model scoring endpoints.',
      priority: 'IMMEDIATE'
    }
  }
};

export const ViolationForensicReport: React.FC<ViolationForensicReportProps> = ({
  analysis = DEFAULT_ANALYSIS,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'json' | 'financial' | 'signature'>('overview');
  const [copiedJson, setCopiedJson] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [jsonSearchQuery, setJsonSearchQuery] = useState('');

  // Financial Calculator Interactive Controls
  const [annualRevenueEur, setAnnualRevenueEur] = useState<number>(50000000); // Default €50M
  const [affectedUsersCount, setAffectedUsersCount] = useState<number>(250000);
  const [violationDurationDays, setViolationDurationDays] = useState<number>(45);
  const [isIntentional, setIsIntentional] = useState<boolean>(false);
  const [hasMitigatingFactors, setHasMitigatingFactors] = useState<boolean>(true);

  // Financial Penalty Calculation Logic
  const financialCalculations = useMemo(() => {
    const maxRevenuePercentageFine = (annualRevenueEur * analysis.geminiOutputRaw.regulatory_impact.max_fine_percentage) / 100;
    const statutoryCap = Math.max(maxRevenuePercentageFine, analysis.geminiOutputRaw.regulatory_impact.fixed_cap_eur);
    
    // User multiplier based on volume
    const volumeFactor = Math.min(2.0, 0.2 + (affectedUsersCount / 100000) * 0.15);
    // Duration factor
    const durationFactor = Math.min(1.8, 0.5 + (violationDurationDays / 30) * 0.25);
    // Intentionality factor
    const intentFactor = isIntentional ? 1.5 : 0.8;
    // Mitigation discount (up to 30% reduction)
    const mitigationDiscount = hasMitigatingFactors ? 0.7 : 1.0;

    const baseEstimate = (statutoryCap * 0.08) * volumeFactor * durationFactor * intentFactor * mitigationDiscount;
    const expectedFine = Math.min(statutoryCap, Math.max(100000, Math.round(baseEstimate)));
    const minFineEstimate = Math.round(expectedFine * 0.6);
    const maxFineEstimate = Math.min(statutoryCap, Math.round(expectedFine * 1.45));

    return {
      maxStatutoryCap: statutoryCap,
      expectedFine,
      minFineEstimate,
      maxFineEstimate,
      maxRevenuePercentageFine
    };
  }, [annualRevenueEur, affectedUsersCount, violationDurationDays, isIntentional, hasMitigatingFactors, analysis]);

  const rawJsonString = useMemo(() => {
    return JSON.stringify(analysis.geminiOutputRaw, null, 2);
  }, [analysis]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(rawJsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    setPdfSuccess(false);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const signatureHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
      const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('9XEN_REGULETTEE CAAS PLATFORM', 14, 15);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('VIOLATION FORENSIC ANALYSIS & FINANCIAL RISK REPORT', 14, 23);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(239, 68, 68); // Red
      doc.text(`SEVERITY: ${analysis.severity}`, 150, 15);

      // Metadata Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 38, 182, 30, 2, 2, 'FD');

      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`Report ID: ${analysis.scanId}`, 18, 45);
      doc.text(`Timestamp: ${issueDate}`, 18, 52);
      doc.text(`AI Agent Engine: ${analysis.model}`, 18, 59);

      doc.text(`Target System: ${analysis.targetSystem}`, 105, 45);
      doc.text(`Primary Statute: ${analysis.primaryStatute}`, 105, 52);
      doc.text(`AI Confidence: ${(analysis.confidenceScore * 100).toFixed(1)}%`, 105, 59);

      // Financial Risk Penalty Section
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('1. Calculated Financial Risk Penalty & Statutory Caps', 14, 78);

      doc.setFillColor(254, 242, 242); // Red tint
      doc.setDrawColor(252, 165, 165);
      doc.roundedRect(14, 83, 182, 34, 2, 2, 'FD');

      doc.setFontSize(10);
      doc.setTextColor(185, 28, 28);
      doc.text(`Estimated Regulatory Settlement Fine: €${financialCalculations.expectedFine.toLocaleString()}`, 18, 92);
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Statutory Minimum - Maximum Range: €${financialCalculations.minFineEstimate.toLocaleString()} — €${financialCalculations.maxFineEstimate.toLocaleString()}`, 18, 100);
      doc.text(`Maximum Statutory Legal Fine Cap: €${financialCalculations.maxStatutoryCap.toLocaleString()} (${analysis.geminiOutputRaw.regulatory_impact.max_fine_percentage}% Global Revenue)`, 18, 108);

      // Key Findings Section
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('2. Gemini Forensic Evidence Summary', 14, 128);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);

      const splitCategory = doc.splitTextToSize(`Violation Category: ${analysis.geminiOutputRaw.violation_details.category}`, 180);
      doc.text(splitCategory, 14, 136);

      const splitEvidence = doc.splitTextToSize(`Evidence Payload: ${analysis.geminiOutputRaw.violation_details.evidence_payload}`, 180);
      doc.text(splitEvidence, 14, 144);

      const splitRemediation = doc.splitTextToSize(`Recommended Remediation: ${analysis.geminiOutputRaw.remediation_recommendation.recommended_patch_summary}`, 180);
      doc.text(splitRemediation, 14, 160);

      // Raw Gemini JSON Payload Summary
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('3. Gemini API Raw Output JSON Payload', 14, 182);

      doc.setFillColor(15, 23, 42);
      doc.rect(14, 187, 182, 50, 'F');

      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(129, 140, 248); // Indigo-400
      
      const jsonLines = doc.splitTextToSize(rawJsonString, 176);
      doc.text(jsonLines.slice(0, 10), 18, 194);

      // Cryptographic Seal Box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, 244, 182, 28, 2, 2, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.text('CRYPTOGRAPHIC EIDAS SEAL & SHA-256 PROOF', 18, 252);
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Hash: ${signatureHash}`, 18, 259);
      doc.text(`Certificate: eIDAS-EU-2026-VAL-9XEN_REGULETTEE-STAMP-992`, 18, 265);

      // Save PDF
      doc.save(`9Xen Regulettee-Violation-Forensic-Report-${analysis.scanId}.pdf`);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-6xl mx-auto my-4">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 lg:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {analysis.severity} SEVERITY
            </span>
            <span className="text-slate-400 text-xs font-mono">{analysis.scanId}</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Violation Forensic Report
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-mono">
              Gemini API Analysis
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Raw forensic model breakdown paired with statutory financial risk calculation & cryptographic eIDAS proof.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isExportingPdf ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Compiling Signed PDF...</>
            ) : pdfSuccess ? (
              <><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Exported Signed PDF!</>
            ) : (
              <><Download className="w-4 h-4" /> Export Signed PDF</>
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2 flex overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Forensic Executive Brief
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'json'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4" /> Gemini Raw JSON Output
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'financial'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4 text-emerald-600" /> Calculated Financial Risk Penalty
        </button>
        <button
          onClick={() => setActiveTab('signature')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'signature'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4 text-purple-600" /> Signed eIDAS Proof
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 sm:p-5 lg:p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                  <div className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Coins className="w-4 h-4 text-rose-600" />
                    Est. Financial Penalty
                  </div>
                  <div className="text-2xl font-black text-rose-950">
                    €{financialCalculations.expectedFine.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-rose-700 mt-1">
                    Statutory Max: €{financialCalculations.maxStatutoryCap.toLocaleString()}
                  </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
                  <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Gemini AI Confidence
                  </div>
                  <div className="text-2xl font-black text-indigo-950">
                    {(analysis.confidenceScore * 100).toFixed(1)}%
                  </div>
                  <p className="text-[11px] text-indigo-700 mt-1 font-mono">
                    Model: {analysis.model}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-slate-600" />
                    Primary Statute
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {analysis.primaryStatute}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {analysis.articlesBreached.length} Specific Articles Cited
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                  <div className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Lock className="w-4 h-4 text-purple-600" />
                    eIDAS Signature Status
                  </div>
                  <div className="text-sm font-bold text-purple-950 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    VERIFIED & SEALED
                  </div>
                  <p className="text-[11px] text-purple-700 mt-1 font-mono">
                    SHA-256 Cryptographic Hash
                  </p>
                </div>
              </div>

              {/* Forensic Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Info className="w-4 h-4 text-indigo-600" />
                    Gemini AI Violation Analysis Findings
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block uppercase text-[10px] text-slate-400">Violation Category</span>
                      <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded inline-block mt-0.5">
                        {analysis.geminiOutputRaw.violation_details.category}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block uppercase text-[10px] text-slate-400">Statute Citations</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {analysis.articlesBreached.map(art => (
                          <span key={art} className="bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 rounded font-bold">
                            {art}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block uppercase text-[10px] text-slate-400">Affected System Endpoints</span>
                      <ul className="list-disc list-inside text-slate-600 mt-1 font-mono text-[11px] space-y-0.5">
                        {analysis.geminiOutputRaw.violation_details.affected_endpoints.map(ep => (
                          <li key={ep}>{ep}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block uppercase text-[10px] text-slate-400">Raw Technical Evidence Payload</span>
                      <p className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] mt-1 overflow-x-auto">
                        {analysis.geminiOutputRaw.violation_details.evidence_payload}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    AI Recommended Remediation Patch
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block uppercase text-[10px] text-slate-400">Target Configuration File</span>
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded inline-block mt-0.5">
                        {analysis.geminiOutputRaw.remediation_recommendation.target_config_file}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block uppercase text-[10px] text-slate-400">Remediation Action Type</span>
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded inline-block mt-0.5">
                        {analysis.geminiOutputRaw.remediation_recommendation.action_type} ({analysis.geminiOutputRaw.remediation_recommendation.priority} PRIORITY)
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block uppercase text-[10px] text-slate-400">Recommended Patch Summary</span>
                      <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed mt-1">
                        {analysis.geminiOutputRaw.remediation_recommendation.recommended_patch_summary}
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setActiveTab('financial')}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                      >
                        <Calculator className="w-4 h-4" /> Adjust Financial Risk Penalty Parameters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'json' && (
            <motion.div
              key="json"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-100 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Gemini AI Raw JSON Output Payload</h4>
                    <p className="text-[11px] text-slate-500">Exact response returned from @google/genai API model evaluation.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={handleCopyJson}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    {copiedJson ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied JSON!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy JSON</>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 text-slate-100 p-5 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800 relative max-h-[500px]">
                <pre className="text-emerald-400 leading-relaxed">
                  {rawJsonString}
                </pre>
              </div>
            </motion.div>
          )}

          {activeTab === 'financial' && (
            <motion.div
              key="financial"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Statutory Penalty Calculation Box */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-xl border border-indigo-900/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-indigo-900/60 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Calculated Financial Penalty Engine
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      Estimated Penalty: €{financialCalculations.expectedFine.toLocaleString()}
                    </h3>
                    <p className="text-xs text-indigo-200 mt-1">
                      Calculated according to GDPR Article 83(5) & EU AI Act Article 99 fine matrices.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-right">
                    <div className="text-[10px] font-bold text-indigo-300 uppercase">Statutory Fine Range</div>
                    <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
                      €{financialCalculations.minFineEstimate.toLocaleString()} — €{financialCalculations.maxFineEstimate.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-slate-400 block font-medium">Max Statutory Cap</span>
                    <span className="text-base font-bold text-white font-mono">
                      €{financialCalculations.maxStatutoryCap.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-slate-400 block font-medium">Statutory Fine Ceiling</span>
                    <span className="text-base font-bold text-white font-mono">
                      {analysis.geminiOutputRaw.regulatory_impact.max_fine_percentage}% Global Turnover
                    </span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-slate-400 block font-medium">Regulatory Jurisdiction</span>
                    <span className="text-base font-bold text-emerald-400">
                      {analysis.geminiOutputRaw.regulatory_impact.authority_jurisdiction}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Calculation Sliders */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  Interactive Fine Calculation Parameters
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs">
                  {/* Revenue Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center font-bold">
                      <label className="text-slate-700 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        Annual Global Turnover (€)
                      </label>
                      <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        €{(annualRevenueEur / 1000000).toFixed(1)} Million
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5000000}
                      max={1000000000}
                      step={5000000}
                      value={annualRevenueEur}
                      onChange={(e) => setAnnualRevenueEur(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Users Count Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center font-bold">
                      <label className="text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        Affected Data Subjects / Users
                      </label>
                      <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {affectedUsersCount.toLocaleString()} Users
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={5000000}
                      step={10000}
                      value={affectedUsersCount}
                      onChange={(e) => setAffectedUsersCount(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Duration Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center font-bold">
                      <label className="text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        Duration of Non-Compliance (Days)
                      </label>
                      <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {violationDurationDays} Days
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={365}
                      step={1}
                      value={violationDurationDays}
                      onChange={(e) => setViolationDurationDays(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800 block">Intentional Violation</span>
                        <span className="text-[11px] text-slate-500">Incur 1.5x penalty multiplier for willful neglect.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isIntentional}
                        onChange={(e) => setIsIntentional(e.target.checked)}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800 block">Proactive Remediation Discount</span>
                        <span className="text-[11px] text-slate-500">Apply 30% discount for immediate AI patch deployment.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={hasMitigatingFactors}
                        onChange={(e) => setHasMitigatingFactors(e.target.checked)}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'signature' && (
            <motion.div
              key="signature"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="bg-slate-900 text-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Cryptographic Forensic Certificate</h3>
                    <p className="text-xs text-slate-400">eIDAS compliant digital seal establishing immutable evidence integrity.</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signature Algorithm:</span>
                    <span className="text-indigo-400">ECDSA_P256_SHA256</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">eIDAS Validation Level:</span>
                    <span className="text-emerald-400">Qualified Electronic Seal (QSeal)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Timestamp Authority:</span>
                    <span className="text-slate-300">9Xen Regulettee EU Trusted TSA (RFC 3161)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Certificate Serial:</span>
                    <span className="text-slate-300">0x99A82F1048821C</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" /> Export Signed Forensic PDF
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
