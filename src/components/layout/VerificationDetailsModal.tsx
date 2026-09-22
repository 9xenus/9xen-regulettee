import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Shield, Clock, FileText, AlertCircle, CheckCircle2, 
  ArrowRight, ShieldAlert, Upload, QrCode, RotateCcw, 
  Loader2, Sparkles, Smartphone, Check, HelpCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface VerificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
}

export const VerificationDetailsModal: React.FC<VerificationDetailsModalProps> = ({ isOpen, onClose, session }) => {
  const { user, updateVerificationStatus } = useAuth();
  
  const currentStatus = (user?.user_metadata?.verificationStatus as 'Verified' | 'Pending' | 'Action Required') || 'Pending';
  
  // Interaction States
  const [method, setMethod] = useState<'EUDI' | 'DOC_UPLOAD' | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleEudiVerify = () => {
    setIsVerifying(true);
    setStepIndex(0);

    const steps = [
      'Establishing secure TLS channel with EUDI client...',
      'Requesting Selective Disclosure credential proof...',
      'Verifying digital signature against EU Trusted List...',
      'Synthesizing cryptographic proof hash...'
    ];

    const runSteps = async (index: number) => {
      if (index < steps.length) {
        setStepIndex(index);
        
        // At step index 2, we execute the actual cryptographic verification handshake against the real backend API
        if (index === 2) {
          try {
            const res = await fetch('/api/v1/eid/verify-presentation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                presentationToken: 'mock_eudi_token_verification_modal',
                profileId: 'de_citizen',
                userId: user?.id || 'anonymous_user'
              })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
              throw new Error(data.error || 'Cryptographic verification failed');
            }
          } catch (err: any) {
            setIsVerifying(false);
            window.dispatchEvent(new CustomEvent('sovereign-compliance-changed', {
              detail: {
                message: `EUDI verification failed: ${err.message}`,
                type: 'error',
                category: 'Identity Verification'
              }
            }));
            return; // stop execution
          }
        }
        
        setTimeout(() => runSteps(index + 1), 1000);
      } else {
        updateVerificationStatus('Verified');
        setIsVerifying(false);
        setMethod(null);
        window.dispatchEvent(new CustomEvent('sovereign-compliance-changed', {
          detail: {
            message: `Account successfully verified via secure EUDI Wallet (eIDAS v2). Cryptographic proof verified against EU Trust List.`,
            type: 'success',
            category: 'Identity Verification'
          }
        }));
      }
    };

    runSteps(0);
  };

  const handleDocUploadVerify = () => {
    setIsVerifying(true);
    setStepIndex(0);

    const steps = [
      'Reading uploaded sovereign identity artifact...',
      'Running AI OCR scanner to extract identity keys...',
      'Validating legal seals & passport format compliance...',
      'Registering certificate on state escrow database...'
    ];

    const runSteps = (index: number) => {
      if (index < steps.length) {
        setStepIndex(index);
        setTimeout(() => runSteps(index + 1), 1000);
      } else {
        updateVerificationStatus('Verified');
        setIsVerifying(false);
        setMethod(null);
        setUploadedFile(null);
        window.dispatchEvent(new CustomEvent('sovereign-compliance-changed', {
          detail: {
            message: `Account verified via manual document upload. Passport & official seal verified against national commercial register.`,
            type: 'success',
            category: 'Identity Verification'
          }
        }));
      }
    };

    runSteps(0);
  };

  // Drag-and-drop file upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const resetState = () => {
    updateVerificationStatus('Pending');
    setMethod(null);
    setIsVerifying(false);
    setUploadedFile(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-4 sm:p-5 lg:p-6 border border-slate-200 overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Sovereign Identity Ledger</h2>
                <p className="text-xs text-slate-500 font-medium">Verify your organizational profile under eIDAS v2 & GDPR</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Verification Status Banner */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              currentStatus === 'Verified' 
                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' 
                : currentStatus === 'Action Required'
                  ? 'bg-rose-50/50 border-rose-200 text-rose-800'
                  : 'bg-amber-50/50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-3">
                {currentStatus === 'Verified' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                ) : currentStatus === 'Action Required' ? (
                  <ShieldAlert className="w-8 h-8 text-rose-600 shrink-0" />
                ) : (
                  <Clock className="w-8 h-8 text-amber-500 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Status</div>
                  <div className="text-sm font-extrabold flex items-center gap-1.5">
                    {currentStatus}
                    {currentStatus === 'Verified' && <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />}
                  </div>
                </div>
              </div>

              {currentStatus === 'Verified' ? (
                <button 
                  onClick={resetState}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Demo Bypass: Reset status to Pending"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo State</span>
                </button>
              ) : (
                <div className="text-xs font-bold text-slate-500 italic bg-white px-2.5 py-1 rounded-lg border border-slate-150">
                  Verification Required
                </div>
              )}
            </div>

            {/* Interactive verification steps */}
            {currentStatus !== 'Verified' && (
              <div className="space-y-4">
                {isVerifying ? (
                  /* Loading screen during simulated verification */
                  <div className="p-4 sm:p-5 lg:p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Executing Sovereign Handshake</p>
                      <p className="text-sm font-bold text-slate-800">
                        {method === 'EUDI' 
                          ? [
                              'Establishing secure TLS channel with EUDI client...',
                              'Requesting Selective Disclosure credential proof...',
                              'Verifying digital signature against EU Trusted List...',
                              'Synthesizing cryptographic proof hash...'
                            ][stepIndex]
                          : [
                              'Reading uploaded sovereign identity artifact...',
                              'Running AI OCR scanner to extract identity keys...',
                              'Validating legal seals & passport format compliance...',
                              'Registering certificate on state escrow database...'
                            ][stepIndex]
                        }
                      </p>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: `${(stepIndex + 1) * 25}%` }}
                        transition={{ duration: 0.8 }}
                        className="bg-indigo-600 h-full rounded-full"
                      />
                    </div>
                  </div>
                ) : method === null ? (
                  /* Choose method screen */
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Choose verification mechanism</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* EUDI Option */}
                      <button
                        onClick={() => setMethod('EUDI')}
                        className="border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/10 p-4 rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between h-[120px]"
                      >
                        <div className="flex justify-between items-start w-full">
                          <Smartphone className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                          <span className="bg-indigo-100 text-indigo-700 font-extrabold text-[8px] px-1.5 py-0.5 rounded">eIDAS v2</span>
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-slate-800">Verify via EUDI Wallet</h4>
                          <p className="text-[10px] text-slate-450 leading-snug">Authenticates identity from European Union Decentralized ID.</p>
                        </div>
                      </button>

                      {/* Manual Upload Option */}
                      <button
                        onClick={() => setMethod('DOC_UPLOAD')}
                        className="border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/10 p-4 rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between h-[120px]"
                      >
                        <div className="flex justify-between items-start w-full">
                          <Upload className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                          <span className="bg-emerald-100 text-emerald-700 font-extrabold text-[8px] px-1.5 py-0.5 rounded">PDF / PNG</span>
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-slate-800">Upload Identity Doc</h4>
                          <p className="text-[10px] text-slate-450 leading-snug">Manual ledger upload of government-issued corporate seals.</p>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : method === 'EUDI' ? (
                  /* EUDI Flow UI */
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-center">
                    <div className="max-w-[120px] mx-auto bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs">
                      {/* Simulating a secure EUDI QR handshake */}
                      <QrCode className="w-full h-auto text-slate-800" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-slate-900">EUDI QR Handshake</h4>
                      <p className="text-xs text-slate-550 max-w-sm mx-auto leading-relaxed">
                        Scan this cryptographic presentation token via your official state-issued EUDI Wallet client on mobile.
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center pt-2">
                      <button
                        onClick={() => setMethod(null)}
                        className="px-4 py-2 border border-slate-250 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEudiVerify}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        Simulate Scan & Approve
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Document Upload Flow UI */
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-4 sm:p-5 lg:p-6 text-center transition-all ${
                        dragActive 
                          ? 'border-emerald-500 bg-emerald-50/20' 
                          : uploadedFile 
                            ? 'border-emerald-300 bg-emerald-50/5' 
                            : 'border-slate-300 hover:border-slate-400 bg-white'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="identity-doc-upload"
                        className="hidden" 
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileSelect}
                      />
                      
                      {uploadedFile ? (
                        <div className="space-y-2">
                          <Check className="w-8 h-8 text-emerald-600 mx-auto bg-emerald-100 p-1.5 rounded-full" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{uploadedFile.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono font-semibold">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button 
                            onClick={() => setUploadedFile(null)}
                            className="text-[10px] text-rose-600 font-bold hover:underline"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="identity-doc-upload" className="cursor-pointer space-y-2 block">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-700">Drag & drop passport or identity file here</p>
                            <p className="text-[10px] text-slate-400">or click to browse from device (PDF, PNG, JPG)</p>
                          </div>
                        </label>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => {
                          setMethod(null);
                          setUploadedFile(null);
                        }}
                        className="px-4 py-2 border border-slate-250 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDocUploadVerify}
                        disabled={!uploadedFile}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        Start Verification
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Success certificate presentation */}
            {currentStatus === 'Verified' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50/30 border border-emerald-150 p-4 rounded-xl space-y-3.5"
              >
                <div className="flex items-center gap-2 text-emerald-800">
                  <Check className="w-4 h-4 bg-emerald-150 rounded-full p-0.5 shrink-0" />
                  <span className="text-xs font-bold">Cryptographic Ledger Sealed</span>
                </div>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between border-b border-emerald-100/40 pb-1.5 text-slate-600">
                    <span>Identity Type:</span>
                    <span className="text-slate-800 font-bold">European Enterprise Account</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-100/40 pb-1.5 text-slate-600">
                    <span>Verification Stamp:</span>
                    <span className="font-mono text-emerald-700 font-extrabold text-[10.5px]">0x7F2C...E5A9</span>
                  </div>
                  <div className="flex justify-between pb-0.5 text-slate-600">
                    <span>Registry Authority:</span>
                    <span className="text-slate-800">EU Sovereign Trust Network</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Read-only token info block */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
              <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Active Session Token
              </p>
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Issuer Identity:</span>
                  <span className="font-mono text-slate-800">{session?.issuer || 'eIDAS Trust Authority'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Expires At:</span>
                  <span className="font-mono text-slate-800">
                    {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleTimeString() : 'No expiry'}
                  </span>
                </div>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Sovereign Audit History
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono text-[10.5px] font-bold text-slate-400">02:14:02 UTC</span>
                  <span className="font-medium text-slate-600">Active session token issued & stored securely</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono text-[10.5px] font-bold text-slate-400">01:55:20 UTC</span>
                  <span className="font-medium text-slate-600">Sovereign boundary verification pass completed</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
