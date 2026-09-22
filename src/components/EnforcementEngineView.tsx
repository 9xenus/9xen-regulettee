import React, { useState } from 'react';
import { Shield, Lock, Unlock, AlertTriangle, Play, Pause, Server } from 'lucide-react';
import { motion } from 'motion/react';
import { useNotification } from '../context/NotificationContext';

type EnforcementStatus = 'active' | 'warn' | 'paused';

export const EnforcementEngineView: React.FC<{ tenantId?: string }> = ({ tenantId = 'DEFAULT' }) => {
  const [status, setStatus] = useState<EnforcementStatus>('active');
  const [evidenceLocked, setEvidenceLocked] = useState(true);
  const [remediating, setRemediating] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { sendEmailAlert } = useNotification();

  const actions = [
    { id: 'ACT-001', evidence: 'Snapshot of data breach at 08:00 UTC' },
    { id: 'ACT-002', evidence: 'Log entry for unauthorised access request' },
  ];

  const handleStatusChange = (newStatus: EnforcementStatus) => {
    setStatus(newStatus);
    if (newStatus === 'paused') {
      sendEmailAlert('High Severity Incident Detected', 'The Enforcement Engine has been paused due to a high-severity incident.');
    }
  };

  const handleRemediation = () => {
    setRemediating(true);
    setTimeout(() => setRemediating(false), 2000);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'warn': return 'bg-amber-500';
      case 'paused': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          Enforcement Engine Control
        </h3>
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs font-mono text-slate-600">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          STATUS: {status.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Evidence Locking
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Evidence is currently <strong className={evidenceLocked ? 'text-emerald-700' : 'text-rose-700'}>{evidenceLocked ? 'LOCKED' : 'UNLOCKED'}</strong>
            </span>
            <button
              onClick={() => setEvidenceLocked(!evidenceLocked)}
              className="flex items-center gap-1 text-xs font-bold bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              {evidenceLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {evidenceLocked ? 'Unlock' : 'Lock'}
            </button>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Server className="w-4 h-4" /> Engine Controls
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('paused')}
              disabled={status === 'paused'}
              className="flex-1 flex items-center justify-center gap-2 text-xs font-bold bg-white border border-slate-300 px-3 py-2 rounded-lg hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
            >
              <Pause className="w-3 h-3" /> Pause
            </button>
            <button
              onClick={() => handleStatusChange('active')}
              disabled={status === 'active'}
              className="flex-1 flex items-center justify-center gap-2 text-xs font-bold bg-white border border-slate-300 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
            >
              <Play className="w-3 h-3" /> Resume
            </button>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Quick Remediation
          </h4>
          <button
            onClick={handleRemediation}
            disabled={remediating}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {remediating ? 'Patching...' : 'Run Compliance Patch'}
          </button>
        </div>
      </div>

      <div className="mt-6 border border-slate-200 rounded-xl p-4 bg-slate-50">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Recent Enforcement Actions</h4>
        <div className="space-y-2">
            {actions.map(action => (
                <div key={action.id} className="relative inline-block mr-2" onMouseEnter={() => setHoveredId(action.id)} onMouseLeave={() => setHoveredId(null)}>
                    <span className="text-xs font-mono bg-white border border-slate-300 px-2 py-1 rounded cursor-pointer hover:border-indigo-400">
                        {action.id}
                    </span>
                    {hoveredId === action.id && (
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-slate-800 text-white text-xs p-2 rounded shadow-lg z-10">
                            {action.evidence}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
