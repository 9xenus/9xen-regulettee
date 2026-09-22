import React, { useState } from "react";
import { AlertOctagon, CheckCircle2, Clock, Send, ShieldAlert, ArrowRight } from "lucide-react";

export const AutomatedIncidentWorkflow: React.FC<any> = ({ className = "" }) => {
  const [incidents, setIncidents] = useState([
    { id: "INC-2026-001", title: "Potential Unregistered PII Export (GDPR Art. 33)", status: "DISPATCHED", priority: "HIGH", timestamp: "10 mins ago" },
    { id: "INC-2026-002", title: "DORA Third-Party API Latency Spike (>500ms)", status: "RESOLVED", priority: "MEDIUM", timestamp: "2 hours ago" },
  ]);

  const [newTitle, setNewTitle] = useState("");

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIncidents([
      {
        id: `INC-2026-00${incidents.length + 1}`,
        title: newTitle,
        status: "DISPATCHED",
        priority: "HIGH",
        timestamp: "Just now"
      },
      ...incidents
    ]);
    setNewTitle("");
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Automated Regulatory Incident Workflow</h3>
          <p className="text-xs text-slate-400">72-Hour statutory notification trigger to EDPB & National Authorities</p>
        </div>
      </div>

      <form onSubmit={handleCreateIncident} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Dispatch custom regulatory incident alert (e.g. DORA ICT Outage)..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
        />
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-lg shadow-rose-600/20 disabled:bg-slate-800"
        >
          <Send className="w-3.5 h-3.5" /> Dispatch
        </button>
      </form>

      <div className="space-y-2">
        {incidents.map((inc) => (
          <div key={inc.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${inc.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {inc.status === 'RESOLVED' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">{inc.title}</div>
                <div className="text-[10px] text-slate-400 font-mono">{inc.id} • {inc.timestamp}</div>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                inc.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {inc.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomatedIncidentWorkflow;
