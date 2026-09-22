import React, { useState, useEffect } from 'react';
import { FileText, Download, Save, RotateCcw, RefreshCcw, Languages, Globe } from 'lucide-react';
import jsPDF from 'jspdf';
import { useLanguage } from '../context/LanguageContext';
import { useAuditLogger } from '../hooks/useAuditLogger';
import { useNotification } from '../context/NotificationContext';

const EU_LANGUAGES = [
  { code: 'bg', name: 'Bulgarian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'en', name: 'English' },
  { code: 'et', name: 'Estonian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'ga', name: 'Irish' },
  { code: 'it', name: 'Italian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'mt', name: 'Maltese' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ro', name: 'Romanian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'es', name: 'Spanish' },
  { code: 'sv', name: 'Swedish' },
];

interface DocumentFormData {
  companyName: string;
  dpoName: string;
  dpoEmail: string;
  companyAddress: string;
  effectiveDate: string;
  documentType: 'GDPR' | 'CCPA';
}

const DEFAULT_FORM_DATA: DocumentFormData = {
  companyName: '',
  dpoName: '',
  dpoEmail: '',
  companyAddress: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  documentType: 'GDPR',
};

const STORAGE_KEY = 'compliance_document_generator_autosave';

export const DocumentGenerator: React.FC = () => {
  const { showToast } = useNotification();
  const [formData, setFormData] = useState<DocumentFormData>(DEFAULT_FORM_DATA);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [targetTranslationLang, setTargetTranslationLang] = useState('fr');
  const [translatedDocText, setTranslatedDocText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const { translateDocument } = useLanguage();
  const { logAction } = useAuditLogger();

  // Clear translation on form edit so user knows to re-translate
  useEffect(() => {
    setTranslatedDocText(null);
  }, [formData]);

  const handleTranslate = async () => {
    const originalText = generateDocumentText();
    setIsTranslating(true);
    try {
      const response = await translateDocument(originalText, targetTranslationLang);
      if (response.success && response.translatedText) {
        setTranslatedDocText(response.translatedText);
        logAction('Translated Policy Document', 'DOCUMENT', { 
          targetLanguage: targetTranslationLang, 
          policyType: formData.documentType,
          company: formData.companyName 
        });
      } else {
        showToast(response.error || 'Failed to translate document. Please verify your connection.', 'error');
      }
    } catch (e: any) {
      console.error('Translation error:', e);
      showToast('An unexpected error occurred during translation.', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse saved document data:', e);
      }
    }
  }, []);

  // Save to localStorage whenever formData changes (with debounce)
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setSaveStatus('saved');
      
      // Reset status back to idle after a few seconds
      const idleTimer = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      return () => clearTimeout(idleTimer);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to discard your draft? This cannot be undone.')) {
      logAction('Discarded Policy Draft', 'DOCUMENT', { policyType: formData.documentType });
      setFormData(DEFAULT_FORM_DATA);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const generateDocumentText = () => {
    if (formData.documentType === 'GDPR') {
      return `PRIVACY POLICY (GDPR COMPLIANT)

Effective Date: ${formData.effectiveDate}

1. INTRODUCTION
Welcome to ${formData.companyName || '[Company Name]'}. We respect your privacy and are committed to protecting your personal data in compliance with the General Data Protection Regulation (GDPR).

2. DATA CONTROLLER
${formData.companyName || '[Company Name]'} is the controller responsible for your personal data.
Address: ${formData.companyAddress || '[Address]'}

3. DATA PROTECTION OFFICER (DPO)
If you have any questions about this privacy policy, including any requests to exercise your legal rights, please contact our DPO:
Name: ${formData.dpoName || '[DPO Name]'}
Email: ${formData.dpoEmail || '[DPO Email]'}

4. YOUR LEGAL RIGHTS
Under the GDPR, you have rights including:
- Request access to your personal data.
- Request correction of your personal data.
- Request erasure of your personal data.
- Object to processing of your personal data.
- Request restriction of processing your personal data.
- Request transfer of your personal data.
- Right to withdraw consent.

If you wish to exercise any of the rights set out above, please contact our DPO.`;
    } else {
      return `PRIVACY POLICY (CCPA COMPLIANT)

Effective Date: ${formData.effectiveDate}

1. INTRODUCTION
Welcome to ${formData.companyName || '[Company Name]'}. This privacy notice for California residents supplements the information contained in our general privacy policy and applies solely to all visitors, users, and others who reside in the State of California. We adopt this notice to comply with the California Consumer Privacy Act of 2018 (CCPA).

2. BUSINESS CONTACT
${formData.companyName || '[Company Name]'}
Address: ${formData.companyAddress || '[Address]'}
Contact: ${formData.dpoName || '[Contact Name]'} (${formData.dpoEmail || '[Contact Email]'})

3. YOUR RIGHTS AND CHOICES
The CCPA provides consumers (California residents) with specific rights regarding their personal information.
- Right to Know: You have the right to request that we disclose certain information to you about our collection and use of your personal information over the past 12 months.
- Right to Delete: You have the right to request that we delete any of your personal information that we collected from you and retained, subject to certain exceptions.
- Right to Opt-Out: You have the right to direct us to not sell your personal information.

To exercise your rights, please submit a verifiable consumer request to the contact information provided above.`;
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const text = translatedDocText || generateDocumentText();
    
    // Split text to fit PDF width
    const lines = doc.splitTextToSize(text, 180);
    
    doc.text(lines, 15, 20);
    const suffix = translatedDocText ? `_translated_${targetTranslationLang.toUpperCase()}` : '';
    const fileName = `${formData.companyName || 'Draft'}_${formData.documentType}_Policy${suffix}.pdf`;
    doc.save(fileName);

    logAction('Downloaded Policy PDF', 'DOCUMENT', { 
      fileName, 
      policyType: formData.documentType,
      isTranslated: !!translatedDocText,
      targetLanguage: translatedDocText ? targetTranslationLang : 'EN'
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Automated Policy Generator
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fill in your organization's details to automatically draft GDPR or CCPA compliant privacy policies.
          </p>
        </div>
        
        {/* Auto-save indicator */}
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
              <RefreshCcw className="w-3 h-3 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md transition-opacity">
              <Save className="w-3 h-3" /> Saved to local storage
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
        {/* Form Column */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase">Policy Type</label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            >
              <option value="GDPR">GDPR Privacy Policy (EU)</option>
              <option value="CCPA">CCPA Privacy Notice (California)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase">Company Address</label>
            <input
              type="text"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              placeholder="e.g. 123 Tech Lane, Silicon Valley"
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase">DPO / Contact Name</label>
              <input
                type="text"
                name="dpoName"
                value={formData.dpoName}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase">Contact Email</label>
              <input
                type="email"
                name="dpoEmail"
                value={formData.dpoEmail}
                onChange={handleChange}
                placeholder="dpo@example.com"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase">Effective Date</label>
            <input
              type="date"
              name="effectiveDate"
              value={formData.effectiveDate}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDownloadPdf}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PDF Draft
            </button>
            <button
              onClick={handleReset}
              className="bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              title="Discard draft and clear auto-save"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Column */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase flex items-center gap-2">
              <span>Live Document Preview</span>
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[9px]">{formData.documentType}</span>
            </h3>
            {translatedDocText && (
              <button
                onClick={() => setTranslatedDocText(null)}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
              >
                Reset to Original (English)
              </button>
            )}
          </div>

          {/* Translation controls */}
          <div className="bg-white border border-slate-200/60 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Languages className="w-4 h-4 text-indigo-600" />
              <span>AI Legal Translation:</span>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <select
                value={targetTranslationLang}
                onChange={(e) => setTargetTranslationLang(e.target.value)}
                className="bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-xs focus:outline-none focus:border-indigo-500 flex-1 cursor-pointer font-medium"
                disabled={isTranslating}
              >
                {EU_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.code.toUpperCase()})
                  </option>
                ))}
              </select>
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer min-w-[100px] justify-center shadow-xs"
              >
                {isTranslating ? (
                  <>
                    <RefreshCcw className="w-3 h-3 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3" />
                    Translate
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 flex-1 overflow-y-auto min-h-[300px]">
            <pre className="font-sans text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              {translatedDocText || generateDocumentText()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
