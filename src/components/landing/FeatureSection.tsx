import React from 'react';
import { Shield, Lock, Zap, Globe, FileText, BarChart3, Scale, Server, Compass } from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    title: 'Multi-Region Legal Adapters',
    description: 'Plug-and-play connectors for EU (EUR-Lex / GDPR), USA (CCPA/CPRA, VCDPA), Middle East (KSA PDPL, UAE), and APAC (India DPDP, SG PDPA).',
    icon: Globe,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    title: 'Sovereign Cloud & Data Residency',
    description: 'Comply with strict local data residency mandates by keeping citizen PII and audit logs strictly within national borders using AWS/GCP regional enclaves.',
    icon: Server,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Cross-Border Risk Mapping',
    description: 'Automatically assess legal transfer risks and generate comprehensive data flow adequacy reports when moving data across international jurisdictions.',
    icon: Compass,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'B2G Regulator Surveillance',
    description: 'Proactive national-scale enterprise scanning, automated violation scoring, and transparent 8-step penalty enforcement workflows for regulators.',
    icon: Scale,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    title: 'Autonomous RAG Policy Engine',
    description: 'Ingest raw legal gazettes and directives, split into Acts, Rules, and Fine penalties with automated vector embedding search and tenant admin toggles.',
    icon: Zap,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    title: 'Multi-Language Banners & Consent',
    description: 'Auto-geo routing detects user origin and serves dynamic privacy banners with 50+ languages, regional opt-outs ("Do Not Sell"), and notice-based consent.',
    icon: Shield,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
];

export const FeatureSection: React.FC = () => {
  return (
    <section id="solutions" className="py-10 sm:py-12 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-8">
          <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-1.5">Enterprise Capabilities</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 leading-tight">Engineered for global multi-jurisdictional compliance</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            9Xen Regulettee unites sovereign cloud architecture with autonomous legal intelligence to protect your enterprise across every regulatory frontier.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:shadow-md transition-shadow"
            >
              <div className={`w-9 h-9 ${feature.bg} ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">{feature.title}</h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

