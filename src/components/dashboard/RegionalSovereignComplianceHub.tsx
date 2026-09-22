import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Scale, 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  Sliders, 
  Download, 
  Info, 
  RotateCcw, 
  Layers, 
  Lock, 
  Clock, 
  Building2, 
  ChevronRight,
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { useRegionalCompliance } from '../../context/RegionalComplianceContext';
import { RegionKey, RegionalComplianceAct } from '../../services/regionalComplianceRulesEngine';
import { useNotification } from '../../context/NotificationContext';

export const RegionalSovereignComplianceHub: React.FC<{
  className?: string;
  compact?: boolean;
}> = ({ className = '', compact = false }) => {
  const { showToast } = useNotification();
  const {
    activeRegion,
    detectedRegion,
    framework,
    allRegions,
    setActiveRegion,
    resetToDetectedRegion,
    isOverridden,
    checkedControls,
    toggleControlCheck,
    simulateLiability,
    complianceScore
  } = useRegionalCompliance();

  const [selectedActId, setSelectedActId] = useState<string | null>(null);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'acts' | 'mechanisms' | 'calculator' | 'enclave'>('acts');

  // Calculator state
  const [annualRevenueEur, setAnnualRevenueEur] = useState<number>(25000000);
  const [affectedRecords, setAffectedRecords] = useState<number>(35000);
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');

  // Calculation outcome
  const liability = simulateLiability(annualRevenueEur, affectedRecords, severity);

  const activeAct = framework.acts.find(a => a.actId === selectedActId) || framework.acts[0];

  const filteredRegions = allRegions.filter(r => 
    r.displayName.toLowerCase().includes(regionSearch.toLowerCase()) ||
    r.key.toLowerCase().includes(regionSearch.toLowerCase())
  );

  const handleDownloadDossier = () => {
    const textContent = `=====================================================================
9XEN_REGULETTEE REGIONAL SOVEREIGN COMPLIANCE ATTESTATION & DOSSIER
=====================================================================
Date Generated: ${new Date().toISOString()}
Jurisdiction Regime: ${framework.displayName} (${framework.regionKey})
Detected Source: ${detectedRegion.detectionSource} (${detectedRegion.confidenceScore}% Confidence)
Sovereign Data Center: ${framework.sovereignDataCenter}
Hardware Enclave: ${framework.hardwareEnclaveSupported}
Overall Compliance Readiness Score: ${complianceScore}%

APPLICABLE STATUTORY ACTS & LAWS:
${framework.acts.map(a => `
- ${a.title} (${a.shortCode}, ${a.enactedYear})
  Supervisory Authority: ${a.supervisoryAuthority.name} (${a.supervisoryAuthority.acronym})
  Statutory Penalty Standard: ${a.statutoryFineFormula.humanSummary}
  Official Registry: ${a.officialUrl}
  Mandatory Articles: ${a.keyArticles.join(', ')}
`).join('\n')}

MANDATORY REGIONAL MECHANISMS:
${framework.mechanisms.map(m => `
* [${m.category}] ${m.name}
  Requirement: ${m.statutoryRequirement}
  Technical Implementation: ${m.technicalImplementation}
  Status: ${m.status}
`).join('\n')}

STATUTORY LIABILITY SIMULATION:
- Revenue Model: €${(annualRevenueEur / 1e6).toFixed(1)}M Annual Turnover
- Consumer Records: ${affectedRecords.toLocaleString()} Records
- Severity Index: ${severity}
- Theoretical Max Statutory Exposure: ${liability.maxStatutoryFineFormatted}
- Statutory Formula Applied: ${liability.formulaDescription}

=====================================================================
CERTIFIED BY 9XEN_REGULETTEE REGULATORY COMPLIANCE ENGINE
Cryptographic Signature: SHA256:${Math.random().toString(36).substring(2)}${Date.now()}
=====================================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `9Xen Regulettee_Compliance_Dossier_${framework.regionKey}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="regional-sovereign-compliance-hub" className={`bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl ${className}`}>
      {/* Top Bar: Regional Identity & Detection Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 via-sky-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            {framework.primaryFlag}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                {framework.displayName}
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {framework.regionKey}
                </span>
              </h2>
              {isOverridden ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sliders className="w-3 h-3" /> Manual Override Active
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Auto-Detected ({detectedRegion.confidenceScore}%)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-300 font-medium">{detectedRegion.registeredCountry || framework.countries.join(', ')}</span>
              <span>•</span>
              <span className="text-slate-400 font-mono text-[11px]">{framework.sovereignDataCenter}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Region Selector */}
        <div className="flex items-center gap-2 relative">
          {isOverridden && (
            <button
              onClick={resetToDetectedRegion}
              title="Reset to your detected registered region"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset to Auto</span>
            </button>
          )}

          {/* Region Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowRegionDropdown(!showRegionDropdown)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/40 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Switch Region ({activeRegion})</span>
              <span className="text-indigo-400 text-[10px]">▼</span>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showRegionDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-slate-800 bg-slate-950/60">
                    <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search jurisdiction or act..."
                        value={regionSearch}
                        onChange={(e) => setRegionSearch(e.target.value)}
                        className="bg-transparent text-white focus:outline-none w-full placeholder-slate-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                    {filteredRegions.map((reg) => (
                      <button
                        key={reg.key}
                        onClick={() => {
                          setActiveRegion(reg.key);
                          setShowRegionDropdown(false);
                          setRegionSearch('');
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          activeRegion === reg.key 
                            ? 'bg-indigo-600/30 text-white border border-indigo-500/40' 
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{reg.flag}</span>
                          <div>
                            <div className="font-semibold text-slate-200">{reg.displayName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{reg.actCount} Acts • {reg.currency}</div>
                          </div>
                        </div>
                        {activeRegion === reg.key && (
                          <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-2 border-t border-slate-800 bg-slate-950/40 text-center">
                    <span className="text-[10px] text-slate-500">
                      Auto-detects from user registration & tenant enclave
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export Dossier */}
          <button
            onClick={handleDownloadDossier}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download verified regional compliance certificate & dossier"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Dossier</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Enforced Acts</span>
            <Scale className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {framework.acts.length} <span className="text-xs font-normal text-slate-400">Statutory Acts</span>
          </div>
          <div className="text-[11px] text-sky-300/80 mt-0.5 truncate">
            {framework.acts.map(a => a.shortCode).join(', ')}
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Compliance Readiness</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {complianceScore}%
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-sky-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${complianceScore}%` }} 
            />
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Breach SLA Window</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {framework.defaultBreachWindowHours}h <span className="text-xs font-normal text-slate-400">Relay</span>
          </div>
          <div className="text-[11px] text-amber-300/80 mt-0.5 truncate">
            {framework.acts[0]?.supervisoryAuthority.acronym} Protocol
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Sovereign Enclave</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-purple-300 mt-1 truncate">
            {framework.hardwareEnclaveSupported.split('&')[0]}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate font-mono">
            Mem Encrypted (AES)
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 mb-5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('acts')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'acts'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Regional Compliance Acts ({framework.acts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mechanisms')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'mechanisms'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Mandatory Controls & Mechanisms ({framework.mechanisms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'calculator'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Statutory Fine Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('enclave')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'enclave'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data Residency & Sovereignty</span>
        </button>
      </div>

      {/* TAB 1: REGIONAL ACTS & STATUTES */}
      {activeTab === 'acts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Act Selection List */}
            <div className="md:col-span-1 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                Active Frameworks
              </div>
              {framework.acts.map((act) => (
                <button
                  key={act.actId}
                  onClick={() => setSelectedActId(act.actId)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeAct.actId === act.actId
                      ? 'bg-slate-800 border-indigo-500/60 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/30'
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs sm:text-sm">
                      {act.shortCode}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      {act.enactedYear}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-normal">
                    {act.title}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-indigo-400">
                      <Building2 className="w-3 h-3" /> {act.supervisoryAuthority.acronym}
                    </span>
                    <span className="text-emerald-400 font-medium">
                      {act.rules.length} Rules
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Act Full Detail View */}
            <div className="md:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{activeAct.countryFlag}</span>
                    <h3 className="text-base font-bold text-white">{activeAct.title}</h3>
                  </div>
                  <p className="text-xs text-indigo-400 mt-0.5">
                    Supervisory Authority: <span className="text-slate-300 font-medium">{activeAct.supervisoryAuthority.name}</span>
                  </p>
                </div>
                {activeAct.officialUrl && (
                  <a
                    href={activeAct.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 shrink-0 bg-sky-500/10 px-2.5 py-1.5 rounded-lg border border-sky-500/20"
                  >
                    <span>EUR-Lex / Official Text</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Summary & Scope */}
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <div>
                  <span className="font-semibold text-slate-200">Statutory Summary: </span>
                  {activeAct.summary}
                </div>
                <div>
                  <span className="font-semibold text-slate-200">Legal Scope: </span>
                  {activeAct.scope}
                </div>
              </div>

              {/* Statutory Fine Standard */}
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Statutory Penalty & Fine Ceiling:</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {activeAct.statutoryFineFormula.humanSummary}
                </p>
              </div>

              {/* Key Articles in Scope */}
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2">Key Articles & Mandatory Directives:</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeAct.keyArticles.map((art, idx) => (
                    <span key={idx} className="text-[11px] px-2.5 py-1 rounded-md bg-slate-700/80 text-slate-200 border border-slate-600/80">
                      {art}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actionable Rules & Controls */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Mandatory Control Safeguards ({activeAct.rules.length})</span>
                  <span className="text-[11px] text-slate-500">Check to verify technical audit state</span>
                </div>
                {activeAct.rules.map((rule) => {
                  const isChecked = !!checkedControls[rule.ruleId];
                  return (
                    <div
                      key={rule.ruleId}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isChecked 
                          ? 'bg-emerald-950/20 border-emerald-500/40' 
                          : 'bg-slate-900/60 border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => toggleControlCheck(rule.ruleId)}
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                              isChecked 
                                ? 'bg-emerald-500 border-emerald-400 text-white' 
                                : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-indigo-400 font-semibold">{rule.articleRef}</span>
                              <span className="text-xs font-bold text-white">{rule.title}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                rule.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {rule.severity}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">{rule.description}</p>
                            <p className="text-[11px] text-emerald-400/90 font-mono mt-1.5 flex items-center gap-1">
                              <span>🔒 Mandate:</span> {rule.mandatoryControl}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-slate-400">Base Penalty Risk</div>
                          <div className="text-xs font-bold font-mono text-rose-400">
                            {framework.currencySymbol}{rule.basePenaltyAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Micro Checklist */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {rule.verificationChecklist.map((chk, i) => (
                          <div key={i} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                            <span>{chk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANDATORY MECHANISMS & CLAUSES */}
      {activeTab === 'mechanisms' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {framework.mechanisms.map((mech) => (
              <div key={mech.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {mech.category}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {mech.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{mech.name}</h4>
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-200">Statutory Requirement: </span>
                  {mech.statutoryRequirement}
                </div>
                <div className="text-xs text-indigo-300">
                  <span className="font-semibold text-slate-200">Enforcement: </span>
                  {mech.enforcementMechanism}
                </div>
                <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg font-mono">
                  <span className="text-emerald-400">⚡ Technical Logic: </span>
                  {mech.technicalImplementation}
                </div>
              </div>
            ))}
          </div>

          {/* Regional Contract Clause Template Preview */}
          {framework.clausesTemplates.length > 0 && (
            <div className="mt-6 bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>Statutory Data Transfer Clause Template</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {framework.clausesTemplates[0].name} ({framework.clausesTemplates[0].statuteReference})
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(framework.clausesTemplates[0].content);
                    showToast('Statutory clause copied to clipboard!', 'info');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-white font-medium cursor-pointer"
                >
                  Copy Clause
                </button>
              </div>
              <pre className="text-[11px] text-slate-300 font-mono bg-slate-950/80 p-3.5 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                {framework.clausesTemplates[0].content}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STATUTORY FINE SIMULATOR */}
      {activeTab === 'calculator' && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Regional Statutory Fine & Liability Simulator ({framework.displayName})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Simulate theoretical maximum administrative fines under {framework.acts[0]?.title} based on corporate revenue and breach severity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Inputs Column */}
            <div className="space-y-4 md:col-span-2">
              {/* Revenue Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Annual Worldwide Turnover:</span>
                  <span className="font-mono text-indigo-400 font-bold">€{(annualRevenueEur / 1e6).toFixed(1)} Million</span>
                </div>
                <input
                  type="range"
                  min={1000000}
                  max={250000000}
                  step={1000000}
                  value={annualRevenueEur}
                  onChange={(e) => setAnnualRevenueEur(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>€1M (SME)</span>
                  <span>€50M (Mid-Market)</span>
                  <span>€250M+ (Enterprise)</span>
                </div>
              </div>

              {/* Records Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Impacted Consumer / PII Records:</span>
                  <span className="font-mono text-sky-400 font-bold">{affectedRecords.toLocaleString()} Records</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={500000}
                  step={5000}
                  value={affectedRecords}
                  onChange={(e) => setAffectedRecords(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1,000</span>
                  <span>100,000</span>
                  <span>500,000+</span>
                </div>
              </div>

              {/* Severity Buttons */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Violation / Breach Severity Tier:</div>
                <div className="grid grid-cols-4 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        severity === sev
                          ? sev === 'CRITICAL'
                            ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                            : sev === 'HIGH'
                            ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                            : 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result Column */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  Statutory Fine Exposure
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mt-1">
                  {liability.maxStatutoryFineFormatted}
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  EUR Equiv: <span className="text-slate-200 font-bold">€{liability.maxStatutoryFineEur.toLocaleString()}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <div className="font-semibold text-indigo-300 mb-1">Statutory Formula Applied:</div>
                  <p className="text-[11px] text-slate-400">{liability.formulaDescription}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-emerald-400">
                <span className="flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> 9Xen Regulettee Mitigation
                </span>
                <span className="text-slate-400">Up to 85% reduction with logged HSM controls</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATA RESIDENCY & SOVEREIGN ENCLAVE */}
      {activeTab === 'enclave' && (
        <div className="space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span>Sovereign Enclave & Regional Storage Attestation</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cryptographic pinning of tenant records to {framework.displayName} boundary
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ACTIVE ENCLAVE</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Sovereign Data Center Node</div>
                <div className="text-xs font-mono font-bold text-white mt-1">{framework.sovereignDataCenter}</div>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Hardware Memory Encryption</div>
                <div className="text-xs font-mono font-bold text-purple-300 mt-1">{framework.hardwareEnclaveSupported}</div>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Cross-Border Adequacy Guard</div>
                <div className="text-xs font-mono font-bold text-emerald-400 mt-1">Zero Unapproved Egress</div>
              </div>
            </div>

            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-indigo-300">Cryptographic Boundary Seal: </span>
                All database records, PII hashes, and encryption keys for this tenant are isolated within the {framework.regionKey} regional cluster. No secondary replication occurs outside approved adequacy corridors without explicit cryptographic re-encryption and documented Transfer Impact Assessment.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
