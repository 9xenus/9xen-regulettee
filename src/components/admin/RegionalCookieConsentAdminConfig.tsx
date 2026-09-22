import React, { useState } from 'react';
import { Sliders, Cookie, ShieldCheck, Check, Save } from 'lucide-react';

export const RegionalCookieConsentAdminConfig: React.FC = () => {
  const [config, setConfig] = useState({
    euDefaultOptIn: true,
    autoBlockThirdPartyCookies: true,
    consentExpirationDays: 365,
    showCookieBannerGlobally: true,
    enableDoNotTrackHeader: true,
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
      <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
          <Cookie className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Regional ePrivacy & Cookie Consent Engine</h3>
          <p className="text-xs text-slate-500">Configure global banner behavior, ePrivacy directive compliance & auto-blocking</p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
          <div>
            <div className="font-bold text-slate-900 dark:text-white">Strict EU Prior Explicit Consent (Opt-In)</div>
            <div className="text-[11px] text-slate-500">Require affirmative click before dropping analytics or tracking cookies</div>
          </div>
          <input
            type="checkbox"
            checked={config.euDefaultOptIn}
            onChange={e => setConfig({ ...config, euDefaultOptIn: e.target.checked })}
            className="w-4 h-4 rounded text-indigo-600"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
          <div>
            <div className="font-bold text-slate-900 dark:text-white">Auto-Block Unregistered 3rd-Party Scripts</div>
            <div className="text-[11px] text-slate-500">Automatically intercept inline ad/tracker JS tags until user consents</div>
          </div>
          <input
            type="checkbox"
            checked={config.autoBlockThirdPartyCookies}
            onChange={e => setConfig({ ...config, autoBlockThirdPartyCookies: e.target.checked })}
            className="w-4 h-4 rounded text-indigo-600"
          />
        </div>
      </div>
    </div>
  );
};

export default RegionalCookieConsentAdminConfig;
