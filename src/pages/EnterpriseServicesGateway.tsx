import React from 'react';
import { Building2, UserCheck, TrendingUp, ShieldCheck, Fingerprint, ArrowRight, Lock, Globe2 } from 'lucide-react';

interface Props { onNavigate?: (path: string) => void; activeRole?: string; }

export const EnterpriseServicesGateway: React.FC<Props> = ({ onNavigate, activeRole = 'SUPER_ADMIN' }) => {
  const go = (p: string) => { if (onNavigate) onNavigate(p); else { window.location.hash = `#${p}`; window.dispatchEvent(new CustomEvent('navigate', { detail: p })); } };

  const CATALOG = [
    { id: 'company-network', path: 'company-network', icon: Building2, title: 'AI Company Network', desc: 'LinkedIn-style KYB directory with AI profiling, tiering, and cross-border intelligence.' },
    { id: 'verification-hub', path: 'verification-hub', icon: UserCheck, title: 'AI Verification Hub', desc: 'Person sanctions/PEP screening, company registry KYB, and document forensics with AI scoring.' },
    { id: 'predictive-intelligence', path: 'predictive-intelligence', icon: TrendingUp, title: 'Predictive Trading Intelligence', desc: 'Composite BUY/SELL/HOLD signals across EU firms with momentum, RSI, and catalyst analysis.' },
    { id: 'cybersecurity', path: 'cybersecurity', icon: ShieldCheck, title: 'Sovereign Cybersecurity', desc: 'NIS2 posture, monitoring, and incident response for the enterprise estate.' },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 opacity-10"><Globe2 className="w-48 h-48" /></div>
        <div className="relative space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-indigo-300">
            <Fingerprint className="w-4 h-4" /> AI-SSO SCORED SESSION · {activeRole}
          </div>
          <h2 className="text-xl font-black">Enterprise Services Gateway</h2>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Sovereign services for enterprise customers — AI-operated company network, identity & document verification, and predictive trading intelligence. Built-in, not bolted on.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-300">
            <span>Gateway authorized by AI-SSO</span>
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Scoped per service section</span>
            <span>Session routed via 9Xen sovereign runtime</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {CATALOG.map(c => (
          <button key={c.id} onClick={() => go(c.path)}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-indigo-300 hover:shadow-md transition cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><c.icon className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">{c.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
        <div>
          <span className="font-black text-indigo-700">Enterprise SSO is live.</span> Provisioned under SaaS Admin → Built-in SSO. Launch users from any service section here.
        </div>
        <button onClick={() => go('enterprise-services')} className="shrink-0 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
          <Fingerprint className="w-3.5 h-3.5" /> Launch AI-SSO
        </button>
      </div>
    </div>
  );
};

export default EnterpriseServicesGateway;