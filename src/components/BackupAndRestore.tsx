import React, { useState } from 'react';
import { 
  HardDrive, 
  RefreshCw, 
  CheckCircle2, 
  Download, 
  Upload, 
  Clock, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface Snapshot {
  id: string;
  timestamp: string;
  sizeMB: number;
  region: string;
  status: 'VERIFIED' | 'CREATING';
  encryption: string;
}

const mockSnapshots: Snapshot[] = [
  {
    id: 'SNAP-20260903-01',
    timestamp: 'Today at 04:00 CET',
    sizeMB: 4820,
    region: 'Frankfurt Enclave A',
    status: 'VERIFIED',
    encryption: 'Quantum KEM-768 Sealed'
  },
  {
    id: 'SNAP-20260902-01',
    timestamp: 'Yesterday at 04:00 CET',
    sizeMB: 4790,
    region: 'Paris Enclave B',
    status: 'VERIFIED',
    encryption: 'Quantum KEM-768 Sealed'
  }
];

export interface BackupAndRestoreProps {
  configs?: any;
  className?: string;
}

export const BackupAndRestore: React.FC<BackupAndRestoreProps> = ({
  configs,
  className = ''
}) => {
  const { showToast } = useNotification();
  const [snapshots, setSnapshots] = useState<Snapshot[]>(mockSnapshots);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSnapshot = () => {
    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);
      setSnapshots(prev => [
        {
          id: `SNAP-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-02`,
          timestamp: 'Just now',
          sizeMB: 4850,
          region: 'Frankfurt Enclave A',
          status: 'VERIFIED',
          encryption: 'Quantum KEM-768 Sealed'
        },
        ...prev
      ]);
      showToast('New cryptographically signed sovereign snapshot successfully created.', 'success');
    }, 1000);
  };

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-950/80 border border-blue-700/60 rounded-xl text-blue-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Sovereign Cold Storage &amp; Disaster Recovery Snapshots</h3>
            <p className="text-xs text-slate-400">Air-gapped quantum-encrypted database state snapshots with zero foreign jurisdiction custody.</p>
          </div>
        </div>

        <button
          type="button"
          disabled={isCreating}
          onClick={handleCreateSnapshot}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isCreating ? 'animate-spin' : ''}`} />
          <span>{isCreating ? 'Creating Quantum Snapshot...' : 'Create Instant Snapshot'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {snapshots.map((snap) => (
          <div key={snap.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">{snap.id}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold font-mono">
                  {snap.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Region: {snap.region} &bull; Size: {snap.sizeMB} MB &bull; {snap.timestamp}
              </div>
              <div className="text-[11px] text-indigo-400 font-mono mt-0.5">
                {snap.encryption}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => showToast(`Initiating Zero-Downtime Hot Restore for ${snap.id}`, 'info')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Hot Restore
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackupAndRestore;
