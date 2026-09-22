import React, { useState } from 'react';
import { Bell, ShieldAlert, AlertTriangle, Mail, MessageSquare, CheckCircle2, Zap } from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const [alerts, setAlerts] = useState({
    piiLeak: true,
    policyViolation: true,
    legislativeDriftEmail: true,
    legislativeDriftSms: true,
  });

  const [settingsData, setSettingsData] = useState({
    alertEmail: 'admin@compliance.eu',
    alertPhone: '+49 151 23456789',
    driftSeverityThreshold: 'HIGH_OR_CRITICAL',
    syncFrequency: 'HOURLY',
  });

  const [saved, setSaved] = useState(false);

  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3 flex items-center justify-between">
           <span className="flex items-center">
             <Bell className="w-5 h-5 mr-2 text-indigo-500" /> Notification & Legislative Drift Settings
           </span>
           {saved && (
             <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
               <CheckCircle2 className="w-3.5 h-3.5" /> Saved Successfully
             </span>
           )}
        </h2>
        
        <div className="space-y-6">
          {/* Legislative Drift Alert Section */}
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Background Worker Legislative Drift Alerts</h3>
                  <p className="text-xs text-slate-500">Trigger immediate alerts when the BullMQ worker detects new EU legislative amendments or policy drifts.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" /> Recipient Email Address
                </label>
                <input 
                  type="email" 
                  value={settingsData.alertEmail}
                  onChange={e => setSettingsData({ ...settingsData, alertEmail: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-white"
                  placeholder="compliance-alerts@yourcompany.eu"
                />
                <label className="flex items-center justify-between mt-2 cursor-pointer">
                  <span className="text-xs font-medium text-slate-700">Enable Email Alerts</span>
                  <button
                    onClick={() => toggleAlert('legislativeDriftEmail')}
                    className={`w-9 h-5 rounded-full p-1 flex items-center transition-colors ${alerts.legislativeDriftEmail ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${alerts.legislativeDriftEmail ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> Recipient SMS Phone Number
                </label>
                <input 
                  type="text" 
                  value={settingsData.alertPhone}
                  onChange={e => setSettingsData({ ...settingsData, alertPhone: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-white"
                  placeholder="+49 151 00000000"
                />
                <label className="flex items-center justify-between mt-2 cursor-pointer">
                  <span className="text-xs font-medium text-slate-700">Enable SMS Alerts</span>
                  <button
                    onClick={() => toggleAlert('legislativeDriftSms')}
                    className={`w-9 h-5 rounded-full p-1 flex items-center transition-colors ${alerts.legislativeDriftSms ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${alerts.legislativeDriftSms ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-indigo-100/60">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Drift Severity Threshold</label>
                <select 
                  value={settingsData.driftSeverityThreshold}
                  onChange={e => setSettingsData({ ...settingsData, driftSeverityThreshold: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white"
                >
                  <option value="CRITICAL_ONLY">Critical Priority Only (Mandatory Directives)</option>
                  <option value="HIGH_OR_CRITICAL">High & Critical Priority (Recommended)</option>
                  <option value="ALL">All Detected Legislative Changes</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Background Worker Check Frequency</label>
                <select 
                  value={settingsData.syncFrequency}
                  onChange={e => setSettingsData({ ...settingsData, syncFrequency: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white"
                >
                  <option value="REALTIME">Real-time (Webhook / Immediate)</option>
                  <option value="HOURLY">Every Hour (BullMQ Cron)</option>
                  <option value="DAILY">Daily Digest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Other Standard Notification Toggles */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Other System Security Alerts</h3>
            {[
              { key: 'piiLeak', label: 'PII Leak & Data Exfiltration Alerts', icon: ShieldAlert, color: 'text-rose-500' },
              { key: 'policyViolation', label: 'Automated Policy Violation Alerts', icon: AlertTriangle, color: 'text-amber-500' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-white">
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-semibold text-sm text-slate-700">{item.label}</span>
                </div>
                <button
                  onClick={() => toggleAlert(item.key as keyof typeof alerts)}
                  className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors ${alerts[item.key as keyof typeof alerts] ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${alerts[item.key as keyof typeof alerts] ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
            >
              Save Notification Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

