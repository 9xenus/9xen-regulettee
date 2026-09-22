import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, Search, Plus, LogIn, ShieldCheck, X, AlertTriangle, ArrowRight, 
  Activity, CheckCircle2, Settings, Loader2, Globe, Server, Database, Key, Cpu, 
  Filter, RefreshCw, GitMerge, Trash2, PauseCircle, PlayCircle, Layers, ShieldAlert, 
  Download, Sliders, HardDrive, Lock, Shield, User, Mail, Calendar, Hash, FileText,
  CreditCard, Scale, History, Sparkles, Award
} from 'lucide-react';
import { MultiSelectActionBar } from '../components/MultiSelectActionBar';
import { useNotification } from '../context/NotificationContext';
import { fetchWithRetry } from '../lib/api-client';
import { TenantSubscriptionModal } from '../components/admin/TenantSubscriptionModal';
import { TenantComplianceProfileModal } from '../components/admin/TenantComplianceProfileModal';
import { TenantRegulatorConfigModal } from '../components/admin/TenantRegulatorConfigModal';
import { SubscriptionTransferHistoryModal } from '../components/admin/SubscriptionTransferHistoryModal';

export interface DigitalAsset {
  id: string;
  name: string;
  type: 'SERVER' | 'CLOUD_ENCLAVE' | 'DATABASE' | 'API_ENDPOINT' | 'SSL_CERT' | 'QUANTUM_KEY' | 'STORAGE_VAULT';
  provider: 'AWS' | 'GCP' | 'AZURE' | 'HETZNER' | 'SOVEREIGN_PRIVATE';
  region: string;
  host: string;
  status: 'HEALTHY' | 'DEGRADED' | 'MAINTENANCE' | 'OFFLINE';
  specs?: string;
}

export interface EnterpriseConfig {
  rateLimitRpm?: number;
  dailyQuotaMb?: number;
  dedicatedDbUrl?: string;
  enclaveIsolation?: 'SHARED_MULTI_TENANT' | 'DEDICATED_VPC' | 'AIR_GAPPED_VAULT';
  customDomain?: string;
  ssoProvider?: 'OIDC_OKTA' | 'SAML_AZURE_AD' | 'OIDC_GOOGLE' | 'NONE';
  isRegulator?: boolean;
}

export interface TenantAccount {
  id: string;
  name: string;
  account_type: 'REGULAR_ORGANIZATION' | 'ENTERPRISE_CLIENT' | 'REGULATOR_AUTHORITY';
  region: string;
  country: string;
  business_sector: string;
  registration_date: string;
  tax_id: string;
  owner_email: string;
  dpo_name: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE' | 'OFFLINE';
  tier: string;
  phase: string;
  activeModules: string[];
  digital_assets: DigitalAsset[];
  enterprise_config: EnterpriseConfig;
}

export const AdminTenants: React.FC<{ onSwitchRole?: (role: string, tenantId?: string) => void; onNavigate?: (path: string) => void }> = ({ onSwitchRole, onNavigate }) => {
  const { showToast } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [tenants, setTenants] = useState<TenantAccount[]>([]);
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);

  // Search & Filter States
  const [searchText, setSearchText] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedAccountType, setSelectedAccountType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [registeredFrom, setRegisteredFrom] = useState('');
  const [registeredTo, setRegisteredTo] = useState('');

  // Modals Control
  const [showNewModal, setShowNewModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [assetsModalTenant, setAssetsModalTenant] = useState<TenantAccount | null>(null);
  const [configModalTenant, setConfigModalTenant] = useState<TenantAccount | null>(null);
  const [subscriptionModalTenant, setSubscriptionModalTenant] = useState<TenantAccount | null>(null);
  const [complianceModalTenant, setComplianceModalTenant] = useState<TenantAccount | null>(null);
  const [regulatorModalTenant, setRegulatorModalTenant] = useState<TenantAccount | null>(null);
  const [showTransferLedgerModal, setShowTransferLedgerModal] = useState(false);
  const [deleteConfirmTenant, setDeleteConfirmTenant] = useState<TenantAccount | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  // Fetch Accounts with filters
  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchText) queryParams.append('search', searchText);
      if (selectedRegion !== 'ALL') queryParams.append('region', selectedRegion);
      if (selectedCountry !== 'ALL') queryParams.append('country', selectedCountry);
      if (selectedSector !== 'ALL') queryParams.append('businessSector', selectedSector);
      if (selectedAccountType !== 'ALL') queryParams.append('accountType', selectedAccountType);
      if (selectedStatus !== 'ALL') queryParams.append('status', selectedStatus);
      if (registeredFrom) queryParams.append('startDate', registeredFrom);
      if (registeredTo) queryParams.append('endDate', registeredTo);

      const res = await fetchWithRetry(`/api/v1/tenants?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTenants(data.tenants || []);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      showToast('Failed to load accounts from sovereign database.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [selectedRegion, selectedCountry, selectedSector, selectedAccountType, selectedStatus, registeredFrom, registeredTo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTenants();
  };

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedRegion('ALL');
    setSelectedCountry('ALL');
    setSelectedSector('ALL');
    setSelectedAccountType('ALL');
    setSelectedStatus('ALL');
    setRegisteredFrom('');
    setRegisteredTo('');
  };

  // Toggle Account Suspend / Unsuspend
  const toggleAccountStatus = async (tenant: TenantAccount) => {
    const newStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetchWithRetry(`/api/v1/tenants/${tenant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t));
        showToast(`Account ${tenant.name} status set to ${newStatus}.`, 'info');
      }
    } catch (error) {
      showToast('Failed to update account status.', 'error');
    }
  };

  // Delete Account
  const handleExecuteDelete = async () => {
    if (!deleteConfirmTenant) return;
    if (deleteConfirmInput !== `DELETE ${deleteConfirmTenant.name}`) {
      showToast(`Please type "DELETE ${deleteConfirmTenant.name}" to confirm deletion.`, 'error');
      return;
    }

    try {
      const res = await fetchWithRetry(`/api/v1/tenants/${deleteConfirmTenant.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTenants(prev => prev.filter(t => t.id !== deleteConfirmTenant.id));
        setDeleteConfirmTenant(null);
        setDeleteConfirmInput('');
        showToast(`Account ${deleteConfirmTenant.name} deleted permanently.`, 'success');
      }
    } catch (error) {
      showToast('Failed to delete account.', 'error');
    }
  };

  // Multi-select helpers
  const handleToggleSelectAll = () => {
    if (selectedTenantIds.length === tenants.length) {
      setSelectedTenantIds([]);
    } else {
      setSelectedTenantIds(tenants.map(t => t.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedTenantIds(prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently remove ${selectedTenantIds.length} accounts?`)) {
      try {
        const res = await fetchWithRetry('/api/v1/tenants/batch-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedTenantIds })
        });
        const data = await res.json();
        if (data.success) {
          setTenants(prev => prev.filter(t => !selectedTenantIds.includes(t.id)));
          setSelectedTenantIds([]);
          showToast(`${selectedTenantIds.length} accounts permanently deleted.`, 'success');
        }
      } catch (error) {
        showToast('Batch delete failed.', 'error');
      }
    }
  };

  const handleBatchUpdateStatus = async (status: string) => {
    if (!status) return;
    try {
      const res = await fetchWithRetry('/api/v1/tenants/batch-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedTenantIds, status })
      });
      const data = await res.json();
      if (data.success) {
        setTenants(prev => prev.map(t => selectedTenantIds.includes(t.id) ? { ...t, status: status as any } : t));
        setSelectedTenantIds([]);
        showToast(`Updated status for ${selectedTenantIds.length} accounts.`, 'success');
      }
    } catch (error) {
      showToast('Batch status update failed.', 'error');
    }
  };

  // Export CSV
  const exportAccountsCsv = () => {
    const headers = ['ID', 'Name', 'Type', 'Region', 'Country', 'Sector', 'Registration Date', 'Tax ID', 'Owner Email', 'Status', 'Tier', 'Assets Count'];
    const rows = tenants.map(t => [
      t.id, t.name, t.account_type, t.region, t.country, t.business_sector,
      t.registration_date, t.tax_id, t.owner_email, t.status, t.tier, (t.digital_assets || []).length
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `9xen_Accounts_Registry_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Overview Metrics
  const metrics = useMemo(() => {
    const total = tenants.length;
    const regularCount = tenants.filter(t => t.account_type === 'REGULAR_ORGANIZATION').length;
    const enterpriseCount = tenants.filter(t => t.account_type === 'ENTERPRISE_CLIENT').length;
    const regulatorCount = tenants.filter(t => t.account_type === 'REGULATOR_AUTHORITY').length;
    const activeCount = tenants.filter(t => t.status === 'ACTIVE').length;
    const totalAssets = tenants.reduce((sum, t) => sum + (t.digital_assets ? t.digital_assets.length : 0), 0);
    return { total, regularCount, enterpriseCount, regulatorCount, activeCount, totalAssets };
  }, [tenants]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/60 border border-cyan-800/60 rounded-full text-cyan-400 font-bold text-xs font-mono uppercase tracking-widest mb-3">
              <Shield className="w-3.5 h-3.5" />
              9xen SaaS Super Admin Management Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Organization &amp; Enterprise Client Registry
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Centralized Super Admin control plane for Regular Businesses, Enterprise Clients, and Regulatory Authorities with regional isolation, account lifecycle merges, and cloud asset orchestration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowTransferLedgerModal(true)}
              className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-indigo-200 border border-indigo-700/60 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              Transfer Audit Ledger
            </button>
            <button
              onClick={exportAccountsCsv}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Export CSV
            </button>
            <button
              onClick={() => setShowMergeModal(true)}
              className="px-3.5 py-2 bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-700/60 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              <GitMerge className="w-3.5 h-3.5 text-indigo-400" />
              Merge Accounts
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Organization Account
            </button>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Accounts</p>
            <p className="text-xl font-black text-white mt-0.5">{metrics.total}</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Enterprise Clients</p>
            <p className="text-xl font-black text-cyan-300 mt-0.5">{metrics.enterpriseCount}</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Regular Orgs</p>
            <p className="text-xl font-black text-indigo-300 mt-0.5">{metrics.regularCount}</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Regulator Authorities</p>
            <p className="text-xl font-black text-amber-300 mt-0.5">{metrics.regulatorCount}</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Enclaves</p>
            <p className="text-xl font-black text-emerald-300 mt-0.5">{metrics.activeCount}</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Cloud Assets</p>
            <p className="text-xl font-black text-violet-300 mt-0.5">{metrics.totalAssets}</p>
          </div>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by Name, Tenant ID, Owner Email, Tax ID, DPO..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Reset
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
          {/* Region Filter */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cloud Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Regions</option>
              <option value="EU-CENTRAL-1">EU Frankfurt (EU-CENTRAL-1)</option>
              <option value="US-EAST-1">US Virginia (US-EAST-1)</option>
              <option value="APAC-SOUTH-1">Singapore (APAC-SOUTH-1)</option>
              <option value="LATAM-1">Brazil (LATAM-1)</option>
              <option value="MENA-DUBAI">UAE Dubai (MENA-DUBAI)</option>
              <option value="SOVEREIGN-PARIS">France Vault (SOVEREIGN-PARIS)</option>
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Country Jurisdiction</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Countries</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Singapore">Singapore</option>
              <option value="UAE">United Arab Emirates</option>
              <option value="Japan">Japan</option>
              <option value="Global Region">Global Region</option>
              <option value="Brazil">Brazil</option>
              <option value="Canada">Canada</option>
            </select>
          </div>

          {/* Business Sector Filter */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Business Sector</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Sectors</option>
              <option value="FinTech & Banking">FinTech &amp; Banking</option>
              <option value="Healthcare & MedTech">Healthcare &amp; MedTech</option>
              <option value="E-Commerce & Retail">E-Commerce &amp; Retail</option>
              <option value="EdTech & Universities">EdTech &amp; Universities</option>
              <option value="GovTech & Public Sector">GovTech &amp; Public Sector</option>
              <option value="Gaming & Entertainment">Gaming &amp; Entertainment</option>
              <option value="Logistics & Supply Chain">Logistics &amp; Supply Chain</option>
              <option value="Legal & Professional Services">Legal &amp; Professional Services</option>
            </select>
          </div>

          {/* Account Type */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Account Category</label>
            <select
              value={selectedAccountType}
              onChange={(e) => setSelectedAccountType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Account Types</option>
              <option value="ENTERPRISE_CLIENT">Enterprise Client</option>
              <option value="REGULAR_ORGANIZATION">Regular Business</option>
              <option value="REGULATOR_AUTHORITY">Regulator Authority</option>
            </select>
          </div>

          {/* Registration Date From */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reg. Date From</label>
            <input
              type="date"
              value={registeredFrom}
              onChange={(e) => setRegisteredFrom(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-700 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Registration Date To */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reg. Date To</label>
            <input
              type="date"
              value={registeredTo}
              onChange={(e) => setRegisteredTo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-700 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Batch Action Bar */}
      {selectedTenantIds.length > 0 && (
        <MultiSelectActionBar
          selectedCount={selectedTenantIds.length}
          onClear={() => setSelectedTenantIds([])}
          onDelete={handleBatchDelete}
          onStatusUpdate={handleBatchUpdateStatus}
          statusOptions={[
            { value: 'ACTIVE', label: 'Set Status: Active' },
            { value: 'SUSPENDED', label: 'Set Status: Suspended' },
            { value: 'MAINTENANCE', label: 'Set Status: Maintenance' }
          ]}
        />
      )}

      {/* Accounts Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
            <p className="text-xs font-mono font-bold text-slate-500 animate-pulse">Loading Sovereign Accounts Registry...</p>
          </div>
        ) : tenants.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Building2 className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-bold text-slate-800">No matching organization accounts found.</p>
            <p className="text-xs text-slate-500">Try adjusting your region, country, sector, or date filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedTenantIds.length === tenants.length && tenants.length > 0}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Organization &amp; Category</th>
                  <th className="p-4">Jurisdiction &amp; Region</th>
                  <th className="p-4">Sector &amp; Reg. Date</th>
                  <th className="p-4">Owner / DPO</th>
                  <th className="p-4">Status &amp; Tier</th>
                  <th className="p-4">Cloud Assets</th>
                  <th className="p-4 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tenants.map((tenant) => {
                  const isSelected = selectedTenantIds.includes(tenant.id);
                  const isEnterprise = tenant.account_type === 'ENTERPRISE_CLIENT';
                  const isRegulator = tenant.account_type === 'REGULATOR_AUTHORITY';

                  return (
                    <tr
                      key={tenant.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-cyan-50/40' : ''}`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(tenant.id)}
                          className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                        />
                      </td>

                      {/* Organization Name & Category */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl font-bold ${
                            isRegulator ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            isEnterprise ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                            'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}>
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>{tenant.name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] text-slate-400 font-semibold">{tenant.id}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                isRegulator ? 'bg-amber-950/20 text-amber-600 border border-amber-300' :
                                isEnterprise ? 'bg-cyan-950/20 text-cyan-600 border border-cyan-300' :
                                'bg-slate-200 text-slate-700'
                              }`}>
                                {isRegulator ? 'Regulator Authority' : isEnterprise ? 'Enterprise Client' : 'Regular Org'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Jurisdiction & Region */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span>{tenant.country}</span>
                          </div>
                          <div className="font-mono text-[10px] text-cyan-700 font-semibold">
                            {tenant.region}
                          </div>
                        </div>
                      </td>

                      {/* Sector & Registration Date */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-700">{tenant.business_sector}</div>
                          <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{tenant.registration_date}</span>
                          </div>
                        </div>
                      </td>

                      {/* Owner & DPO */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{tenant.owner_email}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            DPO: <span className="text-slate-700 font-semibold">{tenant.dpo_name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status & Tier */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                            tenant.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            tenant.status === 'SUSPENDED' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              tenant.status === 'ACTIVE' ? 'bg-emerald-500' : tenant.status === 'SUSPENDED' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            {tenant.status}
                          </span>
                          <div className="text-[10px] text-slate-500 font-bold font-mono">
                            {tenant.tier}
                          </div>
                        </div>
                      </td>

                      {/* Cloud Digital Assets */}
                      <td className="p-4">
                        <button
                          onClick={() => setAssetsModalTenant(tenant)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-colors"
                        >
                          <Server className="w-3 h-3 text-indigo-600" />
                          <span>{(tenant.digital_assets || []).length} Assets</span>
                        </button>
                      </td>

                      {/* Row Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Granular Compliance Profile Button */}
                          <button
                            onClick={() => setComplianceModalTenant(tenant)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                            title="Detailed Compliance Readiness & Audit Profile"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* SaaS Subscription & Tier Management */}
                          <button
                            onClick={() => setSubscriptionModalTenant(tenant)}
                            className="p-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg transition-colors"
                            title="SaaS Subscription, Tier Assignment & License Transfer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>

                          {/* Regulator Authority Configuration */}
                          <button
                            onClick={() => setRegulatorModalTenant(tenant)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isRegulator 
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300' 
                                : 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700'
                            }`}
                            title="Regulator Authority Governance & Direct Oversight Config"
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (onSwitchRole) onSwitchRole(isRegulator ? 'EU_REGULATOR' : 'TENANT_OWNER', tenant.id);
                              showToast(`Switched active context to ${tenant.name}`, 'info');
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 rounded-lg transition-colors"
                            title="Login / Switch Context to Account"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setConfigModalTenant(tenant)}
                            className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-lg transition-colors"
                            title="Enterprise Governance & Configuration Settings"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleAccountStatus(tenant)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              tenant.status === 'ACTIVE'
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                            title={tenant.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                          >
                            {tenant.status === 'ACTIVE' ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => setDeleteConfirmTenant(tenant)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: New Organization Account Provisioning */}
      {showNewModal && (
        <NewAccountModal
          onClose={() => setShowNewModal(false)}
          onCreated={(newTenant) => {
            setTenants([newTenant, ...tenants]);
            setShowNewModal(false);
            showToast(`Account ${newTenant.name} provisioned successfully!`, 'success');
          }}
        />
      )}

      {/* MODAL 2: Digital Assets & Cloud Infra Hub */}
      {assetsModalTenant && (
        <DigitalAssetsModal
          tenant={assetsModalTenant}
          onClose={() => setAssetsModalTenant(null)}
          onUpdated={(updatedAssets) => {
            setTenants(prev => prev.map(t => t.id === assetsModalTenant.id ? { ...t, digital_assets: updatedAssets } : t));
            setAssetsModalTenant({ ...assetsModalTenant, digital_assets: updatedAssets });
          }}
        />
      )}

      {/* MODAL 3: Enterprise Governance & Configurations */}
      {configModalTenant && (
        <EnterpriseConfigModal
          tenant={configModalTenant}
          onClose={() => setConfigModalTenant(null)}
          onSaved={(updatedTenant) => {
            setTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
            setConfigModalTenant(null);
            showToast(`Governance configurations updated for ${updatedTenant.name}`, 'success');
          }}
        />
      )}

      {/* MODAL 4: Account Merge Console */}
      {showMergeModal && (
        <AccountMergeModal
          tenants={tenants}
          onClose={() => setShowMergeModal(false)}
          onMerged={() => {
            setShowMergeModal(false);
            fetchTenants();
            showToast('Accounts merged successfully!', 'success');
          }}
        />
      )}

      {/* MODAL 5: SaaS Subscription & Tier Management */}
      {subscriptionModalTenant && (
        <TenantSubscriptionModal
          tenant={subscriptionModalTenant}
          allTenants={tenants}
          onClose={() => setSubscriptionModalTenant(null)}
          onUpdated={(updatedTier) => {
            setTenants(prev => prev.map(t => t.id === subscriptionModalTenant.id ? { ...t, tier: updatedTier } : t));
            setSubscriptionModalTenant(prev => prev ? { ...prev, tier: updatedTier } : null);
            fetchTenants();
          }}
        />
      )}

      {/* MODAL 6: Granular Compliance Readiness & Audit Profile */}
      {complianceModalTenant && (
        <TenantComplianceProfileModal
          tenant={complianceModalTenant}
          onClose={() => setComplianceModalTenant(null)}
          onUpdated={() => {
            fetchTenants();
          }}
        />
      )}

      {/* MODAL 7: Regulator Authority Oversight & Governance Config */}
      {regulatorModalTenant && (
        <TenantRegulatorConfigModal
          tenant={regulatorModalTenant}
          onClose={() => setRegulatorModalTenant(null)}
          onUpdated={() => {
            fetchTenants();
          }}
        />
      )}

      {/* MODAL 8: Subscription Transfer Audit Ledger */}
      {showTransferLedgerModal && (
        <SubscriptionTransferHistoryModal
          onClose={() => setShowTransferLedgerModal(false)}
        />
      )}

      {/* MODAL 9: Delete Confirm Modal */}
      {deleteConfirmTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-4 sm:p-5 lg:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Confirm Account Deletion</h3>
                <p className="text-xs text-slate-500 font-mono">{deleteConfirmTenant.id}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action is permanent and will wipe all sovereign database records, cloud enclaves, and compliance certificates for <strong className="text-slate-900">{deleteConfirmTenant.name}</strong>.
            </p>

            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Type exact string to confirm:
              </label>
              <span className="text-xs font-mono font-bold text-rose-600 select-all block">
                DELETE {deleteConfirmTenant.name}
              </span>
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder={`DELETE ${deleteConfirmTenant.name}`}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDeleteConfirmTenant(null);
                  setDeleteConfirmInput('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                disabled={deleteConfirmInput !== `DELETE ${deleteConfirmTenant.name}`}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl transition-colors"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --------------------------------------------------------------------------------
// SUB-COMPONENT: New Account Provisioning Modal
// --------------------------------------------------------------------------------
function NewAccountModal({ onClose, onCreated }: { onClose: () => void; onCreated: (t: TenantAccount) => void }) {
  const { showToast } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    account_type: 'ENTERPRISE_CLIENT' as 'REGULAR_ORGANIZATION' | 'ENTERPRISE_CLIENT' | 'REGULATOR_AUTHORITY',
    region: 'EU-CENTRAL-1',
    country: 'Germany',
    business_sector: 'FinTech & Banking',
    registration_date: new Date().toISOString().split('T')[0],
    tax_id: '',
    owner_email: '',
    dpo_name: '',
    tier: 'Enterprise Sovereign',
    activeModules: ['gdpr', 'ai_act', 'nis2', 'dora']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.owner_email.trim()) {
      showToast('Organization name and owner email are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetchWithRetry('/api/v1/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        onCreated(data.tenant);
      } else {
        showToast(data.error || 'Failed to create account.', 'error');
      }
    } catch (error) {
      showToast('Network error while provisioning account.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 text-cyan-800 rounded-2xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Provision New Organization Account</h2>
              <p className="text-xs text-slate-500">Super Admin account generation with jurisdiction &amp; sector assignment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Organization / Authority Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Acme Health Corp"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Account Category *
              </label>
              <select
                value={formData.account_type}
                onChange={(e) => setFormData({ ...formData, account_type: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-cyan-500"
              >
                <option value="ENTERPRISE_CLIENT">Enterprise Client</option>
                <option value="REGULAR_ORGANIZATION">Regular Business</option>
                <option value="REGULATOR_AUTHORITY">Regulator Authority (DPA / Ministry)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Cloud Region Enclave *
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="EU-CENTRAL-1">EU Frankfurt (EU-CENTRAL-1)</option>
                <option value="US-EAST-1">US Virginia (US-EAST-1)</option>
                <option value="APAC-SOUTH-1">Singapore (APAC-SOUTH-1)</option>
                <option value="LATAM-1">Brazil (LATAM-1)</option>
                <option value="MENA-DUBAI">UAE Dubai (MENA-DUBAI)</option>
                <option value="SOVEREIGN-PARIS">France Vault (SOVEREIGN-PARIS)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Country Jurisdiction *
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Singapore">Singapore</option>
                <option value="UAE">United Arab Emirates</option>
                <option value="Japan">Japan</option>
                <option value="Global Region">Global Region</option>
                <option value="Brazil">Brazil</option>
                <option value="Canada">Canada</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Business Sector *
              </label>
              <select
                value={formData.business_sector}
                onChange={(e) => setFormData({ ...formData, business_sector: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="FinTech & Banking">FinTech &amp; Banking</option>
                <option value="Healthcare & MedTech">Healthcare &amp; MedTech</option>
                <option value="E-Commerce & Retail">E-Commerce &amp; Retail</option>
                <option value="EdTech & Universities">EdTech &amp; Universities</option>
                <option value="GovTech & Public Sector">GovTech &amp; Public Sector</option>
                <option value="Gaming & Entertainment">Gaming &amp; Entertainment</option>
                <option value="Logistics & Supply Chain">Logistics &amp; Supply Chain</option>
                <option value="Legal & Professional Services">Legal &amp; Professional Services</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Registration Date
              </label>
              <input
                type="date"
                value={formData.registration_date}
                onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Tax ID / Business Reg Number
              </label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                placeholder="e.g. DE-99887766"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Owner / Admin Email *
              </label>
              <input
                type="email"
                required
                value={formData.owner_email}
                onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                placeholder="admin@organization.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Data Protection Officer (DPO) Name
              </label>
              <input
                type="text"
                value={formData.dpo_name}
                onChange={(e) => setFormData({ ...formData, dpo_name: e.target.value })}
                placeholder="e.g. Dr. Aris Thorne"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Service SLA Tier
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-cyan-500"
              >
                <option value="Enterprise Sovereign">Enterprise Sovereign (99.99% SLA)</option>
                <option value="Pro">Pro Tier (99.9% SLA)</option>
                <option value="Regulator Authority">Regulator Authority Tier</option>
                <option value="Free">Starter / Trial Tier</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSubmitting ? 'Provisioning Account...' : 'Generate Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// SUB-COMPONENT: Digital Assets & Cloud Infra Hub Modal
// --------------------------------------------------------------------------------
function DigitalAssetsModal({
  tenant,
  onClose,
  onUpdated
}: {
  tenant: TenantAccount;
  onClose: () => void;
  onUpdated: (assets: DigitalAsset[]) => void;
}) {
  const { showToast } = useNotification();
  const [assets, setAssets] = useState<DigitalAsset[]>(tenant.digital_assets || []);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'SERVER' as DigitalAsset['type'],
    provider: 'GCP' as DigitalAsset['provider'],
    region: tenant.region || 'EU-CENTRAL-1',
    host: '10.0.1.20',
    status: 'HEALTHY' as DigitalAsset['status'],
    specs: '16 vCPU, 64GB RAM, 500GB SSD'
  });

  const handleAddAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetchWithRetry(`/api/v1/tenants/${tenant.id}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset)
      });
      const data = await res.json();
      if (data.success) {
        const updatedList = [...assets, data.asset];
        setAssets(updatedList);
        onUpdated(updatedList);
        setShowAddAsset(false);
        setNewAsset({
          name: '',
          type: 'SERVER',
          provider: 'GCP',
          region: tenant.region || 'EU-CENTRAL-1',
          host: '10.0.1.20',
          status: 'HEALTHY',
          specs: '16 vCPU, 64GB RAM, 500GB SSD'
        });
        showToast('Digital asset registered.', 'success');
      }
    } catch (error) {
      showToast('Failed to register asset.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      const res = await fetchWithRetry(`/api/v1/tenants/${tenant.id}/assets/${assetId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const updatedList = assets.filter(a => a.id !== assetId);
        setAssets(updatedList);
        onUpdated(updatedList);
        showToast('Asset removed.', 'info');
      }
    } catch (error) {
      showToast('Failed to remove asset.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Digital Assets &amp; Cloud Infrastructure</h2>
              <p className="text-xs text-slate-500 font-mono">{tenant.name} ({tenant.id})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-600 font-medium">
            Managed servers, cloud enclaves, databases, and quantum key engines tied to this account.
          </p>
          <button
            onClick={() => setShowAddAsset(!showAddAsset)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Infrastructure Component
          </button>
        </div>

        {/* Add Asset Form */}
        {showAddAsset && (
          <form onSubmit={handleAddAssetSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider">Register New Component</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="e.g. Paris Sovereign Vault 1"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Asset Type</label>
                <select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="SERVER">Server / K8s Cluster</option>
                  <option value="CLOUD_ENCLAVE">Cloud Enclave</option>
                  <option value="DATABASE">Sovereign Database</option>
                  <option value="API_ENDPOINT">API Endpoint</option>
                  <option value="SSL_CERT">SSL / TLS Certificate</option>
                  <option value="QUANTUM_KEY">Quantum Key Engine (PQC)</option>
                  <option value="STORAGE_VAULT">Storage Vault</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Cloud Provider</label>
                <select
                  value={newAsset.provider}
                  onChange={(e) => setNewAsset({ ...newAsset, provider: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="GCP">Google Cloud Platform (GCP)</option>
                  <option value="AWS">Amazon Web Services (AWS)</option>
                  <option value="AZURE">Microsoft Azure</option>
                  <option value="HETZNER">Hetzner Sovereign Bare Metal</option>
                  <option value="SOVEREIGN_PRIVATE">Sovereign Private Enclave</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Host / IP / Endpoint</label>
                <input
                  type="text"
                  value={newAsset.host}
                  onChange={(e) => setNewAsset({ ...newAsset, host: e.target.value })}
                  placeholder="e.g. 10.240.0.12 or vault.internal"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Hardware / Software Specs</label>
                <input
                  type="text"
                  value={newAsset.specs}
                  onChange={(e) => setNewAsset({ ...newAsset, specs: e.target.value })}
                  placeholder="e.g. 32 vCPU, 128GB RAM"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-end justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAsset(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {isSaving ? 'Saving...' : 'Add Component'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Asset Cards List */}
        <div className="space-y-3">
          {assets.length === 0 ? (
            <div className="p-5 sm:p-6 lg:p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
              <HardDrive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No cloud infrastructure components registered yet.</p>
            </div>
          ) : (
            assets.map((ast) => (
              <div
                key={ast.id}
                className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 rounded-xl mt-0.5">
                    {ast.type === 'DATABASE' ? <Database className="w-4 h-4" /> :
                     ast.type === 'QUANTUM_KEY' ? <Key className="w-4 h-4 text-cyan-400" /> :
                     ast.type === 'CLOUD_ENCLAVE' ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> :
                     <Server className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                      <span>{ast.name}</span>
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[9px] font-mono font-bold rounded uppercase">
                        {ast.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                      <span>Provider: <strong className="text-cyan-400">{ast.provider}</strong></span>
                      <span>Region: <strong className="text-indigo-300">{ast.region}</strong></span>
                      <span>Host: <strong className="text-slate-200">{ast.host}</strong></span>
                    </div>
                    {ast.specs && (
                      <div className="text-[11px] text-slate-400 mt-1 italic">
                        Specs: {ast.specs}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    {ast.status}
                  </span>
                  <button
                    onClick={() => handleDeleteAsset(ast.id)}
                    className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 rounded-lg transition-colors cursor-pointer"
                    title="Remove Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-sm"
          >
            Close Asset Manager
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// SUB-COMPONENT: Enterprise Governance & Configuration Modal
// --------------------------------------------------------------------------------
function EnterpriseConfigModal({
  tenant,
  onClose,
  onSaved
}: {
  tenant: TenantAccount;
  onClose: () => void;
  onSaved: (t: TenantAccount) => void;
}) {
  const { showToast } = useNotification();
  const [isSaving, setIsSaving] = useState(false);

  const [activeModules, setActiveModules] = useState<string[]>(
    tenant.activeModules && tenant.activeModules.length > 0
      ? tenant.activeModules
      : ['gdpr', 'ai_act', 'nis2', 'dora']
  );

  const [config, setConfig] = useState<EnterpriseConfig>(
    tenant.enterprise_config || {
      rateLimitRpm: 5000,
      dailyQuotaMb: 500000,
      enclaveIsolation: 'DEDICATED_VPC',
      ssoProvider: 'OIDC_OKTA'
    }
  );

  const moduleOptions = [
    { id: 'gdpr', name: 'GDPR / EU Privacy Law' },
    { id: 'ai_act', name: 'EU AI Act Risk Classification' },
    { id: 'nis2', name: 'NIS2 Infrastructure Cyber Resilience' },
    { id: 'dora', name: 'DORA Operational Resilience' },
    { id: 'hipaa', name: 'HIPAA Health Compliance' },
    { id: 'pci_dss', name: 'PCI-DSS Payment Security' },
    { id: 'popia', name: 'POPIA South Africa' },
    { id: 'ehds', name: 'EHDS Health Data Space' }
  ];

  const handleToggleModule = (mId: string) => {
    setActiveModules(prev =>
      prev.includes(mId) ? prev.filter(x => x !== mId) : [...prev, mId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetchWithRetry(`/api/v1/tenants/${tenant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeModules,
          enterprise_config: config
        })
      });
      const data = await res.json();
      if (data.success) {
        onSaved({ ...tenant, activeModules, enterprise_config: config });
      }
    } catch (error) {
      showToast('Failed to save governance configurations.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-2xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Enterprise Governance &amp; Configuration</h2>
              <p className="text-xs text-slate-500 font-mono">{tenant.name} ({tenant.id})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Framework Entitlements */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Active RegTech Framework Entitlements</h4>
          <div className="grid grid-cols-2 gap-2">
            {moduleOptions.map(m => {
              const isActive = activeModules.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleToggleModule(m.id)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-500 font-medium'
                  }`}
                >
                  <span className="text-xs">{m.name}</span>
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Quotas & Enclave Limits */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Rate Limits &amp; Enclave Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                API Rate Limit (Requests / Min)
              </label>
              <input
                type="number"
                value={config.rateLimitRpm || 5000}
                onChange={(e) => setConfig({ ...config, rateLimitRpm: parseInt(e.target.value) || 1000 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Enclave Isolation Level
              </label>
              <select
                value={config.enclaveIsolation || 'DEDICATED_VPC'}
                onChange={(e) => setConfig({ ...config, enclaveIsolation: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="SHARED_MULTI_TENANT">Shared Multi-Tenant</option>
                <option value="DEDICATED_VPC">Dedicated Private VPC</option>
                <option value="AIR_GAPPED_VAULT">Air-Gapped Sovereign Vault</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Dedicated Sovereign Database Connection URL (Optional)
              </label>
              <input
                type="text"
                value={config.dedicatedDbUrl || ''}
                onChange={(e) => setConfig({ ...config, dedicatedDbUrl: e.target.value })}
                placeholder="postgres://usr:pwd@sovereign-db.internal:5432/tenant_db"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSaving ? 'Saving Configurations...' : 'Save Configurations'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// SUB-COMPONENT: Account Merge Console Modal
// --------------------------------------------------------------------------------
function AccountMergeModal({
  tenants,
  onClose,
  onMerged
}: {
  tenants: TenantAccount[];
  onClose: () => void;
  onMerged: () => void;
}) {
  const { showToast } = useNotification();
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [isMerging, setIsMerging] = useState(false);

  const [mergeOptions, setMergeOptions] = useState({
    transferDigitalAssets: true,
    reassignComplianceRecords: true,
    consolidateUsers: true
  });

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId) {
      showToast('Please select both Source and Target accounts.', 'error');
      return;
    }
    if (sourceId === targetId) {
      showToast('Source and Target accounts cannot be the same.', 'error');
      return;
    }

    setIsMerging(true);
    try {
      const res = await fetchWithRetry('/api/v1/tenants/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceTenantId: sourceId,
          targetTenantId: targetId,
          mergeOptions,
          mergedBy: 'Super Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        onMerged();
      } else {
        showToast(data.error || 'Failed to merge accounts.', 'error');
      }
    } catch (error) {
      showToast('Error executing account merge.', 'error');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-2xl">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Account Lifecycle Merge Console</h2>
              <p className="text-xs text-slate-500">Consolidate tenant data, digital assets, and compliance ledgers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleMergeSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
              Source Account (To be merged and archived)
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Select Source Account --</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.id} - {t.region})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
              Target Account (To receive merged assets &amp; data)
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Select Target Account --</option>
              {tenants.filter(t => t.id !== sourceId).map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.id} - {t.region})</option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Merge Execution Parameters</span>
            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={mergeOptions.transferDigitalAssets}
                onChange={(e) => setMergeOptions({ ...mergeOptions, transferDigitalAssets: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600"
              />
              Transfer all cloud servers &amp; sovereign database assets
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={mergeOptions.reassignComplianceRecords}
                onChange={(e) => setMergeOptions({ ...mergeOptions, reassignComplianceRecords: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600"
              />
              Reassign audit logs, certificates, and enforcement records
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isMerging || !sourceId || !targetId}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isMerging && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isMerging ? 'Merging Accounts...' : 'Execute Account Merge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminTenants;
