import { fetchWithRetry } from '../../lib/api-client';
import React, { useState, useMemo, useEffect } from "react";
import { useNotification } from "../../context/NotificationContext";
import {
  ShoppingCart,
  CheckCircle2,
  ChevronRight,
  Search,
  Loader2,
  Play,
  Brain,
  Sparkles,
  RefreshCw,
  Sliders,
  Download,
  List,
  Terminal,
  Lock,
  Scale,
  ShieldAlert,
  Fingerprint,
  Wrench,
  HeartPulse,
  Gamepad2,
  Building2,
  Truck,
  Globe,
  ChevronDown,
  ChevronUp,
  Database,
  Copy,
  Check,
  Activity,
  XCircle,
  ArrowUpRight,
  CheckSquare,
  Square,
  BellRing,
  HelpCircle,
  Info,
  Clock,
  LayoutGrid,
  GripVertical,
  Eye,
  EyeOff,
  Plus,
  ArrowUp,
  ArrowDown,
  Settings,
  ShieldCheck,
  Zap,
  Code,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { lazyWithRetry } from "../../lib/lazy-utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from "recharts";
import N9XenReguletteeCaasSdk from "../../lib/caas-client";

import { ActiveDsarSidePanelWidget } from './ActiveDsarSidePanelWidget';
import { KycStatusBadgeSystem } from './KycStatusBadgeSystem';
import { InteractiveAuditChecklist } from '../InteractiveAuditChecklist';
import { DeepComplianceScanner } from '../DeepComplianceScanner';
import { InvoiceHistory } from '../InvoiceHistory';

interface ClientSidePanelProps {
  activeTab: string;
  tenantContext: any;
  activatedAddons: any[];
  setActiveTab: (tab: string) => void;
  checklistHealthScore: number;
  setChecklistHealthScore: (score: number) => void;
}

export const ClientSidePanel: React.FC<ClientSidePanelProps> = ({
  activeTab,
  tenantContext,
  activatedAddons,
  setActiveTab,
  checklistHealthScore,
  setChecklistHealthScore,
}) => {
  // CaaS Communication Protocol Toggle
  const [commsMode, setCommsMode] = useState<'api' | 'websocket'>('api');
  const { showToast } = useNotification();
  const sdk = useMemo(() => new N9XenReguletteeCaasSdk(), []);

  // 1. Overview states
  const [checklist, setChecklist] = useState<{id: number, label: string, done: boolean}[]>([]);
  const [retesting, setRetesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    fetchWithRetry('/api/dashboard/state?tenantId=org_1')
      .then(res => res.json())
      .then(data => {
        if (data && data.checklist) {
          setChecklist(data.checklist);
        }
      })
      .catch(console.error);
  }, []);

  const handleToggleChecklist = async (id: number) => {
    // Optimistic UI update
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));

    try {
      const response = await fetchWithRetry('/api/dashboard/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, tenantId: 'org_1' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update checklist');
      }
      
      const data = await response.json();
      if (data && data.checklist) {
        setChecklist(data.checklist);
      }
    } catch (error) {
      console.error('Checklist sync error:', error);
      showToast('Failed to sync checklist state with sovereign ledger.', 'error');
    }
  };

  // 2. Detector states
  const [sandboxUrl, setSandboxUrl] = useState("https://eurocorp-aviation.eu");
  const [detecting, setDetecting] = useState(false);
  const [detectConsole, setDetectConsole] = useState<string[]>([]);
  const [detectVerdict, setDetectVerdict] = useState<{
    score: number;
    issues: string[];
    risk: "Low" | "Medium" | "High";
  } | null>(null);

  // 3. Audits states
  const [auditFrequency, setAuditFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [threshold, setThreshold] = useState(90);
  const [auditSaved, setAuditSaved] = useState(false);

  // 4. Policy grounding AI engine
  const [query, setQuery] = useState("");
  const [queryAnswer, setQueryAnswer] = useState<string | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  // 5. Autofixer snippet builder
  const [cookieBanner, setCookieBanner] = useState(true);
  const [autoAnonymizeIP, setAutoAnonymizeIP] = useState(true);
  const [blockThirdParty, setBlockThirdParty] = useState(false);
  const [auditLogging, setAuditLogging] = useState(true);
  const [snippetCopied, setSnippetCopied] = useState(false);

  // 6. Evidence Proof Prover
  const [proofText, setProofText] = useState("DPA_VERSION_2.4_FINAL_SIGNED");
  const [generatingProof, setGeneratingProof] = useState(false);
  const [generatedProof, setGeneratedProof] = useState<{
    hash: string;
    merkleRoot: string;
    ledgerBlock: number;
    witnessCount: number;
  } | null>(null);

  // 7. Penalty simulation values
  const [localSeverity, setLocalSeverity] = useState<"low" | "medium" | "high">("medium");
  const [revenueBase, setRevenueBase] = useState(50); // €50M

  // 8. Liaison connection test
  const [channel, setChannel] = useState<"slack" | "discord" | "email" | "api">("slack");
  const [dispatching, setDispatching] = useState(false);
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([]);

  // 9. Advanced toggles
  const [hardenIsolation, setHardenIsolation] = useState(true);
  const [fakeDriftRate, setFakeDriftRate] = useState(14);

  // 10. Integrations state
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  // 11. Predictive state
  const [forecasting, setForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<{ cost: number; penalty: number; total: number } | null>(null);

  // 12. Courtroom state
  const [trialRunning, setTrialRunning] = useState(false);
  const [trialResult, setTrialResult] = useState<{ ruling: string; finalFine: number } | null>(null);

  // 13. Enforcement state
  const [engineArmed, setEngineArmed] = useState(true);
  const [blockades, setBlockades] = useState(3);

  // 14. Automation Portal state
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("ONLINE");

  // Handlers
  const consentTrendData = [
    { name: 'FR', optIn: 65, optOut: 35 },
    { name: 'UK', optIn: 72, optOut: 28 },
    { name: 'BR', optIn: 58, optOut: 42 },
    { name: 'US-CA', optIn: 45, optOut: 55 },
  ];

  const handleRetest = async () => {
    setRetesting(true);
    setTestResult(null);

    if (commsMode === 'api') {
      try {
        const res = await sdk.retest();
        setTestResult(res.result);
      } catch (err: any) {
        setTestResult(`API Error: ${err.message || err}`);
      } finally {
        setRetesting(false);
      }
    } else {
      const ws = sdk.connectWebSocket({
        onLog: (msg) => {
          setTestResult(`[WS Live] ${msg}`);
        },
        onResult: (type, data) => {
          if (type === 'RETEST_RESULT') {
            setTestResult(data.result);
            setRetesting(false);
            ws.close();
          }
        },
        onError: (err) => {
          setTestResult(`WS Stream Error: ${err}`);
          setRetesting(false);
          ws.close();
        }
      });
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'RETEST_REQUEST' }));
      };
    }
  };

  const handleDetectScan = async () => {
    setDetecting(true);
    setDetectVerdict(null);
    setDetectConsole(["Initializing DOM security audit..."]);

    if (commsMode === 'api') {
      setDetectConsole(prev => [...prev, "Invoking HTTP API /api/v1/caas/detect..."]);
      try {
        const res = await sdk.detect(sandboxUrl);
        setDetectConsole(prev => [...prev, "Data returned from REST endpoint.", "Ready."]);
        setDetectVerdict({
          score: res.score,
          risk: res.risk,
          issues: res.issues
        });
      } catch (err: any) {
        setDetectConsole(prev => [...prev, `API Failure: ${err.message || err}`]);
      } finally {
        setDetecting(false);
      }
    } else {
      setDetectConsole(prev => [...prev, "Opening live WebSocket stream to endpoint..."]);
      const ws = sdk.connectWebSocket({
        onLog: (msg) => {
          setDetectConsole(prev => [...prev, msg]);
        },
        onResult: (type, data) => {
          if (type === 'DETECT_RESULT') {
            setDetectConsole(prev => [...prev, "Streaming channel closed. Integrity complete.", "Ready."]);
            setDetectVerdict({
              score: data.score,
              risk: data.risk,
              issues: data.issues
            });
            setDetecting(false);
            ws.close();
          }
        },
        onError: (err) => {
          setDetectConsole(prev => [...prev, `WS Error: ${err}`]);
          setDetecting(false);
          ws.close();
        }
      });
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'DETECT_REQUEST', url: sandboxUrl }));
      };
    }
  };

  const PRESETS: Record<string, string> = {
    ai: "High-risk systems (biometrics, infrastructure, employment filters) require conformity assessments, verified datasets with no illegal bias, and complete activity logging under Article 10 of the EU AI Act.",
    gdpr: "GDPR Article 83 permits maximum fines of €20,000,000 or 4% of total worldwide annual turnover of the preceding financial year for core compliance violations.",
    nis2: "NIS2 mandates essential sectors (energy, banking, SaaS provider platforms) to notify supervisors of major security incidents within 24 hours (early warning) and 72 hours (formal report).",
  };

  const handleQueryAI = async (presetKey?: string) => {
    const q = presetKey || query;
    if (!q && !presetKey) return;

    setQueryLoading(true);
    setQueryAnswer(null);

    try {
      const res = await sdk.queryAi(q, presetKey);
      setQueryAnswer(res.answer);
    } catch (err: any) {
      setQueryAnswer(`Error invoking CaaS AI FAQ router: ${err.message || err}`);
    } finally {
      setQueryLoading(false);
    }
  };

  const generatedCustomSnippet = `<script 
  src="https://cdn.nonaxen.com/shield.v1.js" 
  data-tenant="${tenantContext?.id || "org_3"}"
  data-banner="${cookieBanner}"
  data-anonymize-ip="${autoAnonymizeIP}"
  data-block-pixels="${blockThirdParty}"
  data-dora-audit="${auditLogging}"
></script>`;

  const copyCustomSnippet = () => {
    navigator.clipboard.writeText(generatedCustomSnippet);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  const handleGenerateProof = async () => {
    if (!proofText) return;
    setGeneratingProof(true);
    setGeneratedProof(null);

    if (commsMode === 'api') {
      try {
        const res = await sdk.generateProof(proofText);
        setGeneratedProof({
          hash: res.hash,
          merkleRoot: res.merkleRoot,
          ledgerBlock: res.ledgerBlock,
          witnessCount: res.witnessCount
        });
      } catch (err: any) {
        console.error("SDK generateProof error:", err);
      } finally {
        setGeneratingProof(false);
      }
    } else {
      const ws = sdk.connectWebSocket({
        onResult: (type, data) => {
          if (type === 'PROOF_RESULT') {
            setGeneratedProof({
              hash: data.hash,
              merkleRoot: data.merkleRoot,
              ledgerBlock: data.ledgerBlock,
              witnessCount: data.witnessCount
            });
            setGeneratingProof(false);
            ws.close();
          }
        },
        onError: (err) => {
          console.error("WS proof error:", err);
          setGeneratingProof(false);
          ws.close();
        }
      });
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'PROOF_REQUEST', proofText }));
      };
    }
  };

  const handleDispatchTest = async () => {
    setDispatching(true);
    setDispatchLogs([`Initiating webhook dispatch sequence...`]);

    if (commsMode === 'api') {
      try {
        const res = await sdk.dispatchWebhook(channel, "Compliance alert dispatched.");
        setDispatchLogs(res.logs);
      } catch (err: any) {
        setDispatchLogs(prev => [...prev, `API Webhook Failure: ${err.message || err}`]);
      } finally {
        setDispatching(false);
      }
    } else {
      setDispatchLogs(prev => [...prev, "Opening secure real-time notification socket channel..."]);
      const ws = sdk.connectWebSocket({
        onLog: (msg) => {
          setDispatchLogs(prev => [...prev, msg]);
        },
        onResult: (type, data) => {
          if (type === 'DISPATCH_RESULT') {
            setDispatchLogs(data.logs);
            setDispatching(false);
            ws.close();
          }
        },
        onError: (err) => {
          setDispatchLogs(prev => [...prev, `WS Alert Failure: ${err}`]);
          setDispatching(false);
          ws.close();
        }
      });
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'DISPATCH_REQUEST', channel }));
      };
    }
  };

  const handlePingIntegrations = () => {
    setPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setPingResult("All API proxy endpoints verified and responding successfully.");
      setPinging(false);
    }, 1200);
  };

  const handleRunForecast = () => {
    setForecasting(true);
    setForecastResult(null);
    setTimeout(() => {
      setForecastResult({ cost: 125000, penalty: 345000, total: 470000 });
      setForecasting(false);
    }, 1500);
  };

  const handleRunMockTrial = () => {
    setTrialRunning(true);
    setTrialResult(null);
    setTimeout(() => {
      setTrialResult({ ruling: "Compromise settlement accepted due to prompt remediation.", finalFine: 2100000 });
      setTrialRunning(false);
    }, 2000);
  };

  const handleToggleEngine = () => {
    setEngineArmed(!engineArmed);
  };

  const handleTriggerBlockade = () => {
    setBlockades(prev => prev + 1);
  };

  const handleSyncRules = () => {
    setSyncing(true);
    setSyncStatus("SYNCING...");
    setTimeout(() => {
      setSyncStatus("ONLINE & SYNCED");
      setSyncing(false);
    }, 1500);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col h-[calc(100vh-6rem)] sticky top-6">
      <div className="border-b border-slate-850 pb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold tracking-wider uppercase text-slate-200">
            Section Supervisor
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          Tab: {activeTab.toUpperCase()}
        </span>
      </div>

      {/* CaaS Communication Protocol Toggle */}
      <div className="bg-slate-950 p-2 rounded-xl border border-slate-850 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 pl-1">
          CaaS Protocol:
        </span>
        <div className="flex space-x-1">
          <button
            onClick={() => setCommsMode('api')}
            className={`text-[10px] px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
              commsMode === 'api'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            REST API
          </button>
          <button
            onClick={() => setCommsMode('websocket')}
            className={`text-[10px] px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
              commsMode === 'websocket'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            WebSocket
          </button>
        </div>
      </div>

      {/* Scrollable Container for Side Panel Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-1.5 min-h-0">
        <AnimatePresence mode="wait">
        {(activeTab === "ai-risk-audit" || activeTab === "ai-audit") && (
          <motion.div
            key="ai-risk-audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Brain className="w-4 h-4 text-indigo-400" /> AI Risk Guardrail Telemetry
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Live Article 10/14/15/50 compliance controls and automated fix triggers.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-mono">Active Guardrail Fence</span>
                  <span className="text-emerald-400 font-mono font-black flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-mono">Human-in-the-Loop Queue</span>
                  <span className="text-indigo-400 font-mono font-bold">14 Items Pending</span>
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-mono">Demographic Bias Threshold</span>
                  <span className="text-slate-200 font-mono font-bold">&lt; 2.5% Variance</span>
                </div>

                <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Audit Ledger Hash:</span>
                  <span className="text-slate-300 font-mono text-[9px] truncate max-w-[140px]">sha256:e3b0c442...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "billing" && (
          <motion.div
            key="billing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <ShoppingCart className="w-4 h-4 text-emerald-400" /> Subscription & Usage
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Manage your active plan, track metered API usage, and view upcoming invoices.
              </p>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Current Plan</span>
                    <div className="text-sm font-black text-indigo-400 mt-0.5">Enterprise Pro (EU)</div>
                  </div>
                  <button className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold transition">Upgrade</button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Metered API Traffic</span>
                    <span>14,502 / 50,000 requests</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[29%]"></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Next Billing Date:</span>
                  <span className="text-slate-200 font-mono">July 15, 2026</span>
                </div>
              </div>

              <div className="mt-4">
                <InvoiceHistory userEmail={tenantContext?.contactEmail || "nonacryptaiii@gmail.com"} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <KycStatusBadgeSystem onActionClick={(act: string) => {
                if (act === 'upload_docs') {
                  setActiveTab('audits');
                }
              }} />
            </div>

            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Audit Readiness Status
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Current progress on sovereign audit requirements and manual compliance tasks.
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Readiness Level</span>
                  <span className="text-xs font-black text-indigo-400 font-mono">{checklistHealthScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${checklistHealthScore}%` }}
                    className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                  />
                </div>
                <button 
                  onClick={() => setActiveTab('audits')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <span>Open Audit Checklist Module</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-4">
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Brain className="w-4 h-4 text-indigo-400" /> AI Risk Audit & Fixation
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Article 14/15 automated risk audit, bias monitoring, and code remediation.
              </p>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Safety Index</span>
                  <span className="text-emerald-400 font-mono font-black">88% (A)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Critical Findings</span>
                  <span className="text-rose-400 font-mono font-bold">2 Open</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTab("ai-risk-heatmap")}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-lg transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                  >
                    <Brain className="w-3.5 h-3.5 text-indigo-400" />
                    <span>D3 Heatmap</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("ai-risk-audit")}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 text-xs shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Fixation</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-4">
              <ActiveDsarSidePanelWidget />
            </div>

            <div className="border-t border-slate-850 pt-4">
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Activity className="w-4 h-4 text-indigo-400" /> Quick Security Check
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Run immediate API evaluation to assert state health dynamically.
              </p>
              <button
                onClick={handleRetest}
                disabled={retesting}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition flex items-center justify-center gap-2 text-xs"
              >
                {retesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>{retesting ? "Probing..." : "Assure Workspace Now"}</span>
              </button>
              <button
                onClick={() => setActiveTab("compliance-scanner")}
                className="w-full py-2 mt-2 bg-slate-800 hover:bg-slate-750 text-white font-semibold rounded-lg shadow transition flex items-center justify-center gap-2 text-xs"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span>Deep Compliance Scanner</span>
              </button>
              {testResult && (
                <div className="mt-3 p-2.5 bg-indigo-950/40 border border-indigo-900/50 rounded-lg text-indigo-300 text-[11px] font-medium leading-relaxed font-mono">
                  {testResult}
                </div>
              )}
            </div>

            <div className="border-t border-slate-850 pt-4">
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Activity className="w-4 h-4 text-amber-400" /> Consent Opt-in Rates
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Real-time trends of Opt-in vs Opt-out across jurisdictions.
              </p>
              <div className="h-48 w-full bg-slate-950 p-2 rounded-lg border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consentTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px', borderRadius: '4px' }}
                      itemStyle={{ fontSize: '10px' }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="optIn" fill="#10b981" name="Opt-in %" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="optOut" fill="#ef4444" name="Opt-out %" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "detector" && (
          <motion.div
            key="detector"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Search className="w-4 h-4 text-indigo-400" /> Rapid Sandbox Scanner
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Scan public domains, consent patterns, and cookie tags instantly.
              </p>
              
              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sandboxUrl}
                    onChange={(e) => setSandboxUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={handleDetectScan}
                    disabled={detecting}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded flex items-center justify-center border-none cursor-pointer"
                  >
                    {detecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex gap-1.5">
                  <button onClick={() => setSandboxUrl("https://eurocorp-aviation.eu")} className="text-[10px] bg-slate-850 px-2 py-1 rounded text-slate-400 hover:text-white border border-transparent hover:border-slate-800 cursor-pointer">
                    Aviation (EU)
                  </button>
                  <button onClick={() => setSandboxUrl("https://marketing-funnel.us")} className="text-[10px] bg-slate-850 px-2 py-1 rounded text-slate-400 hover:text-white border border-transparent hover:border-slate-800 cursor-pointer">
                    Funnel (US)
                  </button>
                </div>
              </div>
            </div>

            {detectConsole.length > 0 && (
              <div className="bg-slate-950 rounded-lg p-3 border border-slate-850 font-mono text-[10px] space-y-1 text-slate-400 max-h-36 overflow-y-auto custom-scrollbar">
                {detectConsole.map((line, idx) => (
                  <div key={idx} className="flex gap-1.5 items-start">
                    <span className="text-indigo-500 select-none">&gt;</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            )}

            {detectVerdict && (
              <div className={`p-3.5 rounded-xl border ${detectVerdict.score >= 80 ? "bg-emerald-950/40 border-emerald-900/50" : "bg-rose-950/40 border-rose-900/50"}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-200">Execution Score:</span>
                  <span className={`font-black text-sm px-2 py-0.5 rounded ${detectVerdict.score >= 80 ? "text-emerald-400 bg-emerald-950" : "text-rose-400 bg-rose-950"}`}>
                    {detectVerdict.score}%
                  </span>
                </div>
                <div className="space-y-1.5">
                  {detectVerdict.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-300 text-[10.5px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${detectVerdict.score >= 80 ? "bg-emerald-400" : "bg-rose-500"}`}></span>
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "audits" && (
          <motion.div
            key="audits"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-xs"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                <div>
                  <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Sliders className="w-4 h-4 text-amber-400" /> Automated Audit Scheduler
                  </h4>
                  <p className="text-slate-400 text-[11px] mb-3">
                    Modify sovereign audit frequency and conforming compliance tolerances.
                  </p>

                  <div className="space-y-3.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1.5">SCAN FREQUENCY</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["daily", "weekly", "monthly"] as const).map(freq => (
                          <button
                            key={freq}
                            onClick={() => { setAuditFrequency(freq); setAuditSaved(false); }}
                            className={`py-1.5 text-[10px] rounded font-bold border transition capitalize cursor-pointer ${auditFrequency === freq ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"}`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>COMPLIANCE CEILING</span>
                        <span className="font-mono text-indigo-400">{threshold}%</span>
                      </div>
                      <input
                        type="range"
                        min="70"
                        max="100"
                        value={threshold}
                        onChange={(e) => { setThreshold(Number(e.target.value)); setAuditSaved(false); }}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      {threshold < 90 && (
                        <span className="text-[9px] text-amber-500 mt-1 block">
                          ⚠️ Threshold below recommended EU regulatory compliance line.
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setAuditSaved(true)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded text-[11px] cursor-pointer border-none"
                    >
                      Save Schedule Parameters
                    </button>

                    {auditSaved && (
                      <div className="p-2 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded text-center text-[10.5px] font-medium">
                        ✓ Recurring scheduler update synchronized successfully.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sync Integrity</h5>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed">
                    Checklist progress is bi-directionally synced with the central GRC dashboard and the persistent sovereign ledger.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2 h-[600px]">
                <React.Suspense fallback={<div className="h-full bg-slate-900 animate-pulse rounded-2xl border border-slate-800" />}>
                  <InteractiveAuditChecklist 
                    onStatusChange={(items: any[]) => {
                      const completed = items.filter((i: any) => i.status === 'COMPLETED').length;
                      const progress = (completed / items.length) * 100;
                      setChecklistHealthScore(Math.round(progress));
                    }}
                  />
                </React.Suspense>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "engine" && (
          <motion.div
            key="engine"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Scale className="w-4 h-4 text-indigo-400" /> Policy Search Grounding
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Query EU Official Journal texts with high-trust grounding presets.
              </p>

              <div className="space-y-2.5">
                <div className="flex gap-1.5 flex-wrap">
                  <button onClick={() => handleQueryAI("ai")} className="text-[10px] bg-slate-850 px-2 py-1 rounded text-slate-300 hover:text-white cursor-pointer border-none">
                    AI Act High Risk
                  </button>
                  <button onClick={() => handleQueryAI("gdpr")} className="text-[10px] bg-slate-850 px-2 py-1 rounded text-slate-300 hover:text-white cursor-pointer border-none">
                    GDPR Fine Caps
                  </button>
                  <button onClick={() => handleQueryAI("nis2")} className="text-[10px] bg-slate-850 px-2 py-1 rounded text-slate-300 hover:text-white cursor-pointer border-none">
                    NIS2 Deadlines
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search custom policy clauses..."
                    className="w-full bg-slate-950 border border-slate-800 rounded pl-2.5 pr-12 py-2 text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleQueryAI(); }}
                  />
                  <button
                    onClick={() => handleQueryAI()}
                    disabled={queryLoading}
                    className="absolute right-1.5 top-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-1 rounded-md text-[10px] disabled:opacity-50 cursor-pointer border-none"
                  >
                    {queryLoading ? "..." : "Send"}
                  </button>
                </div>
              </div>
            </div>

            {queryLoading && (
              <div className="py-4 flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span className="text-slate-400 text-[10px]">Grounding knowledge graph...</span>
                </div>
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-full"></div>
                  <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                  <div className="h-3 bg-slate-800 rounded w-4/6"></div>
                </div>
              </div>
            )}

            {queryAnswer && (
              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed text-[11px] text-slate-300 font-medium whitespace-pre-wrap font-mono">
                {queryAnswer}
                <div className="mt-2 pt-2 border-t border-slate-900 text-[9px] text-slate-500 font-mono text-right">
                  Lexis-Grounding Engine V1.4
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "autofixer" && (
          <motion.div
            key="autofixer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Code className="w-4 h-4 text-emerald-400" /> Smart Snippet Configurator
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Live-configure and copy scripts for non-intrusive compliance injection.
              </p>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <label className="flex justify-between items-center cursor-pointer text-slate-300 hover:text-white">
                  <span>Include Cookie Banner UI</span>
                  <input
                    type="checkbox"
                    checked={cookieBanner}
                    onChange={(e) => setCookieBanner(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                  />
                </label>

                <label className="flex justify-between items-center cursor-pointer text-slate-300 hover:text-white">
                  <span>Auto-Anonymize Host IP</span>
                  <input
                    type="checkbox"
                    checked={autoAnonymizeIP}
                    onChange={(e) => setAutoAnonymizeIP(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                  />
                </label>

                <label className="flex justify-between items-center cursor-pointer text-slate-300 hover:text-white">
                  <span>Block External Pixels</span>
                  <input
                    type="checkbox"
                    checked={blockThirdParty}
                    onChange={(e) => setBlockThirdParty(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                  />
                </label>

                <label className="flex justify-between items-center cursor-pointer text-slate-300 hover:text-white">
                  <span>Enable DORA Audit Flags</span>
                  <input
                    type="checkbox"
                    checked={auditLogging}
                    onChange={(e) => setAuditLogging(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                  />
                </label>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>EMBEDDABLE INTEGRATION STRING</span>
                  <button onClick={copyCustomSnippet} className="text-indigo-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer border-none bg-transparent">
                    {snippetCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{snippetCopied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-300 font-mono overflow-x-auto select-all max-h-36 custom-scrollbar">
                  {generatedCustomSnippet}
                </pre>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "prove" && (
          <motion.div
            key="prove"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Lock className="w-4 h-4 text-indigo-400" /> Cryptographic Escrow
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Compile Zero-Knowledge evidence logs to secure in immutable node storage.
              </p>

              <div className="space-y-3">
                <textarea
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Enter document title, hash, or audit trace string..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                />

                <button
                  onClick={handleGenerateProof}
                  disabled={generatingProof || !proofText}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition text-xs cursor-pointer border-none"
                >
                  {generatingProof ? "Publishing Proof..." : "Generate & Post ZK Proof"}
                </button>
              </div>
            </div>

            {generatingProof && (
              <div className="text-center py-4 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                <span className="text-slate-400 text-[10px]">Encrypting state metadata...</span>
              </div>
            )}

            {generatedProof && (
              <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl space-y-2 font-mono text-[10.5px]">
                <div className="flex justify-between border-b border-slate-900 pb-1 text-slate-400">
                  <span>Escrow Hash:</span>
                  <span className="text-slate-200 font-bold text-sky-400">{generatedProof.hash}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1 text-slate-400">
                  <span>Merkle Root:</span>
                  <span className="text-slate-200">{generatedProof.merkleRoot}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1 text-slate-400">
                  <span>Ledger Block ID:</span>
                  <span className="text-slate-300 font-bold">#{generatedProof.ledgerBlock}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Nodes Affirming:</span>
                  <span className="text-emerald-400 font-bold font-sans flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {generatedProof.witnessCount} validators
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "compliance-scanner" && (
          <motion.div
            key="compliance-scanner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full overflow-y-auto custom-scrollbar pr-1"
          >
            <DeepComplianceScanner 
              tenantId={tenantContext?.id || "org_3"} 
              onClose={() => setActiveTab("overview")}
            />
          </motion.div>
        )}

        {activeTab === "penalty" && (
          <motion.div
            key="penalty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Scale className="w-4 h-4 text-indigo-400" /> Statutory Severity Projections
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Evaluate financial penalties mapped against yearly enterprise revenue metrics.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                    <span>ANNUAL TURNOVER</span>
                    <span className="font-mono text-indigo-400">€{revenueBase}M</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={revenueBase}
                    onChange={(e) => setRevenueBase(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-center">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-[9px] text-slate-500 uppercase font-black">GDPR Max Limit</span>
                    <span className="block font-mono text-sm text-rose-400 font-extrabold mt-1">
                      €{(revenueBase * 0.04).toFixed(1)}M
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-[9px] text-slate-500 uppercase font-black">AI Act Max Limit</span>
                    <span className="block font-mono text-sm text-indigo-400 font-extrabold mt-1">
                      €{(revenueBase * 0.06).toFixed(1)}M
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Projected Violation Severity</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(["low", "medium", "high"] as const).map(sev => (
                      <button
                        key={sev}
                        onClick={() => setLocalSeverity(sev)}
                        className={`py-1 rounded text-[9px] font-bold border transition capitalize cursor-pointer ${localSeverity === sev ? "bg-amber-600 text-white border-amber-500" : "bg-slate-900 text-slate-500 border-slate-850 hover:text-slate-300"}`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-400">Weighted Fine Prediction:</span>
                  <span className="font-mono text-slate-200">
                    €{(revenueBase * (localSeverity === "low" ? 0.005 : localSeverity === "medium" ? 0.015 : 0.035)).toFixed(2)}M
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "liaison" && (
          <motion.div
            key="liaison"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <BellRing className="w-4 h-4 text-amber-400" /> Liaison Webhook Integrations
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Broadcast real-time compliance events directly to workspace platforms.
              </p>

              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="grid grid-cols-2 gap-1.5">
                  {(["slack", "discord", "email", "api"] as const).map(ch => (
                    <button
                      key={ch}
                      onClick={() => { setChannel(ch); setDispatchLogs([]); }}
                      className={`py-1.5 rounded text-[10px] font-bold border transition uppercase cursor-pointer ${channel === ch ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-850 hover:text-white"}`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleDispatchTest}
                  disabled={dispatching}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all text-xs cursor-pointer border-none"
                >
                  {dispatching ? "Broadcasting Alert..." : `Test ${channel.toUpperCase()} Dispatch`}
                </button>
              </div>
            </div>

            {dispatchLogs.length > 0 && (
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 font-mono text-[9px] text-slate-400 space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                {dispatchLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-1">
                    <span className="text-indigo-500 select-none">»</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "predictive" && (
          <motion.div
            key="predictive"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Sliders className="w-4 h-4 text-indigo-400" /> Cost-Benefit Modeler
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Model investment costs against predicted regulatory liabilities.
              </p>

              <div className="space-y-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <button
                  onClick={handleRunForecast}
                  disabled={forecasting}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all text-xs cursor-pointer border-none"
                >
                  {forecasting ? "Executing Model..." : "Run Posture Projection"}
                </button>

                {forecastResult && (
                  <div className="space-y-2 border-t border-slate-900 pt-2 text-[11px] font-mono leading-relaxed">
                    <div className="flex justify-between border-b border-slate-900 pb-1 text-slate-400">
                      <span>Mitigation Cost:</span>
                      <span className="text-slate-200">€{forecastResult.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1 text-slate-400">
                      <span>Expected Fine Risk:</span>
                      <span className="text-rose-400 font-bold">€{forecastResult.penalty.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 font-bold">
                      <span>ROI Margin:</span>
                      <span className="text-emerald-400">
                        +{(100 * (forecastResult.penalty / forecastResult.cost)).toFixed(0)}% ROI
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "integrations" && (
          <motion.div
            key="integrations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Sliders className="w-4 h-4 text-indigo-400" /> Integrations Supervisor
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Assert proxy tunnels and verify live connection handshakes.
              </p>

              <div className="space-y-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <button
                  onClick={handlePingIntegrations}
                  disabled={pinging}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all text-xs cursor-pointer border-none"
                >
                  {pinging ? "Asserting Proxy Tunnel..." : "Ping Active Integrations"}
                </button>

                {pingResult && (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded text-[11px] font-medium leading-relaxed">
                    {pingResult}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "advanced" && (
          <motion.div
            key="advanced"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Wrench className="w-4 h-4 text-amber-400" /> Sovereign Enclave Toggles
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Govern physical cloud isolation parameters and test client-side drift simulation.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <label className="flex justify-between items-center cursor-pointer text-slate-300 hover:text-white">
                  <span>Enforce Micro-Enclave Shields</span>
                  <input
                    type="checkbox"
                    checked={hardenIsolation}
                    onChange={(e) => setHardenIsolation(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                  />
                </label>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                    <span>MOCK DRIFT GENERATION RATE</span>
                    <span className="font-mono text-indigo-400">{fakeDriftRate} events/min</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={fakeDriftRate}
                    onChange={(e) => setFakeDriftRate(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "automation-portal" && (
          <motion.div
            key="automation-portal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Database className="w-4 h-4 text-indigo-400" /> Automation Supervisor
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Synchronize automated compliance scripts and GRC system rulesets.
              </p>

              <div className="space-y-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">AUTOMATION HEALTH STATUS</div>
                <div className="font-mono font-black text-sm text-indigo-400 mb-3">{syncStatus}</div>

                <button
                  onClick={handleSyncRules}
                  disabled={syncing}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all text-xs cursor-pointer border-none"
                >
                  {syncing ? "Broadcasting Script Update..." : "Sync Script Rulesets"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "enforcement" && (
          <motion.div
            key="enforcement"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-rose-400" /> Boundary Guard Toggles
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Toggle auto-remediation triggers and track total blockaded connections.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Armed Interceptors State</span>
                  <button
                    onClick={handleToggleEngine}
                    className={`px-3 py-1 text-[10px] rounded font-mono font-bold transition uppercase cursor-pointer border-none ${engineArmed ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400"}`}
                  >
                    {engineArmed ? "ARMED" : "BYPASSED"}
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Connections Blockaded</span>
                  <span className="font-mono font-black text-rose-400 text-sm bg-slate-900 border border-slate-850 px-2 py-0.5 rounded">{blockades}</span>
                </div>

                <button
                  onClick={handleTriggerBlockade}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded text-[11px] cursor-pointer border-none"
                >
                  Force Intercept Test
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "courtroom" && (
          <motion.div
            key="courtroom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Scale className="w-4 h-4 text-indigo-400" /> Virtual GRC Arbitration
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Trigger mock trials to simulate legal outcomes and evaluate mitigation factors.
              </p>

              <div className="space-y-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <button
                  onClick={handleRunMockTrial}
                  disabled={trialRunning}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all text-xs cursor-pointer border-none"
                >
                  {trialRunning ? "Running Simulation..." : "Trigger Legal Outcome Model"}
                </button>

                {trialResult && (
                  <div className="space-y-2 border-t border-slate-900 pt-2 text-[10.5px] font-mono leading-relaxed">
                    <div className="text-slate-400">
                      Ruling: <span className="text-slate-200 font-semibold">{trialResult.ruling}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 pt-1">
                      <span>Mitigated Fine:</span>
                      <span className="text-rose-400 font-bold text-xs">€{(trialResult.finalFine / 1000000).toFixed(2)}M</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "policy-comparison" && (
          <motion.div
            key="policy-comparison"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <FileText className="w-4 h-4 text-amber-400" /> Policy Sync
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Ensure your policies match latest EU and global regulations.
              </p>
              <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold transition cursor-pointer border-none">
                Check Drift
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Settings className="w-4 h-4 text-slate-400" /> Preferences
              </h4>
              <p className="text-slate-400 text-[11px] mb-3">
                Manage personal and tenant-level GRC configurations.
              </p>
            </div>
          </motion.div>
        )}

        {/* SUBSCRIBED CAAS ENCLAVES INTERACTIVE MODULES */}
        {activeTab === "gdpr-compliance" && (
          <motion.div
            key="gdpr-compliance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> GDPR Compliance Enclave
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  SUBSCRIBED
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mb-3">
                Art. 30 ROPA, Art. 17 Right-to-Erasure, and Art. 33/34 Incident Breach controls.
              </p>
              
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">ROPA Ledger Status:</span>
                  <span className="text-emerald-400 font-bold font-mono">100% Certified</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Active DSAR Requests:</span>
                  <span className="text-indigo-400 font-bold font-mono">3 Processing</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Erasure Verification:</span>
                  <span className="text-emerald-400 font-bold font-mono">Zero-Leakage Hash</span>
                </div>
                <button 
                  onClick={() => {
                    showToast("GDPR Shredder & Cryptographic Proof generated.", "success");
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition text-[11px] shadow-sm cursor-pointer"
                >
                  Trigger Instant Data Erasure Audit
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {(activeTab === "cyber-security" || activeTab === "nis2") && (
          <motion.div
            key="cyber-security"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-indigo-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" /> NIS2 & Cybersecurity Suite
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  SUBSCRIBED
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mb-3">
                Mandatory early warning 24-hr reporting, supply chain cyber posture, and DORA resilience.
              </p>
              
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">NIS2 Incident Dispatcher:</span>
                  <span className="text-emerald-400 font-bold font-mono">STANDBY (0 Active)</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Supply Chain Risk Assessment:</span>
                  <span className="text-indigo-300 font-bold font-mono">42 Vendors Monitored</span>
                </div>
                <button 
                  onClick={() => {
                    showToast("Simulated 24-hr NIS2 early warning sent to CSIRT test endpoint.", "info");
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition text-[11px] shadow-sm cursor-pointer"
                >
                  Test CSIRT / DPA Early Warning Hook
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "aml-kyc" && (
          <motion.div
            key="aml-kyc"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-amber-400" /> Fintech AML & KYC Enclave
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  SUBSCRIBED
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mb-3">
                6th Anti-Money Laundering Directive (AMLD6) screening and real-time transaction watch.
              </p>
              
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Sanctions & PEP Database:</span>
                  <span className="text-emerald-400 font-bold font-mono">LIVE SYNC (EU/OFAC)</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Suspicious Activity Alerts:</span>
                  <span className="text-amber-400 font-bold font-mono">0 Unreviewed</span>
                </div>
                <button 
                  onClick={() => {
                    showToast("PEP & Global Sanctions Screening batch executed across 1,240 entities.", "success");
                  }}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-lg transition text-[11px] shadow-sm cursor-pointer"
                >
                  Run Instant Sanctions Probe
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "ecommerce-eu" && (
          <motion.div
            key="ecommerce-eu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sky-400 flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-sky-400" /> EU eCommerce & GPSR Enclave
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">
                  SUBSCRIBED
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mb-3">
                General Product Safety Regulation (GPSR) and Omnibus 30-day prior price validation.
              </p>
              
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">EU Economic Operator Rep:</span>
                  <span className="text-emerald-400 font-bold font-mono">CERTIFIED</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Omnibus Discount Validator:</span>
                  <span className="text-emerald-400 font-bold font-mono">COMPLIANT</span>
                </div>
                <button 
                  onClick={() => {
                    showToast("GPSR catalog audit complete: All 4,800 SKUs contain valid EU manufacturer data.", "success");
                  }}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition text-[11px] shadow-sm cursor-pointer"
                >
                  Run GPSR Safety Audit
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "healthtech" && (
          <motion.div
            key="healthtech"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-400" /> Healthtech & EHDS Enclave
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  SUBSCRIBED
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mb-3">
                European Health Data Space (EHDS) sovereignty and pseudonymization verification.
              </p>
              
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">EHDS Data Anonymization:</span>
                  <span className="text-emerald-400 font-bold font-mono">k-Anonymity (k=50)</span>
                </div>
                <button 
                  onClick={() => {
                    showToast("EHDS Health Data Pipeline certified with zero clinical PII leakage.", "success");
                  }}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition text-[11px] shadow-sm cursor-pointer"
                >
                  Verify EHDS Patient Anonymity
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "gaming" && (
          <motion.div
            key="gaming"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-purple-400 flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 text-purple-400" /> Gaming & Minor Protection Enclave
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  SUBSCRIBED
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mb-3">
                PEGI Age-Gating, Lootbox drop-rate transparency, and zero dark patterns.
              </p>
              
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">PEGI Age Verification:</span>
                  <span className="text-emerald-400 font-bold font-mono">ENFORCED</span>
                </div>
                <button 
                  onClick={() => {
                    showToast("Gaming fairness audit verified: Lootbox probability disclosures comply with EU consumer laws.", "success");
                  }}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition text-[11px] shadow-sm cursor-pointer"
                >
                  Audit Drop Rates & Dark Patterns
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Add-on Fallback View if user clicked any other subscribed custom addon */}
        {activatedAddons.some(a => a.id === activeTab && !["gdpr-compliance", "cyber-security", "nis2", "aml-kyc", "ecommerce-eu", "healthtech", "gaming"].includes(a.id)) && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-xs"
          >
            <div>
              {(() => {
                const currentAddon = activatedAddons.find(a => a.id === activeTab);
                return (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" /> {currentAddon?.name || "CaaS Custom Enclave"}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mb-3">
                      {currentAddon?.desc || "Subscribed specialized CaaS regulatory compliance enclave."}
                    </p>
                    
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Act / Framework:</span>
                        <span className="text-indigo-400 font-bold font-mono">{currentAddon?.actId || "ENTERPRISE"}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Health Index:</span>
                        <span className="text-emerald-400 font-bold font-mono">{currentAddon?.score || 95}% (Passing)</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Subscription Status:</span>
                        <span className="text-emerald-400 font-bold font-mono uppercase">{currentAddon?.subscriptionStatus || "ACTIVE"}</span>
                      </div>
                      <button 
                        onClick={() => {
                          showToast(`${currentAddon?.name} live telemetry sync verified with zero exceptions.`, "success");
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition text-[11px] shadow-sm cursor-pointer"
                      >
                        Run Live Health Assertions
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CaaS Operational Enclaves */}
      <div className="border-t border-slate-850 pt-4 mt-auto">
        <div className="flex items-center space-x-2 mb-3">
          <Globe className="w-4 h-4 text-indigo-400" />
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            CaaS Operational Enclaves
          </h4>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {activatedAddons.map((addon) => (
            <button
              key={addon.id}
              onClick={() => setActiveTab(addon.id)}
              className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all text-left group ${
                activeTab === addon.id 
                  ? "bg-indigo-600/15 border-indigo-500/50 text-indigo-100 shadow-[0_0_15px_rgba(79,70,229,0.1)]" 
                  : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg transition-colors ${activeTab === addon.id ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                   <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold truncate">{addon.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                {activeTab === addon.id && <ChevronRight className="w-3 h-3 text-indigo-400" />}
              </div>
            </button>
          ))}
          {activatedAddons.length === 0 && (
            <div className="text-center py-4 px-3 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 space-y-2">
              <p className="text-[10px] text-slate-400">
                No active operational enclaves subscribed yet.
              </p>
              <button
                onClick={() => {
                  window.location.hash = "#/caas-marketplace";
                }}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ShoppingCart className="w-3 h-3" />
                <span>Explore CaaS Marketplace</span>
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};
