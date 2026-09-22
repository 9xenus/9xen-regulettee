import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Lock, 
  Key, 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Sliders, 
  Save, 
  ShieldAlert, 
  Download, 
  FileCheck2, 
  Cpu, 
  Database,
  ExternalLink,
  Info
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';
import { useNotification } from '../../context/NotificationContext';

export interface RegionalResidencyConfig {
  id: string;
  region_code: string;
  region_name: string;
  enclave_identifier: string;
  cross_border_rule: string;
  encryption_standard: string;
  key_management_type: string;
  telemetry_egress_policy: string;
  subpoena_shield_mode: string;
  statutory_retention_days: number;
  enforcement_active: number;
  tenant_override_allowed: number;
  role_access_level: string;
  compliance_frameworks: string; // JSON string
  status: string;
  updated_at: string;
}

interface Props {
  role?: 'SUPER_ADMIN' | 'REGULATOR' | 'CLIENT_ADMIN';
  compact?: boolean;
}

const REGION_FLAGS: Record<string, { flag: string; badgeColor: string }> = {
  EU: { flag: '🇪🇺', badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700/60' },
  KSA: { flag: '🇸🇦', badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60' },
  UAE: { flag: '🇦🇪', badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700/60' },
  US: { flag: '🇺🇸', badgeColor: 'bg-indigo-900/60 text-indigo-300 border-indigo-700/60' },
  SG: { flag: '🇸🇬', badgeColor: 'bg-rose-900/60 text-rose-300 border-rose-700/60' },
  UK: { flag: '🇬🇧', badgeColor: 'bg-purple-900/60 text-purple-300 border-purple-700/60' },
  CH: { flag: '🇨🇭', badgeColor: 'bg-red-900/60 text-red-300 border-red-700/60' },
  JP: { flag: '🇯🇵', badgeColor: 'bg-teal-900/60 text-teal-300 border-teal-700/60' },
};

export const RegionalDataResidencyConfigManager: React.FC<Props> = ({ 
  role = 'SUPER_ADMIN', 
  compact = false 
}) => {
  const { showToast } = useNotification();
  const [configs, setConfigs] = useState<RegionalResidencyConfig[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<Partial<RegionalResidencyConfig> | null>(null);
  const [attestationLoading, setAttestationLoading] = useState<string | null>(null);
  const [attestationProof, setAttestationProof] = useState<any | null>(null);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry(`/api/v1/b2g/regional/residency-configs${selectedRegion !== 'ALL' ? `?region_code=${selectedRegion}` : ''}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.configs)) {
        setConfigs(data.configs);
      }
    } catch (err) {
      console.error('Failed to load residency configs:', err);
      showToast('Failed to retrieve regional residency configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [selectedRegion]);

  const handleUpdateField = (id: string, field: keyof RegionalResidencyConfig, value: any) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSaveConfig = async (config: RegionalResidencyConfig) => {
    setSavingId(config.id);
    try {
      const res = await fetchWithRetry(`/api/v1/b2g/regional/residency-configs/${config.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cross_border_rule: config.cross_border_rule,
          encryption_standard: config.encryption_standard,
          key_management_type: config.key_management_type,
          telemetry_egress_policy: config.telemetry_egress_policy,
          subpoena_shield_mode: config.subpoena_shield_mode,
          statutory_retention_days: config.statutory_retention_days,
          enforcement_active: config.enforcement_active,
          tenant_override_allowed: config.tenant_override_allowed,
          role_access_level: config.role_access_level,
          status: config.status
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Residency parameters for ${config.region_code} saved and verified on sovereign grid`, 'success');
        fetchConfigs();
      } else {
        showToast(data.error || 'Update failed', 'error');
      }
    } catch (err) {
      console.error('Failed to update residency config:', err);
      showToast('Network error updating residency config', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleBulkEnforceAll = async (enforce: boolean) => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/regional/residency-configs/bulk-enforce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enforcement_active: enforce })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Global Data Residency ${enforce ? 'Strict Geo-Lock ENFORCED' : 'Switched to Monitoring'} across all regions`, 'success');
        fetchConfigs();
      }
    } catch (err) {
      showToast('Failed to apply bulk policy', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyHardwareEnclave = async (regionCode: string, enclaveId: string) => {
    setAttestationLoading(regionCode);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/regional/verify-residency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region_code: regionCode, enclave_id: enclaveId })
      });
      const data = await res.json();
      if (data.success) {
        setAttestationProof(data);
        showToast(`Hardware enclave geo-lock verified for ${regionCode} (${data.latency_ms}ms)`, 'success');
      }
    } catch (e) {
      showToast('Enclave verification failed', 'error');
    } finally {
      setAttestationLoading(null);
    }
  };

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isRegulator = role === 'REGULATOR';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 text-slate-100">
      
      {/* Header & Global Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Sovereign Data Residency & Cryptographic Enclave Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                {isSuperAdmin ? '⚡ SaaS Admin Authority' : isRegulator ? '🛡️ Statutory Regulator View' : '🏢 Tenant Policy Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Comprehensive multi-jurisdictional data residency governance. Configures hardware HSM cryptographic key bindings (HYOK/BYOK), air-gapped cross-border transfer controls, telemetry scrubbing policies, and statutory subpoena shielding across global regulatory domains.
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {isSuperAdmin && (
            <>
              <button
                onClick={() => handleBulkEnforceAll(true)}
                disabled={loading}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Enforce All Regions</span>
              </button>
              <button
                onClick={() => handleBulkEnforceAll(false)}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Monitoring Mode</span>
              </button>
            </>
          )}

          <button
            onClick={fetchConfigs}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Refresh residency grid"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Attestation Alert Toast */}
      {attestationProof && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200 font-mono shadow-xl">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-xs">
                Hardware Enclave Proof-of-Residency Attested: {attestationProof.enclave_id}
              </div>
              <div className="text-[11px] text-emerald-300/80">
                Region: {attestationProof.region_code} • PTT Latency: {attestationProof.latency_ms}ms • Geo-Lock SHA-256: {attestationProof.attestation_hash}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setAttestationProof(null)}
            className="px-3 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded text-[10px] font-bold self-start sm:self-auto cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Jurisdiction Selector Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedRegion('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            selectedRegion === 'ALL'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          🌐 All Jurisdictions ({configs.length})
        </button>
        {configs.map((c) => {
          const meta = REGION_FLAGS[c.region_code] || { flag: '🌐', badgeColor: 'bg-slate-800 text-slate-300 border-slate-700' };
          const isSelected = selectedRegion === c.region_code;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedRegion(c.region_code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md'
                  : `${meta.badgeColor} border hover:bg-slate-800`
              }`}
            >
              <span>{meta.flag}</span>
              <span>{c.region_code}</span>
              <span className={`w-2 h-2 rounded-full ${c.enforcement_active === 1 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </button>
          );
        })}
      </div>

      {/* Configuration Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {configs
          .filter(c => selectedRegion === 'ALL' || c.region_code === selectedRegion)
          .map((config) => {
            const meta = REGION_FLAGS[config.region_code] || { flag: '🌐', badgeColor: 'bg-slate-800 text-slate-300 border-slate-700' };
            let frameworks: string[] = [];
            try {
              frameworks = JSON.parse(config.compliance_frameworks);
            } catch (e) {
              frameworks = [config.compliance_frameworks];
            }

            return (
              <div 
                key={config.id} 
                className="bg-slate-950 rounded-xl border border-slate-800 p-4 sm:p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
              >
                {/* Card Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{meta.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{config.region_name}</h3>
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {config.region_code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Enclave Node: <span className="text-indigo-300">{config.enclave_identifier}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        config.enforcement_active === 1
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {config.enforcement_active === 1 ? 'STRICT GEO-LOCKED' : 'MONITORING'}
                      </span>
                    </div>
                  </div>

                  {/* Framework tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {frameworks.map((fw, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono font-medium">
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Configuration Parameter Controls */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
                  
                  {/* Row 1: Cross-Border Rule & Encryption */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Cross-Border Transfer Rule
                      </label>
                      {isSuperAdmin ? (
                        <select
                          value={config.cross_border_rule}
                          onChange={(e) => handleUpdateField(config.id, 'cross_border_rule', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        >
                          <option value="STRICT_EEA_AIRGAP_MANDATE">Strict EEA Airgap Mandate</option>
                          <option value="NATIONAL_TERRITORY_LOCAL_LOCK">National Territory Local Lock</option>
                          <option value="SOVEREIGN_ONSHORE_ENCLAVE">Sovereign Onshore Enclave</option>
                          <option value="CONUS_FEDRAMP_GOVCLOUD_ONLY">CONUS FedRAMP GovCloud Only</option>
                          <option value="TRM_DESIGNATED_OUTSOURCING_LOCK">TRM Designated Outsourcing Lock</option>
                          <option value="UK_ADEQUACY_BRIDGED_ENCLAVE">UK Adequacy Bridged Enclave</option>
                          <option value="STRICT_SWISS_FDPIC_BANKING_SECRECY">Swiss FDPIC Banking Secrecy</option>
                          <option value="APPI_DESIGNATED_ADEQUATE_LOCK">APPI Designated Adequate Lock</option>
                        </select>
                      ) : (
                        <div className="font-mono text-xs text-indigo-300 truncate">
                          {config.cross_border_rule}
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Encryption Standard & Quantum Shield
                      </label>
                      {isSuperAdmin ? (
                        <input
                          type="text"
                          value={config.encryption_standard}
                          onChange={(e) => handleUpdateField(config.id, 'encryption_standard', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      ) : (
                        <div className="font-mono text-xs text-emerald-400 truncate">
                          {config.encryption_standard}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Key Management & Subpoena Shield */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Key Management Architecture
                      </label>
                      {isSuperAdmin ? (
                        <select
                          value={config.key_management_type}
                          onChange={(e) => handleUpdateField(config.id, 'key_management_type', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        >
                          <option value="HYOK_SOVEREIGN_HSM">HYOK (Hold Your Own Key) Sovereign HSM</option>
                          <option value="BYOK_REGIONAL_VAULT">BYOK (Bring Your Own Key) Regional Vault</option>
                          <option value="CMEK_FIPS_140_3">CMEK FIPS 140-3 Level 3 Dedicated Key</option>
                        </select>
                      ) : (
                        <div className="font-mono text-xs text-slate-300">
                          {config.key_management_type}
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Subpoena & Judicial Shield Mode
                      </label>
                      {isSuperAdmin ? (
                        <select
                          value={config.subpoena_shield_mode}
                          onChange={(e) => handleUpdateField(config.id, 'subpoena_shield_mode', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        >
                          <option value="EU_BLOCKING_STATUTE_2271_96">EU Blocking Statute 2271/96 (Anti-CLOUD Act)</option>
                          <option value="KSA_SDAIA_LOCAL_COURT_ONLY">KSA SDAIA / Local Court Warrant Only</option>
                          <option value="UAE_FEDERAL_LAW_45_PROTECTED">UAE Federal Law 45 Protected</option>
                          <option value="US_DOJ_DIRECT_WARRANT_CONUS">US DOJ Direct CONUS Warrant Only</option>
                          <option value="SINGAPORE_HIGH_COURT_ONLY">Singapore High Court Warrant</option>
                          <option value="UK_IPA_JUDICIAL_WARRANT">UK IPA Judicial Commissioner Warrant</option>
                          <option value="SWISS_FEDERAL_ACT_DATA_PROTECTION">Swiss FADP Absolute Bank Secrecy</option>
                          <option value="JAPAN_MINISTRY_JUSTICE_ONLY">Japan Ministry of Justice Certified</option>
                        </select>
                      ) : (
                        <div className="font-mono text-xs text-amber-300 truncate">
                          {config.subpoena_shield_mode}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Telemetry Egress & Statutory Retention */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Telemetry Egress & SIEM Scrubbing
                      </label>
                      {isSuperAdmin ? (
                        <select
                          value={config.telemetry_egress_policy}
                          onChange={(e) => handleUpdateField(config.id, 'telemetry_egress_policy', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        >
                          <option value="ZERO_FOREIGN_EGRESS_LOCAL_ONLY">Zero Foreign Egress (Local Only)</option>
                          <option value="LOCAL_REGULATOR_SIEM_FORWARDING">Local Regulator SIEM Forwarding</option>
                          <option value="CONUS_SIEM_AUDIT_TRAIL">CONUS SIEM Audit Trail</option>
                          <option value="APEC_CBPR_PSEUDONYMIZED_RELAY">APEC CBPR Pseudonymized Relay</option>
                          <option value="ICO_AUDIT_LOG_SCRUBBED">ICO Audit Log Scrubbed</option>
                          <option value="PPC_JAPAN_AUDIT_LOGGING">PPC Japan Local Audit Logging</option>
                        </select>
                      ) : (
                        <div className="font-mono text-xs text-slate-300">
                          {config.telemetry_egress_policy}
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Statutory Retention (Days / Years)
                      </label>
                      <div className="flex items-center gap-2">
                        {isSuperAdmin ? (
                          <input
                            type="number"
                            value={config.statutory_retention_days}
                            onChange={(e) => handleUpdateField(config.id, 'statutory_retention_days', parseInt(e.target.value) || 0)}
                            className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                          />
                        ) : (
                          <span className="font-mono text-xs text-slate-200">{config.statutory_retention_days} days</span>
                        )}
                        <span className="text-[11px] text-slate-500 font-mono">
                          (~{(config.statutory_retention_days / 365).toFixed(1)} years statutory lock)
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyHardwareEnclave(config.region_code, config.enclave_identifier)}
                      disabled={attestationLoading === config.region_code}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-900/50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Cpu className={`w-3.5 h-3.5 ${attestationLoading === config.region_code ? 'animate-spin' : ''}`} />
                      <span>{attestationLoading === config.region_code ? 'Verifying HSM...' : 'Hardware Enclave Proof'}</span>
                    </button>

                    {isSuperAdmin && (
                      <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer ml-1">
                        <input
                          type="checkbox"
                          checked={config.enforcement_active === 1}
                          onChange={(e) => handleUpdateField(config.id, 'enforcement_active', e.target.checked ? 1 : 0)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                        />
                        <span>Geo-Lock Active</span>
                      </label>
                    )}
                  </div>

                  {isSuperAdmin && (
                    <button
                      onClick={() => handleSaveConfig(config)}
                      disabled={savingId === config.id}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {savingId === config.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save & Re-attest</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
      </div>
    </div>
  );
};
