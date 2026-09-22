import React, { useState, useEffect, useMemo } from 'react';
import {
  Filter, Calendar, Search, RefreshCw, CheckCircle2, Clock, ShieldAlert,
  ChevronDown, ChevronUp, X, MapPin, FileText, Share2, Tag, ArrowUpDown,
  ExternalLink, Zap, AlertCircle, Info, Radio, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GrievanceNotificationService, GrievanceStatusChangeEvent } from '../../services/grievanceNotificationService';
import { RealtimeTrackingStatus } from '../dashboard/RealtimeTrackingStatus';

export interface SubmittedGrievanceItem {
  id: string;
  refCode: string;
  target: string;
  category: string;
  amountRange?: string;
  description: string;
  submittedAt: string; // ISO date string
  status: 'Submitted' | 'Investigating' | 'Resolved';
  location?: {
    district: string;
    areaName?: string;
    lat?: number;
    lng?: number;
  };
  lastUpdated?: string;
  officerName?: string;
  docketRef?: string;
  timeline?: Array<{
    status: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
}

export const STORAGE_KEY_MY_GRIEVANCES = 'trust_check_submitted_grievances';

export const INITIAL_SAMPLE_GRIEVANCES: SubmittedGrievanceItem[] = [
  {
    id: 'grv_sample_1',
    refCode: 'GRV-BD-2026-98214',
    target: '01712-883920 (Fake bKash Agent)',
    category: 'Fake MFS Cash-Back / OTP Call',
    amountRange: '৳1,000 - ৳5,000',
    description: 'Fraudulent caller impersonated bKash helpline offering ৳2,500 cash-back reward and requested OTP code verification.',
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    status: 'Submitted',
    location: { district: 'Dhaka', areaName: 'Gulshan 2', lat: 23.7925, lng: 90.4078 },
    lastUpdated: new Date(Date.now() - 3600000 * 4).toISOString(),
    timeline: [
      {
        status: 'Submitted',
        title: 'Report Registered in Sovereign Queue',
        description: 'Grievance received and assigned high-priority triage token.',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ]
  },
  {
    id: 'grv_sample_2',
    refCode: 'GRV-BD-2026-87102',
    target: '01822-994102 (Nagad Account Block Threat)',
    category: 'Fake MFS Cash-Back / OTP Call',
    amountRange: '৳5,000 - ৳25,000',
    description: 'SMS alert warning wallet suspension due to NID verification error with phishing link collecting MFS credentials.',
    submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    status: 'Investigating',
    officerName: 'Fatima Rahman (Senior Ombudsman)',
    docketRef: 'BTRC-DOC-882194',
    location: { district: 'Chittagong', areaName: 'Agrabad', lat: 22.3384, lng: 91.8317 },
    lastUpdated: new Date(Date.now() - 86400000 * 1).toISOString(),
    timeline: [
      {
        status: 'Submitted',
        title: 'Report Logged',
        description: 'Citizen report logged into regulatory database.',
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        status: 'Investigating',
        title: 'Assigned to Ombudsman Inspector',
        description: 'Assigned to BTRC / DNCRP Consumer Wing officer for evidence collection.',
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ]
  },
  {
    id: 'grv_sample_3',
    refCode: 'GRV-BD-2026-74291',
    target: 'http://e-valy-discount-offer.xyz',
    category: 'Fake E-commerce Store / Facebook Page',
    amountRange: '৳25,000 - ৳100,000',
    description: 'Fake online shopping portal promising 70% discount on smartphones. Payment collected via personal bKash account without dispatch.',
    submittedAt: new Date(Date.now() - 86400000 * 12).toISOString(), // 12 days ago
    status: 'Resolved',
    officerName: 'Marcus Sterling (Enforcement Wing)',
    docketRef: 'COMPLIANCE-RESOLVED-992181',
    location: { district: 'Sylhet', areaName: 'Zindabazar', lat: 24.8949, lng: 91.8687 },
    lastUpdated: new Date(Date.now() - 86400000 * 5).toISOString(),
    timeline: [
      {
        status: 'Submitted',
        title: 'Report Filed',
        description: 'Fraud report received.',
        timestamp: new Date(Date.now() - 86400000 * 12).toISOString()
      },
      {
        status: 'Investigating',
        title: 'Formal Notice Served',
        description: 'Cure notice served to domain registrar and merchant gateway.',
        timestamp: new Date(Date.now() - 86400000 * 8).toISOString()
      },
      {
        status: 'Resolved',
        title: 'Domain Takedown & Consumer Remediation',
        description: 'Phishing domain seized and merchant wallet frozen by regulatory order.',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ]
  },
  {
    id: 'grv_sample_4',
    refCode: 'GRV-BD-2026-61039',
    target: 'Steadfast Delivery SMS (01911-002211)',
    category: 'Courier Delivery Fee Scam',
    amountRange: '৳100 - ৳500',
    description: 'SMS claiming parcel delivery failed and demanding ৳150 re-delivery fee payment via suspicious gateway.',
    submittedAt: new Date(Date.now() - 86400000 * 25).toISOString(), // 25 days ago
    status: 'Resolved',
    officerName: 'Tanvir Hossain (Cyber Forensics)',
    docketRef: 'COMPLIANCE-RESOLVED-442109',
    location: { district: 'Rajshahi', areaName: 'Boalia', lat: 24.3745, lng: 88.6042 },
    lastUpdated: new Date(Date.now() - 86400000 * 20).toISOString(),
    timeline: [
      {
        status: 'Submitted',
        title: 'Report Logged',
        description: 'Report filed into courier scam cluster.',
        timestamp: new Date(Date.now() - 86400000 * 25).toISOString()
      },
      {
        status: 'Resolved',
        title: 'Number Blocked Across Telecom Operators',
        description: 'SMS shortcode blacklisted across BTRC network registry.',
        timestamp: new Date(Date.now() - 86400000 * 20).toISOString()
      }
    ]
  },
  {
    id: 'grv_sample_5',
    refCode: 'GRV-BD-2026-55820',
    target: '01688-331199 (WhatsApp Task Scam)',
    category: 'Online Job / Task Investment Scam',
    amountRange: '৳5,000 - ৳25,000',
    description: 'Unsolicited WhatsApp message promising daily income for liking videos after depositing initial security deposit.',
    submittedAt: new Date(Date.now() - 86400000 * 45).toISOString(), // 45 days ago
    status: 'Investigating',
    officerName: 'Fatima Rahman (Senior Ombudsman)',
    docketRef: 'BTRC-DOC-102941',
    location: { district: 'Khulna', areaName: 'Sonadanga', lat: 22.8456, lng: 89.5403 },
    lastUpdated: new Date(Date.now() - 86400000 * 30).toISOString(),
    timeline: [
      {
        status: 'Submitted',
        title: 'Report Logged',
        description: 'WhatsApp job scam report recorded.',
        timestamp: new Date(Date.now() - 86400000 * 45).toISOString()
      },
      {
        status: 'Investigating',
        title: 'MFS Account Trace Active',
        description: 'MFS deposit accounts forwarded to Financial Intelligence Unit.',
        timestamp: new Date(Date.now() - 86400000 * 30).toISOString()
      }
    ]
  }
];

export function getStoredGrievances(): SubmittedGrievanceItem[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_GRIEVANCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MY_GRIEVANCES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MY_GRIEVANCES, JSON.stringify(INITIAL_SAMPLE_GRIEVANCES));
      return INITIAL_SAMPLE_GRIEVANCES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SAMPLE_GRIEVANCES;
  } catch {
    return INITIAL_SAMPLE_GRIEVANCES;
  }
}

export function saveSubmittedGrievance(item: SubmittedGrievanceItem): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredGrievances();
    const filtered = existing.filter(g => g.id !== item.id && g.refCode !== item.refCode);
    const updated = [item, ...filtered];
    localStorage.setItem(STORAGE_KEY_MY_GRIEVANCES, JSON.stringify(updated));
    // Dispatch custom event for immediate UI update
    window.dispatchEvent(new CustomEvent('trustcheck_grievance_saved', { detail: item }));
  } catch (e) {
    console.warn('Failed to save grievance:', e);
  }
}

type StatusFilterType = 'ALL' | 'Submitted' | 'Investigating' | 'Resolved';
type DatePresetType = 'ALL' | '7_DAYS' | '30_DAYS' | '90_DAYS' | 'CUSTOM';

interface GrievanceReportHistoryViewProps {
  locale?: 'en' | 'bn';
  onFileNewReport?: () => void;
  onSelectGrievanceRef?: (refCode: string) => void;
  className?: string;
}

export const GrievanceReportHistoryView: React.FC<GrievanceReportHistoryViewProps> = ({
  locale = 'en',
  onFileNewReport,
  onSelectGrievanceRef,
  className = ''
}) => {
  const [grievances, setGrievances] = useState<SubmittedGrievanceItem[]>(() => getStoredGrievances());
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterType>('ALL');
  const [datePreset, setDatePreset] = useState<DatePresetType>('ALL');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'status'>('newest');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Reload grievances on storage or custom event
  const refreshGrievances = () => {
    setGrievances(getStoredGrievances());
  };

  useEffect(() => {
    refreshGrievances();

    const handleSavedEvent = () => refreshGrievances();
    window.addEventListener('trustcheck_grievance_saved', handleSavedEvent);
    window.addEventListener('storage', handleSavedEvent);

    // Also listen to real-time status updates broadcasted by GrievanceNotificationService
    const unsubscribe = GrievanceNotificationService.subscribe((evt: GrievanceStatusChangeEvent) => {
      setGrievances((prev) => {
        let matched = false;
        const updatedList = prev.map((item) => {
          if (item.refCode === evt.refCode) {
            matched = true;
            let mappedStatus: 'Submitted' | 'Investigating' | 'Resolved' = item.status;
            if (evt.newStatus === 'RESOLVED' || evt.newStatus === 'ACTION_TAKEN') {
              mappedStatus = 'Resolved';
            } else if (evt.newStatus === 'UNDER_INVESTIGATION' || evt.newStatus === 'REGULATORY_ESCALATION' || evt.newStatus === 'ENTITY_CURE_PERIOD') {
              mappedStatus = 'Investigating';
            } else if (evt.newStatus === 'SUBMITTED' || evt.newStatus === 'TRIAGED') {
              mappedStatus = 'Submitted';
            }

            const newTimeline = item.timeline ? [...item.timeline] : [];
            newTimeline.push({
              status: mappedStatus,
              title: evt.title,
              description: evt.message,
              timestamp: evt.timestamp
            });

            return {
              ...item,
              status: mappedStatus,
              officerName: evt.officerName || item.officerName,
              docketRef: evt.docketRef || item.docketRef,
              lastUpdated: evt.timestamp,
              timeline: newTimeline
            };
          }
          return item;
        });

        if (matched) {
          localStorage.setItem(STORAGE_KEY_MY_GRIEVANCES, JSON.stringify(updatedList));
        }
        return updatedList;
      });
    });

    return () => {
      window.removeEventListener('trustcheck_grievance_saved', handleSavedEvent);
      window.removeEventListener('storage', handleSavedEvent);
      unsubscribe();
    };
  }, []);

  // Compute available unique categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    grievances.forEach((g) => {
      if (g.category) set.add(g.category);
    });
    return Array.from(set);
  }, [grievances]);

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts = { Submitted: 0, Investigating: 0, Resolved: 0, Total: grievances.length };
    grievances.forEach((g) => {
      if (g.status === 'Submitted') counts.Submitted++;
      else if (g.status === 'Investigating') counts.Investigating++;
      else if (g.status === 'Resolved') counts.Resolved++;
    });
    return counts;
  }, [grievances]);

  // Main Filtering Logic
  const filteredGrievances = useMemo(() => {
    return grievances.filter((item) => {
      // 1. Status Filter
      if (selectedStatus !== 'ALL') {
        if (item.status !== selectedStatus) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategoryFilter !== 'ALL') {
        if (item.category !== selectedCategoryFilter) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const refMatch = item.refCode.toLowerCase().includes(q);
        const targetMatch = item.target.toLowerCase().includes(q);
        const catMatch = item.category.toLowerCase().includes(q);
        const descMatch = item.description.toLowerCase().includes(q);
        const districtMatch = item.location?.district.toLowerCase().includes(q);
        if (!refMatch && !targetMatch && !catMatch && !descMatch && !districtMatch) {
          return false;
        }
      }

      // 4. Date Range Filter
      const itemDate = new Date(item.submittedAt).getTime();
      const now = Date.now();

      if (datePreset === '7_DAYS') {
        const sevenDaysAgo = now - 7 * 86400000;
        if (itemDate < sevenDaysAgo) return false;
      } else if (datePreset === '30_DAYS') {
        const thirtyDaysAgo = now - 30 * 86400000;
        if (itemDate < thirtyDaysAgo) return false;
      } else if (datePreset === '90_DAYS') {
        const ninetyDaysAgo = now - 90 * 86400000;
        if (itemDate < ninetyDaysAgo) return false;
      } else if (datePreset === 'CUSTOM') {
        if (customStartDate) {
          const startMs = new Date(customStartDate).setHours(0, 0, 0, 0);
          if (itemDate < startMs) return false;
        }
        if (customEndDate) {
          const endMs = new Date(customEndDate).setHours(23, 59, 59, 999);
          if (itemDate > endMs) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      } else {
        return a.status.localeCompare(b.status);
      }
    });
  }, [
    grievances,
    selectedStatus,
    selectedCategoryFilter,
    searchQuery,
    datePreset,
    customStartDate,
    customEndDate,
    sortBy
  ]);

  // Reset all filters helper
  const handleResetFilters = () => {
    setSelectedStatus('ALL');
    setDatePreset('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchQuery('');
    setSelectedCategoryFilter('ALL');
    setSortBy('newest');
  };

  const hasActiveFilters =
    selectedStatus !== 'ALL' ||
    datePreset !== 'ALL' ||
    customStartDate !== '' ||
    customEndDate !== '' ||
    searchQuery !== '' ||
    selectedCategoryFilter !== 'ALL';

  // Format Helper
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Status Styling Badge Helper
  const getStatusBadge = (status: 'Submitted' | 'Investigating' | 'Resolved') => {
    switch (status) {
      case 'Submitted':
        return {
          label: locale === 'bn' ? 'জমা নেওয়া হয়েছে' : 'Submitted',
          bg: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
          dot: 'bg-indigo-500',
          icon: Radio
        };
      case 'Investigating':
        return {
          label: locale === 'bn' ? 'তদন্তাধীন' : 'Investigating',
          bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500 animate-ping',
          icon: Clock
        };
      case 'Resolved':
        return {
          label: locale === 'bn' ? 'নিষ্পত্তি নিশ্চিত' : 'Resolved',
          bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500',
          icon: CheckCircle2
        };
    }
  };

  // Simulate status transition for testing/demonstration
  const handleSimulateStatus = (item: SubmittedGrievanceItem) => {
    const stages: Array<'Submitted' | 'Investigating' | 'Resolved'> = ['Submitted', 'Investigating', 'Resolved'];
    const currentIndex = stages.indexOf(item.status);
    const nextStatus = stages[(currentIndex + 1) % stages.length];

    let eventStatus: GrievanceStatusChangeEvent['newStatus'] = 'SUBMITTED';
    if (nextStatus === 'Investigating') eventStatus = 'UNDER_INVESTIGATION';
    if (nextStatus === 'Resolved') eventStatus = 'RESOLVED';

    GrievanceNotificationService.broadcastStatusChange({
      refCode: item.refCode,
      entityName: item.target,
      newStatus: eventStatus,
      title: `Grievance Status Transitioned to ${nextStatus}`,
      message: `Updated regulatory review status for ${item.refCode}. Case progress updated in sovereign registry.`,
      officerName: item.officerName || 'Fatima Rahman (Senior Ombudsman)',
      docketRef: item.docketRef || `BTRC-DOC-${Math.floor(100000 + Math.random() * 900000)}`,
      urgency: nextStatus === 'Resolved' ? 'SUCCESS' : nextStatus === 'Investigating' ? 'WARNING' : 'INFO'
    });
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* 1. Header Bar with Overview Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <FileText className="w-3 h-3 text-indigo-500" />
                <span>{locale === 'bn' ? 'সিটিজেন কমপ্লেন হিস্ট্রি' : 'Grievance Audit Trail'}</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {filteredGrievances.length} / {grievances.length} {locale === 'bn' ? 'অভিযোগ' : 'Records'}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {locale === 'bn' ? 'আমার দাখিলকৃত অভিযোগ হিস্ট্রি' : 'Submitted Grievances History'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              {locale === 'bn'
                ? 'আপনার দাখিলকৃত অভিযোগসমূহের বর্তমান স্ট্যাটাস, নিয়ন্ত্রক কার্যক্রম ও সময়ক্রম সরাসরি ট্র্যাক করুন।'
                : 'Filter and track your submitted citizen complaints by status (Submitted, Investigating, Resolved) and custom date ranges.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onFileNewReport && (
              <button
                type="button"
                onClick={onFileNewReport}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{locale === 'bn' ? 'নতুন অভিযোগ দাখিল' : 'File New Grievance'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Breakdown Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedStatus('ALL')}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedStatus === 'ALL'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
              {locale === 'bn' ? 'সর্বমোট অভিযোগ' : 'All Grievances'}
            </div>
            <div className="text-lg font-mono font-black mt-0.5">{statusCounts.Total}</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus('Submitted')}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedStatus === 'Submitted'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border-indigo-200/80 dark:border-indigo-900/60 hover:bg-indigo-100'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider flex items-center justify-between">
              <span>{locale === 'bn' ? 'জমা নেওয়া হয়েছে' : 'Submitted'}</span>
              <Radio className="w-3 h-3 text-indigo-400" />
            </div>
            <div className="text-lg font-mono font-black mt-0.5">{statusCounts.Submitted}</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus('Investigating')}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedStatus === 'Investigating'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200/80 dark:border-amber-900/60 hover:bg-amber-100'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider flex items-center justify-between">
              <span>{locale === 'bn' ? 'তদন্তাধীন' : 'Investigating'}</span>
              <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            </div>
            <div className="text-lg font-mono font-black mt-0.5">{statusCounts.Investigating}</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus('Resolved')}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedStatus === 'Resolved'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200/80 dark:border-emerald-900/60 hover:bg-emerald-100'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider flex items-center justify-between">
              <span>{locale === 'bn' ? 'নিষ্পত্তি প্রাপ্ত' : 'Resolved'}</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-lg font-mono font-black mt-0.5">{statusCounts.Resolved}</div>
          </button>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROL SYSTEM CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {locale === 'bn' ? 'ফিল্টার কন্ট্রোল প্যানেল' : 'Filter System Controls'}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset All Filters'}</span>
            </button>
          )}
        </div>

        {/* Filter Grid Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* A. Search Input (Span 4) */}
          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'bn' ? 'রেফারেন্স, মোবাইল বা ক্যাটাগরি দিয়ে খুঁজুন...' : 'Search by Ref Code, Target, Category...'}
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* B. Status Filter Dropdown (Span 3) */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as StatusFilterType)}
                className="w-full appearance-none px-3 py-2.5 pr-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">Status: {locale === 'bn' ? 'সকল স্ট্যাটাস (All)' : 'All Statuses'}</option>
                <option value="Submitted">Status: {locale === 'bn' ? 'জমা নেওয়া হয়েছে (Submitted)' : 'Submitted'}</option>
                <option value="Investigating">Status: {locale === 'bn' ? 'তদন্তাধীন (Investigating)' : 'Investigating'}</option>
                <option value="Resolved">Status: {locale === 'bn' ? 'নিষ্পত্তি প্রাপ্ত (Resolved)' : 'Resolved'}</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* C. Date Range Presets Dropdown (Span 3) */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value as DatePresetType)}
                className="w-full appearance-none px-3 py-2.5 pr-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">Date Range: {locale === 'bn' ? 'সকল সময় (All Time)' : 'All Time'}</option>
                <option value="7_DAYS">Date Range: {locale === 'bn' ? 'গত ৭ দিন (Last 7 Days)' : 'Last 7 Days'}</option>
                <option value="30_DAYS">Date Range: {locale === 'bn' ? 'গত ৩০ দিন (Last 30 Days)' : 'Last 30 Days'}</option>
                <option value="90_DAYS">Date Range: {locale === 'bn' ? 'গত ৯০ দিন (Last 90 Days)' : 'Last 90 Days'}</option>
                <option value="CUSTOM">Date Range: {locale === 'bn' ? 'কাস্টম ডেট রেঞ্জ (Custom Picker)' : 'Custom Date Picker...'}</option>
              </select>
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* D. Sort Dropdown (Span 2) */}
          <div className="md:col-span-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none px-3 py-2.5 pr-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="newest">Sort: {locale === 'bn' ? 'তারিখ: নতুন আগে' : 'Submission Date: Newest'}</option>
                <option value="oldest">Sort: {locale === 'bn' ? 'তারিখ: পুরাতন আগে' : 'Submission Date: Oldest'}</option>
                <option value="status">Sort: {locale === 'bn' ? 'স্ট্যাটাস অনুযায়ী' : 'By Status'}</option>
              </select>
              <ArrowUpDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Enhanced Custom Date Range Picker Component */}
        {datePreset === 'CUSTOM' && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            className="p-4 bg-gradient-to-r from-indigo-50/80 to-blue-50/60 dark:from-indigo-950/40 dark:to-slate-900/60 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 shadow-inner space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/40 pb-2">
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{locale === 'bn' ? 'রিপোর্ট দাখিলের নির্দিষ্ট তারিখ বাছাই করুন:' : 'Filter Reports by Submission Date Range:'}</span>
              </span>

              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const d7 = new Date(Date.now() - 7 * 86400000);
                    setCustomStartDate(d7.toISOString().split('T')[0]);
                    setCustomEndDate(today.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 cursor-pointer"
                >
                  7D
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const d30 = new Date(Date.now() - 30 * 86400000);
                    setCustomStartDate(d30.toISOString().split('T')[0]);
                    setCustomEndDate(today.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 cursor-pointer"
                >
                  30D
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const thisYear = new Date(today.getFullYear(), 0, 1);
                    setCustomStartDate(thisYear.toISOString().split('T')[0]);
                    setCustomEndDate(today.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 cursor-pointer"
                >
                  YTD
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1 flex items-center gap-1">
                  <span>{locale === 'bn' ? 'শুরুর তারিখ (From)' : 'Start Submission Date'}</span>
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              <div className="flex items-center justify-center text-slate-400 pt-5 px-1 font-bold">
                →
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1 flex items-center gap-1">
                  <span>{locale === 'bn' ? 'শেষের তারিখ (To)' : 'End Submission Date'}</span>
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              {(customStartDate || customEndDate) && (
                <div className="pt-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 hover:bg-rose-200 text-xs font-bold border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                  >
                    Clear Range
                  </button>
                </div>
              )}
            </div>

            {customStartDate && customEndDate && (
              <div className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl flex items-center justify-between">
                <span>
                  Filtering reports submitted between <strong>{customStartDate}</strong> and <strong>{customEndDate}</strong>
                </span>
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  ({filteredGrievances.length} matched)
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Category Pill Filters (Optional quick secondary filter) */}
        {categoriesList.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-xl font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryFilter === 'ALL'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-xl font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Active Filter Badges Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Filters:</span>

            {selectedStatus !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                Status: {selectedStatus}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStatus('ALL')} />
              </span>
            )}

            {datePreset !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                Date: {datePreset.replace('_', ' ')}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setDatePreset('ALL')} />
              </span>
            )}

            {(customStartDate || customEndDate) && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                Range: {customStartDate || 'Start'} → {customEndDate || 'End'}
                <X className="w-3 h-3 cursor-pointer" onClick={() => { setCustomStartDate(''); setCustomEndDate(''); }} />
              </span>
            )}

            {searchQuery && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                Query: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}

            {selectedCategoryFilter !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                Category: {selectedCategoryFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategoryFilter('ALL')} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. GRIEVANCE LIST CARDS */}
      <div className="space-y-3">
        {filteredGrievances.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {locale === 'bn' ? 'কোনো মানানসই অভিযোগ পাওয়া যায়নি' : 'No Submitted Grievances Match Filters'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {locale === 'bn'
                ? 'আপনার নির্বাচিত ফিল্টার বা অনুসন্ধান মানদণ্ড পরিবর্তন করুন।'
                : 'Try adjusting your status filter, date range presets, or search term.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-all cursor-pointer"
              >
                {locale === 'bn' ? 'সকল ফিল্টার রিসেট করুন' : 'Clear All Filters'}
              </button>
            )}
          </div>
        ) : (
          filteredGrievances.map((item) => {
            const isExpanded = expandedId === item.id;
            const badge = getStatusBadge(item.status);
            const StatusIcon = badge.icon;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-indigo-500 dark:border-indigo-500 shadow-lg'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                }`}
              >
                {/* Main Card Summary Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        {item.refCode}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <StatusIcon className="w-3 h-3" />
                        {badge.label}
                      </span>

                      {item.amountRange && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold">
                          {item.amountRange}
                        </span>
                      )}

                      {item.location && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-rose-500" />
                          <span>{item.location.district}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{item.target}</span>
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono flex-wrap">
                      <span>Cat: <strong className="text-slate-700 dark:text-slate-300 font-sans">{item.category}</strong></span>
                      <span>•</span>
                      <span>Filed: {formatDate(item.submittedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectGrievanceRef) onSelectGrievanceRef(item.refCode);
                        setExpandedId(isExpanded ? null : item.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <span>{locale === 'bn' ? 'ট্র্যাকিং বিশদ' : 'Track Status'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-5 bg-white dark:bg-slate-900"
                    >
                      {/* Description & Incident Details */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {locale === 'bn' ? 'ঘটনার সংক্ষিপ্ত বিবরণ' : 'Report Incident Narrative'}
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Official Ombudsman & Docket Metadata */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                          <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase">
                            Assigned Inspector / Officer
                          </span>
                          <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                            {item.officerName || 'Regulatory Ombudsman Triage Officer'}
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                            Statutory Docket Reference
                          </span>
                          <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                            {item.docketRef || `BTRC-QUEUED-${item.refCode}`}
                          </div>
                        </div>
                      </div>

                      {/* Real-time Tracking Component */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                            <span>{locale === 'bn' ? 'লাইভ টাইমলাইন স্ট্যাটাস' : 'Live Statutory Timeline'}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Ref: {item.refCode}
                          </span>
                        </div>

                        <RealtimeTrackingStatus referenceCode={item.refCode} />
                      </div>

                      {/* Interactive Controls & Developer Simulation Button */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleSimulateStatus(item)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1.5 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer"
                          title="Click to simulate transitioning status to next state for demonstration"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>{locale === 'bn' ? '⚡ স্ট্যাটাস আপডেট ডেমো সিমুলেশন' : '⚡ Simulate Status Transition'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedId(null)}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          {locale === 'bn' ? 'প্যানেল বন্ধ করুন' : 'Close Panel'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
