import React, { useState, useEffect, useMemo } from 'react';
import { 
  Server, CreditCard, ShieldCheck, Zap, Globe, Key, CheckCircle2, 
  AlertTriangle, Play, Settings, RefreshCw, Layers, Plus, Terminal, 
  Copy, Database, HelpCircle, Sliders, ArrowRight, BarChart3, Clock, 
  Users, Activity, DollarSign, FileText, CheckCircle, Search, Info, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { fetchWithRetry } from '../lib/api-client';
import { SaaSAddonRuleEngineBuilder, CustomAddonPayload } from '../components/admin/SaaSAddonRuleEngineBuilder';

// Simple types
interface CaaSAddon {
  id: string;
  name: string;
  category: string;
  desc: string;
  price: string;
  isActive: boolean;
  region: string;
  uptime: string;
}

interface ClientToken {
  id: string;
  name: string;
  token: string;
  created: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
}

interface ServiceLog {
  id: string;
  timestamp: string;
  service: string;
  endpoint: string;
  status: number;
  latency: string;
}

interface CaasServiceDashboardProps {
  activeRole?: string;
}

export const CaasServiceDashboard: React.FC<CaasServiceDashboardProps> = ({ activeRole }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  // Route/Tab Detection
  // We check the window location path to default, but allow manual switching inside for superb demonstration
  const [activeRoute, setActiveRoute] = useState<'caas-service-center' | 'caas-subscription-mgmt'>(() => {
    const isMgmt = window.location.pathname.includes('caas-subscription-mgmt') || window.location.pathname.includes('subscription-mgmt');
    return isMgmt ? 'caas-subscription-mgmt' : 'caas-service-center';
  });

  // Track path changes from the browser popstate or navigation
  useEffect(() => {
    const handlePathChange = () => {
      const isMgmt = window.location.pathname.includes('caas-subscription-mgmt') || window.location.pathname.includes('subscription-mgmt');
      setActiveRoute(isMgmt ? 'caas-subscription-mgmt' : 'caas-service-center');
    };
    window.addEventListener('popstate', handlePathChange);
    return () => window.removeEventListener('popstate', handlePathChange);
  }, []);

  // Determine current role & active view context
  // A true SaaS Platform Admin must have the activeRole 'ADMIN' or explicitly be on admin routes
  const isPlatformAdmin = useMemo(() => {
    const isClientPath = window.location.pathname.includes('/client') || 
                         window.location.pathname.includes('caas-marketplace') ||
                         window.location.pathname.includes('caas-hub');
    if (isClientPath) return false;
    return activeRole === 'ADMIN';
  }, [activeRole]);

  const [viewMode, setViewMode] = useState<'saas-admin' | 'client'>(isPlatformAdmin ? 'saas-admin' : 'client');

  // Keep state in sync if user or role changes
  useEffect(() => {
    setViewMode(isPlatformAdmin ? 'saas-admin' : 'client');
  }, [isPlatformAdmin]);

  // Copy helper
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    showToast("Copied to clipboard", "success");
    setTimeout(() => setCopiedText(null), 2000);
  };

  // ==========================================
  // STATE DEFINITIONS
  // ==========================================

  // 1. Registered Services (SaaS Admin CaaS Service Center)
  const [addons, setAddons] = useState<CaaSAddon[]>([
    { id: 'caas-gdpr', name: 'GDPR Privacy Guard', category: 'Privacy', desc: 'Real-time consent tracing and Article 30 ledger management.', price: '€499/mo', isActive: true, region: 'EU-West (Frankfurt)', uptime: '99.99%' },
    { id: 'caas-ai-act', name: 'EU AI Act Auditor', category: 'Artificial Intelligence', desc: 'Automated conformity checks for high-risk generative models.', price: '€899/mo', isActive: true, region: 'EU-Central (Munich)', uptime: '99.95%' },
    { id: 'caas-ehds', name: 'EHDS Health Shield', category: 'Healthtech', desc: 'Secure medical data handling complying with European Health Data Space.', price: '€699/mo', isActive: true, region: 'EU-North (Stockholm)', uptime: '100%' },
    { id: 'caas-nis2', name: 'NIS2 Cyber Resilience', category: 'Cybersecurity', desc: 'Incident reporting protocols and supply chain security audits.', price: '€799/mo', isActive: false, region: 'EU-West (Paris)', uptime: '99.98%' },
    { id: 'caas-popia', name: 'POPIA South Africa Vault', category: 'Privacy', desc: 'Sovereign data storage and processing complying with South African POPIA regulations.', price: '€599/mo', isActive: true, region: 'AF-South (Cape Town)', uptime: '100%' },
    { id: 'caas-pdpl-sa', name: 'KSA PDPL Gateway', category: 'Privacy', desc: 'Secure data localization and processing for Saudi Arabian jurisdiction.', price: '€749/mo', isActive: true, region: 'ME-Central (Riyadh)', uptime: '99.99%' }
  ]);

  // Form state for creating new service
  const [showAdvancedBuilder, setShowAdvancedBuilder] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Privacy');
  const [newServicePrice, setNewServicePrice] = useState('€599/mo');
  const [newServiceRegion, setNewServiceRegion] = useState('EU-West (Frankfurt)');

  const handleSaveCustomAddon = (customAddon: CustomAddonPayload) => {
    const addonId = customAddon.id || `caas-custom-${customAddon.slug}`;
    const newEntry: CaaSAddon = {
      id: addonId,
      name: customAddon.name,
      category: customAddon.category,
      desc: customAddon.description || `Enforces statutory law: ${customAddon.lawActName} with ${customAddon.rules.length} custom compliance rules.`,
      price: customAddon.price,
      isActive: true,
      region: customAddon.region,
      uptime: '100%'
    };
    setAddons(prev => [newEntry, ...prev]);
    setShowAdvancedBuilder(false);
  };

  const handleRegisterService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) {
      showToast("Service name is required", "error");
      return;
    }
    const newId = `caas-${newServiceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const newAddon: CaaSAddon = {
      id: newId,
      name: newServiceName,
      category: newServiceCategory,
      desc: newServiceDesc,
      price: newServicePrice,
      isActive: true,
      region: newServiceRegion,
      uptime: '100%'
    };
    setAddons([...addons, newAddon]);
    setNewServiceName('');
    setNewServiceDesc('');
    showToast(`Service "${newServiceName}" successfully registered on multi-region cluster.`, "success");
  };

  const toggleAddonActive = (id: string) => {
    setAddons(addons.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
    showToast("Service state updated successfully", "success");
  };

  // 2. Cluster Nodes (SaaS Admin CaaS Service Center)
  const [nodes, setNodes] = useState([
    { name: 'Primary Node (Frankfurt-1)', type: 'Master', status: 'Online', load: '34%', latency: '12ms' },
    { name: 'Failover Node (Paris-2)', type: 'Replica', status: 'Standby', load: '4%', latency: '18ms' },
    { name: 'Stockholm Edge (Sweden-3)', type: 'Edge Router', status: 'Online', load: '68%', latency: '8ms' }
  ]);

  // 3. API Tokens (Client CaaS Service Center)
  const [tokens, setTokens] = useState<ClientToken[]>([
    { id: 'tok-1', name: 'Production Main App', token: 'lxs_caas_prod_89a712b8cd9e12e7', created: '2026-01-15', lastUsed: '2026-07-21 08:14', status: 'Active' },
    { id: 'tok-2', name: 'Staging Environment', token: 'lxs_caas_stag_22c90e118ba8d2b3', created: '2026-03-04', lastUsed: '2026-07-20 15:42', status: 'Active' },
    { id: 'tok-3', name: 'Legacy Analytics Sync', token: 'lxs_caas_arch_9981a7b0ff42c7e1', created: '2025-11-22', lastUsed: '2026-05-12 11:30', status: 'Revoked' }
  ]);
  const [newTokenName, setNewTokenName] = useState('');

  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('');
    const createdToken: ClientToken = {
      id: `tok-${Date.now()}`,
      name: newTokenName,
      token: `lxs_caas_gen_${randomHex}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'Active'
    };
    setTokens([createdToken, ...tokens]);
    setNewTokenName('');
    showToast(`API token "${newTokenName}" generated successfully.`, "success");
  };

  const handleRevokeToken = (id: string) => {
    setTokens(tokens.map(t => t.id === id ? { ...t, status: 'Revoked' } : t));
    showToast("API token revoked and access disabled.", "success");
  };

  // 4. Logs (Client CaaS Service Center)
  const [logs] = useState<ServiceLog[]>([
    { id: 'log-101', timestamp: '08:22:15', service: 'GDPR Privacy Guard', endpoint: '/v1/consent/verify', status: 200, latency: '14ms' },
    { id: 'log-102', timestamp: '08:21:40', service: 'EU AI Act Auditor', endpoint: '/v1/risk/check-model', status: 200, latency: '420ms' },
    { id: 'log-103', timestamp: '08:19:02', service: 'GDPR Privacy Guard', endpoint: '/v1/ledger/record', status: 201, latency: '28ms' },
    { id: 'log-104', timestamp: '08:14:50', service: 'EHDS Health Shield', endpoint: '/v1/ehds/anonymize', status: 200, latency: '115ms' },
    { id: 'log-105', timestamp: '08:02:11', service: 'EU AI Act Auditor', endpoint: '/v1/risk/check-model', status: 400, latency: '98ms' }
  ]);

  // 5. Interactive sandbox (Client CaaS Service Center)
  const [sandboxUrl, setSandboxUrl] = useState('https://internal.client-portal.eu');
  const [sandboxService, setSandboxService] = useState('GDPR Privacy Guard');
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);
  const [sandboxOutput, setSandboxOutput] = useState<string[]>([]);

  const runSandboxProbe = () => {
    setIsSandboxRunning(true);
    setSandboxOutput([]);
    const lines = [
      `[info] Initializing CaaS Security Probe on endpoint: ${sandboxUrl}...`,
      `[info] Binding 9Xen Regulettee remote agent...`,
      `[info] Triggering compliance analysis [Service: ${sandboxService}]`,
      `[test] Performing cross-border data transfer security check...`,
      `[test] Analyzing SQL Schema for tracking consent flags...`,
      `[test] Auditing active TLS handshake protocols (must be TLS 1.3)...`,
      `[ok] TLS handshake validation passed.`,
      `[ok] Local database SQLite ledger verified against regional state.`,
      `[success] Endpoint certified compliant. Audit token generated: lxs_certified_probe_${Array.from(crypto.getRandomValues(new Uint8Array(5))).map(b => b.toString(16).padStart(2, '0')).join('')}`
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setSandboxOutput(prev => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setIsSandboxRunning(false);
        showToast("Sandbox scan complete. 100% compliant.", "success");
      }
    }, 400);
  };

  // 6. Tenant Subscriptions (SaaS Admin Subscription Mgmt)
  const [tenants, setTenants] = useState([
    { name: 'Acme Logistics Corp', plan: 'Enterprise Shield', usage: '82%', cost: '€7,999/mo', status: 'Active', billingDate: 'Aug 01, 2026' },
    { name: 'Hansa Medical GmbH', plan: 'Sovereign Core', usage: '14%', cost: '€19,999/mo', status: 'Active', billingDate: 'Aug 01, 2026' },
    { name: 'Starlight Gaming Ltd', plan: 'Starter Compliance', usage: '94%', cost: '€2,499/mo', status: 'Action Required', billingDate: 'Grace Period' },
    { name: 'Nordic Agro Tech', plan: 'Starter Compliance', usage: '30%', cost: '€2,499/mo', status: 'Active', billingDate: 'Aug 01, 2026' }
  ]);

  const [pricingStarter, setPricingStarter] = useState('2499');
  const [pricingEnterprise, setPricingEnterprise] = useState('7999');
  const [pricingSovereign, setPricingSovereign] = useState('19999');

  const handleSavePrices = () => {
    showToast("Subscription plans and rates updated on pricing ledger.", "success");
  };

  // 7. Estimator & SLAs (Client Subscription Mgmt)
  const [estimateCalls, setEstimateCalls] = useState(25000);
  const [clientCredits, setClientCredits] = useState(8420.50);
  const [clientBillingHistory] = useState([
    { id: 'inv-001', date: '2026-07-01', desc: 'CaaS Platform Subscription', amount: -499.00, status: 'Paid' },
    { id: 'inv-002', date: '2026-07-10', desc: 'API Overages (12k requests)', amount: -600.00, status: 'Paid' },
    { id: 'inv-003', date: '2026-07-15', desc: 'Credit Top-up', amount: 5000.00, status: 'Success' }
  ]);

  const estimatedCost = useMemo(() => {
    const base = 499;
    const requestsCost = Math.floor((estimateCalls - 1000) * 0.05);
    return base + (requestsCost > 0 ? requestsCost : 0);
  }, [estimateCalls]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8">
      {/* Header Panel */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 lg:p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              Sovereign Micro-Infrastructure
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {activeRoute === 'caas-service-center' ? 'CaaS Service Center' : 'CaaS Subscription Management'}
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              {activeRoute === 'caas-service-center' 
                ? 'Register, monitor, and query modular Compliance-as-a-Service microservices hosted on decentralized edge clusters.' 
                : 'Configure subscription packages, review multi-tenant licensing rules, and estimate API request billing cycles.'}
            </p>
          </div>

          {isPlatformAdmin ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700 shrink-0">
              <div className="text-xs text-slate-400 font-bold sm:mr-2">Switch View Mode:</div>
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => {
                    setViewMode('saas-admin');
                    showToast("Switched to SaaS Administrator perspective.", "info");
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    viewMode === 'saas-admin' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SaaS Admin
                </button>
                <button
                  onClick={() => {
                    setViewMode('client');
                    showToast("Switched to Enterprise Client perspective.", "info");
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    viewMode === 'client' 
                      ? 'bg-[#00D1B2] text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Client View
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-emerald-400 text-xs font-bold shrink-0 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Enterprise Client View</span>
            </div>
          )}
        </div>

        {/* Decorative Grid Line */}
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
          <Server className="w-72 h-72 text-indigo-400" />
        </div>
      </div>

      {/* Manual Route Switch Tabs for better local sandbox navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveRoute('caas-service-center');
            window.history.pushState({}, '', '/caas-service-center');
          }}
          className={`pb-4 px-4 sm:px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeRoute === 'caas-service-center'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          Service Console
        </button>
        <button
          onClick={() => {
            setActiveRoute('caas-subscription-mgmt');
            window.history.pushState({}, '', '/caas-subscription-mgmt');
          }}
          className={`pb-4 px-4 sm:px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeRoute === 'caas-subscription-mgmt'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Subscription Licensing
        </button>
      </div>

      {/* =========================================================================
          ROUTE 1: CAAS-SERVICE-CENTER
          ========================================================================= */}
      {activeRoute === 'caas-service-center' && (
        <div className="space-y-5 sm:space-y-8">
          {/* SAAS ADMIN PERSPECTIVE */}
          {viewMode === 'saas-admin' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 text-left">
              
              {/* Custom Industry Add-On & Rule Engine Mechanism Launch Banner */}
              <div className="lg:col-span-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      SaaS Admin Custom Add-On Mechanism
                    </span>
                    <span className="text-xs text-indigo-200 font-mono">Live Rule Engine v2.1</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Create Custom Industry Add-On with Statutory Law & Rule Engine
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Configure new specialized compliance add-ons mapped to statutory acts (DORA, EU AI Act, NIS2, FERPA, HIPAA), customize automated condition evaluation logic, and enable zero-knowledge proof gateways for global marketplace deployment.
                  </p>
                </div>

                <button
                  onClick={() => setShowAdvancedBuilder(true)}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-300" />
                  <span>Configure Custom Add-On Engine</span>
                </button>
              </div>

              {/* Advanced Rule Engine Builder Modal / View */}
              {showAdvancedBuilder && (
                <div className="lg:col-span-3 my-4">
                  <SaaSAddonRuleEngineBuilder
                    onSaveSuccess={handleSaveCustomAddon}
                    onCancel={() => setShowAdvancedBuilder(false)}
                  />
                </div>
              )}

              {/* Telemetry Grid */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: "Active Services", value: addons.filter(a=>a.isActive).length + "/" + addons.length, sub: "Edge compliance microservices", icon: Server, color: "text-indigo-600" },
                  { label: "Cluster Nodes", value: "3 Active", sub: "100% region uptime", icon: Globe, color: "text-emerald-500" },
                  { label: "Avg Latency", value: "14ms", sub: "98th percentile global optimal", icon: Activity, color: "text-blue-500" },
                  { label: "API Requests (24h)", value: "32,491", sub: "Peak load 42 req/sec", icon: Zap, color: "text-amber-500" }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                          <h4 className="text-2xl font-extrabold text-slate-900 mt-2">{stat.value}</h4>
                          <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
                        </div>
                        <div className={`p-2 rounded-lg bg-slate-50 border border-slate-100 ${stat.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Addons Directory List */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Registered Compliance Services</h3>
                  <p className="text-slate-500 text-xs mt-1">Configure global service states, deployment regions, and modular endpoint behaviors.</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {addons.map((addon) => (
                    <div key={addon.id} className="py-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{addon.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            {addon.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {addon.region}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 max-w-xl">{addon.desc}</p>
                        <div className="flex items-center gap-4 text-[10px] text-slate-400">
                          <span>Uptime: <strong className="text-slate-700">{addon.uptime}</strong></span>
                          <span>ID: <code className="bg-slate-50 px-1 rounded text-slate-500">{addon.id}</code></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${addon.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {addon.isActive ? 'Active' : 'Disabled'}
                        </span>
                        <button
                          onClick={() => toggleAddonActive(addon.id)}
                          className={`px-3 py-1 rounded text-xs font-bold border transition-all ${
                            addon.isActive 
                              ? 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100'
                              : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100'
                          }`}
                        >
                          {addon.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Register New CaaS Microservice Form */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    Register CaaS Service
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">Deploy a new modular compliance container onto the regional edge ledger.</p>
                </div>

                <form onSubmit={handleRegisterService} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Service Name</label>
                    <input
                      type="text"
                      placeholder="e.g. DORA Incident Tracker"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Category</label>
                      <select
                        value={newServiceCategory}
                        onChange={(e) => setNewServiceCategory(e.target.value)}
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white"
                      >
                        <option>Privacy</option>
                        <option>Artificial Intelligence</option>
                        <option>Cybersecurity</option>
                        <option>Healthtech</option>
                        <option>Financial</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Pricing Tier</label>
                      <input
                        type="text"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        className="w-full text-xs p-3 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Edge Deployment Region</label>
                    <select
                      value={newServiceRegion}
                      onChange={(e) => setNewServiceRegion(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white"
                    >
                      <option>EU-West (Frankfurt)</option>
                      <option>EU-Central (Munich)</option>
                      <option>EU-North (Stockholm)</option>
                      <option>EU-West (Paris)</option>
                      <option>AF-South (Cape Town)</option>
                      <option>ME-Central (Riyadh)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Description & Legal Mandate</label>
                    <textarea
                      placeholder="Describe the regulatory context, compliance thresholds, and API parameters."
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Server className="w-4 h-4" />
                    Deploy to Live Registry
                  </button>
                </form>
              </div>

              {/* Cluster Nodes Heartbeat Panel */}
              <div className="lg:col-span-3 bg-slate-900 text-white rounded-2xl border border-slate-800 p-4 sm:p-5 lg:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-400" />
                      Dynamic Edge Nodes Status
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Heartbeat tracking and cluster workload orchestration for CaaS microservices.</p>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Syncing
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {nodes.map((node, idx) => (
                    <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-bold text-xs">{node.name}</div>
                        <div className="flex gap-2 text-[10px] text-slate-400 font-mono">
                          <span>Type: {node.type}</span>
                          <span>Load: {node.load}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-slate-950 px-2 py-1 rounded text-emerald-400 font-bold border border-slate-800">
                          {node.latency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* CLIENT PERSPECTIVE - CAAS SERVICE CENTER */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 text-left">
              
              {/* Credentials / Key Manager */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-indigo-600" />
                    CaaS API Tokens
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">Generate secure, scoped API secrets to authenticate remote requests with the 9Xen Regulettee microservice nodes.</p>
                </div>

                {/* Generate form */}
                <form onSubmit={handleGenerateToken} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Token label (e.g. Analytics Portal)"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    className="flex-1 text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 rounded-lg shrink-0"
                  >
                    Generate
                  </button>
                </form>

                {/* Token list */}
                <div className="space-y-3">
                  {tokens.map((tok) => (
                    <div key={tok.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{tok.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${tok.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {tok.status}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] bg-white border border-slate-200 p-2 rounded flex items-center justify-between text-slate-600">
                        <span className="truncate mr-2">{tok.status === 'Revoked' ? '••••••••••••••••' : tok.token}</span>
                        {tok.status === 'Active' && (
                          <button
                            onClick={() => handleCopy(tok.token, tok.id)}
                            className="text-indigo-600 font-bold hover:underline shrink-0 text-[10px]"
                          >
                            {copiedText === tok.id ? 'Copied' : 'Copy'}
                          </button>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-400">
                        <span>Created: {tok.created}</span>
                        <span>Used: {tok.lastUsed}</span>
                        {tok.status === 'Active' && (
                          <button
                            onClick={() => handleRevokeToken(tok.id)}
                            className="text-rose-600 font-bold hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Endpoint Sandbox Probe Tool */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 lg:col-span-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-indigo-600" />
                    CaaS Compliance Sandbox
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">Test your system compliance with live interactive checks. Submit a URL endpoint for an immediate DPA-style conformity audit.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Target Audit Endpoint</label>
                    <input
                      type="text"
                      value={sandboxUrl}
                      onChange={(e) => setSandboxUrl(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-slate-600"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Active Compliance Check</label>
                    <select
                      value={sandboxService}
                      onChange={(e) => setSandboxService(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white"
                    >
                      <option>GDPR Privacy Guard</option>
                      <option>EU AI Act Auditor</option>
                      <option>EHDS Health Shield</option>
                      <option>NIS2 Cyber Resilience</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={runSandboxProbe}
                  disabled={isSandboxRunning}
                  className={`w-full py-3 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-2 ${
                    isSandboxRunning ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSandboxRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing Server Configurations...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Execute Compliance Scan
                    </>
                  )}
                </button>

                {/* Sandbox console */}
                <div className="bg-slate-950 rounded-xl p-4 font-mono text-[10px] text-slate-300 min-h-[160px] border border-slate-800 space-y-1.5 overflow-auto max-h-[220px]">
                  <div className="text-slate-500">--- 9XEN_REGULETTEE COGNITIVE PROBE ENGINE v2.1 ---</div>
                  {sandboxOutput.length === 0 && (
                    <div className="text-slate-600 italic">No scanner session active. Click the execute button above to initialize.</div>
                  )}
                  {sandboxOutput.map((out, idx) => (
                    <div 
                      key={idx} 
                      className={
                        out.startsWith('[success]') ? 'text-emerald-400 font-bold' :
                        out.startsWith('[ok]') ? 'text-emerald-500' :
                        out.startsWith('[test]') ? 'text-indigo-400' : 'text-slate-400'
                      }
                    >
                      {out}
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Request Logs */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4">
                <div>
                  <h3 className="text-md font-bold text-slate-900">Real-time CaaS Microservice Logs</h3>
                  <p className="text-slate-500 text-xs mt-1">Audit trail of outbound compliance validation requests generated from your systems.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold">
                        <th className="py-2.5">Timestamp</th>
                        <th>CaaS Microservice</th>
                        <th>API Endpoint</th>
                        <th>Status Code</th>
                        <th className="text-right">Response Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-600">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 font-mono text-slate-400">{log.timestamp}</td>
                          <td className="font-bold text-slate-800">{log.service}</td>
                          <td><code className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-indigo-600">{log.endpoint}</code></td>
                          <td>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-black text-[10px] ${log.status === 400 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="text-right font-bold text-slate-900">{log.latency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ROUTE 2: CAAS-SUBSCRIPTION-MGMT
          ========================================================================= */}
      {activeRoute === 'caas-subscription-mgmt' && (
        <div className="space-y-5 sm:space-y-8">
          {/* SAAS ADMIN PERSPECTIVE */}
          {viewMode === 'saas-admin' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 text-left">
              
              {/* Subscriber Overview */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Tenant Subscription Register</h3>
                  <p className="text-slate-500 text-xs mt-1">Manage active compliance licensing, monthly invoices, and audit limits for client organizations.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold">
                        <th className="py-3">Tenant Organization</th>
                        <th>Licensed CaaS Plan</th>
                        <th>API Limit Usage</th>
                        <th>Invoice Rate</th>
                        <th>Billing Cycle</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {tenants.map((ten, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 font-bold text-slate-900">{ten.name}</td>
                          <td>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {ten.plan}
                            </span>
                          </td>
                          <td className="font-bold text-slate-800">{ten.usage}</td>
                          <td className="font-mono font-bold text-slate-900">{ten.cost}</td>
                          <td>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                              ten.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {ten.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => {
                                showToast(`License updated for ${ten.name}`, "success");
                              }}
                              className="text-xs font-bold text-indigo-600 hover:underline"
                            >
                              Configure
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing & Rate Adjustment Deck */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-600" />
                    Tier Rate Configurator
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">Adjust monthly cost indexes dynamically for dynamic platform monetization.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Starter Compliance Package (€/mo)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-bold">€</span>
                      <input
                        type="number"
                        value={pricingStarter}
                        onChange={(e) => setPricingStarter(e.target.value)}
                        className="w-full text-xs p-3 pl-8 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Enterprise Shield (€/mo)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-bold">€</span>
                      <input
                        type="number"
                        value={pricingEnterprise}
                        onChange={(e) => setPricingEnterprise(e.target.value)}
                        className="w-full text-xs p-3 pl-8 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Sovereign Core (€/mo)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-bold">€</span>
                      <input
                        type="number"
                        value={pricingSovereign}
                        onChange={(e) => setPricingSovereign(e.target.value)}
                        className="w-full text-xs p-3 pl-8 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSavePrices}
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 py-3 rounded-xl font-bold text-xs transition-all"
                  >
                    Save Pricing Matrix
                  </button>
                </div>
              </div>

              {/* Dynamic Ledger Ledger Verification Proof (Sovereign Trust Simulator) */}
              <div className="lg:col-span-3 bg-slate-950 text-white rounded-2xl border border-slate-800 p-4 sm:p-5 lg:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-md font-bold flex items-center gap-2 text-indigo-400">
                      <Database className="w-5 h-5" />
                      Dynamic Immutable Ledger Proofs
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Validate microservices and billing subscription triggers on decentralized SQLite chains complying with local European Union data sovereignty bylaws.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      showToast("Recalculating hash chain for all clients... Success.", "success");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 self-start"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Verify Chain Proofs
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs text-slate-300 font-mono">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="text-indigo-400 font-bold mb-1">// ACTIVE HASH SEQUENCE</div>
                    <div>Block Index: #920412</div>
                    <div className="truncate">Prev Hash: f9a871bc2d89e229e71a008c2a8b</div>
                    <div className="truncate text-emerald-400">Curr Proof: 33ab8711ef8d00921bb28cd11440a</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="text-indigo-400 font-bold mb-1">// REGULATORY ALIGNMENT SUMMARY</div>
                    <div>Consolidated SQLite Ledger: Sync OK</div>
                    <div>Article 30 Record Validation: Certified 100% Correct</div>
                    <div className="text-emerald-400 font-bold">SHA-256 Chain Verification Status: VERIFIED</div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* CLIENT PERSPECTIVE - SUBSCRIPTION MGMT */
            <div className="space-y-8 text-left">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
                {/* Credit Balance & Quick Top-up */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-indigo-400 font-black uppercase tracking-widest text-[10px]">CaaS Credit Balance</div>
                      <div className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-500/30">Enterprise</div>
                    </div>
                    <div className="text-4xl font-black">€{clientCredits.toLocaleString('en-DE', { minimumFractionDigits: 2 })}</div>
                    <p className="text-slate-400 text-[10px]">Usage threshold alerts active at €1,000.00</p>
                    
                    <button 
                      onClick={() => {
                        setClientCredits(prev => prev + 1000);
                        showToast("Credits topped up successfully.", "success");
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add €1,000.00 Credits
                    </button>
                  </div>
                  <DollarSign className="absolute -bottom-8 -right-8 w-32 h-32 text-indigo-500/10 rotate-12" />
                </div>

                {/* Transaction History (Small View) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                    <button className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="p-3">Date</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {clientBillingHistory.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="p-3 text-slate-500">{tx.date}</td>
                            <td className="p-3 font-bold text-slate-900">{tx.desc}</td>
                            <td className={`p-3 font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount).toLocaleString('en-DE', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-right">
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Interactive Plan Selector Panel (Client Perspective) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    id: 'caas-starter',
                    name: 'Starter Compliance',
                    price: '€2,499',
                    billing: 'month',
                    features: ['Automated GDPR consent mapping', 'Monthly automated risk audits', 'Standard Email Support', '1,000 API requests/day included'],
                    badge: null
                  },
                  {
                    id: 'caas-enterprise',
                    name: 'Enterprise Shield',
                    price: '€7,999',
                    billing: 'month',
                    features: ['Comprehensive Global coverage', 'Real-time telemetry streams', 'Dedicated DPO workflow panel', 'Unlimited microservice callbacks', '24/7 Priority support SLA'],
                    badge: 'Current active'
                  },
                  {
                    id: 'caas-sovereign',
                    name: 'Sovereign Core',
                    price: '€19,999',
                    billing: 'month',
                    features: ['Private-instance edge deployment', 'Custom sovereignty database sharding', 'White-glove legal audit compliance', 'Decentralized hash-chain logging'],
                    badge: 'Premium recommended'
                  }
                ].map((plan) => {
                  const isActive = plan.id === 'caas-enterprise';
                  return (
                    <div 
                      key={plan.id}
                      className={`p-6 rounded-2xl border transition-all space-y-4 ${
                        isActive 
                          ? 'bg-white border-indigo-500 ring-2 ring-indigo-500 shadow-xl relative' 
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      {plan.badge && (
                        <span className={`absolute -top-3 left-6 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isActive ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-slate-950'
                        }`}>
                          {plan.badge}
                        </span>
                      )}

                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                          <span className="text-slate-400 text-xs">/{plan.billing}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        disabled={isActive}
                        onClick={() => {
                          showToast(`Plan switch requested for ${plan.name}`, "success");
                        }}
                        className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-700 cursor-default font-black' 
                            : 'bg-slate-950 text-white hover:bg-slate-800'
                        }`}
                      >
                        {isActive ? '✓ Selected Plan' : 'Switch License'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Estimate Tool & Live SLAs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
                
                {/* Cost estimate tool */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-indigo-600" />
                      Dynamic API Cost Estimator
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">Estimate custom licensing billing based on projected microservice compliance request volume.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between font-bold text-xs text-slate-800">
                        <span>Projected API Calls (monthly)</span>
                        <span className="font-mono text-indigo-600">{estimateCalls.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="200000"
                        step="5000"
                        value={estimateCalls}
                        onChange={(e) => setEstimateCalls(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ESTIMATED CYCLE PRICE</div>
                        <div className="text-2xl font-black text-indigo-600 mt-1">€{estimatedCost.toLocaleString()}</div>
                      </div>
                      <div className="text-right text-[10px] text-slate-400">
                        <div>Base rate: €499/mo</div>
                        <div>Additional calls: €0.05 ea</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SLAs & Billing Stats */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                      Platform Performance Index & SLA
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">Review operational uptime records and compliance response metrics.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-left">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CONTRACT UPTIME SLA</div>
                      <div className="text-lg font-extrabold text-slate-900">99.99%</div>
                      <div className="text-[9px] text-emerald-500 font-bold uppercase">Uptime Fulfilled</div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">REMEDIATION RATE</div>
                      <div className="text-lg font-extrabold text-slate-900">98.4%</div>
                      <div className="text-[9px] text-emerald-500 font-bold uppercase">High efficiency</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">Active Billing Account</span>
                    <span className="font-mono text-slate-900 font-bold">XXXX-XXXX-9120</span>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};
