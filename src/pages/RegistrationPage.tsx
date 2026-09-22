import React from 'react';
import { RegistrationForm } from '../components/auth/RegistrationForm';

interface RegistrationPageProps {
  navigate?: (path: string) => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ navigate }) => {
  const handleSuccess = (userData: any) => {
    console.log('[RegistrationPage] User successfully registered:', userData);
    // Role-based navigation logic after successful registration
    const role = userData.role || 'client';
    const path = role === 'regulator' ? '/regulator' : role === 'lawyer_consultant' ? '/lawyer-portal' : '/client';
    
    if (navigate) {
      navigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleCancel = () => {
    if (navigate) {
      navigate('/');
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <RegistrationForm 
        mode="standalone"
        title="Sovereign Identity Registration"
        subtitle="Secure enterprise onboarding with eIDAS v2 compliance"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default RegistrationPage;
