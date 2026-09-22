import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, X, Download, Calendar, Loader2, Sparkles } from 'lucide-react';

interface ExportPdfDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onExport?: (dateRange: string, format: string) => Promise<void> | void;
}

export const ExportPdfDialog: React.FC<ExportPdfDialogProps> = ({ 
  isOpen, 
  onClose,
  title = "Export PDF Report",
  onExport
}) => {
  const [dateRange, setDateRange] = useState('last30');
  const [format, setFormat] = useState('standard');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (onExport) {
        await onExport(dateRange, format);
      } else {
        // Simulate export delay if no callback
        await new Promise(res => setTimeout(res, 2000));
      }
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <h3 className="font-bold text-indigo-950 flex items-center">
                <FileText className="w-5 h-5 text-indigo-600 mr-2" />
                {title}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
              {/* Date Range Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setDateRange('last7')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${dateRange === 'last7' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Last 7 Days
                  </button>
                  <button 
                    onClick={() => setDateRange('last30')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${dateRange === 'last30' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Last 30 Days
                  </button>
                  <button 
                    onClick={() => setDateRange('quarter')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${dateRange === 'quarter' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    This Quarter
                  </button>
                  <button 
                    onClick={() => setDateRange('year')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${dateRange === 'year' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Year to Date
                  </button>
                </div>
              </div>

              {/* Format Preferences */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Format Preferences
                </label>
                <div className="space-y-2">
                  <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${format === 'standard' ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name="format" 
                      value="standard" 
                      checked={format === 'standard'} 
                      onChange={() => setFormat('standard')}
                      className="mt-1 flex-shrink-0 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-bold text-slate-800">Standard Summary</span>
                      <span className="block text-xs text-slate-500 mt-0.5">High-level metrics and key compliance gaps.</span>
                    </div>
                  </label>
                  <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${format === 'detailed' ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name="format" 
                      value="detailed" 
                      checked={format === 'detailed'} 
                      onChange={() => setFormat('detailed')}
                      className="mt-1 flex-shrink-0 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-bold text-slate-800">Detailed Audit Log</span>
                      <span className="block text-xs text-slate-500 mt-0.5">Comprehensive timeline including all technical evidence and raw logs.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-100 flex justify-end space-x-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center shadow-sm"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 mr-2" />
                    Export PDF
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
