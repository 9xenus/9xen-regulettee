import React from 'react';
import { RoleBasedNotificationPanel } from '../components/compliance/RoleBasedNotificationPanel';

export const RoleBasedComplianceAlertsPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="w-full h-full min-h-[calc(100vh-80px)] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <RoleBasedNotificationPanel onNavigate={onNavigate} />
    </div>
  );
};

export default RoleBasedComplianceAlertsPage;
