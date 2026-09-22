import React from 'react';
import { Settings, ShieldAlert, AlertTriangle } from 'lucide-react';

export const SystemSetup: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 sm:p-5 lg:p-6 text-center">
      <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
        <Settings className="w-10 h-10 animate-spin-slow" />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">System Setup Mode</h2>
      <p className="text-slate-500 max-w-md mb-8">
        The dashboard is currently unavailable or undergoing maintenance. You have been redirected to the system setup page.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm text-left">
          <ShieldAlert className="w-6 h-6 text-indigo-500 mb-3" />
          <h3 className="font-bold text-slate-800">Security Configuration</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Review system access controls and multi-factor authentication requirements.</p>
          <button 
            onClick={() => onNavigate('settings')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            Manage Security &rarr;
          </button>
        </div>
        
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm text-left">
          <AlertTriangle className="w-6 h-6 text-rose-500 mb-3" />
          <h3 className="font-bold text-slate-800">Platform Diagnostics</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Check for active incidents, degraded services, or disconnected microservices.</p>
          <button 
            onClick={() => onNavigate('devops')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            View Diagnostics &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
