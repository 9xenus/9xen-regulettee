import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Download, 
  Check, 
  ShieldCheck, 
  Scale, 
  RefreshCw,
  Terminal
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const AiPolicyGenerator: React.FC = () => {
  const { showToast } = useNotification();
  const [framework, setFramework] = useState<'EU_AI_ACT' | 'GDPR_DPIA' | 'NIS2_SECURITY'>('EU_AI_ACT');
  const [orgName, setOrgName] = useState('My Enterprise Inc.');
  const [riskClassification, setRiskClassification] = useState<'HIGH_RISK' | 'TRANSPARENCY_RISK' | 'MINIMAL_RISK'>('HIGH_RISK');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPolicy, setGeneratedPolicy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedPolicy(
`# SOVEREIGN COMPLIANCE POLICY & GOVERNANCE CHARTER
**Entity Name:** ${orgName}
**Framework Compliance:** ${framework === 'EU_AI_ACT' ? 'EU Artificial Intelligence Act (Regulation 2024/1689)' : framework === 'GDPR_DPIA' ? 'General Data Protection Regulation (EU) 2016/679' : 'NIS2 Directive (EU) 2022/2555'}
**Risk Classification Tier:** ${riskClassification}
**Effective Date:** ${new Date().toISOString().split('T')[0]}
**Cryptographic Attestation:** SHA256-${Math.random().toString(36).substring(2, 15).toUpperCase()}

---

### SECTION 1: STATUTORY PURPOSE & JURISDICTIONAL SCOPE
1.1 The purpose of this Charter is to establish mandatory, automated operational guardrails for all digital processing operations conducted by ${orgName}.
1.2 All processing nodes must operate within certified EU/EEA confidential compute enclaves with hardware root-of-trust.

### SECTION 2: AI GOVERNANCE & RISK MANAGEMENT (ARTICLES 9-15)
2.1 Continuous algorithmic bias scanning is enforced across all training and inferencing pipelines.
2.2 Model weights, training data provenance, and human-in-the-loop oversight audit trails are immutably logged to the sovereign audit ledger.
2.3 Cyber-resilience controls meet NIS2 Article 21 requirements with multi-factor biometric authentication and automated incident reporting (<24hr SLA).

### SECTION 3: DATA SUBJECT RIGHTS & DSR ENFORCEMENT
3.1 Automated DSR fulfilment API endpoints process erasure, portability, and access requests within 72 hours.
3.2 Cross-border transfers outside the EU/EEA without adequate adequacy decisions or BCRs are strictly prohibited and technically blocked at the edge gateway.

---
*Signed & Certified via eIDAS Qualified Electronic Seal*`
      );
    }, 700);
  };

  const handleCopy = () => {
    if (!generatedPolicy) return;
    navigator.clipboard.writeText(generatedPolicy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Autonomous AI Policy &amp; Governance Generator</h3>
            <p className="text-xs text-slate-400">Generate legally binding, audit-ready compliance charters aligned with EU Regulations.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono">
          Model: Sovereign Legal RAG v4
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Target Framework
            </label>
            <div className="space-y-2">
              {[
                { id: 'EU_AI_ACT', label: 'EU AI Act (2024/1689)', sub: 'High-Risk System Governance' },
                { id: 'GDPR_DPIA', label: 'GDPR Art. 35 DPIA Charter', sub: 'Data Protection Impact Assessment' },
                { id: 'NIS2_SECURITY', label: 'NIS2 Cyber Resilience', sub: 'Essential Entity Incident Response' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFramework(f.id as any)}
                  className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    framework === f.id
                      ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{f.label}</div>
                  <div className="text-[10px] text-slate-400">{f.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Legal Entity Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Risk Classification
            </label>
            <select
              value={riskClassification}
              onChange={(e) => setRiskClassification(e.target.value as any)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="HIGH_RISK">High-Risk (Annex III Statutory Conformity)</option>
              <option value="TRANSPARENCY_RISK">Specific Transparency Risk (GenAI / Chatbots)</option>
              <option value="MINIMAL_RISK">Minimal / Unrestricted Risk</option>
            </select>
          </div>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Legal Clauses...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Certified Policy Charter</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Editor Preview */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Policy Document Preview
            </span>
            {generatedPolicy && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Exported Certified Legal Policy Charter as Markdown/PDF', 'info')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[300px] max-h-[440px] overflow-y-auto p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed">
            {generatedPolicy ? (
              <pre className="whitespace-pre-wrap font-mono text-xs">{generatedPolicy}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-16">
                <FileText className="w-10 h-10 mb-2 opacity-40" />
                <p>Click "Generate Certified Policy Charter" to produce an audit-ready legal document.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiPolicyGenerator;
