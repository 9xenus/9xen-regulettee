import React from 'react';
import { SlaMonitoringDashboard } from '../components/admin/SlaMonitoringDashboard';

export const SlaMonitoringPage: React.FC = () => {
  return (
    <div className="p-6 md:p-8">
      <SlaMonitoringDashboard />
    </div>
  );
};

export default SlaMonitoringPage;
