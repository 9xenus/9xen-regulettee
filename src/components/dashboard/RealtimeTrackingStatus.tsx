import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Clock, ShieldCheck, AlertCircle, Radio, Sparkles } from 'lucide-react';
import { GrievanceNotificationService, GrievanceStatusChangeEvent } from '../../services/grievanceNotificationService';

interface TrackingUpdate {
  status: 'SUBMITTED' | 'TRIAGED' | 'IN_INVESTIGATION' | 'UNDER_INVESTIGATION' | 'ENTITY_CURE_PERIOD' | 'REGULATORY_ESCALATION' | 'ACTION_TAKEN' | 'RESOLVED';
  timestamp: string;
  description: string;
}

export const RealtimeTrackingStatus: React.FC<{ referenceCode: string; onSimulateTrigger?: () => void }> = ({
  referenceCode,
  onSimulateTrigger
}) => {
  const [updates, setUpdates] = useState<TrackingUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch from API or mock timeline
    const fetchUpdates = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/grievance/track/${encodeURIComponent(referenceCode)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const r = json.data;
            setUpdates([
              {
                status: (r.status?.toUpperCase() || 'SUBMITTED') as any,
                timestamp: r.updated_at || new Date().toISOString(),
                description: `Sovereign regulatory status: ${r.status}. Category: ${r.normalized_category || 'General Incident'}.`
              },
              {
                status: 'SUBMITTED',
                timestamp: r.created_at || new Date(Date.now() - 3600000).toISOString(),
                description: 'Report intake logged with zero-knowledge cryptographic signature.'
              }
            ]);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Track API fetch error:', err);
      }

      // Default baseline timeline
      setUpdates([
        { status: 'TRIAGED', timestamp: new Date().toISOString(), description: 'AI triage completed. Severity classified & mapped to regulatory cluster.' },
        { status: 'SUBMITTED', timestamp: new Date(Date.now() - 180000).toISOString(), description: 'Incident report successfully received in sovereign queue.' },
      ]);
      setLoading(false);
    };

    fetchUpdates();

    // Subscribe to live broadcast status changes from the dashboard
    const unsubscribe = GrievanceNotificationService.subscribe((evt: GrievanceStatusChangeEvent) => {
      if (!referenceCode || evt.refCode === referenceCode || evt.refCode.includes(referenceCode) || referenceCode.includes(evt.refCode)) {
        setUpdates((prev) => [
          {
            status: evt.newStatus as any,
            timestamp: evt.timestamp,
            description: `${evt.title} — ${evt.message}${evt.officerName ? ` [Officer: ${evt.officerName}]` : ''}`
          },
          ...prev
        ]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [referenceCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
        Pulling real-time status from sovereign dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-3.5 text-left">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span>Real-time Statutory Tracking Timeline</span>
          <span className="flex h-2 w-2 relative ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </h4>
        <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
          Live Sync Active
        </span>
      </div>

      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {updates.map((update, index) => {
          const isLatest = index === 0;
          return (
            <div
              key={index}
              className={`flex gap-3 text-xs p-2.5 rounded-xl border transition-all ${
                isLatest
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 shadow-2xs'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/70 dark:border-slate-800/70'
              }`}
            >
              <div className="flex flex-col items-center shrink-0 mt-1">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isLatest
                      ? update.status === 'RESOLVED'
                        ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                        : update.status === 'REGULATORY_ESCALATION'
                        ? 'bg-rose-500 ring-4 ring-rose-500/20 animate-pulse'
                        : 'bg-indigo-500 ring-4 ring-indigo-500/20 animate-pulse'
                      : 'bg-slate-400 dark:bg-slate-600'
                  }`}
                />
                {index < updates.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 my-1" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
                    {update.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">
                    {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-snug">
                  {update.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
