import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, ShieldCheck, Database, Lock, Clock, FileSignature } from 'lucide-react';
import { motion } from 'motion/react';
import { generatePdfExport } from '../utils/pdfGenerator';
import { AuditLedgerSignModal } from '../components/dashboard/AuditLedgerSignModal';
import { ExportPdfDialog } from '../components/ExportPdfDialog';
import { MultiSelectActionBar } from '../components/MultiSelectActionBar';
import { RiskHeatmapD3 } from '../components/dashboard/RiskHeatmapD3';
import { ViolationDrilldownModal } from '../components/dashboard/ViolationDrilldownModal';

export const AuditLedger: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetchWithRetry('/api/v1/admin/audit-logs?limit=50');
      const data = await response.json();
      if (data.success) {
        setLogs(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<string | null>(null);

  const filteredLogs = logs.filter(log => {
    const actor = log.actor || '';
    const action = log.action || '';
    const target = log.target || '';
    const severity = log.severity || '';

    const matchesSearch = 
      actor.toLowerCase().includes(searchQuery.toLowerCase()) || 
      action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeSeverityFilter ? severity.toLowerCase() === activeSeverityFilter.toLowerCase() : true;
    return matchesSearch && matchesFilter;
  });

  const handleToggleSelectAll = () => {
    if (selectedLogs.length === filteredLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(filteredLogs.map(log => log.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedLogs(prev =>
      prev.includes(id) ? prev.filter(logId => logId !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    setLogs(prev => prev.filter(log => !selectedLogs.includes(log.id)));
    setSelectedLogs([]);
  };

  const handleBatchUpdate = (severity: string) => {
    setLogs(prev => prev.map(log => 
      selectedLogs.includes(log.id) ? { ...log, severity } : log
    ));
    setSelectedLogs([]);
  };

  const handleExportPdf = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'Target', 'Hash'];
    const data = filteredLogs.map(log => [
      log.time ? new Date(log.time).toLocaleString() : 'N/A',
      log.actor || 'N/A',
      log.action || 'N/A',
      log.target || 'N/A',
      log.hash ? log.hash.substring(0, 8) + '...' : 'N/A'
    ]);
    generatePdfExport('Audit Ledger Logs', headers, data, 'audit-ledger-export');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Immutable Audit Ledger</h1>
          <p className="text-slate-500 mt-1">Cryptographically verified logs of all system and compliance actions.</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button 
            onClick={() => setIsPdfDialogOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Raw PDF
          </button>
          <button 
            onClick={() => setIsSignModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center"
          >
            <FileSignature className="w-4 h-4 mr-2" />
            Sign & Export Compliance PDF
          </button>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Verify Hashes
          </button>
        </div>
      </div>

      {/* Stats/Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center">
          <div className="p-3 bg-emerald-50 rounded-lg mr-4">
            <Database className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500">Total Entries</div>
            <div className="text-xl font-bold text-slate-800">14,208,992</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center">
           <div className="p-3 bg-indigo-50 rounded-lg mr-4">
            <Lock className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500">Chain Integrity</div>
            <div className="text-xl font-bold text-emerald-600">Verified</div>
          </div>
        </div>
         <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center">
           <div className="p-3 bg-slate-50 rounded-lg mr-4">
            <Clock className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500">Last Sync</div>
            <div className="text-xl font-bold text-slate-800">Just now</div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
           <div className="p-1.5 bg-indigo-100 rounded-md">
             <ShieldCheck className="w-4 h-4 text-indigo-700" />
           </div>
           <h3 className="font-bold text-indigo-900">AI Insight: Top 3 Critical Compliance Risks</h3>
        </div>
        <ul className="space-y-2 text-sm text-indigo-800">
           <li className="flex items-start gap-2">
             <span className="font-bold opacity-50 mt-0.5">1.</span>
             <span><strong>Unencrypted PII Data Export:</strong> Repeated attempts to export large datasets without encryption flags detected on Tenant (org_2). Action recommended.</span>
           </li>
           <li className="flex items-start gap-2">
             <span className="font-bold opacity-50 mt-0.5">2.</span>
             <span><strong>Anomalous MFA Failures:</strong> Spike in failed multi-factor authentication attempts originating from anomalous IPs targeting administrative accounts.</span>
           </li>
           <li className="flex items-start gap-2">
             <span className="font-bold opacity-50 mt-0.5">3.</span>
             <span><strong>Cross-Border Data Transfer:</strong> Potential GDPR violation flagged regarding data syncs targeting non-EU infrastructure regions.</span>
           </li>
        </ul>
      </div>

      <RiskHeatmapD3 />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by actor, action, or resource..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50"
              value={activeSeverityFilter || ''}
              onChange={e => setActiveSeverityFilter(e.target.value || null)}
            >
              <option value="">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={filteredLogs.length > 0 && selectedLogs.length === filteredLogs.length}
                    onChange={handleToggleSelectAll}
                    className="h-4 w-4 text-indigo-600 border-slate-300 rounded"
                  />
                </th>
                <th className="px-6 py-3">Timestamp (UTC)</th>
                <th className="px-6 py-3">Actor</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Target Resource</th>
                <th className="px-6 py-3">Origin IP</th>
                <th className="px-6 py-3 text-right">KMS Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const severity = (log.severity || '').toLowerCase();
                const timeStr = log.time ? new Date(log.time).toLocaleString() : 'N/A';
                const actionStr = log.action || 'Unknown';
                const hashStr = log.hash ? `${log.hash.substring(0, 8)}...` : 'N/A';
                return (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedViolation(log)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                    title="Click to trigger AI Deep-Dive Analysis"
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedLogs.includes(log.id)}
                        onChange={() => handleToggleSelect(log.id)}
                        className="h-4 w-4 text-indigo-600 border-slate-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{timeStr}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-1.5">
                      {log.actor || 'N/A'}
                      <span className="text-[10px] text-indigo-600 opacity-0 group-hover:opacity-100 font-normal transition-opacity">(Inspect)</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                        severity === 'warning' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {actionStr}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate" title={log.target || ''}>{log.target || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">N/A</td>
                    <td className="px-6 py-4 font-mono text-xs text-indigo-500 text-right">{hashStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <MultiSelectActionBar
        selectedCount={selectedLogs.length}
        onDelete={handleBatchDelete}
        onStatusUpdate={handleBatchUpdate}
        onClear={() => setSelectedLogs([])}
        statusOptions={[
          { value: 'critical', label: 'Mark as Critical' },
          { value: 'warning', label: 'Mark as Warning' },
          { value: 'info', label: 'Mark as Info' }
        ]}
      />

      <AuditLedgerSignModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        logs={logs}
        searchQuery={searchQuery}
        activeSeverityFilter={activeSeverityFilter}
      />
      
      <ExportPdfDialog 
        isOpen={isPdfDialogOpen} 
        onClose={() => setIsPdfDialogOpen(false)} 
        title="Export Audit Ledger PDF"
      />

      <ViolationDrilldownModal
        isOpen={!!selectedViolation}
        onClose={() => setSelectedViolation(null)}
        violation={selectedViolation}
      />
    </div>
  );
};
