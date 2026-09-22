import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Sliders, 
  Eye, 
  Key, 
  Layers, 
  Activity, 
  FileText, 
  Download, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  UserX, 
  ShieldX, 
  Network, 
  Database, 
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchWithRetry } from '../lib/api-client';

interface PermissionDiscrepancy {
  id: string;
  identityName: string;
  email: string;
  assignedRole: 'EU_REGULATOR' | 'CLIENT' | 'TENANT' | 'DEVELOPER' | 'COMPLIANCE_AUDITOR';
  organizationalUnit: 'Executive' | 'DevOps & Infrastructure' | 'Financial Ops' | 'External Legal & Audit' | 'Client Success';
  grantedScopes: string[];
  exercisedScopes: string[];
  excessiveScopes: string[];
  riskType: 'PRIVILEGE_ESCALATION' | 'SOD_VIOLATION' | 'UNUSED_ADMIN_RIGHTS' | 'ORPHANED_SERVICE_ACCOUNT' | 'WILDCARD_SCOPE';
  riskScore: number; // 0 - 100
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detectionTime: string;
  status: 'ACTIVE_RISK' | 'REMEDIATED' | 'UNDER_REVIEW' | 'EXEMPTION_GRANTED';
  details: string;
  recommendation: string;
}

interface ReconciliationMetrics {
  totalIdentitiesAnalyzed: number;
  criticalEscalationsCount: number;
  sodViolationsCount: number;
  unusedAdminScopesCount: number;
  averageAccessDriftScore: number;
  lastReconciliationTime: string;
}

export const PermissionReconciliationDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedRiskType, setSelectedRiskType] = useState<string>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<PermissionDiscrepancy | null>(null);
  const [remediatingId, setRemediatingId] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [liveLogStream, setLiveLogStream] = useState<Array<{ id: string; time: string; msg: string; type: 'info' | 'warn' | 'success' }>>([]);

  // Mock initial reconciliation data
  const [discrepancies, setDiscrepancies] = useState<PermissionDiscrepancy[]>([
    {
      id: 'DISC-901',
      identityName: 'alex.vanderberg',
      email: 'alex.v@regulettee.eu',
      assignedRole: 'DEVELOPER',
      organizationalUnit: 'DevOps & Infrastructure',
      grantedScopes: ['repo:write', 'k8s:cluster-admin', 'db:prod-master-write', 'vault:root-keys', 'audit:read'],
      exercisedScopes: ['repo:write', 'k8s:cluster-admin'],
      excessiveScopes: ['db:prod-master-write', 'vault:root-keys'],
      riskType: 'PRIVILEGE_ESCALATION',
      riskScore: 94,
      severity: 'CRITICAL',
      detectionTime: '3 minutes ago',
      status: 'ACTIVE_RISK',
      details: 'Developer account granted root database write keys and master security vault access via an inherited wildcard policy.',
      recommendation: 'Revoke "db:prod-master-write" and "vault:root-keys". Restrict scope to "db:dev-write".'
    },
    {
      id: 'DISC-902',
      identityName: 'finance.automation.bot',
      email: 'svc-bot@9xen-regulettee-billing.internal',
      assignedRole: 'TENANT',
      organizationalUnit: 'Financial Ops',
      grantedScopes: ['billing:write', 'audit:delete', 'user:impersonate', 'tenant:admin'],
      exercisedScopes: ['billing:write'],
      excessiveScopes: ['audit:delete', 'user:impersonate', 'tenant:admin'],
      riskType: 'SOD_VIOLATION',
      riskScore: 88,
      severity: 'CRITICAL',
      detectionTime: '12 minutes ago',
      status: 'ACTIVE_RISK',
      details: 'Separation of Duties (SoD) Breach: Service account possesses both financial ledger execution rights AND immutable audit log deletion rights.',
      recommendation: 'Immediately revoke "audit:delete" and "user:impersonate" rights from automated billing worker.'
    },
    {
      id: 'DISC-903',
      identityName: 'claire.dubois',
      email: 'c.dubois@client-lux.com',
      assignedRole: 'CLIENT',
      organizationalUnit: 'Client Success',
      grantedScopes: ['client:view', 'reports:export', 'eu-regulator:override', 'policy:edit-global'],
      exercisedScopes: ['client:view', 'reports:export'],
      excessiveScopes: ['eu-regulator:override', 'policy:edit-global'],
      riskType: 'PRIVILEGE_ESCALATION',
      riskScore: 91,
      severity: 'CRITICAL',
      detectionTime: '28 minutes ago',
      status: 'ACTIVE_RISK',
      details: 'External client account granted "eu-regulator:override" scope permitting cross-tenant policy override.',
      recommendation: 'Strip regulator overrides immediately and isolate access to client tenant scope.'
    },
    {
      id: 'DISC-904',
      identityName: 'marcus.stein',
      email: 'm.stein@regulettee.eu',
      assignedRole: 'COMPLIANCE_AUDITOR',
      organizationalUnit: 'External Legal & Audit',
      grantedScopes: ['audit:read', 'compliance:write', 'system:restart', 'db:schema-alter'],
      exercisedScopes: ['audit:read'],
      excessiveScopes: ['system:restart', 'db:schema-alter'],
      riskType: 'UNUSED_ADMIN_RIGHTS',
      riskScore: 72,
      severity: 'HIGH',
      detectionTime: '1 hour ago',
      status: 'ACTIVE_RISK',
      details: 'Auditor identity holds system administration and database alter rights that have remained unexercised for 180+ days.',
      recommendation: 'Prune unused admin rights and downgrade to read-only compliance auditor role profile.'
    },
    {
      id: 'DISC-905',
      identityName: 'legacy-contractor-svc',
      email: 'contractor-ext@partner-agency.de',
      assignedRole: 'TENANT',
      organizationalUnit: 'DevOps & Infrastructure',
      grantedScopes: ['api:*', 'auth:bypass-mfa', 'storage:global-read'],
      exercisedScopes: [],
      excessiveScopes: ['api:*', 'auth:bypass-mfa', 'storage:global-read'],
      riskType: 'ORPHANED_SERVICE_ACCOUNT',
      riskScore: 96,
      severity: 'CRITICAL',
      detectionTime: '2 hours ago',
      status: 'ACTIVE_RISK',
      details: 'Contractor service identity remains active with wildcard API access and MFA bypass permissions after contract termination.',
      recommendation: 'Quarantine and deactivate orphaned account credentials immediately.'
    },
    {
      id: 'DISC-906',
      identityName: 'helena.korhonen',
      email: 'h.korhonen@fintech-nordic.fi',
      assignedRole: 'EU_REGULATOR',
      organizationalUnit: 'External Legal & Audit',
      grantedScopes: ['regulator:inspect', 'sanction:apply', 'data:pii-decrypt-raw'],
      exercisedScopes: ['regulator:inspect'],
      excessiveScopes: ['data:pii-decrypt-raw'],
      riskType: 'WILDCARD_SCOPE',
      riskScore: 65,
      severity: 'MEDIUM',
      detectionTime: '4 hours ago',
      status: 'UNDER_REVIEW',
      details: 'Regulator account holds raw PII decryption privileges without explicit active case ticket requirement.',
      recommendation: 'Enforce Just-In-Time (JIT) approval workflow for raw PII decryption attempts.'
    }
  ]);

  // Live log simulation stream
  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const events = [
        { msg: 'IAM Token Evaluator: Re-calculated access drift for 142 identities.', type: 'info' as const },
        { msg: 'Zero-Trust Gatekeeper: Detected unexercised "db:prod-master-write" scope on alex.vanderberg.', type: 'warn' as const },
        { msg: 'OIDC Session Observer: Token refresh validated for superadmin session.', type: 'info' as const },
        { msg: 'SoD Enforcement Matrix: Verified 0 new toxic combination creations in past 5 mins.', type: 'success' as const }
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setLiveLogStream(prev => [
        { id: Math.random().toString(), time: timestamp, msg: randomEvent.msg, type: randomEvent.type },
        ...prev.slice(0, 7)
      ]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Compute metrics dynamically
  const metrics: ReconciliationMetrics = useMemo(() => {
    const activeRisks = discrepancies.filter(d => d.status === 'ACTIVE_RISK');
    const criticals = activeRisks.filter(d => d.severity === 'CRITICAL').length;
    const sods = activeRisks.filter(d => d.riskType === 'SOD_VIOLATION').length;
    const unused = activeRisks.filter(d => d.riskType === 'UNUSED_ADMIN_RIGHTS').length;
    
    const avgDrift = Math.round(
      discrepancies.reduce((acc, curr) => acc + (curr.excessiveScopes.length / (curr.grantedScopes.length || 1)) * 100, 0) / (discrepancies.length || 1)
    );

    return {
      totalIdentitiesAnalyzed: 184,
      criticalEscalationsCount: criticals,
      sodViolationsCount: sods,
      unusedAdminScopesCount: unused,
      averageAccessDriftScore: avgDrift,
      lastReconciliationTime: 'Just now (Real-time)'
    };
  }, [discrepancies]);

  // Filtered Discrepancies
  const filteredDiscrepancies = useMemo(() => {
    return discrepancies.filter(item => {
      const matchesSearch = 
        item.identityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = selectedSeverity === 'ALL' || item.severity === selectedSeverity;
      const matchesRiskType = selectedRiskType === 'ALL' || item.riskType === selectedRiskType;
      const matchesUnit = selectedUnit === 'ALL' || item.organizationalUnit === selectedUnit;

      return matchesSearch && matchesSeverity && matchesRiskType && matchesUnit;
    });
  }, [discrepancies, searchTerm, selectedSeverity, selectedRiskType, selectedUnit]);

  // Trigger Deep Scan
  const handleRunReconciliationScan = () => {
    setIsScanning(true);
    setScanProgress(10);

    const timer = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsScanning(false);
          // Add a new discovered or refreshed finding
          setLiveLogStream(old => [
            { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: 'Deep Permission Scan Complete: Reconciled 184 roles & 1,420 token scopes.', type: 'success' },
            ...old
          ]);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // Remediate Discrepancy
  const handleRemediate = (id: string, actionName: string) => {
    setRemediatingId(id);
    setTimeout(() => {
      setDiscrepancies(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'REMEDIATED',
            details: `${item.details} [REMEDIATED via ${actionName} at ${new Date().toLocaleTimeString()}]`
          };
        }
        return item;
      }));
      setRemediatingId(null);
      setLiveLogStream(old => [
        { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `Remediation executed on ${id}: ${actionName}`, type: 'success' },
        ...old
      ]);
    }, 800);
  };

  // Auto-Remediate All Criticals
  const handleAutoRemediateAllCriticals = () => {
    setIsScanning(true);
    setTimeout(() => {
      setDiscrepancies(prev => prev.map(item => {
        if (item.severity === 'CRITICAL' && item.status === 'ACTIVE_RISK') {
          return { ...item, status: 'REMEDIATED' };
        }
        return item;
      }));
      setIsScanning(false);
      setLiveLogStream(old => [
        { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: 'Auto-Remediation Batch Executed: Cleared all Critical Privilege Escalations.', type: 'success' },
        ...old
      ]);
    }, 1200);
  };

  // Run AI Role Risk Analysis
  const handleRunAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    setAiAnalysisResult(null);

    try {
      const res = await fetchWithRetry('/api/v1/admin/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'gemini',
          testPrompt: `Analyze these permission reconciliation findings for 9Xen Regulettee CaaS:
1. Developer granted root DB write and master vault access.
2. Finance bot has both billing write and immutable audit deletion rights (SoD Breach).
3. Client account has regulator cross-tenant override rights.
4. Contractor service account has wildcard API permissions after contract termination.

Provide 3 concise, highly actionable Zero-Trust privilege containment recommendations.`
        })
      });

      const data = await res.json();
      if (data.success && data.message) {
        setAiAnalysisResult(data.message);
      } else {
        setAiAnalysisResult(`AI Recommendation Engine Analysis:
1. Enforce Automated Separation of Duties (SoD) Guards: Programmatically reject token generation for identities attempting to combine audit log deletion with ledger write scopes.
2. Just-In-Time (JIT) Scoping: Downgrade developer root DB access to temporary, approval-backed 15-minute lease tokens.
3. Automated Lifecycle Deprovisioning: Tie OIDC contractor service account lifetimes strictly to contract end dates with immediate credential revocation.`);
      }
    } catch (e) {
      setAiAnalysisResult(`AI Zero-Trust Containment Directives:
• Immediate SoD Policy Lockdown: Revoke audit log deletion scopes from automated billing services.
• Strip Cross-Tenant Overrides: Restrict client roles to explicit tenant boundaries.
• Ephemeral DB Tokenization: Implement temporary 15-min lease credentials for DB admin tasks.`);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const getSeverityBadge = (severity: PermissionDiscrepancy['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200 font-semibold';
      case 'LOW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
    }
  };

  const getRiskTypeLabel = (riskType: PermissionDiscrepancy['riskType']) => {
    switch (riskType) {
      case 'PRIVILEGE_ESCALATION': return 'Privilege Escalation';
      case 'SOD_VIOLATION': return 'SoD Breach (Toxic Pair)';
      case 'UNUSED_ADMIN_RIGHTS': return 'Dormant Admin Scope';
      case 'ORPHANED_SERVICE_ACCOUNT': return 'Orphaned Credentials';
      case 'WILDCARD_SCOPE': return 'Over-broad Wildcard (*)';
    }
  };

  return (
    <div id="permission-reconciliation-dashboard" className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 text-slate-800">
      
      {/* Header Banner */}
      <div id="reconciliation-header-banner" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                Real-Time Identity Governance
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-1 rounded-full font-semibold">
                Zero-Trust IAM Reconciler
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Permission Reconciliation & Access Drift Engine
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Continuously monitors, compares assigned roles against active token scopes, and flags potential privilege escalations, toxic Separation of Duties (SoD) breaches, and excessive access rights.
            </p>
          </div>

          {/* Action Button Group */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-trigger-reconciliation-scan"
              onClick={handleRunReconciliationScan}
              disabled={isScanning}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? `Reconciling (${scanProgress}%)` : 'Run Deep Reconciliation'}</span>
            </button>

            <button
              id="btn-auto-remediate-all"
              onClick={handleAutoRemediateAllCriticals}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Auto-Fix Critical Risks</span>
            </button>
          </div>
        </div>

        {/* Scan Progress Bar */}
        {isScanning && (
          <div className="mt-4 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div id="reconciliation-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div id="metric-total-identities" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monitored Identities</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{metrics.totalIdentitiesAnalyzed}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Scope Audited
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div id="metric-critical-escalations" className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
          <div>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Critical Escalations</p>
            <p className="text-2xl font-black text-rose-700 mt-1">{metrics.criticalEscalationsCount}</p>
            <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Require Immediate Action
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div id="metric-sod-violations" className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Toxic SoD Conflicts</p>
            <p className="text-2xl font-black text-amber-800 mt-1">{metrics.sodViolationsCount}</p>
            <p className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Ledger + Audit Combinations
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <div id="metric-access-drift" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Access Drift Index</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{metrics.averageAccessDriftScore}%</p>
            <p className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Excessive Rights Baseline
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Network className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Layout: Filters + Discrepancies Table + Sidebar Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left Column: Filter Controls & Discrepancies List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search & Filter Toolbar */}
          <div id="reconciliation-toolbar" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-discrepancy"
                type="text"
                placeholder="Search identity, scope, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              
              <select
                id="select-filter-severity"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <select
                id="select-filter-risktype"
                value={selectedRiskType}
                onChange={(e) => setSelectedRiskType(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Risk Types</option>
                <option value="PRIVILEGE_ESCALATION">Privilege Escalation</option>
                <option value="SOD_VIOLATION">SoD Violation</option>
                <option value="UNUSED_ADMIN_RIGHTS">Unused Admin Scopes</option>
                <option value="ORPHANED_SERVICE_ACCOUNT">Orphaned Account</option>
                <option value="WILDCARD_SCOPE">Wildcard Scope</option>
              </select>

              <select
                id="select-filter-unit"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Org Units</option>
                <option value="DevOps & Infrastructure">DevOps & Infra</option>
                <option value="Financial Ops">Financial Ops</option>
                <option value="External Legal & Audit">Legal & Audit</option>
                <option value="Client Success">Client Success</option>
              </select>

            </div>
          </div>

          {/* Discrepancies List / Cards */}
          <div id="discrepancies-list-container" className="space-y-3">
            {filteredDiscrepancies.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-bold text-slate-800 text-base">No Permission Discrepancies Found</p>
                <p className="text-xs text-slate-500 mt-1">All monitored identities match their least-privilege role specifications.</p>
              </div>
            ) : (
              filteredDiscrepancies.map((item) => (
                <motion.div
                  key={item.id}
                  id={`discrepancy-card-${item.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white p-5 rounded-2xl border transition-all shadow-sm hover:shadow-md ${
                    item.status === 'REMEDIATED' 
                      ? 'border-emerald-200 bg-emerald-50/20' 
                      : item.severity === 'CRITICAL' 
                      ? 'border-rose-200 hover:border-rose-300' 
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    {/* Identity Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-black text-slate-900 text-sm">{item.identityName}</span>
                        <span className="text-xs text-slate-500">({item.email})</span>
                        
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${getSeverityBadge(item.severity)}`}>
                          {item.severity}
                        </span>

                        <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          {getRiskTypeLabel(item.riskType)}
                        </span>

                        {item.status === 'REMEDIATED' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Remediated
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 font-medium pt-1">
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          Role: {item.assignedRole}
                        </span>
                        <span className="mx-2 text-slate-300">|</span>
                        <span>{item.organizationalUnit}</span>
                        <span className="mx-2 text-slate-300">|</span>
                        <span className="text-slate-400">Detected: {item.detectionTime}</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {item.details}
                      </p>

                      {/* Scopes Comparison Badges */}
                      <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] font-bold text-slate-500 mr-1">Granted Scopes:</span>
                        {item.grantedScopes.map(scope => {
                          const isExcessive = item.excessiveScopes.includes(scope);
                          return (
                            <span 
                              key={scope}
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                isExcessive && item.status !== 'REMEDIATED'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {scope} {isExcessive && item.status !== 'REMEDIATED' ? '⚠️' : ''}
                            </span>
                          );
                        })}
                      </div>

                      {/* Recommendation Box */}
                      {item.status !== 'REMEDIATED' && (
                        <div className="mt-3 bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 font-medium flex items-start space-x-2">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Zero-Trust Recommendation: </span>
                            {item.recommendation}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0">
                      
                      <button
                        id={`btn-view-details-${item.id}`}
                        onClick={() => setSelectedDiscrepancy(item)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 transition-all flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      {item.status !== 'REMEDIATED' && (
                        <button
                          id={`btn-remediate-now-${item.id}`}
                          onClick={() => handleRemediate(item.id, 'Scope Pruning')}
                          disabled={remediatingId === item.id}
                          className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center space-x-1 disabled:opacity-50"
                        >
                          <ShieldX className="w-3.5 h-3.5" />
                          <span>{remediatingId === item.id ? 'Fixing...' : 'Prune Scopes'}</span>
                        </button>
                      )}

                    </div>

                  </div>
                </motion.div>
              ))
            )}
          </div>

        </div>

        {/* Right Column: AI Insights & Live Stream (1 col) */}
        <div className="space-y-4">
          
          {/* AI Privilege Governance Copilot Panel */}
          <div id="ai-governance-panel" className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">AI Privilege Copilot</h3>
                  <p className="text-[11px] text-slate-500">Gemini Real-time IAM Evaluator</p>
                </div>
              </div>

              <button
                id="btn-run-ai-analysis"
                onClick={handleRunAiAnalysis}
                disabled={isAiAnalyzing}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiAnalyzing ? 'animate-spin text-indigo-600' : ''}`} />
                <span>{isAiAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
              </button>
            </div>

            {aiAnalysisResult ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                {aiAnalysisResult}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Click "Analyze" to run generative AI cross-correlation on excessive scopes and toxic role combinations across your active tenants.
              </p>
            )}
          </div>

          {/* Real-time Event Stream Ticker */}
          <div id="reconciliation-live-ticker" className="bg-slate-900 p-5 rounded-2xl text-slate-100 shadow-md space-y-3 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">Live Access Stream</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">IAM-EVENT-BUS</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {liveLogStream.map((log) => (
                <div key={log.id} className="text-[11px] font-mono leading-tight border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-500 mr-2">[{log.time}]</span>
                  <span className={
                    log.type === 'warn' ? 'text-amber-400' :
                    log.type === 'success' ? 'text-emerald-400' : 'text-indigo-300'
                  }>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-950 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              Zero-Trust Principle
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Every token granted must strictly mirror the minimum scopes required for current operational duties. Automatic scope reconciliation prevents silent privilege creep and insider threat escalation.
            </p>
          </div>

        </div>

      </div>

      {/* Discrepancy Detail Inspector Modal */}
      <AnimatePresence>
        {selectedDiscrepancy && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-5 lg:p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-6 h-6 text-rose-600" />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Identity Scope Inspector</h3>
                    <p className="text-xs text-slate-500">ID: {selectedDiscrepancy.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDiscrepancy(null)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-semibold block">Identity Name</span>
                    <span className="font-black text-slate-900 text-sm">{selectedDiscrepancy.identityName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Assigned Role</span>
                    <span className="font-bold text-indigo-700">{selectedDiscrepancy.assignedRole}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Risk Type</span>
                    <span className="font-bold text-rose-600">{getRiskTypeLabel(selectedDiscrepancy.riskType)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Risk Score</span>
                    <span className="font-black text-slate-900">{selectedDiscrepancy.riskScore} / 100</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Details & Context</h4>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                    {selectedDiscrepancy.details}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Granted vs Excessive Scopes</h4>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div>
                      <span className="font-semibold text-slate-500 block mb-1">Granted Scopes:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedDiscrepancy.grantedScopes.map(s => (
                          <span key={s} className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-rose-600 block mb-1">Excessive Scopes (To be revoked):</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedDiscrepancy.excessiveScopes.map(s => (
                          <span key={s} className="bg-rose-100 text-rose-800 border border-rose-300 font-bold px-2 py-0.5 rounded font-mono text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      handleRemediate(selectedDiscrepancy.id, 'Interactive Inspection Revocation');
                      setSelectedDiscrepancy(null);
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
                  >
                    Prune Excessive Scopes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
