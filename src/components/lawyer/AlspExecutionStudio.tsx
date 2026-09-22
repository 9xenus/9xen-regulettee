import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Download, 
  Copy, 
  Loader2, 
  Scale, 
  FileCheck, 
  DollarSign, 
  Building2,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  ShieldCheck,
  Zap,
  Edit3,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { jsPDF } from 'jspdf';

export const AlspExecutionStudio: React.FC<{
  selectedClient?: any;
  triggerToast?: (msg: string) => void;
}> = ({ selectedClient, triggerToast }) => {
  const [activeTab, setActiveTab] = useState<'redline' | 'opinion' | 'invoicing'>('redline');

  // Contract Redline States
  const [contractTitle, setContractTitle] = useState('Master Cloud & AI Sub-processor Service Agreement');
  const [contractText, setContractText] = useState(`Section 4.1: Vendor shall provide tenant isolated database clusters in Frankfurt.
Section 4.2: Vendor may process and retain customer telemetry data to train internal generative AI models without prior notification.
Section 8.1: Vendor shall execute security risk assessments annually.
Section 9.1: Total liability for data breach or loss under this agreement shall be capped at $1,000 USD.`);
  const [redlineRegulations, setRedlineRegulations] = useState('EU AI Act Article 52, GDPR Article 28, DORA ICT Resilience');
  const [isRedlining, setIsRedlining] = useState(false);
  const [redlineResult, setRedlineResult] = useState<{
    riskScore: number;
    overallAssessment: string;
    clauseRedlines: Array<{
      clauseNumber: string;
      originalClause: string;
      proposedRedline: string;
      riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      reasoning: string;
    }>;
  } | null>(null);

  // Opinion Letter States
  const [targetClientName, setTargetClientName] = useState(selectedClient?.companyName || 'Acme Corp Europe');
  const [jurisdiction, setJurisdiction] = useState('European Union');
  const [regulationScope, setRegulationScope] = useState('EU AI Act Article 52 & GDPR Article 28');
  const [issueSummary, setIssueSummary] = useState('Audit of synthetic video render pipeline and cross-border telemetry caching nodes in Frankfurt and Virginia.');
  const [partnerCounselName, setPartnerCounselName] = useState('Elena Vance, Managing Legal Partner');
  const [isGeneratingOpinion, setIsGeneratingOpinion] = useState(false);
  const [generatedOpinion, setGeneratedOpinion] = useState<string>('');

  // Invoicing States
  const [invoiceForm, setInvoiceForm] = useState({
    clientName: selectedClient?.companyName || 'Acme Corp Europe',
    invoiceNumber: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
    serviceDescription: 'Monthly Enterprise ALSP Retainer & Express Contract Redline Audit',
    amount: 7500,
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });

  const [invoices, setInvoices] = useState<any[]>(() => {
    const saved = localStorage.getItem('9xen-regulettee_billable_invoices');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) { console.error(e); }
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
        status: 'PAID'
      },
      {
        id: 'inv-102',
        invoiceNumber: 'INV-2026-8802',
        clientName: 'Fintech Nexus Ltd',
        amount: 15000,
        serviceDescription: 'DORA Operational Resilience Emergency Audit & Defense Brief',
        issuedAt: '2026-08-10',
        dueDate: '2026-09-10',
        status: 'SENT'
      }
    ];
  });

  useEffect(() => {
    if (selectedClient) {
      setTargetClientName(selectedClient.companyName);
      setInvoiceForm(f => ({ ...f, clientName: selectedClient.companyName }));
    }
  }, [selectedClient]);

  useEffect(() => {
    localStorage.setItem('9xen-regulettee_billable_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const handleRunRedline = async () => {
    setIsRedlining(true);
    try {
      const res = await fetch('/api/v1/lawyer-intelligence/redline-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractTitle,
          originalText: contractText,
          targetRegulations: redlineRegulations
        })
      });
      const data = await res.json();
      if (data.success) {
        setRedlineResult({
          riskScore: data.riskScore,
          overallAssessment: data.overallAssessment,
          clauseRedlines: data.clauseRedlines
        });
        if (triggerToast) triggerToast('Contract Redline Audit completed!');
      }
    } catch (err) {
      console.error(err);
      if (triggerToast) triggerToast('Error executing contract redline analysis.');
    } finally {
      setIsRedlining(false);
    }
  };

  const handleGenerateOpinionLetter = async () => {
    setIsGeneratingOpinion(true);
    try {
      const res = await fetch('/api/v1/lawyer-intelligence/generate-opinion-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: targetClientName,
          jurisdiction,
          regulationScope,
          issueSummary,
          partnerCounselName
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedOpinion(data.opinionLetter);
        if (triggerToast) triggerToast('Formal Legal Opinion Letter synthesized!');
      }
    } catch (err) {
      console.error(err);
      if (triggerToast) triggerToast('Error generating opinion letter.');
    } finally {
      setIsGeneratingOpinion(false);
    }
  };

  const handleDispatchOpinionToClient = () => {
    if (!generatedOpinion) return;
    const existing = JSON.parse(localStorage.getItem('9xen-regulettee_opinion_letters') || '[]');
    const newOpinion = {
      id: 'op-' + Date.now(),
      clientName: targetClientName,
      title: `Formal Legal Counsel Opinion: ${regulationScope}`,
      content: generatedOpinion,
      issuedAt: new Date().toISOString().split('T')[0],
      counselName: partnerCounselName,
      status: 'VERIFIED_OFFICIAL'
    };
    localStorage.setItem('9xen-regulettee_opinion_letters', JSON.stringify([newOpinion, ...existing]));
    if (triggerToast) triggerToast(`Opinion Letter dispatched directly to ${targetClientName}'s Client Vault & Portal!`);
  };

  const handleIssueInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv = {
      id: 'inv-' + Date.now(),
      invoiceNumber: invoiceForm.invoiceNumber,
      clientName: invoiceForm.clientName,
      amount: Number(invoiceForm.amount),
      serviceDescription: invoiceForm.serviceDescription,
      issuedAt: new Date().toISOString().split('T')[0],
      dueDate: invoiceForm.dueDate,
      status: 'SENT'
    };
    setInvoices(prev => [newInv, ...prev]);
    if (triggerToast) triggerToast(`Invoice ${newInv.invoiceNumber} dispatched to ${newInv.clientName}!`);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Subtabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('redline')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'redline'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>AI Contract Redline Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('opinion')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'opinion'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Formal Legal Opinion Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('invoicing')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'invoicing'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>ALSP Retainer Invoicing Desk</span>
          </button>
        </div>

        {selectedClient && (
          <div className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg flex items-center space-x-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Active Target Client: <strong>{selectedClient.companyName}</strong></span>
          </div>
        )}
      </div>

      {/* TAB 1: AI CONTRACT REDLINE STUDIO */}
      {activeTab === 'redline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Contract Analysis Inputs
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contract Title</label>
              <input
                type="text"
                value={contractTitle}
                onChange={e => setContractTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Regulatory Frameworks</label>
              <input
                type="text"
                value={redlineRegulations}
                onChange={e => setRedlineRegulations(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contract Text / Clauses Snippet</label>
              <textarea
                rows={10}
                value={contractText}
                onChange={e => setContractText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleRunRedline}
              disabled={isRedlining}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isRedlining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing AI Clause Analysis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Contract Redline Audit</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Redline Audit Output & Clause Replacements
            </h3>

            {redlineResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <div className="text-xs text-slate-400">Contract Safety Score</div>
                    <div className={`text-2xl font-extrabold ${
                      redlineResult.riskScore >= 80 ? 'text-emerald-400' : redlineResult.riskScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {redlineResult.riskScore} / 100
                    </div>
                  </div>
                  <div className="text-right max-w-xs text-xs text-slate-300">
                    {redlineResult.overallAssessment}
                  </div>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {redlineResult.clauseRedlines.map((red, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400">{red.clauseNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          red.riskLevel === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          red.riskLevel === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {red.riskLevel} RISK
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-lg line-through">
                        <span className="text-rose-300 font-semibold block text-[10px] uppercase">Original Clause:</span>
                        {red.originalClause}
                      </div>

                      <div className="text-xs text-emerald-300 bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-lg">
                        <span className="text-emerald-400 font-semibold block text-[10px] uppercase">Proposed Redline:</span>
                        {red.proposedRedline}
                      </div>

                      <div className="text-[11px] text-slate-400 italic">
                        <strong>Reasoning:</strong> {red.reasoning}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <Edit3 className="w-8 h-8 text-slate-600 mb-2" />
                Input contract text on the left and click "Run AI Contract Redline Audit" to generate inline clause modifications.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FORMAL LEGAL OPINION GENERATOR */}
      {activeTab === 'opinion' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              Opinion Letter Parameters
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Client Name</label>
              <input
                type="text"
                value={targetClientName}
                onChange={e => setTargetClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Jurisdiction</label>
                <input
                  type="text"
                  value={jurisdiction}
                  onChange={e => setJurisdiction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Regulation Scope</label>
                <input
                  type="text"
                  value={regulationScope}
                  onChange={e => setRegulationScope(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Issue / Fact Summary</label>
              <textarea
                rows={4}
                value={issueSummary}
                onChange={e => setIssueSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Managing Counsel Signature Name</label>
              <input
                type="text"
                value={partnerCounselName}
                onChange={e => setPartnerCounselName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleGenerateOpinionLetter}
              disabled={isGeneratingOpinion}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isGeneratingOpinion ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Legal Opinion...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize Official Legal Opinion</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Synthesized Formal Opinion Document
              </h3>

              {generatedOpinion && (
                <button
                  onClick={handleDispatchOpinionToClient}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch to Client Portal</span>
                </button>
              )}
            </div>

            {generatedOpinion ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-xs text-slate-200 space-y-3 max-h-[520px] overflow-y-auto font-sans leading-relaxed">
                <Markdown>{generatedOpinion}</Markdown>
              </div>
            ) : (
              <div className="h-64 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <Scale className="w-8 h-8 text-slate-600 mb-2" />
                Fill in the opinion parameters and click "Synthesize Official Legal Opinion" to generate a complete legal opinion letter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ALSP RETAINER INVOICING DESK */}
      {activeTab === 'invoicing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Issue Billable Legal Invoice
            </h3>

            <form onSubmit={handleIssueInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Client</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.clientName}
                  onChange={e => setInvoiceForm(f => ({ ...f, clientName: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.invoiceNumber}
                  onChange={e => setInvoiceForm(f => ({ ...f, invoiceNumber: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Service Line Description</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.serviceDescription}
                  onChange={e => setInvoiceForm(f => ({ ...f, serviceDescription: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.amount}
                    onChange={e => setInvoiceForm(f => ({ ...f, amount: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.dueDate}
                    onChange={e => setInvoiceForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-md mt-2"
              >
                Issue Invoice to Client Portal
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Issued Retainer Invoices Ledger
            </h3>

            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-xs">{inv.invoiceNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">{inv.clientName} • {inv.serviceDescription}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Issued {inv.issuedAt} • Due {inv.dueDate}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-white">${inv.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
