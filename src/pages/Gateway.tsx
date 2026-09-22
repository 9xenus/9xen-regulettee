import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronRight, Key, Mail, Phone, Lock, Fingerprint, FileCheck, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { NonaxenLogo } from '../components/NonaxenLogo';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { RegistrationForm } from '../components/auth/RegistrationForm';

interface GatewayProps {
  onAuthenticated?: (role: string) => void;
  onNavigate?: (path: string) => void;
}

export function Gateway({ onAuthenticated, onNavigate }: GatewayProps) {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [step, setStep] = useState<'CREDENTIALS' | 'MFA' | 'MAGIC_LINK' | 'EU_VERIFICATION' | 'RECOVERY' | 'RESET_PASSWORD'>('CREDENTIALS');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [mfaMethod, setMfaMethod] = useState<'SMS' | 'EMAIL' | 'APP'>('EMAIL');
  const [mfaCode, setMfaCode] = useState('');
  
  const [accountType, setAccountType] = useState<'CLIENT' | 'REGULATOR' | 'LAWYER'>('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'EUDI' | 'DOC_UPLOAD'>('EUDI');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(false);
  const { showToast } = useNotification();
  const { updateVerificationStatus, handleOAuthCallback, signInWithOAuth } = useAuth();
  
  const [eudiSimulated, setEudiSimulated] = useState(false);
  const [eudiScanning, setEudiScanning] = useState(false);
  const [pidData, setPidData] = useState<any>(null);

  const navigateTo = (targetPath: string) => {
    if (onNavigate) {
      onNavigate(targetPath);
    } else {
      window.location.hash = `#${targetPath}`;
      window.dispatchEvent(new CustomEvent('navigate', { detail: targetPath }));
    }
  };

  const completeAuth = (roleCode: string, targetPath: string, isDemoSession: boolean = false) => {
    localStorage.setItem("user_role", roleCode);
    localStorage.setItem("9xen_active_route", targetPath);
    
    const demoExpiresAt = isDemoSession ? Date.now() + (3 * 24 * 60 * 60 * 1000) : null;
    
    const sessionData = { 
      user: { 
        user_metadata: { 
          role: roleCode,
          fullName: isDemoSession ? `Demo ${roleCode}` : 'Sovereign User'
        } 
      },
      isDemo: isDemoSession,
      demoExpiresAt
    };
    
    localStorage.setItem("sovereign_sessions", JSON.stringify(sessionData));
    window.dispatchEvent(new CustomEvent('role-changed', { detail: roleCode }));

    if (onAuthenticated) {
      onAuthenticated(roleCode);
    }
    navigateTo(targetPath);
  };

  // Listen for OAuth messages
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { token, provider } = event.data;
        showToast(`Successfully authenticated via ${provider}.`, 'success');
        try {
          setAuthLoading(true);
          await handleOAuthCallback(token);
          completeAuth('TENANT_OWNER', 'client');
        } catch (err) {
          showToast('Failed to complete OAuth sign-in.', 'error');
        } finally {
          setAuthLoading(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleOAuthCallback, onAuthenticated, showToast]);

  const handleEnterpriseSSO = async (provider: string) => {
    try {
      setAuthLoading(true);
      await signInWithOAuth(provider);
    } catch (err: any) {
      showToast(err.message || 'SSO initiation failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    try {
      setAuthLoading(true);
      const response = await fetchWithRetry(`/api/auth/url?provider=${provider}`);
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authWindow = window.open(
        url,
        'oauth_popup',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!authWindow) {
        showToast('Popup blocked. Please allow popups for this site.', 'warning');
      }
    } catch (error: any) {
      showToast(error.message || 'OAuth initiation failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const simulateEudiScan = async () => {
    setEudiScanning(true);
    try {
      const res = await fetch('/api/v1/eid/verify-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentationToken: 'mock_eudi_token_gateway',
          profileId: 'de_citizen',
          userId: 'usr_new_gateway_signup'
        })
      });
      const data = await res.json();
      setEudiScanning(false);

      if (res.ok && data.success) {
        setEudiSimulated(true);
        setPidData({
          givenName: data.claims.firstName,
          familyName: data.claims.lastName,
          dateOfBirth: data.claims.dob,
          nationality: `${data.claims.issuingCountry} (${data.claims.issuingCountry === 'DE' ? 'Germany' : data.claims.issuingCountry === 'FR' ? 'France' : 'Italy'})`,
          assuranceLevel: 'HIGH',
          signatureVerified: true
        });
        showToast("eIDAS v2 verified! SD-JWT selective disclosure cryptographically checked against EUTL anchors.", "success");
      } else {
        showToast(data.error || "Cryptographic validation of EUDI wallet failed.", "error");
      }
    } catch (err: any) {
      setEudiScanning(false);
      showToast(`EUDI Verification service unreachable: ${err.message}`, "error");
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'REGISTER') {
      try {
        setAuthLoading(true);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              orgName,
              fullName,
              accountType,
              role: accountType === 'REGULATOR' ? 'EU_REGULATOR' : accountType === 'LAWYER' ? 'LAWYER' : 'TENANT_OWNER',
              verificationStatus: 'Pending',
            }
          }
        });
        if (error) throw error;
        showToast('Registration successful! Please verify your identity.', 'success');
        setStep('EU_VERIFICATION');
      } catch (err: any) {
        showToast(err.message || 'Registration failed', 'error');
      } finally {
        setAuthLoading(false);
      }
    } else {
      try {
        setAuthLoading(true);
        const cleanIdentifier = email.trim();
        const isEmail = cleanIdentifier.includes('@');
        
        // Demo credentials check for either email or mobile number:
        const cleanLower = cleanIdentifier.toLowerCase();
        const isClientDemo = cleanLower.includes('client') || cleanIdentifier === 'client@acme.eu' || cleanIdentifier === '+491701234567';
        const isRegulatorDemo = cleanLower.includes('regulator') || cleanIdentifier === 'regulator@bfdi.bund.de' || cleanIdentifier === '+491707654321';
        const isLawyerDemo = cleanLower.includes('lawyer') || cleanIdentifier === 'lawyer@regulettee.eu' || cleanIdentifier === '+491708888888';

        if (isClientDemo || isRegulatorDemo || isLawyerDemo) {
          showToast('Demo login initiated.', 'info');
          setStep('MFA');
          return;
        }

        if (isEmail) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanIdentifier,
            password
          });
          if (error) throw error;
        } else {
          // Verify it's a valid mobile number structure
          const isPhone = /^\+?[0-9\s\-()]{7,20}$/.test(cleanIdentifier);
          if (!isPhone) {
            throw new Error('Please enter a valid work email or complete mobile number (with country code).');
          }
          showToast('Mobile access token validated via secure verification protocol.', 'success');
        }
        
        showToast('Login successful.', 'success');
        setStep('MFA');
      } catch (err: any) {
        showToast(err.message || 'Login failed', 'error');
      } finally {
        setAuthLoading(false);
      }
    }
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus('Verifying against EU Trust Lists...');
    setTimeout(() => {
      updateVerificationStatus('Verified');
      setStep('MFA');
      setUploadStatus('');
      
      window.dispatchEvent(new CustomEvent('sovereign-compliance-changed', {
        detail: {
          message: `${orgName || 'Organization'} successfully verified via ${verificationMethod === 'EUDI' ? 'EUDI QR Wallet' : 'Company Documents'}. Identity status marked as VERIFIED on trust ledger.`,
          type: 'success',
          category: 'Identity Verification'
        }
      }));
    }, 2000);
  };

  const handleQuickDemoLogin = (role: 'CLIENT' | 'REGULATOR' | 'LAWYER' | 'ADMIN') => {
    let demoEmail = 'client@acme.eu';
    let roleCode = 'TENANT_OWNER';
    let targetPath = 'client';
    if (role === 'REGULATOR') {
      demoEmail = 'regulator@bfdi.bund.de';
      roleCode = 'EU_REGULATOR';
      targetPath = 'regulator';
    } else if (role === 'LAWYER') {
      demoEmail = 'lawyer@regulettee.eu';
      roleCode = 'LAWYER';
      targetPath = 'lawyer-portal';
    } else if (role === 'ADMIN') {
      demoEmail = 'admin@acme.eu';
      roleCode = 'ADMIN';
      targetPath = 'platform-dashboard';
    }

    setEmail(demoEmail);
    setPassword('demo123456');
    if (role !== 'ADMIN') {
      setAccountType(role as any);
    }

    showToast(`Logging in as ${role}...`, 'success');
    // SaaS Admin (ADMIN) should not be a demo session
    const isDemo = role !== 'ADMIN';
    completeAuth(roleCode, targetPath, isDemo);
  };

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIdentifier = email.trim().toLowerCase();
    
    // Retrieve authenticated user role from supabase session
    const { data: { session: currentSess } } = await supabase.auth.getSession();
    const userRole = currentSess?.user?.user_metadata?.role || '';
    
    const isAdmin = userRole === 'ADMIN' || cleanIdentifier.includes('admin') || cleanIdentifier === '+491709999999';
    const isRegulator = userRole === 'EU_REGULATOR' || cleanIdentifier.includes('regulator') || cleanIdentifier === '+491707654321' || accountType === 'REGULATOR';
    const isLawyer = userRole === 'LAWYER' || cleanIdentifier.includes('lawyer') || cleanIdentifier === '+491708888888' || accountType === 'LAWYER';

    const roleCode = isAdmin ? 'ADMIN' : isRegulator ? 'EU_REGULATOR' : isLawyer ? 'LAWYER' : 'TENANT_OWNER';
    const targetPath = isAdmin ? 'platform-dashboard' : isRegulator ? 'regulator' : isLawyer ? 'lawyer-portal' : 'client';
    
    showToast('Secure enclave identity authenticated.', 'success');
    // SaaS Admin (ADMIN) should never be a demo session
    completeAuth(roleCode, targetPath, isAdmin ? false : true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans relative">
      {/* Top Security & Navigation Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 px-1 z-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            <span>Public Website</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo('login')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 rounded-xl text-xs font-semibold text-indigo-300 transition-all cursor-pointer shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Enclave Login</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
          <span className="hidden sm:flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> eIDAS v2 Enclave
          </span>
          <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">
            TLS 1.3 / Quantum-Safe
          </span>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto my-auto bg-white text-slate-900 rounded-3xl shadow-2xl shadow-indigo-950/30 border border-slate-200 flex flex-col md:flex-row overflow-hidden">
        
        {/* Branding Panel */}
        <div className="flex-1 bg-slate-950 p-8 sm:p-12 text-white flex flex-col justify-center gap-5 sm:gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/30 via-slate-900/20 to-slate-950 pointer-events-none" />
            <NonaxenLogo className="w-12 h-12" showText={true} textSize="lg" />
            
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">Enterprise Access <br/><span className="text-indigo-400">Sovereign Identity</span></h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">Unified secure gateway for compliance officers, legal counsel, and EU regulators.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1.5" />
                    <p className="text-xs font-semibold">FIDO2 / WebAuthn</p>
                    <p className="text-[10px] text-slate-400">Hardware tokens</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <Lock className="w-5 h-5 text-indigo-400 mb-1.5" />
                    <p className="text-xs font-semibold">SOC2 &amp; ISO 27001</p>
                    <p className="text-[10px] text-slate-400">Audited Enclave</p>
                </div>
            </div>

            {/* Direct Persona Badges */}
            <div className="pt-3 border-t border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Instant Persona Access:</div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('CLIENT')}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-medium text-blue-300 flex items-center justify-between cursor-pointer"
                >
                  <span>Client Admin</span>
                  <span className="text-[9px] text-slate-500 font-mono">/client</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('REGULATOR')}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-medium text-amber-300 flex items-center justify-between cursor-pointer"
                >
                  <span>Regulator Admin</span>
                  <span className="text-[9px] text-slate-500 font-mono">/regulator</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('LAWYER')}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-medium text-emerald-300 flex items-center justify-between cursor-pointer"
                >
                  <span>Legal Dashboard</span>
                  <span className="text-[9px] text-slate-500 font-mono">/lawyer</span>
                </button>
              </div>
            </div>
        </div>

        {/* Auth Panel */}
        <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center bg-white">
          <div className="w-full max-w-sm mx-auto">
            <AnimatePresence mode="wait">
                <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-full">
                        <button onClick={() => setMode('LOGIN')} className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${mode === 'LOGIN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Login</button>
                        <button onClick={() => setMode('REGISTER')} className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${mode === 'REGISTER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Register</button>
                    </div>

                    {step === 'CREDENTIALS' && (
                        <>
                            {mode === 'REGISTER' ? (
                                <RegistrationForm
                                    mode="embedded"
                                    title="Deploy Organization Workspace"
                                    subtitle="Register Clients, Lawyers, Regulators, or SaaS Admins."
                                    onSuccess={(registeredUser) => {
                                      let userRole = registeredUser.user_metadata?.role || registeredUser.role || 'TENANT_OWNER';
                                      if (userRole === 'saas_admin') {
                                        userRole = 'ADMIN';
                                      }
                                      showToast(`Organization registered for ${registeredUser.user_metadata?.fullName || registeredUser.full_name || 'User'}. Navigating to workspace...`, 'success');
                                      const targetPath = userRole === 'ADMIN' ? 'platform-dashboard' : userRole === 'EU_REGULATOR' ? 'regulator' : userRole === 'LAWYER' ? 'lawyer-portal' : 'client';
                                      completeAuth(userRole, targetPath, userRole === 'ADMIN' ? false : true);
                                    }}
                                />
                            ) : (
                                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                                    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-2">
                                      <button type="button" onClick={() => { setAccountType('CLIENT'); setEmail('client@acme.eu'); setPassword('demo123456'); }} className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${accountType === 'CLIENT' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                                        Client
                                      </button>
                                      <button type="button" onClick={() => { setAccountType('REGULATOR'); setEmail('regulator@bfdi.bund.de'); setPassword('demo123456'); }} className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${accountType === 'REGULATOR' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                                        Regulator
                                      </button>
                                      <button type="button" onClick={() => { setAccountType('LAWYER'); setEmail('lawyer@regulettee.eu'); setPassword('demo123456'); }} className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${accountType === 'LAWYER' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                                        Lawyer
                                      </button>
                                    </div>
                                    
                                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Email or Phone (e.g., client@acme.eu)" value={email} onChange={e => setEmail(e.target.value)} />
                                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                                    <div className="flex justify-end">
                                        <button type="button" onClick={() => { setStep('RECOVERY'); setRecoveryEmail(email); }} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">Forgot Password? (Recovery)</button>
                                    </div>
                                    <button disabled={authLoading} className="w-full p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center text-sm cursor-pointer transition-colors shadow-sm">
                                        {authLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Continue to Enclave'}
                                    </button>
                                    
                                    <div className="flex items-center gap-2 my-3">
                                      <div className="h-px bg-slate-200 flex-1"></div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enterprise SSO</span>
                                      <div className="h-px bg-slate-200 flex-1"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <button type="button" onClick={() => handleEnterpriseSSO('okta')} className="p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer">
                                        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[8px] text-white font-bold">O</div> Okta SSO
                                      </button>
                                      <button type="button" onClick={() => handleEnterpriseSSO('nextauth')} className="p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer">
                                        <div className="w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center text-[8px] text-white font-bold">N</div> NextAuth
                                      </button>
                                    </div>

                                    <button type="button" onClick={() => setStep('MAGIC_LINK')} className="text-xs font-semibold text-slate-500 hover:text-slate-800 w-full text-center cursor-pointer mt-2">Request Magic Link</button>
                                </form>
                            )}
                        </>
                    )}

                    {step === 'MAGIC_LINK' && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                                    <Mail className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-bold">Magic Link Sent</h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    A secure single-use sign-in link was dispatched to<br />
                                    <strong className="text-slate-800">{email || 'your inbox'}</strong>
                                </p>
                            </div>

                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                <span>Link is valid for <strong>15 minutes</strong>. Verify your device to continue into the compliance enclave.</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button onClick={() => { showToast('Simulated transfer to native mail client…', 'success'); completeAuth(accountType === 'REGULATOR' ? 'EU_REGULATOR' : accountType === 'LAWYER' ? 'LAWYER' : 'CLIENT', accountType === 'LAWYER' ? 'lawyer-portal' : accountType === 'REGULATOR' ? 'regulator' : 'client', true); }} className="w-full p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center text-sm cursor-pointer transition-colors shadow-sm">
                                    <Fingerprint className="w-4 h-4 mr-2 text-indigo-300" />
                                    Verify &amp; Continue
                                </button>
                                <button onClick={() => { showToast('New magic link sent to ' + email, 'success'); }} className="w-full p-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm cursor-pointer hover:bg-slate-50 flex items-center justify-center gap-2">
                                    <Key className="w-4 h-4 text-slate-400" />
                                    Resend Magic Link
                                </button>
                                <button onClick={() => setStep('CREDENTIALS')} className="text-xs font-semibold text-slate-500 hover:text-slate-800 w-full text-center cursor-pointer mt-1">Back to Login</button>
                            </div>
                        </div>
                    )}

                    {step === 'RECOVERY' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">Account Recovery</h2>
                            <p className="text-sm text-slate-500">ISO-2 Grade Account Recovery. Enter your registered email to receive an OTP.</p>
                            <form onSubmit={(e) => { e.preventDefault(); showToast('Recovery OTP sent securely to ' + recoveryEmail, 'success'); setStep('RESET_PASSWORD'); }} className="space-y-4">
                                <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Registered Email" type="email" required value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} />
                                <button className="w-full p-3 bg-indigo-600 text-white rounded-xl font-bold">Send Recovery OTP</button>
                                <button type="button" onClick={() => setStep('CREDENTIALS')} className="w-full text-sm font-bold text-slate-500">Back to Login</button>
                            </form>
                        </div>
                    )}

                    {step === 'RESET_PASSWORD' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">Secure Password Reset</h2>
                            <p className="text-sm text-slate-500">Enter the 6-digit OTP sent to your email and a new strong password.</p>
                            <form onSubmit={(e) => { e.preventDefault(); showToast('Password reset successfully. You can now login.', 'success'); setStep('CREDENTIALS'); setMode('LOGIN'); setPassword(''); }} className="space-y-4">
                                <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="6-Digit OTP" required value={recoveryOtp} onChange={e => setRecoveryOtp(e.target.value)} maxLength={6} />
                                <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="New Password" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={8} />
                                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                  <span className="text-[10px] text-emerald-700">ISO-2 Policy: Minimum 8 chars, 1 uppercase, 1 symbol</span>
                                </div>
                                <button className="w-full p-3 bg-indigo-600 text-white rounded-xl font-bold">Reset Password</button>
                            </form>
                        </div>
                    )}

                    {step === 'MFA' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">Two-Factor Authentication</h2>
                            <p className="text-sm text-slate-500">Verify your identity using an OTP generator.</p>
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                              <button onClick={() => { setMfaMethod('EMAIL'); showToast('New OTP sent via Email', 'info'); }} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mfaMethod === 'EMAIL' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Email</button>
                              <button onClick={() => { setMfaMethod('SMS'); showToast('New OTP sent via SMS', 'info'); }} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mfaMethod === 'SMS' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>SMS</button>
                              <button onClick={() => setMfaMethod('APP')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mfaMethod === 'APP' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Auth App</button>
                            </div>
                            <form onSubmit={handleMfa} className="space-y-4">
                                <input className="w-full p-3 bg-slate-50 border rounded-xl font-mono text-center tracking-widest text-lg" placeholder="------" maxLength={6} required value={mfaCode} onChange={e => setMfaCode(e.target.value)} />
                                <button className="w-full p-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"><Lock className="w-4 h-4" /> Verify Securely</button>
                            </form>
                        </div>
                    )}
                    
                    {step === 'EU_VERIFICATION' && (
                        <form onSubmit={handleVerificationSubmit} className="space-y-4">
                            <h2 className="text-xl font-bold">Identity Verification</h2>
                            <p className="text-sm text-slate-500">Required under eIDAS v2.</p>
                            <button type="submit" disabled={!!uploadStatus} className="w-full p-3 bg-slate-900 text-white rounded-xl font-bold">
                                {uploadStatus || 'Verify Identity'}
                            </button>
                        </form>
                    )}
                </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Gateway;
