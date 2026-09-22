import React, { useState } from "react";
import { ShieldCheck, X, Save, Sliders, Key, Globe, Cpu, CheckCircle2 } from "lucide-react";

export interface AddonConfigModalProps {
  addon?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: any) => void;
  className?: string;
}

export const AddonConfigModal: React.FC<AddonConfigModalProps> = ({
  addon,
  isOpen,
  onClose,
  onSave,
  className = ""
}) => {
  const [apiKey, setApiKey] = useState(addon?.apiKey || "sk_live_9xen_39485720491823");
  const [endpointUrl, setEndpointUrl] = useState(addon?.endpointUrl || "https://api.caas.eu-sovereign.net/v1/enforce");
  const [strictnessMode, setStrictnessMode] = useState("HIGH_ENFORCE");
  const [autoRemediation, setAutoRemediation] = useState(true);
  const [realtimeAlerts, setRealtimeAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    if (onSave) {
      onSave({
        apiKey,
        endpointUrl,
        strictnessMode,
        autoRemediation,
        realtimeAlerts
      });
    }
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 shadow-2xl overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Configure {addon?.name || "CaaS Add-On"}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                ID: {addon?.id || "custom-addon"} | Act: {addon?.actId || "GLOBAL"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Endpoint URL */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              Sovereign API Endpoint URL
            </label>
            <input
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              placeholder="https://api.caas.domain.com/v1"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Integration Ingress Secret / API Token
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Strictness Mode */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Enforcement Strictness Mode
            </label>
            <select
              value={strictnessMode}
              onChange={(e) => setStrictnessMode(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="MAX_STRICT">Strict Zero-Tolerance (Block on Non-Compliance)</option>
              <option value="HIGH_ENFORCE">High Enforcement (Flag & Auto-Quarantine)</option>
              <option value="AUDIT_ONLY">Audit Mode Only (Log Without Intercepting)</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-medium text-slate-200">Autonomous Auto-Remediation</div>
                  <div className="text-[11px] text-slate-400">Automatically dispatch corrective patches upon policy violation</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoRemediation}
                onChange={(e) => setAutoRemediation(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-medium text-slate-200">Real-Time Webhook Notifications</div>
                  <div className="text-[11px] text-slate-400">Stream audit trail logs to designated SIEM / Slack channels</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={realtimeAlerts}
                onChange={(e) => setRealtimeAlerts(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saved}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 disabled:bg-emerald-600"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Configuration Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddonConfigModal;
