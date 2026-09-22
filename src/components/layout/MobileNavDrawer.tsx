import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  Server, 
  Sliders, 
  CreditCard, 
  Layers, 
  Landmark, 
  AlertTriangle, 
  Eye, 
  BookOpen, 
  FileText, 
  Receipt, 
  Lock, 
  FileCode2, 
  Gavel, 
  ShieldAlert, 
  Scale, 
  Globe, 
  Moon, 
  Sun, 
  LogOut, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Activity, 
  Zap, 
  Compass, 
  Search,
  ExternalLink,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, LanguageCode } from '../../context/LanguageContext';
import { useJurisdiction } from '../../context/JurisdictionContext';
import { useTenant } from '../../context/TenantContext';
import { useNotification } from '../../context/NotificationContext';
import { CountryFlag } from '../ui/CountryFlag';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePath: string;
  onNavigate: (path: string) => void;
  role: string;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSearch?: () => void;
}

interface PersonaTool {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  color: string;
}

const PERSONA_TOOLS: Record<string, { title: string; badge: string; tools: PersonaTool[] }> = {
  ADMIN: {
    title: 'SaaS Platform Admin HQ',
    badge: 'HQ Admin',
    tools: [
      { id: 'sudou', label: 'Admin Command HQ', path: 'sudou', icon: Server, color: 'text-purple-500' },
      { id: 'tenants', label: 'Tenants Directory', path: 'tenants', icon: Building2, badge: '12 Active', color: 'text-indigo-500' },
      { id: 'rbac', label: 'RBAC Roles & Security', path: 'rbac', icon: Sliders, color: 'text-purple-500' },
      { id: 'engine', label: 'Multi-Region Engine', path: 'engine', icon: Zap, color: 'text-amber-500' },
      { id: 'entitlements', label: 'Billing & Entitlements', path: 'entitlements', icon: CreditCard, color: 'text-emerald-500' },
      { id: 'integrations', label: 'Zero-Downtime Integrations', path: 'integrations', icon: Layers, badge: '9-in-1', color: 'text-blue-500' },
      { id: 'audit-ledger', label: 'Audit Trail Ledger', path: 'audit-ledger', icon: ShieldCheck, color: 'text-cyan-500' }
    ]
  },
  EU_REGULATOR: {
    title: 'EU Statutory Regulator Enclave',
    badge: 'Statutory Regulator',
    tools: [
      { id: 'regulator-dashboard', label: 'Regulator Oversight', path: 'regulator-dashboard', icon: Landmark, color: 'text-emerald-500' },
      { id: 'clearing', label: 'B2G Clearing Rails', path: 'integrations', icon: Landmark, badge: 'ISO 20022', color: 'text-emerald-500' },
      { id: 'violations', label: 'Statutory Fines (Art. 99/31)', path: 'violations', icon: AlertTriangle, color: 'text-rose-500' },
      { id: 'ai-transparency', label: 'Art. 86 Appeals Court', path: 'ai-transparency', icon: Eye, color: 'text-cyan-500' },
      { id: 'gazette-watchdog', label: 'Statutory Gazette Watchdog', path: 'gazette-watchdog', icon: BookOpen, color: 'text-amber-500' },
      { id: 'audit-ledger', label: 'Cryptographic Audit Ledger', path: 'audit-ledger', icon: ShieldCheck, color: 'text-indigo-500' }
    ]
  },
  LAWYER: {
    title: 'Legal Counsel & Consultant Portal',
    badge: 'Legal Partner',
    tools: [
      { id: 'lawyer-portal', label: 'Legal Counsel Portal', path: 'lawyer-portal', icon: Scale, color: 'text-indigo-500' },
      { id: 'alae-dashboard', label: 'ALAE Legal Arbitration', path: 'alae-dashboard', icon: Gavel, badge: 'Autonomous', color: 'text-amber-500' },
      { id: 'tia-simulator', label: 'TIA & SCC Clauses Generator', path: 'tia-simulator', icon: FileText, color: 'text-rose-500' },
      { id: 'launch-tracker', label: 'AI Act Annex IV Dossiers', path: 'launch-tracker', icon: BookOpen, color: 'text-emerald-500' },
      { id: 'audit-ledger', label: 'Case Files & Evidentiary Vault', path: 'audit-ledger', icon: ShieldAlert, color: 'text-purple-500' }
    ]
  },
  CLIENT: {
    title: 'Enterprise Client Workspace',
    badge: 'Enterprise Client',
    tools: [
      { id: 'client-dashboard', label: 'Client Command Center', path: 'client-dashboard', icon: Building2, color: 'text-blue-500' },
      { id: 'compliance-hub', label: 'Compliance & Acts Hub', path: 'compliance-hub', icon: ShieldCheck, badge: '98% Ready', color: 'text-emerald-500' },
      { id: 'dsar-portal', label: 'DSAR Subject Requests', path: 'dsar-portal', icon: FileText, color: 'text-indigo-500' },
      { id: 'automation-portal', label: 'Invoice OCR & Finance AI', path: 'automation-portal', icon: Receipt, color: 'text-amber-500' },
      { id: 'evidence-vault', label: 'Immutable Evidence Vault', path: 'evidence-vault', icon: Lock, color: 'text-cyan-500' },
      { id: 'launch-tracker', label: 'Annex IV Conformance Dossier', path: 'launch-tracker', icon: FileCode2, color: 'text-purple-500' },
      { id: 'integrations', label: 'Cloud Connectors & APIs', path: 'integrations', icon: Layers, color: 'text-blue-500' }
    ]
  }
};

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  activePath,
  onNavigate,
  role,
  themeMode,
  onToggleTheme,
  onOpenSearch
}) => {
  const { user, signOut, setActiveRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { country, setCountry, countries } = useJurisdiction();
  const { activeTenant, tenants, switchTenant } = useTenant();
  const { showToast } = useNotification();

  const [activeSection, setActiveSection] = useState<'NAV' | 'JURISDICTION' | 'LANGUAGES' | 'TENANTS'>('NAV');

  // Normalize role
  const normRole = (() => {
    const r = (role || 'CLIENT').toUpperCase();
    if (r.includes('ADMIN')) return 'ADMIN';
    if (r.includes('REGULATOR')) return 'EU_REGULATOR';
    if (r.includes('LAWYER') || r.includes('LEGAL')) return 'LAWYER';
    return 'CLIENT';
  })();

  const currentPersona = PERSONA_TOOLS[normRole] || PERSONA_TOOLS.CLIENT;

  const handleNavigate = (path: string) => {
    try { navigator.vibrate?.(15); } catch {}
    onNavigate(path);
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    await signOut();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Drawer Sheet Sliding in from Right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full sm:w-96 max-w-[85vw] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden z-10"
            id="mobile-navigation-vertical-drawer"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                  9X
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">
                      9XEN SOVEREIGN
                    </span>
                    <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded">
                      {currentPersona.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {activeTenant?.name || 'Enterprise Tenant'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {onOpenSearch && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSearch();
                    }}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 active:scale-95 transition-all"
                    title="Search"
                    aria-label="Search"
                  >
                    <Search className="w-4.5 h-4.5" />
                  </button>
                )}
                <button
                  onClick={onToggleTheme}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 active:scale-95 transition-all"
                  title="Toggle Theme"
                  aria-label="Toggle Theme"
                >
                  {themeMode === 'light' ? (
                    <Moon className="w-4.5 h-4.5 text-slate-600" />
                  ) : (
                    <Sun className="w-4.5 h-4.5 text-amber-400" />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                  title="Close Navigation"
                  aria-label="Close Navigation Menu"
                  id="close-mobile-nav-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Segment Tabs */}
            <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-3 py-1.5 bg-slate-100/60 dark:bg-slate-900/60 gap-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveSection('NAV')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeSection === 'NAV'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Navigation Links
              </button>
              <button
                onClick={() => setActiveSection('TENANTS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  activeSection === 'TENANTS'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Workspaces</span>
              </button>
              <button
                onClick={() => setActiveSection('JURISDICTION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  activeSection === 'JURISDICTION'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Jurisdiction</span>
              </button>
              <button
                onClick={() => setActiveSection('LANGUAGES')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeSection === 'LANGUAGES'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Language ({language.toUpperCase()})
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {activeSection === 'NAV' && (
                <>
                  {/* Persona Tools List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {currentPersona.title}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {currentPersona.tools.length} Modules
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {currentPersona.tools.map((tool) => {
                        const ToolIcon = tool.icon;
                        const isToolActive = Boolean(
                          activePath && (activePath === tool.path || (tool.path !== '' && activePath.startsWith(tool.path)))
                        );

                        return (
                          <button
                            key={tool.id}
                            onClick={() => handleNavigate(tool.path)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isToolActive
                                ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 shadow-xs font-bold'
                                : 'bg-white dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-900/90 ${tool.color}`}>
                                <ToolIcon className="w-4.5 h-4.5" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold truncate">{tool.label}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                  /{tool.path}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0">
                              {tool.badge && (
                                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-600">
                                  {tool.badge}
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick System Links */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                      Core Platform Centers
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Integrations 9-in-1', path: 'integrations', icon: Layers, color: 'text-indigo-500' },
                        { label: 'Audit Trail Ledger', path: 'audit-ledger', icon: ShieldCheck, color: 'text-emerald-500' },
                        { label: 'Gazette Watchdog', path: 'gazette-watchdog', icon: BookOpen, color: 'text-amber-500' },
                        { label: 'Platform Settings', path: 'settings', icon: Sliders, color: 'text-slate-500' }
                      ].map((link, idx) => {
                        const Icon = link.icon;
                        const isLinkActive = activePath === link.path;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleNavigate(link.path)}
                            className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              isLinkActive
                                ? 'bg-slate-100 dark:bg-slate-800 border-indigo-400 text-indigo-600 dark:text-indigo-400'
                                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${link.color} shrink-0`} />
                            <span className="truncate">{link.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'TENANTS' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Select Tenancy Workspace
                    </span>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      {tenants.length} Available
                    </span>
                  </div>

                  {tenants.map((t) => {
                    const isSelected = t.id === activeTenant?.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          switchTenant(t.id);
                          showToast(`Switched workspace to ${t.name}`, 'success');
                          setActiveSection('NAV');
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100'
                            : 'bg-white dark:bg-slate-800 border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold truncate">{t.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {t.region} • {t.tier}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {activeSection === 'JURISDICTION' && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                    Select Regulatory Jurisdiction
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {countries.map((c) => {
                      const isSelected = country === c.code;
                      return (
                        <button
                          key={c.code}
                          onClick={() => {
                            setCountry(c.code);
                            showToast(`Jurisdiction switched to ${c.name} (${c.jurisdiction})`, 'success');
                            setActiveSection('NAV');
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-100 font-bold'
                              : 'bg-white dark:bg-slate-800 border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className="text-lg">{c.flag}</span>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold truncate">{c.name}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                {c.frameworkName} ({c.jurisdiction})
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeSection === 'LANGUAGES' && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                    Platform Language
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'bn', label: 'বাংলা (Bengali)' },
                      { code: 'de', label: 'Deutsch' },
                      { code: 'fr', label: 'Français' },
                      { code: 'es', label: 'Español' },
                      { code: 'it', label: 'Italiano' },
                      { code: 'ar', label: 'العربية (Arabic)' }
                    ].map((lang) => {
                      const isSelected = language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code as LanguageCode);
                            showToast(`Language set to ${lang.label}`, 'success');
                            setActiveSection('NAV');
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-100 font-bold'
                              : 'bg-white dark:bg-slate-800 border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
                          }`}
                        >
                          <span className="text-xs font-medium">{lang.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer User Info & Logout */}
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/90 dark:bg-slate-950/50 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-7 h-7 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.email?.split('@')[0] || 'User Profile'}
                  </span>
                  <button
                    onClick={() => handleNavigate('landing')}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-left flex items-center gap-1"
                  >
                    <span>Public Landing</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900/60 active:scale-95 transition-all cursor-pointer shrink-0"
                id="mobile-nav-logout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
