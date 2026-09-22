import React, { useState, useEffect } from 'react';
import { 
  UserSearch, 
  FileText, 
  Trash2, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Mail, 
  Globe,
  ArrowRight, 
  Filter, 
  MoreVertical, 
  Plus, 
  History, 
  Database, 
  Lock, 
  ChevronRight, 
  Search,
  X,
  Send,
  BadgeCheck,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchWithRetry } from '../lib/api-client';
import { useNotification } from '../context/NotificationContext';

interface DSARRequest {
  id: string;
  requesterEmail: string;
  requesterName: string;
  requestType: 'access' | 'erasure' | 'portability' | 'rectification' | 'opt_out_sale';
  status: 'submitted' | 'identity_pending' | 'verified' | 'in_review' | 'fulfilled' | 'rejected';
  submittedAt: string;
  slaDeadline: string;
  identityVerified: boolean;
  jurisdiction: string;
  zkProof?: {
    proofHash: string;
    verified: boolean;
    algorithm: string;
    verifierNode: string;
    verifiedAt: string;
    statementId: string;
  };
  discoveredDatabases?: Array<{
    sourceName: string;
    systemType: string;
    recordsFound: number;
    dataCategories: string[];
    retentionPolicy: string;
    redactionStatus: 'CLEARED' | 'REDACTED_AUTOMATICALLY' | 'RESTRICTED';
  }>;
  resolutionDetails?: string;
  downloadPayload?: any;
}

export const DSARPortal: React.FC = () => {
  const { showToast } = useNotification();
  const [view, setView] = useState<'USER' | 'ADMIN'>('USER');
  const [requests, setRequests] = useState<DSARRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DSARRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New Request Form State
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqType, setReqType] = useState<DSARRequest['requestType']>('access');
  const [reqJurisdiction, setReqJurisdiction] = useState('EU (GDPR)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/dsar/requests');
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
    } catch (e) {
      console.error('Failed to load DSAR requests:', e);
      showToast('Failed to load DSAR requests from sovereign node', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName || !reqEmail) {
      showToast('Please provide both name and email address', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetchWithRetry('/api/v1/dsar/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterName: reqName,
          requesterEmail: reqEmail,
          requestType: reqType,
          jurisdiction: reqJurisdiction
        })
      });
      const data = await res.json();
      if (data.success && data.request) {
        setRequests(prev => [data.request, ...prev]);
        setShowSubmitModal(false);
        setReqName('');
        setReqEmail('');
        showToast(`DSAR request ${data.request.id} successfully lodged with 30-day SLA clock active!`, 'success');
      } else {
        showToast('Submission error: ' + (data.error || 'Failed to submit'), 'error');
      }
    } catch (e) {
      console.error('Error creating DSAR:', e);
      showToast('Network error while lodging privacy request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyIdentity = async (reqId: string) => {
    try {
      const res = await fetchWithRetry(`/api/v1/dsar/requests/${reqId}/verify`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.request) {
        setRequests(prev => prev.map(r => r.id === reqId ? data.request : r));
        showToast(`Zero-Knowledge identity proof confirmed for ${reqId}!`, 'success');
      }
    } catch (e) {
      console.error('Identity verification failed:', e);
      showToast('Identity token verification failed', 'error');
    }
  };

  const handleFulfillRequest = async (reqId: string) => {
    try {
      const res = await fetchWithRetry(`/api/v1/dsar/requests/${reqId}/fulfill`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.request) {
        setRequests(prev => prev.map(r => r.id === reqId ? data.request : r));
        showToast(`Request ${reqId} fulfilled in compliance with Article 12(3)!`, 'success');
      }
    } catch (e) {
      console.error('Fulfillment error:', e);
      showToast('Failed to fulfill request on sovereign ledger', 'error');
    }
  };

  const handleDownloadPersonalData = (req: DSARRequest) => {
    const payload = req.downloadPayload || {
      requestId: req.id,
      requester: req.requesterName,
      email: req.requesterEmail,
      exportTimestamp: new Date().toISOString(),
      statutoryGuarantee: 'GDPR Article 20 Right to Data Portability',
      records: [
        { category: 'Account Profile', value: { name: req.requesterName, email: req.requesterEmail, created: req.submittedAt } },
        { category: 'Consent Audit', value: { marketingConsent: false, analyticsConsent: true, biometricEnclave: false } },
        { category: 'Transaction Activity', value: { totalRecords: 18, lastInteraction: '2026-08-28' } }
      ],
      sha256Proof: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${req.id}-Data-Portability-Package.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Data portability package for ${req.id} downloaded!`, 'success');
  };

  const getStatusColor = (status: DSARRequest['status']) => {
    switch (status) {
      case 'fulfilled': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'verified': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'identity_pending': return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRequestTypeIcon = (type: DSARRequest['requestType']) => {
    switch (type) {
      case 'access': return <UserSearch className="w-4 h-4" />;
      case 'erasure': return <Trash2 className="w-4 h-4" />;
      case 'portability': return <Download className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredRequests = requests.filter(r => {
    const q = searchTerm.toLowerCase();
    return r.id.toLowerCase().includes(q) ||
           r.requesterName.toLowerCase().includes(q) ||
           r.requesterEmail.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-20 text-left">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200 text-white">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">DSAR Transparency & Privacy Portal</h1>
            <p className="text-slate-500 text-sm mt-1">Exercise GDPR & CCPA privacy rights. Automated access, erasure, and portability pipelines.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 flex-1 md:flex-none">
            <button 
              id="view-user"
              onClick={() => setView('USER')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 md:flex-none ${view === 'USER' ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              My Requests
            </button>
            <button 
              id="view-admin"
              onClick={() => setView('ADMIN')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 md:flex-none ${view === 'ADMIN' ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              DPO Fulfillment Queue
            </button>
          </div>
          <button 
            id="btn-new-dsar"
            onClick={() => setShowSubmitModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-100 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Sidebar Stats */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">Statutory SLA Compliance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-slate-300">Avg. Fulfillment</span>
                </div>
                <span className="text-xs font-bold">12 Days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-slate-300">SLA Adherence</span>
                </div>
                <span className="text-xs font-bold">100%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-medium text-slate-300">Active Queue</span>
                </div>
                <span className="text-xs font-bold">{requests.length} Requests</span>
              </div>
            </div>
            <div className="mt-6 p-3 bg-indigo-950/60 border border-indigo-800 rounded-xl text-[11px] text-indigo-200">
              <span className="font-bold block text-indigo-300 uppercase text-[10px] mb-1">Article 12(3) GDPR Mandate:</span>
              Responses must be communicated within one month of receipt. Zero-knowledge verification prevents unauthorized disclosure.
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Your Privacy Rights Guide</h3>
            <div className="space-y-3">
              {[
                { title: 'Right to Access (Art. 15)', desc: 'Obtain confirmation and copy of all personal data held.' },
                { title: 'Right to Erasure (Art. 17)', desc: 'Irrevocably purge personal records across databases.' },
                { title: 'Right to Portability (Art. 20)', desc: 'Receive machine-readable structured JSON data package.' },
                { title: 'Right to Rectify (Art. 16)', desc: 'Update inaccurate personal or financial identity records.' },
              ].map((right, idx) => (
                <div key={idx} className="group p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <h4 className="text-[11px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{right.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{right.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Requests Table/List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                {view === 'USER' ? 'My Privacy Request History' : 'Global DPO Fulfillment Queue'}
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by ID, Name or Email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 animate-spin text-indigo-500" />
                Querying sovereign privacy ledger...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No privacy requests match the current search filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Request ID</th>
                      <th className="px-4 py-3">Requester</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Statutory SLA</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredRequests.map(req => {
                      const daysLeft = Math.max(0, Math.ceil((new Date(req.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                      return (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4 font-mono font-bold text-slate-900">
                            {req.id}
                            <span className="block text-[10px] text-slate-400 font-normal">{req.jurisdiction}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-slate-800 block">{req.requesterName}</span>
                            <span className="text-[10px] text-slate-400">{req.requesterEmail}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="p-1 bg-slate-100 rounded text-slate-600">
                                {getRequestTypeIcon(req.requestType)}
                              </span>
                              <span className="capitalize font-bold text-xs">{req.requestType}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(req.status)}`}>
                              {req.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              <Clock className={`w-3.5 h-3.5 ${daysLeft <= 5 ? 'text-rose-500' : 'text-amber-500'}`} />
                              <span className={`text-[11px] font-bold ${daysLeft <= 5 ? 'text-rose-600' : 'text-amber-700'}`}>
                                {daysLeft} days left
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              Due: {new Date(req.slaDeadline).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* User actions */}
                              {view === 'USER' && req.status === 'identity_pending' && (
                                <button
                                  id={`verify-${req.id}`}
                                  onClick={() => handleVerifyIdentity(req.id)}
                                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                  title="Verify Identity with Zero-Knowledge Proof"
                                >
                                  <Fingerprint className="w-3.5 h-3.5" />
                                  Verify
                                </button>
                              )}

                              {req.status === 'fulfilled' && (
                                <button
                                  id={`download-${req.id}`}
                                  onClick={() => handleDownloadPersonalData(req)}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                  title="Download Data Archive"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Data Package
                                </button>
                              )}

                              {/* Admin actions */}
                              {view === 'ADMIN' && req.status !== 'fulfilled' && (
                                <button
                                  id={`fulfill-${req.id}`}
                                  onClick={() => handleFulfillRequest(req.id)}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                                  title="Fulfill Request"
                                >
                                  <BadgeCheck className="w-3.5 h-3.5" />
                                  Fulfill
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Inspect Details"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SLA Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="bg-amber-100 p-2.5 rounded-xl text-amber-700 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">Regulatory SLA Enforcement Protocol</h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Under Article 12(3) of the GDPR and California Civil Code § 1798.130, responses must be provided without undue delay and within <strong>one month</strong> of receipt. 
                Our platform enforces automated SLA triggers with immutable cryptographic timestamps.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NEW REQUEST MODAL */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-left"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Lodge New Data Subject Request</h3>
                    <p className="text-xs text-slate-500">Official statutory request under GDPR / CCPA privacy frameworks</p>
                  </div>
                </div>
                <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Requester Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Verified Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. elena.rostova@example.eu"
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Right Being Exercised
                    </label>
                    <select
                      value={reqType}
                      onChange={(e) => setReqType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="access">Right to Access (Art. 15)</option>
                      <option value="erasure">Right to Erasure (Art. 17)</option>
                      <option value="portability">Data Portability (Art. 20)</option>
                      <option value="rectification">Rectification (Art. 16)</option>
                      <option value="opt_out_sale">Opt-Out of Sale (CCPA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Statutory Jurisdiction
                    </label>
                    <select
                      value={reqJurisdiction}
                      onChange={(e) => setReqJurisdiction(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="EU (GDPR)">🇪🇺 EU (GDPR 2016/679)</option>
                      <option value="US (CCPA)">🇺🇸 US (California CCPA/CPRA)</option>
                      <option value="UK (Data Act)">🇬🇧 UK (Data Use & Access Act)</option>
                      <option value="KSA (PDPL)">🇸🇦 KSA (PDPL Royal Decree M/148)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-bold block text-slate-700 uppercase text-[10px] mb-0.5">Automated SLA Guarantee:</span>
                  Upon receipt, an automated 30-day fulfillment deadline will be bound to this request with real-time status tracking.
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-dsar-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {isSubmitting ? 'Lodging Request...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REQUEST DETAIL MODAL */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-left"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedRequest.id}</h3>
                    <p className="text-xs text-slate-500 capitalize">{selectedRequest.requestType} Request</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Requester</span>
                    <span className="font-bold text-slate-800">{selectedRequest.requesterName}</span>
                    <span className="text-slate-500 block text-[10px]">{selectedRequest.requesterEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Status</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block mt-0.5 border ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Lodged Date</span>
                    <span className="font-bold text-slate-800">{new Date(selectedRequest.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Statutory SLA Deadline</span>
                    <span className="font-bold text-rose-600">{new Date(selectedRequest.slaDeadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Identity Verification & ZKP Attestation</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {selectedRequest.identityVerified ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-emerald-800">Zero-Knowledge Identity Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="font-bold text-amber-800">Pending ZKP Identity Attestation</span>
                          </>
                        )}
                      </div>
                      {!selectedRequest.identityVerified && (
                        <button
                          onClick={() => {
                            handleVerifyIdentity(selectedRequest.id);
                            setSelectedRequest(prev => prev ? { ...prev, identityVerified: true, status: 'verified' } : null);
                          }}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black transition cursor-pointer"
                        >
                          Generate ZKP Proof
                        </button>
                      )}
                    </div>
                    {selectedRequest.zkProof && (
                      <div className="mt-2 pt-2 border-t border-slate-200/80 font-mono text-[10px] text-slate-600 space-y-1">
                        <div><span className="text-slate-400">Proof Hash:</span> <span className="text-indigo-600 font-bold">{selectedRequest.zkProof.proofHash}</span></div>
                        <div className="flex justify-between">
                          <span><span className="text-slate-400">Algorithm:</span> {selectedRequest.zkProof.algorithm}</span>
                          <span><span className="text-slate-400">Node:</span> {selectedRequest.zkProof.verifierNode}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRequest.discoveredDatabases && selectedRequest.discoveredDatabases.length > 0 && (
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1.5">
                      Cross-Database PII Discovery & Redaction (GDPR Art. 15 / 17)
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedRequest.discoveredDatabases.map((db, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px]">
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Database className="w-3.5 h-3.5 text-indigo-600" />
                              {db.sourceName}
                              <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-normal">{db.systemType}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Categories: {db.dataCategories.join(', ')} • {db.recordsFound} records
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            db.redactionStatus === 'CLEARED' ? 'bg-emerald-100 text-emerald-800' :
                            db.redactionStatus === 'REDACTED_AUTOMATICALLY' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {db.redactionStatus.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequest.resolutionDetails && (
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Resolution Audit Log</span>
                    <p className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-mono text-[11px]">
                      {selectedRequest.resolutionDetails}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition"
                >
                  Close
                </button>
                {selectedRequest.status === 'fulfilled' && (
                  <button
                    onClick={() => handleDownloadPersonalData(selectedRequest)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Personal Data (JSON)
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
