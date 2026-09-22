import React, { useState } from 'react';
import { 
  Network, 
  Shield, 
  Lock, 
  Globe, 
  Zap, 
  Server, 
  Cpu, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  EyeOff,
  Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ZTNode {
  id: string;
  name: string;
  type: 'Peer' | 'Gateway' | 'Service';
  ip: string;
  status: 'ONLINE' | 'OFFLINE' | 'SYNCING';
  isDark: boolean;
}

export const ZeroTrustNetwork: React.FC = () => {
  const [nodes] = useState<ZTNode[]>([
    { id: '1', name: 'Frankfurt-Edge-Node', type: 'Peer', ip: '10.12.0.4', status: 'ONLINE', isDark: true },
    { id: '2', name: 'NYC-Vault-Gateway', type: 'Gateway', ip: '10.12.0.1', status: 'ONLINE', isDark: true },
    { id: '3', name: 'Internal-ERP-Service', type: 'Service', ip: '10.12.4.99', status: 'ONLINE', isDark: true },
    { id: '4', name: 'Mobile-Remote-Client', type: 'Peer', ip: '10.12.0.15', status: 'SYNCING', isDark: false }
  ]);

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="w-8 h-8 text-indigo-600" />
            Zero-Trust Mesh Network
          </h1>
          <p className="text-slate-500 text-sm mt-1 italic">
            Integrated <strong>NetBird</strong> & <strong>OpenZiti</strong> Overlay Management.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
          <EyeOff className="w-4 h-4 text-indigo-500" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Dark Services Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-1 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Network Posture</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-bold">Encrypted Peers</span>
                <span className="text-xs font-mono font-bold text-indigo-600">24/24</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-full h-full bg-indigo-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-bold">WireGuard Handshakes</span>
                <span className="text-xs font-mono font-bold text-emerald-500">Stable</span>
              </div>
              
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-indigo-500" />
                  <span className="text-[10px] text-slate-500">P2P Encryption Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3 text-indigo-500" />
                  <span className="text-[10px] text-slate-500">Multi-Cloud Routing</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-slate-900 p-4 sm:p-5 lg:p-6 rounded-2xl text-white shadow-xl">
            <Zap className="w-6 h-6 text-indigo-400 mb-4" />
            <h3 className="font-bold text-lg italic mb-2">Pomerium Auth Gate</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Identity-aware proxy enforcing SSO/MFA at the application layer. No perimeter required.
            </p>
            <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Manage Access Policies
            </button>
          </motion.div>
        </div>

        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          {/* Mesh Visualization Placeholder */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="bg-slate-950 rounded-[2rem] p-12 relative overflow-hidden shadow-2xl min-h-[450px] flex items-center justify-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] from-indigo-500/30" />
              <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12">
              {nodes.map((node, i) => (
                <motion.div 
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center group-hover:border-indigo-500 transition-all shadow-xl">
                      {node.type === 'Peer' ? <Cpu className="w-8 h-8 text-indigo-400" /> : node.type === 'Gateway' ? <Cloud className="w-8 h-8 text-blue-400" /> : <Server className="w-8 h-8 text-emerald-400" />}
                    </div>
                    {node.status === 'ONLINE' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{node.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">{node.ip}</p>
                </motion.div>
              ))}
            </div>

            {/* Connecting lines SVG would go here in a real impl */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <line x1="25%" y1="50%" x2="50%" y2="50%" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="75%" y2="50%" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
            </svg>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Active Overlay Entities</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase">Synchronized: Real-time</span>
            </div>
            <div className="divide-y divide-slate-50">
              {nodes.map((node) => (
                <div key={node.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                      {node.type === 'Peer' ? <Activity className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{node.name}</span>
                        {node.isDark && (
                          <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[8px] font-black rounded uppercase">Dark</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{node.ip}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[9px] font-black text-emerald-600 uppercase">{node.status}</div>
                      <div className="text-[9px] text-slate-400">Handshake: 2s ago</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
