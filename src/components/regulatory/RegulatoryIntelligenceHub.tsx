import React, { useState, useEffect } from "react";
import {
  Globe,
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  BookOpen,
  Filter,
  CheckCircle2,
  FileText,
  Download,
  X,
  Layers,
  Building2,
  Cpu,
  ArrowRight
} from "lucide-react";
import {
  RegulatoryUpdateItem,
  RegulatoryIntelligenceResult,
  fetchRegulatoryIntelligence
} from "../../services/regulatoryIntelligenceService";
import { fetchWithRetry } from "../../lib/api-client";

interface RegulatoryIntelligenceHubProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialQuery?: string;
  isModal?: boolean;
}

export const RegulatoryIntelligenceHub: React.FC<RegulatoryIntelligenceHubProps> = ({
  isOpen = true,
  onClose,
  initialQuery = "",
  isModal = false
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [data, setData] = useState<RegulatoryIntelligenceResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>("ALL");
  const [selectedImpact, setSelectedImpact] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const performSearch = async (searchQuery?: string) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    setIsLoading(true);
    try {
      // Server-side endpoint with search grounding and sovereign caching
      const res = await fetchWithRetry("/api/v1/regulatory/intelligence/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });

      if (res.ok) {
        const result: RegulatoryIntelligenceResult = await res.json();
        if (result && result.success) {
          setData(result);
          return;
        }
      }

      // If search endpoint returned unexpected format, try GET latest
      const getRes = await fetchWithRetry(`/api/v1/regulatory/intelligence/latest?query=${encodeURIComponent(q)}`);
      if (getRes.ok) {
        const result: RegulatoryIntelligenceResult = await getRes.json();
        if (result && result.success) {
          setData(result);
          return;
        }
      }

      // Safe fallback data
      const fallbackResult = await fetchRegulatoryIntelligence(q);
      setData(fallbackResult);
    } catch {
      try {
        const fallbackResult = await fetchRegulatoryIntelligence(q);
        setData(fallbackResult);
      } catch {
        // Silent fallback
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch(initialQuery);
  }, []);

  const filteredUpdates = (data?.updates || []).filter((item) => {
    if (selectedJurisdiction !== "ALL" && item.jurisdiction !== selectedJurisdiction) {
      return false;
    }
    if (selectedImpact !== "ALL" && item.impactLevel !== selectedImpact) {
      return false;
    }
    return true;
  });

  const getImpactBadge = (level: RegulatoryUpdateItem["impactLevel"]) => {
    switch (level) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "MEDIUM":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const getJurisdictionBadge = (j: string) => {
    switch (j) {
      case "EU":
        return "bg-blue-600 text-white font-bold";
      case "US":
        return "bg-red-600 text-white font-bold";
      case "UK":
        return "bg-indigo-600 text-white font-bold";
      case "APAC":
        return "bg-emerald-600 text-white font-bold";
      default:
        return "bg-purple-600 text-white font-bold";
    }
  };

  const exportReport = () => {
    const reportData = {
      title: "Global Regulatory Intelligence Briefing",
      timestamp: new Date().toISOString(),
      searchQuery: query || "Global Compliance Radar",
      model: data?.model || "gemini-3.8-flash",
      isLiveGrounded: data?.isLiveGrounded || false,
      summary: data?.summary,
      updates: filteredUpdates,
      groundingSources: data?.groundingSources
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `regulatory-intelligence-brief-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/50 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Global Regulatory Intelligence
                </h2>
                <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-full">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Google Search Grounded
                </span>
                {data?.isLiveGrounded && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Web Radar
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tracking of statutory milestones, enforcement actions, and legislative updates across EU, US, UK &amp; APAC.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="export-regulatory-brief-btn"
              onClick={exportReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
              title="Export Intelligence Report"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Export Brief</span>
            </button>

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search & Topic Selector */}
        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="regulatory-intelligence-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && performSearch()}
              placeholder="Search regulatory topic (e.g., EU AI Act, NIS2, DORA, SEC Cyber, GDPR fines)..."
              className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 rounded-xl pl-9 pr-20 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
            />
            <button
              onClick={() => performSearch()}
              disabled={isLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>

          <button
            onClick={() => performSearch()}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer disabled:opacity-50"
            title="Refresh Grounded Search"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>

        {/* Quick Topic Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">Topics:</span>
          {[
            "EU AI Act Enforcement",
            "NIS2 Transposition",
            "DORA Stress Tests",
            "GDPR Enforcement",
            "SEC Cyber 8-K",
            "ESG / CSRD",
            "US State Privacy (CPRA)"
          ].map((topic) => (
            <button
              key={topic}
              onClick={() => {
                setQuery(topic);
                performSearch(topic);
              }}
              className="px-2 py-0.5 text-[11px] font-mono bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/40 text-slate-300 hover:text-white border border-slate-700 rounded-lg whitespace-nowrap transition-all cursor-pointer"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400">Jurisdiction:</span>
          {["ALL", "EU", "US", "UK", "APAC", "GLOBAL"].map((j) => (
            <button
              key={j}
              onClick={() => setSelectedJurisdiction(j)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                selectedJurisdiction === j
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {j}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400">Severity:</span>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedImpact(lvl)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                selectedImpact === lvl
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-4">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-300">
              Analyzing &amp; Synthesizing Live Regulatory Bulletins...
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Indexing EUR-Lex, EBA, ENISA, SEC, and international gazettes
            </p>
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No updates matching selected filters</p>
            <p className="text-xs text-slate-500">Try searching for a different framework or resetting filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Queries Pill */}
            {data?.searchQueries && data.searchQueries.length > 0 && (
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Search Queries:</span>
                  {data.searchQueries.map((sq, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-[11px] font-mono bg-slate-900 border border-slate-700/60 text-indigo-300 rounded">
                      &quot;{sq}&quot;
                    </span>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Model: {data.model || "gemini-3.8-flash"}
                </span>
              </div>
            )}

            {/* List of Regulatory Items */}
            {filteredUpdates.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`px-2 py-0.5 text-[10px] rounded uppercase ${getJurisdictionBadge(item.jurisdiction)}`}>
                          {item.jurisdiction}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 rounded">
                          {item.framework}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${getImpactBadge(item.impactLevel)}`}>
                          {item.impactLevel}
                        </span>
                        {item.effectiveDate && (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            Effective: <strong className="text-slate-300">{item.effectiveDate}</strong>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {item.summary}
                      </p>

                      {/* Key Takeaways */}
                      {item.keyTakeaways && item.keyTakeaways.length > 0 && (
                        <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5 space-y-1 mb-3">
                          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wide block">
                            Key Compliance Mandates:
                          </span>
                          <ul className="space-y-1">
                            {item.keyTakeaways.map((takeaway, tIdx) => (
                              <li key={tIdx} className="flex items-start gap-1.5 text-xs text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{takeaway}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Enforcement Penalties */}
                      {item.enforcementAction && (
                        <div className="p-2 bg-rose-950/20 border border-rose-900/30 rounded-lg flex items-start gap-2 text-xs text-rose-300 mb-3">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-rose-400 font-bold block text-[10px] uppercase font-mono">
                              Statutory Enforcement &amp; Penalties:
                            </strong>
                            <span>{item.enforcementAction}</span>
                          </div>
                        </div>
                      )}

                      {/* Grounding Web Sources Links */}
                      {item.groundingSources && item.groundingSources.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">Verified Sources:</span>
                          {item.groundingSources.map((src, sIdx) => (
                            <a
                              key={sIdx}
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono bg-slate-800/80 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700/80 rounded transition-colors"
                            >
                              <span className="truncate max-w-[200px]">{src.title || src.uri}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-[10px] text-slate-400">
            Intelligence Engine: <strong className="text-indigo-400">Gemini 3.8 Flash Regulatory Synthesizer</strong>
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">
          Last Synced: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : "Live"}
        </span>
      </div>
    </div>
  );

  if (isModal) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
        <div className="w-full max-w-4xl h-[90vh] max-h-[850px] animate-in fade-in zoom-in-95 duration-200">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default RegulatoryIntelligenceHub;
