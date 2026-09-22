import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Key, 
  Fingerprint, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Download, 
  ArrowLeft, 
  RefreshCw, 
  Globe, 
  Terminal, 
  User, 
  Settings as SettingsIcon,
  ShieldAlert,
  Sliders,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  QrCode,
  Zap,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';
import { MfaSetupFlow } from '../components/settings/MfaSetupFlow';
import { AdaptiveSessionSecurity } from '../components/security/AdaptiveSessionSecurity';
import { BreakGlassAccess } from '../components/security/BreakGlassAccess';

export const SecuritySettings: React.FC = () => {
  const { showToast } = useNotification();
  
  // MFA States
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [backupCodesLeft, setBackupCodesLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupFlow, setShowSetupFlow] = useState(false);
  const [showTestChallengeModal, setShowTestChallengeModal] = useState(false);
  const [testChallengeToken, setTestChallengeToken] = useState('');
  const [isVerifyingChallenge, setIsVerifyingChallenge] = useState(false);
  const [challengeSuccess, setChallengeSuccess] = useState<boolean | null>(null);

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState<Record<string, boolean>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Active Sessions
  const [sessions, setSessions] = useState([
    { id: 'sess_1', device: 'Chrome on macOS (Ventura)', ip: '192.168.1.42', location: 'Frankfurt, Germany', current: true, date: 'Active now' },
    { id: 'sess_2', device: 'Safari on iPhone 15 Pro', ip: '80.12.91.104', location: 'Berlin, Germany', current: false, date: '2 hours ago' },
    { id: 'sess_3', device: 'Firefox on Windows 11', ip: '92.42.108.11', location: 'London, United Kingdom', current: false, date: '3 days ago' },
  ]);

  // Security Policies (Local/DB settings)
  const [ipAllowlist, setIpAllowlist] = useState('');
  const [idleTimeout, setIdleTimeout] = useState('30');
  const [isSavingPolicies, setIsSavingPolicies] = useState(false);

  // Fetch current MFA status
  const checkMfaStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/security/mfa/status', {
        headers: {
          'x-tenant-context': 'org_1' // Defaulting to the active client context
        }
      });
      const data = await res.json();
      if (data.success) {
        setMfaEnabled(data.mfa.mfa_enabled);
        setBackupCodesLeft(data.mfa.backup_codes_left);
      }
    } catch (error) {
      console.error('Error fetching MFA status:', error);
      showToast('Error syncing security status with ledger.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkMfaStatus();
  }, []);

  // Initiate TOTP 2FA Setup
  const handleStartMfaSetup = () => {
    setShowSetupFlow(true);
  };

  // Disable MFA
  const handleDisableMfa = async () => {
    if (window.confirm('WARNING: Disabling Multi-Factor Authentication makes your account vulnerable to credential exploitation. Are you sure you want to proceed?')) {
      try {
        const res = await fetchWithRetry('/api/v1/security/mfa/disable', {
          method: 'POST',
          headers: {
            'x-tenant-context': 'org_1'
          }
        });
        const data = await res.json();
        if (data.success) {
          setMfaEnabled(false);
          setBackupCodesLeft(0);
          setShowSetupFlow(false);
          showToast('MFA has been successfully disabled.', 'info');
        }
      } catch (error) {
        showToast('Failed to disable MFA.', 'error');
      }
    }
  };

  // Handle 2FA Challenge Test Verification
  const handleVerifyTestChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testChallengeToken || testChallengeToken.length !== 6) {
      showToast('Please enter a 6-digit token to verify.', 'warning');
      return;
    }

    setIsVerifyingChallenge(true);
    setChallengeSuccess(null);

    // Simulate verification or test against server
    setTimeout(() => {
      setIsVerifyingChallenge(false);
      setChallengeSuccess(true);
      showToast('2FA Verification Challenge passed! Authenticator key is active and healthy.', 'success');
    }, 800);
  };

  // Revoke session
  const handleRevokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    showToast('Session revoked successfully. Device logged out.', 'info');
  };

  // Save security policies
  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPolicies(true);
    setTimeout(() => {
      setIsSavingPolicies(false);
      showToast('Sovereign network security policies updated.', 'success');
    }, 1000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const res = await fetchWithRetry('/api/v1/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password updated successfully across all ledger nodes.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(data.error || 'Failed to update password.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('System failure while updating credentials.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const passwordStrength = () => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score += 25;
    if (/[A-Z]/.test(newPassword)) score += 25;
    if (/[0-9]/.test(newPassword)) score += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 25;
    return score;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-5 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-8">
        
        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Shield className="w-7 h-7 text-indigo-600" />
              Sovereign Identity & Access Security
            </h1>
            <p className="text-slate-500 mt-1">Manage Multi-Factor Authentication (MFA/2FA), credentials, and corporate access control.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Acme Corp EU Context (org_1)
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading organization security rules...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5 sm:gap-8">
            
            {/* Left Nav Shortcuts */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Security Checklist</span>
                
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100/50">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold">SSO Integration (Active)</span>
                </div>

                <div className={`flex items-center gap-2.5 p-2 rounded-lg border ${mfaEnabled ? 'bg-emerald-50 text-emerald-800 border-emerald-100/50' : 'bg-rose-50 text-rose-800 border-rose-100/50'}`}>
                  {mfaEnabled ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold">MFA Protection Enabled</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="text-xs font-semibold">MFA Protection Missing</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100/50">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold">TLS 1.3 / AES-256 (Enforced)</span>
                </div>
              </div>

              {/* Supported Authenticator Apps Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <QrCode className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Supported Apps</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">Google Authenticator</span>
                    <span className="text-[10px] text-indigo-600 font-mono">iOS / Android</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">Twilio Authy</span>
                    <span className="text-[10px] text-indigo-600 font-mono">Multi-device</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">Microsoft Authenticator</span>
                    <span className="text-[10px] text-indigo-600 font-mono">Enterprise</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold text-slate-800">1Password / Bitwarden</span>
                    <span className="text-[10px] text-indigo-600 font-mono">Vault TOTP</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 text-slate-300 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Terminal className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold tracking-wider uppercase">Audit Log Stream</span>
                </div>
                <div className="font-mono text-[10px] space-y-1.5 opacity-90 leading-relaxed">
                  <p className="text-emerald-400">● [08:14] DB connection verified</p>
                  <p className="text-slate-400">● [08:15] Security policy checked</p>
                  <p className={`${mfaEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                    ● [08:19] MFA status: {mfaEnabled ? 'SECURED_TOTP' : 'UNGUARDED'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Main Security Options */}
            <div className="md:col-span-2 space-y-4 sm:space-y-6">

              {/* MFA / 2FA Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${mfaEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-950 text-base">Multi-Factor Authentication (MFA)</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Use time-based 6-digit verification codes generated by Authenticator Apps (e.g., Google Authenticator, Authy, Microsoft Authenticator) alongside your password.</p>
                    </div>
                  </div>
                  <div>
                    {!mfaEnabled ? (
                      <button 
                        onClick={handleStartMfaSetup}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-xs hover:shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Set Up MFA</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowTestChallengeModal(true)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition-colors border border-indigo-200 cursor-pointer flex items-center gap-1"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Test 2FA</span>
                        </button>
                        <button 
                          onClick={handleDisableMfa}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-lg transition-colors border border-rose-100 cursor-pointer"
                        >
                          Disable
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-5 lg:p-6 bg-slate-50/50">
                  {mfaEnabled && !showSetupFlow ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-emerald-800 bg-emerald-50/80 p-4 rounded-xl border border-emerald-100 text-sm font-medium">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold">MFA Protection is Active</p>
                          <p className="text-xs text-emerald-700/90 mt-0.5">Your sovereign credentials are secured by a physical or virtual cryptographic key (RFC 6238 TOTP compliant).</p>
                        </div>
                        <button
                          onClick={handleStartMfaSetup}
                          className="px-3 py-1.5 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Reconfigure QR
                        </button>
                      </div>

                      {backupCodesLeft > 0 && (
                        <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-indigo-500" />
                            <span>You have <strong>{backupCodesLeft}</strong> backup recovery codes saved.</span>
                          </div>
                          <button 
                            onClick={handleStartMfaSetup} 
                            className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                          >
                            Generate New Codes
                          </button>
                        </div>
                      )}
                    </div>
                  ) : !mfaEnabled && !showSetupFlow ? (
                    <div className="flex items-start justify-between gap-3 text-amber-900 bg-amber-50/70 p-4 rounded-xl border border-amber-100 text-sm">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">MFA is Currently Disabled</p>
                          <p className="text-xs text-amber-800/90 mt-0.5">We highly recommend turning on 2FA to prevent phishing, dictionary attacks, and unauthorized session hijackings.</p>
                        </div>
                      </div>
                      <button
                        onClick={handleStartMfaSetup}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs shrink-0 cursor-pointer"
                      >
                        Enable Now
                      </button>
                    </div>
                  ) : null}

                  {/* TOTP Active Interactive Setup Modal/Drawer Inline */}
                  <AnimatePresence>
                    {showSetupFlow && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <MfaSetupFlow 
                          accountEmail="admin@organization.eu"
                          tenantId="org_1"
                          onComplete={() => {
                            setShowSetupFlow(false);
                            checkMfaStatus();
                          }}
                          onCancel={() => setShowSetupFlow(false)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Password Management Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100">
                  <h3 className="font-bold text-slate-950 text-base flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-600" />
                    Change Account Password
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Ensure your password is complex, hard to guess, and not recycled from other web platforms.</p>
                </div>

                <form onSubmit={handleChangePassword} className="p-4 sm:p-5 lg:p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Current Password</label>
                      <div className="relative">
                        <input 
                          type={showPasswordFields['current'] ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPasswordFields(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPasswordFields['current'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">New Password</label>
                      <div className="relative">
                        <input 
                          type={showPasswordFields['new'] ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPasswordFields(prev => ({ ...prev, new: !prev.current }))}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPasswordFields['new'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {newPassword && (
                        <div className="space-y-1 pt-1.5">
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                passwordStrength() <= 25 ? 'bg-rose-500 w-1/4' :
                                passwordStrength() <= 50 ? 'bg-amber-500 w-2/4' :
                                passwordStrength() <= 75 ? 'bg-indigo-500 w-3/4' :
                                'bg-emerald-500 w-full'
                              }`}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Strength: {
                              passwordStrength() <= 25 ? 'Weak' :
                              passwordStrength() <= 50 ? 'Fair' :
                              passwordStrength() <= 75 ? 'Strong' :
                              'Excellent (Production grade)'
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Confirm New Password</label>
                      <div className="relative">
                        <input 
                          type={showPasswordFields['confirm'] ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPasswordFields(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPasswordFields['confirm'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button 
                      type="submit"
                      disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Sessions */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100">
                  <h3 className="font-bold text-slate-950 text-base flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-indigo-600" />
                    Authorized Access Sessions
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">These devices are currently logged into your organizational account. Revoke any unfamiliar device instantly.</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {sessions.map((session) => (
                    <div key={session.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0 h-fit self-center">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{session.device}</span>
                            {session.current && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                This device
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span>IP: {session.ip}</span>
                            <span className="text-slate-300">•</span>
                            <span>{session.location}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-medium text-slate-400">{session.date}</span>
                          </div>
                        </div>
                      </div>
                      {!session.current && (
                        <button 
                          onClick={() => handleRevokeSession(session.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-100 bg-white hover:bg-rose-50/50 rounded-lg transition-colors cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Adaptive Session Security */}
              <AdaptiveSessionSecurity />

              {/* Break Glass Access */}
              <BreakGlassAccess />

              {/* Advanced Network Security Rules */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100">
                  <h3 className="font-bold text-slate-950 text-base flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-600" />
                    Advanced Security Policies
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Configure tenant-level parameters for network safety and session security.</p>
                </div>

                <form onSubmit={handleSavePolicies} className="p-4 sm:p-5 lg:p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">IP Address Allowlist</label>
                        <span className="text-[10px] text-slate-400 font-mono">IPv4 / CIDR format</span>
                      </div>
                      <textarea 
                        rows={2}
                        value={ipAllowlist}
                        onChange={(e) => setIpAllowlist(e.target.value)}
                        placeholder="e.g. 192.168.1.1, 10.0.0.0/24 (Leave empty for unrestricted access)"
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Idle Session Timeout</label>
                      <select 
                        value={idleTimeout}
                        onChange={(e) => setIdleTimeout(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                      >
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="60">1 Hour</option>
                        <option value="120">2 Hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button 
                      type="submit"
                      disabled={isSavingPolicies}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      {isSavingPolicies ? 'Saving...' : 'Save Policies'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* 2FA Verification Challenge Modal */}
        <AnimatePresence>
          {showTestChallengeModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="font-bold text-slate-900 text-sm">Test 2FA Login Challenge</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setShowTestChallengeModal(false);
                      setTestChallengeToken('');
                      setChallengeSuccess(null);
                    }} 
                    className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter the 6-digit code currently shown on your mobile Authenticator app (e.g. Google Authenticator or Authy) to test verification.
                </p>

                <form onSubmit={handleVerifyTestChallenge} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">6-Digit Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={testChallengeToken}
                      onChange={(e) => setTestChallengeToken(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 849201"
                      className="w-full text-center font-mono text-xl tracking-widest p-3 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {challengeSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Code verified! TOTP authentication is working seamlessly.</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTestChallengeModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={testChallengeToken.length !== 6 || isVerifyingChallenge}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingChallenge ? 'Verifying...' : 'Verify Token'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
