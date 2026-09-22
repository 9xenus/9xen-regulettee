import React, { useState } from 'react';
import { Search, X, BookOpen, Shield, ExternalLink } from 'lucide-react';

interface RegulatorySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REGULATORY_ARTICLES = [
  { id: 'GDPR-32', title: 'GDPR Article 32', desc: 'Security of processing: Appropriate technical & organizational measures.' },
  { id: 'GDPR-17', title: 'GDPR Article 17', desc: 'Right to erasure (Right to be forgotten).' },
  { id: 'EU-AI-14', title: 'EU AI Act Article 14', desc: 'Human oversight: High-risk AI systems must have real-time human intervention capabilities.' },
  { id: 'EU-AI-9', title: 'EU AI Act Article 9', desc: 'Risk management system: Continuous iterative identification and mitigation of residual risks.' },
  { id: 'DORA-6', title: 'DORA Article 6', desc: 'ICT risk management framework and digital operational resilience.' },
  { id: 'NIS2-21', title: 'NIS2 Article 21', desc: 'Cybersecurity risk-management measures and supply chain security obligations.' },
];

export const RegulatorySearchModal: React.FC<RegulatorySearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = REGULATORY_ARTICLES.filter(
    art => art.title.toLowerCase().includes(query.toLowerCase()) || art.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Statutory Intelligence Search</h3>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search regulations (GDPR, EU AI Act, DORA, NIS2)..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            autoFocus
          />
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filtered.map(art => (
            <div key={art.id} className="p-3 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-750 rounded-xl transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-indigo-300 font-mono">{art.title}</span>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">Enforced</span>
              </div>
              <p className="text-xs text-slate-400">{art.desc}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-500">
              No matching regulatory articles found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
