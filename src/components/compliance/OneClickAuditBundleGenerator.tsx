import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Download,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Key,
  Database,
  Terminal,
  Activity,
  Send,
  RefreshCw,
  Copy,
  Check,
  FileSpreadsheet,
  FileJson,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Clock,
  Building2,
  Search,
  Globe,
  SlidersHorizontal,
  Printer,
  CheckCheck,
  Award
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';
import { SignedAuditBundle, RegulatoryFilingReceipt, AuditSystemLog, ErrorTelemetryItem, ComplianceStatusIndicator } from '../../engine/audit-bundle-engine';
import { deriveAiRemediationAction } from '../../utils/logAnalyzer';
import { useNotification } from '../../context/NotificationContext';

interface OneClickAuditBundleGeneratorProps {
  tenantId?: string;
  tenantName?: string;
  onFilingComplete?: (receipt: RegulatoryFilingReceipt) => void;
}

export const OneClickAuditBundleGenerator: React.FC<OneClickAuditBundleGeneratorProps> = ({
  tenantId = 'tenant_sovereign_corp',
  tenantName = 'Nonaxen Sovereign Corp',
  onFilingComplete
}) => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'proof' | 'logs' | 'telemetry' | 'indicators' | 'filing' | 'verify'>('proof');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [bundleData, setBundleData] = useState<SignedAuditBundle | null>(null);
  const [jsonString, setJsonString] = useState<string>('');
  const [csvString, setCsvString] = useState<string>('');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Regulatory Filing State
  const [selectedRegulator, setSelectedRegulator] = useState<string>('EDPB');
  const [docketRef, setDocketRef] = useState<string>('');
  const [isFiling, setIsFiling] = useState(false);
  const [filingReceipt, setFilingReceipt] = useState<RegulatoryFilingReceipt | null>(null);

  // Log Search & Filter
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Independent Verification State
  const [verifyInputJson, setVerifyInputJson] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Load initial bundle
  useEffect(() => {
    handleGenerateBundle(false);
  }, [tenantId, tenantName]);

  const handleGenerateBundle = async (animate: boolean = true) => {
    if (animate) {
      setIsGenerating(true);
      setGenerationStep('Harvesting immutable system audit trail...');
      await new Promise(r => setTimeout(r, 450));
      setGenerationStep('Aggregating runtime error telemetry & APM traces...');
      await new Promise(r => setTimeout(r, 450));
      setGenerationStep('Synthesizing multi-jurisdiction compliance scorecards...');
      await new Promise(r => setTimeout(r, 450));
      setGenerationStep('Computing canonical SHA-256 Merkle root...');
      await new Promise(r => setTimeout(r, 400));
      setGenerationStep('Applying RSA-2048 & RFC 3161 Time-Stamp Authority Signature...');
      await new Promise(r => setTimeout(r, 400));
    }

    try {
      const res = await fetchWithRetry('/api/v1/reporting/audit-bundle/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, tenantName })
      });
      const data = await res.json();
      if (data.success && data.bundle) {
        setBundleData(data.bundle);
        setJsonString(data.jsonContent || JSON.stringify(data.bundle, null, 2));
        setCsvString(data.csvBundleContent || '');
        setVerifyInputJson(JSON.stringify(data.bundle, null, 2));
      }
    } catch (err: any) {
      console.error('Failed to generate audit bundle:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleDownloadJson = () => {
    if (!bundleData) return;
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_bundle_${bundleData.bundleId}_signed.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    if (!csvString) return;
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_bundle_${bundleData?.bundleId || 'export'}_multi_table.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCert = () => {
    if (!bundleData) return;
    const certContent = `-----BEGIN PUBLIC KEY CERTIFICATE-----
Signer Authority: ${bundleData.cryptographicProof.signerEntity}
Key Fingerprint (SHA-256): ${bundleData.cryptographicProof.keyFingerprint}
Algorithm: ${bundleData.cryptographicProof.algorithm}
TSA Authority: ${bundleData.cryptographicProof.tsaAuthority}
Timestamp Token: ${bundleData.cryptographicProof.rfc3161TimestampToken}
Merkle Root Hash: ${bundleData.cryptographicProof.merkleRootHash}

${bundleData.cryptographicProof.publicKeyPem}
-----END PUBLIC KEY CERTIFICATE-----`;
    const blob = new Blob([certContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification_cert_${bundleData.bundleId}.pem`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleFileToRegulator = async () => {
    if (!bundleData) return;
    setIsFiling(true);
    try {
      const res = await fetchWithRetry('/api/v1/reporting/audit-bundle/file-regulatory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleId: bundleData.bundleId,
          regulatorCode: selectedRegulator,
          docketReference: docketRef || undefined
        })
      });
      const data = await res.json();
      if (data.success && data.receipt) {
        setFilingReceipt(data.receipt);
        if (onFilingComplete) onFilingComplete(data.receipt);
      }
    } catch (err: any) {
      showToast(`Filing error: ${err.message}`, 'error');
    } finally {
      setIsFiling(false);
    }
  };

  const handleVerifyJson = async () => {
    setIsVerifying(true);
    try {
      const parsed = JSON.parse(verifyInputJson);
      const res = await fetchWithRetry('/api/v1/reporting/audit-bundle/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundle: parsed })
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (err: any) {
      setVerificationResult({
        isValid: false,
        verificationDetails: `JSON Parsing / Verification Error: ${err.message}`
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!bundleData) return [];
    return bundleData.systemLogs.filter(log => {
      const matchesSearch =
        searchLogQuery === '' ||
        log.action.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
        log.targetResource.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
        log.actor.name.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
        log.framework.toLowerCase().includes(searchLogQuery.toLowerCase());
      const matchesCategory = filterCategory === 'ALL' || log.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [bundleData, searchLogQuery, filterCategory]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header & One-Click Trigger Banner */}
      <div className="p-5 sm:p-6 lg:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Statutory Regulatory Filing Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                eIDAS & RFC 3161 Compliant
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              One-Click Cryptographic Audit Bundle Generator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Packages immutable system audit logs, error telemetry traces, and multi-framework compliance indicators into a cryptographically signed, tamper-evident JSON/CSV bundle with third-party verification proofs.
            </p>
          </div>

          {/* Action CTA Box */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleGenerateBundle(true)}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer border-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Packaging Bundle...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Generate Signed Audit Bundle</span>
                </>
              )}
            </button>

            {bundleData && (
              <>
                <button
                  onClick={handleDownloadJson}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download Cryptographically Signed JSON"
                >
                  <FileJson className="w-4 h-4 text-amber-400" />
                  <span>Download JSON</span>
                </button>
                <button
                  onClick={handleDownloadCsv}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download Multi-Table CSV Bundle"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Download CSV</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Generation Progress Indicator */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center gap-3"
            >
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
              <div className="text-xs font-mono text-indigo-200">
                <span className="text-indigo-400 font-bold">STAGE: </span>
                {generationStep}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Bundle Quick Stats Ribbon */}
        {bundleData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 mt-5 pt-5 border-t border-slate-800/80">
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Posture</div>
              <div className="text-lg font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                {bundleData.summary.overallPostureScore}%
                <span className="text-[10px] font-semibold text-slate-400">(Grade A+)</span>
              </div>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Logs</div>
              <div className="text-lg font-black text-white mt-0.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                {bundleData.summary.totalSystemLogs} Entries
              </div>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Error Telemetry</div>
              <div className="text-lg font-black text-amber-400 mt-0.5 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-400" />
                {bundleData.summary.totalErrorTelemetry} Traces
              </div>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frameworks Audited</div>
              <div className="text-lg font-black text-cyan-400 mt-0.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-400" />
                {bundleData.summary.totalComplianceIndicators} Frameworks
              </div>
            </div>
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Merkle Tree Root</div>
              <div className="text-[11px] font-mono text-indigo-300 truncate mt-1" title={bundleData.cryptographicProof.merkleRootHash}>
                {bundleData.cryptographicProof.merkleRootHash.slice(0, 16)}...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="px-5 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
        <button
          onClick={() => setActiveTab('proof')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border-0 cursor-pointer whitespace-nowrap ${
            activeTab === 'proof' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Cryptographic Proof & Hashes</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border-0 cursor-pointer whitespace-nowrap ${
            activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>System Audit Logs ({bundleData?.systemLogs.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border-0 cursor-pointer whitespace-nowrap ${
            activeTab === 'telemetry' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Error Telemetry & APM ({bundleData?.errorTelemetry.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('indicators')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border-0 cursor-pointer whitespace-nowrap ${
            activeTab === 'indicators' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Compliance Indicators ({bundleData?.complianceIndicators.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('filing')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border-0 cursor-pointer whitespace-nowrap ${
            activeTab === 'filing' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-emerald-400" />
          <span>External Regulatory Filing</span>
        </button>

        <button
          onClick={() => setActiveTab('verify')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border-0 cursor-pointer whitespace-nowrap ${
            activeTab === 'verify' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>Independent Verifier</span>
        </button>
      </div>

      {/* Main Tab Content View */}
      <div className="p-5 sm:p-6 lg:p-8">
        {/* TAB 1: Cryptographic Proof & Merkle Tree */}
        {activeTab === 'proof' && bundleData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Proof Badges & Cryptographic Metadata */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Digital Signature & Tamper-Evident Envelope
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Bundle ID & Timestamp</span>
                      <span className="font-mono text-slate-200 font-bold">{bundleData.bundleId}</span>
                      <span className="text-slate-400 ml-2">({new Date(bundleData.generatedAt).toLocaleString()})</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Canonical Merkle Root Hash (SHA-256)</span>
                      <div className="mt-1 p-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-indigo-300 break-all flex items-center justify-between gap-2">
                        <span>{bundleData.cryptographicProof.merkleRootHash}</span>
                        <button
                          onClick={() => handleCopy(bundleData.cryptographicProof.merkleRootHash, 'merkle')}
                          className="p-1 text-slate-400 hover:text-white cursor-pointer bg-transparent border-0"
                        >
                          {copiedFormat === 'merkle' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Signing Key Fingerprint</span>
                        <span className="font-mono text-amber-300 text-[11px]">{bundleData.cryptographicProof.keyFingerprint}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Signature Algorithm</span>
                        <span className="font-bold text-cyan-300">{bundleData.cryptographicProof.algorithm} (PKCS#1 v1.5)</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400 block text-[11px]">RFC 3161 Qualified Time-Stamp Authority (TSA) Token</span>
                      <span className="font-mono text-emerald-300 text-[11px] block mt-0.5">{bundleData.cryptographicProof.rfc3161TimestampToken}</span>
                      <span className="text-[10px] text-slate-400">{bundleData.cryptographicProof.tsaAuthority}</span>
                    </div>
                  </div>
                </div>

                {/* Digital Signature Raw Preview */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-400" />
                      Digital Signature (Base64 PKCS#8)
                    </span>
                    <button
                      onClick={() => handleCopy(bundleData.cryptographicProof.digitalSignature, 'signature')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer bg-transparent border-0"
                    >
                      {copiedFormat === 'signature' ? 'Copied' : 'Copy Signature'}
                    </button>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[10px] text-slate-400 max-h-24 overflow-y-auto break-all">
                    {bundleData.cryptographicProof.digitalSignature}
                  </div>
                </div>
              </div>

              {/* Right Column: Statutory Standards & Certificate Actions */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    Regulatory Filing Eligibility
                  </h3>
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">eIDAS Equivalence:</strong> Validated for EU Qualified Electronic Signatures (QES) regulatory filing.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Audit Standard:</strong> {bundleData.regulatoryFilingMetadata.intendedStandard}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Sovereignty Seal:</strong> {bundleData.regulatoryFilingMetadata.dataResidencySeal}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2">
                    <button
                      onClick={handleDownloadCert}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      Export Verification Certificate (.pem)
                    </button>
                    <button
                      onClick={() => setActiveTab('filing')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-0 shadow-md shadow-emerald-600/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Proceed to Regulatory Filing Gateway
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: System Audit Logs View */}
        {activeTab === 'logs' && bundleData && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs by actor, action, framework, or target resource..."
                  value={searchLogQuery}
                  onChange={e => setSearchLogQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="POLICY_ENFORCEMENT">Policy Enforcement</option>
                  <option value="SECURITY_AUTH">Security & Auth</option>
                  <option value="SYSTEM_MUTATION">System Mutation</option>
                  <option value="DATA_TRANSFER">Data Transfer</option>
                  <option value="ACCESS_CONTROL">Access Control</option>
                </select>
              </div>
            </div>

            {/* Logs Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden overflow-x-auto bg-slate-950/60">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-3">Log ID & Time</th>
                    <th className="py-3 px-3">Actor</th>
                    <th className="py-3 px-3">Category & Framework</th>
                    <th className="py-3 px-3">Action & Target</th>
                    <th className="py-3 px-3 text-center">Severity</th>
                    <th className="py-3 px-3 text-center">Outcome</th>
                    <th className="py-3 px-3">SHA-256 Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition-colors font-mono">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-white">{log.id}</div>
                        <div className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-sans">
                        <div className="font-bold text-slate-200">{log.actor.name}</div>
                        <div className="text-[10px] text-slate-400">{log.actor.role} ({log.actor.country})</div>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mr-1">
                          {log.category}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1 font-semibold">{log.framework}</div>
                      </td>
                      <td className="py-3 px-3 font-sans max-w-xs">
                        <div className="font-medium text-slate-100">{log.action}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{log.targetResource}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.severity === 'CRITICAL'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : log.severity === 'HIGH'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.outcome === 'SUCCESS'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {log.outcome}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[10px] text-slate-500 truncate max-w-[120px]" title={log.sha256Hash}>
                        {log.sha256Hash.slice(0, 12)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Error Telemetry & APM */}
        {activeTab === 'telemetry' && bundleData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bundleData.errorTelemetry.map(err => (
                <div key={err.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        HTTP {err.httpStatus}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">{err.errorType}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">{err.latencyMs}ms</span>
                  </div>

                  <p className="text-xs text-slate-300">{err.message}</p>

                  <div className="bg-slate-900 p-2 rounded-lg font-mono text-[10px] text-slate-400 border border-slate-800/80 break-all">
                    {err.stackTraceSnippet}
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-2 text-[10px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-black text-emerald-300 uppercase tracking-wider text-[9px] shrink-0">AI Remediation:</span>
                      <span className="font-semibold text-emerald-100 truncate">
                        {deriveAiRemediationAction(err.message, err.errorType, err.service)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Service: <strong className="text-slate-400">{err.service}</strong></span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                      {err.recoveryStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Compliance Status Indicators */}
        {activeTab === 'indicators' && bundleData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bundleData.complianceIndicators.map(ind => (
                <div key={ind.frameworkCode} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {ind.frameworkCode}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-2">{ind.frameworkName}</h4>
                      <span className="text-[10px] text-slate-400">{ind.jurisdiction}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-emerald-400">{ind.score}%</div>
                      <span className="text-[10px] font-bold text-emerald-400/80 uppercase">{ind.status}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Mandatory Controls Met:</span>
                      <span className="font-bold text-white">{ind.mandatoryControlsMet} / {ind.mandatoryControlsTotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Statutory Deadline:</span>
                      <span className="text-slate-300 font-semibold">{ind.statutoryDeadline}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Lead Authority:</span>
                      <span className="text-slate-300 truncate max-w-[150px]">{ind.leadRegulator}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Safeguards</span>
                    <div className="flex flex-wrap gap-1">
                      {ind.activeSafeguards.map((sf, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-slate-300 border border-slate-800">
                          {sf}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: External Regulatory Filing Gateway */}
        {activeTab === 'filing' && bundleData && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  Direct Statutory Regulatory Transmission Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Transmit the cryptographically signed audit envelope directly to designated national or supranational supervisory authorities via statutory API relay.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Target Supervisory Authority</label>
                  <select
                    value={selectedRegulator}
                    onChange={e => setSelectedRegulator(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="EDPB">European Data Protection Board (EDPB - Brussels)</option>
                    <option value="CNIL">CNIL (France Data Authority)</option>
                    <option value="BSI">BSI / BaFin (Germany Cybersecurity & Financial)</option>
                    <option value="FTC">US FTC & SEC Sovereign Compliance Ledger</option>
                    <option value="SDAIA">SDAIA (Saudi Data & AI Authority - Riyadh)</option>
                    <option value="MAS">Monetary Authority of Singapore (MAS)</option>
                    <option value="ICO">UK Information Commissioner's Office (ICO)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Optional Internal Docket / Filing Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. DOCKET-2026-Q2-CORP-AUDIT"
                    value={docketRef}
                    onChange={e => setDocketRef(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Cryptographic Filing Guarantees:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
                  <li>Payload bound to Merkle root <code className="text-indigo-300">{bundleData.cryptographicProof.merkleRootHash.slice(0, 16)}...</code></li>
                  <li>Signed with RSA-2048 private key; eIDAS legal equivalence attached.</li>
                  <li>7-year immutable statutory retention receipt issued on confirmation.</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleFileToRegulator}
                  disabled={isFiling}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer border-0 disabled:opacity-50"
                >
                  {isFiling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transmitting to Authority...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Statutory Audit Filing</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filing Receipt Result Modal / Card */}
            {filingReceipt && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 sm:p-6 bg-slate-950 border-2 border-emerald-500/40 rounded-2xl shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-black text-white">Official Regulatory Filing Receipt</h4>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">{filingReceipt.status}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{new Date(filingReceipt.submittedAt).toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Authority</span>
                    <strong className="text-white">{filingReceipt.regulatorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Statutory Docket Number</span>
                    <span className="font-mono text-emerald-300 font-bold">{filingReceipt.docketNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Verification Hash</span>
                    <span className="font-mono text-[10px] text-slate-300 break-all">{filingReceipt.verificationHash}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Statutory Retention Until</span>
                    <span className="font-semibold text-white">{filingReceipt.statutoryExpiryDate} (7-Year Lock)</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Filing Certificate</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 6: Independent Bundle Verifier */}
        {activeTab === 'verify' && (
          <div className="space-y-5 max-w-4xl mx-auto">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  Independent Third-Party Cryptographic Verifier
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Paste any 9Xen Regulettee JSON audit package below to independently verify its Merkle tree integrity, public key signature, and timestamp validity without disclosing internal secrets.
                </p>
              </div>

              <div>
                <textarea
                  rows={8}
                  value={verifyInputJson}
                  onChange={e => setVerifyInputJson(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
                  placeholder="Paste raw SignedAuditBundle JSON here..."
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setVerifyInputJson(jsonString)}
                  className="text-xs text-indigo-400 hover:underline cursor-pointer bg-transparent border-0"
                >
                  Load Current Bundle JSON
                </button>

                <button
                  onClick={handleVerifyJson}
                  disabled={isVerifying}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all cursor-pointer border-0 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Cryptography...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Cryptographic Proof</span>
                    </>
                  )}
                </button>
              </div>

              {verificationResult && (
                <div
                  className={`p-4 rounded-xl border ${
                    verificationResult.isValid
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  } space-y-2`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {verificationResult.isValid ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>Cryptographic Verification Succeeded: Document Is Authentic & Unaltered</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                        <span>Verification Failed: Potential Document Alteration or Invalid Signature</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs">{verificationResult.verificationDetails}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
