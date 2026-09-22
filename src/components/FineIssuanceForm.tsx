import React, { useState } from 'react';
import { 
  Scale, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Calculator, 
  Building2, 
  Send, 
  DollarSign, 
  ShieldAlert, 
  Download,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const FineIssuanceForm: React.FC<{ defaultEntity?: string }> = ({
  defaultEntity = 'VoxelAI Cognitive Robotics Oy'
}) => {
  const { showToast } = useNotification();
  const [entityName, setEntityName] = useState(defaultEntity);
  const [annualTurnover, setAnnualTurnover] = useState(45000000); // 45M EUR
  const [violationArticle, setViolationArticle] = useState<'ART_83_4' | 'ART_83_5' | 'AI_ACT_HIGH_RISK'>('ART_83_5');
  const [severityFactor, setSeverityFactor] = useState(7); // 1-10 scale
  const [mitigatingCooperation, setMitigatingCooperation] = useState(true);
  const [priorInfringements, setPriorInfringements] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedNotice, setIssuedNotice] = useState<any>(null);

  // Dynamic statutory calculation
  const calculatedPenalty = React.useMemo(() => {
    let maxCap = 20000000; // 20M EUR
    let turnoverPctCap = annualTurnover * 0.04; // 4%
    if (violationArticle === 'ART_83_4') {
      maxCap = 10000000;
      turnoverPctCap = annualTurnover * 0.02;
    } else if (violationArticle === 'AI_ACT_HIGH_RISK') {
      maxCap = 35000000;
      turnoverPctCap = annualTurnover * 0.07;
    }

    const statutoryCap = Math.max(maxCap, turnoverPctCap);
    let baseFine = statutoryCap * (severityFactor / 10) * 0.15;

    if (mitigatingCooperation) baseFine *= 0.8; // 20% discount
    if (priorInfringements) baseFine *= 1.35; // 35% recidivism surge

    return {
      statutoryCap,
      proposedFine: Math.round(baseFine),
      currency: 'EUR'
    };
  }, [annualTurnover, violationArticle, severityFactor, mitigatingCooperation, priorInfringements]);

  const handleIssueNotice = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIssuedNotice({
        noticeId: `FIN-EU-${Math.floor(100000 + Math.random() * 900000)}`,
        entity: entityName,
        amount: calculatedPenalty.proposedFine,
        date: new Date().toISOString().split('T')[0],
        deadline: '28 calendar days (Statutory Appeal Window)'
      });
    }, 700);
  };

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-950/80 border border-amber-700/60 rounded-xl text-amber-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Statutory Administrative Fine Issuance</h3>
            <p className="text-xs text-slate-400">Enforcement under GDPR Art. 83 &amp; EU AI Act Title VIII statutory penalty calculators.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-amber-950/70 border border-amber-800 text-amber-300 rounded-xl text-xs font-mono font-bold">
          Supervisory Authority Clearance Level 4
        </span>
      </div>

      <form onSubmit={handleIssueNotice} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Target Entity Legal Name
            </label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Global Annual Turnover (€ EUR)
            </label>
            <input
              type="number"
              value={annualTurnover}
              onChange={(e) => setAnnualTurnover(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
            <div className="text-[11px] text-slate-400 mt-1">Used to establish statutory turnover cap percentage.</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Violation Provision Class
            </label>
            <select
              value={violationArticle}
              onChange={(e) => setViolationArticle(e.target.value as any)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ART_83_5">GDPR Art. 83(5) - Core Principles / Cross-Border Transfers (Up to €20M or 4%)</option>
              <option value="ART_83_4">GDPR Art. 83(4) - Controller / Processor Obligations (Up to €10M or 2%)</option>
              <option value="AI_ACT_HIGH_RISK">EU AI Act Art. 99 - Prohibited AI Systems (Up to €35M or 7%)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Infringement Severity Score: {severityFactor}/10
              </label>
              <span className="text-[11px] font-mono text-amber-400">
                {severityFactor >= 8 ? 'Extreme Harm' : severityFactor >= 5 ? 'Substantial Harm' : 'Moderate Impact'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={severityFactor}
              onChange={(e) => setSeverityFactor(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300">Mitigating Active Cooperation (Art. 83(2)(f))</span>
              <input
                type="checkbox"
                checked={mitigatingCooperation}
                onChange={(e) => setMitigatingCooperation(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300">Recidivist Prior Infringements (Art. 83(2)(e))</span>
              <input
                type="checkbox"
                checked={priorInfringements}
                onChange={(e) => setPriorInfringements(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Right Calculation Display & Submission */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Statutory Fine Assessment Result
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50">
              <div className="text-xs text-amber-300 font-medium">Calculated Proposed Administrative Fine</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-1">
                €{calculatedPenalty.proposedFine.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Statutory Upper Cap Ceiling: €{calculatedPenalty.statutoryCap.toLocaleString()}
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Article Tier:</span>
                <span className="font-mono text-slate-200">{violationArticle}</span>
              </div>
              <div className="flex justify-between">
                <span>Mitigation Factor:</span>
                <span className="font-mono text-emerald-400">{mitigatingCooperation ? '-20% Applied' : 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span>Recidivism Surge:</span>
                <span className="font-mono text-red-400">{priorInfringements ? '+35% Aggravated' : 'None'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Sovereign Enforcement Seal...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Issue Statutory Penalty Notice (€{calculatedPenalty.proposedFine.toLocaleString()})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {issuedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-900/60 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300 font-mono">
                PENALTY NOTICE ISSUED: {issuedNotice.noticeId}
              </div>
              <div className="text-xs text-slate-200">
                {issuedNotice.entity} has been officially served with €{issuedNotice.amount.toLocaleString()} administrative fine.
              </div>
              <div className="text-[11px] text-slate-400">Statutory Appeal Deadline: {issuedNotice.deadline}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => showToast(`Downloaded Official EU DPA Enforcement Notice PDF (${issuedNotice.noticeId})`, 'info')}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Certified PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FineIssuanceForm;
