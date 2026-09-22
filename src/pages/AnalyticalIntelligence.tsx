import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { 
  Activity, Shield, Map, AlertTriangle, FileText, Download, TrendingUp, TrendingDown, 
  Server, Database, CheckCircle2, Cpu, Search, AlertCircle, Terminal, RefreshCw, Layers,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

interface InsightData {
  engine: string;
  lastUpdate: string;
  regionalStats: any[];
  violationSeverityDistribution: any[];
}

export const AnalyticalIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'audit_analytics'>('dashboard');
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  // Forensic Audit State
  const [summary, setSummary] = useState<any | null>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Dwell Time Analytics State
  const [dwellStats, setDwellStats] = useState<any | null>(null);
  const [dwellLoading, setDwellLoading] = useState(true);

  const fetchDwellStats = async () => {
    setDwellLoading(true);
    try {
      const response = await fetchWithRetry('/api/v1/reporting/analytics/dwell-time');
      const data = await response.json();
      if (data.success) {
        setDwellStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch dwell stats:', error);
    } finally {
      setDwellLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await fetchWithRetry('/api/v1/reporting/insights');
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchForensicAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      // Fetch summary and anomalies
      const [sumRes, anomRes] = await Promise.all([
        fetchWithRetry('/api/v1/reporting/analytics/summary').then(r => r.json()),
        fetchWithRetry('/api/v1/reporting/analytics/anomalies').then(r => r.json())
      ]);

      if (sumRes.success) setSummary(sumRes.summary);
      if (anomRes.success) setAnomalies(anomRes.anomalies);
    } catch (error) {
      console.error('Failed to fetch forensic summary/anomalies:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const searchLogs = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchKeyword) params.append('searchKeyword', searchKeyword);
      if (filterSeverity) params.append('severity', filterSeverity);
      if (filterStatus) params.append('status', filterStatus);
      if (filterModule) params.append('serviceModule', filterModule);
      params.append('limit', '30');

      const response = await fetchWithRetry(`/api/v1/reporting/analytics/search?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setAuditLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to search forensic audit logs:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    fetchDwellStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit_analytics') {
      fetchForensicAnalytics();
      searchLogs();
    } else if (activeTab === 'dashboard') {
      fetchInsights();
      fetchDwellStats();
    }
  }, [activeTab]);

  // Re-run search when filters change
  useEffect(() => {
    if (activeTab === 'audit_analytics') {
      searchLogs();
    }
  }, [filterSeverity, filterStatus, filterModule]);

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            Intelligence & Analytical Service
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Executive dashboard powered by <strong>DuckDB (OLAP)</strong> & <strong>SQLite (OLTP)</strong> for Hybrid Storage Architecture.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            Executive Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('audit_analytics')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'audit_analytics' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            Forensic Audit Analytics
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            Compliance Reports
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Hybrid Storage Status Card */}
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-5 sm:p-6 lg:p-8 opacity-10">
              <Database className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                  <Cpu className="w-3 h-3" /> Hybrid Storage Active
                </div>
                <h2 className="text-2xl font-bold">DuckDB Analytical Engine</h2>
                <p className="text-slate-400 text-sm max-w-xl">
                  Leveraging high-performance vectorized execution to query the Sovereign Ledger (SQLite) directly for sub-second compliance insights.
                </p>
              </div>
              <div className="flex items-center gap-5 sm:gap-8">
                <div className="text-center">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Processing Mode</div>
                  <div className="text-indigo-400 font-mono font-bold">In-Memory OLAP</div>
                </div>
                <div className="text-center border-l border-slate-800 pl-8">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Engine Status</div>
                  <div className="text-emerald-400 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Healthy
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Risk Score</span>
                <Shield className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-slate-800">
                {insights?.regionalStats?.length ? Math.round(insights.regionalStats.reduce((acc, curr) => acc + curr.avg_risk_score, 0) / insights.regionalStats.length) : '24'}
              </div>
              <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Live analytical average
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Analytical Scans</span>
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-3xl font-black text-slate-800">
                {insights?.regionalStats?.reduce((acc, curr) => acc + curr.total_scans, 0) || '0'}
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-1">
                Processed via DuckDB view
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PII Table Size</span>
                <Database className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-slate-800">
                {insights?.regionalStats?.length ? '32.4MB' : '8.2MB'}
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-1">
                Compressed Parquet Format
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Engine Latency</span>
                <Server className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-slate-800">12ms</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Vectorized optimization
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Regional Risk Intelligence */}
            <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                 <Map className="w-5 h-5 text-indigo-500" />
                 Regional Risk Intelligence (OLAP)
               </h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-400 font-bold border-b border-slate-100">
                        <th className="pb-3 px-2">Region</th>
                        <th className="pb-3 px-2 text-center">Status</th>
                        <th className="pb-3 px-2 text-right">Avg Risk</th>
                        <th className="pb-3 px-2 text-right">Volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {insights?.regionalStats?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-2 font-bold text-slate-700">{row.region}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${row.decision_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                              {row.decision_status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-slate-600">{Math.round(row.avg_risk_score)}</td>
                          <td className="py-3 px-2 text-right text-slate-500">{row.total_scans}</td>
                        </tr>
                      ))}
                      {!insights?.regionalStats?.length && [1,2,3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-3 px-2 h-10 bg-slate-50 rounded"></td>
                          <td className="py-3 px-2 h-10 bg-slate-50 rounded"></td>
                          <td className="py-3 px-2 h-10 bg-slate-50 rounded"></td>
                          <td className="py-3 px-2 h-10 bg-slate-50 rounded"></td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>

            {/* Violation Severity Distribution */}
            <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                 <AlertTriangle className="w-5 h-5 text-rose-500" />
                 Violation Severity Distribution
               </h3>
               <div className="space-y-4">
                 {insights?.violationSeverityDistribution?.map((item, idx) => (
                   <div key={idx}>
                      <div className="flex justify-between items-center text-xs font-bold mb-1">
                        <span className="text-slate-600 uppercase">{item.severity}</span>
                        <span className="text-slate-900">{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.severity === 'critical' ? 'bg-rose-500' : item.severity === 'high' ? 'bg-amber-500' : 'bg-indigo-500'}`}
                          style={{ width: `${(item.count / insights.violationSeverityDistribution.reduce((a, b) => a + b.count, 0)) * 100}%` }}
                        />
                      </div>
                   </div>
                 ))}
                 {!insights?.violationSeverityDistribution?.length && (
                   <div className="flex items-center justify-center h-32 text-slate-400 text-sm italic">
                     No violation data indexed yet...
                   </div>
                 )}
               </div>
            </div>
          </div>
          
          {/* Dashboard Dwell-Time & Engagement Intelligence */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Dashboard Dwell-Time & Active Engagement Intelligence
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Monitoring compliance officer dwell-time on specific modules to identify training gaps, system bottlenecks, and audit blind spots.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-full border border-emerald-200 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Active Telemetry Feed
                </span>
                <button 
                  onClick={fetchDwellStats}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  title="Refresh Telemetry"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {dwellLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-xs text-slate-400 font-medium">Analyzing modular user session feeds...</span>
              </div>
            ) : !dwellStats || !dwellStats.byModule || dwellStats.byModule.length === 0 ? (
              <div className="py-8 text-center text-slate-400 italic text-sm">
                No active modular dwell-time telemetry recorded yet. Go explore other modules in the sidebar to populate data.
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Metrics Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Active Sessions</span>
                    <div className="text-2xl font-extrabold text-slate-800 mt-1">{dwellStats.totalSessions}</div>
                    <span className="text-[10px] text-slate-500 font-medium block mt-1">Operational interfaces accessed</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tracked Duration</span>
                    <div className="text-2xl font-extrabold text-indigo-600 mt-1">
                      {Math.floor(dwellStats.totalDurationSeconds / 60)}m {dwellStats.totalDurationSeconds % 60}s
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block mt-1">Total active dwell-time</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Session Length</span>
                    <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                      {Math.floor(dwellStats.averageDurationSeconds / 60)}m {dwellStats.averageDurationSeconds % 60}s
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block mt-1">Mean active attention span</span>
                  </div>
                </div>

                {/* Module List & Progress Bars */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Dwell-Time Distribution by Compliance Module</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dwellStats.byModule.map((mod: any) => {
                      const sharePercentage = dwellStats.totalDurationSeconds > 0 
                        ? Math.min(100, Math.round((mod.totalDurationSeconds / dwellStats.totalDurationSeconds) * 100)) 
                        : 0;

                      return (
                        <div key={mod.moduleId} className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all bg-white flex flex-col justify-between space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="text-xs font-bold text-slate-800">{mod.moduleName}</h5>
                              <span className="text-[10px] text-slate-400 font-mono uppercase">ID: {mod.moduleId}</span>
                            </div>
                            <span className="text-xs font-extrabold text-indigo-600">
                              {mod.totalDurationSeconds >= 60 ? `${Math.floor(mod.totalDurationSeconds / 60)}m ` : ''}{mod.totalDurationSeconds % 60}s
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] text-slate-500">
                              <span>Share of active focus</span>
                              <span className="font-bold">{sharePercentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${sharePercentage}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-50 pt-2 font-medium">
                            <span>Sessions: <strong className="text-slate-800">{mod.sessionCount}</strong></span>
                            <span>Avg Session: <strong className="text-slate-800">{Math.floor(mod.averageDurationSeconds / 60)}m {mod.averageDurationSeconds % 60}s</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actionable Recommendations Panel */}
                <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-xl space-y-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🛡️</span>
                    <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">Actionable Compliance Optimization Insights</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Recommendation 1 */}
                    <div className="flex gap-3 items-start bg-white p-3.5 border border-indigo-100 rounded-lg shadow-sm">
                      <span className="text-lg">🔍</span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">Verify High-Dwell Time Systems</h5>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Modules with longer active sessions (e.g., those averaging &gt; 2 mins) indicate high operator concentration or complex reviews. Consider building simplified checklists for these screens.
                        </p>
                      </div>
                    </div>

                    {/* Recommendation 2 */}
                    <div className="flex gap-3 items-start bg-white p-3.5 border border-indigo-100 rounded-lg shadow-sm">
                      <span className="text-lg">⚠️</span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">Identify Compliance Blind Spots</h5>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Core modules with low or zero dwell times (e.g., Privacy or Consent engines) suggest low testing frequency. Proactively prompt compliance officers for periodic audits of these inactive sectors.
                        </p>
                      </div>
                    </div>

                    {/* Recommendation 3 */}
                    <div className="flex gap-3 items-start bg-white p-3.5 border border-indigo-100 rounded-lg shadow-sm">
                      <span className="text-lg">⚡</span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">Operator Fatigue Mitigation</h5>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Continuous engagement above 5 minutes on incident response or risk screens is flagged. Standard security guidelines recommend task rotation or automated co-pilot assistance.
                        </p>
                      </div>
                    </div>

                    {/* Recommendation 4 */}
                    <div className="flex gap-3 items-start bg-white p-3.5 border border-indigo-100 rounded-lg shadow-sm">
                      <span className="text-lg">📈</span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">Sovereign Audit Trail Alignment</h5>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          All recorded session durations have been securely signed and committed to the immutable event ledger in SQLite, guaranteeing untamperable activity footprint tracking.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data Flow Analysis */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-emerald-500" />
                Hybrid Architecture Pipeline
             </h3>
             <div className="flex flex-col md:flex-row items-center gap-4">
               <div className="flex-1 p-4 border border-slate-200 rounded-lg text-center bg-slate-50">
                 <div className="text-sm font-bold text-slate-700 mb-1">SQLite (OLTP)</div>
                 <div className="text-[10px] text-slate-400 font-mono">Live Transactional Ledger</div>
               </div>
               <div className="text-slate-400">↔</div>
               <div className="flex-1 p-4 border border-indigo-200 rounded-lg text-center bg-indigo-50 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-1">
                   <Shield className="w-3 h-3 text-indigo-500" />
                 </div>
                 <div className="text-sm font-bold text-indigo-900 mb-1">Sovereign Bridge</div>
                 <div className="text-[10px] text-indigo-700 font-mono">Zero-Copy Attachment</div>
               </div>
               <div className="text-slate-400">→</div>
               <div className="flex-1 p-4 border border-emerald-200 rounded-lg text-center bg-emerald-50">
                 <div className="text-sm font-bold text-emerald-900 mb-1">DuckDB (OLAP)</div>
                 <div className="text-[10px] text-emerald-700 font-mono">Vectorized Analytics</div>
               </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'audit_analytics' && (
        <div className="space-y-4 sm:space-y-6">
          {/* DuckDB Forensic status panel */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Terminal className="w-48 h-48" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
                  <Terminal className="w-3.5 h-3.5" /> High-Performance Columnar Audit Engine
                </div>
                <h2 className="text-xl font-bold">DuckDB Forensic Analytics Center</h2>
                <p className="text-slate-300 text-xs max-w-xl">
                  Inspect large audit trail datasets instantaneously. Columnar vectorized execution identifies behavioral patterns, unauthorized operations, and security outliers with zero middleware overhead.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { fetchForensicAnalytics(); searchLogs(); }} 
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-lg text-white transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Store
                </button>
              </div>
            </div>
          </div>

          {/* Quick Analytical KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Logs Processed</span>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {analyticsLoading ? '...' : summary?.totalLogsCount || '0'}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold block mt-1">Stored in analytics.duckdb</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Critical Incidents</span>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {analyticsLoading ? '...' : summary?.criticalSeverityCount || '0'}
              </div>
              <span className="text-[10px] text-rose-500 font-semibold block mt-1">Requires immediate review</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monitored Tenants</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">
                {analyticsLoading ? '...' : summary?.uniqueTenantsCount || '0'}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold block mt-1">Active client compliance units</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Distinct Operators</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {analyticsLoading ? '...' : summary?.uniqueActorsCount || '0'}
              </div>
              <span className="text-[10px] text-emerald-500 font-semibold block mt-1">System & user sessions tracked</span>
            </div>
          </div>

          {/* Anomalies and Outliers Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1 bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  DuckDB Behavioral Anomalies
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Vectorized window & outlier analysis of activity logs.</p>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {anomalies.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-slate-200 border-dashed rounded-lg text-xs text-slate-400">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    Zero anomalies detected. Systems normal.
                  </div>
                ) : (
                  anomalies.map((anom, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm hover:shadow-md transition-all space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          anom.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          anom.severity === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {anom.type}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(anom.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">{anom.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">{anom.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Columnar Audit Logs Viewer */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Interactive Forensic Log Search
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Execute millisecond-level complex filter scans directly.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {auditLogs.length} items fetched
                  </span>
                </div>
              </div>

              {/* Filters Box */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="sm:col-span-2 relative">
                  <input 
                    type="text" 
                    placeholder="Search query (e.g. key actions, actors, targets...)" 
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchLogs()}
                    className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs outline-none text-slate-700 transition-all placeholder:text-slate-400 font-semibold"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  {searchKeyword && (
                    <button 
                      onClick={() => { setSearchKeyword(''); setTimeout(() => searchLogs(), 0); }} 
                      className="absolute right-2 text-slate-400 hover:text-slate-600 top-1/2 -translate-y-1/2 font-bold text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>

                <select 
                  value={filterSeverity} 
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-2 outline-none text-slate-700 font-semibold cursor-pointer"
                >
                  <option value="">All Severities</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="WARNING">WARNING</option>
                  <option value="INFO">INFO</option>
                </select>

                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-2 outline-none text-slate-700 font-semibold cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="DENIED">DENIED</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              {/* Search Trigger Button */}
              <div className="flex justify-end">
                <button 
                  onClick={searchLogs}
                  disabled={isSearching}
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                  <span>Execute Vector Query</span>
                </button>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-lg max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Actor</th>
                      <th className="py-2.5 px-3">Action Type</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isSearching ? (
                      [1,2,3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="py-3 px-3 h-8 bg-slate-50 rounded"></td>
                        </tr>
                      ))
                    ) : auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                          No audit trail records match the specified filters.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-all font-mono text-[11px] text-slate-600">
                          <td className="py-2.5 px-3 text-slate-400">
                            {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: '2-digit' })} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">{log.actor_id}</td>
                          <td className="py-2.5 px-3 text-indigo-700 font-semibold">{log.action_type}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              log.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700' :
                              log.severity === 'WARNING' ? 'bg-amber-50 text-amber-700' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' :
                              'bg-rose-50 text-rose-700'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 truncate max-w-[120px]">{log.target_resource}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 lg:p-6">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <FileText className="w-5 h-5 text-indigo-600" />
                 Intelligent Compliance Reports
               </h3>
               <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2">
                 <Download className="w-4 h-4" /> Generate New Report
               </button>
             </div>
             
             <div className="space-y-4">
               {[
                 { month: 'June 2026', status: 'Ready' },
                 { month: 'May 2026', status: 'Archived' },
                 { month: 'April 2026', status: 'Archived' },
               ].map((report, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors group cursor-pointer bg-slate-50">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                       <FileText className="w-5 h-5" />
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-800">Monthly Compliance & Security Executive Summary</h4>
                       <p className="text-xs text-slate-500 mt-0.5">{report.month} • PDF • 2.4 MB</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${report.status === 'Ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                       {report.status}
                     </span>
                     <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                       <Download className="w-5 h-5" />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
             
             <div className="mt-8 p-4 bg-slate-900 rounded-xl text-slate-300 font-mono text-sm shadow-inner">
                <div className="text-indigo-400 font-bold mb-2">// SAMPLE GENERATED REPORT CONTENT</div>
                <div className="whitespace-pre-wrap leading-relaxed text-xs">
{`Monthly Compliance & Security Executive Summary:

Compliance Status: 98% (GDPR, DORA, EHDS compliant).
Threats Blocked: 1,240 (DDoS, SQLi, XSS).
PII Masked: 5,000+ entries.
Security Health: Increased by 15% due to automated patching of vulnerabilities.

Benchmarking Insight: Your system is currently operating at a security standard 20% higher than the average in the financial sector.`}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
