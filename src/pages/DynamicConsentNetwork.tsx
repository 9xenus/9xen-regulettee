import React, { useState } from "react";
import { useNotification } from '../context/NotificationContext';
import { Users, UserCheck, ShieldAlert, Monitor, Activity, CheckCircle2, Save, ChevronRight, History, RotateCcw, Trash2 } from "lucide-react";

export function DynamicConsentNetwork() {
  const { showToast } = useNotification();
  const [jurisdiction, setJurisdiction] = useState('FR');
  const [detectedRegion, setDetectedRegion] = useState<{ code: string, name: string, regulation: string } | null>(null);
  const [snapshots, setSnapshots] = useState<{ id: string, timestamp: string, config: any, jurisdiction: string }[]>([]);
  const [configs, setConfigs] = useState<Record<string, { 
    bannerText: string, 
    preferences: { necessary: boolean, preferences: boolean, statistics: boolean, marketing: boolean },
    behavior: 'Strict' | 'Opt-in' | 'Opt-out'
  }>>({
    FR: {
      bannerText: "To comply with French Digital Republic Act, we verify age or obtain consent.",
      preferences: { necessary: true, preferences: false, statistics: true, marketing: false },
      behavior: 'Strict'
    },
    UK: {
      bannerText: "We use cookies to personalize content and provide social media features.",
      preferences: { necessary: true, preferences: false, statistics: false, marketing: false },
      behavior: 'Opt-in'
    },
    BR: {
      bannerText: "Em conformidade com a LGPD, solicitamos seu consentimento para o processamento de dados.",
      preferences: { necessary: true, preferences: true, statistics: true, marketing: false },
      behavior: 'Opt-in'
    },
    'US-CA': {
      bannerText: "California residents have certain rights regarding their personal information under CCPA.",
      preferences: { necessary: true, preferences: true, statistics: true, marketing: true },
      behavior: 'Opt-out'
    }
  });
  const [showDetails, setShowDetails] = useState(false);
  const [isLivePreview, setIsLivePreview] = useState(false);

  const currentConfig = configs[jurisdiction];

  const updateConfig = (key: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [jurisdiction]: { ...prev[jurisdiction], [key]: value }
    }));
  };

  const handleSave = () => {
    showToast(`Configuration saved for ${jurisdiction}: Behavior set to ${currentConfig.behavior}`, 'success');
  };

  const createSnapshot = () => {
    const newSnapshot = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString(),
      config: JSON.parse(JSON.stringify(currentConfig)),
      jurisdiction
    };
    setSnapshots([newSnapshot, ...snapshots]);
  };

  const revertToSnapshot = (snapshot: any) => {
    setConfigs(prev => ({
      ...prev,
      [snapshot.jurisdiction]: JSON.parse(JSON.stringify(snapshot.config))
    }));
    setJurisdiction(snapshot.jurisdiction);
  };

  const deleteSnapshot = (id: string) => {
    setSnapshots(snapshots.filter(s => s.id !== id));
  };

  const simulateDetection = () => {
    const regions = [
      { code: 'FR', name: 'France', regulation: 'GDPR' },
      { code: 'BR', name: 'Brazil', regulation: 'LGPD' },
      { code: 'US-CA', name: 'United States (California)', regulation: 'CCPA' },
      { code: 'UK', name: 'United Kingdom', regulation: 'UK-GDPR' }
    ];
    const randomRegion = regions[Math.floor(Math.random() * regions.length)];
    setDetectedRegion(randomRegion);
  };

  const applyDetectedConfig = () => {
    if (detectedRegion) {
      setJurisdiction(detectedRegion.code);
      setDetectedRegion(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-indigo-600" />
            Dynamic Cookie Consent Generator
          </h1>
          <p className="text-slate-500 mt-1">Advanced consent flows tailored by jurisdiction.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={simulateDetection}
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" /> Detect IP Geolocation
          </button>
          <button 
            onClick={() => setIsLivePreview(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Monitor className="w-4 h-4" /> Simulate Visitor View
          </button>
          <button 
            onClick={createSnapshot}
            className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <History className="w-4 h-4" /> Create Snapshot
          </button>
          <button 
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-500" /> Version Control & Snapshots
        </h3>
        {detectedRegion && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-full">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">IP Geolocation Detected: {detectedRegion.name}</p>
                <p className="text-xs text-emerald-700">Recommended regulation: <strong>{detectedRegion.regulation}</strong>. Apply template?</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDetectedRegion(null)} className="px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 rounded-md">Dismiss</button>
              <button onClick={applyDetectedConfig} className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-md">Apply Template</button>
            </div>
          </div>
        )}
        {snapshots.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No snapshots saved yet. Create one to enable version recovery.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {snapshots.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {s.jurisdiction}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{s.config.behavior} Policy Snapshot</p>
                    <p className="text-xs text-slate-500">{s.timestamp}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => revertToSnapshot(s)}
                    className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded-md transition-colors"
                    title="Revert to this version"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteSnapshot(s.id)}
                    className="p-1.5 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                    title="Delete snapshot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Consent Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Jurisdiction</label>
              <select 
                value={jurisdiction} 
                onChange={(e) => setJurisdiction(e.target.value)}
                className="mt-1 block w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="FR">France (GDPR)</option>
                <option value="UK">United Kingdom (UK-GDPR)</option>
                <option value="BR">Brazil (LGPD)</option>
                <option value="US-CA">California (CCPA)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Consent Behavior</label>
              <select 
                value={currentConfig.behavior} 
                onChange={(e) => updateConfig('behavior', e.target.value)}
                className="mt-1 block w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="Strict">Strict</option>
                <option value="Opt-in">Opt-in</option>
                <option value="Opt-out">Opt-out</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Banner Text</label>
              <textarea 
                value={currentConfig.bannerText}
                onChange={(e) => updateConfig('bannerText', e.target.value)}
                className="mt-1 block w-full p-2 border border-slate-300 rounded-md"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Enabled Categories</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(currentConfig.preferences).map(([key, value]) => (
                  <label key={key} className={`flex items-center gap-2 p-2 rounded-md ${key === 'necessary' ? 'bg-slate-100' : 'bg-slate-50'}`}>
                    <input 
                      type="checkbox" 
                      checked={value} 
                      disabled={key === 'necessary'}
                      onChange={() => {
                        const newPrefs = {...currentConfig.preferences, [key]: !currentConfig.preferences[key as keyof typeof currentConfig.preferences]};
                        updateConfig('preferences', newPrefs);
                      }}
                    />
                    <span className="capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-slate-500" /> Preview ({currentConfig.behavior})
          </h3>
          <div className="border border-slate-200 rounded-lg p-4 bg-white text-sm text-slate-800 shadow-sm">
            <h4 className="font-bold mb-2">This website uses cookies</h4>
            <p className="text-slate-600 mb-4">{currentConfig.bannerText}</p>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {Object.entries(currentConfig.preferences).map(([key, value]) => (
                <div key={key} className="text-center p-2 border rounded">
                  <div className="font-bold text-xs capitalize">{key}</div>
                  <div className={`mt-1 h-6 w-10 rounded-full mx-auto ${value ? 'bg-emerald-600' : 'bg-slate-300'} flex items-center justify-center`}>
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end text-sm text-indigo-700 mb-4 cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
              Show details <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button className="border border-slate-300 py-2 rounded">Use necessary</button>
              <button className="border border-slate-300 py-2 rounded">Allow selected</button>
              <button className="bg-emerald-800 text-white py-2 rounded">Allow all</button>
            </div>
          </div>
        </div>
      </div>
      {isLivePreview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-5 lg:p-6 max-w-lg w-full">
            <h4 className="font-bold text-lg mb-2">This website uses cookies</h4>
            <p className="text-slate-600 mb-6">{currentConfig.bannerText}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsLivePreview(false)} className="px-4 py-2 text-slate-600">Close</button>
              <button className="bg-emerald-800 text-white px-4 py-2 rounded">Accept</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
