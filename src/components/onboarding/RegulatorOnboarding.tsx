import React from 'react';
import { Scale } from 'lucide-react';

interface RegulatorOnboardingProps {
  profile: any;
  setProfile: (p: any) => void;
}

export const RegulatorOnboarding: React.FC<RegulatorOnboardingProps> = ({ profile, setProfile }) => {
  return (
    <div className="space-y-4 md:col-span-2">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supervisory Agency Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Supervising Authority Name</label>
          <input 
            type="text" 
            value={profile.companyName}
            onChange={(e) => setProfile({...profile, companyName: e.target.value})}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            placeholder="e.g. European Data Protection Board (EDPB)"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Oversight Jurisdiction</label>
          <select 
            value={profile.industry}
            onChange={(e) => setProfile({...profile, industry: e.target.value})}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Select Region...</option>
            <option value="Pan-European">Pan-European Oversight (EDPB)</option>
            <option value="Germany">Germany (EEA-DE - BaFin/BfDI)</option>
            <option value="France">France (EEA-FR - CNIL)</option>
            <option value="Ireland">Ireland (EEA-IE - DPC)</option>
            <option value="Netherlands">Netherlands (EEA-NL - AP)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Supervising Legislative Domain</label>
          <select 
            value={profile.employees}
            onChange={(e) => setProfile({...profile, employees: e.target.value})}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Select Domain...</option>
            <option value="Data Protection (GDPR)">Data Protection (GDPR)</option>
            <option value="Operational Resilience (DORA)">Operational Resilience (DORA)</option>
            <option value="Artificial Intelligence (AI Act)">Artificial Intelligence (AI Act)</option>
            <option value="Financial Markets & AML">Financial Markets & AML</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Official Registry ID / Authority Token</label>
          <input 
            type="text" 
            value={profile.revenue}
            onChange={(e) => setProfile({...profile, revenue: e.target.value})}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            placeholder="e.g. REG-EU-1049"
          />
        </div>
      </div>
    </div>
  );
};
