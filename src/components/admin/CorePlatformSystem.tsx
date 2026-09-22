import React, { useState } from 'react';
import { RegionalRegulatorManager } from '../RegionalRegulatorManager';
import { LawyerConsultantManager } from './LawyerConsultantManager';
import { ConsultationManager } from './ConsultationManager';
import { RegionalComplianceConfig } from './RegionalComplianceConfig';
import { Globe, Users, Building2, Server, MessageSquare, ShieldAlert } from 'lucide-react';

export const CorePlatformSystem: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'REGULATORS' | 'LAWYERS' | 'CONSULTATIONS' | 'REGIONAL_COMPLIANCE'>('REGULATORS');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Server className="w-6 h-6 text-indigo-600" />
            Core Platform System
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise-grade configuration for regional Regulatory Organizations, Legal/Consulting partners, and Secure Consultations.
          </p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('REGULATORS')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'REGULATORS' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Building2 className="w-4 h-4" />
          Regulatory Organizations
        </button>
        <button
          onClick={() => setActiveSubTab('LAWYERS')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'LAWYERS' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Users className="w-4 h-4" />
          Lawyer / Consultant List
        </button>
        <button
          onClick={() => setActiveSubTab('CONSULTATIONS')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'CONSULTATIONS' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <MessageSquare className="w-4 h-4" />
          Consultation Rooms
        </button>
        <button
          onClick={() => setActiveSubTab('REGIONAL_COMPLIANCE')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'REGIONAL_COMPLIANCE' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <ShieldAlert className="w-4 h-4" />
          Regional Compliance Configuration
        </button>
      </div>

      <div className="pt-2">
        {activeSubTab === 'REGULATORS' ? (
          <RegionalRegulatorManager />
        ) : activeSubTab === 'LAWYERS' ? (
          <LawyerConsultantManager />
        ) : activeSubTab === 'CONSULTATIONS' ? (
          <ConsultationManager />
        ) : (
          <RegionalComplianceConfig />
        )}
      </div>
    </div>
  );
};
