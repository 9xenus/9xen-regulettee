import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const VerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const status = user?.user_metadata?.verificationStatus || 'Pending';

  if (status === 'Verified') return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2">
      <ShieldAlert className="w-4 h-4 text-amber-600" />
      <p className="text-xs font-bold text-amber-800">
        Your account verification is {status.toLowerCase()}. Please complete verification to access all platform features.
      </p>
    </div>
  );
};
