import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Server, CheckCircle, X, Volume2, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SystemStatusBanner: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [gracePeriod, setGracePeriod] = useState(5); // in minutes
  const [announcement, setAnnouncement] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [urgentNoticeIndex, setUrgentNoticeIndex] = useState(0);

  const urgentNotices = [
    {
      id: 'notice-1',
      title: 'PQC Cryptographic Warning',
      message: 'Quantum Risk Analyzer detected legacy RSA-2048 keys in use. Post-Quantum Cryptography migration is highly recommended.',
      severity: 'warning'
    },
    {
      id: 'notice-2',
      title: 'EDPB Regulatory Update',
      message: 'EDPB has released fresh directives on AI shadow systems. Your local AI Ethics & Liability Ledger has been updated accordingly.',
      severity: 'info'
    },
    {
      id: 'notice-3',
      title: 'EU-Sovereign Enclave Status',
      message: 'All 5 geo-isolated data residency vaults are fully synchronized. Zero compliance drift detected.',
      severity: 'success'
    }
  ];

  const checkAndApplyScheduledMaintenance = () => {
    const schedulesRaw = localStorage.getItem('platform_maintenance_schedules');
    if (!schedulesRaw) return;
    
    try {
      const schedules = JSON.parse(schedulesRaw);
      const now = Date.now();
      let anyActive = false;
      let activeSchedule: any = null;
      let updatedSchedules = false;

      const newSchedules = schedules.map((sch: any) => {
        if (sch.status === 'CANCELLED') return sch;

        const startMs = new Date(sch.startTime).getTime();
        const endMs = startMs + sch.durationMinutes * 60 * 1000;

        if (now >= startMs && now <= endMs) {
          if (sch.status === 'SCHEDULED') {
            sch.status = 'ACTIVE';
            updatedSchedules = true;
          }
          anyActive = true;
          activeSchedule = sch;
        } else if (now > endMs) {
          if (sch.status === 'ACTIVE' || sch.status === 'SCHEDULED') {
            sch.status = 'COMPLETED';
            updatedSchedules = true;
          }
        }
        return sch;
      });

      if (updatedSchedules) {
        localStorage.setItem('platform_maintenance_schedules', JSON.stringify(newSchedules));
      }

      const currentMaintenanceActive = localStorage.getItem('platform_maintenance_active') === 'true';

      if (anyActive && activeSchedule) {
        if (!currentMaintenanceActive) {
          localStorage.setItem('platform_maintenance_active', 'true');
          localStorage.setItem('platform_maintenance_grace', String(activeSchedule.gracePeriod));
          localStorage.setItem('platform_maintenance_announcement', `AUTO-SCHEDULED: ${activeSchedule.title} - ${activeSchedule.description}`);
          localStorage.setItem('platform_maintenance_timestamp', String(new Date(activeSchedule.startTime).getTime()));
          
          window.dispatchEvent(new CustomEvent('platform-maintenance-updated', {
            detail: {
              active: true,
              gracePeriod: String(activeSchedule.gracePeriod),
              announcementText: `AUTO-SCHEDULED: ${activeSchedule.title} - ${activeSchedule.description}`
            }
          }));
        }
      } else {
        const currentAnnouncement = localStorage.getItem('platform_maintenance_announcement') || '';
        if (currentMaintenanceActive && currentAnnouncement.startsWith('AUTO-SCHEDULED:')) {
          localStorage.setItem('platform_maintenance_active', 'false');
          localStorage.removeItem('platform_maintenance_timestamp');
          
          window.dispatchEvent(new CustomEvent('platform-maintenance-updated', {
            detail: {
              active: false,
              gracePeriod: '5',
              announcementText: ''
            }
          }));
        }
      }
    } catch (e) {
      console.error('Error parsing or checking schedules:', e);
    }
  };

  const updateStateFromStorage = () => {
    checkAndApplyScheduledMaintenance();
    
    // Check Global SaaS Config (Maintenance mode & Emergency Kill Switch)
    let globalActive = false;
    let globalMsg = 'Nonaxen is conducting schedule upgrade operations. Secure data enclaves will be temporarily locked.';
    try {
      const globalConfigRaw = localStorage.getItem('9xen-regulettee_global_saas_config');
      if (globalConfigRaw) {
        const parsed = JSON.parse(globalConfigRaw);
        if (parsed.maintenanceMode || parsed.emergencyKillSwitchActive) {
          globalActive = true;
          globalMsg = parsed.maintenanceMessage || globalMsg;
        }
      }
    } catch (e) {
      console.error('Failed to parse global saas config', e);
    }

    const scheduledActive = localStorage.getItem('platform_maintenance_active') === 'true';
    const active = globalActive || scheduledActive;
    
    const savedGrace = parseInt(localStorage.getItem('platform_maintenance_grace') || '5', 10);
    const savedAnnouncement = globalActive ? globalMsg : (localStorage.getItem('platform_maintenance_announcement') || globalMsg);
    
    setIsActive(active);
    setGracePeriod(savedGrace);
    setAnnouncement(savedAnnouncement);

    if (active) {
      const activationTimestamp = parseInt(localStorage.getItem('platform_maintenance_timestamp') || '0', 10);
      if (activationTimestamp > 0) {
        const targetTime = activationTimestamp + savedGrace * 60 * 1000;
        const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
        setTimeRemaining(remaining);
      } else {
        setTimeRemaining(savedGrace * 60);
      }
    } else {
      setTimeRemaining(null);
    }
  };

  useEffect(() => {
    updateStateFromStorage();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { active, gracePeriod: eventGrace, announcementText } = customEvent.detail;
        setIsActive(active);
        const parsedGrace = parseInt(eventGrace || '5', 10);
        setGracePeriod(parsedGrace);
        setAnnouncement(announcementText || '');
        
        if (active) {
          const activationTimestamp = parseInt(localStorage.getItem('platform_maintenance_timestamp') || String(Date.now()), 10);
          const targetTime = activationTimestamp + parsedGrace * 60 * 1000;
          const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
          setTimeRemaining(remaining);
        } else {
          setTimeRemaining(null);
        }
      } else {
        updateStateFromStorage();
      }
    };

    window.addEventListener('platform-maintenance-updated', handleUpdate);

    // Dynamic scheduler interval ticker - runs every 5 seconds
    const scheduleInterval = setInterval(() => {
      updateStateFromStorage();
    }, 5000);

    return () => {
      window.removeEventListener('platform-maintenance-updated', handleUpdate);
      clearInterval(scheduleInterval);
    };
  }, []);

  // Timer interval for real-time countdown ticking
  useEffect(() => {
    if (!isActive || timeRemaining === null) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  if (isDismissed) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render maintenance active state (amber / dark high contrast)
  if (isActive) {
    const isLockdown = timeRemaining !== null && timeRemaining <= 0;
    return (
      <div 
        id="persistent-maintenance-banner"
        className="w-full bg-[#0F172A] border-b border-amber-500/30 text-white relative overflow-hidden shadow-md"
      >
        {/* Dynamic decorative warning indicator line at top */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 animate-pulse w-full" />
        
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-2 rounded-xl flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-amber-400">
                  {isLockdown ? 'SECURITY OVERRIDE LOCKDOWN ACTIVE' : 'SYSTEM MAINTENANCE WARNING'}
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  Zone: EU-CENTRAL-1
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5 leading-relaxed">
                {announcement}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            {timeRemaining !== null && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-mono shadow-inner min-w-[150px] justify-center">
                <Clock className="w-4 h-4 text-amber-500 animate-spin-slow" />
                <span className="text-slate-400 mr-1">LOCKDOWN:</span>
                <span className="font-bold text-amber-400">
                  {isLockdown ? 'ACTIVE' : formatTime(timeRemaining)}
                </span>
              </div>
            )}
            
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer hover:bg-slate-800"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render alternate operational/urgent platform notification banner
  const currentNotice = urgentNotices[urgentNoticeIndex];

  return (
    <AnimatePresence>
      {!isCollapsed ? (
        <motion.div
          id="persistent-status-banner animate-fade-in"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="w-full bg-slate-900 border-b border-slate-800 text-white relative overflow-hidden"
        >
          {/* Subtle status ambient background glow */}
          <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 text-xs font-medium">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="font-extrabold uppercase tracking-widest text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20">
                  <Server className="w-3 h-3" />
                  Systems Operational
                </span>
                
                <span className="text-slate-500">•</span>
                
                <div className="flex items-center gap-1.5 text-slate-300 truncate">
                  <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-bold text-slate-400">{currentNotice.title}:</span>
                  <span className="truncate text-slate-300 font-medium">{currentNotice.message}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Rotate notification messages */}
              <button
                onClick={() => setUrgentNoticeIndex(prev => (prev + 1) % urgentNotices.length)}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer border border-slate-700/50"
              >
                Next Notice
              </button>

              <button
                onClick={() => setIsCollapsed(true)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer hover:bg-slate-800"
                title="Collapse status bar"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="w-full bg-slate-900 border-b border-slate-800 text-slate-400 px-4 py-1 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>CORE CLUSTER: SECURE & COMPLIANT</span>
          </div>
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-[10px] hover:text-white flex items-center gap-1 cursor-pointer"
          >
            Show Announcements <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      )}
    </AnimatePresence>
  );
};
