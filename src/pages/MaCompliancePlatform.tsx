import React from "react";
import { Users, Search, Activity, ShieldAlert, CheckCircle2, FileText, ArrowRight, UploadCloud } from "lucide-react";

export function MaCompliancePlatform() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            M&A Compliance Platform
          </h1>
          <p className="text-slate-500 mt-1">Due diligence, Virtual Data Room (VDR) scanning, and post-merger integration.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          <UploadCloud className="w-4 h-4" /> Connect VDR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-slate-900">Project Orion</h3>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
              Due Diligence
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Overall Compliance Risk</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-sm font-bold text-amber-600">High</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="block text-slate-500 text-xs">VDR Docs Scanned</span>
                <span className="font-bold text-slate-900">1,492 / 2,100</span>
              </div>
              <div className="p-2 bg-rose-50 rounded border border-rose-100">
                <span className="block text-rose-600 text-xs">Red Flags</span>
                <span className="font-bold text-rose-700">14</span>
              </div>
            </div>
            <button className="w-full mt-2 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded transition-colors flex items-center justify-center gap-1">
              View Deal Room <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-slate-900">Project Titan</h3>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
              Post-Merger
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Integration Progress</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-bold text-emerald-600">85%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="block text-slate-500 text-xs">Policies Migrated</span>
                <span className="font-bold text-slate-900">42 / 45</span>
              </div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">
                <span className="block text-amber-600 text-xs">Pending Tasks</span>
                <span className="font-bold text-amber-700">3</span>
              </div>
            </div>
            <button className="w-full mt-2 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded transition-colors flex items-center justify-center gap-1">
              View Integration Plan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="font-medium text-slate-900">Start New Deal</h3>
          <p className="text-sm text-slate-500 mt-1">Initialize a secure enclave for a new M&A target.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">AI Diligence Findings (Project Orion)</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Filter findings..." className="pl-9 pr-4 py-1.5 text-sm rounded-md border border-slate-300" />
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="p-4 flex gap-4 hover:bg-slate-50 transition-colors">
            <div className="mt-1">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-medium text-slate-900">Undeclared PII Cross-Border Transfers</h4>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Critical</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">Target company's HR database backs up to US servers. No SCCs found in vendor agreements.</p>
              <div className="mt-2 flex gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Found in: Master_Services_Agreement_AWS.pdf</span>
              </div>
            </div>
          </div>
          <div className="p-4 flex gap-4 hover:bg-slate-50 transition-colors">
            <div className="mt-1">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-medium text-slate-900">Incomplete CCPA Opt-Out Mechanism</h4>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">High Risk</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">Marketing site lacks a "Do Not Sell My Personal Information" link, risking statutory damages.</p>
              <div className="mt-2 flex gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Found in: Privacy_Policy_V3.docx</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
