import React from 'react';
import { EntityProfile } from '../components/profile/EntityProfile';

export const EntityProfilePage: React.FC = () => {
  const handleNavigateToRegister = () => {
    window.location.hash = '#registration';
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'registration' }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <EntityProfile onNavigateToRegister={handleNavigateToRegister} />
    </div>
  );
};

export default EntityProfilePage;
