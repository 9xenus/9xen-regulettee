import React, { useState } from 'react';
import { FileText, CheckCircle2, ChevronRight, ChevronLeft, ShieldCheck, Download, Sparkles, Copy } from 'lucide-react';

interface PrivacyPolicyWizardProps {
  onSavePolicy?: (policyText: string) => void;
  onSyncPolicy?: (generated: { title: string; applicableLaw: string; content: string }) => void;
  initialWebsiteUrl?: string;
  initialBusinessLocation?: string;
  onClose?: () => void;
}

export const PrivacyPolicyWizard: React.FC<PrivacyPolicyWizardProps> = ({ 
  onSavePolicy, 
  onSyncPolicy,
  initialWebsiteUrl,
  initialBusinessLocation,
  onClose 
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: 'Acme Corp EU',
    contactEmail: 'privacy@acme.eu',
    dpoName: 'Jean Dupont',
    dpoEmail: 'dpo@acme.eu',
    dataTypes: ['Email', 'IP Address', 'Cookies', 'Payment Details'],
    retentionYears: '3',
    thirdPartySharing: true,
    dataLoc: 'EU_FRANKFURT'
  });

  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const policy = `PRIVACY STATEMENT & DATA PROTECTION POLICY
Entity: ${formData.companyName}
Contact Email: ${formData.contactEmail}
Data Protection Officer: ${formData.dpoName} (${formData.dpoEmail})
Jurisdiction: European Union (GDPR Article 13/14 Compliant)

1. CATEGORIES OF PERSONAL DATA PROCESSED
We process the following categories of data under GDPR Article 6(1)(f) and Article 6(1)(b):
${formData.dataTypes.map(d => `- ${d}`).join('\n')}

2. DATA STORAGE & SOVEREIGNTY
All personal records are encrypted at rest (AES-256-GCM) and hosted in designated EU Cloud Regions: ${formData.dataLoc}.
Standard retention period: ${formData.retentionYears} years post account termination.

3. DATA SUBJECT RIGHTS (GDPR CHAPTER III)
Data subjects reserve full rights to request Access, Rectification, Erasure (Right to be Forgotten), Restriction, and Data Portability by contacting ${formData.dpoEmail}.

Generated via 9XEN Regulettee Legal Policy Generator.`;
    setGeneratedText(policy);
    setStep(3);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">GDPR Privacy Policy Wizard</h3>
            <p className="text-xs text-slate-500">Step {step} of 3: AI-Assisted Policy Generator</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
        )}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Company / Entity Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Contact Email</label>
              <input
                type="text"
                value={formData.contactEmail}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">DPO Full Name</label>
              <input
                type="text"
                value={formData.dpoName}
                onChange={e => setFormData({ ...formData, dpoName: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">DPO Direct Email</label>
              <input
                type="text"
                value={formData.dpoEmail}
                onChange={e => setFormData({ ...formData, dpoEmail: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Data Storage Region</label>
              <select
                value={formData.dataLoc}
                onChange={e => setFormData({ ...formData, dataLoc: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
              >
                <option value="EU_FRANKFURT">Frankfurt, Germany (AWS/GCP)</option>
                <option value="EU_PARIS">Paris, France (OVHcloud)</option>
                <option value="EU_AMSTERDAM">Amsterdam, Netherlands (Equinix)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Retention Period (Years)</label>
              <input
                type="number"
                value={formData.retentionYears}
                onChange={e => setFormData({ ...formData, retentionYears: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              Generate Policy <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-auto max-h-60 leading-relaxed">
            <pre className="whitespace-pre-wrap">{generatedText}</pre>
          </div>
          <div className="flex justify-between items-center text-xs">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied to Clipboard!' : 'Copy Policy'}
            </button>

            <button
              onClick={() => {
                if (onSavePolicy) onSavePolicy(generatedText);
                if (onSyncPolicy) onSyncPolicy({ title: 'GDPR Privacy Policy Statement', applicableLaw: 'GDPR Chapter III', content: generatedText });
                if (onClose) onClose();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Save to Portal Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicyWizard;
