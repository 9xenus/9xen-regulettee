import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Layers,
  Database,
  Lock,
  Cpu,
  Globe,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Terminal,
  Server,
  FileCheck,
  Eye,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Box,
  Compass,
  Sliders
} from 'lucide-react';

interface ClientDashboardSamplePreviewProps {
  onLogin: () => void;
}

export const ClientDashboardSamplePreview: React.FC<ClientDashboardSamplePreviewProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'surveillance' | 'enclaves' | 'scanner' | 'dsar'>('overview');
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<'EU' | 'US' | 'ME' | 'AP'>('EU');
  
  // Interactive Scanner Simulation State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanLogs, setScanLogs] = useState<string[]>([
    '[INIT] Sovereign RAG Auditor engine loaded.',
    '[VERIFY] Eur-Lex Directive 2024/1689 Annex III initialized.',
    '[STATUS] 42 automated controls passing.'
  ]);
  const [vulnerabilitiesFixed, setVulnerabilitiesFixed] = useState<number>(0);

  // Region specific telemetry
  const regionData = {
    EU: {
      name: 'EU Frankfurt (Sovereign Core)',
      flag: '🇪🇺',
      frameworks: ['EU AI Act (Annex III)', 'GDPR Art 32', 'NIS2 Directive'],
      score: 98.6,
      latency: '11ms',
      activeEnclaves: 4,
      violations: 2,
      lastAudit: '4 mins ago'
    },
    US: {
      name: 'US N. Virginia (FedRAMP High)',
      flag: '🇺🇸',
      frameworks: ['CCPA / CPRA 2026', 'NIST AI RMF 1.0', 'VCDPA'],
      score: 96.4,
      latency: '18ms',
      activeEnclaves: 3,
      violations: 1,
      lastAudit: '12 mins ago'
    },
    ME: {
      name: 'ME Riyadh (In-Country Vault)',
      flag: '🇸🇦',
      frameworks: ['KSA PDPL Royal Decree M/19', 'UAE Fed Decree 45'],
      score: 99.1,
      latency: '24ms',
      activeEnclaves: 2,
      violations: 0,
      lastAudit: '1 min ago'
    },
    AP: {
      name: 'AP Singapore (ASEAN Adequacy)',
      flag: '🇸🇬',
      frameworks: ['India DPDP Act 2023', 'Singapore PDPA', 'APEC CBPR'],
      score: 97.8,
      latency: '19ms',
      activeEnclaves: 3,
      violations: 1,
      lastAudit: '8 mins ago'
    }
  };

  const currentRegion = regionData[selectedRegion];

  // Simulation handler for running live scan on the landing page
  const handleRunScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(10);
    setScanLogs(prev => ['[START] Triggered real-time cross-region policy sweep...', ...prev]);

    setTimeout(() => {
      setScanProgress(45);
      setScanLogs(prev => ['[ANALYSIS] Ingesting model weights and telemetry vectors...', ...prev]);
    }, 600);

    setTimeout(() => {
      setScanProgress(85);
      setScanLogs(prev => ['[ENFORCEMENT] Applying differential privacy & sovereign masking...', ...prev]);
    }, 1300);

    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      setScanLogs(prev => [
        '✅ [COMPLETE] All 84 statutory assertions verified clean.',
        ...prev
      ]);
    }, 2000);
  };

  const handleAutoRemediate = () => {
    setVulnerabilitiesFixed(prev => prev + 1);
    setScanLogs(prev => [
      '🛡️ [AUTO-HEAL] Cryptographic token rotation applied to Dublin egress node.',
      ...prev
    ]);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden" id="client_dashboard_sample_preview">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Interactive Live Product Tour</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Test Drive the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">Client Command Center</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Experience our sovereign CaaS dashboard live. Switch regions, trigger automated AI audits, simulate threat remediation, and toggle between standard and 3D isometric perspectives.
          </p>

          {/* 3D Perspective Toggle & View Selector */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIs3DMode(!is3DMode)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                is3DMode
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Box className="w-4 h-4 text-cyan-300" />
              <span>3D Isometric Enclave View: {is3DMode ? 'ACTIVE' : 'FLAT'}</span>
            </button>

            {/* Region Selector Pills */}
            <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 flex items-center gap-1 text-xs">
              {(['EU', 'US', 'ME', 'AP'] as const).map(reg => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer border-0 ${
                    selectedRegion === reg
                      ? 'bg-cyan-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white bg-transparent'
                  }`}
                >
                  {reg} Hub
                </button>
              ))}
            </div>

            <button
              onClick={onLogin}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-md cursor-pointer border-0"
            >
              <span>Launch Real Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            </button>
          </div>
        </div>

        {/* 3D ISOMETRIC / FLAT CASING CONTAINER */}
        <div
          className="relative max-w-6xl mx-auto transition-all duration-700 ease-out"
          style={{
            perspective: '1400px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Main Dashboard Window */}
          <div
            className={`w-full rounded-3xl border border-slate-700/70 bg-slate-900/95 shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-700 ${
              is3DMode
                ? 'shadow-indigo-500/10 transform rotate-x-6 rotate-y-[-2deg] hover:rotate-x-2 hover:rotate-y-0'
                : 'transform-none'
            }`}
            style={{
              transform: is3DMode
                ? 'rotateX(8deg) rotateY(-2deg) translateZ(10px)'
                : 'none'
            }}
          >
            {/* Top Window Bar */}
            <div className="bg-slate-950/90 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="h-4 w-px bg-slate-800 mx-1"></div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-bold text-white">9Xen Regulettee CaaS Enclave</span>
                  <span className="text-slate-500 text-[11px] hidden sm:inline">| {currentRegion.name}</span>
                </div>
              </div>

              {/* Navigation Tabs Inside Sample */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer border-0 ${
                    activeTab === 'overview'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white bg-transparent'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('surveillance')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer border-0 ${
                    activeTab === 'surveillance'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white bg-transparent'
                  }`}
                >
                  Surveillance Radar
                </button>
                <button
                  onClick={() => setActiveTab('scanner')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer border-0 ${
                    activeTab === 'scanner'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white bg-transparent'
                  }`}
                >
                  AI Auditor Scanner
                </button>
                <button
                  onClick={() => setActiveTab('enclaves')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer border-0 hidden md:inline-block ${
                    activeTab === 'enclaves'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white bg-transparent'
                  }`}
                >
                  Sovereign Enclaves
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  SECURE LIVE
                </span>
              </div>
            </div>

            {/* Dashboard Body Content */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Compliance Index</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                        {currentRegion.score}%
                      </div>
                      <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +1.8% vs last audit
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Active Enclaves</span>
                        <Server className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                        {currentRegion.activeEnclaves} Locked
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        100% In-Country Storage
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Latency Ping</span>
                        <Activity className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-cyan-300 mt-1">
                        {currentRegion.latency}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        Ultra-low sovereign link
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Flagged Risks</span>
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                        {Math.max(0, currentRegion.violations - vulnerabilitiesFixed)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        {vulnerabilitiesFixed > 0 ? `${vulnerabilitiesFixed} Remediated` : 'Auto-healing ready'}
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Active Regional Frameworks & Live Radar */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-2 p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <h3 className="text-xs font-mono font-bold uppercase text-slate-200">
                            Active Statutory Framework Enforcements ({selectedRegion})
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">Continuous RAG Sync</span>
                      </div>

                      <div className="space-y-2.5">
                        {currentRegion.frameworks.map((fw, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-900 border border-slate-800/90 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs font-mono">
                                0{idx + 1}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">{fw}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Autonomous Policy Guardrail #LEX-{100 + idx * 24}
                                </div>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-mono font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> ACTIVE
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Action Simulation Panel */}
                    <div className="p-5 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-900 border border-indigo-500/30 rounded-2xl space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                          <h3 className="text-xs font-mono font-bold uppercase text-white">
                            Autonomous Remediation
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Detected high-risk proxy egress drift. Click below to test one-click auto-healing.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1">
                        <div className="text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> High Risk Detected
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Target: Dublin Sovereign Proxy Node #9
                        </div>
                      </div>

                      <button
                        onClick={handleAutoRemediate}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer border-0 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Trigger Auto-Remediation</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: SURVEILLANCE RADAR */}
              {activeTab === 'surveillance' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-rose-400" />
                      Live Violation Surveillance Feed
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">Refreshing every 3.0s</span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    {[
                      { id: 'VIO-891', rule: 'EU AI Act Annex III - Biometric Filter Drift', node: 'Berlin Cluster Node-4', sev: 'HIGH', status: 'MITIGATED' },
                      { id: 'VIO-890', rule: 'GDPR Art 32 - Plaintext Egress Check', node: 'Paris Gateway-01', sev: 'CRITICAL', status: 'RESOLVED' },
                      { id: 'VIO-889', rule: 'KSA PDPL Royal Decree - Cross-Border Sync', node: 'Riyadh Core Vault', sev: 'MEDIUM', status: 'ACTIVE' },
                      { id: 'VIO-888', rule: 'CCPA § 1798.135 - Do Not Sell Token Handshake', node: 'Ashburn Ingest-2', sev: 'LOW', status: 'RESOLVED' }
                    ].map(item => (
                      <div key={item.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-[10px] font-bold">{item.id}</span>
                          <div>
                            <div className="font-bold text-white text-[11px]">{item.rule}</div>
                            <div className="text-[10px] text-slate-400">{item.node}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            item.sev === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            item.sev === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          }`}>
                            {item.sev}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-bold">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: SCANNER AUDITOR */}
              {activeTab === 'scanner' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-cyan-400" />
                          Interactive AI Statutory Compliance Testbed
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Run automated audit assertions against multi-region model deployment configs.
                        </p>
                      </div>
                      <button
                        onClick={handleRunScan}
                        disabled={isScanning}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-md hover:opacity-90 transition-opacity cursor-pointer border-0 disabled:opacity-50"
                      >
                        {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        <span>{isScanning ? 'Auditing Model...' : 'Run Autonomous Audit'}</span>
                      </button>
                    </div>

                    {/* Scan Progress Bar */}
                    {isScanning && (
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        ></div>
                      </div>
                    )}

                    {/* Terminal Logs Output */}
                    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80 font-mono text-[10px] space-y-1.5 max-h-36 overflow-y-auto text-slate-300">
                      {scanLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-400">&gt;</span>
                          <span className={log.includes('COMPLETE') ? 'text-emerald-400 font-bold' : log.includes('AUTO-HEAL') ? 'text-cyan-300 font-bold' : ''}>
                            {log}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: ENCLAVES */}
              {activeTab === 'enclaves' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs"
                >
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Frankfurt Sovereign Enclave-1</span>
                      <span className="text-emerald-400 font-bold text-[10px]">LOCKED</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">Hardware Root-of-Trust (TPM 2.0 / SEV-SNP)</p>
                    <div className="text-[10px] text-indigo-400">Sync: EUR-Lex Continuous RAG #92</div>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Riyadh Sovereign Enclave-2</span>
                      <span className="text-emerald-400 font-bold text-[10px]">LOCKED</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">KSA In-Country Residency Partition</p>
                    <div className="text-[10px] text-amber-400">Sync: PDPL Royal Decree M/19</div>
                  </div>
                </motion.div>
              )}

            </div>

            {/* Bottom Enclave Launch Strip */}
            <div className="bg-slate-950 px-4 sm:px-6 py-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enterprise grade zero-knowledge cryptographic enclave verification</span>
              </div>
              <button
                onClick={onLogin}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer border-0"
              >
                <span>Access Full Enterprise Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
