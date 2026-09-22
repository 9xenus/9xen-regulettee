import React, { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  CheckSquare,
  Download,
  Clock,
  FileCheck,
  Copy,
  Check,
  Shield,
  Layers,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  BookOpen
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface NarrativeDraft {
  id: string;
  documentType: string;
  title: string;
  summary: string;
  content: string;
  jurisdiction: string;
  createdAt: string;
  engine: 'gemini-3.8-flash' | 'sovereign-rule-engine';
  confidenceScore: number;
  statutoryCitations: string[];
}

export function RegulatoryNarrativeGenerator() {
  const [documentType, setDocumentType] = useState("Data Protection Impact Assessment (DPIA)");
  const [jurisdiction, setJurisdiction] = useState("European Union (GDPR / EU AI Act)");
  const [context, setContext] = useState(
    "Generating a DPIA for the new 'VoicePrint' biometric authentication feature in the consumer mobile app, targeting UK and EU markets."
  );
  const [autoCite, setAutoCite] = useState(true);
  const [sensitivityLevel, setSensitivityLevel] = useState("High-Risk Biometric / AI (Annex III)");

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDraft, setActiveDraft] = useState<NarrativeDraft | null>(null);
  const [drafts, setDrafts] = useState<NarrativeDraft[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/v1/narrative/drafts');
      const data = await res.json();
      if (data.success && Array.isArray(data.drafts)) {
        setDrafts(data.drafts);
        if (data.drafts.length > 0 && !activeDraft) {
          setActiveDraft(data.drafts[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load drafts:', err);
    }
  };

  const handleGenerate = async () => {
    if (!context.trim()) {
      setError("Please describe the system context or target architecture.");
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/v1/narrative/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          jurisdiction,
          context,
          autoCite,
          sensitivityLevel
        })
      });

      const data = await res.json();
      if (data.success && data.draft) {
        setActiveDraft(data.draft);
        setDrafts(prev => [data.draft, ...prev]);
      } else {
        setError(data.error || "Failed to generate narrative draft.");
      }
    } catch (err: any) {
      setError(err.message || "Network error while synthesizing draft.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!activeDraft) return;
    navigator.clipboard.writeText(activeDraft.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = (format: 'md' | 'json') => {
    if (!activeDraft) return;
    const blob = new Blob(
      [format === 'json' ? JSON.stringify(activeDraft, null, 2) : activeDraft.content],
      { type: format === 'json' ? 'application/json' : 'text/markdown' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDraft.id.toLowerCase()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <FileText className="w-7 h-7 text-indigo-600" />
            Regulatory Narrative & Legal Synthesis Engine
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Server-side AI-assisted statutory drafting for compliance disclosures, DPIAs, RoPAs, and EU AI Act conformity declarations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Gemini 3.8 Flash & Sovereign Fallback
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Form & Drafting Parameters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Generate New Document
            </h2>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
              >
                <option>Data Protection Impact Assessment (DPIA)</option>
                <option>EU AI Act Conformity Declaration (Annex III)</option>
                <option>SEC Cybersecurity Incident Disclosure (Form 8-K)</option>
                <option>Record of Processing Activities (RoPA) Extract</option>
                <option>DORA ICT Fallback Resilience Audit</option>
                <option>California CPRA Consumer Privacy Notice Update</option>
                <option>NIS2 Critical Operator Security Certification</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Legal Jurisdiction
              </label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
              >
                <option>European Union (GDPR / EU AI Act)</option>
                <option>Federal Republic of Germany (BfDI / BaFin DORA)</option>
                <option>France (CNIL / ANSSI)</option>
                <option>United States (SEC Item 1.05 / CISA)</option>
                <option>California (CPRA / CCPA)</option>
                <option>United Kingdom (UK GDPR / DPA 2018)</option>
                <option>Cross-Border Multi-Region (EU-US Data Privacy Framework)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Risk & Sensitivity Tier
              </label>
              <select
                value={sensitivityLevel}
                onChange={(e) => setSensitivityLevel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
              >
                <option>High-Risk Biometric / AI (Annex III)</option>
                <option>Confidential Customer PII & Financial Data</option>
                <option>Critical Banking Infrastructure (DORA Tier 1)</option>
                <option>Standard Enterprise Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                System Context & Architecture Description
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs bg-slate-50 min-h-[90px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-sans"
                placeholder="Describe the target system, user telemetry, biometric vectors, or cloud infrastructure..."
              />
            </div>

            <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-100 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="autocite-toggle"
                checked={autoCite}
                onChange={(e) => setAutoCite(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="autocite-toggle" className="text-xs text-indigo-900 cursor-pointer">
                <span className="font-semibold block">Auto-Cite Statutory Articles</span>
                <span className="text-[11px] text-indigo-700 leading-tight block mt-0.5">
                  Injects explicit citations (e.g., GDPR Art. 35, EU AI Act Art. 14, DORA Art. 30).
                </span>
              </label>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-semibold text-xs shadow-sm transition-all flex justify-center items-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Synthesizing Statutory Narrative...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Statutory Draft
                </>
              )}
            </button>
          </div>

          {/* Recent Drafts List */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Recent Drafts ({drafts.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setActiveDraft(d)}
                  className={`p-3 cursor-pointer transition-colors ${
                    activeDraft?.id === d.id ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 truncate">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{d.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{d.summary}</p>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-indigo-600 uppercase">
                      {d.engine === 'gemini-3.8-flash' ? 'Gemini 3.8' : 'Rule Engine'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Document Viewer & Exporter */}
        <div className="lg:col-span-2 space-y-4">
          {activeDraft ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
              {/* Document Header Bar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap justify-between items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-100 text-indigo-700">
                      {activeDraft.documentType}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 text-emerald-800">
                      Score: {activeDraft.confidenceScore}% Conformance
                    </span>
                  </div>
                  <h2 className="text-base font-black text-slate-900">{activeDraft.title}</h2>
                  <p className="text-xs text-slate-500">
                    Jurisdiction: <strong className="text-slate-700">{activeDraft.jurisdiction}</strong> | ID: {activeDraft.id}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => handleDownload('md')}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" /> Markdown
                  </button>
                  <button
                    onClick={() => handleDownload('json')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> JSON Audit
                  </button>
                </div>
              </div>

              {/* Citations Bar */}
              {activeDraft.statutoryCitations && activeDraft.statutoryCitations.length > 0 && (
                <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Statutory Citations:
                  </span>
                  {activeDraft.statutoryCitations.map((cite, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700"
                    >
                      {cite}
                    </span>
                  ))}
                </div>
              )}

              {/* Markdown Render Area */}
              <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-sm leading-relaxed prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap font-sans">
                  <ReactMarkdown>{activeDraft.content}</ReactMarkdown>
                </div>
              </div>

              {/* Attestation Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Sovereign Compliance Vault Sealed & Immutably Anchored</span>
                </div>
                <div className="font-mono text-[11px]">
                  Generated: {new Date(activeDraft.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm min-h-[400px] flex flex-col justify-center items-center">
              <FileText className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No Draft Selected</h3>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Select an existing draft from the list on the left or generate a new statutory narrative document.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
