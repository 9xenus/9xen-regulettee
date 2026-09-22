import React, { useState, useMemo } from 'react';
import { 
  Scale, AlertTriangle, ShieldCheck, DollarSign, 
  Sparkles, CheckCircle2, TrendingUp, HelpCircle, Download
} from 'lucide-react';
import { 
  RegionKey, 
  REGIONAL_FRAMEWORKS, 
  calculateRegionalStatutoryLiability 
} from '../../services/regionalComplianceRulesEngine';

interface RegionalLiabilitySimulatorProps {
  activeRegion: RegionKey;
}

export const RegionalLiabilitySimulator: React.FC<RegionalLiabilitySimulatorProps> = ({ activeRegion }) => {
  const framework = REGIONAL_FRAMEWORKS[activeRegion] || REGIONAL_FRAMEWORKS.EU;

  const [revenue, setRevenue] = useState(50000000); // 50M base turnover
  const [recordCount, setRecordCount] = useState(75000); // 75,000 PII records breached
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [mitigations, setMitigations] = useState<{
    promptNotification: boolean;
    mfaEnforced: boolean;
    dpoAppointed: boolean;
    auditedEncryption: boolean;
  }>({
    promptNotification: true,
    mfaEnforced: true,
    dpoAppointed: true,
    auditedEncryption: true
  });

  const liability = useMemo(() => {
    return calculateRegionalStatutoryLiability(activeRegion, revenue, recordCount, severity);
  }, [activeRegion, revenue, recordCount, severity]);

  // Calculate local currency amount
  const maxLocalCurrencyAmount = useMemo(() => {
    return Math.round(liability.maxStatutoryFineEur * framework.eurConversionRate);
  }, [liability.maxStatutoryFineEur, framework.eurConversionRate]);

  // Calculate mitigation discount (up to 40% statutory mitigation credit)
  const mitigationCreditPercent = useMemo(() => {
    let credit = 0;
    if (mitigations.promptNotification) credit += 10;
    if (mitigations.mfaEnforced) credit += 10;
    if (mitigations.dpoAppointed) credit += 10;
    if (mitigations.auditedEncryption) credit += 10;
    return credit;
  }, [mitigations]);

  const netEstimatedFine = useMemo(() => {
    const raw = maxLocalCurrencyAmount;
    const discounted = raw * (1 - mitigationCreditPercent / 100);
    return Math.round(discounted);
  }, [maxLocalCurrencyAmount, mitigationCreditPercent]);

  const exportLiabilityDossier = () => {
    const report = {
      timestamp: new Date().toISOString(),
      region: activeRegion,
      jurisdiction: framework.displayName,
      applicableActs: framework.acts.map(a => ({ title: a.title, shortCode: a.shortCode, fineFormula: a.statutoryFineFormula })),
      simulationParameters: {
        annualTurnover: `${framework.currencySymbol} ${revenue.toLocaleString()}`,
        breachedRecordCount: recordCount,
        breachSeverity: severity,
        mitigationCredit: `${mitigationCreditPercent}%`
      },
      statutoryLiability: {
        maximumStatutoryCap: `${framework.currencySymbol} ${maxLocalCurrencyAmount.toLocaleString()}`,
        grossEstimatedPenalty: `${framework.currencySymbol} ${maxLocalCurrencyAmount.toLocaleString()}`,
        netEstimatedWithMitigation: `${framework.currencySymbol} ${netEstimatedFine.toLocaleString()}`,
        statutoryFormula: liability.formulaDescription
      },
      mitigatingControlsAttested: mitigations
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `Statutory_Liability_Report_${activeRegion}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{framework.primaryFlag}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {framework.displayName} Statutory Framework
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
              Currency: {framework.currency} ({framework.currencySymbol})
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            Statutory Fine & Exposure Simulator
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Calibrate turnover and breach scope against official legal formulas (e.g. GDPR Art. 83, KSA PDPL Art. 35, CCPA/CPRA, UK GDPR).
          </p>
        </div>

        <button
          onClick={exportLiabilityDossier}
          className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export Liability Dossier
        </button>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Parameter Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Revenue Slider */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Annual Global Turnover</label>
              <span className="font-mono text-sm font-black text-indigo-700">
                {framework.currencySymbol} {revenue.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={1000000}
              max={500000000}
              step={1000000}
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{framework.currencySymbol} 1M</span>
              <span>{framework.currencySymbol} 100M</span>
              <span>{framework.currencySymbol} 500M+</span>
            </div>
          </div>

          {/* Record Count Slider */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Affected Data Subjects / PII Records</label>
              <span className="font-mono text-sm font-black text-indigo-700">
                {recordCount.toLocaleString()} Records
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={1000000}
              step={5000}
              value={recordCount}
              onChange={(e) => setRecordCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>500</span>
              <span>250K</span>
              <span>1,000,000+</span>
            </div>
          </div>

          {/* Incident Severity */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Incident Severity Level</label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSeverity(lvl)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    severity === lvl
                      ? lvl === 'CRITICAL' ? 'bg-rose-600 text-white shadow-xs' :
                        lvl === 'HIGH' ? 'bg-amber-600 text-white shadow-xs' :
                        lvl === 'MEDIUM' ? 'bg-indigo-600 text-white shadow-xs' :
                        'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Mitigating Controls Attestation */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
            <span className="text-xs font-bold text-slate-800 block">
              Statutory Mitigating Safeguards (Article 83(2) Factors)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mitigations.promptNotification}
                  onChange={(e) => setMitigations({ ...mitigations, promptNotification: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700 text-[11px]">&lt; 72h Prompt Notice</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mitigations.mfaEnforced}
                  onChange={(e) => setMitigations({ ...mitigations, mfaEnforced: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700 text-[11px]">Hardware MFA Enforced</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mitigations.dpoAppointed}
                  onChange={(e) => setMitigations({ ...mitigations, dpoAppointed: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700 text-[11px]">Certified DPO Appointed</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mitigations.auditedEncryption}
                  onChange={(e) => setMitigations({ ...mitigations, auditedEncryption: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700 text-[11px]">AES-256 Storage Enclave</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Statutory Exposure Calculation Dossier (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[11px] font-mono text-indigo-300 font-bold uppercase tracking-wider">
                {activeRegion} Legal Determination
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                -{mitigationCreditPercent}% Defense Credit
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-300 font-medium">Estimated Net Statutory Exposure</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black tracking-tight text-white">
                  {framework.currencySymbol} {netEstimatedFine.toLocaleString()}
                </span>
                <span className="text-xs text-indigo-300 font-mono">
                  ({framework.currency})
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Gross base estimate: {framework.currencySymbol} {maxLocalCurrencyAmount.toLocaleString()} before statutory remediation credits.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-medium">Statutory Legal Cap:</span>
                <span className="font-bold text-amber-300 font-mono">
                  {framework.currencySymbol} {maxLocalCurrencyAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-medium">Breach Notification Window:</span>
                <span className="font-bold text-emerald-300 font-mono">
                  {framework.defaultBreachWindowHours} Hours Max
                </span>
              </div>
              <div className="text-[11px] text-slate-300 pt-2 border-t border-white/10">
                <span className="text-indigo-300 font-bold block mb-0.5">Applied Formula:</span>
                <span className="font-mono text-[10px] text-slate-200 leading-snug">
                  {liability.formulaDescription}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[10px] text-slate-400 block font-mono">
              Governed by {framework.acts.map(a => a.shortCode).join(', ')} official judicial sentencing guidelines.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
