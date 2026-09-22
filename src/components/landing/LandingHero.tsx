import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Globe2, Cpu, Scale, Sparkles, Box } from 'lucide-react';
import { ThreeDComplianceVisual } from './ThreeDComplianceVisual';

interface LandingHeroProps {
  onLogin: () => void;
  title?: string;
  subtitle?: string;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onLogin, title, subtitle }) => {
  return (
    <section className="relative pt-6 pb-8 lg:pt-10 lg:pb-12 overflow-hidden bg-gradient-to-b from-slate-50/70 via-indigo-50/20 to-white">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Main Grid: Left Value Prop + Right 3D Interactive Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 items-center max-w-7xl mx-auto">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-3 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Global Multi-Region Compliance & Sovereignty Platform</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-3 leading-[1.15]">
                {title || (
                  <>
                    Autonomous Legal AI for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">Global Enterprises</span> & Regulators
                  </>
                )}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              {subtitle || "Unify GDPR, CCPA, KSA PDPL, India DPDP, and Cross-Border Data Transfers with plug-and-play regional adapters, sovereign cloud residency, and automated RAG enforcement."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-6"
            >
              <button
                onClick={onLogin}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group shadow-md shadow-indigo-600/20 cursor-pointer border-0 text-xs sm:text-sm"
              >
                Launch Platform Portal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Region Badges Ribbon */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl mx-auto lg:mx-0"
            >
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs flex items-center gap-2 text-left hover:border-indigo-300 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[11px] shrink-0">EU</div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-900 truncate">EUR-Lex & AI Act</div>
                  <div className="text-[9px] text-slate-500 truncate">Continuous RAG</div>
                </div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs flex items-center gap-2 text-left hover:border-emerald-300 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[11px] shrink-0">US</div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-900 truncate">CCPA & NIST</div>
                  <div className="text-[9px] text-slate-500 truncate">Opt-Out Ledger</div>
                </div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs flex items-center gap-2 text-left hover:border-amber-300 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-[11px] shrink-0">ME</div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-900 truncate">KSA PDPL & UAE</div>
                  <div className="text-[9px] text-slate-500 truncate">In-Country Vault</div>
                </div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs flex items-center gap-2 text-left hover:border-violet-300 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-[11px] shrink-0">AP</div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-900 truncate">India DPDP & SG</div>
                  <div className="text-[9px] text-slate-500 truncate">Consent Engine</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: 3D Holographic Visualizer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 flex items-center justify-center relative"
          >
            <ThreeDComplianceVisual onInteract={onLogin} />
          </motion.div>

        </div>
      </div>
      
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-[0.05]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600 blur-[130px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500 blur-[130px]"></div>
      </div>
    </section>
  );
};


