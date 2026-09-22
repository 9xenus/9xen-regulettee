import React, { useState } from "react";
import { Cookie, ShieldCheck, Check, X } from "lucide-react";

export const CookiePreferencesManager: React.FC<any> = (props) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
      <h4 className="text-xs font-bold text-white mb-2">Cookie Preferences & ePrivacy Settings</h4>
      <p className="text-xs text-slate-400">Manage zero-tracking ePrivacy session consent preferences.</p>
    </div>
  );
};

export const CookieConsent: React.FC<any> = ({ className = "" }) => {
  const [accepted, setAccepted] = useState(false);

  if (accepted) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-2xl bg-slate-900/95 border border-slate-800 text-slate-200 shadow-2xl backdrop-blur-md ${className}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">Sovereign Zero-Tracking Notice</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
            This platform uses strictly functional, zero-PII session tokens protected by GDPR ePrivacy directive.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setAccepted(true)}
          className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20"
        >
          Accept Functional Only
        </button>
        <button
          onClick={() => setAccepted(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
