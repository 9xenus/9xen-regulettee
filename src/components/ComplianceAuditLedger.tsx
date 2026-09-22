import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, Filter, Lock, RefreshCw } from "lucide-react";

export const ComplianceAuditLedger: React.FC<any> = ({ className = "" }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadEvents = () => {
    setLoading(true);
    fetch(`/api/v1/audit/trail?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, [search]);

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Cryptographic Immutable Audit Ledger</h3>
            <p className="text-xs text-slate-400">SHA-256 tamper-evident compliance execution history</p>
          </div>
        </div>

        <button onClick={loadEvents} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search audit trail events by actor or action..."
          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="space-y-2">
        {events.slice(0, 5).map((e) => (
          <div key={e.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">{e.action}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {e.actor} • {e.category} • {e.timestamp}
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              e.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
              e.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {e.severity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceAuditLedger;
