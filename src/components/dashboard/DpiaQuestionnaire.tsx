import React, { useState } from 'react';
import { FileText, CheckCircle2, ChevronRight, ChevronLeft, ShieldAlert, Sparkles, X } from 'lucide-react';

export interface DpiaAssessment {
  id: string;
  name: string;
  projectName?: string;
  type: 'DPIA' | 'PIA';
  status: 'Draft' | 'Completed' | 'In Review';
  risk: 'Low' | 'Medium' | 'High';
  overallRisk?: 'Low' | 'Medium' | 'High';
  date: string;
  dpo: string;
  dpoName?: string;
  desc: string;
  description?: string;
}

interface DpiaQuestionnaireProps {
  onAddAssessment: (assessment: DpiaAssessment) => void;
  onClose: () => void;
}

export const DpiaQuestionnaire: React.FC<DpiaQuestionnaireProps> = ({ onAddAssessment, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: 'DPIA' as 'DPIA' | 'PIA',
    dpo: 'Sarah Jenkins, Esq.',
    desc: '',
    highRiskProcessing: false,
    aiProfilingUsed: false,
    biometricsInvolved: false,
    crossBorderTransfer: false,
  });

  const calculateRisk = () => {
    let score = 0;
    if (formData.highRiskProcessing) score += 2;
    if (formData.aiProfilingUsed) score += 3;
    if (formData.biometricsInvolved) score += 3;
    if (formData.crossBorderTransfer) score += 2;

    if (score >= 5) return 'High';
    if (score >= 2) return 'Medium';
    return 'Low';
  };

  const handleFinish = () => {
    const risk = calculateRisk();
    const newAssessment: DpiaAssessment = {
      id: `${formData.type}-${Math.floor(10 + Math.random() * 90)}`,
      name: formData.name || 'New Compliance Processing Assessment',
      projectName: formData.name || 'New Compliance Processing Assessment',
      type: formData.type,
      status: 'In Review',
      risk,
      overallRisk: risk,
      date: new Date().toISOString().split('T')[0],
      dpo: formData.dpo,
      dpoName: formData.dpo,
      desc: formData.desc || 'System processing impact assessment evaluated for GDPR Article 35 compliance.',
      description: formData.desc || 'System processing impact assessment evaluated for GDPR Article 35 compliance.'
    };

    onAddAssessment(newAssessment);
    onClose();
  };

  return (
    <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">GDPR Art. 35 DPIA / PIA Wizard</h3>
            <p className="text-xs text-slate-500">Step {step} of 2: Assessment Scope & High-Risk Triggers</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {step === 1 && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Assessment Name / System Title</label>
            <input
              type="text"
              placeholder="e.g., Customer Loyalty ML Scoring Engine"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Assessment Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="DPIA">DPIA (Data Protection Impact Assessment)</option>
                <option value="PIA">PIA (Privacy Impact Assessment)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Assigned Lead DPO / Counsel</label>
              <input
                type="text"
                value={formData.dpo}
                onChange={e => setFormData({ ...formData, dpo: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Description of Processing Operation</label>
            <textarea
              rows={3}
              placeholder="Detail data flows, categories of data subjects, sub-processors, and purpose..."
              value={formData.desc}
              onChange={e => setFormData({ ...formData, desc: e.target.value })}
              className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              disabled={!formData.name}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              Next: High Risk Triggers <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200">GDPR Article 35 High-Risk Processing Checklist:</p>

          <div className="space-y-2">
            <label className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aiProfilingUsed}
                onChange={e => setFormData({ ...formData, aiProfilingUsed: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">System involves Automated Profiling or AI-based Decision Making</span>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.biometricsInvolved}
                onChange={e => setFormData({ ...formData, biometricsInvolved: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Processes Special Category Data (Biometrics, Health, Genetics, Religion)</span>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.crossBorderTransfer}
                onChange={e => setFormData({ ...formData, crossBorderTransfer: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Involves Cross-Border Data Transfer outside EU/EEA Adequacy Zones</span>
            </label>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DpiaQuestionnaire;
