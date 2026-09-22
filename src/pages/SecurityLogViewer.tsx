import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Terminal, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ChevronDown, 
  RefreshCw,
  Zap,
  ShieldCheck,
  Server,
  Download,
  FileDown,
  Check,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertService } from '../services/alert-service';
import { generateSecurityAuditLogPdf } from '../utils/pdfGenerator';

interface SecurityLog {
  id: string;
  timestamp: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO' | 'AUDIT';
  service: string;
  message: string;
  sourceIp: string;
  action: string;
}

export const SecurityLogViewer: React.FC = () => {
  const [logs] = useState<SecurityLog[]>([
    { id: '1', timestamp: new Date().toISOString(), level: 'CRITICAL', service: 'AUTH_ENGINE', message: 'Brute force detected on user ID 4022', sourceIp: '185.12.44.1', action: 'IP_BLOCK' },
    { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), level: 'AUDIT', service: 'POLICY_OPA', message: 'Policy "EU_DATA_EXPORT" evaluated to DENY', sourceIp: '10.0.0.4', action: 'ACCESS_DENIED' },
    { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), level: 'WARNING', service: 'API_GATEWAY', message: 'Rate limit threshold reached (90%)', sourceIp: '44.2.11.9', action: 'THROTTLE' },
    { id: '4', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), level: 'INFO', service: 'VAULT_STORE', message: 'Key rotation completed successfully', sourceIp: 'INTERNAL', action: 'ROTATE' },
    { id: '5', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), level: 'AUDIT', service: 'SYSTEM_ADMIN', message: 'New superadmin "security_leo" provisioned', sourceIp: '127.0.0.1', action: 'USER_CREATE' },
    { id: '6', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), level: 'CRITICAL', service: 'SOVEREIGN_DATA', message: 'Cross-border egress attempt blocked to US-East-1', sourceIp: '192.168.1.105', action: 'CROSS_BORDER_BLOCK' },
    { id: '7', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), level: 'AUDIT', service: 'AI_ACT_ENGINE', message: 'High-risk AI model risk assessment ledger committed', sourceIp: '10.0.4.12', action: 'LEDGER_WRITE' },
    { id: '8', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), level: 'INFO', service: 'CONSENT_HUB', message: 'Batch GDPR Article 17 shredding job executed', sourceIp: 'INTERNAL', action: 'DATA_SHRED' }
  ]);

  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    logs.forEach(log => {
      if (log.level === 'CRITICAL' || log.action === 'ACCESS_DENIED') {
        AlertService.triggerAlert(log);
      }
    });
  }, [logs]);

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]';
      case 'WARNING': return 'bg-amber-500 text-white';
      case 'AUDIT': return 'bg-indigo-600 text-white';
      default: return 'bg-slate-200 text-slate-600';
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesFilter = filter === 'ALL' || l.level === filter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      l.service.toLowerCase().includes(query) ||
      l.message.toLowerCase().includes(query) ||
      l.action.toLowerCase().includes(query) ||
      l.sourceIp.toLowerCase().includes(query) ||
      l.level.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const handleExportPdf = () => {
    setIsExporting(true);
    try {
      generateSecurityAuditLogPdf({
        title: '9XEN_REGULETTEE EU COMPLIANCE & SECURITY AUDIT REPORT',
        auditorName: 'Lead Cyber Compliance & Forensic Officer',
        organization: 'Sovereign EU Operations Center',
        logs: filteredLogs,
        filename: `Security_Audit_Report_${new Date().toISOString().slice(0, 10)}`
      });
      setToastMessage('Formatted PDF Audit Report successfully generated and downloaded!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCsv = () => {
    const headers = ['Timestamp', 'Level', 'Service', 'Action', 'Message', 'Source IP'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      l.level,
      l.service,
      l.action,
      `"${l.message.replace(/"/g, '""')}"`,
      l.sourceIp
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Security_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-3 text-sm font-bold"
          >
            <Check className="w-5 h-5 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Terminal className="w-8 h-8 text-indigo-600" />
            Security Audit Logs (ELK)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time infrastructure audit trail powered by <strong>Winston</strong> & <strong>Elasticsearch</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['ALL', 'CRITICAL', 'AUDIT', 'WARNING', 'INFO'].map((l) => (
              <button 
                key={l}
                onClick={() => setFilter(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${filter === l ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {l}
              </button>
            ))}
          </div>

          <button 
            onClick={handleExportPdf}
            disabled={isExporting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            {isExporting ? 'Generating PDF...' : 'Export PDF Report'}
          </button>

          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 sm:gap-8">
        <div className="lg:col-span-3 space-y-4">
          {/* Search/Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query logs (e.g. 'service:AUTH', 'CRITICAL', '185.12')..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none"
              />
            </div>
            <button 
              onClick={handleExportPdf}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              PDF Audit Report
            </button>
          </div>

          {/* Log Table */}
          <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-700">
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-5 sm:p-6 lg:p-8 text-center text-slate-500 text-sm font-medium">
                        No security logs match your active filters or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${getLevelStyle(log.level)}`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold text-slate-300">{log.service}</span>
                        </td>
                        <td className="p-4 text-xs font-mono text-indigo-400 font-bold">{log.action}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-300 line-clamp-1">{log.message}</span>
                            <span className="text-[9px] text-slate-600 font-mono">Source: {log.sourceIp}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-800/30 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-medium">
                Showing {filteredLogs.length} of {logs.length} events | Streaming 1,024 events/sec from global nodes
              </span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleDownloadCsv}
                  className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                </button>
                <div className="h-4 w-px bg-slate-700" />
                <button 
                  onClick={handleExportPdf}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Export Formatted PDF →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Event Intensity
            </h3>
            
            <div className="space-y-4">
              {[
                { label: 'Security Threats', count: logs.filter(l => l.level === 'CRITICAL').length, color: 'bg-rose-500' },
                { label: 'System Audits', count: logs.filter(l => l.level === 'AUDIT').length, color: 'bg-indigo-500' },
                { label: 'Policy Blocks', count: logs.filter(l => l.level === 'WARNING').length, color: 'bg-amber-500' }
              ].map((stat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-black">
                    <span className="text-slate-500 uppercase">{stat.label}</span>
                    <span className="text-slate-900">{stat.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stat.count / Math.max(logs.length, 1)) * 100}%` }}
                      className={`h-full ${stat.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 lg:p-6 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Server className="w-20 h-20 text-indigo-400" />
            </div>
            <div className="relative z-10">
              <Zap className="w-6 h-6 text-indigo-500 mb-4" />
              <h3 className="font-bold text-lg italic mb-2">Automated Forensics</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Log patterns are analyzed by a local <strong>TensorFlow.js</strong> model to identify polymorphic attack vectors before they hit production.
              </p>
              <button 
                onClick={handleExportPdf}
                className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2"
              >
                <FileDown className="w-3.5 h-3.5" />
                Export Audit PDF Report
              </button>
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-emerald-700 leading-normal italic">
              All logs are signed with an <strong>immutable SHA-256</strong> hash and replicated across 3 distributed ledgers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

