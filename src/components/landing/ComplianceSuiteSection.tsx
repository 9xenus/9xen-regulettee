import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, BrainCircuit, Activity, Lock, Users, Globe, 
  Search, Zap, Fingerprint, FileCheck2, Scale, Box, Sliders,
  Trash2, Database, Briefcase, Leaf, HeartPulse, Sparkles,
  RefreshCcw, AlertTriangle, Swords, Target
} from 'lucide-react';

const features = [
  { name: 'GDPR Compliance Core', icon: ShieldCheck, desc: 'Complete framework for EU data protection laws.' },
  { name: 'EU AI Act Monitoring', icon: BrainCircuit, desc: 'Real-time alignment with high-risk AI regulations.' },
  { name: 'NIS2 Cyber Resilience', icon: Zap, desc: 'Mandatory incident reporting and risk management.' },
  { name: 'SOC2 Type II Readiness', icon: FileCheck2, desc: 'Continuous control monitoring for service trust.' },
  { name: 'DORA Resilience', icon: Activity, desc: 'Digital operational resilience for financial sectors.' },
  { name: 'Data Residency Enclaves', icon: Box, desc: 'Cryptographically locked sovereign data storage.' },
  { name: 'Cross-Border Adequacy', icon: Globe, desc: 'Automated adequacy checks for international transfers.' },
  { name: 'Automated DSAR Portal', icon: Users, desc: 'Intelligent request handling for data subject rights.' },
  { name: 'Violation Surveillance', icon: AlertTriangle, desc: 'AI-powered detection of regulatory non-compliance.' },
  { name: 'Sovereign Cloud Hub', icon: Database, desc: 'Infrastructure decoupling from non-EU jurisdictions.' },
  { name: 'Quantum-Safe Vault', icon: Lock, desc: 'PQC-ready encryption for long-term data secrets.' },
  { name: 'AI Ethics & Liability', icon: Target, desc: 'Impact assessments for algorithmic transparency.' },
  { name: 'Supply Chain Auditor', icon: Briefcase, desc: 'Third-party risk and vulnerability surveillance.' },
  { name: 'ESG Sustainability', icon: Leaf, desc: 'Green data tracking and ESG reporting standards.' },
  { name: 'Digital Asset Scanning', icon: Search, desc: 'Automated discovery of PII across cloud estates.' },
  { name: 'Auto-Remediation Engine', icon: RefreshCcw, desc: 'Self-healing compliance workflows and auto-fixes.' },
  { name: 'AML/KYC Verification', icon: Fingerprint, desc: 'Biometric and document-based identity assurance.' },
  { name: 'eIDAS Signatures', icon: FileCheck2, desc: 'Qualified electronic signatures for legal validity.' },
  { name: 'Global Law Sync', icon: Scale, desc: 'Real-time database of worldwide regulatory shifts.' },
  { name: 'Breach Simulation', icon: Swords, desc: 'Adversarial testing and response preparedness.' },
  { name: 'Multi-Region Policy', icon: Sliders, desc: 'Unified policy enforcement across diverse regions.' },
  { name: 'Dynamic Consent', icon: Sparkles, desc: 'Context-aware user consent and preference center.' }
];

export const ComplianceSuiteSection = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <section className="py-10 sm:py-12 bg-slate-900 text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 tracking-tight leading-tight">
            The Enterprise <span className="text-indigo-400">Compliance Suite</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            9Xen Regulettee integrates 22+ high-fidelity compliance modules into a single, sovereign orchestration layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              viewport={{ once: true }}
              className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all group cursor-pointer"
              onClick={onLogin}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">
                  <feature.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs text-white truncate">{feature.name}</h3>
                  <p className="text-slate-400 text-[10px] leading-snug truncate group-hover:text-slate-300 transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white text-center md:text-left">
            <h3 className="text-lg font-bold mb-1">Ready to secure your global operations?</h3>
            <p className="text-indigo-100 text-xs opacity-90">Join 400+ enterprises running sovereign compliance on 9Xen Regulettee.</p>
          </div>
          <button 
            onClick={onLogin}
            className="px-5 py-2.5 bg-white text-indigo-600 font-bold rounded-lg hover:bg-slate-100 transition-all shadow-md shadow-indigo-900/30 text-xs border-0 cursor-pointer shrink-0"
          >
            Launch CaaS Operation Center
          </button>
        </div>
      </div>
    </section>
  );
};
