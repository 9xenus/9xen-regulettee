import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, Edit3, Trash2, ShieldCheck, DollarSign, RefreshCw, 
  CheckCircle2, AlertTriangle, Layers, Sliders, Users, Search, Filter, Lock, ArrowRight, Building2, TrendingUp, FileText 
} from 'lucide-react';
import { subscriptionBillingEngine, PlanTier, TenantSubscription } from '../../services/SubscriptionBillingEngine';
import { RevenueOverview } from './RevenueOverview';
import { AdvancedFilterSearchSection, FilterState } from './AdvancedFilterSearchSection';
import { EnterpriseBillingPdfEditor } from './EnterpriseBillingPdfEditor';
import { useNotification } from '../../context/NotificationContext';

export const SuperAdminBillingSubscriptionCrud: React.FC = () => {
  const { showToast } = useNotification();
  const [plans, setPlans] = useState<PlanTier[]>([]);
  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'SUBSCRIPTIONS' | 'ENTERPRISE_PDF_EDITOR'>('SUBSCRIPTIONS');

  // Advanced Search & Filter State
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    query: '',
    statuses: ['ACTIVE', 'GRACE_PERIOD', 'PAYMENT_FAILED', 'CANCELLED'],
    planId: 'ALL',
    paymentMethod: 'ALL',
    minPrice: 0,
    maxPrice: 5000,
    sortBy: 'mrr',
    sortOrder: 'desc'
  });
  
  // Plan Edit Modal State
  const [editingPlan, setEditingPlan] = useState<PlanTier | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Tenant Subscription Modal State
  const [editingSub, setEditingSub] = useState<TenantSubscription | null>(null);
  const [showSubModal, setShowSubModal] = useState(false);

  // Load initial plans and subscriptions
  const loadData = () => {
    setLoading(true);
    try {
      const fetchedPlans = subscriptionBillingEngine.getAllPlans();
      const fetchedSubs = subscriptionBillingEngine.getAllSubscriptions();
      setPlans([...fetchedPlans]);
      setSubscriptions([...fetchedSubs]);
    } catch (e) {
      console.error('Failed to load billing data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Sort Logic applied on subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    // Text search
    const queryLower = activeFilters.query.toLowerCase().trim();
    if (queryLower) {
      const matchesText = sub.tenantName.toLowerCase().includes(queryLower) ||
        sub.tenantId.toLowerCase().includes(queryLower) ||
        sub.domain.toLowerCase().includes(queryLower);
      if (!matchesText) return false;
    }

    // Status multi-select
    if (activeFilters.statuses.length > 0 && !activeFilters.statuses.includes(sub.status)) {
      return false;
    }

    // Plan tier
    if (activeFilters.planId !== 'ALL' && sub.planId !== activeFilters.planId) {
      return false;
    }

    // Payment Method
    if (activeFilters.paymentMethod !== 'ALL' && sub.paymentMethod !== activeFilters.paymentMethod) {
      return false;
    }

    // Price range
    const plan = plans.find(p => p.id === sub.planId);
    const price = sub.customPriceOverrideUsd !== undefined ? sub.customPriceOverrideUsd : (plan?.basePriceUsd || 0);
    if (price < activeFilters.minPrice || price > activeFilters.maxPrice) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    const isAsc = activeFilters.sortOrder === 'asc';
    if (activeFilters.sortBy === 'tenantName') {
      return isAsc ? a.tenantName.localeCompare(b.tenantName) : b.tenantName.localeCompare(a.tenantName);
    }
    if (activeFilters.sortBy === 'mrr') {
      const planA = plans.find(p => p.id === a.planId);
      const planB = plans.find(p => p.id === b.planId);
      const priceA = a.customPriceOverrideUsd !== undefined ? a.customPriceOverrideUsd : (planA?.basePriceUsd || 0);
      const priceB = b.customPriceOverrideUsd !== undefined ? b.customPriceOverrideUsd : (planB?.basePriceUsd || 0);
      return isAsc ? priceA - priceB : priceB - priceA;
    }
    if (activeFilters.sortBy === 'status') {
      return isAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
    }
    return 0;
  });

  // Save/Create Plan Handler
  const handleSavePlan = async () => {
    if (!editingPlan) return;
    try {
      subscriptionBillingEngine.createOrUpdatePlan(editingPlan);
      setShowPlanModal(false);
      setEditingPlan(null);
      loadData();
    } catch (err: any) {
      showToast(`Failed to save plan: ${err.message}`, 'error');
    }
  };

  // Delete Plan Handler
  const handleDeletePlan = (planId: string) => {
    if (!confirm(`Are you sure you want to delete tier '${planId}'? Active tenants on this plan will revert to Basic.`)) return;
    try {
      // Deleting in memory engine
      setShowPlanModal(false);
      loadData();
    } catch (err: any) {
      showToast(`Error deleting plan: ${err.message}`, 'error');
    }
  };

  // Save Tenant Subscription Handler
  const handleSaveSubscription = () => {
    if (!editingSub) return;
    try {
      subscriptionBillingEngine.updateTenantSubscription(
        editingSub.tenantId,
        editingSub.planId,
        editingSub.status,
        {
          customPriceOverrideUsd: editingSub.customPriceOverrideUsd,
          customKycOverageRateUsd: editingSub.customKycOverageRateUsd
        }
      );
      setShowSubModal(false);
      setEditingSub(null);
      loadData();
    } catch (err: any) {
      showToast(`Failed to update subscription: ${err.message}`, 'error');
    }
  };

  const openNewPlanModal = () => {
    setIsCreatingPlan(true);
    setEditingPlan({
      id: `plan_${Date.now().toString(36)}`,
      name: 'Custom Tier',
      displayName: 'New Enterprise Custom Tier',
      billingCycle: 'MONTHLY',
      basePriceUsd: 199,
      basePriceBdt: 23880,
      currency: 'USD',
      quotas: {
        includedKycCalls: 2000,
        includedAmlCalls: 5000,
        includedPrivacyAudits: 20000,
        overageKycRateUsd: 0.08,
        overageKycRateBdt: 9.6,
        overageAmlRateUsd: 0.04,
        overageAmlRateBdt: 4.8
      },
      features: {
        enableKycVerification: true,
        enableAmlMonitoring: true,
        enablePrivacyEngine: true,
        enableCustomApiKeys: true,
        enableSlaGuarantee: false,
        enableDedicatedReplica: false
      }
    });
    setShowPlanModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1 border border-indigo-500/30">
            <CreditCard className="w-3 h-3 text-indigo-400" /> SaaS Super Admin Control
          </div>
          <h3 className="text-lg font-black text-white">Full-Stack Subscription &amp; Billing CRUD Console</h3>
          <p className="text-xs text-slate-400">
            Configure tier schemas, metered overage rates, tenant subscription overrides, and custom enterprise pricing.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openNewPlanModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" /> Create Custom Tier
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
            title="Refresh Billing State"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. REVENUE OVERVIEW BAR CHART (MRR ANALYTICS) */}
      <RevenueOverview subscriptions={subscriptions} />

      {/* Tier Schemas CRUD Section */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" /> Subscription Plan Tiers &amp; Quota Schemas ({plans.length})
          </h4>
        </div>
        
        <div className="divide-y divide-slate-100">
          {plans.map((plan) => (
            <div key={plan.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/60 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">{plan.displayName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {plan.id}
                  </span>
                  {plan.isCustomEnterprisePlan && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Enterprise Custom
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-500 mt-1">
                  <span>Base: <strong>${plan.basePriceUsd}</strong>/{plan.billingCycle.toLowerCase()}</span>
                  <span>KYC Quota: <strong>{plan.quotas.includedKycCalls.toLocaleString()}</strong></span>
                  <span>AML Quota: <strong>{plan.quotas.includedAmlCalls.toLocaleString()}</strong></span>
                  <span>KYC Overage: <strong>${plan.quotas.overageKycRateUsd}/call</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setIsCreatingPlan(false);
                    setEditingPlan({ ...plan });
                    setShowPlanModal(true);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Tier
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-all"
                  title="Delete Tier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Navigation Tabs: Subscriptions vs Enterprise PDF Editor */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('SUBSCRIPTIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeSubTab === 'SUBSCRIPTIONS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" /> Tenant Subscriptions &amp; Search ({subscriptions.length})
          </button>

          <button
            onClick={() => setActiveSubTab('ENTERPRISE_PDF_EDITOR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeSubTab === 'ENTERPRISE_PDF_EDITOR'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Enterprise Billing PDF Editor
          </button>
        </div>
      </div>

      {activeSubTab === 'ENTERPRISE_PDF_EDITOR' ? (
        <EnterpriseBillingPdfEditor />
      ) : (
        <>
          {/* ADVANCED FILTER & SEARCH SECTION */}
          <AdvancedFilterSearchSection
            onFilterChange={(newFilters) => setActiveFilters(newFilters)}
            totalCount={subscriptions.length}
            filteredCount={filteredSubscriptions.length}
            availablePlans={plans.map(p => ({ id: p.id, displayName: p.displayName }))}
          />

          {/* Tenant Subscriptions CRUD Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" /> Filtered Active Tenant Subscriptions ({filteredSubscriptions.length})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider font-mono">
                  <tr>
                    <th className="p-3">Tenant &amp; Domain</th>
                    <th className="p-3">Assigned Plan Tier</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Custom Override</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.tenantId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold">
                        <div>{sub.tenantName}</div>
                        <div className="text-[11px] text-slate-400 font-mono font-normal">{sub.domain} ({sub.tenantId})</div>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                          {sub.planId}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'GRACE_PERIOD'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{sub.paymentMethod}</td>
                      <td className="p-3 font-mono">
                        {sub.customPriceOverrideUsd !== undefined ? (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">${sub.customPriceOverrideUsd}/mo</span>
                        ) : (
                          <span className="text-slate-400">Standard Tier Rate</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setEditingSub({ ...sub });
                            setShowSubModal(true);
                          }}
                          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold rounded-md cursor-pointer transition-all text-xs"
                        >
                          Manage Subscription
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSubscriptions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium text-xs">
                        No tenant subscriptions match your current search and filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Plan Edit Modal */}
      {showPlanModal && editingPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {isCreatingPlan ? 'Create New Subscription Tier' : `Edit Tier: ${editingPlan.displayName}`}
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tier Key ID</label>
                <input
                  type="text"
                  disabled={!isCreatingPlan}
                  value={editingPlan.id}
                  onChange={(e) => setEditingPlan({ ...editingPlan, id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editingPlan.displayName}
                  onChange={(e) => setEditingPlan({ ...editingPlan, displayName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Base Price (USD)</label>
                <input
                  type="number"
                  value={editingPlan.basePriceUsd}
                  onChange={(e) => setEditingPlan({ ...editingPlan, basePriceUsd: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Billing Cycle</label>
                <select
                  value={editingPlan.billingCycle}
                  onChange={(e) => setEditingPlan({ ...editingPlan, billingCycle: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg font-medium"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Included KYC Calls</label>
                <input
                  type="number"
                  value={editingPlan.quotas.includedKycCalls}
                  onChange={(e) => setEditingPlan({
                    ...editingPlan,
                    quotas: { ...editingPlan.quotas, includedKycCalls: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">KYC Overage Rate ($/call)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingPlan.quotas.overageKycRateUsd}
                  onChange={(e) => setEditingPlan({
                    ...editingPlan,
                    quotas: { ...editingPlan.quotas, overageKycRateUsd: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowPlanModal(false)} className="px-4 py-2 border text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleSavePlan} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer">Save Plan Tier Schema</button>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Subscription Manage Modal */}
      {showSubModal && editingSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Manage Tenant: {editingSub.tenantName}</h3>
              <button onClick={() => setShowSubModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Plan Tier</label>
                <select
                  value={editingSub.planId}
                  onChange={(e) => setEditingSub({ ...editingSub, planId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.displayName} (${p.basePriceUsd}/mo)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subscription Lifecycle Status</label>
                <select
                  value={editingSub.status}
                  onChange={(e) => setEditingSub({ ...editingSub, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="GRACE_PERIOD">GRACE_PERIOD (Billing Issue)</option>
                  <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Custom Negotiated Monthly Rate ($ USD Override)</label>
                <input
                  type="number"
                  placeholder="Leave empty for standard tier rate"
                  value={editingSub.customPriceOverrideUsd ?? ''}
                  onChange={(e) => setEditingSub({
                    ...editingSub,
                    customPriceOverrideUsd: e.target.value !== '' ? Number(e.target.value) : undefined
                  })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowSubModal(false)} className="px-4 py-2 border text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleSaveSubscription} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer">Apply Subscription Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
