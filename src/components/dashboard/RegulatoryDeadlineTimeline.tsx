import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Clock, 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  SlidersHorizontal,
  X,
  Sparkles
} from "lucide-react";

interface RegulatoryDeadline {
  id: string;
  tenantId: string;
  tenantName: string;
  framework: "GDPR" | "CCPA/CPRA" | "DORA" | "EU AI Act" | "NIS2" | "EUDI";
  title: string;
  description: string;
  dueDate: string;
  daysRemaining: number;
  status: "CRITICAL" | "IN_PROGRESS" | "COMPLETED" | "UPCOMING";
  remediationAction: string;
}

const INITIAL_DEADLINES: RegulatoryDeadline[] = [
  {
    id: "dead-1",
    tenantId: "org_1",
    tenantName: "Acme Corporation Europe",
    framework: "GDPR",
    title: "Article 30 Records of Processing Audit",
    description: "Submit updated system processing logs and cross-border vendor DPA signatures to the regional regulatory registry.",
    dueDate: "2026-07-15",
    daysRemaining: 16,
    status: "CRITICAL",
    remediationAction: "Run Auto-DPIA / Validate processing ledgers"
  },
  {
    id: "dead-2",
    tenantId: "org_2",
    tenantName: "Stark Industries GmbH",
    framework: "CCPA/CPRA",
    title: "Continuous Consumer Opt-Out Recalibration",
    description: "Deploy updated consent configuration strings to isolate Californian customer profile registries.",
    dueDate: "2026-08-01",
    daysRemaining: 33,
    status: "IN_PROGRESS",
    remediationAction: "Recalibrate cookie consent endpoints"
  },
  {
    id: "dead-3",
    tenantId: "org_3",
    tenantName: "Global Finance Corp",
    framework: "DORA",
    title: "Sovereign Failover Resilience Drill",
    description: "Perform simulated multi-region SQLite failover tests to comply with structural business continuity rules.",
    dueDate: "2026-09-10",
    daysRemaining: 73,
    status: "UPCOMING",
    remediationAction: "Initialize failure recovery simulator"
  },
  {
    id: "dead-4",
    tenantId: "org_4",
    tenantName: "Beta Innovations",
    framework: "EU AI Act",
    title: "High-Risk AI System Classification Filing",
    description: "Submit algorithmic compliance model checks and bias telemetry outputs for standard evaluation registries.",
    dueDate: "2026-10-20",
    daysRemaining: 113,
    status: "UPCOMING",
    remediationAction: "Export AI risk registry reports"
  },
  {
    id: "dead-5",
    tenantId: "org_1",
    tenantName: "Acme Corporation Europe",
    framework: "EUDI",
    title: "EUDI Decentralized Wallet Enclave Test",
    description: "Validate client encryption checks for decentralized physical identity profiles within protected trust enclaves.",
    dueDate: "2026-11-05",
    daysRemaining: 129,
    status: "UPCOMING",
    remediationAction: "Audit wallet enclave parameters"
  },
  {
    id: "dead-6",
    tenantId: "org_2",
    tenantName: "Stark Industries GmbH",
    framework: "NIS2",
    title: "Cyber incident reporting structure validation",
    description: "Audit automated alerts framework to ensure security incident alerts are reported to regulators under 24 hours.",
    dueDate: "2026-05-10",
    daysRemaining: -50,
    status: "COMPLETED",
    remediationAction: "Reviewed and validated"
  }
];

export const RegulatoryDeadlineTimeline: React.FC = () => {
  const [deadlines, setDeadlines] = useState<RegulatoryDeadline[]>(INITIAL_DEADLINES);
  const [selectedTenant, setSelectedTenant] = useState<string>("ALL");
  const [selectedFramework, setSelectedFramework] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDeadline, setSelectedDeadline] = useState<RegulatoryDeadline | null>(null);
  
  // Custom form state to add a new deadline
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    tenantId: "org_1",
    framework: "GDPR" as any,
    title: "",
    description: "",
    dueDate: "",
    remediationAction: ""
  });

  // Unique list of active tenants from deadlines
  const tenantsList = useMemo(() => {
    const list = new Map<string, string>();
    deadlines.forEach(d => {
      list.set(d.tenantId, d.tenantName);
    });
    return Array.from(list.entries()).map(([id, name]) => ({ id, name }));
  }, [deadlines]);

  // Unique list of frameworks
  const frameworksList = useMemo(() => {
    return Array.from(new Set(deadlines.map(d => d.framework)));
  }, [deadlines]);

  // Filter deadlines
  const filteredDeadlines = useMemo(() => {
    return deadlines.filter(d => {
      const matchesTenant = selectedTenant === "ALL" || d.tenantId === selectedTenant;
      const matchesFramework = selectedFramework === "ALL" || d.framework === selectedFramework;
      const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.tenantName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTenant && matchesFramework && matchesSearch;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [deadlines, selectedTenant, selectedFramework, searchQuery]);

  // Handle Add Deadline
  const handleAddDeadlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeadline.title || !newDeadline.dueDate) return;

    const tenantName = tenantsList.find(t => t.id === newDeadline.tenantId)?.name || "Unknown Tenant";
    const dueTime = new Date(newDeadline.dueDate).getTime();
    const nowTime = new Date().getTime();
    const daysRemaining = Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24));

    let status: "CRITICAL" | "IN_PROGRESS" | "UPCOMING" | "COMPLETED" = "UPCOMING";
    if (daysRemaining < 0) status = "COMPLETED";
    else if (daysRemaining <= 20) status = "CRITICAL";
    else if (daysRemaining <= 45) status = "IN_PROGRESS";

    const newItem: RegulatoryDeadline = {
      id: `dead-${Date.now()}`,
      tenantId: newDeadline.tenantId,
      tenantName,
      framework: newDeadline.framework,
      title: newDeadline.title,
      description: newDeadline.description || "No detailed description provided.",
      dueDate: newDeadline.dueDate,
      daysRemaining,
      status,
      remediationAction: newDeadline.remediationAction || "Review policy controls"
    };

    setDeadlines(prev => [...prev, newItem]);
    setShowAddModal(false);
    setNewDeadline({
      tenantId: "org_1",
      framework: "GDPR",
      title: "",
      description: "",
      dueDate: "",
      remediationAction: ""
    });
  };

  // Get status pills
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return "bg-rose-50 text-rose-700 border border-rose-250 animate-pulse";
      case "IN_PROGRESS":
        return "bg-amber-50 text-amber-700 border border-amber-250";
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      default:
        return "bg-indigo-50 text-indigo-700 border border-indigo-150";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col space-y-4 sm:space-y-6">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Tenant Regulatory Deadline Progression Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Track future filing dates, audit schedules, and mandatory regulatory milestones per tenant organization.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer font-sans shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Milestone</span>
        </button>
      </div>

      {/* Timeline Controls & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search milestones, descriptions..."
            className="w-full pl-8 pr-4 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600 transition-all font-sans"
          />
        </div>

        {/* Tenant Switcher */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="bg-white border border-slate-250/80 rounded-lg text-xs font-semibold py-1.5 px-2 text-slate-700 focus:outline-none focus:border-emerald-600 transition"
            >
              <option value="ALL">All Tenants</option>
              {tenantsList.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Framework Switcher */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="bg-white border border-slate-250/80 rounded-lg text-xs font-semibold py-1.5 px-2 text-slate-700 focus:outline-none focus:border-emerald-600 transition"
            >
              <option value="ALL">All Frameworks</option>
              {frameworksList.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Visual Progression Map & List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Progression Map Timeline Line (Left Column Span 2) */}
        <div className="xl:col-span-2 relative border border-slate-100 rounded-xl p-5 bg-slate-50/20 max-h-[480px] overflow-y-auto">
          {filteredDeadlines.length === 0 ? (
            <div className="py-16 text-center space-y-2 text-slate-400 border-2 border-dashed border-slate-150 rounded-xl m-2">
              <Calendar className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-bold">No upcoming regulatory deadlines fit this query.</p>
              <p className="text-[10px]">Add a custom milestone or broaden your filters.</p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-4 sm:space-y-6">
              {/* Chronological vertical rule */}
              <div className="absolute left-3 sm:left-4 top-2 bottom-2 w-0.5 bg-slate-200" />

              {filteredDeadlines.map((deadline, index) => {
                const isActive = selectedDeadline?.id === deadline.id;
                return (
                  <motion.div
                    id={`deadline-item-${deadline.id}`}
                    key={deadline.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedDeadline(deadline)}
                    className={`relative p-4 rounded-xl border cursor-pointer transition duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                      isActive 
                        ? "bg-emerald-50/40 border-emerald-400 shadow-xs" 
                        : "bg-white hover:bg-slate-50 border-slate-150"
                    }`}
                  >
                    {/* Bullet marker on chronological vertical rule */}
                    <div className={`absolute left-[-29px] sm:left-[-35px] top-[22px] w-3.5 h-3.5 rounded-full border-2 bg-white transition ${
                      deadline.status === "CRITICAL" ? "border-rose-500 ring-4 ring-rose-100" :
                      deadline.status === "IN_PROGRESS" ? "border-amber-400 ring-4 ring-amber-50" :
                      deadline.status === "COMPLETED" ? "border-emerald-500" : "border-indigo-400"
                    }`} />

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-extrabold uppercase bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                          {deadline.framework}
                        </span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${getStatusStyle(deadline.status)}`}>
                          {deadline.status === "CRITICAL" ? "Severe Risk" :
                           deadline.status === "IN_PROGRESS" ? "In Progress" :
                           deadline.status === "COMPLETED" ? "Completed" : "Scheduled"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold inline-flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {deadline.tenantName}
                        </span>
                      </div>

                      <h4 className="text-xs font-extrabold text-slate-800">{deadline.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 max-w-lg">
                        {deadline.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">Due Date</span>
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-450" />
                          {deadline.dueDate}
                        </span>
                      </div>

                      <div className="w-16 text-right">
                        {deadline.daysRemaining < 0 ? (
                          <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                            Done
                          </span>
                        ) : (
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                            deadline.daysRemaining <= 20 ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-700"
                          }`}>
                            {deadline.daysRemaining} days
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Milestone Detail Pane (Right Column Span 1) */}
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/30 flex flex-col justify-between min-h-[300px]">
          {selectedDeadline ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[9.5px] uppercase font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Active Highlight
                </span>
                <h4 className="text-sm font-extrabold text-slate-800 mt-2">{selectedDeadline.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {selectedDeadline.tenantName}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Milestone Objective</h5>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1 bg-white border border-slate-150 p-3 rounded-lg font-medium shadow-2xs">
                    {selectedDeadline.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-150">
                    <span className="text-[10px] text-slate-400 block">Framework</span>
                    <span className="font-extrabold text-indigo-600">{selectedDeadline.framework}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-150">
                    <span className="text-[10px] text-slate-400 block">Filing Due</span>
                    <span className="font-bold text-slate-700">{selectedDeadline.dueDate}</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 border border-indigo-150 rounded-xl">
                  <h5 className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Automated Action Suggestion
                  </h5>
                  <p className="text-xs text-indigo-950 font-bold mt-1.5 leading-relaxed">
                    "{selectedDeadline.remediationAction}"
                  </p>
                  <span className="text-[9px] text-indigo-600 block mt-1 font-mono">
                    *Aligns with current {selectedDeadline.framework} provisions.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="mark-completed-btn"
                  onClick={() => {
                    setDeadlines(prev => prev.map(d => {
                      if (d.id === selectedDeadline.id) {
                        return { ...d, status: "COMPLETED", daysRemaining: -1 };
                      }
                      return d;
                    }));
                    setSelectedDeadline(prev => prev ? { ...prev, status: "COMPLETED", daysRemaining: -1 } : null);
                  }}
                  disabled={selectedDeadline.status === "COMPLETED"}
                  className="w-full py-2 bg-slate-900 text-white hover:bg-emerald-600 hover:text-white disabled:bg-slate-100 disabled:text-slate-400 border border-slate-200 text-xs font-bold rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {selectedDeadline.status === "COMPLETED" ? "Milestone Met" : "Mark as Completed"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-450 h-full">
              <Info className="w-8 h-8 text-slate-350 animate-bounce mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No Milestone Highlighted</h4>
              <p className="text-[10.5px] text-slate-400 max-w-xs leading-normal mt-1">
                Select any deadline milestone card in the progression list to examine detailed scopes and recommended actions.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Add Custom Milestone Modal Overlay */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4.5 h-4.5 text-emerald-600" />
                  Add Custom Regulatory Milestone
                </h4>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddDeadlineSubmit} className="p-5 space-y-4">
                {/* Tenant selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tenant Organization</label>
                  <select
                    value={newDeadline.tenantId}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, tenantId: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2.5 text-slate-700 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  >
                    {tenantsList.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Framework & Title row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Framework</label>
                    <select
                      value={newDeadline.framework}
                      onChange={(e) => setNewDeadline(prev => ({ ...prev, framework: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2.5 text-slate-700 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                    >
                      <option value="GDPR">GDPR</option>
                      <option value="CCPA/CPRA">CCPA/CPRA</option>
                      <option value="DORA">DORA</option>
                      <option value="EU AI Act">EU AI Act</option>
                      <option value="NIS2">NIS2</option>
                      <option value="EUDI">EUDI</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Due Date</label>
                    <input
                      type="date"
                      required
                      value={newDeadline.dueDate}
                      onChange={(e) => setNewDeadline(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Title input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Milestone Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Sovereignty Recertification"
                    value={newDeadline.title}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2.5 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Milestone Objective / Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe filing requirements or audits..."
                    value={newDeadline.description}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2.5 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>

                {/* Remediation Action suggestion */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Suggested Remediation Step</label>
                  <input
                    type="text"
                    placeholder="e.g. Initialize sovereignty logs audit"
                    value={newDeadline.remediationAction}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, remediationAction: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold p-2.5 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg transition cursor-pointer text-center"
                  >
                    Save Milestone
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
