import React from "react";
import {
  Filter,
  Globe,
  Building2,
  Search,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Server,
  Layers,
  ChevronRight,
  Database
} from "lucide-react";
import {
  REGIONS,
  BUSINESS_UNITS,
  DiscoveredRecord
} from "../data/infrastructureData";

export interface ClientDashboardSidebarProps {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedBusinessUnit: string;
  setSelectedBusinessUnit: (bu: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  filteredRecords?: DiscoveredRecord[];
  allRecords?: DiscoveredRecord[];
  onNavigate?: (path: string) => void;
  className?: string;
}

export const ClientDashboardSidebar: React.FC<ClientDashboardSidebarProps> = ({
  selectedRegion,
  setSelectedRegion,
  selectedBusinessUnit,
  setSelectedBusinessUnit,
  searchQuery = "",
  setSearchQuery,
  filteredRecords = [],
  allRecords = [],
  onNavigate,
  className = ""
}) => {
  const isFiltered = Boolean(selectedRegion || selectedBusinessUnit || searchQuery);

  const handleResetFilters = () => {
    setSelectedRegion("");
    setSelectedBusinessUnit("");
    if (setSearchQuery) {
      setSearchQuery("");
    }
  };

  // Calculate severity metrics for current filtered records
  const criticalCount = filteredRecords.filter((r) => r.severity === "Critical").length;
  const highCount = filteredRecords.filter((r) => r.severity === "High").length;
  const mediumCount = filteredRecords.filter((r) => r.severity === "Medium").length;
  const lowCount = filteredRecords.filter((r) => r.severity === "Low").length;

  const totalRecordCount = filteredRecords.reduce((sum, r) => sum + (r.recordCount || 0), 0);

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-5 ${className}`}
    >
      {/* Header & Reset */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Segment Filters
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Isolate assets by boundary & unit
            </p>
          </div>
        </div>

        {isFiltered && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer bg-transparent border-none p-0"
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      {setSearchQuery && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            Search Assets
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category, table, source..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Region Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            Data Sovereignty Region
          </span>
          {selectedRegion && (
            <span className="text-[10px] font-mono font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded">
              Active
            </span>
          )}
        </label>
        <div className="space-y-1">
          {REGIONS.map((reg) => {
            const isSelected = selectedRegion === reg.value;
            const count = reg.value
              ? allRecords.filter((r) => r.region === reg.value).length
              : allRecords.length;

            return (
              <button
                key={reg.value || "all-regions"}
                onClick={() => setSelectedRegion(reg.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer border ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20"
                    : "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected
                        ? "bg-white"
                        : reg.value.startsWith("eu")
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <span className="truncate">{reg.label}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Business Unit Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            Business Unit
          </span>
          {selectedBusinessUnit && (
            <span className="text-[10px] font-mono font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded">
              Active
            </span>
          )}
        </label>
        <div className="space-y-1">
          {BUSINESS_UNITS.map((bu) => {
            const isSelected = selectedBusinessUnit === bu.value;
            const count = bu.value
              ? allRecords.filter((r) => r.businessUnit === bu.value).length
              : allRecords.length;

            return (
              <button
                key={bu.value || "all-bu"}
                onClick={() => setSelectedBusinessUnit(bu.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer border ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20"
                    : "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">{bu.label}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Summary & Severity Distribution */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Matching Assets
          </span>
          <span className="font-bold text-slate-900 dark:text-white font-mono">
            {filteredRecords.length} / {allRecords.length}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Total Scanned Records
          </span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
            {totalRecordCount.toLocaleString()}
          </span>
        </div>

        {/* Severity Chips */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 rounded-lg p-2 text-center">
            <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 block">
              Critical
            </span>
            <span className="text-xs font-bold font-mono text-rose-900 dark:text-rose-200">
              {criticalCount}
            </span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 rounded-lg p-2 text-center">
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 block">
              High
            </span>
            <span className="text-xs font-bold font-mono text-amber-900 dark:text-amber-200">
              {highCount}
            </span>
          </div>
        </div>

        {/* Quick Link to Full Inventory */}
        {onNavigate && (
          <button
            onClick={() => onNavigate("data-mapping")}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl transition-colors cursor-pointer border-none"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Open Full Data Inventory</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ClientDashboardSidebar;
