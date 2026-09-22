import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, SlidersHorizontal, RefreshCw, X, Check, ArrowUpDown, DollarSign, Building2, ShieldCheck, Tag
} from 'lucide-react';
import { TenantSubscription } from '../../services/SubscriptionBillingEngine';

export interface FilterState {
  query: string;
  statuses: string[];
  planId: string;
  paymentMethod: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'tenantName' | 'mrr' | 'status';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFilterSearchProps {
  onFilterChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
  availablePlans?: { id: string; displayName: string }[];
}

export const AdvancedFilterSearchSection: React.FC<AdvancedFilterSearchProps> = ({
  onFilterChange,
  totalCount,
  filteredCount,
  availablePlans = [
    { id: 'plan_basic', displayName: 'Basic Starter Tier' },
    { id: 'plan_pro', displayName: 'Pro Growth Tier' },
    { id: 'plan_enterprise', displayName: 'Enterprise Sovereign Tier' }
  ]
}) => {
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    statuses: ['ACTIVE', 'GRACE_PERIOD', 'PAYMENT_FAILED', 'CANCELLED'],
    planId: 'ALL',
    paymentMethod: 'ALL',
    minPrice: 0,
    maxPrice: 5000,
    sortBy: 'mrr',
    sortOrder: 'desc'
  });

  const [showAdvancedDrawer, setShowAdvancedDrawer] = useState(false);

  // Notify parent on filter change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleStatusToggle = (status: string) => {
    const current = filters.statuses;
    if (current.includes(status)) {
      if (current.length === 1) return; // keep at least 1
      setFilters({ ...filters, statuses: current.filter(s => s !== status) });
    } else {
      setFilters({ ...filters, statuses: [...current, status] });
    }
  };

  const handleReset = () => {
    setFilters({
      query: '',
      statuses: ['ACTIVE', 'GRACE_PERIOD', 'PAYMENT_FAILED', 'CANCELLED'],
      planId: 'ALL',
      paymentMethod: 'ALL',
      minPrice: 0,
      maxPrice: 5000,
      sortBy: 'mrr',
      sortOrder: 'desc'
    });
  };

  // Preset Filters
  const applyPreset = (preset: 'HIGH_VALUE' | 'AT_RISK' | 'ENTERPRISE') => {
    if (preset === 'HIGH_VALUE') {
      setFilters({
        ...filters,
        minPrice: 500,
        sortBy: 'mrr',
        sortOrder: 'desc'
      });
    } else if (preset === 'AT_RISK') {
      setFilters({
        ...filters,
        statuses: ['GRACE_PERIOD', 'PAYMENT_FAILED'],
        sortBy: 'status',
        sortOrder: 'asc'
      });
    } else if (preset === 'ENTERPRISE') {
      setFilters({
        ...filters,
        planId: 'plan_enterprise',
        sortBy: 'mrr',
        sortOrder: 'desc'
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Search Input & Toggle Drawer Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Advanced Search by Tenant Name, ID, Domain..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {filters.query && (
            <button
              onClick={() => setFilters({ ...filters, query: '' })}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvancedDrawer(!showAdvancedDrawer)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border ${
              showAdvancedDrawer
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Advanced Filters</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">Presets:</span>
          <button
            onClick={() => applyPreset('ENTERPRISE')}
            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg border border-indigo-200 dark:border-indigo-800/60 cursor-pointer"
          >
            Enterprise Tiers
          </button>
          <button
            onClick={() => applyPreset('HIGH_VALUE')}
            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg border border-emerald-200 dark:border-emerald-800/60 cursor-pointer"
          >
            High MRR (&gt;$500)
          </button>
          <button
            onClick={() => applyPreset('AT_RISK')}
            className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold rounded-lg border border-amber-200 dark:border-amber-800/60 cursor-pointer"
          >
            At-Risk / Grace Period
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Showing <strong className="text-slate-900 dark:text-white">{filteredCount}</strong> of {totalCount} Records
        </div>
      </div>

      {/* Expandable Advanced Controls Drawer */}
      {showAdvancedDrawer && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
          {/* Status Multi-Select Checkboxes */}
          <div>
            <label className="block text-slate-500 mb-1.5 uppercase text-[10px]">Lifecycle Status</label>
            <div className="space-y-1.5">
              {['ACTIVE', 'GRACE_PERIOD', 'PAYMENT_FAILED', 'CANCELLED'].map((st) => {
                const checked = filters.statuses.includes(st);
                return (
                  <label key={st} className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleStatusToggle(st)}
                      className="accent-indigo-600 rounded"
                    />
                    <span>{st}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Plan Tier Selector */}
          <div>
            <label className="block text-slate-500 mb-1.5 uppercase text-[10px]">Assigned Plan Tier</label>
            <select
              value={filters.planId}
              onChange={(e) => setFilters({ ...filters, planId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="ALL">All Tiers</option>
              {availablePlans.map((p) => (
                <option key={p.id} value={p.id}>{p.displayName}</option>
              ))}
            </select>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-slate-500 mb-1.5 uppercase text-[10px]">Payment Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="INVOICE_NET30">Corporate Net 30 Invoice</option>
              <option value="STRIPE_CREDIT_CARD">Stripe Credit Card</option>
              <option value="BKASH_MERCHANT">bKash Merchant</option>
            </select>
          </div>

          {/* Sort By & Order */}
          <div>
            <label className="block text-slate-500 mb-1.5 uppercase text-[10px]">Sorting Order</label>
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="mrr">Sort by Highest MRR</option>
                <option value="tenantName">Sort by Tenant Name</option>
                <option value="status">Sort by Status</option>
              </select>

              <button
                onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-mono"
              >
                {filters.sortOrder.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
