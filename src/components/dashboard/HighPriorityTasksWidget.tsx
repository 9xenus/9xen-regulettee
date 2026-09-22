import React from "react";
import { motion } from "motion/react";
import { ArrowRight, ShieldAlert } from "lucide-react";

interface HighPriorityTasksWidgetProps {
  score?: number;
  onNavigate?: (path: string) => void;
}

export const HighPriorityTasksWidget: React.FC<HighPriorityTasksWidgetProps> = ({ score = 94, onNavigate }) => {
  // Dynamically construct the top 3 high priority items based on the health score
  // If score is high (>90), we show optimized tasks. If lower, we show critical gaps.
  const getTasksByScore = (scoreVal: number) => {
    if (scoreVal >= 95) {
      return [
        {
          id: "task-opt-1",
          title: "Periodic Risk Assessment (DPIA)",
          category: "DPIA",
          impact: "+1.5% Score",
          priority: "High",
          description: "Perform impact assessment on newly added user-facing AI chat services.",
          remediation: "Initialize DPIA wizard",
          targetPath: "sandbox"
        },
        {
          id: "task-opt-2",
          title: "Optimize Cookie Consent Logs",
          category: "GDPR Consent",
          impact: "+1.2% Score",
          priority: "High",
          description: "Anonymize IP logging strings across production analytics services.",
          remediation: "Configure Anonymizer",
          targetPath: "sandbox"
        },
        {
          id: "task-opt-3",
          title: "Review Authorized Agent Requests",
          category: "CCPA Right to Know",
          impact: "+0.8% Score",
          priority: "Medium",
          description: "Update SLA response times for regional privacy coordinator alerts.",
          remediation: "Manage DSAR requests",
          targetPath: "sandbox"
        }
      ];
    } else if (scoreVal >= 90) {
      return [
        {
          id: "task-mid-1",
          title: "Rectify CPRA 'Do Not Sell' Controls",
          category: "CCPA/CPRA Compliance",
          impact: "+3.0% Score",
          priority: "High",
          description: "Automated test flagged missing granular opt-out endpoints for Californian IPs.",
          remediation: "Update consent config",
          targetPath: "sandbox"
        },
        {
          id: "task-mid-2",
          title: "Resolve Cross-Border DPA Signatures",
          category: "GDPR Article 28",
          impact: "+2.0% Score",
          priority: "High",
          description: "The primary vendor agreement for cloud database systems requires a signed annex.",
          remediation: "Upload document to Vault",
          targetPath: "vault"
        },
        {
          id: "task-mid-3",
          title: "Enable Multi-Region Database Failover",
          category: "DORA Resiliency",
          impact: "+1.5% Score",
          priority: "High",
          description: "Ensure that local SQLite instances trigger failovers correctly during simulated outages.",
          remediation: "Audit failover status",
          targetPath: "sandbox"
        }
      ];
    } else {
      return [
        {
          id: "task-low-1",
          title: "Establish Secure Consent Framework",
          category: "GDPR Consent",
          impact: "+6.0% Score",
          priority: "Critical",
          description: "Consent metrics indicate high drift. Users are being tracked before opting in.",
          remediation: "Enable strict blocking",
          targetPath: "sandbox"
        },
        {
          id: "task-low-2",
          title: "DPIA / Article 35 Validation",
          category: "GDPR Audit",
          impact: "+5.0% Score",
          priority: "Critical",
          description: "No certified impact assessment exists for primary analytics services.",
          remediation: "Generate DPIA report",
          targetPath: "sandbox"
        },
        {
          id: "task-low-3",
          title: "Remediate PII Masking Errors",
          category: "PII Security",
          impact: "+4.5% Score",
          priority: "High",
          description: "Live logs are capturing email addresses in plain text in the query ledger.",
          remediation: "Configure live masking",
          targetPath: "sandbox"
        }
      ];
    }
  };

  const tasks = getTasksByScore(score);

  return (
    <motion.div
      id="high-priority-tasks-widget"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
            Top High Priority Compliance Gaps
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Based on health score analysis ({score}%)</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-extrabold border border-rose-100">
            Action Required
          </span>
        </div>
      </div>

      {/* List content */}
      <div className="p-5 flex-grow divide-y divide-slate-100 space-y-4">
        <p className="text-xs text-slate-500 leading-normal mb-1">
          To raise your compliance score from <span className="font-bold text-slate-700">{score}%</span>, resolve the following top high-impact pending items:
        </p>

        <div className="space-y-3.5 pt-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col sm:flex-row items-start justify-between gap-4 p-3.5 rounded-lg border border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-indigo-100 transition duration-200"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    task.priority === "Critical" 
                      ? "bg-rose-100 text-rose-700 border border-rose-200" 
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}>
                    {task.priority}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {task.category}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {task.impact}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">{task.title}</h4>
                <p className="text-[11px] text-slate-500 leading-normal max-w-lg">{task.description}</p>
              </div>

              <div className="flex-shrink-0 self-end sm:self-center">
                <button
                  id={`action-btn-${task.id}`}
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate(task.targetPath);
                    }
                  }}
                  className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 py-1 px-2.5 rounded-md hover:bg-indigo-50 transition cursor-pointer border border-transparent hover:border-indigo-100"
                >
                  {task.remediation}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          Source: Automated regulatory audit scans
        </span>
        <button
          onClick={() => onNavigate && onNavigate("tasks")}
          className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
        >
          View all actionable items &rarr;
        </button>
      </div>
    </motion.div>
  );
};
