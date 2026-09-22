import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, ShieldCheck, Search, AlertCircle, 
  CheckCircle, ArrowRight, Lock, Clock, Send, RefreshCw 
} from 'lucide-react';
import { RealtimeTrackingStatus } from '../components/dashboard/RealtimeTrackingStatus';
import { useNotification } from '../context/NotificationContext';

export const ConsumerGrievancePublicPortal: React.FC = () => {
  const { showToast } = useNotification();
  const [activeView, setActiveView] = useState<'report' | 'track' | 'clusters'>('report');
  
  // Submission Form state
  const [countryCode, setCountryCode] = useState('BD');
  const [channel, setChannel] = useState<'WEB_WIDGET' | 'WHATSAPP' | 'SMS' | 'PARTNER_API' | 'FACEBOOK_MESSENGER' | 'INSTAGRAM_DM'>('WEB_WIDGET');
  const [entityName, setEntityName] = useState('');
  const [rawCategory, setRawCategory] = useState('UNAUTHORIZED_FINTECH');
  const [description, setDescription] = useState('');
  const [amountRange, setAmountRange] = useState('$100 - $1,000');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [complainantContact, setComplainantContact] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Tracking state
  const [trackRef, setTrackRef] = useState('');
  const [trackResult, setTrackResult] = useState<any | null>(null);

  // Clusters state
  const [clusters, setClusters] = useState<any[]>([]);
  const [loadingClusters, setLoadingClusters] = useState(false);

  const fetchClusters = async () => {
    setLoadingClusters(true);
    try {
      const res = await fetch('/api/v1/grievance/clusters');
      const data = await res.json();
      if (data.success) setClusters(data.data || []);
    } catch (e) {
      console.warn('Failed to load clusters:', e);
    } finally {
      setLoadingClusters(false);
    }
  };

  useEffect(() => {
    if (activeView === 'clusters') fetchClusters();
  }, [activeView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityName || !description) {
      showToast('Please fill out the business name and complaint details.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/v1/grievance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode,
          channel,
          entityName,
          rawCategory,
          description,
          amountRange,
          isAnonymous,
          complainantContact: isAnonymous ? undefined : complainantContact
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmittedRef(data.refCode);
        setDescription('');
        setEntityName('');
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackRef) return;
    try {
      const res = await fetch(`/api/v1/grievance/track/${encodeURIComponent(trackRef.trim())}`);
      const data = await res.json();
      if (data.success) {
        setTrackResult(data.data);
      } else {
        setTrackResult({ notFound: true, error: data.error });
      }
    } catch (err: any) {
      setTrackResult({ notFound: true, error: err.message });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Sovereign Citizen Protection</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Consumer Grievance & Whistleblower Engine</h1>
          <p className="text-sm text-slate-400 mt-1">
            Encrypted citizen reporting, AI triage fusion, cluster detection, and 7-day enterprise remediation fix-windows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('report')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeView === 'report' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            File Grievance
          </button>
          <button
            onClick={() => setActiveView('track')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeView === 'track' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            Track Status
          </button>
          <button
            onClick={() => setActiveView('clusters')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeView === 'clusters' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            Authority Clusters
          </button>
        </div>
      </div>

      {/* View 1: Report Filing Form */}
      {activeView === 'report' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-1">Submit Consumer or Whistleblower Report</h3>
            <p className="text-xs text-slate-400 mb-6">
              Reports are treated as investigative leads with automated AI triage. Human authority review is mandatory before any statutory case issuance.
            </p>

            {submittedRef && (
              <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800 rounded-2xl">
                <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4" /> Grievance Successfully Triaged &amp; Registered
                </div>
                <div className="text-sm font-mono text-white mt-1">
                  Your Public Tracking Reference: <strong className="text-cyan-300">{submittedRef}</strong>
                </div>
                <div className="mt-4">
                  <RealtimeTrackingStatus referenceCode={submittedRef} />
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  Please save this reference code. You can use it anytime on the Track Status tab to verify regulatory review progress.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Jurisdiction</label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="BD">Bangladesh (BTRC / BB / NBR)</option>
                    <option value="IN">India (DPDP Board / RBI / TRAI)</option>
                    <option value="AE">United Arab Emirates (TDRA / CBUAE)</option>
                    <option value="SA">Saudi Arabia (SDAIA / SAMA)</option>
                    <option value="NG">Nigeria (NDPC / CBN / NCC)</option>
                    <option value="US">United States (FTC / CFPB)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Intake Channel</label>
                  <select
                    value={channel}
                    onChange={(e: any) => setChannel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="WEB_WIDGET">Public Web Portal</option>
                    <option value="WHATSAPP">WhatsApp Official Channel</option>
                    <option value="FACEBOOK_MESSENGER">Facebook Messenger</option>
                    <option value="INSTAGRAM_DM">Instagram DM</option>
                    <option value="SMS">SMS Short-Code</option>
                    <option value="PARTNER_API">Consumer NGO / Bank API</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Business Name or Domain</label>
                  <input
                    type="text"
                    placeholder="e.g. QuickLoan Digital App / fintech-pay.bd"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Category</label>
                  <select
                    value={rawCategory}
                    onChange={(e) => setRawCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="UNAUTHORIZED_FINTECH">Unauthorized FinTech &amp; Predatory Lending</option>
                    <option value="PRIVACY_DATA_LEAK">Data Privacy Leak / Illegal SMS Harvesting</option>
                    <option value="MISLEADING_AD">Deceptive Advertising &amp; Phishing Scam</option>
                    <option value="TELECOM_SPAM">Spam Robocalls &amp; Spectrum Encroachment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Detailed Incident Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide facts, dates, transaction refs, or URLs where the fraudulent activity occurred..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500"
                  required
                />
              </div>

              {/* Anonymity & PII Vault */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">Whistleblower Identity Encryption</span>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                    />
                    <span>Submit Anonymously</span>
                  </label>
                </div>

                {!isAnonymous && (
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Contact Phone or Email (Encrypted in Vault — Never Plaintext)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +8801700000000 or user@domain.com"
                      value={complainantContact}
                      onChange={(e) => setComplainantContact(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Submit Report to Sovereign Queue
              </button>
            </form>
          </div>

          {/* Right Column: Whistleblower Protections */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Anti-Abuse &amp; Protection Posture
              </h4>
              <ul className="space-y-3 text-xs text-slate-400 leading-relaxed">
                <li>
                  <strong className="text-slate-200">Reports are Leads:</strong> A report never triggers automatic penalties. Certified regulatory inspectors review each cluster.
                </li>
                <li>
                  <strong className="text-slate-200">7-Day Fix Window:</strong> Legitimate enterprises receive due-process notice to resolve grievances prior to statutory fine escalation.
                </li>
                <li>
                  <strong className="text-slate-200">Coordinated Smear Shield:</strong> Machine learning filters competitor smear campaigns and false reports using reputation scoring.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Track Status */}
      {activeView === 'track' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto">
          <h3 className="text-base font-bold text-white mb-2">Track Grievance Status</h3>
          <p className="text-xs text-slate-400 mb-6">
            Enter your public reference code to verify triage, investigation status, and authority outcome.
          </p>

          <form onSubmit={handleTrack} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="e.g. GRV-BD-2026-98124"
              value={trackRef}
              onChange={(e) => setTrackRef(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-mono font-bold cursor-pointer"
            >
              Lookup
            </button>
          </form>

          {trackResult && !trackResult.notFound && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Reference:</span>
                <span className="text-cyan-400 font-bold">{trackResult.ref_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Entity:</span>
                <span className="text-white">{trackResult.entity_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-slate-200">{trackResult.normalized_category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 uppercase font-bold">
                  {trackResult.status}
                </span>
              </div>
            </div>
          )}

          {trackResult?.notFound && (
            <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 font-mono">
              Reference code not found in sovereign registry. Please verify the code format.
            </div>
          )}
        </div>
      )}

      {/* View 3: Authority Clusters */}
      {activeView === 'clusters' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Pattern Clusters (Deduplicated Citizen Leads)
            </h3>
            <button onClick={fetchClusters} className="p-1.5 bg-slate-800 rounded-lg text-slate-300 cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingClusters ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3">Country</th>
                  <th className="pb-3">Entity Name</th>
                  <th className="pb-3">Pattern Summary</th>
                  <th className="pb-3">Reports Merged</th>
                  <th className="pb-3">Max Severity</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {clusters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                      No active clusters. New citizen reports will automatically merge into deduplicated clusters.
                    </td>
                  </tr>
                ) : (
                  clusters.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30">
                      <td className="py-3 text-indigo-400 font-bold">{c.country_id}</td>
                      <td className="py-3 text-white font-semibold">{c.entity_name}</td>
                      <td className="py-3 text-slate-300">{c.pattern_summary}</td>
                      <td className="py-3 text-cyan-400">
                        {JSON.parse(c.report_ids_json || '[]').length} Reports
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-bold">
                          Severity {c.severity_max}/5
                        </span>
                      </td>
                      <td className="py-3 text-emerald-400 uppercase font-bold">{c.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
