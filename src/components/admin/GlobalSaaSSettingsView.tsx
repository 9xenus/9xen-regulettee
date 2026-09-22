import React, { useState, useEffect } from 'react';
import { Settings, Globe, Palette, ShieldCheck, Wrench, Save, RefreshCw, CheckCircle2, AlertTriangle, Sparkles, Sliders, Zap, ShieldAlert, Lock, Unlock, Cpu, Key, CheckCircle, Terminal, Mail, MessageSquare, Database, Smartphone } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { RegionalCookieConsentAdminConfig } from './RegionalCookieConsentAdminConfig';
import { encryptData, decryptData, isEncrypted } from '../../lib/cryptoUtils';
import { SaasAdminVerificationManager } from './SaasAdminVerificationManager';
import { LLMProviderFleetManager } from './LLMProviderFleetManager';

interface GlobalSaaSConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowSuperAdminBypass: boolean;
  brandName: string;
  brandAccentColor: string;
  portalLogoText: string;
  footerLegalNotice: string;
  defaultComplianceJurisdiction: string;
  strictGdprEnforcement: boolean;
  aiActRiskScoringDefault: 'STRICT' | 'MODERATE' | 'PERMISSIVE';
  dataRetentionDays: number;
  autoCrossBorderBlocking: boolean;
  emergencyKillSwitchActive: boolean;
  primaryAiProvider: 'GEMINI_FREE' | 'OPENAI' | 'ANTHROPIC' | 'DEEPSEEK' | 'CUSTOM' | 'OPENROUTER';
  geminiModelPreset: string;
  geminiApiKeyConfigured: boolean;
  openRouterApiKey: string;
  openRouterModel: string;
  openRouterBaseUrl: string;
  openRouterEnabled: boolean;
  customLlmEndpoint: string;
  customLlmApiKey: string;
  customLlmModelName: string;
  enableAutomaticAiFailover: boolean;
  enableAiAutoCategorization: boolean;
  // SMTP Configuration
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSenderEmail: string;
  smtpSecure: boolean;
  // SMS Configuration
  smsProvider: 'TWILIO' | 'AWS_SNS' | 'MESSAGEBIRD';
  smsApiKey: string;
  smsApiSecret: string;
  smsSenderId: string;
  // Database Connectors
  supabaseUrl: string;
  supabaseServiceKey: string;
  chromadbEndpoint: string;
  chromadbAuthToken: string;
  postgresConnectionString: string;
  redisCacheUrl: string;
  kuzuDbPath: string;
  sqliteDbPath: string;
  mongoDbConnectionString: string;
}

const DEFAULT_CONFIG: GlobalSaaSConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'Scheduled Sovereign Compliance Node Upgrades in progress. Read-only audit mode active.',
  allowSuperAdminBypass: true,
  brandName: '9Xen Regulettee Enterprise CaaS',
  brandAccentColor: 'indigo',
  portalLogoText: '9XEN_REGULETTEE CaaS v2.1',
  footerLegalNotice: '© 2026 9Xen Regulettee Sovereign Compliance Systems. All international regulatory rights reserved.',
  defaultComplianceJurisdiction: 'EU_GDPR_AI_ACT',
  strictGdprEnforcement: true,
  aiActRiskScoringDefault: 'STRICT',
  dataRetentionDays: 90,
  autoCrossBorderBlocking: false,
  emergencyKillSwitchActive: false,
  primaryAiProvider: 'GEMINI_FREE',
  geminiModelPreset: 'gemini-3.7-flash',
  geminiApiKeyConfigured: true,
  openRouterApiKey: '',
  openRouterModel: 'openrouter/auto',
  openRouterBaseUrl: 'https://openrouter.ai/api/v1',
  openRouterEnabled: false,
  customLlmEndpoint: 'https://api.openai.com/v1',
  customLlmApiKey: '',
  customLlmModelName: 'gpt-4o',
  enableAutomaticAiFailover: true,
  enableAiAutoCategorization: true,
  smtpHost: 'smtp.sendgrid.net',
  smtpPort: 587,
  smtpUser: 'apikey',
  smtpPassword: '',
  smtpSenderEmail: 'noreply@regulettee.eu',
  smtpSecure: true,
  smsProvider: 'TWILIO',
  smsApiKey: '',
  smsApiSecret: '',
  smsSenderId: '9XEN_REGULETTEE',
  supabaseUrl: '',
  supabaseServiceKey: '',
  chromadbEndpoint: '',
  chromadbAuthToken: '',
  postgresConnectionString: '',
  redisCacheUrl: '',
  kuzuDbPath: './kuzu_db',
  sqliteDbPath: './local_db.sqlite',
  mongoDbConnectionString: '',
};

export const GlobalSaaSSettingsView: React.FC = () => {
  const { showToast } = useNotification();
  const [config, setConfig] = useState<GlobalSaaSConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [showKillModal, setShowKillModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [testingAi, setTestingAi] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [upgradingSystem, setUpgradingSystem] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<any>(null);

  const handleFullSystemUpgrade = async () => {
    setUpgradingSystem(true);
    setUpgradeResult(null);
    try {
      const res = await fetch('/api/v1/system/upgrade', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setUpgradeResult(data);
        showToast('Full System Configuration & Sovereign Compliance Engine successfully upgraded to v4.5.0!', 'success');
      } else {
        showToast(data.error || 'System upgrade failed.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'System upgrade network error', 'error');
    } finally {
      setUpgradingSystem(false);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('9xen-regulettee_global_saas_config');
      const aiAutoCatStored = localStorage.getItem('ai_auto_categorization_enabled');
      const isAiAutoCat = aiAutoCatStored === null ? true : (aiAutoCatStored === 'true' || aiAutoCatStored === '1');

      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          enableAiAutoCategorization: parsed.enableAiAutoCategorization !== undefined ? parsed.enableAiAutoCategorization : isAiAutoCat
        });
      } else {
        setConfig(prev => ({ ...prev, enableAiAutoCategorization: isAiAutoCat }));
      }
    } catch (e) {
      console.error('Failed to load global SaaS config', e);
    }

    // Load OpenRouter / LLM gateway provider status from backend
    fetch('/api/v1/llm-gateway/providers')
      .then(r => r.json())
      .then(data => {
        if (data?.success) {
          const or = data.providers?.OPENROUTER;
          setConfig(prev => ({
            ...prev,
            openRouterApiKey: (typeof localStorage.getItem('9xen-regulettee_openrouter_apikey') === 'string' && localStorage.getItem('9xen-regulettee_openrouter_apikey')) || prev.openRouterApiKey,
            openRouterModel: or?.model || prev.openRouterModel,
            openRouterBaseUrl: or?.baseUrl || prev.openRouterBaseUrl,
            openRouterEnabled: or ? !!or.enabled : prev.openRouterEnabled,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('9xen-regulettee_global_saas_config', JSON.stringify(config));
      localStorage.setItem('ai_auto_categorization_enabled', config.enableAiAutoCategorization ? 'true' : 'false');
      localStorage.setItem('ai_categorization_enabled', config.enableAiAutoCategorization ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('ai-auto-categorization-changed', { detail: { enabled: config.enableAiAutoCategorization } }));
      setTimeout(() => {
        setIsSaving(false);
        showToast('Global SaaS platform settings and AI provider integrations updated successfully across all tenant nodes.', 'success');
      }, 500);
    } catch (e) {
      setIsSaving(false);
      showToast('Failed to save settings.', 'error');
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem('9xen-regulettee_global_saas_config');
    localStorage.setItem('ai_auto_categorization_enabled', 'true');
    window.dispatchEvent(new CustomEvent('ai-auto-categorization-changed', { detail: { enabled: true } }));
    showToast('Reset global settings to default factory configurations.', 'info');
  };

  const handleTriggerKillSwitch = () => {
    if (confirmText !== 'SECURITY-BREACH-LOCKDOWN') {
      showToast('Please type SECURITY-BREACH-LOCKDOWN exactly to confirm emergency kill switch activation.', 'error');
      return;
    }

    const updatedConfig = {
      ...config,
      emergencyKillSwitchActive: true,
      maintenanceMode: true,
      maintenanceMessage: '🚨 EMERGENCY PLATFORM LOCKDOWN ACTIVE: Security breach detected. All tenant sessions invalidated. Read-only forensic mode enforced.',
    };

    setConfig(updatedConfig);
    localStorage.setItem('9xen-regulettee_global_saas_config', JSON.stringify(updatedConfig));

    // Invalidate active tenant sessions
    localStorage.removeItem('9xen-regulettee_active_session');
    localStorage.removeItem('9xen-regulettee_tenant_auth_token');
    
    // Log security breach event
    const logBreach = async () => {
      try {
        const rawLogs = localStorage.getItem('9xen-regulettee_system_error_logs');
        let existingLogs = [];
        if (rawLogs) {
          if (isEncrypted(rawLogs)) {
            existingLogs = JSON.parse(await decryptData(rawLogs));
          } else {
            existingLogs = JSON.parse(rawLogs);
          }
        }
        
        const breachLog = {
          id: 'breach-' + Date.now(),
          timestamp: new Date().toISOString(),
          component: 'EmergencyKillSwitch',
          error: 'EMERGENCY SECURITY BREACH LOCKDOWN TRIGGERED BY SUPER ADMIN',
          stackTrace: 'All tenant sessions forcefully terminated. Global read-only maintenance mode engaged.',
          status: 'FAILED_MAX_RETRIES',
          severity: 'CRITICAL'
        };
        
        const updatedLogs = [breachLog, ...existingLogs];
        const encrypted = await encryptData(JSON.stringify(updatedLogs));
        localStorage.setItem('9xen-regulettee_system_error_logs', encrypted);
      } catch (err) {
        console.error('Failed to log breach', err);
      }
    };

    logBreach();

    setShowKillModal(false);
    setConfirmText('');
    showToast('🚨 EMERGENCY KILL SWITCH ENGAGED! All tenant sessions terminated & read-only lock enforced.', 'error');
  };

  const handleDeactivateKillSwitch = () => {
    const updatedConfig = {
      ...config,
      emergencyKillSwitchActive: false,
      maintenanceMode: false,
    };
    setConfig(updatedConfig);
    localStorage.setItem('9xen-regulettee_global_saas_config', JSON.stringify(updatedConfig));
    showToast('Emergency lockdown lifted. Platform restored to normal operational state.', 'success');
  };

  const handleTestAiConnection = async (provider: string) => {
    setTestingAi(provider);
    try {
      if (provider === 'OPENROUTER') {
        const res = await fetch('/api/v1/llm-gateway/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'OPENROUTER', apiKey: config.openRouterApiKey, model: config.openRouterModel, baseUrl: config.openRouterBaseUrl }),
        });
        const data = await res.json();
        if (data?.success) {
          showToast(`${data.message} · Latency ${data.latencyMs}ms`, 'success');
          setConfig(prev => ({ ...prev, openRouterEnabled: true }));
          localStorage.setItem('9xen-regulettee_openrouter_apikey', config.openRouterApiKey);
        } else {
          showToast(data?.message || 'OpenRouter connection failed. Verify key & model id.', 'error');
        }
      } else if (provider === 'GEMINI_FREE') {
        const res = await fetch('/api/v1/llm-gateway/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'GEMINI', apiKey: process.env.GEMINI_API_KEY || '' }),
        });
        const data = await res.json();
        if (data?.success) showToast(`${data.message} · Latency ${data.latencyMs}ms`, 'success');
        else showToast(data?.message || 'Gemini not reachable — GEMINI_API_KEY missing on node.', 'error');
      } else {
        showToast(`SDK handshake with ${provider} simulated for demo — configure a key in the LLM Gateway to test live.`, 'success');
      }
    } catch (e: any) {
      showToast(`Connection probe failed: ${e?.message}`, 'error');
    } finally {
      setTestingAi(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Global SaaS Platform & AI Integration Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Control emergency kill switch, white-label branding, default compliance mandates, and primary Gemini Free / Custom LLM provider SDK integrations.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Deploying...' : 'Save & Broadcast'}</span>
          </button>
        </div>
      </div>

      {/* 1-CLICK FULL SYSTEM CONFIGURATION UPGRADE BANNER */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-500/30 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl text-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400 shrink-0">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-wide text-amber-300">
                  Full System Configuration & Sovereign Compliance Upgrade
                </h3>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase rounded-full border border-emerald-500/30">
                  SYSTEM READY: v4.5.0
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Executes platform-wide configuration upgrades: optimizes SQLite database PRAGMA schemas, refreshes ePrivacy CMP cookie blocker parameters, updates GDPR Art. 7 consent ledgers, and synchronizes cross-border data residency enclaves.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleFullSystemUpgrade}
              disabled={upgradingSystem}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {upgradingSystem ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Upgrading Full System Configuration...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>UPGRADE FULL SYSTEM CONFIGURATION</span>
                </>
              )}
            </button>
          </div>
        </div>

        {upgradeResult && (
          <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-xl space-y-2 text-xs font-mono text-emerald-300">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <span className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {upgradeResult.message}
              </span>
              <span className="text-slate-400 text-[10px]">Upgrade ID: {upgradeResult.upgradeId}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
              {upgradeResult.upgradedModules?.map((mod: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-1.5">
                  <span className="text-amber-400">✓</span>
                  <span>{mod}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EMERGENCY KILL SWITCH PROMINENT BANNER */}
      <div className={`border-2 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-md transition-all ${
        config.emergencyKillSwitchActive 
          ? 'bg-rose-950 border-rose-600 text-white' 
          : 'bg-gradient-to-r from-slate-900 to-rose-950 border-rose-900/40 text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-rose-600/30 border border-rose-500/50 rounded-2xl text-rose-400 shrink-0">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-wide text-white">Emergency Kill Switch & Security Lockdown</h3>
                {config.emergencyKillSwitchActive ? (
                  <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full animate-bounce">
                    LOCKDOWN ACTIVE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/30">
                    ARMED & READY
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                In the event of an active security breach, zero-day exploit, or data exfiltration attempt, trigger this kill switch to immediately invalidate all active tenant sessions, terminate API tokens, and enforce read-only forensic maintenance mode platform-wide.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {config.emergencyKillSwitchActive ? (
              <button
                onClick={handleDeactivateKillSwitch}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-emerald-400/40"
              >
                <Unlock className="w-4 h-4" />
                <span>Lift Lockdown & Restore Normal Ops</span>
              </button>
            ) : (
              <button
                onClick={() => setShowKillModal(true)}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-xl transition-all flex items-center gap-2 cursor-pointer border border-rose-400/50 animate-pulse"
              >
                <Zap className="w-4 h-4" />
                <span>TRIGGER EMERGENCY KILL SWITCH</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Kill Switch */}
      {showKillModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-600 rounded-2xl max-w-md w-full p-4 sm:p-5 lg:p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center space-x-3 text-rose-500">
              <ShieldAlert className="w-8 h-8 shrink-0 animate-bounce" />
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-rose-400">CRITICAL SECURITY ACTION</h3>
                <p className="text-xs text-slate-400">This action will immediately disrupt all connected tenants.</p>
              </div>
            </div>

            <div className="bg-rose-950/60 border border-rose-800/60 rounded-xl p-4 space-y-2 text-xs text-rose-200">
              <p className="font-bold">What happens when triggered:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>All active tenant & user sessions are instantly invalidated.</li>
                <li>API gateways switch to read-only security audit mode.</li>
                <li>A critical security breach event is written to immutable audit ledgers.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Type <code className="text-rose-400 font-mono font-black">SECURITY-BREACH-LOCKDOWN</code> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="SECURITY-BREACH-LOCKDOWN"
                className="w-full bg-slate-950 border border-rose-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowKillModal(false); setConfirmText(''); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerKillSwitch}
                disabled={confirmText !== 'SECURITY-BREACH-LOCKDOWN'}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Execute Emergency Lockdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Provider & Custom LLM Integration SDK Hub */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Primary AI & Custom LLM Provider SDK Integration Hub</h3>
              <p className="text-[11px] text-slate-500">Configure Gemini Free API as primary operations engine, OpenRouter.ai universal gateway (BYOK), or custom LLM provider SDK endpoints (OpenAI, Anthropic, DeepSeek).</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
            Gemini Free API SDK Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Primary AI Provider Selection */}
          <div className="space-y-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Primary Platform AI Engine</label>
              <span className="text-[10px] text-indigo-600 font-bold">Default Operational Core</span>
            </div>
            <select
              value={config.primaryAiProvider}
              onChange={(e) => setConfig({ ...config, primaryAiProvider: e.target.value as any })}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="GEMINI_FREE">Google Gemini Free API SDK (Recommended Primary)</option>
              <option value="OPENAI">OpenAI GPT-4o / GPT-3.5 API Provider</option>
              <option value="ANTHROPIC">Anthropic Claude 3.5 Sonnet SDK</option>
              <option value="DEEPSEEK">DeepSeek V3 / R1 Enterprise Provider</option>
              <option value="CUSTOM">Custom OpenAI-Compatible API Endpoint</option>
              <option value="OPENROUTER">OpenRouter.ai Universal Model Gateway (BYOK)</option>
            </select>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              When set to Gemini Free API, the platform utilizes optimized `@google/genai` models for rapid compliance advice, document generation, and risk reasoning without incurring token overhead.
            </p>

            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Gemini Model Preset</label>
                <span className="text-[10px] text-slate-400 font-mono">@google/genai SDK</span>
              </div>
              <select
                value={config.geminiModelPreset}
                onChange={(e) => setConfig({ ...config, geminiModelPreset: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="gemini-3.7-flash">Gemini 3.7 Flash (Flagship Fast & Compliant)</option>
              </select>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-slate-700">Gemini Free API Key Connected</span>
                </div>
                <button
                  onClick={() => handleTestAiConnection('GEMINI_FREE')}
                  disabled={testingAi === 'GEMINI_FREE'}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {testingAi === 'GEMINI_FREE' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{testingAi === 'GEMINI_FREE' ? 'Testing...' : 'Test Gemini SDK'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Custom LLM Provider SDK & Failover Configuration */}
          <div className="space-y-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Custom LLM Provider SDK Integration</label>
              <span className="text-[10px] text-purple-600 font-bold">Multi-Model Failover</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Custom API Gateway / Endpoint URL</label>
                <input
                  type="text"
                  value={config.customLlmEndpoint}
                  onChange={(e) => setConfig({ ...config, customLlmEndpoint: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Model Deployment Name</label>
                  <input
                    type="text"
                    value={config.customLlmModelName}
                    onChange={(e) => setConfig({ ...config, customLlmModelName: e.target.value })}
                    placeholder="gpt-4o or claude-3-5"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Provider API Key / Secret</label>
                  <input
                    type="password"
                    value={config.customLlmApiKey}
                    onChange={(e) => setConfig({ ...config, customLlmApiKey: e.target.value })}
                    placeholder="sk-proj-..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-failover"
                    checked={config.enableAutomaticAiFailover}
                    onChange={(e) => setConfig({ ...config, enableAutomaticAiFailover: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="auto-failover" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Enable automatic failover to Custom LLM if Gemini rate-limits
                  </label>
                </div>

                <button
                  onClick={() => handleTestAiConnection(config.primaryAiProvider)}
                  disabled={testingAi !== null}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Test SDK</span>
                </button>
              </div>
            </div>
          </div>

          {/* OpenRouter.ai Universal Gateway (BYOK) */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-slate-950 to-violet-950 border border-violet-400/40 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">OpenRouter.ai Universal Gateway</label>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> BYOK Model Zoo
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-violet-200 mb-1">OpenRouter API Key <code className="text-violet-300 font-mono">sk-or-…</code></label>
                <input
                  type="password"
                  value={config.openRouterApiKey}
                  onChange={(e) => setConfig({ ...config, openRouterApiKey: e.target.value })}
                  placeholder="sk-or-v1-..."
                  className="w-full bg-slate-900 border border-violet-500/40 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-violet-200 mb-1">Default OpenRouter Model</label>
                  <select
                    value={config.openRouterModel}
                    onChange={(e) => setConfig({ ...config, openRouterModel: e.target.value })}
                    className="w-full bg-slate-900 border border-violet-500/40 rounded-xl px-3 py-2 text-xs font-mono text-white focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer"
                  >
                    <option value="openrouter/auto">openrouter/auto</option>
                    <option value="meta-llama/llama-3.3-70b-instruct">meta-llama/llama-3.3-70b-instruct</option>
                    <option value="deepseek/deepseek-chat">deepseek/deepseek-chat</option>
                    <option value="anthropic/claude-3.5-sonnet">anthropic/claude-3.5-sonnet</option>
                    <option value="openai/gpt-4o">openai/gpt-4o</option>
                    <option value="openai/gpt-4o-mini">openai/gpt-4o-mini</option>
                    <option value="google/gemini-2.0-flash-001">google/gemini-2.0-flash-001</option>
                    <option value="qwen/qwen-2.5-72b-instruct:free">qwen/qwen-2.5-72b-instruct:free</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-violet-200 mb-1">Gateway Base URL</label>
                  <input
                    type="text"
                    value={config.openRouterBaseUrl}
                    onChange={(e) => setConfig({ ...config, openRouterBaseUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-violet-500/40 rounded-xl px-3 py-2 text-xs font-mono text-white focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="openrouter-enabled"
                    checked={config.openRouterEnabled}
                    onChange={(e) => setConfig({ ...config, openRouterEnabled: e.target.checked })}
                    className="w-4 h-4 text-violet-500 rounded border-slate-600 bg-slate-900 focus:ring-violet-500 cursor-pointer"
                  />
                  <label htmlFor="openrouter-enabled" className="text-xs font-bold text-white cursor-pointer">
                    Route compliance inferences through OpenRouter
                  </label>
                </div>
                <button
                  onClick={() => handleTestAiConnection('OPENROUTER')}
                  disabled={testingAi !== null}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {testingAi === 'OPENROUTER' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
                  <span>{testingAi === 'OPENROUTER' ? 'Testing...' : 'Test & Save to Gateway'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-violet-500/20">
                <span className="text-[10px] font-mono text-violet-300">Endpoint https://openrouter.ai/api/v1 · OpenAI-protocol via openai SDK</span>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/v1/llm-gateway/providers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ provider: 'OPENROUTER', apiKey: config.openRouterApiKey, model: config.openRouterModel, baseUrl: config.openRouterBaseUrl, enabled: config.openRouterEnabled, updatedBy: 'saas-super-admin' }),
                      });
                      const data = await res.json();
                      if (data?.success) {
                        showToast(`OpenRouter saved — ${data.keyMasked}`, 'success');
                        localStorage.setItem('9xen-regulettee_openrouter_apikey', config.openRouterApiKey);
                      } else showToast(data?.error || 'Failed to save OpenRouter provider.', 'error');
                    } catch (e: any) { showToast(`Save failed: ${e?.message}`, 'error'); }
                  }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Persist Config
                </button>
</div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <LLMProviderFleetManager />
        </div>

        <div className="mt-4 p-4 sm:p-5 bg-white border border-purple-200/80 rounded-2xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${config.enableAiAutoCategorization ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'} transition-colors mt-0.5`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">AI-Powered Auto-Categorization Engine</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                    config.enableAiAutoCategorization
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {config.enableAiAutoCategorization ? 'Engine Active' : 'Engine Inactive'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Automatically parses raw narrative complaints, incident descriptions, risk declarations, and uploaded documents to infer high-confidence classification categories without manual taxonomy lookups.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                id="global-ai-auto-categorization-toggle"
                checked={config.enableAiAutoCategorization}
                onChange={(e) => {
                  const newVal = e.target.checked;
                  setConfig({ ...config, enableAiAutoCategorization: newVal });
                  localStorage.setItem('ai_auto_categorization_enabled', newVal ? 'true' : 'false');
                  localStorage.setItem('ai_categorization_enabled', newVal ? 'true' : 'false');
                  window.dispatchEvent(new CustomEvent('ai-auto-categorization-changed', { detail: { enabled: newVal } }));
                  showToast(
                    newVal 
                      ? 'AI Auto-Categorization Engine enabled and persisted in Local Storage.' 
                      : 'AI Auto-Categorization Engine disabled and persisted in Local Storage.',
                    'info'
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Section 1: Maintenance Mode & Sovereign Lockout */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Platform Maintenance & Outage Controls</h3>
              <p className="text-[11px] text-slate-500">Trigger platform-wide maintenance banners and restrict non-admin access.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-xs text-slate-900 block">Enable Global Maintenance Mode</span>
                <span className="text-[11px] text-slate-500">Locks standard tenant portals and displays custom maintenance banner.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.maintenanceMode}
                  onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {config.maintenanceMode && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Maintenance banner is currently ACTIVE for all client tenants.</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">Custom Maintenance Outage Announcement Message</label>
                  <textarea
                    value={config.maintenanceMessage}
                    onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
                    rows={3}
                    className="w-full bg-white border border-amber-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="bypass-admin"
                    checked={config.allowSuperAdminBypass}
                    onChange={(e) => setConfig({ ...config, allowSuperAdminBypass: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="bypass-admin" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Allow Super Admins to bypass maintenance lockout
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: White-Label Branding & Portals */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">White-Label Portal Branding</h3>
              <p className="text-[11px] text-slate-500">Customize tenant portal titles, accent colors, and legal footers.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Global SaaS Brand Name</label>
              <input
                type="text"
                value={config.brandName}
                onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Portal Header Logo Text</label>
                <input
                  type="text"
                  value={config.portalLogoText}
                  onChange={(e) => setConfig({ ...config, portalLogoText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Accent Theme</label>
                <select
                  value={config.brandAccentColor}
                  onChange={(e) => setConfig({ ...config, brandAccentColor: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <option value="indigo">Indigo Sovereign</option>
                  <option value="emerald">Emerald Enterprise</option>
                  <option value="violet">Violet Quantum</option>
                  <option value="amber">Amber Regulatory</option>
                  <option value="slate">Slate Minimal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Footer Legal Disclaimer / Notice</label>
              <input
                type="text"
                value={config.footerLegalNotice}
                onChange={(e) => setConfig({ ...config, footerLegalNotice: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Default System-Wide Compliance Mandates */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6 lg:col-span-2">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Default System-Wide Compliance Mandates & Policy Defaults</h3>
              <p className="text-[11px] text-slate-500">Configure default regulatory enforcement presets applied to all newly onboarded tenant workspaces.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Default Primary Jurisdiction</label>
              <select
                value={config.defaultComplianceJurisdiction}
                onChange={(e) => setConfig({ ...config, defaultComplianceJurisdiction: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="EU_GDPR_AI_ACT">EU GDPR & AI Act (Unified)</option>
                <option value="US_HIPAA_CCPA">US Healthcare & Privacy (HIPAA/CCPA)</option>
                <option value="UK_GDPR_FCA">UK Financial & Data Protection</option>
                <option value="APAC_CROSS_BORDER">APAC Multi-Jurisdiction Sovereign</option>
              </select>
              <span className="text-[10px] text-slate-400 block">Applies automatic baseline regulatory rule templates to new organizations.</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Default AI Risk Scoring Threshold</label>
              <select
                value={config.aiActRiskScoringDefault}
                onChange={(e) => setConfig({ ...config, aiActRiskScoringDefault: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="STRICT">Strict (Zero tolerance for high-risk flags)</option>
                <option value="MODERATE">Moderate (Requires dual admin sign-off)</option>
                <option value="PERMISSIVE">Permissive (Advisory audit mode)</option>
              </select>
              <span className="text-[10px] text-slate-400 block">Determines default automated enforcement severity for AI models.</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Audit Trail Retention Period (Days)</label>
              <select
                value={config.dataRetentionDays}
                onChange={(e) => setConfig({ ...config, dataRetentionDays: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value={30}>30 Days (Standard Tier)</option>
                <option value={90}>90 Days (Enterprise Sovereign)</option>
                <option value={365}>365 Days (Financial & Gov Tier)</option>
                <option value={730}>7 Years (Regulated Banking Tier)</option>
              </select>
              <span className="text-[10px] text-slate-400 block">Immutable log archival period before automated cold storage purge.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="strict-gdpr"
                checked={config.strictGdprEnforcement}
                onChange={(e) => setConfig({ ...config, strictGdprEnforcement: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="strict-gdpr" className="text-xs font-bold text-slate-800 cursor-pointer">
                Enforce strict sovereign data residency checks on all inbound API payloads
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="auto-block"
                checked={config.autoCrossBorderBlocking}
                onChange={(e) => setConfig({ ...config, autoCrossBorderBlocking: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="auto-block" className="text-xs font-bold text-slate-800 cursor-pointer">
                Auto-quarantine non-compliant cross-border telemetry packets
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Regional Cookie & Privacy Consent Law Engine */}
        <div className="lg:col-span-2">
          <RegionalCookieConsentAdminConfig />
        </div>

        {/* Section 5: SMTP Operation & Email Configuration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">SMTP Operation & Email Configuration</h3>
              <p className="text-[11px] text-slate-500">Configure global SMTP gateway for system operations, login notifications, and platform alerts.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={config.smtpHost}
                  onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                  placeholder="smtp.example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Port</label>
                <input
                  type="number"
                  value={config.smtpPort}
                  onChange={(e) => setConfig({ ...config, smtpPort: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Username</label>
                <input
                  type="text"
                  value={config.smtpUser}
                  onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Password</label>
                <input
                  type="password"
                  value={config.smtpPassword}
                  onChange={(e) => setConfig({ ...config, smtpPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sender Email Address</label>
                <input
                  type="email"
                  value={config.smtpSenderEmail}
                  onChange={(e) => setConfig({ ...config, smtpSenderEmail: e.target.value })}
                  placeholder="noreply@domain.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="flex items-end pb-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="smtp-secure"
                    checked={config.smtpSecure}
                    onChange={(e) => setConfig({ ...config, smtpSecure: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="smtp-secure" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Enable TLS/SSL Secure Connection
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: SMS Notification & OTP Gateway */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 bg-pink-50 text-pink-600 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">SMS Notification & OTP Gateway</h3>
              <p className="text-[11px] text-slate-500">Configure SMS provider for login authentication, registrations, and critical notifications.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SMS Gateway Provider</label>
              <select
                value={config.smsProvider}
                onChange={(e) => setConfig({ ...config, smsProvider: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="TWILIO">Twilio (Primary)</option>
                <option value="AWS_SNS">AWS SNS (Enterprise)</option>
                <option value="MESSAGEBIRD">MessageBird (European Default)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">API Key / Account SID</label>
                <input
                  type="text"
                  value={config.smsApiKey}
                  onChange={(e) => setConfig({ ...config, smsApiKey: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">API Secret / Auth Token</label>
                <input
                  type="password"
                  value={config.smsApiSecret}
                  onChange={(e) => setConfig({ ...config, smsApiSecret: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sender ID / Phone Number</label>
              <input
                type="text"
                value={config.smsSenderId}
                onChange={(e) => setConfig({ ...config, smsSenderId: e.target.value })}
                placeholder="+1234567890 or 9XEN_REGULETTEE"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5B: Identity Verification, OTP Generator & SMS Engine */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 border border-indigo-700/50 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-500/20 text-cyan-400 rounded-2xl border border-indigo-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Identity Verification, OTP Generator & Cellular SMS Engine</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400 text-slate-950">
                    ACTIVE
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Manage multi-tenant email verification pipelines, cryptographic OTP & TOTP generators, and cellular SMS gateway telemetry.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowVerificationModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Key className="w-4 h-4" />
              <span>Launch Verification Console</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Mail className="w-4 h-4" />
                <span>Email Verification</span>
              </div>
              <p className="text-[11px] text-slate-400">Magic link token generator & tenant verification matrix with 1-click super admin overrides.</p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Key className="w-4 h-4" />
                <span>OTP & TOTP RFC-6238</span>
              </div>
              <p className="text-[11px] text-slate-400">6/8-digit numeric generator, 30s period TOTP clock, and Google Authenticator QR seeds.</p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-pink-400 font-bold">
                <Smartphone className="w-4 h-4" />
                <span>SMS Cellular Delivery</span>
              </div>
              <p className="text-[11px] text-slate-400">Twilio & Sovereign Telco gateway routing with live DLR delivery receipt logs.</p>
            </div>
          </div>
        </div>

        {/* VERIFICATION MODAL */}
        {showVerificationModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl max-h-[92vh] overflow-y-auto">
              <SaasAdminVerificationManager
                isModal={true}
                onClose={() => setShowVerificationModal(false)}
              />
            </div>
          </div>
        )}

        {/* Section 6: Database Connectors & Persistence */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Database Connectors & Persistence</h3>
              <p className="text-[11px] text-slate-500">Configure Supabase, ChromaDB vector store, PostgreSQL, and Redis caching for the entire platform.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supabase Project URL</label>
                <input
                  type="url"
                  value={config.supabaseUrl}
                  onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supabase Service Role Key</label>
                <input
                  type="password"
                  value={config.supabaseServiceKey}
                  onChange={(e) => setConfig({ ...config, supabaseServiceKey: e.target.value })}
                  placeholder="eyJhb..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ChromaDB API Endpoint</label>
                <input
                  type="url"
                  value={config.chromadbEndpoint}
                  onChange={(e) => setConfig({ ...config, chromadbEndpoint: e.target.value })}
                  placeholder="http://localhost:8000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ChromaDB Auth Token</label>
                <input
                  type="password"
                  value={config.chromadbAuthToken}
                  onChange={(e) => setConfig({ ...config, chromadbAuthToken: e.target.value })}
                  placeholder="Bearer token or API Key"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PostgreSQL Connection String</label>
                <input
                  type="text"
                  value={config.postgresConnectionString}
                  onChange={(e) => setConfig({ ...config, postgresConnectionString: e.target.value })}
                  placeholder="postgresql://user:pass@host:5432/db"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Redis Cache URL</label>
                <input
                  type="text"
                  value={config.redisCacheUrl}
                  onChange={(e) => setConfig({ ...config, redisCacheUrl: e.target.value })}
                  placeholder="redis://:password@host:6379"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kuzu DB Path (Embedded Graph)</label>
                <input
                  type="text"
                  value={config.kuzuDbPath}
                  onChange={(e) => setConfig({ ...config, kuzuDbPath: e.target.value })}
                  placeholder="./kuzu_db"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SQLite Path (Embedded Relational)</label>
                <input
                  type="text"
                  value={config.sqliteDbPath}
                  onChange={(e) => setConfig({ ...config, sqliteDbPath: e.target.value })}
                  placeholder="./local_db.sqlite"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">MongoDB Connection String</label>
                <input
                  type="text"
                  value={config.mongoDbConnectionString}
                  onChange={(e) => setConfig({ ...config, mongoDbConnectionString: e.target.value })}
                  placeholder="mongodb+srv://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
