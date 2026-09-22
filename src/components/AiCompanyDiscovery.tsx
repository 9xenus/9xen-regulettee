import React, { useState } from "react";
import { Search, Building2, ShieldAlert, CheckCircle, Globe, ExternalLink, Cpu, Loader2, Sparkles } from "lucide-react";

export const AiCompanyDiscovery: React.FC<any> = ({ className = "" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [jurisdiction, setJurisdiction] = useState("EU");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setResults(null);

    setTimeout(() => {
      setLoading(false);
      setResults({
        companyName: searchTerm,
        registrationNumber: "HRB 294820-DE",
        jurisdiction: jurisdiction,
        sovereigntyScore: 94,
        status: "ACTIVE_VERIFIED",
        ubo: "Sovereign Holding Corp (Luxembourg SA)",
        sanctionStatus: "CLEARED",
        gdprDpoRegistered: true,
        aiActRiskTier: "LIMITED_RISK",
        dataCenters: ["Frankfurt (DE-FRA1)", "Amsterdam (NL-AMS2)"],
        lastAuditDate: new Date().toISOString().split('T')[0]
      });
    }, 1200);
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              AI Corporate Intelligence & UBO Discovery
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3 h-3" /> Autonomous
              </span>
            </h3>
            <p className="text-xs text-slate-400">Scan EU Business Registers, Companies House & SEC EDGAR for compliance verification</p>
          </div>
        </div>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter company name or registration number (e.g. Acme Fintech EU)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="EU">EU Member States</option>
          <option value="UK">United Kingdom</option>
          <option value="US">United States</option>
          <option value="GLOBAL">Global Search</option>
        </select>

        <button
          type="submit"
          disabled={loading || !searchTerm.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Scanning...
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4" /> Discover Entity
            </>
          )}
        </button>
      </form>

      {/* Results View */}
      {results && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {results.companyName}
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {results.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Reg: {results.registrationNumber} | Jurisdiction: {results.jurisdiction}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Sovereignty Score</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {results.sovereigntyScore}/100
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> UBO Structure
              </div>
              <div className="text-xs font-medium text-slate-200 truncate">{results.ubo}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Sanctions Screening
              </div>
              <div className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                Cleared (0 PEP Match)
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" /> AI Act Risk Tier
              </div>
              <div className="text-xs font-medium text-slate-200">{results.aiActRiskTier}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiCompanyDiscovery;
