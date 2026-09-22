import React from "react";
import { Globe, Map, Server, ArrowRightLeft, ShieldCheck, Scale, Database } from "lucide-react";

export function SovereigntyArbitrage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-7 h-7 text-indigo-600" />
            Sovereignty Arbitrage Engine
          </h1>
          <p className="text-slate-500 mt-1">Multi-cloud regulatory alignment, risk routing, and jurisdiction optimization.</p>
        </div>
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sovereign-compliance-changed', {
              detail: {
                message: "Workload routing successfully optimized! Computational task shifted from US-East to EU-Central node (+18% compliance score).",
                type: 'info',
                category: 'Sovereignty Arbitrage'
              }
            }));
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <ArrowRightLeft className="w-4 h-4" /> Optimize Workload Routing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-500" /> Source: US-East
            </h3>
            <span className="text-xs font-medium bg-rose-100 text-rose-700 px-2 py-1 rounded">High Legal Risk</span>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Current compute footprint for AI training.</p>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">GDPR Adequacy</span>
              <span className="font-medium text-rose-600">Failed (FISA 702)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">AI Act Status</span>
              <span className="font-medium text-amber-600">Unregulated</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Compute Cost</span>
              <span className="font-medium text-emerald-600">$0.04 / vCPUh</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recommended Shift</span>
            <div className="w-16 h-12 flex items-center justify-center border border-slate-300 rounded-full bg-slate-50 text-slate-400">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-indigo-600">+18% Compliance Score</span>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-indigo-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" /> Target: EU-Central
            </h3>
            <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Safe Harbor</span>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-indigo-800">Optimized target for sensitive data workloads.</p>
            <div className="flex justify-between text-sm">
              <span className="text-indigo-700">GDPR Adequacy</span>
              <span className="font-bold text-emerald-700">Native</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-indigo-700">AI Act Status</span>
              <span className="font-bold text-indigo-900">Harmonized</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-indigo-700">Compute Cost</span>
              <span className="font-medium text-amber-600">$0.06 / vCPUh</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm mt-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-500" />
          Jurisdiction Risk Index
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Jurisdiction</th>
                <th className="px-6 py-4 font-medium">Privacy Stringency</th>
                <th className="px-6 py-4 font-medium">Data Localization</th>
                <th className="px-6 py-4 font-medium">IP Protection</th>
                <th className="px-6 py-4 font-medium">Arbitrage Opportunity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                  <span className="text-lg">🇪🇺</span> European Union
                </td>
                <td className="px-6 py-4"><span className="text-rose-600 font-bold">Maximum</span></td>
                <td className="px-6 py-4">High (Schrems II)</td>
                <td className="px-6 py-4">Strong</td>
                <td className="px-6 py-4"><span className="text-emerald-600 font-medium">High (Trust Premium)</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                  <span className="text-lg">🇨🇭</span> Switzerland
                </td>
                <td className="px-6 py-4"><span className="text-rose-600 font-bold">High</span></td>
                <td className="px-6 py-4">Moderate</td>
                <td className="px-6 py-4">Very Strong</td>
                <td className="px-6 py-4"><span className="text-emerald-600 font-medium">Very High (Safe Haven)</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                  <span className="text-lg">🇺🇸</span> United States
                </td>
                <td className="px-6 py-4"><span className="text-amber-600 font-bold">Fragmented</span></td>
                <td className="px-6 py-4">Low</td>
                <td className="px-6 py-4">Strong</td>
                <td className="px-6 py-4"><span className="text-amber-600 font-medium">Moderate (Innovation)</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                  <span className="text-lg">🇮🇳</span> India
                </td>
                <td className="px-6 py-4"><span className="text-amber-600 font-bold">Emerging (DPDP)</span></td>
                <td className="px-6 py-4">High</td>
                <td className="px-6 py-4">Moderate</td>
                <td className="px-6 py-4"><span className="text-rose-600 font-medium">Low (Cost only)</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
