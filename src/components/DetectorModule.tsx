import React, { useState } from 'react';
import { Eye, ShieldAlert, CheckCircle2, Lock, AlertTriangle, Play, RefreshCw } from 'lucide-react';

export const DetectorModule: React.FC = () => {
  const [inputText, setInputText] = useState('Patient Hans Schmidt (IBAN: DE89370400440532013000, SSN: 12-345678) has uploaded medical scan ref #9812.');
  const [detectedPii, setDetectedPii] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanReportId, setScanReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzePii = async () => {
    if (!inputText.trim() || isScanning) return;
    setIsScanning(true);
    setError(null);
    setDetectedPii([]);
    setScanReportId(null);
    try {
      const res = await fetch('/api/v1/pii/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (data.success) {
        setDetectedPii(data.detectedPii || []);
        setScanReportId(data.reportId || null);
      } else {
        setError(data.error || 'Scan failed.');
      }
    } catch {
      setError('Unable to reach PII detection service.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time PII & Special Category Detector</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Automated NLP redaction & GDPR Art. 9 isolation</p>
          </div>
        </div>

        <button
          onClick={analyzePii}
          disabled={isScanning}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {isScanning ? 'Inspecting...' : 'Analyze Text'}
        </button>
      </div>

      <div className="space-y-3">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={3}
          className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-mono"
        />

        {isScanning && (
          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300 font-bold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running GDPR entity extraction across text sample...
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> {error}
          </div>
        )}

        {!isScanning && detectedPii.length > 0 && (
          <div className="space-y-1.5 p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 uppercase">
              Detected Sensitive Entities ({detectedPii.length}) {scanReportId && <span className="text-slate-400 normal-case">· Report {scanReportId}</span>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {detectedPii.map((p, idx) => (
                <span key={idx} className="text-[11px] font-mono bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 px-2 py-0.5 rounded text-indigo-900 dark:text-indigo-200">
                  {p}
                </span>
              ))}
            </div>
            <div className="flex items-start gap-1.5 text-[11px] text-indigo-700 dark:text-indigo-300 pt-1">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Entity isolation required per GDPR Art. 9. Apply redaction middleware and tokenization before storage.</span>
            </div>
          </div>
        )}

        {!isScanning && !error && detectedPii.length === 0 && scanReportId && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> No sensitive entities detected.
          </div>
        )}
      </div>
    </div>
  );
};
export default DetectorModule;