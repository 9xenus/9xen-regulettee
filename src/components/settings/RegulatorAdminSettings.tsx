import React, { useState } from 'react';
import { 
  Building, 
  Shield, 
  Lock, 
  Bell, 
  Database,
  Gavel,
  FileBadge,
  Scale,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { SecuritySettings } from '../../pages/SecuritySettings';
import { COUNTRY_ACTS, REGION_ACTS, ACT_HANDBOOK } from '../../server/jurisdictionEngine';

interface LicenseRecord {
  id: string;
  authority: string;
  country: string;
  key: string;
  tier: string;
  issuedAt: string;
  status: 'ACTIVE' | 'EXPIRING' | 'REVOKED';
}

const LICENSES: LicenseRecord[] = [
  { id: 'LS-DE-001', authority: 'BfDI (Federal Commissioner for Data Protection)', country: 'Germany', key: 'ls_reg_de_91823abce871', tier: 'Sovereign Ultimate Enclave', issuedAt: '2025-11-04', status: 'ACTIVE' },
  { id: 'LS-FR-002', authority: 'CNIL', country: 'France', key: 'ls_reg_fr_0918bc27ef32', tier: 'Standard Regulator Enclave', issuedAt: '2026-01-12', status: 'ACTIVE' },
  { id: 'LS-IE-003', authority: 'DPC (Data Protection Commission)', country: 'Ireland', key: 'ls_reg_ie_82713fbaec00', tier: 'Sovereign Ultimate Enclave', issuedAt: '2025-08-21', status: 'EXPIRING' },
  { id: 'LS-NL-004', authority: 'AP (Autoriteit Persoonsgegevens)', country: 'Netherlands', key: 'ls_reg_nl_72635feaba11', tier: 'Standard Regulator Enclave', issuedAt: '2026-03-30', status: 'ACTIVE' },
  { id: 'LS-ES-005', authority: 'AEPD (Agencia Española de Protección de Datos)', country: 'Spain', key: 'ls_reg_es_15ab77cd924', tier: 'Standard Regulator Enclave', issuedAt: '2024-12-02', status: 'REVOKED' },
];

const NOTIFICATION_PRESETS = [
  { key: 'severe_breach', label: 'Severe Breach Alerts', channel: 'Email + SMS', threshold: "Immediately" },
  { key: 'dsar_deadline', label: 'DSAR Deadline Warnings', channel: 'Email', threshold: "24h before SLA" },
  { key: 'cross_border_notices', label: 'Cross-Border Transfer Notices', channel: 'Dashboard', threshold: "On dispatch" },
  { key: 'monthly_digest', label: 'Monthly Enforcement Digest', channel: 'Email', threshold: "1st of month" },
  { key: 'enclave_health', label: 'Enclave Health Degradation', channel: 'Email + SMS', threshold: "RTO breach risk" },
];

export const RegulatorAdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('authority');

  const [frameworks, setFrameworks] = useState<Record<string, boolean>>(() => {
    const base: Record<string, boolean> = {};
    Object.keys(COUNTRY_ACTS).forEach(code => { base[code] = true; });
    Object.keys(REGION_ACTS).forEach(r => { base[r] = true; });
    return base;
  });
  const [licenses, setLicenses] = useState<LicenseRecord[]>(LICENSES);
  const [notifConfig, setNotifConfig] = useState<Record<string, boolean>>(() => ({
    severe_breach: true,
    dsar_deadline: true,
    cross_border_notices: false,
    monthly_digest: true,
    enclave_health: true,
  }));

  const toggleFramework = (key: string) => setFrameworks(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleNotif = (key: string) => setNotifConfig(prev => ({ ...prev, [key]: !prev[key] }));
  const revokeLicense = (id: string) => setLicenses(prev => prev.map(l => l.id === id ? { ...l, status: 'REVOKED' as const } : l));

  const exportLicenses = () => {
    const header = 'License ID,Authority,Country,Enclave Key,Tier,Issued,Status\n';
    const rows = licenses.map(l => `${l.id},"${l.authority}","${l.country}",${l.key},"${l.tier}",${l.issuedAt},${l.status}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'regulator_enclave_licenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'authority', label: 'Authority Profile', icon: Scale },
    { id: 'security', label: 'Security & Auth', icon: Lock },
    { id: 'jurisdiction', label: 'Jurisdiction Rules', icon: Gavel },
    { id: 'licenses', label: 'License Management', icon: FileBadge },
    { id: 'notifications', label: 'Alert Config', icon: Bell },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-5 sm:gap-8">
      <div className="w-full md:w-64 shrink-0">
        <nav className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                activeTab === tab.id 
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/10' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-amber-200' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 lg:p-8">
        {activeTab === 'authority' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl font-black text-slate-900">Regulatory Authority Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Authority Name</label>
                <input type="text" defaultValue="EDPB European Data Protection Board" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Regional Code</label>
                <input type="text" defaultValue="EU-AUTH-2026" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && <SecuritySettings />}

        {activeTab === 'jurisdiction' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Jurisdiction Rules</h2>
                <p className="text-sm text-slate-500 mt-1">Shared cross-border engine — applicable regional + country acts within national scope.</p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1.5">
                <Shield className="w-4 h-4" />
                {frameworks.DE ? 'National scope enabled' : 'National scope paused'}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {Object.entries(REGION_ACTS).map(([key, region]) => (
                <div key={key} className="border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-slate-800">{region.region}</h3>
                    <button
                      onClick={() => toggleFramework(key)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${frameworks[key] ? 'bg-amber-500' : 'bg-slate-300'}`}
                      aria-label={`Toggle ${region.region}`}
                    >
                      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: frameworks[key] ? '18px' : '2px' }} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {region.acts.map(act => (
                      <span key={act} className="text-xs font-bold text-slate-600 bg-slate-100 rounded-full px-2.5 py-1">{act}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-4 py-3 text-left">Country</th>
                    <th className="px-4 py-3 text-left">Local Law</th>
                    <th className="px-4 py-3 text-left">Applicable Acts</th>
                    <th className="px-4 py-3 text-right">In Force</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(COUNTRY_ACTS).map(([code, entry]) => (
                    <tr key={code} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-bold text-slate-800">{entry.country} <span className="text-slate-400">({code})</span></td>
                      <td className="px-4 py-3 text-slate-600">{entry.localLaw}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {entry.acts.slice(0, 3).map(act => (
                            <span key={act} className="text-[11px] font-bold text-slate-600 bg-slate-100 rounded-full px-2 py-0.5">{act}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleFramework(code)}
                          className={`relative w-10 h-6 rounded-full transition-colors ${frameworks[code] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          aria-label={`Toggle ${entry.country}`}
                        >
                          <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: frameworks[code] ? '18px' : '2px' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p className="font-bold">Selected act detail preview</p>
              {Object.entries(COUNTRY_ACTS).slice(0, 2).map(([code, entry]) => (
                <p key={code}>{entry.acts[0]} — {ACT_HANDBOOK[entry.acts[0]]?.title || 'Cross-border act handbook entry'}</p>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'licenses' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">Enclave License Management</h2>
                <p className="text-sm text-slate-500 mt-1">Regulator enclave keys issued under the sovereign network.</p>
              </div>
              <button
                onClick={exportLicenses}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {licenses.map(license => (
                <div key={license.id} className={`border rounded-2xl p-4 ${license.status === 'REVOKED' ? 'border-red-200 bg-red-50/40' : license.status === 'EXPIRING' ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{license.id}</p>
                      <h3 className="font-bold text-slate-800 mt-0.5">{license.authority}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{license.country} · {license.tier}</p>
                    </div>
                    <span className={`text-[11px] font-black px-2 py-1 rounded-full ${
                      license.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      license.status === 'EXPIRING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {license.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <code className="text-xs text-slate-500 bg-slate-100 rounded-lg px-2 py-1 truncate font-mono">{license.key}</code>
                    {license.status !== 'REVOKED' && (
                      <button
                        onClick={() => revokeLicense(license.id)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Issued {license.issuedAt}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Alert & Notification Config</h2>
              <p className="text-sm text-slate-500 mt-1">Routing rules for enforcement, breach and enclave-health alerts.</p>
            </div>
            <div className="space-y-3">
              {NOTIFICATION_PRESETS.map(preset => (
                <div key={preset.key} className="flex items-center justify-between border border-slate-200 rounded-2xl px-4 py-3">
                  <div>
                    <p className="font-bold text-slate-800">{preset.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{preset.channel} · {preset.threshold}</p>
                  </div>
                  <button
                    onClick={() => toggleNotif(preset.key)}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ backgroundColor: notifConfig[preset.key] ? '#f59e0b' : '#cbd5e1' }}
                    aria-label={`Toggle ${preset.label}`}
                  >
                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: notifConfig[preset.key] ? '22px' : '2px' }} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
              <Database className="w-4 h-4" />
              <span>Delivery status: live via /ws/pulse broadcast</span>
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};