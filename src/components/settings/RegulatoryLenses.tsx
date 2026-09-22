import React from 'react';
import { useRegulatory, RiskAppetite, RegulatoryLens } from '../../context/RegulatoryContext';
import { Sliders, Shield, Scale, Briefcase, Code, Landmark, Sparkles } from 'lucide-react';
import { AIPilotSetting } from './AIPilotSetting';

export const RegulatoryLenses: React.FC = () => {
  const { riskAppetite, setRiskAppetite, lens, setLens, aiAutonomyThreshold, setAiAutonomyThreshold } = useRegulatory();

  const appetiteConfigs = [
    { id: 'conservative', label: 'Conservative', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', desc: 'Prioritize maximum compliance safety. Automated overrides on minimal drift.' },
    { id: 'balanced', label: 'Balanced', icon: Scale, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', desc: 'Standard industry tolerance. Automated alerts with human-in-the-loop validation.' },
    { id: 'aggressive', label: 'Aggressive', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', desc: 'Business-first agility. Minimal blocking controls, maximum focus on speed and telemetry.' },
  ];

  const lensConfigs = [
    { id: 'legal', label: 'Legal Counsel', icon: Landmark, desc: 'View by clause-level obligations' },
    { id: 'technical', label: 'Engineer', icon: Code, desc: 'View as technical control requirements' },
    { id: 'executive', label: 'Executive', icon: Briefcase, desc: 'View as business risk exposure ($)' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Organizational Risk & Role Lens</h2>
          <p className="text-slate-500 text-xs mt-1">Define your global risk tolerance and how information is presented across the platform.</p>
        </div>
        <AIPilotSetting 
          settingKey="Global Risk Appetite" 
          settingValue={riskAppetite} 
          context="Global setting determining the strictness of compliance enforcement across the entire 9Xen Regulettee tenant." 
        />
      </div>

      {/* Risk Appetite Dial */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Sliders className="w-3 h-3" />
          Regulatory Risk Appetite
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {appetiteConfigs.map((cfg) => {
            const isActive = riskAppetite === cfg.id;
            return (
              <button
                key={cfg.id}
                onClick={() => setRiskAppetite(cfg.id as RiskAppetite)}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  isActive 
                    ? `${cfg.bg} ${cfg.border} ring-2 ring-indigo-500/20 shadow-lg` 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-xl w-fit mb-4 ${isActive ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                  <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <h4 className="text-sm font-black text-slate-900">{cfg.label}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-2 font-medium">{cfg.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Role-Based Regulatory Lenses */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Scale className="w-3 h-3" />
            Active Regulatory Lens
          </label>
          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2">
            {lensConfigs.map((cfg) => {
              const isActive = lens === cfg.id;
              return (
                <button
                  key={cfg.id}
                  onClick={() => setLens(cfg.id as RegulatoryLens)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <cfg.icon className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-tight">{cfg.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 italic px-2 leading-relaxed">
            Changing this will recalibrate all dashboards, reports, and notification content for your account.
          </p>
        </div>

        {/* AI Autonomy Threshold */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              AI Autonomy Threshold
            </label>
            <AIPilotSetting 
              settingKey="AI Autonomy" 
              settingValue={`${aiAutonomyThreshold}%`} 
              context="The percentage threshold of AI confidence required to take autonomous remediation action without human approval." 
            />
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-800 uppercase">Human Override Required</span>
              <span className="text-[10px] font-black text-indigo-600 uppercase">Autonomous AI</span>
            </div>
            <div className="relative pt-1">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={aiAutonomyThreshold}
                onChange={(e) => setAiAutonomyThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div 
                className="absolute top-0 h-2 bg-indigo-600 rounded-lg pointer-events-none" 
                style={{ width: `${aiAutonomyThreshold}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[14px] font-black font-mono">
              <span className="text-slate-300">0%</span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">{aiAutonomyThreshold}% Authority</span>
              <span className="text-slate-300">100%</span>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
              AI will only execute auto-remediation if confidence level &gt; {aiAutonomyThreshold}%. Otherwise, a manual approval request is dispatched.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
