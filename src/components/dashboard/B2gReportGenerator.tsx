import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search,
  Filter,
  BarChart3,
  Globe,
  Building2,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

interface Report {
  id: string;
  tenantId: string;
  tenantName: string;
  type: string;
  generatedAt: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  downloadUrl?: string;
}

export const B2gReportGenerator: React.FC = () => {
  const { showToast } = useNotification();
  const [reports, setReports] = useState<Report[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState('all');
  const [reportType, setReportType] = useState('GDPR_AUDIT');

  const mockTenants = [
    { id: 'org_1', name: 'Acme Corporation Europe' },
    { id: 'org_2', name: 'Stark Industries GmbH' },
    { id: 'org_3', name: 'Tyrell Bio-EU' },
    { id: 'org_4', name: 'Global Finance Corp' }
  ];

  useEffect(() => {
    // Mock initial reports
    setReports([
      { id: 'rep-001', tenantId: 'org_1', tenantName: 'Acme Corporation Europe', type: 'GDPR Annual Audit', generatedAt: '2026-06-15T10:00:00Z', status: 'COMPLETED', downloadUrl: '#' },
      { id: 'rep-002', tenantId: 'org_2', tenantName: 'Stark Industries GmbH', type: 'EU AI Act Conformity', generatedAt: '2026-07-01T14:30:00Z', status: 'COMPLETED', downloadUrl: '#' },
      { id: 'rep-003', tenantId: 'org_3', tenantName: 'Tyrell Bio-EU', type: 'NIS2 Security Baseline', generatedAt: '2026-07-05T09:15:00Z', status: 'COMPLETED', downloadUrl: '#' }
    ]);
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    showToast('Initiating regulatory report generation engine...', 'info');

    // Simulate API call to /api/v1/reporting/generate
    setTimeout(() => {
      const tenant = mockTenants.find(t => t.id === selectedTenant) || { name: 'All EU Tenants' };
      const newReport: Report = {
        id: `rep-${Math.floor(1000 + Math.random() * 9000)}`,
        tenantId: selectedTenant,
        tenantName: tenant.name,
        type: reportType.replace('_', ' '),
        generatedAt: new Date().toISOString(),
        status: 'COMPLETED',
        downloadUrl: '#'
      };

      setReports(prev => [newReport, ...prev]);
      setIsGenerating(false);
      showToast(`Regulatory report for ${tenant.name} generated successfully!`, 'success');
    }, 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Regulatory Report Generator
          </h3>
          <p className="text-xs text-slate-500 mt-1">Generate official compliance archives for B2G audit verification.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DuckDB Hybrid Engine Active</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Control Panel */}
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Configuration</h4>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Target Organization</label>
              <select 
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">All EU Region Tenants</option>
                {mockTenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Report Framework</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="GDPR_AUDIT">GDPR Compliance Audit (Art. 30)</option>
                <option value="AI_ACT_CONFORMITY">EU AI Act Technical Conformity</option>
                <option value="NIS2_SECURITY">NIS2 Cybersecurity Risk Report</option>
                <option value="DORA_RESILIENCY">DORA Operational Resiliency</option>
                <option value="DATA_PORTABILITY">Full Data Portability Export (Art. 20)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-900/10 flex items-center justify-center gap-2 text-xs"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compiling Data...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    <span>Generate Official Report</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700">
              <Sparkles className="w-4 h-4" />
              <h5 className="text-[11px] font-black uppercase tracking-tight">AI Insights Summary</h5>
            </div>
            <p className="text-[10px] text-indigo-900/70 leading-relaxed font-medium">
              Generating a report will utilize the **DuckDB Analytical Engine** to aggregate over 1.2M compliance events in real-time. The resulting document is cryptographically signed and eIDAS compliant.
            </p>
          </div>
        </div>

        {/* Reports List */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Generation History</h4>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter logs..."
                  className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[10px] outline-none w-32"
                />
              </div>
              <button className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-inner bg-slate-50/30">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Report Details</th>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Organization</th>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Date Generated</th>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-white transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{report.type}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{report.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                        <Building2 className="w-3 h-3" />
                        {report.tenantName}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <FileCheck className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-sm"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
            <p>Showing {reports.length} compliance artifacts</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                EU Region
              </span>
              <span className="flex items-center gap-1">
                <FileCheck className="w-3 h-3" />
                eIDAS Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
