import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Globe,
  Users,
  Key,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Server,
  Layers,
  ArrowRight,
  Zap,
  Check,
  X,
  Building2,
  FileCheck,
  Eye,
  Sliders,
  Terminal,
  Activity
} from 'lucide-react';

interface RoleSpec {
  role: string;
  displayName: string;
  description: string;
  accessScope: string;
  permissions: string[];
}

interface EscrowKey {
  id: string;
  algorithm: string;
  keyFingerprint: string;
  purpose: string;
  custodianRole: string;
  status: string;
  createdDate: string;
  rotationScheduled: string;
}

interface EnclaveConfig {
  regionCode: string;
  locationName: string;
  sovereigntyStandard: string;
  pqcAlgorithm: string;
  crossBorderTransferAllowed: boolean;
  status: string;
  latencyMs: number;
}

interface TenantEnclave {
  tenantId: string;
  tenantName: string;
  enclaveRegion: string;
  pqcEnabled: boolean;
  pqcKeyId: string;
  schremsIiSafeguard: boolean;
  updatedAt: string;
}

export const SovereigntyRoleSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rbac' | 'enclaves' | 'pqc_sandbox' | 'key_escrow'>('rbac');

  // RBAC State
  const [roles, setRoles] = useState<RoleSpec[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('CLIENT');
  const [testAction, setTestAction] = useState('remediation_apply');
  const [testResult, setTestResult] = useState<{ allowed: boolean } | null>(null);

  // Enclaves State
  const [enclaves, setEnclaves] = useState<EnclaveConfig[]>([]);
  const [tenantId, setTenantId] = useState('tenant-global-fintech-01');
  const [tenantName, setTenantName] = useState('Global Fintech Europe GmbH');
  const [tenantEnclave, setTenantEnclave] = useState<TenantEnclave | null>(null);
  const [isUpdatingEnclave, setIsUpdatingEnclave] = useState(false);

  // PQC State
  const [pqcInput, setPqcInput] = useState('{"dsarId":"DSAR-EU-9921","subjectEmail":"citizen.eu@fintech.de","biometricRecordHash":"9f8a3c4b"}');
  const [pqcRegion, setPqcRegion] = useState('EU-CENTRAL-1');
  const [pqcOutput, setPqcOutput] = useState<any | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Key Escrow State
  const [escrowKeys, setEscrowKeys] = useState<EscrowKey[]>([]);
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [escrowToast, setEscrowToast] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [rRes, eRes, tRes, kRes] = await Promise.all([
        fetch('/api/v1/sovereignty-security/roles'),
        fetch('/api/v1/sovereignty-security/enclaves'),
        fetch(`/api/v1/sovereignty-security/tenant-enclave/${tenantId}`),
        fetch('/api/v1/sovereignty-security/key-escrow')
      ]);

      const rData = await rRes.json();
      const eData = await eRes.json();
      const tData = await tRes.json();
      const kData = await kRes.json();

      if (rData.success) setRoles(rData.roles);
      if (eData.success) setEnclaves(eData.enclaves);
      if (tData.success) setTenantEnclave(tData.config);
      if (kData.success) setEscrowKeys(kData.escrowKeys);
    } catch (err) {
      console.error('Failed to fetch sovereignty & security data:', err);
    }
  };

  const handleRotateKey = async () => {
    setIsRotatingKey(true);
    try {
      const res = await fetch('/api/v1/sovereignty-security/key-escrow/rotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId: escrowKeys[0]?.id })
      });
      const data = await res.json();
      if (data.success && data.rotatedKey) {
        setEscrowKeys(prev => [data.rotatedKey, ...prev]);
        setEscrowToast('Quantum-resistant audit key rotated successfully under dual custodian escrow.');
      }
    } catch (e) {
      console.error('Failed to rotate escrow key:', e);
    } finally {
      setIsRotatingKey(false);
      setTimeout(() => setEscrowToast(null), 4000);
    }
  };

  const handleCheckPermission = async () => {
    try {
      const res = await fetch('/api/v1/sovereignty-security/check-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, action: testAction })
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ allowed: data.allowed });
      }
    } catch (err) {
      console.error('Failed to check permission:', err);
    }
  };

  const handleSwitchEnclave = async (regionCode: 'EU-CENTRAL-1' | 'EU-WEST-1' | 'EU-WEST-3') => {
    setIsUpdatingEnclave(true);
    try {
      const res = await fetch('/api/v1/sovereignty-security/tenant-enclave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, tenantName, enclaveRegion: regionCode })
      });
      const data = await res.json();
      if (data.success) {
        setTenantEnclave(data.config);
      }
    } catch (err) {
      console.error('Failed to update tenant enclave:', err);
    } finally {
      setIsUpdatingEnclave(false);
    }
  };

  const handleRunPqcEncryption = async () => {
    setIsEncrypting(true);
    try {
      const res = await fetch('/api/v1/sovereignty-security/pqc-encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: pqcInput, enclaveRegion: pqcRegion })
      });
      const data = await res.json();
      if (data.success) {
        setPqcOutput(data.pqcResult);
      }
    } catch (err) {
      console.error('Failed to run PQC encryption:', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 bg-indigo-900 text-white rounded-xl shadow-xs">
                <Globe className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Data Sovereignty & Role-Based Security
                </h1>
                <p className="text-xs text-slate-500">
                  Data Sovereignty & Role-Based Security (Multi-Tenant Access, Regional Data Residency & PQC)
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Strict European data sovereignty enclave routing (EU-CENTRAL-1 BSI C5), Post-Quantum Encryption (CRYSTALS-Kyber-1024), and fine-grained multi-tenant role permissions (Super Admin, Clients, EU Regulators/DPO, Compliance Officer, External Lawyer, Auditor).
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Sovereign Data Residency</span>
              <div className="flex items-center space-x-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-mono text-xs font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{tenantEnclave?.enclaveRegion || 'EU-CENTRAL-1'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mt-6 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'rbac'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Multi-Tenant Role Access Control</span>
          </button>

          <button
            onClick={() => setActiveTab('enclaves')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'enclaves'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>2. EU Regional Data Residency Enclaves</span>
          </button>

          <button
            onClick={() => setActiveTab('pqc_sandbox')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'pqc_sandbox'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Key className="w-4 h-4 text-indigo-400" />
            <span>3. Post-Quantum Encryption (PQC) Enclave</span>
          </button>

          <button
            onClick={() => setActiveTab('key_escrow')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'key_escrow'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>4. Sovereign Audit Key Escrow & Custody</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">

        {/* TAB 1: MULTI-TENANT RBAC */}
        {activeTab === 'rbac' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Roles Matrix List */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <Users className="w-4 h-4 text-slate-700" />
                <span>Multi-Tenant Permission Specifications</span>
              </h3>

              <div className="space-y-3">
                {roles.map((r) => (
                  <div
                    key={r.role}
                    onClick={() => setSelectedRole(r.role)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedRole === r.role
                        ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{r.displayName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.accessScope === 'GLOBAL'
                            ? 'bg-purple-100 text-purple-800'
                            : r.accessScope === 'CROSS_TENANT_READ_ONLY'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}>
                          {r.accessScope}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{r.role}</span>
                    </div>

                    <p className="text-xs text-slate-600 mb-2 leading-relaxed">{r.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {r.permissions.map((p) => (
                        <span key={p} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono text-slate-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Permission Simulator */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs h-fit">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <Shield className="w-4 h-4 text-slate-700" />
                <span>Role Permission Tester</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  >
                    {roles.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.displayName} ({r.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Requested Action / Permission</label>
                  <select
                    value={testAction}
                    onChange={(e) => setTestAction(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-slate-900"
                  >
                    <option value="remediation_apply">remediation_apply (1-Click Fixes)</option>
                    <option value="audit_read_all">audit_read_all (Global Audit Trail)</option>
                    <option value="sovereignty_verify">sovereignty_verify (Data Residency Verification)</option>
                    <option value="vault_read_write">vault_read_write (Evidence Vault Access)</option>
                    <option value="pqc_verify_signatures">pqc_verify_signatures (PQC Crypto Verification)</option>
                  </select>
                </div>

                <button
                  onClick={handleCheckPermission}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-xs"
                >
                  Test Role Clearance
                </button>

                {testResult !== null && (
                  <div className={`p-3 rounded-xl border font-bold text-center flex items-center justify-center space-x-2 ${
                    testResult.allowed
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    {testResult.allowed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>CLEARANCE GRANTED</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-red-600" />
                        <span>ACCESS DENIED (403 Forbidden)</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EU REGIONAL DATA RESIDENCY ENCLAVES */}
        {activeTab === 'enclaves' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-slate-700" />
                    <span>Active Tenant Enclave Binding: {tenantName}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tenant ID: <span className="font-mono">{tenantId}</span> | Schrems II Safeguards: Active
                  </p>
                </div>

                <div className="mt-2 md:mt-0 flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Current Region:</span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold font-mono px-3 py-1 rounded-xl text-xs">
                    {tenantEnclave?.enclaveRegion || 'EU-CENTRAL-1'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {enclaves.map((e) => {
                  const isCurrent = tenantEnclave?.enclaveRegion === e.regionCode;

                  return (
                    <div
                      key={e.regionCode}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{e.regionCode}</span>
                        {isCurrent && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>BOUND</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 mb-1">{e.locationName}</h4>
                      <p className="text-[11px] text-slate-500 mb-3">
                        Sovereignty Standard: <span className="font-bold text-slate-700">{e.sovereigntyStandard}</span>
                      </p>

                      <div className="space-y-1.5 text-[11px] font-mono text-slate-600 bg-white p-3 rounded-xl border border-slate-200 mb-4">
                        <div>Algorithm: {e.pqcAlgorithm}</div>
                        <div>Latency: {e.latencyMs}ms</div>
                        <div>Cross-Border Egress: {e.crossBorderTransferAllowed ? 'ALLOWED' : 'BLOCKED (Schrems II)'}</div>
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={() => handleSwitchEnclave(e.regionCode as any)}
                          disabled={isUpdatingEnclave}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                        >
                          Switch Enclave to {e.regionCode}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: POST-QUANTUM ENCRYPTION (PQC) ENCLAVE */}
        {activeTab === 'pqc_sandbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>PQC Payload Encapsulation Engine (Kyber-1024)</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select EU Sovereign Enclave Node</label>
                  <select
                    value={pqcRegion}
                    onChange={(e) => setPqcRegion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  >
                    <option value="EU-CENTRAL-1">EU-CENTRAL-1 (Frankfurt BSI C5 Node)</option>
                    <option value="EU-WEST-1">EU-WEST-1 (Dublin Node)</option>
                    <option value="EU-WEST-3">EU-WEST-3 (Paris SecNumCloud Gaia-X Node)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payload to Encrypt</label>
                  <textarea
                    rows={4}
                    value={pqcInput}
                    onChange={(e) => setPqcInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono text-xs text-slate-900"
                  />
                </div>

                <button
                  onClick={handleRunPqcEncryption}
                  disabled={isEncrypting}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs"
                >
                  {isEncrypting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Encapsulate with CRYSTALS-Kyber-1024</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <Terminal className="w-4 h-4 text-slate-700" />
                <span>PQC Cryptographic Enclave Output</span>
              </h3>

              {pqcOutput ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                    <span className="text-slate-500 block mb-1">// Ciphertext Payload</span>
                    <p className="break-all text-amber-300">{pqcOutput.ciphertext}</p>
                  </div>

                  <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                    <span className="text-slate-500 block mb-1">// CRYSTALS-Dilithium-5 Digital Signature</span>
                    <p className="break-all text-emerald-300">{pqcOutput.digitalSignature}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 font-mono text-[11px] space-y-1">
                    <div>Algorithm: <span className="font-bold text-slate-900">{pqcOutput.algorithm}</span></div>
                    <div>Target Enclave: <span className="font-bold text-slate-900">{pqcOutput.enclaveRegion}</span></div>
                    <div>Timestamp: <span className="font-bold text-slate-900">{new Date(pqcOutput.timestamp).toLocaleString()}</span></div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Run PQC Encryption to inspect quantum-resistant key encapsulation and digital signatures.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SOVEREIGN AUDIT KEY ESCROW */}
        {activeTab === 'key_escrow' && (
          <div className="space-y-6">
            {escrowToast && (
              <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{escrowToast}</span>
                </div>
                <button onClick={() => setEscrowToast(null)} className="text-white hover:opacity-80">✕</button>
              </div>
            )}

            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Sovereign Audit Key Escrow & Dual-Custodian Rotation</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Post-quantum cryptographic root keys for signing immutable compliance audit trails and cross-border zero-knowledge tokens.
                  </p>
                </div>

                <button
                  onClick={handleRotateKey}
                  disabled={isRotatingKey}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRotatingKey ? 'animate-spin' : ''}`} />
                  <span>{isRotatingKey ? 'Rotating Key...' : 'Rotate Escrow Key (Dual Key)'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {escrowKeys.map((key) => (
                  <div key={key.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-indigo-600" />
                        <span className="font-mono font-bold text-xs text-slate-900">{key.id}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-black uppercase">
                        {key.status}
                      </span>
                    </div>

                    <div className="font-mono text-[11px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <div><span className="text-slate-400">Algorithm:</span> {key.algorithm}</div>
                      <div><span className="text-slate-400">Fingerprint:</span> <span className="text-indigo-600 font-bold">{key.keyFingerprint}</span></div>
                      <div><span className="text-slate-400">Purpose:</span> {key.purpose}</div>
                      <div><span className="text-slate-400">Custodians:</span> {key.custodianRole}</div>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Created: {new Date(key.createdDate).toLocaleDateString()}</span>
                      <span>Next Rotation: {new Date(key.rotationScheduled).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SovereigntyRoleSecurity;
