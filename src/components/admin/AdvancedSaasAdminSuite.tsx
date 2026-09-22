import React, { useState, useEffect } from 'react';
import {
  Shield, Server, HardDrive, Cpu, DollarSign, Activity, AlertOctagon,
  RefreshCw, CheckCircle, AlertTriangle, Key, Trash2, Zap, Lock,
  FileCheck, ShieldAlert, Sliders, ArrowUpRight, TrendingUp,
  Download, Globe, Clock, Sparkles, Send, Check, X, ShieldCheck, UserX, Database,
  Users, BarChart2, Settings,
  Scale, Landmark, KeySquare, FlaskConical
} from 'lucide-react';
import { RateLimitingControlCenter } from './RateLimitingControlCenter';
import { UserRoleManagementTable } from './UserRoleManagementTable';
import { SlaMonitoringDashboard } from './SlaMonitoringDashboard';
import { McpConnectorHub } from './McpConnectorHub';
import { EnterpriseSsoProvisioner } from './EnterpriseSsoProvisioner';

interface TenantEntitlement {
  tenantId: string;
  tenantName: string;
  tier: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'QUARANTINED';
  maxSeats: number;
  currentSeats: number;
  apiRateLimitRpm: number;
  storageQuotaGb: number;
  storageUsedGb: number;
  monthlyLlmTokensBudget: number;
  monthlyLlmTokensUsed: number;
  evidenceRetentionDays: number;
  activeFrameworks: string[];
  featureGates: {
    realTimeDlp: boolean;
    autoScraper: boolean;
    byokEncryption: boolean;
    multiRegionSovereign: boolean;
    gaiaxBridge: boolean;
    forensicLineage: boolean;
    automatedAuditReports: boolean;
  };
  activeBoost?: {
    type: string;
    bonusTokens: number;
    bonusStorageGb: number;
    reason: string;
    expiresAt: string;
  } | null;
  updatedAt: string;
}

interface EnclaveSovereigntyInfo {
  tenantId: string;
  tenantName: string;
  primaryRegion: string;
  enclaveType: string;
  hsmKeyId: string;
  hsmProvider: string;
  keyRotationDays: number;
  lastRotatedAt: string;
  envelopeEncryptionStatus: string;
  schemaIsolationStatus: string;
  dataResidencyCertId: string;
  complianceAttestation: string;
}

interface LiveSessionRecord {
  sessionId: string;
  userId: string;
  userEmail: string;
  tenantId: string;
  tenantName: string;
  role: string;
  ipAddress: string;
  location: string;
  countryCode: string;
  clientAgent: string;
  startedAt: string;
  lastActiveAt: string;
  riskScore: number;
  riskFlags: string[];
  isMfaVerified: boolean;
}

interface TenantUnitEconomics {
  tenantId: string;
  tenantName: string;
  tier: string;
  mrrUsd: number;
  arrUsd: number;
  cogsBreakdown: {
    llmInferenceCostUsd: number;
    vectorStorageCostUsd: number;
    computeWorkerCostUsd: number;
    networkTransferCostUsd: number;
    totalCogsUsd: number;
  };
  grossProfitUsd: number;
  grossMarginPct: number;
  llmTokensUsed: number;
  storageUsedGb: number;
  overageFeesUsd: number;
  churnRiskScore: number;
  profitabilityStatus: 'HIGH_MARGIN' | 'HEALTHY' | 'MARGIN_SQUEEZE' | 'UNPROFITABLE';
}

interface BackupSnapshot {
  snapshotId: string;
  tenantId: string;
  tenantName: string;
  region: string;
  sizeMb: number;
  sha256Hash: string;
  snapshotType: string;
  status: string;
  createdAt: string;
  retentionUntil: string;
}

export const AdvancedSaasAdminSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'sla_monitoring' | 'entitlements' | 'sovereignty' | 'sessions' | 'rate_limiting' | 'economics' | 'backups' | 'usage_analytics' | 'platform' | 'cases' | 'regulatory' | 'api_keys' | 'dr_drills' | 'mcp_hub' | 'enterprise_sso'>('users');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data states
  const [entitlements, setEntitlements] = useState<TenantEntitlement[]>([]);
  const [sovereigntyMatrix, setSovereigntyMatrix] = useState<EnclaveSovereigntyInfo[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSessionRecord[]>([]);
  const [economicsData, setEconomicsData] = useState<{
    summary: { totalMrrUsd: number; totalCogsUsd: number; overallGrossMarginPct: number; activeTenantsCount: number };
    tenants: TenantUnitEconomics[];
  } | null>(null);
  const [backups, setBackups] = useState<BackupSnapshot[]>([]);
  const [usageAnalytics, setUsageAnalytics] = useState<{
    summary: { totalTenants: number; totalScans: number; totalActiveModules: number; domainsScanned: number; adminAuditEvents: number; avgRiskScore: number };
    byComplianceProfile: { profile: string; scans: number }[];
    dailyTrend: { date: string; scans: number }[];
    tenantUsage: { tenantId: string; tenantName: string; status: string; activeModules: number; lockedModules: number; scanCount: number; avgRiskScore: number; regions: string[] }[];
  } | null>(null);
  const [featureFlags, setFeatureFlags] = useState<{
    flag_key: string; flag_name: string; flag_description: string; enabled: number; category: string; rollout_percentage: number; target_tenant_ids: string; last_modified_by: string; last_modified_at: string;
  }[]>([]);
  const [healthScores, setHealthScores] = useState<{
    summary: { totalTenants: number; healthy: number; needsAttention: number; atRisk: number; critical: number; avgHealthScore: number };
    scores: { tenantId: string; tenantName: string; tenantStatus: string; healthScore: number; tier: string; components: Record<string, number>; recentScanCount: number; avgRiskScore: number; activeEntitlements: number; totalEntitlements: number; recommendation: string }[];
  } | null>(null);
  const [deploymentVersions, setDeploymentVersions] = useState<{
    currentVersion: string;
    versions: { version: string; deployedAt: string; deployedBy: string; status: string; risk: string; features: string }[];
    deploymentHistory: { action: string; details: string; performedBy: string; timestamp: string }[];
  } | null>(null);
  const [rollbackModal, setRollbackModal] = useState<{ version: string } | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [wbReports, setWbReports] = useState<{
    summary: { totalReports: number; openCases: number; resolved: number; criticalPriority: number; categories: string[]; priorities: string[] };
    byCategory: { category: string; count: number }[];
    byStatus: { status: string; count: number }[];
    reports: { id: string; report_ref: string; timestamp: string; category: string; title: string; description: string; priority: string; status: string; anonymous_key: string; tenant_id: string | null }[];
  } | null>(null);
  const [watchlist, setWatchlist] = useState<{
    summary: { totalEntries: number; countries: number; highRisk: number; severeRisk: number; mediumRisk: number };
    byCountry: { country: string; count: number }[];
    entries: { id: number; name: string; type: string; country: string; risk_score: string; citation: string | null; associated_orgs: string | null; last_updated: string }[];
  } | null>(null);
  const [regulatoryRadar, setRegulatoryRadar] = useState<{
    summary: { legalUpdates: number; activeLaws: number; countriesTracked: number; frameworks: number; auditEvents: number; unsyncedUpdates: number };
    byChangeType: { change_type: string; count: number }[];
    byLaw: { law: string; updates: number }[];
    auditByTenant: { tenant_id: string; events: number }[];
    legalUpdates: { id: number; timestamp: string; law: string; title: string; summary: string; change_type: string; is_synced: boolean }[];
    countryLaws: { id: string; country_code: string; law_name: string; law_code: string; description: string | null; is_active: number }[];
    countries: { country_code: string; name: string; is_active: number }[];
    frameworks: { id: number; code: string; version: string; name: string; description: string | null; is_active: number }[];
  } | null>(null);
  const [apiKeys, setApiKeys] = useState<{
    summary: { total: number; active: number; revoked: number; lastUsed7d: number };
    tokens: { id: number; name: string; clientSystem: string; scope: string; status: string; customServices: string[]; createdAt: string; lastUsedAt: string | null; keyPreview: string }[];
  } | null>(null);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newApiKeyScope, setNewApiKeyScope] = useState('read');
  const [provisionedKey, setProvisionedKey] = useState<string | null>(null);
  const [drDrills, setDrDrills] = useState<{
    summary: { total: number; completed: number; scheduled: number; avgRpoCompliance: number; lastDrillAt: string | null; avgRestoreTimeMin: number };
    drills: { id: string; name: string; type: string; region: string; status: string; executedAt: string; rpoBreached: boolean; restoredSets: number; durationMinutes: number }[];
    timeline: { id: string; name: string; date: string; status: string }[];
  } | null>(null);
  const [drDrillModal, setDrDrillModal] = useState(false);
  const [drDrillName, setDrDrillName] = useState('');
  const [drDrillType, setDrDrillType] = useState('RPO_1HR');
  const [drDrillRegion, setDrDrillRegion] = useState('EU-WEST-1');

  // Modals & form states
  const [editingTenant, setEditingTenant] = useState<TenantEntitlement | null>(null);
  const [boostingTenant, setBoostingTenant] = useState<TenantEntitlement | null>(null);
  const [boostTokens, setBoostTokens] = useState(5000000);
  const [boostStorage, setBoostStorage] = useState(50);
  const [boostReason, setBoostReason] = useState('Quarterly Audit Preparation Surge');
  const [boostDurationDays, setBoostDurationDays] = useState(14);

  // Shred modal
  const [shredTenantId, setShredTenantId] = useState<string | null>(null);
  const [shredConfirmCode, setShredConfirmCode] = useState('');
  const [shredResultCert, setShredResultCert] = useState<any | null>(null);

  // Migration simulation modal
  const [migratingTenant, setMigratingTenant] = useState<string | null>(null);
  const [migrationTargetRegion, setMigrationTargetRegion] = useState('EU-WEST-1 (Zurich)');
  const [migrationStep, setMigrationStep] = useState<number | null>(null);

  // Isolation test status
  const [isolationScanRunning, setIsolationScanRunning] = useState(false);
  const [isolationScanResult, setIsolationScanResult] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resEnt, resSov, resSess, resEcon, resBackups, resUsage, resFlags, resHealth, resDeploy, resWb, resWatch, resReg, resKeys, resDr] = await Promise.all([
        fetch('/api/v1/saas-admin/entitlements'),
        fetch('/api/v1/saas-admin/sovereignty/matrix'),
        fetch('/api/v1/saas-admin/sessions/live'),
        fetch('/api/v1/saas-admin/telemetry/unit-economics'),
        fetch('/api/v1/saas-admin/backups'),
        fetch('/api/v1/saas-admin/usage-analytics'),
        fetch('/api/v1/saas-admin/feature-flags'),
        fetch('/api/v1/saas-admin/health-scores'),
        fetch('/api/v1/saas-admin/deployment/versions'),
        fetch('/api/v1/saas-admin/whistleblower/reports'),
        fetch('/api/v1/saas-admin/sanctions/watchlist'),
        fetch('/api/v1/saas-admin/regulatory/radar'),
        fetch('/api/v1/saas-admin/api-keys'),
        fetch('/api/v1/saas-admin/dr/drills'),
      ]);

      if (resEnt.ok) {
        const d = await resEnt.json();
        if (d.success) setEntitlements(d.data || []);
      }
      if (resSov.ok) {
        const d = await resSov.json();
        if (d.success) setSovereigntyMatrix(d.data || []);
      }
      if (resSess.ok) {
        const d = await resSess.json();
        if (d.success) setLiveSessions(d.data || []);
      }
      if (resEcon.ok) {
        const d = await resEcon.json();
        if (d.success) setEconomicsData(d);
      }
      if (resBackups.ok) {
        const d = await resBackups.json();
        if (d.success) setBackups(d.data || []);
      }
      if (resUsage.ok) {
        const d = await resUsage.json();
        if (d.success) setUsageAnalytics(d);
      }
      if (resFlags.ok) {
        const d = await resFlags.json();
        if (d.success) setFeatureFlags(d.data || []);
      }
      if (resHealth.ok) {
        const d = await resHealth.json();
        if (d.success) setHealthScores(d);
      }
      if (resDeploy.ok) {
        const d = await resDeploy.json();
        if (d.success) setDeploymentVersions(d);
      }
      if (resWb.ok) {
        const d = await resWb.json();
        if (d.success) setWbReports(d);
      }
      if (resWatch.ok) {
        const d = await resWatch.json();
        if (d.success) setWatchlist(d);
      }
      if (resReg.ok) {
        const d = await resReg.json();
        if (d.success) setRegulatoryRadar(d);
      }
      if (resKeys.ok) {
        const d = await resKeys.json();
        if (d.success) setApiKeys(d);
      }
      if (resDr.ok) {
        const d = await resDr.json();
        if (d.success) setDrDrills(d);
      }
    } catch (e: any) {
      console.error('Failed to load SaaS Admin data:', e);
      showToast('Failed to fetch SaaS admin state: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Action Handlers
  const handleSaveEntitlements = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    try {
      const res = await fetch(`/api/v1/saas-admin/entitlements/${editingTenant.tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTenant),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`Tenant ${editingTenant.tenantName} quotas and feature gates updated.`);
        setEditingTenant(null);
        fetchAllData();
      } else {
        showToast(d.error || 'Failed to update', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleApplyBoost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boostingTenant) return;

    try {
      const res = await fetch(`/api/v1/saas-admin/entitlements/${boostingTenant.tenantId}/boost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'AUDIT_SURGE_BOOST',
          bonusTokens: boostTokens,
          bonusStorageGb: boostStorage,
          reason: boostReason,
          durationDays: boostDurationDays,
        }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`Temporary quota boost applied to ${boostingTenant.tenantName}.`);
        setBoostingTenant(null);
        fetchAllData();
      } else {
        showToast(d.error || 'Failed to apply boost', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRotateKey = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/v1/saas-admin/sovereignty/${tenantId}/rotate-key`, { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        showToast(`HSM Key successfully rotated: ${d.newKeyId}`);
        fetchAllData();
      } else {
        showToast(d.error, 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleExecuteShred = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shredTenantId) return;

    try {
      const res = await fetch(`/api/v1/saas-admin/sovereignty/${shredTenantId}/shred`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationCode: shredConfirmCode,
          authorizedAdmin: 'SUPER_ADMIN_LEAD',
        }),
      });
      const d = await res.json();
      if (d.success) {
        setShredResultCert(d.certificate);
        showToast(`Cryptographic shredding completed for ${shredTenantId}.`);
        fetchAllData();
      } else {
        showToast(d.error, 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/v1/saas-admin/sessions/${sessionId}/terminate`, { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        showToast(d.message);
        fetchAllData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleQuarantine = async (tenantId: string, currentStatus: string) => {
    const enableQuarantine = currentStatus !== 'QUARANTINED';
    const reason = enableQuarantine ? 'Emergency forensic threat mitigation' : 'Threat cleared by sec ops';

    try {
      const res = await fetch(`/api/v1/saas-admin/tenants/${tenantId}/quarantine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enableQuarantine, reason }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(d.message);
        fetchAllData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleForceMfa = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/v1/saas-admin/tenants/${tenantId}/force-mfa`, { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        showToast(d.message);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDispatchOverage = async (tenantId: string, amount: number) => {
    try {
      const res = await fetch('/api/v1/saas-admin/telemetry/bill-overage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          overageAmountUsd: amount,
          reason: 'Excess AI LLM token usage over standard monthly allotment',
        }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`Overage invoice ${d.invoiceId} dispatched via Stripe.`);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateSnapshot = async (tenantId: string) => {
    try {
      const res = await fetch('/api/v1/saas-admin/backups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, snapshotType: 'MANUAL_ADMIN' }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`Snapshot ${d.data.snapshotId} generated with SHA-256 seal.`);
        fetchAllData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    try {
      const res = await fetch(`/api/v1/saas-admin/backups/${snapshotId}/restore`, { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        showToast(`Restore from ${snapshotId} completed: ${d.restoreId || d.message}`);
        fetchAllData();
      } else {
        showToast(d.error || 'Restore failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handlePurgeSnapshot = async (snapshotId: string) => {
    if (!window.confirm(`Purge snapshot ${snapshotId} per retention policy? This tombstones the secondary copy.`)) return;
    try {
      const res = await fetch(`/api/v1/saas-admin/backups/${snapshotId}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) {
        showToast(d.message);
        fetchAllData();
      } else {
        showToast(d.error || 'Purge failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleFlag = async (key: string, enabled: number) => {
    try {
      const res = await fetch(`/api/v1/saas-admin/feature-flags/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled, modifiedBy: 'SUPER_ADMIN' }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`Feature flag ${key} ${!enabled ? 'ENABLED' : 'DISABLED'}`);
        setFeatureFlags(prev => prev.map(f => f.flag_key === key ? { ...f, enabled: !enabled ? 1 : 0, last_modified_at: new Date().toISOString() } : f));
      } else {
        showToast(d.error || 'Failed to update flag', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateRollout = async (key: string, rollout_percentage: number) => {
    try {
      const res = await fetch(`/api/v1/saas-admin/feature-flags/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollout_percentage, modifiedBy: 'SUPER_ADMIN' }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`Rollout for ${key} set to ${rollout_percentage}%`);
        setFeatureFlags(prev => prev.map(f => f.flag_key === key ? { ...f, rollout_percentage } : f));
      } else {
        showToast(d.error || 'Failed to update rollout', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateCaseStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/saas-admin/whistleblower/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedTo: 'SUPER_ADMIN' }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`Case ${id.slice(0, 8)}... marked ${status}`);
        setWbReports(prev => prev ? { ...prev, reports: prev.reports.map(r => r.id === id ? { ...r, status } : r) } : prev);
      } else {
        showToast(d.error || 'Failed to update case', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveWatchlist = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/saas-admin/sanctions/watchlist/${id}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) {
        showToast('Watchlist entry removed');
        setWatchlist(prev => prev ? { ...prev, entries: prev.entries.filter(e => e.id !== id), summary: { ...prev.summary, totalEntries: prev.summary.totalEntries - 1 } } : prev);
      } else {
        showToast(d.error || 'Failed to remove entry', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSyncLegalUpdate = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/saas-admin/regulatory/radar/sync/${id}`, { method: 'PATCH' });
      const d = await res.json();
      if (d.success) {
        showToast(`Legal update ${id} marked as synced`);
        setRegulatoryRadar(prev => prev ? {
          ...prev,
          summary: { ...prev.summary, unsyncedUpdates: Math.max(0, prev.summary.unsyncedUpdates - 1) },
          legalUpdates: prev.legalUpdates.map(u => u.id === id ? { ...u, is_synced: true } : u)
        } : prev);
      } else {
        showToast(d.error || 'Failed to sync update', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleProvisionApiKey = async () => {
    if (!newApiKeyName.trim()) {
      showToast('Enter a name for the API key', 'error');
      return;
    }
    try {
      const res = await fetch('/api/v1/saas-admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newApiKeyName.trim(), client_system: 'SUPER_ADMIN', scope: newApiKeyScope }),
      });
      const d = await res.json();
      if (d.success) {
        setProvisionedKey(d.token);
        setNewApiKeyName('');
        fetchAllData();
      } else {
        showToast(d.error || 'Failed to provision key', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRotateApiKey = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/saas-admin/api-keys/${id}/rotate`, { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        showToast(`API key ${id} rotated`);
        setProvisionedKey(d.token);
      } else {
        showToast(d.error || 'Failed to rotate key', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRevokeApiKey = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/saas-admin/api-keys/${id}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) {
        showToast(`API key ${id} revoked`);
        setApiKeys(prev => prev ? {
          ...prev,
          summary: { ...prev.summary, revoked: prev.summary.revoked + 1, active: Math.max(0, prev.summary.active - 1) },
          tokens: prev.tokens.map(t => t.id === id ? { ...t, status: 'REVOKED' } : t)
        } : prev);
      } else {
        showToast(d.error || 'Failed to revoke key', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleScheduleDrDrill = async () => {
    if (!drDrillName.trim()) {
      showToast('Enter a drill name', 'error');
      return;
    }
    try {
      const res = await fetch('/api/v1/saas-admin/dr/drills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: drDrillName.trim(), type: drDrillType, region: drDrillRegion }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`DR drill ${drDrillName} scheduled`);
        setDrDrillModal(false);
        setDrDrillName('');
        fetchAllData();
      } else {
        showToast(d.error || 'Failed to schedule drill', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRunDrDrill = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/saas-admin/dr/drills/${id}/run`, { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        showToast(d.rpoBreached ? `Rolling backup RPO breached during ${d.drill.name}` : `${d.drill.name} executed within RPO`);
        fetchAllData();
      } else {
        showToast(d.error || 'Failed to execute drill', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeployRollback = async () => {
    if (!rollbackModal) return;
    try {
      const res = await fetch('/api/v1/saas-admin/deployment/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetVersion: rollbackModal.version, reason: rollbackReason || 'Manual intervention by SUPER_ADMIN', initiatedBy: 'SUPER_ADMIN' }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`Rollback to ${rollbackModal.version} initiated (${d.rollbackId})`);
        setRollbackModal(null);
        setRollbackReason('');
      } else {
        showToast(d.error || 'Rollback failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRunIsolationScan = async () => {
    setIsolationScanRunning(true);
    setIsolationScanResult(null);
    try {
      const res = await fetch('/api/v1/saas-admin/sovereignty/isolation/verify', { method: 'POST' });
      const d = await res.json();
      setIsolationScanRunning(false);
      if (d.success) setIsolationScanResult(d.result);
      else setIsolationScanResult(d.error || 'Isolation verification failed');
    } catch (err: any) {
      setIsolationScanRunning(false);
      setIsolationScanResult(err.message || 'Isolation verification failed');
    }
  };

  const handleStartMigration = async (tenantId: string) => {
    setMigratingTenant(tenantId);
    setMigrationStep(1);
    try {
      const res = await fetch(`/api/v1/saas-admin/sovereignty/${tenantId}/migrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRegion: migrationTargetRegion, initiatedBy: 'SEC_OFFICER' }),
      });
      const d = await res.json();
      if (d.success) {
        setMigrationStep(4);
        showToast(`Tenant ${tenantId} successfully migrated to ${migrationTargetRegion} (${d.migrationId}).`);
        await new Promise(r => setTimeout(r, 500));
        setMigratingTenant(null);
        setMigrationStep(null);
        fetchAllData();
      } else {
        setMigratingTenant(null);
        setMigrationStep(null);
        showToast(d.error || 'Migration failed', 'error');
      }
    } catch (err: any) {
      setMigratingTenant(null);
      setMigrationStep(null);
      showToast(err.message || 'Migration failed', 'error');
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-xl border animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
            : 'bg-rose-950/90 border-rose-700 text-rose-200'
        }`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Stats Banner */}
      {economicsData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Platform MRR / ARR</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-white font-mono">
                ${economicsData.summary.totalMrrUsd.toLocaleString()}
                <span className="text-xs text-slate-500 font-sans ml-1">/ mo</span>
              </div>
              <p className="text-xs text-emerald-400 font-mono mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>${(economicsData.summary.totalMrrUsd * 12).toLocaleString()} Run-Rate ARR</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Gross Margin %</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-cyan-400 font-mono">
                {economicsData.summary.overallGrossMarginPct}%
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                COGS: ${economicsData.summary.totalCogsUsd.toLocaleString()} (AI + DB Compute)
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Active Tenants & Enclaves</span>
              <Globe className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-white font-mono">
                {economicsData.summary.activeTenantsCount}
                <span className="text-xs text-emerald-400 ml-2 font-sans font-bold">100% Isolated</span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                4 Sovereign Enclave Regions Active
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Live Threat Status</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-emerald-400 font-mono flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span>Zero Breach</span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {liveSessions.length} Active Sessions ({liveSessions.filter(s => s.riskScore > 50).length} Flagged)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        {[
          { id: 'users', label: 'User Roles & Permissions', icon: Users },
          { id: 'sla_monitoring', label: 'SLA Monitoring & Deadlines', icon: Clock },
          { id: 'entitlements', label: 'Tenant Entitlements & Quotas', icon: Sliders },
          { id: 'sovereignty', label: 'Data Sovereignty & Enclave HSM', icon: Key },
          { id: 'sessions', label: 'Live Sessions & Threat Quarantine', icon: Activity },
          { id: 'rate_limiting', label: 'API Rate Limiting & Anti-Brute-Force', icon: ShieldAlert },
          { id: 'economics', label: 'Unit Economics & COGS Margin', icon: DollarSign },
          { id: 'backups', label: 'Disaster Recovery & PITR Snapshots', icon: HardDrive },
          { id: 'usage_analytics', label: 'Usage Analytics & Quota Telemetry', icon: BarChart2 },
          { id: 'platform', label: 'Feature Flags & Platform Release', icon: Settings },
          { id: 'cases', label: 'Cases & Sanctions Watchlist', icon: Scale },
          { id: 'regulatory', label: 'Regulatory Intelligence Radar', icon: Landmark },
          { id: 'api_keys', label: 'API Keys & Token Governance', icon: KeySquare },
          { id: 'dr_drills', label: 'DR Drill Scheduler', icon: FlaskConical },
          { id: 'mcp_hub', label: 'MCP Connector Hub', icon: Server },
          { id: 'enterprise_sso', label: 'Enterprise SSO (AI-SSO)', icon: Lock },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}

        <button
          onClick={fetchAllData}
          className="ml-auto p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          title="Refresh All Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* TAB 0: USER ROLES & PERMISSIONS */}
      {activeTab === 'users' && (
        <UserRoleManagementTable />
      )}

      {/* TAB 0.5: SLA MONITORING & DEADLINES */}
      {activeTab === 'sla_monitoring' && (
        <SlaMonitoringDashboard />
      )}

      {/* TAB 1: ENTITLEMENTS & QUOTAS */}
      {activeTab === 'entitlements' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <span>Multi-Tenant Resource Entitlement & Quota Governor</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure compute limits, storage allocations, monthly LLM AI token budgets, active regulatory frameworks, and feature gates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {entitlements.map(t => {
              const storagePct = Math.min(100, Math.round((t.storageUsedGb / t.storageQuotaGb) * 100));
              const tokenPct = Math.min(100, Math.round((t.monthlyLlmTokensUsed / t.monthlyLlmTokensBudget) * 100));

              return (
                <div key={t.tenantId} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">{t.tenantName}</h4>
                        <span className="text-xs font-mono text-slate-400">({t.tenantId})</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : t.status === 'QUARANTINED'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-300 font-mono mt-0.5">Tier: {t.tier} • {t.currentSeats}/{t.maxSeats} Seats Occupied</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBoostingTenant(t)}
                        className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-700/60 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Quota Surge Boost</span>
                      </button>
                      <button
                        onClick={() => setEditingTenant(t)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                      >
                        Edit Limits & Gates
                      </button>
                    </div>
                  </div>

                  {/* Active Quota Boost Alert */}
                  {t.activeBoost && (
                    <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-center justify-between text-xs text-amber-300">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>
                          <strong>{t.activeBoost.type}:</strong> +{(t.activeBoost.bonusTokens / 1000000).toFixed(1)}M Tokens, +{t.activeBoost.bonusStorageGb}GB Storage active ({t.activeBoost.reason}).
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400/80">Expires {new Date(t.activeBoost.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Resource Gauges */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Storage */}
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between text-xs text-slate-400 font-mono mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                          Storage ({t.storageUsedGb.toFixed(1)} / {t.storageQuotaGb} GB)
                        </span>
                        <span className="font-bold text-white">{storagePct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            storagePct > 90 ? 'bg-rose-500' : storagePct > 75 ? 'bg-amber-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${storagePct}%` }}
                        />
                      </div>
                    </div>

                    {/* LLM Tokens */}
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between text-xs text-slate-400 font-mono mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-purple-400" />
                          LLM AI Tokens ({(t.monthlyLlmTokensUsed / 1000000).toFixed(2)}M / {(t.monthlyLlmTokensBudget / 1000000).toFixed(1)}M)
                        </span>
                        <span className="font-bold text-white">{tokenPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            tokenPct > 90 ? 'bg-rose-500' : tokenPct > 75 ? 'bg-amber-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${tokenPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Rate Limits & Retention */}
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">API Rate Limit</span>
                        <span className="font-bold text-white">{t.apiRateLimitRpm} RPM</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Vault Retention</span>
                        <span className="font-bold text-white">{t.evidenceRetentionDays} Days</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Frameworks & Feature Gates Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-500 font-mono text-[11px] mr-1">Frameworks:</span>
                      {t.activeFrameworks.map(f => (
                        <span key={f} className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/80 text-indigo-300 font-mono text-[10px]">
                          {f}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span className={`flex items-center gap-1 ${t.featureGates.realTimeDlp ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {t.featureGates.realTimeDlp ? '✓' : '✗'} DLP Guard
                      </span>
                      <span className={`flex items-center gap-1 ${t.featureGates.byokEncryption ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {t.featureGates.byokEncryption ? '✓' : '✗'} BYOK KMS
                      </span>
                      <span className={`flex items-center gap-1 ${t.featureGates.gaiaxBridge ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {t.featureGates.gaiaxBridge ? '✓' : '✗'} Gaia-X Sovereign Bridge
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DATA SOVEREIGNTY & ENCLAVE HSM */}
      {activeTab === 'sovereignty' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <span>Cryptographic Enclave Sovereignty & Data Isolation Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify hardware security module (HSM) envelope encryption, automated key rotation schedules, cross-tenant database isolation, and NIST SP 800-88 cryptographic shredding.
              </p>
            </div>

            <button
              onClick={handleRunIsolationScan}
              disabled={isolationScanRunning}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldCheck className={`w-4 h-4 ${isolationScanRunning ? 'animate-spin' : ''}`} />
              <span>{isolationScanRunning ? 'Scanning Isolation...' : 'Run Isolation Verification'}</span>
            </button>
          </div>

          {isolationScanResult && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-700 rounded-2xl text-xs text-emerald-300 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{isolationScanResult}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sovereigntyMatrix.map(s => (
              <div key={s.tenantId} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-base">{s.tenantName}</h4>
                    <p className="text-xs text-indigo-400 font-mono mt-0.5">{s.primaryRegion}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[10px] font-bold">
                    {s.enclaveType}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950/50">
                    <span className="text-slate-400">HSM Key ID:</span>
                    <span className="text-emerald-400 font-bold">{s.hsmKeyId}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950/50">
                    <span className="text-slate-400">HSM Provider:</span>
                    <span className="text-white">{s.hsmProvider}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950/50">
                    <span className="text-slate-400">Envelope Status:</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <Lock className="w-3 h-3" /> {s.envelopeEncryptionStatus}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950/50">
                    <span className="text-slate-400">Residency Cert:</span>
                    <span className="text-indigo-300">{s.dataResidencyCertId}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  <strong>Attestation:</strong> {s.complianceAttestation}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleRotateKey(s.tenantId)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Rotate Key</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartMigration(s.tenantId)}
                      className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                    >
                      Cross-Region Migrate
                    </button>
                    <button
                      onClick={() => {
                        setShredTenantId(s.tenantId);
                        setShredConfirmCode('');
                        setShredResultCert(null);
                      }}
                      className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Shred (NIST SP 800-88)</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE SESSIONS & REAL-TIME THREAT QUARANTINE */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <span>Live Administrative & User Session Monitor</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time active edge sessions with Geo-IP ASN detection, anomaly risk scores, and one-click quarantine locks.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="p-3.5 font-semibold">User / Email</th>
                    <th className="p-3.5 font-semibold">Tenant</th>
                    <th className="p-3.5 font-semibold">IP & Location</th>
                    <th className="p-3.5 font-semibold">Client Agent</th>
                    <th className="p-3.5 font-semibold">Risk Score</th>
                    <th className="p-3.5 font-semibold text-right">Emergency Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {liveSessions.map(s => (
                    <tr key={s.sessionId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{s.userEmail}</div>
                        <div className="text-[10px] text-indigo-400">{s.role} • MFA: {s.isMfaVerified ? '✓ Verified' : '✗ Unenforced'}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-300 font-semibold">{s.tenantName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{s.tenantId}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-cyan-300 font-bold">{s.ipAddress}</div>
                        <div className="text-[10px] text-slate-400">{s.location}</div>
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px] truncate max-w-[180px]" title={s.clientAgent}>
                        {s.clientAgent}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.riskScore > 50
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          Risk {s.riskScore}/100 {s.riskFlags.length > 0 ? `(${s.riskFlags[0]})` : ''}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleTerminateSession(s.sessionId)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Kill Session
                        </button>
                        <button
                          onClick={() => handleForceMfa(s.tenantId)}
                          className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800/80 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Force MFA
                        </button>
                        {((s as any).tenantQuarantineStatus === 'QUARANTINED') ? (
                          <button
                            onClick={() => handleToggleQuarantine(s.tenantId, 'QUARANTINED')}
                            className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Release
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleQuarantine(s.tenantId, (s as any).tenantQuarantineStatus || 'ACTIVE')}
                            className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Quarantine Tenant
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CENTRALIZED API RATE LIMITING & ANTI-BRUTE-FORCE */}
      {activeTab === 'rate_limiting' && (
        <RateLimitingControlCenter />
      )}

      {/* TAB 4: UNIT ECONOMICS & MARGIN TELEMETRY */}
      {activeTab === 'economics' && economicsData && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>SaaS Financial Unit Economics & Profitability Analyzer</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculate live gross margins per enterprise account by subtracting LLM AI API costs and database compute from recurring subscription revenues.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {economicsData.tenants.map(t => (
              <div key={t.tenantId} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-base">{t.tenantName}</h4>
                    <p className="text-xs text-slate-400 font-mono">{t.tier} • Churn Risk: {t.churnRiskScore}%</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                      t.profitabilityStatus === 'HIGH_MARGIN'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {t.grossMarginPct}% Gross Margin
                    </span>
                    {t.overageFeesUsd > 0 && (
                      <button
                        onClick={() => handleDispatchOverage(t.tenantId, t.overageFeesUsd)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Bill Overage (${t.overageFeesUsd})</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Monthly Revenue</span>
                    <span className="text-emerald-400 font-bold text-sm">${t.mrrUsd.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Total COGS Spend</span>
                    <span className="text-rose-400 font-bold text-sm">${t.cogsBreakdown.totalCogsUsd.toFixed(2)}</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">AI Inference Cost</span>
                    <span className="text-purple-400 font-bold text-sm">${t.cogsBreakdown.llmInferenceCostUsd.toFixed(2)}</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Net Gross Profit</span>
                    <span className="text-cyan-400 font-bold text-sm">${t.grossProfitUsd.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DISASTER RECOVERY & BACKUPS */}
      {activeTab === 'backups' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-indigo-400" />
                <span>Disaster Recovery & Point-in-Time (PITR) Snapshot Ledger</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographically signed backups with SHA-256 integrity proofs and automated cross-region replication schedules.
              </p>
            </div>

            <button
              onClick={() => handleCreateSnapshot(entitlements[0]?.tenantId || 'org_1')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-colors cursor-pointer"
            >
              <HardDrive className="w-4 h-4" />
              <span>Create Instant Snapshot</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="p-3.5 font-semibold">Snapshot ID</th>
                    <th className="p-3.5 font-semibold">Tenant</th>
                    <th className="p-3.5 font-semibold">Region</th>
                    <th className="p-3.5 font-semibold">Size</th>
                    <th className="p-3.5 font-semibold">SHA-256 Seal</th>
                    <th className="p-3.5 font-semibold">Created</th>
                    <th className="p-3.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {backups.map(b => (
                    <tr key={b.snapshotId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 text-indigo-400 font-bold">{b.snapshotId}</td>
                      <td className="p-3.5 text-white font-medium">{b.tenantName}</td>
                      <td className="p-3.5 text-slate-400">{b.region}</td>
                      <td className="p-3.5 text-cyan-300">{b.sizeMb} MB</td>
                      <td className="p-3.5 text-emerald-400 truncate max-w-[150px]" title={b.sha256Hash}>
                        {b.sha256Hash.substring(0, 16)}...
                      </td>
                      <td className="p-3.5 text-slate-400">{new Date(b.createdAt).toLocaleString()}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestoreSnapshot(b.snapshotId)}
                            className="px-3 py-1.5 rounded-lg bg-violet-950 text-violet-300 border border-violet-800 hover:bg-violet-900 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handlePurgeSnapshot(b.snapshotId)}
                            className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Purge
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'usage_analytics' && usageAnalytics && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-400" />
                <span>Usage Analytics & Quota Telemetry</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time aggregate telemetry aggregated from scan_results, tenant entitlements and admin audit trails.
              </p>
            </div>
            <button
              onClick={fetchAllData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Tenants', value: usageAnalytics.summary.totalTenants, accent: 'text-indigo-400' },
              { label: 'Total Scans', value: usageAnalytics.summary.totalScans, accent: 'text-cyan-300' },
              { label: 'Active Modules', value: usageAnalytics.summary.totalActiveModules, accent: 'text-emerald-400' },
              { label: 'Domains Scanned', value: usageAnalytics.summary.domainsScanned, accent: 'text-amber-400' },
              { label: 'Admin Audit Events', value: usageAnalytics.summary.adminAuditEvents, accent: 'text-fuchsia-400' },
              { label: 'Avg Risk Score', value: usageAnalytics.summary.avgRiskScore, accent: 'text-rose-400' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{kpi.label}</p>
                <p className={`text-2xl font-bold font-mono mt-1 ${kpi.accent}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Daily Scan Volume (14d)</h4>
              <div className="flex items-end gap-1 h-32">
                {usageAnalytics.dailyTrend.map(day => (
                  <div
                    key={day.date}
                    className="flex-1 rounded-t bg-gradient-to-t from-indigo-900 to-indigo-500 min-w-[4px]"
                    style={{ height: `${Math.max(6, (day.scans / Math.max(1, Math.max(...usageAnalytics.dailyTrend.map(d => d.scans)))) * 100)}%` }}
                    title={`${day.date}: ${day.scans} scans`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-slate-500 font-mono">
                <span>{usageAnalytics.dailyTrend[0]?.date}</span>
                <span>{usageAnalytics.dailyTrend[usageAnalytics.dailyTrend.length - 1]?.date}</span>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Scans by Compliance Profile</h4>
              <div className="space-y-2.5">
                {usageAnalytics.byComplianceProfile.map(p => {
                  const max = Math.max(1, ...usageAnalytics.byComplianceProfile.map(x => x.scans));
                  return (
                    <div key={p.profile}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-300 font-bold">{p.profile}</span>
                        <span className="text-slate-400">{p.scans} scans</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400" style={{ width: `${(p.scans / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="p-3.5 font-semibold">Tenant</th>
                    <th className="p-3.5 font-semibold">Status</th>
                    <th className="p-3.5 font-semibold">Active Modules</th>
                    <th className="p-3.5 font-semibold">Locked Modules</th>
                    <th className="p-3.5 font-semibold">Scan Count</th>
                    <th className="p-3.5 font-semibold">Avg Risk</th>
                    <th className="p-3.5 font-semibold">Regions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usageAnalytics.tenantUsage.map(t => (
                    <tr key={t.tenantId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <span className="text-white font-bold">{t.tenantName}</span>
                        <span className="block text-[10px] text-slate-500">{t.tenantId}</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          t.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : t.status === 'QUARANTINED' ? 'bg-rose-950 text-rose-400 border-rose-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-cyan-300">{t.activeModules}</td>
                      <td className="p-3.5 text-slate-400">{t.lockedModules}</td>
                      <td className="p-3.5 text-indigo-300">{t.scanCount}</td>
                      <td className="p-3.5">
                        <span className={`font-bold ${t.avgRiskScore >= 70 ? 'text-rose-400' : t.avgRiskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {t.avgRiskScore}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">{t.regions.join(', ') || '—'}</td>
                    </tr>
                  ))}
                  {usageAnalytics.tenantUsage.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-500">No tenant usage telemetry yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'platform' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span>Feature Flags & Platform Release Governance</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Global capability toggles with audit trail, tenant health scoring, and versioned deployment control.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Current Build</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{deploymentVersions?.currentVersion || 'v2.15.0-stable'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: 'Healthy', value: healthScores?.summary.healthy ?? '—', accent: 'text-emerald-400' },
              { label: 'Needs Attention', value: healthScores?.summary.needsAttention ?? '—', accent: 'text-amber-400' },
              { label: 'At Risk', value: healthScores?.summary.atRisk ?? '—', accent: 'text-orange-400' },
              { label: 'Critical', value: healthScores?.summary.critical ?? '—', accent: 'text-rose-400' },
              { label: 'Avg Health', value: healthScores?.summary.avgHealthScore ?? '—', accent: 'text-indigo-400' },
              { label: 'Flags Active', value: featureFlags.filter(f => f.enabled).length, accent: 'text-cyan-400' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{kpi.label}</p>
                <p className={`text-2xl font-bold font-mono mt-1 ${kpi.accent}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Tenant Health Distribution</h4>
              <div className="space-y-2.5">
                {[
                  { label: 'HEALTHY', value: healthScores?.summary.healthy ?? 0, color: 'bg-emerald-500' },
                  { label: 'NEEDS_ATTENTION', value: healthScores?.summary.needsAttention ?? 0, color: 'bg-amber-500' },
                  { label: 'AT_RISK', value: healthScores?.summary.atRisk ?? 0, color: 'bg-orange-500' },
                  { label: 'CRITICAL', value: healthScores?.summary.critical ?? 0, color: 'bg-rose-500' },
                ].map(seg => (
                  <div key={seg.label}>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-300 font-bold">{seg.label.replace('_', ' ')}</span>
                      <span className="text-slate-400">{seg.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full rounded-full ${seg.color}`} style={{ width: `${Math.max(2, (seg.value / Math.max(1, healthScores?.summary.totalTenants ?? 1)) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Recent Deployment Events</h4>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {deploymentVersions?.deploymentHistory?.length ? deploymentVersions.deploymentHistory.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-800/40 rounded-xl p-2.5">
                    <Clock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-white font-bold">{h.action}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{h.details}</p>
                      <p className="text-[10px] text-slate-600 font-mono">{String(h.performedBy || 'CI/CD')} · {String(h.timestamp || '').slice(0, 19).replace('T', ' ')}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500">No deployment events logged yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="p-3.5 font-semibold">Flag Key</th>
                    <th className="p-3.5 font-semibold">Category</th>
                    <th className="p-3.5 font-semibold">Description</th>
                    <th className="p-3.5 font-semibold text-center">State</th>
                    <th className="p-3.5 font-semibold w-40">Rollout %</th>
                    <th className="p-3.5 font-semibold">Last Modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {featureFlags.map(f => (
                    <tr key={f.flag_key} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <span className="text-white font-bold">{f.flag_name}</span>
                        <span className="block text-[10px] text-slate-500">{f.flag_key}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                          {f.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 max-w-[260px] truncate" title={f.flag_description}>{f.flag_description || '—'}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleFlag(f.flag_key, f.enabled)}
                          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors cursor-pointer ${f.enabled ? 'bg-emerald-600' : 'bg-slate-700'}`}
                        >
                          <span className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${f.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={f.rollout_percentage}
                            onChange={e => handleUpdateRollout(f.flag_key, Number(e.target.value))}
                            className="w-full accent-indigo-500 cursor-pointer"
                          />
                          <span className="text-slate-300 text-[10px] w-8 text-right">{f.rollout_percentage}%</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[10px]">
                        {f.last_modified_by || 'SYSTEM'}
                        <span className="block" title={f.last_modified_at}>
                          {String(f.last_modified_at || '').slice(0, 10)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 pt-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Tenant Composite Health Scores</h4>
              <span className="text-[10px] text-slate-500 font-mono">Entitlement + Risk + Compliance + Activity</span>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="p-3.5 font-semibold">Tenant</th>
                    <th className="p-3.5 font-semibold">Tier</th>
                    <th className="p-3.5 font-semibold text-center">Score</th>
                    <th className="p-3.5 font-semibold w-44">Components</th>
                    <th className="p-3.5 font-semibold">Recent Scans</th>
                    <th className="p-3.5 font-semibold">Avg Risk</th>
                    <th className="p-3.5 font-semibold">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {healthScores?.scores.map(t => (
                    <tr key={t.tenantId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <span className="text-white font-bold">{t.tenantName}</span>
                        <span className="block text-[10px] text-slate-500">{t.tenantId}</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          t.tier === 'HEALTHY' ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : t.tier === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border-rose-800'
                          : t.tier === 'AT_RISK' ? 'bg-orange-950 text-orange-400 border-orange-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}>
                          {t.tier.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`text-xl font-black ${t.healthScore >= 75 ? 'text-emerald-400' : t.healthScore >= 60 ? 'text-amber-400' : t.healthScore >= 30 ? 'text-orange-400' : 'text-rose-500'}`}>
                          {t.healthScore}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          {(['entitlementHealth', 'riskHealth', 'complianceHealth', 'activityHealth'] as const).map(comp => (
                            <div key={comp} className="h-1.5 flex-1 rounded-full bg-slate-800 overflow-hidden" title={comp}>
                              <div className={`h-full rounded-full ${(t.components[comp] ?? 0) >= 70 ? 'bg-emerald-500' : (t.components[comp] ?? 0) >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${t.components[comp] ?? 0}%` }} />
                            </div>
                          ))}
                        </div>
                        <span className="text-[9px] text-slate-600">ENT · RSK · CMP · ACT</span>
                      </td>
                      <td className="p-3.5 text-slate-400">{t.recentScanCount}</td>
                      <td className="p-3.5">
                        <span className={`font-bold ${t.avgRiskScore >= 70 ? 'text-rose-400' : t.avgRiskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {t.avgRiskScore}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 max-w-[260px] truncate" title={t.recommendation}>{t.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 pt-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Deployment Version Inventory</h4>
              <Users className="w-4 h-4 text-slate-500" />
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="p-3.5 font-semibold">Version</th>
                    <th className="p-3.5 font-semibold">Deployed</th>
                    <th className="p-3.5 font-semibold">By</th>
                    <th className="p-3.5 font-semibold">Status</th>
                    <th className="p-3.5 font-semibold">Risk</th>
                    <th className="p-3.5 font-semibold">Highlights</th>
                    <th className="p-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deploymentVersions?.versions.map(v => (
                    <tr key={v.version} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 text-indigo-400 font-bold">{v.version}</td>
                      <td className="p-3.5 text-slate-400">{new Date(v.deployedAt).toLocaleDateString()}</td>
                      <td className="p-3.5 text-slate-400">{v.deployedBy}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          v.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : v.status === 'ROLLED_BACK' ? 'bg-rose-950 text-rose-400 border-rose-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`font-bold ${v.risk === 'LOW' ? 'text-emerald-400' : v.risk === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'}`}>{v.risk}</span>
                      </td>
                      <td className="p-3.5 text-slate-400 max-w-[240px] truncate" title={v.features}>{v.features}</td>
                      <td className="p-3.5 text-right">
                        {v.status === 'ACTIVE' ? (
                          <span className="text-[10px] text-slate-600 font-bold">CURRENT</span>
                        ) : v.status !== 'ROLLED_BACK' && (
                          <button
                            onClick={() => setRollbackModal({ version: v.version })}
                            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Rollback
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cases' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <span>Whistleblower Cases & Sanctions Watchlist</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Global case intake oversight and sanctions/PEP screening registry from the live database.
              </p>
            </div>
            <button
              onClick={fetchAllData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Registry</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: 'Open Cases', value: wbReports?.summary.openCases ?? 0, accent: 'text-amber-400' },
              { label: 'Resolved', value: wbReports?.summary.resolved ?? 0, accent: 'text-emerald-400' },
              { label: 'Critical Priority', value: wbReports?.summary.criticalPriority ?? 0, accent: 'text-rose-400' },
              { label: 'Watchlist Entries', value: watchlist?.summary.totalEntries ?? 0, accent: 'text-indigo-400' },
              { label: 'Countries Tracked', value: watchlist?.summary.countries ?? 0, accent: 'text-cyan-400' },
              { label: 'Severe Risk', value: watchlist?.summary.severeRisk ?? 0, accent: 'text-rose-500' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{kpi.label}</p>
                <p className={`text-2xl font-bold font-mono mt-1 ${kpi.accent}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Cases by Category</h4>
              <div className="space-y-2.5">
                {wbReports?.byCategory.map(c => {
                  const max = Math.max(1, ...(wbReports?.byCategory.map(x => x.count) || [1]));
                  return (
                    <div key={c.category}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-300 font-bold">{c.category}</span>
                        <span className="text-slate-400">{c.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-400" style={{ width: `${(c.count / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Watchlist by Country</h4>
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {watchlist?.byCountry.map(c => {
                  const max = Math.max(1, ...(watchlist?.byCountry.map(x => x.count) || [1]));
                  return (
                    <div key={c.country}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-300 font-bold">{c.country}</span>
                        <span className="text-slate-400">{c.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400" style={{ width: `${(c.count / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 pt-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Whistleblower Reports</h4>
              <span className="text-[10px] text-slate-500 font-mono">{wbReports?.summary.totalReports ?? 0} total reports</span>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="p-3.5 font-semibold">Reference</th>
                    <th className="p-3.5 font-semibold">Category</th>
                    <th className="p-3.5 font-semibold">Priority</th>
                    <th className="p-3.5 font-semibold">Title</th>
                    <th className="p-3.5 font-semibold">Reported</th>
                    <th className="p-3.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {wbReports?.reports.map(r => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 text-indigo-400 font-bold">{r.report_ref}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                          {r.category}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`font-bold ${r.priority === 'CRITICAL' || r.priority === 'HIGHPRIORITY' ? 'text-rose-400' : r.priority === 'MEDIUM' ? 'text-amber-400' : 'text-slate-400'}`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="p-3.5 text-white font-medium max-w-[220px] truncate" title={r.title}>{r.title}</td>
                      <td className="p-3.5 text-slate-500 text-[10px]">{String(r.timestamp || '').slice(0, 16)}</td>
                      <td className="p-3.5">
                        <select
                          value={r.status}
                          onChange={e => handleUpdateCaseStatus(r.id, e.target.value)}
                          className={`bg-slate-800 border rounded-lg px-2 py-1.5 text-[10px] font-bold font-mono cursor-pointer focus:outline-none ${
                            r.status === 'RESOLVED' || r.status === 'CLOSED' ? 'text-emerald-400 border-emerald-800'
                            : r.status === 'OPEN' ? 'text-amber-400 border-amber-800'
                            : 'text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 pt-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Sanctions & PEP Registry</h4>
              <span className="text-[10px] text-slate-500 font-mono">{watchlist?.summary.totalEntries ?? 0} watchlist entries</span>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="p-3.5 font-semibold">Name</th>
                    <th className="p-3.5 font-semibold">Type</th>
                    <th className="p-3.5 font-semibold">Country</th>
                    <th className="p-3.5 font-semibold">Risk</th>
                    <th className="p-3.5 font-semibold">Citation</th>
                    <th className="p-3.5 font-semibold">Updated</th>
                    <th className="p-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {watchlist?.entries.map(e => (
                    <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <span className="text-white font-bold">{e.name}</span>
                        {e.associated_orgs && <span className="block text-[10px] text-slate-500 truncate max-w-[180px]">{e.associated_orgs}</span>}
                      </td>
                      <td className="p-3.5 text-slate-400">{e.type}</td>
                      <td className="p-3.5 text-slate-400">{e.country}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          String(e.risk_score).toUpperCase() === 'SEVERE' ? 'bg-rose-950 text-rose-400 border-rose-800'
                          : String(e.risk_score).toUpperCase() === 'HIGH' ? 'bg-orange-950 text-orange-400 border-orange-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}>
                          {String(e.risk_score).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 max-w-[160px] truncate" title={e.citation || ''}>{e.citation || '—'}</td>
                      <td className="p-3.5 text-slate-500 text-[10px]">{String(e.last_updated || '').slice(0, 10)}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleRemoveWatchlist(e.id)}
                          className="p-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Remove entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'regulatory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-indigo-400" />
                <span>Regulatory Intelligence Radar</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Global regulatory change feed, tracked country laws and per-framework compliance audit activity.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAllData}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Radar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Legal Updates', value: regulatoryRadar?.summary.legalUpdates ?? 0, accent: 'text-indigo-400' },
              { label: 'Active Laws', value: regulatoryRadar?.summary.activeLaws ?? 0, accent: 'text-emerald-400' },
              { label: 'Countries Tracked', value: regulatoryRadar?.summary.countriesTracked ?? 0, accent: 'text-cyan-400' },
              { label: 'Frameworks', value: regulatoryRadar?.summary.frameworks ?? 0, accent: 'text-fuchsia-400' },
              { label: 'Audit Events', value: regulatoryRadar?.summary.auditEvents ?? 0, accent: 'text-amber-400' },
              { label: 'Unsynced Updates', value: regulatoryRadar?.summary.unsyncedUpdates ?? 0, accent: 'text-rose-400' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{kpi.label}</p>
                <p className={`text-2xl font-bold font-mono mt-1 ${kpi.accent}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Updates by Change Type</h4>
              <div className="space-y-2.5">
                {regulatoryRadar?.byChangeType.map(c => {
                  const max = Math.max(1, ...(regulatoryRadar?.byChangeType.map(x => x.count) || [1]));
                  return (
                    <div key={c.change_type}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-300 font-bold">{c.change_type.replace('_', ' ')}</span>
                        <span className="text-slate-400">{c.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400" style={{ width: `${(c.count / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Top Regulated Subjects</h4>
              <div className="space-y-2.5">
                {regulatoryRadar?.byLaw.map(c => {
                  const max = Math.max(1, ...(regulatoryRadar?.byLaw.map(x => x.updates) || [1]));
                  return (
                    <div key={c.law}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-300 font-bold truncate max-w-[260px]">{c.law}</span>
                        <span className="text-slate-400">{c.updates}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-400" style={{ width: `${(c.updates / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 pt-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Legal / Regulatory Change Feed</h4>
              <span className="text-[10px] text-slate-500 font-mono">{regulatoryRadar?.summary.legalUpdates ?? 0} updates</span>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="p-3.5 font-semibold">Published</th>
                    <th className="p-3.5 font-semibold">Law</th>
                    <th className="p-3.5 font-semibold">Change Type</th>
                    <th className="p-3.5 font-semibold">Title</th>
                    <th className="p-3.5 font-semibold">Summary</th>
                    <th className="p-3.5 font-semibold">Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {regulatoryRadar?.legalUpdates.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 text-slate-500 text-[10px]">{String(u.timestamp || '').slice(0, 16).replace('T', ' ')}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold max-w-[160px] truncate inline-block" title={u.law}>
                          {u.law}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`font-bold ${u.change_type === 'AMENDMENT' ? 'text-amber-400' : u.change_type === 'REGULATION' ? 'text-indigo-400' : u.change_type === 'TECHNICAL_STANDARD' ? 'text-cyan-400' : 'text-slate-400'}`}>
                          {u.change_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-white font-medium max-w-[220px] truncate" title={u.title}>{u.title}</td>
                      <td className="p-3.5 text-slate-400 max-w-[300px] truncate" title={u.summary}>{u.summary}</td>
                      <td className="p-3.5">
                        {u.is_synced ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                            <Check className="w-3.5 h-3.5" /> SYNCED
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSyncLegalUpdate(u.id)}
                            className="px-2.5 py-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Mark Synced
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 pt-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Tracked Country Laws</h4>
                <span className="text-[10px] text-slate-500 font-mono">{regulatoryRadar?.countryLaws.length ?? 0} laws registered</span>
              </div>
              <div className="overflow-x-auto mt-2 max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="sticky top-0 bg-slate-950">
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                      <th className="p-3.5 font-semibold">Country</th>
                      <th className="p-3.5 font-semibold">Law Code</th>
                      <th className="p-3.5 font-semibold">Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {regulatoryRadar?.countryLaws.map(l => (
                      <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5">
                          <span className={`font-bold ${l.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>{l.country_code}</span>
                        </td>
                        <td className="p-3.5 text-indigo-400 font-bold">{l.law_code}</td>
                        <td className="p-3.5 text-slate-300 max-w-[220px] truncate" title={l.law_name}>{l.law_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 pt-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Compliance Framework Registry</h4>
                <span className="text-[10px] text-slate-500 font-mono">{regulatoryRadar?.frameworks.length ?? 0} frameworks active</span>
              </div>
              <div className="overflow-x-auto mt-2 max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="sticky top-0 bg-slate-950">
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                      <th className="p-3.5 font-semibold">Code</th>
                      <th className="p-3.5 font-semibold">Version</th>
                      <th className="p-3.5 font-semibold">Name</th>
                      <th className="p-3.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {regulatoryRadar?.frameworks.map(f => (
                      <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 text-indigo-400 font-bold">{f.code}</td>
                        <td className="p-3.5 text-slate-400">{f.version}</td>
                        <td className="p-3.5 text-slate-300 max-w-[220px] truncate" title={f.name}>{f.name}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${f.is_active ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                            {f.is_active ? 'ACTIVE' : 'RETIRED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Compliance Audit Activity by Tenant</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {regulatoryRadar?.auditByTenant.map(t => (
                <div key={t.tenant_id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 font-mono truncate" title={t.tenant_id}>{t.tenant_id}</p>
                  <p className="text-lg font-bold text-indigo-400 font-mono mt-1">{t.events}</p>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest">audit events</p>
                </div>
              ))}
              {(!regulatoryRadar?.auditByTenant || regulatoryRadar.auditByTenant.length === 0) && (
                <p className="text-xs text-slate-500 col-span-full">No compliance audit activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'api_keys' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeySquare className="w-5 h-5 text-indigo-400" />
                <span>API Keys & Token Governance</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full lifecycle management of platform API tokens — provision, rotate, revoke and monitor usage.
              </p>
            </div>
            <button
              onClick={fetchAllData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Keys</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Keys', value: apiKeys?.summary.total ?? 0, accent: 'text-indigo-400' },
              { label: 'Active', value: apiKeys?.summary.active ?? 0, accent: 'text-emerald-400' },
              { label: 'Revoked', value: apiKeys?.summary.revoked ?? 0, accent: 'text-rose-400' },
              { label: 'Used (7d)', value: apiKeys?.summary.lastUsed7d ?? 0, accent: 'text-cyan-400' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{kpi.label}</p>
                <p className={`text-2xl font-bold font-mono mt-1 ${kpi.accent}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Provision New API Key</h4>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1.5">Key Name</label>
                <input
                  value={newApiKeyName}
                  onChange={e => setNewApiKeyName(e.target.value)}
                  placeholder="e.g. Production GRC Platform Integration"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1.5">Scope</label>
                <select
                  value={newApiKeyScope}
                  onChange={e => setNewApiKeyScope(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono cursor-pointer"
                >
                  <option value="read">read</option>
                  <option value="read_write">read_write</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <button
                onClick={handleProvisionApiKey}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Provision Key
              </button>
            </div>
          </div>

          {provisionedKey && (
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Newly Provisioned Secret — copy now, it will not be shown again</p>
                  <code className="text-xs font-mono text-emerald-300 break-all select-all">{provisionedKey}</code>
                </div>
                <button onClick={() => setProvisionedKey(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 pt-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Token Inventory</h4>
              <span className="text-[10px] text-slate-500 font-mono">{apiKeys?.summary.total ?? 0} registered tokens</span>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="p-3.5 font-semibold">Preview</th>
                    <th className="p-3.5 font-semibold">Name</th>
                    <th className="p-3.5 font-semibold">Client System</th>
                    <th className="p-3.5 font-semibold">Scope</th>
                    <th className="p-3.5 font-semibold">Status</th>
                    <th className="p-3.5 font-semibold">Created</th>
                    <th className="p-3.5 font-semibold">Last Used</th>
                    <th className="p-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {apiKeys?.tokens.map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 text-indigo-400 font-bold text-[10px]">{t.keyPreview}</td>
                      <td className="p-3.5">
                        <span className="text-white font-bold">{t.name}</span>
                        {t.customServices.length > 0 && (
                          <span className="block text-[10px] text-slate-500">{t.customServices.join(', ')}</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-400">{t.clientSystem}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          t.scope === 'admin' ? 'bg-rose-950 text-rose-400'
                          : t.scope === 'read_write' ? 'bg-amber-950 text-amber-400'
                          : 'bg-slate-800 text-slate-300'
                        }`}>
                          {t.scope}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          t.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[10px]">{String(t.createdAt || '').slice(0, 10)}</td>
                      <td className="p-3.5 text-slate-500 text-[10px]">{t.lastUsedAt ? String(t.lastUsedAt).slice(0, 16) : 'never'}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {t.status === 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => handleRotateApiKey(t.id)}
                                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                title="Rotate key"
                              >
                                Rotate
                              </button>
                              <button
                                onClick={() => handleRevokeApiKey(t.id)}
                                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                title="Revoke key"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          {t.status === 'REVOKED' && <span className="text-[10px] text-slate-600 font-bold">REVOKED</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dr_drills' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-indigo-400" />
                <span>Disaster Recovery Drill Scheduler</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Plan and execute regional DR exercises, track RPO/RTO compliance and recovery set integrity.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDrDrillModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Schedule New Drill
              </button>
              <button
                onClick={fetchAllData}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Scheduled', value: drDrills?.summary.scheduled ?? 0, accent: 'text-amber-400' },
              { label: 'Completed', value: drDrills?.summary.completed ?? 0, accent: 'text-emerald-400' },
              { label: 'Avg RPO Compliance', value: `${drDrills?.summary.avgRpoCompliance ?? 0}%`, accent: 'text-cyan-400' },
              { label: 'Avg Restore (min)', value: drDrills?.summary.avgRestoreTimeMin ?? 0, accent: 'text-indigo-400' },
              { label: 'Last Drill', value: drDrills?.summary.lastDrillAt ? new Date(drDrills.summary.lastDrillAt).toLocaleDateString() : '—', accent: 'text-slate-300' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{kpi.label}</p>
                <p className={`text-2xl font-bold font-mono mt-1 ${kpi.accent}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Drill Timeline</h4>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {drDrills?.timeline.map(t => (
                <div key={t.id} className={`min-w-[130px] rounded-xl border p-3 flex-shrink-0 ${
                  t.status === 'COMPLETED' ? 'bg-emerald-950/40 border-emerald-800/60'
                  : 'bg-amber-950/30 border-amber-800/50'
                }`}>
                  <p className="text-xs font-bold text-white font-mono truncate" title={t.name}>{t.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{new Date(t.date).toDateString()}</p>
                  <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${t.status === 'COMPLETED' ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 pt-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Drill Registry</h4>
              <span className="text-[10px] text-slate-500 font-mono">{drDrills?.summary.total ?? 0} drills on record</span>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="p-3.5 font-semibold">Drill</th>
                    <th className="p-3.5 font-semibold">Type</th>
                    <th className="p-3.5 font-semibold">Region</th>
                    <th className="p-3.5 font-semibold">Status</th>
                    <th className="p-3.5 font-semibold">Scheduled For</th>
                    <th className="p-3.5 font-semibold">Sets Restored</th>
                    <th className="p-3.5 font-semibold">Duration</th>
                    <th className="p-3.5 font-semibold">RPO</th>
                    <th className="p-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {drDrills?.drills.map(d => (
                    <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <span className="text-white font-bold">{d.name}</span>
                        <span className="block text-[10px] text-slate-500">{d.id}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                          {d.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{d.region}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          d.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[10px]">{new Date(d.executedAt).toLocaleString()}</td>
                      <td className="p-3.5 text-indigo-300">{d.restoredSets || '—'}</td>
                      <td className="p-3.5 text-slate-400">{d.durationMinutes ? `${d.durationMinutes} min` : '—'}</td>
                      <td className="p-3.5">
                        {d.status === 'COMPLETED' && (
                          <span className={`font-bold ${d.rpoBreached ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {d.rpoBreached ? 'BREACHED' : 'MET'}
                          </span>
                        )}
                        {d.status === 'SCHEDULED' && <span className="text-slate-600 text-[10px]">PENDING</span>}
                      </td>
                      <td className="p-3.5 text-right">
                        {d.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleRunDrDrill(d.id)}
                            className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Execute Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE DR DRILL */}
      {drDrillModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Schedule DR Drill</h3>
              <button onClick={() => setDrDrillModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-widest text-[10px]">Drill Name</label>
                <input
                  value={drDrillName}
                  onChange={e => setDrDrillName(e.target.value)}
                  placeholder="e.g. Quarter-2 EU PITR Reconstruction"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-widest text-[10px]">Drill Type</label>
                  <select
                    value={drDrillType}
                    onChange={e => setDrDrillType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="RPO_1HR">RPO_1HR</option>
                    <option value="RTO_5MIN">RTO_5MIN</option>
                    <option value="PITR_T+5">PITR_T+5</option>
                    <option value="HSM_REKEY">HSM_REKEY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-widest text-[10px]">Region</label>
                  <select
                    value={drDrillRegion}
                    onChange={e => setDrDrillRegion(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="EU-WEST-1">EU-WEST-1</option>
                    <option value="US-EAST-1">US-EAST-1</option>
                    <option value="AP-SOUTHEAST-1">AP-SOUTHEAST-1</option>
                    <option value="SOUTH-AMERICA-E-1">SOUTH-AMERICA-E-1</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDrDrillModal(false)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleScheduleDrDrill} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">
                Schedule Drill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ROLLBACK CONFIRM */}
      {rollbackModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Initiate Rollback</h3>
              <button onClick={() => setRollbackModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 text-xs text-rose-300 font-mono">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Destructive Action — Rollback to {rollbackModal.version}</span>
              </div>
              <p className="text-[10px] text-rose-400/80">
                Rolling back will redeploy the previous stable build. All active flag rollouts and session state will be reconciled during the 3-5 minute window.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase tracking-widest">Rollback Reason</label>
              <textarea
                value={rollbackReason}
                onChange={e => setRollbackReason(e.target.value)}
                rows={3}
                placeholder="Example: Regression found in real-time DLP tokenization after v2.15.0 rollout..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRollbackModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDeployRollback} className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">
                Confirm Rollback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT LIMITS & GATES */}
      {editingTenant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Quotas & Feature Gates</h3>
                <p className="text-xs text-indigo-400 font-mono">{editingTenant.tenantName} ({editingTenant.tenantId})</p>
              </div>
              <button onClick={() => setEditingTenant(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntitlements} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Max Seats / Users</label>
                  <input
                    type="number"
                    value={editingTenant.maxSeats}
                    onChange={e => setEditingTenant({ ...editingTenant, maxSeats: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">API Rate Limit (RPM)</label>
                  <input
                    type="number"
                    value={editingTenant.apiRateLimitRpm}
                    onChange={e => setEditingTenant({ ...editingTenant, apiRateLimitRpm: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Storage Quota (GB)</label>
                  <input
                    type="number"
                    value={editingTenant.storageQuotaGb}
                    onChange={e => setEditingTenant({ ...editingTenant, storageQuotaGb: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Monthly LLM Token Budget</label>
                  <input
                    type="number"
                    value={editingTenant.monthlyLlmTokensBudget}
                    onChange={e => setEditingTenant({ ...editingTenant, monthlyLlmTokensBudget: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Feature Gates Checkboxes */}
              <div className="border-t border-slate-800 pt-4 space-y-2 font-sans">
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Feature Gates</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(editingTenant.featureGates).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={e =>
                          setEditingTenant({
                            ...editingTenant,
                            featureGates: { ...editingTenant.featureGates, [key]: e.target.checked },
                          })
                        }
                        className="rounded bg-slate-700 border-slate-600 text-indigo-600"
                      />
                      <span className="text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUOTA SURGE BOOST */}
      {boostingTenant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Grant Temporary Quota Boost</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{boostingTenant.tenantName}</p>
              </div>
              <button onClick={() => setBoostingTenant(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyBoost} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Bonus LLM Tokens</label>
                <input
                  type="number"
                  value={boostTokens}
                  onChange={e => setBoostTokens(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Bonus Storage (GB)</label>
                <input
                  type="number"
                  value={boostStorage}
                  onChange={e => setBoostStorage(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Audit / Surge Justification</label>
                <input
                  type="text"
                  value={boostReason}
                  onChange={e => setBoostReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Duration (Days until auto-expiration)</label>
                <input
                  type="number"
                  value={boostDurationDays}
                  onChange={e => setBoostDurationDays(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setBoostingTenant(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Apply Quota Boost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRYPTOGRAPHIC RIGHT-TO-BE-FORGOTTEN SHREDDER */}
      {shredTenantId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <Trash2 className="w-5 h-5 text-rose-500" />
                <span>NIST SP 800-88 Cryptographic Shredder</span>
              </div>
              <button onClick={() => setShredTenantId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {shredResultCert ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-950/60 border border-emerald-700 rounded-2xl text-xs space-y-2 font-mono text-emerald-200">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic Erasure Certified</span>
                  </div>
                  <div>Certificate ID: {shredResultCert.certificateId}</div>
                  <div className="truncate">SHA-256 Proof: {shredResultCert.sha256Proof}</div>
                  <div>Standard: {shredResultCert.standardCompliant}</div>
                  <div>Timestamp: {shredResultCert.executedAt}</div>
                </div>
                <button
                  onClick={() => setShredTenantId(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold font-mono cursor-pointer"
                >
                  Close & Dismiss
                </button>
              </div>
            ) : (
              <form onSubmit={handleExecuteShred} className="space-y-4 text-xs font-mono">
                <p className="text-slate-300 font-sans">
                  This action permanently destroys the Envelope Data Encryption Key (DEK) for <strong>{shredTenantId}</strong> in the Hardware Security Module. All tenant records, vectors, and backups will become permanently unrecoverable.
                </p>

                <div>
                  <label className="block text-rose-400 mb-1">
                    To confirm, type: <strong>SHRED_{shredTenantId}</strong>
                  </label>
                  <input
                    type="text"
                    value={shredConfirmCode}
                    onChange={e => setShredConfirmCode(e.target.value)}
                    placeholder={`SHRED_${shredTenantId}`}
                    className="w-full bg-slate-950 border border-rose-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShredTenantId(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={shredConfirmCode !== `SHRED_${shredTenantId}`}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Permanently Shred Tenant Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CROSS REGION MIGRATION SIMULATION */}
      {migratingTenant && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-800/80 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-base border-b border-slate-800 pb-3">
              <Globe className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span>Cross-Region Enclave Live Migration Orchestrator</span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <p className="text-slate-300 font-sans">
                Migrating <strong>{migratingTenant}</strong> to <strong>{migrationTargetRegion}</strong> with zero downtime read-replicas.
              </p>

              <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    migrationStep && migrationStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {migrationStep && migrationStep > 1 ? '✓' : '1'}
                  </div>
                  <span className={migrationStep === 1 ? 'text-indigo-400 font-bold' : 'text-slate-400'}>
                    Generating Pre-Flight PITR Snapshot
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    migrationStep && migrationStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {migrationStep && migrationStep > 2 ? '✓' : '2'}
                  </div>
                  <span className={migrationStep === 2 ? 'text-indigo-400 font-bold' : 'text-slate-400'}>
                    Re-encrypting with Destination Enclave HSM Key
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    migrationStep && migrationStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {migrationStep && migrationStep > 3 ? '✓' : '3'}
                  </div>
                  <span className={migrationStep === 3 ? 'text-indigo-400 font-bold' : 'text-slate-400'}>
                    Synchronizing Edge DNS and Routing Tables
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    migrationStep && migrationStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    4
                  </div>
                  <span className={migrationStep === 4 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    Migration Completed & Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ADVANCED MCP CONNECTOR HUB */}
      {activeTab === 'mcp_hub' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <McpConnectorHub />
        </div>
      )}

      {/* TAB: BUILT-IN ENTERPRISE SSO PROVISIONER */}
      {activeTab === 'enterprise_sso' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <EnterpriseSsoProvisioner />
        </div>
      )}
    </div>
  );
};
