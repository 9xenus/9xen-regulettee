import React, { useState, useEffect } from "react";
import { 
  Briefcase, Search, Filter, AlertTriangle, CheckCircle2, Shield, FileCheck2, 
  Globe, Activity, FileText, Download, Sparkles, RefreshCw, Layers, Lock, Cpu
} from "lucide-react";

interface DoraVendor {
  id: string;
  name: string;
  category: string;
  criticality: string;
  riskScore: number;
  subProcessorChain: string[];
  doraArticle28Compliant: boolean;
  contractualExitPlan: string;
  certifications: { soc2: string; iso27001: string; bsiC5: string };
  extraterritorialExposure: string;
  hostingRegion: string;
  sccModule: string;
  remediationPlan: string;
}

export function SupplyChainAuditor() {
  const [activeTab, setActiveTab] = useState<'DORA_REGISTER' | 'SCC_GENERATOR' | 'MERKLE_AUDIT'>('DORA_REGISTER');
  const [vendors, setVendors] = useState<DoraVendor[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<DoraVendor | null>(null);

  // SCC Generator State
  const [sccModule, setSccModule] = useState<'MODULE_1' | 'MODULE_2' | 'MODULE_3' | 'MODULE_4'>('MODULE_2');
  const [dataExporter, setDataExporter] = useState('Sovereign Enterprise GmbH (Frankfurt, DE)');
  const [dataImporter, setDataImporter] = useState('Cloud Provider Inc. (Delaware, US)');
  const [transferCountry, setTransferCountry] = useState('United States (US)');
  const [isGeneratingScc, setIsGeneratingScc] = useState(false);
  const [generatedScc, setGeneratedScc] = useState<any | null>(null);

  // Merkle Ledger State
  const [merkleData, setMerkleData] = useState<any | null>(null);
  const [verifyingHash, setVerifyingHash] = useState<string | null>(null);
  const [verificationProof, setVerificationProof] = useState<any | null>(null);

  useEffect(() => {
    fetchVendors();
    fetchMerkleLedger();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/v1/dora/vendors');
      const data = await res.json();
      if (data.success && data.doraArticle28Register) {
        setVendors(data.doraArticle28Register);
        setSelectedVendor(data.doraArticle28Register[0]);
      }
    } catch (e) {
      console.error("Failed to load DORA vendors", e);
    }
  };

  const fetchMerkleLedger = async () => {
    try {
      const res = await fetch('/api/v1/compliance/merkle-ledger');
      const data = await res.json();
      if (data.success) {
        setMerkleData(data);
      }
    } catch (e) {
      console.error("Failed to load Merkle ledger", e);
    }
  };

  const handleScanVendor = async (vendorId: string) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/v1/dora/vendors/audit-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedVendor(data.vendor);
      }
    } catch (e) {
      console.error("Error scanning vendor", e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateScc = async () => {
    setIsGeneratingScc(true);
    try {
      const res = await fetch('/api/v1/tia/generate-scc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleType: sccModule,
          dataExporter,
          dataImporter,
          transferCountry,
          dataCategories: ['User Identifiers', 'System Telemetry', 'Transaction Metadata']
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedScc(data);
      }
    } catch (e) {
      console.error("Failed to generate SCCs", e);
    } finally {
      setIsGeneratingScc(false);
    }
  };

  const handleVerifyMerkleEvent = async (event: any) => {
    setVerifyingHash(event.hash);
    try {
      const res = await fetch('/api/v1/compliance/merkle-ledger/verify-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.index, targetHash: event.hash })
      });
      const data = await res.json();
      if (data.success) {
        setVerificationProof(data);
      }
    } catch (e) {
      console.error("Verification failed", e);
    } finally {
      setVerifyingHash(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-indigo-600" />
            Supply Chain & DORA ICT Resilience Hub
          </h1>
          <p className="text-slate-500 mt-1">Continuous third-party vendor risk assessment (DORA Art. 28) & EU Standard Contractual Clauses.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('DORA_REGISTER')}
            className={`px-3 py-2 rounded-lg transition ${activeTab === 'DORA_REGISTER' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            DORA Art. 28 Register
          </button>
          <button
            onClick={() => setActiveTab('SCC_GENERATOR')}
            className={`px-3 py-2 rounded-lg transition ${activeTab === 'SCC_GENERATOR' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            EU SCCs (2021/914) & TIA
          </button>
          <button
            onClick={() => setActiveTab('MERKLE_AUDIT')}
            className={`px-3 py-2 rounded-lg transition ${activeTab === 'MERKLE_AUDIT' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Merkle Audit Ledger
          </button>
        </div>
      </div>

      {/* TAB 1: DORA ART. 28 REGISTER */}
      {activeTab === 'DORA_REGISTER' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">DORA ICT Vendors</p>
                <p className="text-2xl font-black text-slate-900">{vendors.length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">FISA 702 Exposed</p>
                <p className="text-2xl font-black text-rose-600">
                  {vendors.filter(v => v.extraterritorialExposure.includes('FISA')).length}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <FileCheck2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Art. 28 Compliant</p>
                <p className="text-2xl font-black text-emerald-600">
                  {vendors.filter(v => v.doraArticle28Compliant).length} / {vendors.length}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Avg Risk Index</p>
                <p className="text-2xl font-black text-slate-900">
                  {vendors.length > 0 ? Math.round(vendors.reduce((acc, v) => acc + v.riskScore, 0) / vendors.length) : 0}/100
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">ICT Third-Party Register (Article 28(3))</span>
                <span className="text-[11px] font-mono text-slate-500">EU Reg 2022/2554 Standard</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Vendor / Service</th>
                      <th className="px-4 py-3">Risk</th>
                      <th className="px-4 py-3">Jurisdiction</th>
                      <th className="px-4 py-3">DORA Compliance</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {vendors.map((v) => (
                      <tr 
                        key={v.id} 
                        onClick={() => setSelectedVendor(v)}
                        className={`hover:bg-slate-50 cursor-pointer transition ${selectedVendor?.id === v.id ? 'bg-indigo-50/50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{v.name}</div>
                          <div className="text-[10px] text-slate-400">{v.category}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                            v.riskScore > 70 ? 'bg-rose-100 text-rose-800' :
                            v.riskScore > 30 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {v.riskScore}/100
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            {v.hostingRegion}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {v.doraArticle28Compliant ? (
                            <span className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pass
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Remediation Required
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScanVendor(v.id);
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold cursor-pointer"
                          >
                            Audit Scan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vendor Detail Card */}
            {selectedVendor && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{selectedVendor.name}</h3>
                    <p className="text-[11px] text-slate-500">{selectedVendor.id} • {selectedVendor.criticality}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    selectedVendor.riskScore > 70 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Risk: {selectedVendor.riskScore}/100
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Sub-processor Chain (FISA Risk)</span>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-700 space-y-1 mt-1">
                      {selectedVendor.subProcessorChain.map((sub, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-indigo-500" />
                          <span>{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Certifications & TOMs</span>
                    <div className="grid grid-cols-3 gap-1.5 mt-1 font-mono text-[10px] text-center">
                      <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                        <span className="block text-slate-400 text-[9px]">SOC 2</span>
                        <span className="font-bold text-slate-800">{selectedVendor.certifications.soc2}</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                        <span className="block text-slate-400 text-[9px]">ISO 27001</span>
                        <span className="font-bold text-slate-800">{selectedVendor.certifications.iso27001}</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                        <span className="block text-slate-400 text-[9px]">BSI C5</span>
                        <span className="font-bold text-slate-800">{selectedVendor.certifications.bsiC5}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Exit Strategy & Multi-Vendor Portability</span>
                    <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] text-indigo-900 font-bold mt-1">
                      {selectedVendor.contractualExitPlan}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Recommended DORA Remediation</span>
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1">
                      {selectedVendor.remediationPlan}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EU STANDARD CONTRACTUAL CLAUSES (SCC 2021/914) & TIA */}
      {activeTab === 'SCC_GENERATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                EU Standard Contractual Clauses (2021/914) Generator
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Automated Schrems II Transfer Impact Assessment (TIA) & Module Selection for third-country data transfers.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">SCC Module Archetype</label>
                <select
                  value={sccModule}
                  onChange={(e: any) => setSccModule(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="MODULE_1">Module 1: Controller to Controller (C2C)</option>
                  <option value="MODULE_2">Module 2: Controller to Processor (C2P)</option>
                  <option value="MODULE_3">Module 3: Processor to Processor (P2P)</option>
                  <option value="MODULE_4">Module 4: Processor to Controller (P2C)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Data Exporter (EU Entity)</label>
                <input
                  type="text"
                  value={dataExporter}
                  onChange={(e) => setDataExporter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Data Importer (Third Country Entity)</label>
                <input
                  type="text"
                  value={dataImporter}
                  onChange={(e) => setDataImporter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Destination Country & Adequacy Mechanism</label>
                <input
                  type="text"
                  value={transferCountry}
                  onChange={(e) => setTransferCountry(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                onClick={handleGenerateScc}
                disabled={isGeneratingScc}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isGeneratingScc ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGeneratingScc ? 'Drafting Clauses & TIA...' : 'Generate Executable SCCs (2021/914)'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase text-slate-500">Clause Preview & TIA Findings</span>
                {generatedScc && (
                  <button
                    onClick={() => {
                      const blob = new Blob([generatedScc.sccMarkdown], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${generatedScc.sccId}_EU_SCC_2021_914.md`;
                      a.click();
                    }}
                    className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download SCC
                  </button>
                )}
              </div>

              {generatedScc ? (
                <div className="mt-3 space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Schrems II Transfer Impact Assessment Passed with Supplemental Encryption Measures.</span>
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono max-h-96 overflow-y-auto whitespace-pre-wrap">
                    {generatedScc.sccMarkdown}
                  </pre>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs italic">
                  Select parameters and click "Generate Executable SCCs" to compile legal clauses and Transfer Impact Assessment.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MERKLE TREE AUDIT LEDGER */}
      {activeTab === 'MERKLE_AUDIT' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                Immutable Merkle Tree Compliance Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Cryptographically anchored audit trail of automated remediations, DSAR exports, and statutory patches.
              </p>
            </div>

            {merkleData && (
              <div className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-mono text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Root: {merkleData.merkleRoot.substring(0, 18)}...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Cryptographic Event Leaves</span>
              {merkleData?.leaves?.map((leaf: any) => (
                <div key={leaf.index} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 font-mono flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                      Block #{leaf.index}: {leaf.event}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Hash: <span className="text-indigo-600 font-semibold">{leaf.hash}</span> • {new Date(leaf.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleVerifyMerkleEvent(leaf)}
                    disabled={verifyingHash === leaf.hash}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50"
                  >
                    {verifyingHash === leaf.hash ? 'Verifying...' : 'Verify Merkle Proof'}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Zero-Knowledge Attestation</span>
              {verificationProof ? (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-lg font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Merkle Path Cryptographically Validated
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-[11px] text-slate-600">
                    <div><span className="text-slate-400">Target:</span> {verificationProof.eventHash}</div>
                    <div><span className="text-slate-400">Signature:</span> {verificationProof.cryptographicSignature}</div>
                    <div className="mt-2 text-slate-400 text-[10px]">Proof Siblings:</div>
                    {verificationProof.merkleProof.map((p: string, i: number) => (
                      <div key={i} className="text-indigo-600 text-[10px]">{p}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-xs italic p-6 text-center">
                  Click "Verify Merkle Proof" on any compliance event to validate non-tampering against sovereign enclave root.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupplyChainAuditor;
