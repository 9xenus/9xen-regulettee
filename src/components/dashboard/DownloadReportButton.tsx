import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown, Check, Loader2 } from 'lucide-react';
import { ComplianceReportData, exportComplianceToCSV, exportComplianceToPDF } from '../../utils/complianceExport';
import { useNotification } from '../../context/NotificationContext';

interface DownloadReportButtonProps {
  data: ComplianceReportData;
  className?: string;
  buttonId?: string;
  variant?: 'primary' | 'secondary' | 'emerald';
}

export const DownloadReportButton: React.FC<DownloadReportButtonProps> = ({
  data,
  className = '',
  buttonId = 'download-compliance-report-btn',
  variant = 'emerald',
}) => {
  const { showToast } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<'pdf' | 'csv' | null>(null);
  const [lastExported, setLastExported] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleExportPDF = async () => {
    try {
      setIsExporting('pdf');
      await exportComplianceToPDF(data);
      setLastExported('PDF');
      setIsOpen(false);
      setTimeout(() => setLastExported(null), 3000);
    } catch (err) {
      console.error('Failed to export compliance PDF', err);
      showToast('Failed to generate PDF report. Please try again.', 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportCSV = () => {
    try {
      setIsExporting('csv');
      exportComplianceToCSV(data);
      setLastExported('CSV');
      setIsOpen(false);
      setTimeout(() => setLastExported(null), 3000);
    } catch (err) {
      console.error('Failed to export compliance CSV', err);
      showToast('Failed to generate CSV report. Please try again.', 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs border-indigo-500';
      case 'secondary':
        return 'bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-xs border-slate-700';
      case 'emerald':
      default:
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs border-emerald-500';
    }
  };

  return (
    <div className={`relative inline-flex rounded-xl shadow-xs ${className}`} ref={dropdownRef}>
      {/* Primary Action Button */}
      <button
        id={buttonId}
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        disabled={isExporting !== null}
        className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-l-xl transition-all duration-150 cursor-pointer disabled:opacity-60 border-y border-l ${getVariantStyles()}`}
        title="Download Client-Side Compliance Report (CSV or PDF)"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : lastExported ? (
          <Check className="w-4 h-4 text-emerald-200" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>
          {isExporting
            ? `Exporting ${isExporting.toUpperCase()}...`
            : lastExported
            ? `Exported ${lastExported}!`
            : 'Download Report'}
        </span>
      </button>

      {/* Dropdown Toggle Trigger */}
      <button
        type="button"
        id={`${buttonId}-dropdown-toggle`}
        onClick={() => setIsOpen(prev => !prev)}
        disabled={isExporting !== null}
        className={`px-2 py-2 text-xs font-bold rounded-r-xl border-y border-r transition-all duration-150 cursor-pointer disabled:opacity-60 border-l border-white/20 ${getVariantStyles()}`}
        aria-expanded={isOpen}
        aria-label="Select export format"
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Format Selection Menu */}
      {isOpen && (
        <div
          id={`${buttonId}-menu`}
          className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1"
        >
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Select Export Format
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Client-side compliance audit generation
            </p>
          </div>

          <div className="py-1">
            <button
              id={`${buttonId}-pdf-btn`}
              type="button"
              onClick={handleExportPDF}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50 mt-0.5 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    PDF Document (.pdf)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
                    Official
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Structured attestation with KPI summary, mandate breakdown & audit tables.
                </p>
              </div>
            </button>

            <button
              id={`${buttonId}-csv-btn`}
              type="button"
              onClick={handleExportCSV}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 mt-0.5 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    CSV Spreadsheet (.csv)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold">
                    Data
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Tabular CSV formatted for Excel, regulatory ingestors & spreadsheet tools.
                </p>
              </div>
            </button>
          </div>

          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Score: {data.overallScore}%</span>
            <span>Zero Server Egress</span>
          </div>
        </div>
      )}
    </div>
  );
};
