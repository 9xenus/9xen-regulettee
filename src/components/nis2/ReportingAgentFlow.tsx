import React, { useState } from 'react';
import { Bot, CheckCircle2, AlertCircle, Clock, ShieldAlert, Send, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Nis2Incident } from '../../types/nis2';

interface ReportingAgentFlowProps {
  incident: Nis2Incident;
  onApprove: (reportId?: string, notes?: string) => void;
}

export const ReportingAgentFlow: React.FC<ReportingAgentFlowProps> = ({ incident, onApprove }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  const handleApproveAction = () => {
    setIsApproved(true);
    onApprove(incident.id, 'Early warning CSIRT payload approved by Compliance Officer');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">NIS2 Reporting Agent Pipeline</h3>
            <p className="text-xs text-slate-500">Autonomous CSIRT / DPA Early Warning & Incident Notification Workflow</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> 24h Early Warning SLA Active
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className={`p-3 rounded-xl border transition-all ${
          currentStep >= 1 ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-mono">1</span>
            24h Early Warning
          </div>
          <p className="text-[11px] text-slate-500">Initial notification to National CSIRT & ENISA</p>
        </div>

        <div className={`p-3 rounded-xl border transition-all ${
          currentStep >= 2 ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200' : 'border-slate-200 dark:border-slate-800 opacity-60'
        }`}>
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-mono">2</span>
            72h Full Assessment
          </div>
          <p className="text-[11px] text-slate-500">Detailed severity, cross-border impact & forensic analysis</p>
        </div>

        <div className={`p-3 rounded-xl border transition-all ${
          currentStep >= 3 ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200' : 'border-slate-200 dark:border-slate-800 opacity-60'
        }`}>
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-mono">3</span>
            Final Incident Report
          </div>
          <p className="text-[11px] text-slate-500">1-Month post-incident audit & mitigation report</p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-indigo-500" /> Drafted Early Warning Payload (CSIRT Protocol v2)
        </h4>

        <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] space-y-1">
          <div>INCIDENT_REF: {incident.id}</div>
          <div>ENTITY_CATEGORY: Essential Service Operator (FinTech/Banking)</div>
          <div>IMPACTED_JURISDICTIONS: DE, FR, NL</div>
          <div>PRIMARY_VECTOR: Supply Chain / Sub-processor Ransomware</div>
          <div>CLASSIFICATION: Significant Operational Disruption (NIS2 Art. 23)</div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-500 italic">Human-in-the-loop review required prior to dispatch.</span>
          {isApproved ? (
            <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dispatched to National CSIRT
            </span>
          ) : (
            <button
              onClick={handleApproveAction}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Approve & Dispatch Early Warning
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportingAgentFlow;
