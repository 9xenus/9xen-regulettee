import React from 'react';
import { AlertCircle, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type MasqueradeMode = 'EU_REGULATOR' | 'CLIENT_TENANT';

interface MasqueradeBarProps {
  isActive: boolean;
  currentMode: MasqueradeMode;
  targetTenantName?: string;
  onSwitchMode: (mode: MasqueradeMode, targetTenantId?: string) => void;
  onExitMasquerade: () => void;
}

export function MasqueradeBar({
  isActive,
  currentMode,
  targetTenantName,
  onSwitchMode,
  onExitMasquerade
}: MasqueradeBarProps) {
  if (!isActive) return null;

  const modeLabels: Record<MasqueradeMode, string> = {
    EU_REGULATOR: 'EU Regulator',
    CLIENT_TENANT: 'Client Tenant View'
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="w-full bg-enterprise-amber border-b-2 border-orange-600 text-amber-950 px-4 py-2 flex items-center justify-between shadow-md z-50 sticky top-0"
      >
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-orange-700 animate-pulse" />
          <div>
            <span className="font-bold text-sm tracking-tightuppercase">Impersonation Mode Active</span>
            <span className="ml-2 pl-2 border-l border-amber-600 text-xs font-medium">
              Actions will be logged in the Compliance Ledger as a masquerade event.
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/30">
            <Eye className="w-3 h-3" />
            <span>Viewing as:</span>
            <select 
              value={currentMode}
              onChange={(e) => onSwitchMode(e.target.value as MasqueradeMode)}
              className="bg-transparent font-bold border-none focus:ring-0 cursor-pointer outline-none"
            >
              {Object.entries(modeLabels).map(([key, label]) => (
                <option key={key} value={key} className="text-slate-800">{label}</option>
              ))}
            </select>
            {currentMode === 'CLIENT_TENANT' && targetTenantName && (
              <span className="ml-1 text-orange-800">({targetTenantName})</span>
            )}
          </div>
          
          <button 
            onClick={onExitMasquerade}
            className="flex items-center space-x-1 bg-orange-700 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-orange-800 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Exit Session</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
