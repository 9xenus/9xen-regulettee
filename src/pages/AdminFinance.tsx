import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  Package, 
  Settings, 
  DollarSign, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Plus, 
  MoreVertical,
  Activity,
  Globe,
  Trash2,
  FileEdit,
  Landmark,
  Percent,
  Layers,
  Info,
  Calculator,
  ShieldAlert,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RegulatorBillingTreasury } from '../components/RegulatorBillingTreasury';
import { MultiSelectActionBar } from '../components/MultiSelectActionBar';
import { useNotification } from '../context/NotificationContext';
import { ApiMetricsWidget } from '../components/dashboard/ApiMetricsWidget';
import { SubscriptionRevenueHub } from './SubscriptionRevenueHub';
import { StripeSubscriptionManager } from '../components/admin/StripeSubscriptionManager';
import { UpgradePlanModal } from '../components/admin/UpgradePlanModal';
import { RegulatorBillingConfigManager } from '../components/admin/RegulatorBillingConfigManager';
import { SaasAdminInvoiceManager } from '../components/admin/SaasAdminInvoiceManager';
import { TaxEngineManager } from '../components/admin/TaxEngineManager';
import { SaaSSubscriptionManager } from '../components/admin/SaaSSubscriptionManager';
import { ExtraBillingConfig } from '../components/admin/ExtraBillingConfig';

interface AdminFinanceProps {
  activePath?: string;
}

export const AdminFinance: React.FC<AdminFinanceProps> = ({ activePath }) => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'PACKAGES' | 'SUBSCRIPTIONS' | 'PRICING_RULES' | 'REGULATOR_COMMISSIONS' | 'GATEWAY' | 'TREASURY' | 'BILLING_SYNC' | 'SUBSCRIPTION_HUB' | 'INVOICES' | 'TAX_ENGINE' | 'SAAS_MANAGER' | 'EXTRA_BILLING'>('PACKAGES');

  useEffect(() => {
    if (activePath === 'billing-sync') {
      setActiveTab('BILLING_SYNC');
    }
  }, [activePath]);
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  
  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeTenant, setUpgradeTenant] = useState<{ id: string; name: string; currentPlanId: string }>({ id: '', name: '', currentPlanId: 'price_starter' });

  // Interactive Pricing Rules state
  const [pricingRules, setPricingRules] = useState([
    { id: 'rule_1', name: 'Standard EU VAT Uplift', description: 'Apply dynamic region-specific value-added tax rates during checkout for all EU-based tenants.', type: 'VAT_UPLIFT' as const, value: 19, isActive: true, scope: 'EU-Wide', updated: '2 days ago' },
    { id: 'rule_caas', name: 'CaaS Compliance Add-on Premium', description: 'Standard uplift premium computed automatically for accounts with active Compliance-as-a-Service (CaaS) add-ons.', type: 'SURCHARGE' as const, value: 250, isActive: true, scope: 'All Tenants', updated: 'Just now' },
    { id: 'rule_enterprise', name: 'Enterprise Base Subscription Sovereign Adjuster', description: 'Dynamic compliance surcharge for Enterprise plans mapping to advanced legal SLA workloads.', type: 'SURCHARGE' as const, value: 1200, isActive: true, scope: 'Enterprise Plan', updated: 'Just now' },
    { id: 'rule_2', name: 'California CCPA Premium Surcharge', description: 'Add-on computation overhead for handling California sovereign residency validation routines.', type: 'SURCHARGE' as const, value: 150, isActive: true, scope: 'United States (CA)', updated: '1 week ago' },
    { id: 'rule_3', name: 'High-Volume Act Bundle Discount', description: 'Apply a percentage discount on global base subscription packages for clients managing 3 or more policy acts.', type: 'DISCOUNT' as const, value: 10, isActive: false, scope: 'Global Tenants', updated: '3 weeks ago' },
    { id: 'rule_4', name: 'Sovereign Cloud Hosting Overhead', description: 'Surcharge for provisioning dedicated, completely isolated sovereign cloud database enclaves.', type: 'SURCHARGE' as const, value: 500, isActive: true, scope: 'Sovereign Only', updated: '3 hours ago' }
  ]);

  // Pricing Rule form state
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleType, setNewRuleType] = useState<'VAT_UPLIFT' | 'SURCHARGE' | 'DISCOUNT'>('SURCHARGE');
  const [newRuleValue, setNewRuleValue] = useState(10);
  const [newRuleScope, setNewRuleScope] = useState('Global');

  // Gateway Settings state
  const [gatewaySettings, setGatewaySettings] = useState({
    autoVatEnabled: true,
    autoReceiptsEnabled: true,
    sepaEnabled: false,
    publishableKey: 'pk_live_51O...',
    webhookSecret: 'whsec_...'
  });
  const [isGatewaySaving, setIsGatewaySaving] = useState(false);

  // Simulator Calculator state
  const [simPackage, setSimPackage] = useState<'STARTER' | 'PRO' | 'ENTERPRISE'>('PRO');
  const [simRegion, setSimRegion] = useState<'DE' | 'FR' | 'US_CA' | 'OTHER'>('DE');
  const [simSovereignCloud, setSimSovereignCloud] = useState(true);
  const [simHighVolume, setSimHighVolume] = useState(false);
  const [simCaasAddon, setSimCaasAddon] = useState(true);

  // Dynamic pricing calculation simulation
  const simulatedPrice = useMemo(() => {
    let base = 239; // PRO
    if (simPackage === 'STARTER') base = 79;
    if (simPackage === 'ENTERPRISE') base = 799;

    let surchargeTotal = 0;
    let caasSurcharge = 0;
    let enterpriseSurcharge = 0;
    let otherSurcharge = 0;
    let discountPercent = 0;
    let vatPercent = 0;

    // Apply rules only if they are active
    pricingRules.forEach(rule => {
      if (!rule.isActive) return;

      if (rule.type === 'SURCHARGE') {
        if (rule.id === 'rule_2' && simRegion === 'US_CA') {
          otherSurcharge += rule.value;
          surchargeTotal += rule.value; // €150 California CCPA surcharge
        } else if (rule.id === 'rule_4' && simSovereignCloud) {
          otherSurcharge += rule.value;
          surchargeTotal += rule.value; // €500 Sovereign cloud hosting surcharge
        } else if (rule.id === 'rule_caas' && simCaasAddon) {
          caasSurcharge += rule.value;
          surchargeTotal += rule.value; // €250 CaaS Add-on Premium Surcharge
        } else if (rule.id === 'rule_enterprise' && simPackage === 'ENTERPRISE') {
          enterpriseSurcharge += rule.value;
          surchargeTotal += rule.value; // €1200 Enterprise base subscription adjuster
        } else if (rule.id !== 'rule_2' && rule.id !== 'rule_4' && rule.id !== 'rule_caas' && rule.id !== 'rule_enterprise') {
          otherSurcharge += rule.value;
          surchargeTotal += rule.value;
        }
      }

      if (rule.type === 'DISCOUNT') {
        if (rule.id === 'rule_3' && simHighVolume) {
          discountPercent += rule.value; // 10%
        } else if (rule.id !== 'rule_3') {
          discountPercent += rule.value;
        }
      }

      if (rule.type === 'VAT_UPLIFT') {
        if (rule.id === 'rule_1') {
          if (simRegion === 'DE') vatPercent = 19; // Germany
          else if (simRegion === 'FR') vatPercent = 20; // France
          else if (simRegion === 'OTHER') vatPercent = 15; // default rest of EU
        } else {
          vatPercent += rule.value;
        }
      }
    });

    let beforeVat = base + surchargeTotal;
    if (discountPercent > 0) {
      beforeVat = beforeVat * (1 - discountPercent / 100);
    }
    const vatAmount = beforeVat * (vatPercent / 100);
    const finalTotal = beforeVat + vatAmount;

    return {
      base,
      surchargeTotal,
      caasSurcharge,
      enterpriseSurcharge,
      otherSurcharge,
      discountPercent,
      vatPercent,
      vatAmount,
      finalTotal
    };
  }, [simPackage, simRegion, simSovereignCloud, simHighVolume, simCaasAddon, pricingRules]);

  const handleToggleRule = (id: string) => {
    setPricingRules(prev => prev.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
    setTimeout(() => {
      const rule = pricingRules.find(r => r.id === id);
      if (rule) {
        showToast(`Rule "${rule.name}" is now ${!rule.isActive ? 'Active' : 'Inactive'}.`, 'success');
      }
    }, 50);
  };

  const handleDeleteRule = (id: string) => {
    setPricingRules(prev => prev.filter(r => r.id !== id));
    showToast('Pricing rule deleted successfully.', 'info');
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newRule = {
      id: `rule_${Date.now()}`,
      name: newRuleName,
      description: newRuleDesc || 'Custom admin defined pricing exception formula.',
      type: newRuleType,
      value: Number(newRuleValue),
      isActive: true,
      scope: newRuleScope || 'Global',
      updated: 'Just now'
    };

    setPricingRules(prev => [...prev, newRule]);
    setIsAddingRule(false);
    setNewRuleName('');
    setNewRuleDesc('');
    setNewRuleValue(10);
    setNewRuleScope('Global');
    showToast(`Pricing rule "${newRuleName}" created and activated.`, 'success');
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [plansRes, subsRes] = await Promise.all([
          fetch('/api/v1/saas/billing/plans'),
          fetch('/api/v1/saas/billing/subscriptions')
        ]);
        const plansData = await plansRes.json();
        const subsData = await subsRes.json();
        if (cancelled) return;

        if (plansData.success && Array.isArray(plansData.plans) && plansData.plans.length > 0) {
          const mappedPlans = plansData.plans.map((p: any) => ({
            id: p.id,
            name: p.displayName || p.name || 'Package',
            price: p.basePriceUsd ?? p.basePriceBdt ?? 0,
            interval: (p.billingCycle || 'MONTHLY').toLowerCase().includes('year') ? 'yr' : 'mo',
            features: Object.keys(p.features || {}).filter((k: string) => (p.features || {})[k]).map((k: string) => k.replace(/[A-Z]/g, (c: string) => ' ' + c.toLowerCase()).replace('enable', '')),
            status: 'SEEDED'
          }));
          setPackages(mappedPlans);
        }

        if (subsData.success && Array.isArray(subsData.subscriptions) && subsData.subscriptions.length > 0) {
          const mappedSubs = subsData.subscriptions.map((s: any) => ({
            id: s.tenantId,
            tenant: s.tenantName || s.tenantId,
            package: s.planName || s.planId || 'Default Tier',
            amount: s.customPriceOverrideUsd ?? (s.planId === 'plan_enterprise' ? 1499 : s.planId === 'plan_pro' ? 299 : 49),
            status: s.status === 'ACTIVE' ? 'Active' : s.status === 'GRACE_PERIOD' ? 'Past Due' : (s.status || 'Active'),
            nextBilling: s.currentPeriodEnd || new Date().toISOString().split('T')[0]
          }));
          setSubscriptions(mappedSubs);
        }
      } catch {
        // Fall back to seeded local demo data
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load Gateway Settings
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/saas/billing/gateway-settings');
        const data = await res.json();
        if (data.success && data.settings) {
          if (!cancelled) setGatewaySettings(data.settings);
        }
      } catch {
        // keep seeded defaults
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSaveGatewaySettings = async () => {
    setIsGatewaySaving(true);
    try {
      const res = await fetch('/api/v1/saas/billing/gateway-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gatewaySettings)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Gateway settings saved successfully.', 'success');
      } else {
        showToast(data.error || 'Failed to save gateway settings.', 'error');
      }
    } catch {
      showToast('Error saving gateway settings.', 'error');
    } finally {
      setIsGatewaySaving(false);
    }
  };

  const handleRunGlobalSync = async () => {
    showToast('Syncing all enterprise subscriptions...', 'info');
    try {
      const res = await fetch('/api/v1/saas/billing/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'full' })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Subscription sync completed: ${data.syncedCount || 0} tenants in sync (out-of-sync: ${data.outOfSync || 0}).`, 'success');
      } else {
        showToast(data.error || 'Subscription sync failed.', 'error');
      }
    } catch {
      showToast('Error running global sync.', 'error');
    }
  };

  const handleRetryFailedWebhooks = async () => {
    try {
      const res = await fetch('/api/v1/saas/billing/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'webhook-retry' })
      });
      const data = await res.json();
      if (data.success) {
        showToast(Number(data.retriedCount) > 0 ? `Retried ${data.retriedCount} failed webhook event(s).` : 'No failed webhooks found.', 'success');
      } else {
        showToast(data.error || 'Webhook retry failed.', 'error');
      }
    } catch {
      showToast('Error retrying webhooks.', 'error');
    }
  };

  const [packages, setPackages] = useState([
    { id: 'p_1', name: 'Starter (Basic Acts)', price: 499, interval: 'month', features: ['GDPR', 'NIS2 Baseline'], status: 'Active' },
    { id: 'p_2', name: 'Pro (Full EU Scope)', price: 1299, interval: 'month', features: ['AI Act', 'DORA', 'EU Data Act', 'DPIA Generator'], status: 'Active' },
    { id: 'p_3', name: 'Enterprise Sovereign', price: 4999, interval: 'month', features: ['Dedicated Tenant', 'DPA Liaison', 'Custom SLA'], status: 'Active' }
  ]);

  const [subscriptions, setSubscriptions] = useState([
    { id: 'sub_1', tenant: 'Acme Corporation Europe', package: 'Pro (Full EU Scope)', amount: 1299, status: 'Active', nextBilling: '2026-07-01' },
    { id: 'sub_2', tenant: 'Stark Industries GmbH', package: 'Enterprise Sovereign', amount: 4999, status: 'Active', nextBilling: '2026-07-15' },
    { id: 'sub_3', tenant: 'Global Finance Corp', package: 'Starter (Basic Acts)', amount: 499, status: 'Past Due', nextBilling: '2026-06-01' }
  ]);

  const [billingHistory] = useState([
    { id: 'inv_1', tenant: 'Acme Corporation Europe', date: '2026-05-01', amount: 1299, status: 'Paid', method: 'Visa •••• 4242' },
    { id: 'inv_2', tenant: 'Stark Industries GmbH', date: '2026-05-15', amount: 4999, status: 'Paid', method: 'SEPA Direct Debit' },
    { id: 'inv_3', tenant: 'Global Finance Corp', date: '2026-05-01', amount: 499, status: 'Failed', method: 'Mastercard •••• 8888' },
    { id: 'inv_4', tenant: 'Acme Corporation Europe', date: '2026-04-01', amount: 1299, status: 'Paid', method: 'Visa •••• 4242' },
  ]);

  const treasuryReserves = useMemo(() => [
    { category: 'Regulatory Penalties (Escrow)', amount: 142000000, trend: '+4.2%', color: 'bg-indigo-500' },
    { category: 'SaaS Platform Operating Fund', amount: 24500000, trend: '+1.5%', color: 'bg-emerald-500' },
    { category: 'EU VAT Holdback', amount: 8900000, trend: '-0.2%', color: 'bg-amber-500' },
    { category: 'Disaster Recovery Reserve', amount: 12000000, trend: '+0.0%', color: 'bg-rose-500' }
  ], []);

  const vatByRegion = useMemo(() => [
    { country: 'Germany', code: 'DE', collected: 245000, status: 'FILLED' },
    { country: 'France', code: 'FR', collected: 189000, status: 'PENDING' },
    { country: 'Ireland', code: 'IE', collected: 142000, status: 'FILLED' },
    { country: 'Netherlands', code: 'NL', collected: 98000, status: 'FILLED' }
  ], []);

  const handleToggleSelectAllSubs = () => {
    if (selectedSubIds.length === subscriptions.length) {
      setSelectedSubIds([]);
    } else {
      setSelectedSubIds(subscriptions.map(s => s.id));
    }
  };

  const handleToggleSelectSub = (id: string) => {
    setSelectedSubIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleBatchDeleteSubs = () => {
    setSubscriptions(prev => prev.filter(s => !selectedSubIds.includes(s.id)));
    showToast(`Cancelled ${selectedSubIds.length} subscriptions.`, 'info');
    setSelectedSubIds([]);
  };

  const handleBatchUpdateSubStatus = (status: string) => {
    setSubscriptions(prev => prev.map(s => 
      selectedSubIds.includes(s.id) ? { ...s, status } : s
    ));
    showToast(`Updated status to ${status} for ${selectedSubIds.length} subscriptions.`, 'success');
    setSelectedSubIds([]);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Finance & Subscriptions</h1>
          <p className="text-slate-500 mt-1">Manage billing plans, track revenue, and configure the Stripe payment gateway.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center text-sm">
            <DollarSign className="w-4 h-4 mr-2" />
            <span>Generate Revenue Report</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-sm font-medium mb-1 block">Monthly Recurring Revenue (MRR)</span>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-black text-slate-800 tracking-tighter">€64,200</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium flex items-center mt-2">
            <TrendingUp className="w-3 h-3 mr-1" /> +12% from last month
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-sm font-medium mb-1 block">Active Subscriptions</span>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-black text-slate-800 tracking-tighter">142</span>
          </div>
          <p className="text-xs text-slate-400 font-medium flex items-center mt-2">
            <Users className="w-3 h-3 mr-1" /> Across all EU Regions
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-sm font-medium mb-1 block">Past Due Invoices</span>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-black text-amber-500 tracking-tighter">€1,498</span>
          </div>
          <p className="text-xs text-amber-600 font-medium flex items-center mt-2">
            3 tenants require follow-up
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-sm font-medium mb-1 block">Stripe Gateway Status</span>
          <div className="flex items-end space-x-2">
            <span className="text-xl font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded block mt-1">
              Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium flex items-center mt-2">
            <Activity className="w-3 h-3 mr-1" /> Live Mode
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-full md:w-fit overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('PACKAGES')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'PACKAGES' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Package Builder
        </button>
        <button 
          onClick={() => setActiveTab('PRICING_RULES')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'PRICING_RULES' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Pricing Rules Engine
        </button>
        <button 
          onClick={() => setActiveTab('SUBSCRIPTIONS')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'SUBSCRIPTIONS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Active Subscriptions
        </button>
        <button 
          onClick={() => setActiveTab('TREASURY')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'TREASURY' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Treasury & Reserves
        </button>
        <button 
          onClick={() => setActiveTab('REGULATOR_COMMISSIONS')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'REGULATOR_COMMISSIONS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Regulator Splits
        </button>
        <button 
          onClick={() => setActiveTab('GATEWAY')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'GATEWAY' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Gateways
        </button>
        <button 
          onClick={() => setActiveTab('BILLING_SYNC')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'BILLING_SYNC' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Billing Sync
        </button>
        <button 
          onClick={() => setActiveTab('SUBSCRIPTION_HUB')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'SUBSCRIPTION_HUB' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
        >
          Subscription & Revenue Hub (Phases 1-4)
        </button>
        <button 
          onClick={() => setActiveTab('INVOICES')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'INVOICES' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Invoices & Billing 📄
        </button>
        <button 
          onClick={() => setActiveTab('TAX_ENGINE')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'TAX_ENGINE' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Tax Engine ⚖️
        </button>
        <button 
          onClick={() => setActiveTab('SAAS_MANAGER')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'SAAS_MANAGER' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
        >
          SaaS Packages & Subs 📂
        </button>
        <button 
          onClick={() => setActiveTab('EXTRA_BILLING')}
          className={`whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'EXTRA_BILLING' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Consumption Rates ⚡
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'SAAS_MANAGER' && (
          <SaaSSubscriptionManager />
        )}
        {activeTab === 'EXTRA_BILLING' && (
          <ExtraBillingConfig />
        )}
        {activeTab === 'INVOICES' && (
          <SaasAdminInvoiceManager />
        )}
        {activeTab === 'TAX_ENGINE' && (
          <TaxEngineManager />
        )}
        {activeTab === 'PRICING_RULES' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Rules List & Builder */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <ApiMetricsWidget />
              {/* Rules List Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <div className="text-left">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center">
                      <Layers className="w-5 h-5 text-indigo-500 mr-2" /> 
                      Sovereign Rules Registry
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Configure active jurisdictional modifiers, tax compliance tables, and sovereign premium surcharges.</p>
                  </div>
                  {!isAddingRule && (
                    <button 
                      onClick={() => setIsAddingRule(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Custom Rule
                    </button>
                  )}
                </div>

                {/* Inline Add Rule Form */}
                {isAddingRule && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    onSubmit={handleAddRule} 
                    className="p-4 sm:p-5 lg:p-6 bg-slate-50/50 border-b border-slate-200 text-left space-y-4"
                  >
                    <h3 className="font-bold text-sm text-slate-800 flex items-center">
                      <Plus className="w-4 h-4 text-indigo-600 mr-2" />
                      Define New Pricing Directive
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rule Name</label>
                        <input 
                          type="text" 
                          required 
                          value={newRuleName}
                          onChange={e => setNewRuleName(e.target.value)}
                          placeholder="e.g., Swiss Sovereign Cloud Premium" 
                          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Scope / Region</label>
                        <input 
                          type="text" 
                          value={newRuleScope}
                          onChange={e => setNewRuleScope(e.target.value)}
                          placeholder="e.g., Switzerland (CH)" 
                          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                      <textarea 
                        rows={2}
                        value={newRuleDesc}
                        onChange={e => setNewRuleDesc(e.target.value)}
                        placeholder="Define rule mechanics, trigger triggers, and regional policy context..." 
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rule Type</label>
                        <select 
                          value={newRuleType}
                          onChange={e => setNewRuleType(e.target.value as any)}
                          className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white font-medium text-slate-800"
                        >
                          <option value="SURCHARGE">Fixed Surcharge (€)</option>
                          <option value="VAT_UPLIFT">VAT Uplift (%)</option>
                          <option value="DISCOUNT">Percent Discount (%)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Adjustment Value</label>
                        <input 
                          type="number" 
                          required 
                          min="0"
                          value={newRuleValue}
                          onChange={e => setNewRuleValue(Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-800"
                        />
                      </div>
                      <div className="flex items-end space-x-2">
                        <button 
                          type="submit" 
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
                        >
                          Activate Rule
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setIsAddingRule(false)}
                          className="py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-sm rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.form>
                )}

                {/* Rules List rendering */}
                <div className="divide-y divide-slate-100">
                  {pricingRules.map((rule) => (
                    <div key={rule.id} className="p-5 flex items-start justify-between hover:bg-slate-50/50 transition-colors text-left">
                      <div className="flex items-start space-x-3.5 pr-4">
                        <div className={`p-2.5 rounded-xl mt-0.5 ${
                          rule.type === 'VAT_UPLIFT' ? 'bg-amber-50 text-amber-600' :
                          rule.type === 'SURCHARGE' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {rule.type === 'VAT_UPLIFT' ? <Percent className="w-5 h-5" /> :
                           rule.type === 'SURCHARGE' ? <DollarSign className="w-5 h-5" /> :
                           <TrendingUp className="w-5 h-5" />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h4 className="font-bold text-slate-800 text-sm leading-snug">{rule.name}</h4>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] font-bold rounded">
                              {rule.scope}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase tracking-wider ${
                              rule.type === 'VAT_UPLIFT' ? 'bg-amber-100/60 text-amber-800' :
                              rule.type === 'SURCHARGE' ? 'bg-indigo-100/60 text-indigo-800' :
                              'bg-emerald-100/60 text-emerald-800'
                            }`}>
                              {rule.type === 'VAT_UPLIFT' ? 'VAT Tax' :
                               rule.type === 'SURCHARGE' ? 'Surcharge' :
                               'Discount'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{rule.description}</p>
                          <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-medium pt-0.5">
                            <span>Value: {rule.type === 'SURCHARGE' ? `€${rule.value}` : `${rule.value}%`}</span>
                            <span>•</span>
                            <span>Updated {rule.updated}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rule Actions */}
                      <div className="flex items-center space-x-3 shrink-0">
                        {/* Toggle active state */}
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            rule.isActive ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              rule.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        {/* Delete custom rules */}
                        {rule.id.startsWith('rule_') && rule.id !== 'rule_1' && rule.id !== 'rule_2' && rule.id !== 'rule_3' && rule.id !== 'rule_4' && rule.id !== 'rule_caas' && rule.id !== 'rule_enterprise' && (
                          <button 
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Policy Enactments Audit Info Card */}
              <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-left text-white overflow-hidden relative shadow-md">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-indigo-300 flex items-center">
                      <ShieldAlert className="w-4 h-4 text-indigo-400 mr-2 shrink-0" />
                      Dynamic Compliance Synchronization
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      SaaS Sovereign Portal automatically aligns billing metrics with real-time National Regulator splits. Surcharges are computed dynamically based on localized encryption requirements.
                    </p>
                  </div>
                  <div className="px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono text-[10px] font-bold rounded">
                    Engine Status: ACTIVE
                  </div>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
              </div>
            </div>

            {/* Interactive Calculator Simulator */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, x: 10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-5 text-left sticky top-4"
              >
                <h3 className="font-bold text-slate-950 flex items-center text-base border-b border-slate-100 pb-3">
                  <Calculator className="w-5 h-5 text-emerald-500 mr-2" />
                  Live Revenue Rules Simulator
                </h3>

                {/* Pick Package */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase">1. Subscription Tier</label>
                  <select 
                    value={simPackage}
                    onChange={e => setSimPackage(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="STARTER">Starter Plan (€499/mo)</option>
                    <option value="PRO">Pro Enterprise (€1,299/mo)</option>
                    <option value="ENTERPRISE">Sovereign Enterprise (€4,999/mo)</option>
                  </select>
                </div>

                {/* Pick Region */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase">2. Target Jurisdiction</label>
                  <select 
                    value={simRegion}
                    onChange={e => setSimRegion(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DE">Germany (EU-DE - 19% VAT)</option>
                    <option value="FR">France (EU-FR - 20% VAT)</option>
                    <option value="US_CA">California (US-CA - CCPA Rule applies)</option>
                    <option value="OTHER">Other Jurisdiction (15% default VAT)</option>
                  </select>
                </div>

                {/* Interactive Toggles */}
                <div className="space-y-3.5 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase">3. Custom Tenant Attributes</label>
                  
                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={simSovereignCloud}
                      onChange={e => setSimSovereignCloud(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 mt-0.5 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-700 group-hover:text-slate-900 block">Sovereign Cloud Hosting</span>
                      <span className="text-slate-400 font-medium">Triggers Sovereign Cloud Premium surcharge rules</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={simHighVolume}
                      onChange={e => setSimHighVolume(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 mt-0.5 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-700 group-hover:text-slate-900 block">High-Volume Bundle (3+ Acts)</span>
                      <span className="text-slate-400 font-medium">Applies Volume Discount Rule if rule active</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={simCaasAddon}
                      onChange={e => setSimCaasAddon(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 mt-0.5 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-700 group-hover:text-slate-900 block">Enterprise Services Premium</span>
                      <span className="text-slate-400 font-medium">Enables interactive Enterprise Marketplace premium</span>
                    </div>
                  </label>
                </div>

                {/* Price Breakdown display */}
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4.5 space-y-3 font-mono text-xs shadow-inner">
                  <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800 pb-2">
                    <span>Component Ledger</span>
                    <span>Value</span>
                  </div>
                  
                  <div className="flex justify-between text-slate-300">
                    <span>Base Tier rate:</span>
                    <span>€{simulatedPrice.base.toLocaleString()}</span>
                  </div>

                  {simulatedPrice.caasSurcharge > 0 && (
                    <div className="flex justify-between text-indigo-300">
                      <span>Enterprise Services Premium:</span>
                      <span>+€{simulatedPrice.caasSurcharge.toLocaleString()}</span>
                    </div>
                  )}

                  {simulatedPrice.enterpriseSurcharge > 0 && (
                    <div className="flex justify-between text-indigo-300">
                      <span>Enterprise Sovereign Adj:</span>
                      <span>+€{simulatedPrice.enterpriseSurcharge.toLocaleString()}</span>
                    </div>
                  )}

                  {simulatedPrice.otherSurcharge > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Other Surcharges:</span>
                      <span>+€{simulatedPrice.otherSurcharge.toLocaleString()}</span>
                    </div>
                  )}

                  {simulatedPrice.discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Volume Discount:</span>
                      <span>-{simulatedPrice.discountPercent}%</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>VAT Index ({simulatedPrice.vatPercent}%):</span>
                    <span>+€{simulatedPrice.vatAmount.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                  </div>

                  <div className="border-t border-slate-800 pt-2 flex justify-between items-end">
                    <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">Total Monthly</span>
                    <span className="text-xl font-black text-white leading-none">
                      €{simulatedPrice.finalTotal.toLocaleString(undefined, {maximumFractionDigits: 1})}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 italic leading-relaxed pt-1 flex items-start">
                  <Info className="w-3.5 h-3.5 text-indigo-500 mr-1.5 mt-0.5 shrink-0" />
                  <span>Calculations run dynamically inside the browser sandboxed execution space conforming with live sovereign rules active state.</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'PACKAGES' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <Package className="w-5 h-5 text-indigo-500 mr-2" /> 
                  SaaS Subscription Packages
                </h2>
                <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center transition-colors">
                  <Plus className="w-4 h-4 mr-1" /> Create Package
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-5 lg:p-6">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition-colors bg-white flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] uppercase tracking-wider font-bold rounded-full">
                        {pkg.status}
                      </span>
                      <button className="text-slate-400 hover:text-slate-600">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{pkg.name}</h3>
                    <div className="flex items-end space-x-1 mb-4">
                      <span className="text-3xl font-black text-slate-900">€{pkg.price}</span>
                      <span className="text-slate-500 font-medium pb-1">/{pkg.interval}</span>
                    </div>
                    <div className="space-y-2 flex-1">
                      {pkg.features.map((feature, i) => (
                        <div key={i} className="flex items-center text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-6 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-lg text-sm transition-colors">
                      Edit Package Config
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 text-emerald-500 mr-2" />
                  Global Pricing Rules
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Base Currency</label>
                    <select className="w-full border border-slate-200 rounded-lg p-2 text-sm">
                      <option>EUR (€) - Primary</option>
                      <option>USD ($)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                      <span className="text-sm text-slate-700">Apply EU-wide VAT by default</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Platform Transaction Fee (%)</label>
                    <input type="number" defaultValue="2.5" className="w-full border border-slate-200 rounded-lg p-2 text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SUBSCRIPTIONS' && (
          <div className="space-y-4 sm:space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <Users className="w-5 h-5 text-indigo-500 mr-2" /> 
                  Tenant Subscriptions
                </h2>
              </div>
              <div className="p-4">
                <StripeSubscriptionManager tenantId="admin-console" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">
                        <input
                          type="checkbox"
                          checked={subscriptions.length > 0 && selectedSubIds.length === subscriptions.length}
                          onChange={handleToggleSelectAllSubs}
                          className="h-4 w-4 text-emerald-600 border-slate-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 font-semibold text-slate-600">Tenant Organization</th>
                      <th className="px-6 py-3 font-semibold text-slate-600">Active Package</th>
                      <th className="px-6 py-3 font-semibold text-slate-600">Amount</th>
                      <th className="px-6 py-3 font-semibold text-slate-600">Status</th>
                      <th className="px-6 py-3 font-semibold text-slate-600">Next Billing</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.map((sub, i) => (
                      <tr key={i} className={`hover:bg-slate-50 transition-colors ${selectedSubIds.includes(sub.id) ? 'bg-emerald-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedSubIds.includes(sub.id)}
                            onChange={() => handleToggleSelectSub(sub.id)}
                            className="h-4 w-4 text-emerald-600 border-slate-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{sub.tenant}</td>
                        <td className="px-6 py-4 text-slate-600">{sub.package}</td>
                        <td className="px-6 py-4 font-mono font-medium text-slate-700">€{sub.amount}/mo</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sub.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{sub.nextBilling}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            <button 
                              onClick={() => {
                                setUpgradeTenant({
                                  id: sub.id,
                                  name: sub.tenant,
                                  currentPlanId: sub.amount === 499 ? 'price_starter' : sub.amount === 1299 ? 'price_pro' : 'price_sovereign'
                                });
                                setIsUpgradeModalOpen(true);
                              }}
                              className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] rounded-lg border-0 transition cursor-pointer"
                            >
                              Upgrade Tier
                            </button>
                            <button className="text-slate-400 hover:text-slate-600">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <MultiSelectActionBar
                selectedCount={selectedSubIds.length}
                onDelete={handleBatchDeleteSubs}
                onStatusUpdate={handleBatchUpdateSubStatus}
                onClear={() => setSelectedSubIds([])}
                statusOptions={[
                  { value: 'Active', label: 'Set as Active' },
                  { value: 'Past Due', label: 'Set as Past Due' },
                  { value: 'Cancelled', label: 'Set as Cancelled' }
                ]}
              />
            </motion.div>

            {/* Billing History Table */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <Activity className="w-5 h-5 text-indigo-500 mr-2" /> 
                  Sovereign Billing History
                </h2>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Export All Invoices</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-slate-600">Invoice ID</th>
                      <th className="px-6 py-3 font-semibold text-slate-600">Organization</th>
                      <th className="px-6 py-3 font-semibold text-slate-600">Billing Date</th>
                      <th className="px-6 py-3 font-semibold text-slate-600">Amount</th>
                      <th className="px-6 py-3 font-semibold text-slate-600">Status</th>
                      <th className="px-6 py-3 font-semibold text-slate-600">Payment Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {billingHistory.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-500 text-xs">{inv.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{inv.tenant}</td>
                        <td className="px-6 py-4 text-slate-600">{inv.date}</td>
                        <td className="px-6 py-4 font-mono font-bold">€{inv.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{inv.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'TREASURY' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-8 space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900">Global Reserve Allocation</h3>
                    <p className="text-xs text-slate-500 mt-0.5">High-liquidity funds held across sovereign EU enclaves.</p>
                  </div>
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Optimize Allocation</button>
                </div>
                <div className="p-4 sm:p-5 lg:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    {treasuryReserves.map((reserve, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{reserve.category}</span>
                            <div className="text-xl font-black text-slate-900 mt-0.5">€{reserve.amount.toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-bold ${reserve.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {reserve.trend}
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(reserve.amount / 150000000) * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className={`h-full rounded-full ${reserve.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-slate-900">EU Sovereign VAT Ledger</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Automated tax collection tracking per member state.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr className="text-xs font-bold text-slate-500 uppercase">
                        <th className="px-6 py-3 text-left">Jurisdiction</th>
                        <th className="px-6 py-3 text-left">VAT Code</th>
                        <th className="px-6 py-3 text-left">Total Collected (YTD)</th>
                        <th className="px-6 py-3 text-left">Filing Status</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vatByRegion.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-800">{v.country}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{v.code}-VAT-GLOBAL</td>
                          <td className="px-6 py-4 font-bold text-slate-900">€{v.collected.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${v.status === 'FILLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">View Report</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>

            <div className="lg:col-span-4 space-y-4 sm:space-y-6">
              <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl">
                <h4 className="font-bold text-emerald-400 mb-4 flex items-center">
                  <Landmark className="w-4 h-4 mr-2" />
                  Sovereign Liquidity Snapshot
                </h4>
                <div className="space-y-4">
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Platform Liquidity</div>
                    <div className="text-2xl font-black mt-1">€187.4M</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Burn Rate (Operational)</div>
                    <div className="text-xl font-bold mt-1 text-rose-400">€420K / mo</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Runway (Years)</div>
                    <div className="text-xl font-bold mt-1 text-emerald-400">4.2 Years</div>
                  </div>
                </div>
                <button className="w-full mt-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-colors shadow-lg">
                  Initiate Fund Rebalancing
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-indigo-500" />
                  Compliance Checklist
                </h4>
                <div className="space-y-3">
                  {[
                    'DPA Escrow Synchronization',
                    'Member State VAT Remittance',
                    'Platform Dividend Payouts',
                    'NIS2 Disaster Recovery Fund'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center text-xs text-slate-600 py-1 border-b border-slate-50 last:border-0">
                      <div className="w-4 h-4 rounded border border-slate-300 mr-2 flex items-center justify-center">
                        {i === 0 && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />}
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'REGULATOR_COMMISSIONS' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 sm:space-y-8">
            <RegulatorBillingTreasury isAdminView={true} />
            <div className="pt-8 border-t border-slate-200">
               <RegulatorBillingConfigManager />
            </div>
          </motion.div>
        )}

        {activeTab === 'GATEWAY' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-3xl">
            <div className="p-5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <Globe className="w-5 h-5 text-indigo-500 mr-2" /> 
                Stripe Payments Integration
              </h2>
              <p className="text-sm text-slate-500 mt-1">Configure global collection, tax regions, and checkout settings for tenants.</p>
            </div>
            
            <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-800">Connection Active</h4>
                  <p className="text-xs text-emerald-700 mt-1">Stripe platform account is linked successfully. Webhooks are responding normally.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Stripe Publishable Key</label>
                  <input type="text" value="pk_live_51O..." readOnly className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Stripe Secret Key</label>
                  <div className="relative">
                    <input type="password" value="sk_live_51O..." readOnly className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono pr-20" />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50">Reveal</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Webhook Secret</label>
                  <input type="password" value="whsec_..." readOnly className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-md font-bold text-slate-800 mb-4">Checkout Configuration</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={gatewaySettings.autoVatEnabled} onChange={e => setGatewaySettings(s => ({ ...s, autoVatEnabled: e.target.checked }))} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    <span className="text-sm text-slate-700 font-medium">Enable Automatic EU VAT Calculation (Stripe Tax)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={gatewaySettings.autoReceiptsEnabled} onChange={e => setGatewaySettings(s => ({ ...s, autoReceiptsEnabled: e.target.checked }))} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    <span className="text-sm text-slate-700 font-medium">Send automatic billing receipts via Stripe Email</span>
                  </label>
                   <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={gatewaySettings.sepaEnabled} onChange={e => setGatewaySettings(s => ({ ...s, sepaEnabled: e.target.checked }))} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    <span className="text-sm text-slate-700 font-medium">Allow SEPA Direct Debit for EU Customers</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveGatewaySettings}
                  disabled={isGatewaySaving}
                  className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors"
                >
                  {isGatewaySaving ? 'Saving...' : 'Save Gateway Settings'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'BILLING_SYNC' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl">
            <div className="p-5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <RefreshCcw className="w-5 h-5 text-indigo-500 mr-2" /> 
                Enterprise Subscription Synchronization
              </h2>
              <p className="text-sm text-slate-500 mt-1">Force sync billing states, quotas, and feature flags with enterprise client tenants in real-time.</p>
            </div>
            
            <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm font-bold text-slate-700">Total Tenants</div>
                  <div className="text-2xl font-black text-indigo-600 mt-1">{subscriptions.length}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm font-bold text-slate-700">Out of Sync</div>
                  <div className="text-2xl font-black text-amber-500 mt-1">0</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm font-bold text-slate-700">Last Global Sync</div>
                  <div className="text-lg font-bold text-slate-600 mt-1">{new Date().toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Sync Operations</h3>
                
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-200 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Full State Reconciliation</h4>
                    <p className="text-xs text-slate-500 mt-1">Re-evaluate all tenant subscriptions, refresh limits, and sync statuses with the payment gateway.</p>
                  </div>
                  <button 
                    onClick={() => handleRunGlobalSync()}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-lg text-xs transition-colors flex items-center"
                  >
                    <RefreshCcw className="w-4 h-4 mr-1" /> Run Global Sync
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-200 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Provisioning Webhook Retry</h4>
                    <p className="text-xs text-slate-500 mt-1">Re-trigger failed provisioning webhooks for enterprise clients.</p>
                  </div>
                  <button 
                    onClick={() => handleRetryFailedWebhooks()}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-lg text-xs transition-colors"
                  >
                    Retry Failed Events
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'SUBSCRIPTION_HUB' && (
          <SubscriptionRevenueHub />
        )}
      </div>

      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        tenantId={upgradeTenant.id}
        tenantName={upgradeTenant.name}
        currentPlanId={upgradeTenant.currentPlanId}
        onSuccess={() => {
          setIsUpgradeModalOpen(false);
          showToast(`Initiating plan upgrade for ${upgradeTenant.name}...`, 'success');
        }}
      />
    </div>
  );
};
