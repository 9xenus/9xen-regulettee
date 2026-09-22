import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Scale, FileCheck2, AlertTriangle, Building2, 
  Send, RefreshCw, CheckCircle2, ChevronRight, FileText, Download, 
  Gavel, Key, Sparkles, Clock, Globe, ShieldAlert, Zap, Cpu, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';
import { ComplianceDeltaAuditor } from './ComplianceDeltaAuditor';

interface SubpoenaRequest {
  id: string;
  warrantRef: string;
  authority: string;
  jurisdiction: string;
  legalBasis: string;
  proportionalityScore: number;
  blockingStatuteStatus: 'COMPLIANT' | 'REJECTED_EXTRATERRITORIAL' | 'LEGAL_HOLD_ESCROW';
  timestamp: string;
  hash: string;
}

interface WhistleblowerReport {
  id: string;
  encryptedSubject: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  statutorySlaDaysLeft: number;
  status: 'ACKNOWLEDGEMENT_SENT' | 'INVESTIGATION_ACTIVE' | 'RESOLVED_FORENSIC';
  hash: string;
  submittedAt: string;
}

interface StatutoryFiling {
  id: string;
  regulatoryBody: string;
  framework: 'EU_AI_ACT' | 'DORA' | 'NIS2' | 'CTC_E_INVOICE' | 'GDPR_ART30';
  format: 'JSON_LD' | 'XBRL' | 'PDF_A3';
  status: 'DISPATCHED_MTLS' | 'VERIFIED_EDPB' | 'PENDING_ACK';
  timestamp: string;
  sha256: string;
}

export const SovereignComplianceHub: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'SUBPOENA' | 'WHISTLEBLOWER' | 'DISPATCH' | 'PENALTY_CLEARING' | 'DELTA_AUDITOR'>('SUBPOENA');

  // Subpoena Requests Data
  const [subpoenas, setSubpoenas] = useState<SubpoenaRequest[]>([
    {
      id: 'SUB-2026-001',
      warrantRef: 'WARR-CJEU-98214',
      authority: 'Court of Justice of the European Union (CJEU)',
      jurisdiction: 'EU / Germany (BfDI)',
      legalBasis: 'Art. 23 GDPR / EU MLAT Mutual Legal Assistance',
      proportionalityScore: 94,
      blockingStatuteStatus: 'LEGAL_HOLD_ESCROW',
      timestamp: '2026-08-18T14:20:00Z',
      hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    {
      id: 'SUB-2026-002',
      warrantRef: 'US-DOJ-SUB-7712',
      authority: 'US Dept of Justice (Foreign Subpoena)',
      jurisdiction: 'USA (Extraterritorial Request)',
      legalBasis: 'US CLOUD Act Warrant',
      proportionalityScore: 18,
      blockingStatuteStatus: 'REJECTED_EXTRATERRITORIAL',
      timestamp: '2026-08-17T09:15:00Z',
      hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
    }
  ]);

  // Whistleblower Reports Data
  const [whistleblowers, setWhistleblowers] = useState<WhistleblowerReport[]>([
    {
      id: 'WB-HINSCHG-901',
      encryptedSubject: 'RSA-4096 Encrypted: [Financial Data Retention Anomaly]',
      severity: 'CRITICAL',
      statutorySlaDaysLeft: 5,
      status: 'ACKNOWLEDGEMENT_SENT',
      hash: 'a9f23e81b3780c10247c4129',
      submittedAt: '2026-08-16T11:00:00Z'
    },
    {
      id: 'WB-HINSCHG-902',
      encryptedSubject: 'RSA-4096 Encrypted: [Supplier DPA Compliance Omission]',
      severity: 'HIGH',
      statutorySlaDaysLeft: 68,
      status: 'INVESTIGATION_ACTIVE',
      hash: '5d41402abc4b2a76b9719d911017c592',
      submittedAt: '2026-08-01T16:30:00Z'
    }
  ]);

  // Statutory Filings Data
  const [filings, setFilings] = useState<StatutoryFiling[]>([
    {
      id: 'FIL-2026-881',
      regulatoryBody: 'ENISA & BaFin (Germany)',
      framework: 'DORA',
      format: 'XBRL',
      status: 'VERIFIED_EDPB',
      timestamp: '2026-08-18T10:00:00Z',
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    },
    {
      id: 'FIL-2026-882',
      regulatoryBody: 'EU AI Office (Brussels)',
      framework: 'EU_AI_ACT',
      format: 'JSON_LD',
      status: 'DISPATCHED_MTLS',
      timestamp: '2026-08-18T12:45:00Z',
      sha256: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b'
    }
  ]);

  // Subpoena Form
  const [warrantRef, setWarrantRef] = useState('WARR-CJEU-98215');
  const [issuingAuthority, setIssuingAuthority] = useState('Bundesbeauftragte für den Datenschutz (BfDI)');
  const [legalBasisText, setLegalBasisText] = useState('GDPR Article 58 / Federal Data Protection Act (BDSG)');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleEvaluateSubpoena = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);

    setTimeout(() => {
      const isExtraterritorial = issuingAuthority.toLowerCase().includes('us') || issuingAuthority.toLowerCase().includes('foreign');
      const score = isExtraterritorial ? 22 : 91;
      const status = isExtraterritorial ? 'REJECTED_EXTRATERRITORIAL' : 'LEGAL_HOLD_ESCROW';

      const newSubpoena: SubpoenaRequest = {
        id: `SUB-2026-00${subpoenas.length + 1}`,
        warrantRef,
        authority: issuingAuthority,
        jurisdiction: isExtraterritorial ? 'USA (Foreign Request)' : 'EU (Member State)',
        legalBasis: legalBasisText,
        proportionalityScore: score,
        blockingStatuteStatus: status,
        timestamp: new Date().toISOString(),
        hash: `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      };

      setSubpoenas([newSubpoena, ...subpoenas]);
      setIsEvaluating(false);

      if (isExtraterritorial) {
        showToast(`CRITICAL: Subpoena REJECTED under EU Blocking Statute (EC 2271/96). Extraterritorial request blocked.`, 'warning');
      } else {
        showToast(`Subpoena verified & proportionality score ${score}%. Legal Hold Escrow engaged.`, 'success');
      }
    }, 1200);
  };

  const exportForensicCertificate = (id: string) => {
    showToast(`Generating PDF Forensic Audit Certificate for ${id}...`, 'info');
    setTimeout(() => {
      showToast(`Forensic Certificate downloaded with cryptographic proof stamp.`, 'success');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Scale className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Sovereign B2G Compliance HQ
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> EU Blocking Statute EC 2271/96 Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Sovereign B2G Compliance & Enforcement Matrix
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl">
              Advanced Business-to-Government (B2G) compliance engine: Zero-knowledge subpoena verification, HinSchG encrypted whistleblower protection, mTLS statutory filing dispatch, and automated regulatory fine clearing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => showToast('Synchronizing Member State regulatory webhooks...', 'info')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync Regulatory Clearing</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Subpoenas Evaluated</span>
            <span className="text-lg font-black text-white mt-1 block">{subpoenas.length} Active</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">EU Blocking Protection</span>
            <span className="text-lg font-black text-emerald-400 mt-1 block">100% Shielded</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">HinSchG Whistleblower Vault</span>
            <span className="text-lg font-black text-indigo-400 mt-1 block">RSA-4096 / 0 Breaches</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">mTLS Statutory Filings</span>
            <span className="text-lg font-black text-emerald-400 mt-1 block">{filings.length} Verified</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1 bg-white p-1.5 rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('SUBPOENA')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'SUBPOENA'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>ZKP Subpoena & Proportionality Engine</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('WHISTLEBLOWER')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'WHISTLEBLOWER'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>HinSchG Encrypted Whistleblower Vault</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DISPATCH')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'DISPATCH'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>mTLS Multi-Authority Filing Dispatch</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PENALTY_CLEARING')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'PENALTY_CLEARING'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Penalty Escrow & Sanctions Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DELTA_AUDITOR')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'DELTA_AUDITOR'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Compliance Delta Auditor</span>
        </button>
      </div>

      {/* SUBPOENA & PROPORTIONALITY ENGINE */}
      {activeTab === 'SUBPOENA' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-indigo-600" />
                  Legal Subpoena & Warrant Proportionality Evaluation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Validates incoming government warrants against EU Blocking Statute (EC 2271/96) and GDPR Article 48.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Warrant Ref</th>
                    <th className="py-3 px-4">Issuing Authority</th>
                    <th className="py-3 px-4">Jurisdiction</th>
                    <th className="py-3 px-4">Proportionality</th>
                    <th className="py-3 px-4">Sovereign Decision</th>
                    <th className="py-3 px-4 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {subpoenas.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4">
                        <strong className="text-slate-900 font-bold block">{s.warrantRef}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{s.id}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-800 font-semibold">{s.authority}</td>

                      <td className="py-3.5 px-4 text-slate-600">{s.jurisdiction}</td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={s.proportionalityScore > 50 ? 'text-emerald-600' : 'text-rose-600'}>
                          {s.proportionalityScore}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {s.blockingStatuteStatus === 'REJECTED_EXTRATERRITORIAL' ? (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit">
                            <ShieldAlert className="w-3 h-3" /> REJECTED (EC 2271/96)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 border border-indigo-300 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit">
                            <Lock className="w-3 h-3" /> LEGAL HOLD ESCROW
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => exportForensicCertificate(s.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <Download className="w-3.5 h-3.5" /> Certificate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warrant Submission & Evaluation Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Scale className="w-4 h-4 text-indigo-600" />
              Ingress Warrant Evaluator
            </h3>

            <form onSubmit={handleEvaluateSubpoena} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Warrant Reference #</label>
                <input
                  type="text"
                  value={warrantRef}
                  onChange={(e) => setWarrantRef(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Issuing Government Authority</label>
                <input
                  type="text"
                  value={issuingAuthority}
                  onChange={(e) => setIssuingAuthority(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Statutory Legal Basis</label>
                <textarea
                  value={legalBasisText}
                  onChange={(e) => setLegalBasisText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs h-20 resize-none"
                  required
                />
              </div>

              <button
                type="button"
                onClick={handleEvaluateSubpoena}
                disabled={isEvaluating}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>{isEvaluating ? 'Evaluating Proportionality...' : 'Evaluate & Audit Subpoena'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HINSCHG WHISTLEBLOWER VAULT */}
      {activeTab === 'WHISTLEBLOWER' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                HinSchG Encrypted Sovereign Whistleblower Protection Vault
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full compliance with EU Whistleblower Protection Directive 2019/1937 and German HinSchG legislation.
              </p>
            </div>

            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-full">
              Asymmetric RSA-4096 / AES-256 GCM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whistleblowers.map((wb) => (
              <div key={wb.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded uppercase">
                      {wb.severity} SEVERITY
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1.5 font-mono">{wb.encryptedSubject}</h4>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">{wb.id}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Clock className="w-4 h-4 text-amber-500" /> Statutory Investigation Deadline:
                  </span>
                  <span className="font-bold text-amber-700 font-mono">{wb.statutorySlaDaysLeft} Days Remaining</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 font-mono">
                  <span>Vault Hash: {wb.hash}</span>
                  <button
                    type="button"
                    onClick={() => exportForensicCertificate(wb.id)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                  >
                    Export Forensic Ledger
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MTLS STATUTORY FILINGS DISPATCH */}
      {activeTab === 'DISPATCH' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                mTLS Regulatory Direct Dispatch Gateway
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated statutory reporting dispatch to ENISA, BaFin, DGFiP, and Member State clearinghouses.
              </p>
            </div>

            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
              mTLS Webhook Tunnel Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Filing ID</th>
                  <th className="py-3 px-4">Target Regulatory Body</th>
                  <th className="py-3 px-4">Framework</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">SHA-256 Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filings.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{f.id}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">{f.regulatoryBody}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{f.framework}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{f.format}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {f.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[10px] text-slate-400">
                      {f.sha256.substring(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PENALTY ESCROW & SANCTIONS CLEARING */}
      {activeTab === 'PENALTY_CLEARING' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Statutory Penalty Exposure Calculator
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <strong className="block text-slate-900 font-bold">GDPR Art. 83 Ceiling</strong>
                  <span className="text-[11px] text-slate-500">Max 4% Global Annual Turnover</span>
                </div>
                <span className="text-sm font-black text-indigo-700 font-mono">€20,000,000 Cap</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <strong className="block text-slate-900 font-bold">DORA Art. 50 ICT Fine Ceiling</strong>
                  <span className="text-[11px] text-slate-500">Financial Entity Non-Compliance</span>
                </div>
                <span className="text-sm font-black text-indigo-700 font-mono">€10,000,000 Cap</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                <div>
                  <strong className="block text-emerald-950 font-bold">Escrow Deposit Status</strong>
                  <span className="text-[11px] text-emerald-700">Central Bank CBDC / SEPA Instant</span>
                </div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  FULLY RESERVED
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              EU Sanctions & PEP Real-Time Clearing
            </h3>

            <p className="text-xs text-slate-600">
              Synchronized with EU Financial Sanctions Database (FSDB) & OpenSanctions API for instant counterparty verification.
            </p>

            <button
              type="button"
              onClick={() => showToast('Executing EU FSDB & OpenSanctions live audit check...', 'info')}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Run Sanctions Counterparty Audit</span>
            </button>
          </div>
        </div>
      )}

      {/* COMPLIANCE DELTA AUDITOR */}
      {activeTab === 'DELTA_AUDITOR' && (
        <div className="space-y-6">
          <ComplianceDeltaAuditor />
        </div>
      )}
    </div>
  );
};
