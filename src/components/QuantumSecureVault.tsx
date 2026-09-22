import React, { useState, useEffect, useCallback } from 'react';
import { Lock, ShieldCheck, RefreshCw, Key } from 'lucide-react';
import { PqcVaultService } from '../services/quantum/pqc-vault';
import { MfaModal } from './MfaModal';
import { QuantumAuditLog } from './QuantumAuditLog';
import { RecoveryKeyModal } from './RecoveryKeyModal';
import { AuditSchedule } from './AuditSchedule';
import { KeyRotationLog } from '../types';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const QuantumSecureVault: React.FC = () => {
  const [data, setData] = useState('');
  const [encrypted, setEncrypted] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMfaOpen, setIsMfaOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [rotationTimer, setRotationTimer] = useState(60);
  const [logs, setLogs] = useState<KeyRotationLog[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRotationTimer((prev) => {
        if (prev <= 1) {
          handleRotate('automated');
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRotate = useCallback((type: 'manual' | 'automated') => {
    setLogs((prev) => [
      {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        actor: type === 'manual' ? 'Admin' : 'System',
        type,
      },
      ...prev,
    ]);
  }, []);

  const handleSecure = async () => {
    setLoading(true);
    try {
      const result = await PqcVaultService.encrypt(data);
      setEncrypted(result);
    } catch (error) {
      console.error("Encryption failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForceRotation = () => {
    handleRotate('manual');
  };

  const handleGenerateRecovery = () => {
    setRecoveryKey(PqcVaultService.generateRecoveryKey());
    setIsRecoveryOpen(true);
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Lock className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Quantum Secure Vault</h2>
            <p className="text-sm text-slate-500">PQC-compliant sensitive data protection.</p>
            <p className="text-xs text-indigo-600 font-mono mt-1">Next rotation: {rotationTimer}s</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateRecovery}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-100"
          >
            <Key className="w-3 h-3" /> Recovery
          </button>
          <button
            onClick={() => setIsMfaOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"
          >
            <RefreshCw className="w-3 h-3" /> Force Rotation
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Enter sensitive document content..."
          className="w-full p-3 border border-slate-300 rounded-lg text-sm"
          rows={4}
        />
        
        <button 
          onClick={handleSecure}
          disabled={loading || !data}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Encrypting...' : <><ShieldCheck className="w-4 h-4" /> Secure with PQC</>}
        </button>

        {encrypted && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Encrypted Vault Output:</h4>
            <code className="text-xs font-mono break-all text-slate-700">{encrypted}</code>
          </div>
        )}
      </div>

      <MfaModal
        isOpen={isMfaOpen}
        onClose={() => setIsMfaOpen(false)}
        onConfirm={handleForceRotation}
      />
      
      <RecoveryKeyModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        recoveryKey={recoveryKey}
      />
      
      <AuditSchedule />
      
      <QuantumAuditLog logs={logs} />
    </div>
  );
};
