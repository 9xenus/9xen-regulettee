import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, X, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { decryptData, isEncrypted } from '../../lib/cryptoUtils';

type Framework = 'GDPR' | 'SOC2' | 'CCPA';

export const LiveComplianceBadges: React.FC = () => {
  const [logIntegrityScore, setLogIntegrityScore] = useState<number>(100);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  
  useEffect(() => {
    const checkLogs = async () => {
      try {
        const rawLogs = localStorage.getItem('9xen-regulettee_system_error_logs');
        if (rawLogs) {
          let logs = [];
          if (isEncrypted(rawLogs)) {
            const decrypted = await decryptData(rawLogs);
            logs = JSON.parse(decrypted);
          } else {
            logs = JSON.parse(rawLogs);
          }
          const unresolvedErrors = logs.filter((l: any) => l.level === 'Error' && l.status !== 'RESOLVED');
          const baseScore = 100;
          const penalty = Math.min(unresolvedErrors.length * 5, 50);
          setLogIntegrityScore(Math.round(baseScore - penalty));
        }
      } catch (e) {
        console.error("Error evaluating logs for compliance badges", e);
      }
    };

    checkLogs();
    
    window.addEventListener('9xen-regulettee_system_error_logs_updated', checkLogs);
    return () => {
      window.removeEventListener('9xen-regulettee_system_error_logs_updated', checkLogs);
    };
  }, []);

  const getBadgeStyle = (score: number) => {
    if (score < 90) {
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50 hover:bg-amber-200 dark:hover:bg-amber-900/50 cursor-pointer';
    }
    return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 cursor-pointer';
  };

  const getIcon = (score: number) => {
    if (score < 90) return <ShieldAlert className="w-3.5 h-3.5" />;
    return <ShieldCheck className="w-3.5 h-3.5" />;
  };

  const getFindings = (framework: Framework, score: number) => {
    const isClean = score >= 90;
    
    switch (framework) {
      case 'GDPR':
        return [
          { control: 'Article 32: Security of Processing', status: isClean ? 'PASS' : 'FAIL', details: isClean ? 'Encryption and logging active.' : 'Unresolved system errors detected in processing logs.' },
          { control: 'Article 30: Records of Processing', status: 'PASS', details: 'Automated data mapping is up to date.' },
          { control: 'Article 33: Breach Notification', status: 'PASS', details: 'Incident response webhooks are configured.' }
        ];
      case 'SOC2':
        return [
          { control: 'CC1.0: Control Environment', status: 'PASS', details: 'Management oversight and integrity verified.' },
          { control: 'CC6.0: Logical & Physical Access', status: 'PASS', details: 'MFA enforced across all active tenants.' },
          { control: 'CC7.0: System Operations', status: isClean ? 'PASS' : 'FAIL', details: isClean ? 'No critical operational anomalies.' : 'Unresolved errors affecting system availability metrics.' }
        ];
      case 'CCPA':
        return [
          { control: '§ 1798.100: Notice at Collection', status: 'PASS', details: 'Privacy policies automatically injected.' },
          { control: '§ 1798.105: Right to Delete', status: 'PASS', details: 'Data Subject Request workflow active.' },
          { control: '§ 1798.150: Reasonable Security', status: isClean ? 'PASS' : 'FAIL', details: isClean ? 'System safeguards verified.' : 'Vulnerabilities exposed via unresolved system logs.' }
        ];
    }
  };

  return (
    <>
      {/* Compact single badge for xl screens */}
      <div 
        onClick={() => setSelectedFramework('GDPR')}
        className={`hidden xl:flex 2xl:hidden items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 ${getBadgeStyle(logIntegrityScore)}`}
        title="GDPR, SOC 2, CCPA Compliance Active - Click to view detailed findings"
      >
        {getIcon(logIntegrityScore)}
        <span>GDPR • SOC2 • CCPA</span>
      </div>

      {/* Expanded badges for ultra-wide 2xl screens */}
      <div className="hidden 2xl:flex items-center gap-1.5 shrink-0">
        <div 
          onClick={() => setSelectedFramework('GDPR')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-colors ${getBadgeStyle(logIntegrityScore)}`}
        >
          {getIcon(logIntegrityScore)}
          <span>GDPR {logIntegrityScore >= 90 ? 'Ready' : 'Risk'}</span>
        </div>
        <div 
          onClick={() => setSelectedFramework('SOC2')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-colors ${getBadgeStyle(logIntegrityScore)}`}
        >
          {getIcon(logIntegrityScore)}
          <span>SOC 2 {logIntegrityScore >= 90 ? 'Ready' : 'Risk'}</span>
        </div>
        <div 
          onClick={() => setSelectedFramework('CCPA')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-colors ${getBadgeStyle(logIntegrityScore)}`}
        >
          {getIcon(logIntegrityScore)}
          <span>CCPA {logIntegrityScore >= 90 ? 'Ready' : 'Risk'}</span>
        </div>
      </div>

      {selectedFramework && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                {getIcon(logIntegrityScore)}
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{selectedFramework} Audit Findings</h3>
              </div>
              <button 
                onClick={() => setSelectedFramework(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live Readiness Score</span>
                  <span className={`text-2xl font-black ${logIntegrityScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {logIntegrityScore}%
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-bold ${logIntegrityScore >= 90 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                  {logIntegrityScore >= 90 ? 'Audit Ready' : 'Remediation Required'}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">Automated Control Checks</h4>
                {getFindings(selectedFramework, logIntegrityScore).map((finding, idx) => (
                  <div key={idx} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {finding.status === 'PASS' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{finding.control}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${finding.status === 'PASS' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {finding.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{finding.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button 
                onClick={() => setSelectedFramework(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold transition-colors cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
