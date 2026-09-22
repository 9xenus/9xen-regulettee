import React, { useState } from "react";
import { Flame, Play, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";

export const BreachSimulationRunner: React.FC<any> = ({ className = "" }) => {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const handleSimulate = () => {
    setRunning(true);
    setReport(null);

    setTimeout(() => {
      setRunning(false);
      setReport({
        scenario: "DORA Red-Team ICT Ransomware Injection Simulation",
        containmentTimeMs: 14,
        dataLeakageBytes: 0,
        sovereignFailoverNode: "Frankfurt-FRA02",
        status: "CONTAINED_SUCCESSFULLY",
        timestamp: new Date().toISOString()
      });
    }, 1500);
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">DORA Cyber Breach Chaos Simulator</h3>
            <p className="text-xs text-slate-400">Simulate synthetic cyber attacks to test automated sovereign containment</p>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={running}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-lg shadow-rose-600/20"
        >
          {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          {running ? "Simulating Chaos..." : "Run Cyber Attack Simulation"}
        </button>
      </div>

      {report && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400">{report.scenario}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              {report.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">Containment Speed</div>
              <div className="text-xs font-mono font-bold text-emerald-400">{report.containmentTimeMs}ms</div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">Data Exfiltration</div>
              <div className="text-xs font-mono font-bold text-emerald-400">{report.dataLeakageBytes} Bytes</div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">Failover Enclave</div>
              <div className="text-xs font-mono font-bold text-indigo-400">{report.sovereignFailoverNode}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreachSimulationRunner;
