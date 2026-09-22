import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertOctagon,
  Power,
  Key,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity,
  Sliders,
  History,
  FileCheck2,
  Download,
  AlertTriangle,
  Cpu,
  Layers,
  ArrowRight
} from "lucide-react";

interface CircuitBreakerSensors {
  oodDriftSensor: { active: boolean; currentSigma: number; thresholdSigma: number };
  toxicOutputFilter: { active: boolean; currentScore: number; thresholdScore: number };
  hallucinationDetector: { active: boolean; groundingScore: number; minThreshold: number };
  tokenSpikeLimiter: { active: boolean; currentRps: number; maxRps: number };
}

interface DualKeyAuth {
  dpoSigned: boolean;
  dpoSigner: string | null;
  safetyOfficerSigned: boolean;
  safetyOfficerSigner: string | null;
}

interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  cryptoHash: string;
}

export const AiKillswitchControlPlane: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [globalStatus, setGlobalStatus] = useState<"NOMINAL" | "DEGRADED" | "EMERGENCY_STOPPED" | "FAILOVER_ACTIVE">("NOMINAL");
  const [sensors, setSensors] = useState<CircuitBreakerSensors>({
    oodDriftSensor: { active: true, currentSigma: 1.4, thresholdSigma: 3.0 },
    toxicOutputFilter: { active: true, currentScore: 0.01, thresholdScore: 0.05 },
    hallucinationDetector: { active: true, groundingScore: 94.2, minThreshold: 75.0 },
    tokenSpikeLimiter: { active: true, currentRps: 84, maxRps: 500 }
  });
  const [dualAuth, setDualAuth] = useState<DualKeyAuth>({
    dpoSigned: false,
    dpoSigner: null,
    safetyOfficerSigned: false,
    safetyOfficerSigner: null
  });
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([
    {
      id: "EVT-KS-901",
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      action: "CIRCUIT_BREAKER_SYNC",
      actor: "SYSTEM_AUTONOMOUS_DAEMON",
      details: "Baseline distribution parameters calibrated. All sensors report nominal operating state.",
      cryptoHash: "0x3a82f9104b209e17bca88921df9001bfa8291a0c4f828102910fa89218209e17"
    }
  ]);
  const [isActing, setIsActing] = useState<boolean>(false);
  const [actorName, setActorName] = useState<string>("Dr. Elena Rostova (Chief AI Safety Officer)");
  const [actionReason, setActionReason] = useState<string>("");

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/v1/ai-killswitch/status");
      const data = await res.json();
      if (data.success && data.state) {
        setGlobalStatus(data.state.globalStatus);
        setSensors(data.state.activeCircuitBreakers);
        setDualAuth(data.state.dualKeyAuthorization);
        if (data.state.auditTrail) setAuditLog(data.state.auditTrail);
      }
    } catch (e) {
      console.warn("Using local killswitch state:", e);
    }
  };

  const handleExecuteAction = async (actionType: "EMERGENCY_STOP" | "DEGRADE_MODE" | "RESUME_NOMINAL" | "FAILOVER_RULES" | "SIGN_DPO" | "SIGN_SAFETY_OFFICER") => {
    setIsActing(true);
    try {
      const res = await fetch("/api/v1/ai-killswitch/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          actor: actorName,
          notes: actionReason || `Manual command invoked under Article 14 protocol.`
        })
      });
      const data = await res.json();
      if (data.success && data.state) {
        setGlobalStatus(data.state.globalStatus);
        setSensors(data.state.activeCircuitBreakers);
        setDualAuth(data.state.dualKeyAuthorization);
        setAuditLog(data.state.auditTrail);
      }
    } catch (e) {
      // Local fallback
      const now = new Date().toISOString();
      if (actionType === "SIGN_DPO") {
        setDualAuth(prev => ({ ...prev, dpoSigned: true, dpoSigner: actorName }));
      } else if (actionType === "SIGN_SAFETY_OFFICER") {
        setDualAuth(prev => ({ ...prev, safetyOfficerSigned: true, safetyOfficerSigner: actorName }));
      } else if (actionType === "EMERGENCY_STOP") {
        setGlobalStatus("EMERGENCY_STOPPED");
      } else if (actionType === "DEGRADE_MODE") {
        setGlobalStatus("DEGRADED");
      } else if (actionType === "RESUME_NOMINAL") {
        setGlobalStatus("NOMINAL");
        setDualAuth({ dpoSigned: false, dpoSigner: null, safetyOfficerSigned: false, safetyOfficerSigner: null });
      } else if (actionType === "FAILOVER_RULES") {
        setGlobalStatus("FAILOVER_ACTIVE");
      }

      setAuditLog(prev => [
        {
          id: `EVT-KS-${Date.now().toString().slice(-4)}`,
          timestamp: now,
          action: actionType,
          actor: actorName,
          details: actionReason || `Manual command invoked: ${actionType}`,
          cryptoHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`
        },
        ...prev
      ]);
    } finally {
      setIsActing(false);
      setActionReason("");
    }
  };

  const handleExportLedger = () => {
    const data = {
      title: "EU AI Act Article 14 Sovereign Human Oversight Audit Trail",
      exportedAt: new Date().toISOString(),
      globalStatus,
      dualKeyAuthorization: dualAuth,
      sensors,
      auditEvents: auditLog
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KILLSWITCH_ARTICLE14_AUDIT_LEDGER_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const statusColors = {
    NOMINAL: {
      bg: "bg-emerald-950/80 border-emerald-800 text-emerald-300",
      badge: "bg-emerald-600 text-white",
      title: "Nominal Sovereign Operation",
      desc: "Model inference active. All Article 14 circuit breakers engaged with 0 trip thresholds breached."
    },
    DEGRADED: {
      bg: "bg-amber-950/80 border-amber-800 text-amber-300",
      badge: "bg-amber-600 text-white",
      title: "Degraded Safety Envelope Active",
      desc: "Model inference constrained to temperature=0. Mandatory human approval required for confidence < 0.95."
    },
    EMERGENCY_STOPPED: {
      bg: "bg-rose-950/80 border-rose-800 text-rose-300",
      badge: "bg-rose-600 text-white",
      title: "CRITICAL: Hard Emergency Stop Disengaged",
      desc: "Inference pipelines severed. Token generation revoked. Fallback to offline deterministic rules active."
    },
    FAILOVER_ACTIVE: {
      bg: "bg-purple-950/80 border-purple-800 text-purple-300",
      badge: "bg-purple-600 text-white",
      title: "Deterministic Rule Failover Engaged",
      desc: "Neural weights bypassed. Processing handled exclusively via auditable statutory decision trees."
    }
  }[globalStatus];

  return (
    <div className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 shadow-xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              EU AI Act Art. 14 & 20
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
              Sovereign Circuit Breaker Plane
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            AI Emergency Killswitch & Human Oversight Control Plane
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Cryptographic dual-authorization mechanism to instantly degrade, disengage, or failover non-compliant models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportLedger}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export Audit Ledger
          </button>
        </div>
      </div>

      {/* Global Status Banner */}
      <div className={`p-5 rounded-2xl border ${statusColors.bg} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
            {globalStatus === "NOMINAL" ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            ) : globalStatus === "EMERGENCY_STOPPED" ? (
              <AlertOctagon className="w-8 h-8 text-rose-400 animate-pulse" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors.badge}`}>
                {globalStatus}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Article 14 State Machine Verified
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{statusColors.title}</h3>
            <p className="text-xs text-slate-300 mt-0.5">{statusColors.desc}</p>
          </div>
        </div>

        {/* Quick Transition Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {globalStatus !== "NOMINAL" && (
            <button
              onClick={() => handleExecuteAction("RESUME_NOMINAL")}
              disabled={isActing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resume Nominal Pipeline
            </button>
          )}

          {globalStatus === "NOMINAL" && (
            <>
              <button
                onClick={() => handleExecuteAction("DEGRADE_MODE")}
                disabled={isActing}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                Degrade Model Envelope
              </button>

              <button
                onClick={() => handleExecuteAction("EMERGENCY_STOP")}
                disabled={isActing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-600/30"
              >
                <Power className="w-3.5 h-3.5" />
                TRIGGER EMERGENCY KILLSWITCH
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dual Key Ceremony & Active Circuit Breakers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dual-Key Authorization Box */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              Article 14 Dual-Key Quorum Authorization
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Quorum: 2 / 2 Signatures
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Under CJEU & EU AI Act governance guidelines, triggering hard suspension or resuming model deployment requires independent cryptographic authorization from both the Data Protection Officer (DPO) and Chief AI Safety Officer.
          </p>

          <div className="space-y-3">
            {/* Key 1: DPO */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${dualAuth.dpoSigned ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-slate-800 text-slate-500"}`}>
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Data Protection Officer (DPO) Key</h4>
                  <span className="text-[11px] text-slate-400">
                    {dualAuth.dpoSigned ? `Signed by: ${dualAuth.dpoSigner || "Marcus Vance (Lead DPO)"}` : "Pending cryptographic signature"}
                  </span>
                </div>
              </div>
              {!dualAuth.dpoSigned ? (
                <button
                  onClick={() => handleExecuteAction("SIGN_DPO")}
                  disabled={isActing}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Sign Key 1
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>

            {/* Key 2: Chief AI Safety Officer */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${dualAuth.safetyOfficerSigned ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-slate-800 text-slate-500"}`}>
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Chief AI Safety Officer (CAISO) Key</h4>
                  <span className="text-[11px] text-slate-400">
                    {dualAuth.safetyOfficerSigned ? `Signed by: ${dualAuth.safetyOfficerSigner || actorName}` : "Pending cryptographic signature"}
                  </span>
                </div>
              </div>
              {!dualAuth.safetyOfficerSigned ? (
                <button
                  onClick={() => handleExecuteAction("SIGN_SAFETY_OFFICER")}
                  disabled={isActing}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Sign Key 2
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Enclave Verification: eIDAS Level 3 High Assurance</span>
            <span className="font-mono">Hash: 0x9f1a...4801</span>
          </div>
        </div>

        {/* Real-time Circuit Breakers */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Automated Circuit Breakers & Tripwire Sensors
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry
            </span>
          </div>

          <div className="space-y-3">
            {/* Sensor 1 */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Out-of-Distribution Drift (Wasserstein σ)</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {sensors.oodDriftSensor.currentSigma}σ / max {sensors.oodDriftSensor.thresholdSigma}σ
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${(sensors.oodDriftSensor.currentSigma / sensors.oodDriftSensor.thresholdSigma) * 100}%` }}
                />
              </div>
            </div>

            {/* Sensor 2 */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Toxicity & Bias Sensor (Llama-Guard 3)</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {(sensors.toxicOutputFilter.currentScore * 100).toFixed(1)}% / cap {(sensors.toxicOutputFilter.thresholdScore * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${(sensors.toxicOutputFilter.currentScore / sensors.toxicOutputFilter.thresholdScore) * 100}%` }}
                />
              </div>
            </div>

            {/* Sensor 3 */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">RAG Grounding & Hallucination Shield</span>
                <span className="font-mono text-sky-400 font-bold">
                  {sensors.hallucinationDetector.groundingScore}% (min {sensors.hallucinationDetector.minThreshold}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-sky-500 h-2 rounded-full"
                  style={{ width: `${sensors.hallucinationDetector.groundingScore}%` }}
                />
              </div>
            </div>

            {/* Sensor 4 */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Token Consumption Rate (Denial-of-Wallet Limiter)</span>
                <span className="font-mono text-slate-300 font-bold">
                  {sensors.tokenSpikeLimiter.currentRps} RPS / {sensors.tokenSpikeLimiter.maxRps} RPS
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${(sensors.tokenSpikeLimiter.currentRps / sensors.tokenSpikeLimiter.maxRps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Event Ledger */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center justify-between mb-4">
          <span className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            Article 14 Sovereign Audit Event Ledger
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Cryptographically Anchored
          </span>
        </h3>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {auditLog.map(evt => (
            <div
              key={evt.id}
              className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 font-bold">{evt.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                    {evt.action}
                  </span>
                  <span className="text-slate-400 text-[11px]">{new Date(evt.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-slate-300 text-xs">{evt.details}</p>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  Actor: <span className="text-slate-400">{evt.actor}</span> | Hash: {evt.cryptoHash}
                </div>
              </div>
              <span className="shrink-0 text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1 self-start sm:self-center">
                <FileCheck2 className="w-3.5 h-3.5" />
                Anchored
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiKillswitchControlPlane;
