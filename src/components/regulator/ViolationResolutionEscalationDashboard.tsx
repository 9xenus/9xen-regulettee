import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Zap,
  FileSpreadsheet,
  Building2,
  Calendar,
  Activity,
  SlidersHorizontal,
  ChevronRight,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

// Datasets for different time horizons
const DATA_90_DAYS = [
  { date: 'Week 1', dateFull: 'Oct 01 - Oct 07', violations: 48, resolved: 38, escalations: 12, autoRemediated: 26, mttrDays: 14.2, resolutionRate: 79.2, noiCount: 8, gracePeriodCount: 3, dpaReviewCount: 1, sanctionCount: 0 },
  { date: 'Week 2', dateFull: 'Oct 08 - Oct 14', violations: 52, resolved: 42, escalations: 15, autoRemediated: 30, mttrDays: 13.8, resolutionRate: 80.7, noiCount: 10, gracePeriodCount: 3, dpaReviewCount: 2, sanctionCount: 0 },
  { date: 'Week 3', dateFull: 'Oct 15 - Oct 21', violations: 61, resolved: 49, escalations: 18, autoRemediated: 36, mttrDays: 12.5, resolutionRate: 80.3, noiCount: 11, gracePeriodCount: 4, dpaReviewCount: 2, sanctionCount: 1 },
  { date: 'Week 4', dateFull: 'Oct 22 - Oct 28', violations: 58, resolved: 48, escalations: 16, autoRemediated: 35, mttrDays: 11.9, resolutionRate: 82.7, noiCount: 9, gracePeriodCount: 4, dpaReviewCount: 2, sanctionCount: 1 },
  { date: 'Week 5', dateFull: 'Oct 29 - Nov 04', violations: 54, resolved: 46, escalations: 14, autoRemediated: 34, mttrDays: 10.8, resolutionRate: 85.1, noiCount: 8, gracePeriodCount: 3, dpaReviewCount: 2, sanctionCount: 1 },
  { date: 'Week 6', dateFull: 'Nov 05 - Nov 11', violations: 49, resolved: 44, escalations: 11, autoRemediated: 33, mttrDays: 9.6, resolutionRate: 89.8, noiCount: 6, gracePeriodCount: 3, dpaReviewCount: 1, sanctionCount: 1 },
  { date: 'Week 7', dateFull: 'Nov 12 - Nov 18', violations: 45, resolved: 41, escalations: 10, autoRemediated: 31, mttrDays: 8.4, resolutionRate: 91.1, noiCount: 6, gracePeriodCount: 2, dpaReviewCount: 1, sanctionCount: 1 },
  { date: 'Week 8', dateFull: 'Nov 19 - Nov 25', violations: 42, resolved: 39, escalations: 9, autoRemediated: 30, mttrDays: 7.5, resolutionRate: 92.8, noiCount: 5, gracePeriodCount: 2, dpaReviewCount: 1, sanctionCount: 1 },
  { date: 'Week 9', dateFull: 'Nov 26 - Dec 02', violations: 39, resolved: 37, escalations: 8, autoRemediated: 29, mttrDays: 6.7, resolutionRate: 94.8, noiCount: 5, gracePeriodCount: 2, dpaReviewCount: 1, sanctionCount: 0 },
  { date: 'Week 10', dateFull: 'Dec 03 - Dec 09', violations: 36, resolved: 35, escalations: 7, autoRemediated: 28, mttrDays: 5.8, resolutionRate: 97.2, noiCount: 4, gracePeriodCount: 2, dpaReviewCount: 1, sanctionCount: 0 },
  { date: 'Week 11', dateFull: 'Dec 10 - Dec 16', violations: 33, resolved: 32, escalations: 6, autoRemediated: 26, mttrDays: 5.1, resolutionRate: 96.9, noiCount: 3, gracePeriodCount: 2, dpaReviewCount: 1, sanctionCount: 0 },
  { date: 'Week 12 (Now)', dateFull: 'Dec 17 - Current', violations: 28, resolved: 27, escalations: 5, autoRemediated: 22, mttrDays: 4.2, resolutionRate: 96.4, noiCount: 3, gracePeriodCount: 1, dpaReviewCount: 1, sanctionCount: 0 },
];

const DATA_30_DAYS = [
  { date: 'Day -30', dateFull: 'Day -30', violations: 12, resolved: 10, escalations: 3, autoRemediated: 7, mttrDays: 9.8, resolutionRate: 83.3, noiCount: 2, gracePeriodCount: 1, dpaReviewCount: 0, sanctionCount: 0 },
  { date: 'Day -25', dateFull: 'Day -25', violations: 14, resolved: 12, escalations: 4, autoRemediated: 9, mttrDays: 8.9, resolutionRate: 85.7, noiCount: 2, gracePeriodCount: 1, dpaReviewCount: 1, sanctionCount: 0 },
  { date: 'Day -20', dateFull: 'Day -20', violations: 11, resolved: 10, escalations: 2, autoRemediated: 8, mttrDays: 7.6, resolutionRate: 90.9, noiCount: 1, gracePeriodCount: 1, dpaReviewCount: 0, sanctionCount: 0 },
  { date: 'Day -15', dateFull: 'Day -15', violations: 15, resolved: 14, escalations: 3, autoRemediated: 11, mttrDays: 6.8, resolutionRate: 93.3, noiCount: 2, gracePeriodCount: 1, dpaReviewCount: 0, sanctionCount: 0 },
  { date: 'Day -10', dateFull: 'Day -10', violations: 9, resolved: 9, escalations: 2, autoRemediated: 7, mttrDays: 5.4, resolutionRate: 100.0, noiCount: 1, gracePeriodCount: 1, dpaReviewCount: 0, sanctionCount: 0 },
  { date: 'Day -5', dateFull: 'Day -5', violations: 10, resolved: 9, escalations: 2, autoRemediated: 8, mttrDays: 4.9, resolutionRate: 90.0, noiCount: 1, gracePeriodCount: 1, dpaReviewCount: 0, sanctionCount: 0 },
  { date: 'Today', dateFull: 'Current Date', violations: 7, resolved: 7, escalations: 1, autoRemediated: 6, mttrDays: 4.2, resolutionRate: 100.0, noiCount: 1, gracePeriodCount: 0, dpaReviewCount: 0, sanctionCount: 0 },
];

const DATA_1_YEAR = [
  { date: 'Jan', dateFull: 'Jan 2026', violations: 180, resolved: 130, escalations: 55, autoRemediated: 85, mttrDays: 18.4, resolutionRate: 72.2, noiCount: 30, gracePeriodCount: 15, dpaReviewCount: 8, sanctionCount: 2 },
  { date: 'Feb', dateFull: 'Feb 2026', violations: 195, resolved: 148, escalations: 60, autoRemediated: 98, mttrDays: 17.1, resolutionRate: 75.9, noiCount: 32, gracePeriodCount: 16, dpaReviewCount: 9, sanctionCount: 3 },
  { date: 'Mar', dateFull: 'Mar 2026', violations: 210, resolved: 165, escalations: 62, autoRemediated: 112, mttrDays: 15.8, resolutionRate: 78.5, noiCount: 34, gracePeriodCount: 17, dpaReviewCount: 8, sanctionCount: 3 },
  { date: 'Apr', dateFull: 'Apr 2026', violations: 225, resolved: 184, escalations: 58, autoRemediated: 129, mttrDays: 14.5, resolutionRate: 81.7, noiCount: 31, gracePeriodCount: 16, dpaReviewCount: 8, sanctionCount: 3 },
  { date: 'May', dateFull: 'May 2026', violations: 205, resolved: 172, escalations: 49, autoRemediated: 126, mttrDays: 13.0, resolutionRate: 83.9, noiCount: 26, gracePeriodCount: 14, dpaReviewCount: 7, sanctionCount: 2 },
  { date: 'Jun', dateFull: 'Jun 2026', violations: 190, resolved: 165, escalations: 42, autoRemediated: 124, mttrDays: 11.6, resolutionRate: 86.8, noiCount: 22, gracePeriodCount: 12, dpaReviewCount: 6, sanctionCount: 2 },
  { date: 'Jul', dateFull: 'Jul 2026', violations: 175, resolved: 156, escalations: 35, autoRemediated: 120, mttrDays: 10.2, resolutionRate: 89.1, noiCount: 19, gracePeriodCount: 10, dpaReviewCount: 5, sanctionCount: 1 },
  { date: 'Aug', dateFull: 'Aug 2026', violations: 160, resolved: 148, escalations: 28, autoRemediated: 118, mttrDays: 8.9, resolutionRate: 92.5, noiCount: 15, gracePeriodCount: 8, dpaReviewCount: 4, sanctionCount: 1 },
  { date: 'Sep', dateFull: 'Sep 2026', violations: 150, resolved: 142, escalations: 24, autoRemediated: 115, mttrDays: 7.6, resolutionRate: 94.6, noiCount: 13, gracePeriodCount: 7, dpaReviewCount: 3, sanctionCount: 1 },
  { date: 'Oct', dateFull: 'Oct 2026', violations: 142, resolved: 136, escalations: 20, autoRemediated: 112, mttrDays: 6.4, resolutionRate: 95.7, noiCount: 11, gracePeriodCount: 6, dpaReviewCount: 2, sanctionCount: 1 },
  { date: 'Nov', dateFull: 'Nov 2026', violations: 130, resolved: 126, escalations: 17, autoRemediated: 106, mttrDays: 5.2, resolutionRate: 96.9, noiCount: 9, gracePeriodCount: 5, dpaReviewCount: 2, sanctionCount: 1 },
  { date: 'Dec', dateFull: 'Dec 2026', violations: 118, resolved: 115, escalations: 14, autoRemediated: 98, mttrDays: 4.2, resolutionRate: 97.4, noiCount: 8, gracePeriodCount: 4, dpaReviewCount: 2, sanctionCount: 0 },
];

const RESOLUTION_CHANNELS = [
  { name: 'Telemetry Automated Self-Cure', value: 58, color: '#10b981' },
  { name: 'Consensual Remediation Agreement', value: 24, color: '#6366f1' },
  { name: 'DPA Committee Sanctioned Cure', value: 12, color: '#f59e0b' },
  { name: 'Dismissed / De Minimis (False Positive)', value: 6, color: '#94a3b8' },
];

const VIOLATION_CATEGORY_SPEED = [
  { category: 'Cross-Border Transfer (Art. 44)', avgDays: 14.8, escalations: 18, cases: 42 },
  { category: 'Data Retention & Erasure (Art. 17)', avgDays: 6.2, escalations: 8, cases: 76 },
  { category: 'Consent Telemetry & Tracking', avgDays: 3.5, escalations: 5, cases: 94 },
  { category: '72-Hour Breach Reporting (Art. 33)', avgDays: 8.9, escalations: 14, cases: 31 },
  { category: 'AI Act High-Risk Model Audit', avgDays: 12.1, escalations: 11, cases: 28 },
  { category: 'CCPA Consumer Opt-Out (1798.120)', avgDays: 4.1, escalations: 4, cases: 68 },
];

const RECENT_EVENTS = [
  { id: 'ESC-9812', entity: 'SynthoHealth Europe GmbH', regulation: 'GDPR', type: 'Health Data Encryption (Art. 9)', stage: 'Resolved (Auto-Cure)', daysToResolve: 2.1, timestamp: '12 mins ago', severity: 'HIGH', status: 'RESOLVED' },
  { id: 'ESC-9811', entity: 'FinPeak Global Ltd', regulation: 'DORA', type: 'ICT Third-Party Resiliency Breach', stage: 'DPA Committee Review', daysToResolve: 5.4, timestamp: '1 hour ago', severity: 'CRITICAL', status: 'ESCALATED' },
  { id: 'ESC-9810', entity: 'PacificAd Exchange Inc', regulation: 'CCPA', type: 'Unsolicited Sensitive Data Sale', stage: 'Remediation Grace Period', daysToResolve: 8.0, timestamp: '3 hours ago', severity: 'HIGH', status: 'IN_GRACE' },
  { id: 'ESC-9809', entity: 'AetherLogistics B.V.', regulation: 'GDPR', type: 'Cross-Border Transfer Safeguards', stage: 'Resolved (Consensual)', daysToResolve: 9.3, timestamp: '6 hours ago', severity: 'MODERATE', status: 'RESOLVED' },
  { id: 'ESC-9808', entity: 'Hyperion AI Research Corp', regulation: 'EU AI Act', type: 'Transparency Notice Non-Compliance', stage: 'Notice of Infringement (NoI)', daysToResolve: 1.2, timestamp: '9 hours ago', severity: 'HIGH', status: 'ESCALATED' },
  { id: 'ESC-9807', entity: 'Nordic Retail Group AS', regulation: 'GDPR', type: 'Cookie Consent Dark Patterns', stage: 'Resolved (Auto-Cure)', daysToResolve: 1.8, timestamp: '14 hours ago', severity: 'LOW', status: 'RESOLVED' },
];

interface Props {
  onNavigateToWorkflow?: () => void;
}

export const ViolationResolutionEscalationDashboard: React.FC<Props> = ({ onNavigateToWorkflow }) => {
  const { showToast } = useNotification();
  const [timeHorizon, setTimeHorizon] = useState<'30d' | '90d' | '1y'>('90d');
  const [regulationFilter, setRegulationFilter] = useState<'ALL' | 'GDPR' | 'CCPA' | 'EU_AI_ACT'>('ALL');
  const [activeSeries, setActiveSeries] = useState<{ [key: string]: boolean }>({
    resolved: true,
    escalations: true,
    mttrDays: true,
    autoRemediated: true,
  });
  const [searchFilter, setSearchFilter] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const rawData = useMemo(() => {
    switch (timeHorizon) {
      case '30d':
        return DATA_30_DAYS;
      case '1y':
        return DATA_1_YEAR;
      case '90d':
      default:
        return DATA_90_DAYS;
    }
  }, [timeHorizon]);

  // Adjust data when framework filter changes (simulated deterministic scaling)
  const chartData = useMemo(() => {
    const factor = regulationFilter === 'ALL' ? 1.0 : regulationFilter === 'GDPR' ? 0.65 : regulationFilter === 'CCPA' ? 0.25 : 0.15;
    return rawData.map(d => ({
      ...d,
      violations: Math.round(d.violations * factor),
      resolved: Math.round(d.resolved * factor),
      escalations: Math.round(d.escalations * factor),
      autoRemediated: Math.round(d.autoRemediated * factor),
      noiCount: Math.round(d.noiCount * factor),
      gracePeriodCount: Math.round(d.gracePeriodCount * factor),
      dpaReviewCount: Math.round(d.dpaReviewCount * factor),
      sanctionCount: Math.round(d.sanctionCount * factor),
    }));
  }, [rawData, regulationFilter]);

  // Summary Totals
  const totals = useMemo(() => {
    const totalViolations = chartData.reduce((acc, curr) => acc + curr.violations, 0);
    const totalResolved = chartData.reduce((acc, curr) => acc + curr.resolved, 0);
    const totalEscalations = chartData.reduce((acc, curr) => acc + curr.escalations, 0);
    const totalAutoRemediated = chartData.reduce((acc, curr) => acc + curr.autoRemediated, 0);
    const avgMttr = (chartData.reduce((acc, curr) => acc + curr.mttrDays, 0) / chartData.length).toFixed(1);
    const overallResolutionRate = totalViolations > 0 ? ((totalResolved / totalViolations) * 100).toFixed(1) : '100.0';
    const autoRemediationShare = totalResolved > 0 ? ((totalAutoRemediated / totalResolved) * 100).toFixed(1) : '0.0';
    const escalationRate = totalViolations > 0 ? ((totalEscalations / totalViolations) * 100).toFixed(1) : '0.0';

    return {
      totalViolations,
      totalResolved,
      totalEscalations,
      totalAutoRemediated,
      avgMttr,
      overallResolutionRate,
      autoRemediationShare,
      escalationRate,
    };
  }, [chartData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Telemetry refreshed from live enforcement state nodes.', 'info');
    }, 650);
  };

  const handleExportCsv = () => {
    const headers = 'Date,Violations,Resolved,Escalations,AutoRemediated,MTTR_Days,Resolution_Rate\n';
    const rows = chartData
      .map(d => `${d.date},${d.violations},${d.resolved},${d.escalations},${d.autoRemediated},${d.mttrDays},${d.resolutionRate}%`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Resolution_Escalation_Trends_${timeHorizon}_${regulationFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Enforcement trend analytics exported to CSV.', 'success');
  };

  const toggleSeries = (key: string) => {
    setActiveSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredEvents = RECENT_EVENTS.filter(e => {
    const matchesReg = regulationFilter === 'ALL' || e.regulation === regulationFilter || (regulationFilter === 'EU_AI_ACT' && e.regulation === 'EU AI Act');
    const matchesSearch = searchFilter === '' || e.entity.toLowerCase().includes(searchFilter.toLowerCase()) || e.type.toLowerCase().includes(searchFilter.toLowerCase()) || e.id.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesReg && matchesSearch;
  });

  return (
    <div id="violation-resolution-escalation-dashboard" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl shadow-xl text-white border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Recharts Telemetry Suite
              </span>
              <span className="text-xs text-indigo-200/70 font-mono">Enforcement Engine v3.8</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Violation Resolution & Escalation Analytics</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Real-time trend analysis tracking case resolution velocity, Mean Time to Resolution (MTTR), automated self-cure frequency, and multi-tier escalation state transitions across GDPR, CCPA, and EU AI Act.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateToWorkflow && (
              <button
                id="btn-goto-workflow-builder"
                onClick={onNavigateToWorkflow}
                className="px-3.5 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs shadow transition-all flex items-center gap-1.5 border border-indigo-400/30 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" /> Open Workflow Builder
              </button>
            )}
            <button
              id="btn-refresh-telemetry"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs shadow transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Refresh Feed</span>
            </button>
            <button
              id="btn-export-trends-csv"
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Data (CSV)
            </button>
          </div>
        </div>

        {/* Global KPI Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-900/50">
          <div className="bg-slate-900/70 p-4 rounded-xl border border-indigo-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Total Resolved Cases</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{totals.totalResolved}</span>
              <span className="text-xs font-semibold text-emerald-300">({totals.overallResolutionRate}%)</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400 inline" /> +7.4% vs prior horizon
            </span>
          </div>

          <div className="bg-slate-900/70 p-4 rounded-xl border border-indigo-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Escalations Triggered</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-400">{totals.totalEscalations}</span>
              <span className="text-xs font-semibold text-rose-300">({totals.escalationRate}%)</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-emerald-400 inline" /> -12.3% formal sanction escalations
            </span>
          </div>

          <div className="bg-slate-900/70 p-4 rounded-xl border border-indigo-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Avg Resolution Speed (MTTR)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-300">{totals.avgMttr} <span className="text-sm font-semibold text-slate-300">Days</span></span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 inline" /> 70% faster than 14d SLA target
            </span>
          </div>

          <div className="bg-slate-900/70 p-4 rounded-xl border border-indigo-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Automated Self-Cure</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-cyan-300">{totals.totalAutoRemediated}</span>
              <span className="text-xs font-semibold text-cyan-200">({totals.autoRemediationShare}%)</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 inline" /> Zero manual officer overhead
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Regulation Framework Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Framework:
          </span>
          {[
            { id: 'ALL', label: 'All Frameworks' },
            { id: 'GDPR', label: 'GDPR (EU)' },
            { id: 'CCPA', label: 'CCPA (California)' },
            { id: 'EU_AI_ACT', label: 'EU AI Act' },
          ].map(reg => (
            <button
              key={reg.id}
              onClick={() => setRegulationFilter(reg.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                regulationFilter === reg.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* Time Horizon Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Timeframe:
          </span>
          {[
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
            { id: '1y', label: '1 Year' },
          ].map(h => (
            <button
              key={h.id}
              onClick={() => setTimeHorizon(h.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeHorizon === h.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Chart: Violation Resolutions & Escalation Frequency Over Time */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Violation Resolutions vs Escalation Frequency Over Time</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dual-axis trend tracking total cases resolved, automated self-cures, escalation events, and average resolution speed (MTTR).
            </p>
          </div>

          {/* Toggleable Series Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => toggleSeries('resolved')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                activeSeries.resolved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                  : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Resolved Cases
            </button>
            <button
              onClick={() => toggleSeries('escalations')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                activeSeries.escalations
                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                  : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Escalation Frequency
            </button>
            <button
              onClick={() => toggleSeries('autoRemediated')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                activeSeries.autoRemediated
                  ? 'bg-cyan-50 text-cyan-700 border-cyan-300 shadow-xs'
                  : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
              Auto-Cured
            </button>
            <button
              onClick={() => toggleSeries('mttrDays')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                activeSeries.mttrDays
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                  : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
              MTTR (Days)
            </button>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 35, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="gradientResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradientAuto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={8} />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'Case Volume (Count)', angle: -90, position: 'insideLeft', offset: -5, fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6366f1' }}
                label={{ value: 'Resolution Time (Days)', angle: 90, position: 'insideRight', offset: -5, fill: '#6366f1', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs space-y-2 min-w-[210px]">
                        <div className="border-b border-slate-800 pb-1.5 flex justify-between items-center">
                          <span className="font-extrabold text-indigo-300">{data.dateFull || label}</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                            {data.resolutionRate}% Resolved
                          </span>
                        </div>
                        <div className="space-y-1 font-mono text-[11px]">
                          <div className="flex justify-between items-center text-emerald-400">
                            <span>● Resolved Violations:</span>
                            <span className="font-black">{data.resolved} cases</span>
                          </div>
                          <div className="flex justify-between items-center text-cyan-400">
                            <span>● Auto-Remediated:</span>
                            <span className="font-black">{data.autoRemediated} cases</span>
                          </div>
                          <div className="flex justify-between items-center text-rose-400">
                            <span>● Escalation Events:</span>
                            <span className="font-black">{data.escalations} cases</span>
                          </div>
                          <div className="flex justify-between items-center text-indigo-300 pt-1 border-t border-slate-800">
                            <span>● MTTR (Mean Speed):</span>
                            <span className="font-black">{data.mttrDays} days</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={32} iconType="circle" />

              {/* SLA Target Reference Line */}
              <ReferenceLine yAxisId="right" y={14} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '14-Day Statutory SLA', fill: '#ef4444', fontSize: 10, position: 'right' }} />

              {activeSeries.resolved && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved Violations"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gradientResolved)"
                />
              )}

              {activeSeries.autoRemediated && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="autoRemediated"
                  name="Automated Self-Cure"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientAuto)"
                />
              )}

              {activeSeries.escalations && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="escalations"
                  name="Escalations Frequency"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#f43f5e' }}
                />
              )}

              {activeSeries.mttrDays && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="mttrDays"
                  name="MTTR Speed (Days)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 2.5, fill: '#6366f1' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Row: Escalation Stages Breakdown & Resolution Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Escalation Stage Progression (BarChart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Escalation Frequency by Workflow Stage</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of triggered violations across state-machine escalation tiers over time.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              4-Tier Pipeline
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend verticalAlign="top" height={32} iconType="circle" />
                <Bar dataKey="noiCount" name="Stage 1: Notice of Infringement (NoI)" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="gracePeriodCount" name="Stage 2: Remediation Grace Period" fill="#8b5cf6" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="dpaReviewCount" name="Stage 3: DPA Committee Review" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="sanctionCount" name="Stage 4: Administrative Sanction" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Channels (Donut PieChart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Resolution Channel Breakdown</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">Breakdown of closed cases by settlement and remediation pathway.</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RESOLUTION_CHANNELS}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {RESOLUTION_CHANNELS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}% of resolved cases`, 'Share']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900">{totals.autoRemediationShare}%</span>
              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Automated</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {RESOLUTION_CHANNELS.map(ch => (
              <div key={ch.name} className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 truncate max-w-[180px]">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ch.color }} />
                  {ch.name}
                </span>
                <span className="font-mono font-bold text-slate-900">{ch.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tertiary Section: Violation Category Speed vs Escalations & Recent Case Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category vs Speed BarChart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Resolution Speed by Violation Class</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500">Average days required to resolve specific regulatory infringement categories.</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={VIOLATION_CATEGORY_SPEED} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} unit="d" />
                <YAxis dataKey="category" type="category" width={110} tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} days average`, 'Resolution Speed']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="avgDays" name="Avg Days to Resolve" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Escalation & Resolution Telemetry Log */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Live Escalation & Resolution Telemetry Feed</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time stream of case state transitions and closed remediation covenants.</p>
            </div>
            <input
              type="text"
              placeholder="Filter by entity or ID..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-48 font-medium focus:ring-1 focus:ring-indigo-500 outline-hidden"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Case ID & Entity</th>
                  <th className="px-4 py-2.5">Regulation</th>
                  <th className="px-4 py-2.5">Violation Type</th>
                  <th className="px-4 py-2.5">Current Stage</th>
                  <th className="px-4 py-2.5">Speed</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {event.entity}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{event.id} • {event.timestamp}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        event.regulation === 'GDPR' ? 'bg-blue-100 text-blue-800' :
                        event.regulation === 'CCPA' ? 'bg-purple-100 text-purple-800' :
                        event.regulation === 'EU AI Act' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {event.regulation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[170px] truncate">
                      {event.type}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {event.stage}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">
                      {event.daysToResolve}d
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        event.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                        event.status === 'IN_GRACE' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {event.status === 'RESOLVED' && <CheckCircle2 className="w-3 h-3" />}
                        {event.status === 'IN_GRACE' && <Clock className="w-3 h-3" />}
                        {event.status === 'ESCALATED' && <ShieldAlert className="w-3 h-3" />}
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
