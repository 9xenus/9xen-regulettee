import React, { useState, useEffect } from 'react';
import { FileCode, CheckCircle2, AlertTriangle, FileText, Upload, RefreshCw, Layers, ShieldCheck, Database } from 'lucide-react';

interface ParserRecord {
  id: string;
  filename: string;
  file_format: 'XBRL' | 'SAF_T' | 'EFILING_XML';
  jurisdiction: string;
  validation_status: 'PASSED' | 'WARNINGS' | 'FAILED';
  tax_or_fine_amount: number;
  parsed_data_json: string;
  validation_errors_json: string;
  parsed_at: string;
}

export const XmlParsersHub: React.FC = () => {
  const [fileFormat, setFileFormat] = useState<'XBRL' | 'SAF_T' | 'EFILING_XML'>('XBRL');
  const [filename, setFilename] = useState('regulatory_report_2025.xml');
  const [jurisdiction, setJurisdiction] = useState('EU');
  const [xmlContent, setXmlContent] = useState(`<?xml version="1.0" encoding="UTF-8"?>
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:ifrs="http://xbrl.ifrs.org/taxonomy/2025">
  <ifrs:Revenue contextRef="FY2025">14500000</ifrs:Revenue>
  <ifrs:OperatingIncome contextRef="FY2025">3200000</ifrs:OperatingIncome>
  <ifrs:DataProtectionFinesProvision contextRef="FY2025">450000</ifrs:DataProtectionFinesProvision>
</xbrli:xbrl>`);
  const [isParsing, setIsParsing] = useState(false);
  const [history, setHistory] = useState<ParserRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<ParserRecord | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/v1/b2g/parsers/history');
      const data = await res.json();
      if (data.success) {
        setHistory(data.records);
        if (data.records.length > 0 && !activeRecord) {
          setActiveRecord(data.records[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleParse = async () => {
    setIsParsing(true);
    try {
      const res = await fetch('/api/v1/b2g/parsers/parse-xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          file_format: fileFormat,
          raw_xml_content: xmlContent,
          jurisdiction
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveRecord(data.parserRecord);
        await fetchHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Government File Parsers (XBRL / SAF-T / e-Filing)</h3>
              <p className="text-xs text-slate-400">Standardized regulatory schema validation & automatic taxonomy metrics extraction</p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchHistory}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parser Input Form */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            Standardized XML File Ingestion
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Standard Scheme</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFileFormat('XBRL');
                    setFilename('xbrl_financial_report_2025.xml');
                  }}
                  className={`py-2 px-3 rounded-lg font-bold border transition-all cursor-pointer ${
                    fileFormat === 'XBRL' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  XBRL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFileFormat('SAF_T');
                    setFilename('saft_tax_audit_v2.xml');
                  }}
                  className={`py-2 px-3 rounded-lg font-bold border transition-all cursor-pointer ${
                    fileFormat === 'SAF_T' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  SAF-T Tax
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFileFormat('EFILING_XML');
                    setFilename('gov_efiling_declaration.xml');
                  }}
                  className={`py-2 px-3 rounded-lg font-bold border transition-all cursor-pointer ${
                    fileFormat === 'EFILING_XML' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  e-Filing
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Filename</label>
                <input
                  type="text"
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Jurisdiction</label>
                <select
                  value={jurisdiction}
                  onChange={e => setJurisdiction(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="EU">EU (ESMA/EBA)</option>
                  <option value="SA">KSA (ZATCA/SDAIA)</option>
                  <option value="US">USA (SEC EDGAR)</option>
                  <option value="DE">Germany (BfDI/Finanzamt)</option>
                  <option value="UAE">UAE (CBUAE/TDRA)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">XML Payload Content</label>
              <textarea
                rows={5}
                value={xmlContent}
                onChange={e => setXmlContent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-emerald-300 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleParse}
              disabled={isParsing}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isParsing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheckIcon className="w-4 h-4" />}
              <span>{isParsing ? 'Parsing Schema & Validating...' : 'Validate & Parse Schema'}</span>
            </button>
          </div>
        </div>

        {/* Output & Taxonomy Metrics */}
        <div className="lg:col-span-7 space-y-4">
          {activeRecord ? (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm text-white">{activeRecord.filename}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] rounded border border-emerald-500/20">
                    {activeRecord.file_format}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  activeRecord.validation_status === 'PASSED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {activeRecord.validation_status === 'PASSED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{activeRecord.validation_status}</span>
                </span>
              </div>

              {/* Metrics Grid */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Extracted Taxonomy Data</h5>
                <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-emerald-400 text-xs font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(typeof activeRecord.parsed_data_json === 'string' ? JSON.parse(activeRecord.parsed_data_json) : activeRecord.parsed_data_json, null, 2)}
                </pre>
              </div>

              {activeRecord.tax_or_fine_amount > 0 && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Calculated Tax / Compliance Reserve:</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    EUR {activeRecord.tax_or_fine_amount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Select or submit an XML file above to inspect extracted taxonomy tags and validation metrics.
            </div>
          )}

          {/* History List */}
          <div>
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Parsed Files History ({history.length})</span>
            </h5>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {history.map(item => (
                <div
                  key={item.id}
                  onClick={() => setActiveRecord(item)}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center justify-between ${
                    activeRecord?.id === item.id ? 'bg-slate-800 border-emerald-500/50 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.filename}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{item.file_format} • {item.validation_status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
