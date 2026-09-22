import React from 'react';
import { ShieldCheck, AlertCircle, Clock } from 'lucide-react';

interface VerificationBadgeProps {
  status: 'Verified' | 'Pending' | 'Action Required';
  onClick?: () => void;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status, onClick }) => {
  const getStyles = () => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-50/50 text-emerald-700 border-emerald-100';
      case 'Action Required':
        return 'bg-rose-50/50 text-rose-700 border-rose-100';
      case 'Pending':
      default:
        return 'bg-amber-50/50 text-amber-700 border-amber-100';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'Verified':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'Action Required':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'Pending':
      default:
        return <Clock className="w-3.5 h-3.5 animate-pulse" />;
    }
  };

  return (
    <div onClick={onClick} className={`flex items-center space-x-1.5 border px-2 py-1 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStyles()} cursor-pointer hover:opacity-80 transition-opacity shrink-0`} title={`Verification status: ${status}`}>
      {getIcon()}
      <span className="hidden lg:inline">{status}</span>
    </div>
  );
};
