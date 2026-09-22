import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import {
  Cpu,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Copy,
  Lock,
  Zap,
  Terminal,
  FileCheck,
  ChevronRight,
  Layers,
  Fingerprint
} from 'lucide-react';
import {
  zkCryptographicEngine,
  ZkCircuitDefinition,
  ZkProofArtifact,
  ZkProofVerificationResult
} from '../services/zkCryptographicEngine';

export const ZkProofConsole: React.FC = () => {
  const { showToast } = useNotification();
  const [circuits, setCircuits] = useState<ZkCircuitDefinition[]>([]);
  const [selectedCircuit, setSelectedCircuit] = useState<ZkCircuitDefinition | null>(null);

  // Proof Generation inputs
  const [publicInputsJson, setPublicInputsJson] = useState('{\n  "designatedRegion": "CH_SWITZERLAND",\n  "allowedGeoHashBoundaries": ["u0", "u1"],\n  "auditEpoch": 2026\n}');
  const [privateWitnessJson, setPrivateWitnessJson] = useState('{\n  "storageServerIp": "10.240.12.89",\n  "rawDatacenterTelemetry": "datacenter_zurich_vault_01",\n  "subtenantIds": ["TENANT_CORP_9912"]\n}');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArtifact, setGeneratedArtifact] = useState<ZkProofArtifact | null>(null);

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ZkProofVerificationResult | null>(null);
  const [recentProofs, setRecentProofs] = useState<ZkProofArtifact[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const list = zkCryptographicEngine.getCircuits();
    setCircuits(list);
    if (list.length > 0) {
      setSelectedCircuit(list[0]);
    }
    setRecentProofs(zkCryptographicEngine.getRecentProofs());
  }, []);

  const handleSelectCircuit = (c: ZkCircuitDefinition) => {
    setSelectedCircuit(c);
    setVerificationResult(null);

    if (c.category === 'SOVEREIGN_RESIDENCY') {
      setPublicInputsJson('{\n  "designatedRegion": "CH_SWITZERLAND",\n  "allowedGeoHashBoundaries": ["u0", "u1"],\n  "auditEpoch": 2026\n}');
      setPrivateWitnessJson('{\n  "storageServerIp": "10.240.12.89",\n  "rawDatacenterTelemetry": "datacenter_zurich_vault_01",\n  "subtenantIds": ["TENANT_CORP_9912"]\n}');
    } else if (c.category === 'KYC_AGE_MINIMIZATION') {
      setPublicInputsJson('{\n  "minimumAgeThreshold": 18,\n  "isNotSanctioned": true,\n  "accreditedInvestorFlag": true\n}');
      setPrivateWitnessJson('{\n  "passportNumber": "SG-P8912401C",\n  "fullLegalName": "Tan Wei Ling",\n  "dateOfBirth": "1991-04-14",\n  "netWorthUsd": 3500000\n}');
    } else if (c.category === 'SOLVENCY_ADEQUACY') {
      setPublicInputsJson('{\n  "statutoryReserveFloorUsd": 50000000,\n  "reportingQuarter": "Q3-2026",\n  "auditorNonce": "AUDIT-PWC-912"\n}');
      setPrivateWitnessJson('{\n  "bankAccountBalances": [24500000, 38200000],\n  "tier1CapitalAccounts": "CUSTODY-UBS-SWISS",\n  "custodyLedgers": "LEDGER-PQC-901"\n}');
    } else {
      setPublicInputsJson('{\n  "modelWeightChecksum": "0x7a89f921...c99a",\n  "licensedCorpusMerkleRoot": "0x44bd1...89ee",\n  "complianceTimestamp": "2026-09-12"\n}');
      setPrivateWitnessJson('{\n  "rawTrainingTextHashes": ["0x11", "0x22"],\n  "proprietaryDataPipelineLogs": "CHROMA_ENCLAVE_PIPELINE",\n  "optOutExclusions": 0\n}');
    }
  };

  const handleGenerateProof = () => {
    if (!selectedCircuit) return;
    setIsGenerating(true);
    setVerificationResult(null);

    setTimeout(() => {
      try {
        const parsedPub = JSON.parse(publicInputsJson);
        const parsedPriv = JSON.parse(privateWitnessJson);
        const artifact = zkCryptographicEngine.generateProof({
          circuitId: selectedCircuit.circuitId,
          publicInputs: parsedPub,
          privateWitness: parsedPriv
        });
        setGeneratedArtifact(artifact);
        setRecentProofs(zkCryptographicEngine.getRecentProofs());
      } catch (err: any) {
        showToast('Invalid JSON in inputs: ' + err.message, 'error');
      } finally {
        setIsGenerating(false);
      }
    }, 450);
  };

  const handleVerifyProof = (proofId: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = zkCryptographicEngine.verifyProof(proofId);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 350);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                Zero-Knowledge Proof (ZKP / ZKF) Cryptographic Engine
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-medium">
                  zk-SNARK (BN254) & STARK PQC
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Full-Stack Zero-Knowledge verification for sovereign geofencing, selective KYC disclosure, capital adequacy, and AI training provenance without revealing private witnesses.
              </p>
            </div>
          </div>
        </div>

        {/* Circuit Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {circuits.map(c => {
            const isSelected = selectedCircuit?.circuitId === c.circuitId;
            return (
              <div
                key={c.circuitId}
                onClick={() => handleSelectCircuit(c)}
                className={`cursor-pointer bg-slate-900/80 border rounded-xl p-4 transition flex flex-col justify-between ${
                  isSelected ? 'border-purple-500 ring-1 ring-purple-500/40 shadow-lg shadow-purple-500/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-purple-300 border border-purple-500/20">
                      {c.provingScheme}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{c.curve}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white mb-2 leading-snug">{c.name}</h3>
                  <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                    <p><span className="text-slate-500">Public:</span> {c.publicInputs.length} signals</p>
                    <p><span className="text-slate-500">Witness:</span> {c.privateWitnessInputs.length} secret inputs</p>
                  </div>
                </div>

                <div className={`text-[11px] font-semibold flex items-center justify-center py-1.5 rounded-lg transition ${
                  isSelected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  <span>{isSelected ? 'Active Circuit' : 'Select Circuit'}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Prover & Verifier Interactive Workstation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Prover Terminal */}
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white">Zero-Knowledge Prover Workstation</h2>
              </div>
              <span className="text-xs font-mono text-purple-400">{selectedCircuit?.circuitId}</span>
            </div>

            {/* Public Inputs */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                  Public Inputs (Exposed on Verifier Contract / Auditor Endpoint)
                </label>
              </div>
              <textarea
                rows={4}
                value={publicInputsJson}
                onChange={e => setPublicInputsJson(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-indigo-300 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Private Witness */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  Private Witness (Zero-Knowledge: Encrypted & NEVER Disclosed)
                </label>
              </div>
              <textarea
                rows={5}
                value={privateWitnessJson}
                onChange={e => setPrivateWitnessJson(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-amber-300 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-[11px] text-slate-400 italic">
                NIST Kyber-1024 PQC Tamper Seal appended to proof artifact.
              </span>
              <button
                onClick={handleGenerateProof}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition shadow-md shadow-purple-500/20 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Compute ZK Proof</span>
              </button>
            </div>
          </div>

          {/* Verifier Terminal & Artifact View */}
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Verifier & Cryptographic Attestation</h2>
              </div>
              {generatedArtifact && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {generatedArtifact.executionTimeMs}ms execution
                </span>
              )}
            </div>

            {generatedArtifact ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Proof Identifier:</span>
                    <span className="text-purple-300 font-bold">{generatedArtifact.proofId}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Proving Scheme:</span>
                    <span className="text-indigo-400">{generatedArtifact.provingScheme} ({generatedArtifact.proof.curve})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 truncate">
                    <span>Proof Hash: </span>
                    <span className="text-slate-300">{generatedArtifact.proofHash}</span>
                  </div>
                </div>

                {/* Proof Elements pi_a, pi_b, pi_c Preview */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[10px] text-purple-300/80 space-y-1 max-h-36 overflow-y-auto">
                  <p className="text-slate-400 font-bold">Groth16 G1 / G2 Affine Proof Points:</p>
                  <p>π_a: [{generatedArtifact.proof.pi_a[0].slice(0, 18)}..., {generatedArtifact.proof.pi_a[1].slice(0, 18)}...]</p>
                  <p>π_c: [{generatedArtifact.proof.pi_c[0].slice(0, 18)}..., {generatedArtifact.proof.pi_c[1].slice(0, 18)}...]</p>
                  <p className="text-slate-400 pt-1">Public Signals Digest: {generatedArtifact.publicSignals.join(', ')}</p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(generatedArtifact, null, 2), 'proof')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedKey === 'proof' ? 'Copied' : 'Copy Proof JSON'}
                  </button>
                  <button
                    onClick={() => handleVerifyProof(generatedArtifact.proofId)}
                    disabled={isVerifying}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  >
                    {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Verify Proof</span>
                  </button>
                </div>

                {/* Verification result attestation */}
                {verificationResult && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Proof Verified Mathematically (Valid: true)
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded">
                        EVM Gas: ~{verificationResult.gasCostEquivalent.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">
                      {verificationResult.publicAttestationStatement}
                    </p>
                    <p className="text-[10px] font-mono text-emerald-400/80 pt-1 border-t border-emerald-500/20">
                      Verifier Primitive: {verificationResult.cryptographicProofVerifier}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
                <KeyRound className="w-10 h-10 text-slate-600 mb-2" />
                <h4 className="text-xs font-bold text-slate-300">No Proof Computed Yet</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                  Click "Compute ZK Proof" on the left to execute the zero-knowledge circuit and evaluate cryptographic validity.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Proof Registry Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Immutable Zero-Knowledge Proof Registry & Post-Quantum Audit Trail
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="p-3">Proof ID</th>
                  <th className="p-3">Circuit Target</th>
                  <th className="p-3">Proving Scheme</th>
                  <th className="p-3">Tamper Proof Seal</th>
                  <th className="p-3">Time</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {recentProofs.map(p => (
                  <tr key={p.proofId} className="hover:bg-slate-950/40">
                    <td className="p-3 font-bold text-purple-400">{p.proofId}</td>
                    <td className="p-3 text-slate-300">{p.circuitId}</td>
                    <td className="p-3 text-indigo-400">{p.provingScheme}</td>
                    <td className="p-3 text-slate-400 text-[10px]">{p.pqcTamperProofSeal.slice(0, 20)}...</td>
                    <td className="p-3 text-slate-400 text-[11px]">{p.generatedAt.slice(11, 19)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleVerifyProof(p.proofId)}
                        className="px-2.5 py-1 bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-500/30 rounded text-[10px] font-semibold transition"
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZkProofConsole;
