import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Fingerprint,
  Zap,
  CheckCircle2,
  Settings,
  MoreVertical,
  ShieldAlert,
  Terminal,
  Activity,
  UserPlus,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const SecurityAdvanced: React.FC = () => {
  const [adaptiveSession, setAdaptiveSession] = useState(true);

  return (
    <div className="space-y-8">
      {/* Top Banner: Risk Posture */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center space-x-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">Advanced Security & Access</h2>
              <p className="text-blue-200 mt-2 font-medium flex items-center">
                <Activity className="w-4 h-4 mr-2 text-emerald-400" />
                Adaptive Session Policies active. Infrastructure is "Sovereign-Hardened".
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2" />
              BREAK GLASS ACCESS
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Adaptive Session & BYOK */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-900">Adaptive Session Policies</h3>
              </div>
              <button 
                onClick={() => setAdaptiveSession(!adaptiveSession)}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-all",
                  adaptiveSession ? "bg-blue-600" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                  adaptiveSession ? "right-1" : "left-1"
                )} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-sm text-gray-500 leading-relaxed">
                Automatically adjust session timeout, MFA frequency, and IP allowlisting based on the sensitivity of the module being accessed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { level: 'Low Sensitivity', timeout: '12h', mfa: 'Not required', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                  { level: 'Balanced', timeout: '4h', mfa: 'Once per session', bg: 'bg-blue-50', text: 'text-blue-700' },
                  { level: 'High/Critical', timeout: '15m', mfa: 'Mandatory', bg: 'bg-red-50', text: 'text-red-700' },
                ].map((tier) => (
                  <div key={tier.level} className={cn("p-4 rounded-xl border border-transparent", tier.bg)}>
                    <p className={cn("text-xs font-black uppercase tracking-widest", tier.text)}>{tier.level}</p>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-bold text-gray-900 flex items-center"><Clock className="w-3.5 h-3.5 mr-2" /> {tier.timeout}</p>
                      <p className="text-sm font-bold text-gray-900 flex items-center"><Fingerprint className="w-3.5 h-3.5 mr-2" /> {tier.mfa}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Bring Your Own Key (BYOK)</h3>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active & Validated</span>
            </div>
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">KMS Provider</p>
                      <p className="text-sm font-bold text-gray-900">AWS Key Management Service (eu-central-1)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                      <Terminal className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Key ARN</p>
                      <p className="text-sm font-mono text-gray-600 truncate">arn:aws:kms:eu-central-1:851857781149:key/ae12-99x2-001c-ff21</p>
                    </div>
                  </div>
                </div>
                <div className="md:w-64 space-y-3">
                  <button className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md">
                    Rotate Encryption Key
                  </button>
                  <button className="w-full py-3 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-50 transition-all">
                    REVOKE ACCESS
                  </button>
                  <p className="text-[10px] text-center text-gray-400 italic">Revoking will instantly unmount all encrypted data volumes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Access Log & IP Controls */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Emergency Access (Break-Glass)</h3>
            </div>
            <div className="p-8">
              <div className="p-6 bg-red-50 border border-red-100 rounded-xl mb-6">
                <h4 className="text-sm font-black text-red-900 uppercase tracking-wider mb-2">Security Note</h4>
                <p className="text-xs text-red-700 leading-relaxed">
                  Dual-approval is mandatory for activation. Every action taken during emergency access is streamed to the auditor node in real-time.
                </p>
              </div>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 transition-all">
                  <div className="flex items-center">
                    <UserPlus className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="text-sm font-bold text-gray-900">Add Emergency Approver</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <div className="flex items-center space-x-4 p-4 border border-dashed border-gray-300 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Configure Auto-Revoke</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Identity Context Alerts</h3>
            </div>
            <div className="p-8 space-y-6">
              {[
                { type: 'Anomaly', user: 'admin_root', desc: 'Impossible travel detected (NY -> Berlin)', time: '14m ago', severity: 'high' },
                { type: 'Security', user: 'dev_lead', desc: 'Break-glass policy modified', time: '1h ago', severity: 'medium' },
                { type: 'BYOK', user: 'system', desc: 'Encryption key validated successfully', time: '3h ago', severity: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex items-start space-x-4 group">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    log.severity === 'high' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
                    log.severity === 'medium' ? "bg-amber-500" : "bg-blue-500"
                  )} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">{log.desc}</p>
                    <div className="flex items-center mt-1 space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>{log.user}</span>
                      <span>•</span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full text-center py-2 text-xs font-bold text-blue-600 hover:underline">View Full Audit Stream</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
