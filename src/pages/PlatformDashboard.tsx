import React, { useState, useEffect } from 'react';
import { AuditTrail } from '../components/AuditTrail';
import { fetchWithRetry } from '../lib/api-client';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Activity, 
  Server, 
  Database, 
  Globe, 
  MemoryStick, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  History, 
  DollarSign, 
  CheckSquare, 
  RefreshCw, 
  Sliders, 
  Scale, 
  ShoppingCart, 
  X, 
  Search, 
  Filter,
  BrainCircuit,
  Zap,
  Terminal,
  ShieldCheck,
  Play,
  Eye,
  EyeOff,
  Lock,
  Shield,
  UserCheck,
  SlidersHorizontal,
  ChevronDown,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TenantComplianceRiskHeatmap } from '../components/TenantComplianceRiskHeatmap';
import { ComplianceTimeline } from '../components/dashboard/ComplianceTimeline';
import { NotificationSettings } from '../components/dashboard/NotificationSettings';
import { RegulatoryNewsFeed } from '../components/RegulatoryNewsFeed';
import { ComplianceDailyNewsFetcher } from '../components/dashboard/ComplianceDailyNewsFetcher';
import { AdminActivityFeedWidget } from '../components/admin/AdminActivityFeedWidget';
import { GlobalJurisdictionWorldMap } from '../components/admin/GlobalJurisdictionWorldMap';
import { AutonomousPlatformControlCenter } from '../components/admin/AutonomousPlatformControlCenter';
import { SystemHealthLogView } from '../components/admin/SystemHealthLogView';
import { BullMQWorkerMonitoring } from '../components/admin/BullMQWorkerMonitoring';
import { BullMQJobStatsGrid } from '../components/admin/BullMQJobStatsGrid';
import { BullMQTrendChart } from '../components/admin/BullMQTrendChart';
import { DownloadReportButton } from '../components/dashboard/DownloadReportButton';
import { ComplianceReportData } from '../utils/complianceExport';
import { LegislativeNotificationBanner } from '../components/LegislativeNotificationBanner';
import { CaaSAddonsManager } from '../components/CaaSAddonsManager';
import { RegulatoryLawManager } from '../components/admin/RegulatoryLawManager';
import { EntityProfile } from '../components/profile/EntityProfile';

export interface ModuleVisibilityConfig {
  taskQueue: boolean;             // Distributed BullMQ Task Queue & Worker Stats (Sensitive)
  competitorBenchmark: boolean;    // Competitor Benchmarking
  digitalTwinMap: boolean;         // Digital Twin & World Map
  caasB2gOversight: boolean;       // CaaS & B2G Oversight
  riskHeatmap: boolean;            // Compliance Risk Heatmap
  infrastructureNodes: boolean;    // Infrastructure Nodes & Database Telemetry
  platformSecurity: boolean;       // Fraud Detection & Config Drift
  financials: boolean;             // Revenue Intelligence & Self-Audit
  newsAndTimeline: boolean;        // Regulatory News & Compliance Timeline
  systemAuditLogs: boolean;        // Audit Logs & System Activity Feed
}

export const ROLE_MODULE_DEFAULTS: Record<string, ModuleVisibilityConfig> = {
  SUPER_ADMIN: {
    taskQueue: true,
    competitorBenchmark: true,
    digitalTwinMap: true,
    caasB2gOversight: true,
    riskHeatmap: true,
    infrastructureNodes: true,
    platformSecurity: true,
    financials: true,
    newsAndTimeline: true,
    systemAuditLogs: true,
  },
  ADMIN: {
    taskQueue: true,
    competitorBenchmark: true,
    digitalTwinMap: true,
    caasB2gOversight: true,
    riskHeatmap: true,
    infrastructureNodes: true,
    platformSecurity: true,
    financials: true,
    newsAndTimeline: true,
    systemAuditLogs: true,
  },
  COMPLIANCE_OFFICER: {
    taskQueue: true,
    competitorBenchmark: true,
    digitalTwinMap: true,
    caasB2gOversight: true,
    riskHeatmap: true,
    infrastructureNodes: true,
    platformSecurity: true,
    financials: true,
    newsAndTimeline: true,
    systemAuditLogs: true,
  },
  REGULATOR: {
    taskQueue: false,
    competitorBenchmark: true,
    digitalTwinMap: true,
    caasB2gOversight: true,
    riskHeatmap: true,
    infrastructureNodes: false,
    platformSecurity: true,
    financials: false,
    newsAndTimeline: true,
    systemAuditLogs: true,
  },
  EU_REGULATOR: {
    taskQueue: false,
    competitorBenchmark: true,
    digitalTwinMap: true,
    caasB2gOversight: true,
    riskHeatmap: true,
    infrastructureNodes: false,
    platformSecurity: true,
    financials: false,
    newsAndTimeline: true,
    systemAuditLogs: true,
  },
  AUDITOR: {
    taskQueue: false,
    competitorBenchmark: true,
    digitalTwinMap: true,
    caasB2gOversight: false,
    riskHeatmap: true,
    infrastructureNodes: true,
    platformSecurity: true,
    financials: false,
    newsAndTimeline: true,
    systemAuditLogs: true,
  },
  CLIENT: {
    taskQueue: false,
    competitorBenchmark: false,
    digitalTwinMap: true,
    caasB2gOversight: false,
    riskHeatmap: true,
    infrastructureNodes: false,
    platformSecurity: false,
    financials: false,
    newsAndTimeline: true,
    systemAuditLogs: false,
  },
  VIEWER: {
    taskQueue: false,
    competitorBenchmark: false,
    digitalTwinMap: true,
    caasB2gOversight: false,
    riskHeatmap: true,
    infrastructureNodes: false,
    platformSecurity: false,
    financials: false,
    newsAndTimeline: true,
    systemAuditLogs: false,
  }
};

// Highly realistic trend datasets for the micro-charts
const activeTenanciesData = [
  { month: 'Jan', count: 980 },
  { month: 'Feb', count: 1040 },
  { month: 'Mar', count: 1110 },
  { month: 'Apr', count: 1180 },
  { month: 'May', count: 1220 },
  { month: 'Jun', count: 1248 },
];

const complianceScoreData = [
  { period: 'Wk 1', score: 72.4 },
  { period: 'Wk 2', score: 74.8 },
  { period: 'Wk 3', score: 78.1 },
  { period: 'Wk 4', score: 81.3 },
  { period: 'Wk 5', score: 84.0 },
  { period: 'Wk 6', score: 86.4 },
];

const pendingAlertsData = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 15 },
  { day: 'Wed', count: 8 },
  { day: 'Thu', count: 11 },
  { day: 'Fri', count: 6 },
  { day: 'Sat', count: 4 },
  { day: 'Sun', count: 3 },
];

const aiHealthData = [
  { time: '00:00', health: 99.1 },
  { time: '04:00', health: 98.8 },
  { time: '08:00', health: 99.4 },
  { time: '12:00', health: 98.2 },
  { time: '16:00', health: 99.6 },
  { time: '20:00', health: 99.9 },
  { time: '23:59', health: 99.4 },
];

export const PlatformDashboard: React.FC = () => {
  const { showToast } = useNotification();
  const authContext = useAuth();
  const initialRole = authContext?.role || 'SUPER_ADMIN';
  const [selectedRole, setSelectedRole] = React.useState<string>(initialRole);
  const [isCustomizerOpen, setIsCustomizerOpen] = React.useState<boolean>(false);
  const [dashboardActiveTab, setDashboardActiveTab] = React.useState<'OVERVIEW' | 'TELEMETRY' | 'FINANCE_OPS' | 'AUDIT_SECURITY' | 'REGULATORY_LAW' | 'PROFILE'>('OVERVIEW');
  const [profileData, setProfileData] = React.useState<any>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [mockLoginEmail, setMockLoginEmail] = React.useState('');

  const fetchUserProfile = async (email: string) => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/v1/user/profile?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        // Map backend data to EntityProfile component props
        const p = data.profile;
        const u = data.user;
        
        setProfileData({
          type: u.role,
          name: p.company_legal_name || p.government_body_name || u.full_name,
          description: p.professional_bio,
          regNo: p.company_registration_number || p.regulator_code,
          taxId: p.tax_id,
          industry: p.industry_type,
          revenue: p.yearly_revenue,
          employees: p.employee_count,
          website: p.website_url,
          email: u.email,
          board: p.management_board,
          branches: p.global_presence,
          verificationStatus: 'verified',
          complianceScore: 94,
          joinedDate: new Date(u.created_at || Date.now()).getFullYear().toString(),
          mandate: p.mandate,
          license: p.bar_license_number
        });
        setDashboardActiveTab('PROFILE');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  React.useEffect(() => {
    if (authContext?.role) {
      setSelectedRole(authContext.role);
    }
  }, [authContext?.role]);

  const [moduleVisibility, setModuleVisibility] = React.useState<ModuleVisibilityConfig>(
    ROLE_MODULE_DEFAULTS[initialRole] || ROLE_MODULE_DEFAULTS.SUPER_ADMIN
  );

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    if (authContext?.setActiveRole) {
      authContext.setActiveRole(newRole);
    }
    setModuleVisibility(ROLE_MODULE_DEFAULTS[newRole] || ROLE_MODULE_DEFAULTS.SUPER_ADMIN);
  };

  const [oversightData, setOversightData] = React.useState<any>(null);
  const [b2gOversight, setB2gOversight] = React.useState<any>(null);
  const [caasOps, setCaasOps] = React.useState<any[]>([]);

  // Operations Log CRUD states
  const [tenantsList, setTenantsList] = React.useState<any[]>([]);
  const [opsSearchQuery, setOpsSearchQuery] = React.useState('');
  const [opsStatusFilter, setOpsStatusFilter] = React.useState('ALL');
  const [opsTypeFilter, setOpsTypeFilter] = React.useState('ALL');

  const [isOpsModalOpen, setIsOpsModalOpen] = React.useState(false);
  const [editingOp, setEditingOp] = React.useState<any | null>(null);
  const [formOpTenantId, setFormOpTenantId] = React.useState('');
  const [formOpType, setFormOpType] = React.useState('KYC_RE_VERIFICATION');
  const [formOpStatus, setFormOpStatus] = React.useState('completed');
  const [formOpResultSummary, setFormOpResultSummary] = React.useState('');
  const [formOpStartedAt, setFormOpStartedAt] = React.useState('');
  const [formOpCompletedAt, setFormOpCompletedAt] = React.useState('');

  const fetchTenants = async () => {
    try {
      const res = await fetchWithRetry('/api/v1/tenants');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.tenants)) {
          setTenantsList(data.tenants);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch tenants list', err);
    }
  };

  const fetchCaasOps = async () => {
    try {
      const opsRes = await fetchWithRetry('/api/v1/admin/global-caas-operations');
      if (opsRes.ok) {
        const ct = opsRes.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const opsData = await opsRes.json().catch(() => null);
          if (opsData?.success) setCaasOps(opsData.operations || []);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch caas operations', err);
    }
  };

  const uniqueOpTypes = React.useMemo(() => {
    const types = new Set<string>();
    caasOps.forEach(op => {
      if (op.operation_type) {
        types.add(op.operation_type);
      }
    });
    return Array.from(types);
  }, [caasOps]);

  const filteredOps = React.useMemo(() => {
    return caasOps.filter(op => {
      const tenantMatch = op.tenant_name?.toLowerCase().includes(opsSearchQuery.toLowerCase()) || 
                          op.tenant_id?.toLowerCase().includes(opsSearchQuery.toLowerCase());
      const summaryMatch = op.result_summary?.toLowerCase().includes(opsSearchQuery.toLowerCase());
      const typeMatch = op.operation_type?.toLowerCase().includes(opsSearchQuery.toLowerCase());
      const matchesSearch = tenantMatch || summaryMatch || typeMatch;

      const matchesStatus = opsStatusFilter === 'ALL' || op.status === opsStatusFilter;
      const matchesType = opsTypeFilter === 'ALL' || op.operation_type === opsTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [caasOps, opsSearchQuery, opsStatusFilter, opsTypeFilter]);

  const handleOpenAddOpModal = () => {
    setEditingOp(null);
    setFormOpTenantId(tenantsList[0]?.id || 'org_1');
    setFormOpType('KYC_RE_VERIFICATION');
    setFormOpStatus('completed');
    setFormOpResultSummary('');
    setFormOpStartedAt(new Date().toISOString().slice(0, 16));
    setFormOpCompletedAt(new Date().toISOString().slice(0, 16));
    setIsOpsModalOpen(true);
  };

  const handleOpenEditOpModal = (op: any) => {
    setEditingOp(op);
    setFormOpTenantId(op.tenant_id);
    setFormOpType(op.operation_type);
    setFormOpStatus(op.status);
    setFormOpResultSummary(op.result_summary || '');
    setFormOpStartedAt(op.started_at ? new Date(op.started_at).toISOString().slice(0, 16) : '');
    setFormOpCompletedAt(op.completed_at ? new Date(op.completed_at).toISOString().slice(0, 16) : '');
    setIsOpsModalOpen(true);
  };

  const handleSaveOp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOpTenantId || !formOpType || !formOpStatus) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    const payload = {
      tenant_id: formOpTenantId,
      operation_type: formOpType,
      status: formOpStatus,
      result_summary: formOpResultSummary,
      started_at: formOpStartedAt ? new Date(formOpStartedAt).toISOString() : new Date().toISOString(),
      completed_at: formOpCompletedAt ? new Date(formOpCompletedAt).toISOString() : null,
    };

    try {
      let res;
      if (editingOp) {
        res = await fetch(`/api/v1/admin/global-caas-operations/${editingOp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/v1/admin/global-caas-operations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsOpsModalOpen(false);
        fetchCaasOps();
        showToast('Operation saved successfully.', 'success');
      } else {
        const data = await res.json();
        showToast(`Failed to save operation: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (err: any) {
      console.error('Error saving operation', err);
      showToast('Network error while saving operation', 'error');
    }
  };

  const handleDeleteOp = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this operation record?')) return;
    try {
      const res = await fetch(`/api/v1/admin/global-caas-operations/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCaasOps();
      } else {
        const data = await res.json();
        showToast(`Failed to delete: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      console.error('Error deleting operation', err);
      showToast('Network error while deleting operation', 'error');
    }
  };
  const [addons, setAddons] = React.useState<any[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = React.useState<string[]>([]);
  const [isMarketplaceAdminOpen, setIsMarketplaceAdminOpen] = React.useState(false);
  const [editingAddon, setEditingAddon] = React.useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const [addonSearchQuery, setAddonSearchQuery] = React.useState('');
  const [addonCategoryFilter, setAddonCategoryFilter] = React.useState('ALL');

  const addonCategories = React.useMemo(() => {
    const cats = new Set<string>();
    addons.forEach(a => {
      if (a.category) {
        cats.add(a.category.toUpperCase());
      }
    });
    return Array.from(cats);
  }, [addons]);

  const filteredAddons = React.useMemo(() => {
    return addons.filter(addon => {
      const nameMatch = addon.name?.toLowerCase().includes(addonSearchQuery.toLowerCase());
      const descMatch = addon.description?.toLowerCase().includes(addonSearchQuery.toLowerCase());
      const idMatch = addon.id?.toLowerCase().includes(addonSearchQuery.toLowerCase());
      const matchesSearch = nameMatch || descMatch || idMatch;
      
      const matchesCategory = addonCategoryFilter === 'ALL' || 
                              addon.category?.toUpperCase() === addonCategoryFilter.toUpperCase();
                              
      return matchesSearch && matchesCategory;
    });
  }, [addons, addonSearchQuery, addonCategoryFilter]);

  const fetchAddons = async () => {
    try {
      const res = await fetchWithRetry('/api/v1/admin/caas-marketplace/addons', {
        headers: { 'x-user-role': 'ADMIN' }
      });
      if (!res.ok) {
        return;
      }
      const ct = res.headers.get('content-type');
      if (ct && ct.includes('application/json')) {
        const data = await res.json().catch(() => null);
        if (data?.success && Array.isArray(data.addons)) setAddons(data.addons);
      }
    } catch (err) {
      console.warn('Failed to fetch addons', err);
    }
  };

  const handleUpdateAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/caas-marketplace/addons', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'ADMIN'
        },
        body: JSON.stringify(editingAddon)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Addon updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchAddons();
      }
    } catch (err) {
      showToast('Failed to update addon', 'error');
    }
  };

  const toggleAddonGlobal = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/caas-marketplace/addons/${id}/toggle`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'x-user-role': 'ADMIN'
        },
        body: JSON.stringify({ enabled })
      });
      const data = await res.json();
      if (data.success) {
        setAddons(prev => prev.map(a => a.id === id ? { ...a, isActiveGlobally: enabled } : a));
      }
    } catch (err) {
      console.error('Failed to toggle addon', err);
    }
  };

  const handleBatchToggle = async (enabled: boolean) => {
    if (selectedAddonIds.length === 0) return;
    
    const confirmMsg = `Are you sure you want to ${enabled ? 'ENABLE' : 'DISABLE'} ${selectedAddonIds.length} selected addons globally?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/v1/admin/caas-marketplace/addons/batch-toggle', {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'x-user-role': 'ADMIN'
        },
        body: JSON.stringify({ ids: selectedAddonIds, enabled })
      });
      const data = await res.json();
      if (data.success) {
        setAddons(prev => prev.map(a => 
          selectedAddonIds.includes(a.id) ? { ...a, isActiveGlobally: enabled } : a
        ));
        setSelectedAddonIds([]);
        showToast(`Successfully ${enabled ? 'enabled' : 'disabled'} ${data.count} addons.`, 'success');
      }
    } catch (err) {
      console.error('Batch toggle failed', err);
      showToast('Batch operation failed.', 'error');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedAddonIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const filteredIds = filteredAddons.map(a => a.id);
    const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedAddonIds.includes(id));
    if (allFilteredSelected) {
      setSelectedAddonIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedAddonIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  React.useEffect(() => {
    const fetchOversight = async () => {
      try {
        const caasRes = await fetchWithRetry('/api/v1/admin/global-caas-oversight');
        if (caasRes.ok) {
          const ct = caasRes.headers.get('content-type');
          if (ct && ct.includes('application/json')) {
            const caasData = await caasRes.json().catch(() => null);
            if (caasData?.success) setOversightData(caasData);
          }
        }

        const b2gRes = await fetchWithRetry('/api/v1/admin/global-b2g-oversight');
        if (b2gRes.ok) {
          const ct = b2gRes.headers.get('content-type');
          if (ct && ct.includes('application/json')) {
            const b2gData = await b2gRes.json().catch(() => null);
            if (b2gData?.success) setB2gOversight(b2gData);
          }
        }

        const opsRes = await fetchWithRetry('/api/v1/admin/global-caas-operations');
        if (opsRes.ok) {
          const ct = opsRes.headers.get('content-type');
          if (ct && ct.includes('application/json')) {
            const opsData = await opsRes.json().catch(() => null);
            if (opsData?.success) setCaasOps(opsData.operations || []);
          }
        }

        fetchTenants();
        fetchAddons();
      } catch (err) {
        console.warn('Failed to fetch oversight data', err);
      }
    };
    fetchOversight();
  }, []);

  const complianceReportData: ComplianceReportData = React.useMemo(() => {
    const totalTenants = oversightData?.stats?.total_tenants || '1,248';
    const totalScans = oversightData?.stats?.total_scans || '18,450';
    const overallScore = Math.round(Number(oversightData?.stats?.avg_readiness_score) || 94.2);
    const securityPosture = oversightData?.stats?.security_posture || 'OPTIMAL (Kyber-1024 HSM)';

    const mandates = [
      { framework: 'GDPR (EU 2016/679)', score: 98, status: 'ENFORCED', details: 'Zero PII egress, Article 30 ROPA, client-side encryption' },
      { framework: 'EU AI Act (2024/1689)', score: 95, status: 'COMPLIANT', details: 'Annex IV documentation, continuous bias & drift telemetry' },
      { framework: 'NIS2 Directive (2022/2555)', score: 94, status: 'ACTIVE', details: 'Incident notification ready (<24h SLA), vulnerability ledger' },
      { framework: 'DORA Resiliency (2022/2554)', score: 99, status: 'CERTIFIED', details: 'ICT stress tests passing, sovereign multi-region disaster recovery' },
      { framework: 'CSRD / ESG Directive', score: 92, status: 'TRACKED', details: 'Double materiality assessment & Scope 3 carbon accounting active' },
      { framework: 'DSA / Whistleblowing', score: 96, status: 'ACTIVE', details: 'PGP encrypted reporting channels & automated retention sweeps' },
    ];

    const modules = (addons && addons.length > 0 ? addons : [
      { name: 'Data Privacy Compliance', category: 'Core Privacy', actId: 'GDPR', score: 96, subscriptionStatus: 'active' },
      { name: 'Cyber Security Compliance', category: 'Cybersecurity', actId: 'NIS2', score: 94, subscriptionStatus: 'active' },
      { name: 'ESG Compliance', category: 'Corporate Governance', actId: 'CSRD', score: 95, subscriptionStatus: 'active' },
      { name: 'Internal Audit Management', category: 'Corporate Governance', actId: 'DORA', score: 92, subscriptionStatus: 'active' },
      { name: 'Risk Register', category: 'Enterprise Compliance', actId: 'DORA', score: 91, subscriptionStatus: 'active' },
    ]).map((a: any) => ({
      name: a.name || 'Compliance Addon',
      category: a.category || 'General Compliance',
      actId: a.actId || 'EU Law',
      score: a.score || 92,
      status: a.subscriptionStatus === 'active' || a.isActiveGlobally ? 'Active' : 'Inactive',
    }));

    const operations = (caasOps && caasOps.length > 0 ? caasOps : [
      { tenant_name: 'Acme Europe SA', operation_type: 'KYC_RE_VERIFICATION', status: 'COMPLETED', result_summary: 'Passed with 0 anomalies across 12 AML watchlists', started_at: '2026-09-03 10:15:00' },
      { tenant_name: 'Acme Europe SA', operation_type: 'AI_ACT_ANNEX_IV_SCAN', status: 'COMPLETED', result_summary: 'Technical documentation audit certified compliant', started_at: '2026-09-03 09:40:00' },
      { tenant_name: 'Fintech Global Payments', operation_type: 'DORA_ICT_STRESS_TEST', status: 'IN_PROGRESS', result_summary: 'Simulating sovereign failover to Frankfurt data center', started_at: '2026-09-03 11:00:00' },
    ]).map((op: any) => ({
      tenant: op.tenant_name || op.tenant_id || 'Enterprise Enclave',
      type: op.operation_type || 'COMPLIANCE_AUDIT',
      status: op.status || 'VERIFIED',
      summary: op.result_summary || 'Verification completed successfully',
      timestamp: op.started_at || new Date().toISOString(),
    }));

    return {
      organizationName: 'Sovereign Compliance Platform',
      reportTitle: 'Global Platform Telemetry & Statutory Compliance Audit Report',
      overallScore,
      securityPosture,
      systemIntegrity: 'OPTIMAL (Zero Breaches)',
      totalTenants,
      totalScans,
      activeAddonsCount: modules.filter(m => m.status === 'Active').length,
      mandates,
      modules,
      operations,
    };
  }, [oversightData, addons, caasOps]);

  return (
    <div className="space-y-8 p-1 sm:p-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200/80 dark:border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Platform Telemetry
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
            Global infrastructure monitor and sovereign database isolation status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dynamic Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-indigo-500 ml-1.5" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide hidden sm:inline">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="bg-white dark:bg-slate-900 text-xs font-black text-slate-800 dark:text-slate-100 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
              title="Select Role to Dynamically Filter Dashboard Modules"
            >
              <option value="SUPER_ADMIN">SUPER_ADMIN (Full Access)</option>
              <option value="ADMIN">ADMIN</option>
              <option value="EU_REGULATOR">EU_REGULATOR</option>
              <option value="REGULATOR">REGULATOR</option>
              <option value="AUDITOR">AUDITOR</option>
              <option value="CLIENT">CLIENT (Standard Viewer)</option>
              <option value="VIEWER">VIEWER (Restricted)</option>
            </select>
          </div>

          {/* Module Customizer Toggle Button */}
          <button
            onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer shadow-xs ${
              isCustomizerOpen 
                ? 'bg-indigo-600 text-white border-indigo-700' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Customize Role Visualization Modules"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Customize Modules</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black">
              {Object.values(moduleVisibility).filter(Boolean).length}/10
            </span>
          </button>

          <DownloadReportButton 
            data={complianceReportData}
            variant="emerald"
            buttonId="download-report-btn"
          />
          <button 
            onClick={() => {
              window.location.hash = 'integrations';
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }}
            className="flex items-center space-x-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-lg text-xs font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer shadow-xs"
            title="Open Zero-Downtime Integrations & Webhooks Hub"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Zero-Downtime Integrations</span>
          </button>
          <button 
            onClick={async () => {
              try {
                const res = await fetch('/api/v1/admin/seed-demo-data', { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                  showToast('Demo data seeded successfully! Refreshing dashboards.', 'success');
                  window.location.reload();
                } else {
                  showToast(data.error || 'Failed to seed data.', 'error');
                }
              } catch (e) {
                showToast('Failed to seed data.', 'error');
              }
            }}
            className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
          >
            SEED DEMO ENVIRONMENT
          </button>
          <button
            onClick={() => {
              window.location.hash = 'partner-platform';
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }}
            className="text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 px-3 py-2 rounded-lg hover:bg-indigo-900 transition cursor-pointer"
          >
            PARTNER HUB (PRT)
          </button>
          <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-3.5 py-2 rounded-full text-xs font-semibold border border-emerald-200/80 dark:border-emerald-800/50 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Systems Operational</span>
          </div>

          {/* MOCK LOGIN & PROFILE ACTION */}
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4 ml-2">
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Mock Login Email..." 
                value={mockLoginEmail}
                onChange={(e) => setMockLoginEmail(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[10px] w-40 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              <button 
                onClick={() => fetchUserProfile(mockLoginEmail)}
                className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
              >
                {loadingProfile ? 'Loading...' : 'View Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Autonomous Background Worker Legislative Alert Banner */}
      <LegislativeNotificationBanner 
        onNavigateToQueue={() => {
          window.location.hash = 'admin-queue-dashboard';
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }}
      />

      {/* Role-Based Dashboard Module Customizer Drawer */}
      <AnimatePresence>
        {isCustomizerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/80 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                      Role-Based Module Visibility Customizer
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                      ACTIVE ROLE: {selectedRole}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Toggle dynamic telemetry cards and queue metrics for role <strong>{selectedRole}</strong>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModuleVisibility(ROLE_MODULE_DEFAULTS[selectedRole] || ROLE_MODULE_DEFAULTS.SUPER_ADMIN)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40"
                >
                  Reset Role Defaults
                </button>
                <button
                  onClick={() => setIsCustomizerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {[
                { key: 'taskQueue', label: 'BullMQ Task Queue & Workers', desc: 'Sensitive infrastructure job execution & worker stats', sensitive: true },
                { key: 'competitorBenchmark', label: 'Competitor Benchmarking', desc: 'Real-time feature comparison against industry SaaS' },
                { key: 'digitalTwinMap', label: 'Digital Twin & World Map', desc: 'Global regulatory node heatmap and simulation' },
                { key: 'caasB2gOversight', label: 'CaaS & B2G Subscription Health', desc: 'Global CaaS operations and Marketplace addons' },
                { key: 'riskHeatmap', label: 'Compliance Risk Heatmap', desc: 'Recharts-based multi-tenant compliance risk matrix' },
                { key: 'infrastructureNodes', label: 'Infrastructure & Storage Nodes', desc: 'Frankfurt/Paris node load & database storage telemetry' },
                { key: 'platformSecurity', label: 'Fraud Detection & Config Drift', desc: 'AI fraud detection and schema consistency monitoring' },
                { key: 'financials', label: 'Revenue Intelligence & Self-Audit', desc: 'ARR, churn metrics and automated SOC2 self-auditing', sensitive: true },
                { key: 'newsAndTimeline', label: 'Regulatory News & Timeline', desc: 'Daily compliance updates, timeline & alerts' },
                { key: 'systemAuditLogs', label: 'System Operations & Audit Trail', desc: 'Immutable audit trail and recent activity feed' },
              ].map(mod => {
                const isVisible = moduleVisibility[mod.key as keyof ModuleVisibilityConfig];
                return (
                  <div
                    key={mod.key}
                    onClick={() => {
                      setModuleVisibility(prev => ({
                        ...prev,
                        [mod.key]: !prev[mod.key as keyof ModuleVisibilityConfig]
                      }));
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isVisible
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{mod.label}</span>
                        {mod.sensitive && (
                          <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded uppercase">
                            Sensitive
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{mod.desc}</p>
                    </div>
                    <div className={`p-1.5 rounded-xl ${isVisible ? 'bg-indigo-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'}`}>
                      {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
      {/* Platform Dashboard Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2 mt-4 overflow-x-auto custom-scrollbar">
        {(['OVERVIEW', 'TELEMETRY', 'FINANCE_OPS', 'AUDIT_SECURITY', 'REGULATORY_LAW', 'PROFILE'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setDashboardActiveTab(tab)}
            className={`px-4 py-3 text-[11px] uppercase tracking-wider font-bold rounded-t-2xl border-b-2 transition-all cursor-pointer ${
              dashboardActiveTab === tab
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300'
            }`}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {dashboardActiveTab === 'PROFILE' && profileData && (
        <EntityProfile entity={profileData} />
      )}

      {dashboardActiveTab === 'OVERVIEW' && (<>
      {/* Executive Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Active Tenancies Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 lg:p-6 flex flex-col justify-between h-[220px]"
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Tenancies</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1.5">
                  {oversightData?.stats?.total_tenants || '1,248'}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/50">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>+5.8% Growth (MoM)</span>
            </div>
          </div>
          <div className="h-16 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeTenanciesData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTenancies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    border: '1px solid #334155', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                  }}
                  itemStyle={{ color: '#f8fafc', fontSize: '11px', fontWeight: '600' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: any) => [`${value} Tenants`, 'Count']}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorTenancies)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Total Compliance Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 lg:p-6 flex flex-col justify-between h-[220px]"
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Compliance Index</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1.5">
                  {oversightData?.stats?.avg_readiness_score || '86.4'}%
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-900/50">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>+12.1% Improvement</span>
            </div>
          </div>
          <div className="h-16 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={complianceScoreData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    border: '1px solid #334155', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                  }}
                  itemStyle={{ color: '#f8fafc', fontSize: '11px', fontWeight: '600' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: any) => [`${value}% Score`, 'Score']}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorCompliance)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pending Security Alerts Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 lg:p-6 flex flex-col justify-between h-[220px]"
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Regulatory Inquiries</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    {b2gOversight?.inquiries?.reduce((acc: number, curr: any) => acc + curr.count, 0) || '3'}
                  </h3>
                  <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/50 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100/80 dark:border-rose-900/50">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              <span>B2G Interaction Active</span>
            </div>
          </div>
          <div className="h-16 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pendingAlertsData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    border: '1px solid #334155', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                  }}
                  itemStyle={{ color: '#f8fafc', fontSize: '11px', fontWeight: '600' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: any) => [`${value} Alerts`, 'Count']}
                />
                <Bar 
                  dataKey="count" 
                  fill="#f43f5e" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Fleet Health Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 lg:p-6 flex flex-col justify-between h-[220px]"
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Fleet Health</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1.5">
                  99.4%
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/50">
                <BrainCircuit className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2">
              <Zap className="w-3.5 h-3.5 mr-1" />
              <span>Safety Guardrails Active</span>
            </div>
          </div>
          <div className="h-16 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aiHealthData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    border: '1px solid #334155', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                  }}
                  itemStyle={{ color: '#f8fafc', fontSize: '11px', fontWeight: '600' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="health" 
                  stroke="#6366f1" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorAI)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      </>)}

      {dashboardActiveTab === 'TELEMETRY' && (<>
      {/* Distributed BullMQ Task Queue & Worker Monitoring Enclave */}
      {!moduleVisibility.taskQueue ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-3xl bg-slate-900 dark:bg-slate-900 border border-slate-800 text-slate-300 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Sensitive Infrastructure & Queue Telemetry Restricted
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  ROLE: {selectedRole}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Distributed BullMQ job queues, Redis worker telemetry, and background execution stats are hidden for <strong>{selectedRole}</strong> viewers to protect platform security.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModuleVisibility(prev => ({ ...prev, taskQueue: true }))}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              Override Visibility
            </button>
            <button
              onClick={() => handleRoleChange('SUPER_ADMIN')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              Switch to Admin
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <BullMQJobStatsGrid />
            </div>
            <div className="lg:col-span-1">
              <BullMQTrendChart />
            </div>
          </div>
          <BullMQWorkerMonitoring />
        </motion.div>
      )}

      {/* Competitor Benchmarking & Advantage Module */}
      {moduleVisibility.competitorBenchmark && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden mb-8"
        >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Competitor Benchmarking & SaaS Advantage</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time comparison of platform features against industry leaders.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase">9Xen Lead +14%</span>
               <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">H</div>
                  <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">S</div>
                  <div className="w-6 h-6 rounded-full bg-black border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">V</div>
               </div>
            </div>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-xs">
                 <thead>
                   <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-black tracking-widest">
                     <th className="pb-4 font-black">Feature Set</th>
                     <th className="pb-4 text-center">9Xen Regulettee</th>
                     <th className="pb-4 text-center">HubSpot</th>
                     <th className="pb-4 text-center">Stripe</th>
                     <th className="pb-4 text-center">Vercel</th>
                   </tr>
                 </thead>
                 <tbody className="text-slate-700 dark:text-slate-300">
                   <tr className="border-b border-slate-50 dark:border-slate-800/50">
                     <td className="py-4 font-bold flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-indigo-500" />
                       Autonomous Sovereign Compliance
                     </td>
                     <td className="py-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                     <td className="py-4 text-center"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                     <td className="py-4 text-center"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                     <td className="py-4 text-center"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                   </tr>
                   <tr className="border-b border-slate-50 dark:border-slate-800/50">
                     <td className="py-4 font-bold flex items-center gap-2">
                       <Zap className="w-4 h-4 text-amber-500" />
                       Real-time AI Guardrails (M1-M4)
                     </td>
                     <td className="py-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                     <td className="py-4 text-center"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                     <td className="py-4 text-center"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                     <td className="py-4 text-center"><CheckCircle2 className="w-4 h-4 text-amber-500/50 mx-auto opacity-50" /></td>
                   </tr>
                   <tr className="border-b border-slate-50 dark:border-slate-800/50">
                     <td className="py-4 font-bold flex items-center gap-2">
                       <Scale className="w-4 h-4 text-purple-500" />
                       B2G Regulatory Gateway
                     </td>
                     <td className="py-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                     <td className="py-4 text-center"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                     <td className="py-4 text-center"><CheckCircle2 className="w-4 h-4 text-blue-500/50 mx-auto opacity-50" /></td>
                     <td className="py-4 text-center"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                   </tr>
                   <tr>
                     <td className="py-4 font-bold flex items-center gap-2">
                       <Terminal className="w-4 h-4 text-emerald-500" />
                       Forensic Audit & Data Lineage
                     </td>
                     <td className="py-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                     <td className="py-4 text-center"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                     <td className="py-4 text-center"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                     <td className="py-4 text-center"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center text-center">
            <TrendingUp className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Market Lead Delta</h4>
            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-1">+14.2%</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Technological Advantage Index</p>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
               <button className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline">VIEW FULL REPORT</button>
            </div>
          </div>
        </div>
      </motion.div>
      )}

      {/* Digital Twin Audit Simulator & Real-time Ops */}
      {moduleVisibility.digitalTwinMap && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-32 h-32 text-indigo-500" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Digital Twin Compliance Simulator</h3>
                </div>
                <p className="text-sm text-slate-400 max-w-lg">
                  Run high-fidelity stress tests against the latest ESMA and GDPR statutory gazettes using a digital clone of your platform state.
                </p>
              </div>
              <button 
                onClick={() => showToast('Initiating Digital Twin Audit Simulation...', 'info')}
                className="flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black uppercase text-sm hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
              >
                <Play className="w-4 h-4 fill-current" />
                Run Stress Test
              </button>
            </div>
          </motion.div>
          <GlobalJurisdictionWorldMap />
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-500" />
              Sovereign Shell Access
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-emerald-400 space-y-2">
              <div className="flex gap-2">
                <span className="text-slate-600">$</span>
                <span>9xen-cli audit --region=eu-central</span>
              </div>
              <div className="text-indigo-400">Checking sharded SQLite integrity... [OK]</div>
              <div className="text-indigo-400">Validating PQC keys... [OK]</div>
              <div className="text-slate-500">_</div>
            </div>
            <button className="w-full mt-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors uppercase">
              Launch Terminal
            </button>
          </div>
          <AdminActivityFeedWidget />
        </div>
      </div>
      )}

      </>)}

      {dashboardActiveTab === 'FINANCE_OPS' && (<>
      {/* Global CaaS & B2G Oversight */}
      {moduleVisibility.caasB2gOversight && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <CaaSAddonsManager />

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 dark:bg-rose-950 rounded-lg">
                  <Scale className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Global B2G Sovereign Oversight</h3>
              </div>
              <a 
                href="/system-mgmt/admin-b2g-center"
                className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                ADMIN B2G SUITE →
              </a>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Sandbox Pre-Clearance</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {b2gOversight?.sandbox?.reduce((acc: number, curr: any) => acc + curr.count, 0) || '8'} Total Enclaves
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Pending Statutory Filings</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {b2gOversight?.filings?.find((f: any) => f.status === 'submitted')?.count || '14'} In Queue
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Critical Inquiries & Audits</span>
                <span className="font-bold text-rose-600">
                  {b2gOversight?.inquiries?.find((i: any) => i.priority === 'urgent')?.count || '3'} Active
                </span>
              </div>
              <div className="pt-2">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '94%' }}></div>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block">Regulator Cross-Border Satisfaction: 94.2%</span>
              </div>
            </div>
          </div>

          {/* Quick Launchers for B2G Core Modules */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2">
            <a 
              href="/system-mgmt/admin-b2g-scanner" 
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-center transition-colors group"
            >
              <Globe className="w-3.5 h-3.5 mx-auto mb-1 text-slate-500 group-hover:text-rose-600" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block truncate">National Scanner</span>
            </a>
            <a 
              href="/system-mgmt/admin-b2g-stakeholders" 
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-center transition-colors group"
            >
              <Scale className="w-3.5 h-3.5 mx-auto mb-1 text-slate-500 group-hover:text-rose-600" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block truncate">Stakeholder Matrix</span>
            </a>
            <a 
              href="/system-mgmt/admin-b2g-advanced" 
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-center transition-colors group"
            >
              <Zap className="w-3.5 h-3.5 mx-auto mb-1 text-slate-500 group-hover:text-rose-600" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block truncate">Advanced Suite</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Global CaaS Operations Log */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Global Operations Stream</h3>
              <p className="text-[11px] text-slate-500">Real-time GRC task auditing, enforcement, and direct telemetry</p>
            </div>
          </div>
          <button 
            onClick={handleOpenAddOpModal}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Operation Log
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search operations..."
              value={opsSearchQuery}
              onChange={(e) => setOpsSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 dark:text-white"
            />
          </div>

          <div>
            <select
              value={opsStatusFilter}
              onChange={(e) => setOpsStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <select
              value={opsTypeFilter}
              onChange={(e) => setOpsTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 dark:text-white"
            >
              <option value="ALL">All Operation Types</option>
              {uniqueOpTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="KYC_RE_VERIFICATION">KYC_RE_VERIFICATION</option>
              <option value="AI_ACT_ANNEX_IV_SCAN">AI_ACT_ANNEX_IV_SCAN</option>
              <option value="DORA_ICT_STRESS_TEST">DORA_ICT_STRESS_TEST</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Tenant</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Started At</th>
                <th className="px-6 py-3">Result</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOps.map((op) => (
                <tr key={op.id} className="text-xs hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">
                    <div>{op.tenant_name || op.tenant_id}</div>
                    <span className="text-[9px] text-slate-400 font-mono block">{op.tenant_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono uppercase text-[9px]">{op.operation_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      op.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                      op.status === 'failed' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {op.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{new Date(op.started_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{op.result_summary || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEditOpModal(op)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Log"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOp(op.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOps.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">No operations matched the filters or search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* OPERATIONS CRUD MODAL */}
      <AnimatePresence>
        {isOpsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden text-slate-800 dark:text-slate-100"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {editingOp ? 'Modify Operation Audit Log' : 'Register New GRC Operation Log'}
                </h3>
                <button 
                  onClick={() => setIsOpsModalOpen(false)} 
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-xl transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveOp} className="p-6 space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tenant Select */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Target Tenant *</label>
                    <select
                      value={formOpTenantId}
                      onChange={(e) => setFormOpTenantId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                      required
                    >
                      {tenantsList.length > 0 ? (
                        tenantsList.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                        ))
                      ) : (
                        <>
                          <option value="org_1">Acme Corporation Europe</option>
                          <option value="org_2">Stark Industries GmbH</option>
                          <option value="org_3">Global Finance Corp</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Operation Type */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Operation Type *</label>
                    <select
                      value={formOpType}
                      onChange={(e) => setFormOpType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                      required
                    >
                      <option value="KYC_RE_VERIFICATION">KYC_RE_VERIFICATION</option>
                      <option value="AI_ACT_ANNEX_IV_SCAN">AI_ACT_ANNEX_IV_SCAN</option>
                      <option value="DORA_ICT_STRESS_TEST">DORA_ICT_STRESS_TEST</option>
                      <option value="CSRD_DOUBLE_MATERIALITY_AUDIT">CSRD_DOUBLE_MATERIALITY_AUDIT</option>
                      <option value="NIS2_INCIDENT_TEST">NIS2_INCIDENT_TEST</option>
                      <option value="REGULATORY_REPORT_SUBMISSION">REGULATORY_REPORT_SUBMISSION</option>
                      <option value="COMPLIANCE_AUDIT">COMPLIANCE_AUDIT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Status */}
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Status *</label>
                    <select
                      value={formOpStatus}
                      onChange={(e) => setFormOpStatus(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                      required
                    >
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  {/* Started At */}
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Started At</label>
                    <input
                      type="datetime-local"
                      value={formOpStartedAt}
                      onChange={(e) => setFormOpStartedAt(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Completed At */}
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Completed At</label>
                    <input
                      type="datetime-local"
                      value={formOpCompletedAt}
                      onChange={(e) => setFormOpCompletedAt(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Result Summary */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Audit Findings & Result Summary</label>
                  <textarea
                    rows={3}
                    value={formOpResultSummary}
                    onChange={(e) => setFormOpResultSummary(e.target.value)}
                    placeholder="Provide details about the GRC process evaluation outcome..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}

      {/* Recharts Compliance Risk Heatmap Section */}
      {moduleVisibility.riskHeatmap && (
        <TenantComplianceRiskHeatmap />
      )}

      {/* Infrastructure Nodes & Database Storage Telemetry */}
      {moduleVisibility.infrastructureNodes && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center">
             <Server className="w-5 h-5 mr-2 text-indigo-500" /> Infrastructure Nodes
          </h2>
          <div className="space-y-4 pt-2">
            {[
              { region: 'eu-central-1 (Frankfurt)', status: 'Optimal', load: '45%', tenants: 842 },
              { region: 'eu-west-1 (Ireland)', status: 'Optimal', load: '38%', tenants: 312 },
              { region: 'eu-west-3 (Paris)', status: 'Provisioning', load: '12%', tenants: 94 },
              { region: 'af-south-1 (Cape Town)', status: 'Optimal', load: '22%', tenants: 145 },
              { region: 'me-central-1 (Riyadh)', status: 'Optimal', load: '31%', tenants: 188 }
            ].map((node, i) => (
              <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-slate-300 transition-colors">
                <div>
                   <div className="font-bold text-slate-800 flex items-center">
                     {node.status === 'Optimal' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> : <AlertTriangle className="w-4 h-4 text-amber-500 mr-1.5" />}
                     {node.region}
                   </div>
                   <div className="text-xs text-slate-500 mt-1 font-mono">{node.tenants} Isolated Tenants</div>
                </div>
                <div className="mt-2 sm:mt-0 w-full sm:w-48">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Load</span>
                    <span>{node.load}</span>
                  </div>
                   <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: node.load }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center">
             <Database className="w-5 h-5 mr-2 text-indigo-500" /> Database & Storage Telemetry
          </h2>
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
               <h3 className="font-bold text-emerald-900 mb-2">Primary Ledger Sync</h3>
               <p className="text-sm text-emerald-700 mb-3">Immutable audit logs are actively replicating across 3 available zones.</p>
               <div className="text-xs font-mono font-bold text-emerald-600 bg-emerald-100 w-fit px-2 py-1 rounded">
                 LATENCY: 12ms
               </div>
            </div>
             <div className="p-4 rounded-xl border border-slate-200">
               <h3 className="font-bold text-slate-800 mb-2">Vault Storage (Encrypted at Rest)</h3>
               <div className="flex items-end space-x-2 mb-2">
                 <span className="text-3xl font-black text-slate-900">42.8 TB</span>
                 <span className="text-sm font-semibold text-slate-500 pb-1">/ 100 TB Allocated</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-slate-800 h-3 rounded-full" style={{ width: '42.8%' }}></div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
      )}

      {/* NEW: Platform Integrity & Security Section */}
      {moduleVisibility.platformSecurity && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.35 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-rose-500" /> Advanced Fraud Detection
            </h2>
            <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 px-2 py-1 rounded uppercase">Real-time AI Analysis</span>
          </div>
          <div className="space-y-4">
            {[
              { id: 'FRD-991', type: 'Synthetic ID Attempt', tenant: 'NeoFintech', risk: 'HIGH', status: 'Blocked' },
              { id: 'FRD-992', type: 'Velocity Limit Breach', tenant: 'CryptoEdge', risk: 'MEDIUM', status: 'Challenged' }
            ].map(fraud => (
              <div key={fraud.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{fraud.type}</span>
                  <span className="text-[10px] text-slate-500">Tenant: {fraud.tenant} | ID: {fraud.id}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${fraud.risk === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{fraud.risk}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{fraud.status}</span>
                </div>
              </div>
            ))}
            <button className="w-full py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-all">
              Open Fraud Investigation Console
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <History className="w-5 h-5 mr-2 text-indigo-500" /> Configuration Drift & Health
            </h2>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 px-2 py-1 rounded uppercase">Sync: 100%</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-900/50">
              <div className="flex justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-2">
                <span>Schema Consistency</span>
                <span>99.9%</span>
              </div>
              <div className="w-full bg-indigo-100 dark:bg-indigo-900 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block text-slate-500 mb-1">Untracked Changes</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">0</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block text-slate-500 mb-1">Pending Migrations</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">1</span>
              </div>
            </div>
            <button className="w-full py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Execute Configuration Audit
            </button>
          </div>
        </motion.div>
      </div>
      )}

      {/* NEW: SaaS Financial & Audit Intelligence */}
      {moduleVisibility.financials && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
        {/* Revenue Intelligence */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-emerald-500" /> Revenue & Growth Intelligence
            </h2>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 px-2 py-1 rounded uppercase">ARR: €164M</span>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { date: 'Jan', mrr: 12.5, expansion: 0.2 },
                { date: 'Feb', mrr: 13.1, expansion: 0.5 },
                { date: 'Mar', mrr: 13.7, expansion: 0.3 },
                { date: 'Apr', mrr: 14.2, expansion: 0.8 },
                { date: 'May', mrr: 15.1, expansion: 1.1 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="mrr" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Area type="monotone" dataKey="expansion" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Churn</span>
              <span className="text-sm font-black text-rose-600">2.1%</span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">LTV</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">€92K</span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">CAC</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">€4.1K</span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">NRR</span>
              <span className="text-sm font-black text-emerald-600">114%</span>
            </div>
          </div>
        </motion.div>

        {/* Automated Self-Audit */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-indigo-500" /> Automated Self-Audit
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Database RLS Status', result: 'PASS', time: '2m ago' },
              { label: 'Cloud IAM Policy Audit', result: 'PASS', time: '1h ago' },
              { label: 'TLS 1.3 Compliance', result: 'PASS', time: '4h ago' },
              { label: 'SOC2 Trust Principles', result: 'DRIFT', time: 'Now' }
            ].map(audit => (
              <div key={audit.label} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{audit.label}</span>
                  <span className="text-[9px] text-slate-400">{audit.time}</span>
                </div>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${audit.result === 'PASS' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700 animate-pulse'}`}>
                  {audit.result}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Force Global Reconciliation
          </button>
        </motion.div>
      </div>
      )}

      {/* Regulatory News & Compliance Timeline Section */}
      {moduleVisibility.newsAndTimeline && (
        <>
          <div className="mb-6">
            <ComplianceDailyNewsFetcher />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <RegulatoryNewsFeed />
            <ComplianceTimeline />
            <NotificationSettings />
          </div>
        </>
      )}

      </>)}

      {dashboardActiveTab === 'AUDIT_SECURITY' && (<>
      {/* System Operations & Audit Trail Section */}
      {moduleVisibility.systemAuditLogs && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        >
          <AdminActivityFeedWidget maxHeight="h-[460px]" />
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5 lg:p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
                <History className="w-5 h-5 mr-2 text-indigo-500" /> Recent System Operations
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Immutable Chain</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <AuditTrail className="max-h-[380px]" />
            </div>
          </div>
        </motion.div>
      )}


      </>)}

      {dashboardActiveTab === 'REGULATORY_LAW' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mt-6"
        >
          <RegulatoryLawManager />
        </motion.div>
      )}
    </div>
  );
};

export const AdminDashboard = PlatformDashboard;
export default PlatformDashboard;
