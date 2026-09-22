import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle, Key, Users, CheckCircle2, FileText, Lock, Unlock, History } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const BreakGlassAccess: React.FC = () => {
  const { showToast } = useNotification();
  const [isActivating, setIsActivating] = useState(false);
  const [step, setStep] = useState(0); // 0: Idle, 1: Justification, 2: Dual Approval, 3: Active
  const [justification, setJustification] = useState('');
  
  const [history] = useState([
    { id: 'BG-992', user: 'Sarah Chen (CTO)', date: '2024-05-12', reason: 'Critical S3 bucket leak remediation', status: 'Closed' },
    { id: 'BG-841', user: 'Marcus Thorne', date: '2024-02-28', reason: 'Emergency regional failover sync', status: 'Closed' },
  ]);

  const handleStart = () => setStep(1);
  
  const handleSubmitJustification = (e: React.FormEvent) => {
    e.preventDefault();
    if (justification.length < 20) {
      showToast('Please provide a more detailed justification for emergency access.', 'error');
      return;
    }
    setStep(2);
    // Simulate dual approval wait
    setTimeout(() => {
      setStep(3);
      showToast('Break-glass emergency access GRANTED. All actions are being logged to the tamper-proof ledger.', 'warning');
    }, 2000);
  };

  const handleClose = () => {
    setStep(0);
    setJustification('');
    showToast('Emergency session terminated. A post-incident review (PIR) draft has been generated.', 'info');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-rose-50/30">
        <div className="flex gap-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-950 text-base">Break-Glass Emergency Access</h3>
            <p className="text-sm text-slate-500 mt-0.5">Authorized override for critical system incidents. Requires dual approval and high-verbosity logging.</p>
          </div>
        </div>
        {step === 0 ? (
          <button 
            onClick={handleStart}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            Initiate Protocol
          </button>
        ) : step === 3 ? (
          <button 
            onClick={handleClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            Terminate Session
          </button>
        ) : null}
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Access History</span>
                <History className="w-3.5 h-3.5" />
              </div>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl">
                {history.map((h) => (
                  <div key={h.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex gap-3">
                      <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500 self-start">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{h.user} <span className="text-slate-400 font-normal ml-1">#{h.id}</span></p>
                        <p className="text-[10px] text-slate-500">{h.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400">{h.date}</span>
                      <span className="block text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">{h.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.form 
              key="justification"
              onSubmit={handleSubmitJustification}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-800 font-medium">
                  Protocol 12-B: This action will be broadcast to all Security Officers and logged in the Sovereign Audit Ledger. You must provide a valid incident reference.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Incident Justification</label>
                <textarea 
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Describe the emergency and why standard permissions are insufficient..."
                  className="w-full text-xs px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none min-h-[100px] bg-slate-50"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setStep(0)} className="text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm">Request Dual Approval</button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div 
              key="approval"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-8 flex flex-col items-center justify-center space-y-4"
            >
              <div className="flex gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-indigo-500">
                    <Users className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                    <Users className="w-6 h-6 text-slate-300 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">Awaiting Dual Approval</p>
                <p className="text-xs text-slate-500">Confirmed by Security Officer 1. Waiting for second confirmation...</p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="active"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="p-6 bg-rose-600 rounded-2xl text-white text-center space-y-4 shadow-xl shadow-rose-200"
            >
              <ShieldAlert className="w-12 h-12 mx-auto animate-pulse" />
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight">Emergency Session Active</h4>
                <p className="text-sm opacity-90 font-medium">Session token expires in 59:52. Use caution.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="block text-[10px] uppercase font-bold opacity-70">Privilege</span>
                  <span className="text-xs font-bold">SUPER_ADMIN</span>
                </div>
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="block text-[10px] uppercase font-bold opacity-70">Logging</span>
                  <span className="text-xs font-bold text-emerald-300">VERBOSE</span>
                </div>
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="block text-[10px] uppercase font-bold opacity-70">Scope</span>
                  <span className="text-xs font-bold">UNRESTRICTED</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
