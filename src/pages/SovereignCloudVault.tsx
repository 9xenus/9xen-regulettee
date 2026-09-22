import React, { useState } from "react";
import { Cloud, Lock, Shield, Server, FileCheck2, Database, Activity } from "lucide-react";

export function SovereignCloudVault() {
  const [loading, setLoading] = useState(false);
  const [mapped, setMapped] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-7 h-7 text-indigo-600" />
            Sovereign Data Guardian & Vault
          </h1>
          <p className="text-slate-500 mt-1">Map data flows to Data Act / AI Act requirements and store compliance evidence securely.</p>
        </div>
        <button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); setMapped(true); }, 1000) }} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          Scan Cloud Config
        </button>
      </div>

      {mapped ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6">
             <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Cloud className="w-5 h-5" /> Cloud Provider Posture</h3>
             <div className="space-y-4">
               <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                 <p className="text-sm font-bold text-emerald-900">EU Data Residency (Gaia-X)</p>
                 <p className="text-xs text-emerald-700 mt-1">Verified: Frankfurt, Paris regions active. No US data transfers detected.</p>
               </div>
               <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg">
                 <p className="text-sm font-bold text-rose-900">Key Management (KMS)</p>
                 <p className="text-xs text-rose-700 mt-1">Gap: External Key Management (EKM) required for strict sovereignty compliance.</p>
               </div>
             </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6">
             <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><FileCheck2 className="w-5 h-5" /> Auto-Compliance Vault</h3>
             <ul className="space-y-3">
               <li className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                 <div className="flex items-center gap-3">
                   <Lock className="w-4 h-4 text-slate-400" />
                   <span className="text-sm font-medium text-slate-700">DPIA - AI Processing Module</span>
                 </div>
                 <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">Stored</span>
               </li>
               <li className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                 <div className="flex items-center gap-3">
                   <Server className="w-4 h-4 text-slate-400" />
                   <span className="text-sm font-medium text-slate-700">Cloud Act Shielding Policy</span>
                 </div>
                 <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">Stored</span>
               </li>
             </ul>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Database className="w-12 h-12 text-indigo-100 mx-auto mb-4" />
          <p className="text-slate-500">Connect your AWS/Azure/GCP environment or Gaia-X node to begin sovereignty mapping.</p>
        </div>
      )}
    </div>
  );
}
