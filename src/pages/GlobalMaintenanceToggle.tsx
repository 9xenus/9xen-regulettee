import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Settings, 
  Building2, 
  Megaphone, 
  Clock, 
  Terminal, 
  Power, 
  Server, 
  Database, 
  Network, 
  Check, 
  AlertTriangle, 
  FileSignature, 
  RefreshCw,
  Calendar,
  Trash2,
  Plus,
  Ban,
  CheckCircle2,
  Hourglass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';
import { MaintenancePreviewEmail } from '../components/maintenance/MaintenancePreviewEmail';

interface ServiceStatus {
  id: string;
  name: string;
  category: 'CORE' | 'API' | 'DATABASE' | 'PORTAL';
  status: 'ONLINE' | 'MAINTENANCE';
  activeConnections: number;
}

interface ScheduledMaintenance {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO or YYYY-MM-DDTHH:MM
  durationMinutes: number;
  gracePeriod: number;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export const GlobalMaintenanceToggle: React.FC = () => {
  const { showToast } = useNotification();
  
  // States
  const [globalMaintenance, setGlobalMaintenance] = useState(() => {
    return localStorage.getItem('platform_maintenance_active') === 'true';
  });
  const [gracePeriod, setGracePeriod] = useState(() => {
    return localStorage.getItem('platform_maintenance_grace') || '5';
  });
  const [announcementText, setAnnouncementText] = useState(() => {
    return localStorage.getItem('platform_maintenance_announcement') || 
      'Nonaxen is conducting schedule upgrade operations. Secure data enclaves will be temporarily locked.';
  });

  // Scheduler States
  const [schedules, setSchedules] = useState<ScheduledMaintenance[]>(() => {
    const raw = localStorage.getItem('platform_maintenance_schedules');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    // Pre-populate with beautiful sample schedules so that the page starts with high-fidelity realistic data
    const sampleSchedules: ScheduledMaintenance[] = [
      {
        id: 'sch-01',
        title: 'Sovereign Database Patching',
        description: 'Applying critical security patches and ledger synchronization protocols to the primary database cluster.',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // tomorrow
        durationMinutes: 45,
        gracePeriod: 15,
        status: 'SCHEDULED'
      },
      {
        id: 'sch-02',
        title: 'Emergency Enclave Hardening',
        description: 'Hardening isolated cryptographic enclaves against theoretical quantum key decryption attacks.',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16), // 2 hours from now
        durationMinutes: 30,
        gracePeriod: 5,
        status: 'SCHEDULED'
      }
    ];
    localStorage.setItem('platform_maintenance_schedules', JSON.stringify(sampleSchedules));
    return sampleSchedules;
  });

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newDuration, setNewDuration] = useState('30');
  const [newGrace, setNewGrace] = useState('5');

  const formatScheduleTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

  const getNextUpcomingSchedule = () => {
    const upcoming = schedules
      .filter(s => s.status === 'SCHEDULED')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return upcoming[0] || null;
  };

  const nextSch = getNextUpcomingSchedule();

  const [services, setServices] = useState<ServiceStatus[]>([
    { id: 'srv-01', name: 'Primary Sovereign Database Cluster', category: 'DATABASE', status: 'ONLINE', activeConnections: 12 },
    { id: 'srv-02', name: 'EU-CENTRAL-1 Gateway API Proxy', category: 'API', status: 'ONLINE', activeConnections: 45 },
    { id: 'srv-03', name: 'Client Onboarding Portal', category: 'PORTAL', status: 'ONLINE', activeConnections: 8 },
    { id: 'srv-04', name: 'DPO Ledger Blockchain Enclave', category: 'DATABASE', status: 'ONLINE', activeConnections: 3 },
    { id: 'srv-05', name: 'Identity & Access Proxy Hub', category: 'CORE', status: 'ONLINE', activeConnections: 24 },
  ]);

  // Sync services status on mount if maintenance is active
  useEffect(() => {
    if (globalMaintenance) {
      setServices(prev => prev.map(srv => ({
        ...srv,
        status: 'MAINTENANCE',
        activeConnections: 0
      })));
    }
  }, [globalMaintenance]);

  // Toggle global maintenance state
  const handleGlobalToggle = () => {
    const nextState = !globalMaintenance;
    setGlobalMaintenance(nextState);

    localStorage.setItem('platform_maintenance_active', String(nextState));
    if (nextState) {
      localStorage.setItem('platform_maintenance_timestamp', String(Date.now()));
    } else {
      localStorage.removeItem('platform_maintenance_timestamp');
    }
    window.dispatchEvent(new CustomEvent('platform-maintenance-updated', {
      detail: {
        active: nextState,
        gracePeriod,
        announcementText
      }
    }));

    // Apply state change to all services
    setServices(prev => prev.map(srv => ({
      ...srv,
      status: nextState ? 'MAINTENANCE' : 'ONLINE',
      activeConnections: nextState ? 0 : Math.floor(Math.random() * 20) + 5
    })));

    showToast(
      nextState 
        ? `GLOBAL OVERRIDE: Maintenance Mode scheduled in ${gracePeriod} minutes.` 
        : 'Platform systems restored to ONLINE state.',
      nextState ? 'warning' : 'success'
    );
  };

  // Toggle single service state
  const toggleSingleService = (id: string) => {
    setServices(prev => prev.map(srv => {
      if (srv.id === id) {
        const isOnline = srv.status === 'ONLINE';
        return {
          ...srv,
          status: isOnline ? 'MAINTENANCE' : 'ONLINE',
          activeConnections: isOnline ? 0 : Math.floor(Math.random() * 10) + 2
        };
      }
      return srv;
    }));
    showToast(`Individual service configuration updated.`, 'info');
  };

  // Create schedule
  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newStartTime) {
      showToast('Please specify a title and start time for the maintenance window.', 'error');
      return;
    }

    const newSch: ScheduledMaintenance = {
      id: `sch-${Math.random().toString(36).substring(2, 11)}`,
      title: newTitle,
      description: newDesc || 'Routine scheduled platform maintenance.',
      startTime: newStartTime,
      durationMinutes: parseInt(newDuration, 10),
      gracePeriod: parseInt(newGrace, 10),
      status: 'SCHEDULED'
    };

    const updated = [...schedules, newSch];
    setSchedules(updated);
    localStorage.setItem('platform_maintenance_schedules', JSON.stringify(updated));

    setNewTitle('');
    setNewDesc('');
    setNewStartTime('');
    
    showToast('Platform maintenance window scheduled successfully.', 'success');
  };

  // Cancel schedule
  const cancelSchedule = (id: string) => {
    const updated = schedules.map(sch => {
      if (sch.id === id) {
        return { ...sch, status: 'CANCELLED' as const };
      }
      return sch;
    });
    setSchedules(updated);
    localStorage.setItem('platform_maintenance_schedules', JSON.stringify(updated));
    showToast('Scheduled maintenance window cancelled.', 'info');
  };

  // Delete schedule
  const deleteSchedule = (id: string) => {
    const updated = schedules.filter(sch => sch.id !== id);
    setSchedules(updated);
    localStorage.setItem('platform_maintenance_schedules', JSON.stringify(updated));
    showToast('Maintenance schedule removed from log.', 'success');
  };

  // Background sync for status updates
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const raw = localStorage.getItem('platform_maintenance_schedules');
      if (raw) {
        try {
          setSchedules(JSON.parse(raw));
        } catch (e) {
          // ignore
        }
      }

      const active = localStorage.getItem('platform_maintenance_active') === 'true';
      if (active !== globalMaintenance) {
        setGlobalMaintenance(active);
        setServices(prev => prev.map(srv => ({
          ...srv,
          status: active ? 'MAINTENANCE' : 'ONLINE',
          activeConnections: active ? 0 : Math.floor(Math.random() * 20) + 5
        })));
      }
    }, 2000);

    return () => clearInterval(syncInterval);
  }, [globalMaintenance]);

  const activeServicesCount = services.filter(s => s.status === 'ONLINE').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-8 h-8 text-indigo-600" />
            <span>Global Maintenance & Enclave Isolation</span>
          </h1>
          <p className="text-slate-500 mt-1">
            Toggle platform maintenance modes, deploy custom service warning announcements, and restrict tenant access boundaries during system upgrades.
          </p>
        </div>

        {/* Global Master Switch */}
        <button
          onClick={handleGlobalToggle}
          className={`flex items-center gap-2 text-xs font-bold py-3.5 px-4 sm:px-6 rounded-xl border shadow-lg transition-all cursor-pointer ${
            globalMaintenance
              ? 'bg-amber-600 border-amber-500 text-white hover:bg-amber-700 shadow-amber-100 hover:shadow-amber-200'
              : 'bg-[#0B1120] border-slate-800 text-emerald-400 hover:text-emerald-300 shadow-slate-100'
          }`}
        >
          <Power className={`w-4 h-4 ${globalMaintenance ? 'animate-pulse' : ''}`} />
          {globalMaintenance ? 'DISABLE MAINTENANCE MODE' : 'ENABLE MAINTENANCE MODE'}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column: Switcher & Service Control */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* Status Panel Banner */}
          <div className={`p-6 rounded-2xl border transition-all ${
            globalMaintenance 
              ? 'bg-amber-50 border-amber-200 text-amber-900' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-xl border ${
                globalMaintenance 
                  ? 'bg-amber-100 border-amber-300 text-amber-700' 
                  : 'bg-emerald-100 border-emerald-300 text-emerald-700'
              }`}>
                {globalMaintenance ? <Wrench className="w-6 h-6" /> : <Server className="w-6 h-6 animate-pulse" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest">
                  Current System Status: {globalMaintenance ? 'MAINTENANCE SHUTDOWN' : 'LIVE & SECURE'}
                </h3>
                <p className="text-xs font-medium leading-relaxed opacity-90">
                  {globalMaintenance 
                    ? `Platform is undergoing scheduled administrative isolation in the EU-CENTRAL-1 and EU-WEST-1 zones. Grace period active: ${gracePeriod} minutes.`
                    : 'All isolated cryptographic data enclaves are online. Zero connectivity disruptions detected across tenant networks.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Individual Service Switches */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Modular Service Enclaves</h3>
              <p className="text-xs text-slate-500 mt-0.5">Individually toggle system sub-networks without disrupting remaining enclaves.</p>
            </div>

            <div className="space-y-2.5">
              {services.map(srv => {
                const isOnline = srv.status === 'ONLINE';
                return (
                  <div 
                    key={srv.id} 
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isOnline 
                        ? 'bg-white border-slate-100 hover:border-slate-200' 
                        : 'bg-slate-50 border-slate-200 opacity-65'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border text-xs font-bold ${
                        srv.category === 'DATABASE' 
                          ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                          : srv.category === 'API'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        {srv.category}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{srv.name}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                          <span className="font-mono">{srv.id}</span>
                          <span>•</span>
                          <span className="font-bold">Active connections: {srv.activeConnections}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                        isOnline 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {srv.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleSingleService(srv.id)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isOnline
                            ? 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                            : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                        }`}
                      >
                        {isOnline ? 'Put Offline' : 'Bring Online'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Maintenance Scheduler Dashboard */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Platform Maintenance Scheduler</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Pre-configure and automate future maintenance windows. The system status banner updates automatically based on current time.</p>
                </div>
              </div>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-indigo-100">
                TIME-AUTOMATED
              </span>
            </div>

            {/* Countdown card */}
            {nextSch && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 text-white p-2.5 rounded-lg flex items-center justify-center shadow-md shadow-indigo-100">
                    <Hourglass className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-800">Closest Upcoming Scheduled Window</p>
                    <p className="text-slate-500 mt-0.5">
                      <span className="font-bold text-slate-700">{nextSch.title}</span> starts in {Math.max(0, Math.ceil((new Date(nextSch.startTime).getTime() - Date.now()) / (60 * 1000)))}m (at {formatScheduleTime(nextSch.startTime)})
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Schedules list */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Scheduled Windows Log</h4>
              
              {schedules.length === 0 ? (
                <div className="text-center py-5 sm:py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">No planned maintenance windows</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sovereign nodes are operating with 100% active availability.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {schedules.map((sch) => {
                    const isSchActive = sch.status === 'ACTIVE';
                    const isSchScheduled = sch.status === 'SCHEDULED';
                    const isSchCompleted = sch.status === 'COMPLETED';
                    const isSchCancelled = sch.status === 'CANCELLED';

                    return (
                      <div 
                        key={sch.id}
                        className={`p-4 border rounded-xl transition-all ${
                          isSchActive 
                            ? 'bg-amber-50/50 border-amber-300 shadow-xs' 
                            : isSchScheduled
                              ? 'bg-white border-slate-200 hover:border-slate-300'
                              : 'bg-slate-50/60 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-slate-800 text-xs">{sch.title}</h5>
                              
                              <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                isSchActive 
                                  ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                                  : isSchScheduled
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                    : isSchCompleted
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                {sch.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                              {sch.description}
                            </p>
                            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono mt-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                Start: {formatScheduleTime(sch.startTime)}
                              </span>
                              <span>•</span>
                              <span>Duration: {sch.durationMinutes}m</span>
                              <span>•</span>
                              <span>Grace Warning: {sch.gracePeriod}m</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isSchScheduled && (
                              <button
                                onClick={() => {
                                  const updated = schedules.map(s => {
                                    if (s.id === sch.id) {
                                      return {
                                        ...s,
                                        startTime: new Date(Date.now() - 5000).toISOString().slice(0, 16),
                                        status: 'ACTIVE' as const
                                      };
                                    }
                                    return s;
                                  });
                                  setSchedules(updated);
                                  localStorage.setItem('platform_maintenance_schedules', JSON.stringify(updated));
                                  showToast(`Maintenance window "${sch.title}" triggered immediately.`, 'warning');
                                }}
                                className="text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded transition-colors cursor-pointer"
                                title="Force activate maintenance now"
                              >
                                Trigger Now
                              </button>
                            )}

                            {(isSchScheduled || isSchActive) && (
                              <button
                                onClick={() => cancelSchedule(sch.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded hover:bg-slate-100"
                                title="Cancel planned maintenance"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => deleteSchedule(sch.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded hover:bg-slate-100"
                              title="Delete log record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Create Schedule Form */}
            <form onSubmit={handleCreateSchedule} className="border-t border-slate-100 pt-5 space-y-4 text-xs">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Schedule New Maintenance Window
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Window Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Core Ledger Hardening"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Operational Objective</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain what upgrades or isolation protocols will be performed..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="120">2 Hours</option>
                    <option value="240">4 Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grace Warning Period</label>
                  <select
                    value={newGrace}
                    onChange={(e) => setNewGrace(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                  >
                    <option value="0">Immediate Lockdown</option>
                    <option value="2">2 Minutes Warning</option>
                    <option value="5">5 Minutes Grace Period</option>
                    <option value="15">15 Minutes Grace Period</option>
                    <option value="30">30 Minutes Warning</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-center cursor-pointer shadow-sm text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Save Planned Maintenance Schedule
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Announcement Settings */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Notification announcement builder */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Announcement Builder</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Configure banner notices shown to active tenant organizations.</p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Warning Period (Grace Period)</label>
                <select
                  value={gracePeriod}
                  onChange={e => setGracePeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="0">Immediate Lockdown</option>
                  <option value="2">2 Minutes Countdown</option>
                  <option value="5">5 Minutes Grace Period</option>
                  <option value="15">15 Minutes Grace Period</option>
                  <option value="30">30 Minutes Warning</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Public Maintenance Banner Announcement</label>
                <textarea
                  rows={4}
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  placeholder="Text showing up in the user portal dashboard..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    localStorage.setItem('platform_maintenance_grace', gracePeriod);
                    localStorage.setItem('platform_maintenance_announcement', announcementText);
                    window.dispatchEvent(new CustomEvent('platform-maintenance-updated', {
                      detail: {
                        active: globalMaintenance,
                        gracePeriod,
                        announcementText
                      }
                    }));
                    showToast('Announcement updated. Syncing across nodes.', 'success');
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-center cursor-pointer shadow-sm text-xs transition-colors"
                >
                  Publish Notice
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats overview */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2.5">
              Secure Core Telemetry
            </h3>

            <div className="space-y-3 text-xs leading-relaxed font-mono">
              <div className="flex justify-between items-center text-slate-400">
                <span>Active Channels:</span>
                <span className="font-bold text-slate-100">{activeServicesCount} of {services.length}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Grace countdown:</span>
                <span className="font-bold text-amber-400">{globalMaintenance ? `${gracePeriod}m 00s` : 'Inactive'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>DPO Ledger Block:</span>
                <span className="font-bold text-slate-100">#419,082</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Physical Lock:</span>
                <span className={`font-bold ${globalMaintenance ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {globalMaintenance ? 'ENGAGED' : 'UNLOCKED'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Communications & Preview Studio */}
      <MaintenancePreviewEmail 
        draftAnnouncement={announcementText}
        draftGrace={String(gracePeriod)}
        isMaintenanceActive={globalMaintenance}
        schedules={schedules}
      />
    </div>
  );
};
