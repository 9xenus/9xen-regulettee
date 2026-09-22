import React, { useState, useEffect } from 'react';
import { 
  GitBranch, ShieldAlert, Play, CheckCircle2, Clock, ArrowRight, 
  Settings, Plus, Trash2, RefreshCw, Download, Layers, AlertCircle, 
  Lock, Zap, Check, FileText, ChevronRight, Sliders, Bell
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'motion/react';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'TRIGGER' | 'NOTIFICATION' | 'GRACE_PERIOD' | 'REVIEW' | 'PENALTY' | 'RESOLVED';
  regulation: 'GDPR' | 'CCPA' | 'BOTH';
  timeoutHours: number;
  autoExecute: boolean;
  actionPayload: string;
  condition: string;
}

const DEFAULT_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'step-1',
    name: 'Violation Detection & Telemetry',
    type: 'TRIGGER',
    regulation: 'BOTH',
    timeoutHours: 0,
    autoExecute: true,
    actionPayload: 'Capture payload hash & assign jurisdiction severity (Score > 75 = Critical)',
    condition: 'Always execute on telemetry alert'
  },
  {
    id: 'step-2',
    name: 'Automated Notice of Infringement (NoI)',
    type: 'NOTIFICATION',
    regulation: 'GDPR',
    timeoutHours: 24,
    autoExecute: true,
    actionPayload: 'Dispatch eIDAS signed encrypted notice to DPO inbox and webhook endpoint',
    condition: 'Severity == CRITICAL || HIGH'
  },
  {
    id: 'step-3',
    name: 'Statutory Remediation Grace Period',
    type: 'GRACE_PERIOD',
    regulation: 'GDPR',
    timeoutHours: 720, // 30 days
    autoExecute: false,
    actionPayload: 'Monitor entity compliance telemetry for data purge / tokenization fix',
    condition: 'Entity requests remediation window'
  },
  {
    id: 'step-4',
    name: 'Supervisory Committee Escalation Review',
    type: 'REVIEW',
    regulation: 'BOTH',
    timeoutHours: 48,
    autoExecute: false,
    actionPayload: 'Convening DPA panel review for formal sanction vote',
    condition: 'Grace period expired without remediation'
  },
  {
    id: 'step-5',
    name: 'Statutory Fine Issuance & Enforcement',
    type: 'PENALTY',
    regulation: 'BOTH',
    timeoutHours: 0,
    autoExecute: true,
    actionPayload: 'Issue binding administrative fine up to 4% global annual turnover (Art. 83)',
    condition: 'Unanimous panel approval or appeal deadline elapsed'
  }
];

export const EnforcementWorkflowBuilder: React.FC = () => {
  const { showToast } = useNotification();
  const [steps, setSteps] = useState<WorkflowStep[]>(() => {
    const saved = localStorage.getItem('9xen-regulettee_enforcement_workflow_steps');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_WORKFLOW_STEPS;
  });

  const [activeRegulationFilter, setActiveRegulationFilter] = useState<'ALL' | 'GDPR' | 'CCPA'>('ALL');
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [simulationStepIndex, setSimulationStepIndex] = useState<number>(-1);

  // New step modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const [newStepType, setNewStepType] = useState<WorkflowStep['type']>('NOTIFICATION');
  const [newStepRegulation, setNewStepRegulation] = useState<WorkflowStep['regulation']>('GDPR');
  const [newStepTimeout, setNewStepTimeout] = useState(24);
  const [newStepAuto, setNewStepAuto] = useState(true);
  const [newStepPayload, setNewStepPayload] = useState('');
  const [newStepCondition, setNewStepCondition] = useState('');

  useEffect(() => {
    localStorage.setItem('9xen-regulettee_enforcement_workflow_steps', JSON.stringify(steps));
  }, [steps]);

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepName) {
      showToast('Please provide a step name.', 'error');
      return;
    }

    const created: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: newStepName,
      type: newStepType,
      regulation: newStepRegulation,
      timeoutHours: Number(newStepTimeout) || 24,
      autoExecute: newStepAuto,
      actionPayload: newStepPayload || 'Standard automated escalation action',
      condition: newStepCondition || 'Default execution trigger'
    };

    setSteps([...steps, created]);
    setShowAddModal(false);
    setNewStepName('');
    setNewStepPayload('');
    setNewStepCondition('');
    showToast(`State machine step '${created.name}' successfully added to enforcement workflow.`, 'success');
  };

  const handleDeleteStep = (id: string) => {
    if (steps.length <= 1) {
      showToast('Workflow must contain at least one state step.', 'warning');
      return;
    }
    setSteps(steps.filter(s => s.id !== id));
    showToast('Enforcement workflow step removed.', 'info');
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationLog(['[00:00:00] SIMULATION STARTED: Simulated GDPR Art. 32 / CCPA Data Breach Alert']);
    setSimulationStepIndex(0);

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < steps.length) {
        setSimulationStepIndex(idx);
        setSimulationLog(prev => [
          ...prev,
          `[00:00:${idx * 15}] ENTERING STATE: ${steps[idx].name} (${steps[idx].regulation}) — Action: ${steps[idx].actionPayload}`
        ]);
      } else {
        clearInterval(interval);
        setSimulationLog(prev => [...prev, '[00:01:15] WORKFLOW COMPLETE: Enforcement state machine executed successfully with zero protocol breaches.']);
        setIsSimulating(false);
        showToast('Enforcement state machine simulation completed successfully.', 'success');
      }
    }, 1200);
  };

  const filteredSteps = steps.filter(s => activeRegulationFilter === 'ALL' || s.regulation === activeRegulationFilter || s.regulation === 'BOTH');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl shadow-xl text-white border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" /> State-Machine Engine
              </span>
              <span className="text-xs text-indigo-200/70 font-mono">GDPR & CCPA Automated Escalation</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Automated Enforcement Workflow Builder</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Design, simulate, and deploy deterministic state-machine escalation paths for regulatory violations. Automatically transition from detection to notice, grace periods, and binding fine imposition.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 border border-indigo-500 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Workflow Step
            </button>
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isSimulating ? 'Running Simulation...' : 'Simulate Workflow'}
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-900/50">
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-indigo-900/40">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Configured States</span>
            <span className="text-xl font-black text-white mt-1 block">{steps.length} Nodes</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-indigo-900/40">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Frameworks</span>
            <span className="text-xl font-black text-indigo-400 mt-1 block">GDPR & CCPA</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-indigo-900/40">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Auto-Execution</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              {steps.filter(s => s.autoExecute).length} / {steps.length} Steps
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-indigo-900/40">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">State Machine Status</span>
            <span className="text-xl font-black text-cyan-400 mt-1 block">Deterministic & Active</span>
          </div>
        </div>
      </div>

      {/* Filter and Regulation Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Regulation Filter:</span>
          {(['ALL', 'GDPR', 'CCPA'] as const).map(reg => (
            <button
              key={reg}
              onClick={() => setActiveRegulationFilter(reg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeRegulationFilter === reg
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {reg === 'ALL' ? 'All Regulations' : reg}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredSteps.length}</span> enforcement state nodes
        </div>
      </div>

      {/* Visual State Machine Pipeline / Flow */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Escalation State Pipeline</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Sequential state machine transitions triggered upon verified compliance breach detection.</p>
          </div>
          <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
            State Machine v2.4
          </span>
        </div>

        <div className="relative pt-4 pb-2 overflow-x-auto">
          <div className="flex items-center space-x-4 min-w-max pb-4">
            {filteredSteps.map((step, idx) => {
              const isCurrentSim = isSimulating && simulationStepIndex === idx;
              return (
                <div key={step.id} className="flex items-center space-x-4">
                  <div 
                    onClick={() => setSelectedStep(step)}
                    className={`w-72 p-4 rounded-xl border transition-all cursor-pointer relative group ${
                      isCurrentSim 
                        ? 'bg-indigo-50 border-indigo-500 shadow-lg ring-2 ring-indigo-400' 
                        : 'bg-slate-50/80 hover:bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        step.regulation === 'GDPR' ? 'bg-blue-100 text-blue-800' :
                        step.regulation === 'CCPA' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {step.regulation}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Step 0{idx + 1}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {step.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                      {step.actionPayload}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] font-medium text-slate-600">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" /> {step.timeoutHours}h timeout
                      </span>
                      <span className={`font-bold ${step.autoExecute ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {step.autoExecute ? '⚡ Auto' : '👤 Manual Review'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStep(step.id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded transition-all"
                      title="Delete Step"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {idx < filteredSteps.length - 1 && (
                    <div className="flex flex-col items-center text-slate-300">
                      <ArrowRight className="w-5 h-5 text-indigo-400 animate-pulse" />
                      <span className="text-[9px] font-mono text-slate-400 mt-0.5">trigger</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Simulation Console */}
        {isSimulating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1.5 max-h-48 overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              <span>State Machine Execution Telemetry</span>
              <span className="flex items-center gap-1.5 text-emerald-400 animate-pulse">● LIVE RUNNING</span>
            </div>
            {simulationLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Detailed Steps Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Enforcement Workflow Step Configurations</span>
          </h3>
          <span className="text-xs text-slate-500">Click any step to inspect or modify rules</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Step Name & Type</th>
                <th className="px-6 py-3">Regulation</th>
                <th className="px-6 py-3">Execution Mode</th>
                <th className="px-6 py-3">Timeout / Grace Period</th>
                <th className="px-6 py-3">Trigger Condition</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSteps.map((step) => (
                <tr key={step.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-900">{step.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{step.actionPayload}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      step.regulation === 'GDPR' ? 'bg-blue-100 text-blue-800' :
                      step.regulation === 'CCPA' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {step.regulation}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      step.autoExecute ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {step.autoExecute ? 'Automated Action' : 'Manual Committee'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">
                    {step.timeoutHours} hours
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">
                    {step.condition}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedStep(step)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded transition-colors"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => handleDeleteStep(step.id)}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT / EDIT MODAL */}
      {selectedStep && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">State Inspector</span>
                <h3 className="text-base font-extrabold">{selectedStep.name}</h3>
              </div>
              <button onClick={() => setSelectedStep(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Step Name</label>
                <input
                  type="text"
                  value={selectedStep.name}
                  onChange={(e) => setSelectedStep({ ...selectedStep, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Regulation Framework</label>
                  <select
                    value={selectedStep.regulation}
                    onChange={(e) => setSelectedStep({ ...selectedStep, regulation: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="GDPR">GDPR (EU)</option>
                    <option value="CCPA">CCPA (California)</option>
                    <option value="BOTH">Both Frameworks</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Timeout (Hours)</label>
                  <input
                    type="number"
                    value={selectedStep.timeoutHours}
                    onChange={(e) => setSelectedStep({ ...selectedStep, timeoutHours: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Action Payload & Execution Detail</label>
                <textarea
                  rows={3}
                  value={selectedStep.actionPayload}
                  onChange={(e) => setSelectedStep({ ...selectedStep, actionPayload: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trigger Condition</label>
                <input
                  type="text"
                  value={selectedStep.condition}
                  onChange={(e) => setSelectedStep({ ...selectedStep, condition: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="auto-exec-check"
                  checked={selectedStep.autoExecute}
                  onChange={(e) => setSelectedStep({ ...selectedStep, autoExecute: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="auto-exec-check" className="font-bold text-slate-800">
                  Enable Fully Automated State Transition (Without Manual DPA Sign-off)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedStep(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSteps(steps.map(s => s.id === selectedStep.id ? selectedStep : s));
                    setSelectedStep(null);
                    showToast('Workflow step updated successfully.', 'success');
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ADD STEP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="text-base font-bold">Add Enforcement State Step</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddStep} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Step Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Asset Seizure / Domain Restriction"
                  value={newStepName}
                  onChange={(e) => setNewStepName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Framework</label>
                  <select
                    value={newStepRegulation}
                    onChange={(e) => setNewStepRegulation(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="GDPR">GDPR</option>
                    <option value="CCPA">CCPA</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Timeout (Hours)</label>
                  <input
                    type="number"
                    value={newStepTimeout}
                    onChange={(e) => setNewStepTimeout(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Action Payload</label>
                <input
                  type="text"
                  placeholder="e.g. Dispatch encrypted warning via API webhook"
                  value={newStepPayload}
                  onChange={(e) => setNewStepPayload(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trigger Condition</label>
                <input
                  type="text"
                  placeholder="e.g. Severity == CRITICAL"
                  value={newStepCondition}
                  onChange={(e) => setNewStepCondition(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="new-auto-exec"
                  checked={newStepAuto}
                  onChange={(e) => setNewStepAuto(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <label htmlFor="new-auto-exec" className="font-bold text-slate-800">
                  Fully Automated Execution
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow"
                >
                  Create Step Node
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
