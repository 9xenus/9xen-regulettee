import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, Lock, ShieldAlert, GraduationCap, 
  FileCheck, UserCheck, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RopaRecordManager } from '../components/compliance/RopaRecordManager';
import { TomsGovernanceMatrix } from '../components/compliance/TomsGovernanceMatrix';
import { WhistleblowerPortal } from '../components/compliance/WhistleblowerPortal';
import { EmployeeComplianceAcademy } from '../components/compliance/EmployeeComplianceAcademy';
import { DpaContractManager } from '../components/compliance/DpaContractManager';
import { DpoAdvisoryDesk } from '../components/compliance/DpoAdvisoryDesk';

export const EnterprisePrivacySuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'ropa' | 'toms' | 'whistleblower' | 'academy' | 'dpas' | 'dpo'
  >('ropa');

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black rounded-full uppercase tracking-wider">
              Enterprise Sovereign GRC & Privacy Cloud
            </span>
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All 6 Core Modules Active
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Enterprise Privacy & GDPR Governance Suite
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete EU-grade privacy operations: Digital ROPA catalog, TOMs controls, HinSchG Whistleblowing, Employee Academy, DPAs, and Certified DPO Desk.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1 bg-white p-1.5 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('ropa')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'ropa'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          ROPA (Art. 30 VVT)
        </button>

        <button
          onClick={() => setActiveTab('toms')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'toms'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Lock className="w-4 h-4" />
          TOMs Matrix (Art. 32)
        </button>

        <button
          onClick={() => setActiveTab('whistleblower')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'whistleblower'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Whistleblower (HinSchG)
        </button>

        <button
          onClick={() => setActiveTab('academy')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'academy'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Employee Academy & Certs
        </button>

        <button
          onClick={() => setActiveTab('dpas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'dpas'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          DPA Contracts & SCCs
        </button>

        <button
          onClick={() => setActiveTab('dpo')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'dpo'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          DPO Desk & Legal Advice
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'ropa' && <RopaRecordManager />}
            {activeTab === 'toms' && <TomsGovernanceMatrix />}
            {activeTab === 'whistleblower' && <WhistleblowerPortal />}
            {activeTab === 'academy' && <EmployeeComplianceAcademy />}
            {activeTab === 'dpas' && <DpaContractManager />}
            {activeTab === 'dpo' && <DpoAdvisoryDesk />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
