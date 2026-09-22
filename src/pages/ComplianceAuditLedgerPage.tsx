import React, { useState } from 'react';
import { ComplianceAuditLedger } from '../components/ComplianceAuditLedger';
import { AuditIntegrityLedger } from '../components/dashboard/AuditIntegrityLedger';
import { ShieldCheck, History, Database } from 'lucide-react';

export const ComplianceAuditLedgerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'immudb' | 'operational'>('immudb');

  return (
    <div className="space-y-6">
      {/* Tab Controls */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('immudb')}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'immudb'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          ImmuDB Integrity Ledger
        </button>
        <button
          onClick={() => setActiveTab('operational')}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'operational'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Operational Audit Logs
        </button>
      </div>

      <div className="transition-all duration-300">
        {activeTab === 'immudb' ? (
          <AuditIntegrityLedger />
        ) : (
          <ComplianceAuditLedger />
        )}
      </div>
    </div>
  );
};
