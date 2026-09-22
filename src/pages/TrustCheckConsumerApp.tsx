import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  AlertCircle,
  Search, 
  Phone, 
  Globe, 
  QrCode, 
  Building2, 
  FileText, 
  Bell, 
  Filter,
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Share2, 
  Mic, 
  MicOff, 
  Sparkles, 
  Lock, 
  RotateCcw, 
  UserCheck, 
  Send, 
  Layers, 
  Zap, 
  Info, 
  Smartphone, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Fingerprint,
  Radio,
  Upload,
  Camera,
  RefreshCw,
  Clock,
  Eye,
  Check,
  Copy,
  Download,
  HardDrive,
  Trash2,
  History,
  MessageSquare,
  ArrowLeft,
  DollarSign,
  MapPin,
  Navigation,
  Crosshair,
  LocateFixed,
  HelpCircle,
  CreditCard,
  Printer,
  FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useAiAutoCategorization } from '../hooks/useAiAutoCategorization';
import { TrustVerdictEngine, TrustVerdict, VerdictTier } from '../services/trust-check/TrustVerdictEngine';
import { ScamAlertEngine, ScamAlertItem, SpikeAlertSignal } from '../services/trust-check/ScamAlertEngine';
import { ScamSchoolService, ScamLesson, CitizenBadge } from '../services/trust-check/ScamSchoolService';
import { TrustVerificationService, TrustBadgeVerificationResult, AgentVerificationResult } from '../services/trust-check/TrustVerificationService';
import { appDeviceSecurityManager } from '../services/trust-check/TrustCheckArchitecture';
import { ConsumerGrievanceService, grievanceReportSchema } from '../services/consumerGrievanceService';
import { QrScannerOverlay } from '../components/trust/QrScannerOverlay';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { SubscriptionBillingSystem } from '../components/subscription/SubscriptionBillingSystem';
import { CitizenCardNfcVerifier } from '../components/trust/CitizenCardNfcVerifier';
import { CitizenIdentityCameraVerifier, BiometricIdentityProof } from '../components/trust/CitizenIdentityCameraVerifier';
import { GrievanceNotificationListener } from '../components/trust/GrievanceNotificationListener';
import { GrievanceNotificationService } from '../services/grievanceNotificationService';
import { RealtimeTrackingStatus } from '../components/dashboard/RealtimeTrackingStatus';
import { RemediationRoadmap } from '../components/dashboard/RemediationRoadmap';
import { GrievanceReportHistoryView, saveSubmittedGrievance } from '../components/trust/GrievanceReportHistoryView';
import { PDFAnnotation, RedactionMask } from '../types';

export interface EvidenceAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  previewUrl: string;
  uploadedAt: string;
  vaultHash: string;
  category: 'SCAM_CHAT' | 'PAYMENT_SLIP' | 'CALL_LOG' | 'OTHER';
  status?: 'PENDING' | 'ENCRYPTING' | 'VAULTED';
}

const DynamicQRCode: React.FC<{
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}> = ({ value, size = 90, className = '', darkColor = '#0f172a', lightColor = '#ffffff' }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (!value) return;
    let isMounted = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor
      }
    }).then(url => {
      if (isMounted) setQrUrl(url);
    }).catch(err => {
      console.error('QR code generation error:', err);
    });
    return () => { isMounted = false; };
  }, [value, size, darkColor, lightColor]);

  if (!qrUrl) {
    return (
      <div style={{ width: size, height: size }} className={`bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 ${className}`}>
        <QrCode className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`p-1.5 bg-white rounded-2xl shadow-sm border border-slate-200 shrink-0 flex flex-col items-center justify-center ${className}`}>
      <img src={qrUrl} alt="Report Deep Link QR Code" style={{ width: size, height: size }} className="rounded-lg object-contain" />
    </div>
  );
};

const HelpTooltip: React.FC<{
  id: string;
  titleBn: string;
  titleEn: string;
  textBn: string;
  textEn: string;
  locale: 'bn' | 'en';
  activeId: string | null;
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ id, titleBn, titleEn, textBn, textEn, locale, activeId, setActiveId }) => {
  const isOpen = activeId === id;

  return (
    <div className="relative inline-flex items-center ml-1 z-30">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setActiveId(isOpen ? null : id);
        }}
        onMouseEnter={() => setActiveId(id)}
        className={`p-1 rounded-full transition-all cursor-pointer focus:outline-none ${
          isOpen
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-300 ring-2 ring-indigo-400/40 scale-110'
            : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 dark:hover:text-indigo-300'
        }`}
        title={locale === 'bn' ? 'রেগুলেটরি তদন্ত নির্দেশিকা' : 'Investigation Guidance Tip'}
        aria-label="Investigation Guidance"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-64 sm:w-72 p-3 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white shadow-2xl border border-slate-700/80 text-left pointer-events-auto"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5 border-b border-slate-800 pb-1">
              <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{locale === 'bn' ? titleBn : titleEn}</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="text-slate-400 hover:text-white p-0.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-200 leading-relaxed font-normal">
              {locale === 'bn' ? textBn : textEn}
            </p>

            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-slate-900 dark:border-t-slate-950" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const COMMON_FRAUD_TARGET_TYPOS: Record<string, string> = {
  'fecbook': 'facebook.com',
  'Global Mobile Walleth': 'wallet',
  'Global Mobile Wallets': 'wallet',
  'nogod': 'Digital Wallet',
  'nogoth': 'Digital Wallet',
  'instagaram': 'instagram.com',
  'instgram': 'instagram.com',
  'whatapp': 'whatsapp',
  'watsapp': 'whatsapp',
  'telegaram': 'telegram',
  'telegeram': 'telegram',
  'facebuk': 'facebook.com',
};

const SUGGESTED_TARGET_PATTERNS = [
  { value: '017', label: 'GP (Grameenphone)', type: 'mobile' },
  { value: '013', label: 'GP (New Series)', type: 'mobile' },
  { value: '019', label: 'Banglalink', type: 'mobile' },
  { value: '014', label: 'Banglalink (New)', type: 'mobile' },
  { value: '018', label: 'Robi', type: 'mobile' },
  { value: '016', label: 'Airtel', type: 'mobile' },
  { value: '015', label: 'Teletalk', type: 'mobile' },
  { value: 'facebook.com/', label: 'FB Profile/Page', type: 'social' },
  { value: 't.me/', label: 'Telegram Link', type: 'social' },
  { value: 'wa.me/', label: 'WhatsApp Link', type: 'social' },
];

export const TrustCheckConsumerApp: React.FC = () => {
  const { showToast } = useNotification();

  // Active Tooltip State
  const [activeHelpTooltip, setActiveHelpTooltip] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<EvidenceAttachment | null>(null);

  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'check' | 'report' | 'alerts' | 'school' | 'verify' | 'subscription'>('check');
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState(false);
  const { locale, setLocale, toggleLocale } = useLanguage();
  const [coBrandMode, setCoBrandMode] = useState<'DNCRP_Telecom Regulatory Authority' | 'SOVEREIGN_GLOBAL'>('DNCRP_Telecom Regulatory Authority');
  const { isEnabled: isAiCategorizationEnabled, toggleAutoCategorization: toggleAiCategorization, setAutoCategorization: setAiCategorization } = useAiAutoCategorization();
  
  // Tab 1: Check State
  interface RecentScanItem {
    id: string;
    query: string;
    type: 'phone' | 'wallet' | 'website' | 'qr' | 'name';
    tier: 'FLAGGED' | 'WARNED' | 'VERIFIED' | 'UNKNOWN';
    timestamp: string;
  }
  const [recentScans, setRecentScans] = useState<RecentScanItem[]>(() => {
    try {
      const saved = localStorage.getItem('trust_check_recent_scans');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [queryType, setQueryType] = useState<'phone' | 'wallet' | 'website' | 'qr' | 'name'>('wallet');
  const [inputQuery, setInputQuery] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentVerdict, setCurrentVerdict] = useState<TrustVerdict | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Smart Scan Auto Fill States
  const [showSmartScanPanel, setShowSmartScanPanel] = useState(false);
  const [smartScanText, setSmartScanText] = useState('');
  const [isSmartScanning, setIsSmartScanning] = useState(false);
  const [smartScanResult, setSmartScanResult] = useState<{
    detectedType: 'phone' | 'wallet' | 'website' | 'qr' | 'name' | null;
    extractedValue: string;
    riskScore: number;
    keyPhrases: string[];
    explanation: string;
  } | null>(null);

  // QR Scanner Overlay State
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrScannerTarget, setQrScannerTarget] = useState<'check' | 'badge' | 'agent' | 'evidence'>('check');

  // Tab 2: 60-Second Report State
  const [reportSubTab, setReportSubTab] = useState<'form' | 'history'>('form');
  const [reportStep, setReportStep] = useState<number>(1);
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');
  const [reportTarget, setReportTarget] = useState('');
  const [reportCategory, setReportCategory] = useState('Fake MFS Cash-Back / OTP Call');
  const [reportAmountRange, setReportAmountRange] = useState('৳1,000 - ৳5,000');
  const [reportDescription, setReportDescription] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [complainantPhone, setComplainantPhone] = useState('');
  const [biometricProof, setBiometricProof] = useState<BiometricIdentityProof | null>(null);
  const [submittedReportRef, setSubmittedReportRef] = useState<string | null>(null);
  const [showReportShareModal, setShowReportShareModal] = useState(false);
  const [socialTemplate, setSocialTemplate] = useState<'SCAM_ALERT' | 'VERIFIED_FRAUD' | 'URGENT_BEWARE' | 'REGULATORY_NOTICE'>('SCAM_ALERT');
  const [isCopiedDeepLink, setIsCopiedDeepLink] = useState(false);
  const [isCopiedSharePost, setIsCopiedSharePost] = useState(false);
  const [isPrintingCard, setIsPrintingCard] = useState(false);

  const handlePrintCard = () => {
    setIsPrintingCard(true);
    showToast('🖨️ Preparing to print...', 'info');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsPrintingCard(false);
      }, 1000);
    }, 400);
  };
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportErrors, setReportErrors] = useState<Record<string, string>>({});
  const [isTargetFocused, setIsTargetFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [isComplainantPhoneFocused, setIsComplainantPhoneFocused] = useState(false);
  const [showTargetSuggestions, setShowTargetSuggestions] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const [recentReportTargets, setRecentReportTargets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('trust_check_recent_report_targets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentVerifications, setRecentVerifications] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('trust_check_recent_verifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auto-focus target input on step 1
  useEffect(() => {
    if (reportStep === 1 && activeTab === 'report') {
      const timer = setTimeout(() => {
        reportTargetInputRef.current?.focus();
      }, 350); // Delay for AnimatePresence transition
      return () => clearTimeout(timer);
    }
  }, [reportStep, activeTab]);

  const triggerShakeAnimation = () => {
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 600);
  };

  // Tab 2: Evidence Vault Attachments State
  const [evidenceAttachments, setEvidenceAttachments] = useState<EvidenceAttachment[]>([]);
  const [includePiiRedactedLog, setIncludePiiRedactedLog] = useState<boolean>(true);
  const fileGalleryInputRef = useRef<HTMLInputElement | null>(null);
  const fileCameraInputRef = useRef<HTMLInputElement | null>(null);
  const reportTargetInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Tab 2: Geolocation State
  const [reportLocation, setReportLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    district: string;
    division: string;
    areaName: string;
  } | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Real-time Visual Validation Rules
  const targetValidation = useMemo(() => {
    if (!reportTarget.trim()) return { isValid: false, isError: false, message: null, tip: null, type: null };
    const cleaned = reportTarget.trim();
    const isPhone = /^(?:\+?8801|01)[3-9]\d{8}$/.test(cleaned.replace(/[\s-]/g, ''));
    const isUrl = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(cleaned);
    const isHandle = cleaned.length >= 4 && (cleaned.includes('@') || cleaned.includes('.'));

    if (isPhone) {
      return {
        isValid: true,
        isError: false,
        type: 'phone',
        message: locale === 'bn' ? '✓ সঠিক ১১ ডিজিট বাংলাদেশ মোবাইল নম্বর' : '✓ Valid 11-digit BD mobile number',
        tip: locale === 'bn' 
          ? 'টিপস: নম্বরটি Telecom Regulatory Authority ও টেলকো এমএফএস ট্র্যাকিং ডেটাবেসের সাথে রিয়েল-টাইমে যাচাই করা হবে।' 
          : 'Tip: Verified against telecom SIM registries & MFS suspect databases in real time.'
      };
    }
    if (isUrl) {
      return {
        isValid: true,
        isError: false,
        type: 'url',
        message: locale === 'bn' ? '✓ সঠিক ডোমেইন / ওয়েবসাইটের লিঙ্ক ফরম্যাট' : '✓ Valid website / domain URL format',
        tip: locale === 'bn' 
          ? 'টিপস: ডোমেনটি ফিশিং ডাটাবেস ও ন্যাশনাল সার্ট ব্লকলিস্টে যাচাই করা হবে।' 
          : 'Tip: Domain will be scanned against phishing registries and National CERT sinkholes.'
      };
    }
    if (isHandle) {
      return {
        isValid: true,
        isError: false,
        type: 'handle',
        message: locale === 'bn' ? '✓ সোশ্যাল মিডিয়া পেজ লিঙ্ক / ইউজারনেম' : '✓ Valid social handle or page identifier',
        tip: locale === 'bn' 
          ? 'টিপস: পেজ আইডি মেটা সাইবার ক্রাইম ইন্টেলিজেন্স ইউনিটে রিপোর্টের জন্য প্রস্তুত।' 
          : 'Tip: Social page ID queued for platform anti-fraud enforcement review.'
      };
    }
    if (/^\d+$/.test(cleaned.replace(/[\s-]/g, ''))) {
      const digitCount = cleaned.replace(/[\s-]/g, '').length;
      return {
        isValid: false,
        isError: true,
        type: 'invalid_phone',
        message: locale === 'bn' 
          ? `⚠ বাংলাদেশ মোবাইল নম্বর ১১ সংখ্যার হতে হবে (বর্তমানে ${digitCount} ডিজিট)` 
          : `⚠ BD phone numbers must be 11 digits (currently ${digitCount} digits)`,
        tip: locale === 'bn'
          ? 'টিপস: নম্বরটি ০১ দিয়ে শুরু হওয়া ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর হতে হবে (যেমন: 01711002233)। আন্তর্জাতিক কোড (+৮৮) দেওয়ার প্রয়োজন নেই।'
          : 'Tip: BD mobile numbers must start with 013-019 and have 11 digits (e.g. 01711002233). Do not prefix +88.'
      };
    }
    if (cleaned.length < 3) {
      return {
        isValid: false,
        isError: true,
        type: 'too_short',
        message: locale === 'bn' ? '⚠ অন্তত ৩ অক্ষরের প্রতারক নম্বর বা লিঙ্ক দিন' : '⚠ Enter at least 3 characters for suspect target',
        tip: locale === 'bn'
          ? 'টিপস: প্রতারকের পূর্ণ মোবাইল নম্বর (১১ ডিজিট) অথবা পেজ লিংক লিখুন (যেমন: facebook.com/scampage)।'
          : 'Tip: Enter the full mobile number (11 digits) or Facebook / web URL.'
      };
    }
    return {
      isValid: true,
      isError: false,
      type: 'identifier',
      message: locale === 'bn' ? '✓ প্রতারকের আইডেন্টিফায়ার সঠিক ফরম্যাটে আছে' : '✓ Suspect target identifier formatted',
      tip: locale === 'bn' ? 'টিপস: আইডেন্টিফায়ারটি ক্লাস্টার অনুসন্ধানের জন্য প্রস্তুত।' : 'Tip: Target identifier is formatted for cluster searching.'
    };
  }, [reportTarget, locale]);

  const targetCorrection = useMemo(() => {
    const cleaned = reportTarget.trim().toLowerCase();
    if (!cleaned) return null;
    
    // Check for exact matches or partial typos
    for (const [typo, correction] of Object.entries(COMMON_FRAUD_TARGET_TYPOS)) {
      if (cleaned === typo || (cleaned.length > 4 && cleaned.includes(typo))) {
        return correction;
      }
    }
    return null;
  }, [reportTarget]);

  const descriptionValidation = useMemo(() => {
    if (voiceTranscript) {
      return {
        isValid: true,
        isError: false,
        message: locale === 'bn' ? '✓ ৩০ সেকেন্ড ভয়েস ট্রান্সক্রিপ্ট সফলভাবে যুক্ত হয়েছে' : '✓ 30s voice transcript attached',
        tip: locale === 'bn' 
          ? 'ভয়েস ট্রান্সক্রিপ্ট প্রস্তুত; AI স্বয়ংক্রিয়ভাবে মূল কি-ওয়ার্ড ও প্রতারণার ধরণ স্ক্যান করেছে।' 
          : 'Voice transcript attached; speech-to-text is ready for crime keyword extraction.'
      };
    }
    const trimmed = reportDescription.trim();
    if (!trimmed) {
      const hasError = Boolean(reportErrors.reportDescription);
      return {
        isValid: false,
        isError: hasError,
        message: hasError 
          ? (locale === 'bn' ? '⚠ ঘটনার সংক্ষিপ্ত বিবরণ অথবা ৩০ সেকেন্ড ভয়েস রেকর্ড প্রয়োজন' : '⚠ Incident description or voice note required')
          : null,
        tip: locale === 'bn'
          ? 'টিপস: প্রতারক কীভাবে যোগাযোগ করেছিল, কী চেয়েছিল (টাকা/ওটিপি) তা সংক্ষেপে লিখুন (কমপক্ষে ১০ অক্ষর)। অথবা উপরে মাইক্রোফোন চেপে ৩০ সেকেন্ডের ভয়েস রেকর্ড করুন।'
          : 'Tip: Mention how they reached you, what they demanded (OTP/advance fee), or tap Record 30s Voice.'
      };
    }
    if (trimmed.length < 10) {
      const remaining = 10 - trimmed.length;
      return {
        isValid: false,
        isError: true,
        message: locale === 'bn' 
          ? `⚠ অন্তত ১০ অক্ষরের বিবরণ প্রয়োজন (আরও ${remaining}টি অক্ষর বাকি)` 
          : `⚠ At least 10 characters required (${remaining} more needed)`,
        tip: locale === 'bn'
          ? 'টিপস: প্রতারকের অফার বা পেমেন্ট চ্যানেলের বিবরণ যোগ করুন। অন্তত ১০ অক্ষর হলে সিস্টেম অভিযোগটি তদন্তের জন্য গ্রহণ করবে।'
          : 'Tip: Add specific details like the scam offer, channel, or TrxID. At least 10 characters are required for regulatory processing.'
      };
    }
    return {
      isValid: true,
      isError: false,
      message: locale === 'bn' ? `✓ পর্যাপ্ত ঘটনার বিবরণ দেওয়া হয়েছে (${trimmed.length} অক্ষর)` : `✓ Sufficient description provided (${trimmed.length} chars)`,
      tip: locale === 'bn'
        ? 'বিবরণটি যথেষ্ট বিশদ; এটি তদন্তকারীদের প্রতারকের কৌশল দ্রুত বিশ্লেষণ করতে সাহায্য করবে।'
        : 'Detailed description ready for NLP pattern matching and regulatory evidence logs.'
    };
  }, [reportDescription, voiceTranscript, reportErrors.reportDescription, locale]);

  const complainantPhoneValidation = useMemo(() => {
    const trimmed = complainantPhone.trim();
    if (!trimmed) {
      const hasError = Boolean(reportErrors.complainantPhone);
      return {
        isValid: !hasError,
        isError: hasError,
        message: hasError ? reportErrors.complainantPhone : null,
        tip: locale === 'bn' 
          ? 'টিপস: নম্বর দেওয়া সম্পূর্ণ ঐচ্ছিক। নম্বর দিলে বিটিআরসি/সিআইডি কেস ট্র্যাকিং নম্বর ও উদ্ধারের এসএমএস আপডেট পাঠাবে।' 
          : 'Tip: Phone number is optional. Providing it allows regulators to send SMS case tracking updates.'
      };
    }
    const cleaned = trimmed.replace(/[\s-]/g, '');
    const isPhone = /^(?:\+?8801|01)[3-9]\d{8}$/.test(cleaned);
    if (isPhone) {
      return {
        isValid: true,
        isError: false,
        message: locale === 'bn' ? '✓ সঠিক যোগাযোগ নম্বর (ফলোআপের জন্য ব্যবহৃত হবে)' : '✓ Valid contact number for regulatory updates',
        tip: locale === 'bn' 
          ? 'নম্বরটি সার্বভৌম পিআইআই ভল্টে এইএস-২৫৬ দ্বারা এনক্রিপ্ট থাকবে, জনসমক্ষে কখনোই প্রকাশিত হবে না।' 
          : 'Phone number is AES-256 encrypted in sovereign PII vault; zero public disclosure.'
      };
    }
    return {
      isValid: false,
      isError: true,
      message: locale === 'bn' ? '⚠ সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01800112233)' : '⚠ Invalid phone format. Use 11 digits (e.g. 01800112233)',
      tip: locale === 'bn' 
        ? 'টিপস: নম্বরটি ০১ দিয়ে শুরু হওয়া ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর হতে হবে (যেমন: 01711223344 বা 01800112233)। আন্তর্জাতিক কোড (+৮৮) দেওয়ার প্রয়োজন নেই।' 
        : 'Tip: Must be an 11-digit Global Regioni mobile number starting with 013-019 (e.g. 01711223344 or 01800112233). Do not prefix +88.'
    };
  }, [complainantPhone, reportErrors.complainantPhone, locale]);

  // AI-Powered Auto-Categorization Engine
  const aiCategorization = useMemo(() => {
    if (!isAiCategorizationEnabled) return null;
    const combinedText = `${reportTarget} ${reportDescription} ${voiceTranscript}`.toLowerCase().trim();
    if (combinedText.length < 5) return null;

    const categories = [
      {
        id: 'Fake MFS Cash-Back / OTP Call',
        keywords: ['wallet', 'Digital Wallet', 'MFS Wallet', 'mfs', 'otp', 'cashback', 'cash-back', 'pin', '4 digit', 'বিকাশ', 'নগদ', 'রকেট', 'ওটিপি', 'ক্যাশব্যাক', 'পিন', 'পাসওয়ার্ড'],
        reasonBn: 'এমএফএস (বিকাশ/নগদ) বা ওটিপি সংক্রান্ত প্রতারণা শনাক্ত হয়েছে',
        reasonEn: 'Detected MFS (Global Mobile Wallet/Digital Wallet) or OTP/PIN keywords'
      },
      {
        id: 'Online Shop Advance Money Scam',
        keywords: ['advance', 'adv', 'payment', 'product', 'facebook', 'fb', 'page', 'delivery', 'dress', 'shirt', 'cloth', 'item', 'এডভান্স', 'অগ্রিম', 'পণ্য', 'পেইজ', 'ডেলিভারি', 'অর্ডার', 'টাকা নিয়া'],
        reasonBn: 'অনলাইন শপ বা অগ্রিম পেমেন্ট সম্পর্কিত প্রতারণা শনাক্ত হয়েছে',
        reasonEn: 'Detected e-commerce or advance payment scam indicators'
      },
      {
        id: 'Fake Overseas Job / Visa Trap',
        keywords: ['visa', 'job', 'overseas', 'dubai', 'qatar', 'saudi', 'agency', 'passport', 'work permit', 'salary', 'ভিসা', 'চাকরি', 'পাসপোর্ট', 'বিদেশ', 'এজেন্সি', 'ওয়ার্ক পারমিট', 'বেতন'],
        reasonBn: 'বিদেশি ভিসা বা ভূয়া চাকরির প্রলোভন শনাক্ত হয়েছে',
        reasonEn: 'Detected overseas visa or fraudulent job offer keywords'
      },
      {
        id: 'Telegram / YouTube Like Job',
        keywords: ['telegram', 'youtube', 'like', 'subscribe', 'task', 'crypto', 'usdt', 'investment', 'daily income', 'টেলিগ্রাম', 'ইউটিউব', 'লাইক', 'টাস্ক', 'ইনভেস্টমেন্ট', 'দৈনিক আয়'],
        reasonBn: 'টেলিগ্রাম টাস্ক বা ইউটিউব লাইক ইনভেস্টমেন্ট স্ক্যাম শনাক্ত হয়েছে',
        reasonEn: 'Detected Telegram task or video-like investment trap'
      },
      {
        id: 'Phishing Link / Website',
        keywords: ['http', 'https', '.com', '.xyz', '.site', 'link', 'website', 'url', 'login', 'phishing', 'লিংক', 'ওয়েবসাইট', 'পাসওয়ার্ড', 'লগইন', 'ফিশিং'],
        reasonBn: 'ফিশিং ওয়েবসাইট বা ভুয়া ইউআরএল লিঙ্ক শনাক্ত হয়েছে',
        reasonEn: 'Detected phishing link or suspicious web domain URL'
      },
      {
        id: 'Courier Fake Tracking Charge',
        keywords: ['courier', 'steadfast', 'pathao', 'redx', 'paperfly', 'tracking', 'parcel', 'charge', 'delivery fee', 'কুরিয়ার', 'পার্সেল', 'চার্জ', 'ট্র্যাকিং', 'পাঠাও'],
        reasonBn: 'কুরিয়ার ডেলিভারি বা ভূয়া পার্সেল চার্জ প্রতারণা শনাক্ত হয়েছে',
        reasonEn: 'Detected courier tracking or fake parcel delivery charge'
      }
    ];

    let bestMatch: {
      category: string;
      confidence: number;
      keywordsFound: string[];
      reason: string;
    } | null = null;

    for (const cat of categories) {
      const matched = cat.keywords.filter(kw => combinedText.includes(kw));
      if (matched.length > 0) {
        const confidence = Math.min(99, 70 + matched.length * 9);
        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = {
            category: cat.id,
            confidence,
            keywordsFound: matched,
            reason: locale === 'bn' ? cat.reasonBn : cat.reasonEn
          };
        }
      }
    }

    return bestMatch;
  }, [reportDescription, voiceTranscript, reportTarget, locale]);

  // Handler to manually or auto apply AI category
  const handleApplyAiCategory = (categoryToApply?: string) => {
    const targetCat = categoryToApply || aiCategorization?.category;
    if (!targetCat) return;
    setReportCategory(targetCat);
    if (reportErrors.reportCategory) {
      setReportErrors(prev => ({ ...prev, reportCategory: '' }));
    }
    showToast(
      locale === 'bn'
        ? `✨ AI অটো-ক্যাটাগরি সেট করা হয়েছে: "${targetCat}"`
        : `✨ AI Auto-Categorized to: "${targetCat}"`,
      'success'
    );
  };

  // Evidence Vault Attachment Handlers
  const pushAttachmentWithStatusProgression = (newItem: EvidenceAttachment) => {
    newItem.status = 'PENDING';
    setEvidenceAttachments(prev => [...prev, newItem]);

    setTimeout(() => {
      setEvidenceAttachments(prev => prev.map(a => a.id === newItem.id ? { ...a, status: 'ENCRYPTING' } : a));
    }, 350);

    setTimeout(() => {
      setEvidenceAttachments(prev => prev.map(a => a.id === newItem.id ? { ...a, status: 'VAULTED' } : a));
    }, 950);
  };

  const handleFileUpload = (files: FileList | null, defaultCategory: 'SCAM_CHAT' | 'PAYMENT_SLIP' | 'CALL_LOG' | 'OTHER' = 'SCAM_CHAT') => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const fakeHash = 'sha256:' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
      const fileSizeFormatted = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      const previewUrl = URL.createObjectURL(file);

      const newItem: EvidenceAttachment = {
        id: `EV-${Date.now()}-${index}`,
        fileName: file.name,
        fileType: file.type || 'image/png',
        fileSize: fileSizeFormatted,
        previewUrl,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vaultHash: fakeHash,
        category: defaultCategory,
        status: 'PENDING'
      };

      pushAttachmentWithStatusProgression(newItem);
    });

    showToast(
      locale === 'bn'
        ? `🔒 প্রমাণপত্র এভিডেন্স ভল্টে সুরক্ষিতভাবে সিঙ্ক্রোনাইজ করা হচ্ছে`
        : `🔒 Evidence attachments syncing into secure vault`,
      'success'
    );
  };


  const getEvidenceStatusBadge = (status?: 'PENDING' | 'ENCRYPTING' | 'VAULTED') => {
    if (status === 'PENDING') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
          ⏳ {locale === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}
        </span>
      );
    }
    if (status === 'ENCRYPTING') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 animate-pulse">
          🔐 {locale === 'bn' ? 'এনক্রিপ্ট হচ্ছে...' : 'Encrypting...'}
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
        🛡️ {locale === 'bn' ? 'ভল্টে সংরক্ষিত' : 'Vaulted'}
      </span>
    );
  };

  const handleRemoveAttachment = (id: string) => {

    setEvidenceAttachments(prev => prev.filter(att => att.id !== id));
    showToast(
      locale === 'bn' ? 'প্রমাণ ফাইল এভিডেন্স ভল্ট থেকে মুছে ফেলা হয়েছে' : 'Attachment removed from vault',
      'info'
    );
  };

  const handleDownloadEvidenceManifest = async () => {
    if (evidenceAttachments.length === 0) {
      showToast(locale === 'bn' ? 'এভিডেন্স ভল্টে কোনো ফাইল নেই।' : 'No items in the evidence vault to export.', 'warning');
      return;
    }
    try {
      const zip = new JSZip();
      
      // 1. Add each attachment file to ZIP
      for (const att of evidenceAttachments) {
        if (att.previewUrl && att.previewUrl.startsWith('data:')) {
          const base64Data = att.previewUrl.split(',')[1];
          zip.file(`evidence_files/${att.fileName}`, base64Data, { base64: true });
        } else {
          zip.file(`evidence_files/${att.fileName}`, `Evidence Item: ${att.fileName}\nVault Hash: ${att.vaultHash}\nSize: ${att.fileSize}`);
        }
      }

      // 2. Add JSON-formatted audit log of metadata
      const auditLog = {
        manifestVersion: "1.0.0",
        exportTimestamp: new Date().toISOString(),
        reportTarget: reportTarget || "N/A",
        reportCategory: reportCategory || "N/A",
        reportAmountRange: reportAmountRange || "N/A",
        reportDescription: reportDescription || "N/A",
        complainantPhone: isAnonymous ? "ANONYMOUS" : (complainantPhone || "N/A"),
        isAnonymous,
        totalVaultItems: evidenceAttachments.length,
        items: evidenceAttachments.map(att => ({
          id: att.id,
          fileName: att.fileName,
          fileSize: att.fileSize,
          vaultHash: att.vaultHash,
          timestamp: new Date().toISOString()
        })),
        systemVerification: {
          wormStorage: "Immutable WORM Storage Hash-Sealed",
          regulatoryFramework: "Global Region ICT Act & Telecommunication Regulatory Guideline"
        }
      };

      zip.file("evidence_manifest_audit_log.json", JSON.stringify(auditLog, null, 2));

      // 3. Optional PII-Redacted Audit Log
      if (includePiiRedactedLog) {
        const piiRedactedLog = {
          ...auditLog,
          reportTarget: reportTarget ? reportTarget.replace(/^(\+?\d{2,3})?\d{5,}(\d{3})$/, '$1*****$2') : "[REDACTED]",
          complainantPhone: isAnonymous ? "ANONYMOUS" : (complainantPhone ? complainantPhone.replace(/^(\+?\d{2,3})?\d{5,}(\d{3})$/, '$1*****$2') : "[REDACTED]"),
          reportDescription: reportDescription ? reportDescription.replace(/\b(?:\d[ -]*){10,}\b/g, '[REDACTED_PHONE_OR_DIGITS]') : "[REDACTED]",
          privacyComplianceNotice: "Redacted in compliance with GDPR Art. 32 and local Data Privacy Protection Acts."
        };
        zip.file("evidence_manifest_audit_log_pii_redacted.json", JSON.stringify(piiRedactedLog, null, 2));
      }

      // Generate ZIP and trigger download
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Evidence_Vault_Manifest_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(locale === 'bn' ? 'এভিডেন্স ম্যানিফেস্ট জিপ ফাইল সফলভাবে ডাউনলোড হয়েছে!' : 'Evidence Manifest ZIP successfully downloaded!', 'success');
    } catch (err) {
      console.error('Failed to generate evidence ZIP manifest', err);
      showToast(locale === 'bn' ? 'জিপ ফাইল তৈরিতে ত্রুটি ঘটেছে।' : 'Failed to generate evidence manifest ZIP.', 'error');
    }
  };

  const handleEmptyVault = () => {
    const confirmMsg = locale === 'bn' 
      ? 'আপনি কি নিশ্চিত যে আপনি এভিডেন্স ভল্টের সমস্ত ফাইল মুছে ফেলতে চান?' 
      : 'Are you sure you want to empty the evidence vault and remove all attached files?';
    if (window.confirm(confirmMsg)) {
      setEvidenceAttachments([]);
      showToast(
        locale === 'bn' ? 'এভিডেন্স ভল্ট খালি করা হয়েছে।' : 'Evidence vault successfully emptied.',
        'info'
      );
    }
  };

  const handleAddSampleEvidence = (sampleType: 'payment_slip' | 'chat_screenshot' | 'otp_sms') => {
    const fakeHash = 'sha256:' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
    let sampleData: EvidenceAttachment;

    if (sampleType === 'payment_slip') {
      sampleData = {
        id: `EV-${Date.now()}-1`,
        fileName: 'Global Mobile Wallet_Trx_3A901F_Slip.png',
        fileType: 'image/png',
        fileSize: '1.4 MB',
        previewUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vaultHash: fakeHash,
        category: 'PAYMENT_SLIP',
        status: 'PENDING'
      };
    } else if (sampleType === 'chat_screenshot') {
      sampleData = {
        id: `EV-${Date.now()}-2`,
        fileName: 'FB_Messenger_Scam_Chat.png',
        fileType: 'image/png',
        fileSize: '820 KB',
        previewUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vaultHash: fakeHash,
        category: 'SCAM_CHAT',
        status: 'PENDING'
      };
    } else {
      sampleData = {
        id: `EV-${Date.now()}-3`,
        fileName: 'OTP_Call_Log_Screenshot.jpg',
        fileType: 'image/jpeg',
        fileSize: '540 KB',
        previewUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vaultHash: fakeHash,
        category: 'CALL_LOG',
        status: 'PENDING'
      };
    }

    pushAttachmentWithStatusProgression(sampleData);
    showToast(
      locale === 'bn'
        ? `📸 নমুনা ${sampleData.fileName} এভিডেন্স ভল্টে সিঙ্ক্রোনাইজ করা হচ্ছে`
        : `📸 Sample ${sampleData.fileName} syncing into evidence vault`,
      'success'
    );
  };

  // Tab 3: Alerts & Heat Map State
  const [alertsList, setAlertsList] = useState<ScamAlertItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [authorityFilter, setAuthorityFilter] = useState<string>('ALL');
  const [activeSpikes, setActiveSpikes] = useState<SpikeAlertSignal[]>([]);
  const [harmsData, setHarmsData] = useState(ScamAlertEngine.calculateHarmsPrevented(8412));
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<ScamAlertItem | null>(null);

  // Memoized Chart Datasets for Citizens Protection
  const weeklyProtectionsData = useMemo(() => [
    { name: locale === 'bn' ? 'সোম' : 'Mon', verified: 340, flagged: 45, savedTaka: 120 },
    { name: locale === 'bn' ? 'মঙ্গল' : 'Tue', verified: 410, flagged: 60, savedTaka: 190 },
    { name: locale === 'bn' ? 'বুধ' : 'Wed', verified: 480, flagged: 85, savedTaka: 250 },
    { name: locale === 'bn' ? 'বৃহস্পতি' : 'Thu', verified: 520, flagged: 110, savedTaka: 310 },
    { name: locale === 'bn' ? 'শুক্রবার' : 'Fri', verified: 610, flagged: 130, savedTaka: 420 },
    { name: locale === 'bn' ? 'শনি' : 'Sat', verified: 580, flagged: 95, savedTaka: 380 },
    { name: locale === 'bn' ? 'রবি' : 'Sun', verified: 490, flagged: 70, savedTaka: 290 },
  ], [locale]);

  const scamCategoriesData = useMemo(() => [
    { name: locale === 'bn' ? 'বিকাশ/MFS প্রতারণা' : 'MFS Spoofing', value: 420, color: '#ec4899' },
    { name: locale === 'bn' ? 'নকল ই-কমার্স ওয়েবসাইট' : 'Fake E-Shop', value: 290, color: '#8b5cf6' },
    { name: locale === 'bn' ? 'পার্ট-টাইম চাকুরীর স্ক্যাম' : 'Job Scams', value: 210, color: '#3b82f6' },
    { name: locale === 'bn' ? 'লটারি ও পুরষ্কার দাবি' : 'Lottery Claims', value: 160, color: '#10b981' },
    { name: locale === 'bn' ? 'ভিসা ও ইমিগ্রেশন জালিয়াতি' : 'Visa Fraud', value: 110, color: '#f59e0b' },
  ], [locale]);

  const [activeChartTab, setActiveChartTab] = useState<'trends' | 'categories'>('trends');

  // Tab 4: Scam School State
  const [lessons, setLessons] = useState<ScamLesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<ScamLesson | null>(null);
  const [quizAnswerSelected, setQuizAnswerSelected] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userScore, setUserScore] = useState(1);
  const [badges, setBadges] = useState<CitizenBadge[]>([]);

  // Tab 5: Verify State
  const [verifyMode, setVerifyMode] = useState<'badge' | 'agent' | 'doc' | 'nfc'>('badge');
  const [badgeQuery, setBadgeQuery] = useState('TB-BD-2026-98101');
  const [badgeResult, setBadgeResult] = useState<TrustBadgeVerificationResult | null>(null);
  const [agentQuery, setAgentQuery] = useState('AGT-Global Mobile Wallet-8819');
  const [agentResult, setAgentResult] = useState<AgentVerificationResult | null>(null);

  // Load Initial Data
  useEffect(() => {
    setAlertsList(ScamAlertEngine.getAlerts('BD'));
    setActiveSpikes(ScamAlertEngine.getActiveSpikes());
    setLessons(ScamSchoolService.getLessons());
    setBadges(ScamSchoolService.getBadges(userScore));
  }, [userScore]);

  // Voice recording timer
  useEffect(() => {
    let interval: any;
    if (isVoiceRecording) {
      interval = setInterval(() => {
        setVoiceSeconds(prev => {
          if (prev >= 30) {
            handleStopVoiceRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVoiceRecording]);

  // Trigger evaluation
  const handleRunCheck = (queryToEvaluate?: string, typeOverride?: any) => {
    const q = (queryToEvaluate || inputQuery).trim();
    if (!q) return;
    const t = typeOverride || queryType;
    setIsEvaluating(true);
    setCurrentVerdict(null);

    setTimeout(() => {
      const v = TrustVerdictEngine.evaluateCheck(q, t, 'BD', 'dev_citizen_dhaka_01', locale);
      setCurrentVerdict(v);
      setIsEvaluating(false);

      const newScan: RecentScanItem = {
        id: `scan-${Date.now()}`,
        query: q,
        type: t,
        tier: v.tier,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setRecentScans(prev => {
        const filtered = prev.filter(item => item.query !== q);
        const updated = [newScan, ...filtered].slice(0, 5);
        try {
          localStorage.setItem('trust_check_recent_scans', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }, 450);
  };

  // AI Smart Scan & Extraction Heuristics for Auto-Filling
  const handleSmartScan = (textToParse: string) => {
    const raw = textToParse.trim();
    if (!raw) return;
    setIsSmartScanning(true);
    setSmartScanResult(null);

    setTimeout(() => {
      // Extraction heuristics
      let detectedType: 'phone' | 'wallet' | 'website' | 'qr' | 'name' = 'phone';
      let extractedValue = '';
      let riskScore = 15;
      let keyPhrases: string[] = [];
      let explanation = '';

      // Match phone/Global Mobile Wallet numbers (11 digits, standard BD numbers starting with 01)
      const phoneRegex = /(01[3-9]\d{8})/g;
      const phoneMatches = raw.match(phoneRegex);

      // Match website URLs
      const urlRegex = /((https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/i;
      const urlMatches = raw.match(urlRegex);

      if (urlMatches && urlMatches[0]) {
        detectedType = 'website';
        extractedValue = urlMatches[0].replace(/^(https?:\/\/)?(www\.)?/i, '').toLowerCase();
        if (extractedValue.includes('verify') || extractedValue.includes('security') || extractedValue.includes('wallet') || extractedValue.includes('-deal') || extractedValue.includes('.xyz')) {
          riskScore = 85;
        } else {
          riskScore = 30;
        }
      } else if (phoneMatches && phoneMatches[0]) {
        extractedValue = phoneMatches[0];
        const lowers = raw.toLowerCase();
        if (lowers.includes('wallet') || lowers.includes('Digital Wallet') || lowers.includes('MFS Wallet') || lowers.includes('mfs')) {
          detectedType = 'wallet';
        } else {
          detectedType = 'phone';
        }
        
        if (lowers.includes('prize') || lowers.includes('won') || lowers.includes('lottery') || lowers.includes('blocked') || lowers.includes('suspend') || lowers.includes('pin') || lowers.includes('verify') || lowers.includes('টাকা') || lowers.includes('পুরস্কার')) {
          riskScore = 92;
        } else {
          riskScore = 20;
        }
      }

      const lowersText = raw.toLowerCase();
      if (lowersText.includes('won') || lowersText.includes('prize') || lowersText.includes('পুরস্কার')) {
        keyPhrases.push('Lottery/Prize Claim');
      }
      if (lowersText.includes('part-time') || lowersText.includes('job') || lowersText.includes('income') || lowersText.includes('চাকরি')) {
        keyPhrases.push('Part-time Job Offer');
      }
      if (lowersText.includes('lock') || lowersText.includes('suspend') || lowersText.includes('block') || lowersText.includes('সাময়িক বন্ধ')) {
        keyPhrases.push('Urgent Account Verification');
      }
      if (lowersText.includes('pin') || lowersText.includes('otp') || lowersText.includes('পিন')) {
        keyPhrases.push('Sensitive Credentials Request');
      }

      if (detectedType === 'website') {
        explanation = `AI model extracted suspicious Web Domain: "${extractedValue}" with ${riskScore > 50 ? 'HIGH' : 'LOW'} threat factor based on syntax matching spoof-protection lists.`;
      } else if (extractedValue) {
        explanation = `AI model extracted suspicious MFS Account / Mobile Contact Number: "${extractedValue}". Threat risk computed dynamically from SMS content structure and alert history.`;
      } else {
        explanation = 'AI scanner was unable to extract active merchant parameters. Please verify format manually.';
        detectedType = null as any;
      }

      setSmartScanResult({
        detectedType,
        extractedValue,
        riskScore,
        keyPhrases,
        explanation
      });
      setIsSmartScanning(false);
      showToast('AI smart analysis and parameter extraction complete.', 'success');
    }, 1200);
  };

  // Haptic feedback helper for tactile mobile responses
  const triggerHapticFeedback = (pattern: number | number[] = 40) => {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore unsupported devices / permissions
    }
  };

  // QR Scanner Handler: Populates query & auto-evaluates verification verdict
  const handleQrScanSuccess = (scannedData: string, detectedType?: 'wallet' | 'phone' | 'website' | 'qr' | 'name') => {
    // Subtle device vibration trigger providing immediate tactile feedback upon successful scan
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([35, 30, 45]);
      }
    } catch {}
    triggerHapticFeedback(45);

    if (qrScannerTarget === 'badge') {
      setBadgeQuery(scannedData);
      const res = TrustVerificationService.verifyTrustBadge(scannedData);
      setBadgeResult(res);
      showToast(`🎯 Trust Badge QR Detected: [${scannedData}] — Verified ZK Proof!`, 'success');
      return;
    }
    if (qrScannerTarget === 'agent') {
      setAgentQuery(scannedData);
      const res = TrustVerificationService.verifyAgent(scannedData);
      setAgentResult(res);
      showToast(`🎯 Field Agent QR Detected: [${scannedData}] — Verified Against Regulatory Registry!`, 'success');
      return;
    }
    if (qrScannerTarget === 'evidence') {
      const fakeHash = 'sha256:' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
      const qrEvidence: EvidenceAttachment = {
        id: `EV-QR-${Date.now()}`,
        fileName: `Doc_Evidence_QR_${scannedData.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 12)}.png`,
        fileType: 'image/png',
        fileSize: '680 KB',
        previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vaultHash: fakeHash,
        category: 'OTHER',
        status: 'PENDING'
      };
      pushAttachmentWithStatusProgression(qrEvidence);
      showToast(
        locale === 'bn'
          ? `📸 প্রমাণপত্র কিউআর [${scannedData}] এভিডেন্স ভল্টে সিঙ্ক্রোনাইজ করা হচ্ছে`
          : `📸 Document Evidence QR [${scannedData}] syncing into Vault`,
        'success'
      );
      return;
    }

    // Default Trust Check flow: Populate query & automatically execute check
    const targetType = detectedType || 'qr';
    setInputQuery(scannedData);
    setQueryType(targetType);
    showToast(`🎯 QR Data Acquired: [${scannedData}] — Executing Instant Trust Verification!`, 'success');
    handleRunCheck(scannedData, targetType);
  };

  const handleQrBatchScanSuccess = (items: Array<{ data: string; type: 'wallet' | 'phone' | 'website' | 'qr' | 'name' }>) => {
    if (items.length === 0) return;
    
    showToast(
      locale === 'bn' 
        ? `${items.length} টি কিউআর কোড প্রসেস করা হচ্ছে...` 
        : `Processing batch of ${items.length} items...`, 
      'info'
    );
    
    // Process each item in sequence with a small staggered delay for better UX
    items.forEach((item, index) => {
      setTimeout(() => {
        handleQrScanSuccess(item.data, item.type);
      }, index * 1000);
    });
  };

  const handleStartVoiceRecording = () => {
    setIsVoiceRecording(true);
    setVoiceSeconds(0);
    setVoiceTranscript('');
  };

  const handleStopVoiceRecording = () => {
    setIsVoiceRecording(false);
    // Simulate high-accuracy faster-whisper Bangla transcript
    setVoiceTranscript(
      locale === 'bn'
        ? '০১৭... নম্বর থেকে ফোন করে বিকাশ কাস্টমার কেয়ার দাবি করেছিল। পরে অ্যাকাউন্টে সমস্যা হয়েছে বলে ওটিপি চেয়েছিল। ওটিপি না দেওয়ায় গালাগালি করে লাইন কেটে দিয়েছে।'
        : 'Received a call claiming to be Global Mobile Wallet helpdesk demanding OTP code due to KYC suspension. Upon refusal, they became abusive and disconnected.'
    );
    if (!reportDescription) {
      setReportDescription(
        locale === 'bn'
          ? '০১৭... নম্বর থেকে ফোন করে বিকাশ কাস্টমার কেয়ার দাবি করেছিল। ওটিপি চেয়ে টাকা আত্মসাতের চেষ্টা করেছে।'
          : 'Suspect impersonated Global Mobile Wallet customer representative attempting unauthorized OTP fund extraction.'
      );
    }
  };

  // Helper to resolve Global Region District/Division metadata from coordinates
  const getDistrictMetadata = (lat: number, lng: number) => {
    if (lat >= 23.5 && lat <= 24.2 && lng >= 90.0 && lng <= 90.7) {
      return { district: 'Dhaka', division: 'Dhaka Division', areaName: 'Dhaka Metropolitan (Gulshan/Motijheel)' };
    } else if (lat >= 22.0 && lat <= 23.0 && lng >= 91.5 && lng <= 92.5) {
      return { district: 'Chittagong', division: 'Chittagong Division', areaName: 'Agrabad / Port Zone' };
    } else if (lat >= 24.5 && lat <= 25.2 && lng >= 91.5 && lng <= 92.2) {
      return { district: 'Sylhet', division: 'Sylhet Division', areaName: 'Zindabazar / Sadar' };
    } else if (lat >= 24.0 && lat <= 24.8 && lng >= 88.3 && lng <= 89.2) {
      return { district: 'Rajshahi', division: 'Rajshahi Division', areaName: 'Shaheb Bazar' };
    } else if (lat >= 22.5 && lat <= 23.2 && lng >= 89.0 && lng <= 89.8) {
      return { district: 'Khulna', division: 'Khulna Division', areaName: 'Khulna City' };
    } else {
      return { district: 'Dhaka', division: 'Dhaka Division', areaName: 'Central District Zone' };
    }
  };

  const handleCaptureLocation = (isAutoTrigger = false) => {
    setIsCapturingLocation(true);
    setLocationError(null);

    if (!('geolocation' in navigator)) {
      const fallbackLat = 23.8103;
      const fallbackLng = 90.4125;
      const meta = getDistrictMetadata(fallbackLat, fallbackLng);
      setReportLocation({
        lat: fallbackLat,
        lng: fallbackLng,
        accuracy: 15,
        ...meta
      });
      setLocationCaptured(true);
      setIsCapturingLocation(false);
      if (!isAutoTrigger) {
        showToast(
          locale === 'bn'
            ? '📍 স্থান ক্যাপচার হয়েছে: ঢাকা সদর (২৩.৮১০৩° N, ৯০.৪১২৫° E)'
            : '📍 Location captured: Dhaka Central (23.8103° N, 90.4125° E)',
          'info'
        );
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(4));
        const lng = parseFloat(position.coords.longitude.toFixed(4));
        const accuracy = Math.round(position.coords.accuracy || 12);
        const meta = getDistrictMetadata(lat, lng);

        setReportLocation({
          lat,
          lng,
          accuracy,
          ...meta
        });
        setLocationCaptured(true);
        setIsCapturingLocation(false);

        if (!isAutoTrigger) {
          showToast(
            locale === 'bn'
              ? `📍 নিখুঁত স্থান ক্যাপচার করা হয়েছে: ${meta.district} জোন (${lat}° N, ${lng}° E • নির্ভুলতা ±${accuracy} মি.)`
              : `📍 Location captured: ${meta.district} District (${lat}° N, ${lng}° E • ±${accuracy}m accuracy)`,
            'success'
          );
        }
      },
      (err) => {
        console.warn('Geolocation error / notice:', err.message);
        const fallbackLat = 23.8103;
        const fallbackLng = 90.4125;
        const meta = getDistrictMetadata(fallbackLat, fallbackLng);
        setReportLocation({
          lat: fallbackLat,
          lng: fallbackLng,
          accuracy: 25,
          ...meta
        });
        setLocationCaptured(true);
        setIsCapturingLocation(false);
        if (!isAutoTrigger) {
          showToast(
            locale === 'bn'
              ? `📍 আনুমানিক অবস্থান ক্যাপচার করা হয়েছে: ${meta.district} জোন (${fallbackLat}° N, ${fallbackLng}° E)`
              : `📍 Estimated Location captured: ${meta.district} Zone (${fallbackLat}° N, ${fallbackLng}° E)`,
            'info'
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000
      }
    );
  };

  const vaultStats = useMemo(() => {
    if (evidenceAttachments.length === 0) return { count: 0, sizeMb: '0.00' };
    
    // Sum up the sizes (assuming format like "1.2 MB" or "450 KB")
    const totalBytes = evidenceAttachments.reduce((acc, curr) => {
      const sizeStr = curr.fileSize.toLowerCase();
      let bytes = 0;
      if (sizeStr.includes('mb')) {
        bytes = parseFloat(sizeStr) * 1024 * 1024;
      } else if (sizeStr.includes('kb')) {
        bytes = parseFloat(sizeStr) * 1024;
      } else {
        bytes = parseFloat(sizeStr);
      }
      return acc + bytes;
    }, 0);

    return {
      count: evidenceAttachments.length,
      sizeMb: (totalBytes / (1024 * 1024)).toFixed(2)
    };
  }, [evidenceAttachments]);

  // Auto-acquire geolocation when user accesses report tab
  useEffect(() => {
    if (activeTab === 'report' && !locationCaptured && !isCapturingLocation) {
      handleCaptureLocation(true);
    }
  }, [activeTab]);

  const handleQuickReportFromVerdict = () => {
    if (currentVerdict) {
      setReportTarget(currentVerdict.maskedQuery);
      setReportCategory(currentVerdict.evidence.category || 'Fraud Investigation Report');
    }
    setReportStep(1);
    setActiveTab('report');
    triggerHapticFeedback(30);
  };

  const handleNextReportStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setReportErrors({});

    if (reportStep === 1) {
      if (!reportTarget.trim()) {
        setReportErrors({ reportTarget: locale === 'bn' ? 'প্রতারক নম্বর বা লিঙ্ক প্রদান করা আবশ্যক' : 'Suspect number or link is required' });
        showToast(locale === 'bn' ? 'অনুগ্রহ করে প্রতারক নম্বর বা লিঙ্ক উল্লেখ করুন।' : 'Please enter the suspect number or link.', 'warning');
        triggerHapticFeedback([40, 60, 40]);
        triggerShakeAnimation();
        return;
      }
      if (targetValidation.isError) {
        setReportErrors({ reportTarget: targetValidation.message || (locale === 'bn' ? 'প্রতারক নম্বর বা লিঙ্কের ফরম্যাট সঠিক নয়' : 'Invalid suspect number or link format') });
        showToast(locale === 'bn' ? 'প্রতারক নম্বর বা লিঙ্কের ফরম্যাট সংশোধন করুন।' : 'Please fix the suspect target format before continuing.', 'warning');
        triggerHapticFeedback([40, 60, 40]);
        triggerShakeAnimation();
        return;
      }
      setStepDirection('forward');
      setReportStep(2);
      triggerHapticFeedback([30, 40, 30]);
      showToast(locale === 'bn' ? 'ধাপ ১ সম্পন্ন! ক্ষতি ও প্রমাণ যুক্ত করুন।' : 'Step 1 complete! Add loss & evidence details.', 'info');
    } else if (reportStep === 2) {
      if (descriptionValidation.isError) {
        setReportErrors({ reportDescription: descriptionValidation.message || (locale === 'bn' ? 'ঘটনার বিবরণ অন্তত ১০ অক্ষরের হতে হবে অথবা ৩০ সেকেন্ড ভয়েস রেকর্ড করুন' : 'Description must be at least 10 characters or record a 30s voice note') });
        showToast(locale === 'bn' ? 'অনুগ্রহ করে অন্তত ১০ অক্ষরের বিবরণ দিন অথবা ভয়েস রেকর্ড করুন।' : 'Please provide at least 10 characters of description or record voice.', 'warning');
        triggerHapticFeedback([40, 60, 40]);
        triggerShakeAnimation();
        return;
      }
      setStepDirection('forward');
      setReportStep(3);
      triggerHapticFeedback([30, 40, 30]);
      showToast(locale === 'bn' ? 'ধাপ ২ সম্পন্ন! রিভিউ ও চূড়ান্ত দাখিল করুন।' : 'Step 2 complete! Review & submit report.', 'info');
    }
  };

  const handlePrevReportStep = () => {
    setStepDirection('backward');
    setReportStep(prev => Math.max(1, prev - 1));
    triggerHapticFeedback(20);
  };

  const handleClearReportForm = () => {
    setReportTarget('');
    setReportCategory('Fake MFS Cash-Back / OTP Call');
    setReportAmountRange('৳1,000 - ৳5,000');
    setReportDescription('');
    setEvidenceAttachments([]);
    setReportStep(1);
    setReportErrors({});
    setVoiceTranscript('');
    setIncludePiiRedactedLog(true);
    setSubmittedReportRef(null);
    setIsAnonymous(true);
    setComplainantPhone('');
    triggerHapticFeedback(50);
    showToast(locale === 'bn' ? 'অভিযোগ ফর্ম রিসেট করা হয়েছে' : 'Report form has been cleared', 'info');
  };

  const handleJumpToReportStep = (targetStep: number) => {
    if (targetStep === reportStep) return;
    if (targetStep > reportStep && reportStep === 1 && !reportTarget.trim()) {
      setReportErrors({ reportTarget: locale === 'bn' ? 'প্রতারক নম্বর বা লিঙ্ক প্রদান করা আবশ্যক' : 'Suspect number or link is required' });
      triggerHapticFeedback([40, 60, 40]);
      triggerShakeAnimation();
      return;
    }
    setStepDirection(targetStep > reportStep ? 'forward' : 'backward');
    setReportStep(targetStep);
    triggerHapticFeedback(targetStep > reportStep ? [30, 40, 30] : 20);
  };

  const handleSubmitGrievanceReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportErrors({});

    const validationResult = grievanceReportSchema.safeParse({
      reportTarget,
      reportCategory,
      reportAmountRange,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === 'string') {
          fieldErrors[path] = issue.message;
        }
      });
      setReportErrors(fieldErrors);
      triggerHapticFeedback([50, 50, 50]);
      showToast(locale === 'bn' ? 'অনুগ্রহ করে ভুলের জায়গাগুলো সংশোধন করুন।' : 'Please correct the highlighted errors.', 'warning');
      return;
    }

    if (targetValidation.isError) {
      setReportErrors(prev => ({ ...prev, reportTarget: targetValidation.message || (locale === 'bn' ? 'প্রতারক নম্বর বা লিঙ্কের ফরম্যাট সংশোধন করুন' : 'Please fix suspect target format') }));
      setReportStep(1);
      triggerShakeAnimation();
      triggerHapticFeedback([50, 50, 50]);
      showToast(locale === 'bn' ? 'ধাপ ১-এ প্রতারক নম্বর বা লিঙ্কের ফরম্যাট সংশোধন করুন।' : 'Please fix suspect target format in Step 1.', 'warning');
      return;
    }

    if (descriptionValidation.isError) {
      setReportErrors(prev => ({ ...prev, reportDescription: descriptionValidation.message || (locale === 'bn' ? 'ঘটনার বিবরণ অন্তত ১০ অক্ষরের হতে হবে' : 'Description must be at least 10 characters') }));
      setReportStep(2);
      triggerShakeAnimation();
      triggerHapticFeedback([50, 50, 50]);
      showToast(locale === 'bn' ? 'ধাপ ২-এ ঘটনার বিবরণ অন্তত ১০ অক্ষরের হতে হবে।' : 'Please provide at least 10 characters of description in Step 2.', 'warning');
      return;
    }

    if (!isAnonymous && complainantPhone.trim() && complainantPhoneValidation.isError) {
      setReportErrors(prev => ({ ...prev, complainantPhone: complainantPhoneValidation.message || (locale === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন' : 'Invalid 11-digit mobile number') }));
      triggerShakeAnimation();
      triggerHapticFeedback([50, 50, 50]);
      showToast(locale === 'bn' ? 'অনুগ্রহ করে আপনার সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।' : 'Please provide a valid 11-digit contact number.', 'warning');
      return;
    }

    setIsSubmittingReport(true);
    triggerHapticFeedback([40, 30, 40]);
    setTimeout(() => {
      const refCode = `GRV-BD-2026-${(Array.from(crypto.getRandomValues(new Uint16Array(1)))[0] % 90000) + 10000}`;
      setSubmittedReportRef(refCode);
      
      // Save to My Grievances History
      saveSubmittedGrievance({
        id: `grv_${Date.now()}`,
        refCode,
        target: reportTarget.trim() || 'Suspect Entity / Channel',
        category: reportCategory,
        amountRange: reportAmountRange,
        description: reportDescription || `Citizen reported target: ${reportTarget}`,
        submittedAt: new Date().toISOString(),
        status: 'Submitted',
        location: reportLocation ? { district: reportLocation.district, areaName: reportLocation.areaName, lat: reportLocation.lat, lng: reportLocation.lng } : undefined,
        lastUpdated: new Date().toISOString(),
        timeline: [
          {
            status: 'Submitted',
            title: 'Report Registered in Sovereign Queue',
            description: 'Grievance received and assigned high-priority triage token.',
            timestamp: new Date().toISOString()
          }
        ]
      });

      // Register with real-time grievance notification listener
      GrievanceNotificationService.registerMonitoredRef(refCode);
      GrievanceNotificationService.broadcastStatusChange({
        refCode,
        entityName: reportTarget.trim() || 'Suspect Entity / Channel',
        newStatus: 'SUBMITTED',
        title: locale === 'bn' ? 'অভিযোগ সার্বভৌম কিউতে গৃহীত হয়েছে' : 'Report Logged in Sovereign Queue',
        message: locale === 'bn'
          ? `রেফারেন্স ${refCode} নিবন্ধিত হয়েছে। এআই ট্রায়াজ এবং নিয়ন্ত্রক ক্লাস্টারিং প্রক্রিয়াধীন।`
          : `Grievance registered under ${refCode}. AI triage & regulatory clustering underway.`,
        urgency: 'INFO',
      });

      // Submit to backend in background
      try {
        fetch('/api/v1/grievance/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            countryCode: 'BD',
            channel: 'WEB_WIDGET',
            entityName: reportTarget.trim() || 'Unidentified Suspect',
            rawCategory: reportCategory,
            description: reportDescription || `Citizen reported target: ${reportTarget}`,
            amountRange: reportAmountRange,
            isAnonymous,
            complainantContact: isAnonymous ? undefined : complainantPhone
          })
        }).catch(err => console.warn('Background grievance submit notice:', err));
      } catch (e) {}
      
      // Update Recent Targets
      if (reportTarget.trim()) {
        const newRecent = [
          reportTarget.trim(),
          ...recentReportTargets.filter(t => t !== reportTarget.trim())
        ].slice(0, 3);
        setRecentReportTargets(newRecent);
        localStorage.setItem('trust_check_recent_report_targets', JSON.stringify(newRecent));
      }

      setIsSubmittingReport(false);
      triggerHapticFeedback([60, 80, 60, 80, 120]);
      showToast(locale === 'bn' ? '৬০ সেকেন্ডের অভিযোগ সফলভাবে জমা নেওয়া হয়েছে!' : '60-Second Grievance Report successfully registered!', 'success');
    }, 600);
  };

  const handleVerifyBadge = () => {
    if (!badgeQuery.trim()) return;
    const res = TrustVerificationService.verifyTrustBadge(badgeQuery.trim());
    setBadgeResult(res);
    
    // Save to history
    const historyItem = {
      id: badgeQuery.trim(),
      type: 'badge',
      title: res.businessName,
      isValid: res.isValid,
      timestamp: new Date().toISOString(),
      details: res
    };
    
    const newHistory = [
      historyItem,
      ...recentVerifications.filter(h => h.id !== historyItem.id)
    ].slice(0, 5);
    
    setRecentVerifications(newHistory);
    localStorage.setItem('trust_check_recent_verifications', JSON.stringify(newHistory));

    if (res.isValid) {
      showToast(locale === 'bn' ? 'ZK প্রুফ যাচাই করা হয়েছে!' : 'ZK Proof Verified!', 'success');
      triggerHapticFeedback([40, 60, 40]);
    } else {
      showToast(locale === 'bn' ? 'অকার্যকর ট্রাস্ট ব্যাজ!' : 'Invalid Trust Badge!', 'error');
      triggerHapticFeedback([100, 100]);
    }
  };

  const handleVerifyAgent = () => {
    if (!agentQuery.trim()) return;
    const res = TrustVerificationService.verifyAgent(agentQuery.trim());
    setAgentResult(res);

    // Save to history
    const historyItem = {
      id: agentQuery.trim(),
      type: 'agent',
      title: res.agentName,
      isValid: res.isValid,
      timestamp: new Date().toISOString(),
      details: res
    };
    
    const newHistory = [
      historyItem,
      ...recentVerifications.filter(h => h.id !== historyItem.id)
    ].slice(0, 5);
    
    setRecentVerifications(newHistory);
    localStorage.setItem('trust_check_recent_verifications', JSON.stringify(newHistory));

    if (res.isValid) {
      showToast(locale === 'bn' ? 'এজেন্ট আইডেন্টিটি যাচাই করা হয়েছে!' : 'Agent Identity Verified!', 'success');
      triggerHapticFeedback([40, 60, 40]);
    } else {
      showToast(locale === 'bn' ? 'অজ্ঞাত ফিল্ড এজেন্ট!' : 'Unknown Field Agent!', 'warning');
      triggerHapticFeedback([100, 100]);
    }
  };

  const handleDownloadPdfReport = (annotations: PDFAnnotation[] = [], redactionMasks: RedactionMask[] = []) => {
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      const ref = submittedReportRef || 'PRE-SUBMISSION-DRAFT';
      
      // Title
      doc.setFontSize(22);
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text('TrustCheck BD', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('Official Fraud Incident Report', 105, 30, { align: 'center' });
      
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(20, 35, 190, 35);
      
      // Meta Information
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Reference ID: ${ref}`, 20, 45);
      doc.text(`Generated At: ${timestamp}`, 20, 50);
      
      // Content Sections
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      
      // Section 1: Suspect Information
      doc.setFontSize(14);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text('1. Suspect Information', 20, 65);
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`Target Identifier: ${reportTarget}`, 25, 75);
      doc.text(`Category: ${reportCategory}`, 25, 82);
      doc.text(`Estimated Loss Range: ${reportAmountRange}`, 25, 89);
      
      // Section 2: Incident Details
      doc.setFontSize(14);
      doc.setTextColor(79, 70, 229);
      doc.text('2. Incident Details', 20, 105);
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      
      const splitDescription = doc.splitTextToSize(reportDescription || 'No detailed description provided.', 160);
      doc.text(splitDescription, 25, 115);
      
      // Section 3: Digital Evidence
      const evidenceY = 115 + (splitDescription.length * 5) + 10;
      doc.setFontSize(14);
      doc.setTextColor(79, 70, 229);
      doc.text('3. Evidence Vault', 20, evidenceY);
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`Attached Files: ${evidenceAttachments.length}`, 25, evidenceY + 10);
      doc.text(`Location: ${reportLocation ? `${reportLocation.district} (${reportLocation.lat}, ${reportLocation.lng})` : 'Not captured'}`, 25, evidenceY + 17);
      
      // APPLY REDACTIONS
      if (redactionMasks && redactionMasks.length > 0) {
        doc.setFillColor(15, 23, 42); // Dark slate for redaction
        redactionMasks.forEach(mask => {
          doc.rect(mask.x, mask.y, mask.width, mask.height, 'F');
          if (mask.label) {
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text(mask.label, mask.x + (mask.width / 2), mask.y + (mask.height / 2) + 2, { align: 'center' });
          }
        });
      }

      // APPLY ANNOTATIONS
      if (annotations && annotations.length > 0) {
        annotations.forEach(anno => {
          doc.setFontSize(anno.fontSize || 10);
          if (anno.color === 'red') doc.setTextColor(225, 29, 72);
          else if (anno.color === 'blue') doc.setTextColor(79, 70, 229);
          else doc.setTextColor(51, 65, 85);

          if (anno.bold) doc.setFont('helvetica', 'bold');
          else doc.setFont('helvetica', 'normal');

          doc.text(anno.text, anno.x, anno.y);
        });
      }

      // Footer / Seal
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 270, 190, 270);
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('This is a cryptographically signed report from the TrustCheck BD Regulatory Portal.', 105, 278, { align: 'center' });
      doc.text('Verification Link: https://trustcheck.bd/verify', 105, 283, { align: 'center' });
      
      doc.save(`TrustCheck_Report_${ref.replace(/\s+/g, '_')}.pdf`);
      showToast(locale === 'bn' ? 'পিডিএফ রিপোর্ট ডাউনলোড শুরু হয়েছে' : 'PDF Report download initiated', 'success');
      triggerHapticFeedback(40);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      showToast(locale === 'bn' ? 'পিডিএফ তৈরি করতে সমস্যা হয়েছে' : 'Error generating PDF report', 'error');
    }
  };

  const handleAnswerQuiz = (index: number) => {
    if (quizSubmitted) return;
    setQuizAnswerSelected(index);
    setQuizSubmitted(true);
    if (activeLesson && index === activeLesson.quiz.correctIndex) {
      setUserScore(prev => prev + 1);
    }
  };

  // Quick preset queries for one-tap demonstrations
  const samplePresets = [
    { label: '🔴 01711002233 (Scammer Global Mobile Wallet)', query: '01711002233', type: 'wallet' as const },
    { label: '🔴 daraz-deals-free.xyz (Phishing)', query: 'daraz-deals-free.xyz', type: 'website' as const },
    { label: '🟠 01999887766 (Unconfirmed Page)', query: '01999887766', type: 'phone' as const },
    { label: '🟢 chaldal.com (Verified Merchant)', query: 'chaldal.com', type: 'website' as const },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-16">
      
      {/* Top Universal Control & Co-Brand Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 transition-all">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & Co-Branding Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  {locale === 'bn' ? 'ট্রাস্ট চেক' : 'Trust Check'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  {locale === 'bn' ? 'জাতীয় নাগরিক সুরক্ষা' : 'Citizen Shield'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                {coBrandMode === 'DNCRP_Telecom Regulatory Authority' ? (
                  <span>ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর (DNCRP) ও বিটিআরসি অনুমোদিত</span>
                ) : (
                  <span>Sovereign RegTech Trust Ecosystem</span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center space-x-2">
            {/* Device Integrity Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Fingerprint className="w-3.5 h-3.5 text-emerald-500" />
              <span>Play Integrity: SECURE</span>
            </div>

            {/* Co-brand Selector */}
            <button
              onClick={() => setCoBrandMode(prev => prev === 'DNCRP_Telecom Regulatory Authority' ? 'SOVEREIGN_GLOBAL' : 'DNCRP_Telecom Regulatory Authority')}
              className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Toggle Regulator Co-Branding"
            >
              {coBrandMode === 'DNCRP_Telecom Regulatory Authority' ? '🏛️ DNCRP/BD' : '🌐 Sovereign'}
            </button>

            {/* Real-time Grievance Notification Listener Bell & Drawer */}
            <GrievanceNotificationListener
              activeRefCode={submittedReportRef}
              onSelectRefCode={(ref) => {
                setSubmittedReportRef(ref);
                setActiveTab('report');
              }}
            />

            {/* Language Switch */}
            <button
              onClick={toggleLocale}
              className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
              title={locale === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            >
              {locale === 'bn' ? 'English' : 'বাংলা'}
            </button>

            {/* Phone Viewport Frame Switcher */}
            <button
              onClick={() => setIsMobileDeviceFrame(prev => !prev)}
              className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isMobileDeviceFrame
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title="Toggle Mobile Simulator Frame"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Responsive Container or Mobile Frame */}
      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <div className={`mx-auto transition-all ${isMobileDeviceFrame ? 'max-w-md border-8 border-slate-800 dark:border-slate-700 rounded-[40px] shadow-2xl p-4 bg-slate-100/50 dark:bg-slate-900/60 overflow-hidden' : 'w-full'}`}>
          
          {/* Navigation Bar / Tabs */}
          <div className="flex items-center justify-between p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('check')}
              className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center space-y-0.5 sm:space-y-0 sm:space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'check'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{locale === 'bn' ? 'যাচাই (Check)' : 'Check'}</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center space-y-0.5 sm:space-y-0 sm:space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{locale === 'bn' ? 'রিপোর্ট (Report)' : 'Report'}</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center space-y-0.5 sm:space-y-0 sm:space-x-1.5 transition-all cursor-pointer relative ${
                activeTab === 'alerts'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{locale === 'bn' ? 'সতর্কবার্তা' : 'Alerts'}</span>
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </button>

            <button
              onClick={() => setActiveTab('school')}
              className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center space-y-0.5 sm:space-y-0 sm:space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'school'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{locale === 'bn' ? 'স্ক্যাম স্কুল' : 'Scam School'}</span>
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center space-y-0.5 sm:space-y-0 sm:space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'verify'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{locale === 'bn' ? 'প্রমাণ যাচাই' : 'Verify'}</span>
            </button>

            <button
              onClick={() => setActiveTab('subscription')}
              className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center space-y-0.5 sm:space-y-0 sm:space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'subscription'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{locale === 'bn' ? 'সাবস্ক্রিপশন' : 'Subscription'}</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: TRUST CHECK (THE KILLER FEATURE) */}
          {/* ========================================================================= */}
          {activeTab === 'check' && (
            <div className="space-y-5">
              
              {/* Primary Search Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="mb-4">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {locale === 'bn' ? 'টাকা পাঠানোর আগেই যাচাই করুন' : 'Check Before You Pay'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {locale === 'bn' 
                      ? 'যেকোনো বিকাশ/নগদ নম্বর, ওয়েবসাইট বা কিউআর কোড স্ক্যান করে তাৎক্ষণিক সততা যাচাই করুন।'
                      : 'Scan any Global Mobile Wallet/phone number, website URL, or payment QR for instant regulatory verdict.'}
                  </p>
                </div>

                {/* 4 Input Type Chips */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <button
                    onClick={() => setQueryType('wallet')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer border ${
                      queryType === 'wallet'
                        ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-400 text-pink-600 dark:text-pink-400 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Global Mobile Wallet / MFS</span>
                  </button>

                  <button
                    onClick={() => setQueryType('phone')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer border ${
                      queryType === 'phone'
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>{locale === 'bn' ? 'ফোন নম্বর' : 'Phone'}</span>
                  </button>

                  <button
                    onClick={() => setQueryType('website')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer border ${
                      queryType === 'website'
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-600 dark:text-purple-400 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>{locale === 'bn' ? 'ওয়েবসাইট' : 'Website'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setQueryType('qr');
                      setQrScannerTarget('check');
                      setShowQrScanner(true);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer border ${
                      queryType === 'qr'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{locale === 'bn' ? 'QR স্ক্যান' : 'Scan QR'}</span>
                  </button>
                </div>

                {/* Search Input Box with Integrated Camera QR Button */}
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      {queryType === 'website' ? <Globe className="w-4 h-4" /> : queryType === 'qr' ? <QrCode className="w-4 h-4 text-emerald-500" /> : <Phone className="w-4 h-4" />}
                    </div>
                    <input
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRunCheck()}
                      placeholder={
                        queryType === 'website'
                          ? 'e.g. shop-deal.xyz or chaldal.com'
                          : queryType === 'qr'
                          ? 'e.g. 01711002233 or TB-BD-2026-98101'
                          : 'e.g. 01711002233 or 01822334455'
                      }
                      className="w-full pl-9 pr-12 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />

                    {/* Camera Button inside input */}
                    <button
                      type="button"
                      onClick={() => {
                        setQrScannerTarget('check');
                        setShowQrScanner(true);
                      }}
                      className="absolute inset-y-1.5 right-1.5 px-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center transition-colors cursor-pointer"
                      title="Open Live Camera QR Scanner"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRunCheck()}
                    disabled={isEvaluating || !inputQuery.trim()}
                    className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
                  >
                    {isEvaluating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>{locale === 'bn' ? 'যাচাই করুন' : 'Verify'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Prominent Live Camera Scanner Launcher Banner */}
                <button
                  type="button"
                  onClick={() => {
                    setQrScannerTarget('check');
                    setShowQrScanner(true);
                  }}
                  className="w-full mt-2.5 py-2 px-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 hover:from-emerald-500/15 hover:to-teal-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold">
                      {locale === 'bn' 
                        ? 'ক্যামেরা দিয়ে পেমেন্ট বা মার্চেন্ট কিউআর কোড স্ক্যান করুন (লাইভ ভেরিফিকেশন)' 
                        : 'Scan Payment or Merchant QR with Live Camera for Instant Trust Check'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>{locale === 'bn' ? 'ক্যামেরা চালু' : 'Open Camera'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Quick Presets */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    {locale === 'bn' ? 'দ্রুত পরীক্ষা:' : 'Test Samples:'}
                  </span>
                  {samplePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputQuery(preset.query);
                        setQueryType(preset.type);
                        handleRunCheck(preset.query, preset.type);
                      }}
                      className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Smart Scan SMS/Text Extractor Toggle Button */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {locale === 'bn' ? 'সন্দেহজনক এসএমএস বা টেক্সট আছে?' : 'Have a suspicious SMS or ad copy?'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSmartScanPanel(!showSmartScanPanel)}
                    className="text-[11px] font-black px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30 transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>{showSmartScanPanel ? (locale === 'bn' ? 'প্যানেল বন্ধ করুন' : 'Hide Smart Scan') : (locale === 'bn' ? 'স্মার্ট স্ক্যান অটো-ফিল' : 'AI Smart Scan Auto-Fill')}</span>
                    <ArrowRight className={`w-3 h-3 transition-transform ${showSmartScanPanel ? 'rotate-90' : ''}`} />
                  </button>
                </div>

                {/* Interactive AI Smart Scan Auto-Fill Panel */}
                <AnimatePresence>
                  {showSmartScanPanel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-indigo-100 dark:border-indigo-950/60 space-y-3 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            {locale === 'bn' ? 'এআই টেক্সট পার্সার ও প্যারামিটার এক্সট্র্যাক্টর' : 'AI Text Parser & Parameter Extractor'}
                          </span>
                          <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-full border border-indigo-200/40 dark:border-indigo-900/40 uppercase tracking-widest">
                            {locale === 'bn' ? 'অটো-ফিল মোড' : 'Auto-Fill Engine'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {locale === 'bn'
                            ? 'যেকোনো সন্দেহজনক এসএমএস, ফেইসবুক পোস্ট বা চ্যাট কপি করে নিচে পেস্ট করুন। এআই স্বয়ংক্রিয়ভাবে নম্বর বা লিংক খুঁজে বের করে ফিল পূরণ করে দেবে।'
                            : 'Paste any suspicious SMS message, social ad, or chat snippet. The AI model will parse it, extract the target phone/link, and auto-fill it for verification.'}
                        </p>

                        <div className="relative">
                          <textarea
                            value={smartScanText}
                            onChange={(e) => setSmartScanText(e.target.value)}
                            placeholder={
                              locale === 'bn'
                                ? 'উদা: প্রিয় গ্রাহক, আপনার বিকাশ একাউন্ট সাময়িক বন্ধ করা হয়েছে। চালুর জন্য ০১৭৯৯২২৩৩৪৪ নম্বরে যোগাযোগ করুন।'
                                : 'e.g. Dear user, your Global Mobile Wallet wallet is restricted. Confirm identity by calling 01799223344 or visit our secure gate: https://Global Mobile Wallet-login.net'
                            }
                            rows={3}
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium resize-none"
                          />
                          {smartScanText && (
                            <button
                              type="button"
                              onClick={() => {
                                setSmartScanText('');
                                setSmartScanResult(null);
                              }}
                              className="absolute top-2 right-2 p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Quick Text Templates / Presets */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {locale === 'bn' ? 'টেমপ্লেট ট্রাই করুন:' : 'Try Templates:'}
                          </span>
                          <div className="flex flex-col gap-1.5">
                            {[
                              {
                                label: locale === 'bn' ? '১. লটারি/পুরস্কার জয়ের এসএমএস' : '1. MFS Prize Winner Spoof SMS',
                                text: locale === 'bn'
                                  ? 'অভিনন্দন! জিপি সিম লটারিতে ৫০,০০০ টাকা জিতেছেন। পুরস্কারের টাকা ক্যাশআউট করতে নগদ নম্বর ০১৮২২৩৩৪৪৫৫ এ যোগাযোগ করুন।'
                                  : 'GP-Sim Lottery: Congratulations! Your sim won 50,000 TK cash award. Connect immediately to Agent Digital Wallet 01822334455 for claims.'
                              },
                              {
                                label: locale === 'bn' ? '২. বিকাশ অ্যাকাউন্ট লক সল্যুশন' : '2. Account Lock Phishing Alert',
                                text: locale === 'bn'
                                  ? 'সতর্কতা: আপনার বিকাশ ওয়ালেট লক করা হয়েছে। সাময়িক বন্ধ এড়াতে এখনই https://Global Mobile Wallet-secure-verify.info লিংকে আইডি ভেরিফাই করুন।'
                                  : 'ALERT: Your Global Mobile Wallet account is suspended due to compliance failure. Verify now at https://Global Mobile Wallet-secure-verify.info to restore wallet.'
                              },
                              {
                                label: locale === 'bn' ? '৩. পার্ট-টাইম চাকুরীর প্রলোভন' : '3. Social Media Part-Time Job Scam',
                                text: locale === 'bn'
                                  ? 'ঘরে বসে প্রতিদিন ৪,০০০ টাকা আয় করুন! শুধুমাত্র ০১৭১১০০২২৩৩ নম্বরে রেজিস্ট্রেশন ফি বিকাশ করে কাজ শুরু করুন।'
                                  : 'Work from home! Daily income 4,000 TK. Send registration fee to Global Mobile Wallet merchant 01711002233 and start earning today.'
                              }
                            ].map((tpl, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setSmartScanText(tpl.text);
                                  handleSmartScan(tpl.text);
                                }}
                                className="text-left text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-colors block truncate cursor-pointer"
                              >
                                {tpl.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Scan Trigger Button */}
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleSmartScan(smartScanText)}
                            disabled={isSmartScanning || !smartScanText.trim()}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-[11px] flex items-center space-x-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                          >
                            {isSmartScanning ? (
                              <>
                                <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>{locale === 'bn' ? 'এআই রিডিং...' : 'AI Extracting...'}</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-indigo-200 animate-pulse" />
                                <span>{locale === 'bn' ? 'এআই এক্সট্র্যাক্ট করুন' : 'Run AI Extraction'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Extraction Results Pane */}
                        {smartScanResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3.5 rounded-xl border ${
                              smartScanResult.riskScore > 50
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                            } space-y-2.5`}
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h5 className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                {smartScanResult.riskScore > 50 ? (
                                  <ShieldAlert className="w-4 h-4 text-rose-500 animate-bounce" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                )}
                                {locale === 'bn' ? 'টেলিমেট্রি এক্সট্র্যাকশন রিপোর্ট' : 'AI Extraction Metrics'}
                              </h5>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                smartScanResult.riskScore > 50 ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                              }`}>
                                {locale === 'bn' ? 'ঝুঁকি স্কোর:' : 'RISK SCORE:'} {smartScanResult.riskScore}%
                              </span>
                            </div>

                            <p className="text-[11px] leading-relaxed font-semibold">
                              {smartScanResult.explanation}
                            </p>

                            {smartScanResult.keyPhrases.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                                  {locale === 'bn' ? 'শনাক্তকৃত ট্যাগ:' : 'Identified Hooks:'}
                                </span>
                                {smartScanResult.keyPhrases.map((phrase, idx) => (
                                  <span key={idx} className="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-900/10 dark:bg-slate-100/10 font-mono">
                                    {phrase}
                                  </span>
                                ))}
                              </div>
                            )}

                            {smartScanResult.extractedValue ? (
                              <div className="pt-2.5 border-t border-slate-200/20 flex flex-wrap items-center justify-between gap-2.5">
                                <div className="text-[11px]">
                                  <span className="text-slate-500 font-semibold">{locale === 'bn' ? 'শনাক্তকৃত ভ্যালু:' : 'Extracted Entity: '}</span>
                                  <span className="font-mono font-bold text-slate-950 dark:text-white px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] ml-1">
                                    {smartScanResult.extractedValue}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (smartScanResult.extractedValue && smartScanResult.detectedType) {
                                      setInputQuery(smartScanResult.extractedValue);
                                      setQueryType(smartScanResult.detectedType);
                                      handleRunCheck(smartScanResult.extractedValue, smartScanResult.detectedType);
                                      showToast(locale === 'bn' ? 'অটো-ফিল করে ভেরিফিকেশন চালানো হয়েছে!' : 'Auto-filled and verified extracted parameters!', 'success');
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black flex items-center space-x-1 uppercase tracking-wide cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{locale === 'bn' ? 'অটো-ফিল এবং চেক করুন' : 'Auto-Fill & Check Now'}</span>
                                </button>
                              </div>
                            ) : (
                              <p className="text-[10px] text-rose-500 font-bold">
                                {locale === 'bn' ? 'কোন নম্বর বা লিঙ্ক পাওয়া যায়নি। অনুগ্রহ করে ম্যানুয়ালি লিখুন।' : 'No phone numbers or domains identified in this text block.'}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Recent Scans Section */}
                {recentScans.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <History className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{locale === 'bn' ? 'সাম্প্রতিক স্ক্যানসমূহ (শেষ ৫টি)' : 'Recent Scans (Last 5)'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRecentScans([]);
                          try { localStorage.removeItem('trust_check_recent_scans'); } catch {}
                          showToast(locale === 'bn' ? 'ইতিহাস মুছে ফেলা হয়েছে' : 'Recent scans cleared', 'info');
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        {locale === 'bn' ? 'মুছে ফেলুন' : 'Clear'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {recentScans.map((scan) => (
                        <div
                          key={scan.id}
                          onClick={() => {
                            setInputQuery(scan.query);
                            setQueryType(scan.type);
                            handleRunCheck(scan.query, scan.type);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              scan.tier === 'FLAGGED'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                                : scan.tier === 'WARNED'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {scan.tier === 'FLAGGED' ? <ShieldAlert className="w-3.5 h-3.5" /> : scan.tier === 'WARNED' ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {scan.query}
                              </p>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                                <span className="uppercase">{scan.type}</span>
                                <span>•</span>
                                <span>{scan.timestamp}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              scan.tier === 'FLAGGED'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                : scan.tier === 'WARNED'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            }`}>
                              {scan.tier === 'FLAGGED' ? (locale === 'bn' ? 'চিহ্নিত' : 'Flagged') : scan.tier === 'WARNED' ? (locale === 'bn' ? 'সতর্ক' : 'Warned') : (locale === 'bn' ? 'নিরাপদ' : 'Verified')}
                            </span>
                            <RefreshCw className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Instant Trust Verdict Card */}
              {currentVerdict && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-3xl p-5 sm:p-6 border shadow-lg transition-all ${
                    currentVerdict.tier === 'FLAGGED'
                      ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                      : currentVerdict.tier === 'WARNED'
                      ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                      : currentVerdict.tier === 'VERIFIED'
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100/90 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {/* Verdict Header Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
                        currentVerdict.tier === 'FLAGGED'
                          ? 'bg-rose-600 shadow-rose-600/30'
                          : currentVerdict.tier === 'WARNED'
                          ? 'bg-amber-600 shadow-amber-600/30'
                          : currentVerdict.tier === 'VERIFIED'
                          ? 'bg-emerald-600 shadow-emerald-600/30'
                          : 'bg-slate-600 shadow-slate-600/30'
                      }`}>
                        {currentVerdict.tier === 'FLAGGED' && <ShieldAlert className="w-7 h-7" />}
                        {currentVerdict.tier === 'WARNED' && <AlertTriangle className="w-7 h-7" />}
                        {currentVerdict.tier === 'VERIFIED' && <ShieldCheck className="w-7 h-7" />}
                        {currentVerdict.tier === 'UNKNOWN' && <Info className="w-7 h-7" />}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                            currentVerdict.tier === 'FLAGGED'
                              ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200'
                              : currentVerdict.tier === 'WARNED'
                              ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                              : currentVerdict.tier === 'VERIFIED'
                              ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}>
                            {currentVerdict.tier}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {currentVerdict.verdictId}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 leading-snug">
                          {currentVerdict.headline}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowShareModal(true)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors shrink-0"
                      title="Share Verdict to WhatsApp"
                    >
                      <Share2 className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>

                  {/* Verdict Description */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 mb-3">
                    {currentVerdict.body}
                  </p>

                  {/* Action Guidance */}
                  <div className="flex items-start space-x-2 p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 mb-4">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {currentVerdict.actionGuidance}
                    </p>
                  </div>

                  {/* Evidence Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-[11px]">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block">{locale === 'bn' ? 'নিশ্চিত রিপোর্ট' : 'Confirmed Reports'}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {currentVerdict.evidence.confirmedReportCount}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block">{locale === 'bn' ? 'পর্যালোচনা অভিযোগ' : 'Complaints in Review'}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {currentVerdict.evidence.unconfirmedComplaintCount}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block">{locale === 'bn' ? 'তদন্তকারী সংস্থা' : 'Authority'}</span>
                      <span className="font-bold text-slate-900 dark:text-white truncate block">
                        {currentVerdict.evidence.primaryAuthorityName}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block">{locale === 'bn' ? 'ক্লিয়ারেন্স সময়' : 'Verified At'}</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {new Date(currentVerdict.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions: Report / Appeal */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                    <button
                      onClick={handleQuickReportFromVerdict}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{locale === 'bn' ? 'এই নম্বরের বিরুদ্ধে রিপোর্ট করুন' : 'Report This Party'}</span>
                    </button>

                    <a
                      href={currentVerdict.appealUrl}
                      onClick={(e) => { e.preventDefault(); }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline flex items-center space-x-1"
                    >
                      <span>{locale === 'bn' ? 'ব্যবসায়িক আপত্তি বা আপিল দাখিল' : 'Dispute / Business Appeal'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              )}

              {/* National Scam Heat Map Snippet */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {locale === 'bn' ? 'জাতীয় নাগরিক সুরক্ষা পরিসংখ্যান (লাইভ)' : 'Live Shield Statistics'}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    {locale === 'bn' ? '৮,৪১২ লেনদেন সুরক্ষিত' : '8,412 Protected'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      ৳{(harmsData.totalTakaSaved / 1000000).toFixed(1)}M+
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {locale === 'bn' ? 'প্রতারণা থেকে রক্ষা' : 'Harms Prevented'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                      ১,২৯২
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {locale === 'bn' ? 'চিহ্নিত প্রতারক নম্বর' : 'Flagged Numbers'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                      ৩,৪২০
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {locale === 'bn' ? 'যাচাইকৃত ট্রাস্ট ব্যাজ' : 'Verified Badges'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      &lt; ১.২ সে.
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {locale === 'bn' ? 'যাচাইকাল' : 'p95 Response'}
                    </span>
                  </div>
                </div>

                {/* Interactive Chart Tabs */}
                <div className="mt-5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                      {locale === 'bn' ? 'নাগরিক সুরক্ষা ট্রেন্ড ও বিশ্লেষণ' : 'Citizen Protection Analytics'}
                    </span>
                    <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setActiveChartTab('trends')}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-md transition-all cursor-pointer ${
                          activeChartTab === 'trends'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {locale === 'bn' ? 'ভেরিফিকেশন ট্রেন্ড' : 'Verification Trends'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveChartTab('categories')}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-md transition-all cursor-pointer ${
                          activeChartTab === 'categories'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {locale === 'bn' ? 'প্রতারণার ধরন' : 'Scam Categories'}
                      </button>
                    </div>
                  </div>

                  {/* Chart Container */}
                  <div className="h-64 w-full mt-2 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 p-2 sm:p-4 border border-slate-100 dark:border-slate-800/60">
                    <ResponsiveContainer width="100%" height="100%">
                      {activeChartTab === 'trends' ? (
                        <AreaChart data={weeklyProtectionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" />
                          <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                              borderRadius: '12px', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: '600'
                            }} 
                          />
                          <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '5px' }} />
                          <Area 
                            name={locale === 'bn' ? 'সুরক্ষিত লেনদেন (Safe Checks)' : 'Verified Safe'} 
                            type="monotone" 
                            dataKey="verified" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorVerified)" 
                          />
                          <Area 
                            name={locale === 'bn' ? 'প্রতিরোধকৃত প্রতারণা (Flagged)' : 'Flagged Scams'} 
                            type="monotone" 
                            dataKey="flagged" 
                            stroke="#f43f5e" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorFlagged)" 
                          />
                        </AreaChart>
                      ) : (
                        <BarChart data={scamCategoriesData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                          <XAxis type="number" stroke="#64748b" fontSize={10} fontWeight="bold" />
                          <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={90} fontWeight="black" />
                          <RechartsTooltip
                            contentStyle={{ 
                              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                              borderRadius: '12px', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: '600'
                            }} 
                          />
                          <Bar 
                            name={locale === 'bn' ? 'প্রতিবেদনের সংখ্যা' : 'Report Count'} 
                            dataKey="value" 
                            radius={[0, 8, 8, 0]}
                          >
                            {scamCategoriesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  {/* Summary/Metric Footnote */}
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10px] font-semibold text-slate-500">
                    <span>
                      {locale === 'bn' ? '*তথ্য সূত্র: জাতীয় ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর (DNCRP)' : '*Source: DNCRP & Telecom Regulatory Authority Citizens Scam Database'}
                    </span>
                    <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-black">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      {locale === 'bn' ? 'গত সপ্তাহে প্রতারণা প্রতিরোধ +১৪.২%' : '+14.2% Fraud prevention rise vs last week'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: 60-SECOND REPORT FLOW WITH VISUAL STEPPER & ANIMATED TRANSITIONS */}
          {/* ========================================================================= */}
          {activeTab === 'report' && (
            <div className="space-y-5">
              {/* Report Sub-Tab Switcher Bar */}
              <div className="flex items-center p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <button
                  type="button"
                  onClick={() => setReportSubTab('form')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    reportSubTab === 'form'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{locale === 'bn' ? 'নতুন অভিযোগ দাখিল' : 'File Incident Report'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportSubTab('history')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    reportSubTab === 'history'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>{locale === 'bn' ? 'আমার অভিযোগের ইতিহাস ও ফিল্টার' : 'Grievance History & Filter'}</span>
                </button>
              </div>

              {reportSubTab === 'history' ? (
                <GrievanceReportHistoryView
                  locale={locale}
                  onFileNewReport={() => setReportSubTab('form')}
                  onSelectGrievanceRef={(refCode) => {
                    setSubmittedReportRef(refCode);
                    setReportSubTab('form');
                  }}
                />
              ) : (
                <div className="report-fraud-form bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Header Info */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                    {locale === 'bn' ? '৬০ সেকেন্ড দ্রুত অভিযোগ' : '60-Second Rapid Intake'}
                  </span>
                  {!submittedReportRef && (
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {locale === 'bn' ? `ধাপ ${reportStep} / ৩` : `Step ${reportStep} of 3`}
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  {locale === 'bn' ? 'প্রতারণার অভিযোগ দাখিল করুন' : 'Report Fraud Incident'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {locale === 'bn'
                    ? 'আপনার ১টি রিপোর্ট অন্য হাজারো নাগরিককে সুরক্ষিত রাখবে। সরাসরি নিয়ন্ত্রক সংস্থায় পৌঁছাবে।'
                    : 'Feeds directly into the automated regulatory grievance and cluster resolution pipeline.'}
                </p>

                {/* GEOLOCATION CAPTURE & STATUS INDICATOR CARD */}
                <div className="mt-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 flex flex-col items-start justify-between gap-3 shadow-2xs">
                  <div className="flex items-start space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      locationCaptured
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                        : isCapturingLocation
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {isCapturingLocation ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        {locationCaptured ? (
                          <>
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                              {locale === 'bn' ? 'অবস্থান ক্যাপচার করা হয়েছে' : 'Location Captured'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              GPS Active
                            </span>
                          </>
                        ) : isCapturingLocation ? (
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            {locale === 'bn' ? 'জিপিএস অবস্থান সনাক্ত করা হচ্ছে...' : 'Capturing GPS Location...'}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {locale === 'bn' ? 'ঘটনার ভৌগোলিক অবস্থান' : 'Incident Geolocation Metadata'}
                          </span>
                        )}
                      </div>

                      {reportLocation ? (
                        <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                          <strong className="text-slate-900 dark:text-white font-sans font-bold">{reportLocation.district} District</strong> ({reportLocation.lat}° N, {reportLocation.lng}° E)
                          <span className="text-slate-400 ml-1">
                            • {reportLocation.areaName} {reportLocation.accuracy ? `(±${reportLocation.accuracy}m)` : ''}
                          </span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {locale === 'bn'
                            ? 'অভিযোগ জমা দেওয়ার সময় আপনার এলাকা ও জেলা অটো-ডিটেক্ট করা হবে।'
                            : 'Auto-captures district metadata for regulatory scam cluster maps.'}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCaptureLocation(false)}
                    disabled={isCapturingLocation}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
                  >
                    <LocateFixed className="w-3.5 h-3.5 text-rose-500" />
                    <span>
                      {locationCaptured
                        ? (locale === 'bn' ? 'পুনরায় ক্যাপচার' : 'Recalibrate GPS')
                        : (locale === 'bn' ? 'অবস্থান ডিটেক্ট করুন' : 'Capture Location')}
                    </span>
                  </button>
                </div>
              </div>

              {submittedReportRef ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-4"
                >
                  <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-black text-emerald-900 dark:text-emerald-100">
                    {locale === 'bn' ? 'অভিযোগ সফলভাবে গৃহীত হয়েছে' : 'Report Successfully Logged'}
                  </h3>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 max-w-xs mx-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {locale === 'bn' ? 'ট্র্যাকিং রেফারেন্স কোড' : 'Tracking Ref Code'}
                    </span>
                    <span className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {submittedReportRef}
                    </span>
                  </div>

                  {reportLocation && (
                    <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800/80 max-w-xs mx-auto flex items-center justify-center space-x-2 text-xs">
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="text-left">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block leading-tight">
                          {locale === 'bn' ? 'জিও-ফেন্সড ক্লাস্টার সংযুক্ত' : 'Geo-Fenced District Cluster'}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          {reportLocation.district} ({reportLocation.lat}° N, {reportLocation.lng}° E)
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                    {locale === 'bn'
                      ? 'নিয়ন্ত্রক ক্লাস্টার এনালাইসিসে এটি অন্তর্ভুক্ত করা হয়েছে। এই নম্বরের জন্য ট্রাস্ট চেক ডাটাবেজে তাৎক্ষণিক সতর্কতা জারি হয়েছে।'
                      : 'Logged into the regulatory grievance engine. Immediate advisory warning applied for future citizen checks.'}
                  </p>

                  {/* REAL-TIME STATUTORY TRACKING STATUS COMPONENT */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/80 shadow-2xs max-w-md mx-auto">
                    <RealtimeTrackingStatus referenceCode={submittedReportRef} />
                    
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {locale === 'bn' ? 'লাইভ ড্যাশবোর্ড আপডেট লিসেনার সক্রিয়' : 'Live Dashboard Alert Listener Active'}
                      </span>
                      <button
                        type="button"
                        onClick={() => GrievanceNotificationService.simulateDashboardStatusChange(submittedReportRef)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
                        title="Simulate status change broadcast from dashboard"
                      >
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>{locale === 'bn' ? '⚡ ড্যাশবোর্ড আপডেট টেস্ট' : '⚡ Simulate Status Update'}</span>
                      </button>
                    </div>
                  </div>

                  {/* ACTIONABLE VICTIM ASSET RECOVERY REMEDIATION ROADMAP */}
                  <RemediationRoadmap
                    category={reportCategory}
                    referenceCode={submittedReportRef}
                    targetNumber={reportTarget}
                    description={reportDescription}
                    location={reportLocation || undefined}
                    locale={locale as 'bn' | 'en'}
                    onDownloadPdf={handleDownloadPdfReport}
                  />

                  {/* SHARE REPORT ACTION BUTTON & DYNAMIC DEEP-LINK QR CODE */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 shadow-2xs max-w-md mx-auto space-y-3 text-left">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{locale === 'bn' ? 'সামাজিক সচেতনতা ও কিউআর কোড' : 'Raise Social Awareness & Scan QR'}</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                        <QrCode className="w-3 h-3 text-indigo-500" />
                        <span>Deep Link QR</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                      {/* Dynamic QR Code generator alongside share button */}
                      <div className="flex flex-col items-center shrink-0">
                        <DynamicQRCode
                          value={`https://trustcheck.bd/report/${submittedReportRef}`}
                          size={82}
                        />
                        <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-0.5">
                          <Smartphone className="w-2.5 h-2.5" />
                          {locale === 'bn' ? 'ক্যামেরা স্ক্যান' : 'Hold Up Phone'}
                        </span>
                      </div>

                      <div className="flex-1 space-y-2">
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                          {locale === 'bn'
                            ? 'মোবাইল ক্যামেরা সরাসরি উঁচিয়ে এই কিউআর স্ক্যান করে রিপোর্টটি সত্যতা যাচাই করা যাবে।'
                            : 'Hold up phone to scan the encoded report deep link instantly, or open social graphics.'}
                        </p>

                        <button
                          type="button"
                          onClick={() => setShowReportShareModal(true)}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-indigo-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{locale === 'bn' ? '📢 রিপোর্ট শেয়ার করুন' : '📢 Share Report'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadPdfReport()}
                          className="w-full py-2 px-3 mt-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center space-x-1.5 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>{locale === 'bn' ? '📄 পিডিএফ রিপোর্ট ডাউনলোড' : '📄 Download PDF Report'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="w-full py-2 px-3 mt-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{locale === 'bn' ? '🖨️ পিডিএফ প্রিন্ট করুন' : '🖨️ Print Report to PDF'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSubmittedReportRef(null);
                        setReportSubTab('history');
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <History className="w-4 h-4" />
                      <span>{locale === 'bn' ? 'অভিযোগের ইতিহাস দেখুন' : 'View Grievance History'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSubmittedReportRef(null);
                        setReportTarget('');
                        setReportDescription('');
                        setVoiceTranscript('');
                        setReportStep(1);
                        setActiveTab('check');
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      {locale === 'bn' ? 'নতুন যাচাই করুন' : 'Perform Another Check'}
                    </button>
                    <button
                      onClick={() => {
                        setSubmittedReportRef(null);
                        setReportTarget('');
                        setReportDescription('');
                        setVoiceTranscript('');
                        setReportStep(1);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      {locale === 'bn' ? 'আরেকটি অভিযোগ দিন' : 'Submit Another Report'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6 relative">
                  
                  {/* Floating Step Summary Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-2 whitespace-nowrap"
                  >
                    <div className="relative w-4 h-4">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="4" />
                        <motion.circle 
                          cx="18" cy="18" r="16" fill="none" 
                          className="stroke-rose-500" 
                          strokeWidth="4" 
                          strokeDasharray="100"
                          animate={{ strokeDashoffset: 100 - (reportStep / 3 * 100) }}
                          transition={{ type: "spring", stiffness: 100 }}
                        />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">
                      {Math.round((reportStep / 3) * 100)}% {locale === 'bn' ? 'সম্পন্ন' : 'Completed'}
                    </span>
                  </motion.div>

                  {/* VISUAL PROGRESS STEPPER BAR */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    {/* Top Progress Track Header */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {reportStep === 1 && (locale === 'bn' ? '১. প্রতারক নম্বর ও ঘটনার ধরন' : '1. Suspect & Category')}
                          {reportStep === 2 && (locale === 'bn' ? '২. আর্থিক ক্ষতি ও প্রমাণের বিবরণ' : '2. Loss & Evidence')}
                          {reportStep === 3 && (locale === 'bn' ? '৩. বেনামী মোড ও চূড়ান্ত দাখিল' : '3. Review & Anonymous Submit')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 font-mono text-[11px]">
                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800 text-[10px]">
                          📳 {locale === 'bn' ? 'হ্যাপ্টিক স্পর্শ সক্রিয়' : 'Haptic Feedback Active'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                          {3 - reportStep === 0
                            ? (locale === 'bn' ? 'চূড়ান্ত ধাপ' : 'Final Step')
                            : (locale === 'bn' ? `আর ${3 - reportStep}টি ধাপ বাকি` : `${3 - reportStep} steps left`)}
                        </span>
                        <span className="text-slate-500 font-bold">
                          {reportStep === 1 ? '33%' : reportStep === 2 ? '66%' : '100%'}
                        </span>
                      </div>
                    </div>

                    {/* Animated Horizontal Progress Track */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden relative shadow-inner">
                      <motion.div
                        className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full"
                        initial={false}
                        animate={{
                          width: reportStep === 1 ? '33.33%' : reportStep === 2 ? '66.66%' : '100%'
                        }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>

                    {/* 3 Step Interactive Indicator Pills */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {[
                        {
                          stepNum: 1,
                          titleBn: 'লক্ষ্য ও ধরন',
                          titleEn: 'Target & Type',
                          descBn: 'নম্বর / লিঙ্ক',
                          descEn: 'Suspect Info'
                        },
                        {
                          stepNum: 2,
                          titleBn: 'ক্ষতি ও প্রমাণ',
                          titleEn: 'Loss & Proof',
                          descBn: 'টাকা ও ভয়েস',
                          descEn: 'Amount & Voice'
                        },
                        {
                          stepNum: 3,
                          titleBn: 'দাখিল ও সুরক্ষা',
                          titleEn: 'Review & Send',
                          descBn: 'বেনামী অনুমোদন',
                          descEn: 'Zero-Trace Mode'
                        }
                      ].map((s) => {
                        const isCompleted = s.stepNum < reportStep;
                        const isActive = s.stepNum === reportStep;
                        const isUpcoming = s.stepNum > reportStep;

                        return (
                          <button
                            key={s.stepNum}
                            type="button"
                            onClick={() => handleJumpToReportStep(s.stepNum)}
                            className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                              isActive
                                ? 'bg-white dark:bg-slate-800 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                                : isCompleted
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 hover:border-emerald-400'
                                : 'bg-transparent border-slate-200 dark:border-slate-800 opacity-60'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-colors ${
                                  isCompleted
                                    ? 'bg-emerald-600 text-white'
                                    : isActive
                                    ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/40'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.stepNum}
                              </div>
                              <div className="min-w-0">
                                <span className={`block text-[11px] font-bold truncate ${
                                  isActive ? 'text-rose-600 dark:text-rose-400' : isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                                }`}>
                                  {locale === 'bn' ? s.titleBn : s.titleEn}
                                </span>
                                <span className="block text-[9px] text-slate-400 truncate">
                                  {locale === 'bn' ? s.descBn : s.descEn}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* FORM WITH ANIMATED STEP TRANSITIONS AND REAL-TIME VISUAL VALIDATION */}
                  <form id="report-fraud-form" onSubmit={handleSubmitGrievanceReport} className="report-fraud-form space-y-4">
                    {/* Subtle Progress Dot Indicators */}
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      {[1, 2, 3].map((step) => {
                        const isCompleted = step < reportStep;
                        const isActive = step === reportStep;
                        
                        return (
                          <div key={step} className="flex items-center">
                            <motion.div
                              initial={false}
                              animate={{
                                scale: isActive ? 1.2 : 1,
                                backgroundColor: isCompleted ? '#10b981' : isActive ? '#e11d48' : '#e2e8f0',
                              }}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                !isActive && !isCompleted ? 'dark:bg-slate-800' : ''
                              } ${isActive ? 'ring-4 ring-rose-500/20' : ''}`}
                            />
                            {step < 3 && (
                              <div className="w-6 h-[1px] mx-1 bg-slate-100 dark:bg-slate-800" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <AnimatePresence mode="wait" custom={stepDirection}>
                      
                      {/* STEP 1: Suspect Target & Category */}
                      {reportStep === 1 && (
                        <motion.div
                          key="step-1"
                          custom={stepDirection}
                          initial={{ opacity: 0, x: stepDirection === 'forward' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: stepDirection === 'forward' ? -20 : 20 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="space-y-4"
                        >
                          {/* Target input */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-rose-500" />
                                <span>{locale === 'bn' ? '১. প্রতারক নম্বর / ওয়েবসাইট / পেজ লিঙ্ক *' : '1. Suspect Number / Website / Link *'}</span>
                                <HelpTooltip
                                  id="target-help"
                                  titleBn="প্রতারকের তথ্য সম্পর্কিত তদন্ত নির্দেশিকা"
                                  titleEn="Suspect Identifier Guidance"
                                  textBn="প্রতারকের ১১ ডিজিট মোবাইল নম্বর (বিকাশ/নগদ/রকেট), ফেসবুক পেজ ইউআরএল, অথবা ফিশিং লিঙ্ক দিন। Telecom Regulatory Authority, BFIU ও CID আইন প্রয়োগকারী সংস্থা সরাসরি এই আইডেন্টিফায়ারের ভিত্তিতে অ্যাকাউন্ট ব্লক ও টেলকো সিম ট্র্যাকিং শুরু করে।"
                                  textEn="Provide the scammer's 11-digit mobile number (Global Mobile Wallet/Digital Wallet), Facebook Page URL, or phishing link. Telecom Regulatory Authority, BFIU, and CID use this identifier directly to freeze accounts and trace SIM identity."
                                  locale={locale}
                                  activeId={activeHelpTooltip}
                                  setActiveId={setActiveHelpTooltip}
                                />
                              </label>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                                targetValidation.isValid 
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                                  : targetValidation.isError 
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' 
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {targetValidation.isValid ? (locale === 'bn' ? '✓ যাচাইকৃত' : '✓ Validated') : targetValidation.isError ? (locale === 'bn' ? '⚠ ত্রুটিপূর্ণ' : '⚠ Invalid') : (locale === 'bn' ? 'বাধ্যতামূলক' : 'Required')}
                              </span>
                            </div>

                            <motion.div 
                              className="relative"
                              animate={shouldShake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
                              transition={{ duration: 0.4, ease: "easeInOut" }}
                            >
                              <input
                                ref={reportTargetInputRef}
                                type="text"
                                required
                                value={reportTarget}
                                onFocus={() => {
                                  setIsTargetFocused(true);
                                  setShowTargetSuggestions(true);
                                }}
                                onBlur={() => {
                                  setIsTargetFocused(false);
                                  // Delay to allow clicking suggestion
                                  setTimeout(() => setShowTargetSuggestions(false), 200);
                                }}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  
                                  // Auto-format as phone if it starts with digits
                                  if (/^\d/.test(val.replace(/\s/g, ''))) {
                                    const digits = val.replace(/\D/g, '').slice(0, 11);
                                    if (digits.length <= 3) {
                                      val = digits;
                                    } else if (digits.length <= 7) {
                                      val = `${digits.slice(0, 3)} ${digits.slice(3)}`;
                                    } else {
                                      val = `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
                                    }
                                  }

                                  setReportTarget(val);
                                  setShowTargetSuggestions(true);
                                  if (reportErrors.reportTarget) {
                                    setReportErrors(prev => ({ ...prev, reportTarget: '' }));
                                  }
                                }}
                                placeholder="e.g. 017 1100 2233 or facebook.com/fakeshop"
                                className={`w-full px-3.5 py-3 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none transition-all ${
                                  targetValidation.isValid
                                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 focus:ring-2 focus:ring-emerald-500/50'
                                    : targetValidation.isError
                                    ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-500/50'
                                    : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500'
                                }`}
                              />
                              
                              {/* Auto-suggestions Dropdown */}
                              <AnimatePresence>
                                {showTargetSuggestions && (
                                  (reportTarget.length > 0 && reportTarget.length < 5) || 
                                  (reportTarget.length === 0 && recentReportTargets.length > 0)
                                ) && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
                                  >
                                    <div className="max-h-64 overflow-y-auto">
                                      {/* Recent Targets Section */}
                                      {reportTarget.length === 0 && recentReportTargets.length > 0 && (
                                        <div className="flex flex-col">
                                          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-1.5">
                                            <History className="w-3 h-3 text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{locale === 'bn' ? 'সাম্প্রতিক' : 'Recent'}</span>
                                          </div>
                                          {recentReportTargets.map((target, idx) => (
                                            <button
                                              key={`recent-${idx}`}
                                              onClick={() => {
                                                setReportTarget(target);
                                                setShowTargetSuggestions(false);
                                              }}
                                              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors group"
                                            >
                                              <div className="flex items-center gap-2">
                                                <div className="p-1 rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                  <Search className="w-3 h-3" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                  {target}
                                                </span>
                                              </div>
                                              <ArrowRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                          ))}
                                        </div>
                                      )}

                                      {/* Suggested Patterns Section */}
                                      {reportTarget.length > 0 && (
                                        <>
                                          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3 text-indigo-400" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{locale === 'bn' ? 'পরামর্শ' : 'Suggestions'}</span>
                                          </div>
                                          {SUGGESTED_TARGET_PATTERNS
                                            .filter(p => p.value.startsWith(reportTarget.replace(/\s/g, '').toLowerCase()))
                                            .map((pattern, idx) => (
                                              <button
                                                key={idx}
                                                onClick={() => {
                                                  setReportTarget(pattern.value);
                                                  setShowTargetSuggestions(false);
                                                }}
                                                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors group"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div className={`p-1 rounded-md ${pattern.type === 'mobile' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'}`}>
                                                    {pattern.type === 'mobile' ? <Phone className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                                  </div>
                                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                    {pattern.value}
                                                  </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                                                  {pattern.label}
                                                </span>
                                              </button>
                                            ))}
                                        </>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              <div className="absolute right-3 top-3.5 flex items-center gap-2 pointer-events-none">
                                {reportTarget.length > 0 && (
                                  <motion.span 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                                      targetValidation.isValid 
                                        ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20' 
                                        : 'text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20'
                                    }`}
                                  >
                                    {reportTarget.length}
                                  </motion.span>
                                )}
                                {targetValidation.isValid && (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in-50 duration-200" />
                                ) || targetValidation.isError && (
                                  <XCircle className="w-5 h-5 text-rose-500 animate-in zoom-in-50 duration-200" />
                                )}
                                {!targetValidation.isValid && !targetValidation.isError && (
                                  <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-slate-400 animate-spin opacity-20" />
                                )}
                              </div>
                            </motion.div>

                            {/* Focus-triggered Detailed Helper Text Area */}
                            <AnimatePresence>
                              {isTargetFocused && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                  animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className={`p-3 rounded-xl border text-[11px] leading-relaxed transition-colors ${
                                    targetValidation.isValid 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                                      : targetValidation.isError
                                      ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300'
                                      : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-300'
                                  }`}>
                                    <div className="font-bold mb-1 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                      {targetValidation.isValid ? (
                                        <><CheckCircle2 className="w-3 h-3" /> {locale === 'bn' ? 'যাচাইকরণ সফল' : 'Verification Success'}</>
                                      ) : targetValidation.isError ? (
                                        <><XCircle className="w-3 h-3" /> {locale === 'bn' ? 'ফরম্যাট ভুল' : 'Incorrect Format'}</>
                                      ) : (
                                        <><Info className="w-3 h-3" /> {locale === 'bn' ? 'নির্দেশনা' : 'Guidance'}</>
                                      )}
                                    </div>
                                    <p>
                                      {targetValidation.isValid 
                                        ? (locale === 'bn' ? 'তথ্যটি সঠিক ফরম্যাটে আছে। এটি তদন্তের জন্য ব্যবহৃত হবে।' : 'Input is in correct format. It will be used as a primary identifier for tracking.')
                                        : targetValidation.isError
                                        ? (targetValidation.message || (locale === 'bn' ? 'অনুগ্রহ করে সঠিক ফরম্যাট ব্যবহার করুন।' : 'Please correct the format before proceeding.'))
                                        : (locale === 'bn' 
                                            ? 'প্রতারকের ১১ ডিজিট মোবাইল নম্বর অথবা সোশ্যাল লিঙ্ক দিন। ভুল তথ্য তদন্তে বিলম্ব ঘটাতে পারে।' 
                                            : 'Enter the scammer\'s 11-digit mobile number or social link. Accurate data speeds up account blocking.')
                                      }
                                    </p>

                                    {/* Typo Correction Suggestion */}
                                    {targetCorrection && (
                                      <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mt-2 p-2 rounded-lg bg-white/40 dark:bg-black/20 border border-current/20 flex items-center justify-between gap-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Sparkles className="w-3 h-3 animate-pulse" />
                                          <span className="font-medium">
                                            {locale === 'bn' ? `আপনি কি বোঝাতে চেয়েছেন: ` : `Did you mean: `}
                                            <span className="font-bold underline cursor-help">{targetCorrection}</span>?
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setReportTarget(targetCorrection);
                                            triggerHapticFeedback(20);
                                          }}
                                          className="px-2 py-1 rounded bg-current/10 hover:bg-current/20 font-bold transition-all text-[9px] uppercase"
                                        >
                                          {locale === 'bn' ? 'ঠিক করুন' : 'Fix It'}
                                        </button>
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Real-time Dynamic Feedback Message (Fallback if not focused) */}
                            {targetValidation.message && !isTargetFocused && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-1.5 text-[11px] font-bold flex items-center space-x-1 ${
                                  targetValidation.isValid
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                <span>{targetValidation.message}</span>
                              </motion.div>
                            )}

                            {reportErrors.reportTarget && !targetValidation.message && (
                              <span className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-1 block">
                                {reportErrors.reportTarget}
                              </span>
                            )}

                            {/* Quick Test Samples */}
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                                {locale === 'bn' ? 'নমুনা নম্বর:' : 'Quick Sample:'}
                              </span>
                              {['01711002233', '01899112233', 'shop-superdeal.xyz'].map((sample, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setReportTarget(sample)}
                                  className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors"
                                >
                                  {sample}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Category Chips */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                <span>{locale === 'bn' ? '২. ঘটনার ধরন (ক্যাটাগরি) *' : '2. Incident Category *'}</span>
                                <HelpTooltip
                                  id="category-help"
                                  titleBn="ক্যাটাগরি নির্বাচন নির্দেশিকা"
                                  titleEn="Scam Category Guidance"
                                  textBn="ঘটনার সঠিক ক্যাটাগরি নির্বাচন করা অত্যন্ত গুরুত্বপূর্ণ। এটি জাতীয় স্পাইক হিটম্যাপ এবং বিটিআরসি/সিআইডি ড্যাশবোর্ডে সঠিক ইমার্জেন্সি রেসপন্স টিমকে অ্যালার্ট পাঠায়। (নিচে AI অটো-স্ক্যানারও রয়েছে)।"
                                  textEn="Selecting the correct scam category routes alerts to specialized cyber response teams. AI Auto-Categorization below dynamically detects the category from your description."
                                  locale={locale}
                                  activeId={activeHelpTooltip}
                                  setActiveId={setActiveHelpTooltip}
                                />
                              </label>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  id="consumer-ai-categorization-toggle"
                                  onClick={() => {
                                    toggleAiCategorization();
                                    showToast(
                                      isAiCategorizationEnabled
                                        ? (locale === 'bn' ? 'AI অটো-ক্যাটাগরি ইঞ্জিন বন্ধ করা হয়েছে (লোকাল স্টোরেজে সংরক্ষিত)' : 'AI Auto-Categorization Engine disabled (saved in local storage)')
                                        : (locale === 'bn' ? 'AI অটো-ক্যাটাগরি ইঞ্জিন চালু করা হয়েছে (লোকাল স্টোরেজে সংরক্ষিত)' : 'AI Auto-Categorization Engine enabled (saved in local storage)'),
                                      'info'
                                    );
                                  }}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                                    isAiCategorizationEnabled 
                                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 hover:bg-purple-200' 
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                                  }`}
                                  title={locale === 'bn' ? 'AI অটো-ক্যাটাগরাইজেশন চালু বা বন্ধ করুন' : 'Toggle AI Auto-Categorization engine'}
                                >
                                  <Sparkles className={`w-3 h-3 ${isAiCategorizationEnabled ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
                                  <span>{isAiCategorizationEnabled ? (locale === 'bn' ? 'AI ক্যাটাগরি: চালু' : 'AI Engine: ON') : (locale === 'bn' ? 'AI ক্যাটাগরি: বন্ধ' : 'AI Engine: OFF')}</span>
                                </button>
                              </div>
                            </div>

                            {/* AI Suggestion Banner in Step 1 if description was typed */}
                            {aiCategorization && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-3 mb-2 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-rose-500/10 border border-purple-500/30 flex items-center justify-between shadow-2xs"
                              >
                                <div className="flex items-center space-x-2">
                                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse shrink-0" />
                                  <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                      <span>{locale === 'bn' ? 'AI সুপারিশকৃত ক্যাটাগরি:' : 'AI Suggested Category:'}</span>
                                      <span className="text-purple-600 dark:text-purple-400 font-extrabold">{aiCategorization.category}</span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-mono font-bold">
                                        {aiCategorization.confidence}% Match
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                      {aiCategorization.reason}
                                    </p>
                                  </div>
                                </div>
                                {reportCategory !== aiCategorization.category ? (
                                  <button
                                    type="button"
                                    onClick={() => handleApplyAiCategory(aiCategorization.category)}
                                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
                                  >
                                    {locale === 'bn' ? 'প্রয়োগ করুন' : 'Apply AI Choice'}
                                  </button>
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{locale === 'bn' ? 'সিলেক্টেড' : 'Selected'}</span>
                                  </span>
                                )}
                              </motion.div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {[
                                'Fake MFS Cash-Back / OTP Call',
                                'Online Shop Advance Money Scam',
                                'Fake Overseas Job / Visa Trap',
                                'Telegram / YouTube Like Job',
                                'Phishing Link / Website',
                                'Courier Fake Tracking Charge'
                              ].map((cat, idx) => {
                                const isAiSuggested = aiCategorization?.category === cat;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setReportCategory(cat);
                                      triggerHapticFeedback(15);
                                      if (reportErrors.reportCategory) {
                                        setReportErrors(prev => ({ ...prev, reportCategory: '' }));
                                      }
                                    }}
                                    className={`p-2.5 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer relative ${
                                      reportCategory === cat
                                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-700 dark:text-rose-300 shadow-2xs'
                                        : isAiSuggested
                                        ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300 hover:bg-purple-100/70'
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{cat}</span>
                                      {isAiSuggested && (
                                        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[9px] font-bold flex items-center gap-0.5 shrink-0">
                                          <Sparkles className="w-2.5 h-2.5" />
                                          <span>AI Choice</span>
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            {reportErrors.reportCategory && (
                              <span className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-1 block">
                                {reportErrors.reportCategory}
                              </span>
                            )}
                          </div>

                          {/* Action Button Step 1 */}
                          <div className="pt-2 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={handleClearReportForm}
                              className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shrink-0"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span>{locale === 'bn' ? 'মুছে ফেলুন' : 'Clear'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleNextReportStep}
                              className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                            >
                              <span>{locale === 'bn' ? 'পরবর্তী ধাপ: ক্ষতি ও প্রমাণ' : 'Continue: Loss & Evidence'}</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 2: Financial Impact & Evidence */}
                      {reportStep === 2 && (
                        <motion.div
                          key="step-2"
                          custom={stepDirection}
                          initial={{ opacity: 0, x: stepDirection === 'forward' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: stepDirection === 'forward' ? -20 : 20 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="space-y-4"
                        >
                          {/* Amount Lost Chips */}
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                              <span>{locale === 'bn' ? '৩. ক্ষতির পরিমাণ (ঐচ্ছিক)' : '3. Financial Loss Amount (Optional)'}</span>
                              <HelpTooltip
                                id="amount-help"
                                titleBn="আর্থিক ক্ষতি তদন্ত নির্দেশিকা"
                                titleEn="Financial Crime Guidance"
                                textBn="আর্থিক ক্ষতির আনুমানিক পরিমাণ নির্বাচন করুন। ৫০,০০০ টাকার বেশি আর্থিক ক্ষতির অভিযোগগুলো সরাসরি BFIU (বাংলাদেশ ফিন্যান্সিয়াল ইন্টেলিজেন্স ইউনিট) ইমার্জেন্সি ফ্রিজ টিমে অগ্রাধিকার পায়।"
                                textEn="Select estimated loss. High-value fraud claims (over ৳50,000) are automatically prioritized for BFIU Emergency Asset Recovery & Freezing teams."
                                locale={locale}
                                activeId={activeHelpTooltip}
                                setActiveId={setActiveHelpTooltip}
                              />
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {['৳০ (টাকা পাঠাইনি)', '৳১,০০০ - ৳৫,০০০', '৳৫,০০০ - ৳২০,০০০', '৳২০,০০০+'].map((amt, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setReportAmountRange(amt);
                                    triggerHapticFeedback(15);
                                    if (reportErrors.reportAmountRange) {
                                      setReportErrors(prev => ({ ...prev, reportAmountRange: '' }));
                                    }
                                  }}
                                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                    reportAmountRange === amt
                                      ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-700 dark:text-amber-300 shadow-2xs'
                                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                  }`}
                                >
                                  {amt}
                                </button>
                              ))}
                            </div>
                            {reportErrors.reportAmountRange && (
                              <span className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-1 block">
                                {reportErrors.reportAmountRange}
                              </span>
                            )}
                          </div>

                          {/* Voice Note or Description */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
                                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                <span>{locale === 'bn' ? '৪. সংক্ষেপে বিবরণ অথবা ভয়েস রেকর্ড করুন' : '4. Description or 30s Voice Note'}</span>
                                {descriptionValidation.isValid ? (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[9px] flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    {locale === 'bn' ? 'পর্যাপ্ত বিবরণ' : 'Valid'}
                                  </span>
                                ) : descriptionValidation.isError ? (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[9px] flex items-center gap-1">
                                    <XCircle className="w-2.5 h-2.5" />
                                    {locale === 'bn' ? 'অসম্পূর্ণ বিবরণ' : 'Incomplete'}
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[9px]">
                                    {locale === 'bn' ? 'কমপক্ষে ১০ অক্ষর' : 'Min 10 Chars'}
                                  </span>
                                )}
                                <HelpTooltip
                                  id="description-help"
                                  titleBn="ঘটনার বিবরণ সংক্রান্ত নির্দেশিকা"
                                  titleEn="Incident Description Guidance"
                                  textBn="প্রতারক যেভাবে যোগাযোগের চেষ্টা করেছিল, পেমেন্টের সময় যা দাবি করেছিল এবং অফারের বিবরণ সংক্ষেপে লিখুন। টাইপ করতে সমস্যা হলে মাইক্রোফোন বাটন চেপে ৩০ সেকেন্ডের ভয়েস রেকর্ড করুন।"
                                  textEn="Mention the offer pitched, payment method requested, and timeline. If typing is difficult, tap the microphone button to record a 30-second voice note."
                                  locale={locale}
                                  activeId={activeHelpTooltip}
                                  setActiveId={setActiveHelpTooltip}
                                />
                              </label>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {locale === 'bn' ? 'বাংলা ভয়েস সাপোর্ট সক্রিয়' : 'Bangla Speech-to-Text ready'}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 mb-2">
                              <button
                                type="button"
                                onClick={isVoiceRecording ? handleStopVoiceRecording : handleStartVoiceRecording}
                                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                                  isVoiceRecording
                                    ? 'bg-rose-600 text-white animate-pulse'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                              >
                                {isVoiceRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                                <span>
                                  {isVoiceRecording
                                    ? `${locale === 'bn' ? 'রেকর্ডিং হচ্ছে...' : 'Recording...'} (${voiceSeconds}s / 30s)`
                                    : locale === 'bn' ? '🎤 ৩০ সেকেন্ড ভয়েস রেকর্ড করুন' : '🎤 Record 30s Voice'}
                                </span>
                              </button>

                              {voiceTranscript && (
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{locale === 'bn' ? 'ভয়েস টেক্সট সম্পন্ন' : 'Transcribed'}</span>
                                </span>
                              )}
                            </div>

                            <div className="relative">
                              <textarea
                                rows={3}
                                value={reportDescription}
                                onFocus={() => setIsDescriptionFocused(true)}
                                onBlur={() => setIsDescriptionFocused(false)}
                                onChange={(e) => {
                                  setReportDescription(e.target.value);
                                  if (reportErrors.reportDescription) {
                                    setReportErrors(prev => ({ ...prev, reportDescription: '' }));
                                  }
                                }}
                                placeholder={locale === 'bn' ? 'ঘটনাটি কীভাবে ঘটেছিল লিখুন (কমপক্ষে ১০ অক্ষর)...' : 'Briefly describe how the fraud occurred (at least 10 chars)...'}
                                className={`w-full px-3.5 py-2.5 pr-20 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none transition-all ${
                                  descriptionValidation.isValid
                                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 focus:ring-2 focus:ring-emerald-500/50'
                                    : descriptionValidation.isError
                                    ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-500/50'
                                    : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500'
                                }`}
                              />
                              <div className="absolute right-3 top-3 flex items-center gap-2 pointer-events-none">
                                {reportDescription.trim().length > 0 && (
                                  <span 
                                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
                                      descriptionValidation.isValid 
                                        ? 'text-emerald-600 bg-emerald-100/70 dark:text-emerald-400 dark:bg-emerald-950/50' 
                                        : 'text-amber-600 bg-amber-100/70 dark:text-amber-400 dark:bg-amber-950/50'
                                    }`}
                                  >
                                    {reportDescription.trim().length}/10
                                  </span>
                                )}
                                {descriptionValidation.isValid && (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in-50 duration-200" />
                                )}
                                {descriptionValidation.isError && (
                                  <XCircle className="w-5 h-5 text-rose-500 animate-in zoom-in-50 duration-200" />
                                )}
                              </div>
                            </div>

                            {/* Focus & Real-time Detailed Helper Text Area for Description */}
                            <AnimatePresence>
                              {isDescriptionFocused && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                  animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className={`p-3 rounded-xl border text-[11px] leading-relaxed transition-colors ${
                                    descriptionValidation.isValid 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                                      : descriptionValidation.isError
                                      ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300'
                                      : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-300'
                                  }`}>
                                    <div className="font-bold mb-1 flex items-center justify-between uppercase tracking-wider text-[10px]">
                                      <div className="flex items-center gap-1.5">
                                        {descriptionValidation.isValid ? (
                                          <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {locale === 'bn' ? 'বিবরণ পর্যাপ্ত' : 'Description Sufficient'}</>
                                        ) : descriptionValidation.isError ? (
                                          <><XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> {locale === 'bn' ? 'বিবরণ অসম্পূর্ণ' : 'Incomplete Description'}</>
                                        ) : (
                                          <><Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> {locale === 'bn' ? 'সহায়ক টিপস' : 'Helpful Tip'}</>
                                        )}
                                      </div>
                                      {reportDescription.trim().length > 0 && (
                                        <span className="font-mono text-[9px] font-bold">
                                          {reportDescription.trim().length} chars
                                        </span>
                                      )}
                                    </div>
                                    <p>
                                      {descriptionValidation.tip}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Real-time Dynamic Feedback Message (shown when unfocused if there is an error or note) */}
                            {descriptionValidation.message && !isDescriptionFocused && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-1.5 p-2 rounded-lg border text-[11px] font-medium flex items-start gap-1.5 ${
                                  descriptionValidation.isValid
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                                }`}
                              >
                                {descriptionValidation.isValid ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <div className="font-bold">{descriptionValidation.message}</div>
                                  {descriptionValidation.tip && (
                                    <div className="text-[10px] mt-0.5 opacity-90">{descriptionValidation.tip}</div>
                                  )}
                                </div>
                              </motion.div>
                            )}

                            {/* Sample Description Presets for Instant Testing */}
                            <div className="mt-2.5 flex items-center space-x-1.5 overflow-x-auto pb-1">
                              <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                {locale === 'bn' ? 'নমুনা বিবরণ (টেস্ট করুন):' : 'Sample scenarios:'}
                              </span>
                              {[
                                { label: '🛒 Online Shop Scam', text: 'ফেসবুক পেজ থেকে ড্রেস অর্ডার দিয়ে বিকাশ এডভান্স ১,০০০ টাকা দিয়েছি, এখন পেজ বন্ধ ও মেসেজে ব্লক দিয়েছে।' },
                                { label: '📱 Global Mobile Wallet Cash-Back Call', text: 'বিকাশ প্রতিনিধি পরিচয়ে ফোন দিয়ে ২০০০ টাকা ক্যাশব্যাক পাওয়ার কথা বলে পিন ও ওটিপি নম্বর নিয়ে টাকা কেটে নিয়েছে।' },
                                { label: '💼 Fake Visa Agency', text: 'দুবাই ক্লিনার চাকরির কথা বলে জেনুইন ভিসার নাম করে পাসপোর্ট ও ৫০,০০০ টাকা নিয়া এজেন্সির লোক ফোন অফ করে দিসে।' },
                                { label: '✈ Telegram Like Task', text: 'ইউটিউব চ্যানেলে লাইক দেওয়ার পার্ট টাইম জব প্রলোভন দিয়ে টেলিগ্রাম গ্রুপে ১০,০০০ টাকা ক্রিপ্টো ইনভেস্ট করার পর রিফান্ড দেয় নাই।' }
                              ].map((preset, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setReportDescription(preset.text)}
                                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-all cursor-pointer shrink-0"
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>

                            {/* AI Real-time Auto-Categorization Live Scanner Card */}
                            {aiCategorization ? (
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 p-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-slate-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 border border-purple-200 dark:border-purple-800/60 shadow-xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start space-x-2">
                                    <div className="p-1.5 rounded-lg bg-purple-600 text-white shadow-2xs mt-0.5">
                                      <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                          {locale === 'bn' ? '🤖 AI সংক্রিয় ক্যাটাগরি স্ক্যানার' : '🤖 AI Smart Auto-Categorization'}
                                        </span>
                                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-300 dark:border-purple-700">
                                          {aiCategorization.confidence}% Confidence
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                                        {aiCategorization.reason}
                                      </p>
                                    </div>
                                  </div>

                                  {reportCategory !== aiCategorization.category ? (
                                    <button
                                      type="button"
                                      onClick={() => handleApplyAiCategory(aiCategorization.category)}
                                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
                                    >
                                      <Sparkles className="w-3.5 h-3.5" />
                                      <span>{locale === 'bn' ? 'ক্যাটাগরি সেট করুন' : 'Apply Category'}</span>
                                    </button>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center space-x-1 border border-emerald-300 dark:border-emerald-800 shrink-0">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      <span>{locale === 'bn' ? 'ক্যাটাগরি সেট আছে' : 'Category Set'}</span>
                                    </span>
                                  )}
                                </div>

                                {/* Matched Keywords Chips */}
                                <div className="mt-2 pt-2 border-t border-purple-200/50 dark:border-purple-800/40 flex items-center justify-between text-[11px] flex-wrap gap-1">
                                  <div className="flex items-center space-x-1.5 overflow-x-auto">
                                    <span className="text-slate-400 font-medium text-[10px] uppercase shrink-0">
                                      {locale === 'bn' ? 'শনাক্তকৃত শব্দসমূহ:' : 'Keywords matched:'}
                                    </span>
                                    {aiCategorization.keywordsFound.map((kw, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold shrink-0"
                                      >
                                        #{kw}
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                    Current: <strong className="text-purple-600 dark:text-purple-400">{reportCategory}</strong>
                                  </span>
                                </div>
                              </motion.div>
                            ) : !isAiCategorizationEnabled ? (
                              <div className="mt-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-[11px]">
                                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                                  <span>
                                    {locale === 'bn'
                                      ? 'AI অটো-ক্যাটাগরি ইঞ্জিন বন্ধ রয়েছে (ম্যানুয়াল মোড)।'
                                      : 'AI Auto-Categorization Engine is currently disabled (Manual mode).'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAiCategorization(true);
                                    showToast(
                                      locale === 'bn' 
                                        ? 'AI অটো-ক্যাটাগরি ইঞ্জিন সক্রিয় করা হয়েছে' 
                                        : 'AI Auto-Categorization Engine enabled',
                                      'success'
                                    );
                                  }}
                                  className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] transition-colors cursor-pointer shrink-0"
                                >
                                  {locale === 'bn' ? 'চালু করুন' : 'Enable AI Engine'}
                                </button>
                              </div>
                            ) : (
                              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
                                <span>
                                  {locale === 'bn'
                                    ? '💡 ঘটনার বিবরণ লিখুন; AI স্বয়ংক্রিয়ভাবে সঠিক ক্যাটাগরি সুপারিশ করবে।'
                                    : '💡 Type description above; AI will automatically suggest the best report category.'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* 5. Evidence Screenshots & Payment Slips Vault Upload */}
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Camera className="w-3.5 h-3.5 text-indigo-500" />
                                <span>
                                  {locale === 'bn'
                                    ? '৫. প্রমাণপত্রের স্ক্রিনশট বা পেমেন্ট রসিদ যুক্ত করুন (এভিডেন্স ভল্ট)'
                                    : '5. Attach Screenshots or Payment Slips (Simulated Vault)'}
                                </span>
                                <HelpTooltip
                                  id="evidence-help"
                                  titleBn="প্রমাণপত্র ভল্ট সংক্রান্ত নির্দেশিকা"
                                  titleEn="Evidence Vault Guidance"
                                  textBn="বিকাশ/নগদ ট্রানজেকশন আইডি (TrxID) স্পষ্ট দেখা যায় এমন স্ক্রিনশট, মেসেঞ্জার/হোয়াটসঅ্যাপ চ্যাট বা কল লগ দিন। ফাইলগুলো ডিজিটাল ক্রাইম আদালতে প্রমাণের জন্য ক্রিপ্টোগ্রাফিক ভল্টে সংরক্ষিত হয়।"
                                  textEn="Attach screenshots showing TrxID, Messenger/WhatsApp chats, or call logs. Files are cryptographically hash-sealed in WORM evidence storage for courtroom admissibility."
                                  locale={locale}
                                  activeId={activeHelpTooltip}
                                  setActiveId={setActiveHelpTooltip}
                                />
                              </label>

                              <div className="flex items-center space-x-2">
                                {/* Integrated 'Scan evidence QR' Button next to Evidence Vault Header */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQrScannerTarget('evidence');
                                    setShowQrScanner(true);
                                  }}
                                  className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center space-x-1 shadow-xs transition-all cursor-pointer ring-2 ring-purple-500/20"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  <span>{locale === 'bn' ? '📷 স্ক্যান এভিডেন্স QR' : '📷 Scan Evidence QR'}</span>
                                </button>

                                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>{locale === 'bn' ? 'ক্রিপ্টোগ্রাফিক সিলেকশন' : 'Encrypted Vault'}</span>
                                </span>
                              </div>
                            </div>

                            {/* Hidden File Inputs */}
                            <input
                              type="file"
                              ref={fileGalleryInputRef}
                              accept="image/*,.pdf"
                              multiple
                              onChange={(e) => handleFileUpload(e.target.files, 'SCAM_CHAT')}
                              className="hidden"
                            />
                            <input
                              type="file"
                              ref={fileCameraInputRef}
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => handleFileUpload(e.target.files, 'PAYMENT_SLIP')}
                              className="hidden"
                            />

                            {/* Drag & Drop Upload Zone */}
                            <div
                              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                              onDragLeave={() => setIsDraggingOver(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDraggingOver(false);
                                handleFileUpload(e.dataTransfer.files, 'SCAM_CHAT');
                              }}
                              className={`p-4 rounded-2xl border-2 border-dashed transition-all text-center ${
                                isDraggingOver
                                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]'
                                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-indigo-300 dark:hover:border-indigo-700'
                              }`}
                            >
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
                                  <Upload className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {locale === 'bn' ? 'ড্র্যাগ এবং ড্রপ করুন অথবা গ্যালারি/ক্যামেরা থেকে সিলেক্ট করুন' : 'Drag & drop evidence files or select source'}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {locale === 'bn' ? 'মেসেঞ্জার চ্যাট, বিকাশ/নগদ পেমেন্ট স্লিপ বা এসএমএস (PNG, JPG, PDF)' : 'Messenger chat, Global Mobile Wallet/Digital Wallet payment slips, OTP call logs (PNG, JPG, PDF)'}
                                  </p>
                                </div>

                                <div className="flex items-center space-x-2 pt-1 flex-wrap gap-y-1.5 justify-center">
                                  <button
                                    type="button"
                                    onClick={() => fileGalleryInputRef.current?.click()}
                                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>{locale === 'bn' ? '📁 গ্যালারি ফাইল' : '📁 Choose Gallery'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => fileCameraInputRef.current?.click()}
                                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                                  >
                                    <Camera className="w-3.5 h-3.5" />
                                    <span>{locale === 'bn' ? '📷 ক্যামেরা তুলুন' : '📷 Take Photo'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQrScannerTarget('evidence');
                                      setShowQrScanner(true);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                                  >
                                    <QrCode className="w-3.5 h-3.5" />
                                    <span>{locale === 'bn' ? '🔍 স্ক্যান এভিডেন্স QR' : '🔍 Scan Evidence QR'}</span>
                                  </button>
                                </div>

                                {/* Quick Preset Samples for instant demo */}
                                <div className="pt-2 flex items-center space-x-1.5 overflow-x-auto max-w-full">
                                  <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                    {locale === 'bn' ? 'নমুনা প্রমাণ (১-ক্লিক ট্রায়াল):' : 'Sample attachments:'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddSampleEvidence('payment_slip')}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shrink-0"
                                  >
                                    💳 {locale === 'bn' ? 'বিকাশ রসিদ' : 'Global Mobile Wallet Slip'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddSampleEvidence('chat_screenshot')}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-all cursor-pointer shrink-0"
                                  >
                                    💬 {locale === 'bn' ? 'মেসেঞ্জার চ্যাট' : 'Scam Chat'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddSampleEvidence('otp_sms')}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer shrink-0"
                                  >
                                    📞 {locale === 'bn' ? 'কল / ওটিপি স্ক্রিনশট' : 'Call/OTP Log'}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Bulk Selection Counter above Evidence Vault list */}
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-2">
                              <div className="flex items-center space-x-2">
                                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>{locale === 'bn' ? 'বাল্ক সিলেকশন কাউন্টার (ম্যানিফেস্ট ডাউনলোডের জন্য প্রস্তুত)' : 'Bulk Selection Counter: Ready for Manifest Download'}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[11px]">
                                {evidenceAttachments.length} {locale === 'bn' ? 'টি ফাইল সিলেক্টেড' : 'files selected'}
                              </span>
                            </div>

                            {/* Attached Files Vault Grid */}
                            {evidenceAttachments.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>{locale === 'bn' ? `সংযুক্ত প্রমাণপত্র (${evidenceAttachments.length} টি ফাইল)` : `Sealed Attachments Vault (${evidenceAttachments.length} files)`}</span>
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">WORM Immutable Log</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {evidenceAttachments.map((att) => (
                                    <div
                                      key={att.id}
                                      onClick={() => setPreviewAttachment(att)}
                                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs group hover:border-indigo-400 transition-all cursor-pointer"
                                    >
                                      <div className="flex items-center space-x-2.5 min-w-0">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 relative">
                                          <img src={att.previewUrl} alt={att.fileName} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                            {att.fileName}
                                          </p>
                                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                                            <span>{att.fileSize}</span>
                                            <span>•</span>
                                            {getEvidenceStatusBadge(att.status)}
                                          </div>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleRemoveAttachment(att.id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer shrink-0"
                                        title="Remove Attachment"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-4">
                                  {/* Attachment Preview Modal */}
                                  {previewAttachment && (
                                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewAttachment(null)}>
                                      <div className="relative max-w-2xl w-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 overflow-auto" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setPreviewAttachment(null)} className="absolute top-2 right-2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                                          <XCircle className="w-5 h-5" />
                                        </button>
                                        {previewAttachment.previewUrl.toLowerCase().endsWith('.pdf') ? (
                                          <iframe src={previewAttachment.previewUrl} className="w-full h-[60vh]" title="PDF Preview" />
                                        ) : (
                                          <img src={previewAttachment.previewUrl} alt={previewAttachment.fileName} className="w-full h-auto rounded-lg" />
                                        )}
                                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{previewAttachment.fileName}</h3>
                                          <p className="text-xs text-slate-500 mt-1">{previewAttachment.fileSize}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {/* Evidence Vault Summary Footer */}
                                <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-[10px]">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                      <FileText className="w-3.5 h-3.5" />
                                      <span className="font-bold">
                                        {vaultStats.count} {locale === 'bn' ? 'টি ফাইল' : 'Files'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                      <HardDrive className="w-3.5 h-3.5" />
                                      <span className="font-bold">
                                        {vaultStats.sizeMb} MB {locale === 'bn' ? 'স্টোরেজ' : 'Used'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-tighter italic">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>{locale === 'bn' ? 'হাশড ও সিল্ড' : 'Hashed & Sealed'}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {evidenceAttachments.length > 0 && (
                              <div className="mt-3 space-y-2.5">
                                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-400 transition-all">
                                  <div className="flex items-center space-x-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                                      <Lock className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                        {locale === 'bn' ? 'PII-রেড্যাক্টেড অডিট লগ অন্তর্ভুক্ত করুন' : 'Include PII-Redacted Audit Log'}
                                      </span>
                                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {locale === 'bn' ? 'স্থানীয় ডেটা গোপনীয়তা নিয়ম অনুযায়ী সংবেদনশীল তথ্য মাস্ক করুন' : 'Mask phone numbers, names, and identifiers per local data privacy regulations'}
                                      </span>
                                    </div>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={includePiiRedactedLog}
                                    onChange={(e) => setIncludePiiRedactedLog(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                  />
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={handleDownloadEvidenceManifest}
                                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                                  >
                                    <Download className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{locale === 'bn' ? '📥 ম্যানিফেস্ট ডাউনলোড (ZIP)' : '📥 Download Manifest'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleEmptyVault}
                                    className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{locale === 'bn' ? '🗑️ ভল্ট খালি করুন' : '🗑️ Empty Vault'}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons Step 2 */}
                          <div className="flex items-center gap-3 pt-2">
                            <button
                              type="button"
                              onClick={handlePrevReportStep}
                              className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shrink-0"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              <span>{locale === 'bn' ? 'আগের ধাপ' : 'Back'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleClearReportForm}
                              className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shrink-0"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span>{locale === 'bn' ? 'মুছে ফেলুন' : 'Clear'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleNextReportStep}
                              className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                            >
                              <span>{locale === 'bn' ? 'পরবর্তী ধাপ: পর্যালোচনা ও দাখিল' : 'Continue: Review & Submit'}</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 3: Review & Anonymous Submission */}
                      {reportStep === 3 && (
                        <motion.div
                          key="step-3"
                          custom={stepDirection}
                          initial={{ opacity: 0, x: stepDirection === 'forward' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: stepDirection === 'forward' ? -20 : 20 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="space-y-4"
                        >
                          {/* Quick Summary Review Card */}
                          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-rose-500" />
                                {locale === 'bn' ? 'অভিযোগের সংক্ষিপ্ত সারসংক্ষেপ' : 'Report Summary Review'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleJumpToReportStep(1)}
                                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                              >
                                {locale === 'bn' ? 'পরিবর্তন করুন' : 'Edit Info'}
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                                    {locale === 'bn' ? 'প্রতারক নম্বর / লিঙ্ক' : 'Suspect Target'}
                                  </span>
                                  {targetValidation.isValid ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 text-[9px] font-bold flex items-center gap-0.5">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      {locale === 'bn' ? 'যাচাইকৃত' : 'Validated'}
                                    </span>
                                  ) : (
                                    <span className="text-rose-600 dark:text-rose-400 text-[9px] font-bold flex items-center gap-0.5">
                                      <XCircle className="w-2.5 h-2.5" />
                                      {locale === 'bn' ? 'ত্রুটি' : 'Error'}
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                                  {reportTarget || 'N/A'}
                                </span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                                  {locale === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                                </span>
                                <span className="font-bold text-rose-600 dark:text-rose-400 truncate block mt-0.5">
                                  {reportCategory}
                                </span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                                  {locale === 'bn' ? 'ক্ষতির পরিমাণ' : 'Amount Range'}
                                </span>
                                <span className="font-bold text-amber-600 dark:text-amber-400 truncate block mt-0.5">
                                  {reportAmountRange}
                                </span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                                    {locale === 'bn' ? 'বিবরণ / প্রমাণ' : 'Evidence Status'}
                                  </span>
                                  {descriptionValidation.isValid ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 text-[9px] font-bold flex items-center gap-0.5">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      {locale === 'bn' ? 'পর্যাপ্ত' : 'Sufficient'}
                                    </span>
                                  ) : (
                                    <span className="text-rose-600 dark:text-rose-400 text-[9px] font-bold flex items-center gap-0.5">
                                      <XCircle className="w-2.5 h-2.5" />
                                      {locale === 'bn' ? 'অসম্পূর্ণ' : 'Incomplete'}
                                    </span>
                                  )}
                                </div>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block mt-0.5">
                                  {voiceTranscript ? (locale === 'bn' ? 'ভয়েস ট্রান্সক্রিপ্ট সংযুক্ত' : 'Voice Attached') : reportDescription ? (locale === 'bn' ? `টেক্সট বিবরণ (${reportDescription.trim().length} অক্ষর)` : `Text (${reportDescription.trim().length} chars)`) : (locale === 'bn' ? 'সংক্ষিপ্ত তথ্য' : 'Quick Notice')}
                                </span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-between">
                                  <span>{locale === 'bn' ? 'ঘটনার অবস্থান (জিপিএস ডিটেক্টেড)' : 'Incident Location (GPS Captured)'}</span>
                                  {locationCaptured && (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-bold">
                                      ✓ {locale === 'bn' ? 'অবস্থান সুনির্দিষ্ট' : 'Location Verified'}
                                    </span>
                                  )}
                                </span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                                  {reportLocation
                                    ? `📍 ${reportLocation.district} District (${reportLocation.lat}° N, ${reportLocation.lng}° E) • ${reportLocation.areaName}`
                                    : (locale === 'bn' ? 'অবস্থান ডিটেক্ট করা হয়নি' : 'Location Pending Detection')}
                                </span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-between">
                                  <span>{locale === 'bn' ? 'এভিডেন্স ভল্ট ফাইলসমূহ' : 'Evidence Vault Attachments'}</span>
                                  <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[9px] font-bold">
                                    {evidenceAttachments.length} {locale === 'bn' ? 'টি ফাইল সংকেতায়িত' : 'file(s) sealed'}
                                  </span>
                                </span>
                                {evidenceAttachments.length > 0 ? (
                                  <div className="flex items-center space-x-2 mt-1.5 overflow-x-auto pb-1">
                                    {evidenceAttachments.map(att => (
                                      <div key={att.id} className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 shrink-0">
                                        <img src={att.previewUrl} className="w-4 h-4 rounded object-cover" />
                                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 truncate max-w-[130px]">{att.fileName}</span>
                                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">({att.vaultHash.slice(0, 8)})</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic block mt-0.5">
                                    {locale === 'bn' ? 'কোনো চিত্র বা পেমেন্ট রসিদ যুক্ত করা হয়নি (ঐচ্ছিক)' : 'No image attachments uploaded (Optional)'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Privacy & Anonymous Mode */}
                          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <Lock className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                  {locale === 'bn' ? 'সম্পূর্ণ বেনামী মোড (100% Anonymous)' : '100% Anonymous Mode'}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {locale === 'bn' ? 'আপনার কোনো ব্যক্তিগত তথ্য সংরক্ষণ বা প্রকাশ করা হবে না।' : 'Zero identity logging; sealed under regulatory shield.'}
                                </span>
                              </div>
                            </div>

                            <input
                              type="checkbox"
                              checked={isAnonymous}
                              onChange={(e) => setIsAnonymous(e.target.checked)}
                              className="w-5 h-5 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                            />
                          </div>

                          {/* Citizen Biometric Identity Camera Matcher */}
                          <div className="my-1">
                            <CitizenIdentityCameraVerifier
                              locale={locale}
                              showToast={showToast}
                              onIdentityVerified={(proof) => setBiometricProof(proof)}
                              initialProof={biometricProof}
                            />
                          </div>

                          {!isAnonymous && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
                            >
                              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
                                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>{locale === 'bn' ? 'আপনার যোগাযোগ নম্বর (ঐচ্ছিক - ফলোআপের জন্য)' : 'Your Phone Number (Optional for follow-up)'}</span>
                                  {complainantPhone.trim() && (
                                    complainantPhoneValidation.isValid ? (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[9px] flex items-center gap-1">
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                        {locale === 'bn' ? 'সঠিক নম্বর' : 'Valid BD Phone'}
                                      </span>
                                    ) : complainantPhoneValidation.isError ? (
                                      <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[9px] flex items-center gap-1">
                                        <XCircle className="w-2.5 h-2.5" />
                                        {locale === 'bn' ? 'ভুল ফরম্যাট' : 'Invalid Format'}
                                      </span>
                                    ) : null
                                  )}
                                  {!complainantPhone.trim() && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[9px]">
                                      {locale === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                                    </span>
                                  )}
                                  <HelpTooltip
                                    id="contact-help"
                                    titleBn="যোগাযোগ নম্বর নির্দেশিকা"
                                    titleEn="Contact Follow-up Guidance"
                                    textBn="আপনার আসল পরিচয় সম্পূর্ণ গোপন থাকবে। নম্বর প্রদান করলে বিটিআরসি/সিআইডি তদন্ত কর্মকর্তা কেবল কেস ট্র্যাকিং ও উদ্ধারের এসএমএস আপডেট পাঠাতে পারবেন।"
                                    textEn="Zero-Trace anonymity is preserved. Providing your mobile number allows regulators to send SMS case tracking numbers and recovery updates."
                                    locale={locale}
                                    activeId={activeHelpTooltip}
                                    setActiveId={setActiveHelpTooltip}
                                  />
                                </label>
                              </div>
                              <div className="relative">
                                <input
                                  type="tel"
                                  value={complainantPhone}
                                  onFocus={() => setIsComplainantPhoneFocused(true)}
                                  onBlur={() => setIsComplainantPhoneFocused(false)}
                                  onChange={(e) => {
                                    setComplainantPhone(e.target.value);
                                    if (reportErrors.complainantPhone) {
                                      setReportErrors(prev => ({ ...prev, complainantPhone: '' }));
                                    }
                                  }}
                                  placeholder="e.g. 01800112233"
                                  className={`w-full px-3 py-2 pr-20 rounded-xl bg-white dark:bg-slate-900 border text-xs font-semibold text-slate-900 dark:text-white focus:outline-none transition-all ${
                                    complainantPhoneValidation.isValid && complainantPhone.trim()
                                      ? 'border-emerald-500 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500/50'
                                      : complainantPhoneValidation.isError
                                      ? 'border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/50'
                                      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
                                  }`}
                                />
                                <div className="absolute right-3 top-2.5 flex items-center gap-1.5 pointer-events-none">
                                  {complainantPhone.trim().length > 0 && (
                                    <span 
                                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
                                        complainantPhoneValidation.isValid 
                                          ? 'text-emerald-600 bg-emerald-100/70 dark:text-emerald-400 dark:bg-emerald-950/50' 
                                          : 'text-amber-600 bg-amber-100/70 dark:text-amber-400 dark:bg-amber-950/50'
                                      }`}
                                    >
                                      {complainantPhone.trim().replace(/[\s-]/g, '').length}/11
                                    </span>
                                  )}
                                  {complainantPhoneValidation.isValid && complainantPhone.trim() && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in zoom-in-50 duration-200" />
                                  )}
                                  {complainantPhoneValidation.isError && (
                                    <XCircle className="w-4 h-4 text-rose-500 animate-in zoom-in-50 duration-200" />
                                  )}
                                </div>
                              </div>

                              {/* Focus & Real-time Detailed Helper Text Area for Complainant Phone */}
                              <AnimatePresence>
                                {isComplainantPhoneFocused && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className={`p-3 rounded-xl border text-[11px] leading-relaxed transition-colors ${
                                      complainantPhoneValidation.isValid && complainantPhone.trim()
                                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                                        : complainantPhoneValidation.isError
                                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300'
                                        : 'bg-slate-100 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}>
                                      <div className="font-bold mb-1 flex items-center justify-between uppercase tracking-wider text-[10px]">
                                        <div className="flex items-center gap-1.5">
                                          {complainantPhoneValidation.isValid && complainantPhone.trim() ? (
                                            <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {locale === 'bn' ? 'নম্বর সঠিক' : 'Valid Phone Number'}</>
                                          ) : complainantPhoneValidation.isError ? (
                                            <><XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" /> {locale === 'bn' ? 'ভুল মোবাইল নম্বর ফরম্যাট' : 'Invalid Mobile Format'}</>
                                          ) : (
                                            <><Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> {locale === 'bn' ? 'মোবাইল নম্বর নির্দেশিকা' : 'Mobile Number Guidance'}</>
                                          )}
                                        </div>
                                        {complainantPhone.trim().length > 0 && (
                                          <span className="font-mono text-[9px] font-bold">
                                            {complainantPhone.trim().replace(/[\s-]/g, '').length} digits
                                          </span>
                                        )}
                                      </div>
                                      <p>
                                        {complainantPhoneValidation.tip}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Dynamic Message for Complainant Phone (shown when unfocused) */}
                              {complainantPhoneValidation.message && !isComplainantPhoneFocused && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`mt-1.5 p-2 rounded-lg border text-[11px] font-medium flex items-start gap-1.5 ${
                                    complainantPhoneValidation.isValid
                                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                                  }`}
                                >
                                  {complainantPhoneValidation.isValid ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                  )}
                                  <div className="flex-1">
                                    <div className="font-bold">{complainantPhoneValidation.message}</div>
                                    {complainantPhoneValidation.tip && (
                                      <div className="text-[10px] mt-0.5 opacity-90">{complainantPhoneValidation.tip}</div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                          )}

                          {/* Action Buttons Step 3 */}
                          <div className="flex items-center gap-3 pt-2">
                            <button
                              type="button"
                              onClick={handlePrevReportStep}
                              className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shrink-0"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              <span>{locale === 'bn' ? 'আগের ধাপ' : 'Back'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleClearReportForm}
                              className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shrink-0"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span>{locale === 'bn' ? 'মুছে ফেলুন' : 'Clear'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPdfReport()}
                              className="px-4 py-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center space-x-1.5 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shrink-0"
                            >
                              <FileDown className="w-4 h-4" />
                              <span>{locale === 'bn' ? 'পিডিএফ' : 'PDF'}</span>
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmittingReport || !reportTarget.trim()}
                              className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-rose-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                            >
                              {isSubmittingReport ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Send className="w-4 h-4" />
                                  <span>{locale === 'bn' ? '৬০ সেকেন্ডে অভিযোগ দাখিল করুন' : 'Submit 60-Second Report'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}

          {/* ========================================================================= */}
          {/* TAB 3: SCAM ALERTS & HEAT MAP */}
          {/* ========================================================================= */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              
              {/* Check Spike Banner */}
              {activeSpikes.length > 0 && (
                <div className="p-4 rounded-3xl bg-rose-500 text-white shadow-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-white/20">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                        {locale === 'bn' ? 'লাইভ স্পাইক ডিটেকশন' : 'Live Spike Detection'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold mt-0.5">
                        {locale === 'bn'
                          ? `সতর্কতা: ${activeSpikes[0].maskedSample} নম্বরে ২৪ ঘণ্টায় ${activeSpikes[0].checkCount24h} বার চেক করা হয়েছে`
                          : `Spike Alert: ${activeSpikes[0].maskedSample} queried ${activeSpikes[0].checkCount24h} times in 24h`}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setInputQuery('01711002233');
                      setActiveTab('check');
                      handleRunCheck('01711002233', 'wallet');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white text-rose-700 font-bold text-xs shrink-0 hover:bg-white/90 transition-colors"
                  >
                    {locale === 'bn' ? 'যাচাই দেখুন' : 'Inspect'}
                  </button>
                </div>
              )}

              {/* Filters for Alerts */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5" />
                    {locale === 'bn' ? 'সতর্কবার্তা ফিল্টার' : 'Filter Alerts'}
                  </h4>
                  {(categoryFilter !== 'ALL' || authorityFilter !== 'ALL') && (
                    <button 
                      onClick={() => { setCategoryFilter('ALL'); setAuthorityFilter('ALL'); }}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      {locale === 'bn' ? 'ফিল্টার মুছুন' : 'Reset Filters'}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-1.5">
                    {['ALL', 'MFS_BANKING', 'ECOMMERCE', 'JOB_SCAM', 'VISA_IMMIGRATION', 'CYBER_PHISHING'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                          categoryFilter === cat
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                        }`}
                      >
                        {cat === 'ALL' ? (locale === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories') : cat.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Authority Filter */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={authorityFilter}
                      onChange={(e) => setAuthorityFilter(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="ALL">{locale === 'bn' ? 'সব অথরিটি (Authority)' : 'All Authorities'}</option>
                      {Array.from(new Set(alertsList.map(a => a.authorityCoBrand))).map(auth => (
                        <option key={auth} value={auth}>{auth}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                      <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert List */}
              <div className="space-y-3">
                {(() => {
                  const filtered = alertsList
                    .filter(a => categoryFilter === 'ALL' || a.sector === categoryFilter)
                    .filter(a => authorityFilter === 'ALL' || a.authorityCoBrand === authorityFilter);
                  
                  if (filtered.length === 0) {
                    return (
                      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {locale === 'bn' ? 'কোনো সতর্কতা পাওয়া যায়নি' : 'No Alerts Found'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
                          {locale === 'bn' 
                            ? 'আপনার ফিল্টারের সাথে মিলে এমন কোনো থ্রেট ইন্টেলিজেন্স নেই।' 
                            : 'No threat intelligence matches your current filter criteria.'}
                        </p>
                        <button 
                          onClick={() => { setCategoryFilter('ALL'); setAuthorityFilter('ALL'); }}
                          className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          {locale === 'bn' ? 'সব দেখুন' : 'Show All Alerts'}
                        </button>
                      </div>
                    );
                  }

                  return filtered.map((alertItem) => (
                    <div
                      key={alertItem.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          alertItem.criticality === 'CRITICAL_BREAKING'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                        }`}>
                          {alertItem.criticality === 'CRITICAL_BREAKING' ? '🚨 CRITICAL' : '⚡ HIGH ALERT'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {alertItem.id}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(alertItem.publishedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {locale === 'bn' ? alertItem.titleBn : alertItem.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {locale === 'bn' ? alertItem.summaryBn : alertItem.summaryEn}
                    </p>

                    {/* Modus Operandi Box */}
                    <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {locale === 'bn' ? 'প্রতারণার ধরন (Modus Operandi):' : 'Modus Operandi:'}
                      </span>
                      <p className="text-slate-600 dark:text-slate-400">
                        {locale === 'bn' ? alertItem.modUsOperandiBn : alertItem.modUsOperandiEn}
                      </p>
                    </div>

                    {/* Authority Seal & WhatsApp Share */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{alertItem.authorityCoBrand}</span>
                      </span>

                      <button
                        onClick={() => {
                          setShowShareModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp এ শেয়ার করুন</span>
                      </button>
                    </div>
                  </div>
                  ));
                })()}
            </div>
          </div>
        )}

          {/* ========================================================================= */}
          {/* TAB 4: SCAM SCHOOL & BADGES */}
          {/* ========================================================================= */}
          {activeTab === 'school' && (
            <div className="space-y-4">
              
              {/* Citizen Badge Showcase */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      {locale === 'bn' ? 'নাগরিক সুরক্ষা ব্যাজ' : 'Citizen Shield Badges'}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Level {userScore} Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {badges.map((b) => (
                    <div
                      key={b.level}
                      className={`p-3 rounded-2xl border transition-all ${
                        b.unlockedAt
                          ? 'bg-white/10 border-amber-400/40 text-white'
                          : 'bg-black/20 border-white/10 text-white/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">L{b.level}</span>
                        {b.unlockedAt ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-bold block truncate">{locale === 'bn' ? b.titleBn : b.titleEn}</span>
                      <span className="text-[10px] text-white/70 block mt-0.5">{locale === 'bn' ? b.criteriaBn : b.criteriaEn}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lessons Feed */}
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                        {lesson.category} • {lesson.durationMinutes} min
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {lesson.readCount.toLocaleString()} {locale === 'bn' ? 'জন পড়েছেন' : 'reads'}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {locale === 'bn' ? lesson.titleBn : lesson.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {locale === 'bn' ? lesson.summaryBn : lesson.summaryEn}
                    </p>

                    {/* Step by step checklist */}
                    <div className="mt-3 space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                      {(locale === 'bn' ? lesson.stepsBn : lesson.stepsEn).map((step, sIdx) => (
                        <div key={sIdx} className="text-slate-700 dark:text-slate-300">
                          {step}
                        </div>
                      ))}
                    </div>

                    {/* Micro Quiz Trigger */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2">
                        🧠 {locale === 'bn' ? 'মাইক্রো-কুইজ:' : 'Micro-Quiz:'} {locale === 'bn' ? lesson.quiz.questionBn : lesson.quiz.questionEn}
                      </span>

                      <div className="space-y-1.5">
                        {(locale === 'bn' ? lesson.quiz.optionsBn : lesson.quiz.optionsEn).map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => handleAnswerQuiz(oIdx)}
                            className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                              quizSubmitted
                                ? oIdx === lesson.quiz.correctIndex
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                                  : quizAnswerSelected === oIdx
                                  ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-900 dark:text-rose-200'
                                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
                                : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {quizSubmitted && (
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                          {locale === 'bn' ? lesson.quiz.explanationBn : lesson.quiz.explanationEn}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: VERIFY (BADGES, AGENTS & DOCS) */}
          {/* ========================================================================= */}
          {activeTab === 'verify' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {locale === 'bn' ? 'প্রমাণ ও ফিল্ড এজেন্ট যাচাই' : 'Cryptographic Proof & Agent Verify'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {locale === 'bn'
                      ? 'ট্রাস্ট ব্যাজ কিউআর কোড (ZK VC) অথবা ডেলিভারি/ফিল্ড প্রতিনিধির আইডি নম্বর যাচাই করুন।'
                      : 'Verify Trust Badge ZK credentials or delivery / field agent authorization.'}
                  </p>
                </div>

                {/* Sub-mode Switcher */}
                <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-4">
                  <button
                    onClick={() => setVerifyMode('badge')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      verifyMode === 'badge' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {locale === 'bn' ? 'ট্রাস্ট ব্যাজ (QR/ID)' : 'Trust Badge (ZK)'}
                  </button>
                  <button
                    onClick={() => setVerifyMode('nfc')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      verifyMode === 'nfc' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{locale === 'bn' ? 'সিটিজেন কার্ড (NFC)' : 'Citizen Card (NFC)'}</span>
                  </button>
                  <button
                    onClick={() => setVerifyMode('agent')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      verifyMode === 'agent' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {locale === 'bn' ? 'ফিল্ড এজেন্ট আইডি' : 'Field Agent ID'}
                  </button>
                </div>

                {/* Mode 1: Trust Badge Verification */}
                {verifyMode === 'badge' && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={badgeQuery}
                        onChange={(e) => setBadgeQuery(e.target.value)}
                        placeholder="e.g. TB-BD-2026-98101"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setQrScannerTarget('badge');
                          setShowQrScanner(true);
                        }}
                        className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-400 border border-teal-300 dark:border-teal-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Scan Trust Badge QR with Camera"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="hidden sm:inline">Scan QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifyMode('nfc')}
                        className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Scan Physical Citizen Card with Web NFC"
                      >
                        <Radio className="w-4 h-4" />
                        <span className="hidden sm:inline">NFC Tap</span>
                      </button>
                      <button
                        onClick={handleVerifyBadge}
                        className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        {locale === 'bn' ? 'ZK ভেরিফাই' : 'Verify ZK Proof'}
                      </button>
                    </div>

                    {badgeResult && (
                      <div className={`p-4 rounded-2xl border ${
                        badgeResult.isValid
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {badgeResult.isValid ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-600" />
                          )}
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {badgeResult.businessName}
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Credential Status</span>
                            <span className="font-mono font-bold text-emerald-600">{badgeResult.zkProofStatus}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Issuing Authority</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{badgeResult.issuingAuthority}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mode 2: Field Agent Verification */}
                {verifyMode === 'agent' && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={agentQuery}
                        onChange={(e) => setAgentQuery(e.target.value)}
                        placeholder="e.g. AGT-Global Mobile Wallet-8819 or AGT-REDX-4421"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setQrScannerTarget('agent');
                          setShowQrScanner(true);
                        }}
                        className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Scan Agent Badge QR with Camera"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="hidden sm:inline">Scan QR</span>
                      </button>
                      <button
                        onClick={handleVerifyAgent}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        {locale === 'bn' ? 'এজেন্ট সন্ধান' : 'Search Agent'}
                      </button>
                    </div>

                    {agentResult && (
                      <div className={`p-4 rounded-2xl border ${
                        agentResult.isValid
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <UserCheck className="w-5 h-5 text-indigo-600" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {agentResult.agentName} ({agentResult.agentId})
                          </h4>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 font-medium">
                          {agentResult.roleTitle} • {agentResult.partnerOrganization}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Assigned Area</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{agentResult.assignedArea}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Today's Dispatch</span>
                            <span className="font-mono font-bold text-emerald-600">
                              {agentResult.dispatchedForToday ? 'AUTHORIZED ON DUTY' : 'NOT DISPATCHED'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mode 3: Physical Citizen Card NFC Verification */}
                {verifyMode === 'nfc' && (
                  <div className="pt-2">
                    <CitizenCardNfcVerifier
                      locale={locale}
                      showToast={showToast}
                      onBadgeVerified={(badgeId) => {
                        setBadgeQuery(badgeId);
                        const res = TrustVerificationService.verifyTrustBadge(badgeId);
                        setBadgeResult(res);

                        // Save to history
                        const historyItem = {
                          id: badgeId,
                          type: 'badge',
                          title: res.businessName,
                          isValid: res.isValid,
                          timestamp: new Date().toISOString(),
                          details: res
                        };
                        
                        const newHistory = [
                          historyItem,
                          ...recentVerifications.filter(h => h.id !== historyItem.id)
                        ].slice(0, 5);
                        
                        setRecentVerifications(newHistory);
                        localStorage.setItem('trust_check_recent_verifications', JSON.stringify(newHistory));
                      }}
                    />
                  </div>
                )}

                {/* Scan History Section */}
                {recentVerifications.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-400" />
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          {locale === 'bn' ? 'সাম্প্রতিক ভেরিফিকেশন' : 'Recent Scan History'}
                        </h3>
                      </div>
                      <button 
                        onClick={() => {
                          setRecentVerifications([]);
                          localStorage.removeItem('trust_check_recent_verifications');
                        }}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        {locale === 'bn' ? 'মুছে ফেলুন' : 'Clear All'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {recentVerifications.map((item, idx) => (
                        <button
                          key={`${item.id}-${idx}`}
                          onClick={() => {
                            if (item.type === 'badge') {
                              setVerifyMode('badge');
                              setBadgeQuery(item.id);
                              setBadgeResult(item.details);
                            } else {
                              setVerifyMode('agent');
                              setAgentQuery(item.id);
                              setAgentResult(item.details);
                            }
                            triggerHapticFeedback(20);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${
                              item.isValid 
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' 
                                : 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                            }`}>
                              {item.type === 'badge' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {item.title}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono text-slate-400">{item.id}</span>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.isValid ? (
                              <div className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase">
                                Verified
                              </div>
                            ) : (
                              <div className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[9px] font-black uppercase">
                                Invalid
                              </div>
                            )}
                            <ArrowRight className="w-3 h-3 text-slate-300 group-hover:translate-x-1 transition-all" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: MULTI-LAYER SUBSCRIPTION & BILLING SYSTEM */}
          {/* ========================================================================= */}
          {activeTab === 'subscription' && (
            <SubscriptionBillingSystem
              locale={locale}
              showToast={showToast}
            />
          )}

        </div>
      </main>

      {/* WhatsApp Share Card Modal */}
      {showShareModal && currentVerdict && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {currentVerdict.shareCard.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {currentVerdict.shareCard.subtitle}
              </p>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-500 break-all">
                Sig: {currentVerdict.verdictSignature.substring(0, 24)}...
              </div>
            </div>

            <p className="text-xs text-slate-500">
              {locale === 'bn'
                ? 'এই ভেরিফিকেশন কার্ডটি পরিবার ও বন্ধুদের সাথে হোয়াটসঅ্যাপে শেয়ার করতে নিচের বাটনে চাপুন।'
                : 'Share this cryptographic verdict card with friends & family on WhatsApp.'}
            </p>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                {locale === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
              <button
                onClick={() => {
                  setShowShareModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md shadow-emerald-600/20"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Camera QR Code Scanner Overlay */}
      <QrScannerOverlay
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onScanSuccess={handleQrScanSuccess}
        onBatchScanSuccess={handleQrBatchScanSuccess}
        scannerTarget={qrScannerTarget}
        locale={locale}
        title={
          qrScannerTarget === 'badge'
            ? (locale === 'bn' ? 'ট্রাস্ট ব্যাজ কিউআর স্ক্যান' : 'Scan Trust Badge QR')
            : qrScannerTarget === 'agent'
            ? (locale === 'bn' ? 'ফিল্ড এজেন্ট কিউআর স্ক্যান' : 'Scan Field Agent Badge QR')
            : qrScannerTarget === 'evidence'
            ? (locale === 'bn' ? '📷 এভিডেন্স ভল্ট স্ক্যানার (মাল্টি-স্ক্যান)' : '📷 Evidence Vault QR Scanner (Multi-Scan)')
            : (locale === 'bn' ? 'পেমেন্ট ও ট্রাস্ট কিউআর স্ক্যান' : 'Scan Payment or Trust QR Code')
        }
        subtitle={
          qrScannerTarget === 'evidence'
            ? (locale === 'bn'
                ? 'একাধিক প্রমাণের কিউআর কোড স্ক্যান করে ভল্টে এনক্রিপ্ট করুন। "Add Another" দিয়ে একাধিক স্ক্যান করুন।'
                : 'Scan multiple evidence document QR codes sequentially into the Evidence Vault. Use "Add Another" to continue scanning.')
            : (locale === 'bn'
                ? 'ক্যামেরা ফ্রেমের মাঝে কিউআর কোডটি ধরুন। স্বয়ংক্রিয়ভাবে স্ক্যান করে ফলাফল যাচাই করা হবে।'
                : 'Align the QR code within the viewfinder for real-time camera recognition and instant verification.')
        }
      />

      {/* 60-Second Report Social Share & Deep Link Modal */}
      {showReportShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-left"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {locale === 'bn' ? '📢 স্ক্যাম অ্যালার্ট সামাজিক শেয়ার' : '📢 Share Scam Alert & Warn Citizens'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {locale === 'bn' ? 'ডিপ লিঙ্ক ও স্যোশাল ইমেজ কার্ড দিয়ে সচেতনতা বৃদ্ধি করুন' : 'Generate deep link and social card snapshot for community protection'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportShareModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* PREDEFINED SOCIAL MEDIA TEMPLATES SELECTOR */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {locale === 'bn' ? 'স্যোশাল মিডিয়া টেমপ্লেট বেছে নিন:' : 'Select Social Media Card Template:'}
                </label>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                  {locale === 'bn' ? '৪টি প্রি-ডিফাইন্ড থিম' : '4 Predefined Themes'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'SCAM_ALERT', labelBn: '🚨 স্ক্যাম অ্যালার্ট', labelEn: '🚨 Scam Alert', theme: 'rose' },
                  { id: 'VERIFIED_FRAUD', labelBn: '🛡️ প্রমাণিত মামলা', labelEn: '🛡️ Verified Fraud', theme: 'purple' },
                  { id: 'URGENT_BEWARE', labelBn: '⚡ নাগরিক সাবধান', labelEn: '⚡ Citizen Beware', theme: 'amber' },
                  { id: 'REGULATORY_NOTICE', labelBn: '⚖️ অফিশিয়াল নোটিশ', labelEn: '⚖️ Regulatory Notice', theme: 'emerald' },
                ].map((tpl) => {
                  const isActive = socialTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSocialTemplate(tpl.id as any)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center text-center ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/40 scale-[1.02]'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{locale === 'bn' ? tpl.labelBn : tpl.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VISUAL SHAREABLE SOCIAL IMAGE CARD SNAPSHOT */}
            {(() => {
              const currentTpl = {
                SCAM_ALERT: {
                  bgGradient: 'from-slate-950 via-rose-950 to-indigo-950 border-rose-500/50',
                  badgeTextEn: 'OFFICIAL SCAM WARNING',
                  badgeTextBn: 'অফিসিয়াল স্ক্যাম সতর্কবার্তা',
                  badgeBg: 'bg-rose-600',
                  targetColor: 'text-rose-400',
                  accentHex: '#e11d48',
                  titlePost: '🚨 WARNING: SCAM ALERT 🚨',
                },
                VERIFIED_FRAUD: {
                  bgGradient: 'from-slate-950 via-purple-950 to-slate-900 border-purple-500/50',
                  badgeTextEn: 'VERIFIED FRAUD CASE',
                  badgeTextBn: 'প্রমাণিত জালিয়াতি মামলা',
                  badgeBg: 'bg-purple-600',
                  targetColor: 'text-purple-300',
                  accentHex: '#9333ea',
                  titlePost: '🛡️ VERIFIED FRAUD CASE CONFIRMED 🛡️',
                },
                URGENT_BEWARE: {
                  bgGradient: 'from-slate-950 via-amber-950 to-orange-950 border-amber-500/50',
                  badgeTextEn: 'URGENT CITIZEN BEWARE',
                  badgeTextBn: 'জরুরি নাগরিক সাবধানতা',
                  badgeBg: 'bg-amber-600',
                  targetColor: 'text-amber-400',
                  accentHex: '#d97706',
                  titlePost: '⚡ URGENT CITIZEN BEWARE ⚡',
                },
                REGULATORY_NOTICE: {
                  bgGradient: 'from-slate-950 via-emerald-950 to-slate-950 border-emerald-500/50',
                  badgeTextEn: 'Telecom Regulatory Authority / BFIU REGULATORY NOTICE',
                  badgeTextBn: 'বিটিআরসি / বিএফআইইউ নিয়ন্ত্রক নোটিশ',
                  badgeBg: 'bg-emerald-600',
                  targetColor: 'text-emerald-400',
                  accentHex: '#059669',
                  titlePost: '⚖️ Telecom Regulatory Authority/BFIU REGULATORY NOTICE ⚖️',
                },
              }[socialTemplate];

              return (
                <div
                  id="report-social-card"
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${currentTpl.bgGradient} text-white p-5 border shadow-2xl space-y-4 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-lg ${currentTpl.badgeBg} text-white flex items-center justify-center shadow-md`}>
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-200 block">
                          {currentTpl.badgeTextEn}
                        </span>
                        <span className="text-xs font-black text-white">TrustCheck Network</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          const tplTitle = {
                            SCAM_ALERT: '🚨 WARNING: SCAM ALERT 🚨',
                            VERIFIED_FRAUD: '🛡️ VERIFIED FRAUD CASE CONFIRMED 🛡️',
                            URGENT_BEWARE: '⚡ URGENT CITIZEN BEWARE ⚡',
                            REGULATORY_NOTICE: '⚖️ Telecom Regulatory Authority / BFIU REGULATORY NOTICE ⚖️',
                          }[socialTemplate];
                          const fullPostText = `${tplTitle}\n\nSuspect Target: ${reportTarget || '017XX-XXXXXX'}\nCategory: ${reportCategory}\nTracking Ref: ${submittedReportRef}\nLocation: ${reportLocation?.district || 'BD National Cluster'}\nSummary: ${reportDescription || 'Incident report logged'}\n\nThis incident has been logged into the TrustCheck regulatory grievance database. Verify details:\nhttps://trustcheck.bd/report/${submittedReportRef}`;
                          navigator.clipboard.writeText(fullPostText);
                          setIsCopiedSharePost(true);
                          showToast('📋 Social text copied to clipboard!', 'success');
                          setTimeout(() => setIsCopiedSharePost(false), 2500);
                        }}
                        title="Copy Social Text"
                        className="print-hide px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center space-x-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                      >
                        {isCopiedSharePost ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-200" />}
                        <span>{isCopiedSharePost ? 'COPIED TEXT' : 'COPY TEXT'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintCard}
                        disabled={isPrintingCard}
                        title="Print Card"
                        className="print-hide px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center space-x-1 transition-all active:scale-95 cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {isPrintingCard ? (
                          <RefreshCw className="w-3 h-3 text-amber-300 animate-spin" />
                        ) : (
                          <Printer className="w-3 h-3 text-slate-200" />
                        )}
                        <span>
                          {isPrintingCard ? 'Preparing to print...' : 'PRINT'}
                        </span>
                      </button>
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>REGULATORY LOGGED</span>
                      </span>
                    </div>
                  </div>

                  {/* Reported Target Highlight */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
                      Reported Suspect Identifier
                    </span>
                    <p className={`text-lg font-mono font-black ${currentTpl.targetColor} tracking-wide break-all`}>
                      {reportTarget || '017XX-XXXXXX'}
                    </p>
                    <div className="flex items-center space-x-2 pt-1 text-[10px] font-bold text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/20">
                        {reportCategory}
                      </span>
                      {reportLocation && (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{reportLocation.district} District</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ref Code & Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-slate-400 block">Tracking Ref:</span>
                      <span className="font-mono font-black text-indigo-300 text-xs">{submittedReportRef}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-slate-400 block">Logged Timestamp:</span>
                      <span className="font-mono font-bold text-slate-200">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Deep Link Footer Banner with Embedded Dynamic QR Code */}
                  <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-between text-[10px]">
                    <div className="space-y-1">
                      <span className="text-slate-300 font-bold block flex items-center gap-1">
                        <QrCode className="w-3 h-3 text-indigo-400" />
                        <span>Hold Up Phone to Scan or Visit:</span>
                      </span>
                      <span className="font-mono text-indigo-300 font-bold underline block truncate max-w-[180px] sm:max-w-[220px]">
                        {`https://trustcheck.bd/report/${submittedReportRef}`}
                      </span>
                    </div>
                    <DynamicQRCode
                      value={`https://trustcheck.bd/report/${submittedReportRef}`}
                      size={62}
                      className="bg-white border-indigo-400/50 shadow-md"
                    />
                  </div>
                </div>
              );
            })()}

            {/* ACTION BUTTONS GRID */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                {/* Copy Deep Link */}
                <button
                  type="button"
                  onClick={() => {
                    const deepLink = `https://trustcheck.bd/report/${submittedReportRef}`;
                    navigator.clipboard.writeText(deepLink);
                    setIsCopiedDeepLink(true);
                    showToast('🔗 Deep link copied to clipboard!', 'success');
                    setTimeout(() => setIsCopiedDeepLink(false), 2500);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  {isCopiedDeepLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedDeepLink ? 'Copied Link!' : 'Copy Deep Link'}</span>
                </button>

                {/* Share to WhatsApp */}
                <button
                  type="button"
                  onClick={() => {
                    const tplTitle = {
                      SCAM_ALERT: '🚨 WARNING: SCAM ALERT',
                      VERIFIED_FRAUD: '🛡️ VERIFIED FRAUD CASE CONFIRMED',
                      URGENT_BEWARE: '⚡ URGENT CITIZEN BEWARE',
                      REGULATORY_NOTICE: '⚖️ Telecom Regulatory Authority/BFIU REGULATORY NOTICE',
                    }[socialTemplate];
                    const shareMsg = `${tplTitle}\nSuspect Target: ${reportTarget}\nCategory: ${reportCategory}\nTracking Ref: ${submittedReportRef}\nCheck verification details: https://trustcheck.bd/report/${submittedReportRef}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg)}`, '_blank');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Share</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Copy Formatted Social Post */}
                <button
                  type="button"
                  onClick={() => {
                    const tplTitle = {
                      SCAM_ALERT: '🚨 WARNING: SCAM ALERT 🚨',
                      VERIFIED_FRAUD: '🛡️ VERIFIED FRAUD CASE CONFIRMED 🛡️',
                      URGENT_BEWARE: '⚡ URGENT CITIZEN BEWARE ⚡',
                      REGULATORY_NOTICE: '⚖️ Telecom Regulatory Authority / BFIU REGULATORY NOTICE ⚖️',
                    }[socialTemplate];
                    const fullPostText = `${tplTitle}\n\nSuspect Target: ${reportTarget}\nCategory: ${reportCategory}\nTracking Ref: ${submittedReportRef}\nLocation: ${reportLocation?.district || 'BD National Cluster'}\n\nThis incident has been logged into the TrustCheck BD & Telecom Regulatory Authority regulatory grievance database. Verify suspicious numbers before sending money:\nhttps://trustcheck.bd/report/${submittedReportRef}`;
                    navigator.clipboard.writeText(fullPostText);
                    setIsCopiedSharePost(true);
                    showToast('📋 Formatted social template post copied to clipboard!', 'success');
                    setTimeout(() => setIsCopiedSharePost(false), 2500);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  {isCopiedSharePost ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5" />}
                  <span>{isCopiedSharePost ? 'Post Copied!' : 'Copy Social Post'}</span>
                </button>

                {/* Download Graphic Card Image */}
                <button
                  type="button"
                  onClick={() => {
                    const tplConfig = {
                      SCAM_ALERT: { title: '🚨 OFFICIAL SCAM WARNING', color: '#e11d48', bg: '#0f172a' },
                      VERIFIED_FRAUD: { title: '🛡️ VERIFIED FRAUD CASE', color: '#9333ea', bg: '#090d16' },
                      URGENT_BEWARE: { title: '⚡ URGENT CITIZEN BEWARE', color: '#d97706', bg: '#170c02' },
                      REGULATORY_NOTICE: { title: '⚖️ Telecom Regulatory Authority/BFIU REGULATORY NOTICE', color: '#059669', bg: '#021811' },
                    }[socialTemplate];

                    const canvas = document.createElement('canvas');
                    canvas.width = 1200;
                    canvas.height = 630;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.fillStyle = tplConfig.bg;
                      ctx.fillRect(0, 0, 1200, 630);
                      ctx.fillStyle = tplConfig.color;
                      ctx.font = 'bold 36px sans-serif';
                      ctx.fillText(`${tplConfig.title} | TrustCheck Network`, 60, 90);
                      ctx.fillStyle = '#ffffff';
                      ctx.font = 'bold 28px sans-serif';
                      ctx.fillText(`Target: ${reportTarget || '017XXXXXXXX'}`, 60, 180);
                      ctx.fillText(`Category: ${reportCategory}`, 60, 240);
                      ctx.fillText(`Tracking Ref: ${submittedReportRef}`, 60, 300);
                      ctx.fillStyle = '#10b981';
                      ctx.fillText(`Status: VERIFIED & LOGGED IN REGULATORY DATABASE`, 60, 380);
                      ctx.fillStyle = '#94a3b8';
                      ctx.font = '22px monospace';
                      ctx.fillText(`https://trustcheck.bd/report/${submittedReportRef}`, 60, 480);

                      const dataUrl = canvas.toDataURL('image/png');
                      const link = document.createElement('a');
                      link.download = `Scam_Alert_${socialTemplate}_${submittedReportRef}.png`;
                      link.href = dataUrl;
                      link.click();
                      showToast(`🖼️ '${tplConfig.title}' graphic downloaded!`, 'success');
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Graphic</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowReportShareModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer mt-2"
            >
              Close Window
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
};
