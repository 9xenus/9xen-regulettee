import React from "react";
import { Network, Globe, ArrowRight, ShieldAlert, CheckCircle2, Shield, Map, AlertTriangle } from "lucide-react";
import { GapAnalysisTool } from "../components/compliance/GapAnalysisTool";
import { EUDataResidencyMap } from "../components/compliance/EUDataResidencyMap";
import { TransferImpactAssessmentEngine } from "../components/compliance/TransferImpactAssessmentEngine";

export function DataFlowAdequacy() {
  const mapData = [
    { id: "1", region: "United States of America", health: 0.9 },
    { id: "2", region: "India", health: 0.7 },
    { id: "3", region: "China", health: 0.3 },
    { id: "4", region: "France", health: 0.8 },
    { id: "5", region: "Germany", health: 0.9 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Network className="w-7 h-7 text-indigo-600" />
            Data Flow & Adequacy Map
          </h1>
          <p className="text-slate-500 mt-1">Cross-border transfer monitoring, SCCs, and Transfer Impact Assessments (TIA).</p>
        </div>
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sovereign-compliance-changed', {
              detail: {
                message: "Transfer Impact Assessment (TIA) Report generated successfully. Active corridors meet DPF standards.",
                type: 'success',
                category: 'Data Residency'
              }
            }));
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Generate TIA Report
        </button>
      </div>
      
      <GapAnalysisTool tenantId="default" />
      
      {/* Autonomous TIA & SCC Generator Suite */}
      <TransferImpactAssessmentEngine />

      <EUDataResidencyMap />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Map className="w-5 h-5 text-indigo-500" />
            Active Transfer Corridors
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50/60 border border-emerald-100 rounded-lg">
              <div className="flex items-center gap-4 w-1/3">
                <div className="flex flex-col items-center">
                  <Globe className="w-6 h-6 text-slate-500 mb-1" />
                  <span className="text-xs font-bold text-slate-700">CH (Zurich) 🇨🇭</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Adequate Flow</span>
                  <div className="w-full h-px bg-emerald-300 relative my-1">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-emerald-400 rotate-45"></div>
                  </div>
                  <span className="text-[10px] text-slate-500">2.4 TB / day</span>
                </div>
                <div className="flex flex-col items-center">
                  <Globe className="w-6 h-6 text-slate-500 mb-1" />
                  <span className="text-xs font-bold text-slate-700">EU (Frankfurt) 🇪🇺</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Swiss FADP Mutual Adequacy
                </span>
                <span className="text-xs text-slate-500 mt-1">Vendor: Sovereign Private Cloud</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-4 w-1/3">
                <div className="flex flex-col items-center">
                  <Globe className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600">EU (Frankfurt)</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Data Flow</span>
                  <div className="w-full h-px bg-slate-300 relative my-1">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-400 rotate-45"></div>
                  </div>
                  <span className="text-[10px] text-slate-500">1.2 TB / day</span>
                </div>
                <div className="flex flex-col items-center">
                  <Globe className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600">US (Virginia)</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> DPF Certified
                </span>
                <span className="text-xs text-slate-500 mt-1">Vendor: AWS Cloud</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-4 w-1/3">
                <div className="flex flex-col items-center">
                  <Globe className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600">EU (Paris)</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Data Flow</span>
                  <div className="w-full h-px bg-slate-300 relative my-1">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-400 rotate-45"></div>
                  </div>
                  <span className="text-[10px] text-slate-500">500 GB / day</span>
                </div>
                <div className="flex flex-col items-center">
                  <Globe className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600">India (Mumbai)</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <Shield className="w-3.5 h-3.5" /> SCCs Required
                </span>
                <span className="text-xs text-slate-500 mt-1">Vendor: Support BPO</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-lg">
              <div className="flex items-center gap-4 w-1/3">
                <div className="flex flex-col items-center">
                  <Globe className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600">UK (London)</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Unmapped Flow</span>
                  <div className="w-full h-px bg-rose-300 relative my-1 line-dashed">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-rose-400 rotate-45"></div>
                  </div>
                  <span className="text-[10px] text-rose-500">Unknown</span>
                </div>
                <div className="flex flex-col items-center">
                  <Globe className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600">China (Beijing)</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  <ShieldAlert className="w-3.5 h-3.5" /> Blocked / Risk High
                </span>
                <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-1">Investigate TIA</button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Transfer Impact Assessments</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Completed (Valid)</span>
                <span className="font-bold text-slate-900">24</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Pending Review</span>
                <span className="font-bold text-amber-600">3</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Failed / Rejected</span>
                <span className="font-bold text-rose-600">1</span>
              </div>
            </div>
            <button className="w-full mt-6 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
              View Assessment Queue
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm text-white">
            <h3 className="font-semibold mb-2">Adequacy Radar</h3>
            <p className="text-sm text-indigo-200 mb-4">AI monitoring of adequacy decisions.</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">UK-US Data Bridge active. No action needed.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">Schrems III litigation risk detected. Monitoring CJEU rulings.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
