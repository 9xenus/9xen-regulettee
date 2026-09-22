import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Settings2, 
  Bell, 
  Lock, 
  Globe, 
  Sliders, 
  Save, 
  Check, 
  Eye, 
  Scale, 
  Building2, 
  Users, 
  RefreshCw,
  Terminal,
  Zap
} from 'lucide-react';

export interface RoleDashboardSettingsProps {
  role?: string;
  onSave?: (settings: any) => void;
  className?: string;
}

export const RoleDashboardSettings: React.FC<RoleDashboardSettingsProps> = ({
  role = 'TENANT_OWNER',
  onSave,
  className = ''
}) => {
  const [activeRole, setActiveRole] = useState(role);
  const [selectedRegion, setSelectedRegion] = useState('DE');
  const [alertSeverity, setAlertSeverity] = useState<'CRITICAL_ONLY' | 'HIGH_AND_ABOVE' | 'ALL'>('HIGH_AND_ABOVE');
  const [autoRemediate, setAutoRemediate] = useState(true);
  const [eidasEnforcement, setEidasEnforcement] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    const payload = {
      role: activeRole,
      selectedRegion,
      alertSeverity,
      autoRemediate,
      eidasEnforcement,
      dailyDigest,
      updatedAt: new Date().toISOString()
    };
    if (onSave) onSave(payload);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-indigo-400">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Role Dashboard Preferences &amp; Policies</h3>
            <p className="text-xs text-slate-400">Configure alert thresholds, regional legal baselines, and automated actions.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Saved' : 'Save Config'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        {/* Left Column: Scope & Region */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Active Role Context
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              {[
                { id: 'TENANT_OWNER', label: 'Client' },
                { id: 'EU_REGULATOR', label: 'Regulator' },
                { id: 'LAWYER', label: 'Lawyer' },
                { id: 'ADMIN', label: 'Admin HQ' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRole(r.id)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeRole === r.id ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Primary EU Supervisory Jurisdiction
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="DE">Germany (BfDI / DSGVO Enclave)</option>
              <option value="FR">France (CNIL / RGPD Sovereign)</option>
              <option value="IE">Ireland (DPC Tech Supervision)</option>
              <option value="NL">Netherlands (AP Data Hub)</option>
              <option value="EU_ALL">Pan-European (EDPB Joint Oversight)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Telemetry &amp; Audit Alert Sensitivity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CRITICAL_ONLY', label: 'Critical Only' },
                { id: 'HIGH_AND_ABOVE', label: 'High & Critical' },
                { id: 'ALL', label: 'All Events' }
              ].map(sev => (
                <button
                  key={sev.id}
                  type="button"
                  onClick={() => setAlertSeverity(sev.id as any)}
                  className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    alertSeverity === sev.id
                      ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {sev.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Automated Safeguards & Verification */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Autonomous Compliance Controls
            </div>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                  Autonomous Auto-Remediation
                </div>
                <div className="text-[11px] text-slate-400">Auto-seal misconfigured S3/Blob buckets instantly.</div>
              </div>
              <input
                type="checkbox"
                checked={autoRemediate}
                onChange={(e) => setAutoRemediate(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                  eIDAS v2 Hardware Cryptographic Sign-Off
                </div>
                <div className="text-[11px] text-slate-400">Require hardware token proof for policy export.</div>
              </div>
              <input
                type="checkbox"
                checked={eidasEnforcement}
                onChange={(e) => setEidasEnforcement(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                  Daily Sovereign Digest Dispatch
                </div>
                <div className="text-[11px] text-slate-400">Send encrypted morning risk assessment to compliance team.</div>
              </div>
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDashboardSettings;
