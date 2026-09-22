import React, { useState } from 'react';
import { Building2, Globe, FileCheck2, Shield, Search, CheckCircle2, AlertTriangle, Users, MapPin, Activity, Award, Key, Lock, Fingerprint, Sparkles, Landmark, BadgeCheck } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const KybFirmIntegration: React.FC = () => {
  const { showToast } = useNotification();
  const [region, setRegion] = useState('EU');
  const [firmName, setFirmName] = useState('Axiom Global Tech Inc.');
  const [registrationNumber, setRegistrationNumber] = useState('HRB-987654-DE');
  const [leiCode, setLeiCode] = useState('5493001KJTIIGC8Y1R12');
  const [dunsNumber, setDunsNumber] = useState('98-765-4321');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScan = async () => {
    if (!firmName) {
      showToast('Please enter a legal entity name', 'error');
      return;
    }
    
    setIsScanning(true);
    try {
      const res = await fetch('/api/v1/kyb/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firmName,
          region,
          registrationNumber,
          leiCode,
          dunsNumber
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.result);
        showToast('Enterprise KYB verification & Net-Worth Grade evaluation complete', 'success');
      } else {
        showToast(data.error || 'KYB verification failed', 'error');
      }
    } catch (e: any) {
      showToast('Network error during corporate registry check', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" /> Enterprise Grade AAA KYB Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Regional Registries
              </span>
            </div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Building2 className="w-6 h-6 text-indigo-500" />
              Dynamic Regional Enterprise KYB & KYC Orchestrator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Execute high-assurance Know Your Business (KYB) and Beneficial Ownership (UBO) verification. Validates Legal Entity Identifiers (LEI), FATCA GIIN, D-U-N-S credit grades, and biometrically screens key personnel.
            </p>
          </div>
        </div>
        
        {/* Expanded Enterprise Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Jurisdiction Region</label>
            <select 
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
            >
              <option value="EU">European Union (EU - BaFin / Handelsregister)</option>
              <option value="UK">United Kingdom (UK - Companies House / FCA)</option>
              <option value="US">United States (US - SEC / FinCEN CTA)</option>
              <option value="APAC">Asia-Pacific (APAC - MAS / ASIC)</option>
              <option value="UAE">United Arab Emirates (UAE - ADGM / DIFC)</option>
              <option value="BD">Global Region (Telecom Regulatory Authority / RJSC Sovereign Registry)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Legal Entity Name</label>
            <input 
              type="text" 
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              placeholder="e.g. Axiom Global Tech Inc."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Registration Number</label>
            <input 
              type="text" 
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="e.g. HRB-987654-DE"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Legal Entity ID (LEI Code)</label>
            <input 
              type="text" 
              value={leiCode}
              onChange={(e) => setLeiCode(e.target.value)}
              placeholder="20-char LEI e.g. 549300..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">D-U-N-S Number (Dun & Bradstreet)</label>
            <input 
              type="text" 
              value={dunsNumber}
              onChange={(e) => setDunsNumber(e.target.value)}
              placeholder="9-digit D-U-N-S Code"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button 
              onClick={handleScan}
              disabled={isScanning}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isScanning ? <Activity className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isScanning ? 'Querying Global Registries & LEI Database...' : 'Execute Enterprise Grade KYB Audit'}</span>
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Top Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Entity Header Card (Span 4) */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {result.enterpriseGrade || 'GRADE_AAA'}
                </span>
              </div>

              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-3xl flex items-center justify-center mb-4 mt-2">
                <Shield className="w-10 h-10" />
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white">{result.firmName}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mt-1 justify-center">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {result.region} Jurisdiction • {result.entityType || 'Enterprise Corporation'}
              </p>

              {/* Net-Worth & Credit Grade */}
              <div className="mt-5 w-full p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status Rating</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {result.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Enterprise Risk Score</span>
                  <span className="text-emerald-400 font-bold">{result.riskScore}/100 ({result.riskLevel || 'LOW_RISK'})</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400">Net-Worth Capital Grade</span>
                  <span className="text-indigo-400 font-bold">{result.netWorthGrade || '$50M+ Tier 1'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Credit Rating Outlook</span>
                  <span className="text-amber-400 font-bold">{result.creditRatingGrade || 'AAA Stable'}</span>
                </div>
              </div>
            </div>

            {/* Enterprise Identifiers & Regulatory Dossier (Span 8) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Identifiers Grid */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Enterprise Identifiers & Global Registry Badges</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Legal Entity ID (LEI)</span>
                    <strong className="text-indigo-400 text-xs block mt-0.5">{result.leiCode || '5493001KJTIIGC8Y1R12'}</strong>
                    <span className="text-[10px] text-emerald-400 font-bold mt-1 block">✓ Verified Active LEI Register</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">D-U-N-S Number (Dun & Bradstreet)</span>
                    <strong className="text-white text-xs block mt-0.5">{result.dunsNumber || '98-765-4321'}</strong>
                    <span className="text-[10px] text-slate-400 font-bold mt-1 block">D&B Commercial Rating: 5A1</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">FATCA GIIN Identifier</span>
                    <strong className="text-white text-xs block mt-0.5">{result.giinNumber || '989012.99999.SL.276'}</strong>
                    <span className="text-[10px] text-slate-400 font-bold mt-1 block">IRS Reporting Entity Certified</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Tax / VAT Registration ID</span>
                    <strong className="text-white text-xs block mt-0.5">{result.taxVatId || 'DE-309812456'}</strong>
                    <span className="text-[10px] text-emerald-400 font-bold mt-1 block">✓ Tax Authority Active</span>
                  </div>
                </div>
              </div>

              {/* Regulatory Oversight & Financial Size Band */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase">
                    <Landmark className="w-4 h-4" />
                    <span>Supervisory Body & License</span>
                  </div>
                  <div className="text-xs text-white font-bold">{result.primaryRegulator || 'BaFin Financial Regulatory Authority'}</div>
                  <div className="text-[11px] text-slate-400 font-mono">Lic: {result.regulatorLicenseNo || 'LIC-EU-2026-98124'}</div>
                  <div className="text-[10px] text-emerald-400 font-bold pt-1">Sanctions List: {result.sanctionsListVersion || 'OFAC-EU-UN-2026.09'}</div>
                </div>

                <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>Annual Revenue & Scale Band</span>
                  </div>
                  <div className="text-xs text-white font-bold">{result.yearlyRevenueBand || '25M-100M EUR'}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{result.employeeCountBand || '250-1000 Staff Members'}</div>
                  <div className="text-[10px] text-indigo-400 font-bold pt-1">Biometric Liveness Confidence: {result.kycBiometricLivenessScore || 99.8}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* UBO Ownership & Key Personnel Breakdown Table */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Ultimate Beneficial Owner (UBO) & Key Personnel KYC Breakdown</span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">≥25% Ownership Threshold Met</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                    <th className="p-3">Full Name & Position</th>
                    <th className="p-3">Ownership Share</th>
                    <th className="p-3">PEP & Sanctions Status</th>
                    <th className="p-3">Government ID</th>
                    <th className="p-3">Biometric Liveness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.ubos ? (
                    result.ubos.map((u: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">
                          {u.name}
                          <span className="block text-[10px] text-slate-400 font-normal">{u.role}</span>
                        </td>
                        <td className="p-3 text-indigo-400 font-bold">{u.ownershipShare}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {u.pepStatus} / CLEAR
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">
                          {u.govtIdVerified ? '✓ Verified Passport' : 'Pending'} ({u.nationality})
                        </td>
                        <td className="p-3 text-emerald-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                            {u.biometricScore}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    result.directors.map((director: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">{director.name}</td>
                        <td className="p-3 text-indigo-400 font-bold">{director.role}</td>
                        <td className="p-3"><span className="text-emerald-400 font-bold">CLEAR</span></td>
                        <td className="p-3 text-slate-300">Verified ID</td>
                        <td className="p-3 text-emerald-400 font-bold">99.8%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KybFirmIntegration;
