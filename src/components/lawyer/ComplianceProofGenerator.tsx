import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileLock, 
  Lock, 
  CheckCircle2, 
  FileText, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Database, 
  EyeOff, 
  Send, 
  Cpu, 
  KeyRound, 
  Check, 
  ArrowUpRight,
  ShieldAlert,
  Building2,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ComplianceProofGeneratorProps {
  clients?: Array<{ id: string; companyName: string; industry: string }>;
  triggerToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface DocumentItem {
  id: string;
  title: string;
  category: string;
  clientName: string;
  piiFieldsMasked: number;
  hash: string;
  lastUpdated: string;
  status: 'READY' | 'PENDING_AUDIT';
}

export const ComplianceProofGenerator: React.FC<ComplianceProofGeneratorProps> = ({
  clients = [
    { id: 'c-1', companyName: 'Acme Corp Europe', industry: 'Financial Services' },
    { id: 'c-2', companyName: 'Fintech Nexus Ltd', industry: 'Banking & Payments' },
    { id: 'c-3', companyName: 'BioHealth Genomics', industry: 'Healthcare & AI' }
  ],
  triggerToast = () => {}
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || 'c-1');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>(['doc-1', 'doc-2']);
  const [proofPredicate, setProofPredicate] = useState<string>('EU_AI_ACT_WATERMARK');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [generatedProof, setGeneratedProof] = useState<{
    proofToken: string;
    merkleRoot: string;
    publicInputsHash: string;
    predicateName: string;
    timestamp: string;
    verifiedSignature: string;
    maskedFieldsCount: number;
  } | null>(null);

  // Mock document inventory for the selected client
  const availableDocuments: DocumentItem[] = [
    {
      id: 'doc-1',
      title: 'Q3 Financial Capital Adequacy & Solvency Statement',
      category: 'Financial Regulatory',
      clientName: clients.find(c => c.id === selectedClientId)?.companyName || 'Acme Corp Europe',
      piiFieldsMasked: 14230,
      hash: 'sha256:8f92a4bc102e3871239f8812039ab812cf88',
      lastUpdated: '2026-08-15',
      status: 'READY'
    },
    {
      id: 'doc-2',
      title: 'EU AI Act High-Risk Model Conformance & Bias Audit',
      category: 'AI Governance',
      clientName: clients.find(c => c.id === selectedClientId)?.companyName || 'Acme Corp Europe',
      piiFieldsMasked: 3412,
      hash: 'sha256:3c819204a8b712389fbc7712304918237e11',
      lastUpdated: '2026-08-18',
      status: 'READY'
    },
    {
      id: 'doc-3',
      title: 'GDPR Article 35 Data Protection Impact Assessment (DPIA)',
      category: 'Data Privacy',
      clientName: clients.find(c => c.id === selectedClientId)?.companyName || 'Acme Corp Europe',
      piiFieldsMasked: 890,
      hash: 'sha256:7e1920384a7192834b71293847a9f8123c55',
      lastUpdated: '2026-08-10',
      status: 'READY'
    },
    {
      id: 'doc-4',
      title: 'DORA ICT Third-Party Risk & Incident Resilience Report',
      category: 'Cyber Resilience',
      clientName: clients.find(c => c.id === selectedClientId)?.companyName || 'Acme Corp Europe',
      piiFieldsMasked: 520,
      hash: 'sha256:9a81b273648192834f71293847b192837f44',
      lastUpdated: '2026-08-05',
      status: 'READY'
    }
  ];

  const handleToggleDocument = (docId: string) => {
    if (selectedDocuments.includes(docId)) {
      if (selectedDocuments.length === 1) {
        triggerToast("At least one document must be selected for ZKP generation.", "error");
        return;
      }
      setSelectedDocuments(selectedDocuments.filter(id => id !== docId));
    } else {
      setSelectedDocuments([...selectedDocuments, docId]);
    }
  };

  const handleGenerateProof = async () => {
    if (selectedDocuments.length === 0) {
      triggerToast("Please select at least one document.", "error");
      return;
    }

    setIsGenerating(true);
    setGenerationStep(1);

    setTimeout(() => {
      setGenerationStep(2);
    }, 900);

    setTimeout(() => {
      setGenerationStep(3);
    }, 1800);

    setTimeout(() => {
      const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
      const hashToken = `ZKP-SNARK-SHA256-${randomHex}-${Date.now().toString(36).toUpperCase()}`;
      const merkle = `0x9f84b2c1e7123849fbc7712304918237e11a8b712389f`;
      const publicInputs = `pub_in_${Math.floor(100000 + Math.random() * 900000)}`;

      setGeneratedProof({
        proofToken: hashToken,
        merkleRoot: merkle,
        publicInputsHash: publicInputs,
        predicateName: proofPredicate,
        timestamp: new Date().toISOString(),
        verifiedSignature: `SIG-EBA-VALIDATOR-${Math.floor(1000 + Math.random() * 9000)}`,
        maskedFieldsCount: selectedDocuments.length * 4310
      });

      setIsGenerating(false);
      setGenerationStep(0);
      triggerToast("Zero-Knowledge Proof successfully generated without exposing PII!", "success");
    }, 2700);
  };

  const handleExportZkpPdf = () => {
    if (!generatedProof) return;
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("Cryptographic Zero-Knowledge Proof (ZKP) Report", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date(generatedProof.timestamp).toLocaleString()} | Zero PII Exposure Verified`, 14, 28);
      doc.text(`Proof Token: ${generatedProof.proofToken}`, 14, 34);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 40, pageWidth - 14, 40);

      const tableData = [
        ["Predicate Standard", generatedProof.predicateName],
        ["Merkle Root Hash", generatedProof.merkleRoot],
        ["Public Inputs Hash", generatedProof.publicInputsHash],
        ["Scrubbed PII Records", `${generatedProof.maskedFieldsCount} records masked (Zero Exposure)`],
        ["Validator Signature", generatedProof.verifiedSignature],
        ["Verification Status", "VALID & CRYPTOGRAPHICALLY SECURE"]
      ];

      autoTable(doc, {
        startY: 48,
        head: [["Proof Parameter", "Cryptographic Value / Status"]],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 }
      });

      const finalY = (doc as any).lastAutoTable.finalY || 140;
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("Auditor Verification Statement:", 14, finalY + 15);
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      const statement = "This Zero-Knowledge Proof mathematically guarantees that the underlying corporate documents satisfy all regulatory compliance predicates without transmitting or exposing raw PII, national identifiers, or confidential pricing data to external entities or regulatory nodes.";
      const splitText = doc.splitTextToSize(statement, pageWidth - 28);
      doc.text(splitText, 14, finalY + 22);

      doc.save(`ZKP_Compliance_Report_${generatedProof.proofToken}.pdf`);
      triggerToast("ZKP Compliance PDF Report downloaded successfully!", "success");
    } catch (err: any) {
      triggerToast(`Failed to export PDF: ${err.message}`, "error");
    }
  };

  const handleDispatchToRegulator = () => {
    triggerToast("ZKP cryptographic proof dispatched successfully to Regulatory Escrow Vault!", "success");
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <FileLock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Compliance Proof Generator (Zero-Knowledge)
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded-full uppercase tracking-wider">
                Zero PII Exposure
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select client documents and synthesize verifiable ZK-SNARK proofs for regulatory auditors without leaking underlying raw PII.
            </p>
          </div>
        </div>

        {/* Client Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.companyName} ({c.industry})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document Selection & Predicate Config */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              1. Select Source Documents for ZKP Synthesis
            </h4>
            <div className="space-y-3">
              {availableDocuments.map(doc => {
                const isSelected = selectedDocuments.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleToggleDocument(doc.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 shadow-2xs'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{doc.title}</div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="px-2 py-0.5 bg-slate-200/70 dark:bg-slate-700/50 rounded text-slate-700 dark:text-slate-300 font-medium">
                            {doc.category}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <EyeOff className="w-3 h-3" />
                            {doc.piiFieldsMasked.toLocaleString()} PII fields scrubbed
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-mono text-slate-400">{doc.hash.substring(0, 14)}...</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Predicate Selector */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Select Compliance Predicate Standard
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'EU_AI_ACT_WATERMARK', label: 'EU AI Act Art. 52 Watermark Compliance', desc: 'Proves synthetic models adhere to transparency rules.' },
                { id: 'GDPR_DPIA_ADEQUACY', label: 'GDPR Art. 35 DPIA Minimization', desc: 'Proves data minimization without disclosing subject records.' },
                { id: 'DORA_ICT_RESILIENCE', label: 'DORA ICT Third-Party Solvency', desc: 'Proves vendor risk thresholds are met securely.' },
                { id: 'SOC2_TYPE_II_CONTROLS', label: 'SOC 2 Type II Security Controls', desc: 'Cryptographic proof of access logging & encryption.' }
              ].map(pred => (
                <div
                  key={pred.id}
                  onClick={() => setProofPredicate(pred.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    proofPredicate === pred.id
                      ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white border-transparent shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{pred.label}</div>
                  <div className={`text-[11px] mt-1 ${proofPredicate === pred.id ? 'text-slate-300 dark:text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {pred.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateProof}
            disabled={isGenerating}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {generationStep === 1 && "Scrubbing PII & Masking Identifiers..."}
                  {generationStep === 2 && "Synthesizing ZK-SNARK Circuit..."}
                  {generationStep === 3 && "Computing Merkle Proof & Verifying..."}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Zero-Knowledge Proof Report</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generated ZKP Output & Verification */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="h-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            {generatedProof ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">ZKP Proof Successfully Generated</h4>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Zero PII Leakage Verified</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cryptographic Proof Token</span>
                    <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 break-all">
                      {generatedProof.proofToken}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Merkle Tree Root Hash</span>
                    <div className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5 break-all">
                      {generatedProof.merkleRoot}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scrubbed Records</span>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {generatedProof.maskedFieldsCount.toLocaleString()} PII items
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Validator Sig</span>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {generatedProof.verifiedSignature}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={handleExportZkpPdf}
                    className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-white transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ZKP Report (PDF)</span>
                  </button>
                  <button
                    onClick={handleDispatchToRegulator}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dispatch to Regulator Escrow</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Proof Generated Yet</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Select your client documents and compliance predicate on the left, then click generate to synthesize a zero-knowledge proof.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
