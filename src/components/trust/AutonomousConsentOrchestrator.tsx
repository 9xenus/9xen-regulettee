import React, { useState } from 'react';
import { Shield, Smartphone, Server, RefreshCw, Key, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export const AutonomousConsentOrchestrator: React.FC = () => {
  const [subjectId, setSubjectId] = useState('USR-SOVEREIGN-88421');
  const [purposes, setPurposes] = useState({
    essential: true,
    analytics: false,
    crossBorderMarketing: false,
    aiModelTraining: false
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [lastRecord, setLastRecord] = useState<any>(null);

  const handleSyncConsent = async () => {
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/v1/consent/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          jurisdiction: 'EU_GDPR_AND_EPRIVACY',
          purposes,
          tcfString: 'CP4O0AAP4O0AAABABBENAxCgAAAAAAAAAAAA',
          deviceId: 'SECURE-ENCLAVE-SESSION-01'
        })
      });
      const json = await res.json();
      if (json.success) {
        setLastRecord(json.data);
        setSyncStatus('synced');
      }
    } catch {
      setSyncStatus('idle');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Lock className="w-3 h-3" /> GDPR Art. 7 &amp; IAB TCF v2.2
          </span>
          <h4 className="font-bold text-slate-900 text-sm">Autonomous Consent &amp; Purpose-Binding Orchestrator</h4>
          <p className="text-xs text-slate-500">Universal cross-device consent state synchronization anchored by zero-knowledge receipts.</p>
        </div>
        <button
          onClick={handleSyncConsent}
          disabled={syncStatus === 'syncing'}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          {syncStatus === 'syncing' ? 'Syncing Enclave...' : 'Sync & Enforce Purpose Binding'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Purpose Toggles */}
        <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Granular Processing Purposes (Art. 6(1)(a))
          </span>

          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs cursor-not-allowed opacity-80">
            <span className="font-semibold text-slate-800">Essential Technical Telemetry</span>
            <input type="checkbox" checked={true} disabled className="rounded text-indigo-600" />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs cursor-pointer hover:border-indigo-300">
            <span className="font-semibold text-slate-800">Performance &amp; Behavioral Analytics</span>
            <input
              type="checkbox"
              checked={purposes.analytics}
              onChange={(e) => setPurposes(p => ({ ...p, analytics: e.target.checked }))}
              className="rounded text-indigo-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs cursor-pointer hover:border-indigo-300">
            <span className="font-semibold text-slate-800">Cross-Border Profiling &amp; Marketing</span>
            <input
              type="checkbox"
              checked={purposes.crossBorderMarketing}
              onChange={(e) => setPurposes(p => ({ ...p, crossBorderMarketing: e.target.checked }))}
              className="rounded text-indigo-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs cursor-pointer hover:border-indigo-300">
            <span className="font-semibold text-slate-800">AI Model Fine-Tuning Ingestion</span>
            <input
              type="checkbox"
              checked={purposes.aiModelTraining}
              onChange={(e) => setPurposes(p => ({ ...p, aiModelTraining: e.target.checked }))}
              className="rounded text-indigo-600 cursor-pointer"
            />
          </label>
        </div>

        {/* Real-time Enclave Webhooks & Cryptographic Anchor */}
        <div className="space-y-3 bg-slate-900 text-slate-200 p-3.5 rounded-xl border border-slate-800 font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" /> Enclave Database Webhook Enforcement
              </span>
              <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                LIVE
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans mb-2">
              Upon purpose toggling, real-time database webhooks restrict SQL queries and invalidate downstream Redis caches instantly.
            </p>

            <div className="space-y-1 text-[11px]">
              <div className="text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> Postgres RLS: Filter WHERE consent.purpose = TRUE
              </div>
              <div className="text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> Redis: Device token profile cache purged
              </div>
              <div className="text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> Enclave: ZKP Receipt signed &amp; hashed
              </div>
            </div>
          </div>

          {lastRecord && (
            <div className="mt-3 p-2 bg-slate-950 rounded-lg border border-slate-800 text-[10px]">
              <div className="text-slate-400 truncate">ZKP Proof: {lastRecord.zkpReceiptHash}</div>
              <div className="text-cyan-400 pt-0.5">Status: {lastRecord.status}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
