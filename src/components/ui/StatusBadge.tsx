import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  MinusCircle
} from 'lucide-react';

export type ComplianceState =
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'CRITICAL'
  | 'WARNING'
  | 'IN_REVIEW'
  | 'PENDING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'REVOKED'
  | 'PASS'
  | 'FAIL'
  | 'UNKNOWN';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: ComplianceState | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  showIcon?: boolean;
  variant?: 'solid' | 'subtle' | 'outline';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = 'COMPLIANT',
  label,
  size = 'md',
  showPulse = false,
  showIcon = true,
  variant = 'subtle',
  className = '',
  ...props
}) => {
  const normalizedStatus = (status || '').toUpperCase().trim();

  // Color mapping based on compliance & operational states
  const getConfig = () => {
    switch (normalizedStatus) {
      case 'COMPLIANT':
      case 'PASS':
      case 'ACTIVE':
        return {
          icon: ShieldCheck,
          text: label || 'Compliant',
          subtle: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
          solid: 'bg-emerald-600 text-white border-emerald-700',
          outline: 'bg-transparent text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700',
          dot: 'bg-emerald-500',
        };

      case 'NON_COMPLIANT':
      case 'FAIL':
      case 'CRITICAL':
        return {
          icon: ShieldAlert,
          text: label || (normalizedStatus === 'CRITICAL' ? 'Critical Risk' : 'Non-Compliant'),
          subtle: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
          solid: 'bg-rose-600 text-white border-rose-700',
          outline: 'bg-transparent text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700',
          dot: 'bg-rose-500',
        };

      case 'WARNING':
      case 'HIGH_RISK':
        return {
          icon: AlertTriangle,
          text: label || 'Warning',
          subtle: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
          solid: 'bg-amber-500 text-white border-amber-600',
          outline: 'bg-transparent text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700',
          dot: 'bg-amber-500',
        };

      case 'IN_REVIEW':
      case 'AUDITING':
        return {
          icon: RefreshCw,
          text: label || 'In Review',
          subtle: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80',
          solid: 'bg-indigo-600 text-white border-indigo-700',
          outline: 'bg-transparent text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700',
          dot: 'bg-indigo-500',
        };

      case 'PENDING':
        return {
          icon: Clock,
          text: label || 'Pending',
          subtle: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/80',
          solid: 'bg-sky-600 text-white border-sky-700',
          outline: 'bg-transparent text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-700',
          dot: 'bg-sky-500',
        };

      case 'REVOKED':
      case 'INACTIVE':
        return {
          icon: XCircle,
          text: label || 'Revoked',
          subtle: 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
          solid: 'bg-slate-700 text-white border-slate-800',
          outline: 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
          dot: 'bg-slate-400',
        };

      default:
        return {
          icon: HelpCircle,
          text: label || status || 'Unknown',
          subtle: 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
          solid: 'bg-slate-600 text-white border-slate-700',
          outline: 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1 font-mono',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-sans',
    lg: 'px-3 py-1.5 text-sm gap-2 font-sans',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const variantClass = config[variant];

  return (
    <span
      className={`inline-flex items-center font-extrabold rounded-full border shadow-2xs whitespace-nowrap transition-all ${sizeClasses[size]} ${variantClass} ${className}`}
      {...props}
    >
      {showPulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
        </span>
      )}

      {showIcon && <IconComponent className={`${iconSizes[size]} shrink-0 ${normalizedStatus === 'IN_REVIEW' ? 'animate-spin' : ''}`} />}

      <span>{config.text}</span>
    </span>
  );
};
