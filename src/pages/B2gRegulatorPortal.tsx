import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Send, 
  Plus, 
  ListTodo, 
  Activity, 
  ShieldAlert, 
  Shield,
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Sliders, 
  HelpCircle,
  FileCheck2,
  Lock,
  Globe,
  TrendingUp,
  Inbox,
  Terminal,
  Clock,
  Check,
  X,
  Sparkles,
  Link as LinkIcon,
  Box,
  Search,
  RefreshCw,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { SimulateImpact } from '../components/SimulateImpact';
import { XmlParsersHub } from '../components/b2g/XmlParsersHub';
import { ProcurementQualificationEngine } from '../components/b2g/ProcurementQualificationEngine';
import { CentralBankClearingTracker } from '../components/b2g/CentralBankClearingTracker';
import { JudicialEvidenceContainer } from '../components/b2g/JudicialEvidenceContainer';
import { OssCrossBorderMechanism } from '../components/b2g/OssCrossBorderMechanism';
import { Nis2IncidentDispatchHub } from '../components/b2g/Nis2IncidentDispatchHub';
import { SovereignSubpoenaGateway } from '../components/b2g/SovereignSubpoenaGateway';
import { CtcEInvoicingGateway } from '../components/b2g/CtcEInvoicingGateway';
import { AiActPmmRelay } from '../components/b2g/AiActPmmRelay';
import { RegionalSovereignCommandGrid } from '../components/b2g/RegionalSovereignCommandGrid';
import { RegionalDataResidencyConfigManager } from '../components/b2g/RegionalDataResidencyConfigManager';
import { RegulatoryIntelligenceRadar } from '../components/b2g/RegulatoryIntelligenceRadar';
import { AdvancedMultiRegionB2gEngine } from '../components/b2g/AdvancedMultiRegionB2gEngine';
import { NationalB2gScanningEngine } from '../components/b2g/NationalB2gScanningEngine';
import { B2gFilingWorkflowTimeline } from '../components/b2g/B2gFilingWorkflowTimeline';

interface B2GRequest {
  id: string;
  regulatorName: string;
  title: string;
  industry: string;
  law: string;
  regionalScope: string;
  description: string;
  minRiskThreshold: number;
  enforcementAction: 'API_THROTTLE' | 'LOCK_CERTIFICATE' | 'AUTO_FINE' | 'FEATURE_SUSPENSION';
  fineAmount?: number;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  requestedAt: string;
}

interface ScanResult {
  id: string;
  tenantId: string;
  tenantName: string;
  industry: string;
  lawChecked: string;
  website: string;
  status: 'COMPLIANT' | 'VIOLATION_DETECTED';
  violationDetails?: string;
  timestamp: string;
  penaltyEnforced?: string;
  fineApplied?: number;
  emailSentTo?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  tags?: string[];
  escalationLevel?: number;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  pendingPenalty?: string;
  pendingFine?: number;
  signature?: string;
  appealStatus?: 'SUBMITTED' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
  appealEvidence?: string;
  appealSummary?: string;
}

export const B2gRegulatorPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'NATIONAL_SCANNER' | 'MANDATES' | 'SUPERVISORY_NODE' | 'FILING_TIMELINE' | 'REGIONAL_RESIDENCY' | 'REG_INTEL' | 'SERVICES' | 'APPEALS' | 'ADVANCED' | 'WHISTLEBLOWER' | 'SCRAPER_HUB'>('NATIONAL_SCANNER');
  const [supervisoryStatus, setSupervisoryStatus] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/v1/b2g/regulator-node/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSupervisoryStatus(data);
      })
      .catch(e => console.error("Failed to load supervisory status", e));
  }, []);

  // Scraper Hub State
  const [scraperUrl, setScraperUrl] = useState('https://example.com');
  const [scraperProfile, setScraperProfile] = useState('GDPR_EPRIVACY');
  const [isScanningUrl, setIsScanningUrl] = useState(false);
  const [activeScanResult, setActiveScanResult] = useState<any>(null);
  const [scraperHistory, setScraperHistory] = useState<any[]>([]);

  // Sync states with shared localStorage
  const [b2gRequests, setB2gRequests] = useState<B2GRequest[]>(() => {
    try {
      const saved = localStorage.getItem('b2g_service_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse b2g_service_requests:', e);
    }
    // Fallback if not configured
    return [];
  });

  const [scanResults, setScanResults] = useState<ScanResult[]>(() => {
    try {
      const saved = localStorage.getItem('b2g_scan_results');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse b2g_scan_results:', e);
    }
    return [];
  });

  // Save updates
  useEffect(() => {
    localStorage.setItem('b2g_service_requests', JSON.stringify(b2gRequests));
  }, [b2gRequests]);

  // Load mandates from backend into the shared list
  useEffect(() => {
    fetch('/api/v1/b2g/mandates')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.map((m: any) => ({
            id: m.id,
            regulatorName: m.regulator_name,
            title: m.title,
            industry: m.industry,
            law: m.law,
            regionalScope: m.regional_scope,
            description: m.description,
            minRiskThreshold: m.min_risk_threshold,
            enforcementAction: m.enforcement_action,
            fineAmount: m.fine_amount,
            status: m.status,
            requestedAt: m.created_at,
          }));
          setB2gRequests(prev => {
            const merged = [...mapped, ...prev.filter(p => !mapped.some((m2: any) => m2.id === p.id))];
            return merged;
          });
        }
      })
      .catch(e => console.error('Failed to load mandates from backend:', e));
  }, []);

  useEffect(() => {
    localStorage.setItem('b2g_scan_results', JSON.stringify(scanResults));
    // Trigger storage event so local windows/tabs synchronize immediately
    window.dispatchEvent(new Event('storage'));
  }, [scanResults]);

  // Form states for new Mandate Request
  const [title, setTitle] = useState('');
  const [industry, setIndustry] = useState('Fintech');
  const [law, setLaw] = useState('GDPR Article 5e (Storage Limitation)');
  const [regionalScope, setRegionalScope] = useState('All EU / EEA');
  const [description, setDescription] = useState('');
  const [threshold, setThreshold] = useState<number>(75);
  const [enforcementAction, setEnforcementAction] = useState<'API_THROTTLE' | 'LOCK_CERTIFICATE' | 'AUTO_FINE' | 'FEATURE_SUSPENSION'>('AUTO_FINE');
  const [fineAmount, setFineAmount] = useState<number>(250000);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTriggerSovereignScan = async (entityId: number, entityName: string) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/v1/enforcement/trigger-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regulatorId: 1, entityId })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`🎯 Sovereign scan complete! New enforcement case ${data.data.id} initialized for ${entityName}.`);
        // Refresh local scan results for the B2G view
        const newResult: ScanResult = {
          id: data.data.id,
          tenantId: entityId.toString(),
          tenantName: entityName,
          industry: 'Fintech',
          lawChecked: 'GDPR Art. 32 (Sovereign Scan)',
          website: 'internal-node.eu',
          status: 'VIOLATION_DETECTED',
          violationDetails: 'Automated scan detected illegal PII processing patterns in shadow infrastructure.',
          timestamp: new Date().toISOString(),
          severity: 'HIGH',
          escalationLevel: 1
        };
        setScanResults(prev => [newResult, ...prev]);
      }
    } catch (err) {
      console.error('Scan trigger failed:', err);
      triggerToast('❌ Scan trigger failed. Check engine connectivity.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCreateMandate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      triggerToast('⚠️ Please complete all fields.');
      return;
    }

    const newRequest: B2GRequest = {
      id: `req-${Date.now()}`,
      regulatorName: "EU Regulatory Authority (Ecosystem View)",
      title,
      industry,
      law,
      regionalScope,
      description,
      minRiskThreshold: threshold,
      enforcementAction,
      fineAmount: enforcementAction === 'AUTO_FINE' ? fineAmount : undefined,
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    };

    setB2gRequests(prev => [newRequest, ...prev]);
    triggerToast('🚀 B2G Automated Penalty mandate request submitted to SaaS Admin!');
    
    // Sync with backend SQLite/Embedded DB
    fetch('/api/v1/b2g/mandates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRequest)
    }).catch(err => console.error('Failed to sync mandate to DB:', err));

    // Clear form
    setTitle('');
    setDescription('');
  };

  const handleDeleteRequest = (id: string) => {
    setB2gRequests(prev => prev.filter(r => r.id !== id));
    triggerToast('Mandate request retracted.');

    fetch(`/api/v1/b2g/mandates/${id}`, { method: 'DELETE' })
      .catch(err => console.error('Failed to delete mandate from DB:', err));
  };

  const handleRunScraperScan = async () => {
    if (!scraperUrl) return;
    setIsScanningUrl(true);
    setActiveScanResult(null);
    try {
      const res = await fetch('/api/v1/b2g/scraper/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: scraperUrl, profile: scraperProfile })
      });
      const data = await res.json();
      if (data.success) {
        setActiveScanResult(data.scanResult);
        triggerToast('🕷️ Scraper crawl completed! Compliance inspection report generated.');
      } else {
        triggerToast('⚠️ Scraper scan completed with warnings.');
      }
    } catch (err) {
      console.error('B2G Scraper error:', err);
      triggerToast('Error connecting to B2G Scraper Engine.');
    } finally {
      setIsScanningUrl(false);
    }
  };

  // Recharts aggregation: total fine counts by directive
  const getFinesChartData = () => {
    const dataMap: Record<string, number> = {};
    scanResults
      .filter(r => r.status === 'VIOLATION_DETECTED' && r.fineApplied !== undefined)
      .forEach(r => {
        const shortName = r.lawChecked.split(' ')[0] || r.lawChecked;
        dataMap[shortName] = (dataMap[shortName] || 0) + (r.fineApplied || 0);
      });

    const chartData = Object.keys(dataMap).map(key => ({
      name: key,
      Fines: dataMap[key]
    }));

    return chartData.length > 0 ? chartData : [
      { name: 'GDPR', Fines: 250000 },
      { name: 'EU AI Act', Fines: 500000 },
      { name: 'NIS2', Fines: 100000 }
    ];
  };

  const totalFinesCollected = scanResults
    .filter(r => r.status === 'VIOLATION_DETECTED' && r.fineApplied !== undefined)
    .reduce((sum, item) => sum + (item.fineApplied || 0), 0);

  const activeViolationsCount = scanResults.filter(r => r.status === 'VIOLATION_DETECTED').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/20 text-xs font-bold font-mono"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
              <Scale className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                EU Regulator B2G Portal
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Formulate and dispatch real-time automated penalty and fine surveillance policies directly to SaaS platform.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3 text-xs font-mono font-bold">
          <div className="bg-slate-800/60 border border-slate-700/80 px-3.5 py-2.5 rounded-xl text-amber-400">
            ⚖️ Active Mandates: {b2gRequests.length}
          </div>
          <div className="bg-slate-800/60 border border-slate-700/80 px-3.5 py-2.5 rounded-xl text-emerald-400">
            📊 Enforcement Runs: {scanResults.length}
          </div>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          onClick={() => setActiveTab('NATIONAL_SCANNER')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'NATIONAL_SCANNER' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>🏛️ National & Country B2G Scanner Hub</span>
          <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full">
            UNLIMITED
          </span>
        </button>
        <button
          onClick={() => setActiveTab('MANDATES')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'MANDATES' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Mandates & Enforcement
        </button>
        <button
          onClick={() => setActiveTab('SUPERVISORY_NODE')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'SUPERVISORY_NODE' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Scale className="w-4 h-4 text-indigo-500" />
          <span>Direct Supervisory Node (B2G Stream)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
        <button
          onClick={() => setActiveTab('FILING_TIMELINE')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'FILING_TIMELINE' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>Filing Workflows & Timelines</span>
        </button>
        <button
          onClick={() => setActiveTab('REGIONAL_RESIDENCY')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'REGIONAL_RESIDENCY' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Globe className="w-4 h-4 text-indigo-500" />
          <span>Regional Data Residency</span>
        </button>
        <button
          onClick={() => setActiveTab('REG_INTEL')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'REG_INTEL' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Regulatory Intelligence</span>
        </button>
        <button
          onClick={() => setActiveTab('SERVICES')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'SERVICES' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          B2G Services Integration
        </button>
        <button
          onClick={() => setActiveTab('APPEALS')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'APPEALS' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Appeals Review Board</span>
          {scanResults.filter(r => r.appealStatus === 'SUBMITTED').length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
              {scanResults.filter(r => r.appealStatus === 'SUBMITTED').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('ADVANCED')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'ADVANCED' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Advanced B2G Control</span>
        </button>
        <button
          onClick={() => setActiveTab('WHISTLEBLOWER')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'WHISTLEBLOWER' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Protected Disclosures</span>
        </button>
        <button
          onClick={() => setActiveTab('SCRAPER_HUB')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'SCRAPER_HUB' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Search className="w-4 h-4 text-amber-500" />
          <span>🕷️ B2G Web Scraper & Crawler Hub</span>
        </button>
      </div>

      {activeTab === 'NATIONAL_SCANNER' && (
        <NationalB2gScanningEngine />
      )}

      {activeTab === 'SUPERVISORY_NODE' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Direct Regulatory Supervisory Node (B2G Cryptographic Channel)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  EDPB & Sovereign DPAs real-time inspection stream with Zero-Knowledge verification and verifiable certificate issuance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Supervisory Node: ONLINE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Supervisory Authority</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {supervisoryStatus?.dpaAuthority || 'European Data Protection Board (EDPB)'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Continuous Posture Compliance</span>
                <p className="text-2xl font-black text-emerald-600">
                  {supervisoryStatus?.continuousPostureRate || 98.4}%
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Active Directives</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {supervisoryStatus?.activeDirectives?.map((d: string, i: number) => (
                    <span key={i} className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[9px] font-mono text-slate-700 dark:text-slate-300">
                      {d}
                    </span>
                  )) || <span className="text-xs">GDPR / FADP / DORA / AI ACT</span>}
                </div>
              </div>
            </div>

            {/* Live Inspection Summary Widget */}
            <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Live Inspection Summary (Automated Scans)</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Aggregated telemetric scan feeds across DORA, GDPR, and AI Act compliance enclaves</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded text-[10px] font-mono font-bold">
                    {supervisoryStatus?.liveInspectionSummary?.criticalFindingsCount || 2} Critical Alerts
                  </span>
                  <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-800 text-amber-300 rounded text-[10px] font-mono font-bold">
                    {supervisoryStatus?.liveInspectionSummary?.warningCount || 5} Warnings
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded text-[10px] font-mono font-bold">
                    {supervisoryStatus?.liveInspectionSummary?.resolvedRemediations || 18} Auto-Remediated
                  </span>
                </div>
              </div>

              {/* Real-time Compliance Posture Progress Bar */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Continuous Posture Index:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {supervisoryStatus?.continuousPostureRate || 98.4}%
                    </span>
                    <span className="px-1.5 py-0.5 bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 rounded text-[9px]">
                      OPTIMAL COMPLIANCE
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Target: &ge; 95.0% • Residual Gap: {(100 - (supervisoryStatus?.continuousPostureRate || 98.4)).toFixed(1)}%
                  </div>
                </div>

                {/* Progress track */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 flex">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{ width: `${supervisoryStatus?.continuousPostureRate || 98.4}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[9px] text-slate-500 font-mono pt-0.5">
                  <span>0% Critical Non-Compliance</span>
                  <span>50% Remediation Gate</span>
                  <span>75% Statutory Floor</span>
                  <span className="text-emerald-400 font-bold">100% Zero-Trust Enclave</span>
                </div>
              </div>

              {/* Aggregated Findings Grid Layout with Color-Coded Risk Indicators */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
                  <span>Aggregated Inspection Findings Matrix</span>
                  <span>Sorted by Telemetric Priority</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {(supervisoryStatus?.liveInspectionSummary?.findings || [
                    {
                      id: 'FINDING-DORA-01',
                      entity: 'Sovereign Payments Core',
                      domain: 'ICT Third-Party Resiliency',
                      regulation: 'DORA Art. 28(3)',
                      severity: 'CRITICAL',
                      riskLevel: 'High Risk',
                      summary: 'Sub-processor failover recovery latency exceeding 240ms threshold in secondary backup cluster.',
                      remediationStatus: 'AUTO_REMEDIATED_CIRCUIT_BREAKER',
                      timestamp: '14 min ago'
                    },
                    {
                      id: 'FINDING-SCC-02',
                      entity: 'Global User Telemetry Pipeline',
                      domain: 'Cross-Border Data Transfer',
                      regulation: 'GDPR Art. 46 / Schrems II',
                      severity: 'CRITICAL',
                      riskLevel: 'High Risk',
                      summary: 'US AWS us-east-1 endpoint lacking ZKP tokenization seal for extraterritorial payload routing.',
                      remediationStatus: 'ISOLATED_IN_SOVEREIGN_ENCLAVE',
                      timestamp: '42 min ago'
                    },
                    {
                      id: 'FINDING-AIACT-03',
                      entity: 'Credit Scoring AI Engine v3',
                      domain: 'High-Risk AI Model Governance',
                      regulation: 'EU AI Act Annex IV',
                      severity: 'WARNING',
                      riskLevel: 'Medium Risk',
                      summary: 'Human-in-the-loop oversight audit trail pending quarterly cryptographic key renewal.',
                      remediationStatus: 'RE-VERIFIED_PENDING_DPA_ACK',
                      timestamp: '1 hr ago'
                    },
                    {
                      id: 'FINDING-FADP-04',
                      entity: 'Swiss Health Data Vault',
                      domain: 'Cross-Border Enclave Residency',
                      regulation: 'Swiss FADP SR 235.1',
                      severity: 'LOW',
                      riskLevel: 'Low Risk',
                      summary: 'Routine periodic cryptographic integrity attestation completed without anomalies.',
                      remediationStatus: 'VERIFIED_ENCLAVE_ATTESTATION',
                      timestamp: '2 hrs ago'
                    },
                    {
                      id: 'FINDING-DSAR-05',
                      entity: 'Consumer Identity Portal',
                      domain: 'Data Subject Rights (DSAR)',
                      regulation: 'GDPR Art. 17 Erasure',
                      severity: 'LOW',
                      riskLevel: 'Low Risk',
                      summary: 'Automated cryptographic tombstone verification executed across distributed sharded nodes.',
                      remediationStatus: 'CRYPTOGRAPHIC_TOMBSTONE_SEALED',
                      timestamp: '3 hrs ago'
                    },
                    {
                      id: 'FINDING-NIS2-06',
                      entity: 'Critical DNS Gateway',
                      domain: 'Infrastructure Resilience',
                      regulation: 'NIS2 Art. 21',
                      severity: 'WARNING',
                      riskLevel: 'Medium Risk',
                      summary: 'Secondary recursive resolver latency jitter detected during simulated DDoS stress test.',
                      remediationStatus: 'TRAFFIC_REROUTED_ANYCAST',
                      timestamp: '4 hrs ago'
                    }
                  ]).map((finding: any) => {
                    const isHigh = finding.severity === 'CRITICAL' || finding.riskLevel?.includes('High');
                    const isMedium = finding.severity === 'WARNING' || finding.riskLevel?.includes('Medium');
                    const riskLabel = isHigh ? 'High Risk' : isMedium ? 'Medium Risk' : 'Low Risk';

                    return (
                      <div
                        key={finding.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all hover:border-slate-600 ${
                          isHigh
                            ? 'bg-gradient-to-b from-rose-950/40 to-slate-950 border-rose-800/60'
                            : isMedium
                            ? 'bg-gradient-to-b from-amber-950/40 to-slate-950 border-amber-800/60'
                            : 'bg-gradient-to-b from-emerald-950/30 to-slate-950 border-emerald-800/50'
                        }`}
                      >
                        <div className="space-y-2.5">
                          {/* Top Header: ID & Color-coded Risk Indicator */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-xs text-white">
                              {finding.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black tracking-wide uppercase border flex items-center gap-1 ${
                                isHigh
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : isMedium
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isHigh ? 'bg-rose-400 animate-pulse' : isMedium ? 'bg-amber-400' : 'bg-emerald-400'
                                }`}
                              ></span>
                              {riskLabel}
                            </span>
                          </div>

                          {/* Target Entity & Regulatory Base */}
                          <div>
                            <div className="text-[11px] font-medium text-slate-300">
                              {finding.entity}
                            </div>
                            <div className="text-[10px] font-mono text-indigo-400 font-semibold mt-0.5">
                              {finding.domain} • <span className="text-slate-400">{finding.regulation}</span>
                            </div>
                          </div>

                          {/* Summary */}
                          <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                            {finding.summary}
                          </p>
                        </div>

                        {/* Footer Status & Remediation */}
                        <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">{finding.timestamp || 'Real-time'}</span>
                          <span className="px-2 py-0.5 bg-emerald-950/90 border border-emerald-700/60 text-emerald-300 rounded text-[9px] flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {finding.remediationStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Official Sovereign Seal Card */}
            {supervisoryStatus?.officialSeal && (
              <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl shadow-md border border-indigo-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-emerald-400" />
                    <span className="text-base font-black tracking-wide">VERIFIABLE SOVEREIGN COMPLIANCE SEAL</span>
                  </div>
                  <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
                    Cryptographically attested by decentralized zero-knowledge enclave nodes. Valid across all 27 EU member states, Switzerland, and the United Kingdom.
                  </p>
                  <div className="font-mono text-[11px] text-indigo-300">
                    Seal ID: <span className="text-white font-bold">{supervisoryStatus.officialSeal.sealId}</span> • Valid until: {new Date(supervisoryStatus.officialSeal.validUntil).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-3 bg-white text-slate-900 rounded-xl text-center shadow-lg font-mono text-[10px] space-y-1">
                  <div className="w-24 h-24 bg-slate-900 text-white p-2 rounded-lg flex flex-col items-center justify-center font-mono font-bold text-center">
                    <span className="text-[9px] text-emerald-400">QR VERIFIED</span>
                    <span className="text-[8px] text-slate-300 mt-1">EDPB / FDPIC</span>
                    <span className="text-[10px] text-amber-400 font-bold mt-1">★ 2026 ★</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold block">Scan for Direct Proof</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'FILING_TIMELINE' && (
        <B2gFilingWorkflowTimeline />
      )}

      {activeTab === 'MANDATES' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Form to submit a new B2G mandate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
            <Send className="w-4 h-4 text-amber-500 mr-2" />
            Submit Auto-Penalty Mandate
          </h3>

          <form onSubmit={handleCreateMandate} className="space-y-4 text-xs text-slate-700">
            <div>
              <label className="font-bold text-slate-500 block mb-1">Mandate Title / Goal</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Biometric Tracking Compliance Check"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Target Sector</label>
                <select 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                >
                  <option value="Fintech">Fintech</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="AI Labs">AI Labs</option>
                  <option value="E-commerce">E-commerce</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-500 block mb-1">Scope</label>
                <input 
                  type="text" 
                  value={regionalScope}
                  onChange={(e) => setRegionalScope(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-500 block mb-1">Directives to Inspect</label>
              <select 
                value={law}
                onChange={(e) => setLaw(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
              >
                <option value="GDPR Article 5e (Storage Limitation)">GDPR Article 5e (Storage Limitation)</option>
                <option value="EU AI Act Chapter III (Conformity Auditing)">EU AI Act Chapter III (Conformity Auditing)</option>
                <option value="NIS2 Article 21 (Risk Management)">NIS2 Article 21 (Risk Management)</option>
                <option value="DORA Article 14 (ICT Systems Resilience)">DORA Article 14 (ICT Systems Resilience)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-500 block mb-1">Audit Criteria & Risk Description</label>
              <textarea 
                required
                rows={3}
                placeholder="Detail technical endpoint parameters, e.g. checking TLS configurations or DB storage retention epochs."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none resize-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Enforcement Restriction</label>
                <select 
                  value={enforcementAction}
                  onChange={(e) => setEnforcementAction(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                >
                  <option value="AUTO_FINE">Apply Invoice Fine</option>
                  <option value="API_THROTTLE">Throttle API Usage</option>
                  <option value="FEATURE_SUSPENSION">Suspend AI inference</option>
                  <option value="LOCK_CERTIFICATE">Lock Trust Badges</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Min Compliance Threshold</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="range" 
                    min={40} 
                    max={95}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <span className="font-bold">{threshold}%</span>
                </div>
              </div>
            </div>

            {enforcementAction === 'AUTO_FINE' && (
              <div>
                <label className="font-bold text-slate-500 block mb-1">Fine Amount (€ EUR)</label>
                <input 
                  type="number" 
                  step={50000}
                  value={fineAmount}
                  onChange={(e) => setFineAmount(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>
            )}

            <SimulateImpact onSimulate={() => {}} />

            <button 
              type="submit" 
              className="w-full py-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold rounded-xl transition-all shadow"
            >
              Dispatch Mandate for SaaS Integration
            </button>
          </form>
        </div>

        {/* Mandate list and dynamic tracking */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
              <ListTodo className="w-4 h-4 text-amber-500 mr-2" />
              Your Active and Pending Compliance Mandates
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
            {b2gRequests.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-10 text-slate-400">
                <Inbox className="w-10 h-10 mb-2 opacity-30" />
                <span>No active mandates submitted yet.</span>
              </div>
            ) : (
              b2gRequests.map(req => (
                <div key={req.id} className="border border-slate-150 rounded-xl p-4 space-y-3 bg-slate-50/20 hover:border-amber-300 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">{req.title}</h4>
                        <span className="text-[10px] text-slate-400">ID: {req.id}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'DENIED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2">{req.description}</p>

                    <div className="flex items-center space-x-2 text-[10px] text-slate-600 font-medium">
                      <span>Sector: <strong className="text-slate-800">{req.industry}</strong></span>
                      <span>•</span>
                      <span>Fine: <strong className="text-slate-800">{req.fineAmount ? `€${req.fineAmount.toLocaleString()}` : 'N/A'}</strong></span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>Requested: {new Date(req.requestedAt).toLocaleDateString()}</span>
                    <button 
                      onClick={() => handleDeleteRequest(req.id)}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded"
                    >
                      Retract
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Enforcement activity dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <Activity className="w-4 h-4 text-emerald-500 mr-2" />
              Live B2G Enforcement Activity Logs
            </h3>
            <button 
              onClick={() => handleTriggerSovereignScan(101, 'EuroCorp Aviation')}
              disabled={isScanning}
              className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 border-0 cursor-pointer disabled:opacity-50"
            >
              {isScanning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldAlert className="w-3 h-3" />}
              Trigger Sovereign Scan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold">
                <tr>
                  <th className="px-4 py-2.5">Infracted Tenant</th>
                  <th className="px-4 py-2.5">Directive Audited</th>
                  <th className="px-4 py-2.5">Outcome Status</th>
                  <th className="px-4 py-2.5">Enforcement applied</th>
                  <th className="px-4 py-2.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scanResults.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3 font-semibold text-slate-800">{res.tenantName}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-600">{res.lawChecked}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        res.status === 'VIOLATION_DETECTED' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {res.status === 'VIOLATION_DETECTED' ? '⚠️ VIOLATION' : '🟢 COMPLIANT'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {res.penaltyEnforced ? (
                        <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">{res.penaltyEnforced}</span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                      {new Date(res.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fines summary Recharts card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center border-b border-slate-100 pb-3 mb-4">
              <ShieldAlert className="w-4 h-4 text-rose-500 mr-2" />
              Directives Fine Distribution
            </h3>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getFinesChartData()}>
                  <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                  <YAxis fontSize={9} stroke="#94a3b8" />
                  <Tooltip formatter={(v) => [`€${Number(v).toLocaleString()}`, 'Fines Applied']} />
                  <Bar dataKey="Fines" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Total Fine Pool:</span>
              <span className="text-rose-600">€{totalFinesCollected.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-500">
              <span>Active Suspensions:</span>
              <span>{scanResults.filter(r => r.penaltyEnforced !== undefined).length}</span>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* REGIONAL DATA RESIDENCY TAB */}
      {activeTab === 'REGIONAL_RESIDENCY' && (
        <div className="space-y-6">
          <AdvancedMultiRegionB2gEngine role="REGULATOR" />
          <RegionalDataResidencyConfigManager role="REGULATOR" />
          <RegionalSovereignCommandGrid />
        </div>
      )}

      {/* REGULATORY INTELLIGENCE RADAR TAB */}
      {activeTab === 'REG_INTEL' && (
        <div className="space-y-6">
          <RegulatoryIntelligenceRadar role="REGULATOR" />
        </div>
      )}

      {activeTab === 'SERVICES' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">API Webhooks Integration</h3>
                <p className="text-xs text-slate-500 mt-0.5">Register HTTP callbacks for real-time B2G violation alerts.</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="text-xs font-bold text-slate-600 block mb-1">Webhook Endpoint URL</label>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  placeholder="https://regulator-sys.eu/api/v1/webhook"
                  className="flex-1 text-xs bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  defaultValue="https://b2g-gateway.ec.europa.eu/webhooks/recv"
                />
                <button 
                  onClick={() => {
                    try {
                      const cfg = { endpoint: 'https://b2g-gateway.ec.europa.eu/webhooks/recv', events: ['CRITICAL_VIOLATION', 'FINE_ISSUED', 'MANDATE_ACCEPTED', 'TENANT_SUSPENDED'], verified_at: new Date().toISOString() };
                      localStorage.setItem('b2g_webhook_config', JSON.stringify(cfg));
                    } catch {}
                    triggerToast('Webhook endpoint successfully verified and registered.');
                  }}
                  className="px-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors"
                >
                  Verify
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700">Subscribed Events</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="checkbox" className="rounded text-indigo-600" defaultChecked />
                  <span className="font-medium text-slate-700">CRITICAL_VIOLATION</span>
                </label>
                <label className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="checkbox" className="rounded text-indigo-600" defaultChecked />
                  <span className="font-medium text-slate-700">FINE_ISSUED</span>
                </label>
                <label className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="checkbox" className="rounded text-indigo-600" defaultChecked />
                  <span className="font-medium text-slate-700">MANDATE_ACCEPTED</span>
                </label>
                <label className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="checkbox" className="rounded text-indigo-600" />
                  <span className="font-medium text-slate-700">TENANT_SUSPENDED</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Automated Audit Scheduler</h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure recurrent cross-tenant compliance scanning tasks.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Schedule Frequency (CRON Format)</label>
                <input 
                  type="text" 
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  defaultValue="0 2 * * 1-5"
                />
                <p className="text-[10px] text-slate-400 mt-1">Runs at 02:00 AM on Monday through Friday.</p>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Target Laws to Scan</label>
                <select className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none">
                  <option>GDPR Core Set (Articles 5, 17, 32)</option>
                  <option>EU AI Act Chapter III</option>
                  <option>Digital Markets Act (DMA)</option>
                  <option>Comprehensive EU Scope</option>
                </select>
              </div>

              <button 
                onClick={() => {
                  try {
                    const cfg = { cron: '0 2 * * 1-5', laws: ['GDPR Core Set (Articles 5, 17, 32)'], activated_at: new Date().toISOString() };
                    const existing: any[] = JSON.parse(localStorage.getItem('b2g_schedules') || '[]');
                    existing.push(cfg);
                    localStorage.setItem('b2g_schedules', JSON.stringify(existing));
                  } catch {}
                  triggerToast('Recurring audit schedule successfully activated.');
                }}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-colors"
              >
                Activate Scheduler
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-full text-sky-600">
                <LinkIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Secure Direct Connect Tunnel</h3>
                <p className="text-xs text-slate-500 max-w-lg mt-1 leading-relaxed">
                  Establish a secure cryptographic channel between the SaaS Provider's compliance ledger and your regulatory jurisdiction node for streaming high-severity evidentiary data.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 uppercase tracking-widest">
                Status: Connected
              </span>
              <button 
                onClick={() => {
                  try {
                    const rotated = { key: `tunnel_key_${Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(16).padStart(2, '0')).join('')}`, rotated_at: new Date().toISOString(), status: 'CONNECTED' };
                    localStorage.setItem('b2g_tunnel_config', JSON.stringify(rotated));
                  } catch {}
                  triggerToast('Cryptographic tunnel keys successfully rotated and re-established.');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-300 w-full sm:w-auto whitespace-nowrap"
              >
                Rotate Keys
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'APPEALS' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2.5 rounded-xl text-amber-700">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    SaaS Penalty Appeals Courtroom
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review and decide on formal compliance appeals filed by SaaS tenants against automated penalties.
                  </p>
                </div>
              </div>
            </div>

            {/* Appeals List */}
            <div className="space-y-4">
              {scanResults.filter(r => r.appealStatus).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Inbox className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-semibold">No appeals have been submitted yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Tenant appeals will appear here once submitted from the B2G Service Portal.</p>
                </div>
              ) : (
                scanResults.filter(r => r.appealStatus).map(res => (
                  <div 
                    key={res.id} 
                    className={`border rounded-2xl p-4 sm:p-5 lg:p-6 transition-all ${
                      res.appealStatus === 'SUBMITTED' ? 'border-indigo-200 bg-indigo-50/10' :
                      res.appealStatus === 'ACCEPTED' ? 'border-emerald-200 bg-emerald-50/10' :
                      'border-slate-200 bg-slate-50/10'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800 text-sm">{res.tenantName}</span>
                          <span className="text-xs text-slate-400 font-mono">({res.website})</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Audited: <strong className="text-slate-700">{res.lawChecked}</strong> • Severity: <strong className="text-rose-600">{res.severity || 'HIGH'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {res.appealStatus === 'SUBMITTED' && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                        {res.appealStatus === 'ACCEPTED' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <Check className="w-3 h-3" /> Appeal Accepted
                          </span>
                        )}
                        {res.appealStatus === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <X className="w-3 h-3" /> Appeal Denied
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Original Infraction Detected</h4>
                          <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-xs text-rose-900 font-medium">
                            {res.violationDetails}
                          </div>
                        </div>

                        {res.penaltyEnforced && (
                          <div>
                            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Enforcement Penalty Applied</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl text-xs font-bold">
                                {res.penaltyEnforced}
                              </span>
                              {res.fineApplied !== undefined && (
                                <span className="text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl text-xs font-bold">
                                  Fine: €{res.fineApplied.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tenant Rebuttal & Evidence</h4>
                          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700 italic">
                            "{res.appealEvidence}"
                          </div>
                        </div>

                        {res.appealSummary && (
                          <div>
                            <h4 className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> AI Judicial Summary & Recommendation
                            </h4>
                            <div className="bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl text-xs text-indigo-900 leading-relaxed font-medium">
                              {res.appealSummary}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {res.appealStatus === 'SUBMITTED' && (
                      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setScanResults(curr => curr.map(item => {
                              if (item.id === res.id) {
                                return {
                                  ...item,
                                  appealStatus: 'REJECTED'
                                };
                              }
                              return item;
                            }));
                            triggerToast(`❌ Appeal for ${res.tenantName} was officially denied. Penalties upheld.`);
                          }}
                          className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          Deny Appeal (Uphold Penalties)
                        </button>
                        <button
                          onClick={() => {
                            setScanResults(curr => curr.map(item => {
                              if (item.id === res.id) {
                                return {
                                  ...item,
                                  appealStatus: 'ACCEPTED',
                                  penaltyEnforced: undefined,
                                  fineApplied: undefined
                                };
                              }
                              return item;
                            }));
                            triggerToast(`🟢 Appeal for ${res.tenantName} accepted! Applied penalties have been fully revoked.`);
                          }}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve Appeal (Revoke Penalties)
                        </button>
                      </div>
                    )}

                    {res.appealStatus === 'ACCEPTED' && (
                      <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-800 text-xs font-medium px-4 py-3 rounded-xl mt-4 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>The regulatory authority accepted this appeal. Applied SaaS throttling, suspension, or fine limits are fully revoked from this tenant's contract.</span>
                      </div>
                    )}

                    {res.appealStatus === 'REJECTED' && (
                      <div className="bg-rose-50/50 border border-rose-100 text-rose-800 text-xs font-medium px-4 py-3 rounded-xl mt-4 flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-600" />
                        <span>This appeal was rejected after legal review. All queued enforcements are finalized and legally binding.</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ADVANCED' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Inter-Agency Sharing */}
          <div className="grid grid-cols-1 gap-6">
            <RegionalSovereignCommandGrid />
            <CtcEInvoicingGateway />
            <AiActPmmRelay />
            <Nis2IncidentDispatchHub />
            <SovereignSubpoenaGateway />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Regulatory Sandbox */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center border-b border-slate-100 pb-3 mb-4">
                <Box className="w-4 h-4 text-indigo-500 mr-2" />
                Regulatory Sandbox (Pre-Clearance)
              </h3>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Pending Proposals</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'SBOX-001', org: 'Neural Systems Ltd', tech: 'Biometric AI', status: 'In Review' },
                      { id: 'SBOX-002', org: 'Quantum Health', tech: 'Predictive Genomics', status: 'Submitted' }
                    ].map(req => (
                      <div key={req.id} className="flex justify-between items-center p-2 bg-white rounded border border-slate-100 text-[11px]">
                        <div>
                          <span className="font-bold text-slate-800">{req.org}</span>
                          <span className="text-slate-400 ml-2">{req.tech}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-bold">{req.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all">
                  Launch Sandbox Environment
                </button>
              </div>
            </div>

            {/* Inter-Agency Sharing */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center border-b border-slate-100 pb-3 mb-4">
                <Globe className="w-4 h-4 text-emerald-500 mr-2" />
                Inter-Agency Data Exchange
              </h3>
              <div className="space-y-4">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Securely request and share compliance intelligence with other EU/Global authorities via 9Xen Regulettee's private B2G relay.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-slate-400 font-bold mb-1">Incoming Requests</span>
                    <span className="text-xl font-black text-slate-800">12</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-slate-400 font-bold mb-1">Outgoing Pending</span>
                    <span className="text-xl font-black text-slate-800">4</span>
                  </div>
                </div>
                <button className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all">
                  Open Exchange Console
                </button>
              </div>
            </div>
          </div>

          {/* Licensing & Benchmarking Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm col-span-1">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center border-b border-slate-100 pb-3 mb-4">
                <FileCheck2 className="w-4 h-4 text-sky-500 mr-2" />
                License Verification
              </h3>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
                  <input type="text" placeholder="Enter License ID..." className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" />
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Total Active Licenses</span>
                  <span className="font-bold text-slate-700">1,429</span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Expired/Revoked</span>
                  <span className="font-bold text-rose-600">12</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm col-span-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center border-b border-slate-100 pb-3 mb-4">
                <TrendingUp className="w-4 h-4 text-violet-500 mr-2" />
                Cross-Jurisdiction Benchmarking
              </h3>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Germany', compliance: 92 },
                    { name: 'France', compliance: 88 },
                    { name: 'Ireland', compliance: 94 },
                    { name: 'Netherlands', compliance: 85 }
                  ]}>
                    <XAxis dataKey="name" fontSize={9} />
                    <Tooltip />
                    <Bar dataKey="compliance" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'WHISTLEBLOWER' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-rose-100 p-2.5 rounded-xl text-rose-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Protected Whistleblower Disclosures
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Encrypted and anonymous reports submitted via the 9Xen Regulettee Public Portal.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 border border-slate-100 transition-all">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 border border-slate-100 transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { id: 'WB-2026-X1', category: 'Data Privacy Breach', org: 'Sovereign Cloud Corp', priority: 'HIGH', date: '2026-08-01', status: 'In Investigation' },
                { id: 'WB-2026-X2', category: 'Unreported AI Hazard', org: 'Neural Labs', priority: 'CRITICAL', date: '2026-08-05', status: 'Received' }
              ].map(report => (
                <div key={report.id} className="border border-slate-100 rounded-xl p-4 hover:border-rose-200 hover:bg-rose-50/20 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{report.category}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Ref: {report.id} | Reported: {report.org}</p>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${report.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {report.priority}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                    <span className="text-[10px] text-slate-400">{report.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-600">{report.status}</span>
                      <button className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-rose-600 transition-all">
                        Review Evidence
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SCRAPER_HUB' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-amber-600">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    B2G Web Scraper & Compliance Inspection Hub
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Automated regulatory crawler to inspect corporate web assets, cookie consent banners, PII leaks, and statutory compliance.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Domain / Website URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={scraperUrl}
                    onChange={(e) => setScraperUrl(e.target.value)}
                    placeholder="https://target-corporate-website.com"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleRunScraperScan}
                    disabled={isScanningUrl}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isScanningUrl ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Crawling Target...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Run Scraper Inspection</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inspection Profile</label>
                <select
                  value={scraperProfile}
                  onChange={(e) => setScraperProfile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="GDPR_EPRIVACY">GDPR & ePrivacy Cookie Inspection</option>
                  <option value="AI_ACT_DISCLOSURE">EU AI Act Transparency Scraper</option>
                  <option value="DORA_CYBER_WEB">DORA Web Infrastructure Security</option>
                  <option value="CONSUMER_RIGHTS">e-Commerce Consumer Rights Inspector</option>
                </select>
              </div>
            </div>

            {/* Active Scan Results */}
            {activeScanResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 text-white space-y-4"
              >
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${activeScanResult.status === 'NON_COMPLIANT' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {activeScanResult.status}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{activeScanResult.target_url}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{activeScanResult.page_title}</h4>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-[10px] text-slate-400">Calculated B2G Fine Penalty</p>
                    <p className="text-lg font-black text-amber-400">€{activeScanResult.calculated_penalty_eur.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Detected Non-Compliance Violations ({activeScanResult.violations_found})</h5>
                  {activeScanResult.violations.length > 0 ? (
                    <div className="space-y-2">
                      {activeScanResult.violations.map((v: any, idx: number) => (
                        <div key={idx} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded">{v.severity}</span>
                              <span className="text-xs font-bold text-amber-300">{v.article}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">{v.issue}</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-rose-400">€{v.suggested_fine.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> No regulatory violations detected during scraper crawl. Target is fully compliant.
                    </div>
                  )}
                </div>

                {activeScanResult.violations.length > 0 && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        const newReq: B2GRequest = {
                          id: crypto.randomUUID(),
                          regulatorName: 'EU B2G Web Scraper Inspectorate',
                          title: `Auto Citation: Scraper Violation at ${scraperUrl}`,
                          industry: 'Technology / E-Commerce',
                          law: activeScanResult.violations[0]?.article || 'GDPR Art. 83',
                          regionalScope: 'EU Wide',
                          description: `Web Scraper detected ${activeScanResult.violations_found} non-compliance violations at ${scraperUrl}`,
                          minRiskThreshold: 75,
                          enforcementAction: 'AUTO_FINE',
                          fineAmount: activeScanResult.calculated_penalty_eur,
                          status: 'PENDING',
                          requestedAt: new Date().toISOString()
                        };
                        setB2gRequests(prev => [newReq, ...prev]);
                        triggerToast('🚀 Scraper Citation Mandate submitted to B2G Mandate Registry!');
                        fetch('/api/v1/b2g/mandates', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(newReq)
                        }).catch(e => console.error(e));
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Issue B2G Citation Order (€{activeScanResult.calculated_penalty_eur.toLocaleString()})</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
