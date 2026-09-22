import React, { useEffect, useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  ShieldAlert,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';
import { RoleBasedNotificationPanel } from '../compliance/RoleBasedNotificationPanel';
import { RegulatoryUpdate } from '../../types';

export const RegulatoryNotificationSidebar: React.FC = () => {
  const { 
    regulatoryUpdates, 
    isSidebarOpen, 
    setIsSidebarOpen, 
    markAsRead, 
    markAllAsRead, 
    clearAll, 
    triggerMockPoll 
  } = useNotification();

  const [activeTab, setActiveTab] = useState<'ROLE_ALERTS' | 'EU_GAZETTE'>('ROLE_ALERTS');
  const [isPollingDemo, setIsPollingDemo] = useState(false);

  const handleManualPoll = () => {
    setIsPollingDemo(true);
    triggerMockPoll();
    setTimeout(() => {
      setIsPollingDemo(false);
    }, 600);
  };

  // Helper for relative time formatting
  const getRelativeTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 10) return 'Just now';
      if (diffSecs < 60) return `${diffSecs}s ago`;
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (e) {
      return 'Recently';
    }
  };

  // Category Colors Map
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'GDPR':
        return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/30';
      case 'EU AI Act':
        return 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800/30';
      case 'Data Residency':
        return 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800/30';
      case 'Policy Change':
        return 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800/30';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  // Severity Styles
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
          bg: 'bg-rose-500',
          border: 'border-rose-100',
          text: 'text-rose-700'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
          bg: 'bg-amber-500',
          border: 'border-amber-100',
          text: 'text-amber-700'
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-blue-500" />,
          bg: 'bg-blue-500',
          border: 'border-blue-100',
          text: 'text-blue-700'
        };
    }
  };

  // Keyboard accessibility to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, setIsSidebarOpen]);

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
            id="regulatory-sidebar-backdrop"
          />

          {/* Sidebar Panel Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[580px] md:w-[680px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col overflow-hidden"
            id="regulatory-sidebar-panel"
          >
            {/* Top Navigation Tabs in Drawer */}
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
                <button
                  onClick={() => setActiveTab('ROLE_ALERTS')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'ROLE_ALERTS'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Role Compliance Alerts</span>
                </button>

                <button
                  onClick={() => setActiveTab('EU_GAZETTE')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'EU_GAZETTE'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>EU Gazette Stream</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-mono">
                    {regulatoryUpdates.length}
                  </span>
                </button>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                id="close-regulatory-sidebar"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB CONTENT 1: Role Compliance Alerts Hub */}
            {activeTab === 'ROLE_ALERTS' && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <RoleBasedNotificationPanel
                  onClose={() => setIsSidebarOpen(false)}
                  onNavigate={(path) => {
                    setIsSidebarOpen(false);
                    window.location.hash = `#${path}`;
                    window.dispatchEvent(new CustomEvent('navigate', { detail: path }));
                  }}
                  className="h-full"
                />
              </div>
            )}

            {/* TAB CONTENT 2: EU Gazette Stream */}
            {activeTab === 'EU_GAZETTE' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Sub-header Control Bar */}
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full font-mono font-medium">
                    {regulatoryUpdates.length} EUR-Lex Gazette Updates
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleManualPoll}
                      disabled={isPollingDemo}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Simulate immediate regulation update"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isPollingDemo ? 'animate-spin' : ''}`} />
                      <span>Simulate Poll</span>
                    </button>

                    {regulatoryUpdates.some(u => !u.read) && (
                      <button
                        onClick={markAllAsRead}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark All Read</span>
                      </button>
                    )}

                    {regulatoryUpdates.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 transition-colors cursor-pointer"
                        title="Clear stream history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications Scroller */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950">
                  {regulatoryUpdates.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                        <Bell className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Clear Regulatory Horizon</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[260px] mt-1.5 leading-relaxed">
                        No new policy or regulatory modifications recorded. Use &quot;Simulate Poll&quot; to test.
                      </p>
                      <button
                        onClick={handleManualPoll}
                        className="mt-4 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Poll updates now
                      </button>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {regulatoryUpdates.map((update) => {
                        const sev = getSeverityStyles(update.severity);
                        return (
                          <motion.div
                            key={update.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => markAsRead(update.id)}
                            className={`group p-4 bg-white dark:bg-slate-900 border rounded-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col space-y-2 border-slate-200 dark:border-slate-800 ${
                              !update.read ? 'ring-1 ring-emerald-500/20 bg-emerald-50/5 dark:bg-emerald-950/10' : 'opacity-85'
                            }`}
                          >
                            {!update.read && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                            )}

                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="flex-shrink-0">
                                  {sev.icon}
                                </div>

                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getCategoryStyles(update.category)}`}>
                                  {update.category}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center space-x-1">
                                  <Calendar className="w-3 h-3 inline mr-0.5" />
                                  {getRelativeTime(update.timestamp)}
                                </span>
                                {!update.read && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                )}
                              </div>
                            </div>

                            <h4 className={`text-sm font-bold leading-snug ${
                              !update.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {update.title}
                            </h4>

                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                              {update.description}
                            </p>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                Ref: {update.id.slice(0, 8)}
                              </span>

                              {update.url && (
                                <a 
                                  href={update.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center space-x-1"
                                >
                                  <span>EUR-Lex Directive</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RegulatoryNotificationSidebar;
