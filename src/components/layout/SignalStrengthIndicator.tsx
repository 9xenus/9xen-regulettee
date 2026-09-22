import React, { useState, useRef, useEffect } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { useSocketIoClient } from '../../hooks/useSocketIoClient';

export const SignalStrengthIndicator: React.FC = () => {
  const { isConnected, latencyMs, reconnectAttempt, manualReconnect } = useSocketIoClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine real-time health category and signal bars
  const getHealthInfo = () => {
    if (!isConnected) {
      if (reconnectAttempt > 0) {
        return {
          label: 'Reconnecting',
          health: 'Degraded',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
          bars: 1,
          barColor: 'bg-amber-500',
        };
      }
      return {
        label: 'Disconnected',
        health: 'Offline',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
        bars: 0,
        barColor: 'bg-slate-300',
      };
    }

    if (latencyMs === null) {
      return {
        label: 'Measuring',
        health: 'Stable',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
        bars: 2,
        barColor: 'bg-emerald-500',
      };
    }

    if (latencyMs < 50) {
      return {
        label: 'Excellent',
        health: 'Excellent',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
        bars: 3,
        barColor: 'bg-emerald-500',
      };
    }

    if (latencyMs < 150) {
      return {
        label: 'Stable',
        health: 'Stable',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        bars: 2,
        barColor: 'bg-blue-500',
      };
    }

    return {
      label: 'Degraded',
      health: 'Degraded',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
      bars: 1,
      barColor: 'bg-amber-500',
    };
  };

  const info = getHealthInfo();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-xs ${info.badgeClass}`}
        title={`Signal Strength: ${info.health} (${latencyMs !== null && isConnected ? `${latencyMs}ms RTT` : info.label})`}
      >
        {/* Signal bars graphic */}
        <div className="flex items-end space-x-0.5 h-3.5 w-3.5 pb-0.5" aria-hidden="true">
          <span className={`w-1 rounded-xs transition-all duration-300 ${info.bars >= 1 ? info.barColor : 'bg-slate-300'} h-[35%]`} />
          <span className={`w-1 rounded-xs transition-all duration-300 ${info.bars >= 2 ? info.barColor : 'bg-slate-300'} h-[65%]`} />
          <span className={`w-1 rounded-xs transition-all duration-300 ${info.bars >= 3 ? info.barColor : 'bg-slate-300'} h-[100%]`} />
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="font-mono text-[11px] font-bold">
            {latencyMs !== null && isConnected ? `${latencyMs}ms` : info.label}
          </span>
          <span className="hidden xl:inline text-[10px] opacity-85 uppercase tracking-wide font-extrabold">
            • {info.health}
          </span>
        </div>
      </button>

      {/* Popover detailed network telemetry panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2 text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
            <div className="flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-xs tracking-wider uppercase text-slate-500">Socket.io Network Health</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${info.badgeClass}`}>
              {info.health}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Socket.io Latency (RTT)</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {latencyMs !== null && isConnected ? `${latencyMs} ms` : 'N/A'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Gateway State</span>
                <span className={`font-bold ${isConnected ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isConnected ? 'ONLINE' : reconnectAttempt > 0 ? `RECONNECTING (#${reconnectAttempt})` : 'OFFLINE'}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Protocol:</span>
                <span className="font-mono font-semibold text-slate-800">WebSocket / Polling</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Sovereign Enclave:</span>
                <span className="font-mono font-semibold text-slate-800">EU-West-1 (Frankfurt)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Backoff Strategy:</span>
                <span className="font-mono font-semibold text-emerald-600">Active (Exponential)</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Heartbeat interval: 10s</span>
              <button
                onClick={() => {
                  manualReconnect();
                }}
                className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                <span>Ping Test</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
