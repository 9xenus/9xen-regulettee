import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { ComplianceRiskDashboard } from '../components/ComplianceRiskDashboard';
import { 
  Search, 
  ShieldAlert, 
  Globe, 
  ExternalLink,
  Loader2,
  CheckCircle2,
  Zap,
  AlertTriangle,
  History,
  ArrowRight,
  ShieldCheck,
  Activity,
  FileText,
  MousePointer2,
  Lock,
  DollarSign,
  Gavel,
  RefreshCw,
  XCircle,
  Clock,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Tooltip
} from 'recharts';

interface PiiFound {
  type: string;
  value: string;
  context: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface TrackerFound {
  name: string;
  type: string;
  domain: string;
  description: string;
  link?: string;
}

interface RegulatoryViolation {
  id: string;
  law: string;
  article: string;
  issue: string;
  cause: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  penaltyEstimate: number;
  isAutoFixable: boolean;
  remediationStep: string;
}

interface SovereigntyNode {
  country: string;
  region: string;
  dataTypes: string[];
  adequacyStatus: 'ADEQUATE' | 'RESTRICTED' | 'NON_COMPLIANT';
}

interface ScraperResult {
  url: string;
  timestamp: string;
  summary: string;
  piiFound: PiiFound[];
  trackersFound: TrackerFound[];
  sovereigntyMap: SovereigntyNode[];
  riskScore: number;
  violations?: RegulatoryViolation[];
}

import { useJurisdiction } from '../context/JurisdictionContext';
import { useNotification } from '../context/NotificationContext';

// ... (other imports)

import { useEurLexScraperAlerts } from '../hooks/useEurLexScraperAlerts';

export const ComplianceScraper: React.FC = () => {
  const { jurisdiction } = useJurisdiction();
  useEurLexScraperAlerts();
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanScope, setScanScope] = useState<'standard' | 'deep'>('standard');
  const [activeSubscriptions, setActiveSubscriptions] = useState<string[]>(['ecommerce', 'education']);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<{
    addonId: string;
    addonName: string;
    price: string;
    violationId: string;
    policyIntegrated: string;
  } | null>(null);

  const [activeView, setActiveView] = useState<'audit' | 'map' | 'roadmap'>('audit');
  const [result, setResult] = useState<ScraperResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useNotification();
  const [remediating, setRemediating] = useState<string | null>(null);
  const [fixedViolations, setFixedViolations] = useState<string[]>([]);
  const [scanHistory, setScanHistory] = useState<ScraperResult[]>([]);

  // Mapping from violations to their required subscription package
  const VIOLATION_SUBSCRIPTION_MAP: Record<string, { addonId: string; addonName: string; price: string; policyIntegrated: string }> = {
    'V-DORA-ERP': {
      addonId: 'fintech_pro',
      addonName: 'Financial & Crypto Enclave',
      price: '€290/month',
      policyIntegrated: 'DORA & AMLD6 Regulatory Compliance'
    },
    'V-PCI-DSS': {
      addonId: 'fintech_pro',
      addonName: 'Financial & Crypto Enclave',
      price: '€290/month',
      policyIntegrated: 'PCI-DSS Data Protection & DORA'
    },
    'V-SOV-SF': {
      addonId: 'enterprise',
      addonName: 'Sovereign Multi-Region Enclave',
      price: '€890/month',
      policyIntegrated: 'GDPR Article 9 & Cross-Border Sovereign Residency'
    },
    'V-AI-PROHIBITED': {
      addonId: 'enterprise_ai',
      addonName: 'Enterprise AI & Algorithmic Conformity',
      price: '€450/month',
      policyIntegrated: 'EU AI Act Article 5 Prohibited Systems Verification'
    }
  };

  const generateViolations = (res: any): RegulatoryViolation[] => {
    const list: RegulatoryViolation[] = [];
    
    if (res.piiFound?.length > 0 && (jurisdiction === 'GDPR')) {
      list.push({
        id: 'V-GDPR-32',
        law: 'GDPR (EU) 2016/679',
        article: 'Article 32 - Security of Processing',
        issue: 'Exposure of Sensitive Personal Identifiers',
        cause: `Clear-text harvesting of ${res.piiFound.length} identity markers (emails/hashes) detected in public DOM segments.`,
        severity: 'CRITICAL',
        penaltyEstimate: 2450000,
        isAutoFixable: true,
        remediationStep: 'Enable Field-Level Encryption and rotate PII vault keys.'
      });
    }

    if (res.trackersFound?.length > 0 && (jurisdiction === 'GDPR')) {
      list.push({
        id: 'V-EPRIVACY-5',
        law: 'ePrivacy Directive 2002/58/EC',
        article: 'Article 5(3) - Cookie Consent',
        issue: 'Pre-consent Tracker Initialization',
        cause: `${res.trackersFound.length} tracking pixels found loading before user opt-in (including ${res.trackersFound.map((t: any) => t.name).join(', ')}).`,
        severity: 'HIGH',
        penaltyEstimate: 850000,
        isAutoFixable: true,
        remediationStep: 'Inject Consent Guard middleware to block script execution until explicit opt-in.'
      });
    }

    // Add CCPA/CPRA Violation
    if (jurisdiction === 'CCPA') {
      list.push({
        id: 'V-CCPA-1798',
        law: 'CCPA/CPRA (California)',
        article: '1798.100 - Disclosure of Sale',
        issue: 'Missing "Do Not Sell" Link',
        cause: 'The target domain processes CA resident data but lacks required opt-out links for third-party data sales.',
        severity: 'MEDIUM',
        penaltyEstimate: 7500,
        isAutoFixable: true,
        remediationStep: 'Inject localized CCPA Footer component with explicit opt-out callback.'
      });
    }

    if (res.riskScore > 70 && jurisdiction === 'GDPR') {
      list.push({
        id: 'V-AI-ACT-14',
        law: 'EU AI Act',
        article: 'Article 14 - Human Oversight',
        issue: 'Lack of Algorithmic Transparency Headers',
        cause: 'High-risk automated decision nodes detected without required technical documentation or human oversight markers.',
        severity: 'HIGH',
        penaltyEstimate: 1200000,
        isAutoFixable: false,
        remediationStep: 'Schedule manual algorithmic impact assessment (AIA) with the Compliance Board.'
      });
    }

    // Deep Scan Scope Violations
    if (scanScope === 'deep') {
      list.push({
        id: 'V-DORA-ERP',
        law: 'EU DORA (Regulation EU 2022/2554)',
        article: 'Article 5 - ICT Risk Management',
        issue: 'ERP Database Failover Window Exceeded',
        cause: 'Connected SAP S/4HANA ERP instance cluster failover window is currently configured to 30 seconds. DORA standard mandates a maximum 10-second failover recovery.',
        severity: 'HIGH',
        penaltyEstimate: 350000,
        isAutoFixable: true,
        remediationStep: 'Deploy active clustered replica in Frankfurt (eu-central-1) and update DNS weights for synchronous multi-zone replication.'
      });

      list.push({
        id: 'V-PCI-DSS',
        law: 'PCI-DSS v4.0 Standard',
        article: 'Requirement 3 - Protect Stored Card Data',
        issue: 'Plaintext Credit Card Exposures in CRM Logs',
        cause: 'Raw transaction records in Stripe webhooks synced to Salesforce were found storing credit card account numbers (PAN) without encryption.',
        severity: 'CRITICAL',
        penaltyEstimate: 185000,
        isAutoFixable: true,
        remediationStep: 'Inject automatic tokenization filter on the incoming webhook router and mask credit card fields.'
      });

      list.push({
        id: 'V-SOV-SF',
        law: 'GDPR Article 9 / Sovereign Cloud Bounds',
        article: 'Article 45 - Transborder Sovereign Restrictions',
        issue: 'Sovereign PII Transferred Outside EU Bounds',
        cause: 'Customer database sync pipeline transfers raw biometric templates and biometric transaction hashes directly to US-east-1 storage clusters without adequate eIDAS encryption.',
        severity: 'CRITICAL',
        penaltyEstimate: 500000,
        isAutoFixable: true,
        remediationStep: 'Enforce hardware-bound sovereign cloud isolation. Restrict Salesforce integration storage Strictly to localized European enclaves.'
      });

      list.push({
        id: 'V-AI-PROHIBITED',
        law: 'EU AI Act (Regulation EU 2024/1689)',
        article: 'Article 5 - Prohibited AI Practices',
        issue: 'Unapproved Social Scoring Algorithm Mapped',
        cause: 'Algorithmic code assessment matched cognitive evaluation functions evaluating citizen trustworthiness scoring on the CRM pipeline.',
        severity: 'CRITICAL',
        penaltyEstimate: 1500000,
        isAutoFixable: true,
        remediationStep: 'Disable algorithmic credit scoring weights referencing biometric profiling in production routing modules.'
      });
    }

    return list;
  };


  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetchWithRetry('/api/v1/compliance/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error('Failed to reach scan cluster');
      
      const data = await response.json();
      
      // Inject mock Sovereignty Map
      const sovereigntyMap: SovereigntyNode[] = [
        { country: 'USA', region: 'NA', dataTypes: ['Email', 'Behavioral'], adequacyStatus: 'NON_COMPLIANT' },
        { country: 'Germany', region: 'EU', dataTypes: ['IP Address', 'Auth Logs'], adequacyStatus: 'ADEQUATE' },
        { country: 'Ireland', region: 'EU', dataTypes: ['Payment Data'], adequacyStatus: 'ADEQUATE' },
        { country: 'Brazil', region: 'LATAM', dataTypes: ['Marketing Prefs'], adequacyStatus: 'RESTRICTED' }
      ];

      const violations = generateViolations(data);
      // Recalculate risk score if deep scan is active to reflect ERP/SaaS vulnerabilities
      const adjustedRiskScore = scanScope === 'deep' ? Math.min(95, data.riskScore + 25) : data.riskScore;
      const finalResult = { ...data, riskScore: adjustedRiskScore, violations, sovereigntyMap };
      
      setResult(finalResult);
      setScanHistory(prev => [finalResult, ...prev.slice(0, 9)]);
      showToast(`${scanScope === 'deep' ? 'Deep Infrastructure & ERP' : 'Standard Web'} scan completed successfully.`, 'success');
    } catch (err: any) {
      setError(err.message || 'Deep scan failed');
      showToast(err.message || 'Deep scan failed', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAutoFix = (violationId: string) => {
    // Subscription check: if this violation requires an advanced subscription that is not active, trigger upsell!
    const requiredSub = VIOLATION_SUBSCRIPTION_MAP[violationId];
    if (requiredSub && !activeSubscriptions.includes(requiredSub.addonId)) {
      setUpgradeTarget({
        addonId: requiredSub.addonId,
        addonName: requiredSub.addonName,
        price: requiredSub.price,
        violationId: violationId,
        policyIntegrated: requiredSub.policyIntegrated
      });
      setShowUpgradeModal(true);
      return;
    }

    setRemediating(violationId);
    
    // Simulate remediation logic
    setTimeout(() => {
      setFixedViolations(prev => [...prev, violationId]);
      setRemediating(null);
      showToast('Automated patch successfully applied to connected infrastructure.', 'success');
    }, 2000);
  };

  const handleConfirmUpgrade = () => {
    if (!upgradeTarget) return;
    
    setIsScanning(true); // show brief spinner
    setTimeout(() => {
      setActiveSubscriptions(prev => [...prev, upgradeTarget.addonId]);
      setShowUpgradeModal(false);
      setIsScanning(false);
      showToast(`Successfully subscribed to ${upgradeTarget.addonName}. Advanced Fix Engine is now unlocked!`, 'success');
      
      // Auto-remediate immediately after unlocking
      setRemediating(upgradeTarget.violationId);
      setTimeout(() => {
        setFixedViolations(prev => [...prev, upgradeTarget.violationId]);
        setRemediating(null);
        setUpgradeTarget(null);
        showToast('Automated patch successfully applied with Advanced Fix Engine.', 'success');
      }, 1500);
    }, 1000);
  };

  const totalPenalty = result?.violations?.reduce((acc, v) => 
    fixedViolations.includes(v.id) ? acc : acc + v.penaltyEstimate, 0) || 0;

  const chartData = [
    { name: 'Compliant', value: 100 - (result?.riskScore || 0), color: '#10b981' },
    { name: 'Risk', value: result?.riskScore || 0, color: '#f43f5e' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation / Branding */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                9XEN_REGULETTEE <span className="text-indigo-600">SCRAPER</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Regulatory Forensics v4.2</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 w-full max-w-3xl">
            <form onSubmit={handleScan} className="flex-1 w-full">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={scanScope === 'deep' ? "Enter corporate app URL to scan connected ERP & database integrations" : "Enter website URL for compliance audit (e.g. https://example.com)"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-32 py-3.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none"
                />
                <button
                  type="submit"
                  disabled={isScanning || !url}
                  className="absolute right-2 top-2 bottom-2 px-4 sm:px-6 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
                >
                  {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {isScanning ? 'SCANNING...' : 'SCAN NOW'}
                </button>
              </div>
            </form>

            {/* Premium segmented scope controller */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs w-full sm:w-auto shrink-0 border border-slate-200/50">
              <button
                type="button"
                onClick={() => setScanScope('standard')}
                className={`flex-1 sm:flex-none px-3 py-2 font-bold rounded-lg transition-all ${scanScope === 'standard' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Standard Web
              </button>
              <button
                type="button"
                onClick={() => setScanScope('deep')}
                className={`flex-1 sm:flex-none px-3 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${scanScope === 'deep' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <Activity className="w-3.5 h-3.5" />
                Deep ERP/SaaS
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
             <div className="hidden md:flex flex-col text-right">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Scope</span>
               <span className={`text-[10px] font-bold ${scanScope === 'deep' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                 {scanScope === 'deep' ? 'Connected Enterprise' : 'Public Web Assets'}
               </span>
             </div>
             <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors relative">
               <Activity className="w-5 h-5" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="w-10 h-10 bg-indigo-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
               <span className="text-xs font-bold text-indigo-700">AI</span>
             </div>
          </div>
        </div>

        {/* Live Connected Systems Sub-Bar if Deep Scan is selected */}
        {scanScope === 'deep' && (
          <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-y-2 gap-x-6 text-[10px] text-slate-500 font-medium">
            <span className="text-indigo-600 font-bold uppercase tracking-widest">Connected Integrations:</span>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/40">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span>SAP S/4HANA ERP <span className="font-mono text-slate-400">v2.1</span></span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/40">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span>Salesforce Cloud <span className="font-mono text-slate-400">v45</span></span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/40">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span>Stripe Ledger Pipeline</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/40">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
              <span>K8s Cluster Registry <span className="text-slate-400 font-bold">(Insecure Sync)</span></span>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-5 lg:p-6 md:p-8">
        <AnimatePresence mode="wait">
          {!result && !isScanning ? (
            <motion.div 
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-indigo-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Ready for Compliance Inspection</h2>
              <p className="text-slate-500 max-w-md mt-2">
                Enter a target URL above to start a deep forensic scan for GDPR violations, tracker leaks, and PII exposure.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 w-full max-w-3xl">
                {[
                  { icon: ShieldAlert, label: 'GDPR Forensics', color: 'text-rose-600 bg-rose-50' },
                  { icon: MousePointer2, label: 'Tracker Detection', color: 'text-indigo-600 bg-indigo-50' },
                  { icon: Lock, label: 'PII Leak Analysis', color: 'text-emerald-600 bg-emerald-50' }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800">{item.label}</h3>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : isScanning ? (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-indigo-600 animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-8">Analyzing Regulatory Surface...</h2>
              <div className="mt-4 flex gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
              </div>
              <div className="mt-12 w-full max-w-md bg-white border border-slate-200 rounded-xl p-4 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Scan Logs</span>
                </div>
                <div className="space-y-2 font-mono text-[10px] text-slate-500">
                  <p className="flex justify-between"><span>Connecting to secure scan cluster...</span> <span className="text-emerald-500">DONE</span></p>
                  {scanScope === 'deep' ? (
                    <>
                      <p className="flex justify-between"><span>Scanning SAP S/4HANA ERP clusters...</span> <span className="text-emerald-500">DONE</span></p>
                      <p className="flex justify-between"><span>Auditing Salesforce cross-border pipelines...</span> <span className="text-emerald-500">DONE</span></p>
                      <p className="flex justify-between"><span>Searching Stripe webhooks for plaintext PAN...</span> <span className="text-indigo-500 animate-pulse">RUNNING</span></p>
                      <p className="flex justify-between text-slate-300"><span>Evaluating DORA Article 5 resiliency...</span> <span>WAITING</span></p>
                    </>
                  ) : (
                    <>
                      <p className="flex justify-between"><span>Resolving target DNS records...</span> <span className="text-emerald-500">DONE</span></p>
                      <p className="flex justify-between"><span>Injecting headless scraper spider...</span> <span className="text-indigo-500 animate-pulse">RUNNING</span></p>
                      <p className="flex justify-between text-slate-300"><span>Evaluating ePrivacy Article 5(3)...</span> <span>WAITING</span></p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ) : result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 sm:space-y-8"
            >
              {/* Dashboard Hero */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
                {/* Score Card */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Activity className="w-40 h-40" />
                  </div>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Compliance Score</h3>
                  <div className="relative h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-slate-900">{100 - result.riskScore}%</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Secure</span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span className="text-sm font-bold text-slate-700">Risk Level</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      result.riskScore > 70 ? 'bg-rose-100 text-rose-700' : 
                      result.riskScore > 40 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {result.riskScore > 70 ? 'Critical' : result.riskScore > 40 ? 'Elevated' : 'Nominal'}
                    </span>
                  </div>
                </div>

                {/* Penalty & Summary Card */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                  <div className="bg-indigo-600 rounded-3xl p-5 sm:p-6 lg:p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                    <div className="absolute -bottom-6 -right-6 opacity-10">
                      <Gavel className="w-48 h-48 text-white" />
                    </div>
                    <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Estimated Regulatory Exposure</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black">€{totalPenalty.toLocaleString()}</span>
                      <span className="text-indigo-200 text-sm font-medium">Potential Fines</span>
                    </div>
                    <p className="mt-4 text-indigo-100 text-xs leading-relaxed opacity-80">
                      Based on current GDPR and AI Act thresholds, your organization faces significant financial risk due to unmitigated data leakage vectors.
                    </p>
                    <div className="mt-8 flex gap-3">
                      <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <div className="text-[10px] font-bold text-indigo-200 uppercase mb-1">Impact Level</div>
                        <div className="text-xl font-black">MAJOR</div>
                      </div>
                      <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <div className="text-[10px] font-bold text-indigo-200 uppercase mb-1">Time to Pay</div>
                        <div className="text-xl font-black">90D</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Executive Summary</h3>
                        <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                          <Download className="w-3.5 h-3.5" />
                          LEGAL BRIEF
                        </button>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed italic">
                        "{result.summary}"
                      </p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 12}`} alt="Auditor" />
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
                          +12
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">Audit verified by AI Consensus</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Navigation */}
              <div className="flex bg-slate-200/50 p-1 rounded-2xl w-fit">
                {[
                  { id: 'audit', label: 'Detailed Audit', icon: FileText },
                  { id: 'map', label: 'Sovereignty Map', icon: Globe },
                  { id: 'roadmap', label: 'Remediation Roadmap', icon: Zap }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id as any)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      activeView === tab.id 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  {activeView === 'audit' && (
                    <div className="space-y-4">
                      {result.violations?.map((v) => {
                        const isFixed = fixedViolations.includes(v.id);
                        const isRemediating = remediating === v.id;

                        return (
                          <div 
                            key={v.id} 
                            className={`bg-white border transition-all rounded-3xl overflow-hidden ${
                              isFixed ? 'border-emerald-200 opacity-70' : 'border-slate-200 hover:border-indigo-300 hover:shadow-lg'
                            }`}
                          >
                            <div className="p-4 sm:p-5 lg:p-6">
                              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-black text-white px-1.5 py-0.5 rounded tracking-tighter ${
                                      v.severity === 'CRITICAL' ? 'bg-rose-600' : v.severity === 'HIGH' ? 'bg-orange-500' : v.severity === 'MEDIUM' ? 'bg-amber-400' : 'bg-slate-400'
                                    }`}>
                                      {v.severity}
                                    </span>
                                    <span className="text-xs font-mono text-slate-400">{v.id}</span>
                                  </div>
                                  <h4 className="text-lg font-bold text-slate-900">{v.issue}</h4>
                                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <FileText className="w-3.5 h-3.5" />
                                    {v.law} • {v.article}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Potential Fine</div>
                                  <div className={`text-xl font-black ${isFixed ? 'text-emerald-600 line-through' : 'text-rose-600'}`}>
                                    €{v.penaltyEstimate.toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                  <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm mt-0.5">
                                    <Search className="w-3.5 h-3.5 text-indigo-600" />
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Root Cause Analysis</div>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                      {v.cause}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isFixed ? (
                                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                                      <CheckCircle2 className="w-4 h-4" />
                                      Remediated
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                      <Clock className="w-4 h-4" />
                                      Awaiting Action
                                    </div>
                                  )}
                                </div>
                                
                                {v.isAutoFixable && (() => {
                                  const requiredSub = VIOLATION_SUBSCRIPTION_MAP[v.id];
                                  const isLocked = requiredSub && !activeSubscriptions.includes(requiredSub.addonId);
                                  
                                  return (
                                    <button
                                      onClick={() => handleAutoFix(v.id)}
                                      disabled={isFixed || (isRemediating && remediating !== v.id)}
                                      className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                                        isFixed 
                                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default shadow-none' 
                                          : isRemediating && remediating === v.id
                                            ? 'bg-slate-100 text-slate-400 cursor-wait'
                                            : isLocked
                                              ? 'bg-slate-900 text-amber-400 hover:bg-slate-800 border border-amber-500/30'
                                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                                      }`}
                                    >
                                      {isRemediating && remediating === v.id ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                      ) : isLocked ? (
                                        <Lock className="w-4 h-4 text-amber-400" />
                                      ) : (
                                        <Zap className="w-4 h-4" />
                                      )}
                                      {isRemediating && remediating === v.id 
                                        ? 'APPLYING PATCH...' 
                                        : isFixed 
                                          ? 'PATCH APPLIED' 
                                          : isLocked 
                                            ? `UPGRADE FIX ENGINE` 
                                            : 'MANAGED AUTO-FIX'}
                                    </button>
                                  );
                                })()}
                              </div>
                            </div>
                            
                            {isRemediating && (
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                className="h-1 bg-indigo-600"
                              ></motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeView === 'map' && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm">
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">Data Sovereignty Analysis</h4>
                          <p className="text-sm text-slate-500">Visualization of cross-border data transfer adequacy.</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> ADEQUATE
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                            <ShieldAlert className="w-3 h-3" /> NON-COMPLIANT
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {result.sovereigntyMap.map((node, i) => (
                          <div key={i} className="flex items-center justify-between p-4 sm:p-5 lg:p-6 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${
                                node.adequacyStatus === 'ADEQUATE' ? 'bg-emerald-500 shadow-emerald-100' : 
                                node.adequacyStatus === 'RESTRICTED' ? 'bg-amber-500 shadow-amber-100' : 'bg-rose-500 shadow-rose-100'
                              }`}>
                                {node.country.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900">{node.country}</h5>
                                <div className="flex gap-2 mt-1">
                                  {node.dataTypes.map((type, j) => (
                                    <span key={j} className="text-[10px] font-medium text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-xs font-black uppercase tracking-widest ${
                                node.adequacyStatus === 'ADEQUATE' ? 'text-emerald-600' : 
                                node.adequacyStatus === 'RESTRICTED' ? 'text-amber-600' : 'text-rose-600'
                              }`}>
                                {node.adequacyStatus.replace('_', ' ')}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">{node.region} Gateway Active</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeView === 'roadmap' && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm">
                      <h4 className="text-lg font-bold text-slate-900 mb-8">Next-Step Remediation Roadmap</h4>
                      <div className="relative border-l-2 border-indigo-100 ml-4 space-y-12">
                        {result.violations?.map((v, i) => (
                          <div key={i} className="relative pl-10 group">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.3)] group-hover:scale-125 transition-transform"></div>
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 group-hover:border-indigo-300 transition-all">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Step {i + 1}</span>
                                  <h5 className="text-base font-bold text-slate-900 mt-1">{v.issue} Mitigation</h5>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-black text-white ${
                                  v.severity === 'CRITICAL' ? 'bg-rose-600' : v.severity === 'HIGH' ? 'bg-orange-500' : 'bg-amber-400'
                                }`}>
                                  {v.severity}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                {v.remediationStep}
                              </p>
                              <div className="flex gap-3">
                                {v.isAutoFixable && !fixedViolations.includes(v.id) ? (() => {
                                  const requiredSub = VIOLATION_SUBSCRIPTION_MAP[v.id];
                                  const isLocked = requiredSub && !activeSubscriptions.includes(requiredSub.addonId);
                                  return (
                                    <button 
                                      onClick={() => handleAutoFix(v.id)}
                                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                                        isLocked
                                          ? 'bg-slate-900 text-amber-400 border border-amber-500/20 hover:bg-slate-800'
                                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                      }`}
                                    >
                                      {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Zap className="w-3.5 h-3.5" />}
                                      {isLocked ? 'UPGRADE FIX ENGINE' : 'RUN AUTO-FIX'}
                                    </button>
                                  );
                                })() : (
                                  <button className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-2 ${
                                    fixedViolations.includes(v.id) ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                  }`}>
                                    {fixedViolations.includes(v.id) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                                    {fixedViolations.includes(v.id) ? 'COMPLETED' : 'REQUEST DOCUMENTATION'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Side Panels */}
                <div className="space-y-5 sm:space-y-8">
                  {/* Compliance Risk Dashboard */}
                  <ComplianceRiskDashboard trackers={result.trackersFound} />
                  
                  {/* Third-Party Integrations */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6">
                      <ExternalLink className="w-4 h-4 text-indigo-600" />
                      Detected Integrations
                    </h3>
                    <div className="space-y-4">
                      {result.trackersFound.map((t, i) => (
                        <div key={i} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{t.name}</h4>
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{t.type}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mb-3">{t.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400">{t.domain}</span>
                            <a 
                              href={t.link || '#'} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                      {result.trackersFound.length === 0 && (
                        <div className="text-center py-5 sm:py-8">
                          <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-400">No unauthorized trackers found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PII Exposure List */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6">
                      <MousePointer2 className="w-4 h-4 text-rose-500" />
                      Sensitive PII Found
                    </h3>
                    <div className="space-y-3">
                      {result.piiFound.map((pii, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                          <div className="w-8 h-8 bg-white border border-rose-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-rose-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-tighter">{pii.type}</span>
                              <span className="text-[10px] font-bold text-rose-400">Line 142</span>
                            </div>
                            <div className="text-xs font-mono text-slate-800 truncate">{pii.value}</div>
                          </div>
                        </div>
                      ))}
                      {result.piiFound.length === 0 && (
                        <div className="text-center py-5 sm:py-8">
                          <ShieldCheck className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-400">Zero PII leaks detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan History (Mini) */}
        {scanHistory.length > 0 && !isScanning && (
          <div className="mt-16 pt-8 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <History className="w-4 h-4" />
              Audit Forensic History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {scanHistory.map((h, i) => (
                <button 
                  key={i} 
                  onClick={() => setResult(h)}
                  className={`text-left p-4 bg-white border rounded-2xl transition-all group ${
                    result?.timestamp === h.timestamp ? 'border-indigo-600 shadow-lg ring-4 ring-indigo-50' : 'border-slate-100 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                      <Globe className={`w-4 h-4 ${result?.timestamp === h.timestamp ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </div>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      h.riskScore > 70 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {100 - h.riskScore}%
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate mb-1">{h.url}</div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {new Date(h.timestamp).toLocaleDateString()} at {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Advanced Fix Engine Upsell Modal */}
      <AnimatePresence>
        {showUpgradeModal && upgradeTarget && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full text-white overflow-hidden shadow-2xl relative"
            >
              {/* Golden Accented Header */}
              <div className="p-5 sm:p-6 lg:p-8 bg-gradient-to-br from-amber-950/50 to-slate-900 border-b border-slate-800 relative">
                <div className="absolute top-4 right-4 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest animate-pulse">
                  Advanced Fix Engine
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-black tracking-tight">Unlock Patch Delivery</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Automated code-level patch deployment is locked for this compliance category.
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Required Add-on Subscriptions</div>
                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/10">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{upgradeTarget.addonName}</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{upgradeTarget.policyIntegrated}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-amber-400">{upgradeTarget.price}</div>
                      <p className="text-[8px] text-slate-500 uppercase font-bold">Cancel Anytime</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Deploy native TypeScript middleware and API filter intercepts instantly.</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Real-time continuous audit telemetry monitoring for ERP, Salesforce, & Stripe.</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>SLA-backed compliance assurance up to €50,000 against administrative fines.</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 sm:p-5 lg:p-6 bg-slate-950/80 border-t border-slate-800/50 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpgradeModal(false);
                    setUpgradeTarget(null);
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
                >
                  Return to Audit
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpgrade}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  Approve & Unlock Fix
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer / Status Bar */}
      <footer className="mt-12 bg-white border-t border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              9Xen Regulettee Gateway: Operational
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              Throughput: 1.2 GB/s
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-indigo-600 cursor-help transition-colors">Audit Ledger</span>
            <span className="hover:text-indigo-600 cursor-help transition-colors">Regulator Access</span>
            <span className="hover:text-indigo-600 cursor-help transition-colors">Privacy Shield v2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
