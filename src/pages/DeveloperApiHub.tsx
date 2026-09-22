import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { 
  Code2, Key, Terminal, FileCode2, Copy, CheckCircle2, Zap, Shield, Database, 
  Eye, EyeOff, RefreshCw, Trash2, Plus, Info, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight, Lock as LockIcon,
  SlidersHorizontal, ToggleLeft, ToggleRight, Activity, Globe, Cpu, Leaf, Fingerprint, Send, Settings2
} from 'lucide-react';
import { ApiTrafficChart } from '../components/analytics/ApiTrafficChart';

interface ApiToken {
  id: number;
  token: string;
  name: string;
  client_system: string;
  scope: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
}

const DEFAULT_GATEWAY_SERVICES = [
  {
    id: 'gdpr_pii',
    name: 'GDPR Personal Data Scanner',
    description: 'Scans text payloads for emails, credit cards, and phone numbers. Applies automated masking.',
    enabled: false,
    settings: { mask_pii: true, target_score: 80 }
  },
  {
    id: 'dora_resiliency',
    name: 'DORA ICT Resiliency Audit',
    description: 'Analyzes target system failover windows, network routing paths, and database high-availability.',
    enabled: false,
    settings: { require_geo_redundant: true }
  },
  {
    id: 'sovereign_residency',
    name: 'Sovereign Cloud Data Residency Check',
    description: 'Verifies physical storage server coordinates against regional and national sovereignty bounds.',
    enabled: false,
    settings: { bound_region: 'EU' }
  },
  {
    id: 'ai_ethics',
    name: 'AI Act Compliance Auditor',
    description: 'Identifies and flags unapproved AI architectures, social scoring algorithms, and biometric classifications.',
    enabled: false,
    settings: { flag_prohibited_only: true }
  },
  {
    id: 'esg_carbon',
    name: 'ESG Carbon Analytics Log',
    description: 'Logs data ingress size metrics and estimates carbon footprints relative to green energy zones.',
    enabled: false,
    settings: { require_green_offset: false }
  },
  {
    id: 'biometric_vault',
    name: 'Biometric Storage Encryption Vault',
    description: 'Audits hardware isolation protocols, Secure Enclave parameters, and eIDAS compliance thresholds.',
    enabled: false,
    settings: { enforce_tee: true }
  }
];

export const SERVICE_SUBSCRIPTION_MAP: Record<string, { addonId: string; addonName: string; price: string; policies: string[] }> = {
  gdpr_pii: { addonId: 'ecommerce', addonName: 'E-Commerce Standard', price: '€49/mo', policies: ['GDPR', 'ePrivacy'] },
  dora_resiliency: { addonId: 'fintech_pro', addonName: 'Fintech Pro Standard', price: '€299/mo', policies: ['GDPR', 'DORA', 'PSD3'] },
  sovereign_residency: { addonId: 'enterprise', addonName: 'Sovereign Multi-Region Enclave', price: '€890/mo', policies: ['GDPR', 'CRA', 'NIS2'] },
  ai_ethics: { addonId: 'enterprise_ai', addonName: 'Enterprise AI Horizon', price: '€999/mo', policies: ['AI ACT', 'GDPR', 'DATA_ACT'] },
  esg_carbon: { addonId: 'logistics', addonName: 'Logistics & Supply Chain', price: '€349/mo', policies: ['CSRD', 'GDPR'] },
  biometric_vault: { addonId: 'healthtech', addonName: 'HealthTech Secure', price: '€399/mo', policies: ['GDPR', 'EHDS', 'HIPAA'] }
};

export const DeveloperApiHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'keys' | 'docs' | 'sdks'>('keys');
  const [copied, setCopied] = useState<string | null>(null);

  // Modular subscription tracking state
  const [activeSubscriptions, setActiveSubscriptions] = useState<string[]>(['ecommerce', 'education', 'remediation_api']);
  const [isSubscribingId, setIsSubscribingId] = useState<string | null>(null);
  
  // SDK consult tab states
  const [selectedConsultKeyId, setSelectedConsultKeyId] = useState<string>('');
  const [selectedSdkTab, setSelectedSdkTab] = useState<'node' | 'python' | 'go' | 'curl'>('node');

  const fetchActiveSubscriptions = async () => {
    try {
      const res = await fetchWithRetry('/api/v1/caas/addons?tenantId=org_1');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.addons)) {
          const activeIds = data.addons
            .filter((addon: any) => addon.status === 'active')
            .map((addon: any) => addon.id);
          setActiveSubscriptions(activeIds);
        }
      }
    } catch (err) {
      console.error('Error fetching active subscriptions:', err);
    }
  };

  const handleQuickSubscribe = async (addonId: string) => {
    setIsSubscribingId(addonId);
    try {
      const res = await fetchWithRetry(`/api/v1/caas/tenants/org_1/subscriptions/${addonId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      const data = await res.json();
      if (data.success) {
        setActiveSubscriptions(prev => [...prev, addonId]);
        showNotification('success', `Microservice add-on activated successfully! Ready to apply.`);
      } else {
        showNotification('error', data.error || 'Failed to activate the addon subscription.');
      }
    } catch (err: any) {
      showNotification('error', `Activation error: ${err.message || err}`);
    } finally {
      setIsSubscribingId(null);
    }
  };

  useEffect(() => {
    fetchActiveSubscriptions();
  }, []);

  // Custom Services Nocode Gateway customizer state
  const [selectedTokenForCustomServices, setSelectedTokenForCustomServices] = useState<ApiToken | null>(null);
  const [customServicesState, setCustomServicesState] = useState<any[]>([]);
  const [isSavingCustomServices, setIsSavingCustomServices] = useState<boolean>(false);
  
  // Custom Services Playground Try/Test panel state
  const [playgroundPayload, setPlaygroundPayload] = useState<{
    content: string;
    target_host: string;
    location: string;
    database_failover_seconds: number;
    biometric_type: string;
    storage_enclave_only: boolean;
    cloud_sync: boolean;
    size_bytes: number;
  }>({
    content: "Please contact help@unsecured-corp.com or pay $50 to credit card 4111-XXXX-XXXX-4444. Ensure you do not upload social scoring data.",
    target_host: "localhost-standalone-nonredundant",
    location: "US",
    database_failover_seconds: 30,
    biometric_type: "face",
    storage_enclave_only: false,
    cloud_sync: true,
    size_bytes: 512
  });
  const [playgroundResult, setPlaygroundResult] = useState<any | null>(null);
  const [isPlayinggroundLoading, setIsPlaygroundLoading] = useState<boolean>(false);

  // API Token State Manager
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isRotatingId, setIsRotatingId] = useState<number | null>(null);
  const [isRevokingId, setIsRevokingId] = useState<number | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSystem, setFormSystem] = useState('Salesforce');
  const [formScope, setFormScope] = useState('Full Compliance');

  // UI States
  const [revealedTokens, setRevealedTokens] = useState<Record<number, boolean>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('scan');

  // Traffic Analytics State
  const [traffic, setTraffic] = useState<any[]>([]);
  const [trafficTokens, setTrafficTokens] = useState<any[]>([]);
  const [trafficEndpoints, setTrafficEndpoints] = useState<string[]>([]);
  const [isTrafficLoading, setIsTrafficLoading] = useState<boolean>(true);

  // Fetch Tokens on Load
  const fetchTokens = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/compliance/tokens');
      if (res.ok) {
        const data = await res.json();
        const loadedTokens = data.tokens || [];
        setTokens(loadedTokens);
        if (loadedTokens.length > 0 && !selectedConsultKeyId) {
          setSelectedConsultKeyId(loadedTokens[0].token);
        }
        // Refresh traffic analytics in sync with the current active keys list
        fetchTrafficAnalytics();
      } else {
        const text = await res.text();
        console.error('Fetch tokens error response:', text.slice(0, 500));
        showNotification('error', `Failed to retrieve connection tokens from server (Status: ${res.status}).`);
      }
    } catch (err: any) {
      console.error('Fetch tokens catch:', err);
      showNotification('error', `Connection error: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrafficAnalytics = async () => {
    setIsTrafficLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/compliance/tokens/traffic-analytics');
      if (res.ok) {
        const data = await res.json();
        setTraffic(data.traffic || []);
        setTrafficTokens(data.tokens || []);
        setTrafficEndpoints(data.endpoints || []);
      } else {
        const text = await res.text();
        console.error('Fetch traffic error response:', text.slice(0, 500));
      }
    } catch (err) {
      console.error('Error loading traffic analytics:', err);
    } finally {
      setIsTrafficLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleReveal = (id: number) => {
    setRevealedTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Generate / Create API Token
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotification('error', 'Token label name cannot be empty');
      return;
    }
    
    setIsCreating(true);
    try {
      const res = await fetchWithRetry('/api/v1/compliance/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          client_system: formSystem,
          scope: formScope
        })
      });

      if (res.ok) {
        const data = await res.json();
        showNotification('success', `Token "${data.name}" generated successfully.`);
        setFormName('');
        // Refresh token list
        await fetchTokens();
      } else {
        const errData = await res.json();
        showNotification('error', errData.error || 'Failed to create token');
      }
    } catch (err: any) {
      showNotification('error', `Error creating token: ${err.message || err}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Rotate token
  const handleRotateToken = async (id: number, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to rotate "${name}"? Existing integrations using this specific token string will immediately lose access until they update to the newly generated key.`)) {
      return;
    }

    setIsRotatingId(id);
    try {
      const res = await fetchWithRetry(`/api/v1/compliance/tokens/rotate/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        showNotification('success', `Token rotated. New value generated starting with ${data.token.slice(0, 10)}...`);
        
        // Auto-reveal the rotated token so the user can copy it immediately
        setRevealedTokens(prev => ({ ...prev, [id]: true }));
        await fetchTokens();
      } else {
        const errData = await res.json();
        showNotification('error', errData.error || 'Failed to rotate token');
      }
    } catch (err: any) {
      showNotification('error', `Error rotating token: ${err.message || err}`);
    } finally {
      setIsRotatingId(null);
    }
  };

  // Revoke token
  const handleRevokeToken = async (id: number, name: string) => {
    if (!window.confirm(`WARNING: Revoking "${name}" is permanent and cannot be undone. Active services calling the API Act Engine with this token will fail.`)) {
      return;
    }

    setIsRevokingId(id);
    try {
      const res = await fetchWithRetry(`/api/v1/compliance/tokens/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showNotification('success', `Token "${name}" has been permanently revoked.`);
        await fetchTokens();
      } else {
        const errData = await res.json();
        showNotification('error', errData.error || 'Failed to revoke token');
      }
    } catch (err: any) {
      showNotification('error', `Error revoking token: ${err.message || err}`);
    } finally {
      setIsRevokingId(null);
    }
  };

  const handleOpenCustomServices = async (token: ApiToken) => {
    setSelectedTokenForCustomServices(token);
    setPlaygroundResult(null);
    try {
      const res = await fetchWithRetry(`/api/v1/compliance/tokens/${token.id}/custom-services`);
      if (res.ok) {
        const data = await res.json();
        // Merge with defaults to ensure all 6 exist
        const merged = DEFAULT_GATEWAY_SERVICES.map(def => {
          const found = data.custom_services?.find((s: any) => s.id === def.id);
          if (found) {
            return { ...def, enabled: found.enabled === true || found.enabled === 1, settings: { ...def.settings, ...found.settings } };
          }
          return def;
        });
        setCustomServicesState(merged);
      } else {
        setCustomServicesState(DEFAULT_GATEWAY_SERVICES);
      }
    } catch (err) {
      console.error('Failed to load custom services', err);
      setCustomServicesState(DEFAULT_GATEWAY_SERVICES);
    }
  };

  const handleSaveCustomServices = async () => {
    if (!selectedTokenForCustomServices) return;
    setIsSavingCustomServices(true);
    try {
      const res = await fetchWithRetry(`/api/v1/compliance/tokens/${selectedTokenForCustomServices.id}/custom-services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_services: customServicesState })
      });
      if (res.ok) {
        showNotification('success', 'Nocode Gateway custom services saved successfully!');
        // Refresh local token list in case last activity or metadata updated
        fetchTokens();
      } else {
        const data = await res.json();
        showNotification('error', data.error || 'Failed to save gateway configuration');
      }
    } catch (err: any) {
      showNotification('error', `Save error: ${err.message || err}`);
    } finally {
      setIsSavingCustomServices(false);
    }
  };

  const handleRunPlaygroundRequest = async () => {
    if (!selectedTokenForCustomServices) return;
    setIsPlaygroundLoading(true);
    setPlaygroundResult(null);
    try {
      const res = await fetchWithRetry('/api/v1/compliance/tokens/custom-gateway', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${selectedTokenForCustomServices.token}`
        },
        body: JSON.stringify({
          ...playgroundPayload
        })
      });
      const data = await res.json();
      setPlaygroundResult(data);
    } catch (err: any) {
      setPlaygroundResult({ error: err.message || 'Failed to execute custom gateway request' });
    } finally {
      setIsPlaygroundLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-indigo-600" />
            Developer API Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Build Compliance-as-a-Service directly into your software with our dual API + SaaS engine.
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'keys' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            API Keys
          </button>
          <button 
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'docs' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Documentation
          </button>
          <button 
            onClick={() => setActiveTab('sdks')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'sdks' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            SDKs & Tools
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm transition-all animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-sm font-medium">{notification.text}</div>
        </div>
      )}

      {activeTab === 'keys' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 rounded-2xl p-5 sm:p-6 lg:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Enterprise Security Grade</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">API Key Management</h2>
                <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                  Provision, monitor, and rotate cryptographically secure access tokens for your cross-region ERP and CRM compliance integrations. All keys are encrypted at rest using AES-256-GCM.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 min-w-[200px]">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Usage Quota</span>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-500 text-white rounded">FREE TIER</span>
                  </div>
                  <div className="text-3xl font-black tabular-nums">142 <span className="text-sm text-slate-500 font-medium">/ 500</span></div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '28.4%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-8 pt-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Regions</div>
                <div className="text-sm font-bold flex items-center gap-1.5 text-slate-200">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  EU, US, APAC
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rotation Policy</div>
                <div className="text-sm font-bold text-slate-200">90 Days (Recommended)</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Auth Method</div>
                <div className="text-sm font-bold text-slate-200">Bearer Token (Header)</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Success Rate</div>
                <div className="text-sm font-bold text-emerald-400">99.98%</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
            {/* Create New Key Section */}
            <div className="xl:col-span-4 space-y-4 sm:space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 sticky top-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    Generate Access Key
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Deploy a new secure entry point for a specific system or region.
                  </p>
                </div>

                <form onSubmit={handleCreateToken} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Label Designation</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g., SAP_Integration_Frankfurt"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 outline-none transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">System Ecosystem</label>
                    <select
                      value={formSystem}
                      onChange={(e) => setFormSystem(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 outline-none transition-all font-medium appearance-none"
                    >
                      <option value="Salesforce">Salesforce CRM</option>
                      <option value="SAP S/4HANA">SAP S/4HANA ERP</option>
                      <option value="HubSpot">HubSpot CRM</option>
                      <option value="Oracle NetSuite">Oracle NetSuite ERP</option>
                      <option value="Custom CRM/ERP">Custom CRM/ERP</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Permissions Scope</label>
                    <select
                      value={formScope}
                      onChange={(e) => setFormScope(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 outline-none transition-all font-medium appearance-none"
                    >
                      <option value="Full Compliance">Full Root Compliance</option>
                      <option value="ERP Scope">ERP Compliance (Audit Only)</option>
                      <option value="CRM Scope">CRM Privacy (GDPR Only)</option>
                      <option value="Read-Only scans">Restricted Read-Only</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isCreating}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2 group active:scale-95"
                  >
                    {isCreating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Finalizing Key...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 transition-transform group-hover:rotate-12" /> Generate Production Key
                      </>
                    )}
                  </button>
                </form>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Info className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Security Notice</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Keys follow the <code className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">cls_...</code> format and include embedded metadata for high-speed cache lookups. Never share these keys in plaintext logs.
                  </p>
                </div>
              </div>
            </div>

            {/* List and Management Section */}
            <div className="xl:col-span-8 space-y-4 sm:space-y-6">
              {/* Traffic Chart (Mini version or full) */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800">Connection Telemetry</h3>
                    <p className="text-xs text-slate-500">Real-time API ingress via active tokens</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Success</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Violations</span>
                    </div>
                  </div>
                </div>
                
                {isTrafficLoading ? (
                  <div className="h-[200px] flex flex-col items-center justify-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                    <span className="text-xs font-medium">Loading traffic data...</span>
                  </div>
                ) : (
                  <ApiTrafficChart 
                    traffic={traffic}
                    tokens={trafficTokens}
                    endpoints={trafficEndpoints}
                    mini
                  />
                )}
              </div>

              {/* Active Keys List */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                       <Key className="w-4 h-4 text-indigo-600" />
                     </div>
                     <div>
                       <h3 className="font-bold text-slate-800 text-sm">Active Connection Keys</h3>
                       <p className="text-[10px] text-slate-500">Authorized endpoints currently syncable</p>
                     </div>
                   </div>
                   <div className="px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-bold text-slate-600 tabular-nums">
                     {tokens.length} Active
                   </div>
                </div>

                {isLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                    <span className="text-sm font-bold">Synchronizing keys...</span>
                  </div>
                ) : tokens.length === 0 ? (
                  <div className="p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <LockIcon className="w-8 h-8 text-slate-200" />
                    </div>
                    <h4 className="font-bold text-slate-700">No Access Keys Generated</h4>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      Your organization does not have any active API integrations. Generate a key to begin.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {tokens.map(key => {
                      const isRevealed = revealedTokens[key.id] || false;
                      const maskedToken = `cls_${key.token.slice(4, 12)}••••••••••••••••••••••••••••`;
                      
                      return (
                        <div key={key.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
                            <div className="space-y-4 flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-black text-slate-900">{key.name}</h4>
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase rounded border border-indigo-100">
                                    {key.client_system}
                                  </span>
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase rounded">
                                    {key.scope}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="relative group max-w-2xl">
                                <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-inner group-hover:border-indigo-500/30 transition-all">
                                  <div className="flex-1 overflow-hidden">
                                    <code className="text-xs font-mono text-indigo-400 block truncate select-all">
                                      {isRevealed ? key.token : maskedToken}
                                    </code>
                                  </div>
                                  <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                                    <button 
                                      onClick={() => toggleReveal(key.id)}
                                      className="p-1.5 text-slate-500 hover:text-white transition-colors"
                                      title={isRevealed ? "Hide Secret Key" : "Reveal Secret Key"}
                                    >
                                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button 
                                      onClick={() => handleCopy(key.token)}
                                      className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors"
                                      title="Copy to Clipboard"
                                    >
                                      {copied === key.token ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 sm:gap-6">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Status</span>
                                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                    Operational
                                  </div>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Last Active</span>
                                  <div className="text-[11px] font-bold text-slate-600">
                                    {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'No Activity'}
                                  </div>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Created</span>
                                  <div className="text-[11px] font-bold text-slate-600">
                                    {new Date(key.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex lg:flex-col items-center lg:items-end gap-2 shrink-0 w-full lg:w-auto">
                              <button
                                onClick={() => handleOpenCustomServices(key)}
                                className="flex-1 lg:flex-none w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                Customize Gateway
                              </button>
                              <button
                                onClick={() => handleRotateToken(key.id, key.name)}
                                disabled={isRotatingId === key.id}
                                className="flex-1 lg:flex-none w-full px-4 py-2 bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-slate-700 hover:text-indigo-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${isRotatingId === key.id ? 'animate-spin' : ''}`} />
                                Rotate Key
                              </button>
                              <button
                                onClick={() => handleRevokeToken(key.id, key.name)}
                                disabled={isRevokingId === key.id}
                                className="flex-1 lg:flex-none w-full px-4 py-2 bg-white border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 text-slate-700 hover:text-rose-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Revoke
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Enterprise Policy: All keys are rotated automatically after 365 days of inactivity.</span>
                  <button className="text-[10px] font-bold text-indigo-600 hover:underline">Download Security Audit Log (.csv)</button>
                </div>
              </div>
            </div>
          </div>

          {/* Sovereign Service Directory & SDK Consult Console */}
          <div className="mt-12 border-t border-slate-200 pt-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5.5 h-5.5 text-indigo-600" />
                  Sovereign Service Directory & SDK Consult Console
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Consult active compliance microservices and generate single-API, multi-service developer payloads instantly.
                </p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs shrink-0 border border-slate-200/50">
                {['node', 'python', 'go', 'curl'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedSdkTab(tab as any)}
                    className={`px-3 py-1.5 font-bold rounded-lg transition-all capitalize ${
                      selectedSdkTab === tab 
                        ? 'bg-indigo-600 text-white shadow-sm font-black' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'curl' ? 'cURL' : tab === 'node' ? 'Node.js' : tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
              {/* Left Column: Live Compliance Microservice Directory */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Compliance Microservices Directory</h4>
                  <span className="text-[10px] bg-slate-100 px-2.5 py-0.5 rounded-full font-bold text-slate-500">
                    {Object.values(SERVICE_SUBSCRIPTION_MAP).filter(s => activeSubscriptions.includes(s.addonId)).length} of 6 Subscribed
                  </span>
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {DEFAULT_GATEWAY_SERVICES.map((service) => {
                    const reqSub = SERVICE_SUBSCRIPTION_MAP[service.id];
                    const isSubscribed = reqSub && activeSubscriptions.includes(reqSub.addonId);
                    const isSubscribingThis = reqSub && isSubscribingId === reqSub.addonId;

                    return (
                      <div 
                        key={service.id} 
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          isSubscribed 
                            ? 'bg-emerald-50/20 border-emerald-100' 
                            : 'bg-slate-50/50 border-slate-200/60 opacity-90'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-slate-800 truncate">{service.name}</span>
                            {isSubscribed ? (
                              <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Active
                              </span>
                            ) : (
                              <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase">
                                <LockIcon className="w-2.5 h-2.5" />
                                Sub Required
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {service.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {reqSub?.policies.map((p, i) => (
                              <span key={i} className="text-[9px] bg-white border border-slate-200/60 rounded px-1.5 py-0.2 text-slate-400 font-semibold uppercase font-mono">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Subscriber / Non-engineer Subscribe Control */}
                        {!isSubscribed && reqSub && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{reqSub.addonName}</span>
                            <button
                              type="button"
                              onClick={() => handleQuickSubscribe(reqSub.addonId)}
                              disabled={isSubscribingId !== null}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                            >
                              {isSubscribingThis ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Plus className="w-3 h-3" />
                              )}
                              Subscribe {reqSub.price}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: SDK Code Consult Blocks */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col gap-4 justify-between font-sans">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Low-Code / SDK payload consultation</h4>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Token:</span>
                      <select
                        value={selectedConsultKeyId}
                        onChange={(e) => setSelectedConsultKeyId(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-mono font-bold focus:outline-none"
                      >
                        {tokens.map((t) => (
                          <option key={t.id} value={t.token}>{t.name} ({t.token.slice(0, 10)}...)</option>
                        ))}
                        {tokens.length === 0 && <option value="">No production tokens</option>}
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sovereign non-engineers or developers can query all subscribed and applied microservices with a single integrated API client. Below is your live generated connection payload:
                  </p>

                  <div className="relative group">
                    <button
                      onClick={() => handleCopy(
                        selectedSdkTab === 'node' ? `import { N9XenReguletteeClient } from '@9xen-regulettee/caas-sdk';

const shield = new N9XenReguletteeClient({
  apiKey: '${selectedConsultKeyId || 'cls_your_authorized_token_here'}',
  gatewayUrl: 'https://gateway.regulettee.eu/api/v1/compliance/custom-gateway'
});

// Synchronously execute your E-Commerce, ESG, and AI compliance filters in one single roundtrip!
const audit = await shield.evaluate({
  content: "Customer plain-text data payload...",
  options: {
    enforce_gdpr: true,
    require_dora_failover: true
  }
});

console.log('Compliance status:', audit.status);` :
                        selectedSdkTab === 'python' ? `from 9xen-regulettee import N9XenReguletteeClient

shield = N9XenReguletteeClient(
    api_key="${selectedConsultKeyId || 'cls_your_authorized_token_here'}",
    gateway_url="https://gateway.regulettee.eu/api/v1/compliance/custom-gateway"
)

# Synchronously audit PII leakage and AI ethics bounds in a single API roundtrip
audit = shield.evaluate(
    content="Customer plain-text data payload...",
    options={
        "enforce_gdpr": True,
        "require_dora_failover": True
    }
)

print(f"Compliance validation: {audit.status}")` :
                        selectedSdkTab === 'go' ? `package main

import (
\t"context"
\t"fmt"
\t"github.com/9xen-regulettee/caas-sdk-go"
)

func main() {
\tclient := caas.NewClient("${selectedConsultKeyId || 'cls_your_authorized_token_here'}")
\t
\t// Single API call queries multiple compliance engines simultaneously
\tresult, _ := client.Evaluate(context.Background(), caas.EvaluationRequest{
\t\tContent: "Customer plain-text data payload...",
\t\tOptions: map[string]interface{}{
\t\t\t"enforce_gdpr": true,
\t\t\t"require_dora_failover": true,
\t\t},
\t})
\t
\tfmt.Printf("Status: %s\\n", result.Status)
}` :
                        `curl -X POST https://gateway.regulettee.eu/api/v1/compliance/custom-gateway \\
  -H "Authorization: Bearer ${selectedConsultKeyId || 'cls_your_authorized_token_here'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Customer plain-text data payload...",
    "options": {
      "enforce_gdpr": true,
      "require_dora_failover": true
    }
  }'`
                      )}
                      className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 z-10"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {selectedSdkTab === 'node' && (
                      <pre className="bg-slate-950 p-5 rounded-2xl font-mono text-[11px] text-indigo-200 overflow-x-auto shadow-inner relative leading-relaxed max-h-[300px]">
                        <code>
                          <span className="text-amber-400">import</span> {'{ N9XenReguletteeClient }'} <span className="text-amber-400">from</span> <span className="text-emerald-400">'@9xen-regulettee/caas-sdk'</span>;<br /><br />
                          <span className="text-amber-400">const</span> shield = <span className="text-amber-400">new</span> <span className="text-indigo-400">N9XenReguletteeClient</span>({'{'}<br />
                          &nbsp;&nbsp;apiKey: <span className="text-emerald-400">'{selectedConsultKeyId || 'cls_your_authorized_token_here'}'</span>,<br />
                          &nbsp;&nbsp;gatewayUrl: <span className="text-emerald-400">'https://gateway.regulettee.eu/api/v1/compliance/custom-gateway'</span><br />
                          {'}'});<br /><br />
                          <span className="text-slate-500">// Synchronously execute E-Commerce, ESG, and AI filters in one roundtrip!</span><br />
                          <span className="text-amber-400">const</span> audit = <span className="text-amber-400">await</span> shield.<span className="text-indigo-400">evaluate</span>({'{'}<br />
                          &nbsp;&nbsp;content: <span className="text-emerald-400">"Customer plain-text data payload..."</span>,<br />
                          &nbsp;&nbsp;options: {'{'}<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;enforce_gdpr: <span className="text-rose-400">true</span>,<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;require_dora_failover: <span className="text-rose-400">true</span><br />
                          &nbsp;&nbsp;{'}'}<br />
                          {'}'});<br /><br />
                          console.<span className="text-indigo-400">log</span>(<span className="text-emerald-400">'Compliance status:'</span>, audit.status);
                        </code>
                      </pre>
                    )}

                    {selectedSdkTab === 'python' && (
                      <pre className="bg-slate-950 p-5 rounded-2xl font-mono text-[11px] text-indigo-200 overflow-x-auto shadow-inner relative leading-relaxed max-h-[300px]">
                        <code>
                          <span className="text-amber-400">from</span> 9xen-regulettee <span className="text-amber-400">import</span> N9XenReguletteeClient<br /><br />
                          shield = <span className="text-indigo-400">N9XenReguletteeClient</span>(<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;api_key=<span className="text-emerald-400">"{selectedConsultKeyId || 'cls_your_authorized_token_here'}"</span>,<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;gateway_url=<span className="text-emerald-400">"https://gateway.regulettee.eu/api/v1/compliance/custom-gateway"</span><br />
                          )<br /><br />
                          <span className="text-slate-500"># Synchronously audit PII leakage and AI ethics bounds</span><br />
                          audit = shield.<span className="text-indigo-400">evaluate</span>(<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;content=<span className="text-emerald-400">"Customer plain-text data payload..."</span>,<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;options={`{`}<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"enforce_gdpr"</span>: <span className="text-rose-400">True</span>,<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"require_dora_failover"</span>: <span className="text-rose-400">True</span><br />
                          &nbsp;&nbsp;&nbsp;&nbsp;{`}`}<br />
                          )<br /><br />
                          <span className="text-amber-400">print</span>(<span className="text-emerald-400">f"Compliance validation: {`{`}audit.status{`}`}"</span>)
                        </code>
                      </pre>
                    )}

                    {selectedSdkTab === 'go' && (
                      <pre className="bg-slate-950 p-5 rounded-2xl font-mono text-[11px] text-indigo-200 overflow-x-auto shadow-inner relative leading-relaxed max-h-[300px]">
                        <code>
                          <span className="text-amber-400">package</span> main<br /><br />
                          <span className="text-amber-400">import</span> (<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"context"</span><br />
                          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"fmt"</span><br />
                          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"github.com/9xen-regulettee/caas-sdk-go"</span><br />
                          )<br /><br />
                          <span className="text-amber-400">func</span> <span className="text-indigo-400">main</span>() &#123;<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;client := caas.<span className="text-indigo-400">NewClient</span>(<span className="text-emerald-400">"{selectedConsultKeyId || 'cls_your_authorized_token_here'}"</span>)<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// Single API call queries multiple compliance engines simultaneously</span><br />
                          &nbsp;&nbsp;&nbsp;&nbsp;result, _ := client.<span className="text-indigo-400">Evaluate</span>(context.<span className="text-indigo-400">Background</span>(), caas.EvaluationRequest&#123;<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Content: <span className="text-emerald-400">"Customer plain-text data payload..."</span>,<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Options: <span className="text-amber-400">map</span>[<span className="text-amber-400">string</span>]<span className="text-amber-400">interface</span>&#123;&#125;&#123;<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"enforce_gdpr"</span>:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">true</span>,<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"require_dora_failover"</span>: <span className="text-rose-400">true</span>,<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;,<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&#125;)<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;fmt.<span className="text-indigo-400">Printf</span>(<span className="text-emerald-400">"Status: %s\\n"</span>, result.Status)<br />
                          &#125;
                        </code>
                      </pre>
                    )}

                    {selectedSdkTab === 'curl' && (
                      <pre className="bg-slate-950 p-5 rounded-2xl font-mono text-[11px] text-indigo-200 overflow-x-auto shadow-inner relative leading-relaxed max-h-[300px]">
                        <code>
                          curl -X POST https://gateway.regulettee.eu/api/v1/compliance/custom-gateway \<br />
                          &nbsp;&nbsp;-H <span className="text-emerald-400">"Authorization: Bearer {selectedConsultKeyId || 'cls_your_authorized_token_here'}"</span> \<br />
                          &nbsp;&nbsp;-H <span className="text-emerald-400">"Content-Type: application/json"</span> \<br />
                          &nbsp;&nbsp;-d <span className="text-emerald-400">'&#123;<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;"content": "Customer plain-text data payload...",<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;"options": &#123;<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"enforce_gdpr": true,<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"require_dora_failover": true<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                          &nbsp;&nbsp;&#125;'</span>
                        </code>
                      </pre>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-start mt-4">
                  <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-indigo-600">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nocode Compliance Delivery</span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Non-engineers can apply and configure these filters in the gateway. The SDKs synchronously route and process incoming payloads against whichever rules are subscribed and activated — no core codebase changes required!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'docs' && (() => {
        const docs = {
          scan: {
            method: 'POST',
            path: '/v1/scan',
            description: 'Initiates an automated compliance and security scan on the provided payload or infrastructure URL. The engine will evaluate the target against your active subscription policies (e.g., GDPR, DORA).',
            requestBody: {
              target: "https://api.yourcompany.com",
              scope: ["network", "pii_data", "auth"],
              auto_fix: true,
              sector: "fintech"
            },
            response: {
              scan_id: "scn_998273",
              status: "completed",
              compliance_score: 98,
              violations_found: 2,
              autofixes_applied: 2,
              report_url: "https://api.compliance.eu/v1/reports/scn_998273.pdf"
            }
          },
          policies: {
            method: 'GET',
            path: '/v1/policies',
            description: 'Retrieves a list of all active and available compliance policies associated with your organization. This includes standard regulatory frameworks and custom corporate mandates.',
            requestBody: null,
            response: {
              policies: [
                { id: "pol_gdpr", name: "GDPR Article 32", status: "active", version: "2.4.1" },
                { id: "pol_dora", name: "DORA Resiliency Act", status: "active", version: "1.0.0" }
              ],
              total_active: 2
            }
          },
          enforce: {
            method: 'POST',
            path: '/v1/enforce',
            description: 'Synchronously applies a remediation patch or enforcement rule to a target dataset or configuration. Useful for real-time blocking of non-compliant traffic.',
            requestBody: {
              rule_id: "pol_gdpr_pii_masking",
              target_data: "user_email: dev@test.com",
              enforcement_level: "strict"
            },
            response: {
              enforcement_status: "applied",
              original_hash: "8823af...",
              remediated_hash: "9912bc...",
              action_taken: "regex_pii_masking"
            }
          },
          reports: {
            method: 'GET',
            path: '/v1/reports',
            description: 'Returns a paginated list of historical compliance audit reports and scan results generated by the engine.',
            requestBody: null,
            response: {
              reports: [
                { id: "rep_102", scan_id: "scn_998273", date: "2026-07-01", score: 98, download_url: "..." }
              ],
              total_count: 42
            }
          }
        };

        const currentDoc = docs[selectedEndpoint as keyof typeof docs];

        return (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col md:flex-row overflow-hidden min-h-[600px]">
            {/* Docs Sidebar */}
            <div className="w-full md:w-64 border-r border-slate-100 bg-slate-50 p-4">
              <div className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Endpoints</div>
              <ul className="space-y-2">
                {Object.keys(docs).map((key) => (
                  <li key={key}>
                    <button 
                      onClick={() => setSelectedEndpoint(key)}
                      className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-all ${
                        selectedEndpoint === key 
                          ? "text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 shadow-sm" 
                          : "text-slate-600 hover:text-slate-900 font-medium hover:bg-white"
                      }`}
                    >
                      <span className={`text-[9px] font-black mr-2 px-1.5 py-0.5 rounded ${
                        docs[key as keyof typeof docs].method === 'POST' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {docs[key as keyof typeof docs].method}
                      </span>
                      {docs[key as keyof typeof docs].path}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Docs Content */}
            <div className="flex-1 p-4 sm:p-5 lg:p-6 lg:p-10 bg-white">
               <div className="flex items-center gap-3 mb-6">
                 <span className={`px-2 py-1 font-bold text-xs rounded uppercase tracking-wider ${
                   currentDoc.method === 'POST' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                 }`}>
                   {currentDoc.method}
                 </span>
                 <h2 className="text-2xl font-bold text-slate-900 font-mono">{currentDoc.path}</h2>
               </div>
               <p className="text-slate-600 mb-6 leading-relaxed">
                 {currentDoc.description}
               </p>
               
               {currentDoc.requestBody && (
                 <>
                   <h3 className="font-bold text-slate-800 mt-8 mb-4 border-b pb-2 flex items-center gap-2">
                     <Database className="w-4 h-4 text-slate-400" /> Request Body (JSON)
                   </h3>
                   <div className="bg-slate-900 rounded-lg p-4 text-slate-300 font-mono text-sm shadow-inner overflow-x-auto">
                     <pre>{JSON.stringify(currentDoc.requestBody, null, 2)}</pre>
                   </div>
                 </>
               )}

               <h3 className="font-bold text-slate-800 mt-8 mb-4 border-b pb-2 flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Response (200 OK)
               </h3>
               <div className="bg-slate-900 rounded-lg p-4 text-emerald-400 font-mono text-sm shadow-inner overflow-x-auto">
                 <pre>{JSON.stringify(currentDoc.response, null, 2)}</pre>
               </div>

               <div className="mt-12 p-4 sm:p-5 lg:p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                 <h4 className="text-sm font-bold text-slate-800 mb-2">Need help integrating?</h4>
                 <p className="text-xs text-slate-500 mb-4">Our engineering support team is available 24/7 for Enterprise partners to assist with custom ERP middleware mapping.</p>
                 <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                   Open Integration Support Ticket <ArrowRight className="w-3 h-3" />
                 </button>
               </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'sdks' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-5 lg:p-6 border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-[#3178C6]/10 rounded-lg">
                     <FileCode2 className="w-6 h-6 text-[#3178C6]" />
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-900">Node.js / TypeScript SDK</h3>
                     <p className="text-xs text-slate-500">Official SDK for backend Node services.</p>
                   </div>
                 </div>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 text-slate-300 font-mono text-xs flex items-center justify-between">
                <code>npm install @compliance-engine/node</code>
                <Copy className="w-4 h-4 text-slate-500 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 lg:p-6 border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-[#3776AB]/10 rounded-lg">
                     <Terminal className="w-6 h-6 text-[#3776AB]" />
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-900">Python SDK</h3>
                     <p className="text-xs text-slate-500">Perfect for Data Science and ML pipelines.</p>
                   </div>
                 </div>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 text-slate-300 font-mono text-xs flex items-center justify-between">
                <code>pip install compliance-engine</code>
                <Copy className="w-4 h-4 text-slate-500 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 sm:p-5 lg:p-6">
             <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
               <Zap className="w-5 h-5" /> 5-Minute "Compliance Confidence" Quickstart
             </h3>
             <p className="text-indigo-800 text-sm mb-4 max-w-3xl">
               Add our middleware to your Express.js or FastAPI application, and instantly achieve baseline DORA and GDPR compliance for all incoming API traffic.
             </p>
             <div className="bg-slate-900 rounded-lg p-4 text-slate-300 font-mono text-sm overflow-x-auto shadow-inner">
<pre>{`import express from 'express';
import { ComplianceEngine } from '@compliance-engine/node';

const app = express();
const engine = new ComplianceEngine(process.env.COMPLIANCE_API_KEY);

// Automatically scans request payloads for PII, applies rate limits, 
// and enforces region-specific rules (GDPR, DORA)
app.use(engine.expressMiddleware({ sector: 'fintech' }));

app.post('/api/transactions', (req, res) => {
  res.send('Secure and Compliant!');
});`}</pre>
             </div>
          </div>
        </div>
      )}

      {/* Nocode Gateway Customizer Panel */}
      {selectedTokenForCustomServices && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300">
          <div className="bg-slate-900 w-full max-w-5xl h-full shadow-2xl flex flex-col text-white overflow-hidden border-l border-slate-800 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 lg:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-xl font-bold tracking-tight">Nocode API Gateway Customizer</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Configure subscriber-level compliance microservices on key: <code className="text-indigo-400 font-mono">{selectedTokenForCustomServices.name}</code> ({selectedTokenForCustomServices.client_system})
                </p>
              </div>
              <button 
                onClick={() => setSelectedTokenForCustomServices(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all"
              >
                Close Customizer
              </button>
            </div>

            {/* Content Split */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Left Column: List of Services */}
              <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-950/40 overflow-y-auto">
                <div className="p-4 border-b border-slate-800/60 bg-slate-900/30">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Subscribed Compliance Modules</span>
                  <p className="text-[11px] text-slate-500 mt-1">Toggle the active microservices you want this API key to execute synchronously.</p>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {customServicesState.map((service, idx) => {
                    // Match icons
                    let IconComponent = Shield;
                    if (service.id === 'gdpr_pii') IconComponent = Activity;
                    if (service.id === 'dora_resiliency') IconComponent = Database;
                    if (service.id === 'sovereign_residency') IconComponent = Globe;
                    if (service.id === 'ai_ethics') IconComponent = Cpu;
                    if (service.id === 'esg_carbon') IconComponent = Leaf;
                    if (service.id === 'biometric_vault') IconComponent = Fingerprint;

                    const reqSub = SERVICE_SUBSCRIPTION_MAP[service.id];
                    const isLocked = reqSub && !activeSubscriptions.includes(reqSub.addonId);
                    const isSubscribingThis = reqSub && isSubscribingId === reqSub.addonId;

                    return (
                      <div 
                        key={service.id} 
                        className={`p-4 transition-all relative border-l-2 ${
                          isLocked 
                            ? 'border-amber-500/20 bg-slate-900/40 opacity-75' 
                            : service.enabled 
                              ? 'border-indigo-500 bg-indigo-500/[0.04]' 
                              : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className={`p-2 rounded-lg shrink-0 ${
                              isLocked
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : service.enabled 
                                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-bold text-slate-200">{service.name}</h4>
                                {isLocked && (
                                  <span className="text-[8px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded font-black uppercase tracking-widest">
                                    LOCKED
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{service.description}</p>
                              
                              {/* Quick Subscribe Button if Locked */}
                              {isLocked && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickSubscribe(reqSub.addonId);
                                  }}
                                  disabled={isSubscribingId !== null}
                                  className="mt-2.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-md text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all"
                                >
                                  {isSubscribingThis ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Zap className="w-3 h-3" />
                                  )}
                                  Activate for {reqSub.price}
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {!isLocked && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const copy = [...customServicesState];
                                copy[idx].enabled = !copy[idx].enabled;
                                setCustomServicesState(copy);
                              }}
                              className="focus:outline-none shrink-0"
                            >
                              {service.enabled ? (
                                <ToggleRight className="w-8 h-8 text-indigo-400" />
                              ) : (
                                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Settings, SDK Code, and Sandbox Playground */}
              <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900 p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                
                {/* Save Banner */}
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/15 rounded-lg border border-emerald-500/20 text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-100">Gateway Active Status</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {customServicesState.filter(s => s.enabled).length} of {customServicesState.length} microservices enabled on this key.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveCustomServices}
                    disabled={isSavingCustomServices}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSavingCustomServices ? 'animate-spin' : ''}`} />
                    Save Configuration
                  </button>
                </div>

                {/* Microservice Parameter Customization Panel */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Settings2 className="w-4 h-4 text-slate-400" />
                    Parameter-less Nocode Parameter Customizers
                  </h3>
                  
                  {customServicesState.filter(s => s.enabled).length === 0 ? (
                    <div className="p-5 sm:p-6 lg:p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
                      <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                      <p className="text-xs font-bold">No microservices enabled.</p>
                      <p className="text-[10px] text-slate-600 mt-1">Enable a microservice in the left panel to configure its active filters.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customServicesState.map((service, idx) => {
                        if (!service.enabled) return null;
                        return (
                          <div key={service.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                              <span className="text-xs font-bold text-indigo-400">{service.name}</span>
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 font-bold uppercase rounded">Active</span>
                            </div>

                            {/* Service Specific Parameters */}
                            {service.id === 'gdpr_pii' && (
                              <div className="space-y-2.5">
                                <label className="flex items-center justify-between text-[11px] text-slate-300 animate-none">
                                  <span>Automate Mask PII (Redact plain text)</span>
                                  <input 
                                    type="checkbox"
                                    checked={service.settings?.mask_pii}
                                    onChange={(e) => {
                                      const copy = [...customServicesState];
                                      copy[idx].settings.mask_pii = e.target.checked;
                                      setCustomServicesState(copy);
                                    }}
                                    className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                  />
                                </label>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>Target Compliance Threshold Score</span>
                                    <span className="font-mono text-indigo-400">{service.settings?.target_score || 80}%</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="50" 
                                    max="100"
                                    value={service.settings?.target_score || 80}
                                    onChange={(e) => {
                                      const copy = [...customServicesState];
                                      copy[idx].settings.target_score = parseInt(e.target.value);
                                      setCustomServicesState(copy);
                                    }}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                  />
                                </div>
                              </div>
                            )}

                            {service.id === 'dora_resiliency' && (
                              <div className="space-y-2.5">
                                <label className="flex items-center justify-between text-[11px] text-slate-300">
                                  <span>Enforce Geo-Redundancy check</span>
                                  <input 
                                    type="checkbox"
                                    checked={service.settings?.require_geo_redundant}
                                    onChange={(e) => {
                                      const copy = [...customServicesState];
                                      copy[idx].settings.require_geo_redundant = e.target.checked;
                                      setCustomServicesState(copy);
                                    }}
                                    className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                  />
                                </label>
                              </div>
                            )}

                            {service.id === 'sovereign_residency' && (
                              <div className="space-y-2">
                                <label className="block text-[11px] text-slate-300">Mandated Sovereign Region Bounds</label>
                                <select
                                  value={service.settings?.bound_region || 'EU'}
                                  onChange={(e) => {
                                    const copy = [...customServicesState];
                                    copy[idx].settings.bound_region = e.target.value;
                                    setCustomServicesState(copy);
                                  }}
                                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:border-indigo-500"
                                >
                                  <option value="EU">European Union (eIDAS / EU sovereign)</option>
                                  <option value="USA">United States FedRAMP high bound</option>
                                  <option value="APAC">APAC Singapore regional bound</option>
                                </select>
                              </div>
                            )}

                            {service.id === 'ai_ethics' && (
                              <div className="space-y-2.5">
                                <label className="flex items-center justify-between text-[11px] text-slate-300">
                                  <span>Flag prohibited AI practices strictly</span>
                                  <input 
                                    type="checkbox"
                                    checked={service.settings?.flag_prohibited_only}
                                    onChange={(e) => {
                                      const copy = [...customServicesState];
                                      copy[idx].settings.flag_prohibited_only = e.target.checked;
                                      setCustomServicesState(copy);
                                    }}
                                    className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                  />
                                </label>
                              </div>
                            )}

                            {service.id === 'esg_carbon' && (
                              <div className="space-y-2.5">
                                <label className="flex items-center justify-between text-[11px] text-slate-300">
                                  <span>Require Green energy offset credit</span>
                                  <input 
                                    type="checkbox"
                                    checked={service.settings?.require_green_offset}
                                    onChange={(e) => {
                                      const copy = [...customServicesState];
                                      copy[idx].settings.require_green_offset = e.target.checked;
                                      setCustomServicesState(copy);
                                    }}
                                    className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                  />
                                </label>
                              </div>
                            )}

                            {service.id === 'biometric_vault' && (
                              <div className="space-y-2.5">
                                <label className="flex items-center justify-between text-[11px] text-slate-300">
                                  <span>Enforce strict Secure TEE boundary</span>
                                  <input 
                                    type="checkbox"
                                    checked={service.settings?.enforce_tee}
                                    onChange={(e) => {
                                      const copy = [...customServicesState];
                                      copy[idx].settings.enforce_tee = e.target.checked;
                                      setCustomServicesState(copy);
                                    }}
                                    className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                  />
                                </label>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Gateway Test Sandbox Playground */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    Interactive Nocode API Playground & Live Executions
                  </h3>

                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-300">Unified Gateway Sandbox Inputs</span>
                      <button
                        onClick={handleRunPlaygroundRequest}
                        disabled={isPlayinggroundLoading}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isPlayinggroundLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        Send Live Gateway Request
                      </button>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Form Fields */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Payload Content (GDPR & AI scan)</label>
                          <textarea 
                            value={playgroundPayload.content}
                            onChange={(e) => setPlaygroundPayload({ ...playgroundPayload, content: e.target.value })}
                            rows={3}
                            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:border-indigo-500"
                            placeholder="Text payload with potential emails, phone, credit cards..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Target Host (DORA)</label>
                            <input 
                              type="text"
                              value={playgroundPayload.target_host}
                              onChange={(e) => setPlaygroundPayload({ ...playgroundPayload, target_host: e.target.value })}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Data Location</label>
                            <select
                              value={playgroundPayload.location}
                              onChange={(e) => setPlaygroundPayload({ ...playgroundPayload, location: e.target.value })}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:border-indigo-500"
                            >
                              <option value="EU">European Union (Compliant)</option>
                              <option value="US">United States (High Risk)</option>
                              <option value="CN">China (High Risk)</option>
                              <option value="RU">Russia (High Risk)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Database Failover (DORA)</label>
                            <select
                              value={playgroundPayload.database_failover_seconds}
                              onChange={(e) => setPlaygroundPayload({ ...playgroundPayload, database_failover_seconds: parseInt(e.target.value) })}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:border-indigo-500"
                            >
                              <option value="5">5s Recovery Time (DORA compliant)</option>
                              <option value="15">15s Recovery Time (Non-compliant)</option>
                              <option value="45">45s Recovery Time (Non-compliant)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Biometric Type</label>
                            <select
                              value={playgroundPayload.biometric_type}
                              onChange={(e) => setPlaygroundPayload({ ...playgroundPayload, biometric_type: e.target.value })}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:border-indigo-500"
                            >
                              <option value="">None (Disable Biometric Scan)</option>
                              <option value="face">Facial Biometrics (GDPR Art 9)</option>
                              <option value="fingerprint">Fingerprint Scan (eIDAS)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <label className="flex items-center gap-2 text-[11px] text-slate-300">
                            <input 
                              type="checkbox"
                              checked={playgroundPayload.storage_enclave_only}
                              onChange={(e) => setPlaygroundPayload({ ...playgroundPayload, storage_enclave_only: e.target.checked })}
                              className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Hardware Enclave only</span>
                          </label>
                          <label className="flex items-center gap-2 text-[11px] text-slate-300">
                            <input 
                              type="checkbox"
                              checked={playgroundPayload.cloud_sync}
                              onChange={(e) => setPlaygroundPayload({ ...playgroundPayload, cloud_sync: e.target.checked })}
                              className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Allow Cloud Sync</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Output Screen */}
                    <div className="border-t border-slate-800/80 bg-slate-950 p-4 font-mono text-xs text-slate-300 max-h-80 overflow-y-auto">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Live Gateway Response (JSON)</span>
                      
                      {isPlayinggroundLoading && (
                        <div className="p-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                          <span>Executing live synchronous compliance checks across pipeline...</span>
                        </div>
                      )}

                      {!isPlayinggroundLoading && !playgroundResult && (
                        <div className="p-5 sm:p-6 lg:p-8 text-center text-slate-600 font-sans">
                          <span>Payload initialized. Click "Send Live Gateway Request" to see the combined telemetry reports.</span>
                        </div>
                      )}

                      {!isPlayinggroundLoading && playgroundResult && (
                        <div className="space-y-4">
                          {/* Score Pill */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${playgroundResult.is_compliant ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className="font-sans text-xs font-bold text-slate-200">
                                Overall Status: {playgroundResult.is_compliant ? 'PASSED (Compliant)' : 'FAILED (High Risk Violation)'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 font-sans">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Compliance Score:</span>
                              <span className={`text-sm font-black px-2.5 py-0.5 rounded ${playgroundResult.overall_compliance_score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {playgroundResult.overall_compliance_score}%
                              </span>
                            </div>
                          </div>

                          {/* Interactive JSON preview */}
                          <pre className="bg-slate-950 rounded p-3 text-[11px] text-indigo-300 overflow-x-auto border border-slate-900 shadow-inner max-h-48">
                            {JSON.stringify(playgroundResult, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Real-time Custom Code Snippet SDKs */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <FileCode2 className="w-4 h-4 text-indigo-400" />
                    Dynamic Customizable SDK Integration Code Snippets
                  </h3>
                  
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide block mb-2">Node.js (Fetch API Integration)</span>
                    <pre className="text-[11px] text-emerald-400 font-mono overflow-x-auto whitespace-pre p-3 bg-slate-900 rounded-lg border border-slate-800">
{`const payload = {
  content: "User message or policy document content...",
  target_host: "${playgroundPayload.target_host}",
  location: "${playgroundPayload.location}",
  database_failover_seconds: ${playgroundPayload.database_failover_seconds},
  biometric_type: "${playgroundPayload.biometric_type || 'none'}",
  storage_enclave_only: ${playgroundPayload.storage_enclave_only},
  cloud_sync: ${playgroundPayload.cloud_sync}
};

fetchWithRetry("https://api.regulettee.eu/api/v1/compliance/tokens/custom-gateway", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${selectedTokenForCustomServices.token}"
  },
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(report => {
  console.log("Compliance Score:", report.overall_compliance_score);
  console.log("Active Violations:", report.violations);
});`}
                    </pre>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
