import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, ExternalLink, Scale, CheckCircle2, 
  AlertCircle, ChevronDown, ChevronRight, Building, Layers, Search, CheckSquare
} from 'lucide-react';
import { 
  RegionKey, 
  REGIONAL_FRAMEWORKS, 
  RegionalComplianceAct, 
  RegionalActRule 
} from '../../services/regionalComplianceRulesEngine';

interface RegionalActInspectorProps {
  activeRegion: RegionKey;
  checkedControls: Record<string, boolean>;
  onToggleControl: (controlId: string) => void;
}

export const RegionalActInspector: React.FC<RegionalActInspectorProps> = ({
  activeRegion,
  checkedControls,
  onToggleControl
}) => {
  const framework = REGIONAL_FRAMEWORKS[activeRegion] || REGIONAL_FRAMEWORKS.EU;
  const [selectedActId, setSelectedActId] = useState<string>(framework.acts[0]?.actId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  // Fallback to first act if current selection is not in new region
  const activeAct = framework.acts.find(a => a.actId === selectedActId) || framework.acts[0];

  const toggleRuleExpand = (ruleId: string) => {
    setExpandedRules(prev => ({
      ...prev,
      [ruleId]: !prev[ruleId]
    }));
  };

  const filteredRules = (activeAct?.rules || []).filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.articleRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.mandatoryControl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{framework.primaryFlag}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {framework.displayName} Regulatory Acts
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {framework.acts.length} Statutory Acts Enforced
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            Statutory Acts & Supervisory Authority Dossier
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Audit binding statutory rules, technical controls, and regulatory enforcement authorities for {framework.displayName}.
          </p>
        </div>
      </div>

      {/* Act Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {framework.acts.map((act) => {
          const isSelected = act.actId === activeAct?.actId;
          const totalRules = act.rules.length;
          const verifiedRules = act.rules.filter(r => checkedControls[r.ruleId]).length;

          return (
            <button
              key={act.actId}
              onClick={() => setSelectedActId(act.actId)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/30'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{act.countryFlag}</span>
              <span>{act.shortCode}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-600'
              }`}>
                {verifiedRules}/{totalRules}
              </span>
            </button>
          );
        })}
      </div>

      {activeAct && (
        <div className="space-y-6">
          {/* Act Overview & Supervisory Authority Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Act Summary (7 cols) */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-700 uppercase">
                  Statutory Enactment {activeAct.enactedYear} • Effective {activeAct.effectiveDate}
                </span>
                <a
                  href={activeAct.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Official Law Gazette <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <h4 className="text-base font-bold text-slate-900">{activeAct.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{activeAct.summary}</p>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block text-[10px]">Extraterritorial Scope:</span>
                  <span className="text-slate-700 font-semibold">{activeAct.scope}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[10px]">Statutory Fine Ceiling:</span>
                  <span className="text-rose-700 font-bold font-mono">
                    {activeAct.statutoryFineFormula.humanSummary}
                  </span>
                </div>
              </div>
            </div>

            {/* Supervisory Authority Dossier (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-[10px] font-mono text-indigo-300 uppercase font-bold tracking-wider">
                    Supervisory Regulator
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Jurisdiction Authority
                  </span>
                </div>

                <div className="mt-3">
                  <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-indigo-400" />
                    {activeAct.supervisoryAuthority.name} ({activeAct.supervisoryAuthority.acronym})
                  </h5>
                  <span className="text-[11px] text-slate-300 block mt-1">
                    Headquarters: {activeAct.supervisoryAuthority.headquarters}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[10px]">Regulatory Filing Portal:</span>
                <a
                  href={activeAct.supervisoryAuthority.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1"
                >
                  {activeAct.supervisoryAuthority.acronym} Portal <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles or rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing {filteredRules.length} mandatory rules under {activeAct.shortCode}
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            {filteredRules.map((rule) => {
              const isChecked = Boolean(checkedControls[rule.ruleId]);
              const isExpanded = Boolean(expandedRules[rule.ruleId]);

              return (
                <div
                  key={rule.ruleId}
                  className={`border rounded-xl transition-all ${
                    isChecked
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-white border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  {/* Rule Header Row */}
                  <div className="p-4 flex items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Checkbox toggle */}
                      <button
                        onClick={() => onToggleControl(rule.ruleId)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-300 text-transparent hover:border-indigo-500'
                        }`}
                        title={isChecked ? 'Verified Compliant' : 'Mark as Verified'}
                      >
                        <CheckSquare className="w-4 h-4 text-white" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {rule.articleRef}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rule.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                            rule.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rule.severity}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 mt-1">{rule.title}</h5>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden md:block text-right">
                        <span className="text-[10px] text-slate-400 font-medium block">Base Penalty</span>
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {rule.currency} {rule.basePenaltyAmount.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleRuleExpand(rule.ruleId)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Checklist & Implementation Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3 bg-slate-50/60 rounded-b-xl">
                      <p className="text-xs text-slate-600">{rule.description}</p>

                      <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <span className="text-[10px] font-mono text-indigo-700 font-bold uppercase block mb-1">
                          Mandatory Technical Control:
                        </span>
                        <span className="text-xs text-slate-800 font-semibold">{rule.mandatoryControl}</span>
                      </div>

                      {rule.verificationChecklist && rule.verificationChecklist.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-slate-700 block mb-1.5">
                            Audit Verification Checklist:
                          </span>
                          <ul className="space-y-1.5">
                            {rule.verificationChecklist.map((chk, idx) => (
                              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                                <span>{chk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
