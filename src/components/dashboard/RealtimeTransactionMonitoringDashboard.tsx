import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  Radio,
  Play,
  Pause,
  RefreshCw,
  Zap,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Lock,
  Search,
  Filter,
  Download,
  Flame,
  Globe,
  Sliders,
  CheckCircle2,
  XCircle,
  Eye,
  SlidersHorizontal,
  Info,
  Layers,
  ArrowRight,
  Database,
  Send,
  Building,
  User,
  Coins,
  Cpu,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  mockWebSocketService,
  LiveTransaction,
  StreamMetrics,
  WebSocketStatus,
  EU_AML_INDICATORS,
  AmlIndicator
} from '../../services/mockWebSocketService';

export const RealtimeTransactionMonitoringDashboard: React.FC = () => {
  const [status, setStatus] = useState<WebSocketStatus>('DISCONNECTED');
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);
  const [metrics, setMetrics] = useState<StreamMetrics>(mockWebSocketService.getMetrics());
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Selected transaction for deep forensic modal inspection
  const [inspectTx, setInspectTx] = useState<LiveTransaction | null>(null);
  
  // SAR filing modal state
  const [sarModalTx, setSarModalTx] = useState<LiveTransaction | null>(null);
  const [sarJustification, setSarJustification] = useState<string>('');
  const [isFilingSar, setIsFilingSar] = useState<boolean>(false);
  const [sarSuccessMessage, setSarSuccessMessage] = useState<string | null>(null);

  // Time-series chart state (stores historical data points for area chart)
  const [chartData, setChartData] = useState<Array<{ time: string; volume: number; avgRisk: number; count: number }>>([]);

  // Toast / Live Alert state
  const [activeAlert, setActiveAlert] = useState<{ id: string; title: string; tx: LiveTransaction } | null>(null);

  // Active subtab in dashboard
  const [activeViewTab, setActiveViewTab] = useState<'STREAM' | 'INDICATORS_MATRIX' | 'SAR_MANAGEMENT'>('STREAM');

  // Initialize and subscribe to Mock WebSocket service
  useEffect(() => {
    mockWebSocketService.connect();

    const unsubscribe = mockWebSocketService.subscribe((event) => {
      if (event.type === 'STATUS_CHANGE') {
        setStatus(event.payload.status);
      } else if (event.type === 'HISTORY_INIT') {
        setTransactions(event.payload.transactions);
        setMetrics(event.payload.metrics);
        
        // Seed initial time-series chart points
        const initialChart = Array.from({ length: 10 }, (_, i) => {
          const d = new Date(Date.now() - (10 - i) * 15000);
          return {
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            volume: Math.floor(25000 + Math.random() * 85000),
            avgRisk: Math.floor(20 + Math.random() * 45),
            count: Math.floor(3 + Math.random() * 8)
          };
        });
        setChartData(initialChart);
      } else if (event.type === 'TRANSACTION_STREAM') {
        const { transaction, metrics: updatedMetrics } = event.payload;
        setTransactions((prev) => [transaction, ...prev.slice(0, 79)]);
        setMetrics(updatedMetrics);

        // Update real-time chart points
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        setChartData((prev) => {
          const next = [...prev];
          if (next.length > 14) next.shift();
          next.push({
            time: timeStr,
            volume: transaction.amount,
            avgRisk: transaction.riskScore,
            count: 1
          });
          return next;
        });
      } else if (event.type === 'SUSPICIOUS_ACTIVITY_ALERT') {
        setActiveAlert({
          id: event.payload.alertId,
          title: event.payload.title,
          tx: event.payload.transaction
        });

        // Auto dismiss alert toast after 6 seconds
        setTimeout(() => {
          setActiveAlert((curr) => (curr?.id === event.payload.alertId ? null : curr));
        }, 6000);
      } else if (event.type === 'TRANSACTION_UPDATED') {
        const updated = event.payload.transaction;
        setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleTogglePlayPause = () => {
    if (status === 'CONNECTED') {
      mockWebSocketService.pause();
    } else if (status === 'PAUSED') {
      mockWebSocketService.resume();
    } else {
      mockWebSocketService.connect();
    }
  };

  const handleChangeSpeed = (multiplier: number) => {
    setSpeedMultiplier(multiplier);
    mockWebSocketService.setSpeed(multiplier);
  };

  const handleTriggerScenario = (scenario: 'STRUCTURING' | 'SANCTIONS_HIT' | 'VELOCITY_LAYERING' | 'CRYPTO_TFR' | 'SHELL_SPIKE' | 'CLEAN_SEPA') => {
    const newTx = mockWebSocketService.triggerSpecificScenario(scenario);
    if (newTx.riskLevel === 'HIGH' || newTx.riskLevel === 'CRITICAL') {
      setActiveAlert({
        id: `TRIGGERED-${newTx.id}`,
        title: `Simulated Scenario: ${newTx.indicators[0]?.name || 'High Risk Event'}`,
        tx: newTx
      });
    }
  };

  const handleQuarantine = (txId: string) => {
    mockWebSocketService.updateTransactionStatus(txId, 'QUARANTINED', 'Immediate asset freeze enforced under EU AML Regulation Art. 40.');
    if (inspectTx && inspectTx.id === txId) {
      setInspectTx({ ...inspectTx, status: 'QUARANTINED' });
    }
  };

  const handleClearTransaction = (txId: string) => {
    mockWebSocketService.updateTransactionStatus(txId, 'SETTLED', 'False positive verified via Customer Due Diligence audit.');
    if (inspectTx && inspectTx.id === txId) {
      setInspectTx({ ...inspectTx, status: 'SETTLED' });
    }
  };

  const handleOpenSarModal = (tx: LiveTransaction) => {
    setSarModalTx(tx);
    const indNames = tx.indicators.map((i) => `${i.code}: ${i.name} (${i.directiveRef})`).join('\n - ');
    setSarJustification(
      `SUSPICIOUS TRANSACTION REPORT (EU AML/CFT FIU DOSSIER)\n\n` +
      `Target Transaction: ${tx.id} (Hash: ${tx.txHash})\n` +
      `Amount: €${tx.amount.toLocaleString()} ${tx.currency} via ${tx.channel}\n` +
      `Originator: ${tx.originator.name} (${tx.originator.country})\n` +
      `Beneficiary: ${tx.beneficiary.name} (${tx.beneficiary.country})\n\n` +
      `Triggered EU AML/CTF Indicators:\n - ${indNames || 'Statistical risk anomaly'}\n\n` +
      `Assessment:\n${tx.notes || 'Suspicious financial pattern detected inconsistent with normal customer behavior.'}`
    );
    setSarSuccessMessage(null);
  };

  const handleSubmitSar = () => {
    if (!sarModalTx) return;
    setIsFilingSar(true);

    setTimeout(() => {
      mockWebSocketService.updateTransactionStatus(
        sarModalTx.id,
        'SUSPENDED_SAR',
        `SAR formally filed with National Financial Intelligence Unit (FIU). Reference: FIU-EU-${Math.floor(100000 + Math.random() * 900000)}`
      );
      setIsFilingSar(false);
      setSarSuccessMessage(`SAR Dossier successfully dispatched to EU Financial Intelligence Unit (FIU) Escrow.`);
      setTimeout(() => {
        setSarModalTx(null);
      }, 1800);
    }, 1000);
  };

  const handleExportPdfReport = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text("EU AML/CTF Real-Time Transaction Monitoring Audit", 14, 20);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Directive Compliance: EU 6AMLD & EU AML Regulation 2024/1620 | WebSocket Stream: LIVE`, 14, 27);
      doc.text(`Generated: ${new Date().toUTCString()} | Escrow Node: Frankfurt Gateway v4`, 14, 33);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 38, pageWidth - 14, 38);

      const tableColumn = ["Tx ID", "Channel", "Originator", "Beneficiary", "Amount (€)", "Risk Score", "AML Status"];
      const tableRows = filteredTransactions.map((tx) => [
        tx.id,
        tx.channel,
        `${tx.originator.name} (${tx.originator.countryCode})`,
        `${tx.beneficiary.name} (${tx.beneficiary.countryCode})`,
        `€${tx.amount.toLocaleString()}`,
        `${tx.riskScore}/100 [${tx.riskLevel}]`,
        tx.status
      ]);

      autoTable(doc, {
        startY: 44,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 }
      });

      doc.save(`EU_AML_Transaction_Audit_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
    }
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        searchTerm === '' ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.originator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.originator.iban.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.beneficiary.iban.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.originator.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.beneficiary.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.indicators.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.code.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRisk = selectedRiskFilter === 'ALL' || tx.riskLevel === selectedRiskFilter;
      const matchesChannel = selectedChannelFilter === 'ALL' || tx.channel === selectedChannelFilter;

      return matchesSearch && matchesRisk && matchesChannel;
    });
  }, [transactions, searchTerm, selectedRiskFilter, selectedChannelFilter]);

  // Indicator distribution calculation
  const indicatorData = useMemo(() => {
    const counts = metrics.indicatorCounts || {};
    return Object.keys(EU_AML_INDICATORS).map((key) => {
      const ind = EU_AML_INDICATORS[key];
      return {
        code: ind.code,
        name: ind.name.length > 20 ? ind.name.substring(0, 20) + '...' : ind.name,
        fullName: ind.name,
        count: counts[ind.code] || 0,
        severity: ind.severity,
        directiveRef: ind.directiveRef
      };
    });
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* Toast Alert for Instant High-Risk Suspicious Event */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 max-w-lg bg-slate-950 border border-rose-500/50 shadow-2xl rounded-2xl p-4 text-white backdrop-blur-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl shrink-0 mt-0.5 border border-rose-500/30">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-rose-400">
                    REAL-TIME EU AML RED FLAG TRIGGERED
                  </span>
                  <button
                    onClick={() => setActiveAlert(null)}
                    className="text-slate-400 hover:text-white text-xs p-1"
                  >
                    ×
                  </button>
                </div>
                <h4 className="text-xs font-bold text-slate-100 mt-1 truncate">{activeAlert.title}</h4>
                <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-2">
                  <span className="font-mono text-indigo-300 font-bold">€{activeAlert.tx.amount.toLocaleString()}</span>
                  <span>•</span>
                  <span>{activeAlert.tx.originator.name} → {activeAlert.tx.beneficiary.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => {
                      setInspectTx(activeAlert.tx);
                      setActiveAlert(null);
                    }}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    Inspect Payload
                  </button>
                  <button
                    onClick={() => {
                      handleOpenSarModal(activeAlert.tx);
                      setActiveAlert(null);
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    File Instant SAR
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header & WebSocket Live Controller Hub */}
      <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-indigo-950/80 border border-indigo-700/80 text-indigo-400 rounded-xl shadow-inner">
                <Activity className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5">
                  Real-time Transaction Monitoring Dashboard
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold text-[10px] rounded-full uppercase tracking-wider">
                    EU 6AMLD & AMLR Compliant
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-throughput live streaming ledger with automated AML/CTF heuristic scoring, smurfing detection, and FIU case filing.
                </p>
              </div>
            </div>
          </div>

          {/* WebSocket Streaming Telemetry & Rate Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status pill */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5">
              <div className="relative flex h-3 w-3">
                {status === 'CONNECTED' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    status === 'CONNECTED' ? 'bg-emerald-500' : status === 'PAUSED' ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                ></span>
              </div>
              <div>
                <div className="text-[9px] uppercase font-mono font-bold tracking-wider text-slate-400">
                  {status === 'CONNECTED' ? 'WSS STREAM LIVE' : status === 'PAUSED' ? 'STREAM PAUSED' : 'OFFLINE'}
                </div>
                <div className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                  <span>{metrics.latencyMs}ms latency</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-indigo-400">{metrics.msgPerSec} msg/s</span>
                </div>
              </div>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={handleTogglePlayPause}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                status === 'CONNECTED'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              }`}
              title={status === 'CONNECTED' ? 'Pause Stream' : 'Resume Stream'}
            >
              {status === 'CONNECTED' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Speed Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
              {[
                { label: '0.5x', value: 0.5 },
                { label: '1x', value: 1 },
                { label: '2.5x', value: 2.5 },
                { label: '5x', value: 5 }
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleChangeSpeed(s.value)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    speedMultiplier === s.value
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Scenario Injector Dropdown Menu */}
            <div className="relative group">
              <button className="px-3.5 py-2.5 bg-slate-900 border border-slate-700 hover:border-slate-600 text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulate Scenario</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-30 hidden group-hover:block transition-all space-y-1">
                <div className="text-[10px] font-mono font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Inject Realistic Threat Scenario:
                </div>
                <button
                  onClick={() => handleTriggerScenario('STRUCTURING')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-amber-400">⚡</span>
                  <div>
                    <div className="font-bold">Smurfing & Structuring</div>
                    <div className="text-[10px] text-slate-400">€9,850 clustered sub-threshold burst</div>
                  </div>
                </button>
                <button
                  onClick={() => handleTriggerScenario('SANCTIONS_HIT')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-rose-400">🚫</span>
                  <div>
                    <div className="font-bold">EU Sanctions List Hit</div>
                    <div className="text-[10px] text-slate-400">Designated SDN Asset Freeze Trigger</div>
                  </div>
                </button>
                <button
                  onClick={() => handleTriggerScenario('VELOCITY_LAYERING')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-indigo-400">🌪️</span>
                  <div>
                    <div className="font-bold">Pass-Through Velocity</div>
                    <div className="text-[10px] text-slate-400">Rapid layering fund fragmentation</div>
                  </div>
                </button>
                <button
                  onClick={() => handleTriggerScenario('CRYPTO_TFR')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-cyan-400">🪙</span>
                  <div>
                    <div className="font-bold">Crypto Travel Rule Breach</div>
                    <div className="text-[10px] text-slate-400">Unhosted wallet {'>'} €1,000 without ID</div>
                  </div>
                </button>
                <button
                  onClick={() => handleTriggerScenario('SHELL_SPIKE')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-amber-300">🏢</span>
                  <div>
                    <div className="font-bold">Dormant Shell Entity Spike</div>
                    <div className="text-[10px] text-slate-400">Offshore sudden turnover inversion</div>
                  </div>
                </button>
                <button
                  onClick={() => handleTriggerScenario('CLEAN_SEPA')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-emerald-400">✅</span>
                  <div>
                    <div className="font-bold">Compliant SEPA Instant</div>
                    <div className="text-[10px] text-slate-400">Clean retail wire clearing</div>
                  </div>
                </button>
              </div>
            </div>

            {/* PDF Export Button */}
            <button
              onClick={handleExportPdfReport}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer border-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Dossier</span>
            </button>
          </div>
        </div>

        {/* Top Bento Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Total Monitored Ingress</span>
            <div className="text-lg font-black text-white font-mono flex items-baseline gap-1">
              €{metrics.totalMonitoredVolumeEur.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Live stream ledger active
            </div>
          </div>

          <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Stream Velocity</span>
            <div className="text-lg font-black text-white font-mono flex items-baseline gap-1">
              {metrics.totalProcessedCount} <span className="text-xs font-normal text-slate-400">txs</span>
            </div>
            <div className="text-[10px] text-indigo-400 font-mono">
              ~{(metrics.totalProcessedCount / 12).toFixed(1)} tx/min throughput
            </div>
          </div>

          <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Flagged Suspicious Ratio</span>
            <div className="text-lg font-black text-amber-400 font-mono flex items-baseline gap-1">
              {metrics.totalProcessedCount > 0 ? ((metrics.flaggedCount / metrics.totalProcessedCount) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-[10px] text-amber-300 font-medium">
              {metrics.flaggedCount} high risk indicators
            </div>
          </div>

          <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">SAR Candidates (FIU)</span>
            <div className="text-lg font-black text-rose-400 font-mono flex items-baseline gap-1">
              {metrics.sarCount} <span className="text-xs font-normal text-slate-400">cases</span>
            </div>
            <div className="text-[10px] text-rose-300 font-medium">
              Mandatory reporting active
            </div>
          </div>

          <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Quarantined Assets</span>
            <div className="text-lg font-black text-rose-400 font-mono flex items-baseline gap-1">
              €{metrics.quarantinedAmountEur.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              AMLR Art. 40 Asset Freeze
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveViewTab('STREAM')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeViewTab === 'STREAM'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          Live Ingress Stream & Anomaly Inspector
        </button>

        <button
          onClick={() => setActiveViewTab('INDICATORS_MATRIX')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeViewTab === 'INDICATORS_MATRIX'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          EU AML/CTF Indicator Matrix & Rules
        </button>

        <button
          onClick={() => setActiveViewTab('SAR_MANAGEMENT')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeViewTab === 'SAR_MANAGEMENT'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          FIU Suspicious Activity Dossiers ({transactions.filter((t) => t.fiuReportingRequired).length})
        </button>
      </div>

      {/* TAB 1: LIVE INGRESS STREAM & ANOMALY INSPECTOR */}
      {activeViewTab === 'STREAM' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Real-time Streaming Area Chart */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Real-Time Settlement Volume & Risk Score Stream
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Live 15s Aggregation Window</span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px', color: '#fff' }}
                      formatter={(val: any, name: any) => [
                        name === 'volume' ? `€${Number(val).toLocaleString()}` : `${val}/100`,
                        name === 'volume' ? 'Ingress Volume' : 'Avg Risk Score'
                      ]}
                    />
                    <Area type="monotone" dataKey="volume" stroke="#6366f1" fillOpacity={1} fill="url(#colorVolume)" strokeWidth={2} />
                    <Area type="monotone" dataKey="avgRisk" stroke="#f43f5e" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* EU Indicator Distribution Bar Chart */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    EU AML Indicator Hits
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Categorical Frequency</span>
              </div>

              <div className="h-56 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={indicatorData} layout="vertical" margin={{ top: 0, right: 20, left: 35, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis dataKey="code" type="category" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px', color: '#fff' }}
                      formatter={(val: any, _name: any, item: any) => [`${val} detected incidents`, item?.payload?.fullName || 'Indicator']}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {indicatorData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.severity === 'CRITICAL' ? '#f43f5e' : entry.severity === 'HIGH' ? '#f59e0b' : '#6366f1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Filtering & Live Stream Feed List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Tx ID, name, IBAN, country, indicator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedRiskFilter}
                  onChange={(e) => setSelectedRiskFilter(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Risk Severities</option>
                  <option value="CRITICAL">🔴 Critical (Score 85-100)</option>
                  <option value="HIGH">🟠 High Risk (Score 65-84)</option>
                  <option value="MEDIUM">🟡 Medium Risk (Score 35-64)</option>
                  <option value="LOW">🟢 Compliant Low (Score 0-34)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedChannelFilter}
                  onChange={(e) => setSelectedChannelFilter(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Settlement Channels</option>
                  <option value="SEPA_INSTANT">SEPA Instant Transfer</option>
                  <option value="TARGET2">TARGET2 Wholesale RTGS</option>
                  <option value="SWIFT_MX">SWIFT-MX ISO20022</option>
                  <option value="CRYPTO_VASP">Crypto VASP / TFR</option>
                </select>
              </div>
            </div>

            {/* Live Streaming List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[580px] overflow-y-auto">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const isCritical = tx.riskLevel === 'CRITICAL';
                  const isHigh = tx.riskLevel === 'HIGH';

                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                        isCritical
                          ? 'bg-rose-50/20 dark:bg-rose-950/10 border-l-4 border-l-rose-500'
                          : isHigh
                          ? 'bg-amber-50/20 dark:bg-amber-950/10 border-l-4 border-l-amber-500'
                          : ''
                      }`}
                    >
                      {/* Left: Metadata & Risk Meter */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Risk score gauge badge */}
                        <div
                          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-bold shrink-0 border shadow-xs ${
                            isCritical
                              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                              : isHigh
                              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          <span className="text-xs leading-none">{tx.riskScore}</span>
                          <span className="text-[8px] uppercase tracking-tighter opacity-80 mt-0.5">{tx.riskLevel}</span>
                        </div>

                        {/* Middle transaction narrative */}
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{tx.id}</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                              {tx.channel}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>

                            {tx.status === 'QUARANTINED' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                🛑 ASSET FROZEN (AMLR 40)
                              </span>
                            )}
                            {tx.status === 'SUSPENDED_SAR' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                🚨 FIU SAR FILED
                              </span>
                            )}
                          </div>

                          {/* Originator -> Beneficiary flow */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                              {tx.originator.name}
                              <span className="text-[10px] px-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-slate-500">
                                {tx.originator.countryCode}
                              </span>
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                              {tx.beneficiary.name}
                              <span className="text-[10px] px-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-slate-500">
                                {tx.beneficiary.countryCode}
                              </span>
                            </span>
                          </div>

                          {/* Triggered AML Indicators chips */}
                          {tx.indicators.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {tx.indicators.map((ind) => (
                                <span
                                  key={ind.code}
                                  className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 rounded text-[9px] font-semibold flex items-center gap-1"
                                  title={`${ind.directiveRef}: ${ind.description}`}
                                >
                                  <ShieldAlert className="w-2.5 h-2.5" />
                                  {ind.code}: {ind.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {tx.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-0.5 line-clamp-1">
                              {tx.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Amount & Actions */}
                      <div className="flex items-center justify-between lg:justify-end gap-4 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="text-right">
                          <div className="text-sm font-black font-mono text-slate-900 dark:text-slate-100">
                            €{tx.amount.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">{tx.currency}</span>
                          </div>
                          <div className="text-[9px] font-mono text-slate-400">
                            {tx.immudbTxId}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setInspectTx(tx)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                            title="Inspect Forensic Payload"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {tx.status !== 'QUARANTINED' && (
                            <button
                              onClick={() => handleQuarantine(tx.id)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="Freeze settlement under AMLR 40"
                            >
                              <Lock className="w-3 h-3" />
                              Freeze
                            </button>
                          )}

                          {tx.status !== 'SUSPENDED_SAR' && (
                            <button
                              onClick={() => handleOpenSarModal(tx)}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <ShieldAlert className="w-3 h-3" />
                              SAR
                            </button>
                          )}

                          {tx.status !== 'SETTLED' && (
                            <button
                              onClick={() => handleClearTransaction(tx.id)}
                              className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors cursor-pointer"
                              title="Clear / False Positive"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-16 text-center text-slate-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">No transactions match current filters</div>
                  <div className="text-[11px] mt-1">Adjust search parameters or speed up simulation stream.</div>
                </div>
              )}
            </div>

            {/* Bottom Stream Status Info */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                Buffered Ingress Memory: {filteredTransactions.length} records in active rolling window
              </span>
              <span className="text-slate-400 font-mono">
                Decentralized Stream: ws://stream.regulettee.eu/aml-v4 [SHA-256 Chained]
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EU AML/CTF INDICATOR MATRIX & REGULATORY RULES */}
      {activeViewTab === 'INDICATORS_MATRIX' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                EU Regulatory Indicators & Mandatory Threshold Rules
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Active automated detection rules enforced according to EU 6AMLD (Directive 2018/1673) and EU Anti-Money Laundering Regulation (AMLR 2024/1620).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(EU_AML_INDICATORS).map((key) => {
                const ind = EU_AML_INDICATORS[key];
                return (
                  <div
                    key={ind.code}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold rounded">
                        {ind.code}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          ind.severity === 'CRITICAL'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {ind.severity} Risk
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{ind.name}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{ind.description}</p>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-400">{ind.directiveRef}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">Weight: +{ind.weight} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FIU SUSPICIOUS ACTIVITY DOSSIERS */}
      {activeViewTab === 'SAR_MANAGEMENT' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  National FIU Escrow & SAR Repository
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Suspicious Activity Reports (SAR) and Suspicious Transaction Reports (STR) compiled for statutory dispatch to EU Financial Intelligence Units.
                </p>
              </div>

              <button
                onClick={handleExportPdfReport}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export FIU Batch
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {transactions
                .filter((t) => t.fiuReportingRequired)
                .map((tx) => (
                  <div key={tx.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{tx.id}</span>
                        <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded text-[9px] font-bold">
                          RISK SCORE: {tx.riskScore}/100
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ImmuDB TX: {tx.immudbTxId}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        <strong>{tx.originator.name}</strong> ({tx.originator.country}) → <strong>{tx.beneficiary.name}</strong> ({tx.beneficiary.country}) • Amount: <strong>€{tx.amount.toLocaleString()}</strong>
                      </div>

                      <div className="text-[11px] text-slate-500 italic">
                        {tx.notes}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenSarModal(tx)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        View Dossier
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Forensic Transaction Inspector */}
      {inspectTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Forensic Transaction Dossier — {inspectTx.id}
                </h3>
              </div>
              <button onClick={() => setInspectTx(null)} className="text-slate-400 hover:text-slate-600 p-1 text-lg">
                ×
              </button>
            </div>

            {/* Cryptographic hash & verification info */}
            <div className="bg-slate-950 text-slate-300 p-3.5 rounded-xl text-[10px] font-mono space-y-1.5">
              <div>Tx Hash: {inspectTx.txHash}</div>
              <div>ImmuDB Verifiable Ref: {inspectTx.immudbTxId}</div>
              <div>Timestamp: {inspectTx.timestamp}</div>
            </div>

            {/* Entity comparison grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3" /> Originator
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{inspectTx.originator.name}</div>
                <div className="text-[10px] font-mono text-slate-500">{inspectTx.originator.iban}</div>
                <div className="text-[10px] text-slate-500">Country: {inspectTx.originator.country} ({inspectTx.originator.countryCode})</div>
                <div className="text-[10px] text-slate-500">PEP Exposure: {inspectTx.originator.isPep ? '⚠️ YES' : 'None'}</div>
                <div className="text-[10px] text-slate-500">Sanctioned: {inspectTx.originator.isSanctioned ? '🚨 YES' : 'No'}</div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Building className="w-3 h-3" /> Beneficiary
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{inspectTx.beneficiary.name}</div>
                <div className="text-[10px] font-mono text-slate-500">{inspectTx.beneficiary.iban}</div>
                <div className="text-[10px] text-slate-500">Country: {inspectTx.beneficiary.country} ({inspectTx.beneficiary.countryCode})</div>
                <div className="text-[10px] text-slate-500">PEP Exposure: {inspectTx.beneficiary.isPep ? '⚠️ YES' : 'None'}</div>
                <div className="text-[10px] text-slate-500">Sanctioned: {inspectTx.beneficiary.isSanctioned ? '🚨 YES' : 'No'}</div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Settlement Value</span>
                <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  €{inspectTx.amount.toLocaleString()} {inspectTx.currency}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Assessed Threat Level</span>
                <div className="text-xl font-black text-rose-500 font-mono">
                  {inspectTx.riskScore}/100 [{inspectTx.riskLevel}]
                </div>
              </div>
            </div>

            {/* Triggered indicators */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Triggered Compliance Indicators
              </h4>
              {inspectTx.indicators.length > 0 ? (
                <div className="space-y-1.5">
                  {inspectTx.indicators.map((ind) => (
                    <div key={ind.code} className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs">
                      <div className="font-bold text-rose-700 dark:text-rose-300">{ind.code}: {ind.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{ind.description}</div>
                      <div className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 mt-1 font-semibold">{ind.directiveRef}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium">
                  ✓ Standard compliant payment. No AML/CTF red flags detected.
                </div>
              )}
            </div>

            {/* Modal action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setInspectTx(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              {inspectTx.status !== 'QUARANTINED' && (
                <button
                  onClick={() => handleQuarantine(inspectTx.id)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Freeze Settlement (AMLR 40)
                </button>
              )}
              <button
                onClick={() => {
                  handleOpenSarModal(inspectTx);
                  setInspectTx(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                File FIU SAR
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: SAR Filing Modal */}
      {sarModalTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  File Statutory SAR to National FIU
                </h3>
              </div>
              <button onClick={() => setSarModalTx(null)} className="text-slate-400 hover:text-slate-600 p-1 text-lg">
                ×
              </button>
            </div>

            {sarSuccessMessage ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> SAR Dossier Dispatched
                </div>
                <div>{sarSuccessMessage}</div>
              </div>
            ) : (
              <>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  You are preparing an official <strong>Suspicious Activity Report (SAR)</strong> for submission under <strong>EU 6AMLD Article 18</strong>. This report will be cryptographically hashed and signed to the national escrow.
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                    Regulatory Narrative & Legal Justification
                  </label>
                  <textarea
                    value={sarJustification}
                    onChange={(e) => setSarJustification(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSarModalTx(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitSar}
                    disabled={isFilingSar}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isFilingSar ? 'Dispatching to FIU...' : 'Sign & Submit SAR to FIU'}</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RealtimeTransactionMonitoringDashboard;
