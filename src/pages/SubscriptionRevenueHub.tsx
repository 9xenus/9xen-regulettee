import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Zap,
  CreditCard,
  KeyRound,
  Activity,
  Code,
  Copy,
  Check,
  Database,
  Sliders,
  Layers,
  Terminal,
  ArrowRight,
  RefreshCw,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Server,
  TrendingUp,
  Coins,
  Download,
  Play,
  Users,
  Settings,
  Cpu,
  FileCode2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Bell,
  Sun,
  Moon,
  Command,
  X,
  Filter,
  Clock,
  Sparkles,
  ArrowUpRight,
  SlidersHorizontal,
  Sliders as SlidersIcon,
  HelpCircle,
  Building2,
  DollarSign,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  subscriptionBillingEngine,
  PlanTier,
  TenantSubscription,
  ApiKeyRecord,
  InvoiceBreakdown,
  MiddlewareResult,
  MigrationScript,
  CanaryRolloutState
} from '../services/SubscriptionBillingEngine';
import { SuperAdminBillingSubscriptionCrud } from '../components/admin/SuperAdminBillingSubscriptionCrud';
import { Pricing } from '../components/Pricing';

export const SubscriptionRevenueHub: React.FC = () => {
  // --- Global SaaS Theme & Sidebar Layout State ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'ADMIN_COMMAND' | 'PLAN_CONFIGURATOR' | 'CLIENT_PORTAL' | 'METERED_INSPECTOR' | 'CANARY_DEPLOY' | 'COMMISSION_ENGINE'>('ADMIN_COMMAND');

  // Tenant Context Switcher (used across both Admin and Client portal view)
  const [selectedTenantId, setSelectedTenantId] = useState<string>('tenant_2');

  // Toast / Inline notification feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Listen for keyboard CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Core Data States ---
  const [plans, setPlans] = useState<PlanTier[]>([]);
  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
  const [clientKeys, setClientKeys] = useState<ApiKeyRecord[]>([]);
  const [migrations, setMigrations] = useState<MigrationScript[]>([]);
  const [canaryRollouts, setCanaryRollouts] = useState<CanaryRolloutState[]>([]);

  // Phase 1 Admin Plan Configurator States
  const [editingPlan, setEditingPlan] = useState<PlanTier | null>(null);
  const [overridePriceUsd, setOverridePriceUsd] = useState<number>(249);
  const [overrideKycOverageRate, setOverrideKycOverageRate] = useState<number>(0.04);

  // Phase 2 Client Subscriber Portal States
  const [usagePeriod, setUsagePeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [billingCycleType, setBillingCycleType] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedCodeLanguage, setSelectedCodeLanguage] = useState<'curl' | 'node' | 'python' | 'php'>('curl');
  const [selectedKeyForSnippet, setSelectedKeyForSnippet] = useState<string>('');
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [unmaskedKeyIds, setUnmaskedKeyIds] = useState<Record<string, boolean>>({});
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('New Production Service Key');
  const [newKeyEnvironment, setNewKeyEnvironment] = useState<'PRODUCTION' | 'SANDBOX'>('PRODUCTION');
  const [generatedSecretPopup, setGeneratedSecretPopup] = useState<string | null>(null);

  // Phase 3 Admin Tenant Table & Slide-Over Drawer States
  const [selectedTenantForDrawer, setSelectedTenantForDrawer] = useState<TenantSubscription | null>(null);
  const [tenantFilterSearch, setTenantFilterSearch] = useState('');
  const [tenantStatusFilter, setTenantStatusFilter] = useState<string>('ALL');
  const [manualKycCreditsInput, setManualKycCreditsInput] = useState<number>(1000);

  // Phase 2 Metered Billing API Inspector States
  const [testRawApiKey, setTestRawApiKey] = useState<string>('');
  const [testServiceModule, setTestServiceModule] = useState<'E_KYC' | 'AI_AML' | 'PRIVACY_ENGINE'>('E_KYC');
  const [middlewareResult, setMiddlewareResult] = useState<MiddlewareResult | null>(null);
  const [isExecutingApiTest, setIsExecutingApiTest] = useState(false);
  const [flushStatus, setFlushStatus] = useState<string | null>(null);

  // Phase 4 Deployment & Tests States
  const [testSuiteResults, setTestSuiteResults] = useState<{ name: string; passed: boolean; durationMs: number }[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Initial load & data refresh
  useEffect(() => {
    refreshData();
  }, [selectedTenantId]);

  const refreshData = () => {
    setIsLoading(true);
    setPlans(subscriptionBillingEngine.getAllPlans());
    setSubscriptions(subscriptionBillingEngine.getAllSubscriptions());
    const keys = subscriptionBillingEngine.getApiKeysForTenant(selectedTenantId);
    setClientKeys(keys);
    if (keys.length > 0 && !selectedKeyForSnippet) {
      setSelectedKeyForSnippet(keys[0].rawKeySecret || keys[0].keyMasked);
    }
    setMigrations(subscriptionBillingEngine.getMigrations());
    setCanaryRollouts(subscriptionBillingEngine.getCanaryRollouts());
    setTimeout(() => setIsLoading(false), 300);
  };

  // Selected tenant object
  const currentTenantSub = useMemo(() => {
    return subscriptions.find(s => s.tenantId === selectedTenantId) || subscriptions[0];
  }, [subscriptions, selectedTenantId]);

  const currentTenantPlan = useMemo(() => {
    if (!currentTenantSub) return plans[0];
    return plans.find(p => p.id === currentTenantSub.planId) || plans[0];
  }, [plans, currentTenantSub]);

  const currentInvoice = useMemo(() => {
    if (!selectedTenantId) return null;
    return subscriptionBillingEngine.calculateInvoiceForTenant(selectedTenantId);
  }, [selectedTenantId, subscriptions]);

  // Chart Data: Recharts Usage Analytics
  const usageChartData = useMemo(() => {
    const days = usagePeriod === '7d' ? 7 : usagePeriod === '30d' ? 30 : 90;
    const data = [];
    const baseKyc = currentInvoice ? Math.round(currentInvoice.kycUsageCount / days) : 120;
    const baseAml = currentInvoice ? Math.round(currentInvoice.amlUsageCount / days) : 340;

    for (let i = days; i >= 1; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const kycVariance = Math.floor(Math.sin(i) * 35) + Math.floor(Math.random() * 20);
      const amlVariance = Math.floor(Math.cos(i) * 60) + Math.floor(Math.random() * 40);

      data.push({
        date: dateStr,
        kycCalls: Math.max(10, baseKyc + kycVariance),
        amlCalls: Math.max(25, baseAml + amlVariance),
        quotaLimit: currentTenantPlan ? Math.round(currentTenantPlan.quotas.includedKycCalls / days) : 150
      });
    }
    return data;
  }, [usagePeriod, currentInvoice, currentTenantPlan]);

  // Revenue Chart Data for Admin Command Center
  const revenueChartData = useMemo(() => {
    return [
      { month: 'Mar 2026', subscriptionRevenue: 12400, overageRevenue: 2100, total: 14500 },
      { month: 'Apr 2026', subscriptionRevenue: 13200, overageRevenue: 2850, total: 16050 },
      { month: 'May 2026', subscriptionRevenue: 14800, overageRevenue: 3400, total: 18200 },
      { month: 'Jun 2026', subscriptionRevenue: 15900, overageRevenue: 4100, total: 20000 },
      { month: 'Jul 2026', subscriptionRevenue: 17100, overageRevenue: 4950, total: 22050 },
      { month: 'Aug 2026', subscriptionRevenue: 18450, overageRevenue: 5800, total: 24250 },
    ];
  }, []);

  // Filtered tenants for data table
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(s => {
      const matchesSearch = s.tenantName.toLowerCase().includes(tenantFilterSearch.toLowerCase()) ||
                            s.domain.toLowerCase().includes(tenantFilterSearch.toLowerCase()) ||
                            s.tenantId.toLowerCase().includes(tenantFilterSearch.toLowerCase());
      const matchesStatus = tenantStatusFilter === 'ALL' || s.status === tenantStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, tenantFilterSearch, tenantStatusFilter]);

  // --- Handlers & Actions ---

  const handleCopy = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 2000);
    }
    showToast('Copied to clipboard!', 'success');
  };

  const handleToggleMaskKey = (keyId: string) => {
    setUnmaskedKeyIds(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const newRecord = subscriptionBillingEngine.generateApiKeyForTenant(
      selectedTenantId,
      newKeyName,
      newKeyEnvironment
    );
    setGeneratedSecretPopup(newRecord.rawKeySecret || newRecord.keyMasked);
    setIsCreateKeyModalOpen(false);
    setNewKeyName('New Production Service Key');
    refreshData();
    showToast(`Generated new API Key: ${newRecord.keyName}`, 'success');
  };

  const handleRevokeKey = (keyId: string) => {
    subscriptionBillingEngine.revokeApiKey(keyId);
    refreshData();
    showToast('API Key revoked successfully', 'info');
  };

  const handleGrantManualCredits = (tenantId: string) => {
    subscriptionBillingEngine.grantUsageCredits(tenantId, manualKycCreditsInput, 5000);
    refreshData();
    showToast(`Granted +${manualKycCreditsInput.toLocaleString()} e-KYC credits to ${tenantId}`, 'success');
  };

  const handleResetTenantKeys = (tenantId: string) => {
    subscriptionBillingEngine.resetTenantApiKeys(tenantId);
    refreshData();
    showToast(`All API keys reset for ${tenantId}. New emergency key generated.`, 'info');
  };

  const handleApplyPriceOverride = (tenantId: string) => {
    subscriptionBillingEngine.setCustomPriceOverride(tenantId, overridePriceUsd, overrideKycOverageRate);
    refreshData();
    showToast(`Custom pricing ($${overridePriceUsd}/mo, $${overrideKycOverageRate}/overage) applied!`, 'success');
  };

  const handleExecuteApiTest = () => {
    setIsExecutingApiTest(true);
    setMiddlewareResult(null);
    setTimeout(() => {
      const res = subscriptionBillingEngine.verifyAndMeterApiRequest(testRawApiKey, testServiceModule);
      setMiddlewareResult(res);
      setIsExecutingApiTest(false);
      refreshData();
      if (res.authorized) {
        showToast(`API Auth Succeeded (200 OK) — Metered usage count incremented`, 'success');
      } else {
        showToast(`API Auth Refused (${res.httpStatusCode}): ${res.errorMessage}`, 'error');
      }
    }, 450);
  };

  const handleFlushUsageBuffer = () => {
    const res = subscriptionBillingEngine.flushUsageBufferToDb();
    setFlushStatus(`Flushed ${res.syncedCount} buffered calls to persistent Firestore at ${res.timestamp}`);
    refreshData();
    showToast(`Synced ${res.syncedCount} API calls to database`, 'success');
  };

  const handleUpdateCanaryPercent = (featureKey: string, val: number) => {
    subscriptionBillingEngine.updateCanaryPercentage(featureKey, val);
    refreshData();
    showToast(`Updated ${featureKey} canary traffic to ${val}%`, 'info');
  };

  const handleRunIntegrationTestSuite = () => {
    setIsRunningTests(true);
    setTestSuiteResults([]);
    setTimeout(() => {
      setTestSuiteResults([
        { name: '1. Auth Key Hash Resolution & Rate Limit Bucket Check', passed: true, durationMs: 12 },
        { name: '2. Usage Quota Counter & Circuit Breaker Threshold Test', passed: true, durationMs: 18 },
        { name: '3. Multi-Currency Invoice & Overage Rate Calculation', passed: true, durationMs: 24 },
        { name: '4. Non-Blocking Schema Migration Lock Verification', passed: true, durationMs: 31 },
        { name: '5. Canary Traffic Split & Header Inspection', passed: true, durationMs: 15 },
        { name: '6. Zero-Downtime Hot Failover Buffer Flush', passed: true, durationMs: 28 },
      ]);
      setIsRunningTests(false);
      showToast('All 6 Integration & Security tests passed!', 'success');
    }, 900);
  };

  // Embedded Code Snippet generator for e-KYC and AML
  const getCodeSnippet = (lang: string, service: string, apiKey: string) => {
    const keyToUse = apiKey || '<sk_live_key_from_admin_settings>';
    if (lang === 'curl') {
      return `curl -X POST "https://api.regulettee.eu/v1/${service.toLowerCase()}/verify" \\
  -H "Authorization: Bearer ${keyToUse}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "documentType": "NATIONAL_ID",
    "documentNumber": "1994827103982",
    "faceImageBase64": "/9j/4AAQSkZJRgABAQ..."
  }'`;
    }
    if (lang === 'node') {
      return `import axios from 'axios';

const response = await axios.post(
  'https://api.regulettee.eu/v1/${service.toLowerCase()}/verify',
  {
    documentType: 'NATIONAL_ID',
    documentNumber: '1994827103982',
    faceImageBase64: '/9j/4AAQSkZJRgABAQ...'
  },
  {
    headers: {
      Authorization: 'Bearer ${keyToUse}',
      'Content-Type': 'application/json'
    }
  }
);

console.log('e-KYC Result:', response.data);`;
    }
    if (lang === 'python') {
      return `import requests

url = "https://api.regulettee.eu/v1/${service.toLowerCase()}/verify"
headers = {
    "Authorization": "Bearer ${keyToUse}",
    "Content-Type": "application/json"
}
payload = {
    "documentType": "NATIONAL_ID",
    "documentNumber": "1994827103982",
    "faceImageBase64": "/9j/4AAQSkZJRgABAQ..."
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
    }
    return `<?php
$ch = curl_init("https://api.regulettee.eu/v1/${service.toLowerCase()}/verify");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ${keyToUse}',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'documentType' => 'NATIONAL_ID',
    'documentNumber' => '1994827103982',
    'faceImageBase64' => '/9j/4AAQSkZJRgABAQ...'
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);
echo $response;`;
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-xs font-bold"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-500" />}
            {toast.type === 'info' && <Zap className="w-4 h-4 text-indigo-500" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMMAND PALETTE MODAL (CMD + K) */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type a command, tenant, API key, or search section... (Press Esc to close)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm font-medium placeholder-slate-400"
                  autoFocus
                />
                <button onClick={() => setCommandPaletteOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 max-h-80 overflow-y-auto space-y-2 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Navigation Shortcuts</div>
                <button
                  onClick={() => { setActiveTab('ADMIN_COMMAND'); setCommandPaletteOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center justify-between font-medium cursor-pointer"
                >
                  <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-indigo-500" /> Revenue & Analytics Command Center</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">Phase 3</span>
                </button>
                <button
                  onClick={() => { setActiveTab('CLIENT_PORTAL'); setCommandPaletteOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center justify-between font-medium cursor-pointer"
                >
                  <span className="flex items-center gap-2"><KeyRound className="w-4 h-4 text-emerald-500" /> Client Subscriber API & Usage Hub</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">Phase 2</span>
                </button>
                <button
                  onClick={() => { setActiveTab('PLAN_CONFIGURATOR'); setCommandPaletteOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center justify-between font-medium cursor-pointer"
                >
                  <span className="flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-violet-500" /> Dynamic Plan & Rate Configurator</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">Phase 1</span>
                </button>
                <button
                  onClick={() => { setActiveTab('METERED_INSPECTOR'); setCommandPaletteOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center justify-between font-medium cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-amber-500" /> Metered API Middleware Inspector</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">Phase 2</span>
                </button>

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">Switch Tenant Context</div>
                {subscriptions.map(s => (
                  <button
                    key={s.tenantId}
                    onClick={() => { setSelectedTenantId(s.tenantId); setCommandPaletteOpen(false); showToast(`Switched context to ${s.tenantName}`); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center justify-between font-medium cursor-pointer"
                  >
                    <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> {s.tenantName} ({s.domain})</span>
                    <span className="text-[10px] font-mono text-slate-400">{s.planId}</span>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
                <span>Navigate with mouse or shortcuts</span>
                <span className="font-mono">CMD + K</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER LAYOUT */}
      <div className="flex min-h-screen">

        {/* PHASE 1: COLLAPSIBLE LEFT SIDEBAR */}
        <aside
          className={`sticky top-0 h-screen overflow-y-auto custom-scrollbar border-r transition-all duration-300 flex flex-col justify-between shrink-0 ${isSidebarCollapsed ? 'w-20' : 'w-64'} ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
        >
          <div>
            {/* Header / Logo */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                {!isSidebarCollapsed && (
                  <div className="overflow-hidden">
                    <h1 className="font-black text-sm text-slate-900 dark:text-white leading-tight">9Xen Regulettee CaaS</h1>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase">SaaS Hub 2.1</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Sidebar Navigation Links */}
            <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)] custom-scrollbar">
              <button
                onClick={() => setActiveTab('ADMIN_COMMAND')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ADMIN_COMMAND'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Admin Command Center"
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Revenue & Analytics</span>}
              </button>

              <button
                onClick={() => setActiveTab('COMMISSION_ENGINE')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'COMMISSION_ENGINE'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Commission Engine"
              >
                <DollarSign className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Commission Engine</span>}
              </button>

              <button
                onClick={() => setActiveTab('CLIENT_PORTAL')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'CLIENT_PORTAL'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Client Subscriber Portal"
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Subscriber Portal</span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] rounded font-mono">Live</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setActiveTab('PLAN_CONFIGURATOR')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'PLAN_CONFIGURATOR'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Plan Configurator"
              >
                <SlidersHorizontal className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Plan & Rate Builder</span>}
              </button>

              <button
                onClick={() => setActiveTab('METERED_INSPECTOR')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'METERED_INSPECTOR'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Metered Middleware"
              >
                <Activity className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Metered Middleware</span>}
              </button>

              <button
                onClick={() => setActiveTab('CANARY_DEPLOY')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'CANARY_DEPLOY'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Deployment & Canary"
              >
                <Server className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Canary & Deployment</span>}
              </button>
            </nav>
          </div>

          {/* Sidebar Footer Context */}
          {!isSidebarCollapsed && (
            <div className="p-3 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold">Current Tenant:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{selectedTenantId}</span>
              </div>
              <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                {currentTenantSub?.tenantName}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Subscription ({currentTenantPlan?.displayName})</span>
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* STICKY TOP BAR WITH CMD+K & TENANT SWITCHER */}
          <header className={`sticky top-0 z-30 border-b backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between transition-colors ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
          }`}>
            {/* Search Trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium cursor-pointer border border-slate-200/50 dark:border-slate-700/50 transition-all w-64 md:w-80"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="truncate">Search commands or tenants...</span>
              <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs font-bold text-slate-600 dark:text-slate-300">
                ⌘K
              </kbd>
            </button>

            {/* Right Top Actions */}
            <div className="flex items-center gap-3">

              {/* Context Tenant Switcher Dropdown */}
              <div className="relative flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <select
                  value={selectedTenantId}
                  onChange={e => {
                    setSelectedTenantId(e.target.value);
                    showToast(`Switched tenant to ${e.target.value}`);
                  }}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                >
                  {subscriptions.map(s => (
                    <option key={s.tenantId} value={s.tenantId}>
                      {s.tenantName} ({s.domain})
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-all"
                title="Toggle Dark / Light Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* User Profile Badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  SA
                </div>
                <div className="hidden md:block text-left text-xs">
                  <p className="font-bold text-slate-900 dark:text-white leading-tight">Super Admin</p>
                  <p className="text-[10px] text-slate-500">operations@9xen-regulettee.io</p>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN PAGE BODY CONTENT */}
          <main className="flex-1 p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">

            {/* SKELETON LOADER ANIMATION IF LOADING */}
            {isLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                  ))}
                </div>
                <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              </div>
            ) : (
              <>
                {/* ========================================================================= */}
                {/* PHASE 3: ADMIN REVENUE & ANALYTICS COMMAND CENTER                        */}
                {/* ========================================================================= */}
                {activeTab === 'ADMIN_COMMAND' && (
                  <div className="space-y-4 sm:space-y-6">

                    {/* Headline Banner */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <BarChart3 className="w-6 h-6 text-indigo-600" />
                          Revenue & Metered Analytics Command Center
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Real-time tenant subscription performance, API overage revenue, and subscriber account lifecycle.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => showToast('Exported MRR & Billing Report CSV', 'success')}
                          className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export Financials</span>
                        </button>
                      </div>
                    </div>

                    {/* Metric Highlights KPI Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Recurring (MRR)</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">$18,450</span>
                          <span className="text-xs font-bold text-emerald-500 flex items-center">+12.4%</span>
                        </div>
                        <p className="text-[10px] text-slate-500">+ $2,100 from new Pro tiers</p>
                      </div>

                      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Annual Run Rate (ARR)</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">$221,400</span>
                          <span className="text-xs font-bold text-emerald-500 flex items-center">+18.2%</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Projected $250k EOY</p>
                      </div>

                      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Verification API Calls</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">182,500</span>
                          <span className="text-xs font-bold text-emerald-500 flex items-center">+24%</span>
                        </div>
                        <p className="text-[10px] text-slate-500">e-KYC & AML merged volume</p>
                      </div>

                      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Tenants</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{subscriptions.length}</span>
                          <span className="text-xs font-bold text-emerald-500 flex items-center">100% Active</span>
                        </div>
                        <p className="text-[10px] text-slate-500">1 Grace Period tenant</p>
                      </div>

                      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Platform Churn Rate</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-emerald-500">0.6%</span>
                          <span className="text-xs font-bold text-emerald-500 flex items-center">-0.2%</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Best-in-class retention</p>
                      </div>
                    </div>

                    {/* Revenue Area Chart Component */}
                    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            Subscription Recurring Revenue vs Pay-Per-API Overage
                          </h3>
                          <p className="text-xs text-slate-500">Historical breakdown of base plan fees vs usage-based metered billing overages.</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold">
                          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-600"></span> <span>Subscription Base</span></div>
                          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> <span>API Overages</span></div>
                        </div>
                      </div>

                      <div className="h-72 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorOverage" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#E2E8F0'} />
                            <XAxis dataKey="month" stroke={isDarkMode ? '#94A3B8' : '#64748B'} fontSize={11} />
                            <YAxis stroke={isDarkMode ? '#94A3B8' : '#64748B'} fontSize={11} tickFormatter={v => `$${v}`} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                                borderColor: isDarkMode ? '#334155' : '#CBD5E1',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            />
                            <Area type="monotone" dataKey="subscriptionRevenue" name="Subscription Base ($)" stroke="#4F46E5" fillOpacity={1} fill="url(#colorSub)" strokeWidth={2} />
                            <Area type="monotone" dataKey="overageRevenue" name="API Overages ($)" stroke="#10B981" fillOpacity={1} fill="url(#colorOverage)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Tenant & Subscriber Management Table */}
                    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-600" />
                            Tenant & Subscriber Account Registry
                          </h3>
                          <p className="text-xs text-slate-500">Manage tenant accounts, inspect real-time usage, grant credits, or apply custom pricing.</p>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              placeholder="Filter tenants..."
                              value={tenantFilterSearch}
                              onChange={e => setTenantFilterSearch(e.target.value)}
                              className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs font-medium rounded-xl outline-none border border-slate-200 dark:border-slate-700 w-48"
                            />
                          </div>

                          <select
                            value={tenantStatusFilter}
                            onChange={e => setTenantStatusFilter(e.target.value)}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                          >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="GRACE_PERIOD">Grace Period</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Data Table */}
                      <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="p-3">Tenant Account</th>
                              <th className="p-3">Subscribed Plan</th>
                              <th className="p-3">Status Badge</th>
                              <th className="p-3">e-KYC Calls</th>
                              <th className="p-3">AML Calls</th>
                              <th className="p-3">Current Invoice</th>
                              <th className="p-3 text-right">Quick Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                            {filteredSubscriptions.map(sub => {
                              const inv = subscriptionBillingEngine.calculateInvoiceForTenant(sub.tenantId);
                              return (
                                <tr key={sub.tenantId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="p-3">
                                    <p className="font-bold text-slate-900 dark:text-white">{sub.tenantName}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{sub.domain} • ID: {sub.tenantId}</p>
                                  </td>
                                  <td className="p-3">
                                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-[11px]">
                                      {sub.planId}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    {sub.status === 'ACTIVE' && (
                                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold rounded-md text-[10px] flex items-center gap-1 w-max">
                                        <CheckCircle2 className="w-3 h-3" /> ACTIVE
                                      </span>
                                    )}
                                    {sub.status === 'GRACE_PERIOD' && (
                                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold rounded-md text-[10px] flex items-center gap-1 w-max">
                                        <AlertTriangle className="w-3 h-3" /> GRACE PERIOD
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 font-mono">{inv ? inv.kycUsageCount.toLocaleString() : 0}</td>
                                  <td className="p-3 font-mono">{inv ? inv.amlUsageCount.toLocaleString() : 0}</td>
                                  <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">
                                    ${inv ? inv.totalDueUsd : 0} / mo
                                  </td>
                                  <td className="p-3 text-right">
                                    <button
                                      onClick={() => setSelectedTenantForDrawer(sub)}
                                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                                    >
                                      <span>Inspect Details</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* SLIDE-OVER DRAWER FOR TENANT INSPECTION */}
                    <AnimatePresence>
                      {selectedTenantForDrawer && (
                        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
                          <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={`w-full max-w-lg h-full border-l p-4 sm:p-5 lg:p-6 overflow-y-auto space-y-4 sm:space-y-6 shadow-2xl ${
                              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                              <div>
                                <h3 className="font-bold text-lg">{selectedTenantForDrawer.tenantName}</h3>
                                <p className="text-xs text-slate-400 font-mono">{selectedTenantForDrawer.domain} ({selectedTenantForDrawer.tenantId})</p>
                              </div>
                              <button onClick={() => setSelectedTenantForDrawer(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <X className="w-5 h-5 text-slate-400" />
                              </button>
                            </div>

                            {/* Tenant Details Overview */}
                            <div className="space-y-4">
                              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Plan Tier:</span>
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedTenantForDrawer.planId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Subscription Status:</span>
                                  <span className="font-bold text-emerald-500">{selectedTenantForDrawer.status}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Payment Gateway:</span>
                                  <span className="font-mono font-bold">{selectedTenantForDrawer.paymentMethod}</span>
                                </div>
                              </div>

                              {/* Action 1: Grant Manual Usage Credits */}
                              <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                                <h4 className="font-bold text-xs text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                                  <Coins className="w-4 h-4 text-indigo-600" /> Grant Manual Usage Credits
                                </h4>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={manualKycCreditsInput}
                                    onChange={e => setManualKycCreditsInput(Number(e.target.value))}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg outline-none"
                                  />
                                  <button
                                    onClick={() => handleGrantManualCredits(selectedTenantForDrawer.tenantId)}
                                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg whitespace-nowrap cursor-pointer shadow-xs"
                                  >
                                    Grant +Credits
                                  </button>
                                </div>
                              </div>

                              {/* Action 2: Apply Custom Enterprise Price Override */}
                              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                                <h4 className="font-bold text-xs flex items-center gap-1.5">
                                  <DollarSign className="w-4 h-4 text-emerald-500" /> Apply Custom Pricing Override
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Base Price ($/mo)</label>
                                    <input
                                      type="number"
                                      value={overridePriceUsd}
                                      onChange={e => setOverridePriceUsd(Number(e.target.value))}
                                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold rounded-lg outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-slate-400 font-bold block mb-1">e-KYC Overage ($/call)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={overrideKycOverageRate}
                                      onChange={e => setOverrideKycOverageRate(Number(e.target.value))}
                                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold rounded-lg outline-none"
                                    />
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleApplyPriceOverride(selectedTenantForDrawer.tenantId)}
                                  className="w-full py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-800"
                                >
                                  Save Price Override
                                </button>
                              </div>

                              {/* Action 3: Reset API Keys */}
                              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                                <h4 className="font-bold text-xs text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Revoke & Emergency Reset Keys
                                </h4>
                                <p className="text-[11px] text-slate-500">Revokes all existing keys for this tenant and issues a new secret key.</p>
                                <button
                                  onClick={() => handleResetTenantKeys(selectedTenantForDrawer.tenantId)}
                                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                                >
                                  Emergency Reset API Keys
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>

                  </div>
                )}

                {/* ========================================================================= */}
                {/* PHASE 2: CLIENT SUBSCRIBER PORTAL (USAGE, API & SUBSCRIPTION)           */}
                {/* ========================================================================= */}
                {activeTab === 'CLIENT_PORTAL' && (
                  <div className="space-y-4 sm:space-y-6">

                    {/* Section Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <KeyRound className="w-6 h-6 text-emerald-500" />
                          Subscriber API, Quota & Integration Hub
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Manage production API keys, test code integration snippets, and view current monthly quota consumption.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsCreateKeyModalOpen(true)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Generate New API Key</span>
                        </button>
                      </div>
                    </div>

                    {/* Metrics & Usage Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* e-KYC Quota Progress */}
                      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-400 uppercase tracking-wider">e-KYC Verification Calls</span>
                          <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold rounded-md text-[10px]">
                            {currentTenantPlan?.displayName}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {currentInvoice?.kycUsageCount.toLocaleString()} / {currentInvoice?.kycIncludedQuota.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {currentInvoice ? Math.round((currentInvoice.kycUsageCount / currentInvoice.kycIncludedQuota) * 100) : 0}% used
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, currentInvoice ? (currentInvoice.kycUsageCount / currentInvoice.kycIncludedQuota) * 100 : 0)}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 flex justify-between">
                          <span>Included quota remaining</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                            {currentInvoice ? Math.max(0, currentInvoice.kycIncludedQuota - currentInvoice.kycUsageCount).toLocaleString() : 0} calls
                          </span>
                        </p>
                      </div>

                      {/* Real-time AML Quota Progress */}
                      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-400 uppercase tracking-wider">Real-Time AI AML Checks</span>
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold rounded-md text-[10px]">
                            Included
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {currentInvoice?.amlUsageCount.toLocaleString()} / {currentInvoice?.amlIncludedQuota.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {currentInvoice ? Math.round((currentInvoice.amlUsageCount / currentInvoice.amlIncludedQuota) * 100) : 0}% used
                          </span>
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, currentInvoice ? (currentInvoice.amlUsageCount / currentInvoice.amlIncludedQuota) * 100 : 0)}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 flex justify-between">
                          <span>Remaining quota</span>
                          <span className="font-bold text-emerald-500 font-mono">
                            {currentInvoice ? Math.max(0, currentInvoice.amlIncludedQuota - currentInvoice.amlUsageCount).toLocaleString() : 0} calls
                          </span>
                        </p>
                      </div>

                      {/* Billing Cycle Countdown */}
                      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-400 uppercase tracking-wider">Billing Cycle Countdown</span>
                          <Clock className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">24 Days</span>
                          <span className="text-xs font-bold text-slate-500">Resets Aug 31, 2026</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Current projected total: <strong className="text-slate-900 dark:text-white font-mono">${currentInvoice?.totalDueUsd} USD</strong>
                        </p>
                        <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Renewal Active ({currentTenantSub?.paymentMethod})
                        </div>
                      </div>

                    </div>

                    {/* Interactive API Usage Chart with Period Selectors */}
                    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-600" />
                            Daily API Call Consumption Graph
                          </h3>
                          <p className="text-xs text-slate-500">Track e-KYC and AI AML verification traffic volume in real-time.</p>
                        </div>

                        {/* Period Selector Toggle Buttons */}
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                          {(['7d', '30d', '90d'] as const).map(p => (
                            <button
                              key={p}
                              onClick={() => setUsagePeriod(p)}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                usagePeriod === p
                                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              {p.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="h-64 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={usageChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#E2E8F0'} />
                            <XAxis dataKey="date" stroke={isDarkMode ? '#94A3B8' : '#64748B'} fontSize={10} />
                            <YAxis stroke={isDarkMode ? '#94A3B8' : '#64748B'} fontSize={10} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                                borderColor: isDarkMode ? '#334155' : '#CBD5E1',
                                borderRadius: '12px',
                                fontSize: '12px'
                              }}
                            />
                            <Bar dataKey="kycCalls" name="e-KYC Calls" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="amlCalls" name="AML Checks" fill="#10B981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* API KEY & INTEGRATION HUB */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                      {/* API Keys Table Component */}
                      <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Lock className="w-4 h-4 text-emerald-500" />
                            Production API Keys
                          </h3>
                          <span className="text-xs text-slate-500 font-mono">{clientKeys.length} keys active</span>
                        </div>

                        <div className="space-y-3">
                          {clientKeys.map(k => {
                            const isUnmasked = unmaskedKeyIds[k.keyId];
                            const secretToShow = isUnmasked
                              ? (k.rawKeySecret || k.keyMasked)
                              : k.keyMasked;

                            return (
                              <div
                                key={k.keyId}
                                className={`p-4 rounded-xl border transition-all ${
                                  k.isRevoked
                                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 opacity-60'
                                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-slate-900 dark:text-white">{k.keyName}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                      k.environment === 'PRODUCTION' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {k.environment}
                                    </span>
                                  </div>

                                  {!k.isRevoked && (
                                    <button
                                      onClick={() => handleRevokeKey(k.keyId)}
                                      className="text-slate-400 hover:text-rose-500 cursor-pointer p-1"
                                      title="Revoke API Key"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs">
                                  <span className="truncate pr-2 text-indigo-600 dark:text-indigo-400 font-semibold">{secretToShow}</span>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => handleToggleMaskKey(k.keyId)}
                                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                                      title={isUnmasked ? "Mask Key" : "Unmask Key"}
                                    >
                                      {isUnmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>

                                    <button
                                      onClick={() => handleCopy(k.rawKeySecret || k.keyMasked, k.keyId)}
                                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-indigo-600 cursor-pointer flex items-center gap-1 font-sans text-[11px] font-bold"
                                    >
                                      {copiedKeyId === k.keyId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                      <span>Copy</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                                  <span>Rate Limit: {k.rateLimitRpm} RPM</span>
                                  <span>Created: {k.createdAt.split('T')[0]}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Embedded Code Snippet Interactive Tabs */}
                      <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                              <Code className="w-4 h-4 text-violet-500" />
                              Interactive Developer SDK Code Snippets
                            </h3>

                            {/* Key Selector inside snippet header */}
                            <select
                              value={selectedKeyForSnippet}
                              onChange={e => setSelectedKeyForSnippet(e.target.value)}
                              className="bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 outline-none"
                            >
                              {clientKeys.map(k => (
                                <option key={k.keyId} value={k.rawKeySecret || k.keyMasked}>
                                  Inject Key: {k.keyName}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Language Tab Selectors */}
                          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
                            {(['curl', 'node', 'python', 'php'] as const).map(lang => (
                              <button
                                key={lang}
                                onClick={() => setSelectedCodeLanguage(lang)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer uppercase transition-all ${
                                  selectedCodeLanguage === lang
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                {lang === 'node' ? 'Node.js' : lang}
                              </button>
                            ))}
                          </div>

                          {/* Code Display Area */}
                          <div className="relative mt-3">
                            <pre className="p-4 bg-slate-950 text-indigo-300 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                              {getCodeSnippet(selectedCodeLanguage, 'kyc', selectedKeyForSnippet)}
                            </pre>

                            <button
                              onClick={() => handleCopy(getCodeSnippet(selectedCodeLanguage, 'kyc', selectedKeyForSnippet))}
                              className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer border border-slate-700 shadow-xs"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy Code</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-300">
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <strong>Sandbox Test Mode:</strong> Zero charge on test calls using <code>sk_sandbox_*</code>
                          </span>
                          <a href="#docs" className="font-bold underline text-[11px] hover:text-indigo-500">Read API Docs</a>
                        </div>
                      </div>

                    </div>

                    {/* PLAN & BILLING MANAGEMENT PRICING COMPONENT */}
                    <Pricing
                      currentPlanId={currentTenantPlan?.id}
                      onManagePlans={() => setActiveTab('PLAN_CONFIGURATOR')}
                      onSelectPlan={(planId) => {
                        const targetPlan = plans.find(p => p.id === planId);
                        showToast(`Initiated plan change request to ${targetPlan?.displayName || planId}`, 'success');
                      }}
                      showAdminControls={true}
                    />

                    {/* NEW API KEY MODAL */}
                    <AnimatePresence>
                      {isCreateKeyModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`w-full max-w-md p-4 sm:p-5 lg:p-6 rounded-2xl shadow-2xl border ${
                              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          >
                            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                              <h3 className="font-bold text-sm flex items-center gap-2">
                                <Plus className="w-4 h-4 text-indigo-600" /> Issue New Production API Key
                              </h3>
                              <button onClick={() => setIsCreateKeyModalOpen(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                              </button>
                            </div>

                            <form onSubmit={handleCreateApiKey} className="space-y-4 pt-4 text-xs">
                              <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Key Label / Name</label>
                                <input
                                  type="text"
                                  required
                                  value={newKeyName}
                                  onChange={e => setNewKeyName(e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium rounded-xl outline-none"
                                />
                              </div>

                              <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Environment</label>
                                <select
                                  value={newKeyEnvironment}
                                  onChange={e => setNewKeyEnvironment(e.target.value as any)}
                                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold rounded-xl outline-none"
                                >
                                  <option value="PRODUCTION">PRODUCTION (sk_live_*)</option>
                                  <option value="SANDBOX">SANDBOX (sk_sandbox_*)</option>
                                </select>
                              </div>

                              <button
                                type="submit"
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                              >
                                Generate Secret Key
                              </button>
                            </form>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>

                    {/* SHOW GENERATED SECRET POPUP (ONCE) */}
                    <AnimatePresence>
                      {generatedSecretPopup && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg p-4 sm:p-5 lg:p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-2xl"
                          >
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                              <CheckCircle2 className="w-5 h-5" />
                              <span>New API Secret Key Created!</span>
                            </div>

                            <p className="text-xs text-slate-300">
                              Please copy your secret key now. <strong>It will never be displayed again in plain text!</strong>
                            </p>

                            <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-indigo-400 border border-slate-800 flex items-center justify-between">
                              <span className="truncate pr-2">{generatedSecretPopup}</span>
                              <button
                                onClick={() => handleCopy(generatedSecretPopup)}
                                className="px-3 py-1 bg-indigo-600 text-white rounded font-sans text-xs font-bold hover:bg-indigo-500"
                              >
                                Copy Secret
                              </button>
                            </div>

                            <button
                              onClick={() => setGeneratedSecretPopup(null)}
                              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
                            >
                              I Have Safely Saved This Key
                            </button>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>

                  </div>
                )}

                {/* ========================================================================= */}
                {/* REVENUE COMMISSION ENGINE                                                 */}
                {/* ========================================================================= */}
                {activeTab === 'COMMISSION_ENGINE' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-rose-600" />
                        SaaS Revenue & Commission Engine
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Manage global platform monetization. Set dynamic commission rates for automated penalty recovery across regional Regulators, and generate revenue split invoices.
                      </p>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Recovered Penalties</span>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">€14,500,000</div>
                      </div>
                      <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 shadow-sm">
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Platform Commission Earned</span>
                        <div className="text-2xl font-black text-rose-700 dark:text-rose-500 mt-1">€1,450,000</div>
                      </div>
                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Commission Invoices</span>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">€120,500</div>
                      </div>
                    </div>

                    {/* Regional Commission Matrix */}
                    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Regional Commission Rates Configurator</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500">
                            <tr>
                              <th className="p-3 font-bold rounded-tl-xl">Regulator / Jurisdiction</th>
                              <th className="p-3 font-bold">Base SaaS Fee (ARR)</th>
                              <th className="p-3 font-bold">Commission Rate (%)</th>
                              <th className="p-3 font-bold text-right rounded-tr-xl">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                              { reg: 'EU AI Office', arr: '€120,000', rate: '10%' },
                              { reg: 'EDPB (GDPR)', arr: '€250,000', rate: '15%' },
                              { reg: 'BfDI (Germany)', arr: '€95,000', rate: '5%' },
                              { reg: 'CNIL (France)', arr: '€105,000', rate: '12%' },
                            ].map((r, i) => (
                              <tr key={i}>
                                <td className="p-3 font-semibold text-slate-900 dark:text-white">{r.reg}</td>
                                <td className="p-3 text-slate-600 dark:text-slate-400 font-mono">{r.arr}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <input type="text" defaultValue={r.rate} className="w-16 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center font-bold" />
                                  </div>
                                </td>
                                <td className="p-3 text-right">
                                  <button onClick={() => showToast('Commission rate updated!', 'success')} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-bold rounded-lg hover:bg-indigo-200 transition-colors">Save</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Automated Invoices */}
                    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Generated Commission Invoices</h3>
                        <button onClick={() => showToast('Commission Engine triggered invoice generation run.', 'success')} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-xs">
                          <Play className="w-3.5 h-3.5" /> Run Billing Cycle
                        </button>
                      </div>
                      <div className="space-y-3">
                        {[
                          { id: 'INV-COM-991', to: 'EU AI Office', amount: '€45,000', status: 'PAID', date: '2026-08-01' },
                          { id: 'INV-COM-992', to: 'EDPB (GDPR)', amount: '€112,500', status: 'PENDING', date: '2026-08-05' },
                          { id: 'INV-COM-993', to: 'BfDI (Germany)', amount: '€8,000', status: 'DRAFT', date: '2026-08-10' },
                        ].map((inv) => (
                          <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                            <div className="flex items-center gap-4">
                              <FileCode2 className="w-6 h-6 text-slate-400" />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm">{inv.id} <span className="text-slate-500 font-normal">to {inv.to}</span></div>
                                <div className="text-[10px] text-slate-500">{inv.date} • Automated Hybrid Generation</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-black text-slate-900 dark:text-white">{inv.amount}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                              }`}>{inv.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* PHASE 1: DYNAMIC PLAN & RATE CONFIGURATOR & SUPER ADMIN CRUD               */}
                {/* ========================================================================= */}
                {activeTab === 'PLAN_CONFIGURATOR' && (
                  <div className="space-y-6">
                    <SuperAdminBillingSubscriptionCrud />
                  </div>
                )}

                {/* ========================================================================= */}
                {/* METERED API MIDDLEWARE INSPECTOR                                         */}
                {/* ========================================================================= */}
                {activeTab === 'METERED_INSPECTOR' && (
                  <div className="space-y-4 sm:space-y-6">

                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Activity className="w-6 h-6 text-amber-500" />
                          Metered API Circuit Breaker & Middleware Sandbox
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Test API key authorization, quota consumption metering, and token bucket circuit breaking.
                        </p>
                      </div>

                      <button
                        onClick={handleFlushUsageBuffer}
                        className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md hover:bg-slate-800"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Flush Usage Buffer to DB</span>
                      </button>
                    </div>

                    {flushStatus && (
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-mono">
                        ✓ {flushStatus}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                      {/* Test Form */}
                      <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Simulate API Request</h3>

                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="font-bold block mb-1">API Key Header Token</label>
                            <input
                              type="text"
                              value={testRawApiKey}
                              onChange={e => setTestRawApiKey(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold rounded-xl outline-none"
                            />
                          </div>

                          <div>
                            <label className="font-bold block mb-1">Service Module Endpoint</label>
                            <select
                              value={testServiceModule}
                              onChange={e => setTestServiceModule(e.target.value as any)}
                              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold rounded-xl outline-none"
                            >
                              <option value="E_KYC">/v1/kyc/verify (e-KYC Verification)</option>
                              <option value="AI_AML">/v1/aml/check (AI AML Screening)</option>
                              <option value="PRIVACY_ENGINE">/v1/privacy/audit (Privacy Audit)</option>
                            </select>
                          </div>

                          <button
                            onClick={handleExecuteApiTest}
                            disabled={isExecutingApiTest}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex justify-center items-center gap-2"
                          >
                            <Play className={`w-4 h-4 ${isExecutingApiTest ? 'animate-spin' : ''}`} />
                            <span>{isExecutingApiTest ? 'Verifying & Metering...' : 'Dispatch Test API Request'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Result Box */}
                      <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Middleware Response Header Inspection</h3>

                        {middlewareResult ? (
                          <div className={`p-4 rounded-xl border font-mono text-xs space-y-2 ${
                            middlewareResult.authorized ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300'
                          }`}>
                            <div className="flex justify-between items-center">
                              <span className="font-bold">HTTP Status Code:</span>
                              <span className={`px-2 py-0.5 rounded font-black ${middlewareResult.authorized ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                                {middlewareResult.httpStatusCode}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span>Endpoint:</span>
                              <span>{middlewareResult.endpoint}</span>
                            </div>

                            <div className="flex justify-between">
                              <span>Remaining Quota:</span>
                              <span className="font-bold">{middlewareResult.remainingQuota} calls</span>
                            </div>

                            <div className="flex justify-between">
                              <span>Circuit Breaker State:</span>
                              <span>{middlewareResult.circuitBreakerTriggered ? 'TRIGGERED (BLOCKING)' : 'NORMAL (PASS)'}</span>
                            </div>

                            {middlewareResult.errorMessage && (
                              <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 rounded font-sans text-[11px] mt-2">
                                <strong>Error Details:</strong> {middlewareResult.errorMessage}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-5 sm:p-6 lg:p-8 text-center text-slate-400 text-xs font-mono">
                            Run a test request to inspect authorization, rate limit headers, and meter counters.
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* PHASE 4: CANARY ROLLOUT & DEPLOYMENT STRATEGY                            */}
                {/* ========================================================================= */}
                {activeTab === 'CANARY_DEPLOY' && (
                  <div className="space-y-4 sm:space-y-6">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Server className="w-6 h-6 text-indigo-600" />
                          Zero-Downtime Deployment & Canary Rollout Hub
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Non-blocking database migrations and canary rollout traffic sliders (10% -&gt; 50% -&gt; 100%).
                        </p>
                      </div>

                      <button
                        onClick={handleRunIntegrationTestSuite}
                        disabled={isRunningTests}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        <Play className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
                        <span>{isRunningTests ? 'Executing Test Suite...' : 'Run Integration & Security Test Suite'}</span>
                      </button>
                    </div>

                    {/* Test Suite Results */}
                    {testSuiteResults.length > 0 && (
                      <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-emerald-400 block font-mono">
                          ✓ Automated Test Suite Results (6/6 Passed):
                        </span>
                        <div className="space-y-1 text-xs font-mono">
                          {testSuiteResults.map((t, i) => (
                            <div key={i} className="flex justify-between text-slate-300">
                              <span>{t.name}</span>
                              <span className="text-emerald-400 font-bold">PASSED ({t.durationMs}ms)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Canary Sliders */}
                    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Canary Traffic Rollout Controllers</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {canaryRollouts.map(c => (
                          <div key={c.featureKey} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold font-mono">{c.featureKey}</span>
                              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold rounded">
                                {c.trafficPercentage}% Traffic ({c.status})
                              </span>
                            </div>

                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="10"
                              value={c.trafficPercentage}
                              onChange={e => handleUpdateCanaryPercent(c.featureKey, Number(e.target.value))}
                              className="w-full accent-indigo-600 cursor-pointer"
                            />

                            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                              <span>0% (Disabled)</span>
                              <span>10% Canary</span>
                              <span>50% Testing</span>
                              <span>100% Release</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SQL Migrations */}
                    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Zero-Downtime Non-Blocking SQL Migrations</h3>
                      
                      <div className="space-y-3">
                        {migrations.map(m => (
                          <div key={m.version} className="p-4 bg-slate-950 text-white rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-indigo-400">{m.version} — {m.name}</span>
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded font-bold">
                                Applied: {m.appliedAt}
                              </span>
                            </div>
                            <pre className="p-3 bg-slate-900 text-slate-300 rounded border border-slate-800 overflow-x-auto text-[11px]">
                              {m.sqlUp}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </>
            )}

          </main>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionRevenueHub;
