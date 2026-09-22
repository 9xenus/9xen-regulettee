import React, { useState } from "react";
import { 
  Search, Database, Fingerprint, ShieldAlert, FileCode2, Scale, 
  CheckCircle2, AlertTriangle, RefreshCw, Layers, Award, Terminal, 
  Sparkles, ExternalLink, Download, FileText, Lock
} from "lucide-react";

export function AiLineageForensics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModel, setActiveModel] = useState("Marketing-Gen-v4");
  const [isUnlearning, setIsUnlearning] = useState(false);
  const [unlearningCompleted, setUnlearningCompleted] = useState(false);
  const [c2paProbeInput, setC2paProbeInput] = useState("");
  const [c2paVerified, setC2paVerified] = useState<any>(null);
  const [isVerifyingC2pa, setIsVerifyingC2pa] = useState(false);

  const handleInitiateUnlearning = () => {
    setIsUnlearning(true);
    setUnlearningCompleted(false);
    setTimeout(() => {
      setIsUnlearning(false);
      setUnlearningCompleted(true);
    }, 2000);
  };

  const handleVerifyC2pa = () => {
    setIsVerifyingC2pa(true);
    setTimeout(() => {
      setIsVerifyingC2pa(false);
      setC2paVerified({
        manifestId: `C2PA-${Date.now().toString(36).toUpperCase()}`,
        status: "AUTHENTICATED",
        watermarkFound: true,
        generatorModel: "Gemini 3.7 Flash Sovereign Gateway",
        authorAuthority: "9Xen Regulettee Provenance Root CA",
        tamperEvident: true,
        euArt50Compliant: true,
        timestamp: new Date().toISOString()
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                AI Lineage Forensics & Data Provenance
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  EU AI Act Art. 53 & DSM Dir. Art. 4
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Trace training data origins, verify DSM text & data mining opt-outs, execute machine unlearning, and validate C2PA watermarks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-medium rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Marketing-Gen-v4">Marketing-Gen-v4 (LLM)</option>
              <option value="Resume-Ranker-v2">Resume-Ranker-v2 (Annex III High Risk)</option>
              <option value="Vision-Inspect-v1">Vision-Inspect-v1 (Multimodal)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Dataset Hash, Content SHA-256, URL Domain, or Copyright Claim ID..." 
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-xs text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Corpus Composition & Provenance Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                Training Corpus Composition & License Distribution
              </h3>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                Model: {activeModel}
              </span>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex h-3.5 rounded-full overflow-hidden mb-4 shadow-inner">
                  <div className="bg-emerald-500" style={{ width: '45%' }} title="Licensed Proprietary (45%)"></div>
                  <div className="bg-indigo-500" style={{ width: '35%' }} title="Public Domain / CC-0 (35%)"></div>
                  <div className="bg-rose-500" style={{ width: '20%' }} title="Scraped Web Corpus (20%)"></div>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="font-semibold text-slate-700">Licensed Proprietary Datasets</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">45% (1.2TB • 450B Tokens)</span>
                  </li>
                  <li className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                      <span className="font-semibold text-slate-700">Public Domain & Creative Commons Zero (CC-0)</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">35% (950GB • 350B Tokens)</span>
                  </li>
                  <li className="flex justify-between items-center text-xs p-2.5 bg-rose-50/60 rounded-xl border border-rose-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                      <span className="font-semibold text-rose-900">Unlicensed Web Scrapes (TDM Opt-Out Exposure)</span>
                    </div>
                    <span className="font-mono font-bold text-rose-600">20% (540GB • 200B Tokens)</span>
                  </li>
                </ul>
              </div>

              {/* TDM Compliance badge */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  EU DSM Directive Article 4 Compliance Notice
                </span>
                <p className="text-xs text-indigo-800">
                  Automated robots.txt and TDM-reservation metadata parsing verified across 18,400 data ingestion endpoints.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Merkle Provenance Root: 994f...882a</span>
            <button className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Export Lineage Manifest
            </button>
          </div>
        </div>

        {/* Right: IP Infringement Claims & Machine Unlearning */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                IP Infringement Claims & Selective Machine Unlearning
              </h3>
              <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                2 Active Alerts
              </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 border border-rose-200 bg-rose-50 rounded-xl space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-rose-600" />
                    <h4 className="font-bold text-xs text-rose-900">
                      Copyright Takedown: News Publisher Memorization
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                    CRITICAL
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Detected 4,200 verbatim memorized sentences matching copyrighted journalistic articles. Risk of statutory damages under copyright legislation.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button 
                    onClick={handleInitiateUnlearning}
                    disabled={isUnlearning}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isUnlearning ? 'animate-spin' : ''}`} />
                    {isUnlearning ? 'Executing Gradient Ascent Unlearning...' : 'Initiate Machine Unlearning'}
                  </button>
                  {unlearningCompleted && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Weights Nullified & Certified
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-slate-700" />
                    <h4 className="font-bold text-xs text-slate-900">
                      GPL-3.0 Copyleft Code Contamination
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                    MEDIUM
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Model generates code fragments resembling GPL-3.0 copyleft repositories. Automatic output similarity filter installed.
                </p>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Output Filter Active (Cosine Threshold 0.85)
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center font-mono">
            <span>Selective Unlearning Algorithm: Fisher Information Pruning</span>
          </div>
        </div>
      </div>

      {/* C2PA Provenance & Watermarking Verifier Sandbox */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-indigo-600" />
            C2PA Content Credentials & Synthetic Media Verifier
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Test any text snippet, synthetic code output, or media URL for tamper-evident cryptographic watermarking (Article 50).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-3">
            <textarea
              rows={3}
              value={c2paProbeInput}
              onChange={(e) => setC2paProbeInput(e.target.value)}
              placeholder="Paste generated response, media manifest URI, or cryptographic hash to verify..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
            <button
              onClick={handleVerifyC2pa}
              disabled={isVerifyingC2pa}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              {isVerifyingC2pa ? 'Verifying C2PA Signature...' : 'Validate C2PA Credentials'}
            </button>
          </div>

          <div className="lg:col-span-6">
            {c2paVerified ? (
              <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> C2PA v1.3 SIGNATURE VERIFIED
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    Art. 50 Compliant
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] space-y-1 pt-1">
                  <div><strong>Manifest:</strong> {c2paVerified.manifestId}</div>
                  <div><strong>Issuer:</strong> {c2paVerified.authorAuthority}</div>
                  <div><strong>Model:</strong> {c2paVerified.generatorModel}</div>
                  <div><strong>Timestamp:</strong> {c2paVerified.timestamp}</div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 text-center">
                Paste content and click Validate to inspect cryptographic assertions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default AiLineageForensics;
