import React, { useState } from "react";
import { GitGraph, Bot, ArrowRight, Play, CheckCircle2, Sparkles } from "lucide-react";

export const B2gLangGraphEngine: React.FC<any> = ({ className = "" }) => {
  const [nodes] = useState([
    { name: "Public Sector Inbound Ingest", type: "trigger", status: "COMPLETED" },
    { name: "LangGraph Regulatory Agent", type: "agent", status: "PROCESSING" },
    { name: "Legal Reasoning Node", type: "llm", status: "PENDING" },
    { name: "B2G Statutory Filing Action", type: "action", status: "PENDING" }
  ]);
  const [running, setRunning] = useState(false);

  const handleExecuteGraph = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
    }, 1200);
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <GitGraph className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              B2G LangGraph Autonomous Reasoning Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Stateful Agent
              </span>
            </h3>
            <p className="text-xs text-slate-400">Multi-node graph agent executing public sector statutory compliance filings</p>
          </div>
        </div>

        <button
          onClick={handleExecuteGraph}
          disabled={running}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {running ? "Graph Executing..." : "Run LangGraph Agent"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        {nodes.map((node, i) => (
          <div key={node.name} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider mb-1">Node 0{i + 1}</div>
            <div className="text-xs font-semibold text-white mb-2 leading-tight">{node.name}</div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
              node.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              node.status === 'PROCESSING' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse' :
              'bg-slate-800 text-slate-500'
            }`}>
              {node.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default B2gLangGraphEngine;
