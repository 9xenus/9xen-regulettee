import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { VerificationBanner } from './VerificationBanner';
import { SystemStatusBanner } from './SystemStatusBanner';
import { RegulatoryNotificationSidebar } from './RegulatoryNotificationSidebar';
import { QuickSwitchModal } from '../dashboard/QuickSwitchModal';
import { CommandPalette } from './CommandPalette';
import { QuickActionMenu } from './QuickActionMenu';
import { FloatingComplianceWidget } from './FloatingComplianceWidget';
import { FloatingComplianceAsk } from './FloatingComplianceAsk';
import { TourModal } from '../TourModal';
import { RegulatorySearchModal } from '../RegulatorySearchModal';
import { useFeatureMask, FeatureMask, getNormalizedRole } from './FeatureMaskingMiddleware';
import { AccessDenied } from '../AccessDenied';
import { useAuth } from '../../context/AuthContext';

import { OfflineBanner } from './OfflineBanner';
import { SessionTimeoutModal } from './SessionTimeoutModal';
import { 
  Home, 
  Shield, 
  Lock, 
  Scale, 
  Settings, 
  Sliders, 
  Zap, 
  AlertTriangle, 
  FileText, 
  Gavel, 
  Building2 
} from 'lucide-react';

interface EnterpriseLayoutProps {
  children: React.ReactNode;
  activePath: string;
  onNavigate: (path: string) => void;
  role?: string;
  activeContextName: string;
}

export const EnterpriseLayout: React.FC<EnterpriseLayoutProps> = ({ 
  children, 
  activePath,
  onNavigate,
  role: propRole,
  activeContextName
}) => {
  const { role: contextRole, user, hasRole, hasPermission } = useAuth();
  
  // Resolve effective active user role based on context or props
  const rawRole = propRole || contextRole || user?.user_metadata?.role || user?.user_metadata?.accountType || 'CLIENT';
  const effectiveRole = getNormalizedRole(rawRole);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isQuickSwitchOpen, setIsQuickSwitchOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isRegulatorySearchOpen, setIsRegulatorySearchOpen] = useState(false);
  
  // Support custom layout scale and density modes (Comfortable, Slim Fit, Screen-to-Fit)
  const [density, setDensity] = useState<'standard' | 'slim-fit' | 'screen-to-fit'>(() => {
    return (localStorage.getItem('ui_layout_density') as any) || 'slim-fit';
  });

  const { hasAccess } = useFeatureMask(effectiveRole);
  const isAuthorized = hasAccess(activePath);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    localStorage.setItem('ui_layout_density', density);
  }, [density]);

  // Sync listener for global scale changes
  useEffect(() => {
    const handleDensityChange = (e: Event) => {
      const customEvent = e as CustomEvent<'standard' | 'slim-fit' | 'screen-to-fit'>;
      if (customEvent && customEvent.detail) {
        setDensity(customEvent.detail);
      }
    };
    window.addEventListener('change-ui-density', handleDensityChange as EventListener);
    return () => {
      window.removeEventListener('change-ui-density', handleDensityChange as EventListener);
    };
  }, []);

  const densityClass = density === 'slim-fit' 
    ? 'ui-density-slim-fit' 
    : density === 'screen-to-fit' 
      ? 'ui-density-screen-to-fit ui-density-slim-fit' 
      : 'ui-density-standard';

  // Mobile Nav config based on active persona role to transform into a sleek web app
  const getMobileNavItems = () => {
    switch (effectiveRole) {
      case 'ADMIN':
        return [
          { id: 'home', label: 'Tenants', path: 'tenants', icon: Building2 },
          { id: 'rbac', label: 'Roles', path: 'rbac', icon: Sliders },
          { id: 'engine', label: 'Engine', path: 'engine', icon: Zap },
          { id: 'billing', label: 'Plan', path: 'entitlements', icon: Shield },
          { id: 'settings', label: 'Settings', path: 'settings', icon: Settings },
        ];
      case 'EU_REGULATOR':
        return [
          { id: 'home', label: 'Home', path: 'regulator-dashboard', icon: Home },
          { id: 'fines', label: 'Fines', path: 'violations', icon: AlertTriangle },
          { id: 'appeals', label: 'Appeals', path: 'ai-transparency', icon: Shield },
          { id: 'ledger', label: 'Ledger', path: 'audit-ledger', icon: Lock },
          { id: 'settings', label: 'Settings', path: 'settings', icon: Settings },
        ];
      case 'LAWYER':
        return [
          { id: 'home', label: 'Home', path: 'lawyer-portal', icon: Home },
          { id: 'alae', label: 'Arbitrate', path: 'alae-dashboard', icon: Gavel },
          { id: 'tia', label: 'TIA', path: 'tia-simulator', icon: FileText },
          { id: 'dossiers', label: 'Dossiers', path: 'launch-tracker', icon: Shield },
          { id: 'settings', label: 'Settings', path: 'settings', icon: Settings },
        ];
      case 'CLIENT':
      default:
        return [
          { id: 'home', label: 'Home', path: 'client-dashboard', icon: Home },
          { id: 'hub', label: 'Hub', path: 'compliance-hub', icon: Shield },
          { id: 'dsar', label: 'DSAR', path: 'dsar-portal', icon: FileText },
          { id: 'vault', label: 'Vault', path: 'evidence-vault', icon: Lock },
          { id: 'settings', label: 'Settings', path: 'settings', icon: Settings },
        ];
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // 1. Ctrl+K or Cmd+K for Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [effectiveRole]);

  // Handle custom trigger events for quick role switch (least-privilege check)
  useEffect(() => {
    const handleOpenEvent = () => {
      const isAdmin = effectiveRole === 'ADMIN' || sessionStorage.getItem('is_admin_testing_mode') === 'true';
      if (isAdmin) {
        setIsQuickSwitchOpen(true);
      }
    };
    window.addEventListener('open-quick-switch', handleOpenEvent);
    return () => window.removeEventListener('open-quick-switch', handleOpenEvent);
  }, [effectiveRole]);

  // Handle custom open-sidebar event
  useEffect(() => {
    const handleOpenSidebar = () => {
      setIsSidebarOpen(true);
    };
    window.addEventListener('open-sidebar', handleOpenSidebar);
    return () => window.removeEventListener('open-sidebar', handleOpenSidebar);
  }, []);

  useEffect(() => {
    const handleOpenRegSearch = () => setIsRegulatorySearchOpen(true);
    window.addEventListener('open-regulatory-search', handleOpenRegSearch);
    return () => window.removeEventListener('open-regulatory-search', handleOpenRegSearch);
  }, []);

  return (
    <div className={`w-full h-screen max-w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex overflow-hidden relative ${densityClass}`}>
      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        activePath={activePath}
        onNavigate={onNavigate}
        role={effectiveRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen max-w-full overflow-hidden relative">
        <SystemStatusBanner />
        <OfflineBanner />
        <VerificationBanner />
        {/* Top Header */}
        <Topbar 
          toggleSidebar={toggleSidebar} 
          activeContextName={activeContextName}
          onNavigate={onNavigate}
          role={effectiveRole}
          activePath={activePath}
        />

        {/* Page Content with Least-Privilege Route Access Middleware */}
        <main 
          id="main-app-content-viewport"
          className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-950 relative p-3.5 sm:p-5 lg:p-6 pb-20 md:pb-6"
        >
          {isAuthorized ? children : <AccessDenied onNavigate={onNavigate} activeRole={effectiveRole} />}
        </main>

        {/* Mobile App View Bottom Tab Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-around px-4 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] pb-safe">
          {getMobileNavItems().map((item) => {
            const IconComponent = item.icon;
            const isItemActive = Boolean(activePath === item.path || (item.path !== '' && activePath?.startsWith(item.path)));
            return (
              <button
                key={item.id}
                onClick={() => {
                  try { navigator.vibrate(15); } catch {}
                  onNavigate(item.path);
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 relative text-[10px] font-bold transition-all cursor-pointer ${
                  isItemActive 
                    ? 'text-indigo-600 dark:text-indigo-400 scale-105' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <div className="relative p-1 rounded-xl transition-all">
                  <IconComponent className={`w-5 h-5 ${isItemActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                  {isItemActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-[9px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 z-30 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={onNavigate}
      />

      <RegulatorySearchModal
        isOpen={isRegulatorySearchOpen}
        onClose={() => setIsRegulatorySearchOpen(false)}
      />

      {/* Sensitive Quick-Switch Testing Tool: Restricted strictly to ADMIN & SUPER_ADMIN */}
      <FeatureMask allowedRoles={['ADMIN', 'SUPER_ADMIN']} activeRole={effectiveRole}>
        <QuickSwitchModal
          isOpen={isQuickSwitchOpen}
          onClose={() => setIsQuickSwitchOpen(false)}
          onSwitchRole={(targetRole, _targetTenantId, targetPath) => {
            sessionStorage.setItem('is_admin_testing_mode', 'true');
            window.dispatchEvent(new CustomEvent('switchRole', { detail: { role: targetRole } }));
            if (targetPath) {
              onNavigate(targetPath);
            } else {
              const defaultPaths: Record<string, string> = {
                'ADMIN': 'sudou',
                'CLIENT': 'client-dashboard',
                'EU_REGULATOR': 'regulator-dashboard',
                'LAWYER': 'lawyer-portal'
              };
              if (defaultPaths[targetRole]) onNavigate(defaultPaths[targetRole]);
            }
            setIsQuickSwitchOpen(false);
          }}
        />
      </FeatureMask>

      <RegulatoryNotificationSidebar />
      <FloatingComplianceWidget onNavigate={onNavigate} activeContextName={activeContextName} />
      <FloatingComplianceAsk />
      <QuickActionMenu onNavigate={onNavigate} role={effectiveRole} />
      <TourModal role={effectiveRole} />
      <SessionTimeoutModal />
    </div>
  );
};

