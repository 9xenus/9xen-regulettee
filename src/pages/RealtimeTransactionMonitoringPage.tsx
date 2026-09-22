import React from 'react';
import { RealtimeTransactionMonitoringDashboard } from '../components/dashboard/RealtimeTransactionMonitoringDashboard';

export const RealtimeTransactionMonitoringPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <RealtimeTransactionMonitoringDashboard />
    </div>
  );
};

export default RealtimeTransactionMonitoringPage;
