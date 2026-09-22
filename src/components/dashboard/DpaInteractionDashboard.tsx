import React, { useState } from 'react';
import { 
  Shield, 
  Globe, 
  FileText, 
  AlertTriangle, 
  Scale, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  BellRing, 
  PlusCircle, 
  Send, 
  Upload, 
  FileCheck,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

interface EnforcementCase {
  id: string;
  company: string;
  leadDpa: string;
  concernedDpas: string[];
  status: 'Investigation' | 'Draft Decision' | 'Final Decision';
  violation: string;
  potentialFine: string;
  lastUpdated: string;
  documents: string[];
}

interface CooperationRequest {
  id: string;
  requestingDpa: string;
  targetDpa: string;
  type: string;
  caseRef: string;
  status: 'Pending' | 'Accepted' | 'Completed';
  dateCreated: string;
}

const initialEnforcements: EnforcementCase[] = [
  {
    id: 'ENF-2026-089',
    company: 'TechCorp International',
    leadDpa: 'CNIL (France)',
    concernedDpas: ['BfDI (Germany)', 'AEPD (Spain)'],
    status: 'Investigation',
    violation: 'GDPR Art. 28 (Processor terms)',
    potentialFine: '€2.5M - €5M',
    lastUpdated: '2 hours ago',
    documents: ['Initial Complaint.pdf']
  },
  {
    id: 'ENF-2026-102',
    company: 'GlobalRetail EU',
    leadDpa: 'DPC (Ireland)',
    concernedDpas: ['CNIL (France)', 'Garante (Italy)', 'AP (Netherlands)'],
    status: 'Draft Decision',
    violation: 'GDPR Art. 6 (Lawfulness of processing)',
    potentialFine: '€18M',
    lastUpdated: '1 day ago',
    documents: ['Article 60 Draft Decision.pdf', 'Audit_Report_v2.pdf']
  },
  {
    id: 'ENF-2026-115',
    company: 'HealthData Systems',
    leadDpa: 'BfDI (Germany)',
    concernedDpas: ['DSB (Austria)'],
    status: 'Final Decision',
    violation: 'GDPR Art. 9 (Special categories of data)',
    potentialFine: '€850K',
    lastUpdated: '3 days ago',
    documents: ['Final_Fining_Order.pdf', 'DSB_Co-signature.pdf']
  }
];

const initialCooperationRequests: CooperationRequest[] = [
  {
    id: 'REQ-2026-042',
    requestingDpa: 'CNIL (France)',
    targetDpa: 'AEPD (Spain)',
    type: 'Art. 61 Mutual Assistance',
    caseRef: 'ENF-2026-089',
    status: 'Pending',
    dateCreated: 'Today, 10:30 AM'
  },
  {
    id: 'REQ-2026-015',
    requestingDpa: 'DPC (Ireland)',
    targetDpa: 'CNIL (France)',
    type: 'Joint Operation (Art. 62)',
    caseRef: 'ENF-2026-102',
    status: 'Accepted',
    dateCreated: '3 days ago'
  }
];

export const DpaInteractionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'proceedings' | 'cooperation'>('proceedings');
  const { addRegulatoryUpdate } = useNotification();
  
  const [cases, setCases] = useState<EnforcementCase[]>(initialEnforcements);
  const [coopRequests, setCoopRequests] = useState<CooperationRequest[]>(initialCooperationRequests);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Form states for adding cooperative requests
  const [showAddCoopForm, setShowAddCoopForm] = useState(false);
  const [coopRequestingDpa, setCoopRequestingDpa] = useState('CNIL (France)');
  const [coopTargetDpa, setCoopTargetDpa] = useState('DPC (Ireland)');
  const [coopType, setCoopType] = useState('Art. 61 Mutual Assistance');
  const [coopCaseRef, setCoopCaseRef] = useState('ENF-2026-089');

  const handleSimulateUpdate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      addRegulatoryUpdate({
        title: "EDPB Binding Decision Published",
        description: "The European Data Protection Board (EDPB) has issued binding decision Art. 65(1)(a) resolving dispute on cross-border data flows.",
        category: "GDPR",
        severity: "critical",
      });
      setIsSimulating(false);
    }, 1000);
  };

  const handleTransitionStatus = (caseId: string, newStatus: 'Draft Decision' | 'Final Decision') => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updated = {
          ...c,
          status: newStatus,
          lastUpdated: 'Just now'
        };
        
        // Push real-time alert via NotificationProvider
        addRegulatoryUpdate({
          title: `OSS Proceeding Status Change: ${caseId}`,
          description: `${updated.company} case status updated to '${newStatus}' by lead authority ${updated.leadDpa}.`,
          category: 'GDPR',
          severity: newStatus === 'Final Decision' ? 'critical' : 'warning',
        });

        return updated;
      }
      return c;
    }));
  };

  const handleUploadDocument = (caseId: string) => {
    const docName = `Enforcement_Exhibit_${Math.floor(100 + Math.random() * 900)}.pdf`;
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updated = {
          ...c,
          documents: [...c.documents, docName],
          lastUpdated: 'Just now'
        };

        // Push real-time alert via NotificationProvider
        addRegulatoryUpdate({
          title: `New Document Filed: ${caseId}`,
          description: `Supervisory authorities uploaded '${docName}' for ${updated.company}.`,
          category: 'GDPR',
          severity: 'info',
        });

        return updated;
      }
      return c;
    }));
  };

  const handleCreateCoopRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: CooperationRequest = {
      id: `REQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      requestingDpa: coopRequestingDpa,
      targetDpa: coopTargetDpa,
      type: coopType,
      caseRef: coopCaseRef,
      status: 'Pending',
      dateCreated: 'Just now'
    };

    setCoopRequests(prev => [newReq, ...prev]);
    setShowAddCoopForm(false);

    // Push real-time alert via NotificationProvider
    addRegulatoryUpdate({
      title: `Mutual Cooperation Triggered: ${newReq.id}`,
      description: `${newReq.requestingDpa} has initiated a formal ${newReq.type} with ${newReq.targetDpa} for case ${newReq.caseRef}.`,
      category: 'GDPR',
      severity: 'warning',
    });
  };

  const handleAcceptCoopRequest = (reqId: string) => {
    setCoopRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        const updated = { ...r, status: 'Accepted' as const };
        
        // Push alert
        addRegulatoryUpdate({
          title: `Cooperation Accepted: ${reqId}`,
          description: `${updated.targetDpa} accepted the cooperation request from ${updated.requestingDpa}.`,
          category: 'GDPR',
          severity: 'info',
        });

        return updated;
      }
      return r;
    }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="dpa-interaction-panel">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2" id="dpa-panel-title">
            <Globe className="w-5 h-5 text-indigo-600" />
            Cross-Border DPA Interactions (One-Stop-Shop)
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Real-time interface for cross-border enforcement proceedings, mutual assistance, and joint operations under GDPR Chapter VII.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button 
            id="poll-edpb-btn"
            onClick={handleSimulateUpdate}
            disabled={isSimulating}
            className="flex items-center justify-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-bold border border-indigo-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Syncing...' : 'Poll EDPB Updates'}
          </button>
          <div className="flex bg-slate-200 p-1 rounded-lg">
            <button
              id="tab-proceedings-btn"
              onClick={() => setActiveTab('proceedings')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
                activeTab === 'proceedings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Proceedings
            </button>
            <button
              id="tab-cooperation-btn"
              onClick={() => setActiveTab('cooperation')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
                activeTab === 'cooperation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cooperation Requests ({coopRequests.length})
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        {activeTab === 'proceedings' ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                <div className="text-2xl font-bold text-indigo-700">{cases.length}</div>
                <div className="text-xs font-bold text-indigo-600 uppercase mt-1">Active OSS Cases</div>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                <div className="text-2xl font-bold text-amber-700">
                  {cases.filter(c => c.status === 'Draft Decision').length}
                </div>
                <div className="text-xs font-bold text-amber-600 uppercase mt-1">Draft Decisions Pending Review</div>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-700">€21.3M</div>
                <div className="text-xs font-bold text-emerald-600 uppercase mt-1">Fines in Decision Pipeline</div>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-500" /> Current Proceedings
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Case List */}
              <div className="lg:col-span-2 space-y-3">
                {cases.map((enf) => (
                  <div 
                    key={enf.id} 
                    onClick={() => setSelectedCaseId(selectedCaseId === enf.id ? null : enf.id)}
                    className={`flex flex-col p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedCaseId === enf.id 
                        ? 'border-indigo-500 bg-indigo-50/20 ring-1 ring-indigo-500' 
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-500">{enf.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            enf.status === 'Final Decision' ? 'bg-emerald-100 text-emerald-700' :
                            enf.status === 'Draft Decision' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {enf.status}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-base">{enf.company}</h5>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{enf.violation}</p>
                      </div>
                      
                      <div className="sm:text-right flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-1">
                        <div className="text-sm font-bold text-rose-600 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {enf.potentialFine}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          Updated {enf.lastUpdated}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2">
                      <span><span className="font-bold text-slate-500">Lead DPA:</span> {enf.leadDpa}</span>
                      <span><span className="font-bold text-slate-500">Concerned DPAs:</span> {enf.concernedDpas.join(', ')}</span>
                      <span><span className="font-bold text-slate-500">Documents:</span> {enf.documents.length}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Case Action Details Sidebar */}
              <div className="lg:col-span-1">
                {selectedCaseId ? (
                  (() => {
                    const activeCase = cases.find(c => c.id === selectedCaseId);
                    if (!activeCase) return null;
                    return (
                      <div className="border border-indigo-100 rounded-xl p-5 bg-indigo-50/10 space-y-5">
                        <div>
                          <div className="text-xs font-bold text-indigo-600 uppercase">Case Management Panel</div>
                          <h4 className="text-base font-bold text-slate-900 mt-1">{activeCase.company}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Ref: {activeCase.id}</p>
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-700 block">Workflow Transitions</span>
                          <div className="grid grid-cols-1 gap-2">
                            {activeCase.status === 'Investigation' && (
                              <button
                                onClick={() => handleTransitionStatus(activeCase.id, 'Draft Decision')}
                                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Propose Draft Decision
                              </button>
                            )}
                            {activeCase.status === 'Draft Decision' && (
                              <button
                                onClick={() => handleTransitionStatus(activeCase.id, 'Final Decision')}
                                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Issue Final Decision
                              </button>
                            )}
                            <button
                              onClick={() => handleUploadDocument(activeCase.id)}
                              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Upload Enforcement Doc
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-slate-200 pt-3">
                          <span className="text-xs font-bold text-slate-700 block mb-2">Filed Exhibits ({activeCase.documents.length})</span>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {activeCase.documents.map((doc, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2 rounded border border-slate-100">
                                <FileCheck className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="truncate flex-1">{doc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="border border-dashed border-slate-200 rounded-xl p-5 sm:p-6 lg:p-8 bg-slate-50 text-center flex flex-col items-center justify-center h-full min-h-[220px]">
                    <Shield className="w-8 h-8 text-slate-300 mb-2" />
                    <h5 className="text-sm font-bold text-slate-700">No Case Selected</h5>
                    <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                      Select an enforcement proceeding from the list to trigger workflow alerts, files, and status updates.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-500" /> Administrative Mutual Assistance (OSS)
              </h4>
              <button
                onClick={() => setShowAddCoopForm(!showAddCoopForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {showAddCoopForm ? 'Cancel Request' : 'New Assistance Request'}
              </button>
            </div>

            {/* Slide Down Form for New Request */}
            <AnimatePresence>
              {showAddCoopForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleCreateCoopRequest} className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Requesting DPA</label>
                      <select 
                        value={coopRequestingDpa}
                        onChange={(e) => setCoopRequestingDpa(e.target.value)}
                        className="w-full text-xs p-2 rounded bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option>CNIL (France)</option>
                        <option>DPC (Ireland)</option>
                        <option>BfDI (Germany)</option>
                        <option>AEPD (Spain)</option>
                        <option>Garante (Italy)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Target DPA</label>
                      <select 
                        value={coopTargetDpa}
                        onChange={(e) => setCoopTargetDpa(e.target.value)}
                        className="w-full text-xs p-2 rounded bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option>DPC (Ireland)</option>
                        <option>CNIL (France)</option>
                        <option>BfDI (Germany)</option>
                        <option>AEPD (Spain)</option>
                        <option>Garante (Italy)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Mechanism Type</label>
                      <select 
                        value={coopType}
                        onChange={(e) => setCoopType(e.target.value)}
                        className="w-full text-xs p-2 rounded bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option>Art. 61 Mutual Assistance</option>
                        <option>Joint Operation (Art. 62)</option>
                        <option>Urgency Procedure (Art. 66)</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Ref Case</label>
                        <select 
                          value={coopCaseRef}
                          onChange={(e) => setCoopCaseRef(e.target.value)}
                          className="w-full text-xs p-2 rounded bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                        >
                          {cases.map(c => (
                            <option key={c.id} value={c.id}>{c.id} ({c.company})</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs flex items-center justify-center"
                        style={{ height: '34px' }}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {coopRequests.map((req) => (
                <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:border-indigo-200 transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600">{req.id}</span>
                      <span className="text-xs text-slate-400">|</span>
                      <span className="text-xs font-semibold text-slate-500">{req.type}</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-base">
                      {req.requestingDpa} <span className="text-indigo-400">➔</span> {req.targetDpa}
                    </h5>
                    <div className="text-xs text-slate-500 mt-1">
                      Related Case: <span className="font-semibold text-slate-700">{req.caseRef}</span> • Initiated: {req.dateCreated}
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      req.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                    
                    {req.status === 'Pending' && (
                      <button
                        onClick={() => handleAcceptCoopRequest(req.id)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-xs font-bold transition-all"
                      >
                        Accept Request
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

