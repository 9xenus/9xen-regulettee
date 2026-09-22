import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  ChevronRight,
  Database,
  Activity,
  History,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EnforcementSimulation: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [violationType, setViolationType] = useState('DATA_BREACH');
  const [riskScore, setRiskScore] = useState(85);

  const runSimulation = async () => {
    setIsRunning(true);
    setResults([]);
    setLogs(['[System] Initializing Simulation Engine...', '[System] Loading Jurisdiction Profiles (EU-Standard)...']);
    
    try {
      const res = await fetch('/api/v1/enforcement/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            tenantId: 'test-tenant-123',
            countryCode: 'EU',
            regulationCode: 'GDPR',
            violationData: {
              type: violationType,
              riskScore: riskScore
            }
          }
        })
      });

      const data = await res.json();
      
      setLogs(prev => [...prev, `[Engine] Detecting Violation Event: ${violationType}`, `[Engine] Risk Score Evaluated: ${riskScore}%`]);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setResults(data.results || []);
      setLogs(prev => [...prev, '[System] Cascade Evaluation Complete.', '[System] Awaiting Action Records...']);
    } catch (error: any) {
      setLogs(prev => [...prev, `[Error] Simulation Failed: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 max-w-6xl mx-auto">
      {/* Configuration Panel */}
      <div className="lg:col-span-4 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Simulation Params</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Violation Vector</label>
              <select 
                value={violationType}
                onChange={(e) => setViolationType(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="DATA_BREACH">Mass Data Breach (EU-Wide)</option>
                <option value="UNAUTHORIZED_ACCESS">Unauthorized Admin Escalation</option>
                <option value="TREASURY_ANOMALY">Suspicious Smart Contract Outflow</option>
                <option value="AD_RESTRICTION_BYPASS">DSA Content Policy Violation</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Simulated Risk Score: {riskScore}%</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={riskScore}
                onChange={(e) => setRiskScore(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] font-bold text-slate-400">Low</span>
                <span className="text-[10px] font-bold text-rose-500">Critical</span>
              </div>
            </div>

            <button 
              onClick={runSimulation}
              disabled={isRunning}
              className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center space-x-2 transition-all ${
                isRunning 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 active:scale-[0.98]'
              }`}
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  <span>Computing Cascade...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Enforcement Test</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 lg:p-6 text-white overflow-hidden relative">
          <Terminal className="absolute top-4 right-4 w-12 h-12 text-white opacity-5" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Execution Console</h3>
          <div className="font-mono text-[10px] space-y-1.5 opacity-80 h-40 overflow-y-auto custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className={log.startsWith('[Error]') ? 'text-rose-400' : 'text-emerald-400'}>
                {log}
              </div>
            ))}
            {logs.length === 0 && <div className="text-slate-500 italic">Awaiting simulation trigger...</div>}
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-2xl border border-slate-200 min-h-[500px] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <History className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Cascade Results</h2>
            </div>
            {results.length > 0 && (
              <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full border border-amber-100">
                8-LEVEL PROFILE ACTIVE
              </span>
            )}
          </div>

          <div className="flex-1 p-4 sm:p-5 lg:p-6">
            <AnimatePresence mode="wait">
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((res, i) => (
                    <motion.div
                      key={res.levelKey}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        res.status === 'executed' 
                          ? 'bg-emerald-50 border-emerald-100' 
                          : res.status === 'pending_approval'
                          ? 'bg-amber-50 border-amber-100'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          res.status === 'executed' ? 'bg-emerald-600 text-white' : 
                          res.status === 'pending_approval' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {res.levelKey.substring(0, 2)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{res.levelKey.split('_').join(' ')}</h4>
                          <p className="text-[10px] font-bold text-slate-500">{res.actionTaken}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          res.status === 'executed' ? 'text-emerald-600' : 
                          res.status === 'pending_approval' ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {res.status.replace('_', ' ')}
                        </span>
                        {res.status === 'executed' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : 
                         res.status === 'pending_approval' ? <AlertCircle className="w-4 h-4 text-amber-500" /> : null}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                  <ShieldAlert className="w-16 h-16 text-slate-200 mb-4" />
                  <h3 className="text-xl font-bold text-slate-300">No active simulation data</h3>
                  <p className="text-slate-300 text-sm mt-2 max-w-xs">Run a simulation to verify the 8-level enforcement cascade logic before jurisdictional publishing.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold">
              <Info className="w-3 h-3" />
              <span>Results are simulated based on the CURRENT draft profile. Published profiles may differ.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
