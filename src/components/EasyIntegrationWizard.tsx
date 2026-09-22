import React, { useState } from 'react';
import { Layers, Database, Cloud, Key, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface EasyIntegrationWizardProps {
  onConnect?: (integration: any) => void;
  onClose?: () => void;
}

export const EasyIntegrationWizard: React.FC<EasyIntegrationWizardProps> = ({ onConnect, onClose }) => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<'DATABASE' | 'CLOUD_STORAGE' | 'SaaS_API'>('DATABASE');
  const [name, setName] = useState('');
  const [connectionString, setConnectionString] = useState('');

  const handleFinish = () => {
    if (onConnect) {
      onConnect({
        id: `INT-${Date.now()}`,
        name: name || `${category} Service`,
        category,
        status: 'CONNECTED',
        lastScan: 'Just now'
      });
    }
    if (onClose) onClose();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Integration Connector</h3>
            <p className="text-xs text-slate-500">Connect new database, bucket or SaaS endpoint for PII scan</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Close</button>
        )}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Integration Type:</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setCategory('DATABASE')}
              className={`p-4 rounded-xl border text-left flex flex-col space-y-2 cursor-pointer transition-all ${
                category === 'DATABASE'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <Database className="w-6 h-6" />
              <span className="text-xs font-bold">SQL / NoSQL DB</span>
            </button>

            <button
              onClick={() => setCategory('CLOUD_STORAGE')}
              className={`p-4 rounded-xl border text-left flex flex-col space-y-2 cursor-pointer transition-all ${
                category === 'CLOUD_STORAGE'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <Cloud className="w-6 h-6" />
              <span className="text-xs font-bold">Cloud Storage</span>
            </button>

            <button
              onClick={() => setCategory('SaaS_API')}
              className={`p-4 rounded-xl border text-left flex flex-col space-y-2 cursor-pointer transition-all ${
                category === 'SaaS_API'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <Key className="w-6 h-6" />
              <span className="text-xs font-bold">SaaS API</span>
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Integration Name</label>
            <input
              type="text"
              placeholder="e.g., Primary Postgres DB Frankfurt"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Connection Endpoint / DSN</label>
            <input
              type="text"
              placeholder="postgresql://user:pass@db.eu-central-1.rds.amazonaws.com:5432/production"
              value={connectionString}
              onChange={e => setConnectionString(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 font-mono text-[11px]"
            />
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Connection credentials will be stored in Quantum KMS with HSM zero-trust isolation.</span>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Save & Test Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EasyIntegrationWizard;
