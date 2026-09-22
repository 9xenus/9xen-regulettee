import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle, 
  Clock, FileText, Gavel, Ban, ShieldCheck, History,
  Loader2, RefreshCw, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EnforcementStep, EnforcementCase } from '../../types/compliance';

interface EnforcementActionCenterProps {
  regulatorId: number;
}

const STEPS = [
  { id: EnforcementStep.SCANNED, label: 'Step 1: Scan & Inspection', icon: ShieldAlert, color: 'text-slate-500', bg: 'bg-slate-50' },
  { id: EnforcementStep.VIOLATION_DETECTED, label: 'Step 2: Evidence Dossier', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: EnforcementStep.NOTICE_ISSUED, label: 'Step 3: Statutory Notice', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: EnforcementStep.UNDER_APPEAL, label: 'Step 4: Appeal Review', icon: RefreshCw, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: EnforcementStep.PENALTY_DEMANDED, label: 'Step 5: Payment Demand', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: EnforcementStep.SOFT_ENFORCEMENT, label: 'Step 6: Soft Enforcement', icon: Ban, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: EnforcementStep.HARD_ENFORCEMENT, label: 'Step 7: Hard Enforcement', icon: Gavel, color: 'text-red-600', bg: 'bg-red-50' },
  { id: EnforcementStep.RESOLVED, label: 'Step 8: Final Resolution', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' }
];

export const EnforcementActionCenter: React.FC<EnforcementActionCenterProps> = ({ regulatorId }) => {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/enforcement/cases/${regulatorId}`);
      const data = await res.json();
      if (data.success) {
        setCases(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [regulatorId]);

  const handleTransition = async (caseId: string, nextStep: EnforcementStep) => {
    setIsTransitioning(true);
    try {
      const res = await fetch(`/api/v1/enforcement/cases/${caseId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nextStep,
          metadata: {
            officer_id: 'OFFICER_ADMIN_01',
            timestamp: new Date().toISOString(),
            action: `Approved transition to ${nextStep}`,
            notes: 'Sovereign enforcement directive authorized.'
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchCases();
        if (selectedCase?.id === caseId) {
          const updatedCase = { ...selectedCase, status: nextStep };
          setSelectedCase(updatedCase);
        }
      }
    } catch (err) {
      console.error('Transition failed:', err);
    } finally {
      setIsTransitioning(false);
    }
  };

  const fetchAuditTrail = async (caseId: string) => {
    try {
      const res = await fetch(`/api/v1/enforcement/cases/${caseId}/audit-trail`);
      const data = await res.json();
      if (data.success) {
        setAuditTrail(data.data);
        setShowHistory(true);
      }
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
    }
  };

  const getNextStep = (currentStep: EnforcementStep): EnforcementStep | null => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex !== -1 && currentIndex < STEPS.length - 1) {
      return STEPS[currentIndex + 1].id as EnforcementStep;
    }
    return null;
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            Sovereign Enforcement Action Center
          </h2>
          <p className="text-sm text-slate-500">Managing the 8-step regulatory recovery pipeline with immutable audit proofs.</p>
        </div>
        <button 
          onClick={fetchCases}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Case List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Active Incidents</div>
          {isLoading ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
            </div>
          ) : cases.length === 0 ? (
            <div className="p-5 sm:p-6 lg:p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
              No active enforcement cases found.
            </div>
          ) : (
            cases.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`w-full p-4 border rounded-2xl text-left transition-all ${
                  selectedCase?.id === c.id 
                    ? 'border-indigo-500 bg-indigo-50/30 ring-4 ring-indigo-500/5' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{c.id.substring(0, 12)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${
                    c.status === EnforcementStep.RESOLVED ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <div className="font-black text-slate-900 truncate">{c.entity_name}</div>
                <div className="text-[10px] text-slate-500 font-medium">{c.sector}</div>
              </button>
            ))
          )}
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedCase ? (
              <motion.div
                key={selectedCase.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden h-full flex flex-col"
              >
                <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{selectedCase.entity_name}</h3>
                      <p className="text-xs text-slate-500 font-medium">Sovereign Case Management Protocol v2.1</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => fetchAuditTrail(selectedCase.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border-0 transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    Audit Trail
                  </button>
                </div>

                <div className="p-4 sm:p-5 lg:p-6 flex-1 space-y-5 sm:space-y-8">
                  {/* Progress Visualization */}
                  <div className="relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2" />
                    <div className="relative flex justify-between">
                      {STEPS.map((step, idx) => {
                        const isCurrent = selectedCase.status === step.id;
                        const isPast = STEPS.findIndex(s => s.id === selectedCase.status) > idx;
                        const Icon = step.icon;
                        
                        return (
                          <div key={step.id} className="relative z-10 flex flex-col items-center group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCurrent ? 'bg-white border-indigo-500 ring-4 ring-indigo-500/10' :
                              isPast ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'
                            }`}>
                              {isPast ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Icon className={`w-4 h-4 ${isCurrent ? 'text-indigo-600' : 'text-slate-300'}`} />}
                            </div>
                            <div className="absolute top-10 whitespace-nowrap text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                              Step {idx + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step Action Section */}
                  <div className="pt-12">
                    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${STEPS.find(s => s.id === selectedCase.status)?.bg || 'bg-slate-100'}`}>
                          {React.createElement(STEPS.find(s => s.id === selectedCase.status)?.icon || Info, {
                            className: `w-6 h-6 ${STEPS.find(s => s.id === selectedCase.status)?.color || 'text-slate-600'}`
                          })}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">Current Phase: {STEPS.find(s => s.id === selectedCase.status)?.label}</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {selectedCase.status === EnforcementStep.SCANNED && 'AI Scanning nodes have detected potential non-compliance patterns. Evidence dossier generation required.'}
                            {selectedCase.status === EnforcementStep.VIOLATION_DETECTED && 'Legal violation dossier finalized. Ready to issue official statutory notice to the entity.'}
                            {selectedCase.status === EnforcementStep.NOTICE_ISSUED && 'Awaiting 30-day statutory grace period or formal appeal submission from the enterprise.'}
                            {selectedCase.status === EnforcementStep.UNDER_APPEAL && 'Enterprise has lodged a formal appeal. Legal team review and decision pending.'}
                            {selectedCase.status === EnforcementStep.PENALTY_DEMANDED && 'Final payment demand issued. Awaiting treasury settlement or enforcement escalation.'}
                            {selectedCase.status === EnforcementStep.SOFT_ENFORCEMENT && 'Administrative restrictions active. Government API access and registry flags deployed.'}
                            {selectedCase.status === EnforcementStep.HARD_ENFORCEMENT && 'Hard measures active. DNS sinkholing and cross-border asset freeze requests initiated.'}
                            {selectedCase.status === EnforcementStep.RESOLVED && 'Case successfully resolved. Remediation verified and financial obligations fulfilled.'}
                          </p>
                        </div>
                      </div>

                      {getNextStep(selectedCase.status) && (
                        <div className="flex items-center justify-end pt-2">
                          <button
                            disabled={isTransitioning}
                            onClick={() => handleTransition(selectedCase.id, getNextStep(selectedCase.status)!)}
                            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-900/10 transition-all border-0 cursor-pointer disabled:opacity-50"
                          >
                            {isTransitioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                            Transition to {STEPS.find(s => s.id === getNextStep(selectedCase.status))?.label.split(': ')[1]}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2 text-slate-400 font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    IMMUTABLE AUDIT LOG ACTIVE
                  </div>
                  <div className="text-slate-400 font-mono">
                    Ledger ID: {selectedCase.id.split('_')[1]}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl h-full flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">Select a case from the list to view its enforcement status and take action.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <History className="w-6 h-6 text-indigo-600" />
                  Immutable Audit Trail
                </h3>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer">
                  <ShieldCheck className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-5 lg:p-6 overflow-y-auto space-y-4 sm:space-y-6">
                {auditTrail.map((log, idx) => (
                  <div key={log.id} className="relative pl-8 pb-6 last:pb-0">
                    {idx !== auditTrail.length - 1 && (
                      <div className="absolute top-2 left-3 w-0.5 h-full bg-slate-100" />
                    )}
                    <div className="absolute top-1 left-1.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-500 bg-white" />
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{log.step}</span>
                        <span className="text-[9px] font-mono text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="text-[10px] font-mono text-slate-500 break-all leading-relaxed">
                          Hash: {log.payload_hash}
                        </div>
                        <div className="mt-2 text-[10px] text-slate-400 font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          VERIFIED BY IMMUDB LEDGER (TX: {log.immudb_tx_id})
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400">CRYPTOGRAPHIC SIGNATURE VERIFIED</div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="px-6 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl border-0 cursor-pointer"
                >
                  Close Audit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
