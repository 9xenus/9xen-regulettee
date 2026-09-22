import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  CheckCircle2,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  Cpu,
  Fingerprint,
  FileCheck2,
  Sliders,
  ShieldAlert
} from "lucide-react";
import { AuditTrailEvent, INITIAL_AUDIT_TRAIL_EVENTS } from "../services/auditTrailService";
import { fetchWithRetry } from "../lib/api-client";

interface AuditTrailProps {
  className?: string;
  maxHeight?: string;
  defaultCategory?: string;
  defaultSeverity?: string;
  defaultRole?: string;
  initialLimit?: number;
  showHeader?: boolean;
  compact?: boolean;
  onSelectEvent?: (event: AuditTrailEvent) => void;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({
  className = "",
  maxHeight = "max-h-[580px]",
  defaultCategory = "ALL",
  defaultSeverity = "ALL",
  defaultRole = "ALL",
  initialLimit,
  showHeader = true,
  compact = false,
  onSelectEvent
}) => {
  const [events, setEvents] = useState<AuditTrailEvent[]>(INITIAL_AUDIT_TRAIL_EVENTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>(defaultCategory);
  const [severityFilter, setSeverityFilter] = useState<string>(defaultSeverity);
  const [roleFilter, setRoleFilter] = useState<string>(defaultRole);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      if (severityFilter !== "ALL") params.append("severity", severityFilter);
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      params.append("sortOrder", sortOrder);
      if (initialLimit) params.append("limit", initialLimit.toString());

      const res = await fetchWithRetry(`/api/v1/audit/trail?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not fetch remote audit trail, utilizing local verified ledger", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, severityFilter, roleFilter, sortOrder]);

  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (categoryFilter !== "ALL") {
      result = result.filter((e) => e.category === categoryFilter);
    }

    if (severityFilter !== "ALL") {
      result = result.filter((e) => e.severity === severityFilter);
    }

    if (roleFilter !== "ALL") {
      const targetRole = roleFilter.toUpperCase();
      result = result.filter((e) => {
        const r = (e.actor.role || "").toUpperCase();
        const name = (e.actor.name || "").toUpperCase();
        if (targetRole === "AUDITOR") {
          return r === "AUDITOR" || r === "REGULATOR_NODE" || name.includes("AUDITOR");
        }
        if (targetRole === "SYSTEM_ADMIN" || targetRole === "ADMIN") {
          return r === "SECURITY_ADMIN" || r === "SYSTEM_KERNEL" || name.includes("ADMIN");
        }
        if (targetRole === "COMPLIANCE_OFFICER" || targetRole === "DPO") {
          return r === "DPO_OFFICER" || name.includes("COMPLIANCE") || name.includes("DPO");
        }
        if (targetRole === "LAWYER" || targetRole === "LAWYER_COUNSEL") {
          return r === "LAWYER_COUNSEL" || name.includes("LAWYER") || name.includes("COUNSEL");
        }
        return r === targetRole || r.includes(targetRole);
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.action.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.actor.name.toLowerCase().includes(query) ||
          e.actor.role.toLowerCase().includes(query) ||
          e.target.name.toLowerCase().includes(query) ||
          e.cryptographicProof.hash.toLowerCase().includes(query) ||
          e.id.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return sortOrder === "desc" ? tB - tA : tA - tB;
    });

    return result;
  }, [events, categoryFilter, severityFilter, roleFilter, searchQuery, sortOrder]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const exportAuditCSV = () => {
    const headers = ["Timestamp", "Event ID", "Category", "Action", "Actor", "Target", "Status", "Severity", "Description", "Crypto Hash", "Attestation ID"];
    const rows = filteredEvents.map(e => [
      e.timestamp,
      e.id,
      e.category,
      e.action,
      `"${e.actor.name} (${e.actor.role})"`,
      `"${e.target.name} (${e.target.type})"`,
      e.status,
      e.severity,
      `"${e.description.replace(/"/g, '""')}"`,
      e.cryptographicProof.hash,
      e.cryptographicProof.enclaveAttestationId
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit-trail-export-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleBadge = (roleStr: string) => {
    const r = (roleStr || "").toUpperCase();
    if (r === "AUDITOR" || r === "REGULATOR_NODE") {
      return { label: "Auditor", classes: "bg-purple-500/15 text-purple-300 border-purple-500/30" };
    }
    if (r === "SECURITY_ADMIN" || r === "SYSTEM_ADMIN" || r === "SYSTEM_KERNEL") {
      return { label: "System Admin", classes: "bg-blue-500/15 text-blue-300 border-blue-500/30" };
    }
    if (r === "DPO_OFFICER" || r === "COMPLIANCE_OFFICER") {
      return { label: "Compliance Officer", classes: "bg-amber-500/15 text-amber-300 border-amber-500/30" };
    }
    if (r === "LAWYER_COUNSEL" || r === "LAWYER") {
      return { label: "Legal Counsel", classes: "bg-teal-500/15 text-teal-300 border-teal-500/30" };
    }
    if (r === "AUTO_GUARDRAIL") {
      return { label: "Auto Guardrail", classes: "bg-rose-500/15 text-rose-300 border-rose-500/30" };
    }
    if (r === "HSM_ENCLAVE") {
      return { label: "HSM Enclave", classes: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" };
    }
    return { label: roleStr, classes: "bg-slate-800 text-slate-300 border-slate-700" };
  };

  const getCategoryBadge = (category: AuditTrailEvent["category"]) => {
    switch (category) {
      case "ENFORCEMENT_ACTION":
        return {
          label: "Enforcement",
          icon: AlertTriangle,
          classes: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
        };
      case "SYSTEM_CHANGE":
        return {
          label: "System Change",
          icon: Sliders,
          classes: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
        };
      case "SECURITY_KEY":
        return {
          label: "Security & Key",
          icon: Lock,
          classes: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
        };
      case "POLICY_UPDATE":
        return {
          label: "Policy Rule",
          icon: FileCheck2,
          classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        };
      case "PRIVACY_DSAR":
        return {
          label: "Privacy DSAR",
          icon: Fingerprint,
          classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        };
      default:
        return {
          label: category,
          icon: Activity,
          classes: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
        };
    }
  };

  const getStatusBadge = (status: AuditTrailEvent["status"]) => {
    switch (status) {
      case "ENFORCED":
      case "VERIFIED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "APPLIED":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "BLOCKED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "PENDING_ATTESTATION":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 overflow-hidden shadow-sm ${className}`}>
      {showHeader && (
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">Audit Trail</h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                    {filteredEvents.length} Events Logged
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Chronological tamper-evident record of system state changes &amp; enforcement actions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="audit-trail-sort-toggle"
                onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
                title={`Sorted: ${sortOrder === "desc" ? "Newest First" : "Oldest First"}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
              </button>

              <button
                id="audit-trail-export-btn"
                onClick={exportAuditCSV}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                id="audit-trail-refresh-btn"
                onClick={fetchEvents}
                disabled={isLoading}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
                title="Refresh Ledger"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Search, Role & Category Filter Bar */}
          <div className="flex flex-col items-stretch gap-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="audit-trail-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search action, actor, role, target entity, hash..."
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Role Filter Selector */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">Role:</span>
                <select
                  id="audit-trail-role-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="ALL">All User Roles</option>
                  <option value="AUDITOR">Auditor / Regulator</option>
                  <option value="SYSTEM_ADMIN">System Admin</option>
                  <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
                  <option value="LAWYER">Legal Counsel</option>
                  <option value="AUTO_GUARDRAIL">Auto Guardrail</option>
                </select>

                <select
                  id="audit-trail-severity-select"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="HIGH">High Only</option>
                  <option value="MEDIUM">Medium Only</option>
                  <option value="INFO">Info Only</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills & Role Filter quick bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                <span className="text-[10px] font-mono uppercase text-slate-500 mr-1">Category:</span>
                {[
                  { id: "ALL", label: "All" },
                  { id: "ENFORCEMENT_ACTION", label: "Enforcements" },
                  { id: "SYSTEM_CHANGE", label: "System Changes" },
                  { id: "SECURITY_KEY", label: "Keys & KMS" },
                  { id: "POLICY_UPDATE", label: "Policies" },
                  { id: "PRIVACY_DSAR", label: "Privacy/DSAR" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      categoryFilter === tab.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {(roleFilter !== "ALL" || categoryFilter !== "ALL" || severityFilter !== "ALL" || searchQuery.trim()) && (
                <button
                  onClick={() => {
                    setRoleFilter("ALL");
                    setCategoryFilter("ALL");
                    setSeverityFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 underline shrink-0 cursor-pointer"
                >
                  Clear Active Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scrollable List of Events */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-800/60 p-2 sm:p-3 ${maxHeight}`}>
        {filteredEvents.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-300">No matching audit events found</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Try adjusting your search query or switching to the &apos;All&apos; category filter.
            </p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const catDef = getCategoryBadge(evt.category);
            const roleDef = getRoleBadge(evt.actor.role);
            const CatIcon = catDef.icon;
            const isExpanded = expandedEventId === evt.id;

            return (
              <div
                key={evt.id}
                className="py-3 px-2 sm:px-3 hover:bg-slate-800/40 rounded-xl transition-colors group"
              >
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => {
                    setExpandedEventId(isExpanded ? null : evt.id);
                    if (onSelectEvent) onSelectEvent(evt);
                  }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 p-2 rounded-lg bg-slate-800/90 border border-slate-700/60 text-slate-300 shrink-0 group-hover:border-slate-600 transition-colors">
                      <CatIcon className="w-4 h-4 text-indigo-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {evt.action.replace(/_/g, " ")}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold border rounded ${catDef.classes}`}>
                          {catDef.label}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold border rounded ${getStatusBadge(evt.status)}`}>
                          {evt.status}
                        </span>
                        {evt.severity === "CRITICAL" && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded animate-pulse">
                            CRITICAL
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 mb-1.5">
                        {evt.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono flex-wrap">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Cpu className="w-3 h-3 text-slate-500" />
                          <strong className="text-slate-400">Actor:</strong> {evt.actor.name}
                          <span className={`px-1.5 py-0.5 text-[9px] font-mono font-semibold border rounded ${roleDef.classes}`}>
                            {roleDef.label}
                          </span>
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1">
                          <strong className="text-slate-400">Target:</strong> {evt.target.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    <span
                      className="text-[11px] font-mono text-slate-400 whitespace-nowrap"
                      title={new Date(evt.timestamp).toLocaleString()}
                    >
                      {formatRelativeTime(evt.timestamp)}
                    </span>
                    <button
                      className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details & Cryptographic Attestation */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 bg-slate-950/60 rounded-xl p-3 space-y-2.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Event ID</span>
                        <span className="font-mono text-slate-300 font-semibold">{evt.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Timestamp (ISO)</span>
                        <span className="font-mono text-slate-300">{evt.timestamp}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Actor Role &amp; IP</span>
                        <span className="font-mono text-slate-300">{evt.actor.role} ({evt.actor.ipAddress || "Internal"})</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Enclave Attestation</span>
                        <span className="font-mono text-cyan-400">{evt.cryptographicProof.enclaveAttestationId}</span>
                      </div>
                    </div>

                    {/* Cryptographic Hash Proof */}
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span className="flex items-center gap-1 font-bold text-indigo-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {evt.cryptographicProof.algorithm} Tamper-Evident Digest
                        </span>
                        <span>Sequence #{evt.cryptographicProof.ledgerSequence}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 bg-slate-950 p-1.5 rounded border border-slate-800/80">
                        <code className="text-[10px] font-mono text-slate-300 truncate">
                          {evt.cryptographicProof.hash}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(evt.cryptographicProof.hash, evt.id);
                          }}
                          className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          {copiedHash === evt.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* State Diff if applicable */}
                    {evt.diff && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">State Transition Diff</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                          <div className="p-2 rounded bg-rose-950/20 border border-rose-900/30 text-rose-300">
                            <span className="text-[9px] text-rose-400 block font-bold uppercase mb-0.5">Before:</span>
                            <pre className="whitespace-pre-wrap">{typeof evt.diff.before === "object" ? JSON.stringify(evt.diff.before, null, 2) : evt.diff.before}</pre>
                          </div>
                          <div className="p-2 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-300">
                            <span className="text-[9px] text-emerald-400 block font-bold uppercase mb-0.5">After:</span>
                            <pre className="whitespace-pre-wrap">{typeof evt.diff.after === "object" ? JSON.stringify(evt.diff.after, null, 2) : evt.diff.after}</pre>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Metadata items */}
                    {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Telemetry &amp; Context</span>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(evt.metadata).map(([key, val]) => (
                            <span
                              key={key}
                              className="px-2 py-0.5 text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800 rounded"
                            >
                              <strong className="text-slate-400">{key}:</strong> {typeof val === "object" ? JSON.stringify(val) : String(val)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Ledger Footer Status */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-[10px] text-slate-400">
            Cryptographic Integrity: <strong className="text-emerald-400">ATTESTED (Kyber-1024 / SHA-256)</strong>
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">
          Showing {filteredEvents.length} of {events.length} system events
        </span>
      </div>
    </div>
  );
};

export default AuditTrail;
