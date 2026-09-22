import React from 'react';
import { X, Award, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

export interface BadgeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  badgeName?: string;
  companyName?: string;
  status?: string;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  isOpen = true,
  onClose = () => {},
  badgeName = 'EU Sovereign Trust Seal',
  companyName = 'Sovereign RegTech Enterprise',
  status = 'Active & Valid (2026-2027)'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-4 text-center">
        <div className="flex justify-end">
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
            {badgeName}
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            W3C Verifiable Credential issued to <strong>{companyName}</strong>.
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 text-left text-xs font-mono space-y-1">
          <div className="text-slate-400 text-[10px]">ISSUER: Sovereign RegTech EU CA</div>
          <div className="text-indigo-600 dark:text-indigo-400 text-[10px] truncate">DID: did:key:z6Mkq429...89bfa</div>
          <div className="text-emerald-600 dark:text-emerald-400 text-[10px]">STATUS: {status}</div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
        >
          Close Verifiable Seal
        </button>
      </div>
    </div>
  );
};
export default BadgeModal;
