import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2 } from "lucide-react";

export const ComplianceTimeline: React.FC<any> = ({ className = "" }) => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/compliance/timeline')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEvents(data.data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Regulatory Milestones Timeline</h3>
          <p className="text-xs text-slate-400">Historical milestone execution and statutory filing verification</p>
        </div>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.map((e, idx) => (
          <div key={idx} className="relative">
            <div className="absolute -left-6 top-1 p-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-[10px] font-mono text-cyan-400">{e.date} • {e.category}</div>
            <div className="text-xs font-semibold text-white mt-0.5">{e.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceTimeline;
