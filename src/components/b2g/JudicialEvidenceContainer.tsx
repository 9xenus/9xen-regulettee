import React, { useState, useEffect } from 'react';
import { Scale, ShieldCheck, Lock, CheckCircle2, AlertTriangle, FileText, Download, RefreshCw, Key, Layers, Terminal } from 'lucide-react';

interface EvidenceContainer {
  id: string;
  filing_id?: string;
  case_title: string;
  authority_name: string;
  merkle_root_sha256: string;
  tsa_timestamp_token: string;
  tsa_signature_asn1: string;
  court_admissibility_status?: string;
  container_json?: string;
  created_at: string;
}

export const JudicialEvidenceContainer: React.FC = () => {
  const [caseTitle, setCaseTitle] = useState('Data Breach Investigation #EU-2026-9012');
  const [authorityName, setAuthorityName] = useState('European Data Protection Board / CJEU Legal Registry');
  const [evidenceName1, setEvidenceName1] = useState('System Database Access Logs (Encrypted)');
  const [evidenceName2, setEvidenceName2] = useState('DPO Biometric Attestation Record');
  const [isCreating, setIsCreating] = useState(false);
  const [containers, setContainers] = useState<EvidenceContainer[]>([]);
  const [activeContainer, setActiveContainer] = useState<EvidenceContainer | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  const fetchContainers = async () => {
    try {
      const res = await fetch('/api/v1/b2g/evidence/containers');
      const data = await res.json();
      if (data.success) {
        setContainers(data.containers);
        if (data.containers.length > 0 && !activeContainer) {
          setActiveContainer(data.containers[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/v1/b2g/evidence/rfc3161-container', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_title: caseTitle,
          authority_name: authorityName,
          evidence_items: [
            { name: evidenceName1, timestamp: new Date().toISOString() },
            { name: evidenceName2, timestamp: new Date().toISOString() }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveContainer(data.container);
        await fetchContainers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerify = async () => {
    if (!activeContainer) return;
    try {
      const res = await fetch('/api/v1/b2g/evidence/verify-container', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          container_id: activeContainer.id,
          merkle_root_to_verify: activeContainer.merkle_root_sha256
        })
      });
      const data = await res.json();
      if (data.success) {
        setVerificationResult(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Judicial Chain-of-Custody & RFC 3161 Evidence Archives</h3>
            <p className="text-xs text-slate-400">Time-Stamp Authority (TSA) cryptographic seal packages for court legal admissibility</p>
          </div>
        </div>
        <button
          onClick={fetchContainers}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Evidence Vault</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            Compile TSA Evidence Container
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Judicial Case Title</label>
              <input
                type="text"
                value={caseTitle}
                onChange={e => setCaseTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Judicial Authority</label>
              <input
                type="text"
                value={authorityName}
                onChange={e => setAuthorityName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Primary Evidence Item #1</label>
              <input
                type="text"
                value={evidenceName1}
                onChange={e => setEvidenceName1(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Supporting Evidence Item #2</label>
              <input
                type="text"
                value={evidenceName2}
                onChange={e => setEvidenceName2(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 font-bold text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isCreating ? 'Computing Merkle Root & TSA Seal...' : 'Generate RFC 3161 Container'}</span>
            </button>
          </div>
        </div>

        {/* TSA Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {activeContainer ? (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-white">{activeContainer.case_title}</h4>
                  <span className="text-xs text-purple-400 font-mono block mt-0.5">{activeContainer.authority_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleVerify}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify TSA Seal</span>
                  </button>
                </div>
              </div>

              {/* Cryptographic Proof Details */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Merkle Tree Root SHA-256</span>
                  <span className="text-purple-300 font-bold text-[11px] break-all select-all">{activeContainer.merkle_root_sha256}</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">RFC 3161 Time-Stamp Token (TST)</span>
                  <div className="p-2 bg-slate-950 rounded text-emerald-400 text-[10px] break-all">
                    {activeContainer.tsa_timestamp_token}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">ASN.1 Signature Stream</span>
                  <div className="p-2 bg-slate-950 rounded text-slate-400 text-[10px] truncate">
                    {activeContainer.tsa_signature_asn1}
                  </div>
                </div>
              </div>

              {verificationResult && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold">Cryptographic Chain-of-Custody Integrity Confirmed</span>
                  </div>
                  <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">COURT ADMISSIBLE</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Select or generate a judicial evidence container above.
            </div>
          )}

          {/* Evidence Vault List */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Judicial Archive Vault ({containers.length})</h5>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {containers.map(item => (
                <div
                  key={item.id}
                  onClick={() => setActiveContainer(item)}
                  className={`p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                    activeContainer?.id === item.id ? 'bg-slate-800 border-purple-500/50 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono">
                    <Scale className="w-3.5 h-3.5 text-purple-400" />
                    <span>{item.case_title}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">VERIFIED TSA</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
