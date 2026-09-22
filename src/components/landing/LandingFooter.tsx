import React, { useState } from 'react';
import { NonaxenLogo } from '../NonaxenLogo';
import { ShieldCheck, FileText, Lock, Cookie, X, Check, Download, Printer, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type LegalModalType = 'PRIVACY' | 'TERMS' | 'COOKIES' | null;

export const LandingFooter: React.FC = () => {
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);
  const [cookieConsent, setCookieConsent] = useState<{
    necessary: boolean;
    analytics: boolean;
    functional: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('9xen_cookie_preferences');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { necessary: true, analytics: false, functional: true };
  });
  const [savedNotice, setSavedNotice] = useState(false);

  const navigateTo = (route: string) => {
    window.location.hash = `#${route}`;
    window.dispatchEvent(new CustomEvent('navigate', { detail: route }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCookiePreferences = () => {
    localStorage.setItem('9xen_cookie_preferences', JSON.stringify(cookieConsent));
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      setActiveModal(null);
    }, 1200);
  };

  return (
    <>
      <footer className="py-16 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <NonaxenLogo className="w-10 h-10 mb-6" showText={true} />
              <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed text-sm">
                The Trust Intelligence Standard for Europe. Unifying privacy governance, security audits, and regulatory compliance.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-6 uppercase text-xs tracking-widest">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <button 
                    onClick={() => navigateTo('privacy-governance')} 
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
                  >
                    Privacy Governance
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('sovereign-cloud')} 
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
                  >
                    Sovereign Cloud
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('ai-act')} 
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
                  >
                    AI Risk Auditing
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('dora')} 
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
                  >
                    DORA Kit
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-6 uppercase text-xs tracking-widest">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <button 
                    onClick={() => navigateTo('platform-dashboard')} 
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
                  >
                    Platform Overview
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('documentation')} 
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
                  >
                    Documentation
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('developer-portal')} 
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
                  >
                    API &amp; Sandbox
                  </button>
                </li>
                <li>
                  <a 
                    href="mailto:compliance@nonaxen.eu?subject=Enterprise%20Inquiry" 
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    Contact Legal &amp; DPO
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} Nonaxen 9Xen Regulettee. All rights reserved. Built with sovereignty in the EU.
            </p>
            <div className="flex gap-5 sm:gap-8 text-xs text-slate-400">
              <button 
                onClick={() => setActiveModal('PRIVACY')} 
                className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => setActiveModal('TERMS')} 
                className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => setActiveModal('COOKIES')} 
                className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cookie Settings
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* STATUTORY LEGAL & COOKIE MODALS */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[85vh] relative"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                    {activeModal === 'PRIVACY' && <ShieldCheck className="w-5 h-5" />}
                    {activeModal === 'TERMS' && <FileText className="w-5 h-5" />}
                    {activeModal === 'COOKIES' && <Cookie className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeModal === 'PRIVACY' && 'Statutory GDPR Privacy Policy'}
                      {activeModal === 'TERMS' && 'Enterprise Terms of Service (SLA & Compliance)'}
                      {activeModal === 'COOKIES' && 'ePrivacy Directive Cookie & Tracker Settings'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeModal === 'PRIVACY' && 'Regulation (EU) 2016/679 (GDPR Art. 13/14) & EU AI Act'}
                      {activeModal === 'TERMS' && 'Statutory B2B Master Subscription Agreement & DPA'}
                      {activeModal === 'COOKIES' && 'Directive 2002/58/EC on Privacy and Electronic Communications'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {activeModal === 'PRIVACY' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-200 font-mono flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero-Knowledge Architecture: All tenant payloads are cryptographically sealed with AES-256-GCM.</span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base">1. Data Controller Identification</h4>
                    <p>
                      The controller responsible for processing under GDPR Article 4(7) is Nonaxen 9Xen Regulettee S.A., with designated Data Protection Officer reachable at <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-xs">dpo@nonaxen.eu</code>.
                    </p>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base">2. Categories of Data Processed</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Identity and Tenant Profile:</strong> Corporate credentials, corporate registration numbers, and statutory DPO contact details.</li>
                      <li><strong>Cryptographic Telemetry:</strong> Zero-trust session tokens, KMS verification logs, and audit ledger integrity proofs.</li>
                      <li><strong>Compliance Artifacts:</strong> User-uploaded DPAs, AI risk assessments, and vendor contracts (strictly envelope-encrypted).</li>
                    </ul>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base">3. Legal Basis for Processing</h4>
                    <p>
                      Processing is conducted strictly under GDPR Article 6(1)(b) (performance of contract) and Article 6(1)(c) (statutory legal obligations under the EU AI Act, DORA, and GDPR). No personal data is commercialized, sold, or shared with third-party ad networks.
                    </p>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base">4. Data Subject Rights</h4>
                    <p>
                      Under GDPR Articles 15-22, data subjects possess the right to access, rectify, port, or erase their personal records at any time through our automated DSR self-service workflow or via direct communication with the supervisory authority (CNIL, BfDI, DPC).
                    </p>
                  </div>
                )}

                {activeModal === 'TERMS' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">1. Scope of Enterprise Service</h4>
                    <p>
                      Nonaxen 9Xen Regulettee provides autonomous regulatory compliance, AI Act risk auditing, DORA ICT resilience scanning, and sovereign cryptographic ledger notarization.
                    </p>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base">2. Service Level Agreement (SLA)</h4>
                    <p>
                      We guarantee 99.9% uptime for core regional API endpoints and cryptographic verification services. Planned maintenance windows are announced with minimum 72 hours advance notice via webhook telemetry.
                    </p>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base">3. Data Processing &amp; Sub-Processors</h4>
                    <p>
                      All client data residency strictly conforms to the tenant's chosen sovereign region (Frankfurt, Paris, Dublin, Stockholm). All regional database shards enforce Row-Level Security (RLS) and isolated encryption keys managed via dedicated KMS envelopes.
                    </p>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base">4. Governing Law &amp; Arbitration</h4>
                    <p>
                      These Terms are governed by European Union law and the national statutes of the Federal Republic of Germany. Disputes are resolved via autonomous legal arbitration under the Nonaxen ALAE protocol or the competent courts of Frankfurt am Main.
                    </p>
                  </div>
                )}

                {activeModal === 'COOKIES' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Under the ePrivacy Directive (Directive 2002/58/EC) and EDPB Guidelines, you have full granular authority over tracker categories.
                    </p>

                    <div className="space-y-3">
                      {/* Strictly Necessary */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">Strictly Necessary &amp; Security Tokens</span>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-bold">
                              Required
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Required for zero-trust enclave authentication, CSRF validation, and tenant isolation. Cannot be disabled.
                          </p>
                        </div>
                        <input type="checkbox" checked disabled className="w-4 h-4 rounded text-emerald-600 cursor-not-allowed" />
                      </div>

                      {/* Analytics */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">Anonymized Performance Telemetry</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Zero-PII synthetic latency measurements used to route regional database shards effectively.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={cookieConsent.analytics}
                          onChange={(e) => setCookieConsent(prev => ({ ...prev, analytics: e.target.checked }))}
                          className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                        />
                      </div>

                      {/* Functional */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">Functional Preferences</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Remembers your selected regulatory jurisdiction, dark mode theme, and active compliance view filters.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={cookieConsent.functional}
                          onChange={(e) => setCookieConsent(prev => ({ ...prev, functional: e.target.checked }))}
                          className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    {savedNotice && (
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-4 h-4" />
                        <span>Preferences saved to persistent local storage.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
                <div className="text-xs text-slate-400 font-mono">
                  Sovereign Legal Standard v2026.1
                </div>
                <div className="flex items-center gap-3">
                  {activeModal === 'COOKIES' ? (
                    <button
                      onClick={handleSaveCookiePreferences}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Save Preferences
                    </button>
                  ) : (
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Document</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:opacity-90 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

