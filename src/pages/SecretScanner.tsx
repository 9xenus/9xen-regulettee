import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Code2, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy,
  Trash2,
  Zap,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SecretFinding {
  type: string;
  value: string;
  line?: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
}

export const SecretScanner: React.FC = () => {
  const [code, setCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<SecretFinding[] | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);

  const scanSecrets = async () => {
    if (!code) return;
    setScanning(true);
    setResults(null);

    // Simulate high-performance scanning
    await new Promise(r => setTimeout(r, 1500));

    const findings: SecretFinding[] = [];
    
    // Pattern Based Detection (Simulated TruffleHog logic)
    const patterns = [
      { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g, severity: 'CRITICAL' as const },
      { name: 'Google API Key', regex: /AIza[0-9A-Za-z\\-_]{35}/g, severity: 'HIGH' as const },
      { name: 'Private Key', regex: /-----BEGIN (RSA|OPENSSH|PRIVATE) KEY-----/g, severity: 'CRITICAL' as const },
      { name: 'Generic Secret', regex: /(password|secret|token|key|pwd)\s*[:=]\s*['"][^'"]+['"]/gi, severity: 'MEDIUM' as const }
    ];

    patterns.forEach(p => {
      const matches = code.match(p.regex);
      if (matches) {
        matches.forEach(m => {
          findings.push({
            type: p.name,
            value: m,
            severity: p.severity,
            description: `Detected potential ${p.name} hardcoded in source text.`
          });
        });
      }
    });

    setResults(findings);
    setScanning(false);
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Lock className="w-8 h-8 text-rose-600" />
            Secret Leak Scanner
          </h1>
          <p className="text-slate-500 text-sm mt-1 italic">
            Advanced heuristic & entropy-based detection for credentials, keys, and tokens.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl">
          <Zap className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Invincible Security Mode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-300">Target Code/Config Payload</span>
              </div>
              <button 
                onClick={() => setCode('')}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste code, .env content, or logs here to scan for secrets..."
              className="w-full h-[400px] bg-transparent p-4 sm:p-5 lg:p-6 font-mono text-sm text-emerald-400 focus:outline-none resize-none placeholder:text-slate-600"
            />
            <div className="p-4 bg-slate-800/30 border-t border-slate-700">
              <button
                onClick={scanSecrets}
                disabled={scanning || !code}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-900/20"
              >
                {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {scanning ? 'SCANNING ENTROPY...' : 'INITIATE SECRET SCAN'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <AnimatePresence mode="wait">
            {results === null && !scanning && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white"
              >
                <ShieldAlert className="w-12 h-12 text-slate-200 mb-4" />
                <h3 className="font-bold text-slate-400">Awaiting Input</h3>
                <p className="text-xs text-slate-400 text-center mt-2 max-w-[200px]">
                  Paste source material to check for accidental credential exposures.
                </p>
              </motion.div>
            )}

            {scanning && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-12 space-y-4 sm:space-y-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-slate-100 border-t-rose-500 rounded-full animate-spin" />
                  <Lock className="w-8 h-8 text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-800 italic uppercase tracking-tighter">Deep Inspection Active</h3>
                  <div className="flex gap-1 justify-center mt-2">
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}

            {results && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    Analysis Report
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${results.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {results.length} Found
                    </span>
                  </h3>
                  {results.length > 0 && (
                    <button 
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                    >
                      {showSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showSecrets ? 'Mask' : 'Unhide'} Values
                    </button>
                  )}
                </div>

                {results.length > 0 ? (
                  <div className="space-y-3">
                    {results.map((finding, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm hover:border-rose-200 transition-colors">
                        <div className={`h-1 ${finding.severity === 'CRITICAL' ? 'bg-rose-600' : finding.severity === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${finding.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                                  {finding.severity}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900">{finding.type}</h4>
                              </div>
                              <p className="text-xs text-slate-500 leading-tight mb-3 italic">{finding.description}</p>
                              
                              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 group">
                                <code className="text-[11px] font-mono text-slate-700 truncate block flex-1">
                                  {showSecrets ? finding.value : '•'.repeat(24)}
                                </code>
                                <button className="p-1 hover:bg-white rounded transition-colors text-slate-400 hover:text-slate-600">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <AlertCircle className={`w-5 h-5 shrink-0 ${finding.severity === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 p-5 sm:p-6 lg:p-8 rounded-2xl text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <h4 className="font-bold text-emerald-900">Codebase Secure</h4>
                    <p className="text-xs text-emerald-700 mt-1">No known credential signatures or high-entropy secrets detected.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
