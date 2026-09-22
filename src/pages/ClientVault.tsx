import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Lock, Loader2, CheckCircle2, ShieldCheck, Download, Trash2, Plus, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VaultDoc {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  status: 'ENCRYPTED' | 'VERIFIED';
}

export const ClientVault: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<VaultDoc[]>([]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/vault/documents');
      const data = await res.json();
      if (data.success && Array.isArray(data.documents)) {
        const mapped: VaultDoc[] = data.documents.map((d: any) => ({
          id: d.id,
          name: d.fileName || d.name,
          type: (d.fileName || d.name).endsWith('.docx') ? 'Assessment' : 'Legal',
          date: d.uploadedAt ? new Date(d.uploadedAt).toISOString().split('T')[0] : '2026-06-15',
          size: `${Math.max(1, Math.round((d.fileSize || 1024) / 1024))} KB`,
          status: 'ENCRYPTED'
        }));
        setDocuments(mapped);
      }
    } catch (err: any) {
      console.warn('Failed to load documents from enclave:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setNotification(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1];
          const res = await fetchWithRetry('/api/v1/vault/upload-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileContentBase64: base64String,
              mimeType: file.type || 'application/octet-stream',
              tenantId: 'org_1'
            })
          });
          const data = await res.json();
          if (data.success) {
            setNotification(`Document "${file.name}" cryptographically sealed with AES-256-GCM in Sovereign Enclave Vault.`);
            await loadDocuments();
          } else {
            throw new Error(data.error || 'Upload encryption failed');
          }
        } catch (err: any) {
          setNotification(`Upload failed: ${err.message}`);
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setNotification(`Failed to read file: ${err.message}`);
      setIsUploading(false);
    }
  };

  const handleDownload = (doc: VaultDoc) => {
    const downloadUrl = `/api/v1/vault/download?key=${encodeURIComponent(doc.id)}&tenantId=org_1`;
    window.open(downloadUrl, '_blank');
  };

  const handleDelete = async (doc: VaultDoc) => {
    if (!confirm(`Are you sure you want to cryptographically purge "${doc.name}" from the sovereign vault?`)) {
      return;
    }
    try {
      const res = await fetchWithRetry(`/api/v1/vault/documents?key=${encodeURIComponent(doc.id)}&tenantId=org_1`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Document "${doc.name}" has been permanently purged from the encrypted storage enclave.`);
        setDocuments(prev => prev.filter(d => d.id !== doc.id));
      } else {
        throw new Error(data.error || 'Deletion failed');
      }
    } catch (err: any) {
      setNotification(`Purge error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Lock className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Sovereign Encrypted Document Vault
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            AES-256-GCM & Post-Quantum encrypted storage for statutory compliance artifacts, DPAs, and certifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDocuments}
            disabled={isLoading}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Refresh documents"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.docx,.doc,.json,.zip"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center space-x-2 transition shadow-xs cursor-pointer disabled:opacity-50 text-sm"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{isUploading ? 'Sealing Enclave...' : 'Upload & Encrypt'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {isLoading && documents.length === 0 ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">Decrypting metadata from sovereign enclave...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Lock className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <p className="text-sm font-semibold">No encrypted artifacts found in this tenant enclave.</p>
          <p className="text-xs text-slate-500 mt-1">Click "Upload & Encrypt" above to securely deposit a compliance document.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-100 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                      {doc.type}
                    </span>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition"
                      title="Purge Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 line-clamp-2" title={doc.name}>
                  {doc.name}
                </h3>
                <div className="text-[11px] text-slate-400 font-mono">Size: {doc.size}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  <Lock className="w-3 h-3" />
                  <span>AES-256</span>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg flex items-center gap-1.5 transition border border-emerald-200/50 dark:border-emerald-800/50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ClientVault;
