import React from 'react';
import { Layers, CheckCircle2, ShieldCheck, Zap, Activity, Cpu } from 'lucide-react';

export interface ServiceHubProps {
  activeServices?: any[];
  availableServices?: any[];
  onLaunch?: (id: string) => void;
  onConfigure?: (addon: any) => void;
  onActivate?: (id: string) => Promise<void>;
  [key: string]: any;
}

export const ServiceHub: React.FC<ServiceHubProps> = () => {
  const services = [
    { name: 'EU AI Act Conformance Engine', status: 'ACTIVE', latency: '42ms', throughput: '1,240 req/s' },
    { name: 'DORA Multi-Cloud Failover Heartbeat', status: 'ACTIVE', latency: '12ms', throughput: '9,800 req/s' },
    { name: 'GDPR Real-Time Anonymizer Enclave', status: 'ACTIVE', latency: '8ms', throughput: '14,200 req/s' },
    { name: 'CSIRT Early Warning Dispatcher', status: 'ACTIVE', latency: '95ms', throughput: '120 req/s' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Core Regulatory Microservices</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">High-throughput statutory processing cluster</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
          All Nodes Healthy
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {services.map((s, idx) => (
          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {s.status}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Latency: {s.latency}</span>
              <span>Throughput: {s.throughput}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ServiceHub;
