/**
 * Enterprise Security & Governance Command View
 * Provides Zero-Trust Session Revocation (Kill Switch), Regulatory Drift Auto-Reconciliation,
 * and HSM Master Key Rotation controls for SaaS Administrators and Regulators.
 */
import React, { useState } from 'react';
import { 
  ShieldAlert, Key, RefreshCw, Lock, CheckCircle2, AlertTriangle, Cpu, Terminal, Zap, Trash2, Globe 
} from 'lucide-react';
import { EnterpriseCriticalMechanisms, SessionRevocationRecord, RegulatoryDriftPatch, HsmKeyRotationLog } from '../../utils/enterpriseCriticalMechanisms';

export function EnterpriseSecurityCommandView() {
  const [revokedSessions, setRevokedSessions] = useState<SessionRevocationRecord[]>([]);
  const [drifts, setDrifts] = useState<RegulatoryDriftPatch[]>(EnterpriseCriticalMechanisms.getRegulatoryDriftPatches());
  const [hsmKeys, setHsmKeys] = useState<HsmKeyRotationLog[]>(EnterpriseCriticalMechanisms.getHsmKeyRotations());
  
  // Kill switch form state
  const [targetTokenId, setTargetTokenId] = useState('');
  const [targetTenantId, setTargetTenantId] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [killReason, setKillReason] = useState('Suspicious cross-border telemetry anomaly');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleExecuteKillSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTokenId || !targetEmail) return;
    const rec = EnterpriseCriticalMechanisms.revokeSession(targetTokenId, targetTenantId || 'DEFAULT_TENANT', targetEmail, killReason);
    setRevokedSessions([rec, ...revokedSessions]);
    setSuccessMsg(`Successfully revoked session token ${targetTokenId} for ${targetEmail}.`);
    setTargetTokenId('');
    setTargetEmail('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleRotateKey = (alias: string) => {
    const newKey = EnterpriseCriticalMechanisms.rotateHsmKey(alias);
    setHsmKeys(EnterpriseCriticalMechanisms.getHsmKeyRotations());
    setSuccessMsg(`Successfully rotated HSM master key: ${newKey.keyAlias} (${newKey.keyId}).`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleApplyDriftPatch = (patchId: string) => {
    const updated = drifts.map(d => d.patchId === patchId ? { ...d, status: 'AUTO_APPLIED' as const } : d);
    setDrifts(updated);
    localStorage.setItem('9xen-regulettee_regulatory_drifts', JSON.stringify(updated));
    setSuccessMsg(`Regulatory drift patch ${patchId} successfully reconciled and deployed to rule engine.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono font-bold uppercase tracking-wider">
              Zero-Trust & Cryptographic Enclave
            </span>
            <span className="text-xs text-slate-400 font-mono">Mission-Critical Security Controls</span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-red-400" />
            Enterprise Security & Governance Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Execute emergency session revocation kill-switches, reconcile automated regulatory law drifts, and manage Hardware Security Module (HSM) master key rotations.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-600/50 rounded-2xl flex items-center gap-3 text-emerald-200 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid of Critical Mechanisms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Zero-Trust Session Kill Switch */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20 text-[10px] font-mono font-bold uppercase">
                Zero-Trust Security
              </span>
              <Lock className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Emergency Session Kill Switch</h3>
              <p className="text-xs text-slate-400 mt-1">Instantly invalidate active user tokens and tenant connections across all edge nodes.</p>
            </div>

            <form onSubmit={handleExecuteKillSwitch} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Token ID</label>
                <input 
                  type="text" required placeholder="tok_live_89a7b2..."
                  value={targetTokenId} onChange={e => setTargetTokenId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Tenant / User Email</label>
                <input 
                  type="email" required placeholder="admin@enterprise-bank.eu"
                  value={targetEmail} onChange={e => setTargetEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revocation Reason</label>
                <input 
                  type="text" required
                  value={killReason} onChange={e => setKillReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" /> Revoke Session & Terminate
              </button>
            </form>
          </div>

          {revokedSessions.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recent Terminations</span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto text-[11px] font-mono">
                {revokedSessions.map((s, idx) => (
                  <div key={idx} className="p-2 bg-slate-950 rounded-lg border border-red-950/60 text-red-300 flex items-center justify-between">
                    <span className="truncate">{s.userEmail}</span>
                    <span className="shrink-0 text-[10px] opacity-75">{new Date(s.revokedAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Regulatory Drift Auto-Reconciliation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 text-[10px] font-mono font-bold uppercase">
                AI Regulatory Watchdog
              </span>
              <Globe className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Automated Regulatory Drift & Patching</h3>
              <p className="text-xs text-slate-400 mt-1">Real-time statutory gazette delta detection with automated policy updates.</p>
            </div>

            <div className="space-y-3 pt-2 max-h-72 overflow-y-auto">
              {drifts.map((d, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white">{d.patchId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      d.status === 'AUTO_APPLIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300 font-medium">{d.regulationName}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{d.detectedDelta}</p>
                  <div className="p-2 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-800">
                    <strong>Proposed:</strong> {d.proposedRuleUpdate}
                  </div>
                  {d.status === 'PENDING_APPROVAL' && (
                    <button 
                      onClick={() => handleApplyDriftPatch(d.patchId)}
                      className="w-full mt-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all"
                    >
                      Reconcile & Deploy Patch
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. HSM / KMS Master Key Rotation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 text-[10px] font-mono font-bold uppercase">
                Hardware Enclave HSM
              </span>
              <Key className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Master Key Rotation & Cryptography</h3>
              <p className="text-xs text-slate-400 mt-1">Manage AES-256-GCM envelope keys and HSM cryptographic finger-prints.</p>
            </div>

            <div className="space-y-3 pt-2">
              <button 
                onClick={() => handleRotateKey('aws-kms-eu-central-prod-master')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Rotate Production HSM Master Key
              </button>

              <div className="space-y-2 pt-2 max-h-52 overflow-y-auto">
                {hsmKeys.map((k, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">{k.keyId}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${k.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                        {k.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{k.keyAlias}</div>
                    <div className="text-[9px] text-slate-500">Fingerprint: {k.fingerprint}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
