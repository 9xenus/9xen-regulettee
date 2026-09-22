import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Globe2, 
  Server, 
  Compass, 
  Scale, 
  PackageCheck, 
  Cpu, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Layers 
} from 'lucide-react';

interface SolutionPillar {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge: string;
  highlights: string[];
  techSpec: string;
  architectureSummary: string;
}

const solutionPillars: SolutionPillar[] = [
  {
    id: 'rag-policy',
    title: 'Multi-Region RAG Legal Engine',
    subtitle: 'Autonomous Law Ingestion & Rule Normalization',
    icon: Globe2,
    badge: 'Plug-and-Play Adapters',
    highlights: [
      'EUR-Lex CELLAR SPARQL / REST automated gazette sync',
      'US eCFR & State Privacy Acts (CCPA/CPRA, VCDPA, CPA)',
      'Middle East KSA PDPL, UAE Data Law & Arabic NLP support',
      'APAC India DPDP Act & Singapore PDPA notice-based consent',
      'Latin America MERCOSUR & African Union (AU) privacy frameworks'
    ],
    techSpec: 'Hierarchical database model (Region → Country → Act → Rule → Penalty) with 1536-dim vector embeddings and tenant admin toggle status (`is_enabled`).',
    architectureSummary: 'Only indexes and queries rules where `is_enabled = TRUE` at all parent levels, ensuring 0% hallucination on muted laws.'
  },
  {
    id: 'sovereign-cloud',
    title: 'Sovereign Cloud & Data Residency',
    subtitle: 'Zero-Downtime Local Enclave Vaulting',
    icon: Server,
    badge: 'AWS / GCP Enclaves',
    highlights: [
      'Citizens PII & audit logs kept strictly within national borders',
      'AES-256 field-level encryption with customer KMS master key rotation',
      'Quantum-safe vaulting for sensitive financial & health records',
      'Zero-downtime data sovereignty arbitrage across regional clouds'
    ],
    techSpec: 'Hardware Security Module (HSM) key isolation with strict localized postgres partitions and region-bound Docker execution containers.',
    architectureSummary: 'Eliminates cross-border data exposure risks by isolating tenant compute nodes inside localized regional cloud zones.'
  },
  {
    id: 'cross-border',
    title: 'Cross-Border Transfer Risk Mapping',
    subtitle: 'Automated Data Flow Adequacy Assessment',
    icon: Compass,
    badge: 'SCC & Adequacy Reports',
    highlights: [
      'Automated Standard Contractual Clauses (SCC) validation',
      'Real-time data flow graph tracing across third-party SaaS vendors',
      'Adequacy risk scoring for cross-border cloud database replication',
      'Instant exportable Transfer Impact Assessment (TIA) pdfs'
    ],
    techSpec: 'Graph Intelligence engine mapping data egress points to international regulatory whitelist/blacklist tables.',
    architectureSummary: 'Calculates real-time compliance penalty exposure when transferring citizen data across non-adequate jurisdictions.'
  },
  {
    id: 'b2g-surveillance',
    title: 'B2G Regulator Surveillance & Enforcement',
    subtitle: 'Market-Wide Scanning & 8-Step Penalty Workflow',
    icon: Scale,
    badge: 'B2G Government Console',
    highlights: [
      'Proactive non-intrusive scanning of national enterprise domains',
      'Transparent formula-based violation severity scoring & fine caps',
      '8-step due process workflow (Notice → Warning → Appeal → Final Demand)',
      'Immutable audit ledger for regulatory courtroom evidence'
    ],
    techSpec: 'SSRF-protected non-intrusive market scanner tied to automated 8-stage case history ledger tables.',
    architectureSummary: 'Guarantees due process and legal defense for both national regulators and audited commercial entities.'
  },
  {
    id: 'llm-orchestrator',
    title: 'LLM Orchestrator & Fallback Engine',
    subtitle: 'Multi-Provider Resilience & Cost Control',
    icon: Cpu,
    badge: 'Zero-Downtime AI',
    highlights: [
      'Anthropic, OpenAI, and Gemini multi-provider fallback chains',
      'Monthly token budget caps per feature and per tenant',
      'Automatic rate-limit (429) cooldown and failover routing',
      'Zero prompt-data retention & server-side API key encryption'
    ],
    techSpec: 'Centralized LLM Orchestrator routing requests through budget pre-checks, sequential fallback chains, and monthly token logs.',
    architectureSummary: 'Ensures 99.99% AI uptime while preventing runaway API token bills and prompt data leaks.'
  },
  {
    id: 'enterprise-audit-pack',
    title: 'Single Enterprise "Compliance Audit" Package',
    subtitle: 'All-In-One Bundled Add-On Suite',
    icon: PackageCheck,
    badge: 'Single Enterprise SKU',
    highlights: [
      'Unlimited domain compliance scanning & secret exposure checks',
      'Vendor risk assessment & third-party sub-processor vetting',
      'Automated audit evidence export for SOC 2 Type II & ISO 27001',
      'Priority 24/7 SLA with dedicated compliance engineering squad'
    ],
    techSpec: 'Atomic single-click subscription activation unlocking 12+ feature-gated dashboard panels via `organization_dashboard_visibility`.',
    architectureSummary: 'Streamlines enterprise procurement with a single transparent subscription bundling all high-tier compliance modules.'
  }
];

export const ExpandedSolutionsSection: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [activePillar, setActivePillar] = useState<SolutionPillar>(solutionPillars[0]);

  return (
    <section id="solutions" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Deep Architectural Solutions</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            The Enterprise Compliance Engine Architecture
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            9Xen Regulettee unites autonomous AI legal reasoning, sovereign cloud infrastructure, and regulatory enforcement into a single cohesive platform.
          </p>
        </div>

        {/* Pillars Grid Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {solutionPillars.map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = activePillar.id === pillar.id;

            return (
              <div
                key={pillar.id}
                onClick={() => setActivePillar(pillar)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-bold">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    {pillar.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-indigo-400 font-bold">
                  <span>Explore Architecture</span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Pillar Deep Dive Display */}
        <motion.div
          key={activePillar.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 lg:p-8 md:p-12 shadow-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 text-white rounded-xl">
                  {React.createElement(activePillar.icon, { className: "w-6 h-6" })}
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white">{activePillar.title}</h3>
                  <p className="text-xs text-indigo-400 font-medium">{activePillar.subtitle}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Features & Capabilities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activePillar.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/40">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Engine Isolation & Security Guarantee
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activePillar.architectureSummary}
                </p>
              </div>

              <button
                onClick={onLogin}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer border-0"
              >
                Access {activePillar.title}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Architecture Code/Spec Box */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 font-mono text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400 font-bold flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Technical Specification
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
                  v2.4 Production
                </span>
              </div>

              <div className="text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                {activePillar.techSpec}
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Latency Target:</span>
                  <span className="text-emerald-400 font-bold">&lt; 150ms RAG Lookup</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Sovereignty Standard:</span>
                  <span className="text-indigo-400 font-bold">Local HSM Enclave</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Audit Guarantee:</span>
                  <span className="text-white font-bold">Immutable Append-Only Log</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
