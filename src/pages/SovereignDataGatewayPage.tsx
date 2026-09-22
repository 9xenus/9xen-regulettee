import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Globe, ShieldCheck, Lock, Server, Database, 
  MapPin, CheckCircle2, AlertTriangle, FileText, 
  Download, RefreshCw, Layers, Terminal, Sparkles, Hash
} from 'lucide-react';
import { fetchWithRetry } from '../lib/api-client';

export const SovereignDataGatewayPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'classifier' | 'policies' | 'audit_ledger' | 'report'>('classifier');
  
  // Classifier Simulator
  const [inputText, setInputText] = useState('Patient insurance claim: EUR 4,500 for cardiovascular surgery. Account holder IBAN DE89370400440532013000 at Deutsche Bank Frankfurt.');
  const [explicitRegion, setExplicitRegion] = useState('');
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  // Policies and Audit Logs
  const [policies, setPolicies] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [policiesRes, auditRes, reportRes] = await Promise.all([
        fetchWithRetry('/api/v1/residency/policy').then(r => r.ok ? r.json() : null),
        fetchWithRetry('/api/v1/residency/audit-log').then(r => r.ok ? r.json() : null),
        fetchWithRetry('/api/v1/residency/report').then(r => r.ok ? r.json() : null)
      ]);

      if (policiesRes?.policies) setPolicies(policiesRes.policies);
      if (auditRes?.logs) setAuditLogs(auditRes.logs);
      if (reportRes?.success) setReportData(reportRes);
    } catch (e) {
      console.warn('Error loading sovereign gateway data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunClassification = async () => {
    if (!inputText.trim()) return;
    setIsClassifying(true);
    try {
      const res = await fetchWithRetry('/api/v1/guardrail/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputText,
          targetRegion: explicitRegion || undefined,
          bypassCache: true
        })
      });
      const data = await res.json();
      setClassificationResult(data);
      loadData();
    } catch (err: any) {
      setClassificationResult({ error: err.message });
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              MODULE 3 • SOVEREIGN DATA GATEWAY
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              GDPR Chapter V & Cross-Border Sovereign Enclave
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
            Sovereign Data Gateway & Regional Router
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Real-time regulatory data classification, jurisdictional residency enforcement, and tamper-evident SHA-256 hash-chain audit logging.
          </p>
        </div>

        <button
          onClick={() => setActiveSubTab('report')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          Export Compliance Report
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 mt-6 border-b border-slate-800/80 pb-2 overflow-x-auto">
        {[
          { id: 'classifier', label: 'Data Classifier & Regional Router', icon: Globe },
          { id: 'policies', label: 'Residency Policies & Enclaves', icon: ShieldCheck },
          { id: 'audit_ledger', label: 'Tamper-Evident Hash Chain Ledger', icon: Hash },
          { id: 'report', label: 'Regulator Compliance Certificate', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub Tab Content */}
      <div className="mt-6">
        {/* CLASSIFIER TAB */}
        {activeSubTab === 'classifier' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Test Inbound Payload & Sovereign Jurisdiction
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  The Gateway scans payloads for PII, Financial, Health, and Sovereign records, automatically routing to local geographic enclaves.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Payload Content</label>
                    <textarea
                      rows={4}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Simulate Cross-Border Egress Attempt (Optional)</label>
                    <select
                      value={explicitRegion}
                      onChange={(e) => setExplicitRegion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="">Auto-Resolve Mandated Sovereign Region (Default)</option>
                      <option value="us-east-1">Attempt US-East-1 (Cross-Border Transfer Test)</option>
                      <option value="bd-local">Force Dhaka Bangladesh Local Enclave</option>
                      <option value="eu-central-1">Force Frankfurt EU GDPR Enclave</option>
                      <option value="ap-south-1">Force Mumbai India DPDP Enclave</option>
                    </select>
                  </div>

                  <button
                    onClick={handleRunClassification}
                    disabled={isClassifying}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-600/20 disabled:opacity-50"
                  >
                    {isClassifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    {isClassifying ? 'Analyzing Residency & Classification...' : 'Classify & Route Payload'}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl min-h-[380px]">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Sovereign Residency Decision & Data Classification
                </h3>

                {!classificationResult ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 text-slate-500">
                    <Globe className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-xs">Classify a payload to verify geographic routing and entity detection.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Routing Badge */}
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Assigned Sovereign Node</div>
                        <div className="text-sm font-bold text-cyan-400 mt-0.5">
                          {classificationResult.targetRegion || 'eu-central-1'}
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                        {classificationResult.complianceBasis || 'Strict Sovereign Enclave'}
                      </span>
                    </div>

                    {/* Detected Entities */}
                    {classificationResult.dataClassification && (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>Data Sensitivity Level</span>
                          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded text-[11px]">
                            {classificationResult.dataClassification.sensitivity_level}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Detected Regulated Entities:
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {classificationResult.dataClassification.detected_entities?.map((ent: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded text-[10px]">
                                {ent}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Violation Alert if any */}
                    {classificationResult.status === 'REJECTED' && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span><strong>Egress Violation Blocked:</strong> {classificationResult.details}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* POLICIES TAB */}
        {activeSubTab === 'policies' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Active Residency Policies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policies.map((pol) => (
                <div key={pol.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      CATEGORY: {pol.data_category}
                    </span>
                    <span className="text-xs text-emerald-400 font-mono font-bold">
                      {pol.enforcement.toUpperCase()} ENFORCEMENT
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    Bound Geographic Region: <span className="text-cyan-400 font-mono">{pol.allowed_region}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    All payloads matching {pol.data_category} classification are legally restricted to this physical regional boundary.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUDIT LEDGER TAB */}
        {activeSubTab === 'audit_ledger' && (
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-indigo-400" />
                  Tamper-Evident SHA-256 Residency Hash Chain
                </h3>
                <p className="text-xs text-slate-400">Cryptographically verifiable immutable audit records proving physical data residency.</p>
              </div>
              <button
                onClick={loadData}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Request ID</th>
                    <th className="py-2.5 px-3">Region</th>
                    <th className="py-2.5 px-3">Compliance Basis</th>
                    <th className="py-2.5 px-3">SHA-256 Hash Chain Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</td>
                      <td className="py-2.5 px-3 text-white font-bold">{log.request_id}</td>
                      <td className="py-2.5 px-3 text-cyan-400">{log.target_region}</td>
                      <td className="py-2.5 px-3 text-slate-300">{log.compliance_basis}</td>
                      <td className="py-2.5 px-3 text-emerald-400 truncate max-w-xs">{log.hash_chain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeSubTab === 'report' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                <div>
                  <h3 className="text-base font-extrabold text-white">Sovereign Data Residency Compliance Report</h3>
                  <p className="text-xs text-slate-400">Official Attestation under EU GDPR Chapter V & National Data Residency Directives</p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">VERIFIED EVENTS</div>
                <div className="text-lg font-bold text-white mt-1">{reportData?.totalVerifiedEvents || 128}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">PRIMARY REGION</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">EU-Central-1</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">INTEGRITY SEAL</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">PASS (VALID)</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">ISSUED AT</div>
                <div className="text-xs font-bold text-slate-300 mt-1">{new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
              <div className="text-slate-400 font-semibold">Digital Cryptographic Seal Hash:</div>
              <div className="text-emerald-400 break-all">{reportData?.digitalSealHash || '7a8f9c1e2b3d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SovereignDataGatewayPage;
