import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  BookOpen, 
  FileCheck, 
  AlertCircle, 
  Globe, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Building2, 
  Gavel, 
  Clock, 
  Layers, 
  FileText,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useRegionalCompliance } from '../../context/RegionalComplianceContext';
import { 
  RegionKey, 
  REGIONAL_FRAMEWORKS, 
  RegionalComplianceAct 
} from '../../services/regionalComplianceRulesEngine';
import { useNotification } from '../../context/NotificationContext';

export const RegionalLegalFrameworksHub: React.FC<{
  className?: string;
  clientName?: string;
}> = ({ className = '', clientName = 'Acme Enterprise Ltd' }) => {
  const { showToast } = useNotification();
  const {
    activeRegion,
    framework,
    allRegions,
    setActiveRegion,
    complianceScore
  } = useRegionalCompliance();

  const [selectedActId, setSelectedActId] = useState<string | null>(null);
  const [selectedLawyerTab, setSelectedLawyerTab] = useState<'statutes' | 'opinion' | 'clauses' | 'inquiries' | 'comparison'>('statutes');
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);

  // Legal Opinion Memo Generation State
  const [isGeneratingOpinion, setIsGeneratingOpinion] = useState(false);
  const [opinionText, setOpinionText] = useState<string | null>(null);
  const [memoSubject, setMemoSubject] = useState(`Comprehensive Statutory Compliance Assessment - ${framework.displayName}`);

  const activeAct = framework.acts.find(a => a.actId === selectedActId) || framework.acts[0];

  const handleCopyClause = (clauseId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedClauseId(clauseId);
    setTimeout(() => setCopiedClauseId(null), 2500);
  };

  const handleGenerateOpinionMemo = () => {
    setIsGeneratingOpinion(true);
    setTimeout(() => {
      const generated = `# LEGAL COMPLIANCE OPINION & REGULATORY RISK MEMORANDUM

**CLIENT:** ${clientName}  
**MATTER:** Regional Data Sovereignty & Statutory Regulatory Compliance Audit  
**JURISDICTION:** ${framework.displayName} (${framework.regionKey})  
**LEAD SUPERVISORY AUTHORITY:** ${framework.acts[0]?.supervisoryAuthority.name} (${framework.acts[0]?.supervisoryAuthority.acronym})  
**PRIMARY STATUTORY INSTRUMENT:** ${framework.acts.map(a => a.title).join('; ')}  
**DATE OF ATTESTATION:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  
**CLASSIFICATION:** Privileged Legal Work Product / Attorney-Client Privilege  

---

### 1. EXECUTIVE SUMMARY & JURISDICTIONAL NEXUS
We have conducted a formal regulatory review of ${clientName}'s technical infrastructure, sovereign data processing practices, and automated governance controls within the ${framework.displayName} legal regime. 

Our assessment indicates that ${clientName}'s processing operations currently maintain an estimated **${complianceScore}% technical compliance readiness score** under ${framework.acts.map(a => a.shortCode).join(', ')}.

### 2. STATUTORY FRAMEWORK & MANDATORY CONTROLS EVALUATION
Pursuant to the mandatory obligations under **${framework.acts[0]?.title}**:

${framework.acts[0]?.rules.map((rule, idx) => `
**2.${idx + 1} ${rule.articleRef} (${rule.title}):**
- *Statutory Requirement:* ${rule.description}
- *Mandatory Technical Control:* ${rule.mandatoryControl}
- *Statutory Risk Exposure:* Up to ${framework.currencySymbol}${rule.basePenaltyAmount.toLocaleString()} base administrative penalty.
- *Counsel Verification:* Recommended safeguards are logged within the 9Xen Regulettee Sovereign Enclave (${framework.sovereignDataCenter}).
`).join('')}

### 3. CROSS-BORDER DATA RESIDENCY & TRANSFER ASSESSMENT
Data processing operations for ${clientName} are physically anchored to the **${framework.sovereignDataCenter}** utilizing hardware-enforced memory encryption (**${framework.hardwareEnclaveSupported}**). 

Pursuant to regional cross-border rules:
1. Standard contractual safeguards (${framework.clausesTemplates[0]?.name || 'Standard Data Clauses'}) have been integrated into vendor and customer master service agreements.
2. In the event of a suspected personal data compromise, statutory notifications must be dispatched within **${framework.defaultBreachWindowHours} hours** to ${framework.acts[0]?.supervisoryAuthority.acronym}.

### 4. STATUTORY PENALTY EXPOSURE & LIABILITY MITIGATION
The statutory ceiling under ${framework.acts[0]?.shortCode} is: **${framework.acts[0]?.statutoryFineFormula.humanSummary}**.

Through the implementation of 9Xen Regulettee's continuous audit ledger and automated consent telemetry, ${clientName} establishes strong defensibility against claims of willful neglect or systemic non-compliance under Article/Section enforcement guidelines.

### 5. COUNSEL RECOMMENDATIONS & ACTION PLAN
1. **Immediate Execution:** Ensure all executed vendor sub-processor schedules incorporate the updated ${framework.regionKey} data protection clauses.
2. **Breach Readiness:** Conduct biannual incident relay drills with the designated Data Protection Officer (DPO) and Legal Counsel.
3. **Annual DPIA Certification:** Maintain continuous logging in the sovereign enclave for annual submission to ${framework.acts[0]?.supervisoryAuthority.acronym}.

---
*Prepared by 9Xen Regulettee Certified Legal & Regulatory Partner Network*  
*Cryptographic Seal: LS-LEGAL-${framework.regionKey}-${Date.now().toString(36).toUpperCase()}*`;

      setOpinionText(generated);
      setIsGeneratingOpinion(false);
    }, 1000);
  };

  const handleDownloadOpinion = () => {
    if (!opinionText) return;
    const blob = new Blob([opinionText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Legal_Compliance_Opinion_${clientName.replace(/\s+/g, '_')}_${framework.regionKey}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="regional-legal-frameworks-hub" className={`bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 via-indigo-500/20 to-sky-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            <Scale className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Regional Jurisprudential & Compliance Counsel Hub
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Partner Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active Legal Regime: <span className="text-white font-semibold">{framework.displayName} ({framework.regionKey})</span> • Client: <span className="text-indigo-400 font-semibold">{clientName}</span>
            </p>
          </div>
        </div>

        {/* Region Selector for Legal Review */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 hidden sm:inline">Review Jurisdiction:</label>
          <select
            value={activeRegion}
            onChange={(e) => setActiveRegion(e.target.value as RegionKey)}
            className="bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500/60 cursor-pointer"
          >
            {allRegions.map((r) => (
              <option key={r.key} value={r.key}>
                {r.flag} {r.displayName} ({r.key})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-2 my-5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedLawyerTab('statutes')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            selectedLawyerTab === 'statutes'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Statutory Acts & Articles ({framework.acts.length})</span>
        </button>

        <button
          onClick={() => setSelectedLawyerTab('opinion')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            selectedLawyerTab === 'opinion'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>Generate Legal Opinion Memo</span>
        </button>

        <button
          onClick={() => setSelectedLawyerTab('clauses')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            selectedLawyerTab === 'clauses'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Statutory Clauses & Contracts</span>
        </button>

        <button
          onClick={() => setSelectedLawyerTab('inquiries')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            selectedLawyerTab === 'inquiries'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Supervisory Inquiries ({framework.acts[0]?.supervisoryAuthority.acronym})</span>
        </button>

        <button
          onClick={() => setSelectedLawyerTab('comparison')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            selectedLawyerTab === 'comparison'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Cross-Jurisdiction Comparison</span>
        </button>
      </div>

      {/* TAB 1: STATUTORY ACTS & ARTICLES */}
      {selectedLawyerTab === 'statutes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Act List */}
            <div className="space-y-2 md:col-span-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                Regional Legislation
              </div>
              {framework.acts.map((act) => (
                <button
                  key={act.actId}
                  onClick={() => setSelectedActId(act.actId)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeAct.actId === act.actId
                      ? 'bg-slate-800 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs sm:text-sm">{act.shortCode}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      Est. {act.enactedYear}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{act.title}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-amber-400/90 font-mono">
                    <span>{act.supervisoryAuthority.acronym}</span>
                    <span>{act.rules.length} Statutory Safeguards</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Act Details */}
            <div className="md:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{activeAct.countryFlag}</span>
                    <h3 className="text-base font-bold text-white">{activeAct.title}</h3>
                  </div>
                  <p className="text-xs text-amber-400 mt-0.5">
                    Lead Authority: <span className="text-slate-300 font-semibold">{activeAct.supervisoryAuthority.name}</span> ({activeAct.supervisoryAuthority.headquarters})
                  </p>
                </div>
                {activeAct.officialUrl && (
                  <a
                    href={activeAct.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 shrink-0"
                  >
                    <span>Official Gazette / Law</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Summary */}
              <div className="text-xs text-slate-300 leading-relaxed space-y-2">
                <div><span className="font-semibold text-slate-200">Legal Summary:</span> {activeAct.summary}</div>
                <div><span className="font-semibold text-slate-200">Extraterritorial Scope:</span> {activeAct.scope}</div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                  <span className="font-semibold text-rose-400">Statutory Liability Standard:</span>{' '}
                  <span className="text-slate-300 font-mono">{activeAct.statutoryFineFormula.humanSummary}</span>
                </div>
              </div>

              {/* Statutory Articles */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Actionable Statutory Articles & Precedents
                </div>
                {activeAct.rules.map((rule) => (
                  <div key={rule.ruleId} className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-400 font-bold">{rule.articleRef}</span>
                        <span className="text-xs font-bold text-white">{rule.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {rule.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{rule.description}</p>
                    <div className="text-[11px] text-emerald-400 font-mono bg-slate-950/60 p-2 rounded-lg">
                      <span className="font-bold">Required Legal Safeguard:</span> {rule.mandatoryControl}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEGAL OPINION MEMORANDUM GENERATOR */}
      {selectedLawyerTab === 'opinion' && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-400" />
                <span>Statutory Compliance Legal Opinion Memo Generator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate an attorney-certified regulatory memorandum tailored to {framework.displayName} laws.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateOpinionMemo}
                disabled={isGeneratingOpinion}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingOpinion ? 'Drafting Opinion...' : 'Draft Legal Memo'}</span>
              </button>

              {opinionText && (
                <button
                  onClick={handleDownloadOpinion}
                  className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .MD</span>
                </button>
              )}
            </div>
          </div>

          {/* Render Memo */}
          {opinionText ? (
            <div className="relative">
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(opinionText);
                    showToast('Legal Memo copied to clipboard!', 'info');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="text-xs text-slate-200 font-mono bg-slate-950/90 border border-slate-800 p-5 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px]">
                {opinionText}
              </pre>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl space-y-3">
              <Scale className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">
                Ready to Draft Legal Opinion for {clientName}
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click "Draft Legal Memo" above to generate a comprehensive, formal legal assessment citing active statutes under {framework.displayName}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STATUTORY CLAUSES VAULT */}
      {selectedLawyerTab === 'clauses' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400 mb-2">
            Standardized contractual clauses and Data Protection Addenda (DPA) approved for {framework.displayName}:
          </div>

          {framework.clausesTemplates.map((template) => (
            <div key={template.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{template.name}</h4>
                  <p className="text-xs text-amber-400 font-mono mt-0.5">
                    Statutory Reference: {template.statuteReference}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyClause(template.id, template.content)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/40 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  {copiedClauseId === template.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Clause</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-300">{template.description}</p>

              <pre className="text-[11px] text-slate-300 font-mono bg-slate-950/80 p-3.5 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 border border-slate-800">
                {template.content}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SUPERVISORY AUTHORITY INQUIRIES */}
      {selectedLawyerTab === 'inquiries' && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Supervisory Authority Relay ({framework.acts[0]?.supervisoryAuthority.name})</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Active incident telemetry and statutory response countdown timers
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              CHANNEL ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <div className="text-xs font-semibold text-slate-400">Statutory Breach Response SLA</div>
              <div className="text-xl font-bold font-mono text-amber-400">
                {framework.defaultBreachWindowHours} Hours Max
              </div>
              <p className="text-[11px] text-slate-500">
                Mandatory preliminary incident filing to {framework.acts[0]?.supervisoryAuthority.acronym}.
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <div className="text-xs font-semibold text-slate-400">Data Subject Access Request (DSAR) SLA</div>
              <div className="text-xl font-bold font-mono text-sky-400">
                30 Calendar Days
              </div>
              <p className="text-[11px] text-slate-500">
                Statutory deadline to fulfill consumer right to delete/know under {framework.acts[0]?.shortCode}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CROSS-JURISDICTION COMPARISON */}
      {selectedLawyerTab === 'comparison' && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 space-y-4 overflow-x-auto">
          <div className="text-xs text-slate-400 mb-2">
            Comparative Statutory Matrix: Key obligations across major international data sovereignty regimes:
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-mono uppercase text-[11px]">
                <th className="p-2.5">Regime</th>
                <th className="p-2.5">Primary Statute</th>
                <th className="p-2.5">Breach SLA</th>
                <th className="p-2.5">Max Statutory Penalty</th>
                <th className="p-2.5">Consent Standard</th>
                <th className="p-2.5">Data Residency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              <tr className="hover:bg-slate-800/50">
                <td className="p-2.5 font-bold flex items-center gap-1.5"><span>🇪🇺</span> EU</td>
                <td className="p-2.5">GDPR (2016/679) & AI Act</td>
                <td className="p-2.5 text-amber-400 font-mono">72 Hours</td>
                <td className="p-2.5 text-rose-400 font-mono">€20M or 4% Turnover</td>
                <td className="p-2.5 text-emerald-400">Opt-in / Reject All</td>
                <td className="p-2.5">EU/EEA or Adequacy</td>
              </tr>
              <tr className="hover:bg-slate-800/50">
                <td className="p-2.5 font-bold flex items-center gap-1.5"><span>🇺🇸</span> USA</td>
                <td className="p-2.5">CCPA/CPRA, SEC 106, HIPAA</td>
                <td className="p-2.5 text-amber-400 font-mono">4 Days (SEC) / 45d</td>
                <td className="p-2.5 text-rose-400 font-mono">$7,500/violation + Action</td>
                <td className="p-2.5 text-sky-400">Opt-Out & GPC Signal</td>
                <td className="p-2.5">FedRAMP / US Cloud</td>
              </tr>
              <tr className="hover:bg-slate-800/50">
                <td className="p-2.5 font-bold flex items-center gap-1.5"><span>🇸🇦</span> KSA</td>
                <td className="p-2.5">SDAIA PDPL & SAMA CSF</td>
                <td className="p-2.5 text-amber-400 font-mono">72 Hours</td>
                <td className="p-2.5 text-rose-400 font-mono">SAR 5M + 2yr Prison</td>
                <td className="p-2.5 text-emerald-400">Explicit / Written</td>
                <td className="p-2.5 text-purple-400">Strict KSA Sovereign</td>
              </tr>
              <tr className="hover:bg-slate-800/50">
                <td className="p-2.5 font-bold flex items-center gap-1.5"><span>🇦🇪</span> UAE</td>
                <td className="p-2.5">UAE Federal Law 45</td>
                <td className="p-2.5 text-amber-400 font-mono">Immediate / 72h</td>
                <td className="p-2.5 text-rose-400 font-mono">Cabinet Fine Schedule</td>
                <td className="p-2.5 text-emerald-400">Clear & Unambiguous</td>
                <td className="p-2.5">UAE Enclave / Approval</td>
              </tr>
              <tr className="hover:bg-slate-800/50">
                <td className="p-2.5 font-bold flex items-center gap-1.5"><span>🇬🇧</span> UK</td>
                <td className="p-2.5">UK GDPR & DPA 2018</td>
                <td className="p-2.5 text-amber-400 font-mono">72 Hours</td>
                <td className="p-2.5 text-rose-400 font-mono">£17.5M or 4% Turnover</td>
                <td className="p-2.5 text-emerald-400">Opt-in / Reject All</td>
                <td className="p-2.5">UK IDTA / Adequacy</td>
              </tr>
              <tr className="hover:bg-slate-800/50">
                <td className="p-2.5 font-bold flex items-center gap-1.5"><span>🌏</span> APAC</td>
                <td className="p-2.5">SG PDPA & India DPDP</td>
                <td className="p-2.5 text-amber-400 font-mono">3 Days (PDPC)</td>
                <td className="p-2.5 text-rose-400 font-mono">S$1M or 10% / ₹250 Cr</td>
                <td className="p-2.5 text-emerald-400">Deemed / Notice</td>
                <td className="p-2.5">CBPR / Transfer Lim.</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
