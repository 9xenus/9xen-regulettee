import React from 'react';
import { X, ShieldCheck, Database, Layers, Lock, CheckCircle2 } from 'lucide-react';

interface CategoryDrillDownModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  categoryName?: string;
  categoryKey?: string;
  records?: any[];
  [key: string]: any;
}

export const CategoryDrillDownModal: React.FC<CategoryDrillDownModalProps> = ({
  isOpen = true,
  onClose = () => {},
  categoryName = 'Biometric & Special Category Data'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{categoryName}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">GDPR Article 9 & 30 Lineage Inspection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Legal Processing Basis:</span>
              <span className="font-bold text-slate-900 dark:text-white">Art. 9(2)(a) Explicit Consent</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cryptographic Standard:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">ML-KEM-768 Enclave Vault</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Retention Period:</span>
              <span className="font-bold text-slate-900 dark:text-white">90 Days (Automated Shredding)</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CategoryDrillDownModal;
