import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Layers, 
  Building2, 
  Scale, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  FileText, 
  TrendingUp, 
  RefreshCw, 
  Sliders, 
  Zap,
  Globe2,
  Users,
  Terminal,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

export interface RoleBasedComplianceDashboardProps {
  currentRole?: string;
  onNavigate?: (path: string) => void;
  className?: string;
  tenantContext?: any;
}

export const RoleBasedComplianceDashboard: React.FC<RoleBasedComplianceDashboardProps> = ({
  currentRole = 'TENANT_OWNER',
  onNavigate,
  className = '',
  tenantContext
}) => {
  const { showToast } = useNotification();
  const [selectedRoleView, setSelectedRoleView] = useState<string>(currentRole);
  const [activeTab, setActiveTab] = useState<'kpis' | 'matrix' | 'actions' | 'enclave'>('kpis');
  const [filterRegion, setFilterRegion] = useState<string>('EU-CENTRAL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [executedItems, setExecutedItems] = useState<Record<string, boolean>>({});

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Enclave metrics and regulatory telemetry refreshed', 'info');
    }, 600);
  };

  const roleConfigs: Record<string, {
    title: string;
    badge: string;
    badgeColor: string;
    description: string;
    score: number;
    regulations: string[];
    primaryMetrics: { label: string; value: string; change: string; isGood: boolean }[];
    actionItems: { id: string; title: string; priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; due: string; status: string }[];
    quickRoutes: { label: string; path: string; icon: any }[];
  }> = {
    TENANT_OWNER: {
      title: 'Tenant Executive & Compliance Officer Dashboard',
      badge: 'Client Tenant',
      badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700',
      description: 'Continuous GDPR, NIS2, and EU AI Act operational enforcement across decentralized cloud data assets.',
      score: 94.8,
      regulations: ['GDPR Art. 30/32', 'EU AI Act Tier-2', 'NIS2 Essential', 'DORA Resilient'],
      primaryMetrics: [
        { label: 'Sovereign Enclave Score', value: '94.8%', change: '+2.4% vs last audit', isGood: true },
        { label: 'Active Data Assets Protected', value: '1,428', change: '100% encrypted AES-256', isGood: true },
        { label: 'Pending DSR & Subject Requests', value: '3', change: 'All within SLA (<14d)', isGood: true },
        { label: 'Zero-Trust Shield Status', value: 'Secured', change: 'eIDAS v2 Enclave Active', isGood: true },
      ],
      actionItems: [
        { id: 'ACT-101', title: 'Rotate KMS Keyring for Frankurt Sub-region', priority: 'HIGH', due: 'In 2 days', status: 'Pending' },
        { id: 'ACT-102', title: 'Complete Bi-annual EDPB Cross-Border Audit Log', priority: 'MEDIUM', due: 'In 5 days', status: 'In Progress' },
        { id: 'ACT-103', title: 'Verify AI Model Explainability Manifest v2.4', priority: 'CRITICAL', due: 'Today', status: 'Action Required' },
      ],
      quickRoutes: [
        { label: 'Client Command Center', path: 'client', icon: Building2 },
        { label: 'AI Risk Audit Engine', path: 'ai-risk-audit', icon: Sparkles },
        { label: 'NIS2 Resilience Hub', path: 'nis2-dashboard', icon: ShieldCheck },
        { label: 'Sovereign Vault', path: 'vault', icon: Lock }
      ]
    },
    EU_REGULATOR: {
      title: 'EU Supervisory Authority & DPA Enforcement Hub',
      badge: 'EU Regulator',
      badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700',
      description: 'Cross-border entity surveillance, statutory deadline enforcement, and penalty treasury supervision.',
      score: 98.2,
      regulations: ['GDPR Art. 58/83', 'EU AI Act CE Conformity', 'EDPB Cross-Border Portal', 'eIDAS Trust Service'],
      primaryMetrics: [
        { label: 'Supervised Entities', value: '412', change: '28 high-risk entities', isGood: true },
        { label: 'Active Enforcement Inquiries', value: '17', change: '4 penalty appeals pending', isGood: false },
        { label: 'Statutory Timelines on Track', value: '99.1%', change: 'EDPB guideline compliant', isGood: true },
        { label: 'Treasury Fine Recoveries', value: '€4.28M', change: 'Settled to member states', isGood: true },
      ],
      actionItems: [
        { id: 'REG-201', title: 'Issue Preliminary Findings to Telecom Entity X', priority: 'CRITICAL', due: 'In 24 hrs', status: 'Formal Notice' },
        { id: 'REG-202', title: 'Audit AI Credit Scoring Model Deployment Logs', priority: 'HIGH', due: 'In 3 days', status: 'Subpoena Sent' },
        { id: 'REG-203', title: 'Review Annual Privacy Certification for Financial Core', priority: 'MEDIUM', due: 'In 1 week', status: 'Reviewing' },
      ],
      quickRoutes: [
        { label: 'Regulator Command Center', path: 'regulator', icon: Scale },
        { label: 'Enforcement Action Center', path: 'enforcement-action-center', icon: AlertTriangle },
        { label: 'Penalty Calculator', path: 'penalty-calculator', icon: Activity },
        { label: 'Audit Trail Ledger', path: 'audit-trail', icon: FileText }
      ]
    },
    LAWYER: {
      title: 'Legal Counsel & Regulatory Advisory Workspace',
      badge: 'Legal Partner',
      badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
      description: 'Client portfolio defense, automated legal contract verification, and regulatory litigation preparation.',
      score: 96.5,
      regulations: ['EU Data Protection Case Law', 'SCC 2021 Modules 1-4', 'NIS2 Liability Shield', 'B2G Legal Protocol'],
      primaryMetrics: [
        { label: 'Managed Enterprise Clients', value: '64', change: '12 added this quarter', isGood: true },
        { label: 'Active Policy Drafts & Review', value: '29', change: '8 pending sign-off', isGood: true },
        { label: 'Penalty Appeal Success Rate', value: '87.5%', change: '€1.2M fines mitigated', isGood: true },
        { label: 'eIDAS Qualified Signatures', value: '142', change: 'Quantum-safe signed', isGood: true },
      ],
      actionItems: [
        { id: 'LAW-301', title: 'File DPA Mitigation Memorandum for Fintech Alpha', priority: 'CRITICAL', due: 'Tomorrow', status: 'Drafting' },
        { id: 'LAW-302', title: 'Execute Standard Contractual Clauses with US Vendor', priority: 'HIGH', due: 'In 4 days', status: 'Client Signing' },
        { id: 'LAW-303', title: 'Complete AI Governance Charter Review for HealthTech', priority: 'MEDIUM', due: 'In 6 days', status: 'Legal Review' },
      ],
      quickRoutes: [
        { label: 'Lawyer Partner Portal', path: 'lawyer-portal', icon: Scale },
        { label: 'Legal CRM Suite', path: 'legal-crm', icon: Users },
        { label: 'ALSP Execution Studio', path: 'alsp-studio', icon: Terminal },
        { label: 'Courtroom Appeal Hub', path: 'penalty-appeal', icon: ShieldCheck }
      ]
    },
    ADMIN: {
      title: 'Platform Sovereign HQ & SuperAdmin Console',
      badge: 'Platform Admin',
      badgeColor: 'bg-purple-900/60 text-purple-300 border-purple-700',
      description: 'Multi-tenant cloud orchestration, cryptographic proof ledgers, and sovereign telemetry telemetry.',
      score: 99.9,
      regulations: ['ISO 27001 / SOC 2 Type II', 'eIDAS Tier-4 Hardware', 'Quantum-Resistant KEM', 'CaaS Multi-Region'],
      primaryMetrics: [
        { label: 'Global Active Nodes', value: '12 Nodes', change: '100% healthy, 0 failovers', isGood: true },
        { label: 'Multi-Tenant Workspaces', value: '1,248', change: 'Across 14 EU regions', isGood: true },
        { label: 'Autonomous Remediation Rate', value: '99.4%', change: '<250ms avg response', isGood: true },
        { label: 'Platform Uptime SLA', value: '99.99%', change: '342 days zero downtime', isGood: true },
      ],
      actionItems: [
        { id: 'ADM-401', title: 'Validate Frankfurt Enclave Memory Attestation', priority: 'HIGH', due: 'In 1 day', status: 'Scheduled' },
        { id: 'ADM-402', title: 'Synchronize EDPB Lex Feed Vector Indexes', priority: 'MEDIUM', due: 'In 3 days', status: 'Automated' },
        { id: 'ADM-403', title: 'Review Treasury Liquidity for CaaS Partners', priority: 'LOW', due: 'In 1 week', status: 'Pending Review' },
      ],
      quickRoutes: [
        { label: 'Platform Dashboard', path: 'platform-dashboard', icon: Activity },
        { label: 'Multi-Tenant Manager', path: 'admin-tenants', icon: Building2 },
        { label: 'Zero-Downtime Hub', path: 'zero-downtime', icon: RefreshCw },
        { label: 'System Health Logs', path: 'system-management', icon: Terminal }
      ]
    }
  };

  const activeConfig = roleConfigs[selectedRoleView] || roleConfigs.TENANT_OWNER;

  return (
    <div className={`p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl ${className}`}>
      {/* Header with Role Selector & Quick Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${activeConfig.badgeColor}`}>
              {activeConfig.badge}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Enclave Synchronized
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {activeConfig.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            {activeConfig.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dynamic Role Switcher for seamless cross-dashboard exploration */}
          <div className="p-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedRoleView('TENANT_OWNER')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedRoleView === 'TENANT_OWNER'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoleView('EU_REGULATOR')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedRoleView === 'EU_REGULATOR'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Regulator
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoleView('LAWYER')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedRoleView === 'LAWYER'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lawyer
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoleView('ADMIN')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedRoleView === 'ADMIN'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin HQ
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Real-time Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 pt-4 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('kpis')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'kpis'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          Executive Metrics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          Compliance Matrix &amp; Frameworks
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('actions')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'actions'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          Prioritized Action Queue
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('enclave')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'enclave'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          Sovereign Identity &amp; Routes
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="mt-4">
        {activeTab === 'kpis' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {activeConfig.primaryMetrics.map((metric, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <span className="text-xs font-medium text-slate-400">{metric.label}</span>
                  <div className="my-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {metric.value}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{metric.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Portal Navigation Cards */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Role-Tailored Workspaces
                </span>
                <span className="text-[11px] text-indigo-400 font-mono">1-Click Fast Context Switching</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {activeConfig.quickRoutes.map((route, idx) => {
                  const Icon = route.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onNavigate ? onNavigate(route.path) : (window.location.hash = `#${route.path}`)}
                      className="p-3 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-600/50 rounded-xl text-left flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-950/70 text-indigo-400 rounded-lg group-hover:bg-indigo-900 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                          {route.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matrix' && (
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Active Regulatory Enforcement Standards</h3>
                <p className="text-xs text-slate-400">Continuous cryptographic validation against official EU gazettes.</p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold">
                Status: Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeConfig.regulations.map((reg, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-200">{reg}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                    Article Audit OK
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-3">
            {activeConfig.actionItems.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    item.priority === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                    item.priority === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}>
                    {item.priority}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">{item.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono">ID: {item.id} &bull; Target: {item.due}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className={`text-xs font-mono ${executedItems[item.id] ? 'text-emerald-400' : 'text-indigo-400'}`}>
                    {executedItems[item.id] ? 'Completed' : item.status}
                  </span>
                  <button 
                    type="button"
                    onClick={() => {
                      setExecutedItems(prev => ({ ...prev, [item.id]: true }));
                      showToast(`Executed action workflow for ${item.id}: ${item.title}`, 'success');
                    }}
                    disabled={executedItems[item.id]}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      executedItems[item.id]
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {executedItems[item.id] ? 'Done' : 'Execute'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'enclave' && (
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400">eIDAS v2 Hardware Anchor</div>
                <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> HSM Tier-4 Verified
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400">Quantum-Safe Cipher</div>
                <div className="text-sm font-bold text-indigo-400 mt-1 flex items-center gap-1">
                  <Lock className="w-4 h-4" /> ML-KEM-768 Active
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400">B2G LangGraph Engine</div>
                <div className="text-sm font-bold text-purple-400 mt-1 flex items-center gap-1">
                  <Zap className="w-4 h-4" /> Stream Active (0 Errors)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleBasedComplianceDashboard;
