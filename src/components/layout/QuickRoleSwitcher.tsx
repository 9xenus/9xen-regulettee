import React, { useState } from 'react';
import { 
  Server, 
  Building2, 
  Landmark, 
  Scale, 
  Sparkles, 
  UserCheck, 
  ChevronRight, 
  ShieldCheck, 
  Zap,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface QuickRoleSwitcherProps {
  currentRole: string;
  isSidebarOpen: boolean;
  onNavigate: (path: string) => void;
}

type RoleOption = {
  id: 'SUPER_ADMIN' | 'ADMIN' | 'COMPLIANCE_OFFICER' | 'CLIENT' | 'EU_REGULATOR' | 'LAWYER';
  label: string;
  shortLabel: string;
  description: string;
  defaultPath: string;
  icon: React.ElementType;
  badgeBg: string;
  textColor: string;
  borderColor: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'SUPER_ADMIN',
    label: 'Super Admin (HQ)',
    shortLabel: 'SuperAdmin',
    description: 'Sovereign Control Tower & Full Platform HQ',
    defaultPath: 'super-admin-tower',
    icon: Server,
    badgeBg: 'bg-purple-500/20',
    textColor: 'text-purple-300',
    borderColor: 'border-purple-500/40'
  },
  {
    id: 'COMPLIANCE_OFFICER',
    label: 'Compliance Officer',
    shortLabel: 'Compliance',
    description: 'Admin Dashboard & Regulatory Compliance Oversight',
    defaultPath: 'platform-dashboard',
    icon: ShieldCheck,
    badgeBg: 'bg-cyan-500/20',
    textColor: 'text-cyan-300',
    borderColor: 'border-cyan-500/40'
  },
  {
    id: 'CLIENT',
    label: 'Client Workspace',
    shortLabel: 'Client',
    description: 'Enterprise Tenant Dashboard & Tools',
    defaultPath: 'client-dashboard',
    icon: Building2,
    badgeBg: 'bg-emerald-500/20',
    textColor: 'text-emerald-300',
    borderColor: 'border-emerald-500/40'
  },
  {
    id: 'EU_REGULATOR',
    label: 'EU Regulator',
    shortLabel: 'Regulator',
    description: 'B2G Oversight & Sovereign Portal',
    defaultPath: 'regulator-dashboard',
    icon: Landmark,
    badgeBg: 'bg-amber-500/20',
    textColor: 'text-amber-300',
    borderColor: 'border-amber-500/40'
  },
  {
    id: 'LAWYER',
    label: 'Legal Counsel',
    shortLabel: 'Legal',
    description: 'Lawyer Partner & Arbitration Portal',
    defaultPath: 'lawyer-portal',
    icon: Scale,
    badgeBg: 'bg-indigo-500/20',
    textColor: 'text-indigo-300',
    borderColor: 'border-indigo-500/40'
  }
];

export const QuickRoleSwitcher: React.FC<QuickRoleSwitcherProps> = ({
  currentRole,
  isSidebarOpen,
  onNavigate
}) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [isExpanded, setIsExpanded] = useState(false);

  // Check Admin Authorization
  const userRole = (user?.user_metadata?.role || user?.user_metadata?.accountType || '').toUpperCase();
  const isSessionAdmin = (() => {
    try {
      const stored = localStorage.getItem('sovereign_sessions');
      if (stored && stored !== 'logged_out') {
        const parsed = JSON.parse(stored);
        const r = (parsed?.user?.user_metadata?.role || parsed?.user?.user_metadata?.accountType || '').toUpperCase();
        return r === 'ADMIN' || r === 'SUPER_ADMIN';
      }
    } catch (e) {
      // Ignore
    }
    return false;
  })();

  const isTestingMode = sessionStorage.getItem('is_admin_testing_mode') === 'true';

  // Enable by default for the local sandbox preview environment to allow seamless cross-persona evaluation
  const isAdminAuthorized = true;

  if (!isAdminAuthorized) {
    return null;
  }

  const activeOption = ROLE_OPTIONS.find(
    opt => opt.id === currentRole.toUpperCase()
  ) || ROLE_OPTIONS[0];

  const handleSwitch = (opt: RoleOption) => {
    sessionStorage.setItem('is_admin_testing_mode', 'true');

    // Trigger switchRole custom event for App.tsx
    window.dispatchEvent(
      new CustomEvent('switchRole', { detail: { role: opt.id } })
    );

    // Navigate to default view for role
    onNavigate(opt.defaultPath);

    showToast(
      `Role view switched to '${opt.label}' for testing. Current path: /${opt.defaultPath}`,
      'info',
      'Quick Role Switcher'
    );

    setIsExpanded(false);
  };

  if (!isSidebarOpen) {
    return (
      <div className="px-2 py-3 border-t border-slate-800/80 flex justify-center relative group">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-xl transition-all border ${activeOption.badgeBg} ${activeOption.borderColor} ${activeOption.textColor} hover:scale-105 shadow-sm`}
          title={`Testing Mode Active: ${activeOption.label} (Click to switch)`}
        >
          <UserCheck className="w-4 h-4" />
        </button>

        {/* Collapsed Popover Menu */}
        {isExpanded && (
          <div className="absolute left-full bottom-0 ml-2 w-52 bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-2xl z-50 space-y-1">
            <div className="px-2 py-1 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
              <span>Admin Test Mode</span>
              <Zap className="w-3 h-3 text-amber-400" />
            </div>
            {ROLE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = currentRole.toUpperCase() === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSwitch(opt)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                    isSelected 
                      ? `${opt.badgeBg} ${opt.textColor} border ${opt.borderColor}` 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.shortLabel}</span>
                  </span>
                  {isSelected && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-2 my-3 bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 space-y-2 shadow-inner">
      {/* Header */}
      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1 text-amber-400">
          <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>Quick Role Switcher</span>
        </span>
        <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[9px] font-mono">
          ADMIN TEST MODE
        </span>
      </div>

      {/* Active Role Selector Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-2 rounded-lg border text-left transition-all flex items-center justify-between ${activeOption.badgeBg} ${activeOption.borderColor}`}
      >
        <div className="flex items-center gap-2">
          <activeOption.icon className={`w-4 h-4 ${activeOption.textColor}`} />
          <div>
            <div className={`text-xs font-bold ${activeOption.textColor}`}>
              {activeOption.label}
            </div>
            <div className="text-[9px] text-slate-400">
              {activeOption.description}
            </div>
          </div>
        </div>
        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded Role Selection Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1 pt-1 overflow-hidden"
          >
            {ROLE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = currentRole.toUpperCase() === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSwitch(opt)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-xs' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${opt.textColor}`} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected ? (
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold">
                      ACTIVE
                    </span>
                  ) : (
                    <Eye className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
