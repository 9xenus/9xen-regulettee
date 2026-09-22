import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Settings, 
  Sliders, 
  Scale, 
  ToggleLeft, 
  ToggleRight, 
  Database, 
  Building2, 
  Zap, 
  Cpu, 
  AlertTriangle, 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileText,
  Key,
  Globe,
  Terminal,
  Send,
  HelpCircle,
  RefreshCw,
  Mail,
  Percent,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';
import { dispatchB2gInvoiceEmail } from '../../utils/b2gBilling';

interface B2gAdvancedConfig {
  simulationMode: boolean;
  autoExecuteGdpr: boolean;
  autoExecuteAiAct: boolean;
  autoExecuteNis2: boolean;
  autoExecuteDora: boolean;
  
  // Enforcement parameters
  throttlePercent: number; // 50 to 95, default 80
  lockCertificateGraceDays: number; // 1 to 30, default 7
  baseFineAmount: number; // 50000 to 1000000, default 250000
  dailyFineAmount: number; // 1000 to 50000, default 5000
  suspendedEndpoints: string; // default '/api/v1/ai/inference, /api/v1/analytics'
  
  // Webhook handshake
  webhookUrl: string;
  webhookToken: string;
  webhookRetryLimit: number;
  failureAlertEmail: boolean;
  
  // Framework mapping
  gdprDefaultAction: 'AUTO_FINE' | 'LOCK_CERTIFICATE' | 'API_THROTTLE' | 'FEATURE_SUSPENSION';
  aiActDefaultAction: 'AUTO_FINE' | 'LOCK_CERTIFICATE' | 'API_THROTTLE' | 'FEATURE_SUSPENSION';
  nis2DefaultAction: 'AUTO_FINE' | 'LOCK_CERTIFICATE' | 'API_THROTTLE' | 'FEATURE_SUSPENSION';
  doraDefaultAction: 'AUTO_FINE' | 'LOCK_CERTIFICATE' | 'API_THROTTLE' | 'FEATURE_SUSPENSION';

  // B2G Commission & Automatic Billing parameters
  b2gCommissionRate: number;
  b2gVatRate: number;
  b2gAdminSetupFee: number;
  b2gBillingPrefix: string;
  b2gPlatformIban: string;
  b2gPlatformBic: string;
  b2gBillingEmail: string;
  b2gAutoSendEmail: boolean;
}

const DEFAULT_CONFIG: B2gAdvancedConfig = {
  simulationMode: true,
  autoExecuteGdpr: false,
  autoExecuteAiAct: false,
  autoExecuteNis2: true,
  autoExecuteDora: true,
  throttlePercent: 80,
  lockCertificateGraceDays: 7,
  baseFineAmount: 250000,
  dailyFineAmount: 5000,
  suspendedEndpoints: '/api/v1/ai/inference, /api/v1/analytics/cohorts',
  webhookUrl: 'https://regulator-gateway.europa.eu/webhook/v1/enforcements',
  webhookToken: 'sha256_b2g_hsh_7ea1f03f9e2b10',
  webhookRetryLimit: 3,
  failureAlertEmail: true,
  gdprDefaultAction: 'AUTO_FINE',
  aiActDefaultAction: 'FEATURE_SUSPENSION',
  nis2DefaultAction: 'API_THROTTLE',
  doraDefaultAction: 'LOCK_CERTIFICATE',

  // B2G Commission defaults
  b2gCommissionRate: 4.5,
  b2gVatRate: 20,
  b2gAdminSetupFee: 2500,
  b2gBillingPrefix: "INV-B2G-",
  b2gPlatformIban: "DE89 3704 0044 0532 0130 00",
  b2gPlatformBic: "WELADED1MUC",
  b2gBillingEmail: "billing@nonaxen-sovereign.eu",
  b2gAutoSendEmail: true,
};

// Types corresponding to local storage formats
interface B2GRequest {
  id: string;
  regulatorName: string;
  title: string;
  industry: string;
  law: string;
  regionalScope: string;
  description: string;
  minRiskThreshold: number;
  enforcementAction: 'API_THROTTLE' | 'LOCK_CERTIFICATE' | 'AUTO_FINE' | 'FEATURE_SUSPENSION';
  fineAmount?: number;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  requestedAt: string;
}

interface Tenant {
  id: string;
  name: string;
  region: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ONBOARDING';
  tier: string;
  phase: string;
  kybStatus?: 'Verified' | 'Pending' | 'Action Required';
  frameworks?: string[];
  complianceScore?: number;
  dpoName?: string;
  dpoEmail?: string;
}

export const B2gAdvancedEnforcementConfig: React.FC = () => {
  const { showToast } = useNotification();
  const [config, setConfig] = useState<B2gAdvancedConfig>(() => {
    const saved = localStorage.getItem('b2g_advanced_config');
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
  });

  // State for simulator inputs
  const [selectedTenantId, setSelectedTenantId] = useState<string>('org_1');
  const [selectedRegulator, setSelectedRegulator] = useState<string>('EDPB (European Data Protection Board)');
  const [selectedFramework, setSelectedFramework] = useState<'GDPR' | 'EU AI Act' | 'NIS2' | 'DORA'>('GDPR');
  const [simulatedLaw, setSimulatedLaw] = useState<string>('GDPR Article 5e (Storage Limitation)');
  const [simulatedViolationTitle, setSimulatedViolationTitle] = useState<string>('Anti-Storage-Limit Creep');
  const [simulatedRiskScore, setSimulatedRiskScore] = useState<number>(85);
  
  // Simulator output & processing logs
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Load existing Tenants to populate dropdown
  const [tenants, setTenants] = useState<Tenant[]>([]);
  
  useEffect(() => {
    const savedTenants = localStorage.getItem('platform_tenants_list');
    if (savedTenants) {
      setTenants(JSON.parse(savedTenants));
    } else {
      // Fallback
      setTenants([
        { id: 'org_1', name: 'Acme Corporation Europe', region: 'Germany (Frankfurt)', status: 'ACTIVE', tier: 'ENTERPRISE', phase: 'Production' },
        { id: 'org_2', name: 'Stark Industries GmbH', region: 'Ireland (Dublin)', status: 'ACTIVE', tier: 'ENTERPRISE', phase: 'Production' },
        { id: 'org_3', name: 'Tyrell Bio-EU', region: 'France (Paris)', status: 'ACTIVE', tier: 'MID_MARKET', phase: 'Onboarding' }
      ]);
    }
  }, []);

  // Update simulated default title & law when framework is selected
  useEffect(() => {
    switch(selectedFramework) {
      case 'GDPR':
        setSelectedRegulator('EDPB (European Data Protection Board)');
        setSimulatedLaw('GDPR Article 5e (Storage Limitation)');
        setSimulatedViolationTitle('Storage Creep Log Holding Violation');
        break;
      case 'EU AI Act':
        setSelectedRegulator('EIAO (EU AI Office)');
        setSimulatedLaw('EU AI Act Chapter III (High-Risk Systems)');
        setSimulatedViolationTitle('Unregistered Neural Biometric Deploys');
        break;
      case 'NIS2':
        setSelectedRegulator('BaFin Compliance Division');
        setSimulatedLaw('NIS2 Article 21 (Encryption Standards)');
        setSimulatedViolationTitle('Stale Cipher Key Rotation Infraction');
        break;
      case 'DORA':
        setSelectedRegulator('DORA Resiliency Watch');
        setSimulatedLaw('DORA Chapter II (ICT Risk Governance)');
        setSimulatedViolationTitle('Inadequate Multi-Region Failover Gateways');
        break;
    }
  }, [selectedFramework]);

  // Persist config to localStorage
  const saveConfig = (newConfig: B2gAdvancedConfig) => {
    setConfig(newConfig);
    localStorage.setItem('b2g_advanced_config', JSON.stringify(newConfig));
    showToast('B2G advanced configurations updated successfully!', 'success');
  };

  const handleToggle = (key: keyof B2gAdvancedConfig) => {
    const updated = { ...config, [key]: !config[key] };
    saveConfig(updated);
  };

  const handleSelectChange = (key: keyof B2gAdvancedConfig, value: string) => {
    const updated = { ...config, [key]: value };
    saveConfig(updated);
  };

  const handleSliderChange = (key: keyof B2gAdvancedConfig, value: number) => {
    const updated = { ...config, [key]: value };
    saveConfig(updated);
  };

  const handleInputChange = (key: keyof B2gAdvancedConfig, value: string | number) => {
    const updated = { ...config, [key]: value };
    saveConfig(updated);
  };

  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to restore default B2G enforcement settings?')) {
      saveConfig(DEFAULT_CONFIG);
    }
  };

  // Run B2G Infraction Scan Simulator
  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimLogs([]);
    
    const tenant = tenants.find(t => t.id === selectedTenantId) || { name: 'Simulated Client Org', region: 'EU Region' };
    
    // Choose enforcement action based on framework selected & config
    let action: 'API_THROTTLE' | 'LOCK_CERTIFICATE' | 'AUTO_FINE' | 'FEATURE_SUSPENSION' = 'AUTO_FINE';
    let isAutoExecute = false;

    switch(selectedFramework) {
      case 'GDPR':
        action = config.gdprDefaultAction;
        isAutoExecute = config.autoExecuteGdpr;
        break;
      case 'EU AI Act':
        action = config.aiActDefaultAction;
        isAutoExecute = config.autoExecuteAiAct;
        break;
      case 'NIS2':
        action = config.nis2DefaultAction;
        isAutoExecute = config.autoExecuteNis2;
        break;
      case 'DORA':
        action = config.doraDefaultAction;
        isAutoExecute = config.autoExecuteDora;
        break;
    }

    const steps = [
      `[00ms] [INIT] Initializing regulatory scanning daemon for framework: ${selectedFramework}...`,
      `[150ms] [HANDSHAKE] Verifying credential token with B2G Liaison Gateway at ${config.webhookUrl}...`,
      `[300ms] [HANDSHAKE] Handshake secured using key: ${config.webhookToken.substring(0, 12)}... [STATUS: 200 OK]`,
      `[450ms] [DISCOVER] Scanning Tenant node: ${tenant.name} [ID: ${selectedTenantId}] in region: ${tenant.region}...`,
      `[700ms] [EVALUATE] Violation rule triggered: ${simulatedLaw} - "${simulatedViolationTitle}"`,
      `[900ms] [EVALUATE] Measured risk quotient: ${simulatedRiskScore}% (Warning Threshold: 60%, Critical Threshold: 80%)`,
      `[1100ms] [EVALUATE] Default action mapped from SaaS Config: ${action}`,
      isAutoExecute 
        ? `[1300ms] [POLICY] "Auto-Execute" is ENABLED for ${selectedFramework}. Skipping human-in-the-loop liaison approval...`
        : `[1300ms] [POLICY] "Auto-Execute" is DISABLED for ${selectedFramework}. Queuing mandate for SaaS Admin approval...`,
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setSimLogs(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Compute penalty calculations
        let penaltyDesc = '';
        let simulatedFine: number | undefined = undefined;

        if (action === 'AUTO_FINE') {
          simulatedFine = config.baseFineAmount;
          penaltyDesc = `Base Fine of €${config.baseFineAmount.toLocaleString()} applied instantly, with cumulative penalty of €${config.dailyFineAmount.toLocaleString()}/day for unresolved duration.`;
        } else if (action === 'API_THROTTLE') {
          penaltyDesc = `Request capacity throttled by ${config.throttlePercent}% across all primary database write shards.`;
        } else if (action === 'LOCK_CERTIFICATE') {
          penaltyDesc = `Regulatory compliance badge will lock in ${config.lockCertificateGraceDays} days if conformity records are not supplied.`;
        } else if (action === 'FEATURE_SUSPENSION') {
          penaltyDesc = `Suspended critical SaaS endpoints: ${config.suspendedEndpoints}.`;
        }

        // Apply results to localStorage
        const savedRequests = localStorage.getItem('b2g_service_requests');
        const currentRequests: B2GRequest[] = savedRequests ? JSON.parse(savedRequests) : [];
        
        const newId = `req-sim-${Math.floor(100 + Math.random() * 900)}`;
        const newMandate: B2GRequest = {
          id: newId,
          regulatorName: selectedRegulator,
          title: simulatedViolationTitle,
          industry: selectedFramework === 'GDPR' ? 'Fintech' : selectedFramework === 'EU AI Act' ? 'AI Labs' : 'Infrastructures',
          law: simulatedLaw,
          regionalScope: tenant.region || 'EU Central',
          description: `Simulated infraction. ${penaltyDesc}`,
          minRiskThreshold: simulatedRiskScore,
          enforcementAction: action,
          fineAmount: simulatedFine,
          status: isAutoExecute ? 'APPROVED' : 'PENDING',
          requestedAt: new Date().toISOString()
        };

        localStorage.setItem('b2g_service_requests', JSON.stringify([newMandate, ...currentRequests]));

        // Optionally degrade tenant compliance score
        const savedTenants = localStorage.getItem('platform_tenants_list');
        if (savedTenants) {
          const tenantsList: Tenant[] = JSON.parse(savedTenants);
          const updatedList = tenantsList.map(t => {
            if (t.id === selectedTenantId) {
              const currentScore = t.complianceScore || 90;
              const newScore = Math.max(35, currentScore - Math.round(simulatedRiskScore / 4));
              return { 
                ...t, 
                complianceScore: newScore,
                status: action === 'FEATURE_SUSPENSION' && isAutoExecute ? 'SUSPENDED' : t.status
              };
            }
            return t;
          });
          localStorage.setItem('platform_tenants_list', JSON.stringify(updatedList));
        }

        // If auto-execute, dispatch automated billing invoice
        let billingLogLines: string[] = [];
        if (isAutoExecute && config.b2gAutoSendEmail) {
          const invoice = dispatchB2gInvoiceEmail(
            tenant.name,
            selectedRegulator,
            simulatedLaw,
            action,
            simulatedFine,
            tenant.region
          );
          if (invoice) {
            billingLogLines = [
              `[1600ms] [BILLING] Automated B2G Invoice compiled: ${invoice.invoiceNumber}`,
              `[1800ms] [EMAIL] Invoice and penalty notification sent to compliance-officer@${tenant.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.eu`
            ];
          }
        }

        setSimLogs(prev => [
          ...prev, 
          `[1500ms] [PERSIST] New mandate registered in secure ledger. ID: ${newId} [STATUS: ${newMandate.status}]`,
          ...billingLogLines,
          `[1700ms] [DISPATCH] Webhook dispatched to ${config.webhookUrl}. Delivery receipt secured.`,
          `[1900ms] [COMPLETED] B2G Platform Enforcement scan completed. All metrics compiled successfully.`
        ]);

        setIsSimulating(false);
        showToast(
          isAutoExecute 
            ? `Infraction auto-enforced! Tenant penalized with ${action}.`
            : `Infraction queued! Awaiting SaaS liaison approval.`,
          isAutoExecute ? 'error' : 'warning'
        );

        // Dispatches event to refresh parent dashboards
        window.dispatchEvent(new Event('storage'));
      }
    }, 250);
  };

  return (
    <div id="b2g-enforcement-panel" className="space-y-4 sm:space-y-6">
      
      {/* Configuration Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded tracking-wider uppercase">Advanced Admin module</span>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                B2G Platforms Enforcement Control Center
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Super Admin gateway to govern B2G (Business-to-Government) automated enforcements. 
              Toggle autonomous execution rules, adjust real-time system throttle limits, calibrate fine schedules, and simulate compliance audits.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono font-bold text-slate-400 px-2">SANDBOX EMULATION</span>
            <button
              onClick={() => handleToggle('simulationMode')}
              className={`p-1.5 rounded-lg transition-all ${config.simulationMode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              title={config.simulationMode ? "Simulation active - actions log locally" : "Production gateway mode"}
            >
              {config.simulationMode ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Core Settings: Column 1 & 2 */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Autopilot Gates Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Regulatory Autopilot Gates (Auto-Approval)</h3>
              </div>
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase">Human-In-The-Loop Override</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              When enabled, incoming B2G enforcements dispatched by EU regulators that exceed risk thresholds are applied <strong>automatically</strong> without requiring SaaS Liaison manual authorization.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                { key: 'autoExecuteGdpr', label: 'GDPR (European Data Protection Board)', desc: 'Auto-apply fines and storage caps' },
                { key: 'autoExecuteAiAct', label: 'EU AI Act (EU AI Office)', desc: 'Auto-suspend unregistered high-risk models' },
                { key: 'autoExecuteNis2', label: 'NIS2 Directive (National Cybersecurity)', desc: 'Auto-throttle infrastructure for security gaps' },
                { key: 'autoExecuteDora', label: 'DORA Framework (Fintech Resiliency)', desc: 'Auto-lock certifications on failover issues' }
              ].map((gate) => {
                const isActive = config[gate.key as keyof B2gAdvancedConfig];
                return (
                  <div key={gate.key} className={`p-4 rounded-xl border transition-all flex items-start justify-between ${isActive ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">{gate.label}</p>
                      <p className="text-[10px] text-slate-500">{gate.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(gate.key as keyof B2gAdvancedConfig)}
                      className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-indigo-600 hover:bg-indigo-100' : 'text-slate-400 hover:bg-slate-200'}`}
                    >
                      {isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calibrator Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Penalty Enforcement Calibrator</h3>
              </div>
              <button 
                onClick={resetToDefault}
                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition uppercase tracking-wider flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restore Defaults</span>
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              
              {/* Sliders in a responsive grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Throttling Cap */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-amber-500" />
                      SaaS API Throttling Cap
                    </span>
                    <span className="font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[11px]">
                      {config.throttlePercent}% limit
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={config.throttlePercent}
                    onChange={(e) => handleSliderChange('throttlePercent', parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    Defines the bandwidth and request capacity reduction applied automatically during an API throttling enforcement.
                  </p>
                </div>

                {/* Badge Grace Period */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      Certificate Grace Period
                    </span>
                    <span className="font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[11px]">
                      {config.lockCertificateGraceDays} Days
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={config.lockCertificateGraceDays}
                    onChange={(e) => handleSliderChange('lockCertificateGraceDays', parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    Allowed resolution window days allocated to tenant organizations prior to hard locking of their public compliance trust badges.
                  </p>
                </div>

                {/* Base Fine Amount */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-indigo-500" />
                      Base Regulatory Fine
                    </span>
                    <span className="font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px]">
                      €{config.baseFineAmount.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="1000000"
                    step="50000"
                    value={config.baseFineAmount}
                    onChange={(e) => handleSliderChange('baseFineAmount', parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    SaaS-wide initial liability base fine levied upon verified GDPR or general high-risk data compliance infractions.
                  </p>
                </div>

                {/* Daily Cumulative Fine */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      Daily Cumulative Penalty
                    </span>
                    <span className="font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[11px]">
                      €{config.dailyFineAmount.toLocaleString()} / day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={config.dailyFineAmount}
                    onChange={(e) => handleSliderChange('dailyFineAmount', parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    Ongoing daily liability invoice generated incrementally until the tenant DPO submits formal cryptographic resolution logs.
                  </p>
                </div>
              </div>

              {/* Endpoint Text Input */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Suspended Route Enclaves (Comma Separated)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={config.suspendedEndpoints}
                    onChange={(e) => handleInputChange('suspendedEndpoints', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="/api/v1/ai/inference, /api/v1/analytics"
                  />
                  <span className="absolute right-3 top-3.5 text-[9px] font-mono text-slate-400">RESTRICTED ROSTER</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  SaaS middleware intercepts traffic directed at these routes for tenants facing FEATURE_SUSPENSION penalties.
                </p>
              </div>
            </div>
          </div>

          {/* Handshake Webhook Liaison */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Key className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Regulatory Cryptographic Webhook Liaison</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Liaison Endpoint Gateway</label>
                <input
                  type="text"
                  value={config.webhookUrl}
                  onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">SHA-256 HMAC Secret Certificate Token</label>
                <input
                  type="password"
                  value={config.webhookToken}
                  onChange={(e) => handleInputChange('webhookToken', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-50">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-medium text-slate-600">Retry Policy:</span>
                  <select 
                    value={config.webhookRetryLimit}
                    onChange={(e) => handleInputChange('webhookRetryLimit', parseInt(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded p-1 text-xs font-mono text-slate-700"
                  >
                    {[1, 2, 3, 5, 10].map(v => <option key={v} value={v}>{v} retries</option>)}
                  </select>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-medium text-slate-600">Admin email notification:</span>
                  <button
                    onClick={() => handleToggle('failureAlertEmail')}
                    className={`text-xs font-bold px-2 py-0.5 rounded ${config.failureAlertEmail ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}
                  >
                    {config.failureAlertEmail ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Secured with EU-EIDAS compliant transport certificates</span>
            </div>
          </div>

          {/* SaaS B2G Commission & Automatic Billing Invoicing Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 justify-between">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">SaaS B2G Commission & Automated Invoicing</h3>
              </div>
              <span className="text-[10px] font-mono font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Active Commission Rate: {config.b2gCommissionRate}%
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Configure the platform service fee commission rate and tax parameters applied automatically when enforcements are executed, approved, or resolved.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Commission Rate Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-indigo-500" />
                    SaaS Platform Commission Rate
                  </span>
                  <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    {config.b2gCommissionRate.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="15"
                  step="0.5"
                  value={config.b2gCommissionRate}
                  onChange={(e) => handleSliderChange('b2gCommissionRate', parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">
                  The SaaS platform's percentage cut of all collected fine amounts and setup fees.
                </p>
              </div>

              {/* VAT Rate Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-500" />
                    Regulatory VAT / Tax Rate
                  </span>
                  <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    {config.b2gVatRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={config.b2gVatRate}
                  onChange={(e) => handleSliderChange('b2gVatRate', parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">
                  Standard European Value Added Tax (VAT) applied directly to generated invoices.
                </p>
              </div>

              {/* Billing Prefix */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Billing Invoice Code Prefix</label>
                <input
                  type="text"
                  value={config.b2gBillingPrefix}
                  onChange={(e) => handleInputChange('b2gBillingPrefix', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none"
                  placeholder="INV-B2G-"
                />
              </div>

              {/* Setup Fee */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Non-Fine Admin Setup Fee (EUR)</label>
                <input
                  type="number"
                  value={config.b2gAdminSetupFee}
                  onChange={(e) => handleInputChange('b2gAdminSetupFee', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                  placeholder="2500"
                />
              </div>

              {/* Platform IBAN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">TARGET2 Escrow Platform IBAN</label>
                <input
                  type="text"
                  value={config.b2gPlatformIban}
                  onChange={(e) => handleInputChange('b2gPlatformIban', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none"
                />
              </div>

              {/* Platform BIC */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Platform Swift Bank BIC Code</label>
                <input
                  type="text"
                  value={config.b2gPlatformBic}
                  onChange={(e) => handleInputChange('b2gPlatformBic', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none"
                />
              </div>

              {/* Billing Contact */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Billing Dept Support Email</label>
                <input
                  type="email"
                  value={config.b2gBillingEmail}
                  onChange={(e) => handleInputChange('b2gBillingEmail', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none"
                />
              </div>

              {/* Auto Invoicing Toggle */}
              <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    Auto-Send Invoice Email
                  </p>
                  <p className="text-[10px] text-slate-500">Automatically compile and dispatch billing invoices upon task approval.</p>
                </div>
                <button
                  onClick={() => handleToggle('b2gAutoSendEmail')}
                  className={`p-1 rounded-lg transition-colors ${config.b2gAutoSendEmail ? 'text-indigo-600 hover:bg-indigo-100' : 'text-slate-400 hover:bg-slate-200'}`}
                >
                  {config.b2gAutoSendEmail ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Simulator & Mappings: Column 3 */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Framework Default Action Mappings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Scale className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Default Severity Action Mapping</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Define the default SaaS-wide penalty applied for high-severity violations of each regulatory framework:
            </p>

            <div className="space-y-3.5 pt-2">
              {[
                { label: 'GDPR Directive Mapping', stateKey: 'gdprDefaultAction', badgeColor: 'text-indigo-600 bg-indigo-50 border border-indigo-100' },
                { label: 'EU AI Act Mapping', stateKey: 'aiActDefaultAction', badgeColor: 'text-rose-600 bg-rose-50 border border-rose-100' },
                { label: 'NIS2 Cyber Mapping', stateKey: 'nis2DefaultAction', badgeColor: 'text-amber-600 bg-amber-50 border border-amber-100' },
                { label: 'DORA Resiliency Mapping', stateKey: 'doraDefaultAction', badgeColor: 'text-teal-600 bg-teal-50 border border-teal-100' }
              ].map((m) => {
                const currentVal = config[m.stateKey as keyof B2gAdvancedConfig] as string;
                return (
                  <div key={m.stateKey} className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700 block">{m.label}</span>
                    <select
                      value={currentVal}
                      onChange={(e) => handleSelectChange(m.stateKey as keyof B2gAdvancedConfig, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="AUTO_FINE">AUTO_FINE (Financial Levy)</option>
                      <option value="FEATURE_SUSPENSION">FEATURE_SUSPENSION (Route Suspension)</option>
                      <option value="API_THROTTLE">API_THROTTLE (80% Throttling)</option>
                      <option value="LOCK_CERTIFICATE">LOCK_CERTIFICATE (Trust Badge Lock)</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sandbox Scanner Simulator */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl space-y-4 border border-slate-800">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">B2G Infraction Simulator</h3>
                <p className="text-[10px] text-slate-400">Trigger real-time sandbox regulatory audits</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              
              {/* Select Client Tenant */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Tenant Organization</span>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.region})</option>
                  ))}
                </select>
              </div>

              {/* Select Framework */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Compliance Standard</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {['GDPR', 'EU AI Act', 'NIS2', 'DORA'].map((fw) => (
                    <button
                      key={fw}
                      onClick={() => setSelectedFramework(fw as any)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${selectedFramework === fw ? 'bg-indigo-600 text-white border border-indigo-500' : 'bg-slate-950 text-slate-400 border border-transparent hover:bg-slate-800'}`}
                    >
                      {fw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Risk Threshold */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                  <span>Simulated Risk Level</span>
                  <span className="text-emerald-400">{simulatedRiskScore}% Quotient</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={simulatedRiskScore}
                  onChange={(e) => setSimulatedRiskScore(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all ${isSimulating ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer'}`}
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Emulating B2G Handshake...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Simulate B2G Infraction Scan</span>
                  </>
                )}
              </button>
            </div>

            {/* Terminal logs panel */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> Emulated Daemon Log
                </span>
                {simLogs.length > 0 && (
                  <button 
                    onClick={() => setSimLogs([])}
                    className="text-[8px] text-slate-500 hover:text-slate-300 font-mono underline"
                  >
                    Clear Logs
                  </button>
                )}
              </div>
              
              <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 h-36 overflow-y-auto font-mono text-[9px] text-emerald-400 space-y-1 shadow-inner leading-normal">
                {simLogs.length === 0 ? (
                  <div className="text-slate-600 italic text-center pt-8">
                    Awaiting scan trigger parameters. Click simulated button to pipe compliance state vectors.
                  </div>
                ) : (
                  simLogs.map((log, index) => (
                    <div key={index} className="border-l-2 border-emerald-900 pl-1">{log}</div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
