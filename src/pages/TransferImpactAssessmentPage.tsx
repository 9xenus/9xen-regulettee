import React from 'react';
import { TransferImpactAssessmentEngine } from '../components/compliance/TransferImpactAssessmentEngine';
import { Network, Globe, ArrowLeft, ShieldCheck } from 'lucide-react';

export const TransferImpactAssessmentPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>DATA TRANSFERS & SOVEREIGNTY</span>
            <span>/</span>
            <span className="text-slate-500">TIA & SCC ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Network className="w-7 h-7 text-indigo-600" />
            Transfer Impact Assessment (TIA) & SCC Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated compliance evaluation for international cross-border data transfers under GDPR Chapter V, Schrems II, and KSA PDPL.
          </p>
        </div>
      </div>

      <TransferImpactAssessmentEngine />
    </div>
  );
};

export default TransferImpactAssessmentPage;
