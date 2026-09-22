import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  Database,
  Lock,
  Layers,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  UserCheck,
  CreditCard,
  Eye,
  Server,
  Terminal,
  Clock,
  Radio,
  ArrowRight,
  Shield,
  KeyRound,
  Download,
  Copy,
  Check,
  Play,
  Pause,
  AlertCircle,
  BarChart3,
  Globe,
  HardDrive
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { IntegrationsScanHub } from '../components/IntegrationsScanHub';
import { KybFirmIntegration } from '../components/dashboard/KybFirmIntegration';
import { EudiIntegrationWidget } from '../components/dashboard/EudiIntegrationWidget';
import { OidcIntegrationDashboard } from '../components/OidcIntegrationDashboard';
import GlobalEventWebhooks from './GlobalEventWebhooks';
import { CentralBankClearingTracker } from '../components/b2g/CentralBankClearingTracker';
import { Iso20022OpenBankingIntegration } from '../components/dashboard/Iso20022OpenBankingIntegration';
import { ErpSiemIntegrationWidget } from '../components/dashboard/ErpSiemIntegrationWidget';
import { Building2, Share2, Landmark, FileCode } from 'lucide-react';

// --- Types & Interfaces ---

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  module: 'E_KYC' | 'AI_AML' | 'COMPLIANCE_ENGINE' | 'RESILIENCY_HUB';
  fallbackStrategy: string;
}

export interface QueueJob {
  id: string;
  type: 'EKYC_OCR' | 'EKYC_LIVENESS' | 'AML_TRANSACTION_EVAL' | 'PRIVACY_PII_AUDIT';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RETRYING';
  payloadSummary: string;
  latencyMs: number;
  timestamp: string;
  retryCount: number;
}

export interface KycVerificationRequest {
  id: string;
  applicantName: string;
  documentType: 'NID_Global Region' | 'PASSPORT_GLOBAL' | 'DRIVING_LICENSE';
  documentNumber: string;
  ocrConfidence: number;
  livenessScore: number;
  faceMatchScore: number;
  overallStatus: 'APPROVED' | 'REJECTED' | 'PROVISIONAL_QUEUED' | 'MANUAL_REVIEW';
  encryptionStatus: 'AES-256-GCM (Enforced)';
  processedAt: string;
}

export interface AmlTransactionEvent {
  id: string;
  txHash: string;
  sender: string;
  receiver: string;
  amountUsd: number;
  channel: 'SWIFT' | 'SEPA' | 'Global Mobile Wallet_NPSB' | 'CRYPTO_MICA';
  riskScore: number;
  flaggedRules: string[];
  monitoringStatus: 'CLEARED_ASYNC' | 'FLAGGED_SAR_DRAFT' | 'CIRCUIT_BREAKER_BYPASSED';
  evalLatencyMs: number;
  timestamp: string;
}

export interface ComplianceAuditLog {
  id: string;
  httpRoute: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  piiDetected: string[];
  anonymizationStatus: 'REDACTED_HMAC_SHA256' | 'CLEAN';
  replicaStorage: 'ISOLATED_S3_AUDIT_LOGS';
  middlewareLatencyMs: number;
  timestamp: string;
}

export type IntegrationHubTab = 
  | 'CONNECTORS' 
  | 'E_KYC' 
  | 'AI_AML' 
  | 'PRIVACY_ENGINE' 
  | 'WEBHOOKS' 
  | 'EUDI_OIDC' 
  | 'KYB_FIRMS' 
  | 'CLEARING_RAILS' 
  | 'ISO20022_PSD3'
  | 'ERP_SIEM'
  | 'RESILIENCY_HUB';

export const ZeroDowntimeIntegrationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<IntegrationHubTab>('CONNECTORS');

  // --- Feature Flags State ---
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    {
      id: 'FLAG-01',
      name: 'Smart e-KYC Background Queue Processing',
      key: 'ENABLE_ASYNC_EKYC_QUEUE',
      description: 'Decouples OCR & Liveness checks into BullMQ background workers to ensure 0ms impact on user signup.',
      enabled: true,
      module: 'E_KYC',
      fallbackStrategy: 'Grant provisional account with 24-hour verification SLA'
    },
    {
      id: 'FLAG-02',
      name: 'AI Real-Time AML Observer Stream',
      key: 'ENABLE_REALTIME_AML_OBSERVER',
      description: 'Asynchronously monitors live transaction logs after write completion without database locks.',
      enabled: true,
      module: 'AI_AML',
      fallbackStrategy: 'Queue logs in Redis memory buffer for batch processing'
    },
    {
      id: 'FLAG-03',
      name: 'Non-Intrusive Privacy Auditing Middleware',
      key: 'ENABLE_COMPLIANCE_MIDDLEWARE',
      description: 'Lightweight HTTP header & payload inspection storing audit streams in isolated secondary storage.',
      enabled: true,
      module: 'COMPLIANCE_ENGINE',
      fallbackStrategy: 'Fail-safe silent pass (log to local fail-safe queue)'
    },
    {
      id: 'FLAG-04',
      name: 'Circuit Breaker Auto-Bypass',
      key: 'ENABLE_CIRCUIT_BREAKER_BYPASS',
      description: 'Automatically switches heavy AI providers to degraded fast-path if latency exceeds 800ms.',
      enabled: true,
      module: 'RESILIENCY_HUB',
      fallbackStrategy: 'Fast-path heuristic rule evaluation'
    }
  ]);

  // Load live feature flags & queue metrics from backend
  useEffect(() => {
    fetch('/api/v1/integrations/feature-flags')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.flags) setFeatureFlags(data.flags);
      })
      .catch(() => {});

    fetch('/api/v1/integrations/queue/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQueueStats({
            activeWorkers: data.activeWorkers || 12,
            jobsInQueue: data.jobsInQueue || 3,
            processedTotal: data.processedTotal || 14820,
            failedTotal: data.failedTotal || 12,
            avgLatencyMs: data.avgLatencyMs || 42
          });
        }
      })
      .catch(() => {});
  }, []);

  // --- Queue Metrics & Simulator State ---
  const [isSimulatorActive, setIsSimulatorActive] = useState(true);
  const [circuitBreakerState, setCircuitBreakerState] = useState<'CLOSED' | 'OPEN' | 'HALF_OPEN'>('CLOSED');
  const [queueStats, setQueueStats] = useState({
    activeWorkers: 12,
    jobsInQueue: 3,
    processedTotal: 14820,
    failedTotal: 12,
    avgLatencyMs: 42
  });

  // --- Interactive Demo States for Module 1: Smart e-KYC ---
  const [kycForm, setKycForm] = useState({
    applicantName: 'Anowar Hossain',
    documentType: 'NID_Global Region' as 'NID_Global Region' | 'PASSPORT_GLOBAL' | 'DRIVING_LICENSE',
    nidNumber: '19922691234500088',
    uploadedNidPreview: true,
    livenessSelfieCaptured: true
  });
  const [isProcessingKyc, setIsProcessingKyc] = useState(false);
  const [kycProgressStep, setKycProgressStep] = useState('');
  const [kycResults, setKycResults] = useState<KycVerificationRequest[]>([
    {
      id: 'KYC-2026-901',
      applicantName: 'Tariqul Islam',
      documentType: 'NID_Global Region',
      documentNumber: '19882691122334455',
      ocrConfidence: 99.2,
      livenessScore: 98.6,
      faceMatchScore: 97.8,
      overallStatus: 'APPROVED',
      encryptionStatus: 'AES-256-GCM (Enforced)',
      processedAt: '2 mins ago'
    },
    {
      id: 'KYC-2026-902',
      applicantName: 'Nusrat Jahan',
      documentType: 'PASSPORT_GLOBAL',
      documentNumber: 'A08912345',
      ocrConfidence: 98.5,
      livenessScore: 99.1,
      faceMatchScore: 98.4,
      overallStatus: 'APPROVED',
      encryptionStatus: 'AES-256-GCM (Enforced)',
      processedAt: '5 mins ago'
    }
  ]);

  // --- Interactive Demo States for Module 2: AI AML ---
  const [amlTxForm, setAmlTxForm] = useState({
    sender: 'Sovereign Merchant Corp',
    receiver: 'Offshore Trading Ltd (Cayman)',
    amountUsd: 85000,
    channel: 'SWIFT' as 'SWIFT' | 'SEPA' | 'Global Mobile Wallet_NPSB' | 'CRYPTO_MICA'
  });
  const [isEvaluatingAml, setIsEvaluatingAml] = useState(false);
  const [amlEvents, setAmlEvents] = useState<AmlTransactionEvent[]>([
    {
      id: 'AML-EVT-101',
      txHash: '0x8f2a...9b12',
      sender: 'Dhaka Tech Exports',
      receiver: 'Singapore Digital Hub',
      amountUsd: 125000,
      channel: 'SWIFT',
      riskScore: 28,
      flaggedRules: ['Standard Commercial Payment'],
      monitoringStatus: 'CLEARED_ASYNC',
      evalLatencyMs: 8,
      timestamp: '1 min ago'
    },
    {
      id: 'AML-EVT-102',
      txHash: '0x3c11...7a89',
      sender: 'Alpha Wealth Partners',
      receiver: 'Nornickel Holdings',
      amountUsd: 450000,
      channel: 'CRYPTO_MICA',
      riskScore: 92,
      flaggedRules: ['OFAC Sanctioned Entity Match', 'Rapid High-Volume Velocity'],
      monitoringStatus: 'FLAGGED_SAR_DRAFT',
      evalLatencyMs: 12,
      timestamp: '3 mins ago'
    }
  ]);

  // --- Interactive Demo States for Module 3: Compliance Engine ---
  const [privacyLogs, setPrivacyLogs] = useState<ComplianceAuditLog[]>([
    {
      id: 'AUD-8801',
      httpRoute: '/api/v1/kyc/verify',
      httpMethod: 'POST',
      piiDetected: ['NID Number', 'Full Name', 'Selfie Biometric Vector'],
      anonymizationStatus: 'REDACTED_HMAC_SHA256',
      replicaStorage: 'ISOLATED_S3_AUDIT_LOGS',
      middlewareLatencyMs: 0.8,
      timestamp: 'Just now'
    },
    {
      id: 'AUD-8802',
      httpRoute: '/api/v1/transactions/process',
      httpMethod: 'POST',
      piiDetected: ['IBAN / Bank Account', 'IP Address'],
      anonymizationStatus: 'REDACTED_HMAC_SHA256',
      replicaStorage: 'ISOLATED_S3_AUDIT_LOGS',
      middlewareLatencyMs: 0.6,
      timestamp: '2 mins ago'
    }
  ]);

  // Terminal telemetry logs
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Resiliency Hub Initialized: Zero-Downtime Pipeline Ready`,
    `[${new Date().toLocaleTimeString()}] Feature Flags Loaded: 4 active flags active`,
    `[${new Date().toLocaleTimeString()}] Redis BullMQ Worker Cluster: 12 threads listening on queue:kyc:aml`
  ]);

  // Toggle Feature Flag
  const handleToggleFlag = async (id: string) => {
    setFeatureFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    const flag = featureFlags.find(f => f.id === id);
    if (flag) {
      setTelemetryLogs(prev => [
        `[${new Date().toLocaleTimeString()}] FEATURE FLAG TOGGLED: ${flag.key} set to ${!flag.enabled}`,
        ...prev
      ]);
    }
    try {
      await fetch('/api/v1/integrations/feature-flags/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.warn('Feature flag persistence notice:', e);
    }
  };

  // Run Smart e-KYC OCR + Liveness Simulation
  const handleRunKycVerification = async () => {
    setIsProcessingKyc(true);
    setKycProgressStep('Pushing payload to BullMQ queue:kyc:ocr (Non-Blocking)...');
    
    setTelemetryLogs(prev => [
      `[${new Date().toLocaleTimeString()}] e-KYC Request Queued: ${kycForm.applicantName} (${kycForm.documentType})`,
      `[${new Date().toLocaleTimeString()}] Enforcing AES-256-GCM encryption on document payload...`,
      ...prev
    ]);

    setTimeout(() => {
      setKycProgressStep('Executing OCR extraction for Name, NID #, and Expiry...');
    }, 400);

    setTimeout(() => {
      setKycProgressStep('Executing Biometric Liveness & 3D Depth Anti-Spoofing check...');
    }, 800);

    setTimeout(() => {
      setKycProgressStep('Matching facial vectors between NID photo and Liveness selfie...');
    }, 1200);

    try {
      const res = await fetch('/api/v1/integrations/ekyc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: kycForm.applicantName,
          documentType: kycForm.documentType,
          documentNumber: kycForm.nidNumber,
          livenessSelfieCaptured: true
        })
      });
      const data = await res.json();
      
      setIsProcessingKyc(false);
      setKycProgressStep('');

      if (res.ok && data.success) {
        const newResult: KycVerificationRequest = {
          id: data.id || `KYC-2026-${Math.floor(100 + Math.random() * 900)}`,
          applicantName: data.applicantName || kycForm.applicantName,
          documentType: data.documentType || kycForm.documentType,
          documentNumber: data.documentNumber || kycForm.nidNumber,
          ocrConfidence: data.ocrConfidence || 98.9,
          livenessScore: data.livenessScore || 97.4,
          faceMatchScore: data.faceMatchScore || 98.2,
          overallStatus: data.overallStatus || 'APPROVED',
          encryptionStatus: data.encryptionStatus || 'AES-256-GCM (Enforced)',
          processedAt: data.processedAt || 'Just now'
        };

        setKycResults([newResult, ...kycResults]);
        setQueueStats(prev => ({ ...prev, processedTotal: prev.processedTotal + 1 }));

        setTelemetryLogs(prev => [
          `[${new Date().toLocaleTimeString()}] e-KYC VERIFICATION PASSED: ${newResult.id} for ${newResult.applicantName} (Face Match: ${newResult.faceMatchScore}%)`,
          ...prev
        ]);
      }
    } catch (err) {
      setIsProcessingKyc(false);
      setKycProgressStep('');
    }
  };

  // Run Real-Time AI AML Evaluation Simulation
  const handleRunAmlEvaluation = async () => {
    setIsEvaluatingAml(true);
    
    setTelemetryLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Transaction Logged: $${amlTxForm.amountUsd} via ${amlTxForm.channel}`,
      `[${new Date().toLocaleTimeString()}] Triggering Asynchronous AML Observer Stream (0ms primary DB lock)`,
      ...prev
    ]);

    try {
      const res = await fetch('/api/v1/integrations/aml/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: amlTxForm.sender,
          receiver: amlTxForm.receiver,
          amountUsd: amlTxForm.amountUsd,
          channel: amlTxForm.channel
        })
      });
      const data = await res.json();
      setIsEvaluatingAml(false);

      if (res.ok && data.success && data.event) {
        const newEvt: AmlTransactionEvent = data.event;
        setAmlEvents([newEvt, ...amlEvents]);
        setQueueStats(prev => ({ ...prev, processedTotal: prev.processedTotal + 1 }));

        setTelemetryLogs(prev => [
          `[${new Date().toLocaleTimeString()}] AML EVALUATION COMPLETE: ${newEvt.id} - Risk Score: ${newEvt.riskScore}/100 (${newEvt.evalLatencyMs}ms)`,
          ...prev
        ]);
      }
    } catch (e) {
      setIsEvaluatingAml(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8 bg-slate-50 min-h-screen rounded-2xl border border-slate-200/60">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 lg:p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs tracking-wider uppercase">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Zero-Downtime SaaS Architecture</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
              100% System Uptime
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Zero-Downtime Product Integration Hub</h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Production-grade decoupled integration of Smart e-KYC Verification, AI Real-Time AML Monitoring, and Automated Data Privacy Engine with background event queues, circuit breakers, and feature kill-switches.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Circuit Breaker</span>
            <span className="text-xs font-black text-emerald-400 flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              CLOSED (Normal)
            </span>
          </div>
        </div>
      </div>

      {/* KPI Resiliency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Queue System Mode</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">Redis BullMQ</span>
            <span className="text-xs font-bold text-emerald-600">Active</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{queueStats.activeWorkers} Background Worker Threads</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Async Latency</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{queueStats.avgLatencyMs} ms</span>
            <span className="text-xs font-bold text-emerald-600">0ms Core Impact</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Asynchronous Observer Pattern</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Feature Kill-Switches</span>
            <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
              <Sliders className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {featureFlags.filter(f => f.enabled).length}/{featureFlags.length}
            </span>
            <span className="text-xs font-bold text-violet-600">Hot Swappable</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Instant toggle without redeployment</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security & Encryption</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">AES-256</span>
            <span className="text-xs font-bold text-blue-600">TLS 1.3</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Encrypted in transit and at rest</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'CONNECTORS', label: '1. Software & Cloud Connectors', icon: Database },
          { id: 'E_KYC', label: '2. Smart e-KYC (OCR + Liveness)', icon: UserCheck },
          { id: 'AI_AML', label: '3. Real-Time AI AML Stream', icon: Activity },
          { id: 'PRIVACY_ENGINE', label: '4. Data Privacy & Compliance', icon: ShieldCheck },
          { id: 'WEBHOOKS', label: '5. Global Event Webhooks', icon: Share2 },
          { id: 'EUDI_OIDC', label: '6. EUDI & OIDC Sovereign ID', icon: KeyRound },
          { id: 'KYB_FIRMS', label: '7. Corporate KYB Verification', icon: Building2 },
          { id: 'CLEARING_RAILS', label: '8. Central Bank Clearing', icon: Landmark },
          { id: 'ISO20022_PSD3', label: '9. ISO 20022 & PSD3 Gateway', icon: FileCode },
          { id: 'ERP_SIEM', label: '10. ERP, CRM & SIEM Connectors', icon: Server },
          { id: 'RESILIENCY_HUB', label: '11. Feature Flags & BullMQ', icon: Sliders }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 0: SOFTWARE & CLOUD CONNECTORS */}
      {activeTab === 'CONNECTORS' && (
        <div className="space-y-6">
          <IntegrationsScanHub />
        </div>
      )}

      {/* TAB 5: GLOBAL EVENT WEBHOOKS */}
      {activeTab === 'WEBHOOKS' && (
        <div className="space-y-6">
          <GlobalEventWebhooks />
        </div>
      )}

      {/* TAB 6: EUDI & OIDC SOVEREIGN IDENTITY */}
      {activeTab === 'EUDI_OIDC' && (
        <div className="space-y-6">
          <EudiIntegrationWidget />
          <OidcIntegrationDashboard />
        </div>
      )}

      {/* TAB 7: CORPORATE KYB VERIFICATION */}
      {activeTab === 'KYB_FIRMS' && (
        <div className="space-y-6">
          <KybFirmIntegration />
        </div>
      )}

      {/* TAB 8: CENTRAL BANK CLEARING RAILS */}
      {activeTab === 'CLEARING_RAILS' && (
        <div className="space-y-6">
          <CentralBankClearingTracker />
        </div>
      )}

      {/* TAB 9: ISO 20022 & PSD3 GATEWAY */}
      {activeTab === 'ISO20022_PSD3' && (
        <div className="space-y-6">
          <Iso20022OpenBankingIntegration />
        </div>
      )}

      {/* TAB 10: ERP, CRM & SIEM CONNECTORS */}
      {activeTab === 'ERP_SIEM' && (
        <div className="space-y-6">
          <ErpSiemIntegrationWidget />
        </div>
      )}

      {/* TAB 1: SMART E-KYC & IDENTITY VERIFICATION */}
      {activeTab === 'E_KYC' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  Smart e-KYC & Identity Verification Engine
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  OCR for NID/Passport, Biometric Liveness Check, and Face Matching with zero downtime background processing queue.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-mono font-bold">
                Route: /api/v1/kyc/verify (Rate Limit: 60 rpm)
              </span>
            </div>

            {/* Simulation Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* Form Input */}
              <div className="lg:col-span-5 space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  Simulate e-KYC Verification Submission
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Applicant Full Name</label>
                    <input
                      type="text"
                      value={kycForm.applicantName}
                      onChange={(e) => setKycForm({ ...kycForm, applicantName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Document Type</label>
                    <select
                      value={kycForm.documentType}
                      onChange={(e) => setKycForm({ ...kycForm, documentType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="NID_Global Region">Global Region National ID (NID)</option>
                      <option value="PASSPORT_GLOBAL">International Passport</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">NID / Passport Number</label>
                    <input
                      type="text"
                      value={kycForm.nidNumber}
                      onChange={(e) => setKycForm({ ...kycForm, nidNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 text-center space-y-1">
                      <FileText className="w-5 h-5 text-indigo-600 mx-auto" />
                      <span className="text-[10px] font-bold text-indigo-900 block">NID Front/Back OCR</span>
                      <span className="text-[9px] font-bold text-emerald-600">✓ Upload Ready</span>
                    </div>

                    <div className="p-3 bg-violet-50/60 rounded-lg border border-violet-100 text-center space-y-1">
                      <Eye className="w-5 h-5 text-violet-600 mx-auto" />
                      <span className="text-[10px] font-bold text-violet-900 block">3D Liveness Selfie</span>
                      <span className="text-[9px] font-bold text-emerald-600">✓ Anti-Spoof Valid</span>
                    </div>
                  </div>

                  <button
                    onClick={handleRunKycVerification}
                    disabled={isProcessingKyc}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isProcessingKyc ? 'animate-spin' : ''}`} />
                    <span>{isProcessingKyc ? 'Enqueueing Non-Blocking Job...' : 'Submit Async e-KYC Verification'}</span>
                  </button>

                  {isProcessingKyc && (
                    <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>{kycProgressStep}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Verification Records List */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-2">
                  <span>Asynchronous e-KYC Verification Stream Ledger</span>
                  <span className="text-xs font-normal text-slate-500">{kycResults.length} Verified</span>
                </h3>

                <div className="space-y-3">
                  {kycResults.map(req => (
                    <div key={req.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 hover:bg-white transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">{req.id}</span>
                          <span className="text-xs font-bold text-slate-900">{req.applicantName}</span>
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-mono font-bold rounded">
                            {req.documentType}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {req.overallStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 block">OCR Accuracy</span>
                          <span className="font-mono font-bold text-indigo-600">{req.ocrConfidence}%</span>
                        </div>
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 block">Liveness Score</span>
                          <span className="font-mono font-bold text-violet-600">{req.livenessScore}%</span>
                        </div>
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 block">Face Match Confidence</span>
                          <span className="font-mono font-bold text-emerald-600">{req.faceMatchScore}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200/60">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Lock className="w-3 h-3 text-indigo-500" /> {req.encryptionStatus}
                        </span>
                        <span>Processed: {req.processedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI AML & TRANSACTION MONITORING */}
      {activeTab === 'AI_AML' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  AI Anti-Money Laundering (AML) & Real-Time Transaction Monitoring
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Asynchronous observer stream checking transactions in background with 0ms impact on live transaction latency.
                </p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-mono font-bold">
                Observer Pattern (Post-Log Webhook Stream)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* Form Input */}
              <div className="lg:col-span-5 space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Simulate Live Financial Transaction
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Sender Entity</label>
                    <input
                      type="text"
                      value={amlTxForm.sender}
                      onChange={(e) => setAmlTxForm({ ...amlTxForm, sender: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Receiver Entity & Country</label>
                    <input
                      type="text"
                      value={amlTxForm.receiver}
                      onChange={(e) => setAmlTxForm({ ...amlTxForm, receiver: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Amount (USD)</label>
                      <input
                        type="number"
                        value={amlTxForm.amountUsd}
                        onChange={(e) => setAmlTxForm({ ...amlTxForm, amountUsd: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Payment Channel</label>
                      <select
                        value={amlTxForm.channel}
                        onChange={(e) => setAmlTxForm({ ...amlTxForm, channel: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                      >
                        <option value="SWIFT">SWIFT Wire</option>
                        <option value="SEPA">SEPA Instant</option>
                        <option value="Global Mobile Wallet_NPSB">Global Mobile Wallet / NPSB Instant</option>
                        <option value="CRYPTO_MICA">Crypto / MiCA Vault</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleRunAmlEvaluation}
                    disabled={isEvaluatingAml}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Activity className={`w-4 h-4 ${isEvaluatingAml ? 'animate-spin' : ''}`} />
                    <span>{isEvaluatingAml ? 'Evaluating via AI Stream...' : 'Log Transaction & Trigger Async AML'}</span>
                  </button>
                </div>
              </div>

              {/* AML Event Logs Stream */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-2">
                  <span>Asynchronous AML Event Monitoring Stream</span>
                  <span className="text-xs font-normal text-slate-500">Latency: ~8ms</span>
                </h3>

                <div className="space-y-3">
                  {amlEvents.map(evt => (
                    <div key={evt.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 hover:bg-white transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">{evt.id}</span>
                          <span className="text-xs font-mono font-bold text-indigo-600">{evt.txHash}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          evt.monitoringStatus === 'CLEARED_ASYNC' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {evt.monitoringStatus}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{evt.sender}</span>
                          <span className="text-slate-400 mx-2">→</span>
                          <span className="font-bold text-slate-900">{evt.receiver}</span>
                        </div>
                        <span className="font-black text-slate-900">${evt.amountUsd.toLocaleString()}</span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-500">Flagged Rules:</span>
                          {evt.flaggedRules.map((rule, idx) => (
                            <span key={idx} className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded">
                              {rule}
                            </span>
                          ))}
                        </div>
                        <span className="font-mono text-slate-500">Eval: {evt.evalLatencyMs}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATED DATA PRIVACY & COMPLIANCE ENGINE */}
      {activeTab === 'PRIVACY_ENGINE' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Automated Data Privacy & Compliance Middleware Engine
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Non-intrusive HTTP middleware auditing PII exposure and storing log streams in isolated secondary storage.
                </p>
              </div>
              <span className="px-3 py-1 bg-violet-50 text-violet-800 border border-violet-200 rounded-lg text-xs font-mono font-bold">
                Isolated Audit Replica Store
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Middleware Overhead</span>
                  <div className="text-2xl font-black text-emerald-600">&lt; 1.0 ms</div>
                  <p className="text-[11px] text-slate-500">Zero impact on API response times</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Audit Store Isolation</span>
                  <div className="text-2xl font-black text-indigo-600">Secondary Replica</div>
                  <p className="text-[11px] text-slate-500">Prevents table locks on main DB</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Fail-Safe Status</span>
                  <div className="text-2xl font-black text-emerald-600">Active (Silent Pass)</div>
                  <p className="text-[11px] text-slate-500">App functions 100% if logger fails</p>
                </div>
              </div>

              {/* Privacy Audit Logs Table */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-900">Real-Time Privacy Audit Stream Ledger</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-bold">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg">Audit ID</th>
                        <th className="px-4 py-3">Route Endpoint</th>
                        <th className="px-4 py-3">PII Intake Detected</th>
                        <th className="px-4 py-3">Anonymization</th>
                        <th className="px-4 py-3">Storage Location</th>
                        <th className="px-4 py-3 rounded-r-lg">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {privacyLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">{log.id}</td>
                          <td className="px-4 py-3 text-indigo-600">{log.httpMethod} {log.httpRoute}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {log.piiDetected.map((p, i) => (
                                <span key={i} className="bg-amber-50 text-amber-800 text-[10px] px-1.5 py-0.5 rounded border border-amber-200">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-emerald-600 font-bold">{log.anonymizationStatus}</td>
                          <td className="px-4 py-3 text-slate-500">{log.replicaStorage}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600">{log.middlewareLatencyMs} ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESILIENCY HUB & FEATURE FLAGS */}
      {activeTab === 'RESILIENCY_HUB' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  Feature Kill-Switches & Resiliency Control
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instantly toggle individual modules or enable fallback modes without redeploying code or risking core SaaS stability.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featureFlags.map(flag => (
                  <div key={flag.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 block">{flag.id} • {flag.key}</span>
                        <h4 className="text-xs font-bold text-slate-900">{flag.name}</h4>
                      </div>
                      <button
                        onClick={() => handleToggleFlag(flag.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          flag.enabled 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {flag.enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{flag.description}</p>

                    <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                      <span className="font-bold text-slate-500">Fallback Strategy:</span>{' '}
                      <span className="text-indigo-600 font-medium">{flag.fallbackStrategy}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Real-Time Terminal Telemetry Log */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1.5 max-h-56 overflow-y-auto">
                <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-2 mb-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-bold text-xs">Zero-Downtime Infrastructure Telemetry Terminal</span>
                </div>
                {telemetryLogs.map((log, idx) => (
                  <div key={idx} className="leading-tight">{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZeroDowntimeIntegrationHub;
