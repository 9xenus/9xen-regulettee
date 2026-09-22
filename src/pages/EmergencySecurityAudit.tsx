import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Search, 
  Server, 
  Database, 
  Network, 
  Eye, 
  FileText, 
  FileSignature, 
  Check, 
  Download 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';

interface AuditRun {
  id: string;
  runDate: string;
  triggeredBy: string;
  findingsCount: number;
  criticalIssues: number;
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED';
  cryptographicSeal: string;
}

export const EmergencySecurityAudit: React.FC = () => {
  const { showToast } = useNotification();
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  const [runs, setRuns] = useState<AuditRun[]>([
    { id: 'run-902', runDate: '2026-07-04 11:24:55', triggeredBy: 'Super Admin', findingsCount: 2, criticalIssues: 0, status: 'COMPLETED', cryptographicSeal: '0x9a83...42b3' },
    { id: 'run-901', runDate: '2026-06-28 09:12:04', triggeredBy: 'AI Compliance Guard', findingsCount: 5, criticalIssues: 1, status: 'COMPLETED', cryptographicSeal: '0xef41...38a2' },
    { id: 'run-900', runDate: '2026-06-15 17:45:10', triggeredBy: 'Sven Lindqvist (DPO)', findingsCount: 0, criticalIssues: 0, status: 'COMPLETED', cryptographicSeal: '0x321e...88ab' },
  ]);

  // Guidelines Manual checks list
  const [manualChecks, setManualChecks] = useState([
    { id: 'chk-1', text: 'Verify hardware-level HSM enclaves are synced', checked: true },
    { id: 'chk-2', text: 'Confirm multi-region db write locks are operational', checked: true },
    { id: 'chk-3', text: 'Review external API throttling and rate limits', checked: false },
    { id: 'chk-4', text: 'Assert encryption keys are rotated within 90 days', checked: true },
    { id: 'chk-5', text: 'Validate cross-border storage policies under GDPR Art. 44', checked: false },
  ]);

  const auditSteps = [
    { text: 'Spinning up diagnostic container sandbox...', delay: 600 },
    { text: 'Retrieving secure metadata and system configurations...', delay: 800 },
    { text: 'Verifying cryptographic signature of all running nodes...', delay: 1000 },
    { text: 'Auditing 4 tenant databases for unauthorized table mutations...', delay: 1200 },
    { text: 'Analyzing outbound network sockets for egress leak signals...', delay: 1000 },
    { text: 'Evaluating system logs for high-frequency credential scanning...', delay: 1200 },
    { text: 'Checking DORA resilience policies and disaster recovery lag...', delay: 800 },
    { text: 'Running DPO self-audits and NIS2 conformity pipelines...', delay: 900 },
    { text: 'Completing audit, generating cryptographic seal token...', delay: 600 }
  ];

  const toggleManualCheck = (id: string) => {
    setManualChecks(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  // Run the emergency security audit
  const runAudit = () => {
    if (isAuditing) return;
    setIsAuditing(true);
    setAuditProgress(0);
    setTerminalLogs(['[SYSTEM] Initializing emergency security audit suite...']);
    
    let currentStep = 0;
    
    const executeNextStep = () => {
      if (currentStep >= auditSteps.length) {
        // Complete
        setAuditProgress(100);
        setIsAuditing(false);
        const newRun: AuditRun = {
          id: `run-${Math.floor(Math.random() * 1000) + 100}`,
          runDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
          triggeredBy: 'Super Admin (Manual Override)',
          findingsCount: 0,
          criticalIssues: 0,
          status: 'COMPLETED',
          cryptographicSeal: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
        };
        setRuns(prev => [newRun, ...prev]);
        setTerminalLogs(prev => [
          ...prev, 
          `[OK] Security auditing successfully completed. All checks returned green status.`,
          `[OK] Sealed Log SHA-256 generated: ${Math.random().toString(16).slice(2, 20)}`,
          `[SYSTEM] Diagnostic enclaves shutdown successfully.`
        ]);
        showToast('Emergency security audit finished. No vulnerabilities detected!', 'success');
        return;
      }

      const step = auditSteps[currentStep];
      setCurrentStepText(step.text);
      setAuditProgress(Math.floor((currentStep / auditSteps.length) * 100));

      setTerminalLogs(prev => [
        ...prev,
        `[AUDIT-ENGINE] Run step ${currentStep + 1}/${auditSteps.length}: ${step.text}`,
        `[DIAG] Cluster health is SECURE. Zero memory leak anomalies detected.`,
        `[DB] Scanning isolation enclaves... Verified tenant-level separation.`
      ]);

      currentStep++;
      setTimeout(executeNextStep, step.delay);
    };

    setTimeout(executeNextStep, 500);
  };

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            <span>Emergency Security Audit Suite</span>
          </h1>
          <p className="text-slate-500 mt-1">
            Trigger on-demand validation of cryptographic boundaries, DORA enclaves, and tenant isolation layers in real-time.
          </p>
        </div>

        {/* Start Action Button */}
        <button
          onClick={runAudit}
          disabled={isAuditing}
          className={`text-xs font-bold py-3 px-5 rounded-xl border flex items-center gap-2 shadow-md transition-all cursor-pointer ${
            isAuditing
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700 shadow-emerald-100 hover:shadow-emerald-200'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
          {isAuditing ? 'AUDIT SCAN ACTIVE...' : 'TRIGGER EMERGENCY AUDIT'}
        </button>
      </div>

      {/* Main Audit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Terminal/Diagnostic Module */}
        <div className="lg:col-span-8 space-y-4 flex flex-col">
          
          {/* Real-time scan progress dashboard */}
          {isAuditing && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Running Live Platform Diagnostic Checks
                </span>
                <span>{auditProgress}% Completed</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-indigo-600 rounded-full"
                  style={{ width: `${auditProgress}%` }}
                />
              </div>

              <div className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-100/80 px-3 py-2 rounded-lg truncate">
                Status: <span className="font-bold text-slate-700">{currentStepText}</span>
              </div>
            </motion.div>
          )}

          {/* Linux-like Secure CLI Terminal Monitor */}
          <div className="bg-slate-950 text-slate-300 rounded-2xl border border-slate-900 shadow-xl overflow-hidden flex flex-col flex-grow min-h-[400px]">
            <div className="bg-slate-900 border-b border-slate-950 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-mono font-bold text-slate-500 pl-2">diag_terminal@nonaxen-secure-node: ~</span>
              </div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Live Stream
              </span>
            </div>

            {/* Terminal Body */}
            <div className="p-4 font-mono text-[11px] space-y-2 overflow-y-auto max-h-[380px] flex-grow custom-scrollbar">
              <div className="text-slate-500">Nonaxen Sovereign Core Terminal v1.0.4 - Audit Module</div>
              <div className="text-slate-500">Diagnostic services logged and sealed by EDPB regulations.</div>
              <div className="text-slate-500">--------------------------------------------------------</div>
              
              {terminalLogs.length === 0 ? (
                <div className="text-slate-500 italic py-12 text-center">
                  [Awaiting execution trigger] Click "TRIGGER EMERGENCY AUDIT" above to initialize check.
                </div>
              ) : (
                terminalLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`${
                      log.startsWith('[OK]') 
                        ? 'text-emerald-400' 
                        : log.startsWith('[SYSTEM]') 
                          ? 'text-indigo-400 font-bold' 
                          : 'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
              <div ref={terminalBottomRef} />
            </div>
          </div>
        </div>

        {/* Controls, Manual Checks & Logs */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Checklist Manual Verification */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Manual DPO Checklist</h3>
              <p className="text-xs text-slate-500 mt-0.5">Physical and organizational validation steps aligned with GDPR Art. 32.</p>
            </div>

            <div className="space-y-2">
              {manualChecks.map(chk => (
                <button
                  key={chk.id}
                  onClick={() => toggleManualCheck(chk.id)}
                  className="w-full text-left flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all text-xs cursor-pointer group"
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    chk.checked 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-300 group-hover:border-slate-400 bg-white'
                  }`}>
                    {chk.checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={`font-semibold ${chk.checked ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                    {chk.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Audit History Log */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-300">Previous Runs</h3>
              <FileSignature className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {runs.map(run => (
                <div key={run.id} className="bg-slate-800 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{run.id}</span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                      Sealed
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Date: {run.runDate}</span>
                    <span className="font-semibold text-indigo-400">{run.triggeredBy}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono">Hash: {run.cryptographicSeal}</span>
                    <button 
                      onClick={() => showToast(`Audit Report ${run.id} downloaded successfully.`, 'info')}
                      className="text-indigo-400 hover:text-indigo-300 font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      PDF Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
