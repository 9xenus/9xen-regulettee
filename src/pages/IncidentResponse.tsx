import React, { useState } from "react";
import {
  ShieldAlert,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Server,
  User,
  MoreVertical,
  Paperclip,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  MessageSquare,
  FileText,
  Mic,
  Square,
  Loader2,
  Download,
} from "lucide-react";
import { motion } from "motion/react";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type Status =
  | "NEW"
  | "TRIAGE"
  | "INVESTIGATING"
  | "CONTAINED"
  | "RESOLVED"
  | "CLOSED";

interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  age: string;
  owner: string | null;
  source: string;
  affectedSystems: string[];
  createdAt: string;
}

const MOCK_INCIDENTS: Incident[] = [
  {
    id: "INC-2026-8041",
    title: "Unauthorized Access Pattern on Central DB",
    severity: "CRITICAL",
    status: "INVESTIGATING",
    age: "2h",
    owner: "Alex Risk",
    source: "GuardDuty",
    affectedSystems: ["db-eu-central-1", "auth-service"],
    createdAt: "2026-06-18T05:22:00Z",
  },
  {
    id: "INC-2026-8032",
    title: "DORA: Third-Party API SLA Breach",
    severity: "HIGH",
    status: "TRIAGE",
    age: "5h",
    owner: null,
    source: "Datadog",
    affectedSystems: ["payment-gateway"],
    createdAt: "2026-06-18T02:15:00Z",
  },
  {
    id: "INC-2026-8012",
    title: "GDPR: Potential Data Export anomaly",
    severity: "CRITICAL",
    status: "CONTAINED",
    age: "1d",
    owner: "Sarah Legal",
    source: "DLP System",
    affectedSystems: ["reporting-engine"],
    createdAt: "2026-06-17T11:00:00Z",
  },
  {
    id: "INC-2026-7998",
    title: "Excessive Failed Login Attempts",
    severity: "MEDIUM",
    status: "NEW",
    age: "2m",
    owner: null,
    source: "WAF",
    affectedSystems: ["client-portal"],
    createdAt: "2026-06-18T07:08:00Z",
  },
];

const severityConfig = {
  CRITICAL: {
    color: "bg-rose-500 text-white",
    border: "border-rose-500/20",
    light: "bg-rose-500/10 text-rose-400",
  },
  HIGH: {
    color: "bg-orange-500 text-white",
    border: "border-orange-500/20",
    light: "bg-orange-500/10 text-orange-400",
  },
  MEDIUM: {
    color: "bg-amber-400 text-amber-900",
    border: "border-amber-400/20",
    light: "bg-amber-400/10 text-amber-400",
  },
  LOW: {
    color: "bg-slate-300 text-slate-800",
    border: "border-slate-500/20",
    light: "bg-slate-700 text-slate-300",
  },
};

const statusConfig = {
  NEW: {
    badge: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  },
  TRIAGE: { badge: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  INVESTIGATING: {
    badge: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  },
  CONTAINED: {
    badge: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  },
  RESOLVED: { badge: "bg-slate-700/50 text-slate-300 border border-slate-600" },
  CLOSED: { badge: "bg-slate-800 text-slate-500 border border-slate-700" },
};

export const IncidentResponse: React.FC = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    MOCK_INCIDENTS[0],
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [reportStates, setReportStates] = useState<Record<string, "idle" | "generating" | "completed">>({});
  const [csirtDispatchData, setCsirtDispatchData] = useState<any>(null);
  const [showCsirtModal, setShowCsirtModal] = useState(false);

  const handleReportIncident = async () => {
    if (!selectedIncident) return;
    const incId = selectedIncident.id;
    setReportStates(prev => ({ ...prev, [incId]: "generating" }));
    try {
      const res = await fetch('/api/v1/incidents/csirt/assess-and-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          title: selectedIncident.title,
          severity: selectedIncident.severity,
          impactedSubjects: selectedIncident.severity === 'CRITICAL' ? 45000 : 12000,
          estimatedFinancialLossEur: 1200000,
          crossBorderDisruption: true,
          affectedMemberStates: ['DE', 'FR', 'NL', 'IE'],
          csirtTarget: 'BSI_GERMANY_CSIRT'
        })
      });
      const data = await res.json();
      if (data.success) {
        setCsirtDispatchData(data);
        setReportStates(prev => ({ ...prev, [incId]: "completed" }));
        setShowCsirtModal(true);
      } else {
        setReportStates(prev => ({ ...prev, [incId]: "idle" }));
      }
    } catch {
      setReportStates(prev => ({ ...prev, [incId]: "completed" }));
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        setErrorMsg("");
        
        // Basic demonstration: we don't handle audio processing here
        // Usually, we would set up MediaRecorder with the stream
      } else {
        setErrorMsg("Microphone API is not supported in this browser.");
      }
    } catch (err) {
      console.error("Microphone access denied:", err);
      setErrorMsg("Microphone access denied or not available.");
    }
  };

  const filteredIncidents = MOCK_INCIDENTS.filter(
    (inc) =>
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#0A0E17] text-slate-300">
      {/* Top KPI Strip */}
      <div className="shrink-0 bg-[#0B1120] border-b border-slate-800/80 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-500/20 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Security Operations
              </h1>
              <p className="text-xs text-slate-400">
                Incident Response & Triage
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="/breach-simulation"
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold rounded-lg flex items-center space-x-2 shadow-md transition-all animate-pulse"
            >
              <Zap className="w-4 h-4 text-amber-200" />
              <span>Launch Breach Drill Engine</span>
            </a>
            <div className="px-4 py-2 bg-[#121827] rounded-lg border border-slate-800 hidden sm:block">
              <div className="text-xs text-slate-400 mb-1">Open Incidents</div>
              <div className="text-xl font-bold text-white">24</div>
            </div>
            <div className="px-4 py-2 bg-rose-500/10 rounded-lg border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <div className="text-xs text-rose-400 mb-1">
                Critical Priority
              </div>
              <div className="text-xl font-bold text-rose-500">2</div>
            </div>
            <div className="px-4 py-2 bg-[#121827] rounded-lg border border-slate-800 hidden md:block">
              <div className="text-xs text-slate-400 mb-1">MTTA (30d)</div>
              <div className="text-xl font-bold text-white">4m 12s</div>
            </div>
            <div className="px-4 py-2 bg-[#121827] rounded-lg border border-slate-800 hidden lg:block">
              <div className="text-xs text-slate-400 mb-1">MTTR (30d)</div>
              <div className="text-xl font-bold text-white">2h 45m</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Queue */}
        <div className="w-80 flex-shrink-0 border-r border-slate-800/80 bg-[#0B1120] flex flex-col z-10 hidden md:flex">
          <div className="p-4 border-b border-slate-800/80 space-y-3 bg-[#0B1120]">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-200">Incident Queue</h2>
              <button className="text-slate-400 hover:text-slate-200">
                <Filter className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket or IP..."
                className="w-full pl-9 pr-3 py-2 bg-[#121827] border border-slate-800 rounded-lg text-sm text-slate-200 focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredIncidents.map((inc) => {
              const sf = severityConfig[inc.severity];
              const isSelected = selectedIncident?.id === inc.id;

              return (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? `bg-[#1E293B] border-slate-700 shadow-lg`
                      : "bg-[#121827] border-slate-800/50 hover:border-slate-700 hover:bg-[#161D2B]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${isSelected ? "bg-slate-800 text-white border-slate-600" : `${sf.light} border-transparent`}`}
                    >
                      {inc.severity}
                    </div>
                    <span
                      className={`text-xs ${isSelected ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {inc.age}
                    </span>
                  </div>
                  <h3
                    className={`text-sm font-bold truncate mb-1 ${isSelected ? "text-white" : "text-slate-300"}`}
                  >
                    {inc.title}
                  </h3>
                  <div className="flex justify-between items-center mt-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isSelected ? "bg-slate-800 text-slate-300 border border-slate-700" : statusConfig[inc.status].badge}`}
                    >
                      {inc.status}
                    </span>
                    <span
                      className={`text-[10px] ${isSelected ? "text-slate-400" : "text-slate-500"} font-mono`}
                    >
                      {inc.id}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Investigation Space */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#0A0E17] custom-scrollbar">
          {selectedIncident ? (
            <div className="p-4 sm:p-5 lg:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
              {/* Header Box */}
              <div className="bg-[#121827] rounded-xl border border-slate-800 p-4 sm:p-5 lg:p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${severityConfig[selectedIncident.severity].color.split(" ")[0]} shadow-[0_0_8px_currentColor]`}
                    />
                    <span className="font-mono text-slate-400 text-sm">
                      {selectedIncident.id}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 text-sm">
                      Created {selectedIncident.createdAt}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full ${statusConfig[selectedIncident.status].badge}`}
                  >
                    {selectedIncident.status}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-4">
                  {selectedIncident.title}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-slate-800">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Owner</div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-200">
                        {selectedIncident.owner || "Unassigned"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Source</div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-200">
                        {selectedIncident.source}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-slate-500 mb-1">
                      Affected Systems
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedIncident.affectedSystems.map((sys) => (
                        <span
                          key={sys}
                          className="flex items-center px-2 py-1 bg-[#1E293B] text-slate-300 text-xs rounded border border-slate-700"
                        >
                          <Server className="w-3 h-3 mr-1 text-slate-400" />
                          {sys}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Investigation Timeline */}
              <div className="bg-[#121827] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 bg-[#0B1120]">
                  <h3 className="font-bold text-slate-200">
                    Investigation Timeline
                  </h3>
                </div>
                <div className="p-4 sm:p-5 lg:p-6">
                  <div className="relative pl-6 space-y-4 sm:space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-700">
                    <div className="relative">
                      <div className="absolute -left-[30px] p-1 bg-[#121827] border border-slate-700 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                      </div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-slate-200">
                          Alert Triggered
                        </span>
                        <span className="text-xs text-slate-500">2h ago</span>
                      </div>
                      <p className="text-sm text-slate-300 bg-[#1E293B] p-3 rounded-lg border border-slate-700/50 mt-2">
                        Multiple failed logins followed by successful login from
                        anomalous IP (192.168.1.45) corresponding to Germany.
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[30px] p-1 bg-[#121827] border border-slate-700 rounded-full">
                        <User className="w-3 h-3 text-blue-400" />
                      </div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-slate-200">
                          Incident Triaged & Assigned
                        </span>
                        <span className="text-xs text-slate-500">
                          1h 45m ago
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">
                        Assigned to Alex Risk by auto-routing rule.
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[30px] p-1 bg-[#121827] border border-slate-700 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-amber-500" />
                      </div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-slate-200">
                          Containment Action Initiated
                        </span>
                        <span className="text-xs text-slate-500">15m ago</span>
                      </div>
                      <div className="text-sm text-slate-300 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 mt-2 flex flex-col space-y-2">
                        <span className="font-medium text-amber-500">
                          Actions taken:
                        </span>
                        <ul className="list-disc pl-4 text-amber-200/80 space-y-1">
                          <li>Account suspended via IAM API.</li>
                          <li>Active sessions revoked.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center shrink-0 border border-slate-700">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="relative flex-1">
                      <div className="flex flex-col space-y-2">
                        <textarea
                          className="w-full bg-[#0B1120] border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 min-h-[100px]"
                          placeholder="Add investigation notes, verbal description of breach, evidence, or tagging..."
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                        ></textarea>
                        {errorMsg && <p className="text-xs text-rose-500">{errorMsg}</p>}
                        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                          <button 
                            onClick={handleRecord}
                            className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${isRecording ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]'}`}
                            title={isRecording ? "Stop Recording" : "Record Verbal Description"}
                          >
                            {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                            <Paperclip className="w-4 h-4" />
                          </button>
                          <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-500 transition-colors shadow-sm">
                            Post Note
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-5 sm:p-6 lg:p-8">
              <ShieldAlert className="w-16 h-16 text-slate-800 mb-4" />
              <h2 className="text-xl font-bold text-slate-200">
                No Incident Selected
              </h2>
              <p className="text-slate-500 mt-2 max-w-sm">
                Select an incident from the queue to view details and take
                action.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Actions Drawer */}
        <div className="w-72 flex-shrink-0 border-l border-slate-800/80 bg-[#0B1120] overflow-y-auto hidden xl:block custom-scrollbar">
          {selectedIncident && (
            <div className="p-5 space-y-5 sm:space-y-8">
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                  Triage Actions
                </h3>
                <button className="w-full flex items-center p-2.5 text-sm font-medium text-slate-300 bg-[#121827] border border-slate-800 rounded hover:bg-[#1E293B] hover:border-slate-700 transition-all">
                  <User className="w-4 h-4 mr-2 text-blue-400" /> Assign to me
                </button>
                <button className="w-full flex items-center p-2.5 text-sm font-medium text-slate-300 bg-[#121827] border border-slate-800 rounded hover:bg-[#1E293B] hover:border-slate-700 transition-all">
                  <Activity className="w-4 h-4 mr-2 text-rose-400" /> Escalate
                  Issue
                </button>
                <button className="w-full flex items-center p-2.5 text-sm font-medium text-slate-300 bg-[#121827] border border-slate-800 rounded hover:bg-[#1E293B] hover:border-slate-700 transition-all">
                  <ShieldCheck className="w-4 h-4 mr-2 text-amber-400" />{" "}
                  Contain Threat
                </button>
                <div className="pt-2">
                  <button className="w-full flex items-center justify-center p-2.5 text-sm font-bold text-emerald-950 bg-emerald-500 border border-emerald-400 rounded hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Resolved
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                  Integrations
                </h3>
                <button className="w-full flex items-center p-2 text-sm text-slate-400 hover:text-slate-200 group">
                  <ExternalLink className="w-4 h-4 mr-2 text-slate-600 group-hover:text-blue-400" />
                  Create Jira Ticket
                </button>
                <button className="w-full flex items-center p-2 text-sm text-slate-400 hover:text-slate-200 group">
                  <MessageSquare className="w-4 h-4 mr-2 text-slate-600 group-hover:text-amber-400" />
                  Send Slack Update
                </button>
              </div>

              <div className="space-y-3 border-t border-slate-800 pt-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 ml-2">
                  Compliance Mapping
                </h3>

                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                  <div className="flex items-center text-rose-400 text-sm font-bold mb-1">
                    <ShieldAlert className="w-4 h-4 mr-1.5" />
                    GDPR 72-Hour Rule
                  </div>
                  <p className="text-xs text-rose-300/80 mt-1">
                    If uncontained, regulator notification required in 70h 15m.
                  </p>
                  {(!reportStates[selectedIncident.id] || reportStates[selectedIncident.id] === "idle") && (
                    <button 
                      onClick={handleReportIncident}
                      className="mt-3 w-full text-xs font-bold bg-[#0B1120] border border-rose-500/30 text-rose-400 py-1.5 rounded hover:bg-rose-500/20 transition-colors flex justify-center items-center"
                    >
                      Report Incident (Auto-Draft)
                    </button>
                  )}
                  {reportStates[selectedIncident.id] === "generating" && (
                    <button disabled className="mt-3 w-full text-xs font-bold bg-[#0B1120] border border-rose-500/30 text-rose-400/70 py-1.5 rounded opacity-80 flex justify-center items-center">
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" /> Drafting Notice...
                    </button>
                  )}
                  {reportStates[selectedIncident.id] === "completed" && (
                    <div className="mt-3 w-full flex flex-col space-y-2">
                       <button 
                         onClick={() => setShowCsirtModal(true)}
                         className="w-full text-xs flex justify-center items-center font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-1.5 rounded hover:bg-emerald-500/20 transition-colors cursor-pointer"
                       >
                          <Download className="w-3 h-3 mr-2" /> View CSIRT & DPA Notice Dossier
                       </button>
                    </div>
                  )}
                </div>

                <div className="px-2 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500">
                      Affected Acts:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="px-2 py-1 bg-[#1E293B] border border-slate-700 text-[10px] font-bold text-slate-300 rounded">
                      NIS2 Directive (Art. 23)
                    </span>
                    <span className="px-2 py-1 bg-[#1E293B] border border-slate-700 text-[10px] font-bold text-slate-300 rounded">
                      GDPR (Art. 33/34)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSIRT & NIS2 / GDPR Statutory Filing Modal */}
      {showCsirtModal && csirtDispatchData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-white space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="font-bold text-base">Autonomous CSIRT &amp; DPA Filing Dispatch</h3>
                  <p className="text-[11px] text-slate-400 font-mono">NIS2 Directive Article 23 &amp; GDPR Article 33/34 Statutory Engine</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCsirtModal(false)}
                className="px-2.5 py-1 text-xs bg-slate-800 text-slate-300 hover:text-white rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Severity Assessment Matrix */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Algorithmic Severity Index:</span>
                <span className="text-rose-400 font-bold text-sm">
                  {csirtDispatchData.assessment.systemicSeverityIndex} / 100 (CRITICAL SIGNIFICANT)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-300">
                <div>• NIS2 Significant Incident: <span className="text-rose-400 font-bold">YES</span></div>
                <div>• GDPR High-Risk Breach: <span className="text-rose-400 font-bold">YES</span></div>
                <div>• 24h Early Warning: <span className="text-cyan-300">{new Date(csirtDispatchData.assessment.earlyWarning24hDeadline).toLocaleTimeString()}</span></div>
                <div>• 72h Final Filing: <span className="text-amber-300">{new Date(csirtDispatchData.assessment.comprehensive72hDeadline).toLocaleTimeString()}</span></div>
              </div>
            </div>

            {/* Early Warning Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> 24-Hour Early Warning Dispatch (NIS2 Art. 23)
              </h4>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-cyan-900/40 text-[11px] font-mono text-slate-300 space-y-1">
                <div><span className="text-slate-500">Notice Type:</span> {csirtDispatchData.dispatches.earlyWarning24h.noticeType}</div>
                <div><span className="text-slate-500">Lead National CSIRT:</span> {csirtDispatchData.dispatches.earlyWarning24h.leadCsirt}</div>
                <div><span className="text-slate-500">Affected EU States:</span> {csirtDispatchData.dispatches.earlyWarning24h.affectedMemberStates.join(', ')}</div>
                <div className="truncate"><span className="text-slate-500">Proof Hash:</span> {csirtDispatchData.dispatches.earlyWarning24h.cryptographicProofHash}</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify(csirtDispatchData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `CSIRT-DISPATCH-${selectedIncident?.id || 'INC'}.json`;
                  a.click();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" /> Download Signed Dossier (.json)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
