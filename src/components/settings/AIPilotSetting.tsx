import React, { useState } from 'react';
import { HelpCircle, Sparkles, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIPilotSettingProps {
  settingKey: string;
  settingValue: string;
  context: string;
}

export const AIPilotSetting: React.FC<AIPilotSettingProps> = ({ settingKey, settingValue, context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const handleExplain = async () => {
    setIsOpen(true);
    if (explanation) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/v1/advanced-settings/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settingKey, settingValue, context })
      });
      const data = await res.json();
      setExplanation(data.explanation);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block ml-1.5">
      <button
        type="button"
        onClick={handleExplain}
        className="p-1 text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none"
        title="Explain this setting with AI"
      >
        <Sparkles className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-50 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">AI Setting Co-pilot</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{settingKey}</p>
                </div>
              </div>

              {loading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  <p className="text-[10px] text-slate-500 font-mono animate-pulse uppercase">Consulting Regulatory Graph...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-[11px] leading-relaxed text-slate-600 font-medium">
                    {explanation ? (
                      <div className="prose prose-slate prose-sm max-w-none">
                        {explanation.split('\n').map((line, i) => (
                          <p key={i} className="mb-2">{line}</p>
                        ))}
                      </div>
                    ) : (
                      <p>Unable to generate explanation at this time.</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold uppercase">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Guidance</span>
                    </div>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
              
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white drop-shadow-sm" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
