import React, { useState } from 'react';
import { Key, Copy, Check, X, ShieldAlert } from 'lucide-react';

interface RecoveryKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  recoveryKey: string;
}

export const RecoveryKeyModal: React.FC<RecoveryKeyModalProps> = ({ isOpen, onClose, recoveryKey }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-600 dark:text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Quantum Emergency Recovery Key</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Store this master key in an offline hardware security module (HSM). It will allow decrypting emergency backups if master key rotation fails.
        </p>

        <div className="p-3 bg-slate-900 text-amber-300 font-mono text-xs rounded-xl break-all border border-slate-800">
          {recoveryKey || 'PQC-REC-7f89a23c4d5e6f-KYBER1024-OFFLINE'}
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handleCopy}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Key'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white cursor-pointer"
          >
            I Have Saved Key Safely
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecoveryKeyModal;
