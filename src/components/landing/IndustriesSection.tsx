import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Stethoscope, 
  ShoppingBag, 
  Landmark, 
  Truck, 
  Gamepad2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  FileText 
} from 'lucide-react';

interface Industry {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  badge: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  keyRegulations: string[];
  capabilities: string[];
  caseStudy: {
    stat: string;
    label: string;
    quote: string;
  };
}

const industries: Industry[] = [
  {
    id: 'banking',
    name: 'Banking & Financial Institutions',
    category: 'FinTech & Capital Markets',
    icon: Building2,
    badge: 'DORA & MiCA Compliant',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-100',
    description: 'Autonomous compliance automation for tier-1 banks, payment processors, and crypto assets under EU DORA, MiCA, PCI-DSS 4.0, and regional AML/KYC laws.',
    keyRegulations: ['EU DORA Resilience', 'MiCA Crypto Forensics', 'PCI-DSS 4.0 Vault', 'AML / KYC Real-Time'],
    capabilities: [
      'Automated digital operational resilience testing & ICT risk logs',
      'Real-time AML transaction screening and Sanction List cross-matching',
      'Quantum-safe encryption for financial ledger & customer vault storage',
      'Cross-border data transfer risk mapping for international wire transfers'
    ],
    caseStudy: {
      stat: '99.8%',
      label: 'Audit Efficiency Gain',
      quote: '9Xen Regulettee reduced our cross-border DORA compliance reporting from 6 weeks to under 2 hours.'
    }
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Life Sciences',
    category: 'HealthTech & Pharma',
    icon: Stethoscope,
    badge: 'HIPAA & EHDS Enclave',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    description: 'End-to-end protection for electronic health records (EHR), clinical trials, and medical devices adhering to HIPAA, EU EHDS, and local medical privacy acts.',
    keyRegulations: ['HIPAA Privacy & Security', 'EU Health Data Space (EHDS)', 'ISO 27791 Health AI', 'FDA Software as Medical Device'],
    capabilities: [
      'Sovereign cloud patient vaulting with strict local data residency',
      'Anonymized medical research data export pipelines',
      'Automated Consent Management for patient data sharing',
      'AI medical model governance & hallucination audit logging'
    ],
    caseStudy: {
      stat: '100%',
      label: 'Local Data Residency',
      quote: 'Ensures zero patient record leakage across European & Middle Eastern health networks.'
    }
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce & Retail Marketplaces',
    category: 'Digital Retail & Platforms',
    icon: ShoppingBag,
    badge: 'CCPA & Opt-Out Automated',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    description: 'Dynamic multi-language cookie consent, Do-Not-Sell opt-out management, and automated DSAR fulfillment for multi-country online retailers.',
    keyRegulations: ['CCPA / CPRA "Do Not Sell"', 'EU E-Commerce Directive', 'KSA PDPL E-Store Act', 'India DPDP Notice Consent'],
    capabilities: [
      'Auto-Geo routing for location-aware banner & consent rendering',
      'Instant DSAR (Data Subject Access Request) automated side-panel',
      'Cart & payment data flow adequacy scanning across ad networks',
      'Multi-language banner generator supporting 50+ regional languages'
    ],
    caseStudy: {
      stat: '4.2M+',
      label: 'Daily Consent Events',
      quote: 'Handled global holiday traffic without a single latency spike or consent violation.'
    }
  },
  {
    id: 'govtech',
    name: 'GovTech & Public Regulators',
    category: 'National Authorities',
    icon: Landmark,
    badge: 'B2G Market Surveillance',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-100',
    description: 'Empowering national data protection authorities and government ministries with proactive market-wide scanning, severity scoring, and 8-step penalty enforcement.',
    keyRegulations: ['National Data Protection Acts', 'Public Registry Directives', 'Sovereignty Cloud Mandates', 'EUDI Wallet Integration'],
    capabilities: [
      'Proactive national enterprise scanning without login-wall intrusion',
      'Transparent formula-based violation severity scoring & fine calculation',
      '8-step due process enforcement case management with appeal review',
      'Immutable audit ledger for regulatory courtroom evidence'
    ],
    caseStudy: {
      stat: '87+',
      label: 'National Sweeps Conducted',
      quote: 'Provided government regulators with tamper-proof market surveillance and legal notice automation.'
    }
  },
  {
    id: 'telecom',
    name: 'Telecom, Logistics & Supply Chain',
    category: 'Infrastructure & Connectivity',
    icon: Truck,
    badge: 'Cross-Border Adequacy',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    description: 'Managing complex cross-border telecommunications, IoT telemetry, and global supply chain data flows with real-time risk mapping and line-item auditing.',
    keyRegulations: ['EU NIS2 Cybersecurity', 'Cross-Border Data Transfer Acts', 'Subsea Cable Data Security', 'Supply Chain NIS Directive'],
    capabilities: [
      'Automated cross-border transfer risk mapping & adequacy scoring',
      'Vendor risk assessment for third-party logistics & cloud sub-processors',
      'Real-time network node vulnerability and secret exposure scanning',
      'Incident response copilot with automated 72h breach notification'
    ],
    caseStudy: {
      stat: '10x',
      label: 'Faster Vendor Vetting',
      quote: 'Automated 500+ vendor risk questionnaires across our global supply chain.'
    }
  },
  {
    id: 'edtech',
    name: 'EdTech & Gaming Media',
    category: 'Education & Entertainment',
    icon: Gamepad2,
    badge: 'Minors & COPPA Shield',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-100',
    description: 'Specialized privacy controls for children data protection, age verification, and in-game microtransaction telemetry consent.',
    keyRegulations: ['COPPA Children Protection', 'EU Age Appropriate Design Code', 'K-12 Student Privacy Acts', 'Video Game Telemetry Law'],
    capabilities: [
      'Age-gated consent workflows and parental approval verification',
      'Telemetry data minimization and automated PII redaction',
      'In-game ad-network tracker identification and blocking',
      'Multi-region child privacy policy generator'
    ],
    caseStudy: {
      stat: '0',
      label: 'Children PII Leakage',
      quote: 'Secured 3 million student profiles across European and US school districts.'
    }
  }
];

export const IndustriesSection: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>(industries[0]);

  return (
    <section id="industries" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Tailored Industry Architecture</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Industry-Specific Legal & Security Solutions
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            9Xen Regulettee adapts its autonomous compliance engine to meet the specialized regulatory mandates of high-stakes enterprise sectors.
          </p>
        </div>

        {/* Industry Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {industries.map((ind) => {
            const Icon = ind.icon;
            const isSelected = selectedIndustry.id === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => setSelectedIndustry(ind)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-32 ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                    : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : ind.bgColor + ' ' + ind.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400"></span>}
                </div>
                <div>
                  <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {ind.name.split('&')[0]}
                  </div>
                  <div className={`text-[11px] truncate ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                    {ind.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Industry Spotlight */}
        <motion.div
          key={selectedIndustry.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 lg:p-8 md:p-12 border border-slate-800 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  {selectedIndustry.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  {selectedIndustry.badge}
                </span>
              </div>

              <h3 className="text-3xl font-extrabold text-white">
                {selectedIndustry.name}
              </h3>

              <p className="text-slate-300 text-base leading-relaxed">
                {selectedIndustry.description}
              </p>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Supported Frameworks & Acts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedIndustry.keyRegulations.map((reg, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/60">
                      {reg}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Autonomous Engine Capabilities
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedIndustry.capabilities.map((cap, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={onLogin}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer border-0"
                >
                  Explore {selectedIndustry.name.split('&')[0]} Suite
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Case Study Card */}
            <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
              <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-800/40">
                <div className="text-4xl font-black text-indigo-400 mb-1">
                  {selectedIndustry.caseStudy.stat}
                </div>
                <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                  {selectedIndustry.caseStudy.label}
                </div>
              </div>

              <blockquote className="text-sm text-slate-300 italic leading-relaxed border-l-2 border-indigo-500 pl-4">
                "{selectedIndustry.caseStudy.quote}"
              </blockquote>

              <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Sovereign Enclave Active
                </span>
                <span className="font-mono text-[11px] text-slate-500">ISO 27001 / SOC 2</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
