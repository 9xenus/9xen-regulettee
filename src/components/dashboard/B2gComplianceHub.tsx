import React from 'react';
import { ShieldCheck, AlertTriangle, FileText, Send, Users } from 'lucide-react';

interface B2gComplianceHubProps {
  complianceScore: number;
  openViolations: number;
  upcomingDeadlines: number;
}

export const B2gComplianceHub: React.FC<B2gComplianceHubProps> = ({
  complianceScore,
  openViolations,
  upcomingDeadlines,
}) => {
  return (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-indigo-600" />
        B2G Compliance Hub
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
          <p className="text-slate-500 text-xs font-bold uppercase mb-1">Compliance Score</p>
          <p className={`text-3xl font-black ${complianceScore > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {complianceScore}%
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
          <p className="text-slate-500 text-xs font-bold uppercase mb-1">Open Violations</p>
          <p className={`text-3xl font-black ${openViolations > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {openViolations}
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
          <p className="text-slate-500 text-xs font-bold uppercase mb-1">Upcoming Deadlines</p>
          <p className="text-3xl font-black text-slate-900">{upcomingDeadlines}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors text-sm">
          <FileText className="w-4 h-4" />
          Request Report
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
          <Users className="w-4 h-4" />
          Contact Regulator
        </button>
      </div>
    </div>
  );
};
