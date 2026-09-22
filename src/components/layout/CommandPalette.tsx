import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Search, 
  FileText, 
  LayoutDashboard, 
  Settings2, 
  ShieldCheck, 
  CheckSquare, 
  Building2, 
  Sliders, 
  Zap, 
  CreditCard, 
  Layers, 
  AlertTriangle, 
  Scale, 
  Eye, 
  BookOpen, 
  Receipt, 
  Lock, 
  FileCode2, 
  Gavel, 
  ShieldAlert 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { label: "Trust Check Consumer Mobile App (Citizen Shield)", category: "Consumer", path: "trust-check", icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> },
    { label: "Platform Dashboard", category: "Overview", path: "platform-dashboard", icon: <LayoutDashboard className="w-4 h-4 text-emerald-500" /> },
    { label: "Compliance Hub (GDPR, AI Act, NIS2)", category: "Compliance", path: "compliance-hub", icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> },
    { label: "Audit Ledger & Cryptographic Proofs", category: "Audit", path: "audit-ledger", icon: <ShieldCheck className="w-4 h-4 text-indigo-500" /> },
    { label: "Tenants Directory & Workspaces", category: "System", path: "tenants", icon: <Building2 className="w-4 h-4 text-indigo-500" /> },
    { label: "RBAC Roles & Security Access Control", category: "System", path: "rbac", icon: <Sliders className="w-4 h-4 text-purple-500" /> },
    { label: "Zero-Downtime Integrations Hub (9-in-1)", category: "Integrations", path: "integrations", icon: <Layers className="w-4 h-4 text-blue-500" /> },
    { label: "Regulator B2G Clearing & Violations", category: "Regulatory", path: "violations", icon: <AlertTriangle className="w-4 h-4 text-rose-500" /> },
    { label: "Legal Arbitration (ALAE) & Case Files", category: "Legal", path: "alae-dashboard", icon: <Gavel className="w-4 h-4 text-amber-500" /> },
    { label: "DSAR Rights Portal & Eradication", category: "Privacy", path: "dsar-portal", icon: <FileText className="w-4 h-4 text-indigo-500" /> },
    { label: "Sovereign Evidence Vault & Attestations", category: "Security", path: "evidence-vault", icon: <Lock className="w-4 h-4 text-cyan-500" /> },
    { label: "General System Settings", category: "Settings", path: "system-settings", icon: <Settings2 className="w-4 h-4 text-slate-400" /> },
    { label: "Enterprise Services Gateway", category: "Enterprise", path: "enterprise-gateway", icon: <ShieldCheck className="w-4 h-4 text-rose-500" /> },
    { label: "AI Company Network (LinkedIn-style KYB)", category: "Enterprise", path: "company-network", icon: <Building2 className="w-4 h-4 text-indigo-500" /> },
    { label: "AI Verification Hub (Person/Company/Document)", category: "Enterprise", path: "verification-hub", icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> },
    { label: "Predictive Trading Intelligence", category: "Enterprise", path: "predictive-intelligence", icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { label: "MCP Connector Hub", category: "Enterprise", path: "super-admin-tower", icon: <Layers className="w-4 h-4 text-blue-500" /> },
    { label: "Enterprise SSO (AI-SSO) Provisioner", category: "Enterprise", path: "super-admin-tower", icon: <Lock className="w-4 h-4 text-cyan-500" /> },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSelect = (path: string) => {
    const cleanPath = path.replace(/^\//, '');
    onNavigate(cleanPath);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999] flex items-start justify-center pt-16 sm:pt-20 p-4">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search portals, modules, audit logs or commands (Ctrl+K)..."
                className="w-full text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none bg-transparent font-medium"
              />
              <button 
                onClick={onClose} 
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-2 max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredCommands.length > 0 ? (
                filteredCommands.map(cmd => (
                  <button
                    key={cmd.path}
                    onClick={() => handleSelect(cmd.path)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 text-xs text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shrink-0">
                        {cmd.icon}
                      </div>
                      <span className="font-bold truncate">{cmd.label}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 ml-2 border border-slate-200 dark:border-slate-700">
                      {cmd.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                  No matching compliance routes or command items found.
                </div>
              )}
            </div>

            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Sovereign Enclave Palette</span>
              <span>ESC to Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
