import React, { useState } from 'react';
import { ShieldCheck, UserCheck, AlertOctagon, Search, Globe, Filter, Download, RefreshCw, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SanctionsPepScreeningEnclave: React.FC = () => {
  const [entityName, setEntityName] = useState('Victor Bout Global Trade Inc');
  const [entityType, setEntityType] = useState<'INDIVIDUAL' | 'ORGANIZATION'>('ORGANIZATION');
  const [countryOfOrigin, setCountryOfOrigin] = useState('RU');
  const [fuzzyThreshold, setFuzzyThreshold] = useState<number>(85);
  const [selectedLists, setSelectedLists] = useState<string[]>(['EU_FSF', 'UN_CONSOLIDATED', 'UK_OFSI', 'CH_SECO']);
  const [loading, setLoading] = useState(false);
  const [screeningResult, setScreeningResult] = useState<any>(null);

  const handleScreening = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/sanctions/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityName,
          entityType,
          countryOfOrigin,
          listsToScreen: selectedLists,
          fuzzyThreshold
        })
      });
      const data = await res.json();
      if (data.success) {
        setScreeningResult(data);
      }
    } catch (e) {
      console.error('Screening failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleList = (listId: string) => {
    setSelectedLists(prev => 
      prev.includes(listId) ? prev.filter(l => l !== listId) : [...prev, listId]
    );
  };

  const downloadAuditReport = () => {
    if (!screeningResult) return;
    const blob = new Blob([JSON.stringify(screeningResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AML6-SANCTIONS-AUDIT-${screeningResult.screeningId}.json`;
    a.click();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider mb-1 border border-rose-200">
            <ShieldAlert className="w-3 h-3" /> AML6 &amp; FATF Recommendation 16
          </span>
          <h3 className="font-bold text-slate-900 text-base">Multi-Jurisdiction Sanctions &amp; PEP Screening Enclave</h3>
          <p className="text-xs text-slate-500">
            High-throughput fuzzy phonetic screening against EU FSF, UN Consolidated, UK OFSI, and Swiss SECO databases.
          </p>
        </div>
        <button
          onClick={handleScreening}
          disabled={loading || !entityName.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-all shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Screening Database...' : 'Run Sanctions & PEP Audit'}
        </button>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Target Entity / Person Name</label>
          <input
            type="text"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            placeholder="e.g. Victor Bout, Gazprom PJSC"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Classification Type</label>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as any)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ORGANIZATION">Corporate Entity / Organization</option>
            <option value="INDIVIDUAL">Individual / Physical Person</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            Phonetic Match Sensitivity: {fuzzyThreshold}%
          </label>
          <input
            type="range"
            min="60"
            max="100"
            value={fuzzyThreshold}
            onChange={(e) => setFuzzyThreshold(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer mt-1"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
            <span>60% (High Recall)</span>
            <span>100% (Exact Match)</span>
          </div>
        </div>
      </div>

      {/* Target Sanctions Databases */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
          Target Sovereign Watchlists &amp; Databases
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'EU_FSF', label: 'EU FSF (Council Regs)', flag: '🇪🇺' },
            { id: 'UN_CONSOLIDATED', label: 'UN Security Council', flag: '🇺🇳' },
            { id: 'UK_OFSI', label: 'UK OFSI Consolidated', flag: '🇬🇧' },
            { id: 'CH_SECO', label: 'Swiss SECO Embargo', flag: '🇨🇭' },
            { id: 'US_OFAC_SDN', label: 'US OFAC SDN List', flag: '🇺🇸' }
          ].map((item) => {
            const isChecked = selectedLists.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleList(item.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span>{item.flag}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results View */}
      {screeningResult && (
        <div className="space-y-4 pt-2">
          {/* Verdict Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            screeningResult.verdict === 'SANCTIONED_ASSET_FREEZE_MANDATORY'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : screeningResult.verdict === 'PEP_ENHANCED_DUE_DILIGENCE_REQUIRED'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center gap-3">
              {screeningResult.verdict === 'SANCTIONED_ASSET_FREEZE_MANDATORY' ? (
                <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0" />
              ) : screeningResult.verdict === 'PEP_ENHANCED_DUE_DILIGENCE_REQUIRED' ? (
                <UserCheck className="w-6 h-6 text-amber-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              )}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider font-mono opacity-80 block">
                  AML6 Statutory Audit Verdict
                </span>
                <h4 className="font-extrabold text-sm font-mono">
                  {screeningResult.verdict}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right font-mono">
                <span className="text-[10px] uppercase font-bold opacity-75 block">Risk Index</span>
                <span className="text-xl font-black">{screeningResult.overallRiskScore} / 100</span>
              </div>
              <button
                onClick={downloadAuditReport}
                className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-xs"
                title="Download Signed AML6 Audit Report"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Detailed Matches Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Watchlist Matches &amp; Phonetic Scorecard
            </div>
            <div className="divide-y divide-slate-100">
              {screeningResult.matches.map((m: any, idx: number) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                  <div>
                    <span className="font-bold text-slate-900 block">{m.listSource}</span>
                    <span className="text-[11px] text-slate-500 font-mono">Matched: {m.matchedAlias} ({m.sanctionProgram})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-xs font-bold text-slate-700">{m.matchScore}% Confidence</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === 'FULL_MATCH_BLOCK'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Attestation Footer */}
          <div className="p-3 bg-slate-900 text-slate-300 rounded-xl text-xs font-mono flex items-center justify-between">
            <span className="truncate">
              AML6 Audit Proof: <span className="text-cyan-400 font-bold">{screeningResult.complianceAttestation.auditHash}</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold shrink-0 ml-2">FATF Rec 16 VERIFIED</span>
          </div>
        </div>
      )}
    </div>
  );
};
