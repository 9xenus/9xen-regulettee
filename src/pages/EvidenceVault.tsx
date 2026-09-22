import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { 
  FileText, UploadCloud, Link as LinkIcon, ShieldCheck, 
  CheckCircle2, AlertTriangle, FileUp, Loader2, Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Soc2EvidenceGenerator } from '../components/Soc2EvidenceGenerator';

export const EvidenceVault: React.FC = () => {
  const { showToast } = useNotification();
  const [uploadType, setUploadType] = useState<'FILE' | 'URL'>('FILE');
  const [control, setControl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [evidenceList, setEvidenceList] = useState([
    { id: 'ev1', control: 'GDPR Article 28 - DPA', type: 'FILE', value: 'signed-dpa-aws.pdf', date: '2026-06-16', status: 'Verified' },
    { id: 'ev2', control: 'NIS2 - Incident Response', type: 'URL', value: 'https://internal.wiki/incident-response', date: '2026-06-15', status: 'Pending Review' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!control || (uploadType === 'FILE' && !fileInput) || (uploadType === 'URL' && !urlInput)) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate upload and audit log generation
    setTimeout(() => {
      const newEvidence = {
        id: `ev${Date.now()}`,
        control,
        type: uploadType,
        value: uploadType === 'FILE' ? fileInput?.name || 'document.pdf' : urlInput,
        date: new Date().toISOString().split('T')[0],
        status: 'Uploaded'
      };

      setEvidenceList([newEvidence, ...evidenceList]);
      setIsSubmitting(false);
      setSuccessMessage('Evidence submitted successfully. Audit log generated.');
      setControl('');
      setUrlInput('');
      setFileInput(null);

      // Dismiss success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Compliance Evidence Vault</h1>
          <p className="text-slate-500 mt-1">Upload files or link internal policies. All submissions log directly to the immutable Audit Ledger.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-1 border border-slate-200 bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 relative overflow-hidden">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <ShieldCheck className="w-5 h-5 text-indigo-500 mr-2" />
            Submit Evidence
          </h2>
          
          <AnimatePresence>
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-emerald-800">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target Control / Regulation</label>
              <select 
                value={control}
                onChange={(e) => setControl(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select a control requirement...</option>
                <option value="GDPR Article 28 - DPA">GDPR Art. 28 (Data Processing Agreement)</option>
                <option value="GDPR Article 30 - RoPA">GDPR Art. 30 (Record of Processing)</option>
                <option value="NIS2 - Incident Response">NIS2 Article 21 (Incident Handling)</option>
                <option value="DORA - ICT Risk Management">DORA (ICT Risk Framework)</option>
                <option value="EU AI Act - Risk Assessment">EU AI Act (Risk Assessment)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Evidence Type</label>
              <div className="flex border border-slate-200 rounded-lg overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setUploadType('FILE')}
                  className={`flex-1 py-2 text-sm font-semibold transition-colors flex justify-center items-center ${uploadType === 'FILE' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  PDF Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('URL')}
                  className={`flex-1 py-2 text-sm font-semibold transition-colors flex justify-center items-center border-l border-slate-200 ${uploadType === 'URL' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Link (URL)
                </button>
              </div>
            </div>

            <div className="min-h-[100px]">
              {uploadType === 'FILE' ? (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 sm:p-5 lg:p-6 text-center hover:bg-slate-50 transition-colors">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium mb-3">Drag & drop or click to upload PDF</p>
                  <input
                    type="file"
                    accept=".pdf"
                    id="file-upload"
                    className="hidden"
                    onChange={(e) => setFileInput(e.target.files?.[0] || null)}
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer px-4 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {fileInput ? fileInput.name : 'Select File'}
                  </label>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Internal Confluence/SharePoint URL</label>
                  <input 
                    type="url" 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="bg-amber-50 p-3 rounded-lg flex items-start border border-amber-100">
              <Info className="w-4 h-4 text-amber-600 mr-2 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                Submitting creates an immutable hash in the Audit Ledger proving compliance assertion at this exact time.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-2.5 bg-slate-900disabled:bg-slate-400 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors flex justify-center items-center"
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Committing to Ledger...</> : 'Submit Evidence'}
            </button>
          </form>
        </div>

        {/* Evidence List */}
        <div className="lg:col-span-2 border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Submitted Compliance Evidence</h2>
          <Soc2EvidenceGenerator evidenceList={evidenceList} />
          </div>
          
          <div className="divide-y divide-slate-100">
            {evidenceList.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-slate-50 transition-colors gap-4">
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg border mr-4 shrink-0 ${item.type === 'FILE' ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-blue-50 border-blue-100 text-blue-500'}`}>
                    {item.type === 'FILE' ? <FileText className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mt-0.5">{item.control}</h3>
                    <div className="flex items-center text-xs text-slate-500 mt-1 max-w-[250px] sm:max-w-xs md:max-w-md truncate" title={item.value}>
                      {item.value}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 px-12 sm:px-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    item.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' :
                    item.status === 'Uploaded' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
