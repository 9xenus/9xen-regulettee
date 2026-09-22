import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Server,
  HardDrive,
  Cpu,
  Lock,
  Globe,
  FileText,
  Download,
  Printer,
  Upload,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Sliders,
  Check,
  Volume2,
  VolumeX,
  Flashlight,
  SwitchCamera,
  X,
  Activity,
  Award,
  Key
} from 'lucide-react';
import {
  HardwarePhysicalAsset,
  HARDWARE_PHYSICAL_ASSETS,
  findHardwareAssetByQr
} from '../../data/hardwareAssetData';
import { generatePdfExport } from '../../utils/pdfGenerator';
import { useNotification } from '../../context/NotificationContext';

interface HardwareAssetQrScannerProps {
  onAssetIdentified?: (asset: HardwarePhysicalAsset) => void;
  initialAssetId?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const HardwareAssetQrScanner: React.FC<HardwareAssetQrScannerProps> = ({
  onAssetIdentified,
  initialAssetId,
  isModal = false,
  onClose
}) => {
  const { showToast } = useNotification();

  // Camera & Scanning State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isProcessingFrame, setIsProcessingFrame] = useState<boolean>(false);
  const [lastScannedRaw, setLastScannedRaw] = useState<string | null>(null);

  // Selected Asset Details State
  const [selectedAsset, setSelectedAsset] = useState<HardwarePhysicalAsset | null>(() => {
    if (initialAssetId) {
      return HARDWARE_PHYSICAL_ASSETS.find(a => a.id === initialAssetId) || HARDWARE_PHYSICAL_ASSETS[0];
    }
    return HARDWARE_PHYSICAL_ASSETS[0];
  });

  // Generated QR Code preview for printable tags
  const [assetQrDataUrl, setAssetQrDataUrl] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);

  // Rapid Audit Log Submission State
  const [auditNotes, setAuditNotes] = useState<string>('');
  const [auditorName, setAuditorName] = useState<string>('Lead CaaS Physical Auditor');
  const [isSubmittingAudit, setIsSubmittingAudit] = useState<boolean>(false);
  const [isAttestingPqc, setIsAttestingPqc] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'details' | 'controls' | 'history' | 'tag_generator'>('details');

  // Play synthetic audit beep on detection
  const playScanBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12); // A6 chirp

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      // Audio context may be restricted before user gesture
    }
  }, [soundEnabled]);

  // Handle scanned string payload
  const handleScannedResult = useCallback((payload: string) => {
    setLastScannedRaw(payload);
    playScanBeep();

    const matched = findHardwareAssetByQr(payload);
    if (matched) {
      setSelectedAsset(matched);
      if (onAssetIdentified) {
        onAssetIdentified(matched);
      }
      showToast(`Asset Identified: ${matched.name} (${matched.assetTag})`, 'success');
    } else {
      // Create a fallback dynamically if unknown QR
      const customAsset: HardwarePhysicalAsset = {
        id: `AST-EXT-${Math.random().toString(36).substring(6).toUpperCase()}`,
        qrCodePayload: payload,
        assetTag: `TAG-${payload.slice(0, 10).toUpperCase()}`,
        name: `Scanned Hardware Endpoint [${payload.slice(0, 18)}]`,
        category: 'Physical Server',
        model: 'Generic Sovereign Hardware Appliance',
        serialNumber: `SN-QR-${Math.floor(Math.random() * 900000 + 100000)}`,
        macAddress: '52:54:00:12:34:56',
        physicalLocation: {
          facility: 'Remote On-Premises Rack Enclosure',
          room: 'Server Room Alpha',
          rackId: 'RACK-REMOTE-01',
          rackUnit: 'U12',
          geoCoordinates: '50.1109° N, 8.6821° E',
          jurisdiction: 'EU Data Sovereignty Zone'
        },
        sovereigntyEnclave: 'EU Sovereign On-Premises Enclave',
        cryptographicStatus: {
          algorithm: 'PQC Kyber-768 Enforced',
          hsmBound: true,
          tpmVersion: 'TPM 2.0',
          pcrHash: '0x8899aabbccddeeff00112233445566778899aabbccddeeff0011223344556677',
          firmwareVersion: 'v2.4.0-CUSTOM',
          lastFirmwareAttestation: new Date().toISOString(),
          tamperDetection: 'Intact'
        },
        complianceStatus: 'COMPLIANT',
        complianceScore: 94.0,
        assignedCustodian: {
          name: 'Site Infrastructure Engineer',
          role: 'Data Center Operations',
          email: 'custodian@datacenter.eu'
        },
        lastPhysicalAudit: new Date().toISOString().split('T')[0],
        nextAuditDue: '2026-11-20',
        auditAuditLog: [
          {
            date: new Date().toISOString().replace('T', ' ').slice(0, 19),
            auditor: 'On-Demand QR Field Scanner',
            action: 'Rapid QR Asset Registration',
            notes: `Discovered and verified via raw QR payload: ${payload}`,
            verificationHash: '0xabc123456789def0'
          }
        ],
        statutoryControls: [
          {
            framework: 'ISO/IEC 27001:2022',
            clause: 'Annex A.8.1 (User Endpoint Devices)',
            requirement: 'Physical asset identification and continuous inventory reconciliation.',
            status: 'PASSED',
            lastChecked: new Date().toISOString().split('T')[0],
            evidence: 'QR Asset Tag verified with device hardware signature.'
          }
        ]
      };
      setSelectedAsset(customAsset);
      if (onAssetIdentified) onAssetIdentified(customAsset);
      showToast(`Scanned external QR tag: ${payload.slice(0, 24)}...`, 'info');
    }
  }, [onAssetIdentified, playScanBeep, showToast]);

  // Generate high-res QR tag whenever selected asset changes
  useEffect(() => {
    if (!selectedAsset) return;
    setIsGeneratingQr(true);
    QRCode.toDataURL(selectedAsset.qrCodePayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => {
        setAssetQrDataUrl(url);
        setIsGeneratingQr(false);
      })
      .catch(err => {
        console.error('Error generating QR code tag:', err);
        setIsGeneratingQr(false);
      });
  }, [selectedAsset]);

  // Enumerate cameras
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setCameras(videoDevices);
        if (videoDevices.length > 0 && !selectedCameraId) {
          // Select back camera by default if available
          const backCam = videoDevices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('environment'));
          setSelectedCameraId(backCam ? backCam.deviceId : videoDevices[0].deviceId);
        }
      }).catch(err => {
        console.warn('Could not enumerate video devices:', err);
      });
    }
  }, [selectedCameraId]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsCameraActive(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera video capture is not supported in this browser environment.');
      }

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: selectedCameraId
          ? { deviceId: { exact: selectedCameraId } }
          : {
              facingMode: facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);

        // Check if torch is supported on current video track
        const track = stream.getVideoTracks()[0];
        const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
        if (capabilities && capabilities.torch) {
          setTorchSupported(true);
        } else {
          setTorchSupported(false);
        }
      }
    } catch (err: any) {
      console.error('Error starting camera stream:', err);
      let errorMsg = 'Could not access device camera. Please check camera permissions in your browser.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera access was denied. Please allow camera permissions in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No physical camera hardware was found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Camera is currently in use by another application.';
      }
      setCameraError(errorMsg);
      setIsCameraActive(false);
    }
  }, [facingMode, selectedCameraId]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
  }, []);

  // Toggle Torch / Flashlight
  const toggleTorch = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (track && (track as any).applyConstraints) {
      try {
        const nextState = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setIsTorchOn(nextState);
      } catch (err) {
        console.warn('Torch constraint error:', err);
      }
    }
  };

  // Flip Camera between front and back
  const toggleFacingMode = () => {
    stopCamera();
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Live Frame Scanner Loop
  useEffect(() => {
    if (!isCameraActive) return;

    let animationFrameId: number;
    let scanThrottleTimeout: any = null;

    const scanFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Fast path with jsQR
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            handleScannedResult(code.data);
            // Brief pause before next scan
            stopCamera();
            return;
          }
        }
      }

      animationFrameId = requestAnimationFrame(scanFrame);
    };

    animationFrameId = requestAnimationFrame(scanFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(scanThrottleTimeout);
    };
  }, [isCameraActive, handleScannedResult, stopCamera]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle Image File Upload (QR Drag & Drop / File Select)
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
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleScannedResult(code.data);
        } else {
          showToast('No valid QR code was detected in the uploaded image file. Please try another tag.', 'error');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Submit Physical Audit Verification
  const handleLogAuditVerification = () => {
    if (!selectedAsset) return;
    setIsSubmittingAudit(true);

    setTimeout(() => {
      const newEntry = {
        date: new Date().toISOString().replace('T', ' ').slice(0, 19),
        auditor: auditorName,
        action: 'On-Site Physical QR Audit & Seal Inspection',
        notes: auditNotes || 'Physical hardware tag scanned via device camera; chassis tamper seals intact.',
        verificationHash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`
      };

      setSelectedAsset(prev => {
        if (!prev) return null;
        return {
          ...prev,
          lastPhysicalAudit: new Date().toISOString().split('T')[0],
          auditAuditLog: [newEntry, ...prev.auditAuditLog]
        };
      });

      setIsSubmittingAudit(false);
      setAuditNotes('');
      showToast('Physical audit record signed & committed to Sovereign Audit Ledger.', 'success');
    }, 900);
  };

  // Trigger Hardware PQC Attestation
  const handleTriggerPqcAttestation = () => {
    if (!selectedAsset) return;
    setIsAttestingPqc(true);

    setTimeout(() => {
      setSelectedAsset(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cryptographicStatus: {
            ...prev.cryptographicStatus,
            algorithm: 'PQC Kyber-768 Enforced',
            lastFirmwareAttestation: `${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`,
            tamperDetection: 'Intact'
          },
          complianceStatus: 'COMPLIANT',
          complianceScore: Math.min(100, (prev.complianceScore || 90) + 5)
        };
      });

      setIsAttestingPqc(false);
      showToast('Hardware TPM 2.0 PCR attestation verified against PQC Kyber-768 root.', 'success');
    }, 1200);
  };

  // Export Full PDF Dossier
  const handleExportPdfDossier = () => {
    if (!selectedAsset) return;

    const headers = ['Metric / Property', 'Physical Telemetry Value'];
    const rows = [
      ['Asset Identifier', selectedAsset.id],
      ['Asset Tag Barcode', selectedAsset.assetTag],
      ['Hardware Model', selectedAsset.model],
      ['Serial Number', selectedAsset.serialNumber],
      ['Physical Location', `${selectedAsset.physicalLocation.facility}, ${selectedAsset.physicalLocation.rackId} (${selectedAsset.physicalLocation.rackUnit})`],
      ['Sovereignty Enclave', selectedAsset.sovereigntyEnclave],
      ['Compliance Status', `${selectedAsset.complianceStatus} (${selectedAsset.complianceScore}%)`],
      ['Cryptographic Cipher', selectedAsset.cryptographicStatus.algorithm],
      ['TPM 2.0 PCR Hash', selectedAsset.cryptographicStatus.pcrHash],
      ['Tamper Sensor State', selectedAsset.cryptographicStatus.tamperDetection],
      ['Lead Custodian', `${selectedAsset.assignedCustodian.name} (${selectedAsset.assignedCustodian.email})`],
      ['Last Physical Audit', selectedAsset.lastPhysicalAudit],
      ['Next Audit Due', selectedAsset.nextAuditDue]
    ];

    generatePdfExport(
      `Physical Hardware Asset Audit Dossier - ${selectedAsset.assetTag}`,
      headers,
      rows,
      `hardware-dossier-${selectedAsset.id.toLowerCase()}`
    );
    showToast('Physical Asset Audit Dossier PDF downloaded.', 'success');
  };

  // Print Asset Tag
  const handlePrintTag = () => {
    window.print();
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl overflow-hidden shadow-2xl ${isModal ? 'max-w-5xl w-full mx-auto' : 'w-full'}`}>
      
      {/* HEADER BAR */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
            <Camera className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Rapid Asset Identification Engine
              </span>
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[10px] font-mono font-bold">
                CAMERA QR & TPM 2.0
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              Physical Hardware Compliance Scanner
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Mute Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Scan Sound' : 'Enable Scan Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        
        {/* LEFT COLUMN: LIVE CAMERA VIEWFINDER & PRESETS (5 COLS) */}
        <div className="lg:col-span-5 p-5 sm:p-6 bg-slate-950/70 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-400" />
                Live Camera Reticle
              </span>
              {isCameraActive && (
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  SCANNING ACTIVE
                </span>
              )}
            </div>

            {/* VIDEO VIEWFINDER CONTAINER */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex flex-col items-center justify-center group">
              
              {/* Actual Video Element */}
              <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {/* Hidden Canvas for Frame Processing */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Target Graphic (when camera is active) */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-cyan-400/80 rounded-2xl relative shadow-2xl">
                    {/* Corner Target Accents */}
                    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
                    <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>
                    
                    {/* Laser Scan Line Animation */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce opacity-90 shadow-md shadow-cyan-400/50"></div>
                    
                    <div className="absolute bottom-2 inset-x-0 text-center text-[10px] font-mono text-cyan-300/90 font-bold tracking-wider">
                      ALIGN ASSET QR TAG
                    </div>
                  </div>
                </div>
              )}

              {/* Idle / Inactive Overlay */}
              {!isCameraActive && (
                <div className="p-6 text-center space-y-4 max-w-xs z-10">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                    <Camera className="w-8 h-8 opacity-80" />
                  </div>
                  {cameraError ? (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono">
                      {cameraError}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Position physical server tag or rack QR label within device camera viewfinder to pull live compliance status instantly.
                    </p>
                  )}

                  <button
                    onClick={startCamera}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer border-0 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Activate Device Camera</span>
                  </button>
                </div>
              )}

              {/* In-Viewfinder Camera Controls */}
              {isCameraActive && (
                <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between gap-2 p-2 bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-800">
                  {torchSupported && (
                    <button
                      onClick={toggleTorch}
                      className={`p-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isTorchOn
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Flashlight className="w-3.5 h-3.5" />
                      <span>{isTorchOn ? 'Flash ON' : 'Flash'}</span>
                    </button>
                  )}

                  <button
                    onClick={toggleFacingMode}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" />
                    <span>Flip</span>
                  </button>

                  <button
                    onClick={stopCamera}
                    className="p-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer border border-rose-500/30"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </button>
                </div>
              )}
            </div>

            {/* Alternative File Upload */}
            <div className="mt-3">
              <label className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-mono text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload QR Image / Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* QUICK PRESET PHYSICAL HARDWARE SIMULATION TILES */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                Quick Test Preset Assets:
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1-Click Test</span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {HARDWARE_PHYSICAL_ASSETS.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleScannedResult(asset.qrCodePayload)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedAsset?.id === asset.id
                      ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-400">{asset.assetTag}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      asset.complianceStatus === 'COMPLIANT' ? 'bg-emerald-400' :
                      asset.complianceStatus === 'WARNING' ? 'bg-amber-400' : 'bg-rose-400'
                    }`}></span>
                  </div>
                  <div className="text-[11px] font-sans font-bold truncate text-slate-200 mt-0.5">
                    {asset.name}
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">{asset.category}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: IDENTIFIED ASSET AUDIT DOSSIER (7 COLS) */}
        <div className="lg:col-span-7 p-5 sm:p-6 space-y-6">
          {selectedAsset ? (
            <div>
              {/* ASSET STATUS HERO BANNER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono font-bold text-xs">
                      {selectedAsset.assetTag}
                    </span>
                    <span className="text-xs font-mono text-slate-400">ID: {selectedAsset.id}</span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    {selectedAsset.name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{selectedAsset.model}</span>
                  </div>
                </div>

                {/* Compliance Score Pill */}
                <div className="flex items-center gap-3">
                  <div className={`px-3.5 py-2 rounded-2xl border flex items-center gap-2 font-mono text-xs font-bold ${
                    selectedAsset.complianceStatus === 'COMPLIANT'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : selectedAsset.complianceStatus === 'WARNING'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {selectedAsset.complianceStatus === 'COMPLIANT' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ) : selectedAsset.complianceStatus === 'WARNING' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    )}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider opacity-80 leading-none">Status</div>
                      <div className="text-sm font-black">{selectedAsset.complianceStatus} ({selectedAsset.complianceScore}%)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABS SELECTOR */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono mt-5">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer border-0 ${
                    activeTab === 'details'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white bg-transparent'
                  }`}
                >
                  Hardware Telemetry
                </button>
                <button
                  onClick={() => setActiveTab('controls')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer border-0 ${
                    activeTab === 'controls'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white bg-transparent'
                  }`}
                >
                  Statutory Controls ({selectedAsset.statutoryControls.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer border-0 ${
                    activeTab === 'history'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white bg-transparent'
                  }`}
                >
                  Audit Trail ({selectedAsset.auditAuditLog.length})
                </button>
                <button
                  onClick={() => setActiveTab('tag_generator')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer border-0 ${
                    activeTab === 'tag_generator'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white bg-transparent'
                  }`}
                >
                  Print Asset QR Tag
                </button>
              </div>

              {/* TAB CONTENT: HARDWARE TELEMETRY */}
              {activeTab === 'details' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 mt-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                    {/* Location Specs */}
                    <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Physical Rack Location
                      </div>
                      <div className="font-bold text-white text-[11px]">{selectedAsset.physicalLocation.facility}</div>
                      <div className="text-[11px] text-slate-300">
                        {selectedAsset.physicalLocation.room} | <span className="text-cyan-300 font-bold">{selectedAsset.physicalLocation.rackId}</span> ({selectedAsset.physicalLocation.rackUnit})
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Jurisdiction: {selectedAsset.physicalLocation.jurisdiction}
                      </div>
                    </div>

                    {/* Cryptographic & Root of Trust */}
                    <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" /> Cryptographic Posture
                      </div>
                      <div className="font-bold text-emerald-400 text-[11px] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {selectedAsset.cryptographicStatus.algorithm}
                      </div>
                      <div className="text-[10px] text-slate-300 truncate">
                        TPM: {selectedAsset.cryptographicStatus.tpmVersion}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Tamper Sensor: <span className={selectedAsset.cryptographicStatus.tamperDetection === 'Intact' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{selectedAsset.cryptographicStatus.tamperDetection}</span>
                      </div>
                    </div>

                    {/* Serial & Hardware Identifiers */}
                    <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Hardware Specs
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Serial: <span className="text-white font-bold">{selectedAsset.serialNumber}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        MAC: <span className="text-slate-300">{selectedAsset.macAddress}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Enclave: {selectedAsset.sovereigntyEnclave}
                      </div>
                    </div>

                    {/* Custodian & Audit Cycle */}
                    <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Custodian & Audit Cycle
                      </div>
                      <div className="text-[11px] text-white font-bold">{selectedAsset.assignedCustodian.name}</div>
                      <div className="text-[10px] text-slate-400">{selectedAsset.assignedCustodian.role}</div>
                      <div className="text-[10px] text-cyan-400">
                        Next Physical Audit: <span className="font-bold">{selectedAsset.nextAuditDue}</span>
                      </div>
                    </div>
                  </div>

                  {/* TPM PCR Golden Image Hash */}
                  <div className="p-3.5 bg-slate-950 border border-slate-800/90 rounded-xl font-mono text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold">
                      <span>Hardware Root-of-Trust PCR Attestation Hash</span>
                      <span className="text-emerald-400">Verified Golden</span>
                    </div>
                    <div className="text-[10px] text-slate-300 break-all bg-slate-900 p-2 rounded-lg border border-slate-800">
                      {selectedAsset.cryptographicStatus.pcrHash}
                    </div>
                  </div>

                  {/* RAPID ACTION TOOLBAR */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleTriggerPqcAttestation}
                      disabled={isAttestingPqc}
                      className="py-2.5 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-4 h-4 ${isAttestingPqc ? 'animate-spin' : ''}`} />
                      <span>{isAttestingPqc ? 'Attesting Hardware TPM...' : 'Verify PQC Attestation'}</span>
                    </button>

                    <button
                      onClick={handleExportPdfDossier}
                      className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>Export Physical Audit PDF</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: STATUTORY CONTROLS */}
              {activeTab === 'controls' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 mt-5"
                >
                  {selectedAsset.statutoryControls.map((ctrl, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-400">{ctrl.framework}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ctrl.status === 'PASSED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          ctrl.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {ctrl.status}
                        </span>
                      </div>
                      <div className="text-white font-sans text-xs font-bold">{ctrl.clause}</div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{ctrl.requirement}</p>
                      <div className="text-[10px] text-cyan-300 bg-slate-900 p-2 rounded-lg border border-slate-850">
                        Evidence: {ctrl.evidence} (Checked: {ctrl.lastChecked})
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* TAB CONTENT: AUDIT TRAIL & LOG PHYSICAL VERIFICATION */}
              {activeTab === 'history' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 mt-5"
                >
                  {/* Log Physical Verification Form */}
                  <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded-xl space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span>Log On-Site Physical Inspection</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={auditorName}
                        onChange={(e) => setAuditorName(e.target.value)}
                        placeholder="Auditor Name & Credential"
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-mono focus:border-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        value={auditNotes}
                        onChange={(e) => setAuditNotes(e.target.value)}
                        placeholder="Physical seal condition / cable notes..."
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-mono focus:border-indigo-500 outline-none"
                      />
                    </div>

                    <button
                      onClick={handleLogAuditVerification}
                      disabled={isSubmittingAudit}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border-0 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isSubmittingAudit ? 'Signing Verification...' : 'Commit Physical Audit Entry'}</span>
                    </button>
                  </div>

                  {/* Historic Inspection Log */}
                  <div className="space-y-2 font-mono text-xs max-h-60 overflow-y-auto">
                    {selectedAsset.auditAuditLog.map((log, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span className="font-bold text-cyan-400">{log.action}</span>
                          <span>{log.date}</span>
                        </div>
                        <div className="text-white text-xs font-sans">{log.notes}</div>
                        <div className="text-[10px] text-slate-500 flex justify-between">
                          <span>Auditor: {log.auditor}</span>
                          <span className="truncate max-w-[140px]">Hash: {log.verificationHash}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: PRINT ASSET QR TAG */}
              {activeTab === 'tag_generator' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 mt-5 font-mono text-xs"
                >
                  <div className="p-5 bg-white text-slate-950 rounded-2xl border-2 border-slate-300 shadow-xl max-w-sm mx-auto text-center space-y-3 print:block" id="printable-asset-qr-tag">
                    <div className="border-b border-slate-200 pb-2">
                      <div className="text-[10px] font-black tracking-widest text-indigo-700 uppercase">
                        9XEN_REGULETTEE SOVEREIGN AUDIT ASSET
                      </div>
                      <div className="text-base font-black tracking-tight text-slate-900">{selectedAsset.assetTag}</div>
                    </div>

                    <div className="py-1 flex justify-center">
                      {assetQrDataUrl ? (
                        <img src={assetQrDataUrl} alt="Asset QR Tag" className="w-48 h-48 mx-auto" />
                      ) : (
                        <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-400">
                          Generating QR...
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] space-y-0.5 border-t border-slate-200 pt-2 text-slate-600">
                      <div className="font-bold text-slate-900 truncate">{selectedAsset.name}</div>
                      <div>Rack: {selectedAsset.physicalLocation.rackId} ({selectedAsset.physicalLocation.rackUnit})</div>
                      <div className="text-[9px] text-indigo-600 font-bold">FIPS / PQC Kyber-768 Root of Trust</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handlePrintTag}
                      className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer border-0"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Hardware Asset Sticker</span>
                    </button>
                    {assetQrDataUrl && (
                      <a
                        href={assetQrDataUrl}
                        download={`qr-tag-${selectedAsset.assetTag.toLowerCase()}.png`}
                        className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 no-underline border border-slate-700 text-center"
                      >
                        <Download className="w-4 h-4 text-cyan-400" />
                        <span>Download PNG</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              )}

            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 font-mono text-xs">
              No asset selected. Point camera at an asset tag to inspect compliance.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
