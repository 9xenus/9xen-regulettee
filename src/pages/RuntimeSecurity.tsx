import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Terminal, 
  Zap, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  Eye, 
  Flame,
  Bug,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThreatMap } from '../components/ThreatMap';

interface ThreatEvent {
  id: string;
  timestamp: string;
  ruleName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  container: string;
  message: string;
  action: 'NOTIFY' | 'BLOCK' | 'TERMINATE';
}

export const RuntimeSecurity: React.FC = () => {
  const [events] = useState<ThreatEvent[]>([
    { id: '1', timestamp: new Date().toISOString(), ruleName: 'UNAUTHORIZED_FILE_ACCESS', severity: 'CRITICAL', container: 'api-gateway-v2', message: 'Attempt to read /etc/shadow by unexpected process.', action: 'BLOCK' },
    { id: '2', timestamp: new Date(Date.now() - 5000).toISOString(), ruleName: 'REVERSE_SHELL_DETECTED', severity: 'HIGH', container: 'frontend-proxy', message: 'Outbound connection to known C2 server 103.44.2.1.', action: 'TERMINATE' },
    { id: '3', timestamp: new Date(Date.now() - 15000).toISOString(), ruleName: 'SENSITIVE_MOUNT_READ', severity: 'MEDIUM', container: 'worker-node-4', message: 'Read access to /var/run/secrets/kubernetes.io/serviceaccount.', action: 'NOTIFY' }
  ]);

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Flame className="w-8 h-8 text-rose-600" />
            Runtime Threat Intelligence
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time behavioral analysis powered by <strong>Falco</strong> eBPF instrumentation.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 flex items-center gap-2 shadow-lg shadow-rose-200">
            <ShieldAlert className="w-4 h-4" />
            Panic Mode: Lockdown
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 sm:gap-8">
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          <ThreatMap />
          {/* Live Feed Header */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">eBPF Sensor Live</span>
              </div>
              <div className="h-4 w-px bg-slate-100" />
              <div className="text-xs text-slate-500 font-medium">Scanning 42 active containers</div>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter threats..." 
                className="bg-transparent border-none outline-none text-xs font-medium placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Event Stream */}
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {events.map((event) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-rose-200 transition-colors group"
                >
                  <div className={`h-1.5 w-full ${event.severity === 'CRITICAL' ? 'bg-rose-600' : 'bg-amber-500'}`} />
                  <div className="p-5 flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${event.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{event.ruleName}</h4>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${event.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>
                            {event.severity}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        {event.message}
                      </p>
                      <div className="flex items-center gap-4 border-t border-slate-50 pt-3">
                        <div className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-600">Container: <span className="text-indigo-500">{event.container}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-600">Enforcement: <span className="text-emerald-500">{event.action}</span></span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-slate-950 p-4 sm:p-5 lg:p-6 rounded-2xl text-white shadow-2xl relative overflow-hidden">
            <Activity className="w-24 h-24 text-rose-500 absolute -top-4 -right-4 opacity-10" />
            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4">Threat Vectors</h3>
            <div className="space-y-4 sm:space-y-6">
              {[
                { label: 'File Integrity', score: 98, color: 'text-emerald-500' },
                { label: 'Network Anomalies', score: 12, color: 'text-rose-500' },
                { label: 'Process Forking', score: 4, color: 'text-rose-500' }
              ].map((v, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500 uppercase">{v.label}</span>
                    <span className={v.color}>{v.score}% RISK</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${v.score}%` }}
                      className={`h-full ${v.score > 20 ? 'bg-rose-500' : 'bg-emerald-500'} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              Intelligence Source
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <Bug className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-[10px] font-bold text-slate-900">Falco v0.35.0</div>
                <div className="text-[9px] text-slate-500">Local eBPF Engine Active</div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal italic">
              Runtime behavior is compared against the <strong>MITRE ATT&CK</strong> framework to identify polymorphic threat signatures.
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-indigo-700 leading-normal italic">
              "System stability is maintained by sovereign micro-isolation of compromised containers."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
