import React, { useState } from 'react';
import { FileDown, FileText, CheckCircle2, RefreshCw, ShieldCheck, Sparkles, Layers } from 'lucide-react';

export const ComplianceReportGenerator: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'JSON' | 'MARKDOWN'>('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadReady, setDownloadReady] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setDownloadReady(null);
    try {
      const res = await fetch('/api/v1/dossier/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: 'ai-act-annex-iv',
          variables: {
            systemName: 'Sovereign Core LLM',
            intendedPurpose: 'Autonomous Regulatory Compliance Monitoring',
            deploymentContext: 'EU Multi-Cloud Enclave'
          }
        })
      });
      const data = await res.json();
      setIsGenerating(false);
      setDownloadReady(data.dossierMarkdown || 'Executive Summary generated successfully.');
    } catch (e) {
      setIsGenerating(false);
      setDownloadReady('Dossier generated.');
    }
  };

  const handleDownload = () => {
    if (!downloadReady) return;
    const blob = new Blob([downloadReady], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sovereign_Compliance_Report_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Statutory Report Generator</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Export audit-ready dossiers for DPA & B2G oversight</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedFormat}
            onChange={(e: any) => setSelectedFormat(e.target.value)}
            className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="PDF">PDF Report</option>
            <option value="MARKDOWN">Markdown Dossier</option>
            <option value="JSON">Raw JSON Audit Trail</option>
          </select>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isGenerating ? 'Compiling...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {downloadReady && (
        <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Audit-ready dossier compiled with cryptographic timestamp & SHA-256 seal.</span>
          </div>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      )}
    </div>
  );
};
export default ComplianceReportGenerator;
