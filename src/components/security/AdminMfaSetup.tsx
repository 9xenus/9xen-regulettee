import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Lock, 
  Smartphone, 
  QrCode, 
  RefreshCw, 
  Download, 
  Check, 
  AlertTriangle, 
  Copy, 
  Plus, 
  Fingerprint, 
  Trash2, 
  CheckCircle2, 
  X,
  Eye,
  Calendar,
  Clock,
  Terminal,
  Activity,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

interface AdminMfaSetupProps {
  onMfaStatusChange?: (isEnabled: boolean) => void;
}

interface MfaLog {
  id: string;
  timestamp: string;
  event: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
  device: string;
  ip: string;
}

export const AdminMfaSetup: React.FC<AdminMfaSetupProps> = ({ onMfaStatusChange }) => {
  const { showToast } = useNotification();

  // Core configuration states (persisted locally)
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(() => {
    return localStorage.getItem('admin_mfa_enabled') === 'true';
  });
  const [mfaMethod, setMfaMethod] = useState<'TOTP' | 'YUBIKEY' | null>(() => {
    return (localStorage.getItem('admin_mfa_method') as 'TOTP' | 'YUBIKEY') || null;
  });
  const [globalEnforcement, setGlobalEnforcement] = useState<boolean>(() => {
    return localStorage.getItem('admin_mfa_global_enforcement') === 'true';
  });
  const [mfaSecret, setMfaSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [usedBackupCodes, setUsedBackupCodes] = useState<string[]>([]);

  // Wizard Flow States
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMethod, setSelectedMethod] = useState<'TOTP' | 'YUBIKEY'>('TOTP');
  
  // Code Verification States
  const [totpCode, setTotpCode] = useState<string>('');
  const [totpTimer, setTotpTimer] = useState<number>(30);
  const [isVerifying, setIsVerifying] = useState(false);

  // YubiKey interactive simulator states
  const [yubiKeyInserted, setYubiKeyInserted] = useState(false);
  const [yubiKeyTouched, setYubiKeyTouched] = useState(false);
  const [isRegisteringKey, setIsRegisteringKey] = useState(false);

  // Administrative Access Session logs
  const [mfaLogs, setMfaLogs] = useState<MfaLog[]>([]);

  // Generate TOTP Secret (Base32 mockup)
  const generateSecretAndCodes = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setMfaSecret(secret);

    // Generate 8 backup recovery codes
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const segment1 = Math.floor(1000 + Math.random() * 9000);
      const segment2 = Math.floor(1000 + Math.random() * 9000);
      codes.push(`${segment1}-${segment2}`);
    }
    setBackupCodes(codes);
    setUsedBackupCodes([]);
  };

  // Sync state changes with parent and localStorage
  useEffect(() => {
    localStorage.setItem('admin_mfa_enabled', String(mfaEnabled));
    if (onMfaStatusChange) {
      onMfaStatusChange(mfaEnabled);
    }
  }, [mfaEnabled, onMfaStatusChange]);

  useEffect(() => {
    if (mfaMethod) {
      localStorage.setItem('admin_mfa_method', mfaMethod);
    } else {
      localStorage.removeItem('admin_mfa_method');
    }
  }, [mfaMethod]);

  useEffect(() => {
    localStorage.setItem('admin_mfa_global_enforcement', String(globalEnforcement));
  }, [globalEnforcement]);

  // Load / Generate mockup login logs
  useEffect(() => {
    const defaultLogs: MfaLog[] = [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        event: 'SaaS Command Center Session Initialization',
        status: 'SUCCESS',
        device: 'macOS Chrome 124.0.0 (Sovereign Laptop)',
        ip: '193.168.4.15 (EU-CENTRAL-1 VPN Gate)'
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        event: 'SaaS Command Center Session Initialization',
        status: 'SUCCESS',
        device: 'macOS Chrome 124.0.0 (Sovereign Laptop)',
        ip: '193.168.4.15 (EU-CENTRAL-1 VPN Gate)'
      },
      {
        id: 'log-3',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        event: 'Sovereign Database Configuration Policy Mutation',
        status: 'SUCCESS',
        device: 'macOS Chrome 124.0.0 (Sovereign Laptop)',
        ip: '193.168.4.15 (EU-CENTRAL-1 VPN Gate)'
      },
      {
        id: 'log-4',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        event: 'Failed Administrator Sign-In Attempt (Invalid Password)',
        status: 'WARNING',
        device: 'Firefox 125.0 (Unknown User-Agent)',
        ip: '82.16.195.122 (External Relay Node)'
      }
    ];

    const savedLogs = localStorage.getItem('admin_mfa_session_logs');
    if (savedLogs) {
      setMfaLogs(JSON.parse(savedLogs));
    } else {
      setMfaLogs(defaultLogs);
      localStorage.setItem('admin_mfa_session_logs', JSON.stringify(defaultLogs));
    }
  }, []);

  // Timer simulating rotating TOTP code expiration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showWizard && wizardStep === 2 && selectedMethod === 'TOTP') {
      timer = setInterval(() => {
        setTotpTimer((prev) => {
          if (prev <= 1) {
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showWizard, wizardStep, selectedMethod]);

  const handleStartWizard = () => {
    generateSecretAndCodes();
    setSelectedMethod('TOTP');
    setWizardStep(1);
    setTotpCode('');
    setYubiKeyInserted(false);
    setYubiKeyTouched(false);
    setShowWizard(true);
  };

  const handleNextStep = () => {
    if (wizardStep === 1) {
      if (selectedMethod === 'TOTP') {
        setWizardStep(2);
      } else {
        setWizardStep(3); // Go straight to YubiKey simulator
      }
    }
  };

  const handleVerifyTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6 || !/^\d+$/.test(totpCode)) {
      showToast('Please enter a valid 6-digit numeric verification code.', 'error');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      // Mock code verification (any 6 digit code works for demo simulation)
      setMfaEnabled(true);
      setMfaMethod('TOTP');
      setWizardStep(4); // Move to recovery codes step
      showToast('TOTP Authenticator validated successfully. MFA is now registered.', 'success');

      // Add a fresh log
      addMfaEventLog('TOTP Authenticator Setup Complete', 'SUCCESS');
    }, 1200);
  };

  const simulateYubiKeyInsertion = () => {
    setYubiKeyInserted(true);
    showToast('YubiKey inserted into USB slot.', 'info');
  };

  const handleTouchYubiKey = () => {
    if (!yubiKeyInserted) {
      showToast('Please insert your YubiKey first.', 'warning');
      return;
    }
    setIsRegisteringKey(true);
    setTimeout(() => {
      setYubiKeyTouched(true);
      setIsRegisteringKey(false);
      setMfaEnabled(true);
      setMfaMethod('YUBIKEY');
      setWizardStep(4); // Go to recovery codes step
      showToast('Hardware security key authenticated & registered successfully!', 'success');

      // Add log
      addMfaEventLog('FIDO2/WebAuthn YubiKey Setup Complete', 'SUCCESS');
    }, 1500);
  };

  const addMfaEventLog = (eventText: string, statusType: 'SUCCESS' | 'WARNING' | 'CRITICAL') => {
    const newLog: MfaLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      event: eventText,
      status: statusType,
      device: 'macOS Chrome 124.0.0 (Sovereign Laptop)',
      ip: '193.168.4.15 (EU-CENTRAL-1 VPN Gate)'
    };
    const updatedLogs = [newLog, ...mfaLogs];
    setMfaLogs(updatedLogs);
    localStorage.setItem('admin_mfa_session_logs', JSON.stringify(updatedLogs));
  };

  const disableMfa = () => {
    if (window.confirm('Are you absolutely sure you want to disable Administrative Multi-Factor Authentication? This severely degrades security posture.')) {
      setMfaEnabled(false);
      setMfaMethod(null);
      addMfaEventLog('Multi-Factor Authentication Deactivated by Admin', 'CRITICAL');
      showToast('Multi-Factor Authentication has been successfully disabled.', 'warning');
    }
  };

  const handleToggleGlobalPolicy = () => {
    const nextVal = !globalEnforcement;
    setGlobalEnforcement(nextVal);
    addMfaEventLog(
      nextVal ? 'Global MFA Enforcement Policy Triggered' : 'Global MFA Enforcement Policy Revoked', 
      nextVal ? 'SUCCESS' : 'WARNING'
    );
    showToast(
      nextVal 
        ? 'Global Admin Security Policy: MFA is now mandatory for ALL Administrative Accounts.' 
        : 'Global Admin Policy downgraded: MFA is now optional for tenants.', 
      nextVal ? 'success' : 'warning'
    );
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    showToast(message, 'success');
  };

  const downloadBackupCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([
      `9XEN_REGULETTEE SOVEREIGN CLOUD - ADMINISTRATOR RECOVERY BACKUP CODES\n`,
      `Generated: ${new Date().toLocaleString()}\n`,
      `Admin ID: secure-admin-sovereign\n`,
      `--------------------------------------------------------\n`,
      backupCodes.map((code, index) => `Code [${index + 1}]: ${code}`).join('\n'),
      `\n--------------------------------------------------------\n`,
      `Store these codes securely in an offline data safe. Each recovery code can only be used once.`
    ], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `9xen-regulettee-admin-recovery-codes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Recovery codes downloaded successfully!', 'success');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Visual Status Indicator Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${
              mfaEnabled 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                : 'bg-rose-50 text-rose-600 border border-rose-150 animate-pulse'
            }`}>
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
                  Multi-Factor Authentication (MFA)
                </h3>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  mfaEnabled 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {mfaEnabled ? 'SECURED ACTIVE' : 'UNPROTECTED'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Add an extra layer of compliance protection to your administrative accounts. Signing in requires both your sovereign password and an authenticated TOTP generator or a FIDO2 hardware token.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {mfaEnabled ? (
              <button
                onClick={disableMfa}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Disable Authentication
              </button>
            ) : (
              <button
                onClick={handleStartWizard}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Initialize MFA Setup
              </button>
            )}
          </div>
        </div>

        {/* Selected method summary */}
        {mfaEnabled && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider block">Active Authentication System</span>
              <div className="flex items-center gap-2 mt-1.5 text-slate-800">
                {mfaMethod === 'TOTP' ? (
                  <>
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold">TOTP Authenticator App</span>
                    <span className="text-slate-500">(Google Authenticator, Duo, Bitwarden)</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold">Hardware Token Key</span>
                    <span className="text-slate-500">(YubiKey, FIDO2, WebAuthn)</span>
                  </>
                )}
              </div>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5 flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider block">Recovery Mode</span>
                <span className="text-slate-700 font-bold block mt-1">8 Active Cryptographic Recovery Seeds</span>
              </div>
              <button
                onClick={() => {
                  generateSecretAndCodes();
                  setWizardStep(4);
                  setShowWizard(true);
                }}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:shadow-xs transition-colors cursor-pointer"
              >
                Display Seeds
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column: Security Policy & Settings */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-600" /> Administrative Security Policy
            </h3>

            <div className="space-y-4 text-xs font-medium">
              
              {/* Global toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <label className="font-bold text-slate-800">Enforce MFA globally</label>
                  <p className="text-[10px] text-slate-500">Require MFA verification for all tenant root and super-administrator login enclaves.</p>
                </div>
                <input
                  type="checkbox"
                  checked={globalEnforcement}
                  onChange={handleToggleGlobalPolicy}
                  className="h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer shrink-0"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Session Idle Timeout</span>
                  <span className="text-slate-800 font-bold font-mono">15 Minutes (Strict)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">PQC Key Algorithm</span>
                  <span className="text-indigo-600 font-bold font-mono bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Kyber-1024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Enclave Isolation</span>
                  <span className="text-emerald-600 font-bold uppercase">100% Sealed</span>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-3 shadow-inner relative overflow-hidden">
            <div className="absolute right-0 bottom-0 p-4 opacity-5 pointer-events-none">
              <Fingerprint className="w-32 h-32" />
            </div>
            
            <h4 className="text-xs font-black tracking-wider text-indigo-400 uppercase font-mono">Sovereignty Hardware Alignment</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Administrative enclaves support certified hardware authenticators aligned with <strong>FIDO2 / WebAuthn standard guidelines</strong>.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Using physical security keys isolates the sign-in keys from browser telemetry risk and mitigates remote credential harvesting or phishing vectors entirely.
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Session Logging */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  Administrative Access Log
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Real-time telemetry verification of administrative enclaves and security settings.</p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('admin_mfa_session_logs');
                  setMfaLogs([]);
                  showToast('Access logs cleared.', 'info');
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
              >
                Clear Log
              </button>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {mfaLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  No administrative events logged.
                </div>
              ) : (
                mfaLogs.map((log) => (
                  <div key={log.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800">{log.event}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                          log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                          log.status === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono flex-wrap">
                        <span>{log.device}</span>
                        <span>•</span>
                        <span>{log.ip}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* MFA Wizard Modal Dialog Backdrop */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8"
            >
              
              {/* Modal Header */}
              <div className="bg-slate-900 px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5 text-white">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-300">Administrative Enclave</h3>
                    <h2 className="font-extrabold text-sm text-white">MFA Registration Studio</h2>
                  </div>
                </div>
                <button
                  onClick={() => setShowWizard(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Steps Indicator */}
              <div className="bg-slate-50 border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className={wizardStep === 1 ? 'text-indigo-600 font-black' : ''}>1. Select Method</span>
                <span>/</span>
                <span className={wizardStep === 2 || wizardStep === 3 ? 'text-indigo-600 font-black' : ''}>2. Authenticate</span>
                <span>/</span>
                <span className={wizardStep === 4 ? 'text-indigo-600 font-black' : ''}>3. Recovery Keys</span>
              </div>

              {/* Modal Core Content */}
              <div className="p-4 sm:p-5 lg:p-6">
                
                {/* STEP 1: METHOD SELECT */}
                {wizardStep === 1 && (
                  <div className="space-y-5">
                    <div className="text-xs text-slate-600 leading-relaxed font-medium">
                      Select your primary high-security authentication strategy. Hardware keys offer absolute quantum resilience, while software apps provide standard global mobility.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Software authenticator app */}
                      <button
                        onClick={() => setSelectedMethod('TOTP')}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-44 cursor-pointer transition-all ${
                          selectedMethod === 'TOTP' 
                            ? 'bg-indigo-50/50 border-indigo-600 shadow-sm shadow-indigo-100' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Authenticator App</h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                            Generate standard 6-digit rotation tokens using Google Authenticator, Duo, or Bitwarden.
                          </p>
                        </div>
                      </button>

                      {/* Hardware security key */}
                      <button
                        onClick={() => setSelectedMethod('YUBIKEY')}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-44 cursor-pointer transition-all ${
                          selectedMethod === 'YUBIKEY' 
                            ? 'bg-indigo-50/50 border-indigo-600 shadow-sm shadow-indigo-100' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                          <Fingerprint className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">YubiKey / WebAuthn</h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                            Authenticate using physical USB/NFC hardware security keys, Google Titan, or biometric local enclaves.
                          </p>
                        </div>
                      </button>

                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        onClick={handleNextStep}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-colors"
                      >
                        Proceed to Setup
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: SOFTWARE TOTP VERIFICATION */}
                {wizardStep === 2 && (
                  <form onSubmit={handleVerifyTotp} className="space-y-5">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                      
                      {/* Left: simulated QR */}
                      <div className="sm:col-span-5 flex flex-col items-center">
                        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200/60 relative">
                          {/* We draw a simulated high tech QR code inside a grid */}
                          <div className="w-28 h-28 grid grid-cols-8 gap-0.5">
                            {Array.from({ length: 64 }).map((_, i) => {
                              const isDark = (i % 3 === 0 || i % 7 === 1 || i < 8 || i % 8 === 0 || (i > 56 && i % 4 === 0)) && !(i > 16 && i < 24);
                              return (
                                <div 
                                  key={i} 
                                  className={`w-full h-full rounded-xs ${isDark ? 'bg-slate-900' : 'bg-white'}`} 
                                />
                              );
                            })}
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => copyToClipboard(mfaSecret, 'Sovereign MFA Secret copied to clipboard')}
                          className="mt-3 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Secret Key
                        </button>
                      </div>

                      {/* Right: details & code verify */}
                      <div className="sm:col-span-7 space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                            Scan verification credentials
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                            Scan this QR code with your authenticator mobile application. If scanning is unavailable, manually register the secure key below:
                          </p>
                          <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg font-mono text-[10px] text-slate-700 select-all tracking-wider text-center font-bold">
                            {mfaSecret}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Enter verification code
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={totpCode}
                              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="000000"
                              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-center font-mono font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32"
                              required
                            />
                            
                            <button
                              type="submit"
                              disabled={isVerifying}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-lg shadow-xs transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                            >
                              {isVerifying ? 'Authenticating...' : 'Validate Code'}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-2 font-mono">
                            <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin-slow" />
                            <span>Security code rotated {totpTimer}s ago</span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </form>
                )}

                {/* STEP 3: PHYSICAL HARDWARE SECURITY KEY SIMULATOR */}
                {wizardStep === 3 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-1.5 text-center">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Secure Key WebAuthn Simulator
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm mx-auto font-medium">
                        Simulate the physical attachment of a FIDO2 compliant YubiKey hardware sensor.
                      </p>
                    </div>

                    {/* Interactive YubiKey visualizer */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center space-y-4">
                      
                      <div className="flex items-center gap-12 relative">
                        {/* Computer slot (left) */}
                        <div className="bg-slate-800 w-16 h-8 rounded border border-slate-700 flex items-center justify-center text-slate-500 font-mono text-[9px] font-bold shadow-inner">
                          USB-C SLOT
                        </div>

                        {/* Connection Line */}
                        <div className="absolute left-16 right-20 h-0.5 border-b border-dashed border-indigo-300" />

                        {/* YubiKey (right) */}
                        <motion.button
                          onClick={simulateYubiKeyInsertion}
                          type="button"
                          animate={yubiKeyInserted ? { x: -35 } : { x: 0 }}
                          transition={{ type: "spring", stiffness: 100 }}
                          className={`w-28 h-10 rounded-lg flex items-center justify-between px-3 border shadow-sm transition-colors cursor-pointer shrink-0 ${
                            yubiKeyInserted 
                              ? 'bg-slate-900 border-indigo-500 text-white' 
                              : 'bg-slate-200 border-slate-350 hover:bg-slate-350 text-slate-700'
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase tracking-wider">YubiKey 5</span>
                          
                          {/* Golden Touch sensor */}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                            yubiKeyTouched 
                              ? 'bg-emerald-400 border-emerald-300' 
                              : 'bg-amber-400 border-amber-300 animate-pulse'
                          }`} />
                        </motion.button>
                      </div>

                      {/* Visual instructional instructions */}
                      <div className="text-center">
                        {!yubiKeyInserted ? (
                          <p className="text-[10px] text-indigo-600 font-bold">
                            Step 1: Click the YubiKey to insert it into the USB-C Slot.
                          </p>
                        ) : !yubiKeyTouched ? (
                          <div className="space-y-2">
                            <p className="text-[10px] text-emerald-600 font-black flex items-center justify-center gap-1">
                              <Fingerprint className="w-3.5 h-3.5" /> YubiKey detected! Step 2: Touch the golden sensor.
                            </p>
                            <button
                              type="button"
                              onClick={handleTouchYubiKey}
                              disabled={isRegisteringKey}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded shadow-xs cursor-pointer transition-colors"
                            >
                              {isRegisteringKey ? 'Verifying Key Touch...' : 'Touch Security Sensor'}
                            </button>
                          </div>
                        ) : (
                          <p className="text-[10px] text-emerald-600 font-black">
                            Security Key Registered successfully!
                          </p>
                        )}
                      </div>

                    </div>

                    <div className="flex justify-between pt-3 text-xs">
                      <button
                        onClick={() => setWizardStep(1)}
                        className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer transition-colors hover:bg-slate-50"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: BACKUP RECOVERY SEED CODES */}
                {wizardStep === 4 && (
                  <div className="space-y-5 text-xs font-medium">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-amber-800 text-xs">Store administrative recovery codes securely!</h4>
                        <p className="text-[10px] text-amber-700 leading-relaxed mt-0.5">
                          If your primary device is lost or experiences a physical malfunction, these single-use codes are the ONLY way to access your administrative enclaves. Save or print them offline.
                        </p>
                      </div>
                    </div>

                    {/* Grid of backup codes */}
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-4.5 grid grid-cols-2 gap-3.5 font-mono text-[11px] text-slate-800 font-bold">
                      {backupCodes.map((code, index) => {
                        const isUsed = usedBackupCodes.includes(code);
                        return (
                          <div 
                            key={index} 
                            className={`flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs ${
                              isUsed ? 'opacity-40 line-through bg-slate-100 border-dashed' : ''
                            }`}
                          >
                            <span className="text-slate-400 font-mono font-bold text-[9px]">[{index + 1}]</span>
                            <span>{code}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2.5 justify-between pt-2 border-t border-slate-100 pt-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(backupCodes.join('\n'), 'Backup codes copied to clipboard')}
                          className="px-3.5 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-colors bg-white flex items-center gap-1.5 cursor-pointer"
                        >
                          <Copy className="w-4 h-4" /> Copy Codes
                        </button>
                        <button
                          type="button"
                          onClick={downloadBackupCodes}
                          className="px-3.5 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-colors bg-white flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-4 h-4" /> Download Text
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowWizard(false);
                          showToast('MFA Activation wizard has completed.', 'success');
                        }}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                      >
                        Complete Setup
                      </button>
                    </div>

                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
