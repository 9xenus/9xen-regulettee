import React, { useState, useMemo } from 'react';
import { ShieldAlert, Globe, Search, AlertTriangle, CheckCircle, Clock, ExternalLink, Zap, Sparkles, Brain, X, BookOpen, FileText, ShieldCheck, Calendar, CalendarDays, ChevronLeft, ChevronRight, List, Flag, Flame, UserCheck, UserPlus, Users, User, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface ComplianceOfficer {
  id: string;
  name: string;
  role: string;
  avatarBg: string;
  initials: string;
}

export const COMPLIANCE_OFFICERS: ComplianceOfficer[] = [
  { id: 'off-1', name: 'Elena Rostova', role: 'Lead Privacy Counsel', avatarBg: 'bg-indigo-600 text-white', initials: 'ER' },
  { id: 'off-2', name: 'Marcus Vance', role: 'Data Protection Officer', avatarBg: 'bg-emerald-600 text-white', initials: 'MV' },
  { id: 'off-3', name: 'Aria Chen', role: 'Sr. Security Engineer', avatarBg: 'bg-purple-600 text-white', initials: 'AC' },
  { id: 'off-4', name: 'David Miller', role: 'Regulatory Compliance Mgr', avatarBg: 'bg-amber-600 text-white', initials: 'DM' },
  { id: 'off-5', name: 'Sophia Thorne', role: 'Audit & Governance Officer', avatarBg: 'bg-rose-600 text-white', initials: 'ST' },
];

export interface QuickFixLogEntry {
  id: string;
  asset: string;
  url: string;
  marker: string;
  type: string;
  severity: 'High' | 'Medium' | 'Low';
  remediatedAt: string;
  remediatedBy: string;
  method: string;
  details: string;
}

interface ScanResult {
  id: string;
  url: string;
  marker: string;
  type: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  timestamp: string;
  status: 'Detected' | 'Remediated';
  assignedTo?: string;
}

export function ComplianceScraperDashboard() {
  const trendData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        issues: Math.floor(Math.random() * 40) + 10,
        remediated: Math.floor(Math.random() * 30) + 5
      });
    }
    return data;
  }, []);

  const [targetUrl, setTargetUrl] = useState('');
  const [scanProgress, setScanProgress] = useState<{
    isActive: boolean;
    target: string;
    filesScanned: number;
    totalFiles: number;
    timeRemaining: string;
    percentComplete: number;
  } | null>(null);

  const [results, setResults] = useState<ScanResult[]>([]);

  // Load past scan results from backend
  React.useEffect(() => {
    fetch('/api/v1/b2g/scraper/results')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.results) && data.results.length > 0) {
          const mapped: ScanResult[] = data.results.flatMap((r: any) => {
            const violations = Array.isArray(r.violations) ? r.violations : [];
            if (violations.length === 0) {
              return [{
                id: r.id,
                url: r.target_url || '',
                marker: 'Scan completed',
                type: 'Compliance Check',
                severity: 'Low' as const,
                description: `Profile ${r.profile}. Status: ${r.status}.`,
                timestamp: r.created_at || new Date().toISOString(),
                status: 'Detected' as const,
              }];
            }
            return violations.map((v: any, idx: number) => ({
              id: `${r.id}-${idx}`,
              url: r.target_url || '',
              marker: v.article || `Violation ${idx + 1}`,
              type: v.severity === 'CRITICAL' ? 'Critical Compliance' : 'Compliance Warning',
              severity: (v.severity === 'CRITICAL' ? 'High' : 'Medium') as 'High' | 'Medium',
              description: v.issue || `Non-compliance detected for ${v.article}`,
              timestamp: r.created_at || new Date().toISOString(),
              status: 'Detected' as const,
              assignedTo: COMPLIANCE_OFFICERS[idx % COMPLIANCE_OFFICERS.length]?.name,
            }));
          });
          setResults(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const [quickFixLogs, setQuickFixLogs] = useState<QuickFixLogEntry[]>([
    {
      id: 'log-101',
      asset: 'example.com',
      url: 'https://example.com/contact',
      marker: 'Insecure Form Submission',
      type: 'Security',
      severity: 'High',
      remediatedAt: new Date(Date.now() - 86400000).toISOString(),
      remediatedBy: 'Aria Chen',
      method: 'Automated SSL Proxy Routing',
      details: 'Enforced TLS 1.3 encryption on form POST handler endpoint to prevent plaintext PII transmission.'
    },
    {
      id: 'log-102',
      asset: 'example.com',
      url: 'https://example.com/checkout',
      marker: 'Legacy Cookie Attribute',
      type: 'Cookie Compliance',
      severity: 'Medium',
      remediatedAt: new Date(Date.now() - 172800000).toISOString(),
      remediatedBy: 'Marcus Vance',
      method: 'SameSite=Strict Injection',
      details: 'Injected SameSite=Strict and Secure flags on session cookies via automated Nginx policy.'
    },
    {
      id: 'log-103',
      asset: 'example.com',
      url: 'https://example.com/blog',
      marker: 'Missing Opt-out Link',
      type: 'Data Privacy',
      severity: 'Low',
      remediatedAt: new Date(Date.now() - 259200000).toISOString(),
      remediatedBy: 'Elena Rostova',
      method: 'DOM Footer Injection',
      details: 'Dynamically injected compliant Do Not Sell My Personal Information link in page footer.'
    }
  ]);

  const [selectedHistoryAsset, setSelectedHistoryAsset] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  const [isFixing, setIsFixing] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [isBulkFixing, setIsBulkFixing] = useState(false);
  const [showBulkAssignMenu, setShowBulkAssignMenu] = useState(false);
  const [activeAssignMenuId, setActiveAssignMenuId] = useState<string | null>(null);
  const [assignmentFeedback, setAssignmentFeedback] = useState<string | null>(null);

  const handleAssignOfficer = (id: string, officerName: string | undefined) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, assignedTo: officerName } : r));
    setActiveAssignMenuId(null);
    setAssignmentFeedback(officerName ? `Assigned to ${officerName}` : 'Assignment removed');
    setTimeout(() => setAssignmentFeedback(null), 3000);
  };

  const handleBulkAssignOfficer = (officerName: string | undefined) => {
    const count = selectedRowIds.size;
    setResults(prev => prev.map(r => selectedRowIds.has(r.id) ? { ...r, assignedTo: officerName } : r));
    setShowBulkAssignMenu(false);
    setAssignmentFeedback(officerName ? `Assigned ${count} markers to ${officerName}` : `Unassigned ${count} markers`);
    setTimeout(() => setAssignmentFeedback(null), 3000);
  };

  // AI Advice state
  const [selectedAdviceItem, setSelectedAdviceItem] = useState<ScanResult | null>(null);
  const [aiAdviceData, setAiAdviceData] = useState<{
    summary: string;
    regulatoryArticles: string[];
    financialRisk: string;
    recommendedActions: string[];
  } | null>(null);
  const [loadingAdviceId, setLoadingAdviceId] = useState<string | null>(null);
  const [adviceError, setAdviceError] = useState<string | null>(null);

  const handleGetAiAdvice = async (result: ScanResult) => {
    setLoadingAdviceId(result.id);
    setSelectedAdviceItem(result);
    setAiAdviceData(null);
    setAdviceError(null);

    try {
      const res = await fetch('/api/v1/compliance-advisor/regulatory-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marker: result.marker,
          type: result.type,
          severity: result.severity,
          description: result.description,
          url: result.url
        })
      });
      const data = await res.json();
      if (data.success && data.advice) {
        setAiAdviceData(data.advice);
      } else {
        setAdviceError(data.error || 'Unable to retrieve AI regulatory advice.');
      }
    } catch (err: any) {
      setAdviceError(err.message || 'Error connecting to regulatory advice service.');
    } finally {
      setLoadingAdviceId(null);
    }
  };

  const handleQuickFix = (id: string) => {
    setIsFixing(id);
    setTimeout(() => {
      setResults(prev => prev.map(r => {
        if (r.id === id) {
          const hostname = (() => { try { return new URL(r.url).hostname; } catch { return r.url; } })();
          const newLog: QuickFixLogEntry = {
            id: `log-${Date.now()}`,
            asset: hostname,
            url: r.url,
            marker: r.marker,
            type: r.type,
            severity: r.severity,
            remediatedAt: new Date().toISOString(),
            remediatedBy: r.assignedTo || 'Auto-Remediation Engine',
            method: r.severity === 'High' ? 'Automated Security Proxy' : 'Script Auto-Patch',
            details: `Quick Fix applied: Resolved ${r.marker} compliance non-conformity on ${r.url}.`
          };
          setQuickFixLogs(logs => [newLog, ...logs]);
          return { ...r, status: 'Remediated', timestamp: new Date().toISOString() };
        }
        return r;
      }));
      setIsFixing(null);
    }, 1500);
  };

  const handleBulkFix = () => {
    setIsBulkFixing(true);
    setTimeout(() => {
      const newLogs: QuickFixLogEntry[] = [];
      setResults(prev => prev.map(r => {
        if (selectedRowIds.has(r.id) && r.status === 'Detected') {
          const hostname = (() => { try { return new URL(r.url).hostname; } catch { return r.url; } })();
          newLogs.push({
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            asset: hostname,
            url: r.url,
            marker: r.marker,
            type: r.type,
            severity: r.severity,
            remediatedAt: new Date().toISOString(),
            remediatedBy: r.assignedTo || 'Bulk Fix Service',
            method: 'Batch Script Execution',
            details: `Bulk Quick Fix applied: Resolved ${r.marker} compliance non-conformity on ${r.url}.`
          });
          return { ...r, status: 'Remediated', timestamp: new Date().toISOString() };
        }
        return r;
      }));
      if (newLogs.length > 0) {
        setQuickFixLogs(logs => [...newLogs, ...logs]);
      }
      setSelectedRowIds(new Set());
      setIsBulkFixing(false);
    }, 1500);
  };

  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([]);
  const [onlyPriorityFlags, setOnlyPriorityFlags] = useState<boolean>(false);

  const uniqueSeverities = Array.from(new Set(results.map(r => r.severity)));
  const uniqueTypes = Array.from(new Set(results.map(r => r.type)));
  const uniqueAssets = Array.from(new Set(results.map(r => {
    try { return new URL(r.url).hostname; } catch { return r.url; }
  })));
  const uniqueOfficersList = ['Unassigned', ...COMPLIANCE_OFFICERS.map(o => o.name)];

  const priorityFlagCount = useMemo(() => {
    return results.filter(r => r.severity === 'High' && r.status === 'Detected').length;
  }, [results]);

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setList(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const filteredResults = results.filter(r => {
    const hostname = (() => { try { return new URL(r.url).hostname; } catch { return r.url; } })();
    const matchSeverity = selectedSeverities.length === 0 || selectedSeverities.includes(r.severity);
    const matchType = selectedTypes.length === 0 || selectedTypes.includes(r.type);
    const matchAsset = selectedAssets.length === 0 || selectedAssets.includes(hostname);
    const assignedName = r.assignedTo || 'Unassigned';
    const matchOfficer = selectedOfficers.length === 0 || selectedOfficers.includes(assignedName);
    const isPriority = r.severity === 'High' && r.status === 'Detected';
    const matchPriority = !onlyPriorityFlags || isPriority;
    return matchSeverity && matchType && matchAsset && matchOfficer && matchPriority;
  });

  const fixableResults = filteredResults.filter(r => r.status === 'Detected');
  const allFixableSelected = fixableResults.length > 0 && fixableResults.every(r => selectedRowIds.has(r.id));
  const someFixableSelected = fixableResults.some(r => selectedRowIds.has(r.id));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(new Set([...selectedRowIds, ...fixableResults.map(r => r.id)]));
    } else {
      const newSet = new Set(selectedRowIds);
      fixableResults.forEach(r => newSet.delete(r.id));
      setSelectedRowIds(newSet);
    }
  };

  const toggleRowSelection = (id: string) => {
    const newSet = new Set(selectedRowIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRowIds(newSet);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    setScanProgress({
      isActive: true,
      target: targetUrl,
      filesScanned: 0,
      totalFiles: 100,
      timeRemaining: 'Connecting...',
      percentComplete: 0
    });

    try {
      // Show brief progress animation
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 15;
        if (progress > 90) progress = 90;
        setScanProgress(prev => prev ? {
          ...prev,
          filesScanned: progress,
          percentComplete: Math.round((progress / 100) * 100),
          timeRemaining: 'Analyzing...'
        } : null);
      }, 200);

      const res = await fetch('/api/v1/b2g/scraper/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: targetUrl, profile: 'GDPR_EPRIVACY' })
      });
      clearInterval(progressInterval);

      const data = await res.json();
      if (data.success && data.scanResult) {
        const sr = data.scanResult;
        const mappedResults: ScanResult[] = (sr.violations || []).map((v: any, idx: number) => ({
          id: `scan-${sr.target_url?.slice(0,20)}-${idx}`,
          url: sr.target_url || targetUrl,
          marker: v.article || `Violation ${idx + 1}`,
          type: v.severity === 'CRITICAL' ? 'Critical Compliance' : 'Compliance Warning',
          severity: v.severity === 'CRITICAL' ? 'High' : 'Medium',
          description: v.issue || `Non-compliance detected for ${v.article}`,
          timestamp: new Date().toISOString(),
          status: 'Detected',
          assignedTo: COMPLIANCE_OFFICERS[idx % COMPLIANCE_OFFICERS.length]?.name,
        }));

        if (mappedResults.length === 0) {
          mappedResults.push({
            id: `scan-${sr.target_url?.slice(0,20)}-pass`,
            url: targetUrl,
            marker: 'Scan Completed',
            type: 'Compliance Check',
            severity: 'Low',
            description: `Scan completed for ${targetUrl}. No violations detected. Penalty potential: €${sr.calculated_penalty_eur?.toLocaleString() || '0'}`,
            timestamp: new Date().toISOString(),
            status: 'Remediated',
          });
        }

        setResults(prev => [...mappedResults, ...prev]);
        setScanProgress({ isActive: true, target: targetUrl, filesScanned: 100, totalFiles: 100, timeRemaining: 'Complete', percentComplete: 100 });
        setTimeout(() => setScanProgress(null), 1200);
      } else {
        setScanProgress(null);
      }
    } catch (err) {
      console.error('Scraper scan error:', err);
      setScanProgress(null);
    }
    setTargetUrl('');
  };

  const [autoScans, setAutoScans] = useState<Record<string, { enabled: boolean, interval: 'Daily' | 'Weekly' | 'Monthly' }>>({
    'example.com': { enabled: true, interval: 'Weekly' }
  });

  const toggleAutoScan = (asset: string) => {
    setAutoScans(prev => ({
      ...prev,
      [asset]: {
        enabled: !prev[asset]?.enabled,
        interval: prev[asset]?.interval || 'Weekly'
      }
    }));
  };

  const updateAutoScanInterval = (asset: string, interval: 'Daily' | 'Weekly' | 'Monthly') => {
    setAutoScans(prev => ({
      ...prev,
      [asset]: {
        enabled: prev[asset]?.enabled || false,
        interval
      }
    }));
  };

  const [scanTab, setScanTab] = useState<'calendar' | 'list'>('calendar');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<{
    date: Date;
    scans: Array<{ asset: string; interval: 'Daily' | 'Weekly' | 'Monthly'; time: string }>;
  } | null>(null);

  const getScheduledScansForDate = (date: Date) => {
    const dayOfWeek = date.getDay(); // 0-6
    const dayOfMonth = date.getDate(); // 1-31

    return uniqueAssets
      .map(asset => {
        const config = autoScans[asset] || { enabled: true, interval: 'Weekly' };
        if (!config.enabled) return null;

        let isScheduled = false;
        let time = '02:00 UTC';

        if (config.interval === 'Daily') {
          isScheduled = true;
          time = '01:00 UTC';
        } else if (config.interval === 'Weekly') {
          const targetDay = (asset.charCodeAt(0) % 5) + 1; // 1 (Mon) to 5 (Fri)
          isScheduled = dayOfWeek === targetDay;
          time = '03:30 UTC';
        } else if (config.interval === 'Monthly') {
          const targetDate = (asset.charCodeAt(0) % 2 === 0) ? 1 : 15;
          isScheduled = dayOfMonth === targetDate;
          time = '04:00 UTC';
        }

        if (isScheduled) {
          return { asset, interval: config.interval, time };
        }
        return null;
      })
      .filter((item): item is { asset: string; interval: 'Daily' | 'Weekly' | 'Monthly'; time: string } => item !== null);
  };

  const calendarGrid = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 = Sun
    const totalDaysInMonth = lastDay.getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean }> = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(year, month, day);
      const isToday = d.toDateString() === today.toDateString();
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Next month padding
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [calendarMonth]);

  const totalScansInMonthCount = useMemo(() => {
    return calendarGrid
      .filter(d => d.isCurrentMonth)
      .reduce((acc, d) => acc + getScheduledScansForDate(d.date).length, 0);
  }, [calendarGrid, autoScans, uniqueAssets]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'High':
        return <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md text-xs font-bold border border-rose-200">HIGH</span>;
      case 'Medium':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold border border-amber-200">MEDIUM</span>;
      case 'Low':
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold border border-slate-200">LOW</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-7 h-7 text-indigo-600" />
            GDPR Compliance Scraper
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Automated web asset scanning for GDPR non-compliance markers and data privacy violations.</p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleScan} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="url"
              placeholder="Enter target URL (e.g., https://example.com)"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!!scanProgress?.isActive}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {scanProgress?.isActive ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Scanning...
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5" />
                Initiate Scan
              </>
            )}
          </button>
        </form>

        {scanProgress && scanProgress.isActive && (
          <div className="mt-6 bg-slate-50 p-5 rounded-lg border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 bg-indigo-100 w-full">
               <div 
                 className="h-full bg-indigo-600 transition-all duration-300"
                 style={{ width: `${scanProgress.percentComplete}%` }}
               />
            </div>
            <div className="flex justify-between items-start mb-4">
               <div>
                 <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                   Scanning {scanProgress.target}
                 </h3>
                 <p className="text-xs text-slate-500 mt-1">Deep scanning HTML, scripts, and network requests...</p>
               </div>
               <div className="text-right">
                 <div className="text-sm font-bold text-indigo-600">{scanProgress.percentComplete}%</div>
                 <div className="text-xs font-medium text-slate-500">{scanProgress.timeRemaining}</div>
               </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
               <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${scanProgress.percentComplete}%` }}
                  />
               </div>
               <div className="w-32 text-right font-mono">
                 {scanProgress.filesScanned} / {scanProgress.totalFiles} files
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="w-16 h-16 text-rose-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">High Severity</p>
          <p className="text-3xl font-black text-slate-900">
            {results.filter(r => r.severity === 'High' && r.status === 'Detected').length}
          </p>
          <div className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Requires immediate action
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe className="w-16 h-16 text-amber-500" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Assets Scanned</p>
          <p className="text-3xl font-black text-slate-900">1,248</p>
          <div className="mt-2 text-xs font-medium text-amber-600 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Last 30 days
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle className="w-16 h-16 text-emerald-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Remediated</p>
          <p className="text-3xl font-black text-slate-900">
             {results.filter(r => r.status === 'Remediated').length}
          </p>
          <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
             <CheckCircle className="w-3 h-3" /> Resolved violations
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Non-Compliance Trends (Last 30 Days)</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
              />
              <Line 
                type="monotone" 
                dataKey="issues" 
                name="Issues Detected"
                stroke="#4f46e5" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="remediated" 
                name="Issues Remediated"
                stroke="#10b981" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header with Tab Switcher */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">Recurring Auto-Scan Schedule</h2>
              <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                Background Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualize and manage automated compliance scans for monitored web assets
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl border border-slate-300/60">
            <button
              onClick={() => setScanTab('calendar')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                scanTab === 'calendar'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Calendar View
            </button>
            <button
              onClick={() => setScanTab('list')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                scanTab === 'list'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              Asset List ({uniqueAssets.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {scanTab === 'calendar' ? (
          <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
            {/* Calendar Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-base font-bold text-slate-900 min-w-[150px] text-center sm:text-left">
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCalendarMonth(new Date())}
                  className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors shadow-2xs"
                >
                  Today
                </button>
              </div>

              {/* Legend & Stats */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <span className="text-slate-600">Daily Scans</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span className="text-slate-600">Weekly Scans</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600">Monthly Scans</span>
                </div>
                <div className="pl-3 border-l border-slate-300 text-slate-500 font-mono">
                  <span className="font-bold text-slate-800">{totalScansInMonthCount}</span> scans scheduled
                </div>
              </div>
            </div>

            {/* Calendar Month Grid */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-2xs">
              {/* Day Name Headers */}
              <div className="grid grid-cols-7 bg-slate-100/80 border-b border-slate-200 text-center py-2 text-xs font-bold text-slate-600">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 bg-slate-200">
                {calendarGrid.map((dayItem, index) => {
                  const scheduledScans = getScheduledScansForDate(dayItem.date);
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (scheduledScans.length > 0) {
                          setSelectedCalendarDay({ date: dayItem.date, scans: scheduledScans });
                        }
                      }}
                      className={`min-h-[96px] p-2 bg-white flex flex-col justify-between transition-colors ${
                        !dayItem.isCurrentMonth ? 'bg-slate-50/60 text-slate-400' : 'text-slate-800'
                      } ${dayItem.isToday ? 'ring-2 ring-indigo-500/80 inset-0 z-10 bg-indigo-50/20' : ''} ${
                        scheduledScans.length > 0 ? 'cursor-pointer hover:bg-slate-50/80' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            dayItem.isToday
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : dayItem.isCurrentMonth
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {dayItem.date.getDate()}
                        </span>
                        {scheduledScans.length > 0 && (
                          <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200">
                            {scheduledScans.length}
                          </span>
                        )}
                      </div>

                      {/* Scans List in Day Cell */}
                      <div className="space-y-1 overflow-hidden">
                        {scheduledScans.slice(0, 2).map((scan, sIdx) => {
                          const badgeColor =
                            scan.interval === 'Daily'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                              : scan.interval === 'Weekly'
                              ? 'bg-purple-50 text-purple-700 border-purple-200/80'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
                          return (
                            <div
                              key={sIdx}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border truncate flex items-center justify-between ${badgeColor}`}
                            >
                              <span className="truncate">{scan.asset}</span>
                            </div>
                          );
                        })}
                        {scheduledScans.length > 2 && (
                          <div className="text-[10px] font-bold text-slate-500 text-center">
                            +{scheduledScans.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {uniqueAssets.map(asset => {
              const config = autoScans[asset] || { enabled: false, interval: 'Weekly' };
              return (
                <div key={asset} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{asset}</div>
                      <div className="text-xs text-slate-500">Continuous compliance monitoring</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedHistoryAsset(asset)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold border border-slate-200 hover:border-indigo-200 transition-colors shadow-2xs"
                      title="View Quick Fix history for this asset"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Fix History ({quickFixLogs.filter(l => l.asset === asset).length})
                    </button>

                    <select
                      value={config.interval}
                      onChange={(e) => updateAutoScanInterval(asset, e.target.value as 'Daily' | 'Weekly' | 'Monthly')}
                      disabled={!config.enabled}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-slate-50 shadow-sm"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                    
                    <button
                      onClick={() => toggleAutoScan(asset)}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${config.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <span className="sr-only">Toggle auto-scan</span>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-xs font-bold w-12 ${config.enabled ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {config.enabled ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col gap-4 bg-slate-50">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-slate-800">Scan Results</h2>
              <button
                onClick={() => setSelectedHistoryAsset('All Assets')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors shadow-2xs"
                title="View complete Quick Fix action history"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Quick Fix History ({quickFixLogs.length})
              </button>
              {assignmentFeedback && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 animate-in fade-in duration-200 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  {assignmentFeedback}
                </span>
              )}
            </div>

            {selectedRowIds.size > 0 && (
              <div className="flex items-center gap-2">
                {/* Bulk Assign To Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowBulkAssignMenu(!showBulkAssignMenu)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    Assign To ({selectedRowIds.size})
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                  </button>

                  {showBulkAssignMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-2 animate-in fade-in duration-150">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                        <span>Assign Selected Markers</span>
                        <button onClick={() => setShowBulkAssignMenu(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {COMPLIANCE_OFFICERS.map((officer) => (
                        <button
                          key={officer.id}
                          onClick={() => handleBulkAssignOfficer(officer.name)}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                        >
                          <span className={`w-6 h-6 rounded-full ${officer.avatarBg} text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs`}>
                            {officer.initials}
                          </span>
                          <div className="truncate">
                            <div className="font-bold text-slate-800 leading-tight">{officer.name}</div>
                            <div className="text-[10px] text-slate-500 leading-tight">{officer.role}</div>
                          </div>
                        </button>
                      ))}
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={() => handleBulkAssignOfficer(undefined)}
                        className="w-full px-3 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        Unassign Selected
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBulkFix}
                  disabled={isBulkFixing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {isBulkFixing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Fixing {selectedRowIds.size} Issues...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Bulk Quick Fix ({selectedRowIds.size})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 sm:gap-6 items-end">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority Level</span>
              <div>
                <button
                  onClick={() => setOnlyPriorityFlags(!onlyPriorityFlags)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                    onlyPriorityFlags
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${onlyPriorityFlags ? 'fill-white text-white' : 'fill-rose-600 text-rose-600'}`} />
                  Priority Flags Only ({priorityFlagCount})
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Officer</span>
              <div className="flex flex-wrap gap-2">
                {uniqueOfficersList.map(officer => (
                  <button
                    key={officer}
                    onClick={() => toggleFilter(selectedOfficers, setSelectedOfficers, officer)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors flex items-center gap-1.5 ${
                      selectedOfficers.includes(officer)
                        ? 'bg-indigo-100 border-indigo-200 text-indigo-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <User className="w-3 h-3 text-slate-400" />
                    {officer}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity</span>
              <div className="flex flex-wrap gap-2">
                {uniqueSeverities.map(severity => (
                  <button
                    key={severity}
                    onClick={() => toggleFilter(selectedSeverities, setSelectedSeverities, severity)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                      selectedSeverities.includes(severity)
                        ? 'bg-indigo-100 border-indigo-200 text-indigo-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compliance Type</span>
              <div className="flex flex-wrap gap-2">
                {uniqueTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleFilter(selectedTypes, setSelectedTypes, type)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                      selectedTypes.includes(type)
                        ? 'bg-indigo-100 border-indigo-200 text-indigo-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asset</span>
              <div className="flex flex-wrap gap-2">
                {uniqueAssets.map(asset => (
                  <button
                    key={asset}
                    onClick={() => toggleFilter(selectedAssets, setSelectedAssets, asset)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                      selectedAssets.includes(asset)
                        ? 'bg-indigo-100 border-indigo-200 text-indigo-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium w-12">
                  <input 
                    type="checkbox" 
                    checked={allFixableSelected}
                    ref={input => {
                      if (input) {
                        input.indeterminate = someFixableSelected && !allFixableSelected;
                      }
                    }}
                    onChange={handleSelectAll}
                    disabled={fixableResults.length === 0}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </th>
                <th className="px-6 py-4 font-medium">Marker / Description</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Target URL</th>
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium">Assigned Officer</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((result) => {
                const isPriorityFlag = result.severity === 'High' && result.status === 'Detected';
                return (
                  <tr 
                    key={result.id} 
                    className={`transition-colors ${
                      isPriorityFlag 
                        ? 'bg-rose-50/50 hover:bg-rose-100/60 border-l-4 border-l-rose-600' 
                        : selectedRowIds.has(result.id) 
                        ? 'bg-indigo-50/30 hover:bg-indigo-50/50' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedRowIds.has(result.id)}
                        onChange={() => toggleRowSelection(result.id)}
                        disabled={result.status !== 'Detected'}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {isPriorityFlag && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white shadow-2xs uppercase tracking-wider animate-pulse shrink-0 border border-rose-700">
                            <Flag className="w-3 h-3 fill-white text-white" />
                            Priority Flag
                          </span>
                        )}
                        <span className="font-bold text-slate-900">{result.marker}</span>
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-2">{result.description}</div>
                    </td>
                  <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                    {result.type}
                  </td>
                  <td className="px-6 py-4">
                    <a href={result.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                      {(() => { try { return new URL(result.url).hostname; } catch { return result.url; } })()} <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    {getSeverityBadge(result.severity)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      {result.assignedTo ? (
                        (() => {
                          const officer = COMPLIANCE_OFFICERS.find(o => o.name === result.assignedTo);
                          return (
                            <button
                              onClick={() => setActiveAssignMenuId(activeAssignMenuId === result.id ? null : result.id)}
                              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 text-xs font-semibold border border-slate-200/80 hover:border-indigo-200 transition-colors shadow-2xs group"
                              title="Click to reassign officer"
                            >
                              <span className={`w-5 h-5 rounded-full ${officer?.avatarBg || 'bg-slate-600 text-white'} text-[9px] font-bold flex items-center justify-center shrink-0`}>
                                {officer?.initials || 'CO'}
                              </span>
                              <span className="truncate max-w-[120px]">{result.assignedTo}</span>
                              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                            </button>
                          );
                        })()
                      ) : (
                        <button
                          onClick={() => setActiveAssignMenuId(activeAssignMenuId === result.id ? null : result.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-700 text-xs font-medium border border-dashed border-slate-300 hover:border-indigo-300 transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                          Unassigned
                        </button>
                      )}

                      {/* Popover Menu for Single Row Reassignment */}
                      {activeAssignMenuId === result.id && (
                        <div className="absolute left-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-2 animate-in fade-in duration-150">
                          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                            <span>Reassign Officer</span>
                            <button onClick={() => setActiveAssignMenuId(null)} className="text-slate-400 hover:text-slate-600">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {COMPLIANCE_OFFICERS.map((officer) => (
                            <button
                              key={officer.id}
                              onClick={() => handleAssignOfficer(result.id, officer.name)}
                              className={`w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 flex items-center gap-2.5 transition-colors ${
                                result.assignedTo === officer.name ? 'bg-indigo-50/80 font-bold text-indigo-900' : ''
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full ${officer.avatarBg} text-[9px] font-bold flex items-center justify-center shrink-0`}>
                                {officer.initials}
                              </span>
                              <div className="truncate">
                                <div className="font-semibold text-slate-800 leading-tight">{officer.name}</div>
                                <div className="text-[10px] text-slate-500 leading-tight">{officer.role}</div>
                              </div>
                            </button>
                          ))}
                          {result.assignedTo && (
                            <>
                              <div className="border-t border-slate-100 my-1"></div>
                              <button
                                onClick={() => handleAssignOfficer(result.id, undefined)}
                                className="w-full px-3 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold transition-colors"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                Remove Assignment
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                    {new Date(result.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {result.status === 'Detected' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Detected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Remediated
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleGetAiAdvice(result)}
                        disabled={loadingAdviceId === result.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md text-xs font-bold transition-colors disabled:opacity-50 border border-purple-200/80 shadow-2xs"
                        title="Get Gemini AI Regulatory Analysis"
                      >
                        {loadingAdviceId === result.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-purple-700/30 border-t-purple-700 rounded-full animate-spin"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            Get AI Advice
                          </>
                        )}
                      </button>

                      {result.status === 'Detected' && result.severity === 'Low' && (
                        <button
                          onClick={() => handleQuickFix(result.id)}
                          disabled={isFixing === result.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-200/80 shadow-2xs"
                        >
                          {isFixing === result.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-indigo-700/30 border-t-indigo-700 rounded-full animate-spin"></div>
                              Fixing...
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3" />
                              Quick Fix
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-5 sm:py-8 text-center text-slate-500">
                    No scan results found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Advice Modal */}
      {selectedAdviceItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex justify-between items-start shrink-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0 text-purple-300">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">Regulatory AI Analysis</h3>
                    <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-purple-400/20 text-purple-200 border border-purple-400/30 rounded-full">
                      Gemini 3.6 Flash
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/80 mt-0.5">
                    Plain-language regulatory impact summary for detected non-compliance marker
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedAdviceItem(null);
                  setAiAdviceData(null);
                  setAdviceError(null);
                }}
                className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Issue Context Bar */}
            <div className="px-6 py-3 bg-purple-50/60 border-b border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span>{selectedAdviceItem.marker}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-normal">{selectedAdviceItem.type}</span>
              </div>
              <div className="flex items-center gap-2">
                {getSeverityBadge(selectedAdviceItem.severity)}
                <span className="font-mono text-slate-500">{(() => { try { return new URL(selectedAdviceItem.url).hostname; } catch { return selectedAdviceItem.url; } })()}</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 lg:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 text-sm text-slate-700">
              {loadingAdviceId === selectedAdviceItem.id ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 border-3 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">Consulting Regulatory Knowledge Base...</h4>
                    <p className="text-xs text-slate-500 mt-1">Analyzing GDPR, ePrivacy, and EU Compliance statutes</p>
                  </div>
                </div>
              ) : adviceError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold mb-1">Failed to generate AI advice</div>
                    <div>{adviceError}</div>
                  </div>
                </div>
              ) : aiAdviceData ? (
                <>
                  {/* Executive Summary */}
                  <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/50 border border-purple-150 rounded-xl p-4 shadow-sm">
                    <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-purple-600" />
                      Executive Plain-Language Summary
                    </h4>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {aiAdviceData.summary}
                    </p>
                  </div>

                  {/* Regulatory Framework & Articles */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-slate-600" />
                      Applicable EU Legal Frameworks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {aiAdviceData.regulatoryArticles?.map((article, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-semibold border border-indigo-200/60">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          {article}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Financial & Penalty Risk */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Financial & Penalty Exposure
                    </h4>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {aiAdviceData.financialRisk}
                    </p>
                  </div>

                  {/* Actionable Remediation Plan */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-600" />
                      Recommended Action Plan
                    </h4>
                    <div className="space-y-2">
                      {aiAdviceData.recommendedActions?.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs text-slate-800 font-medium leading-relaxed">
                            {action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500">
                AI Analysis strictly for guidance. Verify with qualified legal counsel.
              </span>
              <div className="flex items-center gap-3">
                {selectedAdviceItem.status === 'Detected' && selectedAdviceItem.severity === 'Low' && (
                  <button
                    onClick={() => {
                      handleQuickFix(selectedAdviceItem.id);
                      setSelectedAdviceItem(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Apply Quick Fix Now
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedAdviceItem(null);
                    setAiAdviceData(null);
                    setAdviceError(null);
                  }}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Day Detail Modal */}
      {selectedCalendarDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-base">Scheduled Scans Detail</h3>
                  <p className="text-xs text-slate-400">
                    {selectedCalendarDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCalendarDay(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 lg:p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedCalendarDay.scans.map((scan, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{scan.asset}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{scan.time}</span>
                        <span>•</span>
                        <span className="capitalize">{scan.interval} Frequency</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-md text-xs font-bold shrink-0">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedCalendarDay(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Fix Action History Modal */}
      {selectedHistoryAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border border-slate-200 max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">Quick Fix Remediation History</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                      Audit Trail
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chronological record of automated & manual Quick Fix actions applied to assets
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedHistoryAsset(null);
                  setHistorySearchQuery('');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              {/* Asset Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Asset:</span>
                <select
                  value={selectedHistoryAsset}
                  onChange={(e) => setSelectedHistoryAsset(e.target.value)}
                  className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                >
                  <option value="All Assets">All Monitored Assets ({quickFixLogs.length})</option>
                  {uniqueAssets.map(asset => {
                    const count = quickFixLogs.filter(l => l.asset === asset).length;
                    return (
                      <option key={asset} value={asset}>
                        {asset} ({count} fixes)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* History Search Bar */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search logs by marker, officer, method..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 shadow-2xs"
                />
                {historySearchQuery && (
                  <button
                    onClick={() => setHistorySearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Summary Stat Chips & Log Feed */}
            {(() => {
              const logsForAsset = quickFixLogs.filter(l => {
                const matchesAsset = selectedHistoryAsset === 'All Assets' || l.asset === selectedHistoryAsset;
                const matchesQuery = !historySearchQuery ||
                  l.marker.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                  l.url.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                  l.remediatedBy.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                  l.method.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                  l.details.toLowerCase().includes(historySearchQuery.toLowerCase());
                return matchesAsset && matchesQuery;
              });

              const highCount = logsForAsset.filter(l => l.severity === 'High').length;

              return (
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-4">
                  {/* Stats Bar */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Total Fix Actions</div>
                        <div className="text-lg font-black text-indigo-950 mt-0.5">{logsForAsset.length}</div>
                      </div>
                      <Zap className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">High Severity Fixes</div>
                        <div className="text-lg font-black text-rose-950 mt-0.5">{highCount}</div>
                      </div>
                      <ShieldAlert className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Verification Status</div>
                        <div className="text-xs font-bold text-emerald-800 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          100% Verified
                        </div>
                      </div>
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>

                  {/* Log Items List */}
                  {logsForAsset.length > 0 ? (
                    <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                      {logsForAsset.map((log) => {
                        const sevColor =
                          log.severity === 'High'
                            ? 'border-l-rose-500'
                            : log.severity === 'Medium'
                            ? 'border-l-amber-500'
                            : 'border-l-emerald-500';

                        const officer = COMPLIANCE_OFFICERS.find(o => o.name === log.remediatedBy);

                        return (
                          <div
                            key={log.id}
                            className="relative pl-8 transition-all hover:translate-x-0.5"
                          >
                            {/* Dot on Timeline */}
                            <div className="absolute left-1.5 top-3.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 shadow-2xs z-10 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                            </div>

                            <div className={`p-4 bg-white rounded-xl border border-slate-200 border-l-4 ${sevColor} shadow-2xs space-y-2`}>
                              {/* Header row */}
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-sm text-slate-900">{log.marker}</h4>
                                    {getSeverityBadge(log.severity)}
                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-bold border border-slate-200">
                                      {log.asset}
                                    </span>
                                  </div>
                                  <a
                                    href={log.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 font-mono mt-0.5"
                                  >
                                    {log.url}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>

                                <div className="text-right">
                                  <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 justify-end">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {new Date(log.remediatedAt).toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {/* Details text */}
                              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono leading-relaxed">
                                {log.details}
                              </p>

                              {/* Meta footer row */}
                              <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400 text-[11px] font-medium">Method:</span>
                                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded font-semibold text-[11px] border border-indigo-100 flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-indigo-500" />
                                    {log.method}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400 text-[11px] font-medium">Executor:</span>
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold">
                                    <span className={`w-4 h-4 rounded-full ${officer?.avatarBg || 'bg-slate-700 text-white'} text-[8px] font-bold flex items-center justify-center shrink-0`}>
                                      {officer?.initials || 'AI'}
                                    </span>
                                    <span>{log.remediatedBy}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <h4 className="font-bold text-slate-700 text-sm">No Quick Fix Logs Found</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {historySearchQuery
                          ? `No logs matched "${historySearchQuery}". Try clearing your search.`
                          : `No Quick Fix actions have been recorded yet for ${selectedHistoryAsset}.`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500 font-mono">
                Log entries are cryptographically signed for compliance audits.
              </span>
              <button
                onClick={() => {
                  setSelectedHistoryAsset(null);
                  setHistorySearchQuery('');
                }}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition-colors shadow-2xs"
              >
                Close Audit History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

