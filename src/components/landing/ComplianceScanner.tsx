import React, { useState } from 'react';
import { Globe, ArrowRight, Loader2, ShieldAlert, CheckCircle2, Lock, BadgeAlert, Sparkles, VerifiedIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchWithRetry } from '../../lib/api-client';

export const ComplianceScanner: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [scanUrl, setScanUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState('');
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [trackersDetected, setTrackersDetected] = useState<number | null>(null);

  const handleFreeScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanUrl.trim()) return;
    
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);
    setScanProgress(5);
    setScanPhase('Initiating network probe...');
    setTrackersDetected(null);

    const phases = [
      { p: 15, msg: 'Establishing TLS handshake...' },
      { p: 35, msg: 'Scraping website structure...' },
      { p: 55, msg: 'Locating privacy elements...' },
      { p: 75, msg: 'Analyzing with Compliance AI...' },
      { p: 90, msg: 'Compiling posture scorecard...' },
    ];

    let currentPhaseIdx = 0;
    const progressInterval = setInterval(() => {
      if (currentPhaseIdx < phases.length) {
        setScanProgress(phases[currentPhaseIdx].p);
        setScanPhase(phases[currentPhaseIdx].msg);
        currentPhaseIdx++;
      }
    }, 950);

    try {
      const response = await fetchWithRetry('/api/v1/compliance/free-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanUrl })
      });
      
      clearInterval(progressInterval);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete compliance scan.');
      }

      setScanProgress(100);
      setScanPhase('Scan finalized!');
      
      setTimeout(() => {
        setIsScanning(false);
        if (data.limitReached && data.scan) {
          setScanResult(data.scan);
          setLimitReached(true);
        } else {
          setScanResult(data.scan);
          if (data.trackersDetected) {
            setTrackersDetected(data.trackersDetected);
          }
        }
      }, 500);

    } catch (err: any) {
      clearInterval(progressInterval);
      setIsScanning(false);
      setScanError(err.message || 'An error occurred during the scan.');
    }
  };

  return (
    <section className="py-10 sm:py-12 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-1.5">Free Tool</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Instant Compliance Scanner</h3>
          <p className="text-sm text-slate-600">
            Enter your domain to analyze your privacy posture and GDPR alignment in real-time.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
            {!scanResult && !isScanning && (
              <form onSubmit={handleFreeScan} className="space-y-3 sm:space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="https://yourcompany.com"
                      value={scanUrl}
                      onChange={(e) => setScanUrl(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 text-xs border-0 cursor-pointer shadow-md shadow-indigo-600/20 shrink-0"
                  >
                    Run Scan
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  Limit 1 scan per visitor. No registration required.
                </p>
              </form>
            )}

            {isScanning && (
              <div className="py-12 text-center">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center mb-8">
                  <Loader2 className="w-full h-full text-indigo-600 animate-spin" />
                  <span className="absolute text-xs font-bold text-slate-900">{scanProgress}%</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{scanPhase}</h4>
                <p className="text-slate-500 text-sm">Analyzing domain infrastructure and privacy policies...</p>
              </div>
            )}

            {scanError && (
              <div className="py-8 text-center">
                <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-slate-900 mb-2">Scan Failed</h4>
                <p className="text-slate-500 text-sm mb-6">{scanError}</p>
                <button
                  onClick={() => setScanError(null)}
                  className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors border-0 cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}

            {scanResult && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                  <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-100 flex-1 text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Score</div>
                    <div className={`text-5xl font-bold ${scanResult.compliance_score >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {scanResult.compliance_score}%
                    </div>
                  </div>
                  <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-100 flex-[2] text-left">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Metadata</div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Domain</span>
                        <span className="text-slate-900 font-bold">{scanResult.url}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Timestamp</span>
                        <span className="text-slate-900 font-bold">{new Date(scanResult.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-100 text-left">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-50 pb-4">Analysis</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{scanResult.summary}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setScanResult(null);
                      setScanUrl('');
                    }}
                    className="flex-1 px-4 sm:px-6 py-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors border-0 cursor-pointer"
                  >
                    Scan Another
                  </button>
                  <button
                    onClick={onLogin}
                    className="flex-1 px-4 sm:px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all border-0 cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    Deploy Fixes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
