import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  ShieldAlert,
  ShieldCheck,
  Server,
  Scale,
  FileCheck2,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Trash2,
  Download,
  Filter,
  Search,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Settings,
  ChevronRight,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sliders,
  Send,
  Lock,
  Radio,
  FileText,
  Activity,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ComplianceAlert,
  ComplianceRole,
  AlertSeverity,
  AlertStatus,
  ComplianceFrameworkType
} from '../../types/complianceAlerts';
import {
  ROLE_CONFIGS,
  INITIAL_COMPLIANCE_ALERTS,
  SIMULATION_PRESETS
} from '../../data/mockComplianceAlerts';
import { playComplianceAlertSound } from '../../utils/complianceSound';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export interface RoleBasedNotificationPanelProps {
  initialRole?: ComplianceRole | 'ALL';
  onNavigate?: (path: string) => void;
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const RoleBasedNotificationPanel: React.FC<RoleBasedNotificationPanelProps> = ({
  initialRole,
  onNavigate,
  isModal = false,
  isOpen = true,
  onClose,
  className = ''
}) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  // Detect role from user context or default
  const detectedUserRole: ComplianceRole = useMemo(() => {
    const rawRole = (user?.user_metadata?.role || user?.user_metadata?.accountType || '').toUpperCase();
    if (rawRole.includes('REGULATOR') || rawRole.includes('COMPLIANCE') || rawRole.includes('DPO')) {
      return 'COMPLIANCE_OFFICER';
    }
    if (rawRole.includes('ADMIN')) {
      return 'SYSTEM_ADMIN';
    }
    if (rawRole.includes('LAWYER') || rawRole.includes('LEGAL')) {
      return 'LAWYER';
    }
    if (rawRole.includes('AUDIT')) {
      return 'AUDITOR';
    }
    return 'COMPLIANCE_OFFICER';
  }, [user]);

  // Active Role Filter
  const [selectedRole, setSelectedRole] = useState<ComplianceRole | 'ALL'>(() => {
    if (initialRole) return initialRole;
    return detectedUserRole;
  });

  // Storage Persistence for Alerts
  const [alerts, setAlerts] = useState<ComplianceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('sovereign_compliance_alerts');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse cached alerts', e);
    }
    return INITIAL_COMPLIANCE_ALERTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sovereign_compliance_alerts', JSON.stringify(alerts));
    } catch (e) {
      // ignore storage quota errors
    }
  }, [alerts]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'ALL'>('ALL');
  const [frameworkFilter, setFrameworkFilter] = useState<ComplianceFrameworkType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'urgency' | 'severity'>('newest');

  // UI Modals & Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isCustomAlertModalOpen, setIsCustomAlertModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  // Active Remediation Process State
  const [remediatingAlertId, setRemediatingAlertId] = useState<string | null>(null);
  const [remediationProgress, setRemediationProgress] = useState<number>(0);
  const [remediationStep, setRemediationStep] = useState<string>('');

  // Custom Alert Form State
  const [customRole, setCustomRole] = useState<ComplianceRole>('COMPLIANCE_OFFICER');
  const [customSeverity, setCustomSeverity] = useState<AlertSeverity>('HIGH');
  const [customFramework, setCustomFramework] = useState<ComplianceFrameworkType>('GDPR');
  const [customArticle, setCustomArticle] = useState('GDPR Art. 33(1)');
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customDeadline, setCustomDeadline] = useState<number>(72);

  // Filtered & Sorted Alerts
  const filteredAlerts = useMemo(() => {
    return alerts
      .filter((alert) => {
        // Role match
        if (selectedRole !== 'ALL' && alert.role !== selectedRole) {
          return false;
        }
        // Severity match
        if (severityFilter !== 'ALL' && alert.severity !== severityFilter) {
          return false;
        }
        // Status match
        if (statusFilter !== 'ALL' && alert.status !== statusFilter) {
          return false;
        }
        // Framework match
        if (frameworkFilter !== 'ALL' && alert.framework !== frameworkFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = alert.title.toLowerCase().includes(q);
          const matchDesc = alert.description.toLowerCase().includes(q);
          const matchRef = alert.statutoryReference.toLowerCase().includes(q);
          const matchSource = alert.source.toLowerCase().includes(q);
          const matchTenant = alert.tenantName?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchRef && !matchSource && !matchTenant) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned alerts always come first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (sortBy === 'severity') {
          const rank: Record<AlertSeverity, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return rank[b.severity] - rank[a.severity];
        }
        if (sortBy === 'urgency') {
          if (a.deadlineIso && !b.deadlineIso) return -1;
          if (!a.deadlineIso && b.deadlineIso) return 1;
          if (a.deadlineIso && b.deadlineIso) {
            return new Date(a.deadlineIso).getTime() - new Date(b.deadlineIso).getTime();
          }
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [alerts, selectedRole, severityFilter, statusFilter, frameworkFilter, searchQuery, sortBy]);

  // Statistics Counts
  const stats = useMemo(() => {
    const unread = alerts.filter((a) => a.status === 'UNREAD').length;
    const critical = alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
    const actionRequired = alerts.filter((a) => a.actionRequired && a.status !== 'RESOLVED').length;
    const resolved = alerts.filter((a) => a.status === 'RESOLVED').length;

    const roleCounts: Record<ComplianceRole, { unread: number; total: number }> = {
      AUDITOR: {
        unread: alerts.filter((a) => a.role === 'AUDITOR' && a.status === 'UNREAD').length,
        total: alerts.filter((a) => a.role === 'AUDITOR').length
      },
      SYSTEM_ADMIN: {
        unread: alerts.filter((a) => a.role === 'SYSTEM_ADMIN' && a.status === 'UNREAD').length,
        total: alerts.filter((a) => a.role === 'SYSTEM_ADMIN').length
      },
      COMPLIANCE_OFFICER: {
        unread: alerts.filter((a) => a.role === 'COMPLIANCE_OFFICER' && a.status === 'UNREAD').length,
        total: alerts.filter((a) => a.role === 'COMPLIANCE_OFFICER').length
      },
      LAWYER: {
        unread: alerts.filter((a) => a.role === 'LAWYER' && a.status === 'UNREAD').length,
        total: alerts.filter((a) => a.role === 'LAWYER').length
      }
    };

    return { unread, critical, actionRequired, resolved, roleCounts };
  }, [alerts]);

  // Triggering Simulation Alerts
  const handleTriggerPreset = (presetIdx: number) => {
    const preset = SIMULATION_PRESETS[presetIdx];
    if (!preset) return;

    const newAlert: ComplianceAlert = {
      ...preset,
      id: `ALT-SIM-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      status: 'UNREAD',
      isPinned: true,
      deadlineIso: preset.deadlineHours
        ? new Date(Date.now() + preset.deadlineHours * 3600 * 1000).toISOString()
        : undefined,
      auditHash: Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    };

    setAlerts((prev) => [newAlert, ...prev]);

    if (soundEnabled) {
      playComplianceAlertSound(newAlert.severity);
    }

    showToast(
      `Triggered statutory alert: ${newAlert.title}`,
      newAlert.severity === 'CRITICAL' ? 'error' : 'warning',
      `${ROLE_CONFIGS[newAlert.role]?.badgeLabel} Alert Stream`
    );

    // Switch view to target role if not currently showing all or that role
    if (selectedRole !== 'ALL' && selectedRole !== newAlert.role) {
      setSelectedRole(newAlert.role);
    }
  };

  const handleCreateCustomAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      showToast('Please enter an alert title', 'warning');
      return;
    }

    const newAlert: ComplianceAlert = {
      id: `ALT-CUST-${Date.now().toString(36).toUpperCase()}`,
      role: customRole,
      severity: customSeverity,
      framework: customFramework,
      statutoryReference: customArticle.trim() || 'Sovereign Compliance Directive',
      title: customTitle.trim(),
      description: customDesc.trim() || 'Custom compliance anomaly dispatched via real-time console.',
      source: 'Manual Compliance Dispatcher',
      timestamp: new Date().toISOString(),
      status: 'UNREAD',
      isPinned: customSeverity === 'CRITICAL',
      actionRequired: true,
      deadlineHours: customDeadline > 0 ? customDeadline : undefined,
      deadlineIso: customDeadline > 0 ? new Date(Date.now() + customDeadline * 3600 * 1000).toISOString() : undefined,
      auditHash: Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
      remediationAction: {
        id: 'resolve-custom',
        label: 'Acknowledge & Remediate',
        description: 'Enforce compliance controls.',
        autoRemediable: true
      },
      tenantName: 'Sovereign Enclave Production'
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setIsCustomAlertModalOpen(false);
    setCustomTitle('');
    setCustomDesc('');

    if (soundEnabled) {
      playComplianceAlertSound(newAlert.severity);
    }

    showToast(`Custom statutory alert dispatched to ${ROLE_CONFIGS[customRole]?.badgeLabel}`, 'success');

    if (selectedRole !== 'ALL' && selectedRole !== customRole) {
      setSelectedRole(customRole);
    }
  };

  // Mark Alert Status Actions
  const handleMarkRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === 'UNREAD' ? 'READ' : a.status } : a))
    );
  };

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
    showToast('Alert acknowledged and logged to compliance audit trail.', 'info');
  };

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED', actionRequired: false } : a))
    );
    if (soundEnabled) {
      playComplianceAlertSound('SUCCESS');
    }
    showToast('Compliance issue resolved and sealed in sovereign ledger.', 'success');
  };

  const handleTogglePin = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
    );
  };

  const handleMarkAllRead = () => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (selectedRole === 'ALL' || a.role === selectedRole) {
          return { ...a, status: a.status === 'UNREAD' ? 'READ' : a.status };
        }
        return a;
      })
    );
    showToast('All matching alerts marked as read.', 'success');
  };

  const handleClearResolved = () => {
    setAlerts((prev) =>
      prev.filter((a) => {
        if (selectedRole === 'ALL' || a.role === selectedRole) {
          return a.status !== 'RESOLVED';
        }
        return true;
      })
    );
    showToast('Cleared resolved alerts from view.', 'info');
  };

  const handleResetDefaults = () => {
    setAlerts(INITIAL_COMPLIANCE_ALERTS);
    localStorage.removeItem('sovereign_compliance_alerts');
    showToast('Compliance alert stream restored to default sovereign state.', 'success');
  };

  // Automated Remediation Runner
  const handleRunRemediation = (alert: ComplianceAlert) => {
    if (!alert.remediationAction) return;

    setRemediatingAlertId(alert.id);
    setRemediationProgress(10);
    setRemediationStep('1/4: Initializing sovereign security enclave sandbox...');

    setTimeout(() => {
      setRemediationProgress(40);
      setRemediationStep('2/4: Applying automated cryptographic policy hardening & boundary rules...');
    }, 600);

    setTimeout(() => {
      setRemediationProgress(75);
      setRemediationStep('3/4: Generating zero-knowledge audit receipt & appending to EBSI Merkle root...');
    }, 1200);

    setTimeout(() => {
      setRemediationProgress(100);
      setRemediationStep('4/4: Remediation verified and complete!');

      setTimeout(() => {
        handleResolve(alert.id);
        setRemediatingAlertId(null);
        setRemediationProgress(0);
        setRemediationStep('');
        showToast(
          `Automated remediation succeeded: ${alert.remediationAction?.label}`,
          'success',
          'Sovereign Automation Engine'
        );
      }, 500);
    }, 1800);
  };

  // Copy Hash Helper
  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    showToast('SHA-256 Audit Hash copied to clipboard', 'info');
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  // Export JSON Report
  const handleExportAlerts = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredAlerts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `sovereign-compliance-alerts-${selectedRole.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported compliance alerts audit log (JSON)', 'success');
  };

  // Helpers for visuals
  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            Critical
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Info className="w-3 h-3" />
            Medium
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            Low
          </span>
        );
    }
  };

  const getRoleIcon = (role: ComplianceRole) => {
    switch (role) {
      case 'AUDITOR':
        return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
      case 'SYSTEM_ADMIN':
        return <Server className="w-4 h-4 text-purple-500" />;
      case 'COMPLIANCE_OFFICER':
        return <FileCheck2 className="w-4 h-4 text-emerald-500" />;
      case 'LAWYER':
        return <Scale className="w-4 h-4 text-amber-500" />;
    }
  };

  if (isModal && !isOpen) return null;

  const content = (
    <div className={`flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${className}`}>
      {/* 1. Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-md shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Compliance Alert &amp; Statutory Dispatch
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Role-tailored statutory oversight: <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">Auditor</strong>, <strong className="text-purple-600 dark:text-purple-400 font-semibold">System Admin</strong>, <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Compliance Officer</strong>, and <strong className="text-amber-600 dark:text-amber-400 font-semibold">Lawyer</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Simulation Trigger Button */}
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Simulate role-specific statutory triggers"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-current" />
            <span>Simulate Trigger</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playComplianceAlertSound('SUCCESS');
            }}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
            title={soundEnabled ? 'Audio alerts enabled (Click to mute)' : 'Audio alerts muted (Click to enable)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportAlerts}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs transition-colors cursor-pointer"
            title="Export full JSON audit dossier"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs transition-colors cursor-pointer"
            title="Configure Alert Channels & Notification Routing"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Modal Close Button */}
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 hover:text-rose-600 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Role Selector Tabs */}
      <div className="p-3 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* ALL ROLES TAB */}
          <button
            onClick={() => setSelectedRole('ALL')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              selectedRole === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>All Statutory Feeds</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                selectedRole === 'ALL'
                  ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {alerts.length}
            </span>
          </button>

          {/* AUDITOR TAB */}
          <button
            onClick={() => setSelectedRole('AUDITOR')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              selectedRole === 'AUDITOR'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Auditor</span>
            {stats.roleCounts.AUDITOR.unread > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-500 text-white">
                {stats.roleCounts.AUDITOR.unread}
              </span>
            )}
          </button>

          {/* SYSTEM ADMIN TAB */}
          <button
            onClick={() => setSelectedRole('SYSTEM_ADMIN')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              selectedRole === 'SYSTEM_ADMIN'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span>System Admin</span>
            {stats.roleCounts.SYSTEM_ADMIN.unread > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500 text-white">
                {stats.roleCounts.SYSTEM_ADMIN.unread}
              </span>
            )}
          </button>

          {/* COMPLIANCE OFFICER TAB */}
          <button
            onClick={() => setSelectedRole('COMPLIANCE_OFFICER')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              selectedRole === 'COMPLIANCE_OFFICER'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compliance Officer (DPO)</span>
            {stats.roleCounts.COMPLIANCE_OFFICER.unread > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">
                {stats.roleCounts.COMPLIANCE_OFFICER.unread}
              </span>
            )}
          </button>

          {/* LAWYER TAB */}
          <button
            onClick={() => setSelectedRole('LAWYER')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              selectedRole === 'LAWYER'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Lawyer / Legal</span>
            {stats.roleCounts.LAWYER.unread > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-white">
                {stats.roleCounts.LAWYER.unread}
              </span>
            )}
          </button>
        </div>

        {/* Dispatch Custom Alert Modal Button */}
        <button
          onClick={() => setIsCustomAlertModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-500" />
          <span>New Alert</span>
        </button>
      </div>

      {/* 3. Role Statutory Focus Banner */}
      {selectedRole !== 'ALL' && (
        <div className="px-5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 truncate">
            {getRoleIcon(selectedRole)}
            <span className="font-bold text-slate-900 dark:text-white">
              {ROLE_CONFIGS[selectedRole]?.name} Enclave:
            </span>
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {ROLE_CONFIGS[selectedRole]?.statutoryFocus}
            </span>
          </div>
          {ROLE_CONFIGS[selectedRole]?.defaultPath && onNavigate && (
            <button
              onClick={() => onNavigate(ROLE_CONFIGS[selectedRole].defaultPath)}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2"
            >
              <span>Open Role Dashboard</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* 4. Controls & Filters Row */}
      <div className="p-3 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search article, source, keyword..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">🔴 Critical</option>
            <option value="HIGH">🟠 High</option>
            <option value="MEDIUM">🔵 Medium</option>
            <option value="LOW">⚪ Low</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNREAD">Unread Only</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Framework */}
          <select
            value={frameworkFilter}
            onChange={(e) => setFrameworkFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Frameworks</option>
            <option value="GDPR">GDPR (Regulation 2016/679)</option>
            <option value="EU_AI_ACT">EU AI Act (Title VIII)</option>
            <option value="NIS2">NIS2 Directive</option>
            <option value="DORA">DORA (Digital Resilience)</option>
            <option value="SOC2">SOC 2 Type II</option>
            <option value="EIDAS">eIDAS (Regulation 910/2014)</option>
            <option value="SOVEREIGNTY">EBSI / Sovereign Cloud</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="urgency">Statutory Urgency (Deadline)</option>
            <option value="severity">Highest Severity</option>
          </select>

          {/* Bulk Action Buttons */}
          <button
            onClick={handleMarkAllRead}
            className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Mark all matching alerts as read"
          >
            Mark Read
          </button>

          <button
            onClick={handleClearResolved}
            className="p-1.5 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Clear resolved alerts"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Active Remediation Progress Banner (if active) */}
      <AnimatePresence>
        {remediatingAlertId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-indigo-900/90 border-b border-indigo-700 text-white shrink-0"
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-300" />
                <span>Autonomous Sovereign Remediation Pipeline</span>
              </div>
              <span className="font-mono">{remediationProgress}%</span>
            </div>
            <div className="w-full bg-indigo-950/60 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-indigo-400 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${remediationProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-indigo-200 font-mono">{remediationStep}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Alerts Feed List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50 dark:bg-slate-950/50">
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/40">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Zero Unresolved Compliance Breaches
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
              No alerts match your current filter parameters. Use the simulation triggers below to test role-specific workflows.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => handleTriggerPreset(0)}
                className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                Simulate DPO Breach
              </button>
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Reset Default Alerts
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredAlerts.map((alert) => {
              const roleConfig = ROLE_CONFIGS[alert.role];
              const isRemediatingThis = remediatingAlertId === alert.id;

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => handleMarkRead(alert.id)}
                  className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                    alert.status === 'UNREAD'
                      ? 'bg-white dark:bg-slate-900 border-indigo-200/80 dark:border-indigo-900/60 shadow-sm'
                      : alert.status === 'RESOLVED'
                      ? 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 opacity-70'
                      : 'bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Left Highlight Ribbon */}
                  <div
                    className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-500'
                        : alert.severity === 'HIGH'
                        ? 'bg-amber-500'
                        : alert.severity === 'MEDIUM'
                        ? 'bg-blue-500'
                        : 'bg-slate-400'
                    }`}
                  />

                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 pl-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Severity */}
                      {getSeverityBadge(alert.severity)}

                      {/* Role Pill */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${roleConfig?.badgeBg || 'bg-slate-100 text-slate-700'}`}>
                        {getRoleIcon(alert.role)}
                        {roleConfig?.badgeLabel || alert.role}
                      </span>

                      {/* Statutory Framework */}
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {alert.statutoryReference}
                      </span>

                      {alert.tenantName && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                          • {alert.tenantName}
                        </span>
                      )}
                    </div>

                    {/* Right-aligned meta & actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(alert.id);
                        }}
                        className={`text-xs p-1 rounded-md transition-colors ${
                          alert.isPinned
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                            : 'text-slate-300 hover:text-slate-500'
                        }`}
                        title={alert.isPinned ? 'Unpin alert' : 'Pin alert to top'}
                      >
                        📌
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-2.5 pl-2">
                    <h3 className={`text-sm font-bold tracking-tight ${alert.status === 'RESOLVED' ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {alert.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {alert.description}
                    </p>
                  </div>

                  {/* Statutory Countdown Timer (if deadline exists) */}
                  {alert.deadlineIso && alert.status !== 'RESOLVED' && (
                    <div className="mt-3 pl-2">
                      <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
                          <span className="font-semibold text-amber-800 dark:text-amber-200">
                            Statutory Enforcement Window:
                          </span>
                        </div>
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                          Expires in ~{alert.deadlineHours || 72}h (Target: {new Date(alert.deadlineIso).toLocaleDateString()})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Source & Cryptographic Audit Hash */}
                  <div className="mt-3 pl-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="font-medium">Source:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {alert.source}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                      <span>Hash: {alert.auditHash.slice(0, 10)}...</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyHash(alert.auditHash, alert.id);
                        }}
                        className="p-1 hover:text-indigo-500 text-slate-400 transition-colors"
                        title="Copy full SHA-256 Audit Hash"
                      >
                        {copiedHashId === alert.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Remediation & Workflow Actions */}
                  <div className="mt-3 pl-2 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Automated Remediation Button */}
                      {alert.remediationAction && alert.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunRemediation(alert);
                          }}
                          disabled={isRemediatingThis}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>{alert.remediationAction.label}</span>
                        </button>
                      )}

                      {/* Deep Link to Platform Route */}
                      {alert.remediationAction?.targetPath && onNavigate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(alert.remediationAction!.targetPath!);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <span>Open Tool</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Status Toggles (Acknowledge, Resolve) */}
                    <div className="flex items-center gap-1.5">
                      {alert.status === 'UNREAD' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledge(alert.id);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}

                      {alert.status !== 'RESOLVED' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(alert.id);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAlerts((prev) =>
                              prev.map((a) =>
                                a.id === alert.id ? { ...a, status: 'UNREAD', actionRequired: true } : a
                              )
                            );
                            showToast('Alert re-opened for inspection', 'info');
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Re-open</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* 7. Bottom Stats & Quick Trigger Bar */}
      <div className="p-3 sm:px-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <span>
            Total Alerts: <strong className="text-slate-900 dark:text-white">{alerts.length}</strong>
          </span>
          <span>•</span>
          <span>
            Critical Pending:{' '}
            <strong className="text-rose-600 dark:text-rose-400">{stats.critical}</strong>
          </span>
          <span>•</span>
          <span>
            Resolved:{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">{stats.resolved}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Quick Simulations:</span>
          <button
            onClick={() => handleTriggerPreset(0)}
            className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            title="Trigger Article 33 Breach (DPO)"
          >
            ⚡ DPO Breach
          </button>
          <button
            onClick={() => handleTriggerPreset(1)}
            className="px-2 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            title="Trigger HSM Key Rotation (Admin)"
          >
            ⚡ HSM Expiry
          </button>
          <button
            onClick={() => handleTriggerPreset(2)}
            className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            title="Trigger immudb Anomaly (Auditor)"
          >
            ⚡ Audit Tamper
          </button>
          <button
            onClick={() => handleTriggerPreset(3)}
            className="px-2 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            title="Trigger Penalty Notice (Lawyer)"
          >
            ⚡ Fine Notice
          </button>
        </div>
      </div>

      {/* MODAL 1: Role Trigger Simulator Picker */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Simulate Role Compliance Triggers
                  </h3>
                  <p className="text-xs text-slate-500">Inject real-time statutory events into role channels</p>
                </div>
              </div>
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {SIMULATION_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    handleTriggerPreset(idx);
                    setIsSimulatorOpen(false);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/20 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
                        {ROLE_CONFIGS[preset.role]?.badgeLabel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">
                        {preset.statutoryReference}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {preset.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {preset.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0 ml-2" />
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Custom Alert */}
      {isCustomAlertModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustomAlert}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Dispatch Custom Compliance Alert
                  </h3>
                  <p className="text-xs text-slate-500">Configure target role, statutory rule, and severity</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomAlertModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Role
                  </label>
                  <select
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="AUDITOR">Auditor</option>
                    <option value="SYSTEM_ADMIN">System Admin</option>
                    <option value="COMPLIANCE_OFFICER">Compliance Officer (DPO)</option>
                    <option value="LAWYER">Lawyer / Legal</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Severity
                  </label>
                  <select
                    value={customSeverity}
                    onChange={(e) => setCustomSeverity(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="CRITICAL">Critical (Urgent)</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Framework
                  </label>
                  <select
                    value={customFramework}
                    onChange={(e) => setCustomFramework(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="GDPR">GDPR</option>
                    <option value="EU_AI_ACT">EU AI Act</option>
                    <option value="NIS2">NIS2</option>
                    <option value="DORA">DORA</option>
                    <option value="SOC2">SOC 2</option>
                    <option value="EIDAS">eIDAS</option>
                    <option value="SOVEREIGNTY">EBSI / Sovereignty</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Statutory Article
                  </label>
                  <input
                    type="text"
                    value={customArticle}
                    onChange={(e) => setCustomArticle(e.target.value)}
                    placeholder="e.g. GDPR Art. 33(1)"
                    className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Alert Title *
                </label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Article 33 72-Hour Breach Window Alert"
                  className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description &amp; Incident Context
                </label>
                <textarea
                  rows={2}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Provide technical and regulatory incident details..."
                  className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Statutory Deadline Countdown (Hours, 0 for none)
                </label>
                <input
                  type="number"
                  min="0"
                  max="720"
                  value={customDeadline}
                  onChange={(e) => setCustomDeadline(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCustomAlertModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Alert</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Channel Notification Routing Settings */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Compliance Notification Settings
                  </h3>
                  <p className="text-xs text-slate-500">Configure delivery channels &amp; audio alerts</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Sound toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    High-Tech Audio Chimes
                  </span>
                  <span className="text-slate-500">Play sovereign acoustic tones on new alerts</span>
                </div>
                <button
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    if (!soundEnabled) playComplianceAlertSound('CRITICAL');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                    soundEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {soundEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Critical SMS Escalation */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Critical SMS Escalation
                  </span>
                  <span className="text-slate-500">Auto-dispatch SMS for 72h Article 33 breaches</span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  ACTIVE
                </span>
              </div>

              {/* eIDAS Encrypted Email */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    eIDAS Encrypted Digest
                  </span>
                  <span className="text-slate-500">Daily statutory bulletin with QES signature</span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                  CONFIGURED
                </span>
              </div>

              {/* SIEM Webhook */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  SIEM / Webhook Forwarder
                </span>
                <input
                  type="text"
                  readOnly
                  value="https://sovereign-siem.enclave.eu/v1/compliance-webhook"
                  className="w-full font-mono text-[10px] p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  showToast('Notification routing configuration saved.', 'success');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default RoleBasedNotificationPanel;
