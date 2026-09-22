import React from "react";
import { Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export interface CalendarEvent {
  id?: string;
  date: string;
  title: string;
  type?: string;
  description?: string;
  status?: string;
  urgency?: string;
  category?: string;
}

export const ComplianceCalendar: React.FC<any> = ({ className = "" }) => {
  const deadlines: CalendarEvent[] = [
    { date: "2026-09-15", title: "EU AI Act Annex IV Technical File Renewal", status: "UPCOMING", urgency: "HIGH" },
    { date: "2026-09-30", title: "GDPR Article 30 Bi-Annual RoPA Review", status: "UPCOMING", urgency: "MEDIUM" },
    { date: "2026-10-15", title: "DORA Annual ICT Resilience Penetration Audit", status: "SCHEDULED", urgency: "NORMAL" }
  ];

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Statutory Filings Calendar</h3>
          <p className="text-xs text-slate-400">Upcoming regulatory compliance deadlines & submission targets</p>
        </div>
      </div>

      <div className="space-y-2">
        {deadlines.map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">{item.title}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.date}</div>
            </div>

            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              item.urgency === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceCalendar;
