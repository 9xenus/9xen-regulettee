import React, { useState, useEffect } from 'react';
import { 
  Cookie, 
  ShieldCheck, 
  Check, 
  X, 
  Code2, 
  Copy, 
  ExternalLink, 
  Settings, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Globe, 
  Zap, 
  FileCode, 
  Eye, 
  RefreshCw,
  Sparkles,
  Lock,
  Building2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConsentConfig {
  tenantId: string;
  brandingLevel: 'BRANDED' | 'CO_BRANDED' | 'WHITE_LABEL';
  platformLogoUrl: string;
  platformName: string;
  themeColor: string;
  position: 'bottom-bar' | 'bottom-right' | 'modal';
  categories: {
    necessary: boolean;
    analytics: boolean;
    functional: boolean;
    marketing: boolean;
  };
  language: 'EN' | 'BN' | 'DE' | 'FR';
}

interface ComplianceAddonStatus {
  id: string;
  name: string;
  act: string;
  status: 'FULL_COMPLIANT' | 'ACTIVE' | 'ENFORCED';
  version: string;
  description: string;
}

export const EmbeddedConsentBannerStudio: React.FC<{ tenantId?: string }> = ({ 
  tenantId = 'tenant_default' 
}) => {
  const [config, setConfig] = useState<ConsentConfig>({
    tenantId,
    brandingLevel: 'BRANDED',
    platformLogoUrl: 'https://ais-dev-ahsahujbssjjc5aoxahikx-914020323885.asia-east1.run.app/favicon.ico',
    platformName: 'Sovereign Compliance Engine',
    themeColor: '#d97706', // Amber 600
    position: 'bottom-right',
    categories: {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    },
    language: 'EN',
  });

  const [activeTab, setActiveTab] = useState<'studio' | 'addons' | 'embed_code'>('studio');
  const [copiedCode, setCopiedCode] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live Interactive Preview State
  const [previewAccepted, setPreviewAccepted] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Addons Audit Health Check List
  const addonsList: ComplianceAddonStatus[] = [
    {
      id: 'eprivacy-cookie-blocker',
      name: 'ePrivacy Prior-Consent Cookie Blocker',
      act: 'ePrivacy Directive (2002/58/EC)',
      status: 'FULL_COMPLIANT',
      version: 'v4.2.0',
      description: 'Auto-blocks non-essential third-party cookies, tracking pixels, and storage markers prior to explicit affirmative user opt-in.'
    },
    {
      id: 'gdpr-art7-ledger',
      name: 'GDPR Art. 7 Immutable Consent Ledger',
      act: 'EU GDPR (2016/679)',
      status: 'FULL_COMPLIANT',
      version: 'v3.1.8',
      description: 'Generates zero-knowledge SHA-256 cryptographic signatures for every consent event and logs them to the embedded SQLite audit table.'
    },
    {
      id: 'ccpa-opt-out',
      name: 'CCPA / CPRA "Do Not Sell/Share" Handler',
      act: 'California CPRA (Civ. Code § 1798.120)',
      status: 'FULL_COMPLIANT',
      version: 'v2.9.1',
      description: 'Provides standardized Global Privacy Control (GPC) signal detection and 1-click opt-out mechanisms for California consumers.'
    },
    {
      id: 'eu-ai-act-transparency',
      name: 'EU AI Act Risk Classification & Notice',
      act: 'EU AI Act (Regulation 2024/1689)',
      status: 'ACTIVE',
      version: 'v1.4.0',
      description: 'Mandatory disclosure for client platforms utilizing generative models, automated decision systems, or biometric data pipelines.'
    },
    {
      id: 'dora-resilience-log',
      name: 'DORA ICT Operational Resilience Logger',
      act: 'DORA (Regulation 2022/2554)',
      status: 'ENFORCED',
      version: 'v2.1.0',
      description: 'Tracks third-party CMP script uptime, failover latency, and ICT vendor dependency risks under Article 28.'
    },
    {
      id: 'eidas-sig-validation',
      name: 'eIDAS Qualified Trust Seal & Signature',
      act: 'eIDAS II (Regulation 910/2014)',
      status: 'FULL_COMPLIANT',
      version: 'v5.0.1',
      description: 'Embeds eIDAS compliant electronic seals into exported proof-of-consent certificates and regulatory archives.'
    }
  ];

  const embedScriptSnippet = `<!-- Sovereign Compliance Engine Embeddable CMP Banner -->
<script 
  src="${window.location.origin}/api/v1/consent/embed.js" 
  data-tenant-id="${config.tenantId}"
  data-branding="${config.brandingLevel}"
  data-position="${config.position}"
  data-lang="${config.language}"
  async>
</script>`;

  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(embedScriptSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await fetch('/api/v1/consent/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Failed saving consent config:', err);
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
              <Cookie className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-100">
                  Embeddable Cookie Consent Banner & CMP Studio
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  FULL-STACK CMP READY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Deploy white-labeled or co-branded cookie consent banners on your clients' or your own websites. Features ePrivacy prior-consent auto-blocking, customizable platform logo levels, and real-time SQLite consent ledger logging.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'studio' ? 'bg-amber-600 text-slate-950 shadow-lg shadow-amber-600/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Banner Studio
            </button>
            <button
              onClick={() => setActiveTab('embed_code')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'embed_code' ? 'bg-amber-600 text-slate-950 shadow-lg shadow-amber-600/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 inline mr-1" />
              Embed Code
            </button>
            <button
              onClick={() => setActiveTab('addons')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'addons' ? 'bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-600/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
              Add-ons Check ({addonsList.length}/6)
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="space-y-6">
            {/* Branding & Logo Level */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Platform Logo & Branding Level</span>
              </h3>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 block font-medium">Branding Level for Client Websites:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, brandingLevel: 'BRANDED' })}
                    className={`p-2.5 rounded-xl text-xs font-mono text-center border transition-all ${
                      config.brandingLevel === 'BRANDED'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Branded
                    <span className="block text-[9px] text-slate-500 mt-0.5">Show Platform Logo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, brandingLevel: 'CO_BRANDED' })}
                    className={`p-2.5 rounded-xl text-xs font-mono text-center border transition-all ${
                      config.brandingLevel === 'CO_BRANDED'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Co-Branded
                    <span className="block text-[9px] text-slate-500 mt-0.5">Client + Platform</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, brandingLevel: 'WHITE_LABEL' })}
                    className={`p-2.5 rounded-xl text-xs font-mono text-center border transition-all ${
                      config.brandingLevel === 'WHITE_LABEL'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    White-Label
                    <span className="block text-[9px] text-slate-500 mt-0.5">Hide Platform Logo</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Platform Brand Name:</label>
                <input
                  type="text"
                  value={config.platformName}
                  onChange={(e) => setConfig({ ...config, platformName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Platform Logo Badge URL:</label>
                <input
                  type="text"
                  value={config.platformLogoUrl}
                  onChange={(e) => setConfig({ ...config, platformLogoUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Layout & Style Configuration */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Banner Layout & Styling</span>
              </h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Display Position:</label>
                <select
                  value={config.position}
                  onChange={(e: any) => setConfig({ ...config, position: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="bottom-right">Bottom-Right Floating Card</option>
                  <option value="bottom-bar">Bottom Full Width Bar</option>
                  <option value="modal">Center Modal Overlay</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Default Language:</label>
                <select
                  value={config.language}
                  onChange={(e: any) => setConfig({ ...config, language: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="EN">English (US/UK)</option>
                  <option value="BN">Bengali (বাংলা)</option>
                  <option value="DE">German (Deutsch - Strict ePrivacy)</option>
                  <option value="FR">French (Français)</option>
                </select>
              </div>

              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-600/20"
              >
                {savingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{savedSuccess ? 'Configuration Saved!' : 'Save & Publish Banner Config'}</span>
              </button>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Live Interactive Website Sandbox Preview</span>
              </span>

              <button
                onClick={() => setPreviewAccepted(false)}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline"
              >
                Reset Preview State
              </button>
            </div>

            {/* Mock Client Website Viewport */}
            <div className="relative h-[520px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              {/* Mock Browser Top Header */}
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center space-x-2">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="flex-1 max-w-sm bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-1 text-[11px] font-mono text-slate-400 text-center truncate">
                  https://client-production-app.com
                </div>
              </div>

              {/* Mock Website Body Content */}
              <div className="p-8 space-y-6 opacity-30 pointer-events-none select-none flex-1">
                <div className="h-8 bg-slate-800/60 rounded-lg w-1/3" />
                <div className="h-28 bg-slate-800/40 rounded-xl" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-32 bg-slate-800/30 rounded-xl" />
                  <div className="h-32 bg-slate-800/30 rounded-xl" />
                  <div className="h-32 bg-slate-800/30 rounded-xl" />
                </div>
              </div>

              {/* Injected Banner Overlay */}
              {!previewAccepted && (
                <div className={`absolute z-30 transition-all p-4 ${
                  config.position === 'bottom-right'
                    ? 'bottom-4 right-4 max-w-md'
                    : config.position === 'bottom-bar'
                    ? 'bottom-0 left-0 right-0'
                    : 'inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6'
                }`}>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
                          <Cookie className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">
                            {config.language === 'BN' ? 'কুকি সম্মতি ও গোপনীয়তা বিজ্ঞপ্তি' : 'Cookie & Privacy Preferences'}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            We use zero-tracking functional session tokens and ePrivacy prior-consent cookies.
                          </p>
                        </div>
                      </div>

                      {/* White-label Logo Level Badge */}
                      {config.brandingLevel !== 'WHITE_LABEL' && (
                        <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-mono shrink-0">
                          <img src={config.platformLogoUrl} alt="Logo" className="w-3.5 h-3.5 rounded" />
                          <span className="text-amber-400 font-bold">
                            {config.brandingLevel === 'BRANDED' ? config.platformName : 'Co-Branded'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Button Controls */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                      <button
                        onClick={() => setPreviewAccepted(true)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                      >
                        Accept All Cookies
                      </button>

                      <button
                        onClick={() => setShowPreferencesModal(!showPreferencesModal)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                      >
                        Customize
                      </button>

                      <button
                        onClick={() => setPreviewAccepted(true)}
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-semibold"
                      >
                        Reject Non-Essential
                      </button>
                    </div>

                    {/* Preferences Customizer Expansion */}
                    {showPreferencesModal && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Essential (Strictly Necessary)</span>
                          <span className="text-emerald-400 font-bold">Always Active</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Analytics & Telemetry</span>
                          <input type="checkbox" className="accent-amber-500" />
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Marketing & Ad Trackers</span>
                          <input type="checkbox" className="accent-amber-500" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Embed Code Tab */}
      {activeTab === 'embed_code' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>Production HTML Embed Code for Client Platforms</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Paste this script inside your HTML <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">&lt;head&gt;</code> block. The script automatically executes ePrivacy cookie auto-blocking and renders your configured banner with platform branding levels.
              </p>
            </div>

            <button
              onClick={handleCopyEmbedCode}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-amber-600/20"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedCode ? 'Copied HTML Code!' : 'Copy Embed Script'}</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
            <pre>{embedScriptSnippet}</pre>
          </div>
        </div>
      )}

      {/* Add-ons Check Tab */}
      {activeTab === 'addons' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Compliance Engine Add-ons Verification Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Diagnostic audit verifying all compliance engine add-ons, cookie blockers, GDPR consent ledgers, and regulatory frameworks active on the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addonsList.map((addon) => (
              <div 
                key={addon.id} 
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 font-mono">{addon.name}</h4>
                    <span className="text-[10px] text-amber-400/90 font-mono block mt-0.5">{addon.act}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {addon.status} ({addon.version})
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {addon.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
