import React, { useState } from 'react';
import { Search, X, Shield, ArrowRight, FileText, Database, Scale, Cpu } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

interface SearchItem {
  id: string;
  title: string;
  category: string;
  path: string;
  desc: string;
  icon: React.ElementType;
}

const SEARCH_ITEMS: SearchItem[] = [
  { id: '1', title: 'Sovereign Platform Dashboard', category: 'Overview', path: 'platform-dashboard', desc: 'Real-time telemetry, statutory compliance radar & node health', icon: Cpu },
  { id: '2', title: 'Audit Ledger & Cryptographic Proofs', category: 'Compliance', path: 'audit-ledger', desc: 'Immutable SHA-256 hash chains and audit verification records', icon: Database },
  { id: '3', title: 'B2G Statutory Oversight & Regulator Hub', category: 'Enforcement', path: 'regulator-dashboard', desc: 'Direct supervisory reporting for EU AI Act, DORA and NIS2', icon: Scale },
  { id: '4', title: 'Automated Remediation Engine', category: 'Engine', path: 'automated-remediation', desc: 'Continuous compliance drift detection and real-time reconciliation', icon: Shield },
  { id: '5', title: 'Evidence Vault & Sovereignty Enclave', category: 'Security', path: 'client-vault', desc: 'Zero-trust tenant enclave with cryptographic isolation', icon: Database },
  { id: '6', title: 'DSAR Automated Consumer Rights Portal', category: 'Privacy', path: 'dsar-portal', desc: 'GDPR Article 17 right-to-be-forgotten and data export pipeline', icon: FileText },
  { id: '7', title: 'Quantum Protection & Crypto-Agility', category: 'Security', path: 'quantum-protection', desc: 'Post-Quantum Cryptography (PQC) readiness & ML-KEM migration', icon: Cpu },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = SEARCH_ITEMS.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Sovereign Navigation &amp; Compliance Index
          </h3>
        </div>

        <div className="relative mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search views, compliance modules, regulations, or ledgers..."
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            autoFocus
          />
        </div>

        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {filtered.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.path);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-750 hover:border-indigo-500/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-indigo-400 group-hover:text-indigo-300 border border-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white">{item.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">{item.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
