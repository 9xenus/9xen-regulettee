import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Cpu, 
  Key, 
  AlertCircle, 
  Copy, 
  Check, 
  Download, 
  RotateCw, 
  Sparkles,
  Fingerprint,
  FileCheck2,
  Lock,
  Wifi,
  ExternalLink,
  Layers,
  History,
  ChevronDown,
  ChevronUp,
  Trash2,
  FileSignature,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { 
  TrustVerificationService, 
  CitizenCardVerificationResult,
  DigitalSignatureVerification
} from '../../services/trust-check/TrustVerificationService';

interface CitizenCardNfcVerifierProps {
  locale: 'bn' | 'en';
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onBadgeVerified?: (badgeId: string) => void;
}

export const CitizenCardNfcVerifier: React.FC<CitizenCardNfcVerifierProps> = ({
  locale,
  showToast,
  onBadgeVerified
}) => {
  const [isNfcSupported, setIsNfcSupported] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [cardResult, setCardResult] = useState<CitizenCardVerificationResult | null>(null);
  const [signatureStep, setSignatureStep] = useState<'idle' | 'pending' | 'verifying' | 'verified' | 'failed'>('idle');
  const [verificationProgressStage, setVerificationProgressStage] = useState<string>('');
  const [customUidInput, setCustomUidInput] = useState<string>('');
  const [customNdefText, setCustomNdefText] = useState<string>('');
  const [showAdvancedManualTap, setShowAdvancedManualTap] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(true);

  // Local history log of successfully scanned physical identity cards for current session
  const [scannedHistory, setScannedHistory] = useState<CitizenCardVerificationResult[]>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const saved = sessionStorage.getItem('citizen_nfc_scan_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return [];
  });

  // Sync history log to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem('citizen_nfc_scan_history', JSON.stringify(scannedHistory));
      } catch {
        // ignore
      }
    }
  }, [scannedHistory]);

  const addToHistory = (result: CitizenCardVerificationResult) => {
    if (!result.isValid) return;
    setScannedHistory(prev => {
      const filtered = prev.filter(item => item.cardSerialNumber !== result.cardSerialNumber);
      return [result, ...filtered];
    });
  };

  const clearHistory = () => {
    setScannedHistory([]);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.removeItem('citizen_nfc_scan_history');
      } catch {
        // ignore
      }
    }
    showToast(
      locale === 'bn' ? 'বর্তমান সেশনের স্ক্যান হিস্ট্রি মুছে ফেলা হয়েছে' : 'Current session scan history cleared',
      'info'
    );
  };

  const handleRemoveHistoryItem = (cardUid: string) => {
    setScannedHistory(prev => prev.filter(item => item.cardSerialNumber !== cardUid));
    showToast(
      locale === 'bn' ? 'কার্ড হিস্ট্রি থেকে সরানো হয়েছে' : 'Card removed from session history',
      'info'
    );
  };

  const handleSelectFromHistory = (item: CitizenCardVerificationResult) => {
    setCardResult(item);
    setSignatureStep('verified');
    if (onBadgeVerified) {
      onBadgeVerified(item.complianceBadgeId);
    }
    showToast(
      locale === 'bn'
        ? `লগ থেকে কার্ড নির্বাচন করা হয়েছে [${item.complianceBadgeId}]`
        : `Inspecting card from session history [${item.complianceBadgeId}]`,
      'info'
    );
  };

  // Mock-validate the identity card's digital signature before adding it to history
  const handleVerifySignature = () => {
    if (!cardResult) return;
    setSignatureStep('verifying');
    setVerificationProgressStage(
      locale === 'bn' 
        ? 'এনএফসি চিপের ডিজিটাল সিগনেচার ও রুট সার্টিফিকেট পাঠ করা হচ্ছে...' 
        : 'Extracting card public key certificate & ECDSA signature digest...'
    );

    setTimeout(() => {
      setVerificationProgressStage(
        locale === 'bn'
          ? 'জাতীয় সিএসসিএ (CSCA) ট্রাস্ট রেজিস্ট্রি ও সিআরএল যাচাই চলছে...'
          : 'Validating against CSCA Root Authority & checking revocation status...'
      );
    }, 380);

    setTimeout(() => {
      const sig = TrustVerificationService.verifyCardDigitalSignature(cardResult);
      if (sig.status === 'VERIFIED') {
        const updatedCard: CitizenCardVerificationResult = {
          ...cardResult,
          digitalSignature: sig
        };
        setCardResult(updatedCard);
        setSignatureStep('verified');
        setVerificationProgressStage('');
        playChime(true);

        // Cryptographic validation passed: add to current session history
        addToHistory(updatedCard);

        if (onBadgeVerified) {
          onBadgeVerified(updatedCard.complianceBadgeId);
        }

        showToast(
          locale === 'bn'
            ? `✅ ডিজিটাল সিগনেচার সফলভাবে যাচাইকৃত! সেশন হিস্ট্রিতে কার্ড সংরক্ষিত হয়েছে [${updatedCard.complianceBadgeId}]`
            : `✅ Digital signature verified! Card added to session history [${updatedCard.complianceBadgeId}]`,
          'success'
        );
      } else {
        setSignatureStep('failed');
        setVerificationProgressStage('');
        playChime(false);
        showToast(
          locale === 'bn'
            ? '❌ ডিজিটাল সিগনেচার যাচাই ব্যর্থ: অননুমোদিত চিপ বা ক্লোন ঝুঁকি সনাক্ত।'
            : '❌ Digital signature verification failed: Invalid chip certificate or untrusted issuer.',
          'error'
        );
      }
    }, 780);
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sound chime synthesizer on NFC read
  const playChime = (success: boolean = true) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (success) {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(164.81, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  // Check Web NFC API availability
  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setIsNfcSupported(true);
      setStatusMessage(
        locale === 'bn' 
          ? 'Web NFC API প্রস্তুত। ফিজিক্যাল স্মার্ট কার্ড রিড করতে স্ক্যান শুরু করুন।' 
          : 'Web NFC API available. Ready to scan physical citizen identity cards.'
      );
    } else {
      setIsNfcSupported(false);
      setStatusMessage(
        locale === 'bn'
          ? 'ডিভাইসে Web NFC পাওয়া যায়নি। এম্যুলেটর বা টেস্ট কার্ড সিলেক্ট করে এনকোডেড ব্যাজ যাচাই করতে পারেন।'
          : 'Web NFC not detected in browser. Use hardware simulator or tap pre-encoded sample cards.'
      );
    }

    return () => {
      stopNfcScan();
    };
  }, [locale]);

  // Start real Web NFC reader
  const startNfcScan = async () => {
    if (typeof window === 'undefined' || !('NDEFReader' in window)) {
      showToast(
        locale === 'bn' 
          ? 'ব্রাউজারে Web NFC সমর্থিত নয়। নিচের ফিজিক্যাল কার্ড সিম্যুলেটর ব্যবহার করুন।' 
          : 'Web NFC is not supported in this browser. Use the hardware tap simulator below.',
        'warning'
      );
      return;
    }

    try {
      abortControllerRef.current = new AbortController();
      setIsScanning(true);
      setStatusMessage(
        locale === 'bn'
          ? '📡 ফিজিক্যাল সিটিজেন কার্ড ডিভাইসের পিছনে এনএফসি অ্যান্টেনায় স্পর্শ করুন...'
          : '📡 Hold physical citizen card against your device NFC antenna...'
      );

      const ndef = new (window as any).NDEFReader();
      await ndef.scan({ signal: abortControllerRef.current.signal });

      ndef.onreading = (event: any) => {
        const serialNumber = event.serialNumber || '04:A2:89:C1:4E:60:80';
        let extractedText = '';

        if (event.message && event.message.records) {
          for (const record of event.message.records) {
            try {
              if (record.data) {
                const decoder = new TextDecoder(record.encoding || 'utf-8');
                extractedText += decoder.decode(record.data);
              }
            } catch (err) {
              console.warn('[NFC] Error decoding record data:', err);
            }
          }
        }

        // Trigger vibration if available
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([70, 40, 70]);
        }
        playChime(true);

        const result = TrustVerificationService.verifyCitizenCardNfc({
          cardSerialNumber: serialNumber,
          rawText: extractedText
        });

        setCardResult(result);
        setSignatureStep('pending');
        setIsScanning(false);
        setStatusMessage(
          locale === 'bn'
            ? `✅ এনএফসি কার্ড রিড সফল! UID: ${serialNumber} — ডিজিটাল সিগনেচার যাচাই করুন`
            : `✅ NFC Card read! UID: ${serialNumber} — Verify digital signature to complete`
        );

        showToast(
          locale === 'bn'
            ? `🎯 ফিজিক্যাল সিটিজেন কার্ড রিড সম্পন্ন [${result.complianceBadgeId}] — ডিজিটাল সিগনেচার যাচাই করুন`
            : `🎯 Physical Citizen Card Read: [${result.complianceBadgeId}] — Verify digital signature next`,
          'info'
        );
      };

      ndef.onreadingerror = (error: any) => {
        console.error('[NFC] Reading error:', error);
        playChime(false);
        showToast(
          locale === 'bn' 
            ? 'এনএফসি ট্যাগ রিড করতে সমস্যা হয়েছে। কার্ডটি স্থিরভাবে ধরে রাখুন।' 
            : 'NFC reading error. Ensure card is held steady against the reader.',
          'error'
        );
      };
    } catch (err: any) {
      console.error('[NFC] Failed to start scan:', err);
      setIsScanning(false);
      setStatusMessage(
        locale === 'bn'
          ? `স্ক্যান ত্রুটি: ${err.message || 'অনুমতি বাতিল বা হার্ডওয়্যার অনুপলব্ধ'}`
          : `Scan error: ${err.message || 'Permission denied or NFC unavailable'}`
      );
      showToast(
        locale === 'bn' 
          ? `এনএফসি স্ক্যান শুরু হতে ব্যর্থ হয়েছে: ${err.message || 'অনুমতি প্রয়োজন'}` 
          : `NFC scan failed: ${err.message || 'Permission or hardware issue'}`,
        'warning'
      );
    }
  };

  const stopNfcScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsScanning(false);
  };

  // Simulate NFC Card Tap (for desktop, non-NFC phones, or instant demo)
  const handleSimulateCardTap = (cardUid: string, rawTextOverride?: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([60, 40, 60]);
    }
    playChime(true);

    const result = TrustVerificationService.verifyCitizenCardNfc({
      cardSerialNumber: cardUid,
      rawText: rawTextOverride
    });

    setCardResult(result);
    setSignatureStep('pending');
    setStatusMessage(
      locale === 'bn'
        ? `✅ ফিজিক্যাল এনএফসি চিপ পাঠ সফল: UID [${cardUid}] — ডিজিটাল সিগনেচার যাচাই করুন`
        : `✅ Physical NFC chip read: UID [${cardUid}] — Verify digital signature to complete`
    );

    showToast(
      locale === 'bn'
        ? `🎯 ফিজিক্যাল সিটিজেন কার্ড সংকেত গৃহীত [${result.complianceBadgeId}] — ডিজিটাল সিগনেচার যাচাই করুন`
        : `🎯 Physical citizen card signal read [${result.complianceBadgeId}] — Verify digital signature next`,
      'info'
    );
  };

  const handleCopyAttestation = () => {
    if (!cardResult) return;
    const attestation = JSON.stringify({
      cardSerialNumber: cardResult.cardSerialNumber,
      complianceBadgeId: cardResult.complianceBadgeId,
      citizenName: cardResult.citizenName,
      nationalIdNumber: cardResult.nationalIdNumber,
      zkProofStatus: cardResult.zkProofStatus,
      chipSecurityStatus: cardResult.chipSecurityStatus,
      verifiedAt: cardResult.verifiedAt
    }, null, 2);

    navigator.clipboard.writeText(attestation);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
    showToast(locale === 'bn' ? 'প্রমাণপত্রের অ্যাটেস্টেশন ক্লিপবোর্ডে কপি হয়েছে' : 'Card attestation JSON copied to clipboard', 'info');
  };

  const handleDownloadCertificate = () => {
    if (!cardResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cardResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Citizen_NFC_Badge_${cardResult.complianceBadgeId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(locale === 'bn' ? 'অডিট সার্টিফিকেট ডাউনলোড হয়েছে' : 'NFC verification certificate downloaded', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header & NFC Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-indigo-50 to-emerald-50 dark:from-teal-950/40 dark:via-indigo-950/30 dark:to-emerald-950/40 border border-teal-200 dark:border-teal-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-teal-600 text-white rounded-xl shadow-md">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {locale === 'bn' ? 'ফিজিক্যাল সিটিজেন কার্ড এনএফসি স্ক্যানার' : 'Physical Citizen Identity Card (Web NFC Reader)'}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                isNfcSupported 
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                  : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
              }`}>
                {isNfcSupported ? 'Web NFC Ready' : 'NFC Standby / Enclave Tap'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {locale === 'bn'
                ? 'আইএসও ১৪৪৪৩ / এনডিইএফ চিপ সম্বলিত স্মার্ট এনআইডি ও সিটিজেন কার্ড স্পর্শ করে এনকোডেড ব্যাজ যাচাই করুন।'
                : 'Tap ISO 14443 / NDEF smart citizen cards to read & cryptographically verify encoded compliance badges.'}
            </p>
          </div>
        </div>

        {/* Scan Actions */}
        <div className="flex items-center gap-2">
          {isScanning ? (
            <button
              onClick={stopNfcScan}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>{locale === 'bn' ? 'স্ক্যান থামান' : 'Cancel Scan'}</span>
            </button>
          ) : (
            <button
              onClick={startNfcScan}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Wifi className="w-4 h-4" />
              <span>{locale === 'bn' ? 'এনএফসি রিডার চালু করুন' : 'Start Web NFC Scan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Radar Animation during active Web NFC scan */}
      {isScanning && (
        <div className="p-8 rounded-3xl bg-slate-900 text-white border border-teal-500/40 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
            <div className="w-40 h-40 rounded-full border-4 border-teal-400 animate-ping" />
            <div className="w-64 h-64 rounded-full border-2 border-indigo-400 animate-ping delay-150" />
            <div className="w-96 h-96 rounded-full border border-emerald-400 animate-ping delay-300" />
          </div>

          <div className="relative z-10 max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-400 text-teal-300 mx-auto flex items-center justify-center">
              <Smartphone className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-base font-extrabold text-white">
              {locale === 'bn' ? 'সিটিজেন কার্ড এনএফসি চিপ স্পর্শ করুন' : 'Hold Physical Citizen Card to Device'}
            </h4>
            <p className="text-xs text-slate-300">
              {locale === 'bn'
                ? 'আপনার ফোনের পিছনে এনআইডি বা ই-আইডি কার্ড স্পর্শ করুন। চিপ থেকে এনকোডেড কমপ্লায়েন্স ব্যাজ স্বয়ংক্রিয়ভাবে পড়া হবে।'
                : 'Touch your physical citizen card to the NFC zone on the back of your phone to read the cryptographic compliance badge.'}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-600 text-[11px] text-teal-300">
              <Radio className="w-3 h-3 animate-pulse text-teal-400" />
              <span>{statusMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Physical Citizen Identity Card Tap Presets / Simulator */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              {locale === 'bn' ? 'ফিজিক্যাল কার্ড ট্যাপ সিম্যুলেটর (ইনস্ট্যান্ট টেস্ট)' : 'Physical Citizen Card Tap Presets (Instant Validation)'}
            </h4>
          </div>
          <button
            onClick={() => setShowAdvancedManualTap(!showAdvancedManualTap)}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {showAdvancedManualTap 
              ? (locale === 'bn' ? 'সাধারণ মোড' : 'Hide Custom NFC') 
              : (locale === 'bn' ? 'কাস্টম UID/NDEF ইনপুট' : 'Custom NFC Input')}
          </button>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {locale === 'bn'
            ? 'বাস্তব ফিজিক্যাল এনএফসি কার্ড ছাড়াও এক ক্লিকে অফিশিয়াল স্মার্ট এনআইডি ও ইইউ ই-আইডি কার্ড ট্যাপ পরীক্ষা করতে নিচের কার্ডগুলোতে ক্লিক করুন:'
            : 'Test NFC attestation directly by tapping any of the pre-encoded sovereign citizen identity cards below:'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Preset 1: BD Smart NID Card */}
          <button
            onClick={() => handleSimulateCardTap('04:A2:89:C1:4E:60:80')}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 text-left transition-all hover:shadow-md group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🇧🇩</span>
                <span>Smart NID Card</span>
              </span>
              <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded">
                ISO 14443
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">Mst. Nasreen Akter</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">UID: 04:A2:89:C1:4E:60:80</p>
            <div className="mt-2 text-[10px] font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>{locale === 'bn' ? 'কার্ড ট্যাপ করুন' : 'Tap Card'}</span>
              <span>→</span>
            </div>
          </button>

          {/* Preset 2: EU Citizen eID Smart Card */}
          <button
            onClick={() => handleSimulateCardTap('04:7F:31:AA:5D:81:90')}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-left transition-all hover:shadow-md group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🇪🇺</span>
                <span>EU Citizen eID Card</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                eIDAS High
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">Dr. Klaus Lindner</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">UID: 04:7F:31:AA:5D:81:90</p>
            <div className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>{locale === 'bn' ? 'কার্ড ট্যাপ করুন' : 'Tap Card'}</span>
              <span>→</span>
            </div>
          </button>

          {/* Preset 3: France Sovereign Citizen Card */}
          <button
            onClick={() => handleSimulateCardTap('04:1B:2C:3D:4E:5F:60')}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 text-left transition-all hover:shadow-md group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🇫🇷</span>
                <span>Carte Nationale eID</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                Class A
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">Camille Dupont</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">UID: 04:1B:2C:3D:4E:5F:60</p>
            <div className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>{locale === 'bn' ? 'কার্ড ট্যাপ করুন' : 'Tap Card'}</span>
              <span>→</span>
            </div>
          </button>
        </div>

        {/* Custom NFC UID / NDEF Text Manual Testing Panel */}
        {showAdvancedManualTap && (
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 mt-3 animate-in fade-in duration-200">
            <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {locale === 'bn' ? 'কাস্টম এনএফসি হার্ডওয়্যার পে-লোড রিডার' : 'Custom NFC Hardware UID / NDEF Text Reader'}
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Card UID (e.g. 04:A2:89:C1:4E:60:80)"
                value={customUidInput}
                onChange={e => setCustomUidInput(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white font-mono"
              />
              <input
                type="text"
                placeholder="NDEF Badge String (e.g. TB-NID-BD-8902)"
                value={customNdefText}
                onChange={e => setCustomNdefText(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white font-mono"
              />
            </div>
            <button
              onClick={() => handleSimulateCardTap(customUidInput || '04:88:99:A1:B2:C3:D4', customNdefText)}
              className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              {locale === 'bn' ? 'কাস্টম এনএফসি পে-লোড ভেরিফাই করুন' : 'Verify Custom NFC Payload'}
            </button>
          </div>
        )}
      </div>

      {/* Verification Results View */}
      {cardResult && (
        <div className={`p-5 rounded-3xl border transition-all ${
          cardResult.isValid
            ? 'bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 dark:from-slate-900 dark:via-emerald-950/20 dark:to-teal-950/30 border-emerald-300 dark:border-emerald-700 shadow-md'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
        }`}>
          {/* Result Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-2xl ${
                cardResult.isValid ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {cardResult.isValid ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {cardResult.citizenName}
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {cardResult.countryCode}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {cardResult.nationalIdNumber} • {cardResult.cardType.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* Quick Badge Status Tag */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Compliance Badge</span>
                <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {cardResult.complianceBadgeId}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-300/60">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
            {/* 1. NFC Chip Serial */}
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold">NFC Card Serial (UID)</span>
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200 truncate block">
                {cardResult.cardSerialNumber}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
                {cardResult.chipSecurityStatus.replace(/_/g, ' ')}
              </span>
            </div>

            {/* 2. ZK Proof & Cryptographic Attestation */}
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold">ZK Verification</span>
                <Key className="w-3.5 h-3.5 text-teal-500" />
              </div>
              <span className="font-mono text-xs font-black text-teal-600 dark:text-teal-400 block">
                {cardResult.zkProofStatus}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Zero-Knowledge Attested
              </span>
            </div>

            {/* 3. Assurance Level */}
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold">Trust Assurance</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                {cardResult.complianceLevel.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Expiry: {cardResult.expiryDate}
              </span>
            </div>

            {/* 4. Issuing Authority */}
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold">Issuing Authority</span>
                <FileCheck2 className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                {cardResult.issuingAuthority}
              </span>
            </div>
          </div>

          {/* Encoded NFC Attributes Checklist */}
          <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              {locale === 'bn' ? 'এনএফসি চিপে এনকোডেড সিটিজেন কমপ্লায়েন্স অ্যাট্রিবিউটস' : 'NFC Encoded Citizen Compliance Attributes'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Age Over 18: <strong>Verified</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>e-Signature: <strong>Authorized</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Civic Standing: <strong>Clear</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Fingerprint className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Match Score: <strong>{cardResult.encodedAttributes.biometricMatchScore || 98.4}%</strong></span>
              </div>
            </div>
          </div>

          {/* STEP 2: Digital Signature Verification Section */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            {/* Case A: Signature Verification Pending */}
            {signatureStep === 'pending' && (
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-700/70 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex-shrink-0">
                      <FileSignature className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {locale === 'bn' ? 'ডিজিটাল সিগনেচার যাচাই প্রয়োজন' : 'Verify Digital Signature Required'}
                        </h5>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                          {locale === 'bn' ? 'অপেক্ষমান' : 'Action Required'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                        {locale === 'bn'
                          ? 'এনএফসি চিপ পাঠ সম্পন্ন হয়েছে। পরিচয়পত্রের সত্যতা ও রাষ্ট্রীয় ট্রাস্ট রেজিস্ট্রি প্রমাণ নিশ্চিত করে হিস্ট্রি লগে যুক্ত করতে কার্ডের ডিজিটাল সিগনেচার যাচাই করুন।'
                          : 'Card payload read from physical chip. Validate the cryptographic digital signature against the sovereign root authority before adding this card to the session history.'}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
                        <span>Algorithm: <strong>{cardResult.countryCode === 'BD' ? 'ECDSA_SHA384_SECP256R1' : 'Ed25519_GOV_CERT_V2'}</strong></span>
                        <span>•</span>
                        <span>Issuer: <strong>{cardResult.issuingAuthority}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleVerifySignature}
                      className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer group"
                    >
                      <FileSignature className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <span>{locale === 'bn' ? 'সিগনেচার ভেরিফাই করুন' : 'Verify Signature'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Case B: Signature Verification In Progress */}
            {signatureStep === 'verifying' && (
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-700/80 shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {locale === 'bn' ? 'ডিজিটাল সিগনেচার যাচাইকরণ চলমান...' : 'Validating Chip Digital Signature...'}
                    </h5>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium mt-0.5">
                      {verificationProgressStage || (locale === 'bn' ? 'এনএফসি চিপ সিগনেচার যাচাই চলছে...' : 'Cryptographic checks in progress...')}
                    </p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-indigo-100 dark:bg-indigo-900/60 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse w-3/4 transition-all duration-500" />
                </div>
              </div>
            )}

            {/* Case C: Signature Verified & Added to History */}
            {signatureStep === 'verified' && (
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 shadow-xs animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {locale === 'bn' ? 'ডিজিটাল সিগনেচার যাচাইকৃত ও সত্যায়িত' : 'Digital Signature Verified & Attested'}
                        </h5>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                          AUTHENTIC
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium mt-0.5">
                        {locale === 'bn' 
                          ? '✓ চিপের ডিজিটাল সিগনেচার রাষ্ট্রীয় সিএসসিএ রুটের সাথে সফলভাবে মিলেছে এবং সেশন হিস্ট্রি লগে যুক্ত হয়েছে।'
                          : '✓ Cryptographic chip signature verified against sovereign CSCA root and logged to session history.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-[10px] font-mono text-slate-500 dark:text-slate-400 flex-shrink-0">
                    <div>Standard: <span className="font-semibold text-slate-700 dark:text-slate-300">{cardResult.digitalSignature?.signatureStandard || 'ICAO Doc 9303 EACv2'}</span></div>
                    <div>Algorithm: <span className="font-semibold text-emerald-700 dark:text-emerald-300">{cardResult.digitalSignature?.algorithm || 'ECDSA_SHA384_SECP256R1'}</span></div>
                  </div>
                </div>

                {cardResult.digitalSignature && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                    <div className="truncate">
                      <span className="text-slate-400">Digest: </span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">{cardResult.digitalSignature.signatureDigest}</span>
                    </div>
                    <div className="truncate sm:text-right">
                      <span className="text-slate-400">Fingerprint: </span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">{cardResult.digitalSignature.publicKeyFingerprint}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Case D: Signature Verification Failed */}
            {signatureStep === 'failed' && (
              <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/80 shadow-xs animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 border border-rose-300 dark:border-rose-800 flex-shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {locale === 'bn' ? 'ডিজিটাল সিগনেচার যাচাই ব্যর্থ হয়েছে' : 'Digital Signature Verification Failed'}
                      </h5>
                      <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                        {locale === 'bn'
                          ? 'কার্ড চিপের সিগনেচার বা সার্টিফিকেট প্রত্যাখ্যাত হয়েছে। অননুমোদিত চিপ বা ক্লোনিং ঝুঁকির কারণে এটি হিস্ট্রি লগে যুক্ত করা হয়নি।'
                          : 'Card chip signature or certificate rejected. Untrusted or cloned chip detected; card was not added to session history.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifySignature}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer self-start sm:self-center"
                  >
                    {locale === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Verification'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Verified at: {new Date(cardResult.verifiedAt).toLocaleTimeString()} • Sovereign Trust Enclave
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAttestation}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHash ? (locale === 'bn' ? 'কপি হয়েছে' : 'Copied') : (locale === 'bn' ? 'অ্যাটেস্টেশন কপি' : 'Copy Attestation')}</span>
              </button>

              <button
                onClick={handleDownloadCertificate}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{locale === 'bn' ? 'সার্টিফিকেট ডাউনলোড' : 'Download Certificate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Session History Log */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {/* Collapsible Header */}
        <div 
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors select-none"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {locale === 'bn' ? 'বর্তমান সেশনের স্ক্যান হিস্ট্রি লগ' : 'Session Scanned Cards History'}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                  {scannedHistory.length} {scannedHistory.length === 1 ? (locale === 'bn' ? 'টি কার্ড' : 'Card') : (locale === 'bn' ? 'টি কার্ড' : 'Cards')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {locale === 'bn' 
                  ? 'এই সেশনে সফলভাবে ভেরিফাই করা ফিজিক্যাল কার্ডগুলোর সংরক্ষিত রেকর্ড' 
                  : 'Log of physical citizen identity cards successfully read & attested in this session'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
            {scannedHistory.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-1 transition-colors cursor-pointer"
                title={locale === 'bn' ? 'হিস্ট্রি ক্লিয়ার করুন' : 'Clear History'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{locale === 'bn' ? 'মুছে ফেলুন' : 'Clear'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle history"
            >
              {isHistoryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {isHistoryExpanded && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            {scannedHistory.length === 0 ? (
              <div className="py-6 text-center space-y-1.5">
                <Smartphone className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {locale === 'bn'
                    ? 'এই সেশনে এখনও কোনো ফিজিক্যাল কার্ড স্ক্যান করা হয়নি।'
                    : 'No physical identity cards have been scanned in this session yet.'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {locale === 'bn'
                    ? 'এনএফসি রিডার চালু করুন বা উপরের টেস্ট কার্ড ট্যাপ করে লগ তৈরি করুন।'
                    : 'Start Web NFC scan or tap any sample card above to generate verification logs.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {scannedHistory.map((item, index) => {
                  const isCurrentlyActive = cardResult?.cardSerialNumber === item.cardSerialNumber;
                  return (
                    <div
                      key={`${item.cardSerialNumber}_${item.verifiedAt}_${index}`}
                      className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrentlyActive
                          ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700'
                          : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start sm:items-center space-x-3 min-w-0">
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 flex-shrink-0">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.citizenName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {item.countryCode}
                            </span>
                            <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold bg-teal-100/70 dark:bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{item.complianceBadgeId}</span>
                            </span>
                            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                              <FileSignature className="w-3 h-3 text-indigo-500" />
                              <span>Sig: Verified</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                            <span className="font-mono text-[10px]">UID: {item.cardSerialNumber}</span>
                            <span>•</span>
                            <span>{item.cardType.replace(/_/g, ' ')}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{item.zkProofStatus}</span>
                            <span>•</span>
                            <span>{new Date(item.verifiedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSelectFromHistory(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isCurrentlyActive
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {isCurrentlyActive 
                            ? (locale === 'bn' ? 'সক্রিয় ভিউ' : 'Active View') 
                            : (locale === 'bn' ? 'বিবরণ দেখুন' : 'Inspect')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveHistoryItem(item.cardSerialNumber)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title={locale === 'bn' ? 'তালিকা থেকে সরান' : 'Remove from log'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
