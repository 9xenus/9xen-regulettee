import React, { useState } from 'react';
import { ShieldCheck, Server, AlertTriangle, FileText } from 'lucide-react';

export const DoraResiliencePlanner: React.FC = () => {
  const [dependencies, setDependencies] = useState([
    { id: 1, name: 'Core Banking API', criticality: 'Critical' },
    { id: 2, name: 'Authentication Service', criticality: 'High' },
  ]);
  const [playbook, setPlaybook] = useState<string | null>(null);

  const generatePlaybook = () => {
    setPlaybook(`### DORA/NIS2 Disaster Recovery Playbook
Dependencies Mapped: ${dependencies.length}
Criticality Assessment:
${dependencies.map(d => `- ${d.name}: ${d.criticality}`).join('\n')}

Action Plan:
1. Initiate failover for Critical systems within 15 minutes.
2. Notify regulators (DORA compliance) within 24 hours.
3. Execute data restoration protocols from secure offline backups.`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-indigo-500" />
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">DORA Resilience Planner</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-500" />
            Infrastructure Map
          </h2>
          <ul className="space-y-3">
            {dependencies.map(dep => (
              <li key={dep.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">{dep.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${dep.criticality === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{dep.criticality}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            Disaster Recovery Playbook
          </h2>
          {!playbook ? (
            <button 
              onClick={generatePlaybook}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Generate Playbook
            </button>
          ) : (
            <pre className="text-xs bg-slate-100 text-slate-800 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {playbook}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
