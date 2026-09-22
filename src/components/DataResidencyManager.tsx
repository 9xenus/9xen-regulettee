import React, { useState } from 'react';
import { 
  Database, 
  Globe2, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  RefreshCw, 
  Save, 
  Check, 
  Sliders
} from 'lucide-react';

interface ResidencyRegion {
  id: string;
  name: string;
  country: string;
  provider: string;
  sovereignGrade: 'TIER_4_SOVEREIGN' | 'EU_ISOLATED' | 'CROSS_BORDER_RESTRICTED';
  activeVaults: number;
  dataSizeGB: number;
  encryptionStandard: string;
}

const mockRegions: ResidencyRegion[] = [
  {
    id: 'EU-DE-FRA-01',
    name: 'Frankfurt Confidential Enclave',
    country: 'Germany (BfDI/DSGVO)',
    provider: 'AWS European Sovereign Cloud',
    sovereignGrade: 'TIER_4_SOVEREIGN',
    activeVaults: 48,
    dataSizeGB: 1840,
    encryptionStandard: 'AES-256-GCM + ML-KEM-768'
  },
  {
    id: 'EU-FR-PAR-01',
    name: 'Paris Sovereign Core (SecNumCloud)',
    country: 'France (CNIL/ANSSI)',
    provider: 'OVHcloud Hosted Private Cloud',
    sovereignGrade: 'TIER_4_SOVEREIGN',
    activeVaults: 32,
    dataSizeGB: 920,
    encryptionStandard: 'ANSSI Certified HSM Tier-4'
  },
  {
    id: 'EU-IE-DUB-01',
    name: 'Dublin Tech Vault',
    country: 'Ireland (DPC)',
    provider: 'Microsoft Cloud for Sovereignty',
    sovereignGrade: 'EU_ISOLATED',
    activeVaults: 24,
    dataSizeGB: 680,
    encryptionStandard: 'Customer Managed Key (BYOK)'
  }
];

export interface DataResidencyManagerProps {
  profileType?: string;
  currentRegion?: string;
  onPolicyUpdate?: (region: any, override: any) => void;
  className?: string;
}

export const DataResidencyManager: React.FC<DataResidencyManagerProps> = ({
  profileType,
  currentRegion,
  onPolicyUpdate,
  className = ''
}) => {
  const [regions, setRegions] = useState<ResidencyRegion[]>(mockRegions);
  const [enforceStrictSovereignty, setEnforceStrictSovereignty] = useState(true);
  const [blockThirdCountryExport, setBlockThirdCountryExport] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">EU Data Residency &amp; Sovereign Enclave Manager</h3>
            <p className="text-xs text-slate-400">Enforce geographic perimeter boundaries, hardware root-of-trust, and zero-foreign cloud leakage.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Policies Enforced' : 'Enforce Boundaries'}</span>
        </button>
      </div>

      {/* Global Boundary Locks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Strict EU-Only Geographic Data Lock</div>
            <div className="text-[11px] text-slate-400">Deny all inbound/outbound packets terminating outside EU/EEA.</div>
          </div>
          <input
            type="checkbox"
            checked={enforceStrictSovereignty}
            onChange={(e) => setEnforceStrictSovereignty(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
          />
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Block Non-Adequacy Third-Country Exports</div>
            <div className="text-[11px] text-slate-400">Automatic killswitch for unauthorized US Cloud Act queries.</div>
          </div>
          <input
            type="checkbox"
            checked={blockThirdCountryExport}
            onChange={(e) => setBlockThirdCountryExport(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Active Enclave Node List */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Provisioned Sovereign Cloud Enclaves ({regions.length})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {regions.map((reg) => (
            <div key={reg.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {reg.id}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Enclave Active
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-2">{reg.name}</div>
                <div className="text-xs text-slate-400">{reg.country}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{reg.provider}</div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Active Vaults:</span>
                  <span className="font-mono text-white font-bold">{reg.activeVaults}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Protected Volume:</span>
                  <span className="font-mono text-white font-bold">{reg.dataSizeGB} GB</span>
                </div>
                <div className="text-[10px] text-indigo-400 font-mono pt-1">
                  {reg.encryptionStandard}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataResidencyManager;
