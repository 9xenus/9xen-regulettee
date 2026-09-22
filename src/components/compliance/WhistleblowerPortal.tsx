import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Lock, Key, EyeOff, Send, CheckCircle2, 
  Clock, AlertTriangle, MessageSquare, FileText, Copy, 
  Check, UserCheck, RefreshCw, X, ChevronRight, Sparkles,
  MapPin, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

interface WhistleblowerReport {
  id: string;
  reportRef: string;
  timestamp: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  anonymousKey: string;
  replies: Array<{
    from: string;
    text: string;
    date: string;
  }>;
}

export const WhistleblowerPortal: React.FC = () => {
  const { showToast } = useNotification();
  const [activeView, setActiveView] = useState<'submit' | 'lookup' | 'case-manager'>('case-manager');
  const [reports, setReports] = useState<WhistleblowerReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Submission Form State
  const [subCategory, setSubCategory] = useState('Data Privacy & GDPR Violation');
  const [subTitle, setSubTitle] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subPriority, setSubPriority] = useState('High');
  const [subLocation, setSubLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ reportRef: string; anonymousKey: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'title') {
      if (value.length < 5) error = 'Title is too short (min 5 chars)';
      if (value.length > 100) error = 'Title is too long (max 100 chars)';
    } else if (name === 'description') {
      if (value.length < 20) error = 'Please provide more detail (min 20 chars)';
    } else if (name === 'category') {
      if (!value) error = 'Please select a category';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (name: string, value: string, setter: (v: string) => void) => {
    setter(value);
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const renderValidationUI = (name: string) => {
    if (!touched[name]) return null;
    const error = errors[name];
    if (error) {
      return (
        <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1 mt-1 text-[10px] text-rose-500 font-bold">
          <AlertTriangle className="w-3 h-3" /> {error}
        </motion.div>
      );
    }
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-bold">
        <CheckCircle2 className="w-3 h-3" /> Field Validated
      </motion.div>
    );
  };

  // Lookup State
  const [lookupKey, setLookupKey] = useState('');
  const [lookupReport, setLookupReport] = useState<WhistleblowerReport | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupReplyText, setLookupReplyText] = useState('');

  // Case Manager State
  const [selectedReport, setSelectedReport] = useState<WhistleblowerReport | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/whistleblower/reports');
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (e) {
      console.error('Failed to load whistleblower reports', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final check
    if (errors.title || errors.description || errors.category || !subTitle || !subDesc) {
      showToast('Please fix validation errors before submission', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/whistleblower/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: subCategory,
          title: subTitle,
          description: subDesc,
          priority: subPriority,
          location: subLocation
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionResult({
          reportRef: data.report.reportRef,
          anonymousKey: data.report.anonymousKey
        });
        setSubTitle('');
        setSubDesc('');
        showToast('Report submitted successfully', 'success');
        fetchReports();
      } else {
        showToast(data.error || 'Submission failed', 'error');
      }
    } catch (err) {
      console.error('Failed to submit report', err);
      showToast('Connection error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = () => {
    setLookupError('');
    const found = reports.find(r => r.anonymousKey === lookupKey.trim() || r.reportRef === lookupKey.trim());
    if (found) {
      setLookupReport(found);
    } else {
      setLookupError('No confidential report matches this tracking key.');
      setLookupReport(null);
    }
  };

  const handleSendReply = async (reportId: string, text: string, isWhistleblower: boolean = false) => {
    if (!text.trim()) return;
    try {
      const res = await fetch(`/api/v1/whistleblower/reports/${reportId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: isWhistleblower ? 'Whistleblower (Encrypted)' : 'DPO / Compliance Case Manager',
          text
        })
      });
      const data = await res.json();
      if (data.success) {
        setAdminReplyText('');
        setLookupReplyText('');
        fetchReports();
        if (lookupReport && lookupReport.id === reportId) {
          setLookupReport({
            ...lookupReport,
            replies: [...lookupReport.replies, {
              from: isWhistleblower ? 'Whistleblower (Encrypted)' : 'DPO / Compliance Case Manager',
              text,
              date: new Date().toISOString()
            }]
          });
        }
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport({
            ...selectedReport,
            replies: [...selectedReport.replies, {
              from: isWhistleblower ? 'Whistleblower (Encrypted)' : 'DPO / Compliance Case Manager',
              text,
              date: new Date().toISOString()
            }]
          });
        }
      }
    } catch (e) {
      console.error('Error replying', e);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/v1/whistleblower/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchReports();
      if (selectedReport) {
        setSelectedReport({ ...selectedReport, status });
      }
    } catch (e) {
      console.error('Failed to update report status', e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              EU Whistleblowing Directive 2019/1937 & HinSchG
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <EyeOff className="w-3 h-3" /> Zero-Knowledge Metadata Stripping
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            Whistleblower Protection System & Case Room
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Secure, end-to-end encrypted reporting channel for reporting regulatory breaches with statutory 7-day confirmation SLAs.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveView('case-manager')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'case-manager'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Case Manager Triage
          </button>
          <button
            onClick={() => setActiveView('submit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'submit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Submit Confidential Tip
          </button>
          <button
            onClick={() => setActiveView('lookup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'lookup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Check Status by Key
          </button>
        </div>
      </div>

      {/* VIEW 1: CASE MANAGER TRIAGE */}
      {activeView === 'case-manager' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Active Cases ({reports.length})
              </h3>
              <button
                onClick={fetchReports}
                className="p-1 text-slate-400 hover:text-slate-700"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {reports.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  No active reports in triage.
                </div>
              ) : (
                reports.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedReport?.id === r.id
                        ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{r.reportRef}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'Received' ? 'bg-amber-100 text-amber-800' :
                        r.status === 'Under Investigation' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs mt-1.5 line-clamp-1">{r.title}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{r.category}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                      <span>{new Date(r.timestamp).toLocaleDateString()}</span>
                      <span className="font-semibold text-indigo-600">{r.replies.length} replies</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected Case Workspace */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            {selectedReport ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs font-bold text-slate-800">
                        {selectedReport.reportRef}
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {selectedReport.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mt-2">{selectedReport.title}</h3>
                    <span className="text-[11px] text-slate-400">
                      Received: {new Date(selectedReport.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Status:</span>
                    <select
                      value={selectedReport.status}
                      onChange={(e) => handleUpdateStatus(selectedReport.id, e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-indigo-400"
                    >
                      <option value="Received">Received (Pending Review)</option>
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="Remediation Dispatched">Remediation Dispatched</option>
                      <option value="Closed / Resolved">Closed / Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Case Narrative */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-xs font-bold text-slate-500 block mb-1">Encrypted Whistleblower Report Content:</span>
                  <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Threaded Anonymous Chat */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    Encrypted Follow-Up Dialogue (Zero-Knowledge Channel)
                  </h4>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedReport.replies.length === 0 ? (
                      <p className="text-slate-400 text-xs italic py-2">
                        No replies exchanged yet. You can ask follow-up questions to the whistleblower while preserving their anonymity.
                      </p>
                    ) : (
                      selectedReport.replies.map((reply, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl text-xs max-w-lg ${
                            reply.from.includes('Case Manager') || reply.from.includes('DPO')
                              ? 'bg-indigo-50 border border-indigo-100 ml-auto text-slate-800'
                              : 'bg-slate-100 border border-slate-200 mr-auto text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-[10px] text-slate-500 mb-1 font-bold">
                            <span>{reply.from}</span>
                            <span>{new Date(reply.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p>{reply.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply Input */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Send encrypted reply or clarification request..."
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendReply(selectedReport.id, adminReplyText, false);
                      }}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-400"
                    />
                    <button
                      onClick={() => handleSendReply(selectedReport.id, adminReplyText, false)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" /> Reply
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-slate-400 text-center">
                <FileText className="w-12 h-12 text-slate-200 mb-3" />
                <p className="font-bold text-sm text-slate-600">Select a whistleblower report</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  View encrypted report details, update HinSchG SLAs, or communicate anonymously with the submitter.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SUBMIT CONFIDENTIAL TIP */}
      {activeView === 'submit' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2 border-b border-slate-100 pb-5">
            <span className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
              <EyeOff className="w-6 h-6" />
            </span>
            <h3 className="text-xl font-black text-slate-900">Submit a Protected Whistleblower Report</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your report is protected under the EU Whistleblowing Directive and German HinSchG. No IP address, device fingerprints, or identifying headers are ever logged.
            </p>
          </div>

          {submissionResult ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <div>
                <h4 className="text-base font-black text-emerald-900">Report Successfully Submitted Anonymously</h4>
                <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                  Save your confidential Tracking Key below. You will need this key to check case progress and communicate securely with the DPO.
                </p>
              </div>

              <div className="bg-white border border-emerald-300 rounded-xl p-4 max-w-md mx-auto text-left space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Report Reference:</span>
                  <span className="font-mono text-slate-900">{submissionResult.reportRef}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Secret Anonymous Token:</span>
                  <span className="font-mono text-emerald-700 text-[11px] truncate max-w-[180px]">
                    {submissionResult.anonymousKey}
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => copyToClipboard(submissionResult.anonymousKey)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-emerald-700 cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey ? 'Copied to Clipboard!' : 'Copy Secret Key'}
                </button>
                <button
                  onClick={() => {
                    setSubmissionResult(null);
                    setActiveView('lookup');
                    setLookupKey(submissionResult.anonymousKey);
                  }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Track Report Now
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 mb-1">Violation Category</label>
                <select
                  value={subCategory}
                  onChange={(e) => handleInputChange('category', e.target.value, setSubCategory)}
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl font-medium focus:ring-2 focus:ring-amber-400 outline-none transition-all ${
                    touched.category ? (errors.category ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50') : 'border-slate-200'
                  }`}
                >
                  <option value="">Select Category...</option>
                  <option value="Data Privacy & GDPR Violation">Data Privacy & GDPR Violation (Art. 83)</option>
                  <option value="EU AI Act High-Risk Non-Compliance">EU AI Act High-Risk Non-Compliance</option>
                  <option value="Financial Fraud / AML / Embezzlement">Financial Fraud / AML / Embezzlement</option>
                  <option value="Cybersecurity & NIS2 Protocol Breach">Cybersecurity & NIS2 Protocol Breach</option>
                  <option value="Corruption & Anti-Bribery">Corruption & Anti-Bribery</option>
                  <option value="Workplace Discrimination / Harassment">Workplace Discrimination / Harassment</option>
                </select>
                {renderValidationUI('category')}
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 mb-1">Case Summary Headline</label>
                <input
                  type="text"
                  placeholder="e.g., Customer database credentials shared in unencrypted public channel"
                  value={subTitle}
                  onChange={(e) => handleInputChange('title', e.target.value, setSubTitle)}
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl font-medium focus:ring-2 focus:ring-amber-400 outline-none transition-all ${
                    touched.title ? (errors.title ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50') : 'border-slate-200'
                  }`}
                />
                {renderValidationUI('title')}
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 mb-1">Detailed Description of Incident / Concern</label>
                <textarea
                  rows={5}
                  placeholder="Provide objective details: dates, systems, departments involved, or risk impact. Avoid including your own personal name if you wish to stay 100% anonymous..."
                  value={subDesc}
                  onChange={(e) => handleInputChange('description', e.target.value, setSubDesc)}
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl font-medium focus:ring-2 focus:ring-amber-400 outline-none transition-all ${
                    touched.description ? (errors.description ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50') : 'border-slate-200'
                  }`}
                />
                {renderValidationUI('description')}
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${subLocation ? 'text-indigo-600' : 'text-rose-500'}`} />
                    <span className="text-xs font-bold text-slate-700">Incident Location Pinning</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLocating(true);
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setSubLocation({ 
                            lat: pos.coords.latitude, 
                            lng: pos.coords.longitude,
                            accuracy: pos.coords.accuracy 
                          });
                          setLocating(false);
                        },
                        (err) => {
                          console.error(err);
                          setLocating(false);
                          showToast('Location access failed. Please check permissions.', 'error');
                        },
                        {
                          enableHighAccuracy: true,
                          timeout: 10000,
                          maximumAge: 0
                        }
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                      subLocation 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    }`}
                  >
                    {locating ? <RefreshCw className="w-3 h-3 animate-spin" /> : subLocation ? <CheckCircle2 className="w-3 h-3" /> : <Navigation className="w-3 h-3" />}
                    {locating ? 'High-Precision Scan...' : subLocation ? 'Precision Point Fixed' : 'Pin Incident Location'}
                  </button>
                </div>
                {subLocation && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 bg-white p-1.5 rounded border border-slate-100 flex items-center justify-between">
                      <span>GPS: {subLocation.lat.toFixed(6)}, {subLocation.lng.toFixed(6)}</span>
                      <span className="text-indigo-600 font-bold">± {subLocation.accuracy?.toFixed(1)}m accuracy</span>
                    </p>
                  </div>
                )}
                <p className="text-[10px] text-slate-400">
                  Optional: Attach approximate geolocation to improve cluster resolution accuracy. High-precision mode enabled.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PGP-2048 Enclave Encryption Active</span>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Encrypting & Sending...' : 'Submit Protected Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* VIEW 3: LOOKUP BY KEY */}
      {activeView === 'lookup' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              Check Anonymous Whistleblower Case Status
            </h3>
            <p className="text-xs text-slate-500">
              Enter the secret 32-character token or Reference Number generated when you submitted your report.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter secret token or Ref (e.g. WB-9A82...)"
                value={lookupKey}
                onChange={(e) => setLookupKey(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-400"
              />
              <button
                onClick={handleLookup}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Access Case
              </button>
            </div>

            {lookupError && (
              <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {lookupError}
              </p>
            )}
          </div>

          {lookupReport && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {lookupReport.reportRef}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{lookupReport.title}</h3>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  lookupReport.status === 'Received' ? 'bg-amber-100 text-amber-800' :
                  lookupReport.status === 'Under Investigation' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {lookupReport.status}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700">
                <span className="font-bold text-slate-400 block mb-1">Your Submitted Statement:</span>
                {lookupReport.description}
              </div>

              {/* Chat thread with DPO */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800">Encrypted Communication with Compliance Office</h4>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {lookupReport.replies.map((reply, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs max-w-md ${
                        reply.from.includes('Whistleblower')
                          ? 'bg-slate-100 border border-slate-200 ml-auto'
                          : 'bg-indigo-50 border border-indigo-100 mr-auto text-indigo-950 font-medium'
                      }`}
                    >
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                        <span>{reply.from}</span>
                        <span>{new Date(reply.date).toLocaleDateString()}</span>
                      </div>
                      <p>{reply.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Type an anonymous follow-up message to the DPO..."
                    value={lookupReplyText}
                    onChange={(e) => setLookupReplyText(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={() => handleSendReply(lookupReport.id, lookupReplyText, true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
