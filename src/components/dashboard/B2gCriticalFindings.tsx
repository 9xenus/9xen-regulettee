import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ArrowRight, 
  Gavel, 
  Scale, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  MessageSquare,
  Search,
  X,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

interface CriticalFinding {
  id: string;
  tenantName: string;
  violationType: string;
  severity: 'CRITICAL' | 'HIGH';
  article: string;
  impactScore: number;
  remediationPriority: 'IMMEDIATE' | 'URGENT';
  detectedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'SUPPRESSED';
  notes?: string;
}

export const B2gCriticalFindings: React.FC = () => {
  const { showToast } = useNotification();
  const [findings, setFindings] = useState<CriticalFinding[]>([
    {
      id: 'FIND-9921',
      tenantName: 'Global Finance Corp',
      violationType: 'Unauthorized Cross-Border AI Data Processing',
      severity: 'CRITICAL',
      article: 'EU AI Act Art. 26(b)',
      impactScore: 94,
      remediationPriority: 'IMMEDIATE',
      detectedAt: new Date().toISOString(),
      status: 'PENDING'
    },
    {
      id: 'FIND-8812',
      tenantName: 'Stark Industries GmbH',
      violationType: 'Systemic Failure in PII Anonymization',
      severity: 'HIGH',
      article: 'GDPR Art. 32',
      impactScore: 82,
      remediationPriority: 'IMMEDIATE',
      detectedAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'PENDING'
    },
    {
      id: 'FIND-7734',
      tenantName: 'Tyrell Bio-EU',
      violationType: 'Incomplete Audit Trail for High-Risk AI Model',
      severity: 'CRITICAL',
      article: 'EU AI Act Art. 12',
      impactScore: 89,
      remediationPriority: 'URGENT',
      detectedAt: new Date(Date.now() - 7200000).toISOString(),
      status: 'PENDING'
    }
  ]);

  const [selectedFindingForNotes, setSelectedFindingForNotes] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const handleUpdateStatus = (id: string, status: 'ACCEPTED' | 'SUPPRESSED') => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, status } : f));
  };

  const handleAddNote = (id: string) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, notes: noteInput } : f));
    setSelectedFindingForNotes(null);
    setNoteInput('');
  };

  const filteredFindings = findings.filter(f => f.status === 'PENDING');
  const suppressedFindings = findings.filter(f => f.status === 'SUPPRESSED' || f.status === 'ACCEPTED');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-rose-50/30">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Critical Law Violation Findings
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Identified high-severity legal breaches requiring immediate B2G intervention.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded uppercase tracking-widest animate-pulse">
            LIVE ANALYTICS
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto max-h-[500px]">
        {filteredFindings.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">All Clear</p>
              <p className="text-xs text-slate-500">No pending critical law violations detected.</p>
            </div>
          </div>
        )}

        {filteredFindings.map((finding) => (
          <motion.div 
            key={finding.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group border border-slate-150 rounded-2xl p-4 hover:border-rose-300 hover:bg-rose-50/20 transition-all relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1.5 h-full ${finding.severity === 'CRITICAL' ? 'bg-rose-600' : 'bg-orange-500'}`} />
            
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{finding.id}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                    finding.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {finding.severity} SEVERITY
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 group-hover:text-rose-700 transition-colors">{finding.violationType}</h4>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Impact Score</div>
                <div className="text-lg font-black text-rose-600 leading-none">{finding.impactScore}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Target Entity</span>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                  <Scale className="w-3.5 h-3.5 text-slate-400" />
                  {finding.tenantName}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Legal Basis</span>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                  <Gavel className="w-3.5 h-3.5 text-slate-400" />
                  {finding.article}
                </div>
              </div>
            </div>

            {finding.notes && (
              <div className="mb-4 p-2 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1 mb-1">
                  <MessageSquare className="w-3 h-3" />
                  Remediation Note
                </p>
                <p className="text-[11px] text-amber-900 leading-tight italic">"{finding.notes}"</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(finding.id, 'ACCEPTED')}
                  className="px-3 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Accept (Resolved)
                </button>
                {finding.severity === 'CRITICAL' && (
                  <button
                    onClick={() => {
                      showToast(`AI Autonomous Agent dispatched to fix ${finding.violationType}`, 'info');
                      setTimeout(() => handleUpdateStatus(finding.id, 'ACCEPTED'), 2000);
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-900/20"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Auto-Fix Critical
                  </button>
                )}
                <button
                  onClick={() => handleUpdateStatus(finding.id, 'SUPPRESSED')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Suppress
                </button>
                <button 
                  onClick={() => {
                    setSelectedFindingForNotes(finding.id);
                    setNoteInput(finding.notes || '');
                  }}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
              <button className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1 hover:text-rose-600 transition-colors">
                Escalate Notice
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}

        {suppressedFindings.length > 0 && (
          <div className="mt-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Managed Findings ({suppressedFindings.length})</h4>
            <div className="space-y-2">
              {suppressedFindings.map(f => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl opacity-60 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${f.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {f.status === 'ACCEPTED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900">{f.violationType}</p>
                      <p className="text-[9px] text-slate-500">{f.tenantName} • {f.status}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFindings(prev => prev.map(item => item.id === f.id ? { ...item, status: 'PENDING' } : item))}
                    className="text-[9px] font-black text-indigo-600 hover:underline uppercase tracking-tight"
                  >
                    Re-open
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Deep Law Engine Active</span>
        </div>
        <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
          Full Forensic Log
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Note Modal */}
      <AnimatePresence>
        {selectedFindingForNotes && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">Add Remediation Progress Note</h3>
                <button onClick={() => setSelectedFindingForNotes(null)} className="p-1 hover:bg-slate-100 rounded-full">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-[11px] text-slate-500 font-medium">Document the current remediation status or context for this violation finding.</p>
                <textarea 
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Enter remediation progress details..."
                  className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setSelectedFindingForNotes(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleAddNote(selectedFindingForNotes)}
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
