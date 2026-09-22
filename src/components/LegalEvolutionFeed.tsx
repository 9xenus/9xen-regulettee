import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, RefreshCw, AlertCircle, Clock, CheckCircle2, AlertTriangle, ExternalLink, Download, Search } from 'lucide-react';
import { generatePdfExport } from '../utils/pdfGenerator';
import { ExportPdfDialog } from './ExportPdfDialog';

interface LegalUpdate {
  id: string | number;
  timestamp: string;
  law: string; // e.g., 'GDPR', 'CCPA'
  title: string;
  summary: string;
  change_type: 'UPDATE' | 'NEW' | 'DEPRECATED';
  details?: string;
  source_url?: string;
}

export const LegalEvolutionFeed: React.FC = () => {
  const [updates, setUpdates] = useState<LegalUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLaw, setSelectedLaw] = useState<string | null>(null);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);

  const fetchUpdates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithRetry('/api/v1/compliance/legal-updates');
      if (response.ok) {
        const data = await response.json();
        setUpdates(data.updates || []);
      } else {
        throw new Error('Failed to fetch legal updates from database');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error pulling updates');
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setError(null);
    try {
      const response = await fetchWithRetry('/api/v1/compliance/legal-updates/sync', {
        method: 'POST',
      });
      if (response.ok) {
        await fetchUpdates(); // Reload updates
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Synchronization failed');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error syncing latest laws');
    } finally {
      setSyncing(false);
    }
  };

  // Extract unique laws dynamically from results
  const uniqueLaws = Array.from(new Set(updates.map(u => u.law))).filter(Boolean);

  // Filter updates based on selected tag & search query
  const filteredUpdates = updates.filter(update => {
    const matchesLaw = !selectedLaw || update.law === selectedLaw;
    const searchLower = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery || 
      update.title.toLowerCase().includes(searchLower) ||
      update.summary.toLowerCase().includes(searchLower) ||
      update.law.toLowerCase().includes(searchLower) ||
      (update.details && update.details.toLowerCase().includes(searchLower));
    return matchesLaw && matchesQuery;
  });

  const handleExportPdf = () => {
    if (filteredUpdates.length === 0) return;
    const headers = ['Timestamp', 'Law', 'Title', 'Type', 'Summary'];
    const data = filteredUpdates.map(update => [
      new Date(update.timestamp).toLocaleString(),
      update.law,
      update.title,
      update.change_type,
      update.summary
    ]);
    const reportTitle = selectedLaw 
      ? `Sovereign Compliance Legal Evolution Feed Report - ${selectedLaw}` 
      : 'Sovereign Compliance Legal Evolution Feed Report';
    generatePdfExport(
      reportTitle,
      headers,
      data,
      selectedLaw ? `legal-evolution-report-${selectedLaw.toLowerCase().replace(/\s+/g, '-')}` : 'legal-evolution-report'
    );
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  return (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Legal Evolution Feed
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Automated tracking & policy syncing with EU/US laws</p>
        </div>
        <div className="flex items-center gap-2">
          {filteredUpdates.length > 0 && (
            <button
              onClick={() => setIsPdfDialogOpen(true)}
              disabled={loading}
              className="p-2 bg-white border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold text-slate-700"
              title="Download PDF Report of Law Changes"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF ({filteredUpdates.length})</span>
            </button>
          )}
          <button 
            onClick={triggerSync}
            disabled={syncing || loading}
            className={`p-2 bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold text-slate-700 ${syncing ? 'opacity-70 cursor-not-allowed' : ''}`}
            title="Trigger mechanized law updater scan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Laws'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      {!loading && updates.length > 0 && (
        <div className="mb-6 space-y-3.5 bg-slate-50/50 p-3.5 rounded-lg border border-slate-100">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search updates by keyword, law domain, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs text-slate-700 outline-none transition-all placeholder:text-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-base font-semibold px-1"
              >
                ×
              </button>
            )}
          </div>

          {/* Law Tag Selection */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Law Domain:</span>
            <button
              onClick={() => setSelectedLaw(null)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                !selectedLaw
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {uniqueLaws.map((law) => (
              <button
                key={law}
                onClick={() => setSelectedLaw(law)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedLaw === law
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {law}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-xs">Scanning sovereign frameworks...</span>
        </div>
      ) : updates.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs">No laws registered. Click Sync Laws to pull first update.</div>
      ) : filteredUpdates.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-slate-400 mx-auto mb-2" />
          No legal updates match your search filter or keyword.
        </div>
      ) : (
        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1.5 custom-scrollbar">
          {filteredUpdates.map((update) => (
            <motion.div 
              key={update.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-slate-100 bg-slate-50 hover:border-indigo-100 transition-colors"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    update.change_type === 'NEW' ? 'bg-emerald-100 text-emerald-800' : 
                    update.change_type === 'UPDATE' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {update.change_type}
                  </span>
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    {update.law}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  {new Date(update.timestamp).toLocaleString()}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{update.title}</h4>
              <p className="text-xs text-slate-600 mb-2 leading-relaxed">{update.summary}</p>
              
              {update.details && (
                <div className="mt-2 text-[10px] text-slate-500 bg-white border border-slate-100 rounded p-2 font-mono">
                  {(() => {
                    try {
                      // Attempt to parse if it looks like JSON, otherwise show as string
                      const detailsObj = update.details.startsWith('{') ? JSON.parse(update.details) : { info: update.details };
                      return Object.entries(detailsObj).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-slate-400 capitalize">{key}:</span>
                          <span className="text-slate-700 font-semibold">{String(value)}</span>
                        </div>
                      ));
                    } catch (e) {
                      return <div className="text-slate-700 whitespace-pre-wrap">{update.details}</div>;
                    }
                  })()}
                </div>
              )}

              {update.source_url && (
                <div className="mt-2.5 flex justify-end">
                  <a 
                    href={update.source_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                  >
                    View Official Law Page
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <ExportPdfDialog 
        isOpen={isPdfDialogOpen} 
        onClose={() => setIsPdfDialogOpen(false)} 
        title="Export Legal Evolution Feed PDF"
        onExport={handleExportPdf}
      />
    </div>
  );
};
