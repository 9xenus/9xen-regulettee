import React, { useState, useEffect } from 'react';
import { 
  FileCheck, Plus, CheckCircle2, Shield, AlertTriangle, 
  Download, Globe, ExternalLink, RefreshCw, X, Sparkles, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DpaContract {
  id: string;
  partnerName: string;
  partnerType: string;
  jurisdiction: string;
  art28Compliant: boolean;
  sccClausesIncluded: string;
  annexITomScore: number;
  auditRightEnforced: boolean;
  signedDate: string;
  renewalDate: string;
  status: string;
  subProcessorsCount: number;
}

export const DpaContractManager: React.FC = () => {
  const [dpas, setDpas] = useState<DpaContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedDpa, setSelectedDpa] = useState<DpaContract | null>(null);

  // New DPA Form State
  const [partnerName, setPartnerName] = useState('');
  const [partnerType, setPartnerType] = useState('Sub-Processor (SaaS Provider)');
  const [jurisdiction, setJurisdiction] = useState('Germany (EU Sovereign)');
  const [subProcessorsCount, setSubProcessorsCount] = useState('3');

  const fetchDpas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/privacy-suite/dpas');
      const data = await res.json();
      if (data.success) setDpas(data.contracts);
    } catch (e) {
      console.error('Failed to load DPAs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDpas();
  }, []);

  const handleGenerateDpa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/privacy-suite/dpas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName,
          partnerType,
          jurisdiction,
          subProcessorsCount
        })
      });
      const data = await res.json();
      if (data.success) {
        setDpas([data.contract, ...dpas]);
        setShowGenModal(false);
        setPartnerName('');
      }
    } catch (err) {
      console.error('Failed to generate DPA', err);
    }
  };

  const exportDpaJson = (dpa: DpaContract) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dpa, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${dpa.id}_${dpa.partnerName.replace(/\s+/g, '_')}_DPA.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              GDPR Article 28 (AVV / DPA)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Annex I & II Pre-Filled
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-indigo-600" />
            Data Processing Agreement (DPA / AVV) Intelligence Hub
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Standard Contractual Clauses (SCC), sub-processor authorization chains, and automated Article 28 compliance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGenModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Generate Compliant DPA
          </button>
        </div>
      </div>

      {/* DPAs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dpas.map((dpa) => (
          <div
            key={dpa.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  {dpa.id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Art. 28 Compliant
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-3">{dpa.partnerName}</h3>
              <span className="text-slate-500 text-[11px] font-medium block mt-0.5">{dpa.partnerType}</span>

              <div className="bg-slate-50 rounded-xl p-3 mt-3 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Jurisdiction:</span>
                  <span className="text-slate-800 font-semibold">{dpa.jurisdiction}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Annex II TOM Score:</span>
                  <span className="text-emerald-700 font-bold">{dpa.annexITomScore}% Attested</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Sub-processors:</span>
                  <span className="text-indigo-700 font-bold">{dpa.subProcessorsCount} Authorized</span>
                </div>
                <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200 font-mono">
                  <span className="text-slate-400 block font-sans font-bold">Transfer Mechanism:</span>
                  {dpa.sccClausesIncluded}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-[10px] text-slate-400 font-mono">
                Renewal: {dpa.renewalDate}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedDpa(dpa)}
                  className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  View Annexes
                </button>
                <button
                  onClick={() => exportDpaJson(dpa)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                  title="Download DPA Agreement"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: View Annex Details */}
      <AnimatePresence>
        {selectedDpa && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600">{selectedDpa.id} DPA Specification</span>
                  <h3 className="text-base font-bold text-slate-900">{selectedDpa.partnerName}</h3>
                </div>
                <button
                  onClick={() => setSelectedDpa(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block text-xs">Annex I: Description of Processing & Transfer</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Categories of data subjects: Customers, prospective leads, and employees. Personal data types include telemetry identifiers, names, work emails, and system logs. Retention is aligned with Article 5(1)(e) storage limitation.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block text-xs">Annex II: Technical & Organizational Measures (TOMs)</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Full AES-256 encryption at rest, TLS 1.3 in transit, role-based access control with MFA, automated vulnerability scanning, and audited 24-hour breach notification SLA.
                  </p>
                </div>

                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 space-y-1">
                  <span className="font-bold text-indigo-900 block text-xs">Auditor Verification & Right of Inspection (Art. 28(3)(h))</span>
                  <p className="text-indigo-800 text-[11px] leading-relaxed">
                    Controller reserves unconditional rights to conduct on-site or digital third-party compliance audits with 14 business days prior written notice.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedDpa(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Generate New DPA */}
      <AnimatePresence>
        {showGenModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Generate Bilateral GDPR DPA Agreement
                </h3>
                <button
                  onClick={() => setShowGenModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGenerateDpa} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contractor / Sub-Processor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Datadog Germany GmbH"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-medium focus:border-indigo-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Type</label>
                  <input
                    type="text"
                    value={partnerType}
                    onChange={(e) => setPartnerType(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-medium focus:border-indigo-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jurisdiction / Cloud Region</label>
                    <input
                      type="text"
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg font-medium focus:border-indigo-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sub-Processors in Chain</label>
                    <input
                      type="number"
                      value={subProcessorsCount}
                      onChange={(e) => setSubProcessorsCount(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg font-medium focus:border-indigo-400 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowGenModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
                  >
                    Generate & Sign DPA
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
