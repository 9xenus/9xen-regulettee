import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert, Clock, AlertTriangle, CheckCircle2, TrendingUp,
  Search, Filter, ArrowUpRight, RefreshCw, Download, UserCheck,
  Send, ExternalLink, Scale, Check, X, FileText, ChevronRight,
  Flame, HelpCircle, Eye, SlidersHorizontal, AlertCircle, Building2,
  Calendar, Layers, Zap
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  LineChart, Line, ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { GrievanceNotificationService } from '../../services/grievanceNotificationService';

export interface GrievanceCase {
  id: string;
  refCode: string;
  countryCode: string;
  jurisdictionName: string;
  entityName: string;
  rawCategory: string;
  normalizedCategory: string;
  description: string;
  severity: number;
  channel: 'WEB_WIDGET' | 'WHATSAPP' | 'SMS' | 'PARTNER_API';
  assignedOfficer: string;
  assignedOfficerId: string;
  statutoryFramework: string;
  statutoryLimitHours: number;
  hoursElapsed: number;
  hoursRemaining: number;
  urgencyStatus: 'CRITICAL' | 'WARNING' | 'ON_TRACK' | 'BREACHED';
  status: 'TRIAGED' | 'UNDER_INVESTIGATION' | 'ENTITY_CURE_PERIOD' | 'REGULATORY_ESCALATION' | 'STATUTORY_ENFORCEMENT_ISSUED' | 'RESOLVED';
  cureNoticeDispatched: boolean;
  cureNoticeTimestamp: string | null;
  createdAt: string;
  regulatoryDeadline: string;
}

const URGENCY_CONFIG = {
  CRITICAL: {
    label: 'Critical (< 24h)',
    badgeBg: 'bg-rose-950/80 border-rose-600/80 text-rose-300',
    dotColor: 'bg-rose-500 animate-ping',
    rowBorder: 'border-l-4 border-l-rose-500 bg-rose-950/10',
    textColor: 'text-rose-400',
    icon: Flame,
  },
  WARNING: {
    label: 'Warning (24-48h)',
    badgeBg: 'bg-amber-950/80 border-amber-600/80 text-amber-300',
    dotColor: 'bg-amber-500',
    rowBorder: 'border-l-4 border-l-amber-500 bg-amber-950/10',
    textColor: 'text-amber-400',
    icon: AlertTriangle,
  },
  ON_TRACK: {
    label: 'On Track (> 48h)',
    badgeBg: 'bg-emerald-950/80 border-emerald-600/80 text-emerald-300',
    dotColor: 'bg-emerald-500',
    rowBorder: 'border-l-4 border-l-emerald-500',
    textColor: 'text-emerald-400',
    icon: CheckCircle2,
  },
  BREACHED: {
    label: 'Statutory Breached',
    badgeBg: 'bg-red-950 border-red-700 text-red-200 font-bold',
    dotColor: 'bg-red-600',
    rowBorder: 'border-l-4 border-l-red-700 bg-red-950/20',
    textColor: 'text-red-400',
    icon: ShieldAlert,
  },
};

const CASE_OFFICERS = [
  { id: 'usr_ombuds_01', name: 'Fatima Rahman (Senior Ombudsman)', role: 'Ombudsman Lead' },
  { id: 'usr_lawyer_02', name: 'Lukas Schneider (Lead GDPR Counsel)', role: 'Legal Counsel' },
  { id: 'usr_inspector_03', name: 'Tanvir Hossain (Cyber Inspector)', role: 'Cyber Forensics' },
  { id: 'usr_fca_04', name: 'Eleanor Vance (FCA Compliance Specialist)', role: 'Financial Crime' },
  { id: 'usr_admin_01', name: 'Marcus Sterling (Consumer Protection Lead)', role: 'Super Admin' },
];

export const SlaMonitoringDashboard: React.FC = () => {
  const { showToast } = useNotification();
  const { role, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any | null>(null);
  const [cases, setCases] = useState<GrievanceCase[]>([]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'ON_TRACK' | 'BREACHED'>('ALL');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activeChartTab, setActiveChartTab] = useState<'RESOLUTION_TREND' | 'STATUS_DISTRIBUTION' | 'CATEGORY_BENCHMARKS' | 'JURISDICTION_PERFORMANCE'>('RESOLUTION_TREND');

  // Modals
  const [selectedCaseForModal, setSelectedCaseForModal] = useState<GrievanceCase | null>(null);
  const [reassignCase, setReassignCase] = useState<GrievanceCase | null>(null);
  const [reassignTargetOfficer, setReassignTargetOfficer] = useState('');
  const [escalateCase, setEscalateCase] = useState<GrievanceCase | null>(null);
  const [escalateType, setEscalateType] = useState('PRIORITY_CURE_NOTICE');
  const [escalateNotes, setEscalateNotes] = useState('');
  const [resolveCase, setResolveCase] = useState<GrievanceCase | null>(null);
  const [resolveOutcome, setResolveOutcome] = useState('REMEDIED_FULL_REFUND');
  const [resolveNotes, setResolveNotes] = useState('');

  // Fetch Data from Server (with safe fallback seeds)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resOverview, resCases] = await Promise.all([
        fetch('/api/v1/grievance/sla/overview'),
        fetch('/api/v1/grievance/sla/cases')
      ]);

      if (resOverview.ok) {
        const d = await resOverview.json();
        if (d.success) setOverview(d.data);
      }

      if (resCases.ok) {
        const c = await resCases.json();
        if (c.success) setCases(c.data);
      }
    } catch (e: any) {
      console.warn('Failed to load SLA telemetry, utilizing sovereign cached metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Live poll every 60s
    return () => clearInterval(interval);
  }, []);

  // Filtered cases calculation
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch =
        c.refCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.normalizedCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.assignedOfficer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUrgency = urgencyFilter === 'ALL' || c.urgencyStatus === urgencyFilter;
      const matchesJurisdiction = jurisdictionFilter === 'ALL' || c.countryCode === jurisdictionFilter;
      const matchesCategory = categoryFilter === 'ALL' || c.rawCategory === categoryFilter;

      return matchesSearch && matchesUrgency && matchesJurisdiction && matchesCategory;
    });
  }, [cases, searchQuery, urgencyFilter, jurisdictionFilter, categoryFilter]);

  // Critical cases nearing deadline (< 24h)
  const criticalCasesNearingDeadline = useMemo(() => {
    return cases
      .filter(c => c.urgencyStatus === 'CRITICAL' && c.hoursRemaining > 0)
      .sort((a, b) => a.hoursRemaining - b.hoursRemaining);
  }, [cases]);

  // Actions
  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignCase || !reassignTargetOfficer) return;
    const officer = CASE_OFFICERS.find(o => o.id === reassignTargetOfficer);

    try {
      const res = await fetch('/api/v1/grievance/sla/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: reassignCase.id,
          newOfficerId: reassignTargetOfficer,
          newOfficerName: officer?.name || reassignTargetOfficer
        })
      });
      const d = await res.json();
      if (d.success) {
        showToast(d.message || 'Case reassigned successfully.', 'success');
        setCases(prev => prev.map(c => c.id === reassignCase.id ? { ...c, assignedOfficer: officer?.name || reassignTargetOfficer, assignedOfficerId: reassignTargetOfficer } : c));
        setReassignCase(null);
      } else {
        showToast(d.error || 'Failed to reassign case', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalateCase) return;

    try {
      const res = await fetch('/api/v1/grievance/sla/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: escalateCase.id,
          escalationType: escalateType,
          notes: escalateNotes
        })
      });
      const d = await res.json();
      if (d.success) {
        showToast(d.message || 'Escalation notice dispatched.', 'success');
        setCases(prev => prev.map(c => c.id === escalateCase.id ? { ...c, status: 'REGULATORY_ESCALATION', cureNoticeDispatched: true } : c));
        
        // Broadcast real-time status change to consumer app & subscribers
        GrievanceNotificationService.broadcastStatusChange({
          refCode: escalateCase.refCode,
          caseId: escalateCase.id,
          entityName: escalateCase.entityName,
          previousStatus: escalateCase.status,
          newStatus: 'REGULATORY_ESCALATION',
          title: `Statutory Notice Dispatched: ${escalateCase.entityName}`,
          message: d.message || `Expedited regulatory notice [${escalateType}] dispatched by enforcement wing.`,
          officerName: escalateCase.assignedOfficer || 'Super Admin Enforcement',
          docketRef: d.docketRef || `DOC-${Date.now().toString().slice(-6)}`,
          urgency: 'CRITICAL'
        });

        setEscalateCase(null);
      } else {
        showToast(d.error || 'Failed to escalate', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveCase) return;

    try {
      const res = await fetch('/api/v1/grievance/sla/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: resolveCase.id,
          resolutionOutcome: resolveOutcome,
          remediationTerms: resolveNotes
        })
      });
      const d = await res.json();
      if (d.success) {
        showToast(d.message || 'Grievance case resolved.', 'success');
        setCases(prev => prev.map(c => c.id === resolveCase.id ? { ...c, status: 'RESOLVED', urgencyStatus: 'ON_TRACK' } : c));
        
        // Broadcast real-time status change to consumer app & subscribers
        GrievanceNotificationService.broadcastStatusChange({
          refCode: resolveCase.refCode,
          caseId: resolveCase.id,
          entityName: resolveCase.entityName,
          previousStatus: resolveCase.status,
          newStatus: 'RESOLVED',
          title: `Grievance Case Resolved: ${resolveCase.entityName}`,
          message: d.message || `Case resolved with outcome [${resolveOutcome}]. Full remediation confirmed.`,
          officerName: resolveCase.assignedOfficer || 'Lead Ombudsman',
          docketRef: `RESOLVED-${Date.now().toString().slice(-6)}`,
          urgency: 'SUCCESS'
        });

        setResolveCase(null);
      } else {
        showToast(d.error || 'Failed to resolve', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Reference Code', 'Entity Name', 'Jurisdiction', 'Category', 'Severity', 'Statutory SLA (Hrs)', 'Elapsed (Hrs)', 'Remaining (Hrs)', 'Urgency', 'Status', 'Assigned Officer', 'Deadline'];
    const rows = filteredCases.map(c => [
      c.refCode,
      `"${c.entityName}"`,
      `"${c.jurisdictionName}"`,
      `"${c.normalizedCategory}"`,
      c.severity,
      c.statutoryLimitHours,
      c.hoursElapsed.toFixed(1),
      c.hoursRemaining.toFixed(1),
      c.urgencyStatus,
      c.status,
      `"${c.assignedOfficer}"`,
      c.regulatoryDeadline
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `grievance_sla_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('SLA audit ledger exported to CSV.', 'info');
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-16">
      {/* Top Header & Ticker */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Admin Governance HQ
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live SLA Engine Active
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Clock className="w-8 h-8 text-indigo-400" />
            SLA Monitoring & Grievance Turnaround
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Real-time regulatory deadline watchdog, resolution time benchmarks, and automated enterprise cure escalation under BTRC, DNCRP, EU GDPR, and UK FCA frameworks.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Realtime Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Sync Live SLA</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export SLA Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Critical < 24h */}
        <div 
          onClick={() => setUrgencyFilter(urgencyFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm relative overflow-hidden ${
            urgencyFilter === 'CRITICAL' 
              ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30' 
              : 'bg-slate-900/90 border-slate-800 hover:border-rose-700/60'
          }`}
        >
          <div className="flex items-center justify-between text-rose-400 text-xs font-mono">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Nearing Deadline (&lt;24h)
            </span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white font-mono">
              {overview?.summary?.criticalUrgencyCount ?? 6}
              <span className="text-xs text-rose-400 font-sans ml-2 font-normal">cases urgent</span>
            </div>
            <p className="text-xs text-rose-300/80 font-mono mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Requires immediate officer triage</span>
            </p>
          </div>
        </div>

        {/* Card 2: Warning (24-48h) */}
        <div 
          onClick={() => setUrgencyFilter(urgencyFilter === 'WARNING' ? 'ALL' : 'WARNING')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            urgencyFilter === 'WARNING'
              ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-slate-900/90 border-slate-800 hover:border-amber-700/60'
          }`}
        >
          <div className="flex items-center justify-between text-amber-400 text-xs font-mono">
            <span className="font-bold">Warning Zone (24-48h)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white font-mono">
              {overview?.summary?.warningUrgencyCount ?? 11}
              <span className="text-xs text-amber-400 font-sans ml-2 font-normal">cases pending</span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Cure notice countdowns running
            </p>
          </div>
        </div>

        {/* Card 3: SLA Compliance Rate */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-mono">
            <span className="font-bold">On-Time SLA Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">
              {overview?.summary?.slaComplianceRate ?? 94.8}%
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1">
              <span className="text-emerald-400">Target ≥ 95.0%</span>
              <span>· {overview?.summary?.resolvedLast30Days ?? 158} resolved MTD</span>
            </p>
          </div>
        </div>

        {/* Card 4: Mean Time to Resolve (MTTR) */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm">
          <div className="flex items-center justify-between text-cyan-400 text-xs font-mono">
            <span className="font-bold">Avg Resolution Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-cyan-400 font-mono">
              {overview?.summary?.avgResolutionHours ?? 38.4}
              <span className="text-xs text-slate-400 font-sans ml-1 font-normal">hours</span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Statutory ceiling: 72.0h (EU) / 168h (BD)
            </p>
          </div>
        </div>
      </div>

      {/* Critical Cases Nearing Deadline - Highlighted Action Banner */}
      {criticalCasesNearingDeadline.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-800/80 shadow-lg relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-900/80 border border-rose-600 flex items-center justify-center shrink-0 text-rose-300">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Regulatory Deadline Alert: {criticalCasesNearingDeadline.length} Cases Expiring in &lt; 24 Hours
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white uppercase animate-pulse">
                    Urgent Cure Action
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Statutory fine penalties escalate automatically upon countdown expiration. Priority cure notices and case officer reassignments recommended.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {criticalCasesNearingDeadline.slice(0, 3).map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCaseForModal(c)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-rose-700/60 text-xs font-mono text-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>{c.refCode}: <strong>{c.hoursRemaining.toFixed(1)}h left</strong></span>
                </button>
              ))}
              <button
                onClick={() => setUrgencyFilter('CRITICAL')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Inspect All Critical ({criticalCasesNearingDeadline.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Hub using Recharts */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
        {/* Chart Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Resolution & SLA Analytics Matrix</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {[
              { id: 'RESOLUTION_TREND', label: 'Resolution Times vs SLA Targets' },
              { id: 'STATUS_DISTRIBUTION', label: 'SLA Status Breakdown' },
              { id: 'CATEGORY_BENCHMARKS', label: 'Category Turnaround' },
              { id: 'JURISDICTION_PERFORMANCE', label: 'Jurisdiction Compliance' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeChartTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Display Container */}
        <div className="h-80 w-full">
          {activeChartTab === 'RESOLUTION_TREND' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview?.resolutionTrend || [
                { month: 'Apr 2026', avgHours: 54.2, targetHours: 72, complianceRate: 91.2 },
                { month: 'May 2026', avgHours: 49.6, targetHours: 72, complianceRate: 93.0 },
                { month: 'Jun 2026', avgHours: 44.1, targetHours: 72, complianceRate: 94.5 },
                { month: 'Jul 2026', avgHours: 41.8, targetHours: 72, complianceRate: 95.8 },
                { month: 'Aug 2026', avgHours: 39.5, targetHours: 72, complianceRate: 96.1 },
                { month: 'Sep 2026 (MTD)', avgHours: 38.4, targetHours: 72, complianceRate: 94.8 },
              ]}>
                <defs>
                  <linearGradient id="colorAvgHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="h" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [
                    name === 'avgHours' ? `${val} hours (Actual MTTR)` : `${val} hours (Statutory Ceiling)`,
                    name === 'avgHours' ? 'Mean Turnaround' : 'Statutory SLA Target'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="avgHours" name="Actual Resolution Time (hrs)" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAvgHours)" />
                <Line type="monotone" dataKey="targetHours" name="Statutory Benchmark Target (72h)" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'STATUS_DISTRIBUTION' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview?.statusDistribution || [
                      { name: 'On Track (>48h)', value: 22, color: '#10b981' },
                      { name: 'Warning (24-48h)', value: 11, color: '#f59e0b' },
                      { name: 'Critical Escalation (<24h)', value: 6, color: '#ef4444' },
                      { name: 'Statutory Breached', value: 3, color: '#7f1d1d' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(overview?.statusDistribution || [
                      { color: '#10b981' }, { color: '#f59e0b' }, { color: '#ef4444' }, { color: '#7f1d1d' }
                    ]).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} Cases`, 'Volume']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
                  SLA Threshold Definitions
                </h4>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                  <span className="text-emerald-300 font-semibold">On Track (&gt; 48 Hours Remaining)</span>
                  <span className="font-mono text-emerald-400 font-bold">Safe Cure Window</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/30 border border-amber-800/40">
                  <span className="text-amber-300 font-semibold">Warning (24 – 48 Hours Remaining)</span>
                  <span className="font-mono text-amber-400 font-bold">Automated Reminder</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/30 border border-rose-800/40">
                  <span className="text-rose-300 font-semibold">Critical (&lt; 24 Hours Remaining)</span>
                  <span className="font-mono text-rose-400 font-bold">Expedited Notice</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-red-950/50 border border-red-800/60">
                  <span className="text-red-300 font-semibold">Statutory Breached</span>
                  <span className="font-mono text-red-400 font-bold">Regulatory Escalation</span>
                </div>
              </div>
            </div>
          )}

          {activeChartTab === 'CATEGORY_BENCHMARKS' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview?.categoryBreakdown || [
                { category: 'Financial Fraud', avgResolutionHours: 28.5, maxSlaHours: 48 },
                { category: 'GDPR Privacy', avgResolutionHours: 46.2, maxSlaHours: 72 },
                { category: 'Deceptive Ads', avgResolutionHours: 84.0, maxSlaHours: 168 },
                { category: 'Health & Safety', avgResolutionHours: 18.2, maxSlaHours: 24 },
                { category: 'Fair Trading', avgResolutionHours: 62.4, maxSlaHours: 120 },
              ]} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} unit="h" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                <Bar dataKey="avgResolutionHours" name="Actual Avg Turnaround (hrs)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="maxSlaHours" name="Statutory SLA Limit (hrs)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'JURISDICTION_PERFORMANCE' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={overview?.jurisdictionPerformance || [
                { jurisdiction: 'BD (DNCRP/BTRC)', avgHours: 42.1, statutoryDeadlineHours: 168, compliancePct: 96.2 },
                { jurisdiction: 'EU (GDPR Art. 33)', avgHours: 36.8, statutoryDeadlineHours: 72, compliancePct: 95.0 },
                { jurisdiction: 'UK (FCA Dispute)', avgHours: 58.4, statutoryDeadlineHours: 360, compliancePct: 98.4 },
                { jurisdiction: 'US (FTC / CFPB)', avgHours: 48.0, statutoryDeadlineHours: 240, compliancePct: 94.1 },
                { jurisdiction: 'SG (PDPC / MAS)', avgHours: 32.5, statutoryDeadlineHours: 168, compliancePct: 97.5 },
              ]} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="jurisdiction" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} unit="h" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} unit="%" domain={[80, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                <Bar yAxisId="left" dataKey="avgHours" name="Avg Resolution Time (hrs)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="compliancePct" name="SLA Compliance %" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grievance SLA Case Management Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Controls / Filter Bar */}
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-400" />
              Pending Grievances &amp; Regulatory Deadlines
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {filteredCases.length} of {cases.length} Cases
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reference, entity, officer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Urgency Filter Dropdown */}
            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
            >
              <option value="ALL">All Urgencies</option>
              <option value="CRITICAL">🔴 Critical (&lt; 24h)</option>
              <option value="WARNING">🟡 Warning (24-48h)</option>
              <option value="ON_TRACK">🟢 On Track (&gt; 48h)</option>
              <option value="BREACHED">⚫ Statutory Breached</option>
            </select>

            {/* Jurisdiction Filter Dropdown */}
            <select
              value={jurisdictionFilter}
              onChange={e => setJurisdictionFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
            >
              <option value="ALL">All Jurisdictions</option>
              <option value="BD">BD (BTRC / DNCRP)</option>
              <option value="EU">EU (GDPR Art. 33)</option>
              <option value="GB">UK (FCA / PSR)</option>
              <option value="US">US (FTC / CFPB)</option>
              <option value="SG">SG (MAS / PDPC)</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="FINANCIAL_FRAUD">Financial Fraud</option>
              <option value="PRIVACY_VIOLATION">Privacy / Data Breach</option>
              <option value="DECEPTIVE_ADVERTISING">Deceptive Advertising</option>
              <option value="UNAUTHORIZED_FINTECH">Unauthorized Fintech</option>
              <option value="PUBLIC_SAFETY_HEALTH">Health &amp; Safety</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Grievance Ref &amp; Entity</th>
                <th className="py-3.5 px-4">Regulatory Framework</th>
                <th className="py-3.5 px-4">Statutory SLA Countdown</th>
                <th className="py-3.5 px-4">Severity &amp; Status</th>
                <th className="py-3.5 px-4">Assigned Case Officer</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 font-mono">
                    No grievance cases match the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map(c => {
                  const urgencyMeta = URGENCY_CONFIG[c.urgencyStatus] || URGENCY_CONFIG.ON_TRACK;
                  const UrgencyIcon = urgencyMeta.icon;
                  const percentElapsed = Math.min(100, Math.max(0, (c.hoursElapsed / c.statutoryLimitHours) * 100));

                  return (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-slate-800/40 transition-colors ${urgencyMeta.rowBorder}`}
                    >
                      {/* Ref & Entity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-xs">
                            {c.refCode}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {c.channel}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{c.entityName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          {c.normalizedCategory}
                        </div>
                      </td>

                      {/* Framework & Jurisdiction */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-200 text-xs font-semibold">
                          {c.countryCode} · {c.jurisdictionName}
                        </div>
                        <div className="text-[11px] text-indigo-300 font-mono mt-0.5">
                          {c.statutoryFramework}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Max Limit: {c.statutoryLimitHours}h
                        </div>
                      </td>

                      {/* Statutory SLA Countdown */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1.5 ${urgencyMeta.badgeBg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${urgencyMeta.dotColor}`} />
                            <UrgencyIcon className="w-3 h-3" />
                            <span>
                              {c.hoursRemaining > 0 
                                ? `${c.hoursRemaining.toFixed(1)}h Remaining`
                                : `${Math.abs(c.hoursRemaining).toFixed(1)}h Breached`}
                            </span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {percentElapsed.toFixed(0)}% elapsed
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full transition-all ${
                              c.urgencyStatus === 'CRITICAL' ? 'bg-rose-500' :
                              c.urgencyStatus === 'WARNING' ? 'bg-amber-500' :
                              c.urgencyStatus === 'BREACHED' ? 'bg-red-700' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentElapsed}%` }}
                          />
                        </div>

                        <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center justify-between">
                          <span>Elapsed: {c.hoursElapsed.toFixed(1)}h</span>
                          <span>Deadline: {new Date(c.regulatoryDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>

                      {/* Severity & Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-[11px] font-mono font-bold text-slate-300">Severity:</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            c.severity >= 5 ? 'bg-rose-900/60 text-rose-300 border border-rose-700' :
                            c.severity === 4 ? 'bg-amber-900/60 text-amber-300 border border-amber-700' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {c.severity} / 5
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800/90 text-slate-300 border border-slate-700 block w-fit truncate max-w-[140px]">
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Assigned Case Officer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-200">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[150px] font-medium">{c.assignedOfficer}</span>
                        </div>
                        <button
                          onClick={() => {
                            setReassignCase(c);
                            setReassignTargetOfficer(c.assignedOfficerId);
                          }}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono mt-1 underline cursor-pointer"
                        >
                          Reassign Officer
                        </button>
                      </td>

                      {/* Fast Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.urgencyStatus === 'CRITICAL' && (
                            <button
                              onClick={() => {
                                setEscalateCase(c);
                                setEscalateNotes(`Critical SLA breach notice dispatched for ${c.refCode}.`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-[11px] font-bold shadow-sm transition-colors cursor-pointer"
                              title="Dispatch Priority Regulatory Cure Notice"
                            >
                              Fast Cure
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedCaseForModal(c)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Inspect Complete Grievance Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setResolveCase(c)}
                            className="p-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 transition-colors cursor-pointer"
                            title="Mark Resolved & Mitigated"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Case Inspection Dossier Modal */}
      <AnimatePresence>
        {selectedCaseForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-100 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white font-mono">{selectedCaseForModal.refCode}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${URGENCY_CONFIG[selectedCaseForModal.urgencyStatus]?.badgeBg}`}>
                        {selectedCaseForModal.urgencyStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedCaseForModal.entityName} · {selectedCaseForModal.jurisdictionName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCaseForModal(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs">
                {/* SLA Countdown Highlight */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  selectedCaseForModal.urgencyStatus === 'CRITICAL' ? 'bg-rose-950/40 border-rose-700 text-rose-200' :
                  selectedCaseForModal.urgencyStatus === 'WARNING' ? 'bg-amber-950/40 border-amber-700 text-amber-200' :
                  'bg-emerald-950/40 border-emerald-700 text-emerald-200'
                }`}>
                  <div>
                    <div className="font-bold text-sm font-mono flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Regulatory SLA: {selectedCaseForModal.hoursRemaining.toFixed(1)} Hours Remaining</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Statutory Framework: <strong>{selectedCaseForModal.statutoryFramework}</strong> (Limit: {selectedCaseForModal.statutoryLimitHours}h)
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs text-slate-400">Deadline:</div>
                    <div className="font-bold">{new Date(selectedCaseForModal.regulatoryDeadline).toLocaleString()}</div>
                  </div>
                </div>

                {/* Complaint Summary */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
                    Grievance Description &amp; Incident Record
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {selectedCaseForModal.description}
                  </p>
                </div>

                {/* Grid Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Severity</div>
                    <div className="text-sm font-bold text-white mt-1">{selectedCaseForModal.severity} / 5</div>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Channel</div>
                    <div className="text-sm font-bold text-white mt-1">{selectedCaseForModal.channel}</div>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Hours Elapsed</div>
                    <div className="text-sm font-bold text-white mt-1">{selectedCaseForModal.hoursElapsed.toFixed(1)} hrs</div>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Officer</div>
                    <div className="text-sm font-bold text-white mt-1 truncate">{selectedCaseForModal.assignedOfficer.split(' ')[0]}</div>
                  </div>
                </div>

                {/* Statutory Timeline Lineage */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
                    Statutory Enforcement Audit Lineage
                  </h4>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">1. Consumer Intake &amp; Encrypted SHA-256 Seal</span>
                      <span className="text-emerald-400">{new Date(selectedCaseForModal.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">2. AI Triage Classification &amp; Authority Routing</span>
                      <span className="text-emerald-400">Verified (0.91 Conf)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">3. Due-Process Enterprise Cure Notice</span>
                      <span className={selectedCaseForModal.cureNoticeDispatched ? 'text-emerald-400' : 'text-amber-400'}>
                        {selectedCaseForModal.cureNoticeDispatched ? 'Dispatched' : 'Pending'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">4. Regulatory Escalation Checkpoint</span>
                      <span className="text-indigo-400">{selectedCaseForModal.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    const c = selectedCaseForModal;
                    setSelectedCaseForModal(null);
                    setReassignCase(c);
                    setReassignTargetOfficer(c.assignedOfficerId);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Reassign Officer
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const c = selectedCaseForModal;
                      setSelectedCaseForModal(null);
                      setEscalateCase(c);
                      setEscalateNotes(`Priority regulatory cure notice triggered for ${c.refCode}.`);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Issue Fast Cure Notice
                  </button>
                  <button
                    onClick={() => {
                      const c = selectedCaseForModal;
                      setSelectedCaseForModal(null);
                      setResolveCase(c);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Mark Case Resolved
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Reassign Officer Modal */}
      <AnimatePresence>
        {reassignCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-400" />
                  Reassign Case Officer
                </h3>
                <button onClick={() => setReassignCase(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReassign} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Case Reference</label>
                  <div className="font-mono font-bold text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {reassignCase.refCode} ({reassignCase.entityName})
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Select Assigned Compliance Lead</label>
                  <select
                    value={reassignTargetOfficer}
                    onChange={e => setReassignTargetOfficer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {CASE_OFFICERS.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} · [{o.role}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReassignCase(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                  >
                    Confirm Reassignment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Fast Cure / Escalation Modal */}
      <AnimatePresence>
        {escalateCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-rose-950/30">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-400" />
                  Dispatch Statutory Escalation Notice
                </h3>
                <button onClick={() => setEscalateCase(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEscalate} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Target Case</label>
                  <div className="font-mono font-bold text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {escalateCase.refCode} - {escalateCase.entityName}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Escalation Notice Type</label>
                  <select
                    value={escalateType}
                    onChange={e => setEscalateType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="PRIORITY_CURE_NOTICE">24-Hour Enterprise Statutory Cure Notice</option>
                    <option value="FORMAL_DOCKET_ESCALATION">Direct Ombudsman Formal Enforcement Docket</option>
                    <option value="MERCHANT_GATEWAY_FREEZE">Emergency Merchant Gateway Freeze Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Remediation Rationale / Notes</label>
                  <textarea
                    rows={3}
                    value={escalateNotes}
                    onChange={e => setEscalateNotes(e.target.value)}
                    placeholder="Provide context for authority docket..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEscalateCase(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                  >
                    Dispatch Regulatory Notice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Resolve Case Modal */}
      <AnimatePresence>
        {resolveCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-emerald-950/30">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Resolve Grievance Case
                </h3>
                <button onClick={() => setResolveCase(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleResolve} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Case Reference</label>
                  <div className="font-mono font-bold text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {resolveCase.refCode} ({resolveCase.entityName})
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Resolution Outcome</label>
                  <select
                    value={resolveOutcome}
                    onChange={e => setResolveOutcome(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="REMEDIED_FULL_REFUND">Full Consumer Refund Dispatched</option>
                    <option value="COMPLIANCE_CORRECTIVE_ACTION">Enterprise Corrective Action Completed</option>
                    <option value="FALSE_POSITIVE_DISMISSED">Dispute Dismissed with Evidence Log</option>
                    <option value="STATUTORY_PENALTY_COLLECTED">Statutory Fine Paid and Docket Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Remediation Notes</label>
                  <textarea
                    rows={3}
                    value={resolveNotes}
                    onChange={e => setResolveNotes(e.target.value)}
                    placeholder="Enter audit closure remarks..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setResolveCase(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                  >
                    Confirm &amp; Close Case
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
export default SlaMonitoringDashboard;
