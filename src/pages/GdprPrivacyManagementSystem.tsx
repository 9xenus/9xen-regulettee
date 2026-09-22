import React, { useState } from 'react';
import { ShieldCheck, X, Menu, Lock, Database, FileText, AlertTriangle } from 'lucide-react';
import { TrustPrivacyDashboard } from './TrustPrivacyDashboard';
import { GdprChecklist } from '../components/GdprChecklist';
import { motion, AnimatePresence } from 'motion/react';

export const GdprPrivacyManagementSystem: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="space-y-6 p-4 sm:p-5 lg:p-6 relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">GDPR & Data Privacy Management System</h1>
          <p className="text-slate-500">Centralized hub for GDPR compliance, data protection, and security management.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
        >
          <Menu className="w-4 h-4" />
          <span>Compliance Checklist</span>
        </button>
      </header>
      
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <TrustPrivacyDashboard moduleId="data-mapping" />
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-50 overflow-y-auto border-l border-slate-200"
            >
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Action Items
                </h2>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-5 lg:p-6">
                <GdprChecklist />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
