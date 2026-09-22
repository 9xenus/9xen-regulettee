import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Palette, Image as ImageIcon, Globe, Monitor, Type, Save, CheckCircle2, Upload } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const WhiteLabelSettings: React.FC = () => {
  const { showToast } = useNotification();
  const [isSaving, setIsSaving] = useState(false);

  const [config, setConfig] = useState({
    brandName: '9Xen Regulettee Sovereign',
    primaryColor: '#6366f1',
    portalUrl: 'compliance.acme-legal.com',
    customDomain: true,
    logoUrl: '',
    faviconUrl: '',
    fontFamily: 'Inter',
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('White-label branding profiles deployed to CDN edge.', 'success');
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl shrink-0">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-950 text-base">White-Label & Reseller Branding</h3>
            <p className="text-sm text-slate-500 mt-0.5">Customize the platform identity for your subsidiaries or resold client instances.</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <span className="animate-spin text-[10px]">●</span> : <Save className="w-4 h-4" />}
          {isSaving ? 'Deploying...' : 'Deploy Branding'}
        </button>
      </div>

      <div className="p-4 sm:p-5 lg:p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Brand Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Brand Identity Name</label>
            <input 
              type="text"
              value={config.brandName}
              onChange={(e) => setConfig({...config, brandName: e.target.value})}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-violet-500 outline-none bg-slate-50/50"
            />
          </div>

          {/* Primary Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Primary Theme Color</label>
            <div className="flex gap-2">
              <input 
                type="color"
                value={config.primaryColor}
                onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                className="w-10 h-9 p-0 border-0 rounded-lg cursor-pointer overflow-hidden"
              />
              <input 
                type="text"
                value={config.primaryColor}
                onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-violet-500 outline-none bg-slate-50/50 font-mono"
              />
            </div>
          </div>

          {/* Custom Domain */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Vanity Domain / URL</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text"
                  value={config.portalUrl}
                  onChange={(e) => setConfig({...config, portalUrl: e.target.value})}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-violet-500 outline-none bg-slate-50/50 font-mono"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">SSL Active</span>
              </div>
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Typography Profile</label>
            <select 
              value={config.fontFamily}
              onChange={(e) => setConfig({...config, fontFamily: e.target.value})}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-violet-500 outline-none bg-slate-50/50"
            >
              <option value="Inter">Inter (Default SaaS)</option>
              <option value="Geist">Geist (Modern Tech)</option>
              <option value="Playfair">Playfair Display (Premium Legal)</option>
              <option value="Roboto">Roboto (Enterprise)</option>
            </select>
          </div>

          {/* Assets Upload */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-violet-300 transition-colors cursor-pointer group">
              <div className="flex flex-col items-center justify-center text-center py-4">
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 mt-3">Upload Portal Logo</p>
                <p className="text-[10px] text-slate-400 mt-1">SVG, PNG or WEBP (Max 2MB)</p>
              </div>
            </div>
            
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-violet-300 transition-colors cursor-pointer group">
              <div className="flex flex-col items-center justify-center text-center py-4">
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 mt-3">Upload Favicon</p>
                <p className="text-[10px] text-slate-400 mt-1">ICO or PNG (32x32px)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reseller Preview Callout */}
        <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl flex gap-3 items-start">
          <Palette className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
          <div className="text-xs text-violet-800 leading-relaxed">
            <p className="font-bold mb-1">Reseller Mode Active</p>
            You are currently configuring branding for <strong>Tier-2 Partners</strong>. These settings will propagate to all client instances under the partner's management cluster.
          </div>
        </div>
      </div>
    </div>
  );
};
