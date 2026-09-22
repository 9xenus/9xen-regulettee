import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Shield, 
  RefreshCw, 
  Server, 
  Eye, 
  EyeOff, 
  Trash2, 
  Lock, 
  Unlock, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Terminal, 
  Clock,
  Plus,
  Zap,
  Info
} from 'lucide-react';

interface OperationalKey {
  id: string;
  encryptedKeyValue: string;
  iv: string;
  authTag: string;
  isActive: boolean;
  createdAt: string;
  rotatedAt?: string;
}

interface StoredPii {
  id: string;
  dataType: string;
  encryptedValue: string;
  keyVersion: string;
  createdAt: string;
}

interface RotationLog {
  id: string;
  action: string;
  triggeredBy: string;
  details: string;
  timestamp: string;
}

interface EncryptionStatus {
  activeVersion: string;
  totalKeysCount: number;
  rotationScheduleDays: number;
  masterKeyFingerprint: string;
  keys: OperationalKey[];
  logs: RotationLog[];
  recordsCount: number;
}

export const DataSecurityManager: React.FC = () => {
  // Local state
  const [status, setStatus] = useState<EncryptionStatus | null>(null);
  const [records, setRecords] = useState<StoredPii[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New PII Form State
  const [newPiiId, setNewPiiId] = useState('');
  const [newPiiType, setNewPiiType] = useState('SSN');
  const [newPiiValue, setNewPiiValue] = useState('');

  // Decrypted values map (id -> value)
  const [decryptedValues, setDecryptedValues] = useState<Record<string, string>>({});
  const [visibleDecrypted, setVisibleDecrypted] = useState<Record<string, boolean>>({});

  // Fetch Encryption Metadata and Vault Records
  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-jwt-token',
        'x-tenant-context': 'org_1'
      };

      // Fetch status
      const statusRes = await fetchWithRetry('/api/v1/security/encryption/status', { headers });
      if (!statusRes.ok) throw new Error('Failed to load encryption status');
      const statusData = await statusRes.json();
      setStatus(statusData);

      // Fetch stored vault records
      const vaultRes = await fetchWithRetry('/api/v1/security/encryption/vault/list', { headers });
      if (!vaultRes.ok) throw new Error('Failed to load secure vault records');
      const vaultData = await vaultRes.json();
      setRecords(vaultData);

      setError(null);
    } catch (e: any) {
      setError(e.message || 'An error occurred while loading data security controls');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle manual key rotation
  const handleRotateKey = async () => {
    setActionLoading('rotating');
    setSuccessMsg(null);
    try {
      const res = await fetchWithRetry('/api/v1/security/encryption/rotate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token',
          'x-tenant-context': 'org_1'
        }
      });
      if (!res.ok) throw new Error('Rotation failed');
      const data = await res.json();
      setSuccessMsg(`Operational Key successfully rotated! Created active version: ${data.status.activeVersion}`);
      setStatus(data.status);
      fetchData(true);
    } catch (e: any) {
      setError(e.message || 'Failed to rotate key');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle dynamic re-encryption migration
  const handleReencryptData = async () => {
    setActionLoading('reencrypting');
    setSuccessMsg(null);
    try {
      const res = await fetchWithRetry('/api/v1/security/encryption/reencrypt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token',
          'x-tenant-context': 'org_1'
        }
      });
      if (!res.ok) throw new Error('Re-encryption migration failed');
      const data = await res.json();
      setSuccessMsg(`SaaS database migration completed. ${data.result.successCount} records successfully migrated and re-encrypted at rest under latest key version ${data.status.activeVersion}`);
      setStatus(data.status);
      fetchData(true);
    } catch (e: any) {
      setError(e.message || 'Failed to execute database re-encryption');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle storing new PII record
  const handleStorePii = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPiiId || !newPiiValue) {
      setError('Please fill in both the Identifier and Plaintext Value.');
      return;
    }
    setActionLoading('storing');
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetchWithRetry('/api/v1/security/encryption/vault/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token',
          'x-tenant-context': 'org_1'
        },
        body: JSON.stringify({
          id: newPiiId,
          dataType: newPiiType,
          plainValue: newPiiValue
        })
      });
      if (!res.ok) throw new Error('Vault write operation failed.');
      const data = await res.json();
      
      setSuccessMsg(`PII field '${newPiiId}' successfully encrypted and committed to compliant disk storage.`);
      setNewPiiId('');
      setNewPiiValue('');
      fetchData(true);
    } catch (e: any) {
      setError(e.message || 'Failed to store PII record');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle on-demand decryption with audit logging
  const handleDecryptPii = async (id: string) => {
    if (visibleDecrypted[id]) {
      // Toggle visibility off
      setVisibleDecrypted(prev => ({ ...prev, [id]: false }));
      return;
    }

    try {
      const res = await fetchWithRetry('/api/v1/security/encryption/vault/decrypt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token',
          'x-tenant-context': 'org_1'
        },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Authorization check or decryption failed.');
      const data = await res.json();
      
      setDecryptedValues(prev => ({ ...prev, [id]: data.plainValue }));
      setVisibleDecrypted(prev => ({ ...prev, [id]: true }));
      fetchData(true); // Fetch updated audit log
    } catch (e: any) {
      setError(`Failed to decrypt field '${id}': ${e.message}`);
    }
  };

  // Handle secure purging (GDPR Article 17)
  const handleDeletePii = async (id: string) => {
    if (!confirm(`Are you sure you want to permanently erase record '${id}' from the vault? This satisfies the GDPR Article 17 Right to Be Forgotten and is irreversible.`)) {
      return;
    }
    setActionLoading(`deleting-${id}`);
    try {
      const res = await fetchWithRetry(`/api/v1/security/encryption/vault/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token',
          'x-tenant-context': 'org_1'
        }
      });
      if (!res.ok) throw new Error('Purge command failed.');
      
      setSuccessMsg(`PII record '${id}' and all corresponding cryptographic metadata permanently expunged.`);
      fetchData(true);
    } catch (e: any) {
      setError(`Failed to purge record: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Securing session and reading Master Key Vault...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-rose-800">Security Exception Encountered</h4>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-emerald-800">Compliance Action Logged</h4>
            <p className="text-xs text-emerald-700 mt-1">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Key Version</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase border border-emerald-200 animate-pulse">Active</span>
            </div>
            <div className="text-2xl font-black text-slate-800 font-mono tracking-tight">{status?.activeVersion}</div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-indigo-500" /> AES-256-GCM Envelope Encryption
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Master Key Wrap</span>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full uppercase border border-indigo-200">Hardware HSM</span>
            </div>
            <div className="text-2xl font-black text-slate-800 font-mono tracking-tight">{status?.masterKeyFingerprint}</div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-indigo-500" /> Dual-Layer Wrapper Active
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vaulted PII Records</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black rounded-full uppercase">GDPR Vault</span>
            </div>
            <div className="text-3xl font-black text-slate-800 tracking-tight">{status?.recordsCount} fields</div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-indigo-500" /> Compliant Storage-at-Rest
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rotation Policy</span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full uppercase border border-amber-200">Automated</span>
            </div>
            <div className="text-3xl font-black text-slate-800 tracking-tight">{status?.rotationScheduleDays} Days</div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" /> Next rotation: Scheduled
          </div>
        </div>
      </div>

      {/* Main Grid: Vault Actions and Keys */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left 2 Columns: Secure PII Vault Manager */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Section: Secure Form */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">GDPR Compliance PII Vault</h3>
                <p className="text-xs text-slate-500 mt-0.5">Encrypt and commit customer Personal Identifiable Information (PII) securely using dynamic AES-256 keys.</p>
              </div>
            </div>

            <form onSubmit={handleStorePii} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Record Identifier (e.g., user_101_email)</label>
                <input 
                  type="text" 
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., user_1852_ssn"
                  value={newPiiId}
                  onChange={(e) => setNewPiiId(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">PII Data Type Classification</label>
                <select 
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={newPiiType}
                  onChange={(e) => setNewPiiType(e.target.value)}
                >
                  <option value="SSN">Social Security Number / Tax ID</option>
                  <option value="EMAIL">Customer Email Address</option>
                  <option value="PHONE">Mobile Phone Number</option>
                  <option value="FULL_NAME">Legal Full Name</option>
                  <option value="PASSPORT">Passport / ID Document</option>
                </select>
              </div>

              <div>
                <button 
                  type="submit"
                  disabled={actionLoading === 'storing'}
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading === 'storing' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Encrypt & Vault Field
                </button>
              </div>

              <div className="md:col-span-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">PII Plaintext Secret Value</label>
                <textarea
                  rows={2}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter the sensitive PII content to encrypt at rest (e.g. DE-8524-1184-90)"
                  value={newPiiValue}
                  onChange={(e) => setNewPiiValue(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Section: Vault Records Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">Cryptographic Records Proof</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Visual verification of data-at-rest encryption. All fields are stored transformed using AES-256-GCM.</p>
              </div>
              <button 
                onClick={() => fetchData()}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Refresh Vault
              </button>
            </div>

            {records.length === 0 ? (
              <div className="p-12 text-center">
                <Lock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-xs font-semibold">The secure vault is currently empty. Input sensitive customer data above to test at-rest encryption.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
                    <tr>
                      <th className="p-4">Record ID / Class</th>
                      <th className="p-4">Encrypted Ciphertext At Rest (Database Storage)</th>
                      <th className="p-4">Key Version</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-xs text-slate-800">{r.id}</div>
                          <span className={`inline-block mt-1 text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                            r.dataType === 'SSN' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            r.dataType === 'EMAIL' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                            r.dataType === 'PHONE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}>
                            {r.dataType}
                          </span>
                        </td>
                        
                        <td className="p-4 max-w-xs md:max-w-md">
                          {visibleDecrypted[r.id] ? (
                            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-lg text-xs font-bold font-mono flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
                              <span className="flex items-center gap-1.5">
                                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                {decryptedValues[r.id]}
                              </span>
                              <span className="text-[8px] uppercase tracking-widest text-emerald-500 font-bold font-sans">Decrypted (Logged)</span>
                            </div>
                          ) : (
                            <div className="bg-slate-900 text-slate-400 p-2.5 rounded-lg text-[10px] font-mono select-all overflow-x-auto border border-slate-800 max-h-20 break-all leading-relaxed shadow-inner">
                              {r.encryptedValue}
                            </div>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 font-mono text-[10px] font-black rounded border border-slate-200/80">
                            {r.keyVersion}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleDecryptPii(r.id)}
                              className={`p-1.5 border rounded-lg transition-all flex items-center gap-1 ${
                                visibleDecrypted[r.id] 
                                  ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                              }`}
                              title={visibleDecrypted[r.id] ? 'Hide Value' : 'Decrypt on-demand (Audit event will be logged)'}
                            >
                              {visibleDecrypted[r.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button 
                              onClick={() => handleDeletePii(r.id)}
                              disabled={actionLoading === `deleting-${r.id}`}
                              className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition-all"
                              title="GDPR Right to Be Forgotten (Purge entirely)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Key Lifecycle & Rotation Schedule */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Section: Operational Key Lifecycle */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Key Lifecycle Schedule</h3>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded border border-indigo-200 uppercase">Master-Wrapping</span>
            </div>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              GDPR security standard recommends rotating operational data keys every <strong>90 days</strong>. Older keys are retired (retained as read-only) or data is re-encrypted at rest under the new active wrapping key.
            </p>

            <div className="space-y-3 mb-5">
              <button 
                onClick={handleRotateKey}
                disabled={actionLoading !== null}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'rotating' ? 'animate-spin' : ''}`} />
                {actionLoading === 'rotating' ? 'Generating Wrapping Key...' : 'Rotate Operational Key'}
              </button>

              <button 
                onClick={handleReencryptData}
                disabled={actionLoading !== null}
                className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                title="Re-encrypts all stored historical PII records under the latest key, allowing safe decommission of old keys."
              >
                <Zap className={`w-3.5 h-3.5 ${actionLoading === 'reencrypting' ? 'animate-spin' : ''}`} />
                {actionLoading === 'reencrypting' ? 'Re-encrypting Disk...' : 'Migrate & Re-encrypt Database'}
              </button>
            </div>

            {/* List of Keys in DB */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">SaaS Key Rings List</h4>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {status?.keys.map((k) => (
                  <div key={k.id} className={`p-3 border rounded-xl flex items-center justify-between gap-2 transition-all ${
                    k.isActive 
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' 
                      : 'bg-slate-50/80 border-slate-200/80'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-800">{k.id}</span>
                        {k.isActive ? (
                          <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[8px] font-black rounded uppercase">Active</span>
                        ) : (
                          <span className="px-1.5 py-0.2 bg-slate-300 text-slate-700 text-[8px] font-bold rounded uppercase">Retired</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">Wrapped Value: {k.encryptedKeyValue}</div>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 font-semibold">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Live Security Event Feed (Terminal Style) */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl shadow-lg p-5 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xs uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Security Event Ledger</span>
              </div>
              <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Audit logs</span>
            </div>

            <div className="space-y-3 font-mono text-[10px] leading-relaxed max-h-72 overflow-y-auto pr-1 text-slate-300">
              {status?.logs && status.logs.length > 0 ? (
                status.logs.map((log) => (
                  <div key={log.id} className="border-b border-slate-800/40 pb-2">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[9px] font-bold text-indigo-400">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 leading-normal">
                      Triggered by: <strong className="text-slate-100">{log.triggeredBy}</strong>
                    </p>
                    {log.details && (
                      <p className="text-slate-500 mt-0.5 text-[9px] break-all">
                        Details: {log.details}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-center py-4 sm:py-6">
                  No cryptographic audit logs recorded yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
