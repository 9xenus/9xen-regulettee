import React from 'react';
import { AutonomousComplianceCenter } from '../components/AutonomousComplianceCenter';
import { EnterpriseLayout } from '../components/layout/EnterpriseLayout';

export const AutonomousGovernance: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AutonomousComplianceCenter />
    </div>
  );
};

export default AutonomousGovernance;
