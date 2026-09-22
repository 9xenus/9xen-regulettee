import { fetchWithRetry } from '../lib/api-client';
import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  Shield, 
  CreditCard, 
  Network, 
  Lock, 
  Key,
  Bell, 
  Database,
  Search,
  Save,
  AlertTriangle,
  CheckCircle2,
  Palette,
  Languages,
  ShieldCheck,
  Check,
  Copy,
  Code,
  ExternalLink,
  Zap,
  Brain,
  Heart,
  ShoppingCart,
  Sparkles,
  HelpCircle,
  Eye,
  Settings2,
  CheckSquare,
  Square,
  LayoutTemplate,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAiAutoCategorization } from '../hooks/useAiAutoCategorization';
import { StorageAnalysis } from '../components/settings/StorageAnalysis';
import { useLanguage, LanguageCode } from '../context/LanguageContext';
import { SubscriptionManagement } from '../components/SubscriptionManagement';
import { ClientAdminSettings } from '../components/settings/ClientAdminSettings';
import { RegulatorAdminSettings } from '../components/settings/RegulatorAdminSettings';
import { RegulatorSovereignView } from '../components/settings/RegulatorSovereignView';
import { MfaSetupFlow } from '../components/settings/MfaSetupFlow';
import { WhiteLabelSettings } from '../components/settings/WhiteLabelSettings';
import { GlobalSaaSSettingsView } from '../components/admin/GlobalSaaSSettingsView';

const SETTINGS_TABS = [
  { id: 'organization', label: 'Organization', icon: Building, desc: 'Company details, logo, and legal entity' },
  { id: 'admin', label: 'Admin Settings', icon: Shield, desc: 'System health, user roles, and audit logs' },
  { id: 'saas-settings', label: 'SaaS Platform Settings', icon: Settings2, desc: 'Global SaaS maintenance mode, AI models, and database configs' },
  { id: 'white-label', label: 'White-Label Branding', icon: LayoutTemplate, desc: 'Reseller mode and brand customization' },
  { id: 'security', label: 'Security & Auth', icon: Lock, desc: '2FA, SMS, SMTP, and session management' },
  { id: 'integrations', label: 'Integrations', icon: Network, desc: 'Connect external tools, SMS APIs, and databases' },
  { id: 'appearance', label: 'Appearance & Theme', icon: Palette, desc: 'UI accessibility and contrast' },
  { id: 'compliance', label: 'Compliance Engine', icon: Shield, desc: 'EU acts and risk thresholds' },
  { id: 'billing', label: 'Billing & Plans', icon: CreditCard, desc: 'Subscriptions and payments' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts and email preferences' },
  { id: 'privacy', label: 'Data & Privacy', icon: Database, desc: 'Retention and export rules' },
  { id: 'activity-log', label: 'User Activity Log', icon: ShieldCheck, desc: 'Audit administrative actions and configuration changes' },
];

import { IntegrationsScanHub } from '../components/IntegrationsScanHub';
import { WebhookForwardingPanel } from '../components/settings/WebhookForwardingPanel';

export const Settings: React.FC<{ initialTab?: string, activeRole?: string, activePath?: string }> = ({ initialTab, activeRole, activePath }) => {
  const { language, setLanguage, t } = useLanguage();

  if (activeRole === 'CLIENT') {
    return <ClientAdminSettings />;
  }
  if (activeRole === 'EU_REGULATOR') {
    return <RegulatorSovereignView />;
  }

  const getTabForPath = (path?: string) => {
    if (!path) return 'organization';
    switch (path) {
      case 'act-enable': return 'compliance';
      case 'feature-flags': return 'organization';
      case 'billing-sync': return 'billing';
      case 'rbac': return 'admin';
      case 'system-settings': return 'saas-settings';
      case 'settings': return 'organization';
      default: return 'organization';
    }
  };

  const [activeTab, setActiveTab] = useState(() => initialTab || getTabForPath(activePath));
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tabs based on role
  const filteredTabsByRole = SETTINGS_TABS.filter(() => true);

  const [tenantData, setTenantData] = useState<any>({});
  const [smsConfig, setSmsConfig] = useState({
    provider: 'twilio',
    apiKey: '••••••••••••••••',
    apiSecret: '••••••••••••••••',
    senderId: 'NONAXEN-AUTH'
  });

  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.eu-regulator.org',
    port: '587',
    user: 'notifications@nonaxen.eu',
    pass: '••••••••••••••••',
    encryption: 'tls'
  });

  const [twoFactorConfig, setTwoFactorConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('security_mfa_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse security_mfa_config:', e);
    }
    return {
      enabled: false,
      method: 'authenticator', // 'sms' | 'authenticator'
      enforcement: 'admin', // 'admin' | 'all'
      backupCodesLeft: 0,
      isConfigured: false
    };
  });

  React.useEffect(() => {
    if (activePath) {
      setActiveTab(getTabForPath(activePath));
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [activePath, initialTab]);

  React.useEffect(() => {
    fetchWithRetry('/api/v1/settings/tenant/default')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        if (data && typeof data === 'object') {
          // Robust default initialization
          const mergedData = {
            organization_metadata: {},
            appearance_metadata: {},
            compliance_config: {},
            security_config: {},
            notifications: {},
            admin_roles: {},
            integrations: {
              'Slack': true,
              'Microsoft Teams': false,
              'Jira': true,
              'GitLab Code Auditing': true,
              'Workday API': false,
              'Local SQLite Backup': false,
              'ChromaDB Core': false
            },
            ...data
          };
          setTenantData(mergedData);
          
          // Sync 2FA config if it exists in security_config
          if (mergedData.security_config && mergedData.security_config.mfa) {
            setTwoFactorConfig(mergedData.security_config.mfa);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async (customData?: any) => {
    setIsSaving(true);
    try {
      const dataToSave = customData || {
        ...tenantData,
        security_config: {
          ...tenantData.security_config,
          mfa: twoFactorConfig
        }
      };
      
      await fetchWithRetry('/api/v1/settings/tenant/default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });
      
      // Update local storage for persistence across reloads
      localStorage.setItem('security_mfa_config', JSON.stringify(twoFactorConfig));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch(e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  const getTabTranslation = (id: string, defaultLabel: string) => {
    switch (id) {
      case 'organization': return t('org_settings', defaultLabel);
      case 'admin': return t('settings', defaultLabel);
      case 'security': return t('cyber-security', defaultLabel);
      case 'integrations': return t('integrations', defaultLabel);
      case 'appearance': return t('language', defaultLabel);
      case 'compliance': return t('compliance', defaultLabel);
      case 'billing': return t('finance', defaultLabel);
      case 'notifications': return t('notifications', defaultLabel);
      case 'privacy': return t('vault', defaultLabel);
      default: return defaultLabel;
    }
  };

  const filteredTabs = filteredTabsByRole.filter(tab => 
    tab.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tab.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getTabTranslation(tab.id, tab.label).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row gap-5 sm:gap-8 pb-12">
      {/* Settings Navigation */}
      <div className="w-full md:w-64 shrink-0">
        <div className="sticky top-24 space-y-1 max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar pr-1">
          <div className="px-3 mb-4">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('settings', 'Settings')}</h1>
            <p className="text-sm text-slate-500 mt-1">Manage tenant configuration</p>
          </div>
          
          <div className="relative px-3 mb-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-6 top-2.5" />
            <input 
              type="text" 
              placeholder="Search settings..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-shadow"
            />
          </div>

          <nav className="space-y-0.5 px-2">
            {filteredTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    isActive ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{getTabTranslation(tab.id, tab.label)}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 min-w-0">
        <div className="bg-white border text-left border-slate-200 rounded-2xl shadow-sm min-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {getTabTranslation(activeTab, SETTINGS_TABS.find(t => t.id === activeTab)?.label || '')}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {SETTINGS_TABS.find(t => t.id === activeTab)?.desc}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {saveSuccess && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center text-emerald-600 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Saved & Logged
                </motion.div>
              )}
              <div className="hidden sm:block text-xs text-slate-400 mr-2">
                All changes are logged in the<br/>immutable audit ledger.
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-70"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {t('save_changes', 'Save Changes')}
              </button>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="p-4 sm:p-5 lg:p-6 flex-1 bg-slate-50/50 rounded-b-2xl">
            {activeTab === 'organization' && <OrganizationSettings tenantData={tenantData} setTenantData={setTenantData} />}
            {activeTab === 'admin' && <AdminSettings tenantData={tenantData} setTenantData={setTenantData} />}
            {activeTab === 'saas-settings' && <GlobalSaaSSettingsView />}
            {/* Platform Visibility Manager removed with legacy roles */}
            {activeTab === 'security' && (
              <SecuritySettings 
                twoFactorConfig={twoFactorConfig} 
                setTwoFactorConfig={setTwoFactorConfig} 
                smtpConfig={smtpConfig} 
                setSmtpConfig={setSmtpConfig} 
                smsConfig={smsConfig} 
                setSmsConfig={setSmsConfig}
                onSave={handleSave}
              />
            )}
            {activeTab === 'white-label' && <WhiteLabelSettings />}
            {activeTab === 'integrations' && (
              <div className="space-y-12">
                <IntegrationsScanHub />
                <div className="pt-8 border-t border-slate-200">
                  <WebhookForwardingPanel />
                </div>
              </div>
            )}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'compliance' && <ComplianceSettings tenantData={tenantData} setTenantData={setTenantData} />}
            {activeTab === 'billing' && <SubscriptionManagement />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'privacy' && <PrivacySettings />}
            {activeTab === 'activity-log' && <UserActivityLog />}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components for Settings Pages ---

const OrganizationSettings: React.FC<{ tenantData: any, setTenantData: any }> = ({ tenantData, setTenantData }) => {
  let metadata = tenantData.organization_metadata || {};
  if (typeof metadata === 'string') {
    try { metadata = JSON.parse(metadata); } catch(e) { metadata = {}; }
  }
  const handleChange = (field: string, value: string) => {
    setTenantData({
      ...tenantData,
      organization_metadata: { ...metadata, [field]: value }
    });
  };

  return (
  <div className="space-y-6 max-w-2xl">
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-900">Company Profile</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
          <input type="text" value={metadata.company_name || "Acme Corporation (EU)"} onChange={e => handleChange('company_name', e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Legal Entity Type</label>
            <select value={metadata.legal_entity || "GmbH"} onChange={e => handleChange('legal_entity', e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white">
              <option>GmbH</option>
              <option>AG</option>
              <option>Ltd</option>
              <option>SARL</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
            <input type="text" value={metadata.registration_number || "HRB 123456"} onChange={e => handleChange('registration_number', e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" />
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-900">Tax & Billing Information</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">VAT/Tax ID</label>
          <input type="text" value={metadata.tax_id || "DE999999999"} onChange={e => handleChange('tax_id', e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-mono" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Billing Address</label>
          <textarea rows={3} value={metadata.billing_address || "Friedrichstraße 123\n10117 Berlin\nGermany"} onChange={e => handleChange('billing_address', e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"></textarea>
        </div>
      </div>
    </div>

    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-900">Feature Flags & Experiments</h3>
      <div className="space-y-3">
        <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
          <div>
            <span className="text-sm font-medium text-slate-800">Enable Beta Compliance Modules</span>
            <p className="text-xs text-slate-500">Access early drafts of upcoming EU regulations.</p>
          </div>
          <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
        </label>
        <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
          <div>
            <span className="text-sm font-medium text-slate-800">Automated Workflow Engine</span>
            <p className="text-xs text-slate-500">Auto-assign tasks to risk officers based on thresholds.</p>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
        </label>
      </div>
    </div>
  </div>
  );
};

const AppearanceSettings = () => {
  const { language, setLanguage, t } = useLanguage();
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  const languages: { code: LanguageCode; label: string; native: string; flag: string }[] = [
    { code: "en", label: "English", native: "English", flag: "🇬🇧" },
    { code: "de", label: "German", native: "Deutsch", flag: "🇩🇪" },
    { code: "fr", label: "French", native: "Français", flag: "🇫🇷" },
    { code: "es", label: "Spanish", native: "Español", flag: "🇪🇸" },
    { code: "it", label: "Italian", native: "Italiano", flag: "🇮🇹" },
    { code: "ar", label: "Arabic", native: "العربية", flag: "🇸🇦" },
  ];

  const handleThemeChange = (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    localStorage.setItem('theme', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    // Emit custom event for immediate updates in any other active component listeners
    window.dispatchEvent(new Event('theme-changed'));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Language Switcher Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
            <Languages className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{t("select_language", "Select Language")}</h3>
            <p className="text-sm text-slate-500">{t("language_desc", "Choose your preferred language for the application UI labels.")}</p>
          </div>
        </div>

        {/* Grid Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-emerald-400"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span className="text-2xl mb-1" role="img" aria-label={lang.label}>
                  {lang.flag}
                </span>
                <span className="text-sm font-semibold">{lang.native}</span>
                <span className={`text-[10px] ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                  {lang.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interface Theme Toggle (Light / Dark) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Interface Theme Mode</h3>
            <p className="text-sm text-slate-500">Toggle between Light and Dark visual system states.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
              themeMode === 'light'
                ? "bg-indigo-50/50 border-indigo-500 ring-2 ring-indigo-500/20"
                : "bg-white border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div>
              <span className="text-sm font-bold text-slate-800 block">Light Mode</span>
              <span className="text-xs text-slate-500 mt-1">Clean slate look, soft high-contrast borders</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${themeMode === 'light' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
              {themeMode === 'light' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
              themeMode === 'dark'
                ? "bg-slate-900 border-slate-950 text-white ring-2 ring-indigo-500/40"
                : "bg-white border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div>
              <span className="text-sm font-bold text-slate-800 dark:text-white block">Dark Mode</span>
              <span className="text-xs text-slate-400 mt-1">Sovereign night mode, energy efficient</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${themeMode === 'dark' ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-300'}`}>
              {themeMode === 'dark' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>
        </div>
      </div>

      {/* Accessibility Preferences */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900">Accessibility Preferences</h3>
        <p className="text-sm text-slate-500 mb-4">Choose your preferred visual mode for readability.</p>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">Default Enterprise Theme</span>
              <span className="text-xs text-slate-500 mt-1">Standard interface with soft borders and neutral tones.</span>
            </div>
            <input type="radio" name="app_theme" defaultChecked className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500" />
          </label>

          <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">High-Contrast Accessibility Mode</span>
              <span className="text-xs text-slate-500 mt-1">Enhanced contrast ratios, bold borders, and larger typography for improved readability.</span>
            </div>
            <input type="radio" name="app_theme" className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500" />
          </label>
        </div>
      </div>
    </div>
  );
};

const ComplianceSettings: React.FC<{ tenantData: any, setTenantData: any }> = ({ tenantData, setTenantData }) => {
  const { isEnabled, toggleAutoCategorization } = useAiAutoCategorization();
  const config = tenantData.compliance_config || {};
  
  // Ensure default structures exist
  const activeFrameworks = config.activeFrameworks || {
    gdpr: true,
    ai_act: true,
    nis2: true,
    dora: false,
    eidas: false
  };
  
  const implementedSafeguards = config.implementedSafeguards || {
    'gdpr-data-mapping': false,
    'gdpr-dpa-update': false,
    'ai-bias-monitor': false,
    'ai-transparency-log': false,
    'nis2-incident-reporting': false,
    'nis2-supply-chain': false,
    'dora-resilience-test': false
  };
  
  const autoScanSchedule = config.autoScanSchedule || 'Weekly';
  const driftThreshold = config.driftThreshold !== undefined ? config.driftThreshold : 15;
  const notificationEmail = config.notificationEmail || '';

  const [isSyncing, setIsSyncing] = React.useState(false);
  const [lastSyncDate, setLastSyncDate] = React.useState<string | null>(null);
  const [syncResult, setSyncResult] = React.useState<any>(null);

  React.useEffect(() => {
    fetchWithRetry('/api/v1/compliance/eurlex-status')
      .then(res => res.json())
      .then(data => {
        if (data && data.lastSyncTimestamp) {
          setLastSyncDate(new Date(data.lastSyncTimestamp).toLocaleString());
        }
      })
      .catch(console.error);
  }, []);

  const handleEurLexSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetchWithRetry('/api/v1/compliance/eurlex-sync', { method: 'POST' });
      const data = await res.json();
      if (data && data.success) {
        setSyncResult(data);
        if (data.details?.lastSyncTimestamp) {
          setLastSyncDate(new Date(data.details.lastSyncTimestamp).toLocaleString());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateConfig = (newConfig: any) => {
    setTenantData({
      ...tenantData,
      compliance_config: {
        ...config,
        ...newConfig
      }
    });
  };

  // Mapping jurisdiction to required frameworks
  const COUNTRY_FRAMEWORK_MAPPING: Record<string, string[]> = {
    'EU': ['gdpr', 'ai_act', 'nis2'],
    'US': ['ccpa', 'hipaa'],
    'ASIA': ['sg_pdpa', 'india_dpdp'],
    'UK': ['uk_gdpr', 'uk_financial_conduct']
  };

  const jurisdiction = config.jurisdiction || 'EU';

  const handleJurisdictionChange = (countryCode: string) => {
    const frameworks = COUNTRY_FRAMEWORK_MAPPING[countryCode] || [];
    const newActiveFrameworks: Record<string, boolean> = {};
    
    // Set all to false first
    Object.keys(activeFrameworks).forEach(key => newActiveFrameworks[key] = false);
    
    // Enable mapped frameworks
    frameworks.forEach(fw => {
      newActiveFrameworks[fw] = true;
    });

    updateConfig({
      jurisdiction: countryCode,
      activeFrameworks: {
        ...activeFrameworks,
        ...newActiveFrameworks
      }
    });
  };

  const handleFrameworkToggle = (key: string) => {
    updateConfig({
      activeFrameworks: {
        ...activeFrameworks,
        [key]: !activeFrameworks[key]
      }
    });
  };

  const handleSafeguardToggle = (key: string) => {
    updateConfig({
      implementedSafeguards: {
        ...implementedSafeguards,
        [key]: !implementedSafeguards[key]
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* 0. Jurisdiction Selector */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-indigo-900 mb-1">Active Jurisdiction</h3>
        <p className="text-sm text-indigo-700 mb-4">Selecting a jurisdiction will automatically enable the required regulatory compliance frameworks.</p>
        <select 
          value={jurisdiction}
          onChange={(e) => handleJurisdictionChange(e.target.value)}
          className="w-full border border-indigo-200 rounded-lg p-2.5 text-sm bg-white cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {Object.keys(COUNTRY_FRAMEWORK_MAPPING).map(code => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>
      </div>

      {/* 1. Policy Scope */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-fade-in">
        <h3 className="font-bold text-slate-900 mb-1">Policy Scope & Drift Detection</h3>
        <p className="text-sm text-slate-500 mb-4">Select which active frameworks the automated drift detection engine will monitor.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: 'gdpr', label: 'GDPR (General Data Protection Regulation)' },
            { id: 'ai_act', label: 'EU AI Act Directive' },
            { id: 'nis2', label: 'NIS2 Cybersecurity Directive' },
            { id: 'dora', label: 'DORA (Digital Operational Resilience Act)' },
          ].map((fw) => (
            <label key={fw.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <span className="text-sm font-medium text-slate-800">{fw.label}</span>
              <input 
                type="checkbox" 
                checked={!!activeFrameworks[fw.id]} 
                onChange={() => handleFrameworkToggle(fw.id)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer" 
              />
            </label>
          ))}
        </div>
      </div>

      {/* 2. Verification / Implemented Safeguards */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-1">Mandatory Safeguards Verification</h3>
        <p className="text-sm text-slate-500 mb-4">Check the safeguards currently verified as active or implemented. Unchecked safeguards will trigger compliance drift alerts.</p>
        
        <div className="space-y-3">
          {activeFrameworks.gdpr && (
            <div className="border-l-2 border-indigo-500 pl-3 py-1 space-y-2">
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider font-mono">GDPR Controls</span>
              <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!implementedSafeguards['gdpr-data-mapping']} 
                  onChange={() => handleSafeguardToggle('gdpr-data-mapping')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 mt-1 cursor-pointer" 
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">Art 30: Records of Processing Activities (Data Mapping)</span>
                  <span className="text-xs text-slate-500 block">Full inventory map of PII datastores and legal basis logs.</span>
                </div>
              </label>
              <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!implementedSafeguards['gdpr-dpa-update']} 
                  onChange={() => handleSafeguardToggle('gdpr-dpa-update')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 mt-1 cursor-pointer" 
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">Art 28: Signed Data Processing Agreements (DPA)</span>
                  <span className="text-xs text-slate-500 block">Legally-compliant sub-processor agreements with all vendors.</span>
                </div>
              </label>
            </div>
          )}

          {activeFrameworks.ai_act && (
            <div className="border-l-2 border-amber-500 pl-3 py-1 space-y-2">
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider font-mono">EU AI ACT Controls</span>
              <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!implementedSafeguards['ai-bias-monitor']} 
                  onChange={() => handleSafeguardToggle('ai-bias-monitor')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 mt-1 cursor-pointer" 
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">Art 14: Algorithmic Bias Monitoring System</span>
                  <span className="text-xs text-slate-500 block">Automated telemetry checking selections across gender/age vectors.</span>
                </div>
              </label>
              <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!implementedSafeguards['ai-transparency-log']} 
                  onChange={() => handleSafeguardToggle('ai-transparency-log')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 mt-1 cursor-pointer" 
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">Art 13: System Transparency and Activity Log</span>
                  <span className="text-xs text-slate-500 block">User instructions and model training logs available for regulator review.</span>
                </div>
              </label>
            </div>
          )}

          {activeFrameworks.nis2 && (
            <div className="border-l-2 border-emerald-500 pl-3 py-1 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider font-mono">NIS2 Controls</span>
              <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!implementedSafeguards['nis2-incident-reporting']} 
                  onChange={() => handleSafeguardToggle('nis2-incident-reporting')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 mt-1 cursor-pointer" 
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">Art 21: Cyber Incident Reporting Protocol</span>
                  <span className="text-xs text-slate-500 block">Documented 24-hour initial warning process for critical incidents.</span>
                </div>
              </label>
              <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!implementedSafeguards['nis2-supply-chain']} 
                  onChange={() => handleSafeguardToggle('nis2-supply-chain')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 mt-1 cursor-pointer" 
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">Art 21(2): Supply Chain Vulnerability Scan</span>
                  <span className="text-xs text-slate-500 block">Live code audits and API secret scanning of linked repositories.</span>
                </div>
              </label>
            </div>
          )}

          {activeFrameworks.dora && (
            <div className="border-l-2 border-teal-500 pl-3 py-1 space-y-2">
              <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider font-mono">DORA Controls</span>
              <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!implementedSafeguards['dora-resilience-test']} 
                  onChange={() => handleSafeguardToggle('dora-resilience-test')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 mt-1 cursor-pointer" 
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">Art 24: ICT Operational Resilience Testing</span>
                  <span className="text-xs text-slate-500 block">Annual simulated penetration testing and redundant server failover rules.</span>
                </div>
              </label>
            </div>
          )}

          {!activeFrameworks.gdpr && !activeFrameworks.ai_act && !activeFrameworks.nis2 && !activeFrameworks.dora && (
            <p className="text-sm text-slate-400 italic">No frameworks active. Enable a framework above to view its controls.</p>
          )}
        </div>
      </div>

      {/* 3. Automation, Thresholds and Emails */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900">Automation & Thresholds</h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Auto-Scan Schedule</label>
          <select 
            value={autoScanSchedule}
            onChange={(e) => updateConfig({ autoScanSchedule: e.target.value })}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly (Only on 1st)</option>
            <option value="Manual">Manual Trigger Only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Drift Alert Score Sensitivity Threshold</label>
          <p className="text-xs text-slate-500 mb-2">Raise alert notifications if the compliance drift score drops below or penalty exceeds this limit.</p>
          <div className="flex items-center space-x-4">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={driftThreshold} 
              onChange={(e) => updateConfig({ driftThreshold: Number(e.target.value) })}
              className="flex-1 cursor-pointer accent-emerald-600" 
            />
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded min-w-[50px] text-center">
              {driftThreshold}%
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Alert Notification Email Address</label>
          <input 
            type="email" 
            placeholder="compliance-officer@company.eu"
            value={notificationEmail} 
            onChange={(e) => updateConfig({ notificationEmail: e.target.value })}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
          />
        </div>
      </div>

      {/* 4. AI-Powered Auto-Categorization Engine Configuration */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${isEnabled ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'} transition-colors mt-0.5`}>
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900">AI-Powered Auto-Categorization Engine</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                  isEnabled 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {isEnabled ? 'Active & Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Dynamically detects, analyzes, and categorizes incident reports, compliance controls, scam vectors, and regulatory risk tiers in real time from natural language input.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              id="compliance-ai-auto-categorization-toggle"
              checked={isEnabled}
              onChange={toggleAutoCategorization}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${
          isEnabled 
            ? 'bg-purple-50/50 border-purple-100 text-slate-700' 
            : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-semibold block text-slate-800">
                {isEnabled ? '✨ Engine Status: Real-Time Vector Matching Active' : '⏸️ Engine Status: Paused'}
              </span>
              <p className="text-[11px] text-slate-500">
                {isEnabled 
                  ? 'Input text is evaluated against regulatory category patterns and NLP classification models.' 
                  : 'Manual categorization mode is currently enforced for all incoming records and forms.'}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-mono font-medium px-2 py-1 rounded bg-white/80 border border-slate-200 text-slate-600 shadow-2xs">
                Storage: LocalStorage (Synced)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Eur-Lex Sync */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-slate-900">Eur-Lex Policy Synchronization</h3>
            <p className="text-sm text-slate-500 mt-1">Background sync service that compares existing organizational policies against the latest EU directives from the Eur-Lex API.</p>
          </div>
          <button
            onClick={handleEurLexSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Import Updates'}</span>
          </button>
        </div>

        {lastSyncDate && (
          <div className="text-sm text-slate-600">
            <strong>Last verified:</strong> {lastSyncDate}
          </div>
        )}

        {syncResult && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Sync Completed</p>
              <p className="text-sm text-emerald-700 mt-1">
                {syncResult.details.newDirectivesFound} new directives found. {syncResult.details.policiesUpdated} policies updated.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SecuritySettings: React.FC<{ 
  twoFactorConfig: any, 
  setTwoFactorConfig: any,
  smtpConfig: any,
  setSmtpConfig: any,
  smsConfig: any,
  setSmsConfig: any,
  onSave: (customData?: any) => Promise<void>
}> = ({ twoFactorConfig, setTwoFactorConfig, smtpConfig, setSmtpConfig, smsConfig, setSmsConfig, onSave }) => {
  const [showMfaSetup, setShowMfaSetup] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* 2FA Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${twoFactorConfig.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Two-Factor Authentication (2FA)</h3>
              <p className="text-sm text-slate-500 mt-1">Multi-layered identity verification mechanism.</p>
            </div>
          </div>
          <div className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={twoFactorConfig.enabled} 
              onChange={(e) => {
                const updated = { ...twoFactorConfig, enabled: e.target.checked };
                setTwoFactorConfig(updated);
                onSave(); // Persist change immediately
              }}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </div>
        </div>

        {twoFactorConfig.enabled && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default Method</label>
                <select 
                  value={twoFactorConfig.method}
                  onChange={(e) => {
                    const updated = { ...twoFactorConfig, method: e.target.value };
                    setTwoFactorConfig(updated);
                    onSave();
                  }}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                >
                  <option value="authenticator">Authenticator App (TOTP)</option>
                  <option value="sms">SMS Verification Code</option>
                  <option value="email">Email Verification Code</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Enforcement Policy</label>
                <select 
                  value={twoFactorConfig.enforcement}
                  onChange={(e) => {
                    const updated = { ...twoFactorConfig, enforcement: e.target.value };
                    setTwoFactorConfig(updated);
                    onSave();
                  }}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                >
                  <option value="all">All Users (Required)</option>
                  <option value="admin">Admins Only</option>
                  <option value="optional">Optional for Users</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="w-4 h-4 text-indigo-500 mr-2" />
                  <span className="text-xs font-semibold text-slate-700">{twoFactorConfig.backupCodesLeft} Backup Codes Remaining</span>
                </div>
                {!showMfaSetup && (
                  <button 
                    onClick={() => setShowMfaSetup(true)}
                    className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 rounded-lg text-xs font-bold transition-colors"
                  >
                    {twoFactorConfig.isConfigured ? 'Reconfigure 2FA' : 'Configure My 2FA'}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showMfaSetup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2"
                  >
                    <MfaSetupFlow 
                      onComplete={() => {
                        const updated = { 
                          ...twoFactorConfig, 
                          backupCodesLeft: 10, 
                          isConfigured: true,
                          enabled: true 
                        };
                        setTwoFactorConfig(updated);
                        setShowMfaSetup(false);
                        // Force save with updated data
                        onSave();
                      }}
                      onCancel={() => setShowMfaSetup(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

    {/* SMS API Section */}
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">SMS API Configuration</h3>
          <p className="text-sm text-slate-500">Built-in gateway for 2FA and emergency alerts.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
          <select 
            value={smsConfig.provider}
            onChange={(e) => setSmsConfig({ ...smsConfig, provider: e.target.value })}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
          >
            <option value="twilio">Twilio (Recommended)</option>
            <option value="vonage">Vonage / Nexmo</option>
            <option value="messagebird">MessageBird</option>
            <option value="custom">Custom Webhook</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sender ID (EU Alpha)</label>
          <input 
            type="text" 
            value={smsConfig.senderId}
            onChange={(e) => setSmsConfig({ ...smsConfig, senderId: e.target.value })}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" 
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">API Key / Token</label>
          <input 
            type="password" 
            value={smsConfig.apiKey}
            onChange={(e) => setSmsConfig({ ...smsConfig, apiKey: e.target.value })}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-mono" 
          />
        </div>
      </div>
    </div>

    {/* SMTP Section */}
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Email SMTP Management</h3>
          <p className="text-sm text-slate-500">Configure outbound mail for reports and notifications.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
          <input 
            type="text" 
            value={smtpConfig.host}
            onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-mono" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
          <input 
            type="text" 
            value={smtpConfig.port}
            onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" 
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Username / Auth Email</label>
          <input 
            type="text" 
            value={smtpConfig.user}
            onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Encryption</label>
          <select 
            value={smtpConfig.encryption}
            onChange={(e) => setSmtpConfig({ ...smtpConfig, encryption: e.target.value })}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
          >
            <option value="tls">STARTTLS (587)</option>
            <option value="ssl">SSL/TLS (465)</option>
            <option value="none">None (Plaintext)</option>
          </select>
        </div>
        <div className="col-span-3">
          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center">
            <ExternalLink className="w-3 h-3 mr-1" /> Send Test Email Configuration
          </button>
        </div>
      </div>
    </div>
    
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-900">Session Management</h3>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Idle Timeout (Minutes)</label>
        <select className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white">
          <option>15 Minutes</option>
          <option>30 Minutes</option>
          <option>1 Hour</option>
          <option>4 Hours</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">IP Allowlist</label>
        <textarea rows={2} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-mono" placeholder="e.g. 192.168.1.1/24" defaultValue="0.0.0.0/0"></textarea>
      </div>
    </div>
    </div>
  );
};

const PrivacySettings = () => {
  const { t } = useLanguage();
  const [backupConfig, setBackupConfig] = useState({
    is_active: false,
    is_encrypted: true,
    interval_hours: 24,
    retention_days: 30
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    fetchWithRetry('/api/v1/admin/backup-config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBackupConfig(data.config);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load backup config:', err);
        setIsLoading(false);
      });
  }, []);

  const handleUpdateConfig = async (updates: Partial<typeof backupConfig>) => {
    const newConfig = { ...backupConfig, ...updates };
    setBackupConfig(newConfig);
    setIsSaving(true);
    try {
      await fetchWithRetry('/api/v1/admin/backup-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (err) {
      console.error('Failed to save backup config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Disaster Recovery Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Disaster Recovery Protocol</h3>
              <p className="text-sm text-slate-500">Automated, encrypted background database exports.</p>
            </div>
          </div>
          <div className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={backupConfig.is_active} 
              onChange={(e) => handleUpdateConfig({ is_active: e.target.checked })}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </div>
        </div>

        {backupConfig.is_active && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-4 border-t border-slate-100 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Backup Interval</label>
                <select 
                  value={backupConfig.interval_hours}
                  onChange={(e) => handleUpdateConfig({ interval_hours: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                >
                  <option value={6}>Every 6 Hours</option>
                  <option value={12}>Every 12 Hours</option>
                  <option value={24}>Daily (Every 24 Hours)</option>
                  <option value={168}>Weekly (Every 7 Days)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Retention Period</label>
                <select 
                  value={backupConfig.retention_days}
                  onChange={(e) => handleUpdateConfig({ retention_days: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                >
                  <option value={7}>7 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={365}>1 Year</option>
                </select>
              </div>
            </div>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
              <div className="flex items-center">
                <Lock className="w-4 h-4 text-slate-500 mr-2" />
                <div>
                  <span className="text-sm font-medium text-slate-800">AES-256 Encryption</span>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Mandatory for DR Compliance</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={backupConfig.is_encrypted} 
                onChange={(e) => handleUpdateConfig({ is_encrypted: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" 
              />
            </label>

            {isSaving && (
              <div className="flex items-center text-[10px] text-slate-400 font-medium">
                <div className="w-3 h-3 border border-slate-300 border-t-slate-600 rounded-full animate-spin mr-1.5" />
                Syncing with secure vault...
              </div>
            )}

            <StorageAnalysis retentionDays={backupConfig.retention_days} />
          </motion.div>
        )}
      </div>

      <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <AlertTriangle className="w-24 h-24 text-rose-600" />
        </div>
        <h3 className="font-bold text-rose-800">Data Retention & Deletion</h3>
        <p className="text-sm text-slate-600 max-w-md">Configure how long evidence and audit logs are kept before being permanently destroyed according to EU standards.</p>
        
        <div className="space-y-3 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Audit Log Retention</label>
            <select className="w-full max-w-xs border border-slate-200 rounded-lg p-2.5 text-sm bg-white">
              <option>1 Year</option>
              <option>3 Years</option>
              <option>10 Years (Enterprise)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">Data Export</h3>
          <p className="text-sm text-slate-500 mt-1">Download a full archive of your tenant's configuration and compliance statuses.</p>
        </div>
        <button className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-sm font-medium">
          Request JSON Archive
        </button>
      </div>
    </div>
  );
};

const AdminSettings: React.FC<{ tenantData: any, setTenantData: any }> = ({ tenantData, setTenantData }) => {
  let metadata = tenantData.admin_roles || {};
  if (typeof metadata === 'string') {
    try { metadata = JSON.parse(metadata); } catch(e) { metadata = {}; }
  }
  const handleChange = (field: string, value: string) => {
    setTenantData({
      ...tenantData,
      admin_roles: { ...metadata, [field]: value }
    });
  };
  return (
  <div className="space-y-6 max-w-2xl">
     <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
       <div className="flex items-start justify-between">
         <div>
           <h3 className="font-bold text-slate-900">System Health Monitoring</h3>
           <p className="text-sm text-slate-500 mt-1">Enable robust system health pinging to central dashboard.</p>
         </div>
         <div className="relative inline-flex items-center cursor-pointer">
           <input type="checkbox" checked={metadata.system_health_monitoring !== 'false'} onChange={e => handleChange('system_health_monitoring', e.target.checked ? 'true' : 'false')} className="sr-only peer" />
           <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
         </div>
       </div>
     </div>

     <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
       <div>
         <h3 className="font-bold text-slate-900">Team Members & Roles</h3>
         <p className="text-sm text-slate-500">Manage who has access to this workspace and compliance engine.</p>
       </div>
       <button className="px-3 py-1.5 bg-slate-900 text-white rounded text-sm font-medium hover:bg-slate-800">Invite User</button>
     </div>
     
     <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
       <table className="w-full text-left text-sm whitespace-nowrap">
         <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
           <tr>
             <th className="px-4 py-3 font-medium">User</th>
             <th className="px-4 py-3 font-medium">Role</th>
             <th className="px-4 py-3 font-medium">Status</th>
             <th className="px-4 py-3 font-medium">Action</th>
           </tr>
         </thead>
         <tbody className="divide-y divide-slate-100">
           <tr>
             <td className="px-4 py-3"><span className="font-medium text-slate-900">Alice Admin</span><br/><span className="text-xs text-slate-500">alice@acme.eu</span></td>
             <td className="px-4 py-3"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">Owner</span></td>
             <td className="px-4 py-3"><span className="flex items-center text-emerald-600"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></div>Active</span></td>
             <td className="px-4 py-3"><button className="text-slate-400 hover:text-slate-600">Edit</button></td>
           </tr>
         </tbody>
       </table>
     </div>
     
     <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
       <h3 className="font-bold text-slate-900">Audit Logs & Telemetry Export</h3>
       <div className="space-y-3">
         <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">Export Endpoint (SIEM)</label>
           <input type="text" value={metadata.siem_endpoint || "https://siem.acme.eu/api/ingest"} onChange={e => handleChange('siem_endpoint', e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-mono" />
         </div>
       </div>
       <button className="px-4 py-2 border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium">
         Download Last 30 Days Audit Trail
       </button>
     </div>
  </div>
  );
};

const IntegrationSettings: React.FC<{ tenantData: any, setTenantData: any }> = ({ tenantData, setTenantData }) => {
  let metadata = tenantData.integrations || {};
  if (typeof metadata === 'string') {
    try { metadata = JSON.parse(metadata); } catch(e) { metadata = {}; }
  }
  const handleToggle = (integrationKey: string) => {
    setTenantData({
      ...tenantData,
      integrations: { ...metadata, [integrationKey]: !metadata[integrationKey] }
    });
  };

  return (
  <div className="space-y-4 max-w-2xl">
    {['Slack', 'Microsoft Teams', 'Jira', 'GitLab Code Auditing', 'Workday API', 'Local SQLite Backup', 'ChromaDB Core'].map((int) => (
      <div key={int} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <Network className={`w-5 h-5 ${metadata[int] ? 'text-emerald-500' : 'text-slate-500'}`} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{int}</h4>
            <p className="text-xs text-slate-500">{metadata[int] ? 'Connected and syncing' : 'Not connected'}</p>
          </div>
        </div>
        <button 
          onClick={() => handleToggle(int)}
          className={`px-3 py-1 border rounded text-sm font-medium ${metadata[int] ? 'border-rose-300 text-rose-700 hover:bg-rose-50' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
        >
          {metadata[int] ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    ))}
  </div>
);
}

const NotificationSettings = () => {
  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('tenant_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse tenant_notifications:', e);
    }
    return {
      critical_compliance: true,
      system_warnings: true,
      new_act_alerts: true,
      weekly_digest: false,
      billing_failures: true
    };
  });

  const handleToggle = (key: string) => {
    const nextAlerts = { ...alerts, [key]: !alerts[key as keyof typeof alerts] };
    setAlerts(nextAlerts);
    localStorage.setItem('tenant_notifications', JSON.stringify(nextAlerts));
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900">Email Alerts</h3>
        <p className="text-sm text-slate-500 mb-4">Manage the notifications sent to your tenant administrator.</p>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">Critical Compliance Violations</span>
              <span className="text-xs text-slate-500 mt-1">Get notified immediately when severe breaches are detected.</span>
            </div>
            <input type="checkbox" checked={alerts.critical_compliance} onChange={() => handleToggle('critical_compliance')} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
          </label>

          <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">System Warnings</span>
              <span className="text-xs text-slate-500 mt-1">Alerts regarding system health, degraded performance, or configuration issues.</span>
            </div>
            <input type="checkbox" checked={alerts.system_warnings} onChange={() => handleToggle('system_warnings')} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
          </label>

          <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">New Act Applicability Alerts</span>
              <span className="text-xs text-slate-500 mt-1">Notifies when regional regulatory updates may impact your operations.</span>
            </div>
            <input type="checkbox" checked={alerts.new_act_alerts} onChange={() => handleToggle('new_act_alerts')} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
          </label>
          
          <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">Weekly Digest</span>
              <span className="text-xs text-slate-500 mt-1">A curated weekly summary of your compliance posture and ledger activity.</span>
            </div>
            <input type="checkbox" checked={alerts.weekly_digest} onChange={() => handleToggle('weekly_digest')} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
          </label>
          
          <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">Billing Failures</span>
              <span className="text-xs text-slate-500 mt-1">Notifies immediately if a payment processing fails.</span>
            </div>
            <input type="checkbox" checked={alerts.billing_failures} onChange={() => handleToggle('billing_failures')} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
          </label>
        </div>
      </div>
    </div>
  );
};

const VISIBILITY_MODULES = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'vault', name: 'Vault' },
  { id: 'evidence-vault', name: 'Evidence Vault' },
  { id: 'dpo-certification', name: 'DPO Certification' },
  { id: 'tasks', name: 'Tasks' },
  { id: 'automation-portal', name: 'Automation Portal' },
  { id: 'compliance-scraper', name: 'Compliance Scraper' },
  { id: 'secret-scanner', name: 'Secret Scanner' },
  { id: 'policy-engine', name: 'Policy Engine' },
  { id: 'vulnerability-scanner', name: 'Vulnerability Scanner' },
  { id: 'ai-knowledge', name: 'AI Knowledge Base' },
  { id: 'data-lineage', name: 'Data Lineage' },
  { id: 'security-logs', name: 'Security Logs' },
  { id: 'zero-trust', name: 'Zero Trust Network' },
  { id: 'runtime-security', name: 'Runtime Security' },
  { id: 'identity-management', name: 'Identity Management' },
  { id: 'graph-intelligence', name: 'Graph Intelligence' },
  { id: 'sovereignty', name: 'Sovereignty Dashboard' },
  { id: 'dora-resilience', name: 'DORA Resilience' },
  { id: 'reports', name: 'Reports' },
  { id: 'companies', name: 'Companies' },
  { id: 'audit-ledger', name: 'Audit Ledger' },
  { id: 'aml-kyc', name: 'AML / KYC' },
  { id: 'mica-forensics', name: 'MiCA Forensics' },
  { id: 'analytical-intelligence', name: 'Analytical Intelligence' },
  { id: 'developer-api', name: 'Developer API' },
  { id: 'ecommerce-eu', name: 'EU Ecommerce' },
  { id: 'healthtech', name: 'Healthtech' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'govtech', name: 'Govtech' },
  { id: 'edtech', name: 'Edtech' },
  { id: 'logistic', name: 'Logistic & Supply Chain' },
  { id: 'cyber-security', name: 'Cybersecurity Hub' },
  { id: 'incident-response', name: 'Incident Response' }
];

const PlatformVisibilityManager: React.FC<{ tenantData: any, setTenantData: any }> = ({ tenantData, setTenantData }) => {
  const [search, setSearch] = useState('');
  const [previewRole, setPreviewRole] = useState<'CLIENT' | 'REGULATOR'>('CLIENT');
  
  // By default allow everything
  const visibility = tenantData.platform_visibility || {};

  const handleToggle = (moduleId: string, role: 'CLIENT' | 'REGULATOR') => {
    const current = visibility[moduleId] || { CLIENT: true, REGULATOR: true };
    const updated = { ...current, [role]: !current[role] };
    
    setTenantData({
      ...tenantData,
      platform_visibility: {
        ...visibility,
        [moduleId]: updated
      }
    });
  };

  const handleBulkToggle = (role: 'CLIENT' | 'REGULATOR', value: boolean) => {
    const newVisibility = { ...visibility };
    VISIBILITY_MODULES.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).forEach(m => {
      const current = newVisibility[m.id] || { CLIENT: true, REGULATOR: true };
      newVisibility[m.id] = { ...current, [role]: value };
    });
    setTenantData({
      ...tenantData,
      platform_visibility: newVisibility
    });
  };

  const handleResetDefaults = (role: 'CLIENT' | 'REGULATOR') => {
    const newVisibility = { ...visibility };
    VISIBILITY_MODULES.forEach(m => {
      const current = newVisibility[m.id] || { CLIENT: true, REGULATOR: true };
      // System baseline: everything is enabled by default
      newVisibility[m.id] = { ...current, [role]: true };
    });
    setTenantData({
      ...tenantData,
      platform_visibility: newVisibility
    });
  };

  const filteredModules = VISIBILITY_MODULES.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-900">Module Visibility Matrix</h3>
          <p className="text-sm text-slate-500 mt-1">Enable or disable specific features globally for Client and Regulator dashboards.</p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Search modules..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Module Name</th>
                <th className="px-4 py-3 font-medium text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <span>Client Dashboard</span>
                    <div className="flex space-x-2">
                      <button onClick={() => handleBulkToggle('CLIENT', true)} className="text-[10px] px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 font-semibold uppercase tracking-wider">All On</button>
                      <button onClick={() => handleBulkToggle('CLIENT', false)} className="text-[10px] px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 font-semibold uppercase tracking-wider">All Off</button>
                      <button onClick={() => handleResetDefaults('CLIENT')} className="text-[10px] px-2 py-1 bg-emerald-100 hover:bg-emerald-200 rounded text-emerald-800 font-semibold uppercase tracking-wider">Reset</button>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 font-medium text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <span>Regulator Dashboard</span>
                    <div className="flex space-x-2">
                      <button onClick={() => handleBulkToggle('REGULATOR', true)} className="text-[10px] px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 font-semibold uppercase tracking-wider">All On</button>
                      <button onClick={() => handleBulkToggle('REGULATOR', false)} className="text-[10px] px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 font-semibold uppercase tracking-wider">All Off</button>
                      <button onClick={() => handleResetDefaults('REGULATOR')} className="text-[10px] px-2 py-1 bg-emerald-100 hover:bg-emerald-200 rounded text-emerald-800 font-semibold uppercase tracking-wider">Reset</button>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredModules.map(module => {
                const current = visibility[module.id] || { CLIENT: true, REGULATOR: true };
                return (
                  <tr key={module.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{module.name}</td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleToggle(module.id, 'CLIENT')}
                        className={`inline-flex items-center justify-center p-1.5 rounded-md transition-colors ${current.CLIENT ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}
                      >
                        {current.CLIENT ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleToggle(module.id, 'REGULATOR')}
                        className={`inline-flex items-center justify-center p-1.5 rounded-md transition-colors ${current.REGULATOR ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}
                      >
                        {current.REGULATOR ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredModules.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-5 sm:py-8 text-center text-slate-500">
                    No modules found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold flex items-center space-x-2">
              <LayoutTemplate className="w-5 h-5 text-emerald-400" />
              <span>Live Sidebar Simulation</span>
            </h3>
            <p className="text-sm text-slate-400 mt-1">Preview how the sidebar appears for the selected role based on the current visibility settings.</p>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setPreviewRole('CLIENT')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${previewRole === 'CLIENT' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Client Role
            </button>
            <button 
              onClick={() => setPreviewRole('REGULATOR')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${previewRole === 'REGULATOR' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Regulator Role
            </button>
          </div>
        </div>

        <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 max-w-xs flex flex-col space-y-2 h-[300px] overflow-y-auto">
          <div className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800 mb-2">
            Main Navigation
          </div>
          {VISIBILITY_MODULES.map(module => {
            const current = visibility[module.id] || { CLIENT: true, REGULATOR: true };
            if (!current[previewRole]) return null;
            
            return (
              <div key={module.id} className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-colors">
                <div className="w-4 h-4 bg-slate-700 rounded-sm flex-shrink-0" />
                <span className="text-sm font-medium">{module.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const UserActivityLog: React.FC = () => {
  const [logs, setLogs] = useState([
    { id: 1, action: 'Role Switched', actor: 'superadmin@nonaxen.com', target: 'Alice Admin', details: 'Changed role from Editor to Owner', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 2, action: 'Configuration Changed', actor: 'alice@acme.eu', target: 'Compliance Settings', details: 'Enabled AI Act Directive', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 3, action: 'Module Visibility', actor: 'alice@acme.eu', target: 'Platform Visibility', details: 'Disabled "Vault" for Regulator Role', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: 4, action: 'Integration Connected', actor: 'superadmin@nonaxen.com', target: 'Slack Integration', details: 'Connected Slack workspace', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" />
              User Activity Log
            </h3>
            <p className="text-sm text-slate-500 mt-1">Audit administrative actions, role switches, and configuration changes.</p>
          </div>
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-shadow outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl mt-4">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Actor</th>
                <th className="px-4 py-3 font-semibold">Target</th>
                <th className="px-4 py-3 font-semibold w-full">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{log.actor}</td>
                  <td className="px-4 py-3 text-slate-600">{log.target}</td>
                  <td className="px-4 py-3 text-slate-500 truncate max-w-[200px] sm:max-w-[300px]" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-5 sm:py-8 text-center text-slate-500">
                    No activity logs match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


