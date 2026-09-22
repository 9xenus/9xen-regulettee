import React, { useState } from 'react';
import { Shield, ShieldAlert, Bot, FileText, AlertTriangle, Activity, Lock, Database, ShieldCheck } from 'lucide-react';
import { Nis2Incident } from '../../types/nis2';
import { ReportingAgentFlow } from './ReportingAgentFlow';

// Mock data for MVP
const MOCK_INCIDENT: Nis2Incident = {
  id: 'INC-2026-08-01',
  title: 'Ransomware Attack on Sub-provider (EU Central)',
  detectedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  status: 'REPORTING',
  classification: {
    type: 'Ransomware / Supply Chain',
    isSignificant: true,
    confidenceScore: 98.5,
    reasoning: 'Ransomware indicator detected on critical payment gateway. Cross-border impact in DE and FR. Exceeds DORA/NIS2 operational disruption thresholds.',
    doraOverlap: true,
    gdprOverlap: true
  },
  riskScore: {
    likelihood: 5,
    impact: 5,
    cascadingScore: 8.5,
    overallRisk: 'CRITICAL'
  },
  reports: [
    {
      id: 'REP-1',
      type: 'EARLY_WARNING',
      status: 'PENDING_APPROVAL',
      authority: 'BaFin (DE)',
      memberState: 'DE',
      language: 'EN',
      deadlineMs: Date.now() + 3600000 * 12, // 12 hours left
      content: `TO: BaFin (Federal Financial Supervisory Authority)
SUBJECT: NIS2/DORA Early Warning Notification
REF: INC-2026-08-01

1. INCIDENT TYPE: Ransomware / Supply Chain Compromise
2. DETECTION TIME: ${new Date(Date.now() - 3600000 * 12).toISOString()}
3. SIGNIFICANT STATUS: Confirmed (High confidence: 98.5%)
4. SUSPECTED MALICIOUS: Yes
5. CROSS-BORDER IMPACT: Yes (DE, FR)

PRELIMINARY ASSESSMENT:
AI Triage Agent confirms active ransomware indicators on the core payment processing gateway provided by Third-Party Vendor X. Operations disrupted for >4 hours.

Dual-Regulation Flag: This incident is being concurrently evaluated for GDPR Article 33 data breach implications and DORA Major ICT-Related Incident reporting.

Please acknowledge receipt. Final notification to follow within 72 hours.`
    },
    {
      id: 'REP-2',
      type: 'INCIDENT_NOTIFICATION',
      status: 'DRAFTING',
      authority: 'BaFin (DE)',
      memberState: 'DE',
      language: 'EN',
      deadlineMs: Date.now() + 3600000 * 60, // 60 hours left
      content: 'AI Reporting Agent is currently compiling forensic indicators of compromise (IoCs) and root cause analysis for the 72-hour notification...'
    }
  ],
  auditLogs: [
    {
      id: 'AL-1',
      timestamp: new Date(Date.now() - 3600000 * 11).toISOString(),
      actor: 'AI_AGENT',
      agentName: 'Triage & Classification Agent',
      action: 'Classified incident as SIGNIFICANT',
      explainabilityNote: 'Matched rule: "Disruption of payment processing > 4 hours" from FINANCE sector profile.'
    }
  ]
};

export const NIS2Dashboard: React.FC = () => {
  const [activeIncident, setActiveIncident] = useState<Nis2Incident>(MOCK_INCIDENT);

  const handleApprove = (reportId: string, notes?: string) => {
    setActiveIncident(prev => ({
      ...prev,
      reports: prev.reports.map(r => 
        r.id === reportId 
          ? { ...r, status: 'SUBMITTED' } 
          : r
      ),
      auditLogs: [
        ...prev.auditLogs,
        {
          id: `AL-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'HUMAN',
          action: `Approved & Submitted ${reportId}`,
          explainabilityNote: notes || 'Approved without overrides'
        }
      ]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Monetization / Scoring Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 shadow-xl border border-indigo-800/50 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Cyber Compliance Score
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ENTERPRISE TIER
              </span>
            </h2>
            <p className="text-sm text-indigo-200 mt-1">AI-Operated NIS2 & DORA Engine • Finance Sector Profile</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-black text-emerald-400">92/100</div>
            <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider mt-1">Readiness Score</div>
          </div>
          <div className="h-10 w-px bg-indigo-800/50 hidden sm:block"></div>
          <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-900/50 cursor-pointer">
            Export Certificate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Active Incident Context */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Active Significant Incident
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Incident ID</div>
                <div className="text-sm font-mono font-bold text-slate-700">{activeIncident.id}</div>
              </div>
              
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Title</div>
                <div className="text-sm font-bold text-slate-800">{activeIncident.title}</div>
              </div>

              {activeIncident.classification && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-2">
                    <ShieldAlert className="w-4 h-4" />
                    Classification Results
                  </div>
                  <div className="space-y-1.5 text-xs text-red-900/80">
                    <p><strong>Type:</strong> {activeIncident.classification.type}</p>
                    <p><strong>AI Confidence:</strong> {activeIncident.classification.confidenceScore}%</p>
                    <p><strong>Reasoning:</strong> {activeIncident.classification.reasoning}</p>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeIncident.classification.doraOverlap && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold">DORA OVERLAP</span>
                    )}
                    {activeIncident.classification.gdprOverlap && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold">GDPR OVERLAP</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                Audit & Liability Log
              </h3>
            </div>
            <div className="p-0">
              {activeIncident.auditLogs.map(log => (
                <div key={log.id} className="p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1">
                      {log.actor === 'AI_AGENT' ? <Bot className="w-3.5 h-3.5 text-indigo-500" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                      {log.actor === 'AI_AGENT' ? log.agentName : 'Compliance Officer'}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">{log.action}</p>
                  {log.explainabilityNote && (
                    <p className="text-[10px] text-slate-500 mt-1 italic border-l-2 border-slate-200 pl-2">
                      {log.explainabilityNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Agent Pipeline & Reporting */}
        <div className="lg:col-span-2">
          <ReportingAgentFlow 
            incident={activeIncident} 
            onApprove={handleApprove} 
          />
        </div>
      </div>
    </div>
  );
};
