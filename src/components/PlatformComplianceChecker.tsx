import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Sliders, Play, Settings } from 'lucide-react';

export const PlatformComplianceChecker = ({ activePath }: { activePath: string }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [missingPolicies, setMissingPolicies] = useState([
    { id: '1', law: 'GDPR (EU)', issue: 'Data Retention Policy Missing', severity: 'High', status: 'Pending' },
    { id: '2', law: 'CCPA (US)', issue: 'Do Not Sell Link Not Prominent', severity: 'Medium', status: 'Pending' },
    { id: '3', law: 'AI Act (EU)', issue: 'AI Risk Register Incomplete', severity: 'High', status: 'Pending' },
  ]);

  const handleScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 2000);
  };

  const implementPolicy = (id: string) => {
    setMissingPolicies(policies => policies.map(p => p.id === id ? { ...p, status: 'Implemented' } : p));
  };

  const implementAll = () => {
    setMissingPolicies(policies => policies.map(p => ({ ...p, status: 'Implemented' })));
  };

  if (activePath === 'platform-policy-engine') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-4 sm:p-5 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            Policy Enforcement Engine
          </h2>
          <button 
            onClick={implementAll}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            Implement All Missing Policies
          </button>
        </div>
        
        <p className="text-slate-500 text-sm mb-6">
          Review and enforce missing legal policies automatically across the platform architecture.
        </p>

        <div className="space-y-4">
          {missingPolicies.map(policy => (
            <div key={policy.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
              <div className="flex items-center gap-4">
                {policy.status === 'Implemented' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                ) : (
                  <AlertTriangle className={`w-8 h-8 ${policy.severity === 'High' ? 'text-rose-500' : 'text-amber-500'}`} />
                )}
                <div>
                  <h4 className="font-bold text-slate-800">{policy.issue}</h4>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">{policy.law} • Severity: {policy.severity}</p>
                </div>
              </div>
              <div>
                {policy.status === 'Implemented' ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">Enforced</span>
                ) : (
                  <button 
                    onClick={() => implementPolicy(policy.id)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 font-bold text-xs rounded-lg transition-colors"
                  >
                    Implement Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-4 sm:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          Law Violation Scanner
        </h2>
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isScanning ? (
            <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> Scanning...</span>
          ) : (
            <span className="flex items-center gap-2"><Play className="w-4 h-4" /> Run Deep Scan</span>
          )}
        </button>
      </div>

      {!scanComplete && !isScanning && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <Settings className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">Ready to Scan</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">Initiate a deep architecture scan to detect GDPR, AI Act, and CCPA violations in the platform design.</p>
        </div>
      )}

      {isScanning && (
        <div className="text-center py-12 border-2 border-dashed border-indigo-100 bg-indigo-50/50 rounded-xl">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <h3 className="font-bold text-indigo-900">Analyzing Platform Infrastructure...</h3>
          <p className="text-sm text-indigo-600/70 max-w-sm mx-auto mt-1">Checking data flows, storage policies, and UI layouts against global regulations.</p>
        </div>
      )}

      {scanComplete && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
              <div className="text-rose-600 font-black text-2xl">3</div>
              <div className="text-rose-800 font-bold text-xs uppercase tracking-wider">Critical Violations</div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="text-amber-600 font-black text-2xl">1</div>
              <div className="text-amber-800 font-bold text-xs uppercase tracking-wider">Warnings</div>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="text-emerald-600 font-black text-2xl">142</div>
              <div className="text-emerald-800 font-bold text-xs uppercase tracking-wider">Passed Checks</div>
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-slate-800 mb-3 text-sm">Detected Issues</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-slate-600">
                <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <span><strong className="text-slate-800">GDPR Article 5:</strong> Data retention limits not enforced on tenant logs database.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-600">
                <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <span><strong className="text-slate-800">EU AI Act:</strong> Missing AI transparency disclosures on the generative dashboard modules.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-600">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span><strong className="text-slate-800">CCPA:</strong> 'Do Not Sell My Info' routing missing from the primary footer navigation.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
