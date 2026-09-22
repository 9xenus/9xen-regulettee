import React, { useState, useEffect, useRef } from 'react';
import { VerificationBadge } from './VerificationBadge';
import { LiveComplianceBadges } from './LiveComplianceBadges';
import { VectorSyncIndicator } from './VectorSyncIndicator';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { TenantHealthStatus } from './TenantHealthStatus';
import { useIsOnline } from '../../hooks/useIsOnline';
import { VerificationDetailsModal } from './VerificationDetailsModal';
import { 
  Menu, 
  Search, 
  Bell, 
  Server, 
  ChevronDown, 
  Check, 
  Globe,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  CheckCircle2,
  FileText,
  Clock,
  Sliders,
  Sun,
  Moon,
  Award,
  Share2,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlobalSearchModal } from '../GlobalSearchModal';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage, LanguageCode } from '../../context/LanguageContext';
import { useJurisdiction } from '../../context/JurisdictionContext';
import { TenancyWorkspaceSwitcher } from './TenancyWorkspaceSwitcher';
import { EuropeanJurisdictionSwitcher } from './EuropeanJurisdictionSwitcher';
import { PersonaTopbarNav } from './PersonaTopbarNav';
import { MobileNavDrawer } from './MobileNavDrawer';
import { useTenant } from '../../context/TenantContext';
import { useRegulatory } from '../../context/RegulatoryContext';
import { EUROPEAN_REGULATORS } from '../../data/europeanRegulators';
import { CountryFlag } from '../ui/CountryFlag';

interface TopbarProps {
  toggleSidebar: () => void;
  activeContextName: string;
  onNavigate: (path: string) => void;
  role?: string;
  activePath?: string;
  onOpenQuickSwitch?: () => void;
}

const SEARCH_ITEMS = [
  // Compliance Modules
  { name: 'GDPR Compliance Module', type: 'Compliance Module', path: 'compliance-hub', category: 'modules' },
  { name: 'AI Act Compliance Module', type: 'Compliance Module', path: 'compliance-hub', category: 'modules' },
  { name: 'NIS2 Compliance Module', type: 'Compliance Module', path: 'compliance-hub', category: 'modules' },
  
  // Tenant Records
  { name: 'Acme Corp Tenant Record', type: 'Tenant Record', path: 'tenants', category: 'tenants' },
  { name: 'GlobalTech Tenant Record', type: 'Tenant Record', path: 'tenants', category: 'tenants' },

  // System Settings
  { name: 'User Roles & Security (RBAC)', type: 'System Setting', path: 'rbac', category: 'settings' },
  { name: 'Act Enable/Disable', type: 'System Setting', path: 'act-enable', category: 'settings' },
  { name: 'Plan Entitlements', type: 'System Setting', path: 'entitlements', category: 'settings' },
  { name: 'Multi-Region Engine Config', type: 'System Setting', path: 'engine', category: 'settings' },
  { name: 'Tenant Organization Settings', type: 'System Setting', path: 'tenants', category: 'settings' },
  { name: 'General Platform Settings', type: 'System Setting', path: 'system-settings', category: 'settings' },
  
  // Tasks
  { name: 'Review system access logs', type: 'Task', path: 'tasks', category: 'tasks' },
  { name: 'Upload GDPR/CCPA Data Processing Agreement (DPA)', type: 'Task', path: 'tasks', category: 'tasks' },
  { name: 'Configure Multi-Region failover alerts', type: 'Task', path: 'tasks', category: 'tasks' },
  { name: 'Address GDPR compliance violation notice', type: 'Task', path: 'tasks', category: 'tasks' },

  // Audit Logs
  { name: 'GDPR PII Sweep Log - Marketing DB', type: 'Audit Log', path: 'audit-ledger', category: 'audit' },
  { name: 'AI Act Algorithmic Bias Audit Log', type: 'Audit Log', path: 'audit-ledger', category: 'audit' },
  { name: 'Vendor Compliance Audit Trail', type: 'Audit Log', path: 'audit-ledger', category: 'audit' },
  { name: 'Platform API Key Rotation Entry', type: 'Audit Log', path: 'audit-ledger', category: 'audit' },

  // Integrations & Cloud Infrastructure
  { name: 'Zero-Knowledge Proofs (ZKP/ZKF) Full-Stack Cryptographic Engine', type: 'ZKP Cryptography', path: 'zk-proofs', category: 'modules' },
  { name: 'Enterprise Expansion & Automated Legal Suite (SG, CH, AU + S3/CF/GH Webhooks)', type: 'Expansion Suite', path: 'enterprise-expansion', category: 'modules' },
  { name: 'Automated Legal Contract Drafter (Omni-DPA, AI Vendor, SCC)', type: 'Legal Automation', path: 'enterprise-expansion', category: 'modules' },
  { name: 'Real-Time Cloud Webhooks Console (AWS S3, Cloudflare, GitHub)', type: 'Cloud Connectors', path: 'enterprise-expansion', category: 'modules' },
  { name: 'RegTech Competitive Moat Console (7 Defensibility Engines)', type: 'Moat Architecture', path: 'moat-console', category: 'modules' },
  { name: 'RegTech Launch Readiness & Prompts Dossier', type: 'Launch Tracker', path: 'launch-tracker', category: 'modules' },
  { name: 'EU AI Act Annex IV Dossier Generator', type: 'Dossier', path: 'launch-tracker', category: 'modules' },
  { name: 'DORA Digital Operational Resilience Assessment', type: 'Dossier', path: 'launch-tracker', category: 'modules' },
  { name: 'Zero-Downtime Integrations Hub (9-in-1)', type: 'Integration', path: 'integrations', category: 'modules' },
  { name: 'Software & Cloud Connectors (Salesforce, SAP, AWS S3)', type: 'Integration', path: 'integrations', category: 'modules' },
  { name: 'Global Event Webhooks System (HMAC-SHA256)', type: 'Integration', path: 'event-webhooks', category: 'modules' },
  { name: 'Smart e-KYC & Biometric Verification Engine', type: 'Verification', path: 'integrations', category: 'modules' },
  { name: 'EUDI Wallet & OIDC Sovereign Identity Enclave', type: 'Identity', path: 'digital-identity', category: 'modules' },
  { name: 'Corporate KYB Entity Registry & Sanctions Scan', type: 'KYB & AML', path: 'integrations', category: 'modules' },
  { name: 'Central Bank RTGS Clearing Rails & Webhooks', type: 'Clearing Rails', path: 'integrations', category: 'modules' },
];

export const Topbar: React.FC<TopbarProps> = ({ toggleSidebar, activeContextName, onNavigate, role, activePath, onOpenQuickSwitch }) => {
  const { user, session, signOut, isDemo, demoExpiresAt, setActiveRole, role: contextRole } = useAuth();
  const activeRole = contextRole || (user?.user_metadata?.role as string) || role || 'CLIENT';
  const { unreadCount, setIsSidebarOpen, showToast } = useNotification();
  const { language, setLanguage, t } = useLanguage();
  const { country, setCountry, countries, frameworkName } = useJurisdiction();
  const { activeTenant } = useTenant();
  const { selectedCountryCode } = useRegulatory();
  const isOnline = useIsOnline();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isJurisdictionMenuOpen, setIsJurisdictionMenuOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDensityMenuOpen, setIsDensityMenuOpen] = useState(false);
  const [currentDensity, setCurrentDensity] = useState<'standard' | 'slim-fit' | 'screen-to-fit'>(() => {
    return (localStorage.getItem('ui_layout_density') as any) || 'slim-fit';
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const jurisdictionMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const roleSwitcherRef = useRef<HTMLDivElement>(null);
  const densityMenuRef = useRef<HTMLDivElement>(null);

  const [timeLeft, setTimeLeft] = useState<string>('');

  // Close dropdowns on click outside
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(e.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
      if (jurisdictionMenuRef.current && !jurisdictionMenuRef.current.contains(e.target as Node)) {
        setIsJurisdictionMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (roleSwitcherRef.current && !roleSwitcherRef.current.contains(e.target as Node)) {
        setIsRoleSwitcherOpen(false);
      }
      if (densityMenuRef.current && !densityMenuRef.current.contains(e.target as Node)) {
        setIsDensityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleRoleSwitch = (newRole: any) => {
    setActiveRole(newRole);
    let targetPath = 'client';
    if (newRole === 'REGULATOR' || newRole === 'EU_REGULATOR') targetPath = 'regulator';
    if (newRole === 'LAWYER') targetPath = 'client'; // Default to client if lawyer path doesn't exist, or specific lawyer path
    
    onNavigate(targetPath);
    setIsRoleSwitcherOpen(false);
    showToast(`Switched to ${getRoleLabel(newRole)} View`, 'success');
  };

  useEffect(() => {
    if (isDemo && demoExpiresAt) {
      const updateTimer = () => {
        const now = Date.now();
        const diff = demoExpiresAt - now;
        if (diff <= 0) {
          setTimeLeft('Expired');
          return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days}d ${hours}h ${mins}m`);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [isDemo, demoExpiresAt]);

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const handleThemeChange = () => {
      const current = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
      setThemeMode(current);
    };
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = themeMode === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', nextTheme);
    setThemeMode(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    window.dispatchEvent(new Event('theme-changed'));
  };

  const userRole = activeRole;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'EU_REGULATOR': return 'EU Regulator';
      case 'TENANT_OWNER': return 'Tenant Owner';
      case 'CLIENT': return 'Client Account';
      case 'REGULATOR': return 'Regulator Admin';
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'ADMIN': return 'Admin';
      case 'LAWYER': return 'Legal Partner';
      default: return 'Enterprise Client';
    }
  };

  const roleLabel = getRoleLabel(userRole);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await signOut();
  };

  const filtered = searchQuery.trim() === ''
    ? SEARCH_ITEMS
    : SEARCH_ITEMS.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const getSearchIcon = (category: string) => {
    switch (category) {
      case 'settings': return <Sliders className="w-4 h-4 text-indigo-500" />;
      case 'tasks': return <CheckCircle2 className="w-4 h-4 text-amber-500" />;
      default: return <FileText className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <>
      <header 
        className="top-navigation-bar-container h-14 w-full max-w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-2 sm:px-3 md:px-4 sticky top-0 z-40 shadow-xs shrink-0"
        id="main-topbar-header"
      >
        
        {/* Left side: Mobile Toggle, Tenancy Workspace Switcher & Persona Topbar Nav */}
        <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 shrink">
          {/* Mobile Hamburger Navigation Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all shrink-0 flex items-center justify-center w-9 h-9 cursor-pointer border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
            title="Open Mobile Navigation Menu"
            id="mobile-nav-hamburger-toggle"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </button>
          
          {/* Tenancy Workspace Switcher */}
          <TenancyWorkspaceSwitcher activePath={activePath} onNavigate={onNavigate} />

          {/* Persona Topbar Navigation & Quick Action Tools (SaaS Admin, Regulator, Client, Lawyer) */}
          <PersonaTopbarNav activePath={activePath} onNavigate={onNavigate} />
        </div>

        {/* Right side: Search, Status, Actions, Profile */}
        <div className="flex items-center space-x-0.5 sm:space-x-1.5 min-w-0 justify-end shrink">
          
          {/* Vector & Graph DB Background Sync Progress Indicator - SaaS Admin Only */}
          {(activeRole === 'SUPER_ADMIN' || activeRole === 'ADMIN') && (
            <VectorSyncIndicator />
          )}

          {/* Auto-Save Status Indicator */}
          <div className="hidden md:flex items-center shrink-0">
            <AutoSaveIndicator />
          </div>

          {/* Global Search - SaaS Admin Only */}
          {(activeRole === 'SUPER_ADMIN' || activeRole === 'ADMIN') && (
            <>
              {/* Global Search (Mobile / Compact) */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-1 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 rounded-xl transition-all shrink-0 flex items-center justify-center w-9 h-9 cursor-pointer"
                title="Search... (Ctrl+K)"
                id="mobile-search-btn"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Global Search (Desktop responsive) */}
              <div className="hidden md:flex relative shrink" ref={searchRef}>
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Search... (Ctrl+K)" 
                  className="pl-7 pr-2.5 py-1 h-8 w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40 focus:w-36 md:focus:w-40 lg:focus:w-48 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  id="topbar-search-input"
                />
                
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50 max-h-[360px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Query Results ({filtered.length})</span>
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsSearchOpen(true);
                        }}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Advanced Search (Ctrl+K)
                      </button>
                    </div>
                    
                    {filtered.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                        No matching logs, tasks, or settings
                      </div>
                    ) : (
                      <div className="py-1">
                        {filtered.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              onNavigate(item.path);
                              setIsDropdownOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-2.5 transition-colors group"
                          >
                            <div className="mt-0.5 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                              {getSearchIcon(item.category)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">{item.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium capitalize mt-0.5">{item.type}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tenant Health & Integrity Status Badge */}
          <div className="hidden 2xl:flex items-center shrink-0">
            <TenantHealthStatus 
              activeContextName={activeContextName} 
              onNavigate={onNavigate} 
            />
          </div>

          {/* Data Residency Indicator (Pinned) */}
          <div className="hidden 2xl:flex items-center space-x-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg cursor-help text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0" title="Data residence strictly bound to European Union Sovereign Enclave">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-[10px]">EU-CENTRAL-1</span>
          </div>

          {/* Regional Context Switcher */}
          <div className="hidden 2xl:flex items-center shrink-0">
            {activeRole === 'SUPER_ADMIN' || activeRole === 'ADMIN' ? (
              <EuropeanJurisdictionSwitcher />
            ) : (
              <div 
                id="static-jurisdiction-indicator"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
              >
                {selectedCountryCode ? (
                  <>
                    <CountryFlag countryCode={selectedCountryCode} className="w-4 h-4 shrink-0 rounded" />
                    <span>
                      {EUROPEAN_REGULATORS.find(r => r.countryCode === selectedCountryCode)?.countryName || selectedCountryCode}
                    </span>
                  </>
                ) : (
                  <>
                    <CountryFlag countryCode="BD" className="w-4 h-4 shrink-0 rounded" />
                    <span>Global Region (Telecom Regulatory Authority / CID)</span>
                  </>
                )}
                <span className="text-[9px] px-1 py-0.2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded font-mono font-bold uppercase">
                  Active Region
                </span>
              </div>
            )}
          </div>

          {/* Verification Status */}
          <div className="hidden 2xl:flex items-center shrink-0">
            <VerificationBadge 
              status={(user?.user_metadata?.verificationStatus as 'Verified' | 'Pending' | 'Action Required') || 'Verified'} 
              onClick={() => setIsModalOpen(true)}
            />
          </div>

          <div className="hidden 2xl:flex items-center shrink-0">
            <LiveComplianceBadges />
          </div>

          {/* Quick Zero-Downtime Integrations Hub Button */}
          <button
            onClick={() => onNavigate('integrations')}
            className="hidden 2xl:flex items-center space-x-1.5 px-2.5 py-1 bg-indigo-50/80 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold rounded-lg border border-indigo-200/80 dark:border-indigo-800/60 transition-all text-xs cursor-pointer shadow-xs group shrink-0"
            title="Open Sovereign Zero-Downtime Integration Hub & Cloud Connectors"
            id="topbar-integrations-quick-btn"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span className="text-[11px] font-bold">Integrations</span>
            <span className="px-1 py-0.2 text-[9px] bg-indigo-200/60 dark:bg-indigo-800/80 text-indigo-900 dark:text-indigo-100 rounded font-mono font-bold">9-in-1</span>
          </button>

          {isModalOpen && (
            <VerificationDetailsModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              session={session}
            />
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-8 sm:h-8 p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0"
            title={themeMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            id="theme-toggle-button"
            aria-label="Toggle Theme"
          >
            {themeMode === 'light' ? (
              <Moon className="w-4.5 h-4.5 sm:w-4 sm:h-4 text-slate-600 hover:text-slate-800" />
            ) : (
              <Sun className="w-4.5 h-4.5 sm:w-4 sm:h-4 text-amber-400 hover:text-amber-300" />
            )}
          </button>

          {/* Layout Scale & Density Selector */}
          <div className="hidden lg:block relative shrink-0" ref={densityMenuRef}>
            <button
              onClick={() => setIsDensityMenuOpen(!isDensityMenuOpen)}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 py-1 h-8 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-all text-xs cursor-pointer shadow-2xs shrink-0"
              title="Layout Scaling & Viewport Density"
              id="layout-density-switcher-btn"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden xl:inline text-[11px] font-bold text-slate-700 dark:text-slate-200">
                {currentDensity === 'slim-fit' ? 'Slim Fit' : currentDensity === 'screen-to-fit' ? 'Screen to Fit' : 'Comfortable'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            
            {isDensityMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase">Layout Density & Scale</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Adjust dashboard size for your screen</p>
                </div>
                <div className="py-1">
                  {[
                    { id: 'standard', name: 'Comfortable', desc: 'Standard 100% spacious view', icon: '🔍' },
                    { id: 'slim-fit', name: 'Slim Fit', desc: '90% sleek & compact cards', icon: '✨' },
                    { id: 'screen-to-fit', name: 'Screen to Fit', desc: 'Viewport-locked dashboard layout', icon: '🖥️' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentDensity(item.id as any);
                        localStorage.setItem('ui_layout_density', item.id);
                        window.dispatchEvent(new CustomEvent('change-ui-density', { detail: item.id }));
                        setIsDensityMenuOpen(false);
                        showToast(`Layout changed to ${item.name}`, 'success');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">{item.icon}</span>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{item.name}</span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 leading-normal">{item.desc}</span>
                        </div>
                      </div>
                      {currentDensity === item.id && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Global Jurisdiction Switcher */}
          <div className="hidden lg:block relative shrink-0" ref={jurisdictionMenuRef}>
            <button
              onClick={() => setIsJurisdictionMenuOpen(!isJurisdictionMenuOpen)}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 py-1 h-8 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-all text-xs cursor-pointer shadow-2xs shrink-0"
              title="Switch Global Jurisdiction Framework"
              id="jurisdiction-switcher-btn"
            >
              <span className="text-xs">{countries.find(c => c.code === country)?.flag || '🌍'}</span>
              <span className="hidden xl:inline text-[11px] font-bold text-slate-700 dark:text-slate-200">{countries.find(c => c.code === country)?.name}</span>
              <span className="xl:hidden text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono">{country}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            
            {isJurisdictionMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 sm:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase">Global Jurisdiction</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Determines dynamic policy check contexts</p>
                </div>
                <div className="py-1 max-h-64 overflow-y-auto">
                  {countries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCountry(c.code);
                        setIsJurisdictionMenuOpen(false);
                        showToast(`Jurisdiction switched to ${c.name} (${c.jurisdiction})`, 'success');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{c.flag}</span>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{c.name}</span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">{c.frameworkName} ({c.jurisdiction})</span>
                        </div>
                      </div>
                      {country === c.code && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Premium Language Dropdown (Desktop/Tablet) */}
          <div className="hidden md:block relative shrink-0" ref={languageMenuRef}>
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="flex items-center justify-center sm:justify-start space-x-1 px-1.5 sm:px-2 py-1 h-9 sm:h-8 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-semibold rounded-xl sm:rounded-lg border border-slate-200/80 dark:border-slate-700 transition-all text-xs cursor-pointer shadow-2xs shrink-0"
              title={t('select_language')}
              id="language-switcher-btn"
            >
              <Globe className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-indigo-500" />
              <span className="hidden sm:inline-block text-[11px] font-bold uppercase">{language === 'bn' ? 'বাংলা' : language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>
            
            {isLanguageMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-slate-950/20 z-40 sm:hidden"
                  onClick={() => setIsLanguageMenuOpen(false)}
                />
                <div className="fixed sm:absolute right-3 sm:right-0 top-15 sm:top-full mt-1.5 w-44 sm:w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">{t('language')}</p>
                  </div>
                  <div className="py-1">
                    {([
                      { code: 'en', label: 'English' },
                      { code: 'bn', label: 'বাংলা (Bengali)' },
                      { code: 'de', label: 'Deutsch' },
                      { code: 'fr', label: 'Français' },
                      { code: 'es', label: 'Español' },
                      { code: 'it', label: 'Italiano' },
                      { code: 'ar', label: 'العربية (Arabic)' }
                    ] as { code: LanguageCode; label: string }[]).map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLanguageMenuOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <span>{lang.label}</span>
                        {language === lang.code && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="relative w-9 h-9 sm:w-8 sm:h-8 p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Open Regulatory Notification Stream"
            id="open-regulatory-notifications"
          >
            <Bell className="w-4.5 h-4.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold px-1 py-0.2 rounded-full border-2 border-white dark:border-slate-900 min-w-[15px] text-center flex items-center justify-center h-[15px]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative shrink-0" ref={profileMenuRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 p-1 sm:px-1.5 sm:py-0.5 h-9 sm:h-8 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 active:scale-95 transition-all cursor-pointer shrink-0"
              id="user-profile-btn"
              aria-label="User Account Menu"
            >
              <div className="w-7 h-7 sm:w-6.5 sm:h-6.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-inner shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden xl:flex flex-col items-start leading-tight">
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">{user?.email?.split('@')[0] || 'User Profile'}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden xl:block" />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-slate-950/20 z-40 sm:hidden"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="fixed sm:absolute right-3 sm:right-0 top-15 sm:top-full mt-1.5 w-[calc(100vw-24px)] sm:w-72 max-w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.email || 'User Account'}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Enterprise Sovereign Cloud</p>
                  </div>
                  
                  <div className="py-2">
                    <p className="px-4 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">Active Tenancy Workspace</p>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate('tenants');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-6 h-6 bg-slate-800 dark:bg-slate-700 rounded flex items-center justify-center shrink-0">
                          <Server className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">{activeTenant?.name || activeContextName}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{activeTenant?.region || 'Production Tenant'} • {activeTenant?.tier || 'Enterprise'}</p>
                        </div>
                      </div>
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 py-1.5 px-1 space-y-1">
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate('landing');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Public Landing Page</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Secure Disconnect</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      
      <GlobalSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onNavigate={onNavigate}
      />

      {/* Vertical Mobile Navigation Menu Drawer */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activePath={activePath || ''}
        onNavigate={onNavigate}
        role={activeRole}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
    </>
  );
};
