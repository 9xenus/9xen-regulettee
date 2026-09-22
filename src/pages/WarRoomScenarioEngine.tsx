import React from "react";
import { Swords, Play, Clock, Users, ShieldAlert, Crosshair, CheckCircle2 } from "lucide-react";

export function WarRoomScenarioEngine() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Swords className="w-7 h-7 text-indigo-600" />
            War-Room Scenario Engine
          </h1>
          <p className="text-slate-500 mt-1">Interactive tabletop exercises (TTX) and live-fire breach simulations.</p>
        </div>
        <button className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          <Play className="w-4 h-4" /> Start New Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-slate-900 rounded-xl overflow-x-auto shadow-sm border border-slate-800">
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-rose-500" />
                Active TTX: Operation Midnight
              </h3>
              <span className="animate-pulse flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Live Inject
              </span>
            </div>
            
            <div className="p-4 sm:p-5 lg:p-6 bg-slate-800/50">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-600">T-0</div>
                    <div className="w-0.5 h-full bg-slate-700 my-1"></div>
                  </div>
                  <div className="pb-4">
                    <h4 className="text-sm font-bold text-slate-200">Initial Alert: Suspicious Egress</h4>
                    <p className="text-sm text-slate-400 mt-1">SOC detects 50GB encrypted outbound traffic to an unknown Russian IP block.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-600">T+15</div>
                    <div className="w-0.5 h-full bg-slate-700 my-1"></div>
                  </div>
                  <div className="pb-4">
                    <h4 className="text-sm font-bold text-slate-200">Runbook Executed</h4>
                    <p className="text-sm text-slate-400 mt-1">Incident commander triggers 'Ransomware Containment' playbook. Affected VPCs isolated.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-xs ring-4 ring-slate-900">T+45</div>
                  </div>
                  <div className="pb-4 w-full">
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                      <h4 className="text-sm font-bold text-rose-400">Master Inject: The Extortion Email</h4>
                      <p className="text-sm text-slate-300 mt-1 mb-4">"We have downloaded your customer SQL databases. Pay 50 BTC or we leak to the press in 48 hours."</p>
                      
                      <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Required Decisions</h5>
                        <div className="space-y-2">
                          <button className="w-full text-left px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded border border-slate-600 transition-colors">
                            1. Notify Legal & Trigger Cyber Insurance Retainer
                          </button>
                          <button className="w-full text-left px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded border border-slate-600 transition-colors">
                            2. Engage Negotiator (Do Not Pay yet)
                          </button>
                          <button className="w-full text-left px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded border border-slate-600 transition-colors">
                            3. Draft preliminary 72-hour GDPR notification (ICO)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Scenario Library</h3>
            <div className="space-y-3">
              <div className="p-3 border border-indigo-200 bg-indigo-50 rounded-lg cursor-pointer">
                <h4 className="font-medium text-indigo-900 text-sm">Operation Midnight (Active)</h4>
                <p className="text-xs text-indigo-700 mt-1">Double-extortion ransomware affecting AWS US-East.</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-500"><Users className="w-3 h-3" /> 5 Roles</span>
                  <span className="flex items-center gap-1 text-slate-500"><Clock className="w-3 h-3" /> 2h</span>
                </div>
              </div>

              <div className="p-3 border border-slate-200 hover:border-slate-300 rounded-lg cursor-pointer transition-colors">
                <h4 className="font-medium text-slate-900 text-sm">Deepfake CEO Fraud</h4>
                <p className="text-xs text-slate-500 mt-1">AI voice cloning used to authorize $5M wire transfer.</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-400"><Users className="w-3 h-3" /> 3 Roles</span>
                  <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" /> 1h</span>
                </div>
              </div>

              <div className="p-3 border border-slate-200 hover:border-slate-300 rounded-lg cursor-pointer transition-colors">
                <h4 className="font-medium text-slate-900 text-sm">Rogue AI Model</h4>
                <p className="text-xs text-slate-500 mt-1">Customer support chatbot begins emitting PII in responses.</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-400"><Users className="w-3 h-3" /> 4 Roles</span>
                  <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" /> 1.5h</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Past Drill Performance</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                <span className="font-bold text-slate-900">82%</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Average Readiness</p>
                <p className="text-xs text-slate-500 mt-0.5">Across 4 recent TTXs</p>
              </div>
            </div>
            <ul className="text-sm space-y-2">
              <li className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Comm Protocol</span>
                <span className="font-medium">Pass</span>
              </li>
              <li className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Legal Notification</span>
                <span className="font-medium">Pass</span>
              </li>
              <li className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-500" /> Out-of-Band Comms</span>
                <span className="font-medium text-amber-600">Fail</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
