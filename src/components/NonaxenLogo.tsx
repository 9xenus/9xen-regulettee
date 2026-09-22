import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface NonaxenLogoProps {
  className?: string;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg';
  size?: string | number;
}

export const NonaxenLogo: React.FC<NonaxenLogoProps> = ({
  className = 'w-8 h-8',
  showText = true,
  textSize = 'md',
}) => {
  const textSizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }[textSize] || 'text-base';

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 border border-indigo-400/30 shadow-md ${className}`}>
        <ShieldCheck className="w-3/5 h-3/5 text-white stroke-[2.2]" />
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 ring-1 ring-emerald-500/50" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-wider text-slate-100 font-mono ${textSizeClass}`}>
            9<span className="text-indigo-400">XEN</span>
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 -mt-1">
            Regulettee CaaS
          </span>
        </div>
      )}
    </div>
  );
};
