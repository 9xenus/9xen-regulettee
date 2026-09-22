import React, { useState, useEffect } from "react";
import { Key, ShieldAlert, Cpu, Database, Network, Clock, CheckCircle2, Activity, Server, Globe, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MigrationModule {
  id: string;
  name: string;
  progress: number;
  status: "idle" | "migrating" | "complete";
  icon: React.ElementType;
  target: string;
}

const PQC_MODULES: MigrationModule[] = [
  { id: "net", name: "Network Infrastructure", progress: 85, status: "migrating", icon: Globe, target: "ML-KEM/L3" },
  { id: "data", name: "Data-at-Rest Encryption", progress: 42, status: "migrating", icon: Database, target: "AES-256-PQC" },
  { id: "auth", name: "Identity & Access Mgmt", progress: 100, status: "complete", icon: Lock, target: "ML-DSA-65" },
  { id: "app", name: "Application Layer Apps", progress: 12, status: "migrating", icon: Cpu, target: "Hybrid KEM" },
];

export function PqcMigrationPlanner() {
  const [modules, setModules] = useState<MigrationModule[]>(PQC_MODULES);
  const [velocity, setVelocity] = useState(1.0);

  useEffect(() => {
    const interval = setInterval(() => {
      setModules(prev => prev.map(m => {
        if (m.status === "migrating" && m.progress < 100) {
          const increment = Math.random() * 2 * velocity; // Velocity affects real-time progress too!
          const nextProgress = Math.min(100, m.progress + increment);
          return {
            ...m,
            progress: nextProgress,
            status: nextProgress === 100 ? "complete" : "migrating"
          };
        }
        return m;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [velocity]);

  const avgProgress = modules.reduce((acc, m) => acc + m.progress, 0) / modules.length;
  const remaining = 100 - avgProgress;
  const monthsRemaining = remaining / (10 * velocity);
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + Math.max(0, Math.ceil(monthsRemaining)));

  const COMPLIANCE_DEADLINE = new Date("2027-12-31");
  const isBelowVelocity = completionDate > COMPLIANCE_DEADLINE;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Key className="w-7 h-7 text-indigo-600" />
            PQC Migration Planner
          </h1>
          <p className="text-slate-500 mt-1">NIST Post-Quantum Cryptography transition roadmap & inventory.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium">
            Export CNSA 2.0 Report
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isBelowVelocity && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-3"
          >
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Deadline Alert: Velocity Insufficient</h4>
              <p className="text-sm">Current velocity will miss the 2027 compliance deadline. Please increase development speed or resource allocation.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-bold text-slate-900">Y2Q Risk Exposure</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">18%</p>
          <p className="text-sm text-slate-500 mt-1">Enterprise footprint still relying on classical RSA/ECC</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Database className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-900">SNDL Threat</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">4.2 TB</p>
          <p className="text-sm text-slate-500 mt-1">Data vulnerable to "Store Now, Decrypt Later" attacks</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-800/50 rounded-lg border border-indigo-700">
              <Clock className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-bold text-indigo-100">Migration Deadline</h3>
          </div>
          <p className="text-3xl font-bold mt-2">2030</p>
          <p className="text-sm text-indigo-300 mt-1">Per NSA CNSA 2.0 timeline for software/firmware</p>
        </div>
      </div>

      {/* Real-time Status Monitor */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
           <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-slate-800">What-if: Development Velocity</h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={velocity}
                onChange={(e) => setVelocity(parseFloat(e.target.value))}
                className="w-48 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-sm font-bold text-slate-900 tabular-nums">{(velocity * 100).toFixed(0)}%</span>
            </div>
            <p className="text-xs text-slate-500">Predicted Completion: <span className="font-semibold text-slate-900">{completionDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span></p>
          </div>
          
          <div className="flex items-center gap-2 self-start">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-800">Live Migration Monitor</span>
          </div>
          
          <div className="flex items-center gap-2 self-start">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time Stream</span>
          </div>
        </div>
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
            {modules.map((module) => (
              <div key={module.id} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${module.status === 'complete' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                      <module.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{module.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400 uppercase">Target: {module.target}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold tabular-nums ${module.status === 'complete' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {module.progress.toFixed(1)}%
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {module.status === 'complete' ? 'Success' : 'Processing...'}
                    </p>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${module.status === 'complete' ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${module.progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Algorithm Upgrade Roadmap</h3>
          <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2 py-1 rounded">Based on FIPS 203, 204, 205</span>
        </div>
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="relative pl-8 pb-6 border-l-2 border-indigo-200 last:border-0 last:pb-0">
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white"></div>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-900">Key Establishment (KEM)</h4>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Phase 1 Complete</span>
              </div>
              <p className="text-sm text-slate-600">Migrating TLS/IPsec key exchanges.</p>
              <div className="mt-3 bg-slate-50 p-3 rounded border border-slate-100 flex gap-4 text-sm">
                <div>
                  <span className="block text-slate-400 text-xs">Legacy</span>
                  <span className="line-through text-rose-500 font-mono">ECDH (P-256)</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-xs">Target Standard</span>
                  <span className="font-mono font-medium text-emerald-600">ML-KEM (CRYSTALS-Kyber)</span>
                </div>
              </div>
            </div>

            <div className="relative pl-8 pb-6 border-l-2 border-slate-200 last:border-0 last:pb-0">
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-white"></div>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-900">Digital Signatures (Primary)</h4>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">In Progress (60%)</span>
              </div>
              <p className="text-sm text-slate-600">Document signing and identity verification protocols.</p>
              <div className="mt-3 bg-slate-50 p-3 rounded border border-slate-100 flex gap-4 text-sm">
                <div>
                  <span className="block text-slate-400 text-xs">Legacy</span>
                  <span className="text-amber-500 font-mono">RSA-2048</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-xs">Target Standard</span>
                  <span className="font-mono font-medium text-slate-800">ML-DSA (CRYSTALS-Dilithium)</span>
                </div>
              </div>
            </div>

            <div className="relative pl-8 last:border-0 last:pb-0">
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white"></div>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-900">Digital Signatures (Stateless / Fallback)</h4>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Planned 2027</span>
              </div>
              <p className="text-sm text-slate-600">Firmware updates and root CA certificates.</p>
              <div className="mt-3 bg-slate-50 p-3 rounded border border-slate-100 flex gap-4 text-sm">
                <div>
                  <span className="block text-slate-400 text-xs">Legacy</span>
                  <span className="text-slate-500 font-mono">ECDSA</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-xs">Target Standard</span>
                  <span className="font-mono font-medium text-slate-800">SLH-DSA (SPHINCS+)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
