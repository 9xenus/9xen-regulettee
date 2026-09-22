import React from 'react';
import { motion } from 'motion/react';
import { 
  Building, 
  ShieldCheck, 
  Globe2, 
  Award, 
  Users, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Scale, 
  Cpu 
} from 'lucide-react';
import { NonaxenLogo } from '../NonaxenLogo';

export const AboutUsSection: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Mission Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>About 9Xen Regulettee by Nonaxen</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              Pioneering Autonomous Legal Engineering & Sovereign Cloud Security
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed">
              9Xen Regulettee was built to solve the most daunting challenge facing modern enterprises and regulators: navigating an increasingly fragmented global legal landscape without sacrificing operational speed or data sovereignty.
            </p>

            <p className="text-sm text-slate-600 leading-relaxed">
              Engineered under European cybersecurity and data protection standards, 9Xen Regulettee unites multi-region legal RAG adapters, sovereign cloud vaults, and B2G market surveillance into a single unified platform.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-4 border-t border-slate-100">
              <div>
                <div className="text-3xl font-black text-indigo-600">50+</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Countries Supported</div>
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-600">99.99%</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Sovereign Cloud Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-black text-amber-600">0%</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Prompt Data Retention</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-5 sm:p-6 lg:p-8 border border-slate-800 shadow-2xl space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <NonaxenLogo className="w-10 h-10" showText={true} textSize="lg" />
            </div>

            <blockquote className="text-sm text-slate-300 italic leading-relaxed">
              "Our vision is to make compliance invisible yet absolute. By combining RAG legal vector indexing with hardware-enclave data residency, enterprises can expand globally with complete peace of mind."
            </blockquote>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Headquartered in Europe with Regional Enclaves worldwide</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Audited annually by tier-1 cybersecurity & legal firms</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Founding member of the Global Sovereign Cloud Alliance</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">9Xen Regulettee Engine v2.4</span>
              <button
                onClick={onLogin}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all border-0 cursor-pointer"
              >
                Launch Portal
              </button>
            </div>
          </div>
        </div>

        {/* Global Regions Grid */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Global Legal Jurisdictions Covered</h3>
            <p className="text-sm text-slate-600">Plug-and-play legal adapters continuously sync with official government gazettes across key economic zones.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { code: 'EU', name: 'European Union', detail: 'EUR-Lex & GDPR' },
              { code: 'US', name: 'United States', detail: 'CCPA/CPRA, VCDPA' },
              { code: 'GCC', name: 'Middle East & GCC', detail: 'KSA PDPL & UAE' },
              { code: 'AP', name: 'Asia Pacific', detail: 'India DPDP & SG' },
              { code: 'LATAM', name: 'Latin America', detail: 'MERCOSUR LGPD' },
              { code: 'AU', name: 'African Union', detail: 'AU Data Convention' },
              { code: 'UK', name: 'United Kingdom', detail: 'UK GDPR & DORA' }
            ].map((reg, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto shadow-xs">
                  {reg.code}
                </div>
                <div className="text-xs font-bold text-slate-900">{reg.name}</div>
                <div className="text-[11px] text-slate-500">{reg.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications Badge Cloud */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 lg:p-8 md:p-12 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              Verified Industry Certifications
            </div>
            <h3 className="text-2xl font-bold text-white">Enterprise Security & Compliance Guarantees</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              9Xen Regulettee undergoes continuous independent third-party audits to guarantee absolute security, reliability, and regulatory compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {['ISO 27001', 'SOC 2 Type II', 'GDPR Certified', 'HIPAA Compliant', 'PCI-DSS 4.0', 'ISO 42001 AI'].map((badge, idx) => (
              <span key={idx} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold shadow-xs">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
