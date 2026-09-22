import React, { useState, useRef, useEffect } from 'react';
import { 
  Server, 
  Building2, 
  Landmark, 
  Scale, 
  ChevronDown, 
  Check, 
  ShieldCheck, 
  FileText, 
  Sliders, 
  CreditCard, 
  AlertTriangle, 
  Search, 
  BookOpen, 
  Layers, 
  Zap,
  Lock,
  ArrowUpRight,
  Gavel,
  ShieldAlert,
  FileCode2,
  Receipt,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface PersonaTopbarNavProps {
  activePath?: string;
  onNavigate: (path: string) => void;
}

export type PersonaRole = 'ADMIN' | 'EU_REGULATOR' | 'CLIENT' | 'LAWYER';

interface NavTool {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  color: string;
}

interface PersonaConfig {
  id: PersonaRole;
  title: string;
  shortLabel: string;
  badgeText: string;
  badgeStyle: string;
  borderStyle: string;
  accentBg: string;
  textColor: string;
  icon: React.ElementType;
  description: string;
  tools: NavTool[];
}

const PERSONA_CONFIGS: Record<PersonaRole, PersonaConfig> = {
  ADMIN: {
    id: 'ADMIN',
    title: 'SaaS Platform Admin HQ',
    shortLabel: 'SaaS Admin',
    badgeText: 'HQ Admin',
    badgeStyle: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    borderStyle: 'border-purple-500/30',
    accentBg: 'bg-purple-500',
    textColor: 'text-purple-600 dark:text-purple-400',
    icon: Server,
    description: 'System Management, Multi-Tenancy & Platform Entitlements',
    tools: [
      { id: 'tenants', label: 'Tenants', path: 'tenants', icon: Building2, badge: '12 Active', color: 'text-indigo-500' },
      { id: 'rbac', label: 'RBAC Roles', path: 'rbac', icon: Sliders, color: 'text-purple-500' },
      { id: 'engine', label: 'Engine Config', path: 'engine', icon: Zap, color: 'text-amber-500' },
      { id: 'entitlements', label: 'Billing & Plan', path: 'entitlements', icon: CreditCard, color: 'text-emerald-500' },
      { id: 'integrations', label: 'Integrations', path: 'integrations', icon: Layers, badge: '9-in-1', color: 'text-blue-500' }
    ]
  },
  EU_REGULATOR: {
    id: 'EU_REGULATOR',
    title: 'EU Statutory Regulator Enclave',
    shortLabel: 'EU Regulator',
    badgeText: 'Statutory Regulator',
    badgeStyle: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    borderStyle: 'border-emerald-500/30',
    accentBg: 'bg-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    icon: Landmark,
    description: 'B2G Clearing Rails, Statutory Fines & AI Transparency',
    tools: [
      { id: 'clearing', label: 'B2G Clearing Rails', path: 'integrations', icon: Landmark, badge: 'ISO 20022', color: 'text-emerald-500' },
      { id: 'violations', label: 'Statutory Fines', path: 'violations', icon: AlertTriangle, color: 'text-rose-500' },
      { id: 'ai-transparency', label: 'Art. 86 Appeals', path: 'ai-transparency', icon: Eye, color: 'text-cyan-500' },
      { id: 'gazette', label: 'Gazette Watchdog', path: 'gazette-watchdog', icon: BookOpen, color: 'text-amber-500' },
      { id: 'ledger', label: 'Audit Ledger', path: 'audit-ledger', icon: ShieldCheck, color: 'text-indigo-500' }
    ]
  },
  CLIENT: {
    id: 'CLIENT',
    title: 'Enterprise Client Workspace',
    shortLabel: 'Enterprise Client',
    badgeText: 'Client Tenant',
    badgeStyle: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    borderStyle: 'border-blue-500/30',
    accentBg: 'bg-blue-500',
    textColor: 'text-blue-600 dark:text-blue-400',
    icon: Building2,
    description: 'GDPR / AI Act Compliance Hub, DSAR & Evidence Vault',
    tools: [
      { id: 'hub', label: 'Compliance Hub', path: 'compliance-hub', icon: ShieldCheck, badge: '98% Ready', color: 'text-emerald-500' },
      { id: 'dsar', label: 'DSAR Requests', path: 'dsar-portal', icon: FileText, color: 'text-indigo-500' },
      { id: 'ocr', label: 'Invoice OCR', path: 'automation-portal', icon: Receipt, color: 'text-amber-500' },
      { id: 'vault', label: 'Evidence Vault', path: 'evidence-vault', icon: Lock, color: 'text-cyan-500' },
      { id: 'dossiers', label: 'Annex IV Dossier', path: 'launch-tracker', icon: FileCode2, color: 'text-purple-500' }
    ]
  },
  LAWYER: {
    id: 'LAWYER',
    title: 'Legal Counsel & Regulatory Consultant Portal',
    shortLabel: 'Legal Counsel',
    badgeText: 'Lawyer / Consultant',
    badgeStyle: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    borderStyle: 'border-amber-500/30',
    accentBg: 'bg-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    icon: Scale,
    description: 'Autonomous Legal Arbitration (ALAE), TIA & Clause Generator',
    tools: [
      { id: 'alae', label: 'Legal Arbitration', path: 'alae-dashboard', icon: Gavel, badge: 'ALAE Engine', color: 'text-amber-500' },
      { id: 'tia', label: 'TIA & SCC Clauses', path: 'tia-simulator', icon: FileText, color: 'text-rose-500' },
      { id: 'lawyer-portal', label: 'Lawyer Portal', path: 'lawyer-portal', icon: Scale, color: 'text-indigo-500' },
      { id: 'annex-dossiers', label: 'AI Act Dossiers', path: 'launch-tracker', icon: BookOpen, color: 'text-emerald-500' },
      { id: 'audit-cases', label: 'Case Files', path: 'audit-ledger', icon: ShieldAlert, color: 'text-purple-500' }
    ]
  }
};

export const PersonaTopbarNav: React.FC<PersonaTopbarNavProps> = ({ activePath = '', onNavigate }) => {
  const { role, setActiveRole } = useAuth();
  const { showToast } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Map raw role string to one of our 4 primary persona configs
  const getPersonaRole = (rawRole: string): PersonaRole => {
    const r = rawRole.toUpperCase();
    if (r === 'SUPER_ADMIN' || r === 'ADMIN') return 'ADMIN';
    if (r === 'EU_REGULATOR' || r === 'REGULATOR') return 'EU_REGULATOR';
    if (r === 'LAWYER' || r === 'LEGAL_CONSULTANT' || r === 'CONSULTANT') return 'LAWYER';
    return 'CLIENT'; // Default
  };

  const activePersonaKey = getPersonaRole(role);
  const config = PERSONA_CONFIGS[activePersonaKey];

  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchPersona = (newRole: PersonaRole) => {
    setActiveRole(newRole);
    setIsOpen(false);
    setIsToolsMenuOpen(false);
    const cfg = PERSONA_CONFIGS[newRole];
    showToast(
      `Switched persona to ${cfg.title}. Custom navigation bar updated.`,
      'info',
      'Persona Topbar Adapted'
    );
  };

  return (
    <div className="hidden lg:flex items-center space-x-1.5 sm:space-x-2 shrink-0">
      
      {/* Persona Role Badge (Auto-shown according to RBAC) */}
      <div 
        className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 h-8 rounded-lg border text-xs font-bold transition-all shadow-2xs shrink-0 ${config.badgeStyle}`}
        title={`Active RBAC Persona: ${config.title}`}
        id="persona-topbar-pill-badge"
      >
        <config.icon className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[11px] font-black tracking-tight">{config.shortLabel}</span>
      </div>

      {/* Role-Specific Quick Navigation Links (Desktop 2XL inline, Mobile/Laptop dropdown) */}
      <div className="hidden 2xl:flex items-center space-x-1 border-l border-slate-200 dark:border-slate-800 pl-2 shrink-0">
        {config.tools.map((tool) => {
          const ToolIcon = tool.icon;
          const isToolActive = Boolean(activePath && (activePath === tool.path || (tool.path !== '' && activePath.startsWith(tool.path))));

          return (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.path)}
              className={`flex items-center space-x-1.5 px-2 py-1 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer group shrink-0 ${
                isToolActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={`Open ${tool.label}`}
            >
              <ToolIcon className={`w-3.5 h-3.5 ${tool.color} group-hover:scale-110 transition-transform`} />
              <span className="text-[11px] font-bold">{tool.label}</span>
              {tool.badge && (
                <span className="px-1 py-0.2 text-[8px] font-mono font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded shrink-0">
                  {tool.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tools Overflow Menu Trigger for Laptops & Tablets (< 2XL screen width) */}
      <div className="relative flex 2xl:hidden shrink-0" ref={toolsDropdownRef}>
        <button
          onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
          className="flex items-center space-x-1 px-2 py-1 h-8 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          title="Quick Persona Action Tools"
          id="persona-tools-overflow-btn"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden md:inline text-[11px] font-bold">Tools</span>
          <span className="px-1 py-0.2 text-[8px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded">
            {config.tools.length}
          </span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isToolsMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isToolsMenuOpen && (
          <div className="absolute left-0 mt-2 w-56 sm:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">{config.shortLabel} Tools</span>
              <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400">Quick Access</span>
            </div>
            <div className="py-1">
              {config.tools.map((tool) => {
                const ToolIcon = tool.icon;
                const isToolActive = Boolean(activePath && (activePath === tool.path || (tool.path !== '' && activePath.startsWith(tool.path))));

                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onNavigate(tool.path);
                      setIsToolsMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold transition-colors group cursor-pointer ${
                      isToolActive ? 'bg-slate-100/80 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <ToolIcon className={`w-4 h-4 ${tool.color} shrink-0`} />
                      <span className="font-bold truncate">{tool.label}</span>
                    </div>
                    {tool.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded shrink-0">
                        {tool.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
