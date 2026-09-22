import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Flashlight, 
  FlashlightOff, 
  Upload, 
  QrCode, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  Globe, 
  Info,
  SwitchCamera,
  Trash2,
  Check,
  Plus,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsQR from 'jsqr';

export interface QrScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedData: string, detectedType?: 'wallet' | 'phone' | 'website' | 'qr' | 'name') => void;
  onBatchScanSuccess?: (items: Array<{ data: string; type: 'wallet' | 'phone' | 'website' | 'qr' | 'name' }>) => void;
  title?: string;
  subtitle?: string;
  autoCloseOnScan?: boolean;
  scannerTarget?: 'check' | 'badge' | 'agent' | 'evidence';
  locale?: 'bn' | 'en';
}

export const QrScannerOverlay: React.FC<QrScannerOverlayProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  onBatchScanSuccess,
  title = 'Scan Payment or Trust QR Code',
  subtitle = 'Position the QR code within the frame for instant camera recognition and trust verification',
  autoCloseOnScan = true,
  scannerTarget = 'check',
  locale = 'en',
}) => {
  const { showToast } = useNotification();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);
  const [isProcessingFrame, setIsProcessingFrame] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [scannedBatch, setScannedBatch] = useState<Array<{ raw: string; cleanText: string; inferredType: 'wallet' | 'phone' | 'website' | 'qr' | 'name' }>>([]);
  const [qrBoundingBox, setQrBoundingBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [detectedTypeLabel, setDetectedTypeLabel] = useState<string | null>(null);

  // Touch and zoom gesture optimizations
  const [zoom, setZoom] = useState<number>(1.0);
  const initialTouchDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1.0);

  // Visual tap-to-focus ring
  const [focusRing, setFocusRing] = useState<{ x: number; y: number } | null>(null);

  // Toggle state to enable or disable device haptics/vibrations
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);

  // Sound chime synthesizer for pleasant instant recognition feedback
  const triggerSuccessFeedback = useCallback(() => {
    // 1. Audio tone generation
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      }
    } catch {
      // Audio context might be restricted before interaction
    }

    // 2. High-fidelity Dual-Pulse success haptic feedback (Haptic API)
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        // Double pulse pattern: 100ms vibration, 40ms silence, 100ms vibration to feel extremely premium
        navigator.vibrate([100, 40, 100]);
      } catch (err) {
        console.warn('Vibration feedback not allowed or unsupported by user agent', err);
      }
    }
  }, [hapticsEnabled]);

  // Intelligent parser for QR data
  const parseQrPayload = useCallback((raw: string): { cleanText: string; inferredType: 'wallet' | 'phone' | 'website' | 'qr' | 'name' } => {
    const text = raw.trim();

    // Case 1: Check for bKash / Nagad / Rocket / Upay merchant or personal format
    // e.g., bkash://qr?number=01711002233 or EMVCo string containing phone or 01XXXXXXXXX
    const phoneMatch = text.match(/(?:(?:\+|00)?88)?(01[3-9]\d{8})/);
    if (phoneMatch && phoneMatch[1]) {
      return { cleanText: phoneMatch[1], inferredType: 'wallet' };
    }

    // Case 2: Trust badge / agent ID code
    // e.g. TB-BD-2026-98101 or AGT-BKASH-8819
    if (text.startsWith('TB-') || text.startsWith('AGT-') || text.includes('/verify/')) {
      const badgeMatch = text.match(/(TB-[A-Z0-9-]+|AGT-[A-Z0-9-]+)/);
      if (badgeMatch) {
        return { cleanText: badgeMatch[1], inferredType: 'qr' };
      }
    }

    // Case 3: URL / Web Address
    if (text.startsWith('http://') || text.startsWith('https://') || text.includes('.com') || text.includes('.xyz') || text.includes('.gov.bd') || text.includes('.org')) {
      // Try to extract domain or full clean URL
      try {
        const urlObj = new URL(text.startsWith('http') ? text : `https://${text}`);
        return { cleanText: urlObj.hostname.replace(/^www\./, '') + (urlObj.pathname.length > 1 ? urlObj.pathname : ''), inferredType: 'website' };
      } catch {
        return { cleanText: text, inferredType: 'website' };
      }
    }

    // Default
    return { cleanText: text, inferredType: 'qr' };
  }, []);

  // Re-arm camera scanning for 'Add Another' evidence QR
  const handleAddAnother = useCallback(() => {
    setScannedResult(null);
    setQrBoundingBox(null);
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(60); } catch {}
    }
  }, [hapticsEnabled]);

  // Handle successful detection
  const handleRecognizedQr = useCallback((qrData: string) => {
    // Avoid re-scanning same data in quick succession
    if (scannedResult === qrData) return;
    
    // Check if already in batch to prevent duplicates
    if (scannedBatch.some(item => item.raw === qrData)) return;

    setScannedResult(qrData);
    triggerSuccessFeedback();

    const { cleanText, inferredType } = parseQrPayload(qrData);
    setDetectedTypeLabel(inferredType.toUpperCase());

    // Add to batch
    setScannedBatch(prev => [...prev, { raw: qrData, cleanText, inferredType }]);

    // If target is evidence vault, seal directly into form evidence state immediately
    if (scannerTarget === 'evidence') {
      onScanSuccess(cleanText, inferredType);
    }
  }, [scannedResult, scannedBatch, triggerSuccessFeedback, parseQrPayload, scannerTarget, onScanSuccess]);

  const handleDone = useCallback(() => {
    if (scannedBatch.length > 0 && scannerTarget !== 'evidence') {
      if (onBatchScanSuccess) {
        onBatchScanSuccess(scannedBatch.map(item => ({ data: item.cleanText, type: item.inferredType })));
      } else {
        // Fallback: call onScanSuccess for each if no batch callback provided
        scannedBatch.forEach(item => {
          onScanSuccess(item.cleanText, item.inferredType);
        });
      }
    }
    setScannedBatch([]);
    setScannedResult(null);
    onClose();
  }, [scannedBatch, scannerTarget, onBatchScanSuccess, onScanSuccess, onClose]);

  // Frame processing loop with jsQR & Native BarcodeDetector fallback
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isOpen) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        // Calculate bounding box on video coordinate space
        const minX = Math.min(code.location.topLeftCorner.x, code.location.bottomLeftCorner.x);
        const minY = Math.min(code.location.topLeftCorner.y, code.location.topRightCorner.y);
        const maxX = Math.max(code.location.topRightCorner.x, code.location.bottomRightCorner.x);
        const maxY = Math.max(code.location.bottomLeftCorner.y, code.location.bottomRightCorner.y);

        setQrBoundingBox({
          x: (minX / canvas.width) * 100,
          y: (minY / canvas.height) * 100,
          width: ((maxX - minX) / canvas.width) * 100,
          height: ((maxY - minY) / canvas.height) * 100,
        });

        handleRecognizedQr(code.data);
        return;
      }
    }

    if (isOpen && !scannedResult) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
    }
  }, [isOpen, scannedResult, handleRecognizedQr]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      setScannedResult(null);
      setQrBoundingBox(null);
      setZoom(1.0); // Reset digital zoom state
      setFocusRing(null); // Clear manual focus indicators

      // Stop any existing tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not available on this browser or platform');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Check for torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = (track as any)?.getCapabilities?.() || {};
      setHasTorchSupport(Boolean(capabilities.torch));

      setHasCameraPermission(true);
      animationFrameId.current = requestAnimationFrame(scanFrame);
    } catch (err: any) {
      console.warn('Camera stream initialization notice:', err);
      setHasCameraPermission(false);
      
      let friendlyMessage = 'Camera permission denied or camera hardware busy.';
      const errName = err.name || '';
      const isPermissionBlocked = errName === 'NotAllowedError' || errName === 'PermissionDeniedError';
      
      if (isPermissionBlocked) {
        friendlyMessage = locale === 'bn' 
          ? 'ক্যামেরা ব্যবহারের অনুমতি বাতিল করা হয়েছে। ব্রাউজারের অ্যাড্রেস বার থেকে লক/সেটিংস আইকনে ক্লিক করে ক্যামেরার পারমিশন চালু করুন এবং আবার চেষ্টা করুন।'
          : 'Camera access was blocked. Please tap the lock/settings icon in your browser address bar to enable camera permissions for this site, then tap Retry.';
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        friendlyMessage = locale === 'bn'
          ? 'আপনার সিস্টেমে কোনো ক্যামেরা সনাক্ত করা যায়নি। বিকল্প হিসেবে কিউআর কোড ধারণকারী ছবি আপলোড করতে পারেন।'
          : 'No camera device was detected on your system. You can upload an image file containing a QR code instead.';
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        friendlyMessage = locale === 'bn'
          ? 'আপনার ক্যামেরা অন্য কোনো অ্যাপ্লিকেশন বা ব্রাউজার ট্যাবে সচল আছে। অনুগ্রহ করে সেটি বন্ধ করে পুনরায় চেষ্টা করুন।'
          : 'Your camera hardware is currently locked or in use by another application or browser tab.';
      } else if (errName === 'OverconstrainedError') {
        friendlyMessage = locale === 'bn'
          ? 'অনুরোধকৃত ক্যামেরা রেজোলিউশন আপনার ডিভাইসে সমর্থিত নয়।'
          : 'Requested camera resolution constraints are unsupported by your device.';
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      
      setCameraError(friendlyMessage);
      
      // Trigger user-friendly toast feedback
      showToast(
        friendlyMessage,
        isPermissionBlocked ? 'error' : 'warning'
      );
    }
  }, [facingMode, scanFrame]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setTorchOn(false);
  }, []);

  // Gesture Event Handlers for responsive touch experiences
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // Initialize Pinch-to-Zoom
      const dist = Math.sqrt(
        Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
        Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
      );
      initialTouchDistanceRef.current = dist;
      initialZoomRef.current = zoom;
    }
  };

  const handleTouchMove = async (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && initialTouchDistanceRef.current !== null) {
      // Multi-touch scale math for pinch-to-zoom
      const dist = Math.sqrt(
        Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
        Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
      );
      const ratio = dist / initialTouchDistanceRef.current;
      const nextZoom = Math.min(4.0, Math.max(1.0, initialZoomRef.current * ratio));
      setZoom(nextZoom);

      // Apply hardware video track zoom constraints if supported by the browser
      if (streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        try {
          const capabilities = (track as any)?.getCapabilities?.() || {};
          if (capabilities.zoom) {
            const minZ = capabilities.zoom.min || 1;
            const maxZ = capabilities.zoom.max || 4;
            const targetZ = minZ + (nextZoom - 1) * (maxZ - minZ) / 3;
            await (track as any).applyConstraints({
              advanced: [{ zoom: targetZ }]
            });
          }
        } catch {
          // Hardware constraint fallback
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    initialTouchDistanceRef.current = null;
  };

  const handleViewportTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFocusRing({ x, y });

    // Focus constraints if available on advanced browser APIs
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      try {
        const capabilities = (track as any)?.getCapabilities?.() || {};
        if (capabilities.focusMode && capabilities.focusMode.includes('manual')) {
          (track as any).applyConstraints({
            advanced: [{ focusMode: 'manual', pointsOfInterest: [{ x, y }] }]
          });
        }
      } catch {
        // Safe silent focus fallback
      }
    }

    // Auto-dim the glowing focus ring
    const timer = setTimeout(() => {
      setFocusRing(null);
    }, 1200);
    return () => clearTimeout(timer);
  };

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current || !hasTorchSupport) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      const nextTorch = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.error('Torch error:', e);
    }
  };

  // Toggle Front/Back camera
  const toggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Process File Upload (e.g., photo containing QR)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleRecognizedQr(code.data);
          } else {
            setCameraError('No clear QR code pattern detected in the uploaded image. Please try another image or point the live camera.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Manage mount & visibility lifecycle
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  // Preset demo QR fast-triggers for instant testing & sandboxed reviews
  const demoQrs = [
    { label: '🔴 Scammer bKash QR', data: '01711002233', type: 'wallet' as const, hint: 'Flagged MFS Number' },
    { label: '🟢 Trust Badge QR', data: 'TB-BD-2026-98101', type: 'qr' as const, hint: 'Verified Trust Seal' },
    { label: '🔴 Phishing URL QR', data: 'https://daraz-deals-free.xyz', type: 'website' as const, hint: 'Malicious Clone' },
    { label: '🟢 Chaldal Merchant QR', data: 'https://chaldal.com', type: 'website' as const, hint: 'Authorized Merchant' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
        
        {/* Hidden Canvas for Decoding */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Container with Dynamic Viewport Adjustments */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0.05, bottom: 0.75 }}
          onDragEnd={(event, info) => {
            if (info.offset.y > 120 || info.velocity.y > 450) {
              onClose();
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full max-w-md sm:max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh] sm:h-auto max-h-[96vh] sm:max-h-[90vh] select-none pb-[env(safe-area-inset-bottom)]"
        >
          {/* Touch Drag handle for swipe-to-dismiss gesture on mobile devices */}
          <div className="flex flex-col items-center pt-2.5 pb-1.5 bg-slate-900 shrink-0 cursor-row-resize touch-none">
            <div className="w-12 h-1.5 rounded-full bg-slate-700 hover:bg-slate-500 transition-colors" />
            <span className="text-[10px] font-medium text-slate-400 mt-1 pointer-events-none select-none tracking-wide uppercase">
              Swipe down to dismiss
            </span>
          </div>

          {/* Header Bar with Touch-Friendly Padding */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/95 backdrop-blur shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-xs shrink-0 ${
                scannerTarget === 'evidence'
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}>
                <QrCode className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 truncate">
                  <span className="truncate">{title}</span>
                  {scannedBatch.length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-700 shrink-0 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{scannedBatch.length} Queued</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                      LIVE
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                  {subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
              title="Close Scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Camera Viewport Area with Aspect-Ratio Adaptability */}
          <div 
            onClick={handleViewportTap}
            className="relative bg-black flex-1 min-h-[220px] sm:min-h-[320px] flex items-center justify-center overflow-hidden cursor-crosshair"
          >
            {/* Live Video Feed with Responsive Scale zoom */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover transition-transform duration-75 origin-center"
              style={{ transform: `scale(${zoom})` }}
              muted
              playsInline
            />

            {/* Tap-to-Focus Ring Indicator */}
            {focusRing && (
              <div 
                className="absolute rounded-full border border-emerald-400/80 pointer-events-none animate-ping z-20"
                style={{
                  left: focusRing.x,
                  top: focusRing.y,
                  width: '56px',
                  height: '56px',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )}
            {focusRing && (
              <div 
                className="absolute rounded-full border-2 border-emerald-400 pointer-events-none z-20"
                style={{
                  left: focusRing.x,
                  top: focusRing.y,
                  width: '28px',
                  height: '28px',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )}

            {/* Floating Zoom and Focus Instruction Badge */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
              <div className="bg-slate-950/80 backdrop-blur border border-slate-800/80 text-[10px] font-mono font-bold text-slate-200 px-2.5 py-1 rounded-lg shadow-sm">
                Pinch / Zoom ({zoom.toFixed(1)}x)
              </div>
              <div className="bg-slate-950/80 backdrop-blur border border-slate-800/80 text-[10px] font-mono font-bold text-slate-200 px-2.5 py-1 rounded-lg shadow-sm">
                Tap to Focus
              </div>
            </div>

            {/* Darkened Viewfinder Framing Mask with Central Responsive Transparent Reticle */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
              
              {/* Target Bounding Frame - aspect ratio and viewport responsive to stay perfectly square on mobile layout */}
              <div className="relative w-[65vw] sm:w-[50vw] max-w-[240px] max-h-[35vh] aspect-square min-w-[180px] min-h-[180px] rounded-3xl border-2 border-dashed border-emerald-400/40 flex items-center justify-center shadow-[0_0_0_9999px_rgba(15,23,42,0.7)]">
                
                {/* 4 Neon Reticle Corner Brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl"></div>

                {/* Animated Horizontal Laser Scan Line */}
                <motion.div
                  animate={{
                    top: ['8%', '90%', '8%'],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]"
                />

                {/* Central Subtext / Crosshair */}
                <div className="text-center p-3">
                  <div className="w-9 h-9 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-1.5 shadow-inner">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-200 drop-shadow">
                    {scannedResult ? 'Recognizing...' : 'Align QR inside frame'}
                  </span>
                </div>
              </div>

              {/* Dynamic QR Detected Highlight Box */}
              {qrBoundingBox && (
                <div
                  className="absolute border-2 border-emerald-400 bg-emerald-400/20 rounded-xl transition-all duration-150 animate-pulse pointer-events-none"
                  style={{
                    left: `${qrBoundingBox.x}%`,
                    top: `${qrBoundingBox.y}%`,
                    width: `${qrBoundingBox.width}%`,
                    height: `${qrBoundingBox.height}%`,
                  }}
                />
              )}
            </div>

            {/* In-Viewport Recognition Toast (Success State) */}
            {scannedResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-x-3 bottom-3 z-20 p-3 sm:p-3.5 rounded-2xl bg-emerald-950/95 border border-emerald-500 text-white backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5"
              >
                <div className="flex items-center space-x-3 min-w-0 w-full sm:w-auto">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 block font-bold">
                      {scannerTarget === 'evidence'
                        ? '🔒 Sealed into Evidence Vault'
                        : `QR Identified (${detectedTypeLabel || 'VERIFIED'})`}
                    </span>
                    <p className="text-xs font-mono font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                      {scannedResult}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-1 sm:pt-0">
                  <button
                    type="button"
                    onClick={handleAddAnother}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer transition-all active:scale-95"
                    title="Scan another evidence QR code in this session"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>➕ Add Another</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDone}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Error or Permission Denied Overlay */}
            {hasCameraPermission === false && (
              <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center space-y-3.5 z-30">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white">Camera Access Notice</h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  {cameraError || 'Please allow camera permissions in your browser or select an image file containing a QR code.'}
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[44px] cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[44px] cursor-pointer shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload QR Image</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Batch Scanned Items List */}
          {scannedBatch.length > 0 && (
            <div className="px-4 py-3 bg-slate-950/50 border-t border-slate-800 max-h-40 overflow-y-auto custom-scrollbar shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-purple-400" />
                  <span>
                    {scannerTarget === 'evidence'
                      ? `Evidence Vault Queue (${scannedBatch.length})`
                      : `Batch Queue (${scannedBatch.length})`}
                  </span>
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAddAnother}
                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800/60"
                  >
                    <Plus className="w-3 h-3" />
                    <span>➕ Add Another</span>
                  </button>

                  <button 
                    onClick={() => setScannedBatch([])}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {scannedBatch.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] font-mono text-purple-400 uppercase font-bold">
                          {scannerTarget === 'evidence' ? `Vault Doc #${idx + 1}` : item.inferredType}
                        </span>
                        <p className="text-[10px] font-mono font-bold text-slate-300 truncate">{item.cleanText}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setScannedBatch(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Touch-Optimized Floating Controls Container */}
          <div className="px-4 sm:px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-2 w-full justify-between sm:justify-start">
              {/* Torch Toggle */}
              {hasTorchSupport && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px] flex-1 sm:flex-initial ${
                    torchOn
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Toggle Flashlight"
                >
                  {torchOn ? <Flashlight className="w-4 h-4 shrink-0" /> : <FlashlightOff className="w-4 h-4 shrink-0" />}
                  <span className="text-[11px]">{torchOn ? 'Torch On' : 'Torch'}</span>
                </button>
              )}

              {/* Camera Switch */}
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px] flex-1 sm:flex-initial"
                title="Switch Camera (Front/Back)"
              >
                <SwitchCamera className="w-4 h-4 shrink-0" />
                <span className="text-[11px]">Flip</span>
              </button>

              {/* Vibration Haptic Toggle */}
              <button
                type="button"
                onClick={() => {
                  setHapticsEnabled(prev => !prev);
                  if (!hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
                    try { navigator.vibrate(40); } catch {}
                  }
                }}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px] flex-1 sm:flex-initial ${
                  hapticsEnabled 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
                title={hapticsEnabled ? "Disable Haptics" : "Enable Haptics"}
              >
                <Smartphone className={`w-4 h-4 shrink-0 ${hapticsEnabled ? 'animate-bounce' : ''}`} />
                <span className="text-[11px]">{hapticsEnabled ? 'Haptics' : 'Muted'}</span>
              </button>

              {/* Upload QR Image File */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px] flex-1 sm:flex-initial"
                title="Select image from files"
              >
                <Upload className="w-4 h-4 shrink-0" />
                <span className="text-[11px]">Upload</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              
              {/* Batch Done Button */}
              {scannedBatch.length > 0 && (
                <button
                  type="button"
                  onClick={handleDone}
                  className="w-full mt-3 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all"
                >
                  <Check className="w-5 h-5" />
                  <span>Done: Process {scannedBatch.length} Items</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Simulation / Demo Bar (Enables effortless 1-tap testing in dev & headless previews) */}
          <div className="p-3.5 bg-slate-950 border-t border-slate-800 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Simulate Scan Sample (1-Tap Test):</span>
              </span>
              <span className="text-[10px] text-slate-500">Touch Target Optimized</span>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              {demoQrs.map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleRecognizedQr(demo.data)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group min-h-[44px] flex flex-col justify-center"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 group-hover:text-emerald-400 truncate">
                      {demo.label}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 block truncate">
                    {demo.data}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QrScannerOverlay;
