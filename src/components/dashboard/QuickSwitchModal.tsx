import React from 'react';
import { X, ShieldCheck, Users, Scale, Briefcase } from 'lucide-react';

interface QuickSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRole: (targetRole: string, targetTenantId?: string, targetPath?: string) => void;
}

export const QuickSwitchModal: React.FC<QuickSwitchModalProps> = ({ isOpen, onClose, onSwitchRole }) => {
  if (!isOpen) return null;

  const roles = [
    { id: 'SUPER_ADMIN', label: 'Super Administrator', desc: 'Full sovereign platform control & root telemetry', icon: ShieldCheck, path: 'platform-dashboard' },
    { id: 'ADMIN', label: 'Tenant Administrator', desc: 'Enterprise organizational management & policies', icon: Users, path: 'platform-dashboard' },
    { id: 'CLIENT', label: 'Client / DPO', desc: 'Evidence vault, automated scans, & DSARs', icon: Briefcase, path: 'client-dashboard' },
    { id: 'EU_REGULATOR', label: 'EU Regulator Auditor', desc: 'B2G statutory oversight & inspection enclaves', icon: Scale, path: 'regulator-dashboard' },
    { id: 'LAWYER', label: 'Legal Counsel & Partner', desc: 'Statutory legal diffs & ALSP execution studio', icon: Scale, path: 'lawyer-portal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Quick Role Switcher</h3>
        <p className="text-xs text-slate-400 mb-4">Switch sovereign context persona for live inspection.</p>

        <div className="space-y-2">
          {roles.map(r => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                onClick={() => onSwitchRole(r.id, undefined, r.path)}
                className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-750 hover:border-indigo-500/50 transition-all flex items-start gap-3 cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-indigo-950/60 text-indigo-400 border border-slate-700">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white">{r.label}</div>
                  <div className="text-[11px] text-slate-400">{r.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
