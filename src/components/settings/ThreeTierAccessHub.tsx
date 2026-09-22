import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Building2, 
  Scale, 
  FileSearch, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Download, 
  Eye, 
  EyeOff, 
  FileText, 
  DollarSign, 
  GitBranch, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search, 
  Sliders, 
  ExternalLink,
  History,
  CheckSquare,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNotification } from '../../context/NotificationContext';
import { EngagementScopeManager } from './EngagementScopeManager';

export const ThreeTierAccessHub: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTier, setActiveTier] = useState<'client' | 'regulator' | 'lawyer'>('client');

  // Third-Party Access Manager State (Client View)
  const [externalAccounts, setExternalAccounts] = useState([
    { id: 'ext-1', name: 'FCA Supervisory Team (UK)', type: 'Regulator', scope: 'UK Subsidiary - AML & GDPR', expires: '2026-09-15T23:59:59Z', status: 'Active', aiAssist: true },
    { id: 'ext-2', name: 'Baker McKenzie Data Privacy Practice', type: 'Consultant', scope: 'EU DPA Remediation Matter #402', expires: '2026-08-30T17:00:00Z', status: 'Active', billingRate: '$450/hr' },
    { id: 'ext-3', name: 'Deloitte Risk & Compliance Audit', type: 'Auditor', scope: 'SOC2 Type II - Global Snapshot', expires: '2026-08-25T12:00:00Z', status: 'Time-Boxed', aiAssist: false }
  ]);

  // Regulator Specific State
  const [evidenceQueue, setEvidenceQueue] = useState([
    { id: 'ev-101', title: 'Data Encryption Key Rotation Logs (Q2)', requestedBy: 'FCA UK', status: 'Pending Client Upload', dueDate: '2026-08-25' },
    { id: 'ev-102', title: 'Cross-Border Transfer Impact Assessment (TIA)', requestedBy: 'FCA UK', status: 'Under Review', dueDate: '2026-08-28' }
  ]);
  const [findingsLog, setFindingsLog] = useState([
    { id: 'find-901', control: 'GDPR-Art-32', finding: 'Encryption key rotation interval exceeds 90 days in London cluster.', aiAssisted: true, status: 'Response Required' }
  ]);
  const [isSnapshotMode, setIsSnapshotMode] = useState(false);
  const [showAiAssist, setShowAiAssist] = useState(true);

  // Lawyer Specific State
  const [draftPolicies, setDraftPolicies] = useState([
    { id: 'pol-501', title: 'AI Act High-Risk Model Governance Addendum v2.1', matterId: 'MATTER-EU-AI-88', status: 'Pending Client Approval', hoursLogged: 14.5 }
  ]);
  const [isDraftMode, setIsDraftMode] = useState(true);
  const [noteVisibility, setNoteVisibility] = useState<'internal' | 'client'>('client');

  const handleRevoke = (id: string) => {
    setExternalAccounts(externalAccounts.filter(acc => acc.id !== id));
    showToast('External access revoked instantly. Platform tokens invalidated.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-indigo-500/30 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-400/30">
                Shared Platform Configuration Layer
              </span>
              <span className="text-xs text-indigo-200 font-mono">v4.2-enterprise</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Three-Tier Account Architecture</h2>
            <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Unified control center connecting Regulators, External Legal Counsel, and Core Tenants into a single verifiable compliance ecosystem.
            </p>
          </div>

          {/* Tier Switcher */}
          <div className="flex p-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTier('client')}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                activeTier === 'client' ? "bg-white text-slate-900 shadow-md" : "text-indigo-200 hover:text-white"
              )}
            >
              <Building2 className="w-4 h-4" />
              <span>Client Tenant</span>
            </button>
            <button
              onClick={() => setActiveTier('regulator')}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                activeTier === 'regulator' ? "bg-white text-slate-900 shadow-md" : "text-indigo-200 hover:text-white"
              )}
            >
              <FileSearch className="w-4 h-4" />
              <span>Regulator / Auditor</span>
            </button>
            <button
              onClick={() => setActiveTier('lawyer')}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                activeTier === 'lawyer' ? "bg-white text-slate-900 shadow-md" : "text-indigo-200 hover:text-white"
              )}
            >
              <Scale className="w-4 h-4" />
              <span>Lawyer / Consultant</span>
            </button>
          </div>
        </div>
      </div>

      {/* TIER 1: CLIENT ACCOUNT & THIRD-PARTY ACCESS CONTROL CENTER */}
      {activeTier === 'client' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Third-Party Access Control Center</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time supervision of all external regulator, auditor, and legal consultant accounts connected to your data room.</p>
              </div>
              <button 
                onClick={() => showToast('Initiated secure credential rotation for external access nodes.', 'success')}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-xs flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Revoke All External Keys
              </button>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-3">External Entity / Partner</th>
                    <th className="px-6 py-3">Account Type</th>
                    <th className="px-6 py-3">Assigned Scope / Jurisdiction</th>
                    <th className="px-6 py-3">Time-Boxed Expiration</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Instant Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {externalAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                            acc.type === 'Regulator' ? "bg-purple-50 text-purple-600" :
                            acc.type === 'Consultant' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                            {acc.type[0]}
                          </div>
                          <div>
                            <span>{acc.name}</span>
                            {acc.billingRate && <span className="block text-[10px] text-slate-400">Rate: {acc.billingRate}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase">
                          {acc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">{acc.scope}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-amber-600 font-bold font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(acc.expires).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {acc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleRevoke(acc.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors"
                        >
                          Revoke Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Client Core Tenant Management Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm mb-2">Risk Appetite Threshold</h4>
              <p className="text-xs text-slate-500 mb-4">Platform-wide strictness governing automated remediation triggers.</p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Strict (Zero Tolerance)</span>
                  <span className="text-indigo-600 font-mono">Level 4 / 5</span>
                </div>
                <input type="range" min="1" max="5" defaultValue="4" className="w-full accent-indigo-600 cursor-pointer" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm mb-2">Approval Chain Configuration</h4>
              <p className="text-xs text-slate-500 mb-4">Define mandatory sign-off workflows for policy drafts and regulatory findings.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700">Policy Drafts</span>
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase">CCO + GC</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700">Finding Resolution</span>
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase">DPO + Auditor</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm mb-2">Master Unified Audit Trail</h4>
              <p className="text-xs text-slate-500 mb-4">Cryptographically secured log of all self, consultant, and regulator actions.</p>
              <button 
                onClick={() => showToast('Generated immutable cryptographic export of master audit trail.', 'success')}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-indigo-100"
              >
                <Download className="w-4 h-4" />
                Export Cryptographic Ledger (.sig)
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm mb-2">Notification Routing Engine</h4>
              <p className="text-xs text-slate-500 mb-4">Configure who gets paged when regulators log findings or lawyers submit drafts.</p>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  <span className="text-slate-700">PagerDuty on Regulator Findings</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  <span className="text-slate-700">Slack Alert on Lawyer Draft Submissions</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TIER 2: REGULATOR / AUDITOR ACCOUNT PORTAL */}
      {activeTier === 'regulator' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Regulator Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <FileSearch className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">FCA UK Supervisory Oversight Portal</h3>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold uppercase">Scope: UK Subsidiary Only</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Read-only oversight view with formal evidence request queue and finding logs.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Snapshot Toggle */}
              <button
                onClick={() => setIsSnapshotMode(!isSnapshotMode)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
                  isSnapshotMode ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-700 border-slate-200"
                )}
              >
                <History className="w-4 h-4" />
                {isSnapshotMode ? 'Snapshot Locked: Q2 Audit' : 'Live State View'}
              </button>

              {/* AI Visibility Toggle */}
              <button
                onClick={() => setShowAiAssist(!showAiAssist)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                {showAiAssist ? <Eye className="w-4 h-4 text-indigo-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                {showAiAssist ? 'AI-Assist Badges Visible' : 'AI-Assist Hidden'}
              </button>
            </div>
          </div>

          {/* Evidence Request Queue & Findings Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evidence Request Queue */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  Formal Evidence Request Queue
                </h4>
                <button 
                  onClick={() => showToast('New evidence request dispatched to client compliance task list.', 'success')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  + Request Evidence
                </button>
              </div>

              <div className="space-y-3">
                {evidenceQueue.map((ev) => (
                  <div key={ev.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold">{ev.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Requested by: {ev.requestedBy}</span>
                      <span className="font-mono text-rose-600 font-bold">Due: {ev.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Finding / Observation Log */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Regulator Observation Log
                </h4>
                <button 
                  onClick={() => showToast('Finding logged and auto-linked to control.', 'success')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  + Log Finding
                </button>
              </div>

              <div className="space-y-3">
                {findingsLog.map((f) => (
                  <div key={f.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-mono font-bold">{f.control}</span>
                      {showAiAssist && f.aiAssisted && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[9px] font-black uppercase tracking-wider">
                          🤖 AI Flagged Finding
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-800 font-medium">{f.finding}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-[11px]">
                      <span className="text-amber-700 font-bold">{f.status}</span>
                      <button className="text-indigo-600 font-bold hover:underline">View Client Response Workflow →</button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => showToast('Generated cryptographically signed export of audit scope evidence.', 'success')}
                className="w-full mt-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold border border-purple-100 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Immutable Scope Export (.sig)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIER 3: LAWYER / CONSULTANT ACCOUNT PORTAL */}
      {activeTier === 'lawyer' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Lawyer Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">Baker McKenzie Advisory Portal</h3>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">Matter: EU-AI-88</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Delegated remediation workspace with billing integration and draft-mode approval chains.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Note Visibility Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setNoteVisibility('client')}
                  className={cn("px-3 py-1.5 rounded-lg transition-all", noteVisibility === 'client' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
                >
                  Client-Visible Notes
                </button>
                <button
                  onClick={() => setNoteVisibility('internal')}
                  className={cn("px-3 py-1.5 rounded-lg transition-all", noteVisibility === 'internal' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
                >
                  Firm Internal Only
                </button>
              </div>
            </div>
          </div>

          {/* Draft Workspace & Billing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-blue-600" />
                  Draft Mode Workspace (Sandboxed Policy Changes)
                </h4>
                <button 
                  onClick={() => showToast('Submitted draft policy to client approval chain.', 'success')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Submit for CCO Approval
                </button>
              </div>

              <div className="space-y-3">
                {draftPolicies.map((p) => (
                  <div key={p.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{p.title}</span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Matter ID: {p.matterId}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">{p.status}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <span className="text-slate-500 font-medium">Hours Logged: <strong className="text-slate-900 font-mono">{p.hoursLogged} hrs</strong></span>
                      <button className="text-blue-600 font-bold hover:underline">Launch Redline / Version Comparison →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Billing & Time Integration
              </h4>
              <p className="text-xs text-slate-500">Hours spent inside platform modules auto-sync to practice management billing systems.</p>
              
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Active Engagement Spend</span>
                  <span className="font-bold text-emerald-800 font-mono">$6,525.00</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Conflict Check Status</span>
                  <span className="font-bold text-emerald-700">Passed (No Competitor Clashes)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => showToast('Session hours logged and synced to practice management.', 'success')}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all"
                >
                  Log Session Hours
                </button>
                <button 
                  onClick={() => showToast('Synced billing hours to firm ERP system.', 'success')}
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Engagement Scope Manager */}
          <EngagementScopeManager />
        </div>
      )}
    </div>
  );
};
