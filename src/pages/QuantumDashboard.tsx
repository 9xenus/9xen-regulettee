import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from "react";
import { QuantumSecureVault } from "../components/QuantumSecureVault";
import { ShieldCheck, Server, AlertTriangle, ShieldAlert, Cpu, Activity, Info, Key, FileWarning, ArrowRight } from "lucide-react";
import { UpgradeGate } from "../hooks/useSubscriptionCheck";
import { useNotification } from '../context/NotificationContext';

interface CryptoAsset {
  id: string;
  endpoint: string;
  type: string;
  algorithm: string;
  keySize: number;
  usage: string;
  expiry: string;
}

export function QuantumDashboard() {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const runScan = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry("/api/v1/quantum/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoints: [
            "https://api.internal.svc",
            "https://client-portal.eu",
            "db-node-primary:5432"
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setScanResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyConfigurations = async () => {
    if (!scanResult) return;
    try {
      const res = await fetchWithRetry("/api/v1/quantum/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cryptoAgilityConfig: scanResult.migrationPlan.cryptoAgilityConfig })
      });
      const data = await res.json();
      if (data.success) {
        showToast("PQC configurations applied successfully!", 'success');
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to apply configurations.", 'error');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <UpgradeGate featureId="quantum-engine" tenantId="DEFAULT_TENANT" tenantName="Acme Corp EU">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-7 h-7 text-indigo-600" />
            Quantum Cyber Attack Protection Engine
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Detect, assess, and auto-fix quantum-related cryptographic risks (NIS2 / EU PQC roadmap).
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Activity className="w-4 h-4 animate-spin" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          Run Quantum Risk Scan
        </button>
      </div>

      {!scanResult && !loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No Scan Data Available</h2>
          <p className="text-slate-500 max-w-md mt-2 mb-6">
            Initiate a scan to map your cryptographic assets and assess your exposure to Quantum-vulnerable algorithms based on NIS2 and ENISA guidelines.
          </p>
        </div>
      )}

      {scanResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Risk Score & Overview */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 lg:p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Quantum Risk Score</h3>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                    <circle 
                      cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 - (251.2 * scanResult.quantumRiskScore.score) / 100}
                      className={scanResult.quantumRiskScore.score > 50 ? "text-rose-500" : "text-amber-500"} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{scanResult.quantumRiskScore.score}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Exposure Level: <span className="text-rose-600 font-bold">Critical</span></p>
                  <p className="text-xs text-slate-500 mt-1">Vulnerable Algos: {scanResult.quantumRiskScore.vulnerableAlgorithms.join(", ")}</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-indigo-900">NIS2 Penalty Exposure</h4>
                  <p className="text-xs text-indigo-700 mt-1">Failure to transition critical TLS to PQC-compliant algorithms by end-2026 could result in fines up to €10M or 2% of global turnover under NIS2 transposition laws.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Crypto Inventory */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto h-full">
              <div className="p-5 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-500" />
                  Cryptographic Asset Inventory
                </h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {scanResult.cryptoInventory.map((asset: CryptoAsset, idx: number) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={"w-2 h-2 rounded-full " + (asset.algorithm === 'RSA' || asset.algorithm === 'ECDSA' ? 'bg-rose-500' : 'bg-emerald-500')} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{asset.endpoint}</p>
                        <p className="text-xs text-slate-500">{asset.type} • {asset.usage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-medium " + (asset.algorithm === 'RSA' || asset.algorithm === 'ECDSA' ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800")}>
                        {asset.algorithm} ({asset.keySize} bit)
                      </span>
                      <p className="text-xs text-slate-500 mt-1">Exp: {new Date(asset.expiry).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Migration Plan */}
          <div className="lg:col-span-3 mt-2">
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-slate-500" />
                  PQC Auto-Fix & Migration Plan
                </h3>
                <button 
                  onClick={applyConfigurations}
                  className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1"
                >
                  Apply Configurations <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Action Steps</h4>
                  <div className="space-y-4">
                    {scanResult.migrationPlan.steps.map((step: any, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {step.phase}
                        </div>
                        <div>
                          <p className="text-sm text-slate-800 font-medium">{step.action}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Target: {step.targetAlgorithms.join(", ")} • Complexity: {step.estimatedComplexity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Generated Policy Updates</h4>
                   <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                     {scanResult.migrationPlan.policyUpdates.map((policy: string, idx: number) => (
                       <div key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                         <span>{policy}</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
      </UpgradeGate>
      <QuantumSecureVault />
    </div>
  );
}
