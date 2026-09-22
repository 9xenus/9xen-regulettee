import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { EnterpriseLayout } from './components/layout/EnterpriseLayout';
import { pageMap, PlatformDashboard } from './router';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { TenantProvider, useTenant } from './context/TenantContext';
import { JurisdictionProvider } from './context/JurisdictionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RegionalComplianceProvider } from './context/RegionalComplianceContext';
import { RegulatoryProvider } from './context/RegulatoryContext';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FloatingAiLegalAssistant } from './components/legal/FloatingAiLegalAssistant';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackRoute: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ModuleErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ModuleErrorBoundary] Caught render failure:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl text-center">
          <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-800 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">Module Execution Interrupted</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            The requested compliance module encountered an unexpected runtime fault. You can reload this enclave or return to the Platform Dashboard.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Retry Module
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                this.props.fallbackRoute();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingEnclaveFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
          <ShieldCheck className="w-6 h-6 animate-pulse" />
        </div>
        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin absolute -bottom-1 -right-1" />
      </div>
      <div className="text-xs font-mono uppercase tracking-widest text-slate-300">
        Loading Sovereign Enclave...
      </div>
      <div className="text-[11px] text-slate-500 mt-1 font-mono">
        Verifying cryptographic boundary &amp; zero-trust tokens
      </div>
    </div>
  );
}

function MainAppShell() {
  const { activeTenant } = useTenant();
  const { role, user, loading, session } = useAuth();

  // Initial route from URL hash or storage or default
  const [activePath, setActivePath] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    if (hash) return hash;
    return localStorage.getItem('9xen_active_route') || 'platform-dashboard';
  });

  // Sync route changes with URL hash
  const handleNavigate = (newPath: string) => {
    setActivePath(newPath);
    localStorage.setItem('9xen_active_route', newPath);
    window.location.hash = `#${newPath}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to hash changes (browser back/forward & direct links)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (hash && hash !== activePath) {
        setActivePath(hash);
        localStorage.setItem('9xen_active_route', hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activePath]);

  // Listen for custom navigation events
  useEffect(() => {
    const handleCustomNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<string | { path: string }>;
      const target = typeof customEvent.detail === 'string' ? customEvent.detail : customEvent.detail?.path;
      if (target) {
        handleNavigate(target);
      }
    };

    window.addEventListener('navigate', handleCustomNavigate as EventListener);
    window.addEventListener('navigate-to-route', handleCustomNavigate as EventListener);

    return () => {
      window.removeEventListener('navigate', handleCustomNavigate as EventListener);
      window.removeEventListener('navigate-to-route', handleCustomNavigate as EventListener);
    };
  }, []);

  // Resolve component dynamically
  const ResolvedComponent = useMemo<React.ComponentType<any>>(() => {
    if (!activePath) return PlatformDashboard as any;

    // 1. Direct match
    if (pageMap[activePath]) {
      return pageMap[activePath];
    }

    // 2. Kebab-case or lower-case normalized match
    const cleanKey = activePath.toLowerCase().replace(/[-_]/g, '');
    for (const [key, comp] of Object.entries(pageMap)) {
      if (key.toLowerCase().replace(/[-_]/g, '') === cleanKey) {
        return comp;
      }
    }

    // 3. Fallback to PlatformDashboard
    return PlatformDashboard as any;
  }, [activePath]);

  // Check if active route is a public standalone page
  const isStandalonePage = useMemo(() => {
    const p = (activePath || '').toLowerCase().replace(/[-_]/g, '');
    return (
      p === 'landing' || 
      p === 'landingpage' || 
      p === 'home' || 
      p === 'login' || 
      p === 'loginpage' || 
      p === 'registration' || 
      p === 'registrationpage' || 
      p === 'register' ||
      p === 'gateway' ||
      p === 'gatewaypage'
    );
  }, [activePath]);

  // Handle unauthenticated state for non-standalone pages
  useEffect(() => {
    if (!loading && !session && !user && !isStandalonePage) {
      // If we are on a protected route but not logged in, redirect to login/landing
      // But only if we are not already on a standalone page
      console.log('[MainAppShell] Unauthenticated access to protected route, redirecting...');
      // handleNavigate('landing'); 
    }
  }, [loading, session, user, isStandalonePage]);

  if (loading) {
    return <LoadingEnclaveFallback />;
  }

  if (isStandalonePage) {
    return (
      <ModuleErrorBoundary fallbackRoute={() => handleNavigate('landing')}>
        <Suspense fallback={<LoadingEnclaveFallback />}>
          <ResolvedComponent 
            onLogin={() => handleNavigate('gateway')} 
            onNavigate={handleNavigate}
            navigate={handleNavigate}
            onAuthenticated={() => {}} // AuthContext handles role sync now
          />
        </Suspense>
      </ModuleErrorBoundary>
    );
  }

  return (
    <>
      <EnterpriseLayout
        activePath={activePath}
        onNavigate={handleNavigate}
        role={role}
        activeContextName={activeTenant?.name || 'Sovereign Core'}
      >
        <ModuleErrorBoundary fallbackRoute={() => handleNavigate('platform-dashboard')}>
          <Suspense fallback={<LoadingEnclaveFallback />}>
            <ProtectedRoute componentId={activePath} onNavigate={handleNavigate}>
              <ResolvedComponent onNavigate={handleNavigate} />
            </ProtectedRoute>
          </Suspense>
        </ModuleErrorBoundary>
      </EnterpriseLayout>
      <FloatingAiLegalAssistant />
    </>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <LanguageProvider>
        <TenantProvider>
          <JurisdictionProvider>
            <AuthProvider>
              <RegionalComplianceProvider>
                <RegulatoryProvider>
                  <MainAppShell />
                </RegulatoryProvider>
              </RegionalComplianceProvider>
            </AuthProvider>
          </JurisdictionProvider>
        </TenantProvider>
      </LanguageProvider>
    </NotificationProvider>
  );
}
