import React, { useState, useEffect } from 'react';
import { 
  CreditCard, X, CheckCircle2, ArrowRight, RefreshCw, AlertCircle, 
  Layers, ShieldCheck, Zap, DollarSign, Calendar, UserCheck, Loader2
} from 'lucide-react';
import { TenantAccount } from '../../pages/AdminTenants';
import { useNotification } from '../../context/NotificationContext';
import { fetchWithRetry } from '../../lib/api-client';

interface TenantSubscriptionModalProps {
  tenant: TenantAccount;
  allTenants: TenantAccount[];
  onClose: () => void;
  onUpdated: (updatedTier: string) => void;
}

const AVAILABLE_TIERS = [
  {
    id: 'Community Standard',
    name: 'Community Standard',
    priceEur: 0,
    cycle: 'ANNUAL',
    description: 'Basic single-country GDPR compliance telemetry & checklist tools',
    features: ['1 Sovereign Enclave', 'Standard GDPR Framework', '1,000 API RPM', 'Email Support']
  },
  {
    id: 'Pro RegTech Compliance',
    name: 'Pro RegTech Compliance',
    priceEur: 9500,
    cycle: 'ANNUAL',
    description: 'Full multi-framework automation for growing digital companies',
    features: ['5 Sovereign Cloud Enclaves', 'GDPR + NIS2 + AI Act Ready', '5,000 API RPM', 'Dedicated Vault Shard']
  },
  {
    id: 'Enterprise Sovereign',
    name: 'Enterprise Sovereign Multi-Cloud',
    priceEur: 35000,
    cycle: 'ANNUAL',
    description: 'Dedicated sovereign database shards, Kyber-1024 PQC engine, and DORA audit readiness',
    features: ['Unlimited Cloud Enclaves', 'Full 8 RegTech Frameworks', '50,000 API RPM', 'Kyber-1024 HSM Encryption', '24/7 DPO Concierge']
  },
  {
    id: 'Air-Gapped Sovereign Vault',
    name: 'Air-Gapped Sovereign Vault',
    priceEur: 75000,
    cycle: 'ANNUAL',
    description: 'On-premise / Sovereign Isolated Enclave for Critical National Infrastructure and Defense GovTech',
    features: ['Air-gapped Hardware HSM Node', 'Zero-Egress Data Isolation', 'B2G Live Inspector Streaming', 'Custom SLA 99.999%']
  },
  {
    id: 'Regulator Authority',
    name: 'Regulator Authority Custom',
    priceEur: 0,
    cycle: 'ANNUAL',
    description: 'Statutory supervisory license for Data Protection Authorities and EU AI Office',
    features: ['Direct Enforcement Hub', 'Cross-Tenant Audit Stream', 'Statutory Notice Dispatch', 'Zero-Fee Sovereign License']
  }
];

export const TenantSubscriptionModal: React.FC<TenantSubscriptionModalProps> = ({
  tenant,
  allTenants,
  onClose,
  onUpdated
}) => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'TRANSFER'>('DETAILS');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  // Form state for plan assignment
  const [selectedTier, setSelectedTier] = useState(tenant.tier || 'Enterprise Sovereign');
  const [billingCycle, setBillingCycle] = useState('ANNUAL');
  const [priceAmount, setPriceAmount] = useState<number>(35000);
  const [currency, setCurrency] = useState('EUR');
  const [subStatus, setSubStatus] = useState('ACTIVE');
  const [autoRenew, setAutoRenew] = useState(true);

  // Transfer state
  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [tenant.id]);

  const fetchSubscription = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithRetry(`/api/v1/tenants/${tenant.id}/subscription`);
      const data = await res.json();
      if (data.success && data.subscription) {
        setSubscription(data.subscription);
        setSelectedTier(data.subscription.tier || tenant.tier);
        setBillingCycle(data.subscription.billing_cycle || 'ANNUAL');
        setPriceAmount(data.subscription.price_amount !== undefined ? data.subscription.price_amount : 35000);
        setCurrency(data.subscription.currency || 'EUR');
        setSubStatus(data.subscription.status || 'ACTIVE');
        setAutoRenew(data.subscription.auto_renew === 1 || data.subscription.auto_renew === true);
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
    const tierMeta = AVAILABLE_TIERS.find(t => t.id === tierId);
    if (tierMeta) {
      setPriceAmount(tierMeta.priceEur);
    }
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetchWithRetry(`/api/v1/tenants/${tenant.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          billing_cycle: billingCycle,
          price_amount: Number(priceAmount),
          currency,
          status: subStatus,
          auto_renew: autoRenew,
          assigned_by: 'SaaS Super Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubscription(data.subscription);
        onUpdated(selectedTier);
        showToast(`Subscription updated to "${selectedTier}" for ${tenant.name}`, 'success');
      } else {
        showToast(data.error || 'Failed to update subscription', 'error');
      }
    } catch (err) {
      showToast('Error saving subscription plan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetId) {
      showToast('Please select a target account to transfer the subscription.', 'error');
      return;
    }

    const targetAccount = allTenants.find(t => t.id === transferTargetId);
    const confirmed = window.confirm(
      `Confirm transfer of ${selectedTier} plan from "${tenant.name}" to "${targetAccount?.name || transferTargetId}"?`
    );
    if (!confirmed) return;

    setIsTransferring(true);
    try {
      const res = await fetchWithRetry('/api/v1/tenants/subscription-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_tenant_id: tenant.id,
          to_tenant_id: transferTargetId,
          tier: selectedTier,
          reason: transferReason || 'SaaS Admin Re-allocation',
          transferred_by: 'SaaS Super Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Subscription transferred successfully!', 'success');
        onUpdated('Community Standard');
        fetchSubscription();
        setActiveTab('DETAILS');
      } else {
        showToast(data.error || 'Transfer failed.', 'error');
      }
    } catch (err) {
      showToast('Error transferring subscription.', 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-100 text-cyan-800 rounded-2xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">SaaS Subscription &amp; Tier Management</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-800">
                  {tenant.tier}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Tenant: <strong className="text-slate-800">{tenant.name}</strong> ({tenant.id})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-4 sm:px-6 bg-slate-50/80 text-xs font-bold">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'DETAILS'
                ? 'border-cyan-600 text-cyan-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tier Allocation &amp; Pricing</span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSFER')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'TRANSFER'
                ? 'border-cyan-600 text-cyan-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ArrowRight className="w-4 h-4 text-indigo-600" />
            <span>Subscription Transfer Console</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 lg:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-cyan-600 animate-spin" />
              <p className="text-xs font-mono text-slate-500">Loading subscription records from database...</p>
            </div>
          ) : activeTab === 'DETAILS' ? (
            <form onSubmit={handleSaveSubscription} className="space-y-4 sm:space-y-6">
              
              {/* Current Active Summary Card */}
              {subscription && (
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-1">
                      Active Entitled License
                    </span>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <span>{subscription.tier}</span>
                      <span className={`px-2 py-0.5 text-[10px] rounded-full uppercase font-mono font-bold ${
                        subscription.status === 'ACTIVE' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/30 text-amber-300'
                      }`}>
                        {subscription.status}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Assigned by: {subscription.assigned_by} • Auto-Renew: {subscription.auto_renew ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-white font-mono">
                      €{(subscription.price_amount || 0).toLocaleString()}
                      <span className="text-xs font-normal text-slate-400">/{subscription.billing_cycle?.toLowerCase()}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Period: {subscription.current_period_start || '2026-01-01'} to {subscription.current_period_end || '2027-01-01'}
                    </div>
                  </div>
                </div>
              )}

              {/* Choose / Assign New Tier */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block mb-3">
                  Assign SaaS Tier
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AVAILABLE_TIERS.map((tier) => {
                    const isSelected = selectedTier === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => handleTierSelect(tier.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-cyan-600 bg-cyan-50/40 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900">{tier.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tier.description}</p>
                          </div>
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-sm font-black text-slate-900 font-mono">
                            {tier.priceEur === 0 ? 'Custom / Statutory' : `€${tier.priceEur.toLocaleString()}/yr`}
                          </span>
                          <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100/60 px-2 py-0.5 rounded-md">
                            {tier.features[0]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Billing Parameters */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Billing Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUAL">Annual</option>
                    <option value="MULTI_YEAR_3YR">3-Year Sovereign Contract</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Contract Price Amount ({currency})
                  </label>
                  <input
                    type="number"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Subscription Status
                  </label>
                  <select
                    value={subStatus}
                    onChange={(e) => setSubStatus(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAST_DUE">PAST DUE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRenewCheck"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="autoRenewCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Auto-renew subscription at end of billing cycle (Generates automated compliance entitlement tokens)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSaving ? 'Updating Subscription...' : 'Save & Assign Subscription'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleExecuteTransfer} className="space-y-4 sm:space-y-6">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 space-y-1">
                <h4 className="font-extrabold flex items-center gap-1.5 text-indigo-950">
                  <ArrowRight className="w-4 h-4" /> Subscription License Transfer
                </h4>
                <p className="leading-relaxed">
                  Transferring this subscription will immediately reassign the <strong>{selectedTier}</strong> license, high-throughput RPM quotas, and sovereign vault allocations to the recipient organization.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Source Account (Relinquishing Subscription)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${tenant.name} (${tenant.id}) - Current Tier: ${tenant.tier}`}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Target Recipient Account
                  </label>
                  <select
                    value={transferTargetId}
                    onChange={(e) => setTransferTargetId(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose Target Organization --</option>
                    {allTenants.filter(t => t.id !== tenant.id).map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.id} • {t.country} • Current: {t.tier})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Transfer Justification / Reason (Audit Logged)
                  </label>
                  <textarea
                    rows={3}
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    placeholder="E.g., Corporate acquisition consolidation, regional license reallocation, or upgrade migration."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('DETAILS')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isTransferring || !transferTargetId}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isTransferring && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isTransferring ? 'Executing Transfer...' : 'Confirm Subscription Transfer'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
