import { useAuth } from '../context/AuthContext';
import { UIUsageAuditLog, UIUsageAuditCategory } from '../types';

const STORAGE_KEY = '9xen-regulettee_system_audit_logs';
const MAX_LOGS = 100;

export function useAuditLogger() {
  const { user } = useAuth();

  const logAction = (
    action: string, 
    category: UIUsageAuditCategory = 'GENERAL', 
    metadata?: Record<string, any>
  ) => {
    try {
      const existingLogsRaw = localStorage.getItem(STORAGE_KEY);
      const existingLogs: UIUsageAuditLog[] = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];

      const newLog: UIUsageAuditLog = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString(),
        action,
        category,
        metadata,
        userId: user?.id,
        userEmail: user?.email,
        role: user?.user_metadata?.role || user?.user_metadata?.accountType,
      };

      const updatedLogs = [newLog, ...existingLogs].slice(0, MAX_LOGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
      
      window.dispatchEvent(new CustomEvent('9xen-regulettee_audit_log_updated', { detail: newLog }));
      
      console.log(`[AuditLogger] Action logged: ${action} (${category})`);
    } catch (error) {
      console.error('[AuditLogger] Failed to log action:', error);
    }
  };

  const getLogs = () => {
    try {
      const logs = localStorage.getItem(STORAGE_KEY);
      return logs ? JSON.parse(logs) as UIUsageAuditLog[] : [];
    } catch (error) {
      console.error('[AuditLogger] Failed to get logs:', error);
      return [];
    }
  };

  const clearLogs = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('9xen-regulettee_audit_log_updated', { detail: null }));
  };

  return {
    logAction,
    getLogs,
    clearLogs
  };
}
