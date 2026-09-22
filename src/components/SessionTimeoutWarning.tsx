import React from 'react';
import { motion } from 'motion/react';
import { Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface SessionTimeoutWarningProps {
  countdown: number;
  onStayLoggedIn: () => void;
  roleLabel?: string;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  countdown,
  onStayLoggedIn,
  roleLabel = 'User',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">Session Inactivity Detected</h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Due to strict sovereign regulatory compliance guidelines for{' '}
          <span className="text-amber-300 font-semibold">{roleLabel}</span>, your cryptographic session will expire automatically in:
        </p>

        <div className="text-3xl font-mono font-extrabold text-amber-400 mb-6 bg-slate-800/80 border border-slate-700/80 py-3 rounded-xl">
          {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
        </div>

        <button
          onClick={onStayLoggedIn}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          Extend Active Session
        </button>
      </div>
    </motion.div>
  );
};
