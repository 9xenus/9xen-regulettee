import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  Layers,
  RefreshCw,
  CheckCircle,
  XCircle,
  Zap,
  Lock,
  Database,
  Terminal,
  Copy,
  ExternalLink,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TrackerScript {
  name: string;
  category: string;
  provider: string;
  scriptUrl: string;
  isConsented: boolean;
  privacyRisk: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface DetectedCookie {
  name: string;
  domain: string;
  type: 'FIRST_PARTY' | 'THIRD_PARTY';
  purpose: string;
  expiry: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string;
  requiresConsent: boolean;
  hasPriorConsent: boolean;
}

interface UrlScanReport {
  id: string;
  targetUrl: string;
  scannedAt: string;
  ePrivacyScore: number;
  complianceStatus: 'COMPLIANT' | 'NEEDS_ATTENTION' | 'CRITICAL_VIOLATION';
  detectedTrackers: TrackerScript[];
  detectedCookies: DetectedCookie[];
  hiddenPixelsCount: number;
  unconsentedTrackersCount: number;
  cookieBannerDetected: boolean;
  hasRejectAllOption: boolean;
  remediationSteps: string[];
}

interface SystemAuditItem {
  id: string;
  targetType: 'API_ENDPOINT' | 'IAC_TERRAFORM' | 'IAC_KUBERNETES' | 'DATA_FLOW_PIPELINE';
  componentName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  violationCode: string;
  description: string;
  regulatoryReference: string;
  remediationPatch: string;
}

interface SystemAuditReport {
  id: string;
  scannedAt: string;
  overallScore: number;
  totalViolations: number;
  criticalCount: number;
  highCount: number;
  items: SystemAuditItem[];
}

export const AutomatedScannerInspection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'url_tracker' | 'system_audit' | 'scan_history'>('url_tracker');

  // URL Scanner State
  const [targetUrl, setTargetUrl] = useState('https://app.global-fintech.eu');
  const [isScanningUrl, setIsScanningUrl] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [urlReport, setUrlReport] = useState<UrlScanReport | null>(null);

  // System Audit State
  const [systemPayload, setSystemPayload] = useState<string>(`# Terraform IaC Infrastructure Payload
resource "aws_s3_bucket" "audit_logs" {
  bucket = "company-audit-logs-eu-west"
  acl    = "private"
  # Missing: server_side_encryption_configuration
}

resource "aws_security_group" "database" {
  name = "production-db-sg"
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Violation: Open Global Ingress
  }
}
`);
  const [isAuditingSystem, setIsAuditingSystem] = useState(false);
  const [systemReport, setSystemReport] = useState<SystemAuditReport | null>(null);

  // History State
  const [urlHistory, setUrlHistory] = useState<UrlScanReport[]>([]);
  const [systemHistory, setSystemHistory] = useState<SystemAuditReport[]>([]);
  const [copiedPatchId, setCopiedPatchId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    try {
      const [uRes, sRes] = await Promise.all([
        fetch('/api/v1/scanner/url-history'),
        fetch('/api/v1/scanner/system-audit-history')
      ]);
      const uData = await uRes.json();
      const sData = await sRes.json();

      if (uData.success && uData.history) setUrlHistory(uData.history);
      if (sData.success && sData.history) setSystemHistory(sData.history);
    } catch (err) {
      console.error('Failed to load histories:', err);
    }
  };

  const handleRunUrlScan = async () => {
    setIsScanningUrl(true);
    setUrlReport(null);
    setScanStep('Connecting to target web server...');

    setTimeout(() => setScanStep('Extracting HTML DOM & Network Requests...'), 400);
    setTimeout(() => setScanStep('Identifying tracking scripts & 1x1 hidden pixels...'), 800);
    setTimeout(() => setScanStep('Inspecting Cookie Inventory & ePrivacy Art 5(3)...'), 1200);

    try {
      const res = await fetch('/api/v1/scanner/scan-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setUrlReport(data.report);
        fetchHistories();
      }
    } catch (err) {
      console.error('Error running URL scan:', err);
    } finally {
      setIsScanningUrl(false);
      setScanStep('');
    }
  };

  const handleRunSystemAudit = async () => {
    setIsAuditingSystem(true);
    setSystemReport(null);

    try {
      const res = await fetch('/api/v1/scanner/audit-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeOrSpecPayload: systemPayload })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setSystemReport(data.report);
        fetchHistories();
      }
    } catch (err) {
      console.error('Error running system audit:', err);
    } finally {
      setIsAuditingSystem(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPatchId(id);
    setTimeout(() => setCopiedPatchId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL_VIOLATION':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'NEEDS_ATTENTION':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'COMPLIANT':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Automated Scanning & Inspection
                </h1>
                <p className="text-xs text-slate-500">
                  অটোমেটেড স্ক্যানিং ও রিয়েল-টাইম মনিটরিং (ComplianceScanner, Trackers & Continuous System Audits)
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Inspect website URLs for hidden pixels, unconsented cookies, and tracking scripts under ePrivacy. Continuously audit API endpoints, IaC Terraform/Kubernetes code, and cross-border data flows.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mt-6 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('url_tracker')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'url_tracker'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>1. Website Tracker & Pixel Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('system_audit')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'system_audit'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Continuous System Audits (API, IaC & Data Flow)</span>
          </button>

          <button
            onClick={() => setActiveTab('scan_history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'scan_history'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>3. Audit Ledger & Historical Logs</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        {/* TAB 1: WEBSITE TRACKER & PIXEL INSPECTOR */}
        {activeTab === 'url_tracker' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Scanner Control */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <Globe className="w-4 h-4 text-slate-700" />
                <span>Target URL Scanner</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Website URL</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://example-site.eu"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Quick Preset Targets:
                  </span>
                  <div className="space-y-1.5">
                    {['https://app.global-fintech.eu', 'https://e-commerce-store.de', 'https://saas-healthtech.org'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setTargetUrl(preset)}
                        className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200 truncate"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                  <span className="font-bold text-slate-900 block mb-1">ePrivacy Directive Art 5(3) Scope:</span>
                  <p>Detects Facebook Pixels, GA4, TikTok Pixels, Hotjar session recorders, 1x1 hidden tracking beacons, and cookies placed prior to user consent.</p>
                </div>

                <button
                  onClick={handleRunUrlScan}
                  disabled={isScanningUrl}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs"
                >
                  {isScanningUrl ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Scan Website Trackers</span>
                    </>
                  )}
                </button>

                {isScanningUrl && scanStep && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center space-x-2 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                    <span>{scanStep}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Report Display */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              {urlReport ? (
                <div>
                  {/* Top Summary Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-400 block mb-1">
                        SCAN ID: {urlReport.id}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                        <span>{urlReport.targetUrl}</span>
                      </h2>
                    </div>

                    <div className="mt-3 sm:mt-0 flex items-center space-x-3">
                      <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${getStatusBadge(urlReport.complianceStatus)}`}>
                        {urlReport.complianceStatus.replace('_', ' ')}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-900">{urlReport.ePrivacyScore}</span>
                        <span className="text-[10px] text-slate-500 block">ePrivacy Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Metric Chips */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <span className="text-xl font-bold text-slate-900">{urlReport.detectedTrackers.length}</span>
                      <span className="text-[11px] text-slate-500 block">Trackers Found</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <span className="text-xl font-bold text-red-700">{urlReport.unconsentedTrackersCount}</span>
                      <span className="text-[11px] text-slate-500 block">Unconsented Trackers</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <span className="text-xl font-bold text-amber-700">{urlReport.hiddenPixelsCount}</span>
                      <span className="text-[11px] text-slate-500 block">Hidden 1x1 Pixels</span>
                    </div>
                  </div>

                  {/* Detected Tracking Scripts Table */}
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Detected Tracking Scripts & Beacons
                  </h4>

                  <div className="space-y-2 mb-6">
                    {urlReport.detectedTrackers.map((tr, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{tr.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono">
                              {tr.category}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono truncate block mt-0.5 max-w-md">
                            {tr.scriptUrl}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            tr.privacyRisk === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {tr.privacyRisk} RISK
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            tr.isConsented ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tr.isConsented ? 'CONSENTED' : 'UNCONSENTED'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cookie Inventory */}
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Cookie Inventory Inspection
                  </h4>

                  <div className="space-y-2 mb-6">
                    {urlReport.detectedCookies.map((ck, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-slate-900">{ck.name}</span>
                          <span className="text-[11px] text-slate-500 block">Purpose: {ck.purpose} | Expiry: {ck.expiry}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-[10px] font-mono">
                          <span className="bg-slate-100 px-2 py-0.5 rounded">{ck.type}</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded">SameSite={ck.sameSite}</span>
                          {ck.secure && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">SECURE</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Remediation Steps */}
                  {urlReport.remediationSteps.length > 0 && (
                    <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl">
                      <span className="text-xs font-bold text-amber-900 block mb-2">Automated Remediation Plan:</span>
                      <ul className="space-y-1.5 text-xs text-amber-800">
                        {urlReport.remediationSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-xs">
                  Enter target website URL on the left and click "Scan Website Trackers".
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CONTINUOUS SYSTEM AUDIT (API, IAC & DATA FLOW) */}
        {activeTab === 'system_audit' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Input */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-slate-700" />
                  <span>IaC / API Code Inspection Payload</span>
                </h3>
                <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 font-mono">
                  Terraform / Kubernetes / OpenAPI
                </span>
              </div>

              <div className="relative mb-4">
                <textarea
                  rows={12}
                  value={systemPayload}
                  onChange={(e) => setSystemPayload(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700 leading-relaxed"
                />
              </div>

              <button
                onClick={handleRunSystemAudit}
                disabled={isAuditingSystem}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                {isAuditingSystem ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Run Continuous System Audit</span>
                  </>
                )}
              </button>
            </div>

            {/* Right System Audit Report */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <span>Audit Findings & Remediation Patches</span>
              </h3>

              {systemReport ? (
                <div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Overall System Compliance</span>
                      <span className="text-[11px] text-slate-500">
                        {systemReport.totalViolations} Violations Detected ({systemReport.criticalCount} Critical)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900">{systemReport.overallScore}</span>
                      <span className="text-[10px] text-slate-500 block">Health Index</span>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                    {systemReport.items.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {item.componentName}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            item.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.severity}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 mb-2">{item.description}</p>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                          Regulatory Reference: {item.regulatoryReference}
                        </span>

                        <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] relative">
                          <button
                            onClick={() => copyToClipboard(item.remediationPatch, item.id)}
                            className="absolute right-2 top-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-all"
                            title="Copy Patch"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-slate-400 block text-[10px] uppercase mb-1">Terraform / API Patch:</span>
                          <pre className="whitespace-pre-wrap">{item.remediationPatch}</pre>
                          {copiedPatchId === item.id && (
                            <span className="text-[10px] text-emerald-400 block mt-1">Copied to clipboard!</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-xs">
                  Click "Run Continuous System Audit" to evaluate IaC and API configurations.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SCAN HISTORY & AUDIT LEDGER */}
        {activeTab === 'scan_history' && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
              <Database className="w-4 h-4 text-slate-700" />
              <span>Historical Scan Records & System Audit Logs</span>
            </h3>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Website URL Scan Records</h4>
              <div className="space-y-2">
                {urlHistory.map((u) => (
                  <div key={u.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-slate-900">{u.targetUrl}</span>
                      <span className="text-[11px] text-slate-500 block font-sans">
                        Scanned at {new Date(u.scannedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${getStatusBadge(u.complianceStatus)}`}>
                        {u.complianceStatus}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{u.ePrivacyScore} Score</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomatedScannerInspection;
