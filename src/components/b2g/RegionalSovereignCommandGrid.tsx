import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Lock, 
  FileCheck2, 
  Send, 
  RefreshCw, 
  Activity, 
  Building2, 
  MapPin, 
  Server, 
  Cpu, 
  Layers, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Database,
  CheckCircle2,
  Scale
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

export interface RegionalFramework {
  id: string;
  region_code: string;
  jurisdiction_name: string;
  primary_authority: string;
  regulations_list: string; // JSON array of string
  data_residency_rule: string;
  enforcement_level: string;
  compliance_score_percent: number;
  active_filings_count: number;
  residency_zone: string;
  last_audit_date: string;
}

export interface RegionalFiling {
  id: string;
  filing_reference: string;
  region_code: string;
  regulatory_body: string;
  framework_title: string;
  filing_type: string;
  submitting_entity: string;
  data_residency_enclave: string;
  cryptographic_seal: string;
  statutory_status: string;
  audit_findings: string;
  created_at: string;
}

const REGION_META: Record<string, { flag: string; accentColor: string; bgBadge: string; borderBadge: string }> = {
  EU: { flag: '🇪🇺', accentColor: 'text-blue-400', bgBadge: 'bg-blue-950/60', borderBadge: 'border-blue-800/60' },
  KSA: { flag: '🇸🇦', accentColor: 'text-emerald-400', bgBadge: 'bg-emerald-950/60', borderBadge: 'border-emerald-800/60' },
  UAE: { flag: '🇦🇪', accentColor: 'text-amber-400', bgBadge: 'bg-amber-950/60', borderBadge: 'border-amber-800/60' },
  US: { flag: '🇺🇸', accentColor: 'text-indigo-400', bgBadge: 'bg-indigo-950/60', borderBadge: 'border-indigo-800/60' },
  SG: { flag: '🇸🇬', accentColor: 'text-rose-400', bgBadge: 'bg-rose-950/60', borderBadge: 'border-rose-800/60' },
  UK: { flag: '🇬🇧', accentColor: 'text-purple-400', bgBadge: 'bg-purple-950/60', borderBadge: 'border-purple-800/60' },
};

export const RegionalSovereignCommandGrid: React.FC = () => {
  const [frameworks, setFrameworks] = useState<RegionalFramework[]>([]);
  const [filings, setFilings] = useState<RegionalFiling[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [isFiling, setIsFiling] = useState(false);
  const [attestingResidency, setAttestingResidency] = useState(false);
  const [attestationResult, setAttestationResult] = useState<any>(null);

  // Filing Form State
  const [formRegion, setFormRegion] = useState('KSA');
  const [formAuthority, setFormAuthority] = useState('SAMA / SDAIA');
  const [formFramework, setFormFramework] = useState('SAMA Cybersecurity Framework (CSF) & PDPL Compliance');
  const [formFilingType, setFormFilingType] = useState('STATUTORY_AUDIT_ATTESTATION');
  const [formEntity, setFormEntity] = useState('9Xen Regulettee Global Cloud Node 01 (Riyadh Tier IV)');
  const [formEnclave, setFormEnclave] = useState('me-central-riyadh-sec-zone');
  const [formFindings, setFormFindings] = useState('100% on-soil data residency verified with zero unencrypted cross-border telemetry.');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fRes, flRes] = await Promise.all([
        fetchWithRetry('/api/v1/b2g/regional/frameworks'),
        fetchWithRetry(`/api/v1/b2g/regional/filings${selectedRegion !== 'ALL' ? `?region_code=${selectedRegion}` : ''}`)
      ]);
      const fData = await fRes.json();
      const flData = await flRes.json();
      if (fData.success && Array.isArray(fData.frameworks)) {
        setFrameworks(fData.frameworks);
      }
      if (flData.success && Array.isArray(flData.filings)) {
        setFilings(flData.filings);
      }
    } catch (err) {
      console.error('Failed to load regional data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRegion]);

  const handleAttestResidency = async (regionCode: string, enclaveId: string) => {
    setAttestingResidency(true);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/regional/verify-residency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region_code: regionCode, enclave_id: enclaveId })
      });
      const data = await res.json();
      if (data.success) {
        setAttestationResult(data);
        setTimeout(() => setAttestationResult(null), 6000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAttestingResidency(false);
    }
  };

  const handleCreateFiling = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFiling(true);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/regional/filings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region_code: formRegion,
          regulatory_body: formAuthority,
          framework_title: formFramework,
          filing_type: formFilingType,
          submitting_entity: formEntity,
          data_residency_enclave: formEnclave,
          audit_findings: formFindings
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to submit regional filing:', err);
    } finally {
      setIsFiling(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Regional Sovereignty & Multi-Jurisdiction Regulator Command Grid
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                Sovereign Cloud & Enclave Attested
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous cross-border statutory compliance, geo-fenced data residency verification, and direct regulator dispatch across EU, KSA, UAE, US, SG, and UK.
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Regional Grid</span>
        </button>
      </div>

      {/* Attestation Alert Toast if active */}
      {attestationResult && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-300 animate-in fade-in duration-200 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Hardware Enclave Attested:</strong> {attestationResult.enclave_id} ({attestationResult.region_code}) • Latency {attestationResult.latency_ms}ms • Geo-Lock SHA-256: {attestationResult.attestation_hash.slice(0, 20)}...
            </span>
          </div>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-200 border border-emerald-700/50">
            AIR-GAPPED COMPLIANT
          </span>
        </div>
      )}

      {/* Regional Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedRegion('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            selectedRegion === 'ALL'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          🌐 Global Sovereignty Overview ({frameworks.length})
        </button>
        {frameworks.map((f) => {
          const meta = REGION_META[f.region_code] || { flag: '🌐', accentColor: 'text-slate-300', bgBadge: 'bg-slate-800', borderBadge: 'border-slate-700' };
          const isSelected = selectedRegion === f.region_code;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedRegion(f.region_code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : `${meta.bgBadge} ${meta.accentColor} border ${meta.borderBadge} hover:bg-slate-800`
              }`}
            >
              <span>{meta.flag}</span>
              <span>{f.region_code}</span>
              <span className="text-[10px] font-mono opacity-80 font-normal">({f.compliance_score_percent}%)</span>
            </button>
          );
        })}
      </div>

      {/* Framework Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {frameworks
          .filter(f => selectedRegion === 'ALL' || f.region_code === selectedRegion)
          .map((f) => {
            const meta = REGION_META[f.region_code] || { flag: '🌐', accentColor: 'text-slate-300', bgBadge: 'bg-slate-800', borderBadge: 'border-slate-700' };
            let regulations: string[] = [];
            try {
              regulations = JSON.parse(f.regulations_list);
            } catch (e) {
              regulations = [f.regulations_list];
            }

            return (
              <div key={f.id} className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3.5 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meta.flag}</span>
                      <span className="font-bold text-sm text-white">{f.region_code}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {f.compliance_score_percent}% Compliant
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-200">{f.jurisdiction_name}</h3>

                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Regulators: </span>
                    <span>{f.primary_authority}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {regulations.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Server className="w-3 h-3 text-indigo-400" />
                      Enclave:
                    </span>
                    <span className="text-slate-200 truncate max-w-[150px]">{f.residency_zone}</span>
                  </div>

                  <button
                    onClick={() => handleAttestResidency(f.region_code, f.residency_zone)}
                    disabled={attestingResidency}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-900/40 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Attest Hardware Geo-Lock</span>
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Split Section: Dispatch New Regional Filing & Sovereign Filings Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Left: Dispatch Statutory Filing Form */}
        <div className="lg:col-span-5 bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-indigo-400" />
              Dispatch Statutory Regulatory Filing
            </span>
            <span className="text-[11px] font-mono text-indigo-400 font-bold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
              SHA-256 Sealed
            </span>
          </div>

          <form onSubmit={handleCreateFiling} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Region</label>
                <select
                  value={formRegion}
                  onChange={(e) => {
                    const r = e.target.value;
                    setFormRegion(r);
                    if (r === 'KSA') {
                      setFormAuthority('SDAIA / SAMA');
                      setFormFramework('SAMA CSF & SDAIA PDPL Statutory Filing');
                      setFormEnclave('me-central-riyadh-sec-zone');
                    } else if (r === 'EU') {
                      setFormAuthority('EDPB / EBA');
                      setFormFramework('EU DORA ICT Third-Party Register & GDPR');
                      setFormEnclave('eu-central-frankfurt-enclave');
                    } else if (r === 'UAE') {
                      setFormAuthority('UAE CSC / CBUAE');
                      setFormFramework('CBUAE Cyber Resilience Standard Attestation');
                      setFormEnclave('me-central-dubai-adgm-vault');
                    } else if (r === 'US') {
                      setFormAuthority('SEC / CISA');
                      setFormFramework('SEC Item 1.05 & FedRAMP High Attestation');
                      setFormEnclave('us-gov-east-ashburn');
                    } else if (r === 'SG') {
                      setFormAuthority('MAS / PDPC');
                      setFormFramework('MAS Technology Risk Management (TRM) Filing');
                      setFormEnclave('ap-southeast-singapore-jurong');
                    } else if (r === 'UK') {
                      setFormAuthority('ICO / FCA');
                      setFormFramework('FCA Operational Resilience (PS21/3) Report');
                      setFormEnclave('uk-south-london-enclave');
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="KSA">🇸🇦 KSA (SDAIA / SAMA)</option>
                  <option value="EU">🇪🇺 EU (EDPB / DORA)</option>
                  <option value="UAE">🇦🇪 UAE (CSC / CBUAE)</option>
                  <option value="US">🇺🇸 US (SEC / FedRAMP)</option>
                  <option value="SG">🇸🇬 SG (MAS / PDPC)</option>
                  <option value="UK">🇬🇧 UK (ICO / FCA)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Regulatory Body</label>
                <input
                  type="text"
                  value={formAuthority}
                  onChange={(e) => setFormAuthority(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Statutory Framework Title</label>
              <input
                type="text"
                value={formFramework}
                onChange={(e) => setFormFramework(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Filing Type</label>
                <select
                  value={formFilingType}
                  onChange={(e) => setFormFilingType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="STATUTORY_AUDIT_ATTESTATION">Audit Attestation</option>
                  <option value="DORA_ICT_REGISTER">DORA ICT Register</option>
                  <option value="DATA_RESIDENCY_CERTIFICATE">Residency Certificate</option>
                  <option value="SEC_ITEM_105_DISCLOSURE">SEC 1.05 Disclosure</option>
                  <option value="CROSS_BORDER_IMPACT_DPIA">Cross-Border DPIA</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Residency Enclave</label>
                <input
                  type="text"
                  value={formEnclave}
                  onChange={(e) => setFormEnclave(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Submitting Entity Node</label>
              <input
                type="text"
                value={formEntity}
                onChange={(e) => setFormEntity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Audit Findings & Attestation Summary</label>
              <textarea
                rows={2}
                value={formFindings}
                onChange={(e) => setFormFindings(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isFiling}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isFiling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isFiling ? 'Cryptographically Sealing & Transmitting...' : 'Sign & Transmit to Sovereign Regulator'}</span>
            </button>
          </form>
        </div>

        {/* Right: Filings Ledger */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
              Certified Regional Filings & Regulatory Receipts ({filings.length})
            </span>
            <span className="text-[11px] text-slate-500">Live Regulator Sync</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {filings.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs">
                No statutory filings recorded for the selected jurisdiction. Use the form on the left to dispatch an attestation.
              </div>
            ) : (
              filings.map((filing) => {
                const meta = REGION_META[filing.region_code] || { flag: '🌐', accentColor: 'text-slate-300', bgBadge: 'bg-slate-800', borderBadge: 'border-slate-700' };
                return (
                  <div key={filing.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 hover:border-slate-700 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{meta.flag}</span>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-indigo-300 border border-indigo-900/40">
                          {filing.filing_reference}
                        </span>
                        <h4 className="text-xs font-bold text-white">{filing.regulatory_body}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                        {filing.statutory_status}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-200">
                      {filing.framework_title}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2 rounded-lg font-mono text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Submitting Node</span>
                        <span className="text-slate-300 truncate block">{filing.submitting_entity}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Enclave Storage Zone</span>
                        <span className="text-indigo-300 truncate block">{filing.data_residency_enclave}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 p-2 rounded border border-slate-800/60 space-y-1 font-mono text-[10px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-slate-500 font-bold">Cryptographic Sovereign Seal:</span>
                        <span className="text-emerald-400 font-semibold truncate max-w-[280px]">{filing.cryptographic_seal}</span>
                      </div>
                      <div className="text-slate-400 italic">
                        "{filing.audit_findings}"
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-800/60 font-mono text-[10px] text-slate-500">
                      <span>Submitted: {new Date(filing.created_at).toLocaleString()}</span>
                      <span className="text-indigo-400 flex items-center gap-1 font-semibold">
                        <Lock className="w-3 h-3" />
                        Air-Gapped Merkle Lock
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
