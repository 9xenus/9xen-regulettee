import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  Package, 
  Plus, 
  Trash2, 
  Check, 
  Settings, 
  DollarSign, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Layers, 
  Edit, 
  Globe, 
  Activity, 
  Info,
  Calendar,
  Zap,
  Tag,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

interface BillingPackage {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  status: 'Active' | 'Draft' | 'Deprecated';
  targetType?: 'CLIENT' | 'LAWYER';
}

interface TenantSubscription {
  id: string;
  tenantId: string;
  tenantName: string;
  packageName: string;
  baseAmount: number;
  additionalAddons: string[];
  finalAmount: number;
  status: 'Active' | 'Past Due' | 'Trial' | 'Suspended';
  nextBillingDate: string;
  region: string;
  autoRenew: boolean;
}

export const SaaSSubscriptionManager: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'PACKAGES' | 'TENANT_SUBS' | 'PRICING_RULES'>('PACKAGES');
  
  // Storage states
  const [packages, setPackages] = useState<BillingPackage[]>([]);
  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
  
  // Pricing Rules
  const [pricingRules, setPricingRules] = useState([
    { id: 'r_vat', name: 'Standard EU VAT Uplift', description: 'Apply dynamic region-specific value-added tax rates during checkout for all EU-based tenants.', type: 'VAT_UPLIFT' as const, value: 19, isActive: true },
    { id: 'r_caas', name: 'CaaS Compliance Add-on Surcharge', description: 'Standard uplift premium computed automatically for accounts with active Compliance-as-a-Service (CaaS) add-ons.', type: 'SURCHARGE' as const, value: 250, isActive: true },
    { id: 'r_sovereign', name: 'Sovereign Database Isolation Premium', description: 'Overhead for provisioning dedicated, completely isolated sovereign cloud database enclaves.', type: 'SURCHARGE' as const, value: 500, isActive: true },
    { id: 'r_bulk', name: 'Multi-Tenant High Volume Discount', description: 'Apply percentage discount for clients operating more than 3 legal policy workspaces.', type: 'DISCOUNT' as const, value: 10, isActive: true }
  ]);

  // Packages forms
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState(100);
  const [newPkgInterval, setNewPkgInterval] = useState<'month' | 'year'>('month');
  const [newPkgFeature, setNewPkgFeature] = useState('');
  const [newPkgFeaturesList, setNewPkgFeaturesList] = useState<string[]>([]);

  // Subscriptions forms
  const [editingSub, setEditingSub] = useState<TenantSubscription | null>(null);

  // Load datasets with elegant fallbacks
  useEffect(() => {
    try {
      const storedPackages = localStorage.getItem('sovereign_packages');
      const seedPackages: BillingPackage[] = [
        { id: 'pkg_starter', name: 'Starter Compliance', price: 79, interval: 'month', features: ['Up to 5 connected systems', 'Basic privacy mapping', 'Standard cookie consent', 'Monthly compliance reports', 'Email support'], status: 'Active', targetType: 'CLIENT' },
        { id: 'pkg_pro', name: 'Professional Shield', price: 239, interval: 'month', features: ['Unlimited connected systems', 'Automated GDPR Article 30', 'Real-time drift detection', 'DORA & NIS2 audit kits', 'Priority 24/7 support'], status: 'Active', targetType: 'CLIENT' },
        { id: 'pkg_enterprise', name: 'Enterprise Sovereign Cloud', price: 799, interval: 'month', features: ['Dedicated sovereign cloud enclave', 'White-labeled portals', 'On-premise deployment options', 'Advanced AI risk auditing', 'Dedicated account manager'], status: 'Active', targetType: 'CLIENT' },
        { id: 'pkg_lawyer_basic', name: 'Legal Consultant Basic', price: 149, interval: 'month', features: ['Case management portal', 'Client document vault', 'Secure messaging', 'Basic AI drafting'], status: 'Active', targetType: 'LAWYER' },
        { id: 'pkg_lawyer_pro', name: 'Lawyer Professional', price: 399, interval: 'month', features: ['Advanced Case Management', 'Multi-Jurisdictional AI Research', 'Team collaboration tools', 'Priority client onboarding'], status: 'Active', targetType: 'LAWYER' },
        { id: 'pkg_onetime_regional', name: 'Regional Sovereign Enclave (Perpetual)', price: 4950, interval: 'year', features: ['Single Region Sovereign Enclave', 'Hardware HSM Key Isolation', 'Air-Gapped Audit Ledger', '1 Year Rule Updates Included'], status: 'Active', targetType: 'CLIENT' },
        { id: 'pkg_onetime_global', name: 'Global Sovereign Hub (Perpetual)', price: 12800, interval: 'year', features: ['Multi-Jurisdictional Global Deployment', 'PQC Key Sharding', 'B2G Regulator Integration', '3 Years Rule Updates Included'], status: 'Active', targetType: 'CLIENT' },
        { id: 'pkg_onetime_airgapped', name: 'Air-Gapped Core On-Premises (Perpetual)', price: 29500, interval: 'year', features: ['Air-Gapped On-Premises Escrow', 'Zero Cross-Border Data Egress', 'Lifetime Continuous Auditing', 'Dedicated Executive DPO'], status: 'Active', targetType: 'CLIENT' }
      ];

      if (storedPackages) {
        setPackages(JSON.parse(storedPackages));
      } else {
        setPackages(seedPackages);
        localStorage.setItem('sovereign_packages', JSON.stringify(seedPackages));
      }

      const storedSubs = localStorage.getItem('sovereign_subscriptions');
      const seedSubs: TenantSubscription[] = [
        { id: 'sub_1', tenantId: 't_acme', tenantName: 'Acme Corporation Europe', packageName: 'Pro (Full EU Scope)', baseAmount: 1299, additionalAddons: ['CaaS Addon'], finalAmount: 1549, status: 'Active', nextBillingDate: '2026-09-15', region: 'Germany (DE)', autoRenew: true },
        { id: 'sub_2', tenantId: 't_stark', tenantName: 'Stark Industries GmbH', packageName: 'Enterprise Sovereign Cloud', baseAmount: 4999, additionalAddons: ['Sovereign Enclave', 'CaaS Addon'], finalAmount: 5749, status: 'Active', nextBillingDate: '2026-09-20', region: 'France (FR)', autoRenew: true },
        { id: 'sub_3', tenantId: 't_finance', tenantName: 'Global Finance Corp', packageName: 'Starter (Basic Acts)', baseAmount: 499, additionalAddons: [], finalAmount: 499, status: 'Past Due', nextBillingDate: '2026-08-01', region: 'Ireland (IE)', autoRenew: false }
      ];

      if (storedSubs) {
        setSubscriptions(JSON.parse(storedSubs));
      } else {
        setSubscriptions(seedSubs);
        localStorage.setItem('sovereign_subscriptions', JSON.stringify(seedSubs));
      }
    } catch (e) {
      console.error('Failed to resolve subscription structures:', e);
    }
  }, []);

  // Recalculating dynamic sums based on pricing rules
  const calculateFinalPrice = (base: number, addons: string[], region: string) => {
    let price = base;
    
    // Surcharges
    if (addons.includes('CaaS Addon') && pricingRules.find(r => r.id === 'r_caas')?.isActive) {
      price += 250;
    }
    if (addons.includes('Sovereign Enclave') && pricingRules.find(r => r.id === 'r_sovereign')?.isActive) {
      price += 500;
    }

    // Discounts
    if (addons.length >= 2 && pricingRules.find(r => r.id === 'r_bulk')?.isActive) {
      const discount = pricingRules.find(r => r.id === 'r_bulk')?.value || 10;
      price = price * (1 - discount / 100);
    }

    // VAT
    if (pricingRules.find(r => r.id === 'r_vat')?.isActive) {
      let rate = 19;
      if (region.includes('FR')) rate = 20;
      if (region.includes('IE')) rate = 23;
      price = price * (1 + rate / 100);
    }

    return Math.round(price);
  };

  // Add Package Feature
  const handleAddFeature = () => {
    if (newPkgFeature.trim() && !newPkgFeaturesList.includes(newPkgFeature.trim())) {
      setNewPkgFeaturesList([...newPkgFeaturesList, newPkgFeature.trim()]);
      setNewPkgFeature('');
    }
  };

  // Create Package
  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName.trim()) {
      showToast('Please specify a package name.', 'error');
      return;
    }

    const created: BillingPackage = {
      id: `pkg_${Date.now()}`,
      name: newPkgName,
      price: Number(newPkgPrice),
      interval: newPkgInterval,
      features: newPkgFeaturesList.length > 0 ? newPkgFeaturesList : ['Standard Workspaces'],
      status: 'Active'
    };

    const updated = [...packages, created];
    setPackages(updated);
    localStorage.setItem('sovereign_packages', JSON.stringify(updated));

    setShowAddPackage(false);
    setNewPkgName('');
    setNewPkgPrice(100);
    setNewPkgFeaturesList([]);
    showToast(`Package Plan "${newPkgName}" has been launched successfully.`, 'success');
  };

  // Edit Subscription
  const handleUpdateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;

    const finalAmount = calculateFinalPrice(editingSub.baseAmount, editingSub.additionalAddons, editingSub.region);
    const updatedSub = {
      ...editingSub,
      finalAmount
    };

    const updated = subscriptions.map(s => s.id === updatedSub.id ? updatedSub : s);
    setSubscriptions(updated);
    localStorage.setItem('sovereign_subscriptions', JSON.stringify(updated));
    setEditingSub(null);
    showToast(`Subscription adjusted for ${updatedSub.tenantName}.`, 'success');
  };

  const handleToggleAutoRenew = (subId: string) => {
    const updated = subscriptions.map(s => {
      if (s.id === subId) {
        const nextState = !s.autoRenew;
        showToast(`Auto-renewal ${nextState ? 'enabled' : 'disabled'} for ${s.tenantName}`, nextState ? 'success' : 'info');
        return { ...s, autoRenew: nextState };
      }
      return s;
    });
    setSubscriptions(updated);
    localStorage.setItem('sovereign_subscriptions', JSON.stringify(updated));
  };

  // Toggle pricing rule
  const handleToggleRule = (id: string) => {
    const updated = pricingRules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
    setPricingRules(updated);
    showToast('Pricing Rules Engine configurations updated.', 'info');
  };

  const totalMRR = useMemo(() => {
    return subscriptions
      .filter(s => s.status === 'Active')
      .reduce((acc, curr) => acc + curr.finalAmount, 0);
  }, [subscriptions]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* SaaS Billing metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Dynamic Platform MRR</span>
          <div className="flex items-end space-x-2 mt-2">
            <span className="text-2xl font-black text-slate-800 tracking-tight">€{totalMRR.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> Computed live against regional rules
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Active Client Licenses</span>
          <div className="flex items-end space-x-2 mt-2">
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {subscriptions.filter(s => s.status === 'Active').length}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            Across 27 Schengen territories
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Plan Blueprints Live</span>
          <div className="flex items-end space-x-2 mt-2">
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {packages.length}
            </span>
          </div>
          <p className="text-[10px] text-indigo-600 font-semibold mt-1">
            Starter, Pro, & Custom Cloud Tiers
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Active Surcharges</span>
          <div className="flex items-end space-x-2 mt-2">
            <span className="text-2xl font-black text-amber-600 tracking-tight">
              {pricingRules.filter(r => r.type === 'SURCHARGE' && r.isActive).length} active
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">
            Dynamic VAT & SLA Adjusters
          </p>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-full md:w-fit border border-slate-200">
        <button 
          onClick={() => setActiveTab('PACKAGES')}
          className={`px-5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${activeTab === 'PACKAGES' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
        >
          SaaS Package Blueprints
        </button>
        <button 
          onClick={() => setActiveTab('TENANT_SUBS')}
          className={`px-5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${activeTab === 'TENANT_SUBS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Tenant Subscription Seats
        </button>
        <button 
          onClick={() => setActiveTab('PRICING_RULES')}
          className={`px-5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${activeTab === 'PRICING_RULES' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Dynamic Rules Engine
        </button>
      </div>

      {/* Tab 1: SaaS Package Blueprints */}
      {activeTab === 'PACKAGES' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs">
              <h3 className="font-bold text-slate-800">Available Base Plans</h3>
              <p className="text-slate-500 mt-0.5">Define core SaaS limits, default price ratios, and legal feature flags.</p>
            </div>
            <button
              onClick={() => setShowAddPackage(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Launch New Plan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Package className="w-5 h-5" />
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded text-[10px] font-bold">
                      {pkg.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">{pkg.name}</h4>
                    <div className="flex items-baseline mt-2">
                      <span className="text-2xl font-black text-slate-800">€{pkg.price}</span>
                      <span className="text-xs text-slate-500 font-bold">/ {pkg.interval}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Plan SLA Features</span>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-100 p-4 flex gap-2">
                  <button 
                    onClick={() => {
                      if (window.confirm(`Deprecate package blueprint "${pkg.name}"?`)) {
                        setPackages(packages.map(p => p.id === pkg.id ? { ...p, status: 'Deprecated' } : p));
                        showToast(`Blueprint "${pkg.name}" marked as deprecated.`, 'info');
                      }
                    }}
                    className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-all cursor-pointer"
                  >
                    Deprecate
                  </button>
                  <button 
                    onClick={() => {
                      setNewPkgName(pkg.name);
                      setNewPkgPrice(pkg.price);
                      setNewPkgInterval(pkg.interval);
                      setNewPkgFeaturesList(pkg.features);
                      setShowAddPackage(true);
                    }}
                    className="py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition-all cursor-pointer"
                  >
                    Edit Draft
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Tenant Subscription Seats */}
      {activeTab === 'TENANT_SUBS' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Client Workspace</th>
                  <th className="py-3 px-4">Subscribed Plan</th>
                  <th className="py-3 px-4">Addons Active</th>
                  <th className="py-3 px-4">Auto-Renewal</th>
                  <th className="py-3 px-4">Final Cost (VAT incl.)</th>
                  <th className="py-3 px-4 text-right">Adjustment Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {subscriptions.map((sub) => {
                  const calculated = calculateFinalPrice(sub.baseAmount, sub.additionalAddons, sub.region);
                  const isAutoRenew = sub.autoRenew !== false;
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800">{sub.tenantName}</div>
                        <div className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">
                          Region: {sub.region} • ID: {sub.tenantId}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-700 block">{sub.packageName}</span>
                        <span className="text-[10px] text-slate-500 font-bold flex items-center mt-0.5">
                          <Calendar className="w-3 h-3 mr-1" /> Renewal: {sub.nextBillingDate}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {sub.additionalAddons.length === 0 ? (
                            <span className="text-slate-400 text-[11px] font-medium">None</span>
                          ) : (
                            sub.additionalAddons.map((addon, idx) => (
                              <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded text-[9px] uppercase">
                                {addon}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleAutoRenew(sub.id)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${isAutoRenew ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            title={isAutoRenew ? 'Auto-Renewal Enabled (Click to disable)' : 'Auto-Renewal Disabled (Click to enable)'}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isAutoRenew ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                          <span className={`text-[11px] font-bold ${isAutoRenew ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {isAutoRenew ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-black text-slate-800 text-sm">€{calculated}</div>
                        <div className="text-[10px] text-slate-400 font-mono">base: €{sub.baseAmount}/mo</div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setEditingSub(sub)}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[10px] cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Adjust Seat</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-[10px] text-slate-500 font-medium">
            Tenant licensing logs synchronized with 9Xen Regulettee dynamic billing dispatcher.
          </div>
        </div>
      )}

      {/* Tab 3: Dynamic Rules Engine */}
      {activeTab === 'PRICING_RULES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Rules List */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm">Active Adjusters & Tax Logic</h3>
              <p className="text-slate-500 text-xs mt-0.5">Enforce sovereign tax rules, strict CaaS regulatory uplifts, and high-volume billing discounts dynamically.</p>
            </div>

            <div className="space-y-3">
              {pricingRules.map((rule) => (
                <div key={rule.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-2xs">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-xs">{rule.name}</h4>
                      <span className={`px-2 py-0.2 rounded text-[8px] font-black uppercase ${
                        rule.type === 'SURCHARGE' ? 'bg-amber-100 text-amber-800' :
                        rule.type === 'DISCOUNT' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rule.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{rule.description}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-black text-slate-800 text-xs">
                      {rule.type === 'DISCOUNT' ? '-' : '+'}{rule.value}{rule.type === 'VAT_UPLIFT' || rule.type === 'DISCOUNT' ? '%' : '€'}
                    </span>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${rule.isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${rule.isActive ? 'translate-x-4.5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick billing diagnostic calculator */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-xl border border-slate-800 shadow-lg space-y-4 font-mono">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Zap className="w-4.5 h-4.5 text-indigo-400" />
              <span>Diagnostic Quote Simulator</span>
            </h3>

            <div className="space-y-3 text-[11px]">
              <div>
                <span className="text-slate-500 block">Base Subscription:</span>
                <div className="flex gap-1.5 mt-1">
                  <button className="px-2.5 py-1 bg-slate-800 rounded font-semibold text-white">Starter (€499)</button>
                  <button className="px-2.5 py-1 bg-indigo-600 rounded font-semibold text-white">Pro (€1299)</button>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-slate-500 block">Selected Surcharges:</span>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-slate-800 px-2 py-0.5 rounded font-bold">CaaS Compliance (+€250)</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded font-bold">Sovereign Cloud (+€500)</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-white">€2,049</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard VAT Uplift (19%):</span>
                  <span className="text-white">€389</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-black text-white text-xs">
                  <span>Calculated Invoiced Sum:</span>
                  <span className="text-indigo-400">€2,438 / mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Plan Modal */}
      <AnimatePresence>
        {showAddPackage && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-4 sm:p-5 lg:p-6 shadow-xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Package className="w-5 h-5 text-indigo-600" />
                  <span>Launch SaaS Package Plan</span>
                </h3>
                <button 
                  onClick={() => setShowAddPackage(false)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Package Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Pro Suite Plus"
                    value={newPkgName}
                    onChange={(e) => setNewPkgName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-indigo-600 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Base Price (€)</label>
                    <input 
                      type="number"
                      required
                      value={newPkgPrice}
                      onChange={(e) => setNewPkgPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-indigo-600 bg-slate-50 focus:bg-white font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Interval</label>
                    <select
                      value={newPkgInterval}
                      onChange={(e) => setNewPkgInterval(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-medium"
                    >
                      <option value="month">Monthly</option>
                      <option value="year">Annually</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700">Plan Features</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. 5 Workspaces Included"
                      value={newPkgFeature}
                      onChange={(e) => setNewPkgFeature(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-indigo-600 bg-slate-50 focus:bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {newPkgFeaturesList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {newPkgFeaturesList.map((feat, idx) => (
                        <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                          <span>{feat}</span>
                          <button 
                            type="button"
                            onClick={() => setNewPkgFeaturesList(newPkgFeaturesList.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer text-[10px]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 flex gap-2 justify-end">
                  <button 
                    type="button"
                    onClick={() => setShowAddPackage(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Publish Blueprint
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Adjust Subscription Modal */}
      <AnimatePresence>
        {editingSub && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-4 sm:p-5 lg:p-6 shadow-xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  <span>Adjust Tenant License Seats</span>
                </h3>
                <button 
                  onClick={() => setEditingSub(null)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleUpdateSubscription} className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Workspace</span>
                  <span className="text-slate-800 font-black text-sm block mt-0.5">{editingSub.tenantName}</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assign Subscription Package</label>
                  <select
                    value={editingSub.packageName}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const matchedPrice = packages.find(p => p.name === selectedName)?.price || 499;
                      setEditingSub({
                        ...editingSub,
                        packageName: selectedName,
                        baseAmount: matchedPrice
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-medium"
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.name}>{p.name} (€{p.price})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700">Add-ons Premium Included</label>
                  <div className="space-y-1.5">
                    {[
                      { key: 'CaaS Addon', label: 'CaaS Compliance Addon Surcharge (+€250)' },
                      { key: 'Sovereign Enclave', label: 'Isolated Sovereign Cloud Database Enclave (+€500)' }
                    ].map((addon) => {
                      const active = editingSub.additionalAddons.includes(addon.key);
                      return (
                        <label key={addon.key} className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-50 hover:bg-slate-100 transition-all font-medium">
                          <input 
                            type="checkbox"
                            checked={active}
                            onChange={() => {
                              const newList = active 
                                ? editingSub.additionalAddons.filter(a => a !== addon.key)
                                : [...editingSub.additionalAddons, addon.key];
                              setEditingSub({
                                ...editingSub,
                                additionalAddons: newList
                              });
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          <span>{addon.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-bold text-slate-700 block">Auto-Renewal Charge</label>
                    <span className="text-[10px] text-slate-500">Enable recurring invoice generation on renewal date</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingSub({ ...editingSub, autoRenew: editingSub.autoRenew !== false ? false : true })}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${editingSub.autoRenew !== false ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${editingSub.autoRenew !== false ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Subscription Status</label>
                  <select
                    value={editingSub.status}
                    onChange={(e) => setEditingSub({ ...editingSub, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Past Due">Past Due</option>
                    <option value="Trial">Trial</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2 justify-end">
                  <button 
                    type="button"
                    onClick={() => setEditingSub(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Persist Custom Pricing
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
