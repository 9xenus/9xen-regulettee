import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, ShieldAlert, CheckCircle2, AlertTriangle, Clock,
  ExternalLink, X, ChevronRight, Sparkles, Zap, Radio, RefreshCw, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GrievanceNotificationService,
  GrievanceStatusChangeEvent
} from '../../services/grievanceNotificationService';
import { useNotification } from '../../context/NotificationContext';

interface GrievanceNotificationListenerProps {
  activeRefCode?: string | null;
  onSelectRefCode?: (refCode: string) => void;
  className?: string;
}

export const GrievanceNotificationListener: React.FC<GrievanceNotificationListenerProps> = ({
  activeRefCode,
  onSelectRefCode,
  className = ''
}) => {
  const { showToast } = useNotification();
  const [activePopupAlert, setActivePopupAlert] = useState<GrievanceStatusChangeEvent | null>(null);
  const [eventsList, setEventsList] = useState<GrievanceStatusChangeEvent[]>(() =>
    GrievanceNotificationService.getStoredEvents()
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Sound/Haptic feedback helper
  const triggerAudioFeedback = useCallback(() => {
    try {
      if ('navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {}
  }, []);

  // Subscribe to real-time status change events
  useEffect(() => {
    const unsubscribe = GrievanceNotificationService.subscribe((event) => {
      // Add or update in list
      setEventsList((prev) => {
        const filtered = prev.filter((e) => e.id !== event.id);
        return [event, ...filtered].slice(0, 30);
      });

      // Trigger floating popup alert banner
      setActivePopupAlert(event);
      triggerAudioFeedback();

      // Also trigger global toast notification
      const statusTitle = event.newStatus.replace(/_/g, ' ');
      showToast(
        `[${event.refCode}] ${statusTitle}: ${event.title}`,
        event.urgency === 'CRITICAL' ? 'warning' : event.urgency === 'SUCCESS' ? 'success' : 'info',
        'Regulatory Grievance Status Changed'
      );
    });

    return () => {
      unsubscribe();
    };
  }, [showToast, triggerAudioFeedback]);

  // If activeRefCode changes, register it for monitoring
  useEffect(() => {
    if (activeRefCode) {
      GrievanceNotificationService.registerMonitoredRef(activeRefCode);
    }
  }, [activeRefCode]);

  // Background polling for active monitored references
  useEffect(() => {
    const refs = GrievanceNotificationService.getMonitoredRefs();
    if (refs.length === 0) return;

    const interval = setInterval(async () => {
      for (const ref of refs.slice(0, 3)) {
        await GrievanceNotificationService.pollServerUpdates(ref);
      }
    }, 25000); // every 25s

    return () => clearInterval(interval);
  }, []);

  // Auto-dismiss floating popup banner after 9 seconds
  useEffect(() => {
    if (!activePopupAlert) return;
    const timer = setTimeout(() => {
      setActivePopupAlert(null);
    }, 9000);
    return () => clearTimeout(timer);
  }, [activePopupAlert]);

  // Manual Trigger Simulation
  const handleSimulate = (stepIndex?: number) => {
    setIsSimulating(true);
    setTimeout(() => {
      const target = activeRefCode || undefined;
      const evt = GrievanceNotificationService.simulateDashboardStatusChange(target, stepIndex);
      setIsSimulating(false);
    }, 300);
  };

  // Manual Sync
  const handleManualSync = async () => {
    const refs = GrievanceNotificationService.getMonitoredRefs();
    if (refs.length === 0) {
      showToast('No active grievance references registered to sync.', 'info');
      return;
    }
    setIsPolling(true);
    let updated = false;
    for (const ref of refs.slice(0, 3)) {
      const result = await GrievanceNotificationService.pollServerUpdates(ref);
      if (result) updated = true;
    }
    setIsPolling(false);
    if (!updated) {
      showToast('All monitored grievances are up to date with the regulatory registry.', 'success');
    }
  };

  const unreadCount = eventsList.filter((e) => !e.read).length;

  const getStatusBadge = (status: GrievanceStatusChangeEvent['newStatus']) => {
    switch (status) {
      case 'RESOLVED':
        return {
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          label: 'RESOLVED & REMEDIATED',
          icon: CheckCircle2
        };
      case 'REGULATORY_ESCALATION':
        return {
          bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse',
          label: 'STATUTORY ESCALATION',
          icon: ShieldAlert
        };
      case 'UNDER_INVESTIGATION':
        return {
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          label: 'UNDER INVESTIGATION',
          icon: Clock
        };
      case 'ENTITY_CURE_PERIOD':
        return {
          bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          label: 'CURE NOTICE SERVED',
          icon: AlertTriangle
        };
      case 'TRIAGED':
      default:
        return {
          bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
          label: 'AI TRIAGED & VERIFIED',
          icon: Radio
        };
    }
  };

  return (
    <>
      {/* 1. Header Notification Bell Button */}
      <div className={`relative inline-block ${className}`}>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="relative p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Live Grievance Status Updates"
        >
          <Bell className="w-4 h-4 text-indigo-500" />
          <span className="hidden md:inline text-[11px]">Grievance Updates</span>
          {unreadCount > 0 && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Floating Live Push Notification Alert Banner */}
      <AnimatePresence>
        {activePopupAlert && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-5 right-5 z-[9999] max-w-md w-[calc(100vw-2.5rem)] bg-slate-950/95 text-white border-2 border-indigo-500/80 rounded-2xl shadow-2xl backdrop-blur-xl p-4 overflow-hidden"
          >
            {/* Top Accent Glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 animate-pulse" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
                  Real-time Dashboard Status Alert
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePopupAlert(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black text-white bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-700/50">
                  {activePopupAlert.refCode}
                </span>
                {(() => {
                  const badge = getStatusBadge(activePopupAlert.newStatus);
                  const Icon = badge.icon;
                  return (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${badge.bg}`}>
                      <Icon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  );
                })()}
              </div>

              <h4 className="text-sm font-bold text-slate-100 leading-snug">
                {activePopupAlert.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activePopupAlert.message}
              </p>

              {activePopupAlert.officerName && (
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 pt-1">
                  <span className="text-slate-500">Ombudsman Officer:</span>
                  <span className="text-indigo-300 font-semibold">{activePopupAlert.officerName}</span>
                </div>
              )}

              {activePopupAlert.docketRef && (
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                  <span className="text-slate-500">Statutory Docket:</span>
                  <span className="text-emerald-400 font-bold">{activePopupAlert.docketRef}</span>
                </div>
              )}
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-500">
                {new Date(activePopupAlert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectRefCode) onSelectRefCode(activePopupAlert.refCode);
                    setIsDrawerOpen(true);
                    setActivePopupAlert(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer"
                >
                  <span>View Timeline</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Sliding Live Grievance Status Drawer / Modal */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[9990] flex justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Grievance Status Feed
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Real-time statutory timeline updates
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isPolling}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    title="Poll server for updates"
                  >
                    <RefreshCw className={`w-4 h-4 ${isPolling ? 'animate-spin text-indigo-500' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Simulation Quick Bar */}
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Live Dashboard Trigger Simulation
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                    Cross-tab Broadcast
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSimulate(1)}
                    disabled={isSimulating}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Clock className="w-3 h-3" />
                    Simulate: Investigation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulate(2)}
                    disabled={isSimulating}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    Simulate: Escalation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulate(3)}
                    disabled={isSimulating}
                    className="col-span-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Simulate: Regulatory Remediation & Resolution
                  </button>
                </div>
              </div>

              {/* Event Feed Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {eventsList.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                      <Radio className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      No status updates received yet. Submit an incident report or click above to simulate real-time dashboard progress.
                    </p>
                  </div>
                ) : (
                  eventsList.map((evt) => {
                    const badge = getStatusBadge(evt.newStatus);
                    const Icon = badge.icon;
                    return (
                      <div
                        key={evt.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          evt.urgency === 'CRITICAL'
                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                            : evt.urgency === 'SUCCESS'
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            {evt.refCode}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border flex items-center gap-1 ${badge.bg}`}>
                            <Icon className="w-2.5 h-2.5" />
                            {badge.label}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                          {evt.title}
                        </h5>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          {evt.message}
                        </p>

                        <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{evt.officerName || 'Ombudsman Officer'}</span>
                          <span>{new Date(evt.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    GrievanceNotificationService.markAllAsRead();
                    setEventsList((prev) => prev.map((e) => ({ ...e, read: true })));
                  }}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
