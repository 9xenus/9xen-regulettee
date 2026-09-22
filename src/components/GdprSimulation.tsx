import React, { useState } from 'react';
import { AlertTriangle, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

interface BreachScenario {
  id: string;
  title: string;
  description: string;
  remediationSteps: string[];
}

const SCENARIOS: BreachScenario[] = [
  {
    id: 'unauth-access',
    title: 'Unauthorized Access to Customer Data',
    description: 'A third party gained access to the customer database.',
    remediationSteps: [
      'Isolate affected systems immediately.',
      'Notify the Supervisory Authority (DPA) within 72 hours.',
      'Assess risk to affected data subjects.',
      'Notify affected data subjects if high risk.',
      'Document the breach and actions taken.'
    ]
  },
  {
    id: 'data-loss',
    title: 'Accidental Data Loss (Backup Corruption)',
    description: 'Customer data backups were corrupted and unrecoverable.',
    remediationSteps: [
      'Attempt data recovery from secondary backups.',
      'Assess the impact on data availability.',
      'Notify the DPA if it results in a high risk to rights and freedoms.',
      'Review and improve backup redundancy protocols.',
      'Update the Data Protection Impact Assessment (DPIA).'
    ]
  },
  {
    id: 'wrong-processing',
    title: 'Incorrect Data Processing',
    description: 'Data was processed without a valid legal basis.',
    remediationSteps: [
      'Cease processing activities immediately.',
      'Identify and rectify the error in processing logic.',
      'Analyze the extent of data affected.',
      'Notify the DPA if necessary based on severity.',
      'Update the Record of Processing Activities (ROPA).'
    ]
  }
];

export const GdprSimulation: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<BreachScenario | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const triggerSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <AlertTriangle className="w-6 h-6 text-rose-600" />
        <h2 className="text-xl font-black text-slate-900">GDPR Breach Simulation</h2>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700">Select Breach Scenario:</label>
        <select 
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          onChange={(e) => setSelectedScenario(SCENARIOS.find(s => s.id === e.target.value) || null)}
        >
          <option value="">Select a scenario...</option>
          {SCENARIOS.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </div>

      {selectedScenario && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">{selectedScenario.description}</p>
          <button 
            onClick={triggerSimulation}
            disabled={isSimulating}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl shadow-xs transition-colors"
          >
            {isSimulating ? 'Simulating Breach...' : 'Trigger Simulation'}
          </button>
        </div>
      )}

      {!isSimulating && selectedScenario && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900">Remediation Workflow:</h3>
          <ul className="space-y-3">
            {selectedScenario.remediationSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-slate-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
