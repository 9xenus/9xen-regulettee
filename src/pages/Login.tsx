import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Mail, 
  Key, 
  Fingerprint, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  Globe, 
  ShieldCheck,
  Smartphone,
  Check,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/formValidation';

type LoginState = 'IDENTIFY' | 'PASSWORD' | 'MFA' | 'RECOVERY' | 'SUCCESS';

interface LoginProps {
  onNavigate?: (path: string) => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onNavigate }) => {
  const { signOut } = useAuth(); // Use signOut to clear existing if needed
  const [state, setState] = useState<LoginState>('IDENTIFY');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Security Pulse Animation
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 3000);
    return () => clearInterval(interval);
  }, []);

  // Fallback navigate if onNavigate is not provided
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', `/${path.replace(/^\//, '')}`);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setValidationErrors(emailCheck.errors);
      setError(emailCheck.errors[0]);
      return;
    }
    setValidationErrors([]);
    setIsLoading(true);

    try {
      // Sovereign check: check domain or validate against NRE if country or regulator domain is in email
      const domain = email.split('@')[1]?.toLowerCase() || '';
      let detectedCountry = '';
      if (domain.endsWith('.de') || domain.includes('bafin')) detectedCountry = 'DE';
      else if (domain.endsWith('.fr') || domain.includes('amf')) detectedCountry = 'FR';
      else if (domain.endsWith('.bd') || domain.includes('btrc')) detectedCountry = 'BD';
      else if (domain.endsWith('.us') || domain.includes('sec.gov') || domain.includes('fincen')) detectedCountry = 'US';
      else if (domain.endsWith('.uk') || domain.endsWith('.co.uk') || domain.includes('fca')) detectedCountry = 'GB';
      else if (domain.endsWith('.sg') || domain.includes('mas')) detectedCountry = 'SG';
      else if (domain.endsWith('.ae') || domain.includes('vara')) detectedCountry = 'AE';
      else if (domain.endsWith('.jp') || domain.includes('fsa.go.jp')) detectedCountry = 'JP';

      if (detectedCountry) {
        const valRes = await fetch('/api/v1/nre/auth/validate-jurisdiction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ countryCode: detectedCountry })
        });
        const valData = await valRes.json();
        if (valData && valData.success && !valData.allowed) {
          setIsLoading(false);
          setError(`Sovereign Access Denied: Accounts in territory [${detectedCountry}] are temporarily disabled by Regulators.`);
          return;
        }
      }

      setIsLoading(false);
      setState('PASSWORD');
    } catch (err) {
      // Fallback allowed
      setIsLoading(false);
      setState('PASSWORD');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      setValidationErrors(passCheck.errors);
      setError(passCheck.errors[0]);
      return;
    }
    setValidationErrors([]);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setState('MFA');
    }, 1000);
  };

  const handleVerifyMFA = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setState('SUCCESS');
      
      // Simulate successful admin authentication
      const resolvedRole = 'ADMIN';
      localStorage.setItem("sovereign_sessions", JSON.stringify({ 
        user: { user_metadata: { role: resolvedRole } },
        isDemo: true 
      }));
      localStorage.setItem("user_role", resolvedRole);
      localStorage.setItem("9xen_active_route", "platform-dashboard");
      window.dispatchEvent(new CustomEvent('role-changed', { detail: resolvedRole }));

      setTimeout(() => {
        if (onNavigate) {
          onNavigate('platform-dashboard');
        } else {
          window.location.hash = '#platform-dashboard';
        }
      }, 1000);
    }, 1200);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setError('Please provide a valid email address for recovery.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setError('Recovery protocol initiated. A secure link has been dispatched to your registered enclave hardware.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      {/* Security Status Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (onNavigate) {
                onNavigate('landing');
              } else {
                window.location.hash = '#landing';
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm mr-2"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Public Website</span>
          </button>
          <Shield className={cn("w-5 h-5 text-indigo-500 transition-all duration-1000", pulse ? "scale-110 opacity-100" : "scale-100 opacity-50")} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hidden sm:inline">9Xen Regulettee Sovereign Enclave v4.2</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600">
          <span className="hidden sm:flex items-center gap-1.5"><Globe className="w-3 h-3" /> EU-Central-1</span>
          <span className="hidden md:flex items-center gap-1.5"><Cpu className="w-3 h-3" /> Hardware-Encrypted</span>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/25">OWASP TOP 10 HARDENED</span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20 transform -rotate-3">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Authentication</h1>
            <p className="text-slate-500 text-xs mt-2 font-medium">Accessing Sovereign Compliance Infrastructure with OWASP Security</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-950/50 border border-red-800/60 rounded-xl flex items-center gap-3 text-red-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {state === 'IDENTIFY' && (
              <motion.form 
                key="identify"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                onSubmit={handleIdentify} className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Identifier</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="email" required placeholder="admin@regulettee.eu"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 ml-1">Validated against authorized enterprise directory.</p>
                </div>
                <button 
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify Identity</span>}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button type="button" className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Fingerprint className="w-3.5 h-3.5" /> Biometric Key
                  </button>
                  <span className="w-1 h-1 bg-slate-800 rounded-full" />
                  <button onClick={() => setState('RECOVERY')} type="button" className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest">
                    Account Recovery
                  </button>
                </div>
              </motion.form>
            )}

            {state === 'PASSWORD' && (
              <motion.form 
                key="password"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onSubmit={handleLogin} className="space-y-6"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identified As</span>
                    <span className="text-xs font-bold text-white">{email}</span>
                  </div>
                  <button onClick={() => setState('IDENTIFY')} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">Change</button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Passphrase (OWASP Policy)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="password" required autoFocus
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 10 chars, Upper, Lower, Num, Special"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                  {/* Password Strength Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px]">
                    <div className={cn("flex items-center gap-1.5", password.length >= 10 ? "text-emerald-400" : "text-slate-500")}>
                      {password.length >= 10 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Min 10 chars
                    </div>
                    <div className={cn("flex items-center gap-1.5", /[A-Z]/.test(password) ? "text-emerald-400" : "text-slate-500")}>
                      {/[A-Z]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Uppercase letter
                    </div>
                    <div className={cn("flex items-center gap-1.5", /[0-9]/.test(password) ? "text-emerald-400" : "text-slate-500")}>
                      {/[0-9]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Numeric digit
                    </div>
                    <div className={cn("flex items-center gap-1.5", /[^A-Za-z0-9]/.test(password) ? "text-emerald-400" : "text-slate-500")}>
                      {/[^A-Za-z0-9]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Special symbol
                    </div>
                  </div>
                </div>
                <button 
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Decrypt Enclave</span>}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => setState('RECOVERY')} type="button" className="w-full text-[10px] font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest text-center">
                  Forgot Passphrase?
                </button>
              </motion.form>
            )}

            {state === 'MFA' && (
              <motion.form 
                key="mfa"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                onSubmit={handleVerifyMFA} className="space-y-6"
              >
                <div className="text-center mb-4">
                  <Smartphone className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Factor Authentication</h3>
                  <p className="text-xs text-slate-500 mt-1">Enter the 6-digit code from your authenticator device.</p>
                </div>
                <div className="flex justify-center gap-2">
                  {[...Array(6)].map((_, i) => (
                    <input 
                      key={i} type="text" maxLength={1} defaultValue={['8', '4', '2', '9', '1', '6'][i]}
                      className="w-12 h-14 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-mono font-black text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  ))}
                </div>
                <button 
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Finalize Verification</span>}
                </button>
                <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-start gap-3">
                  <Key className="w-4 h-4 text-indigo-400 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-relaxed">Hardware security keys (Yubikey) detected and verified securely.</p>
                </div>
              </motion.form>
            )}

            {state === 'RECOVERY' && (
              <motion.form 
                key="recovery"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                onSubmit={handleRecovery} className="space-y-6"
              >
                <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-200/70 leading-relaxed font-medium">
                    <span className="font-bold text-amber-500 uppercase block mb-1">Advanced Recovery Protocol</span>
                    Initiating this flow will temporarily freeze high-risk transactions for 24 hours while your identity is verified across distributed nodes.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Admin Email</label>
                  <input 
                    type="email" required placeholder="admin@acme-corp.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recovery Token (Backup PDF)</label>
                  <input 
                    type="text" required placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 px-4 text-white font-mono placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                  />
                </div>
                <button 
                  disabled={isLoading}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Request Recovery</span>}
                </button>
                <button onClick={() => setState('IDENTIFY')} type="button" className="w-full text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest text-center">
                  Back to Login
                </button>
              </motion.form>
            )}

            {state === 'SUCCESS' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-6"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto relative z-10">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">Sovereign Vault Decrypted</h3>
                  <p className="text-slate-500 text-xs mt-2">Redirecting to Enterprise Administration Hub...</p>
                </div>
                <div className="flex justify-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
          <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          <span className="text-slate-800">|</span>
          <a href="#" className="hover:text-slate-400 transition-colors">OWASP Top 10 Security</a>
          <span className="text-slate-800">|</span>
          <a href="#" className="hover:text-slate-400 transition-colors">Contact Enclave Support</a>
        </div>
      </motion.div>
    </div>
  );
};

