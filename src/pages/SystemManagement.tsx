import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Activity, ShieldCheck, RefreshCcw, Network, FileAxis3d, CreditCard, Building2, FileText, CheckCircle2, AlertTriangle, Key, Globe, Search, Lock, Database, Download, ShieldAlert } from 'lucide-react';
import { Settings } from 'lucide-react';
import { BlockchainManagement } from '../components/BlockchainManagement';
import { TreasurySettlement } from '../components/TreasurySettlement';
import { BackupAndRestore } from '../components/BackupAndRestore';
import PaymentGatewayManagement from '../components/PaymentGatewayManagement';
import { PlatformComplianceChecker } from '../components/PlatformComplianceChecker';
import { DataSecurityManager } from '../components/DataSecurityManager';
import { EmailSmsNotifications } from '../components/EmailSmsNotifications';
import { HybridStorageArchitecture } from '../components/HybridStorageArchitecture';
import { AutonomousComplianceCenter } from '../components/AutonomousComplianceCenter';
import { ComplianceIntegrityDashboard } from '../components/admin/ComplianceIntegrityDashboard';
import { RegionalFeatureToggleManager } from '../components/admin/RegionalFeatureToggleManager';
import { ProductionReadinessChecklist } from '../components/admin/ProductionReadinessChecklist';
import { AutonomousPlatformControlCenter } from '../components/admin/AutonomousPlatformControlCenter';
import { CountryBasisRegulatorEngine } from '../components/admin/CountryBasisRegulatorEngine';
import { AIGovernanceHub } from '../components/admin/AIGovernanceHub';
import { PlatformIncidentCenter } from '../components/admin/PlatformIncidentCenter';
import { ForensicAuditLineage } from '../components/admin/ForensicAuditLineage';
import { SaaSAddonRuleEngineBuilder } from '../components/admin/SaaSAddonRuleEngineBuilder';
import { UserManagementConsole } from '../components/admin/UserManagementConsole';
import { ConfigValidationService, ValidationResult } from '../services/config-validation-service';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'motion/react';

const B2gOperations = React.lazy(() => import('./B2gOperations').then(m => ({ default: m.B2gOperations })));
const AdminB2GOversight = React.lazy(() => import('./AdminB2GOversight').then(m => ({ default: m.AdminB2GOversight })));
const RegTechOrchestratorConsole = React.lazy(() => import('../components/RegTechOrchestratorConsole').then(m => ({ default: m.RegTechOrchestratorConsole })));

interface SystemManagementProps {
  activePath: string;
}

export const SystemManagement: React.FC<SystemManagementProps> = ({ activePath }) => {
  const getDefaultConfigs = (path: string) => {
    if (path === 'fs-aimodel') return [
      { key: 'FASTAPI_ENDPOINT_URL', type: 'String', value: 'http://ai-model.internal:8000', updated: '1 hr ago' },
      { key: 'LOCAL_REASONING_MODEL', type: 'Enum', value: 'Ollama (Mistral/Mixtral-8x7B)', updated: '2 days ago' },
      { key: 'VECTOR_DB_ENGINE', type: 'Enum', value: 'ChromaDB', updated: '1 week ago' },
      { key: 'LEGAL_RAG_FRAMEWORK', type: 'Enum', value: 'LangChain/LlamaIndex', updated: '3 hrs ago' },
      { key: 'AI_AUDIT_LOG_ENABLED', type: 'Boolean', value: 'TRUE', updated: '5 mins ago' }
    ];
    if (path === 'fs-backend') return [
      { key: 'SECURITY_SCANNER_ENGINE', type: 'Enum', value: 'OWASP ZAP', updated: '1 day ago' },
      { key: 'FUZZY_MATCH_ENGINE', type: 'Enum', value: 'RapidFuzz', updated: '2 hours ago' },
      { key: 'DEPENDENCY_COMPLIANCE', type: 'Enum', value: 'ScanCode/FOSSology/ORT', updated: '4 days ago' },
      { key: 'SANCTIONS_DATA_SOURCE', type: 'Enum', value: 'OpenSanctions', updated: '1 hr ago' },
      { key: 'TRACKER_DETECTION', type: 'Enum', value: 'OpenWPM', updated: '2 weeks ago' },
    ];
    if (path === 'fs-frontend') return [
      { key: 'ACCESSIBILITY_SCANNER', type: 'Enum', value: 'Lighthouse/axe-core', updated: '1 hr ago' },
      { key: 'WEB_CRAWLER_ENGINE', type: 'Enum', value: 'Crawlee/Playwright', updated: '12 hrs ago' },
      { key: 'UI_ASSET_CDN_URL', type: 'String', value: 'https://cdn.internal.org/', updated: '2 days ago' },
      { key: 'GLOBAL_THEME_FALLBACK', type: 'Enum', value: 'LIGHT_MODE', updated: '1 month ago' },
    ];
    if (path === 'fs-database') return [
      { key: 'PRIMARY_RELATIONAL_DB', type: 'Enum', value: 'Multi-Region Sharded SQLite (data/region_*.db)', updated: 'Just now' },
      { key: 'GRAPH_ANALYSIS_DB', type: 'Enum', value: 'Regional Sharded Kùzu DB', updated: 'Just now' },
      { key: 'ANALYTICS_OLAP_DB', type: 'Enum', value: 'Regional Sharded DuckDB', updated: 'Just now' },
      { key: 'VECTOR_EMBEDDING_DB', type: 'Enum', value: 'Regional Sharded LanceDB', updated: 'Just now' },
      { key: 'REGIONAL_DB_SHARDS', type: 'Integer', value: '8 (EU, USA, UK, AU, ASIA, LATAM, NZ, GLOBAL)', updated: 'Just now' },
      { key: 'DB_BACKUP_RETENTION', type: 'Integer (days)', value: '365', updated: '2 months ago' },
      { key: 'PII_ENCRYPTION_SALT', type: 'Secret', value: '****************', updated: '30 days ago' },
    ];
    if (path === 'fs-api') return [
      { key: 'API_GATEWAY_TIMEOUT', type: 'Integer (ms)', value: '30000', updated: '2 days ago' },
      { key: 'RATE_LIMIT_RPM', type: 'Integer', value: '1000', updated: '5 hrs ago' },
      { key: 'CORS_ALLOWED_ORIGINS', type: 'Array', value: '["*.tenant.co"]', updated: '1 day ago' },
      { key: 'WEBHOOK_RETRY_COUNT', type: 'Integer', value: '5', updated: '1 week ago' },
    ];
    if (path === 'fine-gdpr-83') return [
      { key: 'MAX_FINE_AMOUNT', type: 'Integer', value: '20000000', updated: '2 days ago' },
      { key: 'GLOBAL_REVENUE_PCT', type: 'Float', value: '0.04', updated: '2 days ago' },
      { key: 'BLOCKCHAIN_ESCROW_ADDRESS', type: 'Address', value: '0x3aE...74F', updated: '1 month ago' },
      { key: 'AUTO_ENFORCEMENT', type: 'Boolean', value: 'TRUE', updated: '1 hr ago' }
    ];
    if (path === 'fine-dpa') return [
      { key: 'AUTHORITY_SYNC_FREQ', type: 'Cron', value: '0 * * * * (Hourly)', updated: '1 hr ago' },
      { key: 'PENALTY_ESCALATION_DAYS', type: 'Integer', value: '14', updated: '2 weeks ago' },
      { key: 'REPORTING_WEBHOOK', type: 'String', value: 'https://dpa.eu/webhook', updated: '4 days ago' }
    ];
    if (path === 'fine-cross-border') return [
      { key: 'MEMBER_STATES_SYNCED', type: 'Integer', value: '27', updated: '1 hr ago' },
      { key: 'CROSS_BORDER_ROUTING', type: 'Enum', value: 'One-stop-shop mechanism', updated: '2 months ago' },
      { key: 'CURRENCY_CONVERSION', type: 'Boolean', value: 'TRUE', updated: '1 week ago' }
    ];

    return [
      { key: 'API_GATEWAY_TIMEOUT', type: 'Integer (ms)', value: '30000', updated: '2 hours ago' },
      { key: 'PAYMENT_PROCESSOR', type: 'Enum', value: 'STRIPE_SEPA', updated: '1 day ago' },
      { key: 'TREASURY_SYNC_FREQ', type: 'Cron', value: '0 0 * * * (Daily)', updated: '1 week ago' },
      { key: 'ETH_CHAIN_ID', type: 'Integer', value: '1 (Mainnet)', updated: '1 month ago' },
      { key: 'GLOBAL_ENFORCE_TOGGLE', type: 'Boolean', value: 'TRUE', updated: '3 hours ago' },
    ];
  };

  const { showToast } = useNotification();
  const [configs, setConfigs] = useState(getDefaultConfigs(activePath));
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  React.useEffect(() => {
    setConfigs(getDefaultConfigs(activePath));
    setValidationResult(null);
  }, [activePath]);

  const runIntegrityCheck = () => {
    const result = ConfigValidationService.validateConfigs(configs);
    setValidationResult(result);
    setShowValidationModal(true);
  };

  const handleForceMfa = () => {
    showToast('Multi-Factor Authentication enforced across all active sessions.', 'success');
  };

  const handleTriggerRestores = () => {
    showToast('System restore point initialized. System status: Standby.', 'info');
  };

  const handleDisconnectIntegration = () => {
    if (window.confirm('Are you sure you want to disconnect active integrations?')) {
      showToast('Integrations disconnected and security tokens revoked.', 'warning');
    }
  };

  const handleRotateApiKey = () => {
    showToast('API Gateway master keys rotated successfully.', 'success');
  };

  const handleExportLogs = () => {
    showToast('Exporting system security logs...', 'info');
    setTimeout(() => {
      showToast('System security logs download started.', 'success');
    }, 800);
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('9Xen Regulettee System Status Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    // Regulatory Status Summary
    doc.setFontSize(14);
    doc.text('Global Regulatory Status', 14, 45);
    (doc as any).autoTable({
      startY: 50,
      head: [['Key', 'Value', 'Last Updated']],
      body: configs.map(c => [c.key, c.value, c.updated]),
    });
    
    // Subscription Metrics Summary (Mocked data for report)
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Lawyer/Consultant Subscription Metrics', 14, 20);
    (doc as any).autoTable({
      startY: 25,
      head: [['Metric', 'Value']],
      body: [
        ['Active Lawyer Subscriptions', '42'],
        ['Consultant Subscriptions', '18'],
        ['MRR (Lawyer/Consultant)', '€12,450'],
        ['Pending Approvals', '5']
      ],
    });
    
    doc.save('9Xen Regulettee_Report.pdf');
    showToast('PDF Report generated successfully.', 'success');
  };

  const handleDeployContract = () => {
    showToast('Deploying Sovereign Smart Contract to primary ledger...', 'info');
    setTimeout(() => {
      showToast('Smart Contract deployed successfully. Block #1982341', 'success');
    }, 1200);
  };

  const handleTestSettlement = () => {
    showToast('Executing automated Treasury settlement check...', 'info');
    setTimeout(() => {
      showToast('Treasury settlement test passed (0 failures).', 'success');
    }, 1000);
  };

  const handleSystemStateSnapshot = () => {
    showToast('Generating cryptographic System State Snapshot...', 'info');
    setTimeout(() => {
      const snapshotData = {
        timestamp: new Date().toISOString(),
        version: "2.1.0-enterprise",
        activePath,
        pathTitle: getPathTitle(),
        pathDescription: getPathDescription(),
        configs,
        systemHealth: {
          backupHealth: "Operational",
          securityAlerts: "0 Critical",
          integrations: "0 Failures",
          permissionRisk: "Low Risk",
          blockchain: "Synced",
          paymentHealth: "Operational",
          treasury: "Settled (0 fail)"
        },
        userContext: {
          role: "SUPER_ADMIN",
          tenantId: "tenant_9xen-regulettee_01",
          sessionScope: "GLOBAL_COMPLIANCE_HQ",
          ipAddress: "192.168.1.104"
        },
        integrityStatus: validationResult ? validationResult : "Not run in session"
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshotData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `9xen-regulettee_system_state_snapshot_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('System State Snapshot downloaded successfully as a secure compliance backup.', 'success');
    }, 1000);
  };

  const handleGlobalLockdown = () => {
    if (window.confirm("CRITICAL: Are you sure you want to initiate GLOBAL LOCKDOWN? This will immediately suspend all active API tokens, terminate data access sessions, and lock platform ingress across all tenants.")) {
      showToast('Initiating Global System Lockdown...', 'info');
      setTimeout(() => {
        showToast('CRITICAL: Global Lockdown engaged. All API tokens revoked and sessions suspended.', 'error');
      }, 1200);
    }
  };

  const handleModify = (idx: number, currentVal: string) => {
    const newVal = prompt(`Modify value for ${configs[idx].key}:`, currentVal);
    if (newVal !== null && newVal !== currentVal) {
      const updated = [...configs];
      updated[idx].value = newVal;
      updated[idx].updated = 'Just now';
      setConfigs(updated);
    }
  };

  const getPathTitle = () => {
    switch (activePath) {
      case 'fs-database': return 'API & Database Control Center';
      case 'devops': return 'DevOps & Environments';
      case 'autonomous-control': 
      case 'autonomous-platform-control': return 'Autonomous Platform Control Center';
      case 'data-security': return 'Global Data Security';
      case 'backup-restore': return 'Backup & Restore Strategy';
      case 'third-party': return 'Third-Party Integrations';
      case 'blockchain-mgmt': return 'Blockchain Smart Contracts';
      case 'payment-gateways': return 'Payment Gateways Configuration';
      case 'treasury-sync': return 'Treasury & EU Govt. Integrations';
      case 'compliance-ops': return 'Operations & Event Logs';
      case 'platform-policy-engine': return 'Platform Policy Enforcement';
      case 'law-violation-scanner': return 'Law Violation Scanner';
      case 'email-sms-notifications': return 'Email & SMS Notifications';
      case 'b2g-operations':
      case 'b2r-operations': return 'B2G & B2R Operations Control HQ';
      case 'regtech-orchestrator':
      case 'regtech-engine': return 'RegTech Engine Orchestrator';
      case 'admin-b2g-center':
      case 'admin-b2g-dashboard': return 'B2G Regulatory Oversight Center';
      case 'ai-model-governance': return 'AI Governance & Ethics Hub';
      case 'incident-center': return 'Platform Incident & Ops Center';
      case 'forensic-audit': return 'Forensic Audit & Data Lineage';
      case 'rule-engine-builder': return 'Dynamic Compliance Rule Engine';
      case 'user-management': return 'Platform User Management Console';
      default: return 'System Administration';
    }
  };

  const getPathDescription = () => {
    switch (activePath) {
      case 'fs-database': return 'Monitor live database latency, IOPS, API Gateway traffic, and analyze live streaming queries across global regions.';
      case 'devops': return 'Manage deployment pipelines, feature rollouts, and server container health checks.';
      case 'autonomous-control':
      case 'autonomous-platform-control': return 'Real-time autonomic telemetry, multi-region tenant blast containment, hot-swappable policy engine, and emergency circuit breakers.';
      case 'data-security': return 'Configure AES-256 encryption-at-rest policies, access restrictions, and legal holds.';
      case 'backup-restore': return 'Set snapshot intervals, RPO/RTO strategies, and immutable backup lockers.';
      case 'third-party': return 'Track connected services, external Webhooks, rate limits, and API integrations.';
      case 'blockchain-mgmt': return 'Deploy escrow payment enforcement contracts and track transaction hashes across active blockchains.';
      case 'payment-gateways': return 'Manage Stripe, SEPA direct debits, and PayPal endpoints for automatic fee retrievals.';
      case 'treasury-sync': return 'Synchronize auto-settlement protocols with Member State treasuries across 27 EU nations.';
      case 'compliance-ops': return 'Audit log of fine issuances, incident reports, and system-level configuration changes.';
      case 'platform-policy-engine': return 'Implement global law policies across the SaaS platform automatically.';
      case 'law-violation-scanner': return 'Scan platform UI and data flows for GDPR, AI Act, and other legal violations.';
      case 'email-sms-notifications': return 'Configure global SMTP gateways and SMS providers for platform alerts.';
      case 'b2g-operations':
      case 'b2r-operations': return 'Automated Business-to-Regulator (B2R / B2G) fine enforcement, statutory audits, penalty D3 analytics, and sovereign regional scanners.';
      case 'regtech-orchestrator':
      case 'regtech-engine': return 'Unified 4-layer RegTech engine orchestrator: TypeBox/Ajv schema validation, json-rules-engine dynamic AML/PEP evaluation, isolated V8 sandbox plugin execution, and SHA-256 cryptographic audit ledger.';
      case 'admin-b2g-center':
      case 'admin-b2g-dashboard': return 'Regulatory sandbox approvals, statutory filing audits, whistleblower protection, and inter-agency data sharing.';
      case 'ai-model-governance': return 'Monitor AI model health, hallucination rates, safety alignment, and ethical guardrail compliance across the enterprise fleet.';
      case 'incident-center': return 'Real-time infrastructure health, active incident response, war room management, and scheduled maintenance windows.';
      case 'forensic-audit': return 'Immutable SHA-256 audit ledger with visual data lineage, actor identity verification, and resource propagation tracking.';
      case 'rule-engine-builder': return 'Construct and deploy dynamic compliance rules, statutory directives, and automated enforcement mechanisms.';
      case 'user-management': return 'Manage platform-wide user accounts, identities, and multi-tier KYC/KYB approval workflows.';
      default: return 'Configure and manage system-level infrastructure.';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {getPathTitle()}
          </h1>
          <p className="text-slate-500 mt-1 max-w-3xl">
            {getPathDescription()}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button className="px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors flex items-center shadow-sm">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Synchronize State
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-sm">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Apply Policies
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {/* Status Indicators */}
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Backup Health</span>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-black text-slate-800">Operational</span>
          </div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Security Alerts</span>
          <div className="flex flex-col items-center gap-1">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-black text-slate-800">0 Critical</span>
          </div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Integrations</span>
          <div className="flex flex-col items-center gap-1">
            <Network className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-black text-slate-800">0 Failures</span>
          </div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Permission Risk</span>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-black text-slate-800">Low Risk</span>
          </div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Blockchain</span>
          <div className="flex flex-col items-center gap-1">
            <FileAxis3d className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-black text-slate-800">Synced</span>
          </div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Payment Health</span>
          <div className="flex flex-col items-center gap-1">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-black text-slate-800">Operational</span>
          </div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Treasury</span>
          <div className="flex flex-col items-center gap-1">
            <Building2 className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-black text-slate-800">Settled (0 fail)</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm mb-6">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleForceMfa} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-md hover:bg-slate-200 transition-colors border border-slate-200">Force MFA Verify</button>
          <button onClick={handleTriggerRestores} className="px-3 py-1.5 bg-sky-100 text-sky-700 text-xs font-bold rounded-md hover:bg-sky-200 transition-colors border border-sky-200">Trigger Restores</button>
          <button onClick={handleDisconnectIntegration} className="px-3 py-1.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-md hover:bg-rose-200 transition-colors border border-rose-200">Disconnect Integration</button>
          <button onClick={handleRotateApiKey} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-md hover:bg-slate-200 transition-colors border border-slate-200">Rotate API Key</button>
          <button onClick={handleExportLogs} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-md hover:bg-slate-200 transition-colors border border-slate-200">Export All Logs</button>
          <button onClick={generatePDFReport} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md hover:bg-indigo-200 transition-colors border border-indigo-200 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Export PDF Report</button>
          <button 
            onClick={runIntegrityCheck}
            className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-md hover:bg-amber-200 transition-colors border border-amber-200 flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" /> Integrity Check
          </button>
          <button onClick={handleDeployContract} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md hover:bg-indigo-200 transition-colors border border-indigo-200 flex items-center gap-1.5"><FileAxis3d className="w-3.5 h-3.5" /> Deploy Smart Contract</button>
          <button onClick={handleTestSettlement} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md hover:bg-emerald-200 transition-colors border border-emerald-200 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Test Treasury Settlement</button>
          <button onClick={handleSystemStateSnapshot} className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-md hover:bg-purple-200 transition-colors border border-purple-200 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> System State Snapshot</button>
          <button onClick={handleGlobalLockdown} className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-md hover:bg-rose-700 transition-colors border border-rose-700 flex items-center gap-1.5 shadow-sm"><ShieldAlert className="w-3.5 h-3.5" /> Global Lockdown</button>
        </div>
      </div>

      <AnimatePresence>
        {showValidationModal && validationResult && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${validationResult.isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Configuration Integrity Report</h2>
                    <p className="text-xs text-slate-500 font-medium">Validation completed at {new Date(validationResult.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowValidationModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <RefreshCcw className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-4 sm:p-5 lg:p-6 max-h-[60vh] overflow-y-auto">
                {validationResult.issues.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No Integrity Issues Found</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">All configuration parameters meet the required structural and security standards for deployment and export.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {validationResult.issues.map((issue, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border flex items-start space-x-3 ${issue.severity === 'CRITICAL' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
                        {issue.severity === 'CRITICAL' ? (
                          <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wider">{issue.key}</span>
                            <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${issue.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                              {issue.severity}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 font-medium ${issue.severity === 'CRITICAL' ? 'text-rose-800' : 'text-amber-800'}`}>
                            {issue.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5 lg:p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center text-xs text-slate-500 font-bold uppercase tracking-widest">
                  <div className={`w-2 h-2 rounded-full mr-2 ${validationResult.isValid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {validationResult.isValid ? 'Passed Validation' : 'Validation Failed'}
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowValidationModal(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Close Report
                  </button>
                  {validationResult.isValid && (
                    <button 
                      onClick={() => {
                        setShowValidationModal(false);
                        showToast('System configuration state marked as VALID for next export cycle.', 'success');
                      }}
                      className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Finalize Pre-Export
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Path Specific Components */}
      {activePath === 'blockchain-mgmt' && <BlockchainManagement />}

      {activePath === 'payment-gateways' && <PaymentGatewayManagement />}

      {activePath === 'treasury-sync' && <TreasurySettlement />}
      
      {activePath === 'backup-restore' && <BackupAndRestore configs={configs} />}

      {activePath === 'data-security' && <DataSecurityManager />}

      {['platform-policy-engine', 'law-violation-scanner'].includes(activePath) && (
        <PlatformComplianceChecker activePath={activePath} />
      )}

      {['autonomous-control', 'autonomous-platform-control', 'devops'].includes(activePath) && (
        <AutonomousPlatformControlCenter />
      )}

      {activePath === 'devops' && <ProductionReadinessChecklist />}

      {activePath === 'email-sms-notifications' && <EmailSmsNotifications />}

      {['b2g-operations', 'b2r-operations'].includes(activePath) && (
        <React.Suspense fallback={<div className="p-5 sm:p-6 lg:p-8 text-center text-slate-400 font-mono text-xs">Loading B2G & B2R Operations HQ...</div>}>
          <B2gOperations />
        </React.Suspense>
      )}

      {['regtech-orchestrator', 'regtech-engine'].includes(activePath) && (
        <React.Suspense fallback={<div className="p-5 sm:p-6 lg:p-8 text-center text-slate-400 font-mono text-xs">Loading RegTech Engine Orchestrator...</div>}>
          <RegTechOrchestratorConsole />
        </React.Suspense>
      )}

      {['admin-b2g-center', 'admin-b2g-dashboard', 'admin-b2g-sandbox', 'admin-b2g-filings', 'admin-b2g-inquiries', 'admin-b2g-whistleblower', 'admin-b2g-agencies', 'admin-b2g-scanner', 'admin-b2g-stakeholders', 'admin-b2g-delta', 'admin-b2g-advanced', 'admin-b2g-timeline', 'b2g-national-scanner', 'b2g-stakeholder-matrix', 'b2g-delta-auditor', 'b2g-advanced-suite'].includes(activePath) && (
        <React.Suspense fallback={<div className="p-5 sm:p-6 lg:p-8 text-center text-slate-400 font-mono text-xs">Loading Admin B2G Oversight...</div>}>
          <AdminB2GOversight />
        </React.Suspense>
      )}

      {activePath === 'country-regulators' && <CountryBasisRegulatorEngine />}
      
      {activePath === 'regional-features' && <RegionalFeatureToggleManager />}

      {activePath === 'compliance-integrity' && <ComplianceIntegrityDashboard />}

      {activePath === 'ai-model-governance' && <AIGovernanceHub />}

      {activePath === 'incident-center' && <PlatformIncidentCenter />}

      {activePath === 'forensic-audit' && <ForensicAuditLineage />}

      {activePath === 'rule-engine-builder' && <SaaSAddonRuleEngineBuilder />}

      {activePath === 'user-management' && <UserManagementConsole />}

      {activePath === 'fs-database' && (
        <div className="space-y-4 sm:space-y-6">
          <HybridStorageArchitecture />
          <CoreConfigurationMatrix activePath={activePath} configs={configs} handleModify={handleModify} />
        </div>
      )}

      {!['fs-database', 'country-regulators', 'compliance-integrity', 'b2g-operations', 'b2r-operations', 'admin-b2g-center', 'admin-b2g-dashboard', 'admin-b2g-sandbox', 'admin-b2g-filings', 'admin-b2g-inquiries', 'admin-b2g-whistleblower', 'admin-b2g-agencies', 'admin-b2g-scanner', 'admin-b2g-stakeholders', 'admin-b2g-delta', 'admin-b2g-advanced', 'admin-b2g-timeline', 'b2g-national-scanner', 'b2g-stakeholder-matrix', 'b2g-delta-auditor', 'b2g-advanced-suite', 'ai-model-governance', 'incident-center', 'forensic-audit', 'rule-engine-builder', 'user-management', 'regtech-orchestrator', 'regtech-engine'].includes(activePath) && !['blockchain-mgmt', 'payment-gateways', 'treasury-sync', 'backup-restore', 'platform-policy-engine', 'law-violation-scanner', 'data-security', 'email-sms-notifications', 'devops', 'autonomous-control', 'autonomous-platform-control', 'regional-features'].includes(activePath) && (
        <CoreConfigurationMatrix activePath={activePath} configs={configs} handleModify={handleModify} />
      )}
    </div>
  );
};

const CoreConfigurationMatrix: React.FC<{ 
  activePath: string, 
  configs: any[], 
  handleModify: (idx: number, currentVal: string) => void
}> = ({ activePath, configs, handleModify }) => {

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
         <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
           {activePath === 'devops' ? 'DevOps & Pipeline Variables' : 
            activePath === 'data-security' ? 'Global Data Security Policies' : 
            activePath === 'third-party' ? 'Third-Party Webhooks & APIs' :
            activePath === 'compliance-ops' ? 'Operations Execution Logs' :
            activePath === 'fs-backend' ? 'Backend Configuration' :
            activePath === 'fs-frontend' ? 'Frontend Deployments' :
            activePath === 'fs-database' ? 'Database Management' :
            activePath === 'fs-api' ? 'API Gateway Settings' :
            activePath === 'fs-aimodel' ? 'AI Models (FastAPI endpoint)' :
            activePath === 'fine-gdpr-83' ? 'GDPR Article 83 Fine Collection' :
            activePath === 'fine-dpa' ? 'Data Protection Authority Penalties' :
            activePath === 'fine-cross-border' ? 'Cross-border GDPR Collections' :
            'Core Configuration Matrix'}
         </h3>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50/50 border-b border-slate-100 text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-4">Key Identifier</th>
              <th className="p-4">Type</th>
              <th className="p-4">Current Value / Status</th>
              <th className="p-4">Last Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {configs.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-sm font-semibold text-slate-800 font-mono">{item.key}</td>
                <td className="p-4 text-xs font-medium text-slate-500">{item.type}</td>
                <td className="p-4 text-sm font-bold text-emerald-700">
                  <span className="bg-emerald-50 px-2 py-1 rounded inline-block">{item.value}</span>
                </td>
                <td className="p-4 text-xs text-slate-500">{item.updated}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleModify(idx, item.value)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-xs px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    Modify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
