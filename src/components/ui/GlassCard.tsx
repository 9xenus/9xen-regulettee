import React from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glowColor?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate';
  variant?: 'default' | 'subtle' | 'bordered';
  children?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  className = '',
  hoverEffect = false,
  glowColor,
  variant = 'default',
  children,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200 backdrop-blur-md overflow-hidden';

  const variantStyles = {
    default: 'bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-slate-900 dark:text-slate-100',
    subtle: 'bg-slate-50/70 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-800/50 text-slate-900 dark:text-slate-100',
    bordered: 'bg-white/95 dark:bg-slate-900/95 border-2 border-slate-200 dark:border-slate-700 shadow-md text-slate-900 dark:text-slate-100',
  };

  const hoverStyles = hoverEffect
    ? 'hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600/80 hover:-translate-y-0.5'
    : '';

  const glowStyles = {
    indigo: 'hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20',
    emerald: 'hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20',
    rose: 'hover:shadow-rose-500/10 dark:hover:shadow-rose-500/20',
    amber: 'hover:shadow-amber-500/10 dark:hover:shadow-amber-500/20',
    slate: 'hover:shadow-slate-500/10 dark:hover:shadow-slate-500/20',
  };

  const glowClass = glowColor ? glowStyles[glowColor] : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const GlassCardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    className={`p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const GlassCardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3
    className={`text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const GlassCardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p className={`text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const GlassCardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`p-5 sm:p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const GlassCardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    className={`p-4 sm:p-5 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 ${className}`}
    {...props}
  >
    {children}
  </div>
);
