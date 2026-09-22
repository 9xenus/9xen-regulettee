import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, AlertTriangle, CheckCircle2, ChevronRight, 
  CreditCard, FileText, Scale, ShieldAlert, UploadCloud, 
  X, Gavel, Calendar, DollarSign, ExternalLink, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';

// Types mimicking the generated penalty/violation from B2G operations
type EnforcementCase = {
  id: string;
  regulatorName: string;
  lawChecked: string;
  violationDetails: string;
  penaltyType: 'API_THROTTLE' | 'LOCK_CERTIFICATE' | 'AUTO_FINE' | 'FEATURE_SUSPENSION';
  fineAmount: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'APPEAL_SUBMITTED' | 'APPEAL_REJECTED' | 'CURE_ACCEPTED';
  issuedAt: string;
  dueDate: string;
};

export const EntityEnforcementPortal: React.FC = () => {
  const { showToast } = useNotification();
  const [cases, setCases] = useState<EnforcementCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<EnforcementCase | null>(null);
  const [activeTab, setActiveTab] = useState<'dossier' | 'payment' | 'appeal' | 'cure'>('dossier');

  // Payment state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Appeal state
  const [appealReason, setAppealReason] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);

  // Cure state
  const [cureDescription, setCureDescription] = useState('');
  const [isSubmittingCure, setIsSubmittingCure] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const res = await fetch('/api/v1/enforcement/cases/ALL');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped: EnforcementCase[] = data.data.map((c: any) => ({
          id: c.id,
          regulatorName: c.regulator_id,
          lawChecked: c.regulation || 'Regulation pending',
          violationDetails: c.violation_details || 'Details pending',
          penaltyType: c.penalty_type || 'API_THROTTLE',
          fineAmount: c.fine_amount ?? 0,
          status: mapStatus(c.case_status || c.status),
          issuedAt: c.created_at || new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        }));
        setCases(mapped);
        if (mapped.length > 0) setSelectedCase(mapped[0]);
      }
    } catch {
      showToast('Could not load enforcement cases.', 'error');
    }
  };

  const mapStatus = (s: string): EnforcementCase['status'] => {
    switch ((s || '').toUpperCase()) {
      case 'OPEN': return 'PENDING_PAYMENT';
      case 'PENALTY_IMPOSED': return 'PENDING_PAYMENT';
      case 'CLOSED': return 'CURE_ACCEPTED';
      default: return 'PENDING_PAYMENT';
    }
  };

  const handlePayPenalty = async () => {
    if (!selectedCase) return;
    setIsProcessingPayment(true);
    try {
      const res = await fetch(`/api/v1/enforcement/cases/${selectedCase.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextStep: 'PAID', metadata: { officer_id: 'entity-portal', timestamp: new Date().toISOString(), action: 'PENALTY_PAID', notes: 'Penalty discharged via entity enforcement portal' } }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(true);
        const updated = cases.map(c => c.id === selectedCase.id ? { ...c, status: 'PAID' as const } : c);
        setCases(updated);
        setSelectedCase({ ...selectedCase, status: 'PAID' });
        showToast('Payment processed successfully. Penalty discharged.', 'success');
      } else {
        showToast(data.error || 'Payment failed.', 'error');
      }
    } catch {
      showToast('Could not reach enforcement ledger.', 'error');
    } finally {
      setIsProcessingPayment(false);
      setTimeout(() => setPaymentSuccess(false), 3000);
    }
  };

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReason.trim() || !selectedCase) return;
    
    setIsSubmittingAppeal(true);
    try {
      const res = await fetch(`/api/v1/enforcement/cases/${selectedCase.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextStep: 'APPEAL_SUBMITTED', metadata: { officer_id: 'entity-portal', timestamp: new Date().toISOString(), action: 'APPEAL_SUBMITTED', notes: appealReason } }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = cases.map(c => c.id === selectedCase.id ? { ...c, status: 'APPEAL_SUBMITTED' as const } : c);
        setCases(updated);
        setSelectedCase({ ...selectedCase, status: 'APPEAL_SUBMITTED' });
        showToast('Formal appeal submitted to Regulatory ALAE Engine.', 'success');
      } else {
        showToast(data.error || 'Appeal submission failed.', 'error');
      }
    } catch {
      showToast('Could not reach appeal service.', 'error');
    } finally {
      setIsSubmittingAppeal(false);
    }
    setAppealReason('');
    setActiveTab('dossier');
  };

  const handleSubmitCure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cureDescription.trim() || !selectedCase) return;

    setIsSubmittingCure(true);
    try {
      const res = await fetch(`/api/v1/enforcement/cases/${selectedCase.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextStep: 'REMEDIATION_VERIFIED', metadata: { officer_id: 'entity-portal', timestamp: new Date().toISOString(), action: 'CURE_SUBMITTED', notes: cureDescription } }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Cure evidence submitted for automated re-scan.', 'success');
      } else {
        showToast(data.error || 'Cure submission failed.', 'error');
      }
    } catch {
      showToast('Could not reach evidence vault.', 'error');
    } finally {
      setIsSubmittingCure(false);
    }
    setCureDescription('');
    setActiveTab('dossier');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold border border-rose-200">Payment Required</span>;
      case 'PAID':
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">Discharged / Paid</span>;
      case 'APPEAL_SUBMITTED':
        return <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">Appeal In Progress</span>;
      case 'CURE_ACCEPTED':
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">Cure Accepted</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 min-h-screen bg-slate-50">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Gavel className="w-8 h-8 text-rose-600" />
            Entity Enforcement & Resolution Portal
          </h1>
          <p className="text-slate-500 mt-2 max-w-3xl">
            Secure B2B gateway for responding to automated regulatory enforcement actions. View violation dossiers, pay statutory penalties, submit cure evidence, or lodge formal arbitration appeals.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
        {/* Left Sidebar: Case List */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Active Enforcement Cases</h3>
          {cases.length === 0 && (
            <div className="p-5 bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
              No enforcement cases on file for this entity. Compliance posture is current.
            </div>
          )}
          {cases.map((c) => (
            <div 
              key={c.id}
              onClick={() => { setSelectedCase(c); setActiveTab('dossier'); }}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer bg-white ${
                selectedCase?.id === c.id ? 'border-indigo-600 shadow-md' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold font-mono text-slate-500">{c.id}</span>
                {getStatusBadge(c.status)}
              </div>
              <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-tight">{c.lawChecked}</h4>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Due: {new Date(c.dueDate).toLocaleDateString()}
                </span>
                <span className="font-extrabold text-rose-600">€{c.fineAmount.toLocaleString()}</span>
              </div>
            </div>
          ))}

          <div className="mt-6 p-5 bg-slate-900 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold">Automated Enforcement</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              These penalties have been procedurally verified by sovereign AI scanning nodes and inscribed to the immutable ledger. Ignoring deadlines will trigger escalating service suspensions.
            </p>
          </div>
        </div>

        {/* Right Main Content */}
        {selectedCase ? (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Header / Tabs */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">{selectedCase.id}</h2>
                    {getStatusBadge(selectedCase.status)}
                  </div>
                  <p className="text-sm font-medium text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md inline-flex items-center gap-2">
                    <Scale className="w-4 h-4" /> Initiated by: {selectedCase.regulatorName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">Total Penalty Due</div>
                  <div className="text-3xl font-extrabold text-rose-600">€{selectedCase.fineAmount.toLocaleString()}</div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mt-8 -mb-6">
                {[
                  { id: 'dossier', label: 'Violation Dossier', icon: FileText },
                  { id: 'payment', label: 'Settle Penalty', icon: CreditCard },
                  { id: 'cure', label: 'Submit Cure Evidence', icon: UploadCloud },
                  { id: 'appeal', label: 'Lodge Appeal', icon: Gavel },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2.5 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-white text-indigo-700 border-x border-t border-slate-200 translate-y-[1px]' 
                          : 'text-slate-500 hover:text-slate-700 bg-slate-50/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-5 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                
                {/* DOSSIER TAB */}
                {activeTab === 'dossier' && (
                  <motion.div
                    key="dossier"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Statutory Standard Breached</h3>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold flex items-center gap-3">
                        <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />
                        {selectedCase.lawChecked}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Automated Discovery Details</h3>
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {`[${selectedCase.issuedAt}] SCAN_ENGINE_TRIGGER\n\nTARGET: Production Infrastructure\nFINDING: ${selectedCase.violationDetails}\n\nRISK_LEVEL: CRITICAL\nACTION_APPLIED: ${selectedCase.penaltyType}`}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Issue Date</h3>
                        <p className="text-sm font-semibold text-slate-900">{new Date(selectedCase.issuedAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Statutory Cure Deadline</h3>
                        <p className="text-sm font-semibold text-rose-600">{new Date(selectedCase.dueDate).toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PAYMENT TAB */}
                {activeTab === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  >
                    {selectedCase.status === 'PAID' ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Penalty Discharged</h3>
                        <p className="text-slate-500 mt-2">This penalty has been fully paid. Restrictions on your account have been lifted.</p>
                      </div>
                    ) : (
                      <div className="space-y-6 max-w-xl mx-auto">
                        <div className="text-center mb-8">
                          <h3 className="text-lg font-bold text-slate-900">Secure Payment Gateway</h3>
                          <p className="text-sm text-slate-500 mt-1">Funds are held in sovereign escrow until final ALAE clearance.</p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center mb-4 text-sm">
                            <span className="text-slate-600">Base Fine Amount</span>
                            <span className="font-semibold text-slate-900">€{selectedCase.fineAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center mb-4 text-sm">
                            <span className="text-slate-600">Processing Fees (0%)</span>
                            <span className="font-semibold text-slate-900">€0.00</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                            <span className="font-bold text-slate-900">Total Remittance</span>
                            <span className="text-xl font-extrabold text-rose-600">€{selectedCase.fineAmount.toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={handlePayPenalty}
                          disabled={isProcessingPayment}
                          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                          {isProcessingPayment ? (
                            <><Activity className="w-5 h-5 animate-spin" /> Processing Blockchain Escrow...</>
                          ) : (
                            <><DollarSign className="w-5 h-5" /> Authorize Immediate Transfer</>
                          )}
                        </button>
                        
                        <p className="text-xs text-center text-slate-400 mt-4">
                          By authorizing, you accept the immutable transaction terms of the Sovereign Resolution Network.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* CURE EVIDENCE TAB */}
                {activeTab === 'cure' && (
                  <motion.div
                    key="cure"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="max-w-2xl"
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Submit Remediation Evidence</h3>
                    <p className="text-sm text-slate-500 mb-6">
                      If you have corrected the underlying issue that triggered the violation, submit your technical evidence here. Our Automated AI Engine will re-scan your endpoints to verify the fix.
                    </p>

                    <form onSubmit={handleSubmitCure} className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Cure Description / Git Commit Reference</label>
                        <textarea
                          value={cureDescription}
                          onChange={(e) => setCureDescription(e.target.value)}
                          className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                          placeholder="e.g., Updated Data Retention policy to prune logs older than 30 days (Commit #ABC1234)..."
                          required
                        />
                      </div>
                      
                      <div className="border-2 border-dashed border-slate-300 p-4 sm:p-5 lg:p-6 rounded-lg text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <span className="text-sm font-medium text-slate-600 block">Drag and drop log files or screenshots</span>
                        <span className="text-xs text-slate-400">PDF, JPG, TXT up to 50MB</span>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingCure || !cureDescription.trim()}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
                      >
                        {isSubmittingCure ? 'Verifying with Scanner...' : 'Request Automated Re-Audit'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* APPEAL TAB */}
                {activeTab === 'appeal' && (
                  <motion.div
                    key="appeal"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="max-w-2xl"
                  >
                    {selectedCase.status === 'APPEAL_SUBMITTED' ? (
                       <div className="p-5 sm:p-6 lg:p-8 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                          <Gavel className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-indigo-900 mb-2">Appeal Under Review</h3>
                          <p className="text-sm text-indigo-700">
                            Your formal appeal has been lodged with the ALAE Engine. An automated arbitration process is currently evaluating your claims against the specific <strong>{selectedCase.lawChecked}</strong> clause. Expect a binding resolution within 72 hours.
                          </p>
                       </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-amber-900 text-sm">Formal Arbitration Notice</h4>
                            <p className="text-xs text-amber-700 mt-1">
                              Filing an appeal pauses penalty deadlines but incurs legal routing fees if the ALAE engine deems the appeal frivolous. Ensure your counter-claims directly address the sovereign violation logic.
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleSubmitAppeal} className="space-y-5">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Legal Justification / Defense Narrative</label>
                            <textarea
                              value={appealReason}
                              onChange={(e) => setAppealReason(e.target.value)}
                              className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                              placeholder="Detail why the scanner incorrectly flagged this architecture. Reference specific legal safe harbors or exceptions..."
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingAppeal || !appealReason.trim()}
                            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
                          >
                            {isSubmittingAppeal ? 'Transmitting to ALAE Engine...' : 'Lodge Binding Appeal'}
                          </button>
                        </form>
                      </>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <CheckCircle2 className="w-16 h-16 text-emerald-200 mb-4" />
            <p className="text-lg font-medium text-slate-500">No active enforcement cases selected.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityEnforcementPortal;
