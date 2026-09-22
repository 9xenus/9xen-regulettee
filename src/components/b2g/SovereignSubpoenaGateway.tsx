import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Scale, 
  FileCheck2, 
  ShieldCheck, 
  AlertOctagon, 
  Building2, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  ChevronRight, 
  FolderLock,
  Download,
  Gavel
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

interface LegalHold {
  id: string;
  warrant_reference: string;
  court_jurisdiction: string;
  issuing_judge_or_magistrate: string;
  target_entity_or_subject: string;
  legal_basis: string;
  data_scope_requested: string;
  escrow_lock_status: string;
  merkle_hold_receipt: string;
  created_at: string;
}

export const SovereignSubpoenaGateway: React.FC = () => {
  const [holds, setHolds] = useState<LegalHold[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form inputs
  const [warrantRef, setWarrantRef] = useState(`WARR-EU-CJEU-${Date.now().toString().slice(-5)}`);
  const [courtJurisdiction, setCourtJurisdiction] = useState('Court of Justice of the European Union (CJEU)');
  const [issuingJudge, setIssuingJudge] = useState('Magistrate Hon. Klaus V. Mueller');
  const [targetEntity, setTargetEntity] = useState('HyperPay Sovereign FinTech GmbH');
  const [legalBasis, setLegalBasis] = useState('Article 23 GDPR / EU MLAT Mutual Legal Assistance Directive');
  const [dataScope, setDataScope] = useState('Transaction audit trail, HSM key rotation logs, and unhashed processing telemetry for Q2-Q3 2026.');

  const fetchHolds = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/subpoena/holds');
      const data = await res.json();
      if (data.success && Array.isArray(data.holds)) {
        setHolds(data.holds);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolds();
  }, []);

  const handleIssueHold = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/subpoena/issue-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warrant_reference: warrantRef,
          court_jurisdiction: courtJurisdiction,
          issuing_judge_or_magistrate: issuingJudge,
          target_entity_or_subject: targetEntity,
          legal_basis: legalBasis,
          data_scope_requested: dataScope
        })
      });
      const data = await res.json();
      if (data.success) {
        setWarrantRef(`WARR-EU-CJEU-${Date.now().toString().slice(-5)}`);
        fetchHolds();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetchWithRetry(`/api/v1/b2g/subpoena/holds/${id}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escrow_lock_status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchHolds();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Sovereign Subpoena & Legal Hold Escrow Gateway
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase">
                MLAT & CJEU Sealed
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Judicial warrant verification and automated cryptographic data preservation locks for law enforcement requests.
            </p>
          </div>
        </div>

        <button
          onClick={fetchHolds}
          disabled={loading}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Warrants</span>
        </button>
      </div>

      {/* Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Ingest Legal Warrant */}
        <div className="lg:col-span-5 bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FolderLock className="w-3.5 h-3.5 text-purple-400" />
              Ingest Court Order / Subpoena
            </span>
            <span className="text-[11px] font-mono text-purple-400 font-bold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
              Judicial Escrow
            </span>
          </div>

          <form onSubmit={handleIssueHold} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Warrant / Subpoena Reference</label>
              <input
                type="text"
                value={warrantRef}
                onChange={(e) => setWarrantRef(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Issuing Court Jurisdiction</label>
              <input
                type="text"
                value={courtJurisdiction}
                onChange={(e) => setCourtJurisdiction(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Presiding Judge / Magistrate</label>
                <input
                  type="text"
                  value={issuingJudge}
                  onChange={(e) => setIssuingJudge(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Entity / Subject</label>
                <input
                  type="text"
                  value={targetEntity}
                  onChange={(e) => setTargetEntity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Statutory Legal Basis</label>
              <input
                type="text"
                value={legalBasis}
                onChange={(e) => setLegalBasis(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Scope of Preserved Telemetry</label>
              <textarea
                rows={3}
                value={dataScope}
                onChange={(e) => setDataScope(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono text-[11px] focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>{isSubmitting ? 'Engaging Cryptographic Lock...' : 'Execute Judicial Escrow Lock'}</span>
            </button>
          </form>
        </div>

        {/* Right: Active Legal Holds */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-purple-400" />
              Active Judicial Preservation Holds ({holds.length})
            </span>
            <span className="text-[11px] text-slate-500">Immutable Merkle Escrow</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {holds.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs">
                No active judicial holds or subpoena preservation locks registered.
              </div>
            ) : (
              holds.map((h) => (
                <div key={h.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-purple-400 border border-purple-900/40">
                        {h.warrant_reference}
                      </span>
                      <h4 className="text-xs font-bold text-white">{h.target_entity_or_subject}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      h.escrow_lock_status === 'ACTIVE_HOLD'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : h.escrow_lock_status === 'DATA_DISPATCHED'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {h.escrow_lock_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg font-mono text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Issuing Magistrate</span>
                      <span className="text-slate-200">{h.issuing_judge_or_magistrate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Court Jurisdiction</span>
                      <span className="text-indigo-400 font-semibold">{h.court_jurisdiction}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded border border-slate-800/60 space-y-1">
                    <span className="text-slate-500 font-bold block text-[10px]">Scope Preserved:</span>
                    <p className="font-mono text-slate-300">{h.data_scope_requested}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] border-t border-slate-800/60">
                    <span className="text-slate-500 font-mono truncate max-w-[240px]">
                      Receipt: {h.merkle_hold_receipt}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {h.escrow_lock_status === 'ACTIVE_HOLD' && (
                        <button
                          onClick={() => handleUpdateStatus(h.id, 'DATA_DISPATCHED')}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Dispatch to Judge
                        </button>
                      )}
                      {h.escrow_lock_status !== 'LIFTED' && (
                        <button
                          onClick={() => handleUpdateStatus(h.id, 'LIFTED')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Lift Lock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
