import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Shield, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Terminal,
  Server,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchWithRetry } from '../../lib/api-client';

interface Incident {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  status: 'REPORTED' | 'INTERMEDIATE' | 'FINAL' | 'CLOSED';
}

interface ResilienceMetric {
  label: string;
  value: string;
  status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export const DORAResilienceModule: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<ResilienceMetric[]>([
    { label: 'System Uptime (Critical ICT)', value: '99.998%', status: 'OPTIMAL', trend: 'STABLE' },
    { label: 'RTO (Recovery Time Objective)', value: '42m', status: 'OPTIMAL', trend: 'UP' },
    { label: 'RPO (Recovery Point Objective)', value: '0.5s', status: 'OPTIMAL', trend: 'STABLE' },
    { label: 'Third-Party Risk Score', value: '88/100', status: 'DEGRADED', trend: 'DOWN' },
  ]);

  const [incidents, setIncidents] = useState<Incident[]>([
    { id: 'ICT-2026-004', title: 'Unauthorized API Access Attempt (EU-East)', severity: 'HIGH', timestamp: '2026-08-20 14:22', status: 'INTERMEDIATE' },
    { id: 'ICT-2026-003', title: 'Critical Patch Latency - Database Node 4', severity: 'MEDIUM', timestamp: '2026-08-15 09:00', status: 'CLOSED' },
    { id: 'ICT-2026-002', title: 'DDoS Mitigation Event (Filtered)', severity: 'LOW', timestamp: '2026-08-10 23:59', status: 'CLOSED' },
  ]);

  const [assessments, setAssessments] = useState([
    { name: 'ICT Risk Management Audit', date: '2026-07-15', score: '94%', findings: 2 },
    { name: 'Digital Resilience Stress Test', date: '2026-06-30', score: 'Pass', findings: 0 },
    { name: 'Third-Party ICT Service Provider Gap Analysis', date: '2026-08-01', score: '82%', findings: 5 },
  ]);

  const loadTelemetryData = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/dashboard/dora-telemetry');
      if (res && res.ok) {
        const json = await res.json();
        if (json.success && json.telemetry) {
          if (json.telemetry.metrics) setMetrics(json.telemetry.metrics);
          if (json.telemetry.incidents) setIncidents(json.telemetry.incidents);
          if (json.telemetry.assessments) setAssessments(json.telemetry.assessments);
        }
      }
    } catch (err) {
      console.warn('[DORA Module] Unable to reach live API telemetry endpoint, maintaining local state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetryData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Live Sync Status Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wide">DORA ICT Telemetry Sync</span>
          <span className="text-[10px] text-slate-400 font-mono">/api/v1/dashboard/dora-telemetry</span>
        </div>
        <button
          onClick={loadTelemetryData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          <span>{loading ? 'Refreshing...' : 'Sync Database'}</span>
        </button>
      </div>

      {/* Real-time Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
              <Activity className={cn(
                "w-4 h-4",
                m.status === 'OPTIMAL' ? "text-emerald-500" : m.status === 'DEGRADED' ? "text-amber-500" : "text-rose-500"
              )} />
            </div>
            <div className="text-2xl font-black text-slate-900">{m.value}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                m.status === 'OPTIMAL' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              )}>
                {m.status}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Trend: {m.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Notification Timeline */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">DORA Incident Timeline</h4>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Art. 19 Reporting Compliance</div>
          </div>

          <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {incidents.map((incident, i) => (
              <div key={i} className="relative pl-8 group">
                <div className={cn(
                  "absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110",
                  incident.severity === 'CRITICAL' ? "bg-rose-500" : 
                  incident.severity === 'HIGH' ? "bg-orange-500" : 
                  incident.severity === 'MEDIUM' ? "bg-amber-500" : "bg-blue-500"
                )}>
                  <Zap className="w-2.5 h-2.5 text-white" />
                </div>
                
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-white group-hover:border-slate-200 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{incident.id}</span>
                    <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded uppercase",
                      incident.status === 'CLOSED' ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                    )}>
                      {incident.status}
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 mb-1">{incident.title}</h5>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200/50">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500">{incident.timestamp}</span>
                    </div>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                      View Report <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Resilience Assessments */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Resilience Assessments</h4>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase italic">Read-Only Vault</div>
          </div>

          <div className="space-y-4">
            {assessments.map((asmt, i) => (
              <div key={i} className="p-4 bg-slate-900 rounded-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-16 translate-x-16 blur-3xl pointer-events-none" />
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                      <Terminal className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs font-black tracking-tight">{asmt.name}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{asmt.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Audit Outcome</div>
                    <div className={cn(
                      "text-sm font-black uppercase tracking-tight",
                      asmt.score === 'Pass' || parseInt(asmt.score) > 90 ? "text-emerald-400" : "text-amber-400"
                    )}>
                      {asmt.score}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    <span className="text-[10px] font-bold text-slate-400">{asmt.findings} Mandatory Remediation Actions</span>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 text-[9px] font-black rounded-lg hover:bg-slate-100 transition-all uppercase tracking-widest">
                    <FileText className="w-3 h-3" /> Report
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">ICT Infrastructure Map</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Automated mapping of critical ICT assets in scope for DORA Article 8. Last sync with CMDB: 2026-08-21 12:00.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
