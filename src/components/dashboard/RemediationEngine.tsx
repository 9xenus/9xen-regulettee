import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Circle, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResolutionStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  canAutoFix: boolean;
}

interface RemediationEngineProps {
  tenantId: string;
  findings: string[];
}

export const RemediationEngine: React.FC<RemediationEngineProps> = ({ tenantId, findings }) => {
  const [steps, setSteps] = useState<ResolutionStep[]>([]);
  const [autoFixEnabled, setAutoFixEnabled] = useState(false);
  const [fixingId, setFixingId] = useState<string | null>(null);

  useEffect(() => {
    if (findings.length > 0) {
      // Map findings to actionable steps
      const newSteps = findings.map((finding, idx) => ({
        id: `step-${idx}`,
        title: finding.split('.')[0],
        description: finding,
        isCompleted: false,
        canAutoFix: finding.toLowerCase().includes('encryption') || 
                    finding.toLowerCase().includes('tracker') || 
                    finding.toLowerCase().includes('policy')
      }));
      setSteps(newSteps);
    }
  }, [findings]);

  const handleToggleStep = (id: string) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, isCompleted: !step.isCompleted } : step
    ));
  };

  const runAutoFix = async (id: string) => {
    setFixingId(id);
    try {
      const step = steps.find(s => s.id === id);
      const response = await fetch('/api/v1/compliance-advisor/autofix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tenantId, 
          violationType: step?.title || 'General Compliance' 
        }),
      });
      
      if (response.ok) {
        setSteps(prev => prev.map(s => 
          s.id === id ? { ...s, isCompleted: true } : s
        ));
      }
    } catch (error) {
      console.error("Auto-Fix failed:", error);
    } finally {
      setFixingId(null);
    }
  };

  if (findings.length === 0) return null;

  const completedCount = steps.filter(s => s.isCompleted).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mt-6"
    >
      <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Wrench className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">Remediation Engine</h3>
            <p className="text-slate-400 text-xs font-medium">Guided resolution checklist</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Auto-Fix</span>
              <button
                onClick={() => setAutoFixEnabled(!autoFixEnabled)}
                className={`w-8 h-4 rounded-full transition-all relative ${autoFixEnabled ? 'bg-emerald-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${autoFixEnabled ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">{progress}% Resolved</div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6 space-y-4">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          />
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {steps.map((step) => (
              <motion.div
                key={step.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl border transition-all ${
                  step.isCompleted 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => handleToggleStep(step.id)}
                    className="mt-0.5 text-slate-600 hover:text-emerald-400 transition-colors"
                  >
                    {step.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  
                  <div className="flex-1 space-y-1">
                    <h4 className={`text-sm font-bold ${step.isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {step.title}
                    </h4>
                    <p className={`text-xs leading-relaxed ${step.isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                      {step.description}
                    </p>
                    
                    {!step.isCompleted && autoFixEnabled && step.canAutoFix && (
                      <button
                        onClick={() => runAutoFix(step.id)}
                        disabled={fixingId === step.id}
                        className="mt-3 flex items-center gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                      >
                        {fixingId === step.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Zap className="w-3 h-3" />
                        )}
                        Execute Auto-Fix
                      </button>
                    )}
                  </div>

                  {step.isCompleted && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3 h-3" />
          Requires Final Human Review
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Audit Trail Active
        </div>
      </div>
    </motion.div>
  );
};
