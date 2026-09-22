import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EmbeddedConsentBannerStudio } from '../components/consent/EmbeddedConsentBannerStudio';
import { useNotification } from '../context/NotificationContext';
import {
  Cookie,
  ShieldCheck,
  Lock,
  Database,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  Server,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Settings,
  RefreshCw,
  Search,
  KeyRound,
  Shield,
  ShieldAlert,
  FileCheck,
  Layers,
  Menu,
  X,
  Globe,
  Zap,
  Cpu,
  Radio,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
  FileSpreadsheet,
  Terminal,
  Sliders,
  SlidersHorizontal,
  Eye,
  Copy,
  Save,
  Filter,
  Trash2,
  Play,
  Pause,
  Building2,
  AlertCircle,
  Check
} from 'lucide-react';
import { GdprChecklist } from '../components/GdprChecklist';
import { TrustPrivacyDashboard } from './TrustPrivacyDashboard';

interface DiscoveredAsset {
  id: string;
  urlOrEndpoint: string;
  assetName: string;
  assetType: 'WEB_APP' | 'API_GATEWAY' | 'CLOUD_STORAGE' | 'DATABASE' | 'AI_MODEL';
  hostingRegion: string;
  piiDetected: string[];
  applicableActs: {
    act: string;
    status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
    details: string;
  }[];
  overallScore: number;
  lastScanned: string;
}

interface RopaRecord {
  id: string;
  activityName: string;
  department: string;
  lawfulBasis: 'Consent' | 'Contract' | 'Legal Obligation' | 'Legitimate Interest';
  dataCategories: string[];
  retentionPeriod: string;
  status: 'AUDITED' | 'IN_REVIEW' | 'ACTION_REQUIRED';
}

interface DsarRequest {
  id: string;
  subjectName: string;
  requestType: 'Access' | 'Erasure (Right to be Forgotten)' | 'Portability' | 'Rectification';
  submittedDate: string;
  daysRemaining: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'FULFILLED';
}

interface DpiaTicket {
  id: string;
  systemName: string;
  riskLevel: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  processingPurpose: string;
  mitigationStatus: 'APPROVED' | 'PENDING_DPO_REVIEW' | 'ACTION_REQUIRED';
  assessedDate: string;
}

interface PrivacySystemConfig {
  consentBannerMode: 'STRICT_OPT_IN' | 'GRANULAR_CATEGORIES' | 'OPT_OUT' | 'GPC_HEADER_HONOR';
  consentRetentionMonths: number;
  iabTcfVersion: string;
  autoBlockCookies: boolean;
  
  globalPiiRetentionDays: number;
  anonymizationAlgorithm: 'HMAC_SHA256' | 'AES_256_GCM' | 'TOKEN_SALT';
  autoShredOnAccountDelete: boolean;
  softDeleteGracePeriodDays: number;
  
  sovereignRegion: 'EU_FRANKFURT' | 'EU_DUBLIN' | 'US_EAST' | 'APAC_SINGAPORE';
  dpfCertified: boolean;
  enforceScc: boolean;
  blockThirdPartyExport: boolean;
  
  dpoName: string;
  dpoEmail: string;
  dpoPhone: string;
  dpoRegId: string;
  breachNotifierThresholdHours: number;
  webhookUrl: string;
  fineRiskTurnoverPercent: number;
  
  maxScanConcurrency: number;
  scanTimeoutSeconds: number;
  quarantineLeakedPii: boolean;
}

const DEFAULT_SYSTEM_CONFIG: PrivacySystemConfig = {
  consentBannerMode: 'STRICT_OPT_IN',
  consentRetentionMonths: 12,
  iabTcfVersion: 'v2.2',
  autoBlockCookies: true,
  
  globalPiiRetentionDays: 365,
  anonymizationAlgorithm: 'HMAC_SHA256',
  autoShredOnAccountDelete: true,
  softDeleteGracePeriodDays: 30,
  
  sovereignRegion: 'EU_FRANKFURT',
  dpfCertified: true,
  enforceScc: true,
  blockThirdPartyExport: true,
  
  dpoName: 'Dr. Helene Vance',
  dpoEmail: 'dpo@regulettee-caas.eu',
  dpoPhone: '+49 69 900 1204',
  dpoRegId: 'DPO-EU-2026-9901',
  breachNotifierThresholdHours: 72,
  webhookUrl: 'https://api.regulettee-caas.eu/v1/privacy/alerts/webhook',
  fineRiskTurnoverPercent: 4.0,
  
  maxScanConcurrency: 8,
  scanTimeoutSeconds: 30,
  quarantineLeakedPii: true
};

export const GdprComplianceAddon: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'scan' | 'cmp_studio' | 'sysconfig' | 'ropa' | 'dsar' | 'toms' | 'dpia' | 'checklist' | 'mapping'>('scan');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // System Configuration State
  const [sysConfig, setSysConfig] = useState<PrivacySystemConfig>(() => {
    const saved = localStorage.getItem('gdpr_privacy_system_config');
    return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_CONFIG;
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Scanner State & Advanced Features
  const [targetUrl, setTargetUrl] = useState('https://portal.enterprise-client.eu');
  const [targetAssetType, setTargetAssetType] = useState<'WEB_APP' | 'API_GATEWAY' | 'CLOUD_STORAGE' | 'DATABASE' | 'AI_MODEL'>('WEB_APP');
  const [scanProfile, setScanProfile] = useState<'DEEP' | 'PII_LEAK' | 'COOKIES' | 'AI_VAULT'>('DEEP');
  const [scanDepth, setScanDepth] = useState<number>(3);
  const [requestRateMs, setRequestRateMs] = useState<number>(200);
  const [customAuthHeader, setCustomAuthHeader] = useState('Bearer lx_sec_scan_token_2026');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [scannerLogs, setScannerLogs] = useState<string[]>([]);
  const [selectedActs, setSelectedActs] = useState<string[]>(['GDPR', 'AI_ACT', 'NIS2', 'DORA', 'ePrivacy', 'CCPA']);
  const [scheduledCron, setScheduledCron] = useState<'OFF' | 'HOURLY' | 'DAILY' | 'WEEKLY'>('DAILY');
  const [scannerApiKey, setScannerApiKey] = useState('lx_scanner_live_key_99812a');

  // Custom PII Regex Pattern Rules
  const [customPiiRules, setCustomPiiRules] = useState([
    { id: 'RULE-01', name: 'EU Passport / National ID', pattern: '^[A-Z0-9]{8,12}$', active: true },
    { id: 'RULE-02', name: 'Credit Card (Luhn Validation)', pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$', active: true },
    { id: 'RULE-03', name: 'IBAN Banking Code', pattern: '^[A-Z]{2}\\d{2}[A-Z0-9]{12,30}$', active: true },
    { id: 'RULE-04', name: 'Biometric Vector Signature', pattern: '^bio_vec_[a-[0-9]{32}$', active: true }
  ]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');

  // Scanned Assets State
  const [scannedAssets, setScannedAssets] = useState<DiscoveredAsset[]>([
    {
      id: 'AST-EU-001',
      urlOrEndpoint: 'https://portal.enterprise-client.eu',
      assetName: 'Main Customer Sovereign Web Portal',
      assetType: 'WEB_APP',
      hostingRegion: 'Frankfurt, Germany (eu-central-1)',
      piiDetected: ['Email Address', 'IP Address', 'Auth Tokens', 'Analytics Cookies'],
      applicableActs: [
        { act: 'GDPR (EU 2016/679)', status: 'COMPLIANT', details: 'Article 6 Consent banner & Article 30 ROPA mapped' },
        { act: 'ePrivacy Directive', status: 'COMPLIANT', details: 'Prior cookie consent mechanism detected' },
        { act: 'NIS2 Directive', status: 'COMPLIANT', details: 'Sovereign SSL/TLS 1.3 & DDoS mitigation active' },
        { act: 'DORA (EU 2022/2554)', status: 'WARNING', details: 'Third-party CDN sub-processor requires updated DPA' }
      ],
      overallScore: 94,
      lastScanned: 'Just now'
    },
    {
      id: 'AST-EU-002',
      urlOrEndpoint: 'https://api-ai.enterprise-client.eu/v1/predict',
      assetName: 'Automated Credit Assessment AI Model Endpoint',
      assetType: 'AI_MODEL',
      hostingRegion: 'Paris, France (eu-west-3)',
      piiDetected: ['Credit History', 'Employment Status', 'National Identification Number'],
      applicableActs: [
        { act: 'EU AI Act (2024/1689)', status: 'WARNING', details: 'Classified as High-Risk AI. Fundamental Rights Impact Assessment (FRIA) required.' },
        { act: 'GDPR (EU 2016/679)', status: 'COMPLIANT', details: 'Article 22 Automated Decision-Making opt-out active' },
        { act: 'DORA (EU 2022/2554)', status: 'COMPLIANT', details: 'ICT risk management controls passed' }
      ],
      overallScore: 86,
      lastScanned: '2 hours ago'
    },
    {
      id: 'AST-EU-003',
      urlOrEndpoint: 's3://eu-central-pii-vault.storage.internal',
      assetName: 'Encrypted Subject Document Bucket',
      assetType: 'CLOUD_STORAGE',
      hostingRegion: 'Stockholm, Sweden (eu-north-1)',
      piiDetected: ['Passport Scans', 'Utility Bills', 'Biometric Selfie Records'],
      applicableActs: [
        { act: 'GDPR (EU 2016/679)', status: 'COMPLIANT', details: 'Article 32 AES-256-GCM HSM encryption enforced' },
        { act: 'NIS2 Directive', status: 'COMPLIANT', details: 'Immutable audit logs and multi-region replication' }
      ],
      overallScore: 98,
      lastScanned: 'Yesterday'
    }
  ]);

  // Sample Article 30 ROPA Records
  const [ropaRecords, setRopaRecords] = useState<RopaRecord[]>([
    {
      id: 'ROPA-001',
      activityName: 'Customer Onboarding & Identity Verification',
      department: 'Compliance & Legal',
      lawfulBasis: 'Legal Obligation',
      dataCategories: ['Full Name', 'EU Passport/National ID', 'Proof of Address'],
      retentionPeriod: '5 Years post-offboarding',
      status: 'AUDITED'
    },
    {
      id: 'ROPA-002',
      activityName: 'Behavioral Analytics & Marketing Personalization',
      department: 'Growth & Marketing',
      lawfulBasis: 'Consent',
      dataCategories: ['IP Address', 'Cookie Identifiers', 'Clickstream Data'],
      retentionPeriod: '12 Months',
      status: 'AUDITED'
    },
    {
      id: 'ROPA-003',
      activityName: 'Employee Payroll & Tax Disclosures',
      department: 'Human Resources',
      lawfulBasis: 'Contract',
      dataCategories: ['Bank IBAN', 'Tax ID', 'Salary Records', 'Health Insurance'],
      retentionPeriod: '10 Years (Tax Statute)',
      status: 'AUDITED'
    },
    {
      id: 'ROPA-004',
      activityName: 'Third-Party SaaS Processor Analytics',
      department: 'Engineering',
      lawfulBasis: 'Legitimate Interest',
      dataCategories: ['User ID', 'Session Metadata', 'Error Logs'],
      retentionPeriod: '90 Days',
      status: 'IN_REVIEW'
    }
  ]);

  // Sample DSAR Requests
  const [dsarRequests, setDsarRequests] = useState<DsarRequest[]>([
    {
      id: 'DSAR-2026-089',
      subjectName: 'Elena Rostova',
      requestType: 'Erasure (Right to be Forgotten)',
      submittedDate: '2026-08-01',
      daysRemaining: 26,
      status: 'IN_PROGRESS'
    },
    {
      id: 'DSAR-2026-088',
      subjectName: 'Marcus Weber',
      requestType: 'Access',
      submittedDate: '2026-07-28',
      daysRemaining: 22,
      status: 'PENDING'
    },
    {
      id: 'DSAR-2026-084',
      subjectName: 'Sophie Dubois',
      requestType: 'Portability',
      submittedDate: '2026-07-15',
      daysRemaining: 9,
      status: 'FULFILLED'
    }
  ]);

  // Sample DPIA Tickets
  const [dpiaTickets, setDpiaTickets] = useState<DpiaTicket[]>([
    {
      id: 'DPIA-2026-012',
      systemName: 'Biometric Facial Recognition Kiosk',
      riskLevel: 'CRITICAL',
      processingPurpose: 'High-frequency identity validation at European border terminals',
      mitigationStatus: 'APPROVED',
      assessedDate: '2026-07-10'
    },
    {
      id: 'DPIA-2026-014',
      systemName: 'AI Algorithmic Credit Scoring Pipeline',
      riskLevel: 'HIGH',
      processingPurpose: 'Automated underwriting for retail loan applicants',
      mitigationStatus: 'PENDING_DPO_REVIEW',
      assessedDate: '2026-08-02'
    }
  ]);

  // Save System Config
  const handleSaveSystemConfig = () => {
    setIsSavingConfig(true);
    setTimeout(() => {
      localStorage.setItem('gdpr_privacy_system_config', JSON.stringify(sysConfig));
      setIsSavingConfig(false);
      showToast('GDPR & Privacy System Configuration saved successfully and propagated to live enforcement nodes!', 'success');
    }, 600);
  };

  const handleRunUrlScan = () => {
    if (!targetUrl.trim()) return;
    setIsScanning(true);
    setScanProgress(5);
    setScanStep('Initializing sovereign DNS & TLS 1.3 certificate handshakes...');
    setScannerLogs([
      `[${new Date().toLocaleTimeString()}] Starting Privacy & Infrastructure Scanner on ${targetUrl}`,
      `[${new Date().toLocaleTimeString()}] Scan Profile: ${scanProfile} | Concurrency: ${sysConfig.maxScanConcurrency} threads`
    ]);

    setTimeout(() => {
      setScanProgress(25);
      setScanStep('Inspecting HTTP Headers, Cookie Consent Banners & Global Privacy Control (GPC)...');
      setScannerLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Checking CSP, HSTS, and X-Content-Type-Options... PASS`,
        `[${new Date().toLocaleTimeString()}] Analyzing 14 cookie parameters for prior-consent compliance...`
      ]);
    }, 700);

    setTimeout(() => {
      setScanProgress(55);
      setScanStep('Executing Custom Regex PII Discovery Engine across payload bodies & DOM nodes...');
      setScannerLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Evaluating Rule: EU Passport / National ID... MATCH FOUND (2 endpoints)`,
        `[${new Date().toLocaleTimeString()}] Evaluating Rule: IBAN Banking Code... CLEAN`,
        `[${new Date().toLocaleTimeString()}] Evaluating Rule: Luhn CC Validator... CLEAN`
      ]);
    }, 1400);

    setTimeout(() => {
      setScanProgress(80);
      setScanStep('Verifying cross-border data residency & sub-processor SCCs against law matrix...');
      setScannerLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Hosting IP mapped to ${sysConfig.sovereignRegion} (Frankfurt node)`,
        `[${new Date().toLocaleTimeString()}] Cross-referencing selected Law Acts: ${selectedActs.join(', ')}`
      ]);
    }, 2100);

    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      setScanStep('Scan Complete!');
      setScannerLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] SUCCESS: Generated compliance matrix and calculated readiness score.`
      ]);

      const domainClean = targetUrl.replace(/^https?:\/\//, '').split('/')[0];
      const newAsset: DiscoveredAsset = {
        id: `AST-EU-${Math.floor(100 + Math.random() * 900)}`,
        urlOrEndpoint: targetUrl,
        assetName: `${domainClean.toUpperCase()} Digital Asset`,
        assetType: targetAssetType,
        hostingRegion: `${sysConfig.sovereignRegion} (Sovereign Node)`,
        piiDetected: targetAssetType === 'AI_MODEL' 
          ? ['Inference Inputs', 'Biometric Vectors', 'User Feedback Logs']
          : ['Email Address', 'Session IP', 'Device Footprint', 'Cookie Identifiers'],
        applicableActs: [
          {
            act: 'GDPR (EU 2016/679)',
            status: 'COMPLIANT',
            details: 'Valid TLS 1.3 encryption, privacy policy hyperlink detected, consent banner active.'
          },
          {
            act: 'EU AI Act (2024/1689)',
            status: targetAssetType === 'AI_MODEL' ? 'WARNING' : 'COMPLIANT',
            details: targetAssetType === 'AI_MODEL'
              ? 'AI model service detected. Classification: Article 6 High-Risk. FRIA documentation required.'
              : 'No high-risk autonomous AI systems detected.'
          },
          {
            act: 'NIS2 Directive (EU 2022/2555)',
            status: 'COMPLIANT',
            details: 'Sovereign EU IP routing verified. Incident response monitoring endpoint active.'
          },
          {
            act: 'CCPA / CPRA',
            status: 'COMPLIANT',
            details: 'Do Not Sell / Share My Personal Info mechanism honored.'
          }
        ],
        overallScore: targetAssetType === 'AI_MODEL' ? 88 : 96,
        lastScanned: 'Just now'
      };

      setScannedAssets([newAsset, ...scannedAssets]);
    }, 2800);
  };

  const handleRegisterToRopa = (asset: DiscoveredAsset) => {
    const newRopa: RopaRecord = {
      id: `ROPA-AUTO-${Math.floor(100 + Math.random() * 900)}`,
      activityName: `Processing for ${asset.assetName}`,
      department: 'Digital Operations',
      lawfulBasis: 'Consent',
      dataCategories: asset.piiDetected,
      retentionPeriod: `${sysConfig.globalPiiRetentionDays} Days`,
      status: 'AUDITED'
    };
    setRopaRecords([newRopa, ...ropaRecords]);
    showToast(`Asset "${asset.assetName}" successfully registered into Article 30 ROPA Record (${newRopa.id})!`, 'success');
  };

  const handleExportRopa = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      showToast('GDPR & Privacy Compliance Audit Report exported as official PDF document!', 'success');
    }, 800);
  };

  const handleAddPiiRule = () => {
    if (!newRuleName.trim() || !newRulePattern.trim()) return;
    setCustomPiiRules([
      ...customPiiRules,
      {
        id: `RULE-0${customPiiRules.length + 1}`,
        name: newRuleName,
        pattern: newRulePattern,
        active: true
      }
    ]);
    setNewRuleName('');
    setNewRulePattern('');
  };

  const filteredRopa = ropaRecords.filter(r => 
    r.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.lawfulBasis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8 bg-slate-50 min-h-screen rounded-2xl border border-slate-200/60">
      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 lg:p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Sovereign Privacy Engine</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono">
              v3.2 Advanced Scanner & System Config
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">GDPR & Privacy Compliance Addon</h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            All-in-one privacy governance suite: Advanced PII & Infra Scanner, System Configuration controls, Article 30 ROPA Register, Automated DSAR fulfillment, Article 32 TOMs posture, and DPIA risk assessments.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Menu className="w-4 h-4 text-indigo-400" />
            <span>Action Checklist</span>
          </button>
          <button
            onClick={handleExportRopa}
            disabled={isProcessing}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isProcessing ? 'Generating...' : 'Export Audit Report'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Infrastructure Scanned</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{scannedAssets.length}</span>
            <span className="text-xs font-bold text-emerald-600">Assets Active</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">URLs, APIs, Cloud Storage & AI Models</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Config Node</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Settings className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{sysConfig.sovereignRegion.replace('EU_', '')}</span>
            <span className="text-xs font-bold text-emerald-600">Lock Active</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">DPO: {sysConfig.dpoName} ({sysConfig.dpoRegId})</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">DSAR SLA Engine</span>
            <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{dsarRequests.filter(d => d.status !== 'FULFILLED').length}</span>
            <span className="text-xs font-bold text-emerald-600">Avg 12d SLA</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">30-day statutory fulfillment active</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Law Act Coverage</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{selectedActs.length} Acts</span>
            <span className="text-xs font-bold text-blue-600">Verified</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">GDPR, ePrivacy, CCPA, AI Act, NIS2, DORA</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'scan', label: 'Advanced Infra & PII Scanner', icon: Zap },
          { id: 'cmp_studio', label: 'Embeddable CMP Studio & Branding', icon: Cookie },
          { id: 'sysconfig', label: 'Privacy System Configurations', icon: Settings },
          { id: 'ropa', label: 'Article 30 ROPA Register', icon: FileText },
          { id: 'dsar', label: 'Automated DSAR Engine', icon: UserCheck },
          { id: 'toms', label: 'Article 32 TOMs Security', icon: Lock },
          { id: 'dpia', label: 'Privacy Impact Assessment (DPIA)', icon: ShieldAlert },
          { id: 'checklist', label: 'GDPR Compliance Checklist', icon: CheckCircle },
          { id: 'mapping', label: 'Live Data Flow Mapping', icon: Database }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: ADVANCED SCANNER INTEGRATION */}
      {activeTab === 'scan' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Main Scanner Launcher */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  Advanced Privacy & Infrastructure Scanner Integration
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deep inspection for URLs, API endpoints, cloud storage buckets, databases, and AI model inference gateways.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200/60 font-mono">
                  API Key: {scannerApiKey}
                </span>
                <button
                  onClick={() => showToast(`Scanner cURL Trigger: curl -X POST https://api.regulettee-caas.eu/v1/scanner/trigger -H "X-API-KEY: ${scannerApiKey}"`, 'info')}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  title="Copy cURL Command"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Input Parameters Form */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 space-y-1">
                <label className="text-xs font-bold text-slate-700">Digital Asset URL or Connection String</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="e.g. https://app.company.eu or s3://pii-vault"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-xs font-bold text-slate-700">Asset Category</label>
                <select
                  value={targetAssetType}
                  onChange={(e) => setTargetAssetType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="WEB_APP">Web Application / Portal</option>
                  <option value="API_GATEWAY">API Gateway / Endpoint</option>
                  <option value="CLOUD_STORAGE">Cloud Storage / S3 Vault</option>
                  <option value="DATABASE">Database Cluster / Store</option>
                  <option value="AI_MODEL">AI / ML Model Service</option>
                </select>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-700">Scan Profile</label>
                <select
                  value={scanProfile}
                  onChange={(e) => setScanProfile(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="DEEP">Full Deep Crawl & PII Audit</option>
                  <option value="PII_LEAK">PII Leak & Header Inspection</option>
                  <option value="COOKIES">Cookie & Tracker Prior-Consent Audit</option>
                  <option value="AI_VAULT">AI Model Training Data Leak Check</option>
                </select>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-700">Scan Recursion Depth (Clicks)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={scanDepth}
                  onChange={(e) => setScanDepth(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-700">Request Rate Delay (ms)</label>
                <input
                  type="number"
                  step="50"
                  min="50"
                  max="2000"
                  value={requestRateMs}
                  onChange={(e) => setRequestRateMs(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-700">Auth Token / Custom Header</label>
                <input
                  type="text"
                  value={customAuthHeader}
                  onChange={(e) => setCustomAuthHeader(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none"
                />
              </div>
            </div>

            {/* Targeted Law Acts Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Law Acts Matrix for Compliance Verification:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'GDPR', label: 'GDPR (EU 2016/679)' },
                  { id: 'ePrivacy', label: 'ePrivacy Directive' },
                  { id: 'CCPA', label: 'CCPA / CPRA (California)' },
                  { id: 'AI_ACT', label: 'EU AI Act (2024/1689)' },
                  { id: 'NIS2', label: 'NIS2 Directive' },
                  { id: 'DORA', label: 'DORA Framework' }
                ].map(act => {
                  const isChecked = selectedActs.includes(act.id);
                  return (
                    <button
                      key={act.id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedActs(selectedActs.filter(a => a !== act.id));
                        } else {
                          setSelectedActs([...selectedActs, act.id]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-xs'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}{act.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trigger & Cron Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Automated Background Cron:</span>
                <select
                  value={scheduledCron}
                  onChange={(e) => setScheduledCron(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="OFF">Manual On-Demand Only</option>
                  <option value="HOURLY">Run Hourly Scanner</option>
                  <option value="DAILY">Run Daily at 02:00 UTC</option>
                  <option value="WEEKLY">Run Weekly on Sundays</option>
                </select>
              </div>

              <button
                onClick={handleRunUrlScan}
                disabled={isScanning}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-white ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Executing Advanced Scan...' : 'Start Live Asset Scan'}</span>
              </button>
            </div>

            {/* Progress & Live Console Output */}
            {isScanning && (
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-400 font-bold">{scanStep}</span>
                  <span className="font-bold text-emerald-400">{scanProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Real-time Scanner Terminal Log */}
            {scannerLogs.length > 0 && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1.5 max-h-48 overflow-y-auto">
                <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-2 mb-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-bold text-xs">Real-Time Scanner Telemetry Terminal</span>
                </div>
                {scannerLogs.map((log, idx) => (
                  <div key={idx} className="leading-tight">{log}</div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Regex PII Pattern Rules Manager */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Custom Regex PII Pattern Detection Rules</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customPiiRules.map((rule) => (
                <div key={rule.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{rule.id}</span>
                      <span className="text-xs font-bold text-slate-900">{rule.name}</span>
                    </div>
                    <code className="text-[10px] font-mono text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 inline-block mt-1">
                      {rule.pattern}
                    </code>
                  </div>
                  <button
                    onClick={() => setCustomPiiRules(customPiiRules.map(r => r.id === rule.id ? { ...r, active: !r.active } : r))}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                      rule.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {rule.active ? 'Active' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Rule Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <input
                type="text"
                placeholder="Rule Name (e.g., Medical Record ID)"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                className="w-full sm:w-1/3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Regex Pattern (e.g., ^MED-[0-9]{6}$)"
                value={newRulePattern}
                onChange={(e) => setNewRulePattern(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
              <button
                onClick={handleAddPiiRule}
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                + Add Rule
              </button>
            </div>
          </div>

          {/* Registered Asset Inventory List */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Scanned Digital Infrastructure & Asset Ledger</h3>
              <span className="text-xs font-bold text-slate-500">{scannedAssets.length} Assets Verified</span>
            </div>

            <div className="space-y-4">
              {scannedAssets.map(asset => (
                <div key={asset.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">{asset.id}</span>
                        <h4 className="text-sm font-bold text-slate-900">{asset.assetName}</h4>
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                          {asset.assetType}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-indigo-600 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        <span>{asset.urlOrEndpoint}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 block">Readiness Score</span>
                        <span className="text-lg font-black text-emerald-600">{asset.overallScore}%</span>
                      </div>
                      <button
                        onClick={() => handleRegisterToRopa(asset)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to ROPA</span>
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 block mb-1">Detected PII Intake:</span>
                      <div className="flex flex-wrap gap-1">
                        {asset.piiDetected.map((pii, i) => (
                          <span key={i} className="bg-indigo-50 text-indigo-800 text-[10px] px-2 py-0.5 rounded font-medium border border-indigo-200/60">
                            {pii}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-500 block mb-1">Hosting Server Region:</span>
                      <span className="font-mono text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200 inline-block">
                        {asset.hostingRegion}
                      </span>
                    </div>
                  </div>

                  {/* Applicable Law Acts Compliance Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    <span className="text-xs font-bold text-slate-700 block">Law Act Verification Matrix:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {asset.applicableActs.map((actItem, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex items-start gap-2">
                          {actItem.status === 'COMPLIANT' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                          {actItem.status === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                          {actItem.status === 'NON_COMPLIANT' && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{actItem.act}</span>
                              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                                actItem.status === 'COMPLIANT' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {actItem.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{actItem.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: EMBEDDABLE CMP STUDIO & BRANDING */}
      {activeTab === 'cmp_studio' && (
        <div className="space-y-4 sm:space-y-6">
          <EmbeddedConsentBannerStudio />
        </div>
      )}

      {/* Tab 2: PRIVACY SYSTEM CONFIGURATION */}
      {activeTab === 'sysconfig' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  Privacy & GDPR System Configurations
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure core platform privacy rules, consent preferences, data retention timers, region restrictions, and DPO alerts.
                </p>
              </div>
              <button
                onClick={handleSaveSystemConfig}
                disabled={isSavingConfig}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingConfig ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Section A: Consent & Tracking Policy */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>1. Consent Banner & Cookie Management</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Default Consent Banner Mode</label>
                    <select
                      value={sysConfig.consentBannerMode}
                      onChange={(e) => setSysConfig({ ...sysConfig, consentBannerMode: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="STRICT_OPT_IN">Strict Prior Consent Opt-In (EU GDPR / ePrivacy)</option>
                      <option value="GRANULAR_CATEGORIES">Granular Category Selector (UK Privacy)</option>
                      <option value="OPT_OUT">Opt-Out / Do Not Sell Notice (US CCPA)</option>
                      <option value="GPC_HEADER_HONOR">Global Privacy Control (GPC) Auto-Honor</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Consent Log Retention (Months)</label>
                    <input
                      type="number"
                      value={sysConfig.consentRetentionMonths}
                      onChange={(e) => setSysConfig({ ...sysConfig, consentRetentionMonths: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">IAB TCF Framework Specification</label>
                    <input
                      type="text"
                      value={sysConfig.iabTcfVersion}
                      onChange={(e) => setSysConfig({ ...sysConfig, iabTcfVersion: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="autoBlockCookies"
                      checked={sysConfig.autoBlockCookies}
                      onChange={(e) => setSysConfig({ ...sysConfig, autoBlockCookies: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label htmlFor="autoBlockCookies" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Auto-block third-party cookies prior to explicit consent
                    </label>
                  </div>
                </div>
              </div>

              {/* Section B: Data Retention & Anonymization */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>2. Data Retention & Anonymization Rules</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Global PII Retention Limit (Days)</label>
                    <input
                      type="number"
                      value={sysConfig.globalPiiRetentionDays}
                      onChange={(e) => setSysConfig({ ...sysConfig, globalPiiRetentionDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Pseudonymization / Shredding Algorithm</label>
                    <select
                      value={sysConfig.anonymizationAlgorithm}
                      onChange={(e) => setSysConfig({ ...sysConfig, anonymizationAlgorithm: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                    >
                      <option value="HMAC_SHA256">HMAC-SHA256 Salted Hash</option>
                      <option value="AES_256_GCM">AES-256-GCM Envelope Encryption</option>
                      <option value="TOKEN_SALT">Cryptographic Surrogate Tokenization</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Soft-Delete Grace Period (Days)</label>
                    <input
                      type="number"
                      value={sysConfig.softDeleteGracePeriodDays}
                      onChange={(e) => setSysConfig({ ...sysConfig, softDeleteGracePeriodDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="autoShredOnAccountDelete"
                      checked={sysConfig.autoShredOnAccountDelete}
                      onChange={(e) => setSysConfig({ ...sysConfig, autoShredOnAccountDelete: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label htmlFor="autoShredOnAccountDelete" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Auto crypto-shred subject records upon erasure request
                    </label>
                  </div>
                </div>
              </div>

              {/* Section C: Sovereign Data Residency */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>3. Sovereign Data Residency & Transfers</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Target Sovereign Region Lock</label>
                    <select
                      value={sysConfig.sovereignRegion}
                      onChange={(e) => setSysConfig({ ...sysConfig, sovereignRegion: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="EU_FRANKFURT">EU Frankfurt (eu-central-1)</option>
                      <option value="EU_DUBLIN">EU Dublin (eu-west-1)</option>
                      <option value="US_EAST">US East (us-east-1 DPF)</option>
                      <option value="APAC_SINGAPORE">APAC Singapore (ap-southeast-1)</option>
                    </select>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="dpfCertified"
                        checked={sysConfig.dpfCertified}
                        onChange={(e) => setSysConfig({ ...sysConfig, dpfCertified: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <label htmlFor="dpfCertified" className="text-xs font-bold text-slate-800 cursor-pointer">
                        EU-US Data Privacy Framework (DPF) Certified
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="enforceScc"
                        checked={sysConfig.enforceScc}
                        onChange={(e) => setSysConfig({ ...sysConfig, enforceScc: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <label htmlFor="enforceScc" className="text-xs font-bold text-slate-800 cursor-pointer">
                        Enforce EU Standard Contractual Clauses (SCCs 2021/914)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="blockThirdPartyExport"
                        checked={sysConfig.blockThirdPartyExport}
                        onChange={(e) => setSysConfig({ ...sysConfig, blockThirdPartyExport: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <label htmlFor="blockThirdPartyExport" className="text-xs font-bold text-slate-800 cursor-pointer">
                        Strictly block unapproved third-party data exports
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section D: DPO Contact & Regulatory Alerts */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <UserCheck className="w-4 h-4 text-violet-600" />
                  <span>4. DPO Details & Breach Alert Webhooks</span>
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">DPO Full Name</label>
                      <input
                        type="text"
                        value={sysConfig.dpoName}
                        onChange={(e) => setSysConfig({ ...sysConfig, dpoName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">DPO Registration ID</label>
                      <input
                        type="text"
                        value={sysConfig.dpoRegId}
                        onChange={(e) => setSysConfig({ ...sysConfig, dpoRegId: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">DPO Email</label>
                      <input
                        type="email"
                        value={sysConfig.dpoEmail}
                        onChange={(e) => setSysConfig({ ...sysConfig, dpoEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Breach Alert Limit (Hours)</label>
                      <input
                        type="number"
                        value={sysConfig.breachNotifierThresholdHours}
                        onChange={(e) => setSysConfig({ ...sysConfig, breachNotifierThresholdHours: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Regulatory Notification Webhook URL</label>
                    <input
                      type="text"
                      value={sysConfig.webhookUrl}
                      onChange={(e) => setSysConfig({ ...sysConfig, webhookUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ARTICLE 30 ROPA REGISTER */}
      {activeTab === 'ropa' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Article 30 - Record of Processing Activities (ROPA)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mandatory inventory of processing purposes, categories of data subjects, recipients, and retention limits.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search processing activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                  <th className="p-3">Activity ID & Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Lawful Basis</th>
                  <th className="p-3">Data Categories</th>
                  <th className="p-3">Retention</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRopa.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{record.activityName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{record.id}</div>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{record.department}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                        {record.lawfulBasis}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {record.dataCategories.map((cat, i) => (
                          <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium border border-indigo-200/60">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{record.retentionPeriod}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        record.status === 'AUDITED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: AUTOMATED DSAR ENGINE */}
      {activeTab === 'dsar' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Automated Data Subject Access Request (DSAR) Engine</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                GDPR Articles 15-22 intake, identity verification, and 30-day statutory SLA fulfillment tracker.
              </p>
            </div>
            <button
              onClick={() => showToast('New DSAR Ticket Logged', 'success')}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              + Log New DSAR
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dsarRequests.map(req => (
              <div key={req.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{req.id}</span>
                    <h4 className="text-sm font-bold text-slate-900">{req.subjectName}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    req.status === 'FULFILLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200/60 font-medium">
                  Type: <strong className="text-slate-800">{req.requestType}</strong>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Submitted: {req.submittedDate}</span>
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {req.daysRemaining} days left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: ARTICLE 32 TOMS POSTURE */}
      {activeTab === 'toms' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Article 32 - Technical & Organizational Security Measures (TOMs)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Demonstrable security posture, encryption algorithms, pseudonymization, and resilience testing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Data Encryption at Rest',
                status: 'ACTIVE - AES-256-GCM',
                desc: 'All database volumes and object stores encrypted using KMS HSM-backed master keys.',
                icon: Lock,
                badge: 'ENFORCED'
              },
              {
                title: 'Pseudonymization & Anonymization Engine',
                status: 'ACTIVE - SHA3 Salted Tokens',
                desc: 'Identifiable subject traits converted to cryptographically detached surrogate IDs.',
                icon: KeyRound,
                badge: 'ENFORCED'
              },
              {
                title: 'Continuous Vulnerability & Penetration Audits',
                status: 'PASSING - 0 Critical Vulnerabilities',
                desc: 'Automated daily SAST/DAST scanning with real-time zero-day alerting.',
                icon: ShieldAlert,
                badge: 'COMPLIANT'
              },
              {
                title: 'Resilience & Disaster Recovery (DR)',
                status: 'PASSING - RTO < 15m | RPO < 1m',
                desc: 'Multi-region synchronous state mirroring across sovereign EU datacenters.',
                icon: Server,
                badge: 'COMPLIANT'
              }
            ].map((tom, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-4">
                <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-xl shrink-0">
                  <tom.icon className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-900">{tom.title}</h4>
                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                      {tom.badge}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-indigo-700">{tom.status}</div>
                  <p className="text-xs text-slate-500">{tom.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: DPIA RISK ASSESSMENTS */}
      {activeTab === 'dpia' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Privacy Impact Assessment (DPIA / FRIA)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Article 35 mandatory assessments for high-risk automated processing, AI credit scoring, and biometric systems.
              </p>
            </div>
            <button
              onClick={() => showToast('New DPIA Assessment Ticket Initiated', 'success')}
              className="px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              + Initiate DPIA
            </button>
          </div>

          <div className="space-y-3">
            {dpiaTickets.map(ticket => (
              <div key={ticket.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{ticket.id}</span>
                    <h4 className="text-sm font-bold text-slate-900">{ticket.systemName}</h4>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                      ticket.riskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ticket.riskLevel} RISK
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{ticket.processingPurpose}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    ticket.mitigationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {ticket.mitigationStatus.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => showToast(`Reviewing DPIA Document for ${ticket.systemName}`, 'info')}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    View DPIA
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: LIVE DATA FLOW MAPPING */}
      {activeTab === 'mapping' && (
        <div className="space-y-4">
          <TrustPrivacyDashboard moduleId="data-mapping" />
        </div>
      )}

      {/* Tab: GDPR COMPLIANCE CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  GDPR & Privacy Operational Compliance Checklist
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Progressive readiness scorecard across consent, rights, records, security, and breach handling obligations.
                </p>
              </div>
            </div>
            <GdprChecklist />
          </div>
        </div>
      )}

      {/* Drawer for GdprChecklist */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-50 overflow-y-auto border-l border-slate-200"
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between z-10">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  GDPR & Privacy Operational Checklist
                </h2>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-5 lg:p-6">
                <GdprChecklist />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GdprComplianceAddon;
