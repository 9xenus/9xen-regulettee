import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X, WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchLatestRegulatoryUpdate, getInitialUpdates } from '../services/regulatory-polling';
import { RegulatoryUpdate } from '../types';

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'regulatory_alert';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  meta?: {
    jurisdiction?: string;
    category?: string;
    severity?: 'critical' | 'warning' | 'info';
    id?: string;
  };
}


interface NotificationContextProps {
  showToast: (message: string, type?: ToastType, title?: string, meta?: Toast['meta']) => void;
  sendEmailAlert: (subject: string, body: string) => Promise<void>;
  scheduleExport: (format: string, frequency: string) => Promise<void>;
  isOnline: boolean;
  
  // Real-time regulatory updates props
  regulatoryUpdates: RegulatoryUpdate[];
  unreadCount: number;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  addRegulatoryUpdate: (update: Omit<RegulatoryUpdate, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  triggerMockPoll: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [regulatoryUpdates, setRegulatoryUpdates] = useState<RegulatoryUpdate[]>(() => getInitialUpdates());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Network connectivity status state & listener
  const [isOnline, setIsOnline] = useState<boolean>(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showRestoredBanner, setShowRestoredBanner] = useState<boolean>(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredBanner(true);
      timer = setTimeout(() => {
        setShowRestoredBanner(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredBanner(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // API Rate Limit & Error Listeners
    const handleRateLimit = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      showToast(
        `Rate limit encountered. Retrying in ${Math.round(detail.delay / 1000)}s... (Attempt ${detail.retries + 1}/${detail.maxRetries + 1})`,
        'warning',
        'Network Congestion'
      );
    };

    const handleRateLimitFailed = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      showToast(
        `System is currently under heavy load (Status ${detail.status}). Please try again in a few minutes.`,
        'error',
        'Request Failed'
      );
    };

    const handleApiError = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      showToast(
        `A network error occurred: ${detail.error}`,
        'error',
        'Connection Error'
      );
    };

    window.addEventListener('9xen-regulettee-api-rate-limit', handleRateLimit);
    window.addEventListener('9xen-regulettee-api-rate-limit-failed', handleRateLimitFailed);
    window.addEventListener('9xen-regulettee-api-error', handleApiError);

    // Database Connection Loss & Reconnection Event Listeners
    const handleDbStatusChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const title = `Database Connection: ${detail.dbName || 'Engine'}`;
      const type = detail.status === 'DISCONNECTED' ? 'error' : 'warning';
      showToast(detail.message || `Connection to ${detail.dbName} changed status to ${detail.status}.`, type, title);
    };

    const handleDbReconnectSuccess = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      showToast(
        detail.message || `Connection restored to ${detail.dbName}. Data synchronization active.`,
        'success',
        `Database Restored: ${detail.dbName}`
      );
    };

    const handleDbReconnectFailed = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      showToast(
        detail.message || `Failed to reconnect to ${detail.dbName}. Operating in local fallback mode.`,
        'error',
        `Database Offline: ${detail.dbName}`
      );
    };

    window.addEventListener('db-connection-status', handleDbStatusChange);
    window.addEventListener('db-reconnection-success', handleDbReconnectSuccess);
    window.addEventListener('db-reconnection-failed', handleDbReconnectFailed);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('9xen-regulettee-api-rate-limit', handleRateLimit);
      window.removeEventListener('9xen-regulettee-api-rate-limit-failed', handleRateLimitFailed);
      window.removeEventListener('9xen-regulettee-api-error', handleApiError);
      window.removeEventListener('db-connection-status', handleDbStatusChange);
      window.removeEventListener('db-reconnection-success', handleDbReconnectSuccess);
      window.removeEventListener('db-reconnection-failed', handleDbReconnectFailed);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const sendEmailAlert = useCallback(async (subject: string, body: string) => {
    console.log(`[Email Service Simulation] Sending email to admin...\nSubject: ${subject}\nBody: ${body}`);
    // Simulate async network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[Email Service Simulation] Email sent successfully.');
  }, []);

  const scheduleExport = useCallback(async (format: string, frequency: string) => {
    console.log(`[Export Service Simulation] Scheduling export...\nFormat: ${format}\nFrequency: ${frequency}`);
    // Simulate async network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[Export Service Simulation] Export scheduled successfully.');
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string, meta?: Toast['meta']) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title, meta }]);
    
    // Keep legislative update toasts active for 8 seconds, and standard toasts for 4.5 seconds to auto-dissolve
    const timeoutDuration = type === 'regulatory_alert' ? 8000 : 4500;
    setTimeout(() => {
      removeToast(id);
    }, timeoutDuration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Helper to add regulatory updates
  const addRegulatoryUpdate = useCallback((update: Omit<RegulatoryUpdate, 'id' | 'timestamp' | 'read'>) => {
    const id = `update-${Math.random().toString(36).substring(2, 9)}`;
    const newUpdate: RegulatoryUpdate = {
      ...update,
      id,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setRegulatoryUpdates((prev) => [newUpdate, ...prev]);

    // Use our beautiful, interactive custom notification toast component for EU/regulatory updates
    showToast(update.description, 'regulatory_alert', update.title, {
      jurisdiction: 'EU',
      category: update.category,
      severity: update.severity,
      id
    });
  }, [showToast]);

  const markAsRead = useCallback((id: string) => {
    setRegulatoryUpdates((prev) =>
      prev.map((up) => (up.id === id ? { ...up, read: true } : up))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setRegulatoryUpdates((prev) => prev.map((up) => ({ ...up, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setRegulatoryUpdates([]);
  }, []);

  // Manual polling trigger
  const triggerMockPoll = useCallback(() => {
    const nextUpdate = fetchLatestRegulatoryUpdate();
    addRegulatoryUpdate(nextUpdate);
  }, [addRegulatoryUpdate]);

  // Set up real-time polling (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      triggerMockPoll();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [triggerMockPoll]);

  const unreadCount = regulatoryUpdates.filter((up) => !up.read).length;

  const shouldShowNotifications = typeof window !== 'undefined';

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        sendEmailAlert,
        scheduleExport,
        isOnline,
        regulatoryUpdates,
        unreadCount,
        isSidebarOpen,
        setIsSidebarOpen,
        addRegulatoryUpdate,
        markAsRead,
        markAllAsRead,
        clearAll,
        triggerMockPoll,
      }}
    >
      {/* Network Connection Loss / Restored Subtle Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-slate-900/95 border-b border-amber-500/50 text-amber-200 text-xs font-medium py-2 px-4 shadow-xl backdrop-blur-md flex items-center justify-center gap-2.5 tracking-wide"
          >
            <WifiOff className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span>
              <strong>Network Disconnected:</strong> 9Xen Regulettee is operating in offline mode. Changes will sync automatically when reconnected.
            </span>
          </motion.div>
        )}
        {isOnline && showRestoredBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-slate-900/95 border-b border-emerald-500/50 text-emerald-200 text-xs font-medium py-2 px-4 shadow-xl backdrop-blur-md flex items-center justify-center gap-2.5 tracking-wide"
          >
            <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Network Restored:</strong> Reconnected to 9Xen Regulettee Compliance Network.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
      {shouldShowNotifications && (
        <div className="fixed top-6 right-4 sm:right-6 z-[9999] flex flex-col items-end space-y-2.5 pointer-events-none max-w-sm sm:max-w-md w-full">
          <AnimatePresence mode="sync">
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.35, ease: 'easeOut' } }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="pointer-events-auto shadow-2xl rounded-xl"
              >
                <ToastNotification toast={toast} onDismiss={() => removeToast(toast.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const ToastNotification: React.FC<{ toast: Toast; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  if (toast.type === 'regulatory_alert') {
    const severity = toast.meta?.severity || 'info';
    const severityBadgeColor = severity === 'critical' 
      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
      : severity === 'warning'
        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
        : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30';

    return (
      <div className="flex flex-col p-4 w-96 rounded-xl border border-indigo-500/40 bg-slate-900 shadow-2xl text-white relative overflow-hidden pointer-events-auto group">
        {/* Background glow effects */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2 pointer-events-none">
          <div className="flex items-center space-x-2">
            <span className="text-sm" role="img" aria-label="EU Flag">🇪🇺</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 font-mono">
              EU Legislative Alert
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${severityBadgeColor}`}>
              {severity}
            </span>
          </div>
        </div>
        
        {/* Body content */}
        <div className="flex items-start mt-1 mb-3">
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-100 leading-snug mb-1 font-sans">
              {toast.title || 'Regulatory Update Detected'}
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              {toast.message}
            </p>
          </div>
        </div>
        
        {/* Interactive Action Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-800 text-[10px]">
          <span className="text-slate-400 font-mono">
            Category: {toast.meta?.category || 'General'}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                // Navigate to /reg-simulator using the window.history popstate flow
                window.history.pushState({}, '', '/reg-simulator');
                window.dispatchEvent(new Event('popstate'));
                onDismiss();
              }}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              Simulate Impact
            </button>
            <button
              onClick={onDismiss}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold transition-all cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-0.5 bg-slate-800 w-full pointer-events-none">
          <div 
             className="h-full bg-indigo-500"
             style={{ animation: 'toast-progress 8s linear forwards' }}
          />
        </div>
      </div>
    );
  }

  let icon = <Info className="w-5 h-5 text-blue-500" />;
  let bgColor = 'bg-white dark:bg-slate-900';
  let borderColor = 'border-slate-200 dark:border-slate-800';
  let headingColor = 'text-slate-800 dark:text-slate-100';

  if (toast.type === 'success') {
    icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
    borderColor = 'border-emerald-200/80 dark:border-emerald-500/30';
  } else if (toast.type === 'warning') {
    icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
    borderColor = 'border-amber-200/80 dark:border-amber-500/30';
  } else if (toast.type === 'error') {
    icon = <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
    borderColor = 'border-rose-200/80 dark:border-rose-500/30';
  }

  return (
    <div className={`flex items-start p-3.5 w-80 sm:w-88 rounded-xl border ${borderColor} ${bgColor} shadow-xl backdrop-blur-xl relative overflow-hidden group`}>
      <div className="flex-shrink-0 mr-3 mt-0.5">{icon}</div>
      <div className="flex-1 mr-4 min-w-0">
        <p className={`text-xs font-bold ${headingColor} mb-0.5 capitalize`}>{toast.type}</p>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">{toast.message}</p>
      </div>
      <button 
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Progress bar effect purely CSS keyframes */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-slate-100 dark:bg-slate-800 w-full pointer-events-none">
        <div 
           className={`h-full ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}
           style={{ animation: 'toast-progress 4.5s linear forwards' }}
        />
      </div>
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
