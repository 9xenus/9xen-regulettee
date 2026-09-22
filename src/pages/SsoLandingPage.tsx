import React, { useEffect, useState } from 'react';
import { ShieldCheck, Loader2, ArrowRight, Fingerprint } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SsoLandingPageProps {
  onNavigate?: (path: string) => void;
}

export const SsoLandingPage: React.FC<SsoLandingPageProps> = ({ onNavigate }) => {
  const { handleOAuthCallback } = useAuth();
  const [state, setState] = useState<'resolving' | 'done' | 'error'>('resolving');
  const [target, setTarget] = useState('enterprise-services');
  const [detail, setDetail] = useState('');

  const navigateTo = (path: string) => {
    if (onNavigate) onNavigate(path);
    else {
      window.location.hash = `#${path}`;
      window.dispatchEvent(new CustomEvent('navigate', { detail: path }));
    }
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const token = localStorage.getItem('sso_session_token');
        const profileRaw = localStorage.getItem('user_profile');
        // Refresh resilience: the SSO token is single-use ("consumed"). If a profile
        // already exists, restore the established session instead of hard-erroring.
        if (!token || token === 'consumed') {
          if (profileRaw) {
            let profile: any = null;
            try { profile = JSON.parse(profileRaw); } catch { profile = null; }
            if (profile?.email) {
              const role = (profile?.role || 'COMPLIANCE_OFFICER').toUpperCase();
              const route = localStorage.getItem('sso_target_route') || profile?.ssoService || 'enterprise-services';
              localStorage.setItem('user_role', role);
              localStorage.setItem('9xen_active_route', route);
              if (mounted) {
                setTarget(route);
                setState('done');
                window.dispatchEvent(new CustomEvent('role-changed', { detail: role }));
                setTimeout(() => navigateTo(route), 400);
              }
              return;
            }
          }
          if (mounted) { setState('error'); setDetail('No SSO session token present. Start from your enterprise identity provider or the SaaS Admin SSO launcher.'); }
          return;
        }
        setState('resolving');
        await handleOAuthCallback(token);
        let profile: any = null;
        try { profile = JSON.parse(localStorage.getItem('user_profile') || 'null'); } catch { profile = null; }
        const role = (profile?.role || 'COMPLIANCE_OFFICER').toUpperCase();
        const route = localStorage.getItem('sso_target_route') || profile?.ssoService || 'enterprise-services';
        localStorage.setItem('sso_session_token', 'consumed');
        localStorage.removeItem('sso_target_route');
        localStorage.setItem('user_role', role);
        localStorage.setItem('9xen_active_route', route);
        if (mounted) {
          setTarget(route);
          setState('done');
          window.dispatchEvent(new CustomEvent('role-changed', { detail: role }));
          setTimeout(() => navigateTo(route), 600);
        }
      } catch (err: any) {
        console.error('SSO landing error:', err);
        if (mounted) { setState('error'); setDetail(err.message || 'Session verification failed.'); }
      }
    };
    run();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleOAuthCallback]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        {state === 'resolving' && (
          <>
            <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
              <Fingerprint className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">AI-SSO Handshake</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">Resolving sovereign access • verifying signature • assigning service scopes</p>
            <div className="flex items-center justify-center gap-2 text-indigo-500 text-sm font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" /> Validating enterprise session token…
            </div>
          </>
        )}

        {state === 'done' && (
          <>
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">SSO Session Established</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">Identity verified. Scoped access granted. Redirecting to your enterprise service…</p>
            <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-bold">
              <Loader2 className="w-4 h-4 animate-spin" /> Opening <span className="font-mono">{target}</span> <ArrowRight className="w-4 h-4" />
            </div>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">SSO Handshake Failed</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">{detail}</p>
            <button
              onClick={() => navigateTo('landing')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold cursor-pointer"
            >
              Return to Gateway
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SsoLandingPage;