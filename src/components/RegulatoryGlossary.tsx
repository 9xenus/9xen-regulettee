import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Scale, 
  FileText, 
  ExternalLink, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface GlossaryTerm {
  term: string;
  framework: 'GDPR' | 'EU_AI_ACT' | 'NIS2' | 'DORA' | 'EIDAS';
  article: string;
  definition: string;
  statutoryImpact: string;
}

const terms: GlossaryTerm[] = [
  {
    term: 'High-Risk AI System',
    framework: 'EU_AI_ACT',
    article: 'Article 6 & Annex III',
    definition: 'An AI system used in critical infrastructure, educational admission, employment recruiting, biometric categorization, law enforcement, or credit scoring that poses substantial risks to fundamental rights.',
    statutoryImpact: 'Requires mandatory CE marking conformity assessment, continuous risk management, data governance logging, and human oversight.'
  },
  {
    term: 'Data Protection Impact Assessment (DPIA)',
    framework: 'GDPR',
    article: 'Article 35',
    definition: 'A systematic process designed to identify, assess, and mitigate data protection risks associated with high-risk processing operations.',
    statutoryImpact: 'Mandatory prior to commencing processing likely to result in high risk to rights and freedoms of individuals.'
  },
  {
    term: 'Essential Entity (EE)',
    framework: 'NIS2',
    article: 'Article 3',
    definition: 'Critical organizations operating in energy, transport, banking, health, water, digital infrastructure, or public administration subject to stringent cybersecurity audits.',
    statutoryImpact: 'Subject to mandatory proactive supervisory audits, executive management personal liability, and strict 24-hour incident notification.'
  },
  {
    term: 'Qualified Electronic Signature (QES)',
    framework: 'EIDAS',
    article: 'Article 25(2)',
    definition: 'An advanced electronic signature created by a qualified electronic signature creation device and based on a qualified certificate for electronic signatures.',
    statutoryImpact: 'Carries the identical legal effect of a handwritten signature in all EU member state legal proceedings.'
  },
  {
    term: 'Operational Resilience Testing',
    framework: 'DORA',
    article: 'Article 24-27',
    definition: 'Mandatory comprehensive threat-led penetration testing (TLPT) performed at least once every 3 years by regulated financial entities.',
    statutoryImpact: 'Failure to perform TLPT incurs periodic penalty payments under national competent financial authority directives.'
  }
];

export const RegulatoryGlossary: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('ALL');

  const filtered = terms.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase()) || t.article.toLowerCase().includes(search.toLowerCase());
    const matchesFw = selectedFramework === 'ALL' || t.framework === selectedFramework;
    return matchesSearch && matchesFw;
  });

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">EU Regulatory Codex &amp; Statutory Glossary</h3>
            <p className="text-xs text-slate-400">Authoritative legal definitions and compliance obligations under EU Gazettes.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono">
          Official EU Lexicon v4.2
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search statutory term, article, directive..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['ALL', 'GDPR', 'EU_AI_ACT', 'NIS2', 'DORA', 'EIDAS'].map((fw) => (
            <button
              key={fw}
              type="button"
              onClick={() => setSelectedFramework(fw)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedFramework === fw ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {fw}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {item.framework} &bull; {item.article}
                </span>
                <span className="text-xs text-emerald-400 font-mono font-bold">In Force</span>
              </div>
              <h4 className="text-base font-bold text-white mt-2">{item.term}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.definition}</p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              <strong className="text-indigo-300">Statutory Impact:</strong> {item.statutoryImpact}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegulatoryGlossary;
