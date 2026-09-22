import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  Shield, 
  CreditCard, 
  Network, 
  Lock, 
  Bell, 
  Database,
  Save,
  CheckCircle2,
  Globe,
  Settings,
  HelpCircle,
  Slack,
  MessageSquare,
  Key,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  Check,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SecuritySettings } from '../../pages/SecuritySettings';
import { RegulatoryLenses } from './RegulatoryLenses';
import { JurisdictionProvisioning } from './JurisdictionProvisioning';
import { TimeTravelConfig } from './TimeTravelConfig';
import { DelegatedPermissions } from './DelegatedPermissions';
import { CustomRuleBuilder } from './CustomRuleBuilder';
import { BlastRadiusPreview } from './BlastRadiusPreview';
import { AIPilotSetting } from './AIPilotSetting';
import { EnterpriseAdminHub } from './EnterpriseAdminHub';
import { InternalGovernance } from './InternalGovernance';
import { PersonnelEnclave } from './PersonnelEnclave';
import { useNotification } from '../../context/NotificationContext';

export const ClientAdminSettings: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState('regulatory');
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [showBlastRadius, setShowBlastRadius] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any>(null);

  // Form State for Organization
  const [orgData, setOrgData] = useState({
    name: 'Acme Corp Europe',
    vat: 'EU123456789',
    jurisdiction: 'Frankfurt, Germany (Primary)',
    dpoName: 'Alice Smith',
    dpoEmail: 'alice@regulettee.eu'
  });

  // Integrations State
  const [integrations, setIntegrations] = useState([
    { id: 'google', name: 'Google Workspace OIDC', category: 'IAM SSO', connected: true, logo: Globe },
    { id: 'slack', name: 'Slack Compliance Alerts', category: 'Alert Feed', connected: false, logo: Slack },
    { id: 'ldap', name: 'Active Directory / LDAP', category: 'Directory', connected: true, logo: Database },
    { id: 'msteams', name: 'Microsoft Teams Webhooks', category: 'Alert Feed', connected: false, logo: MessageSquare }
  ]);

  // Billing & Meter State
  const [selectedPlan, setSelectedPlan] = useState('Enterprise Tier');
  const [billingMeters] = useState([
    { label: 'Sovereign API Quota', used: 42500, max: 100000, unit: 'Requests' },
    { label: 'Sovereign Enclave Audits', used: 7, max: 10, unit: 'Audits' },
    { label: 'Workspace IAM Seats', used: 4, max: 10, unit: 'Seats' }
  ]);

  // Notification Alerts Config
  const [notifications, setNotifications] = useState({
    driftEvents: true,
    securityBreaches: true,
    weeklyReports: false,
    webhookAudits: true
  });

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate blast radius first
    setPendingChanges({ ...orgData, notifications });
    setShowBlastRadius(true);
  };

  const handleConfirmSave = async () => {
    setShowBlastRadius(false);
    setIsSaving(true);
    
    try {
      // Record in history
      await fetch('/api/v1/advanced-settings/history/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 'default',
          config_type: 'GLOBAL_SETTINGS',
          config_data: pendingChanges,
          changed_by: 'admin@regulettee.eu',
          change_reason: 'Periodic recalibration of sovereign parameters'
        })
      });

      setTimeout(() => {
        setIsSaving(false);
        setSuccessToast(true);
        setTimeout(() => setSuccessToast(false), 3000);
      }, 1200);
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.connected;
        return { ...item, connected: nextState };
      }
      return item;
    }));
  };

  const tabs = [
    { id: 'regulatory', label: 'Risk & Role Lens', icon: Sliders },
    { id: 'governance', label: 'Jurisdiction & Rules', icon: Globe },
    { id: 'internal-gov', label: 'Internal Governance', icon: Network },
    { id: 'personnel', label: 'Personnel Enclave', icon: Users },
    { id: 'organization', label: 'Corporate Registry', icon: Building },
    { id: 'security', label: 'Security & MFA', icon: Lock },
    { id: 'integrations', label: 'SSO & Integrations', icon: Network },
    { id: 'history', label: 'Time-Travel Config', icon: RefreshCw },
    { id: 'delegated', label: 'Delegated Access', icon: Users },
    { id: 'billing', label: 'Billing & Quotas', icon: CreditCard },
    { id: 'notifications', label: 'Compliance Alerts', icon: Bell },
    { id: 'enterprise', label: 'Enterprise Hub', icon: Sliders },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-5 sm:gap-8 relative animate-fadeIn">
      
      <BlastRadiusPreview 
        isOpen={showBlastRadius} 
        onClose={() => setShowBlastRadius(false)}
        onConfirm={handleConfirmSave}
        changes={pendingChanges}
      />

      {/* Dynamic Action Status Bar */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 border border-emerald-500 text-white px-4.5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold"
          >
            <CheckCircle2 className="w-4.5 h-4.5" />
            <span>Sovereign workspace parameters stored and synchronized on Ledger.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left-hand Navigation Sidebar (Premium Style) */}
      <div className="w-full xl:w-64 shrink-0">
        <nav className="space-y-1.5">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4.5 py-3 rounded-xl text-xs font-bold transition-all text-left border ${
                  isActive 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' 
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Settings Display Body */}
      <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-4 sm:p-5 lg:p-6 xl:p-8 space-y-4 sm:space-y-6">
          
          {/* Organization Tab */}
          {activeTab === 'regulatory' && <RegulatoryLenses />}
          {activeTab === 'governance' && (
            <div className="space-y-12">
              <JurisdictionProvisioning />
              <div className="pt-12 border-t border-slate-100">
                <CustomRuleBuilder />
              </div>
            </div>
          )}
          {activeTab === 'history' && <TimeTravelConfig />}
          {activeTab === 'delegated' && <DelegatedPermissions />}
          {activeTab === 'internal-gov' && <InternalGovernance />}
          {activeTab === 'personnel' && <PersonnelEnclave />}


          {activeTab === 'organization' && (
            <form onSubmit={handleSaveAll} className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Corporate Registry Details</h2>
                  <p className="text-slate-500 text-xs mt-1">Configure legal entities and register the regional designated Data Protection Officer (DPO).</p>
                </div>
                <AIPilotSetting 
                  settingKey="Corporate Registry" 
                  settingValue={orgData.name} 
                  context="Primary legal entity information for the sovereign tenant. Impact: Regulatory reporting identity." 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Corporate Legal Name</label>
                  <input 
                    type="text" 
                    value={orgData.name} 
                    onChange={e => setOrgData({ ...orgData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-slate-800" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EU VAT ID / Legal Registration ID</label>
                  <input 
                    type="text" 
                    value={orgData.vat} 
                    onChange={e => setOrgData({ ...orgData, vat: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-slate-800" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Sovereign Jurisdiction</label>
                  <select 
                    value={orgData.jurisdiction}
                    onChange={e => setOrgData({ ...orgData, jurisdiction: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    <option value="Frankfurt, Germany (Primary)">Frankfurt, Germany (Primary Compliance Nodes)</option>
                    <option value="Paris, France">Paris, France (Sub-Nodes)</option>
                    <option value="Amsterdam, Netherlands">Amsterdam, Netherlands (High availability)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designated corporate DPO Officer</label>
                  <input 
                    type="text" 
                    value={orgData.dpoName} 
                    onChange={e => setOrgData({ ...orgData, dpoName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-slate-800" 
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Storing Registry Parameters...' : 'Save Registry Profile'}
                </button>
              </div>
            </form>
          )}

          {/* Security & MFA Tab */}
          {activeTab === 'security' && (
            <div className="max-w-none">
              <SecuritySettings />
            </div>
          )}

          {/* SSO & Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Federated Auth & Integrations</h2>
                <p className="text-slate-500 text-xs mt-1">Bind your organization workspace to centralized single-sign-on (SSO) systems and real-time alert tunnels.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((item) => {
                  return (
                    <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.connected ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                          <item.logo className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                          <span className="text-[9px] text-slate-500 font-medium block mt-0.5">{item.category}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          toggleIntegration(item.id);
                          triggerSuccessLog(item.name, !item.connected);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          item.connected 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/60' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {item.connected ? 'Connected' : 'Configure'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Developer API Webhook Key */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 mt-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Developer Workspace Webhooks</h4>
                  <span className="text-[8px] font-bold font-mono text-emerald-400 uppercase">Enforced</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  Dispatch automatic, encrypted JSON compliance reports to external sovereign audit webhooks on policy changes.
                </p>

                <div className="flex gap-2">
                  <input 
                    type="password" 
                    readOnly 
                    value="••••••••••••••••••••••••••••••••••••••••" 
                    className="flex-1 bg-slate-900 border border-slate-850 text-[10px] font-mono rounded-lg px-3 py-1.5 text-slate-400 focus:outline-none" 
                  />
                  <button 
                    onClick={() => showToast('Webhook secret copied to clipboard!', 'info')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    Reveal Key
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Billing & Plan Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">SaaS subscription & Quotas</h2>
                <p className="text-slate-500 text-xs mt-1">Review your current sovereign compliance resource limits and active monthly billing meters.</p>
              </div>

              {/* Resource meters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {billingMeters.map((meter) => {
                  const percentage = Math.min(100, (meter.used / meter.max) * 100);
                  return (
                    <div key={meter.label} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">{meter.label}</span>
                        <div className="text-sm font-black text-slate-800 mt-1">
                          {meter.used.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/ {meter.max.toLocaleString()} {meter.unit}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              percentage > 85 ? 'bg-rose-500' : percentage > 60 ? 'bg-amber-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 block text-right font-mono">{percentage.toFixed(0)}% Capacity</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Plan Selector */}
              <div className="p-5 border border-indigo-100 bg-indigo-50/40 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Active Subscription Plan</h3>
                    <h4 className="text-base font-black text-slate-900 mt-1">{selectedPlan}</h4>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[9px] font-bold uppercase rounded-full border border-indigo-200">
                    Auto-renewing
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'Professional Tier', price: '€249/mo', seats: 'Up to 5 seats', audits: '5 audits/mo' },
                    { id: 'Enterprise Tier', price: '€999/mo', seats: 'Up to 10 seats', audits: '10 audits/mo' },
                    { id: 'Sovereign Enclave Custom', price: 'Custom', seats: 'Unlimited seats', audits: 'Unlimited audits' }
                  ].map((tier) => {
                    const isCurrent = selectedPlan === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlan(tier.id);
                          triggerSuccessPlan(tier.id);
                        }}
                        className={`p-4 rounded-xl text-left border cursor-pointer transition-all flex flex-col justify-between ${
                          isCurrent 
                            ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-600' 
                            : 'bg-white/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-bold text-slate-800 block">{tier.id}</span>
                          <span className="text-xs font-black text-indigo-600 block mt-1">{tier.price}</span>
                        </div>
                        <div className="text-[9px] text-slate-500 mt-4 space-y-0.5 font-medium">
                          <p>{tier.seats}</p>
                          <p>{tier.audits}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Compliance Notifications Tab */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSaveAll} className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Drift & Security Alerts</h2>
                <p className="text-slate-500 text-xs mt-1">Control who gets notified when a compliance drift condition is identified on our ledger.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Compliance Drift Alarms</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Instant alerts when an active service falls below 100% compliance threshold.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.driftEvents} 
                    onChange={e => setNotifications({ ...notifications, driftEvents: e.target.checked })}
                    className="rounded text-indigo-600 h-4 w-4 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">IAM Security Breaches</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">High-priority alert warnings upon failed MFA attempts or unauthorized IP login trials.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.securityBreaches} 
                    onChange={e => setNotifications({ ...notifications, securityBreaches: e.target.checked })}
                    className="rounded text-indigo-600 h-4 w-4 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Weekly Legislative Scraper Reports</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Weekly PDF briefs outlining scrapings and newly discovered EU directive amendments.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.weeklyReports} 
                    onChange={e => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                    className="rounded text-indigo-600 h-4 w-4 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Storing Alerts Config...' : 'Save Alerts Preferences'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'enterprise' && <EnterpriseAdminHub />}

        </div>
      </div>

    </div>
  );

  function triggerSuccessLog(name: string, connected: boolean) {
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3500);
  }

  function triggerSuccessPlan(plan: string) {
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3500);
  }
};
