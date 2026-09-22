import React, { useState, useEffect, useCallback } from 'react';
import { 
  Scale, 
  Send, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Building2, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Download, 
  Plus, 
  Layers, 
  ChevronRight, 
  UserCheck, 
  MessageSquare,
  FileCheck,
  Zap,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { jsPDF } from 'jspdf';

export const ClientLegalCounselHub: React.FC<{
  tenantContext?: any;
  triggerToast?: (msg: string) => void;
}> = ({ tenantContext, triggerToast }) => {
  const clientId = !tenantContext?.id || tenantContext.id === 'DEFAULT_TENANT' ? 'org_1' : tenantContext.id;
  const [activeTab, setActiveTab] = useState<'directives' | 'opinions' | 'alsp_catalog' | 'invoices'>('directives');
  const [apiLoaded, setApiLoaded] = useState(false);

  // Directives State (Synced with Lawyer CRM)
  const [directives, setDirectives] = useState<any[]>(() => {
    const saved = localStorage.getItem('9xen-regulettee_legal_directives');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'dir-101',
        clientId: 'c-1',
        clientName: 'Acme Corp Europe',
        title: 'Inject SHA-256 Watermark Metadata on AI Model Outputs',
        description: 'Mandatory technical compliance action under EU AI Act Article 52(1). Deploy Express middleware to append cryptographic provenance signature.',
        priority: 'CRITICAL',
        regulation: 'EU AI Act',
        dueDate: '2026-08-30',
        status: 'PENDING_CLIENT_ACTION',
        dispatchedAt: '2026-08-20',
        counselNotes: 'Failure to deploy by Aug 30 triggers non-compliance alert under Art 99 statutory fine regime.'
      }
    ];
  });

  // Opinion Letters State (Synced with Lawyer Studio)
  const [opinionLetters, setOpinionLetters] = useState<any[]>(() => {
    const saved = localStorage.getItem('9xen-regulettee_opinion_letters');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'op-1',
        clientName: 'Acme Corp Europe',
        title: 'Formal Counsel Opinion: EU AI Act Article 52 Transparency & Cryptographic Watermarking',
        issuedAt: '2026-08-15',
        counselName: 'Elena Vance, Senior Partner Counsel',
        status: 'VERIFIED_OFFICIAL',
        content: `### FORMAL LEGAL OPINION LETTER\n\n**To:** Board of Directors & General Counsel, Acme Corp Europe\n**From:** Elena Vance, Senior Regulatory Counsel, 9Xen Regulettee Practice Group\n**Date:** August 15, 2026\n**Subject:** EU AI Act High-Risk Model Compliance & Statutory Defense\n\n---\n\n#### 1. QUESTION PRESENTED\nWhether Acme Corp's generative synthetic video rendering pipeline satisfies Article 52 transparency and watermarking requirements.\n\n#### 2. OPINION & HOLDING\nOur legal audit concludes that Acme Corp maintains strong overall privacy posture (88/100). However, deploying inline SHA-256 HMAC response watermarking on public endpoints is strictly required to eliminate Art 99 fine exposure (€35M statutory maximum).\n\nRespectfully submitted,\n*Elena Vance, 9Xen Regulettee Partner Counsel*`
      }
    ];
  });

  // Invoices State (Synced with Lawyer Studio)
  const [invoices, setInvoices] = useState<any[]>(() => {
    const saved = localStorage.getItem('9xen-regulettee_billable_invoices');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'inv-101',
        invoiceNumber: 'INV-2026-8801',
        clientName: 'Acme Corp Europe',
        amount: 7500,
        serviceDescription: 'Monthly Enterprise ALSP Retainer - August 2026',
        issuedAt: '2026-08-01',
        dueDate: '2026-08-31',
        status: 'SENT'
      }
    ];
  });

  // Lawyer-Generated Law/Act Solutions (auto-integrated from the solution engine)
  const [solutions, setSolutions] = useState<any[]>([]);

  // Service Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    serviceType: 'Express Contract Redline Audit ($1,500)',
    notes: '',
    urgency: 'Standard (48 Hours)'
  });

  // Selected Opinion Modal
  const [selectedOpinion, setSelectedOpinion] = useState<any | null>(null);

  // Sync state changes to localStorage (fallback only when the live ledger is unavailable)
  useEffect(() => {
    const interval = setInterval(() => {
      if (apiLoaded) return;
      const savedDir = localStorage.getItem('9xen-regulettee_legal_directives');
      if (savedDir) setDirectives(JSON.parse(savedDir));

      const savedOp = localStorage.getItem('9xen-regulettee_opinion_letters');
      if (savedOp) setOpinionLetters(JSON.parse(savedOp));

      const savedInv = localStorage.getItem('9xen-regulettee_billable_invoices');
      if (savedInv) setInvoices(JSON.parse(savedInv));
    }, 2000);
    return () => clearInterval(interval);
  }, [apiLoaded]);

  // Live counsel ledger: directives + remediation tasks + invoices from the lawyer-ops API
  const loadLedger = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/lawyer/clients/${clientId}/ledger`);
      const d = await res.json();
      if (!d.success) return;

      const mappedDirectives = (d.directives || []).map((x: any) => ({
        id: x.id,
        kind: 'directive' as const,
        clientId: x.client_id,
        clientName: x.client_name,
        title: x.title,
        description: `${x.directive_type} issued under ${x.jurisdiction || 'cross-border jurisdiction'}. Directive assignee: ${x.assignee || 'Partner Counsel'}.`,
        priority: x.directive_type === 'REMEDIATION_DIRECTIVE' ? 'CRITICAL' : 'HIGH',
        regulation: x.jurisdiction || 'Cross-Border',
        dueDate: (x.updated_at || x.created_at || '').slice(0, 10) || '—',
        status: x.status === 'ISSUED' ? 'PENDING_CLIENT_ACTION' : x.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
        rawStatus: x.status,
        dispatchedAt: (x.created_at || '').slice(0, 10),
        counselNotes: x.assignee ? `Assigned counsel: ${x.assignee}` : undefined,
      }));

      const mappedTasks = (d.tasks || []).map((x: any) => ({
        id: x.id,
        kind: 'task' as const,
        clientId,
        clientName: tenantContext?.name || 'Client Workspace',
        title: x.title,
        description: x.description || 'Provisioned remediation task from partner counsel.',
        priority: x.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        regulation: 'Counsel Remediation',
        dueDate: (x.due_date || '').slice(0, 10) || '—',
        status: ['DONE', 'RESOLVED'].includes(x.status) ? 'COMPLETED' : x.status === 'OPEN' ? 'PENDING_CLIENT_ACTION' : 'IN_PROGRESS',
        rawStatus: x.status,
        dispatchedAt: (x.created_at || '').slice(0, 10),
        counselNotes: x.assigned_to ? `Assigned to: ${x.assigned_to}` : undefined,
      }));

      const mappedInvoices = (d.invoices || []).map((x: any) => ({
        id: x.id,
        invoiceNumber: x.invoice_number || x.id,
        clientName: x.client_name,
        serviceDescription: x.matter || 'Counsel services',
        amount: Number(x.amount || 0),
        currency: x.currency || 'EUR',
        issuedAt: (x.created_at || '').slice(0, 10),
        dueDate: (x.due_date || '').slice(0, 10),
        status: x.status,
        lineItems: x.line_items || [],
      }));

      const mappedSolutions = (d.solutions || []).map((x: any) => ({
        id: x.id,
        title: x.title || x.act_title || 'Law/act compliance solution',
        description: x.summary || x.description || 'Auto-generated remediation solution docketed by partner counsel.',
        jurisdiction: x.jurisdiction || x.region || 'Cross-Border',
        acts: Array.isArray(x.acts) ? x.acts : (x.acts ? [x.acts] : []),
        status: x.status || 'ACTIVE',
        createdAt: (x.created_at || '').slice(0, 10),
      }));

      if (mappedDirectives.length || mappedTasks.length) {
        setDirectives([...mappedDirectives, ...mappedTasks]);
        try { localStorage.setItem('9xen-regulettee_legal_directives', JSON.stringify([...mappedDirectives, ...mappedTasks])); } catch { /* quota */ }
      }
      if (mappedInvoices.length) {
        setInvoices(mappedInvoices);
        try { localStorage.setItem('9xen-regulettee_billable_invoices', JSON.stringify(mappedInvoices)); } catch { /* quota */ }
      }
      if (mappedSolutions.length) setSolutions(mappedSolutions);
      setApiLoaded(true);
    } catch { /* offline — keep localStorage fallback */ }
  }, [clientId, tenantContext?.name]);

  useEffect(() => { loadLedger(); }, [loadLedger]);

  const handleCompleteDirective = async (dir: any) => {
    const id = dir?.id || dir;
    const kind = dir?.kind || (String(id).startsWith('task_') ? 'task' : 'directive');
    const apiStatus = kind === 'task' ? 'DONE' : 'COMPLETED';
    const endpoint = kind === 'task'
      ? `/api/v1/lawyer/tasks/${id}/status`
      : `/api/v1/lawyer/directives/${id}/status`;
    try {
      const res = await fetch(endpoint, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: apiStatus }),
      });
      if (res.ok && triggerToast) triggerToast('Legal Directive marked as completed! Proof logged to Counsel Ledger.');
      else if (triggerToast) triggerToast('Directive updated locally (counsel ledger unreachable).');
    } catch { if (triggerToast) triggerToast('Directive updated locally (counsel ledger unreachable).'); }
    const updated = directives.map(d => d.id === id ? { ...d, status: 'COMPLETED', rawStatus: apiStatus } : d);
    setDirectives(updated);
    try { localStorage.setItem('9xen-regulettee_legal_directives', JSON.stringify(updated)); } catch { /* quota */ }
  };

  const handlePayInvoice = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/lawyer/invoices/${id}/pay`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok && triggerToast) triggerToast('Invoice paid successfully via Retainer Payment Gateway!');
      else if (triggerToast) triggerToast('Invoice settled locally (counsel ledger unreachable).');
    } catch { if (triggerToast) triggerToast('Invoice settled locally (counsel ledger unreachable).'); }
    const updated = invoices.map(i => i.id === id ? { ...i, status: 'PAID' } : i);
    setInvoices(updated);
    try { localStorage.setItem('9xen-regulettee_billable_invoices', JSON.stringify(updated)); } catch { /* quota */ }
  };

  const handleSubmitServiceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem('9xen-regulettee_alsp_requests') || '[]');
    const newReq = {
      id: 'req-' + Date.now(),
      serviceType: requestForm.serviceType,
      notes: requestForm.notes,
      urgency: requestForm.urgency,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'RECEIVED_BY_COUNSEL'
    };
    localStorage.setItem('9xen-regulettee_alsp_requests', JSON.stringify([newReq, ...existing]));
    setIsRequestModalOpen(false);
    setRequestForm({
      serviceType: 'Express Contract Redline Audit ($1,500)',
      notes: '',
      urgency: 'Standard (48 Hours)'
    });
    if (triggerToast) triggerToast('ALSP Service Request submitted to Partner Counsel!');
  };

  return (
    <div className="space-y-6">
      {/* Active Counsel & Retainer Overview Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-extrabold text-xl shadow-inner">
              <Scale className="w-7 h-7 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full uppercase">
                  Active Retainer
                </span>
                <span className="text-xs text-indigo-300 font-medium">Enterprise ALSP Practice Group</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">9Xen Regulettee Partner Counsel Desk</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Assigned Partner Counsel: <strong className="text-white">Elena Vance, Managing Partner</strong> (elena.vance@9xen-regulettee-legal.eu)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl text-right">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Monthly SLA Balance</div>
              <div className="text-sm font-bold text-indigo-300">11.5 / 30.0 hrs remaining</div>
            </div>

            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Request ALSP Legal Service</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('directives')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'directives'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Counsel Directives</span>
          {directives.filter(d => d.status === 'PENDING_CLIENT_ACTION').length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded-full font-bold">
              {directives.filter(d => d.status === 'PENDING_CLIENT_ACTION').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('opinions')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'opinions'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Legal Opinion Letters</span>
        </button>

        <button
          onClick={() => setActiveTab('alsp_catalog')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'alsp_catalog'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>On-Demand ALSP Menu</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'invoices'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Retainer Invoices</span>
        </button>
      </div>

      {/* TAB 1: COUNSEL DIRECTIVES */}
      {activeTab === 'directives' && (
        <div className="space-y-4">
          {solutions.length > 0 && (
            <div className="bg-gradient-to-br from-slate-900 to-blue-950/60 border border-blue-800/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-400" />
                  Lawyer-Generated Law/Act Solutions
                </h3>
                <span className="text-[11px] font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  {solutions.length} docketed
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {solutions.map((sol) => (
                  <div key={sol.id} className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-white">{sol.title}</p>
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                        {sol.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 pb-1">{sol.description}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {sol.acts.slice(0, 4).map((act: string) => (
                        <span key={act} className="text-[10px] font-semibold text-blue-300 bg-blue-950/60 border border-blue-900/40 rounded-full px-2 py-0.5">
                          {act}
                        </span>
                      ))}
                      {sol.jurisdiction && (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 rounded-full px-2 py-0.5">
                          {sol.jurisdiction}
                        </span>
                      )}
                    </div>
                    {sol.createdAt && <p className="text-[10px] text-slate-500">Docketed {sol.createdAt}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {directives.map((dir) => (
              <div key={dir.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 relative">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${
                      dir.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {dir.priority} • {dir.regulation}
                    </span>
                    <h3 className="text-sm font-bold text-white">{dir.title}</h3>
                  </div>

                  <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${
                    dir.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {dir.status === 'COMPLETED' ? 'Verified Completed' : 'Action Required'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {dir.description}
                </p>

                {dir.counselNotes && (
                  <div className="text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-lg">
                    <strong>Counsel Instruction:</strong> {dir.counselNotes}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Due Date: <strong className="text-white">{dir.dueDate}</strong></span>

                  {dir.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleCompleteDirective(dir)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Execute & Submit Proof</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LEGAL OPINION LETTERS */}
      {activeTab === 'opinions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opinionLetters.map((op) => (
              <div key={op.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold rounded-full">
                    Official Counsel Opinion
                  </span>
                  <span className="text-xs text-slate-400">{op.issuedAt}</span>
                </div>

                <h3 className="text-sm font-bold text-white">{op.title}</h3>
                <p className="text-xs text-slate-400">Issued by: <strong className="text-slate-200">{op.counselName}</strong></p>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => setSelectedOpinion(op)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Opinion Document</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ON-DEMAND ALSP CATALOG */}
      {activeTab === 'alsp_catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold rounded-full">Express Service</span>
              <h3 className="text-base font-bold text-white mt-2">AI Contract Redline Audit</h3>
              <p className="text-xs text-slate-400 mt-1">Detailed clause-by-clause redline audit against EU AI Act, GDPR, and DORA standards with liability caps.</p>
              <div className="text-lg font-extrabold text-white mt-3">$1,500 <span className="text-xs font-normal text-slate-400">/ contract</span></div>
            </div>
            <button
              onClick={() => {
                setRequestForm({ serviceType: 'Express Contract Redline Audit ($1,500)', notes: '', urgency: 'Standard (48 Hours)' });
                setIsRequestModalOpen(true);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all"
            >
              Order Contract Audit
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div>
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold rounded-full">Formal Counsel</span>
              <h3 className="text-base font-bold text-white mt-2">EU AI Act Model Certification</h3>
              <p className="text-xs text-slate-400 mt-1">Formal Legal Counsel Opinion Letter certifying high-risk LLM/AI model transparency, watermarks, and datasets.</p>
              <div className="text-lg font-extrabold text-white mt-3">$3,500 <span className="text-xs font-normal text-slate-400">/ model release</span></div>
            </div>
            <button
              onClick={() => {
                setRequestForm({ serviceType: 'EU AI Act Model Certification ($3,500)', notes: '', urgency: 'High (24 Hours)' });
                setIsRequestModalOpen(true);
              }}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-all"
            >
              Order Model Opinion
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full">Emergency Defense</span>
              <h3 className="text-base font-bold text-white mt-2">Fine & Regulatory Appeal Brief</h3>
              <p className="text-xs text-slate-400 mt-1">Immediate defense brief filing to EDPB, BfDI, AEPD or CNIL to mitigate statutory fine notifications.</p>
              <div className="text-lg font-extrabold text-white mt-3">$5,000 <span className="text-xs font-normal text-slate-400">/ appeal brief</span></div>
            </div>
            <button
              onClick={() => {
                setRequestForm({ serviceType: 'Fine & Regulatory Appeal Brief ($5,000)', notes: '', urgency: 'Urgent (12 Hours)' });
                setIsRequestModalOpen(true);
              }}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-all"
            >
              Order Defense Brief
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: RETAINER INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Retainer & ALSP Billable Invoices
            </h3>

            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-xs">{inv.invoiceNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">{inv.serviceDescription}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Due {inv.dueDate}</div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-base font-extrabold text-white">{inv.amount.toLocaleString()} {inv.currency || 'EUR'}</span>
                    {inv.status !== 'PAID' && (
                      <button
                        onClick={() => handlePayInvoice(inv.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
                      >
                        Pay Invoice
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REQUEST ALSP MODAL */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Order ALSP Legal Service
                </h3>
                <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSubmitServiceRequest} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Select Legal Service</label>
                  <select
                    value={requestForm.serviceType}
                    onChange={e => setRequestForm(f => ({ ...f, serviceType: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Express Contract Redline Audit ($1,500)">Express Contract Redline Audit ($1,500)</option>
                    <option value="EU AI Act Model Certification ($3,500)">EU AI Act Model Certification ($3,500)</option>
                    <option value="Fine & Regulatory Appeal Brief ($5,000)">Fine & Regulatory Appeal Brief ($5,000)</option>
                    <option value="Sovereign Cross-Border DPA Drafting ($2,000)">Sovereign Cross-Border DPA Drafting ($2,000)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Service Urgency / SLA</label>
                  <select
                    value={requestForm.urgency}
                    onChange={e => setRequestForm(f => ({ ...f, urgency: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Standard (48 Hours)">Standard (48 Hours)</option>
                    <option value="High Priority (24 Hours)">High Priority (24 Hours)</option>
                    <option value="Urgent Incident (12 Hours)">Urgent Incident (12 Hours)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Specific Instructions / Scope Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Describe specific contract clauses, AI models, or regulatory concerns..."
                    value={requestForm.notes}
                    onChange={e => setRequestForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg"
                  >
                    Dispatch Request to Counsel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW OPINION MODAL */}
      <AnimatePresence>
        {selectedOpinion && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-400" />
                  {selectedOpinion.title}
                </h3>
                <button onClick={() => setSelectedOpinion(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                <Markdown>{selectedOpinion.content}</Markdown>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedOpinion(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg"
                >
                  Close Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
