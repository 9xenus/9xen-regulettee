import React, { useState, useEffect } from 'react';
import { ShieldCheck, Target, RefreshCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SimulationResult {
  endpoint: string;
  attackType: string;
  status: 'Blocked' | 'Failed';
  timestamp: string;
}

const ENDPOINTS = ['auth-service', 'payment-gateway', 'user-profile-api', 'compliance-portal'];
const ATTACK_TYPES = ['SQL Injection', 'Cross-Site Scripting (XSS)', 'Path Traversal'];

export const RedTeamSimulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SimulationResult[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
        const attackType = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
        const isBlocked = Math.random() > 0.2; // 80% chance to be blocked
        
        const newResult: SimulationResult = {
          endpoint,
          attackType,
          status: isBlocked ? 'Blocked' : 'Failed',
          timestamp: new Date().toLocaleTimeString(),
        };
        
        setResults((prev) => [newResult, ...prev].slice(0, 5));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-black text-slate-900">Red-Team Simulator</h2>
        </div>
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isRunning ? 'bg-rose-100 text-rose-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          <RefreshCcw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Stop Simulation' : 'Start Simulation'}
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700">Live Attack Log:</h3>
        <AnimatePresence initial={false}>
          {results.map((result, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-lg border border-slate-100"
            >
              <div className="flex items-center gap-3">
                {result.status === 'Blocked' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                <div>
                  <span className="font-bold text-slate-900">{result.attackType}</span>
                  <span className="text-slate-500 mx-1">against</span>
                  <span className="font-mono bg-slate-200 px-1 rounded text-xs">{result.endpoint}</span>
                </div>
              </div>
              <span className={`font-bold text-xs px-2 py-0.5 rounded ${result.status === 'Blocked' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {result.status}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {results.length === 0 && <p className="text-sm text-slate-400 italic">No simulation data yet.</p>}
      </div>
    </div>
  );
};
