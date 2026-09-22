import React from "react";
import { Leaf, Cloud, Wind, Zap, BarChart3, TrendingDown, ArrowRight, CheckCircle2 } from "lucide-react";

export function EsgGreenData() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Leaf className="w-7 h-7 text-emerald-600" />
            ESG & Green Data Tracker
          </h1>
          <p className="text-slate-500 mt-1">Real-time carbon footprint and sustainability compliance monitoring.</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Generate CSRD Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Cloud className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-800">Total Emissions (YTD)</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">4,280</span>
            <span className="text-slate-500 mb-1">tCO2e</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 font-medium">
            <TrendingDown className="w-4 h-4" />
            12% lower than last year
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-800">Renewable Energy Mix</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">74</span>
            <span className="text-slate-500 mb-1">%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '74%' }}></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800">Reporting Compliance</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">CSRD</span>
            <span className="text-slate-500 mb-1">Aligned</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            Next Audit: <span className="font-medium text-slate-900">Q4 2026</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-6">Emissions by Scope</h3>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Scope 1 (Direct)</span>
                <span className="text-slate-500">450 tCO2e</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Scope 2 (Indirect Power)</span>
                <span className="text-slate-500">1,230 tCO2e</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Scope 3 (Supply Chain)</span>
                <span className="text-slate-500">2,600 tCO2e</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-300 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-sky-500" />
            AI Optimization Opportunities
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-sky-50 border border-sky-100 rounded-lg">
              <h4 className="font-medium text-sky-900">Shift Compute Workloads</h4>
              <p className="text-sm text-sky-800 mt-1">Moving your non-critical AI training pipelines from US-East to EU-North during off-peak hours could save an estimated 120 tCO2e annually due to higher renewable energy availability.</p>
              <button className="mt-3 text-sm font-medium text-sky-700 hover:text-sky-900 flex items-center gap-1">
                Configure Automated Shift <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
              <h4 className="font-medium text-slate-900">High-Emitting Vendor Detected</h4>
              <p className="text-sm text-slate-600 mt-1">Your logistics provider (Vendor ID: V-491) has reported a 20% increase in their Scope 1 emissions, impacting your Scope 3 goals.</p>
              <button className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                View Supply Chain Audit <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
