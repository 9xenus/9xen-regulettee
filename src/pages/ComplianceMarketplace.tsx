import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  CreditCard, 
  Search, 
  Filter, 
  Power, 
  Terminal, 
  Sliders, 
  Eye, 
  Activity, 
  Building2, 
  Globe, 
  Lock, 
  Cpu, 
  Truck, 
  HeartPulse, 
  ShoppingCart, 
  Gamepad2, 
  GraduationCap, 
  HardDrive, 
  Users, 
  FileText, 
  VolumeX, 
  ClipboardCheck, 
  AlertTriangle, 
  Key, 
  RefreshCw, 
  Play, 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  X,
  Plus,
  Shield,
  FileCheck
} from 'lucide-react';
import { fetchWithRetry } from '../lib/api-client';
import { StripeCheckoutModal, StripeCheckoutItem } from '../components/payment/StripeCheckoutModal';
import { PremiumAddonConsole } from '../components/dashboard/PremiumAddonConsole';
import { AddonConfigPanel } from '../components/AddonConfigPanel';
import { useNotification } from '../context/NotificationContext';
import { MarketplaceScanner } from '../components/marketplace/MarketplaceScanner';

interface Addon {
  id: string;
  category: string;
  name: string;
  actId: string;
  desc: string;
  price: string | number;
  score: number;
  colorClass: string;
  icon: string;
  isActiveGlobally: boolean;
  isStaging?: boolean;
  packageDetails?: any;
  configSchema?: any[];
  configValues?: Record<string, any>;
  subscriptionStatus?: string;
  apiKey?: string;
  trialExpiresAt?: string;
  endpointUrl?: string;
  globalApiKey?: string;
}

const CATEGORIES = [
  'ALL',
  'Data Protection & Privacy',
  'Financial Services',
  'Retail & Commerce',
  'Healthcare & Life Sciences',
  'Public Sector & Govtech',
  'Media & Entertainment',
  'Enterprise Compliance',
  'Corporate Governance',
  'Cybersecurity',
  'Enterprise IT',
  'Supply Chain'
];

export const ComplianceMarketplace: React.FC = () => {
  const { showToast } = useNotification();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string>('org_1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'AVAILABLE'>('ALL');
  
  // Modals and Drawers
  const [checkoutItem, setCheckoutItem] = useState<StripeCheckoutItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeConsoleAddon, setActiveConsoleAddon] = useState<Addon | null>(null);
  const [activeConfigAddon, setActiveConfigAddon] = useState<Addon | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [isBulkActivating, setIsBulkActivating] = useState(false);
  const [activeTab, setActiveTab] = useState<'BROWSE' | 'SCAN'>('BROWSE');

  // Fetch catalog joined with tenant subscription status
  const fetchCatalog = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const cleanTenant = selectedTenant === 'DEFAULT_TENANT' ? 'org_1' : selectedTenant;
      const res = await fetchWithRetry(`/api/v1/caas/addons?tenantId=${cleanTenant}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.addons)) {
        setAddons(data.addons);
      }
    } catch (e) {
      console.error('Failed to load compliance catalog', e);
      showToast('Failed to load marketplace catalog', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTenant, showToast]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Toggle single addon activation
  const handleToggleAddon = async (addon: Addon) => {
    const isCurrentlyActive = addon.subscriptionStatus === 'active' || addon.subscriptionStatus === 'trial';
    const newStatus = isCurrentlyActive ? 'inactive' : 'active';
    setActivatingId(addon.id);

    try {
      const cleanTenant = selectedTenant === 'DEFAULT_TENANT' ? 'org_1' : selectedTenant;
      const res = await fetchWithRetry(`/api/v1/caas/tenants/${cleanTenant}/subscriptions/${addon.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          newStatus === 'active' 
            ? `Successfully activated ${addon.name} Enclave!` 
            : `Deactivated ${addon.name}.`,
          'success'
        );
        // Update locally
        setAddons(prev => prev.map(a => {
          if (a.id === addon.id) {
            return {
              ...a,
              subscriptionStatus: newStatus,
              apiKey: data.subscription?.apiKey || a.apiKey || (newStatus === 'active' ? `lx-${Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('')}` : undefined)
            };
          }
          return a;
        }));
      } else {
        showToast(data.error || 'Failed to update subscription', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Network error updating addon status', 'error');
    } finally {
      setActivatingId(null);
    }
  };

  // Bulk Activate All Addons
  const handleActivateAll = async () => {
    setIsBulkActivating(true);
    const cleanTenant = selectedTenant === 'DEFAULT_TENANT' ? 'org_1' : selectedTenant;
    let activatedCount = 0;

    try {
      await Promise.all(
        addons.map(async (addon) => {
          if (addon.subscriptionStatus !== 'active') {
            try {
              const res = await fetchWithRetry(`/api/v1/caas/tenants/${cleanTenant}/subscriptions/${addon.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active' })
              });
              const data = await res.json();
              if (data.success) activatedCount++;
            } catch (err) {
              console.error(`Failed to activate ${addon.id}`, err);
            }
          }
        })
      );

      showToast(`Activated ${activatedCount} regulatory compliance enclaves!`, 'success');
      await fetchCatalog(true);
    } catch (e: any) {
      showToast('Error during batch activation', 'error');
    } finally {
      setIsBulkActivating(false);
    }
  };

  // Open Stripe Sandbox checkout
  const handleBuyAddon = (addon: Addon) => {
    const priceNum = parseInt(String(addon.price || '99').replace(/[^0-9]/g, '')) || 99;
    setCheckoutItem({
      id: addon.id,
      name: `${addon.name} Compliance Add-on`,
      type: 'ADDON',
      priceEur: priceNum,
      period: 'month',
      description: addon.desc || 'Specialized jurisdictional regulatory control enclave.',
      features: [addon.actId || 'EU-Sovereign-Act', 'Continuous Audit Ledger', 'Real-time API Token', 'Sovereign Enclave Isolation'],
      category: addon.category || 'Regulatory Enclave'
    });
    setIsCheckoutOpen(true);
  };

  const handleStripeSuccess = async () => {
    if (checkoutItem) {
      const cleanTenant = selectedTenant === 'DEFAULT_TENANT' ? 'org_1' : selectedTenant;
      try {
        await fetchWithRetry(`/api/v1/caas/tenants/${cleanTenant}/subscriptions/${checkoutItem.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active' })
        });
        showToast(`Payment confirmed! ${checkoutItem.name} is now live and provisioned.`, 'success');
        fetchCatalog(true);
      } catch (err) {
        console.error('Error post-checkout activation', err);
      }
    }
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    showToast('API Key copied to clipboard!', 'info');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleSaveConfig = async (values: Record<string, any>) => {
    if (!activeConfigAddon) return;
    const cleanTenant = selectedTenant === 'DEFAULT_TENANT' ? 'org_1' : selectedTenant;
    try {
      const res = await fetchWithRetry(`/api/v1/caas/tenants/${cleanTenant}/subscriptions/${activeConfigAddon.id}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configValues: values })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Configuration parameters persisted securely!', 'success');
        setAddons(prev => prev.map(a => a.id === activeConfigAddon.id ? { ...a, configValues: values } : a));
        setActiveConfigAddon(null);
      } else {
        showToast(data.error || 'Failed to save configuration', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error communicating with server', 'error');
    }
  };

  // Filtered addons list
  const filteredAddons = useMemo(() => {
    return addons.filter(addon => {
      // Category filter
      if (selectedCategory !== 'ALL' && addon.category !== selectedCategory) {
        return false;
      }
      // Status filter
      const isActive = addon.subscriptionStatus === 'active' || addon.subscriptionStatus === 'trial';
      if (statusFilter === 'ACTIVE' && !isActive) return false;
      if (statusFilter === 'AVAILABLE' && isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = addon.name.toLowerCase().includes(q);
        const matchesDesc = (addon.desc || '').toLowerCase().includes(q);
        const matchesAct = (addon.actId || '').toLowerCase().includes(q);
        const matchesCategory = (addon.category || '').toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesAct || matchesCategory;
      }
      return true;
    });
  }, [addons, selectedCategory, statusFilter, searchQuery]);

  // Metric stats
  const activeCount = useMemo(() => {
    return addons.filter(a => a.subscriptionStatus === 'active' || a.subscriptionStatus === 'trial').length;
  }, [addons]);

  const avgScore = useMemo(() => {
    if (addons.length === 0) return 94;
    const total = addons.reduce((sum, a) => sum + (a.score || 90), 0);
    return Math.round(total / addons.length);
  }, [addons]);

  // Icon renderer helper
  const renderAddonIcon = (iconName: string, category: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'ShoppingCart': return <ShoppingCart className="w-5 h-5" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5" />;
      case 'Building2': return <Building2 className="w-5 h-5" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'Truck': return <Truck className="w-5 h-5" />;
      case 'Workflow': return <Zap className="w-5 h-5" />;
      case 'FileText': return <FileText className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      case 'Eye': return <Eye className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'ClipboardCheck': return <ClipboardCheck className="w-5 h-5" />;
      case 'AlertTriangle': return <AlertTriangle className="w-5 h-5" />;
      case 'CheckCircle': return <CheckCircle2 className="w-5 h-5" />;
      case 'VolumeX': return <VolumeX className="w-5 h-5" />;
      case 'Activity': return <Activity className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      default:
        if (category.includes('Privacy') || category.includes('Protection')) return <Lock className="w-5 h-5" />;
        if (category.includes('Financial')) return <Zap className="w-5 h-5" />;
        if (category.includes('Commerce')) return <ShoppingCart className="w-5 h-5" />;
        if (category.includes('Public')) return <Building2 className="w-5 h-5" />;
        return <ShieldCheck className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 lg:p-8 rounded-3xl border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sovereign Compliance-as-a-Service</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            EU Compliance Add-on Marketplace
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Instant on-demand regulatory enclaves engineered for GDPR, NIS2, EU AI Act, DORA, EHDS, DSA, and MiCA. Activate, configure, and inspect all regulatory modules with real-time audit ledger enforcement.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3 relative z-10">
          {/* Tenant Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer"
            >
              <option value="org_1" className="bg-slate-900 text-white">Acme Corp EU (org_1)</option>
              <option value="tenant_eurocorp" className="bg-slate-900 text-white">EuroCorp Logistics (tenant_eurocorp)</option>
              <option value="tenant_sovereign_bank" className="bg-slate-900 text-white">Sovereign Bank AG (tenant_sovereign_bank)</option>
            </select>
          </div>

          {/* Activate All Button */}
          <button
            onClick={handleActivateAll}
            disabled={isBulkActivating}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isBulkActivating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>Activate All Add-ons</span>
          </button>
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Enclaves</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{addons.length}</div>
            <span className="text-[10px] text-slate-400">Available modules</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active &amp; Operational</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{activeCount} / {addons.length}</div>
            <span className="text-[10px] text-emerald-600 font-bold">Enforcing policies</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Compliance Assurance</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{avgScore}%</div>
            <span className="text-[10px] text-slate-400">Average audit rating</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Billing Engine</span>
            <div className="text-sm font-black text-slate-900 mt-1 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Stripe Sandbox</span>
            </div>
            <span className="text-[10px] text-slate-400">Test keys provisioned</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 w-fit">
        <button
          onClick={() => setActiveTab('BROWSE')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'BROWSE' 
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Browse Add-ons</span>
        </button>
        <button
          onClick={() => setActiveTab('SCAN')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'SCAN' 
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Marketplace Integrity</span>
        </button>
      </div>

      {activeTab === 'SCAN' ? (
        <MarketplaceScanner tenantId={selectedTenant} />
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search add-on enclaves by name, directive (GDPR, DORA, NIS2...), or keyword..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${statusFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  All ({addons.length})
                </button>
                <button
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setStatusFilter('AVAILABLE')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${statusFilter === 'AVAILABLE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Available ({addons.length - activeCount})
                </button>

                <button
                  onClick={() => fetchCatalog(true)}
                  disabled={refreshing}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  title="Refresh Catalog"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Addons Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : filteredAddons.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 lg:p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No Compliance Add-ons Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search query or category filters to find available regulatory enclaves.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setStatusFilter('ALL'); }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAddons.map(addon => {
                const isActive = addon.subscriptionStatus === 'active' || addon.subscriptionStatus === 'trial';
                const isToggling = activatingId === addon.id;

                return (
                  <motion.div
                    key={addon.id}
                    whileHover={{ y: -3 }}
                    className={`p-6 rounded-2xl bg-white border transition-all flex flex-col justify-between space-y-5 shadow-3xs ${
                      isActive 
                        ? 'border-emerald-200 ring-1 ring-emerald-500/10 shadow-emerald-500/5' 
                        : 'border-slate-200 hover:border-indigo-200 hover:shadow-md'
                    }`}
                  >
                    {/* Header */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border ${
                            isActive 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                              : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>
                            {renderAddonIcon(addon.icon, addon.category)}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">
                              {addon.actId || 'EU SOVEREIGN'}
                            </span>
                            <h3 className="font-bold text-slate-900 text-base leading-snug">{addon.name}</h3>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          {addon.price || '€99/mo'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {addon.desc || 'Specialized compliance control enclave with real-time audit ledger enforcement.'}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] font-medium text-slate-400">{addon.category}</span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{addon.score || 95}% Assurance</span>
                        </div>
                      </div>
                    </div>

                    {/* API Key section if active */}
                    {isActive && addon.apiKey && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[10px] text-slate-600 truncate">
                            {addon.apiKey}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyKey(addon.apiKey!, addon.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-all shrink-0 cursor-pointer"
                          title="Copy API Token"
                        >
                          {copiedKeyId === addon.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      {/* Status Toggle Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleAddon(addon)}
                          disabled={isToggling}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100' 
                              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                          }`}
                        >
                          {isToggling ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : isActive ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Power className="w-3.5 h-3.5" />
                          )}
                          <span>{isActive ? 'Active & Enforcing' : 'Activate Enclave'}</span>
                        </button>

                        <button
                          onClick={() => handleBuyAddon(addon)}
                          className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200/60 transition-all cursor-pointer"
                          title="Stripe Sandbox Direct Billing"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Secondary buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setActiveConsoleAddon(addon)}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                        >
                          <Terminal className="w-3.5 h-3.5 text-slate-500" />
                          <span>Launch Enclave</span>
                        </button>

                        <button
                          onClick={() => setActiveConfigAddon(addon)}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-slate-500" />
                          <span>Configure</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Stripe Sandbox Checkout Modal */}
      <StripeCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        item={checkoutItem}
        userEmail="compliance-admin@sovereign-eu.org"
        onSuccess={handleStripeSuccess}
      />

      {/* Interactive Enclave Console Drawer / Modal */}
      <AnimatePresence>
        {activeConsoleAddon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">{activeConsoleAddon.name}</h2>
                      <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                        Enclave Live
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{activeConsoleAddon.category} • Tenant: {selectedTenant}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveConsoleAddon(null)}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Console Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 custom-scrollbar bg-slate-900">
                <PremiumAddonConsole
                  addon={{
                    id: activeConsoleAddon.id,
                    name: activeConsoleAddon.name,
                    category: activeConsoleAddon.category,
                    actId: activeConsoleAddon.actId,
                    desc: activeConsoleAddon.desc,
                    price: activeConsoleAddon.price,
                    score: activeConsoleAddon.score || 95,
                    colorClass: activeConsoleAddon.colorClass || 'bg-slate-800 text-slate-100',
                    icon: activeConsoleAddon.icon || 'ShieldCheck',
                    configSchema: activeConsoleAddon.configSchema,
                    configValues: activeConsoleAddon.configValues,
                    apiKey: activeConsoleAddon.apiKey
                  }}
                  tenantId={selectedTenant}
                  onUpdateConfig={(vals) => {
                    setAddons(prev => prev.map(a => a.id === activeConsoleAddon.id ? { ...a, configValues: vals } : a));
                  }}
                  showToast={showToast}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Addon Config Modal */}
      <AnimatePresence>
        {activeConfigAddon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{activeConfigAddon.name} Configuration</h3>
                    <p className="text-xs text-slate-500">Tenant: {selectedTenant} • Regulatory schema</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveConfigAddon(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 lg:p-6 overflow-y-auto flex-1 custom-scrollbar">
                <AddonConfigPanel
                  addonId={activeConfigAddon.id}
                  addonName={activeConfigAddon.name}
                  addonCategory={activeConfigAddon.category}
                  configSchema={activeConfigAddon.configSchema || [
                    { key: 'enforce_mode', label: 'Enforcement Policy Mode', type: 'select', options: ['STRICT_ENFORCE', 'AUDIT_LOG_ONLY', 'PERMISSIVE'], defaultValue: 'STRICT_ENFORCE' },
                    { key: 'continuous_scan_interval_mins', label: 'Continuous Telemetry Scan Frequency (Minutes)', type: 'number', defaultValue: 15 },
                    { key: 'auto_remediate_drift', label: 'Automatically Remediate Regulatory Drift', type: 'boolean', defaultValue: true }
                  ]}
                  currentValues={activeConfigAddon.configValues || {}}
                  onSave={handleSaveConfig}
                  onCancel={() => setActiveConfigAddon(null)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
