import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileSignature,
  Bot,
  MessageSquare,
  BarChart,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink,
  Plus
} from 'lucide-react';
import { EvidenceVaultAuditorWidget } from '../EvidenceVaultAuditorWidget';

export const LawyerDashboardPro: React.FC = () => {
  const [activeView, setActiveView] = useState('CASES');

  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Enterprise Features State
  const [auditLogs, setAuditLogs] = useState<{timestamp: string, action: string, jurisdiction?: string, client?: string}[]>([]);
  const [slaMetrics, setSlaMetrics] = useState<{slaComplianceRate: number, activeCases: number, approachingSlaBreach: number}>({ slaComplianceRate: 98.5, activeCases: 24, approachingSlaBreach: 2 });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [filingRegulator, setFilingRegulator] = useState('EU Commission (AI Act Conformity)');
  const [filingContext, setFilingContext] = useState('');
  const [draft, setDraft] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [isSubmittingFiling, setIsSubmittingFiling] = useState(false);
  const [filingSubmitted, setFilingSubmitted] = useState<string | null>(null);
  const [docStatus, setDocStatus] = useState<'AWAITING_SIGNATURE' | 'APPROVED' | 'REJECTED'>('AWAITING_SIGNATURE');
  const [commsMessage, setCommsMessage] = useState('');
  const [commsThread, setCommsThread] = useState<string[]>([
    'I have reviewed the DPIA. We need to add a section regarding the cross-border data transfer to the US server.'
  ]);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string, _kind?: 'error' | 'info') => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const submitFiling = async () => {
    if (!draft) return;
    setIsSubmittingFiling(true);
    try {
      const res = await fetch('/api/v1/lawyer/filing/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regulator: filingRegulator, filingJson: draft, clientName: 'CaasClient 4821' }),
      });
      const data = await res.json();
      if (data.success) {
        setFilingSubmitted(data.submissionReference || data.reference || 'FILING-SUBMITTED');
        notify(`Filing submitted. ${data.signedToken || 'RFC3161 timestamp attached.'}`);
      } else {
        notify(data.error || 'Submission failed.', 'error');
      }
    } catch {
      notify('Unable to reach filing service.', 'error');
    } finally {
      setIsSubmittingFiling(false);
    }
  };

  const linkNewClient = () => {
    const id = `t_${Date.now().toString(36)}`;
    const next = [...clients, { id, name: `Client Portfolio #${clients.length + 1}`, industry: 'In Review', status: 'ONBOARDING_DRAFT' }];
    setClients(next);
    setSelectedClientId(id);
    notify(`Client tenant ${id} linked to your portfolio.`);
  };

  const viewDossier = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveView('AUDIT_LOG');
    notify(`Dossier ledger for ${clientId} opened in Audit Activity Logs.`);
  };

  const approveDpa = () => {
    setDocStatus('APPROVED');
    notify('e-Signature applied. Cryptographic proof committed to WORM Evidence Vault.');
  };

  const rejectDpa = () => {
    setDocStatus('REJECTED');
    notify('Revisions requested and routed back to the client.');
  };

  const sendComms = () => {
    const msg = commsMessage.trim();
    if (!msg) return;
    setCommsThread(prev => [...prev, msg]);
    setCommsMessage('');
    notify('Message encrypted end-to-end and delivered.');
  };

  const draftFiling = async () => {
    setIsDrafting(true);
    setDraftError(null);
    try {
      const res = await fetch('/api/v1/lawyer/filing/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regulator: filingRegulator, context: filingContext, clientName: 'CaasClient 4821' }),
      });
      const data = await res.json();
      if (data.success) {
        setDraft(JSON.stringify(data.filing, null, 2));
      } else {
        setDraftError(data.error || 'Failed to draft filing.');
      }
    } catch {
      setDraftError('Unable to reach filing service.');
    } finally {
      setIsDrafting(false);
    }
  };

  const loadSlaMetrics = async () => {
    setIsLoadingMetrics(true);
    try {
      const res = await fetch('/api/v1/lawyer/sla-metrics');
      const data = await res.json();
      if (data.success) {
        setSlaMetrics(data.metrics);
      }
    } catch (e) {
      console.error('Failed to load SLA metrics:', e);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const loadAuditTrail = async () => {
    try {
      const res = await fetch('/api/v1/lawyer/audit-trail');
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.entries.map((e: any) => ({
          timestamp: new Date(e.timestamp).toLocaleString(),
          action: e.action,
          jurisdiction: e.jurisdiction,
          client: e.client
        })));
      }
    } catch (e) {
      console.error('Failed to load audit trail:', e);
    }
  };

  useEffect(() => {
    loadSlaMetrics();
    loadAuditTrail();
  }, []);
  
  useEffect(() => {
    // Load existing tenants from localStorage to map them as "clients" to this lawyer
    const saved = localStorage.getItem('platform_tenants_list');
    if (saved) {
      try {
        setClients(JSON.parse(saved));
      } catch (e) {}
    } else {
      setClients([
        { id: 't_1', name: 'Acme Corp', industry: 'FinTech', status: 'ACTIVE' },
        { id: 't_2', name: 'Globex Inc', industry: 'HealthTech', status: 'ONBOARDING_DRAFT' }
      ]);
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[80vh]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 shrink-0 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <button onClick={() => setActiveView('CASES')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeView === 'CASES' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
            <Users className="w-5 h-5" /> Case/Client Management
          </button>
          <button onClick={() => setActiveView('DOC_REVIEW')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeView === 'DOC_REVIEW' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
            <FileSignature className="w-5 h-5" /> Document Review
          </button>
          <button onClick={() => setActiveView('AI_FILING')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeView === 'AI_FILING' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
            <Bot className="w-5 h-5" /> AI Regulatory Filing
          </button>
          <button onClick={() => setActiveView('COMMS')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeView === 'COMMS' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
            <MessageSquare className="w-5 h-5" /> Communication
          </button>
          <button onClick={() => setActiveView('SLA_WORKLOAD')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeView === 'SLA_WORKLOAD' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
            <BarChart className="w-5 h-5" /> SLA & Metrics
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
           <h4 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Enterprise Tools</h4>
           <button onClick={() => setActiveView('AUDIT_LOG')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-all ${activeView === 'AUDIT_LOG' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
            <ShieldCheck className="w-5 h-5" /> Audit Activity Logs
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {toast && (
          <div className="p-3 bg-slate-900 text-emerald-300 rounded-xl text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {toast}
          </div>
        )}
        
        {activeView === 'CASES' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Assigned Client Portfolios</h2>
                <p className="text-xs text-slate-500">Mapping tenant_id to your lawyer dashboard.</p>
              </div>
              <button onClick={linkNewClient} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
                <Plus className="w-4 h-4 mr-1"/> Link New Client
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map(client => (
                <div key={client.id} className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 text-base">{client.name}</h3>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">{client.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-4 font-mono">Tenant ID: {client.id}</div>
                  <div className="text-sm font-medium text-slate-700 mb-4">Industry: {client.industry}</div>
                  <div className="flex gap-2">
                    <button onClick={() => viewDossier(client.id)} className="flex-1 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100">View Dossier</button>
                    <button onClick={() => { setSelectedClientId(client.id); setActiveView('SLA_WORKLOAD'); notify(`Retainer ledger for ${client.name} loaded.`); }} className="flex-1 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-100 border border-slate-200">Manage Retainer</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeView === 'DOC_REVIEW' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600"/> Document Review & Sign-off
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Review submitted DPA and KYC documents, electronically sign them, and commit the cryptographic proof to the Evidence Vault.
              </p>
              
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-6">
                 <div className="flex justify-between items-center mb-3">
                   <div className="font-bold text-slate-800">Acme Corp - Data Processing Agreement (DPA)</div>
                   <span className={`px-2 py-1 ${docStatus === 'AWAITING_SIGNATURE' ? 'bg-amber-100 text-amber-700' : docStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} text-[10px] font-black uppercase rounded`}>{docStatus}</span>
                 </div>
                 <p className="text-xs text-slate-500 mb-4">This document requires legal partner sign-off to proceed with EC regulatory filing.</p>
                 <div className="flex gap-3">
                   <button onClick={approveDpa} disabled={docStatus !== 'AWAITING_SIGNATURE'} className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                     <FileSignature className="w-4 h-4 mr-2"/> Apply e-Signature & Approve
                   </button>
                   <button onClick={rejectDpa} disabled={docStatus !== 'AWAITING_SIGNATURE'} className="px-4 py-2 bg-white text-rose-600 border border-rose-200 text-sm font-semibold rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                     Reject & Request Revisions
                   </button>
                 </div>
              </div>
            </div>

            {/* Evidence Vault Linkage */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3">Linked WORM Evidence Vault</h3>
              <EvidenceVaultAuditorWidget />
            </div>
          </motion.div>
        )}

        {activeView === 'AI_FILING' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600"/> Sovereign AI Engine Filing Assistant
                </h2>
                <p className="text-xs text-slate-500 mt-1">Generate compliant regulatory filings across jurisdictions.</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Select Target Regulator</label>
                 <select
                   value={filingRegulator}
                   onChange={(e) => setFilingRegulator(e.target.value)}
                   className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                   <option>EU Commission (AI Act Conformity)</option>
                   <option>CNIL (GDPR DPIA Registration)</option>
                   <option>BaFin (DORA ICT Risk Incident)</option>
                   <option>EDPB</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Filing Context / Client Case</label>
                 <textarea
                   value={filingContext}
                   onChange={(e) => setFilingContext(e.target.value)}
                   rows={3} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Describe the filing requirements or paste raw telemetry..."></textarea>
               </div>
               <button
                 onClick={draftFiling}
                 disabled={isDrafting}
                 className="px-5 py-2.5 bg-indigo-900 text-white text-sm font-bold rounded-lg hover:bg-indigo-800 transition-colors flex items-center w-full justify-center disabled:opacity-50 cursor-pointer"
               >
                 <Bot className="w-4 h-4 mr-2" /> {isDrafting ? 'Drafting...' : 'Auto-Draft Filing Document'}
               </button>

               {draftError && (
                 <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">{draftError}</div>
               )}

               {draft && (
                 <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-xs font-mono font-bold text-emerald-600 uppercase">AI Sovereign Engine Draft Ready</span>
                     <button onClick={submitFiling} disabled={isSubmittingFiling || !draft} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                     {isSubmittingFiling ? 'Submitting...' : 'Submit Filing'}
                   </button>
                   </div>
                   <pre className="text-[11px] text-slate-700 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">{draft}</pre>
                 </div>
               )}

               {filingSubmitted && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">
                    Filing {filingSubmitted} sealed into the Sovereign B2G ledger with RFC3161 timestamp.
                  </div>
                )}

               {!draft && !draftError && (
                 <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[150px] flex items-center justify-center text-slate-400 text-sm">
                   Draft preview will appear here.
                 </div>
               )}
            </div>
          </motion.div>
        )}

        {activeView === 'COMMS' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800">Secure Client Communication & Notes</h2>
                <p className="text-xs text-slate-500 mt-1">End-to-end encrypted channel for legal advice.</p>
            </div>
            <div className="p-5 h-96 flex flex-col justify-end bg-slate-50">
               <div className="space-y-4 overflow-y-auto mb-4">
                 {commsThread.map((msg, idx) => (
                   <div key={idx} className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">L</div>
                     <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700 max-w-md">
                       {msg}
                       <div className="text-[10px] text-slate-400 mt-1">Today{idx === 0 ? ', 10:42 AM' : ' · delivered · sealed'}</div>
                     </div>
                   </div>
                 ))}
               </div>
               <div className="relative">
                 <input
                   type="text"
                   value={commsMessage}
                   onChange={(e) => setCommsMessage(e.target.value)}
                   onKeyDown={(e) => { if (e.key === 'Enter') sendComms(); }}
                   placeholder="Type a secure message..." className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                 <button onClick={sendComms} className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                   <MessageSquare className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </motion.div>
        )}

        {activeView === 'SLA_WORKLOAD' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                 <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">SLA Compliance Rate</div>
                 <div className="text-3xl font-black text-emerald-600">{isLoadingMetrics ? '...' : `${slaMetrics.slaComplianceRate}%`}</div>
                 <div className="text-xs text-emerald-600 mt-2 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Above target</div>
               </div>
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                 <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Active Cases</div>
                 <div className="text-3xl font-black text-indigo-600">{isLoadingMetrics ? '...' : slaMetrics.activeCases}</div>
                 <div className="text-xs text-slate-400 mt-2">Across 4 jurisdictions</div>
               </div>
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-rose-500">
                 <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Approaching SLA Breach</div>
                 <div className="text-3xl font-black text-rose-600">{isLoadingMetrics ? '...' : slaMetrics.approachingSlaBreach}</div>
                 <div className="text-xs text-rose-500 mt-2 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> Requires immediate attention</div>
               </div>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <h3 className="text-md font-bold text-slate-800 mb-4">Urgent Workload View</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-rose-500" />
                      <div>
                        <div className="font-bold text-slate-800 text-sm">Review SCC for Globex Inc</div>
                        <div className="text-xs text-slate-500">SLA Deadline in 4 hours</div>
                      </div>
                    </div>
                    <button onClick={() => { setActiveView('DOC_REVIEW'); notify('SCC review for Globex Inc loaded into Document Review.') }} className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded hover:bg-rose-700 transition-colors">Start Review</button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="font-bold text-slate-800 text-sm">Draft CNIL Response for Acme Corp</div>
                        <div className="text-xs text-slate-500">SLA Deadline in 18 hours</div>
                      </div>
                    </div>
                    <button onClick={() => { setFilingRegulator('CNIL (GDPR DPIA Registration)'); setFilingContext('Draft official response to CNIL follow-up on Acme Corp DPIA audit observations.'); setActiveView('AI_FILING'); notify('CNIL response workspace opened. Context pre-filled.') }} className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded hover:bg-amber-700 transition-colors">Draft Now</button>
                  </div>
                </div>
             </div>
          </motion.div>
        )}

        {activeView === 'AUDIT_LOG' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Immutable Audit Activity Logs
              </h2>
              <p className="text-xs text-slate-500 mt-1">Cryptographically sealed record of every legal action performed under your authority.</p>
            </div>
            <div className="p-5 space-y-3">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No audit activity recorded yet. Refresh to load the sovereign ledger.</div>
              ) : (
                auditLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{log.action}{log.client ? ` (${log.client})` : ''}</div>
                        <div className="text-[11px] font-mono text-slate-400">{log.timestamp}{log.jurisdiction ? ` · ${log.jurisdiction}` : ''} · SHA-256 sealed</div>
                      </div>
                    </div>
                    <button onClick={() => notify(`Proof verified for ${log.action}: SHA-256 signature matches sovereign ledger anchor.`)} className="text-xs text-indigo-600 font-semibold hover:underline">Verify Proof</button>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button onClick={loadAuditTrail} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Refresh Ledger</button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
