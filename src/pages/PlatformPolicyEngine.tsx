import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Database, 
  GitBranch, 
  Play, 
  FileCode, 
  Clock, 
  RefreshCw, 
  Search, 
  Cpu, 
  FileCheck2, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  XCircle,
  Terminal,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LegalEvolutionFeed } from '../components/LegalEvolutionFeed';
import { GlobalRemediationConfig } from '../components/GlobalRemediationConfig';
import { AiPolicyGenerator } from '../components/AiPolicyGenerator';

interface PolicyViolation {
  id: string;
  filePath: string;
  lineNumber: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  articleMapping: string;
  issue: string;
  evidence: string;
  isAutoFixable: boolean;
  fixSuggestion: string;
  verificationStatus: 'unverified' | 'passed' | 'failed';
}

interface AuditLog {
  id: string;
  scanId: string;
  action: string;
  timestamp: string;
  filePath: string;
  severity: string;
  articleMapping: string;
  patchApplied: boolean;
  verificationResult: 'PASSED' | 'FAILED' | 'PENDING';
  evidenceTrail: string;
}

const TEMPLATES = [
  {
    id: 'social-credit',
    name: 'Critical: Social Credit Scoring Rule',
    filePath: 'src/analytics/scoring.ts',
    code: `export function evaluateUserSuitability(userId: string) {
  // Analytical processing of behavioral telemetry
  const score = calculateSocialScore(userId);
  if (score < 40) {
    denyPublicBenefits(userId);
  }
}`
  },
  {
    id: 'biometric-tracking',
    name: 'Critical: Real-time Public Biometrics',
    filePath: 'src/security/surveillance.ts',
    code: `export function processCameraStream(frame: Buffer) {
  // Match stream against database records
  const matches = realtimeBiometricAuth(frame);
  if (matches.length > 0) {
    dispatchResponseTeam(matches);
  }
}`
  },
  {
    id: 'credit-scoring',
    name: 'High-Risk: Automated Credit Advisor (Unfair)',
    filePath: 'src/services/loans.ts',
    code: `export function evaluateApplication(data: any) {
  const score = creditScoringModel(data);
  return {
    score,
    eligible: score > 680
  };
}`
  },
  {
    id: 'untraceable-inference',
    name: 'High-Risk: Model Inference (No Traceability)',
    filePath: 'src/inference/router.ts',
    code: `export function processInput(payload: any) {
  // Execute high-risk decision engine
  const decision = highRiskModelInference(payload);
  return decision;
}`
  },
  {
    id: 'automated-approval',
    name: 'High-Risk: Auto Dispensation (No Human Oversight)',
    filePath: 'src/disbursement/claims.ts',
    code: `export function dispatchClaimFunds(claimId: string) {
  // Automatically execute large financial transfers
  approveDirectPayout(claimId);
}`
  },
  {
    id: 'compliant',
    name: 'Safe: Compliant Data Dispatcher',
    filePath: 'src/utils/dispatcher.ts',
    code: `export function processTelemetry(records: any[]) {
  console.log("Analyzing system metrics safely.");
  return records.map(r => ({
    id: r.id,
    processed: true,
    timestamp: new Date().toISOString()
  }));
}`
  }
];

export const PlatformPolicyEngine = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'playground' | 'ledger' | 'remediation' | 'boilerplates'>('rules');
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[2]);
  const [code, setCode] = useState(TEMPLATES[2].code);
  const [filePath, setFilePath] = useState(TEMPLATES[2].filePath);
  
  // Job settings and scanner states
  const [isAsync, setIsAsync] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [violations, setViolations] = useState<PolicyViolation[]>([]);
  const [activeLogs, setActiveLogs] = useState<AuditLog[]>([]);
  const [consoleMsgs, setConsoleMsgs] = useState<string[]>([
    'Policy Engine loaded successfully.',
    'Sovereign analytical databases attached.',
    'System ready for local rule execution.'
  ]);

  // Patching and action states
  const [patchingViolations, setPatchingViolations] = useState<Record<string, boolean>>({});
  const [activeTelemetry, setActiveTelemetry] = useState({
    throughput: 2401,
    latency: 42,
    violationsBlocked: 182
  });

  const appendConsole = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setConsoleMsgs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 20)]);
  };

  useEffect(() => {
    loadAuditLogs();
  }, [activeTab]);

  const handleTemplateChange = (templateId: string) => {
    const temp = TEMPLATES.find(t => t.id === templateId);
    if (temp) {
      setSelectedTemplate(temp);
      setCode(temp.code);
      setFilePath(temp.filePath);
      setViolations([]);
      setJobId(null);
      setJobStatus(null);
      appendConsole(`Switched to template: ${temp.name}`);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await fetchWithRetry('/api/v1/ai-act/audit-logs', {
        headers: {
          'Authorization': 'Bearer mock-jwt-token',
          'x-tenant-context': 'dev-tenant'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setActiveLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to fetch audit ledger:', e);
    }
  };

  const runScan = async () => {
    setIsScanning(true);
    setViolations([]);
    setJobId(null);
    setJobStatus('Queuing');
    appendConsole(`Initiating policy scanning on ${filePath}...`);

    try {
      const response = await fetchWithRetry('/api/v1/ai-act/scan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token',
          'x-tenant-context': 'dev-tenant'
        },
        body: JSON.stringify({
          filePath,
          codeContent: code,
          async: isAsync
        })
      });

      if (!response.ok) {
        throw new Error('Scan service returned error status.');
      }

      const data = await response.json();
      setJobId(data.jobId);

      if (isAsync) {
        // Asynchronous Job Flow polling
        setJobStatus('PENDING');
        appendConsole(`Asynchronous analysis job scheduled. JobID: ${data.jobId}`);
        
        let pollAttempts = 0;
        const interval = setInterval(async () => {
          pollAttempts++;
          try {
            const statusRes = await fetchWithRetry(`/api/v1/ai-act/jobs/${data.jobId}`, {
              headers: {
                'Authorization': 'Bearer mock-jwt-token',
                'x-tenant-context': 'dev-tenant'
              }
            });
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              setJobStatus(statusData.status);
              
              if (statusData.status === 'COMPLETED') {
                clearInterval(interval);
                setViolations(statusData.findings || []);
                setIsScanning(false);
                appendConsole(`Asynchronous analysis complete. Detected ${statusData.findings.length} system infraction(s).`);
                loadAuditLogs();
                // update telemetry
                if (statusData.findings.length > 0) {
                  setActiveTelemetry(prev => ({ ...prev, violationsBlocked: prev.violationsBlocked + statusData.findings.length }));
                }
              } else if (statusData.status === 'FAILED') {
                clearInterval(interval);
                setIsScanning(false);
                appendConsole(`System Error: Asynchronous analysis pipeline reported validation failure.`);
              }
            }
          } catch (e) {
            clearInterval(interval);
            setIsScanning(false);
            appendConsole(`System Error: Polling connection lost.`);
          }

          if (pollAttempts > 15) {
            clearInterval(interval);
            setIsScanning(false);
            setJobStatus('TIMEOUT');
            appendConsole(`Job timeout: Scanning exceeded local resource quotas.`);
          }
        }, 500);
      } else {
        // Synchronous immediate flow
        setJobStatus('COMPLETED');
        setViolations(data.findings || []);
        setIsScanning(false);
        appendConsole(`Synchronous verification complete. Detected ${data.findings.length} infractions.`);
        loadAuditLogs();
        if (data.findings.length > 0) {
          setActiveTelemetry(prev => ({ ...prev, violationsBlocked: prev.violationsBlocked + data.findings.length }));
        }
      }
    } catch (err: any) {
      setIsScanning(false);
      setJobStatus('FAILED');
      appendConsole(`Critical Scanning Infraction: ${err.message || err}`);
    }
  };

  const applyAutoFix = async (violation: PolicyViolation) => {
    setPatchingViolations(prev => ({ ...prev, [violation.id]: true }));
    appendConsole(`Triggering Patchwork AutoFix engine for ${violation.id}...`);

    try {
      const response = await fetchWithRetry('/api/v1/ai-act/fix', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token',
          'x-tenant-context': 'dev-tenant'
        },
        body: JSON.stringify({
          codeContent: code,
          violation: { ...violation, jobId: jobId || 'UI-PLAYGROUND' },
          filePath
        })
      });

      if (!response.ok) {
        throw new Error('Patching service reported execution failure.');
      }

      const data = await response.json();
      
      // Update code content with the returned patched code
      setCode(data.patchedCode);
      
      // Update the violation state to reflect passed status
      setViolations(prev => prev.map(v => {
        if (v.id === violation.id) {
          return { ...v, verificationStatus: data.isResolved ? 'passed' : 'failed' };
        }
        return v;
      }));

      appendConsole(data.verificationLog);
      appendConsole(`Audit trail generated. AuditID: ${data.auditId}`);
      loadAuditLogs();

    } catch (err: any) {
      appendConsole(`Patchwork Engine Error: ${err.message || err}`);
    } finally {
      setPatchingViolations(prev => ({ ...prev, [violation.id]: false }));
    }
  };

  const frameworks = [
    { id: 'gdpr', name: 'General Privacy Governance', active: true, rules: 142 },
    { id: 'dora', name: 'Operational Digital Resilience', active: true, rules: 89 },
    { id: 'ai_act', name: 'European AI Act Mandate', active: true, rules: 64 },
    { id: 'mica', name: 'Markets in Crypto-Assets', active: false, rules: 215 },
    { id: 'data_act', name: 'European Union Data Act', active: false, rules: 156 },
  ];

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Sovereign Policy & Law Engine
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Dynamic policy scanning, self-healing automated patch generation, and transaction traceability logs.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('playground')}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Play className="w-4 h-4" /> Policy Playground
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'rules' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Active Rulesets
        </button>
        <button 
          onClick={() => setActiveTab('playground')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'playground' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Compliance Sandbox & AutoFix
        </button>
        <button 
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'ledger' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Sovereign Audit Ledger ({activeLogs.length})
        </button>
        <button 
          onClick={() => setActiveTab('remediation')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'remediation' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Remediation & Fix Settings
        </button>
        <button 
          onClick={() => setActiveTab('boilerplates')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'boilerplates' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          AI Privacy Policy Builder
        </button>
      </div>

      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-500" />
                Active Validation Pipelines
              </h3>
              <div className="space-y-4">
                {frameworks.map(fw => (
                  <div key={fw.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${fw.active ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                        {fw.active ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Shield className="w-5 h-5 text-slate-500" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{fw.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{fw.rules} Active Validation Nodes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${fw.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {fw.active ? 'Active' : 'Inactive'}
                      </span>
                      <button 
                        onClick={() => {
                          if (fw.id === 'ai_act') {
                            setActiveTab('playground');
                          }
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold"
                      >
                        Execute Scan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Local Model Configurations */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-500" />
                Local Policy Engine Guard Configuration
              </h3>
              <p className="text-slate-500 text-xs">
                To guarantee absolute sovereign operations and tenant isolation, the AI evaluation pipeline utilizes self-hosted code evaluation frameworks running entirely local to the cluster container.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <span className="font-bold text-slate-700 block">Analysis Model</span>
                  <span className="text-slate-500 font-mono mt-1 block">Local Policy Rule-Matcher CLI (Offline)</span>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <span className="font-bold text-slate-700 block">Auto-Correction Strategy</span>
                  <span className="text-slate-500 font-mono mt-1 block">Patchwork Inline Mitigation Bundler</span>
                </div>
              </div>
            </div>

            {/* Legal Evolution Feed */}
            <LegalEvolutionFeed />
          </div>

          {/* Sidebar Telemetry & System Logs */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-xl p-4 sm:p-5 lg:p-6 text-white shadow-lg">
               <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                 <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin-slow" /> System Metrics
               </h3>
               <div className="mt-4 space-y-4">
                 <div>
                   <div className="flex justify-between text-xs text-indigo-200 mb-1">
                     <span>Validation Throughput</span>
                     <span>{activeTelemetry.throughput} req/s</span>
                   </div>
                   <div className="w-full bg-indigo-950/50 rounded-full h-1.5">
                     <div className="bg-indigo-400 h-1.5 rounded-full w-3/4"></div>
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-xs text-indigo-200 mb-1">
                     <span>Average Evaluation Latency</span>
                     <span>{activeTelemetry.latency} ms</span>
                   </div>
                   <div className="w-full bg-indigo-950/50 rounded-full h-1.5">
                     <div className="bg-emerald-400 h-1.5 rounded-full w-1/4"></div>
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-xs text-indigo-200 mb-1">
                     <span>Total Infractions Mitigated</span>
                     <span>{activeTelemetry.violationsBlocked} issues</span>
                   </div>
                   <div className="w-full bg-indigo-950/50 rounded-full h-1.5">
                     <div className="bg-amber-400 h-1.5 rounded-full w-4/5"></div>
                   </div>
                 </div>
               </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 text-slate-300 shadow-sm">
               <div className="flex justify-between items-center mb-3">
                 <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                   <Terminal className="w-4 h-4 text-emerald-400" /> Engine Diagnostics
                 </h3>
                 <span className="text-[9px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono">ONLINE</span>
               </div>
               <div className="space-y-2 font-mono text-[10px] max-h-48 overflow-y-auto leading-relaxed custom-scrollbar">
                 {consoleMsgs.map((msg, i) => (
                   <div key={i} className="text-slate-400 border-l-2 border-slate-700 pl-2">
                     {msg}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'playground' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Template selector and async toggle */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Template Case:</span>
              <select 
                value={selectedTemplate.id}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-72"
              >
                {TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 self-end md:self-auto text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                <input 
                  type="checkbox" 
                  checked={isAsync}
                  onChange={(e) => setIsAsync(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Run as Asynchronous Queue Job
              </label>

              <button 
                onClick={runScan}
                disabled={isScanning}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-colors text-xs font-bold rounded-lg shadow-sm flex items-center gap-2.5 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    Scanning ({jobStatus || 'Queued'})...
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    Verify & Analyze Code
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left side: Code content editor */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto flex flex-col h-[520px]">
              <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800/60 flex justify-between items-center">
                <span className="text-xs font-mono text-indigo-400 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  {filePath}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">TypeScript Output</span>
              </div>
              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Enter code content to analyze for regulatory compliance..."
                className="w-full flex-1 p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed outline-none border-none resize-none"
              />
              <div className="bg-slate-900/40 p-2.5 text-slate-500 text-[10px] border-t border-slate-800 flex justify-between">
                <span>Lines: {code.split('\n').length}</span>
                <span>System status: rule-listener attached</span>
              </div>
            </div>

            {/* Right side: Findings and auto-fix actions */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-[520px] overflow-hidden">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Rule-Matcher Analysis Results ({violations.length})
              </h3>

              {violations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-5 lg:p-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                  <FileCheck2 className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700 text-xs">No active violations detected</p>
                  <p className="text-slate-400 text-[11px] mt-1 max-w-xs">
                    Select a high-risk template or input custom code containing restricted actions, then execute rule verification.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {violations.map((v) => (
                    <div 
                      key={v.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        v.verificationStatus === 'passed' ? 'bg-emerald-50/50 border-emerald-200' :
                        v.verificationStatus === 'failed' ? 'bg-rose-50/50 border-rose-200' :
                        v.severity === 'CRITICAL' ? 'bg-rose-50/30 border-rose-100' : 'bg-amber-50/30 border-amber-100'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full ${
                            v.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {v.severity}
                          </span>
                          <span className="text-slate-400 text-xs font-mono ml-2">Line {v.lineNumber}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {v.verificationStatus === 'passed' && (
                            <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 bg-emerald-100/50 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mitigated
                            </span>
                          )}
                          {v.verificationStatus === 'failed' && (
                            <span className="text-rose-600 font-bold text-xs flex items-center gap-1 bg-rose-100/50 px-2 py-0.5 rounded">
                              <XCircle className="w-3.5 h-3.5" /> Failed Re-scan
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-800 text-xs mt-1.5">{v.issue}</h4>
                      <p className="text-indigo-600 font-medium text-[11px] mt-0.5 font-mono">{v.articleMapping}</p>
                      
                      <div className="bg-slate-900 text-slate-300 font-mono text-[10px] p-2 rounded mt-2 max-h-20 overflow-y-auto">
                        {v.evidence}
                      </div>

                      {v.isAutoFixable && v.verificationStatus === 'unverified' && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" /> Auto-Fix mitigation payload generated
                          </span>
                          <button 
                            onClick={() => applyAutoFix(v)}
                            disabled={patchingViolations[v.id]}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded shadow-sm flex items-center gap-1 disabled:opacity-50"
                          >
                            {patchingViolations[v.id] ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Applying...
                              </>
                            ) : (
                              'Apply Auto-Patch'
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800">Sovereign Compliance Ledger</h3>
              <p className="text-slate-400 text-xs mt-0.5">Immutable evaluation logs and resolution checkpoints stored locally.</p>
            </div>
            <button 
              onClick={loadAuditLogs}
              className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600 rounded-lg"
              title="Reload Ledger logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeLogs.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <Database className="w-12 h-12 text-slate-200 mb-2" />
              <p className="text-sm font-bold text-slate-700">Audit ledger contains 0 active transactions</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">No verification scans have been logged for this session yet. Run policy scans to populate regulatory checkpoint traces.</p>
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">ID / Date</th>
                    <th className="px-6 py-3.5">Infraction Source</th>
                    <th className="px-6 py-3.5">Action Executed</th>
                    <th className="px-6 py-3.5">Regulatory Standard</th>
                    <th className="px-6 py-3.5">Mitigation Status</th>
                    <th className="px-6 py-3.5">Audit Checkpoint ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{log.id}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500 whitespace-nowrap">
                        {log.filePath}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wide text-[9px] ${
                          log.action === 'SCAN' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {log.articleMapping || 'EU AI Act Governance Baseline'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                          log.verificationResult === 'PASSED' ? 'bg-emerald-100 text-emerald-800' :
                          log.verificationResult === 'FAILED' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {log.verificationResult === 'PASSED' ? 'MITIGATED (PASSED)' : log.verificationResult}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-400">
                        {log.scanId || 'NONE'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'remediation' && (
        <GlobalRemediationConfig />
      )}

      {activeTab === 'boilerplates' && (
        <AiPolicyGenerator />
      )}
    </div>
  );
};
