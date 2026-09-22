import React, { useState, useEffect } from 'react';
import { 
  Cpu, Activity, Zap, ShieldAlert, RefreshCw, Lock, Server, 
  Layers, Globe, Database, Terminal, CheckCircle2, AlertTriangle, 
  Download, Sliders, Radio, Power, ShieldCheck, FileCheck, Eye, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

interface RegionalNode {
  id: string;
  name: string;
  region: string;
  tenants: number;
  cpuUsage: number;
  memoryUsage: number;
  dbPoolActive: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'ISOLATED' | 'MAINTENANCE';
  isQuarantined: boolean;
}

interface PolicyRule {
  id: string;
  name: string;
  framework: 'GDPR' | 'EU_AI_ACT' | 'NIS2' | 'DORA' | 'HIPAA';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'HOT_ACTIVE' | 'SANDBOX_ONLY' | 'DISABLED';
  latencyImpactMs: number;
  sha256: string;
}

export const AutonomousPlatformControlCenter: React.FC = () => {
  const { showToast } = useNotification();
  const [activeSection, setActiveSection] = useState<'SELF_HEALING' | 'TENANT_ISOLATION' | 'POLICY_HOTSWAP' | 'CIRCUIT_BREAKER'>('SELF_HEALING');
  
  // Real-time system metrics state
  const [metrics, setMetrics] = useState({
    cpu: 18.4,
    memory: 42.1,
    latency: 14.2,
    dbPoolUsage: 28,
    activeSessions: 1420,
    blockedThreatsCount: 389,
    autonomicScore: 99.8
  });

  const [isHealingRunning, setIsHealingRunning] = useState(false);
  const [healingStep, setHealingStep] = useState<string | null>(null);
  const [wafLevel, setWafLevel] = useState<'STANDARD' | 'AGGRESSIVE' | 'ZERO_TRUST'>('STANDARD');
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [circuitBreakerEngaged, setCircuitBreakerEngaged] = useState(false);

  // Regional nodes sample data
  const [nodes, setNodes] = useState<RegionalNode[]>([
    { id: 'node-eu-central', name: 'Frankfurt Core (EU-Central-1)', region: 'EU (Frankfurt)', tenants: 142, cpuUsage: 22, memoryUsage: 45, dbPoolActive: 34, status: 'OPTIMAL', isQuarantined: false },
    { id: 'node-eu-west', name: 'Dublin Gateway (EU-West-1)', region: 'EU (Dublin)', tenants: 98, cpuUsage: 19, memoryUsage: 38, dbPoolActive: 22, status: 'OPTIMAL', isQuarantined: false },
    { id: 'node-us-east', name: 'N. Virginia Sovereign (US-East-1)', region: 'USA (N. Virginia)', tenants: 210, cpuUsage: 31, memoryUsage: 58, dbPoolActive: 48, status: 'OPTIMAL', isQuarantined: false },
    { id: 'node-apac-sg', name: 'Singapore Financial (APAC-SG-1)', region: 'APAC (Singapore)', tenants: 64, cpuUsage: 14, memoryUsage: 29, dbPoolActive: 18, status: 'OPTIMAL', isQuarantined: false },
    { id: 'node-gov-de', name: 'Berlin Sovereign GovCloud (DE-Gov)', region: 'Germany (Sovereign)', tenants: 18, cpuUsage: 8, memoryUsage: 19, dbPoolActive: 6, status: 'OPTIMAL', isQuarantined: false }
  ]);

  // Policy rules list
  const [policies, setPolicies] = useState<PolicyRule[]>([
    { id: 'pol-gdpr-art30', name: 'Art 30 ROPA Audit Trail Enforcer', framework: 'GDPR', severity: 'CRITICAL', status: 'HOT_ACTIVE', latencyImpactMs: 0.4, sha256: 'a9f23e81b...7c41' },
    { id: 'pol-aiact-t4', name: 'EU AI Act High-Risk Bias Guardrail', framework: 'EU_AI_ACT', severity: 'CRITICAL', status: 'HOT_ACTIVE', latencyImpactMs: 1.2, sha256: 'e3b0c4429...282c' },
    { id: 'pol-nis2-resilience', name: 'NIS2 Supply-Chain Threat Circuit', framework: 'NIS2', severity: 'HIGH', status: 'HOT_ACTIVE', latencyImpactMs: 0.6, sha256: '7f83b1657...910d' },
    { id: 'pol-dora-dr', name: 'DORA 15-Min Disaster Recovery Sync', framework: 'DORA', severity: 'HIGH', status: 'HOT_ACTIVE', latencyImpactMs: 0.3, sha256: '5d41402ab...4b28' },
    { id: 'pol-hipaa-ephi', name: 'ePHI Zero-Knowledge Cryptic Mask', framework: 'HIPAA', severity: 'HIGH', status: 'SANDBOX_ONLY', latencyImpactMs: 0.8, sha256: '8d969eef6...1180' }
  ]);

  // Simulated metrics jitter effect for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        cpu: +(prev.cpu + (Math.random() * 2 - 1)).toFixed(1),
        memory: +(prev.memory + (Math.random() * 0.8 - 0.4)).toFixed(1),
        latency: +(prev.latency + (Math.random() * 0.6 - 0.3)).toFixed(1)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerAutonomousHealing = () => {
    setIsHealingRunning(true);
    setHealingStep('Analyzing memory heaps & thread deadlocks...');

    setTimeout(() => {
      setHealingStep('Compacting DuckDB & Kùzu regional shard indexes...');
    }, 1000);

    setTimeout(() => {
      setHealingStep('Clearing stagnant DB connection pool locks...');
    }, 2000);

    setTimeout(() => {
      setHealingStep('Rotating ephemeral HSM secret salts & clearing cache...');
    }, 3000);

    setTimeout(() => {
      setIsHealingRunning(false);
      setHealingStep(null);
      setMetrics((prev) => ({
        ...prev,
        cpu: 12.1,
        memory: 34.0,
        latency: 8.5,
        dbPoolUsage: 18,
        autonomicScore: 100.0
      }));
      showToast('Autonomous Self-Healing sequence completed successfully! All system metrics optimized.', 'success');
    }, 4000);
  };

  const toggleQuarantineNode = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const nextQuarantined = !n.isQuarantined;
          showToast(
            nextQuarantined
              ? `Tenant Node ${n.name} is now QUARANTINED. Ingress traffic blocked.`
              : `Tenant Node ${n.name} quarantine lifted. Normal routing restored.`,
            nextQuarantined ? 'warning' : 'info'
          );
          return {
            ...n,
            isQuarantined: nextQuarantined,
            status: nextQuarantined ? 'ISOLATED' : 'OPTIMAL'
          };
        }
        return n;
      })
    );
  };

  const togglePolicyStatus = (policyId: string) => {
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id === policyId) {
          const nextStatus = p.status === 'HOT_ACTIVE' ? 'DISABLED' : 'HOT_ACTIVE';
          showToast(`Policy [${p.name}] hot-swapped to ${nextStatus}.`, 'info');
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  const handleToggleCircuitBreaker = () => {
    if (!circuitBreakerEngaged) {
      if (window.confirm('Engage Emergency Circuit Breaker? This will temporarily pause new API requests and shift platform to read-only mode.')) {
        setCircuitBreakerEngaged(true);
        setReadOnlyMode(true);
        showToast('Emergency Circuit Breaker ENGAGED. System operating in Read-Only Mode.', 'error');
      }
    } else {
      setCircuitBreakerEngaged(false);
      setReadOnlyMode(false);
      showToast('Circuit Breaker disengaged. Normal write operations resumed.', 'success');
    }
  };

  const exportTelemetryManifest = () => {
    const report = {
      timestamp: new Date().toISOString(),
      systemArchitecture: '9Xen Regulettee Autonomous Enterprise GRC Engine v2.1',
      metrics,
      wafLevel,
      readOnlyMode,
      circuitBreakerEngaged,
      regionalNodes: nodes,
      activePolicies: policies
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autonomous_telemetry_manifest_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Autonomous Telemetry Manifest exported successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cpu className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Autonomous Self-Healing OS Engine
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-full flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" /> Autonomic Health Score: {metrics.autonomicScore}%
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Autonomous Platform Control Center
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Advanced enterprise telemetry orchestrator: Real-time autonomous self-healing, multi-region tenant blast containment, hot-swappable regulatory policies, and emergency circuit breakers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={exportTelemetryManifest}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>Export Telemetry Manifest</span>
            </button>

            <button
              type="button"
              onClick={triggerAutonomousHealing}
              disabled={isHealingRunning}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isHealingRunning ? 'animate-spin' : ''}`} />
              <span>{isHealingRunning ? 'Self-Healing Active...' : 'Trigger Self-Healing'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Gauge Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">CPU Utilization</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-white">{metrics.cpu}%</span>
              <span className="text-[10px] text-emerald-400 font-bold">Optimal</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Memory Allocation</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-white">{metrics.memory}%</span>
              <span className="text-[10px] text-emerald-400 font-bold">Stable</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">P99 API Latency</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-white">{metrics.latency}ms</span>
              <span className="text-[10px] text-indigo-400 font-bold">Sub-20ms</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">DB Pool Usage</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-white">{metrics.dbPoolUsage}%</span>
              <span className="text-[10px] text-emerald-400 font-bold">Active</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Active Sessions</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-white">{metrics.activeSessions}</span>
              <span className="text-[10px] text-slate-400 font-mono">EU/US/APAC</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Blocked Threats (24h)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-emerald-400">{metrics.blockedThreatsCount}</span>
              <span className="text-[10px] text-emerald-400 font-bold">100% Mitigated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Autonomous Healing Progress Indicator */}
      <AnimatePresence>
        {isHealingRunning && healingStep && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-indigo-950/90 border border-indigo-700/80 rounded-2xl text-white shadow-lg flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-indigo-300 animate-spin" />
              <div>
                <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Autonomous Healing Pipeline Active</h4>
                <p className="text-sm font-mono text-indigo-100">{healingStep}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-indigo-300 px-3 py-1 bg-indigo-900 rounded-lg border border-indigo-700">
              STRICT CONCURRENCY LOCK
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1 bg-white p-1.5 rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSection('SELF_HEALING')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'SELF_HEALING'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Self-Healing Orchestrator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('TENANT_ISOLATION')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'TENANT_ISOLATION'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Multi-Region Blast Containment</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('POLICY_HOTSWAP')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'POLICY_HOTSWAP'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Policy Hot-Swapping Engine</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('CIRCUIT_BREAKER')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'CIRCUIT_BREAKER'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>Circuit Breaker & WAF</span>
        </button>
      </div>

      {/* SECTION 1: SELF-HEALING ORCHESTRATOR */}
      {activeSection === 'SELF_HEALING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  Autonomic Subsystem Diagnostics & Automated Remediation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Autonomous agents monitor thread pools, DuckDB sharding locks, and memory cache footprints in real-time.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">DuckDB / Kùzu Shard Lock Index</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    NORMAL (0 DEADLOCKS)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '12%' }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Regional shards (EU, US, APAC, Sovereign DE) operating with zero mutex contention.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Connection Pool Health</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    28% CAPACITY
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '28%' }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Express & FastAPI connection pools configured with auto-recycle on 300s idle limits.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">HSM Secret Salt Rotation</span>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    AUTO-ROTATING (24H)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Next automated quantum-safe secret rotation scheduled in 8 hours 14 mins.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">WAF Ingress Anomaly Filter</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    0 MALICIOUS SPIKES
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '5%' }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Rate-limiting & bot protection active across all ingress endpoints.
                </p>
              </div>
            </div>

            {/* Terminal Live Execution Log */}
            <div className="bg-slate-950 rounded-2xl p-4 font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Autonomous Engine Log Stream
                </span>
                <span className="text-emerald-400 font-bold">● LIVE TELEMETRY</span>
              </div>
              <div className="text-slate-400">[AUTONOMIC-DAEMON] Checking memory fragmentation... Memory heap healthy (34.0 MB).</div>
              <div className="text-emerald-400">[SHARD-SYNC] Syncing DuckDB regional shards across Frankfurt, Dublin, and N. Virginia... PASS.</div>
              <div className="text-slate-400">[HSM-SALT] HMAC-SHA256 session integrity verified. 0 expired tokens pending purge.</div>
              <div className="text-indigo-300">[REGISTRY] All 6 Core Privacy Modules active with zero policy violations.</div>
            </div>
          </div>

          {/* Quick Actions & Autonomous Rules */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Self-Healing Policies
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Auto-Purge Stagnant Locks</span>
                  <span className="text-[11px] text-slate-500">Automatically drop database locks idle for &gt;120 seconds.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Dynamic Cache Compaction</span>
                  <span className="text-[11px] text-slate-500">Compact in-memory DuckDB analytics buffers when memory exceeds 75%.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Quantum-Safe Token Refresh</span>
                  <span className="text-[11px] text-slate-500">Force silent re-authentication if cryptographic token age exceeds 24 hours.</span>
                </div>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={triggerAutonomousHealing}
                disabled={isHealingRunning}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isHealingRunning ? 'animate-spin' : ''}`} />
                <span>Execute Immediate Diagnostics</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MULTI-REGION BLAST CONTAINMENT */}
      {activeSection === 'TENANT_ISOLATION' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Multi-Region Tenant Infrastructure & Blast Containment
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quarantine compromised or high-risk tenant nodes instantly without disrupting global platform operation.
              </p>
            </div>

            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-full">
              5 Active Sovereign Shards
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Regional Node</th>
                  <th className="py-3 px-4">Jurisdiction</th>
                  <th className="py-3 px-4">Active Tenants</th>
                  <th className="py-3 px-4">CPU / Memory</th>
                  <th className="py-3 px-4">Node Health</th>
                  <th className="py-3 px-4 text-right">Quarantine Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {nodes.map((node) => (
                  <tr key={node.id} className={node.isQuarantined ? 'bg-rose-50/60' : 'hover:bg-slate-50/80'}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <Server className={`w-4 h-4 ${node.isQuarantined ? 'text-rose-600' : 'text-indigo-600'}`} />
                        <div>
                          <strong className="text-slate-900 font-bold block">{node.name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">{node.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-semibold">{node.region}</td>

                    <td className="py-3.5 px-4 text-slate-900 font-bold">{node.tenants} Tenants</td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <span>CPU: {node.cpuUsage}%</span>
                        <span className="text-slate-300">|</span>
                        <span>RAM: {node.memoryUsage}%</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {node.isQuarantined ? (
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit">
                          <ShieldAlert className="w-3 h-3" /> QUARANTINED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> OPTIMAL
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleQuarantineNode(node.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                          node.isQuarantined
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700'
                        }`}
                      >
                        {node.isQuarantined ? 'Lift Quarantine' : 'Quarantine Node'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: POLICY HOT-SWAPPING ENGINE */}
      {activeSection === 'POLICY_HOTSWAP' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Hot-Swappable Regulatory Policy Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enable or disable compliance enforcement rules dynamically without requiring platform redeployments.
              </p>
            </div>

            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
              SHA-256 Verified Policy Manifest
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((pol) => (
              <div key={pol.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[9px] font-bold rounded uppercase">
                      {pol.framework}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{pol.name}</h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => togglePolicyStatus(pol.id)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold cursor-pointer transition-colors ${
                      pol.status === 'HOT_ACTIVE'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {pol.status === 'HOT_ACTIVE' ? 'HOT ACTIVE' : 'DISABLED'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 font-mono">
                  <span>Latency Overhead: <strong>{pol.latencyImpactMs}ms</strong></span>
                  <span>SHA: <strong>{pol.sha256}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: CIRCUIT BREAKER & WAF */}
      {activeSection === 'CIRCUIT_BREAKER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Power className="w-5 h-5 text-rose-600" />
              Emergency Platform Circuit Breaker
            </h3>

            <p className="text-xs text-slate-600">
              When engaged, the platform immediately pauses state-modifying write operations across all tenant APIs and enters Read-Only mode to safeguard database integrity during critical incidents.
            </p>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose-900">Circuit Breaker Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  circuitBreakerEngaged ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {circuitBreakerEngaged ? 'ENGAGED (READ-ONLY)' : 'DISENGAGED (NORMAL)'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleCircuitBreaker}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  circuitBreakerEngaged
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {circuitBreakerEngaged ? 'Disengage Circuit Breaker & Resume Write Access' : 'Engage Emergency Circuit Breaker'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Ingress WAF Threat Level
            </h3>

            <p className="text-xs text-slate-600">
              Adjust ingress web application firewall challenge thresholds for all tenant endpoints dynamically.
            </p>

            <div className="space-y-2">
              {(['STANDARD', 'AGGRESSIVE', 'ZERO_TRUST'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    setWafLevel(level);
                    showToast(`WAF Threat Level set to ${level}`, 'info');
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    wafLevel === level
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs">{level} CHALLENGE LEVEL</span>
                  {wafLevel === level && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
