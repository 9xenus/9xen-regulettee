import React, { useEffect, useState } from 'react';
import { WifiOff, Activity } from 'lucide-react';
import { useIsOnline } from '../../hooks/useIsOnline';

export const OfflineBanner: React.FC = () => {
  const isOnline = useIsOnline();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show banner only when we transition offline
    if (!isOnline) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [isOnline]);

  if (!show) return null;

  return (
    <div className="w-full bg-rose-950/80 border-b border-rose-800/60 text-rose-300 relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="bg-rose-900/50 p-1.5 rounded-lg border border-rose-800 shrink-0">
            <WifiOff className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-2">
              <span className="uppercase tracking-wider">Network Disconnected</span>
              <span className="bg-rose-900/80 text-[9px] px-1.5 py-0.5 rounded border border-rose-700/50">OFFLINE MODE</span>
            </div>
            <p className="text-rose-200/80 mt-0.5 font-medium text-[11px]">
              You are working in a local-only state. Changes will be synced automatically when connectivity is restored.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
           <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-mono bg-rose-950/50 px-2 py-1 rounded border border-rose-800/50">
             <Activity className="w-3 h-3 animate-pulse" /> Local Cache Active
           </div>
        </div>
      </div>
    </div>
  );
};
